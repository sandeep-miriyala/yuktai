// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page
// Ask any web page. Answers come from the page itself, with the source
// highlighted. Search runs in Rust/WebAssembly; answers use on-device AI
// when the browser has it. Page text and questions never leave the device.
//
//   import { mountAskPage } from "@yuktishaalaa/ask-page"
//   mountAskPage({ modes: ["fast", "balanced"] })
//
// Or headless:
//   const page = new AskPage(); const answer = await page.ask("How do I install it?")
// ─────────────────────────────────────────────────────────────────────────────

export { AskPage, MIN_COSINE, MIN_COVERAGE } from "./controller"
export type { AskCallbacks, AskPageOptions, AskState } from "./controller"
export { YuktaiAskElement, defineAskPage, mountAskPage } from "./ui/AskPanel"
export { registerAskTools, askTools } from "./webmcp"
export { readPage, readBlocks, findRoot } from "./reader/pageReader"
export { isPrivate, looksSensitive, describeField, NEVER_READ } from "./reader/privacyFilter"
export { chunk } from "./reader/chunker"
export { matchShortcut } from "./insights/shortcuts"
export { a11yIssues } from "./insights/pageInsights"
export { detectPageType, pageContext } from "./questions/pageType"
export { buildSuggestions } from "./questions/engine"
export { RULES, GENERAL } from "./questions/rules"
export { createSearchEngine, MODE_HYBRID, MODE_KEYWORD, MODE_VECTOR } from "./search/engine"
export { ASK_CORE_WASM_BASE64, ASK_CORE_WASM_SIZE } from "./search/askCoreWasm"
export { buildMessages, NOT_IN_PAGE } from "./answer/prompt"
export { chromePromptProvider } from "./answer/chromeAI"
export { webllmProvider } from "./answer/webllm"
export type { AnswerProvider } from "./answer/provider"
export { resolveConfig, DEFAULT_SETTINGS, VERSION } from "./config"
export { renderMarkdown } from "./ui/markdown"
export * from "./types"
