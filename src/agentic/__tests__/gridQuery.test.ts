import { describe, expect, it, vi } from "vitest"
import { answerGridQuestion, detectAnomalies, parseAmount, parseGridQuery, runGridQuery, summarizeRows } from "../gridQuery"
import type { GridToolColumn } from "../../grid/gridTools"

const columns: GridToolColumn[] = [
  { key: "id", label: "ID", type: "text" },
  { key: "name", label: "Customer", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "region", label: "Region", type: "text" },
  { key: "balance", label: "Balance", type: "number" },
  { key: "dueDate", label: "Due date", type: "date" },
]

const data = [
  { id: "1", name: "Ravi", status: "Overdue", region: "South", balance: 15000, dueDate: "2026-09-01" },
  { id: "2", name: "Anita", status: "Paid", region: "North", balance: 2000, dueDate: "2026-09-10" },
  { id: "3", name: "Arjun", status: "Overdue", region: "South", balance: 8000, dueDate: "2026-08-20" },
  { id: "4", name: "Meena", status: "Overdue", region: "West", balance: 12500, dueDate: "2026-10-01" },
  { id: "5", name: "Kiran", status: "Pending", region: "East", balance: 3000, dueDate: "2026-10-05" },
  { id: "6", name: "Lakshmi", status: "Paid", region: "South", balance: 2500, dueDate: "2026-07-15" },
  { id: "7", name: "Suresh", status: "Pending", region: "North", balance: 950000, dueDate: "2026-10-12" },
]

describe("parseAmount", () => {
  it("reads Indian and short-hand amounts", () => {
    expect(parseAmount("₹10,000")).toBe(10000)
    expect(parseAmount("1.5 lakh")).toBe(150000)
    expect(parseAmount("2 crore")).toBe(20000000)
    expect(parseAmount("10k")).toBe(10000)
    expect(parseAmount("Rs. 500")).toBe(500)
    expect(parseAmount("no number")).toBeNull()
  })
})

describe("parseGridQuery", () => {
  it("combines a known value with a numeric condition", () => {
    const p = parseGridQuery("Which customers are overdue and over ₹10,000?", columns, { data })
    expect(p.filters).toEqual(
      expect.arrayContaining([
        { key: "status", operator: "equals", value: "overdue" },
        { key: "balance", operator: "greaterThan", value: 10000 },
      ])
    )
    expect(p.search).toEqual([])
  })

  it("handles between, starts with and sorting", () => {
    const p = parseGridQuery("customer starting with A and balance between 1k and 9k sorted by balance desc", columns, { data })
    expect(p.filters).toContainEqual({ key: "name", operator: "startsWith", value: "a" })
    expect(p.filters).toContainEqual({ key: "balance", operator: "between", value: [1000, 9000] })
    expect(p.sort).toEqual({ key: "balance", direction: "desc" })
  })

  it("handles top N and dates", () => {
    const p = parseGridQuery("top 2 by balance with due date before 2026-09-30", columns, { data })
    expect(p.limit).toBe(2)
    expect(p.sort).toEqual({ key: "balance", direction: "desc" })
    expect(p.filters).toContainEqual({ key: "dueDate", operator: "lessThan", value: "2026-09-30" })
  })

  it("does not treat a number inside a name as a numeric filter", () => {
    const p = parseGridQuery("customer is ravi2", columns, { data })
    expect(p.filters).toEqual([{ key: "name", operator: "equals", value: "ravi2" }])
  })
})

describe("runGridQuery", () => {
  it("returns matching rows and pushes them into the grid", () => {
    const onFiltersChange = vi.fn()
    const onHighlightRows = vi.fn()
    const r = runGridQuery("overdue customers with balance over 10000", { data, columns, onFiltersChange, onHighlightRows })
    expect(r.ids.sort()).toEqual(["1", "4"])
    expect(onFiltersChange).toHaveBeenCalledOnce()
    expect(onHighlightRows).toHaveBeenCalledWith(expect.arrayContaining(["1", "4"]))
  })

  it("falls back to free-text search", () => {
    const r = runGridQuery("meena", { data, columns })
    expect(r.ids).toEqual(["4"])
  })
})

describe("anomalies and summary", () => {
  it("flags a value far outside the normal range", () => {
    const a = detectAnomalies(data, columns)
    expect(a.find((x) => x.rowId === "7")?.kind).toBe("high")
  })

  it("flags duplicate rows", () => {
    const dup = [...data, { ...data[1], id: "8" }]
    expect(detectAnomalies(dup, columns).some((x) => x.kind === "duplicate" && x.rowId === "8")).toBe(true)
  })

  it("summarises numbers and categories", () => {
    const s = summarizeRows(data, columns)
    expect(s).toContain("7 row(s)")
    expect(s).toContain("Balance: total")
    expect(s).toContain("Overdue (3)")
  })

  it("routes questions to the right tool", () => {
    expect(answerGridQuestion("anything unusual?", { data, columns }).kind).toBe("anomalies")
    expect(answerGridQuestion("give me a summary", { data, columns }).kind).toBe("summary")
    expect(answerGridQuestion("paid in south", { data, columns }).ids).toEqual(["6"])
  })
})
