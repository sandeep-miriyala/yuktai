// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/webmcp.ts
// Lets browser agents (Gemini in Chrome and others speaking WebMCP) use Ask
// page as a tool. Every tool is read-only: agents can ask and read, never
// click, type or submit. Same privacy filter as the panel.
// ─────────────────────────────────────────────────────────────────────────────

import type { AskPage } from "./controller"

interface ModelContextTool {
  name: string
  title?: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: { readOnlyHint?: boolean }
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown
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
      annotations: { readOnlyHint: true },
      async execute(input) {
        const q = String(input?.question ?? "").slice(0, 500)
        if (!q.trim()) return { found: false, error: "question is required" }
        const a = await page.ask(q)
        return {
          found: a.kind !== "unknown",
          answer: a.text,
          engine: a.engine,
          sources: a.sources.map((s) => ({ section: s.ref, excerpt: s.excerpt })),
        }
      },
    },
    {
      name: "get_page_outline",
      title: "Page outline",
      description: "Returns the current page's title, type and section headings.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      async execute() {
        await page.init()
        const snap = page.snap!
        return { title: snap.title, pageType: page.pageType, sections: [...new Set(snap.passages.map((p) => p.ref))].slice(0, 40) }
      },
    },
    {
      name: "get_suggested_questions",
      title: "Suggested questions",
      description: "Returns questions this page can answer.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      async execute() {
        const s = await page.suggestions()
        return { pageType: s.pageType, questions: s.suggestions.map((x) => x.text) }
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
