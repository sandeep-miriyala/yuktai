# శుభలేఖ · Shubhalekha

Invitation pages for every Indian celebration, in all 22 Indian languages. Fill in one JSON file (or a simple form), run one command, and publish a fast, private page your guests can open on any phone.

A sister package of [YuktAI](https://github.com/sandeep-miriyala/yuktai). Made by Sandeep Miriyala, Yuktishaalaa AI Lab. Free and open source (GPL-3.0).

Guide and examples: https://sandeep-miriyala.github.io/yuktai/shubhalekha/

## What your folder looks like

```
our-wedding/
├── wedding.json            ← the only file you change
├── photos/
│   ├── couple.jpg
│   └── invite-1.jpg
└── dist/                   ← after `npm run build`: publish this on Vercel / GitHub Pages
    ├── index.html
    ├── app.js, style.css, sw.js, manifest.json
    ├── wedding.ics         ← every event, for any calendar
    ├── og.jpg              ← WhatsApp preview, 1200 × 630
    ├── album-qr.png        ← QR for your photo album
    ├── site-qr.png         ← QR for this page, to print on paper cards
    ├── icons/              ← app icons
    └── img/                ← your photos, resized and compressed (WebP)
```

## Start

```bash
npx @yuktishaalaa/shubhalekha init our-wedding --type wedding
cd our-wedding
npm install
npm run build
```

Prefer a form to JSON? Run `npm run studio` and open http://localhost:4321. Fill it in, add photos, press **Save & build**, and see the preview next to the form. The Studio runs only on your computer.

## Every kind of celebration

| `--type` | Event |
|---|---|
| `wedding` | వివాహం · Wedding |
| `engagement` | నిశ్చితార్థం · Engagement |
| `housewarming` | గృహప్రవేశం · Housewarming |
| `birthday` | పుట్టినరోజు · Birthday |
| `naming` | నామకరణం · Naming ceremony |
| `annaprasana` | అన్నప్రాశన · First rice |
| `aksharabhyasam` | అక్షరాభ్యాసం · First letters |
| `upanayanam` | ఉపనయనం · Sacred thread |
| `seemantham` | సీమంతం · Baby shower |
| `shashtipurti` | షష్టిపూర్తి · 60th birthday |
| `anniversary` | వార్షికోత్సవం · Anniversary |
| `puja` | పూజ, వ్రతం · Puja or vratam |
| `opening` | ప్రారంభోత్సవం · Shop or office opening |
| `memorial` | స్మరణ · Remembrance gathering |
| `card` | Digital business card with one-tap "Save contact" |

Any other celebration works too: set `"type"` to your own word and fill in the same fields.

## What guests get

- **Their language:** all 22 scheduled Indian languages and English. Urdu, Kashmiri and Sindhi read right to left. With more than four languages, a dropdown replaces the buttons.
- **A 24×7 assistant:** guests tap "Ask" and get answers about time, place, RSVP, contacts and your own questions (parking, dress, food). It answers only from your details, works offline and sends nothing anywhere. If it does not know, it says so.
- **RSVP on WhatsApp or email:** the message goes straight to you, in the guest's language.
- **Calendar, maps, countdown, photo album, QR codes.**
- **Installs like an app (PWA)** and opens offline at the venue.
- **Accessible:** 0 axe violations in light and dark mode on every template. The YuktAI a11y script adds read-aloud and contrast help.
- **Private by default:** `noindex` is on and contacts stay hidden until you switch them on.

## The JSON file

Any text can be a plain string, or one value per language:

```json
"title": { "en": "Priya & Arjun", "te": "ప్రియ & అర్జున్", "hi": "प्रिया और अर्जुन" }
```

| Field | What it does |
|---|---|
| `type` | One of the types above, or your own word |
| `languages` | For example `["te", "en", "hi"]`. The first one shows by default |
| `timezone` | Default `Asia/Kolkata`. Use the event's own zone abroad, like `America/New_York` |
| `theme` | `traditional`, `modern` or `simple` |
| `kicker`, `title`, `message` | The top of the page |
| `photo`, `photoAlt` | Main photo (`photos/couple.jpg`) and its description for screen readers. Also becomes `og.jpg` |
| `ogImage` | A different photo for the WhatsApp preview |
| `gallery[]` | Invitation cards and photos: `{ "src": "photos/invite-1.jpg", "alt": {...} }` |
| `events[]` | `name`, `date` (`2027-02-14`), `time` (`10:30`, 24-hour), `endTime`, `venue`, `address`, `map`, `note` |
| `countdown` | `{ "event": 1 }` counts down to the second event. `false` hides it |
| `rituals[]` | `name` and `text` for each ritual you want to explain |
| `rsvp` | `whatsapp` (with country code) and/or `email`. Leave it out for no RSVP |
| `faq[]` | `q`, `a` and optional `keywords` for the assistant |
| `album` | Shared photo album link. `album-qr.png` is made for it |
| `contacts` | `{ "show": true, "list": [{ "name", "role", "phone" }] }` |
| `site.url` | Your published address. Needed for the WhatsApp preview and `site-qr.png` |
| `site.noindex` | `true` by default |
| `assistant` | `{ "enabled": true }` by default. `"askPage": true` also loads YuktAI ask-page |
| `a11y` | `false` turns off the YuktAI accessibility script |

## Use from code

```js
import { build } from "@yuktishaalaa/shubhalekha";

const { outDir, warnings } = await build("./our-wedding");
```

## Languages

Your own text can be in any of the 23 languages. Buttons and labels are translated for 16: English, Assamese, Bengali, Gujarati, Hindi, Kannada, Konkani, Malayalam, Marathi, Nepali, Odia, Punjabi, Sanskrit, Tamil, Telugu and Urdu. Until native speakers review a translation, Bodo, Dogri and Maithili buttons use Hindi, Kashmiri and Sindhi use Urdu, and Manipuri and Santali use English. Pull requests are welcome.

## Notes

- Photos are resized to 1600 px wide and saved as WebP, so a 5 MB camera photo becomes a few hundred KB.
- Videos make the page heavy on mobile data. Share a YouTube or Drive link instead.
- Rituals differ between families and regions. Write them the way your family does them.
- The page shows dates and times. It does not choose a muhurtham. Ask your purohit for that.
