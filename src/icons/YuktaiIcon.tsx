// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/icons/YuktaiIcon.tsx
//
// 34 more yuktai icons for React / Next.js, drawn from the shared list in
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
