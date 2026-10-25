import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, CSSProperties } from 'react';
export { AbcIcon, AccessibilityIcon, AdminIcon, AlertIcon, AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, ApiIcon, ArchitectureIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BarChartIcon, BoldIcon, BookIcon, BookmarkIcon, BrainIcon, BugReportIcon, BulbIcon, CakeIcon, CalendarIcon, CardsIcon, ChatIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsIcon, CleaningIcon, ClockIcon, CloseIcon, CloudIcon, CodeIcon, ComputerIcon, ContrastIcon, CopyIcon, DashboardIcon, DataObjectIcon, DeleteIcon, DocumentScannerIcon, DownloadIcon, DragHandleIcon, ExploreIcon, ExternalIcon, EyeIcon, EyeOffIcon, FactCheckIcon, FileIcon, FilterIcon, FirstIcon, FontIcon, FormIcon, FullscreenExitIcon, FullscreenIcon, GavelIcon, GiftIcon, GlobeIcon, GridIcon, HeadphonesIcon, HeartFilledIcon, HeartIcon, HelpIcon, HomeIcon, HubIcon, ICON_MIN_CONTRAST, ICON_NAMES, ICON_PATHS, IconBase, IconName, IconProps, IconShape, IconSvgOptions, IconVariant, ImageIcon, ImageSearchIcon, InfoIcon, InsightsIcon, InstallIcon, IntegrationIcon, ItalicIcon, JoinIcon, KeyIcon, KeyboardIcon, LabelIcon, LampIcon, LastIcon, LayoutIcon, LinkIcon, LoaderIcon, LockIcon, LoginIcon, LogoutIcon, MapIcon, MeditateIcon, MenuIcon, MergeIcon, MicIcon, MinusIcon, MoonIcon, MotionIcon, MovieIcon, MusicIcon, MusicOffIcon, MusicVideoIcon, NamaskarIcon, PageBreakIcon, PaletteIcon, PauseIcon, PenIcon, PersonIcon, PhoneIcon, PinIcon, PlayIcon, PlugIcon, PlusIcon, QuoteIcon, RadioCheckedIcon, RadioIcon, ReadingIcon, RedoIcon, RepeatIcon, ResetIcon, RobotIcon, SaveIcon, SchoolIcon, SearchIcon, SearchOffIcon, SendIcon, SentimentSadIcon, ShareIcon, ShieldCheckIcon, ShuffleIcon, SkipIcon, SlideshowIcon, SortDownIcon, SortIcon, SortUpIcon, SparkIcon, SpeakerIcon, SpeedIcon, SpellcheckIcon, StarIcon, StopIcon, StorageIcon, StyleIcon, SunIcon, SunriseIcon, SunsetIcon, SwapIcon, TargetIcon, TempleIcon, TextIcon, TitleIcon, ToolsIcon, TouchIcon, TrendingDownIcon, TrendingUpIcon, TrophyIcon, UnderlineIcon, UndoIcon, UnlockIcon, UploadIcon, UsersIcon, VolumeOffIcon, VolunteerIcon, WalletIcon, WandIcon, WifiIcon, WifiOffIcon, YuktaiIcon, YuktaiIconProps, ZoomInIcon, ZoomOutIcon, iconContrast, iconSvg, pickGlyphColor } from './icons.mjs';

interface Plugin {
    name: string;
    execute(input: any): any | Promise<any>;
}
declare class Runtime {
    private plugins;
    register(name: string, plugin: Plugin): void;
    /**
     * 🔹 Direct Plugin Access
     * This is what YuktAI.use(name) calls.
     */
    use(name: string): Plugin | undefined;
    /**
     * 🔹 Run task
     */
    run(task: string, input: unknown): Promise<unknown>;
    getPlugins(): string[];
}

type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia";
type Severity = "critical" | "serious" | "moderate" | "minor";
type AlertType = "success" | "error" | "info" | "warning";
interface A11yConfig {
    enabled: boolean;
    highContrast?: boolean;
    darkMode?: boolean;
    reduceMotion?: boolean;
    autoFix?: boolean;
    fontSizeMultiplier?: number;
    colorBlindMode?: ColorBlindMode;
    keyboardHints?: boolean;
    speechEnabled?: boolean;
    showPreferencePanel?: boolean;
    showAuditBadge?: boolean;
    showSkipLinks?: boolean;
    largeTargets?: boolean;
    timeoutWarning?: number;
    dyslexiaFont?: boolean;
    localFont?: string;
    plainEnglish?: boolean;
    summarisePage?: boolean;
    translateLanguage?: string;
    voiceControl?: boolean;
    smartLabels?: boolean;
}
interface A11yFix {
    tag: string;
    fix: string;
    severity: Severity;
    element: string;
}
interface A11yReport {
    fixed: number;
    scanned: number;
    renderTime: number;
    score: number;
    details: A11yFix[];
}
declare function speak(text: string, priority?: "polite" | "assertive"): void;
declare function showVisualAlert(message: string, type?: AlertType): void;
declare function announce(message: string, type?: AlertType, useSpeech?: boolean): void;
declare function trapFocus(modal: HTMLElement): void;
declare function handlePlainEnglish(enabled: boolean): Promise<void>;
declare function handleSummarisePage(enabled: boolean): Promise<void>;
declare function handleTranslate(language: string): Promise<void>;
declare function handleVoiceControl(enabled: boolean): Promise<void>;
declare function handleSmartLabels(enabled: boolean): Promise<void>;
declare const wcagPlugin: {
    name: string;
    version: string;
    observer: MutationObserver | null;
    execute(config: A11yConfig): Promise<string>;
    applyFixes(config: A11yConfig): A11yReport;
    scan(): A11yReport;
    startObserver(config: A11yConfig): void;
    stopObserver(): void;
    announce: typeof announce;
    speak: typeof speak;
    showVisualAlert: typeof showVisualAlert;
    trapFocus: typeof trapFocus;
    handlePlainEnglish: typeof handlePlainEnglish;
    handleSummarisePage: typeof handleSummarisePage;
    handleTranslate: typeof handleTranslate;
    handleVoiceControl: typeof handleVoiceControl;
    handleSmartLabels: typeof handleSmartLabels;
    SUPPORTED_LANGUAGES: {
        code: string;
        label: string;
    }[];
};

