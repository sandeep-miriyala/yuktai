import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validate, build, buildIcs, buildVcard, whatsappUrl, zonedToUtc } from "../src/index.js";
import { fold } from "../src/lib/ics.js";

const template = (name) => JSON.parse(readFileSync(new URL(`../templates/${name}.json`, import.meta.url), "utf8"));

test("every template is valid", () => {
  for (const t of readdirSync(new URL("../templates/", import.meta.url)).map((f) => f.replace(".json", ""))) {
    assert.deepEqual(validate(template(t)), [], t);
  }
});

test("RSVP without WhatsApp or email is rejected", () => {
  const c = template("wedding");
  c.rsvp = {};
  const errors = validate(c);
  assert.equal(errors[0].field, "rsvp");
});

test("short WhatsApp number is rejected", () => {
  const c = template("wedding");
  c.rsvp = { whatsapp: "12345" };
  assert.ok(validate(c).some((e) => e.field === "rsvp.whatsapp"));
});

test("bad date and time are rejected", () => {
  const c = template("birthday");
  c.events[0].date = "05-03-2027";
  c.events[0].time = "6pm";
  const fields = validate(c).map((e) => e.field);
  assert.ok(fields.includes("events[0].date"));
  assert.ok(fields.includes("events[0].time"));
});

test("noindex is on by default", () => {
  const c = { title: "x", events: [{ name: "a", date: "2027-01-01" }] };
  validate(c);
  assert.equal(c.site.noindex, true);
});

test("IST time converts to UTC", () => {
  assert.equal(zonedToUtc("2027-02-14", "10:30", "Asia/Kolkata").toISOString(), "2027-02-14T05:00:00.000Z");
  // న్యూయార్క్: శీతాకాలం (UTC-5), వేసవి (UTC-4)
  assert.equal(zonedToUtc("2027-01-10", "10:00", "America/New_York").toISOString(), "2027-01-10T15:00:00.000Z");
  assert.equal(zonedToUtc("2027-07-10", "10:00", "America/New_York").toISOString(), "2027-07-10T14:00:00.000Z");
});

test("WhatsApp link keeps only digits and encodes Telugu", () => {
  assert.equal(whatsappUrl("+91 90000 00000", "నమస్తే"), `https://wa.me/919000000000?text=${encodeURIComponent("నమస్తే")}`);
});

test("ICS lines never split a Telugu letter", () => {
  const line = "SUMMARY:" + "తెలుగు".repeat(20);
  for (const part of fold(line).split("\r\n ")) {
    assert.ok(new TextEncoder().encode(part).length <= 75);
    assert.doesNotThrow(() => decodeURIComponent(encodeURIComponent(part)));
  }
  const c = template("wedding");
  validate(c);
  c.slug = "test";
  const ics = buildIcs(c, new Date("2026-11-22T00:00:00Z"));
  assert.match(ics, /DTSTART:20270214T050000Z/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 3);
});

test("vCard has name, phone and escaped address", () => {
  const v = buildVcard({ name: "Lakshmi Rao", phone: "+91 90000 00000", address: "Shop 4, Main Road" });
  assert.match(v, /FN;CHARSET=UTF-8:Lakshmi Rao/);
  assert.match(v, /TEL;TYPE=CELL:\+919000000000/);
  assert.match(v, /Shop 4\\, Main Road/);
});

test("build writes a full site and escapes HTML", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  const c = template("housewarming");
  c.title.en = '<script>alert("x")</script>';
  writeFileSync(join(dir, "housewarming.json"), JSON.stringify(c));
  const r = await build(dir, { now: new Date("2026-11-22T00:00:00Z") });
  for (const f of ["index.html", "housewarming.ics", "sw.js", "manifest.json", "app.js", "style.css", "icons/icon-192.png", "og.jpg"]) {
    assert.ok(r.files.includes(f), f);
  }
  const html = readFileSync(join(dir, "dist", "index.html"), "utf8");
  assert.ok(!html.includes('<script>alert("x")</script>'));
  assert.match(html, /noindex/);
  assert.match(html, /data-wa="919000000000"/);
  const sw = readFileSync(join(dir, "dist", "sw.js"), "utf8");
  assert.ok(!sw.includes("__VERSION__") && !sw.includes("__FILES__"));
});

test("build stops with a clear message on errors", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
  writeFileSync(join(dir, "event.json"), JSON.stringify({ title: "x", events: [] }));
  await assert.rejects(build(dir), /events/);
});
