// ─────────────────────────────────────────────────────────────────────────────
// Idea 7 — Agentic RAG for the Current Page (+ grid data)
// The existing In-Tab RAG answers from visible page text. This index also
// covers grid rows (including rows on other pages of the grid) and any
// extra documents you add, then answers from the best-matching passages.
// Retrieval is BM25 keyword ranking with Unicode-aware tokens, so Telugu,
// Hindi and English all work offline. Optionally hand the passages to a
// model (Gemini Nano, Transformers.js, your API) through `generate`.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridToolColumn } from "../grid/gridTools"
import { cleanText, queryAll, resolveRoot, type AuditRoot } from "./dom"
import type { GridEngine } from "../grid/rust/engine"
import { getLoadedRagCore, loadRagCore, RagCore, wantsRustRag } from "./rust/ragEngine"

export interface ContextPassage {
  id: string
  source: "page" | "grid" | "custom"
  text: string
  /** Grid row id or page section heading. */
  ref?: string
}

export interface ContextHit extends ContextPassage {
  score: number
}

export interface ContextAnswer {
  answer: string
  hits: ContextHit[]
  /** True when `generate` produced the answer; false for extractive answers. */
  generated: boolean
}

const STOP = new Set(
  "a an the is are was were be to of and or in on at for with what which who whom how why when where does do did this that these those it its from by as about any all please tell me show give".split(" ")
)

/** Unicode-aware tokens: keeps Telugu/Devanagari combining marks together. */
export function tokenize(text: string): string[] {
  return (text.normalize("NFC").toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).filter((t) => t.length > 1 && !STOP.has(t))
}

export function pagePassages(root?: AuditRoot, maxChars = 600): ContextPassage[] {
  const r = resolveRoot(root)
  if (!r) return []
  const out: ContextPassage[] = []
  let heading = ""
  let buffer = ""
  const flush = () => {
    if (buffer.trim()) out.push({ id: `page-${out.length + 1}`, source: "page", text: buffer.trim(), ref: heading || undefined })
    buffer = ""
  }
  for (const el of queryAll(r, "h1,h2,h3,h4,p,li,td,th,dt,dd,blockquote,figcaption,label,summary")) {
    // Skip containers whose text is already covered by a child we visit
    if (el.querySelector("p,li,h1,h2,h3,h4")) continue
    const text = cleanText(el.textContent)
    if (!text) continue
    if (/^H[1-4]$/.test(el.tagName)) {
      flush()
      heading = text
      buffer = `${text}. `
      continue
    }
    if (buffer.length + text.length > maxChars) flush()
    buffer += `${text} `
  }
  flush()
  return out
}

export function gridPassages<T>(data: T[], columns: GridToolColumn[], rowKey = "id"): ContextPassage[] {
  return data.map((row, i) => {
    const r = row as Record<string, unknown>
    const id = String(r[rowKey] ?? i + 1)
    return {
      id: `grid-${id}`,
      source: "grid" as const,
      ref: id,
      text: columns.map((c) => `${c.label}: ${String(r[c.key] ?? "")}`).join(". "),
    }
  })
}

export interface ContextIndexOptions<T = Record<string, unknown>> {
  /** Index the visible page text (default true). */
  includePage?: boolean
  root?: AuditRoot
  rows?: T[]
  columns?: GridToolColumn[]
  rowKey?: string
  /** Extra documents, e.g. FAQ text or help articles. */
  documents?: Array<{ id: string; text: string }>
  /**
   * Search engine: "rust" (default since v5.3.11), "auto" (Rust from 1,000
   * passages) or "ts". Same passages, same scores, same order; Rust is faster
   * on long pages and big grids. Works offline (the engine is embedded) and
   * falls back to TypeScript when WebAssembly is missing or blocked.
   */
  engine?: GridEngine
}

