# yuktai (Python)

Add **YuktAI** to pages rendered by **Django, Flask, FastAPI or Streamlit** in one line: the accessibility widget (♿), the page tools (🛠: QA report, forms, design, Ask page, voice) and everything in `window.yuktai` (data grid, icons, page RAG).

YuktAI runs in the visitor's browser: no API keys, no server calls, no telemetry. This package only writes the right `<script>` tags for you.

```bash
pip install yuktai
```

📖 Docs and live demos: https://sandeep-miriyala.github.io/yuktai/ · npm: `@yuktishaalaa/yuktai`

## Any Python template

```python
import yuktai

html = yuktai.script_tag(position="right", show_page_tools=True, voice_lang="te-IN")
# put `html` just before </body>
```

## Flask

```python
import yuktai
yuktai.init_app(app, position="right", show_page_tools=True)
```
```html
{{ yuktai_script() }}   <!-- just before </body> -->
```

## FastAPI (Jinja2 templates)

```python
from fastapi.templating import Jinja2Templates
import yuktai

templates = Jinja2Templates(directory="templates")
yuktai.init_jinja(templates.env, show_page_tools=True)
```
```html
{{ yuktai_script() }}
```

## Django

```python
# settings.py
INSTALLED_APPS = [..., "yuktai"]
YUKTAI = {"position": "right", "show_page_tools": True}   # optional defaults
```
```html
{% load yuktai_tags %}
{% yuktai_script %}
```

## Streamlit: Setu (సేతు)

Setu ("bridge") adds YuktAI to a whole Streamlit app in one line. It uses Streamlit's components v2, so it works on the app page itself, not inside an iframe. Needs Streamlit 1.51 or newer.

```bash
pip install "yuktai[setu]"
```

```python
import streamlit as st
import yuktai.setu as yk

yk.enable(lang="te", font="Ramabhadra", show_page_tools=True)
st.title("టోకెన్ మీటర్")
```

- `lang`: one of 23 codes (`te`, `hi`, `ta`, `kn`, `ml`, `bn`, `ur`, …). Sets the page language and direction, and `voice_lang` (for example `te-IN`).
- `font`: a well-known font for that script, the same list as `@yuktishaalaa/shubhalekha` (Ramabhadra, Mandali, Mukta, Meera Inimai, Gulzar, …).
- Every option of `script_tag()` below works too. YuktAI loads once, however often Streamlit reruns the script.

## Publish a Streamlit app with no server

```bash
python -m yuktai setu app.py --lang te --font Ramabhadra
python -m http.server -d dist 8000      # try it at http://localhost:8000
```

`dist/` is a static site: the app runs in the visitor's browser (Python on WebAssembly, through [stlite](https://github.com/whitphx/stlite)), with YuktAI accessibility, your language, a web app manifest and a service worker. It installs like an app, opens offline after the first visit and never goes to sleep. Publish it on GitHub Pages or Netlify for free. `yuktai-setu app.py` does the same.

| Option | What it does |
|---|---|
| `--out` | Output folder (default `dist`) |
| `--title` | App name (default: from the file name) |
| `--lang`, `--font` | Page language and font |
| `--requirements` | Requirements file (default: `requirements.txt` next to the app, else found from your imports) |
| `--persist DIR` | A folder kept in the browser (IndexedDB) between visits |
| `--no-page-tools`, `--position` | YuktAI buttons |
| `--force` | Build even when some imports can't run in a browser |

Before writing anything, Setu reads your imports. Apps that need a server (PostgreSQL, MySQL, MongoDB, Redis, PyTorch, TensorFlow, subprocess, `st.secrets`) are stopped with the reason. Imports that work with a catch (OpenAI or Anthropic keys would be public, `requests` needs CORS) get a warning. It never copies `.streamlit/secrets.toml`, `.env`, virtual environments or an earlier build.

Good for dashboards, calculators, reports and student projects. The first visit downloads Python (tens of MB); later visits come from the cache.

## Options

| Option | Meaning |
|---|---|
| `version` | YuktAI release to load (default `5.5.3`), or `"latest"` |
| `position` | `"left"` or `"right"` |
| `primary_color` | Button colour, e.g. `"#0a4a85"` |
| `title` | Settings dialog title |
| `show_page_tools` | Adds the 🛠 page tools button |
| `default_tab` | `copilot`, `qa`, `forms`, `design`, `ask` or `voice` |
| `voice_lang` | Speech language, e.g. `"te-IN"` |
| `auto_fix`, `show_skip_links` | Accessibility engine options |
| `extra` | Any other `YUKTAI_CONFIG` key |
| `cdn` | `"jsdelivr"` (default) or `"unpkg"` |
| `nonce` | For pages with a Content Security Policy |

Values are written as safe JSON, so they can't break out of the script tag.

## Coming next

v0.3 adds YuktAI's Rust engines to Python: fast grid search and the Telugu-aware BM25 index for RAG retrieval, with the same results as the browser.

## License

GPL-3.0, same as YuktAI. © Sandeep Miriyala, Yuktishaalaa AI Lab.
