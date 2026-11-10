// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · overlays.tsx
// Dialog (a real <dialog>: focus trap, Esc, top layer), Drawer, Modal, Menu,
// Popover, Popper, Accordion, Tabs, Tab, Pagination, Breadcrumbs.
// ─────────────────────────────────────────────────────────────────────────────

import React, { cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useRef, useState } from "react"
import { cap, colorClass, cx, flatChildren, mergeRefs, placeNear, Portal, ui, useId, useIsoLayoutEffect, useScrollLock, type UIProps } from "./base"
import { Paper } from "./layout"
import { Glyph, MenuContext } from "./inputs"
import { Collapse } from "./feedback"

/* ───────────── Dialog ───────────── */

const DialogContext = createContext<{ titleId?: string }>({})

function useModalDialog(open: boolean, onClose: ((e: any, reason: string) => void) | undefined, disableEscapeKeyDown?: boolean, disableBackdropClose?: boolean) {
  const ref = useRef<HTMLDialogElement>(null)
  const pressedOnBackdrop = useRef(false)
  const opener = useRef<Element | null>(null)
  useIsoLayoutEffect(() => {
    const d = ref.current
    if (!d || !open) return
    opener.current = document.activeElement
    if (!d.open) {
      try {
        d.showModal()
      } catch {
        d.setAttribute("open", "")
      }
    }
    return () => {
      if (d.open) d.close()
      const back = opener.current as HTMLElement | null
      if (back && typeof back.focus === "function" && document.contains(back)) back.focus()
    }
  }, [open])
  useScrollLock(open)
  const handlers = {
    onCancel: (e: React.SyntheticEvent) => {
      e.preventDefault()
      if (!disableEscapeKeyDown) onClose?.(e, "escapeKeyDown")
    },
    onMouseDown: (e: React.MouseEvent) => {
      pressedOnBackdrop.current = e.target === e.currentTarget
    },
    onClick: (e: React.MouseEvent) => {
      if (pressedOnBackdrop.current && e.target === e.currentTarget && !disableBackdropClose) onClose?.(e, "backdropClick")
      pressedOnBackdrop.current = false
    },
  }
  return { ref, handlers }
}

export const Dialog = ui("Dialog", ({ ykClass, Comp: _c, className, open, onClose, fullWidth, fullScreen, maxWidth = "sm", scroll: _s, PaperProps = {}, PaperComponent: _pc, slotProps = {}, TransitionComponent: _t, TransitionProps: _tp, transitionDuration: _td, keepMounted: _k, disableEscapeKeyDown, disableScrollLock: _dl, disablePortal: _dp, disableEnforceFocus: _de, disableAutoFocus: _da, disableRestoreFocus: _dr, hideBackdrop: _hb, BackdropProps: _bp, slots: _sl, container: _co, "aria-labelledby": labelledBy, "aria-describedby": describedBy, "aria-label": ariaLabel, children, ...p }, ref) => {
  const auto = useId()
  const { ref: dref, handlers } = useModalDialog(!!open, onClose, disableEscapeKeyDown)
  if (!open) return null
  const pp = { ...PaperProps, ...slotProps.paper }
  const { className: pc, sx: psx, component: pcomp, ...pRest } = pp
  const mw = maxWidth === false ? "False" : cap(String(maxWidth))
  return (
    <DialogContext.Provider value={{ titleId: labelledBy ?? `${auto}-title` }}>
      <dialog
        ref={mergeRefs(dref, ref)}
        aria-labelledby={ariaLabel ? undefined : (labelledBy ?? `${auto}-title`)}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        aria-modal="true"
        className={cx("MuiDialog-root MuiModal-root", ykClass, className)}
        {...handlers}
        {...p}
      >
        <Paper
          component={pcomp}
          sx={psx}
          elevation={24}
          className={cx("MuiDialog-paper", `MuiDialog-paperWidth${mw}`, fullWidth && "MuiDialog-paperFullWidth", fullScreen && "MuiDialog-paperFullScreen", pc)}
          {...pRest}
        >
          {children}
        </Paper>
      </dialog>
    </DialogContext.Provider>
  )
})

