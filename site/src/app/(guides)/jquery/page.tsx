// jquery: Next.js route. Icons from @yuktishaalaa/yuktai/icons; the live demo is src/lib/docs/pages/jquery.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import GuideDemo from "@/components/guides/GuideDemo";

export const metadata: Metadata = {
  title: "jQuery",
  description: "Use YuktAI and Ask page on jQuery sites: two script tags, no plugin, tested with jQuery 1.12, 2.2, 3.7 and 4.0.",
};

export default function JqueryPage() {
  return (
    <>
      {" "}
<div className={"page-head"}>{" "}
<p className={"kicker"}><YuktaiIcon name="wand" className="i" size={24} aria-hidden="true" />{"jQuery"}</p>{" "}
<h1>{"YuktAI on jQuery sites"}</h1><p className={"lead"}>{"jQuery still runs on most websites: WordPress themes, ASP.NET WebForms, PHP and older business sites. YuktAI and Ask page are plain JavaScript and don't depend on jQuery, so they work next to any jQuery version. Two script tags, no plugin, no changes to your jQuery code."}</p></div>{" "}
<ul className={"checks"}>{" "}
<li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{"Tested with jQuery "}<strong>{"1.12.4, 2.2.4, 3.7.1 and 4.0.0"}</strong>{": data grid, accessibility settings and Ask page, no console errors."}</span></li>{" "}
<li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{"No jQuery plugin to install or update. YuktAI doesn't need jQuery at all."}</span></li>{" "}
<li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{"No API keys, no server calls. Everything runs in the visitor's browser."}</span></li>{" "}
</ul>{" "}
<div className={"demo"}><p className={"demo-label"}><YuktaiIcon name="play" className="i" size={24} aria-hidden="true" />{"Live demo"}</p>{" "}
<h2 style={{ marginTop: "0" }} id={"demo"}>{"Try it with any jQuery version"}</h2>{" "}
<div className={"controls"}>{" "}
<div className={"field"}><label htmlFor={"jq-ver"}>{"jQuery version"}</label><select id={"jq-ver"}><option value={"4.0.0"}>{"4.0.0 (latest)"}</option><option value={"3.7.1"}>{"3.7.1"}</option><option value={"2.2.4"}>{"2.2.4"}</option><option value={"1.12.4"}>{"1.12.4"}</option></select></div>{" "}
</div>{" "}
<p className={"hint"} id={"jq-status"} role={"status"} aria-live={"polite"}>{"Loading jQuery…"}</p>{" "}
<div className={"btn-row"}><button type={"button"} className={"btn"} id={"jq-contrast"} aria-pressed={"false"}><YuktaiIcon name="accessibility" className="i" size={24} aria-hidden="true" /><span>{"High contrast"}</span></button><button type={"button"} className={"btn"} id={"jq-ask"}><YuktaiIcon name="chat" className="i" size={24} aria-hidden="true" /><span>{"Ask: which jQuery versions work?"}</span></button></div>{" "}
<div id={"jq-grid"}></div>{" "}
<p className={"hint"}>{"The buttons and the grid are wired with jQuery ("}<code>{"$(function () { … })"}</code>{", "}<code>{"$(\"#id\").on(\"click\")"}</code>{"). Full example: "}<a href={"https://github.com/sandeep-miriyala/yuktai/tree/main/examples/jquery"} target={"_blank"} rel={"noopener noreferrer"}>{"examples/jquery on GitHub"}<span className={"sr-only"}>{" (opens in a new tab)"}</span></a></p>{" "}
</div>{" "}
<h2 id={"add"}>{"1. Add the scripts"}</h2>{" "}
<p>{"Put these just before "}<code>{"</body>"}</code>{", after the jQuery you already have."}</p>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"jq-scripts-name"}>{"index.html (before </body>)"}</span><button type={"button"} className={"copy-btn"} data-what={"index.html (before </body>)"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" index.html (before </body>)"}</span></button></div><pre><code id={"jq-scripts"}>{"<!-- 1. jQuery: pin the version (4.0 for new sites, 3.7 for old code) -->\n<script src=\"https://code.jquery.com/jquery-4.0.0.min.js\"></script>\n\n<!-- 2. YuktAI: ♿ accessibility widget, page tools, data grid -->\n<script src=\"https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.4.0/vanilla/index.min.js\"></script>\n\n<!-- 3. Ask page: answers from this page, sources highlighted -->\n<script src=\"https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page@1.0.0/dist/ask-page.global.js\" defer></script>"}</code></pre></div></div>{" "}
<p>{"That's all. The ♿ button and the Ask panel appear on every page."}</p>{" "}
<h2 id={"call"}>{"2. Call YuktAI from jQuery code"}</h2>{" "}
<p><code>{"window.yuktai"}</code>{" and the "}<code>{"<yuktai-ask>"}</code>{" element are ordinary JavaScript, so you call them from "}<code>{"$(function () { … })"}</code>{" like any other code."}</p>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"jq-code-name"}>{"your-page.js"}</span><button type={"button"} className={"copy-btn"} data-what={"your-page.js"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" your-page.js"}</span></button></div><pre><code id={"jq-code"}>{"$(function () {\n  // Data grid: pass a jQuery element with [0], or a CSS selector\n  yuktai.renderGrid($(\"#staff\")[0], { data: rows, columns: cols, engine: \"auto\" })\n\n  // Accessibility from your own button\n  $(\"#contrastBtn\").on(\"click\", function () {\n    yuktai.apply({ highContrast: true })\n  })\n\n  // Open Ask page with a question\n  $(\"#helpBtn\").on(\"click\", function () {\n    document.querySelector(\"yuktai-ask\").askQuestion(\"How do I apply?\")\n  })\n})"}</code></pre></div></div>{" "}
<h2 id={"versions"}>{"3. Which jQuery versions work"}</h2>{" "}
<p>{"YuktAI and Ask page work with every jQuery we tested: 1.12.4, 2.2.4, 3.7.1 and 4.0.0. Use 4.0 for new sites and 3.7 for older code."}</p>{" "}
<table className={"ref"}><caption>{"Tested in Chromium with YuktAI 5.3.12 and Ask page 1.0.0"}</caption><thead><tr><th scope={"col"}>{"jQuery"}</th><th scope={"col"}>{"Status"}</th><th scope={"col"}>{"Notes"}</th></tr></thead><tbody><tr><td>{"1.12.4"}</td><td>{"✅ Works"}</td><td>{"Old sites. Plan an upgrade: 1.x no longer gets security fixes."}</td></tr><tr><td>{"2.2.4"}</td><td>{"✅ Works"}</td><td>{"Old sites. Same advice as 1.x."}</td></tr><tr><td>{"3.7.1"}</td><td>{"✅ Works"}</td><td>{"Most sites today. Safe to keep."}</td></tr><tr><td>{"4.0.0"}</td><td>{"✅ Works"}</td><td>{"Latest (January 2026). Recommended for new sites."}</td></tr></tbody></table>{" "}
<h2 id={"latest"}>{"4. Use the latest version, safely"}</h2>{" "}
<div className={"grid2"}>{" "}
<div className={"card"}><h3><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" />{" Pin the version"}</h3><p>{"Load "}<code>{"jquery-4.0.0.min.js"}</code>{", not a \"latest\" link. You decide when to upgrade, after testing."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="alert" className="i" size={24} aria-hidden="true" />{" Avoid "}<code>{"jquery-latest.js"}</code></h3><p>{"Despite its name, jQuery stopped updating that file years ago. It still serves an old 1.x release."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="alert" className="i" size={24} aria-hidden="true" />{" Don't auto-follow major versions"}</h3><p>{"jQuery 4 removed old APIs such as "}<code>{"$.trim"}</code>{", "}<code>{"$.isArray"}</code>{", "}<code>{"$.parseJSON"}</code>{" and "}<code>{"$.now"}</code>{". An automatic jump from 3 to 4 can break older page code."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" />{" New sites: 4.0 · Old sites: 3.7"}</h3><p>{"Start new work on 4.0. Keep older sites on 3.7 until you have tested them with jQuery Migrate."}</p></div>{" "}
</div>{" "}
<h2 id={"upgrade"}>{"5. Upgrading an old site to jQuery 4"}</h2>{" "}
<p>{"Add jQuery Migrate for a while. It keeps most old code working and logs a warning for each API that changed, so you can fix them one by one."}</p>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"jq-migrate-name"}>{"Upgrade check"}</span><button type={"button"} className={"copy-btn"} data-what={"Upgrade check"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" Upgrade check"}</span></button></div><pre><code id={"jq-migrate"}>{"<script src=\"https://code.jquery.com/jquery-4.0.0.min.js\"></script>\n<!-- shows a console warning for each old API your code still uses -->\n<script src=\"https://code.jquery.com/jquery-migrate-4.0.2.min.js\"></script>"}</code></pre></div></div>{" "}
<table className={"ref"}><caption>{"Common replacements in jQuery 4"}</caption><thead><tr><th scope={"col"}>{"Old (removed)"}</th><th scope={"col"}>{"Use instead"}</th></tr></thead><tbody><tr><td><code>{"$.trim(s)"}</code></td><td><code>{"s.trim()"}</code></td></tr><tr><td><code>{"$.isArray(a)"}</code></td><td><code>{"Array.isArray(a)"}</code></td></tr><tr><td><code>{"$.parseJSON(t)"}</code></td><td><code>{"JSON.parse(t)"}</code></td></tr><tr><td><code>{"$.now()"}</code></td><td><code>{"Date.now()"}</code></td></tr><tr><td><code>{"$.isFunction(f)"}</code></td><td><code>{"typeof f === \"function\""}</code></td></tr></tbody></table>{" "}
<h2 id={"where"}>{"6. Where to put it"}</h2>{" "}
<div className={"grid2"}>{" "}
<div className={"card"}><h3><YuktaiIcon name="layout" className="i" size={24} aria-hidden="true" />{" WordPress"}</h3><p>{"Add the YuktAI scripts in the theme footer, or use the "}<Link href={"/php/#wordpress"}>{"PHP package"}</Link>{" with "}<code>{"wp_footer"}</code>{". WordPress already loads jQuery."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="code" className="i" size={24} aria-hidden="true" />{" ASP.NET WebForms"}</h3><p>{"Add the scripts once in "}<code>{"Site.Master"}</code>{", before "}<code>{"</body>"}</code>{". Every page that uses the master gets them."}</p></div>{" "}
</div>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"jq-aspnet-name"}>{"Site.Master"}</span><button type={"button"} className={"copy-btn"} data-what={"Site.Master"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" Site.Master"}</span></button></div><pre><code id={"jq-aspnet"}>{"<%-- Site.Master, just before </body> --%>\n<script src=\"https://code.jquery.com/jquery-3.7.1.min.js\"></script>\n<script src=\"https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.4.0/vanilla/index.min.js\"></script>\n<script src=\"https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page@1.0.0/dist/ask-page.global.js\" defer></script>"}</code></pre></div></div>{" "}
<h2 id={"strict"}>{"7. Sites with a strict security policy"}</h2>{" "}
<p>{"jQuery 4 supports Trusted Types, and so does Ask page: both work with "}<code>{"require-trusted-types-for 'script'"}</code>{". If your site has a Content Security Policy, allow "}<code>{"cdn.jsdelivr.net"}</code>{" and "}<code>{"code.jquery.com"}</code>{" in "}<code>{"script-src"}</code>{", plus "}<code>{"'wasm-unsafe-eval'"}</code>{" for the Rust engines. Without it, YuktAI still works, using its TypeScript search."}</p>{" "}

      <GuideDemo page="jquery" />
    </>
  );
}
