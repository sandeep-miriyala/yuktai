import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { YuktaiGrid, gridColors } from "../YuktaiGrid"
import type { GridColumn } from "../types"

type Row = { id: string; name: string; amount: number }
const data: Row[] = [
  { id: "1", name: "Lakshmi", amount: 10 },
  { id: "2", name: "Ravi", amount: 20 },
]
const columns: GridColumn<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "amount", label: "Amount", type: "number" },
]

describe("grid CSS custom properties (5.3.14)", () => {
  it("every colour is a --yk-grid-* variable with the old colour as fallback", () => {
    const light = gridColors(false)
    const dark = gridColors(true)
    for (const v of [...Object.values(light), ...Object.values(dark)]) expect(v).toMatch(/^var\(--yk-grid-[a-z-]+, #[0-9a-f]{6}\)$/)
    expect(light.bg).toBe("var(--yk-grid-bg, #ffffff)")
    expect(dark.bg).toBe("var(--yk-grid-bg, #0f172a)")
    expect(light.accent).toBe("var(--yk-grid-accent, #2563eb)")
  })

  it("renders stable class names and no hard-coded grid colours", () => {
    const html = renderToStaticMarkup(<YuktaiGrid data={data} columns={columns} rowKey="id" engine="ts" pagination={{ pageSize: 10 }} className="mine" />)
    for (const c of ["yk-grid mine", "yk-grid__toolbar", "yk-grid__table", "yk-grid__head", "yk-grid__body", "yk-grid__row", "yk-grid__cell", "yk-grid__pager"]) expect(html).toContain(c)
    expect(html).toContain("var(--yk-grid-bg, #ffffff)")
    // the only #hex left in inline styles are fallbacks inside var(...)
    const bare = [...html.matchAll(/style="([^"]*)"/g)].flatMap((m) => m[1].replace(/var\(--[a-z-]+, #[0-9a-fA-F]{6}\)/g, "").match(/#[0-9a-fA-F]{3,6}\b/g) ?? [])
    expect(bare).toEqual([])
  })

  it("dark theme uses the same variable names with dark fallbacks", () => {
    const html = renderToStaticMarkup(<YuktaiGrid data={data} columns={columns} rowKey="id" engine="ts" theme="dark" />)
    expect(html).toContain("var(--yk-grid-bg, #0f172a)")
    expect(html).toContain("var(--yk-grid-text, #f8fafc)")
  })
})
