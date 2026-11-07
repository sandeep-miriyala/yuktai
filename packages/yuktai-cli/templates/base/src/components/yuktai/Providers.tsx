"use client";

import { useEffect, type ReactNode } from "react";
import { YuktAIWrapper } from "@yuktishaalaa/yuktai";
import config from "@config";
import { ask, askPanel } from "./ask";
import { isDark, subscribeTheme } from "./theme";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * YuktAI on every page, from npm:
 *  • @yuktishaalaa/yuktai   → ♿ accessibility (and 🛠 page tools when on in yuktai.config.ts)
 *  • @yuktishaalaa/ask-page → "Ask this page" panel: header button, hero box, Ctrl + K
 * Nothing here sends what visitors type anywhere.
 */
export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    const theme = () => askPanel()?.setAttribute("theme", isDark() ? "dark" : "light");

    if (config.features.ask) {
      import("@yuktishaalaa/ask-page").then(({ mountAskPage }) => {
        if (cancelled || askPanel()) return;
        mountAskPage({ launcher: false, title: "Ask this page", root: "main", exclude: [".no-ask", "[aria-hidden=true]"] });
        theme();
      });
    }

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k" && config.features.ask) {
        e.preventDefault();
        ask();
      }
    };
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production" && config.features.pwa && /^https?:$/.test(location.protocol)) {
        navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {});
      } else {
        // While you develop, no offline cache: an old service worker (from this app or another site
        // that used the same localhost port) could otherwise serve stale pages and missing styles.
        navigator.serviceWorker.getRegistrations().then((all) => all.forEach((r) => r.unregister())).catch(() => {});
      }
    }
    document.addEventListener("keydown", onKey);
    const off = subscribeTheme(theme);
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      off();
    };
  }, []);

  if (!config.features.accessibility) return <>{children}</>;
  return (
    <YuktAIWrapper position={config.widget.position} launcher showAccessibility showPageTools={config.features.pageTools} engine={config.engine}>
      {children}
    </YuktAIWrapper>
  );
}
