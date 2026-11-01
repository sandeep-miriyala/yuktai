# Task runner (grid)

**Source:** `src/agentic/taskRunner.ts`  
**Package after the split:** `@yuktishaalaa/grid (experimental)`

Turns one instruction into ordered steps (filter, sort, highlight, count, summarise, anomalies, open, select, clear) and runs them on a data grid. No model needed.

## Exports

| Export | What it does |
| --- | --- |
| `planTasks(instruction)` | Splits an instruction into steps. |
| `runTasks(instruction, context, { onStep? })` | Runs the steps; returns before and after state and a plain-English summary. |
| `TaskAction / PlannedStep / StepResult / TaskRunResult` | Types. |

## How it works

Rule-based planning, then each step calls the grid tools. Progress is reported per step for the UI.

## Notes and findings

- Grid only, so it belongs in the experimental grid package, not Ask page.
- The before/after summary is a good pattern to reuse for the page agent ("what changed").

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
