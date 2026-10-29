import { type GridToolColumn, type GridToolContext, type GridToolFilter, type GridToolSort } from "../grid/gridTools";
export interface ParsedGridQuery {
    filters: GridToolFilter[];
    /** Free-text terms that didn't map to a column; matched across all columns. */
    search: string[];
    sort: GridToolSort | null;
    limit: number | null;
    /** Assumptions the parser made (shown to the user so they can correct it). */
    notes: string[];
    /** Plain-English reading of the query. */
    explanation: string;
}
export interface GridQueryResult<T> {
    rows: T[];
    ids: string[];
    parsed: ParsedGridQuery;
    message: string;
}
type Row = Record<string, unknown>;
/** "₹10,000" → 10000, "1.5 lakh" → 150000, "2cr" → 20000000, "10k" → 10000. */
export declare function parseAmount(text: string): number | null;
/** The column mentioned in `text` (longest name wins), or undefined. */
export declare function findMentionedColumn(text: string, columns: GridToolColumn[], kind?: GridToolColumn["type"]): GridToolColumn | undefined;
export interface ParseOptions<T = Row> {
    /** Rows let the parser recognise values like "overdue" in a Status column. */
    data?: T[];
}
export declare function parseGridQuery<T = Row>(query: string, columns: GridToolColumn[], options?: ParseOptions<T>): ParsedGridQuery;
/** Runs a parsed query over rows without touching any UI. */
export declare function executeGridQuery<T>(data: T[], columns: GridToolColumn[], parsed: ParsedGridQuery): T[];
/**
 * Parses and runs a natural-language query, then pushes the result into the
 * grid through the context callbacks (filters, sort, highlight).
 */
export declare function runGridQuery<T>(query: string, context: GridToolContext<T>, options?: {
    apply?: boolean;
}): GridQueryResult<T>;
export interface GridAnomaly {
    rowId: string;
    column: string;
    label: string;
    value: unknown;
    kind: "high" | "low" | "duplicate";
    reason: string;
}
/**
 * Finds unusual rows: numeric values far outside the typical range
 * (interquartile-range rule) and rows that duplicate another row.
 */
export declare function detectAnomalies<T>(data: T[], columns: GridToolColumn[], options?: {
    rowKey?: string;
    factor?: number;
    columns?: string[];
}): GridAnomaly[];
export declare function summarizeRows<T>(rows: T[], columns: GridToolColumn[]): string;
export interface GridAnswer<T> {
    kind: "query" | "anomalies" | "summary";
    message: string;
    ids: string[];
    rows: T[];
    anomalies?: GridAnomaly[];
}
export declare function answerGridQuestion<T>(question: string, context: GridToolContext<T>): GridAnswer<T>;
export {};
