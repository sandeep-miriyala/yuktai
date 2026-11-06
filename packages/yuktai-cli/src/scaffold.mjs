// Layers: base + stack + template + features + hosting, copied in that order (later layers win).
// Text files get {{placeholders}} filled. npm drops dot-files from packages, so templates
// keep them as _gitignore / _github and they are renamed here.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const TEMPLATES = join(dirname(fileURLToPath(import.meta.url)), "..", "templates");
const TEXT = new Set([".ts", ".tsx", ".mjs", ".js", ".json", ".css", ".md", ".toml", ".yml", ".yaml", ".rs", ".txt", ".html", ""]);
const RENAME = { _gitignore: ".gitignore", _github: ".github", "_env.example": ".env.example" };

// light text colour, dark text colour, gradient (light), gradient (dark). Text colours are 7:1 or more on their page.
export const PALETTES = {
  violet: { accent: "#4a1fb8", accentDark: "#c4b5fd", grad: "#5b21b6, #1e40af", gradDark: "#c4b5fd, #93c5fd", theme: "#4a1fb8" },
  blue: { accent: "#1d3fb8", accentDark: "#93c5fd", grad: "#1e40af, #0e7490", gradDark: "#93c5fd, #67e8f9", theme: "#1e40af" },
  teal: { accent: "#0f5e59", accentDark: "#5eead4", grad: "#0f766e, #1e40af", gradDark: "#5eead4, #93c5fd", theme: "#0f766e" },
  orange: { accent: "#8a3a00", accentDark: "#fdba74", grad: "#9a3412, #b45309", gradDark: "#fdba74, #fcd34d", theme: "#9a3412" },
};

export function layersFor(o) {
  const l = ["base", `stack-${o.stack}`, `template-${o.template}`];
  for (const f of o.features) l.push(`feature-${f}`);
  if (o.host !== "none") l.push(`host-${o.host}`);
  return l.filter((x) => existsSync(join(TEMPLATES, x)));
}

export function values(o) {
  const p = PALETTES[o.accent] ?? PALETTES.violet;
  return {
    name: o.name,
    title: o.title,
    stack: o.stack,
    template: o.template,
    host: o.host,
    accentName: o.accent,
    accent: p.accent,
    accentDark: p.accentDark,
    grad: p.grad,
    gradDark: p.gradDark,
    themeColor: p.theme,
    grid: String(o.features.includes("grid")),
    pageTools: String(o.features.includes("page-tools")),
    engine: o.stack === "next-rust" ? "rust" : "ts",
    stackNote: o.stack === "next-rust" ? " + Rust (WebAssembly)" : "",
    // Netlify: add the WebAssembly target before building when the app has Rust
    netlifyCommand: o.stack === "next-rust" ? "rustup target add wasm32-unknown-unknown && npm run build" : "npm run build",
    cliVersion: o.cliVersion,
  };
}

const fill = (s, v) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in v ? String(v[k]) : m));

function copyLayer(src, dest, v, count) {
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    const to = join(dest, RENAME[entry] ?? entry);
    if (statSync(from).isDirectory()) {
      mkdirSync(to, { recursive: true });
      copyLayer(from, to, v, count);
    } else if (TEXT.has(extname(entry)) || entry.startsWith("_")) {
      writeFileSync(to, fill(readFileSync(from, "utf8"), v));
      count.n++;
    } else {
      cpSync(from, to);
      count.n++;
    }
  }
}

/** Writes the app into dir and returns how many files were written. */
export function scaffold(dir, o) {
  mkdirSync(dir, { recursive: true });
  const v = values(o);
  const count = { n: 0 };
  for (const layer of layersFor(o)) copyLayer(join(TEMPLATES, layer), dir, v, count);
  return count.n;
}
