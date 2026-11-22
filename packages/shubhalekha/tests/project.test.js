import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { build, findConfig } from "../src/build.js";

const CLI = new URL("../bin/shubhalekha.js", import.meta.url).pathname;
const run = (...args) => execFileSync(process.execPath, [CLI, ...args], { encoding: "utf8" });

test("init makes the folder layout a developer expects", () => {
  const root = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  const dir = join(root, "our-wedding");
  run("init", dir, "--type", "wedding");
  for (const f of ["wedding.json", "photos", "package.json", ".gitignore", "README.md"]) assert.ok(existsSync(join(dir, f)), f);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  assert.equal(pkg.scripts.build, "shubhalekha build");
  assert.ok(pkg.devDependencies["@yuktishaalaa/shubhalekha"]);
  assert.throws(() => run("init", dir, "--type", "wedding"));
});

test("build makes dist exactly like the plan: html, ics, og.jpg, album-qr.png, img/", async () => {
  const root = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  const dir = join(root, "our-wedding");
  run("init", dir, "--type", "wedding");
  // 3000×2000 పెద్ద ఫోటో, invitation card
  await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#a0522d" } }).jpeg().toFile(join(dir, "photos", "couple.jpg"));
  await sharp({ create: { width: 1200, height: 1600, channels: 3, background: "#f0c040" } }).jpeg().toFile(join(dir, "photos", "invite-1.jpg"));
  const out = run("build", dir);
  assert.match(out, /wedding\.json/);
  const d = join(dir, "dist");
  for (const f of ["index.html", "app.js", "style.css", "sw.js", "manifest.json", "wedding.ics", "og.jpg", "album-qr.png", "site-qr.png", "img/couple.webp", "img/invite-1.webp"]) {
    assert.ok(existsSync(join(d, f)), f);
  }
  const og = await sharp(join(d, "og.jpg")).metadata();
  assert.equal(og.width, 1200);
  assert.equal(og.height, 630);
  const img = await sharp(join(d, "img/couple.webp")).metadata();
  assert.equal(img.width, 1600);
  assert.ok(statSync(join(d, "img/couple.webp")).size < statSync(join(dir, "photos/couple.jpg")).size);
  const html = readFileSync(join(d, "index.html"), "utf8");
  assert.match(html, /src="img\/couple\.webp"/);
  assert.match(html, /og:image" content="https:\/\/example\.com\/og\.jpg"/);
  assert.match(html, /href="wedding\.ics"/);
  assert.match(html, /src="album-qr\.png"/);
  assert.match(readFileSync(join(d, "sw.js"), "utf8"), /img\/couple\.webp/);
});

test("missing photo is a warning, not a crash", async () => {
  const root = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  const dir = join(root, "x");
  run("init", dir, "--type", "wedding");
  const r = await build(dir);
  assert.ok(r.warnings.some((w) => w.includes("photos/couple.jpg")));
});

test("findConfig picks the one event file and ignores package.json", () => {
  const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  writeFileSync(join(dir, "package.json"), "{}");
  writeFileSync(join(dir, "upanayanam.json"), "{}");
  assert.ok(findConfig(dir).endsWith("upanayanam.json"));
  writeFileSync(join(dir, "puja.json"), "{}");
  assert.throws(() => findConfig(dir), /More than one/);
});
