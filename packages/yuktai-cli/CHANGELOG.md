# Changelog

## 0.1.1
- `--yes` turns everything on: the docs template with the grid, QA report and icons features. Pressing Enter at the features question picks all of them; `0` or `--features none` picks none.
- Data grid: 10 lakh (1,000,000) sample orders made in the browser (`src/data/orders.ts`, seeded, nothing downloaded). Six columns, five types: text, badge, number, date, yes/no. Choose 1,000, 1,00,000 or 10,00,000 rows. Follows the light or dark theme.
- New `feature-page-tools` page `/qa/`: 15 WCAG checks, score, what to fix, Markdown download and copy, a practice area with mistakes.
- New `icons` feature, page `/icons/`: every YuktAI icon with search, size, outline or filled, colour with a contrast check, copy the code.
- Lifecycle: `useLifecycle({ onStart, onChange, onEnd })` in `src/components/yuktai/lifecycle.ts`, also sent as a `yuktai:lifecycle` window event. Used by the grid, QA report and icons pages; docs guide at `/lifecycle/`.
- README.md is now written for the choices made in `init`: pages, data types, lifecycle, folders, settings, deploy.
- Home page cards link to the grid, QA report, icons and lifecycle pages.
- Needs `@yuktishaalaa/yuktai` 5.3.13 (text and date columns sort in Rust).
- New YuktAI logo, the "Y of agents": three agents joined at one hub, with a spark at the hub. White on a navy → blue tile (6:1 to 19:1). Light and dark lockups in `brand/`.
- Default theme colour is now `blue`, the brand blue (`#0038B4` text, 9.4:1 on white). `violet`, `teal` and `orange` are still there.
- PWA: `public/manifest.json` with 192, 512 and maskable icons, an Apple touch icon and an SVG favicon. Works under a GitHub Pages sub-folder too.
- Header uses the new logo (`src/components/yuktai/Logo.tsx`).
- Built-site tests also check the manifest and icons.
- `npm test` in the CLI runs only the CLI's own tests.

## 0.1.0
- `npx yuktai init`: Next.js + Rust (or Next.js only), starter or docs template, grid and page-tools features, Netlify or GitHub Pages.
- `yuktai dev` and `yuktai build`: Rust → WebAssembly when `rust/` exists, then Next.js.
