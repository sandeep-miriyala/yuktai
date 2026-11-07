"""{{title}} API: a small Python (FastAPI) backend that runs next to the Next.js app.

    npm run dev        starts Next.js, the Rust build and this API together
    npm run dev:api    this API only:  http://localhost:8000/docs
    npm run test:api   its tests (pytest)

Add an endpoint: write a function below with @app.get or @app.post, or put it in
its own module and include an APIRouter. The interactive docs at /docs update by themselves.
"""

from __future__ import annotations

import importlib
import pkgutil
import platform

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import db, orders, rag, routes, settings
from .agents import grid

app = FastAPI(
    title="{{title}} API",
    version="0.1.0",
    description="Sample API made by YuktAI. Replace the orders endpoints with your own.",
)

# The Next.js app runs on another port, so the browser needs permission (CORS) to call this API.
# Set ALLOWED_ORIGINS in backend/.env when the site is online, e.g. https://my-app.netlify.app
origins = [o.strip() for o in settings.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])


@app.get("/api/health")
def health() -> dict:
    """Is the API up? The site's Backend page calls this."""
    return {"status": "ok", "app": "{{title}}", "python": platform.python_version()}


@app.get("/api/orders")
def list_orders(
    page: int = Query(1, ge=1, description="Page number, starting at 1"),
    size: int = Query(25, ge=1, le=500, description="Rows per page, up to 500"),
) -> dict:
    """One page of the 25 lakh sample orders."""
    pages = -(-orders.TOTAL // size)
    if page > pages:
        raise HTTPException(status_code=404, detail=f"There are {pages} pages of {size}.")
    return {"total": orders.TOTAL, "page": page, "size": size, "pages": pages, "rows": orders.page(page, size)}


@app.get("/api/orders/{order_id}")
def get_order(order_id: str) -> dict:
    """One order by its id, e.g. ORD-0000042."""
    try:
        number = int(order_id.removeprefix("ORD-"))
        return orders.order(number - 1)
    except (ValueError, IndexError):
        raise HTTPException(status_code=404, detail=f"No order {order_id}.") from None


# ── Agents and RAG ────────────────────────────────────────────────────────────
# With GROQ_API_KEY in backend/.env they use Groq; without it they work in free mode.


class Question(BaseModel):
    question: str = Field(min_length=1, max_length=500)


@app.get("/api/agents/status")
def agents_status() -> dict:
    """Which mode the agents run in. Never returns the key itself."""
    return {"groq": bool(settings.groq_key()), "mode": "groq" if settings.groq_key() else "free"}


@app.post("/api/agents/grid")
def ask_grid_agent(body: Question) -> dict:
    """Grid Agent: questions about the orders, answered with tools (LangGraph)."""
    return grid.ask(body.question)


@app.post("/api/rag/ask")
def ask_documents(body: Question) -> dict:
    """RAG: answers from backend/knowledge/*.md, with the passages it used."""
    return rag.ask(body.question)


@app.get("/api/db/health")
def database_health() -> dict:
    """PostgreSQL (optional): is DATABASE_URL set and reachable?"""
    return db.health()


# ── Your endpoints: every module in app/routes with a `router` loads by itself ──
for module in pkgutil.iter_modules(routes.__path__):
    router = getattr(importlib.import_module(f"{routes.__name__}.{module.name}"), "router", None)
    if router is not None:
        app.include_router(router)
