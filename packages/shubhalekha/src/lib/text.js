// బహుభాషా text: విలువ "సాధారణ string" లేదా { en: "...", te: "..." } కావచ్చు.
// ప్రతి భాషకు <span lang data-l> వస్తుంది; ఏది కనిపించాలో CSS (html[data-lang]) నిర్ణయిస్తుంది.
import { LANGUAGES } from "../locales.js";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** ఒక భాషలో విలువ: ఆ భాష లేకపోతే మొదటి భాష, అదీ లేకపోతే ఏదైనా */
export function pick(value, lang, langs = []) {
  if (value == null) return "";
  if (typeof value !== "object") return String(value);
  return value[lang] ?? value[langs[0]] ?? Object.values(value)[0] ?? "";
}

const dirAttr = (l) => (LANGUAGES[l]?.dir === "rtl" ? ' dir="rtl"' : "");

/** HTML: ఒకే భాష అయితే సాదా text, లేకపోతే ప్రతి భాషకు ఒక span */
export function t(value, langs) {
  if (value == null || value === "") return "";
  if (typeof value !== "object") return esc(value);
  const present = langs.filter((l) => value[l] != null && value[l] !== "");
  if (present.length === 0) return esc(pick(value, langs[0], langs));
  if (present.length === 1 && present[0] === langs[0]) return esc(value[langs[0]]);
  // ఒక భాషలోనే ఉంటే అది అన్ని భాషల్లోనూ కనిపించాలి (ఉదా: పేరు English లో మాత్రమే ఇస్తే)
  if (present.length === 1) return `<span lang="${present[0]}"${dirAttr(present[0])}>${esc(value[present[0]])}</span>`;
  // ఇచ్చిన భాషలకు span; ఇవ్వని భాషల్లో మొదటి భాష విలువ చూపాలి
  const missing = langs.filter((l) => !present.includes(l));
  const base = present.includes(langs[0]) ? langs[0] : present[0];
  return present.map((l) => {
    const also = l === base ? missing.map((m) => ` data-l-${m}`).join("") : "";
    return `<span lang="${l}"${dirAttr(l)} data-l="${l}"${also}>${esc(value[l])}</span>`;
  }).join("");
}

/** Attribute కోసం (alt, aria-label): ఒక్క భాష మాత్రమే (మొదటిది) */
export const attr = (value, langs) => esc(pick(value, langs[0], langs));
