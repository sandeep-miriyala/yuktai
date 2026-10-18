// ─────────────────────────────────────────────────────────────────────────────
// Idea 8 — Multi-Task UI Automation Agent
// "Show overdue accounts, highlight the ones over 1 lakh, sort by balance
// and summarise what changed" → a plan of steps, each executed through the
// existing grid tools, ending with a before/after report.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import {
  getRowId,
  highlightRows,
  openRow,
  selectRow,
  type GridToolColumn,
  type GridToolContext,
  type GridToolFilter,
  type GridToolSort,
} from "../grid/gridTools"
import { detectAnomalies, executeGridQuery, findMentionedColumn, parseGridQuery, summarizeRows } from "./gridQuery"

export type TaskAction = "filter" | "highlight" | "sort" | "clear" | "count" | "summarize" | "anomalies" | "open" | "select"

export interface PlannedStep {
  action: TaskAction
  /** The part of the instruction this step came from. */
  text: string
}

export interface StepResult extends PlannedStep {
  success: boolean
  message: string
  ids?: string[]
}

export interface TaskRunResult {
  steps: StepResult[]
  before: { rows: number; filters: GridToolFilter[] }
  after: { rows: number; filters: GridToolFilter[]; sort: GridToolSort | null; highlighted: string[] }
  /** "What changed", in plain English. */
  summary: string
}

const VERBS = "highlight|mark|flag|sort|order|rank|arrange|summari[sz]e|summary|recap|count|how many|open|select|pick|show|filter|find|list|clear|reset|remove|detect|spot|tell"

/** Splits an instruction into ordered steps. No model needed. */
export function planTasks(instruction: string): PlannedStep[] {
  const strong = instruction
    .replace(/[?!]/g, " ")
    .split(/\s*(?:;|\.(?!\d)\s*|,?\s*\band then\b|,?\s*\bthen\b|,?\s*\bafter that\b|,?\s*\bfinally\b|,?\s*\bnext\b|ఆ తర్వాత)\s*/i)
  const parts = strong.flatMap((segment) => segment.split(new RegExp(`\\s*(?:,|\\band\\b)\\s+(?=(?:${VERBS})\\b)`, "i")))
  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 1)
    .map((text) => ({ action: classify(text), text }))
}

function classify(text: string): TaskAction {
  const t = text.toLowerCase()
  if (/^(clear|reset|remove)\b/.test(t)) return "clear"
  if (/unusual|anomal|outlier|suspicious|odd ones|duplicate/.test(t)) return "anomalies"
  if (/summari[sz]e|summary|what changed|recap|overview/.test(t)) return "summarize"
  if (/^(highlight|mark|flag)\b/.test(t)) return "highlight"
  if (/^(sort|order|rank|arrange)\b/.test(t)) return "sort"
  if (/^(count|how many)\b/.test(t)) return "count"
  if (/^(open|go to)\b/.test(t) && !/filtered|results?/.test(t)) return "open"
  if (/^(select|pick)\b/.test(t)) return "select"
  return "filter"
}

