# PostgreSQL basics

The app works without a database. Add one when you need to save data.

## 1. Get PostgreSQL (free)

- **On your computer:** install from https://www.postgresql.org/download/ , or with Docker: `docker compose -f backend/db/docker-compose.yml up -d` (includes pgvector).
- **Online:** Supabase or Neon have free plans (check their current limits).

## 2. Connect the API

```
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yuktai
```

Install the driver once (inside backend/.venv):

```
# Windows
backend\.venv\Scripts\python -m pip install -r backend\requirements-db.txt
# macOS / Linux
backend/.venv/bin/python -m pip install -r backend/requirements-db.txt
```

Check it: http://localhost:8000/api/db/health

## 3. Make the tables

```
psql "postgresql://postgres:postgres@localhost:5432/yuktai" -f backend/db/schema.sql
psql "postgresql://postgres:postgres@localhost:5432/yuktai" -f backend/db/seed.sql
```

## Basic commands (inside psql)

| Command | What it does |
|---|---|
| `\l` | List databases |
| `\c yuktai` | Connect to a database |
| `\dt` | List tables |
| `\d orders` | Show a table's columns |
| `select * from orders limit 10;` | First 10 rows |
| `select city, count(*) from orders group by city;` | Count per city |
| `insert into orders (id, customer, city, amount, date, paid) values ('ORD-0000006', 'Kiran Rao', 'Pune', 999, '2025-03-18', false);` | Add a row |
| `update orders set paid = true where id = 'ORD-0000002';` | Change a row |
| `delete from orders where id = 'ORD-0000006';` | Remove a row |
| `\q` | Quit |

## Use it from Python

```python
import psycopg
from app import settings

with psycopg.connect(settings.get("DATABASE_URL")) as conn:
    rows = conn.execute("select id, customer from orders where city = %s", ("Pune",)).fetchall()
```

Always pass values with `%s` like above, never by joining strings: that keeps out SQL injection.

## pgvector (for RAG)

`schema.sql` makes a `rag_passages` table with a `vector(384)` column. When your documents grow beyond a few hundred pages, store their passages there and search with `order by embedding <=> %s limit 3`. Until then, `backend/app/rag.py` searches the files in `backend/knowledge/` directly.
