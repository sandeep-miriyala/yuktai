# @yuktishaalaa/yuktai

> Universal accessibility, AI and data toolkit for Next.js, React **and plain HTML**. One install (or one script tag) brings WCAG 2.2 auto-fix, in-browser RAG, an AI agent, code generation, an accessible data grid with Agentic AI + WebMCP, and an agentic toolkit that audits, explains and fixes pages and answers questions about your data. Zero API keys, zero cost, works offline.

[![npm](https://img.shields.io/npm/v/@yuktishaalaa/yuktai)](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
[![downloads](https://img.shields.io/npm/dm/@yuktishaalaa/yuktai)](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
[![license](https://img.shields.io/badge/license-GPL--3.0-blue)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-blue)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-13%2B-black)](https://nextjs.org)
[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/sandeepmiriyala03/badge.svg)](https://hub.xerj.org/contributors/sandeepmiriyala03)

Built in free time by [Sandeep Miriyala](https://github.com/sandeepmiriyala03).

**Live demos:**
- Staff directory: https://aksharatantra.miriyala.in/staffdirectory
- Ratnalabala, a Telugu poetry app built on YuktAI Grid: https://ratnalabala.vercel.app/poems?view=grid

---

## The story

I have been building web apps since 2013. In all those years, the same things kept breaking on almost every website I touched: missing ARIA labels, no keyboard navigation, forms that senior citizens couldn't figure out, data grids that broke on mobile, accessibility tools that cost money, and AI tools that needed API keys.

I wanted something without any of those barriers. Free. Open source. One install. Works on every device. No account. No key. No server.

So I built yuktai, one weekend and one late night at a time.

---

## What's inside

Six modules ship in a single npm package, for React/Next.js and, since v5.3, for plain HTML pages with one script tag:

| Module | Features | What it does |
|---|---|---|
| **1. Accessibility Engine** | 16 | WCAG 2.2 auto-fix, speak on focus, colour-blind modes, dyslexia font, skip links |
| **2. YuktaiGrid** ⭐ | 19 | Accessible data grid with Agentic AI, WebMCP, 5 WCAG themes, English/Telugu UI |
| **3. In-Tab RAG** | 11 | Ask questions about any page, offline, no API |
| **4. Autonomous AI Agent** | 13 | Natural-language browser guidance |
| **5. Vibe Coder** | 19 | Generate full Next.js projects from plain English |
| **6. Agentic AI Toolkit** | 10 | Accessibility copilot, QA reports, form and design review, smart grid queries, BI answers, multi-step tasks, voice settings |
| **Vanilla JS build** 🆕 | All | Every module above for plain HTML, CSS and JavaScript: no React, no build step |

---

## What's new in v5.3: Vanilla JS (plain HTML)

All of yuktai now works on any HTML page, without React or a build step. The vanilla build is bundled from the same source as the npm package, so a question gets the same answer in React and in plain HTML.

```html
<script>
  window.YUKTAI_CONFIG = { position: "right", showPageTools: true }  // optional
</script>
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.3.0/vanilla/index.min.js"></script>

<div id="staff"></div>
<script>
  const grid = yuktai.renderGrid("#staff", {
    data: rows,
    rowKey: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "salary", label: "Salary", type: "number" },
      { key: "joined", label: "Joined", type: "date" },
    ],
    agentic: true,          // question bar: "salary over 1 lakh", "average salary by department"
    ai: true,               // assistant: custom rules, phrases, grid tools, voice input
    locale: "en-IN",        // or "te-IN" for Telugu UI and messages
    webmcp: true,
  })

  await grid.ask("salary over 1 lakh in Hyderabad")
  yuktai.mountAgenticPanel("#tools", { defaultTab: "qa" })   // Copilot, QA, Forms, Design, Ask, Voice
</script>
```

| React / Next.js | Vanilla JS |
|---|---|
| `<YuktaiGrid>` | `yuktai.renderGrid(container, options)` |
| `useAgenticGrid` + `<AgenticGridBar>` | `yuktai.createAgenticGrid()` + `yuktai.mountAgenticGridBar()`, or `agentic: true` |
| `useYuktaiGridAgent` | `yuktai.createGridAgent()` |
| `<YuktaiGridWebMCP>` | `yuktai.registerWebMCP()`, or `webmcp: true` |
| `<AgenticPanel>` | `yuktai.mountAgenticPanel()` |
| `<YuktAIWrapper>` | Automatic floating ♿ button (and 🛠 page tools with `showPageTools: true`) |
| Every function (`runQaAudit`, `askInsight`, `parseAmount`, …) | Same names on `window.yuktai` |

**Grid features in the vanilla build:**
- search, sort, page-size switching, row selection and CSV export (Excel-safe)
- table, card or auto view; 5 WCAG themes; Telugu UI
- loading and empty states; row highlighting that scrolls to the row
- ARIA grid keyboard navigation: arrow keys, Home/End, Page Up/Down, Space to select, Enter to open

**Tested** in Chromium: 37 end-to-end checks pass, with axe-core reporting 0 violations and no console errors. Open `vanilla/index.html` in the repo for a demo of every feature, including a Telugu grid. Full API: [`vanilla/README.md`](./vanilla/README.md).

### Accessibility engine fixes in v5.3 (React and vanilla)

- Auto-fix no longer adds an `aria-label` to form fields that already have a `<label>`. Before this, it replaced the name that screen readers announce.
- Buttons and links hidden at scan time are no longer labelled "button" or "link".
- `<header>` and `<footer>` inside sections and dialogs no longer become page-level banner and contentinfo landmarks.
- The fix count only includes fixes that were actually applied.
- Visual alert colours now meet a 4.5:1 contrast ratio.

---

## What's new in v5.2: Agentic AI Toolkit

Ten agentic features, all running in the browser. No API keys, and no page or grid data leaves the device unless you plug in your own model through a `generate` or `summarize` hook.

| # | Feature | What it does | Main export |
|---|---|---|---|
| 1 | Accessibility Copilot | Watches the page live, explains each issue in plain English, applies safe fixes and undoes them | `createA11yCopilot` |
| 2 | Page Understanding | Answers "What does this page do?" and "Which form fields are missing labels?" | `analyzePage`, `askAboutPage` |
| 3 | Smart Data Grid | Turns "overdue and over ₹10,000" into real filters, finds unusual rows, summarises data | `runGridQuery`, `detectAnomalies`, `summarizeRows` |
| 4 | Voice Accessibility | "Turn on high contrast", "bigger text", "next row", plus Telugu phrases like "పెద్ద అక్షరాలు" | `createVoiceA11yController` |
| 5 | QA Tester | 15 checks with WCAG references, a score, pass/fail, and a Markdown or JSON report | `runQaAudit`, `auditToMarkdown` |
| 6 | Forms Agent | Reviews labels, autocomplete, error messages and senior-friendliness | `reviewForms` |
| 7 | Page + Data RAG | Answers from page text and grid rows, Telugu-aware, offline | `createContextIndex` |
| 8 | Multi-Step Tasks | "Show overdue, highlight the errors, then summarise what changed" | `runTasks` |
| 9 | BI Copilot | "Which region had the highest drop in conversion this week?" | `askInsight`, `comparePeriods` |
| 10 | Design Review | Hierarchy, readability, focus states, clutter, consistency | `reviewDesign` |

### Page tools in one panel

```tsx
"use client";
import { AgenticPanel } from "@yuktishaalaa/yuktai";

export default function A11yTools() {
  return <AgenticPanel defaultTab="copilot" voiceLang="en-IN" />;
}
```

Tabs: **Copilot**, **QA report**, **Forms**, **Design**, **Ask page**, **Voice**. The panel marks itself with `data-yuktai-panel`, so it never audits its own UI.

### Ask your grid

```tsx
"use client";
import { YuktaiGrid, useAgenticGrid, AgenticGridBar } from "@yuktishaalaa/yuktai";

const columns = [
  { key: "name", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "region", label: "Region" },
  { key: "balance", label: "Balance", type: "number" as const },
  { key: "dueDate", label: "Due date", type: "date" as const },
];

export default function Customers({ rows }: { rows: Customer[] }) {
  const grid = useAgenticGrid({ data: rows, columns, rowKey: "id" });

  return (
    <>
      <AgenticGridBar
        grid={grid}
        examples={[
          "overdue and over ₹10,000",
          "anything unusual?",
          "total balance by region",
          "show overdue, then sort by balance desc, then summarize what changed",
        ]}
      />
      <YuktaiGrid
        data={grid.gridData}
        columns={columns}
        rowKey="id"
        highlightIds={grid.highlightIds}
        autoScrollToHighlight
      />
    </>
  );
}
```

`grid.ask(text)` picks the right tool for the question:

| Question type | Example | Handled by |
|---|---|---|
| Filters and lookups | "customer starting with A and balance between 1k and 9k" | Smart grid query |
| Unusual data | "anything unusual?" | Outliers and duplicate rows |
| Group and period questions | "which region had the highest drop in conversion this week?" | BI copilot |
| Several steps | "show overdue, then highlight errors, then summarise" | Task runner, with a before/after report |

Amounts like `₹10,000`, `10k`, `1.5 lakh` and `2 crore` are understood.

### Use the functions directly

```ts
import { runQaAudit, auditToMarkdown, askInsight, runGridQuery } from "@yuktishaalaa/yuktai";

// In the browser: accessibility QA report
const report = runQaAudit();
console.log(report.score, report.passed);
const md = auditToMarkdown(report); // attach to a ticket or PR

// Anywhere: data questions
askInsight("which region had the highest drop in conversion this week", rows, columns).answer;
runGridQuery("overdue and over 10k", { data: rows, columns }).ids;
```

### Plug in your own model (optional)

Everything works offline with rules and keyword search. To get model-written answers, pass a `generate` hook, for example Gemini Nano or your own API:

```tsx
<AgenticPanel generate={async (question, context) => myModel(question, context)} />
```

### Honest limits

- Questions are understood with rules, not a language model, so unusual phrasing may need rewording. The parser returns `notes` explaining any assumption it made.
- The QA and design checks are automatic heuristics. They catch common problems but don't replace testing with real users and assistive technology.
- Smart grid queries, page answers and BI answers are in English today. Telugu and Hindi data questions are not parsed yet; use `customRules` with your own phrases for them.
- Voice accessibility commands understand English and Telugu, not yet Hindi or other languages.

---

## What's new in v4.6.4: YuktaiGrid Agentic AI + WebMCP

- Shared Grid Tools used by both the Agent and WebMCP
- Tools: search, count, columns, get row, highlight, select, open
- WebMCP registration through `document.modelContext`
- `useYuktaiGridAgent` hook for programmatic tool execution
- Embedded Grid AI Assistant inside YuktaiGrid
- English and Telugu AI UI, with English or Telugu voice input
- Working page-size switching (10 → 20 → 50 → 100)
- Seven inline SVG icons, no external icon dependency

**Architecture:** User → Agent / WebMCP → Grid Tools → YuktaiGrid → Data

---

## Works on every device

| Device | Browser | Core features | AI engine |
|---|---|---|---|
| 🖥 Desktop | Chrome 147+ (needed only for Gemini Nano) | ✅ All | Gemini Nano |
| 🖥 Desktop | Firefox / Edge / Safari | ✅ All | Transformers.js |
| 📱 Android | Chrome Mobile | ✅ All | Transformers.js |
| 📱 iOS | Safari Mobile | ✅ All | Transformers.js |
| 📲 PWA offline | All browsers | ✅ All | Offline after first load |

yuktai picks the best AI engine automatically. Users never need to know which one is running.

---

## Install

**Next.js 16 + React 19 (recommended)**

```bash
npm install @yuktishaalaa/yuktai --legacy-peer-deps
```

**Next.js 13, 14, 15**

```bash
npm install @yuktishaalaa/yuktai
```

**Yarn / pnpm**

```bash
yarn add @yuktishaalaa/yuktai
pnpm add @yuktishaalaa/yuktai
```

**Plain HTML (no install)**

```html
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.3.0/vanilla/index.min.js"></script>
```

Requirements: Node.js 18+, npm 8+, Next.js 13+ (React builds only; the vanilla build needs only a browser).

---

## Quick start

### Step 1: `next.config.js`

```js
const nextConfig = {
  transpilePackages: ["@yuktishaalaa/yuktai"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Needed for voice control and voice input
          { key: "Permissions-Policy", value: "microphone=*, speaker=*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Step 2: Client wrapper

```tsx
// components/YuktaiClient.tsx
"use client";

import { useState, useEffect, type ReactNode } from "react";
import { YuktAIWrapper } from "@yuktishaalaa/yuktai";

export default function YuktaiClient({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  return (
    <YuktAIWrapper position="left" showRag showAgent>
      {children}
    </YuktAIWrapper>
  );
}
```

### Step 3: `app/layout.tsx`

```tsx
import YuktaiClient from "@/components/YuktaiClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <YuktaiClient>
          <main>{children}</main>
        </YuktaiClient>
      </body>
    </html>
  );
}
```

That's it. Floating buttons appear on every page: ♿ opens the accessibility panel, 💬 opens "Ask this page", and the agent button opens the AI agent.

To add the v5.2 agentic tools, place `<AgenticPanel />` or `useAgenticGrid` in any client component (see [What's new in v5.2](#whats-new-in-v52-agentic-ai-toolkit)).

### Wrapper props

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `"left" \| "right"` | `"left"` | Which side the buttons appear on |
| `showRag` | `boolean` | `false` | Show the 💬 Ask-this-page button |
| `showAgent` | `boolean` | `false` | Show the AI agent button |
| `config` | `Partial<A11yConfig>` | `undefined` | Accessibility config overrides |
| `children` | `ReactNode` | required | Your app content |

---

## Module 1: Accessibility Engine

Scans every element and injects missing accessibility attributes automatically. Covers headings, images, forms, tables, lists, landmarks, and ARIA widgets. Watches for new DOM elements with `MutationObserver`.

**Features**

- WCAG 2.2 auto-fix: ARIA, roles, tabindex, scope, autocomplete, alt text
- Speak on focus using browser SpeechSynthesis
- Voice control using the SpeechRecognition API
- Visual alerts for deaf and hard-of-hearing users
- High contrast, dark mode, reduce motion, large targets (44×44)
- Colour-blind modes: Deuteranopia, Protanopia, Tritanopia, Greyscale
- Dyslexia font: Atkinson Hyperlegible
- Local font picker and font scaling from 80% to 130%
- Audit badge with a WCAG score from 0 to 100 (localhost only)
- Skip links, focus trap, saved preferences, reset

**Direct API**

```ts
import { wcagPlugin, type A11yConfig } from "@yuktishaalaa/yuktai";

const config: A11yConfig = {
  enabled: true,
  highContrast: false,
  darkMode: false,
  reduceMotion: false,
  largeTargets: false,
  speechEnabled: false,
  colorBlindMode: "none", // none | deuteranopia | protanopia | tritanopia | achromatopsia
  autoFix: true,
  showPreferencePanel: true,
  showSkipLinks: true,
  showAuditBadge: false, // dev only (localhost)
  fontSizeMultiplier: 1,
  timeoutWarning: 0, // seconds, 0 = off
};

const report = wcagPlugin.applyFixes(config);
console.log(report.fixed); // number of fixes applied
console.log(report.score); // 0–100
```

### WCAG coverage

| Standard | Criteria | Examples |
|---|---|---|
| WCAG 2.0 | 19 | Alt text, roles, labels, tables, landmarks, focus |
| WCAG 2.1 | 7 | Touch targets, reflow, motion, orientation |
| WCAG 2.2 | 3 | Focus appearance, target size, timeout warning |
| Beyond WCAG | Extras | Speech, visual alerts, colour-blind modes, dyslexia font, audit score |

---

## Module 2: YuktaiGrid ⭐

An accessible data grid for Next.js, with an embedded AI assistant, agent tools, and WebMCP support.

### Basic usage

```tsx
"use client";

import { YuktaiGrid } from "@yuktishaalaa/yuktai";

const data = [
  { id: 1, name: "Sandeep", role: "Developer", salary: 85000 },
  { id: 2, name: "Priya", role: "Designer", salary: 90000 },
];

export default function EmployeesPage() {
  return (
    <YuktaiGrid
      data={data}
      rowKey="id"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "role", label: "Role" },
        { key: "salary", label: "Salary", type: "number", align: "right" },
      ]}
      theme="default" // default | high-contrast | dark | color-blind | dyslexia
      locale="en-US" // en-US | te-IN
      view="auto" // auto | table | card
      search
      ai
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        sizeOptions: [10, 20, 50, 100],
      }}
    />
  );
}
```

### Grid features

- Real-time search, column sorting, client-side pagination with page-size switching
- Mobile card view below a configurable breakpoint
- Loading and empty states
- 5 WCAG themes
- Row selection, custom cell render, `rowKey`
- Row highlighting with optional auto-scroll
- Keyboard navigation, ARIA grid semantics, 44×44 targets
- English and Telugu UI
- Embedded Grid AI Assistant with voice and chat
- **New in v5.2:** compound natural-language questions, anomaly detection and BI answers through `useAgenticGrid`

### Grid AI Assistant

Runs embedded in the grid or as a standalone component. Intent parsing runs locally and supports search, sort, count, highest, lowest, average, total, and row lookup.

```tsx
<YuktaiGridAI
  data={data}
  columns={columns}
  onSearch={handleSearch}
  onSort={handleSort}
  language="te-IN" // AI UI and responses: en-US | te-IN
  inputLanguage="te-IN" // voice input: en-IN, en-US or any of the 22 Indian languages
  embedded
/>
```

Voice recognition depends on browser Web Speech API support.

### Agent tools

Generic, reusable grid operations shared by the Agent and WebMCP:

```ts
import {
  searchGrid,
  countGrid,
  getColumns,
  getRow,
  highlightRows,
  selectRow,
  openRow,
} from "@yuktishaalaa/yuktai";
```

Run tools programmatically:

```tsx
import { useYuktaiGridAgent, type GridAgentTool } from "@yuktishaalaa/yuktai";

const tools: GridAgentTool[] = [
  {
    name: "search",
    description: "Search grid rows by a text query",
    execute: async ({ query }) => searchGrid(data, query),
  },
];

const { executeTool, loading } = useYuktaiGridAgent({ tools });
```

**Design principle:** keep generic tools in the package and put app-specific rules in your app.

```text
Generic YuktAI tools  +  Your domain rules  =  Your application agent
```

### WebMCP

Exposes grid tools to browser AI agents through `document.modelContext`, so agents call real operations instead of guessing from the DOM. Registration is invisible in the UI.

```tsx
<YuktaiGrid
  data={rows}
  columns={columns}
  ai
  webmcp
  toolName="my_grid"
  toolDescriptions={TOOL_DESCRIPTIONS}
  onWebMCPStatusChange={setStatus} // unsupported | registering | ready | partial | error
/>
```

Or standalone:

```tsx
<YuktaiGridWebMCP data={data} columns={columns} />
```

WebMCP is not available in every browser, so always handle the `unsupported` status gracefully.

### Large datasets (100K+ rows)

Client-side pagination handles a few thousand rows well. For anything larger, use server-side pagination and disable the grid's built-in search and pagination.

`src/app/api/employees/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

let cachedData: any[] | null = null;
let cacheTime = 0;
const TTL_MS = 60_000;

async function fetchAll(): Promise<any[]> {
  const now = Date.now();
  if (cachedData && now - cacheTime < TTL_MS) return cachedData;
  const res = await fetch("https://your-api.com/employees", { cache: "no-store" });
  const json = await res.json();
  cachedData = Array.isArray(json) ? json : json.employees ?? json.data ?? [];
  cacheTime = now;
  return cachedData;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(p.get("page") || "1"));
  const pageSize = Math.max(1, parseInt(p.get("pageSize") || "5000"));
  const search = (p.get("search") || "").toLowerCase().trim();

  const all = await fetchAll();
  const filtered = search
    ? all.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(search)))
    : all;

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    rows,
    pagination: { page, pageSize, totalRows: total, totalPages: Math.ceil(total / pageSize) },
  });
}
```

Page:

```tsx
const [apiResp, setApiResp] = useState<any>(null);
const [currentPage, setPage] = useState(1);

