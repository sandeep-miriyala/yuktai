"use client";

import { useEffect, type ReactNode } from "react";
import { asset } from "@/lib/base";
import config from "@config";
import { startDocs } from "@/lib/docs/runtime";
import { ask, askPanel } from "./ask";
import { isDark, subscribeTheme } from "./theme";

/**
 * YuktAI on every page, from npm:
 *  • @yuktishaalaa/yuktai   → ♿ accessibility and 🛠 page tools, and window.yuktai for the
 *    live demos (one instance for the whole site, so moving between pages stays instant)
 *  • @yuktishaalaa/ask-page → "Ask these docs": header button, hero box, Ctrl + K
 */
export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    const theme = () => askPanel()?.setAttribute("theme", isDark() ? "dark" : "light");
    if (config.features.accessibility) void startDocs();
    if (config.features.ask) {
      import("@yuktishaalaa/ask-page").then(({ mountAskPage }) => {
        if (cancelled || askPanel()) return;
        // live demos hold sample inputs and outputs, not docs
        mountAskPage({ launcher: false, title: "Ask these docs", root: "main", exclude: [".no-ask", "[aria-hidden=true]", ".demo", ".out", "[aria-live]"] });
        theme();
      });
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ask();
      }
    };
    // "Try" buttons on the guides: <button data-ask="question">
    const onClick = (e: MouseEvent) => {
      const b = (e.target as Element | null)?.closest?.("[data-ask]");
      if (b) ask(b.getAttribute("data-ask") ?? "");
    };
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production" && config.features.pwa && /^https?:$/.test(location.protocol)) {
        navigator.serviceWorker.register(asset("/sw.js"), { scope: asset("/") }).catch(() => {});
      } else {
        // npm run dev: no offline cache, and remove any old one on this localhost port
        navigator.serviceWorker.getRegistrations().then((all) => all.forEach((r) => r.unregister())).catch(() => {});
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    const off = subscribeTheme(theme);
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      off();
    };
  }, []);

  return <>{children}</>;
}
