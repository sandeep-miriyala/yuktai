# Page summary

**Source:** `src/core/ai/summarizer.ts`  
**Package after the split:** `@yuktishaalaa/ask-page`

Summarises the current page with Chrome's built-in Summarizer API and shows the summary in a box.

## Exports

| Export | What it does |
| --- | --- |
| `checkSummarizerSupport()` | Whether the Summarizer API is available. |
| `summarizePage()` | Summarises the page; returns `{ success, summary, error? }`. |
| `removeSummaryBox()` | Removes the summary box from the page. |

## How it works

Uses Chrome's Summarizer API on the page text. Languages come from `promptOptions` (English today).

## Notes and findings

- Uses the same page text source as the agent: apply the same `.value` fix.
- Good candidate for the `summarize_page` tool in the Ask page agent.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
