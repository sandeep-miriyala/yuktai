// Builds vanilla/index.js (readable) and vanilla/index.min.js from vanilla/src.
// The core logic is bundled from ../src, so it is the same code as the npm package.
//
//   npx esbuild@0.24 --version   (any esbuild ≥ 0.19 works)
//   node vanilla/build.mjs

import { build } from "esbuild"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const banner = `/*! yuktai vanilla 5.3.8 — accessible data grid, page agents and WCAG tools for plain HTML.
 *  No framework, no API keys, runs in the browser. ISC © Sandeep Miriyala, Yuktishaalaa AI Lab.
 *  Built from github.com/sandeepmiriyala03/yuktai (vanilla/src + src/agentic, src/grid, src/core; Rust engines: rust/grid-core, rust/rag-core). */`

const common = {
  entryPoints: [join(here, "src/index.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome90", "firefox90", "safari15", "edge90"],
  external: ["@huggingface/transformers", "onnxruntime-node", "onnxruntime-web", "onnxruntime-common"],
  define: { "process.env.NODE_ENV": '"production"' },
  banner: { js: banner },
  legalComments: "none",
  logLevel: "info",
}

await build({ ...common, outfile: join(here, "index.js") })
await build({ ...common, outfile: join(here, "index.min.js"), minify: true })
