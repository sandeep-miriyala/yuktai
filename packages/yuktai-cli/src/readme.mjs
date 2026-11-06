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
  if (has("grid")) add("| Data grid `/grid/` | 10 lakh (1,000,000) sample orders made in the browser. Search and sort every column in Rust (well under a second on 10 lakh rows), page size |");
  if (has("page-tools")) add("| QA report `/qa/` | 15 WCAG 2.2 checks, score, what to fix, Markdown download. The 🛠 button has it on every page |");
  if (has("icons")) add("| Icons `/icons/` | Every YuktAI icon: search, size, outline or filled, colour with a contrast check, copy the code |");
  add(
    "| About `/about/` | What the app is built with |",
    "| Ask this page | Ctrl + K or the header button. Answers come from the page, with the source highlighted |",
    "| ♿ Accessibility | Contrast, text size, dyslexia font, colour-blind filters, reduced motion |",
    "| Install (PWA) | Install button, icons, works offline after the first visit |",
    "| Light and dark | Theme button; follows the device by default |",
    "",
  );

  if (has("grid")) {
    add(
      "## Data grid: 10 lakh rows",
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
      "Pick 1,000, 1,00,000 or 10,00,000 rows on the page. To use your own data, replace `makeOrders()` and the `columns` list in `src/app/grid/OrdersGrid.tsx`.",
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
    "│   │   ├── yuktai/            header, logo, widget, Ask, install, theme, lifecycle",
    "│   │   └── ui/                your components",
    "│   ├── data/                  menu" + (has("grid") ? ", sample orders" : ""),
    "│   ├── lib/core.ts            the app's core functions" + (rust ? " (loads the Rust WebAssembly)" : ""),
    "│   └── styles/                tokens.css (colours, light and dark), globals.css",
  );
  if (rust) add("├── rust/                      Rust core → public/wasm/core.wasm");
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
    `  pageTools: ${has("page-tools")},     // QA report page and 🛠 button`,
    `  grid: ${has("grid")},          // data grid page`,
    `  icons: ${has("icons")},         // icons guide`,
    "},",
    `engine: "${rust ? "rust" : "ts"}",          // "rust" (WebAssembly) or "ts"`,
    "```",
    "",
  );

  add("## Deploy (free)", "");
  if (o.host === "netlify") add("Netlify: push to GitHub, then **Add new site → Import an existing project**. `netlify.toml` already has the build command and the `out` folder.", "");
  else if (o.host === "github-pages") add("GitHub Pages: push to GitHub, then **Settings → Pages → Source: GitHub Actions**. `.github/workflows/deploy.yml` builds and publishes on every push to `main`.", "");
  else add("Any static host works: run `npm run build` and upload the `out` folder.", "");

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