export function createContextIndex<T>(input: ContextIndexOptions<T> = {}) {
  const options: ContextIndexOptions<T> = { ...input, engine: input.engine ?? "rust" }
  let passages: ContextPassage[] = []
  let docs: string[][] = []
  let df = new Map<string, number>()
  let avgLen = 0
  let builtKey: string | null = null

  // Optional Rust engine (null = TypeScript, also while it loads)
  let rust: RagCore | null = null
  let rustDocs: string[][] | null = null
  let rustReady = false
  let rustLoading: Promise<boolean> | null = null

  function ensureRust(): Promise<boolean> {
    if (!wantsRustRag(options.engine, passages.length)) return Promise.resolve(false)
    if (rust) return Promise.resolve(true)
    if (!rustLoading) {
      rustLoading = loadRagCore().then((mod) => {
        rust = mod ? RagCore.create(mod) : null
        return !!rust
      })
    }
    return rustLoading
  }

  function rebuild() {
    const next: ContextPassage[] = [
      ...(options.includePage === false ? [] : pagePassages(options.root)),
      ...(options.rows && options.columns ? gridPassages(options.rows, options.columns, options.rowKey) : []),
      ...(options.documents ?? []).map((d) => ({ id: d.id, source: "custom" as const, text: d.text })),
    ]
    // Same passages as last time (the page didn't change)? Keep the index.
    const key = next.map((p) => `${p.source}\u0001${p.id}\u0001${p.ref ?? ""}\u0001${p.text}`).join("\u0002")
    if (key === builtKey) return
    builtKey = key
    passages = next
    docs = passages.map((p) => tokenize(p.text))
    df = new Map()
    for (const tokens of docs) for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1)
    avgLen = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, docs.length)
  }
  rebuild()
  // Compiled already (another index loaded it)? Use Rust from the first question.
  if (wantsRustRag(options.engine, passages.length) && getLoadedRagCore()) void ensureRust()

  /** Rust search, or null to use TypeScript. Same scores, same order. */
  function rustSearch(q: string[], k: number): ContextHit[] | null {
    if (!rust || !wantsRustRag(options.engine, passages.length)) return null
    if (!Number.isInteger(k) || k <= 0) return null
    if (rustDocs !== docs) {
      rustReady = rust.build(docs)
      rustDocs = docs
    }
    if (!rustReady) return null
    const N = docs.length
    // idf with Math.log here, exactly as the TypeScript loop below computes it
    const idf = q.map((term) => Math.log(1 + (N - (df.get(term) ?? 1) + 0.5) / ((df.get(term) ?? 1) + 0.5)))
    const hits = rust.search(q, idf, avgLen || 1, k)
    return hits ? hits.map((h) => ({ ...passages[h.doc], score: h.score })) : null
  }

  /** BM25 ranking (k1 = 1.2, b = 0.75) with prefix matching for inflected words. */
  function search(question: string, k = 5): ContextHit[] {
    const q = tokenize(question)
    if (!q.length) return []
    const fast = rustSearch(q, k)
    if (fast) return fast
    if (!rust) void ensureRust()
    const N = docs.length
    const scored = docs.map((tokens, i) => {
      let score = 0
      for (const term of q) {
        let tf = 0
        for (const t of tokens) if (t === term || (term.length >= 4 && t.startsWith(term)) || (t.length >= 4 && term.startsWith(t))) tf++
        if (!tf) continue
        const idf = Math.log(1 + (N - (df.get(term) ?? 1) + 0.5) / ((df.get(term) ?? 1) + 0.5))
        score += idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (tokens.length / (avgLen || 1)))))
      }
      return { ...passages[i], score }
    })
    return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k)
  }

  /**
   * Answers from the best passages. Without `generate` the answer is the
   * most relevant sentences, quoted from the page/data — nothing invented.
   */
  async function ask(
    question: string,
    opts: { k?: number; generate?: (question: string, context: string) => Promise<string> } = {}
  ): Promise<ContextAnswer> {
    await ensureRust()
    const hits = search(question, opts.k ?? 4)
    if (!hits.length) return { answer: "I couldn't find anything about that on this page or in the data.", hits, generated: false }
    if (opts.generate) {
      try {
        const context = hits.map((h, i) => `[${i + 1}] ${h.text}`).join("\n")
        const answer = await opts.generate(question, context)
        if (answer?.trim()) return { answer: answer.trim(), hits, generated: true }
      } catch {
        /* fall back to the extractive answer */
      }
    }
    const qTokens = new Set(tokenize(question))
    const sentences = hits
      .flatMap((h) => h.text.split(/(?<=[.!?।])\s+|\.\s+(?=\p{Lu})/u).map((s) => ({ s: s.trim(), h })))
      .map(({ s, h }) => ({ s, h, overlap: tokenize(s).filter((t) => qTokens.has(t)).length }))
      .filter((x) => x.s && x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 3)
    const answer = sentences.length
      ? sentences.map((x) => (x.h.source === "grid" ? `Row ${x.h.ref}: ${x.s}` : x.s)).join("\n")
      : hits[0].text.slice(0, 300)
    return { answer, hits, generated: false }
  }

  return {
    search,
    ask,
    /** Call after the page or data changes. */
    rebuild,
    update(next: Partial<ContextIndexOptions<T>>) {
      Object.assign(options, next)
      rebuild()
    },
    size: () => passages.length,
    /** "rust" when the Rust engine answers searches for this index, else "ts". */
    get engine(): "rust" | "ts" {
      return rust && wantsRustRag(options.engine, passages.length) ? "rust" : "ts"
    },
    /** Resolves "rust" or "ts" once the engine is loaded (or not wanted). */
    whenEngineReady: () => ensureRust().then((ok) => (ok ? "rust" : "ts")),
  }
}
