// ─────────────────────────────────────────────────────────────────────────────
// Idea 4 — Voice-Driven Accessibility Assistant
// Turns spoken commands ("turn on high contrast", "bigger text",
// "next row", "పెద్ద అక్షరాలు") into accessibility settings and grid
// navigation. Adds to the existing voice navigation in core/ai/voice.ts.
// Uses the browser's Web Speech API only — no cloud service.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import { wcagPlugin, type A11yConfig, type ColorBlindMode } from "../core/renderer"
import { isBrowser } from "./dom"

export type GridNavAction = "next-row" | "previous-row" | "first-row" | "last-row" | "open-row"

export type VoiceA11yCommand =
  | { type: "setting"; patch: Partial<A11yConfig>; say: string }
  | { type: "reset"; say: string }
  | { type: "grid"; action: GridNavAction; say: string }

const OFF = /\b(off|disable|stop|remove|no more|turn off|switch off|deactivate)\b|ఆఫ్|ఆపు|తీసివేయి|बंद/i

interface Toggle {
  pattern: RegExp
  key: "highContrast" | "darkMode" | "reduceMotion" | "largeTargets" | "dyslexiaFont" | "speechEnabled" | "showSkipLinks"
  name: string
}

const TOGGLES: Toggle[] = [
  { pattern: /high contrast|contrast|హై కాంట్రాస్ట్|కాంట్రాస్ట్/i, key: "highContrast", name: "High contrast" },
  { pattern: /dark mode|dark theme|night mode|డార్క్ మోడ్|చీకటి/i, key: "darkMode", name: "Dark mode" },
  { pattern: /reduce motion|less motion|stop animation|animations?|కదలికలు/i, key: "reduceMotion", name: "Reduced motion" },
  { pattern: /large targets?|bigger buttons?|big buttons?|larger buttons?|పెద్ద బటన్/i, key: "largeTargets", name: "Large targets" },
  { pattern: /dyslexia|readable font|easy font/i, key: "dyslexiaFont", name: "Dyslexia-friendly font" },
  { pattern: /speak on focus|read aloud|read out|screen reader|speech|చదివి వినిపించు/i, key: "speechEnabled", name: "Speak on focus" },
  { pattern: /skip links?/i, key: "showSkipLinks", name: "Skip links" },
]

const COLOR_MODES: Array<[RegExp, ColorBlindMode]> = [
  [/deuteranop|green.?blind/i, "deuteranopia"],
  [/protanop|red.?blind/i, "protanopia"],
  [/tritanop|blue.?blind/i, "tritanopia"],
  [/grey ?scale|gray ?scale|achromat|black and white/i, "achromatopsia"],
]

export const FONT_STEP = 0.1
export const FONT_MIN = 0.8
export const FONT_MAX = 1.3

/**
 * Parses a transcript into a command. `current` is needed for relative
 * changes such as "bigger text". Returns null when nothing matched, so you
 * can pass the transcript on to other handlers (e.g. core/ai/voice.ts).
 */
export function parseVoiceA11yCommand(transcript: string, current: Partial<A11yConfig> = {}): VoiceA11yCommand | null {
  const t = transcript.trim().toLowerCase()
  if (!t) return null

  // Grid navigation
  if (/\b(next|down)\s+(row|line|record|item)\b|తర్వాతి (వరుస|అంశం)/.test(t)) return { type: "grid", action: "next-row", say: "Next row." }
  if (/\b(previous|prev|back|up)\s+(row|line|record|item)\b|ముందరి (వరుస|అంశం)|వెనుక (వరుస|అంశం)/.test(t)) return { type: "grid", action: "previous-row", say: "Previous row." }
  if (/\bfirst\s+(row|record|item)\b|మొదటి (వరుస|అంశం)/.test(t)) return { type: "grid", action: "first-row", say: "First row." }
  if (/\blast\s+(row|record|item)\b|చివరి (వరుస|అంశం)/.test(t)) return { type: "grid", action: "last-row", say: "Last row." }
  if (/\b(open|expand|read)\s+(this\s+)?(row|record|item)\b|ఈ (వరుస|అంశం) తెరువు/.test(t)) return { type: "grid", action: "open-row", say: "Opening row." }

  // Reset
  if (/\b(reset|default|restore)\b.*\b(settings?|accessibility|everything|all)\b|^reset$|రీసెట్/.test(t)) {
    return { type: "reset", say: "Accessibility settings reset." }
  }

  // Text size
  const multiplier = current.fontSizeMultiplier ?? 1
  const clamp = (n: number) => Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, n)) * 100) / 100
  if (/\b(bigger|larger|increase|zoom in)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(bigger|larger|up)\b|పెద్ద అక్షరాలు|అక్షరాలు పెద్ద/.test(t)) {
    const next = clamp(multiplier + FONT_STEP)
    return { type: "setting", patch: { fontSizeMultiplier: next }, say: `Text size ${Math.round(next * 100)}%.` }
  }
  if (/\b(smaller|decrease|reduce|zoom out)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(smaller|down)\b|చిన్న అక్షరాలు|అక్షరాలు చిన్న/.test(t)) {
    const next = clamp(multiplier - FONT_STEP)
    return { type: "setting", patch: { fontSizeMultiplier: next }, say: `Text size ${Math.round(next * 100)}%.` }
  }
  if (/\b(normal|default|reset)\b.*\b(text|font)\s*(size)?\b/.test(t)) {
    return { type: "setting", patch: { fontSizeMultiplier: 1 }, say: "Text size 100%." }
  }

  const off = OFF.test(t)

  // Colour-blind modes
  for (const [pattern, mode] of COLOR_MODES) {
    if (pattern.test(t)) {
      return off
        ? { type: "setting", patch: { colorBlindMode: "none" }, say: "Colour filter off." }
        : { type: "setting", patch: { colorBlindMode: mode }, say: `${mode} filter on.` }
    }
  }
  if (/colou?r.?blind/.test(t) && off) return { type: "setting", patch: { colorBlindMode: "none" }, say: "Colour filter off." }

  // On/off toggles. "toggle X" flips the current value.
  for (const toggle of TOGGLES) {
    if (!toggle.pattern.test(t)) continue
    let value = /\btoggle\b/.test(t) ? !current[toggle.key] : !off
    // "stop animations" / "no animations" means reduced motion ON
    if (toggle.key === "reduceMotion" && !/reduce motion|less motion|కదలికలు తగ్గించు/.test(t) && /animations?/.test(t)) {
      value = off || /\bno\b/.test(t)
    }
    return { type: "setting", patch: { [toggle.key]: value } as Partial<A11yConfig>, say: `${toggle.name} ${value ? "on" : "off"}.` }
  }
  return null
}

