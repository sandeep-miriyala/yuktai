// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/language.ts
//
// Finds the language of text from its script (works in every browser, no AI),
// and marks parts of a page whose language differs from the page's (WCAG
// 3.1.1 Language of Page, 3.1.2 Language of Parts). Scripts that several
// languages share (Devanagari, Arabic, Bengali, Latin) get a best guess, which
// Chrome's LanguageDetector can refine when the page asks for it.
//
// Rules: a `lang` the author wrote is never changed; only missing ones are
// added, and every one we add carries data-yuktai-lang so it can be undone.
// Typing areas, code and anything inside data-yuktai-a11y="off" are skipped.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScriptInfo {
  script: string
  /** BCP 47 language used when this script is all we know. */
  lang: string
  /** True when other languages share the script (the guess may be wrong). */
  shared: boolean
}

const SCRIPTS: { script: string; lang: string; shared: boolean; from: number; to: number }[] = [
  { script: "Telugu", lang: "te", shared: false, from: 0x0c00, to: 0x0c7f },
  { script: "Kannada", lang: "kn", shared: false, from: 0x0c80, to: 0x0cff },
  { script: "Tamil", lang: "ta", shared: false, from: 0x0b80, to: 0x0bff },
  { script: "Malayalam", lang: "ml", shared: false, from: 0x0d00, to: 0x0d7f },
  { script: "Devanagari", lang: "hi", shared: true, from: 0x0900, to: 0x097f },
  { script: "Bengali", lang: "bn", shared: true, from: 0x0980, to: 0x09ff },
  { script: "Gurmukhi", lang: "pa", shared: false, from: 0x0a00, to: 0x0a7f },
  { script: "Gujarati", lang: "gu", shared: false, from: 0x0a80, to: 0x0aff },
  { script: "Oriya", lang: "or", shared: false, from: 0x0b00, to: 0x0b7f },
  { script: "Sinhala", lang: "si", shared: false, from: 0x0d80, to: 0x0dff },
  { script: "Arabic", lang: "ar", shared: true, from: 0x0600, to: 0x06ff },
  { script: "Hebrew", lang: "he", shared: true, from: 0x0590, to: 0x05ff },
  { script: "Thai", lang: "th", shared: false, from: 0x0e00, to: 0x0e7f },
  { script: "Greek", lang: "el", shared: false, from: 0x0370, to: 0x03ff },
  { script: "Cyrillic", lang: "ru", shared: true, from: 0x0400, to: 0x04ff },
  { script: "Hangul", lang: "ko", shared: false, from: 0xac00, to: 0xd7af },
  { script: "Kana", lang: "ja", shared: false, from: 0x3040, to: 0x30ff },
  { script: "Han", lang: "zh", shared: true, from: 0x4e00, to: 0x9fff },
  { script: "Latin", lang: "en", shared: true, from: 0x0041, to: 0x024f },
]

const RTL = new Set(["ar", "ur", "fa", "he", "sd", "ks", "ps", "yi", "dv", "ug"])

/** True for languages written right to left. */
export const isRtl = (lang: string) => RTL.has(primary(lang))

/** "te-IN" → "te". */
export const primary = (lang: string) => (lang || "").toLowerCase().split(/[-_]/)[0]

/** The script of one character, or null for digits, spaces and punctuation. */
export function scriptOf(ch: string): ScriptInfo | null {
  const cp = ch.codePointAt(0)!
  // Latin letters only (A–Z, a–z, accented), not digits or punctuation.
  if (cp < 0x0080 && !/[A-Za-z]/.test(ch)) return null
  if (cp >= 0x0080 && cp < 0x00c0) return null
  for (const s of SCRIPTS) if (cp >= s.from && cp <= s.to) return { script: s.script, lang: s.lang, shared: s.shared }
  return null
}

export interface Detection {
  lang: string
  script: string
  /** Share of letters in the winning script, 0–1. */
  confidence: number
  letters: number
  shared: boolean
}

/** Language of a piece of text from its letters. Null when it has (almost) no letters. */
export function detectText(text: string, minLetters = 3): Detection | null {
  const counts = new Map<string, { n: number; info: ScriptInfo }>()
  let letters = 0
  for (const ch of text) {
    const info = scriptOf(ch)
    if (!info) continue
    letters++
    const c = counts.get(info.script)
    if (c) c.n++
    else counts.set(info.script, { n: 1, info })
  }
  if (letters < minLetters) return null
  let best: { n: number; info: ScriptInfo } | null = null
  for (const c of counts.values()) if (!best || c.n > best.n) best = c
  if (!best) return null
  return { lang: best.info.lang, script: best.info.script, confidence: best.n / letters, letters, shared: best.info.shared }
}

