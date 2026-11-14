// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/assistant — YuktAI Assistant: web accessibility + Ask this page.
//
//   import { mountAssistant } from "@yuktishaalaa/assistant"
//   const assistant = mountAssistant({ features: ["ask", "a11y"], level: "AA" })
//   assistant.destroy()   // takes everything off the page
//
// Runs in the browser only. Settings stay on the device (localStorage).
// ─────────────────────────────────────────────────────────────────────────────

import { canSpeak, createA11y, loadPrefs, pageIsDark, pageLanguage, readTarget, savePrefs, speak, DEFAULT_PREFS, type A11y, type Prefs, type Report, type Speaker } from "@yuktishaalaa/a11y"
import { mountAskPage } from "@yuktishaalaa/ask-page"
import { defineAssistant, YuktaiAssistantElement, type PanelLang } from "./panel"
import { words } from "./i18n"

export const VERSION = "6.0.2"

export type Feature = "a11y" | "ask"

export interface AssistantConfig {
  /** What to turn on. Default ["a11y", "ask"]. */
  features?: Feature[]
  /** WCAG level the page is held to. Default "AA". Visitors can change it in the panel. */
  level?: "off" | "AA" | "AAA"
  /** "check" reports low contrast; "fix" darkens faint text. Default "check". */
  contrast?: "check" | "fix"
  /** "auto" applies safe fixes; "check" only reports. Default "auto". */
  mode?: "auto" | "check"
  /** Which side the ♿ button sits on. Default "right". */
  side?: "right" | "left"
  /** Options for Ask this page (same as YuktaiAskConfig). The Assistant's ♿ button opens it, so its own launcher is off. */
  ask?: Record<string, unknown>
  /** Show the ♿ launcher. Default true. */
  launcher?: boolean
  /** localStorage key for the visitor's choices. */
  storageKey?: string
  /** Panel title, e.g. your site's name. Default "YuktAI Assistant". */
  title?: string
  /** Brand colour for the button and selected items, e.g. "#B3261E". Text on it is picked for contrast. */
  color?: string
  /** Alt+Shift+Y opens and closes the panel. Default true. */
  shortcut?: boolean
}

export interface Assistant {
  readonly element: YuktaiAssistantElement
  readonly a11y: A11y | null
  readonly report: Report | null
  open(): void
  close(): void
  toggle(): void
  /** Opens Ask this page. */
  ask(): void
  destroy(): void
}

interface AskElement extends HTMLElement {
  toggle?: () => void
  openPanel?: () => void
}

