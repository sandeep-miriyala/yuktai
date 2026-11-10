// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · feedback.tsx
// CircularProgress, LinearProgress, Skeleton, Alert, AlertTitle, Snackbar,
// SnackbarContent, Tooltip, Collapse, Badge, Avatar, Backdrop.
// ─────────────────────────────────────────────────────────────────────────────

import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react"
import { cap, colorClass, cx, elementRef, mergeRefs, Portal, textOf, ui, useId, type UIProps } from "./base"
import { ICON_PATHS } from "../icons/paths"

function Icon({ name }: { name: string }) {
  return (
    <svg className="MuiSvgIcon-root" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: (ICON_PATHS as Record<string, string>)[name] ?? "" }} />
    </svg>
  )
}

/* ───────────── progress ───────────── */

export function CircularProgressInner({ size = 40, thickness = 3.6, value, variant = "indeterminate", className, style, color, ...p }: UIProps) {
  const r = (44 - thickness) / 2
  const c = 2 * Math.PI * r
  const determinate = variant === "determinate"
  return (
    <span
      role="progressbar"
      aria-valuenow={determinate ? Math.round(value ?? 0) : undefined}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      className={cx("MuiCircularProgress-root", !determinate && "MuiCircularProgress-indeterminate", color && colorClass(color), className)}
      style={{ width: size, height: size, ...style }}
      {...p}
    >
      <svg className="MuiCircularProgress-svg" viewBox="22 22 44 44" width={size} height={size} style={determinate ? { transform: "rotate(-90deg)" } : undefined}>
        <circle
          className="MuiCircularProgress-circle"
          cx="44"
          cy="44"
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          style={determinate ? { strokeDasharray: c.toFixed(3), strokeDashoffset: `${(((100 - (value ?? 0)) / 100) * c).toFixed(3)}px`, transition: "stroke-dashoffset .3s" } : undefined}
        />
      </svg>
    </span>
  )
}

export const CircularProgress = ui("CircularProgress", ({ ykClass, Comp: _c, className, color = "primary", disableShrink: _d, enableTrackSlot: _t, ...p }, ref) => (
  <CircularProgressInner ref={ref} color={color} className={cx(ykClass, className)} {...p} />
))

export const LinearProgress = ui("LinearProgress", ({ ykClass, Comp: _c, className, style, variant = "indeterminate", value = 0, valueBuffer: _b, color = "primary", ...p }, ref) => {
  const determinate = variant === "determinate" || variant === "buffer"
  return (
    <span
      ref={ref}
      role="progressbar"
      aria-valuenow={determinate ? Math.round(value) : undefined}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      className={cx("MuiLinearProgress-root", `MuiLinearProgress-${variant}`, !determinate && "MuiLinearProgress-indeterminate", colorClass(color), ykClass, className)}
      style={{ display: "block", ...style }}
      {...p}
    >
      <span className="MuiLinearProgress-bar MuiLinearProgress-bar1" style={determinate ? { width: `${Math.max(0, Math.min(100, value))}%` } : undefined} />
    </span>
  )
})

export const Skeleton = ui("Skeleton", ({ ykClass, Comp, className, variant = "text", width, height, animation = "pulse", style, children, ...p }, ref) => (
  <Comp
    ref={ref}
    aria-hidden="true"
    className={cx("MuiSkeleton-root", `MuiSkeleton-${variant}`, animation && `MuiSkeleton-${animation}`, ykClass, className)}
    style={{ width, height: height ?? (variant === "text" ? undefined : variant === "circular" ? width : undefined), ...style }}
    {...p}
  >
    {children ? <span style={{ visibility: "hidden" }}>{children}</span> : null}
  </Comp>
), { tag: "span" })

/* ───────────── Alert ───────────── */

const SEVERITY_ICON: Record<string, string> = { success: "check", info: "info", warning: "alert", error: "alert" }

export const Alert = ui("Alert", ({ ykClass, Comp, className, severity = "success", color, variant = "standard", icon, iconMapping, action, onClose, closeText = "Close", role = "alert", title: _t, slots: _s, slotProps: _sp, children, ...p }, ref) => {
  const tone = color ?? severity
  const shown = icon === false ? null : (icon ?? iconMapping?.[severity] ?? <Icon name={SEVERITY_ICON[severity] ?? "info"} />)
  return (
    <Comp ref={ref} role={role} className={cx("MuiPaper-root MuiAlert-root", `MuiAlert-${variant}`, `MuiAlert-${variant}${cap(tone)}`, `MuiAlert-color${cap(tone)}`, colorClass(tone), ykClass, className)} {...p}>
      {shown && <div className="MuiAlert-icon">{shown}</div>}
      <div className="MuiAlert-message">{children}</div>
      {(action || onClose) && (
        <div className="MuiAlert-action">
          {action ?? (
            <button type="button" aria-label={closeText} title={closeText} onClick={onClose} className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeSmall yk-c-default">
              <Icon name="close" />
            </button>
          )}
        </div>
      )}
    </Comp>
  )
})

