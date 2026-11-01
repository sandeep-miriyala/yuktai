# Grid WebMCP bridge

**Source:** `src/grid/YuktaiGridWebMCP.tsx`  
**Package after the split:** `@yuktishaalaa/grid (experimental)`

A React component that registers the grid tools with the browser's WebMCP API (`document.modelContext.registerTool`), so AI agents in the browser can use the grid.

## Exports

| Export | What it does |
| --- | --- |
| `YuktaiGridWebMCP(props)` | Registers the tools; renders nothing. |
| `WebMCPStatus` | `state` (unsupported, registering, ready, partial, error), `registered`, `errors`. |
| `Props` | `tools` or `data` + `columns`, `rowKey`, `locale`, callbacks, `name` prefix (default `yuktai_grid`), `descriptions`, `onStatusChange`. |

## How it works

On mount, registers each tool with an AbortSignal; on unmount, aborts to unregister. Reports which tools the browser accepted.

## Notes and findings

- Reuse this exact pattern for page tools (`yuktai_page_search`, `yuktai_page_outline`, `yuktai_a11y_check`).
- Mark read-only tools with an annotation so agents know they are safe.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
