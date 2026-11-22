import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LANGUAGES, UI_READY, strings } from "../src/locales.js";
import { iconPng } from "../src/lib/png.js";
import { validate, build } from "../src/index.js";
import { startStudio } from "../src/studio.js";

const template = (name) => JSON.parse(readFileSync(new URL(`../templates/${name}.json`, import.meta.url), "utf8"));

test("all 22 scheduled languages + English are supported", () => {
  assert.equal(Object.keys(LANGUAGES).length, 23);
  for (const l of Object.keys(LANGUAGES)) {
    const s = strings(l);
    assert.equal(Object.keys(s).length, Object.keys(strings("en")).length, `${l} has every UI string (own or fallback)`);
  }
  assert.ok(UI_READY.length >= 16);
  assert.equal(LANGUAGES.ur.dir, "rtl");
});

test("PNG icon is a real PNG of the right size", () => {
  const png = iconPng(192, "#7a1f1f");
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(png.readUInt32BE(16), 192);
  assert.equal(png.readUInt32BE(20), 192);
});

test("empty FAQ text is rejected", () => {
  const c = template("wedding");
  c.faq.push({ q: {}, a: { en: "x" } });
  assert.ok(validate(c).some((e) => e.field.startsWith("faq[")));
});

test("all languages build, Urdu page is right-to-left", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  const c = template("naming");
  c.languages = ["ur", ...Object.keys(LANGUAGES).filter((l) => l !== "ur")];
  writeFileSync(join(dir, "naming.json"), JSON.stringify(c));
  await build(dir);
  const html = readFileSync(join(dir, "dist", "index.html"), "utf8");
  assert.match(html, /<html lang="ur" dir="rtl"/);
  assert.match(html, /<select id="lang-select"/);
  const manifest = JSON.parse(readFileSync(join(dir, "dist", "manifest.json"), "utf8"));
  assert.equal(manifest.dir, "rtl");
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
  for (const f of ["icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png"]) assert.ok(existsSync(join(dir, "dist", "icons", f)), f);
});

test("assistant data is embedded safely", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  const c = template("wedding");
  c.faq[0].a.en = "</script><script>alert(1)</script>";
  writeFileSync(join(dir, "event.json"), JSON.stringify(c));
  await build(dir);
  const html = readFileSync(join(dir, "dist", "index.html"), "utf8");
  const data = html.match(/<script type="application\/json" id="shubhalekha-data">([\s\S]*?)<\/script>/)[1];
  assert.ok(!data.includes("</script>"));
  assert.equal(JSON.parse(data).faq[0].a.en, "</script><script>alert(1)</script>");
});

test("studio saves, builds and refuses cross-site posts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  writeFileSync(join(dir, "birthday.json"), JSON.stringify(template("birthday")));
  const server = await startStudio(dir, { port: 0 });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    const blocked = await fetch(`${base}/api/event`, { method: "POST", body: "{}" });
    assert.equal(blocked.status, 403);
    const c = (await (await fetch(`${base}/api/event`)).json()).config;
    c.title.en = "Aadya turns 2";
    const r = await (await fetch(`${base}/api/event`, { method: "POST", body: JSON.stringify(c), headers: { "x-shubhalekha-studio": "1" } })).json();
    assert.equal(r.ok, true);
    assert.match(await (await fetch(`${base}/preview/`)).text(), /Aadya turns 2/);
    const escape = await fetch(`${base}/preview/..%2F..%2Fetc%2Fpasswd`);
    assert.notEqual(escape.status, 200);
  } finally {
    server.close();
  }
});
