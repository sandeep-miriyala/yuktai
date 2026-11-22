import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { build, template, LANGS, fontsFor } from "@yuktishaalaa/shubhalekha";
import { makeHandlers } from "../lib/handlers.mjs";
import { siteName, checkRequest, deleteDate, todayIST, addDays } from "../lib/core.mjs";
import { messages } from "../lib/mail.mjs";
import { netlifyClient } from "../lib/netlify.mjs";

const ORIGIN = "https://sandeep-miriyala.github.io";
const NOW = new Date("2026-11-22T06:00:00Z");
const photo = (await sharp({ create: { width: 40, height: 30, channels: 3, background: "#c33" } }).jpeg().toBuffer()).toString("base64");

// నకిలీ Google Fonts: tests internet వాడవు
const fakeFonts = async (url) => url.includes("css2")
  ? new Response("@font-face{src:url(https://fonts.gstatic.com/x) format('woff2')}")
  : new Response(new Uint8Array([1, 2, 3]));

function setup({ now = NOW, failDeploy = false } = {}) {
  const data = new Map();
  const sites = new Map();
  const mails = [];
  let clock = now;
  let n = 0;
  const h = makeHandlers({
    store: {
      get: async (k) => (data.has(k) ? structuredClone(data.get(k)) : null),
      set: async (k, v) => void data.set(k, structuredClone(v)),
      del: async (k) => void data.delete(k),
      list: async (p) => [...data.keys()].filter((k) => k.startsWith(p)),
    },
    netlify: {
      createSite: async (nameFn) => { const name = nameFn(); const id = `site${++n}`; sites.set(id, { name, files: null }); return { id, name, url: `https://${name}.netlify.app` }; },
      deploy: async (id, files) => { if (failDeploy) throw new Error("boom"); sites.get(id).files = files; return { deployId: "d" }; },
      deleteSite: async (id) => void sites.delete(id),
    },
    mail: { send: async (kind, r) => { mails.push({ kind, to: r.email, token: r.editToken, link: r.editLink }); return true; } },
    build: (dir) => build(dir, { fetch: fakeFonts }),
    templates: { wedding: template("wedding"), housewarming: template("housewarming") },
    languages: LANGS,
    fontsFor,
    now: () => clock,
  });
  return { h, data, sites, mails, setNow: (d) => { clock = d; } };
}

const form = (over = {}) => ({
  type: "wedding",
  languages: ["te", "en"],
  fonts: { te: "Ramabhadra" },
  title: "ప్రియ & అర్జున్",
  slug: "Priya Arjun",
  events: [{ name: "వివాహం", date: "2027-01-10", time: "10:30", venue: "శ్రీ కళ్యాణ మండపం", map: "https://maps.app.goo.gl/abc" }],
  rsvp: { whatsapp: "+91 90000 00000" },
  photos: [{ data: photo }, { data: photo }],
  email: "Family@Example.com",
  consent: true,
  website: "",
  ...over,
});

