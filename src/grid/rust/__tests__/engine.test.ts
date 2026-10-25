// @vitest-environment happy-dom
//
// The Rust engine must give EXACTLY the same rows as TypeScript.
// Each grid (useGrid, <YuktaiGrid>, vanilla renderGrid) runs its real code
// twice, engine "ts" and engine "rust", on random mixed data.

import { createElement } from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { GridCore, loadGridCore, wantsRustEngine } from "../engine"
import { useGrid, type UseGridReturn } from "../../useGrid"
import { yuktaiGridRows, yuktaiGridSearchTexts } from "../../yuktaiGridRows"
import { toGridToolColumns } from "../../gridTools"
import type { GridColumn } from "../../types"
// @ts-expect-error plain JavaScript module
import { renderGrid } from "../../../../vanilla/src/grid.js"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

type Row = Record<string, unknown>

// Small deterministic random generator, so failures can be replayed
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const WORDS = ["Hyderabad", "hyderabad", "Vizag", "రత్నదీపాలు", "జయంతి", "రంగు", "Ravi", "SITA", "gopal", "", " ", "10", "2", "0x1f", "1e3"]

function pick<T>(r: () => number, list: readonly T[]): T {
  return list[Math.floor(r() * list.length)]
}

function makeRows(seed: number, n: number, mix: "numbers" | "numberish" | "dates" | "mixed"): Row[] {
  const r = rng(seed)
  const rows: Row[] = []
  for (let i = 0; i < n; i++) {
    const roll = r()
    let amount: unknown
    if (mix === "numbers") amount = roll < 0.12 ? null : roll < 0.16 ? undefined : Math.round((r() - 0.5) * 2e6) / 100
    else if (mix === "numberish") amount = roll < 0.1 ? null : roll < 0.15 ? "" : roll < 0.6 ? Math.round(r() * 500) : String(Math.round(r() * 500))
    else if (mix === "dates") amount = roll < 0.1 ? null : roll < 0.15 ? "" : new Date(2020, Math.floor(r() * 60), 1 + Math.floor(r() * 28)).toISOString().slice(0, 10)
    else amount = pick(r, [null, "", 5, "5", NaN, true, "abc", 1e308, -1e308, Infinity, 0, -0, new Date(2024, 1, 1)])
    rows.push({
      id: String(i),
      name: pick(r, WORDS) + (r() < 0.3 ? " " + pick(r, WORDS) : ""),
      city: pick(r, WORDS),
      amount,
      when: r() < 0.1 ? null : new Date(2021, Math.floor(r() * 36), 1 + Math.floor(r() * 28)),
    })
  }
  return rows
}

const columns: GridColumn<Row>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "city", label: "City" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "when", label: "When", type: "date" },
]
const columnsUntyped: GridColumn<Row>[] = columns.map((c) => ({ key: c.key, label: c.label }))

const QUERIES = ["hyd", "HYD", "రత్న", "జయంతి", "ravi", "10", "1", "a", "zzz", " "]
const ids = (rows: Row[]) => rows.map((r) => r.id)

// Count the times Rust really answered, to prove the parity tests exercise it
const used = { search: 0, sort: 0 }
const realSearch = GridCore.prototype.search
const realSort = GridCore.prototype.sortByKeys
GridCore.prototype.search = function (q: string) {
  const r = realSearch.call(this, q)
  if (r) used.search++
  return r
}
GridCore.prototype.sortByKeys = function (k: Float64Array, d: boolean) {
  const r = realSort.call(this, k, d)
  if (r) used.sort++
  return r
}

beforeAll(async () => {
  expect(await loadGridCore()).not.toBeNull()
})

afterAll(() => {
  console.log(`Rust answered ${used.search} searches and ${used.sort} sorts`)
  expect(used.search).toBeGreaterThan(1000)
  expect(used.sort).toBeGreaterThan(1000)
})

