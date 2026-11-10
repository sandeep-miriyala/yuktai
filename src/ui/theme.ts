// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · theme.ts
//
// The YuktAI UI theme. Colours are CSS variables, so a site's own design
// tokens win (Ratnalabala's --primary, --foreground, --border…) and dark mode
// works without JavaScript. The fallbacks are YuktAI's AA/AAA defaults.
//
// Shape follows the widely known Material layout (palette.primary.main,
// spacing(2), breakpoints.down("sm")), so existing code keeps working.
// ─────────────────────────────────────────────────────────────────────────────

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl"

export const BREAKPOINTS: Record<Breakpoint, number> = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
export const BREAKPOINT_KEYS = Object.keys(BREAKPOINTS) as Breakpoint[]

const mix = (c: string, pct: number, other = "transparent") => `color-mix(in srgb, ${c} ${pct}%, ${other})`

function tone(main: string, contrast: string) {
  return { main, light: mix(main, 70, "white"), dark: mix(main, 78, "black"), contrastText: contrast }
}

const FG = "var(--foreground, #1c2433)"

export const palette = {
  mode: "light" as "light" | "dark",
  primary: tone("var(--primary, #1f4e8c)", "var(--on-primary, #ffffff)"),
  secondary: tone("var(--secondary, #173d6e)", "var(--on-secondary, #ffffff)"),
  error: tone("var(--error, #a1271b)", "#ffffff"),
  warning: tone("var(--warning, #6e4300)", "#ffffff"),
  info: tone("var(--info, #1f4e8c)", "#ffffff"),
  success: tone("var(--success, #1d6b3a)", "#ffffff"),
  text: { primary: FG, secondary: "var(--muted-text, #434c5c)", disabled: mix(FG, 45) },
  background: { default: "var(--background, #ffffff)", paper: "var(--surface-elevated, #ffffff)" },
  divider: "var(--border, #dde3ea)",
  action: {
    active: mix(FG, 60),
    hover: mix(FG, 6),
    selected: mix(FG, 10),
    focus: mix(FG, 12),
    disabled: mix(FG, 38),
    disabledBackground: mix(FG, 12),
  },
  common: { black: "#000000", white: "#ffffff" },
  grey: {
    50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8",
    500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a",
    A100: "#f1f5f9", A200: "#e2e8f0", A400: "#94a3b8", A700: "#334155",
  } as Record<string | number, string>,
  contrastThreshold: 4.5,
  tonalOffset: 0.2,
  getContrastText: (_c: string) => FG,
}

export type Palette = typeof palette

const query = (q: string) => `@media ${q}`
const px = (k: Breakpoint | number) => (typeof k === "number" ? k : BREAKPOINTS[k])

export const breakpoints = {
  keys: BREAKPOINT_KEYS,
  values: BREAKPOINTS,
  unit: "px",
  up: (k: Breakpoint | number) => query(`(min-width:${px(k)}px)`),
  down: (k: Breakpoint | number) => query(`(max-width:${px(k) - 0.05}px)`),
  between: (a: Breakpoint | number, b: Breakpoint | number) =>
    query(`(min-width:${px(a)}px) and (max-width:${px(b) - 0.05}px)`),
  only: (k: Breakpoint) => {
    const i = BREAKPOINT_KEYS.indexOf(k)
    const next = BREAKPOINT_KEYS.at(i + 1)
    return next ? breakpoints.between(k, next) : breakpoints.up(k)
  },
  not: (k: Breakpoint) => query(`not all and (min-width:${px(k)}px)`),
}

/** spacing(1) = "8px", spacing(1, 2) = "8px 16px", strings pass through. */
export function spacing(...args: (number | string)[]): string {
  if (args.length === 0) return "8px"
  return args.map((a) => (typeof a === "number" ? `${a * 8}px` : a)).join(" ")
}

const shadow = (n: number) =>
  n === 0 ? "none" : `0 ${Math.ceil(n / 2)}px ${n * 2}px rgba(15, 23, 42, ${Math.min(0.08 + n * 0.012, 0.3).toFixed(3)})`

