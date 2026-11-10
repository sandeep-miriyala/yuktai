// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · layout.tsx
// Box, Stack, Grid, Container, Typography, Paper, Card…, Divider, AppBar,
// Toolbar, Link, List…, SvgIcon, GlobalStyles, transitions, ClickAwayListener.
// ─────────────────────────────────────────────────────────────────────────────

import React, { cloneElement, createContext, isValidElement, useContext, useEffect, useInsertionEffect, useMemo, useRef } from "react"
import { cap, colorClass, cx, elementRef, flatChildren, mergeRefs, ui, type UIProps } from "./base"
import { BREAKPOINT_KEYS, BREAKPOINTS, palette, paletteColor, spacing as themeSpacing, theme } from "./theme"
import { globalCss, insertRule } from "./sx"

/* ───────────── Box ───────────── */

export const Box = ui("Box", ({ ykClass, Comp, className, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiBox-root", ykClass, className)} {...p} />
), { system: true })

/* ───────────── Stack ───────────── */

const resp = <T,>(v: T | Partial<Record<string, T>> | T[] | undefined, map: (x: T) => unknown): unknown => {
  if (v === undefined || v === null) return undefined
  if (Array.isArray(v)) return v.map(map)
  if (typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, T>).map(([k, x]) => [k, map(x)]))
  return map(v as T)
}

export const Stack = ui("Stack", ({ ykClass, Comp, className, direction, spacing, divider, useFlexGap: _g, children, ...p }, ref) => {
  const layout = useLayoutClass({
    flexDirection: resp(direction, (d) => d),
    gap: resp(spacing, (s: number | string) => (typeof s === "number" ? themeSpacing(s) : s)),
  })
  let kids: React.ReactNode = children
  if (divider) {
    const list = flatChildren(children)
    kids = list.flatMap((c, i) => (i === 0 ? [c] : [isValidElement(divider) ? cloneElement(divider as React.ReactElement, { key: `d${i}` }) : divider, c]))
  }
  return (
    <Comp ref={ref} className={cx("MuiStack-root", layout, ykClass, className)} {...p}>
      {kids}
    </Comp>
  )
}, { system: true })

/** A class for layout values that come from props (Stack direction, Grid sizes). */
function useLayoutClass(styles: Record<string, unknown>): string {
  const clean = Object.fromEntries(Object.entries(styles).filter(([, v]) => v !== undefined))
  const key = JSON.stringify(clean)
  const name = useMemo(() => {
    if (key === "{}") return ""
    let h = 5381
    for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) | 0
    const n = `ykl-${(h >>> 0).toString(36)}`
    insertRuleFromStyles(n, clean)
    return n
  }, [key])
  useInsertionEffect(() => {
    if (name) insertRuleFromStyles(name, clean)
  }, [name])
  return name
}

function insertRuleFromStyles(name: string, styles: Record<string, unknown>) {
  insertRule(name, globalCss({ [`.${name}`]: styles }))
}

/* ───────────── Grid (12 columns, gap based) ───────────── */

const GridCtx = createContext<{ gap: unknown; columns: number } | null>(null)

const gridWidth = (span: unknown, columns: number, gap: string) => {
  if (span === true || span === "grow") return { flex: "1 1 0", minWidth: 0, maxWidth: "100%" }
  if (span === "auto") return { flex: "0 0 auto", width: "auto", maxWidth: "none" }
  const n = Number(span)
  if (!n) return undefined
  const w = `calc(${(n / columns) * 100}% - ${gap} * ${(columns - n) / columns})`
  return { flex: `0 0 ${w}`, maxWidth: w }
}

