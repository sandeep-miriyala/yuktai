import { type CreateGridToolsOptions, type GridTool, type GridToolLocale } from "./gridTools";
type ModelContextTool = {
    name: string;
    title: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: (input: any) => Promise<unknown> | unknown;
};
declare global {
    interface Document {
        modelContext?: {
            registerTool: (tool: ModelContextTool, options?: {
                signal?: AbortSignal;
            }) => Promise<void>;
        };
    }
}
export type WebMCPState = "unsupported" | "registering" | "ready" | "partial" | "error";
export type WebMCPStatus = {
    state: WebMCPState;
    /** Tools that the browser actually accepted */
    registered: string[];
    errors: {
        tool: string;
        message: string;
    }[];
};
type WebMCPColumn = {
    key: string;
    label: string;
    type?: "text" | "number" | "date";
};
export type YuktaiGridWebMCPProps<T> = {
    /**
     * Ready-made tools (YuktaiGrid passes its own list here). When given,
     * data/columns/callbacks below are not needed.
     */
    tools?: GridTool[];
    data?: T[];
    columns?: WebMCPColumn[];
    rowKey?: string;
    locale?: GridToolLocale;
    onSelectRow?: (id: string) => void;
    onHighlightRows?: (ids: string[]) => void;
    onOpenRow?: (id: string) => void;
    /** Tool name prefix (default "yuktai_grid") */
    name?: string;
    /** Agent-facing descriptions per tool, e.g. { search: "Search Telugu poems…" } */
    descriptions?: CreateGridToolsOptions["descriptions"];
    /** Called whenever the registration status changes */
    onStatusChange?: (status: WebMCPStatus) => void;
};
export declare function YuktaiGridWebMCP<T extends Record<string, unknown>>({ tools: toolsProp, data, columns, rowKey, locale, onSelectRow, onHighlightRows, onOpenRow, name, descriptions, onStatusChange, }: YuktaiGridWebMCPProps<T>): null;
export default YuktaiGridWebMCP;
