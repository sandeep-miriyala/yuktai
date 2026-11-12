// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/gridScripts.ts (v5.7.0)
// Which writing systems the grid's data uses, so the assistant's voice
// language list shows only languages a reader could need here (English is
// always offered).
// ─────────────────────────────────────────────────────────────────────────────

/** Unicode block → the voice languages written in it. */
const SCRIPTS: readonly { from: number; to: number; languages: readonly string[] }[] = [
  { from: 0x0900, to: 0x097f, languages: ["hi-IN", "mr-IN", "ne-IN", "sa-IN", "mai-IN", "kok-IN", "doi-IN", "brx-IN"] }, // Devanagari
  { from: 0x0980, to: 0x09ff, languages: ["bn-IN", "as-IN"] }, // Bengali–Assamese
  { from: 0x0a00, to: 0x0a7f, languages: ["pa-IN"] }, // Gurmukhi
  { from: 0x0a80, to: 0x0aff, languages: ["gu-IN"] }, // Gujarati
  { from: 0x0b00, to: 0x0b7f, languages: ["or-IN"] }, // Odia
  { from: 0x0b80, to: 0x0bff, languages: ["ta-IN"] }, // Tamil
  { from: 0x0c00, to: 0x0c7f, languages: ["te-IN"] }, // Telugu
  { from: 0x0c80, to: 0x0cff, languages: ["kn-IN"] }, // Kannada
  { from: 0x0d00, to: 0x0d7f, languages: ["ml-IN"] }, // Malayalam
  { from: 0x1c50, to: 0x1c7f, languages: ["sat-IN"] }, // Ol Chiki
  { from: 0xabc0, to: 0xabff, languages: ["mni-IN"] }, // Meetei Mayek
  { from: 0x0600, to: 0x06ff, languages: ["ur-IN", "ks-IN", "sd-IN"] }, // Arabic
]

const ALWAYS = ["en-IN", "en-US"]

/**
 * Voice languages for this data: English, plus the languages whose script
 * appears in the first `sample` rows. `keep` (the app's own choice) is never
 * dropped.
 */
export function languagesForData(
  data: readonly Record<string, unknown>[],
  keys: readonly string[],
  keep: readonly (string | undefined)[] = [],
  sample = 500
): Set<string> {
  const out = new Set<string>(ALWAYS)
  for (const k of keep) if (k) out.add(k)
  const seen = new Set<number>()
  const rows = data.length > sample ? data.slice(0, sample) : data
  for (const row of rows) {
    for (const key of keys) {
      const value = row[key]
      if (typeof value !== "string") continue
      for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i)
        if (code < 0x0600) continue
        for (let s = 0; s < SCRIPTS.length; s++) {
          if (!seen.has(s) && code >= SCRIPTS[s].from && code <= SCRIPTS[s].to) {
            seen.add(s)
            for (const lang of SCRIPTS[s].languages) out.add(lang)
          }
        }
      }
    }
    if (seen.size === SCRIPTS.length) break
  }
  return out
}
