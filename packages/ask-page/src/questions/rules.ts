// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/questions/rules.ts
//
// Suggested questions per page type, as data. Each rule says when it applies
// and how to word the question in English and Telugu. `shortcut` rules are
// answered from page structure, so they always have an answer; the others
// are checked against the page before they are shown.
// ─────────────────────────────────────────────────────────────────────────────

import type { PageType } from "../types"
import type { PageContext } from "./pageType"

export interface QuestionRule {
  en: string
  te: string
  when?: (ctx: PageContext) => boolean
  /** Answered by page insights, no search needed. */
  shortcut?: boolean
}

const has = (re: RegExp) => (ctx: PageContext) => re.test(ctx.text) || ctx.headings.some((h) => re.test(h.toLowerCase()))
// Headings that name a topic, not a call to action ("Try it", "Sign up", "Contact us")
const CTA = /^(try|get|sign|join|subscribe|contact|learn|read|see|start|download|buy|follow|share|click|వెంటనే|ప్రయత్నించండి)\b/i
// Section headings worth asking about: not the page's own title (h1), not long, not a question
const heading = (ctx: PageContext, n: number) => {
  const h1 = Array.from(ctx.doc.querySelectorAll("h1")).map((h) => (h.textContent ?? "").replace(/\s+/g, " ").trim())
  return ctx.headings.filter((h) => h.length <= 40 && !h1.includes(h) && h !== ctx.snap.title && !CTA.test(h) && !/[?？]$/.test(h) && !/^(what|how|why|who|when|where|which)\b/i.test(h))[n] ?? ""
}
const withHeading = (n: number) => (ctx: PageContext) => !!heading(ctx, n - 1)

/** Questions with {h1}, {h2}: filled with the page's own headings. */
export function fillRule(text: string, ctx: PageContext): string {
  return text.replace("{h1}", heading(ctx, 0)).replace("{h2}", heading(ctx, 1))
}

