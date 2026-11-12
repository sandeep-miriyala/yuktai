// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/gridBench.ts (v5.7.0)
// Developer settings: time the same search and sort with TypeScript and with
// Rust (WebAssembly) on this grid's own data, at a few table sizes.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridColumn } from "./types"
import type { GridToolColumn, GridToolFilter } from "./gridTools"
import { GridCore, loadGridCore } from "./rust/engine"
import { yuktaiGridRows, yuktaiGridSearchTexts } from "./yuktaiGridRows"

export interface EngineTiming {
  rows: number
  /** Median milliseconds, TypeScript. */
  ts: number
  /** Median milliseconds, Rust; null when WebAssembly is not available. */
  rust: number | null
}

export interface EngineComparison {
  /** What was timed, e.g. 'search "guntur" + sort by amount'. */
  work: string
  timings: EngineTiming[]
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now())

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

/** Table sizes to time: about 1,000, 10,000 and all rows (no repeats). */
export function benchSizes(total: number): number[] {
  return [...new Set([Math.min(1_000, total), Math.min(10_000, total), total])].filter((n) => n > 0)
}

export async function compareEngines<T>(input: {
  data: T[]
  columns: GridColumn<T>[]
  toolColumns: GridToolColumn[]
  filters: GridToolFilter[]
  searchText: string
  sortKey?: string
  sortDirection: "asc" | "desc"
  locale: string
  runs?: number
}): Promise<EngineComparison> {
  const runs = Math.max(1, input.runs ?? 5)
  // Something to do even when the reader has not searched or sorted yet
  const sortKey = input.sortKey ?? (input.columns.find((c) => c.sortable !== false)?.key as string | undefined)
  const searchText = input.searchText.trim()
  const work = [searchText ? `search "${searchText}"` : "", sortKey ? `sort by ${sortKey}` : ""].filter(Boolean).join(" + ") || "rows"

  const mod = await loadGridCore()
  const timings: EngineTiming[] = []

  for (const size of benchSizes(input.data.length)) {
    const data = size === input.data.length ? input.data : input.data.slice(0, size)
    const base = { ...input, data, searchText, sortKey }

    const tsTimes: number[] = []
    for (let i = 0; i < runs; i++) {
      const t0 = now()
      yuktaiGridRows({ ...base, core: null })
      tsTimes.push(now() - t0)
    }

    let rust: number | null = null
    const core = mod ? GridCore.create(mod) : null
    if (core) {
      const ready = core.setSearchTexts(yuktaiGridSearchTexts(data, input.columns))
      const rustTimes: number[] = []
      for (let i = 0; i < runs; i++) {
        const t0 = now()
        yuktaiGridRows({ ...base, core, searchReady: ready })
        rustTimes.push(now() - t0)
      }
      rust = median(rustTimes)
    }
    timings.push({ rows: size, ts: median(tsTimes), rust })
    // let the page breathe between sizes
    await new Promise((r) => setTimeout(r, 0))
  }
  return { work, timings }
}
