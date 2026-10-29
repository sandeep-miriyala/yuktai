import { type CSSProperties } from "react";
import { type GridToolFilter, type GridToolSort } from "../grid/gridTools";
import type { GridEngine } from "../grid/rust/engine";
import { type StepResult } from "./taskRunner";
export interface UseAgenticGridOptions<T> {
    data: T[];
    columns: Array<{
        key: string;
        label: string;
        type?: string;
    }>;
    rowKey?: string;
    /** "Now" for questions like "this week" (default: today). */
    referenceDate?: Date | string;
    onOpenRow?: (id: string) => void;
}
export type AgenticAnswerKind = "query" | "anomalies" | "summary" | "insight" | "tasks";
export declare function useAgenticGrid<T extends Record<string, unknown>>(options: UseAgenticGridOptions<T>): {
    /** Pass to <YuktaiGrid data={…}> */
    gridData: T[];
    /** Pass to <YuktaiGrid highlightIds={…}> */
    highlightIds: string[];
    filters: GridToolFilter[];
    sort: GridToolSort | null;
    ask: (question: string) => Promise<void>;
    reset: () => void;
    answer: string;
    kind: AgenticAnswerKind | null;
    table: Record<string, string | number>[];
    steps: StepResult[];
    busy: boolean;
    visibleIds: string[];
};
export declare function AgenticGridBar({ grid, placeholder, examples, style, }: {
    grid: ReturnType<typeof useAgenticGrid<any>>;
    placeholder?: string;
    examples?: string[];
    style?: CSSProperties;
}): import("react").JSX.Element;
type Tab = "copilot" | "qa" | "forms" | "design" | "ask" | "voice";
export interface AgenticPanelProps {
    defaultTab?: Tab;
    /** Speech recognition language for the Voice tab (default "en-IN"). */
    voiceLang?: string;
    /** Optional model hook for Ask page, e.g. Gemini Nano or your own API. */
    generate?: (question: string, context: string) => Promise<string>;
    /** Ask page search engine: "rust" (default since v5.3.11), "auto" or "ts". Same answers; Rust is faster on long pages. */
    engine?: GridEngine;
    style?: CSSProperties;
}
export declare function AgenticPanel({ defaultTab, voiceLang, generate, engine, style }: AgenticPanelProps): import("react").JSX.Element;
export {};
