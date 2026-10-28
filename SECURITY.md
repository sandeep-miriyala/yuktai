# Security Policy

YuktAI runs entirely in the browser: no servers, no API keys, no telemetry. Page and grid data never leave the device unless your app adds its own `generate` or `summarize` hook.

## Supported versions

| Version | Supported |
|---|---|
| 5.3.x | ✅ Current (React, Next.js, plain HTML, Rust engine) |
| 5.2.x | ⚠️ Security fixes only; please upgrade |
| 5.1.x and older | ❌ Not supported |

Fixes ship as patch releases on [GitHub releases](https://github.com/sandeepmiriyala03/yuktai/releases). The CDN link `@5` always follows npm.

## Report a vulnerability

**Please don't open a public issue.** Report privately:

1. Go to the [Security tab](https://github.com/sandeepmiriyala03/yuktai/security) → **Report a vulnerability**.
2. Include the version, the module, steps to reproduce (a small HTML page is ideal), the impact, and your name if you'd like credit.

## What to expect

| Step | Time |
|---|---|
| Acknowledgement | 3 working days |
| Accepted or declined, with reasons | 7 days |
| Fix for critical and high issues | Target 30 days |
| Fix for medium and low issues | Next release |

Accepted reports get a patch release, a GitHub security advisory and credit (unless you prefer not to be named). YuktAI is maintained by one person in free time; critical issues always come first.

## Scope

**In scope**
- Script injection (XSS) through grid data, `render` output, search text, assistant answers or page tools
- Data leaving the device without the app asking for it
- CSV export that runs formulas in spreadsheets
- Auto-fixes that hide content from assistive technology or break a page
- WebMCP tools doing more than the grid allows
- The Rust/WebAssembly engines: crashes or results that differ from TypeScript
- The plain HTML build, PWA files and service worker

**Out of scope**
- Bugs in browsers, Chrome's built-in AI, Transformers.js or third-party models
- Problems caused by your own app's code
- Missing security headers on demo sites
- Slowdowns from loading very large data into the client-side grid (use server paging for 100K+ rows)

## Built-in protections

- Grid values are always shown as text, never as HTML.
- CSV export neutralises cells starting with `=`, `+`, `-` or `@`.
- The Rust engines run in the WebAssembly sandbox and are embedded in the package: no downloads, no network, no `eval`. Sites with a Content Security Policy need `'wasm-unsafe-eval'`; otherwise YuktAI falls back to TypeScript.
- Grid tools validate inputs and never throw.
- Page tools never audit or change their own UI.
- Every copilot fix can be undone.
- Only accessibility preferences are stored, in `localStorage`.

Thank you for helping keep YuktAI and its users safe. 🙏