export const DEFAULT_A11Y_SETTINGS: Partial<A11yConfig> = {
  highContrast: false,
  darkMode: false,
  reduceMotion: false,
  largeTargets: false,
  dyslexiaFont: false,
  speechEnabled: false,
  colorBlindMode: "none",
  fontSizeMultiplier: 1,
}

// ── Grid row navigation (works with YuktaiGrid rows: [data-yuktai-row-id]) ──

export function moveGridRowFocus(action: GridNavAction, options: { root?: ParentNode; rowSelector?: string } = {}): HTMLElement | null {
  if (!isBrowser()) return null
  const root = options.root ?? document
  const selector = options.rowSelector ?? "[data-yuktai-row-id], [role='row']"
  // Header rows are not data rows
  const rows = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((r) => !r.querySelector("th,[role='columnheader']"))
  if (!rows.length) return null
  const active = document.activeElement?.closest<HTMLElement>(selector)
  const index = active ? rows.indexOf(active) : -1

  if (action === "open-row") {
    const row = index >= 0 ? rows[index] : rows[0]
    row.click()
    return row
  }
  const nextIndex =
    action === "first-row" ? 0 : action === "last-row" ? rows.length - 1 : action === "next-row" ? Math.min(rows.length - 1, index + 1) : Math.max(0, index - 1)
  const row = rows[nextIndex]
  if (!row.hasAttribute("tabindex")) row.setAttribute("tabindex", "-1")
  row.focus()
  row.scrollIntoView?.({ block: "nearest" })
  return row
}

// ── Controller: listen → parse → apply → speak ─────────────────────────────

export interface VoiceA11yControllerOptions {
  /** Current settings; the controller keeps its own copy after each change. */
  initial?: Partial<A11yConfig>
  /**
   * Apply new settings. Default: yuktai's wcagPlugin.execute.
   * Pass your own to sync with WidgetPanel state or a settings store.
   */
  apply?: (config: A11yConfig) => unknown
  /** Speech recognition language, e.g. "en-IN" or "te-IN" (default "en-IN"). */
  lang?: string
  /** Speak a confirmation after each command (default true). */
  speak?: boolean
  /** Called for every recognised transcript, matched or not. */
  onTranscript?: (text: string, command: VoiceA11yCommand | null) => void
  gridRoot?: ParentNode
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  start(): void
  stop(): void
}

export function createVoiceA11yController(options: VoiceA11yControllerOptions = {}) {
  let config: A11yConfig = { enabled: true, ...DEFAULT_A11Y_SETTINGS, ...options.initial } as A11yConfig
  let recognition: SpeechRecognitionLike | null = null
  let listening = false

  const apply = async (next: A11yConfig) => {
    if (options.apply) return options.apply(next)
    return wcagPlugin.execute(next)
  }

  const say = (text: string) => {
    if (options.speak === false || !isBrowser() || !("speechSynthesis" in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang ?? "en-IN"
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  async function handle(transcript: string): Promise<VoiceA11yCommand | null> {
    const command = parseVoiceA11yCommand(transcript, config)
    options.onTranscript?.(transcript, command)
    if (!command) return null
    if (command.type === "grid") {
      const row = moveGridRowFocus(command.action, { root: options.gridRoot })
      say(row ? command.say : "No table rows found.")
      return command
    }
    config = command.type === "reset" ? ({ ...config, ...DEFAULT_A11Y_SETTINGS } as A11yConfig) : ({ ...config, ...command.patch } as A11yConfig)
    await apply(config)
    say(command.say)
    return command
  }

  function start(): boolean {
    if (!isBrowser() || listening) return listening
    const Ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
    const Recognition = Ctor.SpeechRecognition ?? Ctor.webkitSpeechRecognition
    if (!Recognition) return false
    recognition = new Recognition()
    recognition.lang = options.lang ?? "en-IN"
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const results = event.results
      const last = results[results.length - 1]
      if (last?.[0]?.transcript) void handle(last[0].transcript)
    }
    recognition.onend = () => {
      // Browsers stop after silence; keep going until stop() is called.
      if (listening) recognition?.start()
    }
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") listening = false
    }
    listening = true
    recognition.start()
    return true
  }

  function stop() {
    listening = false
    recognition?.stop()
    recognition = null
  }

  return {
    start,
    stop,
    /** Run a command from text (also handy for typed commands and tests). */
    handle,
    isListening: () => listening,
    getConfig: () => ({ ...config }),
  }
}
