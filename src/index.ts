// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/index.ts
// Main entry point — exports everything the consumer needs.
// DO NOT add "use client" here.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Core engine ─────────────────────────────────────────────────────────────
export { wcagPlugin } from "./core/renderer";

export type {
  A11yConfig,
  A11yReport,
  A11yFix,
  Severity,
  ColorBlindMode,
} from "./core/renderer";

// ─── React / Next.js wrapper ─────────────────────────────────────────────────
export * from "./next/YuktAIWrapper";
export { default } from "./next/YuktAIWrapper";

// ─── Plugins ─────────────────────────────────────────────────────────────────
export { aiPlugin } from "./plugins/ai";
export { voicePlugin } from "./plugins/voice";

// Optional alias
export { wcagPlugin as wcag } from "./core/renderer";

// ─── Runtime ─────────────────────────────────────────────────────────────────
export { Runtime } from "./runtime/runtime";

// ─── YuktAI Grid ─────────────────────────────────────────────────────────────
export { YuktaiGrid } from "./grid/YuktaiGrid";

export { useGrid } from "./grid/useGrid";

export {
  default as YuktaiGridAI,
} from "./grid/YuktaiGridAI";

export {
  default as YuktaiGridWebMCP,
} from "./grid/YuktaiGridWebMCP";

export {
  default as YuktaiGridAgent,
  useYuktaiGridAgent,
  // v4.7.0 — regex-first Telugu/English intent parser used by agent.ask()
  parseGridIntent,
} from "./grid/YuktaiGridAgent";

// ─── Grid component types ────────────────────────────────────────────────────
export type {
  // v4.7.0
  UseGridOptions,
  UseGridReturn,
} from "./grid/useGrid";

export type {
  YuktaiGridAIProps,
} from "./grid/YuktaiGridAI";

export type {
  YuktaiGridWebMCPProps,
  // v4.7.0 — real registration status
  WebMCPStatus,
  WebMCPState,
} from "./grid/YuktaiGridWebMCP";

export type {
  GridAgentTool,
  YuktaiGridAgentProps,
  // v4.7.0
  GridAgentResult,
  GridAgentErrorCode,
  GridAgentStep,
  GridIntent,
  GridIntentContext,
} from "./grid/YuktaiGridAgent";

// ─── Grid tools ──────────────────────────────────────────────────────────────
export {
  searchGrid,
  countGrid,
  getColumns,
  getRow,
  highlightRows,
  selectRow,
  openRow,

  // v4.7.0 — filter / sort tools
  filterGrid,
  clearFilters,
  sortGrid,
  clearSort,

  // v4.7.0 — one tool list for Agent + WebMCP, shared helpers
  createGridTools,
  getRowId,
  applyGridFilters,
  toGridToolColumns,
} from "./grid/gridTools";

export type {
  GridToolColumn,
  GridToolContext,
  GridToolResult,

  // v4.7.0
  GridTool,
  GridToolId,
  CreateGridToolsOptions,
  GridToolErrorCode,
  GridToolLocale,
  GridToolFilter,
  GridToolFilterOperator,
  GridToolSort,
} from "./grid/gridTools";

