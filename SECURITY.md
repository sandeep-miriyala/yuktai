# Security Policy

yuktai runs entirely in the browser. It has no servers, no API keys and no telemetry, and it never sends page or grid data anywhere unless your app passes its own `generate` or `summarize` hook. Even so, a bug in a client-side library can harm your users, so security reports are taken seriously.

## Supported versions

| Version | Supported | Notes |
|---|---|---|
| 5.3.x | ✅ | Current release: React, Next.js and the vanilla JS build |
| 5.2.x | ✅ | Security fixes only. Please upgrade to 5.3 |
| 5.1.x and older | ❌ | Not supported. Upgrade to 5.3 |

Security fixes are released as patch versions (for example 5.3.1) and listed on the [GitHub releases page](https://github.com/sandeepmiriyala03/yuktai/releases). The CDN build always follows npm:
`https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5/vanilla/index.min.js`

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub:

1. Open the [Security tab](https://github.com/sandeepmiriyala03/yuktai/security) of this repository.
2. Click **Report a vulnerability**.
3. Include:
   - the affected version and module (grid, accessibility engine, agents, RAG, Vibe Coder or the vanilla build)
   - steps to reproduce, or a small HTML page that shows the problem
   - the impact you expect (for example script injection, data exposure, or a page that stops working)
   - your name or handle, if you would like credit

## What to expect

| Step | Timeline |
|---|---|
| Acknowledgement of your report | Within 3 working days |
| First assessment (accepted or declined, with reasons) | Within 7 days |
| Progress updates | At least every 7 days until it is resolved |
| Fix for critical and high issues | Target within 30 days |
| Fix for medium and low issues | Next planned release |

**If the report is accepted:**
- I will confirm the problem, agree on a disclosure date with you, and prepare a fix.
- The fix ships as a patch release with a GitHub security advisory.
- You will be credited in the advisory unless you ask not to be.

**If the report is declined:** I will explain why, for example if the behaviour is expected or outside the scope below. You are welcome to disagree and send more detail.

yuktai is maintained in free time by one person, so please allow for these timelines. Critical issues are always handled first.

## Scope

**In scope**
- Script injection (XSS) through grid data, column `render` output, search text, assistant answers or page tools
- Data leaving the device without the app asking for it
- CSV export that can run formulas in spreadsheet apps
- Accessibility auto-fixes that make a page unusable or hide content from assistive technology
- WebMCP tools that do more than the grid allows
- The vanilla build, its demo page, PWA files and service worker

**Out of scope**
- Bugs in browsers, Chrome's built-in AI, Transformers.js or model files downloaded from third parties
- Problems in apps built with yuktai that come from that app's own code
- Missing security headers on the demo sites
- Denial of service by loading very large datasets into the client-side grid (use server paging for 100K+ rows)

## Built-in protections

- All grid values are shown as text, never as HTML. Custom `render` functions return text or DOM nodes.
- CSV export prefixes cells that start with `=`, `+`, `-` or `@`, so spreadsheets do not run them as formulas.
- Grid tools never throw, check required inputs, and only exist when the grid can really perform them.
- The page tools never audit or change their own UI (`data-yuktai-panel`).
- Every change the accessibility copilot makes can be undone.
- Nothing is stored except accessibility preferences, in the browser's `localStorage`.

Thank you for helping keep yuktai and its users safe.