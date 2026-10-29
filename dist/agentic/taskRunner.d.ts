import { type GridToolContext, type GridToolFilter, type GridToolSort } from "../grid/gridTools";
export type TaskAction = "filter" | "highlight" | "sort" | "clear" | "count" | "summarize" | "anomalies" | "open" | "select";
export interface PlannedStep {
    action: TaskAction;
    /** The part of the instruction this step came from. */
    text: string;
}
export interface StepResult extends PlannedStep {
    success: boolean;
    message: string;
    ids?: string[];
}
export interface TaskRunResult {
    steps: StepResult[];
    before: {
        rows: number;
        filters: GridToolFilter[];
    };
    after: {
        rows: number;
        filters: GridToolFilter[];
        sort: GridToolSort | null;
        highlighted: string[];
    };
    /** "What changed", in plain English. */
    summary: string;
}
/** Splits an instruction into ordered steps. No model needed. */
export declare function planTasks(instruction: string): PlannedStep[];
export interface RunTasksOptions {
    /** Called after each step, so the UI can show progress. */
    onStep?: (result: StepResult, index: number, total: number) => void;
}
export declare function runTasks<T extends Record<string, unknown>>(instruction: string, context: GridToolContext<T>, options?: RunTasksOptions): Promise<TaskRunResult>;
