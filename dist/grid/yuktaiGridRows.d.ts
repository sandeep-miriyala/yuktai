import type { GridColumn } from "./types";
import { type GridToolColumn, type GridToolFilter } from "./gridTools";
import { type GridCore } from "./rust/engine";
/** One search text per row, built with <YuktaiGrid>'s own search rule. */
export declare function yuktaiGridSearchTexts<T>(data: readonly T[], columns: readonly GridColumn<T>[]): string[];
/**
 * Sort keys for Rust, or null when TypeScript must sort. Rust is used only
 * when every filled value is a real number, which is exactly when
 * <YuktaiGrid> compares numerically. Empty (null/undefined) = NaN.
 */
export declare function yuktaiGridSortKeys<T>(rows: readonly T[], sortKey: string): Float64Array | null;
export interface YuktaiGridRowsInput<T> {
    data: T[];
    columns: GridColumn<T>[];
    searchText: string;
    filters: GridToolFilter[];
    toolColumns: GridToolColumn[];
    sortKey?: string;
    sortDirection: "asc" | "desc";
    locale: string;
    /** Rust engine, or null for TypeScript */
    core?: GridCore | null;
    /** True when `core` holds yuktaiGridSearchTexts(data, columns) */
    searchReady?: boolean;
    /** Filled in with the engine that really answered search and sort */
    stats?: GridRunStats;
}
/** Which engine answered, per step (null = step not run). */
export interface GridRunStats {
    search: "rust" | "ts" | null;
    sort: "rust" | "ts" | null;
}
/** "rust" if Rust answered any step, "ts" if only TypeScript ran, null if nothing ran. */
export declare function engineUsed(stats: GridRunStats): "rust" | "ts" | null;
export declare function yuktaiGridRows<T>({ data, columns, searchText, filters, toolColumns, sortKey, sortDirection, locale, core, searchReady, stats, }: YuktaiGridRowsInput<T>): T[];
