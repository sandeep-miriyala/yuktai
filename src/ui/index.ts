// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui
//
// YuktAI UI: accessible React components with the names and props that
// Material code already uses, so an app moves to YuktAI by changing one
// import line:
//
//   import { Box, Button, Dialog, Tabs } from "@yuktishaalaa/yuktai/ui"
//
// • No runtime dependencies (no emotion, no MUI). One small style engine.
// • Real elements: <button>, <select>, <input type="range">, <dialog>.
// • WCAG 2.2 by default: 44px targets, visible focus, labels wired to inputs,
//   Esc closes overlays and focus goes back, reduced motion respected.
// • The site's CSS variables (--primary, --foreground, --border…) are the theme.
// ─────────────────────────────────────────────────────────────────────────────

export * from "./layout"
export * from "./inputs"
export * from "./feedback"
export * from "./overlays"
export { Portal } from "./base"
export type { UIProps, UIComponent } from "./base"
export { theme, useTheme, createTheme, alpha, lighten, darken, paletteColor, breakpoints, BREAKPOINTS } from "./theme"
export type { Theme, Breakpoint, Palette } from "./theme"
export { useMediaQuery, sxToCss, getUiStyles, globalCss, cx } from "./sx"
export type { SxProps } from "./sx"
export { BASE_CSS } from "./styles"

import type React from "react"
import type { UIProps } from "./base"

/* Type names familiar code imports. The props are open (see UIProps). */
export type SelectChangeEvent<T = string> = (Event | React.ChangeEvent<HTMLSelectElement>) & { target: { value: T; name: string } }
export type SvgIconProps = UIProps & { fontSize?: "inherit" | "small" | "medium" | "large" | string; color?: string; htmlColor?: string; titleAccess?: string; viewBox?: string }
export type SvgIconComponent = React.ComponentType<SvgIconProps> & { muiName?: string }
export type ButtonProps = UIProps
export type IconButtonProps = UIProps
export type BoxProps = UIProps
export type StackProps = UIProps
export type TypographyProps = UIProps
export type TextFieldProps = UIProps
export type ChipProps = UIProps
export type DialogProps = UIProps
export type PaperProps = UIProps
export type CardProps = UIProps
export type TooltipProps = UIProps
export type AlertColor = "success" | "info" | "warning" | "error"
export type AlertProps = UIProps
export type SnackbarCloseReason = "timeout" | "clickaway" | "escapeKeyDown"
export type PaletteMode = "light" | "dark"
