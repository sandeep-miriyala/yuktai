// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/answer/webllm.ts
// Best mode on browsers without Chrome's built-in AI: a small model run by
// WebLLM on WebGPU. Off unless the owner sets `webllmUrl` (an ESM build of
// @mlc-ai/web-llm). The model downloads once, after the visitor agrees.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatMessage } from "./prompt"
import type { AnswerProvider } from "./provider"

/* eslint-disable @typescript-eslint/no-explicit-any */
export function webllmProvider(url: string, model: string, onProgress?: (p: number, text: string) => void): AnswerProvider {
  let engine: any = null
  let loading: Promise<any> | null = null
  const load = async () => {
    if (engine) return engine
    if (!loading) {
      loading = (async () => {
        const lib = await import(/* @vite-ignore */ /* webpackIgnore: true */ url)
        engine = await lib.CreateMLCEngine(model, {
          initProgressCallback: (r: { progress?: number; text?: string }) => onProgress?.(r.progress ?? 0, r.text ?? ""),
        })
        return engine
      })().catch((e) => {
        loading = null
        throw e
      })
    }
    return loading
  }
  return {
    name: "WebLLM",
    async available() {
      return !!url && typeof navigator !== "undefined" && "gpu" in navigator
    },
    writes(out) {
      return out
    },
    async *stream(messages: ChatMessage[], _out: string, signal?: AbortSignal) {
      const e = await load()
      const chunks = await e.chat.completions.create({ messages, stream: true, temperature: 0.2, max_tokens: 400 })
      for await (const c of chunks) {
        if (signal?.aborted) {
          e.interruptGenerate?.()
          return
        }
        const delta = c?.choices?.[0]?.delta?.content
        if (delta) yield String(delta)
      }
    },
  }
}
