// Builds the browser extension (Chrome, Edge, Brave) and its zip.
//   npm run build && npm run build:extension
// → dist/extension/ (Load unpacked) and dist/yuktai-assistant-chrome-edge-<version>.zip
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "dist", "extension")
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(join(root, "extension"), out, { recursive: true })
cpSync(join(root, "dist", "assistant.global.js"), join(out, "assistant.global.js"))
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const manifest = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"))
manifest.version = pkg.version
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
const zip = join(root, "dist", `yuktai-assistant-chrome-edge-${pkg.version}.zip`)
rmSync(zip, { force: true })
try {
  execFileSync("zip", ["-qr", zip, "."], { cwd: out })
  console.log(`extension ${pkg.version}: ${out}\nzip: ${zip}`)
} catch {
  console.log(`extension ${pkg.version}: ${out}\n(no zip tool found: zip the folder by hand)`)
}
