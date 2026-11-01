# Changelog

## 0.1.0 (2026-11-01)

First release.

- `<yuktai-ask>` side panel: streaming answers, highlighted sources, suggestions, Clear chat with undo, A−/A+, settings, dark/light, phone bottom sheet
- Privacy filter: form values, passwords, editors and `data-ask-private` never read; signed-in pages kept in memory only
- Rust/WASM search core (`rust/ask-core`): Telugu-aware tokenizer, BM25, int8 vectors, RRF, idf-weighted confidence; TypeScript twin
- Fast / Balanced / Best modes; Transformers.js v4 + multilingual-e5-small after consent; Chrome Prompt, Translator and Summarizer APIs; optional WebLLM
- Suggested questions: owner, pinned and dynamic rules for 9 page types, at least 5 per page
- OPFS → IndexedDB → memory storage with cache keys and limits
- WebMCP read-only tools; LangGraph.js StateGraph and LangChain retriever (`/langgraph`)
- Tests: 50 unit, 12 Rust, 15 browser, axe 0 violations; eval recall@5 95.7%
