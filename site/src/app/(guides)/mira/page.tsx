// mira: MiRa (మిరా), Telugu for every HTML element. The live part is src/components/mira/MiraLive.tsx.
import type { Metadata } from "next";
import Script from "next/script";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import GuideDemo from "@/components/guides/GuideDemo";
import MiraLive from "@/components/mira/MiraLive";
import { LINKS, MIRA_FONTS, VERSIONS } from "@/data/site";

export const metadata: Metadata = {
  title: "MiRa (మిరా): Telugu fonts for every HTML element",
  description: "Write <mira h1 font=\"ntr\">మిరా</mira h1> and get a real <h1 lang=\"te\"> in one of 22 free Telugu fonts. One script tag, Rust/WebAssembly, nothing sent to Google. Try it live.",
};

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

function Code({ name, id, children }: { name: string; id: string; children: string }) {
  return (
    <div className="codetabs">
      <div className="codefile">
        <div className="codehead">
          <span className="file" id={`${id}-name`}>{name}</span>
          <button type="button" className="copy-btn" data-what={name}>
            <YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" />
            <span className="copy-label">Copy</span><span className="sr-only">{` ${name}`}</span>
          </button>
        </div>
        <pre><code id={id}>{children}</code></pre>
      </div>
    </div>
  );
}

