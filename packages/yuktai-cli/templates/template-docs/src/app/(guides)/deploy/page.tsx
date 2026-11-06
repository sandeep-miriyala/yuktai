import type { Metadata } from "next";

export const metadata: Metadata = { title: "Deploy" };

export default function Deploy() {
  return (
    <>
      <p className="kicker">Guide</p>
      <h1>Deploy for free</h1>
      <p className="lead"><code>npm run build</code> writes plain files to <code>out/</code>. Any static host can serve them.</p>

      <h2>Netlify</h2>
      <p>Push the project to GitHub, then add it in Netlify. <code>netlify.toml</code> already has the build command and security headers.</p>

      <h2>GitHub Pages</h2>
      <p>Push to GitHub, then in the repository go to Settings → Pages → Source: <strong>GitHub Actions</strong>. The workflow in <code>.github/workflows/deploy.yml</code> builds and publishes on every push to <code>main</code>.</p>

      <h2>Rust</h2>
      <p>When the app has a <code>rust/</code> folder, the build compiles it to WebAssembly first. Without Rust installed the site still works and uses TypeScript.</p>
    </>
  );
}
