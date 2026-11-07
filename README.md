<p align="center">
  <a href="https://yuktaidocs.netlify.app/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sandeep-miriyala/yuktai/main/brand/yuktai-logo-dark.png">
      <img src="https://raw.githubusercontent.com/sandeep-miriyala/yuktai/main/brand/yuktai-logo-light.png" alt="YuktAI: Open-Source Agentic AI Framework" width="520">
    </picture>
  </a>
</p>

# @yuktishaalaa/yuktai

> **Accessibility, AI and data toolkit for Next.js, React and plain HTML.** A data grid that handles 10 lakh rows and answers questions, a WCAG 2.2 accessibility widget, page Q&A, 163 icons. Everything runs in the visitor's browser: **no API keys, no server, no cost, works offline.**

[![npm](https://img.shields.io/npm/v/@yuktishaalaa/yuktai)](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
[![downloads](https://img.shields.io/npm/dm/@yuktishaalaa/yuktai)](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
[![license](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/sandeep-miriyala/yuktai/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-13%2B-black)](https://nextjs.org)
[![Rust](https://img.shields.io/badge/engine-Rust%20%2B%20WebAssembly-orange)](https://github.com/sandeep-miriyala/yuktai/tree/main/rust)
[![docs](https://img.shields.io/badge/docs-live%20demos-0038b4)](https://yuktaidocs.netlify.app/)
[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/sandeepmiriyala03/badge.svg)](https://hub.xerj.org/contributors/sandeepmiriyala03)

📖 **Docs and live demos:** https://yuktaidocs.netlify.app/ · Built in free time by [Sandeep Miriyala](https://github.com/sandeepmiriyala03).

---

## ⚡ Start in one command

```bash
npx yuktai@latest init my-app --yes
cd my-app
npm run dev        # http://localhost:3000
```

The [`yuktai`](https://www.npmjs.com/package/yuktai) command creates a Next.js + Rust app with all of this package already set up: a **10 lakh row data grid with the Grid AI Assistant**, a **QA report**, an **icons guide**, a **🎨 colour and font picker**, an installable **PWA** and a README written for your choices. Or add the package to a site you already have ([Quick start](#quick-start)).

## ✨ What's new

- **5.5.0 — loading screen, 7 languages, animations the visitor controls:** `<YuktaiSplash>` shows your logo with "Welcome" in English, తెలుగు, हिन्दी, தமிழ், ಕನ್ನಡ, മലയാളം and বাংলা, once per tab. `<YuktaiPreferences>` is one header button for the site language (menus and buttons) and animations: Device setting, Off, Calm or Lively. `<Reveal>` fades sections in as you scroll. Nothing moves when the visitor picks Off. [Details](#loading-screen-languages-and-animations)
- **5.4.1 — floating buttons follow your colours:** the ✨ ♿ 🛠 💬 🤖 buttons of `<YuktAIWrapper>` read `--yk-fab-bg` (all buttons) or `--yk-fab-<name>-bg` (`launcher`, `tools`, `rag`, `agent`, `codegen`, `a11y`), plus `--yk-fab-text`, `--yk-fab-border` and `--yk-fab-shadow`, and carry `yk-fab yk-fab--<name>` classes. Old colours stay as fallbacks. The logo is now at the top of this page.
- **5.4.0 — Show all:** one button shows every row in one scrolling list, even **10 lakh rows**. Only the rows on screen are drawn (virtual scrolling), so it stays smooth on phones too. Search, sort, the AI Assistant and selection work on the full list. `pagination: { pageSize: 0 }` starts in Show all; `allLimit` (default 5,000) is where the list switches to virtual scrolling; `rowHeight`, `listHeight` and `showAll: false` are there too.
- **5.3.16 — pages:** First and Last buttons, page numbers (1 … 49 50 51 … 100) and "Go to page". `pagination.showPageNumbers: false` keeps just Previous and Next.
- **5.3.15:** a clearer npm page and docs links.

- **Style the grid with CSS:** every colour is a `--yk-grid-*` variable, and the parts have stable class names. Nothing changes until you set one. [Details](#style-the-grid-with-css)
- **Grid AI Assistant languages** listed in their own script: తెలుగు · Telugu, हिन्दी · Hindi, தமிழ் · Tamil…
- **Fix:** a page with the assistant no longer jumps down to it on load.
- **5.3.13:** text and date columns now sort in Rust too: **10 lakh rows in 0.2 to 0.8 s** (was 4.7 s, and over 30 s for a name column).

---

## Features

| | Feature | What it does |
|---|---|---|
| 📊 | **YuktaiGrid** | Search, sort, filter, pages or **Show all** (virtual scrolling: 10 lakh rows in one smooth list), row selection, CSV export, 5 WCAG themes, keyboard navigation, cards on phones |
| 🤖 | **Grid AI Assistant** | Type or say *"unpaid"*, *"salary over 1 lakh in Hyderabad"*, *"sort by date"*. Runs the grid's own tools: search, filter, sort, count, unusual rows, multi-step tasks |
| 🎤 | **Voice and 24 languages** | English (US, India) and all **22 scheduled languages of India** for voice and typed input |
| 🌐 | **WebMCP** | 11 grid tools that browser AI agents can call, with the real status reported |
| ♿ | **Accessibility** | WCAG 2.2 auto-fix, contrast, dark mode, text size, dyslexia font, colour-blind filters, speak on focus |
| 🛠 | **Page tools** | QA audit (15 WCAG checks, Markdown report), accessibility copilot with undo, form and design review, voice commands |
| 💬 | **Ask page (RAG)** | Answers from your page, offline. Standalone package with a side panel, highlighted sources and Telugu: [`@yuktishaalaa/ask-page`](https://www.npmjs.com/package/@yuktishaalaa/ask-page) |
| 🦀 | **Rust engine** | Search and sort in WebAssembly, up to 42× faster. The default since 5.3.11, with a TypeScript fallback |
| 🎨 | **163 icons** | Any size and colour, outline or filled, safe in Server Components |
| 📱 | **PWA** | Installable, works offline |
| ⚡ | **Vibe Coder** | Plain English → a Next.js project ZIP (developer tool; keep it off on public sites) |

## Languages

| | |
|---|---|
| **Use it from** | HTML · JavaScript · TypeScript · React (JSX) · Next.js (TSX) · jQuery 1.12–4.0 |
| **Built with** | TypeScript + Rust (WebAssembly, embedded; nothing to install) |
| **Interface** | English and Telugu |
| **Voice and typed input** | English and the 22 scheduled languages of India |
| **Numbers, dates, sorting** | Every Indian locale (10,00,000 grouping; Telugu and other scripts sort correctly) |
| **Assistant understands** | English and Telugu commands; add your own phrases in any language with `customRules` |

---

## Quick start

**Plain HTML:** one line, no build step

```html
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.5.0/vanilla/index.min.js"></script>
<script>
  yuktai.renderGrid("#staff", { data: rows, columns, ai: true, showSearchTime: true })
</script>
```

**Next.js / React**

```bash
npm install @yuktishaalaa/yuktai
```

```tsx
// app/YuktaiClient.tsx
"use client"
import { YuktAIWrapper } from "@yuktishaalaa/yuktai"
import type { ReactNode } from "react"

export default function YuktaiClient({ children }: { children: ReactNode }) {
  return (
    <YuktAIWrapper position="left" launcher showAccessibility showRag showPageTools engine="rust">
      {children}
    </YuktAIWrapper>
  )
}
```

```tsx
// app/layout.tsx: wrap your app
<body><YuktaiClient>{children}</YuktaiClient></body>
```

**A grid with the AI Assistant**

```tsx
"use client"
import { YuktaiGrid, type GridColumn, type YuktaiGridRule } from "@yuktishaalaa/yuktai"

type Order = { id: string; customer: string; city: string; amount: number; paid: boolean }

const columns: GridColumn<Order>[] = [
  { key: "customer", label: "Customer", sortable: true },
  { key: "city", label: "City", type: "badge" },
  { key: "amount", label: "Amount", type: "number", sortable: true },
  { key: "paid", label: "Paid", type: "boolean" },
]

// Your own words → grid tools
const rules: YuktaiGridRule<Order>[] = [
  { name: "unpaid", phrases: ["unpaid", "బాకీ", "बकाया"],
    execute: async ({ executeTool }) => (await executeTool("filter", { key: "paid", operator: "equals", value: "false" })).message },
]

export default function Orders({ rows }: { rows: Order[] }) {
  return (
    <YuktaiGrid
      data={rows} columns={columns} rowKey="id"
      search selectable pagination={{ pageSize: 25 }}
      ai voice inputLanguage="te-IN" customRules={rules}
      webmcp toolName="orders" showSearchTime
    />
  )
}
```

**jQuery sites** (WordPress, ASP.NET WebForms, PHP): no plugin. Tested with jQuery 1.12.4, 2.2.4, 3.7.1 and 4.0.0.

```html
<script src="https://code.jquery.com/jquery-4.0.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.5.0/vanilla/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page@1.0.0/dist/ask-page.global.js" defer></script>
<script>
  $(function () {
    yuktai.renderGrid($("#staff")[0], { data: rows, columns: cols })
    $("#contrastBtn").on("click", function () { yuktai.apply({ highContrast: true }) })
  })
</script>
```

Pin the jQuery version: `jquery-latest.js` stopped updating years ago, and jQuery 4 removed old APIs such as `$.trim`. Guide: [YuktaiDocs › jQuery](https://yuktaidocs.netlify.app/jquery/)

**Icons**

```tsx
import { SearchIcon } from "@yuktishaalaa/yuktai/icons"

<SearchIcon size={24} color="#0038b4" label="Search" />
```

### Wrapper buttons

| Prop | Button |
|---|---|
| `launcher` | ✨ One button that shows or hides the others |
| `showAccessibility` | ♿ Accessibility |
| `showPageTools` | 🛠 QA report, copilot, form and design review, voice |
| `showRag` | 💬 Ask page |
| `showAgent` | 🤖 AI agent |
| `showVibeCoder` | ⚡ Vibe Coder (keep it off on public sites) |
| `engine` | Search engine: `"rust"` (default), `"ts"` or `"auto"` |

More examples for every feature: **https://yuktaidocs.netlify.app/**

---

## Rust engine (default)

The grid and page search use Rust by default. Results are identical to TypeScript, proven by tests, only faster. If WebAssembly is unavailable or blocked by a Content Security Policy, they fall back to TypeScript. Set `engine="ts"` for TypeScript only, or `"auto"` for Rust from 10,000 rows.

| Task | TypeScript | Rust | Speed-up |
|---|---|---|---|
| Grid search, 1 lakh rows | 342 ms | 9 ms | 36× |
| Ask page, 5,000 passages | 18.8 ms | 0.45 ms | 42× |
| Sort a name column, 10 lakh rows | over 30 s (before 5.3.13) | 0.19 s | over 150× |

Text columns are ranked once with the browser's collator, then sorted in Rust, so Telugu and other scripts keep their correct order.

## Loading screen, languages and animations

From `@yuktishaalaa/yuktai/experience` (client components) and `@yuktishaalaa/yuktai/head` (plain strings for `<head>`, safe in a Next.js layout):

```tsx
// app/layout.tsx
import { MOTION_SCRIPT, SPLASH_SCRIPT } from "@yuktishaalaa/yuktai/head";
import { YuktaiSplash } from "@yuktishaalaa/yuktai/experience";

<head><script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT + SPLASH_SCRIPT }} /></head>
<body>
  <YuktaiSplash title="My app" logo={<img src="/logo.svg" alt="" width={520} height={156} />} />
  ...
</body>
```

```tsx
"use client";
import { GlobeIcon } from "@yuktishaalaa/yuktai/icons";
import { Reveal, YuktaiPreferences, useUiText } from "@yuktishaalaa/yuktai/experience";

const MY_TEXT = { te: { pricing: "ధరలు" }, hi: { pricing: "कीमतें" } };

export function Header() {
  const { t, lang } = useUiText(MY_TEXT);   // English on the server, the visitor's language after load
  return (
    <header>
      <nav lang={lang}><a href="/docs/">{t("docs")}</a> <a href="/pricing/">{t("pricing")}</a></nav>
      <YuktaiPreferences icon={<GlobeIcon size={18} aria-hidden="true" />} text={MY_TEXT} />
    </header>
  );
}

<Reveal delay={80}><div className="card yk-lift">…</div></Reveal>
```

| Part | What it does |
|---|---|
| `<YuktaiSplash>` | Logo, "Welcome" in 7 languages, progress bar, Skip (Esc or a click also skip). Once per tab; `once="always"` for every load. Leaves after `minMs` (1,200) from page start. Colours: `--yk-splash-bg`, `--yk-splash-text`, `--yk-splash-accent`, `--yk-splash-accent-2`; follows `data-theme`. |
| `<YuktaiPreferences>` | Header button and panel: site language and animations. `LanguagePicker` and `MotionPicker` are there on their own too. |
| `useUiText(extra)` | `t(key)` in the visitor's language. Your words first, then built-in words (`docs`, `installApp`, `askThisPage`, `backToTop`…), then English. Put `lang={lang}` on what you translate. |
| Animations | `data-motion` on `<html>`: `off`, `calm` or `lively`. Device setting follows `prefers-reduced-motion`. **Off** stops every animation and transition on the page. Classes: `yk-lift` (hover rise), `yk-float`, `yk-shimmer`, `yk-pop` (Lively only). |
| `<Reveal>` | Fades and slides in on scroll. Never hidden on the server or without JavaScript. |

Languages: English, Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali. Choices are saved in that browser only.

## Style the grid with CSS

Every grid colour is a CSS custom property whose fallback is the colour it always had. Stable class names let you style the parts.

```css
.yk-grid {
  --yk-grid-accent: #0038b4;           /* selected checkboxes */
  --yk-grid-border: #d6dbe8;
  --yk-grid-assistant-accent: #0038b4; /* Grid AI Assistant header and buttons */
}
[data-theme="dark"] .yk-grid {
  --yk-grid-bg: #12122a;
  --yk-grid-text: #f4f4fb;
}
.yk-grid__head th { text-transform: uppercase; }
```

| Variable | Used for |
|---|---|
| `--yk-grid-bg`, `--yk-grid-text`, `--yk-grid-border` | The grid box |
| `--yk-grid-control-bg`, `--yk-grid-control-bg-muted`, `--yk-grid-control-border`, `--yk-grid-control-text` | Search, buttons, selects |
| `--yk-grid-muted`, `--yk-grid-chip-bg`, `--yk-grid-disabled` | Hints, filter chips, disabled buttons |
| `--yk-grid-selected-bg`, `--yk-grid-highlight`, `--yk-grid-check-border` | Selected and highlighted rows, checkboxes |
| `--yk-grid-accent`, `--yk-grid-accent-text` | Checked boxes |
| `--yk-grid-hc-border` | Border in the high-contrast theme |
| `--yk-grid-assistant-bg`, `-surface`, `-border`, `-text`, `-muted`, `-accent`, `-user-bg`, `-ai-bg` | Grid AI Assistant (white text sits on `-accent`, so keep it dark) |

Classes: `yk-grid`, `yk-grid__toolbar`, `yk-grid__scroll`, `yk-grid__table`, `yk-grid__head`, `yk-grid__body`, `yk-grid__row`, `yk-grid__cell`, `yk-grid__cards`, `yk-grid__card`, `yk-grid__pager`, `yk-grid__assistant`. Keep text pairs at 4.5:1 or more (WCAG 1.4.3). `gridColors(dark)` returns the full list.

---

## The YuktAI family

| Package | What it is |
|---|---|
| [`yuktai`](https://www.npmjs.com/package/yuktai) | `npx yuktai@latest init my-app --yes`: a complete Next.js + Rust app in one command |
| **`@yuktishaalaa/yuktai`** | This toolkit: grid, assistant, accessibility, page tools, icons |
| [`@yuktishaalaa/ask-page`](https://www.npmjs.com/package/@yuktishaalaa/ask-page) | "Ask this page" side panel: offline RAG, sources highlighted, Telugu and Hindi |

## Live demos

- 📖 Docs and playgrounds: https://yuktaidocs.netlify.app/
- Staff directory (Next.js): https://aksharatantra.miriyala.in/staffdirectory
- Plain HTML PWA: https://sandeepmiriyala03.github.io/yuktai/vanilla/
- Ask page panel: https://sandeep-miriyala.github.io/yuktai/ask-page/
- Ratnalabala, a Telugu poetry app: https://ratnalabala.vercel.app/poems?view=grid

## Compatibility

Next.js 13–16 · React 17–19 · Node 18+ · Chrome, Edge, Firefox, Safari, Samsung Internet · jQuery 1.12–4.0 (no plugin needed). Voice needs a browser with speech recognition (Chrome, Edge, Safari). WebMCP needs Chrome with WebMCP turned on.

## Honest limits

- The Grid AI Assistant uses rules, not a language model. It understands English and Telugu commands; unusual phrasing may need rewording, and other languages need `customRules`.
- Voice input works in 24 languages, but turning speech into a grid command follows the rule above.
- The built-in 💬 button uses keyword search (BM25). [`@yuktishaalaa/ask-page`](https://www.npmjs.com/package/@yuktishaalaa/ask-page) adds meaning search (multilingual embeddings).
- 10 lakh rows need about 300 MB of browser memory; on older phones use fewer rows.
- In Show all with more than 5,000 rows, each row is one line high (long text is cut with …); the phone card view is used with pages only.
- Columns that mix numbers and text still sort in TypeScript.
- Automatic checks don't replace testing with real users and screen readers.

## Roadmap

- **Next:** agentic task runner with a confirm step and undo (LangGraph.js, optional), Hindi and more Indian-language commands, full Telugu and Hindi interface
- **Done:** Rust sorting for every column (5.3.13), grid CSS variables (5.3.14), semantic RAG in `@yuktishaalaa/ask-page`, one-command apps with `yuktai`
- **Later:** a Python package, Angular/Vue and .NET support

---

**Recognition:** part of the [XERJ Corpus Hub](https://hub.xerj.org) · [contributor profile](https://hub.xerj.org/contributors/sandeepmiriyala03)

**Contributing:** issues and PRs welcome at [GitHub](https://github.com/sandeep-miriyala/yuktai). Security: [SECURITY.md](https://github.com/sandeep-miriyala/yuktai/blob/main/SECURITY.md)

**License:** GPL-3.0 © Sandeep Miriyala, Yuktishaalaa AI Lab. AI coding assistants helped with learning, writing and testing; every design decision and release is mine.

**Free forever. Open source. Built for every user.**
