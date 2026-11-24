// Site search (src/lib/search.ts): whole words or the start of a word, never spelling guesses.
import { test } from "node:test";
import assert from "node:assert/strict";
import { prepare, search, snippet, terms, tokenize } from "../src/lib/search.ts";

const index = prepare([
  { page: "/python/setu/", pageTitle: "Setu for Streamlit", heading: "2. A website with no server", id: "publish", text: "Python runs in the browser and the app opens offline after the first visit." },
  { page: "/python/setu/", pageTitle: "Setu for Streamlit", heading: "Install", id: "install", text: 'pip install "yuktai[setu]" brings Streamlit.' },
  { page: "/shubhalekha/", pageTitle: "Shubhalekha", heading: "Fonts", id: "fonts", text: "తెలుగు fonts: Ramabhadra, Mandali, NTR and more." },
  { page: "/nextjs/", pageTitle: "Next.js setup", heading: "Install", id: "install", text: "npm install @yuktishaalaa/yuktai and add the wrapper." },
  { page: "/about/", pageTitle: "About", heading: "About", id: "", text: "Built in personal time." },
]);

test("questions keep the words that matter", () => {
  assert.deepEqual(terms("How do I install it?"), ["install"]);
  assert.deepEqual(terms("is it"), ["is", "it"]);
  assert.deepEqual(tokenize("తెలుగు fonts, Ramabhadra!"), ["తెలుగు", "fonts", "ramabhadra"]);
});

test("every word must match, title and heading count more", () => {
  const r = search(index, "Can a Streamlit app work offline?");
  assert.equal(r.all, false, "no section has 'work'");
  assert.equal(r.hits[0].id, "publish");
  const s = search(index, "streamlit offline");
  assert.equal(s.all, true);
  assert.deepEqual(s.hits.map((h) => h.id), ["publish"]);
});

test("start of a word from three letters, no spelling guesses", () => {
  assert.deepEqual(search(index, "instal").hits.map((h) => h.page), ["/python/setu/", "/nextjs/"]);
  assert.equal(search(index, "instll").hits.length, 0);
  assert.equal(search(index, "ap").hits.length, 0, "two letters match whole words only (not app)");
});

test("Telugu words are found", () => {
  const r = search(index, "తెలుగు ఫాంట్లు Ramabhadra");
  assert.equal(r.hits[0].page, "/shubhalekha/");
});

test("snippets mark the matched words and stay short", () => {
  const parts = snippet("Python runs in the browser and the app opens offline after the first visit.", ["offline", "brow"]);
  assert.deepEqual(parts.filter((p) => p.mark).map((p) => p.text), ["browser", "offline"]);
  const long = "word ".repeat(200) + "needle " + "word ".repeat(200);
  const s = snippet(long, ["needle"]).map((p) => p.text).join("");
  assert.ok(s.startsWith("… ") && s.endsWith(" …") && s.includes("needle") && s.length < 230);
});

test("at most three results from one page", () => {
  const many = prepare(Array.from({ length: 6 }, (_, i) => ({ page: "/a/", pageTitle: "A", heading: `H${i}`, id: `h${i}`, text: "grid rows" })));
  assert.equal(search(many, "grid").hits.length, 3);
});
