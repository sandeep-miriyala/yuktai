# Ask page: Chrome built-in AI

**Source:** `src/core/ai/rag.ts`  
**Package after the split:** `@yuktishaalaa/ask-page`

Answers a question about the current page with Chrome's on-device model (Gemini Nano, Prompt API). This is the main Ask page path.

## Exports

| Export | What it does |
| --- | --- |
| `askPage(question)` | Reads the page text and answers the question. Returns `RagResult`. |
| `askWithContext(question, context)` | Answers from text you pass in instead of the page. |
| `RagResult` | `{ success, answer, error? }` |

## How it works

1. Collects the visible page text.
2. Sends the question and the text to the on-device model.
3. Returns the answer, or `success: false` with an error.

## Notes and findings

- Returns only text: no sources or citations yet. Adding the passages used would let the UI highlight them.
- Shares the `RagResult` type with `transformers-rag`; move it to one shared types file in the new package.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] Add citations: return the passage ids used for the answer
- [ ] Say "not on this page" instead of guessing when nothing relevant is found
