"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  GridColumn,
  YuktaiGridProps,
} from "./types";

import YuktaiGridAI from "./YuktaiGridAI";
import { useYuktaiGridAgent } from "./YuktaiGridAgent";
import YuktaiGridWebMCP from "./YuktaiGridWebMCP";
import {
  createGridTools,
  toGridToolColumns,
  type GridTool,
  type GridToolFilter,
  type GridToolResult,
  type GridToolSort,
} from "./gridTools";
import { useGridCore } from "./rust/useGridCore";
import { engineUsed, yuktaiGridRows, yuktaiGridSearchTexts, type GridRunStats } from "./yuktaiGridRows";
import { formatSearchTime } from "./rust/engine";

type Language = "en-US" | "te-IN";

const translations: Record<
  Language,
  {
    search: string;
    searchAria: string;
    rows: string;
    row: string;
    loading: string;
    noData: string;
    selectRow: string;
    selectColumn: string;
    openRow: string;
    pageSize: string;
    page: string;
    of: string;
    previous: string;
    next: string;
    first: string;
    last: string;
    goTo: string;
    all: string;
    pages: string;
    showAll: string;
    showPages: string;
    rowsRange: (from: string, to: string, total: string) => string;
    listLabel: string;
    yes: string;
    no: string;
    sortAscending: string;
    sortDescending: string;
    filtersActive: (count: number) => string;
    clearFilters: string;
  }
> = {
  "en-US": {
    search: "Search...",
    searchAria: "Search grid",
    rows: "rows",
    row: "row",
    loading: "Loading...",
    noData: "No data found.",
    selectRow: "Select row",
    selectColumn: "Select",
    openRow: "Open row",
    pageSize: "Page size",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    first: "First page",
    last: "Last page",
    goTo: "Go to page",
    all: "All",
    pages: "Pages",
    showAll: "Show all",
    showPages: "Show pages",
    rowsRange: (from, to, total) => `Rows ${from}–${to} of ${total}`,
    listLabel: "All rows, scroll to see more",
    yes: "Yes",
    no: "No",
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    filtersActive: (count) => `${count} filter(s) applied`,
    clearFilters: "Clear filters",
  },
  "te-IN": {
    search: "శోధించండి...",
    searchAria: "గ్రిడ్‌లో శోధించండి",
    rows: "వరుసలు",
    row: "వరుస",
    loading: "లోడ్ అవుతోంది...",
    noData: "డేటా కనబడలేదు.",
    selectRow: "వరుసను ఎంచుకోండి",
    selectColumn: "ఎంపిక",
    openRow: "వరుసను తెరవండి",
    pageSize: "పేజీ పరిమాణం",
    page: "పేజీ",
    of: "లో",
    previous: "వెనుకకు",
    next: "ముందుకు",
    first: "మొదటి పేజీ",
    last: "చివరి పేజీ",
    goTo: "పేజీకి వెళ్ళండి",
    all: "అన్నీ",
    pages: "పేజీలు",
    showAll: "అన్నీ చూపించు",
    showPages: "పేజీలుగా చూపించు",
    rowsRange: (from, to, total) => `${total} లో ${from}–${to} వరుసలు`,
    listLabel: "అన్ని వరుసలు, ఇంకా చూడటానికి స్క్రోల్ చేయండి",
    yes: "అవును",
    no: "కాదు",
    sortAscending: "ఆరోహణ క్రమంలో అమర్చండి",
    sortDescending: "అవరోహణ క్రమంలో అమర్చండి",
    filtersActive: (count) => `${count} ఫిల్టర్(లు) వేశారు`,
    clearFilters: "ఫిల్టర్లు తీసేయండి",
  },
};

