// ─────────────────────────────────────────────────────────────────────────────
// Idea 9 — Business Intelligence Copilot
// Group, aggregate, compare periods and spot trends in dashboard data, then
// answer questions like "Which region had the highest drop in conversion
// this week?" in plain English. Pure functions, no network, no model.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridToolColumn } from "../grid/gridTools"
import { findMentionedColumn } from "./gridQuery"

type Row = Record<string, unknown>

export type Aggregation = "sum" | "avg" | "count" | "min" | "max"
export type Period = "day" | "week" | "month" | "quarter" | "year"

export interface GroupResult {
  group: string
  value: number
  count: number
}

export interface PeriodChange {
  group: string
  current: number
  previous: number
  change: number
  /** null when the previous value was 0 */
  changePct: number | null
}

export interface PeriodComparison {
  period: Period
  current: { from: Date; to: Date }
  previous: { from: Date; to: Date }
  rows: PeriodChange[]
}

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[,₹$%\s]/g, ""))
  return Number.isFinite(n) ? n : null
}
const time = (v: unknown): number | null => {
  const t = v instanceof Date ? v.getTime() : new Date(String(v ?? "")).getTime()
  return Number.isFinite(t) ? t : null
}

export function aggregate(values: number[], agg: Aggregation): number {
  if (agg === "count") return values.length
  if (!values.length) return 0
  switch (agg) {
    case "sum":
      return values.reduce((a, b) => a + b, 0)
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length
    case "min":
      return Math.min(...values)
    case "max":
      return Math.max(...values)
  }
}

/** Groups rows by a column and aggregates a metric (or counts rows). Sorted high → low. */
export function groupBy<T>(data: T[], groupKey: string, metricKey: string | null, agg: Aggregation = "sum"): GroupResult[] {
  const buckets = new Map<string, number[]>()
  for (const row of data) {
    const group = String((row as Row)[groupKey] ?? "—").trim() || "—"
    const list = buckets.get(group) ?? []
    if (metricKey === null || agg === "count") list.push(1)
    else {
      const v = num((row as Row)[metricKey])
      if (v !== null) list.push(v)
    }
    buckets.set(group, list)
  }
  return Array.from(buckets.entries())
    .map(([group, values]) => ({ group, value: aggregate(values, agg), count: values.length }))
    .sort((a, b) => b.value - a.value)
}

export function startOfPeriod(date: Date, period: Period, weekStartsOn = 1): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  if (period === "week") d.setDate(d.getDate() - ((d.getDay() - weekStartsOn + 7) % 7))
  if (period === "month") d.setDate(1)
  if (period === "quarter") d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1)
  if (period === "year") d.setMonth(0, 1)
  return d
}

export function addPeriods(date: Date, period: Period, n: number): Date {
  const d = new Date(date)
  if (period === "day") d.setDate(d.getDate() + n)
  if (period === "week") d.setDate(d.getDate() + 7 * n)
  if (period === "month") d.setMonth(d.getMonth() + n)
  if (period === "quarter") d.setMonth(d.getMonth() + 3 * n)
  if (period === "year") d.setFullYear(d.getFullYear() + n)
  return d
}

export interface ComparePeriodsOptions {
  dateKey: string
  metricKey: string
  groupKey?: string
  agg?: Aggregation
  period: Period
  /** "Now" for the comparison (default: today). */
  referenceDate?: Date | string
  /**
   * true (default): compare the same elapsed time — e.g. Mon–Wed this week
   * vs Mon–Wed last week — so a half-finished week doesn't look like a drop.
   */
  toDate?: boolean
  weekStartsOn?: number
}

