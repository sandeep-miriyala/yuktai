// ─────────────────────────────────────────────────────────────────────────────
// React / Next.js layer for the agentic features.
//   • useAgenticGrid  — one `ask()` for grid questions, BI questions and
//                       multi-step instructions (ideas 3, 8, 9)
//   • AgenticGridBar  — ready-made input + answer UI for that hook
//   • AgenticPanel    — page tools: Copilot, QA report, Forms, Design, Ask,
//                       Voice (ideas 1, 2, 4, 5, 6, 7, 10)
// Client components only. Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react"
import { getRowId, toGridToolColumns, type GridToolContext, type GridToolFilter, type GridToolSort } from "../grid/gridTools"
import { createA11yCopilot, type A11yCopilot, type CopilotState } from "./a11yCopilot"
import { createContextIndex } from "./contextIndex"
import { reviewDesign, type DesignReview } from "./designReview"
import { reviewForms, type FormReview } from "./formReview"
import { answerGridQuestion, executeGridQuery } from "./gridQuery"
import { askInsight } from "./insights"
import { askAboutPage } from "./pageInsights"
import { auditToJSON, auditToMarkdown, runQaAudit, type AuditReport } from "./qaAudit"
import { planTasks, runTasks, type StepResult } from "./taskRunner"
import { createVoiceA11yController } from "./voiceA11yCommands"

// ── useAgenticGrid ──────────────────────────────────────────────────────────

export interface UseAgenticGridOptions<T> {
  data: T[]
  columns: Array<{ key: string; label: string; type?: string }>
  rowKey?: string
  /** "Now" for questions like "this week" (default: today). */
  referenceDate?: Date | string
  onOpenRow?: (id: string) => void
}

export type AgenticAnswerKind = "query" | "anomalies" | "summary" | "insight" | "tasks"

const BI_PATTERN = /\b(trend|over time|this (week|month|quarter|year)|last (week|month|quarter|year)|compare|versus|vs)\b|\b(by|per|each|which)\b.*\b(total|average|avg|sum|drop|increase|growth|highest|lowest|most|least)\b|\b(total|average|avg|sum)\b.*\b(by|per|each)\b/i

export function useAgenticGrid<T extends Record<string, unknown>>(options: UseAgenticGridOptions<T>) {
  const { data, rowKey = "id" } = options
  const columns = useMemo(() => toGridToolColumns(options.columns), [options.columns])
  const [filters, setFilters] = useState<GridToolFilter[]>([])
  const [sort, setSort] = useState<GridToolSort | null>(null)
  const [highlightIds, setHighlightIds] = useState<string[]>([])
  const [answer, setAnswer] = useState("")
  const [kind, setKind] = useState<AgenticAnswerKind | null>(null)
  const [table, setTable] = useState<Array<Record<string, string | number>>>([])
  const [steps, setSteps] = useState<StepResult[]>([])
  const [busy, setBusy] = useState(false)

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const context = useCallback(
    (): GridToolContext<T> => ({
      data,
      columns,
      rowKey,
      filters: filtersRef.current,
      onFiltersChange: (f) => {
        filtersRef.current = f
        setFilters(f)
      },
      onSortChange: setSort,
      onHighlightRows: setHighlightIds,
      onOpenRow: options.onOpenRow,
      onSelectRow: (id) => setHighlightIds([id]),
    }),
    [data, columns, rowKey, options.onOpenRow]
  )

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim()
      if (!q) return
      setBusy(true)
      setSteps([])
      setTable([])
      try {
        if (planTasks(q).length > 1) {
          const live: StepResult[] = []
          const result = await runTasks(q, context(), { onStep: (s) => setSteps((live.push(s), [...live])) })
          setKind("tasks")
          setAnswer(result.summary)
        } else if (BI_PATTERN.test(q)) {
          const filtered = executeGridQuery(data, columns, { filters: filtersRef.current, search: [], sort: null, limit: null, notes: [], explanation: "" })
          const insight = askInsight(q, filtered, columns, { referenceDate: options.referenceDate })
          setKind("insight")
          setAnswer(insight.answer)
          setTable(insight.table)
        } else {
          const result = answerGridQuestion(q, context())
          setKind(result.kind)
          setAnswer(result.message)
        }
      } finally {
        setBusy(false)
      }
    },
    [context, data, columns, options.referenceDate]
  )

  const reset = useCallback(() => {
    filtersRef.current = []
    setFilters([])
    setSort(null)
    setHighlightIds([])
    setAnswer("")
    setKind(null)
    setTable([])
    setSteps([])
  }, [])

  const gridData = useMemo(
    () => executeGridQuery(data, columns, { filters, search: [], sort, limit: null, notes: [], explanation: "" }),
    [data, columns, filters, sort]
  )

  return {
    /** Pass to <YuktaiGrid data={…}> */
    gridData,
    /** Pass to <YuktaiGrid highlightIds={…}> */
    highlightIds,
    filters,
    sort,
    ask,
    reset,
    answer,
    kind,
    table,
    steps,
    busy,
    visibleIds: gridData.map((r) => getRowId(r, rowKey)),
  }
}

