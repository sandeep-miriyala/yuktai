# @yuktishaalaa/yuktai

> Accessibility, AI and data toolkit for **Next.js, React and plain HTML**. One install or one script tag. Runs in the browser: no API keys, no server, no cost, works offline.

[![npm](https://img.shields.io/npm/v/@yuktishaalaa/yuktai)](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
[![downloads](https://img.shields.io/npm/dm/@yuktishaalaa/yuktai)](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
[![license](https://img.shields.io/badge/license-GPL--3.0-blue)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-13%2B-black)](https://nextjs.org)
[![Rust](https://img.shields.io/badge/engine-Rust%20%2B%20WebAssembly-orange)](./rust)
[![docs](https://img.shields.io/badge/docs-live%20demos-0a4a85)](https://yuktaidocs.netlify.app/)
[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/sandeepmiriyala03/badge.svg)](https://hub.xerj.org/contributors/sandeepmiriyala03)

📖 **Docs and live demos:** https://yuktaidocs.netlify.app/

Built in free time by [Sandeep Miriyala](https://github.com/sandeepmiriyala03).

---

## Features

| | Feature | What it does |
|---|---|---|
| ♿ | **Accessibility** | WCAG 2.2 auto-fix, contrast, dark mode, text size, dyslexia font, colour-blind filters, speak on focus |
| 📊 | **YuktaiGrid** | Search, sort, pages, CSV export, 5 WCAG themes, Telugu UI, keyboard navigation |
| 🤖 | **Ask your data** | "salary over 1 lakh in Hyderabad", BI answers, unusual rows, multi-step tasks, WebMCP |
| 💬 | **Ask page (RAG)** | Answers from your page and data, offline. New standalone package: [`@yuktishaalaa/ask-page`](./packages/ask-page) with a side panel, highlighted sources, Telugu, embeddings and Chrome built-in AI ([live demo](https://sandeep-miriyala.github.io/yuktai/ask-page/)) |
| 🛠 | **Page tools** | QA audit (15 WCAG checks), form and design review, voice commands. In React/Next.js: `showPageTools` |
| 🦀 | **Rust engine** | Up to 42× faster search on big data. The default since 5.3.11 |
| 🎨 | **163 icons** | Any size and colour, outline or filled, safe in Server Components |
| ⚡ | **Vibe Coder** | Plain English → a full Next.js project ZIP (developer tool) |
| 📱 | **PWA** | Installable, works offline |

## Supported languages

**Use it with:** HTML · JavaScript · TypeScript · React (JSX) · Next.js (TSX)
**Built with:** TypeScript 7 + Rust (WebAssembly, embedded; no setup needed)
**Interface:** English and Telugu. All 22 Indian languages for number and date formats, sorting and voice input.

---

## Quick start

**Plain HTML:** one line, no build step

```html
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.3.12/vanilla/index.min.js"></script>
<script>
  yuktai.renderGrid("#staff", { data: rows, columns, engine: "auto", showSearchTime: true })
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

**Grid and icons**

```tsx
import { YuktaiGrid } from "@yuktishaalaa/yuktai"
import { SearchIcon } from "@yuktishaalaa/yuktai/icons"

<YuktaiGrid data={rows} columns={columns} rowKey="id" engine="auto" showSearchTime />
<SearchIcon size={24} color="#0a4a85" label="Search" />
```

More examples for every feature: **https://yuktaidocs.netlify.app/**

### Wrapper buttons

| Prop | Button |
|---|---|
| `launcher` | ✨ One button that shows or hides the others |
| `showAccessibility` | ♿ Accessibility |
| `showRag` | 💬 Ask page |
| `showAgent` | 🤖 AI agent |
| `showVibeCoder` | ⚡ Vibe Coder (keep it off on public sites) |
| `engine` | Ask page search: `"ts"`, `"rust"` or `"auto"` |

---

## Rust engine (default)

Since 5.3.11 the grid and page search use Rust by default. Results are identical to TypeScript, proven by tests, only faster. If WebAssembly is unavailable or blocked by a Content Security Policy, they fall back to TypeScript. Set `engine="ts"` to keep TypeScript only, or `"auto"` for Rust from 10,000 rows. The 💬 button uses Rust page search when you set `engine`.

| Task | TypeScript | Rust | Speed-up |
|---|---|---|---|
| Grid search, 1 lakh rows | 342 ms | 9 ms | 36× |
| Ask page, 5,000 passages | 18.8 ms | 0.45 ms | 42× |

---

## Live demos

- 📖 Docs and playgrounds: https://yuktaidocs.netlify.app/
- Staff directory (Next.js): https://aksharatantra.miriyala.in/staffdirectory
- Plain HTML PWA: https://sandeepmiriyala03.github.io/yuktai/vanilla/
- Ask page panel: https://sandeep-miriyala.github.io/yuktai/ask-page/
- Ratnalabala, a Telugu poetry app: https://ratnalabala.vercel.app/poems?view=grid

## Compatibility

Next.js 13–16 · React 17–19 (19 needs `--legacy-peer-deps`) · Node 18+ · Chrome, Edge, Firefox, Safari, Samsung Internet

## Honest limits

- Grid questions use rules, not a language model; unusual phrasing may need rewording.
- The built-in 💬 button uses keyword search (BM25). The [`@yuktishaalaa/ask-page`](./packages/ask-page) package adds meaning search (multilingual embeddings) in Balanced mode.
- Telugu and Hindi data questions need `customRules` for now.
- Automatic checks don't replace testing with real users and screen readers.

## Roadmap

- **Next:** more Rust (filters, BI, typo-tolerant search, Telugu typed in English letters), Hindi voice commands
- **Done:** semantic RAG with hybrid search, in [`@yuktishaalaa/ask-page`](./packages/ask-page)
- **Later:** a Python package, Angular/Vue and .NET support, more Indian-language interfaces

---

**Recognition:** part of the [XERJ Corpus Hub](https://hub.xerj.org) · [contributor profile](https://hub.xerj.org/contributors/sandeepmiriyala03)

**Contributing:** issues and PRs welcome at [GitHub](https://github.com/sandeepmiriyala03/yuktai). Security: [SECURITY.md](./SECURITY.md)

**License:** GPL-3.0 © Sandeep Miriyala, Yuktishaalaa AI Lab. AI coding assistants helped with learning, writing and testing; every design decision and release is mine.

**Free forever. Open source. Built for every user.**
