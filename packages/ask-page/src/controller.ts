// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/controller.ts
//
// AskPage: the headless engine behind the panel (and the WebMCP tools).
//
//   question → shortcut ─┬─ page structure answers it ───────────────→ answer
//                        └─ retrieve (Rust: BM25 [+ vectors] → RRF)
//                             → check (confidence) ─┬─ too weak → "not on this page"
//                                                   └─ answer (Chrome AI / WebLLM /
//                                                      best sentences) → cite
//
// The five steps are plain async functions over one state object (`nodes`).
// The default runner calls them in order; @yuktishaalaa/ask-page/langgraph
// wires the very same functions into a LangGraph.js StateGraph.
// ─────────────────────────────────────────────────────────────────────────────

import type { Answer, Hit, Mode, OwnerConfig, PageSnapshot, PageType, ProgressEvent, SearchResult, Settings, Source, Suggestion } from "./types"
import { resolveConfig, sanitizeSettings, type ResolvedConfig } from "./config"
import { readPage } from "./reader/pageReader"
import { startBackend, type BackendClient } from "./worker/client"
import { MODE_HYBRID, MODE_KEYWORD } from "./search/engine"
import { AskStore, cacheKey, prefs } from "./storage/store"
import { answerLang, detectScriptLang, type UiLang } from "./lang"
import { matchShortcut, type ShortcutKind } from "./insights/shortcuts"
import * as insights from "./insights/pageInsights"
import { detectPageType, pageContext, type PageContext } from "./questions/pageType"
import { buildSuggestions } from "./questions/engine"
import { quoteAnswer } from "./answer/quote"
import { buildMessages, citedIndexes, isNotInPage } from "./answer/prompt"
import { chromePromptProvider, summarize, translate } from "./answer/chromeAI"
import { webllmProvider } from "./answer/webllm"
import type { AnswerProvider } from "./answer/provider"

/** Confidence thresholds (tested in test/eval.test.ts). */
export const MIN_COVERAGE = 0.5
export const MIN_COSINE = 0.82

export interface AskState {
  question: string
  lang: UiLang
  settings: Settings
  shortcut?: ShortcutKind | null
  search?: SearchResult
  answer?: Answer
}

export interface AskCallbacks {
  onToken?: (textSoFar: string) => void
  onStage?: (e: ProgressEvent) => void
  signal?: AbortSignal
}

export interface AskPageOptions {
  doc?: Document
  config?: OwnerConfig
  /** Extra on-device answer providers, tried before the built-in ones. */
  providers?: AnswerProvider[]
  /** Run search in a Web Worker (default true). */
  worker?: boolean
}

type Listener = (e: ProgressEvent) => void

export class AskPage {
  readonly doc: Document
  readonly config: ResolvedConfig
  settings: Settings
  pinned: string[] = []
  snap: PageSnapshot | null = null
  ctx: PageContext | null = null
  pageType: PageType = "general"
  backend: BackendClient | null = null
  readonly store: AskStore
  modelConsent = false
  vectorState: "off" | "loading" | "ready" | "failed" = "off"
  private listeners = new Set<Listener>()
  private changeListeners = new Set<() => void>()
  private extraProviders: AnswerProvider[]
  private webllm: AnswerProvider | null
  private initP: Promise<void> | null = null
  private observer: MutationObserver | null = null
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private useWorker: boolean

  constructor(opts: AskPageOptions = {}) {
    this.doc = opts.doc ?? document
    this.config = resolveConfig(opts.config)
    this.settings = { ...this.config.defaults }
    this.store = new AskStore(this.config.cache)
    this.extraProviders = opts.providers ?? []
    this.useWorker = opts.worker !== false
    this.webllm = this.config.webllmUrl
      ? webllmProvider(this.config.webllmUrl, this.config.webllmModel, (p, t) => this.emit({ stage: "loading-model", progress: p, detail: t }))
      : null
  }