useEffect(() => {
  fetch(`/api/employees?page=${currentPage}&pageSize=5000`)
    .then((r) => r.json())
    .then(setApiResp);
}, [currentPage]);

<YuktaiGrid
  data={apiResp?.rows ?? []}
  columns={columns}
  search={false} // handled server-side
  pagination={false} // handled server-side
  loading={!apiResp}
/>;
```

Render your own pagination bar from `apiResp.pagination`. The browser only ever holds one page in memory.

---

## Showcase: Ratnalabala (Telugu poetry)

[Ratnalabala](https://ratnalabala.vercel.app/poems?view=grid) shows that an agentic grid is more than a chatbot next to a table. Users type or speak in Telugu, and the grid acts.

| User says | Agent action |
|---|---|
| `ఎన్ని పద్యాలు` (how many poems) | `count` → "మొత్తం 36 పద్యాలు ఉన్నాయి." |
| `గర్వం తెరువు` (open "Garvam") | `open` |
| `"బుద్ధి" ఉన్న పద్యాలు` (poems with "buddhi") | `search` + highlight |
| `అక్షర క్రమంలో` (alphabetical) | `sort(title, asc)` |
| `ఈరోజు పద్యం` (poem of the day) | custom rule + highlight |

**Stack:** Next.js · React + TypeScript · MUI · YuktAI Grid · FastAPI (Python) · PostgreSQL on Neon · Vercel · Web Speech API · WebMCP

```text
PostgreSQL → FastAPI → Next.js API proxy → Ratnalabala UI → YuktAI Grid
                                                              ├── Agent
                                                              └── WebMCP
