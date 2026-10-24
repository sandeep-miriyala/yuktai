// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/icons/YuktaiIcon.tsx
//
// 67 more yuktai icons for React / Next.js, drawn from the shared list in
// paths.ts, so they match the vanilla build (yuktai.icon) exactly.
// Same props as every yuktai icon: size, color, strokeWidth, label.
//
//   import { MicIcon, AccessibilityIcon, YuktaiIcon } from "@yuktishaalaa/yuktai"
//   <MicIcon size={20} />
//   <AccessibilityIcon size={24} label="Accessibility settings" />
//   <YuktaiIcon name="wand" />            // any icon by name
// ─────────────────────────────────────────────────────────────────────────────

import { IconBase, type IconProps } from "./IconBase"
import { ICON_PATHS, type IconName } from "./paths"

export interface YuktaiIconProps extends Omit<IconProps, "name"> {
  /** Icon name, e.g. "mic", "wand", "accessibility". See ICON_NAMES. */
  name: IconName
}

/** Any yuktai icon by name. Paths are fixed constants from paths.ts (never user input). */
export function YuktaiIcon({ name, ...props }: YuktaiIconProps) {
  const markup = ICON_PATHS[name] ?? ICON_PATHS.spark
  return (
    <IconBase {...props}>
      <g dangerouslySetInnerHTML={{ __html: markup }} />
    </IconBase>
  )
}

/** Accessibility settings */
export const AccessibilityIcon = (props: IconProps) => <YuktaiIcon {...props} name="accessibility" />

/** High contrast */
export const ContrastIcon = (props: IconProps) => <YuktaiIcon {...props} name="contrast" />

/** Dark mode */
export const MoonIcon = (props: IconProps) => <YuktaiIcon {...props} name="moon" />

/** Reduce motion */
export const MotionIcon = (props: IconProps) => <YuktaiIcon {...props} name="motion" />

/** Reading / dyslexia support */
export const ReadingIcon = (props: IconProps) => <YuktaiIcon {...props} name="reading" />

/** Large targets */
export const TargetIcon = (props: IconProps) => <YuktaiIcon {...props} name="target" />

/** Speak on focus */
export const SpeakerIcon = (props: IconProps) => <YuktaiIcon {...props} name="speaker" />

/** Colour-blind modes */
export const PaletteIcon = (props: IconProps) => <YuktaiIcon {...props} name="palette" />

/** Skip links */
export const SkipIcon = (props: IconProps) => <YuktaiIcon {...props} name="skip" />

/** Increase / add */
export const PlusIcon = (props: IconProps) => <YuktaiIcon {...props} name="plus" />

/** Decrease / remove */
export const MinusIcon = (props: IconProps) => <YuktaiIcon {...props} name="minus" />

/** Reset */
export const ResetIcon = (props: IconProps) => <YuktaiIcon {...props} name="reset" />

/** Sortable column (unsorted) */
export const SortIcon = (props: IconProps) => <YuktaiIcon {...props} name="sort" />

/** Expand / collapse */
export const ChevronsIcon = (props: IconProps) => <YuktaiIcon {...props} name="chevrons" />

/** Table view */
export const GridIcon = (props: IconProps) => <YuktaiIcon {...props} name="grid" />

/** Card view */
export const CardsIcon = (props: IconProps) => <YuktaiIcon {...props} name="cards" />

/** Ask / assistant */
export const ChatIcon = (props: IconProps) => <YuktaiIcon {...props} name="chat" />

/** Voice input */
export const MicIcon = (props: IconProps) => <YuktaiIcon {...props} name="mic" />

/** Stop listening */
export const StopIcon = (props: IconProps) => <YuktaiIcon {...props} name="stop" />

/** Download / export / install */
export const DownloadIcon = (props: IconProps) => <YuktaiIcon {...props} name="download" />

/** Copy */
export const CopyIcon = (props: IconProps) => <YuktaiIcon {...props} name="copy" />

/** Filter */
export const FilterIcon = (props: IconProps) => <YuktaiIcon {...props} name="filter" />

/** First page */
export const FirstIcon = (props: IconProps) => <YuktaiIcon {...props} name="first" />

/** Last page */
export const LastIcon = (props: IconProps) => <YuktaiIcon {...props} name="last" />

/** AI / agentic answer */
export const SparkIcon = (props: IconProps) => <YuktaiIcon {...props} name="spark" />

/** Warning */
export const AlertIcon = (props: IconProps) => <YuktaiIcon {...props} name="alert" />

/** Information */
export const InfoIcon = (props: IconProps) => <YuktaiIcon {...props} name="info" />

/** Form review */
export const FormIcon = (props: IconProps) => <YuktaiIcon {...props} name="form" />

