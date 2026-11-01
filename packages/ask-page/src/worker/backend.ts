// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/worker/backend.ts
// The heavy half of Ask page: the search engine and the embedder. Runs in a
// Web Worker (worker.ts) so the page never freezes, or in the page itself
// when workers are unavailable. Same class either way.
// ─────────────────────────────────────────────────────────────────────────────

import { createSearchEngine, MODE_KEYWORD, type RawHit, type SearchEngine, type SearchMode } from "../search/engine"
import { loadTransformersEmbedder, type EmbedProgress, type Embedder, type EmbedderConfig } from "../embed/embedder"

export interface BackendSearch {
  hits: RawHit[]
  terms: number
  usedVectors: boolean
}

export class Backend {
  private engine: SearchEngine | null = null
  private embedder: Embedder | null = null
  private embedderLoading: Promise<Embedder> | null = null
  private hasVectors = false

  async init(wasmBase64: string): Promise<"rust-wasm" | "js"> {
    if (!this.engine) this.engine = await createSearchEngine(wasmBase64)
    return this.engine.kind
  }

  private need(): SearchEngine {
    if (!this.engine) throw new Error("ask-page backend: init() first")
    return this.engine
  }

  index(texts: string[]): number {
    const e = this.need()
    e.reset()
    e.addPassages(texts)
    this.hasVectors = false
    return texts.length
  }

  embedderReady(): boolean {
    return !!this.embedder
  }

  async loadEmbedder(cfg: EmbedderConfig, onProgress?: (p: EmbedProgress) => void): Promise<{ model: string; dim: number }> {
    if (this.embedder && this.embedder.model === cfg.model) return { model: this.embedder.model, dim: this.embedder.dim }
    if (!this.embedderLoading) {
      this.embedderLoading = loadTransformersEmbedder(cfg, onProgress).catch((err) => {
        this.embedderLoading = null
        throw err
      })
    }
    this.embedder = await this.embedderLoading
    return { model: this.embedder.model, dim: this.embedder.dim }
  }

  /** Embeds every passage, stores int8 vectors, returns them for the cache. */
  async embedPassages(texts: string[], onProgress?: (p: EmbedProgress) => void): Promise<{ q: Int8Array; scales: Float32Array; dim: number }> {
    if (!this.embedder) throw new Error("ask-page backend: loadEmbedder() first")
    const vectors = await this.embedder.embedPassages(texts, onProgress)
    const { q, scales } = this.need().quantize(vectors, this.embedder.dim)
    this.need().setVectors(q, scales, this.embedder.dim)
    this.hasVectors = true
    return { q, scales, dim: this.embedder.dim }
  }

  setVectors(q: Int8Array, scales: Float32Array, dim: number): void {
    this.need().setVectors(q, scales, dim)
    this.hasVectors = true
  }

  async search(question: string, mode: SearchMode, k: number): Promise<BackendSearch> {
    const e = this.need()
    let qvec: Float32Array | null = null
    if (mode !== MODE_KEYWORD && this.hasVectors && this.embedder) qvec = await this.embedder.embedQuery(question)
    const res = e.search(question, qvec, qvec ? mode : MODE_KEYWORD, k)
    return { ...res, usedVectors: !!qvec }
  }

  engineKind(): string {
    return this.engine?.kind ?? "none"
  }
}
