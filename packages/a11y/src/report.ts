// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/report.ts
// One finding per problem, in three groups:
//   fixed   — YuktAI changed it, safely (and can undo it)
//   check   — a person should look; we say how to fix it
//   unknown — we could not check it; it is NEVER counted as a pass
// ─────────────────────────────────────────────────────────────────────────────

export type FindingStatus = "fixed" | "check" | "unknown"

export interface Finding {
  rule: RuleId
  status: FindingStatus
  /** WCAG 2.2 success criterion, e.g. "1.4.3"; "" when none applies. */
  wcag: string
  /** Short CSS-like path to the element, for people. */
  where: string
  /** Values for the message, e.g. { ratio: 3.1, required: 4.5 }. */
  data?: Record<string, string | number>
  /** The element itself (not serializable). */
  el?: Element
}

export interface Report {
  level: "off" | "AA" | "AAA"
  mode: "auto" | "check" | "off"
  fixed: Finding[]
  check: Finding[]
  unknown: Finding[]
  /** Elements looked at. */
  scanned: number
  /** ISO time of the run. */
  at: string
}

export type RuleId =
  | "page-lang-missing"
  | "page-lang-mismatch"
  | "part-lang-missing"
  | "contrast"
  | "contrast-unknown"
  | "img-alt-missing"
  | "control-name-missing"
  | "control-name-symbols"
  | "skip-link-broken"
  | "fake-button"
  | "clickable-not-focusable"
  | "field-label-missing"
  | "heading-skip"
  | "h1-count"
  | "link-text-vague"
  | "iframe-title-missing"
  | "iframe-cross-origin"
  | "table-headers-missing"
  | "media-autoplay"
  | "tabindex-positive"
  | "aria-hidden-focusable"
  | "main-landmark-missing"
  | "closed-shadow-root"

export const WCAG: Record<RuleId, string> = {
  "page-lang-missing": "3.1.1",
  "page-lang-mismatch": "3.1.1",
  "part-lang-missing": "3.1.2",
  contrast: "1.4.3",
  "contrast-unknown": "1.4.3",
  "img-alt-missing": "1.1.1",
  "control-name-missing": "4.1.2",
  "control-name-symbols": "2.4.6",
  "skip-link-broken": "2.4.1",
  "fake-button": "4.1.2",
  "clickable-not-focusable": "2.1.1",
  "field-label-missing": "3.3.2",
  "heading-skip": "1.3.1",
  "h1-count": "1.3.1",
  "link-text-vague": "2.4.4",
  "iframe-title-missing": "4.1.2",
  "iframe-cross-origin": "",
  "table-headers-missing": "1.3.1",
  "media-autoplay": "1.4.2",
  "tabindex-positive": "2.4.3",
  "aria-hidden-focusable": "4.1.2",
  "main-landmark-missing": "2.4.1",
  "closed-shadow-root": "",
}

type Lang = "en" | "te"

