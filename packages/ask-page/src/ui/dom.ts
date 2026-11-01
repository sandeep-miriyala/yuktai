// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/ui/dom.ts
//
// Trusted Types. Sites with `require-trusted-types-for 'script'` (Google,
// GitHub, many banks) throw on `el.innerHTML = "..."`. Every HTML write in the
// panel goes through setHTML():
//   1. a "yuktai-ask" Trusted Types policy, when the site allows it
//   2. plain innerHTML, when the site doesn't enforce Trusted Types
//   3. otherwise our own small builder that makes the elements one by one
//      (createElement is not a Trusted Types sink)
// All HTML passed here is the panel's own markup: page text and questions are
// escaped first (escapeHtml, renderMarkdown), so no policy loosens anything.
// ─────────────────────────────────────────────────────────────────────────────

interface Policy {
  createHTML(s: string): unknown
  createScriptURL(s: string): unknown
}

let policy: Policy | null | undefined

function getPolicy(): Policy | null {
  if (policy !== undefined) return policy
  policy = null
  const tt = (globalThis as { trustedTypes?: { createPolicy(n: string, r: object): Policy } }).trustedTypes
  if (tt?.createPolicy) {
    try {
      policy = tt.createPolicy("yuktai-ask", { createHTML: (s: string) => s, createScriptURL: (s: string) => s })
    } catch {
      /* the site lists allowed policy names: fall back to building elements */
    }
  }
  return policy
}

/** A script URL the browser accepts under Trusted Types (for the blob: worker). */
export function trustedScriptURL(url: string): string {
  const p = getPolicy()
  return p ? (p.createScriptURL(url) as string) : url
}

/** Sets an element's (or shadow root's) content from the panel's own HTML. */
export function setHTML(target: Element | ShadowRoot, html: string): void {
  const p = getPolicy()
  if (p) {
    ;(target as Element).innerHTML = p.createHTML(html) as string
    return
  }
  try {
    ;(target as Element).innerHTML = html
  } catch {
    target.replaceChildren(build(html, ownerDoc(target)))
  }
}

/** Replaces an element with the panel's own HTML (one or more elements). */
export function replaceWithHTML(el: Element, html: string): void {
  const tpl = el.ownerDocument.createElement("div")
  setHTML(tpl, html)
  el.replaceWith(...Array.from(tpl.childNodes))
}

function ownerDoc(t: Element | ShadowRoot): Document {
  return (t as Element).ownerDocument ?? (t as ShadowRoot).host.ownerDocument
}

// ── fallback builder ────────────────────────────────────────────────────────
// Enough HTML for the panel's markup: tags, quoted attributes, text, entities,
// SVG icons, <style>. Not a general parser; it never sees outside HTML.

const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "source", "wbr", "col", "area"])
const SVG_NS = "http://www.w3.org/2000/svg"
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    return ENT[e.toLowerCase()] ?? m
  })
}

export function build(html: string, doc: Document): DocumentFragment {
  const frag = doc.createDocumentFragment()
  const stack: (Node & ParentNode)[] = [frag]
  const svgDepth: boolean[] = [false]
  const top = () => stack[stack.length - 1]
  let i = 0
  while (i < html.length) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i)
      i = end < 0 ? html.length : end + 3
      continue
    }
    if (html[i] === "<" && html[i + 1] === "/") {
      const end = html.indexOf(">", i)
      if (stack.length > 1) {
        stack.pop()
        svgDepth.pop()
      }
      i = end < 0 ? html.length : end + 1
      continue
    }
    if (html[i] === "<" && /[a-zA-Z]/.test(html[i + 1] ?? "")) {
      const m = /^<([a-zA-Z][\w-]*)/.exec(html.slice(i))!
      const tag = m[1]
      i += m[0].length
      const attrs: [string, string][] = []
      // attributes until > or />
      for (;;) {
        while (/\s/.test(html[i] ?? "")) i++
        if (html[i] === ">" || html[i] === undefined) {
          i++
          break
        }
        if (html[i] === "/" && html[i + 1] === ">") {
          i += 2
          break
        }
        const a = /^([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/.exec(html.slice(i))
        if (!a) {
          i++
          continue
        }
        attrs.push([a[1], decodeEntities(a[2] ?? a[3] ?? a[4] ?? "")])
        i += a[0].length
      }
      const selfClosed = html[i - 2] === "/"
      const inSvg = svgDepth[svgDepth.length - 1] || tag.toLowerCase() === "svg"
      const el = inSvg ? doc.createElementNS(SVG_NS, tag) : doc.createElement(tag)
      for (const [k, v] of attrs) {
        if (/^on/i.test(k)) continue // never: the panel has no inline handlers
        el.setAttribute(k, v)
      }
      top().appendChild(el)
      const lower = tag.toLowerCase()
      if (lower === "style" || lower === "script" || lower === "textarea") {
        // raw text up to the closing tag (no script is ever generated)
        const close = html.toLowerCase().indexOf(`</${lower}`, i)
        const text = html.slice(i, close < 0 ? html.length : close)
        if (lower !== "script") el.textContent = lower === "textarea" ? decodeEntities(text) : text
        const end = close < 0 ? html.length : html.indexOf(">", close) + 1
        i = end
        continue
      }
      if (!selfClosed && !VOID.has(lower)) {
        stack.push(el)
        svgDepth.push(inSvg)
      }
      continue
    }
    const next = html.indexOf("<", i + 1)
    const text = html.slice(i, next < 0 ? html.length : next)
    top().appendChild(doc.createTextNode(decodeEntities(text)))
    i = next < 0 ? html.length : next
  }
  return frag
}
