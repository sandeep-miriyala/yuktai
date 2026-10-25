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
export function yuktaiGridSearchTexts<T>(data: readonly T[], columns: readonly GridColumn<T>[]): string[] {
  return data.map((row) =>
    columns.map((column) => String(row[column.key as keyof T] ?? "").toLowerCase()).join(SEARCH_SEPARATOR)
  )
}

/**
 * Sort keys for Rust, or null when TypeScript must sort. Rust is used only
 * when every filled value is a real number, which is exactly when
 * <YuktaiGrid> compares numerically. Empty (null/undefined) = NaN.
 */
export function yuktaiGridSortKeys<T>(rows: readonly T[], sortKey: string): Float64Array | null {
  const keys = new Float64Array(rows.length)
  let filled = 0
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i][sortKey as keyof T] as unknown
    if (v == null) {
      keys[i] = NaN
      continue
    }
    if (typeof v !== "number" || Number.isNaN(v)) return null
    keys[i] = v
    filled++
  }
  return filled ? keys : null
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
      result = result.filter((row) =>
        columns.some((column) =>
          String(row[column.key as keyof T] ?? "")
            .toLowerCase()
            .includes(query)
        )
      )
    }
  }

  if (filters.length) {
    result = applyGridFilters(result, toolColumns, filters)
  }

  if (sortKey) {
    if (core) {
      const keys = yuktaiGridSortKeys(result, sortKey)
      const order = keys && core.sortByKeys(keys, sortDirection !== "asc")
      if (order) {
        if (stats) stats.sort = "rust"
        return pickRows(result, order)
      }
    }
    if (stats) stats.sort = "ts"

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

      const comparison = String(av).localeCompare(String(bv), locale, {
        numeric: true,
        sensitivity: "base",
      })

      return sortDirection === "asc" ? comparison : -comparison
    })
  }

  return result
}
