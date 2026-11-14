// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/darkmode.ts (v6.0.2)
//
// Smart dark mode. 6.0.0 turned the whole page upside down with
// `filter: invert(1)`: photos, videos, emoji, logos and background images came
// out wrong, an image inside <picture> was inverted three times, and long pages
// scrolled slowly. Here every colour is changed on its own instead:
//
//   • backgrounds get darker, text and icons get lighter, the hue is kept
//     (a blue button stays blue);
//   • text is checked against the new background and moved until it passes
//     the visitor's WCAG level (AA 4.5:1, AAA 7:1), the same rule the
//     contrast engine uses;
//   • photos, videos, canvases and iframes are left as they are; text on a
//     background picture keeps its own colour (we cannot see the picture);
//   • gradients become their first colour, made dark;
//   • new content (single-page apps, "load more") is darkened as it arrives.
//
// Nothing is written into the page's own `style` attributes: each element gets
// one data-yuktai-dk attribute and YuktAI's own <style> holds the colours, so
// turning dark mode off removes both and the page is back exactly as it was.
// ─────────────────────────────────────────────────────────────────────────────

import { blend, contrastRatio, isLargeText, nearestPassingColor, parseColor, requiredRatio, toHex, type Level, type RGBA } from "./contrast"

export const DARK_STYLE_ID = "yuktai-a11y-dark"
const ATTR = "data-yuktai-dk"
const MAX_ELEMENTS = 25000

const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "HEAD", "META", "LINK", "TITLE", "BR", "WBR"])
/** Pictures and players: never recoloured. */
const MEDIA = new Set(["IMG", "PICTURE", "VIDEO", "CANVAS", "IFRAME", "OBJECT", "EMBED", "AUDIO"])
const SVG_NS = "http://www.w3.org/2000/svg"

interface Hsl {
  h: number
  s: number
  l: number
}

function toHsl({ r, g, b }: RGBA): Hsl {
  const R = r / 255, G = g / 255, B = b / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  return { h: h / 6, s, l }
}

function fromHsl({ h, s, l }: Hsl, a: number): RGBA {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255, a }
}

/** A light background becomes dark (white → #1A1A1A-ish); dark ones stay. */
export function darkBackground(c: RGBA): RGBA {
  const hsl = toHsl(c)
  if (hsl.l <= 0.45) return c
  return fromHsl({ h: hsl.h, s: hsl.s * 0.75, l: 0.1 + (1 - hsl.l) * 0.3 }, c.a)
}

/** Dark text becomes light (black → #EBEBEB-ish); light text stays. */
export function lightText(c: RGBA): RGBA {
  const hsl = toHsl(c)
  if (hsl.l >= 0.55) return c
  return fromHsl({ h: hsl.h, s: hsl.s, l: 0.92 - hsl.l * 0.35 }, c.a)
}

function darkBorder(c: RGBA): RGBA {
  const hsl = toHsl(c)
  if (hsl.l <= 0.5) return lightText(c)
  return fromHsl({ h: hsl.h, s: hsl.s * 0.6, l: 0.22 + (1 - hsl.l) * 0.3 }, c.a)
}

const css = (c: RGBA) => (c.a >= 1 ? toHex(c) : `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${+c.a.toFixed(3)})`)
const same = (a: RGBA | null, b: RGBA | null) => !!a && !!b && Math.round(a.r) === Math.round(b.r) && Math.round(a.g) === Math.round(b.g) && Math.round(a.b) === Math.round(b.b) && Math.abs(a.a - b.a) < 0.01

/** What we know about an element after reading it (its page colours and what we gave it). */
interface Info {
  /** The page's own text colour. */
  fg: RGBA | null
  /** The text colour it shows in dark mode (ours or inherited). */
  shown: RGBA | null
  /** The background behind it in dark mode. */
  bg: RGBA
  /** A background picture is behind it: its text keeps the page's colour. */
  picture: boolean
}

interface State {
  level: Level
  info: WeakMap<Element, Info>
  rules: Map<string, number>
  observer: MutationObserver | null
  pending: Set<Element>
  timer: ReturnType<typeof setTimeout> | null
}

const states = new WeakMap<Document, State>()

export function isDarkOn(doc: Document): boolean {
  return states.has(doc)
}

