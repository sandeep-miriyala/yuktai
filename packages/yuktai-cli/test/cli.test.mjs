import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFlags } from "../src/init.mjs";
import { layersFor, scaffold } from "../src/scaffold.mjs";
import { writePackageJson } from "../src/pkg.mjs";

const opts = (o = {}) => ({ name: "demo-app", title: "Demo App", stack: "next-rust", template: "starter", features: [], host: "netlify", accent: "violet", cliVersion: "0.1.0", ...o });

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
    // GitHub's own ${{ … }} expressions are left alone
    assert.match(readFileSync(join(dir, ".github/workflows/deploy.yml"), "utf8"), /\$\{\{ github\.event\.repository\.name \}\}/);
    writePackageJson(dir, opts());
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    assert.equal(pkg.scripts.build, "yuktai build");
    assert.equal(pkg.dependencies["@yuktishaalaa/yuktai"], "5.3.12");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
