// yuktai init: questions → layers → package.json → install → git.
import { existsSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { runSync } from "./proc.mjs";
import { scaffold } from "./scaffold.mjs";
import { writePackageJson } from "./pkg.mjs";
import { writeReadme } from "./readme.mjs";
import { c, step, info, warn, text, choose, chooseMany, closePrompts } from "./ui.mjs";

export const STACKS = ["next-rust", "next"];
export const TEMPLATES = ["docs", "starter"];
export const FEATURES = ["grid", "page-tools", "icons"];
export const HOSTS = ["none", "netlify", "github-pages"];
export const ACCENTS = ["blue", "violet", "teal", "orange"];

export function parseFlags(args) {
  const o = { name: undefined, yes: false, install: true, git: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const val = () => {
      const v = args[++i];
      if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--yes" || a === "-y") o.yes = true;
    else if (a === "--no-install") o.install = false;
    else if (a === "--no-git") o.git = false;
    else if (a === "--stack") o.stack = val();
    else if (a === "--template") o.template = val();
    else if (a === "--features") { const v = val(); o.features = v === "none" ? [] : v.split(",").map((s) => s.trim()).filter(Boolean); }
    else if (a === "--host") o.host = val();
    else if (a === "--accent") o.accent = val();
    else if (a === "--title") o.title = val();
    else if (a.startsWith("-")) throw new Error(`Unknown option ${a}`);
    else if (!o.name) o.name = a;
    else throw new Error(`Unexpected "${a}"`);
  }
  const bad = (what, v, list) => { if (v !== undefined && !list.includes(v)) throw new Error(`--${what} must be one of: ${list.join(", ")}`); };
  bad("stack", o.stack, STACKS); bad("template", o.template, TEMPLATES); bad("host", o.host, HOSTS); bad("accent", o.accent, ACCENTS);
  for (const f of o.features ?? []) if (!FEATURES.includes(f)) throw new Error(`--features: "${f}" is not one of ${FEATURES.join(", ")}`);
  return o;
}

const validName = (n) => /^[a-z0-9][a-z0-9._-]*$/.test(n) && n.length <= 214;
const toTitle = (n) => n.replace(/[-_.]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export async function init(args, cliVersion) {
  const o = parseFlags(args);
  const interactive = !o.yes && process.stdin.isTTY;
  console.log(`\n  🙏 ${c.bold("YuktAI")}: accessible, AI-in-the-browser apps\n`);

  try {
    // node version (Next.js 16 needs 20.9 or newer)
    const [maj, min] = process.versions.node.split(".").map(Number);
    if (maj < 20 || (maj === 20 && min < 9)) throw new Error(`Node.js 20.9 or newer is needed (you have ${process.versions.node}).`);

    let name = o.name ?? (interactive ? await text("Project name", "my-app") : "my-app");
    name = name.trim();
    if (!validName(name)) throw new Error(`"${name}" can't be a folder and package name. Use lower case letters, numbers, - . _`);
    const dir = resolve(process.cwd(), name);
    if (existsSync(dir) && readdirSync(dir).length) throw new Error(`The folder "${name}" already has files in it. Pick another name or empty it.`);

    const opts = {
      name,
      title: o.title ?? (interactive && !o.yes ? await text("Site title", toTitle(basename(name))) : toTitle(basename(name))),
      stack: o.stack ?? (interactive ? await choose("Stack", [
        { value: "next-rust", label: "Next.js + Rust 🦀", hint: "recommended: Rust compiled to WebAssembly for fast work" },
        { value: "next", label: "Next.js only", hint: "no Rust toolchain needed" },
      ]) : "next-rust"),
      template: o.template ?? (interactive ? await choose("Template", [
        { value: "docs", label: "Docs site", hint: "recommended: home, guides with a sidebar, lifecycle guide" },
        { value: "starter", label: "Starter", hint: "home + about only" },
      ]) : "docs"),
      features: o.features ?? (interactive ? await chooseMany("Features (Ask this page, accessibility widget and PWA are always on)", [
        { value: "grid", label: "Data grid", hint: "10 lakh (1,000,000) sample rows, search, sort, Rust engine" },
        { value: "page-tools", label: "QA report", hint: "15 WCAG checks, Markdown report, 🛠 page tools" },
        { value: "icons", label: "Icons guide", hint: "every YuktAI icon, search, copy the code" },
      ]) : [...FEATURES]),
      host: o.host ?? (interactive ? await choose("Hosting", [
        { value: "none", label: "Decide later", hint: "recommended: no hosting files; any static host works" },
        { value: "netlify", label: "Netlify", hint: "adds netlify.toml" },
        { value: "github-pages", label: "GitHub Pages", hint: "adds a GitHub Action" },
      ]) : "none"),
      accent: o.accent ?? (interactive ? await choose("Theme colour", ACCENTS.map((a) => ({ value: a, label: a[0].toUpperCase() + a.slice(1) }))) : "blue"),
      cliVersion,
    };
    closePrompts();
    console.log();

    if (opts.stack === "next-rust") {
      const cargo = runSync("cargo", ["--version"], { stdio: "ignore" });
      if (cargo.status !== 0) warn(`Rust is not installed. The app works without it (TypeScript fallback). To build the Rust part: ${c.cyan("https://rustup.rs")}, then ${c.cyan("rustup target add wasm32-unknown-unknown")}`);
    }

    const files = scaffold(dir, opts);
    writePackageJson(dir, opts);
    writeReadme(dir, opts);
    step(`Created ${c.bold(name)} (${files} files): ${opts.stack}, ${opts.template}${opts.features.length ? ", " + opts.features.join(", ") : ""}, ${opts.host}`);

    if (o.install) {
      info("Installing packages (a minute or two)…");
      const r = runSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: dir, stdio: "inherit" });
      if (r.status === 0) step("Installed packages");
      else warn(`npm install did not finish. Run it yourself: cd ${name} → npm install`);
    }
    if (o.git) {
      const g = (a) => runSync("git", a, { cwd: dir, stdio: "ignore" });
      if (g(["init", "-b", "main"]).status === 0 && g(["add", "-A"]).status === 0 && g(["commit", "-m", "Create app with yuktai " + cliVersion]).status === 0) step("Started a git repository");
    }

    console.log(`
  ${c.bold("Next")}
    cd ${name}
    ${o.install ? "" : "npm install\n    "}npm run dev        → http://localhost:3000
${opts.features.includes("grid") ? "                       → /grid/  10 lakh rows\n" : ""}${opts.features.includes("page-tools") ? "                       → /qa/    QA report\n" : ""}${opts.features.includes("icons") ? "                       → /icons/ every icon\n" : ""}
  Settings: ${c.cyan("yuktai.config.ts")}   ·   Guide: README.md   ·   Docs: https://yuktaidocs.netlify.app
`);
  } finally {
    closePrompts();
  }
}
