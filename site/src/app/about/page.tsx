import type { Metadata } from "next";
import { ClockIcon, BrainIcon, ShieldCheckIcon, SpeedIcon, AccessibilityIcon, InstallIcon } from "@yuktishaalaa/yuktai/icons";
import pkg from "../../../package.json";
import StackTable, { type StackRow } from "@/components/about/StackTable";
import LiveNpm from "@/components/about/LiveNpm";
import EngineDemo from "@/components/ui/EngineDemo";

export const metadata: Metadata = {
  title: "How this site is built",
  description: "The stack behind the YuktAI site: Next.js, React, TypeScript, TanStack, Rust compiled to WebAssembly, YuktAI icons, a PWA, built and tested by a GitHub Action and hosted free on GitHub Pages.",
};

// versions straight from package.json, so this page never goes stale
const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
const v = (name: string) => (deps[name] ?? "").replace(/^[\^~]/, "");

const STACK: StackRow[] = [
  { layer: "Framework", tool: "Next.js (App Router, static export)", version: v("next"), why: "Every page is built ahead of time into plain files" },
  { layer: "UI", tool: "React", version: v("react"), why: "Components for every page and demo" },
  { layer: "Language", tool: "TypeScript", version: v("typescript"), why: "Types across pages, data and helpers" },
  { layer: "Search engine", tool: "Rust → WebAssembly (BM25)", version: "in both packages", why: "Fast search in the visitor's browser, no server" },
  { layer: "Accessibility, grid, icons", tool: "@yuktishaalaa/yuktai", version: v("@yuktishaalaa/yuktai"), why: "♿ and 🛠 buttons, data grid, agents, all 163 icons" },
  { layer: "Page Q&A", tool: "@yuktishaalaa/ask-page", version: v("@yuktishaalaa/ask-page"), why: "\"Ask these docs\", answers with the source" },
  { layer: "Data fetching", tool: "TanStack Query", version: v("@tanstack/react-query"), why: "Live npm versions on this page, cached" },
  { layer: "Tables", tool: "TanStack Table", version: v("@tanstack/react-table"), why: "This sortable table" },
  { layer: "App", tool: "PWA: manifest.json + service worker", version: "—", why: "Install button, works offline, new Y-of-agents icons" },
  { layer: "Hosting", tool: "GitHub Pages + GitHub Actions (free)", version: "—", why: "One workflow builds the library, tests it end to end, builds this site and publishes it" },
  { layer: "Created with", tool: "yuktai CLI (npx yuktai init)", version: v("yuktai"), why: "Next.js + Rust starter, docs template" },
  { layer: "Rust core", tool: "rust/ → public/wasm/core.wasm", version: "—", why: "The site's own Rust code, built by yuktai build (live check below)" },
  { layer: "Testing", tool: "Playwright + Chromium, node --test", version: "—", why: "Every route checked for errors, phone and dark mode" },
];

const DESIGN = [
  { icon: AccessibilityIcon, title: "Accessible by default", text: "Text contrast of 7:1 or more in light and dark themes, 44 px touch targets, full keyboard use, and reduced motion respected." },
  { icon: SpeedIcon, title: "Fast", text: "Pages are static files. No web fonts to download, Rust search in WebAssembly, Next.js files cached for a year." },
  { icon: ShieldCheckIcon, title: "Private", text: "YuktAI and Ask page send nothing anywhere. This site counts page views with Google Analytics; that is the only tracking." },
  { icon: InstallIcon, title: "Installable", text: "Add it to your phone or desktop from the Install button. After the first visit it works offline." },
];

export default function AboutPage() {
  return (
    <>
      <section className="wrap about-head">
        <p className="kicker">About this site</p>
        <h1>How this site is built</h1>
        <p className="lead">One Next.js app, built ahead of time from the same repository as YuktAI, tested end to end, and hosted free on GitHub Pages. The search runs in Rust, compiled to WebAssembly, inside your browser.</p>

        <div className="afterhours">
          <span className="iconbox"><ClockIcon size={22} aria-hidden="true" /></span>
          <div>
            <h2>Built after working hours</h2>
            <p>
              YuktAI and this site are a personal learning project, built in free time after working hours,
              with help from LLM tools <BrainIcon size={18} aria-hidden="true" className="inline-ico" /> for code, reviews and tests.
              Every change is read and tested in a real browser before it ships.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap">
        <p className="kicker">Stack</p>
        <h2>What it is built with</h2>
        <p className="lead">Sort by layer or tool. Versions come from the site&apos;s package.json at build time.</p>
        <StackTable rows={STACK} />
        <EngineDemo />
      </section>

      <section className="wrap">
        <p className="kicker">Live from npm</p>
        <h2>The three packages right now</h2>
        <p className="lead">Your browser asks npm for the latest release, so you can see if this site is up to date.</p>
        <LiveNpm />
      </section>

      <section className="wrap">
        <p className="kicker">Design</p>
        <h2>How the pages are designed</h2>
        <ul className="design-grid">
          {DESIGN.map((d) => (
            <li key={d.title} className="guide">
              <span className="iconbox"><d.icon size={22} aria-hidden="true" /></span>
              <strong>{d.title}</strong>
              <span>{d.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
