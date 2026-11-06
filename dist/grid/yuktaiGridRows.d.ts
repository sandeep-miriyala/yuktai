import type { GridColumn } from "./types";
import { type GridToolColumn, type GridToolFilter } from "./gridTools";
import { type GridCore } from "./rust/engine";
/** One search text per row, built with <YuktaiGrid>'s own search rule. */
export declare function yuktaiGridSearchTexts<T>(data: readonly T[], columns: readonly GridColumn<T>[]): string[];
export declare function gridCollator(locale?: string): Intl.Collator;
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
export declare function yuktaiGridSortKeys<T>(rows: readonly T[], sortKey: string, locale?: string): Float64Array | null;
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
