// Shubhalekha Maker: నియమాలు ఇక్కడ మాత్రమే. Netlify, email, storage ఏదీ ఇక్కడ లేదు,
// కాబట్టి tests లో నేరుగా పరీక్షించవచ్చు.
import { createHash, randomBytes } from "node:crypto";

export const LIMITS = {
  slotsPerMonth: Number(process.env.SLOTS_PER_MONTH || 4),
  editsPerInvite: 2,
  photos: 5,
  photoBytes: 1_500_000, // browser లోనే 1600 px కి తగ్గించి పంపుతుంది
  events: 5,
  faq: 5,
  keepDaysAfterEvent: 7,
  maxDaysAhead: 120, // ఇంత కంటే దూరం వేడుకకు ఇప్పుడు స్లాట్ ఇవ్వం
  textLength: 300,
};

export const TYPES = ["wedding", "engagement", "housewarming", "birthday", "naming", "annaprasana", "aksharabhyasam", "upanayanam", "seemantham", "shashtipurti", "anniversary", "puja", "opening", "memorial"];
export const THEMES = ["traditional", "modern", "simple"];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// మోసపూరిత పేజీలు రాకుండా: సాధారణ text లో links వద్దు
const LINKISH = /(https?:\/\/|www\.|\.(com|in|net|org|xyz|top|link|ly|io|app|site|online|shop)\b)/i;
const MAP_HOSTS = ["maps.google.com", "www.google.com", "google.com", "maps.app.goo.gl", "goo.gl", "www.google.co.in"];

/** భారత కాలమానంలో ఈ రోజు తేదీ, "2026-11-22" */
export function todayIST(now = new Date()) {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
export const monthKey = (now = new Date()) => todayIST(now).slice(0, 7);
export function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86_400_000);

export const sha256 = (s) => createHash("sha256").update(String(s)).digest("hex");
export const newToken = () => randomBytes(24).toString("hex");

