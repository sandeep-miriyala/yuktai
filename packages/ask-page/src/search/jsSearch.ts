// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/search/jsSearch.ts
// The TypeScript twin of rust/ask-core: same tokenizer, stop words, matching
// weights, BM25, int8 vectors and RRF. Used only where WebAssembly is blocked.
// test/search.test.ts checks both engines give the same results.
// ─────────────────────────────────────────────────────────────────────────────

import type { RawHit, SearchEngine, SearchMode } from "./engine"
import { MODE_KEYWORD, MODE_VECTOR } from "./engine"

export const STOP = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "to", "of", "in", "on", "for", "and", "or", "how", "what",
  "which", "who", "why", "when", "where", "do", "does", "did", "i", "it", "its", "this", "that", "these", "those",
  "with", "can", "could", "should", "my", "me", "you", "your", "about", "tell", "please", "there", "here", "any",
  "from", "by", "as", "at", "we", "us", "our", "show", "give", "explain", "page", "much", "many", "get", "have",
  "has", "will", "would", "am", "if", "so", "into", "than", "then", "also", "just",
  "ఈ", "ఆ", "ఏమిటి", "ఏమి", "ఏం", "ఎలా", "ఎందుకు", "ఎప్పుడు", "ఎక్కడ", "ఎవరు", "ఏది", "గురించి", "చెప్పండి", "చెప్పు",
  "లో", "కి", "కు", "ని", "ను", "ఉంది", "ఉన్నాయి", "ఏ", "మరియు", "లేదా", "చేయాలి",
  "చేస్తారు", "చేస్తాం", "చేయవచ్చు", "చేయండి", "ఉంటుంది", "ఉంటాయి", "అవుతుంది", "కావాలి", "ఉందా", "ఏమిటో",
  "क्या", "कैसे", "है", "हैं", "का", "की", "के", "में", "और", "यह", "इस",
])

function isWordChar(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0
  return /[\p{L}\p{N}]/u.test(ch) || (c >= 0x0900 && c <= 0x0dff) || (c >= 0x0300 && c <= 0x036f) || c === 0x200c || c === 0x200d
}

export function tokenize(text: string): string[] {
  const out: string[] = []
  let cur = ""
  for (const ch of text) {
    if (isWordChar(ch)) cur += ch.toLowerCase()
    else if (cur) {
      out.push(cur)
      cur = ""
    }
  }
  if (cur) out.push(cur)
  return out
}

export function queryTerms(text: string): string[] {
  const out: string[] = []
  for (const t of tokenize(text)) if (!STOP.has(t) && !out.includes(t)) out.push(t)
  return out
}

const chars = (s: string) => Array.from(s).length
const RRF_K = 60

export class JsEngine implements SearchEngine {
  readonly kind = "js" as const
  private vocab = new Map<string, number>()
  private words: string[] = []
  private sorted: string[] | null = null
  private postings: [number, number][][] = []
  private docLen: number[] = []
  private totalLen = 0
  private dim = 0
  private vectors: Int8Array = new Int8Array(0)
  private scales: Float32Array = new Float32Array(0)

  reset(): void {
    this.vocab.clear()
    this.words = []
    this.sorted = null
    this.postings = []
    this.docLen = []
    this.totalLen = 0
    this.dim = 0
    this.vectors = new Int8Array(0)
    this.scales = new Float32Array(0)
  }

  addPassages(texts: string[]): void {
    for (const text of texts) {
      const doc = this.docLen.length
      const counts = new Map<number, number>()
      let len = 0
      for (const t of tokenize(text)) {
        len++
        let id = this.vocab.get(t)
        if (id === undefined) {
          id = this.words.length
          this.vocab.set(t, id)
          this.words.push(t)
          this.postings.push([])
        }
        counts.set(id, (counts.get(id) ?? 0) + 1)
      }
      for (const [w, c] of [...counts.entries()].sort((a, b) => a[0] - b[0])) this.postings[w].push([doc, c])
      this.docLen.push(len)
      this.totalLen += len
    }
    this.sorted = null
  }

