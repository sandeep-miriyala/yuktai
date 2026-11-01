import { describe, expect, it } from "vitest"
import { Window } from "happy-dom"
import { build } from "../src/ui/dom"
import { icon } from "../src/ui/icons"
import { escapeHtml, renderMarkdown } from "../src/ui/markdown"
import { STYLES } from "../src/ui/styles"

// The fallback builder (sites that enforce Trusted Types and don't allow our
// policy) must give the same DOM as innerHTML for the panel's own markup.
describe("Trusted Types fallback builder", () => {
  const doc = new Window().document as unknown as Document
  const same = (html: string) => {
    const a = doc.createElement("div")
    a.innerHTML = html
    const b = doc.createElement("div")
    b.appendChild(build(html, doc))
    expect(b.innerHTML).toBe(a.innerHTML)
  }

  it("matches innerHTML for panel markup", () => {
    same(`<button class="iconbtn" type="button" data-action="copy" aria-label="${escapeHtml('Copy "this" & <that>')}">${icon("copy", 18)}</button>`)
    same(`<div class="msg bot" data-id="3" aria-busy="false"><span class="sr">Assistant:</span><div class="body">${renderMarkdown("**Install**: run `npm i` <b>x</b> & done\n\n- one\n- two")}</div></div>`)
    same(`<ul class="chips"><li><button class="chip auto" data-q="${escapeHtml("ఎలా install చేయాలి?")}">${icon("spark", 16)}<span>ఎలా install చేయాలి?</span></button></li></ul>`)
    same(`<style>${STYLES}</style><p>a<br>b</p>`)
  })

  it("makes SVG icons in the SVG namespace", () => {
    const f = build(icon("chat", 22), doc)
    const svg = f.firstChild as Element
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.firstElementChild?.namespaceURI).toBe("http://www.w3.org/2000/svg")
  })

  it("never adds inline event handlers", () => {
    const f = build(`<img src="x" onerror="alert(1)"><b onclick="x()">t</b>`, doc)
    expect((f.firstChild as Element).hasAttribute("onerror")).toBe(false)
    expect((f.lastChild as Element).hasAttribute("onclick")).toBe(false)
  })
})
