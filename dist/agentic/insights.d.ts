import type { GridToolColumn } from "../grid/gridTools";
export type Aggregation = "sum" | "avg" | "count" | "min" | "max";
export type Period = "day" | "week" | "month" | "quarter" | "year";
export interface GroupResult {
    group: string;
    value: number;
    count: number;
}
export interface PeriodChange {
    group: string;
    current: number;
    previous: number;
    change: number;
    /** null when the previous value was 0 */
    changePct: number | null;
}
export interface PeriodComparison {
    period: Period;
    current: {
        from: Date;
        to: Date;
    };
    previous: {
        from: Date;
        to: Date;
    };
    rows: PeriodChange[];
}
export declare function aggregate(values: number[], agg: Aggregation): number;
/** Groups rows by a column and aggregates a metric (or counts rows). Sorted high → low. */
export declare function groupBy<T>(data: T[], groupKey: string, metricKey: string | null, agg?: Aggregation): GroupResult[];
export declare function startOfPeriod(date: Date, period: Period, weekStartsOn?: number): Date;
export declare function addPeriods(date: Date, period: Period, n: number): Date;
export interface ComparePeriodsOptions {
    dateKey: string;
    metricKey: string;
    groupKey?: string;
    agg?: Aggregation;
    period: Period;
    /** "Now" for the comparison (default: today). */
    referenceDate?: Date | string;
    /**
     * true (default): compare the same elapsed time — e.g. Mon–Wed this week
     * vs Mon–Wed last week — so a half-finished week doesn't look like a drop.
     */
    toDate?: boolean;
    weekStartsOn?: number;
}
export declare function comparePeriods<T>(data: T[], o: ComparePeriodsOptions): PeriodComparison;
/** Time series: one aggregated value per period, oldest first. */
export declare function trend<T>(data: T[], dateKey: string, metricKey: string, period: Period, agg?: Aggregation): Array<{
    start: Date;
    value: number;
}>;
export interface InsightAnswer {
    kind: "period-change" | "group" | "trend" | "total" | "unknown";
    answer: string;
    table: Array<Record<string, string | number>>;
}
export declare function askInsight<T>(question: string, data: T[], columns: GridToolColumn[], options?: {
    referenceDate?: Date | string;
}): InsightAnswer;
