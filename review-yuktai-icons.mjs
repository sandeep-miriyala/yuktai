#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// review-yuktai-icons.mjs · check every icon that was switched to yuktai
//
// Makes icons-review.html: for each switched icon it shows the ORIGINAL icon
// (Material, Lucide, Feather or react-icons) next to the yuktai icon that
// replaced it, with the files that use it. Open it in the browser and look for
// any pair where the meaning does not match.
//
// Read-only: it changes nothing in the project.
//
// Run in the project's root folder (after use-yuktai-icons.mjs):
//   node review-yuktai-icons.mjs
// Or give the folder:
//   node review-yuktai-icons.mjs C:\Users\vanis\Github\AIHACK
// ─────────────────────────────────────────────────────────────────────────────

import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const ROOT = path.resolve(process.argv.slice(2).find((a) => !a.startsWith("--")) || ".")
if (!fs.existsSync(path.join(ROOT, "package.json"))) {
  console.error(`No package.json in ${ROOT}. Run this in the project's root folder.`)
  process.exit(1)
}
const req = createRequire(path.join(ROOT, "package.json"))
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", "build", "dist", ".vercel", ".turbo", "coverage", "public",
  "android", "ios", "gradle", ".gradle", "rust", "baml_client", "venv", ".venv", "rag-env", "__pycache__"])
const EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".mjs"])

// ── yuktai shapes ────────────────────────────────────────────────────────────
let ICON_PATHS
try { ICON_PATHS = req("@yuktishaalaa/yuktai/icons").ICON_PATHS } catch (e) {
  console.error("Could not load @yuktishaalaa/yuktai/icons. Run: npm install @yuktishaalaa/yuktai@5.3.2")
  process.exit(1)
}
const pkgDir = (name) => {
  // walk up from the project like Node does (some packages hide package.json from require)
  for (let d = ROOT; ; d = path.dirname(d)) {
    const p = path.join(d, "node_modules", name)
    if (fs.existsSync(path.join(p, "package.json"))) return p
    if (path.dirname(d) === d) return null
  }
}
const MUI_DIR = pkgDir("@mui/icons-material")
const LUCIDE_DIR = pkgDir("lucide-react")
const FEATHER_DIR = pkgDir("react-feather")
const RI_DIR = pkgDir("react-icons")

// ── read the project ─────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") && e.isDirectory()) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, out) }
    else if (EXTS.has(path.extname(e.name)) && !/\.d\.ts$/.test(e.name)) out.push(p)
  }
  return out
}
const files = walk(ROOT)
const wrapperFile = ["src/lib/yuktai-icons.tsx", "src/lib/yuktai-icons.jsx", "lib/yuktai-icons.tsx", "lib/yuktai-icons.jsx"]
  .map((r) => path.join(ROOT, r)).find((f) => fs.existsSync(f)) || files.find((f) => /[\\/]lib[\\/]yuktai-icons\.(tsx|jsx)$/.test(f))
const items = new Map() // key → { kind, original, lib, yuktai, files:Set }

if (wrapperFile) {
  const w = fs.readFileSync(wrapperFile, "utf8")
  for (const m of w.matchAll(/export const (\w+) = yuktai\("(\w+)"/g)) {
    items.set("mui:" + m[1], { kind: "Material", original: m[1], lib: "mui", yuktai: m[2], files: new Set() })
  }
}
const compToName = {}
for (const n of Object.keys(ICON_PATHS)) compToName[({ left: "ChevronLeftIcon", right: "ChevronRightIcon" })[n] || n[0].toUpperCase() + n.slice(1) + "Icon"] = n
compToName.ChevronLeftIcon = "left"; compToName.ChevronRightIcon = "right"

for (const f of files) {
  if (f === wrapperFile) continue
  const s = fs.readFileSync(f, "utf8")
  const rel = path.relative(ROOT, f)
  for (const m of s.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']*\/yuktai-icons["']/g)) {
    m[1].split(",").map((x) => x.trim()).filter(Boolean).forEach((p) => {
      const n = p.split(/\s+as\s+/)[0].trim()
      const it = items.get("mui:" + n); if (it) it.files.add(rel)
    })
  }
  for (const m of s.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@yuktishaalaa\/yuktai\/icons["']/g)) {
    m[1].split(",").map((x) => x.trim()).filter(Boolean).forEach((p) => {
      const [comp, alias] = p.split(/\s+as\s+/).map((x) => x && x.trim())
      const y = compToName[comp]; if (!y || !alias || alias === comp) return
      const lib = /^Fi[A-Z]/.test(alias) ? "fi" : /^Lu[A-Z]/.test(alias) ? "lu" : /^Fa[A-Z]/.test(alias) ? "fa" : /^Md[A-Z]/.test(alias) ? "md" : "line"
      const key = lib + ":" + alias
      if (!items.has(key)) items.set(key, { kind: { fi: "react-icons (Feather)", lu: "react-icons (Lucide)", fa: "react-icons (Font Awesome)", md: "react-icons (Material)", line: "Lucide / Feather" }[lib], original: alias, lib, yuktai: y, files: new Set() })
      items.get(key).files.add(rel)
    })
  }
}

