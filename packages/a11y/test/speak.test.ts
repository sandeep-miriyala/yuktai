import { afterEach, describe, expect, it, vi } from "vitest"
import { pickVoice, sentences, speak } from "../src/speak"

const voice = (lang: string, name = lang, localService = true) => ({ lang, name, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice

describe("pickVoice", () => {
  const voices = [voice("en-US"), voice("en-IN"), voice("te-IN"), voice("hi-IN", "hi net", false)]
  it("exact region first, then same language (Indian region first)", () => {
    expect(pickVoice("te-IN", voices)!.lang).toBe("te-IN")
    expect(pickVoice("te", voices)!.lang).toBe("te-IN")
    expect(pickVoice("en", voices)!.lang).toBe("en-IN")
  })
  it("returns null when the device has no voice (never a wrong one)", () => {
    expect(pickVoice("ta", voices)).toBeNull()
  })
})

describe("sentences", () => {
  it("cuts at Telugu, Hindi and English stops", () => {
    expect(sentences("ఒకటి. రెండు! तीन। Four?")).toEqual(["ఒకటి.", "రెండు!", "तीन।", "Four?"])
  })
  it("cuts very long sentences under the limit", () => {
    const long = "word ".repeat(200)
    for (const s of sentences(long, 100)) expect(s.length).toBeLessThanOrEqual(101)
  })
})

describe("speak", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("reads each part with its own voice and reports missing ones", async () => {
    const spoken: { text: string; lang: string }[] = []
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string
      lang = ""
      voice: SpeechSynthesisVoice | null = null
      rate = 1
      onstart: (() => void) | null = null
      onend: (() => void) | null = null
      constructor(t: string) {
        this.text = t
      }
    })
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [voice("te-IN"), voice("en-IN")],
      speak: (u: { text: string; lang: string; onend: (() => void) | null }) => {
        spoken.push({ text: u.text, lang: u.lang })
        u.onend?.()
      },
      cancel: () => {},
      pause: () => {},
      resume: () => {},
    })
    const missing: string[] = []
    await new Promise<void>((done) => {
      speak("వేమన శతకం. Meaning: salt. திருக்குறள்", { lang: "te", onMissingVoice: (l) => missing.push(l), onEnd: () => done() })
    })
    expect(spoken.map((s) => s.lang)).toEqual(["te-IN", "en-IN"])
    expect(missing).toEqual(["ta"])
  })
})

// ── v6.0.1 ─────────────────────────────────────────────────────────────────
import { cleanForSpeech, readableText, readTarget } from "../src/speak"
import { splitByLanguage } from "../src/language"

describe("v6.0.1 read aloud", () => {
  it("does not say emojis, stars, arrows or bullets", () => {
    const t = cleanForSpeech("వనరులు 📖 గురు ★ లఘు • యతి ✅ 👉 చూడండి ❌ → హోమ్ | 👨‍👩‍👧 🇮🇳 1️⃣")
    expect(t).not.toMatch(/[📖★•✅👉❌→|👨🇮1️]/u)
    expect(t).toContain("వనరులు")
    expect(t).toContain("చూడండి")
  })
  it("keeps dates, prices and normal punctuation", () => {
    expect(cleanForSpeech("తేదీ 14/11/2026, ధర ₹250.")).toBe("తేదీ 14/11/2026, ధర ₹250.")
  })
  it("skips hidden text: closed details, display:none, aria-hidden", () => {
    document.body.innerHTML = `<main id="m"><p>కనిపించే వాక్యం</p><details><summary>మరిన్ని</summary><p>దాచిన వాక్యం</p></details><p style="display:none">display none text</p><p aria-hidden="true">aria hidden text</p></main>`
    const t = readableText(document.getElementById("m")!)
    expect(t).toContain("కనిపించే వాక్యం")
    expect(t).toContain("మరిన్ని")
    expect(t).not.toContain("display none")
    expect(t).not.toContain("aria hidden")
  })
  it("ends a sentence at each heading and paragraph", () => {
    document.body.innerHTML = `<main id="m"><h1>Fees</h1><p>Basic course</p></main>`
    expect(readableText(document.getElementById("m")!)).toBe("Fees\nBasic course")
  })
  it("reads <main>, not an article that comes before it", () => {
    document.body.innerHTML = `<article id="ad"><p>Sponsored</p></article><main id="m"><p>${"అసలు content ఇక్కడ ఉంది. ".repeat(6)}</p></main>`
    expect(readTarget(document).el.id).toBe("m")
  })
  it("reads the whole body without menus when <main> is empty", () => {
    document.body.innerHTML = `<nav><a>Home</a></nav><main></main><div id="c"><p>${"content ".repeat(30)}</p></div><footer>footer</footer>`
    const t = readTarget(document)
    expect(t.el).toBe(document.body)
    expect(t.skipChrome).toBe(true)
    expect(readableText(t.el, { skipChrome: true })).not.toMatch(/Home|footer/)
  })
  it("keeps one or two English words inside a Telugu sentence", () => {
    const s = splitByLanguage("ఈ మూసి ఉన్న details లోపలి text చూడండి.", "te")
    expect(s).toHaveLength(1)
    expect(s[0].lang).toBe("te")
  })
  it("still switches for a real English sentence", () => {
    const s = splitByLanguage("ఉప్పు కప్పురంబు.\nMeaning: salt and camphor look alike.", "te")
    expect(s.map((x) => x.lang)).toEqual(["te", "en"])
  })
})
