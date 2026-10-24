# yuktai — Vanilla JS

The whole yuktai 5.2 toolkit for plain HTML pages: one script file, no React, no build step, no API keys.

- **Data grid you can talk to**: search, sort, pagination, selection, CSV export, five WCAG themes, table/card views, Telugu UI, and keyboard navigation with ARIA grid roles.
- **Agents**: smart grid queries, BI answers, multi-step tasks, an anomaly finder, a grid assistant with custom rules and voice, and WebMCP.
- **Page tools**: Accessibility Copilot, QA report (15 WCAG checks), form review, design review, page Q&A and voice commands.
- **Accessibility engine**: WCAG auto-fixes, high contrast, dark mode, reduced motion, large targets, colour-blind filters, a dyslexia font, text size 80–130%, skip links and speak-on-focus.

The logic is bundled from this repo's `src/` (the same code as the npm package), so a question gets the same answer in React and in plain HTML. Only the React components and hooks are rewritten, in `vanilla/src/`.

## Use it

```html
<script>
  window.YUKTAI_CONFIG = { position: "right", showPageTools: true }  // optional
</script>
<script src="./index.js"></script>   <!-- or index.min.js -->

<div id="staff"></div>
<script>
  const grid = yuktai.renderGrid("#staff", {
    data: rows,
    rowKey: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "salary", label: "Salary", type: "number" },
      { key: "joined", label: "Joined", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ],
    agentic: true,   // question bar: "salary over 1 lakh", "average salary by department"
    ai: true,        // assistant: custom rules → phrases → tools, with voice input
  })
</script>
```

Open `index.html` in this folder to see every feature with working examples, including a Telugu grid.

## `YUKTAI_CONFIG` (floating buttons)

| Option | Default | Purpose |
| --- | --- | --- |
| `position` | `"left"` | Side for the floating buttons: `"left"` or `"right"` |
| `primaryColor` | `#0f766e` | Accent colour (keep 4.5:1 against white) |
| `title` | `"Accessibility"` | Settings dialog title |
| `showPageTools` | `false` | Adds the 🛠 button that opens the six page tools |
| `defaultTab`, `voiceLang` | `"qa"`, `"en-IN"` | Settings for the page tools |
| `generate(q, ctx)`, `summarize(text)` | — | Optional hooks for your own model (Ask tab) |
| `config` | — | Engine overrides, for example `{ autoFix: false }` |
| `applyOnLoad` | `true` | Run the engine once on page load (restores saved settings) |
| `autoInit` | `true` | Set `false` to call `yuktai.init()` yourself |

`yuktai.open()`, `yuktai.close()`, `yuktai.openTools("forms")`, `yuktai.apply({ highContrast: true })`, `yuktai.reset()` and `yuktai.getSettings()` control the widget from code. Settings are saved in `localStorage` (`yuktai-a11y-prefs`), the same key the npm package uses.

## `renderGrid(container, options)`

The v5.1 vanilla signature `renderGrid(container, rows, columns, options)` still works.

| Option | Purpose |
| --- | --- |
| `data`, `columns`, `rowKey` (`"id"`) | Rows, columns, row ID field |
| column: `key`, `label`, `type` (`text`/`number`/`date`/`boolean`/`badge`), `align`, `sortable`, `render(value, row, index)` returns text or a DOM node, `hiddenOnMobile`, `width` | |
| `label` | Accessible name of the grid |
| `locale` | `"en-IN"` (default), `"te-IN"` for Telugu UI and messages, or any Indian locale code |
| `theme` | `default`, `high-contrast`, `dark`, `color-blind`, `dyslexia` |
| `view`, `mobileBreakpoint` | `table`, `card` or `auto` (cards below 640px) |
| `pagination` | `{ pageSize, showSizeChanger, sizeOptions }`, or `false` |
| `search`, `selectable`, `exportable` | `false` turns each one off |
| `selectedKeys`, `highlightIds`, `autoScrollToHighlight` | Initial state |
| `loading`, `empty` | Loading state; empty message (text or a node) |
| `agentic` | `true` or `{ title, placeholder, examples, hint }`: the question bar |
| `ai`, `inputLanguage`, `assistantExamples` | Built-in assistant with voice input |
| `customRules` | `[{ name, phrases, description, execute({ input, data, columns, executeTool }) }]`, in any language |
| `parseIntent(text, ctx)` | Replace the built-in phrase parser |
| `webmcp`, `toolName`, `toolDescriptions`, `onWebMCPStatusChange` | Expose the 11 grid tools to browser AI agents |
| `referenceDate` | "Now" for "this month" questions |
| `onRowClick(row)`, `onOpenRow(id)` | Enables the `open` tool and "open Ravi" |
| `onSelectionChange(keys)`, `onSortChange(sort)`, `onFiltersChange(filters)`, `onAgentResult(r)` | Events |
| `wrap`, `maxHeight`, `showTitle`, `className` | Layout |

**Keyboard:** Tab into the table, then use the arrow keys to move between cells.