export const AlertTitle = ui("AlertTitle", ({ ykClass, Comp, className, ...p }, ref) => <Comp ref={ref} className={cx("MuiTypography-root MuiAlertTitle-root", ykClass, className)} {...p} />)

/* ───────────── Snackbar ───────────── */

export const SnackbarContent = ui("SnackbarContent", ({ ykClass, Comp, className, message, action, role = "alert", ...p }, ref) => (
  <Comp ref={ref} role={role} className={cx("MuiPaper-root MuiSnackbarContent-root", ykClass, className)} {...p}>
    <div className="MuiSnackbarContent-message">{message}</div>
    {action && <div className="MuiSnackbarContent-action">{action}</div>}
  </Comp>
))

export const Snackbar = ui("Snackbar", ({ ykClass, Comp, className, open, autoHideDuration, onClose, message, action, anchorOrigin = { vertical: "bottom", horizontal: "left" }, ContentProps, TransitionComponent: _tc, TransitionProps: _tp, disableWindowBlurListener: _d, resumeHideDuration: _r, ClickAwayListenerProps: _ca, slotProps: _sp, key: _k, children, ...p }, ref) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open || !autoHideDuration) return
    timer.current = setTimeout(() => close.current?.(null, "timeout"), autoHideDuration)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [open, autoHideDuration])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current?.(e, "escapeKeyDown")
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])
  if (!open) return null
  return (
    <Portal>
      <Comp
        ref={ref}
        className={cx("MuiSnackbar-root", `MuiSnackbar-anchorOrigin${cap(anchorOrigin.vertical)}${cap(anchorOrigin.horizontal)}`, ykClass, className)}
        onMouseEnter={() => timer.current && clearTimeout(timer.current)}
        {...p}
      >
        {children ?? <SnackbarContent message={message} action={action} {...ContentProps} />}
      </Comp>
    </Portal>
  )
})

/* ───────────── Tooltip ───────────── */

export function Tooltip({ title, children, placement = "bottom", arrow: _a, enterDelay = 120, leaveDelay = 0, open: controlled, onOpen, onClose, describeChild, disableHoverListener, disableFocusListener, disableTouchListener: _t, followCursor: _f, PopperProps: _pp, slotProps, componentsProps: _cp, TransitionComponent: _tc, enterTouchDelay: _et, leaveTouchDelay: _lt, id: idProp }: UIProps) {
  const id = useId(idProp)
  const anchor = useRef<HTMLElement | null>(null)
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const open = controlled ?? show
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tip = useRef<HTMLDivElement | null>(null)
  const [tipEl, setTipEl] = useState<HTMLDivElement | null>(null)

  const place = () => {
    const a = anchor.current?.getBoundingClientRect()
    const t = tip.current?.getBoundingClientRect()
    if (!a || !t) return
    const gap = 8
    let top = placement.startsWith("top") ? a.top - t.height - gap : placement.startsWith("left") || placement.startsWith("right") ? a.top + a.height / 2 - t.height / 2 : a.bottom + gap
    let left = placement.startsWith("left") ? a.left - t.width - gap : placement.startsWith("right") ? a.right + gap : a.left + a.width / 2 - t.width / 2
    if (top < 8) top = a.bottom + gap
    if (top + t.height > window.innerHeight - 8) top = a.top - t.height - gap
    left = Math.max(8, Math.min(left, window.innerWidth - t.width - 8))
    setPos({ top, left })
  }
  useEffect(() => {
    if (!open) return setPos(null)
    if (!tipEl) return
    place()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShow(false)
        onClose?.(e)
      }
    }
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    document.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, tipEl])

  if (!isValidElement(children)) return <>{children}</>
  const empty = title === "" || title === null || title === undefined || title === false
  if (empty) return children
  const cp = children.props as UIProps
  const begin = (e: React.SyntheticEvent) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setShow(true)
      onOpen?.(e)
    }, enterDelay)
  }
  const end = (e: React.SyntheticEvent) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setShow(false)
      onClose?.(e)
    }, leaveDelay)
  }
  const label = typeof title === "string" || typeof title === "number" ? String(title) : textOf(title)
  const needsLabel = !describeChild && !cp["aria-label"] && !cp["aria-labelledby"] && !textOf(cp.children).trim()
  const childProps: UIProps = {
    ref: mergeRefs(elementRef(children), anchor),
    "aria-describedby": open && !needsLabel ? id : cp["aria-describedby"],
    ...(needsLabel ? { "aria-label": label } : {}),
  }
  if (!disableHoverListener) {
    childProps.onMouseEnter = (e: React.MouseEvent) => (cp.onMouseEnter?.(e), begin(e))
    childProps.onMouseLeave = (e: React.MouseEvent) => (cp.onMouseLeave?.(e), end(e))
  }
  if (!disableFocusListener) {
    childProps.onFocus = (e: React.FocusEvent) => {
      cp.onFocus?.(e)
      try {
        if ((e.target as HTMLElement).matches(":focus-visible")) begin(e)
      } catch {
        begin(e)
      }
    }
    childProps.onBlur = (e: React.FocusEvent) => (cp.onBlur?.(e), end(e))
  }
  const tp = slotProps?.tooltip ?? {}
  return (
    <>
      {cloneElement(children as React.ReactElement<any>, childProps)}
      {open && (
        <Portal>
          <div className="MuiTooltip-popper" style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? undefined : "hidden" }}>
            <div ref={(n) => { tip.current = n; setTipEl(n) }} id={id} role="tooltip" {...tp} className={cx("MuiTooltip-tooltip", tp.className)}>
              {title}
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

/* ───────────── Collapse ───────────── */

export const Collapse = ui("Collapse", ({ ykClass, Comp, className, in: show = false, unmountOnExit, mountOnEnter, timeout = "auto", collapsedSize: _cs, orientation: _o, easing: _e, appear: _a, onEntered, onExited, addEndListener: _ae, children, style, ...p }, ref) => {
  const seen = useRef(show)
  if (show) seen.current = true
  const [gone, setGone] = useState(!show)
  useEffect(() => {
    if (show) {
      setGone(false)
      const t = setTimeout(() => onEntered?.(), 260)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setGone(true)
      onExited?.()
    }, typeof timeout === "number" ? timeout : 260)
    return () => clearTimeout(t)
  }, [show])
  if (!show && gone && (unmountOnExit || (mountOnEnter && !seen.current))) return null
  return (
    <Comp ref={ref} className={cx("MuiCollapse-root", show && "MuiCollapse-entered", !show && gone && "MuiCollapse-hidden", ykClass, className)} inert={!show ? true : undefined} style={style} {...p}>
      <div className="MuiCollapse-wrapper">
        <div className="MuiCollapse-wrapperInner">{children}</div>
      </div>
    </Comp>
  )
})

