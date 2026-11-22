# Changelog

## 1.1.0 (2026-11-22)

- **A font for every language.** `"fonts": { "te": "Ramabhadra", "en": "Playfair Display" }`. Pick from well-known Google Fonts for each script (88 in all: Telugu, Devanagari, Tamil, Kannada, Malayalam, Bengali, Gujarati, Gurmukhi, Odia, Urdu, Meetei Mayek, Ol Chiki and Latin).
- The build downloads only the letters the page uses (Google Fonts `text=`), saves them in `dist/fonts/` and adds them to the offline cache. Guests' phones never contact Google. With no internet the build still finishes and warns; the phone's own font is used.
- `template(type)` returns a template as an object. `FONTS`, `SCRIPT_OF` and `fontsFor(lang)` are exported.
- Used by the new Shubhalekha Maker (a form on the YuktAI site for people who don't code).

## 1.0.0 (2026-11-22)

First release.

- Invitation pages from one JSON file: wedding, engagement, housewarming, birthday, naming, annaprasana, aksharabhyasam, upanayanam, seemantham, shashtipurti, anniversary, puja, opening, memorial, and a digital business card.
- All 22 scheduled Indian languages and English. Buttons translated for 16; Urdu, Kashmiri and Sindhi right to left.
- `shubhalekha init`, `build` and `studio` (a no-code form that runs on your computer).
- `dist/`: index.html, app.js, style.css, sw.js, manifest.json, `<event>.ics`, og.jpg (1200 × 630), album-qr.png, site-qr.png, icons/ and img/ (photos resized to WebP).
- 24×7 guest assistant that answers only from your details, offline, in the guest's language.
- RSVP on WhatsApp or email, calendar for every event, maps, countdown, photo gallery.
- Installs as an app (PWA) and opens offline at the venue.
- Private by default: `noindex`, contacts hidden, nothing sent anywhere.
- 0 axe violations in light and dark mode on all 15 templates.
