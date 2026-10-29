import type { GridColumn, GridSearchTime, SortConfig, PaginationConfig } from "./types";
import { type GridToolFilter } from "./gridTools";
import { type GridEngine } from "./rust/engine";
export interface UseGridOptions<T> {
    data: T[];
    columns: GridColumn<T>[];
    pagination?: boolean | PaginationConfig;
    mobileBreakpoint?: number;
    /** Locale for text sorting, e.g. "te-IN" (default: browser locale) */
    locale?: string;
    /** Starting filters (optional) */
    initialFilters?: GridToolFilter[];
    /**
     * Search and sort engine: "ts" (default), "rust" (always) or "auto" (Rust
     * from 10,000 rows). Same results either way; Rust is faster on big data.
     */
    engine?: GridEngine;
}
export interface UseGridReturn<T> {
    displayedData: T[];
    /** All matching rows (search + filters + sort), before pagination */
    rows: T[];
    totalCount: number;
    filteredCount: number;
    sort: SortConfig | null;
    toggleSort: (key: string) => void;
    /** Set sort directly (null clears it) */
    setSort: (sort: SortConfig | null) => void;
    clearSort: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filters: GridToolFilter[];
    setFilters: (filters: GridToolFilter[]) => void;
    /** Add or replace the filter for one column */
    setFilter: (filter: GridToolFilter) => void;
    /** Remove the filter for one column */
    removeFilter: (key: string) => void;
    clearFilters: () => void;
    page: number;
    pageSize: number;
    totalPages: number;
    setPage: (p: number) => void;
    setPageSize: (s: number) => void;
    isMobile: boolean;
    reset: () => void;
    /** Last search/sort: time in ms and which engine answered (null when neither ran) */
    searchTime: GridSearchTime | null;
}
/** One search text per row: each column's normalised text, joined by SEARCH_SEPARATOR. */
export declare function gridSearchTexts<T extends Record<string, unknown>>(data: readonly T[], columns: readonly GridColumn<T>[]): string[];
/**
 * Sort keys that give exactly the order of compareValues(), or null when the
 * column needs TypeScript (text, booleans, mixed values …). Empty = NaN.
 */
export declare function gridSortKeys<T extends Record<string, unknown>>(rows: readonly T[], key: string, type: GridColumn["type"]): Float64Array | null;
export declare function useGrid<T extends Record<string, unknown>>(options: UseGridOptions<T>): UseGridReturn<T>;
export default useGrid;
