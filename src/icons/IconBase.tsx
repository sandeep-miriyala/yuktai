// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/icons/IconBase.tsx
//
// Shared wrapper for all yuktai icons.
// Style: line icons, rounded caps, 24x24 viewBox.
// Colour: currentColor by default (inherits from the parent text).
//
// Two variants (see variant.ts for the WCAG rules):
//   variant="outline"  (default) line icon
//   variant="filled"   icon in a solid rounded square or circle;
//                      the glyph colour is picked for at least 3:1 contrast
//
// Accessibility: aria-hidden by default (decorative); pass `label` for
// meaningful icons (role="img" + aria-label).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react"
import { FILLED_GLYPH_TRANSFORM, FORCED_COLORS_CSS, resolveIconColours, type IconShape, type IconVariant } from "./variant"

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Size in pixels — applied to both width and height. Default: 20 */
  size?: number | string

  /** outline: line colour · filled: background colour. Default: currentColor */
  color?: string

  /** Stroke width override — default: 2.5 (outline), 2.6 (filled) */
  strokeWidth?: number

  /** Accessible label — if provided, icon becomes non-decorative */
  label?: string

  /** "outline" (default) or "filled" */
  variant?: IconVariant

  /** filled only: glyph colour. Default: white or near-black, whichever contrasts more */
  glyphColor?: string

  /** filled only: "rounded" (default) or "circle" */
  shape?: IconShape
}

/**
 * Shared base for all yuktai icons.
 * Children should be SVG path/circle/rect elements.
 */
export function IconBase({
  size = 20,
  color,
  strokeWidth,
  label,
  variant,
  glyphColor,
  shape,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  const isDecorative = !label
  const resolved = resolveIconColours({ variant, color, glyphColor, shape })
  const filled = resolved.variant === "filled"
  const sw = strokeWidth ?? (filled ? 2.6 : 2.5)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={filled ? undefined : resolved.color}
      strokeWidth={filled ? undefined : sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={isDecorative ? "true" : undefined}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      data-variant={resolved.variant}
      {...rest}
    >
      {filled ? (
        <>
          <style>{FORCED_COLORS_CSS}</style>
          {shape === "circle" ? (
            <circle className="yi-bg" cx="12" cy="12" r="12" fill={resolved.color} />
          ) : (
            <rect className="yi-bg" width="24" height="24" rx="6" fill={resolved.color} />
          )}
          <g className="yi-glyph" color={resolved.glyph} stroke={resolved.glyph} strokeWidth={sw} transform={FILLED_GLYPH_TRANSFORM}>
            {children}
          </g>
        </>
      ) : (
        children
      )}
    </svg>
  )
}
