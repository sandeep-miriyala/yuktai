"use strict";var YuktAI=(()=>{var M=Object.defineProperty;var me=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var ye=Object.prototype.hasOwnProperty;var ge=(e,t)=>{for(var n in t)M(e,n,{get:t[n],enumerable:!0})},he=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of be(t))!ye.call(e,i)&&i!==n&&M(e,i,{get:()=>t[i],enumerable:!(r=me(t,i))||r.enumerable});return e};var xe=e=>he(M({},"__esModule",{value:!0}),e);var Ve={};ge(Ve,{wcagPlugin:()=>_e});var b={expectedInputLanguages:["en"],expectedContextLanguages:["en"],outputLanguage:"en"};function F(){let e=window;return e.Rewriter||e.ai?.rewriter||null}async function P(){try{let e=F();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability({...b});return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}async function we(e){if(!e||e.trim().length<20)return{success:!1,original:e,rewritten:e,error:"Text too short"};try{let t=F();if(!t)throw new Error("Rewriter API not available");let n=await t.create({tone:"more-casual",format:"plain-text",length:"as-is",outputLanguage:"en"}),r=await n.rewrite(e,{context:"Rewrite this text in simple plain English. Use short sentences. Avoid jargon. Make it easy to understand for everyone."});return n.destroy(),{success:!0,original:e,rewritten:r.trim()}}catch(t){return{success:!1,original:e,rewritten:e,error:t instanceof Error?t.message:"Rewrite failed"}}}async function G(){if(!await P())return{fixed:0,error:"Chrome Built-in AI Rewriter not available. Enable via chrome://flags."};let t=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption"),n=0;for(let r of t){let i=r.innerText?.trim();if(!i||i.length<20||r.closest("[data-yuktai-panel]"))continue;let s=await we(i);s.success&&s.rewritten!==i&&(r.dataset.yuktaiOriginal=i,r.innerText=s.rewritten,n++)}return{fixed:n}}function _(){let e=document.querySelectorAll("[data-yuktai-original]");for(let t of e){let n=t.dataset.yuktaiOriginal;n&&(t.innerText=n,delete t.dataset.yuktaiOriginal)}}var V="yuktai-summary-box";function W(){let e=window;return e.Summarizer||e.ai?.summarizer||null}async function R(){try{let e=W();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability({...b});return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}function ve(){let e=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, article, section"),t=[];for(let n of e){if(n.closest("[data-yuktai-panel]"))continue;let r=window.getComputedStyle(n);if(r.display==="none"||r.visibility==="hidden")continue;let i=n.innerText?.trim();i&&i.length>10&&t.push(i)}return t.join(" ").slice(0,5e3)}async function j(){if(!await R())return{success:!1,summary:"",error:"Chrome Built-in AI Summarizer not available. Enable via chrome://flags."};let t=ve();if(!t||t.length<100)return{success:!1,summary:"",error:"Not enough text on this page to summarise."};try{let n=W();if(!n)throw new Error("Summarizer API not available");let r=await n.create({type:"tl;dr",format:"plain-text",length:"short",outputLanguage:"en"}),i=await r.summarize(t,{context:"Summarise this page in 2-3 simple sentences for a screen reader user who wants to know if this page is relevant to them."});return r.destroy(),ke(i.trim()),{success:!0,summary:i.trim()}}catch(n){return{success:!1,summary:"",error:n instanceof Error?n.message:"Summary failed"}}}function ke(e){k();let t=document.createElement("div");t.id=V,t.setAttribute("data-yuktai-panel","true"),t.setAttribute("role","region"),t.setAttribute("aria-label","Page summary by yuktai"),t.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    background: #0d9488;
    color: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 10px 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;let n=document.createElement("p");n.style.cssText="margin: 0; flex: 1;",n.textContent=`\u{1F4CB} Page summary: ${e}`;let r=document.createElement("button");r.textContent="\xD7",r.setAttribute("aria-label","Close page summary"),r.style.cssText=`
    background: none; border: none; color: #ffffff;
    font-size: 20px; cursor: pointer; padding: 0 4px;
    line-height: 1; flex-shrink: 0;
  `,r.addEventListener("click",k),t.appendChild(n),t.appendChild(r),document.body.prepend(t)}function k(){let e=document.getElementById(V);e&&e.remove()}var U=[{code:"en",label:"English"},{code:"hi",label:"Hindi"},{code:"es",label:"Spanish"},{code:"fr",label:"French"},{code:"de",label:"German"},{code:"it",label:"Italian"},{code:"pt",label:"Portuguese"},{code:"nl",label:"Dutch"},{code:"pl",label:"Polish"},{code:"ru",label:"Russian"},{code:"ja",label:"Japanese"},{code:"ko",label:"Korean"},{code:"zh",label:"Chinese"},{code:"ar",label:"Arabic"},{code:"tr",label:"Turkish"},{code:"vi",label:"Vietnamese"},{code:"bn",label:"Bengali"},{code:"id",label:"Indonesian"}],A="en";function Ae(){let e=window;return e.Translator||e.translation||null}async function Ee(e){try{let t=window;if(!Ae())return!1;if(t.Translator&&typeof t.Translator.availability=="function")try{let r=await t.Translator.availability({sourceLanguage:"en",targetLanguage:e});return r==="readily"||r==="available"||r==="downloadable"||r==="after-download"}catch{}return t.Translator&&typeof t.Translator.canTranslate=="function"?await t.Translator.canTranslate({sourceLanguage:"en",targetLanguage:e})!=="no":t.translation&&typeof t.translation.canTranslate=="function"?await t.translation.canTranslate({sourceLanguage:"en",targetLanguage:e})!=="no":!1}catch{return!1}}async function Te(e){let t=window,n={sourceLanguage:"en",targetLanguage:e};if(t.Translator&&typeof t.Translator.create=="function")return await t.Translator.create(n);if(t.translation&&typeof t.translation.createTranslator=="function")return await t.translation.createTranslator(n);throw new Error("Translation API not available")}async function K(e){if(e===A)return{success:!0,language:e,fixed:0};if(e==="en")return H(),A="en",{success:!0,language:"en",fixed:0};if(!await Ee(e))return{success:!1,language:e,fixed:0,error:`Translation to ${e} not available. Enable via chrome://flags.`};try{let n=await Te(e),r=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption, span, a"),i=0;for(let s of r){if(s.closest("[data-yuktai-panel]")||s.children.length>0)continue;let a=s.innerText?.trim();if(!a||a.length<2)continue;s.dataset.yuktaiTranslationOriginal||(s.dataset.yuktaiTranslationOriginal=a);let o=await n.translate(a);o&&o!==a&&(s.innerText=o,i++)}return typeof n.destroy=="function"&&n.destroy(),A=e,{success:!0,language:e,fixed:i}}catch(n){return{success:!1,language:e,fixed:0,error:n instanceof Error?n.message:"Translation failed"}}}function H(){let e=document.querySelectorAll("[data-yuktai-translation-original]");for(let t of e){let n=t.dataset.yuktaiTranslationOriginal;n&&(t.innerText=n,delete t.dataset.yuktaiTranslationOriginal)}A="en"}var Se=[{phrases:["go to main","skip to main","main content"],action:"focus-main",label:"Jump to main content"},{phrases:["go to navigation","go to nav","open menu"],action:"focus-nav",label:"Jump to navigation"},{phrases:["go to search","search","find"],action:"focus-search",label:"Jump to search"},{phrases:["scroll down","page down","next"],action:"scroll-down",label:"Scroll down"},{phrases:["scroll up","page up","back up"],action:"scroll-up",label:"Scroll up"},{phrases:["go back","previous page"],action:"go-back",label:"Go back"},{phrases:["click","press","select"],action:"click-focused",label:"Click focused element"},{phrases:["next item","tab forward","tab"],action:"tab-forward",label:"Move to next element"},{phrases:["previous item","tab back","shift tab"],action:"tab-back",label:"Move to previous element"},{phrases:["stop listening","stop voice","quiet"],action:"stop-voice",label:"Stop voice control"}],p=null,E=!1,y=null;function $(){return!!(window.SpeechRecognition||window.webkitSpeechRecognition)}function Le(e){let t=e.toLowerCase().trim();for(let n of Se)for(let r of n.phrases)if(t.includes(r))return{action:n.action,label:n.label};return null}function Ce(e){switch(e){case"focus-main":{let t=document.querySelector("main, [role='main'], #main");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"focus-nav":{let t=document.querySelector("nav, [role='navigation']");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"focus-search":{let t=document.querySelector("input[type='search'], input[role='searchbox'], [aria-label*='search' i]");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"scroll-down":{window.scrollBy({top:400,behavior:"smooth"});break}case"scroll-up":{window.scrollBy({top:-400,behavior:"smooth"});break}case"go-back":{window.history.back();break}case"click-focused":{let t=document.activeElement;t&&t!==document.body&&t.click();break}case"tab-forward":{let t=Y(),n=t.indexOf(document.activeElement),r=t[n+1]||t[0];r&&r.focus();break}case"tab-back":{let t=Y(),n=t.indexOf(document.activeElement),r=t[n-1]||t[t.length-1];r&&r.focus();break}case"stop-voice":{I();break}}}function Y(){return Array.from(document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(e=>!e.closest("[data-yuktai-panel]"))}function J(e){if(!$())return!1;if(E)return!0;e&&(y=e);let t=window.SpeechRecognition||window.webkitSpeechRecognition;return t?(p=new t,p.continuous=!0,p.interimResults=!1,p.lang="en-US",p.onresult=n=>{let r=n.results[n.results.length-1][0].transcript,i=Le(r);if(i){Ce(i.action);let s={success:!0,command:r,action:i.label};if(y&&y(s),i.action==="stop-voice")return}},p.onend=()=>{E&&p?.start()},p.onerror=n=>{n.error!=="no-speech"&&y&&y({success:!1,command:"",action:"",error:`Voice error: ${n.error}`})},p.start(),E=!0,Me(),!0):!1}function I(){E=!1,p&&(p.stop(),p=null),y=null,Q()}var X="yuktai-voice-indicator";function Me(){Q();let e=document.createElement("div");e.id=X,e.setAttribute("data-yuktai-panel","true"),e.setAttribute("aria-live","polite"),e.setAttribute("aria-label","yuktai voice control is listening"),e.style.cssText=`
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9995;
    background: #0d9488;
    color: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 99px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    pointer-events: none;
  `;let t=document.createElement("span");if(t.style.cssText=`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffffff;
    animation: yuktai-pulse 1.2s infinite;
    flex-shrink: 0;
  `,!document.getElementById("yuktai-pulse-style")){let r=document.createElement("style");r.id="yuktai-pulse-style",r.textContent=`
      @keyframes yuktai-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.4; transform: scale(0.7); }
      }
    `,document.head.appendChild(r)}let n=document.createElement("span");n.textContent="Listening for commands...",e.appendChild(t),e.appendChild(n),document.body.appendChild(e)}function Q(){let e=document.getElementById(X);e&&e.remove()}var Pe=["button:not([aria-label]):not([aria-labelledby])","a:not([aria-label]):not([aria-labelledby])","input:not([aria-label]):not([aria-labelledby]):not([id])","select:not([aria-label]):not([aria-labelledby])","textarea:not([aria-label]):not([aria-labelledby])","[role='button']:not([aria-label])","[role='link']:not([aria-label])","[role='checkbox']:not([aria-label])","[role='tab']:not([aria-label])"].join(", ");function Z(){let e=window;return e.Writer||e.ai?.writer||null}async function z(){try{let e=Z();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability({...b});return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}function Re(e){let t=[],n=e.innerText?.trim();n&&t.push(`element text: "${n}"`);let r=e.placeholder?.trim();r&&t.push(`placeholder: "${r}"`);let i=e.getAttribute("name")?.trim();i&&t.push(`name: "${i}"`);let s=e.getAttribute("type")?.trim();s&&t.push(`type: "${s}"`);let a=e.id;if(a){let d=document.querySelector(`label[for="${a}"]`);d&&t.push(`label: "${d.innerText?.trim()}"`)}let o=e.parentElement?.innerText?.trim().slice(0,60);o&&t.push(`parent context: "${o}"`),t.push(`tag: ${e.tagName.toLowerCase()}`);let f=e.getAttribute("role");return f&&t.push(`role: ${f}`),t.join(". ")}async function He(e,t){let n=`
    Generate a short, clear aria-label for an HTML element.
    The label must be 2-6 words maximum.
    The label must describe what the element does or what it is.
    Do not include punctuation.
    Do not explain \u2014 just output the label text only.

    Element details:
    ${t}

    Output only the label. Nothing else.
  `.trim();return(await e.write(n)).trim().replace(/^["']|["']$/g,"").replace(/\.$/,"").trim()}async function ee(){if(!await z())return{success:!1,fixed:0,elements:[],error:"Chrome Built-in AI Writer not available. Enable via chrome://flags."};let t=document.querySelectorAll(Pe);if(t.length===0)return{success:!0,fixed:0,elements:[]};try{let n=Z();if(!n)throw new Error("Writer API not available");let r=await n.create({tone:"neutral",format:"plain-text",length:"short",outputLanguage:"en"}),i=0,s=[];for(let a of t){if(a.closest("[data-yuktai-panel]"))continue;let o=window.getComputedStyle(a);if(o.display==="none"||o.visibility==="hidden")continue;let f=Re(a),d=await He(r,f);d&&d.length>0&&(a.dataset.yuktaiLabelOriginal=a.getAttribute("aria-label")||"",a.setAttribute("aria-label",d),i++,s.push({tag:a.tagName.toLowerCase(),label:d}))}return r.destroy(),{success:!0,fixed:i,elements:s}}catch(n){return{success:!1,fixed:0,elements:[],error:n instanceof Error?n.message:"Label generation failed"}}}function te(){let e=document.querySelectorAll("[data-yuktai-label-original]");for(let t of e){let n=t.dataset.yuktaiLabelOriginal;n?t.setAttribute("aria-label",n):t.removeAttribute("aria-label"),delete t.dataset.yuktaiLabelOriginal}}var L=null,ne=null;var ae=null,N=null,u=null,g=null,T=null,O=null,h=null,S={deuteranopia:"yuktai-cb-d",protanopia:"yuktai-cb-p",tritanopia:"yuktai-cb-t"};var ie=new Set(["input","select","textarea"]);var q={nav:"navigation",header:"banner",footer:"contentinfo",main:"main",aside:"complementary"};function B(e,t="polite"){if(typeof window>"u"||!h?.speechEnabled||!window.speechSynthesis)return;window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.rate=1,n.pitch=1,n.volume=1;let r=window.speechSynthesis.getVoices();r.length>0&&(n.voice=r[0]),window.speechSynthesis.speak(n)}function v(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function pe(e,t="info"){if(typeof document>"u")return;let r={success:{bg:"#0a7a44",border:"#075e34",icon:"\u2713"},error:{bg:"#b52a1c",border:"#8f2116",icon:"\u2715"},warning:{bg:"#a35f00",border:"#7a4700",icon:"\u26A0"},info:{bg:"#005A9C",border:"#003F6E",icon:"\u2139"}}[t];(!u||!u.isConnected)&&(u=document.createElement("div"),u.setAttribute("role","alert"),u.setAttribute("aria-live","assertive"),u.setAttribute("aria-atomic","true"),u.style.cssText=`
      position: fixed;
      top: 80px;
      right: 16px;
      left: auto;
      z-index: 999999;
      max-width: 320px;
      width: calc(100% - 32px);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.3s, opacity 0.3s;
      transform: translateX(120%);
      opacity: 0;
    `,document.body.appendChild(u)),u.style.background=r.bg,u.style.border=`1px solid ${r.border}`,u.style.color="#fff";let i=document.createElement("span");i.style.cssText="font-size:18px;font-weight:700",i.setAttribute("aria-hidden","true"),i.textContent=r.icon;let s=document.createElement("span");s.style.cssText="flex:1;line-height:1.4",s.textContent=String(e??"");let a=document.createElement("button");a.type="button",a.style.cssText="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;padding:0;line-height:1",a.setAttribute("aria-label","Close notification"),a.textContent="\xD7",a.addEventListener("click",()=>{let o=a.parentElement;o&&(o.style.transform="translateX(120%)",o.style.opacity="0")}),u.replaceChildren(i,s,a),window.innerWidth<=480&&(u.style.right="8px",u.style.left="8px",u.style.maxWidth="none",u.style.width="auto"),requestAnimationFrame(()=>{u&&(u.style.transform="translateX(0)",u.style.opacity="1")}),setTimeout(()=>{u&&(u.style.transform="translateX(120%)",u.style.opacity="0")},5e3)}function l(e,t="info",n=!0){L&&(L.textContent=e),pe(e,t),n&&B(e,t==="error"?"assertive":"polite")}function $e(){if(typeof document>"u"||ae)return;let e=[{label:"Skip to main content",selector:"main,[role='main'],#main,#main-content"},{label:"Skip to navigation",selector:"nav,[role='navigation'],#nav,#navigation"},{label:"Skip to search",selector:"[role='search'],#search,input[type='search']"}],t=document.createElement("div");t.setAttribute("data-yuktai-skip-bar","true"),t.setAttribute("role","navigation"),t.setAttribute("aria-label","Skip links"),t.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    background: #001124;
    transform: translateY(-100%);
    transition: transform 0.2s ease;
    font-family: system-ui, sans-serif;
  `;let n=!1;if(e.forEach(({label:i,selector:s})=>{let a=document.querySelector(s);if(!a)return;n=!0,a.getAttribute("tabindex")||a.setAttribute("tabindex","-1");let o=document.createElement("a");o.href="#",o.textContent=i,o.style.cssText=`
      color: #fff;
      background: #005A9C;
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      border: 2px solid transparent;
      transition: background 0.15s, border-color 0.15s;
    `,o.addEventListener("focus",()=>{t.style.transform="translateY(0)"}),o.addEventListener("blur",()=>{setTimeout(()=>{t.matches(":focus-within")||(t.style.transform="translateY(-100%)")},2e3)}),o.addEventListener("click",f=>{f.preventDefault(),a.focus(),a.scrollIntoView({behavior:"smooth",block:"start"}),l(`Jumped to ${i.replace("Skip to ","")}`,"info"),t.style.transform="translateY(-100%)"}),t.appendChild(o)}),!n)return;window.innerWidth<768&&(t.style.transform="translateY(0)",t.style.position="sticky"),window.addEventListener("resize",()=>{window.innerWidth<768&&(t.style.transform="translateY(0)")}),document.body.insertBefore(t,document.body.firstChild),ae=t}function Ie(){if(typeof document>"u"||document.querySelector("[data-yuktai-focus-style]"))return;let e=document.createElement("style");e.setAttribute("data-yuktai-focus-style","true"),e.textContent=`

    /* \u2500\u2500 Focus indicator \u2014 WCAG 2.4.11 minimum 2px solid \u2500\u2500 */
    [data-yuktai-a11y] *:focus-visible {
      outline: 3px solid #1a73e8 !important;
      outline-offset: 3px !important;
      border-radius: 2px !important;
      box-shadow: 0 0 0 6px rgba(26,115,232,0.15) !important;
    }

    /* \u2500\u2500 High contrast focus \u2500\u2500 */
    [data-yuktai-high-contrast] *:focus-visible {
      outline: 3px solid #ffff00 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(255,255,0,0.2) !important;
    }

    /* \u2500\u2500 Keyboard hint mode \u2500\u2500 */
    [data-yuktai-keyboard] *:focus {
      outline: 3px solid #ff6b35 !important;
      outline-offset: 3px !important;
    }

    /* \u2500\u2500 Remove default outline \u2014 replaced above \u2500\u2500 */
    [data-yuktai-a11y] *:focus:not(:focus-visible) {
      outline: none !important;
    }

    /* \u2500\u2500 Large targets \u2014 WCAG 2.5.8 \u2500\u2500 */
    [data-yuktai-large-targets] button,
    [data-yuktai-large-targets] a,
    [data-yuktai-large-targets] input,
    [data-yuktai-large-targets] select,
    [data-yuktai-large-targets] [role="button"] {
      min-height: 44px !important;
      min-width: 44px !important;
    }

    /* \u2500\u2500 Reduce motion \u2014 WCAG 2.3.3 \u2500\u2500 */
    [data-yuktai-reduce-motion] *,
    [data-yuktai-reduce-motion] *::before,
    [data-yuktai-reduce-motion] *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }

    /* \u2500\u2500 High contrast mode \u2500\u2500 */
    [data-yuktai-high-contrast] {
      filter: contrast(1.4) brightness(1.05) !important;
    }

    /* \u2500\u2500 Dark mode \u2500\u2500 */
    [data-yuktai-dark] {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    [data-yuktai-dark] img,
    [data-yuktai-dark] video,
    [data-yuktai-dark] canvas {
      filter: invert(1) hue-rotate(180deg) !important;
    }

    /* \u2500\u2500 Dyslexia font \u2500\u2500 */
    [data-yuktai-dyslexia] * {
      font-family: "Atkinson Hyperlegible", "Arial", sans-serif !important;
      letter-spacing: 0.05em !important;
      word-spacing: 0.1em !important;
      line-height: 1.8 !important;
    }

    /* \u2500\u2500 Link underline enforcement \u2500\u2500 */
    [data-yuktai-a11y] a:not([role]):not([class]) {
      text-decoration: underline !important;
    }

    /* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       RESPONSIVE BREAKPOINTS
    \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

    /* Skip link bar \u2014 wrap on small screens */
    @media (max-width: 768px) {
      [data-yuktai-skip-bar] {
        flex-wrap: wrap;
      }
      [data-yuktai-skip-bar] a {
        font-size: 12px !important;
        padding: 6px 10px !important;
      }
    }

    /* Preference panel \u2014 bottom sheet on mobile */
    @media (max-width: 480px) {
      [data-yuktai-panel] {
        width: 100% !important;
        right: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        border-radius: 16px 16px 0 0 !important;
        max-height: 85vh !important;
      }
    }

    /* FAB button \u2014 reposition on mobile */
    @media (max-width: 480px) {
      [data-yuktai-pref-toggle] {
        bottom: 12px !important;
        right: 12px !important;
        width: 44px !important;
        height: 44px !important;
      }
    }

    /* Audit badge \u2014 reposition on mobile */
    @media (max-width: 480px) {
      [data-yuktai-badge] {
        bottom: 12px !important;
        left: 12px !important;
        font-size: 11px !important;
        padding: 4px 10px !important;
      }
    }

    /* Keyboard cheatsheet \u2014 full width on mobile */
    @media (max-width: 480px) {
      [data-yuktai-cheatsheet] {
        width: calc(100vw - 32px) !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
      }
    }

    /* Timeout warning \u2014 full width on mobile */
    @media (max-width: 480px) {
      [data-yuktai-timeout] {
        width: calc(100vw - 32px) !important;
      }
    }

    /* Visual alert \u2014 full width on mobile */
    @media (max-width: 480px) {
      [data-yuktai-alert] {
        right: 8px !important;
        left: 8px !important;
        max-width: none !important;
        width: auto !important;
      }
    }
  `,document.head.appendChild(e),document.documentElement.setAttribute("data-yuktai-a11y","true")}function ze(){typeof document>"u"||document.querySelector("[data-yuktai-kb-init]")||(document.documentElement.setAttribute("data-yuktai-kb-init","true"),document.addEventListener("keydown",e=>{let t=document.activeElement;if(!t)return;let n=t.getAttribute("role")||"";if(e.key==="Escape"){let r=t.closest("[role='dialog'],[role='alertdialog']");if(r){r.style.display="none",l("Dialog closed","info");return}let i=t.closest("[role='menu'],[role='menubar']");i&&(i.style.display="none",l("Menu closed","info"))}if(n==="menuitem"||t.closest("[role='menu'],[role='menubar']")){let r=t.closest("[role='menu'],[role='menubar']");if(!r)return;let i=Array.from(r.querySelectorAll("[role='menuitem']:not([disabled])")),s=i.indexOf(t);e.key==="ArrowDown"||e.key==="ArrowRight"?(e.preventDefault(),i[(s+1)%i.length]?.focus()):e.key==="ArrowUp"||e.key==="ArrowLeft"?(e.preventDefault(),i[(s-1+i.length)%i.length]?.focus()):e.key==="Home"?(e.preventDefault(),i[0]?.focus()):e.key==="End"&&(e.preventDefault(),i[i.length-1]?.focus())}if(n==="tab"||t.closest("[role='tablist']")){let r=t.closest("[role='tablist']");if(!r)return;let i=Array.from(r.querySelectorAll("[role='tab']:not([disabled])")),s=i.indexOf(t);if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();let a=i[(s+1)%i.length];a?.focus(),a?.click()}else if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();let a=i[(s-1+i.length)%i.length];a?.focus(),a?.click()}}if(n==="option"||t.closest("[role='listbox']")){let r=t.closest("[role='listbox']");if(!r)return;let i=Array.from(r.querySelectorAll("[role='option']:not([aria-disabled='true'])")),s=i.indexOf(t);e.key==="ArrowDown"?(e.preventDefault(),i[(s+1)%i.length]?.focus()):e.key==="ArrowUp"?(e.preventDefault(),i[(s-1+i.length)%i.length]?.focus()):(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),t.setAttribute("aria-selected","true"),i.forEach(a=>{a!==t&&a.setAttribute("aria-selected","false")}),l(`Selected: ${t.textContent?.trim()}`,"success"))}e.altKey&&e.key==="a"&&(e.preventDefault(),Ne()),e.key==="Tab"&&h?.speechEnabled&&setTimeout(()=>{let r=document.activeElement;if(!r)return;let i=r.getAttribute("aria-label")||r.getAttribute("title")||r.textContent?.trim()||r.tagName.toLowerCase(),s=r.getAttribute("role")||r.tagName.toLowerCase();B(`${i}, ${s}`)},100)}))}function C(e){let t=e.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[role="button"]');if(t.length===0)return;let n=t[0],r=t[t.length-1];n.focus(),e.addEventListener("keydown",i=>{i.key==="Tab"&&(i.shiftKey?document.activeElement===n&&(i.preventDefault(),r.focus()):document.activeElement===r&&(i.preventDefault(),n.focus()))})}function Ne(){if(typeof document>"u")return;if(g){g.remove(),g=null;return}let e=document.createElement("div");e.setAttribute("role","dialog"),e.setAttribute("aria-label","Keyboard shortcuts"),e.setAttribute("aria-modal","true"),e.setAttribute("data-yuktai-cheatsheet","true"),e.style.cssText=`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999999;
    background: #1a1a2e;
    color: #fff;
    border-radius: 12px;
    padding: 24px;
    width: min(320px, calc(100vw - 32px));
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
  `;let t=[["Alt + A","Open/close this menu"],["Tab","Next focusable element"],["Shift+Tab","Previous focusable element"],["Enter","Activate button or link"],["Space","Check checkbox / scroll"],["Arrow keys","Navigate lists and menus"],["Escape","Close dialog or menu"],["Home","First item in list"],["End","Last item in list"]];e.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="margin:0;font-size:16px;font-weight:700;color:#74c0fc">
        \u2328 Keyboard shortcuts
      </h2>
      <button data-yuktai-close
        style="background:none;border:none;color:#aaa;cursor:pointer;font-size:20px;padding:0;line-height:1"
        aria-label="Close shortcuts">\xD7</button>
    </div>
    ${t.map(([r,i])=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a4a">
        <kbd style="background:#2a2a4a;color:#74c0fc;padding:3px 8px;border-radius:4px;font-size:12px;font-family:monospace;border:1px solid #3a3a6a">${r}</kbd>
        <span style="font-size:12px;color:#ccc;text-align:right;flex:1;margin-left:12px">${i}</span>
      </div>
    `).join("")}
  `,e.querySelector("[data-yuktai-close]")?.addEventListener("click",()=>{e.remove(),g=null}),e.addEventListener("keydown",r=>{r.key==="Escape"&&(e.remove(),g=null)}),document.body.appendChild(e),g=e,C(e),l("Keyboard shortcuts opened. Press Escape to close.","info")}function Oe(e){if(typeof document>"u"||!h?.showAuditBadge||typeof window<"u"&&!window.location.hostname.includes("localhost")&&!window.location.hostname.includes("127.0.0.1"))return;N&&N.remove();let t=e.score,n=t>=90?"#0f9d58":t>=70?"#f29900":"#d93025",r=t>=90?"\u267F":t>=70?"\u26A0":"\u2715",i=document.createElement("button");i.setAttribute("aria-label",`Accessibility score: ${t} out of 100`),i.setAttribute("data-yuktai-badge","true"),i.style.cssText=`
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 999998;
    background: ${n};
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    font-family: system-ui, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: transform 0.15s;
  `,i.innerHTML=`${r} ${t}/100 <span style="font-weight:400;opacity:0.85">${e.details.length} issues</span>`,i.addEventListener("click",()=>qe(e)),document.body.appendChild(i),N=i}function qe(e){let t=document.querySelector("[data-yuktai-audit-details]");if(t){t.remove();return}let n=document.createElement("div");n.setAttribute("data-yuktai-audit-details","true"),n.setAttribute("role","dialog"),n.setAttribute("aria-label","Accessibility audit details"),n.style.cssText=`
    position: fixed;
    bottom: 56px;
    left: 16px;
    right: 16px;
    z-index: 999999;
    background: #1a1a2e;
    color: #fff;
    border-radius: 12px;
    padding: 16px;
    width: auto;
    max-width: 340px;
    max-height: 60vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
    font-size: 12px;
  `;let r={critical:"#d93025",serious:"#f29900",moderate:"#1a73e8",minor:"#0f9d58"};n.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <strong style="font-size:14px;color:#74c0fc">Audit report</strong>
      <span style="color:#aaa">${v(e.fixed)} fixed \xB7 ${v(e.renderTime)}ms</span>
    </div>
    ${e.details.slice(0,20).map(i=>`
      <div style="padding:6px 0;border-bottom:1px solid #2a2a4a">
        <div style="display:flex;gap:6px;align-items:center">
          <span style="background:${r[i.severity]};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase">${v(i.severity)}</span>
          <code style="color:#74c0fc">&lt;${v(i.tag)}&gt;</code>
        </div>
        <div style="color:#ccc;margin-top:3px">${v(i.fix)}</div>
      </div>
    `).join("")}
    ${e.details.length>20?`<div style="color:#888;padding:8px 0;text-align:center">+${e.details.length-20} more issues</div>`:""}
  `,n.addEventListener("keydown",i=>{i.key==="Escape"&&n.remove()}),document.body.appendChild(n),C(n)}function fe(e){typeof document>"u"||(O&&clearTimeout(O),O=setTimeout(()=>{if(T)return;let t=document.createElement("div");t.setAttribute("role","alertdialog"),t.setAttribute("aria-label","Session timeout warning"),t.setAttribute("aria-modal","true"),t.setAttribute("data-yuktai-timeout","true"),t.style.cssText=`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999999;
      background: #fff;
      color: #111;
      border-radius: 12px;
      padding: 24px;
      width: min(320px, calc(100vw - 32px));
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      font-family: system-ui, sans-serif;
      border: 2px solid #d93025;
    `,t.innerHTML=`
      <h2 style="margin:0 0 8px;font-size:18px;color:#d93025">\u23F1 Session timeout</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#444">
        Your session will expire soon. Do you need more time?
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button data-yuktai-extend
          style="flex:1;min-width:120px;padding:10px;background:#1a73e8;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">
          Yes, more time
        </button>
        <button data-yuktai-dismiss
          style="flex:1;min-width:120px;padding:10px;background:#f1f3f4;color:#111;border:none;border-radius:8px;cursor:pointer;font-size:14px">
          No, sign out
        </button>
      </div>
    `;let n=t.querySelector("[data-yuktai-extend]"),r=t.querySelector("[data-yuktai-dismiss]");n?.addEventListener("click",()=>{t.remove(),T=null,l("Session extended. You have more time.","success"),h?.timeoutWarning&&fe(h.timeoutWarning)}),r?.addEventListener("click",()=>{t.remove(),T=null}),document.body.appendChild(t),T=t,C(t),l("Warning: Your session will expire soon. Do you need more time?","warning")},e*1e3))}function Be(e){if(typeof document>"u")return;let t=document.documentElement;if(t.toggleAttribute("data-yuktai-high-contrast",!!e.highContrast),t.toggleAttribute("data-yuktai-dark",!!e.darkMode),t.toggleAttribute("data-yuktai-reduce-motion",!!e.reduceMotion),t.toggleAttribute("data-yuktai-large-targets",!!e.largeTargets),t.toggleAttribute("data-yuktai-keyboard",!!e.keyboardHints),t.toggleAttribute("data-yuktai-dyslexia",!!e.dyslexiaFont),e.localFont?document.body.style.fontFamily=`"${e.localFont}", system-ui, sans-serif`:e.dyslexiaFont||(document.body.style.fontFamily=""),e.fontSizeMultiplier&&e.fontSizeMultiplier!==1?document.documentElement.style.fontSize=`${e.fontSizeMultiplier*100}%`:document.documentElement.style.fontSize="",e.colorBlindMode&&e.colorBlindMode!=="none"){let n=e.colorBlindMode==="achromatopsia"?"grayscale(100%)":`url(#${S[e.colorBlindMode]})`;document.body.style.filter=n}else document.body.style.filter=""}function De(e){try{let t=localStorage.getItem("yuktai-a11y-prefs");t&&Object.assign(e,JSON.parse(t))}catch{}}async function re(e){if(e){if(!await P()){l("Plain English requires Chrome 127+","warning");return}l("Rewriting page in plain English...","info",!1);let n=await G();l(n.error?`Plain English failed: ${n.error}`:`${n.fixed} sections rewritten in plain English`,n.error?"error":"success",!1)}else _(),l("Original text restored","info",!1)}async function oe(e){if(e){if(!await R()){l("Page summariser requires Chrome 127+","warning");return}l("Generating page summary...","info",!1);let n=await j();l(n.error?`Summary failed: ${n.error}`:"Page summary added at top",n.error?"error":"success",!1)}else k(),l("Page summary removed","info",!1)}async function se(e){if(e==="en"){H(),l("Page restored to English","info",!1);return}l(`Translating page to ${e}...`,"info",!1);let t=await K(e);l(t.error?`Translation failed: ${t.error}`:`Page translated to ${e}`,t.error?"error":"success",!1)}async function le(e){if(e){if(!$()){l("Voice control not supported in this browser","warning");return}J(t=>{t.success&&l(`Voice: ${t.action}`,"info",!1)}),l("Voice control started. Say a command.","success",!1)}else I(),l("Voice control stopped","info",!1)}async function ce(e){if(e){if(!await z()){l("Smart labels requires Chrome 127+","warning");return}l("Generating smart labels...","info",!1);let n=await ee();l(n.error?`Smart labels failed: ${n.error}`:`${n.fixed} elements labelled`,n.error?"error":"success",!1)}else te(),l("Smart labels removed","info",!1)}function Fe(){if(typeof document>"u"||L)return;let e=document.createElement("div");e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true"),e.setAttribute("aria-relevant","text"),e.style.cssText="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);",document.body.appendChild(e),L=e}function Ge(){if(typeof document>"u"||ne)return;let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("aria-hidden","true"),e.style.cssText="position:absolute;width:0;height:0;overflow:hidden;",e.innerHTML=`
    <defs>
      <filter id="${S.deuteranopia}">
        <feColorMatrix type="matrix"
          values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${S.protanopia}">
        <feColorMatrix type="matrix"
          values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${S.tritanopia}">
        <feColorMatrix type="matrix"
          values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
      </filter>
    </defs>
  `,document.body.appendChild(e),ne=e}function ue(e){return e.getAttribute("aria-label")?.trim()||e.getAttribute("aria-labelledby")||e.getAttribute("title")?.trim()||e.textContent?.trim()?!0:!!e.querySelector("img[alt]:not([alt='']), svg[aria-label], svg title, [aria-label]")}function de(e){let t={critical:20,serious:10,moderate:5,minor:2},n=e.details.reduce((r,i)=>r+(t[i.severity]||0),0);return Math.max(0,Math.min(100,100-n))}var _e={name:"yuktai-a11y",version:"4.0.0",observer:null,async execute(e){if(!e.enabled)return this.stopObserver(),"yuktai: disabled.";h=e,De(e),Fe(),Ge(),Ie(),ze(),e.showSkipLinks!==!1&&$e(),e.showPreferencePanel,Be(e);let t=this.applyFixes(e);t.score=de(t),e.showAuditBadge&&Oe(t),e.timeoutWarning&&fe(e.timeoutWarning),e.autoFix&&this.startObserver(e),e.plainEnglish&&await re(!0),e.summarisePage&&await oe(!0),e.translateLanguage&&e.translateLanguage!=="en"&&await se(e.translateLanguage),e.voiceControl&&await le(!0),e.smartLabels&&await ce(!0);let n=`${t.fixed} fixes applied. Score: ${t.score}/100.`;return l(n,t.score>=90?"success":"info",!1),`yuktai v4.0.0: ${n} Scanned ${t.scanned} elements in ${t.renderTime}ms.`},applyFixes(e){let t={fixed:0,scanned:0,renderTime:0,score:100,details:[]};if(typeof document>"u")return t;let n=performance.now(),r=document.querySelectorAll("*");t.scanned=r.length;let i=(s,a,o,f)=>{t.details.push({tag:s,fix:a,severity:o,element:f.outerHTML.slice(0,100)}),t.fixed++};return r.forEach(s=>{let a=s,o=a.tagName.toLowerCase();if(o==="html"&&!a.getAttribute("lang")&&(a.setAttribute("lang","en"),i(o,'lang="en" added',"critical",a)),o==="meta"){let c=a.getAttribute("name"),x=a.getAttribute("content")||"";c==="viewport"&&x.includes("user-scalable=no")&&(a.setAttribute("content",x.replace("user-scalable=no","user-scalable=yes")),i(o,"user-scalable=yes restored","serious",a)),c==="viewport"&&/maximum-scale=1(?:[^0-9]|$)/.test(x)&&(a.setAttribute("content",x.replace(/maximum-scale=1(?=[^0-9]|$)/,"maximum-scale=5")),i(o,"maximum-scale=5 restored","serious",a))}if(o==="main"&&!a.getAttribute("tabindex")&&(a.setAttribute("tabindex","-1"),a.getAttribute("id")||a.setAttribute("id","main-content")),o==="img"&&(a.hasAttribute("alt")||(a.setAttribute("alt",""),a.setAttribute("aria-hidden","true"),i(o,'alt="" aria-hidden="true"',"serious",a))),o==="svg"&&(!a.getAttribute("aria-hidden")&&!a.getAttribute("aria-label")&&!s.querySelector("title")&&(a.setAttribute("aria-hidden","true"),i(o,'aria-hidden="true" (decorative svg)',"minor",a)),a.getAttribute("focusable")||a.setAttribute("focusable","false")),o==="iframe"&&!a.getAttribute("title")&&!a.getAttribute("aria-label")&&(a.setAttribute("title","embedded content"),a.setAttribute("aria-label","embedded content"),i(o,"title + aria-label added","serious",a)),o==="button"){if(!ue(a)){let c=a.getAttribute("title")||"button";a.setAttribute("aria-label",c),i(o,`aria-label="${c}" (empty button)`,"critical",a)}a.hasAttribute("disabled")&&!a.getAttribute("aria-disabled")&&(a.setAttribute("aria-disabled","true"),t.fixed++)}if(o==="a"){let c=a;ue(a)||(a.setAttribute("aria-label",a.getAttribute("title")||"link"),i(o,"aria-label added (empty link)","critical",a)),c.target==="_blank"&&!c.rel?.includes("noopener")&&(c.rel="noopener noreferrer",t.fixed++)}if(ie.has(o)){let c=a;if(!(!!(c.labels&&c.labels.length)||!!a.getAttribute("title")||c.type==="hidden"||c.type==="submit"||c.type==="button"||c.type==="reset")&&!a.getAttribute("aria-label")&&!a.getAttribute("aria-labelledby")){let w=a.getAttribute("placeholder")||a.getAttribute("name")||o;a.setAttribute("aria-label",w),i(o,`aria-label="${w}"`,"serious",a)}if(a.hasAttribute("required")&&!a.getAttribute("aria-required")&&(a.setAttribute("aria-required","true"),t.fixed++),o==="input"&&!c.autocomplete){let w=c.name||"",D=c.type==="email"||w.includes("email")?"email":c.type==="tel"||w.includes("tel")?"tel":c.type==="password"?"current-password":"";D&&(c.autocomplete=D,t.fixed++)}}o==="th"&&!a.getAttribute("scope")&&(a.setAttribute("scope",a.closest("thead")?"col":"row"),i(o,"scope added to <th>","moderate",a));let f=(o==="header"||o==="footer")&&!!a.parentElement?.closest("article,aside,main,nav,section,[role='dialog'],[role='region']");q[o]&&!a.getAttribute("role")&&!f&&(a.setAttribute("role",q[o]),i(o,`role="${q[o]}"`,"minor",a));let d=a.getAttribute("role")||"";d==="tab"&&!a.getAttribute("aria-selected")&&(a.setAttribute("aria-selected","false"),t.fixed++),["alert","status","log"].includes(d)&&!a.getAttribute("aria-live")&&(a.setAttribute("aria-live",d==="alert"?"assertive":"polite"),i(o,`aria-live added on role=${d}`,"moderate",a)),d==="combobox"&&!a.getAttribute("aria-expanded")&&(a.setAttribute("aria-expanded","false"),i(o,'aria-expanded="false" on combobox',"serious",a)),(d==="checkbox"||d==="radio")&&!a.getAttribute("aria-checked")&&(a.setAttribute("aria-checked","false"),i(o,`aria-checked="false" on role=${d}`,"serious",a))}),t.renderTime=parseFloat((performance.now()-n).toFixed(2)),t},scan(){let e={fixed:0,scanned:0,renderTime:0,score:100,details:[]};if(typeof document>"u")return e;let t=performance.now(),n=document.querySelectorAll("*");e.scanned=n.length;let r=(i,s,a,o)=>e.details.push({tag:i,fix:s,severity:a,element:o.outerHTML.slice(0,100)});return n.forEach(i=>{let s=i,a=s.tagName.toLowerCase();(a==="a"||a==="button")&&!s.innerText?.trim()&&!s.getAttribute("aria-label")&&r(a,"needs aria-label (empty)","critical",s),a==="img"&&!s.hasAttribute("alt")&&r(a,"needs alt text","serious",s),ie.has(a)&&!s.getAttribute("aria-label")&&!s.getAttribute("aria-labelledby")&&r(a,"needs aria-label","serious",s),a==="iframe"&&!s.getAttribute("title")&&!s.getAttribute("aria-label")&&r(a,"iframe needs title","serious",s)}),e.fixed=e.details.length,e.score=de(e),e.renderTime=parseFloat((performance.now()-t).toFixed(2)),e},startObserver(e){this.observer||typeof document>"u"||(this.observer=new MutationObserver(()=>this.applyFixes(e)),this.observer.observe(document.body,{childList:!0,subtree:!0,attributes:!1}))},stopObserver(){this.observer?.disconnect(),this.observer=null},announce:l,speak:B,showVisualAlert:pe,trapFocus:C,handlePlainEnglish:re,handleSummarisePage:oe,handleTranslate:se,handleVoiceControl:le,handleSmartLabels:ce,SUPPORTED_LANGUAGES:U};return xe(Ve);})();
