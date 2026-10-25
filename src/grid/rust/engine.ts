// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/rust/engine.ts
//
// Optional Rust engine for the grid's EXISTING search and number/date sort.
// Turn it on with `engine: "rust"` (always) or `engine: "auto"` (from 10,000
// rows). The default, `engine: "ts"`, is unchanged TypeScript.
//
// Rules stay in TypeScript: each grid decides what is empty, what a number or
// a date is, and which text is searched, then hands Rust plain keys and text.
// Whenever a column's values could make the two engines disagree (mixed
// types, text columns, NaN …), the grid uses its TypeScript path instead, so
// results are always identical.
//
// The WebAssembly (about 13 KB) is embedded as base64: no extra file, no
// bundler setup, works in Next.js, React and plain HTML. SSR-safe: nothing
// runs at module load.
// ─────────────────────────────────────────────────────────────────────────────

import { GRID_CORE_WASM_BASE64 } from "./gridCoreWasm"

/** Which engine sorts and searches the grid. */
export type GridEngine = "ts" | "rust" | "auto"

/** `engine: "auto"` switches to Rust from this many rows. */
export const RUST_AUTO_MIN_ROWS = 10_000

/** Joins a row's column values for search. Queries containing it fall back to TypeScript. */
export const SEARCH_SEPARATOR = "\u0000"

export function wantsRustEngine(engine: GridEngine | undefined, rowCount: number): boolean {
  return engine === "rust" || (engine === "auto" && rowCount >= RUST_AUTO_MIN_ROWS)
}

interface GridCoreExports {
  memory: WebAssembly.Memory
  yk_version(): number
  yk_heap_base(): number
  yk_sort(keys: number, n: number, desc: number, out: number): void
  yk_search(
    text: number,
    textLen: number,
    offsets: number,
    rows: number,
    query: number,
    queryLen: number,
    out: number
  ): number
}

const ENGINE_VERSION = 1
const PAGE = 65536

let compiled: WebAssembly.Module | null = null
let loading: Promise<WebAssembly.Module | null> | null = null

function decodeBase64(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }
  const B = (globalThis as { Buffer?: { from(s: string, enc: string): Uint8Array } }).Buffer
  if (B) return new Uint8Array(B.from(b64, "base64"))
  throw new Error("No base64 decoder")
}

/**
 * Compiles the Rust engine once per page. Resolves `null` when WebAssembly is
 * not available; the grid then simply keeps using TypeScript.
 */
export function loadGridCore(): Promise<WebAssembly.Module | null> {
  if (compiled) return Promise.resolve(compiled)
  if (!loading) {
    loading = (async () => {
      try {
        if (typeof WebAssembly === "undefined") return null
        compiled = await WebAssembly.compile(decodeBase64(GRID_CORE_WASM_BASE64) as BufferSource)
        return compiled
      } catch {
        return null
      }
    })()
  }
  return loading
}

/** The compiled engine if `loadGridCore()` has already finished, else null. */
export function getLoadedGridCore(): WebAssembly.Module | null {
  return compiled
}

/** True when the text has no unpaired surrogates (TextEncoder would change those). */
function isWellFormed(s: string): boolean {
  const native = (s as { isWellFormed?: () => boolean }).isWellFormed
  if (typeof native === "function") return native.call(s)
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c >= 0xd800 && c <= 0xdbff) {
      const d = s.charCodeAt(i + 1)
      if (d >= 0xdc00 && d <= 0xdfff) {
        i++
        continue
      }
      return false
    }
    if (c >= 0xdc00 && c <= 0xdfff) return false
  }
  return true
}

const align8 = (n: number) => (n + 7) & ~7

/**
 * One engine per grid. Holds that grid's search text inside the WebAssembly
 * memory, so each keystroke only sends the query.
 */
export class GridCore {
  private readonly x: GridCoreExports
  private readonly base: number
  private readonly encoder = new TextEncoder()
  private offsetsPtr = 0
  private textPtr = 0
  private textLen = 0
  private rows = 0
  private hasIndex = false
  private freePtr: number

