import { type IconName } from "./paths";
export type IconVariant = "outline" | "filled";
export type IconShape = "circle" | "rounded";
/** WCAG 1.4.11 minimum for graphical objects. */
export declare const ICON_MIN_CONTRAST = 3;
export interface IconColourOptions {
    variant?: IconVariant;
    /** outline: the line colour · filled: the background colour. Default currentColor. */
    color?: string;
    /** filled only: the glyph colour. Default: white or near-black, whichever contrasts more. */
    glyphColor?: string;
    /** filled only: background shape. Default "rounded". */
    shape?: IconShape;
}
/** Contrast between two colours, or null when either is not a hex/rgb() value (e.g. currentColor). */
export declare function iconContrast(fg: string, bg: string): number | null;
/** Best glyph colour (white or near-black) for a filled background. */
export declare function pickGlyphColor(background: string): string;
/** Resolved colours for one icon, plus a contrast check (WCAG 1.4.11). */
export declare function resolveIconColours(options?: IconColourOptions): {
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
/** Glyph area inside the filled background (70% of the 24×24 box, centred). */
export declare const FILLED_GLYPH_TRANSFORM = "translate(3.6 3.6) scale(0.7)";
/** Forced-colours rules for the filled variant (kept inside the SVG). */
export declare const FORCED_COLORS_CSS = "@media (forced-colors: active){.yi-bg{fill:CanvasText}.yi-glyph{stroke:Canvas;color:Canvas}}";
export interface IconSvgOptions extends IconColourOptions {
    size?: number | string;
    strokeWidth?: number;
    /** Accessible name. Omit for decorative icons. */
    label?: string;
}
/** SVG markup for any icon (used by the vanilla build: yuktai.icon). */
export declare function iconSvg(name: IconName | string, options?: IconSvgOptions): string;
