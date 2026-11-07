"""YuktAI Assistant: helps you build this app. Ask it to add a page or an API endpoint,
or ask how something works.

    npm run assistant
    > add a page called contact
    > add an api called products
    > how do I run the tests?

Developer tool only: it writes files, so it is off when YUKTAI_ENV=production.
It never writes on its own: every file is shown first and needs your "y".
It writes only new files in src/app/<page>/ and backend/app/routes/, never over existing ones.
With GROQ_API_KEY a LangGraph agent understands free-form requests; without a key it
understands "add page <name>", "add api <name>" and questions about the docs.
"""

from __future__ import annotations

import re
import sys
from typing import Callable

from langchain_core.tools import tool

from .. import rag, settings
from .base import build_agent, groq_model, run_agent

Approve = Callable[[str, str], bool]
_approve: Approve = lambda path, text: False  # replaced by the terminal prompt in main()

SLUG = re.compile(r"^[a-z][a-z0-9-]{0,40}$")
NAME = re.compile(r"^[a-z][a-z0-9_]{0,40}$")


def _title(slug: str) -> str:
    return " ".join(w.capitalize() for w in re.split(r"[-_]", slug))


def page_file(slug: str) -> tuple[str, str]:
    title = _title(slug)
    path = f"src/app/{slug}/page.tsx"
    text = f'''import type {{ Metadata }} from "next";

export const metadata: Metadata = {{ title: "{title}" }};

export default function {title.replace(" ", "")}Page() {{
  return (
    <section className="wrap">
      <p className="kicker">{title}</p>
      <h1>{title}</h1>
      <p className="lead">Write this page in {path}.</p>
    </section>
  );
}}
'''
    return path, text


def api_file(name: str) -> tuple[str, str]:
    path = f"backend/app/routes/{name}.py"
    text = f'''"""/api/{name}: made by the YuktAI Assistant. Change it as you need."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/{name}", tags=["{name}"])


@router.get("")
def list_{name}() -> dict:
    return {{"items": [], "message": "Replace this with your {name}."}}
'''
    return path, text


def _write(path: str, text: str) -> str:
    _guard()
    target = settings.PROJECT / path
    if target.exists():
        return f"{path} already exists. Nothing was changed."
    if not _approve(path, text):
        return f"Not written: you said no to {path}."
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    return f"Created {path}."


def _guard() -> None:
    if settings.is_production():
        raise PermissionError("The YuktAI Assistant is a developer tool and is off when YUKTAI_ENV=production.")


@tool
def add_page(slug: str) -> str:
    """Creates a new page at /<slug>/ (lower-case letters, numbers and dashes, e.g. contact or price-list)."""
    if not SLUG.match(slug):
        return "Use lower-case letters, numbers and dashes, starting with a letter."
    result = _write(*page_file(slug))
    if result.startswith("Created"):
        result += f' Open http://localhost:3000/{slug}/ . To show it in the menu, add {{ href: "/{slug}/", label: "{_title(slug)}", key: "{slug}" }} to src/data/site.ts.'
    return result


@tool
def add_api(name: str) -> str:
    """Creates a new API endpoint at /api/<name> (lower-case letters, numbers and _). It loads by itself."""
    if not NAME.match(name):
        return "Use lower-case letters, numbers and _, starting with a letter."
    result = _write(*api_file(name))
    if result.startswith("Created"):
        result += f" Try it at http://localhost:8000/api/{name} (the API reloads by itself)."
    return result


@tool
def search_docs(question: str) -> str:
    """Searches this app's documents (backend/knowledge) for how things work."""
    found = rag.search(question)
    return "\n\n".join(f"({p['source']}) {p['text']}" for p in found) or "Nothing found in the documents."


TOOLS = [add_page, add_api, search_docs]
INSTRUCTIONS = (
    "You are the YuktAI Assistant for a developer building a YuktAI app (Next.js pages in src/app, "
    "Rust in rust/, a FastAPI backend in backend/). Use add_page and add_api to create files, and "
    "search_docs to answer how-to questions from the docs. Keep answers short and practical."
)


def _free_mode(request: str) -> dict:
    q = request.lower().strip()
    page = re.search(r"(?:add|create|new|make)\s+(?:a\s+)?page\s+(?:called\s+|named\s+)?([a-z][a-z0-9-]*)", q)
    api = re.search(r"(?:add|create|new|make)\s+(?:an?\s+)?api\s+(?:called\s+|named\s+|for\s+)?([a-z][a-z0-9_]*)", q)
    if page:
        name, args = "add_page", {"slug": page.group(1)}
    elif api:
        name, args = "add_api", {"name": api.group(1)}
    else:
        name, args = "search_docs", {"question": request}
    result = {t.name: t for t in TOOLS}[name].invoke(args)
    return {"answer": result, "steps": [{"tool": name, "args": args, "result": result}], "mode": "free"}


def ask(request: str, approve: Approve, model=None) -> dict:
    global _approve
    _guard()
    _approve = approve
    model = model or groq_model()
    if model is None:
        return _free_mode(request)
    return {**run_agent(build_agent(TOOLS, INSTRUCTIONS, model), request), "mode": "groq"}


def _terminal_approve(path: str, text: str) -> bool:
    print(f"\n── {path} ─────────────────────\n{text}────────────────────────────────")
    return input(f"Write {path}? [y/N] ").strip().lower() in ("y", "yes")


def main() -> int:
    print(f"\n✨ YuktAI Assistant ({'Groq' if settings.groq_key() else 'free mode: add page <name>, add api <name>, or ask a question'})")
    print("   Empty line or Ctrl + C to leave.\n")
    try:
        while True:
            request = input("> ").strip()
            if not request:
                return 0
            result = ask(request, _terminal_approve)
            print(f"\n{result['answer']}\n")
    except (KeyboardInterrupt, EOFError):
        print()
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
