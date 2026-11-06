"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { YuktaiGrid, type GridColumn, type GridSearchTime } from "@yuktishaalaa/yuktai";
import config from "@config";
import { useLifecycle } from "@/components/yuktai/lifecycle";
import { isDark, subscribeTheme } from "@/components/yuktai/theme";
import { DEFAULT_ROWS, ROW_CHOICES, indian, makeOrders, type Order } from "@/data/orders";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const columns: GridColumn<Order>[] = [
  { key: "id", label: "Order", sortable: true, type: "text", width: 150, render: (v) => <span className="nowrap">{v as string}</span> },
  { key: "customer", label: "Customer", sortable: true, type: "text" },
  { key: "city", label: "City", sortable: true, type: "badge", hiddenOnMobile: true },
  { key: "amount", label: "Amount", sortable: true, type: "number", align: "right", render: (v) => rupees.format(v as number) },
  { key: "date", label: "Date", sortable: true, type: "date", hiddenOnMobile: true },
  { key: "paid", label: "Paid", sortable: true, type: "boolean", align: "center" },
];

type Log = { stage: "onStart" | "onChange" | "onEnd"; text: string };

export default function OrdersGrid() {
  const [count, setCount] = useState<number>(DEFAULT_ROWS);
  const [rows, setRows] = useState<Order[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [madeIn, setMadeIn] = useState(0);
  const [log, setLog] = useState<Log[]>([]);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  const add = (l: Log) => setLog((old) => [l, ...old].slice(0, 6));

  // Make the sample rows in the browser (no download), in slices so the page stays usable.
  useEffect(() => {
    const stop = new AbortController();
    const t0 = performance.now();
    makeOrders(count, setProgress, stop.signal)
      .then((data) => {
        setMadeIn(performance.now() - t0);
        setRows(data);
      })
      .catch(() => {});
    return () => stop.abort();
  }, [count]);

  // The three lifecycle moments. onStart waits until the rows are ready.
  const life = useLifecycle<GridSearchTime>(
    {
      part: "grid",
      onStart: () => add({ stage: "onStart", text: `${indian(rows?.length ?? 0)} rows ready` }),
      onChange: (t) => add({ stage: "onChange", text: `${t.query ? `search "${t.query}"` : "all rows"} → ${indian(t.rows)} rows in ${t.ms.toFixed(1)} ms (${t.engine === "rust" ? "Rust" : "TypeScript"})` }),
      onEnd: () => add({ stage: "onEnd", text: "grid left the page, rows freed" }),
    },
    rows !== null,
  );

  const choose = (n: number) => {
    if (n === count) return;
    setRows(null);
    setProgress(0);
    setCount(n);
  };

  const status = useMemo(
    () => (rows ? `${indian(rows.length)} rows made in your browser in ${(madeIn / 1000).toFixed(1)} s` : `Making ${indian(count)} rows… ${Math.round(progress * 100)}%`),
    [rows, madeIn, count, progress],
  );

  return (
    <>
      <div className="grid-bar">
        <fieldset className="seg">
          <legend>Rows</legend>
          {ROW_CHOICES.map((n) => (
            <label key={n}>
              <input type="radio" name="rows" checked={count === n} onChange={() => choose(n)} />
              <span>{indian(n)}</span>
            </label>
          ))}
        </fieldset>
        <p className="grid-status" role="status">{status}</p>
      </div>

      {rows ? (
        <YuktaiGrid
          data={rows}
          columns={columns}
          rowKey="id"
          theme={dark ? "dark" : "default"}
          search
          pagination={{ pageSize: 25, showSizeChanger: true, sizeOptions: [10, 25, 50, 100] }}
          engine={config.engine}
          showSearchTime
          onSearchTime={life.change}
          toolName="orders"
        />
      ) : (
        <div className="grid-loading" aria-hidden="true">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}

      <section className="life" aria-labelledby="life-h">
        <h2 id="life-h">Lifecycle of this grid</h2>
        <p>Search or sort and watch <code>onChange</code>. Leave the page and <code>onEnd</code> runs. See <code>src/components/yuktai/lifecycle.ts</code>.</p>
        <ol className="life-log" aria-live="polite">
          {log.map((l, i) => (
            <li key={log.length - i}>
              <code>{l.stage}</code> {l.text}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
