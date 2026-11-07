// Layers: base + stack + template + features + hosting, copied in that order (later layers win).
// Text files get {{placeholders}} filled. npm drops dot-files from packages, so templates
// keep them as _gitignore / _github and they are renamed here.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeManifest } from "./manifest.mjs";

const TEMPLATES = join(dirname(fileURLToPath(import.meta.url)), "..", "templates");
const TEXT = new Set([".ts", ".tsx", ".mjs", ".js", ".json", ".css", ".md", ".toml", ".yml", ".yaml", ".rs", ".txt", ".html", ""]);
const RENAME = { _gitignore: ".gitignore", _github: ".github", "_env.example": ".env.example" };

// light text colour, dark text colour, gradient (light), gradient (dark). Text colours are 7:1 or more on their page.
export const PALETTES = {
  // blue is the YuktAI brand colour (the logo tile runs navy #000633 → blue #0053ED)
  blue: { accent: "#0038b4", accentDark: "#93c5fd", grad: "#000633, #0038b4", gradDark: "#93c5fd, #67e8f9", theme: "#000633" },
  violet: { accent: "#4a1fb8", accentDark: "#c4b5fd", grad: "#5b21b6, #1e40af", gradDark: "#c4b5fd, #93c5fd", theme: "#4a1fb8" },
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
  const p = PALETTES[o.accent] ?? PALETTES.blue;
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
    icons: String(o.features.includes("icons")),
    hasLifecycleGuide: String(o.template === "docs"),
    // pages the built-site test expects to find
    pages: JSON.stringify([
      "index.html", "about/index.html", "404.html",
      ...(o.template === "docs" ? ["getting-started/index.html", "configuration/index.html", "lifecycle/index.html", "deploy/index.html"] : []),
      ...(o.features.includes("grid") ? ["grid/index.html"] : []),
      ...(o.features.includes("page-tools") ? ["qa/index.html"] : []),
      ...(o.features.includes("icons") ? ["icons/index.html"] : []),
    ]),
    engine: o.stack === "next-rust" ? "rust" : "ts",
    stackNote: o.stack === "next-rust" ? " + Rust (WebAssembly)" : "",
    // Netlify has rustup but no default toolchain: pick stable, add the WebAssembly target, then build.
    // If Rust can't be set up the build still runs and the app uses its TypeScript fallback.
    netlifyCommand: o.stack === "next-rust" ? '(rustup default stable && rustup target add wasm32-unknown-unknown) || echo \\"Rust not available, using the TypeScript fallback\\"; npm run build' : "npm run build",
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
  writeManifest(dir, o, v.themeColor);
  return count.n + 1;
}
