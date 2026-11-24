"""Setu: Streamlit inside (yk.enable) and the static export (python -m yuktai setu)."""

import json
import re
import subprocess
import sys
import types

import pytest

import yuktai
from yuktai import setu
from yuktai.cli import main, setu_main
from yuktai.setu_export import app_files, build, check_imports


# ---------- part A: data sent to the browser ----------

def test_enable_data_defaults_to_language_voice():
    d = setu.mount_data(lang="te", show_page_tools=True)
    assert d["src"] == yuktai.cdn_url()
    assert d["lang"] == "te" and d["dir"] == "ltr"
    assert d["config"] == {"showPageTools": True, "voiceLang": "te-IN"}
    assert "fontHref" not in d


def test_font_and_rtl():
    d = setu.mount_data(lang="ur", font="Gulzar")
    assert d["dir"] == "rtl"
    assert d["fontHref"] == "https://fonts.googleapis.com/css2?family=Gulzar&display=swap"
    assert d["fontFamily"] == "Gulzar"


@pytest.mark.parametrize("kwargs", [
    {"lang": "xx"}, {"lang": "te", "font": "Comic Sans"}, {"font": "Ramabhadra"}, {"lang": "te", "position": "top"},
])
def test_bad_options_are_refused(kwargs):
    with pytest.raises(ValueError):
        setu.mount_data(**kwargs)


def test_every_language_has_fonts_like_shubhalekha():
    assert set(setu.SCRIPT_OF) >= {"te", "hi", "ta", "kn", "ml", "bn", "ur", "sat", "mni", "en"}
    for lang, script in setu.SCRIPT_OF.items():
        assert setu.FONT_FAMILIES[script], lang


def test_js_only_loads_once_and_hides_itself():
    js = setu._JS
    assert "window.__yuktaiSetu" in js and "closest('[data-testid=\"stElementContainer\"]')" in js
    assert "innerHTML" not in js, "never writes HTML from data"


def test_enable_registers_a_v2_component(monkeypatch):
    calls = {}

    class Fake:
        def __call__(self, **kw):
            calls["mount"] = kw

    def register(name, **kw):
        calls["register"] = (name, kw)
        return Fake()

    st = types.SimpleNamespace(components=types.SimpleNamespace(v2=types.SimpleNamespace(component=register)))
    monkeypatch.setitem(sys.modules, "streamlit", st)
    monkeypatch.setattr(setu, "_renderer", None)
    setu.enable(lang="hi", font="Mukta")
    name, kw = calls["register"]
    assert name == "yuktai_setu" and kw["isolate_styles"] is False and "export default function" in kw["js"]
    assert calls["mount"]["key"] == "yuktai-setu"
    assert calls["mount"]["data"]["lang"] == "hi" and calls["mount"]["data"]["fontFamily"] == "Mukta"


# ---------- part B: static export ----------

APP = '''import streamlit as st
import pandas as pd
from helpers import double
st.title("టోకెన్ మీటర్")
st.write(double(2))
'''


@pytest.fixture
def app_dir(tmp_path):
    d = tmp_path / "myapp"
    (d / "pages").mkdir(parents=True)
    (d / "app.py").write_text(APP, encoding="utf-8")
    (d / "helpers.py").write_text("def double(x):\n    return 2 * x\n", encoding="utf-8")
    (d / "pages" / "about.py").write_text("import streamlit as st\nst.write('about')\n", encoding="utf-8")
    (d / "data.csv").write_text("a,b\n1,2\n", encoding="utf-8")
    (d / "streamlit.log").write_text("log\n", encoding="utf-8")
    (d / ".streamlit").mkdir()
    (d / ".streamlit" / "config.toml").write_text("[theme]\nbase='light'\n", encoding="utf-8")
    (d / ".streamlit" / "secrets.toml").write_text("KEY='do-not-publish'\n", encoding="utf-8")
    (d / ".venv" / "lib").mkdir(parents=True)
    (d / ".venv" / "lib" / "x.py").write_text("x=1\n", encoding="utf-8")
    return d


def test_files_skip_secrets_logs_and_virtualenvs(app_dir):
    names = {p.as_posix() for p in app_files(app_dir)}
    assert names == {"app.py", "helpers.py", "pages/about.py", "data.csv", ".streamlit/config.toml"}


