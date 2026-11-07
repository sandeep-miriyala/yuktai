"""Settings from backend/.env (copy backend/.env.example). Nothing here is ever sent to the browser."""

from __future__ import annotations

import os
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
PROJECT = BACKEND.parent


def _load_env(path: Path) -> None:
    """Reads KEY=value lines into the environment (values already set win)."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env(BACKEND / ".env")


def get(name: str, default: str = "") -> str:
    return os.getenv(name, default)


def groq_key() -> str:
    """Your Groq key, or "" when there is none (agents then work in free mode)."""
    return get("GROQ_API_KEY")


def is_production() -> bool:
    """YUKTAI_ENV=production turns off the developer agents (testing, assistant)."""
    return get("YUKTAI_ENV").lower() == "production"
