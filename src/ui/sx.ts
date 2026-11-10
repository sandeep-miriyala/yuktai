// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · sx.ts
//
// A small style engine for the `sx` prop: an object of styles becomes one
// class name and one CSS rule, written once into <style id="yuktai-ui">.
//
//   sx={{ p: 2, bgcolor: "background.paper", "&:hover": { color: "primary.main" },
//         width: { xs: "100%", md: 480 } }}
//
//   • spacing: m, p, mx, py, gap… numbers × 8px
//   • colours: "primary.main", "text.secondary", "divider" → theme CSS variables
//   • sizes: 0 < n ≤ 1 → percent, other numbers → px; borderRadius × 4px
//   • responsive: { xs, sm, md, lg, xl } or an array, mobile first
//   • nested: "&:hover", "& .child", "@media …", "@keyframes name"
//   • sx may be an array or a function of the theme
//
// Same styles → same class name (a hash), so server and browser agree.
// On the server, rules are kept so a layout can send them with the HTML
// (see getUiStyles / UiStyleRegistry). No runtime dependency.
// ─────────────────────────────────────────────────────────────────────────────

import { useInsertionEffect, useMemo, useSyncExternalStore } from "react"
import { BREAKPOINTS, BREAKPOINT_KEYS, paletteColor, theme, type Breakpoint, type Theme } from "./theme"

export type SxValue = string | number | null | undefined | false | SxObject | SxValue[] | ((t: Theme) => any)
export type SxObject = { [key: string]: SxValue }
export type SxProps<_T = Theme> = SxObject | ((t: Theme) => SxObject) | Array<SxObject | ((t: Theme) => SxObject) | false | null | undefined> | null | undefined | false

/* ───────────── what each key means ───────────── */

const SPACING: Record<string, string[]> = {
  m: ["margin"], mt: ["margin-top"], mr: ["margin-right"], mb: ["margin-bottom"], ml: ["margin-left"],
  mx: ["margin-left", "margin-right"], my: ["margin-top", "margin-bottom"],
  p: ["padding"], pt: ["padding-top"], pr: ["padding-right"], pb: ["padding-bottom"], pl: ["padding-left"],
  px: ["padding-left", "padding-right"], py: ["padding-top", "padding-bottom"],
  margin: ["margin"], marginTop: ["margin-top"], marginRight: ["margin-right"], marginBottom: ["margin-bottom"], marginLeft: ["margin-left"],
  marginX: ["margin-left", "margin-right"], marginY: ["margin-top", "margin-bottom"], marginInline: ["margin-inline"], marginBlock: ["margin-block"],
  padding: ["padding"], paddingTop: ["padding-top"], paddingRight: ["padding-right"], paddingBottom: ["padding-bottom"], paddingLeft: ["padding-left"],
  paddingX: ["padding-left", "padding-right"], paddingY: ["padding-top", "padding-bottom"], paddingInline: ["padding-inline"], paddingBlock: ["padding-block"],
  gap: ["gap"], rowGap: ["row-gap"], columnGap: ["column-gap"],
}

const COLOR_KEYS = new Set([
  "color", "bgcolor", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor",
  "borderLeftColor", "outlineColor", "fill", "stroke", "caretColor", "textDecorationColor", "accentColor",
])

