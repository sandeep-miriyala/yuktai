import { defineConfig } from "tsup"

export default defineConfig([
  {
    // npm: ESM + CJS
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: false, // types come from tsc (npm run build:types)
    clean: true,
    minify: true,
    platform: "browser",
    target: "es2022",
  },
  {
    // <script src=".../a11y.global.js">: starts from data-yuktai-* attributes
    entry: { a11y: "src/global.ts" },
    format: ["iife"],
    globalName: "YuktaiA11yBundle",
    minify: true,
    platform: "browser",
    target: "es2022",
    outExtension: () => ({ js: ".global.js" }),
  },
])