describe("engine basics", () => {
  it("chooses Rust only when asked", () => {
    expect(wantsRustEngine(undefined, 1e6)).toBe(false)
    expect(wantsRustEngine("ts", 1e6)).toBe(false)
    expect(wantsRustEngine("rust", 3)).toBe(true)
    expect(wantsRustEngine("auto", 9_999)).toBe(false)
    expect(wantsRustEngine("auto", 10_000)).toBe(true)
  })

  it("sorts with empty rows last and keeps ties in order", () => {
    const core = GridCore.create()!
    const order = core.sortByKeys(new Float64Array([3, NaN, 1, 3, NaN, 2]), false)!
    expect(Array.from(order)).toEqual([2, 5, 0, 3, 1, 4])
    const desc = core.sortByKeys(new Float64Array([3, NaN, 1, 3, NaN, 2]), true)!
    expect(Array.from(desc)).toEqual([0, 3, 5, 2, 1, 4])
  })

  it("searches Telugu and keeps original order", () => {
    const core = GridCore.create()!
    expect(core.setSearchTexts(["రంగు రంగుల రత్నదీపాలు", "abc", "రత్నం"])).toBe(true)
    expect(Array.from(core.search("రత్న")!)).toEqual([0, 2])
    expect(core.search("a\u0000b")).toBeNull() // separator in query → TypeScript
  })

  it("refuses text TextEncoder would change (lone surrogate)", () => {
    const core = GridCore.create()!
    expect(core.setSearchTexts(["ok", "bad\ud800"])).toBe(false)
    expect(core.search("ok")).toBeNull()
  })

  it("grows memory for 100,000 rows", () => {
    const core = GridCore.create()!
    const keys = new Float64Array(100_000).map((_, i) => (i * 7919) % 100_000)
    const order = core.sortByKeys(keys, false)!
    expect(order.length).toBe(100_000)
    expect(keys[order[0]]).toBe(0)
    expect(keys[order[99_999]]).toBe(99_999)
  })
})

describe("<YuktaiGrid> pipeline: TypeScript and Rust agree", () => {
  const mixes = ["numbers", "numberish", "dates", "mixed"] as const
  for (const mix of mixes) {
    it(`mix: ${mix}`, () => {
      for (let seed = 1; seed <= 12; seed++) {
        const data = makeRows(seed * 31 + mix.length, 300, mix)
        const core = GridCore.create()!
        const searchReady = core.setSearchTexts(yuktaiGridSearchTexts(data, columns))
        const toolColumns = toGridToolColumns(columns.map((c) => ({ key: String(c.key), label: c.label, type: c.type })))
        for (const searchText of ["", ...QUERIES]) {
          for (const sortKey of [undefined, "amount", "when", "name", "id"]) {
            for (const sortDirection of ["asc", "desc"] as const) {
              const base = { data, columns, searchText, filters: [], toolColumns, sortKey, sortDirection, locale: "te-IN" }
              const ts = yuktaiGridRows(base)
              const rust = yuktaiGridRows({ ...base, core, searchReady })
              expect(ids(rust)).toEqual(ids(ts))
            }
          }
        }
      }
    })
  }
})

function runUseGrid(data: Row[], cols: GridColumn<Row>[], engine: "ts" | "rust") {
  let grid: UseGridReturn<Row> | null = null
  function Probe() {
    grid = useGrid({ data, columns: cols, engine, pagination: false, locale: "te-IN" })
    return null
  }
  const el = document.createElement("div")
  const root = createRoot(el)
  act(() => root.render(createElement(Probe)))
  return {
    rows(query: string, sort: { key: string; direction: "asc" | "desc" } | null) {
      act(() => {
        grid!.setSearchQuery(query)
        grid!.setSort(sort)
      })
      return ids(grid!.rows)
    },
    close: () => act(() => root.unmount()),
  }
}

describe("useGrid: TypeScript and Rust agree", () => {
  const mixes = ["numbers", "numberish", "dates", "mixed"] as const
  for (const mix of mixes) {
    for (const [label, cols] of [["typed", columns], ["untyped", columnsUntyped]] as const) {
      it(`mix: ${mix}, columns ${label}`, () => {
        for (let seed = 1; seed <= 4; seed++) {
          const data = makeRows(seed * 17 + mix.length, 250, mix)
          const ts = runUseGrid(data, cols, "ts")
          const rust = runUseGrid(data, cols, "rust")
          for (const query of ["", ...QUERIES]) {
            for (const key of [null, "amount", "when", "name"]) {
              for (const direction of ["asc", "desc"] as const) {
                const sort = key ? { key, direction } : null
                expect(rust.rows(query, sort)).toEqual(ts.rows(query, sort))
              }
            }
          }
          ts.close()
          rust.close()
        }
      })
    }
  }
})

