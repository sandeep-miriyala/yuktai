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

      <h2>Let yuktai write the hosting files</h2>
      <p>Pick a host when you create the app. GitHub Pages is the default.</p>
      <pre><code>{`npm create yuktai@latest my-app -- --host github-pages   # a GitHub Action (default)
npm create yuktai@latest my-app -- --host vercel         # vercel.json
npm create yuktai@latest my-app -- --host netlify        # netlify.toml`}</code></pre>

      <h2>GitHub Pages</h2>
      <p>Push to GitHub, then <strong>Settings → Pages → Source: GitHub Actions</strong>. Don&apos;t use GitHub&apos;s suggested Next.js workflow: the app already has its own.</p>

      <h2>Vercel</h2>
      <p>Push to GitHub, then on <a href="https://vercel.com/new">vercel.com/new</a> import the repository and press <strong>Deploy</strong>. <code>vercel.json</code> has the settings. Every pull request gets a preview link.</p>
      <ul>
        <li>The free Hobby plan is for personal, non-commercial sites only: no ads, no selling, no paid work. Donations are fine.</li>
        <li>In India, open the site once on Jio and Vi mobile data: some custom domains on Vercel don&apos;t load there while the <code>.vercel.app</code> address does.</li>
        <li>Vercel Analytics is not added, so nothing about your visitors is collected.</li>
      </ul>

      <h2>Any other static host</h2>
      <p>Upload the <code>out</code> folder. If the site lives in a sub-folder (for example <code>/my-app/</code>), build with <code>NEXT_PUBLIC_BASE_PATH=/my-app</code>.</p>

      <h2>Rust</h2>
      <p>When the app has a <code>rust/</code> folder, the build compiles it to WebAssembly first. On Vercel, where the build machines have no Rust, <code>npm run build -- --setup-rust</code> installs it first. Without Rust the site still works and uses TypeScript.</p>
    </>
  );
}
