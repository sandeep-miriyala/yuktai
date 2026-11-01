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

Next.js (App Router): call `mountAskPage()` in a client component's `useEffect`.

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

- Unit tests (Vitest, 50) · Rust tests (cargo, 12) · browser tests (Playwright, 15) · axe: 0 violations
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

Needs `worker-src blob:` and `script-src 'wasm-unsafe-eval'` for the worker and Rust core. Without them it still works, on the page thread, in TypeScript.

GPL-3.0 · Part of [yuktai](https://github.com/sandeep-miriyala/yuktai) · Built in personal time by Sandeep Miriyala.
