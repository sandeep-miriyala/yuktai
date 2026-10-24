import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

declare const ICON_PATHS: {
    readonly accessibility: "<circle cx=\"12\" cy=\"4\" r=\"2\"/><path d=\"M4 8l8-1 8 1M12 7v5m-5 9 5-8 5 8M7 12l-2 5m12-5 2 5\"/>";
    readonly contrast: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3a9 9 0 0 0 0 18z\"/>";
    readonly moon: "<path d=\"M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z\"/>";
    readonly motion: "<path d=\"M4 12h12m-5-5 5 5-5 5M20 5v14\"/>";
    readonly reading: "<path d=\"M4 5h16M4 10h12M4 15h16M4 20h10\"/>";
    readonly target: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/>";
    readonly speaker: "<path d=\"M4 9v6h4l5 4V5L8 9H4z\"/><path d=\"M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11\"/>";
    readonly palette: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"8\" cy=\"10\" r=\"1.3\"/><circle cx=\"12\" cy=\"7.5\" r=\"1.3\"/><circle cx=\"16\" cy=\"10\" r=\"1.3\"/><path d=\"M12 21a3 3 0 0 1 0-6h2\"/>";
    readonly skip: "<path d=\"M5 5l7 7-7 7M13 5l7 7-7 7\"/>";
    readonly close: "<path d=\"m18 6-12 12M6 6l12 12\"/>";
    readonly plus: "<path d=\"M12 5v14M5 12h14\"/>";
    readonly minus: "<path d=\"M5 12h14\"/>";
    readonly reset: "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"/><path d=\"M3 3v5h5\"/>";
    readonly search: "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"m16 16 5 5\"/>";
    readonly sort: "<path d=\"m8 9 4-4 4 4m-8 6 4 4 4-4\"/>";
    readonly sortUp: "<path d=\"m6 15 6-6 6 6\"/>";
    readonly sortDown: "<path d=\"m6 9 6 6 6-6\"/>";
    readonly chevrons: "<path d=\"m8 9 4-4 4 4m-8 6 4 4 4-4\"/>";
    readonly grid: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>";
    readonly cards: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"13\" width=\"18\" height=\"7\" rx=\"1.5\"/>";
    readonly chat: "<path d=\"M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z\"/>";
    readonly mic: "<rect x=\"9\" y=\"2\" width=\"6\" height=\"12\" rx=\"3\"/><path d=\"M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8\"/>";
    readonly stop: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>";
    readonly download: "<path d=\"M12 3v12m-5-5 5 5 5-5M4 21h16\"/>";
    readonly copy: "<rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"/><path d=\"M5 15V5a2 2 0 0 1 2-2h10\"/>";
    readonly filter: "<path d=\"M4 5h16l-6 7v6l-4 2v-8z\"/>";
    readonly check: "<path d=\"m5 12 4 4L19 6\"/>";
    readonly left: "<path d=\"m15 18-6-6 6-6\"/>";
    readonly right: "<path d=\"m9 18 6-6-6-6\"/>";
    readonly first: "<path d=\"m11 18-6-6 6-6M19 18l-6-6 6-6\"/>";
    readonly last: "<path d=\"m13 18 6-6-6-6M5 18l6-6-6-6\"/>";
    readonly spark: "<path d=\"m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z\"/>";
    readonly alert: "<path d=\"m12 3 10 18H2L12 3z\"/><path d=\"M12 9v5m0 3h.01\"/>";
    readonly info: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6m0-9h.01\"/>";
    readonly form: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 8h6M9 12h6M9 16h3\"/>";
    readonly eye: "<path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>";
    readonly layout: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18M9 21V9\"/>";
    readonly wand: "<path d=\"m15 4 5 5L9 20H4v-5z\"/><path d=\"m13 6 5 5\"/>";
    readonly undo: "<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10a6 6 0 0 1 0 12h-3\"/>";
    readonly tools: "<path d=\"M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z\"/>";
    readonly plug: "<path d=\"M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4\"/>";
};
type IconName = keyof typeof ICON_PATHS;
declare const ICON_NAMES: IconName[];

