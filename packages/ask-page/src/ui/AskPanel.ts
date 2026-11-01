// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/ui/AskPanel.ts
//
// <yuktai-ask>: the side panel. Shadow DOM keeps the site's CSS out.
//   · 420px side panel (drag or arrow keys to resize), bottom sheet on phones
//   · 17px text (18px Telugu), A−/A+, 44px targets, dark and light
//   · "AI answers from this page only" + privacy bar always visible
//   · answers stream, cite their sources, highlight them on the page
//   · Clear chat with 5 s undo · settings · model download only after consent
//   · Ctrl+/ opens and closes, Esc closes, focus returns to the launcher
// ─────────────────────────────────────────────────────────────────────────────

import { AskPage } from "../controller"
import type { Answer, Mode, OwnerConfig, PageCheck, Settings, Suggestion } from "../types"
import { ALL_CHECKS, EMBEDDING_MODEL_MB, TOP_K_CHOICES } from "../config"
import { fill, strings, type Strings } from "../i18n"
import { clearHighlight, focusElement, highlightElements } from "../highlight"
import { registerAskTools } from "../webmcp"
import { escapeHtml, renderMarkdown } from "./markdown"
import { icon } from "./icons"
import { STYLES } from "./styles"

interface Msg {
  id: number
  role: "you" | "bot"
  text: string
  question?: string
  answer?: Answer
  streaming?: boolean
  feedback?: "up" | "down"
}

const MIN_W = 360
const MAX_W = 720

export class YuktaiAskElement extends HTMLElement {
  /** Owner config. Set before the element is connected, or via the `config` JSON attribute. */
  config: OwnerConfig = {}
  page: AskPage | null = null

