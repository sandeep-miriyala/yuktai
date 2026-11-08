import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFlags } from "../src/init.mjs";
import { layersFor, scaffold } from "../src/scaffold.mjs";
import { writePackageJson } from "../src/pkg.mjs";
import { readme } from "../src/readme.mjs";
import { manifest } from "../src/manifest.mjs";
import { FEATURES } from "../src/init.mjs";

const opts = (o = {}) => ({ name: "demo-app", title: "Demo App", stack: "next-rust", template: "starter", features: [], host: "netlify", accent: "blue", cliVersion: "0.1.0", ...o });

test("flags: values, defaults and bad input", () => {
  const o = parseFlags(["my-app", "--stack", "next", "--features", "grid,page-tools", "--host", "github-pages", "-y", "--no-git"]);
  assert.equal(o.name, "my-app");
  assert.equal(o.stack, "next");
  assert.deepEqual(o.features, ["grid", "page-tools"]);
  assert.equal(o.yes, true);
  assert.equal(o.git, false);
  assert.throws(() => parseFlags(["--stack", "angular"]), /--stack must be one of/);
  assert.throws(() => parseFlags(["--features", "chat"]), /not one of/);
  assert.throws(() => parseFlags(["--wat"]), /Unknown option/);
  assert.deepEqual(parseFlags(["--features", "none"]).features, []);
});

test("layers in order, only the ones that exist", () => {
  assert.deepEqual(layersFor(opts({ features: ["grid"], template: "docs" })), ["base", "stack-next-rust", "template-docs", "feature-grid", "host-netlify"]);
  assert.deepEqual(layersFor(opts({ stack: "next", host: "none" })), ["base"]);
});

