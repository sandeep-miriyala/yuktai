import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFlags } from "../src/init.mjs";
import { layersFor, scaffold } from "../src/scaffold.mjs";
import { writePackageJson } from "../src/pkg.mjs";
import { readme } from "../src/readme.mjs";
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
    assert.equal(pkg.dependencies["@yuktishaalaa/yuktai"], "5.3.13");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("everything on (what --yes makes): grid with 10 lakh rows, QA report, icons, lifecycle, README", () => {
  const dir = mkdtempSync(join(tmpdir(), "yuktai-"));
  try {
    const o = opts({ template: "docs", features: [...FEATURES] });
    assert.deepEqual(layersFor(o), ["base", "stack-next-rust", "template-docs", "feature-grid", "feature-page-tools", "feature-icons", "host-netlify"]);
    scaffold(dir, o);
    for (const f of ["src/app/grid/OrdersGrid.tsx", "src/data/orders.ts", "src/app/qa/QaReport.tsx", "src/app/icons/IconGallery.tsx", "src/app/(guides)/lifecycle/page.tsx", "src/components/yuktai/lifecycle.ts"]) assert.ok(existsSync(join(dir, f)), f);
    assert.match(readFileSync(join(dir, "src/data/orders.ts"), "utf8"), /DEFAULT_ROWS = 10_00_000/);
    const cfg = readFileSync(join(dir, "yuktai.config.ts"), "utf8");
    assert.match(cfg, /pageTools: true/);
    assert.match(cfg, /icons: true/);
    const test = readFileSync(join(dir, "tests/build.test.mjs"), "utf8");
    assert.match(test, /"grid\/index.html","qa\/index.html","icons\/index.html"/);
    for (const f of ["src/app/page.tsx", "tests/build.test.mjs"]) assert.doesNotMatch(readFileSync(join(dir, f), "utf8"), /\{\{\w+\}\}/, f);
    const md = readme(o);
    for (const want of ["10 lakh", "## Lifecycle", "onStart", "/qa/", "/icons/", "rustup target add", "Netlify"]) assert.ok(md.includes(want), want);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
