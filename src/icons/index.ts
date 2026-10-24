// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/icons/index.ts
//
// All yuktai icons — bold line style (2.5px), 24x24 viewBox.
// Tree-shakeable: import only what you use.
//
// Usage:
//   import { SearchIcon } from "@yuktishaalaa/yuktai"
//   <SearchIcon size={20} />
//   <SearchIcon size={16} color="teal" />
//   <SearchIcon size={24} label="Search products" />
// ─────────────────────────────────────────────────────────────────────────────

export { IconBase }         from "./IconBase"
export type { IconProps }   from "./IconBase"

export { SearchIcon }       from "./SearchIcon"
export { SortUpIcon }       from "./SortUpIcon"
export { SortDownIcon }     from "./SortDownIcon"
export { ChevronLeftIcon }  from "./ChevronLeftIcon"
export { ChevronRightIcon } from "./ChevronRightIcon"
export { CheckIcon }        from "./CheckIcon"
export { CloseIcon }        from "./CloseIcon"

// v5.3.1 — 34 more icons, shared with the vanilla build
export { ICON_PATHS, ICON_NAMES } from "./paths"
export { iconSvg, iconContrast, pickGlyphColor, resolveIconColours, ICON_MIN_CONTRAST } from "./variant"
export type { IconVariant, IconShape, IconSvgOptions } from "./variant"
export type { IconName }         from "./paths"
export { YuktaiIcon }            from "./YuktaiIcon"
export type { YuktaiIconProps }  from "./YuktaiIcon"
export {
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
  // v5.3.2
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
} from "./YuktaiIcon"