  private shadow: ShadowRoot
  private built = false
  private msgs: Msg[] = []
  private nextId = 1
  private isOpen = false
  private view: "chat" | "settings" = "chat"
  private abort: AbortController | null = null
  private undo: { msgs: Msg[]; timer: ReturnType<typeof setTimeout> } | null = null
  private sugg: Suggestion[] = []
  private showAllSugg = false
  private pendingMode: Mode | null = null
  private notice = ""
  private t: Strings = strings("en")
  private disposeTools: (() => void) | null = null
  private offProgress: (() => void) | null = null
  private offChange: (() => void) | null = null
  private keyHandler = (e: KeyboardEvent) => this.onGlobalKey(e)

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    if (this.built) return
    this.built = true
    this.setAttribute("data-yuktai-panel", "")
    const attr = this.getAttribute("config")
    if (attr) {
      try {
        this.config = { ...JSON.parse(attr), ...this.config }
      } catch {
        /* invalid JSON: keep defaults */
      }
    }
    if (this.config.side === "left") this.setAttribute("side", "left")
    this.page = new AskPage({ config: this.config })
    this.t = strings(this.langGuess())
    this.renderShell()
    document.addEventListener("keydown", this.keyHandler)
    this.offProgress = this.page.onProgress((e) => this.onProgress(e))
    this.offChange = this.page.onPageChange(() => this.onPageChanged())
    if (this.page.config.webmcp) void registerAskTools(this.page).then((r) => (this.disposeTools = r.dispose))
    if (this.hasAttribute("open")) void this.openPanel(false)
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.keyHandler)
    this.abort?.abort()
    this.disposeTools?.()
    this.offProgress?.()
    this.offChange?.()
    this.page?.dispose()
    clearHighlight(document)
    this.built = false
  }

  private langGuess() {
    const l = (document.documentElement.lang || "en").slice(0, 2).toLowerCase()
    return l === "te" ? "te" : "en"
  }

  private $<T extends Element = HTMLElement>(sel: string): T {
    return this.shadow.querySelector(sel) as T
  }

  // ── shell ─────────────────────────────────────────────────────────────────
  private renderShell() {
    const t = this.t
    const title = escapeHtml(this.page!.config.title || t.title)
    this.shadow.innerHTML = `<style>${STYLES}</style>
<button class="launcher" type="button" data-action="open" aria-expanded="false" aria-controls="ask-panel" ${this.page!.config.launcher ? "" : "hidden"}>${icon("chat", 22)}<span>${escapeHtml(t.open)}</span></button>
<section class="panel" id="ask-panel" role="dialog" aria-modal="false" aria-labelledby="ask-title" hidden>
  <div class="grab" aria-hidden="true"></div>
  <button class="resize" type="button" data-action="resize" aria-label="Resize panel (left and right arrow keys)"></button>
  <div class="head">
    <div class="title"><h2 id="ask-title">${icon("chat", 22)}<span>${title}</span><span class="badge">AI</span></h2><p class="ai-label"></p></div>
    <div class="tools">
      <button class="iconbtn" type="button" data-action="settings" aria-pressed="false"></button>
      <button class="iconbtn" type="button" data-action="minimize"></button>
      <button class="iconbtn" type="button" data-action="close"></button>
    </div>
  </div>
  <div class="privacy" role="note"></div>
  <div class="status" role="status" aria-live="polite" hidden><span class="status-text"></span><div class="bar" hidden><span></span></div></div>
  <div class="notices"></div>
  <div class="chat-view">
    <div class="log" aria-label="Conversation"></div>
    <div class="sugg"></div>
    <form class="composer" novalidate>
      <label for="ask-input"></label>
      <div class="row">
        <textarea id="ask-input" class="input" rows="1" autocomplete="off" spellcheck="true"></textarea>
        <button class="primary" type="submit" data-role="send"></button>
      </div>
      <div class="row tools-row"></div>
    </form>
  </div>
  <div class="settings-view" hidden></div>
  <div class="sr live" aria-live="polite" aria-atomic="true"></div>
</section>`
    this.shadow.addEventListener("click", (e) => this.onClick(e))
    this.$("form.composer").addEventListener("submit", (e) => {
      e.preventDefault()
      void this.submit()
    })
    const input = this.$<HTMLTextAreaElement>("#ask-input")
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault()
        void this.submit()
      }
    })
    input.addEventListener("input", () => {
      input.style.height = "auto"
      input.style.height = Math.min(input.scrollHeight, 160) + "px"
    })
    this.$(".panel").addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") {
        e.stopPropagation()
        if (this.view === "settings") this.showView("chat")
        else this.closePanel()
      }
    })
    this.setupResize()
    this.renderChrome()
    this.renderLog()
  }

  /** Texts that change with language, mode and state. */
  private renderChrome() {
    const t = this.t
    const p = this.page!
    this.$(".panel").classList.toggle("te", p.uiLang() === "te")
    this.$(".panel").setAttribute("lang", p.uiLang())
    this.$(".panel").style.setProperty("--scale", String(p.settings.fontScale))
    this.$("#ask-title span").textContent = p.config.title || t.title
    this.$(".ai-label").textContent = t.aiLabel
    const set = (sel: string, name: Parameters<typeof icon>[0], label: string) => {
      const b = this.$(sel)
      b.innerHTML = icon(name, 22)
      b.setAttribute("aria-label", label)
      b.setAttribute("title", label)
    }
    set("[data-action=settings]", "tools", t.settings)
    set("[data-action=minimize]", "minus", t.minimize)
    set("[data-action=close]", "close", t.close)
    const modeName = { fast: t.fast, balanced: t.balanced, best: t.best }[p.settings.mode]
    const vec = p.settings.mode !== "fast" && p.vectorState !== "ready" ? ` (${p.vectorState === "loading" ? "…" : t.fast})` : ""
    this.$(".privacy").innerHTML = `${icon("lock", 18)}<span class="grow"><b>${escapeHtml(t.privacy)}</b> · ${escapeHtml(t.sent)}</span><span>${escapeHtml(modeName + vec)}</span>`
    this.$("label[for=ask-input]").textContent = t.inputLabel
    this.$<HTMLTextAreaElement>("#ask-input").placeholder = t.placeholder
    this.renderSendButton()
    this.$(".tools-row").innerHTML = `
      <button class="btn danger" type="button" data-action="clear">${icon("delete", 18)}<span>${escapeHtml(t.clear)}</span></button>
      <span class="grow"></span>
      <button class="iconbtn" type="button" data-action="smaller" aria-label="${escapeHtml(t.smaller)}" title="${escapeHtml(t.smaller)}">${icon("zoomOut", 20)}</button>
      <button class="iconbtn" type="button" data-action="larger" aria-label="${escapeHtml(t.larger)}" title="${escapeHtml(t.larger)}">${icon("zoomIn", 20)}</button>`
    this.renderNotices()
  }

  private renderSendButton() {
    const b = this.$<HTMLButtonElement>("[data-role=send]")
    if (this.abort) {
      b.type = "button"
      b.dataset.action = "stop"
      b.innerHTML = `${icon("stop", 20)}<span>${escapeHtml(this.t.stop)}</span>`
    } else {
      b.type = "submit"
      delete b.dataset.action
      b.innerHTML = `${icon("send", 20)}<span>${escapeHtml(this.t.ask)}</span>`
    }
  }

  private renderNotices() {
    const t = this.t
    const p = this.page!
    const items: string[] = []
    if (this.notice) items.push(this.notice)
    if (p.snap?.sensitive) items.push(t.sensitive)
    if (p.snap && p.snap.passages.length === 0) items.push(t.emptyPage)
    this.$(".notices").innerHTML = items.map((n) => `<div class="notice">${icon("info", 18)}<span>${escapeHtml(n)}</span></div>`).join("")
  }

  // ── open / close ──────────────────────────────────────────────────────────
  async openPanel(focus = true) {
    const panel = this.$(".panel")
    panel.hidden = false
    this.$(".launcher").hidden = true
    this.$(".launcher").setAttribute("aria-expanded", "true")
    this.isOpen = true
    if (focus) this.$<HTMLTextAreaElement>("#ask-input").focus()
    if (!this.page!.snap) {
      this.onProgress({ stage: "reading" })
      await this.page!.init()
      this.t = strings(this.page!.uiLang())
      this.renderChrome()
      this.renderLog()
    }
    await this.refreshSuggestions()
  }

  closePanel(keepHighlight = false) {
    this.$(".panel").hidden = true
    const l = this.$<HTMLButtonElement>(".launcher")
    if (this.page!.config.launcher) l.hidden = false
    l.setAttribute("aria-expanded", "false")
    this.isOpen = false
    if (!keepHighlight) clearHighlight(document)
    if (this.page!.config.launcher) l.focus()
  }

  toggle() {
    if (this.isOpen) this.closePanel()
    else void this.openPanel()
  }

  private onGlobalKey(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault()
      this.toggle()
    }
  }

  // ── chat ──────────────────────────────────────────────────────────────────
  private async submit(text?: string) {
    const input = this.$<HTMLTextAreaElement>("#ask-input")
    const q = (text ?? input.value).trim()
    if (!q || this.abort) return
    input.value = ""
    input.style.height = "auto"
    this.cancelUndo()
    this.msgs.push({ id: this.nextId++, role: "you", text: q })
    const bot: Msg = { id: this.nextId++, role: "bot", text: "", question: q, streaming: true }
    this.msgs.push(bot)
    this.renderLog()
    if (this.msgs.length === 2) this.renderSuggestions()
    this.abort = new AbortController()
    this.renderSendButton()
    try {
      const answer = await this.page!.ask(q, {
        signal: this.abort.signal,
        onStage: (e) => this.onProgress(e),
        onToken: (soFar) => {
          bot.text = soFar
          this.updateMsg(bot)
        },
      })
      bot.answer = answer
      bot.text = answer.kind === "unknown" ? this.t.unknown : answer.text
    } catch {
      bot.text = this.t.unknown
    } finally {
      bot.streaming = false
      this.abort = null
      this.renderSendButton()
      this.onProgress({ stage: "ready" })
      this.updateMsg(bot)
      this.announce(bot)
      if (bot.answer?.sources[0]?.elements?.length && bot.answer.kind !== "unknown") highlightElements(bot.answer.sources[0].elements!, document)
    }
  }

  private announce(m: Msg) {
    const plain = m.text.replace(/[*_`#>]/g, "").replace(/\[\d+\]/g, "")
    const src = m.answer?.sources[0]?.ref ? ` ${this.t.sources}: ${m.answer.sources[0].ref}` : ""
    this.$(".live").textContent = ""
    setTimeout(() => (this.$(".live").textContent = plain.slice(0, 400) + src), 50)
  }

  private msgHtml(m: Msg): string {
    const t = this.t
    if (m.role === "you") {
      const pinned = this.page!.pinned.includes(m.text)
      const pinBtn = this.page!.config.allowPins
        ? `<button class="iconbtn" type="button" data-action="${pinned ? "unpin" : "pin"}" data-q="${escapeHtml(m.text)}" aria-label="${escapeHtml(pinned ? t.unpin : t.pin)}" title="${escapeHtml(pinned ? t.unpin : t.pin)}" aria-pressed="${pinned}">${icon("star", 18)}</button>`
        : ""
      return `<div class="msg you" data-id="${m.id}"><span class="sr">${escapeHtml(t.you)}:</span><span class="q">${escapeHtml(m.text)}</span>${pinBtn}</div>`
    }
    const a = m.answer
    const unknown = a?.kind === "unknown"
    const body = m.streaming && !m.text ? `<p>${escapeHtml(t.searching)}…</p>` : renderMarkdown(m.text)
    const engine = a ? this.engineLabel(a) : ""
    const meta = a && !unknown ? `<div class="meta">${icon(a.kind === "ai" ? "spark" : "info", 14)}<span>${escapeHtml(engine)}${a.kind === "ai" ? " · " + escapeHtml(t.checkSource) : ""}</span></div>` : ""
    const sources =
      a && !unknown && a.sources.length
        ? `<div class="sources">${a.sources
            .map((s, i) => `<button class="src" type="button" data-action="source" data-id="${m.id}" data-i="${i}" title="${escapeHtml(s.excerpt)}">${icon("pin", 18)}<span>${escapeHtml(t.sources)}: ${escapeHtml(s.ref)}</span></button>`)
            .join("")}</div>`
        : ""
    const stale = a && !unknown && this.page!.snap && a.pageHash !== this.page!.snap.hash ? `<div class="stale">${icon("alert", 16)}<span>${escapeHtml(t.stale)}</span></div>` : ""
    const fb = (kind: "up" | "down", label: string, ic: "check" | "close") =>
      `<button class="iconbtn" type="button" data-action="feedback" data-kind="${kind}" data-id="${m.id}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" aria-pressed="${m.feedback === kind}">${icon(ic, 18)}</button>`
    const actions =
      !m.streaming && a
        ? `<div class="actions">
            ${unknown ? "" : `<button class="iconbtn" type="button" data-action="copy" data-id="${m.id}" aria-label="${escapeHtml(t.copy)}" title="${escapeHtml(t.copy)}">${icon("copy", 18)}</button>`}
            <button class="iconbtn" type="button" data-action="regen" data-id="${m.id}" aria-label="${escapeHtml(t.regenerate)}" title="${escapeHtml(t.regenerate)}">${icon("repeat", 18)}</button>
            ${unknown ? "" : fb("up", t.helpful, "check") + fb("down", t.notHelpful, "close")}
          </div>`
        : ""
    return `<div class="msg bot${unknown ? " unknown" : ""}" data-id="${m.id}" aria-busy="${!!m.streaming}"><span class="sr">${escapeHtml(t.assistant)}:</span><div class="body${m.streaming && m.text ? " typing" : ""}">${body}</div>${meta}${sources}${stale}${actions}</div>`
  }

  private engineLabel(a: Answer): string {
    const t = this.t
    if (a.kind === "shortcut") return a.engine === "page insights" ? t.engineInsights : a.engine
    if (a.kind === "quote") return t.engineQuote
    if (a.engine === "Chrome built-in AI") return t.engineChrome
    return a.engine
  }

  private renderLog() {
    const intro = `<div class="msg bot intro">${escapeHtml(this.t.intro)}</div>`
    const log = this.$(".log")
    log.innerHTML = intro + this.msgs.map((m) => this.msgHtml(m)).join("") + (this.undo ? `<div class="toast" role="status"><span>${escapeHtml(this.t.cleared)}</span><button class="btn" type="button" data-action="undo">${icon("undo", 18)}<span>${escapeHtml(this.t.undo)}</span></button></div>` : "")
    log.scrollTop = log.scrollHeight
  }

  private updateMsg(m: Msg) {
    const el = this.$(`.msg[data-id="${m.id}"]`)
    if (!el) return this.renderLog()
    el.outerHTML = this.msgHtml(m)
    const log = this.$(".log")
    log.scrollTop = log.scrollHeight
  }

  private clearChat() {
    this.abort?.abort()
    if (!this.msgs.length) return
    this.cancelUndo()
    const saved = this.msgs
    this.msgs = []
    clearHighlight(document)
    this.undo = {
      msgs: saved,
      timer: setTimeout(() => {
        this.undo = null
        this.renderLog()
      }, 5000),
    }
    this.renderLog()
    this.$<HTMLButtonElement>("[data-action=undo]")?.focus()
  }

  private cancelUndo() {
    if (this.undo) {
      clearTimeout(this.undo.timer)
      this.undo = null
    }
  }

  // ── suggestions ───────────────────────────────────────────────────────────
  private async refreshSuggestions() {
    try {
      const r = await this.page!.suggestions()
      this.sugg = r.suggestions
    } catch {
      this.sugg = []
    }
    this.renderSuggestions()
  }

  private renderSuggestions() {
    const t = this.t
    const box = this.$(".sugg")
    if (!this.sugg.length) {
      box.innerHTML = ""
      return
    }
    // once the conversation starts, keep the suggestions short so answers have room
    const n = this.msgs.length ? Math.min(3, this.page!.config.suggestionCount) : this.page!.config.suggestionCount
    const list = this.showAllSugg ? this.sugg : this.sugg.slice(0, n)
    const iconFor = (s: Suggestion) => (s.source === "owner" ? icon("pin", 16) : s.source === "pinned" ? icon("star", 16) : icon("spark", 16))
    const label = (s: Suggestion) => (s.source === "owner" ? t.ownerQ : s.source === "pinned" ? t.pinnedQ : t.autoQ)
    box.innerHTML = `<h3 id="ask-sugg">${escapeHtml(t.suggestions)}</h3><ul class="chips" aria-labelledby="ask-sugg">${list
      .map((s) => `<li><button class="chip ${s.source}" type="button" data-action="chip" data-q="${escapeHtml(s.text)}" title="${escapeHtml(label(s))}">${iconFor(s)}<span>${escapeHtml(s.text)}</span><span class="sr"> (${escapeHtml(label(s))})</span></button></li>`)
      .join("")}${this.sugg.length > n && !this.showAllSugg ? `<li><button class="chip more" type="button" data-action="more">${escapeHtml(t.more)}</button></li>` : ""}</ul>`
  }

  // ── progress ──────────────────────────────────────────────────────────────
  private onProgress(e: { stage: string; progress?: number; detail?: string }) {
    if (!this.built) return
    const t = this.t
    const status = this.$(".status")
    const bar = this.$(".status .bar")
    const text: Record<string, string> = { reading: t.reading, indexing: t.indexing, "loading-model": t.loadingModel, embedding: t.embedding, searching: t.searching + "…", answering: t.answering }
    if (e.stage === "ready") {
      status.hidden = true
      if (e.detail === "model-failed") {
        this.notice = t.modelFailed
        this.renderNotices()
      }
      this.renderChrome()
      return
    }
    status.hidden = false
    this.$(".status-text").textContent = text[e.stage] ?? ""
    const showBar = typeof e.progress === "number" && (e.stage === "loading-model" || e.stage === "embedding")
    bar.hidden = !showBar
    if (showBar) {
      ;(bar.firstElementChild as HTMLElement).style.width = `${Math.round((e.progress ?? 0) * 100)}%`
      bar.setAttribute("role", "progressbar")
      bar.setAttribute("aria-valuenow", String(Math.round((e.progress ?? 0) * 100)))
      bar.setAttribute("aria-valuemin", "0")
      bar.setAttribute("aria-valuemax", "100")
      bar.setAttribute("aria-label", text[e.stage] ?? "")
    }
  }

  private onPageChanged() {
    this.renderLog()
    this.renderNotices()
    void this.refreshSuggestions()
  }

  // ── settings ──────────────────────────────────────────────────────────────
  private showView(v: "chat" | "settings") {
    this.view = v
    this.$(".chat-view").hidden = v !== "chat"
    this.$(".settings-view").hidden = v !== "settings"
    this.$("[data-action=settings]").setAttribute("aria-pressed", String(v === "settings"))
    if (v === "settings") {
      this.renderSettings()
      this.$<HTMLElement>(".settings-view input, .settings-view select")?.focus()
    } else this.$<HTMLTextAreaElement>("#ask-input").focus()
  }

  private async renderSettings() {
    const t = this.t
    const p = this.page!
    const s = p.settings
    const modes = p.config.modes
    const hint = { fast: t.fastHint, balanced: fill(t.balancedHint, { mb: EMBEDDING_MODEL_MB }), best: t.bestHint }
    const modeHtml = modes
      .map((m) => `<label class="mode"><span><input type="radio" name="mode" value="${m}" ${s.mode === m ? "checked" : ""}>${escapeHtml({ fast: t.fast, balanced: t.balanced, best: t.best }[m])}</span><small>${escapeHtml(hint[m])}</small></label>`)
      .join("")
    const checkName: Record<PageCheck, string> = { accessibility: t.accessibility, forms: t.forms, images: t.images, structure: t.structure }
    const usage = await p.store.usage().catch(() => ({ index: 0, model: 0 }))
    const mb = (b: number) => (b / 1024 / 1024).toFixed(b > 10 * 1024 * 1024 ? 0 : 1) + " MB"
    const consent = this.pendingMode
      ? `<div class="consent" role="group" aria-labelledby="ask-consent-h" aria-describedby="ask-consent-p"><h3 id="ask-consent-h">${escapeHtml(t.modelConsentTitle)}</h3><p id="ask-consent-p">${escapeHtml(fill(t.modelConsent, { mb: EMBEDDING_MODEL_MB }))}</p><div class="row"><button class="primary" type="button" data-action="consent-yes">${escapeHtml(t.download)}</button><button class="btn" type="button" data-action="consent-no">${escapeHtml(t.cancel)}</button></div></div>`
      : ""
    this.$(".settings-view").innerHTML = `
<div class="settings">
  <button class="btn" type="button" data-action="back">${icon("arrowLeft", 18)}<span>${escapeHtml(t.back)}</span></button>
  ${consent}
  ${modes.length > 1 ? `<fieldset><legend>${escapeHtml(t.mode)}</legend><div class="modes">${modeHtml}</div></fieldset>` : ""}
  <div class="two">
    <div class="field"><label for="ask-topk">${escapeHtml(t.topK)}</label><select id="ask-topk">${TOP_K_CHOICES.map((k) => `<option ${k === s.topK ? "selected" : ""}>${k}</option>`).join("")}</select></div>
    <div class="field"><label for="ask-lang">${escapeHtml(t.language)}</label><select id="ask-lang">${(["auto", "te", "en", "hi"] as const)
      .map((l) => `<option value="${l}" ${s.lang === l ? "selected" : ""}>${l === "auto" ? escapeHtml(t.auto) : l === "te" ? "తెలుగు" : l === "hi" ? "हिन्दी" : "English"}</option>`)
      .join("")}</select></div>
  </div>
  <div class="field"><label for="ask-style">${escapeHtml(t.answerStyle)}</label><select id="ask-style">${(["quote", "short", "detailed"] as const)
    .map((v) => `<option value="${v}" ${s.answerStyle === v ? "selected" : ""}>${escapeHtml(t[v])}</option>`)
    .join("")}</select></div>
  <label class="check"><input type="checkbox" id="ask-unknown" ${s.sayUnknown ? "checked" : ""}>${escapeHtml(t.sayUnknown)}</label>
  <fieldset><legend>${escapeHtml(t.checks)}</legend><div class="checks">${ALL_CHECKS.map((c) => `<label class="check"><input type="checkbox" name="check" value="${c}" ${s.checks.includes(c) ? "checked" : ""}>${escapeHtml(checkName[c])}</label>`).join("")}</div></fieldset>
  <div class="card"><b>${escapeHtml(t.saved)}</b><span class="muted">${escapeHtml(t.index)} ${mb(usage.index)} · ${escapeHtml(t.model)} ${mb(usage.model)}</span>
    <div class="row" style="flex-wrap:wrap"><button class="btn" type="button" data-action="clear-saved">${escapeHtml(t.clearSaved)}</button><button class="btn" type="button" data-action="remove-model">${escapeHtml(t.removeModel)}</button></div></div>
</div>
<div class="foot"><button class="btn" type="button" data-action="reset-settings">${icon("undo", 18)}<span>${escapeHtml(t.reset)}</span></button><span style="flex:1"></span><button class="primary" type="button" data-action="save-settings">${escapeHtml(t.save)}</button></div>`
    if (this.pendingMode) this.$<HTMLButtonElement>("[data-action=consent-yes]")?.focus()
  }

  private readSettingsForm(): Partial<Settings> {
    const v = this.$(".settings-view")
    const mode = (v.querySelector("input[name=mode]:checked") as HTMLInputElement | null)?.value as Mode | undefined
    return {
      ...(mode ? { mode } : {}),
      topK: Number((v.querySelector("#ask-topk") as HTMLSelectElement).value),
      lang: (v.querySelector("#ask-lang") as HTMLSelectElement).value as Settings["lang"],
      answerStyle: (v.querySelector("#ask-style") as HTMLSelectElement).value as Settings["answerStyle"],
      sayUnknown: (v.querySelector("#ask-unknown") as HTMLInputElement).checked,
      checks: Array.from(v.querySelectorAll<HTMLInputElement>("input[name=check]:checked")).map((c) => c.value as PageCheck),
    }
  }

  private async saveSettings() {
    const next = this.readSettingsForm()
    const r = await this.page!.updateSettings(next)
    if (r === "needs-consent") {
      this.pendingMode = next.mode ?? null
      await this.renderSettings()
      return
    }
    this.afterSettingsChange(this.t.savedSettings)
  }

  private afterSettingsChange(message: string) {
    this.t = strings(this.page!.uiLang())
    this.notice = ""
    this.renderChrome()
    this.renderLog()
    this.showView("chat")
    void this.refreshSuggestions()
    this.$(".live").textContent = message
  }

  // ── resize ────────────────────────────────────────────────────────────────
  private setupResize() {
    const handle = this.$(".resize")
    const panel = this.$(".panel")
    const left = () => this.getAttribute("side") === "left"
    const setW = (w: number) => {
      const max = Math.min(MAX_W, window.innerWidth - 40)
      const width = Math.max(MIN_W, Math.min(max, Math.round(w)))
      this.style.setProperty("--ask-w", width + "px")
      panel.style.width = width + "px"
    }
    handle.addEventListener("pointerdown", (e) => {
      const pe = e as PointerEvent
      pe.preventDefault()
      handle.setPointerCapture(pe.pointerId)
      const move = (ev: PointerEvent) => setW(left() ? ev.clientX : window.innerWidth - ev.clientX)
      const up = () => {
        handle.removeEventListener("pointermove", move as EventListener)
        handle.removeEventListener("pointerup", up)
      }
      handle.addEventListener("pointermove", move as EventListener)
      handle.addEventListener("pointerup", up)
    })
    handle.addEventListener("keydown", (e) => {
      const k = (e as KeyboardEvent).key
      if (k !== "ArrowLeft" && k !== "ArrowRight") return
      e.preventDefault()
      const grow = (k === "ArrowLeft") !== left()
      setW(panel.getBoundingClientRect().width + (grow ? 20 : -20))
    })
  }

  // ── clicks ────────────────────────────────────────────────────────────────
  private async onClick(e: Event) {
    const btn = (e.target as Element).closest<HTMLElement>("[data-action]")
    if (!btn) return
    const a = btn.dataset.action
    const p = this.page!
    const msg = () => this.msgs.find((m) => m.id === Number(btn.dataset.id))
    switch (a) {
      case "open":
        return this.openPanel()
      case "close":
        return this.closePanel()
      case "minimize":
        return this.closePanel(true)
      case "settings":
        return this.showView(this.view === "settings" ? "chat" : "settings")
      case "back":
        this.pendingMode = null
        return this.showView("chat")
      case "stop":
        this.abort?.abort()
        return
      case "clear":
        return this.clearChat()
      case "undo":
        if (this.undo) {
          this.msgs = this.undo.msgs
          this.cancelUndo()
          this.renderLog()
          this.$<HTMLTextAreaElement>("#ask-input").focus()
        }
        return
      case "smaller":
      case "larger": {
        const step = a === "larger" ? 0.1 : -0.1
        await p.updateSettings({ fontScale: Math.round((p.settings.fontScale + step) * 10) / 10 })
        this.$(".panel").style.setProperty("--scale", String(p.settings.fontScale))
        return
      }
      case "chip":
        return this.submit(btn.dataset.q ?? "")
      case "more":
        this.showAllSugg = true
        this.renderSuggestions()
        return
      case "source": {
        const m = msg()
        const s = m?.answer?.sources[Number(btn.dataset.i)]
        if (s?.elements?.length) {
          highlightElements(s.elements, document)
          if (window.matchMedia?.("(max-width: 640px)").matches) this.closePanel(true)
          else focusElement(s.elements[0])
        }
        return
      }
      case "copy": {
        const m = msg()
        if (!m) return
        const src = m.answer?.sources.map((s) => `${this.t.sources}: ${s.ref}`).join("\n") ?? ""
        try {
          await navigator.clipboard.writeText(`${m.text}\n\n${src}`.trim())
          this.$(".live").textContent = this.t.copied
          btn.innerHTML = icon("check", 18)
          setTimeout(() => (btn.innerHTML = icon("copy", 18)), 1500)
        } catch {
          /* clipboard blocked */
        }
        return
      }
      case "regen": {
        const m = msg()
        if (m?.question) return this.submit(m.question)
        return
      }
      case "feedback": {
        const m = msg()
        if (!m) return
        m.feedback = btn.dataset.kind as "up" | "down"
        this.updateMsg(m)
        this.$(".live").textContent = this.t.feedbackSaved
        return
      }
      case "pin":
        await p.pin(btn.dataset.q ?? "")
        this.renderLog()
        return this.refreshSuggestions()
      case "unpin":
        await p.unpin(btn.dataset.q ?? "")
        this.renderLog()
        return this.refreshSuggestions()
      case "save-settings":
        return this.saveSettings()
      case "reset-settings":
        await p.resetSettings()
        return this.afterSettingsChange(this.t.savedSettings)
      case "consent-yes": {
        const mode = this.pendingMode
        this.pendingMode = null
        if (mode) await p.grantModelConsent(mode)
        return this.afterSettingsChange(this.t.savedSettings)
      }
      case "consent-no":
        this.pendingMode = null
        return this.renderSettings()
      case "clear-saved":
        await p.clearSavedData()
        return this.afterSettingsChange(this.t.dataCleared)
      case "remove-model":
        await p.removeModel()
        return this.afterSettingsChange(this.t.modelRemoved)
    }
  }
}

export function defineAskPage(tag = "yuktai-ask"): void {
  if (typeof customElements !== "undefined" && !customElements.get(tag)) customElements.define(tag, YuktaiAskElement)
}

/** Adds the panel to the page (once) and returns it. */
export function mountAskPage(config: OwnerConfig = {}, parent: HTMLElement = document.body): YuktaiAskElement {
  defineAskPage()
  const existing = document.querySelector("yuktai-ask") as YuktaiAskElement | null
  if (existing) return existing
  const el = document.createElement("yuktai-ask") as YuktaiAskElement
  el.config = config
  parent.appendChild(el)
  return el
}
