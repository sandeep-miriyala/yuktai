// wedding.json (లేదా ఏ వేడుక .json అయినా) → dist/
// dist/ లో: index.html, app.js, style.css, sw.js, manifest.json, <వేడుక>.ics, og.jpg, album-qr.png, img/
// Vercel, GitHub Pages, Netlify ఏదైనా: static files మాత్రమే, server అక్కర్లేదు.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { createHash } from "node:crypto";
import QRCode from "qrcode";
import sharp from "sharp";
import { validate } from "./schema.js";
import { renderEvent, renderCard } from "./render.js";
import { buildIcs } from "./lib/ics.js";
import { buildVcard } from "./lib/contact.js";
import { pick } from "./lib/text.js";
import { iconPng } from "./lib/png.js";

const RUNTIME = new URL("../runtime/", import.meta.url);
const IMG_MAX_WIDTH = 1600;
const BIG_SOURCE = 8 * 1024 * 1024;
export const THEME_COLORS = { traditional: "#7a1f1f", modern: "#1e3a5f", simple: "#333333" };

const slugify = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "shubhalekha";

/** ఏ .json వేడుక file? event.json, wedding.json, లేదా folder లోని ఒక్క .json (package.json కాకుండా) */
export function findConfig(projectDir) {
  const skip = new Set(["package.json", "package-lock.json", "tsconfig.json", "vercel.json", "manifest.json"]);
  const all = existsSync(projectDir) ? readdirSync(projectDir).filter((f) => f.endsWith(".json") && !skip.has(f)) : [];
  for (const name of ["event.json", "wedding.json"]) if (all.includes(name)) return join(projectDir, name);
  if (all.length === 1) return join(projectDir, all[0]);
  if (all.length === 0) throw new Error("వేడుక .json file లేదు / No event file found (for example wedding.json). Run: npx @yuktishaalaa/shubhalekha init");
  throw new Error(`ఏ file వాడాలో తెలియడం లేదు / More than one event file: ${all.join(", ")}. Keep one, or name it event.json`);
}

/** photos/couple.jpg → img/couple.webp (చిన్నది, వేగంగా తెరుచుకునేది) */
async function optimisePhotos(projectDir, outDir, warnings) {
  const src = join(projectDir, "photos");
  const map = {};
  if (!existsSync(src)) return map;
  mkdirSync(join(outDir, "img"), { recursive: true });
  const used = new Set();
  for (const f of readdirSync(src)) {
    const from = join(src, f);
    if (statSync(from).isDirectory()) continue;
    const ext = extname(f).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      if (ext === ".mp4") warnings.push(`photos/${f}: videos make the page heavy on mobile data. Share a YouTube or Drive link instead`);
      continue;
    }
    if (statSync(from).size > BIG_SOURCE) warnings.push(`photos/${f}: very large (${Math.round(statSync(from).size / 1048576)} MB)`);
    let name = slugify(basename(f, ext)) + ".webp";
    while (used.has(name)) name = name.replace(/\.webp$/, "-1.webp");
    used.add(name);
    try {
      await sharp(from).rotate().resize({ width: IMG_MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(outDir, "img", name));
      map[`photos/${f}`] = `img/${name}`;
    } catch (e) {
      warnings.push(`photos/${f}: could not read this image (${e.message})`);
    }
  }
  return map;
}

/** WhatsApp / Facebook preview: 1200 × 630 og.jpg */
async function makeOgImage(projectDir, outDir, source, color) {
  const out = join(outDir, "og.jpg");
  const from = source && existsSync(join(projectDir, source)) ? join(projectDir, source) : null;
  if (from) {
    await sharp(from).rotate().resize(1200, 630, { fit: "cover", position: sharp.strategy.attention }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  } else {
    // ఫోటో లేకపోతే: theme రంగు + దీపం గుర్తు
    const icon = iconPng(420, color, { maskable: true });
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: color } })
      .composite([{ input: icon, top: 105, left: 390 }]).jpeg({ quality: 85 }).toFile(out);
  }
  return "og.jpg";
}

