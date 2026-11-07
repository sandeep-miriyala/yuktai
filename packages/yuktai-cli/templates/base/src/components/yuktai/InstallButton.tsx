"use client";

import { useEffect, useRef, useState } from "react";
import { InstallIcon } from "@yuktishaalaa/yuktai/icons";
import { useUiText } from "@yuktishaalaa/yuktai/experience";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type InstallWindow = Window & { __yuktaiInstall?: InstallPrompt | null };

/** How to install on this device when the browser has no install prompt to offer. */
function howToInstall(): string[] {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const firefox = /Firefox|FxiOS/.test(ua);
  const safariMac = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  if (ios) return ["Tap the Share button (the square with an arrow).", "Choose “Add to Home Screen”, then “Add”."];
  if (android && firefox) return ["Open the browser menu ⋮.", "Choose “Install” or “Add to Home screen”."];
  if (android) return ["Open the browser menu ⋮.", "Choose “Install app” or “Add to Home screen”."];
  if (safariMac) return ["In the menu bar choose File → “Add to Dock”."];
  if (firefox) return ["Firefox on computers can't install web apps yet.", "Open this site in Chrome, Edge or Safari to install it."];
  return [
    "Look for the install icon at the right end of the address bar, or",
    "open the browser menu ⋮ → “Cast, save and share” → “Install page as app” (Chrome) or Apps → “Install this site as an app” (Edge).",
  ];
}

const installed = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.matchMedia("(display-mode: window-controls-overlay)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * "Install app": always in the header until the app is installed.
 * Chrome, Edge and Android Chrome show their own install prompt; every other browser
 * gets short steps for that device.
 */
export default function InstallButton() {
  const [ready, setReady] = useState(false);
  const { t } = useUiText();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [steps, setSteps] = useState<string[] | null>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The offer may have come before React started: INSTALL_SCRIPT (theme.ts) kept it.
    const take = () => setPrompt((window as InstallWindow).__yuktaiInstall ?? null);
    const offer = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt); };
    const done = () => { setPrompt(null); setReady(false); };
    // window and matchMedia exist only after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(!installed());
    take();
    document.addEventListener("yuktai:install", take);
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", done);
    return () => {
      document.removeEventListener("yuktai:install", take);
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  useEffect(() => {
    if (!steps) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setSteps(null); button.current?.focus(); } };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [steps]);

  if (!ready) return null;
  return (
    <div className="install-wrap">
      <button
        ref={button}
        type="button"
        className="install-btn"
        aria-expanded={prompt ? undefined : Boolean(steps)}
        onClick={async () => {
          if (prompt) {
            await prompt.prompt();
            const choice = await prompt.userChoice.catch(() => null);
            setPrompt(null);
            (window as InstallWindow).__yuktaiInstall = null; // an offer can be used once
            if (choice?.outcome === "accepted") setReady(false);
            return;
          }
          setSteps((s) => (s ? null : howToInstall()));
        }}
      >
        <InstallIcon size={18} aria-hidden="true" />
        <span>{t("installApp")}</span>
      </button>
      {steps && (
        <div className="install-help" role="dialog" aria-label="Install this app">
          <strong>Install this app</strong>
          <ol>{steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="hint">It opens like an app and works offline after the first visit.</p>
          <button type="button" className="btn" onClick={() => { setSteps(null); button.current?.focus(); }}>Close</button>
        </div>
      )}
    </div>
  );
}
