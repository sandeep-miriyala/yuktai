// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/webmcp.ts
// Lets browser agents (Gemini in Chrome and others speaking WebMCP) use Ask
// page as a tool. Every tool is read-only: agents can ask and read, never
// click, type or submit. Same privacy filter as the panel. Results are JSON
// strings marked untrustedContentHint: page text may contain instructions
// meant to steer an agent, and the agent should treat it as data.
// ─────────────────────────────────────────────────────────────────────────────

import type { AskPage } from "./controller"

interface ModelContextTool {
  name: string
  title?: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean }
  /** WebMCP (Aug 2026 draft): resolves to a string; the agent may cancel with `signal`. */
  execute: (input: Record<string, unknown>, ctx?: { signal?: AbortSignal }) => Promise<string>
}

interface ModelContext {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => Promise<void> | void
}

export function getModelContext(doc: Document): ModelContext | null {
  const d = doc as Document & { modelContext?: ModelContext }
  const n = (doc.defaultView?.navigator ?? (globalThis as { navigator?: Navigator }).navigator) as (Navigator & { modelContext?: ModelContext }) | undefined
  return d.modelContext?.registerTool ? d.modelContext : n?.modelContext?.registerTool ? n.modelContext : null
}

export function askTools(page: AskPage): ModelContextTool[] {
  return [
    {
      name: "ask_page",
      title: "Ask this page",
      description: "Answers a question using only the content of the current web page, with the page sections it came from. Returns found=false when the page does not answer it.",
      inputSchema: { type: "object", properties: { question: { type: "string", description: "The question, in English, Telugu or Hindi." } }, required: ["question"] },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute(input, ctx) {
        const q = String(input?.question ?? "").slice(0, 500)
        if (!q.trim()) return JSON.stringify({ found: false, error: "question is required" })
        const a = await page.ask(q, { signal: ctx?.signal })
        return JSON.stringify({
          found: a.kind !== "unknown",
          answer: a.text,
          engine: a.engine,
          sources: a.sources.map((s) => ({ section: s.ref, excerpt: s.excerpt })),
        })
      },
    },
    {
      name: "get_page_outline",
      title: "Page outline",
      description: "Returns the current page's title, type and section headings.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute() {
        await page.init()
        const snap = page.snap!
        return JSON.stringify({ title: snap.title, pageType: page.pageType, sections: [...new Set(snap.passages.map((p) => p.ref))].slice(0, 40) })
      },
    },
    {
      name: "get_suggested_questions",
      title: "Suggested questions",
      description: "Returns questions this page can answer.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute() {
        const s = await page.suggestions()
        return JSON.stringify({ pageType: s.pageType, questions: s.suggestions.map((x) => x.text) })
      },
    },
  ]
}

/** Registers the tools; returns a function that unregisters them. */
export async function registerAskTools(page: AskPage): Promise<{ registered: string[]; dispose: () => void }> {
  const mc = getModelContext(page.doc)
  if (!mc) return { registered: [], dispose: () => undefined }
  const ctrl = new AbortController()
  const registered: string[] = []
  for (const tool of askTools(page)) {
    try {
      await mc.registerTool(tool, { signal: ctrl.signal })
      registered.push(tool.name)
    } catch {
      /* the browser refused this tool: keep the others */
    }
  }
  return { registered, dispose: () => ctrl.abort() }
}

// ── automatic connection ────────────────────────────────────────────────────

export interface WebMcpStatus {
  /** connecting: still looking · connected: tools registered · unsupported: this browser has no WebMCP */
  state: "connecting" | "connected" | "unsupported"
  tools: string[]
}

/** Adds the site's WebMCP origin trial token, once. */
export function addOriginTrial(doc: Document, token: string): void {
  if (!token || !doc.head) return
  const metas = Array.from(doc.head.querySelectorAll("meta[http-equiv='origin-trial']"))
  if (metas.some((m) => m.getAttribute("content") === token)) return
  const m = doc.createElement("meta")
  m.setAttribute("http-equiv", "origin-trial")
  m.setAttribute("content", token)
  doc.head.appendChild(m)
}

/**
 * Connects to WebMCP with no setup: registers the tools as soon as the browser
 * offers document.modelContext (or navigator.modelContext), and keeps looking
 * for a few seconds in case it arrives late (origin trial token just added, a
 * polyfill or extension that installs after the page loads).
 */
export function connectWebMCP(
  page: AskPage,
  onStatus: (s: WebMcpStatus) => void,
  opts: { token?: string; tries?: number[] } = {},
): { dispose: () => void } {
  const doc = page.doc
  if (opts.token) addOriginTrial(doc, opts.token)
  const tries = opts.tries ?? [0, 300, 1000, 2500, 5000]
  const timers: ReturnType<typeof setTimeout>[] = []
  let disposeTools: (() => void) | null = null
  let done = false
  onStatus({ state: "connecting", tools: [] })
  tries.forEach((ms, i) => {
    timers.push(
      setTimeout(async () => {
        if (done) return
        if (getModelContext(doc)) {
          done = true
          const r = await registerAskTools(page)
          disposeTools = r.dispose
          onStatus({ state: r.registered.length ? "connected" : "unsupported", tools: r.registered })
        } else if (i === tries.length - 1) {
          done = true
          onStatus({ state: "unsupported", tools: [] })
        }
      }, ms),
    )
  })
  return {
    dispose: () => {
      done = true
      timers.forEach(clearTimeout)
      disposeTools?.()
    },
  }
}
