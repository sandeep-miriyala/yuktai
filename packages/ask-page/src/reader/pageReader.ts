// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/reader/pageReader.ts
//
// Reads the live page into blocks (paragraphs, list items, table rows, code…),
// each remembering its element and the heading above it. Reading the live
// DOM, not a copy, is what lets an answer highlight its source later.
// Everything passes through the privacy filter first.
// ─────────────────────────────────────────────────────────────────────────────

import type { Block, PageSnapshot } from "../types"
import { CHROME, clean, isHidden, isPrivate, looksSensitive, NEVER_READ } from "./privacyFilter"
import { chunk } from "./chunker"
import { hashText } from "./hash"
import { detectScriptLang } from "../lang"

const BLOCK = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "LI", "DT", "DD", "TR", "CAPTION", "FIGCAPTION", "BLOCKQUOTE", "PRE", "SUMMARY", "LEGEND", "LABEL", "ADDRESS"])
const CONTAINER = new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "TD", "TH", "FIGURE", "DETAILS", "FORM", "FIELDSET", "TABLE", "TBODY", "THEAD", "UL", "OL", "DL", "HEADER", "ASIDE", "SPAN", "CENTER", "FONT"])
const HEADING = /^H[1-6]$/

export interface ReadOptions {
  /** CSS selector for the content root. */
  root?: string
  /** Extra selectors never to read. */
  exclude?: string[]
}

/** The element that holds the page's content. */
export function findRoot(doc: Document, selector?: string): Element {
  if (selector) {
    try {
      const el = doc.querySelector(selector)
      if (el) return el
    } catch {
      /* bad selector: fall through */
    }
  }
  const main = doc.querySelector("main, [role='main']")
  if (main) return main
  const articles = doc.querySelectorAll("article")
  if (articles.length === 1) return articles[0]
  return doc.body ?? doc.documentElement
}

function visible(el: Element): boolean {
  // Text in a closed <details> (FAQ answers) or hidden="until-found" is real
  // content the visitor can open: read it unless CSS hides it.
  if (el.closest("details:not([open]), [hidden='until-found']")) return !isHidden(el)
  const check = (el as Element & { checkVisibility?: (o?: object) => boolean }).checkVisibility
  if (typeof check === "function") {
    try {
      return check.call(el, { checkVisibilityCSS: true })
    } catch {
      /* older engines */
    }
  }
  return !isHidden(el)
}

/** Text of an element without anything private inside it. */
export function safeText(el: Element): string {
  const doc = el.ownerDocument
  const parts: string[] = []
  const walker = doc.createTreeWalker(el, 4 /* SHOW_TEXT */)
  let node = walker.nextNode()
  while (node) {
    const parent = node.parentElement
    if (parent && !parent.closest(NEVER_READ)) parts.push(node.nodeValue ?? "")
    node = walker.nextNode()
  }
  // images inside a block: their alt text is part of what the block says
  el.querySelectorAll("img[alt]").forEach((img) => {
    const alt = clean(img.getAttribute("alt"))
    if (alt && !img.closest(NEVER_READ)) parts.push(` ${alt} `)
  })
  return clean(parts.join(""))
}

function kindOf(tag: string): Block["kind"] {
  // <summary> names its <details> the way a heading names a section (FAQ pages)
  if (HEADING.test(tag) || tag === "SUMMARY") return "heading"
  if (tag === "PRE") return "code"
  if (tag === "LI" || tag === "DT" || tag === "DD") return "list"
  if (tag === "TR") return "cell"
  if (tag === "BLOCKQUOTE") return "quote"
  return "text"
}

// Memoized per read: each element is examined once, so big pages stay linear.
let blockMemo = new WeakMap<Element, boolean>()
function hasBlockInside(el: Element): boolean {
  const known = blockMemo.get(el)
  if (known !== undefined) return known
  let found = false
  for (const child of Array.from(el.children)) {
    if (BLOCK.has(child.tagName) || (CONTAINER.has(child.tagName) && child.tagName !== "SPAN" && child.tagName !== "FONT") || hasBlockInside(child)) {
      found = true
      break
    }
  }
  blockMemo.set(el, found)
  return found
}

/** Reads the page's blocks in document order. */
export function readBlocks(doc: Document, opts: ReadOptions = {}): Block[] {
  blockMemo = new WeakMap()
  const root = findRoot(doc, opts.root)
  const skipChrome = root === doc.body || root === doc.documentElement
  const extra = opts.exclude ?? []
  const blocks: Block[] = []
  const seen = new Set<string>()
  let heading = clean(doc.title)

  const all = root.querySelectorAll("*")
  for (const el of Array.from(all)) {
    const tag = el.tagName
    const isBlock = BLOCK.has(tag)
    const isLeafContainer = !isBlock && (tag === "DIV" || tag === "SECTION" || tag === "ARTICLE" || tag === "TD" || tag === "TH" || tag === "CENTER" || tag === "FONT" || tag === "SPAN") && !hasBlockInside(el) && el.closest("tr, p, li, h1, h2, h3, h4, h5, h6, pre, blockquote, label, legend") === null
    if (!isBlock && !isLeafContainer) continue
    // a block inside another block (p in li, label in p): the inner one wins
    if (isBlock && tag !== "TR" && hasBlockInside(el)) continue
    if (tag === "SPAN" || tag === "FONT") {
      // spans count only when their parent is not already a block
      const parent = el.parentElement
      if (!parent || BLOCK.has(parent.tagName) || !hasOwnText(el)) continue
    }
    if (isPrivate(el, extra)) continue
    if (skipChrome && el.closest(CHROME)) continue
    if (el.closest("pre") && tag !== "PRE") continue
    if (!visible(el)) continue

    let text = tag === "TR" ? rowText(el) : safeText(el)
    if (!text || text.length < 2) continue
    if (tag === "PRE") text = text.slice(0, 1200)
    const kind = kindOf(tag)
    if (kind === "heading") heading = text
    const key = `${kind}:${text}`
    if (seen.has(key)) continue
    seen.add(key)
    blocks.push({ el, text, heading, kind })
  }
  return blocks
}

function hasOwnText(el: Element): boolean {
  for (const n of Array.from(el.childNodes)) if (n.nodeType === 3 && (n.nodeValue ?? "").trim().length > 1) return true
  return false
}

function rowText(tr: Element): string {
  const cells = Array.from(tr.children).filter((c) => (c.tagName === "TD" || c.tagName === "TH") && !isPrivate(c))
  return cells.map((c) => safeText(c)).filter(Boolean).join(" | ")
}

/** Reads the whole page: blocks, passages, hash, language, sensitivity. */
export function readPage(doc: Document, opts: ReadOptions = {}): PageSnapshot {
  const blocks = readBlocks(doc, opts)
  const passages = chunk(blocks)
  const all = passages.map((p) => p.text).join("\n")
  const declared = clean(doc.documentElement.getAttribute("lang")).toLowerCase().split("-")[0]
  return {
    url: doc.location ? doc.location.origin + doc.location.pathname : "",
    title: clean(doc.title),
    lang: declared || detectScriptLang(all.slice(0, 4000)),
    blocks,
    passages,
    hash: hashText(all),
    sensitive: looksSensitive(doc),
  }
}
