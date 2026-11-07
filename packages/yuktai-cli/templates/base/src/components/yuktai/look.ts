// The visitor's own look: a colour and a font, saved in this browser only.
// Any colour is accepted; it is darkened (light theme) or lightened (dark theme)
// until text in it reaches 7:1 (WCAG AAA) on the page background.

export type Look = { color?: string; font?: string; fontName?: string };

const KEY = "yuktai-look";
const STYLE_ID = "yuktai-look";
const LIGHT_BG = "#f7f7fb";
const DARK_BG = "#08081a";
export const TARGET = 7;

export const PRESETS = [
  { name: "Brand blue", color: "#0038b4" },
  { name: "Violet", color: "#4a1fb8" },
  { name: "Teal", color: "#0f5e59" },
  { name: "Green", color: "#065f46" },
  { name: "Saffron", color: "#9a3412" },
  { name: "Crimson", color: "#9f1239" },
];

// Font stacks that need nothing downloaded: each uses fonts most computers and phones already have.
export const FONT_PRESETS = [
  { name: "Default", font: "" },
  { name: "Easy to read (Verdana)", font: 'Verdana, Tahoma, "Noto Sans", sans-serif' },
  { name: "Serif", font: 'Georgia, "Noto Serif", "Times New Roman", serif' },
  { name: "తెలుగు", font: '"Noto Sans Telugu", Gautami, "Nirmala UI", "Telugu Sangam MN", sans-serif' },
  { name: "हिन्दी / देवनागरी", font: '"Noto Sans Devanagari", "Nirmala UI", Mangal, "Kohinoor Devanagari", sans-serif' },
  { name: "தமிழ்", font: '"Noto Sans Tamil", Latha, "Nirmala UI", "Tamil Sangam MN", sans-serif' },
];

// ── colour maths (sRGB, WCAG 2.2) ────────────────────────────────────────────
type RGB = [number, number, number];
const hexToRgb = (h: string): RGB => {
  const x = h.replace("#", "");
  const f = x.length === 3 ? x.split("").map((c) => c + c).join("") : x;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)) as RGB;
};
const rgbToHex = (c: RGB) => "#" + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
const lum = (c: RGB) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(hexToRgb(a)), lum(hexToRgb(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as RGB;

/** Moves the colour toward black (or white) in small steps until it reaches 7:1 on bg. */
export function fit(color: string, bg: string, toward: "black" | "white"): string {
  const end: RGB = toward === "black" ? [0, 0, 0] : [255, 255, 255];
  const start = hexToRgb(color);
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const c = rgbToHex(mix(start, end, t));
    if (contrast(c, bg) >= TARGET) return c;
  }
  return toward === "black" ? "#000000" : "#ffffff";
}

/** The colours used for a chosen colour, with a note when it had to change. */
export function paletteFor(color: string) {
  const light = fit(color, LIGHT_BG, "black");
  const dark = fit(color, DARK_BG, "white");
  // a second stop for gradients: the same colour turned a little toward blue-green
  const light2 = fit(rgbToHex(mix(hexToRgb(light), [14, 116, 144], 0.35)), LIGHT_BG, "black");
  const dark2 = fit(rgbToHex(mix(hexToRgb(dark), [103, 232, 249], 0.35)), DARK_BG, "white");
  return {
    light,
    dark,
    light2,
    dark2,
    changed: light.toLowerCase() !== color.toLowerCase(),
    ratioLight: contrast(light, LIGHT_BG),
    ratioDark: contrast(dark, DARK_BG),
  };
}

/** CSS that overrides the tokens in tokens.css for both themes. */
export function lookCss(look: Look): string {
  let css = "";
  if (look.color) {
    const p = paletteFor(look.color);
    const light = `--accent:${p.light};--accent-solid:${p.light};--grad:linear-gradient(135deg,${p.light},${p.light2});`;
    const dark = `--accent:${p.dark};--accent-solid:${p.light};--grad:linear-gradient(135deg,${p.dark},${p.dark2});`;
    css += `:root{${light}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}:root[data-theme="dark"]{${dark}}`;
  }
  if (look.font) css += `:root{--font:${look.font};}`;
  return css;
}

export function readLook(): Look {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Look;
  } catch {
    return {};
  }
}

export function applyLook(look: Look) {
  const css = lookCss(look);
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
  if (look.color) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", paletteFor(look.color).light);
  try {
    if (look.color || look.font) localStorage.setItem(KEY, JSON.stringify(look));
    else localStorage.removeItem(KEY);
    localStorage.setItem(KEY + "-css", css);
  } catch {}
  document.dispatchEvent(new Event("yuktai:look"));
}

/** Runs before first paint: puts the saved look back with no flash. */
export const LOOK_SCRIPT = `try{var c=localStorage.getItem("${KEY}-css");if(c){var s=document.createElement("style");s.id="${STYLE_ID}";s.textContent=c;document.head.appendChild(s)}}catch(e){}`;

// ── fonts on this computer (Local Font Access API) ───────────────────────────
type LocalFont = { family: string };
type FontWindow = Window & { queryLocalFonts?: () => Promise<LocalFont[]> };

/** Desktop Chrome and Edge only. Phones and tablets, Safari and Firefox don't have it. */
export function canUseLocalFonts() {
  if (typeof window === "undefined" || !("queryLocalFonts" in window) || !window.isSecureContext) return false;
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile) return false;
  return !window.matchMedia("(pointer: coarse)").matches;
}

/** Font family names installed here. Asks the visitor first; the list never leaves the device. */
export async function localFontFamilies(): Promise<string[]> {
  const fonts = await (window as FontWindow).queryLocalFonts!();
  return [...new Set(fonts.map((f) => f.family))].sort((a, b) => a.localeCompare(b));
}
