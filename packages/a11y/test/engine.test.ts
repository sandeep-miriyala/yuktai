import { afterEach, describe, expect, it } from "vitest"
import { createA11y, prefsCss, readAttributes, toJSON, message } from "../src/index"

const reset = (html: string, attrs: Record<string, string> = {}) => {
  document.documentElement.removeAttribute("lang")
  document.documentElement.removeAttribute("data-yuktai-lang")
  for (const a of Array.from(document.body.attributes)) document.body.removeAttribute(a.name)
  for (const [k, v] of Object.entries(attrs)) document.body.setAttribute(k, v)
  document.body.innerHTML = html
}

afterEach(() => reset(""))

describe("do no harm", () => {
  it("never invents labels for native elements", () => {
    reset(`<main><h1>Shop</h1><button id="b"></button><img id="i" src="a.png"><input id="f"><table id="t"><tr><td>a</td></tr><tr><td>b</td></tr></table></main>`)
    const a11y = createA11y({ observe: false })
    const r = a11y.run()
    const b = document.getElementById("b")!
    expect(b.hasAttribute("aria-label")).toBe(false)
    expect(document.getElementById("i")!.hasAttribute("alt")).toBe(false)
    expect(document.getElementById("i")!.hasAttribute("aria-hidden")).toBe(false)
    expect(document.getElementById("f")!.hasAttribute("aria-label")).toBe(false)
    expect(document.getElementById("t")!.hasAttribute("role")).toBe(false)
    const rules = r.check.map((f) => f.rule)
    expect(rules).toEqual(expect.arrayContaining(["control-name-missing", "img-alt-missing", "field-label-missing", "table-headers-missing"]))
    a11y.destroy()
  })

  it("fixes an onclick div with a name, and undo puts it back", () => {
    reset(`<main><h1>x</h1><div id="d" onclick="void 0">Next poem</div></main>`)
    const a11y = createA11y({ observe: false })
    const r = a11y.run()
    const d = document.getElementById("d")!
    expect(d.getAttribute("role")).toBe("button")
    expect(d.getAttribute("tabindex")).toBe("0")
    expect(r.fixed.some((f) => f.rule === "fake-button")).toBe(true)
    a11y.undo()
    expect(d.hasAttribute("role")).toBe(false)
    expect(d.hasAttribute("tabindex")).toBe(false)
  })

  it("mode=check changes nothing", () => {
    reset(`<main><h1>x</h1><div id="d" onclick="void 0">Next</div><p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు</p></main>`, { "data-yuktai-a11y": "check" })
    const a11y = createA11y({ observe: false })
    const r = a11y.run()
    expect(r.mode).toBe("check")
    expect(r.fixed).toHaveLength(0)
    expect(document.getElementById("d")!.hasAttribute("role")).toBe(false)
    expect(document.documentElement.hasAttribute("lang")).toBe(false)
  })
})

describe("contrast in a run", () => {
  it("reports at check, fixes at fix, restores on undo", () => {
    reset(`<main><h1>x</h1><p id="p" style="color:#aaaaaa;background:#fff">light text</p></main>`, { "data-yuktai-contrast": "fix" })
    const a11y = createA11y({ observe: false })
    const r = a11y.run()
    const f = r.fixed.find((x) => x.rule === "contrast")!
    expect(f).toBeTruthy()
    expect(f.data!.required).toBe(4.5)
    const p = document.getElementById("p")!
    expect(p.style.getPropertyValue("color")).not.toBe("")
    a11y.undo()
    expect(p.style.getPropertyValue("color")).toMatch(/aaaaaa|170, 170, 170/)
  })

  it("lists unknown contrast separately from passes", () => {
    reset(`<main><h1>x</h1><div style="background-image:url(a.png)"><p>over a picture</p></div></main>`)
    const r = createA11y({ observe: false }).run()
    expect(r.unknown.some((f) => f.rule === "contrast-unknown")).toBe(true)
  })
})

describe("settings", () => {
  it("reads attributes and ignores bad values", () => {
    reset("", { "data-yuktai-level": "AAA", "data-yuktai-contrast": "nonsense" })
    const s = readAttributes(document)
    expect(s.level).toBe("AAA")
    expect(s.contrast).toBe("check")
  })

  it("messages come in English and Telugu, and the report is JSON-safe", () => {
    reset(`<main><h1>x</h1><img src="a.png"></main>`)
    const r = createA11y({ observe: false }).run()
    const img = r.check.find((f) => f.rule === "img-alt-missing")!
    expect(message(img, "en")).toMatch(/alt/)
    expect(message(img, "te")).toMatch(/alt/)
    expect(() => JSON.stringify(toJSON(r))).not.toThrow()
  })
})

describe("visitor preferences", () => {
  it("builds CSS only for what is chosen", () => {
    const base = { textSize: 100, spacing: false, reduceMotion: "off" as const, focusRing: false, theme: "default" as const, dark: "off" as const, level: "AA" as const }
    expect(prefsCss(base)).toBe("")
    expect(prefsCss({ ...base, textSize: 150 })).toMatch(/font-size:150%/)
    expect(prefsCss({ ...base, reduceMotion: "device" })).toMatch(/prefers-reduced-motion/)
    expect(prefsCss({ ...base, dark: "on" })).toMatch(/invert/)
    // a faint custom text colour is darkened until it passes AA
    const css = prefsCss({ ...base, theme: "custom", custom: { text: "#bbbbbb", background: "#ffffff" } })
    expect(css).not.toMatch(/#bbbbbb/)
  })

  it("setPrefs adds one style element and destroy removes it", () => {
    reset(`<main><h1>x</h1></main>`)
    const a11y = createA11y({ observe: false })
    a11y.setPrefs({ textSize: 130 })
    expect(document.getElementById("yuktai-a11y-prefs")).toBeTruthy()
    a11y.destroy()
    expect(document.getElementById("yuktai-a11y-prefs")).toBeNull()
  })
})