// ── original icon shapes ─────────────────────────────────────────────────────
const attrs = (body) => {
  const out = []
  for (const m of body.matchAll(/(\w+):\s*("([^"]*)"|[\d.]+)/g)) {
    const k = m[1] === "fillOpacity" ? "fill-opacity" : m[1]
    if (k === "key") continue
    out.push(`${k}="${m[3] !== undefined ? m[3] : m[2]}"`)
  }
  return out.join(" ")
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase()

function muiSvg(name) {
  if (!MUI_DIR) return null
  const tries = ["esm/" + name + ".js", "esm/" + name + ".mjs", name + ".js", "node/" + name + ".js", name + "/index.js"]
  for (const t of tries) {
    const f = path.join(MUI_DIR, t)
    if (!fs.existsSync(f)) continue
    const s = fs.readFileSync(f, "utf8")
    // ESM: _jsx("path", {..})   CommonJS: (0, _jsxRuntime.jsx)("path", {..})   older: React.createElement("path", {..})
    const parts = [...s.matchAll(/(?:_jsx|jsx|createElement)\)?\(\s*"(path|circle|rect|ellipse|polygon|polyline|line|g)",\s*\{([^}]*)\}/g)]
      .map((m) => `<${m[1]} ${attrs(m[2])}/>`)
    if (parts.length) return `<svg viewBox="0 0 24 24" fill="currentColor">${parts.join("")}</svg>`
  }
  return null
}
function lucideSvg(name) {
  const n = name.replace(/^Lu/, "").replace(/Icon$/, "")
  if (LUCIDE_DIR) {
    const names = [kebab(n).replace(/([a-z])(\d)/g, "$1-$2"), kebab(n)]
    const hit = names.flatMap((k) => [".js", ".mjs"].map((e) => path.join(LUCIDE_DIR, "dist/esm/icons", k + e))).find((x) => fs.existsSync(x))
    if (hit) {
      const s = fs.readFileSync(hit, "utf8")
      const parts = [...s.matchAll(/\["(\w+)",\s*\{([^}]*)\}\]/g)].map((m) => `<${m[1]} ${attrs(m[2])}/>`)
      if (parts.length) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${parts.join("")}</svg>`
    }
  }
  if (FEATHER_DIR) {
    const f = path.join(FEATHER_DIR, "dist/icons", kebab(n) + ".js")
    if (fs.existsSync(f)) {
      const s = fs.readFileSync(f, "utf8")
      const parts = [...s.matchAll(/React\.createElement\("(\w+)",\s*\{([^}]*)\}/g)].filter((m) => m[1] !== "svg").map((m) => `<${m[1]} ${attrs(m[2])}/>`)
      if (parts.length) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${parts.join("")}</svg>`
    }
  }
  return null
}
const riCache = {}
function riSvg(set, name) {
  if (!RI_DIR) return null
  const f = path.join(RI_DIR, set, "index.mjs")
  if (!fs.existsSync(f)) return null
  riCache[set] = riCache[set] || fs.readFileSync(f, "utf8")
  const m = riCache[set].match(new RegExp(`function ${name} \\(props\\) \\{\\s*return GenIcon\\((\\{.*?\\})\\)\\(props\\)`))
  if (!m) return null
  let tree; try { tree = JSON.parse(m[1]) } catch { return null }
  const attr = (o) => Object.entries(o || {}).map(([k, v]) => `${k === "viewBox" ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}="${v}"`).join(" ")
  const render = (n) => `<${n.tag} ${attr(n.attr)}>${(n.child || []).map(render).join("")}</${n.tag}>`
  const a = attr(tree.attr)
  return `<svg ${a}>${(tree.child || []).map(render).join("")}</svg>`.replace(/currentColor/g, "currentColor")
}
function originalSvg(it) {
  if (it.lib === "mui") return muiSvg(it.original)
  if (it.lib === "line") return lucideSvg(it.original)
  if (it.lib === "lu") return lucideSvg(it.original) || riSvg("lu", it.original)
  if (it.lib === "fi") return riSvg("fi", it.original)
  if (it.lib === "fa") return riSvg("fa", it.original) || riSvg("fa6", it.original)
  if (it.lib === "md") return riSvg("md", it.original)
  return null
}
const yuktaiSvg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[n] || ""}</svg>`

// ── page ─────────────────────────────────────────────────────────────────────
const list = [...items.values()].sort((a, b) => a.yuktai.localeCompare(b.yuktai) || a.original.localeCompare(b.original))
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
let missingOriginal = 0
const cards = list.map((it) => {
  const o = originalSvg(it); if (!o) missingOriginal++
  const fl = [...it.files]
  return `<li class="card" data-y="${it.yuktai}">
  <div class="pair"><figure>${o || '<span class="na">?</span>'}<figcaption>original</figcaption></figure><span class="arrow" aria-hidden="true">→</span><figure class="yk">${yuktaiSvg(it.yuktai)}<figcaption>yuktai</figcaption></figure></div>
  <p class="name"><b>${esc(it.original)}</b> → <code>${esc(it.yuktai)}</code></p>
  <p class="meta">${esc(it.kind)} · ${fl.length} file${fl.length === 1 ? "" : "s"}</p>
  <details><summary>Files</summary><ul>${fl.map((x) => `<li>${esc(x)}</li>`).join("") || "<li>not found in code</li>"}</ul></details>
  <label class="flag"><input type="checkbox"> meaning looks wrong</label>
