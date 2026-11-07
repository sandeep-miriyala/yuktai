"""Testing Agent: runs the app's checks and explains what failed.

    npm run agent:test             all checks, then a summary
    npm run agent:test -- "why does the grid test fail?"

Developer tool only: it runs commands, so it refuses when YUKTAI_ENV=production.
It can only run the checks in CHECKS below (an allowlist); nothing else.
With GROQ_API_KEY a LangGraph agent picks the checks and explains failures in plain words;
without a key it runs every check and prints the failing lines.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from langchain_core.tools import tool

from .. import settings
from .base import build_agent, groq_model, run_agent

ROOT = settings.PROJECT
NPM = "npm.cmd" if sys.platform == "win32" else "npm"
NPX = "npx.cmd" if sys.platform == "win32" else "npx"

# name → (what it checks, command, folder)
CHECKS: dict[str, tuple[str, list[str], Path]] = {
    "lint": ("Code style and React rules (ESLint)", [NPM, "run", "lint"], ROOT),
    "site": ("The built site: every page exists (npm test, needs npm run build first)", [NPM, "test"], ROOT),
    "api": ("The Python API (pytest)", [sys.executable, "-m", "pytest", "-q"], settings.BACKEND),
    "e2e": ("Pages in a real browser (Playwright)", [NPX, "playwright", "test", "--reporter=line"], ROOT),
}
TIMEOUT = 600


def _guard() -> None:
    if settings.is_production():
        raise PermissionError("The Testing Agent is a developer tool and is off when YUKTAI_ENV=production.")


def run_check_now(name: str) -> dict:
    """Runs one allowed check. Returns passed, and the last lines of its output."""
    _guard()
    if name not in CHECKS:
        return {"check": name, "passed": False, "output": f"Unknown check. Allowed: {', '.join(CHECKS)}"}
    _, command, cwd = CHECKS[name]
    if name == "e2e" and not (ROOT / "playwright.config.ts").exists():
        return {"check": name, "passed": False, "output": "No playwright.config.ts in this app."}
    if shutil.which(command[0]) is None and not Path(command[0]).exists():
        return {"check": name, "passed": False, "output": f"{command[0]} was not found on this computer."}
    try:
        done = subprocess.run(command, cwd=cwd, capture_output=True, text=True, timeout=TIMEOUT, encoding="utf-8", errors="replace")
    except subprocess.TimeoutExpired:
        return {"check": name, "passed": False, "output": f"Stopped after {TIMEOUT} seconds."}
    lines = (done.stdout + "\n" + done.stderr).strip().splitlines()
    return {"check": name, "passed": done.returncode == 0, "output": "\n".join(lines[-40:])}


@tool
def list_checks() -> str:
    """The checks this agent can run."""
    return "; ".join(f"{name}: {about}" for name, (about, _, _) in CHECKS.items())


@tool
def run_check(name: str) -> str:
    """Runs one check by name (lint, site, api, e2e) and returns whether it passed and its last output lines."""
    r = run_check_now(name)
    return f"{r['check']}: {'PASSED' if r['passed'] else 'FAILED'}\n{r['output']}"


INSTRUCTIONS = (
    "You are the Testing Agent of a YuktAI app (Next.js, Rust, Python API). Run the checks that fit the request "
    "with run_check (list_checks shows them). Then explain briefly: what passed, what failed, the likely cause "
    "and the exact file or command to fix it. Do not invent results."
)


def ask(request: str = "Run every check and tell me what to fix.", model=None) -> dict:
    _guard()
    model = model or groq_model()
    if model is None:
        results = [run_check_now(name) for name in CHECKS]
        failed = [r for r in results if not r["passed"]]
        summary = "All checks passed." if not failed else "Failed: " + ", ".join(r["check"] for r in failed) + "."
        return {"answer": summary, "steps": [{"tool": "run_check", "args": {"name": r["check"]}, "result": r["output"]} for r in results], "mode": "free"}
    return {**run_agent(build_agent([list_checks, run_check], INSTRUCTIONS, model, max_steps=8), request), "mode": "groq"}


def main() -> int:
    request = " ".join(sys.argv[1:]) or "Run every check and tell me what to fix."
    print(f"\n🧪 Testing Agent ({'Groq' if settings.groq_key() else 'free mode: no GROQ_API_KEY'})\n")
    result = ask(request)
    for step in result["steps"]:
        print(f"── {step['tool']} {step['args']}\n{step['result']}\n")
    print(f"➜ {result['answer']}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
