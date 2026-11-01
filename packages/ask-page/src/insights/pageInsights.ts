// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/insights/pageInsights.ts
//
// Answers that need no model: what the page is, its sections, its forms (by
// label, never by value), its images and a quick accessibility check. Read
// straight from the page structure, so they are instant and exact.
// ─────────────────────────────────────────────────────────────────────────────

import type { PageSnapshot } from "../types"
import { clean, describeField, isPrivate } from "../reader/privacyFilter"
import { findRoot } from "../reader/pageReader"
import type { UiLang } from "../lang"

export interface Insight {
  text: string
  /** Block indexes or elements to highlight. */
  elements: Element[]
  ref: string
}

const L = (lang: UiLang, en: string, te: string) => (lang === "te" ? te : en)

function headings(doc: Document, root: Element, max = 3): Element[] {
  return Array.from(root.querySelectorAll(Array.from({ length: max }, (_, i) => `h${i + 1}`).join(","))).filter((h) => !isPrivate(h) && clean(h.textContent))
}

function firstSentences(text: string, n: number): string {
  const parts = text.split(/(?<=[.!?।])\s+/).filter((s) => s.trim().length > 20)
  return parts.slice(0, n).join(" ")
}

export function aboutPage(doc: Document, snap: PageSnapshot, lang: UiLang): Insight {
  const desc = clean(doc.querySelector("meta[name='description']")?.getAttribute("content"))
  const h1 = doc.querySelector("h1")
  const firstText = snap.blocks.find((b) => b.kind === "text" && b.text.length > 60)
  const lines: string[] = []
  lines.push(`**${snap.title || clean(h1?.textContent) || L(lang, "This page", "ఈ page")}**`)
  if (desc) lines.push(desc)
  if (firstText) lines.push(firstSentences(firstText.text, 2) || firstText.text.slice(0, 240))
  const els = [h1, firstText?.el].filter(Boolean) as Element[]
  return { text: lines.join("\n\n"), elements: els, ref: L(lang, "Page introduction", "Page పరిచయం") }
}

export function summary(doc: Document, snap: PageSnapshot, lang: UiLang): Insight {
  const intro = aboutPage(doc, snap, lang)
  const secs = snap.passages.filter((p) => p.ref && p.ref !== snap.title).slice(0, 6)
  const bullets = secs.map((p) => {
    const body = p.text.startsWith(p.ref) ? p.text.slice(p.ref.length).trim() : p.text
    const first = firstSentences(body.replace(/\n/g, " "), 1) || body.replace(/\n/g, " ").slice(0, 140)
    return `- **${p.ref}**: ${first.slice(0, 180)}`
  })
  const text = [intro.text, bullets.length ? L(lang, "**Sections**", "**విభాగాలు**") + "\n" + bullets.join("\n") : ""].filter(Boolean).join("\n\n")
  return { text, elements: intro.elements, ref: L(lang, "Whole page", "మొత్తం page") }
}

export function structure(doc: Document, lang: UiLang): Insight {
  const root = findRoot(doc)
  const hs = headings(doc, doc.body ?? root, 3)
  const lines = hs.map((h) => `${"  ".repeat(Number(h.tagName[1]) - 1)}- ${clean(h.textContent)}`)
  const landmarks = ["main", "nav", "header", "footer", "aside"].filter((t) => doc.querySelector(t))
  const text =
    (hs.length ? L(lang, `**${hs.length} sections**`, `**${hs.length} విభాగాలు**`) + "\n" + lines.slice(0, 20).join("\n") : L(lang, "This page has no headings.", "ఈ page లో headings లేవు.")) +
    (landmarks.length ? "\n\n" + L(lang, "Regions: ", "Regions: ") + landmarks.join(", ") : "")
  return { text, elements: hs.slice(0, 3), ref: L(lang, "Page headings", "Page headings") }
}

export function forms(doc: Document, lang: UiLang): Insight {
  const fields = Array.from(doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")).filter(
    (f) => !f.closest("[data-yuktai-panel], yuktai-ask") && !["hidden", "submit", "button", "reset", "image"].includes((f.getAttribute("type") || "").toLowerCase()),
  )
  if (!fields.length) return { text: L(lang, "This page has no form fields.", "ఈ page లో form fields లేవు."), elements: [], ref: L(lang, "Forms", "Forms") }
  const formsCount = new Set(fields.map((f) => f.form ?? f.closest("form"))).size
  const lines = fields.slice(0, 25).map((f) => {
    const d = describeField(f)
    const req = d.required ? L(lang, ", required", ", తప్పనిసరి") : ""
    const hint = d.hint && d.hint !== d.label ? ` (${d.hint})` : ""
    return `- **${d.label || L(lang, "Unlabelled field", "Label లేని field")}**: ${d.type}${req}${hint}`
  })
  const required = fields.filter((f) => describeField(f).required).length
  const head = L(lang, `**${fields.length} fields** in ${formsCount} form${formsCount === 1 ? "" : "s"}, ${required} required.`, `**${fields.length} fields**, ${formsCount} form(s) లో, ${required} తప్పనిసరి.`)
  const note = L(lang, "_Only labels are read, never what is typed._", "_Labels మాత్రమే చదువుతాను, టైప్ చేసినవి కాదు._")
  return { text: `${head}\n${lines.join("\n")}\n\n${note}`, elements: [fields[0].closest("form, fieldset") ?? fields[0]], ref: L(lang, "Forms", "Forms") }
}

