import React from "react";
import type { YuktaiGridProps } from "./types";
export declare function YuktaiGrid<T extends Record<string, unknown>>({ data, columns, rowKey, view, mobileBreakpoint, theme, locale, ai, search, selectable, selectedKeys, onSelectionChange, pagination, loading, highlightIds, highlightColor, autoScrollToHighlight, onRowClick, onSortChange, empty, className, inputLanguage, toolName, toolDescriptions, webmcp, onWebMCPStatusChange, onAgentResult, customRules, engine, showSearchTime, onSearchTime, }: YuktaiGridProps<T>): React.JSX.Element;
export default YuktaiGrid;
