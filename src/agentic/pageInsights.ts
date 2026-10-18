// ─────────────────────────────────────────────────────────────────────────────
// Idea 2 — Page Understanding Agent
// Inspects the rendered DOM and answers questions like "What does this page
// do?" or "Which form fields are missing labels?" — offline, rule-based.
// Plug in your own model through `summarize` if you want richer wording.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import { accessibleName, cleanText, queryAll, resolveRoot, selectorFor, shorten, type AuditRoot, isDocument } from "./dom"
import { reviewForms } from "./formReview"

export interface PageOutline {
  title: string
  description: string
  language: string
  headings: Array<{ level: number; text: string }>
  landmarks: Record<string, number>
  counts: { links: number; buttons: number; images: number; forms: number; tables: number; fields: number }
  unlabeledFields: Array<{ type: string; hint: string; selector: string }>
  imagesWithoutAlt: Array<{ src: string; selector: string }>
  purpose: string
}

export interface PageAnswer {
  intent: PageIntent
  answer: string
  /** Elements the answer refers to, so the UI can highlight them. */
  targets: string[]
  suggestions: string[]
}

export type PageIntent =
  | "purpose"
  | "missing-labels"
  | "images"
  | "structure"
  | "forms"
  | "links"
  | "counts"
  | "unknown"

export function analyzePage(root?: AuditRoot): PageOutline {
  const r = resolveRoot(root)
  const empty: PageOutline = {
    title: "", description: "", language: "", headings: [], landmarks: {},
    counts: { links: 0, buttons: 0, images: 0, forms: 0, tables: 0, fields: 0 },
    unlabeledFields: [], imagesWithoutAlt: [], purpose: "",
  }
  if (!r) return empty
  const doc = isDocument(r) ? r : r.ownerDocument

  const headings = queryAll(r, "h1,h2,h3,h4,h5,h6").map((h) => ({ level: Number(h.tagName[1]), text: shorten(h.textContent ?? "", 80) }))
  const landmarks: Record<string, number> = {}
  for (const [name, sel] of Object.entries({
    header: "header,[role='banner']",
    navigation: "nav,[role='navigation']",
    main: "main,[role='main']",
    search: "search,[role='search']",
    footer: "footer,[role='contentinfo']",
  })) landmarks[name] = queryAll(r, sel).length

  const fields = queryAll(r, "input,select,textarea").filter(
    (el) => !["hidden", "submit", "button", "reset", "image"].includes((el.getAttribute("type") ?? "text").toLowerCase())
  )
  const unlabeledFields = fields
    .filter((el) => !accessibleName(el))
    .map((el) => ({
      type: el.tagName === "INPUT" ? el.getAttribute("type") ?? "text" : el.tagName.toLowerCase(),
      hint: el.getAttribute("placeholder") || el.getAttribute("name") || "",
      selector: selectorFor(el),
    }))
  const imagesWithoutAlt = queryAll(r, "img:not([alt])").map((img) => ({ src: img.getAttribute("src") ?? "", selector: selectorFor(img) }))

  const outline: PageOutline = {
    title: doc.title,
    description: cleanText(doc.querySelector('meta[name="description"]')?.getAttribute("content")),
    language: doc.documentElement.getAttribute("lang") ?? "",
    headings,
    landmarks,
    counts: {
      links: queryAll(r, "a[href]").length,
      buttons: queryAll(r, "button,[role='button'],input[type='submit']").length,
      images: queryAll(r, "img").length,
      forms: queryAll(r, "form,[role='form']").length,
      tables: queryAll(r, "table,[role='grid'],[role='table']").length,
      fields: fields.length,
    },
    unlabeledFields,
    imagesWithoutAlt,
    purpose: "",
  }
  outline.purpose = describePurpose(outline, fields)
  return outline
}

function describePurpose(o: PageOutline, fields: Element[]): string {
  const name = o.headings.find((h) => h.level === 1)?.text || o.title || "This page"
  const text = fields.map((f) => `${f.getAttribute("type")} ${f.getAttribute("name")} ${accessibleName(f)}`).join(" ").toLowerCase()
  const actions: string[] = []
  if (/password/.test(text)) actions.push("sign in or create an account")
  else if (/search|query|వెతుకు/.test(text) || o.landmarks.search) actions.push("search")
  if (/message|comment|feedback|contact|enquiry/.test(text)) actions.push("send a message")
  if (/card|payment|upi|amount/.test(text)) actions.push("make a payment")
  if (o.counts.tables) actions.push(`browse ${o.counts.tables} table(s) of data`)
  if (!actions.length && o.counts.forms) actions.push(`fill in ${o.counts.forms} form(s)`)
  if (!actions.length) actions.push("read content")

  const sections = o.headings.filter((h) => h.level === 2).slice(0, 5).map((h) => h.text)
  return [
    `"${name}" lets you ${actions.join(", ")}.`,
    o.description ? `It describes itself as: ${shorten(o.description, 140)}` : "",
    sections.length ? `Main sections: ${sections.join(" · ")}.` : "",
  ].filter(Boolean).join(" ")
}

