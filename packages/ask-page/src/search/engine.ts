// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/search/engine.ts
// One interface, two engines: the Rust/WebAssembly core (default) and a
// TypeScript twin used only when WebAssembly is blocked (strict CSP).
// ─────────────────────────────────────────────────────────────────────────────

export const MODE_KEYWORD = 0
export const MODE_VECTOR = 1
export const MODE_HYBRID = 2
export type SearchMode = typeof MODE_KEYWORD | typeof MODE_VECTOR | typeof MODE_HYBRID

export interface RawHit {
  doc: number
  fused: number
  bm25: number
  cosine: number
  coverage: number
}

export interface SearchEngine {
  readonly kind: "rust-wasm" | "js"
  reset(): void
  addPassages(texts: string[]): void
  quantize(vectors: Float32Array, dim: number): { q: Int8Array; scales: Float32Array }
  setVectors(q: Int8Array, scales: Float32Array, dim: number): void
  search(question: string, qvec: Float32Array | null, mode: SearchMode, k: number): { hits: RawHit[]; terms: number }
}

/** `wasmBase64`: ASK_CORE_WASM_BASE64 from ./askCoreWasm (empty = use the TypeScript twin). */
export async function createSearchEngine(wasmBase64: string): Promise<SearchEngine> {
  if (wasmBase64 && typeof WebAssembly !== "undefined") {
    try {
      const { createWasmEngine } = await import("./wasm")
      return await createWasmEngine(wasmBase64)
    } catch {
      /* WebAssembly blocked (CSP) or failed: use the TypeScript twin */
    }
  }
  const { JsEngine } = await import("./jsSearch")
  return new JsEngine()
}
