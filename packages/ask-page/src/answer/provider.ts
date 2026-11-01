// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/answer/provider.ts
// An answer provider writes an answer from the prompt. All of them run on
// the visitor's device. Owners can pass their own (it must be on-device too).
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatMessage } from "./prompt"

export interface AnswerProvider {
  readonly name: string
  available(outLang: string): Promise<boolean>
  /** Language the provider will actually write for `outLang`. */
  writes(outLang: string): string
  stream(messages: ChatMessage[], outLang: string, signal?: AbortSignal): AsyncIterable<string>
}
