"use strict";var Wi=Object.create;var Bt=Object.defineProperty;var Bi=Object.getOwnPropertyDescriptor;var Hi=Object.getOwnPropertyNames;var _i=Object.getPrototypeOf,qi=Object.prototype.hasOwnProperty;var st=(e,t)=>()=>(e&&(t=e(e=0)),t);var yt=(e,t)=>{for(var n in t)Bt(e,n,{get:t[n],enumerable:!0})},Lo=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Hi(t))!qi.call(e,r)&&r!==n&&Bt(e,r,{get:()=>t[r],enumerable:!(o=Bi(t,r))||o.enumerable});return e};var hn=(e,t,n)=>(n=e!=null?Wi(_i(e)):{},Lo(t||!e||!e.__esModule?Bt(n,"default",{value:e,enumerable:!0}):n,e)),ji=e=>Lo(Bt({},"__esModule",{value:!0}),e);var C=st(()=>{});var or={};yt(or,{askPage:()=>Rn});function fs(){return new Promise(e=>{let t=setTimeout(e,1500),n=new MutationObserver(()=>{clearTimeout(t),t=setTimeout(()=>{n.disconnect(),e()},500)});n.observe(document.body,{childList:!0,subtree:!0})})}function hs(){let e=[],t=document.querySelectorAll("*");for(let n of t){if(n.closest("[data-yuktai-panel]"))continue;let o=n.innerText?.trim();o&&o.length>30&&e.push(o);let r=n.getAttribute("aria-label");if(r&&r.length>10&&e.push(r),(n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement)&&(n.placeholder&&e.push(n.placeholder),n.value&&e.push(n.value)),n instanceof HTMLButtonElement){let s=n.innerText||n.getAttribute("aria-label");s&&e.push(s)}}return e.join(" ").slice(0,3500)}async function Rn(e){if(!e.trim())return{success:!1,answer:"",error:"Please type a question."};try{let t=window,n=t.LanguageModel||t.ai?.languageModel;if(!n)return{success:!1,answer:"",error:"Gemini Nano not available."};await fs();let o=hs();if(!o||o.length<100)return{success:!1,answer:"",error:"Page content not readable."};let r;try{r=await n.create({systemPrompt:`Answer ONLY using page content.
Keep answer short (2\u20133 sentences).
If not found say: "I could not find that on this page."`,outputLanguage:"en"})}catch{r=await n.create()}let s=`Page:
${o}

Q: ${e}`,i=await r.prompt(s);return r?.destroy&&r.destroy(),{success:!0,answer:i?.trim()||"No answer found."}}catch(t){return{success:!1,answer:"",error:t instanceof Error?t.message:"Error occurred"}}}var En=st(()=>{"use strict";C()});var Ln={};yt(Ln,{askPageWithTransformers:()=>$n,getModelLoadStatus:()=>wt,isTransformersSupported:()=>xt});function ar(){return typeof navigator>"u"?!1:/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent)}function bs(){if(ar())return"wasm";try{if(typeof navigator<"u"&&"gpu"in navigator&&navigator.gpu!==void 0)return"webgpu"}catch{}return"wasm"}async function ys(){if(!In){if(dt){for(;dt;)await new Promise(e=>setTimeout(e,200));return}dt=!0;try{let{pipeline:e,env:t}=await import("@huggingface/transformers");t.allowRemoteModels=!0,t.allowLocalModels=!1,typeof window<"u"&&typeof caches<"u"&&(t.useWasmCache=!0);let n=bs(),o=ar();console.log(`yuktai: Transformers.js \u2014 device: ${n}, mobile: ${o}`),ir=await e("feature-extraction","Xenova/all-MiniLM-L6-v2",{device:n,dtype:o?"q4":"fp32"}),sr=await e("text2text-generation","Xenova/flan-t5-small",{device:n,dtype:o?"q4":"fp32"}),In=!0,dt=!1,console.log("yuktai: Transformers.js models loaded \u2705")}catch(e){throw dt=!1,console.error("yuktai: Transformers.js model load failed",e),e}}}function xs(){return new Promise(e=>{let t=setTimeout(e,1500),n=new MutationObserver(()=>{clearTimeout(t),t=setTimeout(()=>{n.disconnect(),e()},500)});n.observe(document.body,{childList:!0,subtree:!0})})}function ws(){let e=[],t=new Set,n=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, td, th, label, figcaption, blockquote, span, a, button, div");for(let i of n){if(i.closest("[data-yuktai-panel]")||i.querySelector("p, h1, h2, h3, h4, li, td, div"))continue;let l=i.innerText?.trim();if(!l||l.length<15||t.has(l))continue;t.add(l),e.push(l);let c=i.getAttribute("aria-label")?.trim();c&&c.length>8&&!t.has(c)&&(t.add(c),e.push(c))}let o=document.title?.trim();o&&!t.has(o)&&e.unshift(o);let s=document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim();return s&&!t.has(s)&&e.unshift(s),e.join(" ").slice(0,8e3)}function vs(e,t=150,n=30){if(typeof e!="string")try{e=String(e??"")}catch{return[]}let o=e.trim();if(!o)return[];let r=Math.min(n,Math.floor(t/2)),s=o.split(/\s+/),i=[],a=t-r;for(let l=0;l<s.length;l+=a){let c=s.slice(l,l+t).join(" ");c.trim().length>20&&i.push(c)}return i}function ks(e,t){let n=0,o=0,r=0;for(let s=0;s<e.length;s++)n+=e[s]*t[s],o+=e[s]*e[s],r+=t[s]*t[s];return n/(Math.sqrt(o)*Math.sqrt(r)+1e-8)}async function rr(e){let t=await ir(e,{pooling:"mean",normalize:!0}),n=t?.data??t;return Array.from(n)}async function Ss(e,t,n=3){let o=await rr(e),r=await Promise.all(t.map(async s=>{let i=await rr(s),a=ks(o,i);return{chunk:s,score:a}}));return r.sort((s,i)=>i.score-s.score),r.slice(0,n).map(s=>s.chunk)}async function $n(e){if(!e.trim())return{success:!1,answer:"",error:"Please type a question."};try{await ys(),await xs();let t=ws();if(!t||t.length<50)return{success:!1,answer:"",error:"Not enough content on this page."};let n=vs(t);if(n.length===0)return{success:!1,answer:"",error:"Could not process page content."};let s=`Answer the question based on the context. Give a complete answer in 2-3 sentences.

Context: ${(await Ss(e,n,3)).join(" ").slice(0,1200)}

Question: ${e}

Answer:`,a=(await sr(s,{max_new_tokens:120,min_new_tokens:10}))?.[0]?.generated_text?.trim()||"";return a?{success:!0,answer:a}:{success:!0,answer:"I could not find a specific answer on this page."}}catch(t){console.error("yuktai: Transformers RAG error",t);let n=t instanceof Error?t.message:"";return n.includes("Out of memory")||n.includes("memory")?{success:!1,answer:"",error:"Not enough device memory. Try on a device with more RAM or use desktop Chrome with Gemini Nano."}:{success:!1,answer:"",error:n||"Transformers.js error."}}}function xt(){try{return typeof WebAssembly<"u"&&typeof Worker<"u"}catch{return!1}}function wt(){return In?"ready":dt?"loading":"idle"}var ir,sr,dt,In,vt=st(()=>{"use strict";C();ir=null,sr=null,dt=!1,In=!1});function cr(e,t){return e.replace(/\{\{SITE_NAME\}\}/g,t.SITE_NAME).replace(/\{\{THEME_COLOR\}\}/g,t.THEME_COLOR).replace(/\{\{TAGLINE\}\}/g,t.TAGLINE).replace(/\{\{YEAR\}\}/g,t.YEAR)}var Mn,dr,ur,pr,gr,mr,fr,hr,br,yr,xr,wr,vr,kr,Sr,Tr,Ar,Cr,Rr,Er,Ir,$r,Lr,Nr,Fr,Mr=st(()=>{"use strict";C();Mn={blue:"#1a73e8",green:"#0d9488",purple:"#7c3aed",red:"#dc2626",orange:"#ea580c",teal:"#0891b2",indigo:"#4f46e5",gray:"#374151"},dr=e=>`{
  "name": "${e.toLowerCase().replace(/\s+/g,"-")}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
`,ur=`/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
`,pr=e=>`/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${e}",
      },
    },
  },
  plugins: [],
}
`,gr=e=>`@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${e};
  --primary-dark: ${e}dd;
  --foreground: #0f172a;
  --background: #ffffff;
  --muted: #64748b;
  --border: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--foreground);
  background: var(--background);
}

a {
  color: inherit;
  text-decoration: none;
}
`,mr=`import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "{{SITE_NAME}}",
  description: "{{TAGLINE}}",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