export function comparePeriods<T>(data: T[], o: ComparePeriodsOptions): PeriodComparison {
  const ref = o.referenceDate ? new Date(o.referenceDate) : new Date()
  const curFrom = startOfPeriod(ref, o.period, o.weekStartsOn)
  const curTo = o.toDate === false ? addPeriods(curFrom, o.period, 1) : new Date(Math.max(ref.getTime() + 1, curFrom.getTime() + 1))
  const prevFrom = addPeriods(curFrom, o.period, -1)
  const prevTo = o.toDate === false ? curFrom : new Date(prevFrom.getTime() + (curTo.getTime() - curFrom.getTime()))
  const agg = o.agg ?? "sum"

  const cur = new Map<string, number[]>()
  const prev = new Map<string, number[]>()
  for (const row of data) {
    const t = time((row as Row)[o.dateKey])
    if (t === null) continue
    const bucket = t >= curFrom.getTime() && t < curTo.getTime() ? cur : t >= prevFrom.getTime() && t < prevTo.getTime() ? prev : null
    if (!bucket) continue
    const group = o.groupKey ? String((row as Row)[o.groupKey] ?? "—") : "All"
    const v = agg === "count" ? 1 : num((row as Row)[o.metricKey])
    if (v === null) continue
    bucket.set(group, [...(bucket.get(group) ?? []), v])
  }

  const groups = new Set([...cur.keys(), ...prev.keys()])
  const rows: PeriodChange[] = Array.from(groups).map((group) => {
    const current = aggregate(cur.get(group) ?? [], agg)
    const previous = aggregate(prev.get(group) ?? [], agg)
    return {
      group,
      current,
      previous,
      change: current - previous,
      changePct: previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100,
    }
  })
  return { period: o.period, current: { from: curFrom, to: curTo }, previous: { from: prevFrom, to: prevTo }, rows }
}

/** Time series: one aggregated value per period, oldest first. */
export function trend<T>(data: T[], dateKey: string, metricKey: string, period: Period, agg: Aggregation = "sum"): Array<{ start: Date; value: number }> {
  const buckets = new Map<number, number[]>()
  for (const row of data) {
    const t = time((row as Row)[dateKey])
    const v = agg === "count" ? 1 : num((row as Row)[metricKey])
    if (t === null || v === null) continue
    const key = startOfPeriod(new Date(t), period).getTime()
    buckets.set(key, [...(buckets.get(key) ?? []), v])
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([k, values]) => ({ start: new Date(k), value: aggregate(values, agg) }))
}

// ── Natural-language questions ──────────────────────────────────────────────

export interface InsightAnswer {
  kind: "period-change" | "group" | "trend" | "total" | "unknown"
  answer: string
  table: Array<Record<string, string | number>>
}

const RATE = /rate|conversion|ratio|percent|%|score|rating|margin|ctr|avg|average/i

