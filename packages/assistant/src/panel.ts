// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/assistant · src/panel.ts
// <yuktai-assistant>: a launcher and a panel with up to three tabs
// (Accessibility · Colours · Ask). Open shadow root, real buttons, switches
// and a slider, tabs with arrow keys, Escape closes and returns focus.
// Marked data-yuktai-ui so the accessibility engine never "fixes" it.
//
// v6.0.1: messages stay (and are visible), the slider can be dragged, tabs
// work without Ask, one Ask button, selected states show in Windows High
// Contrast, the panel's lang matches its words and visitors can pick the
// panel language, the site can set its own title and colour, and the panel
// follows the visitor's dark / high-contrast choice.
// ─────────────────────────────────────────────────────────────────────────────

import { contrastRatio, parseColor, primary, type Prefs, type Report } from "@yuktishaalaa/a11y"
import { LANG_NAMES, words, type UiLang, type Words } from "./i18n"

export type PanelLang = "auto" | UiLang

export interface PanelState {
  prefs: Prefs
  contrastFix: boolean
  pageLang: string
  /** True when YuktAI found the page language (the page did not say it). */
  langDetected: boolean
  report: Report | null
  reading: boolean
  canSpeak: boolean
  ask: boolean
  /** A message that stays until the next action (missing voice, etc.). */
  notice: string
  uiLang: PanelLang
  /** Site branding. */
  title?: string
  color?: string
  /** The page is dark by itself (dark mode then does nothing). */
  pageDark: boolean
}

export interface PanelHandlers {
  onPrefs(p: Partial<Prefs>, live?: boolean): void
  onContrastFix(on: boolean): void
  onRead(): void
  onAsk(): void
  onReset(): void
  onSkipMain(): void
  onUiLang(l: PanelLang): void
}

const ICON_A11Y = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1"/><path d="M12 9.5V14"/><path d="m9 21 3-7 3 7"/></svg>'
const ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>'

/** White or black text on the brand colour, whichever reads better. */
function onColor(hex: string): string {
  const c = parseColor(hex)
  if (!c) return "#FFFFFF"
  return contrastRatio(c, { r: 255, g: 255, b: 255, a: 1 }) >= contrastRatio(c, { r: 0, g: 0, b: 0, a: 1 }) ? "#FFFFFF" : "#000000"
}

