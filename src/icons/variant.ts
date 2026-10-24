// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/icons/variant.ts
//
// Two icon variants, shared by React and the vanilla build:
//
//   outline (default)  line icon in the current text colour
//   filled             the same icon in a solid circle or rounded square
//
// WCAG rules built in:
//   1.1.1  Non-text content: `label` gives role="img" + aria-label;
//          without a label the icon is decorative (aria-hidden).
//   1.4.11 Non-text contrast: the filled variant picks a glyph colour with at
//          least 3:1 against its background (and warns if a custom one fails).
//   1.4.1  Use of colour: icons are shapes first; colour is never the only cue.
//   Windows High Contrast / forced colours: outline uses currentColor, and
//          filled switches to system colours (CanvasText / Canvas).
// ─────────────────────────────────────────────────────────────────────────────

import { contrastRatio, parseColor } from "../agentic/dom"
import { ICON_PATHS, type IconName } from "./paths"

export type IconVariant = "outline" | "filled"
export type IconShape = "circle" | "rounded"

/** WCAG 1.4.11 minimum for graphical objects. */
export const ICON_MIN_CONTRAST = 3

export interface IconColourOptions {
  variant?: IconVariant
  /** outline: the line colour · filled: the background colour. Default currentColor. */
  color?: string
  /** filled only: the glyph colour. Default: white or near-black, whichever contrasts more. */
  glyphColor?: string
  /** filled only: background shape. Default "rounded". */
  shape?: IconShape
}

const WHITE = "#ffffff"
const INK = "#111827"

/** Contrast between two colours, or null when either is not a hex/rgb() value (e.g. currentColor). */
export function iconContrast(fg: string, bg: string): number | null {
  const a = parseColor(fg)
  const b = parseColor(bg)
  return a && b ? contrastRatio(a, b) : null
}

/** Best glyph colour (white or near-black) for a filled background. */
export function pickGlyphColor(background: string): string {
  const white = iconContrast(WHITE, background)
  const ink = iconContrast(INK, background)
  if (white === null || ink === null) return WHITE // currentColor etc.: text colours are dark by default
  return white >= ink ? WHITE : INK
}

const warned = new Set<string>()
function warnOnce(key: string, message: string) {
  if (warned.has(key)) return
  warned.add(key)
  if (typeof console !== "undefined") console.warn(`[yuktai icons] ${message}`)
}

/** Resolved colours for one icon, plus a contrast check (WCAG 1.4.11). */
export function resolveIconColours(options: IconColourOptions = {}) {
  const variant: IconVariant = options.variant === "filled" ? "filled" : "outline"
  const color = options.color || "currentColor"
  if (variant === "outline") return { variant, color, glyph: color, contrast: null as number | null }
  const glyph = options.glyphColor || pickGlyphColor(color)
  const contrast = iconContrast(glyph, color)
  if (contrast !== null && contrast < ICON_MIN_CONTRAST) {
    warnOnce(`${glyph}|${color}`, `glyph ${glyph} on ${color} is ${contrast}:1. WCAG 1.4.11 needs at least 3:1 for icons.`)
  }
  return { variant, color, glyph, contrast }
}

/** Glyph area inside the filled background (70% of the 24×24 box, centred). */
export const FILLED_GLYPH_TRANSFORM = "translate(3.6 3.6) scale(0.7)"

/** Forced-colours rules for the filled variant (kept inside the SVG). */
export const FORCED_COLORS_CSS =
  "@media (forced-colors: active){.yi-bg{fill:CanvasText}.yi-glyph{stroke:Canvas}}"

const escAttr = (v: string | number) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string)

export interface IconSvgOptions extends IconColourOptions {
  size?: number | string
  strokeWidth?: number
  /** Accessible name. Omit for decorative icons. */
  label?: string
}

/** SVG markup for any icon (used by the vanilla build: yuktai.icon). */
export function iconSvg(name: IconName | string, options: IconSvgOptions = {}): string {
  const paths = (ICON_PATHS as Record<string, string>)[name] ?? ICON_PATHS.spark
  const size = options.size ?? 20
  const { variant, color, glyph } = resolveIconColours(options)
  const sw = options.strokeWidth ?? (variant === "filled" ? 2.4 : 1.9)
  const a11y = options.label
    ? `role="img" aria-label="${escAttr(options.label)}"`
    : 'aria-hidden="true"'
  const open = `<svg xmlns="http://www.w3.org/2000/svg" ${a11y} focusable="false" width="${escAttr(size)}" height="${escAttr(size)}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" data-variant="${variant}">`
  if (variant === "outline") {
    return `${open}<g stroke="${escAttr(color)}" stroke-width="${sw}">${paths}</g></svg>`
  }
  const bg =
    options.shape === "circle"
      ? `<circle class="yi-bg" cx="12" cy="12" r="12" fill="${escAttr(color)}"/>`
      : `<rect class="yi-bg" width="24" height="24" rx="6" fill="${escAttr(color)}"/>`
  return `${open}<style>${FORCED_COLORS_CSS}</style>${bg}<g class="yi-glyph" stroke="${escAttr(glyph)}" stroke-width="${sw}" transform="${FILLED_GLYPH_TRANSFORM}">${paths}</g></svg>`
}
