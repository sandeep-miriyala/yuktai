import type { Metadata } from "next";
import Link from "next/link";
import { LINKS, VERSIONS } from "@/data/site";

export const metadata: Metadata = {
  title: "End-to-end guide",
  description:
    "From an empty folder to a live YuktAI site: create, run, add features, test, publish on GitHub Pages or Vercel, and make it ready for AI browsers with WebMCP.",
};

const STEPS: [string, string][] = [
  ["1", "Create the app"],
  ["2", "Run it"],
  ["3", "Add what you need"],
  ["4", "Test it"],
  ["5", "Publish it"],
  ["6", "Ready for AI browsers"],
  ["7", "Keep it healthy"],
];

export default function GuidePage() {
  return (
    <>
      <div className="page-head">
        <p className="kicker">End-to-end guide</p>
        <h1>From an empty folder to a live site</h1>
        <p className="lead">
          Seven steps, each with the exact commands. Only Node.js 22 is needed, and not even a laptop: every step works in GitHub
          Codespaces. Rust and Python are optional.
        </p>
      </div>

      <nav aria-label="Steps on this page">
        <ol>
          {STEPS.map(([n, t]) => (
            <li key={n}>
              <a href={`#step-${n}`}>{t}</a>
            </li>
          ))}
        </ol>
      </nav>

      <h2 id="step-1">1. Create the app</h2>
      <pre><code>{`npm create yuktai@latest my-app -- --yes                 # GitHub Pages (default)
npm create yuktai@latest my-app -- --yes --host vercel   # or Vercel`}</code></pre>
      <p>
        You get a Next.js + Rust app with the accessibility widget, the data grid, Ask this page, page tools, icons, an installable
        PWA and, if you keep it, a Python API with LangGraph agents. Every setting lives in one file, <code>yuktai.config.ts</code>.
        All options: <Link href="/create/">Create an app</Link>.
      </p>
      <p className="note">
        No laptop? Open <a href="https://github.com/codespaces">github.com/codespaces</a>, start a blank codespace and run the same
        commands. <a href={LINKS.codespacesApp}>This live app</a> was made that way. Details:{" "}
        <Link href="/create/#codespaces">Codespaces</Link>.
      </p>

      <h2 id="step-2">2. Run it</h2>
      <pre><code>{`cd my-app
npm run dev        # site http://localhost:3000 · Python API http://localhost:8000/docs`}</code></pre>
      <p>
        One command starts the site, compiles the Rust core to WebAssembly (or uses the TypeScript fallback when Rust is not
        installed) and starts the Python API when it is there.
      </p>

      <h2 id="step-3">3. Add what you need</h2>
      <table className="ref">
        <caption className="sr-only">Features and their guides</caption>
        <thead>
          <tr><th scope="col">You want</th><th scope="col">Use</th><th scope="col">Guide</th></tr>
        </thead>
        <tbody>
          <tr><td>Everyone can read and use the site</td><td>The ♿ widget, keyboard and screen-reader support</td><td><Link href="/accessibility/">Accessibility</Link></td></tr>
          <tr><td>A big table people can search</td><td><code>{"<YuktaiGrid>"}</code> with <code>{`engine="rust"`}</code></td><td><Link href="/grid/">Data grid</Link></td></tr>
          <tr><td>Questions in plain words about the data</td><td>Grid AI Assistant, custom rules, voice</td><td><Link href="/agents/">Grid agents</Link></td></tr>
          <tr><td>Answers from the page itself</td><td>Ask this page (Ctrl + K)</td><td><Link href="/ask/">Ask page</Link></td></tr>
          <tr><td>A QA report before release</td><td>15 WCAG 2.2 checks, form and design review</td><td><Link href="/page-tools/">Page tools</Link></td></tr>
          <tr><td>Icons</td><td>{"@yuktishaalaa/yuktai/icons"}</td><td><Link href="/icons/">Icon studio</Link></td></tr>
          <tr><td>An existing site, no build step</td><td>One script tag, works with jQuery</td><td><Link href="/jquery/">jQuery</Link></td></tr>
        </tbody>
      </table>

      <h2 id="step-4">4. Test it</h2>
      <pre><code>{`npm run build      # static site in out/
npm test           # checks the built site
npx playwright test   # end-to-end tests in tests/e2e/ (if you kept them)`}</code></pre>
      <ul>
        <li>Open the <strong>QA report</strong> page (<code>/qa/</code>) or the 🛠 button and fix what it finds.</li>
        <li>Use the site with the keyboard only (Tab, Enter, Esc), then with a screen reader. Automatic checks never catch everything.</li>
        <li>Open it on a phone. YuktAI turns grid rows into cards on small screens.</li>
      </ul>

      <h2 id="step-5">5. Publish it</h2>
      <table className="ref">
        <caption className="sr-only">Where to publish</caption>
        <thead>
          <tr><th scope="col">Host</th><th scope="col">Steps</th><th scope="col">Good to know</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>GitHub Pages (default)</td>
            <td>Push to GitHub, then <strong>Settings → Pages → Source: GitHub Actions</strong>. Live in 2 to 4 minutes at <code>{"https://<you>.github.io/<repo>/"}</code>.</td>
            <td>Free. The app brings its own workflow; don&apos;t click <em>Configure</em> on GitHub&apos;s suggested Next.js one. Renamed the repository? Run the workflow again.</td>
          </tr>
          <tr>
            <td>Vercel (CLI {VERSIONS.cli})</td>
            <td>Create with <code>--host vercel</code>, push, then import the repository at vercel.com/new and press Deploy. <code>vercel.json</code> holds the settings.</td>
            <td>The free Hobby plan is for personal, non-commercial sites. Some Jio and Vi mobile networks in India have had trouble opening custom domains on Vercel: try your site on mobile data. Analytics stays off.</td>
          </tr>
          <tr>
            <td>Any static host</td>
            <td><code>npm run build</code>, then upload <code>out/</code>.</td>
            <td>The Python API needs a host that runs Python; set <code>NEXT_PUBLIC_API_URL</code> when you build.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="ai-browsers">6. Ready for AI browsers</h2>
      <p>
        Browsers now come with AI agents (Gemini in Chrome and others) that read a site and act on it. They read the same structure a
        screen reader reads, so an accessible YuktAI site is already easier for them. WebMCP goes one step further: the grid hands
        agents real tools, the same ones the built-in assistant uses.
      </p>
      <pre><code>{`<YuktaiGrid
  data={rows} columns={columns} rowKey="id"
  webmcp                                              // search, count, filter, sort… for browser agents
  webmcpToken={process.env.NEXT_PUBLIC_WEBMCP_TOKEN}  // Chrome origin trial token for your site
  onWebMCPStatusChange={(s) => console.log(s.state, s.registered)}
/>`}</code></pre>
      <p>Plain HTML: <code>{`yuktai.renderGrid("#staff", { data, columns, webmcp: true, webmcpToken: "…" })`}</code>.</p>
      <ul>
        <li>
          <strong>Version {VERSIONS.yuktai}</strong> follows the current WebMCP draft: <code>document.modelContext.registerTool</code>{" "}
          (with <code>navigator.modelContext</code> for older Chrome), results as JSON strings, and <code>readOnlyHint</code> /{" "}
          <code>untrustedContentHint</code> on every tool.
        </li>
        <li>
          Chrome 149 to 156 need an <a href="https://developer.chrome.com/origintrials">origin trial</a> token for your site. Without
          one, WebMCP works only where the browser already turns it on. If WebMCP appears a moment after the page loads, the grid
          registers then.
        </li>
        <li>The status is always honest: <code>unsupported</code>, <code>registering</code>, <code>ready</code>, <code>partial</code> or <code>error</code>.</li>
        <li>Agents only get what the grid already shows. Nothing the visitor types is read or sent anywhere.</li>
      </ul>
      <p>
        Try it on the <Link href="/agents/">Grid agents</Link> page: the WebMCP line under the demo shows what this browser supports.
      </p>

      <h2 id="step-7">7. Keep it healthy</h2>
      <ul>
        <li>Update with <code>npm i @yuktishaalaa/yuktai@latest</code> and read the <a href={`${LINKS.github}/blob/main/CHANGELOG.md`}>changelog</a>.</li>
        <li>Run <code>npm run build</code> and <code>npm test</code> before every push; the workflow runs them again on GitHub.</li>
        <li>Report a problem or ask for a feature in <a href={`${LINKS.github}/issues`}>GitHub issues</a>.</li>
      </ul>

      <h2 id="how-this-site-is-tested">How this site is built and tested</h2>
      <p>
        This site is made with YuktAI and lives in the same repository as the library, in <code>site/</code>. On every push to{" "}
        <code>main</code>, one GitHub Action:
      </p>
      <ol>
        <li>builds the library and the plain HTML bundle from that commit, with the Rust engines;</li>
        <li>runs the library tests and the browser end-to-end tests of every feature;</li>
        <li>builds this site with exactly that build (not the copy on npm), so every live demo here shows the code in <code>main</code>;</li>
        <li>opens every page of the built site in a browser and checks for errors, broken links and accessibility problems;</li>
        <li>publishes it to <a href={LINKS.site}>{LINKS.site.replace("https://", "")}</a>, only when everything passed.</li>
      </ol>
    </>
  );
}