/** Turns smart dark mode on (or re-reads the page with a new level). */
export function enableDark(doc: Document, level: Level = "AA"): void {
  const win = doc.defaultView
  if (!win || !doc.body) return
  let st = states.get(doc)
  if (st && st.level === level) return
  if (st) disableDark(doc)
  st = { level, info: new WeakMap(), rules: new Map(), observer: null, pending: new Set(), timer: null }
  states.set(doc, st)
  const style = doc.createElement("style")
  style.id = DARK_STYLE_ID
  style.setAttribute("data-yuktai-ui", "")
  ;(doc.head ?? doc.documentElement).appendChild(style)
  paint(doc, st, [doc.documentElement])
  // New content: darken it as it arrives (batched, at most every 150 ms)
  if (typeof win.MutationObserver === "function") {
    st.observer = new win.MutationObserver((records) => {
      const s = states.get(doc)
      if (!s) return
      for (const r of records) {
        if (r.type === "childList") r.addedNodes.forEach((n) => n.nodeType === 1 && !isOurs(n as Element) && s.pending.add(n as Element))
        else if (r.target.nodeType === 1 && !isOurs(r.target as Element)) s.pending.add(r.target as Element)
      }
      if (s.pending.size && !s.timer) {
        s.timer = setTimeout(() => {
          s.timer = null
          const list = [...s.pending].filter((e) => e.isConnected)
          s.pending.clear()
          if (list.length) paint(doc, s, list)
        }, 150)
      }
    })
    st.observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] })
  }
}

/** Turns smart dark mode off and leaves the page exactly as it was. */
export function disableDark(doc: Document): void {
  const st = states.get(doc)
  if (!st) return
  st.observer?.disconnect()
  if (st.timer) clearTimeout(st.timer)
  states.delete(doc)
  doc.getElementById(DARK_STYLE_ID)?.remove()
  doc.querySelectorAll(`[${ATTR}]`).forEach((e) => e.removeAttribute(ATTR))
}

const isOurs = (el: Element) => !!el.closest?.("[data-yuktai-ui]")

/**
 * Reads the page's own colours for `roots` (with our dark style switched off
 * for the read, inside one task, so nothing flashes), then gives each element
 * its dark colours.
 */
function paint(doc: Document, st: State, roots: Element[]): void {
  const win = doc.defaultView!
  const style = doc.getElementById(DARK_STYLE_ID) as HTMLStyleElement | null
  if (!style) return
  // Keep only the outermost roots
  roots = roots.filter((r) => !roots.some((o) => o !== r && o.contains(r)))
  const writes: [Element, string][] = []
  style.disabled = true
  try {
    let count = 0
    for (const root of roots) {
      const parentInfo = root === doc.documentElement ? null : infoFor(root.parentElement, st, win)
      const walk = (el: Element, parent: Info | null) => {
        if (count++ > MAX_ELEMENTS) return
        if (SKIP.has(el.tagName) || el.hasAttribute("data-yuktai-ui")) return
        const { info, rule } = read(el, parent, st.level, win)
        st.info.set(el, info)
        writes.push([el, rule])
        if (MEDIA.has(el.tagName)) return
        for (let c = el.firstElementChild; c; c = c.nextElementSibling) walk(c, info)
      }
      walk(root, parentInfo)
    }
  } finally {
    style.disabled = false
  }
  // Write: one attribute per element, one CSS rule per distinct set of colours
  let added = false
  for (const [el, rule] of writes) {
    if (!rule) {
      if (el.hasAttribute(ATTR)) el.removeAttribute(ATTR)
      continue
    }
    let id = st.rules.get(rule)
    if (id === undefined) {
      id = st.rules.size
      st.rules.set(rule, id)
      added = true
    }
    if (el.getAttribute(ATTR) !== String(id)) el.setAttribute(ATTR, String(id))
  }
  if (added || !style.textContent) {
    const sel = (i: number) => `[${ATTR}="${i}"]`.repeat(3)
    const out = [":root{color-scheme:dark}", "::placeholder{color:#9AA0A6 !important}"]
    for (const [rule, i] of st.rules) out.push(`${sel(i)}{${rule}}`)
    style.textContent = out.join("\n")
  }
}