```

```tsx
<YuktaiGrid<PoemRow>
  data={rows}
  columns={COLUMNS}
  rowKey="id"
  locale="te-IN"
  inputLanguage="te-IN"
  customRules={POEM_RULES}
  search
  highlightIds={highlightIds}
  autoScrollToHighlight
  onRowClick={(row) => onOpenPoem(row.title)}
  ai
  webmcp
  toolName="ratnalabala_poems"
  toolDescriptions={TOOL_DESCRIPTIONS}
  onWebMCPStatusChange={setWebmcp}
/>
```

---

## Module 3: In-Tab RAG (Ask This Page)

Retrieval-Augmented Generation running entirely in the browser. It extracts text chunks from the current page, embeds them, finds the best match for the question, and answers. Offline, no API key.

| Device | Engine | How it works |
|---|---|---|
| Desktop Chrome with Gemini Nano | `window.LanguageModel` | Page text sent as context, instant answer |
| Mobile and all other browsers | Transformers.js | Embeddings + `flan-t5-small`, q4 quantized |

- About 30 MB one-time model download on mobile, cached in IndexedDB
- Works fully offline after first load
- All processing on device, no data sent anywhere

**What I learned:** Transformers.js kept crashing on iOS Safari with out-of-memory errors. Quantization (same model, 75% smaller) fixed it. DistilBERT gave short, useless spans; `flan-t5-small` gives real sentences.

**New in v5.2:** `createContextIndex` also searches grid rows (including rows on other pages of the grid) and your own documents, with keyword search that handles Telugu and Hindi script correctly.

---

## Module 4: Autonomous AI Agent

Type a goal in plain English. yuktai reads the page, finds the right elements, plans the steps, and highlights what to do.

- 9 DOM traversal strategies and 11 form-label strategies
- Works on static HTML, React, WordPress, and old government portals
- Gemini Nano planning on desktop, Transformers.js on mobile, rule-based fallback
- Highlights target fields, scrolls to sections, shows a numbered plan, handles iframes

Every label strategy came from a real website: old portals put labels in the previous table cell, modern apps use `aria-label`, static pages use `placeholder`.

---

## Module 5: Vibe Coder

Type a business requirement and download a full Next.js 16 project as a ZIP.

- Detects website type (12), pages (21), features (14), theme colour (8), and site name
- Preview before generating
- TypeScript, Tailwind + CSS Modules, mobile responsive
- Navbar, Footer, Home, About, Contact, Services, Pricing, Auth, Dashboard
- `npm run dev` works immediately

No AI writes the code. It's pure template engineering.

---

## Module 6: Agentic AI Toolkit 🆕

The ten v5.2 features, described in detail in [What's new in v5.2](#whats-new-in-v52-agentic-ai-toolkit).

- **Copilot and QA:** 15 WCAG checks, plain-English explanations, safe fixes with undo, downloadable reports
- **Forms and design review:** labels, autocomplete, error messages, focus states, hierarchy, clutter, senior-friendly tips
- **Data:** compound grid questions, outliers and duplicates, group-by, period comparison, trends
- **Automation:** multi-step instructions with a before/after summary
- **Voice:** accessibility settings and grid row navigation by voice, in English and Telugu
- **React:** `AgenticPanel`, `AgenticGridBar`, `useAgenticGrid`

---

## Gemini Nano setup (desktop Chrome, one time)

Needed only for Gemini Nano features on desktop Chrome. Mobile and other browsers use Transformers.js automatically.

1. Open `chrome://flags` and enable: Prompt API for Gemini Nano, Summarization API, Writer API, Rewriter API, Translation API.
2. Click **Relaunch**.
3. Open `chrome://components`, find **Optimization Guide On Device Model**, and click **Check for update**.
4. Refresh your page. AI features unlock automatically.