export function images(doc: Document, lang: UiLang): Insight {
  const imgs = Array.from(doc.querySelectorAll("img")).filter((i) => !i.closest("[data-yuktai-panel], yuktai-ask"))
  if (!imgs.length) return { text: L(lang, "This page has no images.", "ఈ page లో images లేవు."), elements: [], ref: L(lang, "Images", "Images") }
  const missing = imgs.filter((i) => !i.hasAttribute("alt"))
  const decorative = imgs.filter((i) => i.getAttribute("alt") === "")
  const described = imgs.filter((i) => clean(i.getAttribute("alt")))
  const lines = described.slice(0, 8).map((i) => `- ${clean(i.getAttribute("alt"))}`)
  const text =
    L(lang, `**${imgs.length} images**: ${described.length} described, ${decorative.length} decorative, ${missing.length} missing alt text.`, `**${imgs.length} images**: ${described.length} కి వివరణ ఉంది, ${decorative.length} అలంకారం, ${missing.length} కి alt text లేదు.`) +
    (lines.length ? "\n" + lines.join("\n") : "")
  return { text, elements: (missing.length ? missing : imgs).slice(0, 3), ref: L(lang, "Images", "Images") }
}

export interface A11yIssue {
  rule: string
  count: number
  elements: Element[]
}

/** A quick, structural accessibility check (not a full audit). */
export function a11yIssues(doc: Document): A11yIssue[] {
  const scope = (sel: string) => Array.from(doc.querySelectorAll(sel)).filter((e) => !e.closest("[data-yuktai-panel], yuktai-ask"))
  const out: A11yIssue[] = []
  const add = (rule: string, els: Element[]) => els.length && out.push({ rule, count: els.length, elements: els.slice(0, 5) })
  add("Images without alt text", scope("img:not([alt])"))
  add(
    "Form fields without a label",
    scope("input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]), textarea, select").filter((f) => !describeField(f as HTMLInputElement).label),
  )
  add("Buttons without a name", scope("button, [role=button]").filter((b) => !clean(b.textContent) && !b.getAttribute("aria-label") && !b.getAttribute("aria-labelledby") && !b.getAttribute("title")))
  add("Links without text", scope("a[href]").filter((a) => !clean(a.textContent) && !a.getAttribute("aria-label") && !a.querySelector("img[alt]:not([alt=''])")))
  add("Vague link text", scope("a[href]").filter((a) => /^(click here|here|read more|more|link|ఇక్కడ క్లిక్ చేయండి)$/i.test(clean(a.textContent))))
  if (!doc.documentElement.getAttribute("lang")) out.push({ rule: "Page language not set", count: 1, elements: [] })
  if (!doc.querySelector("h1")) out.push({ rule: "No main heading (h1)", count: 1, elements: [] })
  const hs = scope("h1, h2, h3, h4, h5, h6")
  const skips = hs.filter((h, i) => i > 0 && Number(h.tagName[1]) - Number(hs[i - 1].tagName[1]) > 1)
  add("Heading levels skipped", skips)
  if (!doc.querySelector("main, [role=main]")) out.push({ rule: "No main region", count: 1, elements: [] })
  return out
}

export function accessibility(doc: Document, lang: UiLang): Insight {
  const issues = a11yIssues(doc)
  if (!issues.length) return { text: L(lang, "No common accessibility problems found in a quick check. A full audit (axe, a screen reader) can still find more.", "Quick check లో సాధారణ accessibility సమస్యలు కనిపించలేదు. పూర్తి audit (axe, screen reader) లో ఇంకా కనిపించవచ్చు."), elements: [], ref: L(lang, "Accessibility check", "Accessibility check") }
  const lines = issues.map((i) => `- **${i.rule}**${i.count > 1 ? `: ${i.count}` : ""}`)
  return {
    text: L(lang, `**${issues.length} possible problems** in a quick check:`, `Quick check లో **${issues.length} సమస్యలు** ఉండవచ్చు:`) + "\n" + lines.join("\n"),
    elements: issues.flatMap((i) => i.elements).slice(0, 5),
    ref: L(lang, "Accessibility check", "Accessibility check"),
  }
}

export function tables(doc: Document, lang: UiLang): Insight {
  const ts = Array.from(doc.querySelectorAll("table")).filter((t) => !isPrivate(t))
  if (!ts.length) return { text: L(lang, "This page has no tables.", "ఈ page లో tables లేవు."), elements: [], ref: L(lang, "Tables", "Tables") }
  const lines = ts.slice(0, 5).map((t, i) => {
    const cap = clean(t.querySelector("caption")?.textContent)
    const heads = Array.from(t.querySelectorAll("th")).map((th) => clean(th.textContent)).filter(Boolean).slice(0, 8)
    const rows = t.querySelectorAll("tr").length
    return `- **${cap || L(lang, `Table ${i + 1}`, `Table ${i + 1}`)}**: ${rows} ${L(lang, "rows", "rows")}${heads.length ? `; ${L(lang, "columns", "columns")}: ${heads.join(", ")}` : ""}`
  })
  return { text: lines.join("\n"), elements: ts.slice(0, 1), ref: L(lang, "Tables", "Tables") }
}
