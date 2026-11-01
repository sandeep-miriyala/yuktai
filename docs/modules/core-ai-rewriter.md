# Plain-language rewriter

**Source:** `src/core/ai/rewriter.ts`  
**Package after the split:** `@yuktishaalaa/a11y`

Rewrites hard text into simpler words with Chrome's built-in Rewriter API, for readers who need plain language.

## Exports

| Export | What it does |
| --- | --- |
| `checkRewriterSupport()` | Whether the Rewriter API is available. |
| `rewriteText(text)` | Rewrites one piece of text. |
| `rewritePage()` | Rewrites the page's paragraphs; returns how many changed. |
| `restorePage()` | Puts the original text back. |

## How it works

Sends paragraphs to the on-device Rewriter API and swaps the text in place, keeping the originals.

## Notes and findings

- Matches the `plainEnglish` accessibility setting.
- Keep links, bold text and other markup inside rewritten paragraphs.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