  quantize(vectors: Float32Array, dim: number) {
    const n = Math.floor(vectors.length / dim)
    const q = new Int8Array(n * dim)
    const scales = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      let max = 0
      for (let j = 0; j < dim; j++) max = Math.max(max, Math.abs(vectors[i * dim + j]))
      const scale = max > 0 ? Math.fround(max / 127) : 1
      scales[i] = scale
      for (let j = 0; j < dim; j++) {
        const x = Math.fround(vectors[i * dim + j] / scale)
        const r = Math.trunc(x >= 0 ? x + 0.5 : x - 0.5)
        q[i * dim + j] = Math.max(-127, Math.min(127, r))
      }
    }
    return { q, scales }
  }

  setVectors(q: Int8Array, scales: Float32Array, dim: number): void {
    this.dim = dim
    this.vectors = q
    this.scales = scales
  }

  private hasVectors() {
    return this.dim > 0 && this.scales.length === this.docLen.length
  }

  private matching(q: string): [number, number][] {
    const out: [number, number][] = []
    const exact = this.vocab.get(q)
    if (exact !== undefined) out.push([exact, 1])
    if (chars(q) >= 4) {
      // byte order, like Rust's BTreeMap
      if (!this.sorted) this.sorted = [...this.words].sort(byteCompare)
      let lo = 0
      let hi = this.sorted.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (byteCompare(this.sorted[mid], q) <= 0) lo = mid + 1
        else hi = mid
      }
      for (let i = lo; i < this.sorted.length && this.sorted[i].startsWith(q); i++) out.push([this.vocab.get(this.sorted[i])!, 0.8])
    }
    const cps = Array.from(q)
    let prefix = ""
    for (let n = 0; n < cps.length - 1; n++) {
      prefix += cps[n]
      if (n + 1 >= 4) {
        const id = this.vocab.get(prefix)
        if (id !== undefined && chars(prefix) >= 4) out.push([id, 0.5])
      }
    }
    return out
  }

  search(question: string, qvec: Float32Array | null, mode: SearchMode, k: number): { hits: RawHit[]; terms: number } {
    const terms = queryTerms(question)
    const n = this.docLen.length
    const bm25 = new Float64Array(n)
    const covered = new Float64Array(n)
    let totalIdf = 0
    if (n) {
      const avgRaw = this.totalLen / n
      const avg = avgRaw === 0 ? 1 : avgRaw
      const tf = new Float64Array(n)
      for (const q of terms) {
        const touched: number[] = []
        for (const [w, weight] of this.matching(q)) {
          for (const [d, c] of this.postings[w]) {
            if (tf[d] === 0) touched.push(d)
            tf[d] += c * weight
          }
        }
        const df = touched.length
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
        totalIdf += idf
        for (const d of touched) {
          const t = tf[d]
          bm25[d] += idf * ((t * 2.2) / (t + 1.2 * (0.25 + 0.75 * (this.docLen[d] / avg))))
          covered[d] += idf
          tf[d] = 0
        }
      }
    }
    const useVec = mode !== MODE_KEYWORD && !!qvec && this.hasVectors()
    const cos = new Float64Array(n)
    if (useVec && qvec && qvec.length === this.dim) {
      for (let d = 0; d < n; d++) {
        let dot = 0
        for (let j = 0; j < this.dim; j++) dot = Math.fround(dot + Math.fround(qvec[j] * this.vectors[d * this.dim + j]))
        cos[d] = Math.fround(dot * this.scales[d])
      }
    }
    const rank = (scores: Float64Array, keep: (d: number) => boolean) =>
      Array.from({ length: n }, (_, d) => d)
        .filter(keep)
        .sort((a, b) => scores[b] - scores[a] || a - b)

    const fused = new Float64Array(n)
    const inResult = new Uint8Array(n)
    if (!useVec) {
      for (let d = 0; d < n; d++) if (bm25[d] > 0) (fused[d] = bm25[d]), (inResult[d] = 1)
    } else if (mode === MODE_VECTOR) {
      for (let d = 0; d < n; d++) (fused[d] = cos[d]), (inResult[d] = 1)
    } else {
      const kw = rank(bm25, (d) => bm25[d] > 0)
      const vc = rank(cos, () => true)
      const depth = Math.max(k * 4, 20)
      kw.forEach((d, r) => ((fused[d] += 1 / (RRF_K + r + 1)), (inResult[d] = 1)))
      vc.slice(0, depth).forEach((d, r) => ((fused[d] += 1 / (RRF_K + r + 1)), (inResult[d] = 1)))
    }
    const order = rank(fused, (d) => inResult[d] === 1).slice(0, k)
    return {
      terms: terms.length,
      hits: order.map((d) => ({ doc: d, fused: fused[d], bm25: bm25[d], cosine: cos[d], coverage: terms.length && totalIdf > 0 ? covered[d] / totalIdf : 0 })),
    }
  }
}

const enc = new TextEncoder()
function byteCompare(a: string, b: string): number {
  const x = enc.encode(a)
  const y = enc.encode(b)
  const n = Math.min(x.length, y.length)
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return x[i] - y[i]
  return x.length - y.length
}
