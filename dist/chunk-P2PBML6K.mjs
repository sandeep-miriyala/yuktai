function i(){return new Promise(t=>{let r=setTimeout(t,1500),e=new MutationObserver(()=>{clearTimeout(r),r=setTimeout(()=>{e.disconnect(),t()},500)});e.observe(document.body,{childList:!0,subtree:!0})})}function c(){let t=[],r=document.querySelectorAll("*");for(let e of r){if(e.closest("[data-yuktai-panel]"))continue;let s=e.innerText?.trim();s&&s.length>30&&t.push(s);let n=e.getAttribute("aria-label");if(n&&n.length>10&&t.push(n),(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&(e.placeholder&&t.push(e.placeholder),e.value&&t.push(e.value)),e instanceof HTMLButtonElement){let a=e.innerText||e.getAttribute("aria-label");a&&t.push(a)}}return t.join(" ").slice(0,3500)}async function l(t){if(!t.trim())return{success:!1,answer:"",error:"Please type a question."};try{let r=window,e=r.LanguageModel||r.ai?.languageModel;if(!e)return{success:!1,answer:"",error:"Gemini Nano not available."};await i();let s=c();if(!s||s.length<100)return{success:!1,answer:"",error:"Page content not readable."};let n;try{n=await e.create({systemPrompt:`Answer ONLY using page content.
Keep answer short (2\u20133 sentences).
If not found say: "I could not find that on this page."`,outputLanguage:"en"})}catch{n=await e.create()}let a=`Page:
${s}

Q: ${t}`,o=await n.prompt(a);return n?.destroy&&n.destroy(),{success:!0,answer:o?.trim()||"No answer found."}}catch(r){return{success:!1,answer:"",error:r instanceof Error?r.message:"Error occurred"}}}async function f(t,r){if(!t.trim()||!r.trim())return{success:!1,answer:"",error:"Nothing to answer from."};try{let e=window,s=e.LanguageModel||e.ai?.languageModel;if(!s)return{success:!1,answer:"",error:"Gemini Nano not available."};let n;try{n=await s.create({systemPrompt:`Answer ONLY using page content.
Keep answer short (2\u20133 sentences).
If not found say: "I could not find that on this page."`,outputLanguage:"en"})}catch{n=await s.create()}let a=await n.prompt(`Page:
${r.slice(0,3500)}

Q: ${t}`);return n?.destroy&&n.destroy(),{success:!0,answer:a?.trim()||"No answer found."}}catch(e){return{success:!1,answer:"",error:e instanceof Error?e.message:"Error occurred"}}}export{l as a,f as b};
