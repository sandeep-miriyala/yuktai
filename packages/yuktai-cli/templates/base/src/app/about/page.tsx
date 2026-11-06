import type { Metadata } from "next";
import config from "@config";

export const metadata: Metadata = { title: "About" };

const STACK: [string, string][] = [
  ["Framework", "Next.js (static export: plain files, free hosting)"],
  ["UI", "React + TypeScript"],
  ["Core", config.engine === "rust" ? "Rust compiled to WebAssembly (rust/)" : "TypeScript (src/lib/core.ts)"],
  ["Accessibility", "@yuktishaalaa/yuktai: ♿ widget, 163 icons"],
  ["Ask this page", "@yuktishaalaa/ask-page: answers from the page, on the device"],
  ["App", "PWA: Install button, works offline"],
  ["Lifecycle", "onStart, onChange, onEnd (src/components/yuktai/lifecycle.ts)"],
];

export default function About() {
  return (
    <section className="wrap">
      <p className="kicker">About</p>
      <h1>About {config.title}</h1>
      <p className="lead">Everything runs in the visitor&apos;s browser. Nothing they type is sent anywhere.</p>
      <div className="table-box">
        <table>
          <caption className="sr-only">What this app is built with</caption>
          <thead><tr><th scope="col">Part</th><th scope="col">Tool</th></tr></thead>
          <tbody>{STACK.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