export const DialogTitle = ui("DialogTitle", ({ ykClass, Comp, className, id, ...p }, ref) => {
  const ctx = useContext(DialogContext)
  return <Comp ref={ref} id={id ?? ctx.titleId} className={cx("MuiTypography-root MuiDialogTitle-root", ykClass, className)} {...p} />
}, { tag: "h2" })
export const DialogContent = ui("DialogContent", ({ ykClass, Comp, className, dividers, ...p }, ref) => <Comp ref={ref} className={cx("MuiDialogContent-root", dividers && "MuiDialogContent-dividers", ykClass, className)} {...p} />)
export const DialogContentText = ui("DialogContentText", ({ ykClass, Comp, className, ...p }, ref) => <Comp ref={ref} className={cx("MuiTypography-root MuiDialogContentText-root yk-t-body1", ykClass, className)} {...p} />, { tag: "p" })
export const DialogActions = ui("DialogActions", ({ ykClass, Comp, className, disableSpacing: _d, ...p }, ref) => <Comp ref={ref} className={cx("MuiDialogActions-root", ykClass, className)} {...p} />)

/* ───────────── Drawer ───────────── */

export const Drawer = ui("Drawer", ({ ykClass, Comp: _c, className, style, open, onClose, anchor = "left", variant = "temporary", PaperProps = {}, slotProps = {}, ModalProps: _m, SlideProps: _s, transitionDuration: _t, hideBackdrop: _h, elevation = 16, children, ...p }, ref) => {
  const pp = { ...PaperProps, ...slotProps.paper }
  const { className: pc, sx: psx, ...pRest } = pp
  const temporary = variant === "temporary"
  const { ref: dref, handlers } = useModalDialog(temporary && !!open, onClose)
  const paper = (
    <Paper square elevation={elevation} sx={psx} className={cx("MuiDrawer-paper", `MuiDrawer-paperAnchor${cap(anchor)}`, !temporary && `MuiDrawer-paperAnchorDocked`, pc)} {...pRest}>
      {children}
    </Paper>
  )
  if (!temporary) {
    if (variant === "persistent" && !open) return null
    return (
      <div ref={ref} className={cx("MuiDrawer-root MuiDrawer-docked", ykClass, className)} {...p}>
        {paper}
      </div>
    )
  }
  if (!open) return null
  return (
    <dialog ref={mergeRefs(dref, ref)} aria-modal="true" className={cx("MuiDialog-root MuiDrawer-root MuiDrawer-modal MuiModal-root", ykClass, className)} style={{ margin: 0, maxHeight: "none", height: "100dvh", width: "100vw", ...style }} {...handlers} {...p}>
      {paper}
    </dialog>
  )
})
export const SwipeableDrawer = Drawer

/* ───────────── Modal ───────────── */

export const Modal = ui("Modal", ({ ykClass, Comp: _c, className, style, open, onClose, disableEscapeKeyDown, keepMounted: _k, hideBackdrop: _h, BackdropProps: _b, slotProps: _s, disablePortal: _dp, disableAutoFocus: _da, disableEnforceFocus: _de, disableRestoreFocus: _dr, disableScrollLock: _dl, closeAfterTransition: _ct, children, ...p }, ref) => {
  const { ref: dref, handlers } = useModalDialog(!!open, onClose, disableEscapeKeyDown)
  if (!open) return null
  return (
    <dialog ref={mergeRefs(dref, ref)} aria-modal="true" className={cx("MuiDialog-root MuiModal-root", ykClass, className)} style={{ margin: 0, maxHeight: "none", maxWidth: "none", height: "100dvh", width: "100vw", ...style }} {...handlers} {...p}>
      {children}
    </dialog>
  )
})

/* ───────────── Popover, Menu, Popper ───────────── */

function anchorRect(anchorEl: unknown, anchorPosition?: { top: number; left: number }, reference?: string): DOMRect | null {
  if (reference === "anchorPosition" && anchorPosition) return new DOMRect(anchorPosition.left, anchorPosition.top, 0, 0)
  const el = typeof anchorEl === "function" ? anchorEl() : anchorEl
  if (el && typeof (el as Element).getBoundingClientRect === "function") return (el as Element).getBoundingClientRect()
  return null
}

