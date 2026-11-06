# yuktai

Create accessible, AI-in-the-browser web apps with one command.

```
npx yuktai init my-app
cd my-app
npm run dev
```

Every app starts with:

- **Next.js** (static export, so hosting is free) with React and TypeScript
- **Rust → WebAssembly** core (`rust/`), with a TypeScript fallback so the app works without Rust
- The **YuktAI accessibility widget** (♿) and **Ask this page** (Ctrl + K), answering from the page itself
- **163 YuktAI icons**, light and dark themes, AAA text contrast
- An **installable app** (PWA) that works offline
- `yuktai.config.ts`: one place for the name, colours and features

Nothing visitors type is sent anywhere.

## Commands

| Command | What it does |
|---|---|
| `npx yuktai init my-app` | Create an app (asks a few questions) |
| `npx yuktai init my-app --yes` | Create with the defaults |
| `yuktai dev` | Rust → WebAssembly (if `rust/` exists), then `next dev` |
| `yuktai build` | Rust → WebAssembly, then `next build` → static files in `out/` |

Inside an app these run as `npm run dev` and `npm run build`.

## Options for `init`

| Option | Values | Default |
|---|---|---|
| `--stack` | `next-rust`, `next` | `next-rust` |
| `--template` | `starter`, `docs` | `starter` |
| `--features` | `grid`, `page-tools` (comma-separated) | none |
| `--host` | `netlify`, `github-pages`, `none` | `netlify` |
| `--accent` | `violet`, `blue`, `teal`, `orange` | `violet` |
| `--title` | any text | from the folder name |
| `--no-install`, `--no-git`, `--yes` | | |

## What you get

```
my-app/
├── yuktai.config.ts        settings: name, colours, features
├── rust/                   Rust core → WebAssembly (next-rust)
├── src/
│   ├── app/                pages
│   ├── components/yuktai/  header, widget, Ask, install, theme
│   ├── components/ui/      your components
│   ├── lib/core.ts         calls the Rust core, TypeScript fallback
│   ├── data/site.ts        menu and links
│   └── styles/             tokens.css (colours), globals.css
├── public/                 service worker, app icons
├── tests/                  checks for the built site
└── netlify.toml  or  .github/workflows/deploy.yml
```

## Rust

For the Rust core, install Rust from https://rustup.rs and add the WebAssembly target once:

```
rustup target add wasm32-unknown-unknown
```

Without it, `yuktai dev` and `yuktai build` say so and the app uses TypeScript.

Docs: https://yuktaidocs.netlify.app
