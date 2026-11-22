// నాలుగు పనులు: slots (ఎన్ని మిగిలాయి), create, update (మార్పు), cleanup (రోజువారీ).
// అన్నీ deps తీసుకుంటాయి, కాబట్టి tests లో నకిలీ Netlify, store, email తో నడుస్తాయి.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { timingSafeEqual } from "node:crypto";
import { LIMITS, checkRequest, toConfig, deleteDate, planCleanup, siteName, sha256, newToken, monthKey, todayIST } from "./core.mjs";

const MAX_BODY = 6_000_000;

function readTree(dir) {
  const out = {};
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else out[relative(dir, p).split("\\").join("/")] = readFileSync(p);
    }
  };
  walk(dir);
  return out;
}

const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const nextMonth = (now) => {
  const [y, m] = monthKey(now).split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
};

export function makeHandlers(deps) {
  const { store, netlify, mail, build, templates, languages, fontsFor } = deps;
  const now = () => (deps.now ? deps.now() : new Date());
  const origins = (deps.allowedOrigins ?? "https://sandeep-miriyala.github.io").split(",").map((s) => s.trim());

  const json = (req, status, body) => {
    const o = req.headers.get("origin");
    return new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": origins.includes(o) ? o : origins[0],
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        vary: "origin",
      },
    });
  };

  async function readBody(req) {
    if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return { error: "too-large" };
    const text = await req.text();
    if (text.length > MAX_BODY) return { error: "too-large" };
    try { return { body: JSON.parse(text) }; } catch { return { error: "bad-json" }; }
  }

  async function used(month) {
    return (await store.get(`month/${month}`))?.count ?? 0;
  }

  async function invites() {
    const keys = await store.list("invite/");
    return (await Promise.all(keys.map((k) => store.get(k)))).filter(Boolean);
  }

  // పత్రిక build చేసి Netlify site కి పంపుతుంది
  async function publish(body, site) {
    const dir = mkdtempSync(join(tmpdir(), "shubhalekha-"));
    try {
      const config = toConfig(body, { template: templates[body.type], siteUrl: site.url });
      writeFileSync(join(dir, "event.json"), JSON.stringify(config));
      if (body.photos?.length) {
        mkdirSync(join(dir, "photos"));
        body.photos.forEach((p, i) => writeFileSync(join(dir, "photos", `${i + 1}.jpg`), Buffer.from(p.data, "base64")));
      }
      const r = await build(dir);
      await netlify.deploy(site.id, readTree(r.outDir));
      return { config, warnings: r.warnings };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  const options = (req) => (req.method === "OPTIONS" ? json(req, 204, {}) : null);

  return {
    async slots(req) {
      const pre = options(req); if (pre) return pre;
      const month = monthKey(now());
      const left = Math.max(0, LIMITS.slotsPerMonth - (await used(month)));
      return json(req, 200, { total: LIMITS.slotsPerMonth, left, month, opensAgain: nextMonth(now()) });
    },

    async create(req) {
      const pre = options(req); if (pre) return pre;
      if (req.method !== "POST") return json(req, 405, { error: "POST only" });
      const { body, error } = await readBody(req);
      if (error) return json(req, 413, { error });
      const errors = checkRequest(body, { now: now(), languages, fontsFor });
      if (errors.length) return json(req, 400, { errors });

      const month = monthKey(now());
      if ((await used(month)) >= LIMITS.slotsPerMonth) return json(req, 409, { full: true, opensAgain: nextMonth(now()) });
      const email = body.email.trim().toLowerCase();
      if ((await invites()).some((r) => r.email === email)) return json(req, 409, { error: "one-per-email" });

      let site;
      try {
        site = await netlify.createSite(() => siteName(body.slug || body.title));
        site.url = site.url.endsWith("/") ? site.url : `${site.url}/`;
        const { config } = await publish(body, site);
        const token = newToken();
        const record = {
          siteId: site.id, name: site.name, url: site.url, email,
          deleteOn: deleteDate(config.events), createdAt: todayIST(now()),
          editHash: sha256(token), edits: 0, reminded: false,
        };
        await store.set(`invite/${site.id}`, record);
        await store.set(`month/${month}`, { count: (await used(month)) + 1 });
        const editsLeft = LIMITS.editsPerInvite;
        const editLink = `${deps.makerPage ?? "https://sandeep-miriyala.github.io/yuktai/shubhalekha/make/"}#edit=${site.id}.${token}`;
        const emailSent = await mail.send("ready", { ...record, editToken: token, editsLeft, editLink });
        return json(req, 200, { url: site.url, siteId: site.id, deleteOn: record.deleteOn, editToken: token, editsLeft, emailSent });
      } catch (e) {
        console.error(`create failed: ${e.message}`);
        if (site?.id) await netlify.deleteSite(site.id).catch(() => {});
        return json(req, 500, { error: "build-failed" });
      }
    },

    async update(req) {
      const pre = options(req); if (pre) return pre;
      if (req.method !== "POST") return json(req, 405, { error: "POST only" });
      const { body, error } = await readBody(req);
      if (error) return json(req, 413, { error });
      const record = typeof body?.siteId === "string" ? await store.get(`invite/${body.siteId}`) : null;
      if (!record || typeof body.editToken !== "string" || !sameHash(sha256(body.editToken), record.editHash)) {
        return json(req, 403, { error: "wrong-code" });
      }
      if (record.edits >= LIMITS.editsPerInvite) return json(req, 409, { error: "no-edits-left" });
      const errors = checkRequest(body, { now: now(), languages, fontsFor });
      if (errors.length) return json(req, 400, { errors });
      try {
        const { config } = await publish(body, { id: record.siteId, url: record.url });
        const updated = { ...record, email: body.email.trim().toLowerCase(), edits: record.edits + 1, deleteOn: deleteDate(config.events), reminded: false };
        await store.set(`invite/${record.siteId}`, updated);
        return json(req, 200, { url: record.url, siteId: record.siteId, deleteOn: updated.deleteOn, editsLeft: LIMITS.editsPerInvite - updated.edits });
      } catch (e) {
        console.error(`update failed: ${e.message}`);
        return json(req, 500, { error: "build-failed" });
      }
    },

    // రోజుకు ఒకసారి: 2 రోజుల ముందు గుర్తు, తేదీ వచ్చాక site + వివరాలు తొలగింపు
    async cleanup() {
      const { remind, remove } = planCleanup(await invites(), now());
      for (const r of remind) {
        await mail.send("reminder", r);
        await store.set(`invite/${r.siteId}`, { ...r, reminded: true });
      }
      for (const r of remove) {
        await netlify.deleteSite(r.siteId);
        await mail.send("deleted", r);
        await store.del(`invite/${r.siteId}`);
      }
      // పాత నెలల లెక్కలు అక్కర్లేదు
      const month = monthKey(now());
      for (const k of await store.list("month/")) if (k !== `month/${month}`) await store.del(k);
      return { reminded: remind.length, deleted: remove.length };
    },
  };
}