function useFloating(open: boolean, anchorEl: unknown, anchorOrigin: any, transformOrigin: any, anchorPosition?: any, anchorReference?: string) {
  // The box mounts a moment after `open` (it lives in a portal), so it is kept in
  // state: placement runs again as soon as it exists.
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const box = useRef<HTMLDivElement | null>(null)
  const boxRef = useCallback((node: HTMLDivElement | null) => {
    box.current = node
    setEl(node)
  }, [])
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  useIsoLayoutEffect(() => {
    if (!open || !el) return
    const place = () => {
      const a = anchorRect(anchorEl, anchorPosition, anchorReference)
      if (!a) return setPos({ top: window.innerHeight / 2 - el.offsetHeight / 2, left: window.innerWidth / 2 - el.offsetWidth / 2 })
      setPos(placeNear(a, { width: el.offsetWidth, height: el.offsetHeight }, anchorOrigin, transformOrigin))
    }
    place()
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null
    ro?.observe(el)
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      ro?.disconnect()
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [open, anchorEl, el])
  useEffect(() => {
    if (!open) setPos(null)
  }, [open])
  return { box, boxRef, pos }
}

export const Popover = ui("Popover", ({ ykClass, Comp: _c, className, open, onClose, anchorEl, anchorOrigin = { vertical: "top", horizontal: "left" }, transformOrigin = { vertical: "top", horizontal: "left" }, anchorPosition, anchorReference, PaperProps = {}, slotProps = {}, marginThreshold: _m, elevation = 8, TransitionComponent: _t, TransitionProps: _tp, transitionDuration: _td, disableScrollLock: _dl, disableRestoreFocus, disableAutoFocus, keepMounted: _k, container, disablePortal, role = "presentation", children, ...p }, ref) => {
  const { box, boxRef, pos } = useFloating(!!open, anchorEl, anchorOrigin, transformOrigin, anchorPosition, anchorReference)
  const opener = useRef<Element | null>(null)
  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement
    if (!disableAutoFocus) requestAnimationFrame(() => {
      const first = box.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"]),button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ;(first ?? box.current)?.focus()
    })
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.(e, "escapeKeyDown")
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      const back = (anchorEl as HTMLElement | null) ?? (opener.current as HTMLElement | null)
      if (!disableRestoreFocus && back && typeof back.focus === "function" && document.contains(back)) back.focus()
    }
  }, [open])
  if (!open) return null
  const pp = { ...PaperProps, ...slotProps.paper }
  const { className: pc, sx: psx, style: pstyle, ref: pref, ...pRest } = pp
  return (
    <Portal container={container} disablePortal={disablePortal}>
      <div ref={ref} role={role} className={cx("MuiPopover-root MuiModal-root", ykClass, className)} style={{ position: "fixed", inset: 0, zIndex: 1300 }} {...p}>
        <div className="MuiBackdrop-root MuiBackdrop-invisible" aria-hidden="true" onClick={(e) => onClose?.(e, "backdropClick")} />
        <Paper
          ref={mergeRefs(boxRef, pref)}
          tabIndex={-1}
          elevation={elevation}
          sx={psx}
          className={cx("MuiPopover-paper", pc)}
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? undefined : "hidden", ...pstyle }}
          {...pRest}
        >
          {children}
        </Paper>
      </div>
    </Portal>
  )
})

export const Menu = ui("Menu", ({ ykClass, Comp: _c, className, open, onClose, anchorEl, children, MenuListProps = {}, slotProps = {}, PaperProps = {}, anchorOrigin = { vertical: "bottom", horizontal: "left" }, transformOrigin = { vertical: "top", horizontal: "left" }, autoFocus: _af, variant: _v, disableAutoFocusItem: _d, id, ...p }, ref) => {
  const listProps = { ...MenuListProps, ...slotProps.list }
  const paper = { ...PaperProps, ...slotProps.paper }
  const close = () => onClose?.({}, "itemClick")
  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'))
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === "ArrowDown") items[(i + 1) % items.length]?.focus()
    else if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length]?.focus()
    else if (e.key === "Home") items[0]?.focus()
    else if (e.key === "End") items[items.length - 1]?.focus()
    else if (e.key === "Tab") onClose?.(e, "tabKeyDown")
    else return
    if (e.key !== "Tab") e.preventDefault()
  }
  return (
    <Popover ref={ref} open={open} onClose={onClose} anchorEl={anchorEl} anchorOrigin={anchorOrigin} transformOrigin={transformOrigin} slotProps={{ paper: { ...paper, className: cx("MuiMenu-paper", paper.className) } }} className={cx("MuiMenu-root", ykClass, className)} {...p}>
      <MenuContext.Provider value={{ close }}>
        <ul id={id} role="menu" className={cx("MuiList-root MuiMenu-list", listProps.className)} onKeyDown={onKeyDown} {...listProps}>
          {children}
        </ul>
      </MenuContext.Provider>
    </Popover>
  )
})
export const MenuList = ui("MenuList", ({ ykClass, Comp, className, autoFocusItem: _a, variant: _v, ...p }, ref) => <Comp ref={ref} role="menu" className={cx("MuiList-root MuiMenuList-root", ykClass, className)} {...p} />, { tag: "ul" })

