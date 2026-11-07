-- A few sample rows. Run after schema.sql:  psql "$DATABASE_URL" -f backend/db/seed.sql
insert into orders (id, customer, city, amount, date, paid) values
  ('ORD-0000001', 'Lakshmi Reddy', 'Hyderabad', 24999.50, '2025-03-14', true),
  ('ORD-0000002', 'Ravi Sharma',   'Pune',       1499.00, '2025-03-15', false),
  ('ORD-0000003', 'Priya Iyer',    'Chennai',    8750.00, '2025-03-15', true),
  ('ORD-0000004', 'Arjun Naidu',   'Vijayawada', 3200.50, '2025-03-16', false),
  ('ORD-0000005', 'Meera Nair',    'Kochi',     15600.00, '2025-03-17', true)
on conflict (id) do nothing;
