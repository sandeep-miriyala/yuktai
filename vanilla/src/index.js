// yuktai vanilla — entry point. Builds window.yuktai.
//
//   <script>window.YUKTAI_CONFIG = { position: "right", showPageTools: true }</script>
//   <script src="./index.js"></script>
//
// Everything runs in the browser: no API keys, no server calls, no telemetry.

import * as core from "./core.js"
import { createAgenticGrid, createGridAgent, parseGridIntent, registerWebMCP } from "./agent.js"
import { mountAgenticGridBar } from "./bar.js"
import { addStyles, icon, ICON_NAMES, isBrowser, safeColor } from "./dom.js"
import { mountGridAssistant, renderGrid } from "./grid.js"
import { mountAgenticPanel } from "./panel.js"
import { createWidget } from "./widget.js"

const VERSION = "5.3.0"

;(function boot() {
  if (!isBrowser()) return
  if (window.yuktai && window.yuktai.__vanillaInitialized) return

  const cfg = window.YUKTAI_CONFIG || {}
  const primary = safeColor(cfg.primaryColor, "#0f766e")
  const side = cfg.position === "right" ? "right" : "left"
  const widget = createWidget(cfg)
  const ensureStyles = () => addStyles(primary, side)

  const withStyles =
    (fn) =>
    (...args) => {
      ensureStyles()
      return fn(...args)
    }

  const yuktai = {
    __vanillaInitialized: true,
    version: VERSION,

    // ── floating accessibility widget ──
    init: () => widget.init(),
    open: () => widget.open(),
    close: () => widget.close(),
    openTools: (tab) => widget.openTools(tab),
    closeTools: () => widget.closeTools(),
    apply: (settings) => widget.apply(settings),
    reset: () => widget.reset(),
    getSettings: () => widget.getSettings(),

    // ── UI (vanilla versions of the React components) ──
    renderGrid: withStyles(renderGrid), //            <YuktaiGrid>
    mountAgenticGridBar: withStyles(mountAgenticGridBar), // <AgenticGridBar>
    mountAgenticPanel: withStyles(mountAgenticPanel), // <AgenticPanel>
    mountGridAssistant: withStyles(mountGridAssistant), // <YuktaiGridAI embedded>

    // ── agents (vanilla versions of the React hooks) ──
    createAgenticGrid, //  useAgenticGrid
    createGridAgent, //    useYuktaiGridAgent
    parseGridIntent,
    registerWebMCP, //     <YuktaiGridWebMCP>

    // ── icons ──
    icon,
    iconNames: ICON_NAMES.slice(),

    // ── everything from the package core (same code as npm) ──
    ...core,

    // ── v5.1 vanilla compatibility ──
    runPageQA: () => core.runQaAudit().summary,

    getCapabilities: () => ({
      version: VERSION,
      inlineSVG: true,
      grid: true,
      gridAssistant: true,
      agenticGrid: true,
      ruleBasedBI: true,
      taskRunner: true,
      anomalyChecks: true,
      pageQA: true,
      a11yCopilot: true,
      formsReview: true,
      designReview: true,
      pageQandA: true,
      localPageSearch: true,
      voiceCommands: true,
      voice: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      speech: "speechSynthesis" in window,
      webMCP: !!(document.modelContext && typeof document.modelContext.registerTool === "function"),
      modelConnected: false,
    }),
  }

  window.yuktai = yuktai

  if (cfg.autoInit !== false) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => widget.init(), { once: true })
    else widget.init()
  }
})()
