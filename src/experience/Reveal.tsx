"use client";

import React, { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ensureMotionCss } from "./motion";

export interface RevealProps {
  children: ReactNode;
  /** Wait this many ms after it comes into view (for a row of cards: 0, 80, 160…). */
  delay?: number;
  /** The element to render. Default "div". */
  as?: "div" | "section" | "li" | "article" | "span";
  className?: string;
  style?: CSSProperties;
}

/**
 * Fades and slides its content in when it scrolls into view.
 * Follows the visitor's animation choice: nothing moves when it is Off.
 * Content is never hidden on the server or without JavaScript.
 */
export function Reveal({ children, delay = 0, as = "div", className, style }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureMotionCss();
    if (document.documentElement.getAttribute("data-motion") === "off" || typeof IntersectionObserver === "undefined") return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // already on screen: leave it
    el.classList.add("yk-armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.remove("yk-armed");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("yk-armed");
    };
  }, []);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`yk-reveal${className ? ` ${className}` : ""}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
