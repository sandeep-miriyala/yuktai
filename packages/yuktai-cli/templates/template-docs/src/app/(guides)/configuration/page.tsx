import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuration" };

export default function Configuration() {
  return (
    <>
      <p className="kicker">Guide</p>
      <h1>Configuration</h1>
      <p className="lead">All settings live in one file: <code>yuktai.config.ts</code>.</p>

      <div className="table-box">
        <table>
          <caption className="sr-only">Settings in yuktai.config.ts</caption>
          <thead><tr><th scope="col">Setting</th><th scope="col">What it does</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>title</code></th><td>Site name in the header, tab and installed app</td></tr>
            <tr><th scope="row"><code>theme.accent</code></th><td>violet, blue, teal or orange (colours in <code>src/styles/tokens.css</code>)</td></tr>
            <tr><th scope="row"><code>features.ask</code></th><td>The &quot;Ask this page&quot; panel and Ctrl + K</td></tr>
            <tr><th scope="row"><code>features.pageTools</code></th><td>The 🛠 button: QA report, copilot</td></tr>
            <tr><th scope="row"><code>features.grid</code></th><td>The data grid page</td></tr>
            <tr><th scope="row"><code>engine</code></th><td><code>rust</code> (WebAssembly) or <code>ts</code></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
