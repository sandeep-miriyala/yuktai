// shubhalekha: guide for @yuktishaalaa/shubhalekha (invitation pages for Indian celebrations).
// Every number and version comes from src/data/site.ts.
import type { Metadata } from "next";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import { LINKS, VERSIONS } from "@/data/site";

export const metadata: Metadata = {
  title: "Shubhalekha: invitation pages",
  description:
    "Shubhalekha: invitation pages for weddings, upanayanam, gruhapravesam and 12 more Indian celebrations, in all 22 Indian languages. One JSON file or a no-code form, a 24×7 guest assistant, WhatsApp or email RSVP, and an app that opens offline. Free, no server.",
};

const v = VERSIONS.shubhalekha;

const startCode = `npx @yuktishaalaa/shubhalekha@${v} init our-wedding --type wedding
cd our-wedding
npm install
npm run build`;

const studioCode = `cd our-wedding
npm run studio
# open http://localhost:4321, fill in the form, press "Save & build"`;

const treeCode = `our-wedding/
├── wedding.json            the only file you change
├── photos/
│   ├── couple.jpg
│   └── invite-1.jpg
└── dist/                   after npm run build: publish this folder
    ├── index.html
    ├── app.js, style.css, sw.js, manifest.json
    ├── wedding.ics         every event, for any calendar
    ├── og.jpg              WhatsApp preview, 1200 × 630
    ├── album-qr.png        QR for your photo album
    ├── site-qr.png         QR for this page, to print on paper cards
    ├── icons/              app icons (PWA)
    └── img/                your photos, resized to WebP`;

const jsonCode = `{
  "type": "wedding",
  "languages": ["te", "en", "hi"],
  "title": { "te": "ప్రియ & అర్జున్", "en": "Priya & Arjun", "hi": "प्रिया और अर्जुन" },
  "photo": "photos/couple.jpg",
  "events": [
    { "name": { "te": "వివాహం", "en": "Wedding" }, "date": "2027-02-14", "time": "10:30",
      "venue": { "te": "శ్రీ కళ్యాణ మండపం", "en": "Sri Kalyana Mandapam" },
      "map": "https://maps.google.com/?q=..." }
  ],
  "rsvp": { "whatsapp": "+91 XXXXX XXXXX" },
  "faq": [
    { "q": { "en": "Is there parking?", "te": "Parking ఉందా?" },
      "a": { "en": "Yes, behind the mandapam.", "te": "ఉంది, మండపం వెనుక." } }
  ],
  "site": { "url": "https://our-wedding.vercel.app/" }
}`;

const codeUse = `import { build } from "@yuktishaalaa/shubhalekha"

const { outDir, warnings } = await build("./our-wedding")`;

const EVENTS: [string, string][] = [
  ["wedding", "వివాహం · Wedding"],
  ["engagement", "నిశ్చితార్థం · Engagement"],
  ["housewarming", "గృహప్రవేశం · Housewarming"],
  ["birthday", "పుట్టినరోజు · Birthday"],
  ["naming", "నామకరణం · Naming ceremony"],
  ["annaprasana", "అన్నప్రాశన · First rice"],
  ["aksharabhyasam", "అక్షరాభ్యాసం · First letters"],
  ["upanayanam", "ఉపనయనం · Sacred thread"],
  ["seemantham", "సీమంతం · Baby shower"],
  ["shashtipurti", "షష్టిపూర్తి · 60th birthday"],
  ["anniversary", "వార్షికోత్సవం · Anniversary"],
  ["puja", "పూజ, వ్రతం · Puja or vratam"],
  ["opening", "ప్రారంభోత్సవం · Shop or office opening"],
  ["memorial", "స్మరణ · Remembrance gathering"],
  ["card", "Digital business card with one-tap Save contact"],
];

