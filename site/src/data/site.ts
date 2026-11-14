// Everything the site states in one place: versions, numbers, links.
// Change a release here and every page follows.

export const VERSIONS = {
  yuktai: "6.0.3",
  a11y: "6.0.3",
  assistant: "6.0.5",
  askPage: "1.0.2",
  cli: "1.4.0",
  create: "1.0.0",
} as const;

export const LINKS = {
  github: "https://github.com/sandeep-miriyala/yuktai",
  npmYuktai: "https://www.npmjs.com/package/@yuktishaalaa/yuktai",
  npmAsk: "https://www.npmjs.com/package/@yuktishaalaa/ask-page",
  npmAssistant: "https://www.npmjs.com/package/@yuktishaalaa/assistant",
  npmA11y: "https://www.npmjs.com/package/@yuktishaalaa/a11y",
  npmCli: "https://www.npmjs.com/package/yuktai",
  npmCreate: "https://www.npmjs.com/package/create-yuktai",
  w3techs: "https://w3techs.com/technologies/overview/javascript_library",
  site: "https://sandeep-miriyala.github.io/yuktai/",
  codespacesApp: "https://miriyalas.github.io/yuktai/",
  padyalavala: "https://sandeep-miriyala.github.io/padyalavala/",
  bigGrid: "https://aksharatantra.miriyala.in/staffdirectory",
  xerjProfile: "https://hub.xerj.org/contributors/sandeepmiriyala03",
  xerjCorpus: "https://hub.xerj.org/corpus/sandeepmiriyala03--yuktai",
  contributing: "https://github.com/sandeep-miriyala/yuktai/blob/main/CONTRIBUTING.md",
} as const;

export type IconKey =
  | "accessibility" | "grid" | "robot" | "chat" | "tools" | "code" | "hub"
  | "layout" | "wand" | "star" | "dataObject" | "speed" | "install";

// The guides (src/app/(guides)/<name>/page.tsx)
export const GUIDES: { href: string; title: string; text: string; icon: IconKey }[] = [
  { href: "/assistant/", title: "YuktAI Assistant (new in 6.0)", text: "Accessibility and Ask this page in one panel. Download the browser extension, paste one script, or npm install for React and Next.js.", icon: "accessibility" },
  { href: "/guide/", title: "End-to-end guide", text: "From an empty folder to a live site: create, build, test, publish on GitHub Pages or Vercel, and make it ready for AI browsers.", icon: "wand" },
  { href: "/create/", title: "Create an app", text: "npm create yuktai@latest my-app: Next.js + Rust + Python, a 25 lakh row grid, LangGraph agents, RAG, QA report, icons and a PWA in one command.", icon: "install" },
  { href: "/accessibility/", title: "Accessibility", text: "Floating ♿ button: contrast, text size, dyslexia font, colour-blind filters, reduced motion, speak on focus.", icon: "accessibility" },
  { href: "/grid/", title: "Data grid", text: "Search, sort, pages, selection, CSV, five themes and keyboard navigation, with the engine and time shown.", icon: "grid" },
  { href: "/agents/", title: "Grid agents", text: "Ask the data in plain words, multi-step tasks, custom rules, WebMCP tools for browser agents.", icon: "robot" },
  { href: "/ask/", title: "Ask page (RAG)", text: "Answers from the page itself with the source highlighted. Nothing is sent anywhere.", icon: "chat" },
  { href: "/page-tools/", title: "Page tools", text: "Copilot, QA report with 15 WCAG checks, form review, design review and voice commands.", icon: "tools" },
  { href: "/nextjs/", title: "Next.js setup", text: "Pick the buttons you want and copy a ready YuktAIWrapper layout for the App Router.", icon: "code" },
  { href: "/python/", title: "Python (pip)", text: "pip install yuktai adds the widget and page tools to Django, Flask and FastAPI.", icon: "hub" },
  { href: "/php/", title: "PHP (Composer)", text: "composer require yuktishaalaa/yuktai for plain PHP, Laravel and WordPress.", icon: "layout" },
  { href: "/jquery/", title: "jQuery", text: "Two script tags on any jQuery site. Live demo with jQuery 1.12 to 4.0.", icon: "wand" },
  { href: "/icons/", title: "Icon studio", text: "Every YuktAI icon at any size and colour. Copy React or HTML, download PNG or SVG.", icon: "star" },
  { href: "/playground/", title: "Function playground", text: "Run the core functions on your own input and copy the call.", icon: "dataObject" },
  { href: "/rust/", title: "Rust engines", text: "Rust compiled to WebAssembly for grid search and page RAG. Time it against TypeScript.", icon: "speed" },
];

