// Speed test: the vanilla grid with engine "ts" vs "rust" on the same data.
//
//   CHROME=/path/to/chrome node vanilla/test/bench.mjs [rows]
//
// Times the grid's real search and sort (getRows), median of several runs.

import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const { chromium } = require(process.env.PW_PATH || "playwright-core")

const rows = Number(process.argv[2]) || 100_000
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium", args: ["--disable-dev-shm-usage"] })
const page = await browser.newPage()
await page.setContent("<!doctype html><html><body><div id=a></div><div id=b></div></body></html>")
await page.addScriptTag({ path: join(here, "..", "index.min.js") })

const result = await page.evaluate(async (n) => {
  const cities = ["Hyderabad", "Vizag", "Vijayawada", "Tirupati", "Warangal", "హైదరాబాదు", "విశాఖపట్నం"]
  const names = ["Ravi", "Sita", "Gopal", "Lakshmi", "రాము", "సీత", "Anil", "Meena"]
  const data = Array.from({ length: n }, (_, i) => ({
    id: String(i),
    name: names[i % names.length] + " " + ((i * 7919) % 1000),
    city: cities[(i * 31) % cities.length],
    salary: (i * 104729) % 250000,
    joined: new Date(2000 + (i % 25), i % 12, 1 + (i % 28)).toISOString().slice(0, 10),
  }))
  const columns = [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "salary", label: "Salary", type: "number" },
    { key: "joined", label: "Joined", type: "date" },
  ]
  const make = (el, engine) => window.yuktai.renderGrid(el, { data, columns, engine, pagination: { pageSize: 10 } })
  const ts = make("#a", "ts")
  const rust = make("#b", "rust")
  await rust.whenEngineReady()

  const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)]
  function time(grid, setup) {
    const runs = []
    for (let r = 0; r < 7; r++) {
      grid.search("")
      grid.clearSort()
      setup(grid)
      const t0 = performance.now()
      grid.getRows()
      runs.push(performance.now() - t0)
    }
    return median(runs)
  }
  const cases = {
    "search 'hyd'": (g) => g.search("hyd"),
    "search 'సీత'": (g) => g.search("సీత"),
    "sort salary": (g) => g.sortBy("salary", "asc"),
    "sort joined (date) desc": (g) => g.sortBy("joined", "desc"),
  }
  const out = { engine: rust.engine, rows: n, cases: {} }
  for (const [name, setup] of Object.entries(cases)) {
    // Same answer check before timing
    setup(ts)
    setup(rust)
    const same = JSON.stringify(ts.getRows().map((r) => r.id)) === JSON.stringify(rust.getRows().map((r) => r.id))
    out.cases[name] = { ts: time(ts, setup), rust: time(rust, setup), same }
  }
  return out
}, rows)

console.log(`engine: ${result.engine} · ${result.rows.toLocaleString("en-IN")} rows · median of 7 (ms)`)
for (const [name, r] of Object.entries(result.cases)) {
  console.log(`${name.padEnd(26)} ts ${r.ts.toFixed(1).padStart(8)}   rust ${r.rust.toFixed(1).padStart(8)}   ${(r.ts / r.rust).toFixed(1)}×   same rows: ${r.same}`)
}
await browser.close()