export const Grid = ui("Grid", ({ ykClass, Comp, className, container, item: _item, spacing, rowSpacing, columnSpacing, columns = 12, size, xs, sm, md, lg, xl, offset: _o, wrap, direction, children, ...p }, ref) => {
  const parent = useContext(GridCtx)
  const toGap = (s: unknown) => (typeof s === "number" ? themeSpacing(s) : (s as string))
  const sizes: Record<string, unknown> = typeof size === "object" && size !== null ? size : size !== undefined ? { xs: size } : { xs, sm, md, lg, xl }
  const gapNow = parent ? (typeof parent.gap === "object" ? "0px" : toGap(parent.gap ?? 0) ?? "0px") : "0px"
  const itemStyles: Record<string, unknown> = {}
  if (parent) {
    for (const bp of BREAKPOINT_KEYS) {
      const s = sizes[bp]
      if (s === undefined) continue
      const w = gridWidth(s, parent.columns, gapNow)
      if (!w) continue
      for (const [k, v] of Object.entries(w)) (itemStyles[k] = (itemStyles[k] as Record<string, unknown>) ?? {}), ((itemStyles[k] as Record<string, unknown>)[bp] = v)
    }
  }
  const layout = useLayoutClass({
    ...(container
      ? {
          display: "flex",
          flexWrap: wrap ?? "wrap",
          flexDirection: direction,
          rowGap: resp(rowSpacing ?? spacing, toGap),
          columnGap: resp(columnSpacing ?? spacing, toGap),
        }
      : {}),
    ...itemStyles,
  })
  const node = (
    <Comp ref={ref} className={cx("MuiGrid-root", container && "MuiGrid-container", layout, ykClass, className)} {...p}>
      {children}
    </Comp>
  )
  return container ? <GridCtx.Provider value={{ gap: columnSpacing ?? spacing ?? 0, columns }}>{node}</GridCtx.Provider> : node
}, { system: true })

/* ───────────── Container ───────────── */

export const Container = ui("Container", ({ ykClass, Comp, className, maxWidth = "lg", disableGutters, fixed: _f, ...p }, ref) => {
  const layout = useLayoutClass({ maxWidth: maxWidth ? `${BREAKPOINTS[maxWidth as keyof typeof BREAKPOINTS] ?? maxWidth}px` : undefined })
  return <Comp ref={ref} className={cx("MuiContainer-root", disableGutters && "MuiContainer-disableGutters", layout, ykClass, className)} {...p} />
}, { system: true })

/* ───────────── Typography ───────────── */

const TAG: Record<string, string> = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
  subtitle1: "h6", subtitle2: "h6", body1: "p", body2: "p", inherit: "p",
  caption: "span", overline: "span", button: "span",
}

export const Typography = ui("Typography", ({ ykClass, Comp, ykHasComp, className, variant = "body1", align, color, gutterBottom, noWrap, paragraph, variantMapping, ...p }, ref) => {
  const tag = paragraph ? "p" : (variantMapping?.[variant] ?? TAG[variant] ?? "span")
  const styles: Record<string, unknown> = {}
  if (align && align !== "inherit") styles.textAlign = align
  if (color) styles.color = typeof color === "string" && ["primary", "secondary", "error", "warning", "info", "success"].includes(color) ? (palette as any)[color].main : paletteColor(color)
  const extra = useLayoutClass(styles)
  const Tag = ykHasComp ? Comp : tag
  return (
    <Tag
      ref={ref}
      className={cx(
        "MuiTypography-root",
        `MuiTypography-${variant}`,
        `yk-t-${variant}`,
        gutterBottom && "MuiTypography-gutterBottom",
        noWrap && "MuiTypography-noWrap",
        paragraph && "MuiTypography-paragraph",
        extra,
        ykClass,
        className,
      )}
      {...p}
    />
  )
}, { system: true, keep: ["color"] })

