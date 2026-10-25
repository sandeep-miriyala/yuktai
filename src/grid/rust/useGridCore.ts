// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/rust/useGridCore.ts
//
// React hook: returns a Rust grid engine when `engine` asks for one, or null.
// While the engine loads (a few milliseconds, once per page) and whenever it
// is unavailable, the grid keeps using TypeScript, so nothing waits on it.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react"
import { GridCore, getLoadedGridCore, loadGridCore, wantsRustEngine, type GridEngine } from "./engine"

export function useGridCore(engine: GridEngine | undefined, rowCount: number): GridCore | null {
  const want = wantsRustEngine(engine, rowCount)
  const [mod, setMod] = useState<WebAssembly.Module | null>(() => (want ? getLoadedGridCore() : null))

  useEffect(() => {
    if (!want || mod) return
    let live = true
    loadGridCore().then((m) => {
      if (live && m) setMod(m)
    })
    return () => {
      live = false
    }
  }, [want, mod])

  // One engine per grid: it keeps this grid's search text in its own memory.
  return useMemo(() => (want && mod ? GridCore.create(mod) : null), [want, mod])
}
