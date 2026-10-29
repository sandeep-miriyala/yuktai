/**
 * gridTools — the ONE place where YuktaiGrid tools are defined.
 *
 * Both the in-page Agent (useYuktaiGridAgent) and WebMCP (YuktaiGridWebMCP)
 * should get their tools from `createGridTools()`, so the list an agent sees
 * can never drift from the list the UI shows.
 *
 * Rules every tool follows:
 *  1. One row-ID strategy: `getRowId(row, context.rowKey)` everywhere.
 *     `rowKey` must match YuktaiGrid's `rowKey` prop (default "id").
 *  2. One result shape: { success, message, data?, error?: { code } }.
 *  3. Never claim success for something that didn't happen:
 *     missing callback → NOT_SUPPORTED, unknown row → NOT_FOUND.
 *  4. Never throw: tool execution is wrapped, errors become INTERNAL results.
 *
 * Backward compatible with 4.6.x: the existing exports keep their names and
 * parameters; results only gain an optional `error` field.
 */
export type GridToolColumn = {
    key: string;
    label: string;
    type?: "text" | "number" | "date";
};
export type GridToolErrorCode = "NOT_FOUND" | "NOT_SUPPORTED" | "INVALID_INPUT" | "INTERNAL";
export type GridToolFilterOperator = "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan" | "between";
export type GridToolFilter = {
    key: string;
    operator: GridToolFilterOperator;
    value: string | number | [number, number];
};
export type GridToolSort = {
    key: string;
    direction: "asc" | "desc";
};
/** Language of `message` (shown to people). Agent descriptions stay English. */
export type GridToolLocale = "en" | "te";
export type GridToolContext<T> = {
    data: T[];
    columns: GridToolColumn[];
    /** Field used as the row ID by every tool (default "id"). Match YuktaiGrid's rowKey. */
    rowKey?: string;
    /** Language for result messages (default "en"). */
    locale?: GridToolLocale;
    /** Filters currently applied, so a new filter can be merged in. */
    filters?: GridToolFilter[];
    onSelectRow?: (id: string) => void;
    onHighlightRows?: (ids: string[]) => void;
    onOpenRow?: (id: string) => void;
    onFiltersChange?: (filters: GridToolFilter[]) => void;
    onSortChange?: (sort: GridToolSort | null) => void;
};
export type GridToolResult<T = unknown> = {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: GridToolErrorCode;
    };
};
/** A tool ready for the Agent and for WebMCP `registerTool`. */
export type GridTool = {
    name: string;
    title: string;
    /** For AI agents (English works best for tool selection). Never shown in the UI. */
    description: string;
    /** Short label for the UI, in the grid's locale. */
    label: string;
    inputSchema: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<GridToolResult>;
};
export type CreateGridToolsOptions = {
    /** Tool name prefix, e.g. "ratnalabala_poems" → "ratnalabala_poems_search". */
    name?: string;
    /** Override agent descriptions per tool, keyed by the short tool id ("search", "open", …). */
    descriptions?: Partial<Record<GridToolId, string>>;
};
export type GridToolId = "search" | "count" | "columns" | "get_row" | "highlight" | "select" | "open" | "filter" | "clear_filters" | "sort" | "clear_sort";
/** The single row-ID rule used by every tool. */
export declare function getRowId(row: unknown, rowKey?: string): string;
/**
 * Applies filters to rows — exported so YuktaiGrid filters its rows with
 * exactly the same rules the filter tool uses to count matches.
 */
export declare function applyGridFilters<T>(data: T[], columns: GridToolColumn[], filters: GridToolFilter[]): T[];
/** Maps grid columns (any type) to tool columns (text / number / date). */
export declare function toGridToolColumns(columns: {
    key: string;
    label: string;
    type?: string;
}[]): GridToolColumn[];
export declare function searchGrid<T extends Record<string, unknown>>(context: GridToolContext<T>, query: string): GridToolResult<T[]>;
export declare function countGrid<T>(context: GridToolContext<T>): GridToolResult<number>;
export declare function getColumns<T>(context: GridToolContext<T>): GridToolResult<GridToolColumn[]>;
export declare function getRow<T extends Record<string, unknown>>(context: GridToolContext<T>, id: string): GridToolResult<T>;
export declare function highlightRows<T extends Record<string, unknown>>(context: GridToolContext<T>, ids: string[]): GridToolResult<string[]>;
export declare function selectRow<T extends Record<string, unknown>>(context: GridToolContext<T>, id: string): GridToolResult<string>;
export declare function openRow<T extends Record<string, unknown>>(context: GridToolContext<T>, id: string): GridToolResult<string>;
export declare function filterGrid<T extends Record<string, unknown>>(context: GridToolContext<T>, filter: GridToolFilter): GridToolResult<{
    filters: GridToolFilter[];
    count: number;
}>;
export declare function clearFilters<T>(context: GridToolContext<T>): GridToolResult<GridToolFilter[]>;
export declare function sortGrid<T>(context: GridToolContext<T>, key: string, direction?: "asc" | "desc"): GridToolResult<GridToolSort>;
export declare function clearSort<T>(context: GridToolContext<T>): GridToolResult<null>;
/**
 * Builds the tool list used by BOTH the Agent and WebMCP.
 * Only tools the grid can actually perform are included — e.g. "open" is
 * left out when no onOpenRow callback is given — so agents never see a tool
 * that would just return NOT_SUPPORTED.
 */
export declare function createGridTools<T extends Record<string, unknown>>(context: GridToolContext<T>, options?: CreateGridToolsOptions): GridTool[];
