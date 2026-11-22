// Netlify API: site తయారీ, files deploy, తొలగింపు. Token Netlify environment variable లో మాత్రమే
// (NETLIFY_AUTH_TOKEN). ఈ file ఎప్పుడూ token ను బయటకు ఇవ్వదు, log చేయదు.
import { createHash } from "node:crypto";

const API = "https://api.netlify.com/api/v1";
const sha1 = (buf) => createHash("sha1").update(buf).digest("hex");

export function netlifyClient({ token = process.env.NETLIFY_AUTH_TOKEN, fetch: f = globalThis.fetch } = {}) {
  if (!token) throw new Error("NETLIFY_AUTH_TOKEN is not set");
  const call = async (method, path, body, type = "application/json") => {
    const res = await f(`${API}${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": type } : {}) },
      body: body == null ? undefined : type === "application/json" ? JSON.stringify(body) : body,
    });
    if (!res.ok) {
      const e = new Error(`Netlify ${method} ${path.split("?")[0]}: HTTP ${res.status}`);
      e.status = res.status;
      throw e;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  };

  return {
    /** కొత్త site. పేరు ఇప్పటికే ఉంటే (422) nameFn తో మళ్లీ ప్రయత్నం */
    async createSite(nameFn, tries = 4) {
      for (let i = 0; i < tries; i++) {
        try {
          const s = await call("POST", "/sites", { name: nameFn() });
          return { id: s.id, name: s.name, url: s.ssl_url || s.url };
        } catch (e) {
          if (e.status !== 422 || i === tries - 1) throw e;
        }
      }
    },

    /** files: { "index.html": Buffer|string, ... } → file digest deploy (మారిన files మాత్రమే upload) */
    async deploy(siteId, files) {
      const bufs = Object.fromEntries(Object.entries(files).map(([p, c]) => [`/${p.replace(/^\/+/, "")}`, Buffer.isBuffer(c) ? c : Buffer.from(c)]));
      const digests = Object.fromEntries(Object.entries(bufs).map(([p, b]) => [p, sha1(b)]));
      const d = await call("POST", `/sites/${siteId}/deploys`, { files: digests });
      const need = new Set(d.required || []);
      const todo = Object.entries(bufs).filter(([p]) => need.has(digests[p]));
      // ఒకేసారి 6 uploads
      for (let i = 0; i < todo.length; i += 6) {
        await Promise.all(todo.slice(i, i + 6).map(([p, b]) =>
          call("PUT", `/deploys/${d.id}/files${p.split("/").map(encodeURIComponent).join("/")}`, b, "application/octet-stream")));
      }
      return { deployId: d.id, uploaded: todo.length };
    },

    async deleteSite(siteId) {
      try {
        await call("DELETE", `/sites/${siteId}`);
      } catch (e) {
        if (e.status !== 404) throw e; // ఇప్పటికే లేకపోతే సరే
      }
    },
  };
}