export function mountAssistant(config: AssistantConfig = {}, parent: HTMLElement = document.body): Assistant {
  defineAssistant()
  const existing = document.querySelector("yuktai-assistant") as (YuktaiAssistantElement & { _assistant?: Assistant }) | null
  if (existing?._assistant) return existing._assistant

  const features = config.features ?? ["a11y", "ask"]
  const key = config.storageKey ?? "yuktai-assistant"
  const saved = loadPrefs(key + ":prefs")
  let contrastFix = loadFlag(key + ":contrastFix") ?? config.contrast === "fix"
  const prefs: Prefs = { ...DEFAULT_PREFS, ...saved, level: (saved.level ?? config.level ?? "AA") as Prefs["level"] }

  let a11y: A11y | null = null
  const start = () => {
    a11y?.destroy()
    if (!features.includes("a11y")) return null
    a11y = createA11y({ level: prefs.level, contrast: contrastFix ? "fix" : "check", mode: config.mode ?? "auto", onReport: (r) => el.update({ report: r }) })
    a11y.setPrefs(prefs)
    a11y.run()
    return a11y
  }

  let askEl: AskElement | null = null
  if (features.includes("ask")) {
    askEl = mountAskPage({ ...(config.ask ?? {}), launcher: false } as never) as AskElement
  }

  const el = document.createElement("yuktai-assistant") as YuktaiAssistantElement & { _assistant?: Assistant }
  if (config.side === "left") el.setAttribute("side", "left")
  if (config.launcher === false) el.style.display = "none"
  // Did the site say its language? (read before the engine may add lang itself)
  const declared = document.documentElement.lang
  const lang = () => document.documentElement.lang || pageLanguage(document).detected?.lang || "en"
  let uiLang = (loadText(key + ":uiLang") ?? "auto") as PanelLang
  let speaker: Speaker | null = null
  let readUrl = ""
  const stopReading = () => {
    speaker?.stop()
    speaker = null
    el.update({ reading: false })
  }
  const panelWords = () => words(uiLang !== "auto" ? uiLang : lang())
  const dark = () => {
    try {
      return pageIsDark(document)
    } catch {
      return false
    }
  }

  el.state = {
    prefs, contrastFix, pageLang: lang(), langDetected: !declared, report: null, reading: false, canSpeak: canSpeak(), ask: !!askEl,
    notice: "", uiLang, title: config.title, color: config.color, pageDark: false,
  }
  el.handlers = {
    onPrefs(p, live) {
      Object.assign(prefs, p)
      if (p.level !== undefined) start()
      else a11y?.setPrefs(prefs)
      // While the slider is dragged: apply only; save and redraw when it is let go.
      if (live) return
      savePrefs(prefs, key + ":prefs")
      el.update({ prefs: { ...prefs }, notice: "" })
    },
    onContrastFix(on) {
      contrastFix = on
      saveFlag(key + ":contrastFix", on)
      start()
      el.update({ contrastFix: on })
    },
    onRead() {
      if (speaker) return stopReading()
      el.update({ notice: "" })
      // <main>, else the biggest article, else the page without menus and footer
      const { el: target, skipChrome } = readTarget(document)
      let warned = false
      speaker = speak(target, {
        skipChrome,
        onMissingVoice: (l) => {
          const w = panelWords()
          el.announce(`${w.noVoice} ${l}`)
          if (!warned) el.update({ notice: `${w.noVoice} ${l}. ${w.noVoiceHelp}` })
          warned = true
        },
        onEnd: () => {
          speaker = null
          el.update({ reading: false })
        },
      })
      readUrl = location.href
      el.update({ reading: true })
    },
    onAsk() {
      el.toggle(false)
      if (askEl?.openPanel) askEl.openPanel()
      else askEl?.toggle?.()
    },
    onReset() {
      Object.assign(prefs, DEFAULT_PREFS, { level: config.level ?? "AA" })
      contrastFix = config.contrast === "fix"
      savePrefs(prefs, key + ":prefs")
      saveFlag(key + ":contrastFix", contrastFix)
      start()
      el.update({ prefs: { ...prefs }, contrastFix, notice: "" })
    },
    onSkipMain() {
      // <main> when there is one, else the article YuktAI would read, else the first heading
      const { el: target } = readTarget(document)
      const t = (document.querySelector("main,[role=main]") ??
        (target !== document.body ? target : document.querySelector("h1") ?? document.body)) as HTMLElement
      el.toggle(false)
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1")
      t.focus()
      t.scrollIntoView?.({ block: "start" })
    },
    onUiLang(l) {
      uiLang = l
      saveText(key + ":uiLang", l)
      el.update({ uiLang: l })
    },
  }

  // Alt+Shift+Y opens and closes the panel from anywhere on the page
  const onKey = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyY") {
      e.preventDefault()
      el.toggle()
    }
  }
  if (config.shortcut !== false) document.addEventListener("keydown", onKey)
  // Single-page apps: stop reading the old page when the address changes,
  // and pick up the new page's language.
  let lastUrl = location.href
  const watch = setInterval(() => {
    if (location.href === lastUrl) return
    lastUrl = location.href
    if (speaker && readUrl !== location.href) stopReading()
    el.update({ pageLang: lang(), pageDark: dark() })
  }, 700)
  // Ask closed: put focus back on the ♿ button
  const onAskClose = () => {
    if (el.style.display !== "none") el.focusLauncher()
  }
  askEl?.addEventListener("yuktai-ask-close", onAskClose)
  parent.appendChild(el)
  start()
  el.update({ pageLang: lang(), pageDark: dark(), report: a11y ? (a11y as A11y).report : null })

  const assistant: Assistant = {
    element: el,
    get a11y() {
      return a11y
    },
    get report() {
      return a11y ? (a11y as A11y).report : null
    },
    open: () => el.toggle(true),
    close: () => el.toggle(false),
    toggle: () => el.toggle(),
    ask: () => el.handlers.onAsk(),
    destroy() {
      speaker?.stop()
      clearInterval(watch)
      document.removeEventListener("keydown", onKey)
      askEl?.removeEventListener("yuktai-ask-close", onAskClose)
      a11y?.destroy()
      a11y = null
      askEl?.remove()
      el.remove()
    },
  }
  el._assistant = assistant
  return assistant
}

function loadFlag(k: string): boolean | null {
  try {
    const v = globalThis.localStorage?.getItem(k)
    return v === null || v === undefined ? null : v === "1"
  } catch {
    return null
  }
}
function loadText(k: string): string | null {
  try {
    return globalThis.localStorage?.getItem(k) ?? null
  } catch {
    return null
  }
}
function saveText(k: string, v: string) {
  try {
    globalThis.localStorage?.setItem(k, v)
  } catch {
    /* blocked storage */
  }
}
function saveFlag(k: string, on: boolean) {
  try {
    globalThis.localStorage?.setItem(k, on ? "1" : "0")
  } catch {
    /* blocked storage */
  }
}

export { YuktaiAssistantElement, defineAssistant, type PanelLang } from "./panel"