interface YuktAIWrapperProps {
    position?: "left" | "right";
    children: ReactNode;
    config?: Partial<A11yConfig>;
    showRag?: boolean;
    showAgent?: boolean;
}
declare function YuktAIWrapper({ position, children, config: configOverrides, showRag, showAgent, }: YuktAIWrapperProps): react_jsx_runtime.JSX.Element;

declare const aiPlugin: {
    name: string;
    execute(input: string): Promise<string>;
};

declare const voicePlugin: {
    name: string;
    execute(input: string): Promise<string>;
};

/** Which engine sorts and searches the grid. */
type GridEngine = "ts" | "rust" | "auto";
/** `engine: "auto"` switches to Rust from this many rows. */
declare const RUST_AUTO_MIN_ROWS = 10000;
declare function wantsRustEngine(engine: GridEngine | undefined, rowCount: number): boolean;
/**
 * Compiles the Rust engine once per page. Resolves `null` when WebAssembly is
 * not available; the grid then simply keeps using TypeScript.
 */
declare function loadGridCore(): Promise<WebAssembly.Module | null>;
/**
 * One engine per grid. Holds that grid's search text inside the WebAssembly
 * memory, so each keystroke only sends the query.
 */
declare class GridCore {
    private readonly x;
    private readonly base;
    private readonly encoder;
    private offsetsPtr;
    private textPtr;
    private textLen;
    private rows;
    private hasIndex;
    private freePtr;
    private constructor();
    /** Creates an engine from a compiled module (default: the one already loaded). */
    static create(mod?: WebAssembly.Module | null): GridCore | null;
    private ensure;
    /**
     * Stores one search text per row (the grid joins its columns with
     * SEARCH_SEPARATOR). Returns false when Rust can't match TypeScript
     * exactly for this data; the grid then searches in TypeScript.
     */
    setSearchTexts(texts: string[]): boolean;
    /**
     * Positions (in the array given to setSearchTexts) of the rows whose text
     * contains `query`, in original order. Null means "use TypeScript".
     */
    search(query: string): Uint32Array | null;
    /**
     * Row positions sorted by `keys` (NaN = empty, always last; equal keys keep
     * their order). Null means "use TypeScript".
     */
    sortByKeys(keys: Float64Array, desc: boolean): Uint32Array | null;
}

