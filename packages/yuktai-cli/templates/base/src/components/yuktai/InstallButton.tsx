"use client";

import { useEffect, useState } from "react";
import { InstallIcon } from "@yuktishaalaa/yuktai/icons";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// "Install app": shown when the browser offers to install the site (Chrome, Edge, Android).
export default function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    const offer = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt); };
    const done = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  if (!prompt) return null;
  return (
    <button
      type="button"
      className="install-btn"
      onClick={async () => {
        await prompt.prompt();
        await prompt.userChoice.catch(() => null);
        setPrompt(null);
      }}
    >
      <InstallIcon size={18} aria-hidden="true" />
      <span>Install app</span>
    </button>
  );
}