**Gemini Nano features:** plain-English rewriting, 3-sentence page summary, AI-generated ARIA labels, page translation in 18 languages.

> Chrome 147 moved the APIs from `window.ai` to standalone globals such as `window.LanguageModel`. yuktai supports both.

---

## Icons

Seven custom SVG icons with no external dependency.

```tsx
import {
  SearchIcon,
  SortUpIcon,
  SortDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  CloseIcon,
} from "@yuktishaalaa/yuktai";

<SearchIcon size={20} />
<CheckIcon size={20} color="#10b981" label="Task complete" />
```

Props: `size` (default 20), `color` (default `currentColor`), `strokeWidth` (default 2.5), `label` (adds ARIA; decorative if omitted).

---

## Design principles

- **Zero API keys, zero cost, zero telemetry.** Everything runs in the browser.
- **Zero injected ids.** Injected nodes are tracked by JavaScript references, so they never collide with your app's ids.
- **Zero framework lock-in.** `core/renderer.ts` has no framework imports, and the vanilla build runs on any HTML page.
- **Never reads its own UI.** Panels are marked with `data-yuktai-panel`.
- **SSR safe.** No `window` errors on the server.
- **Every automatic fix can be undone.** The v5.2 copilot records each change it makes.
- **Honest limits.** Client-side pagination is for a few thousand rows; use server-side beyond that.

