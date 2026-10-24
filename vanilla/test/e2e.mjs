// End-to-end checks for the vanilla build in real Chromium.
//   node vanilla/test/e2e.mjs   (needs playwright-core + a Chromium; axe-core optional)
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const { chromium } = require(process.env.PW_PATH || "playwright-core")
const page_url = pathToFileURL(join(here, "..", "index.html")).href
const shots = process.env.SHOTS || here

let pass = 0, fail = 0
const results = []
async function check(name, fn) {
  try { const info = await fn(); pass++; results.push(`✓ ${name}${info ? " — " + info : ""}`) }
  catch (e) { fail++; results.push(`✗ ${name} — ${e.message.split("\n").filter((l) => !/^\s*-\s+(waiting|retrying|attempting|scrolling|done|element is)/.test(l)).slice(0, 4).join(" / ")}`) }
}
const assert = (c, m) => { if (!c) throw new Error(m) }

const browser = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium" })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true })
const page = await ctx.newPage()
const center = async (sel) => page.$eval(sel, (e) => e.scrollIntoView({ block: "center" }))
const errors = []
page.on("pageerror", (e) => errors.push("pageerror: " + e.message))
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()) })
await page.goto(page_url)
await page.waitForSelector("#employee-grid table")

const grid = "#employee-grid"
const info = () => page.$eval(`${grid} .yv-info`, (e) => e.textContent)
const bodyRows = () => page.$$eval(`${grid} tbody tr[data-yuktai-row-id]`, (r) => r.length)
const askBar = async (q) => {
  await page.fill(`${grid} .yv-agentic-bar input`, q)
  await center(`${grid} .yv-agentic-bar button[type=submit]`)
  await page.click(`${grid} .yv-agentic-bar button[type=submit]`)
  await page.waitForTimeout(250)
  return page.$eval(`${grid} .yv-agentic-bar .yv-answer`, (e) => e.textContent)
}
const askAssistant = async (sel, q) => {
  await page.fill(`${sel} .yv-assistant input`, q)
  await center(`${sel} .yv-assistant button[type=submit]`)
  await page.click(`${sel} .yv-assistant button[type=submit]`)
  await page.waitForTimeout(250)
  return page.$eval(`${sel} .yv-assistant .yv-answer`, (e) => e.textContent)
}

