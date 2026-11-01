# Page agent

**Source:** `src/core/ai/agent.ts`  
**Package after the split:** `@yuktishaalaa/ask-page (read-only parts)`

A step-by-step agent that reads the page, finds forms and sections, and makes a plan for a task the user describes.

## Exports

| Export | What it does |
| --- | --- |
| `runAgent(task, engine, onStep)` | Runs a task with `"gemini"` or `"transformers"`; reports progress through `onStep`. |
| `getPageText()` | Collects page text: title, meta tags, headings, paragraphs, lists, tables, links and more. |
| `scanFormFields()` | Lists form fields with label, type, placeholder and required. |
| `highlightField(el, durationMs?)` | Visually highlights one field. |
| `scrollToSection(keyword)` | Scrolls to the section that matches a keyword. |
| `AgentStep / AgentResult / FormField` | Types for steps, results and fields. |

## How it works

1. Reads the page with `getPageText()` and the fields with `scanFormFields()`.
2. Asks the model for an action plan (Gemini Nano with a system prompt, or Transformers.js).
3. Reports each step to the UI.

## Notes and findings

- 🔴 **Privacy: `getPageText()` includes values typed into inputs and textareas** (any value longer than 3 characters). Only hidden inputs are excluded, so **password, email and phone values can end up in the model prompt.** The model runs on the device, but this still breaks the "never touch user data" rule. Fix: never read `.value`; use labels, placeholders and `aria-label` only, and skip `type=password` entirely.
- `scanFormFields()` returns labels and types only, which is fine, but each item holds a reference to the live element. Never put the element or its value into a prompt.
- Move `highlightField` and `scrollToSection` into the read-only tools list for the Ask page agent.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] Remove `.value` from `getPageText()`; add a test with a filled password field
- [ ] Playwright test: no field value appears in the prompt