export interface Segment {
  text: string
  lang: string
}

/**
 * Splits text where the script changes, so each part can be read with the
 * right voice. Digits, spaces and punctuation stay with the part around them.
 */
export function splitByLanguage(text: string, fallback: string): Segment[] {
  const out: Segment[] = []
  let cur = ""
  let curLang: string | null = null
  for (const ch of text) {
    const info = scriptOf(ch)
    const lang = info ? langForScript(info, fallback) : null
    if (lang && curLang && lang !== curLang) {
      out.push({ text: cur, lang: curLang })
      cur = ""
    }
    if (lang) curLang = lang
    cur += ch
  }
  if (cur) out.push({ text: cur, lang: curLang ?? fallback })
  // Merge pieces with almost no letters into their neighbour.
  return out.filter((s) => s.text.trim()).reduce<Segment[]>((acc, s) => {
    const prev = acc[acc.length - 1]
    if (prev && prev.lang === s.lang) prev.text += s.text
    else acc.push({ ...s })
    return acc
  }, [])
}

/** The language for letters of one script: the fallback when it is written in that script (Marathi stays Marathi), else the script's own. */
function langForScript(info: ScriptInfo, fallback: string): string {
  const d: Detection = { lang: info.lang, script: info.script, confidence: 1, letters: 1, shared: info.shared }
  return fallback && sameScriptFamily(fallback, d) ? fallback : info.lang
}

/** Languages written in Latin letters that we should not relabel as English. */
const LATIN_LANGS = new Set(["en", "fr", "de", "es", "pt", "it", "nl", "sv", "da", "no", "nb", "fi", "pl", "cs", "ro", "hu", "tr", "id", "ms", "vi", "sw", "tl"])
const isLatinLang = (lang: string) => LATIN_LANGS.has(primary(lang))

/** The language an element inherits: its own or the closest ancestor's `lang` (crossing shadow roots). */
export function inheritedLang(el: Element): string {
  let node: Element | null = el
  while (node) {
    const l = node.getAttribute("lang")
    if (l !== null && l !== "") return l
    node = node.parentElement ?? ((node.getRootNode() as ShadowRoot).host ?? null)
  }
  return ""
}

const SKIP = "script,style,noscript,template,code,pre,kbd,samp,var,textarea,input,select,option,[contenteditable=''],[contenteditable='true'],[data-yuktai-a11y='off'],svg,math"

/** True when the element is a typing area, code, or switched off for YuktAI. */
export function isSkipped(el: Element): boolean {
  try {
    return !!el.closest(SKIP)
  } catch {
    return false
  }
}

/** Text that belongs to this element itself (not to child blocks we label separately). */
function ownText(el: Element): string {
  let t = ""
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === 3) t += n.textContent ?? ""
    else if (n.nodeType === 1) {
      const c = n as Element
      if (BLOCKS.has(c.tagName.toLowerCase()) || c.hasAttribute("lang") || isSkipped(c)) continue
      t += ownText(c)
    }
  }
  return t
}

const BLOCKS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "dt", "dd", "td", "th", "caption", "figcaption",
  "blockquote", "q", "label", "legend", "button", "a", "summary", "div", "section", "article", "aside",
  "header", "footer", "nav", "main", "span", "em", "strong", "b", "i", "small", "cite", "title",
])

/** Body text of a document, without typing areas, code or switched-off parts. */
export function pageText(doc: Document, limit = 20000): string {
  const body = doc.body
  if (!body) return ""
  const walker = doc.createTreeWalker(body, 4 /* SHOW_TEXT */)
  let out = ""
  while (walker.nextNode() && out.length < limit) {
    const parent = (walker.currentNode as Text).parentElement
    if (parent && !isSkipped(parent)) out += walker.currentNode.textContent + " "
  }
  return out
}

export interface PageLanguage {
  /** What <html lang> says ("" when missing). */
  declared: string
  /** What the text says, or null when there is too little text. */
  detected: Detection | null
  /** True when the declared language and the text clearly disagree. */
  mismatch: boolean
}

export function pageLanguage(doc: Document): PageLanguage {
  const declared = doc.documentElement.getAttribute("lang") ?? ""
  const detected = detectText(pageText(doc), 20)
  const mismatch = !!(declared && detected && detected.confidence >= 0.7 && !sameScriptFamily(declared, detected))
  return { declared, detected, mismatch }
}

