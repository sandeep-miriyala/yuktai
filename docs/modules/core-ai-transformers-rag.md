# Ask page: Transformers.js fallback

**Source:** `src/core/ai/transformers-rag.ts`  
**Package after the split:** `@yuktishaalaa/ask-page`

Answers page questions with Transformers.js when Chrome's built-in AI is not available. Models run in the browser (WebGPU or WASM).

## Exports

| Export | What it does |
| --- | --- |
| `askPageWithTransformers(question)` | Same as `askPage`, using Transformers.js models. |
| `answerFromContext(question, context)` | Answers from text you pass in. |
| `isTransformersSupported()` | Whether this browser can run the models. |
| `getModelLoadStatus()` | `"idle" | "loading" | "ready"` for a loading indicator. |

## How it works

Loads two models on first use and caches them:

- `Xenova/all-MiniLM-L6-v2`: embeddings, to find the passages that match the question
- `Xenova/flan-t5-small`: writes the answer from those passages

On phones it uses smaller `q4` weights. Remote models only (`allowLocalModels = false`); the browser cache keeps them after the first download.

## Notes and findings

- **Both models are English-only.** Telugu pages and Telugu questions will not work well. Consider `multilingual-e5-small` for embeddings.
- `flan-t5-small` is very small; answers can be short or off. An extractive answer (the best passage, quoted) may be more reliable.
- Load the models only when the user presses Ask, never on page load.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] Swap to multilingual embeddings for Telugu
- [ ] Show download size and progress before loading models
