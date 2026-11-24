"""Setu export: a Streamlit app as a static, offline, installable website.

    python -m yuktai setu app.py

writes ``dist/`` with the app running in the visitor's browser (stlite:
Streamlit on Pyodide/WebAssembly), YuktAI accessibility, the right language
and font, a web app manifest and a service worker for offline use. Publish
``dist/`` on GitHub Pages or Netlify: no server, nothing to keep awake.

Python standard library only.
"""

from __future__ import annotations

import ast
import hashlib
import json
import re
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Sequence

from . import script_tag
from .setu import RTL, SCRIPT_OF, font_href

#: The stlite release Setu loads (pinned so every build is the same).
STLITE_VERSION = "1.12.1"
STLITE = "https://cdn.jsdelivr.net/npm/@stlite/browser@{v}/build/"
THEME = "#0038b4"

# Folders and files that never belong in a published site.
_SKIP_DIRS = {".git", ".hg", ".venv", "venv", "env", ".env", "__pycache__", "node_modules", ".mypy_cache",
              ".pytest_cache", ".ipynb_checkpoints", ".idea", ".vscode"}
_SKIP_FILES = {"secrets.toml", ".env", ".DS_Store"}
_SKIP_SUFFIXES = {".log", ".pyc", ".pyo"}

# import name → pip name, where they differ
PIP_NAMES = {"sklearn": "scikit-learn", "PIL": "Pillow", "yaml": "PyYAML", "bs4": "beautifulsoup4",
             "dateutil": "python-dateutil", "cv2": "opencv-python", "skimage": "scikit-image"}

# Cannot work in a browser: they need a server, a database connection, native code or processes.
BLOCKED = {
    "psycopg2": "a PostgreSQL server", "psycopg": "a PostgreSQL server", "mysql": "a MySQL server",
    "MySQLdb": "a MySQL server", "pymysql": "a MySQL server", "pymongo": "a MongoDB server", "redis": "a Redis server",
    "boto3": "AWS credentials", "botocore": "AWS credentials", "torch": "PyTorch (not built for the browser)",
    "tensorflow": "TensorFlow (not built for the browser)", "keras": "TensorFlow (not built for the browser)",
    "jax": "JAX (not built for the browser)", "selenium": "a real browser driver", "playwright": "a real browser driver",
    "subprocess": "running other programs", "multiprocessing": "processes", "psutil": "the operating system",
}
# Work, with a catch worth saying out loud.
WARN = {
    "openai": "your API key would be visible to every visitor",
    "anthropic": "your API key would be visible to every visitor",
    "langchain": "API keys would be visible to every visitor",
    "requests": "calls to other sites work only if those sites allow it (CORS)",
    "httpx": "calls to other sites work only if those sites allow it (CORS)",
    "urllib3": "calls to other sites work only if those sites allow it (CORS)",
    "socket": "raw sockets do not exist in the browser",
    "threading": "threads do not run in parallel in the browser",
    "sqlite3": "the database lives in the visitor's browser, not shared between visitors",
}

LOADING = {
    "te": "యాప్ సిద్ధమవుతోంది… మొదటిసారి కొంచెం సమయం పడుతుంది, తర్వాత internet లేకపోయినా తెరుచుకుంటుంది.",
    "hi": "ऐप तैयार हो रहा है… पहली बार थोड़ा समय लगता है, फिर बिना इंटरनेट के भी खुलेगा।",
    "ta": "செயலி தயாராகிறது… முதல் முறை சற்று நேரம் ஆகும், பிறகு இணையம் இல்லாமலும் திறக்கும்.",
    "kn": "ಆ್ಯಪ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ… ಮೊದಲ ಬಾರಿ ಸ್ವಲ್ಪ ಸಮಯ ಬೇಕು, ನಂತರ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ತೆರೆಯುತ್ತದೆ.",
    "en": "Getting the app ready… The first visit takes a little while; after that it opens even without internet.",
}