/** Whether `lang` is written in the script `d` found (so "mr" and Devanagari agree, "en" and Telugu do not). */
function sameScriptFamily(lang: string, d: Detection): boolean {
  const p = primary(lang)
  if (p === d.lang) return true
  const byScript: Record<string, string[]> = {
    Devanagari: ["hi", "mr", "ne", "sa", "kok", "mai", "doi", "brx", "bho"],
    Bengali: ["bn", "as", "mni"],
    Arabic: ["ar", "ur", "fa", "sd", "ks", "ps"],
    Latin: Array.from(LATIN_LANGS),
    Cyrillic: ["ru", "uk", "bg", "sr", "be", "kk"],
    Han: ["zh", "ja"],
    Hebrew: ["he", "yi"],
  }
  return (byScript[d.script] ?? []).includes(p)
}

export interface LangChange {
  el: Element
  lang: string
  /** "page" for <html>, "part" for an element. */
  scope: "page" | "part"
}

/**
 * Adds `lang` where it is missing: on <html> when the page has none, and on
 * elements whose text is in another language than they inherit. Returns what
 * it set (or would set, with apply=false). Never overwrites an existing `lang`.
 */
export function annotateLanguages(doc: Document, opts: { apply: boolean; root?: Element | ShadowRoot } = { apply: true }): LangChange[] {
  const changes: LangChange[] = []
  const html = doc.documentElement
  if (!html.getAttribute("lang")) {
    const d = detectText(pageText(doc), 20)
    if (d) {
      changes.push({ el: html, lang: d.lang, scope: "page" })
      if (opts.apply) {
        html.setAttribute("lang", d.lang)
        html.setAttribute("data-yuktai-lang", "added")
      }
    }
  }
  const root = opts.root ?? doc.body
  if (!root) return changes
  const els = Array.from(root.querySelectorAll("*"))
  for (const el of els) {
    const tag = el.tagName.toLowerCase()
    if (!BLOCKS.has(tag) || el.hasAttribute("lang") || isSkipped(el)) continue
    const d = detectText(ownText(el), 3)
    if (!d || d.confidence < 0.6) continue
    const inherited = opts.apply ? inheritedLang(el) : inheritedLangPlanned(el, changes)
    if (!inherited || !sameScriptFamily(inherited, d)) {
      // A Latin-script part inside a Latin-language page stays as it is.
      if (d.script === "Latin" && inherited && isLatinLang(inherited)) continue
      changes.push({ el, lang: d.lang, scope: "part" })
      if (opts.apply) {
        el.setAttribute("lang", d.lang)
        el.setAttribute("data-yuktai-lang", "added")
        if (isRtl(d.lang) && !el.hasAttribute("dir")) {
          el.setAttribute("dir", "rtl")
          el.setAttribute("data-yuktai-lang", "added-dir")
        }
      }
    }
  }
  return changes
}

function inheritedLangPlanned(el: Element, planned: LangChange[]): string {
  let node: Element | null = el.parentElement
  while (node) {
    const hit = planned.find((c) => c.el === node)
    if (hit) return hit.lang
    const l = node.getAttribute("lang")
    if (l) return l
    node = node.parentElement
  }
  return ""
}

/** Removes every `lang` (and `dir`) this file added. */
export function undoLanguages(doc: Document): number {
  let n = 0
  doc.querySelectorAll("[data-yuktai-lang]").forEach((el) => {
    if (el.getAttribute("data-yuktai-lang") === "added-dir") el.removeAttribute("dir")
    el.removeAttribute("lang")
    el.removeAttribute("data-yuktai-lang")
    n++
  })
  return n
}

interface LanguageDetectorLike {
  detect(text: string): Promise<{ detectedLanguage: string; confidence: number }[]>
}

/**
 * Refines a guess for a shared script (Devanagari → Hindi or Marathi?) with
 * Chrome's on-device LanguageDetector. Returns the guess unchanged when the
 * browser has no detector or is not sure.
 */
export async function refineWithDetector(text: string, guess: Detection): Promise<string> {
  if (!guess.shared) return guess.lang
  const LD = (globalThis as { LanguageDetector?: { create(): Promise<LanguageDetectorLike>; availability?: () => Promise<string> } }).LanguageDetector
  if (!LD) return guess.lang
  try {
    if (LD.availability && (await LD.availability()) === "unavailable") return guess.lang
    const det = await LD.create()
    const [top] = await det.detect(text.slice(0, 2000))
    if (top && top.confidence >= 0.6 && top.detectedLanguage !== "und") {
      return sameScriptFamily(top.detectedLanguage, guess) ? top.detectedLanguage : guess.lang
    }
  } catch {
    /* no detector: keep the script guess */
  }
  return guess.lang
}
