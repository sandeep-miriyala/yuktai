// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/global.ts → dist/ask-page.global.js
// One script tag, no build step:
//
//   <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/ask-page/dist/ask-page.global.js" defer></script>
//
// Adds the panel automatically. Configure with window.YuktaiAskConfig = {...}
// before the script, or a <yuktai-ask config='{"modes":["fast"]}'> element.
// Add data-manual to the script tag to mount it yourself:
//   YuktaiAsk.mount({ ... })
// ─────────────────────────────────────────────────────────────────────────────

import { AskPage } from "./controller"
import { defineAskPage, mountAskPage, YuktaiAskElement } from "./ui/AskPanel"
import { VERSION } from "./config"
import type { OwnerConfig } from "./types"

const w = window as unknown as { YuktaiAskConfig?: OwnerConfig; YuktaiAsk?: unknown }
const script = document.currentScript as HTMLScriptElement | null

defineAskPage()
w.YuktaiAsk = { AskPage, YuktaiAskElement, mount: mountAskPage, version: VERSION }

function auto() {
  if (script?.hasAttribute("data-manual")) return
  if (document.querySelector("yuktai-ask")) return
  mountAskPage(w.YuktaiAskConfig ?? {})
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto, { once: true })
else auto()