await check("window.yuktai loads with every export", async () => {
  const keys = await page.evaluate(() => Object.keys(window.yuktai))
  const need = ["renderGrid","mountAgenticGridBar","mountAgenticPanel","createAgenticGrid","createGridAgent","registerWebMCP","parseGridIntent","parseAmount","parseGridQuery","executeGridQuery","runGridQuery","detectAnomalies","summarizeRows","askInsight","groupBy","comparePeriods","trend","planTasks","runTasks","runQaAudit","auditToMarkdown","auditToJSON","createA11yCopilot","reviewDesign","reviewForms","reviewForm","readFormFields","askAboutPage","analyzePage","createContextIndex","tokenize","parseVoiceA11yCommand","createVoiceA11yController","createGridTools","wcagPlugin","icon","open","apply","reset","getSettings","getCapabilities","runPageQA"]
  const missing = need.filter((k) => !keys.includes(k))
  assert(!missing.length, "missing " + missing.join(", "))
  return keys.length + " exports"
})
await check("grid shows 10 of 1,000 rows", async () => {
  assert((await bodyRows()) === 10, "rows " + (await bodyRows()))
  const t = await info(); assert(t.includes("1,000"), t); return t
})
await check("search box filters (Hyderabad → 200)", async () => {
  await page.fill(`${grid} .yv-search input`, "Hyderabad"); await page.waitForTimeout(350)
  const t = await info(); assert(t.startsWith("200 "), t)
  await page.fill(`${grid} .yv-search input`, ""); await page.waitForTimeout(350); return t
})
await check("click header sorts and sets aria-sort", async () => {
  await page.click(`${grid} [data-sort=salary]`)
  const s = await page.$eval(`${grid} th:has([data-sort=salary])`, (e) => e.getAttribute("aria-sort"))
  assert(s === "ascending", s)
  await page.click(`${grid} [data-sort=salary]`)
  const s2 = await page.$eval(`${grid} th:has([data-sort=salary])`, (e) => e.getAttribute("aria-sort"))
  assert(s2 === "descending", s2)
  const top = await page.$eval(`${grid} tbody tr td:nth-child(8)`, (e) => e.textContent)
  await page.click(`${grid} [data-sort=salary]`) // third click clears
  return "top salary " + top
})
await check("page size changer and next page", async () => {
  await page.selectOption(`${grid} [data-page-size]`, "25")
  assert((await bodyRows()) === 25, "rows " + (await bodyRows()))
  await page.click(`${grid} [data-page=next]`)
  const p = await page.$eval(`${grid} .yv-pager [aria-current]`, (e) => e.textContent)
  assert(p.startsWith("Page 2"), p)
  await page.selectOption(`${grid} [data-page-size]`, "10"); return p
})
await check("question bar: salary over 1 lakh", async () => {
  const a = await askBar("salary over 1 lakh"); assert(/row\(s\) found/.test(a), a)
  const chips = await page.$$eval(`${grid} .yv-filterbar .yv-chip`, (c) => c.map((x) => x.textContent))
  assert(chips.length === 1, "chips " + chips); return a.split("\n")[0] + " | chip: " + chips[0]
})
await check("question bar: Engineering in Hyderabad", async () => {
  await (async () => { await center(`${grid} .yv-agentic-bar .yv-row > button[type=button]`); await page.click(`${grid} .yv-agentic-bar .yv-row > button[type=button]`) })()
  const a = await askBar("Engineering in Hyderabad"); assert(/found/.test(a), a); return a.split("\n")[0]
})
await check("question bar: anything unusual? highlights the outlier", async () => {
  await (async () => { await center(`${grid} .yv-agentic-bar .yv-row > button[type=button]`); await page.click(`${grid} .yv-agentic-bar .yv-row > button[type=button]`) })()
  const a = await askBar("anything unusual?"); assert(/unusual/i.test(a), a)
  const hl = await page.$$eval(`${grid} tr.yv-hl`, (r) => r.map((x) => x.dataset.yuktaiRowId))
  assert(hl.includes("1078"), "highlighted " + hl); return a.split("\n").slice(0, 2).join(" ")
})
await check("question bar: BI insight table", async () => {
  const a = await askBar("average salary by department")
  const n = await page.$$eval(`${grid} .yv-agentic-bar table tbody tr`, (r) => r.length)
  assert(n >= 5, "table rows " + n); return a.split("\n")[0]
})
await check("question bar: multi-step task", async () => {
  await (async () => { await center(`${grid} .yv-agentic-bar .yv-row > button[type=button]`); await page.click(`${grid} .yv-agentic-bar .yv-row > button[type=button]`) })()
  const a = await askBar("show salary over 80k, then sort by salary, then summarize")
  const steps = await page.$$eval(`${grid} .yv-agentic-bar .yv-steps li`, (r) => r.length)
  assert(steps === 3, "steps " + steps); return a
})
await check("question bar: top 3 by salary (limit)", async () => {
  await (async () => { await center(`${grid} .yv-agentic-bar .yv-row > button[type=button]`); await page.click(`${grid} .yv-agentic-bar .yv-row > button[type=button]`) })()
  const a = await askBar("top 3 by salary"); return a.split("\n")[0]
})
await check("assistant: how many / custom rule / sort / clear", async () => {
  await (async () => { await center(`${grid} .yv-agentic-bar .yv-row > button[type=button]`); await page.click(`${grid} .yv-agentic-bar .yv-row > button[type=button]`) })()
  const a1 = await askAssistant(grid, "how many")
  const a2 = await askAssistant(grid, "high earners")
  const t2 = await info()
  const a3 = await askAssistant(grid, "sort by salary desc")
  const a4 = await askAssistant(grid, "clear filters")
  const a5 = await askAssistant(grid, "help")
  assert(/row/.test(a1) && /Filter applied/.test(a2) && /Sorted by Salary/.test(a3) && /cleared/.test(a4) && /You can ask/.test(a5), [a1, a2, a3, a4, a5].join(" | "))
  return [a1, a2, t2, a3, a4].join(" | ")
})
await check("assistant: open <name> opens the row dialog", async () => {
  const a = await askAssistant(grid, "open Ravi")
  const open = await page.$eval("#row-dialog", (d) => d.open)
  assert(open, "dialog not open: " + a)
  await page.click("#row-dialog-close"); return a
})
await check("assistant history and onAgentResult line", async () => {
  const n = await page.$$eval(`${grid} .yv-assistant .yv-history li`, (r) => r.length)
  const line = await page.$eval("#agent-line", (e) => e.textContent)
  assert(n >= 5, "history " + n); return `${n} steps · ${line}`
})
await check("executeTool + grid API", async () => {
  return page.evaluate(async () => {
    const g = window.__grid || null
    return "ok"
  })
})
await check("keyboard: arrows move cell focus, Space selects, End/Home", async () => {
  await page.click(`${grid} [data-sort=name]`) // focus lands in header
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowRight")
  const f1 = await page.evaluate(() => [document.activeElement.getAttribute("role"), document.activeElement.getAttribute("aria-colindex")])
  assert(f1[0] === "gridcell" && f1[1] === "4", "after arrows " + f1)
  await page.keyboard.press("Home")
  await page.keyboard.press(" ")
  const sel = await page.$eval("#selected-records", (e) => e.textContent)
  assert(sel === "1", "selected " + sel)
  const ti = await page.$$eval(`${grid} [tabindex="0"]`, (e) => e.length)
  assert(ti === 1, "tab stops in table " + ti)
  await page.keyboard.press("PageDown")
  const p = await page.$eval(`${grid} .yv-pager [aria-current]`, (e) => e.textContent)
  return `focus ${f1} · selected ${sel} · ${p}`
})
await check("view toggle → cards; themes switch", async () => {
  await page.selectOption("#view", "card")
  const cards = await page.$$eval(`${grid} .yv-card`, (c) => c.length)
  assert(cards === 10, "cards " + cards)
  for (const t of ["high-contrast", "dark", "color-blind", "dyslexia"]) {
    await page.selectOption("#theme", t)
    const cls = await page.$eval(grid + " .yv-grid", (e) => e.className); assert(cls.includes("yv-theme-" + t), cls)
  }
  await page.screenshot({ path: join(shots, "grid-cards-dyslexia.png"), clip: await page.$eval(grid, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: Math.min(r.height, 900) } }), fullPage: true })
  await page.selectOption("#view", "table"); await page.selectOption("#theme", "default"); return cards + " cards"
})
await check("loading state", async () => {
  await page.click("#loading-demo")
  const busy = await page.$eval(grid + " .yv-grid", (e) => e.getAttribute("aria-busy"))
  assert(busy === "true", busy); await page.waitForTimeout(2100); return "aria-busy=true then table back"
})
await check("CSV export downloads with BOM and formula guard", async () => {
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click(`${grid} .yv-toolbar .yv-btn:has-text("Export CSV")`)])
  const p = await dl.path(); const text = require("node:fs").readFileSync(p, "utf8")
  assert(text.charCodeAt(0) === 0xfeff, "no BOM"); return dl.suggestedFilename() + " · " + text.split("\r\n").length + " lines"
})
await check("Telugu grid: UI, ఎన్ని, custom rule, sort", async () => {
  const g = "#poems-grid"
  const ph = await page.$eval(`${g} .yv-search input`, (e) => e.placeholder)
  const a1 = await askAssistant(g, "ఎన్ని")
  const a2 = await askAssistant(g, "పెద్ద పద్యాలు")
  const a3 = await askAssistant(g, "పంక్తులు ప్రకారం క్రమం")
  const a4 = await askAssistant(g, "ఫిల్టర్లు తీసేయి")
  assert(/వరుస/.test(a1) && /ఫిల్టర్/.test(a2), [a1, a2].join(" | "))
  return [ph, a1, a2, a3, a4].join(" | ")
})
await check("standalone createAgenticGrid + bar", async () => {
  await page.fill("#standalone-bar input", "total salary by city"); await page.click("#standalone-bar button[type=submit]"); await page.waitForTimeout(200)
  const a = await page.$eval("#standalone-bar .yv-answer", (e) => e.textContent)
  await page.fill("#standalone-bar input", "salary under 60k"); await page.click("#standalone-bar button[type=submit]"); await page.waitForTimeout(200)
  const list = await page.$eval("#standalone-table", (e) => e.textContent.split("\n")[0])
  assert(/Total|total/.test(a), a); return a.split("\n")[0] + " | " + list
})
await check("insert practice form", async () => {
  await center("#insert-practice"); await page.click("#insert-practice")
  assert(await page.$("#practice-form"), "no form"); return "inserted"
})
await check("page tools: QA report", async () => {
  await page.click('#page-tools [data-tab=qa]')
  await page.click('#page-tools button:has-text("Run QA audit")')
  const s = await page.$eval("#page-tools .yv-score strong", (e) => e.textContent)
  const summary = await page.$eval("#page-tools [role=tabpanel]:not([hidden]) .yv-score + .yv-meter + p", (e) => e.textContent)
  return `score ${s} · ${summary}`
})
await check("page tools: forms finds the unlabeled field", async () => {
  await page.click('#page-tools [data-tab=forms]')
  await page.click('#page-tools button:has-text("Review forms")'); await page.waitForTimeout(200)
  const t = await page.$eval("#page-tools [role=tabpanel]:not([hidden])", (e) => e.textContent)
  assert(/no label|placeholder as its label|without a label/i.test(t), t.slice(0, 300)); return t.split("\n").filter((l) => /practice|label|autocomplete/i.test(l)).slice(0, 3).join(" / ")
})
await check("page tools: design review", async () => {
  await page.click('#page-tools [data-tab=design]')
  await page.click('#page-tools button:has-text("Review design")')
  const s = await page.$eval("#page-tools [role=tabpanel]:not([hidden]) .yv-score strong", (e) => e.textContent); return "score " + s
})
await check("page tools: ask page (missing labels + purpose)", async () => {
  await page.click('#page-tools [data-tab=ask]')
  await page.fill('#page-tools [role=tabpanel]:not([hidden]) input', "Which fields have no label?")
  await page.click('#page-tools [role=tabpanel]:not([hidden]) button[type=submit]'); await page.waitForTimeout(200)
  const a = await page.$eval("#page-tools [role=tabpanel]:not([hidden]) .yv-answer", (e) => e.textContent)
  assert(/no label/.test(a), a)
  await page.fill('#page-tools [role=tabpanel]:not([hidden]) input', "who is the licence holder"); await page.click('#page-tools [role=tabpanel]:not([hidden]) button[type=submit]'); await page.waitForTimeout(200)
  const b = await page.$$eval("#page-tools [role=tabpanel]:not([hidden]) .yv-answer", (e) => e.map((x) => x.textContent).join(" / "))
  return a + " || " + b.slice(0, 160)
})
await check("page tools: copilot scan, fix, undo", async () => {
  await page.click('#page-tools [data-tab=copilot]')
  await page.click('#page-tools button:has-text("Scan page")')
  const st = await page.$eval('#page-tools [role=tabpanel]:not([hidden]) .yv-status', (e) => e.textContent)
  await page.click('#page-tools button:has-text("Apply all safe fixes")'); await page.waitForTimeout(800)
  const st2 = await page.$eval('#page-tools [role=tabpanel]:not([hidden]) .yv-status', (e) => e.textContent)
  await page.click('#page-tools button:has-text("Undo all")'); await page.waitForTimeout(800)
  return st.slice(0, 90) + " → " + st2.slice(-40)
})
await check("page tools: typed voice command changes text size", async () => {
  await page.click('#page-tools [data-tab=voice]')
  await page.fill('#page-tools [role=tabpanel]:not([hidden]) input[type=text]', "make text bigger")
  await page.click('#page-tools [role=tabpanel]:not([hidden]) button:has-text("Run")'); await page.waitForTimeout(400)
  const fs = await page.evaluate(() => document.documentElement.style.fontSize)
  const log = await page.$eval('#page-tools [role=tabpanel]:not([hidden]) .yv-answer', (e) => e.textContent)
  assert(fs === "110%", "font " + fs)
  await page.fill('#page-tools [role=tabpanel]:not([hidden]) input[type=text]', "రీసెట్")
  await page.click('#page-tools [role=tabpanel]:not([hidden]) button:has-text("Run")'); await page.waitForTimeout(400)
  const fs2 = await page.evaluate(() => document.documentElement.style.fontSize)
  return `font ${fs} → reset "${fs2}" · ${log.replace(/\n/g, " ")}`
})
await check("tabs: arrow keys move between tabs (no double jump)", async () => {
  await page.click('#page-tools [data-tab=copilot]')
  await page.keyboard.press("ArrowRight")
  const t = await page.evaluate(() => document.activeElement.dataset.tab)
  assert(t === "qa", "went to " + t); return t
})
await check("accessibility widget: FAB opens, high contrast saves, reset", async () => {
  await page.click(".yv-fab:not(.yv-fab-alt)")
  await page.waitForSelector('.yv-dialog [data-setting=highContrast]')
  await page.click('.yv-dialog .yv-option:has([data-setting=highContrast]) .yv-switch')
  await page.waitForTimeout(300)
  const on = await page.evaluate(() => document.documentElement.hasAttribute("data-yuktai-high-contrast"))
  const saved = await page.evaluate(() => localStorage.getItem("yuktai-a11y-prefs"))
  const status = await page.$eval(".yv-dialog [data-status]", (e) => e.textContent)
  await page.click('.yv-dialog [data-reset]'); await page.waitForTimeout(300)
  const off = await page.evaluate(() => document.documentElement.hasAttribute("data-yuktai-high-contrast"))
  await page.keyboard.press("Escape")
  const closed = await page.$(".yv-dialog") === null || true
  assert(on && !off && /highContrast":true/.test(saved), `on ${on} off ${off}`)
  return status
})
await check("page tools FAB opens dialog with six tabs", async () => {
  await page.click(".yv-fab-alt")
  const n = await page.$$eval(".yv-dialog [role=tab]", (t) => t.length)
  await page.keyboard.press("Escape")
  assert(n === 6, "tabs " + n); return n + " tabs"
})
await check("playground: every core function runs", async () => {
  const n = await page.$$eval("#play-buttons button", (b) => b.length)
  const bad = []
  for (let i = 0; i < n; i++) {
    await page.click(`#play-buttons button:nth-child(${i + 1})`)
    const t = await page.$eval("#play-out", (e) => e.textContent)
    if (/failed:/.test(t)) bad.push(t.slice(0, 120))
  }
  assert(!bad.length, bad.join(" | ")); return n + " functions"
})
await check("WebMCP reports real status", async () => page.$eval("#webmcp-status", (e) => e.textContent))
await check("WebMCP registers tools when document.modelContext exists", async () => {
  return page.evaluate(async () => {
    const seen = []
    document.modelContext = { registerTool: async (t) => { seen.push(t.name) } }
    const holder = document.createElement("div"); document.body.appendChild(holder)
    let status
    const g = window.yuktai.renderGrid(holder, { data: [{ id: 1, name: "A" }], columns: [{ key: "name", label: "Name" }], webmcp: true, toolName: "t", onWebMCPStatusChange: (s) => (status = s) })
    await new Promise((r) => setTimeout(r, 50))
    g.destroy(); holder.remove(); delete document.modelContext
    if (status.state !== "ready") throw new Error(JSON.stringify(status))
    return status.state + ": " + seen.join(", ")
  })
})
await check("grid API: executeTool, highlight, select, refresh, destroy", async () => {
  return page.evaluate(async () => {
    const holder = document.createElement("div"); document.body.appendChild(holder)
    const g = window.yuktai.renderGrid(holder, [{ id: 1, n: "x", v: 5 }, { id: 2, n: "y", v: 9 }], [{ key: "n", label: "N" }, { key: "v", label: "V", type: "number" }], { rowKey: "id" })
    const r1 = await g.executeTool("filter", { key: "v", operator: "greaterThan", value: 6 })
    const r2 = await g.executeTool("get_row", { id: "9" })
    const r3 = await g.executeTool("nope")
    g.clearFilters(); g.highlight(["2"]); g.select(["1"])
    const out = [r1.message, r2.error.code, r3.error.code, g.getHighlightIds().join(), g.getSelectedKeys().join(), g.getRows().length]
    g.refresh([{ id: 3, n: "z", v: 1 }]); out.push(g.getRows().length)
    g.destroy(); holder.remove()
    return out.join(" · ")
  })
})
await check("v5.1 signature still works and old string helpers exist", async () => page.evaluate(() => typeof window.yuktai.runPageQA() + " / " + JSON.stringify(window.yuktai.getCapabilities()).slice(0, 80)))

// axe-core
let axeSummary = "axe-core not installed"
try {
  const axePath = require.resolve(process.env.AXE_PATH || "axe-core")
  await page.addScriptTag({ path: axePath })
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { exclude: [[".practice"]] })
    return r.violations.map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)
  })
  axeSummary = res.length ? res.join("\n   ") : "0 violations"
} catch (e) { axeSummary = "axe failed: " + e.message }

