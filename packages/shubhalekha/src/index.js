// @yuktishaalaa/shubhalekha: programmatic API
export { build } from "./build.js";
export { validate, LANGS, THEMES } from "./schema.js";
export { buildIcs, googleCalendarUrl } from "./lib/ics.js";
export { buildVcard, whatsappUrl, mailtoUrl } from "./lib/contact.js";
export { zonedToUtc } from "./lib/time.js";
export { findConfig } from "./build.js";
export { FONTS, SCRIPT_OF, fontsFor } from "./fonts.js";
export { THEME_COLORS } from "./build.js";

import { readFileSync } from "node:fs";
/** ఒక వేడుక template (wedding, housewarming, …) ను JSON object గా */
export function template(type) {
  return JSON.parse(readFileSync(new URL(`../templates/${type}.json`, import.meta.url), "utf8"));
}
