"use client";

import { useEffect, useState } from "react";
import { loadCore, type Engine } from "@/lib/core";

// A small live check: counts the words on this page with the app's core
// (Rust → WebAssembly when it is built, TypeScript otherwise) and times it.
export default function EngineDemo() {
  const [r, setR] = useState<{ engine: Engine; words: number; ms: number } | null>(null);
  useEffect(() => {
    let alive = true;
    loadCore().then((core) => {
      const text = document.querySelector("main")?.textContent ?? "";
      const t0 = performance.now();
      const words = core.countWords(text);
      const ms = performance.now() - t0;
      if (alive) setR({ engine: core.engine, words, ms });
    });
    return () => { alive = false; };
  }, []);
  if (!r) return null;
  return (
    <p className="engine no-ask" aria-live="polite">
      <span>Engine: <strong>{r.engine === "rust" ? "Rust → WebAssembly" : "TypeScript"}</strong></span>
      <span>{r.words} words on this page</span>
      <span>{r.ms < 0.01 ? "< 0.01" : r.ms.toFixed(2)} ms</span>
    </p>
  );
}