const CSS = `
:host{all:initial;position:fixed;z-index:2147483600;right:20px;bottom:20px;font-family:Inter,"Noto Sans Telugu","Noto Sans Devanagari",system-ui,sans-serif;
  --accent:#2F43C4;--on-accent:#FFFFFF;--bg:#FFFFFF;--fg:#16181D;--muted:#5B6170;--line:#E3E3DE;--soft:#F1F1EE;--chip:#F4F6FE;--chipfg:#24306E;--btn:#FFFFFF;color:var(--fg)}
:host([side=left]){right:auto;left:20px}
.wrap.dark{--bg:#16181D;--fg:#ECEDF1;--muted:#A9AFBD;--line:#33363F;--soft:#24262D;--chip:#20263F;--chipfg:#C9D2FF;--btn:#24262D}
.wrap.hc{--bg:#000000;--fg:#FFFFFF;--muted:#FFFFFF;--line:#FFFFFF;--soft:#000000;--chip:#000000;--chipfg:#FFFF00;--btn:#000000}
*{box-sizing:border-box}
button,input,select{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.wrap.hc :focus-visible{outline-color:#FFFF00}
.launch{width:56px;height:56px;border-radius:999px;border:2px solid transparent;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 24px -6px rgba(0,0,0,.35)}
.panel{position:absolute;right:0;bottom:68px;width:min(380px,calc(100vw - 32px));max-height:min(640px,calc(100vh - 100px));display:flex;flex-direction:column;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:16px;box-shadow:0 24px 48px -12px rgba(0,0,0,.3);overflow:hidden}
:host([side=left]) .panel{right:auto;left:0}
.panel[hidden]{display:none}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 8px 18px}
h2{margin:0;font-size:16px;font-weight:700}
.icon{width:44px;height:44px;border:0;border-radius:10px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted)}
.tabs{display:flex;gap:4px;padding:0 12px;border-bottom:1px solid var(--line)}
.tab{height:44px;padding:0 12px;border:0;background:transparent;cursor:pointer;color:var(--muted);font-size:14px;font-weight:500;border-bottom:3px solid transparent}
.tab[aria-selected=true]{color:var(--fg);font-weight:700;border-bottom-color:var(--accent)}
.body{padding:14px 18px;overflow:auto;display:flex;flex-direction:column;gap:16px;min-height:0}
.body>*{flex-shrink:0}
.label{font-size:13px;font-weight:600;margin-bottom:8px;display:block}
.seg{display:flex;gap:4px;padding:4px;border-radius:10px;background:var(--soft)}
.seg button{flex:1;height:38px;border:2px solid transparent;border-radius:8px;background:transparent;color:var(--muted);font-size:13.5px;font-weight:600;cursor:pointer}
.seg button[aria-pressed=true]{background:var(--bg);color:var(--fg);border-color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.15)}
.seg button[aria-pressed=true]::before{content:"✓ ";}
.seg button[aria-disabled=true]{opacity:.55;cursor:not-allowed}
.themes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.themes button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px;border-radius:10px;border:2px solid var(--line);background:transparent;cursor:pointer;font-size:12px}
.themes button[aria-pressed=true]{border:3px solid var(--accent)}
.themes button[aria-pressed=true] .name::before{content:"✓ "}
.sw{width:100%;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;border:1px solid var(--line)}
.row{display:flex;align-items:center;gap:12px;min-height:48px;cursor:pointer}
.row span{flex:1;display:flex;flex-direction:column;gap:2px}
.row b{font-size:14px;font-weight:500}
.row small,.hint{font-size:12.5px;color:var(--muted)}
.row input{width:22px;height:22px;accent-color:var(--accent);margin:0;cursor:pointer}
input[type=range]{width:100%;accent-color:var(--accent);margin:0}
select{width:100%;height:40px;border-radius:8px;border:1px solid var(--line);background:var(--btn);padding:0 8px}
.chip{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:var(--chip);color:var(--chipfg);font-size:13px;border:1px solid transparent}
.notice{padding:10px 12px;border-radius:10px;border:2px solid #9A5B00;background:#FBF0DC;color:#5A3500;font-size:13px;line-height:1.45}
.wrap.dark .notice,.wrap.hc .notice{background:transparent;color:var(--fg);border-color:#FFB020}
.btn{height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line);background:var(--btn);cursor:pointer;font-size:14px;font-weight:600}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.counts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.counts div{border:1px solid var(--line);border-radius:10px;padding:8px 10px;display:flex;flex-direction:column}
.counts strong{font-size:20px}
.ok{color:#17603C}.warn{color:#7A4700}.unk{color:var(--muted)}
.wrap.dark .ok,.wrap.hc .ok{color:#7EE2A8}.wrap.dark .warn,.wrap.hc .warn{color:#FFC266}
.foot{display:flex;gap:8px;padding:12px 18px 16px;border-top:1px solid var(--line)}
.foot .btn{flex:1}
.status{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:480px){.panel{max-height:min(70vh,560px)}}
@media (forced-colors:active){
  .launch{border-color:ButtonText}
  .seg button[aria-pressed=true],.themes button[aria-pressed=true]{outline:3px solid Highlight;outline-offset:1px}
  .tab[aria-selected=true]{border-bottom-color:Highlight}
  .notice,.chip{border-color:CanvasText}
}
@media (prefers-reduced-motion:no-preference){.panel{transition:opacity .15s}}
`

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

type Tab = "a11y" | "colours" | "ask"

export class YuktaiAssistantElement extends HTMLElement {
  state!: PanelState
  handlers!: PanelHandlers
  private root: ShadowRoot
  private wrap: HTMLDivElement | null = null
  private status: HTMLDivElement | null = null
  private styleEl: HTMLStyleElement | null = null
  private open = false
  private tab: Tab = "a11y"
  private w: Words = words("en")

  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    // (attributes may not be set in a custom element's constructor)
    this.setAttribute("data-yuktai-ui", "")
    if (!this.wrap) {
      // The live region is created once and never redrawn, so messages are
      // not wiped by the next render (bug 7).
      this.styleEl = document.createElement("style")
      this.styleEl.textContent = CSS
      this.wrap = document.createElement("div")
      this.wrap.className = "wrap"
      this.status = document.createElement("div")
      this.status.className = "status"
      this.status.setAttribute("role", "status")
      this.status.setAttribute("aria-live", "polite")
      this.root.append(this.styleEl, this.wrap, this.status)
      this.root.addEventListener("click", (e) => this.onClick(e))
      this.root.addEventListener("change", (e) => this.onChange(e))
      this.root.addEventListener("input", (e) => this.onChange(e))
      this.root.addEventListener("keydown", (e) => this.onKey(e as KeyboardEvent))
    }
    this.render()
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

  /** Focus the launcher (after Ask closes, etc.). */
  focusLauncher() {
    ;(this.root.querySelector(".launch") as HTMLElement | null)?.focus()
  }

  get isOpen() {
    return this.open
  }

  /** Says a message to screen readers; `show` also keeps it visible in the panel. */
  announce(text: string, show = false) {
    if (this.status) {
      this.status.textContent = ""
      // a fresh text node so the same message is announced again
      requestAnimationFrame(() => this.status && (this.status.textContent = text))
    }
    if (show) this.update({ notice: text })
  }

