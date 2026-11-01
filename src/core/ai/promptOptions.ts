// ─────────────────────────────────────────────────────────────────────────────
// src/core/ai/promptOptions.ts — v5.3.11
// Chrome's built-in Prompt API (Gemini Nano) wants the languages it will read
// and write. Without them Chrome logs "No output language was specified" on
// every call. YuktAI prompts in English by default.
//
// v5.4.0: the Prompt API only accepts the languages Chrome supports (today
// English, Japanese and Spanish). Asking for Telugu makes create() fail, so
// promptLanguagesFor() falls back to English, and callers translate the
// answer with the Translator API when it can (see @yuktishaalaa/ask-page).
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPT_LANGUAGES = {
  expectedInputs:  [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
} as const

/** Summarizer, Writer and Rewriter: the same idea, with their option names. */
export const WRITING_LANGUAGES = {
  expectedInputLanguages:   ["en"],
  expectedContextLanguages: ["en"],
  outputLanguage:           "en",
} as const

/** Languages Chrome's Prompt API accepts for input and output. */
export const PROMPT_API_LANGUAGES = ["en", "ja", "es"] as const

/**
 * Prompt API options for a preferred language. Unsupported languages
 * (Telugu, Hindi, ...) fall back to English, so create() never fails.
 */
export function promptLanguagesFor(lang: string) {
  const base = (lang || "en").toLowerCase().split("-")[0]
  const out = (PROMPT_API_LANGUAGES as readonly string[]).includes(base) ? base : "en"
  return {
    expectedInputs:  [{ type: "text", languages: out === "en" ? ["en"] : ["en", out] }],
    expectedOutputs: [{ type: "text", languages: [out] }],
  }
}
