// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/aria.ts
//
// Structure and name checks, with the "do no harm" rule:
//   • Native elements (button, a, input, img, table…) are checked, never
//     relabelled. A made-up label ("Button", "Image", "Interactive element")
//     is worse than none: the screen reader user hears a lie and nobody fixes
//     the real problem.
//   • The only fix applied by itself: an element with an inline onclick that
//     is not a control gets role="button", tabindex="0" and Enter/Space — and
//     only when it has a name to announce.
//   • Everything added is marked data-yuktai-fix="…" so it can be undone.
// ─────────────────────────────────────────────────────────────────────────────

import { WCAG, describe, type Finding, type RuleId } from "./report"
import { isSkipped } from "./language"

const NATIVE_CONTROLS = new Set(["a", "button", "input", "select", "textarea", "summary", "details", "option", "label", "video", "audio"])
const VAGUE_LINKS = new Set(["click here", "here", "read more", "more", "link", "this", "click", "ఇక్కడ", "ఇక్కడ క్లిక్ చేయండి", "మరింత", "यहाँ", "यहां क्लिक करें", "और पढ़ें"])

const finding = (rule: RuleId, status: Finding["status"], el: Element, data?: Finding["data"]): Finding => ({
  rule,
  status,
  wcag: WCAG[rule],
  where: describe(el),
  data,
  el,
})

/** A simple accessible name: aria-labelledby, aria-label, labels, alt/title, text, child images. */
export function accessibleName(el: Element): string {
  const doc = el.ownerDocument
  const by = el.getAttribute("aria-labelledby")
  if (by) {
    const t = by
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim() ?? "")
      .join(" ")
      .trim()
    if (t) return t
  }
  const label = el.getAttribute("aria-label")?.trim()
  if (label) return label
  const tag = el.tagName.toLowerCase()
  if (tag === "input" || tag === "select" || tag === "textarea") {
    const id = el.getAttribute("id")
    if (id) {
      const lab = doc.querySelector(`label[for="${cssEscape(id)}"]`)
      if (lab?.textContent?.trim()) return lab.textContent.trim()
    }
    const wrap = el.closest("label")
    if (wrap?.textContent?.trim()) return wrap.textContent.trim()
    const type = (el.getAttribute("type") || "").toLowerCase()
    if ((type === "submit" || type === "button" || type === "reset") && (el as HTMLInputElement).value) return (el as HTMLInputElement).value
    if (type === "image" && el.getAttribute("alt")) return el.getAttribute("alt")!
    return el.getAttribute("title")?.trim() || ""
  }
  if (tag === "img") return el.getAttribute("alt") ?? ""
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim()
  if (text) return text
  for (const img of Array.from(el.querySelectorAll("img[alt], [aria-label], svg title"))) {
    const t = img.tagName.toLowerCase() === "title" ? img.textContent : img.getAttribute("alt") ?? img.getAttribute("aria-label")
    if (t && t.trim()) return t.trim()
  }
  return el.getAttribute("title")?.trim() || ""
}

