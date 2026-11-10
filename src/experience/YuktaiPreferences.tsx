"use client";

import React, { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { MOTION_CHOICES, ensureMotionCss, getMotionChoice, setMotion, subscribeMotion, type MotionChoice } from "./motion";
import { UI_LANGUAGES, setUiLanguage, useUiText, type UiLanguage, type UiText } from "./uiLanguage";

const MOTION_WORD: Record<MotionChoice, string> = { auto: "motionAuto", off: "motionOff", calm: "motionCalm", lively: "motionLively" };

const PREF_CSS = `
.yk-pref{position:relative}
.yk-pref__btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:44px;min-height:44px;padding:0 10px;border-radius:12px;border:1px solid var(--yk-pref-border,rgba(0,0,0,.15));background:var(--yk-pref-bg,transparent);color:inherit;font:inherit;font-weight:700;cursor:pointer}
.yk-pref__btn:focus-visible{outline:3px solid var(--yk-pref-focus,#1d4ed8);outline-offset:2px}
.yk-pref__panel{position:absolute;right:0;top:calc(100% + 8px);z-index:60;width:min(320px,calc(100vw - 32px));display:grid;gap:14px;padding:16px;border-radius:16px;border:1px solid var(--yk-pref-border,rgba(0,0,0,.15));background:var(--yk-pref-panel,#fff);color:var(--yk-pref-text,#0b1033);box-shadow:0 24px 60px -20px rgba(0,0,0,.35);text-align:left}
:root:not([data-motion="off"]) .yk-pref__panel{animation:yk-pref-in .22s ease both}
:root[data-motion="lively"] .yk-pref__panel{animation:yk-pref-in .35s cubic-bezier(.2,.9,.3,1.3) both}
@keyframes yk-pref-in{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
.yk-pref__panel label,.yk-pref__panel legend{font-weight:700;font-size:.9rem}
.yk-pref__panel select{width:100%;min-height:44px;margin-top:6px;padding:0 10px;border-radius:10px;border:1px solid var(--yk-pref-border,rgba(0,0,0,.2));background:var(--yk-pref-bg-field,transparent);color:inherit;font:inherit}
.yk-pref__panel fieldset{border:0;margin:0;padding:0;min-width:0}
.yk-pref__seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
.yk-pref__seg label{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 10px;border-radius:10px;border:1px solid var(--yk-pref-border,rgba(0,0,0,.2));cursor:pointer;font-weight:600}
.yk-pref__seg label:has(input:checked){border-color:var(--yk-pref-accent,#1d4ed8);background:color-mix(in srgb,var(--yk-pref-accent,#1d4ed8) 12%,transparent)}
.yk-pref__seg input{accent-color:var(--yk-pref-accent,#1d4ed8)}
.yk-pref__hint{margin:0;font-size:.82rem;opacity:.8;line-height:1.5}
`;

function usePrefCss() {
  useEffect(() => {
    ensureMotionCss();
    if (document.getElementById("yk-pref-css")) return;
    const s = document.createElement("style");
    s.id = "yk-pref-css";
    s.textContent = PREF_CSS;
    document.head.appendChild(s);
  }, []);
}

/** A select of the 7 site languages. */
export function LanguagePicker({ text }: { text?: UiText }) {
  const { t, lang } = useUiText(text);
  const id = useId();
  usePrefCss();
  return (
    <label htmlFor={id} lang={lang}>
      {t("language")}
      <select id={id} value={lang} onChange={(e) => setUiLanguage(e.target.value as UiLanguage)}>
        {UI_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}{l.code === "en" ? "" : ` (${l.english})`}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Device setting / Off / Calm / Lively. The visitor decides how much moves. */
export function MotionPicker({ text }: { text?: UiText }) {
  const { t, lang } = useUiText(text);
  const choice = useSyncExternalStore(subscribeMotion, getMotionChoice, () => "auto" as MotionChoice);
  const name = useId();
  usePrefCss();
  return (
    <fieldset lang={lang}>
      <legend>{t("motion")}</legend>
      <div className="yk-pref__seg">
        {MOTION_CHOICES.map((c) => (
          <label key={c}>
            <input type="radio" name={name} checked={choice === c} onChange={() => setMotion(c)} />
            <span>{t(MOTION_WORD[c])}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export interface YuktaiPreferencesProps {
  /** The button's icon (for example <GlobeIcon />). */
  icon?: ReactNode;
  /** Your own words for the labels. */
  text?: UiText;
  /** Show the language part. Default true. */
  language?: boolean;
  /** Show the animations part. Default true. */
  motion?: boolean;
  /** Extra parts at the end of the panel. */
  children?: ReactNode;
  className?: string;
}

/**
 * One header button with a small panel: site language (English + 6 Indian languages)
 * and animations (Device setting / Off / Calm / Lively). Saved in this browser only.
 */
export function YuktaiPreferences({ icon, text, language = true, motion = true, children, className }: YuktaiPreferencesProps) {
  const { t, lang } = useUiText(text);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  usePrefCss();

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const click = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", click);
    panel.current?.querySelector<HTMLElement>("select, input")?.focus();
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", click);
    };
  }, [open]);

  const short = UI_LANGUAGES.find((l) => l.code === lang)?.name.slice(0, 2) ?? "En";
  return (
    <div className={`yk-pref${className ? ` ${className}` : ""}`}>
      <button
        ref={button}
        type="button"
        className="yk-pref__btn"
        aria-expanded={open}
        aria-controls={id}
        // Label in Name (WCAG 2.5.3): the visible short language code starts the name
        aria-label={`${short}: ${t("settings")}`}
        title={t("settings")}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span aria-hidden="true" lang={lang}>{short}</span>
      </button>
      {open && (
        <div ref={panel} id={id} className="yk-pref__panel" role="dialog" aria-label={t("settings")} lang={lang}>
          {language && <LanguagePicker text={text} />}
          {language && <p className="yk-pref__hint">{t("uiNote")}</p>}
          {motion && <MotionPicker text={text} />}
          {children}
          <p className="yk-pref__hint">{t("saved")}</p>
        </div>
      )}
    </div>
  );
}

export default YuktaiPreferences;
