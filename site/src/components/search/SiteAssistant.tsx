"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, ChatIcon, CloseIcon } from "@yuktishaalaa/yuktai/icons";
import { asset } from "@/lib/base";
import { GUIDES } from "@/data/site";
import { prepare, search, sectionsFrom, type Hit, type Indexed } from "@/lib/search";

// Every page the assistant reads, in menu order.
const PAGES = [
  { href: "/", title: "Home" },
  ...GUIDES.map(({ href, title }) => ({ href, title })),
  { href: "/shubhalekha/make/", title: "Make a Shubhalekha" },
  { href: "/about/", title: "About" },
];

const TOPICS = ["Install", "Streamlit offline", "Telugu fonts", "WhatsApp RSVP", "Next.js", "Data grid", "Privacy"];

// One index for the whole visit. The pages come from the site itself (and its offline cache).
let loading: Promise<Indexed[]> | null = null;
function loadIndex(): Promise<Indexed[]> {
  loading ??= (async () => {
    const parser = new DOMParser();
    const each = await Promise.all(PAGES.map(async (p) => {
      try {
        const res = await fetch(asset(p.href));
        return res.ok ? sectionsFrom(parser.parseFromString(await res.text(), "text/html"), p.href, p.title) : [];
      } catch {
        return [];
      }
    }));
    const index = prepare(each.flat());
    if (!index.length) loading = null; // offline before the first visit: try again next time
    return index;
  })();
  return loading;
}

/** Opens the help panel from anywhere: the header button, "/" on the keyboard. */
export const openHelp = () => window.dispatchEvent(new Event("yuktai:help"));

/**
 * Help, 24×7: a panel on the right of every page. Type a topic, press Enter,
 * and you are taken straight to that part of the site. Runs in the browser.
 */
export default function SiteAssistant() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Indexed[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const open = () => {
      const d = dialog.current;
      if (!d || d.open) return;
      d.showModal();
      input.current?.select();
      loadIndex().then((ix) => { setIndex(ix); setFailed(!ix.length); }, () => setFailed(true));
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable=true]");
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("yuktai:help", open);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("yuktai:help", open);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const result = useMemo(() => (index && q.trim() ? search(index, q, 8) : null), [index, q]);
  const hits = result?.hits ?? [];

  function close() {
    dialog.current?.close();
  }
  // Straight to the section, then a short highlight so the eye finds it.
  function go(h: Hit) {
    close();
    router.push(h.id ? `${h.page}#${h.id}` : h.page);
    if (!h.id) return;
    setTimeout(() => {
      const el = document.getElementById(h.id);
      if (!el) return;
      el.scrollIntoView({ block: "start" });
      el.classList.add("sa-flash");
      setTimeout(() => el.classList.remove("sa-flash"), 2200);
    }, 350);
  }
  // The page's own assistant (Ask page) answers there, with the source highlighted.
  function askThere(h: Hit) {
    location.assign(asset(`${h.page}?ask=${encodeURIComponent(q.trim())}`));
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const h = hits[active] ?? hits[0];
    if (h) go(h);
  }
  function arrows(e: KeyboardEvent<HTMLInputElement>) {
    // Escape closes the panel (a search box would only clear itself)
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (!hits.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % hits.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + hits.length) % hits.length); }
  }

  const status = failed
    ? "Couldn't read the site. Check the connection; after one visit, help works offline."
    : !index
      ? "Reading the site…"
      : !result
        ? "Type a topic and press Enter to go straight there."
        : hits.length
          ? `${hits.length} ${hits.length === 1 ? "place" : "places"}${result.all ? "" : " with some of the words"}. Enter opens the first.`
          : "Nothing on this site has these words. Try fewer or simpler words.";

  return (
    <>
      <button type="button" className="sa-launch" onClick={openHelp} aria-keyshortcuts="/" aria-label="Help, 24×7: find a topic on this site (/)">
        <SearchIcon size={20} aria-hidden="true" />
        <span className="sa-launch-text" aria-hidden="true">Help 24×7</span>
      </button>

      <dialog
        ref={dialog} className="sa-panel" aria-labelledby="sa-title"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="sa-in">
          <div className="sa-head">
            <h2 id="sa-title">Help, 24×7</h2>
            <button type="button" className="sa-x" onClick={close} aria-label="Close help">
              <CloseIcon size={20} aria-hidden="true" />
            </button>
          </div>
          <p className="sa-sub">Ask for a topic. You go straight to that part of the site.</p>

          <form role="search" className="sa-form" onSubmit={submit}>
            <label htmlFor="sa-q" className="sr-only">Topic or question</label>
            <SearchIcon size={20} aria-hidden="true" />
            <input
              id="sa-q" ref={input} type="search" value={q} autoComplete="off" enterKeyHint="go"
              placeholder="Install, Streamlit offline, Telugu fonts…"
              onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={arrows}
              aria-describedby="sa-status" aria-controls="sa-list"
            />
          </form>
          <p id="sa-status" className="sa-status" role="status" aria-live="polite">{status}</p>

          {!q.trim() && (
            <div className="sa-topics">
              {TOPICS.map((t) => (
                <button key={t} type="button" onClick={() => { setQ(t); setActive(0); input.current?.focus(); }}>{t}</button>
              ))}
            </div>
          )}

          <ol id="sa-list" className="sa-list">
            {hits.map((h, i) => (
              <li key={`${h.page}#${h.id}#${h.heading}`} className={i === active ? "on" : undefined}>
                <button type="button" className="sa-go" onClick={() => go(h)}>
                  <span className="sa-where">{h.pageTitle}{h.heading !== h.pageTitle && <> › <strong>{h.heading}</strong></>}</span>
                  <span className="sa-snip">
                    {h.snippet.map((s, k) => (s.mark ? <mark key={k}>{s.text}</mark> : <span key={k}>{s.text}</span>))}
                  </span>
                </button>
                <button type="button" className="sa-ask" onClick={() => askThere(h)}>
                  <ChatIcon size={16} aria-hidden="true" />
                  <span>Ask there<span className="sr-only">: {h.pageTitle}</span></span>
                </button>
              </li>
            ))}
          </ol>

          <p className="sa-foot">Runs in your browser. Nothing you type is sent anywhere. Ctrl K asks about the page you are on.</p>
        </div>
      </dialog>
    </>
  );
}
