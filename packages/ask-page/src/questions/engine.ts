// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/questions/engine.ts
//
// Builds the suggested questions:
//   1. owner questions for this path (max 3)       📌
//   2. the visitor's pinned questions (max 2)       ⭐
//   3. rules for this page type                      ✨
//   4. general questions until there are at least 5  ✨
// Each non-structural question is checked against the page first: no
// source, no suggestion. Duplicates are dropped; `count` (3–6) are shown.
// ─────────────────────────────────────────────────────────────────────────────

import type { PageType, Suggestion } from "../types"
import type { ResolvedConfig } from "../config"
import { pathMatches } from "../config"
import type { UiLang } from "../lang"
import { detectPageType, type PageContext } from "./pageType"
import { faqQuestions, fillRule, GENERAL, RULES, type QuestionRule } from "./rules"
import { queryTerms } from "../search/jsSearch"

export interface SuggestOptions {
  ctx: PageContext
  config: ResolvedConfig
  pinned: string[]
  lang: UiLang
  /** Does the page answer this question? (search + confidence) */
  answerable: (q: string) => Promise<boolean>
  /** How many to return including extras for "More". Default 12. */
  pool?: number
}

export interface SuggestResult {
  pageType: PageType
  suggestions: Suggestion[]
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()

/** Same question in other words? ("How do I install it?" vs "How do I install YuktAI?") */
function sameQuestion(a: string, b: string): boolean {
  const x = queryTerms(a)
  const y = queryTerms(b)
  if (!x.length || !y.length) return norm(a) === norm(b)
  const [short, long] = x.length <= y.length ? [x, y] : [y, x]
  return short.every((w) => long.includes(w))
}

export async function buildSuggestions(o: SuggestOptions): Promise<SuggestResult> {
  const { ctx, config, lang } = o
  const pool = o.pool ?? 12
  const { type } = detectPageType(ctx)
  const out: Suggestion[] = []
  const seen = new Set<string>()
  const push = (text: string, source: Suggestion["source"]) => {
    const k = norm(text)
    if (!k || seen.has(k) || out.some((o) => sameQuestion(o.text, text))) return false
    seen.add(k)
    out.push({ text, source })
    return true
  }

  if (config.suggestions === "off") return { pageType: type, suggestions: [] }

  if (config.suggestions !== "dynamic") {
    let n = 0
    for (const q of config.questions) {
      if (n >= 3) break
      if (!pathMatches(q.path, ctx.path)) continue
      if (await o.answerable(q.text)) n += push(q.text, "owner") ? 1 : 0
    }
  }
  if (config.allowPins) for (const q of o.pinned.slice(0, 2)) push(q, "pinned")
  if (config.suggestions === "owner") return { pageType: type, suggestions: out }

  if (type === "faq" && !config.disabledPageTypes.includes("faq")) {
    for (const q of faqQuestions(ctx)) if (await o.answerable(q)) push(q, "auto")
  }

  const rules: QuestionRule[] = []
  if (type !== "general" && !config.disabledPageTypes.includes(type)) rules.push(...RULES[type])
  rules.push(...GENERAL)

  for (const r of rules) {
    if (out.length >= pool) break
    try {
      if (r.when && !r.when(ctx)) continue
    } catch {
      continue
    }
    const text = fillRule(lang === "te" ? r.te : r.en, ctx)
    if (!text.trim() || /\{h\d\}/.test(text)) continue
    if (!r.shortcut && !(await o.answerable(text))) continue
    push(text, "auto")
  }
  return { pageType: type, suggestions: out }
}
