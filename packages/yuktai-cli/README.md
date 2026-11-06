# yuktai

Create accessible, AI-in-the-browser web apps with one command.

```
npx yuktai init my-app --yes
cd my-app
npm run dev
```

`--yes` turns everything on: a docs site, a **data grid with 10 lakh (1,000,000) sample rows**, a **QA report**, an **icons guide**, the **lifecycle** guide and a README written for your choices.

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
| `/grid/` | 10 lakh orders made in the browser: text, badge, number, date and yes/no columns. Search and sort every column in Rust, well under a second |
| `/qa/` | 15 WCAG 2.2 checks with a score, what to fix and a Markdown report |
| `/icons/` | Every icon: search, size, outline or filled, colour with a contrast check, copy the code |
| `/lifecycle/` | How `onStart`, `onChange` and `onEnd` work (docs template) |

Nothing visitors type is sent anywhere.

## Commands

| Command | What it does |
|---|---|
| `npx yuktai init my-app` | Create an app (asks a few questions) |
| `npx yuktai init my-app --yes` | Create with everything on, no questions |
| `yuktai dev` | Rust → WebAssembly (if `rust/` exists), then `next dev` |
| `yuktai build` | Rust → WebAssembly, then `next build` → static files in `out/` |

Inside an app these run as `npm run dev` and `npm run build`.

## Options for `init`

| Option | Values | Default |
|---|---|---|
| `--stack` | `next-rust`, `next` | `next-rust` |
| `--template` | `docs`, `starter` | `docs` |
| `--features` | `grid`, `page-tools`, `icons` (comma-separated), or `none` | all |
| `--host` | `netlify`, `github-pages`, `none` | `netlify` |
| `--accent` | `blue`, `violet`, `teal`, `orange` | `blue` |
| `--title` | any text | from the folder name |
| `--no-install`, `--no-git`, `--yes` | | |

## What you get

```
my-app/
├── yuktai.config.ts        settings: name, colours, features
├── rust/                   Rust core → WebAssembly (next-rust)
├── src/
│   ├── app/                pages: home, guides, grid/, qa/, icons/, about/
│   ├── components/yuktai/  header, logo, widget, Ask, install, theme, lifecycle
│   ├── components/ui/      your components
│   ├── lib/core.ts         calls the Rust core, TypeScript fallback
│   ├── data/               menu and links, orders.ts (10 lakh sample rows)
│   └── styles/             tokens.css (colours), globals.css
├── public/                 service worker, app icons
├── tests/                  checks for the built site
├── README.md               written for the choices you made
└── netlify.toml  or  .github/workflows/deploy.yml
```

## Rust

For the Rust core, install Rust from https://rustup.rs and add the WebAssembly target once:

```
rustup target add wasm32-unknown-unknown
```

Without it, `yuktai dev` and `yuktai build` say so and the app uses TypeScript.

Docs: https://yuktaidocs.netlify.app
