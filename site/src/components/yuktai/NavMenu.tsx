"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { NavGroup } from "@/data/site";
import { useAutoClose } from "./autoClose";

/**
 * A main menu item with a submenu (disclosure pattern): a button that opens a list of links.
 * Keyboard: Enter or Space opens it, ↓ ↑ move between links, Esc closes and returns to the button.
 * The list is placed under the button with position: fixed, so it is never cut off by the
 * scrolling menu bar on phones. It closes by itself on a tap or click elsewhere, when focus
 * leaves it, when another menu opens, on scroll or resize, and when the page changes.
 */
export default function NavMenu({ group, t, current }: { group: NavGroup; t: (key: string) => string; current: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<CSSProperties>({});
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const active = group.children.some((c) => current(c.href));
  // Long menus are split into named columns ("Start here", "Your language", …).
  const sections = group.children.reduce<{ title: string; links: typeof group.children }[]>((out, c) => {
    const title = c.section ?? "";
    const last = out.at(-1);
    if (last && last.title === title) last.links.push(c);
    else out.push({ title, links: [c] });
    return out;
  }, []);
  const wide = sections.length > 1;
  const close = useCallback(() => setOpen(false), []);
  useAutoClose(open, close, [button, list]);

  const show = () => {
    const r = button.current?.getBoundingClientRect();
    if (r) {
      // Hangs from the button, with a small pointer at the button's middle, so it reads as one piece.
      const width = Math.min(wide ? 760 : 340, window.innerWidth - 32);
      const left = Math.max(16, Math.min(r.left, window.innerWidth - width - 16));
      const top = r.bottom + 10;
      setPlace({
        top, left, width, maxHeight: window.innerHeight - top - 16,
        ["--arrow-x" as string]: `${Math.round(r.left + r.width / 2 - left - 7)}px`,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const key = (e: KeyboardEvent) => {
      const links = [...(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
      const at = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        links[(at + 1) % links.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        links[(at - 1 + links.length) % links.length]?.focus();
      }
    };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close);
    };
  }, [open]);

  return (
    <div className="nav-menu">
      <button
        ref={button}
        type="button"
        className="nav-menu__button"
        aria-expanded={open}
        aria-controls={id}
        data-active={active || undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
            requestAnimationFrame(() => list.current?.querySelector("a")?.focus());
          }
        }}
      >
        {t(group.key)}
        <span className="nav-menu__caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div ref={list} id={id} className={`nav-menu__pop${wide ? " is-wide" : ""}`} style={place}>
          <div className="nav-menu__list">
            {sections.map((sec) => (
              <div key={sec.title || "all"} className="nav-menu__sec">
                {sec.title && <p className="nav-menu__sec-title" aria-hidden="true">{sec.title}</p>}
                <ul aria-label={sec.title || undefined}>
                  {sec.links.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} aria-current={current(c.href) ? "page" : undefined} onClick={() => setOpen(false)} lang={c.key ? undefined : "en"}>
                        <strong>{c.key ? t(c.key) : c.label}</strong>
                        {c.hint && <span>{c.hint}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
