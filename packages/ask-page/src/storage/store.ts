// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/storage/store.ts
//
// Where Ask page keeps things, all on the visitor's device:
//   vectors   OPFS (one binary file per page) → IndexedDB → memory
//   settings  IndexedDB → memory
//   model     Cache Storage (Transformers.js writes it; we can remove it)
//   chat      memory only
//
// Sensitive (signed-in) pages: memory only, always.
// Limits: 200 pages or 50 MB of vectors; the oldest go first.
// ─────────────────────────────────────────────────────────────────────────────

import { idb } from "./idb"
import { hashText } from "../reader/hash"
import { MAX_CHARS } from "../reader/chunker"

export type StorageKind = "opfs" | "indexeddb" | "memory"

const DIR = "yuktai-ask"
const MAX_ENTRIES = 200
const MAX_BYTES = 50 * 1024 * 1024
const LIST_KEY = "cache-list"
const MODEL_CACHE = "transformers-cache"

interface Entry {
  key: string
  bytes: number
  at: number
}

const memory = new Map<string, ArrayBuffer>()

export interface VectorRecord {
  dim: number
  q: Int8Array
  scales: Float32Array
}

/** URL + page text hash + model + chunk size: any change means re-embed. */
export function cacheKey(url: string, pageHash: string, model: string): string {
  return `v1-${hashText(url)}-${pageHash}-${hashText(model)}-c${MAX_CHARS}`
}

export function encodeVectors(r: VectorRecord): ArrayBuffer {
  const n = r.scales.length
  const buf = new ArrayBuffer(8 + n * 4 + n * r.dim)
  const v = new DataView(buf)
  v.setUint32(0, r.dim, true)
  v.setUint32(4, n, true)
  new Float32Array(buf, 8, n).set(r.scales)
  new Int8Array(buf, 8 + n * 4, n * r.dim).set(r.q)
  return buf
}

export function decodeVectors(buf: ArrayBuffer): VectorRecord | null {
  if (buf.byteLength < 8) return null
  const v = new DataView(buf)
  const dim = v.getUint32(0, true)
  const n = v.getUint32(4, true)
  if (buf.byteLength !== 8 + n * 4 + n * dim) return null
  return { dim, scales: new Float32Array(buf.slice(8, 8 + n * 4)), q: new Int8Array(buf.slice(8 + n * 4)) }
}

async function opfsDir(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const nav = navigator as Navigator & { storage?: { getDirectory?: () => Promise<FileSystemDirectoryHandle> } }
    if (!nav.storage?.getDirectory) return null
    const root = await nav.storage.getDirectory()
    return await root.getDirectoryHandle(DIR, { create: true })
  } catch {
    return null
  }
}

export class AskStore {
  kind: StorageKind = "memory"
  private ready: Promise<void>

  constructor(private enabled = true) {
    this.ready = this.detect()
  }

  private async detect() {
    if (!this.enabled) return
    const dir = await opfsDir()
    if (dir && typeof (dir as FileSystemDirectoryHandle & { getFileHandle?: unknown }).getFileHandle === "function") {
      try {
        const fh = await dir.getFileHandle("probe", { create: true })
        const w = await (fh as FileSystemFileHandle & { createWritable?: () => Promise<FileSystemWritableFileStream> }).createWritable?.()
        if (w) {
          await w.close()
          await dir.removeEntry("probe").catch(() => undefined)
          this.kind = "opfs"
          return
        }
      } catch {
        /* no writable OPFS (Safari main thread): try IndexedDB */
      }
    }
    if (await idb.available()) this.kind = "indexeddb"
  }

  async getVectors(key: string): Promise<VectorRecord | null> {
    await this.ready
    let buf: ArrayBuffer | null = memory.get(key) ?? null
    if (!buf && this.kind === "opfs") {
      try {
        const dir = await opfsDir()
        const fh = await dir!.getFileHandle(key)
        buf = await (await fh.getFile()).arrayBuffer()
      } catch {
        buf = null
      }
    } else if (!buf && this.kind === "indexeddb") {
      buf = await idb.get<ArrayBuffer>(`vec:${key}`)
    }
    if (buf) void this.touch(key, buf.byteLength)
    return buf ? decodeVectors(buf) : null
  }