type IconVariant = "outline" | "filled";
type IconShape = "circle" | "rounded";
/** WCAG 1.4.11 minimum for graphical objects. */
declare const ICON_MIN_CONTRAST = 3;
interface IconColourOptions {
    variant?: IconVariant;
    /** outline: the line colour · filled: the background colour. Default currentColor. */
    color?: string;
    /** filled only: the glyph colour. Default: white or near-black, whichever contrasts more. */
    glyphColor?: string;
    /** filled only: background shape. Default "rounded". */
    shape?: IconShape;
}
/** Contrast between two colours, or null when either is not a hex/rgb() value (e.g. currentColor). */
declare function iconContrast(fg: string, bg: string): number | null;
/** Best glyph colour (white or near-black) for a filled background. */
declare function pickGlyphColor(background: string): string;
/** Resolved colours for one icon, plus a contrast check (WCAG 1.4.11). */
declare function resolveIconColours(options?: IconColourOptions): {
    variant: "outline";
    color: string;
    glyph: string;
    contrast: number | null;
} | {
    variant: "filled";
    color: string;
    glyph: string;
    contrast: number | null;
};
interface IconSvgOptions extends IconColourOptions {
    size?: number | string;
    strokeWidth?: number;
    /** Accessible name. Omit for decorative icons. */
    label?: string;
}
/** SVG markup for any icon (used by the vanilla build: yuktai.icon). */
declare function iconSvg(name: IconName | string, options?: IconSvgOptions): string;

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    /** Size in pixels — applied to both width and height. Default: 20 */
    size?: number | string;
    /** outline: line colour · filled: background colour. Default: currentColor */
    color?: string;
    /** Stroke width override — default: 2.5 (outline), 2.6 (filled) */
    strokeWidth?: number;
    /** Accessible label — if provided, icon becomes non-decorative */
    label?: string;
    /** "outline" (default) or "filled" */
    variant?: IconVariant;
    /** filled only: glyph colour. Default: white or near-black, whichever contrasts more */
    glyphColor?: string;
    /** filled only: "rounded" (default) or "circle" */
    shape?: IconShape;
}
/**
 * Shared base for all yuktai icons.
 * Children should be SVG path/circle/rect elements.
 */
declare function IconBase({ size, color, strokeWidth, label, variant, glyphColor, shape, children, ...rest }: IconProps & {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function SearchIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function SortUpIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function SortDownIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function ChevronLeftIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function ChevronRightIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function CheckIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function CloseIcon(props: IconProps): react_jsx_runtime.JSX.Element;

interface YuktaiIconProps extends Omit<IconProps, "name"> {
    /** Icon name, e.g. "mic", "wand", "accessibility". See ICON_NAMES. */
    name: IconName;
}
/** Any yuktai icon by name. Paths are fixed constants from paths.ts (never user input). */
declare function YuktaiIcon({ name, ...props }: YuktaiIconProps): react_jsx_runtime.JSX.Element;
/** Accessibility settings */
declare const AccessibilityIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** High contrast */
declare const ContrastIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Dark mode */
declare const MoonIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Reduce motion */
declare const MotionIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Reading / dyslexia support */
declare const ReadingIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Large targets */
declare const TargetIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Speak on focus */
declare const SpeakerIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Colour-blind modes */
declare const PaletteIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Skip links */
declare const SkipIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Increase / add */
declare const PlusIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Decrease / remove */
declare const MinusIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Reset */
declare const ResetIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Sortable column (unsorted) */
declare const SortIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Expand / collapse */
declare const ChevronsIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Table view */
declare const GridIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Card view */
declare const CardsIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Ask / assistant */
declare const ChatIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Voice input */
declare const MicIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Stop listening */
declare const StopIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Download / export / install */
declare const DownloadIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Copy */
declare const CopyIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Filter */
declare const FilterIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** First page */
declare const FirstIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Last page */
declare const LastIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** AI / agentic answer */
declare const SparkIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Warning */
declare const AlertIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Information */
declare const InfoIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Form review */
declare const FormIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Show on page / watch */
declare const EyeIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Design review */
declare const LayoutIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Auto-fix */
declare const WandIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Undo */
declare const UndoIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Page tools */
declare const ToolsIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** WebMCP / integrations */
declare const PlugIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;

export { AccessibilityIcon, AlertIcon, CardsIcon, ChatIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsIcon, CloseIcon, ContrastIcon, CopyIcon, DownloadIcon, EyeIcon, FilterIcon, FirstIcon, FormIcon, GridIcon, ICON_MIN_CONTRAST, ICON_NAMES, ICON_PATHS, IconBase, type IconName, type IconProps, type IconShape, type IconSvgOptions, type IconVariant, InfoIcon, LastIcon, LayoutIcon, MicIcon, MinusIcon, MoonIcon, MotionIcon, PaletteIcon, PlugIcon, PlusIcon, ReadingIcon, ResetIcon, SearchIcon, SkipIcon, SortDownIcon, SortIcon, SortUpIcon, SparkIcon, SpeakerIcon, StopIcon, TargetIcon, ToolsIcon, UndoIcon, WandIcon, YuktaiIcon, type YuktaiIconProps, iconContrast, iconSvg, pickGlyphColor, resolveIconColours };