describe("vanilla renderGrid: TypeScript and Rust agree", () => {
  const mixes = ["numbers", "numberish", "dates", "mixed"] as const
  for (const mix of mixes) {
    it(`mix: ${mix}`, async () => {
      const data = makeRows(99 + mix.length, 300, mix)
      const cols = columns.map((c) => ({ key: c.key, label: c.label, type: c.type }))
      const a = document.createElement("div")
      const b = document.createElement("div")
      document.body.append(a, b)
      const ts = renderGrid(a, { data, columns: cols, engine: "ts" })
      const rust = renderGrid(b, { data, columns: cols, engine: "rust" })
      expect(await ts.whenEngineReady()).toBe("ts")
      expect(await rust.whenEngineReady()).toBe("rust")
      for (const query of ["", ...QUERIES]) {
        ts.search(query)
        rust.search(query)
        for (const key of [null, "amount", "when", "name"]) {
          for (const direction of ["asc", "desc"]) {
            ts.sortBy(key, direction)
            rust.sortBy(key, direction)
            expect(ids(rust.getRows())).toEqual(ids(ts.getRows()))
          }
        }
      }
      ts.destroy()
      rust.destroy()
    })
  }
})

describe("search time", () => {
  const data = makeRows(7, 200, "numbers")

  it("formats times", async () => {
    const { formatSearchTime } = await import("../engine")
    expect(formatSearchTime(0)).toBe("<0.1 ms")
    expect(formatSearchTime(0.94)).toBe("0.9 ms")
    expect(formatSearchTime(12.6)).toBe("13 ms")
  })

  it("<YuktaiGrid> pipeline reports the engine that really answered", async () => {
    const { engineUsed } = await import("../../yuktaiGridRows")
    const core = GridCore.create()!
    const searchReady = core.setSearchTexts(yuktaiGridSearchTexts(data, columns))
    const toolColumns = toGridToolColumns(columns.map((c) => ({ key: String(c.key), label: c.label, type: c.type })))
    const base = { data, columns, filters: [], toolColumns, sortDirection: "asc" as const, locale: "te-IN", core, searchReady }
    const stats = { search: null, sort: null } as { search: "rust" | "ts" | null; sort: "rust" | "ts" | null }
    yuktaiGridRows({ ...base, searchText: "hyd", sortKey: "amount", stats })
    expect(stats).toEqual({ search: "rust", sort: "rust" })
    yuktaiGridRows({ ...base, searchText: "", sortKey: "name", stats }) // Telugu text sort → TypeScript
    expect(stats).toEqual({ search: null, sort: "ts" })
    expect(engineUsed(stats)).toBe("ts")
    yuktaiGridRows({ ...base, searchText: "", stats })
    expect(engineUsed(stats)).toBeNull()
  })

  it("useGrid returns searchTime", () => {
    let grid: UseGridReturn<Row> | null = null
    function Probe() {
      grid = useGrid({ data, columns, engine: "rust", pagination: false })
      return null
    }
    const root = createRoot(document.createElement("div"))
    act(() => root.render(createElement(Probe)))
    expect(grid!.searchTime).toBeNull()
    act(() => grid!.setSearchQuery("hyd"))
    expect(grid!.searchTime).toMatchObject({ query: "hyd", engine: "rust", rows: grid!.rows.length })
    expect(grid!.searchTime!.ms).toBeGreaterThanOrEqual(0)
    act(() => root.unmount())
  })

  it("vanilla grid shows and reports search time", async () => {
    const el = document.createElement("div")
    document.body.append(el)
    const reports: { engine: string; query: string }[] = []
    const grid = renderGrid(el, {
      data,
      columns: columns.map((c) => ({ key: c.key, label: c.label, type: c.type })),
      engine: "rust",
      showSearchTime: true,
      onSearchTime: (r: { engine: string; query: string }) => reports.push(r),
    })
    await grid.whenEngineReady()
    grid.search("hyd")
    expect(el.querySelector(".yv-info")!.textContent).toMatch(/ms · Rust$/)
    expect(grid.getSearchTime()).toMatchObject({ query: "hyd", engine: "rust" })
    grid.goToPage(2) // a redraw without a new search must not report again
    expect(reports.filter((r) => r.query === "hyd").length).toBe(1)
    grid.destroy()
  })

  it("<YuktaiGrid> shows the time next to the row count", async () => {
    const { YuktaiGrid } = await import("../../YuktaiGrid")
    const seen: { engine: string }[] = []
    const el = document.createElement("div")
    const root = createRoot(el)
    act(() =>
      root.render(
        createElement(YuktaiGrid, {
          data,
          columns,
          engine: "rust",
          showSearchTime: true,
          onSearchTime: (r: { engine: string }) => seen.push(r),
        } as never)
      )
    )
    const input = el.querySelector("input[aria-label]") as HTMLInputElement
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
    act(() => {
      setValue.call(input, "hyd")
      input.dispatchEvent(new Event("input", { bubbles: true }))
    })
    expect(el.textContent).toMatch(/ms · Rust/)
    expect(seen.at(-1)?.engine).toBe("rust")
    act(() => root.unmount())
  })
})
