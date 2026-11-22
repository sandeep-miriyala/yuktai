// event.json సరిచూపు. తప్పులు English + తెలుగులో, ఏ field అనేది స్పష్టంగా.
import { digits } from "./lib/contact.js";
import { LANG_CODES } from "./locales.js";
import { fontErrors } from "./fonts.js";

export const LANGS = LANG_CODES;
export const THEMES = ["traditional", "modern", "simple"];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ఖాళీ కాని text: string లేదా { te: "...", en: "..." } లో కనీసం ఒక విలువ */
const hasText = (v) =>
  typeof v === "string" ? v.trim() !== "" : !!v && typeof v === "object" && Object.values(v).some((x) => typeof x === "string" && x.trim() !== "");

function validTimeZone(tz) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** లోపాల జాబితా ఇస్తుంది (ఖాళీ అయితే సరైనది). config ను default విలువలతో నింపుతుంది. */
export function validate(config) {
  const errors = [];
  const err = (field, en, te) => errors.push({ field, message: `${en} / ${te}` });

  if (!config || typeof config !== "object") {
    err("(file)", "event.json must be a JSON object", "event.json ఒక JSON object కావాలి");
    return errors;
  }

  config.type ??= "event";
  config.languages ??= ["en"];
  config.timezone ??= "Asia/Kolkata";
  config.theme ??= "traditional";
  config.site ??= {};
  config.site.noindex ??= true; // వ్యక్తిగత వివరాలు: default గా search engines లో రాకూడదు
  config.a11y ??= true;

  if (!Array.isArray(config.languages) || !config.languages.length) {
    err("languages", "Give at least one language", "కనీసం ఒక భాష ఇవ్వండి");
  } else {
    for (const l of config.languages) {
      if (!LANGS.includes(l)) err("languages", `Unknown language "${l}" (use ${LANGS.join(", ")})`, `తెలియని భాష "${l}"`);
    }
    if (new Set(config.languages).size !== config.languages.length) {
      err("languages", "A language is listed twice", "ఒక భాష రెండుసార్లు ఉంది");
    }
  }
  if (Array.isArray(config.languages)) {
    for (const e of fontErrors(config.fonts, config.languages)) err(e.field, e.en, e.te);
  }
  if (!validTimeZone(config.timezone)) err("timezone", `Unknown timezone "${config.timezone}"`, "తెలియని timezone");
  if (!THEMES.includes(config.theme)) err("theme", `Theme must be one of ${THEMES.join(", ")}`, "theme తప్పు");
  for (const key of ["photo", "ogImage"]) {
    if (config[key] && !/^photos\/[^/]+\.(jpe?g|png|webp)$/i.test(config[key])) {
      err(key, `${key} must be a photo in the photos folder, like photos/couple.jpg`, "photos folder లోని ఫోటో ఇవ్వండి");
    }
  }
  if (config.site.url && !/^https:\/\//.test(config.site.url)) {
    err("site.url", "site.url must start with https://", "site.url https:// తో మొదలవ్వాలి");
  }

  if (config.type === "card") {
    if (!hasText(config.name)) err("name", "Business card needs a name", "Business card కు పేరు కావాలి");
    if (!config.phone && !config.email && !config.whatsapp) {
      err("phone", "Give at least one of phone, whatsapp or email", "phone, whatsapp, email లో కనీసం ఒకటి ఇవ్వండి");
    }
  } else {
    if (!hasText(config.title)) err("title", "Event needs a title", "కార్యక్రమానికి శీర్షిక కావాలి");
    if (!Array.isArray(config.events) || !config.events.length) {
      err("events", "Add at least one event", "కనీసం ఒక కార్యక్రమం చేర్చండి");
    } else {
      config.events.forEach((ev, i) => {
        const f = `events[${i}]`;
        if (!hasText(ev.name)) err(`${f}.name`, "Event name missing", "కార్యక్రమం పేరు లేదు");
        if (!DATE.test(ev.date || "")) err(`${f}.date`, "Date must look like 2027-02-14", "తేదీ 2027-02-14 లాగా ఉండాలి");
        if (ev.time && !TIME.test(ev.time)) err(`${f}.time`, "Time must look like 10:30 (24-hour)", "సమయం 10:30 లాగా (24 గంటల రూపం)");
        if (ev.endTime && !TIME.test(ev.endTime)) err(`${f}.endTime`, "End time must look like 13:00", "ముగింపు సమయం 13:00 లాగా");
        if (ev.map && !/^https:\/\//.test(ev.map)) err(`${f}.map`, "Map link must start with https://", "Map link https:// తో మొదలవ్వాలి");
      });
    }
    if (config.countdown && !config.events?.[config.countdown.event ?? 0]) {
      err("countdown.event", "Countdown points to an event that does not exist", "Countdown లోని కార్యక్రమం లేదు");
    }
    if (config.rsvp) {
      const r = config.rsvp;
      if (!r.whatsapp && !r.email) {
        err("rsvp", "RSVP needs a WhatsApp number or an email (or remove rsvp)", "RSVP కి WhatsApp నంబర్ లేదా email కావాలి (లేదా rsvp తీసేయండి)");
      }
      if (r.whatsapp && digits(r.whatsapp).length < 10) {
        err("rsvp.whatsapp", "WhatsApp number with country code, like +91 98480 22338", "దేశ కోడ్‌తో WhatsApp నంబర్, ఉదా +91 98480 22338");
      }
      if (r.email && !EMAIL.test(r.email)) err("rsvp.email", "RSVP email looks wrong", "RSVP email తప్పుగా ఉంది");
    }
    if (config.gallery != null) {
      if (!Array.isArray(config.gallery)) err("gallery", "gallery must be a list of photos", "gallery ఫోటోల జాబితా కావాలి");
      else config.gallery.forEach((g, i) => {
        const src = typeof g === "string" ? g : g?.src;
        if (!/^photos\/[^/]+\.(jpe?g|png|webp)$/i.test(src || "")) err(`gallery[${i}]`, "Use a photo from the photos folder, like photos/invite-1.jpg", "photos folder లోని ఫోటో ఇవ్వండి, ఉదా photos/invite-1.jpg");
      });
    }
    if (config.faq != null) {
      if (!Array.isArray(config.faq)) err("faq", "faq must be a list", "faq ఒక జాబితా కావాలి");
      else config.faq.forEach((f, i) => {
        if (!hasText(f?.q) || !hasText(f?.a)) err(`faq[${i}]`, "Each FAQ needs q (question) and a (answer)", "ప్రతి FAQ కి q (ప్రశ్న), a (జవాబు) కావాలి");
      });
    }
  }
  return errors;
}
