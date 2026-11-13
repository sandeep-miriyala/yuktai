// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/speakButtons.ts
// data-yuktai-speak="on": a 🔊 button after each heading (h1–h3) that reads the
// heading and the text under it, each part in its own language. A real
// <button> with a name in the page's language; press again to stop.
// ─────────────────────────────────────────────────────────────────────────────

import { inheritedLang, primary } from "./language"
import { canSpeak, speak, type Speaker } from "./speak"

const LABELS: Record<string, { read: string; stop: string; noVoice: string }> = {
  en: { read: "Read aloud", stop: "Stop reading", noVoice: "This device has no voice for" },
  te: { read: "చదివి వినిపించు", stop: "చదవడం ఆపు", noVoice: "ఈ device లో voice లేదు:" },
  hi: { read: "पढ़कर सुनाएँ", stop: "पढ़ना बंद करें", noVoice: "इस डिवाइस में आवाज़ नहीं है:" },
}

const ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>'

/** The heading plus the content until the next heading of the same or a higher level. */
function section(h: Element): Element[] {
  const level = Number(h.tagName[1])
  const out: Element[] = [h]
  let n = h.nextElementSibling
  while (n) {
    if (/^H[1-6]$/.test(n.tagName) && Number(n.tagName[1]) <= level) break
    if (!n.hasAttribute("data-yuktai-ui")) out.push(n)
    n = n.nextElementSibling
  }
  return out
}

export interface SpeakButtonsOptions {
  /** Called when a language has no voice on this device. */
  onMissingVoice?: (lang: string, message: string) => void
}

/** Adds the buttons; returns a function that removes them. */
export function addSpeakButtons(doc: Document, opts: SpeakButtonsOptions = {}): () => void {
  if (!canSpeak()) return () => {}
  let current: { speaker: Speaker; button: HTMLButtonElement } | null = null
  const added: HTMLButtonElement[] = []
  const stopCurrent = () => {
    if (!current) return
    const { speaker, button } = current
    current = null
    speaker.stop()
    setState(button, false)
  }
  const setState = (b: HTMLButtonElement, on: boolean) => {
    const t = LABELS[primary(b.dataset.lang ?? "en")] ?? LABELS.en
    b.setAttribute("aria-pressed", on ? "true" : "false")
    b.setAttribute("aria-label", `${on ? t.stop : t.read}: ${b.dataset.title}`)
  }
  doc.querySelectorAll("h1,h2,h3").forEach((h) => {
    if (h.closest("[data-yuktai-speak='off'],[data-yuktai-a11y='off'],[data-yuktai-ui],[hidden]")) return
    if (h.nextElementSibling?.hasAttribute("data-yuktai-speak-button")) return
    const title = (h.textContent ?? "").replace(/\s+/g, " ").trim()
    if (!title) return
    const b = doc.createElement("button")
    b.type = "button"
    b.innerHTML = ICON
    b.setAttribute("data-yuktai-ui", "")
    b.setAttribute("data-yuktai-speak-button", "")
    b.dataset.title = title.slice(0, 80)
    b.dataset.lang = inheritedLang(h) || "en"
    b.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;margin:4px 0;border-radius:999px;border:1px solid #C9CBD3;background:#FFFFFF;color:#2F43C4;cursor:pointer;vertical-align:middle"
    setState(b, false)
    b.addEventListener("click", () => {
      if (current?.button === b) return stopCurrent()
      stopCurrent()
      const parts = section(h)
      const holder = doc.createElement("div")
      for (const p of parts) holder.appendChild(p.cloneNode(true))
      holder.setAttribute("lang", inheritedLang(h) || doc.documentElement.lang || "en")
      const speaker = speak(holder, {
        lang: holder.getAttribute("lang") ?? undefined,
        onMissingVoice: (lang) => {
          const t = LABELS[primary(b.dataset.lang ?? "en")] ?? LABELS.en
          opts.onMissingVoice?.(lang, `${t.noVoice} ${lang}`)
        },
        onEnd: () => {
          if (current?.button === b) {
            current = null
            setState(b, false)
          }
        },
      })
      current = { speaker, button: b }
      setState(b, true)
    })
    h.insertAdjacentElement("afterend", b)
    added.push(b)
  })
  return () => {
    stopCurrent()
    added.forEach((b) => b.remove())
  }
}