// Six ways in. One line each.
export const STACKS = [
  { badge: "JS", name: "JavaScript / HTML", code: `<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@${VERSIONS.yuktai}/vanilla/index.min.js"></script>`, href: "/#start", tone: "js" },
  { badge: "TS", name: "React / Next.js", code: `npm i @yuktishaalaa/yuktai@${VERSIONS.yuktai}`, href: "/nextjs/", tone: "ts" },
  { badge: "$", name: "jQuery 1.12 – 4.0", code: `yuktai.renderGrid($("#staff")[0], { data, columns })`, href: "/jquery/", tone: "jq" },
  { badge: "Py", name: "Python", code: "pip install yuktai", href: "/python/", tone: "py" },
  { badge: "PHP", name: "PHP / Laravel / WordPress", code: "composer require yuktishaalaa/yuktai", href: "/php/", tone: "php" },
  { badge: "Rs", name: "Rust → WebAssembly", code: `engine: "rust"   // the default since 5.3.11`, href: "/rust/", tone: "rs" },
] as const;

// W3Techs, share of all websites (November 2026)
export const WEB_SHARE = [
  { name: "jQuery", value: 64.2, how: "Two script tags" },
  { name: "Bootstrap", value: 14.5, how: "One script tag" },
  { name: "React", value: 6.0, how: "React components" },
] as const;

// Automated tests run before a release
export const TESTS = [
  { name: "TypeScript unit (Vitest)", value: 315, tone: "c1" },
  { name: "Rust (cargo)", value: 13, tone: "c2" },
  { name: "Browser end-to-end", value: 37, tone: "c3" },
  { name: "Strict CSP + extension", value: 4, tone: "c4" },
] as const;
export const TEST_TOTAL = TESTS.reduce((n, t) => n + t.value, 0);

export const STATS = [
  { value: 6, label: "free npm packages, one family" },
  { value: STACKS.length, label: "languages and stacks" },
  { value: TEST_TOTAL, label: "automated tests per release" },
  { value: 163, label: "accessible icons" },
  { value: 0, label: "servers, API keys or tracking" },
];

export const STEPS = [
  { title: "Reads the page", text: "Headings, paragraphs, lists and tables" },
  { title: "Searches with BM25", text: "Rust compiled to WebAssembly" },
  { title: "Quotes the best part", text: "With the source highlighted" },
  { title: "Stays on the device", text: "0 bytes sent anywhere" },
];

export const COMPARE: [string, string, string][] = [
  ["Where it runs", "Visitor's browser", "Vendor's servers"],
  ["Cost", "Free, open source", "Monthly plan or per-question fees"],
  ["API key", "None", "Required"],
  ["Visitor data sent", "Nothing", "Questions and page text"],
  ["Works offline", "After the first load", "No"],
  ["Strict CSP sites", "Trusted Types ready", "Often blocked"],
  ["Accessibility widget", "Included", "Usually separate"],
];

export const QUESTIONS = [
  { label: "Which package?", ask: "Which YuktAI package should I use?" },
  { label: "How do I install?", ask: "How do I install YuktAI?" },
  { label: "Is my data safe?", ask: "Is my data sent to a server?" },
  { label: "Works with jQuery?", ask: "Does it work with jQuery?" },
  { label: "Why Rust?", ask: "Why does YuktAI use Rust?" },
];

