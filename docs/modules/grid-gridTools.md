# Grid tools

**Source:** `src/grid/gridTools.ts`  
**Package after the split:** `@yuktishaalaa/grid (experimental)`

The tool layer agents use on a data grid: search, count, columns, get row, highlight, select, open, filter, clear filters, sort and clear sort.

## Exports

| Export | What it does |
| --- | --- |
| `createGridTools(context, options?)` | Builds the tool list (`GridTool[]`) with names, descriptions and input schemas. |
| `searchGrid, countGrid, getColumns, getRow, filterGrid, sortGrid, ...` | One function per tool; each returns a `GridToolResult` with error codes. |
| `GridToolLocale` | `"en" | "te"`: tool descriptions in English or Telugu. |
| `GridToolErrorCode` | NOT_FOUND, NOT_SUPPORTED, INVALID_INPUT, INTERNAL. |

## How it works

Pure functions over a `GridToolContext` (data, columns, callbacks). The same tools feed the task runner, the grid UI and WebMCP.

## Notes and findings

- A clean pattern to copy for the page agent: typed inputs, clear error codes, locale-aware descriptions.
- Most tools only read or change the view (filter, sort, highlight). `open` and `select` call app callbacks: document what they can do.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
