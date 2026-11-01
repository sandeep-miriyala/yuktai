// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/search/wasm.ts
// Talks to rust/ask-core compiled to WebAssembly. The module arrives as
// base64 (src/search/askCoreWasm.ts, embedded in the bundle), so there is no
// extra file to host and no network request. The caller passes it in, which
// keeps it out of the worker bundle (the worker receives it in a message).
// ─────────────────────────────────────────────────────────────────────────────

import type { RawHit, SearchEngine, SearchMode } from "./engine"

interface Exports {
  memory: WebAssembly.Memory
  ak_version(): number
  ak_reset(): void
  ak_scratch(size: number): number
  ak_add(ptr: number, len: number): number
  ak_docs(): number
  ak_quantize(src: number, n: number, dim: number, out: number, scales: number): void
  ak_set_vectors(vecs: number, scales: number, n: number, dim: number): void
  ak_search(q: number, qLen: number, qvec: number, dim: number, mode: number, k: number, out: number): number
  ak_terms(): number
}

function decode(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const s = atob(b64)
    const out = new Uint8Array(s.length)
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
    return out
  }
  // Node (tests)
  const B = (globalThis as unknown as { Buffer: { from(s: string, e: string): Uint8Array } }).Buffer
  return new Uint8Array(B.from(b64, "base64"))
}

const enc = new TextEncoder()
/** Rebuild the index after this much memory: the bump allocator never shrinks. */
const REBUILD_BYTES = 96 * 1024 * 1024

export async function createWasmEngine(wasmBase64: string): Promise<SearchEngine> {
  const bytes = decode(wasmBase64)
  const { instance } = (await WebAssembly.instantiate(bytes, {})) as unknown as WebAssembly.WebAssemblyInstantiatedSource
  const x = instance.exports as unknown as Exports
  if (x.ak_version() !== 1) throw new Error("ask-core: unexpected version")
  return new WasmEngine(x)
}

class WasmEngine implements SearchEngine {
  readonly kind = "rust-wasm" as const
  private texts: string[] = []
  private vec: { q: Int8Array; scales: Float32Array; dim: number } | null = null

  constructor(private x: Exports) {}

  private u8() {
    return new Uint8Array(this.x.memory.buffer)
  }

  reset(): void {
    this.x.ak_reset()
    this.texts = []
    this.vec = null
  }

  addPassages(texts: string[]): void {
    for (const t of texts) {
      const b = enc.encode(t)
      const ptr = this.x.ak_scratch(b.length)
      this.u8().set(b, ptr)
      this.x.ak_add(ptr, b.length)
      this.texts.push(t)
    }
  }

  quantize(vectors: Float32Array, dim: number) {
    const n = Math.floor(vectors.length / dim)
    const fBytes = n * dim * 4
    const qBytes = n * dim
    const sBytes = n * 4
    const base = this.x.ak_scratch(fBytes + qBytes + sBytes + 16)
    const src = base
    const scales = src + fBytes
    const out = scales + sBytes
    new Float32Array(this.x.memory.buffer, src, n * dim).set(vectors.subarray(0, n * dim))
    this.x.ak_quantize(src, n, dim, out, scales)
    const q = new Int8Array(this.x.memory.buffer, out, n * dim).slice()
    const s = new Float32Array(this.x.memory.buffer, scales, n).slice()
    return { q, scales: s }
  }

  setVectors(q: Int8Array, scales: Float32Array, dim: number): void {
    const n = scales.length
    const base = this.x.ak_scratch(n * 4 + n * dim + 16)
    new Float32Array(this.x.memory.buffer, base, n).set(scales)
    new Int8Array(this.x.memory.buffer, base + n * 4, n * dim).set(q.subarray(0, n * dim))
    this.x.ak_set_vectors(base + n * 4, base, n, dim)
    this.vec = { q, scales, dim }
  }

  search(question: string, qvec: Float32Array | null, mode: SearchMode, k: number): { hits: RawHit[]; terms: number } {
    if (this.x.memory.buffer.byteLength > REBUILD_BYTES) this.rebuild()
    const qb = enc.encode(question)
    const dim = qvec ? qvec.length : 0
    const outBytes = k * 40
    const base = this.x.ak_scratch(outBytes + dim * 4 + qb.length + 16)
    const out = base
    const vptr = out + outBytes
    const qptr = vptr + dim * 4
    if (qvec) new Float32Array(this.x.memory.buffer, vptr, dim).set(qvec)
    this.u8().set(qb, qptr)
    const n = this.x.ak_search(qptr, qb.length, qvec ? vptr : 0, dim, mode, k, out)
    const f = new Float64Array(this.x.memory.buffer, out, n * 5)
    const hits: RawHit[] = []
    for (let i = 0; i < n; i++) {
      hits.push({ doc: f[i * 5], fused: f[i * 5 + 1], bm25: f[i * 5 + 2], cosine: f[i * 5 + 3], coverage: f[i * 5 + 4] })
    }
    return { hits, terms: this.x.ak_terms() }
  }

  private rebuild() {
    const texts = this.texts
    const vec = this.vec
    this.reset()
    this.addPassages(texts)
    if (vec) this.setVectors(vec.q, vec.scales, vec.dim)
  }
}
