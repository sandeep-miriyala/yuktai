// ─────────────────────────────────────────────────────────────────────────────
// Idea 3 — Smart Data Grid Agent
// Turns questions like "overdue customers with balance over ₹10,000" into
// real grid filters, finds unusual rows and summarises what's in the grid.
// Pure functions — no DOM, no network, no model. Works with YuktaiGrid
// through the same GridToolContext the existing grid tools use.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import {
  applyGridFilters,
  getRowId,
  type GridToolColumn,
  type GridToolContext,
  type GridToolFilter,
  type GridToolSort,
} from "../grid/gridTools"

export interface ParsedGridQuery {
  filters: GridToolFilter[]
  /** Free-text terms that didn't map to a column; matched across all columns. */
  search: string[]
  sort: GridToolSort | null
  limit: number | null
  /** Assumptions the parser made (shown to the user so they can correct it). */
  notes: string[]
  /** Plain-English reading of the query. */
  explanation: string
}

export interface GridQueryResult<T> {
  rows: T[]
  ids: string[]
  parsed: ParsedGridQuery
  message: string
}

type Row = Record<string, unknown>

// ── Text helpers ────────────────────────────────────────────────────────────

const norm = (v: unknown) => String(v ?? "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim()

const STOPWORDS = new Set(
  "show me find list get give which who what all the a an rows row records record entries with where that are is have has having and or of for in on to please display only those whose any".split(" ")
)

/** "₹10,000" → 10000, "1.5 lakh" → 150000, "2cr" → 20000000, "10k" → 10000. */
export function parseAmount(text: string): number | null {
  const m = norm(text)
    .replace(/(₹|rs\.?|inr|\$|usd|€|£)/g, " ")
    .match(/(-?\d[\d,]*(?:\.\d+)?|-?\.\d+)\s*(k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion)?(?![\p{L}])/u)
  if (!m) return null
  const base = Number(m[1].replace(/,/g, ""))
  if (!Number.isFinite(base)) return null
  const unit = m[2] ?? ""
  const mult = /^k|thousand/.test(unit) ? 1e3 : /^la/.test(unit) ? 1e5 : /^(crore|cr)/.test(unit) ? 1e7 : /^(m|mn|million)$/.test(unit) ? 1e6 : /^(bn|billion)$/.test(unit) ? 1e9 : 1
  return base * mult
}

function columnNames(c: GridToolColumn): string[] {
  const names = new Set<string>([norm(c.label), norm(c.key), norm(c.key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2"))])
  for (const n of Array.from(names)) {
    if (n.endsWith("s")) names.add(n.slice(0, -1))
    else names.add(`${n}s`)
  }
  return Array.from(names).filter((n) => n.length > 1)
}

/** The column mentioned in `text` (longest name wins), or undefined. */
export function findMentionedColumn(text: string, columns: GridToolColumn[], kind?: GridToolColumn["type"]): GridToolColumn | undefined {
  const t = ` ${norm(text)} `
  let best: { column: GridToolColumn; length: number } | undefined
  for (const c of columns) {
    if (kind && (c.type ?? "text") !== kind) continue
    for (const name of columnNames(c)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      if (new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${escaped}($|[^\\p{L}\\p{M}\\p{N}])`, "u").test(t) && (!best || name.length > best.length)) {
        best = { column: c, length: name.length }
      }
    }
  }
  return best?.column
}

const MONEY_HINT = /amount|balance|total|price|salary|value|due|revenue|cost|fee|sales|outstanding|paid/i

function defaultNumericColumn(columns: GridToolColumn[]): GridToolColumn | undefined {
  const numeric = columns.filter((c) => c.type === "number")
  return numeric.find((c) => MONEY_HINT.test(`${c.key} ${c.label}`)) ?? numeric[0]
}

const GT = /(>=|=>|>|\bover\b|\babove\b|\bmore than\b|\bgreater than\b|\bexceeds?\b|\bexceeding\b|\bhigher than\b|\bat least\b|\bminimum\b|\bmin\b|కంటే ఎక్కువ)/
const LT = /(<=|=<|<|\bunder\b|\bbelow\b|\bless than\b|\blower than\b|\bat most\b|\bmaximum\b|\bmax\b|\bup to\b|కంటే తక్కువ)/
const DATE_AFTER = /\b(after|since|from)\b/
const DATE_BEFORE = /\b(before|until|till)\b/

const UNIT = "(?:\\s*(?:k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion))?"
const NUM = `(?:₹|rs\\.?\\s*|\\$)?\\s*-?\\d[\\d,]*(?:\\.\\d+)?${UNIT}`

// ── Parser ──────────────────────────────────────────────────────────────────

export interface ParseOptions<T = Row> {
  /** Rows let the parser recognise values like "overdue" in a Status column. */
  data?: T[]
}

export function parseGridQuery<T = Row>(query: string, columns: GridToolColumn[], options: ParseOptions<T> = {}): ParsedGridQuery {
  const parsed: ParsedGridQuery = { filters: [], search: [], sort: null, limit: null, notes: [], explanation: "" }
  // Drop question marks; keep decimal points and thousands separators
  let text = norm(query).replace(/[?!]+/g, " ").replace(/\.(?!\d)/g, " ").trim()
  const explain: string[] = []

  // 1. Limit: "top 5", "first 10", "bottom 3"
  const limitMatch = text.match(/\b(top|first|bottom|last|lowest|highest)\s+(\d+)\b/)
  if (limitMatch) {
    parsed.limit = Number(limitMatch[2])
    text = text.replace(limitMatch[0], ` ${limitMatch[1]} `)
  }

  // 2. Sort: "sorted by amount desc", "by amount", "highest balance first"
  const sortBy = text.match(/\b(?:sort(?:ed)?|order(?:ed)?)\s+by\s+([\p{L}\p{M}\p{N} _]+?)(?:\s+(asc|ascending|desc|descending))?(?=$|,|\band\b|\bthen\b)/u)
  const ranked = text.match(/\b(top|highest|largest|biggest|most|bottom|lowest|smallest|least)\b(?:\s+\d+)?\s+(?:by\s+)?([\p{L}\p{M}\p{N} _]+)/u)
  if (sortBy) {
    const column = findMentionedColumn(sortBy[1], columns)
    if (column) {
      parsed.sort = { key: column.key, direction: /^desc/.test(sortBy[2] ?? "") ? "desc" : "asc" }
      text = text.replace(sortBy[0], " ")
    }
  } else if (ranked) {
    const column = findMentionedColumn(ranked[2], columns, "number") ?? findMentionedColumn(ranked[2], columns) ?? defaultNumericColumn(columns)
    if (column) {
      const desc = /top|highest|largest|biggest|most/.test(ranked[1])
      parsed.sort = { key: column.key, direction: desc ? "desc" : "asc" }
      // Remove only the ranking word; the column name may still carry a filter.
      text = text.replace(new RegExp(`\\b${ranked[1]}\\b`), " ")
      if (!limitMatch && /top|bottom/.test(ranked[1])) parsed.limit = 10
    }
  }

  // 3. "between X and Y" — must be pulled out before splitting on "and"
  const betweenRe = new RegExp(`\\bbetween\\s+(${NUM}|\\d{4}-\\d{2}-\\d{2})\\s+(?:and|to|-)\\s+(${NUM}|\\d{4}-\\d{2}-\\d{2})`, "u")
  let between: RegExpMatchArray | null
  while ((between = text.match(betweenRe))) {
    // The column is named just before "between" ("balance between 1k and 9k")
    const lead = text.slice(Math.max(0, (between.index ?? 0) - 40), between.index ?? 0)
    const isDate = /\d{4}-\d{2}-\d{2}/.test(between[1])
    const column = isDate
      ? findMentionedColumn(lead, columns, "date") ?? columns.find((c) => c.type === "date")
      : findMentionedColumn(lead, columns, "number") ?? defaultNumericColumn(columns)
    const lo = isDate ? between[1] : parseAmount(between[1])
    const hi = isDate ? between[2] : parseAmount(between[2])
    if (column && lo !== null && hi !== null) {
      parsed.filters.push({ key: column.key, operator: "between", value: [lo as number, hi as number] })
      explain.push(`${column.label} between ${between[1]} and ${between[2]}`)
    }
    text = text.replace(between[0], " ")
  }

  // 4. Split the rest into clauses
  const clauses = text
    .split(/\s*(?:(?<!\d),|,(?!\d)|;|\band\b|(?<!(?:starts?|starting|ends?|ending|begins?|beginning)\s)\bwith\b|\bwhere\b|\bwho\b|\bthat\b|&|మరియు)\s*/u)
    .map((c) => c.trim())
    .filter(Boolean)

  const textColumns = columns.filter((c) => (c.type ?? "text") === "text")
  const distinct = new Map<string, Set<string>>()
  for (const c of textColumns) {
    const values = new Set<string>()
    for (const row of (options.data ?? []).slice(0, 5000)) {
      const v = norm((row as Row)[c.key])
      if (v && v.length <= 40) values.add(v)
      if (values.size > 300) break
    }
    if (values.size && values.size <= 300) distinct.set(c.key, values)
  }

  for (const clause of clauses) {
    const before = parsed.filters.length
    const mentioned = findMentionedColumn(clause, columns)
    const amountMatch = clause.match(new RegExp(NUM, "u"))
    const dateMatch = clause.match(/\d{4}-\d{2}-\d{2}/)

    // Date comparisons
    if (dateMatch && (DATE_AFTER.test(clause) || DATE_BEFORE.test(clause) || GT.test(clause) || LT.test(clause))) {
      const column = (mentioned?.type === "date" ? mentioned : undefined) ?? columns.find((c) => c.type === "date")
      if (column) {
        const after = DATE_AFTER.test(clause) || GT.test(clause)
        parsed.filters.push({ key: column.key, operator: after ? "greaterThan" : "lessThan", value: dateMatch[0] })
        explain.push(`${column.label} ${after ? "after" : "before"} ${dateMatch[0]}`)
      }
    }
    // Numeric comparisons
    else if (amountMatch && (GT.test(clause) || LT.test(clause) || (mentioned?.type === "number" && /\b(is|equals?)\b|=/.test(clause)))) {
      let column = mentioned?.type === "number" ? mentioned : undefined
      if (!column) {
        column = defaultNumericColumn(columns)
        if (column) parsed.notes.push(`Assumed "${clause}" refers to ${column.label}.`)
      }
      const value = parseAmount(amountMatch[0])
      if (column && value !== null) {
        const inclusive = /at least|minimum|\bmin\b|>=|=>|at most|maximum|\bmax\b|up to|<=|=</.test(clause)
        if (GT.test(clause)) {
          parsed.filters.push({ key: column.key, operator: "greaterThan", value: inclusive ? value - 1e-9 : value })
          explain.push(`${column.label} ${inclusive ? "≥" : ">"} ${value.toLocaleString("en-IN")}`)
        } else if (LT.test(clause)) {
          parsed.filters.push({ key: column.key, operator: "lessThan", value: inclusive ? value + 1e-9 : value })
          explain.push(`${column.label} ${inclusive ? "≤" : "<"} ${value.toLocaleString("en-IN")}`)
        } else {
          parsed.filters.push({ key: column.key, operator: "equals", value })
          explain.push(`${column.label} = ${value.toLocaleString("en-IN")}`)
        }
      }
    }
    // Text: "name starts with A", "title contains love", "status is paid"
    else {
      const starts = clause.match(/\b(?:starts?|starting|begins?|beginning)\s+with\s+(.+)$/)
      const ends = clause.match(/\b(?:ends?|ending)\s+with\s+(.+)$/)
      const contains = clause.match(/\b(?:contains?|containing|including|includes?|mentions?)\s+(.+)$/)
      const equals = clause.match(/\b(?:is|equals?|=|:)\s+(.+)$/)
      const target = starts ?? ends ?? contains ?? equals
      if (target) {
        const column = mentioned ?? textColumns[0]
        const value = target[1].replace(/^["'“‘]|["'”’]$/g, "").trim()
        if (column && value) {
          const operator: GridToolFilter["operator"] = starts ? "startsWith" : ends ? "endsWith" : contains ? "contains" : "equals"
          parsed.filters.push({ key: column.key, operator, value })
          explain.push(`${column.label} ${operator === "equals" ? "is" : operator === "contains" ? "contains" : operator === "startsWith" ? "starts with" : "ends with"} "${value}"`)
          if (!mentioned) parsed.notes.push(`Assumed "${clause}" refers to ${column.label}.`)
        }
      }
    }

    // Known cell values inside the clause: "overdue" → Status = Overdue,
    // "paid in south" → Status = Paid and Region = South (one value per column)
    if (parsed.filters.length === before) {
      for (const [key, values] of distinct) {
        let hit = ""
        for (const v of values) {
          if (v.length < 2 || v.length <= hit.length) continue
          const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          if (new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${escaped}($|[^\\p{L}\\p{M}\\p{N}])`, "u").test(clause)) hit = v
        }
        if (hit) {
          const column = columns.find((c) => c.key === key)!
          parsed.filters.push({ key, operator: "equals", value: hit })
          explain.push(`${column.label} is "${hit}"`)
        }
      }
    }

    // Nothing understood: keep meaningful words as a free-text search
    if (parsed.filters.length === before) {
      const words = clause
        .split(/\s+/)
        .filter((w) => !STOPWORDS.has(w) && !/^(top|first|bottom|last|lowest|highest|by|desc|asc|sort(ed)?)$/.test(w))
      const isColumnWord = words.length > 0 && words.every((w) => columns.some((c) => columnNames(c).includes(w)))
      if (words.length && !isColumnWord && !(mentioned && words.length === 1)) {
        // Words naming the rows themselves ("customers", "poems") are not search terms
        const term = words.join(" ")
        if (!/^(customers?|users?|people|items?|entries|poems?|orders?|products?|employees?|students?|members?)$/.test(term)) {
          parsed.search.push(term)
          explain.push(`any column contains "${term}"`)
        }
      }
    }
  }

  if (parsed.sort) {
    const label = columns.find((c) => c.key === parsed.sort!.key)?.label ?? parsed.sort.key
    explain.push(`sorted by ${label} ${parsed.sort.direction === "desc" ? "high → low" : "low → high"}`)
  }
  if (parsed.limit) explain.push(`first ${parsed.limit}`)
  parsed.explanation = explain.length ? `Showing rows where ${explain.join(", ")}.` : "No conditions understood — showing all rows."
  return parsed
}

// ── Execution ───────────────────────────────────────────────────────────────

function compare(a: unknown, b: unknown, type: GridToolColumn["type"]): number {
  if (type === "number") return (Number(a) || 0) - (Number(b) || 0)
  if (type === "date") return (new Date(String(a)).getTime() || 0) - (new Date(String(b)).getTime() || 0)
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true })
}

