# yuktai (Python)

Add **YuktAI** to pages rendered by **Django, Flask or FastAPI** in one line: the accessibility widget (♿), the page tools (🛠: QA report, forms, design, Ask page, voice) and everything in `window.yuktai` (data grid, icons, page RAG).

YuktAI runs in the visitor's browser: no API keys, no server calls, no telemetry. This package only writes the right `<script>` tags for you.

```bash
pip install yuktai
```

📖 Docs and live demos: https://yuktaidocs.netlify.app/ · npm: `@yuktishaalaa/yuktai`

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

## Options

| Option | Meaning |
|---|---|
| `version` | YuktAI release to load (default `5.3.10`), or `"latest"` |
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

v0.2 adds YuktAI's Rust engines to Python: fast grid search and the Telugu-aware BM25 index for RAG retrieval, with the same results as the browser.

## License

GPL-3.0, same as YuktAI. © Sandeep Miriyala, Yuktishaalaa AI Lab.
