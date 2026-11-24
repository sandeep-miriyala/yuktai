// python/setu: every feature of Setu (pip install "yuktai[setu]") on one page.
import type { Metadata } from "next";
import Link from "next/link";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";

export const metadata: Metadata = {
  title: "Setu for Streamlit",
  description: "Setu (సేతు) in yuktai 0.2.0: one line adds accessibility, read aloud, Ask this page, 23 languages and 88 fonts to a Streamlit app; one command publishes it as an offline, installable site with no server.",
};

function Code({ id, file, code }: { id: string; file: string; code: string }) {
  return (
    <div className="codetabs">
      <div className="codefile">
        <div className="codehead">
          <span className="file" id={`${id}-name`}>{file}</span>
          <button type="button" className="copy-btn" data-what={file}>
            <YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" />
            <span className="copy-label">Copy</span>
            <span className="sr-only"> {file}</span>
          </button>
        </div>
        <pre><code id={id}>{code}</code></pre>
      </div>
    </div>
  );
}

function Checks({ items }: { items: string[] }) {
  return (
    <ul className="checks">
      {items.map((t) => (
        <li key={t}><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{t}</span></li>
      ))}
    </ul>
  );
}

// The same lists as python/src/yuktai/setu.py (and @yuktishaalaa/shubhalekha).
const SCRIPTS: [string, string, string[]][] = [
  ["Telugu", "te", ["Noto Sans Telugu", "Noto Serif Telugu", "Ramabhadra", "Mandali", "NTR", "Gidugu", "Gurajada", "Suranna", "Tenali Ramakrishna", "Ramaraja", "Mallanna", "Peddana", "Sree Krushnadevaraya", "Timmana", "Hind Guntur", "Anek Telugu"]],
  ["Devanagari", "hi, mr, ne, sa, kok, mai, doi, brx", ["Noto Sans Devanagari", "Noto Serif Devanagari", "Hind", "Mukta", "Tiro Devanagari Hindi", "Kalam", "Martel", "Baloo 2", "Rozha One", "Yatra One", "Amita", "Laila", "Khand"]],
  ["Bengali", "bn, as", ["Noto Sans Bengali", "Noto Serif Bengali", "Hind Siliguri", "Baloo Da 2", "Tiro Bangla", "Galada", "Atma", "Anek Bangla"]],
  ["Tamil", "ta", ["Noto Sans Tamil", "Noto Serif Tamil", "Mukta Malar", "Catamaran", "Hind Madurai", "Meera Inimai", "Arima", "Baloo Thambi 2", "Anek Tamil"]],
  ["Kannada", "kn", ["Noto Sans Kannada", "Noto Serif Kannada", "Baloo Tamma 2", "Tiro Kannada", "Anek Kannada", "Hubballi"]],
  ["Malayalam", "ml", ["Noto Sans Malayalam", "Noto Serif Malayalam", "Manjari", "Gayathri", "Chilanka", "Baloo Chettan 2", "Anek Malayalam"]],
  ["Gujarati", "gu", ["Noto Sans Gujarati", "Noto Serif Gujarati", "Hind Vadodara", "Mukta Vaani", "Baloo Bhai 2", "Rasa", "Shrikhand", "Anek Gujarati"]],
  ["Gurmukhi", "pa", ["Noto Sans Gurmukhi", "Noto Serif Gurmukhi", "Mukta Mahee", "Baloo Paaji 2", "Anek Gurmukhi"]],
  ["Odia", "or", ["Noto Sans Oriya", "Noto Serif Oriya", "Baloo Bhaina 2", "Anek Odia"]],
  ["Arabic (right to left)", "ur, ks, sd", ["Noto Nastaliq Urdu", "Gulzar", "Noto Naskh Arabic", "Lateef"]],
  ["Meetei Mayek", "mni", ["Noto Sans Meetei Mayek"]],
  ["Ol Chiki", "sat", ["Noto Sans Ol Chiki"]],
  ["Latin", "en", ["Inter", "Poppins", "Lora", "Playfair Display", "Cormorant Garamond", "Great Vibes"]],
];
const FONT_COUNT = SCRIPTS.reduce((n, s) => n + s[2].length, 0);

