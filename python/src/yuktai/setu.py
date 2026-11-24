"""YuktAI Setu (సేతు, "bridge") for Streamlit.

One line adds YuktAI to a whole Streamlit app: the accessibility engine
(safe ARIA, contrast, read aloud, dark mode), the page tools with Ask this
page, the right ``lang`` for screen readers and, if you want, a font for
your language. Everything runs in the visitor's browser: no API keys, no
LLM calls, nothing sent anywhere.

    import streamlit as st
    import yuktai.setu as yk

    yk.enable(lang="te", show_page_tools=True)

Needs Streamlit 1.51 or newer (``st.components.v2``), installed with
``pip install "yuktai[setu]"``. To publish the same app with no server,
offline and installable, run ``python -m yuktai setu app.py``.
"""

from __future__ import annotations

import re
from typing import Any, Mapping, Optional

from . import YUKTAI_JS_VERSION, _build_config, cdn_url

__all__ = ["enable", "font_href", "mount_data", "FONT_FAMILIES", "SCRIPT_OF"]

#: Fonts offered for each script (same list as @yuktishaalaa/shubhalekha).
FONT_FAMILIES = {
    "latin": ["Inter", "Poppins", "Lora", "Playfair Display", "Cormorant Garamond", "Great Vibes"],
    "telugu": ["Noto Sans Telugu", "Noto Serif Telugu", "Ramabhadra", "Mandali", "NTR", "Gidugu", "Gurajada", "Suranna",
               "Tenali Ramakrishna", "Ramaraja", "Mallanna", "Peddana", "Sree Krushnadevaraya", "Timmana", "Hind Guntur", "Anek Telugu"],
    "devanagari": ["Noto Sans Devanagari", "Noto Serif Devanagari", "Hind", "Mukta", "Tiro Devanagari Hindi", "Kalam", "Martel",
                   "Baloo 2", "Rozha One", "Yatra One", "Amita", "Laila", "Khand"],
    "bengali": ["Noto Sans Bengali", "Noto Serif Bengali", "Hind Siliguri", "Baloo Da 2", "Tiro Bangla", "Galada", "Atma", "Anek Bangla"],
    "gurmukhi": ["Noto Sans Gurmukhi", "Noto Serif Gurmukhi", "Mukta Mahee", "Baloo Paaji 2", "Anek Gurmukhi"],
    "gujarati": ["Noto Sans Gujarati", "Noto Serif Gujarati", "Hind Vadodara", "Mukta Vaani", "Baloo Bhai 2", "Rasa", "Shrikhand", "Anek Gujarati"],
    "oriya": ["Noto Sans Oriya", "Noto Serif Oriya", "Baloo Bhaina 2", "Anek Odia"],
    "tamil": ["Noto Sans Tamil", "Noto Serif Tamil", "Mukta Malar", "Catamaran", "Hind Madurai", "Meera Inimai", "Arima", "Baloo Thambi 2", "Anek Tamil"],
    "kannada": ["Noto Sans Kannada", "Noto Serif Kannada", "Baloo Tamma 2", "Tiro Kannada", "Anek Kannada", "Hubballi"],
    "malayalam": ["Noto Sans Malayalam", "Noto Serif Malayalam", "Manjari", "Gayathri", "Chilanka", "Baloo Chettan 2", "Anek Malayalam"],
    "arabic": ["Noto Nastaliq Urdu", "Gulzar", "Noto Naskh Arabic", "Lateef"],
    "meetei": ["Noto Sans Meetei Mayek"],
    "olchiki": ["Noto Sans Ol Chiki"],
}
SCRIPT_OF = {
    "en": "latin", "te": "telugu", "hi": "devanagari", "mr": "devanagari", "ne": "devanagari", "sa": "devanagari",
    "kok": "devanagari", "mai": "devanagari", "doi": "devanagari", "brx": "devanagari", "bn": "bengali", "as": "bengali",
    "pa": "gurmukhi", "gu": "gujarati", "or": "oriya", "ta": "tamil", "kn": "kannada", "ml": "malayalam",
    "ur": "arabic", "ks": "arabic", "sd": "arabic", "mni": "meetei", "sat": "olchiki",
}
RTL = {"ur", "ks", "sd"}
_LANG_RE = re.compile(r"^[a-z]{2,3}$")


def _check_lang(lang: Optional[str]) -> Optional[str]:
    if lang is None:
        return None
    if not isinstance(lang, str) or not _LANG_RE.match(lang) or lang not in SCRIPT_OF:
        raise ValueError(f"lang must be one of {sorted(SCRIPT_OF)}")
    return lang


