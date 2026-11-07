"""PostgreSQL (optional). Set DATABASE_URL in backend/.env, for example
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yuktai
and install the driver once:  backend/.venv  →  pip install -r requirements-db.txt
See backend/db/README.md for the basic commands.
"""

from __future__ import annotations

from . import settings


def health() -> dict:
    url = settings.get("DATABASE_URL")
    if not url:
        return {"configured": False, "ok": False, "message": "DATABASE_URL is not set (the app works without a database)."}
    try:
        import psycopg  # installed from requirements-db.txt
    except ImportError:
        return {"configured": True, "ok": False, "message": "Install the driver: pip install -r requirements-db.txt"}
    try:
        with psycopg.connect(url, connect_timeout=3) as conn:
            version = conn.execute("select version()").fetchone()[0]
            vector = conn.execute("select count(*) from pg_extension where extname = 'vector'").fetchone()[0] > 0
        return {"configured": True, "ok": True, "postgres": version.split(" on ")[0], "pgvector": vector}
    except Exception as error:  # never show the URL: it holds the password
        return {"configured": True, "ok": False, "message": f"Could not connect: {type(error).__name__}"}
