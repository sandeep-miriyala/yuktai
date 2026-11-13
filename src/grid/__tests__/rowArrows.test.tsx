// @vitest-environment happy-dom
// v6.0.0: arrow keys move between clickable rows; Enter during Telugu/Hindi
// typing (IME composition) does not send the assistant a half word.

import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeAll, describe, expect, it } from "vitest"
import { YuktaiGrid } from "../YuktaiGrid"
import type { GridColumn } from "../types"

type Row = { id: string; name: string }
const data: Row[] = [
  { id: "1", name: "Asha" },
  { id: "2", name: "Ravi" },
  { id: "3", name: "Lakshmi" },
]
const columns: GridColumn<Row>[] = [{ key: "name", label: "Name" }]

let root: Root | null = null
let host: HTMLElement | null = null
beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})
afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
})

const key = (el: Element, k: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
  })

describe("grid keyboard (v6.0.0)", () => {
  it("ArrowDown, ArrowUp, End and Home move focus between rows", () => {
    host = document.createElement("div")
    document.body.appendChild(host)
    root = createRoot(host)
    act(() => root!.render(createElement(YuktaiGrid as never, { data, columns, rowKey: "id", pagination: false, onRowClick: () => {} })))
    const rows = [...host.querySelectorAll<HTMLElement>("tbody tr[tabindex='0']")]
    expect(rows.length).toBe(3)
    rows[0].focus()
    key(rows[0], "ArrowDown")
    expect(document.activeElement).toBe(rows[1])
    key(rows[1], "End")
    expect(document.activeElement).toBe(rows[2])
    key(rows[2], "ArrowUp")
    expect(document.activeElement).toBe(rows[1])
    key(rows[1], "Home")
    expect(document.activeElement).toBe(rows[0])
  })
})
