# Rust RAG core (WebAssembly)

**Source:** `src/agentic/rust/ragEngine.ts, src/agentic/rust/ragCoreWasm.ts`  
**Package after the split:** `@yuktishaalaa/ask-page`

A small Rust search core compiled to WebAssembly (about 33 KB, embedded as base64) that scores passages faster than TypeScript on long pages.

## Exports

| Export | What it does |
| --- | --- |
| `RAG_AUTO_MIN_PASSAGES` | 1,000: in `auto` mode, Rust is used from this many passages. |
| `wantsRustRag(engine, passages)` | Decides whether to use Rust. |
| `loadRagCore() / getLoadedRagCore()` | Compiles the module once per page; null without WebAssembly. |
| `RagCore.create / build / search` | One index per instance: `build` the tokenized passages, `search` with term weights. |
| `RAG_CORE_WASM_BASE64 / RAG_CORE_WASM_SIZE` | The embedded module and its size. |

## How it works

TypeScript tokenizes and computes the term weights; Rust stores the passages and returns the top `k` hits. Any failure returns null and TypeScript takes over.

## Notes and findings

- Embedded as base64, so it works offline and needs no extra file. Check that a strict Content-Security-Policy (`wasm-unsafe-eval`) does not block it; the fallback covers that case.
- Keep the Rust source (crate) in the monorepo next to the package, with its own build step and tests.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] Same results from Rust and TypeScript (a parity test)
- [ ] Rust crate builds in CI
