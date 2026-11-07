"""Grid Agent: answers questions about the orders with tools (count, total, average, top, by city).

With GROQ_API_KEY: a LangGraph agent picks the tools (tool calling).
Without a key (free mode): simple questions are understood by rules, using the same tools.
Read-only: no tool changes any data.
"""

from __future__ import annotations

import re
from functools import lru_cache
from typing import Optional

from langchain_core.tools import tool

from .. import orders, settings
from .base import build_agent, groq_model, run_agent

INSTRUCTIONS = (
    "You answer questions about sample orders (columns: id, customer, city, amount in rupees, date, paid). "
    "Use the tools for every number; never guess. Answer in one or two short sentences, in the user's language. "
    f"Cities: {', '.join(orders.CITIES)}. The tools look at the first AGENT_ROWS sample orders; say so in the answer."
)


def indian(n: float, decimals: int = 0) -> str:
    """Indian digit grouping: 2500000 → 25,00,000."""
    sign, n = ("-" if n < 0 else ""), abs(n)
    whole, _, frac = f"{n:.{decimals}f}".partition(".")
    head, tail = whole[:-3], whole[-3:]
    groups = [head[max(0, i - 2):i] for i in range(len(head), 0, -2)][::-1]
    return sign + ",".join([*groups, tail] if head else [tail]) + (f".{frac}" if frac else "")


@lru_cache(maxsize=1)
def rows() -> list[dict]:
    """The orders the agent works on: the first AGENT_ROWS (default 1 lakh) of the 25 lakh."""
    count = min(int(settings.get("AGENT_ROWS", "100000")), orders.TOTAL)
    return [orders.order(i) for i in range(count)]


def _pick(city: Optional[str], paid: Optional[bool], min_amount: Optional[float]) -> list[dict]:
    city = city.strip().lower() if city else None
    return [
        r for r in rows()
        if (city is None or r["city"].lower() == city)
        and (paid is None or r["paid"] == paid)
        and (min_amount is None or r["amount"] >= min_amount)
    ]


@tool
def count_orders(city: Optional[str] = None, paid: Optional[bool] = None, min_amount: Optional[float] = None) -> str:
    """Counts orders. Filters: city, paid (true/false), min_amount in rupees."""
    return f"{indian(len(_pick(city, paid, min_amount)))} orders"


@tool
def total_amount(city: Optional[str] = None, paid: Optional[bool] = None) -> str:
    """Adds up the amount (₹) of the matching orders."""
    return f"₹{indian(sum(r['amount'] for r in _pick(city, paid, None)), 2)}"


@tool
def average_amount(city: Optional[str] = None, paid: Optional[bool] = None) -> str:
    """Average amount (₹) of the matching orders."""
    chosen = _pick(city, paid, None)
    return f"₹{indian(sum(r['amount'] for r in chosen) / len(chosen), 2)}" if chosen else "no orders"


@tool
def top_orders(n: int = 5, city: Optional[str] = None) -> str:
    """The n biggest orders by amount (n up to 20)."""
    best = sorted(_pick(city, None, None), key=lambda r: r["amount"], reverse=True)[: max(1, min(n, 20))]
    return "; ".join(f"{r['id']} {r['customer']} {r['city']} ₹{indian(r['amount'], 2)}" for r in best)


@tool
def orders_by_city(paid: Optional[bool] = None) -> str:
    """Number of orders in each city, most first."""
    counts: dict[str, int] = {}
    for r in _pick(None, paid, None):
        counts[r["city"]] = counts.get(r["city"], 0) + 1
    return "; ".join(f"{c}: {indian(n)}" for c, n in sorted(counts.items(), key=lambda x: -x[1]))


TOOLS = [count_orders, total_amount, average_amount, top_orders, orders_by_city]


def _free_mode(question: str) -> dict:
    """No key: understand simple questions with rules (English and a few Telugu / Hindi words)."""
    q = question.lower()
    city = next((c for c in orders.CITIES if c.lower() in q), None)
    paid = False if re.search(r"unpaid|not paid|due|బాకీ|बकाया", q) else True if re.search(r"\bpaid\b|చెల్లించిన", q) else None
    if re.search(r"top|biggest|highest|largest", q):
        name, args = "top_orders", {"n": 5, "city": city}
    elif re.search(r"by city|each city|per city|city wise", q):
        name, args = "orders_by_city", {"paid": paid}
    elif re.search(r"average|avg|mean|సగటు|औसत", q):
        name, args = "average_amount", {"city": city, "paid": paid}
    elif re.search(r"total|sum|revenue|మొత్తం|कुल", q):
        name, args = "total_amount", {"city": city, "paid": paid}
    else:
        name, args = "count_orders", {"city": city, "paid": paid}
    result = {t.name: t for t in TOOLS}[name].invoke({k: v for k, v in args.items() if v is not None})
    answer = f"{result} (in the first {indian(len(rows()))} sample orders)"
    return {"answer": answer, "steps": [{"tool": name, "args": args, "result": result}], "mode": "free"}


def ask(question: str, model=None) -> dict:
    """Answers one question. Uses Groq when a key is set (or a model is passed), else free mode."""
    model = model or groq_model()
    if model is None:
        return _free_mode(question)
    result = run_agent(build_agent(TOOLS, INSTRUCTIONS, model), question)
    return {**result, "mode": "groq"}
