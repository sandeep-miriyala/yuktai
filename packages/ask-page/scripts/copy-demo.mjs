// Copies the one-file browser build next to the demo page (repo root
// /ask-page/), which GitHub Pages serves at /yuktai/ask-page/.
import { copyFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const from = join(here, "..", "dist", "ask-page.global.js")
const to = join(here, "..", "..", "..", "ask-page", "ask-page.global.js")
copyFileSync(from, to)
console.log(`demo: ${to}`)
