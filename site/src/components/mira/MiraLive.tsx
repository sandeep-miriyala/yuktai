"use client";

import { useEffect, useRef, useState } from "react";
import { VERSIONS } from "@/data/site";

const CDN = `https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira@${VERSIONS.mira}`;

const EXAMPLES: { label: string; html: string }[] = [
  {
    label: "మొదటి ఉదాహరణ",
    html: `<body mira="mandali">
  <mira h1 font="ntr">మిరా</mira h1>
  <mira p font="ramabhadra">ఒక్క పద్యం చాలు</mira p>
  <mira input font="mandali" placeholder="మీ పేరు">
</body>`,
  },
  {
    label: "పద్యం",
    html: `<body mira="suranna">
  <mira h2 font="gurajada">పద్యం</mira h2>
  <mira blockquote font="sirivennela">పాట పాడితే మనసు నిండుతుంది</mira blockquote>
  <mira p truncate="6">ఈ వాక్యం చాలా పొడవుగా ఉంది కాబట్టి ఆరు అక్షరాల దగ్గర ఆగుతుంది</mira p>
  <p>English stays in the page font; only Telugu letters change.</p>
</body>`,
  },
  {
    label: "ఫారం",
    html: `<body mira="hind-guntur">
  <mira form>
    <mira label>పేరు <mira input placeholder="మీ పేరు"></mira label>
    <mira label>ఊరు <mira select><option>గుంటూరు</option><option>విజయవాడ</option></mira select></mira label>
    <mira button type="button" font="ramabhadra">పంపు</mira button>
  </mira form>
  <table mira="mandali"><tr><th>పేరు</th><td>మిరా</td></tr></table>
</body>`,
  },
  {
    label: "తప్పు font పేరు",
    html: `<mira h1 font="tleugu">మిరా</mira h1>
<p>Open the browser console: MiRa suggests "telugu".</p>`,
  },
];

function page(html: string): string {
  // MiRa from npm, then the result back to this page. The frame has its own
  // (sandboxed) origin, so the HTML you type cannot touch this site.
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>:root{color-scheme:light dark}body{margin:12px;font:16px/1.6 system-ui,sans-serif}input,select,button{font-size:15px}td,th{border:1px solid #8884;padding:2px 8px}table{border-collapse:collapse}</style>
<script src="${CDN}" defer></script></head>
${html}
<script>addEventListener("load",function(){setTimeout(function(){parent.postMessage({mira:document.body.outerHTML.replace(/<script[\\s\\S]*?<\\/script>/g,"").trim()},"*")},60)})</script>`;
}

/** Type MiRa HTML, see the page and the HTML MiRa makes from it. */
export default function MiraLive() {
  const [html, setHtml] = useState(EXAMPLES[0].html);
  const [doc, setDoc] = useState(() => page(EXAMPLES[0].html));
  const [out, setOut] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);

  // Re-run a moment after typing stops.
  useEffect(() => {
    const t = setTimeout(() => setDoc(page(html)), 450);
    return () => clearTimeout(t);
  }, [html]);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const m = (e.data as { mira?: unknown } | null)?.mira;
      if (typeof m === "string") setOut(m);
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);

  return (
    <div className="demo mira-live">
      <p className="demo-label">Try it: type MiRa HTML, the page changes as you type</p>
      <div className="mira-examples" role="group" aria-label="Examples">
        {EXAMPLES.map((x) => (
          <button key={x.label} type="button" className="btn" aria-pressed={html === x.html} onClick={() => setHtml(x.html)}>{x.label}</button>
        ))}
      </div>
      <div className="mira-panes">
        <div className="field">
          <label htmlFor="mira-src">Your HTML</label>
          <textarea id="mira-src" value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false} rows={10} lang="te" />
        </div>
        <div className="field">
          <span className="mira-pane-label" id="mira-view-label">The page</span>
          <iframe ref={frame} title="The page MiRa made" aria-labelledby="mira-view-label" sandbox="allow-scripts" srcDoc={doc} className="mira-frame" />
        </div>
      </div>
      <div className="codefile mira-out">
        <div className="codehead">
          <span className="file">The HTML MiRa made</span>
          {/* the guides' copy handler copies the code below */}
          <button type="button" className="copy-btn" data-what="the HTML MiRa made">
            <span className="copy-label">Copy</span><span className="sr-only"> the HTML MiRa made</span>
          </button>
        </div>
        <pre tabIndex={0}><code>{out || "…"}</code></pre>
      </div>
      <p className="hint">MiRa {VERSIONS.mira} and the fonts load from jsDelivr (npm). Nothing you type leaves your browser.</p>
    </div>
  );
}
