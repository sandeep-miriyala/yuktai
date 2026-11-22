// భాషకు నచ్చిన font: config.fonts = { te: "Ramabhadra", en: "Playfair Display" }.
// Build సమయంలో Google Fonts నుంచి పత్రికలో వాడిన అక్షరాలకు మాత్రమే (text=) font తెచ్చి
// dist/fonts/ లో పెడుతుంది. అతిథుల phone Google కి ఏమీ అడగదు, offline లోనూ పనిచేస్తుంది.

/** లిపి → పేరున్న Google Fonts (మొదటిది సురక్షితమైన default) */
export const FONTS = {
  latin: ["Inter", "Poppins", "Lora", "Playfair Display", "Cormorant Garamond", "Great Vibes"],
  telugu: ["Noto Sans Telugu", "Noto Serif Telugu", "Ramabhadra", "Mandali", "NTR", "Gidugu", "Gurajada", "Suranna", "Tenali Ramakrishna", "Ramaraja", "Mallanna", "Peddana", "Sree Krushnadevaraya", "Timmana", "Hind Guntur", "Anek Telugu"],
  devanagari: ["Noto Sans Devanagari", "Noto Serif Devanagari", "Hind", "Mukta", "Tiro Devanagari Hindi", "Kalam", "Martel", "Baloo 2", "Rozha One", "Yatra One", "Amita", "Laila", "Khand"],
  bengali: ["Noto Sans Bengali", "Noto Serif Bengali", "Hind Siliguri", "Baloo Da 2", "Tiro Bangla", "Galada", "Atma", "Anek Bangla"],
  gurmukhi: ["Noto Sans Gurmukhi", "Noto Serif Gurmukhi", "Mukta Mahee", "Baloo Paaji 2", "Anek Gurmukhi"],
  gujarati: ["Noto Sans Gujarati", "Noto Serif Gujarati", "Hind Vadodara", "Mukta Vaani", "Baloo Bhai 2", "Rasa", "Shrikhand", "Anek Gujarati"],
  oriya: ["Noto Sans Oriya", "Noto Serif Oriya", "Baloo Bhaina 2", "Anek Odia"],
  tamil: ["Noto Sans Tamil", "Noto Serif Tamil", "Mukta Malar", "Catamaran", "Hind Madurai", "Meera Inimai", "Arima", "Baloo Thambi 2", "Anek Tamil"],
  kannada: ["Noto Sans Kannada", "Noto Serif Kannada", "Baloo Tamma 2", "Tiro Kannada", "Anek Kannada", "Hubballi"],
  malayalam: ["Noto Sans Malayalam", "Noto Serif Malayalam", "Manjari", "Gayathri", "Chilanka", "Baloo Chettan 2", "Anek Malayalam"],
  arabic: ["Noto Nastaliq Urdu", "Gulzar", "Noto Naskh Arabic", "Lateef"],
  meetei: ["Noto Sans Meetei Mayek"],
  olchiki: ["Noto Sans Ol Chiki"],
};

/** భాష → లిపి */
export const SCRIPT_OF = {
  en: "latin", te: "telugu", hi: "devanagari", mr: "devanagari", ne: "devanagari", sa: "devanagari",
  kok: "devanagari", mai: "devanagari", doi: "devanagari", brx: "devanagari", bn: "bengali", as: "bengali",
  pa: "gurmukhi", gu: "gujarati", or: "oriya", ta: "tamil", kn: "kannada", ml: "malayalam",
  ur: "arabic", ks: "arabic", sd: "arabic", mni: "meetei", sat: "olchiki",
};

