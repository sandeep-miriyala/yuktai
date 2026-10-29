import React from "react";
import { type IconShape, type IconVariant } from "./variant";
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
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
export declare function IconBase({ size, color, strokeWidth, label, variant, glyphColor, shape, children, ...rest }: IconProps & {
    children: React.ReactNode;
}): React.JSX.Element;
