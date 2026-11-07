"""Tests for the API. Run with: npm run test:api"""

from fastapi.testclient import TestClient

from app import orders
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_first_page():
    r = client.get("/api/orders", params={"page": 1, "size": 10})
    body = r.json()
    assert r.status_code == 200
    assert body["total"] == 2_500_000
    assert len(body["rows"]) == 10
    assert body["rows"][0]["id"] == "ORD-0000001"


def test_last_page_and_beyond():
    last = client.get("/api/orders", params={"page": 100_000, "size": 25}).json()
    assert last["rows"][-1]["id"] == "ORD-2500000"
    assert client.get("/api/orders", params={"page": 100_001, "size": 25}).status_code == 404


def test_size_is_limited():
    assert client.get("/api/orders", params={"size": 501}).status_code == 422


def test_one_order_is_always_the_same():
    a = client.get("/api/orders/ORD-0000042").json()
    b = client.get("/api/orders/ORD-0000042").json()
    assert a == b
    assert a["id"] == "ORD-0000042"
    assert a["city"] in orders.CITIES
    assert 99 <= a["amount"] <= 49_999


def test_unknown_order():
    assert client.get("/api/orders/ORD-9999999").status_code == 404
    assert client.get("/api/orders/hello").status_code == 404


def test_cors_allows_the_site():
    r = client.options(
        "/api/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_allows_any_local_port():
    # the site moves to 3001 when 3000 is busy
    r = client.options("/api/health", headers={"Origin": "http://localhost:3001", "Access-Control-Request-Method": "GET"})
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3001"
    other = client.options("/api/health", headers={"Origin": "https://example.com", "Access-Control-Request-Method": "GET"})
    assert other.headers.get("access-control-allow-origin") is None