export default function MiraPage() {
  return (
    <>
      <div className="page-head">
        <p className="kicker"><YuktaiIcon name="star" className="i" size={24} aria-hidden="true" />MiRa (మిరా) · npm {VERSIONS.mira}</p>
        <h1>MiRa: Telugu for every HTML element</h1>
        <p className="lead">
          Write the element and a Telugu font name. MiRa gives the real tag, <code>lang=&quot;te&quot;</code> and a free Telugu font
          that loads only for Telugu letters. 22 fonts, 101 HTML elements, one script tag. The rules are written in Rust and run in
          the browser as WebAssembly.
        </p>
        <p className="mira-dedication" lang="te">
          డాక్టర్ శ్రీ మిరియాల రామకృష్ణ గారి (మిరా) స్మృతికి అంకితం: రచయిత, పరిశోధకుడు, 36 ఏళ్ళు తెలుగు నేర్పిన గురువు.
        </p>
      </div>

      <h2 id="live">Try it live</h2>
      <MiraLive />

      <h2 id="use">Use it</h2>
      <p>One line in any HTML page. Nothing to build, no API key.</p>
      <Code name="index.html" id="mira-html">{`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira@${VERSIONS.mira}" defer></script>
</head>
<body mira="mandali">
  <mira h1 font="ntr">మిరా</mira h1>
  <mira p font="ramabhadra">ఒక్క పద్యం చాలు</mira p>
  <mira input font="mandali" placeholder="మీ పేరు">
</body>
</html>`}</Code>
      <p>The browser gets ordinary HTML:</p>
      <Code name="What MiRa makes" id="mira-out">{`<body class="mira-font-mandali">
  <h1 lang="te" class="mira-font-ntr">మిరా</h1>
  <p lang="te" class="mira-font-ramabhadra">ఒక్క పద్యం చాలు</p>
  <input placeholder="మీ పేరు" lang="te" class="mira-font-mandali">
</body>`}</Code>
      <p>With npm, in a browser app (Vite, React):</p>
      <Code name="Terminal" id="mira-npm">{`npm i @yuktishaalaa/mira@${VERSIONS.mira}`}</Code>
      <Code name="main.js" id="mira-import">{`import "@yuktishaalaa/mira"; // then write <h1 mira="ntr">మిరా</h1> in your components`}</Code>
      <p>
        In <strong>Next.js</strong>, load it in the browser only (the server has no <code>window</code>): add{" "}
        <code>{`<Script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira@${VERSIONS.mira}" />`}</code> from{" "}
        <code>next/script</code> to the layout, and write <code>{`<h1 mira="ntr">`}</code> in JSX.
      </p>

      <h2 id="write">How to write it</h2>
      <table className="ref">
        <caption>Four forms</caption>
        <thead><tr><th scope="col">Write</th><th scope="col">For</th></tr></thead>
        <tbody>
          <tr><td><code>{`<mira h1 font="ntr">మిరా</mira h1>`}</code></td><td>Any element: <code>h1</code>–<code>h6</code>, <code>p</code>, <code>span</code>, <code>a</code>, <code>button</code>, <code>label</code>, <code>li</code>, <code>section</code>, <code>nav</code>, <code>form</code>, <code>code</code>… 101 in all</td></tr>
          <tr><td><code>{`<mira input font="mandali" placeholder="మీ పేరు">`}</code></td><td>Elements with no closing tag (<code>input</code>, <code>img</code>, <code>br</code>, <code>hr</code>). In plain HTML write no <code>{`</mira input>`}</code></td></tr>
          <tr><td><code>{`<h1 mira="ntr">మిరా</h1>`}</code></td><td>React, Vue, JSX, anywhere. Also tables and selects: <code>{`<table mira="ntr">`}</code>, <code>{`<td mira="ntr">`}</code>, <code>{`<option mira="ntr">`}</code></td></tr>
          <tr><td><code>{`<body mira="mandali">`}</code></td><td>The whole page: one font, and every element with Telugu text gets <code>lang=&quot;te&quot;</code></td></tr>
          <tr><td><code>{`<mira p truncate="20">…</mira p>`}</code></td><td>Cut to 20 letters, never in the middle of క్ష్మి. The full text goes in <code>title</code></td></tr>
        </tbody>
      </table>
      <div className="grid2">
        <div className="card"><h3><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /> Telugu letters only</h3><p>Each font covers the Telugu block only, so English and numbers keep your page&apos;s font. Only the fonts a page uses are downloaded.</p></div>
        <div className="card"><h3><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /> Added later, handled too</h3><p>Elements that React or fetch add after the page loads get the same treatment. Without JavaScript the text is still there.</p></div>
        <div className="card"><h3><YuktaiIcon name="info" className="i" size={24} aria-hidden="true" /> Tables need the attribute</h3><p>Before any script runs, the browser drops unknown tags inside a table or a select. Use <code>{`<table mira="ntr">`}</code> there; the console says so in Telugu and English.</p></div>
        <div className="card"><h3><YuktaiIcon name="info" className="i" size={24} aria-hidden="true" /> A wrong name gets a hint</h3><p><code>font=&quot;tleugu&quot;</code> prints <span lang="te">&quot;tleugu&quot; అనే font లేదు. &quot;telugu&quot; అనుకుంటున్నారా?</span> in the console.</p></div>
      </div>

      <h2 id="fonts">The 22 fonts</h2>
      <p>
        All free under the SIL Open Font License 1.1, served unchanged from the Fontsource npm packages. Most were drawn for{" "}
        <a href={LINKS.siliconAndhra} {...ext}>Silicon Andhra<NewTab /></a> by <strong>Appaji Ambarisha Darbha</strong> and{" "}
        <strong>Purushoth Kumar Guthula</strong>.
      </p>
      <div className="table-box" tabIndex={0} role="region" aria-label="MiRa fonts (the table scrolls sideways)">
        <table className="ref mira-fonts">
          <caption>Write the name in font=&quot;…&quot;</caption>
          <thead><tr><th scope="col">font=&quot;…&quot;</th><th scope="col">Sample</th><th scope="col">Designer</th><th scope="col">Suits</th></tr></thead>
          <tbody>
            {MIRA_FONTS.map((f) => (
              <tr key={f.key}>
                <td><code>{f.key}</code></td>
                <td><span {...{ mira: f.key }} lang="te">లక్ష్మి స్త్రీ కృష్ణ</span><span className="sr-only">, in {f.family}</span></td>
                <td>{f.designer}</td>
                <td>{f.suits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="api">In page scripts</h2>
      <Code name="app.js" id="mira-api">{`mira.count("లక్ష్మి కృష్ణ")          // 4 letters (JavaScript's .length says 13)
mira.split("లక్ష్మి")                 // ["ల", "క్ష్మి"]
mira.truncate("ఒక్క పద్యం చాలు", 2)   // "ఒక్క…"
mira.html(pageText)                   // the same as mira build
mira.fonts()                          // the 22 names`}</Code>

      <h2 id="build">At build time (Rust)</h2>
      <p>The same Rust rules run on HTML files, so the browser gets finished HTML and needs no script. Tests check that the browser and <code>mira build</code> give the same page.</p>
      <Code name="Terminal" id="mira-cli">{`cargo install --path rust/mira
mira build page.html -o out.html          # real tags, lang, and the font CSS in <head>
mira build page.html --fonts /fonts/ -o out.html
mira check page.html                      # warnings only, for CI
mira fonts                                # the fonts and their designers`}</Code>

      <h2 id="privacy">Privacy</h2>
      <p>
        <strong>No request goes to Google.</strong> MiRa and the fonts come from npm through jsDelivr. To serve everything from your own
        server, copy <code>@fontsource/&lt;font&gt;@5.3.0/files/</code> and point MiRa at it with{" "}
        <code>{`<script src="/mira.js" data-mira-fonts="/fonts/" defer>`}</code>.
      </p>

      <h2 id="thanks">Thanks</h2>
      <p lang="te" className="mira-thanks">
        తెలుగు ఫాంట్లను ప్రతి ఒక్కరికీ ఉచితంగా అందించాలనే గొప్ప లక్ష్యంతో పనిచేస్తున్న <a href={LINKS.siliconAndhra} {...ext}>సిలికానాంధ్ర<NewTab /></a>,
        FreeTeluguFonts.com, telugufonts.in బృందాల కృషి ఎంతో అభినందనీయం. మన తెలుగు లిపికి ఆధునిక యూనికోడ్ ఓపెన్‌టైప్ (OpenType) సాంకేతికతను జోడించి,
        ఎంతో ఓపికతో, శ్రమతో అందమైన ఫాంట్లను రూపొందించి ఉచితంగా అందిస్తున్న <strong>శ్రీ అప్పాజీ అంబరీష దర్భ గారికి</strong>,{" "}
        <strong>శ్రీ పురుషోత్ కుమార్ గుత్తుల గారికి</strong> మనస్ఫూర్తిగా ధన్యవాదాలు. తెలుగు భాషను డిజిటల్ రూపంలో ముందుకు తీసుకెళ్తున్న మీ సేవలు
        ఎప్పటికీ గుర్తుండిపోతాయి!
      </p>
      <p>
        <a href={LINKS.npmMira} {...ext}>npm: @yuktishaalaa/mira<NewTab /></a> ·{" "}
        <a href={`${LINKS.github}/tree/main/packages/mira`} {...ext}>Source on GitHub<NewTab /></a> ·{" "}
        <a href={`${LINKS.github}/blob/main/packages/mira/CREDITS.md`} {...ext}>Every font&apos;s copyright<NewTab /></a>
      </p>

      <GuideDemo page="mira" />
      <MiraFontsOnThisPage />
    </>
  );
}

/** The sample column uses MiRa itself, from npm. */
function MiraFontsOnThisPage() {
  return <Script src={`https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira@${VERSIONS.mira}`} strategy="afterInteractive" />;
}
