"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { NavGroup } from "@/data/site";

/**
 * A main menu item with a submenu (disclosure pattern): a button that opens a list of links.
 * Keyboard: Enter or Space opens it, ↓ ↑ move between links, Esc closes and returns to the button.
 * The list is placed under the button with position: fixed, so it is never cut off by the
 * scrolling menu bar on phones.
 */
export default function NavMenu({ group, t, current }: { group: NavGroup; t: (key: string) => string; current: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<CSSProperties>({});
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const active = group.children.some((c) => current(c.href));

  const show = () => {
    const r = button.current?.getBoundingClientRect();
    if (r) {
      const width = Math.min(340, window.innerWidth - 32);
      setPlace({ top: r.bottom + 8, left: Math.max(16, Math.min(r.left, window.innerWidth - width - 16)), width });
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
    const click = (e: MouseEvent) => {
      if (!list.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", click);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", click);
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
        <ul ref={list} id={id} className="nav-menu__list" style={place}>
          {group.children.map((c) => (
            <li key={c.href}>
              <Link href={c.href} aria-current={current(c.href) ? "page" : undefined} onClick={() => setOpen(false)}>
                <strong>{t(c.key)}</strong>
                {c.hint && <span>{c.hint}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
