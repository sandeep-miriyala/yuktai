// తేదీ + సమయం + timezone (ఉదా: Asia/Kolkata) → UTC క్షణం.
// Server ఉండదు, అతిథి ఏ దేశంలో ఉన్నా countdown, calendar సరిగ్గా రావాలి.

/** ఆ timezone లో ఆ క్షణం UTC నుంచి ఎన్ని నిమిషాలు ముందు/వెనుక */
function offsetMinutes(utcMs, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const v = Object.fromEntries(parts.map((p) => [p.type, Number(p.value)]));
  const asUtc = Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second);
  return Math.round((asUtc - utcMs) / 60000);
}

/** "2026-11-26", "11:15", "Asia/Kolkata" → Date (UTC) */
export function zonedToUtc(date, time = "00:00", timeZone = "Asia/Kolkata") {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  // రెండుసార్లు సరిచేయడం: daylight saving మారే రోజుల్లో కూడా సరిగ్గా రావడానికి
  let utc = guess - offsetMinutes(guess, timeZone) * 60000;
  utc = guess - offsetMinutes(utc, timeZone) * 60000;
  return new Date(utc);
}

/** ICS / Google Calendar రూపం: 20261126T054500Z */
export const icsUtc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** పేజీలో చూపే తేదీ: ఆ భాషలో, ఆ timezone లో */
export function displayDate(date, time, timeZone, lang) {
  const d = zonedToUtc(date, time || "12:00", timeZone);
  const opts = { timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric" };
  if (time) Object.assign(opts, { hour: "numeric", minute: "2-digit" });
  try {
    return new Intl.DateTimeFormat(lang === "kok" ? "kok-IN" : `${lang}-IN`, opts).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-IN", opts).format(d);
  }
}

/** ముగింపు సమయం మాత్రమే, అదే భాష రూపంలో (ఉదా: "1:00 PM" / "మ 1:00") */
export function displayTime(date, time, timeZone, lang) {
  const d = zonedToUtc(date, time, timeZone);
  const opts = { timeZone, hour: "numeric", minute: "2-digit" };
  try {
    return new Intl.DateTimeFormat(`${lang}-IN`, opts).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-IN", opts).format(d);
  }
}