export const RULES: Record<Exclude<PageType, "general">, QuestionRule[]> = {
  home: [
    { en: "What does this site do?", te: "ఈ site ఏం చేస్తుంది?", shortcut: true },
    { en: "What are the main features?", te: "ముఖ్యమైన features ఏమిటి?", when: has(/\bfeatures?\b|ఫీచర్/) },
    { en: "How do I get started?", te: "ఎలా మొదలుపెట్టాలి?", when: has(/get started|sign ?up|start|మొదలు/) },
    { en: "Who is this for?", te: "ఇది ఎవరి కోసం?", when: has(/\bfor (teams|developers|students|everyone|business)/) },
    { en: "How do I contact them?", te: "ఎలా contact చేయాలి?", when: has(/contact|email|phone|సంప్రదించ/) },
    { en: "Is it free? What does it cost?", te: "ఇది ఉచితమా? ధర ఎంత?", when: has(/free|pricing|price|ఉచిత|ధర/) },
  ],
  docs: [
    { en: "How do I install it?", te: "ఎలా install చేయాలి?", when: has(/install|npm|pip|setup/) },
    { en: "Show me a short example", te: "చిన్న example చూపించండి", when: (c) => c.counts.code > 0 },
    { en: "What options or settings are there?", te: "ఏ options / settings ఉన్నాయి?", when: has(/options?|settings?|configuration|config|props/) },
    { en: "Tell me about {h1}", te: "{h1} గురించి చెప్పండి", when: withHeading(1) },
    { en: "What are the requirements?", te: "Requirements ఏమిటి?", when: has(/requirements?|prerequisites?|requires|browser support/) },
    { en: "What are the common errors?", te: "Common errors ఏమిటి?", when: has(/troubleshoot|errors?|faq|known issues/) },
    { en: "Tell me about {h2}", te: "{h2} గురించి చెప్పండి", when: withHeading(2) },
  ],
  product: [
    { en: "How much does it cost?", te: "ధర ఎంత?", when: (c) => c.counts.prices > 0 },
    { en: "What is the difference between the plans?", te: "Plans మధ్య తేడా ఏమిటి?", when: (c) => c.counts.prices >= 2 || has(/plans?/)(c) },
    { en: "Is there a free plan or trial?", te: "ఉచిత plan లేదా trial ఉందా?", when: has(/free|trial|ఉచిత/) },
    { en: "How do refunds or cancellations work?", te: "Refund / cancel ఎలా?", when: has(/refund|cancel/) },
    { en: "What features are included?", te: "ఏ features ఉన్నాయి?", when: has(/features?|includes?|included/) },
    { en: "What support or delivery time is there?", te: "Delivery / support ఎంత కాలం?", when: has(/delivery|shipping|support/) },
  ],
  form: [
    { en: "What fields are in this form?", te: "ఈ form లో ఏ fields ఉన్నాయి?", shortcut: true, when: (c) => c.counts.fields > 0 },
    { en: "Which fields are required?", te: "ఏవి తప్పనిసరి?", when: (c) => c.counts.required > 0, shortcut: true },
    { en: "What documents do I need?", te: "ఏ documents కావాలి?", when: (c) => !!c.doc.querySelector("input[type=file]") || has(/documents?|upload|పత్రాలు/)(c) },
    { en: "What happens after I submit?", te: "Submit తర్వాత ఏమవుతుంది?", when: has(/after (you )?submit|we will (contact|reply|email)|response within|confirmation/) },
    { en: "Is this form accessible?", te: "ఈ form accessible గా ఉందా?", shortcut: true },
  ],
  article: [
    { en: "Summarize this article", te: "ఈ article సారాంశం", shortcut: true },
    { en: "What are the key points?", te: "ముఖ్యమైన points ఏమిటి?", shortcut: true },
    { en: "Who wrote it and when?", te: "ఎవరు రాశారు, ఎప్పుడు?", when: (c) => c.counts.dates > 0 || !!c.doc.querySelector("meta[name='author'], [rel='author']") },
    { en: "Tell me about {h1}", te: "{h1} గురించి చెప్పండి", when: withHeading(1) },
    { en: "What is the conclusion?", te: "ముగింపు ఏమిటి?", when: has(/conclusion|takeaways?|summary|in short|ముగింపు/) },
    { en: "Summarize this page in Telugu", te: "ఈ page సారాంశం తెలుగులో", shortcut: true },
  ],
  // FAQ pages also get their own first four questions (see faqQuestions)
  faq: [
    { en: "How do I contact support?", te: "Support ని ఎలా contact చేయాలి?", when: has(/contact|support|email|helpline/) },
  ],
  data: [
    { en: "What does this table show?", te: "ఈ table ఏం చూపిస్తుంది?", shortcut: true, when: (c) => c.counts.tables > 0 },
    { en: "Summarize this data", te: "ఈ data సారాంశం", shortcut: true },
    { en: "What sections are on this page?", te: "ఈ page లో ఏ sections ఉన్నాయి?", shortcut: true },
    { en: "Tell me about {h1}", te: "{h1} గురించి చెప్పండి", when: withHeading(1) },
    { en: "What is the highest value?", te: "అత్యధిక విలువ ఏది?", when: has(/total|highest|maximum|max/) },
  ],
  government: [
    { en: "Who is eligible?", te: "ఎవరు అర్హులు?", when: has(/eligib|అర్హ|पात्र/) },
    { en: "What documents are required?", te: "ఏ documents కావాలి?", when: has(/documents?|certificate|పత్రాలు|दस्तावेज/) },
    { en: "How do I apply?", te: "ఎలా apply చేయాలి?", when: has(/apply|application|దరఖాస్తు|आवेदन/) },
    { en: "What is the last date?", te: "Last date ఎప్పుడు?", when: has(/last date|deadline|చివరి తేదీ|अंतिम तिथि/) },
    { en: "Is there a fee?", te: "Fee ఎంత?", when: has(/fee|₹|రుసుము|शुल्क/) },
    { en: "What is the helpline?", te: "Helpline ఏమిటి?", when: has(/helpline|toll.?free|contact|phone/) },
  ],
  course: [
    { en: "What will I learn?", te: "ఈ course లో ఏం నేర్చుకుంటాం?", when: has(/learn|syllabus|curriculum|modules?|నేర్చుకో/) },
    { en: "How long does it take?", te: "ఎంత సమయం పడుతుంది?", when: has(/duration|hours?|weeks?|months?|సమయం/) },
    { en: "What should I know first?", te: "ముందు ఏం తెలిసి ఉండాలి?", when: has(/prerequisites?|requirements?|before you start/) },
    { en: "What sections are in this course?", te: "ఈ course లో ఏ sections ఉన్నాయి?", shortcut: true },
    { en: "Is there a certificate?", te: "Certificate ఉందా?", when: has(/certificate|certification/) },
  ],
}

/** For every page: always answerable from structure. */
export const GENERAL: QuestionRule[] = [
  { en: "Summarize this page", te: "ఈ page సారాంశం", shortcut: true },
  { en: "What is this page about?", te: "ఈ page దేని గురించి?", shortcut: true },
  { en: "What are the key points?", te: "ముఖ్యమైన points ఏమిటి?", shortcut: true },
  { en: "What sections are on this page?", te: "ఈ page లో ఏ sections ఉన్నాయి?", shortcut: true },
  { en: "Summarize this page in Telugu", te: "ఈ page సారాంశం తెలుగులో", shortcut: true, when: (c) => c.snap.lang !== "te" },
  { en: "Are there accessibility problems on this page?", te: "ఈ page లో accessibility సమస్యలు ఉన్నాయా?", shortcut: true },
]

/** The page's own FAQ questions: <summary> texts and headings ending in "?". */
export function faqQuestions(ctx: PageContext, max = 4): string[] {
  const out: string[] = []
  const add = (t: string) => {
    const q = t.replace(/\s+/g, " ").trim()
    if (q.length > 8 && q.length < 120 && !out.includes(q)) out.push(q)
  }
  ctx.doc.querySelectorAll("details > summary").forEach((s) => add(s.textContent ?? ""))
  ctx.headings.filter((h) => /[?？]$/.test(h)).forEach(add)
  return out.slice(0, max)
}