/** Link పేరు: priya-arjun → priya-arjun-k7q (చివర 3 అక్షరాలు: ఒకే పేరు రెండుసార్లు రాకుండా, ఊహించలేకుండా) */
export function siteName(wish, rand = randomBytes(3)) {
  const base = String(wish || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "shubhalekha";
  const tail = [...rand].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
  return `${base}-${tail}`;
}

const str = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * Form నుంచి వచ్చిన data సరిచూపు. errors: [{ field, message }] (తెలుగు / English).
 * edit = true అయితే ఫోటోలు లేకపోయినా పర్వాలేదు (పాతవే ఉంటాయి కాదు: మళ్లీ పంపాలి, సరళత కోసం).
 */
export function checkRequest(b, { now = new Date(), languages = [], fontsFor = () => [] } = {}) {
  const errors = [];
  const err = (field, te, en) => errors.push({ field, message: `${te} / ${en}` });
  if (!b || typeof b !== "object") return [{ field: "(body)", message: "తప్పు అభ్యర్థన / Bad request" }];
  if (str(b.website)) err("website", "తిరస్కరించాం", "Rejected"); // bots మాత్రమే నింపే దాచిన field
  if (b.consent !== true) err("consent", "సమ్మతి ఇవ్వండి", "Please agree to the terms");
  if (!TYPES.includes(b.type)) err("type", "వేడుక రకం ఎంచుకోండి", "Pick a celebration");
  if (b.theme && !THEMES.includes(b.theme)) err("theme", "theme తప్పు", "Unknown theme");

  const langs = Array.isArray(b.languages) ? b.languages : [];
  if (!langs.length || langs.length > 23 || langs.some((l) => !languages.includes(l)) || new Set(langs).size !== langs.length) {
    err("languages", "భాషలు సరిగ్గా ఎంచుకోండి", "Pick languages from the list");
  }
  if (b.fonts != null) {
    if (typeof b.fonts !== "object") err("fonts", "font తప్పు", "Bad fonts");
    else for (const [l, f] of Object.entries(b.fonts)) {
      if (!langs.includes(l) || !fontsFor(l).includes(f)) err(`fonts.${l}`, "ఈ font ఈ భాషకు లేదు", "This font is not offered for this language");
    }
  }

  const texts = [["title", b.title, true], ["message", b.message, false]];
  for (const [field, v, required] of texts) {
    if (required && !str(v)) err(field, "ఇది నింపండి", "Please fill this in");
    if (str(v).length > LIMITS.textLength) err(field, "చాలా పొడవుగా ఉంది", "Too long");
    if (LINKISH.test(str(v))) err(field, "ఇక్కడ links పెట్టకండి", "No links here, please");
  }

  const today = todayIST(now);
  const events = Array.isArray(b.events) ? b.events : [];
  if (!events.length || events.length > LIMITS.events) err("events", "కనీసం ఒక కార్యక్రమం", "Add one to five events");
  events.forEach((e, i) => {
    const f = `events[${i}]`;
    if (!str(e?.name)) err(`${f}.name`, "కార్యక్రమం పేరు", "Event name");
    if (!DATE.test(e?.date || "")) err(`${f}.date`, "తేదీ తప్పు", "Bad date");
    else if (e.date < today) err(`${f}.date`, "ఈ తేదీ అయిపోయింది", "This date has passed");
    else if (daysBetween(today, e.date) > LIMITS.maxDaysAhead) err(`${f}.date`, `${LIMITS.maxDaysAhead} రోజుల్లోపు వేడుకలకే`, `Only for events in the next ${LIMITS.maxDaysAhead} days`);
    if (e?.time && !TIME.test(e.time)) err(`${f}.time`, "సమయం తప్పు", "Bad time");
    for (const k of ["name", "venue", "address", "note"]) {
      if (str(e?.[k]).length > LIMITS.textLength) err(`${f}.${k}`, "చాలా పొడవుగా ఉంది", "Too long");
      if (LINKISH.test(str(e?.[k]))) err(`${f}.${k}`, "ఇక్కడ links పెట్టకండి", "No links here, please");
    }
    if (e?.map) {
      let ok = false;
      try { const u = new URL(e.map); ok = u.protocol === "https:" && MAP_HOSTS.includes(u.hostname); } catch {}
      if (!ok) err(`${f}.map`, "Google Maps link మాత్రమే", "Google Maps links only");
    }
  });

  const wa = String(b.rsvp?.whatsapp || "").replace(/\D/g, "");
  if (wa.length < 10 || wa.length > 15) err("rsvp.whatsapp", "దేశ కోడ్‌తో WhatsApp నంబర్", "WhatsApp number with country code");

  const faq = Array.isArray(b.faq) ? b.faq : [];
  if (faq.length > LIMITS.faq) err("faq", "గరిష్ఠంగా 5 ప్రశ్నలు", "Five questions at most");
  faq.forEach((q, i) => {
    if (!str(q?.q) || !str(q?.a)) err(`faq[${i}]`, "ప్రశ్న, జవాబు రెండూ", "Question and answer");
    if (LINKISH.test(`${str(q?.q)} ${str(q?.a)}`)) err(`faq[${i}]`, "ఇక్కడ links పెట్టకండి", "No links here, please");
  });

  const photos = Array.isArray(b.photos) ? b.photos : [];
  if (photos.length > LIMITS.photos) err("photos", "గరిష్ఠంగా 5 ఫోటోలు", "Five photos at most");
  photos.forEach((p, i) => {
    const bytes = Math.floor((String(p?.data || "").length * 3) / 4);
    if (!/^[A-Za-z0-9+/=]+$/.test(String(p?.data || ""))) err(`photos[${i}]`, "ఫోటో చదవలేకపోయాం", "Could not read the photo");
    else if (bytes > LIMITS.photoBytes) err(`photos[${i}]`, "ఫోటో చాలా పెద్దది", "Photo is too large");
  });

  if (!EMAIL.test(str(b.email))) err("email", "email సరిగ్గా ఇవ్వండి", "Please give a valid email");
  return errors;
}

/** Form → shubhalekha config. రకానికి సరిపోయే template నుంచి kicker, message (ఖాళీగా వదిలితే) */
export function toConfig(b, { template, siteUrl }) {
  const langs = b.languages;
  const fromTemplate = (v) => {
    if (!v || typeof v !== "object") return v || undefined;
    const keep = Object.fromEntries(Object.entries(v).filter(([l]) => langs.includes(l)));
    return Object.keys(keep).length ? keep : undefined;
  };
  const photos = (b.photos || []).map((_, i) => `photos/${i + 1}.jpg`);
  return {
    type: b.type,
    languages: langs,
    ...(b.fonts && Object.keys(b.fonts).length ? { fonts: b.fonts } : {}),
    timezone: "Asia/Kolkata",
    theme: b.theme || "traditional",
    ...(fromTemplate(template?.kicker) ? { kicker: fromTemplate(template.kicker) } : {}),
    title: str(b.title),
    ...(str(b.message) ? { message: str(b.message) } : fromTemplate(template?.message) ? { message: fromTemplate(template.message) } : {}),
    ...(photos[0] ? { photo: photos[0], photoAlt: str(b.title) } : {}),
    ...(photos.length > 1 ? { gallery: photos.slice(1).map((src) => ({ src, alt: str(b.title) })) } : {}),
    events: b.events.map((e) => ({
      name: str(e.name),
      date: e.date,
      ...(e.time ? { time: e.time } : {}),
      ...(str(e.venue) ? { venue: str(e.venue) } : {}),
      ...(str(e.address) ? { address: str(e.address) } : {}),
      ...(e.map ? { map: e.map } : {}),
      ...(str(e.note) ? { note: str(e.note) } : {}),
    })),
    rsvp: { whatsapp: `+${String(b.rsvp.whatsapp).replace(/\D/g, "")}` },
    ...(b.faq?.length ? { faq: b.faq.map((q) => ({ q: str(q.q), a: str(q.a) })) } : {}),
    site: { url: siteUrl, noindex: true },
  };
}

/** చివరి కార్యక్రమం + 7 రోజులు */
export const deleteDate = (events) => addDays(events.map((e) => e.date).sort().at(-1), LIMITS.keepDaysAfterEvent);

/** రోజువారీ పని: ఎవరికి గుర్తు, ఏవి తొలగించాలి */
export function planCleanup(records, now = new Date()) {
  const today = todayIST(now);
  const remind = [];
  const remove = [];
  for (const r of records) {
    if (today >= r.deleteOn) remove.push(r);
    else if (!r.reminded && daysBetween(today, r.deleteOn) <= 2) remind.push(r);
  }
  return { remind, remove };
}
