import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { UI_LANGUAGES, UI_TEXT, WELCOME, uiText } from "../uiLanguage"
import { MOTION_SCRIPT, resolveMotion } from "../motion"
import { SPLASH_SCRIPT, splashWordCss } from "../splash"
import { YuktaiSplash } from "../YuktaiSplash"
import { Reveal } from "../Reveal"
import * as head from "../head"

describe("experience (5.5.0)", () => {
  it("has English + 6 Indian languages, every word in every language", () => {
    expect(UI_LANGUAGES.map((l) => l.code)).toEqual(["en", "te", "hi", "ta", "kn", "ml", "bn"])
    const keys = Object.keys(UI_TEXT.en).sort()
    for (const l of UI_LANGUAGES) {
      expect(Object.keys(UI_TEXT[l.code]).sort()).toEqual(keys)
      expect(WELCOME[l.code]).toBeTruthy()
    }
  })

  it("looks up your words first, then built-in, then English, then the key", () => {
    const mine = { te: { docs: "పత్రాలు" }, en: { pricing: "Pricing" } }
    expect(uiText("te", "docs", mine)).toBe("పత్రాలు")
    expect(uiText("hi", "docs", mine)).toBe("डॉक्स")
    expect(uiText("ta", "pricing", mine)).toBe("Pricing")
    expect(uiText("bn", "nothing")).toBe("nothing")
  })

  it("resolves explicit motion choices without a browser", () => {
    expect(resolveMotion("off")).toBe("off")
    expect(resolveMotion("lively")).toBe("lively")
    expect(resolveMotion("auto")).toBe("calm")
  })

  it("head strings are plain scripts that parse", () => {
    expect(() => new Function(MOTION_SCRIPT)).not.toThrow()
    expect(() => new Function(SPLASH_SCRIPT)).not.toThrow()
    expect(Object.keys(head)).toContain("MOTION_SCRIPT")
  })

  it("splash renders logo, 7 welcome words, a skip button and screen-reader text", () => {
    const html = renderToStaticMarkup(createElement(YuktaiSplash, { logo: createElement("img", { alt: "", src: "/l.svg" }), title: "Site" }))
    expect(html).toContain('role="status"')
    expect(html).toContain("Loading Site")
    for (const w of Object.values(WELCOME)) expect(html).toContain(w)
    expect(html).toContain("yk-splash__skip")
    expect(splashWordCss(7)).toContain("@keyframes yk-splash-word")
  })

  it("long splash (5.5.1): bar fills over the time, Skip counts down, tips show, safety after time + 5 s", () => {
    const html = renderToStaticMarkup(createElement(YuktaiSplash, { logo: "L", title: "Site", minMs: 15000, tips: ["One", "Two"] }))
    expect(html).toContain("yk-splash--timed")
    expect(html).toContain("--yk-splash-ms:15000ms")
    expect(html).toContain("--yk-splash-safety:20000ms")
    expect(html).toContain("(15)")
    expect(html).toContain("One")
  })

  it("reveal never hides content on the server", () => {
    const html = renderToStaticMarkup(createElement(Reveal, { as: "li", delay: 80, children: "card" }))
    expect(html).toBe('<li class="yk-reveal" style="transition-delay:80ms">card</li>')
  })
})
