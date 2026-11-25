"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import type { GridColumn, YuktaiGridProps } from "@yuktishaalaa/yuktai";
import { isDark, subscribeTheme } from "@/components/yuktai/theme";

export type PackageRow = {
  id: string;
  short: string;
  name: string;
  registry: string;
  version: string;
  who: string;
  install: string;
  links: { href: string; label: string }[];
  guide?: { href: string; label: string };
  anchor: string;
};

type Grid = ComponentType<YuktaiGridProps<PackageRow>>;

function CopyButton({ text, what }: { text: string; what: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="pg-copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }, () => {});
      }}
      aria-label={`Copy the install command for ${what}`}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

const columns: GridColumn<PackageRow>[] = [
  {
    key: "short", label: "Package", width: "22%",
    render: (_v, r) => (
      <span className="pg-name">
        <a href={`#${r.anchor}`}>{r.short}</a>
        <code>{r.name}</code>
      </span>
    ),
  },
  { key: "registry", label: "Registry", render: (v) => <span className={`pg-reg pg-reg-${String(v).replace(/\W/g, "").toLowerCase()}`}>{String(v)}</span> },
  { key: "version", label: "Version" },
  { key: "who", label: "For", hiddenOnMobile: false },
  {
    key: "install", label: "Install", sortable: false,
    render: (_v, r) => (
      <span className="pg-install"><code>{r.install}</code><CopyButton text={r.install} what={r.short} /></span>
    ),
  },
  {
    key: "id", label: "Links", sortable: false,
    render: (_v, r) => (
      <span className="pg-links">
        {r.links.map((l) => <a key={l.href} href={l.href}>{l.label}<span className="sr-only">: {r.short}</span></a>)}
        {r.guide && <Link href={r.guide.href}>Guide<span className="sr-only">: {r.short}</span></Link>}
      </span>
    ),
  },
];

/**
 * Every package in the YuktAI data grid itself: search, sort, cards on phones,
 * CSV / Excel / JSON / PDF download and the ⚙ settings, all in the browser.
 * Until the grid has loaded (or without JavaScript) the plain table is shown.
 */
export default function PackagesGrid({ rows, children }: { rows: PackageRow[]; children: ReactNode }) {
  const [Grid, setGrid] = useState<Grid | null>(null);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);

  useEffect(() => {
    let live = true;
    import("@yuktishaalaa/yuktai").then((m) => { if (live) setGrid(() => m.YuktaiGrid as unknown as Grid); }, () => {});
    return () => { live = false; };
  }, []);

  if (!Grid) return <>{children}</>;
  return (
    <div className="pg-grid">
      <Grid
        data={rows}
        columns={columns}
        rowKey="id"
        label={`All ${rows.length} YuktAI packages`}
        downloadName="yuktai-packages"
        locale="en-IN"
        theme={dark ? "dark" : "default"}
        view="auto"
        search
        engine="auto"
        pagination={false}
        toolName="yuktai_packages"
      />
    </div>
  );
}
