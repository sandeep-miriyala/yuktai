"use client";
// Small, polite animations for the home page: numbers that count up and
// blocks that draw in when they scroll into view. The real values are in the
// HTML from the start (search engines, screen readers, no-JS), and nothing
// moves for visitors who chose reduced motion or "Animations: off".

import { useEffect, useRef, useState, type ReactNode } from "react";

function motionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.getAttribute("data-motion") === "off") return false;
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** A number that counts up from 0 the first time it is seen. */
export function CountUp({ value, className, suffix = "" }: { value: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0 || !motionAllowed() || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const ms = Math.min(1600, 700 + value / 2);
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / ms);
          setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{shown.toLocaleString("en-IN")}{suffix}</span>
      <span className="sr-only">{value.toLocaleString("en-IN")}{suffix}</span>
    </span>
  );
}

/** Adds "is-in" when the block scrolls into view (CSS does the drawing). */
export function InView({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const ref = useRef<HTMLElement>(null);
  // "static": as rendered on the server (fully visible). "wait": hidden until seen. "in": drawn.
  const [phase, setPhase] = useState<"static" | "wait" | "in">("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed() || typeof IntersectionObserver === "undefined") return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: don't hide it
    setPhase("wait");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setPhase("in");
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cls = `${className ?? ""}${phase === "wait" ? " will-draw" : phase === "in" ? " will-draw is-in" : ""}`;
  return (
    <figure ref={ref} className={cls} aria-label={label}>
      {children}
    </figure>
  );
}
