"""``python -m yuktai setu app.py``: publish a Streamlit app with no server."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import List, Optional

from . import __version__


def _parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="python -m yuktai", description="YuktAI for Python.")
    p.add_argument("--version", action="version", version=f"yuktai {__version__}")
    sub = p.add_subparsers(dest="command")
    s = sub.add_parser(
        "setu",
        help="Turn a Streamlit app into a static, offline, installable site (no server).",
        description="Builds a folder you can publish on GitHub Pages or Netlify. The app runs in the "
                    "visitor's browser (stlite), with YuktAI accessibility, your language and a service worker.",
    )
    s.add_argument("app", type=Path, help="the Streamlit app, for example app.py")
    s.add_argument("--out", type=Path, default=Path("dist"), help="output folder (default: dist)")
    s.add_argument("--title", help="page and app name (default: from the file name)")
    s.add_argument("--lang", default="en", help="page language: te, hi, ta, kn, ml, en, … (default: en)")
    s.add_argument("--font", help='font for that language, for example "Ramabhadra" or "Mukta"')
    s.add_argument("--requirements", type=Path, help="requirements file (default: requirements.txt next to the app)")
    s.add_argument("--persist", metavar="DIR", help="a folder (like /home/pyodide/data) kept in the browser between visits")
    s.add_argument("--no-page-tools", action="store_true", help="hide the YuktAI page tools button")
    s.add_argument("--position", choices=["left", "right"], help="where the YuktAI buttons sit")
    s.add_argument("--force", action="store_true", help="build even if some imports can't run in a browser")
    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = _parser().parse_args(argv)
    if args.command != "setu":
        _parser().print_help()
        return 1
    from .setu_export import build

    try:
        report = build(
            args.app, args.out, title=args.title, lang=args.lang, font=args.font,
            requirements_file=args.requirements, force=args.force, persist=args.persist,
            show_page_tools=not args.no_page_tools, position=args.position,
        )
    except ValueError as e:
        print(f"✗ {e}", file=sys.stderr)
        return 2

    print(f"✓ {args.app} → {args.out}/  (సేతు: server లేదు, offline, install)")
    if report.requirements:
        print(f"  packages loaded in the browser: {', '.join(report.requirements)}")
    for name, why in report.warnings.items():
        print(f"  ⚠ import {name}: {why}")
    for name, why in report.blocked.items():
        print(f"  ✗ import {name}: needs {why} (built anyway with --force)")
    if report.uses_secrets:
        print("  ✗ st.secrets: a static site can't keep secrets (built anyway with --force)")
    for note in report.notes:
        print(f"  · {note}")
    print(f"  Try it: python -m http.server -d {args.out} 8000  →  http://localhost:8000")
    print(f"  Publish: upload {args.out}/ to GitHub Pages or Netlify Drop.")
    return 0


def setu_main(argv: Optional[List[str]] = None) -> int:
    """``yuktai-setu app.py`` (same as ``python -m yuktai setu app.py``)."""
    return main(["setu", *(sys.argv[1:] if argv is None else argv)])


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
