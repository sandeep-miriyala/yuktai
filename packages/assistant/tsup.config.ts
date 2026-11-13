import { defineConfig } from "tsup"

export default defineConfig([
  {
    // npm: ESM + CJS. a11y and ask-page stay dependencies (not bundled).
    entry: { index: "src/index.ts", next: "src/next.tsx" },
    format: ["esm", "cjs"],
    dts: false,
    clean: true,
    minify: true,
    platform: "browser",
    target: "es2022",
    external: ["react", "@yuktishaalaa/a11y", "@yuktishaalaa/ask-page", "@yuktishaalaa/assistant"],
  },
  {
    // <script src=".../assistant.global.js">: everything in one file
    entry: { assistant: "src/global.ts" },
    format: ["iife"],
    globalName: "YuktaiAssistantBundle",
    minify: true,
    platform: "browser",
    target: "es2022",
    noExternal: [/.*/],
    outExtension: () => ({ js: ".global.js" }),
  },
])