def test_build_writes_a_complete_offline_site(app_dir, tmp_path):
    out = tmp_path / "dist"
    r = build(app_dir / "app.py", out, lang="te", font="Ramabhadra", title="టోకెన్ మీటర్")
    assert r.requirements == ["pandas"], "helpers is local, streamlit is built in"
    for f in ["index.html", "manifest.webmanifest", "sw.js", ".nojekyll", "icons/icon-512.png", "icons/maskable-512.png",
              "app/app.py", "app/helpers.py", "app/pages/about.py", "app/data.csv", "app/.streamlit/config.toml"]:
        assert (out / f).is_file(), f
    assert not (out / "app/.streamlit/secrets.toml").exists()
    html = (out / "index.html").read_text(encoding="utf-8")
    assert '<html lang="te" dir="ltr">' in html
    assert 'await import("https://cdn.jsdelivr.net/npm/@stlite/browser@1.12.1/build/stlite.js")' in html and "stlite.css" in html
    assert html.index("await offlineReady()") < html.index("await import("), "service worker first, then the big files"
    assert html.index("await offlineReady()") < html.index("family=Ramabhadra"), "font loads after the service worker, so it works offline"
    assert "family=Ramabhadra" in html and "యాప్ సిద్ధమవుతోంది" in html
    assert 'rel="manifest"' in html and 'register("sw.js")' in html
    assert "@yuktishaalaa/yuktai@" in html and '"voiceLang":"te-IN"' in html
    m = re.search(r"mount\((\{.*?\}), document", html, re.S)
    cfg = json.loads(m.group(1))
    assert cfg["entrypoint"] == "app.py" and cfg["requirements"] == ["pandas"]
    assert cfg["files"]["pages/about.py"] == {"url": "app/pages/about.py"}
    man = json.loads((out / "manifest.webmanifest").read_text(encoding="utf-8"))
    assert man["display"] == "standalone" and man["lang"] == "te" and len(man["icons"]) == 3
    sw = (out / "sw.js").read_text(encoding="utf-8")
    assert '"app/helpers.py"' in sw and "cdn.jsdelivr.net" in sw and "setu-" in sw
    remote = json.loads(re.search(r"const REMOTE = (\[.*?\]);", sw).group(1))
    assert any(u.endswith("stlite.js") for u in remote) and any("yuktai@" in u for u in remote)
    assert any("family=Ramabhadra" in u for u in remote)


def test_version_changes_only_when_the_app_changes(app_dir, tmp_path):
    def version():
        build(app_dir / "app.py", tmp_path / "d")
        return re.search(r'VERSION = "setu-(\w+)"', (tmp_path / "d/sw.js").read_text()).group(1)
    a, b = version(), version()
    assert a == b
    (app_dir / "helpers.py").write_text("def double(x):\n    return x + x\n", encoding="utf-8")
    assert version() != a


def test_server_only_apps_are_stopped_with_reasons(app_dir, tmp_path):
    (app_dir / "db.py").write_text("import psycopg2\nimport streamlit as st\nst.secrets['x']\n", encoding="utf-8")
    with pytest.raises(ValueError) as e:
        build(app_dir / "app.py", tmp_path / "d")
    assert "psycopg2" in str(e.value) and "st.secrets" in str(e.value)
    r = build(app_dir / "app.py", tmp_path / "d", force=True)
    assert "psycopg2" in r.blocked and r.uses_secrets and "psycopg2" not in r.requirements


def test_warnings_and_requirements_file(app_dir):
    (app_dir / "app.py").write_text("import streamlit as st\nimport openai\nimport sklearn\nimport PIL\n", encoding="utf-8")
    r = check_imports(app_dir, app_files(app_dir))
    assert "openai" in r.warnings and r.requirements == ["Pillow", "openai", "scikit-learn"]
    (app_dir / "requirements.txt").write_text("streamlit==1.40\naltair>=5  # charts\n\n-r other.txt\n", encoding="utf-8")
    r = check_imports(app_dir, app_files(app_dir), app_dir / "requirements.txt")
    assert r.requirements == ["altair>=5"] and any("streamlit" in n for n in r.notes)


def test_cli(app_dir, tmp_path, capsys):
    out = tmp_path / "site"
    assert main(["setu", str(app_dir / "app.py"), "--out", str(out), "--lang", "hi", "--font", "Mukta"]) == 0
    text = capsys.readouterr().out
    assert "pandas" in text and "http.server" in text
    assert '<html lang="hi"' in (out / "index.html").read_text(encoding="utf-8")
    assert setu_main([str(app_dir / "nope.py"), "--out", str(out)]) == 2
    r = subprocess.run([sys.executable, "-m", "yuktai", "--version"], capture_output=True, text=True)
    assert r.stdout.strip() == f"yuktai {yuktai.__version__}"


def test_output_folder_inside_app_is_not_copied_into_itself(app_dir):
    build(app_dir / "app.py", app_dir / "dist")
    build(app_dir / "app.py", app_dir / "dist")
    assert not (app_dir / "dist/app/dist").exists()


def test_an_old_build_in_the_app_folder_is_never_published(app_dir, tmp_path):
    build(app_dir / "app.py", app_dir / "old-dist")  # an earlier run, different folder
    build(app_dir / "app.py", tmp_path / "new")
    assert not (tmp_path / "new/app/old-dist").exists()
    assert (tmp_path / "new/app/data.csv").is_file()


def test_import_yuktai_setu_works_in_the_browser_build(app_dir, tmp_path):
    (app_dir / "app.py").write_text("import streamlit as st\nimport yuktai.setu as yk\nyk.enable(lang='te')\n", encoding="utf-8")
    r = build(app_dir / "app.py", tmp_path / "d", lang="te")
    assert "yuktai" not in r.requirements
    html = (tmp_path / "d/index.html").read_text(encoding="utf-8")
    cfg = json.loads(re.search(r"mount\((\{.*?\}), document", html, re.S).group(1))
    assert "def enable" in cfg["files"]["yuktai/setu.py"]["data"]
    ns = {}
    exec(cfg["files"]["yuktai/setu.py"]["data"], ns)
    assert ns["enable"](lang="te", font="Ramabhadra") is None


def test_service_worker_copies_responses_before_the_page_reads_them(app_dir, tmp_path):
    build(app_dir / "app.py", tmp_path / "d")
    sw = (tmp_path / "d/sw.js").read_text(encoding="utf-8")
    assert "res.clone()" not in sw.replace("const copy = res.clone()", ""), "clone must happen before the response is returned"
    assert sw.count("const copy = res.clone()") == 2 and "c.put(req, copy)" in sw