/** Runs a parsed query over rows without touching any UI. */
export function executeGridQuery<T>(data: T[], columns: GridToolColumn[], parsed: ParsedGridQuery): T[] {
  let rows = applyGridFilters(data, columns, parsed.filters)
  for (const term of parsed.search) {
    rows = rows.filter((row) => columns.some((c) => norm((row as Row)[c.key]).includes(term)))
  }
  if (parsed.sort) {
    const column = columns.find((c) => c.key === parsed.sort!.key)
    const dir = parsed.sort.direction === "desc" ? -1 : 1
    rows = [...rows].sort((a, b) => dir * compare((a as Row)[parsed.sort!.key], (b as Row)[parsed.sort!.key], column?.type))
  }
  if (parsed.limit) rows = rows.slice(0, parsed.limit)
  return rows
}

/**
 * Parses and runs a natural-language query, then pushes the result into the
 * grid through the context callbacks (filters, sort, highlight).
 */
export function runGridQuery<T>(
  query: string,
  context: GridToolContext<T>,
  options: { apply?: boolean } = {}
): GridQueryResult<T> {
  const parsed = parseGridQuery(query, context.columns, { data: context.data })
  const rows = executeGridQuery(context.data, context.columns, parsed)
  const ids = rows.map((r) => getRowId(r, context.rowKey)).filter(Boolean)
  if (options.apply !== false) {
    if (parsed.filters.length) context.onFiltersChange?.(parsed.filters)
    if (parsed.sort) context.onSortChange?.(parsed.sort)
    if (ids.length) context.onHighlightRows?.(ids)
  }
  const message = rows.length
    ? `${rows.length} row(s) found. ${parsed.explanation}${parsed.notes.length ? ` (${parsed.notes.join(" ")})` : ""}`
    : `No rows match. ${parsed.explanation}`
  return { rows, ids, parsed, message }
}

