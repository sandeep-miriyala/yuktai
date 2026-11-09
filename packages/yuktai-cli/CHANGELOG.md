# Changelog

## 1.4.0
- **Vercel hosting:** `--host vercel` (also in the questions) adds `vercel.json`. Push to GitHub, then on vercel.com/new import the repository and press Deploy: no settings to change. It is a static site (`"framework": null`, output `out/`), with the same security headers as Netlify (CSP that allows the Rust WebAssembly core and Ask this page's worker), long caching for `/_next/static/` and no caching for `sw.js`. Pull requests get preview links. No Vercel Analytics or Speed Insights: nothing about visitors is collected.
- **Rust on Vercel:** Vercel's build machines have no Rust, so `vercel.json` runs `npm run build -- --setup-rust`. New `yuktai build --setup-rust` installs a minimal toolchain with the official rustup installer and adds the WebAssembly target, only when the app has `rust/` and cargo is missing. If that fails the build goes on with the TypeScript engine.
- `yuktai init --host vercel` warns that Vercel's free Hobby plan is for personal, non-commercial sites only, and to open the site once on Jio and Vi mobile data in India (some custom domains on Vercel don't load there). The new app's README and the docs template's "Put it online" page say the same, and show `npm create yuktai@latest` for all three hosts.
- `yuktai help` showed the old `--host` default (`none`); it is `github-pages`.
- 2 new tests (9 in all).

## 1.3.1
- **Fix: `npm run build` failed in new apps** with "Cannot find module '@/data/products'". Two old template files (`grid/ProductGrid.tsx`, `app/manifest.ts`) were still in the 1.3.0 package. They are gone, and a new test checks that every `@/` import in a new app points at a real file, for every template and feature, so this can't ship again.
- **GitHub Pages by default:** `--yes` (and the first choice in the questions) adds `.github/workflows/deploy.yml`. Push, then Settings → Pages → Source: GitHub Actions. The workflow caches the Next.js build and turns telemetry off. The end of `yuktai init` says what to click, and the README warns not to use GitHub's suggested Next.js workflow.
- **One settings file:** new apps have no `next.config`. `yuktai dev` and `yuktai build` write one for each run (static export, GitHub Pages path) and remove it afterwards. An app with its own `next.config.*` keeps it.
- **No git inside git:** created inside another repository (a Codespace, a monorepo), the app joins that repository instead of starting its own.
- "Next" at the end of `yuktai init` now says to go into the new folder first.
- New tagline everywhere: "accessible, agentic web apps. Rust speed, Indian languages, one command." (welcome line of `yuktai init`, now "◆ YuktAI v1.3.1" without the 🙏, `yuktai help`, npm description, README). New apps describe themselves as "an accessible web app built with YuktAI".

## 1.3.0
- **Agentic AI menu:** one main menu with a submenu: Grid Agent, Ask the documents (RAG), Testing Agent, YuktAI Assistant and Python API. Keyboard: Enter or ↓ opens it, ↑ ↓ move, Esc closes; on phones the list opens below the menu bar, never cut off. Menu words in all 7 site languages. The menu now has 7 items: Home, Docs, Data grid, Agentic AI ▾, QA report, Icons, About.
- Add your own submenu in `src/data/site.ts`: a group with `children` becomes a ▾ menu.
- The Agents page has a section for each submenu item (`#grid-agent`, `#rag`, `#testing-agent`, `#assistant`).
- Loading screen tip changed to "Search and sort 25 lakh rows in your browser, in Rust."

## 1.2.1
- **Two apps at once:** when port 8000 is busy, `npm run dev` starts the Python API on the next free port (8001…) and tells the site where it is. The API now accepts calls from any `localhost` port, so a site that moved to 3001 still connects.
- **No service worker while developing:** `npm run dev` removes any service worker on that localhost port, so an old one (from this app or another site that used the same port) can't serve stale pages or missing styles. Built sites (`npm run build`) work offline as before.

## 1.2.0
- **One command runs everything:** `npm run dev` builds Rust → WebAssembly, starts the **Python API** (FastAPI, `backend/`) and Next.js together. The first run makes `backend/.venv` and installs the requirements. No Python? The site still runs, with a note on how to add it. `npm run dev -- --no-api` skips the API.
- **Python API** (`--features backend`, on with `--yes`): `/api/health`, `/api/orders` (25 lakh sample orders, page by page, made on demand: no database), `/api/orders/{id}`, CORS for the site, settings in `backend/.env`, 7 pytest tests. New commands: `npm run dev:api`, `npm run test:api` (`yuktai api`, `yuktai api-test`).
- **Backend page** (`/backend/`): live API status, 25 lakh orders paged from Python, how to add an endpoint.
- **Agents (LangGraph, Python):** Grid Agent (tool calling: count, total, average, top, by city) and **RAG** over `backend/knowledge/*.md`, both on the new `/agents/` page; **Testing Agent** (`npm run agent:test`: lint, site test, pytest, Playwright, then what to fix) and **YuktAI Assistant** (`npm run assistant`: add pages and API endpoints after you say yes, how-to answers). Groq when `GROQ_API_KEY` is in `backend/.env` (kept on the server), free mode without a key. Developer agents are off when `YUKTAI_ENV=production`. Make your own with `build_agent(tools, instructions, model)`.
- **PostgreSQL basics:** `backend/db/` with `schema.sql` (orders, and RAG passages with pgvector), `seed.sql`, a Docker file and the everyday commands; `/api/db/health`.
- **Playwright:** `npm run test:e2e` with tests for the home page, keyboard skip link, grid search, backend page and phone width.
- New API endpoints load by themselves from `backend/app/routes/`. 21 pytest tests in all, none needing a key or a database.
- **Data grid: 25 lakh rows** by default (search 0.3 s, sort 0.5 s, Show all to the last row, measured in desktop Chrome). Phones and computers with less than 8 GB memory start at 10 lakh; any size can be picked on the page.

## 1.1.1
- **Loading screen** stays 15 seconds by default (`splash.seconds` in `yuktai.config.ts`): the bar fills over that time, **Skip** counts down, and short tips (`splash.tips`) change every 3 seconds. Still once per browser tab.
- **Selected text** is readable everywhere, also inside dark code boxes (Windows drew a light selection over light code text).
- Uses `@yuktishaalaa/yuktai` 5.5.3 (stable Rust, keyboard fixes).

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
