import { beforeEach, describe, expect, it } from "vitest"
import { annotateLanguages, detectText, pageLanguage, splitByLanguage, undoLanguages } from "../src/language"

describe("detectText", () => {
  it("knows scripts with one language", () => {
    expect(detectText("వేమన శతకం")!.lang).toBe("te")
    expect(detectText("திருக்குறள்")!.lang).toBe("ta")
    expect(detectText("ಕನ್ನಡ ಭಾಷೆ")!.lang).toBe("kn")
  })
  it("guesses shared scripts and says so", () => {
    const d = detectText("नमस्ते दुनिया")!
    expect(d.lang).toBe("hi")
    expect(d.shared).toBe(true)
    expect(detectText("Hello world")!.lang).toBe("en")
  })
  it("ignores digits and punctuation", () => {
    expect(detectText("2026 ₹250 !!")).toBeNull()
  })
})

describe("splitByLanguage", () => {
  it("cuts where the language changes", () => {
    const s = splitByLanguage("ఉప్పు కప్పురంబు. Meaning: salt and camphor.", "te")
    expect(s.map((x) => x.lang)).toEqual(["te", "en"])
  })
  it("keeps Marathi as Marathi on a Marathi page", () => {
    expect(splitByLanguage("नमस्कार", "mr")[0].lang).toBe("mr")
  })
})

describe("annotateLanguages", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("lang")
    document.documentElement.removeAttribute("data-yuktai-lang")
  })

  it("sets <html lang> from the text, and lang on parts in another language", () => {
    document.body.innerHTML = `
      <h1>వేమన శతకం</h1>
      <p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు చూడ చూడ రుచుల జాడ వేరు</p>
      <p id="en">Meaning: salt and camphor look alike</p>
      <p id="num">2026</p>`
    const changes = annotateLanguages(document)
    expect(document.documentElement.getAttribute("lang")).toBe("te")
    expect(document.getElementById("en")!.getAttribute("lang")).toBe("en")
    expect(document.getElementById("num")!.hasAttribute("lang")).toBe(false)
    expect(document.querySelector("h1")!.hasAttribute("lang")).toBe(false) // same as page
    expect(changes.map((c) => c.scope)).toEqual(["page", "part"])
  })

  it("never changes a lang the author wrote", () => {
    document.documentElement.setAttribute("lang", "en")
    document.body.innerHTML = `<p id="a" lang="hi">ఇది తెలుగు</p>`
    annotateLanguages(document)
    expect(document.getElementById("a")!.getAttribute("lang")).toBe("hi")
    expect(document.documentElement.getAttribute("lang")).toBe("en")
  })

  it("skips typing areas and switched-off parts", () => {
    document.documentElement.setAttribute("lang", "en")
    document.body.innerHTML = `<div data-yuktai-a11y="off"><p id="off">తెలుగు వాక్యం ఇక్కడ</p></div><textarea>తెలుగు</textarea>`
    annotateLanguages(document)
    expect(document.getElementById("off")!.hasAttribute("lang")).toBe(false)
  })

  it("adds dir=rtl for Arabic-script parts and undo removes everything", () => {
    document.documentElement.setAttribute("lang", "en")
    document.body.innerHTML = `<p id="u">مرحبا بالعالم</p>`
    annotateLanguages(document)
    const u = document.getElementById("u")!
    expect(u.getAttribute("lang")).toBe("ar")
    expect(u.getAttribute("dir")).toBe("rtl")
    undoLanguages(document)
    expect(u.hasAttribute("lang")).toBe(false)
    expect(u.hasAttribute("dir")).toBe(false)
  })

  it("reports a page whose lang disagrees with its text", () => {
    document.documentElement.setAttribute("lang", "en")
    document.body.innerHTML = `<p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు చూడ చూడ రుచుల జాడ వేరు పురుషులందు పుణ్య పురుషులు వేరయా</p>`
    const p = pageLanguage(document)
    expect(p.mismatch).toBe(true)
    expect(p.detected!.lang).toBe("te")
  })

  it("apply:false plans without touching the page", () => {
    document.body.innerHTML = `<p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు చూడ చూడ</p><p>English words here</p>`
    const plan = annotateLanguages(document, { apply: false })
    expect(plan.length).toBe(2)
    expect(document.documentElement.hasAttribute("lang")).toBe(false)
  })
})
