// ─────────────────────────────────────────────────────────────────────────────
// assistant.global.js — the script for any website:
//
//   <script>window.YuktaiAssistantConfig = { features: ["ask", "a11y"], level: "AA", title: "My site", color: "#2F43C4" }</script>
//   <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/assistant@6/dist/assistant.global.js" defer></script>
//
// Starts after the page has loaded (and after React/Next.js hydration).
// window.YuktaiAssistant.instance gives the running assistant.
// ─────────────────────────────────────────────────────────────────────────────

import { mountAssistant, VERSION, type Assistant, type AssistantConfig } from "./index"

declare global {
  interface Window {
    YuktaiAssistantConfig?: AssistantConfig
    YuktaiAssistant?: { instance: Assistant | null; version: string; mount: (c?: AssistantConfig) => Assistant }
  }
}

const mount = (c?: AssistantConfig) => {
  const a = mountAssistant({ ...window.YuktaiAssistantConfig, ...c })
  if (window.YuktaiAssistant) window.YuktaiAssistant.instance = a
  return a
}

window.YuktaiAssistant = window.YuktaiAssistant ?? { instance: null, version: VERSION, mount }

const boot = () => {
  if (!window.YuktaiAssistant!.instance && (window as { YuktaiAssistantAutoStart?: boolean }).YuktaiAssistantAutoStart !== false) mount()
}
if (document.readyState === "complete") requestAnimationFrame(boot)
else window.addEventListener("load", () => requestAnimationFrame(boot), { once: true })