  // ── events ────────────────────────────────────────────────────────────────
  onProgress(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  onPageChange(fn: () => void): () => void {
    this.changeListeners.add(fn)
    return () => this.changeListeners.delete(fn)
  }
  private emit(e: ProgressEvent) {
    this.listeners.forEach((l) => l(e))
  }

  // ── setup ─────────────────────────────────────────────────────────────────
  init(): Promise<void> {
    if (!this.initP) this.initP = this.doInit()
    return this.initP
  }

  private async doInit() {
    const [saved, pins, consent] = await Promise.all([
      prefs.get<Partial<Settings>>("settings"),
      prefs.get<string[]>("pins"),
      prefs.get<boolean>("modelConsent"),
    ])
    if (saved) this.settings = sanitizeSettings({ ...this.config.defaults, ...saved }, this.config.modes)
    this.pinned = Array.isArray(pins) ? pins.filter((p) => typeof p === "string").slice(0, 10) : []
    this.modelConsent = consent === true
    this.backend = await startBackend({ worker: this.useWorker })
    await this.reindex()
    this.watch()
    if (this.settings.mode !== "fast" && this.modelConsent) void this.prepareVectors()
  }

  /** Reads the page and rebuilds the keyword index. */
  async reindex(): Promise<boolean> {
    this.emit({ stage: "reading" })
    const snap = readPage(this.doc, { root: this.config.root || undefined, exclude: this.config.exclude })
    const changed = !this.snap || this.snap.hash !== snap.hash
    this.snap = snap
    this.ctx = pageContext(this.doc, snap)
    this.pageType = detectPageType(this.ctx).type
    if (changed) {
      this.emit({ stage: "indexing" })
      await this.backend!.index(snap.passages.map((p) => p.text))
      if (this.vectorState === "ready" || this.vectorState === "loading") {
        this.vectorState = "off"
        if (this.settings.mode !== "fast" && this.modelConsent) void this.prepareVectors()
      }
    }
    this.emit({ stage: "ready" })
    return changed
  }

  private watch() {
    const MO = (this.doc.defaultView as (Window & typeof globalThis) | null)?.MutationObserver ?? globalThis.MutationObserver
    if (typeof MO === "undefined" || !this.doc.body) return
    this.observer = new MO((records) => {
      if (records.every((r) => (r.target as Element).closest?.("yuktai-ask, [data-yuktai-panel]"))) return
      if (this.refreshTimer) clearTimeout(this.refreshTimer)
      this.refreshTimer = setTimeout(async () => {
        if (await this.reindex()) this.changeListeners.forEach((l) => l())
      }, 900)
    })
    this.observer.observe(this.doc.body, { childList: true, subtree: true, characterData: true })
  }

  /** Loads the embedding model and makes (or loads cached) passage vectors. */
  async prepareVectors(): Promise<boolean> {
    if (!this.snap || !this.backend) return false
    if (this.vectorState === "ready") return true
    this.vectorState = "loading"
    const snap = this.snap
    try {
      const progress = (p: { stage: "loading-model" | "embedding"; progress: number; detail?: string }) => this.emit({ stage: p.stage, progress: p.progress, detail: p.detail })
      await this.backend.loadEmbedder({ url: this.config.transformersUrl, model: this.config.embeddingModel }, progress)
      const key = cacheKey(snap.url, snap.hash, this.config.embeddingModel)
      const cached = await this.store.getVectors(key)
      if (cached && cached.scales.length === snap.passages.length) {
        await this.backend.setVectors(cached.q, cached.scales, cached.dim)
      } else {
        const rec = await this.backend.embedPassages(snap.passages.map((p) => p.text), progress)
        await this.store.setVectors(key, rec, this.config.cache && !snap.sensitive)
      }
      if (this.snap !== snap) return this.prepareVectors()
      this.vectorState = "ready"
      this.emit({ stage: "ready" })
      return true
    } catch {
      this.vectorState = "failed"
      this.emit({ stage: "ready", detail: "model-failed" })
      return false
    }
  }

  // ── settings ──────────────────────────────────────────────────────────────
  /** Saves settings. Returns "needs-consent" when a model download needs the visitor's OK first. */
  async updateSettings(next: Partial<Settings>): Promise<"ok" | "needs-consent"> {
    const merged = sanitizeSettings({ ...this.settings, ...next }, this.config.modes)
    const wantsModel = merged.mode !== "fast"
    if (wantsModel && !this.modelConsent) {
      this.settings = { ...merged, mode: this.settings.mode }
      await prefs.set("settings", this.settings)
      return "needs-consent"
    }
    this.settings = merged
    await prefs.set("settings", merged)
    if (wantsModel) void this.prepareVectors()
    return "ok"
  }

  async grantModelConsent(mode: Mode): Promise<void> {
    this.modelConsent = true
    await prefs.set("modelConsent", true)
    await this.updateSettings({ mode })
  }

  async resetSettings(): Promise<void> {
    this.settings = { ...this.config.defaults }
    await prefs.set("settings", this.settings)
  }

  async pin(q: string): Promise<void> {
    const t = q.trim()
    if (!t || !this.config.allowPins) return
    this.pinned = [t, ...this.pinned.filter((p) => p !== t)].slice(0, 10)
    await prefs.set("pins", this.pinned)
  }
  async unpin(q: string): Promise<void> {
    this.pinned = this.pinned.filter((p) => p !== q)
    await prefs.set("pins", this.pinned)
  }

  async clearSavedData(): Promise<void> {
    await this.store.clearSaved()
    await prefs.clear()
    this.pinned = []
    this.modelConsent = false
    this.settings = { ...this.config.defaults }
    if (this.vectorState !== "off") this.vectorState = "off"
    await this.reindexForce()
  }

  async removeModel(): Promise<void> {
    await this.store.removeModel()
    this.modelConsent = false
    await prefs.set("modelConsent", false)
    this.vectorState = "off"
    this.settings = sanitizeSettings({ ...this.settings, mode: "fast" }, this.config.modes)
    await prefs.set("settings", this.settings)
    await this.reindexForce()
  }

  private async reindexForce() {
    this.snap = null
    await this.reindex()
  }

  // ── search ────────────────────────────────────────────────────────────────
  async search(question: string, k = this.settings.topK, mode: Mode = this.settings.mode): Promise<SearchResult> {
    await this.init()
    const snap = this.snap!
    const vectors = mode !== "fast" && this.vectorState === "ready"
    const res = await this.backend!.search(question, vectors ? MODE_HYBRID : MODE_KEYWORD, k)
    const hits: Hit[] = res.hits
      .filter((h) => h.doc >= 0 && h.doc < snap.passages.length)
      .map((h) => ({ passage: snap.passages[h.doc], score: h.fused, bm25: h.bm25, cosine: h.cosine, coverage: h.coverage }))
    const top = hits[0]
    const confident = !!top && res.terms > 0 && (top.coverage >= MIN_COVERAGE || (res.usedVectors && top.cosine >= MIN_COSINE))
    return { hits, terms: res.terms, confident, usedVectors: res.usedVectors }
  }

  /** Does this page answer the question? Used to vet suggested questions. */
  async answerable(question: string): Promise<boolean> {
    if (matchShortcut(question, this.settings.checks)) return true
    const r = await this.search(question, 1, "fast")
    return r.confident
  }

  async suggestions(): Promise<{ pageType: PageType; suggestions: Suggestion[] }> {
    await this.init()
    const lang = this.uiLang()
    return buildSuggestions({ ctx: this.ctx!, config: this.config, pinned: this.pinned, lang, answerable: (q) => this.answerable(q) })
  }

  uiLang(): UiLang {
    if (this.settings.lang !== "auto") return this.settings.lang
    const l = (this.snap?.lang ?? "en") as UiLang
    return l === "te" || l === "hi" ? l : "en"
  }

  // ── the five steps ────────────────────────────────────────────────────────
  readonly nodes = {
    /** 1. Can page structure answer it, with no model and no search? */
    shortcut: async (s: AskState): Promise<Partial<AskState>> => {
      const kind = matchShortcut(s.question, s.settings.checks)
      if (!kind) return { shortcut: null }
      const doc = this.doc
      const snap = this.snap!
      const lang = s.lang
      const ins =
        kind === "summary" ? insights.summary(doc, snap, lang)
        : kind === "about" ? insights.aboutPage(doc, snap, lang)
        : kind === "structure" ? insights.structure(doc, lang)
        : kind === "forms" ? insights.forms(doc, lang)
        : kind === "images" ? insights.images(doc, lang)
        : kind === "tables" ? insights.tables(doc, lang)
        : insights.accessibility(doc, lang)
      let text = ins.text
      let engine = "page insights"
      if (kind === "summary" && s.settings.mode !== "fast" && s.settings.answerStyle !== "quote") {
        const ai = await summarize(snap.passages.map((p) => p.text).join("\n\n"))
        if (ai) {
          const t = lang === "en" ? ai : await translate(ai, "en", lang)
          if (t) (text = t), (engine = "Chrome built-in AI")
        }
      }
      return {
        shortcut: kind,
        answer: { text, kind: "shortcut", engine, pageHash: snap.hash, lang, sources: [{ ref: ins.ref, passageId: -1, excerpt: "", elements: ins.elements }] },
      }
    },

    /** 2. Find the passages: Rust BM25, plus vectors and RRF when ready. */
    retrieve: async (s: AskState): Promise<Partial<AskState>> => {
      return { search: await this.search(s.question, s.settings.topK, s.settings.mode) }
    },

    /** 3. Good enough to answer from? If not, say so instead of guessing. */
    check: async (s: AskState): Promise<Partial<AskState>> => {
      const r = s.search!
      if (r.hits.length && (r.confident || !s.settings.sayUnknown)) return {}
      return { answer: { text: "", kind: "unknown", engine: "", pageHash: this.snap!.hash, lang: s.lang, sources: [] } }
    },

    /** 4. Write the answer: on-device AI when available, else the best sentences. */
    answer: async (s: AskState, cb: AskCallbacks = {}): Promise<Partial<AskState>> => {
      const hits = s.search!.hits
      const snap = this.snap!
      const lang = s.lang
      if (s.settings.answerStyle !== "quote" && s.settings.mode !== "fast") {
        for (const p of this.providers(s.settings.mode)) {
          if (cb.signal?.aborted) break
          if (!(await p.available(lang))) continue
          cb.onStage?.({ stage: "answering" })
          const writes = p.writes(lang)
          const top = hits.slice(0, Math.min(hits.length, s.settings.answerStyle === "detailed" ? 5 : 3))
          let text = ""
          try {
            for await (const delta of p.stream(buildMessages(s.question, top, writes, s.settings.answerStyle), writes, cb.signal)) {
              text += delta
              if (writes === lang && !isNotInPage(text)) cb.onToken?.(text)
            }
          } catch (e) {
            if (cb.signal?.aborted) return { answer: { text, kind: "ai", engine: p.name, pageHash: snap.hash, lang, sources: this.sourcesFor(top, text) } }
            continue
          }
          if (isNotInPage(text)) {
            if (s.settings.sayUnknown) return { answer: { text: "", kind: "unknown", engine: p.name, pageHash: snap.hash, lang, sources: [] } }
            break
          }
          const sources = this.sourcesFor(top, text)
          let out = text.trim()
          if (writes !== lang) out = (await translate(out, writes, lang)) ?? out
          return { answer: { text: out, kind: "ai", engine: p.name, pageHash: snap.hash, lang: writes !== lang && out === text.trim() ? writes : lang, sources } }
        }
      }
      const q = quoteAnswer(s.question, hits, s.settings.answerStyle)
      let text = q.text
      // the quote's own language, not the page's: a Telugu section on an English page stays Telugu
      let outLang: string = detectScriptLang(text)
      if (lang !== outLang) {
        const t = await translate(text, outLang, lang)
        if (t) (text = t), (outLang = lang)
      }
      return { answer: { text, kind: "quote", engine: "best passage", pageHash: snap.hash, lang: outLang, sources: this.sourcesFor(q.used, q.text, true) } }
    },

    /** 5. Sources: which passages, and which elements to highlight. */
    cite: async (s: AskState): Promise<Partial<AskState>> => {
      const a = s.answer
      if (!a || a.kind === "unknown") return {}
      return { answer: { ...a, sources: a.sources.slice(0, 3) } }
    },
  }

  private providers(mode: Mode): AnswerProvider[] {
    const list = [...this.extraProviders, chromePromptProvider]
    if (mode === "best" && this.webllm) list.push(this.webllm)
    return list
  }

  private sourcesFor(hits: Hit[], answerText: string, quoted = false): Source[] {
    const snap = this.snap!
    const order = quoted ? hits.map((_, i) => i) : citedIndexes(answerText, hits.length)
    const use = (order.length ? order : hits.map((_, i) => i).slice(0, 2)).map((i) => hits[i]).filter(Boolean)
    return use.map((h) => {
      const blocks = h.passage.blocks.map((i) => snap.blocks[i]).filter(Boolean)
      const body = blocks.filter((b) => b.kind !== "heading")
      // highlight the blocks the answer quotes, else the whole passage body
      const quotedBlocks = quoted ? body.filter((b) => answerText.split(/\s{2,}|\n/).some((part) => part.length > 20 && b.text.includes(part.slice(0, 60)))) : []
      const els = (quotedBlocks.length ? quotedBlocks : body.length ? body : blocks).map((b) => b.el)
      const excerpt = h.passage.text.startsWith(h.passage.ref) ? h.passage.text.slice(h.passage.ref.length).trim() : h.passage.text
      return { ref: h.passage.ref || snap.title, passageId: h.passage.id, excerpt: excerpt.replace(/\s+/g, " ").slice(0, 180), elements: els }
    })
  }

  /** Runs the five steps in order. */
  async ask(question: string, cb: AskCallbacks = {}): Promise<Answer> {
    await this.init()
    let s: AskState = { question: question.trim().slice(0, 1000), lang: answerLang(question, this.settings.lang), settings: { ...this.settings } }
    const step = async (fn: (s: AskState) => Promise<Partial<AskState>>) => (s = { ...s, ...(await fn(s)) })
    await step(this.nodes.shortcut)
    if (!s.shortcut) {
      cb.onStage?.({ stage: "searching" })
      await step(this.nodes.retrieve)
      await step(this.nodes.check)
      if (!s.answer) await step((x) => this.nodes.answer(x, cb))
    }
    await step(this.nodes.cite)
    return s.answer!
  }

  dispose(): void {
    this.observer?.disconnect()
    if (this.refreshTimer) clearTimeout(this.refreshTimer)
    this.backend?.dispose()
  }
}
