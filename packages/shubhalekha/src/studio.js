// shubhalekha studio: code రాయకుండా, browser లో form నింపి page తయారుచేయడం.
// మీ కంప్యూటర్‌లోనే నడుస్తుంది (127.0.0.1). బయటి వారికి కనిపించదు, internet అవసరం లేదు.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, extname, normalize, basename } from "node:path";
import { build, findConfig } from "./build.js";
import { validate } from "./schema.js";
import { LANGUAGES, UI_READY } from "./locales.js";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ics": "text/calendar",
  ".vcf": "text/vcard", ".mp4": "video/mp4",
};
const MAX_BODY = 8 * 1024 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("File too large (max 8 MB)")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const send = (res, code, body, type = "application/json; charset=utf-8") => {
  res.writeHead(code, { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

/** dir లోపల మాత్రమే file ఇవ్వడం (../ తో బయటికి వెళ్ళకుండా) */
function serveFile(res, dir, rel) {
  const path = normalize(join(dir, decodeURIComponent(rel)));
  if (!path.startsWith(normalize(dir))) return send(res, 403, { error: "forbidden" });
  let file = path;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return send(res, 404, { error: "not found" });
  send(res, 200, readFileSync(file), TYPES[extname(file).toLowerCase()] || "application/octet-stream");
}

export function startStudio(projectDir, { port = 4321, host = "127.0.0.1" } = {}) {
  let configPath;
  try { configPath = findConfig(projectDir); } catch { configPath = join(projectDir, "event.json"); }
  const photos = join(projectDir, "photos");
  const dist = join(projectDir, "dist");
  const studioPage = new URL("../runtime/studio.html", import.meta.url);

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${host}`);
      // వేరే website ఈ studio కి రహస్యంగా POST చేయకుండా: మన page పంపే header తప్పనిసరి
      if (req.method === "POST" && req.headers["x-shubhalekha-studio"] !== "1") return send(res, 403, { error: "forbidden" });
      if (req.method === "GET" && url.pathname === "/") {
        return send(res, 200, readFileSync(studioPage), TYPES[".html"]);
      }
      if (req.method === "GET" && url.pathname === "/api/event") {
        const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : { type: "wedding", languages: ["en"], events: [] };
        const langs = Object.fromEntries(Object.entries(LANGUAGES).map(([k, v]) => [k, { name: v.name, uiReady: UI_READY.includes(k) }]));
        return send(res, 200, { config, languages: langs });
      }
      if (req.method === "POST" && url.pathname === "/api/event") {
        const config = JSON.parse((await readBody(req)).toString("utf8"));
        const errors = validate(structuredClone(config));
        writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n"); // తప్పులున్నా పని పోకుండా దాస్తాం
        if (errors.length) return send(res, 200, { ok: false, errors });
        const r = await build(projectDir);
        return send(res, 200, { ok: true, warnings: r.warnings, version: r.version });
      }
      if (req.method === "POST" && url.pathname === "/api/photo") {
        const name = basename(url.searchParams.get("name") || "").replace(/[^\w.-]/g, "_").toLowerCase();
        if (!/\.(jpe?g|png|webp)$/.test(name)) return send(res, 400, { error: "Only .jpg, .png or .webp photos" });
        const body = await readBody(req);
        mkdirSync(photos, { recursive: true });
        writeFileSync(join(photos, name), body);
        return send(res, 200, { path: `photos/${name}`, kb: Math.round(body.length / 1024) });
      }
      if (req.method === "GET" && url.pathname.startsWith("/preview/")) {
        return serveFile(res, dist, url.pathname.slice("/preview/".length) || "index.html");
      }
      if (req.method === "GET" && url.pathname.startsWith("/photos/")) {
        return serveFile(res, photos, url.pathname.slice("/photos/".length));
      }
      send(res, 404, { error: "not found" });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}
