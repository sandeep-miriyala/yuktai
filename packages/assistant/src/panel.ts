// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/assistant · src/panel.ts
// <yuktai-assistant>: a ♿ launcher and a panel with three tabs
// (Accessibility · Colours · Ask). Open shadow root, real buttons, switches
// and a slider, tabs with arrow keys, Escape closes and returns focus.
// Marked data-yuktai-ui so the accessibility engine never "fixes" it.
// ─────────────────────────────────────────────────────────────────────────────

import { primary, type Prefs, type Report } from "@yuktishaalaa/a11y"
import { LANG_NAMES, words, type Words } from "./i18n"

export interface PanelState {
  prefs: Prefs
  contrastFix: boolean
  pageLang: string
  report: Report | null
  reading: boolean
  canSpeak: boolean
  ask: boolean
}

export interface PanelHandlers {
  onPrefs(p: Partial<Prefs>): void
  onContrastFix(on: boolean): void
  onRead(): void
  onAsk(): void
  onReset(): void
}

const ICON_A11Y = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1"/><path d="M12 9.5V14"/><path d="m9 21 3-7 3 7"/></svg>'
const ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>'

const CSS = `
:host{all:initial;position:fixed;z-index:2147483600;right:20px;bottom:20px;font-family:Inter,"Noto Sans Telugu","Noto Sans Devanagari",system-ui,sans-serif;color:#16181D}
:host([side=left]){right:auto;left:20px}
*{box-sizing:border-box}
button,input{font:inherit;color:inherit}
:focus-visible{outline:3px solid #2F43C4;outline-offset:2px}
.launch{width:56px;height:56px;border-radius:999px;border:0;background:#2F43C4;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 24px -6px rgba(47,67,196,.5)}
.panel{position:absolute;right:0;bottom:68px;width:min(380px,calc(100vw - 32px));max-height:min(640px,calc(100vh - 100px));display:flex;flex-direction:column;background:#fff;border:1px solid #DADBD5;border-radius:16px;box-shadow:0 24px 48px -12px rgba(22,24,29,.25);overflow:hidden}
:host([side=left]) .panel{right:auto;left:0}
.panel[hidden]{display:none}
.head{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 8px 18px}
h2{margin:0;font-size:16px;font-weight:700}
.icon{width:44px;height:44px;border:0;border-radius:10px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#5B6170}
.tabs{display:flex;gap:4px;padding:0 12px;border-bottom:1px solid #E3E3DE}
.tab{height:44px;padding:0 12px;border:0;background:transparent;cursor:pointer;color:#4A4F5C;font-size:14px;font-weight:500;border-bottom:2px solid transparent}
.tab[aria-selected=true]{color:#16181D;font-weight:600;border-bottom-color:#2F43C4}
.body{padding:14px 18px;overflow:auto;display:flex;flex-direction:column;gap:16px;min-height:0}
.body>*{flex-shrink:0}
.label{font-size:13px;font-weight:600;margin-bottom:8px;display:block}
.seg{display:flex;gap:4px;padding:4px;border-radius:10px;background:#F1F1EE}
.seg button{flex:1;height:38px;border:0;border-radius:8px;background:transparent;color:#4A4F5C;font-size:13.5px;font-weight:600;cursor:pointer}
.seg button[aria-pressed=true]{background:#fff;color:#16181D;box-shadow:0 1px 3px rgba(22,24,29,.15)}
.themes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.themes button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px;border-radius:10px;border:2px solid #E3E3DE;background:transparent;cursor:pointer;font-size:12px}
.themes button[aria-pressed=true]{border-color:#2F43C4}
.sw{width:100%;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;border:1px solid #E3E3DE}
.row{display:flex;align-items:center;gap:12px;min-height:48px;cursor:pointer}
.row span{flex:1;display:flex;flex-direction:column;gap:2px}
.row b{font-size:14px;font-weight:500}
.row small,.hint{font-size:12.5px;color:#5B6170}
.row input{width:22px;height:22px;accent-color:#2F43C4;margin:0;cursor:pointer}
input[type=range]{width:100%;accent-color:#2F43C4;margin:0}
.chip{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:#F4F6FE;color:#24306E;font-size:13px}
.btn{height:44px;padding:0 16px;border-radius:10px;border:1px solid #C9CBD3;background:#fff;cursor:pointer;font-size:14px;font-weight:600}
.btn.primary{background:#2F43C4;border-color:#2F43C4;color:#fff}
.counts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.counts div{border:1px solid #E3E3DE;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column}
.counts strong{font-size:20px}
.ok{color:#17603C}.warn{color:#7A4700}.unk{color:#3A3E48}
.foot{display:flex;gap:8px;padding:12px 18px 16px;border-top:1px solid #E3E3DE}
.foot .btn{flex:1}
.status{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:no-preference){.panel{transition:opacity .15s}}
`

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

