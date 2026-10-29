// ─────────────────────────────────────────────────────────────────────────────
// yuktai/agentic — shared DOM helpers
// Original code for yuktai. No third-party code. Runs in the browser only;
// every helper is safe to import during SSR (it just returns empty results).
// ─────────────────────────────────────────────────────────────────────────────

/** Elements inside yuktai's own panels are never audited or read. */
/** YuktAI's own UI: panels, floating buttons (React data-yuktai-ui, vanilla data-yuktai-fabs). Audits skip it. */
export const YUKTAI_IGNORE = "[data-yuktai-panel],[data-yuktai-ui],[data-yuktai-fabs]"

export type AuditRoot = Document | Element

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/** Works across frames/realms, unlike `instanceof Document`. */
export function isDocument(node: unknown): node is Document {
  return typeof node === "object" && node !== null && (node as Node).nodeType === 9
}

export function resolveRoot(root?: AuditRoot | null): AuditRoot | null {
  if (root) return root
  return isBrowser() ? document : null
}

/** querySelectorAll that skips yuktai's own UI and hidden elements. */
export function queryAll<T extends Element = Element>(
  root: AuditRoot,
  selector: string,
  options: { includeHidden?: boolean } = {}
): T[] {
  return Array.from(root.querySelectorAll<T>(selector)).filter(
    (el) => !el.closest(YUKTAI_IGNORE) && (options.includeHidden || isVisible(el))
  )
}

export function isVisible(el: Element): boolean {
  if (!isBrowser()) return false
  if (el.closest("[hidden],[aria-hidden='true']")) return false
  let node: Element | null = el
  while (node) {
    const style = window.getComputedStyle(node)
    if (style.display === "none" || style.visibility === "hidden") return false
    node = node.parentElement
  }
  return true
}

/** Collapse whitespace and trim. */
export function cleanText(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim()
}

export function shorten(text: string, max = 60): string {
  const t = cleanText(text)
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

/** A short, readable CSS path such as `main > form:nth-of-type(2) > input`. */
export function selectorFor(el: Element): string {
  const parts: string[] = []
  let node: Element | null = el
  while (node && node.nodeType === 1 && parts.length < 4) {
    const tag = node.tagName.toLowerCase()
    if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) {
      parts.unshift(`${tag}#${node.id}`)
      break
    }
    const parent: Element | null = node.parentElement
    if (!parent) {
      parts.unshift(tag)
      break
    }
    const siblings = Array.from(parent.children).filter((c) => c.tagName === node!.tagName)
    parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${siblings.indexOf(node) + 1})` : tag)
    node = parent
  }
  return parts.join(" > ")
}

function textById(ids: string, doc: Document): string {
  return ids
    .split(/\s+/)
    .map((id) => cleanText(doc.getElementById(id)?.textContent))
    .filter(Boolean)
    .join(" ")
}

/** The label a screen reader would most likely announce for this element. */
export function accessibleName(el: Element): string {
  const doc = el.ownerDocument
  const labelledBy = el.getAttribute("aria-labelledby")
  if (labelledBy) {
    const text = textById(labelledBy, doc)
    if (text) return text
  }
  const ariaLabel = cleanText(el.getAttribute("aria-label"))
  if (ariaLabel) return ariaLabel

  const tag = el.tagName.toLowerCase()
  if (tag === "input" || tag === "select" || tag === "textarea") {
    const id = el.getAttribute("id")
    if (id) {
      const label = doc.querySelector(`label[for="${cssEscape(id)}"]`)
      const text = cleanText(label?.textContent)
      if (text) return text
    }
    const wrapping = el.closest("label")
    if (wrapping) {
      const text = cleanText(wrapping.textContent)
      if (text) return text
    }
    const type = (el.getAttribute("type") ?? "").toLowerCase()
    if (type === "submit" || type === "button" || type === "reset") {
      return cleanText(el.getAttribute("value")) || (type === "submit" ? "Submit" : "")
    }
    if (type === "image") return cleanText(el.getAttribute("alt"))
  }
  if (tag === "img") return cleanText(el.getAttribute("alt"))

  if (tag === "button" || tag === "a" || el.getAttribute("role")) {
    const text = cleanText(el.textContent)
    if (text) return text
    const imgAlt = Array.from(el.querySelectorAll("img[alt], svg[aria-label]"))
      .map((c) => cleanText(c.getAttribute("alt") ?? c.getAttribute("aria-label")))
      .filter(Boolean)
      .join(" ")
    if (imgAlt) return imgAlt
  }
  return cleanText(el.getAttribute("title"))
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value)
  return value.replace(/["\\]/g, "\\$&")
}

// ── Colour & contrast (WCAG 2.x relative luminance formula) ─────────────────

export type RGBA = { r: number; g: number; b: number; a: number }

export function parseColor(value: string | null | undefined): RGBA | null {
  if (!value) return null
  const v = value.trim().toLowerCase()
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 }
  const rgb = v.match(/^rgba?\(([^)]+)\)$/)
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean)
    const [r, g, b] = parts.slice(0, 3).map(Number)
    const alphaRaw = parts[3]
    const a = alphaRaw === undefined ? 1 : alphaRaw.endsWith("%") ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw)
    if ([r, g, b, a].some((n) => !Number.isFinite(n))) return null
    return { r, g, b, a }
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

/** Paint `top` over `bottom` (simple alpha compositing). */
export function blend(top: RGBA, bottom: RGBA): RGBA {
  const a = top.a + bottom.a * (1 - top.a)
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  const mix = (t: number, b: number) => (t * top.a + b * bottom.a * (1 - top.a)) / a
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a }
}

export function relativeLuminance(c: RGBA): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b)
}

export function contrastRatio(fg: RGBA, bg: RGBA): number {
  const opaqueBg = bg.a < 1 ? blend(bg, { r: 255, g: 255, b: 255, a: 1 }) : bg
  const opaqueFg = fg.a < 1 ? blend(fg, opaqueBg) : fg
  const l1 = relativeLuminance(opaqueFg)
  const l2 = relativeLuminance(opaqueBg)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}

/**
 * Background actually behind an element: walks up the tree and composites
 * semi-transparent layers over white. Returns null when a background image
 * makes the answer unknowable.
 */
export function effectiveBackground(el: Element): RGBA | null {
  const layers: RGBA[] = []
  let node: Element | null = el
  while (node) {
    const style = window.getComputedStyle(node)
    if (style.backgroundImage && style.backgroundImage !== "none") return null
    const color = parseColor(style.backgroundColor)
    if (color && color.a > 0) {
      layers.push(color)
      if (color.a >= 1) break
    }
    node = node.parentElement
  }
  let result: RGBA = { r: 255, g: 255, b: 255, a: 1 }
  for (let i = layers.length - 1; i >= 0; i--) result = blend(layers[i], result)
  return result
}

export function isLargeText(el: Element): boolean {
  const style = window.getComputedStyle(el)
  const size = parseFloat(style.fontSize) || 16
  const weight = parseInt(style.fontWeight, 10) || 400
  return size >= 24 || (size >= 18.66 && weight >= 700)
}

/** True when the element has its own visible text (not only inside children). */
export function hasDirectText(el: Element): boolean {
  return Array.from(el.childNodes).some((n) => n.nodeType === 3 && cleanText(n.textContent).length > 0)
}

export const FOCUSABLE =
  "a[href],button,input:not([type='hidden']),select,textarea,summary,[tabindex]:not([tabindex='-1']),[contenteditable='true']"

export const INTERACTIVE =
  "a[href],button,input:not([type='hidden']),select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='tab'],[role='menuitem']"
