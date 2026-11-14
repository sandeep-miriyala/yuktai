import Link from "next/link";
import { CheckIcon, ArrowRightIcon } from "@yuktishaalaa/yuktai/icons";
import {
  COMPARE, GUIDES, LINKS, PACKAGE_GROUPS, PACKAGES, STACKS, STATS, STEPS, TESTS, TEST_TOTAL, VERSIONS, WEB_SHARE,
} from "@/data/site";
import { CountUp, InView } from "./Motion";
import { GuideIcon } from "@/components/ui/Icon";
import { asset } from "@/lib/base";

function Kicker({ children }: { children: string }) {
  return <p className="kicker">{children}</p>;
}

export function Stats() {
  return (
    <section className="wrap stats" aria-label="At a glance">
      {STATS.map((s) => (
        <div key={s.label} className="stat">
          <CountUp value={s.value} className="num grad" />
          <span>{s.label}</span>
        </div>
      ))}
    </section>
  );
}

export function Stacks() {
  return (
    <section id="stacks" className="band">
      <div className="wrap">
        <Kicker>Languages</Kicker>
        <h2>One toolkit, six ways in</h2>
        <p className="lead">The same core runs everywhere. Pick your stack and copy one line.</p>
        <ul className="stack-grid">
          {STACKS.map((s) => (
            <li key={s.name} className={`stack yk-lift ${s.tone === "rs" ? "is-rust" : ""}`}>
              <Link href={s.href}>
                <span className={`badge t-${s.tone}`} aria-hidden="true">{s.badge}</span>
                <strong>{s.name}</strong>
                <ArrowRightIcon size={18} aria-hidden="true" />
              </Link>
              <code tabIndex={0}>{s.code}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Charts() {
  return (
    <section id="why" className="wrap charts">
      <figure className="panel">
        <h3>Works where the web already is</h3>
        <figcaption>Share of all websites using each library. YuktAI plugs into all three.</figcaption>
        <ul className="bars">
          {WEB_SHARE.map((b) => (
            <li key={b.name}>
              <div className="bar-head"><strong>{b.name}</strong><span>{b.value.toFixed(1)}%</span></div>
              <div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${b.value}%` }} /></div>
              <span className="bar-note">{b.how}</span>
            </li>
          ))}
        </ul>
        <p className="source">Source: <a href={LINKS.w3techs}>W3Techs</a>, November 2026</p>
      </figure>

      <figure className="panel">
        <h3>Tested before every release</h3>
        <figcaption>{TEST_TOTAL} automated tests across Rust, TypeScript and real Chromium.</figcaption>
        <div className="stack-bar" aria-hidden="true">
          {TESTS.map((t) => (
            <div key={t.name} className={t.tone} style={{ width: `${(t.value / TEST_TOTAL) * 100}%` }} />
          ))}
        </div>
        <ul className="legend">
          {TESTS.map((t) => (
            <li key={t.name}><span className={`sw ${t.tone}`} aria-hidden="true" /><span>{t.name}</span><strong>{t.value}</strong></li>
          ))}
        </ul>
      </figure>
    </section>
  );
}

export function Pipeline() {
  return (
    <section className="wrap">
      <Kicker>How it works</Kicker>
      <h2>How an answer is made</h2>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className={i === STEPS.length - 1 ? "last" : ""}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <strong>{s.title}</strong>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Compare() {
  return (
    <section className="wrap">
      <Kicker>Why YuktAI</Kicker>
      <h2>AI help on your site, without sending anything away</h2>
      <div className="table-box" tabIndex={0} role="region" aria-label="Comparison table (scrolls sideways)">
        <table className="compare">
          <thead>
            <tr><td /><th scope="col" className="us">YuktAI</th><th scope="col">Typical cloud AI widget</th></tr>
          </thead>
          <tbody>
            {COMPARE.map(([row, us, them]) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                <td><span className="yes"><CheckIcon size={16} aria-hidden="true" />{us}</span></td>
                <td className="them">{them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Guides() {
  return (
    <section id="guides" className="wrap">
      <Kicker>Guides</Kicker>
      <h2>Pick what you need</h2>
      <ul className="guide-grid">
        {GUIDES.map((g) => (
          <li key={g.href}>
            <Link className="guide yk-lift" href={g.href}>
              <span className="iconbox"><GuideIcon name={g.icon} /></span>
              <strong>{g.title}</strong>
              <span>{g.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Start() {
  return (
    <section id="start" className="wrap">
      <div className="cta">
        <div>
          <h2>Add it in two lines</h2>
          <p>Free on npm and jsDelivr. This site is made with YuktAI, built and tested by a GitHub Action and hosted free on GitHub Pages.</p>
        </div>
        <pre><code>{`<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@${VERSIONS.yuktai}/vanilla/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page@${VERSIONS.askPage}/dist/ask-page.global.js"></script>`}</code></pre>
      </div>
    </section>
  );
}

export function Packages() {
  const byName = (n: string) => PACKAGES.find((p) => p.name === n)!;
  const node = (n: string, cls: string) => {
    const p = byName(n);
    return (
      <a className={`fam-node ${cls}`} href={`#pkg-${p.name.replace(/[@/]/g, "")}`}>
        <strong>{p.short}</strong>
        <span className="fam-pkg">{p.name}</span>
        <span className="fam-ver">v{p.version}</span>
      </a>
    );
  };
  return (
    <section id="packages" className="wrap">
      <Kicker>npm packages</Kicker>
      <h2>
        <CountUp value={PACKAGES.length} /> free packages, one family
      </h2>
      <p className="lead">
        Two main products: the <strong>Toolkit</strong> for apps you build, the <strong>Assistant</strong> for websites you already have. Both run on the same two engines.
      </p>

      <InView className="family" label="The YuktAI family: YuktAI on top; the Toolkit and the Assistant under it; both use the accessibility engine, and the Assistant also uses the Ask engine. Two starters make a new app.">
        <div className="fam-root"><span>YuktAI</span></div>
        <div className="fam-row fam-main">
          {node("@yuktishaalaa/yuktai", "is-main")}
          {node("@yuktishaalaa/assistant", "is-main")}
        </div>
        <p className="fam-label">both run on</p>
        <div className="fam-row fam-engines">
          {node("@yuktishaalaa/a11y", "is-engine")}
          {node("@yuktishaalaa/ask-page", "is-engine")}
        </div>
        <p className="fam-label">start a new app with</p>
        <div className="fam-row fam-start">
          {node("create-yuktai", "is-start")}
          {node("yuktai", "is-start")}
        </div>
      </InView>

      {PACKAGE_GROUPS.map((g) => (
        <div key={g.key} className="pkg-group">
          <h3>{g.title}</h3>
          <p className="pkg-group-text">{g.text}</p>
          <ul className="pkg-grid">
            {PACKAGES.filter((p) => p.group === g.key).map((p) => (
              <li key={p.name} id={`pkg-${p.name.replace(/[@/]/g, "")}`} className={`pkg pkg-${p.group} yk-lift`}>
                <div className="pkg-head">
                  <span className="iconbox"><GuideIcon name={p.icon} /></span>
                  <div>
                    <strong className="pkg-name">{p.short}</strong>
                    <span className="pkg-ver"><code>{p.name}</code> · v{p.version} · GPL-3.0</span>
                  </div>
                </div>
                <p className="pkg-who">{p.who}</p>
                <p>{p.text}</p>
                <code className="pkg-install">{p.install}</code>
                {p.onThisSite && <p className="pkg-site"><strong>On this site:</strong> {p.onThisSite}</p>}
                <p className="pkg-links">
                  <a href={p.npm}>npm <span className="sr-only">: {p.name}</span><ArrowRightIcon size={16} aria-hidden="true" /></a>
                  {p.guide && <Link href={p.guide.href}>{p.guide.label} <ArrowRightIcon size={16} aria-hidden="true" /></Link>}
                  {p.cdn && <a href={p.cdn}>jsDelivr <span className="sr-only">: {p.name}</span><ArrowRightIcon size={16} aria-hidden="true" /></a>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ── From the old GitHub Pages home: how it works, live demos, recognition ── */

const DIAGRAMS = [
  { src: "/diagrams/1-solution-overview.svg", caption: "1. The whole picture. Four ways in, one library at the centre." },
  { src: "/diagrams/2-library-modules.svg", caption: "2. Inside the library. 12 modules, with Rust doing the heavy lifting." },
  { src: "/diagrams/3-npm-run-dev.svg", caption: "3. One command. What npm run dev starts for you." },
  { src: "/diagrams/4-generated-app.svg", caption: "4. Your new app. Pages on the left, the optional Python API on the right." },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="wrap">
      <Kicker>How it works</Kicker>
      <h2>From one toolkit to your app</h2>
      <p className="lead">Many modules in all, but you start with one command. Open a diagram for the full size.</p>
      <ul className="diagram-grid">
        {DIAGRAMS.map((d) => (
          <li key={d.src}>
            <figure className="panel diagram">
              <a href={asset(d.src)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(d.src)} alt={d.caption} loading="lazy" width={1200} height={760} />
              </a>
              <figcaption>{d.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Static demos (vanilla/, ask-page/) are copied next to this site by the GitHub Action,
// so they are plain links, not Next.js routes.
const DEMOS: { title: string; text: string; href: string; local?: boolean }[] = [
  { title: "Plain HTML demo", text: "Grid, accessibility tools and icons on a page with no framework.", href: "/vanilla/", local: true },
  { title: "Ask this page", text: "A side panel that answers from the page and highlights the source.", href: "/ask-page/", local: true },
  { title: "Made with no laptop", text: "A full YuktAI app created, built and published from a browser with GitHub Codespaces.", href: LINKS.codespacesApp },
  { title: "పద్యాలవాల", text: "A Telugu poetry site: Rust search, the Grid AI Assistant in Telugu, listen and share.", href: LINKS.padyalavala },
  { title: "Grid with 10 lakh rows", text: "A real Next.js app using the grid.", href: LINKS.bigGrid },
];

export function Demos() {
  return (
    <section id="demos" className="band">
      <div className="wrap">
        <Kicker>Try it live</Kicker>
        <h2>Live demos</h2>
        <p className="lead">Everything below runs in your browser.</p>
        <ul className="guide-grid">
          {DEMOS.map((d) => (
            <li key={d.title}>
              <a className="guide yk-lift" href={d.local ? asset(d.href) : d.href} lang={/[ఀ-౿]/.test(d.title) ? "te" : undefined}>
                <strong>{d.title}</strong>
                <span lang="en">{d.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Recognition() {
  return (
    <section id="recognition" className="wrap">
      <Kicker>Recognition</Kicker>
      <h2>Part of the XERJ Corpus Hub</h2>
      <p className="lead">
        XERJ Corpus Hub is an open reference library that AI coding agents search before they write code. YuktAI is one of its
        licence-cleared corpora (GPL-3.0).
      </p>
      <p className="pkg-links">
        <a href={LINKS.xerjProfile}>Contributor profile <ArrowRightIcon size={16} aria-hidden="true" /></a>
        <a href={LINKS.xerjCorpus}>YuktAI corpus <ArrowRightIcon size={16} aria-hidden="true" /></a>
        <a href={LINKS.contributing}>Contribute <ArrowRightIcon size={16} aria-hidden="true" /></a>
      </p>
    </section>
  );
}