/* typography variant styles, written once */
insertRule(
  "yk-type",
  Object.entries({
    h1: "font-size:clamp(2.25rem,1.6rem + 2.6vw,3.25rem);font-weight:700;line-height:1.2",
    h2: "font-size:clamp(1.875rem,1.4rem + 1.9vw,2.5rem);font-weight:700;line-height:1.25",
    h3: "font-size:clamp(1.5rem,1.2rem + 1.2vw,2rem);font-weight:700;line-height:1.3",
    h4: "font-size:clamp(1.3rem,1.1rem + .8vw,1.65rem);font-weight:700;line-height:1.35",
    h5: "font-size:1.25rem;font-weight:700;line-height:1.4",
    h6: "font-size:1.125rem;font-weight:700;line-height:1.45",
    subtitle1: "font-size:1.0625rem;font-weight:600;line-height:1.6",
    subtitle2: "font-size:.9375rem;font-weight:600;line-height:1.6",
    body1: "font-size:1rem;line-height:1.7",
    body2: "font-size:.9375rem;line-height:1.65",
    caption: "font-size:.8125rem;line-height:1.6",
    overline: "font-size:.75rem;font-weight:600;line-height:2;letter-spacing:.08em;text-transform:uppercase",
    button: "font-size:.9375rem;font-weight:600;line-height:1.6",
    inherit: "font:inherit",
  })
    .map(([k, v]) => `:where(.yk-t-${k}){${v}}`)
    .join(""),
  true,
)

/* ───────────── Paper, Card ───────────── */

const elevationShadow = (e: number) => theme.shadows[Math.max(0, Math.min(24, e))]

export const Paper = ui("Paper", ({ ykClass, Comp, className, elevation = 1, square, variant = "elevation", ...p }, ref) => {
  const shadow = useLayoutClass(variant === "elevation" ? { boxShadow: elevationShadow(elevation) } : {})
  return (
    <Comp
      ref={ref}
      className={cx("MuiPaper-root", variant === "outlined" ? "MuiPaper-outlined" : `MuiPaper-elevation MuiPaper-elevation${elevation}`, square ? "MuiPaper-square" : "MuiPaper-rounded", shadow, ykClass, className)}
      {...p}
    />
  )
})

