import { describe, expect, it } from "vitest"
import { crossLanguageHint, pageScriptLang } from "../src/search/crossLanguage"

describe("cross-language hint (A3)", () => {
  it("English question on a Telugu page in Fast mode: hint, with Balanced when offered", () => {
    document.body.innerHTML = `<main><p>ఛందస్సులో గణాలు ఎనిమిది. య, మ, త, ర, జ, భ, న, స అనేవి గణాలు. ప్రతి గణంలో మూడు అక్షరాలు ఉంటాయి.</p></main>`
    expect(pageScriptLang(document)).toBe("te")
    expect(crossLanguageHint("How many ganas are there?", document, "fast", ["fast", "balanced"])).toEqual({ asked: "en", page: "te", balanced: true })
    expect(crossLanguageHint("How many ganas?", document, "fast", ["fast"])!.balanced).toBe(false)
  })

  it("no hint for the same language, or in Balanced mode", () => {
    document.body.innerHTML = `<main><p>ఛందస్సులో గణాలు ఎనిమిది. య, మ, త, ర, జ, భ, న, స అనేవి గణాలు.</p></main>`
    expect(crossLanguageHint("గణాలు ఎన్ని?", document, "fast", ["fast", "balanced"])).toBeNull()
    expect(crossLanguageHint("How many ganas?", document, "balanced", ["fast", "balanced"])).toBeNull()
  })
})
