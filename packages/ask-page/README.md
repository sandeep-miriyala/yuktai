# @yuktishaalaa/ask-page

> Ask any web page. A side panel that answers from the page itself and highlights where each answer came from. Search runs in Rust compiled to WebAssembly; answers use on-device AI when the browser has it. Page text and questions never leave the device.

**Live demo:** https://sandeep-miriyala.github.io/yuktai/ask-page/

- 🔒 **Private by design.** Never reads what visitors type (values, passwords, editors). No server, no API key, no analytics on questions, no tracing.
- 📍 **Every answer shows its source**, highlighted on the page.
- 🙅 **Says "this page doesn't answer that"** instead of guessing.
- 🇮🇳 **Telugu, Hindi and English**: Telugu-aware tokenizer, multilingual embeddings, Telugu interface.
- ♿ **Accessible**: 17–18 px text with A−/A+, 44 px targets, keyboard and screen reader support, dark/light, high contrast. axe: 0 violations.
- 🤖 **Agent-ready**: read-only WebMCP tools for browser agents.

## Install

```bash
npm install @yuktishaalaa/ask-page
```

```ts
import { mountAskPage } from "@yuktishaalaa/ask-page"

mountAskPage({
  modes: ["fast", "balanced"],                       // what visitors may choose
  questions: [{ text: "How do I apply?", path: "/scheme" }],
})
```

No build step:

```html
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page/dist/ask-page.global.js" defer></script>
```

Configure it with `window.YuktaiAskConfig = { ... }` before the script, or `<yuktai-ask config='{"modes":["fast"]}'></yuktai-ask>`.