export const Card = ui("Card", ({ ykClass, Comp, className, raised, elevation, variant, ...p }, ref) => (
  <Paper ref={ref} component={Comp} elevation={raised ? 8 : elevation ?? 1} variant={variant} className={cx("MuiCard-root", ykClass, className)} {...p} />
))
export const CardContent = ui("CardContent", ({ ykClass, Comp, className, ...p }, ref) => <Comp ref={ref} className={cx("MuiCardContent-root", ykClass, className)} {...p} />)
export const CardActions = ui("CardActions", ({ ykClass, Comp, className, disableSpacing: _d, ...p }, ref) => <Comp ref={ref} className={cx("MuiCardActions-root", ykClass, className)} {...p} />)
export const CardHeader = ui("CardHeader", ({ ykClass, Comp, className, avatar, action, title, subheader, titleTypographyProps, subheaderTypographyProps, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiCardHeader-root", ykClass, className)} {...p}>
    {avatar && <div className="MuiCardHeader-avatar">{avatar}</div>}
    <div className="MuiCardHeader-content">
      {title && <Typography variant="h6" component="span" display="block" {...titleTypographyProps}>{title}</Typography>}
      {subheader && <Typography variant="body2" color="text.secondary" component="span" display="block" {...subheaderTypographyProps}>{subheader}</Typography>}
    </div>
    {action && <div className="MuiCardHeader-action">{action}</div>}
  </Comp>
))
export const CardMedia = ui("CardMedia", ({ ykClass, Comp, className, image, src, alt, title, style, ...p }, ref) => {
  const isMedia = ["img", "video", "audio", "picture", "iframe"].includes(Comp)
  return isMedia ? (
    <Comp ref={ref} className={cx("MuiCardMedia-root", ykClass, className)} src={src ?? image} alt={alt ?? title ?? ""} title={title} style={style} {...p} />
  ) : (
    <Comp ref={ref} role={title ? "img" : undefined} aria-label={title} className={cx("MuiCardMedia-root", ykClass, className)} style={{ backgroundImage: image ? `url("${image}")` : undefined, ...style }} {...p} />
  )
})
export const CardActionArea = ui("CardActionArea", ({ ykClass, Comp, className, ...p }, ref) => (
  <Comp ref={ref} type={Comp === "button" ? "button" : undefined} className={cx("MuiCardActionArea-root MuiButtonBase-root yk-reset", ykClass, className)} {...p} />
), { tag: "button" })

/* ───────────── Divider ───────────── */

export const Divider = ui("Divider", ({ ykClass, Comp, ykHasComp, className, orientation = "horizontal", flexItem, variant = "fullWidth", textAlign = "center", light: _l, children, ...p }, ref) => {
  const withChildren = children !== undefined && children !== null
  const Tag = ykHasComp ? Comp : withChildren || orientation === "vertical" ? "div" : "hr"
  return (
    <Tag
      ref={ref}
      role={Tag === "hr" ? undefined : "separator"}
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      className={cx(
        "MuiDivider-root",
        orientation === "vertical" && "MuiDivider-vertical",
        flexItem && "MuiDivider-flexItem",
        variant === "middle" && "MuiDivider-middle",
        withChildren && `MuiDivider-withChildren MuiDivider-textAlign${cap(textAlign)}`,
        ykClass,
        className,
      )}
      {...p}
    >
      {withChildren ? <span className="MuiDivider-wrapper">{children}</span> : undefined}
    </Tag>
  )
})

/* ───────────── AppBar, Toolbar ───────────── */

export const AppBar = ui("AppBar", ({ ykClass, Comp, className, position = "fixed", color = "primary", elevation = 4, enableColorOnDark: _e, ...p }, ref) => (
  <Paper
    ref={ref}
    component={Comp}
    square
    elevation={elevation}
    className={cx("MuiAppBar-root", `MuiAppBar-position${cap(position)}`, colorClass(color), ykClass, className)}
    {...p}
  />
), { tag: "header" })

export const Toolbar = ui("Toolbar", ({ ykClass, Comp, className, variant = "regular", disableGutters, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiToolbar-root", variant === "dense" && "MuiToolbar-dense", disableGutters && "MuiToolbar-disableGutters", ykClass, className)} {...p} />
))

/* ───────────── Link ───────────── */

export const Link = ui("Link", ({ ykClass, Comp, className, underline = "always", color, variant, ...p }, ref) => {
  const styles = useLayoutClass(color ? { color: paletteColor(color === "primary" || color === "secondary" ? `${color}.main` : color) } : {})
  return (
    <Comp
      ref={ref}
      className={cx("MuiLink-root", `MuiLink-underline${cap(underline)}`, variant && `MuiTypography-root yk-t-${variant}`, Comp === "button" && "MuiLink-button", styles, ykClass, className)}
      {...(Comp === "button" ? { type: "button" } : {})}
      {...p}
    />
  )
}, { tag: "a", system: true, keep: ["color"] })

/* ───────────── Lists ───────────── */

export const List = ui("List", ({ ykClass, Comp, className, style, dense, disablePadding, subheader, children, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiList-root", dense && "MuiList-dense", disablePadding && "MuiList-padding-none", ykClass, className)} style={disablePadding ? { padding: 0, ...style } : style} {...p}>
    {subheader}
    {children}
  </Comp>
), { tag: "ul" })

export const ListItem = ui("ListItem", ({ ykClass, Comp, className, style, secondaryAction, disablePadding, disableGutters, divider, alignItems, dense: _d, button: _b, children, ...p }, ref) => (
  <Comp
    ref={ref}
    className={cx("MuiListItem-root", disablePadding && "MuiListItem-disablePadding", divider && "MuiListItem-divider", ykClass, className)}
    style={{ ...(disableGutters ? { paddingLeft: 0, paddingRight: 0 } : {}), ...(divider ? { borderBottom: `1px solid ${palette.divider}` } : {}), ...(alignItems === "flex-start" ? { alignItems: "flex-start" } : {}), ...style }}
    {...p}
  >
    {children}
    {secondaryAction && <div className="MuiListItemSecondaryAction-root" style={{ marginLeft: "auto" }}>{secondaryAction}</div>}
  </Comp>
), { tag: "li" })

export const ListItemButton = ui("ListItemButton", ({ ykClass, Comp, ykHasComp, className, style, selected, disabled, dense: _d, divider, alignItems, autoFocus, disableGutters: _g, onKeyDown, onClick, ...p }, ref) => {
  const isNative = !ykHasComp
  const own = useRef<HTMLElement>(null)
  useEffect(() => {
    if (autoFocus) own.current?.focus()
  }, [autoFocus])
  return (
    <Comp
      ref={mergeRefs(ref, own)}
      role={isNative ? "button" : undefined}
      tabIndex={isNative ? (disabled ? -1 : 0) : undefined}
      aria-disabled={disabled || undefined}
      aria-current={selected && !isNative ? "page" : undefined}
      aria-pressed={selected && isNative ? true : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e)
        if (isNative && !e.defaultPrevented && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).click()
        }
      }}
      className={cx(
        "MuiListItemButton-root MuiButtonBase-root",
        selected && "Mui-selected",
        disabled && "Mui-disabled",
        divider && "MuiListItemButton-divider",
        ykClass,
        className,
      )}
      style={{ ...(alignItems === "flex-start" ? { alignItems: "flex-start" } : {}), ...(divider ? { borderBottom: `1px solid ${palette.divider}` } : {}), ...style }}
      {...p}
    />
  )
})