---

## Compatibility

| | Supported |
|---|---|
| Next.js | 13, 14, 15, 16 |
| Plain HTML | Any page, one script tag (vanilla build) |
| React | 17, 18, 19 (19 needs `--legacy-peer-deps`) |
| Node.js | 18+ |
| Browsers | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, Samsung Internet 14+ |

---

## Roadmap

- **Shipped (v5.3):** Vanilla JS build of every module for plain HTML pages, plus accessibility engine fixes
- **Shipped (v5.2):** Agentic AI Toolkit: accessibility copilot, QA reports, form and design review, smart grid queries, BI answers, multi-step tasks, page + data RAG, voice accessibility commands
- **Shipped (v4.6.4):** YuktaiGrid Agentic AI + WebMCP, embedded Grid AI Assistant, English/Telugu UI, page-size switching, icon polish
- **Next:** expose the v5.2 agentic tools through WebMCP, more Grid Agent tools, multilingual RAG (Telugu, Hindi, Tamil, Bengali)
- **Later:** RTL support, richer browser-native AI, multimodal grid experiences

---

## Contributing

Issues and pull requests are welcome at [github.com/sandeepmiriyala03/yuktai](https://github.com/sandeepmiriyala03/yuktai). For security issues, see [SECURITY.md](./SECURITY.md).

---

## Links

- npm: [@yuktishaalaa/yuktai](https://www.npmjs.com/package/@yuktishaalaa/yuktai)
- GitHub: [sandeepmiriyala03/yuktai](https://github.com/sandeepmiriyala03/yuktai)
- Demo: [aksharatantra.miriyala.in/staffdirectory](https://aksharatantra.miriyala.in/staffdirectory)
- Showcase: [ratnalabala.vercel.app](https://ratnalabala.vercel.app/poems?view=grid)
- Vanilla JS (CDN): [cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai/vanilla/index.min.js](https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai/vanilla/index.min.js)

---

## License

GPL-3.0 © Sandeep Miriyala, [Yuktishaalaa AI Lab](https://github.com/sandeepmiriyala03)

Built in free time. AI coding assistants (Claude, GPT and Gemini) helped me learn, and helped write and test parts of the code. Every design decision, review and release is mine.

**Free forever. Open source. Built for every user.** 