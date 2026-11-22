import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validate, build, fontsFor } from "../src/index.js";
import { charsFor, fetchFonts } from "../src/fonts.js";

const template = (name) => JSON.parse(readFileSync(new URL(`../templates/${name}.json`, import.meta.url), "utf8"));

// Google Fonts లాగా జవాబిచ్చే నకిలీ fetch: అడిగిన URL లు గుర్తుంచుకుంటుంది
function fakeFetch(log) {
  return async (url) => {
    log.push(url);
    if (url.startsWith("https://fonts.googleapis.com/css2")) {
      return new Response(`@font-face { font-family: 'X'; font-style: normal; font-weight: 400; font-display: swap; src: url(https://fonts.gstatic.com/l/font?kit=abc) format('woff2'); }`, { status: 200 });
    }
    return new Response(new Uint8Array([119, 79, 70, 50, 1, 2, 3]), { status: 200 });
  };
}

test("every language has fonts to choose from", () => {
  for (const l of ["en", "te", "hi", "ta", "kn", "ml", "bn", "as", "gu", "pa", "or", "ur", "ks", "sd", "mr", "ne", "sa", "kok", "mai", "doi", "brx", "mni", "sat"]) {
    assert.ok(fontsFor(l).length >= 1, l);
  }
});

test("only a listed font for a chosen language is accepted", () => {
  const c = template("wedding");
  c.fonts = { te: "Ramabhadra", en: "Playfair Display" };
  assert.deepEqual(validate(c), []);
  c.fonts = { te: "Comic Sans" };
  assert.ok(validate(c).some((e) => e.field === "fonts.te"));
  c.fonts = { ta: "Noto Sans Tamil" };
  assert.ok(validate(c).some((e) => e.field === "fonts.ta"), "ta is not in languages");
});

test("charsFor keeps only that script's letters and common marks", () => {
  const s = charsFor("telugu", "ప్రియ Priya प्रिया 10:30");
  assert.ok(s.includes("ప") && s.includes("1") && s.includes(":"));
  assert.ok(!s.includes("P") && !s.includes("प"));
});

test("fonts are downloaded for the page's letters only and self-hosted", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sl-font-"));
  const c = template("wedding");
  c.fonts = { te: "Ramabhadra" };
  writeFileSync(join(dir, "wedding.json"), JSON.stringify(c));
  const log = [];
  const r = await build(dir, { fetch: fakeFetch(log) });
  const css2 = log.find((u) => u.includes("css2"));
  assert.ok(css2.includes("family=Ramabhadra"));
  const text = new URL(css2).searchParams.get("text");
  assert.ok(text.includes("ప") && !/[A-Za-z]/.test(text), "Telugu letters only");
  assert.ok(existsSync(join(dir, "dist/fonts/te-ramabhadra.woff2")));
  const html = readFileSync(join(dir, "dist/index.html"), "utf8");
  assert.match(html, /@font-face\{font-family:"SL te";src:url\(fonts\/te-ramabhadra\.woff2\)/);
  assert.match(html, /:lang\(te\)\{--font:"SL te"/);
  assert.ok(!html.includes("fonts.googleapis.com"), "guests never call Google");
  assert.match(readFileSync(join(dir, "dist/sw.js"), "utf8"), /fonts\/te-ramabhadra\.woff2/);
  assert.ok(r.files.includes("fonts/te-ramabhadra.woff2"));
});

test("no internet: the build still works and warns", async () => {
  const r = await fetchFonts({ te: "Ramabhadra" }, "ప్రియ", { fetch: async () => { throw new Error("offline"); } });
  assert.deepEqual(r.files, {});
  assert.match(r.warnings[0], /could not download Ramabhadra/);
  assert.match(r.css, /:lang\(te\)/);
});
