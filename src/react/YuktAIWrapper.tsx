// ─────────────────────────────────────────────────────────────────────────────
// src/react/YuktAIWrapper.tsx
// yuktai v3.1.0 — Yuktishaalaa AI Lab
//
// Floating buttons, stacked vertically. v5.3.9: each one is turned on by
// the developer, and an optional launcher shows/hides them all:
//
//   <YuktAIWrapper position="left" launcher showAccessibility showRag
//                  showAgent showVibeCoder engine="rust">
//
//   ✨  launcher        — launcher         (one button that opens the others)
//   ♿  Accessibility   — showAccessibility
//   💬  Ask page        — showRag          (engine="rust": Rust RAG finds the
//                                           passages, then the model answers)
//   🤖  Agent           — showAgent
//   ⚡  Vibe Coder      — showVibeCoder
//
// Older usage still works exactly as before (♿ always, ⚡ with showAgent):
//   <YuktAIWrapper position="left" showRag={true} showAgent={true}>
// That legacy mode applies when none of showAccessibility, showVibeCoder or
// launcher is set.
// ─────────────────────────────────────────────────────────────────────────────

"use client"

import React, {
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"

import { wcagPlugin, type A11yConfig, type A11yReport } from "../core/renderer"
import { WidgetPanel, type WidgetSettings, DEFAULT_SETTINGS } from "./WidgetPanel"
import {
  isTransformersSupported,
  getModelLoadStatus,
} from "../core/ai/transformers-rag"
import CodeGenPanel from "./CodeGenPanel"
import { createContextIndex } from "../agentic/contextIndex"
import { formatSearchTime, type GridEngine } from "../grid/rust/engine"
// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
export interface YuktAIWrapperProps {
  position?:   "left" | "right"
  children:    ReactNode
  config?:     Partial<A11yConfig>
  showRag?:    boolean   // show 💬 RAG button   — default false
  showAgent?:  boolean   // show 🤖 Agent button — default false
  /** v5.3.9 — show ♿ Accessibility. Setting this (or showVibeCoder/launcher) switches every button to opt-in. */
  showAccessibility?: boolean
  /** v5.3.9 — show ⚡ Vibe Coder (a developer tool; in legacy mode it follows showAgent). */
  showVibeCoder?: boolean
  /** v5.3.9 — one ✨ button that shows/hides the others; remembers the choice; Esc closes. */
  launcher?: boolean
  /**
   * v5.3.9 — 💬 Ask page finds passages first with the page RAG ("rust",
   * "auto" or "ts"), shows them at once, then lets Gemini Nano /
   * Transformers.js write the answer from only those passages.
   * Not set: 💬 works exactly as before.
   */
  engine?: GridEngine
}

const LAUNCHER_KEY = "yuktai-tools-open"

// ─────────────────────────────────────────────────────────────────────────────
// detectAISupport
// ─────────────────────────────────────────────────────────────────────────────
async function detectAISupport(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any

    if (w.LanguageModel) {
      try {
        if (typeof w.LanguageModel.availability === "function") {
          const s = await w.LanguageModel.availability()
          if (s === "readily" || s === "available" || s === "downloadable") return true
        } else return true
      } catch { /* continue */ }
    }
    if (w.Summarizer) {
      try { const s = await w.Summarizer.availability?.(); if (!s || s === "readily" || s === "available") return true } catch { /* continue */ }
    }
    if (w.Rewriter) {
      try { const s = await w.Rewriter.availability?.(); if (!s || s === "readily" || s === "available") return true } catch { /* continue */ }
    }
    if (w.Writer) {
      try { const s = await w.Writer.availability?.(); if (!s || s === "readily" || s === "available") return true } catch { /* continue */ }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ai = w.ai || (globalThis as any).ai
    if (ai) {
      if (ai.languageModel?.availability) {
        try { const s = await ai.languageModel.availability(); if (s === "readily" || s === "available") return true } catch { /* continue */ }
      }
      if (ai.languageModel && typeof ai.languageModel.create === "function") return true
      if (ai.summarizer || ai.rewriter || ai.writer || ai.languageModel) return true
    }
    if (w.Translator || w.translation?.canTranslate) return true
    return false
  } catch { return false }
}

// ─────────────────────────────────────────────────────────────────────────────
// YuktAIWrapper
// ─────────────────────────────────────────────────────────────────────────────
export function YuktAIWrapper({
  position    = "left",
  children,
  config:      configOverrides = {},
  showRag    = false,
  showAgent  = false,
  showAccessibility,
  showVibeCoder,
  launcher,
  engine,
}: YuktAIWrapperProps) {

  // ── Which buttons are on ──
  // Legacy (none of the v5.3.9 props set): ♿ always, ⚡ with showAgent — as before.
  // Opt-in (any of them set): only what the developer turned on.
  const optIn   = showAccessibility !== undefined || showVibeCoder !== undefined || launcher !== undefined
  const a11yOn  = optIn ? !!showAccessibility : true
  const vibeOn  = optIn ? !!showVibeCoder : showAgent
  const ragOn   = showRag
  const agentOn = showAgent

  // ── Launcher (show/hide all buttons) ──
  const [toolsOpen, setToolsOpen] = useState(false)
  const showButtons = !launcher || toolsOpen

  // ── Accessibility panel state ──
  const [panelOpen,      setPanelOpen]      = useState(false)
  const [settings,       setSettings]       = useState<WidgetSettings>(DEFAULT_SETTINGS)
  const [report,         setReport]         = useState<A11yReport | null>(null)
  const [isActive,       setIsActive]       = useState(false)
  const [aiSupported,    setAiSupported]    = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const panelRef                            = React.useRef<HTMLDivElement>(null)

  // ── RAG state ──
  const [ragOpen,     setRagOpen]     = useState(false)
  const [ragQuestion, setRagQuestion] = useState("")
  const [ragAnswer,   setRagAnswer]   = useState("")
  const [ragLoading,  setRagLoading]  = useState(false)
  const [ragEngine,   setRagEngine]   = useState<"gemini" | "transformers" | null>(null)
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready">("idle")

  // ── Agent state ──
  const [agentOpen,    setAgentOpen]    = useState(false)
  const [agentTask,    setAgentTask]    = useState("")
  const [agentStatus,  setAgentStatus]  = useState("")
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentSteps,   setAgentSteps]   = useState<string[]>([])
  const [agentEngine,  setAgentEngine]  = useState<"gemini" | "transformers" | null>(null)

  // ── Button positions ──
  // Legacy: ♿ 24 · 💬 84 · 🤖 144 (84 without 💬) · ⚡ 204, exactly as before.
  // Opt-in: the buttons that are on, stacked from the bottom with no gaps
  // (above the ✨ launcher when there is one), in the order ♿ 💬 🤖 ⚡.
  const stack = (on: boolean[]) => {
    const out: number[] = []
    let next = launcher ? 84 : 24
    for (const o of on) {
      out.push(next)
      if (o) next += 60
    }
    return out
  }
  const [a11yBottom, ragBottom, agentBottom, codegenBottom] = optIn
    ? stack([a11yOn, ragOn, agentOn, vibeOn])
    : [24, 84, showRag ? 144 : 84, 204]
  const [codegenOpen, setCodegenOpen] = useState(false);

  // ── 💬 retrieval-first mode (engine set) ──
  const retrievalFirst = engine !== undefined
  const [ragSources, setRagSources] = useState<string[]>([])
  const [ragInfo, setRagInfo] = useState<{ ms: number; engine: "rust" | "ts"; ai: boolean } | null>(null)
  const indexRef = React.useRef<ReturnType<typeof createContextIndex> | null>(null)
  // ─────────────────────────────────────────────────────────────────────────
  // Detect RAG engine
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const hasGemini = !!(w.LanguageModel || w.ai?.languageModel)
    if (hasGemini && aiSupported) {
      setRagEngine("gemini")
      setAgentEngine("gemini")
    } else if (isTransformersSupported()) {
      setRagEngine("transformers")
      setAgentEngine("transformers")
    }
  }, [aiSupported])

  // ── Poll Transformers model status ──
  useEffect(() => {
    if (ragEngine !== "transformers") return
    const interval = setInterval(() => setModelStatus(getModelLoadStatus()), 500)
    return () => clearInterval(interval)
  }, [ragEngine])

  // ─────────────────────────────────────────────────────────────────────────
  // RAG ask handler
  // ─────────────────────────────────────────────────────────────────────────
  const cleanAnswer = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/#+\s/g, "").trim()

  // engine set: find passages first (Rust/TS page RAG), show them at once,
  // then let the model (if any) write the answer from only those passages.
  const handleRagAskRetrieval = useCallback(async () => {
    const question = ragQuestion.trim()
    if (!question || ragLoading) return
    setRagLoading(true)
    setRagAnswer("")
    setRagSources([])
    setRagInfo(null)
    try {
      if (!indexRef.current) indexRef.current = createContextIndex({ engine })
      else indexRef.current.rebuild()
      await indexRef.current.whenEngineReady()
      const t0 = performance.now()
      const found = await indexRef.current.ask(question, { k: 4 })
      const ms = performance.now() - t0
      setRagAnswer(found.answer)
      setRagSources(found.hits.slice(0, 3).map((h) => (h.text.length > 160 ? `${h.text.slice(0, 157)}…` : h.text)))
      setRagInfo({ ms, engine: indexRef.current.engine, ai: false })

      if (found.hits.length && ragEngine) {
        const context = found.hits.map((h) => h.text).join("\n")
        let result
        if (ragEngine === "gemini") {
          const { askWithContext } = await import("../core/ai/rag")
          result = await askWithContext(question, context)
        } else {
          setModelStatus("loading")
          const { answerFromContext } = await import("../core/ai/transformers-rag")
          result = await answerFromContext(question, context)
          setModelStatus(getModelLoadStatus()) // "ready" only if the model really loaded
        }
        if (result.success && result.answer) {
          setRagAnswer(cleanAnswer(result.answer))
          setRagInfo((info) => (info ? { ...info, ai: true } : info))
        }
      }
    } catch {
      setRagAnswer((a) => a || "⚠️ Something went wrong.")
    }
    setRagLoading(false)
  }, [ragQuestion, ragLoading, ragEngine, engine])

  const handleRagAsk = useCallback(async () => {
    if (retrievalFirst) return handleRagAskRetrieval()
    if (!ragQuestion.trim() || ragLoading) return
    if (!ragEngine) { setRagAnswer("⚠️ No AI engine available."); return }

    setRagLoading(true)
    setRagAnswer("")

    try {
      let result
      if (ragEngine === "gemini") {
        const { askPage } = await import("../core/ai/rag")
        result = await askPage(ragQuestion)
      } else {
        setModelStatus("loading")
        const { askPageWithTransformers } = await import("../core/ai/transformers-rag")
        result = await askPageWithTransformers(ragQuestion)
        setModelStatus("ready")
      }
      setRagAnswer(
        result.success && result.answer
          ? result.answer.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/#+\s/g, "").trim()
          : "⚠️ " + (result.error || "No answer found.")
      )
    } catch { setRagAnswer("⚠️ Something went wrong.") }
    setRagLoading(false)
  }, [ragQuestion, ragLoading, ragEngine, retrievalFirst, handleRagAskRetrieval])

  // ─────────────────────────────────────────────────────────────────────────
  // Agent handler — reads page, guides user through task
  // ─────────────────────────────────────────────────────────────────────────
 const handleAgentRun = useCallback(async () => {
  if (!agentTask.trim() || agentLoading) return
  if (!agentEngine) { setAgentStatus("⚠️ No AI engine available."); return }

  setAgentLoading(true)
  setAgentSteps([])
  setAgentStatus("")

  const { runAgent } = await import("../core/ai/agent")
  await runAgent(agentTask, agentEngine, step => {
    setAgentSteps(prev => [...prev, step.text])
  })

  setAgentLoading(false)
  setAgentStatus("done")
}, [agentTask, agentLoading, agentEngine])

  // ─────────────────────────────────────────────────────────────────────────
  // Detect AI + voice on mount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return
    const run = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      const supported = await detectAISupport()
      setAiSupported(supported)
      setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition))
    }
    const timer = setTimeout(run, 800)
    return () => clearTimeout(timer)
  }, [])

  // ── Load saved preferences ──
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem("yuktai-a11y-prefs")
      if (saved) setSettings(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch { /* ignore */ }
  }, [])

  // ── Engine ──
  const runEngine = useCallback(async (current: WidgetSettings) => {
    const config: A11yConfig = {
      enabled: true, highContrast: current.highContrast, darkMode: current.darkMode,
      reduceMotion: current.reduceMotion, largeTargets: current.largeTargets,
      speechEnabled: current.speechEnabled, autoFix: current.autoFix,
      dyslexiaFont: current.dyslexiaFont, localFont: current.localFont,
      fontSizeMultiplier: current.fontScale / 100, colorBlindMode: current.colorBlindMode,
      showAuditBadge: current.showAuditBadge, showSkipLinks: true, showPreferencePanel: false,
      plainEnglish: current.plainEnglish, summarisePage: current.summarisePage,
      translateLanguage: current.translateLanguage, voiceControl: current.voiceControl,
      smartLabels: current.smartLabels, ...configOverrides,
    }
    await wcagPlugin.execute(config)
    setReport(wcagPlugin.applyFixes(config))
    setIsActive(true)
  }, [configOverrides])

  const handleApply = useCallback(async () => {
    try { localStorage.setItem("yuktai-a11y-prefs", JSON.stringify(settings)) } catch { /* ignore */ }
    await runEngine(settings)
    setPanelOpen(false)
  }, [settings, runEngine])

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    try { localStorage.removeItem("yuktai-a11y-prefs") } catch { /* ignore */ }
    const root = document.documentElement
    ;["data-yuktai-high-contrast","data-yuktai-dark","data-yuktai-reduce-motion","data-yuktai-large-targets","data-yuktai-keyboard","data-yuktai-dyslexia"].forEach(a => root.removeAttribute(a))
    document.body.style.filter = ""
    document.body.style.fontFamily = ""
    document.documentElement.style.fontSize = ""
    setReport(null); setIsActive(false)
  }, [])

  const handleSet = useCallback(<K extends keyof WidgetSettings>(key: K, val: WidgetSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: val }))
  }, [])

  // Escape closes the open panel; with nothing open, it closes the launcher
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (panelOpen || ragOpen || agentOpen || codegenOpen) {
        setPanelOpen(false)
        setRagOpen(false)
        setAgentOpen(false)
        setCodegenOpen(false)
      } else if (launcher && toolsOpen) {
        setToolsOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [panelOpen, ragOpen, agentOpen, codegenOpen, launcher, toolsOpen])

  // ── Launcher: remember open/closed, expose it for styling ──
  useEffect(() => {
    if (!launcher) return
    try {
      if (localStorage.getItem(LAUNCHER_KEY) === "1") setToolsOpen(true)
    } catch { /* storage blocked: start closed */ }
  }, [launcher])

  useEffect(() => {
    if (!launcher || typeof document === "undefined") return
    document.documentElement.setAttribute("data-yuktai-tools", toolsOpen ? "open" : "closed")
    try { localStorage.setItem(LAUNCHER_KEY, toolsOpen ? "1" : "0") } catch { /* ignore */ }
  }, [launcher, toolsOpen])

  const toggleTools = useCallback(() => {
    setToolsOpen((open) => {
      if (open) {
        setPanelOpen(false)
        setRagOpen(false)
        setAgentOpen(false)
        setCodegenOpen(false)
      }
      return !open
    })
  }, [])

  useEffect(() => {
    if (panelOpen && panelRef.current) wcagPlugin.trapFocus(panelRef.current)
  }, [panelOpen])

  // ── Shared FAB base style ──
  const fabBase = (bottom: number, bg: string, active: boolean): React.CSSProperties => ({
    position:       "fixed",
    bottom:         `${bottom}px`,
    [position]:     "24px",
    zIndex:         9998,
    width:          "52px",
    height:         "52px",
    borderRadius:   "50%",
    background:     active ? bg : bg,
    color:          "#fff",
    border:         "none",
    cursor:         "pointer",
    fontSize:       "22px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    boxShadow:      "0 4px 16px rgba(0,0,0,0.25)",
    transition:     "transform 0.15s, background 0.2s",
  })

  const hover = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"
  }
  const unhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"
  }

  // ── RAG subtitle ──
  const modelSubtitle = ragEngine === "gemini"
    ? "Gemini Nano · On device"
    : ragEngine === "transformers"
    ? "Transformers.js · All devices"
    : "Detecting..."
  const ragSubtitle = retrievalFirst
    ? `${engine === "ts" ? "Page search" : "Rust page search"}${ragEngine === "gemini" ? " + Gemini Nano" : ragEngine === "transformers" ? " + Transformers.js" : " · On device"}`
    : modelSubtitle
  const canAsk = retrievalFirst || !!ragEngine

  const ragLoadingMsg = ragEngine === "transformers" && modelStatus === "loading"
    ? "Loading model..."
    : "..."

  return (
    <>
      {children}

      {/* ✨ LAUNCHER — shows/hides the other buttons */}
      {launcher && (
        <button
          type="button"
          style={fabBase(24, toolsOpen ? "#134e4a" : "#0f766e", toolsOpen)}
          aria-expanded={toolsOpen}
          aria-label={toolsOpen ? "Hide yuktai tools" : "Show yuktai tools"}
          title={toolsOpen ? "Hide yuktai tools" : "yuktai tools"}
          data-yuktai-launcher="true"
          onClick={toggleTools}
          onMouseEnter={hover}
          onMouseLeave={unhover}
        >
          {toolsOpen ? (
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
              <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
            </svg>
          )}
        </button>
      )}

{/* ⚡ VIBE CODER BUTTON */}
{vibeOn && showButtons && (
  <button
    style={fabBase(codegenBottom, codegenOpen ? "#d97706" : "#f59e0b", codegenOpen)}
    aria-label="Open Vibe Coder"
    title="⚡ Vibe Coder — Generate Next.js project"
    onClick={() => { setCodegenOpen(p => !p); setAgentOpen(false); setRagOpen(false); setPanelOpen(false) }}
    onMouseEnter={hover}
    onMouseLeave={unhover}
  >
    ⚡
  </button>
)}

{/* ⚡ VIBE CODER PANEL */}
{vibeOn && showButtons && codegenOpen && (
  <CodeGenPanel
    position={position}
    onClose={() => setCodegenOpen(false)}
  />
)}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 🤖 AGENT FLOATING BUTTON                                        */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {agentOn && showButtons && (
        <button
          style={fabBase(agentBottom, agentOpen ? "#059669" : "#10b981", agentOpen)}
          aria-label="Open AI agent"
          aria-haspopup="dialog"
          aria-expanded={agentOpen}
          title="🤖 AI Agent — guide me through this page"
          onClick={() => { setAgentOpen(p => !p); setRagOpen(false); setPanelOpen(false) }}
          onMouseEnter={hover}
          onMouseLeave={unhover}
        >
          🤖
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 🤖 AGENT PANEL                                                  */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {agentOn && showButtons && agentOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="yuktai AI Agent"
          data-yuktai-panel="true"
          style={{
            position:     "fixed",
            bottom:       `${agentBottom + 64}px`,
            [position]:   "24px",
            zIndex:       9999,
            width:        "300px",
            maxWidth:     "calc(100vw - 48px)",
            background:   "#fff",
            border:       "1px solid #e2e8f0",
            borderRadius: "16px",
            boxShadow:    "0 8px 32px rgba(0,0,0,0.12)",
            fontFamily:   "system-ui,-apple-system,sans-serif",
            padding:      "14px",
            maxHeight:    "70vh",
            overflowY:    "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>🤖 AI Agent</p>
              <p style={{ margin: 0, fontSize: "10px", color: "#10b981" }}>
                {agentEngine === "gemini" ? "Gemini Nano · On device" : agentEngine === "transformers" ? "Transformers.js · All devices" : "Detecting..."}
              </p>
            </div>
            <button onClick={() => setAgentOpen(false)} aria-label="Close agent panel"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "18px", lineHeight: 1, padding: "2px" }}>
              ×
            </button>
          </div>

          {/* What can I help with */}
          <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#64748b" }}>
            Tell me what you want to do on this page. I will guide you step by step.
          </p>

          {/* Example tasks */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
            {["Fill this form", "Find contact info", "What is this page?", "Guide me to apply"].map(eg => (
              <button key={eg} onClick={() => setAgentTask(eg)}
                style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer" }}>
                {eg}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            <input
              type="text"
              value={agentTask}
              onChange={e => setAgentTask(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAgentRun() }}
              placeholder="e.g. Help me fill this form"
              disabled={agentLoading || !agentEngine}
              aria-label="Tell the agent what to do"
              style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#0f172a", background: agentEngine ? "#fff" : "#f8fafc", outline: "none", height: "36px" }}
            />
            <button
              onClick={handleAgentRun}
              disabled={agentLoading || !agentTask.trim() || !agentEngine}
              aria-label="Run agent"
              style={{
                padding:      "8px 12px",
                borderRadius: "8px",
                border:       "none",
                background:   agentEngine && agentTask.trim() && !agentLoading ? "#10b981" : "#e2e8f0",
                color:        agentEngine && agentTask.trim() && !agentLoading ? "#fff" : "#94a3b8",
                fontSize:     "12px",
                fontWeight:   600,
                cursor:       agentEngine && agentTask.trim() && !agentLoading ? "pointer" : "not-allowed",
                height:       "36px",
                minWidth:     "52px",
                transition:   "background 0.2s",
              }}
            >
              {agentLoading ? "..." : "Go"}
            </button>
          </div>

          {/* Steps output */}
          {agentSteps.length > 0 && (
            <div style={{ padding: "10px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "11px", color: "#166534", lineHeight: 1.7 }}>
              {agentSteps.map((step, i) => (
                <p key={i} style={{ margin: "0 0 2px" }}>{step}</p>
              ))}
              {agentStatus === "done" && (
                <button
                  onClick={() => { setAgentSteps([]); setAgentTask(""); setAgentStatus("") }}
                  style={{ display: "block", marginTop: "6px", background: "none", border: "none", color: "#94a3b8", fontSize: "10px", cursor: "pointer", padding: 0 }}>
                  Clear
                </button>
              )}
            </div>
          )}

          {!agentEngine && (
            <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#94a3b8" }}>
              Enable Gemini Nano via chrome://flags for best results.
            </p>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 💬 RAG FLOATING BUTTON                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {ragOn && showButtons && (
        <button
          style={fabBase(ragBottom, ragOpen ? "#7c3aed" : "#6d28d9", ragOpen)}
          aria-label="Ask a question about this page"
          aria-haspopup="dialog"
          aria-expanded={ragOpen}
          title={`💬 Ask this page · ${ragSubtitle}`}
          onClick={() => { setRagOpen(p => !p); setPanelOpen(false); setAgentOpen(false) }}
          onMouseEnter={hover}
          onMouseLeave={unhover}
        >
          💬
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 💬 RAG PANEL                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {ragOn && showButtons && ragOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ask this page"
          data-yuktai-panel="true"
          style={{
            position:     "fixed",
            bottom:       `${ragBottom + 64}px`,
            [position]:   "24px",
            zIndex:       9999,
            width:        "300px",
            maxWidth:     "calc(100vw - 48px)",
            background:   "#fff",
            border:       "1px solid #e2e8f0",
            borderRadius: "16px",
            boxShadow:    "0 8px 32px rgba(0,0,0,0.12)",
            fontFamily:   "system-ui,-apple-system,sans-serif",
            padding:      "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>💬 Ask this page</p>
              <p style={{ margin: 0, fontSize: "10px", color: "#7c3aed" }}>{ragSubtitle}</p>
              {ragEngine === "transformers" && modelStatus === "loading" && (
                <p style={{ margin: "2px 0 0", fontSize: "9px", color: "#94a3b8" }}>Downloading model — first time only</p>
              )}
              {ragEngine === "transformers" && modelStatus === "ready" && (
                <p style={{ margin: "2px 0 0", fontSize: "9px", color: "#10b981" }}>Model ready ✅ — works offline</p>
              )}
            </div>
            <button onClick={() => setRagOpen(false)} aria-label="Close ask panel"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "18px", lineHeight: 1, padding: "2px" }}>
              ×
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            <input
              type="text"
              value={ragQuestion}
              onChange={e => setRagQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleRagAsk() }}
              placeholder="e.g. What does this page do?"
              disabled={ragLoading || !canAsk}
              aria-label="Ask a question about this page"
              style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#0f172a", background: canAsk ? "#fff" : "#f8fafc", outline: "none", height: "36px" }}
            />
            <button
              onClick={handleRagAsk}
              disabled={ragLoading || !ragQuestion.trim() || !canAsk}
              aria-label="Submit question"
              style={{
                padding: "8px 12px", borderRadius: "8px", border: "none",
                background: canAsk && ragQuestion.trim() && !ragLoading ? "#7c3aed" : "#e2e8f0",
                color: canAsk && ragQuestion.trim() && !ragLoading ? "#fff" : "#94a3b8",
                fontSize: "12px", fontWeight: 600,
                cursor: canAsk && ragQuestion.trim() && !ragLoading ? "pointer" : "not-allowed",
                height: "36px", minWidth: "48px", transition: "background 0.2s",
              }}
            >
              {ragLoading ? ragLoadingMsg : "Ask"}
            </button>
          </div>

          {ragAnswer && (
            <div aria-live="polite" style={{ padding: "10px", background: "#f5f3ff", borderRadius: "8px", fontSize: "12px", color: "#4c1d95", lineHeight: 1.6, maxHeight: retrievalFirst ? "260px" : "180px", overflowY: "auto", whiteSpace: "pre-line" }}>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "11px", color: "#7c3aed" }}>💬 Answer</strong>
              {ragAnswer}
              {ragSources.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <strong style={{ display: "block", fontSize: "10px", color: "#6d28d9" }}>From this page</strong>
                  <ul style={{ margin: "4px 0 0", paddingLeft: "16px", fontSize: "11px", color: "#5b21b6" }}>
                    {ragSources.map((src, i) => <li key={i} style={{ marginBottom: "2px" }}>{src}</li>)}
                  </ul>
                </div>
              )}
              {ragInfo && (
                <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#6d28d9" }}>
                  ⚡ Found in {formatSearchTime(ragInfo.ms)} · {ragInfo.engine === "rust" ? "Rust" : "TS"} · on device{ragInfo.ai ? " · answer written by AI" : ""}
                </p>
              )}
              <button onClick={() => { setRagAnswer(""); setRagQuestion(""); setRagSources([]); setRagInfo(null) }}
                style={{ display: "block", marginTop: "6px", background: "none", border: "none", color: "#94a3b8", fontSize: "10px", cursor: "pointer", padding: 0 }}>
                Clear
              </button>
            </div>
          )}
          {!canAsk && <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#94a3b8" }}>Detecting AI engine...</p>}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* ♿ ACCESSIBILITY FLOATING BUTTON                                 */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {a11yOn && showButtons && (
      <button
        style={fabBase(a11yBottom, isActive ? "#0d9488" : "#1a73e8", panelOpen)}
        aria-label="Open accessibility preferences"
        aria-haspopup="dialog"
        aria-expanded={panelOpen}
        data-yuktai-pref-toggle="true"
        title="♿ Accessibility settings"
        onClick={() => { setPanelOpen(p => !p); setRagOpen(false); setAgentOpen(false) }}
        onMouseEnter={hover}
        onMouseLeave={unhover}
      >
        ♿
      </button>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* ♿ ACCESSIBILITY PANEL                                           */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {a11yOn && showButtons && panelOpen && (
        <WidgetPanel
          ref={panelRef}
          position={position}
          settings={settings}
          report={report}
          isActive={isActive}
          aiSupported={aiSupported}
          voiceSupported={voiceSupported}
          set={handleSet}
          onApply={handleApply}
          onReset={handleReset}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </>
  )
}