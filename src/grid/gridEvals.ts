// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/gridEvals.ts (v5.7.0)
//
// A fixed set of plain-language requests (English and Telugu) with the tool
// calls a good plan must contain, and a scorer. Run it against any planner:
//
//   const report = await runGridEvals(createChromeGridPlanner(), context)
//   console.log(`${report.passed}/${report.total}`, report.failures)
//
// The set uses the sample "orders" columns in EVAL_COLUMNS. CI runs it with a
// recorded planner (no AI there); run it in Chrome to measure the real model.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridPlan, GridPlanner, GridPlannerColumn, GridPlannerContext } from "./gridPlanner"

/** The orders table the eval set is written for. */
export const EVAL_COLUMNS: GridPlannerColumn[] = [
  { key: "id", label: "Order", type: "text", samples: ["1001", "1002", "1003"] },
  { key: "customer", label: "Customer", type: "text", samples: ["Asha", "Ravi", "Lakshmi"] },
  { key: "city", label: "City", type: "text", samples: ["Hyderabad", "Vijayawada", "Guntur"] },
  { key: "amount", label: "Amount", type: "number", samples: ["120000", "45000", "8000"] },
  { key: "status", label: "Status", type: "text", samples: ["paid", "pending", "cancelled"] },
  { key: "date", label: "Date", type: "date", samples: ["2025-03-14", "2026-01-02", "2026-07-30"] },
]

/** One expected tool call: short tool id + the input fields that must match. */
export interface ExpectedStep {
  tool: string
  input?: Record<string, unknown>
}

export interface GridEvalCase {
  text: string
  lang: "en" | "te"
  /** Steps that must appear, in this order (other steps may sit between). */
  expect: ExpectedStep[]
  /** True when the right answer is a question, not steps. */
  clarify?: boolean
}

const f = (key: string, operator: string, value?: unknown): ExpectedStep => ({ tool: "filter", input: value === undefined ? { key, operator } : { key, operator, value } })
const s = (key: string, direction: "asc" | "desc"): ExpectedStep => ({ tool: "sort", input: { key, direction } })

export const GRID_EVAL_SET: GridEvalCase[] = [
  // sort
  { text: "sort by amount", lang: "en", expect: [{ tool: "sort", input: { key: "amount" } }] },
  { text: "biggest orders first", lang: "en", expect: [s("amount", "desc")] },
  { text: "smallest amount first", lang: "en", expect: [s("amount", "asc")] },
  { text: "newest first", lang: "en", expect: [s("date", "desc")] },
  { text: "oldest orders on top", lang: "en", expect: [s("date", "asc")] },
  { text: "sort customers A to Z", lang: "en", expect: [s("customer", "asc")] },
  { text: "order by city descending", lang: "en", expect: [s("city", "desc")] },
  { text: "remove the sorting", lang: "en", expect: [{ tool: "clear_sort" }] },
  { text: "మొత్తం ప్రకారం పెద్దవి ముందు", lang: "te", expect: [s("amount", "desc")] },
  { text: "తేదీ ప్రకారం కొత్తవి ముందు", lang: "te", expect: [s("date", "desc")] },
  // filter
  { text: "only Hyderabad", lang: "en", expect: [f("city", "equals", "Hyderabad")] },
  { text: "orders from Guntur", lang: "en", expect: [f("city", "equals", "Guntur")] },
  { text: "amount above 1 lakh", lang: "en", expect: [f("amount", "greaterThan", 100000)] },
  { text: "orders under 10000", lang: "en", expect: [f("amount", "lessThan", 10000)] },
  { text: "amount between 10000 and 50000", lang: "en", expect: [f("amount", "between")] },
  { text: "show pending orders", lang: "en", expect: [f("status", "equals", "pending")] },
  { text: "only paid ones", lang: "en", expect: [f("status", "equals", "paid")] },
  { text: "customers whose name starts with A", lang: "en", expect: [f("customer", "startsWith", "A")] },
  { text: "remove all filters", lang: "en", expect: [{ tool: "clear_filters" }] },
  { text: "హైదరాబాద్ ఆర్డర్లు మాత్రమే", lang: "te", expect: [f("city", "equals")] },
  { text: "1 లక్ష కంటే ఎక్కువ", lang: "te", expect: [f("amount", "greaterThan", 100000)] },
  { text: "చెల్లించనివి చూపించు", lang: "te", expect: [f("status", "equals", "pending")] },
  { text: "ఫిల్టర్లు తీసేయి", lang: "te", expect: [{ tool: "clear_filters" }] },
  // several steps
  { text: "Hyderabad orders above 1 lakh, biggest first", lang: "en", expect: [f("city", "equals", "Hyderabad"), f("amount", "greaterThan", 100000), s("amount", "desc")] },
  { text: "pending orders in Guntur sorted by date", lang: "en", expect: [f("status", "equals", "pending"), f("city", "equals", "Guntur"), { tool: "sort", input: { key: "date" } }] },
  { text: "paid orders under 50000, smallest first", lang: "en", expect: [f("status", "equals", "paid"), f("amount", "lessThan", 50000), s("amount", "asc")] },
  { text: "clear filters and sort by customer", lang: "en", expect: [{ tool: "clear_filters" }, { tool: "sort", input: { key: "customer" } }] },
  { text: "Vijayawada orders, newest first", lang: "en", expect: [f("city", "equals", "Vijayawada"), s("date", "desc")] },
  { text: "show cancelled orders and count them", lang: "en", expect: [f("status", "equals", "cancelled"), { tool: "count" }] },
  { text: "గుంటూరు లో పెండింగ్ ఆర్డర్లు, కొత్తవి ముందు", lang: "te", expect: [f("city", "equals"), f("status", "equals", "pending"), s("date", "desc")] },
  // search, count, highlight, read
  { text: "find Lakshmi", lang: "en", expect: [{ tool: "search", input: { query: "Lakshmi" } }] },
  { text: "search for order 1002", lang: "en", expect: [{ tool: "search", input: { query: "1002" } }] },
  { text: "how many orders are there", lang: "en", expect: [{ tool: "count" }] },
  { text: "what columns does this table have", lang: "en", expect: [{ tool: "columns" }] },
  { text: "highlight order 1003", lang: "en", expect: [{ tool: "highlight" }] },
  { text: "show me order 1001", lang: "en", expect: [{ tool: "get_row", input: { id: "1001" } }] },
  { text: "ఎన్ని వరుసలు ఉన్నాయి", lang: "te", expect: [{ tool: "count" }] },
  { text: "రవి ని వెతుకు", lang: "te", expect: [{ tool: "search" }] },
  // view, undo, download
  { text: "start over", lang: "en", expect: [{ tool: "reset_view" }] },
  { text: "show everything again", lang: "en", expect: [{ tool: "reset_view" }] },
  { text: "undo that", lang: "en", expect: [{ tool: "undo" }] },
  { text: "go back to how it was", lang: "en", expect: [{ tool: "undo" }] },
  { text: "download this as excel", lang: "en", expect: [{ tool: "download", input: { format: "xlsx" } }] },
  { text: "export to CSV", lang: "en", expect: [{ tool: "download", input: { format: "csv" } }] },
  { text: "save it as a PDF", lang: "en", expect: [{ tool: "download", input: { format: "pdf" } }] },
  { text: "Hyderabad orders as a CSV file", lang: "en", expect: [f("city", "equals", "Hyderabad"), { tool: "download", input: { format: "csv" } }] },
  { text: "వెనక్కి తీసుకో", lang: "te", expect: [{ tool: "undo" }] },
  { text: "Excel గా డౌన్‌లోడ్ చేయి", lang: "te", expect: [{ tool: "download", input: { format: "xlsx" } }] },
  // unclear: the right move is a question
  { text: "show the big ones", lang: "en", expect: [], clarify: true },
  { text: "sort it", lang: "en", expect: [], clarify: true },
]

