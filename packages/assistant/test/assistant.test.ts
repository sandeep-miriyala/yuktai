import { afterEach, describe, expect, it } from "vitest"
import { checkConfig, mountAssistant } from "../src/index"

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
    expect(document.getElementById("yuktai-a11y-dark")).not.toBeNull()
    expect(JSON.parse(localStorage.getItem("yuktai-assistant:prefs")!).dark).toBe("on")
    click("#reset")
    // back to defaults: no dark mode; only "follow the device" motion setting remains
    expect(document.getElementById("yuktai-a11y-dark")).toBeNull()
  })

  it("destroy removes the panel and every change", () => {
    document.body.innerHTML = `<main><h1>x</h1><p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు చూడ చూడ</p></main>`
    const a = mountAssistant({ features: ["a11y"] })
    a.destroy()
    expect(document.querySelector("yuktai-assistant")).toBeNull()
    expect(document.documentElement.hasAttribute("lang")).toBe(false)
  })

  describe("v6.0.1", () => {
    it("site title and brand colour, with readable text on the colour", () => {
      document.body.innerHTML = `<main><h1>Hello</h1><p>Some English text</p></main>`
      const a = mountAssistant({ features: ["a11y"], title: "Chandamu Help", color: "#FFD400" })
      a.open()
      expect(shadow().querySelector("h2")!.textContent).toBe("Chandamu Help")
      expect(shadow().querySelector(".launch")!.getAttribute("aria-label")).toMatch(/Chandamu Help/)
      const host = document.querySelector("yuktai-assistant") as HTMLElement
      expect(host.style.getPropertyValue("--accent")).toBe("#FFD400")
      expect(host.style.getPropertyValue("--on-accent")).toBe("#000000")
    })

    it("tabs: arrow keys move only between the tabs that exist (no Ask)", () => {
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      expect(shadow().querySelectorAll("[role=tab]").length).toBe(2)
      const key = (k: string) => shadow().activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, composed: true }))
      ;(shadow().querySelector("#tab-a11y") as HTMLElement).focus()
      key("ArrowRight")
      expect(shadow().activeElement!.id).toBe("tab-colours")
      key("ArrowRight")
      expect(shadow().activeElement!.id).toBe("tab-a11y")
      key("ArrowLeft")
      expect(shadow().activeElement!.id).toBe("tab-colours")
      // one Ask button only: none in the footer
      expect(shadow().querySelector(".foot [data-act=ask]")).toBeNull()
    })

    it("text size slider applies while dragging without redrawing the panel", () => {
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      click("#tab-colours")
      const slider = shadow().querySelector("#size") as HTMLInputElement
      slider.value = "150"
      slider.dispatchEvent(new Event("input", { bubbles: true }))
      expect(shadow().querySelector("#size")).toBe(slider) // same element: not redrawn
      expect(document.getElementById("yuktai-a11y-prefs")!.textContent).toMatch(/zoom:1\.5/)
      expect(shadow().querySelector("#size-label")!.textContent).toMatch(/150%/)
      slider.dispatchEvent(new Event("change", { bubbles: true }))
      expect(JSON.parse(localStorage.getItem("yuktai-assistant:prefs")!).textSize).toBe(150)
    })

    it("messages stay: the live region survives redraws and a notice is shown", () => {
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      const status = shadow().querySelector("[role=status]")
      a.element.announce("No voice for te", true)
      click("#tab-colours")
      click("#tab-a11y")
      expect(shadow().querySelector("[role=status]")).toBe(status)
      expect(shadow().querySelector(".notice")!.textContent).toBe("No voice for te")
    })

    it("panel language: lang matches the words, and the visitor can pick it", () => {
      document.documentElement.lang = "te"
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      expect(shadow().querySelector(".chip")!.textContent).toMatch(/పేజీ/)
      const sel = shadow().querySelector("#uilang") as HTMLSelectElement
      sel.value = "en"
      sel.dispatchEvent(new Event("change", { bubbles: true }))
      expect(shadow().querySelector("[role=dialog]")!.getAttribute("lang")).toBe("en")
      expect(shadow().querySelector(".chip")!.textContent).toMatch(/set by the page/)
      expect(localStorage.getItem("yuktai-assistant:uiLang")).toBe("en")
    })

    it("dark mode is held back with another theme, and the panel follows high contrast", () => {
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      click("#tab-colours")
      click("#theme-high-contrast")
      expect(shadow().querySelector(".wrap")!.classList.contains("hc")).toBe(true)
      expect(shadow().querySelector("#dark-on")!.getAttribute("aria-disabled")).toBe("true")
      expect(shadow().textContent).toMatch(/Default theme/)
    })

    it("skip to main content moves focus to <main>; Alt+Shift+Y toggles the panel", () => {
      document.body.innerHTML = `<nav><a href="/">Home</a></nav><main><h1>Hello</h1><p>${"Real content here. ".repeat(10)}</p></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      click("#skip")
      expect(document.activeElement!.tagName).toBe("MAIN")
      expect(a.element.isOpen).toBe(false)
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyY", key: "Y", altKey: true, shiftKey: true }))
      expect(a.element.isOpen).toBe(true)
    })
  })

  describe("v6.0.3 config", () => {
    it("checks the config: typos and bad values warn and fall back", () => {
      const warns: string[] = []
      const orig = console.warn
      console.warn = (m: string) => warns.push(m)
      try {
        const c = checkConfig({ titel: "x", level: "A", contrast: "maybe", color: "notacolour", features: ["a11y", "chat"], side: "top" } as never)
        expect(c.level).toBe("AA")
        expect(c.contrast).toBe("check")
        expect(c.color).toBeUndefined()
        expect(c.features).toEqual(["a11y"])
        expect(c.side).toBe("right")
        expect(warns.join("\n")).toMatch(/unknown option "titel"/)
        expect(warns.length).toBeGreaterThanOrEqual(6)
      } finally {
        console.warn = orig
      }
    })

    it("offset moves the button; panelLang sets the starting panel language", () => {
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"], offset: { x: 24, y: 96 }, panelLang: "te" })
      const host = document.querySelector("yuktai-assistant") as HTMLElement
      expect(host.style.right).toBe("24px")
      expect(host.style.bottom).toBe("96px")
      a.open()
      expect(shadow().querySelector("[role=dialog]")!.getAttribute("lang")).toBe("te")
    })
  })

  describe("v6.0.4", () => {
    it("shows what to check, and the list stays open across redraws", () => {
      document.body.innerHTML = `<main><h1>Hello</h1><button>❌</button><p>${"Some text here. ".repeat(8)}</p></main>`
      const a = mountAssistant({ features: ["a11y"], mode: "check" })
      a.open()
      const d = shadow().querySelector("#checks") as HTMLDetailsElement | null
      expect(d).not.toBeNull()
      expect(d!.querySelectorAll("li").length).toBeGreaterThan(0)
      d!.open = true
      d!.dispatchEvent(new Event("toggle"))
      a.element.update({})
      expect((shadow().querySelector("#checks") as HTMLDetailsElement).open).toBe(true)
    })

    it("tab names are translated", () => {
      document.documentElement.lang = "te"
      document.body.innerHTML = `<main><h1>Hello</h1></main>`
      const a = mountAssistant({ features: ["a11y"] })
      a.open()
      expect(shadow().querySelector("#tab-a11y")!.textContent).toBe("అందుబాటు")
    })
  })
})
