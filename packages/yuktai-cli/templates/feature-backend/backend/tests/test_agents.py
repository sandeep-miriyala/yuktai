"""Agents, RAG and the database check, without a Groq key (free mode and a fake model)."""

import sys

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage

from app import rag, settings
from app.agents import assistant, grid, testing
from app.agents.base import build_agent, run_agent
from app.main import app

client = TestClient(app)


class FakeModel:
    """Plays back scripted replies, like a model that calls tools and then answers."""

    def __init__(self, replies):
        self.replies = list(replies)
        self.seen = []

    def bind_tools(self, tools):
        return self

    def invoke(self, messages):
        self.seen.append(messages)
        return self.replies.pop(0) if self.replies else AIMessage(content="done")


def call(name, args, id_="1"):
    return AIMessage(content="", tool_calls=[{"name": name, "args": args, "id": id_, "type": "tool_call"}])


# ── Grid Agent ──────────────────────────────────────────────────────────────


def test_grid_free_mode_counts_unpaid_in_a_city():
    expected = sum(1 for r in grid.rows() if r["city"] == "Pune" and not r["paid"])
    result = grid.ask("How many unpaid orders in Pune?")
    assert result["mode"] == "free"
    assert result["steps"][0]["tool"] == "count_orders"
    assert result["answer"].startswith(f"{grid.indian(expected)} orders")


def test_indian_number_grouping():
    assert grid.indian(2500000) == "25,00,000"
    assert grid.indian(999) == "999"
    assert grid.indian(123456.5, 2) == "1,23,456.50"


def test_grid_free_mode_understands_telugu_and_totals():
    assert grid.ask("Hyderabad మొత్తం")["steps"][0]["tool"] == "total_amount"
    assert grid.ask("top orders")["steps"][0]["tool"] == "top_orders"
    assert grid.ask("orders by city")["steps"][0]["tool"] == "orders_by_city"


def test_grid_agent_with_a_model_uses_tools():
    model = FakeModel([call("total_amount", {"city": "Chennai"}), AIMessage(content="Chennai total is shown above.")])
    result = grid.ask("Total for Chennai?", model=model)
    assert result["mode"] == "groq"
    assert result["steps"][0]["tool"] == "total_amount"
    assert result["steps"][0]["result"].startswith("₹")
    assert result["answer"] == "Chennai total is shown above."


def test_unknown_tool_and_step_limit():
    model = FakeModel([call("delete_everything", {}), *[call("count_orders", {}, str(i)) for i in range(10)]])
    result = run_agent(build_agent(grid.TOOLS, "test", model, max_steps=3), "go")
    assert "no tool called delete_everything" in result["steps"][0]["result"]
    assert "too many steps" in result["answer"]


# ── RAG ─────────────────────────────────────────────────────────────────────


def test_rag_finds_the_right_passage():
    found = rag.search("where do I put the groq key")
    assert found and "GROQ_API_KEY" in found[0]["text"]


def test_rag_free_mode_returns_passages_only():
    result = rag.ask("how do I run the tests")
    assert result["mode"] == "free" and result["answer"] is None and result["sources"]


def test_rag_with_a_model_answers_from_passages():
    model = FakeModel([AIMessage(content="Use npm run test:api [1].")])
    result = rag.ask("how do I test the api", model=model)
    assert result["answer"] == "Use npm run test:api [1]."
    assert "Passages:" in model.seen[0]


# ── Testing Agent ───────────────────────────────────────────────────────────


def test_testing_agent_only_runs_allowed_checks():
    assert "Unknown check" in testing.run_check_now("rm -rf /")["output"]


def test_testing_agent_runs_a_check(monkeypatch, tmp_path):
    monkeypatch.setitem(testing.CHECKS, "demo", ("demo", [sys.executable, "-c", "print('all good')"], tmp_path))
    result = testing.run_check_now("demo")
    assert result["passed"] and "all good" in result["output"]


def test_developer_agents_are_off_in_production(monkeypatch):
    monkeypatch.setenv("YUKTAI_ENV", "production")
    with pytest.raises(PermissionError):
        testing.run_check_now("lint")
    with pytest.raises(PermissionError):
        assistant.ask("add page contact", approve=lambda p, t: True)


# ── YuktAI Assistant ────────────────────────────────────────────────────────


def test_assistant_writes_only_after_yes(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "PROJECT", tmp_path)
    no = assistant.ask("add a page called contact", approve=lambda p, t: False)
    assert "Not written" in no["answer"] and not (tmp_path / "src/app/contact/page.tsx").exists()
    yes = assistant.ask("add a page called contact", approve=lambda p, t: True)
    assert "Created src/app/contact/page.tsx" in yes["answer"]
    assert "export default function ContactPage" in (tmp_path / "src/app/contact/page.tsx").read_text()


def test_assistant_never_overwrites_and_checks_names(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "PROJECT", tmp_path)
    assistant.ask("add api products", approve=lambda p, t: True)
    again = assistant.ask("add api products", approve=lambda p, t: True)
    assert "already exists" in again["answer"]
    assert "router = APIRouter" in (tmp_path / "backend/app/routes/products.py").read_text()
    bad = assistant.add_page.invoke({"slug": "../../etc"})
    assert "lower-case" in bad


def test_assistant_answers_questions_from_docs():
    result = assistant.ask("how do I start the app?", approve=lambda p, t: False)
    assert result["steps"][0]["tool"] == "search_docs"
    assert "npm run dev" in result["answer"]


# ── API endpoints ───────────────────────────────────────────────────────────


def test_endpoints():
    assert client.get("/api/agents/status").json() == {"groq": False, "mode": "free"}
    grid_answer = client.post("/api/agents/grid", json={"question": "how many orders"}).json()
    assert "orders" in grid_answer["answer"]
    assert client.post("/api/rag/ask", json={"question": "database"}).json()["sources"]
    assert client.post("/api/agents/grid", json={"question": ""}).status_code == 422
    assert client.get("/api/db/health").json()["configured"] is False