export const Popper = ui("Popper", ({ ykClass, Comp: _c, className, style, open, anchorEl, placement = "bottom", children, transition: _t, disablePortal, modifiers: _m, popperOptions: _po, keepMounted: _k, container, ...p }, ref) => {
  const ao = { vertical: placement.startsWith("top") ? "top" : "bottom", horizontal: placement.endsWith("start") ? "left" : placement.endsWith("end") ? "right" : "center" }
  const to = { vertical: placement.startsWith("top") ? "bottom" : "top", horizontal: ao.horizontal }
  const { boxRef, pos } = useFloating(!!open, anchorEl, ao, to)
  if (!open) return null
  const content = typeof children === "function" ? (children as (a: unknown) => React.ReactNode)({ placement, TransitionProps: { in: true } }) : children
  return (
    <Portal disablePortal={disablePortal} container={container}>
      <div ref={mergeRefs(boxRef, ref)} role="tooltip" className={cx("MuiPopper-root", ykClass, className)} style={{ position: "fixed", zIndex: 1300, top: pos?.top ?? -9999, left: pos?.left ?? -9999, ...style }} {...p}>
        {content}
      </div>
    </Portal>
  )
})

/* ───────────── Accordion ───────────── */

const AccordionContext = createContext<{ expanded: boolean; toggle: (e: React.SyntheticEvent) => void; id: string; disabled?: boolean; unmount?: boolean } | null>(null)

export const Accordion = ui("Accordion", ({ ykClass, Comp, className, expanded, defaultExpanded = false, onChange, disabled, disableGutters: _g, square, elevation: _e, TransitionProps = {}, slotProps = {}, children, ...p }, ref) => {
  const id = useId()
  const [inner, setInner] = useState(defaultExpanded)
  const open = expanded ?? inner
  const toggle = (e: React.SyntheticEvent) => {
    if (disabled) return
    if (expanded === undefined) setInner(!open)
    onChange?.(e, !open)
  }
  const unmount = TransitionProps.unmountOnExit ?? slotProps.transition?.unmountOnExit
  return (
    <AccordionContext.Provider value={{ expanded: open, toggle, id, disabled, unmount }}>
      <Comp ref={ref} className={cx("MuiPaper-root MuiAccordion-root", open && "Mui-expanded", disabled && "Mui-disabled", square && "MuiPaper-square", ykClass, className)} {...p}>
        {children}
      </Comp>
    </AccordionContext.Provider>
  )
})

export const AccordionSummary = ui("AccordionSummary", ({ ykClass, Comp: _c, className, expandIcon, children, onClick, id, "aria-controls": controls, ...p }, ref) => {
  const ctx = useContext(AccordionContext)
  return (
    <h3 className="MuiAccordion-heading" style={{ margin: 0, font: "inherit" }}>
      <button
        ref={ref}
        type="button"
        id={id ?? `${ctx?.id}-header`}
        aria-expanded={!!ctx?.expanded}
        aria-controls={controls ?? `${ctx?.id}-content`}
        disabled={ctx?.disabled}
        onClick={(e) => {
          onClick?.(e)
          ctx?.toggle(e)
        }}
        className={cx("MuiButtonBase-root MuiAccordionSummary-root", ctx?.expanded && "Mui-expanded", ykClass, className)}
        {...p}
      >
        <span className={cx("MuiAccordionSummary-content", ctx?.expanded && "Mui-expanded")}>{children}</span>
        {expandIcon && <span className={cx("MuiAccordionSummary-expandIconWrapper", ctx?.expanded && "Mui-expanded")}>{expandIcon}</span>}
      </button>
    </h3>
  )
})

export const AccordionDetails = ui("AccordionDetails", ({ ykClass, Comp, className, ...p }, ref) => {
  const ctx = useContext(AccordionContext)
  return (
    <Collapse in={!!ctx?.expanded} unmountOnExit={ctx?.unmount}>
      <Comp ref={ref} id={`${ctx?.id}-content`} role="region" aria-labelledby={`${ctx?.id}-header`} className={cx("MuiAccordionDetails-root", ykClass, className)} {...p} />
    </Collapse>
  )
})
export const AccordionActions = ui("AccordionActions", ({ ykClass, Comp, className, ...p }, ref) => <Comp ref={ref} className={cx("MuiAccordionActions-root MuiDialogActions-root", ykClass, className)} {...p} />)

