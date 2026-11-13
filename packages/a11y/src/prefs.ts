// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/prefs.ts
// What a visitor chooses for themselves: text size, spacing, motion, focus
// ring, colour theme, dark mode. Applied as ONE <style> element YuktAI owns,
// so removing it puts the page back exactly as it was. "device" follows the
// operating system setting (prefers-reduced-motion, prefers-color-scheme).
// ─────────────────────────────────────────────────────────────────────────────

import { contrastRatio, nearestPassingColor, parseColor, requiredRatio, toHex, type Level } from "./contrast"

export type Tristate = "off" | "on" | "device"
export type Theme = "default" | "high-contrast" | "soft" | "custom"

export interface Prefs {
  /** 100–200 (%). */
  textSize: number
  /** WCAG 1.4.12 spacing: line 1.5, paragraphs 2×, letters 0.12em, words 0.16em. */
  spacing: boolean
  reduceMotion: Tristate
  focusRing: boolean
  theme: Theme
  /** For theme "custom": text and background (any CSS hex). The text is adjusted until it passes `level`. */
  custom?: { text: string; background: string }
  dark: Tristate
  level: Level
}

export const DEFAULT_PREFS: Prefs = {
  textSize: 100,
  spacing: false,
  reduceMotion: "device",
  focusRing: false,
  theme: "default",
  dark: "off",
  level: "AA",
}

const STYLE_ID = "yuktai-a11y-prefs"

/** The CSS for a set of preferences (exported for tests). */
export function prefsCss(p: Prefs): string {
  const css: string[] = []
  const size = Math.min(200, Math.max(100, Math.round(p.textSize || 100)))
  if (size !== 100) css.push(`html{font-size:${size}% !important}`)
  if (p.spacing) {
    css.push(
      `body *:not([data-yuktai-ui]):not([data-yuktai-ui] *){line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important}`,
      `body p:not([data-yuktai-ui] *){margin-bottom:2em !important}`
    )
  }
  const motion = `*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}`
  if (p.reduceMotion === "on") css.push(motion)
  if (p.reduceMotion === "device") css.push(`@media (prefers-reduced-motion: reduce){${motion}}`)
  if (p.focusRing) css.push(`:focus-visible{outline:3px solid #2F43C4 !important;outline-offset:2px !important;box-shadow:0 0 0 5px #FFFFFF !important}`)

  const notUi = `:not([data-yuktai-ui]):not([data-yuktai-ui] *)`
  if (p.theme === "high-contrast") {
    css.push(
      `html,body{background:#000 !important}`,
      `body *${notUi}{background-color:#000 !important;color:#FFF !important;border-color:#FFF !important}`,
      `body a${notUi},body a${notUi} *{color:#FFFF00 !important}`,
      `body button${notUi},body [role=button]${notUi}{color:#00FFFF !important}`
    )
  } else if (p.theme === "soft") {
    css.push(`html,body{background:#F4ECD8 !important}`, `body *${notUi}{background-color:transparent !important;color:#3B2F1E !important}`, `body a${notUi}{color:#1F4E9E !important}`)
  } else if (p.theme === "custom" && p.custom) {
    const bg = parseColor(p.custom.background)
    const fg = parseColor(p.custom.text)
    if (bg && fg) {
      const need = requiredRatio(p.level === "off" ? "AA" : p.level, false)
      const safe = contrastRatio(fg, bg) >= need ? fg : nearestPassingColor(fg, bg, need)
      css.push(`html,body{background:${toHex(bg)} !important}`, `body *${notUi}{background-color:transparent !important;color:${toHex(safe)} !important;border-color:${toHex(safe)} !important}`)
    }
  }

  const dark = `html{filter:invert(1) hue-rotate(180deg) !important;background:#FFF}img,video,picture,canvas,iframe,svg image,[style*="background-image"],[data-yuktai-ui]{filter:invert(1) hue-rotate(180deg) !important}`
  // Dark mode only when the theme does not already set colours.
  if (p.theme === "default") {
    if (p.dark === "on") css.push(dark)
    if (p.dark === "device") css.push(`@media (prefers-color-scheme: dark){${dark}}`)
  }
  return css.join("\n")
}

/** Applies preferences to the page (replacing earlier ones). */
export function applyPrefs(doc: Document, p: Prefs): void {
  const css = prefsCss(p)
  let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!css) {
    style?.remove()
    return
  }
  if (!style) {
    style = doc.createElement("style")
    style.id = STYLE_ID
    style.setAttribute("data-yuktai-ui", "")
    ;(doc.head ?? doc.documentElement).appendChild(style)
  }
  style.textContent = css
}

/** Takes every preference off the page. */
export function clearPrefs(doc: Document): void {
  doc.getElementById(STYLE_ID)?.remove()
}

/** Reads saved preferences; storage may be blocked, so this never throws. */
export function loadPrefs(key = "yuktai-a11y-prefs"): Prefs {
  try {
    const raw = globalThis.localStorage?.getItem(key)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    /* private mode or blocked storage */
  }
  return { ...DEFAULT_PREFS }
}

export function savePrefs(p: Prefs, key = "yuktai-a11y-prefs"): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}
