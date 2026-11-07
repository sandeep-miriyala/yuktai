// Loading screen CSS and the before-paint script. No React here, so a Next.js
// layout (Server Component) can import these through @yuktishaalaa/yuktai/head.

export const SPLASH_KEY = "yuktai-splash";

/**
 * Colours come from CSS variables, so the splash follows your site:
 * --yk-splash-bg, --yk-splash-text, --yk-splash-accent, --yk-splash-accent-2
 */
export const SPLASH_CSS = `
.yk-splash{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;align-content:center;gap:22px;padding:24px;text-align:center;
background:radial-gradient(1200px 600px at 50% -10%,color-mix(in srgb,var(--yk-splash-accent,#1d4ed8) 18%,transparent),transparent 70%),var(--yk-splash-bg,#f6f7fb);
color:var(--yk-splash-text,#0b1033);font-family:inherit;transition:opacity .45s ease,visibility .45s ease;
animation:yk-splash-safety .4s ease var(--yk-splash-safety,6s) forwards!important}
:root[data-theme="dark"] .yk-splash{--yk-splash-bg:#08081a;--yk-splash-text:#eef1ff;--yk-splash-accent:#7cb4ff;--yk-splash-accent-2:#5eead4}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .yk-splash{--yk-splash-bg:#08081a;--yk-splash-text:#eef1ff;--yk-splash-accent:#7cb4ff;--yk-splash-accent-2:#5eead4}}
.yk-splash-seen .yk-splash,.yk-splash[hidden]{display:none!important}
.yk-splash.yk-leaving{opacity:0;visibility:hidden}
.yk-splash__logo{position:relative;display:grid;place-items:center;max-width:min(520px,86vw);animation:yk-splash-in .7s cubic-bezier(.2,.8,.2,1) both}
.yk-splash__logo img,.yk-splash__logo svg{max-width:100%;height:auto}
.yk-splash__ring{position:absolute;inset:-18px;border-radius:32px;background:conic-gradient(from 0deg,var(--yk-splash-accent,#1d4ed8),var(--yk-splash-accent-2,#0ea5e9),transparent 60%,var(--yk-splash-accent,#1d4ed8));filter:blur(28px);opacity:.35;animation:yk-splash-spin 3.2s linear infinite;z-index:-1}
.yk-splash__words{position:relative;height:1.5em;min-width:12ch;font-size:clamp(1.5rem,4vw,2.2rem);font-weight:800;letter-spacing:-.01em}
.yk-splash__words span{position:absolute;inset:0;opacity:0;animation:yk-splash-word var(--yk-splash-cycle,2.8s) infinite;
background:linear-gradient(90deg,var(--yk-splash-accent,#1d4ed8),var(--yk-splash-accent-2,#0ea5e9));-webkit-background-clip:text;background-clip:text;color:transparent}
.yk-splash__bar{width:min(260px,60vw);height:4px;border-radius:99px;background:color-mix(in srgb,var(--yk-splash-text,#0b1033) 12%,transparent);overflow:hidden}
.yk-splash__bar i{display:block;height:100%;width:40%;border-radius:inherit;background:linear-gradient(90deg,var(--yk-splash-accent,#1d4ed8),var(--yk-splash-accent-2,#0ea5e9));animation:yk-splash-bar 1.1s ease-in-out infinite}
.yk-splash--timed .yk-splash__bar i{width:100%;transform-origin:left;animation:yk-splash-fill var(--yk-splash-ms,12s) linear both}
.yk-splash__tip{min-height:3em;max-width:min(520px,86vw);margin:0;font-size:1rem;line-height:1.5;opacity:.85}
:root:not([data-motion="off"]) .yk-splash__tip{animation:yk-splash-tip .5s ease both}
.yk-splash__skip{font:600 .9rem/1 inherit;color:inherit;background:transparent;border:1px solid color-mix(in srgb,currentColor 30%,transparent);border-radius:99px;padding:8px 16px;cursor:pointer;opacity:.8}
.yk-splash__skip:focus-visible{outline:3px solid var(--yk-splash-accent,#1d4ed8);outline-offset:3px}
.yk-splash__static{display:none;font-size:1.1rem;font-weight:700;max-width:34ch;line-height:1.6}
:root[data-motion="off"] .yk-splash__words,:root[data-motion="off"] .yk-splash__ring{display:none}
:root[data-motion="off"] .yk-splash__static{display:block}
:root[data-motion="off"] .yk-splash:not(.yk-splash--timed) .yk-splash__bar i{animation:none;width:100%}
:root[data-motion="off"] .yk-splash--timed .yk-splash__bar i{animation-duration:var(--yk-splash-ms,12s)!important}
:root[data-motion="lively"] .yk-splash__logo{animation:yk-splash-in .7s cubic-bezier(.2,.8,.2,1) both,yk-splash-float 3s ease-in-out .7s infinite}
:root[data-motion="lively"] .yk-splash__ring{opacity:.55}
@keyframes yk-splash-in{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:none}}
@keyframes yk-splash-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes yk-splash-spin{to{transform:rotate(1turn)}}
@keyframes yk-splash-bar{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}
@keyframes yk-splash-safety{to{opacity:0;visibility:hidden}}
@keyframes yk-splash-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes yk-splash-tip{from{opacity:0;transform:translateY(6px)}to{opacity:.85;transform:none}}
`;

/** The word animation: each word is shown for an equal slice of the cycle. */
export function splashWordCss(count: number): string {
  const slice = 100 / count;
  const a = (slice * 0.15).toFixed(2);
  const b = (slice * 0.85).toFixed(2);
  const c = slice.toFixed(2);
  return `@keyframes yk-splash-word{0%{opacity:0;transform:translateY(40%)}${a}%{opacity:1;transform:none}${b}%{opacity:1;transform:none}${c}%{opacity:0;transform:translateY(-40%)}100%{opacity:0}}`;
}

/**
 * Put this in <head> (inline script) when you use <YuktaiSplash>. It hides the
 * loading screen before paint when this visitor already saw it in this tab.
 */
export const SPLASH_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(SPLASH_KEY)}))document.documentElement.classList.add("yk-splash-seen")}catch(e){}`;