/* ───────────── Tabs ───────────── */

type TabsCtx = { value: unknown; onChange?: (e: React.SyntheticEvent, v: unknown) => void; color?: string; fullWidth?: boolean; orientation?: string }
const TabsContext = createContext<TabsCtx | null>(null)

export const Tabs = ui("Tabs", ({ ykClass, Comp, className, value, onChange, variant = "standard", centered, orientation = "horizontal", textColor, indicatorColor, scrollButtons: _sb, allowScrollButtonsMobile: _am, TabIndicatorProps: _ti, TabScrollButtonProps: _ts, selectionFollowsFocus, visibleScrollbar: _vs, slotProps: _sp, children, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...p }, ref) => {
  const kids = flatChildren(children).map((c, i) => (isValidElement(c) ? cloneElement(c as React.ReactElement<any>, { key: c.key ?? i, ykIndex: i }) : c))
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'))
    const i = tabs.indexOf(document.activeElement as HTMLElement)
    const prev = orientation === "vertical" ? "ArrowUp" : "ArrowLeft"
    const next = orientation === "vertical" ? "ArrowDown" : "ArrowRight"
    let target: HTMLElement | undefined
    if (e.key === next) target = tabs[(i + 1) % tabs.length]
    else if (e.key === prev) target = tabs[(i - 1 + tabs.length) % tabs.length]
    else if (e.key === "Home") target = tabs[0]
    else if (e.key === "End") target = tabs[tabs.length - 1]
    if (!target) return
    e.preventDefault()
    target.focus()
    target.scrollIntoView?.({ block: "nearest", inline: "nearest" })
    if (selectionFollowsFocus) target.click()
  }
  return (
    <TabsContext.Provider value={{ value, onChange, color: indicatorColor === "secondary" || textColor === "secondary" ? "secondary" : "primary", fullWidth: variant === "fullWidth", orientation }}>
      <Comp ref={ref} className={cx("MuiTabs-root", orientation === "vertical" && "MuiTabs-vertical", ykClass, className)} {...p}>
        <div className={cx("MuiTabs-scroller", variant === "scrollable" && (orientation === "vertical" ? "MuiTabs-scrollableY" : "MuiTabs-scrollableX"))} style={variant === "scrollable" && orientation === "vertical" ? { overflowY: "auto" } : undefined}>
          <div role="tablist" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-orientation={orientation} onKeyDown={onKeyDown} className={cx("MuiTabs-flexContainer", orientation === "vertical" && "MuiTabs-flexContainerVertical", centered && "MuiTabs-centered")}>
            {kids}
          </div>
        </div>
      </Comp>
    </TabsContext.Provider>
  )
})

export const Tab = ui("Tab", ({ ykClass, Comp, ykHasComp, className, style, value, ykIndex, label, icon, iconPosition = "top", disabled, wrapped, onClick, selected: sel, disableRipple: _r, disableFocusRipple: _f, fullWidth, ...p }, ref) => {
  const ctx = useContext(TabsContext)
  const v = value ?? ykIndex
  const selected = sel ?? (ctx ? ctx.value === v : false)
  const Tag = ykHasComp ? Comp : "button"
  const iconEl = icon && isValidElement(icon) ? cloneElement(icon as React.ReactElement<any>, { className: cx("MuiTab-iconWrapper", (icon.props as UIProps).className) }) : icon
  const horizontal = iconPosition === "start" || iconPosition === "end"
  return (
    <Tag
      ref={ref}
      role="tab"
      {...(Tag === "button" ? { type: "button", disabled } : { "aria-disabled": disabled || undefined })}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={(e: React.MouseEvent) => {
        onClick?.(e)
        if (!e.defaultPrevented && !selected) ctx?.onChange?.(e, v)
      }}
      className={cx(
        "MuiButtonBase-root MuiTab-root",
        ctx && colorClass(ctx.color),
        label && icon && "MuiTab-labelIcon",
        selected && "Mui-selected",
        disabled && "Mui-disabled",
        wrapped && "MuiTab-wrapped",
        (fullWidth ?? ctx?.fullWidth) && "MuiTab-fullWidth",
        ykClass,
        className,
      )}
      style={horizontal ? { flexDirection: iconPosition === "end" ? "row-reverse" : "row", ...style } : iconPosition === "bottom" ? { flexDirection: "column-reverse", ...style } : style}
      {...p}
    >
      {iconEl}
      {label}
    </Tag>
  )
})

