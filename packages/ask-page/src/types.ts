// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/types.ts
// The shapes every part of Ask page shares.
// ─────────────────────────────────────────────────────────────────────────────

/** Fast = keywords only, no model. Balanced = keywords + meaning (embeddings).
 *  Best = Balanced + the strongest answer model available. */
export type Mode = "fast" | "balanced" | "best"

/** How an answer is written. */
export type AnswerStyle = "quote" | "short" | "detailed"

export type Lang = "auto" | "en" | "te" | "hi"

export type PageCheck = "accessibility" | "forms" | "images" | "structure"

/** One block of readable text on the page (a paragraph, list item, cell…). */
export interface Block {
  el: Element
  text: string
  /** Nearest heading above this block, e.g. "Installation". */
  heading: string
  kind: "heading" | "text" | "code" | "list" | "cell" | "quote"
}

/** A searchable passage: a few blocks under one heading. */
export interface Passage {
  id: number
  text: string
  /** The heading this passage sits under: shown as the source name. */
  ref: string
  /** Indexes into the page's blocks, for highlighting. */
  blocks: number[]
}

export interface PageSnapshot {
  url: string
  title: string
  lang: string
  blocks: Block[]
  passages: Passage[]
  /** Hash of all passage text: changes when the page changes. */
  hash: string
  /** True on pages that look signed-in or private: nothing is cached. */
  sensitive: boolean
}

export interface Hit {
  passage: Passage
  /** Ranking score (BM25, cosine or RRF sum, depending on mode). */
  score: number
  bm25: number
  cosine: number
  /** Share of the question found in the passage, 0..1, weighted by how rare each word is. */
  coverage: number
}

export interface SearchResult {
  hits: Hit[]
  /** Meaningful words in the question. */
  terms: number
  /** Whether the best hit is good enough to answer from. */
  confident: boolean
  usedVectors: boolean
}

export interface Source {
  ref: string
  /** Passage id, or -1 for page-structure answers. */
  passageId: number
  excerpt: string
  /** Elements to highlight on the page (not serializable; WebMCP drops it). */
  elements?: Element[]
}

export type AnswerKind = "shortcut" | "quote" | "ai" | "unknown"

export interface Answer {
  text: string
  kind: AnswerKind
  sources: Source[]
  /** Which engine wrote it: "page insights", "best passage", "Chrome built-in AI"… */
  engine: string
  /** Hash of the page this answer came from; the panel marks stale answers. */
  pageHash: string
  lang: string
}

export interface Settings {
  mode: Mode
  topK: number
  answerStyle: AnswerStyle
  sayUnknown: boolean
  checks: PageCheck[]
  lang: Lang
  fontScale: number
}

export type SuggestionSource = "owner" | "pinned" | "auto"

export interface Suggestion {
  text: string
  source: SuggestionSource
}

/** Page types the question engine recognises. */
export type PageType =
  | "home"
  | "docs"
  | "product"
  | "form"
  | "article"
  | "faq"
  | "data"
  | "government"
  | "course"
  | "general"

export interface OwnerQuestion {
  /** Page path this applies to: exact ("/pricing") or a prefix ending in "*" ("/docs/*"). Default: every page. */
  path?: string
  text: string
}

/** What a site owner can set. Everything is optional. */
export interface OwnerConfig {
  /** Modes visitors may pick. Default: all three. */
  modes?: Mode[]
  /** Starting settings for new visitors. */
  defaults?: Partial<Settings>
  /** Fixed questions shown first (max 3 per page). */
  questions?: OwnerQuestion[]
  /** "both" (default): owner + pinned + dynamic. */
  suggestions?: "both" | "owner" | "dynamic" | "off"
  /** Number of suggestions shown, 3–6. Default 6. */
  suggestionCount?: number
  /** Page types whose dynamic rules are turned off. */
  disabledPageTypes?: PageType[]
  /** Visitors may pin their own questions. Default true. */
  allowPins?: boolean
  /** Cache index and vectors on the device. Default true (never on sensitive pages). */
  cache?: boolean
  /** CSS selector of the content to read. Default: main, article, [role=main] or body. */
  root?: string
  /** Extra selectors to never read (on top of the built-in privacy filter). */
  exclude?: string[]
  /** Where Transformers.js is loaded from (Balanced/Best). Default: jsDelivr, pinned version. */
  transformersUrl?: string
  /** Embedding model id. Default "Xenova/multilingual-e5-small". */
  embeddingModel?: string
  /** WebLLM ESM url for Best mode on browsers without Chrome AI. Off unless set. */
  webllmUrl?: string
  /** WebLLM model id. Default "Qwen2.5-0.5B-Instruct-q4f16_1-MLC". */
  webllmModel?: string
  /** Register read-only WebMCP tools for browser agents. Default true. */
  webmcp?: boolean
  /** Panel title. Default "Ask this page". */
  title?: string
  /** Which side the panel opens on. Default "right". */
  side?: "right" | "left"
  /** Show the floating launcher button. Default true. */
  launcher?: boolean
}

export interface ProgressEvent {
  stage: "reading" | "indexing" | "loading-model" | "embedding" | "searching" | "answering" | "ready"
  /** 0..1 when known. */
  progress?: number
  detail?: string
}
