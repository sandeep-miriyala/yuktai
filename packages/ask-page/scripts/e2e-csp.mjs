// Ask page on sites with a strict Content Security Policy, in real Chromium.
//   npm run build && npm run build:extension && npm run test:csp
//
//   1. Trusted Types enforced, our "yuktai-ask" policy allowed
//   2. Trusted Types enforced, no policy allowed → builds elements itself
//   3. Outside scripts blocked (a bookmarklet fails) → the Chrome extension works
// In all three: no Web Worker from blob:, no WebAssembly → page thread + TypeScript search.
import { createServer } from "node:http"
import { readFileSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright")
const here = dirname(fileURLToPath(import.meta.url))
const pkg = join(here, "..")
const repo = join(pkg, "..", "..")
const demo = readFileSync(join(repo, "ask-page", "index.html"), "utf8")
const bundle = readFileSync(join(pkg, "dist", "ask-page.global.js"))

const CSP = {
  policy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; trusted-types yuktai-ask",
  nopolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; trusted-types 'none'",
  blocked: "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'",
}

const server = createServer((req, res) => {
  const u = new URL(req.url, "http://x")
  if (u.pathname.endsWith(".js")) {
    res.writeHead(200, { "content-type": "text/javascript" })
    return res.end(bundle)
  }
  const mode = u.pathname.split("/")[1]
  if (!CSP[mode]) return res.writeHead(404).end()
  // the demo page, with its script pointing at this server (or removed when scripts are blocked)
  const html = mode === "blocked" ? demo.replace(/<script src="\.\/ask-page\.global\.js" defer><\/script>/, "") : demo.replace("./ask-page.global.js", "/ask-page.global.js")
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-security-policy": CSP[mode] })
  res.end(html)
}).listen(0)
const base = `http://127.0.0.1:${server.address().port}`

let passed = 0
const failures = []
async function check(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failures.push(name)
    console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n").slice(0, 6).join("\n      ")}`)
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m)
}

async function askOn(page, q) {
  await page.waitForFunction(() => document.querySelector("yuktai-ask")?.shadowRoot?.querySelector(".panel"))
  await page.evaluate((q) => document.querySelector("yuktai-ask").askQuestion(q), q)
  await page.waitForFunction(() => document.querySelector("yuktai-ask").shadowRoot.querySelector(".msg.bot:not(.intro)[aria-busy=false]"), null, { timeout: 20000 })
  return page.evaluate(() => {
    const r = document.querySelector("yuktai-ask").shadowRoot
    const b = document.querySelector("yuktai-ask").page.backend
    return {
      answer: r.querySelector(".turn .msg.bot .body").textContent,
      source: r.querySelector(".turn .src")?.textContent ?? "",
      chips: r.querySelectorAll(".chip").length,
      icons: r.querySelectorAll("svg").length,
      svgNs: r.querySelector("svg")?.namespaceURI,
      where: b.where,
      engine: b.engine,
    }
  })
}

const browser = await chromium.launch()
try {
  for (const mode of ["policy", "nopolicy"]) {
    await check(`Trusted Types ${mode === "policy" ? "with our policy allowed" : "with no policy allowed"}: panel works and answers`, async () => {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      const errors = []
      page.on("pageerror", (e) => errors.push(e.message))
      await page.goto(`${base}/${mode}/`)
      const r = await askOn(page, "How do I install it?")
      assert(/install/i.test(r.answer), `answer: ${r.answer}`)
      assert(/Install/i.test(r.source), `source: ${r.source}`)
      assert(r.chips > 0 && r.icons > 5 && r.svgNs === "http://www.w3.org/2000/svg", JSON.stringify(r))
      assert(r.where === "page" && r.engine === "js", `expected page thread + TypeScript under CSP, got ${r.where}/${r.engine}`)
      assert(!errors.length, errors.join(" | "))
      console.log(`      (${r.where}, ${r.engine} search, ${r.icons} icons)`)
      await ctx.close()
    })
  }

  await check("outside scripts blocked: a bookmarklet-style <script src> fails", async () => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(`${base}/blocked/`)
    const ok = await page.evaluate(
      () =>
        new Promise((res) => {
          const s = document.createElement("script")
          try {
            s.src = "/ask-page.global.js"
          } catch {
            return res("trusted-types")
          }
          s.onload = () => res("loaded")
          s.onerror = () => res("blocked")
          document.body.appendChild(s)
          setTimeout(() => res("timeout"), 3000)
        }),
    )
    assert(ok !== "loaded", "script loaded despite CSP")
    await ctx.close()
  })
} finally {
  await browser.close()
}

// The extension: Chromium with the unpacked extension, host access for the test only
const extDir = join(pkg, "dist", "extension")
const testExt = mkdtempSync(join(tmpdir(), "ask-ext-"))
const { cpSync, writeFileSync } = await import("node:fs")
cpSync(extDir, testExt, { recursive: true })
const manifest = JSON.parse(readFileSync(join(testExt, "manifest.json"), "utf8"))
manifest.host_permissions = ["<all_urls>"] // a click grants this through activeTab; tests can't click the toolbar
writeFileSync(join(testExt, "manifest.json"), JSON.stringify(manifest))
const profile = mkdtempSync(join(tmpdir(), "ask-profile-"))
const ctx = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  args: [`--disable-extensions-except=${testExt}`, `--load-extension=${testExt}`],
})
try {
  await check("Chrome extension: opens and answers on a page that blocks all outside scripts", async () => {
    let [sw] = ctx.serviceWorkers()
    if (!sw) sw = await ctx.waitForEvent("serviceworker", { timeout: 10000 })
    const page = await ctx.newPage()
    const errors = []
    page.on("pageerror", (e) => errors.push(e.message))
    await page.goto(`${base}/blocked/`)
    await page.bringToFront()
    await sw.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      await self.askToggle(tab)
    })
    await page.waitForFunction(() => !document.querySelector("yuktai-ask")?.shadowRoot?.querySelector(".panel")?.hidden, null, { timeout: 10000 })
    const r = await askOn(page, "How do I install it?")
    assert(/install/i.test(r.answer), `answer: ${r.answer}`)
    assert(!errors.length, errors.join(" | "))
    // clicking again closes it
    await sw.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      await self.askToggle(tab)
    })
    await page.waitForFunction(() => document.querySelector("yuktai-ask").shadowRoot.querySelector(".panel").hidden)
    console.log(`      (${r.where}, ${r.engine} search)`)
  })
} finally {
  await ctx.close()
  rmSync(profile, { recursive: true, force: true })
  rmSync(testExt, { recursive: true, force: true })
  server.close()
}

console.log(`\n${passed} passed, ${failures.length} failed`)
process.exit(failures.length ? 1 : 0)
