// Search across every page of this site, in the visitor's browser.
//
// The search page fetches the site's own pages (the service worker keeps them,
// so it works offline too), cuts each page into sections at its h2/h3 headings
// and matches the words typed. Whole words, or the start of a word from three
// letters on ("instal" finds "install"). No spelling guesses, nothing sent anywhere.

export type Section = { page: string; pageTitle: string; heading: string; id: string; text: string };
export type Indexed = Section & { t: string[]; h: string[]; b: string[]; low: string };
export type Part = { text: string; mark: boolean };
export type Hit = Section & { score: number; snippet: Part[] };

const WORD = "\\p{L}\\p{M}\\p{N}";
const SPLIT = new RegExp(`[^${WORD}]+`, "u");

/** Lower-case words; Telugu, Hindi and other scripts keep their vowel signs. */
export const tokenize = (s: string): string[] => s.normalize("NFC").toLowerCase().split(SPLIT).filter(Boolean);

const STOP = new Set([
  "a", "an", "the", "is", "are", "am", "was", "to", "of", "in", "on", "at", "for", "and", "or", "how", "do", "does",
  "i", "can", "what", "it", "my", "me", "with", "by", "be", "this", "that", "which", "there", "any", "you", "your", "we",
]);

/** The words that count. "How do I install it?" → ["install"]. Only small words → keep them. */
export function terms(q: string): string[] {
  const all = tokenize(q);
  const kept = all.filter((w) => !STOP.has(w));
  return [...new Set(kept.length ? kept : all)];
}

const hits = (tokens: string[], term: string): number => {
  let n = 0;
  for (const tok of tokens) if (tok === term || (term.length >= 3 && tok.startsWith(term))) n++;
  return n;
};

export function prepare(sections: Section[]): Indexed[] {
  return sections.map((s) => ({ ...s, t: tokenize(s.pageTitle), h: tokenize(s.heading), b: tokenize(s.text), low: `${s.heading} ${s.text}`.toLowerCase() }));
}

function score(s: Indexed, words: string[], phrase: string): { found: number; score: number } {
  let found = 0;
  let total = 0;
  for (const w of words) {
    const n = Math.min(5, hits(s.b, w)) + 4 * Math.min(2, hits(s.h, w)) + 6 * Math.min(1, hits(s.t, w));
    if (n > 0) found++;
    total += n;
  }
  if (words.length > 1 && phrase && s.low.includes(phrase)) total += 8;
  return { found, score: total };
}

/**
 * Best sections for a question. `all` is false when no section has every word
 * and the list shows sections with some of them. At most `perPage` hits a page.
 */
export function search(index: Indexed[], q: string, limit = 20, perPage = 3): { hits: Hit[]; all: boolean; words: string[] } {
  const words = terms(q);
  if (!words.length) return { hits: [], all: true, words };
  const phrase = q.trim().toLowerCase().replace(/\s+/g, " ");
  const scored = index.map((s, i) => ({ s, i, ...score(s, words, phrase) })).filter((r) => r.found > 0);
  const every = scored.filter((r) => r.found === words.length);
  const all = every.length > 0;
  const pool = (all ? every : scored).map((r) => ({ ...r, score: all ? r.score : (r.score * r.found) / words.length }));
  pool.sort((a, b) => b.score - a.score || a.i - b.i);
  const count = new Map<string, number>();
  const out: Hit[] = [];
  for (const r of pool) {
    const n = count.get(r.s.page) ?? 0;
    if (n >= perPage) continue;
    count.set(r.s.page, n + 1);
    const { page, pageTitle, heading, id, text } = r.s;
    out.push({ page, pageTitle, heading, id, text, score: Math.round(r.score * 10) / 10, snippet: snippet(text || heading, words) });
    if (out.length >= limit) break;
  }
  return { hits: out, all, words };
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** About `size` characters around the first match, with the matched words marked. */
export function snippet(text: string, words: string[], size = 200): Part[] {
  if (!text) return [];
  const alts = words.map((w) => (w.length >= 3 ? `${escape(w)}[${WORD}]*` : `${escape(w)}(?![${WORD}])`)).join("|");
  const re = new RegExp(`(?<![${WORD}])(?:${alts})`, "giu");
  const first = re.exec(text.normalize("NFC"));
  const src = text.normalize("NFC");
  let start = 0;
  if (first && first.index > size / 3) {
    start = src.lastIndexOf(" ", first.index - Math.floor(size / 3));
    start = start < 0 ? 0 : start + 1;
  }
  let end = Math.min(src.length, start + size);
  if (end < src.length) {
    const sp = src.lastIndexOf(" ", end);
    if (sp > start + size / 2) end = sp;
  }
  const win = src.slice(start, end);
  const parts: Part[] = [];
  if (start > 0) parts.push({ text: "… ", mark: false });
  let at = 0;
  re.lastIndex = 0;
  for (let m = re.exec(win); m; m = re.exec(win)) {
    if (m.index > at) parts.push({ text: win.slice(at, m.index), mark: false });
    parts.push({ text: m[0], mark: true });
    at = m.index + m[0].length;
  }
  if (at < win.length) parts.push({ text: win.slice(at), mark: false });
  if (end < src.length) parts.push({ text: " …", mark: false });
  return parts;
}

// ---------- reading a page (browser only) ----------

// Live demos, copy buttons and the menu are not documentation.
const SKIP = ".no-ask, [aria-hidden=true], .demo, .out, [aria-live], script, style, noscript, nav, button, .sr-only, .banner";
const BLOCK = "h2,h3,h4,p,li,td,th,caption,pre,dt,dd,figcaption,blockquote";
const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

/** A parsed page → its sections. The part before the first h2 is the page's own section. */
export function sectionsFrom(doc: Document, page: string, pageTitle: string): Section[] {
  const main = doc.querySelector("main") ?? doc.body;
  if (!main) return [];
  main.querySelectorAll(SKIP).forEach((e) => e.remove());
  const out: Section[] = [];
  let cur: Section = { page, pageTitle, heading: pageTitle, id: "", text: "" };
  const push = () => { if (cur.text || cur.id) out.push(cur); };
  main.querySelectorAll(BLOCK).forEach((el) => {
    const tag = el.tagName;
    if (tag === "H2" || tag === "H3") {
      push();
      cur = { page, pageTitle, heading: clean(el.textContent), id: el.id || "", text: "" };
      return;
    }
    if (el.querySelector(BLOCK)) return; // the blocks inside it carry the words
    const t = clean(el.textContent);
    if (t) cur.text += (cur.text ? " " : "") + t;
  });
  push();
  return out;
}