function SearchIcon({
  size = 20,
  color = "currentColor",
  strokeWidth = 2.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function SortUpIcon({
  size = 18,
  color = "currentColor",
  strokeWidth = 2.4,
  label,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {label ? <title>{label}</title> : null}
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

function SortDownIcon({
  size = 18,
  color = "currentColor",
  strokeWidth = 2.4,
  label,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {label ? <title>{label}</title> : null}
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronLeftIcon({
  size = 20,
  color = "currentColor",
  strokeWidth = 2.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({
  size = 20,
  color = "currentColor",
  strokeWidth = 2.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon({
  size = 18,
  color = "currentColor",
  strokeWidth = 2.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/**
 * v5.3.16 — page numbers to show: always the first and last, two either side of
 * the current page, and 0 where pages are skipped (shown as "…").
 */
export function pageWindow(page: number, total: number): number[] {
  const want = new Set([1, total, page - 2, page - 1, page, page + 1, page + 2]);
  const pages = [...want].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: number[] = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) out.push(0);
    out.push(n);
  });
  return out;
}

/** v5.4.0 — one-line cells for the fixed-height "Show all" list. */
/** Enter or Space on a focused row or card opens it (keyboard users get what a click does). */
function openOnKey(event: React.KeyboardEvent<HTMLElement>, open: () => void) {
  if (event.target !== event.currentTarget) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    open();
  }
}

const srOnly: React.CSSProperties = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };

const cellClip = (h: number): React.CSSProperties => ({
  height: h,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

/** CSS custom property with a fallback: var(--yk-grid-<name>, <fallback>). */
const cssVar = (name: string, fallback: string) => `var(--yk-grid-${name}, ${fallback})`;

/**
 * The grid's colours. Set any of these in your CSS to restyle the grid,
 * for example `.yk-grid { --yk-grid-accent: #0038b4; }`. Dark theme values
 * use the same names, so set them under your own dark-mode selector.
 */
export function gridColors(dark: boolean) {
  return {
    bg: cssVar("bg", dark ? "#0f172a" : "#ffffff"),
    text: cssVar("text", dark ? "#f8fafc" : "#0f172a"),
    border: cssVar("border", dark ? "#334155" : "#e2e8f0"),
    control: cssVar("control-border", dark ? "#475569" : "#cbd5e1"),
    controlBg: cssVar("control-bg", dark ? "#1e293b" : "#ffffff"),
    controlMuted: cssVar("control-bg-muted", dark ? "#1e293b" : "#f8fafc"),
    controlText: cssVar("control-text", dark ? "#ffffff" : "#0f172a"),
    muted: cssVar("muted", dark ? "#cbd5e1" : "#64748b"),
    chip: cssVar("chip-bg", dark ? "#1e293b" : "#f1f5f9"),
    selected: cssVar("selected-bg", dark ? "#1e3a5f" : "#eff6ff"),
    check: cssVar("check-border", dark ? "#64748b" : "#cbd5e1"),
    cardCheck: cssVar("check-border", "#cbd5e1"),
    accent: cssVar("accent", "#2563eb"),
    accentText: cssVar("accent-text", "#ffffff"),
    disabled: cssVar("disabled", "#94a3b8"),
    hcBorder: cssVar("hc-border", "#000000"),
  };
}

export function YuktaiGrid<
  T extends Record<string, unknown>
>({
  data,
  columns,
  rowKey = "id",
  view = "auto",
  mobileBreakpoint = 768,
  theme = "default",
  locale = "en-US",
  ai = false,
  search = true,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  pagination,
  loading = false,
  highlightIds = [],
  highlightColor = "var(--yk-grid-highlight, #fff3a3)",
  autoScrollToHighlight = false,
  onRowClick,
  onSortChange,
  empty,
  className = "",
  inputLanguage,
  toolName = "yuktai_grid",
  toolDescriptions,
  webmcp = false,
  onWebMCPStatusChange,
  onAgentResult,
  customRules = [],
  engine = "rust",
  showSearchTime = false,
  onSearchTime,
}: YuktaiGridProps<T>) {
  const language: Language =
    locale === "te-IN" ? "te-IN" : "en-US";

  const t = translations[language];

  const aiEnabled =
    ai === true ||
    (typeof ai === "object" && ai !== null);

  const paginationEnabled =
    pagination !== false &&
    pagination !== undefined;

  const configuredPageSize =
    typeof pagination === "object"
      ? pagination.pageSize ?? 20
      : 20;

  const sizeOptions =
    typeof pagination === "object" &&
    pagination.sizeOptions &&
    pagination.sizeOptions.length > 0
      ? pagination.sizeOptions
      : [10, 20, 50, 100];

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState(configuredPageSize);
  const [sortKey, setSortKey] = useState<
    string | undefined
  >();
  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("asc");
  const [isMobile, setIsMobile] = useState(false);

  // Filters set by the Agent (filter tool) — applied to rows below
  const [filters, setFilters] = useState<GridToolFilter[]>([]);

  // Rows highlighted by the Agent (search / highlight tools)
  const [agentHighlight, setAgentHighlight] = useState<string[]>([]);

  const toolColumns = useMemo(
    () => toGridToolColumns(columns.map((c) => ({ key: String(c.key), label: c.label, type: c.type }))),
    [columns]
  );

  useEffect(() => {
    setPageSize(configuredPageSize);
    setPage(1);
  }, [configuredPageSize]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(
        window.innerWidth <= mobileBreakpoint
      );
    };

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateViewport
      );
    };
  }, [mobileBreakpoint]);

  // Optional Rust engine (engine="rust" | "auto"); null = TypeScript
  const core = useGridCore(engine, data.length);

  // Rust keeps this grid's search text; rebuilt only when data or columns change
  const rustSearchReady = useMemo(
    () => (core ? core.setSearchTexts(yuktaiGridSearchTexts(data, columns)) : false),
    [core, data, columns]
  );

  // Rows + how long search/sort took and which engine answered
  const run = useMemo(
    () => {
      const stats: GridRunStats = { search: null, sort: null };
      const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
      const result = yuktaiGridRows({
        data,
        columns,
        searchText,
        filters,
        toolColumns,
        sortKey,
        sortDirection,
        locale,
        core,
        searchReady: rustSearchReady,
        stats,
      });
      const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
      return { rows: result, ms, engine: engineUsed(stats) };
    },
    [
      data,
      columns,
      searchText,
      filters,
      toolColumns,
      sortKey,
      sortDirection,
      locale,
      core,
      rustSearchReady,
    ]
  );
  const rows = run.rows;

  // Report each search/sort run (only when something actually ran)
  useEffect(() => {
    if (!onSearchTime || !run.engine) return;
    onSearchTime({ query: searchText.trim(), ms: run.ms, rows: run.rows.length, engine: run.engine });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  // pageSize 0 means "All". v5.4.0: above allLimit rows, "All" is a virtual list.
  const allLimit =
    typeof pagination === "object" && typeof pagination.allLimit === "number"
      ? pagination.allLimit
      : 5000;
  const allowAll = !(typeof pagination === "object" && pagination.showAll === false);
  const showAll = allowAll && pageSize === 0 && rows.length > 0;
  const virtual = showAll && rows.length > allLimit;
  const effectiveSize = showAll
    ? Math.max(1, rows.length)
    : pageSize === 0
    ? configuredPageSize
    : pageSize;
  const rowHeight = Math.max(
    44,
    (typeof pagination === "object" && pagination.rowHeight) || 48
  );
  const listHeight =
    (typeof pagination === "object" && pagination.listHeight) || "min(70vh, 720px)";

  // Virtual list: only the rows on screen are drawn. Browsers cap an element's
  // height (about 33 million px in Chrome), so very long lists are scaled.
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(600);
  const MAX_PX = 15_000_000;
  const fullPx = rows.length * rowHeight;
  const bodyPx = Math.min(fullPx, MAX_PX);
  const viewPx = Math.max(rowHeight, viewport - rowHeight); // minus the sticky header
  const maxScroll = Math.max(0, bodyPx - viewPx);
  const maxVirtual = Math.max(0, fullPx - viewPx);
  const virtualTop = maxScroll > 0 ? (Math.min(scrollTop, maxScroll) / maxScroll) * maxVirtual : 0;
  const firstRow = virtual ? Math.min(rows.length - 1, Math.floor(virtualTop / rowHeight)) : 0;
  const rowOffset = virtualTop - firstRow * rowHeight;
  const visibleCount = virtual ? Math.ceil(viewPx / rowHeight) + 8 : 0;
  const topSpacer = virtual ? Math.max(0, Math.min(scrollTop, maxScroll) - rowOffset) : 0;
  const renderedCount = virtual ? Math.min(visibleCount, rows.length - firstRow) : 0;
  const bottomSpacer = virtual ? Math.max(0, bodyPx - topSpacer - renderedCount * rowHeight) : 0;

  useEffect(() => {
    if (!virtual) return;
    const el = listRef.current;
    if (!el) return;
    let frame = 0;
    const measure = () => setViewport(el.clientHeight || 600);
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollTop(el.scrollTop));
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
  }, [virtual]);

  // New search, filter or sort: back to the first row
  useEffect(() => {
    if (!virtual) return;
    if (listRef.current) listRef.current.scrollTop = 0;
    setScrollTop(0);
  }, [virtual, rows]);

  /** Scroll the virtual list so row `index` is at the top. */
  const scrollToRow = useCallback(
    (index: number) => {
      const el = listRef.current;
      if (!el) return;
      const target = maxVirtual > 0 ? (Math.min(index * rowHeight, maxVirtual) / maxVirtual) * maxScroll : 0;
      el.scrollTop = target;
      setScrollTop(target);
    },
    [maxScroll, maxVirtual, rowHeight]
  );

  const showPageNumbers =
    !(typeof pagination === "object" && pagination.showPageNumbers === false);

  const totalPages = paginationEnabled
    ? Math.max(
        1,
        Math.ceil(
          rows.length / effectiveSize
        )
      )
    : 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const activeHighlightIds = useMemo(() => {
    const all = [...highlightIds.map(String), ...agentHighlight];
    return Array.from(new Set(all));
  }, [highlightIds, agentHighlight]);

  useEffect(() => {
    if (!autoScrollToHighlight) {
      return;
    }

    const firstHighlight =
      activeHighlightIds[0];

    if (
      firstHighlight === undefined ||
      firstHighlight === null
    ) {
      return;
    }

    const escapedId =
      typeof CSS !== "undefined" &&
      typeof CSS.escape === "function"
        ? CSS.escape(String(firstHighlight))
        : String(firstHighlight).replace(
            /["\\]/g,
            "\\$&"
          );

    const element =
      document.querySelector(
        `[data-yuktai-row-id="${escapedId}"]`
      );

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [
    activeHighlightIds,
    autoScrollToHighlight,
    page,
  ]);

  const displayedRows = useMemo(() => {
    if (virtual) {
      return rows.slice(firstRow, firstRow + renderedCount);
    }

    if (!paginationEnabled) {
      return rows;
    }

    const start =
      (page - 1) * effectiveSize;

    return rows.slice(
      start,
      start + effectiveSize
    );
  }, [
    rows,
    paginationEnabled,
    page,
    effectiveSize,
    virtual,
    firstRow,
    renderedCount,
  ]);

  // the "Show all" list is always a table: fixed-height rows keep it fast
  // spacer rows must span exactly the real columns (fixed table layout counts them)
  const colCount =
    (selectable ? 1 : 0) +
    columns.filter((column) => !(isMobile && column.hiddenOnMobile)).length;

  // fixed layout: give every column a minimum width so phones scroll sideways instead of squashing
  const tableMinWidth =
    (selectable ? 52 : 0) +
    columns
      .filter((column) => !(isMobile && column.hiddenOnMobile))
      .reduce((sum, column) => sum + (typeof column.width === "number" ? column.width : 140), 0);

  const isCardView =
    !virtual &&
    (view === "card" ||
      (view === "auto" && isMobile));

  const getId = (row: T) =>
    String(
      row[rowKey as keyof T] ?? ""
    );

  const isSelected = (id: string) =>
    selectedKeys.some(
      (key) => String(key) === id
    );

  const isHighlighted = (id: string) =>
    activeHighlightIds.some(
      (key) => String(key) === id
    );

  const toggleSelection = (row: T) => {
    if (!selectable) {
      return;
    }

    const id = getId(row);

    const next = isSelected(id)
      ? selectedKeys.filter(
          (key) =>
            String(key) !== id
        )
      : [...selectedKeys, id];

    onSelectionChange?.(next);
  };

  const handleSort = (
    column: GridColumn<T>
  ) => {
    if (column.sortable === false) {
      return;
    }

    const key = String(column.key);

    const nextDirection =
      sortKey === key &&
      sortDirection === "asc"
        ? "desc"
        : "asc";

    setSortKey(key);
    setSortDirection(nextDirection);
    setPage(1);

    onSortChange?.({
      key,
      direction: nextDirection,
    });
  };

  const handleAISearch = (
    query: string
  ) => {
    setSearchText(query);
    setPage(1);
  };

  const handleAISort = (
    key: string,
    direction: "asc" | "desc"
  ) => {
    const column = columns.find(
      (item) =>
        String(item.key) === key ||
        item.label.toLowerCase() ===
          key.toLowerCase()
    );

    if (!column) {
      return;
    }

    setSortKey(String(column.key));
    setSortDirection(direction);
    setPage(1);

    onSortChange?.({
      key: String(column.key),
      direction,
    });
  };

  /* ───── One tool list for the Assistant AND WebMCP ───── */

  const toolLocale = language === "te-IN" ? "te" : "en";

  const applySortFromTool = useCallback(
    (sort: GridToolSort | null) => {
      if (sort) {
        setSortKey(sort.key);
        setSortDirection(sort.direction);
      } else {
        setSortKey(undefined);
        setSortDirection("asc");
      }
      setPage(1);
      onSortChange?.(sort);
    },
    [onSortChange]
  );

  const applyFiltersFromTool = useCallback((next: GridToolFilter[]) => {
    setFilters(next);
    setPage(1);
  }, []);

  const highlightFromTool = useCallback(
    (ids: string[]) => {
      setAgentHighlight(ids);
      // Jump to the page that contains the first highlighted row
      if (paginationEnabled && ids.length) {
        const index = rows.findIndex((row) => String(row[rowKey as keyof T] ?? "") === ids[0]);
        if (index >= 0) {
          if (virtual) scrollToRow(index);
          else setPage(Math.floor(index / effectiveSize) + 1);
        }
      }
    },
    [paginationEnabled, rows, rowKey, effectiveSize, virtual, scrollToRow]
  );

  const tools = useMemo<GridTool[]>(
    () =>
      createGridTools(
        {
          data,
          columns: toolColumns,
          rowKey: String(rowKey),
          locale: toolLocale,
          filters,
          onHighlightRows: highlightFromTool,
          onFiltersChange: applyFiltersFromTool,
          onSortChange: applySortFromTool,
          // Only offered when the app can actually do them
          onOpenRow: onRowClick
            ? (id) => {
                const index = rows.findIndex((row) => String(row[rowKey as keyof T] ?? "") === id);
                const row = index >= 0 ? rows[index] : data.find((r) => String(r[rowKey as keyof T] ?? "") === id);
                if (row) onRowClick(row, Math.max(index, 0));
              }
            : undefined,
          onSelectRow:
            selectable && onSelectionChange
              ? (id) => {
                  if (!selectedKeys.some((key) => String(key) === id)) {
                    onSelectionChange([...selectedKeys.map(String), id]);
                  }
                }
              : undefined,
        },
        { name: toolName, descriptions: toolDescriptions }
      ),
    [
      data,
      toolColumns,
      rowKey,
      toolLocale,
      filters,
      highlightFromTool,
      applyFiltersFromTool,
      applySortFromTool,
      onRowClick,
      rows,
      selectable,
      onSelectionChange,
      selectedKeys,
      toolName,
      toolDescriptions,
    ]
  );

  const agent = useYuktaiGridAgent<T>({
    tools,
    data,
    locale: toolLocale,
    columns: toolColumns,
    rowKey: String(rowKey),
    customRules,
    onResult: onAgentResult,
  });

  // WebMCP calls go through the Agent too, so history / loading / onAgentResult
  // cover assistant AND external agents. Names/schemas are unchanged, so data
  // changes never cause re-registration.
  const webmcpTools = useMemo<GridTool[]>(
    () =>
      tools.map((tool) => ({
        ...tool,
        // executeTool never returns NOT_UNDERSTOOD (only ask() does), so this is a GridToolResult
        execute: (input: Record<string, unknown>) =>
          agent.executeTool(tool.name, input) as Promise<GridToolResult>,
      })),
    [tools, agent.executeTool]
  );

  const clearAgentFilters = () => {
    setFilters([]);
    setPage(1);
  };

  const renderValue = (
    row: T,
    column: GridColumn<T>,
    index: number
  ) => {
    if (column.render) {
      return column.render(
        row[column.key as keyof T],
        row,
        index
      );
    }

    const value =
      row[column.key as keyof T];

    if (value == null) {
      return "";
    }

    if (column.type === "date") {
      const date = new Date(
        String(value)
      );

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(
          locale
        );
      }
    }

    if (column.type === "boolean") {
      return value ? t.yes : t.no;
    }

    return String(value);
  };

  const dark =
    theme === "dark";

  const highContrast =
    theme === "high-contrast";

  const dyslexia =
    theme === "dyslexia";

  // v5.3.14 — every colour is a CSS custom property with the old colour as the
  // fallback, so the grid looks the same until an app sets --yk-grid-* in CSS.
  const C = gridColors(dark);

  const containerStyle: React.CSSProperties =
    {
      width: "100%",
      overflow: "hidden",
      border: highContrast
        ? `2px solid ${C.hcBorder}`
        : `1px solid ${C.border}`,
      borderRadius: 12,
      background: C.bg,
      color: C.text,
      fontFamily: dyslexia
        ? "Arial, sans-serif"
        : undefined,
    };

  const headerStyle: React.CSSProperties =
    {
      padding: 12,
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      borderBottom: `1px solid ${C.border}`,
    };

  const iconButtonStyle =
    (
      disabled: boolean
    ): React.CSSProperties => ({
      width: 40,
      height: 40,
      minWidth: 40,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      borderRadius: 8,
      border: `1px solid ${C.control}`,
      background: disabled
        ? C.controlMuted
        : C.controlBg,
      color: disabled
        ? C.disabled
        : C.text,
      cursor: disabled
        ? "not-allowed"
        : "pointer",
      opacity: disabled ? 0.55 : 1,
    });

  if (loading) {
    return (
      <div
        className={`yk-grid ${className}`.trim()}
        style={containerStyle}
      >
        {/* keep tools registered while loading, so agents don't see them flicker */}
        {webmcp && (
          <YuktaiGridWebMCP<T>
            tools={webmcpTools}
            onStatusChange={onWebMCPStatusChange}
          />
        )}
        <div
          style={{
            padding: 32,
            textAlign: "center",
          }}
        >
          {t.loading}
        </div>
      </div>
    );
  }

  const aiColumns: {
    key: string;
    label: string;
    type: "number" | "text" | "date";
  }[] = columns.map((column) => ({
    key: String(column.key),
    label: column.label,
    type:
      column.type === "number"
        ? "number"
        : column.type === "date"
        ? "date"
        : "text",
  }));

  return (
    <div
      className={`yk-grid ${className}`.trim()}
      style={containerStyle}
    >
      {webmcp && (
        <YuktaiGridWebMCP<T>
          tools={webmcpTools}
          onStatusChange={onWebMCPStatusChange}
        />
      )}

      {(search || aiEnabled || filters.length > 0) && (
        <div className="yk-grid__toolbar" style={headerStyle}>
          {search && (
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  color: C.muted,
                  pointerEvents: "none",
                }}
              >
                <SearchIcon
                  size={19}
                />
              </div>

              <input
                value={searchText}
                onChange={(event) => {
                  setSearchText(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder={t.search}
                aria-label={
                  t.searchAria
                }
                style={{
                  width: "100%",
                  padding:
                    "10px 12px 10px 40px",
                  borderRadius: 8,
                  border: `1px solid ${C.control}`,
                  background: C.controlBg,
                  color: C.controlText,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {filters.length > 0 && (
            <button
              type="button"
              onClick={clearAgentFilters}
              title={t.clearFilters}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${C.control}`,
                background: C.chip,
                color: "inherit",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {t.filtersActive(filters.length)} ✕
            </button>
          )}

          <div
            style={{
              marginLeft: "auto",
              fontSize: 13,
              opacity: 0.7,
              whiteSpace: "nowrap",
            }}
          >
            {rows.length}{" "}
            {rows.length === 1
              ? t.row
              : t.rows}
            {showSearchTime && run.engine && (
              <span title={run.engine === "rust" ? "Rust (WebAssembly)" : "TypeScript"}>
                {" · "}
                {formatSearchTime(run.ms)}
                {" · "}
                {run.engine === "rust" ? "Rust" : "TS"}
              </span>
            )}
          </div>

          {aiEnabled && (
            <YuktaiGridAI<T>
              data={data}
              columns={aiColumns}
              onSearch={handleAISearch}
              onSort={handleAISort}
              theme={
                dark
                  ? "dark"
                  : "light"
              }
              language={language}
              inputLanguage={inputLanguage ?? language}
              agent={{ ask: agent.ask, loading: agent.loading }}
              embedded
            />
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          {empty ?? t.noData}
        </div>
      ) : isCardView ? (
        <div className="yk-grid__cards"
          style={{
            display: "grid",
            gap: 12,
            padding: 12,
          }}
        >
          {displayedRows.map(
            (row, index) => {
              const id = getId(row);
              const selected =
                isSelected(id);
              const highlighted =
                isHighlighted(id);

              return (
                <div className="yk-grid__card"
                  key={id}
                  data-yuktai-row-id={id}
                  role="group"
                  aria-label={id}
                  // clickable cards open with Enter or Space too
                  {...(onRowClick
                    ? {
                        tabIndex: 0,
                        title: t.openRow,
                        onClick: () => onRowClick(row, index),
                        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => openOnKey(event, () => onRowClick(row, index)),
                      }
                    : {})}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background:
                      highlighted
                        ? highlightColor
                        : selected
                        ? C.selected
                        : C.controlBg,
                    cursor: onRowClick
                      ? "pointer"
                      : "default",
                  }}
                >
                  {selectable && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelection(
                          row
                        );
                      }}
                      aria-label={`${t.selectRow} ${id}`}
                      aria-pressed={selected}
                      style={{
                        width: 32,
                        height: 32,
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        padding: 0,
                        marginBottom: 10,
                        borderRadius: 7,
                        border: selected
                          ? `1px solid ${C.accent}`
                          : `1px solid ${C.cardCheck}`,
                        background:
                          selected
                            ? C.accent
                            : "transparent",
                        color: selected
                          ? C.accentText
                          : "currentColor",
                        cursor:
                          "pointer",
                      }}
                    >
                      {selected && (
                        <CheckIcon
                          size={17}
                        />
                      )}
                    </button>
                  )}

                  {columns.map(
                    (column) => (
                      <div
                        key={String(
                          column.key
                        )}
                        style={{
                          display: "flex",
                          gap: 8,
                          padding:
                            "5px 0",
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <strong
                          style={{
                            minWidth: 100,
                            opacity: 0.7,
                          }}
                        >
                          {column.label}
                        </strong>

                        <span>
                          {renderValue(
                            row,
                            column,
                            index
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className={virtual ? "yk-grid__scroll yk-grid__scroll--all" : "yk-grid__scroll"}
          ref={virtual ? listRef : undefined}
          {...(virtual
            ? { tabIndex: 0, role: "region", "aria-label": t.listLabel }
            : {})}
          style={{
            width: "100%",
            overflowX: "auto",
            ...(virtual
              ? { height: listHeight, overflowY: "auto" as const, overscrollBehavior: "contain" as const }
              : {}),
          }}
        >
          <table className="yk-grid__table"
            {...(virtual ? { "aria-rowcount": rows.length + 1 } : {})}
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              ...(virtual ? { tableLayout: "fixed" as const, minWidth: tableMinWidth } : {}),
            }}
          >
            <thead className="yk-grid__head"
              style={
                virtual
                  ? { position: "sticky", top: 0, zIndex: 1, background: C.bg }
                  : undefined
              }
            >
              <tr {...(virtual ? { "aria-rowindex": 1 } : {})}>
                {selectable && (
                  <th
                    scope="col"
                    style={{
                      padding: 10,
                      borderBottom:
                        `1px solid ${C.border}`,
                      width: 52,
                    }}
                  >
                    <span style={srOnly}>{t.selectColumn}</span>
                  </th>
                )}

                {columns
                  .filter(
                    (column) =>
                      !(
                        isMobile &&
                        column.hiddenOnMobile
                      )
                  )
                  .map(
                    (column) => {
                      const active =
                        sortKey ===
                        String(
                          column.key
                        );

                      return (
                        <th
                          key={String(
                            column.key
                          )}
                          onClick={() =>
                            handleSort(
                              column
                            )
                          }
                          style={{
                            padding: 10,
                            textAlign:
                              column.align ??
                              "left",
                            borderBottom:
                              `1px solid ${C.border}`,
                            whiteSpace:
                              "nowrap",
                            cursor:
                              column.sortable ===
                              false
                                ? "default"
                                : "pointer",
                            width:
                              column.width ?? (virtual ? 140 : undefined),
                            userSelect:
                              "none",
                            ...(virtual ? { overflow: "hidden", textOverflow: "ellipsis" } : {}),
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 5,
                            }}
                          >
                            {column.label}

                            {active &&
                              (sortDirection ===
                              "asc" ? (
                                <SortUpIcon
                                  size={
                                    17
                                  }
                                  label={
                                    t.sortAscending
                                  }
                                />
                              ) : (
                                <SortDownIcon
                                  size={
                                    17
                                  }
                                  label={
                                    t.sortDescending
                                  }
                                />
                              ))}
                          </span>
                        </th>
                      );
                    }
                  )}
              </tr>
            </thead>

            <tbody className="yk-grid__body">
              {virtual && topSpacer > 0 && (
                <tr aria-hidden="true" style={{ height: topSpacer }}>
                  {/* empty spacer for virtual scrolling, hidden from screen readers */}
                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <td colSpan={colCount} style={{ padding: 0, border: 0 }} />
                </tr>
              )}
              {displayedRows.map(
                (row, index) => {
                  const id =
                    getId(row);

                  const selected =
                    isSelected(id);

                  const highlighted =
                    isHighlighted(id);

                  return (
                    <tr className="yk-grid__row"
                      key={id}
                      data-yuktai-row-id={id}
                      {...(virtual ? { "aria-rowindex": firstRow + index + 2 } : {})}
                      // clickable rows open with Enter or Space too
                      {...(onRowClick
                        ? {
                            tabIndex: 0,
                            onClick: () => onRowClick(row, index),
                            onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => openOnKey(event, () => onRowClick(row, index)),
                          }
                        : {})}
                      style={{
                        background:
                          highlighted
                            ? highlightColor
                            : selected
                            ? C.selected
                            : "transparent",
                        cursor:
                          onRowClick
                            ? "pointer"
                            : "default",
                        ...(virtual ? { height: rowHeight } : {}),
                      }}
                    >
                      {selectable && (
                        <td className="yk-grid__cell"
                          style={{
                            padding: virtual ? "0 10px" : 10,
                            borderBottom:
                              `1px solid ${C.border}`,
                            ...(virtual ? cellClip(rowHeight) : {}),
                          }}
                        >
                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();
                              toggleSelection(
                                row
                              );
                            }}
                            aria-label={`${t.selectRow} ${id}`}
                            aria-pressed={
                              selected
                            }
                            style={{
                              width: 28,
                              height: 28,
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              padding: 0,
                              borderRadius: 6,
                              border:
                                selected
                                  ? `1px solid ${C.accent}`
                                  : `1px solid ${C.check}`,
                              background:
                                selected
                                  ? C.accent
                                  : "transparent",
                              color:
                                selected
                                  ? C.accentText
                                  : "currentColor",
                              cursor:
                                "pointer",
                            }}
                          >
                            {selected && (
                              <CheckIcon
                                size={16}
                              />
                            )}
                          </button>
                        </td>
                      )}

                      {columns
                        .filter(
                          (column) =>
                            !(
                              isMobile &&
                              column.hiddenOnMobile
                            )
                        )
                        .map(
                          (
                            column
                          ) => (
                            <td className="yk-grid__cell"
                              key={String(
                                column.key
                              )}
                              style={{
                                padding: virtual ? "0 10px" : 10,
                                textAlign:
                                  column.align ??
                                  "left",
                                borderBottom:
                                  `1px solid ${C.border}`,
                                ...(virtual ? cellClip(rowHeight) : {}),
                              }}
                            >
                              {renderValue(
                                row,
                                column,
                                index
                              )}
                            </td>
                          )
                        )}
                    </tr>
                  );
                }
              )}
              {virtual && bottomSpacer > 0 && (
                <tr aria-hidden="true" style={{ height: bottomSpacer }}>
                  {/* empty spacer for virtual scrolling, hidden from screen readers */}
                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <td colSpan={colCount} style={{ padding: 0, border: 0 }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {paginationEnabled && (
        <div className="yk-grid__pager"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 12,
            flexWrap: "wrap",
            padding: 12,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <span style={{ opacity: 0.75 }} aria-live="polite">
              {showAll
                ? t.rowsRange(
                    (virtual ? firstRow + 1 : 1).toLocaleString(locale),
                    (virtual ? Math.min(rows.length, firstRow + Math.ceil(viewPx / rowHeight)) : rows.length).toLocaleString(locale),
                    rows.length.toLocaleString(locale)
                  )
                : `${t.page} ${page.toLocaleString(locale)} ${t.of} ${totalPages.toLocaleString(locale)}`}
            </span>
            {allowAll && rows.length > 0 && (
              <button
                type="button"
                className="yk-grid__show-all"
                aria-pressed={showAll}
                onClick={() => {
                  setPageSize(showAll ? configuredPageSize : 0);
                  setPage(1);
                }}
                style={{
                  minHeight: 40,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: `1px solid ${showAll ? C.control : C.accent}`,
                  background: showAll ? C.controlBg : C.accent,
                  color: showAll ? C.controlText : C.accentText,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {showAll ? t.showPages : `${t.showAll} (${rows.length.toLocaleString(locale)})`}
              </button>
            )}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {typeof pagination ===
              "object" &&
              pagination.showSizeChanger && (
                <select
                  value={showAll ? 0 : effectiveSize}
                  onChange={(event) => {
                    const nextSize =
                      Number(
                        event.target
                          .value
                      );

                    if (
                      !Number.isFinite(
                        nextSize
                      ) ||
                      nextSize < 0
                    ) {
                      return;
                    }

                    setPageSize(
                      nextSize
                    );
                    setPage(1);
                  }}
                  aria-label={
                    t.pageSize
                  }
                  style={{
                    minHeight: 40,
                    padding:
                      "7px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.control}`,
                    background: C.controlBg,
                    color: C.controlText,
                  }}
                >
                  {sizeOptions.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    )
                  )}
                  {allowAll && rows.length > 0 && (
                    <option value={0}>
                      {t.all} ({rows.length.toLocaleString(locale)})
                    </option>
                  )}
                </select>
              )}

            {showPageNumbers && (
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(1)}
                aria-label={t.first}
                title={t.first}
                style={iconButtonStyle(page <= 1)}
              >
                <ChevronLeftIcon size={16} />
                <ChevronLeftIcon size={16} />
              </button>
            )}

            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((value) =>
                  Math.max(
                    1,
                    value - 1
                  )
                )
              }
              aria-label={
                t.previous
              }
              title={t.previous}
              style={iconButtonStyle(
                page <= 1
              )}
            >
              <ChevronLeftIcon
                size={20}
              />
            </button>

            {showPageNumbers && totalPages > 1 && (
              <nav className="yk-grid__pages" aria-label={t.pages} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {pageWindow(page, totalPages).map((n, i) =>
                  n === 0 ? (
                    <span key={`gap${i}`} aria-hidden="true" style={{ alignSelf: "center", padding: "0 2px" }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      aria-label={`${t.page} ${n}`}
                      style={{
                        ...iconButtonStyle(false),
                        width: "auto",
                        minWidth: 40,
                        padding: "0 8px",
                        fontWeight: n === page ? 700 : 400,
                        background: n === page ? C.accent : C.controlBg,
                        color: n === page ? C.accentText : C.controlText,
                        borderColor: n === page ? C.accent : undefined,
                      }}
                    >
                      {n.toLocaleString(locale)}
                    </button>
                  )
                )}
              </nav>
            )}

            <button
              type="button"
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage((value) =>
                  Math.min(
                    totalPages,
                    value + 1
                  )
                )
              }
              aria-label={t.next}
              title={t.next}
              style={iconButtonStyle(
                page >= totalPages
              )}
            >
              <ChevronRightIcon
                size={20}
              />
            </button>

            {showPageNumbers && (
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                aria-label={t.last}
                title={t.last}
                style={iconButtonStyle(page >= totalPages)}
              >
                <ChevronRightIcon size={16} />
                <ChevronRightIcon size={16} />
              </button>
            )}

            {showPageNumbers && totalPages > 7 && (
              <form
                className="yk-grid__goto"
                onSubmit={(event) => {
                  event.preventDefault();
                  const input = event.currentTarget.elements.namedItem("page") as HTMLInputElement | null;
                  const n = Math.round(Number(input?.value));
                  if (Number.isFinite(n)) setPage(Math.min(totalPages, Math.max(1, n)));
                }}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  {t.goTo}
                  <input
                    name="page"
                    type="number"
                    min={1}
                    max={totalPages}
                    defaultValue={page}
                    key={page}
                    inputMode="numeric"
                    style={{
                      width: 90,
                      minHeight: 40,
                      padding: "7px 8px",
                      borderRadius: 8,
                      border: `1px solid ${C.control}`,
                      background: C.controlBg,
                      color: C.controlText,
                    }}
                  />
                </label>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default YuktaiGrid;