  /** The words the panel shows: the visitor's choice, else the page language. */
  private uiCode(): UiLang {
    const pick = this.state.uiLang !== "auto" ? this.state.uiLang : (primary(this.state.pageLang) as UiLang)
    return (["en", "te", "hi"] as const).includes(pick as UiLang) ? (pick as UiLang) : "en"
  }

  private tabs(): Tab[] {
    return (["a11y", "colours", "ask"] as const).filter((t) => t !== "ask" || this.state.ask)
  }

  private onClick(e: Event) {
    const t = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null
    if (!t || t.getAttribute("aria-disabled") === "true") return
    const act = t.dataset.act!
    const v = t.dataset.v ?? ""
    const h = this.handlers
    if (act === "launch") return this.toggle()
    if (act === "close") return this.toggle(false)
    if (act === "tab") {
      this.tab = v as Tab
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
    if (act === "skip") h.onSkipMain()
  }

  private onChange(e: Event) {
    const t = e.target as HTMLInputElement
    const h = this.handlers
    if (t.id === "size") {
      // While dragging: apply and update the label only. Redrawing the panel
      // here would drop the slider out of the visitor's hand (bug 6).
      const v = Number(t.value)
      const label = this.root.getElementById("size-label")
      if (label) label.textContent = `${this.w.textSize}: ${v}%`
      h.onPrefs({ textSize: v }, e.type === "input")
      return
    }
    if (e.type !== "change") return
    if (t.id === "spacing") h.onPrefs({ spacing: t.checked })
    if (t.id === "motion") h.onPrefs({ reduceMotion: t.checked ? "on" : "device" })
    if (t.id === "focus") h.onPrefs({ focusRing: t.checked })
    if (t.id === "contrast") h.onContrastFix(t.checked)
    if (t.id === "uilang") h.onUiLang(t.value as PanelLang)
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && this.open) {
      e.stopPropagation()
      this.toggle(false)
      return
    }
    const t = e.target as HTMLElement
    if (t.classList.contains("tab") && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
      // Only the tabs that are there (bug 10: Ask may be switched off)
      const tabs = this.tabs()
      const i = Math.max(0, tabs.indexOf(this.tab))
      const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length
      e.preventDefault()
      this.tab = tabs[n]
      this.render()
      ;(this.root.getElementById("tab-" + this.tab) as HTMLElement | null)?.focus()
    }
  }

  private seg(act: string, current: string, items: [string, string][], labelId: string, disabled = false) {
    return `<div class="seg" role="group" aria-labelledby="${labelId}">${items
      .map(([v, l]) => `<button type="button" data-act="${act}" data-v="${v}" id="${act}-${v}" aria-pressed="${current === v}"${disabled ? ' aria-disabled="true"' : ""}>${esc(l)}</button>`)
      .join("")}</div>`
  }

  private sw(id: string, title: string, hint: string, on: boolean) {
    return `<label class="row" for="${id}"><span><b>${esc(title)}</b><small>${esc(hint)}</small></span><input type="checkbox" role="switch" id="${id}" ${on ? "checked" : ""}></label>`
  }