/** Info for an element outside what we are painting (reads its ancestors once). */
function infoFor(el: Element | null, st: State, win: Window): Info | null {
  if (!el) return null
  const known = st.info.get(el)
  if (known) return known
  const parent = infoFor(el.parentElement, st, win)
  const { info } = read(el, parent, st.level, win)
  st.info.set(el, info)
  return info
}

const PAGE_BG: RGBA = { r: 255, g: 255, b: 255, a: 1 }

/** Works out one element's dark colours. Returns the CSS for it ("" = nothing to change). */
function read(el: Element, parent: Info | null, level: Level, win: Window): { info: Info; rule: string } {
  const cs = win.getComputedStyle(el)
  const out: string[] = []
  const isRoot = el === el.ownerDocument.documentElement
  let bg = parent?.bg ?? darkBackground(PAGE_BG)
  let picture = parent?.picture ?? false
  const fg = parseColor(cs.color)

  if (isRoot) {
    // The canvas: the page's background (white when it gives none), made dark
    const own = parseColor(cs.backgroundColor)
    bg = darkBackground(own && own.a > 0 ? { ...blend(own, PAGE_BG), a: 1 } : PAGE_BG)
    out.push(`background-color:${css(bg)} !important`)
  }

  if (MEDIA.has(el.tagName)) {
    // Pictures and players stay as they are; a little dimmer so they don't glare
    if (el.tagName === "IMG" || el.tagName === "VIDEO" || el.tagName === "PICTURE") out.push("filter:brightness(.9)")
    return { info: { fg, shown: parent?.shown ?? fg, bg, picture }, rule: out.join(";") }
  }

  const isSvg = el.namespaceURI === SVG_NS
  if (!isRoot && !isSvg) {
    const image = cs.backgroundImage
    let own = parseColor(cs.backgroundColor)
    if (image && image !== "none") {
      if (/url\(/i.test(image)) {
        picture = true
      } else {
        // A gradient: use its first colour, made dark
        const first = image.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/i)
        const c = first ? parseColor(first[0]) : null
        if (c && c.a > 0) {
          own = c
          out.push("background-image:none !important")
        } else picture = true
      }
    }
    if (own && own.a > 0) {
      const dark = darkBackground(own)
      out.push(`background-color:${css(dark)} !important`)
      bg = dark.a >= 1 ? { ...dark, a: 1 } : { ...blend(dark, bg), a: 1 }
      if (dark.a >= 0.9 && !(image && /url\(/i.test(image))) picture = false
    }
    // Borders
    if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) {
      const b = parseColor(cs.borderTopColor) ?? parseColor(cs.borderBottomColor)
      if (b && b.a > 0) out.push(`border-color:${css(darkBorder(b))} !important`)
    }
    const outline = parseFloat(cs.outlineWidth) > 0 ? parseColor(cs.outlineColor) : null
    if (outline && outline.a > 0 && cs.outlineStyle !== "none") out.push(`outline-color:${css(lightText(outline))} !important`)
  }

  // Text: lighter, and checked against the new background at the visitor's level
  let shown = parent?.shown ?? fg
  if (fg) {
    let want: RGBA
    if (picture) want = fg // we can't see the picture: keep the page's colour
    else {
      const light = lightText(fg)
      const solid = light.a < 1 ? { ...blend(light, bg), a: 1 } : light
      const size = parseFloat(cs.fontSize) || 16
      const weight = parseInt(cs.fontWeight, 10) || (cs.fontWeight === "bold" ? 700 : 400)
      const need = requiredRatio(level === "off" ? "AA" : level, isLargeText(size, weight))
      want = contrastRatio(solid, bg) + 1e-9 >= need ? light : nearestPassingColor(solid, bg, need)
    }
    // Written on every element: from styles alone we can't tell an inherited
    // colour from one the page's CSS sets again (p{color:#333}), and a missed
    // one would leave dark text on the new dark background.
    out.push(`color:${css(want)} !important`)
    shown = want
  }

  // Icons drawn in SVG: dark fills and strokes become light
  if (isSvg && !picture) {
    for (const prop of ["fill", "stroke"] as const) {
      const c = parseColor(cs.getPropertyValue(prop))
      if (c && c.a > 0) {
        const light = lightText(c)
        if (!same(light, c)) out.push(`${prop}:${css(light)} !important`)
      }
    }
  }

  return { info: { fg, shown, bg, picture }, rule: out.join(";") }
}
