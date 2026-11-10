# Changelog

All notable changes to `@yuktishaalaa/yuktai`. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

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
