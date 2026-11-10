# YuktAI site

Docs, live demos and guides for [YuktAI](https://www.npmjs.com/package/@yuktishaalaa/yuktai) and
[Ask page](https://www.npmjs.com/package/@yuktishaalaa/ask-page), at **https://sandeep-miriyala.github.io/yuktai/**.
It replaces yuktaidocs.netlify.app and the old one-page home.

Made with YuktAI itself (`yuktai build`): Next.js static export + Rust → WebAssembly (`rust/`).

## How it is published

`.github/workflows/site.yml` (repository root) on every push to `main`:

1. builds the library and the plain HTML bundle from that commit and runs the library tests;
2. runs the browser end-to-end tests of every feature (`vanilla/test/e2e.mjs`);
3. installs **that commit's** packages here (not the copies on npm), so every demo shows the code in `main`;
4. builds this site under `/yuktai`, runs `npm test`, adds the static demos (`/vanilla/`, `/ask-page/`);
5. opens every page in Chromium: no errors, no broken links, no serious axe-core problems (`scripts/site-e2e.mjs`);
6. publishes to GitHub Pages, only when all of that passed.

Setup once: **Settings → Pages → Source: GitHub Actions**.

## Work on it locally

```
npm install
npm run dev      # http://localhost:3000 (no base path locally)
npm run build    # Rust → WASM, then static files in out/
npm test         # checks the built site
```

| Path | What |
|---|---|
| `yuktai.config.ts` | Name, colours, features |
| `src/data/site.ts` | Versions, numbers, menu, guides. Change a release here. |
| `src/app/page.tsx` | Home page |
| `src/app/(guides)/<name>/page.tsx` | The 14 guides (`/guide/`, `/create/`, `/grid/`, …) |
| `src/app/about/page.tsx` | How this site is built (TanStack Table + Query) |
| `src/components/yuktai/` | Header, widget, Ask, install, theme |
| `src/lib/docs/pages/<name>.ts` | The live demo on each guide |
| `rust/src/lib.rs` | The site's Rust core (word count, live check on About) |
| `src/styles/` | `tokens.css` (colours), `globals.css`, `guides.css` |
| `src/lib/base.ts` | The `/yuktai` base path for images, the manifest and the service worker |
| `public/diagrams/` | The four "How it works" diagrams |

Icons everywhere come from `@yuktishaalaa/yuktai/icons`.
