// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/embed/embedder.ts
//
// Turns text into meaning vectors with Transformers.js v4 and
// multilingual-e5-small (Telugu, Hindi, English and ~100 more). Runs inside
// the worker. The library and the model download once (the visitor agrees
// first); after that everything is cached and works offline. Page text is
// never sent: the model runs on the device.
//
// e5 models expect "query: " before questions and "passage: " before passages.
// ─────────────────────────────────────────────────────────────────────────────

export interface EmbedderConfig {
  url: string
  model: string
}

export interface EmbedProgress {
  stage: "loading-model" | "embedding"
  progress: number
  detail?: string
}

export interface Embedder {
  readonly model: string
  readonly dim: number
  embedPassages(texts: string[], onProgress?: (p: EmbedProgress) => void): Promise<Float32Array>
  embedQuery(text: string): Promise<Float32Array>
}

type Extractor = (input: string | string[], opts: { pooling: "mean"; normalize: boolean }) => Promise<{ data: Float32Array; dims: number[] }>

const BATCH = 16

export async function loadTransformersEmbedder(cfg: EmbedderConfig, onProgress?: (p: EmbedProgress) => void): Promise<Embedder> {
  onProgress?.({ stage: "loading-model", progress: 0, detail: "Loading Transformers.js" })
  const lib = (await import(/* @vite-ignore */ /* webpackIgnore: true */ cfg.url)) as {
    pipeline: (task: string, model: string, opts: Record<string, unknown>) => Promise<Extractor>
    env?: Record<string, unknown>
  }
  if (lib.env) {
    lib.env.allowLocalModels = false
    lib.env.useBrowserCache = true
  }
  const files = new Map<string, number>()
  const progress_callback = (e: { status?: string; file?: string; progress?: number; loaded?: number; total?: number }) => {
    if (e.status === "progress" && e.file) {
      files.set(e.file, typeof e.progress === "number" ? e.progress : 0)
      const avg = [...files.values()].reduce((a, b) => a + b, 0) / (files.size * 100)
      onProgress?.({ stage: "loading-model", progress: Math.min(0.99, avg), detail: e.file })
    }
  }
  const hasGpu = typeof navigator !== "undefined" && "gpu" in navigator
  let extractor: Extractor
  try {
    extractor = await lib.pipeline("feature-extraction", cfg.model, { device: hasGpu ? "webgpu" : "wasm", dtype: "q8", progress_callback })
  } catch {
    extractor = await lib.pipeline("feature-extraction", cfg.model, { device: "wasm", dtype: "q8", progress_callback })
  }
  onProgress?.({ stage: "loading-model", progress: 1 })
  const probe = await extractor("query: test", { pooling: "mean", normalize: true })
  const dim = probe.dims[probe.dims.length - 1]

  return {
    model: cfg.model,
    dim,
    async embedPassages(texts, cb) {
      const out = new Float32Array(texts.length * dim)
      for (let i = 0; i < texts.length; i += BATCH) {
        const batch = texts.slice(i, i + BATCH).map((t) => `passage: ${t}`)
        const res = await extractor(batch, { pooling: "mean", normalize: true })
        out.set(res.data.subarray(0, batch.length * dim), i * dim)
        cb?.({ stage: "embedding", progress: Math.min(1, (i + batch.length) / texts.length) })
      }
      return out
    },
    async embedQuery(text) {
      const res = await extractor(`query: ${text}`, { pooling: "mean", normalize: true })
      return res.data.slice(0, dim)
    },
  }
}