// The npm packages: six, in one family. Two main products, the two engines
// inside them, and two ways to start a new app.
export type PackageGroup = "main" | "engine" | "start";

export const PACKAGE_GROUPS: { key: PackageGroup; title: string; text: string }[] = [
  { key: "main", title: "Main products", text: "Pick one. Each brings everything it needs." },
  { key: "engine", title: "Engines", text: "Inside both main products. Use one on its own if that is all you need." },
  { key: "start", title: "Start a new app", text: "One command makes a ready Next.js app with YuktAI set up." },
];

export const PACKAGES: readonly {
  name: string; short: string; version: string; group: PackageGroup; who: string; text: string; install: string;
  npm: string; onThisSite?: string; icon: IconKey; cdn?: string; guide?: { href: string; label: string };
}[] = [
  {
    name: "@yuktishaalaa/yuktai",
    short: "YuktAI Toolkit",
    version: VERSIONS.yuktai,
    group: "main",
    who: "For developers building an app",
    text: "Accessibility, AI and data toolkit for Next.js, React and plain HTML: the agentic data grid (10 lakh rows, Rust), accessibility copilot, QA reports, page tools and 163 icons. Includes the accessibility engine.",
    install: `npm i @yuktishaalaa/yuktai@${VERSIONS.yuktai}`,
    npm: LINKS.npmYuktai,
    cdn: "https://www.jsdelivr.com/package/npm/@yuktishaalaa/yuktai",
    guide: { href: "/guide/", label: "End-to-end guide" },
    onThisSite: "the ♿ and 🛠 buttons, the data grid, agents, icon studio, every icon",
    icon: "grid",
  },
  {
    name: "@yuktishaalaa/assistant",
    short: "YuktAI Assistant",
    version: VERSIONS.assistant,
    group: "main",
    who: "For any website you already have",
    text: "Accessibility (safe ARIA, WCAG AA/AAA, read aloud in the right voice, colours, smart dark mode) and Ask this page in one panel, with your name and colour. One script, npm, or a browser extension.",
    install: `npm i @yuktishaalaa/assistant@${VERSIONS.assistant}`,
    npm: LINKS.npmAssistant,
    cdn: "https://www.jsdelivr.com/package/npm/@yuktishaalaa/assistant",
    guide: { href: "/assistant/", label: "Script, npm and extension" },
    onThisSite: "the download page and the extension",
    icon: "accessibility",
  },
  {
    name: "@yuktishaalaa/a11y",
    short: "Accessibility engine",
    version: VERSIONS.a11y,
    group: "engine",
    who: "Inside the Toolkit and the Assistant",
    text: "Safe ARIA fixes, WCAG AA/AAA contrast, the language of every part, read aloud, visitor preferences and smart dark mode. One attribute, no server.",
    install: `npm i @yuktishaalaa/a11y@${VERSIONS.a11y}`,
    npm: LINKS.npmA11y,
    guide: { href: "/accessibility/", label: "Accessibility guide" },
    icon: "accessibility",
  },
  {
    name: "@yuktishaalaa/ask-page",
    short: "Ask engine",
    version: VERSIONS.askPage,
    group: "engine",
    who: "Inside the Assistant",
    text: "Answers from the page itself with the source highlighted. Rust/WebAssembly search, on-device AI, WebMCP tools for agents, nothing sent anywhere.",
    install: `npm i @yuktishaalaa/ask-page@${VERSIONS.askPage}`,
    npm: LINKS.npmAsk,
    guide: { href: "/ask/", label: "Ask page guide" },
    onThisSite: "\"Ask these docs\", the hero box and Ctrl + K",
    icon: "chat",
  },
  {
    name: "create-yuktai",
    short: "App starter",
    version: VERSIONS.create,
    group: "start",
    who: "The usual way to start",
    text: "npm create yuktai@latest: a new Next.js app with YuktAI, Rust and Python ready, in one command.",
    install: "npm create yuktai@latest my-app",
    npm: LINKS.npmCreate,
    guide: { href: "/create/", label: "Create an app" },
    onThisSite: "this site was made with it",
    icon: "install",
  },
  {
    name: "yuktai",
    short: "Command line",
    version: VERSIONS.cli,
    group: "start",
    who: "Runs your YuktAI app",
    text: "yuktai init, dev and build: the commands inside every YuktAI app (Next.js + Rust + a Python API, grid, agents, tests, PWA). Not the Toolkit: for that, install @yuktishaalaa/yuktai.",
    install: "npx yuktai init my-app",
    npm: LINKS.npmCli,
    guide: { href: "/create/", label: "Create an app" },
    icon: "tools",
  },
];

