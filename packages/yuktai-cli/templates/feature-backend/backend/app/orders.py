"""Sample orders for the API: 25 lakh (2,500,000) rows, made on demand.

No database and no file: row N is worked out from N with a small seeded hash, so
any page of the 25 lakh rows comes back instantly and memory stays tiny.
Replace this module with your own data (PostgreSQL, a CSV file, another API...).
"""

from __future__ import annotations

from datetime import date, timedelta

TOTAL = 2_500_000

FIRST = ["Aarav", "Lakshmi", "Ravi", "Priya", "Arjun", "Sita", "Kiran", "Ananya", "Vikram", "Meera",
         "Rahul", "Divya", "Suresh", "Kavya", "Manoj", "Sneha", "Arun", "Pooja", "Naveen", "Deepa",
         "Rohan", "Anjali", "Sanjay", "Nithya", "Imran", "Fatima", "John", "Mary", "Harpreet", "Gurpreet"]
LAST = ["Reddy", "Sharma", "Rao", "Iyer", "Naidu", "Patel", "Kumar", "Singh", "Menon", "Nair",
        "Gupta", "Das", "Khan", "Joshi", "Varma", "Pillai", "Chowdary", "Bose", "Mehta", "Thomas"]
CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Delhi", "Pune", "Kolkata",
          "Visakhapatnam", "Vijayawada", "Kochi", "Jaipur", "Ahmedabad"]
START = date(2024, 1, 1)
MASK = (1 << 64) - 1


def _mix(n: int) -> int:
    """splitmix64: the same number in gives the same well-mixed number out."""
    n = (n + 0x9E3779B97F4A7C15) & MASK
    n = ((n ^ (n >> 30)) * 0xBF58476D1CE4E5B9) & MASK
    n = ((n ^ (n >> 27)) * 0x94D049BB133111EB) & MASK
    return n ^ (n >> 31)


def _part(seed: int, k: int) -> float:
    """A number in [0, 1) for part k of one row."""
    return _mix(seed * 8 + k) / 2**64


def order(index: int) -> dict:
    """Order number index + 1 (index 0 is ORD-0000001)."""
    if not 0 <= index < TOTAL:
        raise IndexError(index)
    seed = index + 2026
    return {
        "id": f"ORD-{index + 1:07d}",
        "customer": f"{FIRST[int(_part(seed, 0) * len(FIRST))]} {LAST[int(_part(seed, 1) * len(LAST))]}",
        "city": CITIES[int(_part(seed, 2) * len(CITIES))],
        "amount": round((99 + _part(seed, 3) * 49_900) * 2) / 2,
        "date": (START + timedelta(days=int(_part(seed, 4) * 731))).isoformat(),
        "paid": _part(seed, 5) < 0.72,
    }


def page(number: int, size: int) -> list[dict]:
    """One page of orders (number starts at 1)."""
    start = (number - 1) * size
    return [order(i) for i in range(start, min(start + size, TOTAL))]
