// End-to-end checks in real Chromium against the demo page (repo /ask-page/).
//   npm run build:demo && npm run test:e2e
// Checks: panel opens, answers with highlighted sources, Telugu, honest
// "not on this page", privacy (typed text never found), 0 network requests
// while asking, clear + undo, keyboard, settings consent, mobile sheet,
// Web Worker + Rust/WASM in use, axe-core: 0 violations.
import { createServer } from "node:http"
import { readFileSync, existsSync, statSync, mkdirSync } from "node:fs"
import { extname, join, normalize, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright")
const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, "..", "..", "..")
const shots = join(here, "..", "eval", "screenshots")
mkdirSync(shots, { recursive: true })
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8")

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".png": "image/png", ".css": "text/css", ".json": "application/json" }
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname)
  let file = normalize(join(repo, path))
  if (!file.startsWith(repo)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html")
  if (!existsSync(file)) return res.writeHead(404).end("not found")
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" })
  res.end(readFileSync(file))
}).listen(0)
const url = `http://127.0.0.1:${server.address().port}/ask-page/`

let passed = 0
const failures = []
async function check(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failures.push(name)
    console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n").slice(0, 8).join("\n      ")}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto(url)
  await page.waitForFunction(() => customElements.get("yuktai-ask") && document.querySelector("yuktai-ask"))
  const host = page.locator("yuktai-ask")
  const panel = host.locator(".panel")
  const ask = async (q) => {
    const before = await host.locator(".msg.bot:not(.intro)").count()
    await host.locator("#ask-input").fill(q)
    await host.locator("#ask-input").press("Enter")
    await page.waitForFunction((n) => {
      const msgs = document.querySelector("yuktai-ask").shadowRoot.querySelectorAll(".msg.bot:not(.intro)")
      // newest first (LIFO): the latest answer is the first one
      return msgs.length > n && msgs[0].getAttribute("aria-busy") === "false"
    }, before)
    return host.locator(".msg.bot:not(.intro)").first()
  }

  await check("launcher opens the panel and focuses the question box", async () => {
    await host.locator(".launcher").click()
    await panel.waitFor({ state: "visible" })
    assert(await host.locator("#ask-input").evaluate((el) => el.getRootNode().activeElement === el), "input not focused")
  })

  await check("runs search in a Web Worker on the Rust/WebAssembly core", async () => {
    await page.waitForFunction(() => document.querySelector("yuktai-ask").page?.backend)
    const info = await page.evaluate(() => {
      const b = document.querySelector("yuktai-ask").page.backend
      return { where: b.where, engine: b.engine }
    })
    assert(info.where === "worker" && info.engine === "rust-wasm", JSON.stringify(info))
  })

  await check("shows at least 5 suggested questions, owner questions first", async () => {
    await host.locator(".chip").first().waitFor()
    const chips = await host.locator(".chip:not(.more)").allInnerTexts()
    assert(chips.length >= 5, `only ${chips.length}`)
    assert(chips[0].includes("How do I install it?"), chips[0])
  })

  await page.evaluate(() => (window.__requests = []))
  page.on("request", (r) => page.evaluate((u) => window.__requests?.push(u), r.url()).catch(() => {}))
  const requestsBefore = []
  page.on("request", (r) => requestsBefore.push(r.url()))

  await check("answers from the page and highlights the source", async () => {
    const m = await ask("How do I install it?")
    const text = await m.innerText()
    assert(/npm/.test(text), text)
    assert(/Installation/.test(text), "no Installation source")
    const hl = await page.evaluate(() => CSS.highlights.has("yuktai-ask-source") && [...CSS.highlights.get("yuktai-ask-source")].some((r) => r.toString().includes("npm")))
    assert(hl, "source not highlighted")
  })

  await check("answers a Telugu question from the Telugu section", async () => {
    const m = await ask("సంక్రాంతి మూడవ రోజు ఏం చేస్తారు?")
    const text = await m.innerText()
    assert(text.includes("పశువులను") || text.includes("కనుమ"), text)
  })

  await check('says "not on this page" instead of guessing', async () => {
    const m = await ask("What is the warranty period for the laptop?")
    assert(/doesn't answer/.test(await m.innerText()), await m.innerText())
  })

  await check("never finds what a visitor typed into the form", async () => {
    await page.fill("#name", "Zebulon Quartzfield")
    await page.fill("#note", "launch codes 7781-QX")
    await page.evaluate(async () => {
      const p = document.querySelector("yuktai-ask").page
      await p.reindex()
    })
    const m = await ask("Zebulon Quartzfield launch codes")
    const text = await m.innerText()
    assert(!text.includes("Zebulon") && !text.includes("7781"), text)
    const f = await ask("What fields are in the form?")
    const ft = await f.innerText()
    assert(/Full name/.test(ft) && !ft.includes("Zebulon"), ft)
  })

  await check("makes 0 network requests while answering (Fast mode)", async () => {
    assert(requestsBefore.length === 0, requestsBefore.join(", "))
    const count = await page.locator("#net-count").innerText()
    assert(count === "0", `page counter says ${count}`)
  })

  await check("Clear chat empties the conversation and Undo brings it back", async () => {
    const n = await host.locator(".msg.you").count()
    await host.locator("[data-action=clear]").click()
    assert((await host.locator(".msg.you").count()) === 0, "not cleared")
    await host.locator("[data-action=undo]").click()
    assert((await host.locator(".msg.you").count()) === n, "undo failed")
  })

  await check("A+ makes the text larger", async () => {
    const size = () => host.locator(".msg.you").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const a = await size()
    await host.locator("[data-action=larger]").click()
    const b = await size()
    assert(b > a && a >= 17, `${a} → ${b}`)
    await host.locator("[data-action=smaller]").click()
  })

  await check("axe-core: 0 accessibility violations with the panel open", async () => {
    await page.addScriptTag({ content: axeSource })
    const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}: ${v.nodes.length}`))
    assert(res.length === 0, res.join("; "))
  })

  await page.screenshot({ path: join(shots, "desktop.png") })

  await check("settings: Balanced mode asks before downloading the model", async () => {
    await host.locator("[data-action=settings]").click()
    await host.locator("input[name=mode][value=balanced]").check()
    await host.locator("[data-action=save-settings]").click()
    await host.locator(".consent").waitFor()
    const t = await host.locator(".consent").innerText()
    assert(/118 MB/.test(t), t)
    await page.screenshot({ path: join(shots, "settings.png") })
    await host.locator("[data-action=consent-no]").click()
    await host.locator("[data-action=back]").click()
  })

  await check("Escape closes the panel and focus returns to the launcher; Ctrl+/ reopens", async () => {
    await host.locator("#ask-input").focus()
    await page.keyboard.press("Escape")
    await panel.waitFor({ state: "hidden" })
    assert(await host.locator(".launcher").evaluate((el) => el.getRootNode().activeElement === el), "focus not on launcher")
    await page.keyboard.press("Control+/")
    await panel.waitFor({ state: "visible" })
  })

  await check("100 questions: newest answer on top, 20 on screen, older ones behind \"show earlier\"", async () => {
    const t0 = Date.now()
    for (let i = 1; i <= 100; i++) await page.evaluate((q) => document.querySelector("yuktai-ask").askQuestion(q), `How do I install it? (${i})`)
    const ms = Date.now() - t0
    const r = await page.evaluate(() => {
      const root = document.querySelector("yuktai-ask").shadowRoot
      const first = root.querySelector(".turn .msg.you .q").textContent
      const input = root.querySelector("#ask-input").getBoundingClientRect()
      return { first, turns: root.querySelectorAll(".turn").length, earlier: !!root.querySelector("[data-action=earlier]"), inputTop: input.top, scroll: root.querySelector(".log").scrollTop }
    })
    assert(r.first.includes("(100)"), `newest not on top: ${r.first}`)
    assert(r.turns === 20 && r.earlier, JSON.stringify(r))
    assert(r.inputTop < 300 && r.scroll === 0, `question box or newest answer not in view: ${JSON.stringify(r)}`)
    await host.locator("[data-action=earlier]").click()
    assert((await host.locator(".turn").count()) === 40, "show earlier did not add 20")
    assert(ms < 20000, `100 questions took ${ms} ms`)
    console.log(`      (100 questions in ${ms} ms)`)
  })

  await check("no JavaScript errors", async () => assert(errors.length === 0, errors.join("; ")))

  // phone
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const mp = await phone.newPage()
  await mp.goto(url)
  await mp.waitForFunction(() => document.querySelector("yuktai-ask"))
  const mhost = mp.locator("yuktai-ask")
  await check("phone: opens as a full-width bottom sheet", async () => {
    await mhost.locator(".launcher").click()
    await mhost.locator(".panel").waitFor({ state: "visible" })
    const box = await mhost.locator(".panel").boundingBox()
    assert(Math.round(box.width) === 390 && box.y > 40, JSON.stringify(box))
    await mhost.locator(".chip").first().waitFor()
    await mhost.locator("#ask-input").fill("How do I install it?")
    await mhost.locator("#ask-input").press("Enter")
    await mp.waitForFunction(() => document.querySelector("yuktai-ask").shadowRoot.querySelector(".msg.bot:not(.intro)[aria-busy=false]"))
    await mp.waitForTimeout(800)
    await mp.screenshot({ path: join(shots, "phone.png") })
  })
} finally {
  await browser.close()
  server.close()
}
console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) process.exit(1)