// ── Anomalies ───────────────────────────────────────────────────────────────

export interface GridAnomaly {
  rowId: string
  column: string
  label: string
  value: unknown
  kind: "high" | "low" | "duplicate"
  reason: string
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base]
}

/**
 * Finds unusual rows: numeric values far outside the typical range
 * (interquartile-range rule) and rows that duplicate another row.
 */
export function detectAnomalies<T>(
  data: T[],
  columns: GridToolColumn[],
  options: { rowKey?: string; factor?: number; columns?: string[] } = {}
): GridAnomaly[] {
  const factor = options.factor ?? 1.5
  const out: GridAnomaly[] = []
  const numeric = columns.filter((c) => c.type === "number" && (!options.columns || options.columns.includes(c.key)))
  const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 })

  for (const c of numeric) {
    const values = data.map((r) => Number((r as Row)[c.key])).filter((n) => Number.isFinite(n))
    if (values.length < 5) continue
    const sorted = [...values].sort((a, b) => a - b)
    const q1 = quantile(sorted, 0.25)
    const q3 = quantile(sorted, 0.75)
    const iqr = q3 - q1
    if (iqr === 0) continue
    const lo = q1 - factor * iqr
    const hi = q3 + factor * iqr
    for (const row of data) {
      const v = Number((row as Row)[c.key])
      if (!Number.isFinite(v) || (v >= lo && v <= hi)) continue
      out.push({
        rowId: getRowId(row, options.rowKey),
        column: c.key,
        label: c.label,
        value: v,
        kind: v > hi ? "high" : "low",
        reason: `${c.label} ${fmt(v)} is far ${v > hi ? "above" : "below"} the typical range (${fmt(q1)}–${fmt(q3)}).`,
      })
    }
  }

  const rowKey = options.rowKey ?? "id"
  const seen = new Map<string, string>()
  for (const row of data) {
    const signature = JSON.stringify(columns.filter((c) => c.key !== rowKey).map((c) => norm((row as Row)[c.key])))
    const id = getRowId(row, options.rowKey)
    const first = seen.get(signature)
    if (first !== undefined) {
      out.push({ rowId: id, column: rowKey, label: "Row", value: id, kind: "duplicate", reason: `Row ${id} has the same values as row ${first}.` })
    } else seen.set(signature, id)
  }
  return out
}