/* ───────────── Badge, Avatar, Backdrop ───────────── */

export const Badge = ui("Badge", ({ ykClass, Comp, className, style, badgeContent, color = "default", variant = "standard", invisible, max = 99, showZero, overlap: _o, anchorOrigin = { vertical: "top", horizontal: "right" }, children, ...p }, ref) => {
  const hide = invisible || ((badgeContent === 0 || badgeContent === undefined || badgeContent === null) && !showZero && variant !== "dot")
  const content = typeof badgeContent === "number" && badgeContent > max ? `${max}+` : badgeContent
  return (
    <Comp ref={ref} className={cx("MuiBadge-root", ykClass, className)} style={{ position: "relative", display: "inline-flex", verticalAlign: "middle", flexShrink: 0, ...style }} {...p}>
      {children}
      {!hide && (
        <span
          className={cx("MuiBadge-badge", variant === "dot" && "MuiBadge-dot", colorClass(color, "default"))}
          style={{
            position: "absolute",
            [anchorOrigin.vertical]: 0,
            [anchorOrigin.horizontal]: 0,
            transform: `translate(${anchorOrigin.horizontal === "right" ? "50%" : "-50%"}, ${anchorOrigin.vertical === "top" ? "-50%" : "50%"})`,
            minWidth: variant === "dot" ? 8 : 20,
            height: variant === "dot" ? 8 : 20,
            padding: variant === "dot" ? 0 : "0 6px",
            borderRadius: 999,
            fontSize: ".75rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--yk-c)",
            color: "var(--yk-on)",
          }}
        >
          {variant === "dot" ? null : content}
        </span>
      )}
    </Comp>
  )
}, { tag: "span" })

export const Avatar = ui("Avatar", ({ ykClass, Comp, className, style, src, alt, srcSet, sizes, variant = "circular", imgProps, children, ...p }, ref) => {
  const [broken, setBroken] = useState(false)
  return (
    <Comp
      ref={ref}
      className={cx("MuiAvatar-root", `MuiAvatar-${variant}`, ykClass, className)}
      style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, fontWeight: 600, borderRadius: variant === "circular" ? "50%" : variant === "rounded" ? 10 : 0, background: "color-mix(in srgb, var(--foreground, #1c2433) 12%, transparent)", ...style }}
      {...p}
    >
      {src && !broken ? <img src={src} alt={alt ?? ""} srcSet={srcSet} sizes={sizes} onError={() => setBroken(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} {...imgProps} /> : (children ?? (alt ? alt[0] : null))}
    </Comp>
  )
})

export const Backdrop = ui("Backdrop", ({ ykClass, Comp, className, open, invisible, transitionDuration: _t, ...p }, ref) =>
  open ? <Comp ref={ref} aria-hidden="true" className={cx("MuiBackdrop-root", invisible && "MuiBackdrop-invisible", ykClass, className)} {...p} /> : null,
)
