"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { SPLASH_CSS, SPLASH_KEY, splashWordCss } from "./splash";
import { UI_LANGUAGES, WELCOME, getUiLanguage, uiText, type UiLanguage } from "./uiLanguage";

export interface YuktaiSplashProps {
  /** Your logo or banner (an <img> or SVG). */
  logo: ReactNode;
  /** Site name, read out to screen readers: "Loading YuktaiDocs". */
  title: string;
  /** Words that take turns under the logo. Default: "Welcome" in 7 languages. */
  words?: string[];
  /**
   * Time on screen in ms, counted from when the page started loading. Default 1200.
   * From 4,000 ms the bar fills over that time and the Skip button counts down.
   */
  minMs?: number;
  /** Short lines shown one after another under the bar, for longer loading screens. */
  tips?: string[];
  /** ms each tip stays. Default 3000. */
  tipMs?: number;
  /** "session" (default): once per browser tab. "always": every page load. */
  once?: "session" | "always";
  /** Show a Skip button. Default true. Esc and a click anywhere also skip. */
  skippable?: boolean;
  onDone?: () => void;
}

/**
 * Loading screen: your logo, "Welcome" in English + 6 Indian languages, a progress bar.
 * The visitor's animation choice is respected (Off shows still text). Shown once per tab.
 * Add SPLASH_SCRIPT from @yuktishaalaa/yuktai/head to <head> so returning visitors
 * never see a flash of it.
 */
export function YuktaiSplash({ logo, title, words, minMs = 1200, tips, tipMs = 3000, once = "session", skippable = true, onDone }: YuktaiSplashProps) {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");
  const [lang, setLang] = useState<UiLanguage>("en");
  const [left, setLeft] = useState(Math.ceil(minMs / 1000));
  const [tip, setTip] = useState(0);
  const timed = minMs >= 4000;
  const tipCount = tips?.length ?? 0;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const list = words ?? UI_LANGUAGES.map((l) => WELCOME[l.code]);

  const leave = () => {
    setState((s) => (s === "show" ? "leaving" : s));
  };

  useEffect(() => {
    let seen = false;
    try {
      seen = once === "session" && sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {}
    // browser storage is read after mount, so the first render matches the server
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(getUiLanguage());
    if (seen) {
      setState("gone");
      return;
    }
    const elapsed = typeof performance !== "undefined" ? performance.now() : 0;
    const timer = window.setTimeout(leave, Math.max(0, minMs - elapsed));
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") leave(); };
    document.addEventListener("keydown", key);
    // countdown on the Skip button and the next tip
    const end = Date.now() + Math.max(0, minMs - elapsed);
    const tick = window.setInterval(() => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 250);
    const tipTimer = tipCount > 1 ? window.setInterval(() => setTip((t) => (t + 1) % tipCount), tipMs) : 0;
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(tick);
      if (tipTimer) window.clearInterval(tipTimer);
      document.removeEventListener("keydown", key);
    };
  }, [minMs, once, tipCount, tipMs]);

  useEffect(() => {
    if (state !== "leaving") return;
    try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch {}
    const off = document.documentElement.getAttribute("data-motion") === "off";
    const t = window.setTimeout(() => {
      setState("gone");
      doneRef.current?.();
    }, off ? 0 : 450);
    return () => window.clearTimeout(t);
  }, [state]);

  if (state === "gone") return null;
  // short screens: quick words; long screens: each word stays about a second
  const cycle = list.length * (timed ? 1.1 : 0.4);
  return (
    <div
      className={`yk-splash${timed ? " yk-splash--timed" : ""}${state === "leaving" ? " yk-leaving" : ""}`}
      onClick={skippable ? leave : undefined}
      style={{
        ["--yk-splash-cycle" as string]: `${cycle}s`,
        ["--yk-splash-ms" as string]: `${minMs}ms`,
        // if the page never starts (no JavaScript), the screen still goes away
        ["--yk-splash-safety" as string]: `${minMs + 5000}ms`,
      }}
    >
      <style>{SPLASH_CSS + splashWordCss(list.length)}</style>
      <span role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {uiText(lang, "loading")} {title}
      </span>
      <div className="yk-splash__logo" aria-hidden="true">
        <span className="yk-splash__ring" />
        {logo}
      </div>
      <div className="yk-splash__words" aria-hidden="true">
        {list.map((w, i) => (
          <span key={w} lang={UI_LANGUAGES[i]?.code} style={{ animationDelay: `${(i * cycle) / list.length}s` }}>{w}</span>
        ))}
      </div>
      <p className="yk-splash__static" aria-hidden="true">{list.join(" · ")}</p>
      <div className="yk-splash__bar" aria-hidden="true"><i /></div>
      {tips && tips.length > 0 && (
        // aria-hidden: a screen reader should not be interrupted every few seconds
        <p className="yk-splash__tip" key={tip} aria-hidden="true">{tips[tip % tips.length]}</p>
      )}
      {skippable && (
        <button type="button" className="yk-splash__skip" lang={lang} onClick={(e) => { e.stopPropagation(); leave(); }}>
          {uiText(lang, "skipIntro")}
          {timed && left > 0 && <span aria-hidden="true"> ({left})</span>}
        </button>
      )}
    </div>
  );
}

export default YuktaiSplash;
