// README.md for the new app, written from the choices made in `yuktai init`.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export function readme(o) {
  const rust = o.stack === "next-rust";
  const docs = o.template === "docs";
  const has = (f) => o.features.includes(f);
  const lines = [];
  const add = (...l) => lines.push(...l);

  add(
    `# ${o.title}`,
    "",
    `Made with [YuktAI](https://yuktaidocs.netlify.app) ${o.cliVersion}: Next.js${rust ? " + Rust (WebAssembly)" : ""}, accessible by default, with AI that runs in the visitor's browser. Nothing a visitor types is sent anywhere.`,
    "",
    "## Start",
    "",
    "```bash",
    "npm install       # once",
    "npm run dev       # http://localhost:3000",
    "npm run build     # static site in out/",
    "npm test          # checks the built site",
    "npm run lint",
    "```",
    "",
  );
  if (rust) {
    add(
      "Rust is optional. With it installed, `yuktai dev` and `yuktai build` compile `rust/` to `public/wasm/core.wasm` first; without it the app uses the TypeScript fallback in `src/lib/core.ts`.",
      "",
      "```bash",
      "# once, from https://rustup.rs",
      "rustup target add wasm32-unknown-unknown",
      "```",
      "",
    );
  }

  add("## What is inside", "", "| Page or part | What it does |", "|---|---|");
  add("| Home `/` | Hero with Ask box, feature cards |");
  if (docs) add("| Docs `/getting-started/` | Guides with a sidebar: getting started, configuration, lifecycle, deploy |");
  if (has("grid")) add("| Data grid `/grid/` | 25 lakh (2,500,000) sample orders made in the browser (10 lakh on phones). Search and sort every column in Rust, **Show all** (every row in one smooth scrolling list) or pages, the Grid AI Assistant, 🎤 voice, 24 input languages, row selection, browser-agent tools (WebMCP) |");
  if (has("page-tools")) add("| QA report `/qa/` | 15 WCAG 2.2 checks, score, what to fix, Markdown download. The 🛠 button has it on every page |");
  if (has("backend")) add("| Agents `/agents/` (menu: Agentic AI ▾) | Grid Agent and RAG (LangGraph, in the Python API). Groq when `GROQ_API_KEY` is set, free mode without |");
  if (has("backend")) add("| Backend `/backend/` | The Python API (FastAPI): live status and 25 lakh orders served page by page from `backend/` |");
  if (has("icons")) add("| Icons `/icons/` | Every YuktAI icon: search, size, outline or filled, colour with a contrast check, copy the code |");
  add(
    "| About `/about/` | What the app is built with |",
    "| Ask this page | Ctrl + K or the header button. Answers come from the page, with the source highlighted |",
    "| ♿ Accessibility | Contrast, text size, dyslexia font, colour-blind filters, reduced motion |",
    "| Install (PWA) | Install button in the header until installed (steps for Safari and Firefox), works offline after the first visit |",
    "| ↑ Back to top | Bottom right, after you scroll |",
    "| Light and dark | Theme button; follows the device by default |",
    "| 🎨 Colour and font | Visitors pick any colour (kept at 7:1 contrast) and a font, including fonts on their own computer (desktop Chrome and Edge) |",
    "| Loading screen | Your logo and \"Welcome\" in 7 languages, once per browser tab (15 s, Skip any time; `splash.seconds`) |",
    "| 🌐 Language and animations | Menus and buttons in English + 6 Indian languages; animations: Device setting, Off, Calm or Lively |",
    "",
  );

  if (has("grid")) {
    add(
      "## Data grid: 25 lakh rows",
      "",
      "`src/data/orders.ts` makes the rows in the browser with a seeded random generator (the same rows every time, nothing downloaded). Six columns, five data types:",
      "",
      "| Column | Type | Example |",
      "|---|---|---|",
      "| `id` | text | `ORD-0000001` |",
      "| `customer` | text | `Lakshmi Reddy` |",
      "| `city` | badge | `Hyderabad` |",
      "| `amount` | number | `₹24,999.50` |",
      "| `date` | date | `2025-03-14` |",
      "| `paid` | boolean | Yes / No |",
      "",
      "### Grid AI Assistant",
      "",
      "Type or say what you want: `how many rows`, `unpaid`, `search Pune`, `sort by date`, `clear filters`. The assistant runs the grid's own tools (search, filter, sort, count) in the browser, in a second or two on 25 lakh rows. Nothing is sent anywhere.",
      "",
      "- **Languages:** English and the 22 Indian scheduled languages for typing and 🎤 voice (Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati…). Pick one in the assistant; set the default in `yuktai.config.ts` (`grid.language`). Commands are understood in English and Telugu today.",
      "- **Your own words:** `rules` in `OrdersGrid.tsx` maps phrases (\"unpaid\", \"బాకీ\", \"बकाया\") to grid tools. Add rules for your data.",
      "- **Browser agents (WebMCP):** with `grid.webmcp` on, AI agents in Chrome (WebMCP enabled) can use 11 grid tools. The page shows whether they are ready.",
      "- **Restyle it:** the grid follows this site's colours through `--yk-grid-*` CSS variables in `src/styles/grid.css`.",
      "",
      "Pick 1,000, 1,00,000, 10,00,000 or 25,00,000 rows on the page (phones start at 10 lakh). To use your own data, replace `makeOrders()` and the `columns` list in `src/app/grid/OrdersGrid.tsx`.",
      "",
    );
  }

  if (has("backend")) {
    add(
      "## Python API (backend/)",
      "",
      "`npm run dev` starts three things together: the Rust build, this Python API and Next.js. The first time, it makes `backend/.venv` and installs `backend/requirements.txt` (needs Python 3.10 or newer; Windows: tick \"Add python.exe to PATH\" when installing). Without Python the site still runs.",
      "",
      "| Command | What it does |",
      "|---|---|",
      "| `npm run dev` | Site on http://localhost:3000, API on http://localhost:8000 |",
      "| `npm run dev -- --no-api` | Site only |",
      "| `npm run dev:api` | API only. Try it at http://localhost:8000/docs |",
      "| `npm run test:api` | API tests (pytest) |",
      "",
      "| Endpoint | Returns |",
      "|---|---|",
      "| `GET /api/health` | `{ status: \"ok\" }` |",
      "| `GET /api/orders?page=1&size=25` | One page of 25 lakh sample orders (made on demand, no database) |",
      "| `GET /api/orders/ORD-0000042` | One order |",
      "",
      "Add an endpoint in `backend/app/main.py` with `@app.get` or `@app.post`. Settings go in `backend/.env` (copy `backend/.env.example`): `ALLOWED_ORIGINS` for the sites that may call the API, `API_PORT`. The site finds the API through `NEXT_PUBLIC_API_URL` (default http://localhost:8000).",
      "",
      "Putting it online: the site is static files (any host); the API needs a host that runs Python, such as Render, Railway, Fly.io or your own server. Set `NEXT_PUBLIC_API_URL` to its address when you build the site.",
      "",
      "## Agents (LangGraph)",
      "",
      "| Agent | Where | What it does |",
      "|---|---|---|",
      "| 🤖 Grid Agent | `/agents/`, `POST /api/agents/grid` | Questions about the orders with tools: count, total, average, top, by city. Read-only |",
      "| 📚 RAG | `/agents/`, `POST /api/rag/ask` | Answers from `backend/knowledge/*.md` with the passages it used |",
      "| 🧪 Testing Agent | `npm run agent:test` | Runs lint, the site test, the API tests and Playwright, explains failures. Allowlisted commands only |",
      "| ✨ YuktAI Assistant | `npm run assistant` | `add page contact`, `add api products`, how-to questions. Shows every file and asks first; never overwrites |",
      "",
      "**Groq:** put `GROQ_API_KEY` in `backend/.env` (free key at https://console.groq.com). It stays on the server. With a key, the question and the matching passages or tool results are sent to Groq; without one the agents work in free mode and nothing leaves your computer. The Testing Agent and the Assistant are off when `YUKTAI_ENV=production`.",
      "",
      "**Your own agent:** `build_agent(tools, instructions, model)` in `backend/app/agents/base.py`: write tools with `@tool`, and LangGraph runs model → tools → model until there is an answer (with a step limit).",
      "",
      "## Database (optional)",
      "",
      "`backend/db/` has `schema.sql` (orders, and RAG passages with pgvector), `seed.sql`, a Docker file for PostgreSQL with pgvector and the basic commands in its README. Set `DATABASE_URL` in `backend/.env`; check it at http://localhost:8000/api/db/health.",
      "",
      "## Browser tests (Playwright)",
      "",
      "`npm run test:e2e` runs `tests/e2e/` on a desktop and a phone screen. Install the browser once: `npx playwright install chromium`.",
      "",
    );
  }

  add(
    "## Lifecycle",
    "",
    "Every part has three moments, from `src/components/yuktai/lifecycle.ts`:",
    "",
    "| Hook | When | Use it to |",
    "|---|---|---|",
    "| `onStart` | The part is on the page and ready | Load data, start a timer |",
    "| `onChange` | The visitor changed something | Show a count, save a filter |",
    "| `onEnd` | The part leaves the page | Stop timers, free memory |",
    "",
    "```tsx",
    "const life = useLifecycle({",
    '  part: "grid",',
    '  onStart: () => console.log("ready"),',
    "  onChange: (what) => console.log(what),",
    '  onEnd: () => console.log("bye"),',
    "});",
    "life.change({ query: \"pune\" }); // runs onChange",
    "```",
    "",
    'Each moment is also a `yuktai:lifecycle` event on `window`. ' + (has("grid") ? "The grid shows its own lifecycle under the table." : ""),
    "",
  );

  add(
    "## Colour and font",
    "",
    "The 🎨 button in the header lets each visitor choose:",
    "",
    "- **A colour:** six ready colours or any colour. It is darkened (light theme) or lightened (dark theme) until text reaches 7:1 contrast (WCAG AAA), so no choice can make the site hard to read.",
    "- **A font:** ready choices that need no download (easy-to-read, serif, Telugu, Devanagari, Tamil), or, on desktop Chrome and Edge, any font installed on their computer. The browser asks first; the font list never leaves the device. Phones, tablets, Safari and Firefox see the ready choices only.",
    "",
    "Choices are saved in that browser only. Turn it off with `theme.picker` and `theme.localFonts` in `yuktai.config.ts`; the code is in `src/components/yuktai/look.ts`.",
    "",
    "## Language and animations",
    "",
    "The 🌐 button in the header (`features.preferences`):",
    "",
    "- **Language:** English, తెలుగు Telugu, हिन्दी Hindi, தமிழ் Tamil, ಕನ್ನಡ Kannada, മലയാളം Malayalam, বাংলা Bengali for menus and buttons. Common words come from `@yuktishaalaa/yuktai/experience`; add your own in `src/data/uiText.ts` and use them with `const { t, lang } = useUiText(APP_TEXT)`. Put `lang={lang}` on what you translate so screen readers read it correctly.",
    "- **Animations:** the visitor decides. Device setting follows the computer's reduced-motion setting; Off stops every animation on the page; Calm fades and slides; Lively adds float, pop and shimmer. Use `<Reveal>` to fade a part in on scroll, and the classes `yk-lift`, `yk-float`, `yk-pop`, `yk-shimmer`.",
    "",
    "The loading screen (`features.splash`) shows your logo and \"Welcome\" in all 7 languages once per browser tab. It is `<YuktaiSplash>` in `src/app/layout.tsx`.",
    "",
    "## Install (PWA)",
    "",
    "`public/manifest.json` has normal, maskable and monochrome (Android themed) icons, shortcuts to the main pages and two screenshots for Chrome's install window. Replace `public/screenshots/*.png` with pictures of your app.",
    "",
  );

  add(
    "## Folders",
    "",
    "```",
    `${o.name}/`,
    "├── yuktai.config.ts           name, colours, features: one place",
    "├── src/",
    "│   ├── app/                   pages (page.tsx = the home page)",
  );
  if (docs) add("│   │   ├── (guides)/          docs pages with the sidebar");
  if (has("grid")) add("│   │   ├── grid/              data grid page");
  if (has("page-tools")) add("│   │   ├── qa/                QA report page");
  if (has("icons")) add("│   │   ├── icons/             icons guide");
  add(
    "│   │   └── about/",
    "│   ├── components/",
    "│   │   ├── yuktai/            header, logo, widget, Ask, install, theme, colour and font picker, lifecycle",
    "│   │   └── ui/                your components",
    "│   ├── data/                  menu, uiText.ts (your words in 7 languages)" + (has("grid") ? ", sample orders" : ""),
    "│   ├── lib/core.ts            the app's core functions" + (rust ? " (loads the Rust WebAssembly)" : ""),
    "│   └── styles/                tokens.css (colours), globals.css, look.css" + (has("grid") ? ", grid.css" : "") + (has("page-tools") ? ", qa.css" : "") + (has("icons") ? ", icons.css" : ""),
  );
  if (rust) add("├── rust/                      Rust core → public/wasm/core.wasm");
  if (has("backend")) add("├── backend/                   Python API (FastAPI): app/main.py, tests/, requirements.txt");
  add(
    "├── public/                    icons, manifest.json, service worker",
    "└── tests/                     checks for the built site",
    "```",
    "",
  );

  add("## Settings", "", "Turn parts on or off in `yuktai.config.ts`:", "", "```ts", "features: {");
  add(
    "  accessibility: true,  // ♿ widget",
    "  ask: true,            // Ask this page, Ctrl + K",
    "  pwa: true,            // Install button, offline",
    "  splash: true,         // loading screen, once per tab",
    "  preferences: true,    // 🌐 language and animations",
    `  pageTools: ${has("page-tools")},     // QA report page and 🛠 button`,
    `  grid: ${has("grid")},          // data grid page`,
    `  icons: ${has("icons")},         // icons guide`,
    `  backend: ${has("backend")},       // Python API in backend/`,
    "},",
    "theme: { picker: true, localFonts: true },  // 🎨 colour and font picker",
    "grid: { assistant: true, voice: true, language: \"en-IN\", webmcp: true },",
    `engine: "${rust ? "rust" : "ts"}",          // "rust" (WebAssembly) or "ts"`,
    "```",
    "",
  );

  add("## Put it online", "");
  if (o.host === "netlify") add("Netlify: push to GitHub, then **Add new site → Import an existing project**. `netlify.toml` already has the build command and the `out` folder.", "");
  else if (o.host === "github-pages") add("GitHub Pages: push to GitHub, then **Settings → Pages → Source: GitHub Actions**. `.github/workflows/deploy.yml` builds and publishes on every push to `main`.", "");
  else add("`npm run build` makes a static site in `out/`. Upload that folder to any static host. To have the config made for you, create the app with `--host netlify` or `--host github-pages`.", "");

  add(
    "## Privacy",
    "",
    "Everything runs in the visitor's browser: the grid, Ask this page, the QA report and the accessibility settings. No server, no API key, no tracking. The QA report reads the page's markup and colours, never what anyone typed into a field.",
    "",
    "## Learn more",
    "",
    "- Docs and live demos: https://yuktaidocs.netlify.app",
    "- [@yuktishaalaa/yuktai](https://www.npmjs.com/package/@yuktishaalaa/yuktai) · [@yuktishaalaa/ask-page](https://www.npmjs.com/package/@yuktishaalaa/ask-page) · [yuktai CLI](https://www.npmjs.com/package/yuktai)",
    "",
  );
  return lines.join("\n");
}

export function writeReadme(dir, o) {
  writeFileSync(join(dir, "README.md"), readme(o));
}
