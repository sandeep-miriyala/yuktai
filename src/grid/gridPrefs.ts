// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/gridPrefs.ts (v5.7.0)
// What a reader picks in the grid's ⚙ settings, remembered in this browser,
// and the colour maths that keeps a custom accent readable (WCAG 1.4.3).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react"
import type { GridEngine } from "./rust/engine"

export type GridDensity = "compact" | "normal" | "comfortable"

/** A reader's ⚙ choices. Anything missing means "the app's default". */
export interface GridPrefs {
  assistant?: boolean
  accent?: string
  density?: GridDensity
  engine?: GridEngine
  showTime?: boolean
}

/** Cell padding (px) for each row spacing. */
export const DENSITY_PADDING: Record<GridDensity, number> = { compact: 6, normal: 10, comfortable: 16 }

/** Ready-made accents. Each one passes 4.5:1 with white text. */
export const ACCENT_PRESETS: readonly { name: string; te: string; value: string }[] = [
  { name: "Blue", te: "నీలం", value: "#2563eb" },
  { name: "Indigo", te: "ఇండిగో", value: "#4f46e5" },
  { name: "Purple", te: "ఊదా", value: "#7e22ce" },
  { name: "Rose", te: "గులాబీ", value: "#be123c" },
  { name: "Orange", te: "నారింజ", value: "#c2410c" },
  { name: "Teal", te: "నీలి ఆకుపచ్చ", value: "#0f766e" },
  { name: "Slate", te: "బూడిద", value: "#334155" },
]

function readPrefs(key: string | false): GridPrefs {
  if (!key || typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(key)
    const value = raw ? JSON.parse(raw) : null
    return value && typeof value === "object" ? (value as GridPrefs) : {}
  } catch {
    return {}
  }
}

/**
 * The reader's settings for one grid. Read after the first render, so the
 * server and the browser draw the same first page (no hydration mismatch).
 */
export function useGridPrefs(key: string | false): [GridPrefs, (patch: Partial<GridPrefs>) => void, () => void] {
  const [prefs, setPrefs] = useState<GridPrefs>({})

  useEffect(() => {
    setPrefs(readPrefs(key))
  }, [key])

  const update = useCallback(
    (patch: Partial<GridPrefs>) => {
      setPrefs((current) => {
        const next = { ...current, ...patch }
        for (const k of Object.keys(next) as (keyof GridPrefs)[]) if (next[k] === undefined) delete next[k]
        if (key && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(next))
          } catch {
            /* private mode or full storage: the choice still works until reload */
          }
        }
        return next
      })
    },
    [key]
  )

  const reset = useCallback(() => {
    setPrefs({})
    if (key && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* nothing stored */
      }
    }
  }, [key])

  return [prefs, update, reset]
}

/* ───────────── colour ───────────── */

/** "#abc" or "#aabbcc" → [r, g, b] (0–255), or null. */
export function parseHex(color: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (!m) return null
  const hex = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
}

/** WCAG relative luminance. */
export function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Text colour for buttons filled with `accent`: white or black, whichever
 * reads better, and whether that reaches 4.5:1. Any colour reaches at least
 * about 4.6:1 with one of the two, so `ok` is false only for invalid input.
 */
export function accentText(accent: string): { text: string; ratio: number; ok: boolean } {
  const rgb = parseHex(accent)
  if (!rgb) return { text: "#ffffff", ratio: 0, ok: false }
  const white = contrastRatio(rgb, [255, 255, 255])
  const dark = contrastRatio(rgb, [0, 0, 0])
  return white >= dark ? { text: "#ffffff", ratio: white, ok: white >= 4.5 } : { text: "#000000", ratio: dark, ok: dark >= 4.5 }
}

/**
 * Whether the accent itself is visible on the grid's background (borders,
 * the current page number): WCAG 1.4.11 asks 3:1 for parts of controls.
 */
export function accentVisible(accent: string, dark: boolean): { ratio: number; ok: boolean } {
  const rgb = parseHex(accent)
  if (!rgb) return { ratio: 0, ok: false }
  const ratio = contrastRatio(rgb, dark ? [15, 23, 42] : [255, 255, 255])
  return { ratio, ok: ratio >= 3 }
}
