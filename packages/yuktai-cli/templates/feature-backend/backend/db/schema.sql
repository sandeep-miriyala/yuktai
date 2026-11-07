-- {{title}}: database tables (PostgreSQL 15 or newer).
-- Run once:  psql "$DATABASE_URL" -f backend/db/schema.sql

-- Orders: the same columns as the data grid.
create table if not exists orders (
  id        text primary key,               -- ORD-0000001
  customer  text not null,
  city      text not null,
  amount    numeric(12, 2) not null check (amount >= 0),
  date      date not null,
  paid      boolean not null default false
);
create index if not exists orders_city_idx on orders (city);
create index if not exists orders_date_idx on orders (date);

-- RAG passages with embeddings (pgvector). Optional: needs the vector extension.
-- 384 numbers per passage fits small open embedding models (e.g. all-MiniLM-L6-v2).
create extension if not exists vector;
create table if not exists rag_passages (
  id         bigserial primary key,
  source     text not null,                 -- file name and heading
  text       text not null,
  embedding  vector(384)
);
-- Fast nearest-neighbour search once you have thousands of passages.
create index if not exists rag_passages_embedding_idx on rag_passages using hnsw (embedding vector_cosine_ops);
