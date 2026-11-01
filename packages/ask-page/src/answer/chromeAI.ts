// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/answer/chromeAI.ts
//
// Chrome's built-in AI (Gemini Nano, on the device):
//   Prompt API      answers, streamed          (stable since Chrome 148)
//   Summarizer API  page summaries
//   Translator API  answers into Telugu/Hindi  (Prompt API writes en/ja/es)
// Used only when Chrome says the model is already "available": Ask page never
// starts Chrome's own multi-GB model download by itself.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatMessage } from "./prompt"
import type { AnswerProvider } from "./provider"

/* eslint-disable @typescript-eslint/no-explicit-any */
const g = globalThis as any

export const PROMPT_LANGS = ["en", "ja", "es"]

/** Built-in AI calls can stall where the model is missing (headless, policy-off): never wait long. */
function within<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms)
    p.then(
      (v) => (clearTimeout(t), resolve(v)),
      () => (clearTimeout(t), resolve(fallback)),
    )
  })
}

function promptOptions(out: string) {
  const lang = PROMPT_LANGS.includes(out) ? out : "en"
  return {
    expectedInputs: [{ type: "text", languages: lang === "en" ? ["en"] : ["en", lang] }],
    expectedOutputs: [{ type: "text", languages: [lang] }],
  }
}

export async function promptApiStatus(out = "en"): Promise<string> {
  try {
    if (!g.LanguageModel?.availability) return "unavailable"
    return String(await within(Promise.resolve(g.LanguageModel.availability(promptOptions(out))), 1500, "unavailable"))
  } catch {
    return "unavailable"
  }
}

export const chromePromptProvider: AnswerProvider = {
  name: "Chrome built-in AI",
  async available(out) {
    return (await promptApiStatus(out)) === "available"
  },
  /** The language the model writes in; others need translating after. */
  writes(out) {
    return PROMPT_LANGS.includes(out) ? out : "en"
  },
  async *stream(messages: ChatMessage[], out: string, signal?: AbortSignal) {
    const system = messages.find((m) => m.role === "system")?.content ?? ""
    const user = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n")
    const session = await g.LanguageModel.create({
      ...promptOptions(out),
      initialPrompts: [{ role: "system", content: system }],
      signal,
    })
    try {
      const stream = session.promptStreaming(user, { signal })
      let prev = ""
      for await (const chunk of stream as AsyncIterable<string>) {
        // Chrome sends deltas today; older builds sent the whole text so far
        const text = String(chunk)
        if (prev && text.startsWith(prev)) {
          yield text.slice(prev.length)
          prev = text
        } else {
          yield text
          prev += text
        }
      }
    } finally {
      session.destroy?.()
    }
  },
}

/** Translates with Chrome's Translator API when that language pair is ready. */
export async function translate(text: string, from: string, to: string): Promise<string | null> {
  if (from === to) return text
  try {
    if (!g.Translator?.availability) return null
    const status = await within(Promise.resolve(g.Translator.availability({ sourceLanguage: from, targetLanguage: to })), 1500, "unavailable")
    if (status !== "available") return null
    const t = await within(Promise.resolve(g.Translator.create({ sourceLanguage: from, targetLanguage: to })), 4000, null)
    if (!t) return null
    try {
      return await within(Promise.resolve(t.translate(text)).then(String), 8000, null)
    } finally {
      t.destroy?.()
    }
  } catch {
    return null
  }
}

/** Key-point summary with Chrome's Summarizer API, if it is ready. */
export async function summarize(text: string, signal?: AbortSignal): Promise<string | null> {
  try {
    if (!g.Summarizer?.availability) return null
    const opts = { type: "key-points", format: "markdown", length: "medium", expectedInputLanguages: ["en"], outputLanguage: "en" }
    if ((await within(Promise.resolve(g.Summarizer.availability(opts)), 1500, "unavailable")) !== "available") return null
    const s = await within(Promise.resolve(g.Summarizer.create({ ...opts, signal })), 4000, null)
    if (!s) return null
    try {
      return await within(Promise.resolve(s.summarize(text.slice(0, 6000), { signal })).then(String), 15000, null)
    } finally {
      s.destroy?.()
    }
  } catch {
    return null
  }
}