def font_href(family: str, lang: str) -> str:
    """Google Fonts stylesheet URL for a font offered for ``lang``."""
    lang = _check_lang(lang) or "en"
    allowed = FONT_FAMILIES[SCRIPT_OF[lang]]
    if family not in allowed:
        raise ValueError(f"font for {lang!r} must be one of: {', '.join(allowed)}")
    return "https://fonts.googleapis.com/css2?family=" + family.replace(" ", "+") + "&display=swap"


# Runs once per page, however often Streamlit reruns the script.
# Only data from Python reaches it (never user input), and it only adds
# a <script> for the pinned YuktAI release, the lang/dir attributes and fonts.
_JS = r"""
export default function (component) {
  const d = component.data || {};
  const doc = document;
  const root = doc.documentElement;
  // The component itself takes no room in the app.
  const box = component.parentElement && component.parentElement.closest
    ? component.parentElement.closest('[data-testid="stElementContainer"]') : null;
  if (box) box.style.display = "none";

  if (d.lang) { root.lang = d.lang; root.dir = d.dir || "ltr"; }

  if (d.fontHref && !doc.getElementById("yuktai-setu-font")) {
    const link = doc.createElement("link");
    link.id = "yuktai-setu-font"; link.rel = "stylesheet"; link.href = d.fontHref;
    doc.head.appendChild(link);
    const style = doc.createElement("style");
    style.id = "yuktai-setu-font-css";
    // Text gets the chosen font; code and Streamlit's icon font keep theirs.
    style.textContent = '.stApp :is(h1,h2,h3,h4,h5,h6,p,li,label,td,th,button,input,textarea,[data-testid="stMarkdownContainer"]):not(code):not(pre){font-family:"'
      + d.fontFamily + '", var(--yk-fallback, sans-serif) !important}';
    doc.head.appendChild(style);
  }

  if (!window.__yuktaiSetu && d.src) {
    window.__yuktaiSetu = d.src;
    if (d.config) window.YUKTAI_CONFIG = Object.assign({}, window.YUKTAI_CONFIG || {}, d.config);
    const s = doc.createElement("script");
    s.src = d.src; s.defer = true; s.crossOrigin = "anonymous"; s.id = "yuktai-setu";
    doc.head.appendChild(s);
  }
}
"""

_renderer = None


def _component():
    global _renderer
    if _renderer is None:
        try:
            import streamlit as st  # optional dependency
            register = st.components.v2.component
        except (ImportError, AttributeError) as e:  # pragma: no cover - message only
            raise ImportError(
                'yuktai.setu needs Streamlit 1.51 or newer: pip install "yuktai[setu]"'
            ) from e
        _renderer = register("yuktai_setu", js=_JS, isolate_styles=False)
    return _renderer


def mount_data(
    *,
    lang: Optional[str] = None,
    font: Optional[str] = None,
    version: str = YUKTAI_JS_VERSION,
    cdn: str = "jsdelivr",
    position: Optional[str] = None,
    primary_color: Optional[str] = None,
    title: Optional[str] = None,
    show_page_tools: Optional[bool] = None,
    default_tab: Optional[str] = None,
    voice_lang: Optional[str] = None,
    auto_fix: Optional[bool] = None,
    show_skip_links: Optional[bool] = None,
    extra: Optional[Mapping[str, Any]] = None,
) -> dict:
    """The data ``enable()`` sends to the browser (useful for tests)."""
    lang = _check_lang(lang)
    if font is not None and lang is None:
        raise ValueError("give lang together with font, for example lang='te', font='Ramabhadra'")
    if voice_lang is None and lang is not None:
        voice_lang = f"{lang}-IN" if lang != "en" else None
    cfg = _build_config(position, primary_color, title, show_page_tools, default_tab, voice_lang,
                        auto_fix, show_skip_links, extra)
    data: dict = {"src": cdn_url(version, cdn), "config": cfg}
    if lang:
        data["lang"] = lang
        data["dir"] = "rtl" if lang in RTL else "ltr"
    if font:
        data["fontHref"] = font_href(font, lang)  # type: ignore[arg-type]
        data["fontFamily"] = font
    return data


def enable(*, key: str = "yuktai-setu", **options: Any) -> None:
    """Add YuktAI to this Streamlit app. Call it once, near the top of the script.

    Options: lang ("te", "hi", "ta", … one of 23), font (a font offered for that
    language, such as "Ramabhadra"), and the same options as
    ``yuktai.script_tag``: position, primary_color, title, show_page_tools,
    default_tab, voice_lang (defaults to "<lang>-IN"), auto_fix,
    show_skip_links, extra, version, cdn.
    """
    data = mount_data(**options)
    _component()(data=data, key=key)