// ప్రతి లిపి అక్షరాల పరిధి. సాధారణ గుర్తులు (అంకెలు, విరామ చిహ్నాలు, ZWJ/ZWNJ, దండ, ₹) అన్నింటికీ.
const RANGES = {
  latin: [[0x20, 0x24f], [0x2000, 0x206f]],
  telugu: [[0xc00, 0xc7f]],
  devanagari: [[0x900, 0x97f], [0xa8e0, 0xa8ff], [0x1cd0, 0x1cff]],
  bengali: [[0x980, 0x9ff]],
  gurmukhi: [[0xa00, 0xa7f]],
  gujarati: [[0xa80, 0xaff]],
  oriya: [[0xb00, 0xb7f]],
  tamil: [[0xb80, 0xbff]],
  kannada: [[0xc80, 0xcff]],
  malayalam: [[0xd00, 0xd7f]],
  arabic: [[0x600, 0x6ff], [0x750, 0x77f], [0xfb50, 0xfdff], [0xfe70, 0xfeff]],
  meetei: [[0xabc0, 0xabff], [0xaae0, 0xaaff]],
  olchiki: [[0x1c50, 0x1c7f]],
};
const COMMON = [[0x20, 0x40], [0x5b, 0x60], [0x7b, 0x7e], [0x200c, 0x200d], [0x964, 0x965], [0x20b9, 0x20b9]];

export const fontsFor = (lang) => FONTS[SCRIPT_OF[lang]] ?? [];

/** config.fonts సరిచూపు: తెలిసిన భాష, ఆ లిపి జాబితాలోని font మాత్రమే */
export function fontErrors(fonts, languages) {
  if (fonts == null) return [];
  if (typeof fonts !== "object" || Array.isArray(fonts)) return [{ field: "fonts", en: 'fonts must look like { "te": "Ramabhadra" }', te: "fonts రూపం తప్పు" }];
  const out = [];
  for (const [l, fam] of Object.entries(fonts)) {
    if (!languages.includes(l)) out.push({ field: `fonts.${l}`, en: `"${l}" is not in languages`, te: `"${l}" languages లో లేదు` });
    else if (!fontsFor(l).includes(fam)) out.push({ field: `fonts.${l}`, en: `Pick one of: ${fontsFor(l).join(", ")}`, te: "ఈ భాషకు జాబితాలోని font ఎంచుకోండి" });
  }
  return out;
}

/** text లో ఆ లిపికి చెందిన అక్షరాలు మాత్రమే (Google Fonts text= కోసం) */
export function charsFor(script, text) {
  const ranges = [...(RANGES[script] ?? []), ...COMMON];
  const set = new Set();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (ranges.some(([a, b]) => cp >= a && cp <= b)) set.add(ch);
  }
  return [...set].sort().join("");
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
// woff2 ఇచ్చేలా ఆధునిక browser లాగా అడగాలి
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

/**
 * ఎంచుకున్న fonts ను తెచ్చి { files: {"fonts/x.woff2": Buffer}, css, warnings } ఇస్తుంది.
 * Internet లేకపోయినా build ఆగదు: warning మాత్రమే, పత్రిక phone లోని font తో వస్తుంది.
 */
export async function fetchFonts(fonts, pageText, { fetch: f = globalThis.fetch } = {}) {
  const files = {};
  const css = [];
  const warnings = [];
  for (const [lang, family] of Object.entries(fonts ?? {})) {
    const script = SCRIPT_OF[lang];
    const text = charsFor(script, pageText);
    const name = `SL ${lang}`;
    const stack = `"${name}", "${family}", var(--base-font)`;
    const rule = `:lang(${lang}){--font:${stack};--display:${stack}}`;
    try {
      const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}&display=swap&text=${encodeURIComponent(text)}`;
      const res = await f(url, { headers: { "user-agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const sheet = await res.text();
      const m = sheet.match(/url\(([^)]+)\)\s*format\(['"]?(woff2|woff|truetype)['"]?\)/);
      if (!m) throw new Error("no font file in the reply");
      const fontRes = await f(m[1].replace(/['"]/g, ""), { headers: { "user-agent": UA } });
      if (!fontRes.ok) throw new Error(`HTTP ${fontRes.status}`);
      const ext = { woff2: "woff2", woff: "woff", truetype: "ttf" }[m[2]];
      const file = `fonts/${lang}-${slug(family)}.${ext}`;
      files[file] = Buffer.from(await fontRes.arrayBuffer());
      css.push(`@font-face{font-family:"${name}";src:url(${file}) format("${m[2]}");font-display:swap}`);
    } catch (e) {
      warnings.push(`fonts.${lang}: could not download ${family} (${e.message}). The phone's own font is used`);
    }
    css.push(rule);
  }
  return { files, css: css.join("\n"), warnings };
}
