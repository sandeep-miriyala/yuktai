// playground: Next.js route. Icons from @yuktishaalaa/yuktai/icons; the live demo is src/lib/docs/pages/playground.ts.
import type { Metadata } from "next";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import GuideDemo from "@/components/guides/GuideDemo";

export const metadata: Metadata = {
  title: "Function playground",
  description: "Run YuktAI core functions (grid queries, BI, tasks, anomalies, voice, contrast, RAG) on your own input and copy the call.",
};

export default function PlaygroundPage() {
  return (
    <>
      {" "}
<div className={"page-head"}>{" "}
<p className={"kicker"}><YuktaiIcon name="dataObject" className="i" size={24} aria-hidden="true" />{"Function playground"}</p>{" "}
<h1>{"Function playground"}</h1><p className={"lead"}>{"The core functions behind the grid, the agents and the page tools, available on their own. Pick one, change the input, run it on 120 sample staff rows, and copy the call for your stack."}</p></div><div className={"demo"}><p className={"demo-label"}><YuktaiIcon name="play" className="i" size={24} aria-hidden="true" />{"Playground"}</p>{" "}
<div className={"controls"} style={{ gridTemplateColumns: "minmax(0,1fr)" }}>{" "}
<div className={"field"}><label htmlFor={"pl-fn"}>{"Function"}</label><select id={"pl-fn"}></select><p className={"hint"} id={"pl-about"}></p></div>{" "}
</div>{" "}
<form className={"controls"} id={"pl-form"} style={{ gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "end" }}>{" "}
<div className={"field"}><label htmlFor={"pl-in"} id={"pl-in-label"}>{"Input"}</label><input id={"pl-in"} autoComplete={"off"} /></div>{" "}
<button type={"submit"} className={"btn primary"}><YuktaiIcon name="play" className="i" size={24} aria-hidden="true" />{"Run"}</button>{" "}
</form>{" "}
<pre className={"out"} id={"pl-out"} aria-live={"polite"} data-needs-yuktai={""}></pre></div><div className={"codetabs"} data-codetabs={""}><div className={"tablist"} role={"tablist"} aria-label={"Code"}><button type={"button"} role={"tab"} id={"pl-code-next-tab"} data-fw={"next"} aria-controls={"pl-code-next"} aria-selected={"true"} tabIndex={0}><YuktaiIcon name="code" className="i" size={24} aria-hidden="true" />{"Next.js / React"}</button><button type={"button"} role={"tab"} id={"pl-code-vanilla-tab"} data-fw={"vanilla"} aria-controls={"pl-code-vanilla"} aria-selected={"false"} tabIndex={-1}><YuktaiIcon name="file" className="i" size={24} aria-hidden="true" />{"Vanilla JS"}</button></div><div role={"tabpanel"} id={"pl-code-next"} aria-labelledby={"pl-code-next-tab"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"pl-code-next-code-name"}>{"lib/example.ts"}</span><button type={"button"} className={"copy-btn"} data-what={"lib/example.ts"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" lib/example.ts"}</span></button></div><pre><code id={"pl-code-next-code"}>{"// pick a function"}</code></pre></div></div><div role={"tabpanel"} id={"pl-code-vanilla"} aria-labelledby={"pl-code-vanilla-tab"} hidden><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"pl-code-vanilla-code-name"}>{"app.js"}</span><button type={"button"} className={"copy-btn"} data-what={"app.js"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" app.js"}</span></button></div><pre><code id={"pl-code-vanilla-code"}>{"// pick a function"}</code></pre></div></div></div><table className={"ref"}><caption>{"All core functions (same names in npm and window.yuktai)"}</caption><thead><tr><th scope={"col"}>{"Group"}</th><th scope={"col"}>{"Functions"}</th></tr></thead><tbody><tr><td>{"Grid queries"}</td><td>{"parseAmount, parseGridQuery, executeGridQuery, runGridQuery, answerGridQuestion, findMentionedColumn"}</td></tr><tr><td>{"Anomalies and summaries"}</td><td>{"detectAnomalies, summarizeRows"}</td></tr><tr><td>{"BI"}</td><td>{"askInsight, groupBy, comparePeriods, trend, aggregate"}</td></tr><tr><td>{"Tasks"}</td><td>{"planTasks, runTasks"}</td></tr><tr><td>{"QA"}</td><td>{"runQaAudit, auditToMarkdown, auditToJSON, AUDIT_RULES"}</td></tr><tr><td>{"Copilot"}</td><td>{"createA11yCopilot"}</td></tr><tr><td>{"Page understanding"}</td><td>{"askAboutPage, analyzePage, detectPageIntent"}</td></tr><tr><td>{"Page and data RAG"}</td><td>{"createContextIndex, tokenize, pagePassages, gridPassages"}</td></tr><tr><td>{"Forms and design"}</td><td>{"reviewForms, reviewForm, readFormFields, reviewDesign"}</td></tr><tr><td>{"Voice"}</td><td>{"parseVoiceA11yCommand, createVoiceA11yController, moveGridRowFocus"}</td></tr><tr><td>{"Grid tools"}</td><td>{"createGridTools, getRowId, applyGridFilters, toGridToolColumns, searchGrid, countGrid, filterGrid, sortGrid …"}</td></tr><tr><td>{"Colour"}</td><td>{"contrastRatio, parseColor, relativeLuminance, accessibleName"}</td></tr><tr><td>{"Icons"}</td><td>{"icon (vanilla), iconSvg, iconContrast, pickGlyphColor, ICON_NAMES"}</td></tr></tbody></table>{" "}

      <GuideDemo page="playground" />
    </>
  );
}
