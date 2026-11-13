// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y · src/global.ts — the <script> build (a11y.global.js).
//
//   <body data-yuktai-a11y="auto" data-yuktai-level="AA">
//   <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/a11y/dist/a11y.global.js" defer></script>
//
// Starts by itself when <body> or <html> has a data-yuktai-* attribute, or
// when window.YuktaiA11yConfig is set. window.YuktaiA11y gives the instance.
// ─────────────────────────────────────────────────────────────────────────────

import { createA11y, hasAttributes, VERSION, type A11y, type A11yOptions } from "./index"
import { addSpeakButtons } from "./speakButtons"
import * as api from "./index"

declare global {
  interface Window {
    YuktaiA11yConfig?: A11yOptions
    YuktaiA11y?: { instance: A11y | null; version: string; api: typeof api; start: (o?: A11yOptions) => A11y }
  }
}

let instance: A11y | null = null
let removeButtons: (() => void) | null = null

function start(o: A11yOptions = {}): A11y {
  instance?.destroy()
  removeButtons?.()
  instance = createA11y({ ...window.YuktaiA11yConfig, ...o })
  instance.run()
  if (instance.settings.speak === "on") removeButtons = addSpeakButtons(document)
  if (window.YuktaiA11y) window.YuktaiA11y.instance = instance
  return instance
}

window.YuktaiA11y = { instance: null, version: VERSION, api, start }

const boot = () => {
  if (window.YuktaiA11yConfig || hasAttributes(document)) start()
}

// After hydration-sensitive frameworks have rendered: wait for load + a frame.
if (document.readyState === "complete") requestAnimationFrame(boot)
else window.addEventListener("load", () => requestAnimationFrame(boot), { once: true })
