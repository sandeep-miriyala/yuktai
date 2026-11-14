# Changelog

## 1.0.2 (2026-11-14)

- **Question in another language** (A3): in Fast mode, an English question on a Telugu page (or the other way round) used to get a plain "no answer". Ask page now says why (Fast mode matches words) and suggests asking in the page's language, or turning on Balanced mode, whose multilingual model understands both.

## 1.0.1 (2026-11-14)

- **Telugu and Hindi questions find their answers.** Words that only make a sentence a question (ఎన్ని, ఎంత, అంటే, ఉన్నాయా, कितने, क्या…) are no longer required in the answer, so "గణాలు ఎన్ని?" finds "గణాలు ఎనిమిది".
- **Focus goes back** to where it was when the panel closes; a `yuktai-ask-close` event is sent.
- **Old highlight is cleared** when a question has no answer.
- **Honest label**: when the browser has no built-in AI, the header says the answers come from search on this page, not "AI".
- Clearer message on pages with a password or account area.

## 1.0.0 (2026-11-02)

First stable release. The options in `OwnerConfig`, `mountAskPage`, `AskPage.ask()`, the `<yuktai-ask>` element and the WebMCP tool names now follow semantic versioning.

- **WebMCP connects by itself.** No setup: the read-only tools register as soon as the browser offers WebMCP, and Ask page keeps looking for a few seconds in case it arrives late. `el.webmcp` and the `yuktai-ask-webmcp` event report `connecting`, `connected` or `unsupported`
- **`webmcpToken`**: your Chrome origin trial token; Ask page adds the `<meta http-equiv="origin-trial">` tag itself
- **Chrome extension** shows **MCP** on its button when agents can use the tools
- **For developers** screen shows the live WebMCP state
- **Lists answered as lists:** "What documents are required?" gives the documents as bullet points, not one run-on line
- Tests: 59 unit, 13 Rust, 16 browser, 4 strict-CSP (incl. extension + WebMCP); eval unchanged (recall@5 95.7%, top-1 82.6%, refusals 100%)

## 0.1.4 (2026-11-02)

- **"For developers" button** (`developer: true`, on in the Chrome extension): how to add Ask page to a site, with copy buttons for the script tag and npm, and which WebMCP tools AI agents can use on the page (with how to turn WebMCP on in Chrome). Off by default, so site visitors don't see it
- Extension 0.1.4 turns it on

## 0.1.3 (2026-11-02)

Cleaner answers, WebMCP up to date.

- Leaves out page noise: "×" close buttons, "☰" menus and image text that only names the picture ("New Banner Icon", "logo"). Seen on irctc.co.in
- WebMCP tools follow the August 2026 draft: results are JSON strings, marked `untrustedContentHint` (page text is data, not instructions for the agent), and an agent can cancel a question
- Tests: 56 unit

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