// ── Shared bits ─────────────────────────────────────────────────────────────

const box: CSSProperties = {
  border: "1px solid color-mix(in srgb, CanvasText 20%, transparent)",
  borderRadius: 12,
  padding: 16,
  background: "Canvas",
  color: "CanvasText",
  font: "inherit",
}
const btn: CSSProperties = {
  minHeight: 44,
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid color-mix(in srgb, CanvasText 35%, transparent)",
  background: "ButtonFace",
  color: "ButtonText",
  font: "inherit",
  cursor: "pointer",
}
const input: CSSProperties = { ...btn, flex: 1, minWidth: 0, background: "Field", color: "FieldText", cursor: "text" }
const muted: CSSProperties = { opacity: 0.75, fontSize: "0.9em" }

function DataTable({ rows }: { rows: Array<Record<string, string | number>> }) {
  if (!rows.length) return null
  const headers = Object.keys(rows[0])
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid currentColor" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((r, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h} style={{ padding: "6px 8px", borderBottom: "1px solid color-mix(in srgb, CanvasText 12%, transparent)" }}>{r[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── AgenticGridBar ──────────────────────────────────────────────────────────

export function AgenticGridBar({
  grid,
  placeholder = "Ask about this data, e.g. “overdue and over ₹10,000”",
  examples = [],
  style,
}: {
  grid: ReturnType<typeof useAgenticGrid<any>>
  placeholder?: string
  examples?: string[]
  style?: CSSProperties
}) {
  const [text, setText] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    void grid.ask(text)
  }
  return (
    <section data-yuktai-panel="" aria-label="Data assistant" style={{ ...box, ...style }}>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label htmlFor="yuktai-grid-ask" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Question about the data</label>
        <input id="yuktai-grid-ask" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} style={input} />
        <button type="submit" style={btn} disabled={grid.busy}>{grid.busy ? "Working…" : "Ask"}</button>
        <button type="button" style={btn} onClick={() => { setText(""); grid.reset() }}>Reset</button>
      </form>
      {examples.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {examples.map((ex) => (
            <button key={ex} type="button" style={{ ...btn, minHeight: 36, fontSize: "0.85em" }} onClick={() => { setText(ex); void grid.ask(ex) }}>{ex}</button>
          ))}
        </div>
      )}
      <div aria-live="polite" style={{ marginTop: 12, whiteSpace: "pre-line" }}>
        {grid.answer}
      </div>
      {grid.steps.length > 0 && (
        <ol style={{ marginTop: 8, paddingLeft: 20 }}>
          {grid.steps.map((s, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              <span aria-hidden="true">{s.success ? "✅ " : "⚠️ "}</span>
              <strong>{s.text}</strong> — <span style={{ whiteSpace: "pre-line" }}>{s.message}</span>
            </li>
          ))}
        </ol>
      )}
      <DataTable rows={grid.table} />
    </section>
  )
}

// ── AgenticPanel ────────────────────────────────────────────────────────────

type Tab = "copilot" | "qa" | "forms" | "design" | "ask" | "voice"
const TABS: Array<[Tab, string]> = [
  ["copilot", "Copilot"],
  ["qa", "QA report"],
  ["forms", "Forms"],
  ["design", "Design"],
  ["ask", "Ask page"],
  ["voice", "Voice"],
]

