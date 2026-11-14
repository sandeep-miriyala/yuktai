// assistant: download page for the YuktAI Assistant (new in 6.0).
// The extension zip is served from site/public/downloads/.
import type { Metadata } from "next";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import { asset } from "@/lib/base";
import { VERSIONS } from "@/data/site";

export const metadata: Metadata = {
  title: "YuktAI Assistant",
  description:
    "YuktAI Assistant 6.0: accessibility and Ask this page in one panel. Download the browser extension for Chrome and Edge, paste one script into any website, or npm install for React and Next.js. Runs on your device.",
};

const v = VERSIONS.assistant;
const zip = `yuktai-assistant-chrome-edge-${v}.zip`;

const scriptCode = `<!-- before </body> -->
<script>
  window.YuktaiAssistantConfig = {
    features: ["ask", "a11y"],   // Ask this page + accessibility
    level: "AA",                 // "AA" | "AAA" | "off"
    contrast: "check",           // "check" | "fix" (darken faint text)
    mode: "auto",                // "auto" (safe fixes) | "check" (report only)
    title: "YuktAI Assistant",   // panel name: your site's name
    color: "#2F43C4",            // button colour: your brand colour
    side: "right",               // "right" | "left"
    offset: 20,                  // px from the corner, or { x: 20, y: 90 } above a chat button
    panelLang: "auto",           // "auto" | "en" | "te" | "hi" (visitors can change it)
    shortcut: true,              // Alt+Shift+Y opens and closes the panel
    launcher: true,              // false: no ♿ button (open it from your own button)
    ask: { modes: ["fast", "balanced"] }  // Ask this page options
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/assistant@${v}/dist/assistant.global.js" defer></script>`;

const nextCode = `// app/layout.tsx
import { YuktaiAssistant } from "@yuktishaalaa/assistant/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <YuktaiAssistant features={["ask", "a11y"]} level="AA" title="YuktAI Assistant" color="#2F43C4" />
      </body>
    </html>
  )
}`;

const reactCode = `import { useEffect } from "react"
import { mountAssistant } from "@yuktishaalaa/assistant"

useEffect(() => {
  const assistant = mountAssistant({ features: ["ask", "a11y"], level: "AA", title: "YuktAI Assistant", color: "#2F43C4" })
  return () => assistant.destroy()
}, [])`;

const attrCode = `<!-- accessibility only, no panel: one attribute + one script -->
<body data-yuktai-a11y="auto" data-yuktai-level="AA" data-yuktai-speak="on">
  ...
  <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/a11y@${v}/dist/a11y.global.js" defer></script>
</body>`;

