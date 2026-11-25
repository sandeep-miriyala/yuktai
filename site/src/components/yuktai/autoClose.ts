"use client";

import { useEffect, useId, type RefObject } from "react";

const OPENED = "yuktai:popup-open";

/**
 * Closes an open menu or popup by itself, the way people expect:
 * - a tap or click anywhere else (mouse, touch or pen),
 * - keyboard focus moving out of it (Tab past the end, or opening something else),
 * - another menu or popup on the page opening (only one is open at a time).
 * Escape and "choose a link" stay with the component, which also returns focus.
 * Pages changing (back, forward, a link) remount the header's menus, so they start closed.
 */
export function useAutoClose(open: boolean, close: () => void, parts: RefObject<HTMLElement | null>[]) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const inside = (n: EventTarget | null) => n instanceof Node && parts.some((p) => p.current?.contains(n));
    const away = (e: Event) => { if (!inside(e.target)) close(); };
    const other = (e: Event) => { if ((e as CustomEvent<string>).detail !== id) close(); };
    document.dispatchEvent(new CustomEvent(OPENED, { detail: id }));
    document.addEventListener("pointerdown", away);
    document.addEventListener("focusin", away);
    document.addEventListener(OPENED, other);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("focusin", away);
      document.removeEventListener(OPENED, other);
    };
    // parts are refs: stable for the life of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close, id]);
}
