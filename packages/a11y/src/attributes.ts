// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/attributes.ts
// Settings from HTML attributes, so no code is needed:
//
//   <body data-yuktai-a11y="auto" data-yuktai-level="AA" data-yuktai-contrast="check">
//
//   data-yuktai-a11y      auto | check | off   (default auto)
//   data-yuktai-level     AA | AAA | off       (default AA)
//   data-yuktai-contrast  check | fix          (default check)
//   data-yuktai-lang      auto | off           (default auto: add missing lang)
//   data-yuktai-speak     on | off             (🔊 buttons on headings; default off)
//
// The first of <body>, <html> that has an attribute wins. Any element can
// switch YuktAI off for itself and its children with data-yuktai-a11y="off".
// ─────────────────────────────────────────────────────────────────────────────

import type { Level } from "./contrast"

export interface A11ySettings {
  mode: "auto" | "check" | "off"
  level: Level
  contrast: "check" | "fix"
  lang: "auto" | "off"
  speak: "on" | "off"
}

export const DEFAULT_SETTINGS: A11ySettings = { mode: "auto", level: "AA", contrast: "check", lang: "auto", speak: "off" }

function pick<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: T): T {
  const v = (value ?? "").trim()
  const hit = allowed.find((a) => a.toLowerCase() === v.toLowerCase())
  return hit ?? fallback
}

/** True when the page asks for YuktAI accessibility through attributes. */
export function hasAttributes(doc: Document): boolean {
  return [doc.body, doc.documentElement].some((el) => el && Array.from(el.attributes).some((a) => a.name.startsWith("data-yuktai-")))
}

export function readAttributes(doc: Document, base: Partial<A11ySettings> = {}): A11ySettings {
  const get = (name: string) => doc.body?.getAttribute(name) ?? doc.documentElement.getAttribute(name)
  const s = { ...DEFAULT_SETTINGS, ...base }
  return {
    mode: pick(get("data-yuktai-a11y"), ["auto", "check", "off"] as const, s.mode),
    level: pick(get("data-yuktai-level"), ["AA", "AAA", "off"] as const, s.level),
    contrast: pick(get("data-yuktai-contrast"), ["check", "fix"] as const, s.contrast),
    lang: pick(get("data-yuktai-lang"), ["auto", "off"] as const, s.lang),
    speak: pick(get("data-yuktai-speak"), ["on", "off"] as const, s.speak),
  }
}