  /** `persist` false (sensitive page or owner cache off): memory only. */
  async setVectors(key: string, r: VectorRecord, persist: boolean): Promise<void> {
    await this.ready
    const buf = encodeVectors(r)
    if (!persist || this.kind === "memory") {
      memory.set(key, buf)
      return
    }
    if (this.kind === "opfs") {
      try {
        const dir = await opfsDir()
        const fh = await dir!.getFileHandle(key, { create: true })
        const w = await (fh as FileSystemFileHandle & { createWritable: () => Promise<FileSystemWritableFileStream> }).createWritable()
        await w.write(buf)
        await w.close()
      } catch {
        memory.set(key, buf)
        return
      }
    } else {
      await idb.set(`vec:${key}`, buf)
    }
    await this.touch(key, buf.byteLength)
    await this.evict()
  }

  private async list(): Promise<Entry[]> {
    return (await idb.get<Entry[]>(LIST_KEY)) ?? []
  }

  private async touch(key: string, bytes: number) {
    if (this.kind === "memory") return
    const list = (await this.list()).filter((e) => e.key !== key)
    list.push({ key, bytes, at: Date.now() })
    await idb.set(LIST_KEY, list)
  }

  private async evict() {
    let list = (await this.list()).sort((a, b) => a.at - b.at)
    let total = list.reduce((s, e) => s + e.bytes, 0)
    while (list.length && (list.length > MAX_ENTRIES || total > MAX_BYTES)) {
      const old = list.shift()!
      total -= old.bytes
      await this.removeVectors(old.key)
    }
    await idb.set(LIST_KEY, list)
  }

  private async removeVectors(key: string) {
    memory.delete(key)
    if (this.kind === "opfs") {
      try {
        await (await opfsDir())!.removeEntry(key)
      } catch {
        /* already gone */
      }
    } else if (this.kind === "indexeddb") await idb.del(`vec:${key}`)
  }

  /** Bytes used by saved vectors and by the model files. */
  async usage(): Promise<{ index: number; model: number }> {
    await this.ready
    const index = (await this.list()).reduce((s, e) => s + e.bytes, 0) + [...memory.values()].reduce((s, b) => s + b.byteLength, 0)
    let model = 0
    try {
      if (typeof caches !== "undefined" && (await caches.has(MODEL_CACHE))) {
        const c = await caches.open(MODEL_CACHE)
        for (const req of await c.keys()) {
          const res = await c.match(req)
          const len = Number(res?.headers.get("content-length") ?? 0)
          model += len || 0
        }
      }
    } catch {
      /* Cache Storage unavailable */
    }
    return { index, model }
  }

  /** Clear saved data: vectors, cache list. (Settings are cleared by the caller.) */
  async clearSaved(): Promise<void> {
    await this.ready
    memory.clear()
    for (const e of await this.list()) await this.removeVectors(e.key)
    await idb.del(LIST_KEY)
    try {
      const nav = navigator as Navigator & { storage?: { getDirectory?: () => Promise<FileSystemDirectoryHandle> } }
      const root = await nav.storage?.getDirectory?.()
      await root?.removeEntry(DIR, { recursive: true })
    } catch {
      /* nothing saved there */
    }
  }

  /** Remove the downloaded model files. Fast mode keeps working. */
  async removeModel(): Promise<void> {
    try {
      if (typeof caches !== "undefined") await caches.delete(MODEL_CACHE)
    } catch {
      /* unavailable */
    }
  }
}

// ── Settings and pins (small JSON) ──────────────────────────────────────────

const memSettings = new Map<string, unknown>()

export const prefs = {
  async get<T>(key: string): Promise<T | null> {
    const v = await idb.get<T>(`pref:${key}`)
    return v ?? ((memSettings.get(key) as T) ?? null)
  },
  async set(key: string, value: unknown): Promise<void> {
    memSettings.set(key, value)
    await idb.set(`pref:${key}`, value)
  },
  async clear(): Promise<void> {
    memSettings.clear()
    for (const k of await idb.keys()) if (k.startsWith("pref:")) await idb.del(k)
  },
}
