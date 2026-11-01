# Context index (page search)

**Source:** `src/agentic/contextIndex.ts`  
**Package after the split:** `@yuktishaalaa/ask-page`

The search engine behind Ask page: splits the page (and grid rows or extra documents) into passages and finds the best ones for a question. Can answer without any model (extractive).

## Exports

| Export | What it does |
| --- | --- |
| `tokenize(text)` | Unicode-aware words; keeps Telugu and Devanagari combining marks together. |
| `pagePassages(root?, maxChars?)` | Splits the page into passages; `ref` holds the section heading. |
| `gridPassages(data, columns, rowKey?)` | Turns grid rows into passages. |
| `createContextIndex(options)` | Builds the index. Returns `search`, `ask`, `rebuild`, `update`, `size`, `engine`, `whenEngineReady`. |
| `ContextPassage / ContextHit / ContextAnswer` | Passage, scored hit, and answer with `hits` and `generated`. |

## How it works

- Keyword search (scored with term weighting and passage length), in TypeScript or Rust.
- `engine`: `"rust"` (default since 5.3.11), `"auto"` (Rust from 1,000 passages) or `"ts"`. Same scores either way; falls back to TypeScript when WebAssembly is blocked.
- `ask()` returns the best passage when no `generate` function is given, or calls your model with the top passages.

## Notes and findings

- **Already returns `hits` with `ref` (the heading).** That is enough for citations and highlighting: the UI just needs to use it.
- Keyword-only today. Adding embeddings (hybrid search) would help with questions worded differently from the page.
- Call `rebuild()` when the page changes (a MutationObserver in the UI).

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] UI shows sources from `hits[].ref` and highlights them on the page
- [ ] Telugu tokenizer tests (గుణింతాలు, ఒత్తులు)
