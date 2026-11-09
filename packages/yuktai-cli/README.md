# yuktai

Create accessible, agentic web apps with one command. Rust speed, Indian languages, free and open source.

```
npx yuktai@latest init my-app --yes
cd my-app
npm run dev
```

`--yes` turns everything on: a docs site, a **data grid with 25 lakh (2,500,000) sample rows and the Grid AI Assistant** (🎤 voice, 24 languages, WebMCP), a **QA report**, an **icons guide**, a **🎨 colour and font picker**, a **Python API** (FastAPI) that starts with the site, a complete **PWA**, the **lifecycle** guide, a README written for your choices and a **GitHub Pages** workflow: push, then Settings → Pages → Source: GitHub Actions. One settings file, `yuktai.config.ts`: there is no `next.config` to look after.

Every app starts with:

- **Next.js** (static export, so hosting is free) with React and TypeScript
- **Rust → WebAssembly** core (`rust/`), with a TypeScript fallback so the app works without Rust
- The **YuktAI accessibility widget** (♿) and **Ask this page** (Ctrl + K), answering from the page itself
- **163 YuktAI icons**, light and dark themes, AAA text contrast
- An **installable app** (PWA) that works offline
- `yuktai.config.ts`: one place for the name, colours and features
- A three-step **lifecycle** for every part: `onStart`, `onChange`, `onEnd`

With the features on (`--yes` turns them all on):

| Page | What it does |
|---|---|
| `/grid/` | 25 lakh orders made in the browser (10 lakh on phones): text, badge, number, date and yes/no columns. Search and sort every column in Rust. The Grid AI Assistant answers typed or spoken commands in English and the 22 Indian languages |
| `/qa/` | 15 WCAG 2.2 checks with a score, what to fix and a Markdown report |
| `/backend/` | The Python API: live status and its 25 lakh orders, page by page |
| `/agents/` | Grid Agent and RAG (LangGraph). Groq with a key in `backend/.env`, free mode without |
| `/icons/` | Every icon: search, size, outline or filled, colour with a contrast check, copy the code |
| `/lifecycle/` | How `onStart`, `onChange` and `onEnd` work (docs template) |

Nothing visitors type is sent anywhere.

## Commands

| Command | What it does |
|---|---|
| `npx yuktai init my-app` | Create an app (asks a few questions) |
| `npx yuktai init my-app --yes` | Create with everything on, no questions |
| `yuktai dev` | Rust → WebAssembly, the Python API (if `backend/` exists) and `next dev`, together. One Ctrl + C stops all. `--no-api` skips the API |
| `yuktai api` | The Python API on its own: http://localhost:8000/docs |
| `yuktai api-test` | The Python API's tests (pytest) |
| `yuktai agent-test` | Testing Agent: runs every check, explains what failed |
| `yuktai assistant` | YuktAI Assistant: add pages and API endpoints, ask how-to |
| `yuktai build` | Rust → WebAssembly, then `next build` → static files in `out/` |

Inside an app these run as `npm run dev`, `npm run build`, `npm run dev:api` and `npm run test:api`.

The Python API needs Python 3.10 or newer. The first `npm run dev` makes `backend/.venv` and installs `backend/requirements.txt`. Without Python the site runs on its own.

## Options for `init`

| Option | Values | Default |
|---|---|---|
| `--stack` | `next-rust`, `next` | `next-rust` |
| `--template` | `docs`, `starter` | `docs` |
| `--features` | `grid`, `page-tools`, `icons`, `backend` (comma-separated), or `none` | all |
| `--host` | `github-pages`, `vercel`, `netlify`, `none` | `github-pages` |
| `--accent` | `blue`, `violet`, `teal`, `orange` | `blue` |
| `--title` | any text | from the folder name |
| `--no-install`, `--no-git`, `--yes` | | |

## What you get

```
my-app/
├── yuktai.config.ts        settings: name, colours, features
├── rust/                   Rust core → WebAssembly (next-rust)
├── backend/                Python API (FastAPI): app/, tests/, requirements.txt
├── src/
│   ├── app/                pages: home, guides, grid/, qa/, icons/, backend/, about/
│   ├── components/yuktai/  header, logo, widget, Ask, install, theme, lifecycle
│   ├── components/ui/      your components
│   ├── lib/core.ts         calls the Rust core, TypeScript fallback
│   ├── data/               menu and links, orders.ts (25 lakh sample rows)
│   └── styles/             tokens.css (colours), globals.css
├── public/                 service worker, app icons
├── tests/                  checks for the built site
├── README.md               written for the choices you made
└── .github/workflows/deploy.yml  or  vercel.json  or  netlify.toml
```

## Rust

For the Rust core, install Rust from https://rustup.rs and add the WebAssembly target once:

```
rustup target add wasm32-unknown-unknown
```

Without it, `yuktai dev` and `yuktai build` say so and the app uses TypeScript.

## Live demos

- [miriyalas.github.io/yuktai](https://miriyalas.github.io/yuktai/): made with no laptop. Created, built and published from a browser with GitHub Codespaces
- [పద్యాలవాల](https://sandeep-miriyala.github.io/padyalavala/): Telugu poetry site with Rust search and the Grid AI Assistant in Telugu
- [YuktaiDocs](https://yuktaidocs.netlify.app/): docs and playgrounds

**No laptop?** Open [GitHub Codespaces](https://github.com/codespaces) → Blank, run `npm create yuktai@latest my-app -- --yes`, push, then Settings → Pages → Source: GitHub Actions. [Step by step](https://yuktaidocs.netlify.app/create/#codespaces)

Docs: https://yuktaidocs.netlify.app