test("scaffold: files, renamed dot-files, filled settings", () => {
  const dir = mkdtempSync(join(tmpdir(), "yuktai-"));
  try {
    const n = scaffold(dir, opts({ features: ["grid"], host: "github-pages", accent: "teal" }));
    assert.ok(n > 20);
    assert.ok(existsSync(join(dir, ".gitignore")) && !existsSync(join(dir, "_gitignore")));
    assert.ok(existsSync(join(dir, ".github/workflows/deploy.yml")));
    assert.ok(existsSync(join(dir, "rust/src/lib.rs")) && existsSync(join(dir, "src/app/grid/page.tsx")));
    const cfg = readFileSync(join(dir, "yuktai.config.ts"), "utf8");
    assert.match(cfg, /title: "Demo App"/);
    assert.match(cfg, /grid: true/);
    assert.match(cfg, /engine: "rust"/);
    assert.doesNotMatch(cfg, /\{\{\w+\}\}/);
    assert.match(readFileSync(join(dir, "src/styles/tokens.css"), "utf8"), /--accent: #0f5e59/);
    const manifest = JSON.parse(readFileSync(join(dir, "public/manifest.json"), "utf8"));
    assert.equal(manifest.name, "Demo App");
    assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
    assert.ok(existsSync(join(dir, "public/icons/icon-512.png")) && existsSync(join(dir, "src/components/yuktai/Logo.tsx")));
    // GitHub's own ${{ … }} expressions are left alone
    assert.match(readFileSync(join(dir, ".github/workflows/deploy.yml"), "utf8"), /\$\{\{ github\.event\.repository\.name \}\}/);
    writePackageJson(dir, opts());
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    assert.equal(pkg.scripts.build, "yuktai build");
    assert.equal(pkg.dependencies["@yuktishaalaa/yuktai"], "5.5.3");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("everything on (what --yes makes): grid with 25 lakh rows, Python API, QA report, icons, lifecycle, README", () => {
  const dir = mkdtempSync(join(tmpdir(), "yuktai-"));
  try {
    const o = opts({ template: "docs", features: [...FEATURES], host: "none" });
    // --yes: everything on, no hosting files
    assert.deepEqual(layersFor(o), ["base", "stack-next-rust", "template-docs", "feature-grid", "feature-page-tools", "feature-icons", "feature-backend"]);
    scaffold(dir, o);
    assert.ok(!existsSync(join(dir, "netlify.toml")), "no hosting files by default");
    for (const f of ["src/styles/grid.css", "src/styles/qa.css", "src/styles/icons.css", "src/styles/look.css", "src/components/yuktai/LookPicker.tsx", "public/favicon.ico", "public/icons/maskable-192.png", "public/icons/monochrome-512.png"]) assert.ok(existsSync(join(dir, f)), f);
    const grid = readFileSync(join(dir, "src/app/grid/OrdersGrid.tsx"), "utf8");
    for (const want of ["ai={config.grid.assistant}", "voice={config.grid.voice}", "webmcp={config.grid.webmcp}", "customRules={rules}", "onAgentResult"]) assert.ok(grid.includes(want), want);
    const m = manifest(o);
    assert.deepEqual(m.icons.map((i) => i.purpose).filter(Boolean), ["any", "any", "maskable", "maskable", "monochrome"]);
    assert.deepEqual(m.shortcuts.map((s) => s.url), ["./grid/", "./qa/", "./icons/"]);
    assert.equal(m.screenshots.length, 2);
    for (const f of ["src/app/grid/OrdersGrid.tsx", "src/data/orders.ts", "src/app/qa/QaReport.tsx", "src/app/icons/IconGallery.tsx", "src/app/(guides)/lifecycle/page.tsx", "src/components/yuktai/lifecycle.ts"]) assert.ok(existsSync(join(dir, f)), f);
    assert.match(readFileSync(join(dir, "src/data/orders.ts"), "utf8"), /DEFAULT_ROWS = 25_00_000/);
    const cfg = readFileSync(join(dir, "yuktai.config.ts"), "utf8");
    assert.match(cfg, /pageTools: true/);
    assert.match(cfg, /icons: true/);
    assert.match(cfg, /splash: true/);
    assert.match(cfg, /backend: true/);
    for (const f of ["backend/app/main.py", "backend/app/orders.py", "backend/tests/test_api.py", "backend/requirements.txt", "backend/.env.example", "src/app/backend/page.tsx"]) assert.ok(existsSync(join(dir, f)), f);
    writePackageJson(dir, o);
    const pkg2 = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    assert.equal(pkg2.scripts["dev:api"], "yuktai api");
    assert.equal(pkg2.scripts["test:api"], "yuktai api-test");
    assert.match(readFileSync(join(dir, ".gitignore"), "utf8"), /\.venv\//);
    assert.match(cfg, /preferences: true/);
    assert.match(readFileSync(join(dir, "src/app/layout.tsx"), "utf8"), /YuktaiSplash[\s\S]*MOTION_SCRIPT|MOTION_SCRIPT[\s\S]*YuktaiSplash/);
    assert.match(readFileSync(join(dir, "src/data/uiText.ts"), "utf8"), /డేటా గ్రిడ్/);
    const test = readFileSync(join(dir, "tests/build.test.mjs"), "utf8");
    assert.match(test, /"grid\/index.html","qa\/index.html","icons\/index.html"/);
    for (const f of ["src/app/page.tsx", "tests/build.test.mjs"]) assert.doesNotMatch(readFileSync(join(dir, f), "utf8"), /\{\{\w+\}\}/, f);
    const md = readme(o);
    for (const want of ["10 lakh", "## Lifecycle", "onStart", "/qa/", "/icons/", "rustup target add", "Grid AI Assistant", "22 Indian", "Colour and font", "Language and animations", "Loading screen", "Python API (backend/)", "npm run test:api", "--host netlify"]) assert.ok(md.includes(want), want);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Every "@/…" import in a new app must point at a file that the app really has. This catches a
// template file left behind after the file it imports was renamed or removed.
function missingImports(dir) {
  const src = join(dir, "src");
  const files = [];
  const walk = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : /\.(ts|tsx)$/.test(f) && files.push(join(d, f))));
  walk(src);
  const exts = ["", ".ts", ".tsx", ".js", ".mjs", ".css", ".json", "/index.ts", "/index.tsx"];
  const missing = [];
  for (const f of files) {
    for (const m of readFileSync(f, "utf8").matchAll(/(?:from|import)\s+["']@\/([^"']+)["']/g)) {
      if (!exts.some((e) => existsSync(join(src, m[1] + e)))) missing.push(`${f.slice(dir.length + 1)} → @/${m[1]}`);
    }
  }
  return missing;
}

test("every @/ import in a new app resolves (all templates, all features)", () => {
  for (const template of ["docs", "starter"]) {
    for (const stack of ["next-rust", "next"]) {
      const dir = mkdtempSync(join(tmpdir(), "yuktai-imports-"));
      try {
        scaffold(dir, opts({ template, stack, features: [...FEATURES], host: "github-pages" }));
        assert.deepEqual(missingImports(dir), [], `${template}/${stack}`);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  }
});

test("new apps: one settings file and a GitHub Pages workflow", () => {
  const dir = mkdtempSync(join(tmpdir(), "yuktai-cfg-"));
  try {
    scaffold(dir, opts({ host: "github-pages" }));
    for (const n of ["next.config.ts", "next.config.mjs", "next.config.js"]) assert.ok(!existsSync(join(dir, n)), n);
    assert.ok(existsSync(join(dir, "yuktai.config.ts")));
    assert.match(readFileSync(join(dir, ".gitignore"), "utf8"), /^\/next\.config\.mjs$/m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("next.config: made for the run, removed after, the app's own file is kept", async () => {
  const { ensureNextConfig } = await import("../src/nextConfig.mjs");
  const { writeFileSync } = await import("node:fs");
  const dir = mkdtempSync(join(tmpdir(), "yuktai-next-"));
  try {
    const remove = ensureNextConfig(dir);
    assert.match(readFileSync(join(dir, "next.config.mjs"), "utf8"), /output: "export"/);
    remove();
    assert.ok(!existsSync(join(dir, "next.config.mjs")));
    writeFileSync(join(dir, "next.config.ts"), "export default {};\n");
    ensureNextConfig(dir)();
    assert.ok(!existsSync(join(dir, "next.config.mjs")));
    assert.equal(readFileSync(join(dir, "next.config.ts"), "utf8"), "export default {};\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
