# Changelog

All notable changes to the `yuktai` Python package. Versions follow [Semantic Versioning](https://semver.org/).

## 0.2.0
- **Setu for Streamlit.** `yuktai.setu.enable(lang="te", font="Ramabhadra")` adds the YuktAI accessibility engine, page tools, page language and a font to a whole Streamlit app, through Streamlit components v2 (no iframe). `pip install "yuktai[setu]"`, Streamlit 1.51 or newer.
- **Publish a Streamlit app with no server.** `python -m yuktai setu app.py` (or `yuktai-setu app.py`) writes a static site that runs the app in the browser with stlite 1.12.1: web app manifest, icons, a service worker for offline use, YuktAI accessibility, language and font. It checks imports first and stops apps that need a server or use `st.secrets`; it never copies secrets, virtual environments or an earlier build.
- `python -m yuktai --version`.
- `__version__` now matches the release (0.1.1 still said 0.1.0).

## 0.1.1
- Loads `@yuktishaalaa/yuktai` 5.5.3 by default (was 5.3.10).

## 0.1.0
- First release: script tags for Django, Flask and FastAPI templates.
