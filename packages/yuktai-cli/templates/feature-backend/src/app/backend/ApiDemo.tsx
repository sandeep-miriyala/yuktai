"use client";

import { useCallback, useEffect, useState } from "react";
import config from "@config";

type Order = { id: string; customer: string; city: string; amount: number; date: string; paid: boolean };
type Page = { total: number; page: number; size: number; pages: number; rows: Order[] };
type Health = { status: string; app: string; python: string };

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const SIZE = 10;
const indian = (n: number) => n.toLocaleString("en-IN");

/** Talks to the Python API: shows whether it is running, then pages through its 25 lakh orders. */
export default function ApiDemo() {
  const [health, setHealth] = useState<Health | null | "down">(null);
  const [data, setData] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [ms, setMs] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const stop = new AbortController();
    fetch(`${config.api.url}/api/health`, { signal: stop.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setHealth)
      .catch((e) => { if (e.name !== "AbortError") setHealth("down"); });
    return () => stop.abort();
  }, []);

  const load = useCallback(async (p: number) => {
    setError("");
    const t0 = performance.now();
    try {
      const r = await fetch(`${config.api.url}/api/orders?page=${p}&size=${SIZE}`);
      if (!r.ok) throw new Error(`The API said ${r.status}`);
      setData(await r.json());
      setMs(performance.now() - t0);
      setPage(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The API did not answer");
    }
  }, []);

  useEffect(() => {
    // first page once the API answered (load() sets state after the fetch)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (health && health !== "down") void load(1);
  }, [health, load]);

  if (health === null) return <p className="api-status" role="status">Looking for the Python API at {config.api.url}…</p>;
  if (health === "down")
    return (
      <div className="api-status api-down" role="status">
        <p><strong>The Python API is not running.</strong> The rest of the site works without it.</p>
        <ol>
          <li>Install Python 3.10 or newer (Windows: tick &quot;Add python.exe to PATH&quot;).</li>
          <li>Run <code>npm run dev</code> again: it sets up <code>backend/.venv</code> once and starts the API.</li>
          <li>Or start it alone with <code>npm run dev:api</code>, then reload this page.</li>
        </ol>
      </div>
    );

  return (
    <>
      <p className="api-status api-up" role="status">
        Connected: <strong>{health.app}</strong> on Python {health.python} · <code>{config.api.url}</code>
      </p>
      {error && <p className="api-status api-down" role="alert">{error}</p>}
      {data && (
        <>
          <div className="api-bar">
            <span>
              Page {indian(page)} of {indian(data.pages)} · {indian(data.total)} orders · answered in {ms.toFixed(0)} ms
            </span>
            <span className="btn-row">
              <button type="button" className="btn" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button>
              <button type="button" className="btn" disabled={page >= data.pages} onClick={() => load(page + 1)}>Next</button>
              <button type="button" className="btn" onClick={() => load(data.pages)}>Last</button>
            </span>
          </div>
          <div className="api-table-wrap">
            <table className="api-table">
              <caption className="sr-only">Orders from the Python API, page {page}</caption>
              <thead>
                <tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">City</th><th scope="col">Amount</th><th scope="col">Date</th><th scope="col">Paid</th></tr>
              </thead>
              <tbody>
                {data.rows.map((o) => (
                  <tr key={o.id}>
                    <td><code>{o.id}</code></td><td>{o.customer}</td><td>{o.city}</td>
                    <td className="num">{rupees.format(o.amount)}</td><td>{o.date}</td><td>{o.paid ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