const APP = `import streamlit as st
import yuktai.setu as yk

yk.enable(lang="te", font="Ramabhadra", show_page_tools=True)

st.title("యుక్తి సేతు పరీక్ష")
name = st.text_input("మీ పేరు")
if name:
    st.success(f"నమస్కారం, {name} గారు!")`;

const TRY = `mkdir setu-test
cd setu-test
python -m venv .venv
.venv\\Scripts\\activate          # macOS / Linux: source .venv/bin/activate
pip install "yuktai[setu]"
streamlit run app.py
python -m yuktai setu app.py --lang te --font Ramabhadra
python -m http.server -d dist 8000`;

export default function SetuPage() {
  return (
    <>
      <div className="page-head">
        <p className="kicker"><YuktaiIcon name="hub" className="i" size={24} aria-hidden="true" />Python · yuktai 0.2.0</p>
        <h1>Setu: Streamlit for everyone, with no server</h1>
        <p className="lead">
          Setu (సేతు, bridge) does two things. One line in a Streamlit app adds accessibility, read aloud, Ask this page and
          your language with a font for it. One command turns the same app into a website that runs in the visitor&apos;s
          browser, opens offline and installs like an app.
        </p>
      </div>
      <Checks items={[
        "No API keys, no LLM bill, no tracking. Everything runs in the visitor's browser.",
        "23 languages (22 Indian languages and English) and " + FONT_COUNT + " fonts.",
        "Free to publish on GitHub Pages or Netlify. GPL-3.0, open source.",
      ]} />

      <h2 id="install">Install</h2>
      <Code id="setu-install" file="Terminal" code={'pip install "yuktai[setu]"\npython -m yuktai --version'} />
      <p>
        <code>[setu]</code> brings Streamlit 1.51 or newer with it (tested on 1.66.1). The second command prints{" "}
        <code>yuktai 0.2.0</code>.
      </p>

      <h2 id="enable">1. One line in your app</h2>
      <p>Call <code>yk.enable()</code> once, near the top. Every page of the app gets all of this.</p>
      <Code id="setu-app" file="app.py" code={APP} />
      <table className="ref">
        <caption>What <code>yk.enable()</code> adds</caption>
        <thead><tr><th scope="col">Feature</th><th scope="col">What it does</th></tr></thead>
        <tbody>
          <tr><td>Accessibility engine</td><td>Safe ARIA for screen readers, contrast fixes, skip links</td></tr>
          <tr><td>Read aloud</td><td>Reads the page in the page&apos;s language. Voice is <code>te-IN</code> for Telugu, set for you</td></tr>
          <tr><td>Page tools</td><td>Dark mode, text size and the YuktAI button at the side</td></tr>
          <tr><td>Ask this page</td><td>Questions about the page are answered in the browser, from the page</td></tr>
          <tr><td>Language</td><td>The right <code>lang</code> on the page, so screen readers pronounce it properly</td></tr>
          <tr><td>Right to left</td><td>Urdu, Kashmiri and Sindhi pages turn right to left by themselves</td></tr>
          <tr><td>Font</td><td>Headings, text, labels and buttons take the font. Code and Streamlit&apos;s icons keep theirs</td></tr>
          <tr><td>Loads once</td><td>Streamlit reruns the script on every click; Setu loads once and takes no room in the app</td></tr>
        </tbody>
      </table>

      <h2 id="languages">Languages and fonts</h2>
      <p>Give <code>lang</code> and, if you want, a <code>font</code> from its script. A language or font that isn&apos;t in the list stops with a clear error.</p>
      <table className="ref">
        <caption>{SCRIPTS.length} scripts, {FONT_COUNT} fonts</caption>
        <thead><tr><th scope="col">lang</th><th scope="col">Script</th><th scope="col">Fonts</th></tr></thead>
        <tbody>
          {SCRIPTS.map(([script, langs, fonts]) => (
            <tr key={script}><td>{langs}</td><td>{script}</td><td>{fonts.join(", ")}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="hint">The same fonts as <Link href="/shubhalekha/">Shubhalekha</Link>.</p>

      <h2 id="publish">2. A website with no server</h2>
      <p>
        One command writes a <code>dist</code> folder. Python runs in the visitor&apos;s browser (stlite 1.12.1 on Pyodide), so
        there is no server to pay for and nothing goes to sleep.
      </p>
      <Code id="setu-publish" file="Terminal" code={'python -m yuktai setu app.py --lang te --font Ramabhadra --title "సేతు పరీక్ష"\npython -m http.server -d dist 8000'} />
      <p><code>yuktai-setu app.py</code> does the same.</p>
      <Checks items={[
        "Offline: after the first visit the service worker keeps the app, Python, stlite, the YuktAI script and the font. In our test an offline reload opened in 7 seconds with 0 network requests, Ramabhadra included.",
        "Installs on a phone or a computer like an app: manifest and icons (192, 512, maskable, Apple) are written for you.",
        "The loading message is in the app's language.",
        "Multi-page apps work: pages/, data files like CSV and .streamlit/config.toml go with it.",
        "Finds packages like pandas from your imports, or uses requirements.txt (its streamlit line is skipped: stlite has it).",
        "--persist keeps a folder in the visitor's browser between visits. It is never sent anywhere.",
        "A new build gets a new version only when a file changed, and visitors get the new app by themselves.",
        "import yuktai.setu works in the browser too, so the same app.py runs both ways.",
      ]} />
      <table className="ref">
        <caption>What is in <code>dist</code></caption>
        <thead><tr><th scope="col">File</th><th scope="col">For</th></tr></thead>
        <tbody>
          <tr><td>index.html</td><td>Starts the app, with the YuktAI script</td></tr>
          <tr><td>sw.js</td><td>Service worker: offline</td></tr>
          <tr><td>manifest.webmanifest</td><td>App name, language and icons for installing</td></tr>
          <tr><td>icons/</td><td>App icons</td></tr>
          <tr><td>app/</td><td>Your Python and data files</td></tr>
          <tr><td>.nojekyll</td><td>So GitHub Pages serves every file</td></tr>
        </tbody>
      </table>

      <h2 id="checks">3. Checks before you publish</h2>
      <p>Setu reads your app first. Secrets never leave your computer, and an app that can&apos;t run in a browser is stopped with the reason.</p>
      <Checks items={[
        "Never published: secrets.toml, .env, .DS_Store, .log, .pyc and .pyo files.",
        "Never published: .venv, __pycache__, .git and other dot folders (.streamlit/config.toml is kept), earlier builds and the output folder itself.",
      ]} />
      <table className="ref">
        <caption>Imports</caption>
        <thead><tr><th scope="col">Result</th><th scope="col">Examples</th><th scope="col">What happens</th></tr></thead>
        <tbody>
          <tr><td>Stopped</td><td>psycopg2, mysql, pymongo, redis, boto3, torch, tensorflow, jax, selenium, playwright, subprocess, multiprocessing, psutil</td><td>The build stops and says why: these need a server or the computer</td></tr>
          <tr><td>Stopped</td><td>st.secrets</td><td>A static site can&apos;t keep secrets</td></tr>
          <tr><td>Warning</td><td>openai, anthropic, langchain, requests, httpx, socket, threading, sqlite3</td><td>Builds, and says they may not work in a browser</td></tr>
          <tr><td>Fine</td><td>pandas, numpy, altair, your own .py files</td><td>Loaded in the browser</td></tr>
        </tbody>
      </table>
      <p>
        <code>--force</code> builds anyway and leaves the stopped packages out. Import names that differ from pip names are
        mapped for you: <code>sklearn</code> → <code>scikit-learn</code>, <code>PIL</code> → <code>Pillow</code>.
      </p>

      <h2 id="options">Options</h2>
      <table className="ref">
        <caption><code>yk.enable()</code></caption>
        <thead><tr><th scope="col">Option</th><th scope="col">What it does</th></tr></thead>
        <tbody>
          <tr><td>lang</td><td>Page language, one of 23 codes, for example <code>&quot;te&quot;</code></td></tr>
          <tr><td>font</td><td>A font for that language, for example <code>&quot;Ramabhadra&quot;</code>. Needs <code>lang</code></td></tr>
          <tr><td>show_page_tools</td><td>Shows the YuktAI page tools button</td></tr>
          <tr><td>position</td><td><code>&quot;left&quot;</code> or <code>&quot;right&quot;</code></td></tr>
          <tr><td>voice_lang</td><td>Read aloud voice. Default <code>&lt;lang&gt;-IN</code></td></tr>
          <tr><td>primary_color, title</td><td>Widget colour and title</td></tr>
          <tr><td>default_tab</td><td>The tab the page tools open on</td></tr>
          <tr><td>auto_fix, show_skip_links</td><td>Accessibility engine options</td></tr>
          <tr><td>version, cdn</td><td>YuktAI script release and CDN (leave them as they are)</td></tr>
          <tr><td>extra</td><td>Any other YuktAI setting, as a dict</td></tr>
        </tbody>
      </table>
      <table className="ref">
        <caption><code>python -m yuktai setu</code></caption>
        <thead><tr><th scope="col">Option</th><th scope="col">What it does</th></tr></thead>
        <tbody>
          <tr><td>APP</td><td>The Streamlit file, for example <code>app.py</code></td></tr>
          <tr><td>--out</td><td>Output folder. Default <code>dist</code></td></tr>
          <tr><td>--title</td><td>Page and app name. Default: from the file name</td></tr>
          <tr><td>--lang, --font</td><td>Page language and font. Default <code>en</code></td></tr>
          <tr><td>--requirements</td><td>Packages file. Default: <code>requirements.txt</code> next to the app</td></tr>
          <tr><td>--persist DIR</td><td>A folder kept in the browser, for example <code>/home/pyodide/data</code></td></tr>
          <tr><td>--no-page-tools</td><td>Hides the page tools button</td></tr>
          <tr><td>--position</td><td><code>left</code> or <code>right</code></td></tr>
          <tr><td>--force</td><td>Builds even with imports that can&apos;t run in a browser</td></tr>
          <tr><td>--version</td><td>Prints <code>yuktai 0.2.0</code></td></tr>
        </tbody>
      </table>
      <p className="hint">A good build prints ✓, the packages, any warnings and how to try and publish it. A problem prints ✗ with the reason and exits with code 2.</p>

      <h2 id="try">Try it in five minutes</h2>
      <Code id="setu-try" file="Terminal" code={TRY} />
      <Checks items={[
        "streamlit run: the title is in Ramabhadra and the YuktAI button is at the side.",
        "Read aloud speaks Telugu; dark mode works.",
        "http://localhost:8000 opens the app (about 10 seconds the first time).",
        "F12 → Network → Offline → reload: the app still opens.",
        "The address bar shows an install button.",
      ]} />

      <h2 id="limits">Limits</h2>
      <Checks items={[
        "The first visit is slower: Python loads into the browser in 7 to 10 seconds, then comes from the cache.",
        "The first visit needs the internet. After that, offline.",
        "Apps that need a database, a large ML model (torch) or secret keys need a server. Use part 1 (yk.enable) on its own for those.",
        "Streamlit 1.51 or newer.",
      ]} />

      <h2 id="privacy">Privacy</h2>
      <p>
        No user data leaves the device: no analytics, no tracking, no cookies, no API keys. <code>--persist</code> data stays in
        the visitor&apos;s browser. See the <Link href="/python/">Python guide</Link> for Django, Flask and FastAPI, or{" "}
        <a href="https://pypi.org/project/yuktai/" target="_blank" rel="noopener noreferrer">yuktai on PyPI<span className="sr-only"> (opens in a new tab)</span></a>.
      </p>
    </>
  );
}
