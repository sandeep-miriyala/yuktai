import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { YuktaiGrid, pageWindow } from "../YuktaiGrid"
import type { GridColumn } from "../types"

type Row = { id: string; n: number }
const rows = (count: number): Row[] => Array.from({ length: count }, (_, i) => ({ id: String(i + 1), n: i }))
const columns: GridColumn<Row>[] = [{ key: "n", label: "N", type: "number" }]

describe("pager (5.3.16)", () => {
  it("page window keeps first, last and two either side", () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 0, 5])
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageWindow(50, 100)).toEqual([1, 0, 48, 49, 50, 51, 52, 0, 100])
    expect(pageWindow(100, 100)).toEqual([1, 0, 98, 99, 100])
  })

  it("shows First, Last, page numbers and Go to page", () => {
    const html = renderToStaticMarkup(<YuktaiGrid data={rows(1000)} columns={columns} rowKey="id" engine="ts" pagination={{ pageSize: 10, showSizeChanger: true }} />)
    for (const label of ['aria-label="First page"', 'aria-label="Last page"', 'aria-label="Pages"', 'aria-current="page"', "Go to page", 'aria-label="Page 100"']) expect(html).toContain(label)
  })

  it("offers Show all and All for any number of rows (5.4.0)", () => {
    for (const n of [300, 6000]) {
      const html = renderToStaticMarkup(<YuktaiGrid data={rows(n)} columns={columns} rowKey="id" engine="ts" locale="en-IN" pagination={{ pageSize: 10, showSizeChanger: true }} />)
      expect(html).toContain(`>All (${n.toLocaleString("en-IN")})</option>`)
      expect(html).toContain(`Show all (${n.toLocaleString("en-IN")})`)
    }
    const off = renderToStaticMarkup(<YuktaiGrid data={rows(30)} columns={columns} rowKey="id" engine="ts" pagination={{ pageSize: 10, showSizeChanger: true, showAll: false }} />)
    expect(off).not.toContain(">All (")
    expect(off).not.toContain("Show all")
  })

  it("Show all at or under allLimit draws every row", () => {
    const html = renderToStaticMarkup(<YuktaiGrid data={rows(300)} columns={columns} rowKey="id" engine="ts" pagination={{ pageSize: 0 }} />)
    expect(html.match(/class="yk-grid__row"/g)?.length).toBe(300)
    expect(html).toContain("Rows 1–300 of 300")
    expect(html).toContain("Show pages")
  })

  it("Show all above allLimit is a virtual list: 1,00,000 rows, a few drawn", () => {
    const html = renderToStaticMarkup(<YuktaiGrid data={rows(100_000)} columns={columns} rowKey="id" engine="ts" pagination={{ pageSize: 0 }} />)
    const drawn = html.match(/class="yk-grid__row"/g)?.length ?? 0
    expect(drawn).toBeGreaterThan(5)
    expect(drawn).toBeLessThan(60)
    expect(html).toContain('aria-rowcount="100001"')
    expect(html).toContain('aria-rowindex="2"')
    expect(html).toContain("yk-grid__scroll--all")
    expect(html).toContain('role="region"')
    // bottom spacer holds the height of the rows not drawn (capped for the browser)
    const spacer = Number(html.match(/aria-hidden="true" style="height:(\d+)px"/)?.[1])
    expect(spacer).toBeGreaterThan(4_000_000)
  })

  it("showPageNumbers: false keeps the old Previous / Next only", () => {
    const html = renderToStaticMarkup(<YuktaiGrid data={rows(1000)} columns={columns} rowKey="id" engine="ts" pagination={{ pageSize: 10, showPageNumbers: false }} />)
    expect(html).not.toContain("First page")
    expect(html).toContain('aria-label="Next"')
  })
})
