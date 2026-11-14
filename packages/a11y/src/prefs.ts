// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/prefs.ts
// What a visitor chooses for themselves: text size, spacing, motion, focus
// ring, colour theme, dark mode. Applied as ONE <style> element YuktAI owns,
// so removing it puts the page back exactly as it was. "device" follows the
// operating system setting (prefers-reduced-motion, prefers-color-scheme).
// ─────────────────────────────────────────────────────────────────────────────

import { DARK_STYLE_ID, disableDark, enableDark } from "./darkmode"
import { contrastRatio, luminance, nearestPassingColor, parseColor, requiredRatio, toHex, type Level } from "./contrast"

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
export function prefsCss(p: Prefs, page: { alreadyDark?: boolean } = {}): string {
  const css: string[] = []
  const size = Math.min(200, Math.max(100, Math.round(p.textSize || 100)))
  // v6.0.1: zoom, not html font-size, so sites sized in px grow too (bug 5)
  if (size !== 100) css.push(`body>*:not([data-yuktai-ui]){zoom:${size / 100} !important}`)
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

  // Dark mode is not CSS any more (v6.0.2): see darkmode.ts and applyPrefs.
  void page
  return css.join("\n")
}

/** Should smart dark mode be on for these preferences on this page? (exported for tests) */
export function wantsDark(p: Prefs, page: { alreadyDark?: boolean; deviceDark?: boolean } = {}): boolean {
  // Only with the Default theme (the others set their own colours), and never
  // on a page that is already dark: that would make it light (bugs 20, 21).
  if (p.theme !== "default" || page.alreadyDark) return false
  return p.dark === "on" || (p.dark === "device" && !!page.deviceDark)
}

const deviceWatch = new WeakMap<Document, { mql: MediaQueryList; on: () => void }>()

/** Applies preferences to the page (replacing earlier ones). */
export function applyPrefs(doc: Document, p: Prefs): void {
  const css = prefsCss(p)
  let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!css) style?.remove()
  else {
    if (!style) {
      style = doc.createElement("style")
      style.id = STYLE_ID
      style.setAttribute("data-yuktai-ui", "")
      ;(doc.head ?? doc.documentElement).appendChild(style)
    }
    style.textContent = css
  }
  // Smart dark mode
  const win = doc.defaultView
  const mql = win && typeof win.matchMedia === "function" ? win.matchMedia("(prefers-color-scheme: dark)") : null
  const old = deviceWatch.get(doc)
  if (old) {
    old.mql.removeEventListener?.("change", old.on)
    deviceWatch.delete(doc)
  }
  if (p.dark === "device" && mql) {
    // Follow the device when it switches between light and dark
    const on = () => applyPrefs(doc, p)
    mql.addEventListener?.("change", on)
    deviceWatch.set(doc, { mql, on })
  }
  if (wantsDark(p, { alreadyDark: pageIsDark(doc), deviceDark: !!mql?.matches })) enableDark(doc, p.level)
  else disableDark(doc)
}

/**
 * True when the page shows itself dark already: its own dark colour scheme is
 * on, or the page background is dark. Read with YuktAI's own style removed,
 * so our dark mode does not count.
 */
export function pageIsDark(doc: Document): boolean {
  const win = doc.defaultView
  if (!win) return false
  // Read with YuktAI's own styles off, so our dark mode does not count
  const ours = [STYLE_ID, DARK_STYLE_ID].map((id) => doc.getElementById(id) as HTMLStyleElement | null).filter((s): s is HTMLStyleElement => !!s)
  const saved = ours.map((s) => s.disabled)
  ours.forEach((s) => (s.disabled = true))
  try {
    for (const el of [doc.body, doc.documentElement]) {
      if (!el) continue
      const bg = parseColor(win.getComputedStyle(el).backgroundColor)
      if (bg && bg.a > 0.5) return luminance(bg) < 0.2
    }
    return false
  } finally {
    ours.forEach((s, i) => (s.disabled = saved[i]))
  }
}

/** Takes every preference off the page. */
export function clearPrefs(doc: Document): void {
  doc.getElementById(STYLE_ID)?.remove()
  disableDark(doc)
  const w = deviceWatch.get(doc)
  if (w) {
    w.mql.removeEventListener?.("change", w.on)
    deviceWatch.delete(doc)
  }
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
