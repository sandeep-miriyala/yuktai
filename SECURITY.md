# Security Policy

Thank you for helping keep YuktAI and the people who use it safe. 🙏

## How YuktAI handles data

| Part | Where it runs | What leaves the device |
|---|---|---|
| **Library** (`@yuktishaalaa/yuktai`) | In the visitor's browser | Nothing. No server, no API keys, no telemetry. Data leaves only if your app adds its own `generate` or `summarize` hook. |
| **`yuktai` CLI and `create-yuktai`** | On the developer's computer | Nothing, apart from the normal `npm install` and `pip install`. |
| **Generated app, Python API and agents** (optional) | On your own server or computer | Nothing by default ("free mode"). If **you** add a Groq key, agent questions are sent to Groq. |

YuktAI never reads what people type into password fields, and never collects anyone's personal data.

## Supported versions

| Package | Version | Supported |
|---|---|---|
| `@yuktishaalaa/yuktai` | 5.5.x | ✅ Current |
| | 5.4.x | ⚠️ Security fixes only; please upgrade |
| | 5.3.x and older | ❌ Not supported |
| `yuktai` (CLI) | 1.3.x | ✅ Current |
| `create-yuktai` | 1.x | ✅ Current |
| `@yuktishaalaa/ask-page` | 1.x | ✅ Current |

Fixes ship as patch releases on npm and [GitHub Releases](https://github.com/sandeep-miriyala/yuktai/releases). The CDN link `@5` always follows npm.

## Report a vulnerability

**Please don't open a public issue.** Report privately:

1. Go to the [Security tab](https://github.com/sandeep-miriyala/yuktai/security) → **Report a vulnerability**.
2. Include:
   - the package and version
   - the part affected (grid, page tools, CLI, Python API, an agent…)
   - steps to reproduce (a small HTML page or a fresh `npm create yuktai` app is ideal)
   - the impact
   - your name, if you'd like credit

## What to expect

| Step | Time |
|---|---|
| Acknowledgement | 3 working days |
| Accepted or declined, with reasons | 7 days |
| Fix for critical and high issues | Target 30 days |
| Fix for medium and low issues | Next release |

Accepted reports get a patch release, a GitHub security advisory and credit (unless you prefer not to be named). YuktAI is maintained by one person in free time; critical issues always come first.

## Scope

**In scope: library**
- Script injection (XSS) through grid data, `render` output, search text, assistant answers or page tools
- Data leaving the device without the app asking for it
- CSV export that runs formulas in spreadsheets
- Auto-fixes that hide content from assistive technology or break a page
- WebMCP tools doing more than the grid allows
- The Rust/WebAssembly engines: crashes, or results that differ from TypeScript
- The plain HTML build, PWA files and service worker

**In scope: CLI and generated apps**
- `yuktai init` or `npm create yuktai` writing files outside the new app's folder
- A generated app that exposes secrets (such as `GROQ_API_KEY`) to the browser or commits them to git
- The YuktAI Assistant writing or overwriting files without asking
- The Testing Agent running commands outside its allowlist
- Developer agents (Testing Agent, YuktAI Assistant) still reachable when `YUKTAI_ENV=production`
- Agents changing data when they are documented as read-only

**Out of scope**
- Bugs in browsers, Chrome's built-in AI, Transformers.js, Groq or other third-party models and services
- Problems caused by your own app's code, or by changes you made to the generated templates
- Your own server, database and hosting setup (generated apps are a starting point; review them before going live)
- Missing security headers on demo sites
- Slowdowns from loading very large data into the browser grid (use server paging for very large tables)

## Built-in protections

**Library**
- Grid values are always shown as text, never as HTML.
- CSV export neutralises cells starting with `=`, `+`, `-` or `@`.
- The Rust engines run in the WebAssembly sandbox and are embedded in the package: no downloads, no network, no `eval`. Sites with a Content Security Policy need `'wasm-unsafe-eval'`; otherwise YuktAI falls back to TypeScript.
- Grid tools validate inputs and never throw.
- Page tools never audit or change their own UI.
- Every copilot fix can be undone.
- Only preferences are stored in the browser: accessibility settings, language and animation choice (`localStorage`), and whether the loading screen was shown (`sessionStorage`).

**Generated apps**
- API keys live only in `backend/.env` on the server. `.env` is in `.gitignore` and is never sent to the browser.
- Without a key, agents run in free mode: nothing leaves your computer.
- The Grid Agent's tools are read-only.
- The YuktAI Assistant shows every file first, asks before writing, and never overwrites an existing file.
- The Testing Agent can only run its fixed list of checks (lint, site test, API tests, browser tests).
- `YUKTAI_ENV=production` turns the developer agents off.
- The API accepts browser requests only from `localhost` and the addresses in `ALLOWED_ORIGINS` (`backend/.env`). Set your real site's address there before going live.

Thank you for helping keep YuktAI and its users safe. 🙏