  private render() {
    if (!this.state || !this.wrap || !this.styleEl) return
    const s = this.state
    const p = s.prefs
    const ui = this.uiCode()
    const w = (this.w = words(ui))
    const langName = LANG_NAMES[primary(s.pageLang)] ?? s.pageLang ?? "?"
    if (!this.tabs().includes(this.tab)) this.tab = "a11y"
    // Brand colour
    const accent = s.color && parseColor(s.color) ? s.color : "#2F43C4"
    this.style.setProperty("--accent", accent)
    this.style.setProperty("--on-accent", onColor(accent))
    // The panel follows the visitor's choice (bugs 15, 23)
    const deviceDark = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches
    const mode = p.theme === "high-contrast" ? "hc" : p.dark === "on" || (p.dark === "device" && deviceDark) ? "dark" : ""
    this.wrap.className = "wrap" + (mode ? " " + mode : "")
    const title = s.title || w.title
    const notice = s.notice ? `<div class="notice">${esc(s.notice)}</div>` : ""
    let body = ""
    if (this.tab === "a11y") {
      const r = s.report
      body = `
        ${notice}
        <button type="button" class="btn" data-act="skip" id="skip">${esc(w.skipMain)}</button>
        <div><span class="label" id="lvl">${esc(w.level)}</span>${this.seg("level", p.level, [["off", w.levelOff], ["AA", "AA"], ["AAA", "AAA"]], "lvl")}</div>
        ${this.sw("contrast", w.contrastFix, w.contrastHint, s.contrastFix)}
        ${this.sw("motion", w.motion, w.motionHint, p.reduceMotion === "on")}
        ${this.sw("focus", w.focus, w.focusHint, p.focusRing)}
        ${this.sw("spacing", w.spacing, w.spacingHint, p.spacing)}
        <div class="chip">${esc(w.pageLang)}: ${esc(langName)} (${esc(s.pageLang || "?")}) · ${esc(s.langDetected ? w.auto : w.fromPage)}</div>
        ${s.canSpeak ? `<button type="button" class="btn" data-act="read" id="read" aria-pressed="${s.reading}">${esc(s.reading ? w.stopReading : w.readPage)}</button>` : ""}
        <div><label class="label" for="uilang">${esc(w.language)}</label><select id="uilang">
          ${([["auto", w.langAuto], ["en", "English"], ["te", "తెలుగు"], ["hi", "हिन्दी"]] as const).map(([v, l]) => `<option value="${v}"${s.uiLang === v ? " selected" : ""}>${esc(l)}</option>`).join("")}
        </select></div>
        ${r ? `<div><span class="label">${esc(w.report)}</span><div class="counts">
          <div><strong class="ok">${r.fixed.length}</strong><small>${esc(w.fixed)}</small></div>
          <div><strong class="warn">${r.check.length}</strong><small>${esc(w.check)}</small></div>
          <div><strong class="unk">${r.unknown.length}</strong><small>${esc(w.unknown)}</small></div></div></div>` : ""}`
    } else if (this.tab === "colours") {
      const th = (v: string, label: string, fg: string, bg: string) =>
        `<button type="button" data-act="theme" data-v="${v}" id="theme-${v}" aria-pressed="${p.theme === v}"><span class="sw" style="color:${fg};background:${bg}" aria-hidden="true">Aa</span><span class="name">${esc(label)}</span></button>`
      // Dark mode needs the Default theme and a page that is not dark already (bug 22)
      const darkBlocked = p.theme !== "default" || s.pageDark
      const darkNote = p.theme !== "default" ? w.darkWithTheme : s.pageDark ? w.alreadyDark : ""
      body = `
        <div><span class="label" id="thm">${esc(w.theme)}</span><div class="themes" role="group" aria-labelledby="thm">
          ${th("default", w.themeDefault, "#16181D", "#FFFFFF")}${th("high-contrast", w.themeHigh, "#FFFF00", "#000000")}${th("soft", w.themeSoft, "#3B2F1E", "#F4ECD8")}</div></div>
        <div><span class="label" id="drk">${esc(w.dark)}</span>${this.seg("dark", p.dark, [["off", w.off], ["on", w.on], ["device", w.device]], "drk", darkBlocked)}
          ${darkNote ? `<p class="hint" style="margin:6px 0 0">${esc(darkNote)}</p>` : ""}</div>
        <div><label class="label" for="size" id="size-label">${esc(w.textSize)}: ${p.textSize}%</label><input type="range" id="size" min="100" max="200" step="10" value="${p.textSize}"></div>
        <p class="hint">${esc(w.saved)}</p>`
    } else {
      body = `<p class="hint" style="margin:0">${esc(w.askHint)}</p>
        <button type="button" class="btn primary" data-act="ask" id="ask">${esc(w.ask)}</button>`
    }
    const tabs = this.tabs()
      .map((t) => {
        const label = t === "a11y" ? w.tabA11y : t === "colours" ? w.tabColours : w.tabAsk
        const sel = this.tab === t
        return `<button type="button" role="tab" class="tab" data-act="tab" data-v="${t}" id="tab-${t}" aria-selected="${sel}" aria-controls="tabpanel" tabindex="${sel ? 0 : -1}">${esc(label)}</button>`
      })
      .join("")
    // lang = the language of the words shown, not of the page (bugs 9, 16)
    this.wrap.innerHTML = `
      <div class="panel" id="panel" role="dialog" aria-labelledby="ttl" ${this.open ? "" : "hidden"} lang="${ui}">
        <div class="head"><h2 id="ttl">${esc(title)}</h2><button type="button" class="icon" data-act="close" aria-label="${esc(w.close)}">${ICON_X}</button></div>
        <div class="tabs" role="tablist" aria-label="${esc(title)}">${tabs}</div>
        <div class="body" role="tabpanel" id="tabpanel" aria-labelledby="tab-${this.tab}">${body}</div>
        <div class="foot"><button type="button" class="btn" data-act="reset" id="reset">${esc(w.reset)}</button></div>
      </div>
      <button type="button" class="launch" data-act="launch" aria-label="${esc(s.title ? `${s.title}: ${w.open}` : w.open)}" aria-expanded="${this.open}" aria-controls="panel" lang="${ui}">${ICON_A11Y}</button>`
  }
}

export function defineAssistant() {
  if (typeof customElements !== "undefined" && !customElements.get("yuktai-assistant")) customElements.define("yuktai-assistant", YuktaiAssistantElement)
}