/** One search/sort run: what was searched, how long it took, which engine answered. */
interface GridSearchTime {
    /** The search text ("" when only sorting) */
    query: string;
    /** Milliseconds for search + filters + sort */
    ms: number;
    /** Rows after search and filters */
    rows: number;
    engine: "rust" | "ts";
}
interface GridColumn<T = Record<string, unknown>> {
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
type SortDirection = "asc" | "desc" | null;
interface SortConfig {
    key: string;
    direction: SortDirection;
}
type FilterOperator = "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan" | "between";
interface FilterConfig {
    key: string;
    operator: FilterOperator;
    value: string | number | [number, number];
}
type ViewMode = "table" | "card" | "auto";
type GridTheme = "default" | "high-contrast" | "dark" | "color-blind" | "dyslexia";
type IndicLanguageLocale = "as-IN" | "bn-IN" | "brx-IN" | "doi-IN" | "gu-IN" | "hi-IN" | "kn-IN" | "ks-IN" | "kok-IN" | "mai-IN" | "ml-IN" | "mni-IN" | "mr-IN" | "ne-IN" | "or-IN" | "pa-IN" | "sa-IN" | "sat-IN" | "sd-IN" | "ta-IN" | "te-IN" | "ur-IN";
type GridLocale = "en-IN" | "en-US" | IndicLanguageLocale;
type GridInputLanguage = GridLocale;
interface AIFeatures {
    search?: boolean;
    summary?: boolean;
    anomaly?: boolean;
    suggest?: boolean;
}
interface VoiceFeatures {
    control?: boolean;
    speakOnFocus?: boolean;
    speakSummary?: boolean;
    language?: string;
}
interface PaginationConfig {
    pageSize?: number;
    showSizeChanger?: boolean;
    sizeOptions?: number[];
}
interface GridTranslations {
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
interface YuktaiGridRuleContext<T = Record<string, unknown>> {
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
interface YuktaiGridRule<T = Record<string, unknown>> {
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
interface YuktaiGridProps<T = Record<string, unknown>> {
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
     * - "ts" (default): TypeScript, as before
     * - "rust": the Rust (WebAssembly) engine, about 13 KB, embedded
     * - "auto": Rust from 10,000 rows, TypeScript below
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

declare function YuktaiGrid<T extends Record<string, unknown>>({ data, columns, rowKey, view, mobileBreakpoint, theme, locale, ai, search, selectable, selectedKeys, onSelectionChange, pagination, loading, highlightIds, highlightColor, autoScrollToHighlight, onRowClick, onSortChange, empty, className, inputLanguage, toolName, toolDescriptions, webmcp, onWebMCPStatusChange, onAgentResult, customRules, engine, showSearchTime, onSearchTime, }: YuktaiGridProps<T>): react_jsx_runtime.JSX.Element;

/**
 * gridTools — the ONE place where YuktaiGrid tools are defined.
 *
 * Both the in-page Agent (useYuktaiGridAgent) and WebMCP (YuktaiGridWebMCP)
 * should get their tools from `createGridTools()`, so the list an agent sees
 * can never drift from the list the UI shows.
 *
 * Rules every tool follows:
 *  1. One row-ID strategy: `getRowId(row, context.rowKey)` everywhere.
 *     `rowKey` must match YuktaiGrid's `rowKey` prop (default "id").
 *  2. One result shape: { success, message, data?, error?: { code } }.
 *  3. Never claim success for something that didn't happen:
 *     missing callback → NOT_SUPPORTED, unknown row → NOT_FOUND.
 *  4. Never throw: tool execution is wrapped, errors become INTERNAL results.
 *
 * Backward compatible with 4.6.x: the existing exports keep their names and
 * parameters; results only gain an optional `error` field.
 */
type GridToolColumn = {
    key: string;
    label: string;
    type?: "text" | "number" | "date";
};
type GridToolErrorCode = "NOT_FOUND" | "NOT_SUPPORTED" | "INVALID_INPUT" | "INTERNAL";
type GridToolFilterOperator = "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan" | "between";
type GridToolFilter = {
    key: string;
    operator: GridToolFilterOperator;
    value: string | number | [number, number];
};
type GridToolSort = {
    key: string;
    direction: "asc" | "desc";
};
/** Language of `message` (shown to people). Agent descriptions stay English. */
type GridToolLocale = "en" | "te";
type GridToolContext<T> = {
    data: T[];
    columns: GridToolColumn[];
    /** Field used as the row ID by every tool (default "id"). Match YuktaiGrid's rowKey. */
    rowKey?: string;
    /** Language for result messages (default "en"). */
    locale?: GridToolLocale;
    /** Filters currently applied, so a new filter can be merged in. */
    filters?: GridToolFilter[];
    onSelectRow?: (id: string) => void;
    onHighlightRows?: (ids: string[]) => void;
    onOpenRow?: (id: string) => void;
    onFiltersChange?: (filters: GridToolFilter[]) => void;
    onSortChange?: (sort: GridToolSort | null) => void;
};
type GridToolResult<T = unknown> = {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: GridToolErrorCode;
    };
};
/** A tool ready for the Agent and for WebMCP `registerTool`. */
type GridTool = {
    name: string;
    title: string;
    /** For AI agents (English works best for tool selection). Never shown in the UI. */
    description: string;
    /** Short label for the UI, in the grid's locale. */
    label: string;
    inputSchema: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<GridToolResult>;
};
type CreateGridToolsOptions = {
    /** Tool name prefix, e.g. "ratnalabala_poems" → "ratnalabala_poems_search". */
    name?: string;
    /** Override agent descriptions per tool, keyed by the short tool id ("search", "open", …). */
    descriptions?: Partial<Record<GridToolId, string>>;
};
type GridToolId = "search" | "count" | "columns" | "get_row" | "highlight" | "select" | "open" | "filter" | "clear_filters" | "sort" | "clear_sort";
/** The single row-ID rule used by every tool. */
declare function getRowId(row: unknown, rowKey?: string): string;
/**
 * Applies filters to rows — exported so YuktaiGrid filters its rows with
 * exactly the same rules the filter tool uses to count matches.
 */
declare function applyGridFilters<T>(data: T[], columns: GridToolColumn[], filters: GridToolFilter[]): T[];
/** Maps grid columns (any type) to tool columns (text / number / date). */
declare function toGridToolColumns(columns: {
    key: string;
    label: string;
    type?: string;
}[]): GridToolColumn[];
declare function searchGrid<T extends Record<string, unknown>>(context: GridToolContext<T>, query: string): GridToolResult<T[]>;
declare function countGrid<T>(context: GridToolContext<T>): GridToolResult<number>;
declare function getColumns<T>(context: GridToolContext<T>): GridToolResult<GridToolColumn[]>;
declare function getRow<T extends Record<string, unknown>>(context: GridToolContext<T>, id: string): GridToolResult<T>;
declare function highlightRows<T extends Record<string, unknown>>(context: GridToolContext<T>, ids: string[]): GridToolResult<string[]>;
declare function selectRow<T extends Record<string, unknown>>(context: GridToolContext<T>, id: string): GridToolResult<string>;
declare function openRow<T extends Record<string, unknown>>(context: GridToolContext<T>, id: string): GridToolResult<string>;
declare function filterGrid<T extends Record<string, unknown>>(context: GridToolContext<T>, filter: GridToolFilter): GridToolResult<{
    filters: GridToolFilter[];
    count: number;
}>;
declare function clearFilters<T>(context: GridToolContext<T>): GridToolResult<GridToolFilter[]>;
declare function sortGrid<T>(context: GridToolContext<T>, key: string, direction?: "asc" | "desc"): GridToolResult<GridToolSort>;
declare function clearSort<T>(context: GridToolContext<T>): GridToolResult<null>;
/**
 * Builds the tool list used by BOTH the Agent and WebMCP.
 * Only tools the grid can actually perform are included — e.g. "open" is
 * left out when no onOpenRow callback is given — so agents never see a tool
 * that would just return NOT_SUPPORTED.
 */
declare function createGridTools<T extends Record<string, unknown>>(context: GridToolContext<T>, options?: CreateGridToolsOptions): GridTool[];

interface UseGridOptions<T> {
    data: T[];
    columns: GridColumn<T>[];
    pagination?: boolean | PaginationConfig;
    mobileBreakpoint?: number;
    /** Locale for text sorting, e.g. "te-IN" (default: browser locale) */
    locale?: string;
    /** Starting filters (optional) */
    initialFilters?: GridToolFilter[];
    /**
     * Search and sort engine: "ts" (default), "rust" (always) or "auto" (Rust
     * from 10,000 rows). Same results either way; Rust is faster on big data.
     */
    engine?: GridEngine;
}
interface UseGridReturn<T> {
    displayedData: T[];
    /** All matching rows (search + filters + sort), before pagination */
    rows: T[];
    totalCount: number;
    filteredCount: number;
    sort: SortConfig | null;
    toggleSort: (key: string) => void;
    /** Set sort directly (null clears it) */
    setSort: (sort: SortConfig | null) => void;
    clearSort: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filters: GridToolFilter[];
    setFilters: (filters: GridToolFilter[]) => void;
    /** Add or replace the filter for one column */
    setFilter: (filter: GridToolFilter) => void;
    /** Remove the filter for one column */
    removeFilter: (key: string) => void;
    clearFilters: () => void;
    page: number;
    pageSize: number;
    totalPages: number;
    setPage: (p: number) => void;
    setPageSize: (s: number) => void;
    isMobile: boolean;
    reset: () => void;
    /** Last search/sort: time in ms and which engine answered (null when neither ran) */
    searchTime: GridSearchTime | null;
}
declare function useGrid<T extends Record<string, unknown>>(options: UseGridOptions<T>): UseGridReturn<T>;

type UILanguage = "en-US" | "te-IN";
type InputLanguage = GridInputLanguage;
interface YuktaiGridAIProps<T> {
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
declare function YuktaiGridAI<T extends Record<string, unknown>>({ data, columns, onSearch, onSort, theme, language, inputLanguage, embedded, agent, onInputLanguageChange, }: YuktaiGridAIProps<T>): react_jsx_runtime.JSX.Element;

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
type WebMCPState = "unsupported" | "registering" | "ready" | "partial" | "error";
type WebMCPStatus = {
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
type YuktaiGridWebMCPProps<T> = {
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
declare function YuktaiGridWebMCP<T extends Record<string, unknown>>({ tools: toolsProp, data, columns, rowKey, locale, onSelectRow, onHighlightRows, onOpenRow, name, descriptions, onStatusChange, }: YuktaiGridWebMCPProps<T>): null;

type GridAgentTool = {
    name: string;
    description: string;
    /** Optional UI label (e.g. Telugu). createGridTools() provides it. */
    label?: string;
    /** Optional JSON schema; its `required` list is checked before running. */
    inputSchema?: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
};
type GridAgentErrorCode = GridToolErrorCode | "NOT_UNDERSTOOD";
type GridAgentResult<T = unknown> = Omit<GridToolResult<T>, "error"> & {
    error?: {
        code: GridAgentErrorCode;
    };
    /** Full name of the tool that produced this result */
    tool?: string;
};
type GridAgentStep = {
    id: number;
    tool: string;
    input: Record<string, unknown>;
    result: GridAgentResult;
    source: "tool" | "ask";
    at: number;
};
type GridIntent = {
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
type GridIntentContext = {
    columns: {
        key: string;
        label: string;
    }[];
    locale: GridToolLocale;
};
type YuktaiGridAgentProps<T = Record<string, unknown>> = {
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
declare function parseGridIntent(text: string, context: GridIntentContext): GridIntent | null;
declare function useYuktaiGridAgent<T = Record<string, unknown>>({ tools, data, onResult, onError, locale, columns, rowKey, parseIntent: customParseIntent, customRules, historyLimit, }: YuktaiGridAgentProps<T>): {
    loading: boolean;
    tools: GridAgentTool[];
    executeTool: (name: string, input?: Record<string, unknown>) => Promise<GridAgentResult<unknown>>;
    ask: (text: string) => Promise<GridAgentResult>;
    lastResult: GridAgentResult<unknown> | null;
    lastError: Error | null;
    history: GridAgentStep[];
    clearHistory: () => void;
};

type AuditRoot = Document | Element;
/** The label a screen reader would most likely announce for this element. */
declare function accessibleName(el: Element): string;
type RGBA = {
    r: number;
    g: number;
    b: number;
    a: number;
};
declare function parseColor(value: string | null | undefined): RGBA | null;
declare function relativeLuminance(c: RGBA): number;
declare function contrastRatio(fg: RGBA, bg: RGBA): number;

type AuditSeverity = "critical" | "serious" | "moderate" | "minor";
type AuditRuleId = "html-lang" | "page-title" | "image-alt" | "heading-order" | "single-h1" | "landmark-main" | "form-label" | "button-name" | "link-name" | "color-contrast" | "positive-tabindex" | "keyboard-access" | "duplicate-id" | "form-error" | "target-size";
interface AuditIssue {
    /** Stable within one report, e.g. "image-alt-3". */
    id: string;
    rule: AuditRuleId;
    severity: AuditSeverity;
    /** WCAG success criterion, e.g. "1.1.1", or "best practice". */
    wcag: string;
    message: string;
    /** Why it matters, in plain English. */
    why: string;
    /** What to change. */
    fix: string;
    selector: string;
    snippet: string;
    /** True when the copilot can apply a safe fix in the browser. */
    autoFixable: boolean;
    element?: Element;
}
interface AuditCheck {
    rule: AuditRuleId;
    title: string;
    passed: boolean;
    issueCount: number;
}
interface AuditReport {
    url: string;
    title: string;
    generatedAt: string;
    score: number;
    passed: boolean;
    checks: AuditCheck[];
    issues: AuditIssue[];
    summary: string;
}
interface AuditOptions {
    root?: AuditRoot;
    /** Skip rules you don't need. */
    skip?: AuditRuleId[];
    /** Cap contrast checks on very large pages (default 600 elements). */
    maxContrastChecks?: number;
    /** Minimum interactive target size in CSS px (WCAG 2.5.8 uses 24). */
    minTargetSize?: number;
}
interface RuleInfo {
    title: string;
    wcag: string;
    severity: AuditSeverity;
    why: string;
}
declare const AUDIT_RULES: Record<AuditRuleId, RuleInfo>;
declare function runQaAudit(options?: AuditOptions): AuditReport;
/** Markdown report you can download, paste into a ticket or attach to a PR. */
declare function auditToMarkdown(report: AuditReport): string;
/** JSON without DOM references, safe to store or send to a server. */
declare function auditToJSON(report: AuditReport): string;

interface CopilotFixResult {
    issueId: string;
    applied: boolean;
    message: string;
}
interface CopilotState {
    report: AuditReport | null;
    watching: boolean;
    appliedFixes: number;
}
interface A11yCopilotOptions extends AuditOptions {
    /** Called after every scan (initial, manual or caused by DOM changes). */
    onUpdate?: (state: CopilotState) => void;
    /** Wait this long after DOM changes before rescanning (default 600ms). */
    debounceMs?: number;
    /** Apply every safe fix automatically after each scan (default false). */
    autoApply?: boolean;
    /** Language used when the page has no lang attribute (default: browser language). */
    defaultLang?: string;
}
interface A11yCopilot {
    start(): void;
    stop(): void;
    scan(): AuditReport;
    explain(issueId: string): string;
    applyFix(issueId: string): CopilotFixResult;
    applyAllFixes(): CopilotFixResult[];
    undoAll(): number;
    getState(): CopilotState;
}
declare function createA11yCopilot(options?: A11yCopilotOptions): A11yCopilot;

interface PageOutline {
    title: string;
    description: string;
    language: string;
    headings: Array<{
        level: number;
        text: string;
    }>;
    landmarks: Record<string, number>;
    counts: {
        links: number;
        buttons: number;
        images: number;
        forms: number;
        tables: number;
        fields: number;
    };
    unlabeledFields: Array<{
        type: string;
        hint: string;
        selector: string;
    }>;
    imagesWithoutAlt: Array<{
        src: string;
        selector: string;
    }>;
    purpose: string;
}
interface PageAnswer {
    intent: PageIntent;
    answer: string;
    /** Elements the answer refers to, so the UI can highlight them. */
    targets: string[];
    suggestions: string[];
}
type PageIntent = "purpose" | "missing-labels" | "images" | "structure" | "forms" | "links" | "counts" | "unknown";
declare function analyzePage(root?: AuditRoot): PageOutline;
declare function detectPageIntent(question: string): PageIntent;
/**
 * Answers a question about the current page.
 * @param summarize Optional hook (e.g. Gemini Nano or your own model) used for "purpose" questions.
 */
declare function askAboutPage(question: string, options?: {
    root?: AuditRoot;
    summarize?: (pageText: string) => Promise<string>;
}): Promise<PageAnswer>;

interface ParsedGridQuery {
    filters: GridToolFilter[];
    /** Free-text terms that didn't map to a column; matched across all columns. */
    search: string[];
    sort: GridToolSort | null;
    limit: number | null;
    /** Assumptions the parser made (shown to the user so they can correct it). */
    notes: string[];
    /** Plain-English reading of the query. */
    explanation: string;
}
interface GridQueryResult<T> {
    rows: T[];
    ids: string[];
    parsed: ParsedGridQuery;
    message: string;
}
type Row = Record<string, unknown>;
/** "₹10,000" → 10000, "1.5 lakh" → 150000, "2cr" → 20000000, "10k" → 10000. */
declare function parseAmount(text: string): number | null;
/** The column mentioned in `text` (longest name wins), or undefined. */
declare function findMentionedColumn(text: string, columns: GridToolColumn[], kind?: GridToolColumn["type"]): GridToolColumn | undefined;
interface ParseOptions<T = Row> {
    /** Rows let the parser recognise values like "overdue" in a Status column. */
    data?: T[];
}
declare function parseGridQuery<T = Row>(query: string, columns: GridToolColumn[], options?: ParseOptions<T>): ParsedGridQuery;
/** Runs a parsed query over rows without touching any UI. */
declare function executeGridQuery<T>(data: T[], columns: GridToolColumn[], parsed: ParsedGridQuery): T[];
/**
 * Parses and runs a natural-language query, then pushes the result into the
 * grid through the context callbacks (filters, sort, highlight).
 */
declare function runGridQuery<T>(query: string, context: GridToolContext<T>, options?: {
    apply?: boolean;
}): GridQueryResult<T>;
interface GridAnomaly {
    rowId: string;
    column: string;
    label: string;
    value: unknown;
    kind: "high" | "low" | "duplicate";
    reason: string;
}
/**
 * Finds unusual rows: numeric values far outside the typical range
 * (interquartile-range rule) and rows that duplicate another row.
 */
declare function detectAnomalies<T>(data: T[], columns: GridToolColumn[], options?: {
    rowKey?: string;
    factor?: number;
    columns?: string[];
}): GridAnomaly[];
declare function summarizeRows<T>(rows: T[], columns: GridToolColumn[]): string;
interface GridAnswer<T> {
    kind: "query" | "anomalies" | "summary";
    message: string;
    ids: string[];
    rows: T[];
    anomalies?: GridAnomaly[];
}
declare function answerGridQuestion<T>(question: string, context: GridToolContext<T>): GridAnswer<T>;

type GridNavAction = "next-row" | "previous-row" | "first-row" | "last-row" | "open-row";
type VoiceA11yCommand = {
    type: "setting";
    patch: Partial<A11yConfig>;
    say: string;
} | {
    type: "reset";
    say: string;
} | {
    type: "grid";
    action: GridNavAction;
    say: string;
};
declare const FONT_STEP = 0.1;
declare const FONT_MIN = 0.8;
declare const FONT_MAX = 1.3;
/**
 * Parses a transcript into a command. `current` is needed for relative
 * changes such as "bigger text". Returns null when nothing matched, so you
 * can pass the transcript on to other handlers (e.g. core/ai/voice.ts).
 */
declare function parseVoiceA11yCommand(transcript: string, current?: Partial<A11yConfig>): VoiceA11yCommand | null;
declare const DEFAULT_A11Y_SETTINGS: Partial<A11yConfig>;
declare function moveGridRowFocus(action: GridNavAction, options?: {
    root?: ParentNode;
    rowSelector?: string;
}): HTMLElement | null;
interface VoiceA11yControllerOptions {
    /** Current settings; the controller keeps its own copy after each change. */
    initial?: Partial<A11yConfig>;
    /**
     * Apply new settings. Default: yuktai's wcagPlugin.execute.
     * Pass your own to sync with WidgetPanel state or a settings store.
     */
    apply?: (config: A11yConfig) => unknown;
    /** Speech recognition language, e.g. "en-IN" or "te-IN" (default "en-IN"). */
    lang?: string;
    /** Speak a confirmation after each command (default true). */
    speak?: boolean;
    /** Called for every recognised transcript, matched or not. */
    onTranscript?: (text: string, command: VoiceA11yCommand | null) => void;
    gridRoot?: ParentNode;
}
declare function createVoiceA11yController(options?: VoiceA11yControllerOptions): {
    start: () => boolean;
    stop: () => void;
    /** Run a command from text (also handy for typed commands and tests). */
    handle: (transcript: string) => Promise<VoiceA11yCommand | null>;
    isListening: () => boolean;
    getConfig: () => {
        enabled: boolean;
        highContrast?: boolean;
        darkMode?: boolean;
        reduceMotion?: boolean;
        autoFix?: boolean;
        fontSizeMultiplier?: number;
        colorBlindMode?: ColorBlindMode;
        keyboardHints?: boolean;
        speechEnabled?: boolean;
        showPreferencePanel?: boolean;
        showAuditBadge?: boolean;
        showSkipLinks?: boolean;
        largeTargets?: boolean;
        timeoutWarning?: number;
        dyslexiaFont?: boolean;
        localFont?: string;
        plainEnglish?: boolean;
        summarisePage?: boolean;
        translateLanguage?: string;
        voiceControl?: boolean;
        smartLabels?: boolean;
    };
};

type FormFindingLevel = "problem" | "improvement";
interface FormField {
    label: string;
    type: string;
    name: string;
    required: boolean;
    hasVisibleLabel: boolean;
    selector: string;
    element: Element;
}
interface FormFinding {
    level: FormFindingLevel;
    message: string;
    suggestion: string;
    field?: string;
    selector?: string;
}
interface FormReview {
    name: string;
    selector: string;
    fields: FormField[];
    findings: FormFinding[];
    /** 0–100, higher is easier to complete. */
    score: number;
    summary: string;
}
interface FormReviewOptions {
    root?: AuditRoot;
    /** Extra checks for older users: font size, field count, vague buttons (default true). */
    seniorFriendly?: boolean;
    /** Forms with more fields than this get a "split into steps" suggestion (default 8). */
    maxFieldsPerStep?: number;
}
declare function readFormFields(form: Element): FormField[];
declare function reviewForm(form: Element, options?: FormReviewOptions): FormReview;
/** Reviews every <form> (and every role="form") on the page. */
declare function reviewForms(options?: FormReviewOptions): FormReview[];

interface ContextPassage {
    id: string;
    source: "page" | "grid" | "custom";
    text: string;
    /** Grid row id or page section heading. */
    ref?: string;
}
interface ContextHit extends ContextPassage {
    score: number;
}
interface ContextAnswer {
    answer: string;
    hits: ContextHit[];
    /** True when `generate` produced the answer; false for extractive answers. */
    generated: boolean;
}
/** Unicode-aware tokens: keeps Telugu/Devanagari combining marks together. */
declare function tokenize(text: string): string[];
declare function pagePassages(root?: AuditRoot, maxChars?: number): ContextPassage[];
declare function gridPassages<T>(data: T[], columns: GridToolColumn[], rowKey?: string): ContextPassage[];
interface ContextIndexOptions<T = Record<string, unknown>> {
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
     * Search engine: "ts" (default), "rust" (always) or "auto" (Rust from 1,000
     * passages). Same passages, same scores, same order; Rust is faster on long
     * pages and big grids. Works offline (the engine is embedded).
     */
    engine?: GridEngine;
}
declare function createContextIndex<T>(options?: ContextIndexOptions<T>): {
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
    whenEngineReady: () => Promise<"ts" | "rust">;
};

type TaskAction = "filter" | "highlight" | "sort" | "clear" | "count" | "summarize" | "anomalies" | "open" | "select";
interface PlannedStep {
    action: TaskAction;
    /** The part of the instruction this step came from. */
    text: string;
}
interface StepResult extends PlannedStep {
    success: boolean;
    message: string;
    ids?: string[];
}
interface TaskRunResult {
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
declare function planTasks(instruction: string): PlannedStep[];
interface RunTasksOptions {
    /** Called after each step, so the UI can show progress. */
    onStep?: (result: StepResult, index: number, total: number) => void;
}
declare function runTasks<T extends Record<string, unknown>>(instruction: string, context: GridToolContext<T>, options?: RunTasksOptions): Promise<TaskRunResult>;

type Aggregation = "sum" | "avg" | "count" | "min" | "max";
type Period = "day" | "week" | "month" | "quarter" | "year";
interface GroupResult {
    group: string;
    value: number;
    count: number;
}
interface PeriodChange {
    group: string;
    current: number;
    previous: number;
    change: number;
    /** null when the previous value was 0 */
    changePct: number | null;
}
interface PeriodComparison {
    period: Period;
    current: {
        from: Date;
        to: Date;
    };
    previous: {
        from: Date;
        to: Date;
    };
    rows: PeriodChange[];
}
declare function aggregate(values: number[], agg: Aggregation): number;
/** Groups rows by a column and aggregates a metric (or counts rows). Sorted high → low. */
declare function groupBy<T>(data: T[], groupKey: string, metricKey: string | null, agg?: Aggregation): GroupResult[];
declare function startOfPeriod(date: Date, period: Period, weekStartsOn?: number): Date;
declare function addPeriods(date: Date, period: Period, n: number): Date;
interface ComparePeriodsOptions {
    dateKey: string;
    metricKey: string;
    groupKey?: string;
    agg?: Aggregation;
    period: Period;
    /** "Now" for the comparison (default: today). */
    referenceDate?: Date | string;
    /**
     * true (default): compare the same elapsed time — e.g. Mon–Wed this week
     * vs Mon–Wed last week — so a half-finished week doesn't look like a drop.
     */
    toDate?: boolean;
    weekStartsOn?: number;
}
declare function comparePeriods<T>(data: T[], o: ComparePeriodsOptions): PeriodComparison;
/** Time series: one aggregated value per period, oldest first. */
declare function trend<T>(data: T[], dateKey: string, metricKey: string, period: Period, agg?: Aggregation): Array<{
    start: Date;
    value: number;
}>;
interface InsightAnswer {
    kind: "period-change" | "group" | "trend" | "total" | "unknown";
    answer: string;
    table: Array<Record<string, string | number>>;
}
declare function askInsight<T>(question: string, data: T[], columns: GridToolColumn[], options?: {
    referenceDate?: Date | string;
}): InsightAnswer;

type DesignCategory = "hierarchy" | "readability" | "interaction" | "clutter" | "consistency";
interface DesignFinding {
    category: DesignCategory;
    severity: "high" | "medium" | "low";
    message: string;
    suggestion: string;
    selector?: string;
}
interface DesignReview {
    score: number;
    categories: Record<DesignCategory, {
        score: number;
        findings: number;
    }>;
    findings: DesignFinding[];
    summary: string;
}
interface DesignReviewOptions {
    root?: AuditRoot;
    /** Minimum body text size in px (default 14; 16 recommended for seniors). */
    minFontSize?: number;
    /** Maximum comfortable line length in characters (default 90). */
    maxLineLength?: number;
}
declare function reviewDesign(options?: DesignReviewOptions): DesignReview;

interface UseAgenticGridOptions<T> {
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
type AgenticAnswerKind = "query" | "anomalies" | "summary" | "insight" | "tasks";
declare function useAgenticGrid<T extends Record<string, unknown>>(options: UseAgenticGridOptions<T>): {
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
declare function AgenticGridBar({ grid, placeholder, examples, style, }: {
    grid: ReturnType<typeof useAgenticGrid<any>>;
    placeholder?: string;
    examples?: string[];
    style?: CSSProperties;
}): react_jsx_runtime.JSX.Element;
type Tab = "copilot" | "qa" | "forms" | "design" | "ask" | "voice";
interface AgenticPanelProps {
    defaultTab?: Tab;
    /** Speech recognition language for the Voice tab (default "en-IN"). */
    voiceLang?: string;
    /** Optional model hook for Ask page, e.g. Gemini Nano or your own API. */
    generate?: (question: string, context: string) => Promise<string>;
    /** Ask page search engine: "ts" (default), "rust" or "auto". Same answers; Rust is faster on long pages. */
    engine?: GridEngine;
    style?: CSSProperties;
}
declare function AgenticPanel({ defaultTab, voiceLang, generate, engine, style }: AgenticPanelProps): react_jsx_runtime.JSX.Element;

declare global {
    var __yuktai_runtime__: Runtime | undefined;
}
declare const YuktAI: {
    wcagPlugin: {
        name: string;
        version: string;
        observer: MutationObserver | null;
        execute(config: A11yConfig): Promise<string>;
        applyFixes(config: A11yConfig): A11yReport;
        scan(): A11yReport;
        startObserver(config: A11yConfig): void;
        stopObserver(): void;
        announce: (message: string, type?: AlertType, useSpeech?: boolean) => void;
        speak: (text: string, priority?: "polite" | "assertive") => void;
        showVisualAlert: (message: string, type?: AlertType) => void;
        trapFocus: (modal: HTMLElement) => void;
        handlePlainEnglish: (enabled: boolean) => Promise<void>;
        handleSummarisePage: (enabled: boolean) => Promise<void>;
        handleTranslate: (language: string) => Promise<void>;
        handleVoiceControl: (enabled: boolean) => Promise<void>;
        handleSmartLabels: (enabled: boolean) => Promise<void>;
        SUPPORTED_LANGUAGES: {
            code: string;
            label: string;
        }[];
    };
    list(): string[];
    use(name: string): Plugin | undefined;
    fix(config?: Partial<A11yConfig>): A11yReport;
    scan(): A11yReport;
};

export { type A11yConfig, type A11yCopilot, type A11yCopilotOptions, type A11yFix, type A11yReport, type AIFeatures, AUDIT_RULES, type AgenticAnswerKind, AgenticGridBar, AgenticPanel, type AgenticPanelProps, type Aggregation, type AuditCheck, type AuditIssue, type AuditOptions, type AuditReport, type AuditRoot, type AuditRuleId, type AuditSeverity, type ColorBlindMode, type ComparePeriodsOptions, type ContextAnswer, type ContextHit, type ContextIndexOptions, type ContextPassage, type CopilotFixResult, type CopilotState, type CreateGridToolsOptions, DEFAULT_A11Y_SETTINGS, type DesignCategory, type DesignFinding, type DesignReview, type DesignReviewOptions, FONT_MAX, FONT_MIN, FONT_STEP, type FilterConfig, type FilterOperator, type FormField, type FormFinding, type FormFindingLevel, type FormReview, type FormReviewOptions, type GridAgentErrorCode, type GridAgentResult, type GridAgentStep, type GridAgentTool, type GridAnomaly, type GridAnswer, type GridColumn, GridCore, type GridEngine, type GridInputLanguage, type GridIntent, type GridIntentContext, type GridLocale, type GridNavAction, type GridQueryResult, type GridSearchTime, type GridTheme, type GridTool, type GridToolColumn, type GridToolContext, type GridToolErrorCode, type GridToolFilter, type GridToolFilterOperator, type GridToolId, type GridToolLocale, type GridToolResult, type GridToolSort, type GridTranslations, type GroupResult, type IndicLanguageLocale, type InsightAnswer, type PageAnswer, type PageIntent, type PageOutline, type PaginationConfig, type ParseOptions, type ParsedGridQuery, type Period, type PeriodChange, type PeriodComparison, type PlannedStep, type RGBA, RUST_AUTO_MIN_ROWS, type RunTasksOptions, Runtime, type Severity, type SortConfig, type SortDirection, type StepResult, type TaskAction, type TaskRunResult, type UseAgenticGridOptions, type UseGridOptions, type UseGridReturn, type ViewMode, type VoiceA11yCommand, type VoiceA11yControllerOptions, type VoiceFeatures, type WebMCPState, type WebMCPStatus, YuktAI, YuktAIWrapper, type YuktAIWrapperProps, YuktaiGrid, YuktaiGridAI, type YuktaiGridAIProps, useYuktaiGridAgent as YuktaiGridAgent, type YuktaiGridAgentProps, type YuktaiGridProps, type YuktaiGridRule, type YuktaiGridRuleContext, YuktaiGridWebMCP, type YuktaiGridWebMCPProps, accessibleName, addPeriods, aggregate, aiPlugin, analyzePage, answerGridQuestion, applyGridFilters, askAboutPage, askInsight, auditToJSON, auditToMarkdown, clearFilters, clearSort, comparePeriods, contrastRatio, countGrid, createA11yCopilot, createContextIndex, createGridTools, createVoiceA11yController, YuktAIWrapper as default, detectAnomalies, detectPageIntent, executeGridQuery, filterGrid, findMentionedColumn, getColumns, getRow, getRowId, gridPassages, groupBy, highlightRows, loadGridCore, moveGridRowFocus, openRow, pagePassages, parseAmount, parseColor, parseGridIntent, parseGridQuery, parseVoiceA11yCommand, planTasks, readFormFields, relativeLuminance, reviewDesign, reviewForm, reviewForms, runGridQuery, runQaAudit, runTasks, searchGrid, selectRow, sortGrid, startOfPeriod, summarizeRows, toGridToolColumns, tokenize, trend, useAgenticGrid, useGrid, useYuktaiGridAgent, voicePlugin, wantsRustEngine, wcagPlugin as wcag, wcagPlugin };
