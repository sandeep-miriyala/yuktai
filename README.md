<p align="center">
  <a href="https://yuktaidocs.netlify.app/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sandeep-miriyala/yuktai/main/brand/yuktai-logo-dark.png">
      <img src="https://raw.githubusercontent.com/sandeep-miriyala/yuktai/main/brand/yuktai-logo-light.png" alt="YuktAI" width="420">
    </picture>
  </a>
</p>

<p align="center">
  <strong>Accessible data grids and accessibility tools for Next.js, React and plain HTML.</strong><br>
  Rust speed. Indian languages. One command.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@yuktishaalaa/yuktai"><img src="https://img.shields.io/npm/v/@yuktishaalaa/yuktai" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@yuktishaalaa/yuktai"><img src="https://img.shields.io/npm/dm/@yuktishaalaa/yuktai" alt="npm downloads"></a>
  <a href="https://github.com/sandeep-miriyala/yuktai/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="License: GPL-3.0"></a>
  <a href="https://yuktaidocs.netlify.app/"><img src="https://img.shields.io/badge/docs-live%20demos-0038b4" alt="Docs"></a>
</p>

<p align="center">
  <a href="https://yuktaidocs.netlify.app/">Documentation</a> ·
  <a href="https://yuktaidocs.netlify.app/create/">Create an app</a> ·
  <a href="https://yuktaidocs.netlify.app/grid/">Demos</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

---

## Quick start

```bash
npm install @yuktishaalaa/yuktai
```

```tsx
"use client"
import { YuktaiGrid } from "@yuktishaalaa/yuktai"

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "city", label: "City" },
  { key: "amount", label: "Amount", type: "number", sortable: true },
]

export default function Orders({ rows }) {
  return <YuktaiGrid data={rows} columns={columns} rowKey="id" search pagination={{ pageSize: 25 }} />
}
```

That's it. Search, sort, pages, keyboard navigation and phone cards work out of the box.

**No build step?** Use one script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.5.3/vanilla/index.min.js"></script>
<script>yuktai.renderGrid("#orders", { data: rows, columns })</script>
```

**Starting a new app?** One command gives you a ready Next.js app:

```bash
npx yuktai@latest init my-app --yes
cd my-app
npm run dev
```

Only Node.js 18+ is needed. Rust and Python are optional extras.

## Why YuktAI?

- **Fast** – search and sort run in Rust (WebAssembly). 10 lakh rows sort in under a second.
- **Accessible** – WCAG 2.2 checks, keyboard support and screen-reader labels built in.
- **Indian languages** – Indian number format (10,00,000), correct sorting for Telugu and other scripts, voice input in 22 Indian languages.
- **Works anywhere** – Next.js, React, plain HTML and jQuery.
- **Free** – GPL-3.0, free forever.

## What's inside

| | |
|---|---|
| 📊 **Data grid** | Search, sort, filter, pages or one scrolling list, selection, CSV export, themes |
| ♿ **Accessibility** | Contrast, text size, dyslexia font, colour-blind filters, WCAG audit |
| 💬 **Ask this page** | Answers questions from your page content |
| 🎨 **163 icons** | Any size and colour, safe in Server Components |

Optional, when you need them: a grid assistant that understands plain words, a loading screen, and a Python API with agents in apps made by `npx yuktai`. See the [docs](https://yuktaidocs.netlify.app/).

## Documentation

Everything else (grid options, styling, accessibility tools, jQuery, the CLI, agents) lives in the docs:

**https://yuktaidocs.netlify.app/**

## Packages

| Package | |
|---|---|
| [`@yuktishaalaa/yuktai`](https://www.npmjs.com/package/@yuktishaalaa/yuktai) | This library |
| [`yuktai`](https://www.npmjs.com/package/yuktai) | Create a new app in one command |
| [`@yuktishaalaa/ask-page`](https://www.npmjs.com/package/@yuktishaalaa/ask-page) | "Ask this page" side panel |

## Compatibility

Next.js 13–16 · React 17–19 · Node 18+ · All modern browsers · jQuery 1.12–4.0

## Contributing

Issues and pull requests are welcome. Please read [SECURITY.md](SECURITY.md) before reporting a security problem.

## License

[GPL-3.0](LICENSE) © Sandeep Miriyala, Yuktishaalaa AI Lab
