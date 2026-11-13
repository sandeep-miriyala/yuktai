// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/contrast.ts
//
// Text contrast against WCAG 2.2 (1.4.3 AA, 1.4.6 AAA). The rule this file
// keeps: when a colour or background cannot be read for sure (an image or a
// gradient behind the text, a colour format we do not parse), the result is
// "unknown", never "pass".
// ─────────────────────────────────────────────────────────────────────────────

export type Level = "off" | "AA" | "AAA"

export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

export interface ContrastResult {
  status: "pass" | "fail" | "unknown"
  /** Contrast ratio, 1–21, when known. */
  ratio?: number
  /** Ratio the text needs at this level and size. */
  required?: number
  large?: boolean
  /** Why the result is unknown. */
  reason?: string
  fg?: RGBA
  bg?: RGBA
}

/** Parses rgb()/rgba() (as getComputedStyle returns), #rgb, #rrggbb, #rrggbbaa and "transparent". */
export function parseColor(value: string | null | undefined): RGBA | null {
  if (!value) return null
  const v = value.trim().toLowerCase()
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/)
  if (rgb) {
    let a = 1
    if (rgb[4] !== undefined) a = rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4])
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a }
  }
  const hex = v.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("")
    if (h.length !== 6 && h.length !== 8) return null
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    }
  }
  return null
}

const channel = (v: number) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance. */
export function luminance(c: RGBA): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b)
}

export function contrastRatio(a: RGBA, b: RGBA): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/** Puts `top` (with alpha) over an opaque `bottom`. */
export function blend(top: RGBA, bottom: RGBA): RGBA {
  const a = top.a
  return {
    r: Math.round(top.r * a + bottom.r * (1 - a)),
    g: Math.round(top.g * a + bottom.g * (1 - a)),
    b: Math.round(top.b * a + bottom.b * (1 - a)),
    a: 1,
  }
}

/** WCAG "large text": 24 px and up, or 18.66 px (14 pt) and up when bold. */
export function isLargeText(fontSizePx: number, fontWeight: number): boolean {
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700)
}

/** The ratio text must reach: AA 4.5 (large 3), AAA 7 (large 4.5). */
export function requiredRatio(level: Level, large: boolean): number {
  if (level === "AAA") return large ? 4.5 : 7
  return large ? 3 : 4.5
}

const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 }

/**
 * The colour actually behind an element: walks up the ancestors, blending
 * translucent backgrounds, until one is opaque. Returns null (unknown) when a
 * background image or gradient is on the way, because the pixels behind the
 * text then cannot be known from styles alone.
 */
export function effectiveBackground(el: Element): { color: RGBA | null; reason?: string } {
  const layers: RGBA[] = []
  let node: Element | null = el
  const win = el.ownerDocument?.defaultView
  if (!win) return { color: null, reason: "no-window" }
  while (node) {
    const cs = win.getComputedStyle(node)
    const image = cs.backgroundImage
    if (image && image !== "none" && image !== "initial") return { color: null, reason: "background-image" }
    const raw = cs.backgroundColor
    const c = raw && raw !== "initial" ? parseColor(raw) : null
    if (c === null && raw && raw !== "initial") return { color: null, reason: "colour-format" }
    if (c && c.a > 0) {
      layers.push(c)
      if (c.a >= 1) break
    }
    node = parentElementAcrossShadow(node)
  }
  // Nothing opaque found: the canvas is white unless the page says otherwise.
  let base = WHITE
  if (layers.length && layers[layers.length - 1].a >= 1) base = layers.pop()!
  for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base)
  return { color: base }
}

function parentElementAcrossShadow(node: Element): Element | null {
  if (node.parentElement) return node.parentElement
  const root = node.getRootNode() as ShadowRoot
  return root && (root as ShadowRoot).host ? (root as ShadowRoot).host : null
}

/** Checks one element's text colour against its background. */
export function checkElementContrast(el: Element, level: Level): ContrastResult {
  if (level === "off") return { status: "pass" }
  const win = el.ownerDocument?.defaultView
  if (!win) return { status: "unknown", reason: "no-window" }
  const cs = win.getComputedStyle(el)
  // Browsers resolve `color` on every element; some DOM shims leave it empty
  // when inherited, so walk up for it.
  let colorText = cs.color
  for (let n = el.parentElement; !colorText && n; n = n.parentElement) colorText = win.getComputedStyle(n).color
  const fgRaw = colorText ? parseColor(colorText) : { r: 0, g: 0, b: 0, a: 1 }
  if (!fgRaw) return { status: "unknown", reason: "colour-format" }
  const bg = effectiveBackground(el)
  if (!bg.color) return { status: "unknown", reason: bg.reason }
  const fg = fgRaw.a < 1 ? blend(fgRaw, bg.color) : fgRaw
  const size = parseFloat(cs.fontSize) || 16
  const weight = parseInt(cs.fontWeight, 10) || (cs.fontWeight === "bold" ? 700 : 400)
  const large = isLargeText(size, weight)
  const required = requiredRatio(level, large)
  const ratio = Math.round(contrastRatio(fg, bg.color) * 100) / 100
  return { status: ratio + 1e-9 >= required ? "pass" : "fail", ratio, required, large, fg, bg: bg.color }
}

export const toHex = (c: RGBA) =>
  "#" + [c.r, c.g, c.b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")

/**
 * The closest colour to `fg` (same hue, darker or lighter) that reaches
 * `required` on `bg`. Moves towards black on light backgrounds and towards
 * white on dark ones; falls back to pure black or white.
 */
export function nearestPassingColor(fg: RGBA, bg: RGBA, required: number): RGBA {
  if (contrastRatio(fg, bg) >= required) return { ...fg, a: 1 }
  const towardsBlack = luminance(bg) > 0.18
  const target = towardsBlack ? { r: 0, g: 0, b: 0, a: 1 } : WHITE
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const c = {
      r: fg.r + (target.r - fg.r) * t,
      g: fg.g + (target.g - fg.g) * t,
      b: fg.b + (target.b - fg.b) * t,
      a: 1,
    }
    const rounded = { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b), a: 1 }
    if (contrastRatio(rounded, bg) >= required) return rounded
  }
  return contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, bg) >= contrastRatio(WHITE, bg) ? { r: 0, g: 0, b: 0, a: 1 } : WHITE
}