`,fr=`"use client"
import Link from "next/link"
import { useState } from "react"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          {{SITE_NAME}}
        </Link>
        <button
          className={styles.toggle}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          \u2630
        </button>
        <ul className={\`\${styles.links} \${open ? styles.open : ""}\`}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </div>
    </nav>
  )
}
`,hr=`.navbar {
  background: var(--primary);
  color: white;
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.links a {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.links a:hover {
  color: white;
}

.toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .toggle { display: block; }
  .links {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--primary);
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  .links.open { display: flex; }
}
`,br=`import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.brand}>{{SITE_NAME}}</p>
        <p className={styles.tagline}>{{TAGLINE}}</p>
        <p className={styles.copy}>\xA9 {{YEAR}} {{SITE_NAME}}. All rights reserved.</p>
      </div>
    </footer>
  )
}
`,yr=`.footer {
  background: #0f172a;
  color: #94a3b8;
  padding: 3rem 1rem;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.tagline {
  font-size: 0.9rem;
  color: #64748b;
}

.copy {
  font-size: 0.8rem;
  color: #475569;
  margin-top: 1rem;
}
`,xr=`import styles from "./page.module.css"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to {{SITE_NAME}}</h1>
          <p className={styles.heroSubtitle}>{{TAGLINE}}</p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.btnPrimary}>Get Started</Link>
            <Link href="/about" className={styles.btnSecondary}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.grid}>
            {[
              { icon: "\u26A1", title: "Fast", desc: "Lightning fast performance on all devices" },
              { icon: "\u{1F512}", title: "Secure", desc: "Enterprise-grade security built in" },
              { icon: "\u{1F4F1}", title: "Responsive", desc: "Works perfectly on mobile and desktop" },
            ].map(f => (
              <div key={f.title} className={styles.card}>
                <span className={styles.icon}>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to get started?</h2>
          <p>Join thousands of happy customers today.</p>
          <Link href="/contact" className={styles.btnPrimary}>Contact Us</Link>
        </div>
      </section>

    </div>
  )
}
`,wr=`.page { min-height: 100vh; }

.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 6rem 1rem;
  text-align: center;
}

.heroContent { max-width: 700px; margin: 0 auto; }

.heroTitle {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.heroSubtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.heroActions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.btnPrimary {
  background: white;
  color: var(--primary);
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  transition: transform 0.2s;
  display: inline-block;
}

.btnPrimary:hover { transform: translateY(-2px); }

.btnSecondary {
  background: rgba(255,255,255,0.15);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: 1px solid rgba(255,255,255,0.3);
  transition: background 0.2s;
  display: inline-block;
}

.btnSecondary:hover { background: rgba(255,255,255,0.25); }

.features { padding: 5rem 1rem; background: #f8fafc; }

.container { max-width: 1200px; margin: 0 auto; }

.sectionTitle {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #0f172a;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  text-align: center;
}

.icon { font-size: 2.5rem; display: block; margin-bottom: 1rem; }
.card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
.card p { color: #64748b; font-size: 0.9rem; line-height: 1.6; }

.cta {
  background: var(--primary);
  color: white;
  padding: 5rem 1rem;
  text-align: center;
}

.cta h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; }
.cta p { font-size: 1.1rem; opacity: 0.85; margin-bottom: 2rem; }
`,vr=`import styles from "./page.module.css"

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>About {{SITE_NAME}}</h1>
        <p>{{TAGLINE}}</p>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div>
              <h2>Our Story</h2>
              <p>We started with a simple mission \u2014 to provide the best experience for our customers. Built on trust, quality, and dedication, {{SITE_NAME}} has grown to serve thousands of happy customers.</p>
              <p>Our team of experts is committed to delivering excellence in everything we do. We believe in building long-term relationships with our clients.</p>
            </div>
            <div>
              <h2>Our Values</h2>
              <ul className={styles.list}>
                <li>\u2705 Customer first approach</li>
                <li>\u2705 Quality in everything</li>
                <li>\u2705 Transparent communication</li>
                <li>\u2705 Continuous improvement</li>
                <li>\u2705 Community focus</li>
              </ul>
            </div>
          </div>
          <div className={styles.stats}>
            {[
              { number: "1000+", label: "Happy Customers" },
              { number: "5+", label: "Years Experience" },
              { number: "50+", label: "Team Members" },
              { number: "99%", label: "Satisfaction Rate" },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.number}>{s.number}</span>
                <span className={styles.label}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
`,kr=`.page { min-height: 100vh; }

.hero {
  background: var(--primary);
  color: white;
  padding: 5rem 1rem;
  text-align: center;
}

.hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
.hero p  { font-size: 1.1rem; opacity: 0.85; }

.content { padding: 4rem 1rem; }

.container { max-width: 1100px; margin: 0 auto; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;
}

.grid h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--primary); }
.grid p  { color: #475569; line-height: 1.7; margin-bottom: 1rem; }

.list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.list li { color: #475569; font-size: 0.95rem; }

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  background: #f8fafc;
  padding: 2.5rem;
  border-radius: 16px;
}

.stat { text-align: center; }

.number {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.label { font-size: 0.85rem; color: #64748b; }
`,Sr=`"use client"
import { useState } from "react"
import styles from "./page.module.css"

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Contact Us</h1>
        <p>We would love to hear from you. Get in touch with our team.</p>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.info}>
              <h2>Get in Touch</h2>
              <div className={styles.detail}>
                <span>\u{1F4CD}</span>
                <div>
                  <strong>Address</strong>
                  <p>123 Business Street, City, State 400001</p>
                </div>
              </div>
              <div className={styles.detail}>
                <span>\u{1F4DE}</span>
                <div>
                  <strong>Phone</strong>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className={styles.detail}>
                <span>\u2709\uFE0F</span>
                <div>
                  <strong>Email</strong>
                  <p>hello@{{SITE_NAME_LOWER}}.com</p>
                </div>
              </div>
            </div>
            <div className={styles.formWrap}>
              {sent ? (
                <div className={styles.success}>
                  \u2705 Message sent! We will get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name" type="text" required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email" type="email" required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message" required rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button type="submit" className={styles.btn}>Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
`,Tr=`.page { min-height: 100vh; }

.hero {
  background: var(--primary);
  color: white;
  padding: 5rem 1rem;
  text-align: center;
}

.hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
.hero p  { font-size: 1.1rem; opacity: 0.85; }

.content { padding: 4rem 1rem; }
.container { max-width: 1100px; margin: 0 auto; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
}

.info h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; color: var(--primary); }

.detail {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.detail span { font-size: 1.5rem; }
.detail strong { display: block; font-weight: 600; margin-bottom: 0.25rem; }
.detail p { color: #64748b; font-size: 0.9rem; }

.form { display: flex; flex-direction: column; gap: 1.25rem; }

.field { display: flex; flex-direction: column; gap: 0.4rem; }

.field label { font-size: 0.875rem; font-weight: 600; color: #374151; }

.field input,
.field textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  font-family: inherit;
  transition: border-color 0.2s;
  outline: none;
}

.field input:focus,
.field textarea:focus { border-color: var(--primary); }

.btn {
  background: var(--primary);
  color: white;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.9; }

.success {
  padding: 2rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  color: #166534;
  font-size: 1.1rem;
  text-align: center;
}
`,Ar=`import styles from "./page.module.css"

const SERVICES = [
  { icon: "\u{1F680}", title: "Service One", desc: "Comprehensive solution designed to meet your business needs efficiently and effectively." },
  { icon: "\u{1F4A1}", title: "Service Two", desc: "Innovative approaches that help your business grow and stay ahead of the competition." },
  { icon: "\u{1F527}", title: "Service Three", desc: "Expert support and maintenance to ensure smooth operations at all times." },
  { icon: "\u{1F4CA}", title: "Service Four", desc: "Data-driven insights and analytics to help you make better business decisions." },
  { icon: "\u{1F91D}", title: "Service Five", desc: "Partnership programs designed to create mutual value and long-term success." },
  { icon: "\u{1F310}", title: "Service Six", desc: "Global reach with local expertise to serve customers worldwide." },
]

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Our Services</h1>
        <p>Everything you need to succeed \u2014 all in one place</p>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {SERVICES.map(s => (
              <div key={s.title} className={styles.card}>
                <span className={styles.icon}>{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
`,Cr=`.page { min-height: 100vh; }

.hero {
  background: var(--primary);
  color: white;
  padding: 5rem 1rem;
  text-align: center;
}

.hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
.hero p  { font-size: 1.1rem; opacity: 0.85; }

.content { padding: 4rem 1rem; background: #f8fafc; }
.container { max-width: 1100px; margin: 0 auto; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.icon { font-size: 2rem; display: block; margin-bottom: 1rem; }

.card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f172a;
}

.card p { color: #64748b; font-size: 0.9rem; line-height: 1.6; }
`,Rr=`import styles from "./page.module.css"
import Link from "next/link"

const PLANS = [
  {
    name: "Starter",
    price: "\u20B9999",
    period: "/month",
    features: ["5 Users", "10GB Storage", "Email Support", "Basic Analytics"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "\u20B92,999",
    period: "/month",
    features: ["25 Users", "50GB Storage", "Priority Support", "Advanced Analytics", "API Access"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited Users", "Unlimited Storage", "24/7 Support", "Custom Analytics", "Dedicated Manager"],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Simple Pricing</h1>
        <p>No hidden fees. Cancel anytime.</p>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={\`\${styles.card} \${plan.highlighted ? styles.highlighted : ""}\`}
              >
                {plan.highlighted && <span className={styles.badge}>Most Popular</span>}
                <h3>{plan.name}</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.period}>{plan.period}</span>
                </div>
                <ul className={styles.features}>
                  {plan.features.map(f => <li key={f}>\u2705 {f}</li>)}
                </ul>
                <Link href="/contact" className={styles.btn}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
`,Er=`.page { min-height: 100vh; }

.hero {
  background: var(--primary);
  color: white;
  padding: 5rem 1rem;
  text-align: center;
}

.hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
.hero p  { font-size: 1.1rem; opacity: 0.85; }

.content { padding: 4rem 1rem; background: #f8fafc; }
.container { max-width: 1100px; margin: 0 auto; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  position: relative;
  border: 2px solid transparent;
}

.highlighted {
  border-color: var(--primary);
  transform: scale(1.03);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

.badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  padding: 2px 16px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; }

.price { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 1.5rem; }

.amount { font-size: 2rem; font-weight: 800; color: var(--primary); }
.period { font-size: 0.875rem; color: #64748b; }

.features { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
.features li { font-size: 0.9rem; color: #475569; }

.btn {
  display: block;
  text-align: center;
  background: var(--primary);
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.9; }
`,Ir=`"use client"
import { useState } from "react"
import styles from "./page.module.css"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(mode === "login" ? "Login successful!" : "Account created!")
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{{SITE_NAME}}</h1>
        <div className={styles.tabs}>
          <button
            className={\`\${styles.tab} \${mode === "login" ? styles.active : ""}\`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={\`\${styles.tab} \${mode === "register" ? styles.active : ""}\`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "register" && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text" required placeholder="Your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email" required placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password" required placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className={styles.btn}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}
`,$r=`.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 2rem;
}

.card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 420px;
}

.title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 700;
}

.form { display: flex; flex-direction: column; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #374151; }

.field input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus { border-color: var(--primary); }

.btn {
  background: var(--primary);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.9; }
`,Lr=`import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "6rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1rem 0 0.5rem" }}>Page Not Found</h2>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>The page you are looking for does not exist.</p>
        <Link href="/" style={{ background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", fontWeight: 600 }}>
          Go Home
        </Link>
      </div>
    </div>
  )
}
`,Nr=`{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,Fr=e=>`# ${e}

Generated by **yuktai Vibe Coder** \u2014 open source AI plugin for Next.js.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16** \u2014 React framework
- **Tailwind CSS** \u2014 Utility-first styling
- **CSS Modules** \u2014 Scoped component styles
- **TypeScript** \u2014 Type safety

## Pages

All pages are in \`src/app/\` directory.
Edit any page to customise content.

---

*Built with yuktai \u2014 aksharatantra.vercel.app*
`});var Pr={};yt(Pr,{generateZip:()=>Ws});function Ds(e,t){return{hotel:`Experience luxury and comfort at ${e}`,ecommerce:`Shop the best products at ${e}`,restaurant:`Delicious food crafted with love at ${e}`,portfolio:`Creative work and professional services by ${e}`,blog:`Insights, stories, and ideas from ${e}`,saas:`Powerful tools to grow your business \u2014 ${e}`,government:`Official services and information \u2014 ${e}`,healthcare:`Quality healthcare you can trust \u2014 ${e}`,education:`Learn, grow, and succeed with ${e}`,realestate:`Find your perfect property with ${e}`,landing:`The smarter way to get things done \u2014 ${e}`,generic:`Welcome to ${e} \u2014 your trusted partner`}[t]||`Welcome to ${e}`}async function Ws(e){let t=(await import("jszip")).default,n=new t,o=Mn[e.theme]||Mn.blue,r=Ds(e.siteName,e.websiteType),s=new Date().getFullYear().toString(),i={SITE_NAME:e.siteName,THEME_COLOR:o,TAGLINE:r,YEAR:s},a=h=>cr(h,i).replace(/\{\{SITE_NAME_LOWER\}\}/g,e.siteName.toLowerCase().replace(/\s+/g,""));n.file("package.json",dr(e.siteName)),n.file("next.config.js",ur),n.file("tailwind.config.js",pr(o)),n.file("tsconfig.json",Nr),n.file("README.md",Fr(e.siteName)),n.file("postcss.config.js","module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }"),n.file(".gitignore",`node_modules
.next
.env.local
.DS_Store`),n.file("src/app/globals.css",gr(o)),n.file("src/app/layout.tsx",a(mr)),n.file("src/app/not-found.tsx",Lr),n.file("src/components/Navbar.tsx",a(fr)),n.file("src/components/Navbar.module.css",hr),n.file("src/components/Footer.tsx",a(br)),n.file("src/components/Footer.module.css",yr);for(let h of e.pages)switch(h){case"home":n.file("src/app/page.tsx",a(xr)),n.file("src/app/page.module.css",wr);break;case"about":n.file("src/app/about/page.tsx",a(vr)),n.file("src/app/about/page.module.css",kr);break;case"contact":n.file("src/app/contact/page.tsx",a(Sr)),n.file("src/app/contact/page.module.css",Tr);break;case"services":n.file("src/app/services/page.tsx",a(Ar)),n.file("src/app/services/page.module.css",Cr);break;case"pricing":n.file("src/app/pricing/page.tsx",a(Rr)),n.file("src/app/pricing/page.module.css",Er);break;case"auth":n.file("src/app/auth/page.tsx",a(Ir)),n.file("src/app/auth/page.module.css",$r);break;default:n.file(`src/app/${h}/page.tsx`,Bs(h,e.siteName,o,i,a));break}let l=await n.generateAsync({type:"blob"}),c=URL.createObjectURL(l),d=document.createElement("a");d.href=c,d.download=`${e.siteName.toLowerCase().replace(/\s+/g,"-")}-nextjs.zip`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(c)}function Bs(e,t,n,o,r){let s=e.charAt(0).toUpperCase()+e.slice(1);return`import styles from "./page.module.css"

export default function ${s}Page() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <section style={{
        background: "${n}",
        color: "white",
        padding: "5rem 1rem",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          ${s}
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.85 }}>
          ${t} \u2014 ${s} page
        </p>
      </section>
      <section style={{ padding: "4rem 1rem", maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ color: "#64748b", fontSize: "1rem", textAlign: "center" }}>
          This is the ${s} page. Edit this file to add your content.
        </p>
      </section>
    </div>
  )
}
`}var Gr=st(()=>{"use strict";C();Mr()});var Br={};yt(Br,{getPageText:()=>zr,highlightField:()=>Dr,runAgent:()=>Ys,scanFormFields:()=>Or,scrollToSection:()=>Wr});function Ye(e){try{let t=window.getComputedStyle(e);if(t.display==="none"||t.visibility==="hidden"||t.opacity==="0"||e.hidden)return!1;let n=e.getBoundingClientRect();return!(n.width===0&&n.height===0)}catch{return!0}}function zr(){let e=[],t=new Set,n=i=>{let a=i.trim();a&&a.length>10&&!t.has(a)&&(t.add(a),e.push(a))};document.title&&n(document.title);let o=['meta[name="description"]','meta[name="keywords"]','meta[property="og:title"]','meta[property="og:description"]','meta[name="twitter:title"]','meta[name="twitter:description"]'];for(let i of o){let a=document.querySelector(i)?.getAttribute("content");a&&n(a)}let r=["h1","h2","h3","h4","h5","h6","p","blockquote","q","pre","code","li","dt","dd","th","td","caption","a","b","strong","em","i","u","s","abbr","acronym","cite","dfn","mark","small","sub","sup","ins","del","bdi","bdo","article","section","aside","nav","header","footer","main","summary","details","figcaption","figure","address","time","output","label","legend","option","button","font","center","span","div","[role='heading']","[role='main']","[role='article']","[role='region']","[role='complementary']","[role='contentinfo']","[role='navigation']","[role='banner']","[role='listitem']","[role='cell']","[role='columnheader']","[role='rowheader']"],s=document.querySelectorAll(r.join(","));for(let i of s){if(i.closest("[data-yuktai-panel]")||!Ye(i)||i.querySelector("p, h1, h2, h3, h4, h5, h6, li, td, th, div, article, section, blockquote, pre"))continue;let l=i.innerText?.trim();if(l&&l.length>10&&n(l),!l){let b=i.textContent?.trim();b&&b.length>10&&n(b)}let c=i.getAttribute("aria-label")?.trim();c&&c.length>5&&n(c);let d=i.getAttribute("aria-description")?.trim();d&&d.length>5&&n(d);let h=i.getAttribute("aria-valuetext")?.trim();h&&n(h);let p=i.getAttribute("title")?.trim();p&&p.length>5&&n(p);let m=i.getAttribute("data-label")?.trim();m&&n(m);let g=i.getAttribute("data-title")?.trim();g&&n(g),i.querySelectorAll("img").forEach(b=>{let u=b.getAttribute("alt")?.trim();u&&u.length>5&&n(u);let y=b.getAttribute("title")?.trim();y&&y.length>5&&n(y)})}document.querySelectorAll("img").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Ye(i))return;let a=i.getAttribute("alt")?.trim(),l=i.getAttribute("title")?.trim();a&&a.length>5&&n(a),l&&l.length>5&&n(l)}),document.querySelectorAll("input:not([type=hidden]), textarea").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Ye(i))return;i.placeholder&&n(i.placeholder),i.value&&i.value.length>3&&n(i.value);let a=i.getAttribute("aria-label")?.trim();a&&n(a)}),document.querySelectorAll("select").forEach(i=>{i.closest("[data-yuktai-panel]")||Ye(i)&&Array.from(i.options).forEach(a=>{a.text?.trim().length>3&&n(a.text.trim())})}),document.querySelectorAll("td, th").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Ye(i))return;let a=i.innerText?.trim();a&&a.length>3&&n(a)});try{document.querySelectorAll("iframe").forEach(i=>{try{let a=i.contentDocument;if(!a)return;let l=a.body?.innerText?.trim();l&&l.length>20&&n(l.slice(0,500))}catch{}})}catch{}return document.querySelectorAll("a").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Ye(i))return;let a=i.innerText?.trim();a&&a.length>3&&a.length<100&&n(a)}),e.join(" ").slice(0,5e3)}function js(e){let t=e.getAttribute("aria-label")?.trim();if(t)return t;let n=e.getAttribute("aria-labelledby");if(n){let l=document.getElementById(n);if(l)return l.innerText?.trim()||""}if(e.id){let l=document.querySelector(`label[for="${e.id}"]`);if(l)return l.innerText?.trim()||""}let o=e.closest("label");if(o){let l=o.cloneNode(!0);return l.querySelectorAll("input, select, textarea").forEach(c=>c.remove()),l.innerText?.trim()||""}if((e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&e.placeholder)return e.placeholder;if(e.name)return e.name.replace(/[_-]/g," ");let r=e.previousSibling;if(r?.nodeType===Node.TEXT_NODE){let l=r.textContent?.trim();if(l&&l.length>1)return l}let s=e.previousElementSibling;if(s){let l=s.innerText?.trim();if(l&&l.length>1&&l.length<60)return l}let i=e.closest("td, th");if(i){let l=i.previousElementSibling;if(l){let c=l.innerText?.trim();if(c&&c.length>1)return c}}let a=e.getAttribute("title")?.trim();return a||(e instanceof HTMLInputElement?e.type:"field")}function Or(){let e=[],t=document.querySelectorAll(["input:not([type=hidden])","input:not([type=submit])","input:not([type=button])","input:not([type=reset])","input:not([type=image])","select","textarea","[contenteditable='true']","[role='textbox']","[role='combobox']","[role='spinbutton']","[role='searchbox']","[role='listbox']"].join(", "));for(let n of t){if(n.closest("[data-yuktai-panel]")||!Ye(n))continue;if(n instanceof HTMLInputElement){let r=n.type.toLowerCase();if(["submit","button","reset","image"].includes(r))continue}let o=js(n);e.push({label:o,type:n instanceof HTMLInputElement?n.type:n.tagName.toLowerCase(),placeholder:(n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement)&&n.placeholder||"",required:n.required||n.getAttribute("aria-required")==="true"||n.getAttribute("data-required")==="true",element:n})}return e}function Dr(e,t=3e3){e.scrollIntoView({behavior:"smooth",block:"center"}),e.style.outline="3px solid #0d9488",e.style.outlineOffset="3px";try{e.focus()}catch{}setTimeout(()=>{e.style.outline="",e.style.outlineOffset=""},t)}function Wr(e){let t=e.toLowerCase(),n=document.querySelectorAll("h1, h2, h3, h4, h5, h6, section, article, [id], [aria-label], [role='heading'], [role='region']");for(let o of n){if(o.closest("[data-yuktai-panel]")||!Ye(o))continue;if((o.innerText||o.getAttribute("id")||o.getAttribute("aria-label")||o.getAttribute("name")||"").toLowerCase().includes(t))return o.scrollIntoView({behavior:"smooth",block:"center"}),o.style.outline="2px solid #0d9488",o.style.outlineOffset="4px",setTimeout(()=>{o.style.outline="",o.style.outlineOffset=""},2500),!0}return!1}async function Us(e,t,n){let o=window,r=o.LanguageModel||o.ai?.languageModel;if(!r)throw new Error("Gemini Nano not available");let s=await r.create({systemPrompt:`You are a helpful web accessibility agent.
Create a simple action plan to help a user complete a task on a webpage.
Rules:
- Maximum 5 steps
- Short and clear \u2014 no jargon
- If filling a form \u2014 list each field and what to enter
- No markdown \u2014 no asterisks, no bold, no headers
- Number each step: 1. 2. 3.`}),a=`Page content: ${e}${n?`
The page has form fields the user may need to fill.`:""}

User task: ${t}

Action plan:`,l=await s.prompt(a);return s.destroy(),l?.trim()||""}async function Vs(e,t){let{askPageWithTransformers:n}=await Promise.resolve().then(()=>(vt(),Ln));return(await n(`How do I: ${t}`)).answer||"I could not create a plan for this task."}async function Ys(e,t,n){if(!e.trim())return{success:!1,steps:[],error:"Please tell me what you want to do."};if(!t)return{success:!1,steps:[],error:"No AI engine available on this device."};let o=[],r=(s,i="info")=>{let a={text:s,type:i};o.push(a),n(a)};try{r("\u{1F4D6} Reading page content...","info");let s=zr(),i=Or(),a=i.length>0;s.length<50&&r("\u26A0\uFE0F Page content is very limited. This may be a static image page.","error"),r(a?`\u{1F4CB} Found ${i.length} form field${i.length!==1?"s":""} on this page`:"\u{1F4C4} No form fields found \u2014 this appears to be a content page","info"),r("\u{1F916} Creating action plan...","info");let l="";try{t==="gemini"?l=await Us(s,e,a):l=await Vs(s,e)}catch{l=a?`1. Locate the form on this page
2. Fill each required field
3. Review your answers
4. Submit the form`:`1. Read the page carefully
2. Find the section relevant to your task
3. Follow the on-page instructions`}if(l&&(r("\u2705 Your action plan:","success"),l.split(/\n/).map(c=>c.replace(/\*\*/g,"").replace(/\*/g,"").trim()).filter(c=>c.length>5).slice(0,6).forEach(c=>r(`   ${c}`,"action"))),a){let c=i[0];r(`\u{1F3AF} First field: "${c.label}"${c.required?" \u2605 required":""}`,"field"),Dr(c.element),i.length>1&&r(`\u{1F4DD} All ${i.length} fields: ${i.map(d=>d.label).join(" \u2192 ")}`,"info")}else{let c=e.toLowerCase().split(/\s+/).filter(h=>h.length>3),d=!1;for(let h of c)if(Wr(h)){r(`\u{1F3AF} Scrolled to relevant section: "${h}"`,"action"),d=!0;break}d||r("\u{1F4A1} Scroll through the page to find what you need.","info")}return r("\u2705 Ready. Follow the steps above. Ask me again if you need more help.","success"),{success:!0,steps:o}}catch(s){let i=s instanceof Error?s.message:"Agent error.";return r(`\u26A0\uFE0F ${i}`,"error"),{success:!1,steps:o,error:i}}}var Hr=st(()=>{"use strict";C()});var dl={};yt(dl,{AUDIT_RULES:()=>Pt,AgenticGridBar:()=>el,AgenticPanel:()=>tl,CheckIcon:()=>eo,ChevronLeftIcon:()=>Qn,ChevronRightIcon:()=>Jn,CloseIcon:()=>to,DEFAULT_A11Y_SETTINGS:()=>go,FONT_MAX:()=>vi,FONT_MIN:()=>wi,FONT_STEP:()=>po,IconBase:()=>ye,Runtime:()=>Ke,SearchIcon:()=>Un,SortDownIcon:()=>Yn,SortUpIcon:()=>Vn,YuktAI:()=>cl,YuktAIWrapper:()=>Qt,YuktaiGrid:()=>ti,YuktaiGridAI:()=>Jt,YuktaiGridAgent:()=>Zr,YuktaiGridWebMCP:()=>Et,accessibleName:()=>Le,addPeriods:()=>cn,aggregate:()=>ft,aiPlugin:()=>St,analyzePage:()=>mi,answerGridQuestion:()=>uo,applyGridFilters:()=>_e,askAboutPage:()=>so,askInsight:()=>xo,auditToJSON:()=>ro,auditToMarkdown:()=>oo,clearFilters:()=>Hn,clearSort:()=>qn,comparePeriods:()=>Li,contrastRatio:()=>tn,countGrid:()=>On,createA11yCopilot:()=>io,createContextIndex:()=>fo,createGridTools:()=>mt,createVoiceA11yController:()=>mo,default:()=>Qt,detectAnomalies:()=>sn,detectPageIntent:()=>fi,executeGridQuery:()=>je,filterGrid:()=>Bn,findMentionedColumn:()=>Ne,getColumns:()=>Dn,getRow:()=>Wn,getRowId:()=>me,gridPassages:()=>Ai,groupBy:()=>$i,highlightRows:()=>gt,moveGridRowFocus:()=>Si,openRow:()=>Ct,pagePassages:()=>Ti,parseAmount:()=>rn,parseColor:()=>Ft,parseGridIntent:()=>jn,parseGridQuery:()=>nt,parseVoiceA11yCommand:()=>ki,planTasks:()=>ln,readFormFields:()=>pi,relativeLuminance:()=>en,reviewDesign:()=>wo,reviewForm:()=>gi,reviewForms:()=>Gt,runGridQuery:()=>xi,runQaAudit:()=>qe,runTasks:()=>ho,searchGrid:()=>zn,selectRow:()=>At,sortGrid:()=>_n,startOfPeriod:()=>yo,summarizeRows:()=>an,toGridToolColumns:()=>Qe,tokenize:()=>zt,trend:()=>Ni,useAgenticGrid:()=>Za,useGrid:()=>ai,useYuktaiGridAgent:()=>Rt,voicePlugin:()=>Tt,wcag:()=>we,wcagPlugin:()=>we});module.exports=ji(dl);C();C();C();function No(){let e=window;return e.Rewriter||e.ai?.rewriter||null}async function bn(){try{let e=No();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability();return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}async function Ui(e){if(!e||e.trim().length<20)return{success:!1,original:e,rewritten:e,error:"Text too short"};try{let t=No();if(!t)throw new Error("Rewriter API not available");let n=await t.create({tone:"more-casual",format:"plain-text",length:"as-is",outputLanguage:"en"}),o=await n.rewrite(e,{context:"Rewrite this text in simple plain English. Use short sentences. Avoid jargon. Make it easy to understand for everyone."});return n.destroy(),{success:!0,original:e,rewritten:o.trim()}}catch(t){return{success:!1,original:e,rewritten:e,error:t instanceof Error?t.message:"Rewrite failed"}}}async function Fo(){if(!await bn())return{fixed:0,error:"Chrome Built-in AI Rewriter not available. Enable via chrome://flags."};let t=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption"),n=0;for(let o of t){let r=o.innerText?.trim();if(!r||r.length<20||o.closest("[data-yuktai-panel]"))continue;let s=await Ui(r);s.success&&s.rewritten!==r&&(o.dataset.yuktaiOriginal=r,o.innerText=s.rewritten,n++)}return{fixed:n}}function Mo(){let e=document.querySelectorAll("[data-yuktai-original]");for(let t of e){let n=t.dataset.yuktaiOriginal;n&&(t.innerText=n,delete t.dataset.yuktaiOriginal)}}C();var Po="yuktai-summary-box";function Go(){let e=window;return e.Summarizer||e.ai?.summarizer||null}async function yn(){try{let e=Go();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability();return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}function Vi(){let e=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, article, section"),t=[];for(let n of e){if(n.closest("[data-yuktai-panel]"))continue;let o=window.getComputedStyle(n);if(o.display==="none"||o.visibility==="hidden")continue;let r=n.innerText?.trim();r&&r.length>10&&t.push(r)}return t.join(" ").slice(0,5e3)}async function zo(){if(!await yn())return{success:!1,summary:"",error:"Chrome Built-in AI Summarizer not available. Enable via chrome://flags."};let t=Vi();if(!t||t.length<100)return{success:!1,summary:"",error:"Not enough text on this page to summarise."};try{let n=Go();if(!n)throw new Error("Summarizer API not available");let o=await n.create({type:"tl;dr",format:"plain-text",length:"short",outputLanguage:"en"}),r=await o.summarize(t,{context:"Summarise this page in 2-3 simple sentences for a screen reader user who wants to know if this page is relevant to them."});return o.destroy(),Yi(r.trim()),{success:!0,summary:r.trim()}}catch(n){return{success:!1,summary:"",error:n instanceof Error?n.message:"Summary failed"}}}function Yi(e){Ht();let t=document.createElement("div");t.id=Po,t.setAttribute("data-yuktai-panel","true"),t.setAttribute("role","region"),t.setAttribute("aria-label","Page summary by yuktai"),t.style.cssText=`
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
  `;let n=document.createElement("p");n.style.cssText="margin: 0; flex: 1;",n.textContent=`\u{1F4CB} Page summary: ${e}`;let o=document.createElement("button");o.textContent="\xD7",o.setAttribute("aria-label","Close page summary"),o.style.cssText=`
    background: none; border: none; color: #ffffff;
    font-size: 20px; cursor: pointer; padding: 0 4px;
    line-height: 1; flex-shrink: 0;
  `,o.addEventListener("click",Ht),t.appendChild(n),t.appendChild(o),document.body.prepend(t)}function Ht(){let e=document.getElementById(Po);e&&e.remove()}C();var qt=[{code:"en",label:"English"},{code:"hi",label:"Hindi"},{code:"es",label:"Spanish"},{code:"fr",label:"French"},{code:"de",label:"German"},{code:"it",label:"Italian"},{code:"pt",label:"Portuguese"},{code:"nl",label:"Dutch"},{code:"pl",label:"Polish"},{code:"ru",label:"Russian"},{code:"ja",label:"Japanese"},{code:"ko",label:"Korean"},{code:"zh",label:"Chinese"},{code:"ar",label:"Arabic"},{code:"tr",label:"Turkish"},{code:"vi",label:"Vietnamese"},{code:"bn",label:"Bengali"},{code:"id",label:"Indonesian"}],_t="en";function Ki(){let e=window;return e.Translator||e.translation||null}async function Qi(e){try{let t=window;if(!Ki())return!1;if(t.Translator&&typeof t.Translator.availability=="function")try{let o=await t.Translator.availability({sourceLanguage:"en",targetLanguage:e});return o==="readily"||o==="available"||o==="downloadable"||o==="after-download"}catch{}return t.Translator&&typeof t.Translator.canTranslate=="function"?await t.Translator.canTranslate({sourceLanguage:"en",targetLanguage:e})!=="no":t.translation&&typeof t.translation.canTranslate=="function"?await t.translation.canTranslate({sourceLanguage:"en",targetLanguage:e})!=="no":!1}catch{return!1}}async function Xi(e){let t=window,n={sourceLanguage:"en",targetLanguage:e};if(t.Translator&&typeof t.Translator.create=="function")return await t.Translator.create(n);if(t.translation&&typeof t.translation.createTranslator=="function")return await t.translation.createTranslator(n);throw new Error("Translation API not available")}async function Oo(e){if(e===_t)return{success:!0,language:e,fixed:0};if(e==="en")return xn(),_t="en",{success:!0,language:"en",fixed:0};if(!await Qi(e))return{success:!1,language:e,fixed:0,error:`Translation to ${e} not available. Enable via chrome://flags.`};try{let n=await Xi(e),o=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption, span, a"),r=0;for(let s of o){if(s.closest("[data-yuktai-panel]")||s.children.length>0)continue;let i=s.innerText?.trim();if(!i||i.length<2)continue;s.dataset.yuktaiTranslationOriginal||(s.dataset.yuktaiTranslationOriginal=i);let a=await n.translate(i);a&&a!==i&&(s.innerText=a,r++)}return typeof n.destroy=="function"&&n.destroy(),_t=e,{success:!0,language:e,fixed:r}}catch(n){return{success:!1,language:e,fixed:0,error:n instanceof Error?n.message:"Translation failed"}}}function xn(){let e=document.querySelectorAll("[data-yuktai-translation-original]");for(let t of e){let n=t.dataset.yuktaiTranslationOriginal;n&&(t.innerText=n,delete t.dataset.yuktaiTranslationOriginal)}_t="en"}C();var Ji=[{phrases:["go to main","skip to main","main content"],action:"focus-main",label:"Jump to main content"},{phrases:["go to navigation","go to nav","open menu"],action:"focus-nav",label:"Jump to navigation"},{phrases:["go to search","search","find"],action:"focus-search",label:"Jump to search"},{phrases:["scroll down","page down","next"],action:"scroll-down",label:"Scroll down"},{phrases:["scroll up","page up","back up"],action:"scroll-up",label:"Scroll up"},{phrases:["go back","previous page"],action:"go-back",label:"Go back"},{phrases:["click","press","select"],action:"click-focused",label:"Click focused element"},{phrases:["next item","tab forward","tab"],action:"tab-forward",label:"Move to next element"},{phrases:["previous item","tab back","shift tab"],action:"tab-back",label:"Move to previous element"},{phrases:["stop listening","stop voice","quiet"],action:"stop-voice",label:"Stop voice control"}],Ie=null,jt=!1,at=null;function wn(){return!!(window.SpeechRecognition||window.webkitSpeechRecognition)}function Zi(e){let t=e.toLowerCase().trim();for(let n of Ji)for(let o of n.phrases)if(t.includes(o))return{action:n.action,label:n.label};return null}function es(e){switch(e){case"focus-main":{let t=document.querySelector("main, [role='main'], #main");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"focus-nav":{let t=document.querySelector("nav, [role='navigation']");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"focus-search":{let t=document.querySelector("input[type='search'], input[role='searchbox'], [aria-label*='search' i]");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"scroll-down":{window.scrollBy({top:400,behavior:"smooth"});break}case"scroll-up":{window.scrollBy({top:-400,behavior:"smooth"});break}case"go-back":{window.history.back();break}case"click-focused":{let t=document.activeElement;t&&t!==document.body&&t.click();break}case"tab-forward":{let t=Do(),n=t.indexOf(document.activeElement),o=t[n+1]||t[0];o&&o.focus();break}case"tab-back":{let t=Do(),n=t.indexOf(document.activeElement),o=t[n-1]||t[t.length-1];o&&o.focus();break}case"stop-voice":{vn();break}}}function Do(){return Array.from(document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(e=>!e.closest("[data-yuktai-panel]"))}function Wo(e){if(!wn())return!1;if(jt)return!0;e&&(at=e);let t=window.SpeechRecognition||window.webkitSpeechRecognition;return Ie=new t,Ie.continuous=!0,Ie.interimResults=!1,Ie.lang="en-US",Ie.onresult=n=>{let o=n.results[n.results.length-1][0].transcript,r=Zi(o);if(r){es(r.action);let s={success:!0,command:o,action:r.label};if(at&&at(s),r.action==="stop-voice")return}},Ie.onend=()=>{jt&&Ie?.start()},Ie.onerror=n=>{n.error!=="no-speech"&&at&&at({success:!1,command:"",action:"",error:`Voice error: ${n.error}`})},Ie.start(),jt=!0,ts(),!0}function vn(){jt=!1,Ie&&(Ie.stop(),Ie=null),at=null,Ho()}var Bo="yuktai-voice-indicator";function ts(){Ho();let e=document.createElement("div");e.id=Bo,e.setAttribute("data-yuktai-panel","true"),e.setAttribute("aria-live","polite"),e.setAttribute("aria-label","yuktai voice control is listening"),e.style.cssText=`
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
  `,!document.getElementById("yuktai-pulse-style")){let o=document.createElement("style");o.id="yuktai-pulse-style",o.textContent=`
      @keyframes yuktai-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.4; transform: scale(0.7); }
      }
    `,document.head.appendChild(o)}let n=document.createElement("span");n.textContent="Listening for commands...",e.appendChild(t),e.appendChild(n),document.body.appendChild(e)}function Ho(){let e=document.getElementById(Bo);e&&e.remove()}C();var ns=["button:not([aria-label]):not([aria-labelledby])","a:not([aria-label]):not([aria-labelledby])","input:not([aria-label]):not([aria-labelledby]):not([id])","select:not([aria-label]):not([aria-labelledby])","textarea:not([aria-label]):not([aria-labelledby])","[role='button']:not([aria-label])","[role='link']:not([aria-label])","[role='checkbox']:not([aria-label])","[role='tab']:not([aria-label])"].join(", ");function _o(){let e=window;return e.Writer||e.ai?.writer||null}async function kn(){try{let e=_o();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability();return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}function os(e){let t=[],n=e.innerText?.trim();n&&t.push(`element text: "${n}"`);let o=e.placeholder?.trim();o&&t.push(`placeholder: "${o}"`);let r=e.getAttribute("name")?.trim();r&&t.push(`name: "${r}"`);let s=e.getAttribute("type")?.trim();s&&t.push(`type: "${s}"`);let i=e.id;if(i){let c=document.querySelector(`label[for="${i}"]`);c&&t.push(`label: "${c.innerText?.trim()}"`)}let a=e.parentElement?.innerText?.trim().slice(0,60);a&&t.push(`parent context: "${a}"`),t.push(`tag: ${e.tagName.toLowerCase()}`);let l=e.getAttribute("role");return l&&t.push(`role: ${l}`),t.join(". ")}async function rs(e,t){let n=`
    Generate a short, clear aria-label for an HTML element.
    The label must be 2-6 words maximum.
    The label must describe what the element does or what it is.
    Do not include punctuation.
    Do not explain \u2014 just output the label text only.

    Element details:
    ${t}

    Output only the label. Nothing else.
  `.trim();return(await e.write(n)).trim().replace(/^["']|["']$/g,"").replace(/\.$/,"").trim()}async function qo(){if(!await kn())return{success:!1,fixed:0,elements:[],error:"Chrome Built-in AI Writer not available. Enable via chrome://flags."};let t=document.querySelectorAll(ns);if(t.length===0)return{success:!0,fixed:0,elements:[]};try{let n=_o();if(!n)throw new Error("Writer API not available");let o=await n.create({tone:"neutral",format:"plain-text",length:"short",outputLanguage:"en"}),r=0,s=[];for(let i of t){if(i.closest("[data-yuktai-panel]"))continue;let a=window.getComputedStyle(i);if(a.display==="none"||a.visibility==="hidden")continue;let l=os(i),c=await rs(o,l);c&&c.length>0&&(i.dataset.yuktaiLabelOriginal=i.getAttribute("aria-label")||"",i.setAttribute("aria-label",c),r++,s.push({tag:i.tagName.toLowerCase(),label:c}))}return o.destroy(),{success:!0,fixed:r,elements:s}}catch(n){return{success:!1,fixed:0,elements:[],error:n instanceof Error?n.message:"Label generation failed"}}}function jo(){let e=document.querySelectorAll("[data-yuktai-label-original]");for(let t of e){let n=t.dataset.yuktaiLabelOriginal;n?t.setAttribute("aria-label",n):t.removeAttribute("aria-label"),delete t.dataset.yuktaiLabelOriginal}}var Yt=null,Uo=null;var Vo=null,Sn=null,de=null,lt=null,Ut=null,Tn=null,ct=null,Vt={deuteranopia:"yuktai-cb-d",protanopia:"yuktai-cb-p",tritanopia:"yuktai-cb-t"};var Yo=new Set(["input","select","textarea"]);var An={nav:"navigation",header:"banner",footer:"contentinfo",main:"main",aside:"complementary"};function Cn(e,t="polite"){if(typeof window>"u"||!ct?.speechEnabled||!window.speechSynthesis)return;window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.rate=1,n.pitch=1,n.volume=1;let o=window.speechSynthesis.getVoices();o.length>0&&(n.voice=o[0]),window.speechSynthesis.speak(n)}function tr(e,t="info"){if(typeof document>"u")return;let o={success:{bg:"#0f9d58",border:"#0a7a44",icon:"\u2713"},error:{bg:"#d93025",border:"#b52a1c",icon:"\u2715"},warning:{bg:"#f29900",border:"#c67c00",icon:"\u26A0"},info:{bg:"#1a73e8",border:"#1557b0",icon:"\u2139"}}[t];de||(de=document.createElement("div"),de.setAttribute("role","alert"),de.setAttribute("aria-live","assertive"),de.setAttribute("aria-atomic","true"),de.style.cssText=`
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
    `,document.body.appendChild(de)),de.style.background=o.bg,de.style.border=`1px solid ${o.border}`,de.style.color="#fff",de.innerHTML=`
    <span style="font-size:18px;font-weight:700">${o.icon}</span>
    <span style="flex:1;line-height:1.4">${e}</span>
    <button
      onclick="this.parentElement.style.transform='translateX(120%)';this.parentElement.style.opacity='0'"
      style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;padding:0;line-height:1"
      aria-label="Close notification">\xD7</button>
  `,window.innerWidth<=480&&(de.style.right="8px",de.style.left="8px",de.style.maxWidth="none",de.style.width="auto"),requestAnimationFrame(()=>{de&&(de.style.transform="translateX(0)",de.style.opacity="1")}),setTimeout(()=>{de&&(de.style.transform="translateX(120%)",de.style.opacity="0")},5e3)}function oe(e,t="info",n=!0){Yt&&(Yt.textContent=e),tr(e,t),n&&Cn(e,t==="error"?"assertive":"polite")}function is(){if(typeof document>"u"||Vo)return;let e=[{label:"Skip to main content",selector:"main,[role='main'],#main,#main-content"},{label:"Skip to navigation",selector:"nav,[role='navigation'],#nav,#navigation"},{label:"Skip to search",selector:"[role='search'],#search,input[type='search']"}],t=document.createElement("div");t.setAttribute("data-yuktai-skip-bar","true"),t.setAttribute("role","navigation"),t.setAttribute("aria-label","Skip links"),t.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    background: #111;
    transform: translateY(-100%);
    transition: transform 0.2s ease;
    font-family: system-ui, sans-serif;
  `;let n=!1;if(e.forEach(({label:r,selector:s})=>{let i=document.querySelector(s);if(!i)return;n=!0,i.getAttribute("tabindex")||i.setAttribute("tabindex","-1");let a=document.createElement("a");a.href="#",a.textContent=r,a.style.cssText=`
      color: #fff;
      background: #1a73e8;
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      border: 2px solid transparent;
      transition: background 0.15s, border-color 0.15s;
    `,a.addEventListener("focus",()=>{t.style.transform="translateY(0)"}),a.addEventListener("blur",()=>{setTimeout(()=>{t.matches(":focus-within")||(t.style.transform="translateY(-100%)")},2e3)}),a.addEventListener("click",l=>{l.preventDefault(),i.focus(),i.scrollIntoView({behavior:"smooth",block:"start"}),oe(`Jumped to ${r.replace("Skip to ","")}`,"info"),t.style.transform="translateY(-100%)"}),t.appendChild(a)}),!n)return;window.innerWidth<768&&(t.style.transform="translateY(0)",t.style.position="sticky"),window.addEventListener("resize",()=>{window.innerWidth<768&&(t.style.transform="translateY(0)")}),document.body.insertBefore(t,document.body.firstChild),Vo=t}function ss(){if(typeof document>"u"||document.querySelector("[data-yuktai-focus-style]"))return;let e=document.createElement("style");e.setAttribute("data-yuktai-focus-style","true"),e.textContent=`

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
  `,document.head.appendChild(e),document.documentElement.setAttribute("data-yuktai-a11y","true")}function as(){typeof document>"u"||document.querySelector("[data-yuktai-kb-init]")||(document.documentElement.setAttribute("data-yuktai-kb-init","true"),document.addEventListener("keydown",e=>{let t=document.activeElement;if(!t)return;let n=t.getAttribute("role")||"";if(e.key==="Escape"){let o=t.closest("[role='dialog'],[role='alertdialog']");if(o){o.style.display="none",oe("Dialog closed","info");return}let r=t.closest("[role='menu'],[role='menubar']");r&&(r.style.display="none",oe("Menu closed","info"))}if(n==="menuitem"||t.closest("[role='menu'],[role='menubar']")){let o=t.closest("[role='menu'],[role='menubar']");if(!o)return;let r=Array.from(o.querySelectorAll("[role='menuitem']:not([disabled])")),s=r.indexOf(t);e.key==="ArrowDown"||e.key==="ArrowRight"?(e.preventDefault(),r[(s+1)%r.length]?.focus()):e.key==="ArrowUp"||e.key==="ArrowLeft"?(e.preventDefault(),r[(s-1+r.length)%r.length]?.focus()):e.key==="Home"?(e.preventDefault(),r[0]?.focus()):e.key==="End"&&(e.preventDefault(),r[r.length-1]?.focus())}if(n==="tab"||t.closest("[role='tablist']")){let o=t.closest("[role='tablist']");if(!o)return;let r=Array.from(o.querySelectorAll("[role='tab']:not([disabled])")),s=r.indexOf(t);if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();let i=r[(s+1)%r.length];i?.focus(),i?.click()}else if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();let i=r[(s-1+r.length)%r.length];i?.focus(),i?.click()}}if(n==="option"||t.closest("[role='listbox']")){let o=t.closest("[role='listbox']");if(!o)return;let r=Array.from(o.querySelectorAll("[role='option']:not([aria-disabled='true'])")),s=r.indexOf(t);e.key==="ArrowDown"?(e.preventDefault(),r[(s+1)%r.length]?.focus()):e.key==="ArrowUp"?(e.preventDefault(),r[(s-1+r.length)%r.length]?.focus()):(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),t.setAttribute("aria-selected","true"),r.forEach(i=>{i!==t&&i.setAttribute("aria-selected","false")}),oe(`Selected: ${t.textContent?.trim()}`,"success"))}e.altKey&&e.key==="a"&&(e.preventDefault(),ls()),e.key==="Tab"&&ct?.speechEnabled&&setTimeout(()=>{let o=document.activeElement;if(!o)return;let r=o.getAttribute("aria-label")||o.getAttribute("title")||o.textContent?.trim()||o.tagName.toLowerCase(),s=o.getAttribute("role")||o.tagName.toLowerCase();Cn(`${r}, ${s}`)},100)}))}function Kt(e){let t=e.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[role="button"]');if(t.length===0)return;let n=t[0],o=t[t.length-1];n.focus(),e.addEventListener("keydown",r=>{r.key==="Tab"&&(r.shiftKey?document.activeElement===n&&(r.preventDefault(),o.focus()):document.activeElement===o&&(r.preventDefault(),n.focus()))})}function ls(){if(typeof document>"u")return;if(lt){lt.remove(),lt=null;return}let e=document.createElement("div");e.setAttribute("role","dialog"),e.setAttribute("aria-label","Keyboard shortcuts"),e.setAttribute("aria-modal","true"),e.setAttribute("data-yuktai-cheatsheet","true"),e.style.cssText=`
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
    ${t.map(([o,r])=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a4a">
        <kbd style="background:#2a2a4a;color:#74c0fc;padding:3px 8px;border-radius:4px;font-size:12px;font-family:monospace;border:1px solid #3a3a6a">${o}</kbd>
        <span style="font-size:12px;color:#ccc;text-align:right;flex:1;margin-left:12px">${r}</span>
      </div>
    `).join("")}
  `,e.querySelector("[data-yuktai-close]")?.addEventListener("click",()=>{e.remove(),lt=null}),e.addEventListener("keydown",o=>{o.key==="Escape"&&(e.remove(),lt=null)}),document.body.appendChild(e),lt=e,Kt(e),oe("Keyboard shortcuts opened. Press Escape to close.","info")}function cs(e){if(typeof document>"u"||!ct?.showAuditBadge||typeof window<"u"&&!window.location.hostname.includes("localhost")&&!window.location.hostname.includes("127.0.0.1"))return;Sn&&Sn.remove();let t=e.score,n=t>=90?"#0f9d58":t>=70?"#f29900":"#d93025",o=t>=90?"\u267F":t>=70?"\u26A0":"\u2715",r=document.createElement("button");r.setAttribute("aria-label",`Accessibility score: ${t} out of 100`),r.setAttribute("data-yuktai-badge","true"),r.style.cssText=`
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
  `,r.innerHTML=`${o} ${t}/100 <span style="font-weight:400;opacity:0.85">${e.details.length} issues</span>`,r.addEventListener("click",()=>ds(e)),document.body.appendChild(r),Sn=r}function ds(e){let t=document.querySelector("[data-yuktai-audit-details]");if(t){t.remove();return}let n=document.createElement("div");n.setAttribute("data-yuktai-audit-details","true"),n.setAttribute("role","dialog"),n.setAttribute("aria-label","Accessibility audit details"),n.style.cssText=`
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
  `;let o={critical:"#d93025",serious:"#f29900",moderate:"#1a73e8",minor:"#0f9d58"};n.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <strong style="font-size:14px;color:#74c0fc">Audit report</strong>
      <span style="color:#aaa">${e.fixed} fixed \xB7 ${e.renderTime}ms</span>
    </div>
    ${e.details.slice(0,20).map(r=>`
      <div style="padding:6px 0;border-bottom:1px solid #2a2a4a">
        <div style="display:flex;gap:6px;align-items:center">
          <span style="background:${o[r.severity]};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase">${r.severity}</span>
          <code style="color:#74c0fc">&lt;${r.tag}&gt;</code>
        </div>
        <div style="color:#ccc;margin-top:3px">${r.fix}</div>
      </div>
    `).join("")}
    ${e.details.length>20?`<div style="color:#888;padding:8px 0;text-align:center">+${e.details.length-20} more issues</div>`:""}
  `,n.addEventListener("keydown",r=>{r.key==="Escape"&&n.remove()}),document.body.appendChild(n),Kt(n)}function nr(e){typeof document>"u"||(Tn&&clearTimeout(Tn),Tn=setTimeout(()=>{if(Ut)return;let t=document.createElement("div");t.setAttribute("role","alertdialog"),t.setAttribute("aria-label","Session timeout warning"),t.setAttribute("aria-modal","true"),t.setAttribute("data-yuktai-timeout","true"),t.style.cssText=`
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
    `;let n=t.querySelector("[data-yuktai-extend]"),o=t.querySelector("[data-yuktai-dismiss]");n?.addEventListener("click",()=>{t.remove(),Ut=null,oe("Session extended. You have more time.","success"),ct?.timeoutWarning&&nr(ct.timeoutWarning)}),o?.addEventListener("click",()=>{t.remove(),Ut=null}),document.body.appendChild(t),Ut=t,Kt(t),oe("Warning: Your session will expire soon. Do you need more time?","warning")},e*1e3))}function us(e){if(typeof document>"u")return;let t=document.documentElement;if(t.toggleAttribute("data-yuktai-high-contrast",!!e.highContrast),t.toggleAttribute("data-yuktai-dark",!!e.darkMode),t.toggleAttribute("data-yuktai-reduce-motion",!!e.reduceMotion),t.toggleAttribute("data-yuktai-large-targets",!!e.largeTargets),t.toggleAttribute("data-yuktai-keyboard",!!e.keyboardHints),t.toggleAttribute("data-yuktai-dyslexia",!!e.dyslexiaFont),e.localFont?document.body.style.fontFamily=`"${e.localFont}", system-ui, sans-serif`:e.dyslexiaFont||(document.body.style.fontFamily=""),e.fontSizeMultiplier&&e.fontSizeMultiplier!==1?document.documentElement.style.fontSize=`${e.fontSizeMultiplier*100}%`:document.documentElement.style.fontSize="",e.colorBlindMode&&e.colorBlindMode!=="none"){let n=e.colorBlindMode==="achromatopsia"?"grayscale(100%)":`url(#${Vt[e.colorBlindMode]})`;document.body.style.filter=n}else document.body.style.filter=""}function ps(e){try{let t=localStorage.getItem("yuktai-a11y-prefs");t&&Object.assign(e,JSON.parse(t))}catch{}}async function Ko(e){if(e){if(!await bn()){oe("Plain English requires Chrome 127+","warning");return}oe("Rewriting page in plain English...","info",!1);let n=await Fo();oe(n.error?`Plain English failed: ${n.error}`:`${n.fixed} sections rewritten in plain English`,n.error?"error":"success",!1)}else Mo(),oe("Original text restored","info",!1)}async function Qo(e){if(e){if(!await yn()){oe("Page summariser requires Chrome 127+","warning");return}oe("Generating page summary...","info",!1);let n=await zo();oe(n.error?`Summary failed: ${n.error}`:"Page summary added at top",n.error?"error":"success",!1)}else Ht(),oe("Page summary removed","info",!1)}async function Xo(e){if(e==="en"){xn(),oe("Page restored to English","info",!1);return}oe(`Translating page to ${e}...`,"info",!1);let t=await Oo(e);oe(t.error?`Translation failed: ${t.error}`:`Page translated to ${e}`,t.error?"error":"success",!1)}async function Jo(e){if(e){if(!wn()){oe("Voice control not supported in this browser","warning");return}Wo(t=>{t.success&&oe(`Voice: ${t.action}`,"info",!1)}),oe("Voice control started. Say a command.","success",!1)}else vn(),oe("Voice control stopped","info",!1)}async function Zo(e){if(e){if(!await kn()){oe("Smart labels requires Chrome 127+","warning");return}oe("Generating smart labels...","info",!1);let n=await qo();oe(n.error?`Smart labels failed: ${n.error}`:`${n.fixed} elements labelled`,n.error?"error":"success",!1)}else jo(),oe("Smart labels removed","info",!1)}function gs(){if(typeof document>"u"||Yt)return;let e=document.createElement("div");e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true"),e.setAttribute("aria-relevant","text"),e.style.cssText="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);",document.body.appendChild(e),Yt=e}function ms(){if(typeof document>"u"||Uo)return;let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("aria-hidden","true"),e.style.cssText="position:absolute;width:0;height:0;overflow:hidden;",e.innerHTML=`
    <defs>
      <filter id="${Vt.deuteranopia}">
        <feColorMatrix type="matrix"
          values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${Vt.protanopia}">
        <feColorMatrix type="matrix"
          values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${Vt.tritanopia}">
        <feColorMatrix type="matrix"
          values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
      </filter>
    </defs>
  `,document.body.appendChild(e),Uo=e}function er(e){let t={critical:20,serious:10,moderate:5,minor:2},n=e.details.reduce((o,r)=>o+(t[r.severity]||0),0);return Math.max(0,Math.min(100,100-n))}var we={name:"yuktai-a11y",version:"4.0.0",observer:null,async execute(e){if(!e.enabled)return this.stopObserver(),"yuktai: disabled.";ct=e,ps(e),gs(),ms(),ss(),as(),e.showSkipLinks!==!1&&is(),e.showPreferencePanel,us(e);let t=this.applyFixes(e);t.score=er(t),e.showAuditBadge&&cs(t),e.timeoutWarning&&nr(e.timeoutWarning),e.autoFix&&this.startObserver(e),e.plainEnglish&&await Ko(!0),e.summarisePage&&await Qo(!0),e.translateLanguage&&e.translateLanguage!=="en"&&await Xo(e.translateLanguage),e.voiceControl&&await Jo(!0),e.smartLabels&&await Zo(!0);let n=`${t.fixed} fixes applied. Score: ${t.score}/100.`;return oe(n,t.score>=90?"success":"info",!1),`yuktai v4.0.0: ${n} Scanned ${t.scanned} elements in ${t.renderTime}ms.`},applyFixes(e){let t={fixed:0,scanned:0,renderTime:0,score:100,details:[]};if(typeof document>"u")return t;let n=performance.now(),o=document.querySelectorAll("*");t.scanned=o.length;let r=(s,i,a,l)=>{t.details.push({tag:s,fix:i,severity:a,element:l.outerHTML.slice(0,100)}),t.fixed++};return o.forEach(s=>{let i=s,a=i.tagName.toLowerCase();if(a==="html"&&!i.getAttribute("lang")&&(i.setAttribute("lang","en"),r(a,'lang="en" added',"critical",i)),a==="meta"){let c=i.getAttribute("name"),d=i.getAttribute("content")||"";c==="viewport"&&d.includes("user-scalable=no")&&(i.setAttribute("content",d.replace("user-scalable=no","user-scalable=yes")),r(a,"user-scalable=yes restored","serious",i)),c==="viewport"&&/maximum-scale=1(?:[^0-9]|$)/.test(d)&&(i.setAttribute("content",d.replace(/maximum-scale=1(?=[^0-9]|$)/,"maximum-scale=5")),r(a,"maximum-scale=5 restored","serious",i))}if(a==="main"&&!i.getAttribute("tabindex")&&(i.setAttribute("tabindex","-1"),i.getAttribute("id")||i.setAttribute("id","main-content")),a==="img"&&(i.hasAttribute("alt")||(i.setAttribute("alt",""),i.setAttribute("aria-hidden","true"),r(a,'alt="" aria-hidden="true"',"serious",i))),a==="svg"&&(!i.getAttribute("aria-hidden")&&!i.getAttribute("aria-label")&&!s.querySelector("title")&&(i.setAttribute("aria-hidden","true"),r(a,'aria-hidden="true" (decorative svg)',"minor",i)),i.getAttribute("focusable")||i.setAttribute("focusable","false")),a==="iframe"&&!i.getAttribute("title")&&!i.getAttribute("aria-label")&&(i.setAttribute("title","embedded content"),i.setAttribute("aria-label","embedded content"),r(a,"title + aria-label added","serious",i)),a==="button"){if(!i.innerText?.trim()&&!i.getAttribute("aria-label")){let c=i.getAttribute("title")||"button";i.setAttribute("aria-label",c),r(a,`aria-label="${c}" (empty button)`,"critical",i)}i.hasAttribute("disabled")&&!i.getAttribute("aria-disabled")&&(i.setAttribute("aria-disabled","true"),t.fixed++)}if(a==="a"){let c=i;!i.innerText?.trim()&&!i.getAttribute("aria-label")&&(i.setAttribute("aria-label",i.getAttribute("title")||"link"),r(a,"aria-label added (empty link)","critical",i)),c.target==="_blank"&&!c.rel?.includes("noopener")&&(c.rel="noopener noreferrer",t.fixed++)}if(Yo.has(a)){let c=i;if(!i.getAttribute("aria-label")&&!i.getAttribute("aria-labelledby")){let d=i.getAttribute("placeholder")||i.getAttribute("name")||a;i.setAttribute("aria-label",d),r(a,`aria-label="${d}"`,"serious",i)}if(i.hasAttribute("required")&&!i.getAttribute("aria-required")&&(i.setAttribute("aria-required","true"),t.fixed++),a==="input"&&!c.autocomplete){let d=c.name||"";c.type==="email"||d.includes("email")?c.autocomplete="email":c.type==="tel"||d.includes("tel")?c.autocomplete="tel":c.type==="password"&&(c.autocomplete="current-password"),t.fixed++}}a==="th"&&!i.getAttribute("scope")&&(i.setAttribute("scope",i.closest("thead")?"col":"row"),r(a,"scope added to <th>","moderate",i)),An[a]&&!i.getAttribute("role")&&(i.setAttribute("role",An[a]),r(a,`role="${An[a]}"`,"minor",i));let l=i.getAttribute("role")||"";l==="tab"&&!i.getAttribute("aria-selected")&&(i.setAttribute("aria-selected","false"),t.fixed++),["alert","status","log"].includes(l)&&!i.getAttribute("aria-live")&&(i.setAttribute("aria-live",l==="alert"?"assertive":"polite"),r(a,`aria-live added on role=${l}`,"moderate",i)),l==="combobox"&&!i.getAttribute("aria-expanded")&&(i.setAttribute("aria-expanded","false"),r(a,'aria-expanded="false" on combobox',"serious",i)),(l==="checkbox"||l==="radio")&&!i.getAttribute("aria-checked")&&(i.setAttribute("aria-checked","false"),r(a,`aria-checked="false" on role=${l}`,"serious",i))}),t.renderTime=parseFloat((performance.now()-n).toFixed(2)),t},scan(){let e={fixed:0,scanned:0,renderTime:0,score:100,details:[]};if(typeof document>"u")return e;let t=performance.now(),n=document.querySelectorAll("*");e.scanned=n.length;let o=(r,s,i,a)=>e.details.push({tag:r,fix:s,severity:i,element:a.outerHTML.slice(0,100)});return n.forEach(r=>{let s=r,i=s.tagName.toLowerCase();(i==="a"||i==="button")&&!s.innerText?.trim()&&!s.getAttribute("aria-label")&&o(i,"needs aria-label (empty)","critical",s),i==="img"&&!s.hasAttribute("alt")&&o(i,"needs alt text","serious",s),Yo.has(i)&&!s.getAttribute("aria-label")&&!s.getAttribute("aria-labelledby")&&o(i,"needs aria-label","serious",s),i==="iframe"&&!s.getAttribute("title")&&!s.getAttribute("aria-label")&&o(i,"iframe needs title","serious",s)}),e.fixed=e.details.length,e.score=er(e),e.renderTime=parseFloat((performance.now()-t).toFixed(2)),e},startObserver(e){this.observer||typeof document>"u"||(this.observer=new MutationObserver(()=>this.applyFixes(e)),this.observer.observe(document.body,{childList:!0,subtree:!0,attributes:!1}))},stopObserver(){this.observer?.disconnect(),this.observer=null},announce:oe,speak:Cn,showVisualAlert:tr,trapFocus:Kt,handlePlainEnglish:Ko,handleSummarisePage:Qo,handleTranslate:Xo,handleVoiceControl:Jo,handleSmartLabels:Zo,SUPPORTED_LANGUAGES:qt};C();C();var X=hn(require("react"));C();var ke=require("react");En();vt();var v=require("react/jsx-runtime"),Nn={highContrast:!1,reduceMotion:!1,autoFix:!0,dyslexiaFont:!1,fontScale:100,localFont:"",darkMode:!1,largeTargets:!1,speechEnabled:!1,colorBlindMode:"none",showAuditBadge:!1,timeoutWarning:void 0,plainEnglish:!1,summarisePage:!1,translateLanguage:"en",voiceControl:!1,smartLabels:!1},ut=[80,90,100,110,120,130],Ts=[{value:"none",label:"None"},{value:"deuteranopia",label:"Deuteranopia"},{value:"protanopia",label:"Protanopia"},{value:"tritanopia",label:"Tritanopia"},{value:"achromatopsia",label:"Greyscale"}],As=["Prompt API for Gemini Nano","Summarization API for Gemini Nano","Writer API for Gemini Nano","Rewriter API for Gemini Nano","Translation API"];function Cs(){let[e,t]=(0,ke.useState)(typeof window<"u"?window.innerWidth:1024);return(0,ke.useEffect)(()=>{let n=()=>t(window.innerWidth);return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[]),{isMobile:e<=480,isTablet:e>480&&e<=768}}function Rs({checked:e,onChange:t,label:n,disabled:o=!1}){return(0,v.jsxs)("label",{"aria-label":n,style:{position:"relative",display:"inline-flex",width:"40px",height:"24px",cursor:o?"not-allowed":"pointer",flexShrink:0,opacity:o?.4:1},children:[(0,v.jsx)("input",{type:"checkbox",checked:e,disabled:o,onChange:r=>t(r.target.checked),style:{opacity:0,width:0,height:0,position:"absolute"}}),(0,v.jsx)("span",{style:{position:"absolute",inset:0,borderRadius:"99px",background:e?"#0d9488":"#cbd5e1",transition:"background 0.2s"}}),(0,v.jsx)("span",{style:{position:"absolute",top:"3px",left:e?"19px":"3px",width:"18px",height:"18px",background:"#fff",borderRadius:"50%",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",pointerEvents:"none"}})]})}function pt({label:e,color:t="#64748b",badge:n,concept:o}){return(0,v.jsxs)("div",{style:{margin:"10px 18px 4px"},children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,v.jsx)("p",{style:{margin:0,fontSize:"10px",fontWeight:600,color:t,letterSpacing:"0.06em",textTransform:"uppercase"},children:e}),n&&(0,v.jsx)("span",{style:{fontSize:"9px",fontWeight:500,padding:"1px 7px",borderRadius:"99px",background:"#f5f3ff",color:"#7c3aed",border:"0.5px solid #c4b5fd",whiteSpace:"nowrap"},children:n})]}),o&&(0,v.jsx)("p",{style:{margin:"2px 0 0",fontSize:"9px",color:"#94a3b8",fontStyle:"italic"},children:o})]})}function Fe({icon:e,label:t,desc:n,checked:o,onChange:r,disabled:s=!1,disabledReason:i,tip:a}){return(0,v.jsxs)("div",{title:s?i:a,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",gap:"12px"},children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"10px",flex:1,minWidth:0},children:[(0,v.jsx)("span",{"aria-hidden":"true",style:{width:"32px",height:"32px",borderRadius:"8px",background:s?"#f1f5f9":"#f0fdfa",color:s?"#94a3b8":"#0d9488",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",flexShrink:0,fontWeight:700},children:e}),(0,v.jsxs)("div",{style:{minWidth:0},children:[(0,v.jsx)("p",{style:{margin:0,fontSize:"13px",fontWeight:500,color:s?"#94a3b8":"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:t}),(0,v.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#94a3b8"},children:s?i:n})]})]}),(0,v.jsx)(Rs,{checked:o,onChange:r,label:`Toggle ${t}`,disabled:s})]})}function ve(){return(0,v.jsx)("div",{style:{height:"1px",background:"#f1f5f9"}})}function kt({steps:e}){return(0,v.jsxs)("div",{style:{margin:"0 18px 8px",padding:"8px 10px",background:"#f8fafc",borderRadius:"8px",border:"0.5px solid #e2e8f0"},children:[(0,v.jsx)("p",{style:{margin:"0 0 4px",fontSize:"9px",fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em"},children:"How to use"}),e.map((t,n)=>(0,v.jsxs)("p",{style:{margin:"0 0 2px",fontSize:"10px",color:"#475569"},children:[n+1,". ",t]},n))]})}var Fn=(0,ke.forwardRef)(({position:e,settings:t,report:n,isActive:o,aiSupported:r,voiceSupported:s,set:i,onApply:a,onReset:l,onClose:c},d)=>{let{isMobile:h,isTablet:p}=Cs(),[m,g]=(0,ke.useState)([]),[b,u]=(0,ke.useState)(""),[y,k]=(0,ke.useState)(""),[f,S]=(0,ke.useState)(!1),[w,E]=(0,ke.useState)(null),[I,M]=(0,ke.useState)("idle");(0,ke.useEffect)(()=>{let x=window;!!(x.LanguageModel||x.ai?.languageModel)&&r?E("gemini"):xt()&&E("transformers")},[r]),(0,ke.useEffect)(()=>{if(w!=="transformers")return;let x=setInterval(()=>{M(wt())},500);return()=>clearInterval(x)},[w]);let H=async()=>{if(!(!b.trim()||f)){if(!w){k("\u26A0\uFE0F No AI engine available on this device.");return}S(!0),k("");try{let x;w==="gemini"?x=await Rn(b):(M("loading"),x=await $n(b),M("ready")),k(x.success&&x.answer?x.answer.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/#+\s/g,"").trim():"\u26A0\uFE0F "+(x.error||"No answer found on this page"))}catch{k("\u26A0\uFE0F Failed to get answer. Please try again.")}S(!1)}};(0,ke.useEffect)(()=>{(async()=>{try{let Y=window;if(!Y.queryLocalFonts)return;let j=await Y.queryLocalFonts(),J=[...new Set(j.map(ie=>ie.family))].sort();g(J.slice(0,50))}catch{}})()},[]);let O=w==="gemini"?"Gemini Nano":w==="transformers"?"Transformers.js \xB7 All devices":"Detecting...",F=w==="transformers"&&I==="loading"?"Loading AI model... (first time only)":"...",$=h?{position:"fixed",bottom:0,left:0,right:0,zIndex:9999,background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px 16px 0 0",boxShadow:"0 -8px 32px rgba(0,0,0,0.12)",maxHeight:"90vh",overflowY:"auto",fontFamily:"system-ui,-apple-system,sans-serif",width:"100%"}:{position:"fixed",bottom:"84px",[e]:"24px",zIndex:9999,width:p?"300px":"320px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",maxHeight:"80vh",overflowY:"auto",fontFamily:"system-ui,-apple-system,sans-serif"};return(0,v.jsxs)("div",{ref:d,role:"dialog","aria-modal":"true","aria-label":"yuktai accessibility preferences","data-yuktai-panel":"true",style:$,children:[(0,v.jsxs)("div",{style:{padding:"14px 18px 12px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1},children:[(0,v.jsxs)("div",{children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"7px",marginBottom:"4px",flexWrap:"wrap"},children:[(0,v.jsx)("span",{style:{fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"99px",background:"#f0fdfa",color:"#0d9488",letterSpacing:"0.05em",fontFamily:"monospace"},children:"@yuktishaalaa/yuktai"}),o&&(0,v.jsx)("span",{style:{fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"99px",background:"#f0fdfa",color:"#0f766e",border:"1px solid #99f6e4"},children:"\u25CF ACTIVE"})]}),(0,v.jsx)("p",{style:{margin:"0 0 1px",fontSize:"15px",fontWeight:600,color:"#0f172a"},children:"Accessibility"}),(0,v.jsx)("p",{style:{margin:0,fontSize:"11px",color:"#64748b"},children:"WCAG 2.2 \xB7 Open source \xB7 Zero cost \xB7 All devices"})]}),(0,v.jsx)("button",{onClick:c,"aria-label":"Close accessibility panel",style:{background:"none",border:"none",cursor:"pointer",padding:"4px",color:"#94a3b8",fontSize:"20px",lineHeight:1,borderRadius:"6px",flexShrink:0,minWidth:h?"44px":"auto",minHeight:h?"44px":"auto",display:"flex",alignItems:"center",justifyContent:"center"},children:"\xD7"})]}),(0,v.jsx)(pt,{label:"\u267F Core Accessibility",concept:"Rule-based engine \u2014 works on all browsers and devices"}),(0,v.jsx)(kt,{steps:["Toggle any feature on","Click Apply settings","Preferences saved automatically"]}),(0,v.jsx)(Fe,{icon:"\u{1F527}",label:"Auto-fix ARIA",desc:"Injects missing labels and roles automatically",checked:t.autoFix,onChange:x=>i("autoFix",x),tip:"Fixes aria-label, alt text, roles on every element"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u{1F50A}",label:"Speak on focus",desc:"Browser reads elements aloud as you tab",checked:t.speechEnabled,onChange:x=>i("speechEnabled",x),tip:"Uses browser SpeechSynthesis \u2014 no install needed"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u{1F399}\uFE0F",label:"Voice control",desc:"Say commands to navigate the page",checked:t.voiceControl,onChange:x=>i("voiceControl",x),disabled:!s,disabledReason:"Not supported in this browser",tip:'Say "scroll down", "go to main", "click"'}),(0,v.jsx)(ve,{}),(0,v.jsx)(pt,{label:"\u{1F916} AI Features",color:"#7c3aed",badge:"Gemini Nano",concept:"Large Language Model running privately on your device \u2014 Chrome 127+ only"}),(0,v.jsx)("div",{style:{margin:"4px 18px 6px",padding:"8px 10px",background:r?"#f0fdfa":"#f5f3ff",borderRadius:"8px",border:`0.5px solid ${r?"#99f6e4":"#c4b5fd"}`,fontSize:"10px",color:r?"#0f766e":"#7c3aed",lineHeight:1.5},children:r?"\u2705 Gemini Nano detected \u2014 AI features ready. Runs privately on your device.":"\u2699\uFE0F AI features need one-time setup \u2014 see guide below."}),!r&&(0,v.jsxs)("div",{style:{margin:"0 18px 8px",padding:"10px 12px",background:"#fafafa",borderRadius:"8px",border:"0.5px solid #e2e8f0",fontSize:"11px",color:"#475569",lineHeight:1.7},children:[(0,v.jsx)("p",{style:{margin:"0 0 6px",fontWeight:600,color:"#0f172a",fontSize:"11px"},children:"\u{1F6E0} One-time setup \u2014 5 steps:"}),(0,v.jsxs)("p",{style:{margin:"0 0 3px"},children:["1. Open Chrome \u2192 ",(0,v.jsx)("code",{style:{background:"#f1f5f9",padding:"1px 5px",borderRadius:"4px",fontSize:"10px",color:"#0d9488",fontFamily:"monospace"},children:"chrome://flags"})]}),(0,v.jsx)("p",{style:{margin:"0 0 3px"},children:"2. Enable each flag:"}),(0,v.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"2px",margin:"4px 0 6px 10px"},children:As.map(x=>(0,v.jsxs)("span",{style:{fontSize:"10px",color:"#7c3aed",fontFamily:"monospace"},children:["\u2192 ",x]},x))}),(0,v.jsxs)("p",{style:{margin:"0 0 3px"},children:["3. Click ",(0,v.jsx)("strong",{style:{color:"#0f172a"},children:"Relaunch"})]}),(0,v.jsxs)("p",{style:{margin:"0 0 3px"},children:["4. ",(0,v.jsx)("code",{style:{background:"#f1f5f9",padding:"1px 5px",borderRadius:"4px",fontSize:"10px",color:"#0d9488",fontFamily:"monospace"},children:"chrome://components"})," \u2192 Optimization Guide On Device Model \u2192 Check for update"]}),(0,v.jsx)("p",{style:{margin:"0"},children:"5. Refresh \u2014 AI features unlock automatically \u2705"})]}),(0,v.jsx)(Fe,{icon:"\u{1F4DD}",label:"Plain English mode",desc:"Rewrites complex text in simple language",checked:t.plainEnglish,onChange:x=>i("plainEnglish",x),disabled:!r,disabledReason:"Enable Gemini Nano \u2014 see setup above",tip:"AI concept: LLM text rewriting"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u{1F4CB}",label:"Summarise page",desc:"3-sentence summary appears at top",checked:t.summarisePage,onChange:x=>i("summarisePage",x),disabled:!r,disabledReason:"Enable Gemini Nano \u2014 see setup above",tip:"AI concept: Abstractive summarisation"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u{1F3F7}\uFE0F",label:"Smart aria-labels",desc:"AI generates meaningful labels for elements",checked:t.smartLabels,onChange:x=>i("smartLabels",x),disabled:!r,disabledReason:"Enable Gemini Nano \u2014 see setup above",tip:"AI concept: Context-aware label generation"}),(0,v.jsx)(ve,{}),(0,v.jsx)(pt,{label:"\u{1F441}\uFE0F Visual",concept:"CSS filter-based \u2014 works on all browsers and devices"}),(0,v.jsx)(kt,{steps:["Toggle any visual mode","Changes apply instantly","Works on mobile and desktop"]}),(0,v.jsx)(Fe,{icon:"\u25D1",label:"High contrast",desc:"Boosts contrast for low vision users",checked:t.highContrast,onChange:x=>i("highContrast",x),tip:"CSS filter: contrast()"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u{1F319}",label:"Dark mode",desc:"Inverts colours \u2014 easy on eyes at night",checked:t.darkMode,onChange:x=>i("darkMode",x),tip:"CSS filter: invert + hue-rotate"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u23F8\uFE0F",label:"Reduce motion",desc:"Disables all animations",checked:t.reduceMotion,onChange:x=>i("reduceMotion",x),tip:"WCAG 2.3.3 \u2014 vestibular disorders"}),(0,v.jsx)(ve,{}),(0,v.jsx)(Fe,{icon:"\u{1F446}",label:"Large targets",desc:"44\xD744px minimum touch targets",checked:t.largeTargets,onChange:x=>i("largeTargets",x),tip:"WCAG 2.5.8 \u2014 motor impaired users"}),(0,v.jsx)(ve,{}),(0,v.jsxs)("div",{style:{padding:"10px 18px"},children:[(0,v.jsx)("p",{style:{margin:"0 0 2px",fontSize:"12px",fontWeight:500,color:"#0f172a"},children:"\u{1F3A8} Colour blindness"}),(0,v.jsx)("p",{style:{margin:"0 0 8px",fontSize:"10px",color:"#94a3b8"},children:"SVG colour matrix filters \u2014 all devices"}),(0,v.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px"},children:Ts.map(x=>(0,v.jsx)("button",{onClick:()=>i("colorBlindMode",x.value),"aria-pressed":t.colorBlindMode===x.value,style:{padding:"4px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:500,border:`1px solid ${t.colorBlindMode===x.value?"#0d9488":"#e2e8f0"}`,background:t.colorBlindMode===x.value?"#f0fdfa":"#fff",color:t.colorBlindMode===x.value?"#0d9488":"#64748b",cursor:"pointer",minHeight:h?"36px":"auto"},children:x.label},x.value))})]}),(0,v.jsx)(ve,{}),(0,v.jsx)(pt,{label:"\u{1F524} Font",concept:"Browser Font API + CSS \u2014 Chrome 103+"}),(0,v.jsx)(kt,{steps:["Toggle dyslexia font or pick from device","Adjust size with + / \u2212","Saved across visits"]}),(0,v.jsx)(Fe,{icon:"Aa",label:"Dyslexia-friendly font",desc:"Atkinson Hyperlegible \u2014 research-backed",checked:t.dyslexiaFont,onChange:x=>i("dyslexiaFont",x),tip:"By Braille Institute \u2014 free and open source"}),(0,v.jsx)(ve,{}),(0,v.jsxs)("div",{style:{padding:"10px 18px"},children:[(0,v.jsx)("p",{style:{margin:"0 0 2px",fontSize:"12px",fontWeight:500,color:"#0f172a"},children:"\u{1F5A5}\uFE0F Local font"}),(0,v.jsx)("p",{style:{margin:"0 0 8px",fontSize:"10px",color:"#94a3b8"},children:"window.queryLocalFonts() \u2014 Chrome 103+"}),m.length>0?(0,v.jsxs)("select",{value:t.localFont,onChange:x=>i("localFont",x.target.value),"aria-label":"Choose a font from your device",style:{width:"100%",padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"13px",color:"#0f172a",background:"#fff",cursor:"pointer",height:h?"44px":"36px"},children:[(0,v.jsx)("option",{value:"",children:"System default"}),m.map(x=>(0,v.jsx)("option",{value:x,style:{fontFamily:x},children:x},x))]}):(0,v.jsx)("p",{style:{margin:0,fontSize:"11px",color:"#94a3b8"},children:"Allow font access when Chrome prompts you."})]}),(0,v.jsx)(ve,{}),(0,v.jsxs)("div",{style:{padding:"10px 18px 14px"},children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[(0,v.jsxs)("div",{children:[(0,v.jsx)("p",{style:{margin:0,fontSize:"12px",fontWeight:500,color:"#0f172a"},children:"\u{1F4CF} Text size"}),(0,v.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#94a3b8"},children:"Scales all text on the page"})]}),(0,v.jsxs)("span",{style:{fontSize:"12px",fontWeight:600,color:"#0d9488",background:"#f0fdfa",padding:"2px 8px",borderRadius:"99px"},children:[t.fontScale,"%"]})]}),(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,v.jsx)("button",{onClick:()=>{let x=ut.indexOf(t.fontScale);x>0&&i("fontScale",ut[x-1])},disabled:t.fontScale<=80,"aria-label":"Decrease text size",style:{width:h?"44px":"30px",height:h?"44px":"30px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",cursor:t.fontScale<=80?"not-allowed":"pointer",fontSize:"16px",color:t.fontScale<=80?"#cbd5e1":"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:"\u2212"}),(0,v.jsx)("div",{style:{flex:1,display:"flex",gap:"3px"},children:ut.map(x=>(0,v.jsx)("button",{onClick:()=>i("fontScale",x),"aria-label":`Set text size to ${x}%`,style:{flex:1,height:"6px",borderRadius:"99px",border:"none",cursor:"pointer",padding:0,background:x<=t.fontScale?"#0d9488":"#e2e8f0",transition:"background 0.15s"}},x))}),(0,v.jsx)("button",{onClick:()=>{let x=ut.indexOf(t.fontScale);x<ut.length-1&&i("fontScale",ut[x+1])},disabled:t.fontScale>=130,"aria-label":"Increase text size",style:{width:h?"44px":"30px",height:h?"44px":"30px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",cursor:t.fontScale>=130?"not-allowed":"pointer",fontSize:"16px",color:t.fontScale>=130?"#cbd5e1":"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:"+"})]})]}),(0,v.jsx)(ve,{}),(0,v.jsx)(pt,{label:"\u{1F310} Translate",color:"#7c3aed",badge:"Gemini Nano",concept:"Chrome Translation API \u2014 on device, no internet after setup"}),(0,v.jsx)(kt,{steps:["Enable Gemini Nano first","Pick your language","Full page translates instantly"]}),(0,v.jsxs)("div",{style:{padding:"6px 18px 12px"},children:[(0,v.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px"},children:qt.slice(0,h?8:18).map(x=>(0,v.jsx)("button",{onClick:()=>i("translateLanguage",x.code),"aria-pressed":t.translateLanguage===x.code,disabled:!r,style:{padding:"4px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:500,border:`1px solid ${t.translateLanguage===x.code?"#7c3aed":"#e2e8f0"}`,background:t.translateLanguage===x.code?"#f5f3ff":"#fff",color:t.translateLanguage===x.code?"#7c3aed":"#64748b",cursor:r?"pointer":"not-allowed",opacity:r?1:.5,minHeight:h?"36px":"auto"},children:x.label},x.code))}),!r&&(0,v.jsx)("p",{style:{margin:"6px 0 0",fontSize:"10px",color:"#94a3b8"},children:"Enable Gemini Nano using the setup guide above."})]}),(0,v.jsx)(ve,{}),(0,v.jsx)(pt,{label:"\u{1F4AC} Ask This Page",color:"#0d9488",badge:O,concept:"RAG \u2014 Retrieval Augmented Generation. Works on all devices including mobile."}),(0,v.jsx)(kt,{steps:["Type any question about this page","Press Ask or hit Enter",w==="transformers"?"Transformers.js answers \u2014 works on mobile, offline":"Gemini Nano reads page and answers privately","Zero cost. No data leaves your device."]}),(0,v.jsxs)("div",{style:{margin:"0 18px 8px",padding:"6px 10px",background:w==="gemini"?"#f0fdfa":w==="transformers"?"#f5f3ff":"#f8fafc",borderRadius:"8px",border:`0.5px solid ${w==="gemini"?"#99f6e4":w==="transformers"?"#c4b5fd":"#e2e8f0"}`,fontSize:"10px",color:w==="gemini"?"#0f766e":w==="transformers"?"#7c3aed":"#94a3b8"},children:[w==="gemini"&&"\u2705 Using Gemini Nano \u2014 on device, private, instant",w==="transformers"&&"\u2705 Using Transformers.js \u2014 works on mobile and all browsers",!w&&"\u23F3 Detecting AI engine...",w==="transformers"&&I==="loading"&&" \xB7 Loading model...",w==="transformers"&&I==="ready"&&" \xB7 Model ready \u2705"]}),(0,v.jsxs)("div",{style:{padding:"0 18px 14px"},children:[(0,v.jsxs)("div",{style:{display:"flex",gap:"6px",marginBottom:"8px"},children:[(0,v.jsx)("input",{type:"text",value:b,onChange:x=>u(x.target.value),onKeyDown:x=>{x.key==="Enter"&&H()},placeholder:"e.g. What does this page do?",disabled:f||!w,"aria-label":"Ask a question about this page",style:{flex:1,padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",background:w?"#fff":"#f8fafc",outline:"none",height:h?"44px":"36px"}}),(0,v.jsx)("button",{onClick:H,disabled:f||!b.trim()||!w,"aria-label":"Ask question",style:{padding:"8px 14px",borderRadius:"8px",border:"none",background:w&&b.trim()&&!f?"#0d9488":"#e2e8f0",color:w&&b.trim()&&!f?"#fff":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:w&&b.trim()&&!f?"pointer":"not-allowed",flexShrink:0,height:h?"44px":"36px",minWidth:"52px",transition:"background 0.2s"},children:f?F:"Ask"})]}),y&&(0,v.jsxs)("div",{role:"status","aria-live":"polite",style:{padding:"10px 12px",background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:"8px",fontSize:"12px",color:"#0f766e",lineHeight:1.6,maxHeight:"180px",overflowY:"auto"},children:[(0,v.jsx)("strong",{style:{display:"block",marginBottom:"4px",fontSize:"11px",color:"#0d9488"},children:"\u{1F4AC} Answer"}),y,(0,v.jsx)("button",{onClick:()=>{k(""),u("")},style:{display:"block",marginTop:"6px",background:"none",border:"none",color:"#94a3b8",fontSize:"10px",cursor:"pointer",padding:0},children:"Clear"})]})]}),n&&(0,v.jsx)("div",{role:"status",style:{margin:"0 14px 10px",padding:"8px 12px",background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:"8px",fontSize:"12px",color:"#0f766e",fontWeight:500,fontFamily:"monospace"},children:n.fixed>0?`\u2713 ${n.fixed} fixes \xB7 ${n.scanned} nodes \xB7 ${n.renderTime}ms \xB7 Score: ${n.score}/100`:`\u2713 0 auto-fixes needed \xB7 ${n.scanned} nodes \xB7 ${n.renderTime}ms`}),(0,v.jsxs)("div",{style:{display:"flex",gap:"8px",padding:"12px 14px 14px",position:h?"sticky":"relative",bottom:h?0:"auto",background:"#fff",borderTop:"1px solid #f1f5f9"},children:[(0,v.jsx)("button",{onClick:l,style:{flex:1,padding:h?"12px 0":"8px 0",fontSize:"13px",fontWeight:500,borderRadius:"9px",border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",cursor:"pointer"},children:"Reset"}),(0,v.jsx)("button",{onClick:a,style:{flex:2,padding:h?"12px 0":"8px 0",fontSize:"13px",fontWeight:600,borderRadius:"9px",border:"none",background:"#0d9488",color:"#fff",cursor:"pointer"},children:"Apply settings"})]})]})});Fn.displayName="WidgetPanel";vt();C();var He=require("react");C();var Es={hotel:["hotel","resort","motel","inn","accommodation","lodge","stay","room","booking","hospitality"],ecommerce:["shop","store","ecommerce","e-commerce","sell","product","cart","buy","marketplace","retail"],restaurant:["restaurant","food","cafe","cafeteria","menu","dining","eat","cuisine","bistro","takeaway","delivery"],portfolio:["portfolio","freelance","personal","designer","developer","creative","showcase","work","hire me"],blog:["blog","article","post","write","news","magazine","journal","content"],saas:["saas","dashboard","app","software","platform","tool","analytics","admin","manage","crm"],government:["government","govt","portal","citizen","scheme","welfare","municipal","public","official"],healthcare:["hospital","clinic","doctor","health","medical","patient","appointment","pharmacy"],education:["school","college","university","course","learn","education","student","lms","training"],realestate:["real estate","property","house","flat","apartment","rent","buy property","listing"],landing:["landing","startup","launch","product launch","coming soon","waitlist"],generic:[]},Is={hotel:["home","rooms","booking","about","contact"],ecommerce:["home","products","cart","checkout","about","contact"],restaurant:["home","menu","reservations","about","contact"],portfolio:["home","portfolio","about","contact"],blog:["home","blog","about","contact"],saas:["home","pricing","dashboard","auth","about","contact"],government:["home","services","about","contact","faq"],healthcare:["home","services","booking","team","about","contact"],education:["home","services","pricing","about","contact"],realestate:["home","products","about","contact"],landing:["home","pricing","about","contact"],generic:["home","about","services","contact"]},$s={home:["home","homepage","main","landing"],about:["about","who we are","our story","company"],contact:["contact","reach us","get in touch","location"],services:["service","what we offer","solution","offering"],pricing:["pricing","price","plan","subscription","cost","fee"],blog:["blog","article","news","post"],auth:["login","register","signup","sign up","sign in","auth","account"],dashboard:["dashboard","admin","panel","manage","analytics"],gallery:["gallery","photo","image","portfolio"],products:["product","shop","store","item","catalogue"],cart:["cart","basket","shopping cart"],checkout:["checkout","payment","pay","order"],rooms:["room","suite","accommodation","stay"],booking:["booking","reserve","reservation","schedule","appointment"],menu:["menu","food","dish","cuisine"],reservations:["reservation","table booking","book table"],portfolio:["portfolio","work","project","case study"],team:["team","staff","member","people","who we are"],faq:["faq","question","answer","help","support"],terms:["terms","condition","legal"],privacy:["privacy","policy","gdpr","data"]},Ls={Authentication:["login","register","auth","signup","sign in","account"],Payment:["payment","stripe","pay","checkout","billing"],Search:["search","filter","find"],"Dark mode":["dark mode","dark theme","night mode"],"Multi-language":["multilingual","multi language","translation","i18n"],SEO:["seo","search engine","meta","google"],Analytics:["analytics","tracking","stats","dashboard"],Email:["email","newsletter","contact form","notification"],Map:["map","location","address","google maps"],"Social media":["social","instagram","facebook","twitter","share"],"Image gallery":["gallery","photo","image","carousel"],"Booking system":["booking","reservation","appointment","schedule"],"Shopping cart":["cart","basket","shop","ecommerce"],"Blog/CMS":["blog","cms","content","article","post"]},Ns={blue:["blue","navy","sky","ocean","corporate"],green:["green","nature","eco","environment","health","fresh"],purple:["purple","violet","luxury","creative","royal"],red:["red","bold","energy","passion","food"],orange:["orange","warm","friendly","fun"],teal:["teal","turquoise","modern","tech"],indigo:["indigo","professional","trust","finance","bank"],gray:["gray","minimal","clean","simple","neutral"]},Fs={hotel:"indigo",ecommerce:"blue",restaurant:"red",portfolio:"purple",blog:"gray",saas:"teal",government:"blue",healthcare:"green",education:"indigo",realestate:"orange",landing:"purple",generic:"blue"};function Ms(e){let t=[/(?:for|called|named|company|business|brand)\s+["']?([A-Z][a-zA-Z\s]{1,30})["']?/i,/["']([A-Z][a-zA-Z\s]{1,30})["']/,/^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/m];for(let n of t){let o=e.match(n);if(o?.[1]){let r=o[1].trim();if(r.length>2&&r.length<40)return r}}return"My Business"}function Ps(e){let t=e.toLowerCase(),n="generic",o=0;for(let[r,s]of Object.entries(Es)){let i=0;for(let a of s)t.includes(a)&&i++;i>o&&(o=i,n=r)}return n}function Gs(e,t){let n=e.toLowerCase(),o=new Set(Is[t]);for(let[r,s]of Object.entries($s))for(let i of s)if(n.includes(i)){o.add(r);break}return o.add("home"),o.add("contact"),Array.from(o)}function zs(e){let t=e.toLowerCase(),n=[];for(let[o,r]of Object.entries(Ls))for(let s of r)if(t.includes(s)){n.push(o);break}return n}function Os(e,t){let n=e.toLowerCase();for(let[o,r]of Object.entries(Ns))for(let s of r)if(n.includes(s))return o;return Fs[t]}function lr(e){let t=Ps(e),n=Gs(e,t),o=zs(e),r=Os(e,t);return{siteName:Ms(e),websiteType:t,pages:n,features:o,theme:r,description:e.slice(0,200)}}var G=require("react/jsx-runtime"),Hs=["Hotel booking website for Grand Palace Hotels with rooms, booking and payment","E-commerce store for organic food products with cart and checkout","Restaurant website for Spice Garden with menu and table reservations","Portfolio website for a freelance designer with gallery and contact","SaaS dashboard for project management with pricing and auth","Government portal for citizen services with FAQ and contact"],_s={home:"\u{1F3E0}",about:"\u2139\uFE0F",contact:"\u{1F4EC}",services:"\u2699\uFE0F",pricing:"\u{1F4B0}",blog:"\u{1F4DD}",auth:"\u{1F510}",dashboard:"\u{1F4CA}",gallery:"\u{1F5BC}\uFE0F",products:"\u{1F6D2}",cart:"\u{1F6CD}\uFE0F",checkout:"\u{1F4B3}",rooms:"\u{1F6CF}\uFE0F",booking:"\u{1F4C5}",menu:"\u{1F37D}\uFE0F",reservations:"\u{1FA91}",portfolio:"\u{1F4BC}",team:"\u{1F465}",faq:"\u2753",terms:"\u{1F4C4}",privacy:"\u{1F512}"},qs={hotel:"\u{1F3E8}",ecommerce:"\u{1F6D2}",restaurant:"\u{1F37D}\uFE0F",portfolio:"\u{1F4BC}",blog:"\u{1F4DD}",saas:"\u26A1",government:"\u{1F3DB}\uFE0F",healthcare:"\u{1F3E5}",education:"\u{1F393}",realestate:"\u{1F3E0}",landing:"\u{1F680}",generic:"\u{1F310}"};function Pn({position:e,onClose:t}){let[n,o]=(0,He.useState)("input"),[r,s]=(0,He.useState)(""),[i,a]=(0,He.useState)(null),[l,c]=(0,He.useState)(0),[d,h]=(0,He.useState)(""),p=(0,He.useCallback)(()=>{if(!r.trim())return;let u=lr(r);a(u),o("preview")},[r]),m=(0,He.useCallback)(async()=>{if(i){o("generating"),c(0),h("");try{let u=[{msg:"Parsing requirement...",pct:15},{msg:"Loading templates...",pct:30},{msg:"Generating pages...",pct:55},{msg:"Building components...",pct:70},{msg:"Creating styles...",pct:85},{msg:"Packaging ZIP...",pct:95}];for(let k of u)c(k.pct),await new Promise(f=>setTimeout(f,200));let{generateZip:y}=await Promise.resolve().then(()=>(Gr(),Pr));await y(i),c(100),o("done")}catch(u){h(u instanceof Error?u.message:"Generation failed. Please try again."),o("preview")}}},[i]),g=()=>{o("input"),s(""),a(null),c(0),h("")},b={position:"fixed",bottom:"204px",[e]:"24px",zIndex:9999,width:"340px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.14)",fontFamily:"system-ui,-apple-system,sans-serif",maxHeight:"75vh",overflowY:"auto"};return(0,G.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"yuktai Vibe Coder","data-yuktai-panel":"true",style:b,children:[(0,G.jsxs)("div",{style:{padding:"14px 16px 12px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1},children:[(0,G.jsxs)("div",{children:[(0,G.jsx)("p",{style:{margin:"0 0 2px",fontSize:"13px",fontWeight:700,color:"#0f172a"},children:"\u26A1 Vibe Coder"}),(0,G.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#64748b"},children:"Describe your website \u2192 Download Next.js ZIP"})]}),(0,G.jsx)("button",{onClick:t,"aria-label":"Close vibe coder",style:{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:"18px",padding:"2px"},children:"\xD7"})]}),n==="input"&&(0,G.jsxs)("div",{style:{padding:"14px 16px"},children:[(0,G.jsx)("p",{style:{margin:"0 0 10px",fontSize:"11px",color:"#64748b"},children:"Describe your business website in plain English. The plugin will generate a complete Next.js project for you."}),(0,G.jsx)("p",{style:{margin:"0 0 6px",fontSize:"10px",fontWeight:600,color:"#94a3b8",textTransform:"uppercase"},children:"Examples"}),(0,G.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"12px"},children:Hs.slice(0,3).map(u=>(0,G.jsx)("button",{onClick:()=>s(u),style:{padding:"6px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontSize:"10px",cursor:"pointer",textAlign:"left",lineHeight:1.4},children:u},u))}),(0,G.jsx)("textarea",{value:r,onChange:u=>s(u.target.value),placeholder:"e.g. I need a hotel booking website with rooms, search, and payment for Grand Palace Hotels",rows:4,"aria-label":"Describe your website",style:{width:"100%",padding:"10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",resize:"vertical",outline:"none",fontFamily:"inherit",lineHeight:1.5}}),(0,G.jsx)("button",{onClick:p,disabled:!r.trim(),style:{width:"100%",marginTop:"10px",padding:"10px",borderRadius:"8px",border:"none",background:r.trim()?"#f59e0b":"#e2e8f0",color:r.trim()?"#fff":"#94a3b8",fontSize:"13px",fontWeight:700,cursor:r.trim()?"pointer":"not-allowed",transition:"background 0.2s"},children:"Analyse Requirement \u2192"})]}),n==="preview"&&i&&(0,G.jsxs)("div",{style:{padding:"14px 16px"},children:[d&&(0,G.jsxs)("div",{style:{padding:"10px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"8px",marginBottom:"12px",fontSize:"11px",color:"#dc2626"},children:["\u26A0\uFE0F ",d]}),(0,G.jsxs)("div",{style:{background:"#f8fafc",borderRadius:"10px",padding:"12px",marginBottom:"12px"},children:[(0,G.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"},children:[(0,G.jsx)("span",{style:{fontSize:"1.5rem"},children:qs[i.websiteType]||"\u{1F310}"}),(0,G.jsxs)("div",{children:[(0,G.jsx)("p",{style:{margin:0,fontSize:"13px",fontWeight:700,color:"#0f172a"},children:i.siteName}),(0,G.jsxs)("p",{style:{margin:0,fontSize:"10px",color:"#64748b",textTransform:"capitalize"},children:[i.websiteType," website \xB7 ",i.theme," theme"]})]})]}),(0,G.jsxs)("p",{style:{margin:"8px 0 6px",fontSize:"10px",fontWeight:600,color:"#94a3b8",textTransform:"uppercase"},children:["Pages to generate (",i.pages.length,")"]}),(0,G.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:i.pages.map(u=>(0,G.jsxs)("span",{style:{padding:"2px 8px",borderRadius:"99px",background:"#f0fdf4",border:"1px solid #86efac",fontSize:"10px",color:"#166534",fontWeight:500},children:[_s[u]||"\u{1F4C4}"," ",u]},u))}),i.features.length>0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)("p",{style:{margin:"10px 0 6px",fontSize:"10px",fontWeight:600,color:"#94a3b8",textTransform:"uppercase"},children:"Detected features"}),(0,G.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:i.features.map(u=>(0,G.jsx)("span",{style:{padding:"2px 8px",borderRadius:"99px",background:"#f5f3ff",border:"1px solid #c4b5fd",fontSize:"10px",color:"#7c3aed",fontWeight:500},children:u},u))})]})]}),(0,G.jsxs)("div",{style:{margin:"0 0 12px",padding:"10px 12px",background:"#f0fdf4",borderRadius:"8px",border:"1px solid #86efac"},children:[(0,G.jsx)("p",{style:{margin:"0 0 4px",fontSize:"10px",fontWeight:700,color:"#166534"},children:"\u{1F4E6} What you get:"}),(0,G.jsxs)("p",{style:{margin:0,fontSize:"10px",color:"#166534",lineHeight:1.6},children:["\u2705 Complete Next.js 16 project",(0,G.jsx)("br",{}),"\u2705 Tailwind CSS + CSS Modules",(0,G.jsx)("br",{}),"\u2705 TypeScript configured",(0,G.jsx)("br",{}),"\u2705 Navbar + Footer components",(0,G.jsx)("br",{}),"\u2705 All ",i.pages.length," pages ready",(0,G.jsx)("br",{}),"\u2705 Mobile responsive",(0,G.jsx)("br",{}),"\u2705 npm run dev \u2192 works immediately"]})]}),(0,G.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,G.jsx)("button",{onClick:g,style:{flex:1,padding:"9px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:"12px",fontWeight:600,cursor:"pointer"},children:"\u2190 Edit"}),(0,G.jsx)("button",{onClick:m,style:{flex:2,padding:"9px",borderRadius:"8px",border:"none",background:"#f59e0b",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer"},children:"\u2B07\uFE0F Generate & Download ZIP"})]})]}),n==="generating"&&(0,G.jsxs)("div",{style:{padding:"2rem 16px",textAlign:"center"},children:[(0,G.jsx)("p",{style:{fontSize:"2rem",marginBottom:"1rem"},children:"\u26A1"}),(0,G.jsx)("p",{style:{fontSize:"13px",fontWeight:700,color:"#0f172a",marginBottom:"0.5rem"},children:"Generating your project..."}),(0,G.jsx)("p",{style:{fontSize:"11px",color:"#64748b",marginBottom:"1.5rem"},children:l<30?"Parsing requirement...":l<55?"Loading templates...":l<70?"Generating pages...":l<85?"Building components...":l<95?"Creating styles...":"Packaging ZIP..."}),(0,G.jsx)("div",{style:{height:"8px",background:"#e2e8f0",borderRadius:"99px",overflow:"hidden"},children:(0,G.jsx)("div",{style:{height:"100%",width:`${l}%`,background:"#f59e0b",borderRadius:"99px",transition:"width 0.3s ease"}})}),(0,G.jsxs)("p",{style:{marginTop:"0.5rem",fontSize:"10px",color:"#94a3b8"},children:[l,"%"]})]}),n==="done"&&i&&(0,G.jsxs)("div",{style:{padding:"2rem 16px",textAlign:"center"},children:[(0,G.jsx)("p",{style:{fontSize:"3rem",marginBottom:"0.75rem"},children:"\u2705"}),(0,G.jsxs)("p",{style:{fontSize:"14px",fontWeight:700,color:"#0f172a",marginBottom:"0.5rem"},children:[i.siteName," downloaded!"]}),(0,G.jsx)("p",{style:{fontSize:"11px",color:"#64748b",marginBottom:"1.5rem",lineHeight:1.6},children:"Your ZIP is downloading. Unzip it and run:"}),["npm install","npm run dev"].map(u=>(0,G.jsx)("div",{style:{background:"#0f172a",borderRadius:"8px",padding:"8px 12px",marginBottom:"6px",textAlign:"left"},children:(0,G.jsxs)("code",{style:{fontSize:"12px",color:"#a7f3d0",fontFamily:"monospace"},children:["$ ",u]})},u)),(0,G.jsx)("p",{style:{fontSize:"11px",color:"#10b981",margin:"1rem 0",fontWeight:600},children:"Then open http://localhost:3000 \u{1F680}"}),(0,G.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,G.jsx)("button",{onClick:g,style:{flex:1,padding:"9px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:"12px",fontWeight:600,cursor:"pointer"},children:"New Project"}),(0,G.jsx)("button",{onClick:m,style:{flex:1,padding:"9px",borderRadius:"8px",border:"none",background:"#f59e0b",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer"},children:"\u2B07\uFE0F Download Again"})]})]})]})}var _=require("react/jsx-runtime");async function Ks(){try{if(typeof window>"u")return!1;let e=window;if(e.LanguageModel)try{if(typeof e.LanguageModel.availability=="function"){let n=await e.LanguageModel.availability();if(n==="readily"||n==="available"||n==="downloadable")return!0}else return!0}catch{}if(e.Summarizer)try{let n=await e.Summarizer.availability?.();if(!n||n==="readily"||n==="available")return!0}catch{}if(e.Rewriter)try{let n=await e.Rewriter.availability?.();if(!n||n==="readily"||n==="available")return!0}catch{}if(e.Writer)try{let n=await e.Writer.availability?.();if(!n||n==="readily"||n==="available")return!0}catch{}let t=e.ai||globalThis.ai;if(t){if(t.languageModel?.availability)try{let n=await t.languageModel.availability();if(n==="readily"||n==="available")return!0}catch{}if(t.languageModel&&typeof t.languageModel.create=="function"||t.summarizer||t.rewriter||t.writer||t.languageModel)return!0}return!!(e.Translator||e.translation?.canTranslate)}catch{return!1}}function Qt({position:e="left",children:t,config:n={},showRag:o=!1,showAgent:r=!1}){let[s,i]=(0,X.useState)(!1),[a,l]=(0,X.useState)(Nn),[c,d]=(0,X.useState)(null),[h,p]=(0,X.useState)(!1),[m,g]=(0,X.useState)(!1),[b,u]=(0,X.useState)(!1),y=X.default.useRef(null),[k,f]=(0,X.useState)(!1),[S,w]=(0,X.useState)(""),[E,I]=(0,X.useState)(""),[M,H]=(0,X.useState)(!1),[O,F]=(0,X.useState)(null),[$,x]=(0,X.useState)("idle"),[Y,j]=(0,X.useState)(!1),[J,ie]=(0,X.useState)(""),[ge,W]=(0,X.useState)(""),[U,R]=(0,X.useState)(!1),[z,ee]=(0,X.useState)([]),[q,ce]=(0,X.useState)(null),he=24,Ae=84,We=o?144:84,So=204,[Ce,ot]=(0,X.useState)(!1);(0,X.useEffect)(()=>{if(typeof window>"u")return;let N=window;!!(N.LanguageModel||N.ai?.languageModel)&&m?(F("gemini"),ce("gemini")):xt()&&(F("transformers"),ce("transformers"))},[m]),(0,X.useEffect)(()=>{if(O!=="transformers")return;let N=setInterval(()=>x(wt()),500);return()=>clearInterval(N)},[O]);let ht=(0,X.useCallback)(async()=>{if(!(!S.trim()||M)){if(!O){I("\u26A0\uFE0F No AI engine available.");return}H(!0),I("");try{let N;if(O==="gemini"){let{askPage:re}=await Promise.resolve().then(()=>(En(),or));N=await re(S)}else{x("loading");let{askPageWithTransformers:re}=await Promise.resolve().then(()=>(vt(),Ln));N=await re(S),x("ready")}I(N.success&&N.answer?N.answer.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/#+\s/g,"").trim():"\u26A0\uFE0F "+(N.error||"No answer found."))}catch{I("\u26A0\uFE0F Something went wrong.")}H(!1)}},[S,M,O]),Ot=(0,X.useCallback)(async()=>{if(!J.trim()||U)return;if(!q){W("\u26A0\uFE0F No AI engine available.");return}R(!0),ee([]),W("");let{runAgent:N}=await Promise.resolve().then(()=>(Hr(),Br));await N(J,q,re=>{ee(ze=>[...ze,re.text])}),R(!1),W("done")},[J,U,q]);(0,X.useEffect)(()=>{if(typeof window>"u")return;let re=setTimeout(async()=>{let ze=window,gn=await Ks();g(gn),u(!!(ze.SpeechRecognition||ze.webkitSpeechRecognition))},800);return()=>clearTimeout(re)},[]),(0,X.useEffect)(()=>{if(!(typeof window>"u"))try{let N=localStorage.getItem("yuktai-a11y-prefs");N&&l(re=>({...re,...JSON.parse(N)}))}catch{}},[]);let Ue=(0,X.useCallback)(async N=>{let re={enabled:!0,highContrast:N.highContrast,darkMode:N.darkMode,reduceMotion:N.reduceMotion,largeTargets:N.largeTargets,speechEnabled:N.speechEnabled,autoFix:N.autoFix,dyslexiaFont:N.dyslexiaFont,localFont:N.localFont,fontSizeMultiplier:N.fontScale/100,colorBlindMode:N.colorBlindMode,showAuditBadge:N.showAuditBadge,showSkipLinks:!0,showPreferencePanel:!1,plainEnglish:N.plainEnglish,summarisePage:N.summarisePage,translateLanguage:N.translateLanguage,voiceControl:N.voiceControl,smartLabels:N.smartLabels,...n};await we.execute(re),d(we.applyFixes(re)),p(!0)},[n]),Te=(0,X.useCallback)(async()=>{try{localStorage.setItem("yuktai-a11y-prefs",JSON.stringify(a))}catch{}await Ue(a),i(!1)},[a,Ue]),Be=(0,X.useCallback)(()=>{l(Nn);try{localStorage.removeItem("yuktai-a11y-prefs")}catch{}let N=document.documentElement;["data-yuktai-high-contrast","data-yuktai-dark","data-yuktai-reduce-motion","data-yuktai-large-targets","data-yuktai-keyboard","data-yuktai-dyslexia"].forEach(re=>N.removeAttribute(re)),document.body.style.filter="",document.body.style.fontFamily="",document.documentElement.style.fontSize="",d(null),p(!1)},[]),bt=(0,X.useCallback)((N,re)=>{l(ze=>({...ze,[N]:re}))},[]);(0,X.useEffect)(()=>{let N=re=>{re.key==="Escape"&&(s&&i(!1),k&&f(!1),Y&&j(!1),Ce&&ot(!1))};return window.addEventListener("keydown",N),()=>window.removeEventListener("keydown",N)},[s,k,Y]),(0,X.useEffect)(()=>{s&&y.current&&we.trapFocus(y.current)},[s]);let Ze=(N,re,ze)=>({position:"fixed",bottom:`${N}px`,[e]:"24px",zIndex:9998,width:"52px",height:"52px",borderRadius:"50%",background:re,color:"#fff",border:"none",cursor:"pointer",fontSize:"22px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.25)",transition:"transform 0.15s, background 0.2s"}),rt=N=>{N.currentTarget.style.transform="scale(1.08)"},Ve=N=>{N.currentTarget.style.transform="scale(1)"},it=O==="gemini"?"Gemini Nano \xB7 On device":O==="transformers"?"Transformers.js \xB7 All devices":"Detecting...",Dt=O==="transformers"&&$==="loading"?"Loading model...":"...";return(0,_.jsxs)(_.Fragment,{children:[t,r&&(0,_.jsx)("button",{style:Ze(204,Ce?"#d97706":"#f59e0b",Ce),"aria-label":"Open Vibe Coder",title:"\u26A1 Vibe Coder \u2014 Generate Next.js project",onClick:()=>{ot(N=>!N),j(!1),f(!1),i(!1)},onMouseEnter:rt,onMouseLeave:Ve,children:"\u26A1"}),r&&Ce&&(0,_.jsx)(Pn,{position:e,onClose:()=>ot(!1)}),r&&(0,_.jsx)("button",{style:Ze(We,Y?"#059669":"#10b981",Y),"aria-label":"Open AI agent","aria-haspopup":"dialog","aria-expanded":Y,title:"\u{1F916} AI Agent \u2014 guide me through this page",onClick:()=>{j(N=>!N),f(!1),i(!1)},onMouseEnter:rt,onMouseLeave:Ve,children:"\u{1F916}"}),r&&Y&&(0,_.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"yuktai AI Agent","data-yuktai-panel":"true",style:{position:"fixed",bottom:`${We+64}px`,[e]:"24px",zIndex:9999,width:"300px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",fontFamily:"system-ui,-apple-system,sans-serif",padding:"14px",maxHeight:"70vh",overflowY:"auto"},children:[(0,_.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"},children:[(0,_.jsxs)("div",{children:[(0,_.jsx)("p",{style:{margin:"0 0 2px",fontSize:"13px",fontWeight:600,color:"#0f172a"},children:"\u{1F916} AI Agent"}),(0,_.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#10b981"},children:q==="gemini"?"Gemini Nano \xB7 On device":q==="transformers"?"Transformers.js \xB7 All devices":"Detecting..."})]}),(0,_.jsx)("button",{onClick:()=>j(!1),"aria-label":"Close agent panel",style:{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:"18px",lineHeight:1,padding:"2px"},children:"\xD7"})]}),(0,_.jsx)("p",{style:{margin:"0 0 8px",fontSize:"11px",color:"#64748b"},children:"Tell me what you want to do on this page. I will guide you step by step."}),(0,_.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"8px"},children:["Fill this form","Find contact info","What is this page?","Guide me to apply"].map(N=>(0,_.jsx)("button",{onClick:()=>ie(N),style:{padding:"3px 8px",borderRadius:"20px",fontSize:"10px",border:"1px solid #e2e8f0",background:"#f8fafc",color:"#64748b",cursor:"pointer"},children:N},N))}),(0,_.jsxs)("div",{style:{display:"flex",gap:"6px",marginBottom:"8px"},children:[(0,_.jsx)("input",{type:"text",value:J,onChange:N=>ie(N.target.value),onKeyDown:N=>{N.key==="Enter"&&Ot()},placeholder:"e.g. Help me fill this form",disabled:U||!q,"aria-label":"Tell the agent what to do",style:{flex:1,padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",background:q?"#fff":"#f8fafc",outline:"none",height:"36px"}}),(0,_.jsx)("button",{onClick:Ot,disabled:U||!J.trim()||!q,"aria-label":"Run agent",style:{padding:"8px 12px",borderRadius:"8px",border:"none",background:q&&J.trim()&&!U?"#10b981":"#e2e8f0",color:q&&J.trim()&&!U?"#fff":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:q&&J.trim()&&!U?"pointer":"not-allowed",height:"36px",minWidth:"52px",transition:"background 0.2s"},children:U?"...":"Go"})]}),z.length>0&&(0,_.jsxs)("div",{style:{padding:"10px 12px",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"8px",fontSize:"11px",color:"#166534",lineHeight:1.7},children:[z.map((N,re)=>(0,_.jsx)("p",{style:{margin:"0 0 2px"},children:N},re)),ge==="done"&&(0,_.jsx)("button",{onClick:()=>{ee([]),ie(""),W("")},style:{display:"block",marginTop:"6px",background:"none",border:"none",color:"#94a3b8",fontSize:"10px",cursor:"pointer",padding:0},children:"Clear"})]}),!q&&(0,_.jsx)("p",{style:{margin:"4px 0 0",fontSize:"10px",color:"#94a3b8"},children:"Enable Gemini Nano via chrome://flags for best results."})]}),o&&(0,_.jsx)("button",{style:Ze(Ae,k?"#7c3aed":"#6d28d9",k),"aria-label":"Ask a question about this page","aria-haspopup":"dialog","aria-expanded":k,title:`\u{1F4AC} Ask this page \xB7 ${it}`,onClick:()=>{f(N=>!N),i(!1),j(!1)},onMouseEnter:rt,onMouseLeave:Ve,children:"\u{1F4AC}"}),o&&k&&(0,_.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Ask this page","data-yuktai-panel":"true",style:{position:"fixed",bottom:`${Ae+64}px`,[e]:"24px",zIndex:9999,width:"300px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",fontFamily:"system-ui,-apple-system,sans-serif",padding:"14px"},children:[(0,_.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"},children:[(0,_.jsxs)("div",{children:[(0,_.jsx)("p",{style:{margin:"0 0 2px",fontSize:"13px",fontWeight:600,color:"#0f172a"},children:"\u{1F4AC} Ask this page"}),(0,_.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#7c3aed"},children:it}),O==="transformers"&&$==="loading"&&(0,_.jsx)("p",{style:{margin:"2px 0 0",fontSize:"9px",color:"#94a3b8"},children:"Downloading model \u2014 first time only"}),O==="transformers"&&$==="ready"&&(0,_.jsx)("p",{style:{margin:"2px 0 0",fontSize:"9px",color:"#10b981"},children:"Model ready \u2705 \u2014 works offline"})]}),(0,_.jsx)("button",{onClick:()=>f(!1),"aria-label":"Close ask panel",style:{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:"18px",lineHeight:1,padding:"2px"},children:"\xD7"})]}),(0,_.jsxs)("div",{style:{display:"flex",gap:"6px",marginBottom:"8px"},children:[(0,_.jsx)("input",{type:"text",value:S,onChange:N=>w(N.target.value),onKeyDown:N=>{N.key==="Enter"&&ht()},placeholder:"e.g. What does this page do?",disabled:M||!O,"aria-label":"Ask a question about this page",style:{flex:1,padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",background:O?"#fff":"#f8fafc",outline:"none",height:"36px"}}),(0,_.jsx)("button",{onClick:ht,disabled:M||!S.trim()||!O,"aria-label":"Submit question",style:{padding:"8px 12px",borderRadius:"8px",border:"none",background:O&&S.trim()&&!M?"#7c3aed":"#e2e8f0",color:O&&S.trim()&&!M?"#fff":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:O&&S.trim()&&!M?"pointer":"not-allowed",height:"36px",minWidth:"48px",transition:"background 0.2s"},children:M?Dt:"Ask"})]}),E&&(0,_.jsxs)("div",{style:{padding:"10px",background:"#f5f3ff",borderRadius:"8px",fontSize:"12px",color:"#4c1d95",lineHeight:1.6,maxHeight:"180px",overflowY:"auto"},children:[(0,_.jsx)("strong",{style:{display:"block",marginBottom:"4px",fontSize:"11px",color:"#7c3aed"},children:"\u{1F4AC} Answer"}),E,(0,_.jsx)("button",{onClick:()=>{I(""),w("")},style:{display:"block",marginTop:"6px",background:"none",border:"none",color:"#94a3b8",fontSize:"10px",cursor:"pointer",padding:0},children:"Clear"})]}),!O&&(0,_.jsx)("p",{style:{margin:"4px 0 0",fontSize:"10px",color:"#94a3b8"},children:"Detecting AI engine..."})]}),(0,_.jsx)("button",{style:Ze(he,h?"#0d9488":"#1a73e8",s),"aria-label":"Open accessibility preferences","aria-haspopup":"dialog","aria-expanded":s,"data-yuktai-pref-toggle":"true",title:"\u267F Accessibility settings",onClick:()=>{i(N=>!N),f(!1),j(!1)},onMouseEnter:rt,onMouseLeave:Ve,children:"\u267F"}),s&&(0,_.jsx)(Fn,{ref:y,position:e,settings:a,report:c,isActive:h,aiSupported:m,voiceSupported:b,set:bt,onApply:Te,onReset:Be,onClose:()=>i(!1)})]})}C();var St={name:"ai.text",async execute(e){return`\u{1F916} YuktAI says: ${e}`}};C();var Tt={name:"voice.text",async execute(e){return!e||e.trim()===""?"\u{1F3A4} No speech detected":`\u{1F3A4} You said: ${e}`}};C();var Ke=class{plugins=new Map;register(t,n){if(!n||typeof n.execute!="function")throw new Error(`Invalid plugin: ${t}`);this.plugins.set(t,n)}use(t){return this.plugins.get(t)}async run(t,n){try{let o=this.use(t);if(!o)throw new Error(`Plugin not found: ${t}`);return await o.execute(n)}catch(o){throw console.error(`[YuktAI Runtime Error in ${t}]:`,o),o}}getPlugins(){return Array.from(this.plugins.keys())}};C();var ae=require("react");C();var se=require("react"),L=require("react/jsx-runtime"),_r={"en-US":{title:"Grid AI Assistant",subtitle:"Ask about your data",ask:"Ask",placeholder:"Ask or type a command...",listening:"Listening...",send:"Send",close:"Close",open:"Open AI assistant",inputLanguage:"Input language",speakNow:"Speak your question",working:"Working on it\u2026",english:"English",telugu:"\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",searchStarted:e=>`Searching for "${e}".`,sortedAscending:e=>`Sorted by ${e} in ascending order.`,sortedDescending:e=>`Sorted by ${e} in descending order.`,count:e=>`There are ${e} rows in the grid.`,highest:(e,t,n)=>`The highest ${e} is ${t}, held by ${n}.`,lowest:(e,t,n)=>`The lowest ${e} is ${t}, held by ${n}.`,average:(e,t)=>`The average ${e} is ${t}.`,total:(e,t)=>`The total ${e} is ${t}.`,noData:"There is no data to analyze.",noColumn:"I could not find a column to analyze.",noNumericData:e=>`There is no numeric data in ${e}.`,notFound:e=>`I could not find anything matching "${e}".`,needName:"Please provide a value to look up.",fallback:"I can search, sort, count, and analyze the grid data.",unsupportedVoice:"Voice input is not supported in this browser."},"te-IN":{title:"\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D AI \u0C38\u0C39\u0C3E\u0C2F\u0C15\u0C41\u0C21\u0C41",subtitle:"\u0C2E\u0C40 \u0C21\u0C47\u0C1F\u0C3E \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F",ask:"\u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F",placeholder:"\u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 \u0C32\u0C47\u0C26\u0C3E \u0C06\u0C26\u0C47\u0C36\u0C02 \u0C1F\u0C48\u0C2A\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F...",listening:"\u0C35\u0C3F\u0C02\u0C1F\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41...",send:"\u0C2A\u0C02\u0C2A\u0C02\u0C21\u0C3F",close:"\u0C2E\u0C42\u0C38\u0C3F\u0C35\u0C47\u0C2F\u0C02\u0C21\u0C3F",open:"AI \u0C38\u0C39\u0C3E\u0C2F\u0C15\u0C41\u0C21\u0C3F\u0C28\u0C3F \u0C24\u0C46\u0C30\u0C35\u0C02\u0C21\u0C3F",inputLanguage:"\u0C07\u0C28\u0C4D\u200C\u0C2A\u0C41\u0C1F\u0C4D \u0C2D\u0C3E\u0C37",speakNow:"\u0C2E\u0C40 \u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C02\u0C21\u0C3F",working:"\u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41\u2026",english:"English",telugu:"\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",searchStarted:e=>`\u201C${e}\u201D \u0C15\u0C4B\u0C38\u0C02 \u0C36\u0C4B\u0C27\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.`,sortedAscending:e=>`${e}\u0C28\u0C41 \u0C06\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C3E\u0C28\u0C41.`,sortedDescending:e=>`${e}\u0C28\u0C41 \u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C3E\u0C28\u0C41.`,count:e=>`\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 ${e} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F.`,highest:(e,t,n)=>`\u0C05\u0C24\u0C4D\u0C2F\u0C27\u0C3F\u0C15 ${e} \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}. \u0C07\u0C26\u0C3F ${n}\u0C15\u0C41 \u0C38\u0C02\u0C2C\u0C02\u0C27\u0C3F\u0C02\u0C1A\u0C3F\u0C28\u0C26\u0C3F.`,lowest:(e,t,n)=>`\u0C05\u0C24\u0C4D\u0C2F\u0C32\u0C4D\u0C2A ${e} \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}. \u0C07\u0C26\u0C3F ${n}\u0C15\u0C41 \u0C38\u0C02\u0C2C\u0C02\u0C27\u0C3F\u0C02\u0C1A\u0C3F\u0C28\u0C26\u0C3F.`,average:(e,t)=>`${e} \u0C38\u0C17\u0C1F\u0C41 \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}.`,total:(e,t)=>`${e} \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}.`,noData:"\u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C21\u0C47\u0C1F\u0C3E \u0C32\u0C47\u0C26\u0C41.",noColumn:"\u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C24\u0C17\u0C3F\u0C28 \u0C15\u0C3E\u0C32\u0C2E\u0C4D \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.",noNumericData:e=>`${e}\u0C32\u0C4B \u0C38\u0C02\u0C16\u0C4D\u0C2F\u0C3E \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02 \u0C32\u0C47\u0C26\u0C41.`,notFound:e=>`\u201C${e}\u201D\u0C15\u0C41 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C32\u0C47 \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02 \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.`,needName:"\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C12\u0C15 \u0C35\u0C3F\u0C32\u0C41\u0C35 \u0C07\u0C35\u0C4D\u0C35\u0C02\u0C21\u0C3F.",fallback:"\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C36\u0C4B\u0C27\u0C28, \u0C15\u0C4D\u0C30\u0C2E\u0C2C\u0C26\u0C4D\u0C27\u0C40\u0C15\u0C30\u0C23, \u0C32\u0C46\u0C15\u0C4D\u0C15\u0C3F\u0C02\u0C2A\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C21\u0C47\u0C1F\u0C3E \u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C23 \u0C1A\u0C47\u0C2F\u0C17\u0C32\u0C28\u0C41.",unsupportedVoice:"\u0C08 \u0C2C\u0C4D\u0C30\u0C4C\u0C1C\u0C30\u0C4D\u200C\u0C32\u0C4B \u0C35\u0C3E\u0C2F\u0C3F\u0C38\u0C4D \u0C07\u0C28\u0C4D\u200C\u0C2A\u0C41\u0C1F\u0C4D\u200C\u0C15\u0C41 \u0C2E\u0C26\u0C4D\u0C26\u0C24\u0C41 \u0C32\u0C47\u0C26\u0C41."}};function Me(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function Qs(e,t){let n=Me(e);if(t==="te-IN")return/^(శోధించు|శోధించండి|వెతుకు|వెతకండి|చూపించు|చూపించండి|ఫిల్టర్)/.test(n)?{type:"search",payload:n.replace(/^(శోధించు|శోధించండి|వెతుకు|వెతకండి|చూపించు|చూపించండి|ఫిల్టర్)\s*/u,"").trim()||e}:/క్రమబద్ధీకర|అమర్చ|సార్ట్/.test(n)?{type:"sort",payload:{key:void 0,dir:/అవరోహణ|పెద్ద|అధిక|చివర/.test(n)?"desc":"asc"}}:/ఎన్ని|ఎంతమంది|లెక్క|మొత్తం వరుస|వరుసలు/.test(n)?{type:"question",payload:e}:/అత్యధిక|గరిష్ఠ|పెద్ద|ఎక్కువ/.test(n)?{type:"question",payload:e}:/అత్యల్ప|కనిష్ఠ|చిన్న|తక్కువ/.test(n)?{type:"question",payload:e}:/సగటు|సగటు విలువ/.test(n)?{type:"question",payload:e}:/మొత్తం|కలిపి/.test(n)?{type:"question",payload:e}:{type:"search",payload:e};if(/^(search|find|show|filter)/.test(n))return{type:"search",payload:n.replace(/^(search|find|show|filter)\s+(for\s+|by\s+)?/,"").trim()||e};if(/sort/.test(n)){let o=/desc|descending|high|higher|large|largest|top/.test(n);return{type:"sort",payload:{key:n.match(/(?:by|on)\s+([a-z0-9_-]+)/)?.[1],dir:o?"desc":"asc"}}}return/how many|count|highest|maximum|max|top|largest|lowest|minimum|min|smallest|bottom|average|avg|mean|sum|total|who|which|where|whose/.test(n)?{type:"question",payload:e}:{type:"search",payload:e}}function qr(e,t){let n=Me(e);return t.find(o=>{let r=Me(o.key),s=Me(o.label);return n.includes(r)||n.includes(s)})}function Xt(e,t){return e.toLocaleString(t==="te-IN"?"te-IN":"en-IN")}function Xs(e,t,n,o){let r=_r[o];if(t.length===0)return r.noData;let s=Me(e),i=n.filter(k=>k.type==="number"),a=qr(e,n),l=a?.type==="number"?a:i[0],c=/how many|count|rows|ఎన్ని|ఎంతమంది|లెక్క|వరుసలు/.test(s);if(c)return r.count(t.length);if(/highest|maximum|max|top|largest|అత్యధిక|గరిష్ఠ|పెద్ద|ఎక్కువ/.test(s)){let k=a??l;if(!k)return r.noColumn;let f=t.map(I=>({row:I,value:Number(I[k.key])})).filter(I=>!Number.isNaN(I.value)).sort((I,M)=>M.value-I.value);if(f.length===0)return r.noNumericData(k.label);let S=f[0],w=n.find(I=>I.key==="name"||Me(I.label)==="name"),E=w?String(S.row[w.key]??""):o==="te-IN"?"\u0C08 \u0C35\u0C30\u0C41\u0C38":"this row";return r.highest(k.label,Xt(S.value,o),E)}if(/lowest|minimum|min|smallest|bottom|అత్యల్ప|కనిష్ఠ|చిన్న|తక్కువ/.test(s)){let k=a??l;if(!k)return r.noColumn;let f=t.map(I=>({row:I,value:Number(I[k.key])})).filter(I=>!Number.isNaN(I.value)).sort((I,M)=>I.value-M.value);if(f.length===0)return r.noNumericData(k.label);let S=f[0],w=n.find(I=>I.key==="name"||Me(I.label)==="name"),E=w?String(S.row[w.key]??""):o==="te-IN"?"\u0C08 \u0C35\u0C30\u0C41\u0C38":"this row";return r.lowest(k.label,Xt(S.value,o),E)}if(/average|avg|mean|సగటు/.test(s)){let k=a??l;if(!k)return r.noColumn;let f=t.map(w=>Number(w[k.key])).filter(w=>!Number.isNaN(w));if(f.length===0)return r.noNumericData(k.label);let S=f.reduce((w,E)=>w+E,0)/f.length;return r.average(k.label,Xt(Math.round(S*100)/100,o))}if(/sum|total|మొత్తం|కలిపి/.test(s)&&!c){let k=a??l;if(!k)return r.noColumn;let f=t.map(w=>Number(w[k.key])).filter(w=>!Number.isNaN(w));if(f.length===0)return r.noNumericData(k.label);let S=f.reduce((w,E)=>w+E,0);return r.total(k.label,Xt(S,o))}let g=s.match(/[\p{L}\p{N}_-]+/gu)??[],b=new Set(["who","what","which","where","whose","is","the","has","have","show","find","search","for","by","about"]),y=g.filter(k=>!b.has(k)).join(" ").trim();if(y){let k=t.find(f=>Object.values(f).some(S=>String(S??"").toLowerCase().includes(y.toLowerCase())));return k?n.map(f=>`${f.label}: ${String(k[f.key]??"")}`).join(o==="te-IN"?" \xB7 ":", "):r.notFound(y)}return r.fallback}function Js(e,t){if(typeof window>"u"||!window.speechSynthesis)return;window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.lang=t,n.rate=1,n.pitch=1,window.speechSynthesis.speak(n)}function Zs(e){let[t,n]=(0,se.useState)(!1),[o,r]=(0,se.useState)(""),[s,i]=(0,se.useState)(!0),a=(0,se.useRef)(null);(0,se.useEffect)(()=>{if(typeof window>"u")return;let d=window.SpeechRecognition||window.webkitSpeechRecognition;if(!d){i(!1),a.current=null;return}let h=new d;return h.continuous=!1,h.interimResults=!1,h.lang=e,h.onresult=p=>{let m=p?.results?.[0]?.[0]?.transcript??"";r(m),n(!1)},h.onerror=()=>{n(!1)},h.onend=()=>{n(!1)},a.current=h,()=>{try{h.stop()}catch{}a.current=null}},[e]);let l=(0,se.useCallback)(()=>{if(a.current){r(""),n(!0);try{a.current.start()}catch{n(!1)}}},[]),c=(0,se.useCallback)(()=>{try{a.current?.stop()}catch{}n(!1)},[]);return{listening:t,transcript:o,supported:s,start:l,stop:c}}function ea(){return(0,L.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("circle",{cx:"11",cy:"11",r:"6.5"}),(0,L.jsx)("path",{d:"m16 16 5 5"})]})}function ta(){return(0,L.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("rect",{x:"8",y:"3",width:"8",height:"12",rx:"4"}),(0,L.jsx)("path",{d:"M5 11a7 7 0 0 0 14 0"}),(0,L.jsx)("path",{d:"M12 18v3"}),(0,L.jsx)("path",{d:"M8 21h8"})]})}function na(){return(0,L.jsxs)("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("path",{d:"m4 4 16 8-16 8 4-8-4-8Z"}),(0,L.jsx)("path",{d:"M8 12h12"})]})}function oa(){return(0,L.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("path",{d:"m6 6 12 12"}),(0,L.jsx)("path",{d:"m18 6-12 12"})]})}function ra({data:e,columns:t,onSearch:n,onSort:o,theme:r="light",language:s="en-US",inputLanguage:i="en-US",embedded:a=!1,agent:l,onInputLanguageChange:c}){let d=_r[s],[h,p]=(0,se.useState)(i);(0,se.useEffect)(()=>{p(i)},[i]);let[m,g]=(0,se.useState)(!1),b=r==="dark",[u,y]=(0,se.useState)(a),[k,f]=(0,se.useState)(""),[S,w]=(0,se.useState)([]),E=(0,se.useRef)(null),{listening:I,transcript:M,supported:H,start:O,stop:F}=Zs(h),$=(0,se.useMemo)(()=>({bg:b?"#0F172A":"#FFFFFF",surface:b?"#1E293B":"#F8FAFC",border:b?"#334155":"#E2E8F0",text:b?"#F1F5F9":"#0F172A",muted:b?"#94A3B8":"#64748B",accent:"#10B981",userMsg:b?"#334155":"#DBEAFE",aiMsg:b?"#1E293B":"#F0FDF4"}),[b]),x=(0,se.useMemo)(()=>({role:"ai",text:s==="te-IN"?"\u0C2E\u0C40 \u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D \u0C21\u0C47\u0C1F\u0C3E \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F.":"Ask me about your grid data.",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}),[s]);(0,se.useEffect)(()=>{w(W=>W.length>0?W:[x])},[x]),(0,se.useEffect)(()=>{E.current?.scrollIntoView({behavior:"smooth"})},[S]);let Y=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),j=(0,se.useCallback)(async W=>{let U=W.trim();if(!U)return;w(z=>[...z,{role:"user",text:U,time:Y()}]),f("");let R="";if(l){g(!0);try{R=(await l.ask(U)).message}catch{R=d.fallback}finally{g(!1)}}else{let z=Qs(U,s);if(z.type==="question")R=Xs(z.payload??U,e,t,s);else if(z.type==="search"){let ee=String(z.payload??U);n?.(ee),R=d.searchStarted(ee)}else if(z.type==="sort"){let ee=z.payload?.key,q=ee?t.find(ce=>Me(ce.key)===Me(ee)||Me(ce.label)===Me(ee)):void 0;if(q||(q=qr(U,t)),q&&o){let ce=z.payload?.dir==="desc"?"desc":"asc";o(String(q.key),ce),R=ce==="asc"?d.sortedAscending(q.label):d.sortedDescending(q.label)}else R=d.noColumn}}R||(R=d.fallback),w(z=>[...z,{role:"ai",text:R,time:Y()}]),Js(R,s)},[l,t,e,s,n,o,d]);(0,se.useEffect)(()=>{M&&j(M)},[M,j]);let J=()=>{j(k)},ie=s==="te-IN"?["\u0C0E\u0C28\u0C4D\u0C28\u0C3F \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41","\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F","\u0C15\u0C4D\u0C30\u0C2E\u0C02"]:["how many rows","search","sort"],ge=(0,L.jsxs)("div",{style:{width:a?"100%":360,maxWidth:a?"100%":"calc(100vw - 48px)",height:a?390:480,maxHeight:"70vh",background:$.bg,border:`1px solid ${$.border}`,borderRadius:a?12:16,boxShadow:a?"none":"0 20px 40px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[(0,L.jsxs)("div",{style:{padding:"12px 14px",background:$.accent,color:"#FFFFFF",display:"flex",alignItems:"center",gap:10},children:[(0,L.jsx)("div",{style:{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.18)",fontSize:17},children:"AI"}),(0,L.jsxs)("div",{style:{flex:1,minWidth:0},children:[(0,L.jsx)("div",{style:{fontWeight:700,fontSize:14},children:d.title}),(0,L.jsx)("div",{style:{fontSize:11,opacity:.9},children:d.subtitle})]}),!a&&(0,L.jsx)("button",{type:"button",onClick:()=>y(!1),"aria-label":d.close,title:d.close,style:{width:32,height:32,border:"none",borderRadius:8,background:"rgba(255,255,255,0.12)",color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:(0,L.jsx)(oa,{})})]}),(0,L.jsxs)("div",{style:{padding:"8px 10px",borderBottom:`1px solid ${$.border}`,display:"flex",alignItems:"center",gap:8,background:$.surface},children:[(0,L.jsx)("span",{style:{fontSize:11,color:$.muted},children:d.inputLanguage}),(0,L.jsxs)("select",{value:h,onChange:W=>{let U=W.target.value;p(U),c?.(U)},disabled:I,"aria-label":d.inputLanguage,style:{padding:"5px 8px",borderRadius:7,border:`1px solid ${$.border}`,background:$.bg,color:$.text,fontSize:11},children:[(0,L.jsx)("option",{value:"en-US",children:"English (US)"}),(0,L.jsx)("option",{value:"en-IN",children:"English (India)"}),(0,L.jsx)("option",{value:"as-IN",children:"Assamese"}),(0,L.jsx)("option",{value:"bn-IN",children:"Bengali"}),(0,L.jsx)("option",{value:"brx-IN",children:"Bodo"}),(0,L.jsx)("option",{value:"doi-IN",children:"Dogri"}),(0,L.jsx)("option",{value:"gu-IN",children:"Gujarati"}),(0,L.jsx)("option",{value:"hi-IN",children:"Hindi"}),(0,L.jsx)("option",{value:"kn-IN",children:"Kannada"}),(0,L.jsx)("option",{value:"ks-IN",children:"Kashmiri"}),(0,L.jsx)("option",{value:"kok-IN",children:"Konkani"}),(0,L.jsx)("option",{value:"mai-IN",children:"Maithili"}),(0,L.jsx)("option",{value:"ml-IN",children:"Malayalam"}),(0,L.jsx)("option",{value:"mni-IN",children:"Manipuri"}),(0,L.jsx)("option",{value:"mr-IN",children:"Marathi"}),(0,L.jsx)("option",{value:"ne-IN",children:"Nepali"}),(0,L.jsx)("option",{value:"or-IN",children:"Odia"}),(0,L.jsx)("option",{value:"pa-IN",children:"Punjabi"}),(0,L.jsx)("option",{value:"sa-IN",children:"Sanskrit"}),(0,L.jsx)("option",{value:"sat-IN",children:"Santali"}),(0,L.jsx)("option",{value:"sd-IN",children:"Sindhi"}),(0,L.jsx)("option",{value:"ta-IN",children:"Tamil"}),(0,L.jsx)("option",{value:"te-IN",children:"Telugu"}),(0,L.jsx)("option",{value:"ur-IN",children:"Urdu"})]})]}),(0,L.jsxs)("div",{style:{flex:1,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:8},children:[S.map((W,U)=>(0,L.jsxs)("div",{style:{alignSelf:W.role==="user"?"flex-end":"flex-start",maxWidth:"88%",padding:"8px 11px",borderRadius:11,background:W.role==="user"?$.userMsg:$.aiMsg,color:$.text,fontSize:13,lineHeight:1.5},children:[(0,L.jsx)("div",{children:W.text}),(0,L.jsx)("div",{style:{marginTop:3,fontSize:10,opacity:.55,textAlign:"right"},children:W.time})]},`${W.time}-${U}`)),I&&(0,L.jsx)("div",{style:{alignSelf:"flex-end",padding:"8px 11px",borderRadius:11,background:b?"#3F1D2E":"#FEE2E2",color:b?"#FCA5A5":"#991B1B",fontSize:13},children:d.listening}),(m||l?.loading)&&(0,L.jsx)("div",{role:"status","aria-live":"polite",style:{alignSelf:"flex-start",padding:"8px 11px",borderRadius:11,background:$.aiMsg,color:$.muted,fontSize:13},children:d.working}),(0,L.jsx)("div",{ref:E})]}),(0,L.jsx)("div",{style:{padding:"7px 10px",borderTop:`1px solid ${$.border}`,display:"flex",gap:6,overflowX:"auto",flexShrink:0},children:ie.map(W=>(0,L.jsx)("button",{type:"button",onClick:()=>j(W),style:{padding:"5px 9px",borderRadius:12,border:`1px solid ${$.border}`,background:$.surface,color:$.text,fontSize:10.5,cursor:"pointer",whiteSpace:"nowrap"},children:W},W))}),(0,L.jsxs)("div",{style:{padding:9,display:"flex",gap:6,borderTop:`1px solid ${$.border}`,background:$.surface},children:[(0,L.jsxs)("div",{style:{position:"relative",flex:1},children:[(0,L.jsx)(ea,{}),(0,L.jsx)("input",{type:"text",value:k,onChange:W=>f(W.target.value),onKeyDown:W=>{W.key==="Enter"&&J()},placeholder:d.placeholder,"aria-label":d.ask,style:{width:"100%",boxSizing:"border-box",padding:"9px 10px 9px 34px",borderRadius:8,border:`1px solid ${$.border}`,background:$.bg,color:$.text,fontSize:12,outline:"none"}})]}),H?(0,L.jsx)("button",{type:"button",onClick:I?F:O,"aria-label":I?d.listening:d.speakNow,title:I?d.listening:d.speakNow,style:{width:38,height:38,border:"none",borderRadius:8,background:I?"#EF4444":$.accent,color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0},children:(0,L.jsx)(ta,{})}):null,(0,L.jsx)("button",{type:"button",onClick:J,disabled:!k.trim(),"aria-label":d.send,title:d.send,style:{width:38,height:38,border:"none",borderRadius:8,background:k.trim()?$.accent:$.muted,color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:k.trim()?"pointer":"not-allowed",opacity:k.trim()?1:.6,flexShrink:0},children:(0,L.jsx)(na,{})})]})]});return a?(0,L.jsx)("div",{style:{width:"100%",minWidth:0},children:u?ge:(0,L.jsxs)("button",{type:"button",onClick:()=>y(!0),"aria-label":d.open,style:{minHeight:40,padding:"8px 13px",borderRadius:9,border:"1px solid #10B981",background:b?"#064E3B":"#ECFDF5",color:b?"#A7F3D0":"#047857",display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,fontWeight:600},children:[(0,L.jsx)("span",{"aria-hidden":"true",children:"AI"}),d.ask]})}):(0,L.jsxs)(L.Fragment,{children:[!u&&(0,L.jsx)("button",{type:"button",onClick:()=>y(!0),"aria-label":d.open,title:d.title,style:{position:"fixed",bottom:24,right:24,zIndex:9998,width:56,height:56,borderRadius:28,background:$.accent,color:"#FFFFFF",border:"none",cursor:"pointer",boxShadow:"0 8px 20px rgba(16,185,129,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14},children:"AI"}),u&&(0,L.jsx)("div",{style:{position:"fixed",bottom:90,right:24,zIndex:9997},children:ge}),(0,L.jsx)("style",{children:`
        @keyframes yuktai-ai-pulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.05);
          }
        }
      `})]})}var Jt=ra;C();var be=require("react");C();var ia={en:{found:e=>`${e} row(s) found.`,count:e=>`${e} row(s).`,columns:"Grid columns retrieved.",rowFound:"Row found.",notFound:e=>`Row "${e}" not found.`,noneFound:"None of the given rows were found.",highlighted:e=>`${e} row(s) highlighted.`,selected:e=>`Row "${e}" selected.`,opened:e=>`Row "${e}" opened.`,notSupported:e=>`This grid does not support "${e}".`,emptyQuery:"Please enter something to search.",noIds:"No row IDs were given.",unknownColumn:e=>`Unknown column "${e}".`,badOperator:e=>`Unknown filter operator "${e}".`,badValue:"The filter value is not valid for this column.",filtered:e=>`Filter applied: ${e} row(s) match.`,filtersCleared:"All filters cleared.",sorted:(e,t)=>`Sorted by ${e} (${t==="asc"?"ascending":"descending"}).`,sortCleared:"Sorting cleared.",internal:"Something went wrong while running this action."},te:{found:e=>`${e} \u0C35\u0C30\u0C41\u0C38(\u0C32\u0C41) \u0C26\u0C4A\u0C30\u0C3F\u0C15\u0C3E\u0C2F\u0C3F.`,count:e=>`\u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 ${e} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41.`,columns:"\u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C32 \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41.",rowFound:"\u0C35\u0C30\u0C41\u0C38 \u0C26\u0C4A\u0C30\u0C3F\u0C15\u0C3F\u0C02\u0C26\u0C3F.",notFound:e=>`"${e}" \u0C35\u0C30\u0C41\u0C38 \u0C26\u0C4A\u0C30\u0C15\u0C32\u0C47\u0C26\u0C41.`,noneFound:"\u0C07\u0C1A\u0C4D\u0C1A\u0C3F\u0C28 \u0C35\u0C30\u0C41\u0C38\u0C32\u0C47\u0C35\u0C40 \u0C26\u0C4A\u0C30\u0C15\u0C32\u0C47\u0C26\u0C41.",highlighted:e=>`${e} \u0C35\u0C30\u0C41\u0C38(\u0C32\u0C41) \u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D \u0C1A\u0C47\u0C36\u0C3E\u0C28\u0C41.`,selected:e=>`"${e}" \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.`,opened:e=>`"${e}" \u0C24\u0C46\u0C30\u0C3F\u0C1A\u0C3E\u0C28\u0C41.`,notSupported:e=>`\u0C08 \u0C2A\u0C1F\u0C4D\u0C1F\u0C3F\u0C15\u0C32\u0C4B "${e}" \u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C32\u0C47\u0C26\u0C41.`,emptyQuery:"\u0C35\u0C46\u0C24\u0C15\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C0F\u0C26\u0C48\u0C28\u0C3E \u0C30\u0C3E\u0C2F\u0C02\u0C21\u0C3F.",noIds:"\u0C35\u0C30\u0C41\u0C38 ID\u0C32\u0C41 \u0C07\u0C35\u0C4D\u0C35\u0C32\u0C47\u0C26\u0C41.",unknownColumn:e=>`"${e}" \u0C05\u0C28\u0C47 \u0C15\u0C3E\u0C32\u0C2E\u0C4D \u0C32\u0C47\u0C26\u0C41.`,badOperator:e=>`"${e}" \u0C05\u0C28\u0C47 \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C3F\u0C27\u0C3E\u0C28\u0C02 \u0C32\u0C47\u0C26\u0C41.`,badValue:"\u0C08 \u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C15\u0C3F \u0C08 \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C3F\u0C32\u0C41\u0C35 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C26\u0C41.",filtered:e=>`\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C47\u0C36\u0C3E\u0C28\u0C41: ${e} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C2F\u0C3E\u0C2F\u0C3F.`,filtersCleared:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C28\u0C4D\u0C28\u0C40 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C28\u0C41.",sorted:(e,t)=>`${e} \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02 (${t==="asc"?"\u0C06\u0C30\u0C4B\u0C39\u0C23":"\u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23"}).`,sortCleared:"\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C28\u0C41.",internal:"\u0C08 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C21\u0C17\u0C3E \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F."}};function $e(e){return ia[e.locale??"en"]}function Pe(e,t){return{success:!0,message:e,data:t}}function le(e,t){return{success:!1,message:t,error:{code:e}}}var Ur=["contains","equals","startsWith","endsWith","greaterThan","lessThan","between"];function me(e,t="id"){let n=e?.[t];return n==null?"":String(n)}function et(e){return String(e??"").normalize("NFC").toLowerCase().trim()}function Vr(e){if(typeof e=="number")return Number.isFinite(e)?e:null;let t=String(e??"").trim();if(t==="")return null;let n=Number(t);return Number.isFinite(n)?n:null}function Yr(e){if(e instanceof Date)return e.getTime();let t=new Date(String(e??"")).getTime();return Number.isFinite(t)?t:null}function Kr(e){return(Array.isArray(e)?e:typeof e=="string"?e.split(","):[]).map(n=>String(n).trim()).filter(Boolean)}function Gn(e,t){let n=et(t);return e.columns.find(o=>et(o.key)===n||et(o.label)===n)}function Zt(e,t){return e.data.find(n=>me(n,e.rowKey)===t)}function sa(e,t){return e[t]}function aa(e,t,n){let o=sa(e,n.key),r=n.type??"text";if(r==="number"||r==="date"){let a=r==="number"?Vr:Yr,l=a(o);if(l===null)return!1;if(t.operator==="between"){let[d,h]=t.value,p=a(d),m=a(h);return p!==null&&m!==null&&l>=Math.min(p,m)&&l<=Math.max(p,m)}let c=a(t.value);if(c===null)return!1;switch(t.operator){case"equals":return l===c;case"greaterThan":return l>c;case"lessThan":return l<c;default:break}}let s=et(o),i=et(t.value);switch(t.operator){case"equals":return s===i;case"startsWith":return s.startsWith(i);case"endsWith":return s.endsWith(i);case"contains":return s.includes(i);default:return!1}}function la(e,t){let n=t.type??"text",o=n==="date"?Yr:Vr;return e.operator==="between"?n==="text"||!Array.isArray(e.value)||e.value.length!==2?!1:o(e.value[0])!==null&&o(e.value[1])!==null:e.operator==="greaterThan"||e.operator==="lessThan"?n!=="text"&&o(e.value)!==null:!Array.isArray(e.value)&&String(e.value).trim()!==""}function _e(e,t,n){return n.length?Qr({data:e,columns:t},n):e}function Qe(e){return e.map(t=>({key:String(t.key),label:t.label,type:t.type==="number"?"number":t.type==="date"?"date":"text"}))}function Qr(e,t){return e.data.filter(n=>t.every(o=>{let r=Gn(e,o.key);return r?aa(n,o,r):!0}))}function zn(e,t){let n=$e(e),o=et(t);if(!o)return le("INVALID_INPUT",n.emptyQuery);let r=e.data.filter(i=>e.columns.some(a=>et(i[a.key]).includes(o))),s=r.map(i=>me(i,e.rowKey)).filter(Boolean);return e.onHighlightRows?.(s),Pe(n.found(r.length),r)}function On(e){return Pe($e(e).count(e.data.length),e.data.length)}function Dn(e){return Pe($e(e).columns,e.columns)}function Wn(e,t){let n=$e(e),o=String(t??"").trim();if(!o)return le("INVALID_INPUT",n.noIds);let r=Zt(e,o);return r?Pe(n.rowFound,r):le("NOT_FOUND",n.notFound(o))}function gt(e,t){let n=$e(e),o=Kr(t);if(o.length===0)return le("INVALID_INPUT",n.noIds);if(!e.onHighlightRows)return le("NOT_SUPPORTED",n.notSupported("highlight"));let r=o.filter(s=>Zt(e,s)!==void 0);return r.length===0?le("NOT_FOUND",n.noneFound):(e.onHighlightRows(r),Pe(n.highlighted(r.length),r))}function At(e,t){let n=$e(e),o=String(t??"").trim();return o?e.onSelectRow?Zt(e,o)?(e.onSelectRow(o),Pe(n.selected(o),o)):le("NOT_FOUND",n.notFound(o)):le("NOT_SUPPORTED",n.notSupported("select")):le("INVALID_INPUT",n.noIds)}function Ct(e,t){let n=$e(e),o=String(t??"").trim();return o?e.onOpenRow?Zt(e,o)?(e.onOpenRow(o),Pe(n.opened(o),o)):le("NOT_FOUND",n.notFound(o)):le("NOT_SUPPORTED",n.notSupported("open")):le("INVALID_INPUT",n.noIds)}function Bn(e,t){let n=$e(e),o=Gn(e,t?.key??"");if(!o)return le("INVALID_INPUT",n.unknownColumn(String(t?.key??"")));if(!Ur.includes(t.operator))return le("INVALID_INPUT",n.badOperator(String(t.operator)));let r={...t,key:o.key};if(!la(r,o))return le("INVALID_INPUT",n.badValue);if(!e.onFiltersChange)return le("NOT_SUPPORTED",n.notSupported("filter"));let s=[...(e.filters??[]).filter(a=>a.key!==o.key),r],i=Qr(e,s).length;return e.onFiltersChange(s),Pe(n.filtered(i),{filters:s,count:i})}function Hn(e){let t=$e(e);return e.onFiltersChange?(e.onFiltersChange([]),Pe(t.filtersCleared,[])):le("NOT_SUPPORTED",t.notSupported("clear filters"))}function _n(e,t,n="asc"){let o=$e(e),r=Gn(e,t);if(!r)return le("INVALID_INPUT",o.unknownColumn(String(t)));if(n!=="asc"&&n!=="desc")return le("INVALID_INPUT",o.badValue);if(!e.onSortChange)return le("NOT_SUPPORTED",o.notSupported("sort"));let s={key:r.key,direction:n};return e.onSortChange(s),Pe(o.sorted(r.label,n),s)}function qn(e){let t=$e(e);return e.onSortChange?(e.onSortChange(null),Pe(t.sortCleared,null)):le("NOT_SUPPORTED",t.notSupported("clear sort"))}var ca={search:"Search all columns for text. Matching rows are highlighted.",count:"Count the rows currently in the grid.",columns:"List the grid's columns with their keys, labels and types.",get_row:"Get one row by its ID.",highlight:"Highlight one or more rows by ID without filtering the grid.",select:"Select one row by ID.",open:"Open one row by ID to show its full details.",filter:"Filter the grid by one column. Replaces any existing filter on that column.",clear_filters:"Remove all filters.",sort:"Sort the grid by one column, ascending or descending.",clear_sort:"Remove sorting."},jr={en:{search:"Search",count:"Count",columns:"Columns",get_row:"Get row",highlight:"Highlight",select:"Select",open:"Open",filter:"Filter",clear_filters:"Clear filters",sort:"Sort",clear_sort:"Clear sort"},te:{search:"\u0C35\u0C46\u0C24\u0C41\u0C15\u0C41",count:"\u0C32\u0C46\u0C15\u0C4D\u0C15",columns:"\u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C32\u0C41",get_row:"\u0C35\u0C30\u0C41\u0C38 \u0C1A\u0C42\u0C2A\u0C41",highlight:"\u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D",select:"\u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B",open:"\u0C24\u0C46\u0C30\u0C41\u0C35\u0C41",filter:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D",clear_filters:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F",sort:"\u0C15\u0C4D\u0C30\u0C2E\u0C02",clear_sort:"\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F"}};async function da(e,t){try{return t()}catch{return le("INTERNAL",$e(e).internal)}}function mt(e,t={}){let n=t.name??"yuktai_grid",o=jr[e.locale??"en"],r=l=>t.descriptions?.[l]??ca[l],s={id:{type:"string",description:"Row ID"}},i=e.columns.map(l=>l.key);return[{id:"search",available:!0,schema:{type:"object",properties:{query:{type:"string"}},required:["query"]},run:l=>zn(e,String(l.query??""))},{id:"count",available:!0,schema:{type:"object",properties:{}},run:()=>On(e)},{id:"columns",available:!0,schema:{type:"object",properties:{}},run:()=>Dn(e)},{id:"get_row",available:!0,schema:{type:"object",properties:s,required:["id"]},run:l=>Wn(e,String(l.id??""))},{id:"highlight",available:!!e.onHighlightRows,schema:{type:"object",properties:{ids:{type:"array",items:{type:"string"},description:"Row IDs"}},required:["ids"]},run:l=>gt(e,Kr(l.ids))},{id:"select",available:!!e.onSelectRow,schema:{type:"object",properties:s,required:["id"]},run:l=>At(e,String(l.id??""))},{id:"open",available:!!e.onOpenRow,schema:{type:"object",properties:s,required:["id"]},run:l=>Ct(e,String(l.id??""))},{id:"filter",available:!!e.onFiltersChange,schema:{type:"object",properties:{key:{type:"string",enum:i},operator:{type:"string",enum:Ur},value:{description:"Text or number; for 'between' an array of two numbers or dates"}},required:["key","operator","value"]},run:l=>Bn(e,{key:String(l.key??""),operator:String(l.operator??""),value:l.value})},{id:"clear_filters",available:!!e.onFiltersChange,schema:{type:"object",properties:{}},run:()=>Hn(e)},{id:"sort",available:!!e.onSortChange,schema:{type:"object",properties:{key:{type:"string",enum:i},direction:{type:"string",enum:["asc","desc"]}},required:["key"]},run:l=>_n(e,String(l.key??""),l.direction==="desc"?"desc":"asc")},{id:"clear_sort",available:!!e.onSortChange,schema:{type:"object",properties:{}},run:()=>qn(e)}].filter(l=>l.available).map(l=>({name:`${n}_${l.id}`,title:jr.en[l.id],description:r(l.id),label:o[l.id],inputSchema:l.schema,execute:c=>da(e,()=>l.run(c??{}))}))}var ua={en:{done:"Done.",toolMissing:e=>`The action "${e}" is not available here.`,missingInput:e=>`Missing: ${e}.`,notUnderstood:"Sorry, I didn't understand. Try: a word to search, \u201Csort by <column>\u201D, or \u201Cclear filters\u201D.",noMatch:e=>`Nothing matched "${e}".`,failed:"Something went wrong while running this action."},te:{done:"\u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C2F\u0C3F\u0C02\u0C26\u0C3F.",toolMissing:e=>`"${e}" \u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C07\u0C15\u0C4D\u0C15\u0C21 \u0C05\u0C02\u0C26\u0C41\u0C2C\u0C3E\u0C1F\u0C41\u0C32\u0C4B \u0C32\u0C47\u0C26\u0C41.`,missingInput:e=>`\u0C07\u0C35\u0C3F \u0C15\u0C3E\u0C35\u0C3E\u0C32\u0C3F: ${e}.`,notUnderstood:"\u0C15\u0C4D\u0C37\u0C2E\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F, \u0C05\u0C30\u0C4D\u0C25\u0C02 \u0C15\u0C3E\u0C32\u0C47\u0C26\u0C41. \u0C07\u0C32\u0C3E \u0C2A\u0C4D\u0C30\u0C2F\u0C24\u0C4D\u0C28\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F: \u0C35\u0C46\u0C24\u0C15\u0C3E\u0C32\u0C4D\u0C38\u0C3F\u0C28 \u0C2A\u0C26\u0C02, \u201C<\u0C15\u0C3E\u0C32\u0C2E\u0C4D> \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u201D, \u0C32\u0C47\u0C26\u0C3E \u201C\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F\u201D.",noMatch:e=>`"${e}" \u0C15\u0C3F \u0C0F\u0C2E\u0C40 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C32\u0C47\u0C26\u0C41.`,failed:"\u0C08 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C21\u0C17\u0C3E \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F."}},Xr=e=>e.normalize("NFC").toLowerCase().trim(),Xe={clearFilters:/\b(clear|remove|reset)\b.*\bfilters?\b|ఫిల్టర్.*(తీసే|తొలగ)/i,clearSort:/\b(clear|remove|reset)\b.*\bsort(ing)?\b|క్రమం.*(తీసే|తొలగ)/i,count:/^\s*(how many|count)\b|ఎన్ని|లెక్క/i,sort:/\bsort\b|\border by\b|క్రమ|అమర్చ|సార్ట్/i,desc:/\b(desc|descending|z\s*-\s*a|highest|largest|most)\b|అవరోహణ|తగ్గే|పెద్ద|అధిక|చివర|ఎక్కువ నుండి/i,openEn:/^\s*open\s+(.+?)\s*$/i,openTe:/^\s*(.+?)\s*(తెరువు|తెరవండి|తెరవు)\s*$/,searchFiller:/^\s*(search(\s+for)?|find|show(\s+me)?|filter(\s+by)?|look\s+for|వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s+|\s+(వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s*$/gi};function pa(e,t){let n=Xr(e),o=null;for(let r of t)for(let s of[r.label,r.key]){let i=Xr(s);i&&n.includes(i)&&(!o||i.length>o.len)&&(o={key:r.key,len:i.length})}return o?.key??null}function jn(e,t){let n=(e??"").trim();if(!n)return null;if(Xe.clearFilters.test(n))return{kind:"tool",tool:"clear_filters",input:{}};if(Xe.clearSort.test(n))return{kind:"tool",tool:"clear_sort",input:{}};if(Xe.count.test(n))return{kind:"tool",tool:"count",input:{}};if(Xe.sort.test(n)){let s=pa(n,t.columns);return s?{kind:"tool",tool:"sort",input:{key:s,direction:Xe.desc.test(n)?"desc":"asc"}}:null}let o=n.match(Xe.openEn)??n.match(Xe.openTe);if(o?.[1])return{kind:"open",text:o[1].trim()};let r=n.replace(Xe.searchFiller,"").trim();return r?{kind:"tool",tool:"search",input:{query:r}}:null}function ga(e){return!!e&&typeof e=="object"&&typeof e.success=="boolean"&&typeof e.message=="string"}function ma(e,t){let n=e.inputSchema?.required;return Array.isArray(n)?n.map(String).filter(o=>t[o]===void 0||t[o]===null||String(t[o]).trim()===""):[]}function fa(e,t){let n=e.find(r=>r.name===t);if(n)return n;let o=e.filter(r=>r.name.endsWith(`_${t}`)).sort((r,s)=>r.name.length-s.name.length);if(o.length!==0&&!(o.length>1&&o[0].name.length===o[1].name.length))return o[0]}function Jr(e){return e.normalize("NFC").trim().toLocaleLowerCase()}function ha(e,t){let n=Jr(e);return t.find(o=>o.phrases.some(r=>{let s=Jr(r);return s.length>0&&n.includes(s)}))}function Rt({tools:e,data:t=[],onResult:n,onError:o,locale:r="en",columns:s=[],rowKey:i="id",parseIntent:a,customRules:l=[],historyLimit:c=20}){let d=ua[r],[h,p]=(0,be.useState)(0),[m,g]=(0,be.useState)(null),[b,u]=(0,be.useState)(null),[y,k]=(0,be.useState)([]),f=(0,be.useRef)({tools:e,data:t,onResult:n,onError:o,columns:s,rowKey:i,parseIntent:a,customRules:l,historyLimit:c,m:d,locale:r});f.current={tools:e,data:t,onResult:n,onError:o,columns:s,rowKey:i,parseIntent:a,customRules:l,historyLimit:c,m:d,locale:r};let S=(0,be.useRef)(!0),w=(0,be.useRef)(0);(0,be.useEffect)(()=>(S.current=!0,()=>{S.current=!1}),[]);let E=(0,be.useCallback)((F,$,x,Y,j)=>{S.current&&(j===w.current&&g(x),k(J=>[...J,{id:j,tool:F,input:$,result:x,source:Y,at:Date.now()}].slice(-f.current.historyLimit)))},[]),I=(0,be.useCallback)(async(F,$,x)=>{let{tools:Y,onResult:j,onError:J,m:ie}=f.current,ge=++w.current,W=fa(Y,F);if(!W){let R={success:!1,message:ie.toolMissing(F),error:{code:"NOT_SUPPORTED"}},z=new Error(R.message);return S.current&&u(z),J?.(z),E(F,$,R,x,ge),R}let U=ma(W,$);if(U.length){let R={success:!1,message:ie.missingInput(U.join(", ")),error:{code:"INVALID_INPUT"},tool:W.name};return E(W.name,$,R,x,ge),j?.(R),R}S.current&&p(R=>R+1);try{let R=await W.execute($),z=ga(R)?{...R,tool:W.name}:{success:!0,message:ie.done,data:R,tool:W.name};return S.current&&z.success&&u(null),E(W.name,$,z,x,ge),j?.(z),z}catch(R){let z=R instanceof Error?R:new Error(String(R)),ee={success:!1,message:ie.failed,error:{code:"INTERNAL"},tool:W.name};return S.current&&u(z),J?.(z),E(W.name,$,ee,x,ge),ee}finally{S.current&&p(R=>Math.max(0,R-1))}},[E]),M=(0,be.useCallback)((F,$={})=>I(F,$??{},"tool"),[I]),H=(0,be.useCallback)(async F=>{let{columns:$,locale:x,parseIntent:Y,customRules:j,data:J,m:ie,rowKey:ge}=f.current,W=ha(F,j??[]);if(W){let q={input:F,data:J,columns:$,executeTool:M};try{let he={success:!0,message:await W.execute(q),tool:`rule:${W.name}`};return E(`rule:${W.name}`,{text:F},he,"ask",++w.current),f.current.onResult?.(he),he}catch(ce){let he=ce instanceof Error?ce:new Error(String(ce)),Ae={success:!1,message:ie.failed,error:{code:"INTERNAL"},tool:`rule:${W.name}`};return S.current&&u(he),f.current.onError?.(he),E(`rule:${W.name}`,{text:F},Ae,"ask",++w.current),Ae}}let R=(Y??jn)(F,{columns:$,locale:x});if(!R){let q={success:!1,message:ie.notUnderstood,error:{code:"NOT_UNDERSTOOD"}};return E("ask",{text:F},q,"ask",++w.current),q}if(R.kind==="tool")return I(R.tool,R.input,"ask");let z=await I("search",{query:R.text},"ask"),ee=Array.isArray(z.data)?z.data:[];if(!z.success)return z;if(ee.length===0){let q={success:!1,message:ie.noMatch(R.text),error:{code:"NOT_FOUND"},tool:z.tool};return E("open",{text:R.text},q,"ask",++w.current),q}return I("open",{id:me(ee[0],ge)},"ask")},[M,E,I]),O=(0,be.useCallback)(()=>{k([]),g(null),u(null)},[]);return{loading:h>0,tools:e,executeTool:M,ask:H,lastResult:m,lastError:b,history:y,clearHistory:O}}var Zr=Rt;C();var Je=require("react");function ba(e){return JSON.stringify(e.map(t=>[t.name,t.title,t.description,t.inputSchema]))}function ya({tools:e,data:t=[],columns:n=[],rowKey:o,locale:r,onSelectRow:s,onHighlightRows:i,onOpenRow:a,name:l="yuktai_grid",descriptions:c,onStatusChange:d}){let h=(0,Je.useMemo)(()=>e||mt({data:t,columns:n,rowKey:o,locale:r,onSelectRow:s,onHighlightRows:i,onOpenRow:a},{name:l,descriptions:c}),[e,t,n,o,r,s,i,a,l,c]),p=(0,Je.useRef)(h);p.current=h;let m=(0,Je.useRef)(d);m.current=d;let g=(0,Je.useRef)(Promise.resolve()),b=ba(h);return(0,Je.useEffect)(()=>{let u=w=>m.current?.(w),y=typeof document<"u"?document.modelContext:void 0;if(!y?.registerTool){u({state:"unsupported",registered:[],errors:[]});return}let k=new AbortController,f=p.current,S=g.current.then(async()=>{if(k.signal.aborted)return;u({state:"registering",registered:[],errors:[]});let w=[],E=[];for(let I of f){if(k.signal.aborted)return;try{await y.registerTool({name:I.name,title:I.title,description:I.description,inputSchema:I.inputSchema,execute:M=>{let H=p.current.find(O=>O.name===I.name);return H?H.execute(M??{}):{success:!1,message:`Tool "${I.name}" is no longer available.`,error:{code:"NOT_SUPPORTED"}}}},{signal:k.signal}),w.push(I.name)}catch(M){E.push({tool:I.name,message:M instanceof Error?M.message:String(M)})}}k.signal.aborted||u({state:E.length===0?"ready":w.length>0?"partial":"error",registered:w,errors:E})});return g.current=S.catch(()=>{}),()=>k.abort()},[b]),null}var Et=ya;var P=require("react/jsx-runtime"),xa={"en-US":{search:"Search...",searchAria:"Search grid",rows:"rows",row:"row",loading:"Loading...",noData:"No data found.",selectRow:"Select row",pageSize:"Page size",page:"Page",of:"of",previous:"Previous",next:"Next",yes:"Yes",no:"No",sortAscending:"Sort ascending",sortDescending:"Sort descending",filtersActive:e=>`${e} filter(s) applied`,clearFilters:"Clear filters"},"te-IN":{search:"\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F...",searchAria:"\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F",rows:"\u0C35\u0C30\u0C41\u0C38\u0C32\u0C41",row:"\u0C35\u0C30\u0C41\u0C38",loading:"\u0C32\u0C4B\u0C21\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F...",noData:"\u0C21\u0C47\u0C1F\u0C3E \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.",selectRow:"\u0C35\u0C30\u0C41\u0C38\u0C28\u0C41 \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F",pageSize:"\u0C2A\u0C47\u0C1C\u0C40 \u0C2A\u0C30\u0C3F\u0C2E\u0C3E\u0C23\u0C02",page:"\u0C2A\u0C47\u0C1C\u0C40",of:"\u0C32\u0C4B",previous:"\u0C35\u0C46\u0C28\u0C41\u0C15\u0C15\u0C41",next:"\u0C2E\u0C41\u0C02\u0C26\u0C41\u0C15\u0C41",yes:"\u0C05\u0C35\u0C41\u0C28\u0C41",no:"\u0C15\u0C3E\u0C26\u0C41",sortAscending:"\u0C06\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C02\u0C21\u0C3F",sortDescending:"\u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C02\u0C21\u0C3F",filtersActive:e=>`${e} \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D(\u0C32\u0C41) \u0C35\u0C47\u0C36\u0C3E\u0C30\u0C41`,clearFilters:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C02\u0C21\u0C3F"}};function wa({size:e=20,color:t="currentColor",strokeWidth:n=2.4}){return(0,P.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,P.jsx)("circle",{cx:"11",cy:"11",r:"6.5"}),(0,P.jsx)("path",{d:"m16 16 5 5"})]})}function va({size:e=18,color:t="currentColor",strokeWidth:n=2.4,label:o}){return(0,P.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":o?void 0:!0,"aria-label":o,role:o?"img":void 0,children:[o?(0,P.jsx)("title",{children:o}):null,(0,P.jsx)("path",{d:"m6 15 6-6 6 6"})]})}function ka({size:e=18,color:t="currentColor",strokeWidth:n=2.4,label:o}){return(0,P.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":o?void 0:!0,"aria-label":o,role:o?"img":void 0,children:[o?(0,P.jsx)("title",{children:o}):null,(0,P.jsx)("path",{d:"m6 9 6 6 6-6"})]})}function Sa({size:e=20,color:t="currentColor",strokeWidth:n=2.4}){return(0,P.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,P.jsx)("path",{d:"m15 18-6-6 6-6"})})}function Ta({size:e=20,color:t="currentColor",strokeWidth:n=2.4}){return(0,P.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,P.jsx)("path",{d:"m9 18 6-6-6-6"})})}function ei({size:e=18,color:t="currentColor",strokeWidth:n=2.4}){return(0,P.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,P.jsx)("path",{d:"m5 12 4 4L19 6"})})}function ti({data:e,columns:t,rowKey:n="id",view:o="auto",mobileBreakpoint:r=768,theme:s="default",locale:i="en-US",ai:a=!1,search:l=!0,selectable:c=!1,selectedKeys:d=[],onSelectionChange:h,pagination:p,loading:m=!1,highlightIds:g=[],highlightColor:b="#fff3a3",autoScrollToHighlight:u=!1,onRowClick:y,onSortChange:k,empty:f,className:S="",inputLanguage:w,toolName:E="yuktai_grid",toolDescriptions:I,webmcp:M=!1,onWebMCPStatusChange:H,onAgentResult:O,customRules:F=[]}){let $=i==="te-IN"?"te-IN":"en-US",x=xa[$],Y=a===!0||typeof a=="object"&&a!==null,j=p!==!1&&p!==void 0,J=typeof p=="object"?p.pageSize??20:20,ie=typeof p=="object"&&p.sizeOptions&&p.sizeOptions.length>0?p.sizeOptions:[10,20,50,100],[ge,W]=(0,ae.useState)(""),[U,R]=(0,ae.useState)(1),[z,ee]=(0,ae.useState)(J),[q,ce]=(0,ae.useState)(),[he,Ae]=(0,ae.useState)("asc"),[We,So]=(0,ae.useState)(!1),[Ce,ot]=(0,ae.useState)([]),[ht,Ot]=(0,ae.useState)([]),Ue=(0,ae.useMemo)(()=>Qe(t.map(T=>({key:String(T.key),label:T.label,type:T.type}))),[t]);(0,ae.useEffect)(()=>{ee(J),R(1)},[J]),(0,ae.useEffect)(()=>{let T=()=>{So(window.innerWidth<=r)};return T(),window.addEventListener("resize",T),()=>{window.removeEventListener("resize",T)}},[r]);let Te=(0,ae.useMemo)(()=>{let T=[...e];if(ge.trim()){let D=ge.trim().toLowerCase();T=T.filter(Z=>t.some(Q=>String(Z[Q.key]??"").toLowerCase().includes(D)))}return Ce.length&&(T=_e(T,Ue,Ce)),q&&T.sort((D,Z)=>{let Q=D[q],Re=Z[q];if(Q==null&&Re==null)return 0;if(Q==null)return 1;if(Re==null)return-1;if(typeof Q=="number"&&typeof Re=="number")return he==="asc"?Q-Re:Re-Q;let xe=String(Q).localeCompare(String(Re),i,{numeric:!0,sensitivity:"base"});return he==="asc"?xe:-xe}),T},[e,t,ge,Ce,Ue,q,he,i]),Be=j?Math.max(1,Math.ceil(Te.length/z)):1;(0,ae.useEffect)(()=>{U>Be&&R(Be)},[U,Be]);let bt=(0,ae.useMemo)(()=>{let T=[...g.map(String),...ht];return Array.from(new Set(T))},[g,ht]);(0,ae.useEffect)(()=>{if(!u)return;let T=bt[0];if(T==null)return;let D=typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(String(T)):String(T).replace(/["\\]/g,"\\$&");document.querySelector(`[data-yuktai-row-id="${D}"]`)?.scrollIntoView({behavior:"smooth",block:"center"})},[bt,u,U]);let Ze=(0,ae.useMemo)(()=>{if(!j)return Te;let T=(U-1)*z;return Te.slice(T,T+z)},[Te,j,U,z]),rt=o==="card"||o==="auto"&&We,Ve=T=>String(T[n]??""),it=T=>d.some(D=>String(D)===T),Dt=T=>bt.some(D=>String(D)===T),N=T=>{if(!c)return;let D=Ve(T),Z=it(D)?d.filter(Q=>String(Q)!==D):[...d,D];h?.(Z)},re=T=>{if(T.sortable===!1)return;let D=String(T.key),Z=q===D&&he==="asc"?"desc":"asc";ce(D),Ae(Z),R(1),k?.({key:D,direction:Z})},ze=T=>{W(T),R(1)},gn=(T,D)=>{let Z=t.find(Q=>String(Q.key)===T||Q.label.toLowerCase()===T.toLowerCase());Z&&(ce(String(Z.key)),Ae(D),R(1),k?.({key:String(Z.key),direction:D}))},mn=$==="te-IN"?"te":"en",To=(0,ae.useCallback)(T=>{T?(ce(T.key),Ae(T.direction)):(ce(void 0),Ae("asc")),R(1),k?.(T)},[k]),Ao=(0,ae.useCallback)(T=>{ot(T),R(1)},[]),Co=(0,ae.useCallback)(T=>{if(Ot(T),j&&T.length){let D=Te.findIndex(Z=>String(Z[n]??"")===T[0]);D>=0&&R(Math.floor(D/z)+1)}},[j,Te,n,z]),fn=(0,ae.useMemo)(()=>mt({data:e,columns:Ue,rowKey:String(n),locale:mn,filters:Ce,onHighlightRows:Co,onFiltersChange:Ao,onSortChange:To,onOpenRow:y?T=>{let D=Te.findIndex(Q=>String(Q[n]??"")===T),Z=D>=0?Te[D]:e.find(Q=>String(Q[n]??"")===T);Z&&y(Z,Math.max(D,0))}:void 0,onSelectRow:c&&h?T=>{d.some(D=>String(D)===T)||h([...d.map(String),T])}:void 0},{name:E,descriptions:I}),[e,Ue,n,mn,Ce,Co,Ao,To,y,Te,c,h,d,E,I]),Wt=Rt({tools:fn,data:e,locale:mn,columns:Ue,rowKey:String(n),customRules:F,onResult:O}),Ro=(0,ae.useMemo)(()=>fn.map(T=>({...T,execute:D=>Wt.executeTool(T.name,D)})),[fn,Wt.executeTool]),zi=()=>{ot([]),R(1)},Eo=(T,D,Z)=>{if(D.render)return D.render(T[D.key],T,Z);let Q=T[D.key];if(Q==null)return"";if(D.type==="date"){let Re=new Date(String(Q));if(!Number.isNaN(Re.getTime()))return Re.toLocaleDateString(i)}return D.type==="boolean"?Q?x.yes:x.no:String(Q)},ne=s==="dark",Io={width:"100%",overflow:"hidden",border:s==="high-contrast"?"2px solid #000000":ne?"1px solid #334155":"1px solid #e2e8f0",borderRadius:12,background:ne?"#0f172a":"#ffffff",color:ne?"#f8fafc":"#0f172a",fontFamily:s==="dyslexia"?"Arial, sans-serif":void 0},Oi={padding:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",borderBottom:ne?"1px solid #334155":"1px solid #e2e8f0"},$o=T=>({width:40,height:40,minWidth:40,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,borderRadius:8,border:ne?"1px solid #475569":"1px solid #cbd5e1",background:T?ne?"#1e293b":"#f8fafc":ne?"#1e293b":"#ffffff",color:T?"#94a3b8":ne?"#f8fafc":"#0f172a",cursor:T?"not-allowed":"pointer",opacity:T?.55:1});if(m)return(0,P.jsxs)("div",{className:S,style:Io,children:[M&&(0,P.jsx)(Et,{tools:Ro,onStatusChange:H}),(0,P.jsx)("div",{style:{padding:32,textAlign:"center"},children:x.loading})]});let Di=t.map(T=>({key:String(T.key),label:T.label,type:T.type==="number"?"number":T.type==="date"?"date":"text"}));return(0,P.jsxs)("div",{className:S,style:Io,children:[M&&(0,P.jsx)(Et,{tools:Ro,onStatusChange:H}),(l||Y||Ce.length>0)&&(0,P.jsxs)("div",{style:Oi,children:[l&&(0,P.jsxs)("div",{style:{position:"relative",width:"100%",maxWidth:420},children:[(0,P.jsx)("div",{style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex",alignItems:"center",color:ne?"#cbd5e1":"#64748b",pointerEvents:"none"},children:(0,P.jsx)(wa,{size:19})}),(0,P.jsx)("input",{value:ge,onChange:T=>{W(T.target.value),R(1)},placeholder:x.search,"aria-label":x.searchAria,style:{width:"100%",padding:"10px 12px 10px 40px",borderRadius:8,border:ne?"1px solid #475569":"1px solid #cbd5e1",background:ne?"#1e293b":"#ffffff",color:ne?"#ffffff":"#0f172a",outline:"none",boxSizing:"border-box"}})]}),Ce.length>0&&(0,P.jsxs)("button",{type:"button",onClick:zi,title:x.clearFilters,style:{padding:"6px 10px",borderRadius:999,border:ne?"1px solid #475569":"1px solid #cbd5e1",background:ne?"#1e293b":"#f1f5f9",color:"inherit",fontSize:12,cursor:"pointer"},children:[x.filtersActive(Ce.length)," \u2715"]}),(0,P.jsxs)("div",{style:{marginLeft:"auto",fontSize:13,opacity:.7,whiteSpace:"nowrap"},children:[Te.length," ",Te.length===1?x.row:x.rows]}),Y&&(0,P.jsx)(Jt,{data:e,columns:Di,onSearch:ze,onSort:gn,theme:ne?"dark":"light",language:$,inputLanguage:w??$,agent:{ask:Wt.ask,loading:Wt.loading},embedded:!0})]}),Te.length===0?(0,P.jsx)("div",{style:{padding:40,textAlign:"center",opacity:.7},children:f??x.noData}):rt?(0,P.jsx)("div",{style:{display:"grid",gap:12,padding:12},children:Ze.map((T,D)=>{let Z=Ve(T),Q=it(Z),Re=Dt(Z);return(0,P.jsxs)("div",{"data-yuktai-row-id":Z,onClick:()=>y?.(T,D),style:{padding:14,borderRadius:10,border:ne?"1px solid #334155":"1px solid #e2e8f0",background:Re?b:Q?ne?"#1e3a5f":"#eff6ff":ne?"#1e293b":"#ffffff",cursor:y?"pointer":"default"},children:[c&&(0,P.jsx)("button",{type:"button",onClick:xe=>{xe.stopPropagation(),N(T)},"aria-label":`${x.selectRow} ${Z}`,"aria-pressed":Q,style:{width:32,height:32,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,marginBottom:10,borderRadius:7,border:Q?"1px solid #2563eb":"1px solid #cbd5e1",background:Q?"#2563eb":"transparent",color:Q?"#ffffff":"currentColor",cursor:"pointer"},children:Q&&(0,P.jsx)(ei,{size:17})}),t.map(xe=>(0,P.jsxs)("div",{style:{display:"flex",gap:8,padding:"5px 0",alignItems:"flex-start"},children:[(0,P.jsx)("strong",{style:{minWidth:100,opacity:.7},children:xe.label}),(0,P.jsx)("span",{children:Eo(T,xe,D)})]},String(xe.key)))]},Z)})}):(0,P.jsx)("div",{style:{width:"100%",overflowX:"auto"},children:(0,P.jsxs)("table",{style:{width:"100%",borderCollapse:"collapse"},children:[(0,P.jsx)("thead",{children:(0,P.jsxs)("tr",{children:[c&&(0,P.jsx)("th",{style:{padding:10,borderBottom:ne?"1px solid #334155":"1px solid #e2e8f0",width:52}}),t.filter(T=>!(We&&T.hiddenOnMobile)).map(T=>{let D=q===String(T.key);return(0,P.jsx)("th",{onClick:()=>re(T),style:{padding:10,textAlign:T.align??"left",borderBottom:ne?"1px solid #334155":"1px solid #e2e8f0",whiteSpace:"nowrap",cursor:T.sortable===!1?"default":"pointer",width:T.width,userSelect:"none"},children:(0,P.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:5},children:[T.label,D&&(he==="asc"?(0,P.jsx)(va,{size:17,label:x.sortAscending}):(0,P.jsx)(ka,{size:17,label:x.sortDescending}))]})},String(T.key))})]})}),(0,P.jsx)("tbody",{children:Ze.map((T,D)=>{let Z=Ve(T),Q=it(Z),Re=Dt(Z);return(0,P.jsxs)("tr",{"data-yuktai-row-id":Z,onClick:()=>y?.(T,D),style:{background:Re?b:Q?ne?"#1e3a5f":"#eff6ff":"transparent",cursor:y?"pointer":"default"},children:[c&&(0,P.jsx)("td",{style:{padding:10,borderBottom:ne?"1px solid #334155":"1px solid #e2e8f0"},children:(0,P.jsx)("button",{type:"button",onClick:xe=>{xe.stopPropagation(),N(T)},"aria-label":`${x.selectRow} ${Z}`,"aria-pressed":Q,style:{width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,borderRadius:6,border:Q?"1px solid #2563eb":ne?"1px solid #64748b":"1px solid #cbd5e1",background:Q?"#2563eb":"transparent",color:Q?"#ffffff":"currentColor",cursor:"pointer"},children:Q&&(0,P.jsx)(ei,{size:16})})}),t.filter(xe=>!(We&&xe.hiddenOnMobile)).map(xe=>(0,P.jsx)("td",{style:{padding:10,textAlign:xe.align??"left",borderBottom:ne?"1px solid #334155":"1px solid #e2e8f0"},children:Eo(T,xe,D)},String(xe.key)))]},Z)})})]})}),j&&(0,P.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:12,borderTop:ne?"1px solid #334155":"1px solid #e2e8f0"},children:[(0,P.jsxs)("span",{style:{fontSize:13,opacity:.7},children:[x.page," ",U," ",x.of," ",Be]}),(0,P.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[typeof p=="object"&&p.showSizeChanger&&(0,P.jsx)("select",{value:z,onChange:T=>{let D=Number(T.target.value);!Number.isFinite(D)||D<=0||(ee(D),R(1))},"aria-label":x.pageSize,style:{minHeight:40,padding:"7px 10px",borderRadius:8,border:ne?"1px solid #475569":"1px solid #cbd5e1",background:ne?"#1e293b":"#ffffff",color:ne?"#ffffff":"#0f172a"},children:ie.map(T=>(0,P.jsx)("option",{value:T,children:T},T))}),(0,P.jsx)("button",{type:"button",disabled:U<=1,onClick:()=>R(T=>Math.max(1,T-1)),"aria-label":x.previous,title:x.previous,style:$o(U<=1),children:(0,P.jsx)(Sa,{size:20})}),(0,P.jsx)("button",{type:"button",disabled:U>=Be,onClick:()=>R(T=>Math.min(Be,T+1)),"aria-label":x.next,title:x.next,style:$o(U>=Be),children:(0,P.jsx)(Ta,{size:20})})]})]})]})}C();var te=require("react");function ni(e){return e===!1?Number.MAX_SAFE_INTEGER:e===!0||e===void 0?10:e.pageSize??10}function oi(e){return String(e??"").normalize("NFC").toLowerCase().trim()}function ri(e){return e==null||typeof e=="string"&&e.trim()===""}function ii(e){if(typeof e=="number")return Number.isFinite(e)?e:null;let t=String(e??"").trim();if(t==="")return null;let n=Number(t);return Number.isFinite(n)?n:null}function si(e){let t=e instanceof Date?e.getTime():new Date(String(e)).getTime();return Number.isFinite(t)?t:null}function Aa(e,t,n,o){if(n==="number"||typeof e=="number"&&typeof t=="number"){let r=ii(e),s=ii(t);if(r!==null&&s!==null)return r-s}if(n==="date"||e instanceof Date&&t instanceof Date){let r=si(e),s=si(t);if(r!==null&&s!==null)return r-s}return typeof e=="boolean"&&typeof t=="boolean"?e===t?0:e?1:-1:String(e).localeCompare(String(t),o,{sensitivity:"base",numeric:!0})}function ai(e){let{data:t,columns:n,pagination:o=!0,mobileBreakpoint:r=768,locale:s,initialFilters:i=[]}=e,[a,l]=(0,te.useState)(null),[c,d]=(0,te.useState)(""),[h,p]=(0,te.useState)(i),[m,g]=(0,te.useState)(1),[b,u]=(0,te.useState)(ni(o)),[y,k]=(0,te.useState)(!1),f=ni(o);(0,te.useEffect)(()=>{u(f),g(1)},[f]),(0,te.useEffect)(()=>{if(typeof window>"u")return;let R=()=>{k(window.innerWidth<=r)};return R(),window.addEventListener("resize",R),()=>window.removeEventListener("resize",R)},[r]);let S=(0,te.useMemo)(()=>Qe(n.map(R=>({key:String(R.key),label:R.label,type:R.type}))),[n]),w=(0,te.useCallback)(R=>{l(z=>!z||z.key!==R?{key:R,direction:"asc"}:z.direction==="asc"?{key:R,direction:"desc"}:null),g(1)},[]),E=(0,te.useCallback)(R=>{l(R&&R.direction?R:null),g(1)},[]),I=(0,te.useCallback)(()=>{l(null),g(1)},[]),M=(0,te.useCallback)(R=>{d(R),g(1)},[]),H=(0,te.useCallback)(R=>{p(R),g(1)},[]),O=(0,te.useCallback)(R=>{p(z=>[...z.filter(ee=>ee.key!==R.key),R]),g(1)},[]),F=(0,te.useCallback)(R=>{p(z=>z.filter(ee=>ee.key!==R)),g(1)},[]),$=(0,te.useCallback)(()=>{p([]),g(1)},[]),x=(0,te.useCallback)(R=>{u(Math.max(1,Math.floor(R)||1)),g(1)},[]),Y=(0,te.useMemo)(()=>{let R=oi(c);return R?t.filter(z=>n.some(ee=>{let q=z[ee.key];return q==null?!1:oi(q).includes(R)})):t},[t,c,n]),j=(0,te.useMemo)(()=>_e(Y,S,h),[Y,S,h]),J=(0,te.useMemo)(()=>{if(!a||!a.direction)return j;let R=n.find(ee=>String(ee.key)===a.key),z=a.direction==="desc"?-1:1;return[...j].sort((ee,q)=>{let ce=ee[a.key],he=q[a.key],Ae=ri(ce),We=ri(he);return Ae&&We?0:Ae?1:We?-1:z*Aa(ce,he,R?.type,s)})},[j,a,n,s]),ie=Math.max(1,Math.ceil(J.length/b)),ge=(0,te.useMemo)(()=>{if(o===!1)return J;let R=(m-1)*b;return J.slice(R,R+b)},[J,m,b,o]);(0,te.useEffect)(()=>{m>ie&&g(ie)},[m,ie]);let W=(0,te.useCallback)(R=>g(Math.min(Math.max(1,Math.floor(R)||1),ie)),[ie]),U=(0,te.useCallback)(()=>{l(null),d(""),p([]),g(1)},[]);return{displayedData:ge,rows:J,totalCount:t.length,filteredCount:J.length,sort:a,toggleSort:w,setSort:E,clearSort:I,searchQuery:c,setSearchQuery:M,filters:h,setFilters:H,setFilter:O,removeFilter:F,clearFilters:$,page:m,pageSize:b,totalPages:ie,setPage:W,setPageSize:x,isMobile:y,reset:U}}C();C();var li=require("react/jsx-runtime");function ye({size:e=20,color:t="currentColor",strokeWidth:n=2.5,label:o,children:r,...s}){return(0,li.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!o?"true":void 0,"aria-label":o,role:o?"img":void 0,focusable:"false",...s,children:r})}C();var It=require("react/jsx-runtime");function Un(e){return(0,It.jsxs)(ye,{...e,children:[(0,It.jsx)("circle",{cx:"11",cy:"11",r:"7"}),(0,It.jsx)("path",{d:"m20 20-4-4"})]})}C();var $t=require("react/jsx-runtime");function Vn(e){return(0,$t.jsxs)(ye,{...e,children:[(0,$t.jsx)("path",{d:"M12 19V5"}),(0,$t.jsx)("path",{d:"m5 12 7-7 7 7"})]})}C();var Lt=require("react/jsx-runtime");function Yn(e){return(0,Lt.jsxs)(ye,{...e,children:[(0,Lt.jsx)("path",{d:"M12 5v14"}),(0,Lt.jsx)("path",{d:"m5 12 7 7 7-7"})]})}C();var Kn=require("react/jsx-runtime");function Qn(e){return(0,Kn.jsx)(ye,{...e,children:(0,Kn.jsx)("path",{d:"m15 18-6-6 6-6"})})}C();var Xn=require("react/jsx-runtime");function Jn(e){return(0,Xn.jsx)(ye,{...e,children:(0,Xn.jsx)("path",{d:"m9 18 6-6-6-6"})})}C();var Zn=require("react/jsx-runtime");function eo(e){return(0,Zn.jsx)(ye,{...e,children:(0,Zn.jsx)("path",{d:"M5 12.5 10 17.5 19.5 7"})})}C();var Nt=require("react/jsx-runtime");function to(e){return(0,Nt.jsxs)(ye,{...e,children:[(0,Nt.jsx)("path",{d:"M18 6 6 18"}),(0,Nt.jsx)("path",{d:"m6 6 12 12"})]})}C();C();C();var Ca="[data-yuktai-panel]";function Ge(){return typeof window<"u"&&typeof document<"u"}function tt(e){return typeof e=="object"&&e!==null&&e.nodeType===9}function Ee(e){return e||(Ge()?document:null)}function K(e,t,n={}){return Array.from(e.querySelectorAll(t)).filter(o=>!o.closest(Ca)&&(n.includeHidden||Ra(o)))}function Ra(e){if(!Ge()||e.closest("[hidden],[aria-hidden='true']"))return!1;let t=e;for(;t;){let n=window.getComputedStyle(t);if(n.display==="none"||n.visibility==="hidden")return!1;t=t.parentElement}return!0}function ue(e){return(e??"").replace(/\s+/g," ").trim()}function fe(e,t=60){let n=ue(e);return n.length>t?`${n.slice(0,t-1)}\u2026`:n}function Oe(e){let t=[],n=e;for(;n&&n.nodeType===1&&t.length<4;){let o=n.tagName.toLowerCase();if(n.id&&/^[A-Za-z][\w-]*$/.test(n.id)){t.unshift(`${o}#${n.id}`);break}let r=n.parentElement;if(!r){t.unshift(o);break}let s=Array.from(r.children).filter(i=>i.tagName===n.tagName);t.unshift(s.length>1?`${o}:nth-of-type(${s.indexOf(n)+1})`:o),n=r}return t.join(" > ")}function Ea(e,t){return e.split(/\s+/).map(n=>ue(t.getElementById(n)?.textContent)).filter(Boolean).join(" ")}function Le(e){let t=e.ownerDocument,n=e.getAttribute("aria-labelledby");if(n){let s=Ea(n,t);if(s)return s}let o=ue(e.getAttribute("aria-label"));if(o)return o;let r=e.tagName.toLowerCase();if(r==="input"||r==="select"||r==="textarea"){let s=e.getAttribute("id");if(s){let l=t.querySelector(`label[for="${Ia(s)}"]`),c=ue(l?.textContent);if(c)return c}let i=e.closest("label");if(i){let l=ue(i.textContent);if(l)return l}let a=(e.getAttribute("type")??"").toLowerCase();if(a==="submit"||a==="button"||a==="reset")return ue(e.getAttribute("value"))||(a==="submit"?"Submit":"");if(a==="image")return ue(e.getAttribute("alt"))}if(r==="img")return ue(e.getAttribute("alt"));if(r==="button"||r==="a"||e.getAttribute("role")){let s=ue(e.textContent);if(s)return s;let i=Array.from(e.querySelectorAll("img[alt], svg[aria-label]")).map(a=>ue(a.getAttribute("alt")??a.getAttribute("aria-label"))).filter(Boolean).join(" ");if(i)return i}return ue(e.getAttribute("title"))}function Ia(e){return typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/["\\]/g,"\\$&")}function Ft(e){if(!e)return null;let t=e.trim().toLowerCase();if(t==="transparent")return{r:0,g:0,b:0,a:0};let n=t.match(/^rgba?\(([^)]+)\)$/);if(n){let r=n[1].split(/[\s,/]+/).filter(Boolean),[s,i,a]=r.slice(0,3).map(Number),l=r[3],c=l===void 0?1:l.endsWith("%")?Number(l.slice(0,-1))/100:Number(l);return[s,i,a,c].some(d=>!Number.isFinite(d))?null:{r:s,g:i,b:a,a:c}}let o=t.match(/^#([0-9a-f]{3,8})$/);if(o){let r=o[1];return(r.length===3||r.length===4)&&(r=r.split("").map(s=>s+s).join("")),r.length!==6&&r.length!==8?null:{r:parseInt(r.slice(0,2),16),g:parseInt(r.slice(2,4),16),b:parseInt(r.slice(4,6),16),a:r.length===8?parseInt(r.slice(6,8),16)/255:1}}return null}function no(e,t){let n=e.a+t.a*(1-e.a);if(n===0)return{r:0,g:0,b:0,a:0};let o=(r,s)=>(r*e.a+s*t.a*(1-e.a))/n;return{r:o(e.r,t.r),g:o(e.g,t.g),b:o(e.b,t.b),a:n}}function en(e){let t=n=>{let o=n/255;return o<=.04045?o/12.92:Math.pow((o+.055)/1.055,2.4)};return .2126*t(e.r)+.7152*t(e.g)+.0722*t(e.b)}function tn(e,t){let n=t.a<1?no(t,{r:255,g:255,b:255,a:1}):t,o=e.a<1?no(e,n):e,r=en(o),s=en(n),[i,a]=r>s?[r,s]:[s,r];return Math.round((i+.05)/(a+.05)*100)/100}function ci(e){let t=[],n=e;for(;n;){let r=window.getComputedStyle(n);if(r.backgroundImage&&r.backgroundImage!=="none")return null;let s=Ft(r.backgroundColor);if(s&&s.a>0&&(t.push(s),s.a>=1))break;n=n.parentElement}let o={r:255,g:255,b:255,a:1};for(let r=t.length-1;r>=0;r--)o=no(t[r],o);return o}function di(e){let t=window.getComputedStyle(e),n=parseFloat(t.fontSize)||16,o=parseInt(t.fontWeight,10)||400;return n>=24||n>=18.66&&o>=700}function Mt(e){return Array.from(e.childNodes).some(t=>t.nodeType===3&&ue(t.textContent).length>0)}var ui="a[href],button,input:not([type='hidden']),select,textarea,summary,[tabindex]:not([tabindex='-1']),[contenteditable='true']",nn="a[href],button,input:not([type='hidden']),select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='tab'],[role='menuitem']";C();var Pt={"html-lang":{title:"Page language is set",wcag:"3.1.1",severity:"serious",why:"Screen readers pick their voice and pronunciation from the page language. Without it, Telugu or Hindi text may be read with English rules."},"page-title":{title:"Page has a title",wcag:"2.4.2",severity:"serious",why:"The title is the first thing announced and the name shown on browser tabs and bookmarks."},"image-alt":{title:"Images have alternative text",wcag:"1.1.1",severity:"critical",why:'People who cannot see the image get no information from it unless alt text describes it (or alt="" marks it as decorative).'},"heading-order":{title:"Headings follow a logical order",wcag:"1.3.1",severity:"moderate",why:"Many screen-reader users jump between headings. Skipped levels make the page outline confusing."},"single-h1":{title:"Page has one main heading",wcag:"best practice",severity:"minor",why:"A single h1 tells everyone what the page is about."},"landmark-main":{title:"Main content landmark exists",wcag:"1.3.1 / 2.4.1",severity:"moderate",why:"A <main> region lets keyboard and screen-reader users skip straight past menus to the content."},"form-label":{title:"Form fields have labels",wcag:"1.3.1 / 4.1.2",severity:"critical",why:'Without a label, a screen reader just says "edit text" and the user has to guess what to type.'},"button-name":{title:"Buttons have names",wcag:"4.1.2",severity:"critical",why:'An icon-only button with no name is announced as just "button", so its purpose is unknown.'},"link-name":{title:"Links have names",wcag:"2.4.4",severity:"serious",why:"Links are often read out of context in a list. An empty link gives no clue where it goes."},"color-contrast":{title:"Text has enough contrast",wcag:"1.4.3",severity:"serious",why:"Low-contrast text is hard to read for older users, people with low vision, and anyone outdoors on a phone."},"positive-tabindex":{title:"No positive tabindex",wcag:"2.4.3",severity:"moderate",why:"tabindex greater than 0 forces a custom keyboard order that usually doesn't match the visual order."},"keyboard-access":{title:"Clickable things work with a keyboard",wcag:"2.1.1",severity:"critical",why:"A div or span with a click handler can't be reached or activated with Tab and Enter, locking out keyboard users."},"duplicate-id":{title:"IDs are unique",wcag:"best practice",severity:"minor",why:"Labels and ARIA references point at ids. Duplicates make them point at the wrong element."},"form-error":{title:"Errors are linked to their fields",wcag:"3.3.1",severity:"serious",why:"When a field is marked invalid, the error message must be connected to it so it's announced together with the field."},"target-size":{title:"Touch targets are large enough",wcag:"2.5.8",severity:"moderate",why:"Small targets are hard to tap for people with tremors, seniors and everyone on mobile."}},$a={critical:10,serious:5,moderate:2,minor:1};function qe(e={}){let t=Ee(e.root),n=new Set(e.skip??[]),o=[],r={},s=t?tt(t)?t:t.ownerDocument:null,i=(a,l,c,d,h=!1)=>{if(n.has(a))return;let p=Pt[a],m=r[a]=(r[a]??0)+1;o.push({id:`${a}-${m}`,rule:a,severity:p.severity,wcag:p.wcag,message:c,why:p.why,fix:d,selector:l?Oe(l):"document",snippet:l?fe(l.outerHTML,120):"",autoFixable:h,element:l??void 0})};if(t&&s){s.documentElement.getAttribute("lang")||i("html-lang",s.documentElement,"The <html> element has no lang attribute.",'Add lang to <html>, e.g. <html lang="te"> or "en".',!0),s.title.trim()||i("page-title",null,"The page has no <title>.","Add a short, descriptive <title> that names this page.");for(let u of K(t,"img"))if(!(u.getAttribute("role")==="presentation"||u.getAttribute("role")==="none")&&!u.hasAttribute("alt")&&!u.getAttribute("aria-label")&&!u.getAttribute("aria-labelledby")){let y=u.getAttribute("title");i("image-alt",u,`Image has no alt text${u.getAttribute("src")?` (${fe(u.getAttribute("src")??"",40)})`:""}.`,y?`Use the title as alt: alt="${fe(y,40)}".`:'Describe the image in alt, or use alt="" if it is purely decorative.',!!y)}let a=K(t,"h1,h2,h3,h4,h5,h6"),l=0;for(let u of a){let y=Number(u.tagName[1]);l>0&&y>l+1&&i("heading-order",u,`Heading jumps from h${l} to h${y}: "${fe(u.textContent??"",40)}".`,`Change it to h${l+1}, or add the missing level above it.`),l=y}let c=a.filter(u=>u.tagName==="H1");c.length===0?i("single-h1",null,"The page has no h1.","Add one h1 that names the page."):c.length>1&&i("single-h1",c[1],`The page has ${c.length} h1 headings.`,"Keep one h1; turn the others into h2."),t.querySelectorAll("main,[role='main']").length===0&&i("landmark-main",null,"No <main> landmark found.","Wrap the primary content in <main>.");let d=K(t,"input,select,textarea").filter(u=>{let y=(u.getAttribute("type")??"text").toLowerCase();return!["hidden","submit","button","reset","image"].includes(y)});for(let u of d){if(!Le(u)){let y=u.getAttribute("placeholder")||u.getAttribute("name");i("form-label",u,`Form field has no label${y?` (placeholder/name: "${fe(y,30)}")`:""}.`,y?`Add a visible <label>. Quick fix: aria-label="${fe(y,30)}".`:"Add a visible <label for=\u2026> describing what to enter.",!!y)}u.getAttribute("aria-invalid")==="true"&&(u.getAttribute("aria-describedby")||u.getAttribute("aria-errormessage")||i("form-error",u,"Field is marked invalid but no error message is linked to it.","Put the error text in an element with an id and point aria-describedby at it."))}for(let u of K(t,"button,[role='button'],input[type='submit'],input[type='button']"))if(!Le(u)){let y=u.getAttribute("title");i("button-name",u,"Button has no accessible name.",y?`Use the title as the name: aria-label="${y}".`:"Add visible text or an aria-label that says what the button does.",!!y)}for(let u of K(t,"a[href]"))if(!Le(u)){let y=u.getAttribute("title");i("link-name",u,`Link has no text (${fe(u.getAttribute("href")??"",40)}).`,y?`Use the title as the name: aria-label="${y}".`:"Add link text that says where it goes.",!!y)}for(let u of K(t,"[tabindex]"))Number(u.getAttribute("tabindex"))>0&&i("positive-tabindex",u,`tabindex="${u.getAttribute("tabindex")}" overrides the natural tab order.`,'Use tabindex="0" and fix the order in the HTML instead.',!0);let h="a[href],button,input,select,textarea,summary";for(let u of K(t,"[onclick],[role='button'],[role='link']"))u.matches(h)||u.hasAttribute("tabindex")||i("keyboard-access",u,`<${u.tagName.toLowerCase()}> is clickable but can't be reached with the keyboard.`,'Use a real <button>, or add tabindex="0", a role and Enter/Space key handling.',!0);let p=new Map;for(let u of Array.from(t.querySelectorAll("[id]")))u.closest("[data-yuktai-panel]")||p.set(u.id,(p.get(u.id)??0)+1);for(let[u,y]of p)y>1&&i("duplicate-id",t.querySelector(`[id="${u.replace(/"/g,'\\"')}"]`),`id="${u}" is used ${y} times.`,"Give each element a unique id.");let m=e.maxContrastChecks??600,g=0;for(let u of K(t,"body *")){if(g>=m)break;if(!Mt(u)||["SCRIPT","STYLE","NOSCRIPT","OPTION"].includes(u.tagName))continue;g++;let y=Ft(window.getComputedStyle(u).color),k=ci(u);if(!y||!k)continue;let f=tn(y,k),S=di(u)?3:4.5;f<S&&i("color-contrast",u,`Contrast ${f}:1 is below ${S}:1 for "${fe(u.textContent??"",30)}".`,`Darken the text or lighten the background until the ratio is at least ${S}:1.`)}let b=e.minTargetSize??24;for(let u of K(t,nn)){let y=u.getBoundingClientRect();y.width===0&&y.height===0||u.tagName==="A"&&u.closest("p,li,td")||(y.width<b||y.height<b)&&i("target-size",u,`Target is ${Math.round(y.width)}\xD7${Math.round(y.height)}px (minimum ${b}\xD7${b}).`,`Increase padding so it's at least ${b}\xD7${b}px (44\xD744 is better for seniors).`)}}return La(o,s,n)}function La(e,t,n){let o=Object.keys(Pt).filter(l=>!n.has(l)).map(l=>{let c=e.filter(d=>d.rule===l).length;return{rule:l,title:Pt[l].title,passed:c===0,issueCount:c}}),r=0;for(let l of o){let c=$a[Pt[l.rule].severity];r+=Math.min(25,l.issueCount*c)}let s=Math.max(0,100-r),i=o.filter(l=>!l.passed),a=e.filter(l=>l.severity==="critical").length;return{url:t?.location?.href??"",title:t?.title??"",generatedAt:new Date().toISOString(),score:s,passed:a===0&&s>=80,checks:o,issues:e,summary:e.length===0?`All ${o.length} checks passed.`:`${o.length-i.length} of ${o.length} checks passed. ${e.length} issue(s) found, ${a} critical. Score ${s}/100.`}}function oo(e){let t=["# Accessibility QA report","",`- Page: ${e.title||"(untitled)"} ${e.url}`,`- Generated: ${e.generatedAt}`,`- Score: **${e.score}/100** \u2014 ${e.passed?"PASS":"FAIL"}`,"",e.summary,"","## Checks","","| Check | Result | Issues |","|---|---|---|",...e.checks.map(n=>`| ${n.title} | ${n.passed?"\u2705 Pass":"\u274C Fail"} | ${n.issueCount} |`)];if(e.issues.length){t.push("","## Issues","");for(let n of e.issues)t.push(`### ${n.id} \xB7 ${n.severity} \xB7 WCAG ${n.wcag}`,"",`- **Problem:** ${n.message}`,`- **Why it matters:** ${n.why}`,`- **Fix:** ${n.fix}`,`- **Where:** \`${n.selector}\``,"")}return t.join(`
