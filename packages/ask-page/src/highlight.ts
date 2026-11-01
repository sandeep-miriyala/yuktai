// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/highlight.ts
// Shows where an answer came from. Uses the CSS Custom Highlight API, which
// paints ranges without changing the page's DOM; older browsers get an
// outline instead. Scrolls the source into view (instantly with reduced motion).
// ─────────────────────────────────────────────────────────────────────────────

const NAME = "yuktai-ask-source"
const STYLE_ID = "yuktai-ask-highlight-style"
const FALLBACK_ATTR = "data-yuktai-ask-source"

/* eslint-disable @typescript-eslint/no-explicit-any */
function api(doc: Document): { highlights: Map<string, unknown> & { set(k: string, v: unknown): void; delete(k: string): void }; Highlight: any } | null {
  const w = doc.defaultView as any
  if (w?.CSS?.highlights && typeof w.Highlight === "function") return { highlights: w.CSS.highlights, Highlight: w.Highlight }
  return null
}

function ensureStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return
  const s = doc.createElement("style")
  s.id = STYLE_ID
  s.textContent = `
::highlight(${NAME}) { background-color: #fde68a; color: #111827; }
[${FALLBACK_ATTR}] { outline: 3px solid #f59e0b !important; outline-offset: 3px !important; border-radius: 4px; background-color: rgba(253, 230, 138, 0.35) !important; }
@media (forced-colors: active) {
  ::highlight(${NAME}) { background-color: Highlight; color: HighlightText; }
  [${FALLBACK_ATTR}] { outline-color: Highlight !important; }
}`
  ;(doc.head ?? doc.documentElement).appendChild(s)
}

export function clearHighlight(doc: Document = document): void {
  api(doc)?.highlights.delete(NAME)
  doc.querySelectorAll(`[${FALLBACK_ATTR}]`).forEach((e) => e.removeAttribute(FALLBACK_ATTR))
}

/** Highlights the given elements and scrolls the first into view. */
export function highlightElements(elements: Element[], doc: Document = document): boolean {
  clearHighlight(doc)
  const els = elements.filter((e) => e && e.isConnected)
  if (!els.length) return false
  ensureStyle(doc)
  const a = api(doc)
  if (a) {
    const ranges = els.map((el) => {
      const r = doc.createRange()
      r.selectNodeContents(el)
      return r
    })
    a.highlights.set(NAME, new a.Highlight(...ranges))
  } else {
    els.forEach((e) => e.setAttribute(FALLBACK_ATTR, ""))
  }
  const reduce = doc.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  try {
    els[0].scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" })
  } catch {
    els[0].scrollIntoView()
  }
  return true
}

/** Moves keyboard focus to the source, for "Go to source". */
export function focusElement(el: Element): void {
  const h = el as HTMLElement
  if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1")
  h.focus({ preventScroll: true })
}
