# Changelog

## 0.1.2 (2026-11-01)

Newest first, works on strict sites, better on phones.

- **Newest answer on top (LIFO):** the question box sits at the top and each new question with its answer appears right under it
- **100+ questions:** 20 conversations on screen, older ones behind "Show earlier"; up to 200 kept. 100 questions take ~1.6 s and the panel stays laid out
- **Phones:** taller sheet (92dvh), compact header, suggestions in one sideways-scrolling row, no zoom on tap
- **Trusted Types:** works on sites with `require-trusted-types-for 'script'`: its own `yuktai-ask` policy, or element-by-element building when no policy is allowed
- **Chrome extension** (`npm run build:extension`): runs on sites whose CSP blocks outside scripts; Alt+Shift+A
- **Bookmarklet** in the README: Trusted Types aware, says clearly when a site blocks it
- Tests: 55 unit, 13 Rust, 16 browser + 4 strict-CSP (incl. the extension)

## 0.1.1 (2026-11-01)

Fast mode finds answers worded differently from the question.

- "sugar free" in a question now matches "Sugarfree" on the page (two words → one compound word)
- "no", "not", "version", "kind" and "available" no longer count against confidence when the page doesn't use them
- Reported on redbull.com: "Does Red Bull have a sugar-free version?" now answers instead of "This page doesn't answer that"
- New test with a product page; eval unchanged (recall@5 95.7%, top-1 82.6%, refusals 100%)

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