`)}function ro(e){return JSON.stringify({...e,issues:e.issues.map(({element:t,...n})=>n)},null,2)}function io(e={}){let t=null,n=null,o=null,r=!1,s=[],i=()=>({report:t,watching:n!==null,appliedFixes:s.length}),a=()=>e.onUpdate?.(i()),l=p=>t?.issues.find(m=>m.id===p),c=(p,m,g)=>{s.push({element:p,attribute:m,previous:p.getAttribute(m)}),p.setAttribute(m,g)};function d(p){let m=p.element,g=(b,u)=>({issueId:p.id,applied:b,message:u});if(!p.autoFixable||!m)return g(!1,"This needs a human decision \u2014 see the suggested fix.");switch(p.rule){case"html-lang":{let b=e.defaultLang||(Ge()?navigator.language:"")||"en";return c(m,"lang",b),g(!0,`Set lang="${b}" on <html>.`)}case"image-alt":{let b=m.getAttribute("title");if(!b)break;return c(m,"alt",b),g(!0,`Used the image title as alt text: "${b}".`)}case"form-label":{let b=m.getAttribute("placeholder")||m.getAttribute("name");if(!b)break;let u=b.replace(/[_-]+/g," ").trim();return c(m,"aria-label",u),g(!0,`Added aria-label="${u}". A visible <label> is still better.`)}case"button-name":case"link-name":{let b=m.getAttribute("title");if(!b)break;return c(m,"aria-label",b),g(!0,`Added aria-label="${b}".`)}case"positive-tabindex":return c(m,"tabindex","0"),g(!0,"Changed tabindex to 0 so the natural order applies.");case"keyboard-access":{c(m,"tabindex","0"),m.getAttribute("role")||c(m,"role","button");let b=u=>{let y=u.key;(y==="Enter"||y===" ")&&(u.preventDefault(),m.click())};return m.addEventListener("keydown",b),s.push({element:m,attribute:"",previous:null,listener:b}),g(!0,"Made it focusable and added Enter/Space support.")}default:break}return g(!1,"No safe automatic fix for this one \u2014 see the suggested fix.")}function h(){if(t=qe(e),e.autoApply){r=!0;let p=t.issues.filter(m=>m.autoFixable).map(d);r=!1,p.some(m=>m.applied)&&(t=qe(e))}return a(),t}return{start(){if(!Ge()||n)return;let p=Ee(e.root),m=tt(p)?p.body:p;m&&(n=new MutationObserver(g=>{r||!g.some(u=>!u.target.closest?.("[data-yuktai-panel]"))||(o&&clearTimeout(o),o=setTimeout(h,e.debounceMs??600))}),n.observe(m,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["alt","aria-label","aria-invalid","tabindex","lang","title"]}),h())},stop(){n?.disconnect(),n=null,o&&clearTimeout(o),o=null,a()},scan:h,explain(p){let m=l(p);return m?[`${m.message}`,`Why it matters: ${m.why}`,`How to fix: ${m.fix}`,`Standard: WCAG ${m.wcag} (${m.severity}).`,m.autoFixable?"I can apply a safe fix for this in the browser.":"This one needs a change in your code."].join(`
`):`No issue "${p}" in the current report. Run a scan first.`},applyFix(p){let m=l(p);if(!m)return{issueId:p,applied:!1,message:"Issue not found. Run a scan first."};r=!0;let g=d(m);return r=!1,g.applied&&h(),g},applyAllFixes(){t||h(),r=!0;let p=(t?.issues??[]).filter(m=>m.autoFixable).map(d);return r=!1,h(),p},undoAll(){let p=s.length;for(r=!0;s.length;){let m=s.pop();m.listener?m.element.removeEventListener("keydown",m.listener):m.previous===null?m.element.removeAttribute(m.attribute):m.element.setAttribute(m.attribute,m.previous)}return r=!1,h(),p},getState:i}}C();C();var Na=/^(field|input|value|text|enter|details?|info|data|\*|:)$/i,Fa=/^(go|ok|submit|send|click here|>|→|next)$/i,Ma=[[/e-?mail/i,"email","email"],[/phone|mobile|tel/i,"tel","tel"],[/^(full)?name$|full.?name/i,"name"],[/first.?name|given/i,"given-name"],[/last.?name|surname|family/i,"family-name"],[/address|street/i,"street-address"],[/zip|postal|pin.?code|pincode/i,"postal-code"],[/city|town/i,"address-level2"],[/country/i,"country-name"],[/password/i,"current-password","password"],[/dob|birth/i,"bday"]];function Pa(e){let t=e.getAttribute("id");return t&&e.ownerDocument.querySelector(`label[for="${t.replace(/"/g,'\\"')}"]`)?!0:!!e.closest("label")}function pi(e){return K(e,"input,select,textarea").filter(t=>!["hidden","submit","button","reset","image"].includes((t.getAttribute("type")??"text").toLowerCase())).map(t=>({label:Le(t),type:t.tagName==="INPUT"?(t.getAttribute("type")??"text").toLowerCase():t.tagName.toLowerCase(),name:t.getAttribute("name")??t.getAttribute("id")??"",required:t.hasAttribute("required")||t.getAttribute("aria-required")==="true",hasVisibleLabel:Pa(t),selector:Oe(t),element:t}))}function gi(e,t={}){let n=t.seniorFriendly!==!1,o=t.maxFieldsPerStep??8,r=pi(e),s=[],i=(p,m,g,b)=>s.push({level:p,message:m,suggestion:g,field:b?.label||b?.name,selector:b?.selector});for(let p of r){let m=p.element,g=p.label||p.name||p.type,b=m.getAttribute("placeholder");!p.label&&b?i("problem",`"${b}" uses only a placeholder as its label.`,"Placeholders disappear when typing starts and aren't read by every screen reader. Add a visible label above the field.",p):p.label?!p.hasVisibleLabel&&b&&!m.getAttribute("aria-label")?i("problem",`"${g}" uses only a placeholder as its label.`,"Placeholders disappear when typing starts. Add a visible label above the field.",p):Na.test(p.label)&&i("improvement",`The label "${p.label}" is unclear.`,'Say exactly what is needed, e.g. "Mobile number (10 digits)".',p):i("problem",`A ${p.type} field${p.name?` ("${p.name}")`:""} has no label.`,"Add a visible <label> that says exactly what to enter.",p),p.required&&p.label&&!/\*|required|mandatory|తప్పనిసరి|आवश्यक/i.test(p.label)&&i("improvement",`"${g}" is required but the label doesn't say so.`,'Add "(required)" to the label so everyone knows before submitting.',p);let u=`${p.name} ${p.label}`;for(let[y,k,f]of Ma)if(y.test(u)){m.getAttribute("autocomplete")||i("improvement",`"${g}" has no autocomplete hint.`,`Add autocomplete="${k}" so browsers can fill it in (WCAG 1.3.5).`,p),f&&p.type==="text"&&i("improvement",`"${g}" uses type="text".`,`Use type="${f}" for the right mobile keyboard and validation.`,p);break}if(m.getAttribute("aria-invalid")==="true"&&!m.getAttribute("aria-describedby")&&!m.getAttribute("aria-errormessage")&&i("problem",`"${g}" shows an error that isn't connected to the field.`,"Link the error text with aria-describedby and explain how to fix it.",p),n){let y=parseFloat(window.getComputedStyle(m).fontSize)||16;y<16&&i("improvement",`"${g}" text is ${y}px.`,"Use at least 16px in inputs; it is easier to read and stops mobile browsers from zooming.",p)}}r.length>o&&i("improvement",`This form has ${r.length} fields on one screen.`,`Split it into steps of about ${o} fields with a progress indicator.`);let a=K(e,"button,input[type='submit'],input[type='button']");if(a.length===0)i("problem","No submit button found.",'Add a clear <button type="submit"> so the form can be completed with the keyboard.');else if(n){let p=ue(Le(a[a.length-1]));Fa.test(p)&&i("improvement",`The button says "${p}".`,'Name the result, e.g. "Send message" or "Book appointment".')}!K(e,"[role='alert'],[aria-live]",{includeHidden:!0}).length&&r.some(p=>p.required)&&i("improvement","No live region for error messages.",'Add an element with role="alert" so errors are announced when the form is submitted.');let l=s.filter(p=>p.level==="problem").length,c=s.length-l,d=Math.max(0,100-l*15-c*4),h=e.getAttribute("aria-label")||ue(e.querySelector("legend,h1,h2,h3")?.textContent)||e.getAttribute("name")||e.getAttribute("id")||"Form";return{name:fe(h,50),selector:Oe(e),fields:r,findings:s,score:d,summary:s.length===0?`"${fe(h,40)}" looks clear: ${r.length} labelled field(s), nothing to fix.`:`"${fe(h,40)}" has ${r.length} field(s): ${l} problem(s) and ${c} suggestion(s). Score ${d}/100.`}}function Gt(e={}){let t=Ee(e.root);return t?K(t,"form,[role='form']").map(n=>gi(n,e)):[]}function mi(e){let t=Ee(e),n={title:"",description:"",language:"",headings:[],landmarks:{},counts:{links:0,buttons:0,images:0,forms:0,tables:0,fields:0},unlabeledFields:[],imagesWithoutAlt:[],purpose:""};if(!t)return n;let o=tt(t)?t:t.ownerDocument,r=K(t,"h1,h2,h3,h4,h5,h6").map(d=>({level:Number(d.tagName[1]),text:fe(d.textContent??"",80)})),s={};for(let[d,h]of Object.entries({header:"header,[role='banner']",navigation:"nav,[role='navigation']",main:"main,[role='main']",search:"search,[role='search']",footer:"footer,[role='contentinfo']"}))s[d]=K(t,h).length;let i=K(t,"input,select,textarea").filter(d=>!["hidden","submit","button","reset","image"].includes((d.getAttribute("type")??"text").toLowerCase())),a=i.filter(d=>!Le(d)).map(d=>({type:d.tagName==="INPUT"?d.getAttribute("type")??"text":d.tagName.toLowerCase(),hint:d.getAttribute("placeholder")||d.getAttribute("name")||"",selector:Oe(d)})),l=K(t,"img:not([alt])").map(d=>({src:d.getAttribute("src")??"",selector:Oe(d)})),c={title:o.title,description:ue(o.querySelector('meta[name="description"]')?.getAttribute("content")),language:o.documentElement.getAttribute("lang")??"",headings:r,landmarks:s,counts:{links:K(t,"a[href]").length,buttons:K(t,"button,[role='button'],input[type='submit']").length,images:K(t,"img").length,forms:K(t,"form,[role='form']").length,tables:K(t,"table,[role='grid'],[role='table']").length,fields:i.length},unlabeledFields:a,imagesWithoutAlt:l,purpose:""};return c.purpose=Ga(c,i),c}function Ga(e,t){let n=e.headings.find(i=>i.level===1)?.text||e.title||"This page",o=t.map(i=>`${i.getAttribute("type")} ${i.getAttribute("name")} ${Le(i)}`).join(" ").toLowerCase(),r=[];/password/.test(o)?r.push("sign in or create an account"):(/search|query|వెతుకు/.test(o)||e.landmarks.search)&&r.push("search"),/message|comment|feedback|contact|enquiry/.test(o)&&r.push("send a message"),/card|payment|upi|amount/.test(o)&&r.push("make a payment"),e.counts.tables&&r.push(`browse ${e.counts.tables} table(s) of data`),!r.length&&e.counts.forms&&r.push(`fill in ${e.counts.forms} form(s)`),r.length||r.push("read content");let s=e.headings.filter(i=>i.level===2).slice(0,5).map(i=>i.text);return[`"${n}" lets you ${r.join(", ")}.`,e.description?`It describes itself as: ${fe(e.description,140)}`:"",s.length?`Main sections: ${s.join(" \xB7 ")}.`:""].filter(Boolean).join(" ")}var za=[["missing-labels",/label|unlabel|లేబుల్/i],["images",/image|alt text|picture|photo|చిత్ర/i],["structure",/heading|structure|outline|section|landmark|శీర్షిక/i],["forms",/form|field|input|ఫారం/i],["links",/link|లింక్/i],["counts",/how many|count|ఎన్ని/i],["purpose",/what (does|is)|purpose|about|summar|explain|ఏమి|గురించి/i]];function fi(e){for(let[t,n]of za)if(n.test(e))return t;return"unknown"}async function so(e,t={}){let n=mi(t.root),o=fi(e);switch(o){case"missing-labels":return n.unlabeledFields.length?{intent:o,answer:`${n.unlabeledFields.length} of ${n.counts.fields} field(s) have no label: ${n.unlabeledFields.map(r=>`${r.type}${r.hint?` ("${r.hint}")`:""}`).join(", ")}.`,targets:n.unlabeledFields.map(r=>r.selector),suggestions:["Add a visible <label for=\u2026> to each field.","Run the Accessibility Copilot to add aria-labels from placeholders as a quick fix."]}:{intent:o,answer:`All ${n.counts.fields} form field(s) have labels.`,targets:[],suggestions:[]};case"images":return{intent:o,answer:n.imagesWithoutAlt.length?`${n.imagesWithoutAlt.length} of ${n.counts.images} image(s) have no alt text.`:`All ${n.counts.images} image(s) have alt text.`,targets:n.imagesWithoutAlt.map(r=>r.selector),suggestions:n.imagesWithoutAlt.length?['Describe meaningful images in alt; use alt="" for decorative ones.']:[]};case"structure":{let r=n.headings.slice(0,15).map(i=>`${"  ".repeat(i.level-1)}h${i.level} ${i.text}`).join(`
`),s=Object.entries(n.landmarks).filter(([,i])=>i===0).map(([i])=>i);return{intent:o,answer:`${n.headings.length} heading(s).
${r}${s.length?`
Missing landmarks: ${s.join(", ")}.`:""}`,targets:[],suggestions:s.includes("main")?["Wrap the primary content in <main>."]:[]}}case"forms":{let r=Gt({root:t.root});return{intent:o,answer:r.length?r.map(s=>s.summary).join(`
`):"There are no forms on this page.",targets:r.flatMap(s=>s.findings.map(i=>i.selector).filter(i=>!!i)),suggestions:r.flatMap(s=>s.findings.slice(0,3).map(i=>i.suggestion))}}case"links":case"counts":{let r=n.counts;return{intent:o,answer:`${r.links} links, ${r.buttons} buttons, ${r.fields} form fields in ${r.forms} form(s), ${r.images} images, ${r.tables} tables.`,targets:[],suggestions:[]}}case"purpose":case"unknown":{let r=n.purpose;if(t.summarize)try{let i=Ee(t.root),a=ue((i&&tt(i)?i.body:i)?.textContent).slice(0,4e3);r=await t.summarize(a)||r}catch{}let s=[];return n.unlabeledFields.length&&s.push(`${n.unlabeledFields.length} form field(s) need labels.`),n.imagesWithoutAlt.length&&s.push(`${n.imagesWithoutAlt.length} image(s) need alt text.`),{intent:o,answer:r,targets:[],suggestions:s}}}}C();var De=e=>String(e??"").normalize("NFC").toLowerCase().replace(/\s+/g," ").trim(),Oa=new Set("show me find list get give which who what all the a an rows row records record entries with where that are is have has having and or of for in on to please display only those whose any".split(" "));function rn(e){let t=De(e).replace(/(₹|rs\.?|inr|\$|usd|€|£)/g," ").match(/(-?\d[\d,]*(?:\.\d+)?|-?\.\d+)\s*(k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion)?(?![\p{L}])/u);if(!t)return null;let n=Number(t[1].replace(/,/g,""));if(!Number.isFinite(n))return null;let o=t[2]??"",r=/^k|thousand/.test(o)?1e3:/^la/.test(o)?1e5:/^(crore|cr)/.test(o)?1e7:/^(m|mn|million)$/.test(o)?1e6:/^(bn|billion)$/.test(o)?1e9:1;return n*r}function yi(e){let t=new Set([De(e.label),De(e.key),De(e.key.replace(/[_-]+/g," ").replace(/([a-z])([A-Z])/g,"$1 $2"))]);for(let n of Array.from(t))n.endsWith("s")?t.add(n.slice(0,-1)):t.add(`${n}s`);return Array.from(t).filter(n=>n.length>1)}function Ne(e,t,n){let o=` ${De(e)} `,r;for(let s of t)if(!(n&&(s.type??"text")!==n))for(let i of yi(s)){let a=i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${a}($|[^\\p{L}\\p{M}\\p{N}])`,"u").test(o)&&(!r||i.length>r.length)&&(r={column:s,length:i.length})}return r?.column}var Da=/amount|balance|total|price|salary|value|due|revenue|cost|fee|sales|outstanding|paid/i;function ao(e){let t=e.filter(n=>n.type==="number");return t.find(n=>Da.test(`${n.key} ${n.label}`))??t[0]}var on=/(>=|=>|>|\bover\b|\babove\b|\bmore than\b|\bgreater than\b|\bexceeds?\b|\bexceeding\b|\bhigher than\b|\bat least\b|\bminimum\b|\bmin\b|కంటే ఎక్కువ)/,lo=/(<=|=<|<|\bunder\b|\bbelow\b|\bless than\b|\blower than\b|\bat most\b|\bmaximum\b|\bmax\b|\bup to\b|కంటే తక్కువ)/,hi=/\b(after|since|from)\b/,Wa=/\b(before|until|till)\b/,Ba="(?:\\s*(?:k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion))?",co=`(?:\u20B9|rs\\.?\\s*|\\$)?\\s*-?\\d[\\d,]*(?:\\.\\d+)?${Ba}`;function nt(e,t,n={}){let o={filters:[],search:[],sort:null,limit:null,notes:[],explanation:""},r=De(e).replace(/[?!]+/g," ").replace(/\.(?!\d)/g," ").trim(),s=[],i=r.match(/\b(top|first|bottom|last|lowest|highest)\s+(\d+)\b/);i&&(o.limit=Number(i[2]),r=r.replace(i[0],` ${i[1]} `));let a=r.match(/\b(?:sort(?:ed)?|order(?:ed)?)\s+by\s+([\p{L}\p{M}\p{N} _]+?)(?:\s+(asc|ascending|desc|descending))?(?=$|,|\band\b|\bthen\b)/u),l=r.match(/\b(top|highest|largest|biggest|most|bottom|lowest|smallest|least)\b(?:\s+\d+)?\s+(?:by\s+)?([\p{L}\p{M}\p{N} _]+)/u);if(a){let g=Ne(a[1],t);g&&(o.sort={key:g.key,direction:/^desc/.test(a[2]??"")?"desc":"asc"},r=r.replace(a[0]," "))}else if(l){let g=Ne(l[2],t,"number")??Ne(l[2],t)??ao(t);if(g){let b=/top|highest|largest|biggest|most/.test(l[1]);o.sort={key:g.key,direction:b?"desc":"asc"},r=r.replace(new RegExp(`\\b${l[1]}\\b`)," "),!i&&/top|bottom/.test(l[1])&&(o.limit=10)}}let c=new RegExp(`\\bbetween\\s+(${co}|\\d{4}-\\d{2}-\\d{2})\\s+(?:and|to|-)\\s+(${co}|\\d{4}-\\d{2}-\\d{2})`,"u"),d;for(;d=r.match(c);){let g=r.slice(Math.max(0,(d.index??0)-40),d.index??0),b=/\d{4}-\d{2}-\d{2}/.test(d[1]),u=b?Ne(g,t,"date")??t.find(f=>f.type==="date"):Ne(g,t,"number")??ao(t),y=b?d[1]:rn(d[1]),k=b?d[2]:rn(d[2]);u&&y!==null&&k!==null&&(o.filters.push({key:u.key,operator:"between",value:[y,k]}),s.push(`${u.label} between ${d[1]} and ${d[2]}`)),r=r.replace(d[0]," ")}let h=r.split(/\s*(?:(?<!\d),|,(?!\d)|;|\band\b|(?<!(?:starts?|starting|ends?|ending|begins?|beginning)\s)\bwith\b|\bwhere\b|\bwho\b|\bthat\b|&|మరియు)\s*/u).map(g=>g.trim()).filter(Boolean),p=t.filter(g=>(g.type??"text")==="text"),m=new Map;for(let g of p){let b=new Set;for(let u of(n.data??[]).slice(0,5e3)){let y=De(u[g.key]);if(y&&y.length<=40&&b.add(y),b.size>300)break}b.size&&b.size<=300&&m.set(g.key,b)}for(let g of h){let b=o.filters.length,u=Ne(g,t),y=g.match(new RegExp(co,"u")),k=g.match(/\d{4}-\d{2}-\d{2}/);if(k&&(hi.test(g)||Wa.test(g)||on.test(g)||lo.test(g))){let f=(u?.type==="date"?u:void 0)??t.find(S=>S.type==="date");if(f){let S=hi.test(g)||on.test(g);o.filters.push({key:f.key,operator:S?"greaterThan":"lessThan",value:k[0]}),s.push(`${f.label} ${S?"after":"before"} ${k[0]}`)}}else if(y&&(on.test(g)||lo.test(g)||u?.type==="number"&&/\b(is|equals?)\b|=/.test(g))){let f=u?.type==="number"?u:void 0;f||(f=ao(t),f&&o.notes.push(`Assumed "${g}" refers to ${f.label}.`));let S=rn(y[0]);if(f&&S!==null){let w=/at least|minimum|\bmin\b|>=|=>|at most|maximum|\bmax\b|up to|<=|=</.test(g);on.test(g)?(o.filters.push({key:f.key,operator:"greaterThan",value:w?S-1e-9:S}),s.push(`${f.label} ${w?"\u2265":">"} ${S.toLocaleString("en-IN")}`)):lo.test(g)?(o.filters.push({key:f.key,operator:"lessThan",value:w?S+1e-9:S}),s.push(`${f.label} ${w?"\u2264":"<"} ${S.toLocaleString("en-IN")}`)):(o.filters.push({key:f.key,operator:"equals",value:S}),s.push(`${f.label} = ${S.toLocaleString("en-IN")}`))}}else{let f=g.match(/\b(?:starts?|starting|begins?|beginning)\s+with\s+(.+)$/),S=g.match(/\b(?:ends?|ending)\s+with\s+(.+)$/),w=g.match(/\b(?:contains?|containing|including|includes?|mentions?)\s+(.+)$/),E=g.match(/\b(?:is|equals?|=|:)\s+(.+)$/),I=f??S??w??E;if(I){let M=u??p[0],H=I[1].replace(/^["'“‘]|["'”’]$/g,"").trim();if(M&&H){let O=f?"startsWith":S?"endsWith":w?"contains":"equals";o.filters.push({key:M.key,operator:O,value:H}),s.push(`${M.label} ${O==="equals"?"is":O==="contains"?"contains":O==="startsWith"?"starts with":"ends with"} "${H}"`),u||o.notes.push(`Assumed "${g}" refers to ${M.label}.`)}}}if(o.filters.length===b)for(let[f,S]of m){let w="";for(let E of S){if(E.length<2||E.length<=w.length)continue;let I=E.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${I}($|[^\\p{L}\\p{M}\\p{N}])`,"u").test(g)&&(w=E)}if(w){let E=t.find(I=>I.key===f);o.filters.push({key:f,operator:"equals",value:w}),s.push(`${E.label} is "${w}"`)}}if(o.filters.length===b){let f=g.split(/\s+/).filter(w=>!Oa.has(w)&&!/^(top|first|bottom|last|lowest|highest|by|desc|asc|sort(ed)?)$/.test(w)),S=f.length>0&&f.every(w=>t.some(E=>yi(E).includes(w)));if(f.length&&!S&&!(u&&f.length===1)){let w=f.join(" ");/^(customers?|users?|people|items?|entries|poems?|orders?|products?|employees?|students?|members?)$/.test(w)||(o.search.push(w),s.push(`any column contains "${w}"`))}}}if(o.sort){let g=t.find(b=>b.key===o.sort.key)?.label??o.sort.key;s.push(`sorted by ${g} ${o.sort.direction==="desc"?"high \u2192 low":"low \u2192 high"}`)}return o.limit&&s.push(`first ${o.limit}`),o.explanation=s.length?`Showing rows where ${s.join(", ")}.`:"No conditions understood \u2014 showing all rows.",o}function Ha(e,t,n){return n==="number"?(Number(e)||0)-(Number(t)||0):n==="date"?(new Date(String(e)).getTime()||0)-(new Date(String(t)).getTime()||0):String(e??"").localeCompare(String(t??""),void 0,{numeric:!0})}function je(e,t,n){let o=_e(e,t,n.filters);for(let r of n.search)o=o.filter(s=>t.some(i=>De(s[i.key]).includes(r)));if(n.sort){let r=t.find(i=>i.key===n.sort.key),s=n.sort.direction==="desc"?-1:1;o=[...o].sort((i,a)=>s*Ha(i[n.sort.key],a[n.sort.key],r?.type))}return n.limit&&(o=o.slice(0,n.limit)),o}function xi(e,t,n={}){let o=nt(e,t.columns,{data:t.data}),r=je(t.data,t.columns,o),s=r.map(a=>me(a,t.rowKey)).filter(Boolean);n.apply!==!1&&(o.filters.length&&t.onFiltersChange?.(o.filters),o.sort&&t.onSortChange?.(o.sort),s.length&&t.onHighlightRows?.(s));let i=r.length?`${r.length} row(s) found. ${o.explanation}${o.notes.length?` (${o.notes.join(" ")})`:""}`:`No rows match. ${o.explanation}`;return{rows:r,ids:s,parsed:o,message:i}}function bi(e,t){let n=(e.length-1)*t,o=Math.floor(n),r=n-o;return e[o+1]!==void 0?e[o]+r*(e[o+1]-e[o]):e[o]}function sn(e,t,n={}){let o=n.factor??1.5,r=[],s=t.filter(c=>c.type==="number"&&(!n.columns||n.columns.includes(c.key))),i=c=>c.toLocaleString("en-IN",{maximumFractionDigits:2});for(let c of s){let d=e.map(y=>Number(y[c.key])).filter(y=>Number.isFinite(y));if(d.length<5)continue;let h=[...d].sort((y,k)=>y-k),p=bi(h,.25),m=bi(h,.75),g=m-p;if(g===0)continue;let b=p-o*g,u=m+o*g;for(let y of e){let k=Number(y[c.key]);!Number.isFinite(k)||k>=b&&k<=u||r.push({rowId:me(y,n.rowKey),column:c.key,label:c.label,value:k,kind:k>u?"high":"low",reason:`${c.label} ${i(k)} is far ${k>u?"above":"below"} the typical range (${i(p)}\u2013${i(m)}).`})}}let a=n.rowKey??"id",l=new Map;for(let c of e){let d=JSON.stringify(t.filter(m=>m.key!==a).map(m=>De(c[m.key]))),h=me(c,n.rowKey),p=l.get(d);p!==void 0?r.push({rowId:h,column:a,label:"Row",value:h,kind:"duplicate",reason:`Row ${h} has the same values as row ${p}.`}):l.set(d,h)}return r}function an(e,t){if(!e.length)return"No rows to summarise.";let n=[`${e.length} row(s).`],o=r=>r.toLocaleString("en-IN",{maximumFractionDigits:2});for(let r of t){let s=e.map(i=>i[r.key]);if(r.type==="number"){let i=s.map(Number).filter(Number.isFinite);if(!i.length)continue;let a=i.reduce((l,c)=>l+c,0);n.push(`${r.label}: total ${o(a)}, average ${o(a/i.length)}, range ${o(Math.min(...i))}\u2013${o(Math.max(...i))}.`)}else if(r.type==="date"){let i=s.map(l=>new Date(String(l)).getTime()).filter(Number.isFinite);if(!i.length)continue;let a=l=>new Date(l).toISOString().slice(0,10);n.push(`${r.label}: from ${a(Math.min(...i))} to ${a(Math.max(...i))}.`)}else{let i=new Map;for(let l of s){let c=String(l??"").trim();c&&i.set(c,(i.get(c)??0)+1)}if(i.size===0||i.size>Math.max(8,e.length/3))continue;let a=Array.from(i.entries()).sort((l,c)=>c[1]-l[1]).slice(0,4);n.push(`${r.label}: ${a.map(([l,c])=>`${l} (${c})`).join(", ")}.`)}}return n.join(`
`)}function uo(e,t){let n=De(e);if(/unusual|anomal|outlier|odd|strange|suspicious|duplicate|అసాధారణ/.test(n)){let r=sn(t.data,t.columns,{rowKey:t.rowKey}),s=Array.from(new Set(r.map(a=>a.rowId)));s.length&&t.onHighlightRows?.(s);let i=new Set(s);return{kind:"anomalies",message:r.length?`${s.length} unusual row(s):
${r.slice(0,10).map(a=>`\u2022 ${a.reason}`).join(`
`)}`:"Nothing unusual found.",ids:s,rows:t.data.filter(a=>i.has(me(a,t.rowKey))),anomalies:r}}if(/summar|overview|describe|సారాంశం/.test(n)){let r=_e(t.data,t.columns,t.filters??[]);return{kind:"summary",message:an(r,t.columns),ids:[],rows:r}}let o=xi(e,t);return{kind:"query",message:o.message,ids:o.ids,rows:o.rows}}C();var _a=/\b(off|disable|stop|remove|no more|turn off|switch off|deactivate)\b|ఆఫ్|ఆపు|తీసివేయి|बंद/i,qa=[{pattern:/high contrast|contrast|హై కాంట్రాస్ట్|కాంట్రాస్ట్/i,key:"highContrast",name:"High contrast"},{pattern:/dark mode|dark theme|night mode|డార్క్ మోడ్|చీకటి/i,key:"darkMode",name:"Dark mode"},{pattern:/reduce motion|less motion|stop animation|animations?|కదలికలు/i,key:"reduceMotion",name:"Reduced motion"},{pattern:/large targets?|bigger buttons?|big buttons?|larger buttons?|పెద్ద బటన్/i,key:"largeTargets",name:"Large targets"},{pattern:/dyslexia|readable font|easy font/i,key:"dyslexiaFont",name:"Dyslexia-friendly font"},{pattern:/speak on focus|read aloud|read out|screen reader|speech|చదివి వినిపించు/i,key:"speechEnabled",name:"Speak on focus"},{pattern:/skip links?/i,key:"showSkipLinks",name:"Skip links"}],ja=[[/deuteranop|green.?blind/i,"deuteranopia"],[/protanop|red.?blind/i,"protanopia"],[/tritanop|blue.?blind/i,"tritanopia"],[/grey ?scale|gray ?scale|achromat|black and white/i,"achromatopsia"]],po=.1,wi=.8,vi=1.3;function ki(e,t={}){let n=e.trim().toLowerCase();if(!n)return null;if(/\b(next|down)\s+(row|line|record|item)\b|తర్వాతి (వరుస|అంశం)/.test(n))return{type:"grid",action:"next-row",say:"Next row."};if(/\b(previous|prev|back|up)\s+(row|line|record|item)\b|ముందరి (వరుస|అంశం)|వెనుక (వరుస|అంశం)/.test(n))return{type:"grid",action:"previous-row",say:"Previous row."};if(/\bfirst\s+(row|record|item)\b|మొదటి (వరుస|అంశం)/.test(n))return{type:"grid",action:"first-row",say:"First row."};if(/\blast\s+(row|record|item)\b|చివరి (వరుస|అంశం)/.test(n))return{type:"grid",action:"last-row",say:"Last row."};if(/\b(open|expand|read)\s+(this\s+)?(row|record|item)\b|ఈ (వరుస|అంశం) తెరువు/.test(n))return{type:"grid",action:"open-row",say:"Opening row."};if(/\b(reset|default|restore)\b.*\b(settings?|accessibility|everything|all)\b|^reset$|రీసెట్/.test(n))return{type:"reset",say:"Accessibility settings reset."};let o=t.fontSizeMultiplier??1,r=i=>Math.round(Math.min(vi,Math.max(wi,i))*100)/100;if(/\b(bigger|larger|increase|zoom in)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(bigger|larger|up)\b|పెద్ద అక్షరాలు|అక్షరాలు పెద్ద/.test(n)){let i=r(o+po);return{type:"setting",patch:{fontSizeMultiplier:i},say:`Text size ${Math.round(i*100)}%.`}}if(/\b(smaller|decrease|reduce|zoom out)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(smaller|down)\b|చిన్న అక్షరాలు|అక్షరాలు చిన్న/.test(n)){let i=r(o-po);return{type:"setting",patch:{fontSizeMultiplier:i},say:`Text size ${Math.round(i*100)}%.`}}if(/\b(normal|default|reset)\b.*\b(text|font)\s*(size)?\b/.test(n))return{type:"setting",patch:{fontSizeMultiplier:1},say:"Text size 100%."};let s=_a.test(n);for(let[i,a]of ja)if(i.test(n))return s?{type:"setting",patch:{colorBlindMode:"none"},say:"Colour filter off."}:{type:"setting",patch:{colorBlindMode:a},say:`${a} filter on.`};if(/colou?r.?blind/.test(n)&&s)return{type:"setting",patch:{colorBlindMode:"none"},say:"Colour filter off."};for(let i of qa){if(!i.pattern.test(n))continue;let a=/\btoggle\b/.test(n)?!t[i.key]:!s;return i.key==="reduceMotion"&&!/reduce motion|less motion|కదలికలు తగ్గించు/.test(n)&&/animations?/.test(n)&&(a=s||/\bno\b/.test(n)),{type:"setting",patch:{[i.key]:a},say:`${i.name} ${a?"on":"off"}.`}}return null}var go={highContrast:!1,darkMode:!1,reduceMotion:!1,largeTargets:!1,dyslexiaFont:!1,speechEnabled:!1,colorBlindMode:"none",fontSizeMultiplier:1};function Si(e,t={}){if(!Ge())return null;let n=t.root??document,o=t.rowSelector??"[data-yuktai-row-id], [role='row']",r=Array.from(n.querySelectorAll(o)).filter(c=>!c.querySelector("th,[role='columnheader']"));if(!r.length)return null;let s=document.activeElement?.closest(o),i=s?r.indexOf(s):-1;if(e==="open-row"){let c=i>=0?r[i]:r[0];return c.click(),c}let a=e==="first-row"?0:e==="last-row"?r.length-1:e==="next-row"?Math.min(r.length-1,i+1):Math.max(0,i-1),l=r[a];return l.hasAttribute("tabindex")||l.setAttribute("tabindex","-1"),l.focus(),l.scrollIntoView?.({block:"nearest"}),l}function mo(e={}){let t={enabled:!0,...go,...e.initial},n=null,o=!1,r=async c=>e.apply?e.apply(c):we.execute(c),s=c=>{if(e.speak===!1||!Ge()||!("speechSynthesis"in window))return;let d=new SpeechSynthesisUtterance(c);d.lang=e.lang??"en-IN",window.speechSynthesis.cancel(),window.speechSynthesis.speak(d)};async function i(c){let d=ki(c,t);if(e.onTranscript?.(c,d),!d)return null;if(d.type==="grid"){let h=Si(d.action,{root:e.gridRoot});return s(h?d.say:"No table rows found."),d}return t=d.type==="reset"?{...t,...go}:{...t,...d.patch},await r(t),s(d.say),d}function a(){if(!Ge()||o)return o;let c=window,d=c.SpeechRecognition??c.webkitSpeechRecognition;return d?(n=new d,n.lang=e.lang??"en-IN",n.continuous=!0,n.interimResults=!1,n.onresult=h=>{let p=h.results,m=p[p.length-1];m?.[0]?.transcript&&i(m[0].transcript)},n.onend=()=>{o&&n?.start()},n.onerror=h=>{(h.error==="not-allowed"||h.error==="service-not-allowed")&&(o=!1)},o=!0,n.start(),!0):!1}function l(){o=!1,n?.stop(),n=null}return{start:a,stop:l,handle:i,isListening:()=>o,getConfig:()=>({...t})}}C();var Ua=new Set("a an the is are was were be to of and or in on at for with what which who whom how why when where does do did this that these those it its from by as about any all please tell me show give".split(" "));function zt(e){return(e.normalize("NFC").toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu)??[]).filter(t=>t.length>1&&!Ua.has(t))}function Ti(e,t=600){let n=Ee(e);if(!n)return[];let o=[],r="",s="",i=()=>{s.trim()&&o.push({id:`page-${o.length+1}`,source:"page",text:s.trim(),ref:r||void 0}),s=""};for(let a of K(n,"h1,h2,h3,h4,p,li,td,th,dt,dd,blockquote,figcaption,label,summary")){if(a.querySelector("p,li,h1,h2,h3,h4"))continue;let l=ue(a.textContent);if(l){if(/^H[1-4]$/.test(a.tagName)){i(),r=l,s=`${l}. `;continue}s.length+l.length>t&&i(),s+=`${l} `}}return i(),o}function Ai(e,t,n="id"){return e.map((o,r)=>{let s=o,i=String(s[n]??r+1);return{id:`grid-${i}`,source:"grid",ref:i,text:t.map(a=>`${a.label}: ${String(s[a.key]??"")}`).join(". ")}})}function fo(e={}){let t=[],n=[],o=new Map,r=0;function s(){t=[...e.includePage===!1?[]:Ti(e.root),...e.rows&&e.columns?Ai(e.rows,e.columns,e.rowKey):[],...(e.documents??[]).map(l=>({id:l.id,source:"custom",text:l.text}))],n=t.map(l=>zt(l.text)),o=new Map;for(let l of n)for(let c of new Set(l))o.set(c,(o.get(c)??0)+1);r=n.reduce((l,c)=>l+c.length,0)/Math.max(1,n.length)}s();function i(l,c=5){let d=zt(l);if(!d.length)return[];let h=n.length;return n.map((m,g)=>{let b=0;for(let u of d){let y=0;for(let f of m)(f===u||u.length>=4&&f.startsWith(u)||f.length>=4&&u.startsWith(f))&&y++;if(!y)continue;let k=Math.log(1+(h-(o.get(u)??1)+.5)/((o.get(u)??1)+.5));b+=k*(y*2.2/(y+1.2*(.25+.75*(m.length/(r||1)))))}return{...t[g],score:b}}).filter(m=>m.score>0).sort((m,g)=>g.score-m.score).slice(0,c)}async function a(l,c={}){let d=i(l,c.k??4);if(!d.length)return{answer:"I couldn't find anything about that on this page or in the data.",hits:d,generated:!1};if(c.generate)try{let g=d.map((u,y)=>`[${y+1}] ${u.text}`).join(`
`),b=await c.generate(l,g);if(b?.trim())return{answer:b.trim(),hits:d,generated:!0}}catch{}let h=new Set(zt(l)),p=d.flatMap(g=>g.text.split(/(?<=[.!?।])\s+|\.\s+(?=\p{Lu})/u).map(b=>({s:b.trim(),h:g}))).map(({s:g,h:b})=>({s:g,h:b,overlap:zt(g).filter(u=>h.has(u)).length})).filter(g=>g.s&&g.overlap>0).sort((g,b)=>b.overlap-g.overlap).slice(0,3);return{answer:p.length?p.map(g=>g.h.source==="grid"?`Row ${g.h.ref}: ${g.s}`:g.s).join(`
`):d[0].text.slice(0,300),hits:d,generated:!1}}return{search:i,ask:a,rebuild:s,update(l){Object.assign(e,l),s()},size:()=>t.length}}C();var Ei="highlight|mark|flag|sort|order|rank|arrange|summari[sz]e|summary|recap|count|how many|open|select|pick|show|filter|find|list|clear|reset|remove|detect|spot|tell";function ln(e){return e.replace(/[?!]/g," ").split(/\s*(?:;|\.(?!\d)\s*|,?\s*\band then\b|,?\s*\bthen\b|,?\s*\bafter that\b|,?\s*\bfinally\b|,?\s*\bnext\b|ఆ తర్వాత)\s*/i).flatMap(o=>o.split(new RegExp(`\\s*(?:,|\\band\\b)\\s+(?=(?:${Ei})\\b)`,"i"))).map(o=>o.trim()).filter(o=>o.length>1).map(o=>({action:Va(o),text:o}))}function Va(e){let t=e.toLowerCase();return/^(clear|reset|remove)\b/.test(t)?"clear":/unusual|anomal|outlier|suspicious|odd ones|duplicate/.test(t)?"anomalies":/summari[sz]e|summary|what changed|recap|overview/.test(t)?"summarize":/^(highlight|mark|flag)\b/.test(t)?"highlight":/^(sort|order|rank|arrange)\b/.test(t)?"sort":/^(count|how many)\b/.test(t)?"count":/^(open|go to)\b/.test(t)&&!/filtered|results?/.test(t)?"open":/^(select|pick)\b/.test(t)?"select":"filter"}function Ya(e){return e.replace(new RegExp(`^\\s*(?:${Ei}|open|go to)\\b`,"i")," ").replace(/\b(the|filtered|results?|rows?|records?|entries|items?|ones|them|those|only|me|all)\b/gi," ").replace(/\s+/g," ").trim()}function Ci(e,t){let n=t.find(s=>s.key===e.key)?.label??e.key,o=Array.isArray(e.value)?`${e.value[0]}\u2013${e.value[1]}`:typeof e.value=="number"?e.value.toLocaleString("en-IN",{maximumFractionDigits:2}):`"${e.value}"`,r={contains:"contains",equals:"is",startsWith:"starts with",endsWith:"ends with",greaterThan:">",lessThan:"<",between:"between"}[e.operator];return`${n} ${r} ${o}`}async function ho(e,t,n={}){let o=ln(e),{columns:r,data:s}=t,i=[...t.filters??[]],a=[],l=null,c=[],d=()=>je(s,r,{filters:i,search:a,sort:l,limit:null,notes:[],explanation:""}),h={rows:d().length,filters:[...i]},p=[],m=()=>({...t,filters:i});for(let b=0;b<o.length;b++){let u=o[b],y=Ya(u.text),k;try{switch(u.action){case"clear":{i=[],a=[],l=null,c=[],t.onFiltersChange?.([]),t.onSortChange?.(null),t.onHighlightRows?.([]),k={...u,success:!0,message:`Cleared filters, sorting and highlights. ${s.length} row(s) shown.`};break}case"filter":{let f=nt(y,r,{data:s});if(!f.filters.length&&!f.search.length&&!f.sort){k={...u,success:!0,message:`Showing ${d().length} row(s) with the current filters.`};break}for(let E of f.filters)i=[...i.filter(I=>I.key!==E.key),E];a=[...a,...f.search],f.sort&&(l=f.sort,t.onSortChange?.(l)),t.onFiltersChange?.(i);let S=d(),w=S.map(E=>me(E,t.rowKey)).filter(Boolean);f.search.length&&w.length&&(c=w,t.onHighlightRows?.(w)),k={...u,success:!0,message:`${S.length} row(s) now shown. ${f.explanation}`,ids:w};break}case"highlight":{let f=d(),S=nt(y,r,{data:f}),E=(S.filters.length||S.search.length?je(f,r,{...S,sort:null,limit:S.limit}):f).map(M=>me(M,t.rowKey)).filter(Boolean);if(!E.length){k={...u,success:!1,message:`Nothing to highlight for "${y||"all rows"}".`};break}let I=gt(m(),E);I.success&&(c=I.data??E),k={...u,success:I.success,message:I.success?`Highlighted ${c.length} row(s)${y?` matching "${y}"`:""}.`:I.message,ids:c};break}case"sort":{let S=nt(u.text,r,{data:s}).sort;if(!S){let E=Ne(y,r);E&&(S={key:E.key,direction:/desc|high|large|big|most|newest|latest|z.?to.?a/i.test(u.text)?"desc":"asc"})}if(!S){k={...u,success:!1,message:`Which column should I sort by? Columns: ${r.map(E=>E.label).join(", ")}.`};break}l=S,t.onSortChange?.(l);let w=r.find(E=>E.key===l.key)?.label??l.key;k={...u,success:!0,message:`Sorted by ${w} (${l.direction==="desc"?"high \u2192 low":"low \u2192 high"}).`};break}case"count":{k={...u,success:!0,message:`${d().length} row(s) shown${c.length?`, ${c.length} highlighted`:""}.`};break}case"anomalies":{let f=d(),S=sn(f,r,{rowKey:t.rowKey}),w=Array.from(new Set(S.map(E=>E.rowId)));if(w.length){let E=gt(m(),w);E.success&&(c=E.data??w)}k={...u,success:!0,message:S.length?`${w.length} unusual row(s): ${S.slice(0,5).map(E=>E.reason).join(" ")}`:"Nothing unusual in the shown rows.",ids:w};break}case"open":case"select":{let f=d(),w=f.find(M=>y&&me(M,t.rowKey).toLowerCase()===y.toLowerCase())??je(f,r,nt(y,r,{data:f}))[0]??(y?void 0:f[0]);if(!w){k={...u,success:!1,message:`No row matches "${y}".`};break}let E=me(w,t.rowKey),I=u.action==="open"?Ct(m(),E):At(m(),E);k={...u,success:I.success,message:I.message,ids:[E]};break}case"summarize":{let f=d();k={...u,success:!0,message:`${Ri(h,f.length,i,l,c,r)}
${an(f,r)}`};break}}}catch(f){k={...u,success:!1,message:`This step failed: ${f instanceof Error?f.message:String(f)}`}}p.push(k),n.onStep?.(k,b,o.length)}let g=d().length;return{steps:p,before:h,after:{rows:g,filters:i,sort:l,highlighted:c},summary:Ri(h,g,i,l,c,r)}}function Ri(e,t,n,o,r,s){let i=[`Rows: ${e.rows} \u2192 ${t}.`],a=n.filter(c=>!e.filters.some(d=>JSON.stringify(d)===JSON.stringify(c))),l=e.filters.filter(c=>!n.some(d=>JSON.stringify(c)===JSON.stringify(d)));return a.length&&i.push(`Filters added: ${a.map(c=>Ci(c,s)).join("; ")}.`),l.length&&i.push(`Filters removed: ${l.map(c=>Ci(c,s)).join("; ")}.`),o&&i.push(`Sorted by ${s.find(c=>c.key===o.key)?.label??o.key} ${o.direction==="desc"?"high \u2192 low":"low \u2192 high"}.`),r.length&&i.push(`${r.length} row(s) highlighted.`),i.join(" ")}C();var dn=e=>{let t=typeof e=="number"?e:Number(String(e??"").replace(/[,₹$%\s]/g,""));return Number.isFinite(t)?t:null},Ii=e=>{let t=e instanceof Date?e.getTime():new Date(String(e??"")).getTime();return Number.isFinite(t)?t:null};function ft(e,t){if(t==="count")return e.length;if(!e.length)return 0;switch(t){case"sum":return e.reduce((n,o)=>n+o,0);case"avg":return e.reduce((n,o)=>n+o,0)/e.length;case"min":return Math.min(...e);case"max":return Math.max(...e)}}function $i(e,t,n,o="sum"){let r=new Map;for(let s of e){let i=String(s[t]??"\u2014").trim()||"\u2014",a=r.get(i)??[];if(n===null||o==="count")a.push(1);else{let l=dn(s[n]);l!==null&&a.push(l)}r.set(i,a)}return Array.from(r.entries()).map(([s,i])=>({group:s,value:ft(i,o),count:i.length})).sort((s,i)=>i.value-s.value)}function yo(e,t,n=1){let o=new Date(e);return o.setHours(0,0,0,0),t==="week"&&o.setDate(o.getDate()-(o.getDay()-n+7)%7),t==="month"&&o.setDate(1),t==="quarter"&&o.setMonth(Math.floor(o.getMonth()/3)*3,1),t==="year"&&o.setMonth(0,1),o}function cn(e,t,n){let o=new Date(e);return t==="day"&&o.setDate(o.getDate()+n),t==="week"&&o.setDate(o.getDate()+7*n),t==="month"&&o.setMonth(o.getMonth()+n),t==="quarter"&&o.setMonth(o.getMonth()+3*n),t==="year"&&o.setFullYear(o.getFullYear()+n),o}function Li(e,t){let n=t.referenceDate?new Date(t.referenceDate):new Date,o=yo(n,t.period,t.weekStartsOn),r=t.toDate===!1?cn(o,t.period,1):new Date(Math.max(n.getTime()+1,o.getTime()+1)),s=cn(o,t.period,-1),i=t.toDate===!1?o:new Date(s.getTime()+(r.getTime()-o.getTime())),a=t.agg??"sum",l=new Map,c=new Map;for(let p of e){let m=Ii(p[t.dateKey]);if(m===null)continue;let g=m>=o.getTime()&&m<r.getTime()?l:m>=s.getTime()&&m<i.getTime()?c:null;if(!g)continue;let b=t.groupKey?String(p[t.groupKey]??"\u2014"):"All",u=a==="count"?1:dn(p[t.metricKey]);u!==null&&g.set(b,[...g.get(b)??[],u])}let d=new Set([...l.keys(),...c.keys()]),h=Array.from(d).map(p=>{let m=ft(l.get(p)??[],a),g=ft(c.get(p)??[],a);return{group:p,current:m,previous:g,change:m-g,changePct:g===0?null:(m-g)/Math.abs(g)*100}});return{period:t.period,current:{from:o,to:r},previous:{from:s,to:i},rows:h}}function Ni(e,t,n,o,r="sum"){let s=new Map;for(let i of e){let a=Ii(i[t]),l=r==="count"?1:dn(i[n]);if(a===null||l===null)continue;let c=yo(new Date(a),o).getTime();s.set(c,[...s.get(c)??[],l])}return Array.from(s.entries()).sort((i,a)=>i[0]-a[0]).map(([i,a])=>({start:new Date(i),value:ft(a,r)}))}var Ka=/rate|conversion|ratio|percent|%|score|rating|margin|ctr|avg|average/i;function Qa(e){let t=e.match(/\b(today|yesterday|this|last|previous|past)\s*(day|week|month|quarter|year)?\b/);return t?t[1]==="today"?{period:"day",shift:0}:t[1]==="yesterday"?{period:"day",shift:-1}:t[2]?{period:t[2],shift:t[1]==="this"?0:-1}:null:null}var Se=e=>e.toLocaleString("en-IN",{maximumFractionDigits:2}),bo=e=>e===null?"new":`${e>0?"+":""}${e.toFixed(1)}%`;function xo(e,t,n,o={}){let r=e.toLowerCase(),s=n.filter(f=>f.type==="number"),i=Ne(r,n,"number")??s.find(f=>/amount|revenue|sales|total|value/i.test(`${f.key} ${f.label}`))??s[0],a=n.find(f=>f.type==="date")??n.find(f=>/date|time|day|created|month/i.test(`${f.key} ${f.label}`)),l=r.match(/\b(?:which|by|per|each|across|every|top|for each)\s+([\p{L}\p{M}\p{N} _]+)/u)?.[1]??"",c=Ne(l,n,"text"),d=/how many|number of|count/.test(r),h=d?"count":/average|avg|mean/.test(r)?"avg":/\btotal\b|\bsum\b/.test(r)?"sum":i&&Ka.test(`${i.key} ${i.label}`)?"avg":"sum",p=/drop|decline|decrease|fell|fall|down|worst|lost|shrink|reduc/.test(r),m=/increase|growth|grew|rise|rose|up\b|best|improv|gain/.test(r),g=/lowest|least|smallest|bottom|worst|minimum/.test(r),b=Qa(r);if(!i&&!d)return{kind:"unknown",answer:"I couldn't find a numeric column to analyse.",table:[]};let u=d?"rows":i.label;if(b&&a&&(m||p||/change|compare|vs|versus/.test(r))){let f=o.referenceDate?new Date(o.referenceDate):new Date,S=b.shift?cn(f,b.period,b.shift):f,E=[...Li(t,{dateKey:a.key,metricKey:i?.key??a.key,groupKey:c?.key,agg:h,period:b.period,referenceDate:S,toDate:b.shift===0}).rows].sort((Y,j)=>p?Y.change-j.change:j.change-Y.change),I=E.map(Y=>({[c?.label??"Group"]:Y.group,Current:Se(Y.current),Previous:Se(Y.previous),Change:Se(Y.change),"Change %":bo(Y.changePct)}));if(!E.length)return{kind:"period-change",answer:`No ${u} data in this ${b.period} or the one before.`,table:I};let M=E[0],H=`${b.shift?"last":"this"} ${b.period} vs the ${b.period} before`,O=M.change===0?"did not change":M.change<0?`dropped ${Se(Math.abs(M.change))}`:`rose ${Se(M.change)}`,F=`${u} ${O} (${Se(M.previous)} \u2192 ${Se(M.current)}, ${bo(M.changePct)}) \u2014 ${H}.`,$=p&&M.change>=0||m&&M.change<=0;return{kind:"period-change",answer:c?$?`No ${c.label.toLowerCase()} ${p?"dropped":"grew"}. Closest is ${M.group}: ${F}`:`${M.group}: ${F}`:F,table:I}}if(/trend|over time|month by month|week by week/.test(r)&&a&&i){let f=/week/.test(r)?"week":/day|daily/.test(r)?"day":/year/.test(r)?"year":"month",S=Ni(t,a.key,i.key,f,h),w=S.map(H=>({Period:H.start.toISOString().slice(0,10),[i.label]:Se(H.value)}));if(S.length<2)return{kind:"trend",answer:`Not enough ${f}s of data for a trend.`,table:w};let E=S[0].value,I=S[S.length-1].value,M=S.reduce((H,O)=>O.value>H.value?O:H);return{kind:"trend",answer:`${i.label} went from ${Se(E)} to ${Se(I)} over ${S.length} ${f}s (${bo(E?(I-E)/Math.abs(E)*100:null)}). Peak: ${Se(M.value)} in the ${f} of ${M.start.toISOString().slice(0,10)}.`,table:w}}if(c){let f=$i(t,c.key,i?.key??null,h),S=g?[...f].reverse():f,w=S.map(I=>({[c.label]:I.group,[`${h} of ${u}`]:Se(I.value),Rows:I.count}));if(!S.length)return{kind:"group",answer:"No data.",table:w};let E=S[0];return{kind:"group",answer:`${E.group} has the ${g?"lowest":"highest"} ${h==="sum"?"total":h==="avg"?"average":h} ${u}: ${Se(E.value)} (across ${S.length} ${c.label.toLowerCase()} groups).`,table:w}}let y=d?t.map(()=>1):t.map(f=>dn(f[i.key])).filter(f=>f!==null),k=ft(y,h);return{kind:"total",answer:`${h==="avg"?"Average":h==="count"?"Count of":h==="sum"?"Total":h} ${u}: ${Se(k)} across ${t.length} row(s).`,table:[{Metric:u,Aggregation:h,Value:Se(k)}]}}C();var Fi={high:12,medium:6,low:2};function wo(e={}){let t=Ee(e.root),n=[],o=(a,l,c,d,h)=>n.push({category:a,severity:l,message:c,suggestion:d,selector:h?Oe(h):void 0});if(t&&Ge()){let a=e.minFontSize??14,l=e.maxLineLength??90,c=F=>window.getComputedStyle(F),d=K(t,"h1");d.length===0&&o("hierarchy","medium","There is no h1, so the page has no clear main title.","Add one prominent h1 near the top."),d.length>1&&o("hierarchy","low",`${d.length} h1 headings compete for attention.`,"Keep one h1 and demote the rest.",d[1]);let h=F=>{let $=K(t,F)[0];return $&&parseFloat(c($).fontSize)||0},[p,m,g]=[h("h1"),h("h2"),h("h3")];p&&m&&m>=p&&o("hierarchy","medium",`h2 (${m}px) is as large as or larger than h1 (${p}px).`,"Make each heading level visibly smaller than the one above it."),m&&g&&g>m&&o("hierarchy","low",`h3 (${g}px) is larger than h2 (${m}px).`,"Keep heading sizes in descending order.");let b=qe({root:e.root,skip:["color-contrast","target-size","duplicate-id","page-title","html-lang","form-error","positive-tabindex"]});for(let F of b.issues.filter($=>$.rule==="heading-order").slice(0,3))o("hierarchy","low",F.message,F.fix,F.element);let u=0,y;for(let F of K(t,"p,li,td,span,a,label,small,div").slice(0,1500)){if(!Mt(F))continue;(parseFloat(c(F).fontSize)||16)<a&&(u++,y??=F)}u&&o("readability",u>10?"high":"medium",`${u} text element(s) are smaller than ${a}px, e.g. "${fe(y?.textContent??"",30)}".`,`Use at least ${a}px for body text (16px for senior-friendly pages).`,y);for(let F of K(t,"p").slice(0,200)){let $=c(F),x=parseFloat($.fontSize)||16,Y=F.getBoundingClientRect().width,j=Y/(x*.5);if(Y>0&&j>l&&(F.textContent??"").length>l){o("readability","low",`A paragraph is about ${Math.round(j)} characters wide.`,`Limit text width to ~${l} characters (e.g. max-width: 70ch).`,F);break}let J=parseFloat($.lineHeight);if(Number.isFinite(J)&&J/x<1.3){o("readability","low",`Line height is ${(J/x).toFixed(2)}\xD7 the font size.`,"Use line-height of at least 1.5 for body text (WCAG 1.4.12).",F);break}}let k=qe({root:e.root,skip:["html-lang","page-title","image-alt","heading-order","single-h1","landmark-main","form-label","button-name","link-name","positive-tabindex","keyboard-access","duplicate-id","form-error","target-size"]});k.issues.length&&o("readability",k.issues.length>5?"high":"medium",`${k.issues.length} text element(s) have weak contrast. ${k.issues[0].message}`,"Raise contrast to at least 4.5:1 for body text.",k.issues[0].element);let f=Xa();f.length&&o("interaction","high",`Focus outlines are removed by CSS (${f.slice(0,2).join(", ")}) with no replacement.`,"Never remove outlines without a visible :focus-visible style (WCAG 2.4.7).");let S=K(t,nn).filter(F=>{let $=F.getBoundingClientRect();return $.width>0&&$.height>0&&($.width<24||$.height<24)&&!(F.tagName==="A"&&F.closest("p,li"))});S.length&&o("interaction",S.length>5?"high":"medium",`${S.length} control(s) are smaller than 24\xD724px.`,"Give controls at least 24\xD724px, ideally 44\xD744px for touch and seniors.",S[0]);let w=window.innerHeight||800,E=K(t,ui).filter(F=>{let $=F.getBoundingClientRect();return $.height>0&&$.top<w});E.length>40&&o("clutter","medium",`${E.length} interactive elements in the first screen.`,"Group secondary actions into menus and keep the first screen focused on one task.");let I=K(t,"button,a[href],[role='button']").filter(F=>{let $=F.getBoundingClientRect();if($.height===0||$.top>w)return!1;let x=c(F).backgroundColor;return!!x&&!/rgba\(0, 0, 0, 0\)|transparent/.test(x)&&!/rgb\(255, 255, 255\)/.test(x)});I.length>4&&o("clutter","medium",`${I.length} filled buttons compete in the first screen.`,"Keep one primary action per view; make the rest secondary (outline or text).",I[0]);let M=new Set,H=new Set;for(let F of K(t,"body *").slice(0,2e3)){if(!Mt(F))continue;let $=c(F);M.add($.fontFamily.split(",")[0].replace(/["']/g,"").trim().toLowerCase()),H.add(Math.round(parseFloat($.fontSize)||0))}M.size>4&&o("consistency","low",`${M.size} different font families are used.`,"Stick to 1\u20132 font families (e.g. one Telugu + one Latin)."),H.size>10&&o("consistency","low",`${H.size} different font sizes are used.`,"Use a small type scale (5\u20137 sizes) for a calmer page.");let O=K(t,"img:not([width]):not([height])").filter(F=>!c(F).aspectRatio||c(F).aspectRatio==="auto");O.length>3&&o("consistency","low",`${O.length} images have no width/height, so the layout jumps while loading.`,"Set width and height (or aspect-ratio) on images.",O[0])}let r=["hierarchy","readability","interaction","clutter","consistency"].reduce((a,l)=>{let c=n.filter(d=>d.category===l);return a[l]={score:Math.max(0,100-c.reduce((d,h)=>d+Fi[h.severity]*2,0)),findings:c.length},a},{}),s=Math.max(0,100-n.reduce((a,l)=>a+Fi[l.severity],0)),i=Object.entries(r).sort((a,l)=>a[1].score-l[1].score)[0];return{score:s,categories:r,findings:n,summary:n.length?`Design score ${s}/100 with ${n.length} finding(s). Weakest area: ${i[0]}.`:"No design issues found by the automatic review."}}function Xa(){let e=[],t=!1,n=o=>{for(let r of Array.from(o)){let s=r.cssRules;s&&n(s);let i=r;if(!i.selectorText||!/:focus/.test(i.selectorText))continue;let a=`${i.style.outline} ${i.style.outlineStyle} ${i.style.outlineWidth}`,l=/\bnone\b|\b0(px)?\b/.test(a),c=!!(i.style.boxShadow&&i.style.boxShadow!=="none")||!!i.style.borderColor||!!i.style.backgroundColor||!!i.style.textDecoration;/:focus-visible/.test(i.selectorText)&&(!l||c)&&(t=!0),l&&!c&&e.push(i.selectorText)}};for(let o of Array.from(document.styleSheets))try{n(o.cssRules)}catch{}return t?[]:e}C();var V=require("react");var A=require("react/jsx-runtime"),Ja=/\b(trend|over time|this (week|month|quarter|year)|last (week|month|quarter|year)|compare|versus|vs)\b|\b(by|per|each|which)\b.*\b(total|average|avg|sum|drop|increase|growth|highest|lowest|most|least)\b|\b(total|average|avg|sum)\b.*\b(by|per|each)\b/i;function Za(e){let{data:t,rowKey:n="id"}=e,o=(0,V.useMemo)(()=>Qe(e.columns),[e.columns]),[r,s]=(0,V.useState)([]),[i,a]=(0,V.useState)(null),[l,c]=(0,V.useState)([]),[d,h]=(0,V.useState)(""),[p,m]=(0,V.useState)(null),[g,b]=(0,V.useState)([]),[u,y]=(0,V.useState)([]),[k,f]=(0,V.useState)(!1),S=(0,V.useRef)(r);S.current=r;let w=(0,V.useCallback)(()=>({data:t,columns:o,rowKey:n,filters:S.current,onFiltersChange:H=>{S.current=H,s(H)},onSortChange:a,onHighlightRows:c,onOpenRow:e.onOpenRow,onSelectRow:H=>c([H])}),[t,o,n,e.onOpenRow]),E=(0,V.useCallback)(async H=>{let O=H.trim();if(O){f(!0),y([]),b([]);try{if(ln(O).length>1){let F=[],$=await ho(O,w(),{onStep:x=>y((F.push(x),[...F]))});m("tasks"),h($.summary)}else if(Ja.test(O)){let F=je(t,o,{filters:S.current,search:[],sort:null,limit:null,notes:[],explanation:""}),$=xo(O,F,o,{referenceDate:e.referenceDate});m("insight"),h($.answer),b($.table)}else{let F=uo(O,w());m(F.kind),h(F.message)}}finally{f(!1)}}},[w,t,o,e.referenceDate]),I=(0,V.useCallback)(()=>{S.current=[],s([]),a(null),c([]),h(""),m(null),b([]),y([])},[]),M=(0,V.useMemo)(()=>je(t,o,{filters:r,search:[],sort:i,limit:null,notes:[],explanation:""}),[t,o,r,i]);return{gridData:M,highlightIds:l,filters:r,sort:i,ask:E,reset:I,answer:d,kind:p,table:g,steps:u,busy:k,visibleIds:M.map(H=>me(H,n))}}var Pi={border:"1px solid color-mix(in srgb, CanvasText 20%, transparent)",borderRadius:12,padding:16,background:"Canvas",color:"CanvasText",font:"inherit"},pe={minHeight:44,padding:"8px 14px",borderRadius:8,border:"1px solid color-mix(in srgb, CanvasText 35%, transparent)",background:"ButtonFace",color:"ButtonText",font:"inherit",cursor:"pointer"},vo={...pe,flex:1,minWidth:0,background:"Field",color:"FieldText",cursor:"text"},pn={opacity:.75,fontSize:"0.9em"};function ko({rows:e}){if(!e.length)return null;let t=Object.keys(e[0]);return(0,A.jsx)("div",{style:{overflowX:"auto",marginTop:12},children:(0,A.jsxs)("table",{style:{borderCollapse:"collapse",width:"100%"},children:[(0,A.jsx)("thead",{children:(0,A.jsx)("tr",{children:t.map(n=>(0,A.jsx)("th",{scope:"col",style:{textAlign:"left",padding:"6px 8px",borderBottom:"1px solid currentColor"},children:n},n))})}),(0,A.jsx)("tbody",{children:e.slice(0,50).map((n,o)=>(0,A.jsx)("tr",{children:t.map(r=>(0,A.jsx)("td",{style:{padding:"6px 8px",borderBottom:"1px solid color-mix(in srgb, CanvasText 12%, transparent)"},children:n[r]},r))},o))})]})})}function Mi(e,t,n){let o=URL.createObjectURL(new Blob([t],{type:n})),r=document.createElement("a");r.href=o,r.download=e,r.click(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function el({grid:e,placeholder:t="Ask about this data, e.g. \u201Coverdue and over \u20B910,000\u201D",examples:n=[],style:o}){let[r,s]=(0,V.useState)(""),i=a=>{a.preventDefault(),e.ask(r)};return(0,A.jsxs)("section",{"data-yuktai-panel":"","aria-label":"Data assistant",style:{...Pi,...o},children:[(0,A.jsxs)("form",{onSubmit:i,style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,A.jsx)("label",{htmlFor:"yuktai-grid-ask",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"},children:"Question about the data"}),(0,A.jsx)("input",{id:"yuktai-grid-ask",value:r,onChange:a=>s(a.target.value),placeholder:t,style:vo}),(0,A.jsx)("button",{type:"submit",style:pe,disabled:e.busy,children:e.busy?"Working\u2026":"Ask"}),(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>{s(""),e.reset()},children:"Reset"})]}),n.length>0&&(0,A.jsx)("div",{style:{display:"flex",gap:6,flexWrap:"wrap",marginTop:8},children:n.map(a=>(0,A.jsx)("button",{type:"button",style:{...pe,minHeight:36,fontSize:"0.85em"},onClick:()=>{s(a),e.ask(a)},children:a},a))}),(0,A.jsx)("div",{"aria-live":"polite",style:{marginTop:12,whiteSpace:"pre-line"},children:e.answer}),e.steps.length>0&&(0,A.jsx)("ol",{style:{marginTop:8,paddingLeft:20},children:e.steps.map((a,l)=>(0,A.jsxs)("li",{style:{marginBottom:4},children:[(0,A.jsx)("span",{"aria-hidden":"true",children:a.success?"\u2705 ":"\u26A0\uFE0F "}),(0,A.jsx)("strong",{children:a.text})," \u2014 ",(0,A.jsx)("span",{style:{whiteSpace:"pre-line"},children:a.message})]},l))}),(0,A.jsx)(ko,{rows:e.table})]})}var un=[["copilot","Copilot"],["qa","QA report"],["forms","Forms"],["design","Design"],["ask","Ask page"],["voice","Voice"]];function tl({defaultTab:e="copilot",voiceLang:t="en-IN",generate:n,style:o}){let[r,s]=(0,V.useState)(e),i=(0,V.useRef)([]),a=(l,c)=>{let d=l.key==="ArrowRight"?1:l.key==="ArrowLeft"?-1:0;if(!d)return;l.preventDefault();let h=(c+d+un.length)%un.length;s(un[h][0]),i.current[h]?.focus()};return(0,A.jsxs)("section",{"data-yuktai-panel":"","aria-label":"yuktai agentic tools",style:{...Pi,...o},children:[(0,A.jsx)("div",{role:"tablist","aria-label":"Tools",style:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},children:un.map(([l,c],d)=>(0,A.jsx)("button",{ref:h=>{i.current[d]=h},role:"tab",id:`yuktai-tab-${l}`,"aria-selected":r===l,"aria-controls":`yuktai-tabpanel-${l}`,tabIndex:r===l?0:-1,onClick:()=>s(l),onKeyDown:h=>a(h,d),style:{...pe,fontWeight:r===l?700:400,outlineOffset:2,borderWidth:r===l?2:1},children:c},l))}),(0,A.jsxs)("div",{role:"tabpanel",id:`yuktai-tabpanel-${r}`,"aria-labelledby":`yuktai-tab-${r}`,children:[r==="copilot"&&(0,A.jsx)(nl,{}),r==="qa"&&(0,A.jsx)(ol,{}),r==="forms"&&(0,A.jsx)(rl,{}),r==="design"&&(0,A.jsx)(il,{}),r==="ask"&&(0,A.jsx)(sl,{generate:n}),r==="voice"&&(0,A.jsx)(al,{lang:t})]})]})}function nl(){let e=(0,V.useRef)(null),[t,n]=(0,V.useState)(null),[o,r]=(0,V.useState)(null),[s,i]=(0,V.useState)("");(0,V.useEffect)(()=>(e.current=io({onUpdate:n}),e.current.scan(),()=>e.current?.stop()),[]);let a=e.current,l=t?.report?.issues??[];return(0,A.jsxs)("div",{children:[(0,A.jsxs)("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>t?.watching?a?.stop():a?.start(),children:t?.watching?"Stop watching":"Watch page live"}),(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>a?.scan(),children:"Scan now"}),(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>i(`${a?.applyAllFixes().filter(c=>c.applied).length??0} fix(es) applied.`),children:"Apply safe fixes"}),(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>i(`${a?.undoAll()??0} change(s) undone.`),children:"Undo all"})]}),(0,A.jsxs)("p",{"aria-live":"polite",style:{marginTop:12},children:[t?.report?.summary," ",s]}),(0,A.jsx)("ul",{style:{listStyle:"none",padding:0,margin:0},children:l.slice(0,40).map(c=>(0,A.jsxs)("li",{style:{borderTop:"1px solid color-mix(in srgb, CanvasText 12%, transparent)",padding:"8px 0"},children:[(0,A.jsxs)("div",{style:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"},children:[(0,A.jsx)("span",{style:{...pn,minWidth:70},children:c.severity}),(0,A.jsx)("span",{style:{flex:1},children:c.message}),(0,A.jsx)("button",{type:"button",style:pe,"aria-expanded":o===c.id,onClick:()=>r(o===c.id?null:c.id),children:"Why?"}),c.autoFixable&&(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>i(a?.applyFix(c.id).message??""),children:"Fix"})]}),o===c.id&&(0,A.jsx)("p",{style:{whiteSpace:"pre-line",margin:"8px 0 0"},children:a?.explain(c.id)})]},c.id))})]})}function ol(){let[e,t]=(0,V.useState)(null);return(0,A.jsxs)("div",{children:[(0,A.jsxs)("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>t(qe()),children:"Run QA check"}),e&&(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>Mi("accessibility-report.md",oo(e),"text/markdown"),children:"Download .md"}),(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>Mi("accessibility-report.json",ro(e),"application/json"),children:"Download .json"})]})]}),e&&(0,A.jsxs)(A.Fragment,{children:[(0,A.jsxs)("p",{"aria-live":"polite",style:{marginTop:12},children:[(0,A.jsx)("strong",{children:e.passed?"PASS":"FAIL"})," \u2014 ",e.summary]}),(0,A.jsx)(ko,{rows:e.checks.map(n=>({Check:n.title,Result:n.passed?"\u2705 Pass":"\u274C Fail",Issues:n.issueCount}))})]})]})}function rl(){let[e,t]=(0,V.useState)(null);return(0,A.jsxs)("div",{children:[(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>t(Gt()),children:"Review forms"}),(0,A.jsxs)("div",{"aria-live":"polite",children:[e&&e.length===0&&(0,A.jsx)("p",{children:"No forms on this page."}),e?.map(n=>(0,A.jsxs)("div",{style:{marginTop:12},children:[(0,A.jsx)("p",{children:(0,A.jsx)("strong",{children:n.summary})}),(0,A.jsx)("ul",{children:n.findings.map((o,r)=>(0,A.jsxs)("li",{children:[o.level==="problem"?"Problem: ":"Suggestion: ",o.message," ",(0,A.jsx)("span",{style:pn,children:o.suggestion})]},r))})]},n.selector))]})]})}function il(){let[e,t]=(0,V.useState)(null);return(0,A.jsxs)("div",{children:[(0,A.jsx)("button",{type:"button",style:pe,onClick:()=>t(wo()),children:"Review design"}),e&&(0,A.jsxs)("div",{"aria-live":"polite",children:[(0,A.jsx)("p",{style:{marginTop:12},children:(0,A.jsx)("strong",{children:e.summary})}),(0,A.jsx)(ko,{rows:Object.entries(e.categories).map(([n,o])=>({Area:n,Score:o.score,Findings:o.findings}))}),(0,A.jsx)("ul",{children:e.findings.map((n,o)=>(0,A.jsxs)("li",{children:["[",n.severity,"] ",n.message," ",(0,A.jsx)("span",{style:pn,children:n.suggestion})]},o))})]})]})}function sl({generate:e}){let[t,n]=(0,V.useState)(""),[o,r]=(0,V.useState)(""),[s,i]=(0,V.useState)([]);return(0,A.jsxs)("div",{children:[(0,A.jsxs)("form",{onSubmit:async l=>{if(l.preventDefault(),!t.trim())return;let c=await so(t);if(c.intent!=="unknown"&&c.intent!=="purpose"){r(c.answer),i(c.suggestions);return}let d=await fo().ask(t,{generate:e});r(c.intent==="purpose"&&!d.hits.length?c.answer:d.hits.length?d.answer:c.answer),i(c.suggestions)},style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,A.jsx)("label",{htmlFor:"yuktai-page-ask",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"},children:"Question about this page"}),(0,A.jsx)("input",{id:"yuktai-page-ask",value:t,onChange:l=>n(l.target.value),placeholder:"What does this page do? Which fields are missing labels?",style:vo}),(0,A.jsx)("button",{type:"submit",style:pe,children:"Ask"})]}),(0,A.jsx)("p",{"aria-live":"polite",style:{whiteSpace:"pre-line",marginTop:12},children:o}),s.length>0&&(0,A.jsx)("ul",{children:s.map((l,c)=>(0,A.jsx)("li",{children:l},c))})]})}function al({lang:e}){let t=(0,V.useMemo)(()=>mo({lang:e,onTranscript:(l,c)=>s(`\u201C${l}\u201D \u2192 ${c?c.say:"not a command"}`)}),[e]),[n,o]=(0,V.useState)(!1),[r,s]=(0,V.useState)(""),[i,a]=(0,V.useState)("");return(0,V.useEffect)(()=>()=>t.stop(),[t]),(0,A.jsxs)("div",{children:[(0,A.jsx)("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:(0,A.jsx)("button",{type:"button",style:pe,"aria-pressed":n,onClick:()=>{n?(t.stop(),o(!1)):o(t.start())},children:n?"Stop listening":"Start voice commands"})}),(0,A.jsxs)("form",{onSubmit:l=>{l.preventDefault(),t.handle(i),a("")},style:{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"},children:[(0,A.jsx)("label",{htmlFor:"yuktai-voice-typed",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"},children:"Type a command"}),(0,A.jsx)("input",{id:"yuktai-voice-typed",value:i,onChange:l=>a(l.target.value),placeholder:"Or type: turn on high contrast",style:vo}),(0,A.jsx)("button",{type:"submit",style:pe,children:"Run"})]}),(0,A.jsx)("p",{"aria-live":"polite",style:{marginTop:12},children:r}),(0,A.jsx)("p",{style:pn,children:"Try: \u201Cturn on high contrast\u201D, \u201Cbigger text\u201D, \u201Cdark mode off\u201D, \u201Cnext row\u201D, \u201C\u0C2A\u0C46\u0C26\u0C4D\u0C26 \u0C05\u0C15\u0C4D\u0C37\u0C30\u0C3E\u0C32\u0C41\u201D, \u201Creset settings\u201D."})]})}function ll(){if(typeof globalThis>"u")return new Ke;if(!globalThis.__yuktai_runtime__){let e=new Ke;e.register(we.name,we),e.register(St.name,St),e.register(Tt.name,Tt),globalThis.__yuktai_runtime__=e}return globalThis.__yuktai_runtime__}var Gi=typeof window<"u"?ll():new Ke,cl={wcagPlugin:we,list(){return Gi.getPlugins()},use(e){return Gi.use(e)},fix(e){return we.applyFixes({enabled:!0,autoFix:!0,...e})},scan(){return we.scan()}};
