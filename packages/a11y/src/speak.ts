// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/speak.ts
//
// Read aloud with the browser's own Web Speech (speechSynthesis): no server,
// no key. Text is cut where the language changes, and each part is read with
// a voice for its language (Telugu with te-IN, English with en-IN…). When the
// device has no voice for a part, that part is NOT read with a wrong voice:
// onMissingVoice says which language is missing. Long text is cut into
// sentences, because some browsers stop a single long utterance part way.
// Only starts when called (a click), never on page load (WCAG 1.4.2).
// ─────────────────────────────────────────────────────────────────────────────

import { inheritedLang, isSkipped, primary, splitByLanguage, type Segment } from "./language"

export interface SpeakOptions {
  /** Language to assume where the text gives no clue. Default: the element's `lang`, else the page's, else "en". */
  lang?: string
  /** 0.5–2. Default 1. */
  rate?: number
  /** Called once per language the device cannot speak. */
  onMissingVoice?: (lang: string) => void
  /** Called when everything has been read, or reading stopped. */
  onEnd?: () => void
  /** Called before each part is read. */
  onPart?: (part: Segment, index: number, total: number) => void
}

export interface Speaker {
  pause(): void
  resume(): void
  stop(): void
  readonly parts: Segment[]
}

type Synth = SpeechSynthesis
const synth = (): Synth | null => (typeof globalThis !== "undefined" && (globalThis as { speechSynthesis?: Synth }).speechSynthesis) || null

/** True when this browser can read aloud at all. */
export const canSpeak = () => !!synth() && typeof (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance === "function"

/** The device's voices. Some browsers load them late; waits up to `timeoutMs`. */
export function getVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const s = synth()
  if (!s) return Promise.resolve([])
  const now = s.getVoices()
  if (now.length) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer)
      s.removeEventListener?.("voiceschanged", done)
      resolve(s.getVoices())
    }
    const timer = setTimeout(done, timeoutMs)
    s.addEventListener?.("voiceschanged", done)
  })
}

/**
 * The best voice for a language: exact region ("te-IN"), then the same
 * language in any region ("te"), local voices before network ones. Null when
 * the device has none — then the caller must not read that part.
 */
export function pickVoice(lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const want = lang.toLowerCase().replace("_", "-")
  const p = primary(want)
  const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace("_", "-")
  const rank = (v: SpeechSynthesisVoice) => (v.localService ? 0 : 1)
  const exact = voices.filter((v) => norm(v) === want).sort((a, b) => rank(a) - rank(b))
  if (exact.length) return exact[0]
  // Prefer the Indian region for Indian languages and English.
  const same = voices.filter((v) => primary(norm(v)) === p).sort((a, b) => {
    const ia = norm(a).endsWith("-in") ? 0 : 1
    const ib = norm(b).endsWith("-in") ? 0 : 1
    return ia - ib || rank(a) - rank(b)
  })
  return same[0] ?? null
}

/** Languages the device can read, e.g. ["en", "hi", "te"]. */
export async function speakableLanguages(): Promise<string[]> {
  const voices = await getVoices()
  return Array.from(new Set(voices.map((v) => primary(v.lang)))).sort()
}

/** Cuts text into sentences of at most `max` characters (Telugu, Hindi and English stops). */
export function sentences(text: string, max = 220): string[] {
  const parts = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?।॥\n])\s+/)
  const out: string[] = []
  for (const p of parts) {
    if (!p) continue
    if (p.length <= max) {
      out.push(p)
      continue
    }
    // Very long sentence: cut at commas, then at spaces.
    let rest = p
    while (rest.length > max) {
      let cut = rest.lastIndexOf(",", max)
      if (cut < max / 2) cut = rest.lastIndexOf(" ", max)
      if (cut < max / 3) cut = max
      out.push(rest.slice(0, cut + 1).trim())
      rest = rest.slice(cut + 1)
    }
    if (rest.trim()) out.push(rest.trim())
  }
  return out
}

/** The readable text of an element, without typing areas, code or switched-off parts. */
export function readableText(el: Element): string {
  const doc = el.ownerDocument
  const walker = doc.createTreeWalker(el, 4 /* SHOW_TEXT */)
  let out = ""
  while (walker.nextNode()) {
    const parent = (walker.currentNode as Text).parentElement
    if (!parent || isSkipped(parent) || parent.closest("[data-yuktai-speak='off'],[aria-hidden='true']")) continue
    out += walker.currentNode.textContent + " "
  }
  return out.replace(/\s+/g, " ").trim()
}

/** Reads text (or an element's text) aloud, part by part, each in its own language. */
export function speak(target: string | Element, options: SpeakOptions = {}): Speaker {
  const s = synth()
  const base =
    options.lang ??
    (typeof target === "string" ? "" : inheritedLang(target)) ??
    ""
  const fallback = base || (typeof document !== "undefined" ? document.documentElement.lang : "") || "en"
  const text = typeof target === "string" ? target : readableText(target)
  const parts = splitByLanguage(text, fallback)
  let stopped = false
  const speaker: Speaker = {
    parts,
    pause: () => s?.pause(),
    resume: () => s?.resume(),
    stop: () => {
      stopped = true
      s?.cancel()
      options.onEnd?.()
    },
  }
  if (!s || !canSpeak() || !parts.length) {
    queueMicrotask(() => options.onEnd?.())
    return speaker
  }
  s.cancel()
  getVoices().then((voices) => {
    if (stopped) return
    const missing = new Set<string>()
    const queue: { text: string; voice: SpeechSynthesisVoice; part: Segment; index: number }[] = []
    parts.forEach((part, index) => {
      const voice = pickVoice(part.lang, voices)
      if (!voice) {
        if (!missing.has(primary(part.lang))) {
          missing.add(primary(part.lang))
          options.onMissingVoice?.(part.lang)
        }
        return
      }
      for (const sentence of sentences(part.text)) queue.push({ text: sentence, voice, part, index })
    })
    if (!queue.length) {
      options.onEnd?.()
      return
    }
    let lastPart = -1
    queue.forEach((item, i) => {
      const U = (globalThis as unknown as { SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance }).SpeechSynthesisUtterance
      const u = new U(item.text)
      u.voice = item.voice
      u.lang = item.voice.lang
      u.rate = Math.min(2, Math.max(0.5, options.rate ?? 1))
      u.onstart = () => {
        if (item.index !== lastPart) {
          lastPart = item.index
          options.onPart?.(item.part, item.index, parts.length)
        }
      }
      if (i === queue.length - 1) u.onend = () => !stopped && options.onEnd?.()
      s.speak(u)
    })
  })
  return speaker
}