/** Message templates. {name} is filled from Finding.data. */
export const MESSAGES: Record<Lang, Record<RuleId, string>> = {
  en: {
    "page-lang-missing": "The page has no lang. Detected: {lang}.",
    "page-lang-mismatch": "<html lang=\"{declared}\"> but the text is {detected}.",
    "part-lang-missing": "A part in {lang} had no lang.",
    contrast: "Text contrast {ratio}:1, needs {required}:1.",
    "contrast-unknown": "Contrast not checked: {reason}.",
    "img-alt-missing": "Image has no alt text. Describe it, or use alt=\"\" if it is decoration.",
    "control-name-missing": "A {tag} has no name a screen reader can say.",
    "control-name-symbols": "A {tag} is named only by \"{text}\": a screen reader says the symbol's name, not what it does. Add aria-label.",
    "skip-link-broken": "The \"skip to content\" link points to \"{target}\", which is not on the page.",
    "fake-button": "A clickable {tag} was not a button. Added role, focus and Enter/Space. A real <button> is better.",
    "clickable-not-focusable": "Something clickable ({tag}) cannot be reached by keyboard.",
    "field-label-missing": "A form field has no label.",
    "heading-skip": "Heading jumps from h{from} to h{to}.",
    "h1-count": "The page has {count} h1 headings; one is expected.",
    "link-text-vague": "Link text \"{text}\" does not say where it goes.",
    "iframe-title-missing": "An iframe has no title.",
    "iframe-cross-origin": "Content from another site (iframe) cannot be checked from here.",
    "table-headers-missing": "A data table has no header cells (th).",
    "media-autoplay": "Media plays by itself. Give a way to pause it.",
    "tabindex-positive": "tabindex=\"{value}\" changes the Tab order.",
    "aria-hidden-focusable": "A hidden (aria-hidden) element can still take focus.",
    "main-landmark-missing": "The page has no <main>.",
    "closed-shadow-root": "A closed component cannot be checked from outside.",
  },
  te: {
    "page-lang-missing": "పేజీకి lang లేదు. గుర్తించిన భాష: {lang}.",
    "page-lang-mismatch": "<html lang=\"{declared}\"> ఉంది, కానీ text {detected} లో ఉంది.",
    "part-lang-missing": "{lang} భాగానికి lang లేదు.",
    contrast: "Text contrast {ratio}:1, కనీసం {required}:1 కావాలి.",
    "contrast-unknown": "Contrast check చేయలేకపోయాం: {reason}.",
    "img-alt-missing": "Image కి alt లేదు. వివరణ రాయండి, అలంకారమైతే alt=\"\" పెట్టండి.",
    "control-name-missing": "{tag} కి screen reader చెప్పగలిగే పేరు లేదు.",
    "control-name-symbols": "{tag} పేరు \"{text}\" అనే గుర్తు మాత్రమే: screen reader ఆ గుర్తు పేరు చెప్తుంది, button పని కాదు. aria-label జోడించండి.",
    "skip-link-broken": "\"Skip to content\" link \"{target}\" కి వెళ్తుంది, అది page లో లేదు.",
    "fake-button": "Click చేసే {tag} button కాదు. Role, focus, Enter/Space జోడించాం. నిజమైన <button> ఇంకా మంచిది.",
    "clickable-not-focusable": "Click చేసే {tag} ని keyboard తో చేరలేము.",
    "field-label-missing": "Form field కి label లేదు.",
    "heading-skip": "Heading h{from} నుండి h{to} కి దూకింది.",
    "h1-count": "పేజీలో {count} h1 లు ఉన్నాయి; ఒకటి ఉండాలి.",
    "link-text-vague": "Link text \"{text}\" ఎక్కడికి వెళ్తుందో చెప్పదు.",
    "iframe-title-missing": "iframe కి title లేదు.",
    "iframe-cross-origin": "వేరే site content (iframe) ని ఇక్కడి నుండి check చేయలేము.",
    "table-headers-missing": "Data table కి header cells (th) లేవు.",
    "media-autoplay": "Media తనంతట తానే play అవుతుంది. ఆపే మార్గం ఇవ్వండి.",
    "tabindex-positive": "tabindex=\"{value}\" Tab క్రమాన్ని మారుస్తుంది.",
    "aria-hidden-focusable": "దాచిన (aria-hidden) element కి focus వస్తుంది.",
    "main-landmark-missing": "పేజీలో <main> లేదు.",
    "closed-shadow-root": "మూసి ఉన్న component ని బయటి నుండి check చేయలేము.",
  },
}

export function message(f: Finding, lang: Lang = "en"): string {
  const t = MESSAGES[lang][f.rule] ?? f.rule
  return t.replace(/\{(\w+)\}/g, (_, k) => String(f.data?.[k] ?? ""))
}

/** A short path for people: tag#id.class (up to 3 levels). */
export function describe(el: Element): string {
  const part = (e: Element) => {
    let s = e.tagName.toLowerCase()
    if (e.id) return s + "#" + e.id
    const cls = (e.getAttribute("class") ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2)
    if (cls.length) s += "." + cls.join(".")
    return s
  }
  const parts: string[] = []
  let node: Element | null = el
  while (node && parts.length < 3 && node.tagName.toLowerCase() !== "body" && node.tagName.toLowerCase() !== "html") {
    parts.unshift(part(node))
    if (node.id) break
    node = node.parentElement
  }
  return parts.join(" > ") || el.tagName.toLowerCase()
}

/** Report without element references, safe for JSON and postMessage. */
export function toJSON(r: Report): Omit<Report, "fixed" | "check" | "unknown"> & Record<FindingStatus, Omit<Finding, "el">[]> {
  const strip = (list: Finding[]) => list.map(({ el: _el, ...rest }) => rest)
  return { ...r, fixed: strip(r.fixed), check: strip(r.check), unknown: strip(r.unknown) }
}