export const ListItemIcon = ui("ListItemIcon", ({ ykClass, Comp, className, ...p }, ref) => <Comp ref={ref} className={cx("MuiListItemIcon-root", ykClass, className)} {...p} />)
export const ListItemAvatar = ui("ListItemAvatar", ({ ykClass, Comp, className, style, ...p }, ref) => <Comp ref={ref} className={cx("MuiListItemAvatar-root", ykClass, className)} style={{ minWidth: 56, ...style }} {...p} />)

export const ListItemText = ui("ListItemText", ({ ykClass, Comp, className, style, primary, secondary, primaryTypographyProps, secondaryTypographyProps, slotProps, inset, disableTypography, children, ...p }, ref) => {
  const prim = primary ?? children
  const pp = { ...primaryTypographyProps, ...slotProps?.primary }
  const sp = { ...secondaryTypographyProps, ...slotProps?.secondary }
  return (
    <Comp ref={ref} className={cx("MuiListItemText-root", secondary && "MuiListItemText-multiline", ykClass, className)} style={inset ? { paddingLeft: 56, ...style } : style} {...p}>
      {prim !== undefined && prim !== null && (disableTypography ? prim : <Typography variant="body1" component="span" {...pp} className={cx("MuiListItemText-primary", pp.className)}>{prim}</Typography>)}
      {secondary !== undefined && secondary !== null && (disableTypography ? secondary : <Typography variant="body2" component="span" {...sp} className={cx("MuiListItemText-secondary", sp.className)}>{secondary}</Typography>)}
    </Comp>
  )
})

export const ListSubheader = ui("ListSubheader", ({ ykClass, Comp, className, disableSticky, inset: _i, disableGutters: _g, color: _c, ...p }, ref) => (
  <Comp ref={ref} className={cx("MuiListSubheader-root", !disableSticky && "MuiListSubheader-sticky", ykClass, className)} {...p} />
), { tag: "li" })

/* ───────────── SvgIcon ───────────── */

export const SvgIcon = ui("SvgIcon", ({ ykClass, Comp, ykHasComp, className, style, fontSize = "medium", color, htmlColor, titleAccess, viewBox = "0 0 24 24", inheritViewBox: _v, children, ...p }, ref) => {
  const colorValue = htmlColor ?? (color && color !== "inherit" ? (["primary", "secondary", "error", "warning", "info", "success"].includes(color) ? (palette as any)[color].main : color === "action" ? palette.action.active : color === "disabled" ? palette.action.disabled : undefined) : undefined)
  const Tag = ykHasComp ? Comp : "svg"
  return (
    <Tag
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      focusable="false"
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? "img" : undefined}
      className={cx("MuiSvgIcon-root", fontSize !== "medium" && `MuiSvgIcon-fontSize${cap(fontSize)}`, ykClass, className)}
      style={colorValue ? { color: colorValue, ...style } : style}
      {...p}
    >
      {children}
      {titleAccess ? <title>{titleAccess}</title> : null}
    </Tag>
  )
})
;(SvgIcon as any).muiName = "SvgIcon"

