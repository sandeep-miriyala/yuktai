"use strict";var n=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var k=Object.prototype.hasOwnProperty;var u=(o,t)=>{for(var e in t)n(o,e,{get:t[e],enumerable:!0})},v=(o,t,e,l)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of h(t))!k.call(o,a)&&a!==e&&n(o,a,{get:()=>t[a],enumerable:!(l=f(t,a))||l.enumerable});return o};var x=o=>v(n({},"__esModule",{value:!0}),o);var g={};u(g,{MOTION_CHOICES:()=>c,MOTION_CSS:()=>s,MOTION_KEY:()=>i,MOTION_SCRIPT:()=>m,SPLASH_CSS:()=>d,SPLASH_KEY:()=>r,SPLASH_SCRIPT:()=>y});module.exports=x(g);var c=["auto","off","calm","lively"],i="yuktai-motion";var s=`
:root[data-motion="off"] *:not(.yk-splash),:root[data-motion="off"] *::before,:root[data-motion="off"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
.yk-lift{transition:transform .25s ease,box-shadow .25s ease}
:root:not([data-motion="off"]) .yk-lift:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px var(--yk-lift-shadow,rgba(0,24,120,.35))}
:root[data-motion="lively"] .yk-lift:hover{transform:translateY(-6px) scale(1.015)}
:root[data-motion="lively"] .yk-float{animation:yk-float 5s ease-in-out infinite}
:root[data-motion="lively"] .yk-shimmer{background-size:200% auto!important;animation:yk-shimmer 4s linear infinite}
:root[data-motion="lively"] .yk-pop{animation:yk-pop .6s cubic-bezier(.2,.9,.3,1.3) both}
.yk-reveal{transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
.yk-reveal.yk-armed{opacity:0;transform:translateY(18px)}
:root[data-motion="lively"] .yk-reveal{transition-duration:.8s}
:root[data-motion="lively"] .yk-reveal.yk-armed{transform:translateY(36px) scale(.96)}
:root[data-motion="off"] .yk-reveal.yk-armed{opacity:1;transform:none}
@keyframes yk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes yk-shimmer{to{background-position:200% center}}
@keyframes yk-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
`,m=`(function(){try{var d=document.documentElement,v=null;try{v=localStorage.getItem(${JSON.stringify(i)})}catch(e){}if(v!=="off"&&v!=="calm"&&v!=="lively"){v=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"off":"calm"}d.setAttribute("data-motion",v);if(!document.getElementById("yk-motion-css")){var s=document.createElement("style");s.id="yk-motion-css";s.textContent=${JSON.stringify(s.replace(/\n/g,""))};document.head.appendChild(s)}}catch(e){}})();`;var r="yuktai-splash",d=`
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
`;var y=`try{if(sessionStorage.getItem(${JSON.stringify(r)}))document.documentElement.classList.add("yk-splash-seen")}catch(e){}`;