const shortName = (tool: string) => tool.replace(/^.*?_(?=(clear_filters|clear_sort|reset_view|get_row|search|count|columns|highlight|select|open|filter|sort|download|undo|expand)$)/, "")

function sameValue(want: unknown, got: unknown): boolean {
  if (Array.isArray(want)) return Array.isArray(got) && want.length === got.length && want.every((w, i) => sameValue(w, got[i]))
  if (typeof want === "number") return Number(got) === want
  if (typeof want === "string") return String(got ?? "").toLowerCase() === want.toLowerCase()
  return want === got
}

/** Does `plan` contain the expected steps, in order? */
export function scorePlan(plan: GridPlan | null, item: GridEvalCase): boolean {
  if (item.clarify) return !!plan?.question && !plan.steps.length
  if (!plan || !plan.steps.length) return false
  let at = 0
  for (const step of plan.steps) {
    const want = item.expect[at]
    if (!want) break
    if (shortName(step.tool) !== want.tool) continue
    const ok = Object.entries(want.input ?? {}).every(([k, v]) => sameValue(v, step.input[k]))
    if (ok) at++
  }
  return at === item.expect.length
}

export interface GridEvalReport {
  passed: number
  total: number
  /** passed / total, 0–1 */
  score: number
  failures: { text: string; got: GridPlan | null }[]
}

/**
 * Runs every case through `planner`. `tools` should be the grid's own tool
 * list (names, descriptions and schemas) for EVAL_COLUMNS.
 */
export async function runGridEvals(
  planner: GridPlanner,
  tools: GridPlannerContext["tools"],
  cases: GridEvalCase[] = GRID_EVAL_SET
): Promise<GridEvalReport> {
  const failures: GridEvalReport["failures"] = []
  let passed = 0
  for (const item of cases) {
    let plan: GridPlan | null = null
    try {
      plan = await planner(item.text, { tools, columns: EVAL_COLUMNS, history: [], locale: item.lang })
    } catch {
      plan = null
    }
    if (scorePlan(plan, item)) passed++
    else failures.push({ text: item.text, got: plan })
  }
  return { passed, total: cases.length, score: cases.length ? passed / cases.length : 0, failures }
}
