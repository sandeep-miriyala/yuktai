"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { SearchIcon, ChatIcon, ArrowRightIcon } from "@yuktishaalaa/yuktai/icons";
import { asset } from "@/lib/base";
import { prepare, search, sectionsFrom, type Indexed } from "@/lib/search";

export type PageRef = { href: string; title: string };

// One index for the whole visit: moving away and back doesn't fetch the pages again.
let loading: Promise<{ index: Indexed[]; read: number }> | null = null;

function loadIndex(pages: PageRef[]) {
  loading ??= (async () => {
    const parser = new DOMParser();
    const each = await Promise.all(
      pages.map(async (p) => {
        try {
          const res = await fetch(asset(p.href));
          if (!res.ok) return null;
          return sectionsFrom(parser.parseFromString(await res.text(), "text/html"), p.href, p.title);
        } catch {
          return null; // offline and not visited yet
        }
      }),
    );
    const read = each.filter(Boolean).length;
    if (!read) loading = null; // try again next time
    return { index: prepare(each.flatMap((s) => s ?? [])), read };
  })();
  return loading;
}

const QUESTIONS = [
  "How do I install YuktAI?",
  "Can a Streamlit app work offline?",
  "Which Telugu fonts are there?",
  "How do guests RSVP on WhatsApp?",
  "How do I add it to Next.js?",
  "Is anything sent to a server?",
];

/** Search the whole site, then ask the assistant on the page that has the answer. */
export default function SiteSearch({ pages }: { pages: PageRef[] }) {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Indexed[] | null>(null);
  const [read, setRead] = useState(0);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    loadIndex(pages).then(
      (r) => {
        if (!live) return;
        setIndex(r.index);
        setRead(r.read);
        setFailed(r.read === 0);
        const first = new URLSearchParams(location.search).get("q");
        if (first) setQ(first);
      },
      () => live && setFailed(true),
    );
    return () => { live = false; };
  }, [pages]);

  // Keep the question in the address, so a search can be shared or bookmarked.
  useEffect(() => {
    if (!index) return;
    const url = q.trim() ? `${location.pathname}?q=${encodeURIComponent(q.trim())}` : location.pathname;
    history.replaceState(history.state, "", url);
  }, [q, index]);

  const result = useMemo(() => (index && q.trim() ? search(index, q) : null), [index, q]);

  function submit(e: FormEvent) {
    e.preventDefault();
    input.current?.focus();
  }
  function pick(question: string) {
    setQ(question);
    input.current?.focus();
  }
  // The answer comes from the page itself: open it and ask there (Ask page, on the device).
  function askOn(page: string) {
    location.assign(asset(`${page}?ask=${encodeURIComponent(q.trim())}`));
  }

  const status = failed
    ? "Couldn't read the pages. Check the connection and reload; after one visit, search works offline."
    : !index
      ? `Reading ${pages.length} pages…`
      : !result
        ? `${read} pages and ${index.length} sections ready. Type a question or a few words.`
        : result.hits.length
          ? `${result.hits.length} ${result.hits.length === 1 ? "result" : "results"}${result.all ? "" : ". No section has every word; these have some of them"}.`
          : "No page on this site has these words. Try fewer or simpler words.";

  return (
    <div className="site-search">
      <form role="search" className="ss-form" onSubmit={submit}>
        <label htmlFor="ss-q" className="sr-only">Search this site</label>
        <SearchIcon size={22} aria-hidden="true" />
        <input
          id="ss-q" ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search every page: install, Streamlit, Telugu fonts…" autoComplete="off" enterKeyHint="search"
          aria-describedby="ss-status" autoFocus
        />
      </form>
      <p id="ss-status" className="ss-status" role="status" aria-live="polite">{status}</p>

      {!q.trim() && (
        <div className="ss-ideas">
          <p className="hint">Try one of these:</p>
          <div className="btn-row">
            {QUESTIONS.map((x) => (
              <button key={x} type="button" className="btn" onClick={() => pick(x)}>{x}</button>
            ))}
          </div>
        </div>
      )}

      {result && result.hits.length > 0 && (
        <ol className="ss-results">
          {result.hits.map((h) => (
            <li key={`${h.page}#${h.id}#${h.heading}`}>
              <Link className="ss-title" href={h.id ? `${h.page}#${h.id}` : h.page}>
                <span className="ss-page">{h.pageTitle}</span>
                {h.heading !== h.pageTitle && <span className="ss-heading"> › {h.heading}</span>}
              </Link>
              <p className="ss-snippet">
                {h.snippet.map((s, i) => (s.mark ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
              </p>
              <button type="button" className="ss-ask" onClick={() => askOn(h.page)}>
                <ChatIcon size={18} aria-hidden="true" />
                <span>Ask “{q.trim()}” on this page</span>
                <span className="sr-only">: {h.pageTitle}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {result && !result.hits.length && (
        <div className="card ss-none">
          <p>Nothing on this site matches those words. Some places to start:</p>
          <ul>
            {pages.slice(0, 5).map((p) => (
              <li key={p.href}><Link href={p.href}>{p.title}<ArrowRightIcon size={16} aria-hidden="true" /></Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
