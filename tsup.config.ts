import { defineConfig } from "tsup";

export default defineConfig([
  {
    // @yuktishaalaa/yuktai/experience and /ui: client components, marked "use client"
    // so a Next.js Server Component (layout.tsx) can render them directly.
    entry:     { experience: "src/experience/index.ts", ui: "src/ui/index.ts" },
    format:    ["esm", "cjs"],
    dts:       false,
    minify:    true,
    splitting: false,
    external:  ["react", "react-dom"],
    platform:  "browser",
    banner:    { js: '"use client";' },
  },
  {
    // index: everything · icons: @yuktishaalaa/yuktai/icons (no hooks, no
    // browser globals, so it works in Next.js Server Components too)
    entry:    { index: "src/index.ts", icons: "src/icons/index.ts", head: "src/experience/head.ts" },
    format:   ["esm", "cjs"],
    dts:      false, // .d.ts files come from TypeScript 7: npm run build:types
    clean:    true,
    minify:   true,
    external: [
      "react",
      "react-dom",
      // ── Exclude all Transformers.js related packages ──
      // These are browser-loaded dynamically — must NOT be bundled
      "@huggingface/transformers",
      "onnxruntime-node",
      "onnxruntime-web",
      "onnxruntime-common",
    ],
    // ── Ensure browser-compatible build ──
    platform: "browser",
    esbuildOptions(options) {
      options.define = {
        "process.env.NODE_ENV": '"production"',
        "process": '{"env":{"NODE_ENV":"production"}}',
      }
    },
  },
  {
    entry:      ["src/core/renderer.tsx"],
    format:     ["iife"],
    globalName: "YuktAI",
    outDir:     "dist",
    minify:     true,
    dts:        false,
    platform:   "browser",
    outExtension: () => ({ js: ".global.js" }),
    external: [
      "@huggingface/transformers",
      "onnxruntime-node",
      "onnxruntime-web",
      "onnxruntime-common",
    ],
    esbuildOptions(options) {
      options.define = {
        "process.env.NODE_ENV": '"production"',
        "process": '{"env":{"NODE_ENV":"production"}}',
      }
    },
  },
])