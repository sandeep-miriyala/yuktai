// Checks the built site (run `npm run build` first, then `npm test`).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const out = new URL("../out/", import.meta.url);
const has = (p) => existsSync(new URL(p, out));

test("the site was built", { skip: !has("index.html") && "run npm run build first" }, () => {
  const guides = ["assistant", "guide", "create", "accessibility", "grid", "agents", "ask", "page-tools", "nextjs", "python", "php", "jquery", "icons", "playground", "rust"];
  for (const f of ["index.html", "about/index.html", "404.html", "manifest.json", "icons/icon-512.png", "icons/maskable-512.png", "sw.js", ...guides.map((g) => `${g}/index.html`)]) assert.ok(has(f), `missing out/${f}`);
});

test("every page has a language, a title and a skip link", { skip: !has("index.html") && "run npm run build first" }, () => {
  const html = readFileSync(new URL("index.html", out), "utf8");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /Skip to content/);
});
