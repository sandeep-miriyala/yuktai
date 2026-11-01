// Prints bundle sizes (raw and gzip) and fails if the core grows past budget.
import { readFileSync, readdirSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist")
const BUDGET_GZ = 150 * 1024
let fail = false
for (const f of readdirSync(dist).filter((f) => /\.(c?js)$/.test(f))) {
  const buf = readFileSync(join(dist, f))
  const gz = gzipSync(buf).length
  const flag = f === "ask-page.global.js" && gz > BUDGET_GZ ? "  ← over budget" : ""
  if (flag) fail = true
  console.log(`${f.padEnd(26)} ${(buf.length / 1024).toFixed(1).padStart(7)} KB  gzip ${(gz / 1024).toFixed(1).padStart(6)} KB${flag}`)
}
if (fail) process.exit(1)
