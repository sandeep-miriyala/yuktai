# Accessibility copilot

**Source:** `src/agentic/a11yCopilot.ts`  
**Package after the split:** `@yuktishaalaa/a11y`

Scans the page for accessibility issues, explains them and applies safe fixes, rescanning when the page changes.

## Exports

| Export | What it does |
| --- | --- |
| `createA11yCopilot(options)` | Returns `start`, `stop`, `scan`, `explain`, `applyFix`, `applyAllFixes`, `undoAll`, `getState`. |
| `A11yCopilotOptions` | `onUpdate`, `debounceMs` (600 ms), `autoApply` (off), `defaultLang`, plus audit options. |
| `CopilotFixResult / CopilotState` | Fix result and current state. |

## How it works

Runs the QA audit, watches DOM changes (debounced) and reports each scan. Fixes are applied one at a time or all at once, and can be undone.

## Notes and findings

- `autoApply` defaults to off: good. Automatic fixes are the "overlay" pattern the accessibility community criticises; keep the user in control.
- Becomes the `check_accessibility` tool for the Ask page agent and the Chrome extension.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