// ── Summary ─────────────────────────────────────────────────────────────────

export function summarizeRows<T>(rows: T[], columns: GridToolColumn[]): string {
  if (!rows.length) return "No rows to summarise."
  const lines = [`${rows.length} row(s).`]
  const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
  for (const c of columns) {
    const raw = rows.map((r) => (r as Row)[c.key])
    if (c.type === "number") {
      const nums = raw.map(Number).filter(Number.isFinite)
      if (!nums.length) continue
      const total = nums.reduce((a, b) => a + b, 0)
      lines.push(`${c.label}: total ${fmt(total)}, average ${fmt(total / nums.length)}, range ${fmt(Math.min(...nums))}–${fmt(Math.max(...nums))}.`)
    } else if (c.type === "date") {
      const times = raw.map((v) => new Date(String(v)).getTime()).filter(Number.isFinite)
      if (!times.length) continue
      const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
      lines.push(`${c.label}: from ${iso(Math.min(...times))} to ${iso(Math.max(...times))}.`)
    } else {
      const counts = new Map<string, number>()
      for (const v of raw) {
        const key = String(v ?? "").trim()
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
      }
      // Only summarise category-like columns (few distinct values)
      if (counts.size === 0 || counts.size > Math.max(8, rows.length / 3)) continue
      const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4)
      lines.push(`${c.label}: ${top.map(([k, n]) => `${k} (${n})`).join(", ")}.`)
    }
  }
  return lines.join("\n")
}

