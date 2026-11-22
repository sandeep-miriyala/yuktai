// ఫోన్ / Google / Outlook calendar లోకి దిగుమతి చేసే .ics (RFC 5545).
// తెలుగు శీర్షికలు UTF-8 లో; 75 bytes పంక్తి మడత అక్షరం మధ్యలో తెంపకుండా.
import { zonedToUtc, icsUtc } from "./time.js";
import { pick } from "./text.js";

const escIcs = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function fold(line) {
  const enc = new TextEncoder();
  const out = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // తర్వాతి పంక్తుల ముందు ఒక space వస్తుంది
    if (bytes + b > limit) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}

/** ఒక కార్యక్రమానికి మొదలు, ముగింపు (ముగింపు లేకపోతే 2 గంటలు) */
export function eventTimes(ev, timeZone) {
  const start = zonedToUtc(ev.date, ev.time || "09:00", timeZone);
  const end = ev.endTime ? zonedToUtc(ev.date, ev.endTime, timeZone) : new Date(start.getTime() + 2 * 3600e3);
  return { start, end };
}

export function buildIcs(config, stamp = new Date()) {
  const langs = config.languages;
  const tz = config.timezone;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//yuktishaalaa//shubhalekha//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escIcs(pick(config.title, langs[0], langs))}`,
  ];
  (config.events || []).forEach((ev, i) => {
    const { start, end } = eventTimes(ev, tz);
    const name = pick(ev.name, langs[0], langs);
    const venue = [pick(ev.venue, langs[0], langs), ev.address].filter(Boolean).join(", ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${config.slug}-${i}@shubhalekha`,
      `DTSTAMP:${icsUtc(stamp)}`,
      `DTSTART:${icsUtc(start)}`,
      `DTEND:${icsUtc(end)}`,
      `SUMMARY:${escIcs(`${name} · ${pick(config.title, langs[0], langs)}`)}`,
    );
    if (venue) lines.push(`LOCATION:${escIcs(venue)}`);
    if (ev.map) lines.push(`URL:${ev.map}`);
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escIcs(name)}`, "TRIGGER:-PT3H", "END:VALARM", "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Google Calendar లో ఒక్క కార్యక్రమం చేర్చే link */
export function googleCalendarUrl(config, ev) {
  const langs = config.languages;
  const { start, end } = eventTimes(ev, config.timezone);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${pick(ev.name, langs[0], langs)} · ${pick(config.title, langs[0], langs)}`,
    dates: `${icsUtc(start)}/${icsUtc(end)}`,
    location: [pick(ev.venue, langs[0], langs), ev.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