const FIELDS: [string, string][] = [
  ["type", "One of the event types, or your own word"],
  ["languages", "For example [\"te\", \"en\"]. The first one shows by default"],
  ["timezone", "Default Asia/Kolkata. Use the event's own zone abroad"],
  ["theme", "traditional, modern or simple"],
  ["kicker, title, message", "The top of the page"],
  ["photo, photoAlt", "Main photo and its description. Also becomes og.jpg"],
  ["gallery[]", "Invitation cards and photos from photos/"],
  ["events[]", "name, date, time (24-hour), endTime, venue, address, map, note"],
  ["countdown", "{ \"event\": 1 } counts to the second event; false hides it"],
  ["rituals[]", "name and text for each ritual you want to explain"],
  ["rsvp", "whatsapp (with country code) and/or email"],
  ["faq[]", "q, a and optional keywords for the guest assistant"],
  ["album", "Shared photo album link; album-qr.png is made for it"],
  ["contacts", "{ \"show\": true, \"list\": [{ \"name\", \"role\", \"phone\" }] }"],
  ["site.url", "Your published address, for the WhatsApp preview and site-qr.png"],
  ["site.noindex", "true by default: search engines skip personal pages"],
  ["fonts", "One font per language, for example { \"te\": \"Ramabhadra\" }. Only the letters on the page are downloaded"],
];

function Code({ name, code }: { name: string; code: string }) {
  return (
    <div className={"codetabs"}><div className={"codefile"}>
      <div className={"codehead"}>
        <span className={"file"}>{name}</span>
        <button type={"button"} className={"copy-btn"} data-what={name}>
          <YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" />
          <span className={"copy-label"}>{"Copy"}</span>
          <span className={"sr-only"}>{` ${name}`}</span>
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div></div>
  );
}

