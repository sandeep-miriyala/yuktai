// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/insights/shortcuts.ts
// Recognises questions that page structure answers better than search:
// "summarize", "what forms are here", "accessibility problems"… in English,
// Telugu and Hindi. Returns null for everything else.
// ─────────────────────────────────────────────────────────────────────────────

import type { PageCheck } from "../types"

export type ShortcutKind = "summary" | "about" | "structure" | "forms" | "images" | "accessibility" | "tables"

const RULES: { kind: ShortcutKind; check?: PageCheck; re: RegExp }[] = [
  { kind: "accessibility", check: "accessibility", re: /(accessib|a11y|wcag|screen ?reader|యాక్సెస|accessibility సమస్య|सुलभता)/i },
  { kind: "forms", check: "forms", re: /(\bforms?\b|\bfields?\b|ఫారం|ఫారమ్|form లో|fields?|ఏవి తప్పనిసరి|फ़ॉर्म|फॉर्म)/i },
  { kind: "images", check: "images", re: /(\bimages?\b|\bphotos?\b|\bpictures?\b|alt text|చిత్రా|ఫోటో|images?|चित्र)/i },
  { kind: "tables", check: "structure", re: /(\btables?\b|పట్టిక|table ఏం)/i },
  { kind: "structure", check: "structure", re: /(\bsections?\b|\bheadings?\b|\boutline\b|\bstructure\b|విభాగాలు|sections?|headings?)/i },
  { kind: "summary", re: /(summar|overview|tl;?dr|key points|main points|సారాంశ|సంక్షిప్త|ముఖ్యమైన points|सारांश)/i },
  { kind: "about", re: /(what is this (page|site)|what does this (site|page) do|what('s| is) this about|about this (page|site)|purpose of this|దేని గురించి|ఈ page ఏమిటి|ఈ site ఏమిటి|ఏం చేస్తుంది|यह पेज किस बारे)/i },
]

export function matchShortcut(question: string, checks: PageCheck[]): ShortcutKind | null {
  const q = question.trim()
  if (q.length > 140) return null // long, specific questions go to search
  const words = q.split(/\s+/).length
  for (const r of RULES) {
    if (r.re.test(q)) {
      // "forms", "images"… inside a long, specific question is about content, not structure
      if (words > 10 && r.kind !== "summary" && r.kind !== "about") return null
      if (r.check && !checks.includes(r.check)) return null
      return r.kind
    }
  }
  return null
}
