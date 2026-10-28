// @vitest-environment happy-dom
// 5.3.10 security regression tests: page text must never become HTML.
import { afterEach, describe, expect, it } from "vitest"
import { wcagPlugin } from "../renderer"

const EVIL = `<img src=x onerror="window.__pwned=1"><b>bold</b>`

afterEach(() => {
  document.body.innerHTML = ""
  delete (window as { __pwned?: number }).__pwned
})

function alertNode(): HTMLElement {
  const node = document.querySelector('[role="alert"][aria-live="assertive"]')
  if (!node) throw new Error("visual alert not shown")
  return node as HTMLElement
}

describe("visual alert", () => {
  it("shows the message as text, never as HTML", () => {
    wcagPlugin.showVisualAlert(EVIL, "info")
    const node = alertNode()
    expect(node.querySelector("img")).toBeNull()
    expect(node.querySelector("b")).toBeNull()
    expect(node.textContent).toContain(EVIL)
  })

  it("announce() with page text stays text", () => {
    wcagPlugin.announce(`Selected: ${EVIL}`, "success", false)
    expect(alertNode().querySelector("img")).toBeNull()
  })

  it("close button has no inline handler and still closes", () => {
    wcagPlugin.showVisualAlert("Saved", "success")
    const node = alertNode()
    const btn = node.querySelector("button") as HTMLButtonElement
    expect(btn.getAttribute("onclick")).toBeNull()
    expect(btn.getAttribute("aria-label")).toBe("Close notification")
    btn.click()
    expect(node.style.opacity).toBe("0")
  })

  it("reuses one alert and replaces its content", () => {
    wcagPlugin.showVisualAlert("First", "info")
    wcagPlugin.showVisualAlert("Second", "warning")
    const alerts = document.querySelectorAll('[role="alert"][aria-live="assertive"]')
    expect(alerts.length).toBe(1)
    expect(alerts[0].textContent).toContain("Second")
    expect(alerts[0].textContent).not.toContain("First")
  })
})