// The header menu (src/components/yuktai/Header.tsx). A group with `children` is a ▾ submenu.
export type NavLink = { href: string; label: string; key?: string; hint?: string };
export type NavGroup = { label: string; key: string; children: NavLink[] };
export type NavItem = NavLink | NavGroup;
export const isGroup = (n: NavItem): n is NavGroup => "children" in n;

export const NAV: NavItem[] = [
  {
    label: "Get started",
    key: "getStarted",
    children: [
      { href: "/assistant/", label: "YuktAI Assistant", hint: "New in 6.0: download, script or npm" },
      { href: "/guide/", label: "End-to-end guide", hint: "Create, test, publish, AI-browser ready" },
      { href: "/create/", label: "Create an app", key: "createApp", hint: "npm create yuktai@latest my-app" },
      { href: "/nextjs/", label: "Next.js setup", hint: "YuktAIWrapper for the App Router" },
      { href: "/#start", label: "JavaScript / HTML", hint: "Two script tags on any site" },
      { href: "/jquery/", label: "jQuery", hint: "jQuery 1.12 to 4.0" },
      { href: "/python/", label: "Python (pip)", hint: "Django, Flask, FastAPI" },
      { href: "/php/", label: "PHP (Composer)", hint: "Plain PHP, Laravel, WordPress" },
    ],
  },
  {
    label: "Components",
    key: "components",
    children: [
      { href: "/accessibility/", label: "Accessibility", hint: "The ♿ widget: contrast, text size, fonts" },
      { href: "/grid/", label: "Data grid", hint: "25 lakh rows, search and sort in Rust" },
      { href: "/page-tools/", label: "Page tools", hint: "Copilot, QA report, form and design review" },
      { href: "/icons/", label: "Icon studio", hint: "Every icon, any size and colour" },
      { href: "/playground/", label: "Function playground", hint: "Run the core functions" },
      { href: "/rust/", label: "Rust engines", hint: "WebAssembly, timed against TypeScript" },
    ],
  },
  {
    label: "Agentic AI",
    key: "agenticAI",
    children: [
      { href: "/agents/", label: "Grid agents", hint: "Ask the data, tasks, rules, WebMCP" },
      { href: "/guide/#ai-browsers", label: "AI browsers (WebMCP)", hint: "Gemini in Chrome and other agents" },
      { href: "/ask/", label: "Ask page (RAG)", hint: "Answers from the page, with sources" },
      { href: "/create/#python-api", label: "Python API", hint: "FastAPI, started by npm run dev" },
      { href: "/create/#agents", label: "LangGraph agents", hint: "Grid Agent, RAG, Testing Agent, Assistant" },
    ],
  },
  {
    label: "About",
    key: "about",
    children: [
      { href: "/#how", label: "How it works", hint: "Four diagrams, from the toolkit to your app" },
      { href: "/#demos", label: "Live demos", hint: "Sites made with YuktAI" },
      { href: "/#packages", label: "Packages", key: "packages", hint: "yuktai CLI, @yuktishaalaa/yuktai, ask-page" },
      { href: "/#why", label: "Why YuktAI", key: "whyYuktai", hint: "Where it fits, how it compares" },
      { href: "/about/", label: "How it's built", key: "howBuilt", hint: "The stack behind this site" },
      { href: LINKS.github, label: "GitHub", key: "github", hint: "Source code, GPL-3.0" },
    ],
  },
];
