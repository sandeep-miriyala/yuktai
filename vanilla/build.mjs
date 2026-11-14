// Builds vanilla/index.js (readable) and vanilla/index.min.js from vanilla/src.
// The core logic is bundled from ../src, so it is the same code as the npm package.
//
//   npx esbuild@0.24 --version   (any esbuild ≥ 0.19 works)
//   node vanilla/build.mjs

import { build } from "esbuild"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const banner = `/*! yuktai vanilla 5.3.9 — accessible data grid, page agents and WCAG tools for plain HTML.
 *  No framework, no API keys, runs in the browser. ISC © Sandeep Miriyala, Yuktishaalaa AI Lab.
 *  Built from github.com/sandeep-miriyala/yuktai (vanilla/src + src/agentic, src/grid, src/core; Rust engines: rust/grid-core, rust/rag-core). */`

const common = {
  entryPoints: [join(here, "src/index.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome90", "firefox90", "safari15", "edge90"],
  external: ["@huggingface/transformers", "onnxruntime-node", "onnxruntime-web", "onnxruntime-common"],
  // v6: the shared accessibility engine is bundled from its source
  alias: { "@yuktishaalaa/a11y": join(here, "..", "packages", "a11y", "src", "index.ts") },
  define: { "process.env.NODE_ENV": '"production"' },
  banner: { js: banner },
  legalComments: "none",
  logLevel: "info",
}

await build({ ...common, outfile: join(here, "index.js") })
await build({ ...common, outfile: join(here, "index.min.js"), minify: true })

// The version shown in the demo, the offline cache name and the jQuery example
// come from package.json, so they never fall behind a release again.
{
  const { readFileSync: read, writeFileSync: write } = await import("node:fs")
  const version = JSON.parse(read(join(here, "..", "package.json"), "utf8")).version
  const stamp = (file, pairs) => {
    const before = read(file, "utf8")
    let after = before
    for (const [re, to] of pairs) after = after.replace(re, to)
    if (after !== before) write(file, after)
  }
  stamp(join(here, "index.html"), [
    [/plain HTML demo · v\d+\.\d+\.\d+/, `plain HTML demo · v${version}`],
    [/plain HTML build \d+\.\d+\.\d+/, `plain HTML build ${version}`],
  ])
  stamp(join(here, "sw.js"), [[/yuktai-vanilla-v\d+\.\d+\.\d+/, `yuktai-vanilla-v${version}`]])
  stamp(join(here, "..", "examples", "jquery", "index.html"), [[/@yuktishaalaa\/yuktai@\d+\.\d+\.\d+/g, `@yuktishaalaa/yuktai@${version}`]])
  console.log(`vanilla: stamped version ${version}`)
}