async function qrPng(text, file) {
  await QRCode.toFile(file, text, { type: "png", margin: 1, width: 512, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
}

export async function build(projectDir, { outDir = join(projectDir, "dist"), now = new Date() } = {}) {
  const configPath = findConfig(projectDir);
  const fileName = basename(configPath);
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (e) {
    throw new Error(`${fileName} చదవలేకపోయాం / Could not read ${fileName}: ${e.message}`);
  }
  const errors = validate(config);
  if (errors.length) {
    const msg = errors.map((e) => `  • ${e.field}: ${e.message}`).join("\n");
    const err = new Error(`${fileName} లో ${errors.length} సమస్యలు / ${errors.length} problem(s) in ${fileName}:\n${msg}`);
    err.errors = errors;
    throw err;
  }
  const langs = config.languages;
  const isCard = config.type === "card";
  config.slug = slugify(pick(isCard ? config.name : config.title, "en", langs));
  const color = THEME_COLORS[config.theme];
  const warnings = [];

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "icons"), { recursive: true });

  // ఫోటోలు: చిన్నవిగా webp, config లోని దారులు మార్పు
  const photoMap = await optimisePhotos(projectDir, outDir, warnings);
  const mapPhoto = (p) => {
    if (!p) return p;
    if (photoMap[p]) return photoMap[p];
    warnings.push(`${p}: ఈ ఫోటో photos/ లో లేదు / not found in photos/`);
    return null;
  };
  const ogSource = config.ogImage || config.photo;
  const page = { ...config };
  page.photo = mapPhoto(config.photo);
  if (Array.isArray(config.gallery)) {
    page.gallery = config.gallery.map((g) => (typeof g === "string" ? { src: g } : g))
      .map((g) => ({ ...g, src: mapPhoto(g.src) })).filter((g) => g.src);
  }

  // og.jpg (link preview), QR PNGs
  page.ogImage = await makeOgImage(projectDir, outDir, ogSource, color);
  page.qr = {};
  if (config.site.url) { await qrPng(config.site.url, join(outDir, "site-qr.png")); page.qr.site = "site-qr.png"; }
  if (!isCard && config.album) { await qrPng(config.album, join(outDir, "album-qr.png")); page.qr.album = "album-qr.png"; }

  const icsName = `${slugify(config.type) || "event"}.ics`;
  page.icsName = icsName;
  const files = { "index.html": isCard ? renderCard(page) : renderEvent(page) };
  if (isCard) files["contact.vcf"] = buildVcard({ ...config, name: pick(config.name, langs[0], langs), role: pick(config.role, langs[0], langs), business: pick(config.business, langs[0], langs) });
  else files[icsName] = buildIcs(config, now);

  const shortName = pick(isCard ? config.name : config.title, langs[0], langs);
  // PWA: Android / desktop install కి 192, 512 PNG + maskable; iPhone కి 180 apple-touch-icon
  files["icons/icon-192.png"] = iconPng(192, color);
  files["icons/icon-512.png"] = iconPng(512, color);
  files["icons/maskable-512.png"] = iconPng(512, color, { maskable: true });
  files["icons/apple-touch-icon.png"] = iconPng(180, color, { maskable: true });
  files["manifest.json"] = JSON.stringify({
    id: "./",
    name: shortName,
    short_name: [...shortName].slice(0, 12).join(""),
    description: pick(isCard ? config.about : config.message, langs[0], langs) || shortName,
    start_url: "./",
    scope: "./",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffaf3",
    theme_color: color,
    lang: langs[0],
    dir: ["ur", "ks", "sd"].includes(langs[0]) ? "rtl" : "ltr",
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, null, 2);

  for (const f of ["app.js", "style.css"]) files[f] = readFileSync(new URL(f, RUNTIME), "utf8");

  // Service worker: ఈ build లోని files జాబితా + version (మార్పు వస్తేనే కొత్త cache)
  const extra = [...Object.values(photoMap), ...Object.values(page.qr)];
  const list = [...Object.keys(files), ...extra];
  const hash = createHash("sha256");
  for (const f of list) hash.update(f).update(files[f] ?? "");
  for (const f of extra) hash.update(readFileSync(join(outDir, f)));
  const version = hash.digest("hex").slice(0, 10);
  files["sw.js"] = readFileSync(new URL("sw.js", RUNTIME), "utf8")
    .replace("__VERSION__", version)
    .replace("__FILES__", JSON.stringify(["./", ...list.filter((f) => f !== "index.html")]));

  for (const [name, content] of Object.entries(files)) writeFileSync(join(outDir, name), content);

  if (!config.site.url) warnings.push("site.url లేదు: WhatsApp preview, page QR పూర్తిగా పనిచేయవు / Add site.url for link previews and the page QR code");
  return { outDir, configFile: fileName, version, warnings, files: [...Object.keys(files), ...extra, "og.jpg"] };
}
