import { type GridToolErrorCode, type GridToolLocale, type GridToolResult } from "./gridTools";
import type { YuktaiGridRule } from "./types";
export type GridAgentTool = {
    name: string;
    description: string;
    /** Optional UI label (e.g. Telugu). createGridTools() provides it. */
    label?: string;
    /** Optional JSON schema; its `required` list is checked before running. */
    inputSchema?: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
};
export type GridAgentErrorCode = GridToolErrorCode | "NOT_UNDERSTOOD";
export type GridAgentResult<T = unknown> = Omit<GridToolResult<T>, "error"> & {
    error?: {
        code: GridAgentErrorCode;
    };
    /** Full name of the tool that produced this result */
    tool?: string;
};
export type GridAgentStep = {
    id: number;
    tool: string;
    input: Record<string, unknown>;
    result: GridAgentResult;
    source: "tool" | "ask";
    at: number;
};
export type GridIntent = {
    kind: "tool";
    tool: string;
    input: Record<string, unknown>;
}
/**
 * "open <something>": search for it, then open the first match
 */
 | {
    kind: "open";
    text: string;
};
export type GridIntentContext = {
    columns: {
        key: string;
        label: string;
    }[];
    locale: GridToolLocale;
};
export type YuktaiGridAgentProps<T = Record<string, unknown>> = {
    tools: GridAgentTool[];
    /** Current grid data available to application-defined rules. */
    data?: T[];
    onResult?: (result: GridAgentResult) => void;
    onError?: (error: Error) => void;
    /** Language of the agent's own messages (default "en"). */
    locale?: GridToolLocale;
    /** Columns, so ask() can understand "sort by <column>". */
    columns?: {
        key: string;
        label: string;
    }[];
    /** Row ID field — must match the grid's rowKey (default "id"). */
    rowKey?: string;
    /** Replace the built-in regex intent parser. */
    parseIntent?: (text: string, context: GridIntentContext) => GridIntent | null;
    /** Application-defined content rules executed before the generic intent parser. */
    customRules?: YuktaiGridRule<T>[];
    /** How many steps to keep in history (default 20). */
    historyLimit?: number;
};
/** Built-in parser: exported so it can be tested and reused. */
export declare function parseGridIntent(text: string, context: GridIntentContext): GridIntent | null;
export declare function useYuktaiGridAgent<T = Record<string, unknown>>({ tools, data, onResult, onError, locale, columns, rowKey, parseIntent: customParseIntent, customRules, historyLimit, }: YuktaiGridAgentProps<T>): {
    loading: boolean;
    tools: GridAgentTool[];
    executeTool: (name: string, input?: Record<string, unknown>) => Promise<GridAgentResult<unknown>>;
    ask: (text: string) => Promise<GridAgentResult>;
    lastResult: GridAgentResult<unknown> | null;
    lastError: Error | null;
    history: GridAgentStep[];
    clearHistory: () => void;
};
export default useYuktaiGridAgent;