const INTENTS: Array<[PageIntent, RegExp]> = [
  ["missing-labels", /label|unlabel|లేబుల్/i],
  ["images", /image|alt text|picture|photo|చిత్ర/i],
  ["structure", /heading|structure|outline|section|landmark|శీర్షిక/i],
  ["forms", /form|field|input|ఫారం/i],
  ["links", /link|లింక్/i],
  ["counts", /how many|count|ఎన్ని/i],
  ["purpose", /what (does|is)|purpose|about|summar|explain|ఏమి|గురించి/i],
]

export function detectPageIntent(question: string): PageIntent {
  for (const [intent, pattern] of INTENTS) if (pattern.test(question)) return intent
  return "unknown"
}

/**
 * Answers a question about the current page.
 * @param summarize Optional hook (e.g. Gemini Nano or your own model) used for "purpose" questions.
 */
export async function askAboutPage(
  question: string,
  options: { root?: AuditRoot; summarize?: (pageText: string) => Promise<string> } = {}
): Promise<PageAnswer> {
  const o = analyzePage(options.root)
  const intent = detectPageIntent(question)

  switch (intent) {
    case "missing-labels": {
      if (!o.unlabeledFields.length) {
        return { intent, answer: `All ${o.counts.fields} form field(s) have labels.`, targets: [], suggestions: [] }
      }
      return {
        intent,
        answer: `${o.unlabeledFields.length} of ${o.counts.fields} field(s) have no label: ${o.unlabeledFields
          .map((f) => `${f.type}${f.hint ? ` ("${f.hint}")` : ""}`)
          .join(", ")}.`,
        targets: o.unlabeledFields.map((f) => f.selector),
        suggestions: ["Add a visible <label for=…> to each field.", "Run the Accessibility Copilot to add aria-labels from placeholders as a quick fix."],
      }
    }
    case "images":
      return {
        intent,
        answer: o.imagesWithoutAlt.length
          ? `${o.imagesWithoutAlt.length} of ${o.counts.images} image(s) have no alt text.`
          : `All ${o.counts.images} image(s) have alt text.`,
        targets: o.imagesWithoutAlt.map((i) => i.selector),
        suggestions: o.imagesWithoutAlt.length ? ['Describe meaningful images in alt; use alt="" for decorative ones.'] : [],
      }
    case "structure": {
      const outline = o.headings.slice(0, 15).map((h) => `${"  ".repeat(h.level - 1)}h${h.level} ${h.text}`).join("\n")
      const missing = Object.entries(o.landmarks).filter(([, n]) => n === 0).map(([k]) => k)
      return {
        intent,
        answer: `${o.headings.length} heading(s).\n${outline}${missing.length ? `\nMissing landmarks: ${missing.join(", ")}.` : ""}`,
        targets: [],
        suggestions: missing.includes("main") ? ["Wrap the primary content in <main>."] : [],
      }
    }
    case "forms": {
      const reviews = reviewForms({ root: options.root })
      return {
        intent,
        answer: reviews.length ? reviews.map((r) => r.summary).join("\n") : "There are no forms on this page.",
        targets: reviews.flatMap((r) => r.findings.map((f) => f.selector).filter((s): s is string => Boolean(s))),
        suggestions: reviews.flatMap((r) => r.findings.slice(0, 3).map((f) => f.suggestion)),
      }
    }
    case "links":
    case "counts": {
      const c = o.counts
      return {
        intent,
        answer: `${c.links} links, ${c.buttons} buttons, ${c.fields} form fields in ${c.forms} form(s), ${c.images} images, ${c.tables} tables.`,
        targets: [],
        suggestions: [],
      }
    }
    case "purpose":
    case "unknown": {
      let answer = o.purpose
      if (options.summarize) {
        try {
          const r = resolveRoot(options.root)
          const text = cleanText((r && isDocument(r) ? r.body : (r as Element | null))?.textContent).slice(0, 4000)
          answer = (await options.summarize(text)) || answer
        } catch {
          /* fall back to the rule-based description */
        }
      }
      const suggestions: string[] = []
      if (o.unlabeledFields.length) suggestions.push(`${o.unlabeledFields.length} form field(s) need labels.`)
      if (o.imagesWithoutAlt.length) suggestions.push(`${o.imagesWithoutAlt.length} image(s) need alt text.`)
      return { intent, answer, targets: [], suggestions }
    }
  }
}
