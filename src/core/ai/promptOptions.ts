// ─────────────────────────────────────────────────────────────────────────────
// src/core/ai/promptOptions.ts — v5.3.11
// Chrome's built-in Prompt API (Gemini Nano) wants the languages it will read
// and write. Without them Chrome logs "No output language was specified" on
// every call. YuktAI prompts and answers in English.
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
