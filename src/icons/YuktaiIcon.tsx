// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/icons/YuktaiIcon.tsx
//
// 125 more yuktai icons for React / Next.js, drawn from the shared list in
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

// v5.3.3 — 58 more
/** Delete */
export const DeleteIcon = (props: IconProps) => <YuktaiIcon {...props} name="delete" />

/** Robot / AI assistant */
export const RobotIcon = (props: IconProps) => <YuktaiIcon {...props} name="robot" />

/** Heart (not liked) */
export const HeartIcon = (props: IconProps) => <YuktaiIcon {...props} name="heart" />

/** Heart (liked) */
export const HeartFilledIcon = (props: IconProps) => <YuktaiIcon {...props} name="heartFilled" />

/** Hub / network */
export const HubIcon = (props: IconProps) => <YuktaiIcon {...props} name="hub" />

/** Code */
export const CodeIcon = (props: IconProps) => <YuktaiIcon {...props} name="code" />

/** Text field */
export const TextIcon = (props: IconProps) => <YuktaiIcon {...props} name="text" />

/** Bold */
export const BoldIcon = (props: IconProps) => <YuktaiIcon {...props} name="bold" />

/** Italic */
export const ItalicIcon = (props: IconProps) => <YuktaiIcon {...props} name="italic" />

/** Underline */
export const UnderlineIcon = (props: IconProps) => <YuktaiIcon {...props} name="underline" />

/** Align left */
export const AlignLeftIcon = (props: IconProps) => <YuktaiIcon {...props} name="alignLeft" />

/** Align centre */
export const AlignCenterIcon = (props: IconProps) => <YuktaiIcon {...props} name="alignCenter" />

/** Align right */
export const AlignRightIcon = (props: IconProps) => <YuktaiIcon {...props} name="alignRight" />

/** Justify */
export const AlignJustifyIcon = (props: IconProps) => <YuktaiIcon {...props} name="alignJustify" />

/** Quote */
export const QuoteIcon = (props: IconProps) => <YuktaiIcon {...props} name="quote" />

/** Title */
export const TitleIcon = (props: IconProps) => <YuktaiIcon {...props} name="title" />

/** Font */
export const FontIcon = (props: IconProps) => <YuktaiIcon {...props} name="font" />

/** Spell check */
export const SpellcheckIcon = (props: IconProps) => <YuktaiIcon {...props} name="spellcheck" />

/** Letters (ABC) */
export const AbcIcon = (props: IconProps) => <YuktaiIcon {...props} name="abc" />

/** Page break */
export const PageBreakIcon = (props: IconProps) => <YuktaiIcon {...props} name="pageBreak" />

/** Link */
export const LinkIcon = (props: IconProps) => <YuktaiIcon {...props} name="link" />

/** Style */
export const StyleIcon = (props: IconProps) => <YuktaiIcon {...props} name="style" />

/** Lock */
export const LockIcon = (props: IconProps) => <YuktaiIcon {...props} name="lock" />

/** Unlock */
export const UnlockIcon = (props: IconProps) => <YuktaiIcon {...props} name="unlock" />

/** Key */
export const KeyIcon = (props: IconProps) => <YuktaiIcon {...props} name="key" />

/** Redo */
export const RedoIcon = (props: IconProps) => <YuktaiIcon {...props} name="redo" />

/** Swap */
export const SwapIcon = (props: IconProps) => <YuktaiIcon {...props} name="swap" />

/** Shuffle */
export const ShuffleIcon = (props: IconProps) => <YuktaiIcon {...props} name="shuffle" />

/** Full screen */
export const FullscreenIcon = (props: IconProps) => <YuktaiIcon {...props} name="fullscreen" />

/** Exit full screen */
export const FullscreenExitIcon = (props: IconProps) => <YuktaiIcon {...props} name="fullscreenExit" />

/** Merge */
export const MergeIcon = (props: IconProps) => <YuktaiIcon {...props} name="merge" />

/** Join */
export const JoinIcon = (props: IconProps) => <YuktaiIcon {...props} name="join" />

/** Tap / touch */
export const TouchIcon = (props: IconProps) => <YuktaiIcon {...props} name="touch" />

/** Sound off */
export const VolumeOffIcon = (props: IconProps) => <YuktaiIcon {...props} name="volumeOff" />

/** Music off */
export const MusicOffIcon = (props: IconProps) => <YuktaiIcon {...props} name="musicOff" />

/** Music video */
export const MusicVideoIcon = (props: IconProps) => <YuktaiIcon {...props} name="musicVideo" />

/** Movie */
export const MovieIcon = (props: IconProps) => <YuktaiIcon {...props} name="movie" />

/** Slide show */
export const SlideshowIcon = (props: IconProps) => <YuktaiIcon {...props} name="slideshow" />

/** Storage / database */
export const StorageIcon = (props: IconProps) => <YuktaiIcon {...props} name="storage" />

/** API */
export const ApiIcon = (props: IconProps) => <YuktaiIcon {...props} name="api" />

/** Data object { } */
export const DataObjectIcon = (props: IconProps) => <YuktaiIcon {...props} name="dataObject" />

/** Computer */
export const ComputerIcon = (props: IconProps) => <YuktaiIcon {...props} name="computer" />

/** Phone */
export const PhoneIcon = (props: IconProps) => <YuktaiIcon {...props} name="phone" />

/** Cloud */
export const CloudIcon = (props: IconProps) => <YuktaiIcon {...props} name="cloud" />

/** Wi-Fi */
export const WifiIcon = (props: IconProps) => <YuktaiIcon {...props} name="wifi" />

/** No Wi-Fi / offline */
export const WifiOffIcon = (props: IconProps) => <YuktaiIcon {...props} name="wifiOff" />

/** No results */
export const SearchOffIcon = (props: IconProps) => <YuktaiIcon {...props} name="searchOff" />

/** Hide */
export const EyeOffIcon = (props: IconProps) => <YuktaiIcon {...props} name="eyeOff" />

/** Bookmark */
export const BookmarkIcon = (props: IconProps) => <YuktaiIcon {...props} name="bookmark" />

/** School / learning */
export const SchoolIcon = (props: IconProps) => <YuktaiIcon {...props} name="school" />

/** Law / rules */
export const GavelIcon = (props: IconProps) => <YuktaiIcon {...props} name="gavel" />

/** Architecture / design */
export const ArchitectureIcon = (props: IconProps) => <YuktaiIcon {...props} name="architecture" />

/** Brain / thinking */
export const BrainIcon = (props: IconProps) => <YuktaiIcon {...props} name="brain" />

/** Volunteer / care */
export const VolunteerIcon = (props: IconProps) => <YuktaiIcon {...props} name="volunteer" />

/** Radio button (off) */
export const RadioIcon = (props: IconProps) => <YuktaiIcon {...props} name="radio" />

/** Radio button (on) */
export const RadioCheckedIcon = (props: IconProps) => <YuktaiIcon {...props} name="radioChecked" />

/** Upload */
export const UploadIcon = (props: IconProps) => <YuktaiIcon {...props} name="upload" />

/** Arrow down */
export const ArrowDownIcon = (props: IconProps) => <YuktaiIcon {...props} name="arrowDown" />