Next.js (App Router): see [Next.js](#nextjs) below.

## Try it on any site

**Bookmarklet.** Make a bookmark with this as its URL, then click it on any page:

```text
javascript:(function(){var el=document.querySelector("yuktai-ask");if(el&&el.toggle){el.toggle();return}var u="https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page@0.1.2/dist/ask-page.global.js",p=null,s=document.createElement("script"),no=function(){alert("This site blocks outside scripts (Content Security Policy). Use the \"Ask this page\" Chrome extension instead.")};try{p=window.trustedTypes&&trustedTypes.createPolicy("yuktai-ask-bookmarklet",{createScriptURL:function(x){return x}})}catch(e){}try{s.src=p?p.createScriptURL(u):u}catch(e){return no()}s.onload=function(){setTimeout(function(){var a=document.querySelector("yuktai-ask");a&&a.openPanel&&a.openPanel()},100)};s.onerror=no;document.body.appendChild(s)})();
```

Some sites block outside scripts with a Content Security Policy. The bookmarklet then says so.

**Chrome extension.** Works on those sites too, because the browser injects extension scripts past the page's CSP. `npm run build && npm run build:extension`, then `chrome://extensions` → Developer mode → **Load unpacked** → `dist/extension`. Click the toolbar button or press **Alt+Shift+A**. It only runs when you click it (`activeTab`), and collects nothing.

## Modes

| Mode | Search | Answer | Download |
|---|---|---|---|
| ⚡ Fast | Rust BM25 | Best sentences from the page, quoted | ~100 KB |
| ⚖️ Balanced | BM25 + multilingual embeddings, merged with RRF | Chrome built-in AI if ready, else quoted | ~118 MB once, after the visitor agrees |
| 🎯 Best | Same | Chrome built-in AI, else WebLLM (if you set `webllmUrl`) | More, once |

## How it works

```
question → shortcut ─┬─ page structure answers it (summary, forms, images, a11y) ──→ answer
                     └─ retrieve (Rust: BM25 [+ int8 vectors] → RRF)
                          → check (idf-weighted coverage, cosine) ─┬─ weak → "not on this page"
                                                                   └─ answer → cite + highlight
```

| Part | Tech |
|---|---|
| Panel | Web component, Shadow DOM |
| Reader + privacy filter | Live DOM walk (so sources can be highlighted), form values never read |
| Search core | Rust → WebAssembly (52 KB): Telugu-aware tokenizer, BM25, int8 vectors, RRF, confidence. TypeScript twin when WASM is blocked |
| Embeddings | Transformers.js v4 + `Xenova/multilingual-e5-small` (Balanced/Best) |
| Answers | Chrome Prompt API → WebLLM → quoted passage; Translator and Summarizer APIs |
| Flow | Five plain functions; the same functions as a LangGraph.js `StateGraph` in `@yuktishaalaa/ask-page/langgraph` |
| Threads | Web Worker (blob:, Comlink); page-thread fallback |
| Storage | OPFS → IndexedDB → memory; model in Cache Storage. Signed-in pages: memory only |
| Highlight | CSS Custom Highlight API, outline fallback |

## Options (`OwnerConfig`)

| Option | Default | |
|---|---|---|
| `modes` | all three | Modes visitors may pick |
| `defaults` | Fast, top 5, short answers | Starting settings |
| `questions` | none | Fixed questions (max 3 per page), `path` exact or `"/docs/*"` |
| `suggestions` | `"both"` | `"owner"`, `"dynamic"` or `"off"` |
| `suggestionCount` | 6 | 3–6 |
| `disabledPageTypes` | none | Turn off rules for page types |
| `allowPins` | true | Visitors pin their own questions |
| `cache` | true | Save vectors on the device (never on signed-in pages) |
| `root`, `exclude` | auto | What to read; extra selectors never to read |
| `transformersUrl`, `embeddingModel` | jsDelivr, multilingual-e5-small | Self-host if you prefer |
| `webllmUrl`, `webllmModel` | off | WebLLM for Best mode |
| `webmcp` | true | Register read-only tools for browser agents |
| `title`, `side`, `launcher` | | Panel look |

Mark anything private with `data-ask-private`.

<a id="nextjs"></a>Move the launcher away from other floating buttons with CSS: `yuktai-ask { --ask-launcher-bottom: 96px; --ask-launcher-x: 24px }`.

Next.js: the panel is a browser-only web component, so import it inside `useEffect` (a top-level import breaks server rendering):

```tsx
"use client"
import { useEffect } from "react"

export default function AskPageClient() {
  useEffect(() => {
    let el: HTMLElement | undefined
    import("@yuktishaalaa/ask-page").then(({ mountAskPage }) => { el = mountAskPage({ modes: ["fast", "balanced"] }) })
    return () => el?.remove()
  }, [])
  return null
}
```

## Headless

```ts
import { AskPage } from "@yuktishaalaa/ask-page"
const page = new AskPage()
const answer = await page.ask("How do I install it?")
answer.text; answer.sources // [{ ref: "Installation", excerpt, elements }]
```

LangChain / LangGraph:

```ts
import { askWithGraph, AskPageRetriever } from "@yuktishaalaa/ask-page/langgraph"
```

## Quality

- Unit tests (Vitest, 55) · Rust tests (cargo, 13) · browser tests (Playwright, 16 + 4 strict-CSP) · axe: 0 violations
- Eval set: 53 questions over 7 pages (English, Telugu, government, pricing, FAQ, course, data). Fast mode: **recall@5 95.7%, top-1 82.6%, correct refusals 100%** ([report](./eval/report.json))
- Core bundle: 74 KB gzip

```bash
npm test            # unit + eval
npm run build:demo  # build, copy to /ask-page
npm run test:e2e    # Chromium checks
cd ../../rust/ask-core && cargo test
```

## Honest limits

- Fast mode matches words; paraphrases ("money back" for "refund") need Balanced mode.
- Chrome's built-in AI writes English, Japanese and Spanish; Telugu answers go through the Translator API when Chrome has that pair, else stay in the page's language.
- Chrome's own model downloads are managed by Chrome; Ask page uses them only when already available.
- Quick accessibility checks are not a full audit.

## Content Security Policy

| Site rule | What Ask page does |
|---|---|
| No `worker-src blob:` | Search runs on the page thread |
| No `'wasm-unsafe-eval'` | TypeScript search instead of Rust/WASM (same results) |
| `require-trusted-types-for 'script'` | Uses its own `yuktai-ask` policy; if the site allows no policy, builds the panel element by element |
| `script-src` blocks the CDN | Self-host the file, or use the Chrome extension |

For the full speed, allow `worker-src blob:` and `script-src 'wasm-unsafe-eval'` (and `trusted-types yuktai-ask` if you list policies). Tested in Chromium on strict-CSP pages: `npm run test:csp`.

GPL-3.0 · Part of [yuktai](https://github.com/sandeep-miriyala/yuktai) · Built in personal time by Sandeep Miriyala.
