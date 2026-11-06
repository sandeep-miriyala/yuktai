import { describe, expect, it } from "vitest"
import { yuktaiGridSortKeys, yuktaiGridRows, gridCollator } from "../yuktaiGridRows"
import type { GridColumn } from "../types"

type Row = { id: string; name: string | null; n: number | null; when: string; ok: boolean }

const rows: Row[] = [
  { id: "ORD-10", name: "ravi", n: 3, when: "2025-03-14", ok: true },
  { id: "ORD-2", name: "Ánanya", n: null, when: "2024-01-01", ok: false },
  { id: "ORD-1", name: null, n: 1, when: "2025-12-31", ok: true },
  { id: "ORD-3", name: "Ravi", n: 2, when: "2024-06-30", ok: false },
  { id: "ORD-20", name: "ananya", n: 5, when: "2024-01-01", ok: true },
]

// The pre-5.3.13 TypeScript comparator, kept here as the reference answer.
function reference(data: Row[], key: keyof Row, desc: boolean, locale = "en") {
  return [...data].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv
    const c = String(av).localeCompare(String(bv), locale, { numeric: true, sensitivity: "base" })
    return desc ? -c : c
  })
}

// What the Rust engine does with keys: NaN last, desc flips the rest, ties keep their order.
function byKeys(data: Row[], keys: Float64Array, desc: boolean) {
  const idx = data.map((_, i) => i).sort((a, b) => {
    const na = Number.isNaN(keys[a])
    const nb = Number.isNaN(keys[b])
    if (na || nb) return (na ? 1 : 0) - (nb ? 1 : 0) || a - b
    return (desc ? keys[b] - keys[a] : keys[a] - keys[b]) || a - b
  })
  return idx.map((i) => data[i])
}

describe("yuktaiGridSortKeys", () => {
  for (const key of ["id", "name", "n", "when", "ok"] as const) {
    for (const desc of [false, true]) {
      it(`${key} ${desc ? "desc" : "asc"} gives the TypeScript order`, () => {
        const keys = yuktaiGridSortKeys(rows, key, "en")
        expect(keys).not.toBeNull()
        expect(byKeys(rows, keys!, desc).map((r) => r.id)).toEqual(reference(rows, key, desc).map((r) => r.id))
      })
    }
  }

  it("numbers mixed with text still go to TypeScript", () => {
    expect(yuktaiGridSortKeys([{ v: 1 }, { v: "a" }], "v")).toBeNull()
  })

  it("texts the collator calls equal share one rank", () => {
    const k = yuktaiGridSortKeys(rows, "name", "en")!
    expect(k[0]).toBe(k[3]) // ravi, Ravi
    expect(k[1]).toBe(k[4]) // Ánanya, ananya
    expect(Number.isNaN(k[2])).toBe(true)
  })

  it("one collator per locale", () => {
    expect(gridCollator("te")).toBe(gridCollator("te"))
  })

  it("the TypeScript path gives the same order as before", () => {
    const columns: GridColumn<Row>[] = [{ key: "name", label: "Name" }]
    const out = yuktaiGridRows({ data: rows, columns, searchText: "", filters: [], toolColumns: [], sortKey: "name", sortDirection: "desc", locale: "en" })
    expect(out.map((r) => r.id)).toEqual(reference(rows, "name", true).map((r) => r.id))
  })

  it("1,00,000 text rows rank quickly", () => {
    const big = Array.from({ length: 100_000 }, (_, i) => ({ id: `ORD-${String(i).padStart(7, "0")}` }))
    const t = performance.now()
    const keys = yuktaiGridSortKeys(big.reverse(), "id", "en-IN")!
    expect(keys[0]).toBe(99_999)
    expect(performance.now() - t).toBeLessThan(3000)
  })
})
