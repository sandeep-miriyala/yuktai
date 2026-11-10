"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { PACKAGES } from "@/data/site";

// TanStack Query: the latest release and last week's downloads, read live from npm.
// Public package data only; nothing about the visitor is sent.
type Live = { latest: string; downloads: number | null };

async function fetchLive(name: string): Promise<Live> {
  const reg = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`);
  if (!reg.ok) throw new Error("npm registry " + reg.status);
  const { version } = (await reg.json()) as { version: string };
  let downloads: number | null = null;
  try {
    const d = await fetch(`https://api.npmjs.org/downloads/point/last-week/${name}`);
    if (d.ok) downloads = ((await d.json()) as { downloads?: number }).downloads ?? null;
  } catch {}
  return { latest: version, downloads };
}

function Row({ name, pinned }: { name: string; pinned: string }) {
  const q = useQuery({ queryKey: ["npm", name], queryFn: () => fetchLive(name), staleTime: 10 * 60 * 1000, retry: 1 });
  return (
    <li className="live-row">
      <code>{name}</code>
      <span>This site: <strong>{pinned}</strong></span>
      <span aria-live="polite">
        {q.isPending ? "npm: checking…" : q.isError ? "npm: offline" : (
          <>npm latest: <strong>{q.data.latest}</strong>{q.data.downloads !== null && <> · {q.data.downloads.toLocaleString("en-IN")} downloads last week</>}</>
        )}
      </span>
    </li>
  );
}

export default function LiveNpm() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ul className="live">
        {PACKAGES.map((p) => <Row key={p.name} name={p.name} pinned={p.version} />)}
      </ul>
    </QueryClientProvider>
  );
}