export interface AgenticPanelProps {
  defaultTab?: Tab
  /** Speech recognition language for the Voice tab (default "en-IN"). */
  voiceLang?: string
  /** Optional model hook for Ask page, e.g. Gemini Nano or your own API. */
  generate?: (question: string, context: string) => Promise<string>
  style?: CSSProperties
}

export function AgenticPanel({ defaultTab = "copilot", voiceLang = "en-IN", generate, style }: AgenticPanelProps) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const onTabKey = (e: KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + TABS.length) % TABS.length
    setTab(TABS[next][0])
    tabRefs.current[next]?.focus()
  }

  return (
    <section data-yuktai-panel="" aria-label="yuktai agentic tools" style={{ ...box, ...style }}>
      <div role="tablist" aria-label="Tools" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {TABS.map(([id, label], i) => (
          <button
            key={id}
            ref={(el) => { tabRefs.current[i] = el }}
            role="tab"
            id={`yuktai-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`yuktai-tabpanel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => onTabKey(e, i)}
            style={{ ...btn, fontWeight: tab === id ? 700 : 400, outlineOffset: 2, borderWidth: tab === id ? 2 : 1 }}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`yuktai-tabpanel-${tab}`} aria-labelledby={`yuktai-tab-${tab}`}>
        {tab === "copilot" && <CopilotTab />}
        {tab === "qa" && <QaTab />}
        {tab === "forms" && <FormsTab />}
        {tab === "design" && <DesignTab />}
        {tab === "ask" && <AskTab generate={generate} />}
        {tab === "voice" && <VoiceTab lang={voiceLang} />}
      </div>
    </section>
  )
}

function CopilotTab() {
  const copilot = useRef<A11yCopilot | null>(null)
  const [state, setState] = useState<CopilotState | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [note, setNote] = useState("")

  useEffect(() => {
    copilot.current = createA11yCopilot({ onUpdate: setState })
    copilot.current.scan()
    return () => copilot.current?.stop()
  }, [])

  const c = copilot.current
  const issues = state?.report?.issues ?? []
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" style={btn} onClick={() => (state?.watching ? c?.stop() : c?.start())}>{state?.watching ? "Stop watching" : "Watch page live"}</button>
        <button type="button" style={btn} onClick={() => c?.scan()}>Scan now</button>
        <button type="button" style={btn} onClick={() => setNote(`${c?.applyAllFixes().filter((r) => r.applied).length ?? 0} fix(es) applied.`)}>Apply safe fixes</button>
        <button type="button" style={btn} onClick={() => setNote(`${c?.undoAll() ?? 0} change(s) undone.`)}>Undo all</button>
      </div>
      <p aria-live="polite" style={{ marginTop: 12 }}>
        {state?.report?.summary} {note}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {issues.slice(0, 40).map((issue) => (
          <li key={issue.id} style={{ borderTop: "1px solid color-mix(in srgb, CanvasText 12%, transparent)", padding: "8px 0" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ ...muted, minWidth: 70 }}>{issue.severity}</span>
              <span style={{ flex: 1 }}>{issue.message}</span>
              <button type="button" style={btn} aria-expanded={open === issue.id} onClick={() => setOpen(open === issue.id ? null : issue.id)}>Why?</button>
              {issue.autoFixable && (
                <button type="button" style={btn} onClick={() => setNote(c?.applyFix(issue.id).message ?? "")}>Fix</button>
              )}
            </div>
            {open === issue.id && <p style={{ whiteSpace: "pre-line", margin: "8px 0 0" }}>{c?.explain(issue.id)}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function QaTab() {
  const [report, setReport] = useState<AuditReport | null>(null)
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" style={btn} onClick={() => setReport(runQaAudit())}>Run QA check</button>
        {report && (
          <>
            <button type="button" style={btn} onClick={() => download("accessibility-report.md", auditToMarkdown(report), "text/markdown")}>Download .md</button>
            <button type="button" style={btn} onClick={() => download("accessibility-report.json", auditToJSON(report), "application/json")}>Download .json</button>
          </>
        )}
      </div>
      {report && (
        <>
          <p aria-live="polite" style={{ marginTop: 12 }}>
            <strong>{report.passed ? "PASS" : "FAIL"}</strong> — {report.summary}
          </p>
          <DataTable rows={report.checks.map((c) => ({ Check: c.title, Result: c.passed ? "✅ Pass" : "❌ Fail", Issues: c.issueCount }))} />
        </>
      )}
    </div>
  )
}

function FormsTab() {
  const [reviews, setReviews] = useState<FormReview[] | null>(null)
  return (
    <div>
      <button type="button" style={btn} onClick={() => setReviews(reviewForms())}>Review forms</button>
      <div aria-live="polite">
        {reviews && reviews.length === 0 && <p>No forms on this page.</p>}
        {reviews?.map((r) => (
          <div key={r.selector} style={{ marginTop: 12 }}>
            <p><strong>{r.summary}</strong></p>
            <ul>
              {r.findings.map((f, i) => (
                <li key={i}>{f.level === "problem" ? "Problem: " : "Suggestion: "}{f.message} <span style={muted}>{f.suggestion}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesignTab() {
  const [review, setReview] = useState<DesignReview | null>(null)
  return (
    <div>
      <button type="button" style={btn} onClick={() => setReview(reviewDesign())}>Review design</button>
      {review && (
        <div aria-live="polite">
          <p style={{ marginTop: 12 }}><strong>{review.summary}</strong></p>
          <DataTable rows={Object.entries(review.categories).map(([k, v]) => ({ Area: k, Score: v.score, Findings: v.findings }))} />
          <ul>
            {review.findings.map((f, i) => (
              <li key={i}>[{f.severity}] {f.message} <span style={muted}>{f.suggestion}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AskTab({ generate }: { generate?: AgenticPanelProps["generate"] }) {
  const [q, setQ] = useState("")
  const [answer, setAnswer] = useState("")
  const [extra, setExtra] = useState<string[]>([])
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    const page = await askAboutPage(q)
    if (page.intent !== "unknown" && page.intent !== "purpose") {
      setAnswer(page.answer)
      setExtra(page.suggestions)
      return
    }
    const rag = await createContextIndex().ask(q, { generate })
    setAnswer(page.intent === "purpose" && !rag.hits.length ? page.answer : rag.hits.length ? rag.answer : page.answer)
    setExtra(page.suggestions)
  }
  return (
    <div>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label htmlFor="yuktai-page-ask" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Question about this page</label>
        <input id="yuktai-page-ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder="What does this page do? Which fields are missing labels?" style={input} />
        <button type="submit" style={btn}>Ask</button>
      </form>
      <p aria-live="polite" style={{ whiteSpace: "pre-line", marginTop: 12 }}>{answer}</p>
      {extra.length > 0 && <ul>{extra.map((s, i) => <li key={i}>{s}</li>)}</ul>}
    </div>
  )
}

function VoiceTab({ lang }: { lang: string }) {
  const controller = useMemo(() => createVoiceA11yController({ lang, onTranscript: (t, c) => setHeard(`“${t}” → ${c ? c.say : "not a command"}`) }), [lang])
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState("")
  const [typed, setTyped] = useState("")
  useEffect(() => () => controller.stop(), [controller])

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          style={btn}
          aria-pressed={listening}
          onClick={() => {
            if (listening) {
              controller.stop()
              setListening(false)
            } else setListening(controller.start())
          }}
        >
          {listening ? "Stop listening" : "Start voice commands"}
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void controller.handle(typed)
          setTyped("")
        }}
        style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
      >
        <label htmlFor="yuktai-voice-typed" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Type a command</label>
        <input id="yuktai-voice-typed" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Or type: turn on high contrast" style={input} />
        <button type="submit" style={btn}>Run</button>
      </form>
      <p aria-live="polite" style={{ marginTop: 12 }}>{heard}</p>
      <p style={muted}>Try: “turn on high contrast”, “bigger text”, “dark mode off”, “next row”, “పెద్ద అక్షరాలు”, “reset settings”.</p>
    </div>
  )
}
