# Changelog

All notable changes to `@yuktishaalaa/yuktai`. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

## 6.0.3 (2026-11-14)

- **`@yuktishaalaa/assistant` 6.0.3**: new `panelLang` and `offset` options; wrong options and values are reported in the console instead of failing silently; Ask opens on the same side as the ♿ button; docs show every option (`title`, `color` and the rest).

## 6.0.2 (2026-11-14)

- **`@yuktishaalaa/a11y` 6.0.2: smart dark mode.** Colours are changed one by one instead of inverting the page: photos, videos, emoji and brand colours keep their real colours, and text keeps WCAG AA/AAA contrast on the new dark backgrounds. New content is darkened as it arrives.
- **`@yuktishaalaa/assistant` 6.0.2** uses it.
- **`@yuktishaalaa/ask-page` 1.0.2**: a clear message when the question and the page are in different languages in Fast mode.
- `@yuktishaalaa/yuktai` bundles the a11y 6.0.2 engine.

## 6.0.1 (2026-11-14)

Bug fixes for the YuktAI Assistant, found by testing on real sites.

- **`@yuktishaalaa/a11y` 6.0.1**: read aloud skips emoji and symbols, reads only what is visible and the main content, keeps short English words in a Telugu sentence; text size works on `px` sites; no dark mode on already-dark pages; new checks for symbol-only buttons and broken skip links; single-page apps and shadow roots.
- **`@yuktishaalaa/assistant` 6.0.1**: site title and brand colour, draggable text-size slider, messages that stay, panel language picker, Windows High Contrast, the panel follows dark/high contrast, "Go to main content", Alt+Shift+Y, one Ask button.
- **`@yuktishaalaa/ask-page` 1.0.1**: Telugu/Hindi question words, focus returns on close, honest "search" label without built-in AI.
- `@yuktishaalaa/yuktai` bundles the a11y 6.0.1 engine.

## 6.0.0

YuktAI 6.0: the **YuktAI Assistant** and a new accessibility engine, **@yuktishaalaa/a11y**, shared by everything.

### New packages
- **`@yuktishaalaa/a11y` 6.0.0**: web accessibility for any page from one attribute (`<body data-yuktai-a11y="auto" data-yuktai-level="AA">`). Safe ARIA ("do no harm"), WCAG AA/AAA contrast (check or fix; text over images is reported as *not checked*, never *pass*), `lang` found from the text for the page and each part (WCAG 3.1.1, 3.1.2, `dir="rtl"` for Urdu/Arabic), read aloud with the browser's Web Speech in the right voice for each part, visitor preferences (text size, spacing, motion, focus ring, themes, dark mode), a report in three groups (fixed / check / unknown) with WCAG numbers and English/Telugu messages, `undo()` and `destroy()`.
- **`@yuktishaalaa/assistant` 6.0.0**: one panel for accessibility and Ask this page. Three ways to use it: npm (`mountAssistant()`, `<YuktaiAssistant />` for Next.js and React), a script for any website (`assistant.global.js` + `window.YuktaiAssistantConfig`), and a browser extension zip for Chrome, Edge and Brave (popup, Alt+Shift+Y, Alt+Shift+A for Ask, "Always on for this site" with a per-site permission; works on pages with a strict CSP).

### Changed (breaking: why this is 6.0)
- **The accessibility engine no longer invents labels or states.** Before, it added `aria-label="button"`, `"link"`, `"embedded content"`, form labels from field names, `alt="" aria-hidden="true"` on every image without alt, and `aria-checked/expanded/selected="false"` on custom widgets. A made-up label or state is worse than none, so these are now reported in the details as `check: …` and not counted as fixed.
- **`<html lang>` is detected from the page text** (Telugu pages get `te`), not set to `"en"`; parts in another language get their own `lang`.
- The language detection of `@yuktishaalaa/a11y` is bundled into `@yuktishaalaa/yuktai` (no new runtime dependency).

### Docs site
- New page **YuktAI Assistant** (`/assistant/`) with the extension zip to download, the script and the npm setup; first entry in Get started.

### Fixed
- Telugu and other IME keyboards: Enter that finishes a word no longer sends half a word (Autocomplete, Grid AI Assistant, YuktAI agent and RAG boxes, widget panel).
- Grid: ArrowDown/ArrowUp move between clickable rows and cards, Home/End to the first and last.

