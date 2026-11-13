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
