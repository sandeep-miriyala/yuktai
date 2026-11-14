// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/search/questionWords.ts (v1.0.1)
//
// People ask "గణాలు ఎన్ని?", not "గణాలు". Words that only make a sentence a
// question (ఎన్ని, ఎంత, అంటే, ఉన్నాయా…) were counted as words the answer must
// contain, so a page that plainly says "గణాలు ఎనిమిది" got "no answer", and
// "గురువు అంటే ఏమిటి" matched any sentence with "అంటే". They are taken out
// here, before the keyword search, so the Rust (WebAssembly) and TypeScript
// engines get the same cleaned question. The meaning-based (vector) search
// still sees the whole question.
// ─────────────────────────────────────────────────────────────────────────────

import { tokenize } from "./jsSearch"

const QUESTION_WORDS = new Set([
  // Telugu
  "ఎన్ని", "ఎంత", "ఎంతో", "ఎన్నో", "ఎన్నిటి", "ఏవి", "ఏవో", "ఏంటి", "ఏమిటంటే", "ఏయే", "ఏమైనా", "ఎవరి", "ఎవరికి",
  "ఎక్కడి", "ఎక్కడికి", "ఎప్పటి", "ఎప్పటికి", "ఏలా", "అంటే", "అనగా", "అనేది", "అనేవి", "అని", "అంటారు", "అంటాము",
  "ఉన్నాయా", "ఉంటాయా", "ఉంటుందా", "ఉన్నది", "ఉన్నవి", "వున్నాయి", "వుంది", "అవుతాయి", "అవుతుందా",
  "చెప్పగలరా", "చెప్పగలవా", "తెలుసా", "తెలియజేయండి", "వివరించండి", "వివరించు", "ఇవ్వండి", "చూపించు", "చూపించండి",
  "నాకు", "మాకు", "దయచేసి", "కూడా", "ఇక్కడ", "అక్కడ", "ఏమిటి?",
  // Hindi
  "कितने", "कितना", "कितनी", "कौन", "कौनसा", "कौनसी", "कहाँ", "कहां", "कब", "क्यों", "बताइए", "बताओ", "बताएं",
  "होता", "होती", "होते", "हो", "था", "थी", "थे", "से", "को", "पर", "मतलब", "अर्थ",
])

/**
 * The question without words that only make it a question. Returns the
 * original text when nothing would be left.
 */
export function keywordQuestion(question: string): string {
  const kept = tokenize(question).filter((t) => !QUESTION_WORDS.has(t))
  return kept.length ? kept.join(" ") : question
}

export const isQuestionWord = (w: string) => QUESTION_WORDS.has(w)
