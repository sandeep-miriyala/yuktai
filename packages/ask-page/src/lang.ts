// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/lang.ts
// Which language is this text in? Script-based (instant, no model), with
// Chrome's Language Detector as an optional second opinion for Latin text.
// ─────────────────────────────────────────────────────────────────────────────

export type UiLang = "en" | "te" | "hi"

/** Telugu or Devanagari letters decide it; otherwise English. */
export function detectScriptLang(text: string): UiLang {
  let te = 0
  let hi = 0
  let latin = 0
  for (const ch of text.slice(0, 2000)) {
    const c = ch.codePointAt(0) ?? 0
    if (c >= 0x0c00 && c <= 0x0c7f) te++
    else if (c >= 0x0900 && c <= 0x097f) hi++
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) latin++
  }
  if (te > 0 && te >= hi && te * 2 >= latin * 0.5) return "te"
  if (hi > 0 && hi * 2 >= latin * 0.5) return "hi"
  return "en"
}

/** The language to answer in: the setting, else the question's script. */
export function answerLang(question: string, setting: "auto" | UiLang): UiLang {
  // "… in Telugu" / "తెలుగులో" asks for that language whatever the setting
  if (/(\btelugu\b|తెలుగులో|తెలుగు లో)/i.test(question)) return "te"
  if (/(\bhindi\b|हिंदी में|हिन्दी में)/i.test(question)) return "hi"
  if (/\bin english\b|ఇంగ్లీష్ లో|english లో/i.test(question)) return "en"
  if (setting !== "auto") return setting
  return detectScriptLang(question)
}