</li>`
}).join("\n")

const byY = {}
list.forEach((it) => (byY[it.yuktai] = (byY[it.yuktai] || 0) + 1))
const project = path.basename(ROOT)
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Icon review · ${esc(project)}</title>
<style>
:root{--ink:#172033;--muted:#475569;--line:#D5DCE6;--bg:#F4F6FA;--blue:#005A9C;--navy:#001124;--warn:#B45309}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg)}
header{background:var(--navy);color:#fff;padding:20px 16px}header h1{margin:0 0 4px;font-size:1.4rem}header p{margin:0;color:#DCE6F2}
main{max-width:1200px;margin:auto;padding:16px}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.bar input[type=search]{min-height:40px;padding:6px 10px;border:1px solid #94A3B8;border-radius:8px;font:inherit;min-width:min(100%,280px)}
.stat{background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px 10px}
ul.grid{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:12px}
.card.flagged{border:2px solid var(--warn);background:#FFFBEB}
.pair{display:flex;align-items:center;justify-content:center;gap:10px}
figure{margin:0;text-align:center}figure svg{width:44px;height:44px;display:block;margin:auto;color:var(--ink)}
figure.yk svg{color:var(--blue)}figcaption{font-size:11px;color:var(--muted)}
.arrow{color:var(--muted)}.na{display:block;width:44px;height:44px;line-height:44px;color:var(--muted);border:1px dashed var(--line);border-radius:6px}
.name{margin:8px 0 0;font-size:13px;overflow-wrap:anywhere}.name code{color:var(--blue)}
.meta{margin:2px 0 6px;font-size:12px;color:var(--muted)}
details{font-size:12px}details ul{margin:4px 0 0;padding-left:16px;max-height:120px;overflow:auto}
.flag{display:flex;gap:6px;align-items:center;font-size:12px;margin-top:6px;color:var(--warn)}
button{min-height:40px;padding:6px 12px;border:1px solid var(--blue);border-radius:8px;background:#fff;color:var(--blue);font:inherit;cursor:pointer}
:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
#out{white-space:pre-wrap;background:#fff;border:1px solid var(--line);border-radius:8px;padding:10px;font:12px ui-monospace,Consolas,monospace}
</style></head><body>
<header><h1>Icon review · ${esc(project)}</h1><p>Original icon on the left, the yuktai icon that replaced it on the right. Tick any pair whose meaning does not match.</p></header>
<main>
<div class="bar">
  <span class="stat"><b>${list.length}</b> switched icons</span>
  <span class="stat"><b>${Object.keys(byY).length}</b> yuktai icons used</span>
  ${missingOriginal ? `<span class="stat">${missingOriginal} original not found (shown as ?)</span>` : ""}
  <label>Search <input type="search" id="q" placeholder="name or file"></label>
  <button type="button" id="copy">Copy ticked list</button>
</div>
<pre id="out" hidden></pre>
<ul class="grid" id="grid">
${cards}
</ul>
</main>
<script>
const q=document.getElementById('q'),cards=[...document.querySelectorAll('.card')]
q.addEventListener('input',()=>{const v=q.value.toLowerCase();cards.forEach(c=>c.hidden=v&&!c.textContent.toLowerCase().includes(v))})
cards.forEach(c=>c.querySelector('input').addEventListener('change',e=>c.classList.toggle('flagged',e.target.checked)))
document.getElementById('copy').addEventListener('click',()=>{const t=cards.filter(c=>c.classList.contains('flagged')).map(c=>c.querySelector('.name').textContent.trim()).join('\\n')||'(nothing ticked)';const o=document.getElementById('out');o.hidden=false;o.textContent=t;navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{})})
</script></body></html>`

const outFile = path.join(process.cwd(), "icons-review.html")
fs.writeFileSync(outFile, html)
console.log(`Icon review · ${ROOT}`)
console.log(`  switched icons:      ${list.length}`)
console.log(`  yuktai icons used:   ${Object.keys(byY).length}`)
const ver = (d) => { try { return JSON.parse(fs.readFileSync(path.join(d, "package.json"), "utf8")).version } catch { return "?" } }
console.log(`  icon libraries:      ${[["@mui/icons-material", MUI_DIR], ["lucide-react", LUCIDE_DIR], ["react-feather", FEATHER_DIR], ["react-icons", RI_DIR]].filter(([, d]) => d).map(([n, d]) => n + " " + ver(d)).join(", ") || "none found"}`)
if (missingOriginal) console.log(`  original not found:  ${missingOriginal} (shown as ?)`)
console.log(`  wrote ${outFile}`)
console.log(`\nOpen it:  start icons-review.html`)
