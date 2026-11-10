import type { Metadata } from "next";
import Link from "next/link";
import GuideDemo from "@/components/guides/GuideDemo";

export const metadata: Metadata = {
  title: "Create an app",
  description: "npx yuktai@latest init my-app --yes: a Next.js + Rust + Python app with a 25 lakh row grid, LangGraph agents, RAG, QA report, icons guide, Ask this page and an installable PWA, in one command.",
};

const OPTIONS: [string, string, string][] = [
  ["--stack", "next-rust, next", "next-rust"],
  ["--template", "docs, starter", "docs"],
  ["--features", "grid, page-tools, icons, backend (comma-separated), or none", "all"],
  ["--host", "github-pages, vercel, netlify, none", "github-pages (a GitHub Action that publishes on every push)"],
  ["--accent", "blue, violet, teal, orange", "blue"],
  ["--title", "any text", "from the folder name"],
  ["--yes", "everything on, no questions", ""],
  ["--no-install, --no-git", "skip npm install or git init", ""],
];

const TREE = `my-app/
├── yuktai.config.ts        the one settings file: name, colours, features (no next.config to look after)
├── rust/                   Rust core → WebAssembly
├── backend/                Python API (FastAPI): app/main.py, app/agents/, app/routes/,
│                           knowledge/ (RAG documents), db/ (PostgreSQL), tests/ (pytest)
├── src/
│   ├── app/
│   │   ├── (guides)/       getting started, configuration, lifecycle, deploy
│   │   ├── grid/           25 lakh rows data grid
│   │   ├── agents/         Grid Agent and RAG
│   │   ├── backend/        Python API status and orders
│   │   ├── qa/             QA report
│   │   ├── icons/          icons guide
│   │   └── about/
│   ├── components/yuktai/  header, menu (with submenus), logo, widget, Ask, install, theme, picker, lifecycle
│   ├── components/ui/      your components
│   ├── lib/core.ts         calls the Rust core, TypeScript fallback
│   ├── data/               menu and links, orders.ts (sample rows)
│   └── styles/             tokens.css, globals.css, look.css, grid.css, qa.css, icons.css
├── public/                 manifest, service worker, icons, screenshots, favicon.ico
├── tests/                  checks for the built site, e2e/ (Playwright)
├── playwright.config.ts
└── README.md               written for the choices you made
    (+ .github/workflows/deploy.yml, or vercel.json with --host vercel, or netlify.toml with --host netlify)`;

