# Page insights

**Source:** `src/agentic/pageInsights.ts`  
**Package after the split:** `@yuktishaalaa/ask-page`

Answers common questions about a page without a model: what it is for, its structure, forms, links, images without alt text and fields without labels.

## Exports

| Export | What it does |
| --- | --- |
| `analyzePage(root?)` | Outline: title, description, language, headings, landmarks, counts, unlabeled fields, images without alt, purpose. |
| `detectPageIntent(question)` | Classifies a question: purpose, missing-labels, images, structure, forms, links, counts or unknown. |
| `askAboutPage(question, { root?, summarize? })` | Answer with `targets` (elements to highlight) and `suggestions`. |

## How it works

Detects what the question is about, then answers from the page structure. A `summarize` hook (Gemini Nano or your own model) is used only for "what is this page about".

## Notes and findings

- Works with no AI at all: a good first answer in every browser, and fast.
- Use it as the shortcut layer before the agent: simple questions never reach a model.
- `targets` are selectors the UI can highlight, which is exactly the citation behaviour Ask page needs.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