export default function ShubhalekhaPage() {
  return (
    <>
      <div className={"page-head"}>
        <p className={"kicker"}><YuktaiIcon name="layout" className="i" size={24} aria-hidden="true" />{`Shubhalekha ${v}`}</p>
        <h1>{"Shubhalekha: invitation pages"}</h1>
        <p className={"lead"}>
          {"శుభలేఖ for every Indian celebration, in all 22 Indian languages. Fill in one file or a simple form, run one command, and publish a fast page your guests can open on any phone. A 24×7 assistant answers their questions, RSVP comes to your WhatsApp, and nothing is sent anywhere else. Free."}
        </p>
      </div>

      <div className={"callout"}>
        <p>
          <strong>{"Don't code? "}</strong>
          {"Make an invitation on your phone, in Telugu, in 3 steps: "}
          <a href={"make/"}>{"శుభలేఖ తయారీ"}</a>
          {". Four a month, free; everything is deleted 7 days after the event."}
        </p>
      </div>

      <h2 id={"choose"}>{"Pick your way"}</h2>
      <table className={"ref"}>
        <caption>{"Two ways to make the page"}</caption>
        <thead><tr><th scope={"col"}>{"You"}</th><th scope={"col"}>{"Use"}</th><th scope={"col"}>{"You edit"}</th></tr></thead>
        <tbody>
          <tr><td><a href={"#form"}>{"Prefer a form"}</a></td><td>{"npm run studio"}</td><td>{"A form in your browser, with a live preview"}</td></tr>
          <tr><td><a href={"#start"}>{"Are a developer"}</a></td><td>{"npm run build"}</td><td>{"One JSON file, for example wedding.json"}</td></tr>
        </tbody>
      </table>

      <h2 id={"start"} style={{ marginTop: "28px" }}>{"Start in one minute"}</h2>
      <Code name={"terminal"} code={startCode} />
      <p className={"hint"}>{"Needs Node.js 18 or newer. Publish the dist folder on Vercel, Netlify or GitHub Pages; all three are free."}</p>

      <h3 id={"folder"}>{"What you get"}</h3>
      <Code name={"our-wedding/"} code={treeCode} />

      <h2 id={"form"} style={{ marginTop: "28px" }}>{"No code: the Studio"}</h2>
      <div className={"demo"}>
        <p className={"demo-label"}><YuktaiIcon name="form" className="i" size={24} aria-hidden="true" />{"Shubhalekha Studio"}</p>
        <Code name={"terminal"} code={studioCode} />
        <ol>
          <li>{"Pick the celebration and the languages."}</li>
          <li>{"Fill in names, events, RSVP and the questions guests usually ask."}</li>
          <li>{"Add photos and invitation cards. They are resized for phones."}</li>
          <li>{"Press Save & build. The preview shows the page as a phone would."}</li>
        </ol>
        <p className={"hint"}>{"The Studio runs only on your computer and refuses requests from other websites."}</p>
      </div>

      <h2 id={"events"} style={{ marginTop: "28px" }}>{"Every kind of celebration"}</h2>
      <table className={"ref"}>
        <caption>{"--type, and what it is for"}</caption>
        <thead><tr><th scope={"col"}>{"--type"}</th><th scope={"col"}>{"Celebration"}</th></tr></thead>
        <tbody>{EVENTS.map(([k, t]) => <tr key={k}><td>{k}</td><td>{t}</td></tr>)}</tbody>
      </table>
      <p className={"hint"}>{"Any other celebration works too: set type to your own word and fill in the same fields."}</p>

      <h2 id={"guests"} style={{ marginTop: "28px" }}>{"What guests get"}</h2>
      <ul>
        <li><strong>{"Their language: "}</strong>{"all 22 scheduled Indian languages and English. Urdu, Kashmiri and Sindhi read right to left."}</li>
        <li><strong>{"A 24×7 assistant: "}</strong>{"time, place, RSVP, contacts and your own answers (parking, dress, food). It answers only from your details, works offline, and says so when it does not know."}</li>
        <li><strong>{"RSVP on WhatsApp or email, "}</strong>{"in the guest's language, straight to you."}</li>
        <li><strong>{"Calendar, maps, countdown, photos and QR codes."}</strong></li>
        <li><strong>{"An app: "}</strong>{"it installs on the phone and opens offline at the venue."}</li>
      </ul>

      <h2 id={"json"} style={{ marginTop: "28px" }}>{"The JSON file"}</h2>
      <p>{"Any text can be one string, or one value per language."}</p>
      <Code name={"wedding.json"} code={jsonCode} />
      <table className={"ref"}>
        <caption>{"Fields"}</caption>
        <thead><tr><th scope={"col"}>{"Field"}</th><th scope={"col"}>{"What it does"}</th></tr></thead>
        <tbody>{FIELDS.map(([k, t]) => <tr key={k}><td>{k}</td><td>{t}</td></tr>)}</tbody>
      </table>

      <h3 id={"code"}>{"From your own code"}</h3>
      <Code name={"build.mjs"} code={codeUse} />

      <h2 id={"languages"} style={{ marginTop: "28px" }}>{"Languages"}</h2>
      <p>{"Your own text can be in any of the 23 languages. Buttons and labels are translated for 16: English, Assamese, Bengali, Gujarati, Hindi, Kannada, Konkani, Malayalam, Marathi, Nepali, Odia, Punjabi, Sanskrit, Tamil, Telugu and Urdu. Until native speakers review a translation, Bodo, Dogri and Maithili buttons use Hindi, Kashmiri and Sindhi use Urdu, and Manipuri and Santali use English."}</p>

      <h3 id={"fonts"}>{"A font for each language"}</h3>
      <p>{"Pick a well-known font for each script: Ramabhadra, Mandali, NTR or Suranna for Telugu, Tiro Devanagari Hindi or Mukta for Hindi, Meera Inimai for Tamil, and more (88 in all). The build downloads only the letters your page uses, so a font is often a few KB, keeps them next to the page, and guests' phones never contact Google."}</p>

      <h2 id={"rules"} style={{ marginTop: "28px" }}>{"Private by default"}</h2>
      <ul>
        <li>{"No server, no account, no tracking. RSVP goes from the guest's phone to yours."}</li>
        <li>{"Search engines are told to skip the page, and contacts stay hidden until you switch them on."}</li>
        <li>{"The page shows dates and times. It does not choose a muhurtham: ask your purohit for that."}</li>
      </ul>

      <div className={"callout"}>
        <p>
          {"Source, issues and the full README: "}
          <a href={`${LINKS.github}/tree/main/packages/shubhalekha#readme`} target={"_blank"} rel={"noopener noreferrer"}>{"packages/shubhalekha"}<span className={"sr-only"}>{" (opens in a new tab)"}</span></a>
          {" · "}
          <a href={LINKS.npmShubhalekha} target={"_blank"} rel={"noopener noreferrer"}>{"npm"}<span className={"sr-only"}>{" (opens in a new tab)"}</span></a>
        </p>
      </div>
    </>
  );
}
