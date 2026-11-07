// @vitest-environment happy-dom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { YuktaiGrid } from "../YuktaiGrid"
import type { GridColumn } from "../types"

type Row = { id: string; name: string }
const data: Row[] = [{ id: "a", name: "Asha" }, { id: "b", name: "Bala" }]
const columns: GridColumn<Row>[] = [{ key: "name", label: "Name", type: "text" }]

let root: Root | null = null
let host: HTMLElement | null = null

beforeAll(() => {
  // React needs this flag for act() outside a test renderer
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

function mount(props: Record<string, unknown>) {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => root!.render(createElement(YuktaiGrid as never, { data, columns, rowKey: "id", pagination: false, ...props })))
}

describe("grid keyboard and labels (5.5.3)", () => {
  it("clickable rows can be reached with Tab and opened with Enter or Space", () => {
    const open = vi.fn()
    mount({ onRowClick: open })
    const rows = host!.querySelectorAll<HTMLElement>("tbody tr.yk-grid__row")
    expect(rows).toHaveLength(2)
    expect(rows[0].tabIndex).toBe(0)
    act(() => { rows[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })) })
    act(() => { rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })) })
    expect(open).toHaveBeenCalledTimes(2)
    expect(open.mock.calls[0][0]).toEqual(data[1])
  })

  it("phone cards open with Enter too", () => {
    const wide = window.innerWidth
    Object.defineProperty(window, "innerWidth", { value: 400, configurable: true })
    try {
      const open = vi.fn()
      mount({ onRowClick: open })
      const card = host!.querySelector<HTMLElement>(".yk-grid__card")!
      expect(card.getAttribute("role")).toBe("group")
      expect(card.tabIndex).toBe(0)
      act(() => { card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })) })
      expect(open).toHaveBeenCalledWith(data[0], 0)
    } finally {
      Object.defineProperty(window, "innerWidth", { value: wide, configurable: true })
    }
  })

  it("rows without onRowClick are not in the Tab order", () => {
    mount({})
    const row = host!.querySelector<HTMLElement>("tbody tr.yk-grid__row")!
    expect(row.hasAttribute("tabindex")).toBe(false)
  })

  it("the selection column has a heading for screen readers", () => {
    const html = renderToStaticMarkup(createElement(YuktaiGrid as never, { data, columns, rowKey: "id", selectable: true, pagination: false }))
    expect(html).toMatch(/<th scope="col"[^>]*><span[^>]*>Select<\/span><\/th>/)
  })
})
