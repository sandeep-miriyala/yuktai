import type { Metadata } from "next";

export const metadata: Metadata = { title: "Getting started" };

export default function GettingStarted() {
  return (
    <>
      <p className="kicker">Guide</p>
      <h1>Getting started</h1>
      <p className="lead">Run the site on your computer, then write your first guide.</p>

      <h2>Run it</h2>
      <pre><code>{`npm run dev     # http://localhost:3000`}</code></pre>

      <h2>Add a guide</h2>
      <ol>
        <li>Make a folder in <code>src/app/(guides)/</code>, for example <code>install</code>.</li>
        <li>Add <code>page.tsx</code> inside it (copy this page as a start).</li>
        <li>Add a line for it in <code>GUIDES</code> in <code>src/data/site.ts</code>.</li>
      </ol>

      <h2>Ask this page</h2>
      <p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> on any page and ask a question. Answers come from the page itself, with the source highlighted. Nothing is sent anywhere.</p>
    </>
  );
}
