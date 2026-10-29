export { wcagPlugin } from "./core/renderer";
export type { A11yConfig, A11yReport, A11yFix, Severity, ColorBlindMode, } from "./core/renderer";
export * from "./next/YuktAIWrapper";
export { default } from "./next/YuktAIWrapper";
export { aiPlugin } from "./plugins/ai";
export { voicePlugin } from "./plugins/voice";
export { wcagPlugin as wcag } from "./core/renderer";
export { Runtime } from "./runtime/runtime";
export { YuktaiGrid } from "./grid/YuktaiGrid";
export { useGrid } from "./grid/useGrid";
export { GridCore, loadGridCore, wantsRustEngine, RUST_AUTO_MIN_ROWS, } from "./grid/rust/engine";
export type { GridEngine } from "./grid/rust/engine";
export { default as YuktaiGridAI, } from "./grid/YuktaiGridAI";
export { default as YuktaiGridWebMCP, } from "./grid/YuktaiGridWebMCP";
export { default as YuktaiGridAgent, useYuktaiGridAgent, parseGridIntent, } from "./grid/YuktaiGridAgent";
export type { UseGridOptions, UseGridReturn, } from "./grid/useGrid";
export type { YuktaiGridAIProps, } from "./grid/YuktaiGridAI";
export type { YuktaiGridWebMCPProps, WebMCPStatus, WebMCPState, } from "./grid/YuktaiGridWebMCP";
export type { GridAgentTool, YuktaiGridAgentProps, GridAgentResult, GridAgentErrorCode, GridAgentStep, GridIntent, GridIntentContext, } from "./grid/YuktaiGridAgent";
export { searchGrid, countGrid, getColumns, getRow, highlightRows, selectRow, openRow, filterGrid, clearFilters, sortGrid, clearSort, createGridTools, getRowId, applyGridFilters, toGridToolColumns, } from "./grid/gridTools";
export type { GridToolColumn, GridToolContext, GridToolResult, GridTool, GridToolId, CreateGridToolsOptions, GridToolErrorCode, GridToolLocale, GridToolFilter, GridToolFilterOperator, GridToolSort, } from "./grid/gridTools";
export type { GridColumn, SortConfig, SortDirection, FilterConfig, FilterOperator, ViewMode, GridTheme, GridLocale, IndicLanguageLocale, GridInputLanguage, AIFeatures, VoiceFeatures, PaginationConfig, GridTranslations, YuktaiGridProps, GridSearchTime, YuktaiGridRule, YuktaiGridRuleContext, } from "./grid/types";
export { IconBase, SearchIcon, SortUpIcon, SortDownIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon, CloseIcon, YuktaiIcon, ICON_PATHS, ICON_NAMES, iconSvg, iconContrast, pickGlyphColor, ICON_MIN_CONTRAST, AccessibilityIcon, ContrastIcon, MoonIcon, MotionIcon, ReadingIcon, TargetIcon, SpeakerIcon, PaletteIcon, SkipIcon, PlusIcon, MinusIcon, ResetIcon, SortIcon, ChevronsIcon, GridIcon, CardsIcon, ChatIcon, MicIcon, StopIcon, DownloadIcon, CopyIcon, FilterIcon, FirstIcon, LastIcon, SparkIcon, AlertIcon, InfoIcon, FormIcon, EyeIcon, LayoutIcon, WandIcon, UndoIcon, ToolsIcon, PlugIcon, HomeIcon, MenuIcon, BookIcon, CalendarIcon, ClockIcon, PersonIcon, UsersIcon, GlobeIcon, LampIcon, PlayIcon, PauseIcon, SendIcon, ShareIcon, GiftIcon, ImageIcon, FileIcon, ExternalIcon, ArrowUpIcon, ArrowLeftIcon, ArrowRightIcon, HeadphonesIcon, MusicIcon, PinIcon, MapIcon, PenIcon, WalletIcon, InstallIcon, HelpIcon, TempleIcon, MeditateIcon, TrophyIcon, BulbIcon, SunIcon, DeleteIcon, RobotIcon, HeartIcon, HeartFilledIcon, HubIcon, CodeIcon, TextIcon, BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, QuoteIcon, TitleIcon, FontIcon, SpellcheckIcon, AbcIcon, PageBreakIcon, LinkIcon, StyleIcon, LockIcon, UnlockIcon, KeyIcon, RedoIcon, SwapIcon, ShuffleIcon, FullscreenIcon, FullscreenExitIcon, MergeIcon, JoinIcon, TouchIcon, VolumeOffIcon, MusicOffIcon, MusicVideoIcon, MovieIcon, SlideshowIcon, StorageIcon, ApiIcon, DataObjectIcon, ComputerIcon, PhoneIcon, CloudIcon, WifiIcon, WifiOffIcon, SearchOffIcon, EyeOffIcon, BookmarkIcon, SchoolIcon, GavelIcon, ArchitectureIcon, BrainIcon, VolunteerIcon, RadioIcon, RadioCheckedIcon, UploadIcon, ArrowDownIcon, FactCheckIcon, ImageSearchIcon, DocumentScannerIcon, DashboardIcon, CleaningIcon, DragHandleIcon, ZoomInIcon, ZoomOutIcon, InsightsIcon, ExploreIcon, SaveIcon, LabelIcon, KeyboardIcon, TrendingUpIcon, TrendingDownIcon, CakeIcon, BarChartIcon, AdminIcon, BugReportIcon, SentimentSadIcon, IntegrationIcon, NamaskarIcon, SunriseIcon, SunsetIcon, LoginIcon, LogoutIcon, SpeedIcon, RepeatIcon, LoaderIcon, StarIcon, ShieldCheckIcon, } from "./icons";
export type { IconProps, IconName, YuktaiIconProps, IconVariant, IconShape, IconSvgOptions, } from "./icons";
export * from "./agentic";
import { Runtime } from "./runtime/runtime";
declare global {
    var __yuktai_runtime__: Runtime | undefined;
}
export declare const YuktAI: {
    wcagPlugin: {
        name: string;
        version: string;
        observer: MutationObserver | null;
        execute(config: import(".").A11yConfig): Promise<string>;
        applyFixes(config: import(".").A11yConfig): import(".").A11yReport;
        scan(): import(".").A11yReport;
        startObserver(config: import(".").A11yConfig): void;
        stopObserver(): void;
        announce: (message: string, type?: import("./core/renderer").AlertType, useSpeech?: boolean) => void;
        speak: (text: string, priority?: "polite" | "assertive") => void;
        showVisualAlert: (message: string, type?: import("./core/renderer").AlertType) => void;
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
    use(name: string): import("./runtime/runtime").Plugin | undefined;
    fix(config?: Partial<import("./core/renderer").A11yConfig>): import(".").A11yReport;
    scan(): import(".").A11yReport;
};
