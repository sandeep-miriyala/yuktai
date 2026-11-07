import type { Metadata } from "next";

export const metadata: Metadata = { title: "Put it online" };

export default function Deploy() {
  return (
    <>
      <p className="kicker">Guide</p>
      <h1>Put it online</h1>
      <p className="lead">
        <code>npm run build</code> writes plain files to <code>out/</code>. Any static host can serve them: no server, no database.
      </p>

      <h2>Any static host</h2>
      <p>Upload the <code>out</code> folder. If the site lives in a sub-folder (for example <code>/my-app/</code>), build with <code>NEXT_PUBLIC_BASE_PATH=/my-app</code>.</p>

      <h2>Let yuktai write the hosting files</h2>
      <p>Hosting files are only added when you ask for them. Create the app with one of these:</p>
      <pre><code>{`npx yuktai@latest init my-app --yes --host netlify        # adds netlify.toml
npx yuktai@latest init my-app --yes --host github-pages   # adds a GitHub Action`}</code></pre>

      <h2>Rust</h2>
      <p>When the app has a <code>rust/</code> folder, the build compiles it to WebAssembly first. Without Rust installed the site still works and uses TypeScript.</p>
    </>
  );
}
