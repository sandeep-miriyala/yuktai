"use client";

import { useState, type FormEvent } from "react";
import { ChatIcon, ArrowRightIcon } from "@yuktishaalaa/yuktai/icons";
import { ask } from "@/components/yuktai/ask";

// A big "ask" box: sends the question to the Ask panel.
export default function HeroAsk() {
  const [q, setQ] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    ask(q);
    setQ("");
  }
  return (
    <form className="hero-ask" role="search" onSubmit={submit}>
      <ChatIcon size={22} aria-hidden="true" />
      <label htmlFor="hero-q" className="sr-only">Ask this page</label>
      <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about this site…" autoComplete="off" enterKeyHint="send" />
      <button className="btn primary" type="submit"><span>Ask</span><ArrowRightIcon size={18} aria-hidden="true" /></button>
    </form>
  );
}