@dataclass
class Report:
    """What the import check found."""

    imports: List[str] = field(default_factory=list)
    requirements: List[str] = field(default_factory=list)
    blocked: Dict[str, str] = field(default_factory=dict)
    warnings: Dict[str, str] = field(default_factory=dict)
    uses_secrets: bool = False
    notes: List[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.blocked and not self.uses_secrets


def _stdlib() -> set:
    names = getattr(sys, "stdlib_module_names", None)
    if names:
        return set(names)
    return {"os", "sys", "re", "json", "math", "time", "datetime", "random", "statistics", "itertools", "functools",
            "collections", "pathlib", "typing", "dataclasses", "csv", "io", "base64", "hashlib", "string", "textwrap",
            "decimal", "fractions", "enum", "uuid", "copy", "pprint", "zipfile", "gzip", "html", "urllib", "unicodedata",
            "sqlite3", "socket", "threading", "subprocess", "multiprocessing", "asyncio", "logging", "abc", "struct"}


def _is_setu_build(folder: Path) -> bool:
    """A folder an earlier ``setu`` run wrote (never publish a build inside a build)."""
    try:
        return (folder / "sw.js").is_file() and 'content="YuktAI Setu"' in (folder / "index.html").read_text(
            encoding="utf-8", errors="ignore")[:2000]
    except OSError:
        return False


def app_files(app_dir: Path, out_dir: Optional[Path] = None) -> List[Path]:
    """Files to publish, relative to the app folder (no secrets, no virtualenvs, no earlier builds)."""
    out = []
    out_resolved = out_dir.resolve() if out_dir else None
    builds = [d.resolve() for d in app_dir.rglob("*") if d.is_dir() and _is_setu_build(d)]
    for p in sorted(app_dir.rglob("*")):
        rel = p.relative_to(app_dir)
        if any(part in _SKIP_DIRS or (part.startswith(".") and part != ".streamlit") for part in rel.parts[:-1]):
            continue
        real = p.resolve()
        if out_resolved and (real == out_resolved or out_resolved in real.parents):
            continue
        if any(b == real or b in real.parents for b in builds):
            continue
        if p.is_file() and p.name not in _SKIP_FILES and p.suffix not in _SKIP_SUFFIXES and not p.name.startswith("."):
            out.append(rel)
    return out


def check_imports(app_dir: Path, files: Sequence[Path], requirements_file: Optional[Path] = None) -> Report:
    """Find imports in every .py file and say what will and won't run in a browser."""
    r = Report()
    local = {f.with_suffix("").parts[0] for f in files if f.suffix == ".py"} | {f.parts[0] for f in files if len(f.parts) > 1}
    std = _stdlib()
    found = set()
    for f in files:
        if f.suffix != ".py":
            continue
        try:
            tree = ast.parse((app_dir / f).read_text(encoding="utf-8"), filename=str(f))
        except (SyntaxError, UnicodeDecodeError) as e:
            r.notes.append(f"{f}: could not read ({e.__class__.__name__})")
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                found.update(a.name.split(".")[0] for a in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
                found.add(node.module.split(".")[0])
            elif (isinstance(node, ast.Attribute) and node.attr == "secrets" and isinstance(node.value, ast.Name)
                  and node.value.id in {"st", "streamlit"}):
                r.uses_secrets = True
    found -= local
    r.imports = sorted(found)
    for name in r.imports:
        if name in BLOCKED:
            r.blocked[name] = BLOCKED[name]
        elif name in WARN:
            r.warnings[name] = WARN[name]
    if requirements_file and requirements_file.is_file():
        for line in requirements_file.read_text(encoding="utf-8").splitlines():
            line = line.split("#", 1)[0].strip()
            if not line or line.startswith("-"):
                continue
            base = line.lower()
            for sep in "=<>![~ ;":
                base = base.split(sep)[0]
            if base.strip() == "streamlit":
                r.notes.append("requirements: streamlit is already in the browser build; skipped")
                continue
            r.requirements.append(line)
    else:
        for name in r.imports:
            if name in std or name in {"streamlit", "yuktai"} or name in BLOCKED:
                continue
            r.requirements.append(PIP_NAMES.get(name, name))
    return r


def _json_for_script(value) -> str:
    text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return (text.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
            .replace("\u2028", "\\u2028").replace("\u2029", "\\u2029"))


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def build(
    app: Path,
    out: Path,
    *,
    title: Optional[str] = None,
    lang: str = "en",
    font: Optional[str] = None,
    requirements_file: Optional[Path] = None,
    force: bool = False,
    stlite_version: str = STLITE_VERSION,
    persist: Optional[str] = None,
    **yuktai_options,
) -> Report:
    """Write the static site to ``out``. Raises ValueError on problems a browser can't fix."""
    app = Path(app)
    if not app.is_file() or app.suffix != ".py":
        raise ValueError(f"{app}: give the Streamlit app's .py file")
    if lang not in SCRIPT_OF:
        raise ValueError(f"lang must be one of {sorted(SCRIPT_OF)}")
    app_dir = app.parent.resolve()
    out = Path(out)
    files = app_files(app_dir, out)
    req = requirements_file or (app_dir / "requirements.txt")
    report = check_imports(app_dir, files, req if req.is_file() else None)
    if not report.ok and not force:
        raise ValueError(_problems(report))

    if out.exists():
        shutil.rmtree(out)
    (out / "app").mkdir(parents=True)
    (out / "icons").mkdir()
    for rel in files:
        dest = out / "app" / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(app_dir / rel, dest)
    assets = Path(__file__).with_name("setu_assets")
    icons = ("icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png")
    for name in icons:
        shutil.copy2(assets / name, out / "icons" / name)
    (out / ".nojekyll").write_text("", encoding="utf-8")

    title = title or app.stem.replace("_", " ").replace("-", " ").title()
    direction = "rtl" if lang in RTL else "ltr"
    entry = app.resolve().relative_to(app_dir).as_posix()
    mount = {
        "entrypoint": entry,
        "requirements": report.requirements,
        "files": {rel.as_posix(): {"url": f"app/{rel.as_posix()}"} for rel in files},
        "streamlitConfig": {"client.toolbarMode": "viewer"},
    }
    if "yuktai" in report.imports and not (app_dir / "yuktai").exists():
        # The page already loads YuktAI; `import yuktai.setu` just needs to work in the browser.
        mount["files"]["yuktai/__init__.py"] = {"data": _SHIM_INIT}
        mount["files"]["yuktai/setu.py"] = {"data": _SHIM_SETU}
    if persist:
        mount["idbfsMountpoints"] = [persist]  # IndexedDB: files here stay in the visitor's browser
    base = STLITE.format(v=stlite_version)

    font_tags = ""
    if font:
        href = font_href(font, lang)
        font_tags = ('<style>body,.stApp :is(h1,h2,h3,h4,h5,h6,p,li,label,td,th,button,input,textarea,'
                     '[data-testid="stMarkdownContainer"]):not(code):not(pre)'
                     f'{{font-family:"{_esc(font)}",sans-serif !important}}</style>\n')
    # Loaded after the service worker takes over, so they are cached for offline use too.
    styles = [f"{base}stlite.css"] + ([font_href(font, lang)] if font else [])
    opts = {"voice_lang": f"{lang}-IN" if lang != "en" else None, **yuktai_options}
    yuktai = script_tag(**{k: v for k, v in opts.items() if v is not None})

    html = f"""<!doctype html>
<html lang="{lang}" dir="{direction}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{_esc(title)}</title>
<meta name="theme-color" content="{THEME}">
<meta name="generator" content="YuktAI Setu">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
{font_tags}<style>
body{{margin:0}}
#yk-loading{{max-width:34rem;margin:20vh auto 0;padding:0 1rem;font:1.1rem/1.6 system-ui,sans-serif;color:#1f2937;text-align:center}}
@media (prefers-color-scheme:dark){{body{{background:#0e1117}}#yk-loading{{color:#e5e7eb}}}}
</style>
</head>
<body>
<div id="root"><p id="yk-loading" role="status">{_esc(LOADING.get(lang, LOADING["en"]))}</p></div>
<noscript>This app needs JavaScript.</noscript>
<script type="module">
// First visit: let the service worker take over before anything big loads,
// so Python, Streamlit and packages are cached and the app opens offline next time.
async function offlineReady() {{
  if (!("serviceWorker" in navigator)) return;
  try {{
    await navigator.serviceWorker.register("sw.js");
    if (!navigator.serviceWorker.controller) {{
      await new Promise((done) => {{
        navigator.serviceWorker.addEventListener("controllerchange", done, {{ once: true }});
        setTimeout(done, 5000);
      }});
    }}
  }} catch (e) {{ /* still works online */ }}
}}
await offlineReady();
for (const href of {_json_for_script(styles)}) {{
  const css = document.createElement("link");
  css.rel = "stylesheet"; css.href = href;
  document.head.appendChild(css);
}}
const {{ mount }} = await import("{base}stlite.js");
mount({_json_for_script(mount)}, document.getElementById("root"));
</script>
{yuktai}
</body>
</html>
"""
    (out / "index.html").write_text(html, encoding="utf-8")

    manifest = {
        "name": title, "short_name": title[:12], "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": "#ffffff", "theme_color": THEME, "lang": lang, "dir": direction,
        "icons": [
            {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (out / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    local = (["./", "index.html", "manifest.webmanifest"] + [f"icons/{n}" for n in icons]
             + [f"app/{rel.as_posix()}" for rel in files])
    digest = hashlib.sha256()
    for name in local[1:]:
        digest.update(name.encode())
        digest.update((out / name).read_bytes())
    remote = [f"{base}stlite.css", f"{base}stlite.js"] + re.findall(r'src="(https://[^"]+)"', yuktai)
    if font:
        remote.append(font_href(font, lang))
    sw = (_SW.replace("__VERSION__", digest.hexdigest()[:12]).replace("__LOCAL__", json.dumps(local))
          .replace("__REMOTE__", json.dumps(remote)))
    (out / "sw.js").write_text(sw, encoding="utf-8")
    return report


_SHIM_INIT = '"""YuktAI is already on this page (added by Setu)."""\n__version__ = "setu"\n'
_SHIM_SETU = (
    '"""In a Setu build the page loads YuktAI itself, so enable() has nothing to do."""\n'
    "def enable(*args, **kwargs):\n    return None\n"
)


def _problems(r: Report) -> str:
    lines = ["This app can't run in a browser as it is:"]
    lines += [f"  • import {k}: needs {v}" for k, v in r.blocked.items()]
    if r.uses_secrets:
        lines.append("  • st.secrets: a static site can't keep secrets; every visitor could read them")
    lines.append("Keep it on a server (Streamlit Community Cloud), or remove these and try again. --force builds anyway.")
    return "\n".join(lines)


# Offline: the app's own files first; Python, Streamlit and packages cached the first time they load.
_SW = """// YuktAI Setu service worker. Version __VERSION__ (changes when the app changes).
const VERSION = "setu-__VERSION__";
const LOCAL = __LOCAL__;
const IMMUTABLE = ["https://cdn.jsdelivr.net/", "https://files.pythonhosted.org/", "https://fonts.gstatic.com/"];
const REFRESH = ["https://pypi.org/", "https://fonts.googleapis.com/"];

const REMOTE = __REMOTE__;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(LOCAL))
    // Known CDN files too; a failure here never blocks the app.
    .then(() => caches.open("setu-runtime").then((c) => Promise.all(REMOTE.map((u) => c.add(new Request(u, { mode: "cors" })).catch(() => null)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("setu-") && k !== VERSION && k !== "setu-runtime").map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = req.url;
  if (IMMUTABLE.some((p) => url.startsWith(p))) {
    // Pinned versions never change: cache first.
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") {
        const copy = res.clone(); // before the page reads the body
        e.waitUntil(caches.open("setu-runtime").then((c) => c.put(req, copy)));
      }
      return res;
    })));
    return;
  }
  if (REFRESH.some((p) => url.startsWith(p)) || new URL(url).origin === self.location.origin) {
    // Network first, the cached copy when offline.
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone(); // before the page reads the body
        e.waitUntil(caches.open(new URL(url).origin === self.location.origin ? VERSION : "setu-runtime").then((c) => c.put(req, copy)));
      }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error()))));
  }
});
"""
