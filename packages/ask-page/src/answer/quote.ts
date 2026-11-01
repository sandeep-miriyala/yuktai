// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/answer/quote.ts
// Answers without a model: the sentences from the best passages that share
// the most words with the question, quoted as they are on the page.
// ─────────────────────────────────────────────────────────────────────────────

import type { AnswerStyle, Hit } from "../types"
import { queryTerms, tokenize } from "../search/jsSearch"

export function splitSentences(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?।॥])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
}

function sentenceScore(sentence: string, terms: string[]): number {
  if (!terms.length) return 0
  const words = tokenize(sentence)
  let hit = 0
  for (const t of terms) if (words.some((w) => w === t || (t.length >= 4 && w.startsWith(t)) || (w.length >= 4 && t.startsWith(w)))) hit++
  // prefer informative sentences over bare headings
  return hit / terms.length + Math.min(words.length, 30) / 300
}

export interface QuoteResult {
  text: string
  used: Hit[]
}

export function quoteAnswer(question: string, hits: Hit[], style: AnswerStyle): QuoteResult {
  if (!hits.length) return { text: "", used: [] }
  if (style === "quote") {
    const p = hits[0].passage
    return { text: p.text.length > 900 ? p.text.slice(0, 900) + "…" : p.text, used: [hits[0]] }
  }
  const terms = queryTerms(question)
  const take = style === "detailed" ? 4 : 2
  const from = hits.slice(0, style === "detailed" ? 3 : 2)
  const scored: { s: string; score: number; hit: Hit; order: number }[] = []
  from.forEach((hit, hi) => {
    splitSentences(hit.passage.text).forEach((s, i) => {
      if (s === hit.passage.ref) return
      scored.push({ s, score: sentenceScore(s, terms) - hi * 0.15, hit, order: hi * 1000 + i })
    })
  })
  const best = scored
    .filter((x) => x.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .sort((a, b) => a.order - b.order)
  if (!best.length) {
    const p = hits[0].passage
    return { text: p.text.slice(0, 500), used: [hits[0]] }
  }
  const used = [...new Set(best.map((b) => b.hit))]
  const text = best.map((b) => (b.s.length > 400 ? b.s.slice(0, 400) + "…" : b.s)).join(style === "detailed" ? "\n\n" : " ")
  return { text, used }
}