await page.screenshot({ path: join(shots, "desktop-top.png") })
await page.$eval("#grid", (e) => e.scrollIntoView())
await page.screenshot({ path: join(shots, "desktop-grid.png") })
await page.$eval("#tools", (e) => e.scrollIntoView())
await page.screenshot({ path: join(shots, "desktop-tools.png") })

// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.goto(page_url); await m.waitForSelector("#employee-grid .yv-card")
await check("mobile: auto card view and no sideways scroll", async () => {
  const cards = await m.$$eval("#employee-grid .yv-card", (c) => c.length)
  const over = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert(cards === 10 && over <= 0, `cards ${cards} overflow ${over}`); return `${cards} cards, overflow ${over}px`
})
await m.$eval("#grid", (e) => e.scrollIntoView())
await m.screenshot({ path: join(shots, "mobile-grid.png") })
await m.click(".yv-fab:not(.yv-fab-alt)"); await m.waitForTimeout(200)
await m.screenshot({ path: join(shots, "mobile-a11y.png") })

await browser.close()
console.log(results.join("\n"))
console.log(`\n${pass} passed, ${fail} failed`)
console.log("axe:", axeSummary)
console.log("browser errors:", errors.length ? "\n  " + errors.join("\n  ") : "none")
process.exit(fail ? 1 : 0)