function cssEscape(s: string): string {
  const CSSx = (globalThis as { CSS?: { escape?: (v: string) => string } }).CSS
  return CSSx?.escape ? CSSx.escape(s) : s.replace(/["\\]/g, "\\$&")
}

function isHidden(el: Element): boolean {
  if (el.closest("[hidden],[aria-hidden='true']")) return true
  const win = el.ownerDocument.defaultView
  if (!win) return false
  const cs = win.getComputedStyle(el)
  return cs.display === "none" || cs.visibility === "hidden"
}

const isFocusable = (el: Element) => {
  const tag = el.tagName.toLowerCase()
  if (el.hasAttribute("disabled")) return false
  if (el.hasAttribute("tabindex")) return Number(el.getAttribute("tabindex")) >= 0
  if (tag === "a") return el.hasAttribute("href")
  return ["button", "input", "select", "textarea", "summary", "iframe"].includes(tag) || el.getAttribute("contenteditable") === "true"
}

export interface AriaOptions {
  /** true: apply the safe fix (fake buttons). false: report only. */
  fix: boolean
}

/** Runs the structure and name rules over `elements`. */
export function auditAria(doc: Document, elements: Element[], opts: AriaOptions): Finding[] {
  const out: Finding[] = []
  let lastHeading = 0
  let h1s = 0
  for (const el of elements) {
    if (el.closest("[data-yuktai-a11y='off'],[data-yuktai-ui]")) continue
    const tag = el.tagName.toLowerCase()
    const hidden = isHidden(el)

    if (/^h[1-6]$/.test(tag) && !hidden) {
      const level = Number(tag[1])
      if (level === 1) h1s++
      if (lastHeading && level > lastHeading + 1) out.push(finding("heading-skip", "check", el, { from: lastHeading, to: level }))
      lastHeading = level
    }
    if (hidden) {
      if (el.getAttribute("aria-hidden") === "true" && isFocusable(el)) out.push(finding("aria-hidden-focusable", "check", el))
      continue
    }

    if (tag === "img" && !el.hasAttribute("alt") && el.getAttribute("role") !== "presentation" && el.getAttribute("role") !== "none" && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) {
      out.push(finding("img-alt-missing", "check", el))
    }

    if (tag === "button" || (tag === "a" && el.hasAttribute("href")) || el.getAttribute("role") === "button" || el.getAttribute("role") === "link") {
      const name = accessibleName(el)
      if (!name) out.push(finding("control-name-missing", "check", el, { tag: el.getAttribute("role") || tag }))
      // v6.0.1: "❌", "→", "☰" alone: a screen reader says "cross mark", not what the button does
      else if (!/[\p{L}\p{N}]/u.test(name)) out.push(finding("control-name-symbols", "check", el, { tag: el.getAttribute("role") || tag, text: name.slice(0, 8) }))
    }

    if (tag === "a" && el.hasAttribute("href")) {
      const t = (el.textContent ?? "").replace(/\s+/g, " ").trim().toLowerCase()
      if (t && VAGUE_LINKS.has(t) && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) out.push(finding("link-text-vague", "check", el, { text: t }))
    }

    if (["input", "select", "textarea"].includes(tag)) {
      const type = (el.getAttribute("type") || "").toLowerCase()
      if (!["hidden", "submit", "button", "reset", "image"].includes(type) && !accessibleName(el)) out.push(finding("field-label-missing", "check", el))
    }

    if (tag === "iframe" && !el.getAttribute("title") && !el.getAttribute("aria-label")) out.push(finding("iframe-title-missing", "check", el))

    if (tag === "table" && el.getAttribute("role") !== "presentation" && el.querySelectorAll("tr").length > 1 && !el.querySelector("th,[role='columnheader'],[role='rowheader']")) {
      out.push(finding("table-headers-missing", "check", el))
    }

    if ((tag === "video" || tag === "audio") && el.hasAttribute("autoplay") && !el.hasAttribute("muted") && !el.hasAttribute("controls")) out.push(finding("media-autoplay", "check", el))

    const ti = el.getAttribute("tabindex")
    if (ti !== null && Number(ti) > 0) out.push(finding("tabindex-positive", "check", el, { value: ti }))

    // Clickable elements that are not controls.
    if (!NATIVE_CONTROLS.has(tag) && !el.getAttribute("role") && el.hasAttribute("onclick") && !isSkipped(el)) {
      const name = accessibleName(el)
      if (opts.fix && name) {
        el.setAttribute("role", "button")
        const addTab = !el.hasAttribute("tabindex")
        if (addTab) el.setAttribute("tabindex", "0")
        bindKeys(el)
        el.setAttribute("data-yuktai-fix", addTab ? "fake-button tabindex" : "fake-button")
        out.push(finding("fake-button", "fixed", el, { tag }))
      } else {
        out.push(finding(name ? "clickable-not-focusable" : "control-name-missing", "check", el, { tag }))
      }
    }
  }
  // v6.0.1: a "skip to content" link that leads nowhere (WCAG 2.4.1)
  for (const a of Array.from(doc.querySelectorAll("a[href^='#']")).slice(0, 5)) {
    const text = (a.textContent ?? "").toLowerCase()
    if (!/skip|jump|main content|ప్రధాన|దాటవేయి|मुख्य/.test(text)) continue
    const id = decodeURIComponent((a.getAttribute("href") ?? "").slice(1))
    if (id && !doc.getElementById(id) && !doc.getElementsByName(id).length) out.push(finding("skip-link-broken", "check", a, { target: "#" + id }))
  }
  if (h1s !== 1 && elements.length) out.push(finding("h1-count", "check", doc.body ?? doc.documentElement, { count: h1s }))
  if (doc.body && !doc.querySelector("main,[role='main']")) out.push(finding("main-landmark-missing", "check", doc.body))
  return out
}

const KEY = Symbol.for("yuktai.keys")

function bindKeys(el: Element) {
  const h = el as HTMLElement & { [KEY]?: (e: KeyboardEvent) => void }
  if (h[KEY]) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      h.click()
    }
  }
  h[KEY] = onKey
  h.addEventListener("keydown", onKey)
}

/** Removes every attribute and key handler auditAria added. */
export function undoAria(doc: Document): number {
  let n = 0
  doc.querySelectorAll("[data-yuktai-fix~='fake-button']").forEach((el) => {
    el.removeAttribute("role")
    if ((el.getAttribute("data-yuktai-fix") ?? "").includes("tabindex")) el.removeAttribute("tabindex")
    const h = el as HTMLElement & { [KEY]?: (e: KeyboardEvent) => void }
    if (h[KEY]) {
      h.removeEventListener("keydown", h[KEY]!)
      delete h[KEY]
    }
    el.removeAttribute("data-yuktai-fix")
    n++
  })
  return n
}
