import { defineConfig } from "tsup"

export default defineConfig([
  {
    // npm: ESM + CJS, with types
    entry: { index: "src/index.ts", langgraph: "src/langgraph.ts" },
    format: ["esm", "cjs"],
    dts: false, // types come from TypeScript 7 (npm run build:types)
    clean: true,
    minify: true,
    splitting: false,
    sourcemap: false,
    platform: "browser",
    target: "es2022",
    external: ["@langchain/langgraph", "@langchain/langgraph/web", "@langchain/core", "@langchain/core/retrievers", "@langchain/core/documents"],
  },
  {
    // <script src=".../ask-page.global.js">: one file, registers <yuktai-ask>
    entry: { "ask-page": "src/global.ts" },
    format: ["iife"],
    globalName: "YuktaiAskBundle",
    minify: true,
    platform: "browser",
    target: "es2022",
    outExtension: () => ({ js: ".global.js" }),
  },
])
