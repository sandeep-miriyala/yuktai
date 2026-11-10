// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai/ui · base.tsx: shared helpers for every component.
// ─────────────────────────────────────────────────────────────────────────────

import React, { forwardRef, useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ensureBaseStyles } from "./styles"
import { cx, splitSystemProps, useSx, type SxProps } from "./sx"

/** Props are kept open: the components accept what familiar Material code passes. */
type Fn = (...args: any[]) => any
export type UIProps = {
  [key: string]: any
  // event handlers and render callbacks get a call signature, so inline arrows are typed
  [handler: `on${string}`]: Fn | undefined
  [render: `render${string}`]: Fn | undefined
  [getter: `get${string}`]: Fn | undefined
  sx?: SxProps
  className?: string
  children?: any
  isOptionEqualToValue?: Fn
  groupBy?: Fn
  filterOptions?: Fn
  valueLabelFormat?: string | Fn
}
export type UIComponent<P = UIProps> = React.ForwardRefExoticComponent<P & UIProps & React.RefAttributes<any>> & { muiName?: string }

export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

const COLORS = ["primary", "secondary", "error", "warning", "info", "success", "inherit", "default"]

/** Colour class for a component's `color` prop (only theme colours; others are CSS). */
export function colorClass(color: unknown, fallback = "primary"): string {
  const c = typeof color === "string" && COLORS.includes(color) ? color : fallback
  return `yk-c-${c}`
}

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/**
 * Builds a component: pulls out sx (and, when asked, system props like mb={2}),
 * turns them into one class, and renders `component` (or the default tag).
 */
export function ui<P extends UIProps>(
  name: string,
  render: (props: P & { ykClass: string; Comp: any; ykHasComp: boolean }, ref: React.Ref<any>) => React.ReactElement | null,
  options: { tag?: any; system?: boolean; keep?: string[] } = {},
): UIComponent<P> {
  const C = forwardRef<any, P>(function YuktaiComponent(props, ref) {
    ensureBaseStyles()
    const { system, rest } = options.system ? splitSystemProps(props as UIProps, options.keep) : { system: null, rest: props as UIProps }
    const sx = system ? [system, ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx])] : rest.sx
    const sxc = useSx(sx as SxProps)
    const { sx: _sx, component, ...other } = rest
    return render({ ...(other as P), ykClass: sxc, Comp: component ?? options.tag ?? "div", ykHasComp: component !== undefined }, ref)
  })
  C.displayName = name
  return C as unknown as UIComponent<P>
}

export { cx }

/** Renders children into document.body once mounted (overlays). */
export function Portal({ children, disablePortal, container }: { children: React.ReactNode; disablePortal?: boolean; container?: Element | (() => Element | null) | null }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (disablePortal) return <>{children}</>
  if (!mounted) return null
  const target = (typeof container === "function" ? container() : container) ?? document.body
  return createPortal(children, target)
}

/** Joins refs (a component's own and the one its parent passed). */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const r of refs) {
      if (!r) continue
      if (typeof r === "function") r(node)
      else (r as React.MutableRefObject<T | null>).current = node
    }
  }
}

/** The ref an element was created with (React 19 keeps it in props). */
export function elementRef(el: React.ReactElement): React.Ref<any> | undefined {
  return ((el.props as any)?.ref ?? (el as any).ref) as React.Ref<any> | undefined
}

/** Plain text of a React node (for <option> labels and aria-labels). */
export function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children)
  return ""
}

/** Children as a flat array, fragments opened. */
export function flatChildren(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = []
  React.Children.forEach(children, (c) => {
    if (React.isValidElement(c) && c.type === React.Fragment) out.push(...flatChildren((c.props as { children?: React.ReactNode }).children))
    else if (c !== null && c !== undefined && c !== false) out.push(c)
  })
  return out
}

let counter = 0
/** Stable id: the given one, else React's useId. */
export function useId(given?: string): string {
  const reactId = React.useId?.() ?? `yk-${++counter}`
  return given ?? `yk${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

/** Locks page scroll while an overlay is open. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    const before = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = before
    }
  }, [active])
}

export type Origin = { vertical: "top" | "center" | "bottom" | number; horizontal: "left" | "center" | "right" | number }

const frac = (v: Origin["vertical"] | Origin["horizontal"], size: number) =>
  typeof v === "number" ? v : v === "center" ? size / 2 : v === "bottom" || v === "right" ? size : 0

/** Position for a floating box next to an anchor, kept inside the viewport. */
export function placeNear(
  anchor: DOMRect,
  box: { width: number; height: number },
  anchorOrigin: Origin = { vertical: "bottom", horizontal: "left" },
  transformOrigin: Origin = { vertical: "top", horizontal: "left" },
): { top: number; left: number } {
  const ax = anchor.left + frac(anchorOrigin.horizontal, anchor.width)
  const ay = anchor.top + frac(anchorOrigin.vertical, anchor.height)
  let left = ax - frac(transformOrigin.horizontal, box.width)
  let top = ay - frac(transformOrigin.vertical, box.height)
  const vw = window.innerWidth
  const vh = window.innerHeight
  const m = 8
  if (top + box.height > vh - m && anchor.top - box.height > m) top = anchor.top - box.height // flip above
  left = Math.max(m, Math.min(left, vw - box.width - m))
  top = Math.max(m, Math.min(top, vh - box.height - m))
  return { top, left }
}