// ─── Grid core types ─────────────────────────────────────────────────────────
export type {
  GridColumn,
  SortConfig,
  SortDirection,
  FilterConfig,
  FilterOperator,
  ViewMode,
  GridTheme,
  GridLocale,
  IndicLanguageLocale,
  GridInputLanguage,
  AIFeatures,
  VoiceFeatures,
  PaginationConfig,
  GridTranslations,
  YuktaiGridProps,
  YuktaiGridRule,
  YuktaiGridRuleContext,
} from "./grid/types";
// ─── Icons ───────────────────────────────────────────────────────────────────
export {
  IconBase,
  SearchIcon,
  SortUpIcon,
  SortDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  CloseIcon,
  // v5.3.1 — 34 more icons, shared with the vanilla build
  YuktaiIcon,
  ICON_PATHS,
  ICON_NAMES,
  iconSvg,
  iconContrast,
  pickGlyphColor,
  ICON_MIN_CONTRAST,
  AccessibilityIcon,
  ContrastIcon,
  MoonIcon,
  MotionIcon,
  ReadingIcon,
  TargetIcon,
  SpeakerIcon,
  PaletteIcon,
  SkipIcon,
  PlusIcon,
  MinusIcon,
  ResetIcon,
  SortIcon,
  ChevronsIcon,
  GridIcon,
  CardsIcon,
  ChatIcon,
  MicIcon,
  StopIcon,
  DownloadIcon,
  CopyIcon,
  FilterIcon,
  FirstIcon,
  LastIcon,
  SparkIcon,
  AlertIcon,
  InfoIcon,
  FormIcon,
  EyeIcon,
  LayoutIcon,
  WandIcon,
  UndoIcon,
  ToolsIcon,
  PlugIcon,
  // v5.3.2 — 33 more
  HomeIcon,
  MenuIcon,
  BookIcon,
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  UsersIcon,
  GlobeIcon,
  LampIcon,
  PlayIcon,
  PauseIcon,
  SendIcon,
  ShareIcon,
  GiftIcon,
  ImageIcon,
  FileIcon,
  ExternalIcon,
  ArrowUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HeadphonesIcon,
  MusicIcon,
  PinIcon,
  MapIcon,
  PenIcon,
  WalletIcon,
  InstallIcon,
  HelpIcon,
  TempleIcon,
  MeditateIcon,
  TrophyIcon,
  BulbIcon,
  SunIcon,
  // v5.3.3 — 58 more
  DeleteIcon,
  RobotIcon,
  HeartIcon,
  HeartFilledIcon,
  HubIcon,
  CodeIcon,
  TextIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  QuoteIcon,
  TitleIcon,
  FontIcon,
  SpellcheckIcon,
  AbcIcon,
  PageBreakIcon,
  LinkIcon,
  StyleIcon,
  LockIcon,
  UnlockIcon,
  KeyIcon,
  RedoIcon,
  SwapIcon,
  ShuffleIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  MergeIcon,
  JoinIcon,
  TouchIcon,
  VolumeOffIcon,
  MusicOffIcon,
  MusicVideoIcon,
  MovieIcon,
  SlideshowIcon,
  StorageIcon,
  ApiIcon,
  DataObjectIcon,
  ComputerIcon,
  PhoneIcon,
  CloudIcon,
  WifiIcon,
  WifiOffIcon,
  SearchOffIcon,
  EyeOffIcon,
  BookmarkIcon,
  SchoolIcon,
  GavelIcon,
  ArchitectureIcon,
  BrainIcon,
  VolunteerIcon,
  RadioIcon,
  RadioCheckedIcon,
  UploadIcon,
  ArrowDownIcon,
  // v5.3.4 — 31 more
  FactCheckIcon,
  ImageSearchIcon,
  DocumentScannerIcon,
  DashboardIcon,
  CleaningIcon,
  DragHandleIcon,
  ZoomInIcon,
  ZoomOutIcon,
  InsightsIcon,
  ExploreIcon,
  SaveIcon,
  LabelIcon,
  KeyboardIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CakeIcon,
  BarChartIcon,
  AdminIcon,
  BugReportIcon,
  SentimentSadIcon,
  IntegrationIcon,
  NamaskarIcon,
  SunriseIcon,
  SunsetIcon,
  LoginIcon,
  LogoutIcon,
  SpeedIcon,
  RepeatIcon,
  LoaderIcon,
  StarIcon,
  ShieldCheckIcon,
} from "./icons";

export type {
  IconProps,
  IconName,
  YuktaiIconProps,
  IconVariant,
  IconShape,
  IconSvgOptions,
} from "./icons";

// ─── Agentic AI (v5.1) — ideas 1–10 ──────────────────────────────────────────
// Copilot, page Q&A, smart grid queries, voice settings, QA report, form
// review, page + data RAG, multi-step tasks, BI insights, design review.
export * from "./agentic";

// ─── Singleton runtime ───────────────────────────────────────────────────────
import { Runtime } from "./runtime/runtime";
import { aiPlugin } from "./plugins/ai";
import { voicePlugin } from "./plugins/voice";
import { wcagPlugin } from "./core/renderer";

declare global {
  // eslint-disable-next-line no-var
  var __yuktai_runtime__: Runtime | undefined;
}

function getRuntime(): Runtime {
  if (
    typeof globalThis === "undefined"
  ) {
    return new Runtime();
  }

  if (!globalThis.__yuktai_runtime__) {
    const runtime = new Runtime();

    runtime.register(
      wcagPlugin.name,
      wcagPlugin
    );

    runtime.register(
      aiPlugin.name,
      aiPlugin
    );

    runtime.register(
      voicePlugin.name,
      voicePlugin
    );

    globalThis.__yuktai_runtime__ =
      runtime;
  }

  return globalThis.__yuktai_runtime__;
}

// Only initialise the shared runtime on the client.
const runtime =
  typeof window !== "undefined"
    ? getRuntime()
    : new Runtime();

// ─── Public YuktAI API ───────────────────────────────────────────────────────
export const YuktAI = {
  wcagPlugin,

  list(): string[] {
    return runtime.getPlugins();
  },

  use(name: string) {
    return runtime.use(name);
  },

  fix(
    config?: Partial<
      import("./core/renderer").A11yConfig
    >
  ) {
    return wcagPlugin.applyFixes({
      enabled: true,
      autoFix: true,
      ...config,
    });
  },

  scan() {
    return wcagPlugin.scan();
  },
};