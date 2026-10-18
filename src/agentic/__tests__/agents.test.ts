import { describe, expect, it, vi } from "vitest"
import type { GridToolColumn } from "../../grid/gridTools"
import { askInsight, comparePeriods, groupBy } from "../insights"
import { planTasks, runTasks } from "../taskRunner"
import { parseVoiceA11yCommand } from "../voiceA11yCommands"

describe("idea 4 — voice commands", () => {
  it("maps phrases to settings", () => {
    expect(parseVoiceA11yCommand("turn on high contrast")).toMatchObject({ type: "setting", patch: { highContrast: true } })
    expect(parseVoiceA11yCommand("switch off dark mode")).toMatchObject({ patch: { darkMode: false } })
    expect(parseVoiceA11yCommand("stop animations")).toMatchObject({ patch: { reduceMotion: true } })
    expect(parseVoiceA11yCommand("make the text bigger", { fontSizeMultiplier: 1 })).toMatchObject({ patch: { fontSizeMultiplier: 1.1 } })
    expect(parseVoiceA11yCommand("bigger text", { fontSizeMultiplier: 1.3 })).toMatchObject({ patch: { fontSizeMultiplier: 1.3 } })
    expect(parseVoiceA11yCommand("పెద్ద అక్షరాలు")).toMatchObject({ patch: { fontSizeMultiplier: 1.1 } })
    expect(parseVoiceA11yCommand("deuteranopia mode")).toMatchObject({ patch: { colorBlindMode: "deuteranopia" } })
    expect(parseVoiceA11yCommand("toggle large targets", { largeTargets: true })).toMatchObject({ patch: { largeTargets: false } })
    expect(parseVoiceA11yCommand("reset all settings")).toMatchObject({ type: "reset" })
  })

  it("maps phrases to grid navigation", () => {
    expect(parseVoiceA11yCommand("next row")).toMatchObject({ type: "grid", action: "next-row" })
    expect(parseVoiceA11yCommand("go to previous row")).toMatchObject({ action: "previous-row" })
    expect(parseVoiceA11yCommand("open this row")).toMatchObject({ action: "open-row" })
    expect(parseVoiceA11yCommand("what's the weather")).toBeNull()
  })
})

const columns: GridToolColumn[] = [
  { key: "id", label: "ID", type: "text" },
  { key: "region", label: "Region", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "conversion", label: "Conversion rate", type: "number" },
  { key: "revenue", label: "Revenue", type: "number" },
  { key: "date", label: "Date", type: "date" },
]

// Reference "now": Wednesday 2026-10-14. This week = Mon 12th–Wed 14th; previous = Mon 5th–Wed 7th.
const sales = [
  { id: "1", region: "South", status: "ok", conversion: 5.0, revenue: 1000, date: "2026-10-06" },
  { id: "2", region: "South", status: "ok", conversion: 3.0, revenue: 800, date: "2026-10-13" },
  { id: "3", region: "North", status: "ok", conversion: 4.0, revenue: 900, date: "2026-10-06" },
  { id: "4", region: "North", status: "error", conversion: 4.5, revenue: 1200, date: "2026-10-13" },
  { id: "5", region: "West", status: "ok", conversion: 2.0, revenue: 300, date: "2026-10-07" },
  { id: "6", region: "West", status: "error", conversion: 1.0, revenue: 250, date: "2026-10-14" },
]

describe("idea 9 — BI insights", () => {
  it("groups and compares periods", () => {
    expect(groupBy(sales, "region", "revenue")[0]).toMatchObject({ group: "North", value: 2100 })
    const cmp = comparePeriods(sales, { dateKey: "date", metricKey: "revenue", groupKey: "region", period: "week", referenceDate: "2026-10-14T12:00:00" })
    expect(cmp.rows.find((r) => r.group === "South")).toMatchObject({ current: 800, previous: 1000, change: -200 })
  })

  it("answers the drop question", () => {
    const a = askInsight("Which region had the highest drop in conversion this week?", sales, columns, { referenceDate: "2026-10-14T12:00:00" })
    expect(a.kind).toBe("period-change")
    expect(a.answer).toMatch(/^South/)
    expect(a.answer).toMatch(/dropped 2/)
  })

  it("answers grouping questions", () => {
    const a = askInsight("total revenue by region", sales, columns)
    expect(a.kind).toBe("group")
    expect(a.answer).toMatch(/^North has the highest total Revenue: 2,100/)
  })
})

describe("idea 8 — multi-step tasks", () => {
  it("splits an instruction into steps", () => {
    const plan = planTasks("Open the filtered results, highlight the error rows, and summarize what changed")
    expect(plan.map((p) => p.action)).toEqual(["filter", "highlight", "summarize"])
  })

  it("runs the steps through the grid callbacks", async () => {
    const onFiltersChange = vi.fn()
    const onHighlightRows = vi.fn()
    const onSortChange = vi.fn()
    const result = await runTasks(
      "show revenue over 500 then highlight the error rows then sort by revenue desc and summarize what changed",
      { data: sales, columns, onFiltersChange, onHighlightRows, onSortChange }
    )
    expect(result.steps.map((s) => s.action)).toEqual(["filter", "highlight", "sort", "summarize"])
    expect(result.steps.every((s) => s.success)).toBe(true)
    expect(onHighlightRows).toHaveBeenLastCalledWith(["4"])
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "revenue", direction: "desc" })
    expect(result.summary).toMatch(/Rows: 6 → 4/)
    expect(result.summary).toMatch(/Revenue > 500/)
  })
})
