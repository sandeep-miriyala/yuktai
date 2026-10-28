"""YuktAI for Python web apps.

Adds YuktAI (accessibility widget, page tools, data grid, icons) to pages
rendered by Django, Flask, FastAPI or any Python template, in one line.
Everything YuktAI does runs in the visitor's browser: no API keys, no server
calls, no telemetry.

    import yuktai
    yuktai.script_tag(position="right", show_page_tools=True)

See https://yuktaidocs.netlify.app/ for every feature.
"""

from __future__ import annotations

import json
import re
from typing import Any, Mapping, Optional

__all__ = ["__version__", "YUKTAI_JS_VERSION", "cdn_url", "config_json", "script_tag", "Markup"]

__version__ = "0.1.0"

#: The YuktAI (JavaScript) release these helpers load by default.
YUKTAI_JS_VERSION = "5.3.10"

_CDNS = {
    "jsdelivr": "https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@{v}/vanilla/index.min.js",
    "unpkg": "https://unpkg.com/@yuktishaalaa/yuktai@{v}/vanilla/index.min.js",
}
_VERSION_RE = re.compile(r"^\d+(\.\d+){0,2}(-[0-9A-Za-z.]+)?$|^latest$")
_POSITIONS = {"left", "right"}
_TABS = {"copilot", "qa", "forms", "design", "ask", "voice"}
_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")


class Markup(str):
    """A string that template engines treat as safe HTML.

    Jinja2 / Flask / FastAPI and Django all recognise ``__html__``, so the
    tag is not escaped a second time.
    """

    def __html__(self) -> str:  # Jinja2 and markupsafe
        return str(self)


def cdn_url(version: str = YUKTAI_JS_VERSION, cdn: str = "jsdelivr") -> str:
    """URL of the YuktAI browser script for a version ("5.3.10", "5", "latest")."""
    if not isinstance(version, str) or not _VERSION_RE.match(version):
        raise ValueError(f"Not a valid YuktAI version: {version!r}")
    if cdn not in _CDNS:
        raise ValueError(f"cdn must be one of {sorted(_CDNS)}")
    base = _CDNS[cdn]
    return base.replace("@{v}", "") if version == "latest" else base.format(v=version)


def _build_config(
    position: Optional[str],
    primary_color: Optional[str],
    title: Optional[str],
    show_page_tools: Optional[bool],
    default_tab: Optional[str],
    voice_lang: Optional[str],
    auto_fix: Optional[bool],
    show_skip_links: Optional[bool],
    extra: Optional[Mapping[str, Any]],
) -> dict:
    cfg: dict = {}
    if position is not None:
        if position not in _POSITIONS:
            raise ValueError('position must be "left" or "right"')
        cfg["position"] = position
    if primary_color is not None:
        if not _COLOR_RE.match(primary_color):
            raise ValueError('primary_color must look like "#0a4a85"')
        cfg["primaryColor"] = primary_color
    if title is not None:
        cfg["title"] = str(title)
    if show_page_tools is not None:
        cfg["showPageTools"] = bool(show_page_tools)
    if default_tab is not None:
        if default_tab not in _TABS:
            raise ValueError(f"default_tab must be one of {sorted(_TABS)}")
        cfg["defaultTab"] = default_tab
    if voice_lang is not None:
        cfg["voiceLang"] = str(voice_lang)
    engine: dict = {}
    if auto_fix is not None:
        engine["autoFix"] = bool(auto_fix)
    if show_skip_links is not None:
        engine["showSkipLinks"] = bool(show_skip_links)
    if engine:
        cfg["config"] = engine
    if extra:
        cfg.update(dict(extra))
    return cfg


def config_json(**options: Any) -> str:
    """``window.YUKTAI_CONFIG`` as JSON that is safe inside a <script> tag."""
    cfg = _build_config(
        options.get("position"), options.get("primary_color"), options.get("title"),
        options.get("show_page_tools"), options.get("default_tab"), options.get("voice_lang"),
        options.get("auto_fix"), options.get("show_skip_links"), options.get("extra"),
    )
    text = json.dumps(cfg, ensure_ascii=False, separators=(",", ":"))
    # Never let data close the script tag or start an HTML comment.
    return text.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def script_tag(
    version: str = YUKTAI_JS_VERSION,
    *,
    position: Optional[str] = None,
    primary_color: Optional[str] = None,
    title: Optional[str] = None,
    show_page_tools: Optional[bool] = None,
    default_tab: Optional[str] = None,
    voice_lang: Optional[str] = None,
    auto_fix: Optional[bool] = None,
    show_skip_links: Optional[bool] = None,
    extra: Optional[Mapping[str, Any]] = None,
    cdn: str = "jsdelivr",
    defer: bool = True,
    nonce: Optional[str] = None,
) -> Markup:
    """HTML that loads YuktAI on a page. Put it just before ``</body>``.

    Options map to ``window.YUKTAI_CONFIG``:
    position ("left" | "right"), primary_color ("#0a4a85"), title,
    show_page_tools (adds the page tools button), default_tab
    ("copilot", "qa", "forms", "design", "ask", "voice"), voice_lang ("te-IN"),
    auto_fix and show_skip_links (accessibility engine), extra (any other
    YUKTAI_CONFIG key). ``nonce`` supports a Content Security Policy.
    """
    url = cdn_url(version, cdn)
    nonce_attr = ""
    if nonce is not None:
        if not re.match(r"^[A-Za-z0-9+/=_-]+$", nonce):
            raise ValueError("nonce contains characters that are not allowed")
        nonce_attr = f' nonce="{nonce}"'
    cfg = config_json(
        position=position, primary_color=primary_color, title=title, show_page_tools=show_page_tools,
        default_tab=default_tab, voice_lang=voice_lang, auto_fix=auto_fix, show_skip_links=show_skip_links, extra=extra,
    )
    parts = []
    if cfg != "{}":
        parts.append(f"<script{nonce_attr}>window.YUKTAI_CONFIG={cfg};</script>")
    parts.append(f'<script src="{url}"{" defer" if defer else ""} crossorigin="anonymous"{nonce_attr}></script>')
    return Markup("\n".join(parts))


def init_jinja(env: Any, **defaults: Any) -> None:
    """Make ``{{ yuktai_script() }}`` available in a Jinja2 environment.

    Flask:   yuktai.init_jinja(app.jinja_env, position="right")
    FastAPI: yuktai.init_jinja(templates.env, show_page_tools=True)
    """

    def yuktai_script(**overrides: Any) -> Markup:
        return script_tag(**{**defaults, **overrides})

    env.globals["yuktai_script"] = yuktai_script


def init_app(app: Any, **defaults: Any) -> None:
    """Flask: ``yuktai.init_app(app, position="right")``, then ``{{ yuktai_script() }}``."""
    init_jinja(app.jinja_env, **defaults)
