import type { GridToolColumn } from "../grid/gridTools";
import { type AuditRoot } from "./dom";
import type { GridEngine } from "../grid/rust/engine";
export interface ContextPassage {
    id: string;
    source: "page" | "grid" | "custom";
    text: string;
    /** Grid row id or page section heading. */
    ref?: string;
}
export interface ContextHit extends ContextPassage {
    score: number;
}
export interface ContextAnswer {
    answer: string;
    hits: ContextHit[];
    /** True when `generate` produced the answer; false for extractive answers. */
    generated: boolean;
}
/** Unicode-aware tokens: keeps Telugu/Devanagari combining marks together. */
export declare function tokenize(text: string): string[];
export declare function pagePassages(root?: AuditRoot, maxChars?: number): ContextPassage[];
export declare function gridPassages<T>(data: T[], columns: GridToolColumn[], rowKey?: string): ContextPassage[];
export interface ContextIndexOptions<T = Record<string, unknown>> {
    /** Index the visible page text (default true). */
    includePage?: boolean;
    root?: AuditRoot;
    rows?: T[];
    columns?: GridToolColumn[];
    rowKey?: string;
    /** Extra documents, e.g. FAQ text or help articles. */
    documents?: Array<{
        id: string;
        text: string;
    }>;
    /**
     * Search engine: "rust" (default since v5.3.11), "auto" (Rust from 1,000
     * passages) or "ts". Same passages, same scores, same order; Rust is faster
     * on long pages and big grids. Works offline (the engine is embedded) and
     * falls back to TypeScript when WebAssembly is missing or blocked.
     */
    engine?: GridEngine;
}
export declare function createContextIndex<T>(input?: ContextIndexOptions<T>): {
    search: (question: string, k?: number) => ContextHit[];
    ask: (question: string, opts?: {
        k?: number;
        generate?: (question: string, context: string) => Promise<string>;
    }) => Promise<ContextAnswer>;
    /** Call after the page or data changes. */
    rebuild: () => void;
    update(next: Partial<ContextIndexOptions<T>>): void;
    size: () => number;
    /** "rust" when the Rust engine answers searches for this index, else "ts". */
    readonly engine: "rust" | "ts";
    /** Resolves "rust" or "ts" once the engine is loaded (or not wanted). */
    whenEngineReady: () => Promise<"rust" | "ts">;
};
