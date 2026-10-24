"use strict";var Gs=Object.create;var Yt=Object.defineProperty;var zs=Object.getOwnPropertyDescriptor;var Os=Object.getOwnPropertyNames;var Ds=Object.getPrototypeOf,Ws=Object.prototype.hasOwnProperty;var pt=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ct=(e,t)=>{for(var n in t)Yt(e,n,{get:t[n],enumerable:!0})},Ar=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Os(t))!Ws.call(e,r)&&r!==n&&Yt(e,r,{get:()=>t[r],enumerable:!(o=zs(t,r))||o.enumerable});return e};var An=(e,t,n)=>(n=e!=null?Gs(Ds(e)):{},Ar(t||!e||!e.__esModule?Yt(n,"default",{value:e,enumerable:!0}):n,e)),Bs=e=>Ar(Yt({},"__esModule",{value:!0}),e);var A=pt(()=>{});var Jr={};Ct(Jr,{askPage:()=>Gn});function ua(){return new Promise(e=>{let t=setTimeout(e,1500),n=new MutationObserver(()=>{clearTimeout(t),t=setTimeout(()=>{n.disconnect(),e()},500)});n.observe(document.body,{childList:!0,subtree:!0})})}function pa(){let e=[],t=document.querySelectorAll("*");for(let n of t){if(n.closest("[data-yuktai-panel]"))continue;let o=n.innerText?.trim();o&&o.length>30&&e.push(o);let r=n.getAttribute("aria-label");if(r&&r.length>10&&e.push(r),(n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement)&&(n.placeholder&&e.push(n.placeholder),n.value&&e.push(n.value)),n instanceof HTMLButtonElement){let s=n.innerText||n.getAttribute("aria-label");s&&e.push(s)}}return e.join(" ").slice(0,3500)}async function Gn(e){if(!e.trim())return{success:!1,answer:"",error:"Please type a question."};try{let t=window,n=t.LanguageModel||t.ai?.languageModel;if(!n)return{success:!1,answer:"",error:"Gemini Nano not available."};await ua();let o=pa();if(!o||o.length<100)return{success:!1,answer:"",error:"Page content not readable."};let r;try{r=await n.create({systemPrompt:`Answer ONLY using page content.
Keep answer short (2\u20133 sentences).
If not found say: "I could not find that on this page."`,outputLanguage:"en"})}catch{r=await n.create()}let s=`Page:
${o}

Q: ${e}`,i=await r.prompt(s);return r?.destroy&&r.destroy(),{success:!0,answer:i?.trim()||"No answer found."}}catch(t){return{success:!1,answer:"",error:t instanceof Error?t.message:"Error occurred"}}}var zn=pt(()=>{"use strict";A()});var Wn={};Ct(Wn,{askPageWithTransformers:()=>Dn,getModelLoadStatus:()=>Rt,isTransformersSupported:()=>It});function ni(){return typeof navigator>"u"?!1:/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent)}function ga(){if(ni())return"wasm";try{if(typeof navigator<"u"&&"gpu"in navigator&&navigator.gpu!==void 0)return"webgpu"}catch{}return"wasm"}async function ma(){if(!On){if(ht){for(;ht;)await new Promise(e=>setTimeout(e,200));return}ht=!0;try{let{pipeline:e,env:t}=await import("@huggingface/transformers");t.allowRemoteModels=!0,t.allowLocalModels=!1,typeof window<"u"&&typeof caches<"u"&&(t.useWasmCache=!0);let n=ga(),o=ni();console.log(`yuktai: Transformers.js \u2014 device: ${n}, mobile: ${o}`),ei=await e("feature-extraction","Xenova/all-MiniLM-L6-v2",{device:n,dtype:o?"q4":"fp32"}),ti=await e("text2text-generation","Xenova/flan-t5-small",{device:n,dtype:o?"q4":"fp32"}),On=!0,ht=!1,console.log("yuktai: Transformers.js models loaded \u2705")}catch(e){throw ht=!1,console.error("yuktai: Transformers.js model load failed",e),e}}}function fa(){return new Promise(e=>{let t=setTimeout(e,1500),n=new MutationObserver(()=>{clearTimeout(t),t=setTimeout(()=>{n.disconnect(),e()},500)});n.observe(document.body,{childList:!0,subtree:!0})})}function ha(){let e=[],t=new Set,n=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, td, th, label, figcaption, blockquote, span, a, button, div");for(let i of n){if(i.closest("[data-yuktai-panel]")||i.querySelector("p, h1, h2, h3, h4, li, td, div"))continue;let l=i.innerText?.trim();if(!l||l.length<15||t.has(l))continue;t.add(l),e.push(l);let c=i.getAttribute("aria-label")?.trim();c&&c.length>8&&!t.has(c)&&(t.add(c),e.push(c))}let o=document.title?.trim();o&&!t.has(o)&&e.unshift(o);let s=document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim();return s&&!t.has(s)&&e.unshift(s),e.join(" ").slice(0,8e3)}function ba(e,t=150,n=30){if(typeof e!="string")try{e=String(e??"")}catch{return[]}let o=e.trim();if(!o)return[];let r=Math.min(n,Math.floor(t/2)),s=o.split(/\s+/),i=[],a=t-r;for(let l=0;l<s.length;l+=a){let c=s.slice(l,l+t).join(" ");c.trim().length>20&&i.push(c)}return i}function ya(e,t){let n=0,o=0,r=0;for(let s=0;s<e.length;s++)n+=e[s]*t[s],o+=e[s]*e[s],r+=t[s]*t[s];return n/(Math.sqrt(o)*Math.sqrt(r)+1e-8)}async function Zr(e){let t=await ei(e,{pooling:"mean",normalize:!0}),n=t?.data??t;return Array.from(n)}async function xa(e,t,n=3){let o=await Zr(e),r=await Promise.all(t.map(async s=>{let i=await Zr(s),a=ya(o,i);return{chunk:s,score:a}}));return r.sort((s,i)=>i.score-s.score),r.slice(0,n).map(s=>s.chunk)}async function Dn(e){if(!e.trim())return{success:!1,answer:"",error:"Please type a question."};try{await ma(),await fa();let t=ha();if(!t||t.length<50)return{success:!1,answer:"",error:"Not enough content on this page."};let n=ba(t);if(n.length===0)return{success:!1,answer:"",error:"Could not process page content."};let s=`Answer the question based on the context. Give a complete answer in 2-3 sentences.

Context: ${(await xa(e,n,3)).join(" ").slice(0,1200)}

Question: ${e}

Answer:`,a=(await ti(s,{max_new_tokens:120,min_new_tokens:10}))?.[0]?.generated_text?.trim()||"";return a?{success:!0,answer:a}:{success:!0,answer:"I could not find a specific answer on this page."}}catch(t){console.error("yuktai: Transformers RAG error",t);let n=t instanceof Error?t.message:"";return n.includes("Out of memory")||n.includes("memory")?{success:!1,answer:"",error:"Not enough device memory. Try on a device with more RAM or use desktop Chrome with Gemini Nano."}:{success:!1,answer:"",error:n||"Transformers.js error."}}}function It(){try{return typeof WebAssembly<"u"&&typeof Worker<"u"}catch{return!1}}function Rt(){return On?"ready":ht?"loading":"idle"}var ei,ti,ht,On,Et=pt(()=>{"use strict";A();ei=null,ti=null,ht=!1,On=!1});function ri(e,t){return e.replace(/\{\{SITE_NAME\}\}/g,t.SITE_NAME).replace(/\{\{THEME_COLOR\}\}/g,t.THEME_COLOR).replace(/\{\{TAGLINE\}\}/g,t.TAGLINE).replace(/\{\{YEAR\}\}/g,t.YEAR)}var _n,ii,si,ai,li,ci,di,ui,pi,gi,mi,fi,hi,bi,yi,xi,wi,vi,ki,Si,Ti,Ai,Ci,Ii,Ri,Ei=pt(()=>{"use strict";A();_n={blue:"#1a73e8",green:"#0d9488",purple:"#7c3aed",red:"#dc2626",orange:"#ea580c",teal:"#0891b2",indigo:"#4f46e5",gray:"#374151"},ii=e=>`{
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
`,si=`/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
`,ai=e=>`/** @type {import('tailwindcss').Config} */
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
`,li=e=>`@tailwind base;
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
`,ci=`import type { Metadata } from "next"
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
`,di=`"use client"
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
`,ui=`.navbar {
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
`,pi=`import styles from "./Footer.module.css"

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
`,gi=`.footer {
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
`,mi=`import styles from "./page.module.css"
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
`,fi=`.page { min-height: 100vh; }

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
`,hi=`import styles from "./page.module.css"

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
`,bi=`.page { min-height: 100vh; }

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
`,yi=`"use client"
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
`,xi=`.page { min-height: 100vh; }

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
`,wi=`import styles from "./page.module.css"

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
`,vi=`.page { min-height: 100vh; }

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
`,ki=`import styles from "./page.module.css"
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
`,Si=`.page { min-height: 100vh; }

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
`,Ti=`"use client"
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
`,Ai=`.page {
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
`,Ci=`import Link from "next/link"

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
`,Ii=`{
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
`,Ri=e=>`# ${e}

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
`});var $i={};Ct($i,{generateZip:()=>Ga});function Fa(e,t){return{hotel:`Experience luxury and comfort at ${e}`,ecommerce:`Shop the best products at ${e}`,restaurant:`Delicious food crafted with love at ${e}`,portfolio:`Creative work and professional services by ${e}`,blog:`Insights, stories, and ideas from ${e}`,saas:`Powerful tools to grow your business \u2014 ${e}`,government:`Official services and information \u2014 ${e}`,healthcare:`Quality healthcare you can trust \u2014 ${e}`,education:`Learn, grow, and succeed with ${e}`,realestate:`Find your perfect property with ${e}`,landing:`The smarter way to get things done \u2014 ${e}`,generic:`Welcome to ${e} \u2014 your trusted partner`}[t]||`Welcome to ${e}`}async function Ga(e){let t=(await import("jszip")).default,n=new t,o=_n[e.theme]||_n.blue,r=Fa(e.siteName,e.websiteType),s=new Date().getFullYear().toString(),i={SITE_NAME:e.siteName,THEME_COLOR:o,TAGLINE:r,YEAR:s},a=g=>ri(g,i).replace(/\{\{SITE_NAME_LOWER\}\}/g,e.siteName.toLowerCase().replace(/\s+/g,""));n.file("package.json",ii(e.siteName)),n.file("next.config.js",si),n.file("tailwind.config.js",ai(o)),n.file("tsconfig.json",Ii),n.file("README.md",Ri(e.siteName)),n.file("postcss.config.js","module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }"),n.file(".gitignore",`node_modules
.next
.env.local
.DS_Store`),n.file("src/app/globals.css",li(o)),n.file("src/app/layout.tsx",a(ci)),n.file("src/app/not-found.tsx",Ci),n.file("src/components/Navbar.tsx",a(di)),n.file("src/components/Navbar.module.css",ui),n.file("src/components/Footer.tsx",a(pi)),n.file("src/components/Footer.module.css",gi);for(let g of e.pages)switch(g){case"home":n.file("src/app/page.tsx",a(mi)),n.file("src/app/page.module.css",fi);break;case"about":n.file("src/app/about/page.tsx",a(hi)),n.file("src/app/about/page.module.css",bi);break;case"contact":n.file("src/app/contact/page.tsx",a(yi)),n.file("src/app/contact/page.module.css",xi);break;case"services":n.file("src/app/services/page.tsx",a(wi)),n.file("src/app/services/page.module.css",vi);break;case"pricing":n.file("src/app/pricing/page.tsx",a(ki)),n.file("src/app/pricing/page.module.css",Si);break;case"auth":n.file("src/app/auth/page.tsx",a(Ti)),n.file("src/app/auth/page.module.css",Ai);break;default:n.file(`src/app/${g}/page.tsx`,za(g,e.siteName,o,i,a));break}let l=await n.generateAsync({type:"blob"}),c=URL.createObjectURL(l),d=document.createElement("a");d.href=c,d.download=`${e.siteName.toLowerCase().replace(/\s+/g,"-")}-nextjs.zip`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(c)}function za(e,t,n,o,r){let s=e.charAt(0).toUpperCase()+e.slice(1);return`import styles from "./page.module.css"

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
`}var Li=pt(()=>{"use strict";A();Ei()});var Gi={};Ct(Gi,{getPageText:()=>Ni,highlightField:()=>Pi,runAgent:()=>qa,scanFormFields:()=>Mi,scrollToSection:()=>Fi});function Je(e){try{let t=window.getComputedStyle(e);if(t.display==="none"||t.visibility==="hidden"||t.opacity==="0"||e.hidden)return!1;let n=e.getBoundingClientRect();return!(n.width===0&&n.height===0)}catch{return!0}}function Ni(){let e=[],t=new Set,n=i=>{let a=i.trim();a&&a.length>10&&!t.has(a)&&(t.add(a),e.push(a))};document.title&&n(document.title);let o=['meta[name="description"]','meta[name="keywords"]','meta[property="og:title"]','meta[property="og:description"]','meta[name="twitter:title"]','meta[name="twitter:description"]'];for(let i of o){let a=document.querySelector(i)?.getAttribute("content");a&&n(a)}let r=["h1","h2","h3","h4","h5","h6","p","blockquote","q","pre","code","li","dt","dd","th","td","caption","a","b","strong","em","i","u","s","abbr","acronym","cite","dfn","mark","small","sub","sup","ins","del","bdi","bdo","article","section","aside","nav","header","footer","main","summary","details","figcaption","figure","address","time","output","label","legend","option","button","font","center","span","div","[role='heading']","[role='main']","[role='article']","[role='region']","[role='complementary']","[role='contentinfo']","[role='navigation']","[role='banner']","[role='listitem']","[role='cell']","[role='columnheader']","[role='rowheader']"],s=document.querySelectorAll(r.join(","));for(let i of s){if(i.closest("[data-yuktai-panel]")||!Je(i)||i.querySelector("p, h1, h2, h3, h4, h5, h6, li, td, th, div, article, section, blockquote, pre"))continue;let l=i.innerText?.trim();if(l&&l.length>10&&n(l),!l){let b=i.textContent?.trim();b&&b.length>10&&n(b)}let c=i.getAttribute("aria-label")?.trim();c&&c.length>5&&n(c);let d=i.getAttribute("aria-description")?.trim();d&&d.length>5&&n(d);let g=i.getAttribute("aria-valuetext")?.trim();g&&n(g);let p=i.getAttribute("title")?.trim();p&&p.length>5&&n(p);let m=i.getAttribute("data-label")?.trim();m&&n(m);let f=i.getAttribute("data-title")?.trim();f&&n(f),i.querySelectorAll("img").forEach(b=>{let u=b.getAttribute("alt")?.trim();u&&u.length>5&&n(u);let y=b.getAttribute("title")?.trim();y&&y.length>5&&n(y)})}document.querySelectorAll("img").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Je(i))return;let a=i.getAttribute("alt")?.trim(),l=i.getAttribute("title")?.trim();a&&a.length>5&&n(a),l&&l.length>5&&n(l)}),document.querySelectorAll("input:not([type=hidden]), textarea").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Je(i))return;i.placeholder&&n(i.placeholder),i.value&&i.value.length>3&&n(i.value);let a=i.getAttribute("aria-label")?.trim();a&&n(a)}),document.querySelectorAll("select").forEach(i=>{i.closest("[data-yuktai-panel]")||Je(i)&&Array.from(i.options).forEach(a=>{a.text?.trim().length>3&&n(a.text.trim())})}),document.querySelectorAll("td, th").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Je(i))return;let a=i.innerText?.trim();a&&a.length>3&&n(a)});try{document.querySelectorAll("iframe").forEach(i=>{try{let a=i.contentDocument;if(!a)return;let l=a.body?.innerText?.trim();l&&l.length>20&&n(l.slice(0,500))}catch{}})}catch{}return document.querySelectorAll("a").forEach(i=>{if(i.closest("[data-yuktai-panel]")||!Je(i))return;let a=i.innerText?.trim();a&&a.length>3&&a.length<100&&n(a)}),e.join(" ").slice(0,5e3)}function Ba(e){let t=e.getAttribute("aria-label")?.trim();if(t)return t;let n=e.getAttribute("aria-labelledby");if(n){let l=document.getElementById(n);if(l)return l.innerText?.trim()||""}if(e.id){let l=document.querySelector(`label[for="${e.id}"]`);if(l)return l.innerText?.trim()||""}let o=e.closest("label");if(o){let l=o.cloneNode(!0);return l.querySelectorAll("input, select, textarea").forEach(c=>c.remove()),l.innerText?.trim()||""}if((e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&e.placeholder)return e.placeholder;if(e.name)return e.name.replace(/[_-]/g," ");let r=e.previousSibling;if(r?.nodeType===Node.TEXT_NODE){let l=r.textContent?.trim();if(l&&l.length>1)return l}let s=e.previousElementSibling;if(s){let l=s.innerText?.trim();if(l&&l.length>1&&l.length<60)return l}let i=e.closest("td, th");if(i){let l=i.previousElementSibling;if(l){let c=l.innerText?.trim();if(c&&c.length>1)return c}}let a=e.getAttribute("title")?.trim();return a||(e instanceof HTMLInputElement?e.type:"field")}function Mi(){let e=[],t=document.querySelectorAll(["input:not([type=hidden])","input:not([type=submit])","input:not([type=button])","input:not([type=reset])","input:not([type=image])","select","textarea","[contenteditable='true']","[role='textbox']","[role='combobox']","[role='spinbutton']","[role='searchbox']","[role='listbox']"].join(", "));for(let n of t){if(n.closest("[data-yuktai-panel]")||!Je(n))continue;if(n instanceof HTMLInputElement){let r=n.type.toLowerCase();if(["submit","button","reset","image"].includes(r))continue}let o=Ba(n);e.push({label:o,type:n instanceof HTMLInputElement?n.type:n.tagName.toLowerCase(),placeholder:(n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement)&&n.placeholder||"",required:n.required||n.getAttribute("aria-required")==="true"||n.getAttribute("data-required")==="true",element:n})}return e}function Pi(e,t=3e3){e.scrollIntoView({behavior:"smooth",block:"center"}),e.style.outline="3px solid #0d9488",e.style.outlineOffset="3px";try{e.focus()}catch{}setTimeout(()=>{e.style.outline="",e.style.outlineOffset=""},t)}function Fi(e){let t=e.toLowerCase(),n=document.querySelectorAll("h1, h2, h3, h4, h5, h6, section, article, [id], [aria-label], [role='heading'], [role='region']");for(let o of n){if(o.closest("[data-yuktai-panel]")||!Je(o))continue;if((o.innerText||o.getAttribute("id")||o.getAttribute("aria-label")||o.getAttribute("name")||"").toLowerCase().includes(t))return o.scrollIntoView({behavior:"smooth",block:"center"}),o.style.outline="2px solid #0d9488",o.style.outlineOffset="4px",setTimeout(()=>{o.style.outline="",o.style.outlineOffset=""},2500),!0}return!1}async function Ha(e,t,n){let o=window,r=o.LanguageModel||o.ai?.languageModel;if(!r)throw new Error("Gemini Nano not available");let s=await r.create({systemPrompt:`You are a helpful web accessibility agent.
Create a simple action plan to help a user complete a task on a webpage.
Rules:
- Maximum 5 steps
- Short and clear \u2014 no jargon
- If filling a form \u2014 list each field and what to enter
- No markdown \u2014 no asterisks, no bold, no headers
- Number each step: 1. 2. 3.`}),a=`Page content: ${e}${n?`
The page has form fields the user may need to fill.`:""}

User task: ${t}

Action plan:`,l=await s.prompt(a);return s.destroy(),l?.trim()||""}async function _a(e,t){let{askPageWithTransformers:n}=await Promise.resolve().then(()=>(Et(),Wn));return(await n(`How do I: ${t}`)).answer||"I could not create a plan for this task."}async function qa(e,t,n){if(!e.trim())return{success:!1,steps:[],error:"Please tell me what you want to do."};if(!t)return{success:!1,steps:[],error:"No AI engine available on this device."};let o=[],r=(s,i="info")=>{let a={text:s,type:i};o.push(a),n(a)};try{r("\u{1F4D6} Reading page content...","info");let s=Ni(),i=Mi(),a=i.length>0;s.length<50&&r("\u26A0\uFE0F Page content is very limited. This may be a static image page.","error"),r(a?`\u{1F4CB} Found ${i.length} form field${i.length!==1?"s":""} on this page`:"\u{1F4C4} No form fields found \u2014 this appears to be a content page","info"),r("\u{1F916} Creating action plan...","info");let l="";try{t==="gemini"?l=await Ha(s,e,a):l=await _a(s,e)}catch{l=a?`1. Locate the form on this page
2. Fill each required field
3. Review your answers
4. Submit the form`:`1. Read the page carefully
2. Find the section relevant to your task
3. Follow the on-page instructions`}if(l&&(r("\u2705 Your action plan:","success"),l.split(/\n/).map(c=>c.replace(/\*\*/g,"").replace(/\*/g,"").trim()).filter(c=>c.length>5).slice(0,6).forEach(c=>r(`   ${c}`,"action"))),a){let c=i[0];r(`\u{1F3AF} First field: "${c.label}"${c.required?" \u2605 required":""}`,"field"),Pi(c.element),i.length>1&&r(`\u{1F4DD} All ${i.length} fields: ${i.map(d=>d.label).join(" \u2192 ")}`,"info")}else{let c=e.toLowerCase().split(/\s+/).filter(g=>g.length>3),d=!1;for(let g of c)if(Fi(g)){r(`\u{1F3AF} Scrolled to relevant section: "${g}"`,"action"),d=!0;break}d||r("\u{1F4A1} Scroll through the page to find what you need.","info")}return r("\u2705 Ready. Follow the steps above. Ask me again if you need more help.","success"),{success:!0,steps:o}}catch(s){let i=s instanceof Error?s.message:"Agent error.";return r(`\u26A0\uFE0F ${i}`,"error"),{success:!1,steps:o,error:i}}}var zi=pt(()=>{"use strict";A()});var ac={};Ct(ac,{AUDIT_RULES:()=>Ht,AccessibilityIcon:()=>yo,AgenticGridBar:()=>Xl,AgenticPanel:()=>Jl,AlertIcon:()=>_o,CardsIcon:()=>Mo,ChatIcon:()=>Po,CheckIcon:()=>ho,ChevronLeftIcon:()=>po,ChevronRightIcon:()=>mo,ChevronsIcon:()=>Lo,CloseIcon:()=>bo,ContrastIcon:()=>xo,CopyIcon:()=>Oo,DEFAULT_A11Y_SETTINGS:()=>ar,DownloadIcon:()=>zo,EyeIcon:()=>Uo,FONT_MAX:()=>bs,FONT_MIN:()=>hs,FONT_STEP:()=>sr,FilterIcon:()=>Do,FirstIcon:()=>Wo,FormIcon:()=>jo,GridIcon:()=>No,ICON_MIN_CONTRAST:()=>dn,ICON_NAMES:()=>no,ICON_PATHS:()=>Be,IconBase:()=>me,InfoIcon:()=>qo,LastIcon:()=>Bo,LayoutIcon:()=>Vo,MicIcon:()=>Fo,MinusIcon:()=>Ro,MoonIcon:()=>wo,MotionIcon:()=>vo,PaletteIcon:()=>Ao,PlugIcon:()=>Xo,PlusIcon:()=>Io,ReadingIcon:()=>ko,ResetIcon:()=>Eo,Runtime:()=>Ze,SearchIcon:()=>ao,SkipIcon:()=>Co,SortDownIcon:()=>co,SortIcon:()=>$o,SortUpIcon:()=>lo,SparkIcon:()=>Ho,SpeakerIcon:()=>To,StopIcon:()=>Go,TargetIcon:()=>So,ToolsIcon:()=>Qo,UndoIcon:()=>Ko,WandIcon:()=>Yo,YuktAI:()=>sc,YuktAIWrapper:()=>on,YuktaiGrid:()=>Qi,YuktaiGridAI:()=>sn,YuktaiGridAgent:()=>Yi,YuktaiGridWebMCP:()=>Gt,YuktaiIcon:()=>X,accessibleName:()=>Me,addPeriods:()=>yn,aggregate:()=>St,aiPlugin:()=>Lt,analyzePage:()=>ds,answerGridQuestion:()=>ir,applyGridFilters:()=>Ve,askAboutPage:()=>tr,askInsight:()=>gr,auditToJSON:()=>Zo,auditToMarkdown:()=>Jo,clearFilters:()=>Xn,clearSort:()=>Zn,comparePeriods:()=>Is,contrastRatio:()=>vt,countGrid:()=>Vn,createA11yCopilot:()=>er,createContextIndex:()=>cr,createGridTools:()=>wt,createVoiceA11yController:()=>lr,default:()=>on,detectAnomalies:()=>fn,detectPageIntent:()=>us,executeGridQuery:()=>Ke,filterGrid:()=>Qn,findMentionedColumn:()=>Pe,getColumns:()=>Yn,getRow:()=>Kn,getRowId:()=>be,gridPassages:()=>vs,groupBy:()=>Cs,highlightRows:()=>xt,iconContrast:()=>kt,iconSvg:()=>so,moveGridRowFocus:()=>xs,openRow:()=>Pt,pagePassages:()=>ws,parseAmount:()=>mn,parseColor:()=>ot,parseGridIntent:()=>eo,parseGridQuery:()=>lt,parseVoiceA11yCommand:()=>ys,pickGlyphColor:()=>un,planTasks:()=>bn,readFormFields:()=>ls,relativeLuminance:()=>ln,reviewDesign:()=>mr,reviewForm:()=>cs,reviewForms:()=>_t,runGridQuery:()=>fs,runQaAudit:()=>Ye,runTasks:()=>dr,searchGrid:()=>Un,selectRow:()=>Mt,sortGrid:()=>Jn,startOfPeriod:()=>pr,summarizeRows:()=>hn,toGridToolColumns:()=>et,tokenize:()=>qt,trend:()=>Rs,useAgenticGrid:()=>Ql,useGrid:()=>ns,useYuktaiGridAgent:()=>Ft,voicePlugin:()=>Nt,wcag:()=>ke,wcagPlugin:()=>ke});module.exports=Bs(ac);A();A();A();function Cr(){let e=window;return e.Rewriter||e.ai?.rewriter||null}async function Cn(){try{let e=Cr();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability();return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}async function Hs(e){if(!e||e.trim().length<20)return{success:!1,original:e,rewritten:e,error:"Text too short"};try{let t=Cr();if(!t)throw new Error("Rewriter API not available");let n=await t.create({tone:"more-casual",format:"plain-text",length:"as-is",outputLanguage:"en"}),o=await n.rewrite(e,{context:"Rewrite this text in simple plain English. Use short sentences. Avoid jargon. Make it easy to understand for everyone."});return n.destroy(),{success:!0,original:e,rewritten:o.trim()}}catch(t){return{success:!1,original:e,rewritten:e,error:t instanceof Error?t.message:"Rewrite failed"}}}async function Ir(){if(!await Cn())return{fixed:0,error:"Chrome Built-in AI Rewriter not available. Enable via chrome://flags."};let t=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption"),n=0;for(let o of t){let r=o.innerText?.trim();if(!r||r.length<20||o.closest("[data-yuktai-panel]"))continue;let s=await Hs(r);s.success&&s.rewritten!==r&&(o.dataset.yuktaiOriginal=r,o.innerText=s.rewritten,n++)}return{fixed:n}}function Rr(){let e=document.querySelectorAll("[data-yuktai-original]");for(let t of e){let n=t.dataset.yuktaiOriginal;n&&(t.innerText=n,delete t.dataset.yuktaiOriginal)}}A();var Er="yuktai-summary-box";function $r(){let e=window;return e.Summarizer||e.ai?.summarizer||null}async function In(){try{let e=$r();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability();return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}function _s(){let e=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, article, section"),t=[];for(let n of e){if(n.closest("[data-yuktai-panel]"))continue;let o=window.getComputedStyle(n);if(o.display==="none"||o.visibility==="hidden")continue;let r=n.innerText?.trim();r&&r.length>10&&t.push(r)}return t.join(" ").slice(0,5e3)}async function Lr(){if(!await In())return{success:!1,summary:"",error:"Chrome Built-in AI Summarizer not available. Enable via chrome://flags."};let t=_s();if(!t||t.length<100)return{success:!1,summary:"",error:"Not enough text on this page to summarise."};try{let n=$r();if(!n)throw new Error("Summarizer API not available");let o=await n.create({type:"tl;dr",format:"plain-text",length:"short",outputLanguage:"en"}),r=await o.summarize(t,{context:"Summarise this page in 2-3 simple sentences for a screen reader user who wants to know if this page is relevant to them."});return o.destroy(),qs(r.trim()),{success:!0,summary:r.trim()}}catch(n){return{success:!1,summary:"",error:n instanceof Error?n.message:"Summary failed"}}}function qs(e){Kt();let t=document.createElement("div");t.id=Er,t.setAttribute("data-yuktai-panel","true"),t.setAttribute("role","region"),t.setAttribute("aria-label","Page summary by yuktai"),t.style.cssText=`
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
  `,o.addEventListener("click",Kt),t.appendChild(n),t.appendChild(o),document.body.prepend(t)}function Kt(){let e=document.getElementById(Er);e&&e.remove()}A();var Xt=[{code:"en",label:"English"},{code:"hi",label:"Hindi"},{code:"es",label:"Spanish"},{code:"fr",label:"French"},{code:"de",label:"German"},{code:"it",label:"Italian"},{code:"pt",label:"Portuguese"},{code:"nl",label:"Dutch"},{code:"pl",label:"Polish"},{code:"ru",label:"Russian"},{code:"ja",label:"Japanese"},{code:"ko",label:"Korean"},{code:"zh",label:"Chinese"},{code:"ar",label:"Arabic"},{code:"tr",label:"Turkish"},{code:"vi",label:"Vietnamese"},{code:"bn",label:"Bengali"},{code:"id",label:"Indonesian"}],Qt="en";function js(){let e=window;return e.Translator||e.translation||null}async function Us(e){try{let t=window;if(!js())return!1;if(t.Translator&&typeof t.Translator.availability=="function")try{let o=await t.Translator.availability({sourceLanguage:"en",targetLanguage:e});return o==="readily"||o==="available"||o==="downloadable"||o==="after-download"}catch{}return t.Translator&&typeof t.Translator.canTranslate=="function"?await t.Translator.canTranslate({sourceLanguage:"en",targetLanguage:e})!=="no":t.translation&&typeof t.translation.canTranslate=="function"?await t.translation.canTranslate({sourceLanguage:"en",targetLanguage:e})!=="no":!1}catch{return!1}}async function Vs(e){let t=window,n={sourceLanguage:"en",targetLanguage:e};if(t.Translator&&typeof t.Translator.create=="function")return await t.Translator.create(n);if(t.translation&&typeof t.translation.createTranslator=="function")return await t.translation.createTranslator(n);throw new Error("Translation API not available")}async function Nr(e){if(e===Qt)return{success:!0,language:e,fixed:0};if(e==="en")return Rn(),Qt="en",{success:!0,language:"en",fixed:0};if(!await Us(e))return{success:!1,language:e,fixed:0,error:`Translation to ${e} not available. Enable via chrome://flags.`};try{let n=await Vs(e),o=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption, span, a"),r=0;for(let s of o){if(s.closest("[data-yuktai-panel]")||s.children.length>0)continue;let i=s.innerText?.trim();if(!i||i.length<2)continue;s.dataset.yuktaiTranslationOriginal||(s.dataset.yuktaiTranslationOriginal=i);let a=await n.translate(i);a&&a!==i&&(s.innerText=a,r++)}return typeof n.destroy=="function"&&n.destroy(),Qt=e,{success:!0,language:e,fixed:r}}catch(n){return{success:!1,language:e,fixed:0,error:n instanceof Error?n.message:"Translation failed"}}}function Rn(){let e=document.querySelectorAll("[data-yuktai-translation-original]");for(let t of e){let n=t.dataset.yuktaiTranslationOriginal;n&&(t.innerText=n,delete t.dataset.yuktaiTranslationOriginal)}Qt="en"}A();var Ys=[{phrases:["go to main","skip to main","main content"],action:"focus-main",label:"Jump to main content"},{phrases:["go to navigation","go to nav","open menu"],action:"focus-nav",label:"Jump to navigation"},{phrases:["go to search","search","find"],action:"focus-search",label:"Jump to search"},{phrases:["scroll down","page down","next"],action:"scroll-down",label:"Scroll down"},{phrases:["scroll up","page up","back up"],action:"scroll-up",label:"Scroll up"},{phrases:["go back","previous page"],action:"go-back",label:"Go back"},{phrases:["click","press","select"],action:"click-focused",label:"Click focused element"},{phrases:["next item","tab forward","tab"],action:"tab-forward",label:"Move to next element"},{phrases:["previous item","tab back","shift tab"],action:"tab-back",label:"Move to previous element"},{phrases:["stop listening","stop voice","quiet"],action:"stop-voice",label:"Stop voice control"}],Le=null,Jt=!1,gt=null;function En(){return!!(window.SpeechRecognition||window.webkitSpeechRecognition)}function Ks(e){let t=e.toLowerCase().trim();for(let n of Ys)for(let o of n.phrases)if(t.includes(o))return{action:n.action,label:n.label};return null}function Qs(e){switch(e){case"focus-main":{let t=document.querySelector("main, [role='main'], #main");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"focus-nav":{let t=document.querySelector("nav, [role='navigation']");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"focus-search":{let t=document.querySelector("input[type='search'], input[role='searchbox'], [aria-label*='search' i]");t&&(t.focus(),t.scrollIntoView({behavior:"smooth"}));break}case"scroll-down":{window.scrollBy({top:400,behavior:"smooth"});break}case"scroll-up":{window.scrollBy({top:-400,behavior:"smooth"});break}case"go-back":{window.history.back();break}case"click-focused":{let t=document.activeElement;t&&t!==document.body&&t.click();break}case"tab-forward":{let t=Mr(),n=t.indexOf(document.activeElement),o=t[n+1]||t[0];o&&o.focus();break}case"tab-back":{let t=Mr(),n=t.indexOf(document.activeElement),o=t[n-1]||t[t.length-1];o&&o.focus();break}case"stop-voice":{$n();break}}}function Mr(){return Array.from(document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(e=>!e.closest("[data-yuktai-panel]"))}function Pr(e){if(!En())return!1;if(Jt)return!0;e&&(gt=e);let t=window.SpeechRecognition||window.webkitSpeechRecognition;return Le=new t,Le.continuous=!0,Le.interimResults=!1,Le.lang="en-US",Le.onresult=n=>{let o=n.results[n.results.length-1][0].transcript,r=Ks(o);if(r){Qs(r.action);let s={success:!0,command:o,action:r.label};if(gt&&gt(s),r.action==="stop-voice")return}},Le.onend=()=>{Jt&&Le?.start()},Le.onerror=n=>{n.error!=="no-speech"&&gt&&gt({success:!1,command:"",action:"",error:`Voice error: ${n.error}`})},Le.start(),Jt=!0,Xs(),!0}function $n(){Jt=!1,Le&&(Le.stop(),Le=null),gt=null,Gr()}var Fr="yuktai-voice-indicator";function Xs(){Gr();let e=document.createElement("div");e.id=Fr,e.setAttribute("data-yuktai-panel","true"),e.setAttribute("aria-live","polite"),e.setAttribute("aria-label","yuktai voice control is listening"),e.style.cssText=`
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
    `,document.head.appendChild(o)}let n=document.createElement("span");n.textContent="Listening for commands...",e.appendChild(t),e.appendChild(n),document.body.appendChild(e)}function Gr(){let e=document.getElementById(Fr);e&&e.remove()}A();var Js=["button:not([aria-label]):not([aria-labelledby])","a:not([aria-label]):not([aria-labelledby])","input:not([aria-label]):not([aria-labelledby]):not([id])","select:not([aria-label]):not([aria-labelledby])","textarea:not([aria-label]):not([aria-labelledby])","[role='button']:not([aria-label])","[role='link']:not([aria-label])","[role='checkbox']:not([aria-label])","[role='tab']:not([aria-label])"].join(", ");function zr(){let e=window;return e.Writer||e.ai?.writer||null}async function Ln(){try{let e=zr();if(!e)return!1;if(typeof e.availability=="function"){let t=await e.availability();return t==="readily"||t==="available"||t==="downloadable"}return typeof e.capabilities=="function"?(await e.capabilities())?.available!=="no":typeof e.create=="function"}catch{return!1}}function Zs(e){let t=[],n=e.innerText?.trim();n&&t.push(`element text: "${n}"`);let o=e.placeholder?.trim();o&&t.push(`placeholder: "${o}"`);let r=e.getAttribute("name")?.trim();r&&t.push(`name: "${r}"`);let s=e.getAttribute("type")?.trim();s&&t.push(`type: "${s}"`);let i=e.id;if(i){let c=document.querySelector(`label[for="${i}"]`);c&&t.push(`label: "${c.innerText?.trim()}"`)}let a=e.parentElement?.innerText?.trim().slice(0,60);a&&t.push(`parent context: "${a}"`),t.push(`tag: ${e.tagName.toLowerCase()}`);let l=e.getAttribute("role");return l&&t.push(`role: ${l}`),t.join(". ")}async function ea(e,t){let n=`
    Generate a short, clear aria-label for an HTML element.
    The label must be 2-6 words maximum.
    The label must describe what the element does or what it is.
    Do not include punctuation.
    Do not explain \u2014 just output the label text only.

    Element details:
    ${t}

    Output only the label. Nothing else.
  `.trim();return(await e.write(n)).trim().replace(/^["']|["']$/g,"").replace(/\.$/,"").trim()}async function Or(){if(!await Ln())return{success:!1,fixed:0,elements:[],error:"Chrome Built-in AI Writer not available. Enable via chrome://flags."};let t=document.querySelectorAll(Js);if(t.length===0)return{success:!0,fixed:0,elements:[]};try{let n=zr();if(!n)throw new Error("Writer API not available");let o=await n.create({tone:"neutral",format:"plain-text",length:"short",outputLanguage:"en"}),r=0,s=[];for(let i of t){if(i.closest("[data-yuktai-panel]"))continue;let a=window.getComputedStyle(i);if(a.display==="none"||a.visibility==="hidden")continue;let l=Zs(i),c=await ea(o,l);c&&c.length>0&&(i.dataset.yuktaiLabelOriginal=i.getAttribute("aria-label")||"",i.setAttribute("aria-label",c),r++,s.push({tag:i.tagName.toLowerCase(),label:c}))}return o.destroy(),{success:!0,fixed:r,elements:s}}catch(n){return{success:!1,fixed:0,elements:[],error:n instanceof Error?n.message:"Label generation failed"}}}function Dr(){let e=document.querySelectorAll("[data-yuktai-label-original]");for(let t of e){let n=t.dataset.yuktaiLabelOriginal;n?t.setAttribute("aria-label",n):t.removeAttribute("aria-label"),delete t.dataset.yuktaiLabelOriginal}}var tn=null,Wr=null;var Br=null,Nn=null,pe=null,mt=null,Zt=null,Mn=null,ft=null,en={deuteranopia:"yuktai-cb-d",protanopia:"yuktai-cb-p",tritanopia:"yuktai-cb-t"};var Hr=new Set(["input","select","textarea"]);var Pn={nav:"navigation",header:"banner",footer:"contentinfo",main:"main",aside:"complementary"};function Fn(e,t="polite"){if(typeof window>"u"||!ft?.speechEnabled||!window.speechSynthesis)return;window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.rate=1,n.pitch=1,n.volume=1;let o=window.speechSynthesis.getVoices();o.length>0&&(n.voice=o[0]),window.speechSynthesis.speak(n)}function Qr(e,t="info"){if(typeof document>"u")return;let o={success:{bg:"#0a7a44",border:"#075e34",icon:"\u2713"},error:{bg:"#b52a1c",border:"#8f2116",icon:"\u2715"},warning:{bg:"#a35f00",border:"#7a4700",icon:"\u26A0"},info:{bg:"#005A9C",border:"#003F6E",icon:"\u2139"}}[t];pe||(pe=document.createElement("div"),pe.setAttribute("role","alert"),pe.setAttribute("aria-live","assertive"),pe.setAttribute("aria-atomic","true"),pe.style.cssText=`
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
    `,document.body.appendChild(pe)),pe.style.background=o.bg,pe.style.border=`1px solid ${o.border}`,pe.style.color="#fff",pe.innerHTML=`
    <span style="font-size:18px;font-weight:700">${o.icon}</span>
    <span style="flex:1;line-height:1.4">${e}</span>
    <button
      onclick="this.parentElement.style.transform='translateX(120%)';this.parentElement.style.opacity='0'"
      style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;padding:0;line-height:1"
      aria-label="Close notification">\xD7</button>
  `,window.innerWidth<=480&&(pe.style.right="8px",pe.style.left="8px",pe.style.maxWidth="none",pe.style.width="auto"),requestAnimationFrame(()=>{pe&&(pe.style.transform="translateX(0)",pe.style.opacity="1")}),setTimeout(()=>{pe&&(pe.style.transform="translateX(120%)",pe.style.opacity="0")},5e3)}function ie(e,t="info",n=!0){tn&&(tn.textContent=e),Qr(e,t),n&&Fn(e,t==="error"?"assertive":"polite")}function ta(){if(typeof document>"u"||Br)return;let e=[{label:"Skip to main content",selector:"main,[role='main'],#main,#main-content"},{label:"Skip to navigation",selector:"nav,[role='navigation'],#nav,#navigation"},{label:"Skip to search",selector:"[role='search'],#search,input[type='search']"}],t=document.createElement("div");t.setAttribute("data-yuktai-skip-bar","true"),t.setAttribute("role","navigation"),t.setAttribute("aria-label","Skip links"),t.style.cssText=`
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
  `;let n=!1;if(e.forEach(({label:r,selector:s})=>{let i=document.querySelector(s);if(!i)return;n=!0,i.getAttribute("tabindex")||i.setAttribute("tabindex","-1");let a=document.createElement("a");a.href="#",a.textContent=r,a.style.cssText=`
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
    `,a.addEventListener("focus",()=>{t.style.transform="translateY(0)"}),a.addEventListener("blur",()=>{setTimeout(()=>{t.matches(":focus-within")||(t.style.transform="translateY(-100%)")},2e3)}),a.addEventListener("click",l=>{l.preventDefault(),i.focus(),i.scrollIntoView({behavior:"smooth",block:"start"}),ie(`Jumped to ${r.replace("Skip to ","")}`,"info"),t.style.transform="translateY(-100%)"}),t.appendChild(a)}),!n)return;window.innerWidth<768&&(t.style.transform="translateY(0)",t.style.position="sticky"),window.addEventListener("resize",()=>{window.innerWidth<768&&(t.style.transform="translateY(0)")}),document.body.insertBefore(t,document.body.firstChild),Br=t}function na(){if(typeof document>"u"||document.querySelector("[data-yuktai-focus-style]"))return;let e=document.createElement("style");e.setAttribute("data-yuktai-focus-style","true"),e.textContent=`

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
  `,document.head.appendChild(e),document.documentElement.setAttribute("data-yuktai-a11y","true")}function oa(){typeof document>"u"||document.querySelector("[data-yuktai-kb-init]")||(document.documentElement.setAttribute("data-yuktai-kb-init","true"),document.addEventListener("keydown",e=>{let t=document.activeElement;if(!t)return;let n=t.getAttribute("role")||"";if(e.key==="Escape"){let o=t.closest("[role='dialog'],[role='alertdialog']");if(o){o.style.display="none",ie("Dialog closed","info");return}let r=t.closest("[role='menu'],[role='menubar']");r&&(r.style.display="none",ie("Menu closed","info"))}if(n==="menuitem"||t.closest("[role='menu'],[role='menubar']")){let o=t.closest("[role='menu'],[role='menubar']");if(!o)return;let r=Array.from(o.querySelectorAll("[role='menuitem']:not([disabled])")),s=r.indexOf(t);e.key==="ArrowDown"||e.key==="ArrowRight"?(e.preventDefault(),r[(s+1)%r.length]?.focus()):e.key==="ArrowUp"||e.key==="ArrowLeft"?(e.preventDefault(),r[(s-1+r.length)%r.length]?.focus()):e.key==="Home"?(e.preventDefault(),r[0]?.focus()):e.key==="End"&&(e.preventDefault(),r[r.length-1]?.focus())}if(n==="tab"||t.closest("[role='tablist']")){let o=t.closest("[role='tablist']");if(!o)return;let r=Array.from(o.querySelectorAll("[role='tab']:not([disabled])")),s=r.indexOf(t);if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();let i=r[(s+1)%r.length];i?.focus(),i?.click()}else if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();let i=r[(s-1+r.length)%r.length];i?.focus(),i?.click()}}if(n==="option"||t.closest("[role='listbox']")){let o=t.closest("[role='listbox']");if(!o)return;let r=Array.from(o.querySelectorAll("[role='option']:not([aria-disabled='true'])")),s=r.indexOf(t);e.key==="ArrowDown"?(e.preventDefault(),r[(s+1)%r.length]?.focus()):e.key==="ArrowUp"?(e.preventDefault(),r[(s-1+r.length)%r.length]?.focus()):(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),t.setAttribute("aria-selected","true"),r.forEach(i=>{i!==t&&i.setAttribute("aria-selected","false")}),ie(`Selected: ${t.textContent?.trim()}`,"success"))}e.altKey&&e.key==="a"&&(e.preventDefault(),ra()),e.key==="Tab"&&ft?.speechEnabled&&setTimeout(()=>{let o=document.activeElement;if(!o)return;let r=o.getAttribute("aria-label")||o.getAttribute("title")||o.textContent?.trim()||o.tagName.toLowerCase(),s=o.getAttribute("role")||o.tagName.toLowerCase();Fn(`${r}, ${s}`)},100)}))}function nn(e){let t=e.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[role="button"]');if(t.length===0)return;let n=t[0],o=t[t.length-1];n.focus(),e.addEventListener("keydown",r=>{r.key==="Tab"&&(r.shiftKey?document.activeElement===n&&(r.preventDefault(),o.focus()):document.activeElement===o&&(r.preventDefault(),n.focus()))})}function ra(){if(typeof document>"u")return;if(mt){mt.remove(),mt=null;return}let e=document.createElement("div");e.setAttribute("role","dialog"),e.setAttribute("aria-label","Keyboard shortcuts"),e.setAttribute("aria-modal","true"),e.setAttribute("data-yuktai-cheatsheet","true"),e.style.cssText=`
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
  `,e.querySelector("[data-yuktai-close]")?.addEventListener("click",()=>{e.remove(),mt=null}),e.addEventListener("keydown",o=>{o.key==="Escape"&&(e.remove(),mt=null)}),document.body.appendChild(e),mt=e,nn(e),ie("Keyboard shortcuts opened. Press Escape to close.","info")}function ia(e){if(typeof document>"u"||!ft?.showAuditBadge||typeof window<"u"&&!window.location.hostname.includes("localhost")&&!window.location.hostname.includes("127.0.0.1"))return;Nn&&Nn.remove();let t=e.score,n=t>=90?"#0f9d58":t>=70?"#f29900":"#d93025",o=t>=90?"\u267F":t>=70?"\u26A0":"\u2715",r=document.createElement("button");r.setAttribute("aria-label",`Accessibility score: ${t} out of 100`),r.setAttribute("data-yuktai-badge","true"),r.style.cssText=`
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
  `,r.innerHTML=`${o} ${t}/100 <span style="font-weight:400;opacity:0.85">${e.details.length} issues</span>`,r.addEventListener("click",()=>sa(e)),document.body.appendChild(r),Nn=r}function sa(e){let t=document.querySelector("[data-yuktai-audit-details]");if(t){t.remove();return}let n=document.createElement("div");n.setAttribute("data-yuktai-audit-details","true"),n.setAttribute("role","dialog"),n.setAttribute("aria-label","Accessibility audit details"),n.style.cssText=`
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
  `,n.addEventListener("keydown",r=>{r.key==="Escape"&&n.remove()}),document.body.appendChild(n),nn(n)}function Xr(e){typeof document>"u"||(Mn&&clearTimeout(Mn),Mn=setTimeout(()=>{if(Zt)return;let t=document.createElement("div");t.setAttribute("role","alertdialog"),t.setAttribute("aria-label","Session timeout warning"),t.setAttribute("aria-modal","true"),t.setAttribute("data-yuktai-timeout","true"),t.style.cssText=`
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
    `;let n=t.querySelector("[data-yuktai-extend]"),o=t.querySelector("[data-yuktai-dismiss]");n?.addEventListener("click",()=>{t.remove(),Zt=null,ie("Session extended. You have more time.","success"),ft?.timeoutWarning&&Xr(ft.timeoutWarning)}),o?.addEventListener("click",()=>{t.remove(),Zt=null}),document.body.appendChild(t),Zt=t,nn(t),ie("Warning: Your session will expire soon. Do you need more time?","warning")},e*1e3))}function aa(e){if(typeof document>"u")return;let t=document.documentElement;if(t.toggleAttribute("data-yuktai-high-contrast",!!e.highContrast),t.toggleAttribute("data-yuktai-dark",!!e.darkMode),t.toggleAttribute("data-yuktai-reduce-motion",!!e.reduceMotion),t.toggleAttribute("data-yuktai-large-targets",!!e.largeTargets),t.toggleAttribute("data-yuktai-keyboard",!!e.keyboardHints),t.toggleAttribute("data-yuktai-dyslexia",!!e.dyslexiaFont),e.localFont?document.body.style.fontFamily=`"${e.localFont}", system-ui, sans-serif`:e.dyslexiaFont||(document.body.style.fontFamily=""),e.fontSizeMultiplier&&e.fontSizeMultiplier!==1?document.documentElement.style.fontSize=`${e.fontSizeMultiplier*100}%`:document.documentElement.style.fontSize="",e.colorBlindMode&&e.colorBlindMode!=="none"){let n=e.colorBlindMode==="achromatopsia"?"grayscale(100%)":`url(#${en[e.colorBlindMode]})`;document.body.style.filter=n}else document.body.style.filter=""}function la(e){try{let t=localStorage.getItem("yuktai-a11y-prefs");t&&Object.assign(e,JSON.parse(t))}catch{}}async function _r(e){if(e){if(!await Cn()){ie("Plain English requires Chrome 127+","warning");return}ie("Rewriting page in plain English...","info",!1);let n=await Ir();ie(n.error?`Plain English failed: ${n.error}`:`${n.fixed} sections rewritten in plain English`,n.error?"error":"success",!1)}else Rr(),ie("Original text restored","info",!1)}async function qr(e){if(e){if(!await In()){ie("Page summariser requires Chrome 127+","warning");return}ie("Generating page summary...","info",!1);let n=await Lr();ie(n.error?`Summary failed: ${n.error}`:"Page summary added at top",n.error?"error":"success",!1)}else Kt(),ie("Page summary removed","info",!1)}async function jr(e){if(e==="en"){Rn(),ie("Page restored to English","info",!1);return}ie(`Translating page to ${e}...`,"info",!1);let t=await Nr(e);ie(t.error?`Translation failed: ${t.error}`:`Page translated to ${e}`,t.error?"error":"success",!1)}async function Ur(e){if(e){if(!En()){ie("Voice control not supported in this browser","warning");return}Pr(t=>{t.success&&ie(`Voice: ${t.action}`,"info",!1)}),ie("Voice control started. Say a command.","success",!1)}else $n(),ie("Voice control stopped","info",!1)}async function Vr(e){if(e){if(!await Ln()){ie("Smart labels requires Chrome 127+","warning");return}ie("Generating smart labels...","info",!1);let n=await Or();ie(n.error?`Smart labels failed: ${n.error}`:`${n.fixed} elements labelled`,n.error?"error":"success",!1)}else Dr(),ie("Smart labels removed","info",!1)}function ca(){if(typeof document>"u"||tn)return;let e=document.createElement("div");e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true"),e.setAttribute("aria-relevant","text"),e.style.cssText="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);",document.body.appendChild(e),tn=e}function da(){if(typeof document>"u"||Wr)return;let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("aria-hidden","true"),e.style.cssText="position:absolute;width:0;height:0;overflow:hidden;",e.innerHTML=`
    <defs>
      <filter id="${en.deuteranopia}">
        <feColorMatrix type="matrix"
          values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${en.protanopia}">
        <feColorMatrix type="matrix"
          values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${en.tritanopia}">
        <feColorMatrix type="matrix"
          values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
      </filter>
    </defs>
  `,document.body.appendChild(e),Wr=e}function Yr(e){return e.getAttribute("aria-label")?.trim()||e.getAttribute("aria-labelledby")||e.getAttribute("title")?.trim()||e.textContent?.trim()?!0:!!e.querySelector("img[alt]:not([alt='']), svg[aria-label], svg title, [aria-label]")}function Kr(e){let t={critical:20,serious:10,moderate:5,minor:2},n=e.details.reduce((o,r)=>o+(t[r.severity]||0),0);return Math.max(0,Math.min(100,100-n))}var ke={name:"yuktai-a11y",version:"4.0.0",observer:null,async execute(e){if(!e.enabled)return this.stopObserver(),"yuktai: disabled.";ft=e,la(e),ca(),da(),na(),oa(),e.showSkipLinks!==!1&&ta(),e.showPreferencePanel,aa(e);let t=this.applyFixes(e);t.score=Kr(t),e.showAuditBadge&&ia(t),e.timeoutWarning&&Xr(e.timeoutWarning),e.autoFix&&this.startObserver(e),e.plainEnglish&&await _r(!0),e.summarisePage&&await qr(!0),e.translateLanguage&&e.translateLanguage!=="en"&&await jr(e.translateLanguage),e.voiceControl&&await Ur(!0),e.smartLabels&&await Vr(!0);let n=`${t.fixed} fixes applied. Score: ${t.score}/100.`;return ie(n,t.score>=90?"success":"info",!1),`yuktai v4.0.0: ${n} Scanned ${t.scanned} elements in ${t.renderTime}ms.`},applyFixes(e){let t={fixed:0,scanned:0,renderTime:0,score:100,details:[]};if(typeof document>"u")return t;let n=performance.now(),o=document.querySelectorAll("*");t.scanned=o.length;let r=(s,i,a,l)=>{t.details.push({tag:s,fix:i,severity:a,element:l.outerHTML.slice(0,100)}),t.fixed++};return o.forEach(s=>{let i=s,a=i.tagName.toLowerCase();if(a==="html"&&!i.getAttribute("lang")&&(i.setAttribute("lang","en"),r(a,'lang="en" added',"critical",i)),a==="meta"){let d=i.getAttribute("name"),g=i.getAttribute("content")||"";d==="viewport"&&g.includes("user-scalable=no")&&(i.setAttribute("content",g.replace("user-scalable=no","user-scalable=yes")),r(a,"user-scalable=yes restored","serious",i)),d==="viewport"&&/maximum-scale=1(?:[^0-9]|$)/.test(g)&&(i.setAttribute("content",g.replace(/maximum-scale=1(?=[^0-9]|$)/,"maximum-scale=5")),r(a,"maximum-scale=5 restored","serious",i))}if(a==="main"&&!i.getAttribute("tabindex")&&(i.setAttribute("tabindex","-1"),i.getAttribute("id")||i.setAttribute("id","main-content")),a==="img"&&(i.hasAttribute("alt")||(i.setAttribute("alt",""),i.setAttribute("aria-hidden","true"),r(a,'alt="" aria-hidden="true"',"serious",i))),a==="svg"&&(!i.getAttribute("aria-hidden")&&!i.getAttribute("aria-label")&&!s.querySelector("title")&&(i.setAttribute("aria-hidden","true"),r(a,'aria-hidden="true" (decorative svg)',"minor",i)),i.getAttribute("focusable")||i.setAttribute("focusable","false")),a==="iframe"&&!i.getAttribute("title")&&!i.getAttribute("aria-label")&&(i.setAttribute("title","embedded content"),i.setAttribute("aria-label","embedded content"),r(a,"title + aria-label added","serious",i)),a==="button"){if(!Yr(i)){let d=i.getAttribute("title")||"button";i.setAttribute("aria-label",d),r(a,`aria-label="${d}" (empty button)`,"critical",i)}i.hasAttribute("disabled")&&!i.getAttribute("aria-disabled")&&(i.setAttribute("aria-disabled","true"),t.fixed++)}if(a==="a"){let d=i;Yr(i)||(i.setAttribute("aria-label",i.getAttribute("title")||"link"),r(a,"aria-label added (empty link)","critical",i)),d.target==="_blank"&&!d.rel?.includes("noopener")&&(d.rel="noopener noreferrer",t.fixed++)}if(Hr.has(a)){let d=i;if(!(!!(d.labels&&d.labels.length)||!!i.getAttribute("title")||d.type==="hidden"||d.type==="submit"||d.type==="button"||d.type==="reset")&&!i.getAttribute("aria-label")&&!i.getAttribute("aria-labelledby")){let p=i.getAttribute("placeholder")||i.getAttribute("name")||a;i.setAttribute("aria-label",p),r(a,`aria-label="${p}"`,"serious",i)}if(i.hasAttribute("required")&&!i.getAttribute("aria-required")&&(i.setAttribute("aria-required","true"),t.fixed++),a==="input"&&!d.autocomplete){let p=d.name||"",m=d.type==="email"||p.includes("email")?"email":d.type==="tel"||p.includes("tel")?"tel":d.type==="password"?"current-password":"";m&&(d.autocomplete=m,t.fixed++)}}a==="th"&&!i.getAttribute("scope")&&(i.setAttribute("scope",i.closest("thead")?"col":"row"),r(a,"scope added to <th>","moderate",i));let l=(a==="header"||a==="footer")&&!!i.parentElement?.closest("article,aside,main,nav,section,[role='dialog'],[role='region']");Pn[a]&&!i.getAttribute("role")&&!l&&(i.setAttribute("role",Pn[a]),r(a,`role="${Pn[a]}"`,"minor",i));let c=i.getAttribute("role")||"";c==="tab"&&!i.getAttribute("aria-selected")&&(i.setAttribute("aria-selected","false"),t.fixed++),["alert","status","log"].includes(c)&&!i.getAttribute("aria-live")&&(i.setAttribute("aria-live",c==="alert"?"assertive":"polite"),r(a,`aria-live added on role=${c}`,"moderate",i)),c==="combobox"&&!i.getAttribute("aria-expanded")&&(i.setAttribute("aria-expanded","false"),r(a,'aria-expanded="false" on combobox',"serious",i)),(c==="checkbox"||c==="radio")&&!i.getAttribute("aria-checked")&&(i.setAttribute("aria-checked","false"),r(a,`aria-checked="false" on role=${c}`,"serious",i))}),t.renderTime=parseFloat((performance.now()-n).toFixed(2)),t},scan(){let e={fixed:0,scanned:0,renderTime:0,score:100,details:[]};if(typeof document>"u")return e;let t=performance.now(),n=document.querySelectorAll("*");e.scanned=n.length;let o=(r,s,i,a)=>e.details.push({tag:r,fix:s,severity:i,element:a.outerHTML.slice(0,100)});return n.forEach(r=>{let s=r,i=s.tagName.toLowerCase();(i==="a"||i==="button")&&!s.innerText?.trim()&&!s.getAttribute("aria-label")&&o(i,"needs aria-label (empty)","critical",s),i==="img"&&!s.hasAttribute("alt")&&o(i,"needs alt text","serious",s),Hr.has(i)&&!s.getAttribute("aria-label")&&!s.getAttribute("aria-labelledby")&&o(i,"needs aria-label","serious",s),i==="iframe"&&!s.getAttribute("title")&&!s.getAttribute("aria-label")&&o(i,"iframe needs title","serious",s)}),e.fixed=e.details.length,e.score=Kr(e),e.renderTime=parseFloat((performance.now()-t).toFixed(2)),e},startObserver(e){this.observer||typeof document>"u"||(this.observer=new MutationObserver(()=>this.applyFixes(e)),this.observer.observe(document.body,{childList:!0,subtree:!0,attributes:!1}))},stopObserver(){this.observer?.disconnect(),this.observer=null},announce:ie,speak:Fn,showVisualAlert:Qr,trapFocus:nn,handlePlainEnglish:_r,handleSummarisePage:qr,handleTranslate:jr,handleVoiceControl:Ur,handleSmartLabels:Vr,SUPPORTED_LANGUAGES:Xt};A();A();var Z=An(require("react"));A();var Te=require("react");zn();Et();var v=require("react/jsx-runtime"),Bn={highContrast:!1,reduceMotion:!1,autoFix:!0,dyslexiaFont:!1,fontScale:100,localFont:"",darkMode:!1,largeTargets:!1,speechEnabled:!1,colorBlindMode:"none",showAuditBadge:!1,timeoutWarning:void 0,plainEnglish:!1,summarisePage:!1,translateLanguage:"en",voiceControl:!1,smartLabels:!1},bt=[80,90,100,110,120,130],wa=[{value:"none",label:"None"},{value:"deuteranopia",label:"Deuteranopia"},{value:"protanopia",label:"Protanopia"},{value:"tritanopia",label:"Tritanopia"},{value:"achromatopsia",label:"Greyscale"}],va=["Prompt API for Gemini Nano","Summarization API for Gemini Nano","Writer API for Gemini Nano","Rewriter API for Gemini Nano","Translation API"];function ka(){let[e,t]=(0,Te.useState)(typeof window<"u"?window.innerWidth:1024);return(0,Te.useEffect)(()=>{let n=()=>t(window.innerWidth);return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[]),{isMobile:e<=480,isTablet:e>480&&e<=768}}function Sa({checked:e,onChange:t,label:n,disabled:o=!1}){return(0,v.jsxs)("label",{"aria-label":n,style:{position:"relative",display:"inline-flex",width:"40px",height:"24px",cursor:o?"not-allowed":"pointer",flexShrink:0,opacity:o?.4:1},children:[(0,v.jsx)("input",{type:"checkbox",checked:e,disabled:o,onChange:r=>t(r.target.checked),style:{opacity:0,width:0,height:0,position:"absolute"}}),(0,v.jsx)("span",{style:{position:"absolute",inset:0,borderRadius:"99px",background:e?"#0d9488":"#cbd5e1",transition:"background 0.2s"}}),(0,v.jsx)("span",{style:{position:"absolute",top:"3px",left:e?"19px":"3px",width:"18px",height:"18px",background:"#fff",borderRadius:"50%",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",pointerEvents:"none"}})]})}function yt({label:e,color:t="#64748b",badge:n,concept:o}){return(0,v.jsxs)("div",{style:{margin:"10px 18px 4px"},children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,v.jsx)("p",{style:{margin:0,fontSize:"10px",fontWeight:600,color:t,letterSpacing:"0.06em",textTransform:"uppercase"},children:e}),n&&(0,v.jsx)("span",{style:{fontSize:"9px",fontWeight:500,padding:"1px 7px",borderRadius:"99px",background:"#f5f3ff",color:"#7c3aed",border:"0.5px solid #c4b5fd",whiteSpace:"nowrap"},children:n})]}),o&&(0,v.jsx)("p",{style:{margin:"2px 0 0",fontSize:"9px",color:"#94a3b8",fontStyle:"italic"},children:o})]})}function Fe({icon:e,label:t,desc:n,checked:o,onChange:r,disabled:s=!1,disabledReason:i,tip:a}){return(0,v.jsxs)("div",{title:s?i:a,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",gap:"12px"},children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"10px",flex:1,minWidth:0},children:[(0,v.jsx)("span",{"aria-hidden":"true",style:{width:"32px",height:"32px",borderRadius:"8px",background:s?"#f1f5f9":"#f0fdfa",color:s?"#94a3b8":"#0d9488",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",flexShrink:0,fontWeight:700},children:e}),(0,v.jsxs)("div",{style:{minWidth:0},children:[(0,v.jsx)("p",{style:{margin:0,fontSize:"13px",fontWeight:500,color:s?"#94a3b8":"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:t}),(0,v.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#94a3b8"},children:s?i:n})]})]}),(0,v.jsx)(Sa,{checked:o,onChange:r,label:`Toggle ${t}`,disabled:s})]})}function Se(){return(0,v.jsx)("div",{style:{height:"1px",background:"#f1f5f9"}})}function $t({steps:e}){return(0,v.jsxs)("div",{style:{margin:"0 18px 8px",padding:"8px 10px",background:"#f8fafc",borderRadius:"8px",border:"0.5px solid #e2e8f0"},children:[(0,v.jsx)("p",{style:{margin:"0 0 4px",fontSize:"9px",fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em"},children:"How to use"}),e.map((t,n)=>(0,v.jsxs)("p",{style:{margin:"0 0 2px",fontSize:"10px",color:"#475569"},children:[n+1,". ",t]},n))]})}var Hn=(0,Te.forwardRef)(({position:e,settings:t,report:n,isActive:o,aiSupported:r,voiceSupported:s,set:i,onApply:a,onReset:l,onClose:c},d)=>{let{isMobile:g,isTablet:p}=ka(),[m,f]=(0,Te.useState)([]),[b,u]=(0,Te.useState)(""),[y,k]=(0,Te.useState)(""),[h,S]=(0,Te.useState)(!1),[w,R]=(0,Te.useState)(null),[E,P]=(0,Te.useState)("idle");(0,Te.useEffect)(()=>{let x=window;!!(x.LanguageModel||x.ai?.languageModel)&&r?R("gemini"):It()&&R("transformers")},[r]),(0,Te.useEffect)(()=>{if(w!=="transformers")return;let x=setInterval(()=>{P(Rt())},500);return()=>clearInterval(x)},[w]);let H=async()=>{if(!(!b.trim()||h)){if(!w){k("\u26A0\uFE0F No AI engine available on this device.");return}S(!0),k("");try{let x;w==="gemini"?x=await Gn(b):(P("loading"),x=await Dn(b),P("ready")),k(x.success&&x.answer?x.answer.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/#+\s/g,"").trim():"\u26A0\uFE0F "+(x.error||"No answer found on this page"))}catch{k("\u26A0\uFE0F Failed to get answer. Please try again.")}S(!1)}};(0,Te.useEffect)(()=>{(async()=>{try{let Y=window;if(!Y.queryLocalFonts)return;let j=await Y.queryLocalFonts(),ee=[...new Set(j.map(ae=>ae.family))].sort();f(ee.slice(0,50))}catch{}})()},[]);let O=w==="gemini"?"Gemini Nano":w==="transformers"?"Transformers.js \xB7 All devices":"Detecting...",M=w==="transformers"&&E==="loading"?"Loading AI model... (first time only)":"...",$=g?{position:"fixed",bottom:0,left:0,right:0,zIndex:9999,background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px 16px 0 0",boxShadow:"0 -8px 32px rgba(0,0,0,0.12)",maxHeight:"90vh",overflowY:"auto",fontFamily:"system-ui,-apple-system,sans-serif",width:"100%"}:{position:"fixed",bottom:"84px",[e]:"24px",zIndex:9999,width:p?"300px":"320px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",maxHeight:"80vh",overflowY:"auto",fontFamily:"system-ui,-apple-system,sans-serif"};return(0,v.jsxs)("div",{ref:d,role:"dialog","aria-modal":"true","aria-label":"yuktai accessibility preferences","data-yuktai-panel":"true",style:$,children:[(0,v.jsxs)("div",{style:{padding:"14px 18px 12px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1},children:[(0,v.jsxs)("div",{children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"7px",marginBottom:"4px",flexWrap:"wrap"},children:[(0,v.jsx)("span",{style:{fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"99px",background:"#f0fdfa",color:"#0d9488",letterSpacing:"0.05em",fontFamily:"monospace"},children:"@yuktishaalaa/yuktai"}),o&&(0,v.jsx)("span",{style:{fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"99px",background:"#f0fdfa",color:"#0f766e",border:"1px solid #99f6e4"},children:"\u25CF ACTIVE"})]}),(0,v.jsx)("p",{style:{margin:"0 0 1px",fontSize:"15px",fontWeight:600,color:"#0f172a"},children:"Accessibility"}),(0,v.jsx)("p",{style:{margin:0,fontSize:"11px",color:"#64748b"},children:"WCAG 2.2 \xB7 Open source \xB7 Zero cost \xB7 All devices"})]}),(0,v.jsx)("button",{onClick:c,"aria-label":"Close accessibility panel",style:{background:"none",border:"none",cursor:"pointer",padding:"4px",color:"#94a3b8",fontSize:"20px",lineHeight:1,borderRadius:"6px",flexShrink:0,minWidth:g?"44px":"auto",minHeight:g?"44px":"auto",display:"flex",alignItems:"center",justifyContent:"center"},children:"\xD7"})]}),(0,v.jsx)(yt,{label:"\u267F Core Accessibility",concept:"Rule-based engine \u2014 works on all browsers and devices"}),(0,v.jsx)($t,{steps:["Toggle any feature on","Click Apply settings","Preferences saved automatically"]}),(0,v.jsx)(Fe,{icon:"\u{1F527}",label:"Auto-fix ARIA",desc:"Injects missing labels and roles automatically",checked:t.autoFix,onChange:x=>i("autoFix",x),tip:"Fixes aria-label, alt text, roles on every element"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u{1F50A}",label:"Speak on focus",desc:"Browser reads elements aloud as you tab",checked:t.speechEnabled,onChange:x=>i("speechEnabled",x),tip:"Uses browser SpeechSynthesis \u2014 no install needed"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u{1F399}\uFE0F",label:"Voice control",desc:"Say commands to navigate the page",checked:t.voiceControl,onChange:x=>i("voiceControl",x),disabled:!s,disabledReason:"Not supported in this browser",tip:'Say "scroll down", "go to main", "click"'}),(0,v.jsx)(Se,{}),(0,v.jsx)(yt,{label:"\u{1F916} AI Features",color:"#7c3aed",badge:"Gemini Nano",concept:"Large Language Model running privately on your device \u2014 Chrome 127+ only"}),(0,v.jsx)("div",{style:{margin:"4px 18px 6px",padding:"8px 10px",background:r?"#f0fdfa":"#f5f3ff",borderRadius:"8px",border:`0.5px solid ${r?"#99f6e4":"#c4b5fd"}`,fontSize:"10px",color:r?"#0f766e":"#7c3aed",lineHeight:1.5},children:r?"\u2705 Gemini Nano detected \u2014 AI features ready. Runs privately on your device.":"\u2699\uFE0F AI features need one-time setup \u2014 see guide below."}),!r&&(0,v.jsxs)("div",{style:{margin:"0 18px 8px",padding:"10px 12px",background:"#fafafa",borderRadius:"8px",border:"0.5px solid #e2e8f0",fontSize:"11px",color:"#475569",lineHeight:1.7},children:[(0,v.jsx)("p",{style:{margin:"0 0 6px",fontWeight:600,color:"#0f172a",fontSize:"11px"},children:"\u{1F6E0} One-time setup \u2014 5 steps:"}),(0,v.jsxs)("p",{style:{margin:"0 0 3px"},children:["1. Open Chrome \u2192 ",(0,v.jsx)("code",{style:{background:"#f1f5f9",padding:"1px 5px",borderRadius:"4px",fontSize:"10px",color:"#0d9488",fontFamily:"monospace"},children:"chrome://flags"})]}),(0,v.jsx)("p",{style:{margin:"0 0 3px"},children:"2. Enable each flag:"}),(0,v.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"2px",margin:"4px 0 6px 10px"},children:va.map(x=>(0,v.jsxs)("span",{style:{fontSize:"10px",color:"#7c3aed",fontFamily:"monospace"},children:["\u2192 ",x]},x))}),(0,v.jsxs)("p",{style:{margin:"0 0 3px"},children:["3. Click ",(0,v.jsx)("strong",{style:{color:"#0f172a"},children:"Relaunch"})]}),(0,v.jsxs)("p",{style:{margin:"0 0 3px"},children:["4. ",(0,v.jsx)("code",{style:{background:"#f1f5f9",padding:"1px 5px",borderRadius:"4px",fontSize:"10px",color:"#0d9488",fontFamily:"monospace"},children:"chrome://components"})," \u2192 Optimization Guide On Device Model \u2192 Check for update"]}),(0,v.jsx)("p",{style:{margin:"0"},children:"5. Refresh \u2014 AI features unlock automatically \u2705"})]}),(0,v.jsx)(Fe,{icon:"\u{1F4DD}",label:"Plain English mode",desc:"Rewrites complex text in simple language",checked:t.plainEnglish,onChange:x=>i("plainEnglish",x),disabled:!r,disabledReason:"Enable Gemini Nano \u2014 see setup above",tip:"AI concept: LLM text rewriting"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u{1F4CB}",label:"Summarise page",desc:"3-sentence summary appears at top",checked:t.summarisePage,onChange:x=>i("summarisePage",x),disabled:!r,disabledReason:"Enable Gemini Nano \u2014 see setup above",tip:"AI concept: Abstractive summarisation"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u{1F3F7}\uFE0F",label:"Smart aria-labels",desc:"AI generates meaningful labels for elements",checked:t.smartLabels,onChange:x=>i("smartLabels",x),disabled:!r,disabledReason:"Enable Gemini Nano \u2014 see setup above",tip:"AI concept: Context-aware label generation"}),(0,v.jsx)(Se,{}),(0,v.jsx)(yt,{label:"\u{1F441}\uFE0F Visual",concept:"CSS filter-based \u2014 works on all browsers and devices"}),(0,v.jsx)($t,{steps:["Toggle any visual mode","Changes apply instantly","Works on mobile and desktop"]}),(0,v.jsx)(Fe,{icon:"\u25D1",label:"High contrast",desc:"Boosts contrast for low vision users",checked:t.highContrast,onChange:x=>i("highContrast",x),tip:"CSS filter: contrast()"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u{1F319}",label:"Dark mode",desc:"Inverts colours \u2014 easy on eyes at night",checked:t.darkMode,onChange:x=>i("darkMode",x),tip:"CSS filter: invert + hue-rotate"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u23F8\uFE0F",label:"Reduce motion",desc:"Disables all animations",checked:t.reduceMotion,onChange:x=>i("reduceMotion",x),tip:"WCAG 2.3.3 \u2014 vestibular disorders"}),(0,v.jsx)(Se,{}),(0,v.jsx)(Fe,{icon:"\u{1F446}",label:"Large targets",desc:"44\xD744px minimum touch targets",checked:t.largeTargets,onChange:x=>i("largeTargets",x),tip:"WCAG 2.5.8 \u2014 motor impaired users"}),(0,v.jsx)(Se,{}),(0,v.jsxs)("div",{style:{padding:"10px 18px"},children:[(0,v.jsx)("p",{style:{margin:"0 0 2px",fontSize:"12px",fontWeight:500,color:"#0f172a"},children:"\u{1F3A8} Colour blindness"}),(0,v.jsx)("p",{style:{margin:"0 0 8px",fontSize:"10px",color:"#94a3b8"},children:"SVG colour matrix filters \u2014 all devices"}),(0,v.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px"},children:wa.map(x=>(0,v.jsx)("button",{onClick:()=>i("colorBlindMode",x.value),"aria-pressed":t.colorBlindMode===x.value,style:{padding:"4px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:500,border:`1px solid ${t.colorBlindMode===x.value?"#0d9488":"#e2e8f0"}`,background:t.colorBlindMode===x.value?"#f0fdfa":"#fff",color:t.colorBlindMode===x.value?"#0d9488":"#64748b",cursor:"pointer",minHeight:g?"36px":"auto"},children:x.label},x.value))})]}),(0,v.jsx)(Se,{}),(0,v.jsx)(yt,{label:"\u{1F524} Font",concept:"Browser Font API + CSS \u2014 Chrome 103+"}),(0,v.jsx)($t,{steps:["Toggle dyslexia font or pick from device","Adjust size with + / \u2212","Saved across visits"]}),(0,v.jsx)(Fe,{icon:"Aa",label:"Dyslexia-friendly font",desc:"Atkinson Hyperlegible \u2014 research-backed",checked:t.dyslexiaFont,onChange:x=>i("dyslexiaFont",x),tip:"By Braille Institute \u2014 free and open source"}),(0,v.jsx)(Se,{}),(0,v.jsxs)("div",{style:{padding:"10px 18px"},children:[(0,v.jsx)("p",{style:{margin:"0 0 2px",fontSize:"12px",fontWeight:500,color:"#0f172a"},children:"\u{1F5A5}\uFE0F Local font"}),(0,v.jsx)("p",{style:{margin:"0 0 8px",fontSize:"10px",color:"#94a3b8"},children:"window.queryLocalFonts() \u2014 Chrome 103+"}),m.length>0?(0,v.jsxs)("select",{value:t.localFont,onChange:x=>i("localFont",x.target.value),"aria-label":"Choose a font from your device",style:{width:"100%",padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"13px",color:"#0f172a",background:"#fff",cursor:"pointer",height:g?"44px":"36px"},children:[(0,v.jsx)("option",{value:"",children:"System default"}),m.map(x=>(0,v.jsx)("option",{value:x,style:{fontFamily:x},children:x},x))]}):(0,v.jsx)("p",{style:{margin:0,fontSize:"11px",color:"#94a3b8"},children:"Allow font access when Chrome prompts you."})]}),(0,v.jsx)(Se,{}),(0,v.jsxs)("div",{style:{padding:"10px 18px 14px"},children:[(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"},children:[(0,v.jsxs)("div",{children:[(0,v.jsx)("p",{style:{margin:0,fontSize:"12px",fontWeight:500,color:"#0f172a"},children:"\u{1F4CF} Text size"}),(0,v.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#94a3b8"},children:"Scales all text on the page"})]}),(0,v.jsxs)("span",{style:{fontSize:"12px",fontWeight:600,color:"#0d9488",background:"#f0fdfa",padding:"2px 8px",borderRadius:"99px"},children:[t.fontScale,"%"]})]}),(0,v.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,v.jsx)("button",{onClick:()=>{let x=bt.indexOf(t.fontScale);x>0&&i("fontScale",bt[x-1])},disabled:t.fontScale<=80,"aria-label":"Decrease text size",style:{width:g?"44px":"30px",height:g?"44px":"30px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",cursor:t.fontScale<=80?"not-allowed":"pointer",fontSize:"16px",color:t.fontScale<=80?"#cbd5e1":"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:"\u2212"}),(0,v.jsx)("div",{style:{flex:1,display:"flex",gap:"3px"},children:bt.map(x=>(0,v.jsx)("button",{onClick:()=>i("fontScale",x),"aria-label":`Set text size to ${x}%`,style:{flex:1,height:"6px",borderRadius:"99px",border:"none",cursor:"pointer",padding:0,background:x<=t.fontScale?"#0d9488":"#e2e8f0",transition:"background 0.15s"}},x))}),(0,v.jsx)("button",{onClick:()=>{let x=bt.indexOf(t.fontScale);x<bt.length-1&&i("fontScale",bt[x+1])},disabled:t.fontScale>=130,"aria-label":"Increase text size",style:{width:g?"44px":"30px",height:g?"44px":"30px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",cursor:t.fontScale>=130?"not-allowed":"pointer",fontSize:"16px",color:t.fontScale>=130?"#cbd5e1":"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:"+"})]})]}),(0,v.jsx)(Se,{}),(0,v.jsx)(yt,{label:"\u{1F310} Translate",color:"#7c3aed",badge:"Gemini Nano",concept:"Chrome Translation API \u2014 on device, no internet after setup"}),(0,v.jsx)($t,{steps:["Enable Gemini Nano first","Pick your language","Full page translates instantly"]}),(0,v.jsxs)("div",{style:{padding:"6px 18px 12px"},children:[(0,v.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px"},children:Xt.slice(0,g?8:18).map(x=>(0,v.jsx)("button",{onClick:()=>i("translateLanguage",x.code),"aria-pressed":t.translateLanguage===x.code,disabled:!r,style:{padding:"4px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:500,border:`1px solid ${t.translateLanguage===x.code?"#7c3aed":"#e2e8f0"}`,background:t.translateLanguage===x.code?"#f5f3ff":"#fff",color:t.translateLanguage===x.code?"#7c3aed":"#64748b",cursor:r?"pointer":"not-allowed",opacity:r?1:.5,minHeight:g?"36px":"auto"},children:x.label},x.code))}),!r&&(0,v.jsx)("p",{style:{margin:"6px 0 0",fontSize:"10px",color:"#94a3b8"},children:"Enable Gemini Nano using the setup guide above."})]}),(0,v.jsx)(Se,{}),(0,v.jsx)(yt,{label:"\u{1F4AC} Ask This Page",color:"#0d9488",badge:O,concept:"RAG \u2014 Retrieval Augmented Generation. Works on all devices including mobile."}),(0,v.jsx)($t,{steps:["Type any question about this page","Press Ask or hit Enter",w==="transformers"?"Transformers.js answers \u2014 works on mobile, offline":"Gemini Nano reads page and answers privately","Zero cost. No data leaves your device."]}),(0,v.jsxs)("div",{style:{margin:"0 18px 8px",padding:"6px 10px",background:w==="gemini"?"#f0fdfa":w==="transformers"?"#f5f3ff":"#f8fafc",borderRadius:"8px",border:`0.5px solid ${w==="gemini"?"#99f6e4":w==="transformers"?"#c4b5fd":"#e2e8f0"}`,fontSize:"10px",color:w==="gemini"?"#0f766e":w==="transformers"?"#7c3aed":"#94a3b8"},children:[w==="gemini"&&"\u2705 Using Gemini Nano \u2014 on device, private, instant",w==="transformers"&&"\u2705 Using Transformers.js \u2014 works on mobile and all browsers",!w&&"\u23F3 Detecting AI engine...",w==="transformers"&&E==="loading"&&" \xB7 Loading model...",w==="transformers"&&E==="ready"&&" \xB7 Model ready \u2705"]}),(0,v.jsxs)("div",{style:{padding:"0 18px 14px"},children:[(0,v.jsxs)("div",{style:{display:"flex",gap:"6px",marginBottom:"8px"},children:[(0,v.jsx)("input",{type:"text",value:b,onChange:x=>u(x.target.value),onKeyDown:x=>{x.key==="Enter"&&H()},placeholder:"e.g. What does this page do?",disabled:h||!w,"aria-label":"Ask a question about this page",style:{flex:1,padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",background:w?"#fff":"#f8fafc",outline:"none",height:g?"44px":"36px"}}),(0,v.jsx)("button",{onClick:H,disabled:h||!b.trim()||!w,"aria-label":"Ask question",style:{padding:"8px 14px",borderRadius:"8px",border:"none",background:w&&b.trim()&&!h?"#0d9488":"#e2e8f0",color:w&&b.trim()&&!h?"#fff":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:w&&b.trim()&&!h?"pointer":"not-allowed",flexShrink:0,height:g?"44px":"36px",minWidth:"52px",transition:"background 0.2s"},children:h?M:"Ask"})]}),y&&(0,v.jsxs)("div",{role:"status","aria-live":"polite",style:{padding:"10px 12px",background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:"8px",fontSize:"12px",color:"#0f766e",lineHeight:1.6,maxHeight:"180px",overflowY:"auto"},children:[(0,v.jsx)("strong",{style:{display:"block",marginBottom:"4px",fontSize:"11px",color:"#0d9488"},children:"\u{1F4AC} Answer"}),y,(0,v.jsx)("button",{onClick:()=>{k(""),u("")},style:{display:"block",marginTop:"6px",background:"none",border:"none",color:"#94a3b8",fontSize:"10px",cursor:"pointer",padding:0},children:"Clear"})]})]}),n&&(0,v.jsx)("div",{role:"status",style:{margin:"0 14px 10px",padding:"8px 12px",background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:"8px",fontSize:"12px",color:"#0f766e",fontWeight:500,fontFamily:"monospace"},children:n.fixed>0?`\u2713 ${n.fixed} fixes \xB7 ${n.scanned} nodes \xB7 ${n.renderTime}ms \xB7 Score: ${n.score}/100`:`\u2713 0 auto-fixes needed \xB7 ${n.scanned} nodes \xB7 ${n.renderTime}ms`}),(0,v.jsxs)("div",{style:{display:"flex",gap:"8px",padding:"12px 14px 14px",position:g?"sticky":"relative",bottom:g?0:"auto",background:"#fff",borderTop:"1px solid #f1f5f9"},children:[(0,v.jsx)("button",{onClick:l,style:{flex:1,padding:g?"12px 0":"8px 0",fontSize:"13px",fontWeight:500,borderRadius:"9px",border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",cursor:"pointer"},children:"Reset"}),(0,v.jsx)("button",{onClick:a,style:{flex:2,padding:g?"12px 0":"8px 0",fontSize:"13px",fontWeight:600,borderRadius:"9px",border:"none",background:"#0d9488",color:"#fff",cursor:"pointer"},children:"Apply settings"})]})]})});Hn.displayName="WidgetPanel";Et();A();var Ue=require("react");A();var Ta={hotel:["hotel","resort","motel","inn","accommodation","lodge","stay","room","booking","hospitality"],ecommerce:["shop","store","ecommerce","e-commerce","sell","product","cart","buy","marketplace","retail"],restaurant:["restaurant","food","cafe","cafeteria","menu","dining","eat","cuisine","bistro","takeaway","delivery"],portfolio:["portfolio","freelance","personal","designer","developer","creative","showcase","work","hire me"],blog:["blog","article","post","write","news","magazine","journal","content"],saas:["saas","dashboard","app","software","platform","tool","analytics","admin","manage","crm"],government:["government","govt","portal","citizen","scheme","welfare","municipal","public","official"],healthcare:["hospital","clinic","doctor","health","medical","patient","appointment","pharmacy"],education:["school","college","university","course","learn","education","student","lms","training"],realestate:["real estate","property","house","flat","apartment","rent","buy property","listing"],landing:["landing","startup","launch","product launch","coming soon","waitlist"],generic:[]},Aa={hotel:["home","rooms","booking","about","contact"],ecommerce:["home","products","cart","checkout","about","contact"],restaurant:["home","menu","reservations","about","contact"],portfolio:["home","portfolio","about","contact"],blog:["home","blog","about","contact"],saas:["home","pricing","dashboard","auth","about","contact"],government:["home","services","about","contact","faq"],healthcare:["home","services","booking","team","about","contact"],education:["home","services","pricing","about","contact"],realestate:["home","products","about","contact"],landing:["home","pricing","about","contact"],generic:["home","about","services","contact"]},Ca={home:["home","homepage","main","landing"],about:["about","who we are","our story","company"],contact:["contact","reach us","get in touch","location"],services:["service","what we offer","solution","offering"],pricing:["pricing","price","plan","subscription","cost","fee"],blog:["blog","article","news","post"],auth:["login","register","signup","sign up","sign in","auth","account"],dashboard:["dashboard","admin","panel","manage","analytics"],gallery:["gallery","photo","image","portfolio"],products:["product","shop","store","item","catalogue"],cart:["cart","basket","shopping cart"],checkout:["checkout","payment","pay","order"],rooms:["room","suite","accommodation","stay"],booking:["booking","reserve","reservation","schedule","appointment"],menu:["menu","food","dish","cuisine"],reservations:["reservation","table booking","book table"],portfolio:["portfolio","work","project","case study"],team:["team","staff","member","people","who we are"],faq:["faq","question","answer","help","support"],terms:["terms","condition","legal"],privacy:["privacy","policy","gdpr","data"]},Ia={Authentication:["login","register","auth","signup","sign in","account"],Payment:["payment","stripe","pay","checkout","billing"],Search:["search","filter","find"],"Dark mode":["dark mode","dark theme","night mode"],"Multi-language":["multilingual","multi language","translation","i18n"],SEO:["seo","search engine","meta","google"],Analytics:["analytics","tracking","stats","dashboard"],Email:["email","newsletter","contact form","notification"],Map:["map","location","address","google maps"],"Social media":["social","instagram","facebook","twitter","share"],"Image gallery":["gallery","photo","image","carousel"],"Booking system":["booking","reservation","appointment","schedule"],"Shopping cart":["cart","basket","shop","ecommerce"],"Blog/CMS":["blog","cms","content","article","post"]},Ra={blue:["blue","navy","sky","ocean","corporate"],green:["green","nature","eco","environment","health","fresh"],purple:["purple","violet","luxury","creative","royal"],red:["red","bold","energy","passion","food"],orange:["orange","warm","friendly","fun"],teal:["teal","turquoise","modern","tech"],indigo:["indigo","professional","trust","finance","bank"],gray:["gray","minimal","clean","simple","neutral"]},Ea={hotel:"indigo",ecommerce:"blue",restaurant:"red",portfolio:"purple",blog:"gray",saas:"teal",government:"blue",healthcare:"green",education:"indigo",realestate:"orange",landing:"purple",generic:"blue"};function $a(e){let t=[/(?:for|called|named|company|business|brand)\s+["']?([A-Z][a-zA-Z\s]{1,30})["']?/i,/["']([A-Z][a-zA-Z\s]{1,30})["']/,/^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/m];for(let n of t){let o=e.match(n);if(o?.[1]){let r=o[1].trim();if(r.length>2&&r.length<40)return r}}return"My Business"}function La(e){let t=e.toLowerCase(),n="generic",o=0;for(let[r,s]of Object.entries(Ta)){let i=0;for(let a of s)t.includes(a)&&i++;i>o&&(o=i,n=r)}return n}function Na(e,t){let n=e.toLowerCase(),o=new Set(Aa[t]);for(let[r,s]of Object.entries(Ca))for(let i of s)if(n.includes(i)){o.add(r);break}return o.add("home"),o.add("contact"),Array.from(o)}function Ma(e){let t=e.toLowerCase(),n=[];for(let[o,r]of Object.entries(Ia))for(let s of r)if(t.includes(s)){n.push(o);break}return n}function Pa(e,t){let n=e.toLowerCase();for(let[o,r]of Object.entries(Ra))for(let s of r)if(n.includes(s))return o;return Ea[t]}function oi(e){let t=La(e),n=Na(e,t),o=Ma(e),r=Pa(e,t);return{siteName:$a(e),websiteType:t,pages:n,features:o,theme:r,description:e.slice(0,200)}}var G=require("react/jsx-runtime"),Oa=["Hotel booking website for Grand Palace Hotels with rooms, booking and payment","E-commerce store for organic food products with cart and checkout","Restaurant website for Spice Garden with menu and table reservations","Portfolio website for a freelance designer with gallery and contact","SaaS dashboard for project management with pricing and auth","Government portal for citizen services with FAQ and contact"],Da={home:"\u{1F3E0}",about:"\u2139\uFE0F",contact:"\u{1F4EC}",services:"\u2699\uFE0F",pricing:"\u{1F4B0}",blog:"\u{1F4DD}",auth:"\u{1F510}",dashboard:"\u{1F4CA}",gallery:"\u{1F5BC}\uFE0F",products:"\u{1F6D2}",cart:"\u{1F6CD}\uFE0F",checkout:"\u{1F4B3}",rooms:"\u{1F6CF}\uFE0F",booking:"\u{1F4C5}",menu:"\u{1F37D}\uFE0F",reservations:"\u{1FA91}",portfolio:"\u{1F4BC}",team:"\u{1F465}",faq:"\u2753",terms:"\u{1F4C4}",privacy:"\u{1F512}"},Wa={hotel:"\u{1F3E8}",ecommerce:"\u{1F6D2}",restaurant:"\u{1F37D}\uFE0F",portfolio:"\u{1F4BC}",blog:"\u{1F4DD}",saas:"\u26A1",government:"\u{1F3DB}\uFE0F",healthcare:"\u{1F3E5}",education:"\u{1F393}",realestate:"\u{1F3E0}",landing:"\u{1F680}",generic:"\u{1F310}"};function qn({position:e,onClose:t}){let[n,o]=(0,Ue.useState)("input"),[r,s]=(0,Ue.useState)(""),[i,a]=(0,Ue.useState)(null),[l,c]=(0,Ue.useState)(0),[d,g]=(0,Ue.useState)(""),p=(0,Ue.useCallback)(()=>{if(!r.trim())return;let u=oi(r);a(u),o("preview")},[r]),m=(0,Ue.useCallback)(async()=>{if(i){o("generating"),c(0),g("");try{let u=[{msg:"Parsing requirement...",pct:15},{msg:"Loading templates...",pct:30},{msg:"Generating pages...",pct:55},{msg:"Building components...",pct:70},{msg:"Creating styles...",pct:85},{msg:"Packaging ZIP...",pct:95}];for(let k of u)c(k.pct),await new Promise(h=>setTimeout(h,200));let{generateZip:y}=await Promise.resolve().then(()=>(Li(),$i));await y(i),c(100),o("done")}catch(u){g(u instanceof Error?u.message:"Generation failed. Please try again."),o("preview")}}},[i]),f=()=>{o("input"),s(""),a(null),c(0),g("")},b={position:"fixed",bottom:"204px",[e]:"24px",zIndex:9999,width:"340px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.14)",fontFamily:"system-ui,-apple-system,sans-serif",maxHeight:"75vh",overflowY:"auto"};return(0,G.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"yuktai Vibe Coder","data-yuktai-panel":"true",style:b,children:[(0,G.jsxs)("div",{style:{padding:"14px 16px 12px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1},children:[(0,G.jsxs)("div",{children:[(0,G.jsx)("p",{style:{margin:"0 0 2px",fontSize:"13px",fontWeight:700,color:"#0f172a"},children:"\u26A1 Vibe Coder"}),(0,G.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#64748b"},children:"Describe your website \u2192 Download Next.js ZIP"})]}),(0,G.jsx)("button",{onClick:t,"aria-label":"Close vibe coder",style:{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:"18px",padding:"2px"},children:"\xD7"})]}),n==="input"&&(0,G.jsxs)("div",{style:{padding:"14px 16px"},children:[(0,G.jsx)("p",{style:{margin:"0 0 10px",fontSize:"11px",color:"#64748b"},children:"Describe your business website in plain English. The plugin will generate a complete Next.js project for you."}),(0,G.jsx)("p",{style:{margin:"0 0 6px",fontSize:"10px",fontWeight:600,color:"#94a3b8",textTransform:"uppercase"},children:"Examples"}),(0,G.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"12px"},children:Oa.slice(0,3).map(u=>(0,G.jsx)("button",{onClick:()=>s(u),style:{padding:"6px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontSize:"10px",cursor:"pointer",textAlign:"left",lineHeight:1.4},children:u},u))}),(0,G.jsx)("textarea",{value:r,onChange:u=>s(u.target.value),placeholder:"e.g. I need a hotel booking website with rooms, search, and payment for Grand Palace Hotels",rows:4,"aria-label":"Describe your website",style:{width:"100%",padding:"10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",resize:"vertical",outline:"none",fontFamily:"inherit",lineHeight:1.5}}),(0,G.jsx)("button",{onClick:p,disabled:!r.trim(),style:{width:"100%",marginTop:"10px",padding:"10px",borderRadius:"8px",border:"none",background:r.trim()?"#f59e0b":"#e2e8f0",color:r.trim()?"#fff":"#94a3b8",fontSize:"13px",fontWeight:700,cursor:r.trim()?"pointer":"not-allowed",transition:"background 0.2s"},children:"Analyse Requirement \u2192"})]}),n==="preview"&&i&&(0,G.jsxs)("div",{style:{padding:"14px 16px"},children:[d&&(0,G.jsxs)("div",{style:{padding:"10px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"8px",marginBottom:"12px",fontSize:"11px",color:"#dc2626"},children:["\u26A0\uFE0F ",d]}),(0,G.jsxs)("div",{style:{background:"#f8fafc",borderRadius:"10px",padding:"12px",marginBottom:"12px"},children:[(0,G.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"},children:[(0,G.jsx)("span",{style:{fontSize:"1.5rem"},children:Wa[i.websiteType]||"\u{1F310}"}),(0,G.jsxs)("div",{children:[(0,G.jsx)("p",{style:{margin:0,fontSize:"13px",fontWeight:700,color:"#0f172a"},children:i.siteName}),(0,G.jsxs)("p",{style:{margin:0,fontSize:"10px",color:"#64748b",textTransform:"capitalize"},children:[i.websiteType," website \xB7 ",i.theme," theme"]})]})]}),(0,G.jsxs)("p",{style:{margin:"8px 0 6px",fontSize:"10px",fontWeight:600,color:"#94a3b8",textTransform:"uppercase"},children:["Pages to generate (",i.pages.length,")"]}),(0,G.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:i.pages.map(u=>(0,G.jsxs)("span",{style:{padding:"2px 8px",borderRadius:"99px",background:"#f0fdf4",border:"1px solid #86efac",fontSize:"10px",color:"#166534",fontWeight:500},children:[Da[u]||"\u{1F4C4}"," ",u]},u))}),i.features.length>0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)("p",{style:{margin:"10px 0 6px",fontSize:"10px",fontWeight:600,color:"#94a3b8",textTransform:"uppercase"},children:"Detected features"}),(0,G.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:i.features.map(u=>(0,G.jsx)("span",{style:{padding:"2px 8px",borderRadius:"99px",background:"#f5f3ff",border:"1px solid #c4b5fd",fontSize:"10px",color:"#7c3aed",fontWeight:500},children:u},u))})]})]}),(0,G.jsxs)("div",{style:{margin:"0 0 12px",padding:"10px 12px",background:"#f0fdf4",borderRadius:"8px",border:"1px solid #86efac"},children:[(0,G.jsx)("p",{style:{margin:"0 0 4px",fontSize:"10px",fontWeight:700,color:"#166534"},children:"\u{1F4E6} What you get:"}),(0,G.jsxs)("p",{style:{margin:0,fontSize:"10px",color:"#166534",lineHeight:1.6},children:["\u2705 Complete Next.js 16 project",(0,G.jsx)("br",{}),"\u2705 Tailwind CSS + CSS Modules",(0,G.jsx)("br",{}),"\u2705 TypeScript configured",(0,G.jsx)("br",{}),"\u2705 Navbar + Footer components",(0,G.jsx)("br",{}),"\u2705 All ",i.pages.length," pages ready",(0,G.jsx)("br",{}),"\u2705 Mobile responsive",(0,G.jsx)("br",{}),"\u2705 npm run dev \u2192 works immediately"]})]}),(0,G.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,G.jsx)("button",{onClick:f,style:{flex:1,padding:"9px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:"12px",fontWeight:600,cursor:"pointer"},children:"\u2190 Edit"}),(0,G.jsx)("button",{onClick:m,style:{flex:2,padding:"9px",borderRadius:"8px",border:"none",background:"#f59e0b",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer"},children:"\u2B07\uFE0F Generate & Download ZIP"})]})]}),n==="generating"&&(0,G.jsxs)("div",{style:{padding:"2rem 16px",textAlign:"center"},children:[(0,G.jsx)("p",{style:{fontSize:"2rem",marginBottom:"1rem"},children:"\u26A1"}),(0,G.jsx)("p",{style:{fontSize:"13px",fontWeight:700,color:"#0f172a",marginBottom:"0.5rem"},children:"Generating your project..."}),(0,G.jsx)("p",{style:{fontSize:"11px",color:"#64748b",marginBottom:"1.5rem"},children:l<30?"Parsing requirement...":l<55?"Loading templates...":l<70?"Generating pages...":l<85?"Building components...":l<95?"Creating styles...":"Packaging ZIP..."}),(0,G.jsx)("div",{style:{height:"8px",background:"#e2e8f0",borderRadius:"99px",overflow:"hidden"},children:(0,G.jsx)("div",{style:{height:"100%",width:`${l}%`,background:"#f59e0b",borderRadius:"99px",transition:"width 0.3s ease"}})}),(0,G.jsxs)("p",{style:{marginTop:"0.5rem",fontSize:"10px",color:"#94a3b8"},children:[l,"%"]})]}),n==="done"&&i&&(0,G.jsxs)("div",{style:{padding:"2rem 16px",textAlign:"center"},children:[(0,G.jsx)("p",{style:{fontSize:"3rem",marginBottom:"0.75rem"},children:"\u2705"}),(0,G.jsxs)("p",{style:{fontSize:"14px",fontWeight:700,color:"#0f172a",marginBottom:"0.5rem"},children:[i.siteName," downloaded!"]}),(0,G.jsx)("p",{style:{fontSize:"11px",color:"#64748b",marginBottom:"1.5rem",lineHeight:1.6},children:"Your ZIP is downloading. Unzip it and run:"}),["npm install","npm run dev"].map(u=>(0,G.jsx)("div",{style:{background:"#0f172a",borderRadius:"8px",padding:"8px 12px",marginBottom:"6px",textAlign:"left"},children:(0,G.jsxs)("code",{style:{fontSize:"12px",color:"#a7f3d0",fontFamily:"monospace"},children:["$ ",u]})},u)),(0,G.jsx)("p",{style:{fontSize:"11px",color:"#10b981",margin:"1rem 0",fontWeight:600},children:"Then open http://localhost:3000 \u{1F680}"}),(0,G.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,G.jsx)("button",{onClick:f,style:{flex:1,padding:"9px",borderRadius:"8px",border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:"12px",fontWeight:600,cursor:"pointer"},children:"New Project"}),(0,G.jsx)("button",{onClick:m,style:{flex:1,padding:"9px",borderRadius:"8px",border:"none",background:"#f59e0b",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer"},children:"\u2B07\uFE0F Download Again"})]})]})]})}var _=require("react/jsx-runtime");async function ja(){try{if(typeof window>"u")return!1;let e=window;if(e.LanguageModel)try{if(typeof e.LanguageModel.availability=="function"){let n=await e.LanguageModel.availability();if(n==="readily"||n==="available"||n==="downloadable")return!0}else return!0}catch{}if(e.Summarizer)try{let n=await e.Summarizer.availability?.();if(!n||n==="readily"||n==="available")return!0}catch{}if(e.Rewriter)try{let n=await e.Rewriter.availability?.();if(!n||n==="readily"||n==="available")return!0}catch{}if(e.Writer)try{let n=await e.Writer.availability?.();if(!n||n==="readily"||n==="available")return!0}catch{}let t=e.ai||globalThis.ai;if(t){if(t.languageModel?.availability)try{let n=await t.languageModel.availability();if(n==="readily"||n==="available")return!0}catch{}if(t.languageModel&&typeof t.languageModel.create=="function"||t.summarizer||t.rewriter||t.writer||t.languageModel)return!0}return!!(e.Translator||e.translation?.canTranslate)}catch{return!1}}function on({position:e="left",children:t,config:n={},showRag:o=!1,showAgent:r=!1}){let[s,i]=(0,Z.useState)(!1),[a,l]=(0,Z.useState)(Bn),[c,d]=(0,Z.useState)(null),[g,p]=(0,Z.useState)(!1),[m,f]=(0,Z.useState)(!1),[b,u]=(0,Z.useState)(!1),y=Z.default.useRef(null),[k,h]=(0,Z.useState)(!1),[S,w]=(0,Z.useState)(""),[R,E]=(0,Z.useState)(""),[P,H]=(0,Z.useState)(!1),[O,M]=(0,Z.useState)(null),[$,x]=(0,Z.useState)("idle"),[Y,j]=(0,Z.useState)(!1),[ee,ae]=(0,Z.useState)(""),[he,B]=(0,Z.useState)(""),[U,I]=(0,Z.useState)(!1),[z,ne]=(0,Z.useState)([]),[q,ue]=(0,Z.useState)(null),xe=24,Ie=84,qe=o?144:84,br=204,[Re,ct]=(0,Z.useState)(!1);(0,Z.useEffect)(()=>{if(typeof window>"u")return;let N=window;!!(N.LanguageModel||N.ai?.languageModel)&&m?(M("gemini"),ue("gemini")):It()&&(M("transformers"),ue("transformers"))},[m]),(0,Z.useEffect)(()=>{if(O!=="transformers")return;let N=setInterval(()=>x(Rt()),500);return()=>clearInterval(N)},[O]);let Tt=(0,Z.useCallback)(async()=>{if(!(!S.trim()||P)){if(!O){E("\u26A0\uFE0F No AI engine available.");return}H(!0),E("");try{let N;if(O==="gemini"){let{askPage:se}=await Promise.resolve().then(()=>(zn(),Jr));N=await se(S)}else{x("loading");let{askPageWithTransformers:se}=await Promise.resolve().then(()=>(Et(),Wn));N=await se(S),x("ready")}E(N.success&&N.answer?N.answer.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/#+\s/g,"").trim():"\u26A0\uFE0F "+(N.error||"No answer found."))}catch{E("\u26A0\uFE0F Something went wrong.")}H(!1)}},[S,P,O]),jt=(0,Z.useCallback)(async()=>{if(!ee.trim()||U)return;if(!q){B("\u26A0\uFE0F No AI engine available.");return}I(!0),ne([]),B("");let{runAgent:N}=await Promise.resolve().then(()=>(zi(),Gi));await N(ee,q,se=>{ne(De=>[...De,se.text])}),I(!1),B("done")},[ee,U,q]);(0,Z.useEffect)(()=>{if(typeof window>"u")return;let se=setTimeout(async()=>{let De=window,kn=await ja();f(kn),u(!!(De.SpeechRecognition||De.webkitSpeechRecognition))},800);return()=>clearTimeout(se)},[]),(0,Z.useEffect)(()=>{if(!(typeof window>"u"))try{let N=localStorage.getItem("yuktai-a11y-prefs");N&&l(se=>({...se,...JSON.parse(N)}))}catch{}},[]);let Qe=(0,Z.useCallback)(async N=>{let se={enabled:!0,highContrast:N.highContrast,darkMode:N.darkMode,reduceMotion:N.reduceMotion,largeTargets:N.largeTargets,speechEnabled:N.speechEnabled,autoFix:N.autoFix,dyslexiaFont:N.dyslexiaFont,localFont:N.localFont,fontSizeMultiplier:N.fontScale/100,colorBlindMode:N.colorBlindMode,showAuditBadge:N.showAuditBadge,showSkipLinks:!0,showPreferencePanel:!1,plainEnglish:N.plainEnglish,summarisePage:N.summarisePage,translateLanguage:N.translateLanguage,voiceControl:N.voiceControl,smartLabels:N.smartLabels,...n};await ke.execute(se),d(ke.applyFixes(se)),p(!0)},[n]),Ce=(0,Z.useCallback)(async()=>{try{localStorage.setItem("yuktai-a11y-prefs",JSON.stringify(a))}catch{}await Qe(a),i(!1)},[a,Qe]),je=(0,Z.useCallback)(()=>{l(Bn);try{localStorage.removeItem("yuktai-a11y-prefs")}catch{}let N=document.documentElement;["data-yuktai-high-contrast","data-yuktai-dark","data-yuktai-reduce-motion","data-yuktai-large-targets","data-yuktai-keyboard","data-yuktai-dyslexia"].forEach(se=>N.removeAttribute(se)),document.body.style.filter="",document.body.style.fontFamily="",document.documentElement.style.fontSize="",d(null),p(!1)},[]),At=(0,Z.useCallback)((N,se)=>{l(De=>({...De,[N]:se}))},[]);(0,Z.useEffect)(()=>{let N=se=>{se.key==="Escape"&&(s&&i(!1),k&&h(!1),Y&&j(!1),Re&&ct(!1))};return window.addEventListener("keydown",N),()=>window.removeEventListener("keydown",N)},[s,k,Y]),(0,Z.useEffect)(()=>{s&&y.current&&ke.trapFocus(y.current)},[s]);let rt=(N,se,De)=>({position:"fixed",bottom:`${N}px`,[e]:"24px",zIndex:9998,width:"52px",height:"52px",borderRadius:"50%",background:se,color:"#fff",border:"none",cursor:"pointer",fontSize:"22px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.25)",transition:"transform 0.15s, background 0.2s"}),dt=N=>{N.currentTarget.style.transform="scale(1.08)"},Xe=N=>{N.currentTarget.style.transform="scale(1)"},ut=O==="gemini"?"Gemini Nano \xB7 On device":O==="transformers"?"Transformers.js \xB7 All devices":"Detecting...",Ut=O==="transformers"&&$==="loading"?"Loading model...":"...";return(0,_.jsxs)(_.Fragment,{children:[t,r&&(0,_.jsx)("button",{style:rt(204,Re?"#d97706":"#f59e0b",Re),"aria-label":"Open Vibe Coder",title:"\u26A1 Vibe Coder \u2014 Generate Next.js project",onClick:()=>{ct(N=>!N),j(!1),h(!1),i(!1)},onMouseEnter:dt,onMouseLeave:Xe,children:"\u26A1"}),r&&Re&&(0,_.jsx)(qn,{position:e,onClose:()=>ct(!1)}),r&&(0,_.jsx)("button",{style:rt(qe,Y?"#059669":"#10b981",Y),"aria-label":"Open AI agent","aria-haspopup":"dialog","aria-expanded":Y,title:"\u{1F916} AI Agent \u2014 guide me through this page",onClick:()=>{j(N=>!N),h(!1),i(!1)},onMouseEnter:dt,onMouseLeave:Xe,children:"\u{1F916}"}),r&&Y&&(0,_.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"yuktai AI Agent","data-yuktai-panel":"true",style:{position:"fixed",bottom:`${qe+64}px`,[e]:"24px",zIndex:9999,width:"300px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",fontFamily:"system-ui,-apple-system,sans-serif",padding:"14px",maxHeight:"70vh",overflowY:"auto"},children:[(0,_.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"},children:[(0,_.jsxs)("div",{children:[(0,_.jsx)("p",{style:{margin:"0 0 2px",fontSize:"13px",fontWeight:600,color:"#0f172a"},children:"\u{1F916} AI Agent"}),(0,_.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#10b981"},children:q==="gemini"?"Gemini Nano \xB7 On device":q==="transformers"?"Transformers.js \xB7 All devices":"Detecting..."})]}),(0,_.jsx)("button",{onClick:()=>j(!1),"aria-label":"Close agent panel",style:{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:"18px",lineHeight:1,padding:"2px"},children:"\xD7"})]}),(0,_.jsx)("p",{style:{margin:"0 0 8px",fontSize:"11px",color:"#64748b"},children:"Tell me what you want to do on this page. I will guide you step by step."}),(0,_.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"8px"},children:["Fill this form","Find contact info","What is this page?","Guide me to apply"].map(N=>(0,_.jsx)("button",{onClick:()=>ae(N),style:{padding:"3px 8px",borderRadius:"20px",fontSize:"10px",border:"1px solid #e2e8f0",background:"#f8fafc",color:"#64748b",cursor:"pointer"},children:N},N))}),(0,_.jsxs)("div",{style:{display:"flex",gap:"6px",marginBottom:"8px"},children:[(0,_.jsx)("input",{type:"text",value:ee,onChange:N=>ae(N.target.value),onKeyDown:N=>{N.key==="Enter"&&jt()},placeholder:"e.g. Help me fill this form",disabled:U||!q,"aria-label":"Tell the agent what to do",style:{flex:1,padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",background:q?"#fff":"#f8fafc",outline:"none",height:"36px"}}),(0,_.jsx)("button",{onClick:jt,disabled:U||!ee.trim()||!q,"aria-label":"Run agent",style:{padding:"8px 12px",borderRadius:"8px",border:"none",background:q&&ee.trim()&&!U?"#10b981":"#e2e8f0",color:q&&ee.trim()&&!U?"#fff":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:q&&ee.trim()&&!U?"pointer":"not-allowed",height:"36px",minWidth:"52px",transition:"background 0.2s"},children:U?"...":"Go"})]}),z.length>0&&(0,_.jsxs)("div",{style:{padding:"10px 12px",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"8px",fontSize:"11px",color:"#166534",lineHeight:1.7},children:[z.map((N,se)=>(0,_.jsx)("p",{style:{margin:"0 0 2px"},children:N},se)),he==="done"&&(0,_.jsx)("button",{onClick:()=>{ne([]),ae(""),B("")},style:{display:"block",marginTop:"6px",background:"none",border:"none",color:"#94a3b8",fontSize:"10px",cursor:"pointer",padding:0},children:"Clear"})]}),!q&&(0,_.jsx)("p",{style:{margin:"4px 0 0",fontSize:"10px",color:"#94a3b8"},children:"Enable Gemini Nano via chrome://flags for best results."})]}),o&&(0,_.jsx)("button",{style:rt(Ie,k?"#7c3aed":"#6d28d9",k),"aria-label":"Ask a question about this page","aria-haspopup":"dialog","aria-expanded":k,title:`\u{1F4AC} Ask this page \xB7 ${ut}`,onClick:()=>{h(N=>!N),i(!1),j(!1)},onMouseEnter:dt,onMouseLeave:Xe,children:"\u{1F4AC}"}),o&&k&&(0,_.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Ask this page","data-yuktai-panel":"true",style:{position:"fixed",bottom:`${Ie+64}px`,[e]:"24px",zIndex:9999,width:"300px",maxWidth:"calc(100vw - 48px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",fontFamily:"system-ui,-apple-system,sans-serif",padding:"14px"},children:[(0,_.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"},children:[(0,_.jsxs)("div",{children:[(0,_.jsx)("p",{style:{margin:"0 0 2px",fontSize:"13px",fontWeight:600,color:"#0f172a"},children:"\u{1F4AC} Ask this page"}),(0,_.jsx)("p",{style:{margin:0,fontSize:"10px",color:"#7c3aed"},children:ut}),O==="transformers"&&$==="loading"&&(0,_.jsx)("p",{style:{margin:"2px 0 0",fontSize:"9px",color:"#94a3b8"},children:"Downloading model \u2014 first time only"}),O==="transformers"&&$==="ready"&&(0,_.jsx)("p",{style:{margin:"2px 0 0",fontSize:"9px",color:"#10b981"},children:"Model ready \u2705 \u2014 works offline"})]}),(0,_.jsx)("button",{onClick:()=>h(!1),"aria-label":"Close ask panel",style:{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:"18px",lineHeight:1,padding:"2px"},children:"\xD7"})]}),(0,_.jsxs)("div",{style:{display:"flex",gap:"6px",marginBottom:"8px"},children:[(0,_.jsx)("input",{type:"text",value:S,onChange:N=>w(N.target.value),onKeyDown:N=>{N.key==="Enter"&&Tt()},placeholder:"e.g. What does this page do?",disabled:P||!O,"aria-label":"Ask a question about this page",style:{flex:1,padding:"8px 10px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px",color:"#0f172a",background:O?"#fff":"#f8fafc",outline:"none",height:"36px"}}),(0,_.jsx)("button",{onClick:Tt,disabled:P||!S.trim()||!O,"aria-label":"Submit question",style:{padding:"8px 12px",borderRadius:"8px",border:"none",background:O&&S.trim()&&!P?"#7c3aed":"#e2e8f0",color:O&&S.trim()&&!P?"#fff":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:O&&S.trim()&&!P?"pointer":"not-allowed",height:"36px",minWidth:"48px",transition:"background 0.2s"},children:P?Ut:"Ask"})]}),R&&(0,_.jsxs)("div",{style:{padding:"10px",background:"#f5f3ff",borderRadius:"8px",fontSize:"12px",color:"#4c1d95",lineHeight:1.6,maxHeight:"180px",overflowY:"auto"},children:[(0,_.jsx)("strong",{style:{display:"block",marginBottom:"4px",fontSize:"11px",color:"#7c3aed"},children:"\u{1F4AC} Answer"}),R,(0,_.jsx)("button",{onClick:()=>{E(""),w("")},style:{display:"block",marginTop:"6px",background:"none",border:"none",color:"#94a3b8",fontSize:"10px",cursor:"pointer",padding:0},children:"Clear"})]}),!O&&(0,_.jsx)("p",{style:{margin:"4px 0 0",fontSize:"10px",color:"#94a3b8"},children:"Detecting AI engine..."})]}),(0,_.jsx)("button",{style:rt(xe,g?"#0d9488":"#1a73e8",s),"aria-label":"Open accessibility preferences","aria-haspopup":"dialog","aria-expanded":s,"data-yuktai-pref-toggle":"true",title:"\u267F Accessibility settings",onClick:()=>{i(N=>!N),h(!1),j(!1)},onMouseEnter:dt,onMouseLeave:Xe,children:"\u267F"}),s&&(0,_.jsx)(Hn,{ref:y,position:e,settings:a,report:c,isActive:g,aiSupported:m,voiceSupported:b,set:At,onApply:Ce,onReset:je,onClose:()=>i(!1)})]})}A();var Lt={name:"ai.text",async execute(e){return`\u{1F916} YuktAI says: ${e}`}};A();var Nt={name:"voice.text",async execute(e){return!e||e.trim()===""?"\u{1F3A4} No speech detected":`\u{1F3A4} You said: ${e}`}};A();var Ze=class{plugins=new Map;register(t,n){if(!n||typeof n.execute!="function")throw new Error(`Invalid plugin: ${t}`);this.plugins.set(t,n)}use(t){return this.plugins.get(t)}async run(t,n){try{let o=this.use(t);if(!o)throw new Error(`Plugin not found: ${t}`);return await o.execute(n)}catch(o){throw console.error(`[YuktAI Runtime Error in ${t}]:`,o),o}}getPlugins(){return Array.from(this.plugins.keys())}};A();var ce=require("react");A();var le=require("react"),L=require("react/jsx-runtime"),Oi={"en-US":{title:"Grid AI Assistant",subtitle:"Ask about your data",ask:"Ask",placeholder:"Ask or type a command...",listening:"Listening...",send:"Send",close:"Close",open:"Open AI assistant",inputLanguage:"Input language",speakNow:"Speak your question",working:"Working on it\u2026",english:"English",telugu:"\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",searchStarted:e=>`Searching for "${e}".`,sortedAscending:e=>`Sorted by ${e} in ascending order.`,sortedDescending:e=>`Sorted by ${e} in descending order.`,count:e=>`There are ${e} rows in the grid.`,highest:(e,t,n)=>`The highest ${e} is ${t}, held by ${n}.`,lowest:(e,t,n)=>`The lowest ${e} is ${t}, held by ${n}.`,average:(e,t)=>`The average ${e} is ${t}.`,total:(e,t)=>`The total ${e} is ${t}.`,noData:"There is no data to analyze.",noColumn:"I could not find a column to analyze.",noNumericData:e=>`There is no numeric data in ${e}.`,notFound:e=>`I could not find anything matching "${e}".`,needName:"Please provide a value to look up.",fallback:"I can search, sort, count, and analyze the grid data.",unsupportedVoice:"Voice input is not supported in this browser."},"te-IN":{title:"\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D AI \u0C38\u0C39\u0C3E\u0C2F\u0C15\u0C41\u0C21\u0C41",subtitle:"\u0C2E\u0C40 \u0C21\u0C47\u0C1F\u0C3E \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F",ask:"\u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F",placeholder:"\u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 \u0C32\u0C47\u0C26\u0C3E \u0C06\u0C26\u0C47\u0C36\u0C02 \u0C1F\u0C48\u0C2A\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F...",listening:"\u0C35\u0C3F\u0C02\u0C1F\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41...",send:"\u0C2A\u0C02\u0C2A\u0C02\u0C21\u0C3F",close:"\u0C2E\u0C42\u0C38\u0C3F\u0C35\u0C47\u0C2F\u0C02\u0C21\u0C3F",open:"AI \u0C38\u0C39\u0C3E\u0C2F\u0C15\u0C41\u0C21\u0C3F\u0C28\u0C3F \u0C24\u0C46\u0C30\u0C35\u0C02\u0C21\u0C3F",inputLanguage:"\u0C07\u0C28\u0C4D\u200C\u0C2A\u0C41\u0C1F\u0C4D \u0C2D\u0C3E\u0C37",speakNow:"\u0C2E\u0C40 \u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C02\u0C21\u0C3F",working:"\u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41\u2026",english:"English",telugu:"\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",searchStarted:e=>`\u201C${e}\u201D \u0C15\u0C4B\u0C38\u0C02 \u0C36\u0C4B\u0C27\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.`,sortedAscending:e=>`${e}\u0C28\u0C41 \u0C06\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C3E\u0C28\u0C41.`,sortedDescending:e=>`${e}\u0C28\u0C41 \u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C3E\u0C28\u0C41.`,count:e=>`\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 ${e} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F.`,highest:(e,t,n)=>`\u0C05\u0C24\u0C4D\u0C2F\u0C27\u0C3F\u0C15 ${e} \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}. \u0C07\u0C26\u0C3F ${n}\u0C15\u0C41 \u0C38\u0C02\u0C2C\u0C02\u0C27\u0C3F\u0C02\u0C1A\u0C3F\u0C28\u0C26\u0C3F.`,lowest:(e,t,n)=>`\u0C05\u0C24\u0C4D\u0C2F\u0C32\u0C4D\u0C2A ${e} \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}. \u0C07\u0C26\u0C3F ${n}\u0C15\u0C41 \u0C38\u0C02\u0C2C\u0C02\u0C27\u0C3F\u0C02\u0C1A\u0C3F\u0C28\u0C26\u0C3F.`,average:(e,t)=>`${e} \u0C38\u0C17\u0C1F\u0C41 \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}.`,total:(e,t)=>`${e} \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 \u0C35\u0C3F\u0C32\u0C41\u0C35 ${t}.`,noData:"\u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C21\u0C47\u0C1F\u0C3E \u0C32\u0C47\u0C26\u0C41.",noColumn:"\u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C24\u0C17\u0C3F\u0C28 \u0C15\u0C3E\u0C32\u0C2E\u0C4D \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.",noNumericData:e=>`${e}\u0C32\u0C4B \u0C38\u0C02\u0C16\u0C4D\u0C2F\u0C3E \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02 \u0C32\u0C47\u0C26\u0C41.`,notFound:e=>`\u201C${e}\u201D\u0C15\u0C41 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C32\u0C47 \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02 \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.`,needName:"\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C12\u0C15 \u0C35\u0C3F\u0C32\u0C41\u0C35 \u0C07\u0C35\u0C4D\u0C35\u0C02\u0C21\u0C3F.",fallback:"\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C36\u0C4B\u0C27\u0C28, \u0C15\u0C4D\u0C30\u0C2E\u0C2C\u0C26\u0C4D\u0C27\u0C40\u0C15\u0C30\u0C23, \u0C32\u0C46\u0C15\u0C4D\u0C15\u0C3F\u0C02\u0C2A\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C21\u0C47\u0C1F\u0C3E \u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C23 \u0C1A\u0C47\u0C2F\u0C17\u0C32\u0C28\u0C41.",unsupportedVoice:"\u0C08 \u0C2C\u0C4D\u0C30\u0C4C\u0C1C\u0C30\u0C4D\u200C\u0C32\u0C4B \u0C35\u0C3E\u0C2F\u0C3F\u0C38\u0C4D \u0C07\u0C28\u0C4D\u200C\u0C2A\u0C41\u0C1F\u0C4D\u200C\u0C15\u0C41 \u0C2E\u0C26\u0C4D\u0C26\u0C24\u0C41 \u0C32\u0C47\u0C26\u0C41."}};function Ge(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function Ua(e,t){let n=Ge(e);if(t==="te-IN")return/^(శోధించు|శోధించండి|వెతుకు|వెతకండి|చూపించు|చూపించండి|ఫిల్టర్)/.test(n)?{type:"search",payload:n.replace(/^(శోధించు|శోధించండి|వెతుకు|వెతకండి|చూపించు|చూపించండి|ఫిల్టర్)\s*/u,"").trim()||e}:/క్రమబద్ధీకర|అమర్చ|సార్ట్/.test(n)?{type:"sort",payload:{key:void 0,dir:/అవరోహణ|పెద్ద|అధిక|చివర/.test(n)?"desc":"asc"}}:/ఎన్ని|ఎంతమంది|లెక్క|మొత్తం వరుస|వరుసలు/.test(n)?{type:"question",payload:e}:/అత్యధిక|గరిష్ఠ|పెద్ద|ఎక్కువ/.test(n)?{type:"question",payload:e}:/అత్యల్ప|కనిష్ఠ|చిన్న|తక్కువ/.test(n)?{type:"question",payload:e}:/సగటు|సగటు విలువ/.test(n)?{type:"question",payload:e}:/మొత్తం|కలిపి/.test(n)?{type:"question",payload:e}:{type:"search",payload:e};if(/^(search|find|show|filter)/.test(n))return{type:"search",payload:n.replace(/^(search|find|show|filter)\s+(for\s+|by\s+)?/,"").trim()||e};if(/sort/.test(n)){let o=/desc|descending|high|higher|large|largest|top/.test(n);return{type:"sort",payload:{key:n.match(/(?:by|on)\s+([a-z0-9_-]+)/)?.[1],dir:o?"desc":"asc"}}}return/how many|count|highest|maximum|max|top|largest|lowest|minimum|min|smallest|bottom|average|avg|mean|sum|total|who|which|where|whose/.test(n)?{type:"question",payload:e}:{type:"search",payload:e}}function Di(e,t){let n=Ge(e);return t.find(o=>{let r=Ge(o.key),s=Ge(o.label);return n.includes(r)||n.includes(s)})}function rn(e,t){return e.toLocaleString(t==="te-IN"?"te-IN":"en-IN")}function Va(e,t,n,o){let r=Oi[o];if(t.length===0)return r.noData;let s=Ge(e),i=n.filter(k=>k.type==="number"),a=Di(e,n),l=a?.type==="number"?a:i[0],c=/how many|count|rows|ఎన్ని|ఎంతమంది|లెక్క|వరుసలు/.test(s);if(c)return r.count(t.length);if(/highest|maximum|max|top|largest|అత్యధిక|గరిష్ఠ|పెద్ద|ఎక్కువ/.test(s)){let k=a??l;if(!k)return r.noColumn;let h=t.map(E=>({row:E,value:Number(E[k.key])})).filter(E=>!Number.isNaN(E.value)).sort((E,P)=>P.value-E.value);if(h.length===0)return r.noNumericData(k.label);let S=h[0],w=n.find(E=>E.key==="name"||Ge(E.label)==="name"),R=w?String(S.row[w.key]??""):o==="te-IN"?"\u0C08 \u0C35\u0C30\u0C41\u0C38":"this row";return r.highest(k.label,rn(S.value,o),R)}if(/lowest|minimum|min|smallest|bottom|అత్యల్ప|కనిష్ఠ|చిన్న|తక్కువ/.test(s)){let k=a??l;if(!k)return r.noColumn;let h=t.map(E=>({row:E,value:Number(E[k.key])})).filter(E=>!Number.isNaN(E.value)).sort((E,P)=>E.value-P.value);if(h.length===0)return r.noNumericData(k.label);let S=h[0],w=n.find(E=>E.key==="name"||Ge(E.label)==="name"),R=w?String(S.row[w.key]??""):o==="te-IN"?"\u0C08 \u0C35\u0C30\u0C41\u0C38":"this row";return r.lowest(k.label,rn(S.value,o),R)}if(/average|avg|mean|సగటు/.test(s)){let k=a??l;if(!k)return r.noColumn;let h=t.map(w=>Number(w[k.key])).filter(w=>!Number.isNaN(w));if(h.length===0)return r.noNumericData(k.label);let S=h.reduce((w,R)=>w+R,0)/h.length;return r.average(k.label,rn(Math.round(S*100)/100,o))}if(/sum|total|మొత్తం|కలిపి/.test(s)&&!c){let k=a??l;if(!k)return r.noColumn;let h=t.map(w=>Number(w[k.key])).filter(w=>!Number.isNaN(w));if(h.length===0)return r.noNumericData(k.label);let S=h.reduce((w,R)=>w+R,0);return r.total(k.label,rn(S,o))}let f=s.match(/[\p{L}\p{N}_-]+/gu)??[],b=new Set(["who","what","which","where","whose","is","the","has","have","show","find","search","for","by","about"]),y=f.filter(k=>!b.has(k)).join(" ").trim();if(y){let k=t.find(h=>Object.values(h).some(S=>String(S??"").toLowerCase().includes(y.toLowerCase())));return k?n.map(h=>`${h.label}: ${String(k[h.key]??"")}`).join(o==="te-IN"?" \xB7 ":", "):r.notFound(y)}return r.fallback}function Ya(e,t){if(typeof window>"u"||!window.speechSynthesis)return;window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.lang=t,n.rate=1,n.pitch=1,window.speechSynthesis.speak(n)}function Ka(e){let[t,n]=(0,le.useState)(!1),[o,r]=(0,le.useState)(""),[s,i]=(0,le.useState)(!0),a=(0,le.useRef)(null);(0,le.useEffect)(()=>{if(typeof window>"u")return;let d=window.SpeechRecognition||window.webkitSpeechRecognition;if(!d){i(!1),a.current=null;return}let g=new d;return g.continuous=!1,g.interimResults=!1,g.lang=e,g.onresult=p=>{let m=p?.results?.[0]?.[0]?.transcript??"";r(m),n(!1)},g.onerror=()=>{n(!1)},g.onend=()=>{n(!1)},a.current=g,()=>{try{g.stop()}catch{}a.current=null}},[e]);let l=(0,le.useCallback)(()=>{if(a.current){r(""),n(!0);try{a.current.start()}catch{n(!1)}}},[]),c=(0,le.useCallback)(()=>{try{a.current?.stop()}catch{}n(!1)},[]);return{listening:t,transcript:o,supported:s,start:l,stop:c}}function Qa(){return(0,L.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("circle",{cx:"11",cy:"11",r:"6.5"}),(0,L.jsx)("path",{d:"m16 16 5 5"})]})}function Xa(){return(0,L.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("rect",{x:"8",y:"3",width:"8",height:"12",rx:"4"}),(0,L.jsx)("path",{d:"M5 11a7 7 0 0 0 14 0"}),(0,L.jsx)("path",{d:"M12 18v3"}),(0,L.jsx)("path",{d:"M8 21h8"})]})}function Ja(){return(0,L.jsxs)("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("path",{d:"m4 4 16 8-16 8 4-8-4-8Z"}),(0,L.jsx)("path",{d:"M8 12h12"})]})}function Za(){return(0,L.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,L.jsx)("path",{d:"m6 6 12 12"}),(0,L.jsx)("path",{d:"m18 6-12 12"})]})}function el({data:e,columns:t,onSearch:n,onSort:o,theme:r="light",language:s="en-US",inputLanguage:i="en-US",embedded:a=!1,agent:l,onInputLanguageChange:c}){let d=Oi[s],[g,p]=(0,le.useState)(i);(0,le.useEffect)(()=>{p(i)},[i]);let[m,f]=(0,le.useState)(!1),b=r==="dark",[u,y]=(0,le.useState)(a),[k,h]=(0,le.useState)(""),[S,w]=(0,le.useState)([]),R=(0,le.useRef)(null),{listening:E,transcript:P,supported:H,start:O,stop:M}=Ka(g),$=(0,le.useMemo)(()=>({bg:b?"#0F172A":"#FFFFFF",surface:b?"#1E293B":"#F8FAFC",border:b?"#334155":"#E2E8F0",text:b?"#F1F5F9":"#0F172A",muted:b?"#94A3B8":"#64748B",accent:"#10B981",userMsg:b?"#334155":"#DBEAFE",aiMsg:b?"#1E293B":"#F0FDF4"}),[b]),x=(0,le.useMemo)(()=>({role:"ai",text:s==="te-IN"?"\u0C2E\u0C40 \u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D \u0C21\u0C47\u0C1F\u0C3E \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F.":"Ask me about your grid data.",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}),[s]);(0,le.useEffect)(()=>{w(B=>B.length>0?B:[x])},[x]),(0,le.useEffect)(()=>{R.current?.scrollIntoView({behavior:"smooth"})},[S]);let Y=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),j=(0,le.useCallback)(async B=>{let U=B.trim();if(!U)return;w(z=>[...z,{role:"user",text:U,time:Y()}]),h("");let I="";if(l){f(!0);try{I=(await l.ask(U)).message}catch{I=d.fallback}finally{f(!1)}}else{let z=Ua(U,s);if(z.type==="question")I=Va(z.payload??U,e,t,s);else if(z.type==="search"){let ne=String(z.payload??U);n?.(ne),I=d.searchStarted(ne)}else if(z.type==="sort"){let ne=z.payload?.key,q=ne?t.find(ue=>Ge(ue.key)===Ge(ne)||Ge(ue.label)===Ge(ne)):void 0;if(q||(q=Di(U,t)),q&&o){let ue=z.payload?.dir==="desc"?"desc":"asc";o(String(q.key),ue),I=ue==="asc"?d.sortedAscending(q.label):d.sortedDescending(q.label)}else I=d.noColumn}}I||(I=d.fallback),w(z=>[...z,{role:"ai",text:I,time:Y()}]),Ya(I,s)},[l,t,e,s,n,o,d]);(0,le.useEffect)(()=>{P&&j(P)},[P,j]);let ee=()=>{j(k)},ae=s==="te-IN"?["\u0C0E\u0C28\u0C4D\u0C28\u0C3F \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41","\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F","\u0C15\u0C4D\u0C30\u0C2E\u0C02"]:["how many rows","search","sort"],he=(0,L.jsxs)("div",{style:{width:a?"100%":360,maxWidth:a?"100%":"calc(100vw - 48px)",height:a?390:480,maxHeight:"70vh",background:$.bg,border:`1px solid ${$.border}`,borderRadius:a?12:16,boxShadow:a?"none":"0 20px 40px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[(0,L.jsxs)("div",{style:{padding:"12px 14px",background:$.accent,color:"#FFFFFF",display:"flex",alignItems:"center",gap:10},children:[(0,L.jsx)("div",{style:{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.18)",fontSize:17},children:"AI"}),(0,L.jsxs)("div",{style:{flex:1,minWidth:0},children:[(0,L.jsx)("div",{style:{fontWeight:700,fontSize:14},children:d.title}),(0,L.jsx)("div",{style:{fontSize:11,opacity:.9},children:d.subtitle})]}),!a&&(0,L.jsx)("button",{type:"button",onClick:()=>y(!1),"aria-label":d.close,title:d.close,style:{width:32,height:32,border:"none",borderRadius:8,background:"rgba(255,255,255,0.12)",color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:(0,L.jsx)(Za,{})})]}),(0,L.jsxs)("div",{style:{padding:"8px 10px",borderBottom:`1px solid ${$.border}`,display:"flex",alignItems:"center",gap:8,background:$.surface},children:[(0,L.jsx)("span",{style:{fontSize:11,color:$.muted},children:d.inputLanguage}),(0,L.jsxs)("select",{value:g,onChange:B=>{let U=B.target.value;p(U),c?.(U)},disabled:E,"aria-label":d.inputLanguage,style:{padding:"5px 8px",borderRadius:7,border:`1px solid ${$.border}`,background:$.bg,color:$.text,fontSize:11},children:[(0,L.jsx)("option",{value:"en-US",children:"English (US)"}),(0,L.jsx)("option",{value:"en-IN",children:"English (India)"}),(0,L.jsx)("option",{value:"as-IN",children:"Assamese"}),(0,L.jsx)("option",{value:"bn-IN",children:"Bengali"}),(0,L.jsx)("option",{value:"brx-IN",children:"Bodo"}),(0,L.jsx)("option",{value:"doi-IN",children:"Dogri"}),(0,L.jsx)("option",{value:"gu-IN",children:"Gujarati"}),(0,L.jsx)("option",{value:"hi-IN",children:"Hindi"}),(0,L.jsx)("option",{value:"kn-IN",children:"Kannada"}),(0,L.jsx)("option",{value:"ks-IN",children:"Kashmiri"}),(0,L.jsx)("option",{value:"kok-IN",children:"Konkani"}),(0,L.jsx)("option",{value:"mai-IN",children:"Maithili"}),(0,L.jsx)("option",{value:"ml-IN",children:"Malayalam"}),(0,L.jsx)("option",{value:"mni-IN",children:"Manipuri"}),(0,L.jsx)("option",{value:"mr-IN",children:"Marathi"}),(0,L.jsx)("option",{value:"ne-IN",children:"Nepali"}),(0,L.jsx)("option",{value:"or-IN",children:"Odia"}),(0,L.jsx)("option",{value:"pa-IN",children:"Punjabi"}),(0,L.jsx)("option",{value:"sa-IN",children:"Sanskrit"}),(0,L.jsx)("option",{value:"sat-IN",children:"Santali"}),(0,L.jsx)("option",{value:"sd-IN",children:"Sindhi"}),(0,L.jsx)("option",{value:"ta-IN",children:"Tamil"}),(0,L.jsx)("option",{value:"te-IN",children:"Telugu"}),(0,L.jsx)("option",{value:"ur-IN",children:"Urdu"})]})]}),(0,L.jsxs)("div",{style:{flex:1,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:8},children:[S.map((B,U)=>(0,L.jsxs)("div",{style:{alignSelf:B.role==="user"?"flex-end":"flex-start",maxWidth:"88%",padding:"8px 11px",borderRadius:11,background:B.role==="user"?$.userMsg:$.aiMsg,color:$.text,fontSize:13,lineHeight:1.5},children:[(0,L.jsx)("div",{children:B.text}),(0,L.jsx)("div",{style:{marginTop:3,fontSize:10,opacity:.55,textAlign:"right"},children:B.time})]},`${B.time}-${U}`)),E&&(0,L.jsx)("div",{style:{alignSelf:"flex-end",padding:"8px 11px",borderRadius:11,background:b?"#3F1D2E":"#FEE2E2",color:b?"#FCA5A5":"#991B1B",fontSize:13},children:d.listening}),(m||l?.loading)&&(0,L.jsx)("div",{role:"status","aria-live":"polite",style:{alignSelf:"flex-start",padding:"8px 11px",borderRadius:11,background:$.aiMsg,color:$.muted,fontSize:13},children:d.working}),(0,L.jsx)("div",{ref:R})]}),(0,L.jsx)("div",{style:{padding:"7px 10px",borderTop:`1px solid ${$.border}`,display:"flex",gap:6,overflowX:"auto",flexShrink:0},children:ae.map(B=>(0,L.jsx)("button",{type:"button",onClick:()=>j(B),style:{padding:"5px 9px",borderRadius:12,border:`1px solid ${$.border}`,background:$.surface,color:$.text,fontSize:10.5,cursor:"pointer",whiteSpace:"nowrap"},children:B},B))}),(0,L.jsxs)("div",{style:{padding:9,display:"flex",gap:6,borderTop:`1px solid ${$.border}`,background:$.surface},children:[(0,L.jsxs)("div",{style:{position:"relative",flex:1},children:[(0,L.jsx)(Qa,{}),(0,L.jsx)("input",{type:"text",value:k,onChange:B=>h(B.target.value),onKeyDown:B=>{B.key==="Enter"&&ee()},placeholder:d.placeholder,"aria-label":d.ask,style:{width:"100%",boxSizing:"border-box",padding:"9px 10px 9px 34px",borderRadius:8,border:`1px solid ${$.border}`,background:$.bg,color:$.text,fontSize:12,outline:"none"}})]}),H?(0,L.jsx)("button",{type:"button",onClick:E?M:O,"aria-label":E?d.listening:d.speakNow,title:E?d.listening:d.speakNow,style:{width:38,height:38,border:"none",borderRadius:8,background:E?"#EF4444":$.accent,color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0},children:(0,L.jsx)(Xa,{})}):null,(0,L.jsx)("button",{type:"button",onClick:ee,disabled:!k.trim(),"aria-label":d.send,title:d.send,style:{width:38,height:38,border:"none",borderRadius:8,background:k.trim()?$.accent:$.muted,color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:k.trim()?"pointer":"not-allowed",opacity:k.trim()?1:.6,flexShrink:0},children:(0,L.jsx)(Ja,{})})]})]});return a?(0,L.jsx)("div",{style:{width:"100%",minWidth:0},children:u?he:(0,L.jsxs)("button",{type:"button",onClick:()=>y(!0),"aria-label":d.open,style:{minHeight:40,padding:"8px 13px",borderRadius:9,border:"1px solid #10B981",background:b?"#064E3B":"#ECFDF5",color:b?"#A7F3D0":"#047857",display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,fontWeight:600},children:[(0,L.jsx)("span",{"aria-hidden":"true",children:"AI"}),d.ask]})}):(0,L.jsxs)(L.Fragment,{children:[!u&&(0,L.jsx)("button",{type:"button",onClick:()=>y(!0),"aria-label":d.open,title:d.title,style:{position:"fixed",bottom:24,right:24,zIndex:9998,width:56,height:56,borderRadius:28,background:$.accent,color:"#FFFFFF",border:"none",cursor:"pointer",boxShadow:"0 8px 20px rgba(16,185,129,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14},children:"AI"}),u&&(0,L.jsx)("div",{style:{position:"fixed",bottom:90,right:24,zIndex:9997},children:he}),(0,L.jsx)("style",{children:`
        @keyframes yuktai-ai-pulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.05);
          }
        }
      `})]})}var sn=el;A();var we=require("react");A();var tl={en:{found:e=>`${e} row(s) found.`,count:e=>`${e} row(s).`,columns:"Grid columns retrieved.",rowFound:"Row found.",notFound:e=>`Row "${e}" not found.`,noneFound:"None of the given rows were found.",highlighted:e=>`${e} row(s) highlighted.`,selected:e=>`Row "${e}" selected.`,opened:e=>`Row "${e}" opened.`,notSupported:e=>`This grid does not support "${e}".`,emptyQuery:"Please enter something to search.",noIds:"No row IDs were given.",unknownColumn:e=>`Unknown column "${e}".`,badOperator:e=>`Unknown filter operator "${e}".`,badValue:"The filter value is not valid for this column.",filtered:e=>`Filter applied: ${e} row(s) match.`,filtersCleared:"All filters cleared.",sorted:(e,t)=>`Sorted by ${e} (${t==="asc"?"ascending":"descending"}).`,sortCleared:"Sorting cleared.",internal:"Something went wrong while running this action."},te:{found:e=>`${e} \u0C35\u0C30\u0C41\u0C38(\u0C32\u0C41) \u0C26\u0C4A\u0C30\u0C3F\u0C15\u0C3E\u0C2F\u0C3F.`,count:e=>`\u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 ${e} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41.`,columns:"\u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C32 \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41.",rowFound:"\u0C35\u0C30\u0C41\u0C38 \u0C26\u0C4A\u0C30\u0C3F\u0C15\u0C3F\u0C02\u0C26\u0C3F.",notFound:e=>`"${e}" \u0C35\u0C30\u0C41\u0C38 \u0C26\u0C4A\u0C30\u0C15\u0C32\u0C47\u0C26\u0C41.`,noneFound:"\u0C07\u0C1A\u0C4D\u0C1A\u0C3F\u0C28 \u0C35\u0C30\u0C41\u0C38\u0C32\u0C47\u0C35\u0C40 \u0C26\u0C4A\u0C30\u0C15\u0C32\u0C47\u0C26\u0C41.",highlighted:e=>`${e} \u0C35\u0C30\u0C41\u0C38(\u0C32\u0C41) \u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D \u0C1A\u0C47\u0C36\u0C3E\u0C28\u0C41.`,selected:e=>`"${e}" \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.`,opened:e=>`"${e}" \u0C24\u0C46\u0C30\u0C3F\u0C1A\u0C3E\u0C28\u0C41.`,notSupported:e=>`\u0C08 \u0C2A\u0C1F\u0C4D\u0C1F\u0C3F\u0C15\u0C32\u0C4B "${e}" \u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C32\u0C47\u0C26\u0C41.`,emptyQuery:"\u0C35\u0C46\u0C24\u0C15\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C0F\u0C26\u0C48\u0C28\u0C3E \u0C30\u0C3E\u0C2F\u0C02\u0C21\u0C3F.",noIds:"\u0C35\u0C30\u0C41\u0C38 ID\u0C32\u0C41 \u0C07\u0C35\u0C4D\u0C35\u0C32\u0C47\u0C26\u0C41.",unknownColumn:e=>`"${e}" \u0C05\u0C28\u0C47 \u0C15\u0C3E\u0C32\u0C2E\u0C4D \u0C32\u0C47\u0C26\u0C41.`,badOperator:e=>`"${e}" \u0C05\u0C28\u0C47 \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C3F\u0C27\u0C3E\u0C28\u0C02 \u0C32\u0C47\u0C26\u0C41.`,badValue:"\u0C08 \u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C15\u0C3F \u0C08 \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C3F\u0C32\u0C41\u0C35 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C26\u0C41.",filtered:e=>`\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C47\u0C36\u0C3E\u0C28\u0C41: ${e} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C2F\u0C3E\u0C2F\u0C3F.`,filtersCleared:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C28\u0C4D\u0C28\u0C40 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C28\u0C41.",sorted:(e,t)=>`${e} \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02 (${t==="asc"?"\u0C06\u0C30\u0C4B\u0C39\u0C23":"\u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23"}).`,sortCleared:"\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C28\u0C41.",internal:"\u0C08 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C21\u0C17\u0C3E \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F."}};function Ne(e){return tl[e.locale??"en"]}function ze(e,t){return{success:!0,message:e,data:t}}function de(e,t){return{success:!1,message:t,error:{code:e}}}var Bi=["contains","equals","startsWith","endsWith","greaterThan","lessThan","between"];function be(e,t="id"){let n=e?.[t];return n==null?"":String(n)}function it(e){return String(e??"").normalize("NFC").toLowerCase().trim()}function Hi(e){if(typeof e=="number")return Number.isFinite(e)?e:null;let t=String(e??"").trim();if(t==="")return null;let n=Number(t);return Number.isFinite(n)?n:null}function _i(e){if(e instanceof Date)return e.getTime();let t=new Date(String(e??"")).getTime();return Number.isFinite(t)?t:null}function qi(e){return(Array.isArray(e)?e:typeof e=="string"?e.split(","):[]).map(n=>String(n).trim()).filter(Boolean)}function jn(e,t){let n=it(t);return e.columns.find(o=>it(o.key)===n||it(o.label)===n)}function an(e,t){return e.data.find(n=>be(n,e.rowKey)===t)}function nl(e,t){return e[t]}function ol(e,t,n){let o=nl(e,n.key),r=n.type??"text";if(r==="number"||r==="date"){let a=r==="number"?Hi:_i,l=a(o);if(l===null)return!1;if(t.operator==="between"){let[d,g]=t.value,p=a(d),m=a(g);return p!==null&&m!==null&&l>=Math.min(p,m)&&l<=Math.max(p,m)}let c=a(t.value);if(c===null)return!1;switch(t.operator){case"equals":return l===c;case"greaterThan":return l>c;case"lessThan":return l<c;default:break}}let s=it(o),i=it(t.value);switch(t.operator){case"equals":return s===i;case"startsWith":return s.startsWith(i);case"endsWith":return s.endsWith(i);case"contains":return s.includes(i);default:return!1}}function rl(e,t){let n=t.type??"text",o=n==="date"?_i:Hi;return e.operator==="between"?n==="text"||!Array.isArray(e.value)||e.value.length!==2?!1:o(e.value[0])!==null&&o(e.value[1])!==null:e.operator==="greaterThan"||e.operator==="lessThan"?n!=="text"&&o(e.value)!==null:!Array.isArray(e.value)&&String(e.value).trim()!==""}function Ve(e,t,n){return n.length?ji({data:e,columns:t},n):e}function et(e){return e.map(t=>({key:String(t.key),label:t.label,type:t.type==="number"?"number":t.type==="date"?"date":"text"}))}function ji(e,t){return e.data.filter(n=>t.every(o=>{let r=jn(e,o.key);return r?ol(n,o,r):!0}))}function Un(e,t){let n=Ne(e),o=it(t);if(!o)return de("INVALID_INPUT",n.emptyQuery);let r=e.data.filter(i=>e.columns.some(a=>it(i[a.key]).includes(o))),s=r.map(i=>be(i,e.rowKey)).filter(Boolean);return e.onHighlightRows?.(s),ze(n.found(r.length),r)}function Vn(e){return ze(Ne(e).count(e.data.length),e.data.length)}function Yn(e){return ze(Ne(e).columns,e.columns)}function Kn(e,t){let n=Ne(e),o=String(t??"").trim();if(!o)return de("INVALID_INPUT",n.noIds);let r=an(e,o);return r?ze(n.rowFound,r):de("NOT_FOUND",n.notFound(o))}function xt(e,t){let n=Ne(e),o=qi(t);if(o.length===0)return de("INVALID_INPUT",n.noIds);if(!e.onHighlightRows)return de("NOT_SUPPORTED",n.notSupported("highlight"));let r=o.filter(s=>an(e,s)!==void 0);return r.length===0?de("NOT_FOUND",n.noneFound):(e.onHighlightRows(r),ze(n.highlighted(r.length),r))}function Mt(e,t){let n=Ne(e),o=String(t??"").trim();return o?e.onSelectRow?an(e,o)?(e.onSelectRow(o),ze(n.selected(o),o)):de("NOT_FOUND",n.notFound(o)):de("NOT_SUPPORTED",n.notSupported("select")):de("INVALID_INPUT",n.noIds)}function Pt(e,t){let n=Ne(e),o=String(t??"").trim();return o?e.onOpenRow?an(e,o)?(e.onOpenRow(o),ze(n.opened(o),o)):de("NOT_FOUND",n.notFound(o)):de("NOT_SUPPORTED",n.notSupported("open")):de("INVALID_INPUT",n.noIds)}function Qn(e,t){let n=Ne(e),o=jn(e,t?.key??"");if(!o)return de("INVALID_INPUT",n.unknownColumn(String(t?.key??"")));if(!Bi.includes(t.operator))return de("INVALID_INPUT",n.badOperator(String(t.operator)));let r={...t,key:o.key};if(!rl(r,o))return de("INVALID_INPUT",n.badValue);if(!e.onFiltersChange)return de("NOT_SUPPORTED",n.notSupported("filter"));let s=[...(e.filters??[]).filter(a=>a.key!==o.key),r],i=ji(e,s).length;return e.onFiltersChange(s),ze(n.filtered(i),{filters:s,count:i})}function Xn(e){let t=Ne(e);return e.onFiltersChange?(e.onFiltersChange([]),ze(t.filtersCleared,[])):de("NOT_SUPPORTED",t.notSupported("clear filters"))}function Jn(e,t,n="asc"){let o=Ne(e),r=jn(e,t);if(!r)return de("INVALID_INPUT",o.unknownColumn(String(t)));if(n!=="asc"&&n!=="desc")return de("INVALID_INPUT",o.badValue);if(!e.onSortChange)return de("NOT_SUPPORTED",o.notSupported("sort"));let s={key:r.key,direction:n};return e.onSortChange(s),ze(o.sorted(r.label,n),s)}function Zn(e){let t=Ne(e);return e.onSortChange?(e.onSortChange(null),ze(t.sortCleared,null)):de("NOT_SUPPORTED",t.notSupported("clear sort"))}var il={search:"Search all columns for text. Matching rows are highlighted.",count:"Count the rows currently in the grid.",columns:"List the grid's columns with their keys, labels and types.",get_row:"Get one row by its ID.",highlight:"Highlight one or more rows by ID without filtering the grid.",select:"Select one row by ID.",open:"Open one row by ID to show its full details.",filter:"Filter the grid by one column. Replaces any existing filter on that column.",clear_filters:"Remove all filters.",sort:"Sort the grid by one column, ascending or descending.",clear_sort:"Remove sorting."},Wi={en:{search:"Search",count:"Count",columns:"Columns",get_row:"Get row",highlight:"Highlight",select:"Select",open:"Open",filter:"Filter",clear_filters:"Clear filters",sort:"Sort",clear_sort:"Clear sort"},te:{search:"\u0C35\u0C46\u0C24\u0C41\u0C15\u0C41",count:"\u0C32\u0C46\u0C15\u0C4D\u0C15",columns:"\u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C32\u0C41",get_row:"\u0C35\u0C30\u0C41\u0C38 \u0C1A\u0C42\u0C2A\u0C41",highlight:"\u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D",select:"\u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B",open:"\u0C24\u0C46\u0C30\u0C41\u0C35\u0C41",filter:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D",clear_filters:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F",sort:"\u0C15\u0C4D\u0C30\u0C2E\u0C02",clear_sort:"\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F"}};async function sl(e,t){try{return t()}catch{return de("INTERNAL",Ne(e).internal)}}function wt(e,t={}){let n=t.name??"yuktai_grid",o=Wi[e.locale??"en"],r=l=>t.descriptions?.[l]??il[l],s={id:{type:"string",description:"Row ID"}},i=e.columns.map(l=>l.key);return[{id:"search",available:!0,schema:{type:"object",properties:{query:{type:"string"}},required:["query"]},run:l=>Un(e,String(l.query??""))},{id:"count",available:!0,schema:{type:"object",properties:{}},run:()=>Vn(e)},{id:"columns",available:!0,schema:{type:"object",properties:{}},run:()=>Yn(e)},{id:"get_row",available:!0,schema:{type:"object",properties:s,required:["id"]},run:l=>Kn(e,String(l.id??""))},{id:"highlight",available:!!e.onHighlightRows,schema:{type:"object",properties:{ids:{type:"array",items:{type:"string"},description:"Row IDs"}},required:["ids"]},run:l=>xt(e,qi(l.ids))},{id:"select",available:!!e.onSelectRow,schema:{type:"object",properties:s,required:["id"]},run:l=>Mt(e,String(l.id??""))},{id:"open",available:!!e.onOpenRow,schema:{type:"object",properties:s,required:["id"]},run:l=>Pt(e,String(l.id??""))},{id:"filter",available:!!e.onFiltersChange,schema:{type:"object",properties:{key:{type:"string",enum:i},operator:{type:"string",enum:Bi},value:{description:"Text or number; for 'between' an array of two numbers or dates"}},required:["key","operator","value"]},run:l=>Qn(e,{key:String(l.key??""),operator:String(l.operator??""),value:l.value})},{id:"clear_filters",available:!!e.onFiltersChange,schema:{type:"object",properties:{}},run:()=>Xn(e)},{id:"sort",available:!!e.onSortChange,schema:{type:"object",properties:{key:{type:"string",enum:i},direction:{type:"string",enum:["asc","desc"]}},required:["key"]},run:l=>Jn(e,String(l.key??""),l.direction==="desc"?"desc":"asc")},{id:"clear_sort",available:!!e.onSortChange,schema:{type:"object",properties:{}},run:()=>Zn(e)}].filter(l=>l.available).map(l=>({name:`${n}_${l.id}`,title:Wi.en[l.id],description:r(l.id),label:o[l.id],inputSchema:l.schema,execute:c=>sl(e,()=>l.run(c??{}))}))}var al={en:{done:"Done.",toolMissing:e=>`The action "${e}" is not available here.`,missingInput:e=>`Missing: ${e}.`,notUnderstood:"Sorry, I didn't understand. Try: a word to search, \u201Csort by <column>\u201D, or \u201Cclear filters\u201D.",noMatch:e=>`Nothing matched "${e}".`,failed:"Something went wrong while running this action."},te:{done:"\u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C2F\u0C3F\u0C02\u0C26\u0C3F.",toolMissing:e=>`"${e}" \u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C07\u0C15\u0C4D\u0C15\u0C21 \u0C05\u0C02\u0C26\u0C41\u0C2C\u0C3E\u0C1F\u0C41\u0C32\u0C4B \u0C32\u0C47\u0C26\u0C41.`,missingInput:e=>`\u0C07\u0C35\u0C3F \u0C15\u0C3E\u0C35\u0C3E\u0C32\u0C3F: ${e}.`,notUnderstood:"\u0C15\u0C4D\u0C37\u0C2E\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F, \u0C05\u0C30\u0C4D\u0C25\u0C02 \u0C15\u0C3E\u0C32\u0C47\u0C26\u0C41. \u0C07\u0C32\u0C3E \u0C2A\u0C4D\u0C30\u0C2F\u0C24\u0C4D\u0C28\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F: \u0C35\u0C46\u0C24\u0C15\u0C3E\u0C32\u0C4D\u0C38\u0C3F\u0C28 \u0C2A\u0C26\u0C02, \u201C<\u0C15\u0C3E\u0C32\u0C2E\u0C4D> \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u201D, \u0C32\u0C47\u0C26\u0C3E \u201C\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F\u201D.",noMatch:e=>`"${e}" \u0C15\u0C3F \u0C0F\u0C2E\u0C40 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C32\u0C47\u0C26\u0C41.`,failed:"\u0C08 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C21\u0C17\u0C3E \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F."}},Ui=e=>e.normalize("NFC").toLowerCase().trim(),tt={clearFilters:/\b(clear|remove|reset)\b.*\bfilters?\b|ఫిల్టర్.*(తీసే|తొలగ)/i,clearSort:/\b(clear|remove|reset)\b.*\bsort(ing)?\b|క్రమం.*(తీసే|తొలగ)/i,count:/^\s*(how many|count)\b|ఎన్ని|లెక్క/i,sort:/\bsort\b|\border by\b|క్రమ|అమర్చ|సార్ట్/i,desc:/\b(desc|descending|z\s*-\s*a|highest|largest|most)\b|అవరోహణ|తగ్గే|పెద్ద|అధిక|చివర|ఎక్కువ నుండి/i,openEn:/^\s*open\s+(.+?)\s*$/i,openTe:/^\s*(.+?)\s*(తెరువు|తెరవండి|తెరవు)\s*$/,searchFiller:/^\s*(search(\s+for)?|find|show(\s+me)?|filter(\s+by)?|look\s+for|వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s+|\s+(వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s*$/gi};function ll(e,t){let n=Ui(e),o=null;for(let r of t)for(let s of[r.label,r.key]){let i=Ui(s);i&&n.includes(i)&&(!o||i.length>o.len)&&(o={key:r.key,len:i.length})}return o?.key??null}function eo(e,t){let n=(e??"").trim();if(!n)return null;if(tt.clearFilters.test(n))return{kind:"tool",tool:"clear_filters",input:{}};if(tt.clearSort.test(n))return{kind:"tool",tool:"clear_sort",input:{}};if(tt.count.test(n))return{kind:"tool",tool:"count",input:{}};if(tt.sort.test(n)){let s=ll(n,t.columns);return s?{kind:"tool",tool:"sort",input:{key:s,direction:tt.desc.test(n)?"desc":"asc"}}:null}let o=n.match(tt.openEn)??n.match(tt.openTe);if(o?.[1])return{kind:"open",text:o[1].trim()};let r=n.replace(tt.searchFiller,"").trim();return r?{kind:"tool",tool:"search",input:{query:r}}:null}function cl(e){return!!e&&typeof e=="object"&&typeof e.success=="boolean"&&typeof e.message=="string"}function dl(e,t){let n=e.inputSchema?.required;return Array.isArray(n)?n.map(String).filter(o=>t[o]===void 0||t[o]===null||String(t[o]).trim()===""):[]}function ul(e,t){let n=e.find(r=>r.name===t);if(n)return n;let o=e.filter(r=>r.name.endsWith(`_${t}`)).sort((r,s)=>r.name.length-s.name.length);if(o.length!==0&&!(o.length>1&&o[0].name.length===o[1].name.length))return o[0]}function Vi(e){return e.normalize("NFC").trim().toLocaleLowerCase()}function pl(e,t){let n=Vi(e);return t.find(o=>o.phrases.some(r=>{let s=Vi(r);return s.length>0&&n.includes(s)}))}function Ft({tools:e,data:t=[],onResult:n,onError:o,locale:r="en",columns:s=[],rowKey:i="id",parseIntent:a,customRules:l=[],historyLimit:c=20}){let d=al[r],[g,p]=(0,we.useState)(0),[m,f]=(0,we.useState)(null),[b,u]=(0,we.useState)(null),[y,k]=(0,we.useState)([]),h=(0,we.useRef)({tools:e,data:t,onResult:n,onError:o,columns:s,rowKey:i,parseIntent:a,customRules:l,historyLimit:c,m:d,locale:r});h.current={tools:e,data:t,onResult:n,onError:o,columns:s,rowKey:i,parseIntent:a,customRules:l,historyLimit:c,m:d,locale:r};let S=(0,we.useRef)(!0),w=(0,we.useRef)(0);(0,we.useEffect)(()=>(S.current=!0,()=>{S.current=!1}),[]);let R=(0,we.useCallback)((M,$,x,Y,j)=>{S.current&&(j===w.current&&f(x),k(ee=>[...ee,{id:j,tool:M,input:$,result:x,source:Y,at:Date.now()}].slice(-h.current.historyLimit)))},[]),E=(0,we.useCallback)(async(M,$,x)=>{let{tools:Y,onResult:j,onError:ee,m:ae}=h.current,he=++w.current,B=ul(Y,M);if(!B){let I={success:!1,message:ae.toolMissing(M),error:{code:"NOT_SUPPORTED"}},z=new Error(I.message);return S.current&&u(z),ee?.(z),R(M,$,I,x,he),I}let U=dl(B,$);if(U.length){let I={success:!1,message:ae.missingInput(U.join(", ")),error:{code:"INVALID_INPUT"},tool:B.name};return R(B.name,$,I,x,he),j?.(I),I}S.current&&p(I=>I+1);try{let I=await B.execute($),z=cl(I)?{...I,tool:B.name}:{success:!0,message:ae.done,data:I,tool:B.name};return S.current&&z.success&&u(null),R(B.name,$,z,x,he),j?.(z),z}catch(I){let z=I instanceof Error?I:new Error(String(I)),ne={success:!1,message:ae.failed,error:{code:"INTERNAL"},tool:B.name};return S.current&&u(z),ee?.(z),R(B.name,$,ne,x,he),ne}finally{S.current&&p(I=>Math.max(0,I-1))}},[R]),P=(0,we.useCallback)((M,$={})=>E(M,$??{},"tool"),[E]),H=(0,we.useCallback)(async M=>{let{columns:$,locale:x,parseIntent:Y,customRules:j,data:ee,m:ae,rowKey:he}=h.current,B=pl(M,j??[]);if(B){let q={input:M,data:ee,columns:$,executeTool:P};try{let xe={success:!0,message:await B.execute(q),tool:`rule:${B.name}`};return R(`rule:${B.name}`,{text:M},xe,"ask",++w.current),h.current.onResult?.(xe),xe}catch(ue){let xe=ue instanceof Error?ue:new Error(String(ue)),Ie={success:!1,message:ae.failed,error:{code:"INTERNAL"},tool:`rule:${B.name}`};return S.current&&u(xe),h.current.onError?.(xe),R(`rule:${B.name}`,{text:M},Ie,"ask",++w.current),Ie}}let I=(Y??eo)(M,{columns:$,locale:x});if(!I){let q={success:!1,message:ae.notUnderstood,error:{code:"NOT_UNDERSTOOD"}};return R("ask",{text:M},q,"ask",++w.current),q}if(I.kind==="tool")return E(I.tool,I.input,"ask");let z=await E("search",{query:I.text},"ask"),ne=Array.isArray(z.data)?z.data:[];if(!z.success)return z;if(ne.length===0){let q={success:!1,message:ae.noMatch(I.text),error:{code:"NOT_FOUND"},tool:z.tool};return R("open",{text:I.text},q,"ask",++w.current),q}return E("open",{id:be(ne[0],he)},"ask")},[P,R,E]),O=(0,we.useCallback)(()=>{k([]),f(null),u(null)},[]);return{loading:g>0,tools:e,executeTool:P,ask:H,lastResult:m,lastError:b,history:y,clearHistory:O}}var Yi=Ft;A();var nt=require("react");function gl(e){return JSON.stringify(e.map(t=>[t.name,t.title,t.description,t.inputSchema]))}function ml({tools:e,data:t=[],columns:n=[],rowKey:o,locale:r,onSelectRow:s,onHighlightRows:i,onOpenRow:a,name:l="yuktai_grid",descriptions:c,onStatusChange:d}){let g=(0,nt.useMemo)(()=>e||wt({data:t,columns:n,rowKey:o,locale:r,onSelectRow:s,onHighlightRows:i,onOpenRow:a},{name:l,descriptions:c}),[e,t,n,o,r,s,i,a,l,c]),p=(0,nt.useRef)(g);p.current=g;let m=(0,nt.useRef)(d);m.current=d;let f=(0,nt.useRef)(Promise.resolve()),b=gl(g);return(0,nt.useEffect)(()=>{let u=w=>m.current?.(w),y=typeof document<"u"?document.modelContext:void 0;if(!y?.registerTool){u({state:"unsupported",registered:[],errors:[]});return}let k=new AbortController,h=p.current,S=f.current.then(async()=>{if(k.signal.aborted)return;u({state:"registering",registered:[],errors:[]});let w=[],R=[];for(let E of h){if(k.signal.aborted)return;try{await y.registerTool({name:E.name,title:E.title,description:E.description,inputSchema:E.inputSchema,execute:P=>{let H=p.current.find(O=>O.name===E.name);return H?H.execute(P??{}):{success:!1,message:`Tool "${E.name}" is no longer available.`,error:{code:"NOT_SUPPORTED"}}}},{signal:k.signal}),w.push(E.name)}catch(P){R.push({tool:E.name,message:P instanceof Error?P.message:String(P)})}}k.signal.aborted||u({state:R.length===0?"ready":w.length>0?"partial":"error",registered:w,errors:R})});return f.current=S.catch(()=>{}),()=>k.abort()},[b]),null}var Gt=ml;var F=require("react/jsx-runtime"),fl={"en-US":{search:"Search...",searchAria:"Search grid",rows:"rows",row:"row",loading:"Loading...",noData:"No data found.",selectRow:"Select row",pageSize:"Page size",page:"Page",of:"of",previous:"Previous",next:"Next",yes:"Yes",no:"No",sortAscending:"Sort ascending",sortDescending:"Sort descending",filtersActive:e=>`${e} filter(s) applied`,clearFilters:"Clear filters"},"te-IN":{search:"\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F...",searchAria:"\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F",rows:"\u0C35\u0C30\u0C41\u0C38\u0C32\u0C41",row:"\u0C35\u0C30\u0C41\u0C38",loading:"\u0C32\u0C4B\u0C21\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F...",noData:"\u0C21\u0C47\u0C1F\u0C3E \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.",selectRow:"\u0C35\u0C30\u0C41\u0C38\u0C28\u0C41 \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F",pageSize:"\u0C2A\u0C47\u0C1C\u0C40 \u0C2A\u0C30\u0C3F\u0C2E\u0C3E\u0C23\u0C02",page:"\u0C2A\u0C47\u0C1C\u0C40",of:"\u0C32\u0C4B",previous:"\u0C35\u0C46\u0C28\u0C41\u0C15\u0C15\u0C41",next:"\u0C2E\u0C41\u0C02\u0C26\u0C41\u0C15\u0C41",yes:"\u0C05\u0C35\u0C41\u0C28\u0C41",no:"\u0C15\u0C3E\u0C26\u0C41",sortAscending:"\u0C06\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C02\u0C21\u0C3F",sortDescending:"\u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u0C32\u0C4B \u0C05\u0C2E\u0C30\u0C4D\u0C1A\u0C02\u0C21\u0C3F",filtersActive:e=>`${e} \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D(\u0C32\u0C41) \u0C35\u0C47\u0C36\u0C3E\u0C30\u0C41`,clearFilters:"\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C02\u0C21\u0C3F"}};function hl({size:e=20,color:t="currentColor",strokeWidth:n=2.4}){return(0,F.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,F.jsx)("circle",{cx:"11",cy:"11",r:"6.5"}),(0,F.jsx)("path",{d:"m16 16 5 5"})]})}function bl({size:e=18,color:t="currentColor",strokeWidth:n=2.4,label:o}){return(0,F.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":o?void 0:!0,"aria-label":o,role:o?"img":void 0,children:[o?(0,F.jsx)("title",{children:o}):null,(0,F.jsx)("path",{d:"m6 15 6-6 6 6"})]})}function yl({size:e=18,color:t="currentColor",strokeWidth:n=2.4,label:o}){return(0,F.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":o?void 0:!0,"aria-label":o,role:o?"img":void 0,children:[o?(0,F.jsx)("title",{children:o}):null,(0,F.jsx)("path",{d:"m6 9 6 6 6-6"})]})}function xl({size:e=20,color:t="currentColor",strokeWidth:n=2.4}){return(0,F.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,F.jsx)("path",{d:"m15 18-6-6 6-6"})})}function wl({size:e=20,color:t="currentColor",strokeWidth:n=2.4}){return(0,F.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,F.jsx)("path",{d:"m9 18 6-6-6-6"})})}function Ki({size:e=18,color:t="currentColor",strokeWidth:n=2.4}){return(0,F.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,F.jsx)("path",{d:"m5 12 4 4L19 6"})})}function Qi({data:e,columns:t,rowKey:n="id",view:o="auto",mobileBreakpoint:r=768,theme:s="default",locale:i="en-US",ai:a=!1,search:l=!0,selectable:c=!1,selectedKeys:d=[],onSelectionChange:g,pagination:p,loading:m=!1,highlightIds:f=[],highlightColor:b="#fff3a3",autoScrollToHighlight:u=!1,onRowClick:y,onSortChange:k,empty:h,className:S="",inputLanguage:w,toolName:R="yuktai_grid",toolDescriptions:E,webmcp:P=!1,onWebMCPStatusChange:H,onAgentResult:O,customRules:M=[]}){let $=i==="te-IN"?"te-IN":"en-US",x=fl[$],Y=a===!0||typeof a=="object"&&a!==null,j=p!==!1&&p!==void 0,ee=typeof p=="object"?p.pageSize??20:20,ae=typeof p=="object"&&p.sizeOptions&&p.sizeOptions.length>0?p.sizeOptions:[10,20,50,100],[he,B]=(0,ce.useState)(""),[U,I]=(0,ce.useState)(1),[z,ne]=(0,ce.useState)(ee),[q,ue]=(0,ce.useState)(),[xe,Ie]=(0,ce.useState)("asc"),[qe,br]=(0,ce.useState)(!1),[Re,ct]=(0,ce.useState)([]),[Tt,jt]=(0,ce.useState)([]),Qe=(0,ce.useMemo)(()=>et(t.map(T=>({key:String(T.key),label:T.label,type:T.type}))),[t]);(0,ce.useEffect)(()=>{ne(ee),I(1)},[ee]),(0,ce.useEffect)(()=>{let T=()=>{br(window.innerWidth<=r)};return T(),window.addEventListener("resize",T),()=>{window.removeEventListener("resize",T)}},[r]);let Ce=(0,ce.useMemo)(()=>{let T=[...e];if(he.trim()){let D=he.trim().toLowerCase();T=T.filter(te=>t.some(J=>String(te[J.key]??"").toLowerCase().includes(D)))}return Re.length&&(T=Ve(T,Qe,Re)),q&&T.sort((D,te)=>{let J=D[q],Ee=te[q];if(J==null&&Ee==null)return 0;if(J==null)return 1;if(Ee==null)return-1;if(typeof J=="number"&&typeof Ee=="number")return xe==="asc"?J-Ee:Ee-J;let ve=String(J).localeCompare(String(Ee),i,{numeric:!0,sensitivity:"base"});return xe==="asc"?ve:-ve}),T},[e,t,he,Re,Qe,q,xe,i]),je=j?Math.max(1,Math.ceil(Ce.length/z)):1;(0,ce.useEffect)(()=>{U>je&&I(je)},[U,je]);let At=(0,ce.useMemo)(()=>{let T=[...f.map(String),...Tt];return Array.from(new Set(T))},[f,Tt]);(0,ce.useEffect)(()=>{if(!u)return;let T=At[0];if(T==null)return;let D=typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(String(T)):String(T).replace(/["\\]/g,"\\$&");document.querySelector(`[data-yuktai-row-id="${D}"]`)?.scrollIntoView({behavior:"smooth",block:"center"})},[At,u,U]);let rt=(0,ce.useMemo)(()=>{if(!j)return Ce;let T=(U-1)*z;return Ce.slice(T,T+z)},[Ce,j,U,z]),dt=o==="card"||o==="auto"&&qe,Xe=T=>String(T[n]??""),ut=T=>d.some(D=>String(D)===T),Ut=T=>At.some(D=>String(D)===T),N=T=>{if(!c)return;let D=Xe(T),te=ut(D)?d.filter(J=>String(J)!==D):[...d,D];g?.(te)},se=T=>{if(T.sortable===!1)return;let D=String(T.key),te=q===D&&xe==="asc"?"desc":"asc";ue(D),Ie(te),I(1),k?.({key:D,direction:te})},De=T=>{B(T),I(1)},kn=(T,D)=>{let te=t.find(J=>String(J.key)===T||J.label.toLowerCase()===T.toLowerCase());te&&(ue(String(te.key)),Ie(D),I(1),k?.({key:String(te.key),direction:D}))},Sn=$==="te-IN"?"te":"en",yr=(0,ce.useCallback)(T=>{T?(ue(T.key),Ie(T.direction)):(ue(void 0),Ie("asc")),I(1),k?.(T)},[k]),xr=(0,ce.useCallback)(T=>{ct(T),I(1)},[]),wr=(0,ce.useCallback)(T=>{if(jt(T),j&&T.length){let D=Ce.findIndex(te=>String(te[n]??"")===T[0]);D>=0&&I(Math.floor(D/z)+1)}},[j,Ce,n,z]),Tn=(0,ce.useMemo)(()=>wt({data:e,columns:Qe,rowKey:String(n),locale:Sn,filters:Re,onHighlightRows:wr,onFiltersChange:xr,onSortChange:yr,onOpenRow:y?T=>{let D=Ce.findIndex(J=>String(J[n]??"")===T),te=D>=0?Ce[D]:e.find(J=>String(J[n]??"")===T);te&&y(te,Math.max(D,0))}:void 0,onSelectRow:c&&g?T=>{d.some(D=>String(D)===T)||g([...d.map(String),T])}:void 0},{name:R,descriptions:E}),[e,Qe,n,Sn,Re,wr,xr,yr,y,Ce,c,g,d,R,E]),Vt=Ft({tools:Tn,data:e,locale:Sn,columns:Qe,rowKey:String(n),customRules:M,onResult:O}),vr=(0,ce.useMemo)(()=>Tn.map(T=>({...T,execute:D=>Vt.executeTool(T.name,D)})),[Tn,Vt.executeTool]),Ms=()=>{ct([]),I(1)},kr=(T,D,te)=>{if(D.render)return D.render(T[D.key],T,te);let J=T[D.key];if(J==null)return"";if(D.type==="date"){let Ee=new Date(String(J));if(!Number.isNaN(Ee.getTime()))return Ee.toLocaleDateString(i)}return D.type==="boolean"?J?x.yes:x.no:String(J)},re=s==="dark",Sr={width:"100%",overflow:"hidden",border:s==="high-contrast"?"2px solid #000000":re?"1px solid #334155":"1px solid #e2e8f0",borderRadius:12,background:re?"#0f172a":"#ffffff",color:re?"#f8fafc":"#0f172a",fontFamily:s==="dyslexia"?"Arial, sans-serif":void 0},Ps={padding:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",borderBottom:re?"1px solid #334155":"1px solid #e2e8f0"},Tr=T=>({width:40,height:40,minWidth:40,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,borderRadius:8,border:re?"1px solid #475569":"1px solid #cbd5e1",background:T?re?"#1e293b":"#f8fafc":re?"#1e293b":"#ffffff",color:T?"#94a3b8":re?"#f8fafc":"#0f172a",cursor:T?"not-allowed":"pointer",opacity:T?.55:1});if(m)return(0,F.jsxs)("div",{className:S,style:Sr,children:[P&&(0,F.jsx)(Gt,{tools:vr,onStatusChange:H}),(0,F.jsx)("div",{style:{padding:32,textAlign:"center"},children:x.loading})]});let Fs=t.map(T=>({key:String(T.key),label:T.label,type:T.type==="number"?"number":T.type==="date"?"date":"text"}));return(0,F.jsxs)("div",{className:S,style:Sr,children:[P&&(0,F.jsx)(Gt,{tools:vr,onStatusChange:H}),(l||Y||Re.length>0)&&(0,F.jsxs)("div",{style:Ps,children:[l&&(0,F.jsxs)("div",{style:{position:"relative",width:"100%",maxWidth:420},children:[(0,F.jsx)("div",{style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex",alignItems:"center",color:re?"#cbd5e1":"#64748b",pointerEvents:"none"},children:(0,F.jsx)(hl,{size:19})}),(0,F.jsx)("input",{value:he,onChange:T=>{B(T.target.value),I(1)},placeholder:x.search,"aria-label":x.searchAria,style:{width:"100%",padding:"10px 12px 10px 40px",borderRadius:8,border:re?"1px solid #475569":"1px solid #cbd5e1",background:re?"#1e293b":"#ffffff",color:re?"#ffffff":"#0f172a",outline:"none",boxSizing:"border-box"}})]}),Re.length>0&&(0,F.jsxs)("button",{type:"button",onClick:Ms,title:x.clearFilters,style:{padding:"6px 10px",borderRadius:999,border:re?"1px solid #475569":"1px solid #cbd5e1",background:re?"#1e293b":"#f1f5f9",color:"inherit",fontSize:12,cursor:"pointer"},children:[x.filtersActive(Re.length)," \u2715"]}),(0,F.jsxs)("div",{style:{marginLeft:"auto",fontSize:13,opacity:.7,whiteSpace:"nowrap"},children:[Ce.length," ",Ce.length===1?x.row:x.rows]}),Y&&(0,F.jsx)(sn,{data:e,columns:Fs,onSearch:De,onSort:kn,theme:re?"dark":"light",language:$,inputLanguage:w??$,agent:{ask:Vt.ask,loading:Vt.loading},embedded:!0})]}),Ce.length===0?(0,F.jsx)("div",{style:{padding:40,textAlign:"center",opacity:.7},children:h??x.noData}):dt?(0,F.jsx)("div",{style:{display:"grid",gap:12,padding:12},children:rt.map((T,D)=>{let te=Xe(T),J=ut(te),Ee=Ut(te);return(0,F.jsxs)("div",{"data-yuktai-row-id":te,onClick:()=>y?.(T,D),style:{padding:14,borderRadius:10,border:re?"1px solid #334155":"1px solid #e2e8f0",background:Ee?b:J?re?"#1e3a5f":"#eff6ff":re?"#1e293b":"#ffffff",cursor:y?"pointer":"default"},children:[c&&(0,F.jsx)("button",{type:"button",onClick:ve=>{ve.stopPropagation(),N(T)},"aria-label":`${x.selectRow} ${te}`,"aria-pressed":J,style:{width:32,height:32,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,marginBottom:10,borderRadius:7,border:J?"1px solid #2563eb":"1px solid #cbd5e1",background:J?"#2563eb":"transparent",color:J?"#ffffff":"currentColor",cursor:"pointer"},children:J&&(0,F.jsx)(Ki,{size:17})}),t.map(ve=>(0,F.jsxs)("div",{style:{display:"flex",gap:8,padding:"5px 0",alignItems:"flex-start"},children:[(0,F.jsx)("strong",{style:{minWidth:100,opacity:.7},children:ve.label}),(0,F.jsx)("span",{children:kr(T,ve,D)})]},String(ve.key)))]},te)})}):(0,F.jsx)("div",{style:{width:"100%",overflowX:"auto"},children:(0,F.jsxs)("table",{style:{width:"100%",borderCollapse:"collapse"},children:[(0,F.jsx)("thead",{children:(0,F.jsxs)("tr",{children:[c&&(0,F.jsx)("th",{style:{padding:10,borderBottom:re?"1px solid #334155":"1px solid #e2e8f0",width:52}}),t.filter(T=>!(qe&&T.hiddenOnMobile)).map(T=>{let D=q===String(T.key);return(0,F.jsx)("th",{onClick:()=>se(T),style:{padding:10,textAlign:T.align??"left",borderBottom:re?"1px solid #334155":"1px solid #e2e8f0",whiteSpace:"nowrap",cursor:T.sortable===!1?"default":"pointer",width:T.width,userSelect:"none"},children:(0,F.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:5},children:[T.label,D&&(xe==="asc"?(0,F.jsx)(bl,{size:17,label:x.sortAscending}):(0,F.jsx)(yl,{size:17,label:x.sortDescending}))]})},String(T.key))})]})}),(0,F.jsx)("tbody",{children:rt.map((T,D)=>{let te=Xe(T),J=ut(te),Ee=Ut(te);return(0,F.jsxs)("tr",{"data-yuktai-row-id":te,onClick:()=>y?.(T,D),style:{background:Ee?b:J?re?"#1e3a5f":"#eff6ff":"transparent",cursor:y?"pointer":"default"},children:[c&&(0,F.jsx)("td",{style:{padding:10,borderBottom:re?"1px solid #334155":"1px solid #e2e8f0"},children:(0,F.jsx)("button",{type:"button",onClick:ve=>{ve.stopPropagation(),N(T)},"aria-label":`${x.selectRow} ${te}`,"aria-pressed":J,style:{width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,borderRadius:6,border:J?"1px solid #2563eb":re?"1px solid #64748b":"1px solid #cbd5e1",background:J?"#2563eb":"transparent",color:J?"#ffffff":"currentColor",cursor:"pointer"},children:J&&(0,F.jsx)(Ki,{size:16})})}),t.filter(ve=>!(qe&&ve.hiddenOnMobile)).map(ve=>(0,F.jsx)("td",{style:{padding:10,textAlign:ve.align??"left",borderBottom:re?"1px solid #334155":"1px solid #e2e8f0"},children:kr(T,ve,D)},String(ve.key)))]},te)})})]})}),j&&(0,F.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:12,borderTop:re?"1px solid #334155":"1px solid #e2e8f0"},children:[(0,F.jsxs)("span",{style:{fontSize:13,opacity:.7},children:[x.page," ",U," ",x.of," ",je]}),(0,F.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[typeof p=="object"&&p.showSizeChanger&&(0,F.jsx)("select",{value:z,onChange:T=>{let D=Number(T.target.value);!Number.isFinite(D)||D<=0||(ne(D),I(1))},"aria-label":x.pageSize,style:{minHeight:40,padding:"7px 10px",borderRadius:8,border:re?"1px solid #475569":"1px solid #cbd5e1",background:re?"#1e293b":"#ffffff",color:re?"#ffffff":"#0f172a"},children:ae.map(T=>(0,F.jsx)("option",{value:T,children:T},T))}),(0,F.jsx)("button",{type:"button",disabled:U<=1,onClick:()=>I(T=>Math.max(1,T-1)),"aria-label":x.previous,title:x.previous,style:Tr(U<=1),children:(0,F.jsx)(xl,{size:20})}),(0,F.jsx)("button",{type:"button",disabled:U>=je,onClick:()=>I(T=>Math.min(je,T+1)),"aria-label":x.next,title:x.next,style:Tr(U>=je),children:(0,F.jsx)(wl,{size:20})})]})]})]})}A();var oe=require("react");function Xi(e){return e===!1?Number.MAX_SAFE_INTEGER:e===!0||e===void 0?10:e.pageSize??10}function Ji(e){return String(e??"").normalize("NFC").toLowerCase().trim()}function Zi(e){return e==null||typeof e=="string"&&e.trim()===""}function es(e){if(typeof e=="number")return Number.isFinite(e)?e:null;let t=String(e??"").trim();if(t==="")return null;let n=Number(t);return Number.isFinite(n)?n:null}function ts(e){let t=e instanceof Date?e.getTime():new Date(String(e)).getTime();return Number.isFinite(t)?t:null}function vl(e,t,n,o){if(n==="number"||typeof e=="number"&&typeof t=="number"){let r=es(e),s=es(t);if(r!==null&&s!==null)return r-s}if(n==="date"||e instanceof Date&&t instanceof Date){let r=ts(e),s=ts(t);if(r!==null&&s!==null)return r-s}return typeof e=="boolean"&&typeof t=="boolean"?e===t?0:e?1:-1:String(e).localeCompare(String(t),o,{sensitivity:"base",numeric:!0})}function ns(e){let{data:t,columns:n,pagination:o=!0,mobileBreakpoint:r=768,locale:s,initialFilters:i=[]}=e,[a,l]=(0,oe.useState)(null),[c,d]=(0,oe.useState)(""),[g,p]=(0,oe.useState)(i),[m,f]=(0,oe.useState)(1),[b,u]=(0,oe.useState)(Xi(o)),[y,k]=(0,oe.useState)(!1),h=Xi(o);(0,oe.useEffect)(()=>{u(h),f(1)},[h]),(0,oe.useEffect)(()=>{if(typeof window>"u")return;let I=()=>{k(window.innerWidth<=r)};return I(),window.addEventListener("resize",I),()=>window.removeEventListener("resize",I)},[r]);let S=(0,oe.useMemo)(()=>et(n.map(I=>({key:String(I.key),label:I.label,type:I.type}))),[n]),w=(0,oe.useCallback)(I=>{l(z=>!z||z.key!==I?{key:I,direction:"asc"}:z.direction==="asc"?{key:I,direction:"desc"}:null),f(1)},[]),R=(0,oe.useCallback)(I=>{l(I&&I.direction?I:null),f(1)},[]),E=(0,oe.useCallback)(()=>{l(null),f(1)},[]),P=(0,oe.useCallback)(I=>{d(I),f(1)},[]),H=(0,oe.useCallback)(I=>{p(I),f(1)},[]),O=(0,oe.useCallback)(I=>{p(z=>[...z.filter(ne=>ne.key!==I.key),I]),f(1)},[]),M=(0,oe.useCallback)(I=>{p(z=>z.filter(ne=>ne.key!==I)),f(1)},[]),$=(0,oe.useCallback)(()=>{p([]),f(1)},[]),x=(0,oe.useCallback)(I=>{u(Math.max(1,Math.floor(I)||1)),f(1)},[]),Y=(0,oe.useMemo)(()=>{let I=Ji(c);return I?t.filter(z=>n.some(ne=>{let q=z[ne.key];return q==null?!1:Ji(q).includes(I)})):t},[t,c,n]),j=(0,oe.useMemo)(()=>Ve(Y,S,g),[Y,S,g]),ee=(0,oe.useMemo)(()=>{if(!a||!a.direction)return j;let I=n.find(ne=>String(ne.key)===a.key),z=a.direction==="desc"?-1:1;return[...j].sort((ne,q)=>{let ue=ne[a.key],xe=q[a.key],Ie=Zi(ue),qe=Zi(xe);return Ie&&qe?0:Ie?1:qe?-1:z*vl(ue,xe,I?.type,s)})},[j,a,n,s]),ae=Math.max(1,Math.ceil(ee.length/b)),he=(0,oe.useMemo)(()=>{if(o===!1)return ee;let I=(m-1)*b;return ee.slice(I,I+b)},[ee,m,b,o]);(0,oe.useEffect)(()=>{m>ae&&f(ae)},[m,ae]);let B=(0,oe.useCallback)(I=>f(Math.min(Math.max(1,Math.floor(I)||1),ae)),[ae]),U=(0,oe.useCallback)(()=>{l(null),d(""),p([]),f(1)},[]);return{displayedData:he,rows:ee,totalCount:t.length,filteredCount:ee.length,sort:a,toggleSort:w,setSort:R,clearSort:E,searchQuery:c,setSearchQuery:P,filters:g,setFilters:H,setFilter:O,removeFilter:M,clearFilters:$,page:m,pageSize:b,totalPages:ae,setPage:B,setPageSize:x,isMobile:y,reset:U}}A();A();A();A();var kl="[data-yuktai-panel]";function Oe(){return typeof window<"u"&&typeof document<"u"}function st(e){return typeof e=="object"&&e!==null&&e.nodeType===9}function $e(e){return e||(Oe()?document:null)}function K(e,t,n={}){return Array.from(e.querySelectorAll(t)).filter(o=>!o.closest(kl)&&(n.includeHidden||Sl(o)))}function Sl(e){if(!Oe()||e.closest("[hidden],[aria-hidden='true']"))return!1;let t=e;for(;t;){let n=window.getComputedStyle(t);if(n.display==="none"||n.visibility==="hidden")return!1;t=t.parentElement}return!0}function ge(e){return(e??"").replace(/\s+/g," ").trim()}function ye(e,t=60){let n=ge(e);return n.length>t?`${n.slice(0,t-1)}\u2026`:n}function We(e){let t=[],n=e;for(;n&&n.nodeType===1&&t.length<4;){let o=n.tagName.toLowerCase();if(n.id&&/^[A-Za-z][\w-]*$/.test(n.id)){t.unshift(`${o}#${n.id}`);break}let r=n.parentElement;if(!r){t.unshift(o);break}let s=Array.from(r.children).filter(i=>i.tagName===n.tagName);t.unshift(s.length>1?`${o}:nth-of-type(${s.indexOf(n)+1})`:o),n=r}return t.join(" > ")}function Tl(e,t){return e.split(/\s+/).map(n=>ge(t.getElementById(n)?.textContent)).filter(Boolean).join(" ")}function Me(e){let t=e.ownerDocument,n=e.getAttribute("aria-labelledby");if(n){let s=Tl(n,t);if(s)return s}let o=ge(e.getAttribute("aria-label"));if(o)return o;let r=e.tagName.toLowerCase();if(r==="input"||r==="select"||r==="textarea"){let s=e.getAttribute("id");if(s){let l=t.querySelector(`label[for="${Al(s)}"]`),c=ge(l?.textContent);if(c)return c}let i=e.closest("label");if(i){let l=ge(i.textContent);if(l)return l}let a=(e.getAttribute("type")??"").toLowerCase();if(a==="submit"||a==="button"||a==="reset")return ge(e.getAttribute("value"))||(a==="submit"?"Submit":"");if(a==="image")return ge(e.getAttribute("alt"))}if(r==="img")return ge(e.getAttribute("alt"));if(r==="button"||r==="a"||e.getAttribute("role")){let s=ge(e.textContent);if(s)return s;let i=Array.from(e.querySelectorAll("img[alt], svg[aria-label]")).map(a=>ge(a.getAttribute("alt")??a.getAttribute("aria-label"))).filter(Boolean).join(" ");if(i)return i}return ge(e.getAttribute("title"))}function Al(e){return typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/["\\]/g,"\\$&")}function ot(e){if(!e)return null;let t=e.trim().toLowerCase();if(t==="transparent")return{r:0,g:0,b:0,a:0};let n=t.match(/^rgba?\(([^)]+)\)$/);if(n){let r=n[1].split(/[\s,/]+/).filter(Boolean),[s,i,a]=r.slice(0,3).map(Number),l=r[3],c=l===void 0?1:l.endsWith("%")?Number(l.slice(0,-1))/100:Number(l);return[s,i,a,c].some(d=>!Number.isFinite(d))?null:{r:s,g:i,b:a,a:c}}let o=t.match(/^#([0-9a-f]{3,8})$/);if(o){let r=o[1];return(r.length===3||r.length===4)&&(r=r.split("").map(s=>s+s).join("")),r.length!==6&&r.length!==8?null:{r:parseInt(r.slice(0,2),16),g:parseInt(r.slice(2,4),16),b:parseInt(r.slice(4,6),16),a:r.length===8?parseInt(r.slice(6,8),16)/255:1}}return null}function to(e,t){let n=e.a+t.a*(1-e.a);if(n===0)return{r:0,g:0,b:0,a:0};let o=(r,s)=>(r*e.a+s*t.a*(1-e.a))/n;return{r:o(e.r,t.r),g:o(e.g,t.g),b:o(e.b,t.b),a:n}}function ln(e){let t=n=>{let o=n/255;return o<=.04045?o/12.92:Math.pow((o+.055)/1.055,2.4)};return .2126*t(e.r)+.7152*t(e.g)+.0722*t(e.b)}function vt(e,t){let n=t.a<1?to(t,{r:255,g:255,b:255,a:1}):t,o=e.a<1?to(e,n):e,r=ln(o),s=ln(n),[i,a]=r>s?[r,s]:[s,r];return Math.round((i+.05)/(a+.05)*100)/100}function os(e){let t=[],n=e;for(;n;){let r=window.getComputedStyle(n);if(r.backgroundImage&&r.backgroundImage!=="none")return null;let s=ot(r.backgroundColor);if(s&&s.a>0&&(t.push(s),s.a>=1))break;n=n.parentElement}let o={r:255,g:255,b:255,a:1};for(let r=t.length-1;r>=0;r--)o=to(t[r],o);return o}function rs(e){let t=window.getComputedStyle(e),n=parseFloat(t.fontSize)||16,o=parseInt(t.fontWeight,10)||400;return n>=24||n>=18.66&&o>=700}function zt(e){return Array.from(e.childNodes).some(t=>t.nodeType===3&&ge(t.textContent).length>0)}var is="a[href],button,input:not([type='hidden']),select,textarea,summary,[tabindex]:not([tabindex='-1']),[contenteditable='true']",cn="a[href],button,input:not([type='hidden']),select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='tab'],[role='menuitem']";A();var Be={accessibility:'<circle cx="12" cy="4" r="2"/><path d="M4 8l8-1 8 1M12 7v5m-5 9 5-8 5 8M7 12l-2 5m12-5 2 5"/>',contrast:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z"/>',moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',motion:'<path d="M4 12h12m-5-5 5 5-5 5M20 5v14"/>',reading:'<path d="M4 5h16M4 10h12M4 15h16M4 20h10"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',speaker:'<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',palette:'<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="16" cy="10" r="1.3"/><path d="M12 21a3 3 0 0 1 0-6h2"/>',skip:'<path d="M5 5l7 7-7 7M13 5l7 7-7 7"/>',close:'<path d="m18 6-12 12M6 6l12 12"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',sort:'<path d="m8 9 4-4 4 4m-8 6 4 4 4-4"/>',sortUp:'<path d="m6 15 6-6 6 6"/>',sortDown:'<path d="m6 9 6 6 6-6"/>',chevrons:'<path d="m8 9 4-4 4 4m-8 6 4 4 4-4"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',cards:'<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/>',chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',filter:'<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',check:'<path d="m5 12 4 4L19 6"/>',left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',first:'<path d="m11 18-6-6 6-6M19 18l-6-6 6-6"/>',last:'<path d="m13 18 6-6-6-6M5 18l6-6-6-6"/>',spark:'<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z"/>',alert:'<path d="m12 3 10 18H2L12 3z"/><path d="M12 9v5m0 3h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9h.01"/>',form:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',wand:'<path d="m15 4 5 5L9 20H4v-5z"/><path d="m13 6 5 5"/>',undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',tools:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',plug:'<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>'},no=Object.keys(Be);var dn=3,oo="#ffffff",ss="#111827";function kt(e,t){let n=ot(e),o=ot(t);return n&&o?vt(n,o):null}function un(e){let t=kt(oo,e),n=kt(ss,e);return t===null||n===null||t>=n?oo:ss}var as=new Set;function Cl(e,t){as.has(e)||(as.add(e),typeof console<"u"&&console.warn(`[yuktai icons] ${t}`))}function pn(e={}){let t=e.variant==="filled"?"filled":"outline",n=e.color||"currentColor";if(t==="outline")return{variant:t,color:n,glyph:n,contrast:null};let o=e.glyphColor||un(n),r=kt(o,n);return r!==null&&r<dn&&Cl(`${o}|${n}`,`glyph ${o} on ${n} is ${r}:1. WCAG 1.4.11 needs at least 3:1 for icons.`),{variant:t,color:n,glyph:o,contrast:r}}var ro="translate(3.6 3.6) scale(0.7)",io="@media (forced-colors: active){.yi-bg{fill:CanvasText}.yi-glyph{stroke:Canvas}}",at=e=>String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);function so(e,t={}){let n=Be[e]??Be.spark,o=t.size??20,{variant:r,color:s,glyph:i}=pn(t),a=t.strokeWidth??(r==="filled"?2.4:1.9),c=`<svg xmlns="http://www.w3.org/2000/svg" ${t.label?`role="img" aria-label="${at(t.label)}"`:'aria-hidden="true"'} focusable="false" width="${at(o)}" height="${at(o)}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" data-variant="${r}">`;if(r==="outline")return`${c}<g stroke="${at(s)}" stroke-width="${a}">${n}</g></svg>`;let d=t.shape==="circle"?`<circle class="yi-bg" cx="12" cy="12" r="12" fill="${at(s)}"/>`:`<rect class="yi-bg" width="24" height="24" rx="6" fill="${at(s)}"/>`;return`${c}<style>${io}</style>${d}<g class="yi-glyph" stroke="${at(i)}" stroke-width="${a}" transform="${ro}">${n}</g></svg>`}var He=require("react/jsx-runtime");function me({size:e=20,color:t,strokeWidth:n,label:o,variant:r,glyphColor:s,shape:i,children:a,...l}){let c=!o,d=pn({variant:r,color:t,glyphColor:s,shape:i}),g=d.variant==="filled",p=n??(g?2.6:2.5);return(0,He.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:g?void 0:d.color,strokeWidth:g?void 0:p,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":c?"true":void 0,"aria-label":o,role:o?"img":void 0,focusable:"false","data-variant":d.variant,...l,children:g?(0,He.jsxs)(He.Fragment,{children:[(0,He.jsx)("style",{children:io}),i==="circle"?(0,He.jsx)("circle",{className:"yi-bg",cx:"12",cy:"12",r:"12",fill:d.color}):(0,He.jsx)("rect",{className:"yi-bg",width:"24",height:"24",rx:"6",fill:d.color}),(0,He.jsx)("g",{className:"yi-glyph",stroke:d.glyph,strokeWidth:p,transform:ro,children:a})]}):a})}A();var Ot=require("react/jsx-runtime");function ao(e){return(0,Ot.jsxs)(me,{...e,children:[(0,Ot.jsx)("circle",{cx:"11",cy:"11",r:"7"}),(0,Ot.jsx)("path",{d:"m20 20-4-4"})]})}A();var Dt=require("react/jsx-runtime");function lo(e){return(0,Dt.jsxs)(me,{...e,children:[(0,Dt.jsx)("path",{d:"M12 19V5"}),(0,Dt.jsx)("path",{d:"m5 12 7-7 7 7"})]})}A();var Wt=require("react/jsx-runtime");function co(e){return(0,Wt.jsxs)(me,{...e,children:[(0,Wt.jsx)("path",{d:"M12 5v14"}),(0,Wt.jsx)("path",{d:"m5 12 7 7 7-7"})]})}A();var uo=require("react/jsx-runtime");function po(e){return(0,uo.jsx)(me,{...e,children:(0,uo.jsx)("path",{d:"m15 18-6-6 6-6"})})}A();var go=require("react/jsx-runtime");function mo(e){return(0,go.jsx)(me,{...e,children:(0,go.jsx)("path",{d:"m9 18 6-6-6-6"})})}A();var fo=require("react/jsx-runtime");function ho(e){return(0,fo.jsx)(me,{...e,children:(0,fo.jsx)("path",{d:"M5 12.5 10 17.5 19.5 7"})})}A();var Bt=require("react/jsx-runtime");function bo(e){return(0,Bt.jsxs)(me,{...e,children:[(0,Bt.jsx)("path",{d:"M18 6 6 18"}),(0,Bt.jsx)("path",{d:"m6 6 12 12"})]})}A();var Q=require("react/jsx-runtime");function X({name:e,...t}){let n=Be[e]??Be.spark;return(0,Q.jsx)(me,{...t,children:(0,Q.jsx)("g",{dangerouslySetInnerHTML:{__html:n}})})}var yo=e=>(0,Q.jsx)(X,{...e,name:"accessibility"}),xo=e=>(0,Q.jsx)(X,{...e,name:"contrast"}),wo=e=>(0,Q.jsx)(X,{...e,name:"moon"}),vo=e=>(0,Q.jsx)(X,{...e,name:"motion"}),ko=e=>(0,Q.jsx)(X,{...e,name:"reading"}),So=e=>(0,Q.jsx)(X,{...e,name:"target"}),To=e=>(0,Q.jsx)(X,{...e,name:"speaker"}),Ao=e=>(0,Q.jsx)(X,{...e,name:"palette"}),Co=e=>(0,Q.jsx)(X,{...e,name:"skip"}),Io=e=>(0,Q.jsx)(X,{...e,name:"plus"}),Ro=e=>(0,Q.jsx)(X,{...e,name:"minus"}),Eo=e=>(0,Q.jsx)(X,{...e,name:"reset"}),$o=e=>(0,Q.jsx)(X,{...e,name:"sort"}),Lo=e=>(0,Q.jsx)(X,{...e,name:"chevrons"}),No=e=>(0,Q.jsx)(X,{...e,name:"grid"}),Mo=e=>(0,Q.jsx)(X,{...e,name:"cards"}),Po=e=>(0,Q.jsx)(X,{...e,name:"chat"}),Fo=e=>(0,Q.jsx)(X,{...e,name:"mic"}),Go=e=>(0,Q.jsx)(X,{...e,name:"stop"}),zo=e=>(0,Q.jsx)(X,{...e,name:"download"}),Oo=e=>(0,Q.jsx)(X,{...e,name:"copy"}),Do=e=>(0,Q.jsx)(X,{...e,name:"filter"}),Wo=e=>(0,Q.jsx)(X,{...e,name:"first"}),Bo=e=>(0,Q.jsx)(X,{...e,name:"last"}),Ho=e=>(0,Q.jsx)(X,{...e,name:"spark"}),_o=e=>(0,Q.jsx)(X,{...e,name:"alert"}),qo=e=>(0,Q.jsx)(X,{...e,name:"info"}),jo=e=>(0,Q.jsx)(X,{...e,name:"form"}),Uo=e=>(0,Q.jsx)(X,{...e,name:"eye"}),Vo=e=>(0,Q.jsx)(X,{...e,name:"layout"}),Yo=e=>(0,Q.jsx)(X,{...e,name:"wand"}),Ko=e=>(0,Q.jsx)(X,{...e,name:"undo"}),Qo=e=>(0,Q.jsx)(X,{...e,name:"tools"}),Xo=e=>(0,Q.jsx)(X,{...e,name:"plug"});A();A();A();var Ht={"html-lang":{title:"Page language is set",wcag:"3.1.1",severity:"serious",why:"Screen readers pick their voice and pronunciation from the page language. Without it, Telugu or Hindi text may be read with English rules."},"page-title":{title:"Page has a title",wcag:"2.4.2",severity:"serious",why:"The title is the first thing announced and the name shown on browser tabs and bookmarks."},"image-alt":{title:"Images have alternative text",wcag:"1.1.1",severity:"critical",why:'People who cannot see the image get no information from it unless alt text describes it (or alt="" marks it as decorative).'},"heading-order":{title:"Headings follow a logical order",wcag:"1.3.1",severity:"moderate",why:"Many screen-reader users jump between headings. Skipped levels make the page outline confusing."},"single-h1":{title:"Page has one main heading",wcag:"best practice",severity:"minor",why:"A single h1 tells everyone what the page is about."},"landmark-main":{title:"Main content landmark exists",wcag:"1.3.1 / 2.4.1",severity:"moderate",why:"A <main> region lets keyboard and screen-reader users skip straight past menus to the content."},"form-label":{title:"Form fields have labels",wcag:"1.3.1 / 4.1.2",severity:"critical",why:'Without a label, a screen reader just says "edit text" and the user has to guess what to type.'},"button-name":{title:"Buttons have names",wcag:"4.1.2",severity:"critical",why:'An icon-only button with no name is announced as just "button", so its purpose is unknown.'},"link-name":{title:"Links have names",wcag:"2.4.4",severity:"serious",why:"Links are often read out of context in a list. An empty link gives no clue where it goes."},"color-contrast":{title:"Text has enough contrast",wcag:"1.4.3",severity:"serious",why:"Low-contrast text is hard to read for older users, people with low vision, and anyone outdoors on a phone."},"positive-tabindex":{title:"No positive tabindex",wcag:"2.4.3",severity:"moderate",why:"tabindex greater than 0 forces a custom keyboard order that usually doesn't match the visual order."},"keyboard-access":{title:"Clickable things work with a keyboard",wcag:"2.1.1",severity:"critical",why:"A div or span with a click handler can't be reached or activated with Tab and Enter, locking out keyboard users."},"duplicate-id":{title:"IDs are unique",wcag:"best practice",severity:"minor",why:"Labels and ARIA references point at ids. Duplicates make them point at the wrong element."},"form-error":{title:"Errors are linked to their fields",wcag:"3.3.1",severity:"serious",why:"When a field is marked invalid, the error message must be connected to it so it's announced together with the field."},"target-size":{title:"Touch targets are large enough",wcag:"2.5.8",severity:"moderate",why:"Small targets are hard to tap for people with tremors, seniors and everyone on mobile."}},Il={critical:10,serious:5,moderate:2,minor:1};function Ye(e={}){let t=$e(e.root),n=new Set(e.skip??[]),o=[],r={},s=t?st(t)?t:t.ownerDocument:null,i=(a,l,c,d,g=!1)=>{if(n.has(a))return;let p=Ht[a],m=r[a]=(r[a]??0)+1;o.push({id:`${a}-${m}`,rule:a,severity:p.severity,wcag:p.wcag,message:c,why:p.why,fix:d,selector:l?We(l):"document",snippet:l?ye(l.outerHTML,120):"",autoFixable:g,element:l??void 0})};if(t&&s){s.documentElement.getAttribute("lang")||i("html-lang",s.documentElement,"The <html> element has no lang attribute.",'Add lang to <html>, e.g. <html lang="te"> or "en".',!0),s.title.trim()||i("page-title",null,"The page has no <title>.","Add a short, descriptive <title> that names this page.");for(let u of K(t,"img"))if(!(u.getAttribute("role")==="presentation"||u.getAttribute("role")==="none")&&!u.hasAttribute("alt")&&!u.getAttribute("aria-label")&&!u.getAttribute("aria-labelledby")){let y=u.getAttribute("title");i("image-alt",u,`Image has no alt text${u.getAttribute("src")?` (${ye(u.getAttribute("src")??"",40)})`:""}.`,y?`Use the title as alt: alt="${ye(y,40)}".`:'Describe the image in alt, or use alt="" if it is purely decorative.',!!y)}let a=K(t,"h1,h2,h3,h4,h5,h6"),l=0;for(let u of a){let y=Number(u.tagName[1]);l>0&&y>l+1&&i("heading-order",u,`Heading jumps from h${l} to h${y}: "${ye(u.textContent??"",40)}".`,`Change it to h${l+1}, or add the missing level above it.`),l=y}let c=a.filter(u=>u.tagName==="H1");c.length===0?i("single-h1",null,"The page has no h1.","Add one h1 that names the page."):c.length>1&&i("single-h1",c[1],`The page has ${c.length} h1 headings.`,"Keep one h1; turn the others into h2."),t.querySelectorAll("main,[role='main']").length===0&&i("landmark-main",null,"No <main> landmark found.","Wrap the primary content in <main>.");let d=K(t,"input,select,textarea").filter(u=>{let y=(u.getAttribute("type")??"text").toLowerCase();return!["hidden","submit","button","reset","image"].includes(y)});for(let u of d){if(!Me(u)){let y=u.getAttribute("placeholder")||u.getAttribute("name");i("form-label",u,`Form field has no label${y?` (placeholder/name: "${ye(y,30)}")`:""}.`,y?`Add a visible <label>. Quick fix: aria-label="${ye(y,30)}".`:"Add a visible <label for=\u2026> describing what to enter.",!!y)}u.getAttribute("aria-invalid")==="true"&&(u.getAttribute("aria-describedby")||u.getAttribute("aria-errormessage")||i("form-error",u,"Field is marked invalid but no error message is linked to it.","Put the error text in an element with an id and point aria-describedby at it."))}for(let u of K(t,"button,[role='button'],input[type='submit'],input[type='button']"))if(!Me(u)){let y=u.getAttribute("title");i("button-name",u,"Button has no accessible name.",y?`Use the title as the name: aria-label="${y}".`:"Add visible text or an aria-label that says what the button does.",!!y)}for(let u of K(t,"a[href]"))if(!Me(u)){let y=u.getAttribute("title");i("link-name",u,`Link has no text (${ye(u.getAttribute("href")??"",40)}).`,y?`Use the title as the name: aria-label="${y}".`:"Add link text that says where it goes.",!!y)}for(let u of K(t,"[tabindex]"))Number(u.getAttribute("tabindex"))>0&&i("positive-tabindex",u,`tabindex="${u.getAttribute("tabindex")}" overrides the natural tab order.`,'Use tabindex="0" and fix the order in the HTML instead.',!0);let g="a[href],button,input,select,textarea,summary";for(let u of K(t,"[onclick],[role='button'],[role='link']"))u.matches(g)||u.hasAttribute("tabindex")||i("keyboard-access",u,`<${u.tagName.toLowerCase()}> is clickable but can't be reached with the keyboard.`,'Use a real <button>, or add tabindex="0", a role and Enter/Space key handling.',!0);let p=new Map;for(let u of Array.from(t.querySelectorAll("[id]")))u.closest("[data-yuktai-panel]")||p.set(u.id,(p.get(u.id)??0)+1);for(let[u,y]of p)y>1&&i("duplicate-id",t.querySelector(`[id="${u.replace(/"/g,'\\"')}"]`),`id="${u}" is used ${y} times.`,"Give each element a unique id.");let m=e.maxContrastChecks??600,f=0;for(let u of K(t,"body *")){if(f>=m)break;if(!zt(u)||["SCRIPT","STYLE","NOSCRIPT","OPTION"].includes(u.tagName))continue;f++;let y=ot(window.getComputedStyle(u).color),k=os(u);if(!y||!k)continue;let h=vt(y,k),S=rs(u)?3:4.5;h<S&&i("color-contrast",u,`Contrast ${h}:1 is below ${S}:1 for "${ye(u.textContent??"",30)}".`,`Darken the text or lighten the background until the ratio is at least ${S}:1.`)}let b=e.minTargetSize??24;for(let u of K(t,cn)){let y=u.getBoundingClientRect();y.width===0&&y.height===0||u.tagName==="A"&&u.closest("p,li,td")||(y.width<b||y.height<b)&&i("target-size",u,`Target is ${Math.round(y.width)}\xD7${Math.round(y.height)}px (minimum ${b}\xD7${b}).`,`Increase padding so it's at least ${b}\xD7${b}px (44\xD744 is better for seniors).`)}}return Rl(o,s,n)}function Rl(e,t,n){let o=Object.keys(Ht).filter(l=>!n.has(l)).map(l=>{let c=e.filter(d=>d.rule===l).length;return{rule:l,title:Ht[l].title,passed:c===0,issueCount:c}}),r=0;for(let l of o){let c=Il[Ht[l.rule].severity];r+=Math.min(25,l.issueCount*c)}let s=Math.max(0,100-r),i=o.filter(l=>!l.passed),a=e.filter(l=>l.severity==="critical").length;return{url:t?.location?.href??"",title:t?.title??"",generatedAt:new Date().toISOString(),score:s,passed:a===0&&s>=80,checks:o,issues:e,summary:e.length===0?`All ${o.length} checks passed.`:`${o.length-i.length} of ${o.length} checks passed. ${e.length} issue(s) found, ${a} critical. Score ${s}/100.`}}function Jo(e){let t=["# Accessibility QA report","",`- Page: ${e.title||"(untitled)"} ${e.url}`,`- Generated: ${e.generatedAt}`,`- Score: **${e.score}/100** \u2014 ${e.passed?"PASS":"FAIL"}`,"",e.summary,"","## Checks","","| Check | Result | Issues |","|---|---|---|",...e.checks.map(n=>`| ${n.title} | ${n.passed?"\u2705 Pass":"\u274C Fail"} | ${n.issueCount} |`)];if(e.issues.length){t.push("","## Issues","");for(let n of e.issues)t.push(`### ${n.id} \xB7 ${n.severity} \xB7 WCAG ${n.wcag}`,"",`- **Problem:** ${n.message}`,`- **Why it matters:** ${n.why}`,`- **Fix:** ${n.fix}`,`- **Where:** \`${n.selector}\``,"")}return t.join(`
`)}function Zo(e){return JSON.stringify({...e,issues:e.issues.map(({element:t,...n})=>n)},null,2)}function er(e={}){let t=null,n=null,o=null,r=!1,s=[],i=()=>({report:t,watching:n!==null,appliedFixes:s.length}),a=()=>e.onUpdate?.(i()),l=p=>t?.issues.find(m=>m.id===p),c=(p,m,f)=>{s.push({element:p,attribute:m,previous:p.getAttribute(m)}),p.setAttribute(m,f)};function d(p){let m=p.element,f=(b,u)=>({issueId:p.id,applied:b,message:u});if(!p.autoFixable||!m)return f(!1,"This needs a human decision \u2014 see the suggested fix.");switch(p.rule){case"html-lang":{let b=e.defaultLang||(Oe()?navigator.language:"")||"en";return c(m,"lang",b),f(!0,`Set lang="${b}" on <html>.`)}case"image-alt":{let b=m.getAttribute("title");if(!b)break;return c(m,"alt",b),f(!0,`Used the image title as alt text: "${b}".`)}case"form-label":{let b=m.getAttribute("placeholder")||m.getAttribute("name");if(!b)break;let u=b.replace(/[_-]+/g," ").trim();return c(m,"aria-label",u),f(!0,`Added aria-label="${u}". A visible <label> is still better.`)}case"button-name":case"link-name":{let b=m.getAttribute("title");if(!b)break;return c(m,"aria-label",b),f(!0,`Added aria-label="${b}".`)}case"positive-tabindex":return c(m,"tabindex","0"),f(!0,"Changed tabindex to 0 so the natural order applies.");case"keyboard-access":{c(m,"tabindex","0"),m.getAttribute("role")||c(m,"role","button");let b=u=>{let y=u.key;(y==="Enter"||y===" ")&&(u.preventDefault(),m.click())};return m.addEventListener("keydown",b),s.push({element:m,attribute:"",previous:null,listener:b}),f(!0,"Made it focusable and added Enter/Space support.")}default:break}return f(!1,"No safe automatic fix for this one \u2014 see the suggested fix.")}function g(){if(t=Ye(e),e.autoApply){r=!0;let p=t.issues.filter(m=>m.autoFixable).map(d);r=!1,p.some(m=>m.applied)&&(t=Ye(e))}return a(),t}return{start(){if(!Oe()||n)return;let p=$e(e.root),m=st(p)?p.body:p;m&&(n=new MutationObserver(f=>{r||!f.some(u=>!u.target.closest?.("[data-yuktai-panel]"))||(o&&clearTimeout(o),o=setTimeout(g,e.debounceMs??600))}),n.observe(m,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["alt","aria-label","aria-invalid","tabindex","lang","title"]}),g())},stop(){n?.disconnect(),n=null,o&&clearTimeout(o),o=null,a()},scan:g,explain(p){let m=l(p);return m?[`${m.message}`,`Why it matters: ${m.why}`,`How to fix: ${m.fix}`,`Standard: WCAG ${m.wcag} (${m.severity}).`,m.autoFixable?"I can apply a safe fix for this in the browser.":"This one needs a change in your code."].join(`
`):`No issue "${p}" in the current report. Run a scan first.`},applyFix(p){let m=l(p);if(!m)return{issueId:p,applied:!1,message:"Issue not found. Run a scan first."};r=!0;let f=d(m);return r=!1,f.applied&&g(),f},applyAllFixes(){t||g(),r=!0;let p=(t?.issues??[]).filter(m=>m.autoFixable).map(d);return r=!1,g(),p},undoAll(){let p=s.length;for(r=!0;s.length;){let m=s.pop();m.listener?m.element.removeEventListener("keydown",m.listener):m.previous===null?m.element.removeAttribute(m.attribute):m.element.setAttribute(m.attribute,m.previous)}return r=!1,g(),p},getState:i}}A();A();var El=/^(field|input|value|text|enter|details?|info|data|\*|:)$/i,$l=/^(go|ok|submit|send|click here|>|→|next)$/i,Ll=[[/e-?mail/i,"email","email"],[/phone|mobile|tel/i,"tel","tel"],[/^(full)?name$|full.?name/i,"name"],[/first.?name|given/i,"given-name"],[/last.?name|surname|family/i,"family-name"],[/address|street/i,"street-address"],[/zip|postal|pin.?code|pincode/i,"postal-code"],[/city|town/i,"address-level2"],[/country/i,"country-name"],[/password/i,"current-password","password"],[/dob|birth/i,"bday"]];function Nl(e){let t=e.getAttribute("id");return t&&e.ownerDocument.querySelector(`label[for="${t.replace(/"/g,'\\"')}"]`)?!0:!!e.closest("label")}function ls(e){return K(e,"input,select,textarea").filter(t=>!["hidden","submit","button","reset","image"].includes((t.getAttribute("type")??"text").toLowerCase())).map(t=>({label:Me(t),type:t.tagName==="INPUT"?(t.getAttribute("type")??"text").toLowerCase():t.tagName.toLowerCase(),name:t.getAttribute("name")??t.getAttribute("id")??"",required:t.hasAttribute("required")||t.getAttribute("aria-required")==="true",hasVisibleLabel:Nl(t),selector:We(t),element:t}))}function cs(e,t={}){let n=t.seniorFriendly!==!1,o=t.maxFieldsPerStep??8,r=ls(e),s=[],i=(p,m,f,b)=>s.push({level:p,message:m,suggestion:f,field:b?.label||b?.name,selector:b?.selector});for(let p of r){let m=p.element,f=p.label||p.name||p.type,b=m.getAttribute("placeholder");!p.label&&b?i("problem",`"${b}" uses only a placeholder as its label.`,"Placeholders disappear when typing starts and aren't read by every screen reader. Add a visible label above the field.",p):p.label?!p.hasVisibleLabel&&b&&!m.getAttribute("aria-label")?i("problem",`"${f}" uses only a placeholder as its label.`,"Placeholders disappear when typing starts. Add a visible label above the field.",p):El.test(p.label)&&i("improvement",`The label "${p.label}" is unclear.`,'Say exactly what is needed, e.g. "Mobile number (10 digits)".',p):i("problem",`A ${p.type} field${p.name?` ("${p.name}")`:""} has no label.`,"Add a visible <label> that says exactly what to enter.",p),p.required&&p.label&&!/\*|required|mandatory|తప్పనిసరి|आवश्यक/i.test(p.label)&&i("improvement",`"${f}" is required but the label doesn't say so.`,'Add "(required)" to the label so everyone knows before submitting.',p);let u=`${p.name} ${p.label}`;for(let[y,k,h]of Ll)if(y.test(u)){m.getAttribute("autocomplete")||i("improvement",`"${f}" has no autocomplete hint.`,`Add autocomplete="${k}" so browsers can fill it in (WCAG 1.3.5).`,p),h&&p.type==="text"&&i("improvement",`"${f}" uses type="text".`,`Use type="${h}" for the right mobile keyboard and validation.`,p);break}if(m.getAttribute("aria-invalid")==="true"&&!m.getAttribute("aria-describedby")&&!m.getAttribute("aria-errormessage")&&i("problem",`"${f}" shows an error that isn't connected to the field.`,"Link the error text with aria-describedby and explain how to fix it.",p),n){let y=parseFloat(window.getComputedStyle(m).fontSize)||16;y<16&&i("improvement",`"${f}" text is ${y}px.`,"Use at least 16px in inputs; it is easier to read and stops mobile browsers from zooming.",p)}}r.length>o&&i("improvement",`This form has ${r.length} fields on one screen.`,`Split it into steps of about ${o} fields with a progress indicator.`);let a=K(e,"button,input[type='submit'],input[type='button']");if(a.length===0)i("problem","No submit button found.",'Add a clear <button type="submit"> so the form can be completed with the keyboard.');else if(n){let p=ge(Me(a[a.length-1]));$l.test(p)&&i("improvement",`The button says "${p}".`,'Name the result, e.g. "Send message" or "Book appointment".')}!K(e,"[role='alert'],[aria-live]",{includeHidden:!0}).length&&r.some(p=>p.required)&&i("improvement","No live region for error messages.",'Add an element with role="alert" so errors are announced when the form is submitted.');let l=s.filter(p=>p.level==="problem").length,c=s.length-l,d=Math.max(0,100-l*15-c*4),g=e.getAttribute("aria-label")||ge(e.querySelector("legend,h1,h2,h3")?.textContent)||e.getAttribute("name")||e.getAttribute("id")||"Form";return{name:ye(g,50),selector:We(e),fields:r,findings:s,score:d,summary:s.length===0?`"${ye(g,40)}" looks clear: ${r.length} labelled field(s), nothing to fix.`:`"${ye(g,40)}" has ${r.length} field(s): ${l} problem(s) and ${c} suggestion(s). Score ${d}/100.`}}function _t(e={}){let t=$e(e.root);return t?K(t,"form,[role='form']").map(n=>cs(n,e)):[]}function ds(e){let t=$e(e),n={title:"",description:"",language:"",headings:[],landmarks:{},counts:{links:0,buttons:0,images:0,forms:0,tables:0,fields:0},unlabeledFields:[],imagesWithoutAlt:[],purpose:""};if(!t)return n;let o=st(t)?t:t.ownerDocument,r=K(t,"h1,h2,h3,h4,h5,h6").map(d=>({level:Number(d.tagName[1]),text:ye(d.textContent??"",80)})),s={};for(let[d,g]of Object.entries({header:"header,[role='banner']",navigation:"nav,[role='navigation']",main:"main,[role='main']",search:"search,[role='search']",footer:"footer,[role='contentinfo']"}))s[d]=K(t,g).length;let i=K(t,"input,select,textarea").filter(d=>!["hidden","submit","button","reset","image"].includes((d.getAttribute("type")??"text").toLowerCase())),a=i.filter(d=>!Me(d)).map(d=>({type:d.tagName==="INPUT"?d.getAttribute("type")??"text":d.tagName.toLowerCase(),hint:d.getAttribute("placeholder")||d.getAttribute("name")||"",selector:We(d)})),l=K(t,"img:not([alt])").map(d=>({src:d.getAttribute("src")??"",selector:We(d)})),c={title:o.title,description:ge(o.querySelector('meta[name="description"]')?.getAttribute("content")),language:o.documentElement.getAttribute("lang")??"",headings:r,landmarks:s,counts:{links:K(t,"a[href]").length,buttons:K(t,"button,[role='button'],input[type='submit']").length,images:K(t,"img").length,forms:K(t,"form,[role='form']").length,tables:K(t,"table,[role='grid'],[role='table']").length,fields:i.length},unlabeledFields:a,imagesWithoutAlt:l,purpose:""};return c.purpose=Ml(c,i),c}function Ml(e,t){let n=e.headings.find(i=>i.level===1)?.text||e.title||"This page",o=t.map(i=>`${i.getAttribute("type")} ${i.getAttribute("name")} ${Me(i)}`).join(" ").toLowerCase(),r=[];/password/.test(o)?r.push("sign in or create an account"):(/search|query|వెతుకు/.test(o)||e.landmarks.search)&&r.push("search"),/message|comment|feedback|contact|enquiry/.test(o)&&r.push("send a message"),/card|payment|upi|amount/.test(o)&&r.push("make a payment"),e.counts.tables&&r.push(`browse ${e.counts.tables} table(s) of data`),!r.length&&e.counts.forms&&r.push(`fill in ${e.counts.forms} form(s)`),r.length||r.push("read content");let s=e.headings.filter(i=>i.level===2).slice(0,5).map(i=>i.text);return[`"${n}" lets you ${r.join(", ")}.`,e.description?`It describes itself as: ${ye(e.description,140)}`:"",s.length?`Main sections: ${s.join(" \xB7 ")}.`:""].filter(Boolean).join(" ")}var Pl=[["missing-labels",/label|unlabel|లేబుల్/i],["images",/image|alt text|picture|photo|చిత్ర/i],["structure",/heading|structure|outline|section|landmark|శీర్షిక/i],["forms",/form|field|input|ఫారం/i],["links",/link|లింక్/i],["counts",/how many|count|ఎన్ని/i],["purpose",/what (does|is)|purpose|about|summar|explain|ఏమి|గురించి/i]];function us(e){for(let[t,n]of Pl)if(n.test(e))return t;return"unknown"}async function tr(e,t={}){let n=ds(t.root),o=us(e);switch(o){case"missing-labels":return n.unlabeledFields.length?{intent:o,answer:`${n.unlabeledFields.length} of ${n.counts.fields} field(s) have no label: ${n.unlabeledFields.map(r=>`${r.type}${r.hint?` ("${r.hint}")`:""}`).join(", ")}.`,targets:n.unlabeledFields.map(r=>r.selector),suggestions:["Add a visible <label for=\u2026> to each field.","Run the Accessibility Copilot to add aria-labels from placeholders as a quick fix."]}:{intent:o,answer:`All ${n.counts.fields} form field(s) have labels.`,targets:[],suggestions:[]};case"images":return{intent:o,answer:n.imagesWithoutAlt.length?`${n.imagesWithoutAlt.length} of ${n.counts.images} image(s) have no alt text.`:`All ${n.counts.images} image(s) have alt text.`,targets:n.imagesWithoutAlt.map(r=>r.selector),suggestions:n.imagesWithoutAlt.length?['Describe meaningful images in alt; use alt="" for decorative ones.']:[]};case"structure":{let r=n.headings.slice(0,15).map(i=>`${"  ".repeat(i.level-1)}h${i.level} ${i.text}`).join(`
`),s=Object.entries(n.landmarks).filter(([,i])=>i===0).map(([i])=>i);return{intent:o,answer:`${n.headings.length} heading(s).
${r}${s.length?`
Missing landmarks: ${s.join(", ")}.`:""}`,targets:[],suggestions:s.includes("main")?["Wrap the primary content in <main>."]:[]}}case"forms":{let r=_t({root:t.root});return{intent:o,answer:r.length?r.map(s=>s.summary).join(`
`):"There are no forms on this page.",targets:r.flatMap(s=>s.findings.map(i=>i.selector).filter(i=>!!i)),suggestions:r.flatMap(s=>s.findings.slice(0,3).map(i=>i.suggestion))}}case"links":case"counts":{let r=n.counts;return{intent:o,answer:`${r.links} links, ${r.buttons} buttons, ${r.fields} form fields in ${r.forms} form(s), ${r.images} images, ${r.tables} tables.`,targets:[],suggestions:[]}}case"purpose":case"unknown":{let r=n.purpose;if(t.summarize)try{let i=$e(t.root),a=ge((i&&st(i)?i.body:i)?.textContent).slice(0,4e3);r=await t.summarize(a)||r}catch{}let s=[];return n.unlabeledFields.length&&s.push(`${n.unlabeledFields.length} form field(s) need labels.`),n.imagesWithoutAlt.length&&s.push(`${n.imagesWithoutAlt.length} image(s) need alt text.`),{intent:o,answer:r,targets:[],suggestions:s}}}}A();var _e=e=>String(e??"").normalize("NFC").toLowerCase().replace(/\s+/g," ").trim(),Fl=new Set("show me find list get give which who what all the a an rows row records record entries with where that are is have has having and or of for in on to please display only those whose any".split(" "));function mn(e){let t=_e(e).replace(/(₹|rs\.?|inr|\$|usd|€|£)/g," ").match(/(-?\d[\d,]*(?:\.\d+)?|-?\.\d+)\s*(k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion)?(?![\p{L}])/u);if(!t)return null;let n=Number(t[1].replace(/,/g,""));if(!Number.isFinite(n))return null;let o=t[2]??"",r=/^k|thousand/.test(o)?1e3:/^la/.test(o)?1e5:/^(crore|cr)/.test(o)?1e7:/^(m|mn|million)$/.test(o)?1e6:/^(bn|billion)$/.test(o)?1e9:1;return n*r}function ms(e){let t=new Set([_e(e.label),_e(e.key),_e(e.key.replace(/[_-]+/g," ").replace(/([a-z])([A-Z])/g,"$1 $2"))]);for(let n of Array.from(t))n.endsWith("s")?t.add(n.slice(0,-1)):t.add(`${n}s`);return Array.from(t).filter(n=>n.length>1)}function Pe(e,t,n){let o=` ${_e(e)} `,r;for(let s of t)if(!(n&&(s.type??"text")!==n))for(let i of ms(s)){let a=i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${a}($|[^\\p{L}\\p{M}\\p{N}])`,"u").test(o)&&(!r||i.length>r.length)&&(r={column:s,length:i.length})}return r?.column}var Gl=/amount|balance|total|price|salary|value|due|revenue|cost|fee|sales|outstanding|paid/i;function nr(e){let t=e.filter(n=>n.type==="number");return t.find(n=>Gl.test(`${n.key} ${n.label}`))??t[0]}var gn=/(>=|=>|>|\bover\b|\babove\b|\bmore than\b|\bgreater than\b|\bexceeds?\b|\bexceeding\b|\bhigher than\b|\bat least\b|\bminimum\b|\bmin\b|కంటే ఎక్కువ)/,or=/(<=|=<|<|\bunder\b|\bbelow\b|\bless than\b|\blower than\b|\bat most\b|\bmaximum\b|\bmax\b|\bup to\b|కంటే తక్కువ)/,ps=/\b(after|since|from)\b/,zl=/\b(before|until|till)\b/,Ol="(?:\\s*(?:k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion))?",rr=`(?:\u20B9|rs\\.?\\s*|\\$)?\\s*-?\\d[\\d,]*(?:\\.\\d+)?${Ol}`;function lt(e,t,n={}){let o={filters:[],search:[],sort:null,limit:null,notes:[],explanation:""},r=_e(e).replace(/[?!]+/g," ").replace(/\.(?!\d)/g," ").trim(),s=[],i=r.match(/\b(top|first|bottom|last|lowest|highest)\s+(\d+)\b/);i&&(o.limit=Number(i[2]),r=r.replace(i[0],` ${i[1]} `));let a=r.match(/\b(?:sort(?:ed)?|order(?:ed)?)\s+by\s+([\p{L}\p{M}\p{N} _]+?)(?:\s+(asc|ascending|desc|descending))?(?=$|,|\band\b|\bthen\b)/u),l=r.match(/\b(top|highest|largest|biggest|most|bottom|lowest|smallest|least)\b(?:\s+\d+)?\s+(?:by\s+)?([\p{L}\p{M}\p{N} _]+)/u);if(a){let f=Pe(a[1],t);f&&(o.sort={key:f.key,direction:/^desc/.test(a[2]??"")?"desc":"asc"},r=r.replace(a[0]," "))}else if(l){let f=Pe(l[2],t,"number")??Pe(l[2],t)??nr(t);if(f){let b=/top|highest|largest|biggest|most/.test(l[1]);o.sort={key:f.key,direction:b?"desc":"asc"},r=r.replace(new RegExp(`\\b${l[1]}\\b`)," "),!i&&/top|bottom/.test(l[1])&&(o.limit=10)}}let c=new RegExp(`\\bbetween\\s+(${rr}|\\d{4}-\\d{2}-\\d{2})\\s+(?:and|to|-)\\s+(${rr}|\\d{4}-\\d{2}-\\d{2})`,"u"),d;for(;d=r.match(c);){let f=r.slice(Math.max(0,(d.index??0)-40),d.index??0),b=/\d{4}-\d{2}-\d{2}/.test(d[1]),u=b?Pe(f,t,"date")??t.find(h=>h.type==="date"):Pe(f,t,"number")??nr(t),y=b?d[1]:mn(d[1]),k=b?d[2]:mn(d[2]);u&&y!==null&&k!==null&&(o.filters.push({key:u.key,operator:"between",value:[y,k]}),s.push(`${u.label} between ${d[1]} and ${d[2]}`)),r=r.replace(d[0]," ")}let g=r.split(/\s*(?:(?<!\d),|,(?!\d)|;|\band\b|(?<!(?:starts?|starting|ends?|ending|begins?|beginning)\s)\bwith\b|\bwhere\b|\bwho\b|\bthat\b|&|మరియు)\s*/u).map(f=>f.trim()).filter(Boolean),p=t.filter(f=>(f.type??"text")==="text"),m=new Map;for(let f of p){let b=new Set;for(let u of(n.data??[]).slice(0,5e3)){let y=_e(u[f.key]);if(y&&y.length<=40&&b.add(y),b.size>300)break}b.size&&b.size<=300&&m.set(f.key,b)}for(let f of g){let b=o.filters.length,u=Pe(f,t),y=f.match(new RegExp(rr,"u")),k=f.match(/\d{4}-\d{2}-\d{2}/);if(k&&(ps.test(f)||zl.test(f)||gn.test(f)||or.test(f))){let h=(u?.type==="date"?u:void 0)??t.find(S=>S.type==="date");if(h){let S=ps.test(f)||gn.test(f);o.filters.push({key:h.key,operator:S?"greaterThan":"lessThan",value:k[0]}),s.push(`${h.label} ${S?"after":"before"} ${k[0]}`)}}else if(y&&(gn.test(f)||or.test(f)||u?.type==="number"&&/\b(is|equals?)\b|=/.test(f))){let h=u?.type==="number"?u:void 0;h||(h=nr(t),h&&o.notes.push(`Assumed "${f}" refers to ${h.label}.`));let S=mn(y[0]);if(h&&S!==null){let w=/at least|minimum|\bmin\b|>=|=>|at most|maximum|\bmax\b|up to|<=|=</.test(f);gn.test(f)?(o.filters.push({key:h.key,operator:"greaterThan",value:w?S-1e-9:S}),s.push(`${h.label} ${w?"\u2265":">"} ${S.toLocaleString("en-IN")}`)):or.test(f)?(o.filters.push({key:h.key,operator:"lessThan",value:w?S+1e-9:S}),s.push(`${h.label} ${w?"\u2264":"<"} ${S.toLocaleString("en-IN")}`)):(o.filters.push({key:h.key,operator:"equals",value:S}),s.push(`${h.label} = ${S.toLocaleString("en-IN")}`))}}else{let h=f.match(/\b(?:starts?|starting|begins?|beginning)\s+with\s+(.+)$/),S=f.match(/\b(?:ends?|ending)\s+with\s+(.+)$/),w=f.match(/\b(?:contains?|containing|including|includes?|mentions?)\s+(.+)$/),R=f.match(/\b(?:is|equals?|=|:)\s+(.+)$/),E=h??S??w??R;if(E){let P=u??p[0],H=E[1].replace(/^["'“‘]|["'”’]$/g,"").trim();if(P&&H){let O=h?"startsWith":S?"endsWith":w?"contains":"equals";o.filters.push({key:P.key,operator:O,value:H}),s.push(`${P.label} ${O==="equals"?"is":O==="contains"?"contains":O==="startsWith"?"starts with":"ends with"} "${H}"`),u||o.notes.push(`Assumed "${f}" refers to ${P.label}.`)}}}if(o.filters.length===b)for(let[h,S]of m){let w="";for(let R of S){if(R.length<2||R.length<=w.length)continue;let E=R.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${E}($|[^\\p{L}\\p{M}\\p{N}])`,"u").test(f)&&(w=R)}if(w){let R=t.find(E=>E.key===h);o.filters.push({key:h,operator:"equals",value:w}),s.push(`${R.label} is "${w}"`)}}if(o.filters.length===b){let h=f.split(/\s+/).filter(w=>!Fl.has(w)&&!/^(top|first|bottom|last|lowest|highest|by|desc|asc|sort(ed)?)$/.test(w)),S=h.length>0&&h.every(w=>t.some(R=>ms(R).includes(w)));if(h.length&&!S&&!(u&&h.length===1)){let w=h.join(" ");/^(customers?|users?|people|items?|entries|poems?|orders?|products?|employees?|students?|members?)$/.test(w)||(o.search.push(w),s.push(`any column contains "${w}"`))}}}if(o.sort){let f=t.find(b=>b.key===o.sort.key)?.label??o.sort.key;s.push(`sorted by ${f} ${o.sort.direction==="desc"?"high \u2192 low":"low \u2192 high"}`)}return o.limit&&s.push(`first ${o.limit}`),o.explanation=s.length?`Showing rows where ${s.join(", ")}.`:"No conditions understood \u2014 showing all rows.",o}function Dl(e,t,n){return n==="number"?(Number(e)||0)-(Number(t)||0):n==="date"?(new Date(String(e)).getTime()||0)-(new Date(String(t)).getTime()||0):String(e??"").localeCompare(String(t??""),void 0,{numeric:!0})}function Ke(e,t,n){let o=Ve(e,t,n.filters);for(let r of n.search)o=o.filter(s=>t.some(i=>_e(s[i.key]).includes(r)));if(n.sort){let r=t.find(i=>i.key===n.sort.key),s=n.sort.direction==="desc"?-1:1;o=[...o].sort((i,a)=>s*Dl(i[n.sort.key],a[n.sort.key],r?.type))}return n.limit&&(o=o.slice(0,n.limit)),o}function fs(e,t,n={}){let o=lt(e,t.columns,{data:t.data}),r=Ke(t.data,t.columns,o),s=r.map(a=>be(a,t.rowKey)).filter(Boolean);n.apply!==!1&&(o.filters.length&&t.onFiltersChange?.(o.filters),o.sort&&t.onSortChange?.(o.sort),s.length&&t.onHighlightRows?.(s));let i=r.length?`${r.length} row(s) found. ${o.explanation}${o.notes.length?` (${o.notes.join(" ")})`:""}`:`No rows match. ${o.explanation}`;return{rows:r,ids:s,parsed:o,message:i}}function gs(e,t){let n=(e.length-1)*t,o=Math.floor(n),r=n-o;return e[o+1]!==void 0?e[o]+r*(e[o+1]-e[o]):e[o]}function fn(e,t,n={}){let o=n.factor??1.5,r=[],s=t.filter(c=>c.type==="number"&&(!n.columns||n.columns.includes(c.key))),i=c=>c.toLocaleString("en-IN",{maximumFractionDigits:2});for(let c of s){let d=e.map(y=>Number(y[c.key])).filter(y=>Number.isFinite(y));if(d.length<5)continue;let g=[...d].sort((y,k)=>y-k),p=gs(g,.25),m=gs(g,.75),f=m-p;if(f===0)continue;let b=p-o*f,u=m+o*f;for(let y of e){let k=Number(y[c.key]);!Number.isFinite(k)||k>=b&&k<=u||r.push({rowId:be(y,n.rowKey),column:c.key,label:c.label,value:k,kind:k>u?"high":"low",reason:`${c.label} ${i(k)} is far ${k>u?"above":"below"} the typical range (${i(p)}\u2013${i(m)}).`})}}let a=n.rowKey??"id",l=new Map;for(let c of e){let d=JSON.stringify(t.filter(m=>m.key!==a).map(m=>_e(c[m.key]))),g=be(c,n.rowKey),p=l.get(d);p!==void 0?r.push({rowId:g,column:a,label:"Row",value:g,kind:"duplicate",reason:`Row ${g} has the same values as row ${p}.`}):l.set(d,g)}return r}function hn(e,t){if(!e.length)return"No rows to summarise.";let n=[`${e.length} row(s).`],o=r=>r.toLocaleString("en-IN",{maximumFractionDigits:2});for(let r of t){let s=e.map(i=>i[r.key]);if(r.type==="number"){let i=s.map(Number).filter(Number.isFinite);if(!i.length)continue;let a=i.reduce((l,c)=>l+c,0);n.push(`${r.label}: total ${o(a)}, average ${o(a/i.length)}, range ${o(Math.min(...i))}\u2013${o(Math.max(...i))}.`)}else if(r.type==="date"){let i=s.map(l=>new Date(String(l)).getTime()).filter(Number.isFinite);if(!i.length)continue;let a=l=>new Date(l).toISOString().slice(0,10);n.push(`${r.label}: from ${a(Math.min(...i))} to ${a(Math.max(...i))}.`)}else{let i=new Map;for(let l of s){let c=String(l??"").trim();c&&i.set(c,(i.get(c)??0)+1)}if(i.size===0||i.size>Math.max(8,e.length/3))continue;let a=Array.from(i.entries()).sort((l,c)=>c[1]-l[1]).slice(0,4);n.push(`${r.label}: ${a.map(([l,c])=>`${l} (${c})`).join(", ")}.`)}}return n.join(`
`)}function ir(e,t){let n=_e(e);if(/unusual|anomal|outlier|odd|strange|suspicious|duplicate|అసాధారణ/.test(n)){let r=fn(t.data,t.columns,{rowKey:t.rowKey}),s=Array.from(new Set(r.map(a=>a.rowId)));s.length&&t.onHighlightRows?.(s);let i=new Set(s);return{kind:"anomalies",message:r.length?`${s.length} unusual row(s):
${r.slice(0,10).map(a=>`\u2022 ${a.reason}`).join(`
`)}`:"Nothing unusual found.",ids:s,rows:t.data.filter(a=>i.has(be(a,t.rowKey))),anomalies:r}}if(/summar|overview|describe|సారాంశం/.test(n)){let r=Ve(t.data,t.columns,t.filters??[]);return{kind:"summary",message:hn(r,t.columns),ids:[],rows:r}}let o=fs(e,t);return{kind:"query",message:o.message,ids:o.ids,rows:o.rows}}A();var Wl=/\b(off|disable|stop|remove|no more|turn off|switch off|deactivate)\b|ఆఫ్|ఆపు|తీసివేయి|बंद/i,Bl=[{pattern:/high contrast|contrast|హై కాంట్రాస్ట్|కాంట్రాస్ట్/i,key:"highContrast",name:"High contrast"},{pattern:/dark mode|dark theme|night mode|డార్క్ మోడ్|చీకటి/i,key:"darkMode",name:"Dark mode"},{pattern:/reduce motion|less motion|stop animation|animations?|కదలికలు/i,key:"reduceMotion",name:"Reduced motion"},{pattern:/large targets?|bigger buttons?|big buttons?|larger buttons?|పెద్ద బటన్/i,key:"largeTargets",name:"Large targets"},{pattern:/dyslexia|readable font|easy font/i,key:"dyslexiaFont",name:"Dyslexia-friendly font"},{pattern:/speak on focus|read aloud|read out|screen reader|speech|చదివి వినిపించు/i,key:"speechEnabled",name:"Speak on focus"},{pattern:/skip links?/i,key:"showSkipLinks",name:"Skip links"}],Hl=[[/deuteranop|green.?blind/i,"deuteranopia"],[/protanop|red.?blind/i,"protanopia"],[/tritanop|blue.?blind/i,"tritanopia"],[/grey ?scale|gray ?scale|achromat|black and white/i,"achromatopsia"]],sr=.1,hs=.8,bs=1.3;function ys(e,t={}){let n=e.trim().toLowerCase();if(!n)return null;if(/\b(next|down)\s+(row|line|record|item)\b|తర్వాతి (వరుస|అంశం)/.test(n))return{type:"grid",action:"next-row",say:"Next row."};if(/\b(previous|prev|back|up)\s+(row|line|record|item)\b|ముందరి (వరుస|అంశం)|వెనుక (వరుస|అంశం)/.test(n))return{type:"grid",action:"previous-row",say:"Previous row."};if(/\bfirst\s+(row|record|item)\b|మొదటి (వరుస|అంశం)/.test(n))return{type:"grid",action:"first-row",say:"First row."};if(/\blast\s+(row|record|item)\b|చివరి (వరుస|అంశం)/.test(n))return{type:"grid",action:"last-row",say:"Last row."};if(/\b(open|expand|read)\s+(this\s+)?(row|record|item)\b|ఈ (వరుస|అంశం) తెరువు/.test(n))return{type:"grid",action:"open-row",say:"Opening row."};if(/\b(reset|default|restore)\b.*\b(settings?|accessibility|everything|all)\b|^reset$|రీసెట్/.test(n))return{type:"reset",say:"Accessibility settings reset."};let o=t.fontSizeMultiplier??1,r=i=>Math.round(Math.min(bs,Math.max(hs,i))*100)/100;if(/\b(bigger|larger|increase|zoom in)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(bigger|larger|up)\b|పెద్ద అక్షరాలు|అక్షరాలు పెద్ద/.test(n)){let i=r(o+sr);return{type:"setting",patch:{fontSizeMultiplier:i},say:`Text size ${Math.round(i*100)}%.`}}if(/\b(smaller|decrease|reduce|zoom out)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(smaller|down)\b|చిన్న అక్షరాలు|అక్షరాలు చిన్న/.test(n)){let i=r(o-sr);return{type:"setting",patch:{fontSizeMultiplier:i},say:`Text size ${Math.round(i*100)}%.`}}if(/\b(normal|default|reset)\b.*\b(text|font)\s*(size)?\b/.test(n))return{type:"setting",patch:{fontSizeMultiplier:1},say:"Text size 100%."};let s=Wl.test(n);for(let[i,a]of Hl)if(i.test(n))return s?{type:"setting",patch:{colorBlindMode:"none"},say:"Colour filter off."}:{type:"setting",patch:{colorBlindMode:a},say:`${a} filter on.`};if(/colou?r.?blind/.test(n)&&s)return{type:"setting",patch:{colorBlindMode:"none"},say:"Colour filter off."};for(let i of Bl){if(!i.pattern.test(n))continue;let a=/\btoggle\b/.test(n)?!t[i.key]:!s;return i.key==="reduceMotion"&&!/reduce motion|less motion|కదలికలు తగ్గించు/.test(n)&&/animations?/.test(n)&&(a=s||/\bno\b/.test(n)),{type:"setting",patch:{[i.key]:a},say:`${i.name} ${a?"on":"off"}.`}}return null}var ar={highContrast:!1,darkMode:!1,reduceMotion:!1,largeTargets:!1,dyslexiaFont:!1,speechEnabled:!1,colorBlindMode:"none",fontSizeMultiplier:1};function xs(e,t={}){if(!Oe())return null;let n=t.root??document,o=t.rowSelector??"[data-yuktai-row-id], [role='row']",r=Array.from(n.querySelectorAll(o)).filter(c=>!c.querySelector("th,[role='columnheader']"));if(!r.length)return null;let s=document.activeElement?.closest(o),i=s?r.indexOf(s):-1;if(e==="open-row"){let c=i>=0?r[i]:r[0];return c.click(),c}let a=e==="first-row"?0:e==="last-row"?r.length-1:e==="next-row"?Math.min(r.length-1,i+1):Math.max(0,i-1),l=r[a];return l.hasAttribute("tabindex")||l.setAttribute("tabindex","-1"),l.focus(),l.scrollIntoView?.({block:"nearest"}),l}function lr(e={}){let t={enabled:!0,...ar,...e.initial},n=null,o=!1,r=async c=>e.apply?e.apply(c):ke.execute(c),s=c=>{if(e.speak===!1||!Oe()||!("speechSynthesis"in window))return;let d=new SpeechSynthesisUtterance(c);d.lang=e.lang??"en-IN",window.speechSynthesis.cancel(),window.speechSynthesis.speak(d)};async function i(c){let d=ys(c,t);if(e.onTranscript?.(c,d),!d)return null;if(d.type==="grid"){let g=xs(d.action,{root:e.gridRoot});return s(g?d.say:"No table rows found."),d}return t=d.type==="reset"?{...t,...ar}:{...t,...d.patch},await r(t),s(d.say),d}function a(){if(!Oe()||o)return o;let c=window,d=c.SpeechRecognition??c.webkitSpeechRecognition;return d?(n=new d,n.lang=e.lang??"en-IN",n.continuous=!0,n.interimResults=!1,n.onresult=g=>{let p=g.results,m=p[p.length-1];m?.[0]?.transcript&&i(m[0].transcript)},n.onend=()=>{o&&n?.start()},n.onerror=g=>{(g.error==="not-allowed"||g.error==="service-not-allowed")&&(o=!1)},o=!0,n.start(),!0):!1}function l(){o=!1,n?.stop(),n=null}return{start:a,stop:l,handle:i,isListening:()=>o,getConfig:()=>({...t})}}A();var _l=new Set("a an the is are was were be to of and or in on at for with what which who whom how why when where does do did this that these those it its from by as about any all please tell me show give".split(" "));function qt(e){return(e.normalize("NFC").toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu)??[]).filter(t=>t.length>1&&!_l.has(t))}function ws(e,t=600){let n=$e(e);if(!n)return[];let o=[],r="",s="",i=()=>{s.trim()&&o.push({id:`page-${o.length+1}`,source:"page",text:s.trim(),ref:r||void 0}),s=""};for(let a of K(n,"h1,h2,h3,h4,p,li,td,th,dt,dd,blockquote,figcaption,label,summary")){if(a.querySelector("p,li,h1,h2,h3,h4"))continue;let l=ge(a.textContent);if(l){if(/^H[1-4]$/.test(a.tagName)){i(),r=l,s=`${l}. `;continue}s.length+l.length>t&&i(),s+=`${l} `}}return i(),o}function vs(e,t,n="id"){return e.map((o,r)=>{let s=o,i=String(s[n]??r+1);return{id:`grid-${i}`,source:"grid",ref:i,text:t.map(a=>`${a.label}: ${String(s[a.key]??"")}`).join(". ")}})}function cr(e={}){let t=[],n=[],o=new Map,r=0;function s(){t=[...e.includePage===!1?[]:ws(e.root),...e.rows&&e.columns?vs(e.rows,e.columns,e.rowKey):[],...(e.documents??[]).map(l=>({id:l.id,source:"custom",text:l.text}))],n=t.map(l=>qt(l.text)),o=new Map;for(let l of n)for(let c of new Set(l))o.set(c,(o.get(c)??0)+1);r=n.reduce((l,c)=>l+c.length,0)/Math.max(1,n.length)}s();function i(l,c=5){let d=qt(l);if(!d.length)return[];let g=n.length;return n.map((m,f)=>{let b=0;for(let u of d){let y=0;for(let h of m)(h===u||u.length>=4&&h.startsWith(u)||h.length>=4&&u.startsWith(h))&&y++;if(!y)continue;let k=Math.log(1+(g-(o.get(u)??1)+.5)/((o.get(u)??1)+.5));b+=k*(y*2.2/(y+1.2*(.25+.75*(m.length/(r||1)))))}return{...t[f],score:b}}).filter(m=>m.score>0).sort((m,f)=>f.score-m.score).slice(0,c)}async function a(l,c={}){let d=i(l,c.k??4);if(!d.length)return{answer:"I couldn't find anything about that on this page or in the data.",hits:d,generated:!1};if(c.generate)try{let f=d.map((u,y)=>`[${y+1}] ${u.text}`).join(`
`),b=await c.generate(l,f);if(b?.trim())return{answer:b.trim(),hits:d,generated:!0}}catch{}let g=new Set(qt(l)),p=d.flatMap(f=>f.text.split(/(?<=[.!?।])\s+|\.\s+(?=\p{Lu})/u).map(b=>({s:b.trim(),h:f}))).map(({s:f,h:b})=>({s:f,h:b,overlap:qt(f).filter(u=>g.has(u)).length})).filter(f=>f.s&&f.overlap>0).sort((f,b)=>b.overlap-f.overlap).slice(0,3);return{answer:p.length?p.map(f=>f.h.source==="grid"?`Row ${f.h.ref}: ${f.s}`:f.s).join(`
`):d[0].text.slice(0,300),hits:d,generated:!1}}return{search:i,ask:a,rebuild:s,update(l){Object.assign(e,l),s()},size:()=>t.length}}A();var Ts="highlight|mark|flag|sort|order|rank|arrange|summari[sz]e|summary|recap|count|how many|open|select|pick|show|filter|find|list|clear|reset|remove|detect|spot|tell";function bn(e){return e.replace(/[?!]/g," ").split(/\s*(?:;|\.(?!\d)\s*|,?\s*\band then\b|,?\s*\bthen\b|,?\s*\bafter that\b|,?\s*\bfinally\b|,?\s*\bnext\b|ఆ తర్వాత)\s*/i).flatMap(o=>o.split(new RegExp(`\\s*(?:,|\\band\\b)\\s+(?=(?:${Ts})\\b)`,"i"))).map(o=>o.trim()).filter(o=>o.length>1).map(o=>({action:ql(o),text:o}))}function ql(e){let t=e.toLowerCase();return/^(clear|reset|remove)\b/.test(t)?"clear":/unusual|anomal|outlier|suspicious|odd ones|duplicate/.test(t)?"anomalies":/summari[sz]e|summary|what changed|recap|overview/.test(t)?"summarize":/^(highlight|mark|flag)\b/.test(t)?"highlight":/^(sort|order|rank|arrange)\b/.test(t)?"sort":/^(count|how many)\b/.test(t)?"count":/^(open|go to)\b/.test(t)&&!/filtered|results?/.test(t)?"open":/^(select|pick)\b/.test(t)?"select":"filter"}function jl(e){return e.replace(new RegExp(`^\\s*(?:${Ts}|open|go to)\\b`,"i")," ").replace(/\b(the|filtered|results?|rows?|records?|entries|items?|ones|them|those|only|me|all)\b/gi," ").replace(/\s+/g," ").trim()}function ks(e,t){let n=t.find(s=>s.key===e.key)?.label??e.key,o=Array.isArray(e.value)?`${e.value[0]}\u2013${e.value[1]}`:typeof e.value=="number"?e.value.toLocaleString("en-IN",{maximumFractionDigits:2}):`"${e.value}"`,r={contains:"contains",equals:"is",startsWith:"starts with",endsWith:"ends with",greaterThan:">",lessThan:"<",between:"between"}[e.operator];return`${n} ${r} ${o}`}async function dr(e,t,n={}){let o=bn(e),{columns:r,data:s}=t,i=[...t.filters??[]],a=[],l=null,c=[],d=()=>Ke(s,r,{filters:i,search:a,sort:l,limit:null,notes:[],explanation:""}),g={rows:d().length,filters:[...i]},p=[],m=()=>({...t,filters:i});for(let b=0;b<o.length;b++){let u=o[b],y=jl(u.text),k;try{switch(u.action){case"clear":{i=[],a=[],l=null,c=[],t.onFiltersChange?.([]),t.onSortChange?.(null),t.onHighlightRows?.([]),k={...u,success:!0,message:`Cleared filters, sorting and highlights. ${s.length} row(s) shown.`};break}case"filter":{let h=lt(y,r,{data:s});if(!h.filters.length&&!h.search.length&&!h.sort){k={...u,success:!0,message:`Showing ${d().length} row(s) with the current filters.`};break}for(let R of h.filters)i=[...i.filter(E=>E.key!==R.key),R];a=[...a,...h.search],h.sort&&(l=h.sort,t.onSortChange?.(l)),t.onFiltersChange?.(i);let S=d(),w=S.map(R=>be(R,t.rowKey)).filter(Boolean);h.search.length&&w.length&&(c=w,t.onHighlightRows?.(w)),k={...u,success:!0,message:`${S.length} row(s) now shown. ${h.explanation}`,ids:w};break}case"highlight":{let h=d(),S=lt(y,r,{data:h}),R=(S.filters.length||S.search.length?Ke(h,r,{...S,sort:null,limit:S.limit}):h).map(P=>be(P,t.rowKey)).filter(Boolean);if(!R.length){k={...u,success:!1,message:`Nothing to highlight for "${y||"all rows"}".`};break}let E=xt(m(),R);E.success&&(c=E.data??R),k={...u,success:E.success,message:E.success?`Highlighted ${c.length} row(s)${y?` matching "${y}"`:""}.`:E.message,ids:c};break}case"sort":{let S=lt(u.text,r,{data:s}).sort;if(!S){let R=Pe(y,r);R&&(S={key:R.key,direction:/desc|high|large|big|most|newest|latest|z.?to.?a/i.test(u.text)?"desc":"asc"})}if(!S){k={...u,success:!1,message:`Which column should I sort by? Columns: ${r.map(R=>R.label).join(", ")}.`};break}l=S,t.onSortChange?.(l);let w=r.find(R=>R.key===l.key)?.label??l.key;k={...u,success:!0,message:`Sorted by ${w} (${l.direction==="desc"?"high \u2192 low":"low \u2192 high"}).`};break}case"count":{k={...u,success:!0,message:`${d().length} row(s) shown${c.length?`, ${c.length} highlighted`:""}.`};break}case"anomalies":{let h=d(),S=fn(h,r,{rowKey:t.rowKey}),w=Array.from(new Set(S.map(R=>R.rowId)));if(w.length){let R=xt(m(),w);R.success&&(c=R.data??w)}k={...u,success:!0,message:S.length?`${w.length} unusual row(s): ${S.slice(0,5).map(R=>R.reason).join(" ")}`:"Nothing unusual in the shown rows.",ids:w};break}case"open":case"select":{let h=d(),w=h.find(P=>y&&be(P,t.rowKey).toLowerCase()===y.toLowerCase())??Ke(h,r,lt(y,r,{data:h}))[0]??(y?void 0:h[0]);if(!w){k={...u,success:!1,message:`No row matches "${y}".`};break}let R=be(w,t.rowKey),E=u.action==="open"?Pt(m(),R):Mt(m(),R);k={...u,success:E.success,message:E.message,ids:[R]};break}case"summarize":{let h=d();k={...u,success:!0,message:`${Ss(g,h.length,i,l,c,r)}
${hn(h,r)}`};break}}}catch(h){k={...u,success:!1,message:`This step failed: ${h instanceof Error?h.message:String(h)}`}}p.push(k),n.onStep?.(k,b,o.length)}let f=d().length;return{steps:p,before:g,after:{rows:f,filters:i,sort:l,highlighted:c},summary:Ss(g,f,i,l,c,r)}}function Ss(e,t,n,o,r,s){let i=[`Rows: ${e.rows} \u2192 ${t}.`],a=n.filter(c=>!e.filters.some(d=>JSON.stringify(d)===JSON.stringify(c))),l=e.filters.filter(c=>!n.some(d=>JSON.stringify(c)===JSON.stringify(d)));return a.length&&i.push(`Filters added: ${a.map(c=>ks(c,s)).join("; ")}.`),l.length&&i.push(`Filters removed: ${l.map(c=>ks(c,s)).join("; ")}.`),o&&i.push(`Sorted by ${s.find(c=>c.key===o.key)?.label??o.key} ${o.direction==="desc"?"high \u2192 low":"low \u2192 high"}.`),r.length&&i.push(`${r.length} row(s) highlighted.`),i.join(" ")}A();var xn=e=>{let t=typeof e=="number"?e:Number(String(e??"").replace(/[,₹$%\s]/g,""));return Number.isFinite(t)?t:null},As=e=>{let t=e instanceof Date?e.getTime():new Date(String(e??"")).getTime();return Number.isFinite(t)?t:null};function St(e,t){if(t==="count")return e.length;if(!e.length)return 0;switch(t){case"sum":return e.reduce((n,o)=>n+o,0);case"avg":return e.reduce((n,o)=>n+o,0)/e.length;case"min":return Math.min(...e);case"max":return Math.max(...e)}}function Cs(e,t,n,o="sum"){let r=new Map;for(let s of e){let i=String(s[t]??"\u2014").trim()||"\u2014",a=r.get(i)??[];if(n===null||o==="count")a.push(1);else{let l=xn(s[n]);l!==null&&a.push(l)}r.set(i,a)}return Array.from(r.entries()).map(([s,i])=>({group:s,value:St(i,o),count:i.length})).sort((s,i)=>i.value-s.value)}function pr(e,t,n=1){let o=new Date(e);return o.setHours(0,0,0,0),t==="week"&&o.setDate(o.getDate()-(o.getDay()-n+7)%7),t==="month"&&o.setDate(1),t==="quarter"&&o.setMonth(Math.floor(o.getMonth()/3)*3,1),t==="year"&&o.setMonth(0,1),o}function yn(e,t,n){let o=new Date(e);return t==="day"&&o.setDate(o.getDate()+n),t==="week"&&o.setDate(o.getDate()+7*n),t==="month"&&o.setMonth(o.getMonth()+n),t==="quarter"&&o.setMonth(o.getMonth()+3*n),t==="year"&&o.setFullYear(o.getFullYear()+n),o}function Is(e,t){let n=t.referenceDate?new Date(t.referenceDate):new Date,o=pr(n,t.period,t.weekStartsOn),r=t.toDate===!1?yn(o,t.period,1):new Date(Math.max(n.getTime()+1,o.getTime()+1)),s=yn(o,t.period,-1),i=t.toDate===!1?o:new Date(s.getTime()+(r.getTime()-o.getTime())),a=t.agg??"sum",l=new Map,c=new Map;for(let p of e){let m=As(p[t.dateKey]);if(m===null)continue;let f=m>=o.getTime()&&m<r.getTime()?l:m>=s.getTime()&&m<i.getTime()?c:null;if(!f)continue;let b=t.groupKey?String(p[t.groupKey]??"\u2014"):"All",u=a==="count"?1:xn(p[t.metricKey]);u!==null&&f.set(b,[...f.get(b)??[],u])}let d=new Set([...l.keys(),...c.keys()]),g=Array.from(d).map(p=>{let m=St(l.get(p)??[],a),f=St(c.get(p)??[],a);return{group:p,current:m,previous:f,change:m-f,changePct:f===0?null:(m-f)/Math.abs(f)*100}});return{period:t.period,current:{from:o,to:r},previous:{from:s,to:i},rows:g}}function Rs(e,t,n,o,r="sum"){let s=new Map;for(let i of e){let a=As(i[t]),l=r==="count"?1:xn(i[n]);if(a===null||l===null)continue;let c=pr(new Date(a),o).getTime();s.set(c,[...s.get(c)??[],l])}return Array.from(s.entries()).sort((i,a)=>i[0]-a[0]).map(([i,a])=>({start:new Date(i),value:St(a,r)}))}var Ul=/rate|conversion|ratio|percent|%|score|rating|margin|ctr|avg|average/i;function Vl(e){let t=e.match(/\b(today|yesterday|this|last|previous|past)\s*(day|week|month|quarter|year)?\b/);return t?t[1]==="today"?{period:"day",shift:0}:t[1]==="yesterday"?{period:"day",shift:-1}:t[2]?{period:t[2],shift:t[1]==="this"?0:-1}:null:null}var Ae=e=>e.toLocaleString("en-IN",{maximumFractionDigits:2}),ur=e=>e===null?"new":`${e>0?"+":""}${e.toFixed(1)}%`;function gr(e,t,n,o={}){let r=e.toLowerCase(),s=n.filter(h=>h.type==="number"),i=Pe(r,n,"number")??s.find(h=>/amount|revenue|sales|total|value/i.test(`${h.key} ${h.label}`))??s[0],a=n.find(h=>h.type==="date")??n.find(h=>/date|time|day|created|month/i.test(`${h.key} ${h.label}`)),l=r.match(/\b(?:which|by|per|each|across|every|top|for each)\s+([\p{L}\p{M}\p{N} _]+)/u)?.[1]??"",c=Pe(l,n,"text"),d=/how many|number of|count/.test(r),g=d?"count":/average|avg|mean/.test(r)?"avg":/\btotal\b|\bsum\b/.test(r)?"sum":i&&Ul.test(`${i.key} ${i.label}`)?"avg":"sum",p=/drop|decline|decrease|fell|fall|down|worst|lost|shrink|reduc/.test(r),m=/increase|growth|grew|rise|rose|up\b|best|improv|gain/.test(r),f=/lowest|least|smallest|bottom|worst|minimum/.test(r),b=Vl(r);if(!i&&!d)return{kind:"unknown",answer:"I couldn't find a numeric column to analyse.",table:[]};let u=d?"rows":i.label;if(b&&a&&(m||p||/change|compare|vs|versus/.test(r))){let h=o.referenceDate?new Date(o.referenceDate):new Date,S=b.shift?yn(h,b.period,b.shift):h,R=[...Is(t,{dateKey:a.key,metricKey:i?.key??a.key,groupKey:c?.key,agg:g,period:b.period,referenceDate:S,toDate:b.shift===0}).rows].sort((Y,j)=>p?Y.change-j.change:j.change-Y.change),E=R.map(Y=>({[c?.label??"Group"]:Y.group,Current:Ae(Y.current),Previous:Ae(Y.previous),Change:Ae(Y.change),"Change %":ur(Y.changePct)}));if(!R.length)return{kind:"period-change",answer:`No ${u} data in this ${b.period} or the one before.`,table:E};let P=R[0],H=`${b.shift?"last":"this"} ${b.period} vs the ${b.period} before`,O=P.change===0?"did not change":P.change<0?`dropped ${Ae(Math.abs(P.change))}`:`rose ${Ae(P.change)}`,M=`${u} ${O} (${Ae(P.previous)} \u2192 ${Ae(P.current)}, ${ur(P.changePct)}) \u2014 ${H}.`,$=p&&P.change>=0||m&&P.change<=0;return{kind:"period-change",answer:c?$?`No ${c.label.toLowerCase()} ${p?"dropped":"grew"}. Closest is ${P.group}: ${M}`:`${P.group}: ${M}`:M,table:E}}if(/trend|over time|month by month|week by week/.test(r)&&a&&i){let h=/week/.test(r)?"week":/day|daily/.test(r)?"day":/year/.test(r)?"year":"month",S=Rs(t,a.key,i.key,h,g),w=S.map(H=>({Period:H.start.toISOString().slice(0,10),[i.label]:Ae(H.value)}));if(S.length<2)return{kind:"trend",answer:`Not enough ${h}s of data for a trend.`,table:w};let R=S[0].value,E=S[S.length-1].value,P=S.reduce((H,O)=>O.value>H.value?O:H);return{kind:"trend",answer:`${i.label} went from ${Ae(R)} to ${Ae(E)} over ${S.length} ${h}s (${ur(R?(E-R)/Math.abs(R)*100:null)}). Peak: ${Ae(P.value)} in the ${h} of ${P.start.toISOString().slice(0,10)}.`,table:w}}if(c){let h=Cs(t,c.key,i?.key??null,g),S=f?[...h].reverse():h,w=S.map(E=>({[c.label]:E.group,[`${g} of ${u}`]:Ae(E.value),Rows:E.count}));if(!S.length)return{kind:"group",answer:"No data.",table:w};let R=S[0];return{kind:"group",answer:`${R.group} has the ${f?"lowest":"highest"} ${g==="sum"?"total":g==="avg"?"average":g} ${u}: ${Ae(R.value)} (across ${S.length} ${c.label.toLowerCase()} groups).`,table:w}}let y=d?t.map(()=>1):t.map(h=>xn(h[i.key])).filter(h=>h!==null),k=St(y,g);return{kind:"total",answer:`${g==="avg"?"Average":g==="count"?"Count of":g==="sum"?"Total":g} ${u}: ${Ae(k)} across ${t.length} row(s).`,table:[{Metric:u,Aggregation:g,Value:Ae(k)}]}}A();var Es={high:12,medium:6,low:2};function mr(e={}){let t=$e(e.root),n=[],o=(a,l,c,d,g)=>n.push({category:a,severity:l,message:c,suggestion:d,selector:g?We(g):void 0});if(t&&Oe()){let a=e.minFontSize??14,l=e.maxLineLength??90,c=M=>window.getComputedStyle(M),d=K(t,"h1");d.length===0&&o("hierarchy","medium","There is no h1, so the page has no clear main title.","Add one prominent h1 near the top."),d.length>1&&o("hierarchy","low",`${d.length} h1 headings compete for attention.`,"Keep one h1 and demote the rest.",d[1]);let g=M=>{let $=K(t,M)[0];return $&&parseFloat(c($).fontSize)||0},[p,m,f]=[g("h1"),g("h2"),g("h3")];p&&m&&m>=p&&o("hierarchy","medium",`h2 (${m}px) is as large as or larger than h1 (${p}px).`,"Make each heading level visibly smaller than the one above it."),m&&f&&f>m&&o("hierarchy","low",`h3 (${f}px) is larger than h2 (${m}px).`,"Keep heading sizes in descending order.");let b=Ye({root:e.root,skip:["color-contrast","target-size","duplicate-id","page-title","html-lang","form-error","positive-tabindex"]});for(let M of b.issues.filter($=>$.rule==="heading-order").slice(0,3))o("hierarchy","low",M.message,M.fix,M.element);let u=0,y;for(let M of K(t,"p,li,td,span,a,label,small,div").slice(0,1500)){if(!zt(M))continue;(parseFloat(c(M).fontSize)||16)<a&&(u++,y??=M)}u&&o("readability",u>10?"high":"medium",`${u} text element(s) are smaller than ${a}px, e.g. "${ye(y?.textContent??"",30)}".`,`Use at least ${a}px for body text (16px for senior-friendly pages).`,y);for(let M of K(t,"p").slice(0,200)){let $=c(M),x=parseFloat($.fontSize)||16,Y=M.getBoundingClientRect().width,j=Y/(x*.5);if(Y>0&&j>l&&(M.textContent??"").length>l){o("readability","low",`A paragraph is about ${Math.round(j)} characters wide.`,`Limit text width to ~${l} characters (e.g. max-width: 70ch).`,M);break}let ee=parseFloat($.lineHeight);if(Number.isFinite(ee)&&ee/x<1.3){o("readability","low",`Line height is ${(ee/x).toFixed(2)}\xD7 the font size.`,"Use line-height of at least 1.5 for body text (WCAG 1.4.12).",M);break}}let k=Ye({root:e.root,skip:["html-lang","page-title","image-alt","heading-order","single-h1","landmark-main","form-label","button-name","link-name","positive-tabindex","keyboard-access","duplicate-id","form-error","target-size"]});k.issues.length&&o("readability",k.issues.length>5?"high":"medium",`${k.issues.length} text element(s) have weak contrast. ${k.issues[0].message}`,"Raise contrast to at least 4.5:1 for body text.",k.issues[0].element);let h=Yl();h.length&&o("interaction","high",`Focus outlines are removed by CSS (${h.slice(0,2).join(", ")}) with no replacement.`,"Never remove outlines without a visible :focus-visible style (WCAG 2.4.7).");let S=K(t,cn).filter(M=>{let $=M.getBoundingClientRect();return $.width>0&&$.height>0&&($.width<24||$.height<24)&&!(M.tagName==="A"&&M.closest("p,li"))});S.length&&o("interaction",S.length>5?"high":"medium",`${S.length} control(s) are smaller than 24\xD724px.`,"Give controls at least 24\xD724px, ideally 44\xD744px for touch and seniors.",S[0]);let w=window.innerHeight||800,R=K(t,is).filter(M=>{let $=M.getBoundingClientRect();return $.height>0&&$.top<w});R.length>40&&o("clutter","medium",`${R.length} interactive elements in the first screen.`,"Group secondary actions into menus and keep the first screen focused on one task.");let E=K(t,"button,a[href],[role='button']").filter(M=>{let $=M.getBoundingClientRect();if($.height===0||$.top>w)return!1;let x=c(M).backgroundColor;return!!x&&!/rgba\(0, 0, 0, 0\)|transparent/.test(x)&&!/rgb\(255, 255, 255\)/.test(x)});E.length>4&&o("clutter","medium",`${E.length} filled buttons compete in the first screen.`,"Keep one primary action per view; make the rest secondary (outline or text).",E[0]);let P=new Set,H=new Set;for(let M of K(t,"body *").slice(0,2e3)){if(!zt(M))continue;let $=c(M);P.add($.fontFamily.split(",")[0].replace(/["']/g,"").trim().toLowerCase()),H.add(Math.round(parseFloat($.fontSize)||0))}P.size>4&&o("consistency","low",`${P.size} different font families are used.`,"Stick to 1\u20132 font families (e.g. one Telugu + one Latin)."),H.size>10&&o("consistency","low",`${H.size} different font sizes are used.`,"Use a small type scale (5\u20137 sizes) for a calmer page.");let O=K(t,"img:not([width]):not([height])").filter(M=>!c(M).aspectRatio||c(M).aspectRatio==="auto");O.length>3&&o("consistency","low",`${O.length} images have no width/height, so the layout jumps while loading.`,"Set width and height (or aspect-ratio) on images.",O[0])}let r=["hierarchy","readability","interaction","clutter","consistency"].reduce((a,l)=>{let c=n.filter(d=>d.category===l);return a[l]={score:Math.max(0,100-c.reduce((d,g)=>d+Es[g.severity]*2,0)),findings:c.length},a},{}),s=Math.max(0,100-n.reduce((a,l)=>a+Es[l.severity],0)),i=Object.entries(r).sort((a,l)=>a[1].score-l[1].score)[0];return{score:s,categories:r,findings:n,summary:n.length?`Design score ${s}/100 with ${n.length} finding(s). Weakest area: ${i[0]}.`:"No design issues found by the automatic review."}}function Yl(){let e=[],t=!1,n=o=>{for(let r of Array.from(o)){let s=r.cssRules;s&&n(s);let i=r;if(!i.selectorText||!/:focus/.test(i.selectorText))continue;let a=`${i.style.outline} ${i.style.outlineStyle} ${i.style.outlineWidth}`,l=/\bnone\b|\b0(px)?\b/.test(a),c=!!(i.style.boxShadow&&i.style.boxShadow!=="none")||!!i.style.borderColor||!!i.style.backgroundColor||!!i.style.textDecoration;/:focus-visible/.test(i.selectorText)&&(!l||c)&&(t=!0),l&&!c&&e.push(i.selectorText)}};for(let o of Array.from(document.styleSheets))try{n(o.cssRules)}catch{}return t?[]:e}A();var V=require("react");var C=require("react/jsx-runtime"),Kl=/\b(trend|over time|this (week|month|quarter|year)|last (week|month|quarter|year)|compare|versus|vs)\b|\b(by|per|each|which)\b.*\b(total|average|avg|sum|drop|increase|growth|highest|lowest|most|least)\b|\b(total|average|avg|sum)\b.*\b(by|per|each)\b/i;function Ql(e){let{data:t,rowKey:n="id"}=e,o=(0,V.useMemo)(()=>et(e.columns),[e.columns]),[r,s]=(0,V.useState)([]),[i,a]=(0,V.useState)(null),[l,c]=(0,V.useState)([]),[d,g]=(0,V.useState)(""),[p,m]=(0,V.useState)(null),[f,b]=(0,V.useState)([]),[u,y]=(0,V.useState)([]),[k,h]=(0,V.useState)(!1),S=(0,V.useRef)(r);S.current=r;let w=(0,V.useCallback)(()=>({data:t,columns:o,rowKey:n,filters:S.current,onFiltersChange:H=>{S.current=H,s(H)},onSortChange:a,onHighlightRows:c,onOpenRow:e.onOpenRow,onSelectRow:H=>c([H])}),[t,o,n,e.onOpenRow]),R=(0,V.useCallback)(async H=>{let O=H.trim();if(O){h(!0),y([]),b([]);try{if(bn(O).length>1){let M=[],$=await dr(O,w(),{onStep:x=>y((M.push(x),[...M]))});m("tasks"),g($.summary)}else if(Kl.test(O)){let M=Ke(t,o,{filters:S.current,search:[],sort:null,limit:null,notes:[],explanation:""}),$=gr(O,M,o,{referenceDate:e.referenceDate});m("insight"),g($.answer),b($.table)}else{let M=ir(O,w());m(M.kind),g(M.message)}}finally{h(!1)}}},[w,t,o,e.referenceDate]),E=(0,V.useCallback)(()=>{S.current=[],s([]),a(null),c([]),g(""),m(null),b([]),y([])},[]),P=(0,V.useMemo)(()=>Ke(t,o,{filters:r,search:[],sort:i,limit:null,notes:[],explanation:""}),[t,o,r,i]);return{gridData:P,highlightIds:l,filters:r,sort:i,ask:R,reset:E,answer:d,kind:p,table:f,steps:u,busy:k,visibleIds:P.map(H=>be(H,n))}}var Ls={border:"1px solid color-mix(in srgb, CanvasText 20%, transparent)",borderRadius:12,padding:16,background:"Canvas",color:"CanvasText",font:"inherit"},fe={minHeight:44,padding:"8px 14px",borderRadius:8,border:"1px solid color-mix(in srgb, CanvasText 35%, transparent)",background:"ButtonFace",color:"ButtonText",font:"inherit",cursor:"pointer"},fr={...fe,flex:1,minWidth:0,background:"Field",color:"FieldText",cursor:"text"},vn={opacity:.75,fontSize:"0.9em"};function hr({rows:e}){if(!e.length)return null;let t=Object.keys(e[0]);return(0,C.jsx)("div",{style:{overflowX:"auto",marginTop:12},children:(0,C.jsxs)("table",{style:{borderCollapse:"collapse",width:"100%"},children:[(0,C.jsx)("thead",{children:(0,C.jsx)("tr",{children:t.map(n=>(0,C.jsx)("th",{scope:"col",style:{textAlign:"left",padding:"6px 8px",borderBottom:"1px solid currentColor"},children:n},n))})}),(0,C.jsx)("tbody",{children:e.slice(0,50).map((n,o)=>(0,C.jsx)("tr",{children:t.map(r=>(0,C.jsx)("td",{style:{padding:"6px 8px",borderBottom:"1px solid color-mix(in srgb, CanvasText 12%, transparent)"},children:n[r]},r))},o))})]})})}function $s(e,t,n){let o=URL.createObjectURL(new Blob([t],{type:n})),r=document.createElement("a");r.href=o,r.download=e,r.click(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function Xl({grid:e,placeholder:t="Ask about this data, e.g. \u201Coverdue and over \u20B910,000\u201D",examples:n=[],style:o}){let[r,s]=(0,V.useState)(""),i=a=>{a.preventDefault(),e.ask(r)};return(0,C.jsxs)("section",{"data-yuktai-panel":"","aria-label":"Data assistant",style:{...Ls,...o},children:[(0,C.jsxs)("form",{onSubmit:i,style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,C.jsx)("label",{htmlFor:"yuktai-grid-ask",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"},children:"Question about the data"}),(0,C.jsx)("input",{id:"yuktai-grid-ask",value:r,onChange:a=>s(a.target.value),placeholder:t,style:fr}),(0,C.jsx)("button",{type:"submit",style:fe,disabled:e.busy,children:e.busy?"Working\u2026":"Ask"}),(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>{s(""),e.reset()},children:"Reset"})]}),n.length>0&&(0,C.jsx)("div",{style:{display:"flex",gap:6,flexWrap:"wrap",marginTop:8},children:n.map(a=>(0,C.jsx)("button",{type:"button",style:{...fe,minHeight:36,fontSize:"0.85em"},onClick:()=>{s(a),e.ask(a)},children:a},a))}),(0,C.jsx)("div",{"aria-live":"polite",style:{marginTop:12,whiteSpace:"pre-line"},children:e.answer}),e.steps.length>0&&(0,C.jsx)("ol",{style:{marginTop:8,paddingLeft:20},children:e.steps.map((a,l)=>(0,C.jsxs)("li",{style:{marginBottom:4},children:[(0,C.jsx)("span",{"aria-hidden":"true",children:a.success?"\u2705 ":"\u26A0\uFE0F "}),(0,C.jsx)("strong",{children:a.text})," \u2014 ",(0,C.jsx)("span",{style:{whiteSpace:"pre-line"},children:a.message})]},l))}),(0,C.jsx)(hr,{rows:e.table})]})}var wn=[["copilot","Copilot"],["qa","QA report"],["forms","Forms"],["design","Design"],["ask","Ask page"],["voice","Voice"]];function Jl({defaultTab:e="copilot",voiceLang:t="en-IN",generate:n,style:o}){let[r,s]=(0,V.useState)(e),i=(0,V.useRef)([]),a=(l,c)=>{let d=l.key==="ArrowRight"?1:l.key==="ArrowLeft"?-1:0;if(!d)return;l.preventDefault();let g=(c+d+wn.length)%wn.length;s(wn[g][0]),i.current[g]?.focus()};return(0,C.jsxs)("section",{"data-yuktai-panel":"","aria-label":"yuktai agentic tools",style:{...Ls,...o},children:[(0,C.jsx)("div",{role:"tablist","aria-label":"Tools",style:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},children:wn.map(([l,c],d)=>(0,C.jsx)("button",{ref:g=>{i.current[d]=g},role:"tab",id:`yuktai-tab-${l}`,"aria-selected":r===l,"aria-controls":`yuktai-tabpanel-${l}`,tabIndex:r===l?0:-1,onClick:()=>s(l),onKeyDown:g=>a(g,d),style:{...fe,fontWeight:r===l?700:400,outlineOffset:2,borderWidth:r===l?2:1},children:c},l))}),(0,C.jsxs)("div",{role:"tabpanel",id:`yuktai-tabpanel-${r}`,"aria-labelledby":`yuktai-tab-${r}`,children:[r==="copilot"&&(0,C.jsx)(Zl,{}),r==="qa"&&(0,C.jsx)(ec,{}),r==="forms"&&(0,C.jsx)(tc,{}),r==="design"&&(0,C.jsx)(nc,{}),r==="ask"&&(0,C.jsx)(oc,{generate:n}),r==="voice"&&(0,C.jsx)(rc,{lang:t})]})]})}function Zl(){let e=(0,V.useRef)(null),[t,n]=(0,V.useState)(null),[o,r]=(0,V.useState)(null),[s,i]=(0,V.useState)("");(0,V.useEffect)(()=>(e.current=er({onUpdate:n}),e.current.scan(),()=>e.current?.stop()),[]);let a=e.current,l=t?.report?.issues??[];return(0,C.jsxs)("div",{children:[(0,C.jsxs)("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>t?.watching?a?.stop():a?.start(),children:t?.watching?"Stop watching":"Watch page live"}),(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>a?.scan(),children:"Scan now"}),(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>i(`${a?.applyAllFixes().filter(c=>c.applied).length??0} fix(es) applied.`),children:"Apply safe fixes"}),(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>i(`${a?.undoAll()??0} change(s) undone.`),children:"Undo all"})]}),(0,C.jsxs)("p",{"aria-live":"polite",style:{marginTop:12},children:[t?.report?.summary," ",s]}),(0,C.jsx)("ul",{style:{listStyle:"none",padding:0,margin:0},children:l.slice(0,40).map(c=>(0,C.jsxs)("li",{style:{borderTop:"1px solid color-mix(in srgb, CanvasText 12%, transparent)",padding:"8px 0"},children:[(0,C.jsxs)("div",{style:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"},children:[(0,C.jsx)("span",{style:{...vn,minWidth:70},children:c.severity}),(0,C.jsx)("span",{style:{flex:1},children:c.message}),(0,C.jsx)("button",{type:"button",style:fe,"aria-expanded":o===c.id,onClick:()=>r(o===c.id?null:c.id),children:"Why?"}),c.autoFixable&&(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>i(a?.applyFix(c.id).message??""),children:"Fix"})]}),o===c.id&&(0,C.jsx)("p",{style:{whiteSpace:"pre-line",margin:"8px 0 0"},children:a?.explain(c.id)})]},c.id))})]})}function ec(){let[e,t]=(0,V.useState)(null);return(0,C.jsxs)("div",{children:[(0,C.jsxs)("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>t(Ye()),children:"Run QA check"}),e&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>$s("accessibility-report.md",Jo(e),"text/markdown"),children:"Download .md"}),(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>$s("accessibility-report.json",Zo(e),"application/json"),children:"Download .json"})]})]}),e&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsxs)("p",{"aria-live":"polite",style:{marginTop:12},children:[(0,C.jsx)("strong",{children:e.passed?"PASS":"FAIL"})," \u2014 ",e.summary]}),(0,C.jsx)(hr,{rows:e.checks.map(n=>({Check:n.title,Result:n.passed?"\u2705 Pass":"\u274C Fail",Issues:n.issueCount}))})]})]})}function tc(){let[e,t]=(0,V.useState)(null);return(0,C.jsxs)("div",{children:[(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>t(_t()),children:"Review forms"}),(0,C.jsxs)("div",{"aria-live":"polite",children:[e&&e.length===0&&(0,C.jsx)("p",{children:"No forms on this page."}),e?.map(n=>(0,C.jsxs)("div",{style:{marginTop:12},children:[(0,C.jsx)("p",{children:(0,C.jsx)("strong",{children:n.summary})}),(0,C.jsx)("ul",{children:n.findings.map((o,r)=>(0,C.jsxs)("li",{children:[o.level==="problem"?"Problem: ":"Suggestion: ",o.message," ",(0,C.jsx)("span",{style:vn,children:o.suggestion})]},r))})]},n.selector))]})]})}function nc(){let[e,t]=(0,V.useState)(null);return(0,C.jsxs)("div",{children:[(0,C.jsx)("button",{type:"button",style:fe,onClick:()=>t(mr()),children:"Review design"}),e&&(0,C.jsxs)("div",{"aria-live":"polite",children:[(0,C.jsx)("p",{style:{marginTop:12},children:(0,C.jsx)("strong",{children:e.summary})}),(0,C.jsx)(hr,{rows:Object.entries(e.categories).map(([n,o])=>({Area:n,Score:o.score,Findings:o.findings}))}),(0,C.jsx)("ul",{children:e.findings.map((n,o)=>(0,C.jsxs)("li",{children:["[",n.severity,"] ",n.message," ",(0,C.jsx)("span",{style:vn,children:n.suggestion})]},o))})]})]})}function oc({generate:e}){let[t,n]=(0,V.useState)(""),[o,r]=(0,V.useState)(""),[s,i]=(0,V.useState)([]);return(0,C.jsxs)("div",{children:[(0,C.jsxs)("form",{onSubmit:async l=>{if(l.preventDefault(),!t.trim())return;let c=await tr(t);if(c.intent!=="unknown"&&c.intent!=="purpose"){r(c.answer),i(c.suggestions);return}let d=await cr().ask(t,{generate:e});r(c.intent==="purpose"&&!d.hits.length?c.answer:d.hits.length?d.answer:c.answer),i(c.suggestions)},style:{display:"flex",gap:8,flexWrap:"wrap"},children:[(0,C.jsx)("label",{htmlFor:"yuktai-page-ask",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"},children:"Question about this page"}),(0,C.jsx)("input",{id:"yuktai-page-ask",value:t,onChange:l=>n(l.target.value),placeholder:"What does this page do? Which fields are missing labels?",style:fr}),(0,C.jsx)("button",{type:"submit",style:fe,children:"Ask"})]}),(0,C.jsx)("p",{"aria-live":"polite",style:{whiteSpace:"pre-line",marginTop:12},children:o}),s.length>0&&(0,C.jsx)("ul",{children:s.map((l,c)=>(0,C.jsx)("li",{children:l},c))})]})}function rc({lang:e}){let t=(0,V.useMemo)(()=>lr({lang:e,onTranscript:(l,c)=>s(`\u201C${l}\u201D \u2192 ${c?c.say:"not a command"}`)}),[e]),[n,o]=(0,V.useState)(!1),[r,s]=(0,V.useState)(""),[i,a]=(0,V.useState)("");return(0,V.useEffect)(()=>()=>t.stop(),[t]),(0,C.jsxs)("div",{children:[(0,C.jsx)("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:(0,C.jsx)("button",{type:"button",style:fe,"aria-pressed":n,onClick:()=>{n?(t.stop(),o(!1)):o(t.start())},children:n?"Stop listening":"Start voice commands"})}),(0,C.jsxs)("form",{onSubmit:l=>{l.preventDefault(),t.handle(i),a("")},style:{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"},children:[(0,C.jsx)("label",{htmlFor:"yuktai-voice-typed",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"},children:"Type a command"}),(0,C.jsx)("input",{id:"yuktai-voice-typed",value:i,onChange:l=>a(l.target.value),placeholder:"Or type: turn on high contrast",style:fr}),(0,C.jsx)("button",{type:"submit",style:fe,children:"Run"})]}),(0,C.jsx)("p",{"aria-live":"polite",style:{marginTop:12},children:r}),(0,C.jsx)("p",{style:vn,children:"Try: \u201Cturn on high contrast\u201D, \u201Cbigger text\u201D, \u201Cdark mode off\u201D, \u201Cnext row\u201D, \u201C\u0C2A\u0C46\u0C26\u0C4D\u0C26 \u0C05\u0C15\u0C4D\u0C37\u0C30\u0C3E\u0C32\u0C41\u201D, \u201Creset settings\u201D."})]})}function ic(){if(typeof globalThis>"u")return new Ze;if(!globalThis.__yuktai_runtime__){let e=new Ze;e.register(ke.name,ke),e.register(Lt.name,Lt),e.register(Nt.name,Nt),globalThis.__yuktai_runtime__=e}return globalThis.__yuktai_runtime__}var Ns=typeof window<"u"?ic():new Ze,sc={wcagPlugin:ke,list(){return Ns.getPlugins()},use(e){return Ns.use(e)},fix(e){return ke.applyFixes({enabled:!0,autoFix:!0,...e})},scan(){return ke.scan()}};