/** Removes the leading verb and filler so only the conditions remain. */
function conditionText(text: string): string {
  return text
    .replace(new RegExp(`^\\s*(?:${VERBS}|open|go to)\\b`, "i"), " ")
    .replace(/\b(the|filtered|results?|rows?|records?|entries|items?|ones|them|those|only|me|all)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function describeFilter(f: GridToolFilter, columns: GridToolColumn[]): string {
  const label = columns.find((c) => c.key === f.key)?.label ?? f.key
  const v = Array.isArray(f.value) ? `${f.value[0]}–${f.value[1]}` : typeof f.value === "number" ? f.value.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : `"${f.value}"`
  const op = { contains: "contains", equals: "is", startsWith: "starts with", endsWith: "ends with", greaterThan: ">", lessThan: "<", between: "between" }[f.operator]
  return `${label} ${op} ${v}`
}

export interface RunTasksOptions {
  /** Called after each step, so the UI can show progress. */
  onStep?: (result: StepResult, index: number, total: number) => void
}

export async function runTasks<T extends Record<string, unknown>>(
  instruction: string,
  context: GridToolContext<T>,
  options: RunTasksOptions = {}
): Promise<TaskRunResult> {
  const plan = planTasks(instruction)
  const { columns, data } = context
  let filters: GridToolFilter[] = [...(context.filters ?? [])]
  let search: string[] = []
  let sort: GridToolSort | null = null
  let highlighted: string[] = []

  const visible = () => executeGridQuery(data, columns, { filters, search, sort, limit: null, notes: [], explanation: "" })
  const before = { rows: visible().length, filters: [...filters] }
  const results: StepResult[] = []
  const ctx = (): GridToolContext<T> => ({ ...context, filters })

  for (let i = 0; i < plan.length; i++) {
    const step = plan[i]
    const cond = conditionText(step.text)
    let result: StepResult

    try {
      switch (step.action) {
        case "clear": {
          filters = []
          search = []
          sort = null
          highlighted = []
          context.onFiltersChange?.([])
          context.onSortChange?.(null)
          context.onHighlightRows?.([])
          result = { ...step, success: true, message: `Cleared filters, sorting and highlights. ${data.length} row(s) shown.` }
          break
        }
        case "filter": {
          const parsed = parseGridQuery(cond, columns, { data })
          if (!parsed.filters.length && !parsed.search.length && !parsed.sort) {
            result = { ...step, success: true, message: `Showing ${visible().length} row(s) with the current filters.` }
            break
          }
          for (const f of parsed.filters) filters = [...filters.filter((x) => x.key !== f.key), f]
          search = [...search, ...parsed.search]
          if (parsed.sort) {
            sort = parsed.sort
            context.onSortChange?.(sort)
          }
          context.onFiltersChange?.(filters)
          const rows = visible()
          const ids = rows.map((r) => getRowId(r, context.rowKey)).filter(Boolean)
          if (parsed.search.length && ids.length) {
            highlighted = ids
            context.onHighlightRows?.(ids)
          }
          result = { ...step, success: true, message: `${rows.length} row(s) now shown. ${parsed.explanation}`, ids }
          break
        }
        case "highlight": {
          const pool = visible()
          const parsed = parseGridQuery(cond, columns, { data: pool })
          const rows = parsed.filters.length || parsed.search.length ? executeGridQuery(pool, columns, { ...parsed, sort: null, limit: parsed.limit }) : pool
          const ids = rows.map((r) => getRowId(r, context.rowKey)).filter(Boolean)
          if (!ids.length) {
            result = { ...step, success: false, message: `Nothing to highlight for "${cond || "all rows"}".` }
            break
          }
          const r = highlightRows(ctx(), ids)
          if (r.success) highlighted = r.data ?? ids
          result = { ...step, success: r.success, message: r.success ? `Highlighted ${highlighted.length} row(s)${cond ? ` matching "${cond}"` : ""}.` : r.message, ids: highlighted }
          break
        }
        case "sort": {
          const parsed = parseGridQuery(step.text, columns, { data })
          let next = parsed.sort
          if (!next) {
            const column = findMentionedColumn(cond, columns)
            if (column) next = { key: column.key, direction: /desc|high|large|big|most|newest|latest|z.?to.?a/i.test(step.text) ? "desc" : "asc" }
          }
          if (!next) {
            result = { ...step, success: false, message: `Which column should I sort by? Columns: ${columns.map((c) => c.label).join(", ")}.` }
            break
          }
          sort = next
          context.onSortChange?.(sort)
          const label = columns.find((c) => c.key === sort!.key)?.label ?? sort.key
          result = { ...step, success: true, message: `Sorted by ${label} (${sort.direction === "desc" ? "high → low" : "low → high"}).` }
          break
        }
        case "count": {
          result = { ...step, success: true, message: `${visible().length} row(s) shown${highlighted.length ? `, ${highlighted.length} highlighted` : ""}.` }
          break
        }
        case "anomalies": {
          const pool = visible()
          const found = detectAnomalies(pool, columns, { rowKey: context.rowKey })
          const ids = Array.from(new Set(found.map((a) => a.rowId)))
          if (ids.length) {
            const r = highlightRows(ctx(), ids)
            if (r.success) highlighted = r.data ?? ids
          }
          result = {
            ...step,
            success: true,
            message: found.length ? `${ids.length} unusual row(s): ${found.slice(0, 5).map((a) => a.reason).join(" ")}` : "Nothing unusual in the shown rows.",
            ids,
          }
          break
        }
        case "open":
        case "select": {
          const pool = visible()
          const byId = pool.find((r) => cond && getRowId(r, context.rowKey).toLowerCase() === cond.toLowerCase())
          const target = byId ?? executeGridQuery(pool, columns, parseGridQuery(cond, columns, { data: pool }))[0] ?? (cond ? undefined : pool[0])
          if (!target) {
            result = { ...step, success: false, message: `No row matches "${cond}".` }
            break
          }
          const id = getRowId(target, context.rowKey)
          const r = step.action === "open" ? openRow(ctx(), id) : selectRow(ctx(), id)
          result = { ...step, success: r.success, message: r.message, ids: [id] }
          break
        }
        case "summarize": {
          const rows = visible()
          result = { ...step, success: true, message: `${changeSummary(before, rows.length, filters, sort, highlighted, columns)}\n${summarizeRows(rows, columns)}` }
          break
        }
      }
    } catch (error) {
      result = { ...step, success: false, message: `This step failed: ${error instanceof Error ? error.message : String(error)}` }
    }

    results.push(result!)
    options.onStep?.(result!, i, plan.length)
  }

  const afterRows = visible().length
  return {
    steps: results,
    before,
    after: { rows: afterRows, filters, sort, highlighted },
    summary: changeSummary(before, afterRows, filters, sort, highlighted, columns),
  }
}

function changeSummary(
  before: { rows: number; filters: GridToolFilter[] },
  afterRows: number,
  filters: GridToolFilter[],
  sort: GridToolSort | null,
  highlighted: string[],
  columns: GridToolColumn[]
): string {
  const parts = [`Rows: ${before.rows} → ${afterRows}.`]
  const added = filters.filter((f) => !before.filters.some((b) => JSON.stringify(b) === JSON.stringify(f)))
  const removed = before.filters.filter((b) => !filters.some((f) => JSON.stringify(b) === JSON.stringify(f)))
  if (added.length) parts.push(`Filters added: ${added.map((f) => describeFilter(f, columns)).join("; ")}.`)
  if (removed.length) parts.push(`Filters removed: ${removed.map((f) => describeFilter(f, columns)).join("; ")}.`)
  if (sort) parts.push(`Sorted by ${columns.find((c) => c.key === sort.key)?.label ?? sort.key} ${sort.direction === "desc" ? "high → low" : "low → high"}.`)
  if (highlighted.length) parts.push(`${highlighted.length} row(s) highlighted.`)
  return parts.join(" ")
}
