// End-to-end check of the built docs site, exactly as GitHub Pages will serve it.
//
//   node scripts/site-e2e.mjs [outDir=site/out] [basePath=/yuktai]
//
// Serves outDir under basePath, opens every page in Chromium and fails when a page
//   • throws a JavaScript error,
//   • has no language, title, <h1> or skip link,
//   • links to a page or file on this site that does not exist,
//   • has a serious or critical accessibility problem (axe-core).
// Needs playwright-core and a Chromium (CHROME=/path/to/chrome), axe-core from the repo.

import { createServer } from "node:http"
import { createRequire } from "node:module"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { extname, join, relative, resolve, sep } from "node:path"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright-core")

const OUT = resolve(process.argv[2] || "site/out")
const BASE = (process.argv[3] || "/yuktai").replace(/\/$/, "")
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png",
  ".ico": "image/x-icon", ".wasm": "application/wasm", ".txt": "text/plain", ".woff2": "font/woff2", ".zip": "application/zip",
}

if (!existsSync(join(OUT, "index.html"))) {
  console.error(`No built site in ${OUT}. Run the site build first.`)
  process.exit(1)
}

/** The file GitHub Pages would answer with, or null. */
function fileFor(urlPath) {
  if (!urlPath.startsWith(`${BASE}/`) && urlPath !== BASE) return null
  let p = decodeURIComponent(urlPath.slice(BASE.length)) || "/"
  let f = join(OUT, p)
  if (!f.startsWith(OUT)) return null
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html")
  else if (!existsSync(f) && existsSync(`${f}.html`)) f = `${f}.html`
  return existsSync(f) && statSync(f).isFile() ? f : null
}

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://x")
  const f = fileFor(url.pathname)
  if (!f) {
    res.writeHead(404, { "content-type": TYPES[".html"] })
    res.end(existsSync(join(OUT, "404.html")) ? readFileSync(join(OUT, "404.html")) : "404")
    return
  }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" })
  res.end(readFileSync(f))
})
await new Promise((r) => server.listen(0, "127.0.0.1", r))
const ORIGIN = `http://127.0.0.1:${server.address().port}`

// Every Next.js page (folders with index.html), not the static demos copied next to the site
function pages(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const f = join(dir, name)
    if (statSync(f).isDirectory()) {
      if (["_next", "vanilla", "ask-page", "icons", "brand", "diagrams", "docs", "screenshots", "wasm"].includes(name) && dir === OUT) continue
      pages(f, out)
    } else if (name === "index.html") {
      out.push(`${BASE}/${relative(OUT, dir).split(sep).join("/")}${dir === OUT ? "" : "/"}`)
    }
  }
  return out
}
const ROUTES = pages(OUT).sort()
const STATIC_DEMOS = ["/vanilla/", "/ask-page/"].filter((p) => existsSync(join(OUT, p, "index.html"))).map((p) => BASE + p)

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const axePath = require.resolve("axe-core/axe.min.js")

const failures = []
const links = new Set()
let axeTotal = 0

for (const route of [...ROUTES, ...STATIC_DEMOS]) {
  const errors = []
  const onError = (e) => errors.push(`page error: ${e.message}`)
  const onConsole = (m) => {
    // Network errors from outside sites (analytics, CDN version check) are not this site's fault
    if (m.type() === "error" && !/net::ERR_|Failed to load resource/.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`)
  }
  page.on("pageerror", onError)
  page.on("console", onConsole)
  const res = await page.goto(ORIGIN + route, { waitUntil: "load" })
  // Scroll through the page so scroll-reveal sections finish fading in (half-faded text
  // would be reported as low contrast), then back to the top
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(900)
  const isDemo = STATIC_DEMOS.includes(route)

  if (!res || res.status() !== 200) errors.push(`HTTP ${res && res.status()}`)
  const info = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title.trim(),
    h1: document.querySelectorAll("h1").length,
    skip: [...document.querySelectorAll("a[href^='#']")].some((a) => /skip/i.test(a.textContent || "")),
    hrefs: [...document.querySelectorAll("a[href], link[href], img[src], script[src]")].map((e) => e.href || e.src),
  }))
  if (!info.lang) errors.push("no <html lang>")
  if (!info.title) errors.push("no <title>")
  if (!isDemo && info.h1 < 1) errors.push("no <h1>")
  if (!isDemo && !info.skip) errors.push("no skip link")
  for (const h of info.hrefs) {
    const u = new URL(h, ORIGIN + route)
    if (u.origin === ORIGIN && u.pathname.startsWith(BASE)) links.add(u.pathname)
  }

  if (!isDemo) {
    await page.addScriptTag({ path: axePath })
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ["violations"] })
      return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.nodes.length})`)
    })
    axeTotal += axe.length
    for (const v of axe) errors.push(`axe: ${v}`)
  }

  page.off("pageerror", onError)
  page.off("console", onConsole)
  console.log(`${errors.length ? "✗" : "✓"} ${route}${errors.length ? `\n    ${errors.join("\n    ")}` : ""}`)
  if (errors.length) failures.push(route)
}

// Every link, image and script on this site points at a real file
const broken = [...links].filter((p) => !fileFor(p)).sort()
for (const b of broken) console.log(`✗ broken link: ${b}`)

// The PWA files work under the base path
const manifest = JSON.parse(readFileSync(join(OUT, "manifest.json"), "utf8"))
const badIcons = (manifest.icons || []).filter((i) => !fileFor(new URL(i.src, `${ORIGIN}${BASE}/manifest.json`).pathname))
for (const i of badIcons) console.log(`✗ manifest icon not found: ${i.src}`)

await browser.close()
server.close()

console.log(`\n${ROUTES.length} pages + ${STATIC_DEMOS.length} demos · ${links.size} links checked · ${broken.length} broken · axe serious/critical: ${axeTotal}`)
if (failures.length || broken.length || badIcons.length) {
  console.log(`FAILED: ${failures.length} page(s), ${broken.length} broken link(s), ${badIcons.length} manifest icon(s)`)
  process.exit(1)
}
console.log("All checks passed.")