const SIZE_KEYS = new Set(["width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "flexBasis"])
const BORDER_KEYS = new Set(["border", "borderTop", "borderRight", "borderBottom", "borderLeft", "outline"])

/** Numbers stay unitless for these (as in React's style prop). */
const UNITLESS = new Set([
  "opacity", "zIndex", "flex", "flexGrow", "flexShrink", "order", "fontWeight", "lineHeight", "zoom",
  "gridRow", "gridColumn", "gridRowStart", "gridRowEnd", "gridColumnStart", "gridColumnEnd", "columnCount",
  "animationIterationCount", "fillOpacity", "strokeOpacity", "strokeWidth", "tabSize", "WebkitLineClamp", "lineClamp", "aspectRatio", "scale",
])

const ALIASES: Record<string, string> = { bgcolor: "background-color", displayPrint: "" }

const kebab = (k: string) =>
  ALIASES[k] ?? (k.startsWith("--") ? k : k.replace(/^(Webkit|Moz|ms)/, (m) => `-${m.toLowerCase()}`).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`))

function spacingValue(v: unknown): string {
  if (typeof v === "number") return `${v * 8}px`
  return String(v)
}

function sizeValue(key: string, v: unknown): string {
  if (typeof v === "number") return v > 0 && v <= 1 ? `${+(v * 100).toFixed(4)}%` : `${v}px`
  if (key === "maxWidth" && typeof v === "string" && v in BREAKPOINTS) return `${BREAKPOINTS[v as Breakpoint]}px`
  return String(v)
}

/** One declaration (or several, for mx/py) for a key and a plain value. */
function declarations(key: string, value: unknown): string {
  if (value === null || value === undefined || value === false || value === "") return ""
  if (key === "typography" && typeof value === "string") return typographyCss(value)
  if (key === "displayPrint") return ""
  if (SPACING[key]) return SPACING[key].map((p) => `${p}:${spacingValue(value)};`).join("")
  let v: unknown = value
  if (COLOR_KEYS.has(key)) v = paletteColor(v)
  if (SIZE_KEYS.has(key)) return `${kebab(key)}:${sizeValue(key, v)};`
  if (key === "borderRadius" && typeof v === "number") return `border-radius:${v * 4}px;`
  if (BORDER_KEYS.has(key) && typeof v === "number") return `${kebab(key)}:${v}px solid;`
  if (key === "boxShadow" && typeof v === "number") return `box-shadow:${theme.shadows[v] ?? "none"};`
  if (key === "fontFamily" && v === "inherit") return "font-family:inherit;"
  if (typeof v === "number" && !UNITLESS.has(key) && !key.startsWith("--")) v = `${v}px`
  return `${kebab(key)}:${String(v)};`
}

/* ───────────── typography variants (Typography and sx.typography) ───────────── */

export const TYPE_SCALE: Record<string, Record<string, string | number>> = {
  h1: { fontSize: "clamp(2.25rem, 1.6rem + 2.6vw, 3.25rem)", fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: "clamp(1.875rem, 1.4rem + 1.9vw, 2.5rem)", fontWeight: 700, lineHeight: 1.25 },
  h3: { fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)", fontWeight: 700, lineHeight: 1.3 },
  h4: { fontSize: "clamp(1.3rem, 1.1rem + 0.8vw, 1.65rem)", fontWeight: 700, lineHeight: 1.35 },
  h5: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 },
  h6: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.45 },
  subtitle1: { fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.6 },
  subtitle2: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.6 },
  body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.7 },
  body2: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.65 },
  caption: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.6 },
  overline: { fontSize: "0.75rem", fontWeight: 600, lineHeight: 2, letterSpacing: "0.08em", textTransform: "uppercase" },
  button: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.6 },
}

function typographyCss(variant: string): string {
  const t = TYPE_SCALE[variant]
  if (!t) return ""
  return Object.entries(t).map(([k, v]) => declarations(k, v)).join("")
}

/* ───────────── sx → CSS ───────────── */

const isPlain = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype

const isResponsive = (v: unknown): v is Record<string, unknown> =>
  isPlain(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => k in BREAKPOINTS)

const minWidth = (bp: Breakpoint) => `@media (min-width:${BREAKPOINTS[bp]}px)`

type Block = { selector: string; wrap: string[]; body: string }

/** Turns one sx object into blocks; keyframes and globals go to `atRules`. */
function compile(obj: Record<string, unknown>, selector: string, wrap: string[], out: Block[], atRules: string[]) {
  let body = ""
  const later: Array<() => void> = []
  for (const [rawKey, raw] of Object.entries(obj)) {
    const value = typeof raw === "function" ? (raw as (t: Theme) => unknown)(theme) : raw
    if (value === null || value === undefined || value === false) continue
    const key = rawKey.trim()

    if (key.startsWith("@keyframes")) {
      if (isPlain(value)) {
        const frames = Object.entries(value)
          .map(([f, decl]) => `${f}{${isPlain(decl) ? Object.entries(decl).map(([k, v]) => declarations(k, v)).join("") : ""}}`)
          .join("")
        atRules.push(`${key}{${frames}}`)
      }
      continue
    }
    if (key.startsWith("@media") || key.startsWith("@supports") || key.startsWith("@container")) {
      if (isPlain(value)) later.push(() => compile(value, selector, [...wrap, key], out, atRules))
      continue
    }
    if (isResponsive(value)) {
      for (const bp of BREAKPOINT_KEYS) {
        if (!(bp in value)) continue
        const v = value[bp]
        if (bp === "xs") body += declarations(key, v)
        else later.push(() => out.push({ selector, wrap: [...wrap, minWidth(bp)], body: declarations(key, v) }))
      }
      continue
    }
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        const bp = BREAKPOINT_KEYS.at(i)
        if (!bp || v === null || v === undefined) return
        if (bp === "xs") body += declarations(key, v)
        else later.push(() => out.push({ selector, wrap: [...wrap, minWidth(bp)], body: declarations(key, v) }))
      })
      continue
    }
    if (isPlain(value)) {
      const nested = nestSelector(selector, key)
      later.push(() => compile(value, nested, wrap, out, atRules))
      continue
    }
    body += declarations(key, value)
  }
  if (body) out.push({ selector, wrap, body })
  later.forEach((f) => f())
}

function nestSelector(parent: string, key: string): string {
  return key
    .split(",")
    .map((part) => {
      const p = part.trim()
      if (p.includes("&")) return p.replace(/&/g, parent)
      if (p.startsWith(":") || p.startsWith("::")) return `${parent}${p}`
      return parent ? `${parent} ${p}` : p
    })
    .join(",")
}

function render(blocks: Block[]): string {
  return blocks
    .map((b) => {
      const rule = b.selector ? `${b.selector}{${b.body}}` : b.body
      return b.wrap.reduceRight((inner, w) => `${w}{${inner}}`, rule)
    })
    .join("")
}

/** Flattens sx (arrays, functions) into one object; later entries win. */
export function resolveSx(sx: SxProps | undefined): Record<string, unknown> | null {
  if (!sx) return null
  if (typeof sx === "function") return resolveSx(sx(theme))
  if (Array.isArray(sx)) {
    const parts = sx.map((s) => resolveSx(s as SxProps)).filter(Boolean) as Record<string, unknown>[]
    if (parts.length === 0) return null
    return parts.reduce((acc, p) => deepMerge(acc, p), {})
  }
  return isPlain(sx) ? (sx as Record<string, unknown>) : null
}

function deepMerge(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = isPlain(out[k]) && isPlain(v) ? deepMerge(out[k] as Record<string, unknown>, v) : v
  return out
}

/** CSS for an sx object under `selector`. Exported for tests and GlobalStyles. */
export function sxToCss(sx: SxProps | Record<string, unknown>, selector: string): string {
  const obj = resolveSx(sx as SxProps)
  if (!obj) return ""
  const blocks: Block[] = []
  const atRules: string[] = []
  compile(obj, selector, [], blocks, atRules)
  return atRules.join("") + render(blocks)
}

/* ───────────── stable class names ───────────── */

function stringify(v: unknown): string {
  if (typeof v === "function") return stringify((v as (t: Theme) => unknown)(theme))
  if (Array.isArray(v)) return `[${v.map(stringify).join(",")}]`
  if (isPlain(v)) return `{${Object.keys(v).map((k) => `${JSON.stringify(k)}:${stringify(v[k])}`).join(",")}}`
  return JSON.stringify(v ?? null)
}

function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/* ───────────── where rules go ───────────── */

const STYLE_ID = "yuktai-ui"
const rules = new Map<string, string>() // key → css (every rule this process has seen)
const touched = new Set<string>() // keys used since the last getUiStyles(): the page being rendered
const ALWAYS = ["yk-base", "yk-type"]
const sheets: Record<"layout" | "sx", HTMLStyleElement | null> = { layout: null, sx: null }
const inDom = new Set<string>()

const isBrowser = () => typeof document !== "undefined"

/**
 * Two sheets, in this order: "layout" (base look + layout from props) then
 * "sx" (the sx prop), so sx wins when both set the same property.
 */
const sheetFor = (key: string): "layout" | "sx" => (key.startsWith("yk-base") || key.startsWith("yk-type") || key.startsWith("ykl-") || key.startsWith("ykg-") ? "layout" : "sx")

function domSheet(kind: "layout" | "sx"): HTMLStyleElement {
  const have = sheets[kind]
  if (have && have.isConnected) return have
  const id = kind === "sx" ? STYLE_ID : `${STYLE_ID}-layout`
  let el = document.getElementById(id) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = id
    if (kind === "layout") {
      // after the rules the server sent; with none, first in <head>
      const sent = Array.from(document.querySelectorAll("style[data-yuktai-ui]"))
      const last = sent.at(-1)
      if (last?.parentNode) last.parentNode.insertBefore(el, last.nextSibling)
      else document.head.insertBefore(el, document.head.firstChild)
    } else {
      const layout = domSheet("layout")
      layout.parentNode!.insertBefore(el, layout.nextSibling)
    }
  }
  sheets[kind] = el
  return el
}

/** Adds a rule once. On the server it is only remembered (getUiStyles). `first` = before every other rule. */
export function insertRule(key: string, css: string, first = false): void {
  if (!css) return
  touched.add(key)
  if (!rules.has(key)) rules.set(key, css)
  if (!isBrowser() || inDom.has(key)) return
  // rules sent with the server HTML are already on the page
  for (const sent of Array.from(document.querySelectorAll("style[data-yuktai-ui]"))) {
    if (sent.getAttribute("data-keys")?.split(" ").includes(key)) {
      inDom.add(key)
      return
    }
  }
  const s = domSheet(sheetFor(key))
  const node = document.createTextNode(css)
  if (first) s.insertBefore(node, s.firstChild)
  else s.appendChild(node)
  inDom.add(key)
}

/**
 * Rules not yet sent, for server rendering. A Next.js layout passes the keys
 * it already sent; the result is CSS plus the keys it contains.
 */
export function getUiStyles(sent: Set<string> = new Set()): { css: string; keys: string[] } {
  const keys: string[] = []
  let css = ""
  // base and layout first, then sx, so sx wins (same order as in the browser)
  const used = [...touched]
  const wanted = [...ALWAYS, ...used.filter((k) => sheetFor(k) === "layout"), ...used.filter((k) => sheetFor(k) === "sx")]
  touched.clear()
  for (const k of wanted) {
    const v = rules.get(k)
    if (!v || sent.has(k)) continue
    sent.add(k)
    keys.push(k)
    css += v
  }
  return { css, keys }
}

/** The class name for an sx value ("" when there is nothing). Writes the CSS once. */
export function sxClass(sx: SxProps | undefined): string {
  const obj = resolveSx(sx)
  if (!obj || Object.keys(obj).length === 0) return ""
  const name = `yk-${hash(stringify(obj))}`
  if (!rules.has(name) || (isBrowser() && !inDom.has(name))) {
    const css = rules.get(name) ?? sxToCss(obj, `.${name}`)
    insertRule(name, css)
  }
  return name
}

/** Hook form of sxClass. Server: the rule is kept for the HTML. Browser: written before paint. */
export function useSx(sx: SxProps | undefined): string {
  const key = useMemo(() => (sx ? stringify(resolveSx(sx)) : ""), [sx])
  const name = useMemo(() => (key ? sxClassFromKey(sx, key) : ""), [key])
  useInsertionEffect(() => {
    if (name && !inDom.has(name)) insertRule(name, rules.get(name) ?? "")
  }, [name])
  return name
}

function sxClassFromKey(sx: SxProps | undefined, key: string): string {
  const obj = resolveSx(sx)
  if (!obj || key === "{}") return ""
  const name = `yk-${hash(key)}`
  if (!rules.has(name)) rules.set(name, sxToCss(obj, `.${name}`))
  touched.add(name)
  return name
}

/** Global styles: top-level keys are selectors ("body", ".rb-card", "@keyframes x"). */
export function globalCss(styles: Record<string, unknown> | ((t: Theme) => Record<string, unknown>)): string {
  const obj = typeof styles === "function" ? styles(theme) : styles
  const blocks: Block[] = []
  const atRules: string[] = []
  compile(obj, "", [], blocks, atRules)
  return atRules.join("") + render(blocks.filter((b) => b.selector))
}

/* ───────────── system props (Box, Stack, Typography…) ───────────── */

const SYSTEM = new Set([
  ...Object.keys(SPACING),
  "display", "overflow", "overflowX", "overflowY", "textOverflow", "visibility", "whiteSpace",
  "flex", "flexDirection", "flexWrap", "flexGrow", "flexShrink", "flexBasis", "flexFlow", "alignItems", "alignContent",
  "alignSelf", "justifyContent", "justifyItems", "justifySelf", "order", "placeItems", "placeContent", "placeSelf",
  "gridTemplateColumns", "gridTemplateRows", "gridTemplateAreas", "gridColumn", "gridRow", "gridArea", "gridAutoFlow",
  "gridAutoColumns", "gridAutoRows",
  "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "boxSizing",
  "position", "top", "right", "bottom", "left", "zIndex",
  "border", "borderTop", "borderRight", "borderBottom", "borderLeft", "borderColor", "borderRadius",
  "boxShadow", "bgcolor", "color",
  "fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "lineHeight", "textAlign", "textTransform", "typography",
])

/** Splits system props (mb={2}, fontWeight={700}) out of props, into sx. */
export function splitSystemProps<P extends Record<string, any>>(props: P, keep: string[] = []): { system: Record<string, unknown> | null; rest: P } {
  let system: Record<string, unknown> | null = null
  const rest: Record<string, any> = {}
  for (const k of Object.keys(props)) {
    if (SYSTEM.has(k) && !keep.includes(k) && props[k] !== undefined) {
      ;(system ??= {})[k] = props[k]
    } else rest[k] = props[k]
  }
  return { system, rest: rest as P }
}

/* ───────────── media queries ───────────── */

export function useMediaQuery(q: string | ((t: Theme) => string), options: { noSsr?: boolean; defaultMatches?: boolean } = {}): boolean {
  const raw = typeof q === "function" ? q(theme) : q
  const query = raw.replace(/^@media\s*/, "")
  const subscribe = (cb: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {}
    const mql = window.matchMedia(query)
    mql.addEventListener("change", cb)
    return () => mql.removeEventListener("change", cb)
  }
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : !!options.defaultMatches)
  return useSyncExternalStore(subscribe, get, () => !!options.defaultMatches)
}

/** Joins class names, skipping empty ones. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}