export class YuktaiAssistantElement extends HTMLElement {
  state!: PanelState
  handlers!: PanelHandlers
  private root: ShadowRoot
  private open = false
  private tab: "a11y" | "colours" | "ask" = "a11y"
  private w: Words = words("en")

  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    // (attributes may not be set in a custom element's constructor)
    this.setAttribute("data-yuktai-ui", "")
    this.render()
    this.root.addEventListener("click", (e) => this.onClick(e))
    this.root.addEventListener("change", (e) => this.onChange(e))
    this.root.addEventListener("input", (e) => this.onChange(e))
    this.root.addEventListener("keydown", (e) => this.onKey(e as KeyboardEvent))
  }

  /** Re-draw after the state changed. Keeps focus on the same control. */
  update(next: Partial<PanelState>) {
    this.state = { ...this.state, ...next }
    const id = (this.root.activeElement as HTMLElement | null)?.id
    this.render()
    if (id) (this.root.getElementById(id) as HTMLElement | null)?.focus()
  }

  toggle(force?: boolean) {
    this.open = force ?? !this.open
    this.render()
    if (this.open) (this.root.querySelector(".tab[aria-selected=true]") as HTMLElement | null)?.focus()
    else (this.root.querySelector(".launch") as HTMLElement | null)?.focus()
  }

  get isOpen() {
    return this.open
  }

  announce(text: string) {
    const s = this.root.querySelector(".status")
    if (s) s.textContent = text
  }

  private onClick(e: Event) {
    const t = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null
    if (!t) return
    const act = t.dataset.act!
    const v = t.dataset.v ?? ""
    const h = this.handlers
    if (act === "launch") return this.toggle()
    if (act === "close") return this.toggle(false)
    if (act === "tab") {
      this.tab = v as typeof this.tab
      this.render()
      ;(this.root.getElementById("tab-" + v) as HTMLElement | null)?.focus()
      return
    }
    if (act === "level") h.onPrefs({ level: v as Prefs["level"] })
    if (act === "theme") h.onPrefs({ theme: v as Prefs["theme"] })
    if (act === "dark") h.onPrefs({ dark: v as Prefs["dark"] })
    if (act === "read") h.onRead()
    if (act === "ask") h.onAsk()
    if (act === "reset") h.onReset()
  }

  private onChange(e: Event) {
    const t = e.target as HTMLInputElement
    const h = this.handlers
    if (t.id === "size") h.onPrefs({ textSize: Number(t.value) })
    if (e.type !== "change") return
    if (t.id === "spacing") h.onPrefs({ spacing: t.checked })
    if (t.id === "motion") h.onPrefs({ reduceMotion: t.checked ? "on" : "device" })
    if (t.id === "focus") h.onPrefs({ focusRing: t.checked })
    if (t.id === "contrast") h.onContrastFix(t.checked)
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && this.open) {
      e.stopPropagation()
      this.toggle(false)
      return
    }
    const t = e.target as HTMLElement
    if (t.classList.contains("tab") && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
      const tabs = ["a11y", "colours", "ask"] as const
      const i = tabs.indexOf(this.tab)
      const n = e.key === "Home" ? 0 : e.key === "End" ? 2 : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3
      e.preventDefault()
      this.tab = tabs[n]
      this.render()
      ;(this.root.getElementById("tab-" + this.tab) as HTMLElement | null)?.focus()
    }
  }

  private seg(act: string, current: string, items: [string, string][], labelId: string) {
    return `<div class="seg" role="group" aria-labelledby="${labelId}">${items
      .map(([v, l]) => `<button type="button" data-act="${act}" data-v="${v}" id="${act}-${v}" aria-pressed="${current === v}">${esc(l)}</button>`)
      .join("")}</div>`
  }

  private sw(id: string, title: string, hint: string, on: boolean) {
    return `<label class="row" for="${id}"><span><b>${esc(title)}</b><small>${esc(hint)}</small></span><input type="checkbox" role="switch" id="${id}" ${on ? "checked" : ""}></label>`
  }

  private render() {
    if (!this.state) return
    const s = this.state
    const p = s.prefs
    const w = (this.w = words(s.pageLang))
    const langName = LANG_NAMES[primary(s.pageLang)] ?? s.pageLang ?? "?"
    let body = ""
    if (this.tab === "a11y") {
      const r = s.report
      body = `
        <div><span class="label" id="lvl">${esc(w.level)}</span>${this.seg("level", p.level, [["off", w.levelOff], ["AA", "AA"], ["AAA", "AAA"]], "lvl")}</div>
        ${this.sw("contrast", w.contrastFix, w.contrastHint, s.contrastFix)}
        ${this.sw("motion", w.motion, w.motionHint, p.reduceMotion === "on")}
        ${this.sw("focus", w.focus, w.focusHint, p.focusRing)}
        ${this.sw("spacing", w.spacing, w.spacingHint, p.spacing)}
        <div class="chip">${esc(w.pageLang)}: ${esc(langName)} (${esc(s.pageLang || "?")}) · ${esc(w.auto)}</div>
        ${s.canSpeak ? `<button type="button" class="btn" data-act="read" id="read" aria-pressed="${s.reading}">${esc(s.reading ? w.stopReading : w.readPage)}</button>` : ""}
        ${r ? `<div><span class="label">${esc(w.report)}</span><div class="counts">
          <div><strong class="ok">${r.fixed.length}</strong><small>${esc(w.fixed)}</small></div>
          <div><strong class="warn">${r.check.length}</strong><small>${esc(w.check)}</small></div>
          <div><strong class="unk">${r.unknown.length}</strong><small>${esc(w.unknown)}</small></div></div></div>` : ""}`
    } else if (this.tab === "colours") {
      const th = (v: string, label: string, fg: string, bg: string) =>
        `<button type="button" data-act="theme" data-v="${v}" id="theme-${v}" aria-pressed="${p.theme === v}"><span class="sw" style="color:${fg};background:${bg}" aria-hidden="true">Aa</span>${esc(label)}</button>`
      body = `
        <div><span class="label" id="thm">${esc(w.theme)}</span><div class="themes" role="group" aria-labelledby="thm">
          ${th("default", w.themeDefault, "#16181D", "#FFFFFF")}${th("high-contrast", w.themeHigh, "#FFFF00", "#000000")}${th("soft", w.themeSoft, "#3B2F1E", "#F4ECD8")}</div></div>
        <div><span class="label" id="drk">${esc(w.dark)}</span>${this.seg("dark", p.dark, [["off", w.off], ["on", w.on], ["device", w.device]], "drk")}</div>
        <div><label class="label" for="size">${esc(w.textSize)}: ${p.textSize}%</label><input type="range" id="size" min="100" max="200" step="10" value="${p.textSize}"></div>
        <p class="hint">${esc(w.saved)}</p>`
    } else {
      body = `<p class="hint" style="margin:0">${esc(w.askHint)}</p>
        ${s.ask ? `<button type="button" class="btn primary" data-act="ask" id="ask">${esc(w.ask)}</button>` : ""}`
    }
    const tabs = (["a11y", "colours", "ask"] as const)
      .filter((t) => t !== "ask" || s.ask)
      .map((t) => {
        const label = t === "a11y" ? w.tabA11y : t === "colours" ? w.tabColours : w.tabAsk
        const sel = this.tab === t
        return `<button type="button" role="tab" class="tab" data-act="tab" data-v="${t}" id="tab-${t}" aria-selected="${sel}" aria-controls="tabpanel" tabindex="${sel ? 0 : -1}">${esc(label)}</button>`
      })
      .join("")
    this.root.innerHTML = `<style>${CSS}</style>
      <div class="panel" id="panel" role="dialog" aria-labelledby="ttl" ${this.open ? "" : "hidden"} lang="${esc(primary(s.pageLang) || "en")}">
        <div class="head"><h2 id="ttl">${esc(w.title)}</h2><button type="button" class="icon" data-act="close" aria-label="${esc(w.close)}">${ICON_X}</button></div>
        <div class="tabs" role="tablist" aria-label="${esc(w.title)}">${tabs}</div>
        <div class="body" role="tabpanel" id="tabpanel" aria-labelledby="tab-${this.tab}">${body}</div>
        <div class="foot"><button type="button" class="btn" data-act="reset" id="reset">${esc(w.reset)}</button>${s.ask ? `<button type="button" class="btn primary" data-act="ask" id="ask-foot">${esc(w.ask)}</button>` : ""}</div>
      </div>
      <button type="button" class="launch" data-act="launch" aria-label="${esc(w.open)}" aria-expanded="${this.open}" aria-controls="panel">${ICON_A11Y}</button>
      <div class="status" role="status" aria-live="polite"></div>`
  }
}

export function defineAssistant() {
  if (typeof customElements !== "undefined" && !customElements.get("yuktai-assistant")) customElements.define("yuktai-assistant", YuktaiAssistantElement)
}