// ── One entry point for the assistant ───────────────────────────────────────

export interface GridAnswer<T> {
  kind: "query" | "anomalies" | "summary"
  message: string
  ids: string[]
  rows: T[]
  anomalies?: GridAnomaly[]
}

export function answerGridQuestion<T>(question: string, context: GridToolContext<T>): GridAnswer<T> {
  const q = norm(question)
  if (/unusual|anomal|outlier|odd|strange|suspicious|duplicate|అసాధారణ/.test(q)) {
    const anomalies = detectAnomalies(context.data, context.columns, { rowKey: context.rowKey })
    const ids = Array.from(new Set(anomalies.map((a) => a.rowId)))
    if (ids.length) context.onHighlightRows?.(ids)
    const byId = new Set(ids)
    return {
      kind: "anomalies",
      message: anomalies.length ? `${ids.length} unusual row(s):\n${anomalies.slice(0, 10).map((a) => `• ${a.reason}`).join("\n")}` : "Nothing unusual found.",
      ids,
      rows: context.data.filter((r) => byId.has(getRowId(r, context.rowKey))),
      anomalies,
    }
  }
  if (/summar|overview|describe|సారాంశం/.test(q)) {
    const filtered = applyGridFilters(context.data, context.columns, context.filters ?? [])
    return { kind: "summary", message: summarizeRows(filtered, context.columns), ids: [], rows: filtered }
  }
  const result = runGridQuery(question, context)
  return { kind: "query", message: result.message, ids: result.ids, rows: result.rows }
}
