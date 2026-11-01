// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page/langgraph
//
// The same five steps as AskPage.ask(), as a LangGraph.js StateGraph, plus a
// LangChain retriever. For apps that already use LangChain, or that want to
// add their own nodes (an approval step, a different answer model).
//
//   match_shortcut ──(answered)───────────────────────────────→ cite_sources → END
//        └──(no)→ retrieve → check_confidence ──(not on page)─→ cite_sources → END
//                                 └──(confident)→ write_answer → cite_sources → END
//
// Browser-only: imports @langchain/langgraph/web (no Node async hooks).
// No tracing: nothing is sent to LangSmith or anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

import { Annotation, END, START, StateGraph } from "@langchain/langgraph/web"
import { BaseRetriever } from "@langchain/core/retrievers"
import { Document } from "@langchain/core/documents"
import type { AskCallbacks, AskPage } from "./controller"
import type { Answer, SearchResult, Settings } from "./types"
import type { ShortcutKind } from "./insights/shortcuts"
import type { UiLang } from "./lang"
import { answerLang } from "./lang"

export const AskStateAnnotation = Annotation.Root({
  question: Annotation<string>,
  lang: Annotation<UiLang>,
  settings: Annotation<Settings>,
  shortcut: Annotation<ShortcutKind | null | undefined>,
  search: Annotation<SearchResult | undefined>,
  answer: Annotation<Answer | undefined>,
})

export type AskGraphState = typeof AskStateAnnotation.State

/** Builds and compiles the graph for one AskPage. */
export function createAskGraph(page: AskPage, cb: AskCallbacks = {}) {
  const n = page.nodes
  // node names differ from state keys ("shortcut", "answer"): LangGraph requires it
  const graph = new StateGraph(AskStateAnnotation)
    .addNode("match_shortcut", (s: AskGraphState) => n.shortcut(s))
    .addNode("retrieve", (s: AskGraphState) => n.retrieve(s))
    .addNode("check_confidence", (s: AskGraphState) => n.check(s))
    .addNode("write_answer", (s: AskGraphState) => n.answer(s, cb))
    .addNode("cite_sources", (s: AskGraphState) => n.cite(s))
    .addEdge(START, "match_shortcut")
    .addConditionalEdges("match_shortcut", (s: AskGraphState) => (s.shortcut ? "cite_sources" : "retrieve"), ["cite_sources", "retrieve"])
    .addEdge("retrieve", "check_confidence")
    .addConditionalEdges("check_confidence", (s: AskGraphState) => (s.answer ? "cite_sources" : "write_answer"), ["cite_sources", "write_answer"])
    .addEdge("write_answer", "cite_sources")
    .addEdge("cite_sources", END)
  return graph.compile()
}

/** Runs one question through the graph. Same result as page.ask(). */
export async function askWithGraph(page: AskPage, question: string, cb: AskCallbacks = {}): Promise<Answer> {
  await page.init()
  const app = createAskGraph(page, cb)
  const out = await app.invoke({ question, lang: answerLang(question, page.settings.lang), settings: { ...page.settings } }, { signal: cb.signal })
  return out.answer as Answer
}

/** A LangChain retriever over the current page (Rust search underneath). */
export class AskPageRetriever extends BaseRetriever {
  lc_namespace = ["yuktishaalaa", "ask_page"]
  constructor(private page: AskPage, private k = 5) {
    super()
  }
  async _getRelevantDocuments(query: string): Promise<Document[]> {
    const r = await this.page.search(query, this.k)
    return r.hits.map(
      (h) =>
        new Document({
          pageContent: h.passage.text,
          metadata: { section: h.passage.ref, passageId: h.passage.id, score: h.score, bm25: h.bm25, cosine: h.cosine, coverage: h.coverage, confident: r.confident },
        }),
    )
  }
}
