// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/yuktaiGridRows.ts
//
// <YuktaiGrid>'s search → filters → sort pipeline, moved out of the component
// unchanged so both engines share it. With a Rust engine (`core`), number
// sorting and search run in Rust; every other case runs the same TypeScript
// as before. Results are identical either way.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridColumn } from "./types"
import { applyGridFilters, type GridToolColumn, type GridToolFilter } from "./gridTools"
import { pickRows, SEARCH_SEPARATOR, type GridCore } from "./rust/engine"

/** One search text per row, built with <YuktaiGrid>'s own search rule. */
export function yuktaiGridSearchTexts<T>(
  data: readonly T[],
  columns: readonly GridColumn<T>[],
  extraText?: (row: T) => string
): string[] {
  return data.map((row) => {
    const own = columns.map((column) => String(row[column.key as keyof T] ?? "").toLowerCase()).join(SEARCH_SEPARATOR)
    const extra = extraText ? extraText(row).toLowerCase() : ""
    return extra ? own + SEARCH_SEPARATOR + extra : own
  })
}

/**
 * v5.7.0: the text of a row's children (and their children), so search finds
 * a parent whose child matches. Depth is capped so a cycle cannot loop.
 */
export function childSearchText<T>(
  row: T,
  columns: readonly GridColumn<T>[],
  getChildren: (row: T) => T[] | undefined | null,
  depth = 0
): string {
  if (depth > 6) return ""
  const kids = getChildren(row)
  if (!kids || !kids.length) return ""
  return kids
    .map((kid) => {
      const own = columns.map((column) => String(kid[column.key as keyof T] ?? "")).join(SEARCH_SEPARATOR)
      const deeper = childSearchText(kid, columns, getChildren, depth + 1)
      return deeper ? own + SEARCH_SEPARATOR + deeper : own
    })
    .join(SEARCH_SEPARATOR)
}

/**
 * One Intl.Collator per locale. `a.localeCompare(b, locale, options)` builds a
 * new collator on every call, which made text sorting of 10 lakh rows take
 * seconds; `collator.compare` gives the same answers.
 */
const collators = new Map<string, Intl.Collator>()
export function gridCollator(locale?: string): Intl.Collator {
  const id = locale ?? ""
  let c = collators.get(id)
  if (!c) {
    c = new Intl.Collator(locale || undefined, { numeric: true, sensitivity: "base" })
    collators.set(id, c)
  }
  return c
}

/**
 * Sort keys for Rust, or null when TypeScript must sort. Empty (null/undefined) = NaN.
 *
 * - Every filled value a real number: the numbers themselves.
 * - No numbers at all (text, dates as text, booleans …): each distinct text gets
 *   its rank under the same collator <YuktaiGrid> sorts with. Texts the collator
 *   calls equal share a rank, so the order is exactly the TypeScript order,
 *   only much faster on big tables.
 * - Numbers mixed with other values: null (TypeScript compares those pairwise).
 */
export function yuktaiGridSortKeys<T>(rows: readonly T[], sortKey: string, locale?: string): Float64Array | null {
  const keys = new Float64Array(rows.length)
  let filled = 0
  let numbers = 0
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i][sortKey as keyof T] as unknown
    if (v == null) {
      keys[i] = NaN
      continue
    }
    filled++
    if (typeof v === "number") {
      if (Number.isNaN(v)) return null
      keys[i] = v
      numbers++
    }
  }
  if (!filled) return null
  if (numbers === filled) return keys
  if (numbers > 0) return null

  // Text ranks: distinct texts, sorted once with the collator.
  const ids = new Map<string, number>()
  const texts: string[] = []
  const textOf = new Int32Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i][sortKey as keyof T] as unknown
    if (v == null) {
      textOf[i] = -1
      continue
    }
    const t = String(v)
    let id = ids.get(t)
    if (id === undefined) {
      id = texts.length
      ids.set(t, id)
      texts.push(t)
    }
    textOf[i] = id
  }
  const compare = gridCollator(locale).compare
  const order = texts.map((_, i) => i).sort((a, b) => compare(texts[a], texts[b]))
  const rank = new Float64Array(texts.length)
  let r = 0
  for (let i = 0; i < order.length; i++) {
    if (i > 0 && compare(texts[order[i - 1]], texts[order[i]]) !== 0) r++
    rank[order[i]] = r
  }
  for (let i = 0; i < rows.length; i++) keys[i] = textOf[i] < 0 ? NaN : rank[textOf[i]]
  return keys
}

export interface YuktaiGridRowsInput<T> {
  data: T[]
  columns: GridColumn<T>[]
  searchText: string
  filters: GridToolFilter[]
  toolColumns: GridToolColumn[]
  sortKey?: string
  sortDirection: "asc" | "desc"
  locale: string
  /** Rust engine, or null for TypeScript */
  core?: GridCore | null
  /** True when `core` holds yuktaiGridSearchTexts(data, columns) */
  searchReady?: boolean
  /** Filled in with the engine that really answered search and sort */
  stats?: GridRunStats
  /** v5.7.0: more text to search per row (e.g. its children's text) */
  extraText?: (row: T) => string
}

/** Which engine answered, per step (null = step not run). */
export interface GridRunStats {
  search: "rust" | "ts" | null
  sort: "rust" | "ts" | null
}

/** "rust" if Rust answered any step, "ts" if only TypeScript ran, null if nothing ran. */
export function engineUsed(stats: GridRunStats): "rust" | "ts" | null {
  if (stats.search === "rust" || stats.sort === "rust") return "rust"
  return stats.search || stats.sort ? "ts" : null
}

export function yuktaiGridRows<T>({
  data,
  columns,
  searchText,
  filters,
  toolColumns,
  sortKey,
  sortDirection,
  locale,
  core = null,
  searchReady = false,
  stats,
  extraText,
}: YuktaiGridRowsInput<T>): T[] {
  let result = [...data]
  if (stats) {
    stats.search = null
    stats.sort = null
  }

  if (searchText.trim()) {
    const query = searchText.trim().toLowerCase()

    const hits = core && searchReady ? core.search(query) : null
    if (stats) stats.search = hits ? "rust" : "ts"
    if (hits) {
      result = pickRows(data, hits)
    } else {
      result = result.filter(
        (row) =>
          columns.some((column) =>
            String(row[column.key as keyof T] ?? "")
              .toLowerCase()
              .includes(query)
          ) || (extraText ? extraText(row).toLowerCase().includes(query) : false)
      )
    }
  }

  if (filters.length) {
    result = applyGridFilters(result, toolColumns, filters)
  }

  if (sortKey) {
    if (core) {
      const keys = yuktaiGridSortKeys(result, sortKey, locale)
      const order = keys && core.sortByKeys(keys, sortDirection !== "asc")
      if (order) {
        if (stats) stats.sort = "rust"
        return pickRows(result, order)
      }
    }
    if (stats) stats.sort = "ts"

    const collator = gridCollator(locale)
    result.sort((a, b) => {
      const av = a[sortKey as keyof T]
      const bv = b[sortKey as keyof T]

      if (av == null && bv == null) {
        return 0
      }

      if (av == null) {
        return 1
      }

      if (bv == null) {
        return -1
      }

      if (typeof av === "number" && typeof bv === "number") {
        return sortDirection === "asc" ? av - bv : bv - av
      }

      const comparison = collator.compare(String(av), String(bv))

      return sortDirection === "asc" ? comparison : -comparison
    })
  }

  return result
}
