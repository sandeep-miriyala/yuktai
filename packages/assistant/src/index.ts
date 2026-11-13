// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/assistant — YuktAI Assistant: web accessibility + Ask this page.
//
//   import { mountAssistant } from "@yuktishaalaa/assistant"
//   const assistant = mountAssistant({ features: ["ask", "a11y"], level: "AA" })
//   assistant.destroy()   // takes everything off the page
//
// Runs in the browser only. Settings stay on the device (localStorage).
// ─────────────────────────────────────────────────────────────────────────────

import { canSpeak, createA11y, loadPrefs, pageLanguage, savePrefs, speak, DEFAULT_PREFS, type A11y, type Prefs, type Report, type Speaker } from "@yuktishaalaa/a11y"
import { mountAskPage } from "@yuktishaalaa/ask-page"
import { defineAssistant, YuktaiAssistantElement } from "./panel"
import { words } from "./i18n"

export const VERSION = "6.0.0"

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
  const lang = () => document.documentElement.lang || pageLanguage(document).detected?.lang || "en"
  let speaker: Speaker | null = null

  el.state = { prefs, contrastFix, pageLang: lang(), report: null, reading: false, canSpeak: canSpeak(), ask: !!askEl }
  el.handlers = {
    onPrefs(p) {
      Object.assign(prefs, p)
      savePrefs(prefs, key + ":prefs")
      if (p.level !== undefined) start()
      else a11y?.setPrefs(prefs)
      el.update({ prefs: { ...prefs } })
    },
    onContrastFix(on) {
      contrastFix = on
      saveFlag(key + ":contrastFix", on)
      start()
      el.update({ contrastFix: on })
    },
    onRead() {
      if (speaker) {
        speaker.stop()
        speaker = null
        el.update({ reading: false })
        return
      }
      const main = document.querySelector("main,[role=main],article") ?? document.body
      speaker = speak(main, {
        onMissingVoice: (l) => el.announce(`${words(lang()).noVoice} ${l}`),
        onEnd: () => {
          speaker = null
          el.update({ reading: false })
        },
      })
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
      el.update({ prefs: { ...prefs }, contrastFix })
    },
  }
  parent.appendChild(el)
  start()
  el.update({ pageLang: lang(), report: a11y ? (a11y as A11y).report : null })

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
function saveFlag(k: string, on: boolean) {
  try {
    globalThis.localStorage?.setItem(k, on ? "1" : "0")
  } catch {
    /* blocked storage */
  }
}

export { YuktaiAssistantElement, defineAssistant } from "./panel"
