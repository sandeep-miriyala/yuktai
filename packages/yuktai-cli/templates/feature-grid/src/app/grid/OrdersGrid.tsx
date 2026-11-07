"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { YuktaiGrid, type GridColumn, type GridLocale, type WebMCPStatus, type YuktaiGridRule } from "@yuktishaalaa/yuktai";
import config from "@config";
import { useLifecycle } from "@/components/yuktai/lifecycle";
import { isDark, subscribeTheme } from "@/components/yuktai/theme";
import { ROW_CHOICES, indian, makeOrders, startRows, type Order } from "@/data/orders";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const columns: GridColumn<Order>[] = [
  { key: "id", label: "Order", sortable: true, type: "text", width: 150, render: (v) => <span className="nowrap">{v as string}</span> },
  { key: "customer", label: "Customer", sortable: true, type: "text" },
  { key: "city", label: "City", sortable: true, type: "badge", hiddenOnMobile: true },
  { key: "amount", label: "Amount", sortable: true, type: "number", align: "right", render: (v) => rupees.format(v as number) },
  { key: "date", label: "Date", sortable: true, type: "date", hiddenOnMobile: true },
  { key: "paid", label: "Paid", sortable: true, type: "boolean", align: "center" },
];

// Your own words for the assistant: a phrase → grid tools. Add more for your data.
const rules: YuktaiGridRule<Order>[] = [
  {
    name: "unpaid",
    phrases: ["unpaid", "not paid", "due", "బాకీ", "बकाया"],
    description: "Orders that are not paid yet",
    execute: async ({ executeTool }) => (await executeTool("filter", { key: "paid", operator: "equals", value: "false" })).message,
  },
  {
    name: "biggest",
    phrases: ["biggest", "highest amount", "top amount", "ఎక్కువ amount", "सबसे बड़ा"],
    description: "Largest amounts first",
    execute: async ({ executeTool }) => (await executeTool("sort", { key: "amount", direction: "desc" })).message,
  },
];

const WEBMCP_TEXT: Record<WebMCPStatus["state"], string> = {
  unsupported: "not available in this browser (Chrome with WebMCP on)",
  registering: "starting…",
  ready: "ready",
  partial: "partly ready",
  error: "could not start",
};

type Log = { stage: "onStart" | "onChange" | "onEnd"; text: string };

export default function OrdersGrid() {
  // null until mounted: the starting count depends on the device (25 lakh, or 10 lakh on phones)
  const [count, setCount] = useState<number | null>(null);
  const [rows, setRows] = useState<Order[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [madeIn, setMadeIn] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [webmcp, setWebmcp] = useState<WebMCPStatus | null>(null);
  const [log, setLog] = useState<Log[]>([]);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  const add = (l: Log) => setLog((old) => [l, ...old].slice(0, 8));

  // Make the sample rows in the browser (no download), in slices so the page stays usable.
  useEffect(() => {
    // the device is only known in the browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount((c) => c ?? startRows());
  }, []);

  useEffect(() => {
    if (count === null) return;
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
  const life = useLifecycle<string>(
    {
      part: "grid",
      onStart: () => add({ stage: "onStart", text: `${indian(rows?.length ?? 0)} rows ready` }),
      onChange: (what) => add({ stage: "onChange", text: what }),
      onEnd: () => add({ stage: "onEnd", text: "grid left the page, rows freed" }),
    },
    rows !== null,
  );

  const choose = (n: number) => {
    if (n === count) return;
    setRows(null);
    setSelected([]);
    setProgress(0);
    setCount(n);
  };

  const status = useMemo(
    () => (rows ? `${indian(rows.length)} rows made in your browser in ${(madeIn / 1000).toFixed(1)} s` : count === null ? "Getting ready…" : `Making ${indian(count)} rows… ${Math.round(progress * 100)}%`),
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
          locale="en-IN"
          theme={dark ? "dark" : "default"}
          search
          selectable
          selectedKeys={selected}
          onSelectionChange={(keys) => {
            setSelected(keys);
            life.change(`${indian(keys.length)} rows selected`);
          }}
          // "Show all (25,00,000)" lists every row in one smooth scrolling list (virtual scrolling)
          pagination={{ pageSize: 25, showSizeChanger: true, sizeOptions: [10, 25, 50, 100] }}
          engine={config.engine}
          showSearchTime
          onSearchTime={(t) => life.change(`${t.query ? `search "${t.query}"` : "all rows"} → ${indian(t.rows)} rows in ${t.ms.toFixed(1)} ms (${t.engine === "rust" ? "Rust" : "TypeScript"})`)}
          ai={config.grid.assistant}
          voice={config.grid.voice}
          inputLanguage={config.grid.language as GridLocale}
          customRules={rules}
          onAgentResult={(r) => life.change(`assistant${r.tool ? ` (${r.tool})` : ""}: ${r.message}`)}
          toolName="orders"
          webmcp={config.grid.webmcp}
          onWebMCPStatusChange={setWebmcp}
        />
      ) : (
        <div className="grid-loading" aria-hidden="true">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}

      {config.grid.webmcp && (
        <p className="hint">
          Browser-agent tools (WebMCP): <strong>{webmcp ? WEBMCP_TEXT[webmcp.state] : "waiting for the grid"}</strong>
          {webmcp && webmcp.registered.length > 0 && <> · {webmcp.registered.length} tools: {webmcp.registered.join(", ")}</>}
        </p>
      )}

      <section className="life" aria-labelledby="life-h">
        <h2 id="life-h">Lifecycle of this grid</h2>
        <p>
          Search, sort, select rows or ask the assistant and watch <code>onChange</code>. Leave the page and <code>onEnd</code> runs.
          See <code>src/components/yuktai/lifecycle.ts</code>.
        </p>
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
