import { describe, expect, it } from "vitest"
import { checkElementContrast, contrastRatio, isLargeText, nearestPassingColor, parseColor, requiredRatio } from "../src/contrast"

const c = (s: string) => parseColor(s)!

describe("contrast maths", () => {
  it("parses rgb, rgba, hex and transparent", () => {
    expect(parseColor("rgb(255, 0, 10)")).toEqual({ r: 255, g: 0, b: 10, a: 1 })
    expect(parseColor("rgba(0, 0, 0, 0.5)")!.a).toBe(0.5)
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor("transparent")!.a).toBe(0)
    expect(parseColor("color(display-p3 1 0 0)")).toBeNull()
  })
  it("black on white is 21:1", () => {
    expect(contrastRatio(c("#000"), c("#fff"))).toBeCloseTo(21, 1)
  })
  it("levels and large text", () => {
    expect(requiredRatio("AA", false)).toBe(4.5)
    expect(requiredRatio("AA", true)).toBe(3)
    expect(requiredRatio("AAA", false)).toBe(7)
    expect(isLargeText(24, 400)).toBe(true)
    expect(isLargeText(19, 700)).toBe(true)
    expect(isLargeText(19, 400)).toBe(false)
  })
  it("finds a passing colour close to the original", () => {
    const fixed = nearestPassingColor(c("#999999"), c("#ffffff"), 4.5)
    expect(contrastRatio(fixed, c("#ffffff"))).toBeGreaterThanOrEqual(4.5)
    expect(fixed.r).toBeGreaterThan(40) // not simply black
  })
})

describe("checkElementContrast", () => {
  it("fails light grey text on white at AA", () => {
    document.body.innerHTML = `<p id="p" style="color:#aaaaaa;background:#ffffff">text</p>`
    const r = checkElementContrast(document.getElementById("p")!, "AA")
    expect(r.status).toBe("fail")
    expect(r.required).toBe(4.5)
  })
  it("passes dark text", () => {
    document.body.innerHTML = `<div style="background:#ffffff"><p id="p" style="color:#222">text</p></div>`
    expect(checkElementContrast(document.getElementById("p")!, "AA").status).toBe("pass")
  })
  it("is UNKNOWN, never pass, over a background image", () => {
    document.body.innerHTML = `<div style="background-image:url(x.png)"><p id="p" style="color:#fff">text</p></div>`
    const r = checkElementContrast(document.getElementById("p")!, "AA")
    expect(r.status).toBe("unknown")
    expect(r.reason).toBe("background-image")
  })
  it("AAA is stricter than AA", () => {
    document.body.innerHTML = `<p id="p" style="color:#767676;background:#fff">text</p>`
    const el = document.getElementById("p")!
    expect(checkElementContrast(el, "AA").status).toBe("pass")
    expect(checkElementContrast(el, "AAA").status).toBe("fail")
  })
})