/* ───────────── GlobalStyles, CssBaseline, ThemeProvider ───────────── */

export function GlobalStyles({ styles }: { styles: Record<string, unknown> | ((t: typeof theme) => Record<string, unknown>) | string }) {
  const css = useMemo(() => (typeof styles === "string" ? styles : globalCss(styles)), [styles])
  const key = useMemo(() => {
    let h = 5381
    for (let i = 0; i < css.length; i++) h = ((h << 5) + h + css.charCodeAt(i)) | 0
    return `ykg-${(h >>> 0).toString(36)}`
  }, [css])
  insertRule(key, css)
  useInsertionEffect(() => insertRule(key, css), [key, css])
  return null
}

export function CssBaseline({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
export function ThemeProvider({ children }: { children?: React.ReactNode; theme?: unknown }) {
  return <>{children}</>
}
export const StyledEngineProvider = ThemeProvider

/* ───────────── Transitions (Fade, Zoom, Grow, Slide) ───────────── */

function transition(kind: "fade" | "zoom" | "grow" | "slide") {
  return function Transition({ in: show = true, children, timeout = 200, unmountOnExit, mountOnEnter, appear: _a, style, direction = "up", easing: _e, onEntered, onExited, ...rest }: UIProps) {
    const seen = useRef(show)
    if (show) seen.current = true
    useEffect(() => {
      const ms = typeof timeout === "number" ? timeout : (timeout?.enter ?? 200)
      const t = setTimeout(() => (show ? onEntered?.() : onExited?.()), ms)
      return () => clearTimeout(t)
    }, [show])
    if (!isValidElement(children)) return null
    if (!show && (unmountOnExit || (mountOnEnter && !seen.current))) return null
    const ms = typeof timeout === "number" ? timeout : (timeout?.enter ?? 200)
    const hidden: React.CSSProperties = { opacity: 0, visibility: "hidden" }
    if (kind === "zoom") hidden.transform = "scale(0)"
    if (kind === "grow") hidden.transform = "scale(0.75, 0.5625)"
    if (kind === "slide") hidden.transform = direction === "up" ? "translateY(100%)" : direction === "down" ? "translateY(-100%)" : direction === "left" ? "translateX(100%)" : "translateX(-100%)"
    const childStyle = (children.props as { style?: React.CSSProperties }).style
    return cloneElement(children as React.ReactElement<any>, {
      ...rest,
      style: {
        transition: `opacity ${ms}ms ease, transform ${ms}ms ease${show ? "" : `, visibility 0s linear ${ms}ms`}`,
        ...(show ? { opacity: 1, transform: "none", visibility: "visible" } : hidden),
        ...style,
        ...childStyle,
      },
    })
  }
}
export const Fade = transition("fade")
export const Zoom = transition("zoom")
export const Grow = transition("grow")
export const Slide = transition("slide")

/* ───────────── ClickAwayListener ───────────── */

export function ClickAwayListener({ children, onClickAway, mouseEvent = "onClick", touchEvent = "onTouchEnd" }: UIProps) {
  const node = useRef<HTMLElement | null>(null)
  const cb = useRef(onClickAway)
  cb.current = onClickAway
  useEffect(() => {
    const evs: string[] = []
    if (mouseEvent) evs.push(String(mouseEvent).replace(/^on/, "").toLowerCase())
    if (touchEvent) evs.push(String(touchEvent).replace(/^on/, "").toLowerCase())
    let armed = false
    const arm = setTimeout(() => (armed = true), 0)
    const handler = (e: Event) => {
      if (!armed || !node.current) return
      const path = e.composedPath?.() ?? []
      if (path.includes(node.current) || node.current.contains(e.target as Node)) return
      cb.current?.(e)
    }
    evs.forEach((ev) => document.addEventListener(ev, handler))
    return () => {
      clearTimeout(arm)
      evs.forEach((ev) => document.removeEventListener(ev, handler))
    }
  }, [mouseEvent, touchEvent])
  if (!isValidElement(children)) return <>{children}</>
  return cloneElement(children as React.ReactElement<any>, { ref: mergeRefs(elementRef(children), node) })
}
