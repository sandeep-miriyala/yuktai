// Menu (with the Agentic AI submenu), guides and links. Items with a `feature` only show when it is on in yuktai.config.ts.
import config from "@config";

// `key` is the word in src/data/uiText.ts, so the menu follows the visitor's language.
type Feature = keyof typeof config.features;
export type NavLink = { href: string; label: string; key: string; feature?: Feature; hint?: string };
export type NavGroup = { label: string; key: string; feature?: Feature; children: NavLink[] };
export type NavItem = NavLink | NavGroup;
export const isGroup = (n: NavItem): n is NavGroup => "children" in n;

// Agentic AI: one main menu, its pages in a submenu (only with the Python API, features.backend).
export const AGENTIC: NavGroup = {
  label: "Agentic AI",
  key: "agenticAI",
  feature: "backend",
  children: [
    { href: "/agents/#grid-agent", label: "Grid Agent", key: "gridAgent", hint: "Questions about the data, with tools (LangGraph)" },
    { href: "/agents/#rag", label: "Ask the documents (RAG)", key: "rag", hint: "Answers from backend/knowledge, with sources" },
    { href: "/agents/#testing-agent", label: "Testing Agent", key: "testingAgent", hint: "npm run agent:test: runs every check" },
    { href: "/agents/#assistant", label: "YuktAI Assistant", key: "assistant", hint: "npm run assistant: adds pages and APIs" },
    { href: "/backend/", label: "Python API", key: "backend", hint: "FastAPI: status and 25 lakh orders" },
  ],
};

const ALL: NavItem[] = [
  { href: "/", label: "Home", key: "home" },
  { href: "/getting-started/", label: "Docs", key: "docs" },
  { href: "/grid/", label: "Data grid", key: "grid", feature: "grid" },
  AGENTIC, // ▾ submenu
  { href: "/qa/", label: "QA report", key: "qa", feature: "pageTools" },
  { href: "/icons/", label: "Icons", key: "icons", feature: "icons" },
  { href: "/about/", label: "About", key: "about" },
];

const on = (n: { feature?: Feature }) => !n.feature || Boolean(config.features[n.feature]);
export const NAV: NavItem[] = ALL.filter(on);

// The sidebar on guide pages, in order. Add a guide: a folder in src/app/(guides)/ and a line here.
export const GUIDES = [
  { href: "/getting-started/", title: "Getting started" },
  { href: "/configuration/", title: "Configuration" },
  { href: "/lifecycle/", title: "Lifecycle" },
  { href: "/deploy/", title: "Deploy" },
];

export const LINKS = {
  yuktai: "https://www.npmjs.com/package/@yuktishaalaa/yuktai",
  askPage: "https://www.npmjs.com/package/@yuktishaalaa/ask-page",
  docs: "https://yuktaidocs.netlify.app",
};
