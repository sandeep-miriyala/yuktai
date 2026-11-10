// icons: Next.js route. Icons from @yuktishaalaa/yuktai/icons; the live demo is src/lib/docs/pages/icons.ts.
import type { Metadata } from "next";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import GuideDemo from "@/components/guides/GuideDemo";

export const metadata: Metadata = {
  title: "Icon studio",
  description: "YuktAI icon studio: every icon at any custom size and colour, outline or filled, with React and HTML code and PNG/SVG downloads.",
};

export default function IconsPage() {
  return (
    <>
      {" "}
<div className={"page-head"}>{" "}
<p className={"kicker"}><YuktaiIcon name="star" className="i" size={24} aria-hidden="true" />{"Icon studio"}</p>{" "}
<h1>{"Icon studio"}</h1><p className={"lead"}>{"Every YuktAI icon, read live from the YuktAI script, so new icons appear here as soon as a release adds them. Type any size, pick a colour and style, then copy the code or download a PNG or SVG."}</p></div>{" "}
<div className={"callout"}><p><strong>{"Original designs:"}</strong>{" every YuktAI icon is drawn for YuktAI and free to use under GPL-3.0. Checked against Lucide (2,176 icons) and Feather (287 icons): no icon, and no single line, is the same. In 5.3.11, 13 icons (plus, minus, reset, search, sortUp, sortDown, left, right, first, last, undo, redo, pen) get their original YuktAI shapes, and the palette icon is clearer."}</p></div>{" "}
<div className={"card st-panel"}>{" "}
<div className={"st-controls"}>{" "}
<div className={"st-field st-search"}>{" "}
<label htmlFor={"st-q"}>{"Search icons"}</label>{" "}
<span className={"st-input"}><YuktaiIcon name="search" className="i" size={24} aria-hidden="true" /><input id={"st-q"} type={"search"} placeholder={"home, lock, chart…"} autoComplete={"off"} spellCheck={"false"} /></span>{" "}
</div>{" "}
<fieldset className={"st-seg"}><legend>{"Style"}</legend><label><input type={"radio"} name={"st-variant"} defaultValue={"outline"} defaultChecked /><span>{"Outline"}</span></label><label><input type={"radio"} name={"st-variant"} defaultValue={"filled"} /><span>{"Filled"}</span></label></fieldset>{" "}
<fieldset className={"st-seg"} id={"st-shape-field"} hidden><legend>{"Shape"}</legend><label><input type={"radio"} name={"st-shape"} defaultValue={"rounded"} defaultChecked /><span>{"Rounded"}</span></label><label><input type={"radio"} name={"st-shape"} defaultValue={"circle"} /><span>{"Circle"}</span></label></fieldset>{" "}
<fieldset className={"st-swatches"}><legend>{"Colour"}</legend><label className={"st-sw"} title={"Forest green #084d31"}><input type={"radio"} name={"st-color"} defaultValue={"#084d31"} defaultChecked /><span className={"st-dot"} style={{ background: "#084d31" }}></span><span className={"sr-only"}>{"Forest green"}</span></label><label className={"st-sw"} title={"Deep blue #0a4a85"}><input type={"radio"} name={"st-color"} defaultValue={"#0a4a85"} /><span className={"st-dot"} style={{ background: "#0a4a85" }}></span><span className={"sr-only"}>{"Deep blue"}</span></label><label className={"st-sw"} title={"Ink #0b1220"}><input type={"radio"} name={"st-color"} defaultValue={"#0b1220"} /><span className={"st-dot"} style={{ background: "#0b1220" }}></span><span className={"sr-only"}>{"Ink"}</span></label><label className={"st-sw"} title={"Rust #7a3209"}><input type={"radio"} name={"st-color"} defaultValue={"#7a3209"} /><span className={"st-dot"} style={{ background: "#7a3209" }}></span><span className={"sr-only"}>{"Rust"}</span></label><label className={"st-sw"} title={"Plum #5b2a86"}><input type={"radio"} name={"st-color"} defaultValue={"#5b2a86"} /><span className={"st-dot"} style={{ background: "#5b2a86" }}></span><span className={"sr-only"}>{"Plum"}</span></label>{" "}
<label className={"st-sw st-custom"} title={"Choose any colour"}><input type={"color"} id={"st-custom"} defaultValue={"#0038B4"} /><span className={"sr-only"}>{"Custom colour"}</span></label>{" "}
</fieldset>{" "}
</div>{" "}
<fieldset className={"st-sizebox"}>{" "}
<legend>{"Size (any number of pixels)"}</legend>{" "}
<div className={"st-sizerow"}>{" "}
<div className={"st-field"}><label htmlFor={"st-size"}>{"Size in px"}</label>{" "}
<span className={"st-input st-num"}><input id={"st-size"} type={"number"} inputMode={"numeric"} min={"8"} max={"1024"} step={"1"} defaultValue={"24"} aria-describedby={"st-size-hint"} /><span aria-hidden={"true"}>{"px"}</span></span></div>{" "}
<div className={"st-field st-range"}><label htmlFor={"st-range"}>{"Slider"}</label><input id={"st-range"} type={"range"} min={"8"} max={"512"} step={"1"} defaultValue={"24"} /></div>{" "}
<div className={"st-field"}><label htmlFor={"st-stroke"}>{"Line weight"}</label>{" "}
<select id={"st-stroke"} defaultValue={"auto"}><option value={"auto"}>{"Standard (2.5)"}</option><option value={"1.5"}>{"Light (1.5)"}</option><option value={"2"}>{"Regular (2)"}</option><option value={"3"}>{"Bold (3)"}</option></select></div>{" "}
</div>{" "}
<div className={"st-chips"} role={"group"} aria-label={"Common sizes"}><button type={"button"} className={"st-chip"} data-size={"16"} aria-pressed={"false"}>{"16"}</button><button type={"button"} className={"st-chip"} data-size={"20"} aria-pressed={"false"}>{"20"}</button><button type={"button"} className={"st-chip"} data-size={"24"} aria-pressed={"false"}>{"24"}</button><button type={"button"} className={"st-chip"} data-size={"32"} aria-pressed={"false"}>{"32"}</button><button type={"button"} className={"st-chip"} data-size={"48"} aria-pressed={"false"}>{"48"}</button><button type={"button"} className={"st-chip"} data-size={"64"} aria-pressed={"false"}>{"64"}</button><button type={"button"} className={"st-chip"} data-size={"96"} aria-pressed={"false"}>{"96"}</button><button type={"button"} className={"st-chip"} data-size={"128"} aria-pressed={"false"}>{"128"}</button><button type={"button"} className={"st-chip"} data-size={"192"} aria-pressed={"false"}>{"192"}</button><button type={"button"} className={"st-chip"} data-size={"256"} aria-pressed={"false"}>{"256"}</button><button type={"button"} className={"st-chip"} data-size={"512"} aria-pressed={"false"}>{"512"}</button></div>{" "}
<p className={"hint"} id={"st-size-hint"}>{"8 to 1024 px. The tiles show up to 64 px; the preview, code and downloads use your exact size."}</p>{" "}
</fieldset>{" "}
<div className={"st-out"}>{" "}
<div className={"st-preview"} id={"st-preview"} aria-hidden={"true"}></div>{" "}
<div className={"st-detail"}>{" "}
<h2 className={"st-name"} id={"st-name"}>{"accessibility"}</h2>{" "}
<p className={"st-contrast"} id={"st-contrast"}></p>{" "}
<div className={"st-codes"}>{" "}
<div className={"st-code"}><span className={"st-code-label"}>{"React / Next.js"}</span><code id={"st-react"}></code><button type={"button"} className={"st-btn"} data-copy={"react"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span>{"Copy"}</span></button></div>{" "}
<div className={"st-code"}><span className={"st-code-label"}>{"Plain HTML"}</span><code id={"st-html"}></code><button type={"button"} className={"st-btn"} data-copy={"html"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span>{"Copy"}</span></button></div>{" "}
</div>{" "}
<div className={"st-actions"}>{" "}
<button type={"button"} className={"st-btn primary"} id={"st-png"}><YuktaiIcon name="download" className="i" size={24} aria-hidden="true" /><span id={"st-png-label"}>{"Download PNG · 24px"}</span></button>{" "}
<button type={"button"} className={"st-btn"} id={"st-svg"}><YuktaiIcon name="download" className="i" size={24} aria-hidden="true" /><span>{"SVG"}</span></button>{" "}
<button type={"button"} className={"st-btn"} data-copy={"svg"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span>{"Copy SVG"}</span></button>{" "}
</div>{" "}
<form className={"st-multi"} id={"st-multi"}>{" "}
<label htmlFor={"st-sizes"}>{"Several PNG sizes at once"}</label>{" "}
<span className={"st-multirow"}><input id={"st-sizes"} className={"input"} defaultValue={"16, 32, 48, 180, 192, 512"} autoComplete={"off"} aria-describedby={"st-sizes-hint"} />{" "}
<button type={"submit"} className={"st-btn"}><YuktaiIcon name="download" className="i" size={24} aria-hidden="true" /><span>{"Download all"}</span></button></span>{" "}
<span className={"hint"} id={"st-sizes-hint"}>{"Comma-separated, 8–1024. Handy for favicons and app icons. Your browser may ask to allow several downloads."}</span>{" "}
</form>{" "}
</div>{" "}
</div>{" "}
<section className={"st-all"} aria-labelledby={"st-all-title"}>{" "}
<div className={"st-all-head"}>{" "}
<h2 id={"st-all-title"}><YuktaiIcon name="download" className="i" size={24} aria-hidden="true" />{"Download all icons"}</h2>{" "}
<p className={"hint"}>{"Uses the style, colour, shape, size and line weight you chose above."}</p>{" "}
</div>{" "}
<div className={"st-all-opts"}>{" "}
<fieldset className={"st-seg"}><legend>{"Which icons"}</legend>{" "}
<label><input type={"radio"} name={"st-which"} defaultValue={"all"} defaultChecked /><span id={"st-which-all"}>{"All"}</span></label><label><input type={"radio"} name={"st-which"} defaultValue={"shown"} /><span id={"st-which-shown"}>{"Search results"}</span></label>{" "}
</fieldset>{" "}
<fieldset className={"st-seg"}><legend>{"Sheet background"}</legend>{" "}
<label><input type={"radio"} name={"st-bg"} defaultValue={"white"} defaultChecked /><span>{"White"}</span></label><label><input type={"radio"} name={"st-bg"} defaultValue={"dark"} /><span>{"Dark"}</span></label><label><input type={"radio"} name={"st-bg"} defaultValue={"none"} /><span>{"Transparent"}</span></label>{" "}
</fieldset>{" "}
<fieldset className={"st-checks"}><legend>{"Sheet options"}</legend>{" "}
<label className={"check"}><input type={"checkbox"} id={"st-names"} defaultChecked />{" Show names"}</label>{" "}
<label className={"check"}><input type={"checkbox"} id={"st-hd"} defaultChecked />{" Sharp (2×) image"}</label>{" "}
</fieldset>{" "}
</div>{" "}
<div className={"st-all-actions"}>{" "}
<button type={"button"} className={"st-btn primary"} id={"st-sheet"}><YuktaiIcon name="image" className="i" size={24} aria-hidden="true" /><span>{"One picture (PNG)"}</span></button>{" "}
<button type={"button"} className={"st-btn"} id={"st-zip-svg"}><YuktaiIcon name="file" className="i" size={24} aria-hidden="true" /><span>{"ZIP of SVG files"}</span></button>{" "}
<button type={"button"} className={"st-btn"} id={"st-zip-png"}><YuktaiIcon name="grid" className="i" size={24} aria-hidden="true" /><span>{"ZIP of PNG files"}</span></button>{" "}
<button type={"button"} className={"st-btn"} id={"st-sprite"}><YuktaiIcon name="code" className="i" size={24} aria-hidden="true" /><span>{"SVG sprite (developers)"}</span></button>{" "}
</div>{" "}
<p className={"st-all-status"} id={"st-all-status"} role={"status"} aria-live={"polite"}></p>{" "}
<p className={"hint st-all-note"}>{"The picture shows icons at your size up to 128 px; ZIP files use your exact size. Everything is made in your browser, offline too."}</p>{" "}
</section>{" "}
<p className={"st-status"} id={"st-status"}>{"Loading icons…"}</p>{" "}
<p className={"sr-only"} id={"st-live"} role={"status"} aria-live={"polite"}></p>{" "}
<div className={"st-board"}>{" "}
<ul className={"st-grid"} id={"st-grid"} aria-label={"Icons. Use the arrow keys to move, Enter to select."} data-needs-yuktai={""}></ul>{" "}
<p className={"st-empty"} id={"st-empty"} hidden>{"No icons match. Try “home”, “lock” or “chart”."}</p>{" "}
</div>{" "}
</div>{" "}
<h2 id={"howto"}>{"Use an icon"}</h2>{" "}
<div className={"grid2"}>{" "}
<div className={"card"}>{" "}
<h3><YuktaiIcon name="code" className="i" size={24} aria-hidden="true" />{" React / Next.js"}</h3>{" "}
<ol className={"steps"}>{" "}
<li><code>{"npm install @yuktishaalaa/yuktai"}</code></li>{" "}
<li>{"Copy the "}<strong>{"React / Next.js"}</strong>{" line from the studio. Icon components work in Server Components too."}</li>{" "}
</ol>{" "}
<div className={"snippet"}><div className={"codehead"}><span className={"file"}>{"app/page.tsx"}</span><button type={"button"} className={"copy-btn"} data-what={"app/page.tsx"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" app/page.tsx"}</span></button></div><pre><code>{"import { EyeOffIcon } from \"@yuktishaalaa/yuktai/icons\"\n\n<EyeOffIcon size={40} color=\"#084d31\" label=\"Hide password\" />\n<EyeOffIcon size={40} color=\"#084d31\" variant=\"filled\" shape=\"circle\" />"}</code></pre></div>{" "}
</div>{" "}
<div className={"card"}>{" "}
<h3><YuktaiIcon name="file" className="i" size={24} aria-hidden="true" />{" Plain HTML"}</h3>{" "}
<ol className={"steps"}>{" "}
<li>{"Add the YuktAI script once, before "}<code>{"</body>"}</code>{"."}</li>{" "}
<li>{"Copy the "}<strong>{"Plain HTML"}</strong>{" code from the studio; it fills a placeholder with the SVG."}</li>{" "}
</ol>{" "}
<div className={"snippet"}><div className={"codehead"}><span className={"file"}>{"index.html"}</span><button type={"button"} className={"copy-btn"} data-what={"index.html"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" index.html"}</span></button></div><pre><code>{"<span id=\"my-icon\"></span>\n<script>\n  document.getElementById(\"my-icon\").innerHTML =\n    yuktai.icon(\"eyeOff\", { size: 40, color: \"#084d31\", strokeWidth: 2.5, label: \"Hide password\" })\n</script>"}</code></pre></div>{" "}
<p className={"hint"}>{"No script? Use "}<strong>{"Copy SVG"}</strong>{" and paste it into your HTML, or use the downloaded file in an "}<code>{"<img>"}</code>{" with a meaningful "}<code>{"alt"}</code>{"."}</p>{" "}
</div>{" "}
</div>{" "}
<div className={"callout"}><p>{"Add "}<code>{"label"}</code>{" when the icon means something on its own; leave it out when the text next to it says the same, so screen readers don't repeat it. Icons need 3:1 contrast with their background (WCAG 1.4.11); the studio checks it for you."}</p></div>{" "}

      <GuideDemo page="icons" />
    </>
  );
}
