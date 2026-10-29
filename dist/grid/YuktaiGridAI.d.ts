import React from "react";
import type { GridInputLanguage } from "./types";
type UILanguage = "en-US" | "te-IN";
type InputLanguage = GridInputLanguage;
export interface YuktaiGridAIProps<T> {
    data: T[];
    columns: {
        key: string;
        label: string;
        type?: "number" | "text" | "date";
    }[];
    onSearch?: (query: string) => void;
    onSort?: (key: string, dir: "asc" | "desc") => void;
    theme?: "light" | "dark";
    /**
     * Language of AI UI and AI responses.
     * Default: English.
     */
    language?: UILanguage;
    /**
     * Language used by browser voice recognition.
     * Default: English.
     */
    inputLanguage?: InputLanguage;
    /**
     * When true, AI is rendered inside the grid.
     * When false, AI uses the floating assistant UI.
     */
    embedded?: boolean;
    /**
     * The grid Agent.
     */
    agent?: {
        ask: (text: string) => Promise<{
            success: boolean;
            message: string;
        }>;
        loading?: boolean;
    };
    /**
     * Called when the person switches the voice input language.
     */
    onInputLanguageChange?: (language: InputLanguage) => void;
}
export declare function YuktaiGridAI<T extends Record<string, unknown>>({ data, columns, onSearch, onSort, theme, language, inputLanguage, embedded, agent, onInputLanguageChange, }: YuktaiGridAIProps<T>): React.JSX.Element;
export default YuktaiGridAI;