### Migration from 5.x
- If you relied on the engine adding `aria-label` to empty buttons, links and fields, or hiding images without `alt`: read `report.details` entries that start with `check:` and fix them in your HTML. Nothing else changes in the API.
- To keep a part of the page untouched: `data-yuktai-a11y="off"` on it.

## 5.7.0

### Grid: agentic AI (browser's own AI, with rules as the fallback)
- `ai` grids plan plain-language requests with Chrome's built-in AI (`createChromeGridPlanner`): structured JSON output, tool calling, up to 5 checked steps, one corrected re-plan when a step fails, a short memory of the conversation ("same, but only Guntur"), and a question instead of a guess when a request is unclear. Telugu is translated to English first when the browser can. Without browser AI the built-in rules answer, as before. `ai={{ planner: false }}` turns it off.
- Every step shows as a chip (filters, sort, highlights), each removable; **Undo** and **Reset view** buttons; spoken status after each request.
- New tools for the assistant and WebMCP: `download` (asks Yes / No first, for WebMCP agents too), `reset_view`, `undo`, `expand` (with `getChildren`).
- Agent: `planner` and `confirm` options; results carry `steps` and `via`; new error codes `NEEDS_INPUT` and `CANCELLED`.
- `GRID_EVAL_SET` (50 English and Telugu requests), `runGridEvals`, `scorePlan`.

### Grid: settings, downloads, parent and child rows
- ⚙ settings at the top right: show or hide the assistant, accent colour (7 presets or your own; the text colour on it is picked for at least 4.5:1, with a note when the colour is faint on the background), row spacing, downloads. Remembered per grid (`storageKey`).
- Downloads of the rows shown (after search, filters, sort): CSV (with BOM for Telugu; formula injection blocked), Excel `.xlsx` (no extra library), JSON, PDF (print). Props `downloads`, `downloadName`.
- `devTools`: engine choice (Auto, Rust, TypeScript), search time, and a TypeScript vs Rust chart (with the same numbers as a table) on this grid's data.
- `getChildren`: ▶ shows child rows (tables and phone cards); search looks inside children and opens the parents that match; downloads include children with their level.
- The assistant starts hidden behind a ✨ Assistant button (`ai={{ assistantOpen: true }}` to start open); it follows the grid's accent instead of a fixed green; its voice language list shows only English and the scripts found in the data.

### Grid: accessibility fixes
- Sortable headers are real buttons (keyboard sorting, WCAG 2.1.1) with `aria-sort` (4.1.2).
- Tables have a name (hidden caption; `label` prop, default "Data grid").
- Result counts and "No rows match." are announced (4.1.3).
- A table wider than its box becomes a focusable scroll region (2.1.1); the grid can shrink inside flex layouts, so phones and installed apps scroll inside the grid instead of widening the page.
- Assistant: timestamp contrast, conversation log focusable, search icon placed inside the input.

### Other
- Grid `engine` default is now `"auto"` (Rust from 10,000 rows); small tables skip starting WebAssembly.
- `peerDependencies`: React 18 or newer (the library already used React 18 APIs).
- WebMCP note in the grid types: Chrome 149–162.

## 5.6.3

### Fixed (YuktAI UI)
- `Autocomplete` opens when the field is clicked, not only from the arrow.
- With a value already chosen, opening the list shows every option; filtering starts only once the user types (the list showed just the chosen option).
- `onOpen`, `onClose` and controlled `open` work, and they no longer reach the DOM as unknown attributes.
- `groupBy` shows group headings.
- `loading` text shows only while the list is empty.
- If the field loses focus without a choice, it goes back to the chosen option's name.

## 5.6.2

### Fixed (YuktAI UI), found by comparing every Ratnalabala page with its old MUI version on desktop, tablet and phone
- Layout props now win over the base look: `Stack direction="row"` and `spacing`, `Grid` sizes, `Container maxWidth` and `Typography color` were sometimes ignored (a row showed as a column).
- Style order: rules written in the browser go after the rules the server sent, and `sx` always wins over layout props, as before.
- `TextField`, `Select` and other inputs size to their content unless `fullWidth`; they stretched to full width and pushed toolbar items onto new lines.
- Multiline `TextField` grows with its text between `minRows` and `maxRows` (fixed height only with `rows`), with no resize handle.
- `Autocomplete` has the open/close arrow; `Select` uses a single down arrow.

## 5.6.1

### Fixed (YuktAI UI)
- `Menu`, `Popover`, `Popper` and `Tooltip` opened off screen: the position was worked out before the portal had mounted, so it stayed at -9999px. They now place themselves as soon as they appear, follow size changes, and stay hidden until placed (no flash in a corner).
- 1 new test.