const post = (body, path = "create") => new Request(`https://maker.test/api/${path}`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" }, body: JSON.stringify(body) });
const get = () => new Request("https://maker.test/api/slots", { headers: { origin: ORIGIN } });

test("slots: four a month", async () => {
  const { h } = setup();
  const r = await h.slots(get());
  assert.equal(r.headers.get("access-control-allow-origin"), ORIGIN);
  assert.deepEqual(await r.json(), { total: 4, left: 4, month: "2026-11", opensAgain: "2026-12-01" });
});

test("create: builds, deploys, keeps only what it needs, sends the ready email", async () => {
  const { h, data, sites, mails } = setup();
  const r = await h.create(post(form()));
  const body = await r.json();
  assert.equal(r.status, 200, JSON.stringify(body));
  assert.match(body.url, /^https:\/\/priya-arjun-[a-z0-9]{3}\.netlify\.app\/$/);
  assert.equal(body.deleteOn, "2027-01-17", "last event + 7 days");
  assert.equal(body.editsLeft, 2);

  const files = sites.get(body.siteId).files;
  for (const f of ["index.html", "sw.js", "manifest.json", "img/1.webp", "img/2.webp", "og.jpg", "site-qr.png", "fonts/te-ramabhadra.woff2"]) assert.ok(files[f], f);
  const html = files["index.html"].toString();
  assert.ok(html.includes("ప్రియ &amp; అర్జున్"));
  assert.ok(html.includes("noindex"));
  assert.ok(html.includes(body.url), "site.url used for previews");

  const rec = data.get(`invite/${body.siteId}`);
  assert.deepEqual(Object.keys(rec).sort(), ["createdAt", "deleteOn", "editHash", "edits", "email", "name", "reminded", "siteId", "url"]);
  assert.equal(rec.email, "family@example.com");
  assert.notEqual(rec.editHash, body.editToken, "only the hash is stored");
  assert.ok(!JSON.stringify(rec).includes("ప్రియ"), "invitation text is not kept in the store");
  assert.equal(data.get("month/2026-11").count, 1);
  assert.deepEqual(mails, [{ kind: "ready", to: "family@example.com", token: body.editToken, link: `https://sandeep-miriyala.github.io/yuktai/shubhalekha/make/#edit=${body.siteId}.${body.editToken}` }]);
});

test("rules: links, old or far dates, other map sites, bots and no consent are refused", () => {
  const c = (o) => checkRequest(form(o), { now: NOW, languages: LANGS, fontsFor }).map((e) => e.field);
  assert.deepEqual(c({}), []);
  assert.ok(c({ title: "Win money at www.example.com" }).includes("title"));
  assert.ok(c({ events: [{ name: "x", date: "2026-11-01" }] }).includes("events[0].date"));
  assert.ok(c({ events: [{ name: "x", date: "2027-06-01" }] }).includes("events[0].date"), "more than 120 days away");
  assert.ok(c({ events: [{ name: "x", date: "2027-01-01", map: "https://evil.example/maps" }] }).includes("events[0].map"));
  assert.ok(c({ website: "spam" }).includes("website"));
  assert.ok(c({ consent: false }).includes("consent"));
  assert.ok(c({ fonts: { te: "Comic Sans" } }).includes("fonts.te"));
  assert.ok(c({ photos: Array(6).fill({ data: photo }) }).includes("photos"));
  assert.ok(c({ rsvp: { whatsapp: "123" } }).includes("rsvp.whatsapp"));
});

test("a fifth invitation in the month is refused, and one per email", async () => {
  const { h } = setup();
  for (let i = 0; i < 4; i++) assert.equal((await h.create(post(form({ email: `f${i}@example.com` })))).status, 200);
  const full = await h.create(post(form({ email: "f9@example.com" })));
  assert.equal(full.status, 409);
  assert.deepEqual(await full.json(), { full: true, opensAgain: "2026-12-01" });
  assert.equal((await (await h.slots(get())).json()).left, 0);

  const two = setup();
  await two.h.create(post(form()));
  const again = await two.h.create(post(form()));
  assert.equal(again.status, 409);
  assert.equal((await again.json()).error, "one-per-email");
});

test("edit: needs the code, at most twice, updates the delete date", async () => {
  const { h, data, sites } = setup();
  const made = await (await h.create(post(form()))).json();
  assert.equal((await h.update(post({ ...form(), siteId: made.siteId, editToken: "wrong" }, "update"))).status, 403);

  const later = form({ events: [{ name: "వివాహం", date: "2027-02-01", time: "11:00" }] });
  const r1 = await h.update(post({ ...later, siteId: made.siteId, editToken: made.editToken }, "update"));
  const b1 = await r1.json();
  assert.equal(r1.status, 200, JSON.stringify(b1));
  assert.equal(b1.deleteOn, "2027-02-08");
  assert.equal(b1.editsLeft, 1);
  assert.ok(sites.get(made.siteId).files["index.html"].toString().includes("2027-02-01"), "the new date is on the page");
  assert.equal((await h.update(post({ ...later, siteId: made.siteId, editToken: made.editToken }, "update"))).status, 200);
  const r3 = await h.update(post({ ...later, siteId: made.siteId, editToken: made.editToken }, "update"));
  assert.equal(r3.status, 409);
  assert.equal(data.get(`invite/${made.siteId}`).edits, 2);
});

test("cleanup: reminder two days before, then the site and every detail are deleted", async () => {
  const { h, data, sites, mails, setNow } = setup();
  const made = await (await h.create(post(form()))).json();
  setNow(new Date("2027-01-14T06:00:00Z"));
  assert.deepEqual(await h.cleanup(), { reminded: 0, deleted: 0 });
  setNow(new Date("2027-01-15T06:00:00Z"));
  assert.deepEqual(await h.cleanup(), { reminded: 1, deleted: 0 });
  assert.deepEqual(await h.cleanup(), { reminded: 0, deleted: 0 }, "only one reminder");
  setNow(new Date("2027-01-17T06:00:00Z"));
  assert.deepEqual(await h.cleanup(), { reminded: 0, deleted: 1 });
  assert.ok(!sites.has(made.siteId));
  assert.ok(![...data.keys()].some((k) => k.startsWith("invite/")));
  assert.ok(!data.has("month/2026-11"), "old month counters go too");
  assert.deepEqual(mails.map((m) => m.kind), ["ready", "reminder", "deleted"]);
});

test("a failed deploy removes the half-made site and uses no slot", async () => {
  const { h, sites, data } = setup({ failDeploy: true });
  const r = await h.create(post(form()));
  assert.equal(r.status, 500);
  assert.equal(sites.size, 0);
  assert.ok(!data.has("month/2026-11"));
});

test("OPTIONS preflight and unknown origins", async () => {
  const { h } = setup();
  const pre = await h.create(new Request("https://maker.test/api/create", { method: "OPTIONS", headers: { origin: ORIGIN } }));
  assert.equal(pre.status, 204);
  const other = await h.slots(new Request("https://maker.test/api/slots", { headers: { origin: "https://evil.example" } }));
  assert.equal(other.headers.get("access-control-allow-origin"), ORIGIN);
});

test("helpers: site names, dates, emails", () => {
  assert.equal(siteName("Priya & Arjun!", Buffer.from([0, 1, 2])), "priya-arjun-abc");
  assert.equal(siteName("ప్రియ", Buffer.from([0, 1, 2])), "shubhalekha-abc");
  assert.equal(deleteDate([{ date: "2027-01-02" }, { date: "2027-01-10" }]), "2027-01-17");
  assert.equal(todayIST(new Date("2026-11-22T20:00:00Z")), "2026-11-23", "IST is ahead");
  assert.equal(addDays("2026-12-28", 7), "2027-01-04");
  const m = messages("ready", { url: "https://x.netlify.app/", editLink: "https://m/#edit=s1.abc", editsLeft: 2, deleteOn: "2027-01-17" });
  assert.match(m.text, /#edit=s1\.abc/);
  assert.match(m.text, /site-qr\.png/);
});

test("Netlify client: file digest deploy uploads only what Netlify asks for", async () => {
  const calls = [];
  const fake = async (url, init) => {
    calls.push(`${init.method} ${url.replace("https://api.netlify.com/api/v1", "")}`);
    assert.equal(init.headers.authorization, "Bearer t0k");
    if (url.endsWith("/deploys")) {
      const files = JSON.parse(init.body).files;
      return Response.json({ id: "dep1", required: [files["/index.html"]] });
    }
    if (init.method === "POST" && url.endsWith("/sites")) return calls.length === 1 ? new Response("taken", { status: 422 }) : Response.json({ id: "s1", name: "a-b", ssl_url: "https://a-b.netlify.app" });
    return new Response(null, { status: 200 });
  };
  const c = netlifyClient({ token: "t0k", fetch: fake });
  assert.deepEqual(await c.createSite(() => "a-b"), { id: "s1", name: "a-b", url: "https://a-b.netlify.app" });
  const d = await c.deploy("s1", { "index.html": "<p>hi</p>", "img/1.webp": Buffer.from([1]) });
  assert.equal(d.uploaded, 1);
  assert.ok(calls.includes("PUT /deploys/dep1/files/index.html"));
  assert.ok(!calls.some((c) => c.includes("img")));
});

test("Netlify client: NETLIFY_TEAM puts new sites in that team only", async () => {
  const urls = [];
  const fake = async (url) => { urls.push(url); return Response.json({ id: "s1", name: "a", ssl_url: "https://a.netlify.app" }); };
  await netlifyClient({ token: "t", team: "shubhalekha-invites", fetch: fake }).createSite(() => "a");
  assert.equal(urls[0], "https://api.netlify.com/api/v1/shubhalekha-invites/sites");
});