function Code({ name, code }: { name: string; code: string }) {
  return (
    <div className={"codefile"}>
      <div className={"codehead"}>
        <span className={"file"}>{name}</span>
        <button type={"button"} className={"copy-btn"} data-what={name}>
          <YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" />
          <span className={"copy-label"}>{"Copy"}</span>
          <span className={"sr-only"}>{` ${name}`}</span>
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <>
      <div className={"page-head"}>
        <p className={"kicker"}><YuktaiIcon name="accessibility" className="i" size={24} aria-hidden="true" />{`YuktAI Assistant ${v}`}</p>
        <h1>{"YuktAI Assistant"}</h1>
        <p className={"lead"}>{"Accessibility and Ask this page in one panel: colours, dark mode, text size, read aloud in the right voice, safe fixes with a WCAG report, and answers from the page itself. It runs on your device. Nothing is sent anywhere, and it is free."}</p>
      </div>

      <h2 id={"choose"}>{"Pick your way"}</h2>
      <table className={"ref"}>
        <caption>{"Three ways to get the YuktAI Assistant"}</caption>
        <thead><tr><th scope={"col"}>{"You are"}</th><th scope={"col"}>{"Get"}</th><th scope={"col"}>{"Works in"}</th></tr></thead>
        <tbody>
          <tr><td><a href={"#download"}>{"Someone who uses websites"}</a></td><td>{"The browser extension (zip)"}</td><td>{"Chrome, Edge, Brave on a computer, on every site"}</td></tr>
          <tr><td><a href={"#script"}>{"A website owner"}</a></td><td>{"One script to paste"}</td><td>{"Your site, for every visitor, on computers and phones"}</td></tr>
          <tr><td><a href={"#npm"}>{"A React or Next.js developer"}</a></td><td>{"The npm package"}</td><td>{"Your app, for every visitor, on computers and phones"}</td></tr>
        </tbody>
      </table>

      <h2 id={"download"} style={{ marginTop: "28px" }}>{"For your computer: download the extension"}</h2>
      <div className={"demo"}>
        <p className={"demo-label"}><YuktaiIcon name="install" className="i" size={24} aria-hidden="true" />{"Chrome, Edge and Brave"}</p>
        <p>
          <a className={"btn primary"} href={asset(`/downloads/${zip}`)} download>
            <YuktaiIcon name="install" className="i" size={24} aria-hidden="true" />
            {`Download the zip (${v})`}
          </a>
        </p>
        <ol>
          <li>{"Unzip the file. You get a folder."}</li>
          <li>{"Open "}<code>{"chrome://extensions"}</code>{" (in Edge: "}<code>{"edge://extensions"}</code>{") and switch on "}<strong>{"Developer mode"}</strong>{"."}</li>
          <li>{"Press "}<strong>{"Load unpacked"}</strong>{" and pick the folder."}</li>
          <li>{"On any website, press the YuktAI button in the toolbar, or "}<kbd>{"Alt"}</kbd>{" + "}<kbd>{"Shift"}</kbd>{" + "}<kbd>{"Y"}</kbd>{". "}<kbd>{"Alt"}</kbd>{" + "}<kbd>{"Shift"}</kbd>{" + "}<kbd>{"A"}</kbd>{" asks the page."}</li>
        </ol>
        <p className={"hint"}>{"It only runs when you ask. \"Always on for this site\" in the popup makes the browser ask your permission for that one site. Your choices are saved on your computer only. Chrome shows a \"developer mode\" note for extensions loaded this way; that is normal."}</p>
      </div>

      <h3 id={"what"}>{"What you get"}</h3>
      <ul>
        <li><strong>{"Accessibility: "}</strong>{"WCAG level (Off, AA, AAA), fix faint text, reduce motion, a clear focus ring, wider spacing."}</li>
        <li><strong>{"Colours: "}</strong>{"Default, High contrast or Soft theme, dark mode, text size up to 200%."}</li>
        <li><strong>{"Read aloud: "}</strong>{"the page language is found by itself, and each part is read in its own voice (Telugu in Telugu, English in English). If your device has no voice for a language, it says so instead of reading it wrong."}</li>
        <li><strong>{"Ask this page: "}</strong>{"answers from the page, with the source highlighted."}</li>
        <li><strong>{"Report: "}</strong>{"what was fixed, what a person should check, and what could not be checked (never counted as a pass)."}</li>
      </ul>

      <h2 id={"script"} style={{ marginTop: "28px" }}>{"For your website: one script"}</h2>
      <p>{"HTML, WordPress, PHP, Python templates, any platform. No language setting: it is found from the text."}</p>
      <Code name={"index.html"} code={scriptCode} />
      <p className={"hint"}>{"Only accessibility, without the panel:"}</p>
      <Code name={"index.html (accessibility only)"} code={attrCode} />

      <h2 id={"npm"} style={{ marginTop: "28px" }}>{"For React and Next.js: npm"}</h2>
      <Code name={"terminal"} code={`npm i @yuktishaalaa/assistant@${v}`} />
      <Code name={"app/layout.tsx"} code={nextCode} />
      <Code name={"React"} code={reactCode} />
      <p className={"hint"}>{"In Next.js it loads after hydration, so the server HTML stays the same. Full options are in the "}<a href={"https://github.com/sandeep-miriyala/yuktai/tree/main/packages/assistant#readme"} target={"_blank"} rel={"noopener noreferrer"}>{"package README"}<span className={"sr-only"}>{" (opens in a new tab)"}</span></a>{"."}</p>

      <h2 id={"rules"} style={{ marginTop: "28px" }}>{"Do no harm"}</h2>
      <ul>
        <li>{"Buttons, links, images, fields and tables are checked, never given made-up labels. A wrong label is worse than none."}</li>
        <li>{"Your own "}<code>{"lang"}</code>{" and ARIA are never changed; only missing ones are added."}</li>
        <li>{"Typing areas and passwords are never read. "}<code>{"data-yuktai-a11y=\"off\""}</code>{" keeps any part untouched."}</li>
        <li>{"Everything it changes can be undone."}</li>
      </ul>
    </>
  );
}
