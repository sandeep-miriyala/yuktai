import { afterEach, describe, expect, it } from "vitest"
import { mountAssistant } from "../src/index"

const shadow = () => document.querySelector("yuktai-assistant")!.shadowRoot!
const click = (sel: string) => (shadow().querySelector(sel) as HTMLElement).click()

afterEach(() => {
  document.querySelector("yuktai-assistant") && (document.querySelector("yuktai-assistant") as unknown as { _assistant: { destroy(): void } })._assistant.destroy()
  document.body.innerHTML = ""
  document.documentElement.removeAttribute("lang")
  document.documentElement.removeAttribute("data-yuktai-lang")
  localStorage.clear()
})

describe("mountAssistant", () => {
  it("mounts once, finds the page language and runs the engine", () => {
    document.body.innerHTML = `<main><h1>వేమన శతకం</h1><p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు చూడ చూడ రుచుల జాడ వేరు</p><p id="en">English meaning here</p></main>`
    const a = mountAssistant({ features: ["a11y"] })
    expect(mountAssistant({ features: ["a11y"] })).toBe(a)
    expect(document.documentElement.lang).toBe("te")
    expect(document.getElementById("en")!.getAttribute("lang")).toBe("en")
    expect(a.report!.fixed.length).toBeGreaterThan(0)
    // panel speaks the page language
    a.open()
    expect(shadow().querySelector("h2")!.closest("[lang]")!.getAttribute("lang")).toBe("te")
  })

  it("launcher is a labelled button that opens a dialog; Escape closes it", () => {
    document.body.innerHTML = `<main><h1>Hello</h1><p>Some English text on the page</p></main>`
    mountAssistant({ features: ["a11y"] })
    const launch = shadow().querySelector(".launch")!
    expect(launch.getAttribute("aria-label")).toBeTruthy()
    expect(launch.getAttribute("aria-expanded")).toBe("false")
    click(".launch")
    const panel = shadow().querySelector("[role=dialog]")!
    expect(panel.hasAttribute("hidden")).toBe(false)
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }))
    expect(shadow().querySelector("[role=dialog]")!.hasAttribute("hidden")).toBe(true)
  })

  it("visitor choices apply, are saved on the device, and Reset clears them", () => {
    document.body.innerHTML = `<main><h1>Hello</h1></main>`
    const a = mountAssistant({ features: ["a11y"] })
    a.open()
    click("#tab-colours")
    click("#dark-on")
    expect(document.getElementById("yuktai-a11y-prefs")!.textContent).toMatch(/invert/)
    expect(JSON.parse(localStorage.getItem("yuktai-assistant:prefs")!).dark).toBe("on")
    click("#reset")
    // back to defaults: no dark mode; only "follow the device" motion setting remains
    expect(document.getElementById("yuktai-a11y-prefs")?.textContent ?? "").not.toMatch(/invert/)
  })

  it("destroy removes the panel and every change", () => {
    document.body.innerHTML = `<main><h1>x</h1><p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు చూడ చూడ</p></main>`
    const a = mountAssistant({ features: ["a11y"] })
    a.destroy()
    expect(document.querySelector("yuktai-assistant")).toBeNull()
    expect(document.documentElement.hasAttribute("lang")).toBe(false)
  })
})
