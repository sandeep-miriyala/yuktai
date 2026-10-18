// ─────────────────────────────────────────────────────────────────────────────
// yuktai/agentic — Agentic AI features (v5.1)
//   1  Accessibility Copilot        → createA11yCopilot
//   2  Page Understanding Agent     → analyzePage, askAboutPage
//   3  Smart Data Grid Agent        → parseGridQuery, runGridQuery, detectAnomalies, summarizeRows, answerGridQuestion
//   4  Voice Accessibility          → parseVoiceA11yCommand, createVoiceA11yController, moveGridRowFocus
//   5  AI QA Tester                 → runQaAudit, auditToMarkdown, auditToJSON
//   6  Forms Agent                  → reviewForms, reviewForm, readFormFields
//   7  Page + Data RAG              → createContextIndex, tokenize
//   8  Multi-Task Automation        → planTasks, runTasks
//   9  Business Intelligence        → askInsight, groupBy, comparePeriods, trend
//   10 Design Review                → reviewDesign
//   React                           → useAgenticGrid, AgenticGridBar, AgenticPanel
// Everything runs in the browser. No API keys, no data leaves the device
// unless you pass your own `generate` / `summarize` hook.
// ─────────────────────────────────────────────────────────────────────────────

export * from "./a11yCopilot"
export * from "./pageInsights"
export * from "./gridQuery"
export * from "./voiceA11yCommands"
export * from "./qaAudit"
export * from "./formReview"
export * from "./contextIndex"
export * from "./taskRunner"
export * from "./insights"
export * from "./designReview"
export * from "./react"
export { contrastRatio, parseColor, relativeLuminance, accessibleName } from "./dom"
export type { RGBA, AuditRoot } from "./dom"