function detectPeriod(q: string): { period: Period; shift: number } | null {
  const m = q.match(/\b(today|yesterday|this|last|previous|past)\s*(day|week|month|quarter|year)?\b/)
  if (!m) return null
  if (m[1] === "today") return { period: "day", shift: 0 }
  if (m[1] === "yesterday") return { period: "day", shift: -1 }
  if (!m[2]) return null
  return { period: m[2] as Period, shift: m[1] === "this" ? 0 : -1 }
}

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
const pct = (n: number | null) => (n === null ? "new" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`)

export function askInsight<T>(
  question: string,
  data: T[],
  columns: GridToolColumn[],
  options: { referenceDate?: Date | string } = {}
): InsightAnswer {
  const q = question.toLowerCase()
  const numeric = columns.filter((c) => c.type === "number")
  const metric =
    findMentionedColumn(q, columns, "number") ??
    numeric.find((c) => /amount|revenue|sales|total|value/i.test(`${c.key} ${c.label}`)) ??
    numeric[0]
  const dateCol = columns.find((c) => c.type === "date") ?? columns.find((c) => /date|time|day|created|month/i.test(`${c.key} ${c.label}`))
  const groupPhrase = q.match(/\b(?:which|by|per|each|across|every|top|for each)\s+([\p{L}\p{M}\p{N} _]+)/u)?.[1] ?? ""
  const group = findMentionedColumn(groupPhrase, columns, "text")

  const wantsCount = /how many|number of|count/.test(q)
  const agg: Aggregation = wantsCount
    ? "count"
    : /average|avg|mean/.test(q)
      ? "avg"
      : /\btotal\b|\bsum\b/.test(q)
        ? "sum"
        : metric && RATE.test(`${metric.key} ${metric.label}`)
          ? "avg"
          : "sum"
  const down = /drop|decline|decrease|fell|fall|down|worst|lost|shrink|reduc/.test(q)
  const up = /increase|growth|grew|rise|rose|up\b|best|improv|gain/.test(q)
  const lowest = /lowest|least|smallest|bottom|worst|minimum/.test(q)
  const period = detectPeriod(q)

  if (!metric && !wantsCount) return { kind: "unknown", answer: "I couldn't find a numeric column to analyse.", table: [] }
  const metricLabel = wantsCount ? "rows" : metric!.label

  // Period comparison: "which region had the highest drop in conversion this week"
  if (period && dateCol && (up || down || /change|compare|vs|versus/.test(q))) {
    const ref = options.referenceDate ? new Date(options.referenceDate) : new Date()
    const reference = period.shift ? addPeriods(ref, period.period, period.shift) : ref
    const cmp = comparePeriods(data, {
      dateKey: dateCol.key,
      metricKey: metric?.key ?? dateCol.key,
      groupKey: group?.key,
      agg,
      period: period.period,
      referenceDate: reference,
      toDate: period.shift === 0,
    })
    const sorted = [...cmp.rows].sort((a, b) => (down ? a.change - b.change : b.change - a.change))
    const table = sorted.map((r) => ({ [group?.label ?? "Group"]: r.group, Current: fmt(r.current), Previous: fmt(r.previous), Change: fmt(r.change), "Change %": pct(r.changePct) }))
    if (!sorted.length) return { kind: "period-change", answer: `No ${metricLabel} data in this ${period.period} or the one before.`, table }
    const top = sorted[0]
    const span = `${period.shift ? "last" : "this"} ${period.period} vs the ${period.period} before`
    const moved = top.change === 0 ? "did not change" : top.change < 0 ? `dropped ${fmt(Math.abs(top.change))}` : `rose ${fmt(top.change)}`
    const detail = `${metricLabel} ${moved} (${fmt(top.previous)} → ${fmt(top.current)}, ${pct(top.changePct)}) — ${span}.`
    const noneMatched = (down && top.change >= 0) || (up && top.change <= 0)
    const answer = group
      ? noneMatched
        ? `No ${group.label.toLowerCase()} ${down ? "dropped" : "grew"}. Closest is ${top.group}: ${detail}`
        : `${top.group}: ${detail}`
      : detail
    return { kind: "period-change", answer, table }
  }

  // Trend: "revenue trend by month"
  if (/trend|over time|month by month|week by week/.test(q) && dateCol && metric) {
    const p: Period = /week/.test(q) ? "week" : /day|daily/.test(q) ? "day" : /year/.test(q) ? "year" : "month"
    const series = trend(data, dateCol.key, metric.key, p, agg)
    const table = series.map((s) => ({ Period: s.start.toISOString().slice(0, 10), [metric.label]: fmt(s.value) }))
    if (series.length < 2) return { kind: "trend", answer: `Not enough ${p}s of data for a trend.`, table }
    const first = series[0].value
    const last = series[series.length - 1].value
    const peak = series.reduce((a, b) => (b.value > a.value ? b : a))
    return {
      kind: "trend",
      answer: `${metric.label} went from ${fmt(first)} to ${fmt(last)} over ${series.length} ${p}s (${pct(first ? ((last - first) / Math.abs(first)) * 100 : null)}). Peak: ${fmt(peak.value)} in the ${p} of ${peak.start.toISOString().slice(0, 10)}.`,
      table,
    }
  }

  // Grouping: "total sales by region", "which product has the most orders"
  if (group) {
    const groups = groupBy(data, group.key, metric?.key ?? null, agg)
    const ordered = lowest ? [...groups].reverse() : groups
    const table = ordered.map((g) => ({ [group.label]: g.group, [`${agg} of ${metricLabel}`]: fmt(g.value), Rows: g.count }))
    if (!ordered.length) return { kind: "group", answer: "No data.", table }
    const top = ordered[0]
    return {
      kind: "group",
      answer: `${top.group} has the ${lowest ? "lowest" : "highest"} ${agg === "sum" ? "total" : agg === "avg" ? "average" : agg} ${metricLabel}: ${fmt(top.value)} (across ${ordered.length} ${group.label.toLowerCase()} groups).`,
      table,
    }
  }

  // Single number
  const values = wantsCount ? data.map(() => 1) : data.map((r) => num((r as Row)[metric!.key])).filter((v): v is number => v !== null)
  const value = aggregate(values, agg)
  return {
    kind: "total",
    answer: `${agg === "avg" ? "Average" : agg === "count" ? "Count of" : agg === "sum" ? "Total" : agg} ${metricLabel}: ${fmt(value)} across ${data.length} row(s).`,
    table: [{ Metric: metricLabel, Aggregation: agg, Value: fmt(value) }],
  }
}
