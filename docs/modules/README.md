# yuktai module reference: Ask page and tools

One page per source file: what it does, what it exports, where it goes after the package split, findings, and a checklist to tick off.

Written from the published package `@yuktishaalaa/yuktai@5.3.12`. Source paths are inferred from the build output; check them against `src/`.

## Fix first

| Priority | File | Finding | Status |
| --- | --- | --- | --- |
| 🔴 High | [core/ai/agent](core-ai-agent.md) | `getPageText()` read values typed into inputs, including password fields | ✅ Fixed (v5.4.0): values and editable regions are skipped |
| 🟠 Medium | [core/ai/transformers-rag](core-ai-transformers-rag.md) | Fallback embedding model was English-only (`all-MiniLM-L6-v2`) | ✅ Fixed: `Xenova/multilingual-e5-small` with `query:`/`passage:` prefixes. The generator (`flan-t5-small`) is still English |
| 🟠 Medium | [core/ai/promptOptions](core-ai-promptOptions.md) | Built-in AI languages set to English only | ✅ `promptLanguagesFor()` added: en/ja/es where Chrome supports them, English otherwise (Telugu via the Translator API) |
| 🟢 Quick win | [agentic/contextIndex](agentic-contextIndex.md) | Hits carry the section heading | ✅ Done in `@yuktishaalaa/ask-page`: sources shown and highlighted |

The new package [`packages/ask-page`](../../packages/ask-page) implements the flow below with its own Rust core (`rust/ask-core`).

## Files by package after the split

### `@yuktishaalaa/ask-page`

| File | Role |
| --- | --- |
| [core/ai/rag](core-ai-rag.md) | Ask page with Chrome built-in AI (main path) |
| [core/ai/transformers-rag](core-ai-transformers-rag.md) | Fallback with Transformers.js |
| [core/ai/agent](core-ai-agent.md) | Step-by-step page agent (read-only parts) |
| [core/ai/summarizer](core-ai-summarizer.md) | Page summary |
| [core/ai/promptOptions](core-ai-promptOptions.md) | Shared language options |
| [agentic/contextIndex](agentic-contextIndex.md) | Passage search, extractive answers |
| [agentic/rust/ragEngine](agentic-rust-ragEngine.md) | Rust/WebAssembly search core |
| [agentic/pageInsights](agentic-pageInsights.md) | Answers without a model: purpose, structure, forms, images |

### `@yuktishaalaa/a11y`

| File | Role |
| --- | --- |
| [agentic/a11yCopilot](agentic-a11yCopilot.md) | Scan, explain, fix, undo |
| [agentic/voiceA11yCommands](agentic-voiceA11yCommands.md) | Voice and typed accessibility commands |
| [core/ai/translator](core-ai-translator.md) | Translate the page in place |
| [core/ai/rewriter](core-ai-rewriter.md) | Plain-language rewriting |

### `@yuktishaalaa/grid` (experimental)

| File | Role |
| --- | --- |
| [grid/gridTools](grid-gridTools.md) | Grid tools for agents |
| [grid/YuktaiGridWebMCP](grid-YuktaiGridWebMCP.md) | Registers grid tools with WebMCP |
| [agentic/taskRunner](agentic-taskRunner.md) | Multi-step grid instructions |

## How Ask page should flow

1. **Shortcut:** `voiceA11yCommands` and `pageInsights` answer simple requests with no model.
2. **Search:** `contextIndex` (Rust core for long pages) finds the passages.
3. **Answer:** `rag` (Chrome built-in AI), else `transformers-rag`, else the best passage quoted.
4. **Show sources:** highlight `hits[].ref` / `targets` on the page.
5. **Tools:** read-only only (`scrollToSection`, `highlightField`, summary, accessibility check). Never form values.

## Privacy rule for every file

No value a user typed, no password and no form data may reach a model, a log or a network request. Page text, headings, labels and placeholders only.
