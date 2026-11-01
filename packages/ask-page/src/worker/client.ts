// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/worker/client.ts
// Starts the backend in a Web Worker (blob: URL, Comlink). Falls back to the
// page thread when a worker cannot start (CSP without blob:, old browsers,
// tests). Callers see the same async API either way.
// ─────────────────────────────────────────────────────────────────────────────

import * as Comlink from "comlink"
import { ASK_CORE_WASM_BASE64 } from "../search/askCoreWasm"
import { WORKER_SOURCE } from "./workerSource"
import type { Backend, BackendSearch } from "./backend"
import type { EmbedProgress, EmbedderConfig } from "../embed/embedder"
import type { SearchMode } from "../search/engine"

export interface BackendClient {
  readonly where: "worker" | "page"
  engine: "rust-wasm" | "js"
  index(texts: string[]): Promise<number>
  embedderReady(): Promise<boolean>
  loadEmbedder(cfg: EmbedderConfig, onProgress?: (p: EmbedProgress) => void): Promise<{ model: string; dim: number }>
  embedPassages(texts: string[], onProgress?: (p: EmbedProgress) => void): Promise<{ q: Int8Array; scales: Float32Array; dim: number }>
  setVectors(q: Int8Array, scales: Float32Array, dim: number): Promise<void>
  search(question: string, mode: SearchMode, k: number): Promise<BackendSearch>
  dispose(): void
}

export async function startBackend(opts: { worker?: boolean } = {}): Promise<BackendClient> {
  if (opts.worker !== false && typeof Worker !== "undefined" && typeof Blob !== "undefined" && typeof URL?.createObjectURL === "function" && WORKER_SOURCE) {
    let url = ""
    let worker: Worker | null = null
    try {
      url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }))
      worker = new Worker(url, { type: "module", name: "yuktai-ask" })
      const remote = Comlink.wrap<Backend>(worker)
      const engine = await withTimeout(remote.init(ASK_CORE_WASM_BASE64), 8000)
      const w = worker
      return {
        where: "worker",
        engine,
        index: (t) => remote.index(t),
        embedderReady: () => remote.embedderReady(),
        loadEmbedder: (cfg, cb) => remote.loadEmbedder(cfg, cb ? Comlink.proxy(cb) : undefined),
        embedPassages: (t, cb) => remote.embedPassages(t, cb ? Comlink.proxy(cb) : undefined),
        setVectors: (q, s, d) => remote.setVectors(q, s, d),
        search: (q, m, k) => remote.search(q, m, k),
        dispose: () => {
          w.terminate()
          URL.revokeObjectURL(url)
        },
      }
    } catch {
      worker?.terminate()
      if (url) URL.revokeObjectURL(url)
    }
  }
  const { Backend } = await import("./backend")
  const b = new Backend()
  const engine = await b.init(ASK_CORE_WASM_BASE64)
  return {
    where: "page",
    engine,
    index: async (t) => b.index(t),
    embedderReady: async () => b.embedderReady(),
    loadEmbedder: (cfg, cb) => b.loadEmbedder(cfg, cb),
    embedPassages: (t, cb) => b.embedPassages(t, cb),
    setVectors: async (q, s, d) => b.setVectors(q, s, d),
    search: (q, m, k) => b.search(q, m, k),
    dispose: () => undefined,
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("worker did not start")), ms)
    p.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    )
  })
}
