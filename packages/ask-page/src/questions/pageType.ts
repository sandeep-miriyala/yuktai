// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/questions/pageType.ts
// What kind of page is this? Scores nine types from schema.org, the URL,
// what the page contains and the words in its headings. No model.
// ─────────────────────────────────────────────────────────────────────────────

import type { PageSnapshot, PageType } from "../types"
import { clean } from "../reader/privacyFilter"

export interface PageContext {
  doc: Document
  snap: PageSnapshot
  path: string
  headings: string[]
  /** All passage text, lower-cased. */
  text: string
  schema: string[]
  counts: { forms: number; fields: number; required: number; tables: number; tableRows: number; code: number; images: number; details: number; prices: number; dates: number; ordered: number }
}

export function pageContext(doc: Document, snap: PageSnapshot): PageContext {
  const schema: string[] = []
  doc.querySelectorAll("script[type='application/ld+json']").forEach((s) => {
    const m = (s.textContent ?? "").match(/"@type"\s*:\s*(\[[^\]]*\]|"[^"]+")/g) ?? []
    m.forEach((x) => (x.match(/"([A-Za-z]+)"/g) ?? []).forEach((t) => schema.push(t.replace(/"/g, ""))))
  })
  doc.querySelectorAll("[itemtype]").forEach((e) => schema.push((e.getAttribute("itemtype") ?? "").split("/").pop() ?? ""))
  const og = doc.querySelector("meta[property='og:type']")?.getAttribute("content")
  if (og) schema.push(og === "article" ? "Article" : og)
  const text = snap.passages.map((p) => p.text).join("\n").toLowerCase()
  const fields = doc.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]), textarea, select")
  const tables = Array.from(doc.querySelectorAll("table"))
  return {
    doc,
    snap,
    path: (doc.location?.pathname ?? "/").toLowerCase(),
    headings: Array.from(doc.querySelectorAll("h1, h2, h3")).map((h) => clean(h.textContent)).filter(Boolean),
    text,
    schema: schema.filter(Boolean),
    counts: {
      forms: doc.querySelectorAll("form").length,
      fields: fields.length,
      required: doc.querySelectorAll("[required], [aria-required='true']").length,
      tables: tables.length,
      tableRows: tables.reduce((n, t) => Math.max(n, t.querySelectorAll("tr").length), 0),
      code: doc.querySelectorAll("pre, code").length,
      images: doc.querySelectorAll("img").length,
      details: doc.querySelectorAll("details").length,
      prices: (text.match(/[₹$€£]\s?\d|\d\s?(rs|inr|usd)\b|\/\s?(mo|month|year)\b/g) ?? []).length,
      dates: doc.querySelectorAll("time[datetime]").length,
      ordered: doc.querySelectorAll("ol li").length,
    },
  }
}

const has = (ctx: PageContext, re: RegExp) => re.test(ctx.text) || ctx.headings.some((h) => re.test(h.toLowerCase()))

export function scorePageTypes(ctx: PageContext): Record<PageType, number> {
  const c = ctx.counts
  const p = ctx.path
  const s = (t: string) => ctx.schema.some((x) => x.toLowerCase() === t.toLowerCase())
  const sc: Record<PageType, number> = { home: 0, docs: 0, product: 0, form: 0, article: 0, faq: 0, data: 0, government: 0, course: 0, general: 1 }

  if (p === "/" || /\/(index\.html?)?$/.test(p) && p.split("/").filter(Boolean).length <= 1) sc.home += 2
  if (has(ctx, /\b(features|get started|why choose|our (services|products))\b/)) sc.home += 1

  if (/\/(docs?|guide|api|reference|manual)(\/|$)/.test(p)) sc.docs += 3
  if (s("TechArticle") || s("APIReference")) sc.docs += 3
  if (c.code >= 2) sc.docs += 2
  if (has(ctx, /\b(install|installation|getting started|usage|configuration|options|api|requirements|troubleshooting)\b/)) sc.docs += 2

  if (/\/(pricing|plans?|product|products|shop|store|buy)(\/|$)/.test(p)) sc.product += 3
  if (s("Product") || s("Offer")) sc.product += 3
  if (c.prices >= 2) sc.product += 2
  if (has(ctx, /\b(pricing|free trial|subscription|refund|add to cart|per month)\b/)) sc.product += 2

  if (/\/(contact|signup|sign-up|register|apply|application|enquiry|feedback)(\/|$)/.test(p)) sc.form += 3
  if (c.fields >= 3) sc.form += 2
  if (c.fields >= 6) sc.form += 2

  if (s("Article") || s("BlogPosting") || s("NewsArticle")) sc.article += 4
  if (/\/(blog|news|post|posts|articles?)(\/|$)/.test(p)) sc.article += 3
  if (c.dates >= 1 || ctx.doc.querySelector("meta[name='author']")) sc.article += 1
  if (ctx.doc.querySelector("article") && ctx.text.length > 2500) sc.article += 1

  if (s("FAQPage")) sc.faq += 5
  if (/\/(faq|faqs|help|support)(\/|$)/.test(p)) sc.faq += 3
  if (c.details >= 3) sc.faq += 2
  if (has(ctx, /\b(faq|frequently asked)\b|తరచుగా అడిగే/)) sc.faq += 2

  if (c.tableRows >= 6) sc.data += 3
  if (/\/(dashboard|report|reports|stats|data)(\/|$)/.test(p)) sc.data += 2

  if (/\.(gov|nic)\.in$|\.gov(\.[a-z]{2})?$/.test(ctx.doc.location?.hostname ?? "")) sc.government += 3
  if (has(ctx, /\b(eligibility|scheme|documents required|apply online|helpline|last date)\b|అర్హత|పథకం|దరఖాస్తు|पात्रता|योजना/)) sc.government += 3

  if (s("Course")) sc.course += 4
  if (has(ctx, /\b(syllabus|curriculum|modules?|lessons?|course|prerequisites|certificate)\b|పాఠ్య|కోర్సు/)) sc.course += 2
  if (/\/(course|courses|learn|class)(\/|$)/.test(p)) sc.course += 2
  return sc
}

/** The best type and its score; "general" when nothing stands out. */
export function detectPageType(ctx: PageContext): { type: PageType; scores: Record<PageType, number> } {
  const scores = scorePageTypes(ctx)
  let best: PageType = "general"
  for (const [t, v] of Object.entries(scores) as [PageType, number][]) if (v > scores[best] && v >= 3) best = t
  return { type: best, scores }
}
