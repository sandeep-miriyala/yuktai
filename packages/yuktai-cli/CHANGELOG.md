# Changelog

## 1.1.0
- **Loading screen:** the app's logo and name with "Welcome" in English, తెలుగు, हिन्दी, தமிழ், ಕನ್ನಡ, മലയാളം and বাংলা, once per browser tab (`features.splash`). Skip button, Esc or a click skips it.
- **🌐 Language and animations** button in the header (`features.preferences`): menus and buttons in English + 6 Indian languages, and animations the visitor chooses: Device setting, Off, Calm or Lively. Off stops every animation on the page.
- Home cards fade in as you scroll and rise on hover. Add your own words in `src/data/uiText.ts`.
- Needs `@yuktishaalaa/yuktai` 5.5.0.

## 1.0.2
- **Install app** now catches the browser's install offer even when it arrives before React starts, so Chrome, Edge and Android open their real install prompt.
- **Top bar** stays on one row on desktops (961 px and up) and is solid enough to read over the page as you scroll.
- **Floating buttons** (✨ ♿ 🛠 and ↑ Back to top) share one look: the logo gradient, a white ring and a soft shadow, with `@yuktishaalaa/yuktai` 5.4.1's `--yk-fab-*` variables.

## 1.0.1
- **Install app** is always in the header until the app is installed. Chrome, Edge and Android Chrome show their own prompt; Safari (iPhone, iPad, Mac), Firefox and other browsers get short steps for that device.
- **↑ Back to top** button at the bottom right after you scroll (`features.backToTop`). Smooth scroll unless reduced motion is on; focus moves to the top too.
- **Grid:** a **Show all (10,00,000)** button lists every row in one smooth scrolling list (virtual scrolling), plus First, Last, page numbers and "Go to page". Needs `@yuktishaalaa/yuktai` 5.4.0.

## 1.0.0
Everything below is on with `npx yuktai@latest init my-app --yes`.

- **Grid AI Assistant** on the data grid: type or say `how many rows`, `unpaid`, `search Pune`, `sort by date`, `clear filters`. Runs the grid's own tools in the browser, 0.1 to 1.8 s on 10 lakh rows.
- **🎤 Voice** and **24 input languages**: English (US, India) and the 22 scheduled languages of India, listed in their own script.
- **Your own words:** sample `customRules` ("unpaid", "బాకీ", "बकाया", "biggest") in `OrdersGrid.tsx`.
- **WebMCP:** 11 grid tools for browser AI agents, with the real status shown on the page.
- Row selection; every search, sort, selection and assistant answer shows in the lifecycle log.
- **🎨 Colour and font picker** for visitors: any colour, kept at 7:1 contrast in light and dark; ready font choices (easy-to-read, serif, Telugu, Devanagari, Tamil); fonts on the visitor's computer on desktop Chrome and Edge (hidden on phones, Safari and Firefox). Saved in that browser only, restored before first paint.
- **PWA:** maskable 192 and 512, monochrome (Android themed) icon, `favicon.ico`, two screenshots for Chrome's install window, shortcuts to the grid, QA report and icons. `manifest.json` is written for the pages the app has.
- **CSS per feature:** `grid.css`, `qa.css`, `icons.css`, `look.css` next to `tokens.css` and `globals.css`. The grid follows the site colours through YuktAI 5.3.14's `--yk-grid-*` variables.
- **No hosting files by default.** `--host netlify` or `--host github-pages` adds them.
- `yuktai.config.ts`: new `theme.color`, `theme.picker`, `theme.localFonts` and a `grid` section (`assistant`, `voice`, `language`, `webmcp`).
- Needs `@yuktishaalaa/yuktai` 5.3.14.

## 0.1.2
- Netlify: the build command now runs `rustup default stable` first (Netlify has rustup but no default toolchain). If Rust can't be set up, the site still builds with the TypeScript fallback.
- Windows: no more DEP0190 warning from `yuktai dev` and `yuktai build`.
- Docs and README use `npx yuktai@latest init my-app --yes`.

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