/** Show on page / watch */
export const EyeIcon = (props: IconProps) => <YuktaiIcon {...props} name="eye" />

/** Design review */
export const LayoutIcon = (props: IconProps) => <YuktaiIcon {...props} name="layout" />

/** Auto-fix */
export const WandIcon = (props: IconProps) => <YuktaiIcon {...props} name="wand" />

/** Undo */
export const UndoIcon = (props: IconProps) => <YuktaiIcon {...props} name="undo" />

/** Page tools */
export const ToolsIcon = (props: IconProps) => <YuktaiIcon {...props} name="tools" />

/** WebMCP / integrations */
export const PlugIcon = (props: IconProps) => <YuktaiIcon {...props} name="plug" />

// v5.3.2 — 33 more
/** Home */
export const HomeIcon = (props: IconProps) => <YuktaiIcon {...props} name="home" />

/** Menu */
export const MenuIcon = (props: IconProps) => <YuktaiIcon {...props} name="menu" />

/** Book */
export const BookIcon = (props: IconProps) => <YuktaiIcon {...props} name="book" />

/** Calendar */
export const CalendarIcon = (props: IconProps) => <YuktaiIcon {...props} name="calendar" />

/** Clock */
export const ClockIcon = (props: IconProps) => <YuktaiIcon {...props} name="clock" />

/** Person */
export const PersonIcon = (props: IconProps) => <YuktaiIcon {...props} name="person" />

/** Group of people */
export const UsersIcon = (props: IconProps) => <YuktaiIcon {...props} name="users" />

/** Language / world */
export const GlobeIcon = (props: IconProps) => <YuktaiIcon {...props} name="globe" />

/** Oil lamp (deepam) */
export const LampIcon = (props: IconProps) => <YuktaiIcon {...props} name="lamp" />

/** Play */
export const PlayIcon = (props: IconProps) => <YuktaiIcon {...props} name="play" />

/** Pause */
export const PauseIcon = (props: IconProps) => <YuktaiIcon {...props} name="pause" />

/** Send */
export const SendIcon = (props: IconProps) => <YuktaiIcon {...props} name="send" />

/** Share */
export const ShareIcon = (props: IconProps) => <YuktaiIcon {...props} name="share" />

/** Gift */
export const GiftIcon = (props: IconProps) => <YuktaiIcon {...props} name="gift" />

/** Image */
export const ImageIcon = (props: IconProps) => <YuktaiIcon {...props} name="image" />

/** File / document */
export const FileIcon = (props: IconProps) => <YuktaiIcon {...props} name="file" />

/** Opens in a new tab */
export const ExternalIcon = (props: IconProps) => <YuktaiIcon {...props} name="external" />

/** Arrow up */
export const ArrowUpIcon = (props: IconProps) => <YuktaiIcon {...props} name="arrowUp" />

/** Arrow left */
export const ArrowLeftIcon = (props: IconProps) => <YuktaiIcon {...props} name="arrowLeft" />

/** Arrow right */
export const ArrowRightIcon = (props: IconProps) => <YuktaiIcon {...props} name="arrowRight" />

/** Headphones / listen */
export const HeadphonesIcon = (props: IconProps) => <YuktaiIcon {...props} name="headphones" />

/** Music / audio */
export const MusicIcon = (props: IconProps) => <YuktaiIcon {...props} name="music" />

/** Location pin */
export const PinIcon = (props: IconProps) => <YuktaiIcon {...props} name="pin" />

/** Map / directions */
export const MapIcon = (props: IconProps) => <YuktaiIcon {...props} name="map" />

/** Pen / write */
export const PenIcon = (props: IconProps) => <YuktaiIcon {...props} name="pen" />

/** Wallet / money */
export const WalletIcon = (props: IconProps) => <YuktaiIcon {...props} name="wallet" />

/** Install app */
export const InstallIcon = (props: IconProps) => <YuktaiIcon {...props} name="install" />

/** Help */
export const HelpIcon = (props: IconProps) => <YuktaiIcon {...props} name="help" />

/** Temple */
export const TempleIcon = (props: IconProps) => <YuktaiIcon {...props} name="temple" />

/** Meditation */
export const MeditateIcon = (props: IconProps) => <YuktaiIcon {...props} name="meditate" />

/** Trophy / result */
export const TrophyIcon = (props: IconProps) => <YuktaiIcon {...props} name="trophy" />

/** Idea / tip */
export const BulbIcon = (props: IconProps) => <YuktaiIcon {...props} name="bulb" />

/** Sun / light mode */
export const SunIcon = (props: IconProps) => <YuktaiIcon {...props} name="sun" />
