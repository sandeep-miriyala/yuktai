import { describe, expect, it } from "vitest"
import { readPage } from "../src/reader/pageReader"
import { detectPageType, pageContext } from "../src/questions/pageType"
import { buildSuggestions } from "../src/questions/engine"
import { resolveConfig } from "../src/config"
import { matchShortcut } from "../src/insights/shortcuts"
import { ALL_CHECKS } from "../src/config"
import { COURSE, DATA, DOCS, FAQ, FORM, GOV, HOME, PRICING, TELUGU, load } from "./fixtures"

const cases: [string, string, string][] = [
  [DOCS, "https://example.com/docs/ask-page", "docs"],
  [PRICING, "https://example.com/pricing", "product"],
  [FORM, "https://example.com/signup", "form"],
  [FAQ, "https://example.com/faq", "faq"],
  [GOV, "https://scholarships.gov.in/scheme", "government"],
  [COURSE, "https://example.com/courses/a11y", "course"],
  [DATA, "https://example.com/reports/rain", "data"],
  [HOME, "https://example.com/", "home"],
  [TELUGU, "https://example.com/blog/sankranti", "article"],
]

describe("page types and suggested questions", () => {
  it.each(cases)("detects the page type (%#)", (html, url, type) => {
    const doc = load(html, url)
    expect(detectPageType(pageContext(doc, readPage(doc))).type).toBe(type)
  })

  it.each(cases)("always suggests at least 5 questions (%#)", async (html, url) => {
    const doc = load(html, url)
    const ctx = pageContext(doc, readPage(doc))
    const r = await buildSuggestions({ ctx, config: resolveConfig(), pinned: [], lang: "en", answerable: async () => true })
    expect(r.suggestions.length).toBeGreaterThanOrEqual(5)
    expect(new Set(r.suggestions.map((s) => s.text.toLowerCase())).size).toBe(r.suggestions.length)
  })

  it("puts owner questions first, then pins, and hides unanswerable ones", async () => {
    const doc = load(GOV, "https://scholarships.gov.in/scheme")
    const ctx = pageContext(doc, readPage(doc))
    const config = resolveConfig({ questions: [{ text: "Who can apply?", path: "/scheme" }, { text: "What is the refund policy?" }, { text: "Only on pricing", path: "/pricing" }] })
    const r = await buildSuggestions({
      ctx,
      config,
      pinned: ["My pinned question"],
      lang: "en",
      answerable: async (q) => !/refund/i.test(q),
    })
    expect(r.suggestions[0]).toEqual({ text: "Who can apply?", source: "owner" })
    expect(r.suggestions[1]).toEqual({ text: "My pinned question", source: "pinned" })
    expect(r.suggestions.some((s) => s.text.includes("refund"))).toBe(false)
    expect(r.suggestions.some((s) => s.text === "Only on pricing")).toBe(false)
  })

  it("uses the FAQ page's own questions", async () => {
    const doc = load(FAQ, "https://example.com/faq")
    const ctx = pageContext(doc, readPage(doc))
    const r = await buildSuggestions({ ctx, config: resolveConfig(), pinned: [], lang: "en", answerable: async () => true })
    expect(r.suggestions.map((s) => s.text)).toContain("How do I reset my password?")
  })

  it("writes Telugu questions for Telugu visitors", async () => {
    const doc = load(TELUGU)
    const ctx = pageContext(doc, readPage(doc))
    const r = await buildSuggestions({ ctx, config: resolveConfig(), pinned: [], lang: "te", answerable: async () => true })
    expect(r.suggestions[0].text).toMatch(/[ఀ-౿]/)
  })

  it("recognises structural questions in English and Telugu", () => {
    expect(matchShortcut("Summarize this page", ALL_CHECKS)).toBe("summary")
    expect(matchShortcut("ఈ page సారాంశం", ALL_CHECKS)).toBe("summary")
    expect(matchShortcut("What fields are in this form?", ALL_CHECKS)).toBe("forms")
    expect(matchShortcut("ఈ form లో ఏ fields ఉన్నాయి?", ALL_CHECKS)).toBe("forms")
    expect(matchShortcut("Are there accessibility problems on this page?", ALL_CHECKS)).toBe("accessibility")
    expect(matchShortcut("What is this page about?", ALL_CHECKS)).toBe("about")
    expect(matchShortcut("How do I install it?", ALL_CHECKS)).toBeNull()
    // turned-off checks fall through to search
    expect(matchShortcut("What fields are in this form?", ["structure"])).toBeNull()
  })
})
