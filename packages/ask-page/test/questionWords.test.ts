import { describe, expect, it } from "vitest"
import { keywordQuestion } from "../src/search/questionWords"
import { JsEngine } from "../src/search/jsSearch"
import { MODE_KEYWORD } from "../src/search/engine"

describe("v1.0.1 natural questions", () => {
  it("takes out question words", () => {
    expect(keywordQuestion("గణాలు ఎన్ని?")).toBe("గణాలు")
    expect(keywordQuestion("గురువు అంటే ఏమిటి")).toBe("గురువు ఏమిటి")
    expect(keywordQuestion("कितने गण हैं")).toBe("गण हैं")
  })
  it("keeps the question when only question words are left", () => {
    expect(keywordQuestion("ఎన్ని?")).toBe("ఎన్ని?")
  })
  it("finds the right passage for a natural Telugu question", () => {
    const e = new JsEngine()
    e.addPassages(["ఛందస్సు అంటే పద్యం యొక్క నియమాలు.", "గురువు, లఘువు అనేవి అక్షరాల రకాలు.", "గణాలు ఎనిమిది: య, మ, త, ర, జ, భ, న, స."])
    const top = (q: string) => e.search(keywordQuestion(q), null, MODE_KEYWORD, 1).hits[0]
    expect(top("గణాలు ఎన్ని?").doc).toBe(2)
    expect(top("గణాలు ఎన్ని?").coverage).toBe(1)
    expect(top("గురువు అంటే ఏమిటి").doc).toBe(1)
  })
})