  private constructor(x: GridCoreExports) {
    this.x = x
    this.base = align8(x.yk_heap_base())
    this.freePtr = this.base
  }

  /** Creates an engine from a compiled module (default: the one already loaded). */
  static create(mod: WebAssembly.Module | null = compiled): GridCore | null {
    if (!mod) return null
    try {
      const instance = new WebAssembly.Instance(mod, {})
      const x = instance.exports as unknown as GridCoreExports
      if (x.yk_version() !== ENGINE_VERSION) return null
      return new GridCore(x)
    } catch {
      return null
    }
  }

  private ensure(end: number): void {
    const missing = end - this.x.memory.buffer.byteLength
    if (missing > 0) this.x.memory.grow(Math.ceil(missing / PAGE))
  }

  /**
   * Stores one search text per row (the grid joins its columns with
   * SEARCH_SEPARATOR). Returns false when Rust can't match TypeScript
   * exactly for this data; the grid then searches in TypeScript.
   */
  setSearchTexts(texts: string[]): boolean {
    this.hasIndex = false
    this.freePtr = this.base
    try {
      let maxBytes = 0
      for (const t of texts) {
        if (!isWellFormed(t)) return false
        maxBytes += t.length * 3
      }
      const rows = texts.length
      const offsetsPtr = this.base
      const textPtr = align8(offsetsPtr + (rows + 1) * 4)
      this.ensure(textPtr + maxBytes)

      const buffer = this.x.memory.buffer
      const offsets = new Uint32Array(buffer, offsetsPtr, rows + 1)
      const bytes = new Uint8Array(buffer, textPtr, maxBytes)
      let pos = 0
      for (let i = 0; i < rows; i++) {
        offsets[i] = pos
        pos += this.encoder.encodeInto(texts[i], bytes.subarray(pos)).written ?? 0
      }
      offsets[rows] = pos

      this.offsetsPtr = offsetsPtr
      this.textPtr = textPtr
      this.textLen = pos
      this.rows = rows
      this.freePtr = align8(textPtr + pos)
      this.hasIndex = true
      return true
    } catch {
      return false
    }
  }

  /**
   * Positions (in the array given to setSearchTexts) of the rows whose text
   * contains `query`, in original order. Null means "use TypeScript".
   */
  search(query: string): Uint32Array | null {
    if (!this.hasIndex || !query || query.includes(SEARCH_SEPARATOR) || !isWellFormed(query)) return null
    try {
      const q = this.encoder.encode(query)
      const qPtr = this.freePtr
      const outPtr = align8(qPtr + q.length)
      this.ensure(outPtr + this.rows * 4)
      new Uint8Array(this.x.memory.buffer, qPtr, q.length).set(q)
      const n = this.x.yk_search(this.textPtr, this.textLen, this.offsetsPtr, this.rows, qPtr, q.length, outPtr)
      return new Uint32Array(this.x.memory.buffer, outPtr, n).slice()
    } catch {
      return null
    }
  }

  /**
   * Row positions sorted by `keys` (NaN = empty, always last; equal keys keep
   * their order). Null means "use TypeScript".
   */
  sortByKeys(keys: Float64Array, desc: boolean): Uint32Array | null {
    try {
      const n = keys.length
      const keysPtr = this.freePtr
      const outPtr = align8(keysPtr + n * 8)
      this.ensure(outPtr + n * 4)
      new Float64Array(this.x.memory.buffer, keysPtr, n).set(keys)
      this.x.yk_sort(keysPtr, n, desc ? 1 : 0, outPtr)
      return new Uint32Array(this.x.memory.buffer, outPtr, n).slice()
    } catch {
      return null
    }
  }
}

/** "0.9 ms", "12 ms", "<0.1 ms" — for search time labels. */
export function formatSearchTime(ms: number): string {
  if (!(ms >= 0.1)) return "<0.1 ms"
  return `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`
}

/** Picks `rows[i]` for each position, keeping the given order. */
export function pickRows<T>(rows: readonly T[], positions: Uint32Array): T[] {
  const out = new Array<T>(positions.length)
  for (let i = 0; i < positions.length; i++) out[i] = rows[positions[i]]
  return out
}
