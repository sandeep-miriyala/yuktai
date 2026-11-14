import { afterEach, describe, expect, it } from "vitest"
import { contrastRatio, darkBackground, disableDark, enableDark, isDarkOn, lightText, parseColor } from "../src/index"

const rule = (el: Element) => {
  const id = el.getAttribute("data-yuktai-dk")
  if (id === null) return ""
  const css = document.getElementById("yuktai-a11y-dark")!.textContent!
  const m = css.match(new RegExp(`\\[data-yuktai-dk="${id}"\\](?:\\[data-yuktai-dk="${id}"\\])*\\{([^}]*)\\}`))
  return m ? m[1] : ""
}
const prop = (el: Element, name: string) => {
  const m = rule(el).match(new RegExp(`(?:^|;)${name}:([^;!]+)`))
  return m ? parseColor(m[1].trim()) : null
}

afterEach(() => {
  disableDark(document)
  document.body.innerHTML = ""
  document.head.innerHTML = ""
})

describe("smart dark mode (v6.0.2)", () => {
  it("colour maths: light backgrounds go dark, dark text goes light, hue kept", () => {
    const white = parseColor("#ffffff")!
    const black = parseColor("#000000")!
    const blue = parseColor("#2F43C4")!
    expect(contrastRatio(darkBackground(white), black)).toBeLessThan(1.6)
    expect(contrastRatio(lightText(black), white)).toBeLessThan(1.4)
    const db = darkBackground(blue)
    expect(db.b).toBeGreaterThan(db.r) // still blue
    expect(darkBackground(parseColor("#111111")!)).toEqual(parseColor("#111111")) // dark stays
  })

  it("darkens backgrounds, lightens text and keeps AA contrast", () => {
    document.body.innerHTML = `<main style="background:#ffffff;color:#222222"><p id="p" style="color:#555555">Hello</p><button id="b" style="background:#2F43C4;color:#ffffff">Go</button></main>`
    enableDark(document, "AA")
    expect(isDarkOn(document)).toBe(true)
    const main = document.querySelector("main")!
    const bg = prop(main, "background-color")!
    const fg = prop(document.getElementById("p")!, "color")!
    expect(contrastRatio(bg, parseColor("#000000")!)).toBeLessThan(2)
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    // white text on a blue button stays readable
    const b = document.getElementById("b")!
    expect(contrastRatio(prop(b, "color")!, prop(b, "background-color")!)).toBeGreaterThanOrEqual(4.5)
  })

  it("AAA level: text reaches 7:1", () => {
    document.body.innerHTML = `<div style="background:#ffffff"><p id="p" style="color:#777777">Faint</p></div>`
    enableDark(document, "AAA")
    const bg = prop(document.querySelector("div")!, "background-color")!
    expect(contrastRatio(prop(document.getElementById("p")!, "color")!, bg)).toBeGreaterThanOrEqual(7)
  })

  it("leaves photos and videos alone (no invert), and text on a background picture keeps its colour", () => {
    document.body.innerHTML = `<picture><img id="i" src="a.jpg" alt="a"></picture><section id="s" style="background-image:url(x.jpg);color:#ffffff"><h2 id="h">Hero</h2></section>`
    enableDark(document, "AA")
    const all = document.getElementById("yuktai-a11y-dark")!.textContent!
    expect(all).not.toMatch(/invert/)
    expect(rule(document.getElementById("i")!)).not.toMatch(/color/)
    expect(prop(document.getElementById("h")!, "color")).toEqual(parseColor("#ffffff"))
  })

  it("gradients become one dark colour", () => {
    document.body.innerHTML = `<div id="g" style="background-image:linear-gradient(#ffffff, #eeeeee);color:#000">x</div>`
    enableDark(document, "AA")
    const r = rule(document.getElementById("g")!)
    expect(r).toMatch(/background-image:none/)
  })

  it("new content is darkened when it arrives", async () => {
    document.body.innerHTML = `<div id="list" style="background:#fff"></div>`
    enableDark(document, "AA")
    const p = document.createElement("p")
    p.style.color = "#333333"
    p.textContent = "Loaded later"
    document.getElementById("list")!.appendChild(p)
    await new Promise((r) => setTimeout(r, 500))
    expect(p.hasAttribute("data-yuktai-dk")).toBe(true)
  })

  it("off puts the page back exactly as it was", () => {
    const html = `<main style="background:#ffffff;color:#222"><p>Hi</p></main>`
    document.body.innerHTML = html
    enableDark(document, "AA")
    disableDark(document)
    expect(document.body.innerHTML).toBe(html)
    expect(document.getElementById("yuktai-a11y-dark")).toBeNull()
  })
})