## 5.6.0

### New: YuktAI UI (`@yuktishaalaa/yuktai/ui`)
- 80+ accessible React components with the names and props Material code already uses: Box, Stack, Grid, Container, Typography, Paper, Card, Button, IconButton, Fab, Chip, TextField, Select, MenuItem, Switch, Checkbox, Radio, Slider, Autocomplete, ToggleButton, Tabs, Accordion, Dialog, Drawer, Menu, Popover, Tooltip, Snackbar, Alert, progress, Skeleton, List, Pagination, Breadcrumbs, transitions and more. An app moves to YuktAI by changing one import line.
- No runtime dependencies (no emotion, no MUI): one small style engine for the `sx` prop and system props (spacing, theme colours, responsive values, nested selectors, keyframes). Same styles → same class name, so server and browser agree; `getUiStyles()` sends the rules with server HTML.
- Real elements underneath: `<button>`, `<select>`, `<input type="range">`, `<dialog>` (focus trap, Esc, focus returns).
- WCAG 2.2 by default: 44px touch targets, 3px focus ring, labels and helper text wired to inputs, Tabs and Menus with arrow keys, Tooltip names icon-only buttons, reduced motion and Windows High Contrast respected.
- The theme is the site's CSS variables (`--primary`, `--foreground`, `--border`…), so dark mode works without JavaScript. `useTheme`, `useMediaQuery`, `alpha` included.
- Familiar `Mui*` class names stay on the elements, so existing CSS keeps working.
- 15 new tests.

### Also
- `<YuktaiPreferences>` button: the accessible name now starts with the visible language code ("En: Language and animations"), so speech users can say what they see (WCAG 2.5.3).
- One website: docs, guides and demos live in `site/` and publish to https://sandeep-miriyala.github.io/yuktai/ through one GitHub Action that tests everything end to end first. New End-to-end guide.

## 5.5.4

### WebMCP (grid, React and plain HTML)
- Tool results are JSON strings, as the WebMCP draft requires (they were objects, which some agents showed as "[object Object]").
- Tools carry `annotations`: `readOnlyHint` (search, count, columns, get_row) and `untrustedContentHint` (search, get_row return row text, which agents must treat as data).
- Falls back to `navigator.modelContext` in older Chrome builds.
- Late arrival: when WebMCP appears a moment after load (origin trial, extension, polyfill), the grid registers then. Status stays honest: `unsupported` until it really arrives.
- New `webmcpToken` prop (React) / option (plain HTML): adds your Chrome origin trial meta tag once.
- The agent's cancel `signal` is honoured.
- One implementation (`src/grid/webmcp.ts`) for React and plain HTML; plain HTML gets `yuktai.hasWebMCP()`.
- 10 new tests.
- No more `console.log` messages from the on-device AI (Transformers.js) loader.
- Shorter package description; simpler README with a cheat sheet and architecture diagrams.
- Open-source docs: CONTRIBUTING, CODE_OF_CONDUCT, ARCHITECTURE, ROADMAP, SECURITY, issue and pull request templates.

## 5.5.3
- Clickable grid rows and phone cards (`onRowClick`) open with Tab, then Enter or Space.
- The selection column has a heading screen readers announce ("Select").
- The loading screen closes with Skip or Esc only.
- Unused code removed. Lint: 68 warnings → 48, 0 errors.

## 5.5.2
- Stable Rust only: `rust-toolchain.toml` pins the stable channel; the nightly build path is gone.
- Oxlint and Biome for lint and format. GitHub Actions check on every push.

## 5.5.1
- Longer loading screens: with `minMs` of 4,000 or more the bar fills over that time and Skip counts down.
- `tips` shows short lines one after another (`tipMs`, default 3 s).

## 5.5.0
- `<YuktaiSplash>` loading screen with "Welcome" in 7 languages.
- `<YuktaiPreferences>`: site language and animations (Device, Off, Calm, Lively).
- `<Reveal>` fades sections in on scroll.

## 5.4.1
- Floating buttons read `--yk-fab-*` CSS variables.

## 5.4.0
- Show all: every row in one scrolling list (virtual scrolling), even 10 lakh rows.

## 5.3.16
- First and Last buttons, page numbers and "Go to page".

## 5.3.14
- Grid colours as `--yk-grid-*` CSS variables, stable class names.

## 5.3.13
- Text and date columns sort in Rust: 10 lakh rows in 0.2 to 0.8 s.
