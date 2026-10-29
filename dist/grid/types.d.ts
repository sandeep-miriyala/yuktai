import type { ReactNode } from "react";
import type { GridEngine } from "./rust/engine";
/** One search/sort run: what was searched, how long it took, which engine answered. */
export interface GridSearchTime {
    /** The search text ("" when only sorting) */
    query: string;
    /** Milliseconds for search + filters + sort */
    ms: number;
    /** Rows after search and filters */
    rows: number;
    engine: "rust" | "ts";
}
export interface GridColumn<T = Record<string, unknown>> {
    key: keyof T & string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    hiddenOnMobile?: boolean;
    pinned?: boolean;
    width?: number | string;
    render?: (value: T[keyof T], row: T, index: number) => ReactNode;
    align?: "left" | "center" | "right";
    type?: "text" | "number" | "date" | "boolean" | "badge";
}
export type SortDirection = "asc" | "desc" | null;
export interface SortConfig {
    key: string;
    direction: SortDirection;
}
export type FilterOperator = "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan" | "between";
export interface FilterConfig {
    key: string;
    operator: FilterOperator;
    value: string | number | [number, number];
}
export type ViewMode = "table" | "card" | "auto";
export type GridTheme = "default" | "high-contrast" | "dark" | "color-blind" | "dyslexia";
export type IndicLanguageLocale = "as-IN" | "bn-IN" | "brx-IN" | "doi-IN" | "gu-IN" | "hi-IN" | "kn-IN" | "ks-IN" | "kok-IN" | "mai-IN" | "ml-IN" | "mni-IN" | "mr-IN" | "ne-IN" | "or-IN" | "pa-IN" | "sa-IN" | "sat-IN" | "sd-IN" | "ta-IN" | "te-IN" | "ur-IN";
export type GridLocale = "en-IN" | "en-US" | IndicLanguageLocale;
export type GridInputLanguage = GridLocale;
export interface AIFeatures {
    search?: boolean;
    summary?: boolean;
    anomaly?: boolean;
    suggest?: boolean;
}
export interface VoiceFeatures {
    control?: boolean;
    speakOnFocus?: boolean;
    speakSummary?: boolean;
    language?: string;
}
export interface PaginationConfig {
    pageSize?: number;
    showSizeChanger?: boolean;
    sizeOptions?: number[];
}
export interface GridTranslations {
    search: string;
    noData: string;
    loading: string;
    rowsSelected: string;
    page: string;
    of: string;
    showing: string;
    to: string;
    results: string;
    sort: string;
    filter: string;
    export: string;
    voice: string;
    ask: string;
}
export interface YuktaiGridRuleContext<T = Record<string, unknown>> {
    /**
     * Original user input.
     */
    input: string;
    /**
     * Current grid data.
     */
    data: T[];
    /**
     * Available grid columns.
     */
    columns: {
        key: string;
        label: string;
    }[];
    /**
     * Execute one of the generic Grid tools.
     *
     * Example:
     *
     * executeTool("count")
     *
     * executeTool("filter", {
     *   key: "lines",
     *   operator: "greaterThan",
     *   value: 6
     * })
     */
    executeTool: (name: string, input?: Record<string, unknown>) => Promise<{
        success: boolean;
        message: string;
        data?: unknown;
        error?: {
            code: string;
        };
        tool?: string;
    }>;
}
export interface YuktaiGridRule<T = Record<string, unknown>> {
    /**
     * Application-defined rule name.
     */
    name: string;
    /**
     * User phrases that activate this rule.
     */
    phrases: string[];
    /**
     * Optional description for documentation/debugging.
     */
    description?: string;
    /**
     * Application-specific execution logic.
     *
     * The package does NOT contain application-specific rules.
     */
    execute: (context: YuktaiGridRuleContext<T>) => Promise<string> | string;
}
export interface YuktaiGridProps<T = Record<string, unknown>> {
    data: T[];
    columns: GridColumn<T>[];
    view?: ViewMode;
    mobileBreakpoint?: number;
    theme?: GridTheme;
    locale?: GridLocale;
    ai?: boolean | AIFeatures;
    voice?: boolean | VoiceFeatures;
    pagination?: boolean | PaginationConfig;
    search?: boolean;
    selectable?: boolean;
    selectedKeys?: string[];
    rowKey?: keyof T & string;
    loading?: boolean;
    empty?: ReactNode;
    highlightIds?: (string | number)[];
    highlightColor?: string;
    autoScrollToHighlight?: boolean;
    onSelectionChange?: (keys: string[]) => void;
    onRowClick?: (row: T, index: number) => void;
    onSortChange?: (sort: SortConfig | null) => void;
    className?: string;
    /**
     * Voice/input language of the embedded assistant.
     *
     * Supports English and the 22 Indian Scheduled Languages.
     */
    inputLanguage?: "en-IN" | "en-US" | IndicLanguageLocale;
    /**
     * Prefix for WebMCP / Agent tool names.
     *
     * Example:
     *
     * "ratnalabala_poems"
     *
     * produces:
     *
     * ratnalabala_poems_search
     * ratnalabala_poems_filter
     * ratnalabala_poems_sort
     */
    toolName?: string;
    /**
     * Agent-facing tool descriptions.
     */
    toolDescriptions?: Partial<Record<"search" | "count" | "columns" | "get_row" | "highlight" | "select" | "open" | "filter" | "clear_filters" | "sort" | "clear_sort", string>>;
    /**
     * Expose Grid tools to AI agents through WebMCP.
     */
    webmcp?: boolean;
    /**
     * Real WebMCP registration status.
     */
    onWebMCPStatusChange?: (status: {
        state: "unsupported" | "registering" | "ready" | "partial" | "error";
        registered: string[];
        errors: {
            tool: string;
            message: string;
        }[];
    }) => void;
    /**
     * Application-specific Agent rules.
     *
     * Example:
     *
     * customRules={[
     *   {
     *     name: "show-long-poems",
     *     phrases: ["పెద్ద పద్యాలు"],
     *     execute: async ({ executeTool }) => {
     *       const result = await executeTool("filter", {
     *         key: "lines",
     *         operator: "greaterThan",
     *         value: 6,
     *       })
     *
     *       return result.message
     *     },
     *   },
     * ]}
     */
    customRules?: YuktaiGridRule<T>[];
    /**
     * Search and sort engine.
     *
     * - "rust" (default since v5.3.11): the Rust (WebAssembly) engine, about
     *   13 KB, embedded. Falls back to TypeScript when WebAssembly is missing
     *   or blocked by a Content Security Policy.
     * - "auto": Rust from 10,000 rows, TypeScript below
     * - "ts": TypeScript only, as before v5.3.11
     *
     * Results are identical. Rust handles search and number/date sorting;
     * text sorting always uses TypeScript (browser locale rules for Telugu).
     */
    engine?: GridEngine;
    /**
     * Show how long the last search/sort took and which engine answered,
     * next to the row count, e.g. "12 rows · 0.9 ms · Rust". Default: false.
     */
    showSearchTime?: boolean;
    /** Called after every search or sort with its time and engine. */
    onSearchTime?: (info: GridSearchTime) => void;
    /**
     * Every result from the Agent.
     */
    onAgentResult?: (result: {
        success: boolean;
        message: string;
        tool?: string;
    }) => void;
}