export const theme = {
  palette,
  breakpoints,
  spacing,
  shape: { borderRadius: 4 },
  shadows: Array.from({ length: 25 }, (_, i) => shadow(i)),
  zIndex: { mobileStepper: 1000, fab: 1050, speedDial: 1050, appBar: 1100, drawer: 1200, modal: 1300, snackbar: 1400, tooltip: 1500 },
  typography: {
    fontFamily: "inherit",
    fontSize: 14,
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    pxToRem: (n: number) => `${n / 16}rem`,
  } as Record<string, any>,
  transitions: {
    duration: { shortest: 150, shorter: 200, short: 250, standard: 300, complex: 375, enteringScreen: 225, leavingScreen: 195 },
    easing: { easeInOut: "cubic-bezier(0.4,0,0.2,1)", easeOut: "cubic-bezier(0,0,0.2,1)", easeIn: "cubic-bezier(0.4,0,1,1)", sharp: "cubic-bezier(0.4,0,0.6,1)" },
    create: (props: string | string[] = "all", o: { duration?: number; delay?: number; easing?: string } = {}) =>
      (Array.isArray(props) ? props : [props])
        .map((p) => `${p} ${o.duration ?? 250}ms ${o.easing ?? "cubic-bezier(0.4,0,0.2,1)"} ${o.delay ?? 0}ms`)
        .join(", "),
  },
  direction: "ltr" as "ltr" | "rtl",
  components: {} as Record<string, unknown>,
  vars: undefined as unknown,
  applyStyles: (_mode: string, styles: Record<string, unknown>) => ({ "@media (prefers-color-scheme: dark)": styles }),
}

export type Theme = typeof theme

/** The same theme everywhere; tokens come from CSS variables. */
export function useTheme(): Theme {
  return theme
}

/** Kept for code that builds its own theme: returns the YuktAI theme with the overrides merged in. */
export function createTheme(overrides: Record<string, any> = {}): Theme {
  const merge = (a: any, b: any): any => {
    if (!b || typeof b !== "object" || Array.isArray(b)) return b ?? a
    const out: any = { ...a }
    for (const k of Object.keys(b)) out[k] = merge(a?.[k], b[k])
    return out
  }
  return merge(theme, overrides)
}

/** "text.secondary" → the CSS colour for it; anything else unchanged. */
export function paletteColor(value: unknown): unknown {
  if (typeof value !== "string") return value
  if (value === "divider") return palette.divider
  const m = /^([a-z]+)\.([A-Za-z0-9]+)$/.exec(value)
  if (!m) return value
  const group = (palette as Record<string, any>)[m[1]]
  const v = group?.[m[2]]
  return typeof v === "string" ? v : value
}

const SHORT_HEX = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i
const LONG_HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i

/** Colour with opacity. Hex and rgb become rgba(); CSS variables use color-mix(). */
export function alpha(color: string, value: number): string {
  const v = Math.max(0, Math.min(1, value))
  const c = String(paletteColor(color)).trim()
  let m = SHORT_HEX.exec(c)
  if (m) return `rgba(${parseInt(m[1] + m[1], 16)}, ${parseInt(m[2] + m[2], 16)}, ${parseInt(m[3] + m[3], 16)}, ${v})`
  m = LONG_HEX.exec(c)
  if (m) return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${v})`
  const rgb = /^rgba?\(([^,]+),([^,]+),([^,)]+)/.exec(c)
  if (rgb) return `rgba(${rgb[1].trim()}, ${rgb[2].trim()}, ${rgb[3].trim()}, ${v})`
  return mix(c, Math.round(v * 1000) / 10)
}

export const lighten = (color: string, amount: number) => mix(String(paletteColor(color)), Math.round((1 - amount) * 100), "white")
export const darken = (color: string, amount: number) => mix(String(paletteColor(color)), Math.round((1 - amount) * 100), "black")
