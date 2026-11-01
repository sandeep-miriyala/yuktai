// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/reader/privacyFilter.ts
//
// The first gate. Nothing below this line ever sees:
//   · what a visitor typed (input, textarea, select values, rich editors)
//   · passwords, one-time codes, card numbers (they are inputs: skipped whole)
//   · hidden text, scripts, styles, templates
//   · elements the owner marks with data-ask-private / data-yuktai-private
//   · Ask page's own panel
//
// Labels, placeholders and headings stay: they describe a field without
// revealing what is in it.
// ─────────────────────────────────────────────────────────────────────────────

/** Subtrees that are never read. */
export const NEVER_READ = [
  "input",
  "textarea",
  "select",
  "option",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='textbox']",
  "[role='combobox']",
  "[role='searchbox']",
  "script",
  "style",
  "noscript",
  "template",
  "iframe",
  "object",
  "embed",
  "canvas",
  "svg",
  "[hidden]:not([hidden='until-found'])",
  "[aria-hidden='true']",
  "[inert]",
  "[data-ask-private]",
  "[data-yuktai-private]",
  "[data-yuktai-panel]",
  "yuktai-ask",
].join(",")

/** Chrome around the content, skipped when a main region exists. */
export const CHROME = ["nav", "header", "footer", "aside", "[role='navigation']", "[role='banner']", "[role='contentinfo']"].join(",")

/** True when an element, or anything around it, must not be read. */
export function isPrivate(el: Element, extra: string[] = []): boolean {
  if (el.closest(NEVER_READ)) return true
  for (const sel of extra) {
    try {
      if (el.closest(sel)) return true
    } catch {
      /* invalid owner selector: ignore it */
    }
  }
  return false
}

/** Rendered as invisible (display:none, visibility:hidden)? Works without layout too. */
export function isHidden(el: Element): boolean {
  const view = el.ownerDocument?.defaultView
  if (!view || typeof view.getComputedStyle !== "function") return false
  let node: Element | null = el
  while (node && node.nodeType === 1) {
    const cs = view.getComputedStyle(node)
    if (cs.display === "none" || cs.visibility === "hidden") return true
    node = node.parentElement
  }
  return false
}

/**
 * Looks like a signed-in or private page: a password field, account words in
 * the URL, or an owner flag. Ask page then keeps everything in memory only.
 */
export function looksSensitive(doc: Document): boolean {
  if (doc.querySelector("input[type='password'], [data-ask-sensitive]")) return true
  const path = (doc.location?.pathname ?? "").toLowerCase()
  return /(^|\/)(account|accounts|profile|settings|billing|checkout|cart|inbox|mail|messages|bank|dashboard|admin|my)(\/|$)/.test(path)
}

/**
 * Text a model may read about a form field: its label, legend, placeholder,
 * type and whether it is required. Never its value.
 */
export function describeField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): {
  label: string
  type: string
  required: boolean
  hint: string
} {
  const doc = field.ownerDocument
  let label = ""
  if (field.id) {
    const l = doc.querySelector(`label[for="${cssEscape(field.id)}"]`)
    if (l) label = clean(l.textContent)
  }
  if (!label) {
    const wrap = field.closest("label")
    if (wrap) label = clean(labelTextWithoutControls(wrap))
  }
  if (!label) label = clean(field.getAttribute("aria-label"))
  if (!label) {
    const by = field.getAttribute("aria-labelledby")
    if (by) label = clean(by.split(/\s+/).map((id) => doc.getElementById(id)?.textContent ?? "").join(" "))
  }
  const placeholder = "placeholder" in field ? clean((field as HTMLInputElement).placeholder) : ""
  let hint = ""
  const describedBy = field.getAttribute("aria-describedby")
  if (describedBy) hint = clean(describedBy.split(/\s+/).map((id) => doc.getElementById(id)?.textContent ?? "").join(" "))
  if (!hint) hint = placeholder
  const type = field.tagName === "SELECT" ? "select" : field.tagName === "TEXTAREA" ? "textarea" : (field.getAttribute("type") || "text").toLowerCase()
  return { label: label || placeholder || field.getAttribute("name") || "", type, required: field.hasAttribute("required") || field.getAttribute("aria-required") === "true", hint }
}

function labelTextWithoutControls(label: Element): string {
  const clone = label.cloneNode(true) as Element
  clone.querySelectorAll("input, textarea, select, option").forEach((n) => n.remove())
  return clone.textContent ?? ""
}

export function clean(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim()
}

function cssEscape(s: string): string {
  const css = (globalThis as { CSS?: { escape?: (v: string) => string } }).CSS
  return css?.escape ? css.escape(s) : s.replace(/["\\]/g, "\\$&")
}