/* ───────────── Pagination ───────────── */

function pages(count: number, page: number, sibling: number, boundary: number): Array<number | "start-ellipsis" | "end-ellipsis"> {
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i)
  const startPages = range(1, Math.min(boundary, count))
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count)
  const siblingsStart = Math.max(Math.min(page - sibling, count - boundary - sibling * 2 - 1), boundary + 2)
  const siblingsEnd = Math.min(Math.max(page + sibling, boundary + sibling * 2 + 2), endPages.length > 0 ? endPages[0] - 2 : count - 1)
  return [
    ...startPages,
    ...(siblingsStart > boundary + 2 ? ["start-ellipsis" as const] : boundary + 1 < count - boundary ? [boundary + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundary - 1 ? ["end-ellipsis" as const] : count - boundary > boundary ? [count - boundary] : []),
    ...endPages,
  ]
}

export const Pagination = ui("Pagination", ({ ykClass, Comp, className, count = 1, page, defaultPage = 1, onChange, siblingCount = 1, boundaryCount = 1, color = "standard", size = "medium", shape: _sh, variant = "text", disabled, showFirstButton, showLastButton, hidePrevButton, hideNextButton, getItemAriaLabel, renderItem: _ri, "aria-label": ariaLabel = "pagination navigation", ...p }, ref) => {
  const [inner, setInner] = useState(defaultPage)
  const current = page ?? inner
  const go = (e: React.SyntheticEvent, n: number) => {
    if (n < 1 || n > count || n === current) return
    if (page === undefined) setInner(n)
    onChange?.(e, n)
  }
  const label = (type: string, n: number | null, selected: boolean) =>
    getItemAriaLabel ? getItemAriaLabel(type, n, selected) : type === "page" ? `${selected ? "" : "Go to "}page ${n}` : `Go to ${type} page`
  const btn = (type: string, n: number, content: React.ReactNode, isDisabled = false, selected = false) => (
    <li key={`${type}-${n}`}>
      <button
        type="button"
        disabled={disabled || isDisabled}
        aria-current={selected ? "page" : undefined}
        aria-label={label(type, type === "page" ? n : null, selected)}
        onClick={(e) => go(e, n)}
        className={cx("MuiButtonBase-root MuiPaginationItem-root", `MuiPaginationItem-size${cap(size)}`, variant === "outlined" && "MuiPaginationItem-outlined", color !== "standard" && colorClass(color), selected && "Mui-selected", (disabled || isDisabled) && "Mui-disabled")}
      >
        {content}
      </button>
    </li>
  )
  return (
    <Comp ref={ref} aria-label={ariaLabel} className={cx("MuiPagination-root", ykClass, className)} {...p}>
      <ul className="MuiPagination-ul">
        {showFirstButton && btn("first", 1, <Glyph name="first" />, current <= 1)}
        {!hidePrevButton && btn("previous", current - 1, <Glyph name="left" />, current <= 1)}
        {pages(count, current, siblingCount, boundaryCount).map((it, i) =>
          typeof it === "number" ? btn("page", it, it, false, it === current) : <li key={`${it}${i}`}><span className="MuiPaginationItem-ellipsis" aria-hidden="true">…</span></li>,
        )}
        {!hideNextButton && btn("next", current + 1, <Glyph name="right" />, current >= count)}
        {showLastButton && btn("last", count, <Glyph name="last" />, current >= count)}
      </ul>
    </Comp>
  )
}, { tag: "nav" })

/* ───────────── Breadcrumbs ───────────── */

export const Breadcrumbs = ui("Breadcrumbs", ({ ykClass, Comp, className, separator = "/", maxItems: _m, children, "aria-label": ariaLabel = "breadcrumb", ...p }, ref) => {
  const items = flatChildren(children)
  return (
    <Comp ref={ref} aria-label={ariaLabel} className={cx("MuiBreadcrumbs-root", ykClass, className)} {...p}>
      <ol className="MuiBreadcrumbs-ol" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
        {items.flatMap((c, i) => [
          ...(i > 0 ? [<li key={`s${i}`} aria-hidden="true" className="MuiBreadcrumbs-separator">{separator}</li>] : []),
          <li key={`i${i}`} className="MuiBreadcrumbs-li">{c}</li>,
        ])}
      </ol>
    </Comp>
  )
}, { tag: "nav" })
