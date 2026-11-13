// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/finder.ts
// Every element of a page, including those inside OPEN shadow roots (web
// components). What cannot be looked into is listed too, so the report can say
// "not checked" instead of "pass": closed shadow roots (seen from the
// outside only as a custom element with no shadowRoot) and iframes from
// another site.
// ─────────────────────────────────────────────────────────────────────────────

export interface FoundTree {
  elements: Element[]
  /** Custom elements whose inside we cannot see (closed shadow root, or not upgraded). */
  closed: Element[]
  /** Iframes we cannot read (another site, or blocked). */
  crossOrigin: HTMLIFrameElement[]
}

const isCustomElement = (el: Element) => el.tagName.includes("-")

export function findAll(root: Document | Element | ShadowRoot, limit = 50000): FoundTree {
  const out: FoundTree = { elements: [], closed: [], crossOrigin: [] }
  const visit = (node: Document | Element | ShadowRoot) => {
    const list = (node as ParentNode).querySelectorAll("*")
    for (const el of Array.from(list)) {
      if (out.elements.length >= limit) return
      if (el.closest("[data-yuktai-ui]")) continue // our own panel
      out.elements.push(el)
      const sr = (el as Element & { shadowRoot: ShadowRoot | null }).shadowRoot
      if (sr) visit(sr)
      else if (isCustomElement(el) && !el.children.length && !(el.textContent ?? "").trim() && el.ownerDocument.defaultView?.customElements?.get(el.tagName.toLowerCase())) {
        // A defined custom element that shows nothing in light DOM and has no
        // open shadow root: its content is in a closed shadow root.
        out.closed.push(el)
      }
      if (el.tagName === "IFRAME") {
        const f = el as HTMLIFrameElement
        let doc: Document | null = null
        try {
          doc = f.contentDocument
        } catch {
          doc = null
        }
        if (!doc && f.getAttribute("src") && !/^(about:|javascript:)/i.test(f.getAttribute("src") || "")) out.crossOrigin.push(f)
      }
    }
  }
  visit(root)
  return out
}
