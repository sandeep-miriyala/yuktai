// @vitest-environment happy-dom
import { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgenticGridBar, AgenticPanel, useAgenticGrid } from "../react"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "balance", label: "Balance", type: "number" },
]
const data = [
  { id: "1", name: "Ravi", status: "Overdue", balance: 15000 },
  { id: "2", name: "Anita", status: "Paid", balance: 2000 },
  { id: "3", name: "Meena", status: "Overdue", balance: 4000 },
]

let shown: Record<string, unknown>[] = []
let highlighted: string[] = []
function Demo() {
  const grid = useAgenticGrid({ data, columns })
  shown = grid.gridData
  highlighted = grid.highlightIds
  return <AgenticGridBar grid={grid} />
}

async function mount(node: React.ReactNode) {
  const host = document.createElement("div")
  document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => root.render(node))
  return { host, root }
}

describe("React layer", () => {
  it("renders on the server without touching the DOM", () => {
    expect(renderToString(<AgenticPanel />)).toContain("Copilot")
  })

  it("filters grid data from a question", async () => {
    const { host, root } = await mount(<Demo />)
    const input = host.querySelector("input")!
    const form = host.querySelector("form")!
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
      setter.call(input, "overdue and over 10k")
      input.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })
    expect(shown.map((r) => r.id)).toEqual(["1"])
    expect(highlighted).toEqual(["1"])
    expect(host.textContent).toContain("1 row(s) found")
    await act(async () => root.unmount())
  })

  it("panel tabs switch and run the QA check", async () => {
    document.body.insertAdjacentHTML("beforeend", `<main><h1>Demo</h1><img src="x.png"></main>`)
    const { host, root } = await mount(<AgenticPanel defaultTab="qa" />)
    const run = Array.from(host.querySelectorAll("button")).find((b) => b.textContent === "Run QA check")!
    await act(async () => run.click())
    expect(host.textContent).toMatch(/FAIL|PASS/)
    const designTab = Array.from(host.querySelectorAll("[role='tab']")).find((b) => b.textContent === "Design") as HTMLButtonElement
    await act(async () => designTab.click())
    expect(designTab.getAttribute("aria-selected")).toBe("true")
    await act(async () => root.unmount())
  })
})
