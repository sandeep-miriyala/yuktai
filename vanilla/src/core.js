// yuktai vanilla — core logic.
//
// Everything here is the SAME code that the npm package (React / Next.js)
// uses. It is bundled from ../../src, so the vanilla build never drifts from
// the package: same parser, same answers, same WCAG checks.
//
// Only React components and hooks are left out. Their vanilla versions live in
// ./agent.js (hooks) and ./ui.js (components).

export {
  // 1  Smart grid queries
  parseAmount,
  parseGridQuery,
  executeGridQuery,
  runGridQuery,
  answerGridQuestion,
  findMentionedColumn,
  // 4  Anomalies and summaries
  detectAnomalies,
  summarizeRows,
} from "../../src/agentic/gridQuery"

// 2  BI copilot
export { askInsight, groupBy, comparePeriods, trend, aggregate } from "../../src/agentic/insights"

// 3  Task runner
export { planTasks, runTasks } from "../../src/agentic/taskRunner"

// 5  QA tester
export { runQaAudit, auditToMarkdown, auditToJSON, AUDIT_RULES } from "../../src/agentic/qaAudit"

// 6  Accessibility copilot
export { createA11yCopilot } from "../../src/agentic/a11yCopilot"

// 7  Page understanding
export { askAboutPage, analyzePage, detectPageIntent } from "../../src/agentic/pageInsights"

// 7.6 Page + data RAG
export { createContextIndex, tokenize, pagePassages, gridPassages } from "../../src/agentic/contextIndex"

// 8  Form review
export { reviewForms, reviewForm, readFormFields } from "../../src/agentic/formReview"

// 9  Design review
export { reviewDesign } from "../../src/agentic/designReview"

// 10 Voice commands
export {
  parseVoiceA11yCommand,
  createVoiceA11yController,
  moveGridRowFocus,
  DEFAULT_A11Y_SETTINGS,
  FONT_MIN,
  FONT_MAX,
  FONT_STEP,
} from "../../src/agentic/voiceA11yCommands"

// Colour helpers
export { contrastRatio, parseColor, relativeLuminance, accessibleName } from "../../src/agentic/dom"

// Grid tools (the 11 tools shared by the assistant and WebMCP)
export {
  createGridTools,
  getRowId,
  applyGridFilters,
  toGridToolColumns,
  searchGrid,
  countGrid,
  getColumns,
  getRow,
  highlightRows,
  selectRow,
  openRow,
  filterGrid,
  clearFilters,
  sortGrid,
  clearSort,
} from "../../src/grid/gridTools"

// Accessibility engine
export { wcagPlugin } from "../../src/core/renderer"