- Home / End go to the first or last cell in a row; Ctrl+Home / Ctrl+End go to the first or last cell in the table.
- Page Up / Page Down change the page.
- Space selects a row; Enter sorts (on a column header) or opens the row.
- Only one cell is in the Tab order.

### Grid API

```js
await grid.ask("salary over 1 lakh in Hyderabad")      // answer text (useAgenticGrid)
await grid.askDetailed("average salary by department")  // { answer, kind, table, steps, gridData, … }
await grid.assistantAsk("sort by salary desc")          // assistant pipeline result
await grid.executeTool("filter", { key: "salary", operator: "greaterThan", value: 100000 })
grid.search("Pune"); grid.setFilters([...]); grid.clearFilters(); grid.sortBy("name", "desc"); grid.clearSort()
grid.highlight(["1001"]); grid.clearHighlight(); grid.select(["1001"]); grid.getSelectedRows()
grid.goToPage(3); grid.nextPage(); grid.prevPage(); grid.setPageSize(50); grid.getPage()
grid.setTheme("dark"); grid.setView("card"); grid.setLoading(true)
grid.getRows(); grid.getPageRows(); grid.getData(); grid.refresh(newRows); grid.setData(rows, columns)
grid.biSummary(); grid.anomalies(); grid.exportCSV(); grid.reset(); grid.destroy()
grid.tools; grid.agent; grid.agentic; grid.webmcpStatus
```

Tool results are always `{ success, message, data?, error?: { code } }` and never throw. The error codes are `NOT_FOUND`, `NOT_SUPPORTED`, `INVALID_INPUT`, `INTERNAL` and `NOT_UNDERSTOOD`.

## Without a grid

```js
const agentic = yuktai.createAgenticGrid({ data: rows, columns, rowKey: "id" })   // useAgenticGrid
yuktai.mountAgenticGridBar("#bar", agentic, { examples: ["salary under 50k"] })   // AgenticGridBar
agentic.subscribe((s) => drawMyTable(s.gridData, s.highlightIds))

const tools = yuktai.createGridTools({ data: rows, columns, rowKey: "id", onFiltersChange, onSortChange }, { name: "my_grid" })
const agent = yuktai.createGridAgent({ tools, columns, customRules, locale: "te" })  // useYuktaiGridAgent
await agent.ask("ఎన్ని")
yuktai.registerWebMCP(tools, { onStatusChange: console.log })                        // YuktaiGridWebMCP
```

## Page tools

```js
yuktai.mountAgenticPanel("#tools", { defaultTab: "qa", voiceLang: "te-IN" })  // AgenticPanel, six tabs
```

The panel is marked `data-yuktai-panel`, so the agents never audit their own UI.

## Core functions (same as npm)

- **Grid queries:** `parseAmount`, `parseGridQuery`, `executeGridQuery`, `runGridQuery`, `answerGridQuestion`, `detectAnomalies`, `summarizeRows`
- **BI:** `askInsight`, `groupBy`, `comparePeriods`, `trend`, `aggregate`
- **Tasks:** `planTasks`, `runTasks`
- **QA:** `runQaAudit`, `auditToMarkdown`, `auditToJSON`, `AUDIT_RULES`
- **Copilot:** `createA11yCopilot`
- **Page understanding:** `askAboutPage`, `analyzePage`, `detectPageIntent`
- **Page and data RAG:** `createContextIndex`, `tokenize`
- **Forms and design:** `reviewForms`, `reviewForm`, `readFormFields`, `reviewDesign`
- **Voice:** `parseVoiceA11yCommand`, `createVoiceA11yController`, `moveGridRowFocus`
- **Grid tools:** `createGridTools`, `getRowId`, `applyGridFilters`, `toGridToolColumns`, and each tool function
- **Other:** `contrastRatio`, `parseColor`, `relativeLuminance`, `accessibleName`, `wcagPlugin`
- **Icons:** `icon(name, size, label?)` and `iconNames`

## Build and test

```bash
npm i -D esbuild           # once
node vanilla/build.mjs     # → vanilla/index.js and vanilla/index.min.js

# End-to-end checks in real Chromium (37 checks plus axe-core)
npm i -D playwright-core axe-core
CHROME=/path/to/chrome node vanilla/test/e2e.mjs
```

Edit `vanilla/src/*` or `src/*`, then rebuild. Do not edit `vanilla/index.js` by hand.

## Honest limits

- Questions are understood with rules, not a language model, so unusual phrasing may need rewording. Telugu and Hindi data questions need custom rules.
- QA, form and design checks are heuristics. Test with a keyboard and a screen reader before release.
- Voice depends on the browser's speech recognition. Typed commands always work.
- WebMCP needs `document.modelContext`. The real status is always reported.
- Filtering and paging run in the browser and suit a few thousand rows. For 100K+ rows, page on the server and call `grid.refresh(pageRows)`.
- The floating buttons are added under `<html>` (not `<body>`), so the colour-blind filter on `<body>` cannot move them.
