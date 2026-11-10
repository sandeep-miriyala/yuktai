"use client";

import { useState, type FormEvent } from "react";
import { asset } from "@/lib/base";
import { ChatIcon, ArrowRightIcon, CopyIcon, CheckIcon } from "@yuktishaalaa/yuktai/icons";
import { QUESTIONS, VERSIONS } from "@/data/site";
import { ask } from "@/components/yuktai/ask";
import { useUiText } from "@yuktishaalaa/yuktai/experience";
import { SITE_TEXT } from "@/data/uiText";

const INSTALL = `npm i @yuktishaalaa/yuktai@${VERSIONS.yuktai}`;

export default function Hero() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const { t, lang } = useUiText(SITE_TEXT);

  function submit(e: FormEvent) {
    e.preventDefault();
    ask(q);
    setQ("");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <>
    {/* The YuktAI banner, centred at the top like the README. Light and dark follow the theme button too. */}
    <div className="brand-banner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-banner hero-banner-light yk-float" src={asset("/brand/yuktai-logo-light.svg")} alt="YuktAI: Open-Source Agentic AI Framework" width={588} height={176} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-banner hero-banner-dark yk-float" src={asset("/brand/yuktai-logo-dark.svg")} alt="" width={620} height={208} />
    </div>
    <section className="hero" aria-labelledby="hero-h">
      <div className="hero-copy">
        <p className="hero-badge"><b>NEW</b> Ask page {VERSIONS.askPage} · WebMCP connects by itself</p>
        <h1 id="hero-h" lang={lang}>{t("h1a")}<span className="grad yk-shimmer">{t("h1b")}</span>{t("h1c")}</h1>
        <p className="lead" lang={lang}>{t("lead")}</p>

        <form className="hero-ask" role="search" onSubmit={submit}>
          <ChatIcon size={22} aria-hidden="true" />
          <label htmlFor="hero-q" className="sr-only" lang={lang}>{t("placeholder")}</label>
          <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("placeholder")} lang={lang} autoComplete="off" enterKeyHint="send" />
          <kbd className="kbd" aria-hidden="true">Ctrl K</kbd>
          <button className="btn primary" type="submit" lang={lang}><span>{t("ask")}</span><ArrowRightIcon size={18} aria-hidden="true" /></button>
        </form>

        <ul className="chips" aria-label="Try a question">
          {QUESTIONS.map((c) => (
            <li key={c.label}><button type="button" className="chip" onClick={() => ask(c.ask)}>{c.label}</button></li>
          ))}
        </ul>

        <div className="install">
          <span aria-hidden="true">$</span>
          <code>{INSTALL}</code>
          <button type="button" onClick={copy} aria-live="polite">
            {copied ? <CheckIcon size={16} aria-hidden="true" /> : <CopyIcon size={16} aria-hidden="true" />}
            <span lang={lang}>{copied ? t("copied") : t("copy")}</span>
          </button>
        </div>
      </div>

      {/* A picture of the panel: decorative, the real one opens from the box on the left */}
      <div className="ask-card no-ask" aria-hidden="true">
        <div className="ask-card-head">
          <span className="dot" />
          <strong>Ask these docs</strong>
          <span className="pill">Rust · WASM</span>
        </div>
        <div className="ask-card-body">
          <p className="bubble me">Is my visitor&apos;s data sent to a server?</p>
          <div className="bubble bot">
            <p>No. Accessibility fixes, grid questions, page search and the Rust engines all run in the visitor&apos;s browser. Nothing is sent and there is no telemetry.</p>
            <p className="src">Source · Private by design ↗</p>
          </div>
          <p className="ask-card-foot">0 bytes sent · works offline · answers with source</p>
        </div>
      </div>
    </section>
    </>
  );
}
