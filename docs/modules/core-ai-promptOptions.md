# Prompt language options

**Source:** `src/core/ai/promptOptions.ts`  
**Package after the split:** `@yuktishaalaa/ask-page (shared)`

Shared language options passed to Chrome's built-in AI APIs.

## Exports

| Export | What it does |
| --- | --- |
| `PROMPT_LANGUAGES` | Prompt API input and output languages. |
| `WRITING_LANGUAGES` | Summarizer, Writer and Rewriter languages. |

## How it works

Constants only. Every built-in AI call spreads these options.

## Notes and findings

- **English only today** (`["en"]`). When Chrome adds Telugu or other languages, this is the one place to change. Until then, Telugu questions may be refused or answered poorly by the built-in model.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
