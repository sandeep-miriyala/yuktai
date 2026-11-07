import React from "react";
import type { YuktaiGridProps } from "./types";
/**
 * The grid's colours. Set any of these in your CSS to restyle the grid,
 * for example `.yk-grid { --yk-grid-accent: #0038b4; }`. Dark theme values
 * use the same names, so set them under your own dark-mode selector.
 */
export declare function gridColors(dark: boolean): {
    bg: string;
    text: string;
    border: string;
    control: string;
    controlBg: string;
    controlMuted: string;
    controlText: string;
    muted: string;
    chip: string;
    selected: string;
    check: string;
    cardCheck: string;
    accent: string;
    accentText: string;
    disabled: string;
    hcBorder: string;
};
export declare function YuktaiGrid<T extends Record<string, unknown>>({ data, columns, rowKey, view, mobileBreakpoint, theme, locale, ai, search, selectable, selectedKeys, onSelectionChange, pagination, loading, highlightIds, highlightColor, autoScrollToHighlight, onRowClick, onSortChange, empty, className, inputLanguage, toolName, toolDescriptions, webmcp, onWebMCPStatusChange, onAgentResult, customRules, engine, showSearchTime, onSearchTime, }: YuktaiGridProps<T>): React.JSX.Element;
export default YuktaiGrid;
