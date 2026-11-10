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
  <a href="https://github.com/sandeep-miriyala/yuktai/actions/workflows/ci.yml"><img src="https://github.com/sandeep-miriyala/yuktai/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
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
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.5.4/vanilla/index.min.js"></script>
<script>yuktai.renderGrid("#orders", { data: rows, columns })</script>
```

**Starting a new app?** One command gives you a ready Next.js app:

```bash
npm create yuktai@latest my-app
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

## How it works

<p align="center"><img src="https://raw.githubusercontent.com/sandeep-miriyala/yuktai/main/docs/diagrams/1-solution-overview.svg" alt="Four ways in: npm create, npm install, a CDN script or pip install. They lead to the yuktai CLI, the library and the PyPI package. The library uses three Rust engines." width="680"></p>

More diagrams (library modules, `npm run dev`, a new app) in [ARCHITECTURE.md](ARCHITECTURE.md).

## What's inside

| | |
|---|---|
| 📊 **Data grid** | Search, sort, filter, pages or one scrolling list, selection, CSV export, themes |
| ♿ **Accessibility** | Contrast, text size, dyslexia font, colour-blind filters, WCAG audit |
| 💬 **Ask this page** | Answers questions from your page content |
| 🎨 **163 icons** | Any size and colour, safe in Server Components |

Optional, when you need them: a grid assistant that understands plain words, a loading screen, and a Python API with agents in apps made by `npx yuktai`. See the [docs](https://yuktaidocs.netlify.app/).

### Ready for AI browsers (WebMCP)

Add `webmcp` and browser AI agents (Gemini in Chrome and others that speak [WebMCP](https://github.com/webmachinelearning/webmcp)) can search, count, filter and sort your grid through the same tools as the built-in assistant:

```tsx
<YuktaiGrid data={rows} columns={columns} rowKey="id" webmcp webmcpToken={process.env.NEXT_PUBLIC_WEBMCP_TOKEN} />
```

- Uses `document.modelContext.registerTool` (falls back to `navigator.modelContext` in older Chrome). Tools return JSON strings and are marked `readOnlyHint` / `untrustedContentHint`.
- Chrome 149–156 need an [origin trial](https://developer.chrome.com/origintrials) token for your site; pass it as `webmcpToken`. Without one, WebMCP works only where the browser already enables it.
- `onWebMCPStatusChange` reports the real state: `unsupported`, `registering`, `ready`, `partial` or `error`.
- Agents only get what the grid already shows. Nothing the visitor types is read or sent.

## Cheat sheet

### Create an app

| Command | |
|---|---|
| `npm create yuktai@latest my-app` | Create an app (asks a few questions) |
| `npm create yuktai@latest my-app -- --yes` | Create with the defaults |
| `npx yuktai@latest init my-app` | The same, with the `yuktai` command |
| `npx yuktai@latest init my-app --yes` | The same, with the defaults |

### `init` options

| Option | Values | Default |
|---|---|---|
| `--stack` | `next-rust` · `next` | `next-rust` |
| `--template` | `docs` · `starter` | `docs` |
| `--features` | `grid,page-tools,icons,backend` · `none` | all |
| `--host` | `none` · `netlify` · `github-pages` | `none` |
| `--accent` | `blue` · `violet` · `teal` · `orange` | `blue` |
| `--title "My App"` | Site title | |
| `--no-install` | Skip `npm install` | |
| `--no-git` | Skip `git init` | |
| `--yes`, `-y` | Defaults for anything not given | |

```bash
# smallest app: Next.js only, no Rust, no Python
npx yuktai@latest init simple --stack next --features none --yes
```

### Inside your app

| Command | |
|---|---|
| `npm run dev` | Site, Rust build and Python API together (http://localhost:3000) |
| `npx yuktai dev --no-api` | The same without the Python API |
| `npm run build` | Static files in `out/` |
| `npm run lint` | ESLint |
| `npm test` | Site tests |
| `npm run dev:api` | Python API only (http://localhost:8000/docs) |
| `npm run test:api` | API tests (pytest) |
| `npm run test:e2e` | Browser tests (Playwright). First time: `npx playwright install chromium` |
| `npm run agent:test` | Testing Agent: runs every check and explains what failed |
| `npm run assistant` | YuktAI Assistant: `add page contact`, `add api products` |

The last five come with the `backend` feature.

### Library imports

| Import | |
|---|---|
| `@yuktishaalaa/yuktai` | Grid, accessibility, page tools |
| `@yuktishaalaa/yuktai/icons` | 163 icons |
| `@yuktishaalaa/yuktai/experience` | Loading screen, language and animation picker |
| `@yuktishaalaa/yuktai/head` | Small scripts for `<head>` |

## Live demos

| Site | |
|---|---|
| [miriyalas.github.io/yuktai](https://miriyalas.github.io/yuktai/) | Made with no laptop: created, built and published from a browser with GitHub Codespaces |
| [పద్యాలవాల](https://sandeep-miriyala.github.io/padyalavala/) | Telugu poetry site: Rust search, Grid AI Assistant in Telugu, listen and share |
| [YuktaiDocs](https://yuktaidocs.netlify.app/) | Docs and playgrounds |
| [Plain HTML demo](https://sandeep-miriyala.github.io/yuktai/vanilla/) | No framework, one script |

**No laptop?** Open [GitHub Codespaces](https://github.com/codespaces) → Blank, run `npm create yuktai@latest my-app -- --yes`, push, then Settings → Pages → Source: GitHub Actions. [Step by step](https://yuktaidocs.netlify.app/create/#codespaces)

## Documentation

Everything else (grid options, styling, accessibility tools, jQuery, the CLI, agents) lives in the docs:

**https://yuktaidocs.netlify.app/**

## Packages

| Package | |
|---|---|
| [`@yuktishaalaa/yuktai`](https://www.npmjs.com/package/@yuktishaalaa/yuktai) | This library |
| [`yuktai`](https://www.npmjs.com/package/yuktai) | Create a new app in one command |
| [`create-yuktai`](https://www.npmjs.com/package/create-yuktai) | `npm create yuktai@latest` |
| [`@yuktishaalaa/ask-page`](https://www.npmjs.com/package/@yuktishaalaa/ask-page) | "Ask this page" side panel |

## Compatibility

Next.js 13–16 · React 17–19 · Node 18+ · All modern browsers · jQuery 1.12–4.0

## Contributing

Issues and pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the map in [ARCHITECTURE.md](ARCHITECTURE.md). Please follow the [Code of Conduct](CODE_OF_CONDUCT.md), and read [SECURITY.md](SECURITY.md) before reporting a security problem. What's coming: [ROADMAP.md](ROADMAP.md).

## License

[GPL-3.0](LICENSE) © Sandeep Miriyala, Yuktishaalaa AI Lab
