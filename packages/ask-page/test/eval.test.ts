// Eval set: does search find the right section? Questions are worded the way
// visitors ask, not copied from the page. recall@5 = the right section is in
// the top 5; top-1 = it is first; refusals = questions the page cannot answer
// that Ask page correctly declines. Keyword (Fast) mode: the embedding model
// cannot download inside CI, so Balanced is measured in the browser demo.
import { describe, expect, it } from "vitest"
import { writeFileSync, mkdirSync } from "node:fs"
import { AskPage } from "../src/controller"
import { COURSE, DATA, DOCS, FAQ, GOV, PRICING, TELUGU, load } from "./fixtures"

type Case = [question: string, section: string | null]

const SET: { name: string; html: string; url: string; cases: Case[] }[] = [
  {
    name: "docs (en)",
    html: DOCS,
    url: "https://example.com/docs/ask-page",
    cases: [
      ["How do I install it?", "Installation"],
      ["which npm package do I add", "Installation"],
      ["Does it work with Next.js?", "Installation"],
      ["How do I start it in my app?", "Usage"],
      ["Where does the launcher button appear?", "Usage"],
      ["What options can I set?", "Options"],
      ["can I turn the cache off", "Options"],
      ["What does the side option do?", "Options"],
      ["How big is the model download?", "Requirements"],
      ["Does Best mode need Chrome?", "Requirements"],
      ["Is anything I type into forms read?", "Privacy"],
      ["Do you record my questions in analytics?", "Privacy"],
      ["The panel does not appear, what should I check?", "Troubleshooting"],
      ["Why are answers empty?", "Troubleshooting"],
      ["What is the refund policy?", null],
      ["Who is the CEO?", null],
      ["How much does the enterprise plan cost?", null],
    ],
  },
  {
    name: "festival (te)",
    html: TELUGU,
    url: "https://example.com/blog/sankranti",
    cases: [
      ["భోగి మంటలు ఎప్పుడు వేస్తారు?", "భోగి"],
      ["పిల్లలకు భోగి పళ్ళు ఎప్పుడు పోస్తారు", "భోగి"],
      ["ముగ్గులు ఏ రోజు వేస్తారు?", "సంక్రాంతి రోజు"],
      ["పొంగలి దేనితో వండుతారు?", "సంక్రాంతి రోజు"],
      ["గాలిపటాలు", "సంక్రాంతి రోజు"],
      ["పశువులను ఏ రోజు పూజిస్తారు?", "కనుమ"],
      ["హరిదాసులు ఏం చేస్తారు?", "హరిదాసులు"],
      ["గంగిరెద్దుల వాళ్ళు వస్తారా?", "హరిదాసులు"],
      ["దీపావళి ఎప్పుడు?", null],
      ["క్రికెట్ మ్యాచ్ స్కోరు ఎంత?", null],
    ],
  },
  {
    name: "scheme (gov)",
    html: GOV,
    url: "https://scholarships.gov.in/scheme",
    cases: [
      ["Who is eligible?", "Eligibility"],
      ["What is the income limit?", "Eligibility"],
      ["How many marks do I need?", "Eligibility"],
      ["Which documents are required?", "Documents required"],
      ["Do I need an income certificate?", "Documents required"],
      ["How do I apply?", "How to apply"],
      ["Where do I upload documents?", "How to apply"],
      ["What is the last date?", "Last date"],
      ["Is there an application fee?", "Fee"],
      ["What is the helpline number?", "Helpline"],
      ["Can I apply for a passport here?", null],
    ],
  },
  {
    name: "pricing",
    html: PRICING,
    url: "https://example.com/pricing",
    cases: [
      ["How much is Pro?", "Pro plan"],
      ["How much storage do I get for free?", "Free plan"],
      ["Is there a free trial?", "Free trial"],
      ["Can I get my money back?", "Refunds"],
      ["Do you ship to Canada?", null],
    ],
  },
  {
    name: "faq",
    html: FAQ,
    url: "https://example.com/faq",
    cases: [
      ["How do I reset my password?", "How do I reset my password?"],
      ["Can I export my notes?", "Can I export my data?"],
      ["Which browsers are supported?", "Which browsers are supported?"],
      ["how to delete my account", "How do I delete my account?"],
    ],
  },
  {
    name: "course",
    html: COURSE,
    url: "https://example.com/courses/a11y",
    cases: [
      ["How long is the course?", "Duration"],
      ["Do I need JavaScript for the course?", "Prerequisites"],
      ["Will I get a certificate?", "Certificate"],
      ["Does it teach ARIA?", "What you will learn"],
    ],
  },
  {
    name: "data",
    html: DATA,
    url: "https://example.com/reports/rain",
    cases: [
      ["What was the highest rainfall?", "Notes"],
      ["How much rain fell in Vizag in September?", "Monthly rainfall 2026"],
    ],
  },
]

describe("eval: right section, honest refusals", () => {
  it("meets the quality bar", async () => {
    let answerable = 0
    let inTop5 = 0
    let top1 = 0
    let unanswerable = 0
    let refused = 0
    const misses: string[] = []
    for (const page of SET) {
      const p = new AskPage({ doc: load(page.html, page.url), worker: false })
      for (const [q, want] of page.cases) {
        const r = await p.search(q, 5, "fast")
        const refs = r.hits.map((h) => h.passage.ref)
        if (want === null) {
          unanswerable++
          if (!r.confident) refused++
          else misses.push(`[${page.name}] should refuse: ${q} → ${refs[0]}`)
        } else {
          answerable++
          if (refs.includes(want)) inTop5++
          else misses.push(`[${page.name}] missed: ${q} → ${refs.join(" | ") || "(none)"}`)
          if (refs[0] === want) top1++
        }
      }
      p.dispose()
    }
    const report = {
      mode: "fast (Rust BM25)",
      questions: answerable + unanswerable,
      recallAt5: +(inTop5 / answerable).toFixed(3),
      top1: +(top1 / answerable).toFixed(3),
      refusals: +(refused / unanswerable).toFixed(3),
      misses,
    }
    mkdirSync("eval", { recursive: true })
    writeFileSync("eval/report.json", JSON.stringify(report, null, 2) + "\n")
    console.log(report)
    expect(report.recallAt5).toBeGreaterThanOrEqual(0.9)
    expect(report.top1).toBeGreaterThanOrEqual(0.75)
    expect(report.refusals).toBeGreaterThanOrEqual(0.8)
  })
})
