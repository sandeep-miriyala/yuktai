// event.json → index.html. ప్రతి భాగం ఒక చిన్న function; అన్నీ సాదా HTML strings.
import { esc, t, attr, pick } from "./lib/text.js";
import { displayDate, displayTime, zonedToUtc } from "./lib/time.js";
import { googleCalendarUrl } from "./lib/ics.js";
import { whatsappUrl, mailtoUrl, telUrl, digits } from "./lib/contact.js";
import { LANGUAGES, strings } from "./locales.js";

const ASK_PAGE = "https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page@1.0.2/dist/ask-page.global.js";
const A11Y = "https://cdn.jsdelivr.net/npm/@yuktishaalaa/a11y@6.0.4/dist/a11y.global.js";

/** UI మాట: అన్ని భాషల్లో (CSS ఒక్కటే చూపిస్తుంది) */
const ui = (key, langs) => t(Object.fromEntries(langs.map((l) => [l, strings(l)[key]])), langs);
const perLang = (langs, fn) => Object.fromEntries(langs.map((l) => [l, fn(l)]));

const icon = (name) => {
  const paths = {
    map: '<path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    phone: '<path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4 18l1.5-4A7.5 7.5 0 1 1 9 18.5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    save: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    photo: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    ask: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4M12 15.5v.01"/>',
    install: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 7v7M9 11l3 3 3-3"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  };
  return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
};

/** భాష CSS: ఎంచుకున్న భాష span మాత్రమే కనిపిస్తుంది; లేని భాషకు మొదటి భాష (data-l-xx) */
function langCss(langs) {
  if (langs.length < 2) return "";
  return langs.map((l) =>
    `html[data-lang="${l}"] [data-l]:not([data-l="${l}"]):not([data-l-${l}]){display:none}`).join("\n");
}

function head(config, { title, description }) {
  const url = config.site.url;
  const base = url ? (url.endsWith("/") ? url : `${url}/`) : null;
  const og = base && config.ogImage ? new URL(config.ogImage, base).href : null;
  const color = { traditional: "#7a1f1f", modern: "#1e3a5f", simple: "#333333" }[config.theme];
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${config.site.noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${url ? `<meta property="og:url" content="${esc(url)}">` : ""}
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">` : ""}
<meta name="theme-color" content="${color}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${esc(title.slice(0, 30))}">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="stylesheet" href="style.css">
<style>${langCss(config.languages)}</style>`;
}

function langSwitch(langs) {
  if (langs.length < 2) return "";
  const label = `Language / ${strings(langs[1]).language}`;
  if (langs.length <= 4) {
    return `<div class="langs" role="group" aria-label="${esc(label)}">
${langs.map((l, i) => `<button type="button" data-set-lang="${l}" lang="${l}"${LANGUAGES[l].dir ? ' dir="rtl"' : ""} aria-pressed="${i === 0}">${LANGUAGES[l].name}</button>`).join("")}
</div>`;
  }
  // చాలా భాషలు ఉంటే: ఒక్క dropdown (ఫోన్‌లో బటన్ల గోడ రాకుండా)
  return `<div class="langs"><label for="lang-select" class="sr-only">${esc(label)}</label>
<select id="lang-select" data-lang-select>
${langs.map((l) => `<option value="${l}" lang="${l}">${LANGUAGES[l].name}</option>`).join("")}
</select></div>`;
}

function hero(config, langs) {
  const photo = config.photo
    ? `<img class="hero-photo" src="${esc(config.photo)}" alt="${attr(config.photoAlt || config.title, langs)}" width="640" height="800" fetchpriority="high">`
    : `<div class="hero-mark" aria-hidden="true">✦</div>`;
  return `<header class="hero">
<div class="topbar">${langSwitch(langs)}
<button type="button" class="btn ghost small" id="install" hidden>${icon("install")}${ui("install", langs)}</button></div>
<p class="ios-hint" id="ios-hint" hidden>${ui("iosInstall", langs)}</p>
${photo}
${config.kicker ? `<p class="kicker">${t(config.kicker, langs)}</p>` : ""}
<h1 id="title">${t(config.title, langs)}</h1>
${config.message ? `<p class="message">${t(config.message, langs)}</p>` : ""}
</header>`;
}

const whenText = (config, ev, l) =>
  displayDate(ev.date, ev.time, config.timezone, l) + (ev.endTime ? ` – ${displayTime(ev.date, ev.endTime, config.timezone, l)}` : "");

function countdown(config, langs) {
  if (config.countdown === false) return "";
  const ev = config.events[config.countdown?.event ?? 0];
  const at = zonedToUtc(ev.date, ev.time || "09:00", config.timezone);
  // build సమయంలో సంఖ్య పెట్టం (పాతబడుతుంది). తేదీ చూపిస్తాం; JS సంఖ్యలు నింపుతుంది.
  return `<section class="countdown" aria-labelledby="cd-h" data-at="${at.toISOString()}">
<h2 id="cd-h" class="sr-only">${ui("countdownLabel", langs)}</h2>
<p class="cd-when">${t(perLang(langs, (l) => displayDate(ev.date, ev.time, config.timezone, l)), langs)}</p>
<div class="cd-boxes" hidden>
<div><span class="cd-n" data-u="d">0</span><span class="cd-u">${ui("days", langs)}</span></div>
<div><span class="cd-n" data-u="h">0</span><span class="cd-u">${ui("hours", langs)}</span></div>
<div><span class="cd-n" data-u="m">0</span><span class="cd-u">${ui("minutes", langs)}</span></div>
</div>
<p class="cd-done" hidden>${ui("started", langs)}</p>
</section>`;
}

function events(config, langs) {
  const items = config.events.map((ev, i) => `<li class="event" id="event-${i}">
<h3>${t(ev.name, langs)}</h3>
<p class="ev-when">${t(perLang(langs, (l) => whenText(config, ev, l)), langs)}</p>
${ev.venue ? `<p class="ev-venue">${t(ev.venue, langs)}${ev.address ? `<br><span class="muted">${esc(ev.address)}</span>` : ""}</p>` : ""}
${ev.note ? `<p class="muted">${t(ev.note, langs)}</p>` : ""}
<p class="ev-actions">
${ev.map ? `<a class="btn ghost" href="${esc(ev.map)}" target="_blank" rel="noopener">${icon("map")}${ui("map", langs)}</a>` : ""}
<a class="btn ghost" href="${esc(googleCalendarUrl(config, ev))}" target="_blank" rel="noopener">${icon("cal")}${ui("addToCalendar", langs)}</a>
</p>
</li>`);
  return `<section aria-labelledby="ev-h">
<h2 id="ev-h">${ui("events", langs)}</h2>
<ol class="events">${items.join("\n")}</ol>
<p><a class="btn" href="${esc(config.icsName)}" download>${icon("cal")}${ui("addAll", langs)}</a></p>
</section>`;
}

function rituals(config, langs) {
  if (!config.rituals?.length) return "";
  return `<section aria-labelledby="ri-h">
<h2 id="ri-h">${ui("rituals", langs)}</h2>
<dl class="rituals">${config.rituals.map((r) => `<div><dt>${t(r.name, langs)}</dt><dd>${t(r.text, langs)}</dd></div>`).join("")}</dl>
</section>`;
}

function rsvp(config, langs) {
  if (!config.rsvp) return "";
  const r = config.rsvp;
  // checkbox లో అన్ని భాషల పేరు కనిపిస్తుంది; సందేశంలోకి మొదటి భాష పేరు వెళ్తుంది
  const evItems = r.events
    ? r.events.map((n) => ({ label: esc(n), value: n }))
    : config.events.map((e) => ({ label: t(e.name, langs), value: pick(e.name, langs[0], langs) }));
  const subject = `RSVP: ${pick(config.title, langs[0], langs)}`;
  const s = perLang(langs, (l) => {
    const x = strings(l);
    return { hello: x.rsvpHello, from: x.rsvpFrom, guests: x.rsvpGuests, events: x.rsvpEvents, needName: x.needName };
  });
  return `<section aria-labelledby="rs-h" id="rsvp-section">
<h2 id="rs-h">${ui("rsvp", langs)}</h2>
<form class="rsvp" id="rsvp" novalidate
  data-title="${esc(pick(config.title, langs[0], langs))}"
  ${r.whatsapp ? `data-wa="${digits(r.whatsapp)}"` : ""} ${r.email ? `data-email="${esc(r.email)}" data-subject="${esc(subject)}"` : ""}
  data-strings="${esc(JSON.stringify(s))}">
<p><label for="rs-name">${ui("yourName", langs)}</label>
<input id="rs-name" name="name" autocomplete="name" required aria-describedby="rs-err"></p>
<p><label for="rs-guests">${ui("guests", langs)}</label>
<input id="rs-guests" name="guests" type="number" inputmode="numeric" min="1" max="50" value="1"></p>
<fieldset><legend>${ui("attending", langs)}</legend>
${evItems.map((e) => `<label class="check"><input type="checkbox" name="events" value="${esc(e.value)}" checked> ${e.label}</label>`).join("\n")}
</fieldset>
<p id="rs-err" class="error" role="alert"></p>
<p class="rsvp-send">
${r.whatsapp ? `<button type="submit" name="via" value="wa" class="btn">${icon("chat")}${ui("sendWhatsapp", langs)}</button>` : ""}
${r.email ? `<button type="submit" name="via" value="mail" class="btn ${r.whatsapp ? "ghost" : ""}">${icon("mail")}${ui("sendEmail", langs)}</button>` : ""}
</p>
<noscript><p>
${r.whatsapp ? `<a href="${esc(whatsappUrl(r.whatsapp, subject))}">${ui("sendWhatsapp", langs)}</a>` : ""}
${r.email ? ` · <a href="${esc(mailtoUrl(r.email, subject))}">${ui("sendEmail", langs)}</a>` : ""}
</p></noscript>
</form>
</section>`;
}

const qrImg = (src, alt) => `<img src="${src}" alt="${esc(alt)}" width="168" height="168" loading="lazy">`;

function gallery(config, langs) {
  if (!config.gallery?.length) return "";
  return `<section aria-labelledby="ga-h">
<h2 id="ga-h">${ui("photos", langs)}</h2>
<div class="gallery">${config.gallery.map((g) => `<figure><img src="${esc(g.src)}" alt="${attr(g.alt || "", langs)}" loading="lazy" decoding="async">${g.caption ? `<figcaption>${t(g.caption, langs)}</figcaption>` : ""}</figure>`).join("")}</div>
</section>`;
}

function album(config, langs) {
  if (!config.album) return "";
  const qr = config.qr || {};
  return `<section aria-labelledby="al-h">
<h2 id="al-h">${ui("album", langs)}</h2>
<p><a class="btn" href="${esc(config.album)}" target="_blank" rel="noopener">${icon("photo")}${ui("openAlbum", langs)}</a></p>
${qr.album ? `<figure class="qr">${qrImg(qr.album, "QR code: " + strings(langs[0]).openAlbum)}</figure>` : ""}
</section>`;
}

function contacts(config, langs) {
  const c = config.contacts;
  if (!c?.show || !c.list?.length) return "";
  return `<section aria-labelledby="co-h" id="contacts-section">
<h2 id="co-h">${ui("contacts", langs)}</h2>
<ul class="contacts">${c.list.map((p) => `<li><strong>${t(p.name, langs)}</strong>${p.role ? ` <span class="muted">${t(p.role, langs)}</span>` : ""}
<span class="row">${p.phone ? `<a class="btn ghost" href="${telUrl(p.phone)}">${icon("phone")}${ui("call", langs)}</a> <a class="btn ghost" href="${esc(whatsappUrl(p.phone))}" target="_blank" rel="noopener">${icon("chat")}${ui("whatsapp", langs)}</a>` : ""}</span></li>`).join("")}</ul>
</section>`;
}

/** 24×7 సహాయకుడు: event.json లోని వివరాల నుంచే జవాబులు, ఫోన్‌లోనే, offline లోనూ */
function assistantData(config, langs) {
  const L = (v) => perLang(langs, (l) => pick(v, l, langs));
  const showContacts = config.contacts?.show && config.contacts.list?.length;
  return {
    langs,
    ui: perLang(langs, (l) => {
      const s = strings(l);
      return {
        when: s.qWhen, where: s.qWhere, rsvp: s.qRsvp, contact: s.qContact, noAnswer: s.noAnswer,
        map: s.map, call: s.call, sendWhatsapp: s.sendWhatsapp, sendEmail: s.sendEmail, rsvpTitle: s.rsvp,
      };
    }),
    events: config.events.map((ev, i) => ({
      id: i,
      name: L(ev.name),
      when: perLang(langs, (l) => whenText(config, ev, l)),
      venue: ev.venue ? L(ev.venue) : null,
      address: ev.address || "",
      map: ev.map || "",
      note: ev.note ? L(ev.note) : null,
    })),
    faq: (config.faq || []).map((f) => ({ q: L(f.q), a: L(f.a), keywords: f.keywords || [] })),
    rsvp: config.rsvp ? { wa: !!config.rsvp.whatsapp, email: !!config.rsvp.email } : null,
    contacts: showContacts ? config.contacts.list.map((p) => ({ name: L(p.name), role: p.role ? L(p.role) : null, tel: p.phone ? telUrl(p.phone) : "" })) : [],
  };
}

function assistant(config, langs) {
  if (config.assistant?.enabled === false) return "";
  const data = JSON.stringify(assistantData(config, langs)).replace(/</g, "\\u003c");
  return `<button type="button" class="ask-fab" id="ask-open" aria-haspopup="dialog" aria-controls="ask">${icon("ask")}<span>${ui("ask", langs)}</span></button>
<dialog class="ask" id="ask" aria-labelledby="ask-h">
<div class="ask-head">
<h2 id="ask-h">${ui("askTitle", langs)}</h2>
<button type="button" class="ask-x" id="ask-close" aria-label="${attr(strings(langs[0]).close, langs)}">${icon("close")}</button>
</div>
<div class="ask-chips" id="ask-chips"></div>
<div class="ask-log" id="ask-log" role="log" aria-live="polite"></div>
<form class="ask-form" id="ask-form">
<label for="ask-q" class="sr-only">${ui("askPlaceholder", langs)}</label>
<input id="ask-q" autocomplete="off" enterkeyhint="send">
<button type="submit" class="btn" aria-label="${attr(strings(langs[0]).askSend, langs)}">${icon("send")}</button>
</form>
</dialog>
<script type="application/json" id="shubhalekha-data">${data}</script>
<script type="application/json" id="shubhalekha-placeholders">${JSON.stringify(perLang(langs, (l) => strings(l).askPlaceholder)).replace(/</g, "\\u003c")}</script>`;
}

function footer(config, langs) {
  const qr = config.qr || {};
  return `<footer class="foot">
${qr.site ? `<figure class="qr">${qrImg(qr.site, "QR code: " + strings(langs[0]).scan)}<figcaption>${ui("scan", langs)}</figcaption></figure>` : ""}
<p>${ui("footer", langs)}</p>
</footer>`;
}

function scripts(config) {
  const out = ['<script src="app.js" defer></script>'];
  if (config.a11y) out.push(`<script src="${A11Y}" defer></script>`);
  // మరింత లోతైన ప్రశ్నలకు: YuktAI ask-page (ఐచ్ఛికం; page text, ప్రశ్నలు పరికరం దాటి వెళ్ళవు)
  if (config.assistant?.askPage) out.push(`<script src="${ASK_PAGE}" defer></script>`);
  return out.join("\n");
}

const htmlOpen = (config) => {
  const l = config.languages[0];
  return `<html lang="${l}"${LANGUAGES[l].dir ? ' dir="rtl"' : ""} data-lang="${l}" data-theme-name="${config.theme}">`;
};

export function renderEvent(config) {
  const langs = config.languages;
  const title = pick(config.title, langs[0], langs);
  const first = config.events[0];
  const description = pick(config.description, langs[0], langs) ||
    `${title} · ${displayDate(first.date, first.time, config.timezone, langs[0])}`;
  return `<!doctype html>
${htmlOpen(config)}
<head>
${head(config, { title, description })}
</head>
<body data-yuktai-a11y="auto" data-yuktai-level="AA">
<a class="skip" href="#main">${ui("skip", langs)}</a>
${hero(config, langs)}
<main id="main">
${countdown(config, langs)}
${events(config, langs)}
${rituals(config, langs)}
${gallery(config, langs)}
${rsvp(config, langs)}
${album(config, langs)}
${contacts(config, langs)}
</main>
${footer(config, langs)}
${assistant(config, langs)}
${scripts(config)}
</body>
</html>
`;
}

export function renderCard(config) {
  const langs = config.languages;
  const name = pick(config.name, langs[0], langs);
  const description = [pick(config.role, langs[0], langs), pick(config.business, langs[0], langs)].filter(Boolean).join(" · ");
  const wa = config.whatsapp || config.phone;
  const btn = (href, ic, key, extra = "") => `<a class="btn" href="${esc(href)}"${extra}>${icon(ic)}${ui(key, langs)}</a>`;
  return `<!doctype html>
${htmlOpen(config)}
<head>
${head(config, { title: name, description })}
</head>
<body class="card-page" data-yuktai-a11y="auto" data-yuktai-level="AA">
<a class="skip" href="#main">${ui("skip", langs)}</a>
<main id="main" class="card">
<div class="topbar">${langSwitch(langs)}
<button type="button" class="btn ghost small" id="install" hidden>${icon("install")}${ui("install", langs)}</button></div>
<p class="ios-hint" id="ios-hint" hidden>${ui("iosInstall", langs)}</p>
${config.photo ? `<img class="card-photo" src="${esc(config.photo)}" alt="${attr(config.photoAlt || config.name, langs)}" width="240" height="240">` : ""}
<h1 id="title">${t(config.name, langs)}</h1>
${config.role ? `<p class="kicker">${t(config.role, langs)}</p>` : ""}
${config.business ? `<p class="business">${t(config.business, langs)}</p>` : ""}
${config.about ? `<p class="message">${t(config.about, langs)}</p>` : ""}
<p class="card-actions">
${config.phone ? btn(telUrl(config.phone), "phone", "call") : ""}
${wa ? btn(whatsappUrl(wa), "chat", "whatsapp", ' target="_blank" rel="noopener"') : ""}
${config.email ? btn(mailtoUrl(config.email), "mail", "email") : ""}
${config.website ? btn(config.website, "web", "website", ' target="_blank" rel="noopener"') : ""}
${config.map ? btn(config.map, "map", "map", ' target="_blank" rel="noopener"') : ""}
</p>
<p><a class="btn wide" href="contact.vcf" download>${icon("save")}${ui("saveContact", langs)}</a></p>
${config.services?.length ? `<section aria-labelledby="sv-h"><h2 id="sv-h">${ui("services", langs)}</h2><ul class="services">${config.services.map((s) => `<li>${t(s, langs)}</li>`).join("")}</ul></section>` : ""}
${config.address ? `<p class="muted">${esc(config.address)}</p>` : ""}
</main>
${footer(config, langs)}
${scripts(config)}
</body>
</html>
`;
}