export default function CreatePage() {
  return (
    <>
      <div className="page-head">
        <p className="kicker">Create an app</p>
        <h1>One command, a ready app</h1>
        <p className="lead">
          <code>npm create yuktai@latest</code> makes a Next.js + Rust app with a Python API, LangGraph agents, the YuktAI accessibility
          widget, Ask this page (Ctrl + K), 163 icons and an installable PWA. One <code>npm run dev</code> starts all of it. This
          site was made with it.
        </p>
      </div>

      <h2 id="start">1. Create</h2>
      <pre><code>{`npm create yuktai@latest my-app -- --yes     # or: npx yuktai@latest init my-app --yes
cd my-app
npm run dev        # site http://localhost:3000 · Python API http://localhost:8000/docs`}</code></pre>
      <p>
        <code>--yes</code> skips the questions and turns everything on. Without it you choose the stack, template, features, hosting
        and colour; Enter keeps the recommended choice.
      </p>
      <table className="ref">
        <caption className="sr-only">Pages you get with --yes</caption>
        <thead><tr><th scope="col">Page</th><th scope="col">What it does</th></tr></thead>
        <tbody>
          <tr><td>/grid/</td><td>25 lakh (2,500,000) sample orders made in the browser in about a second (10 lakh on phones). Six columns, five data types: text, badge, number, date, yes/no. Search 0.3 s and sort 0.5 s on 25 lakh rows, measured in desktop Chrome.</td></tr>
          <tr><td>Grid AI Assistant</td><td>Type or say <code>unpaid</code>, <code>search Pune</code>, <code>sort by date</code>. 🎤 voice and 24 input languages (English and the 22 Indian languages), your own phrases as rules, 11 WebMCP tools for browser agents.</td></tr>
          <tr><td>Agentic AI ▾</td><td>A main menu with a submenu: Grid Agent, Ask the documents (RAG), Testing Agent, YuktAI Assistant, Python API. See <a href="#agents">Agents</a>.</td></tr>
          <tr><td>/qa/</td><td>15 WCAG 2.2 checks, a score, what to fix and a Markdown report. A practice area with mistakes to try it on.</td></tr>
          <tr><td>/icons/</td><td>Every YuktAI icon: search, size, outline or filled, colour with a contrast check, copy the code.</td></tr>
          <tr><td>/lifecycle/</td><td>The three moments of every part: <code>onStart</code>, <code>onChange</code>, <code>onEnd</code>.</td></tr>
          <tr><td>Every page</td><td>Ask this page (Ctrl + K), the ♿ widget, the 🛠 page tools, Install, light and dark, and the 🎨 colour and font picker (any colour kept at 7:1; fonts on the visitor&apos;s computer on desktop Chrome and Edge).</td></tr>
          <tr><td>PWA</td><td>Maskable and monochrome icons, favicon.ico, screenshots for Chrome&apos;s install window, shortcuts to the grid, QA report and icons.</td></tr>
        </tbody>
      </table>

      <h2 id="codespaces">No laptop? Use GitHub Codespaces</h2>
      <p>
        Everything above works in a browser. GitHub Codespaces gives you a cloud computer with Node.js and Python (free for 60 hours a
        month on 2 cores). <a href="https://miriyalas.github.io/yuktai/">This live site</a> was created, built and published that way,
        without a laptop.
      </p>
      <ol>
        <li>Open <a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>Blank</strong> → <strong>Use this template</strong>.</li>
        <li>In the terminal: <code>npm create yuktai@latest my-app -- --yes</code>, then <code>cd my-app</code> and <code>npm run dev</code>. Open port 3000 from the <strong>Ports</strong> tab.</li>
        <li>To publish: push <code>my-app</code> to a new GitHub repository, then <strong>Settings → Pages → Source: GitHub Actions</strong>. The site is live at <code>https://&lt;you&gt;.github.io/&lt;repo&gt;/</code> in 2 to 4 minutes, Rust included.</li>
      </ol>
      <p className="note">
        To use the Python API from the page inside Codespaces, make port 8000 <strong>Public</strong> in the Ports tab and start with
        {" "}<code>NEXT_PUBLIC_API_URL=https://$CODESPACE_NAME-8000.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN npm run dev</code>.
        Stop the codespace when you finish so the free hours last.
      </p>

      <h2 id="demos">Live demos made with it</h2>
      <table className="ref">
        <caption className="sr-only">Sites made with yuktai init</caption>
        <thead><tr><th scope="col">Site</th><th scope="col">What it shows</th></tr></thead>
        <tbody>
          <tr><td><a href="https://miriyalas.github.io/yuktai/">miriyalas.github.io/yuktai</a></td><td>The app <code>--yes</code> makes, created and published from a browser with Codespaces: 25 lakh row grid, Agentic AI menu, QA report, icons.</td></tr>
          <tr><td><a href="https://sandeep-miriyala.github.io/padyalavala/">పద్యాలవాల</a></td><td>A Telugu poetry site: 65 poems, the Grid AI Assistant in Telugu, Rust search, listen, share, Telugu-first menus.</td></tr>
          <tr><td><Link href="/">YuktAI docs</Link></td><td>This site.</td></tr>
        </tbody>
      </table>

      <h2 id="lifecycle">Lifecycle</h2>
      <p>Every part of a YuktAI app has three moments. The hook is in <code>src/components/yuktai/lifecycle.ts</code>:</p>
      <pre><code>{`const life = useLifecycle({
  part: "grid",
  onStart: () => console.log("ready"),      // on the page and ready
  onChange: (what) => console.log(what),    // the visitor changed something
  onEnd: () => console.log("bye"),          // leaving the page: free memory
});

<YuktaiGrid data={rows} columns={columns} onSearchTime={life.change} />`}</code></pre>

      <h2 id="options">2. Options</h2>
      <table className="ref">
          <caption className="sr-only">Options for yuktai init</caption>
          <thead><tr><th scope="col">Option</th><th scope="col">Values</th><th scope="col">Default</th></tr></thead>
          <tbody>
            {OPTIONS.map(([o, v, d]) => (
              <tr key={o}><td>{o}</td><td>{v}</td><td>{d}</td></tr>
            ))}
          </tbody>
      </table>
      <pre><code>{`npx yuktai@latest init shop --template starter --features grid --host github-pages --accent teal`}</code></pre>

      <h2 id="structure">3. What you get</h2>
      <pre><code>{TREE}</code></pre>

      <h2 id="commands">4. Commands inside the app</h2>
      <table className="ref">
          <caption className="sr-only">Commands</caption>
          <thead><tr><th scope="col">Command</th><th scope="col">What it does</th></tr></thead>
          <tbody>
            <tr><td>npm run dev</td><td>All together: Rust → WebAssembly, the Python API (port 8000, or the next free one) and the Next.js dev server. One Ctrl + C stops all</td></tr>
            <tr><td>npm run dev -- --no-api</td><td>The site without the Python API</td></tr>
            <tr><td>npm run build</td><td>Rust → WebAssembly, then static files in <code>out/</code></td></tr>
            <tr><td>npm test</td><td>Checks the built site: every page, manifest, language, title, skip link</td></tr>
            <tr><td>npm run dev:api</td><td>The Python API on its own: http://localhost:8000/docs</td></tr>
            <tr><td>npm run test:api</td><td>The Python API&apos;s tests (pytest), no key or database needed</td></tr>
            <tr><td>npm run test:e2e</td><td>Playwright on a desktop and a phone screen (once: <code>npx playwright install chromium</code>)</td></tr>
            <tr><td>npm run agent:test</td><td>Testing Agent: runs lint, the site test, pytest and Playwright, then explains what failed</td></tr>
            <tr><td>npm run assistant</td><td>YuktAI Assistant: <code>add page contact</code>, <code>add api products</code>, how-to questions</td></tr>
          </tbody>
      </table>

      <h2 id="rust">5. Rust</h2>
      <p>
        The Rust core lives in <code>rust/src/lib.rs</code>. <code>yuktai build</code> compiles it to WebAssembly and
        <code> src/lib/core.ts</code> calls it, with a TypeScript fallback, so the app always works. To build the Rust part, install
        Rust from rustup.rs once and add the WebAssembly target:
      </p>
      <pre><code>{`rustup target add wasm32-unknown-unknown`}</code></pre>

      <h2 id="python-api">6. Python API</h2>
      <p>
        <code>backend/</code> is a FastAPI app that starts with <code>npm run dev</code>. The first run makes <code>backend/.venv</code> and
        installs the requirements (Python 3.10 or newer). Without Python the site still runs. Endpoints: <code>/api/health</code>,
        <code>/api/orders</code> (25 lakh sample orders, page by page, no database), <code>/api/agents/grid</code>, <code>/api/rag/ask</code>,
        <code>/api/db/health</code>. Every file in <code>backend/app/routes/</code> with a <code>router</code> loads by itself.
      </p>
      <pre><code>{`# backend/.env  (copy backend/.env.example; never committed)
GROQ_API_KEY=            # optional: agents and RAG use Groq when set
DATABASE_URL=            # optional: PostgreSQL, see backend/db/README.md
YUKTAI_ENV=development   # production turns off the developer agents`}</code></pre>

      <h2 id="agents">7. Agents (LangGraph)</h2>
      <table className="ref">
        <caption className="sr-only">The four agents</caption>
        <thead><tr><th scope="col">Agent</th><th scope="col">Where</th><th scope="col">What it does</th></tr></thead>
        <tbody>
          <tr id="grid-agent"><td>🤖 Grid Agent</td><td>/agents/</td><td>Questions about the orders with tools: count, total, average, top, by city. Read-only.</td></tr>
          <tr id="rag"><td>📚 Ask the documents</td><td>/agents/</td><td>RAG over <code>backend/knowledge/*.md</code>, answers with the passages used. Indian scripts are searched as whole words.</td></tr>
          <tr id="testing-agent"><td>🧪 Testing Agent</td><td>npm run agent:test</td><td>Runs allowlisted checks only, explains failures. Developer tool.</td></tr>
          <tr id="assistant"><td>✨ YuktAI Assistant</td><td>npm run assistant</td><td>Adds pages and API endpoints after you say yes; never overwrites a file. Developer tool.</td></tr>
        </tbody>
      </table>
      <p>
        With <code>GROQ_API_KEY</code> they use a language model through LangGraph tool calling; the key stays on the server and the
        question with the chosen passages or tool results goes to Groq. Without a key they work in free mode and nothing leaves your
        computer. Build your own: <code>build_agent(tools, instructions, model)</code> in <code>backend/app/agents/base.py</code>.
      </p>

      <h2 id="deploy">8. Put it online</h2>
      <p>
        <code>npm run build</code> makes a static site in <code>out/</code>; any static host can serve it. New apps come with a GitHub
        Action: push to GitHub, then <strong>Settings → Pages → Source: GitHub Actions</strong>. Don&apos;t click <em>Configure</em> on
        GitHub&apos;s suggested Next.js workflow; the app has its own. Renamed the repository? Run the workflow again. For Vercel, create the app
        with <code>--host vercel</code> (CLI 1.4): push, then import the repository at vercel.com/new; no settings to change. The free
        Hobby plan is for personal, non-commercial sites, and some Jio and Vi mobile networks in India have had trouble opening custom
        domains on Vercel, so try your site on mobile data. For Netlify, use <code>--host netlify</code>. The Python API needs a host that runs Python (Render, Railway, Fly.io or
        your own server); set <code>NEXT_PUBLIC_API_URL</code> to its address when you build the site. See also
        {" "}<Link href="/nextjs/">Next.js setup</Link>.
      </p>
      <GuideDemo page="create" />
    </>
  );
}
