import { describe, expect, it } from "vitest"
import { AskPage } from "../src/controller"
import { registerAskTools } from "../src/webmcp"
import { askWithGraph, AskPageRetriever, createAskGraph } from "../src/langgraph"
import { DOCS, FORM, load } from "./fixtures"

/* eslint-disable @typescript-eslint/no-explicit-any */
describe("WebMCP tools", () => {
  it("registers three read-only tools and answers through them", async () => {
    const doc = load(DOCS) as any
    const tools: any[] = []
    doc.modelContext = { registerTool: async (t: any) => void tools.push(t) }
    const p = new AskPage({ doc, worker: false })
    const r = await registerAskTools(p)
    expect(r.registered).toEqual(["ask_page", "get_page_outline", "get_suggested_questions"])
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true)
    const ask = await tools[0].execute({ question: "How do I install it?" })
    expect(ask.found).toBe(true)
    expect(ask.sources[0].section).toBe("Installation")
    expect(JSON.stringify(ask)).not.toContain("elements")
    const outline = await tools[1].execute({})
    expect(outline.sections).toContain("Options")
    p.dispose()
  })

  it("never exposes typed form values to agents", async () => {
    const doc = load(FORM) as any
    const tools: any[] = []
    doc.modelContext = { registerTool: async (t: any) => void tools.push(t) }
    const p = new AskPage({ doc, worker: false })
    await registerAskTools(p)
    const out = JSON.stringify(await tools[0].execute({ question: "What is the password?" })) + JSON.stringify(await tools[0].execute({ question: "What fields are in this form?" }))
    expect(out).not.toContain("SuperSecret")
    expect(out).not.toContain("ravi@example.com")
    p.dispose()
  })
})

describe("LangGraph.js and LangChain", () => {
  it("the StateGraph gives the same answers as page.ask()", async () => {
    const p = new AskPage({ doc: load(DOCS), worker: false })
    for (const q of ["How do I install it?", "Summarize this page", "What is the refund policy for enterprise customers?"]) {
      const a = await p.ask(q)
      const b = await askWithGraph(p, q)
      expect(b.kind).toBe(a.kind)
      expect(b.text).toBe(a.text)
      expect(b.sources.map((s) => s.ref)).toEqual(a.sources.map((s) => s.ref))
    }
    const app = createAskGraph(p)
    expect(Object.keys(app.getGraph().nodes)).toEqual(expect.arrayContaining(["match_shortcut", "retrieve", "check_confidence", "write_answer", "cite_sources"]))
    p.dispose()
  })

  it("AskPageRetriever returns LangChain documents", async () => {
    const p = new AskPage({ doc: load(DOCS), worker: false })
    const docs = await new AskPageRetriever(p, 3).invoke("model download size")
    expect(docs[0].metadata.section).toBe("Requirements")
    expect(docs[0].pageContent).toContain("118 MB")
    p.dispose()
  })
})
