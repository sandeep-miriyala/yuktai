// Builds the Chrome extension into dist/extension (load it with
// chrome://extensions → Developer mode → Load unpacked).
//   npm run build && npm run build:extension
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "dist", "extension")
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(join(root, "extension"), out, { recursive: true })
cpSync(join(root, "dist", "ask-page.global.js"), join(out, "ask-page.global.js"))
// keep the extension's version in step with the package
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const manifest = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"))
manifest.version = pkg.version
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
console.log(`extension ${pkg.version}: ${out}`)
