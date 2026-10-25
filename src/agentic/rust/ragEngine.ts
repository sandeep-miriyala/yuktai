// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/agentic/rust/ragEngine.ts
//
// Optional Rust engine for the page + data RAG search (createContextIndex,
// used by "Ask page" after askAboutPage). Same passages, same BM25 scores,
// same order as TypeScript — Rust just uses an inverted index instead of
// scanning every word for every question.
//
// TypeScript keeps the rules: it tokenizes the text (Telugu-aware) and
// computes each question word's idf with Math.log. Rust counts and scores.
// About 33 KB of WebAssembly, embedded: works offline, in PWAs, no setup.
// ─────────────────────────────────────────────────────────────────────────────

import { RAG_CORE_WASM_BASE64 } from "./ragCoreWasm"
import { decodeBase64, type GridEngine } from "../../grid/rust/engine"

/** `engine: "auto"` switches the RAG search to Rust from this many passages. */
export const RAG_AUTO_MIN_PASSAGES = 1_000

export function wantsRustRag(engine: GridEngine | undefined, passages: number): boolean {
  return engine === "rust" || (engine === "auto" && passages >= RAG_AUTO_MIN_PASSAGES)
}

interface RagCoreExports {
  memory: WebAssembly.Memory
  yk_rag_version(): number
  yk_rag_reset(): void
  yk_rag_scratch(size: number): number
  yk_rag_build(ptr: number, len: number, docs: number): number
  yk_rag_search(
    terms: number,
    termsLen: number,
    idf: number,
    nTerms: number,
    avgDiv: number,
    k: number,
    outDoc: number,
    outScore: number
  ): number
}

const ENGINE_VERSION = 1

let compiled: WebAssembly.Module | null = null
let loading: Promise<WebAssembly.Module | null> | null = null

/** Compiles the RAG engine once per page; resolves null without WebAssembly. */
export function loadRagCore(): Promise<WebAssembly.Module | null> {
  if (compiled) return Promise.resolve(compiled)
  if (!loading) {
    loading = (async () => {
      try {
        if (typeof WebAssembly === "undefined") return null
        compiled = await WebAssembly.compile(decodeBase64(RAG_CORE_WASM_BASE64) as BufferSource)
        return compiled
      } catch {
        return null
      }
    })()
  }
  return loading
}

export function getLoadedRagCore(): WebAssembly.Module | null {
  return compiled
}

const align8 = (n: number) => (n + 7) & ~7

export interface RagHit {
  /** Passage position, as given to build() */
  doc: number
  score: number
}

/** One index per RagCore (each has its own WebAssembly memory). */
export class RagCore {
  private readonly x: RagCoreExports
  private readonly encoder = new TextEncoder()
  private docs = 0
  private ready = false

  private constructor(x: RagCoreExports) {
    this.x = x
  }

  static create(mod: WebAssembly.Module | null = compiled): RagCore | null {
    if (!mod) return null
    try {
      const x = new WebAssembly.Instance(mod, {}).exports as unknown as RagCoreExports
      if (x.yk_rag_version() !== ENGINE_VERSION) return null
      return new RagCore(x)
    } catch {
      return null
    }
  }

  /**
   * Indexes the passages: one array of tokenize() words per passage.
   * Returns false if Rust could not take it (TypeScript is then used).
   */
  build(docs: string[][]): boolean {
    this.ready = false
    try {
      const bytes = this.encoder.encode(docs.map((words) => words.join(" ")).join("\n"))
      this.x.yk_rag_reset()
      const ptr = this.x.yk_rag_scratch(bytes.length)
      new Uint8Array(this.x.memory.buffer, ptr, bytes.length).set(bytes)
      this.x.yk_rag_build(ptr, bytes.length, docs.length)
      this.docs = docs.length
      this.ready = true
      return true
    } catch {
      return false
    }
  }

  /**
   * Best passages for the question words `terms` (tokenize() output), with
   * `idf[i]` per word and `avgDiv` = average passage length (or 1).
   * Null means "use TypeScript".
   */
  search(terms: string[], idf: number[], avgDiv: number, k: number): RagHit[] | null {
    if (!this.ready || terms.length !== idf.length || terms.some((t) => !t || /[ \n]/.test(t))) return null
    try {
      const kk = Math.max(0, Math.min(k, this.docs))
      const t = this.encoder.encode(terms.join(" "))
      const idfAt = align8(t.length)
      const docAt = idfAt + idf.length * 8
      const scoreAt = align8(docAt + kk * 4)
      const size = scoreAt + kk * 8
      const base = this.x.yk_rag_scratch(size)
      const buffer = this.x.memory.buffer
      new Uint8Array(buffer, base, t.length).set(t)
      new Float64Array(buffer, base + idfAt, idf.length).set(idf)
      const n = this.x.yk_rag_search(base, t.length, base + idfAt, idf.length, avgDiv, kk, base + docAt, base + scoreAt)
      const after = this.x.memory.buffer
      const docs = new Uint32Array(after, base + docAt, n)
      const scores = new Float64Array(after, base + scoreAt, n)
      const out: RagHit[] = []
      for (let i = 0; i < n; i++) out.push({ doc: docs[i], score: scores[i] })
      return out
    } catch {
      return null
    }
  }
}
