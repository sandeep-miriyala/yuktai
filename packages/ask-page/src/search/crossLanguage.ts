// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/search/crossLanguage.ts (v1.0.2)
// Is the question in a different language from the page? Script-based, no model.
// ─────────────────────────────────────────────────────────────────────────────

import { detectScriptLang, type UiLang } from "../lang"
import type { Mode } from "../types"

export interface CrossLanguage {
  asked: UiLang
  page: UiLang
  /** Balanced (meaning) mode is offered on this site and would understand both. */
  balanced: boolean
}

/** The page's main language from its text (falls back to <html lang>). */
export function pageScriptLang(doc: Document): UiLang {
  const root = doc.querySelector("main,[role=main],article") ?? doc.body
  const text = (root?.textContent ?? "").slice(0, 4000)
  if (text.trim().length > 40) return detectScriptLang(text)
  const l = (doc.documentElement.lang || "en").slice(0, 2).toLowerCase()
  return l === "te" || l === "hi" ? l : "en"
}

/** A hint when Fast mode found nothing because the languages differ; null otherwise. */
export function crossLanguageHint(question: string, doc: Document, mode: Mode, modes: Mode[]): CrossLanguage | null {
  if (mode !== "fast") return null
  const asked = detectScriptLang(question)
  const page = pageScriptLang(doc)
  if (asked === page) return null
  return { asked, page, balanced: modes.includes("balanced") }
}
