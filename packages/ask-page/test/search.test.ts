import { describe, expect, it } from "vitest"
import { createSearchEngine, MODE_HYBRID, MODE_KEYWORD, MODE_VECTOR, type SearchEngine } from "../src/search/engine"
import { ASK_CORE_WASM_BASE64, ASK_CORE_WASM_SIZE } from "../src/search/askCoreWasm"
import { JsEngine, queryTerms, tokenize } from "../src/search/jsSearch"

const PASSAGES = [
  "Installation\nInstall the package with npm, then add one line to your layout.",
  "Options\nChoose Fast, Balanced or Best mode. Turn the cache off.",
  "సంక్రాంతి రోజు\nఇంటి ముందు రంగురంగుల ముగ్గులు వేస్తారు. కొత్త బియ్యంతో పొంగలి వండుతారు.",
  "కనుమ\nమూడవ రోజు కనుమ. ఈ రోజు పశువులను పూజిస్తారు.",
  "Privacy\nNothing typed into forms is ever read. Page text stays on the device.",
  "Troubleshooting\nIf the panel does not appear, check the script loads and the CSP allows blob workers.",
  "Requirements\nBalanced mode needs WebAssembly and about 118 MB for the multilingual model.",
  "Helpline\nCall the toll-free helpline 1800-425-0000 between 10 am and 5 pm.",
]

const QUESTIONS = [
  "How do I install it?",
  "installation steps",
  "What options are there?",
  "పొంగలి ఎప్పుడు వండుతారు?",
  "కనుమ రోజు ఏం చేస్తారు",
  "is my typed data read?",
  "panel does not appear",
  "how big is the model download",
  "helpline number",
  "refund policy",
  "ముగ్గు",
]

async function both(): Promise<[SearchEngine, SearchEngine]> {
  const w = await createSearchEngine(ASK_CORE_WASM_BASE64)
  const j = new JsEngine()
  for (const e of [w, j]) e.addPassages(PASSAGES)
  return [w, j]
}

describe("Rust/WASM search core", () => {
  it("loads the WebAssembly engine and stays small", async () => {
    const e = await createSearchEngine(ASK_CORE_WASM_BASE64)
    expect(e.kind).toBe("rust-wasm")
    expect(ASK_CORE_WASM_SIZE).toBeLessThan(100 * 1024)
  })

  it("falls back to the TypeScript twin without WebAssembly", async () => {
    const e = await createSearchEngine("")
    expect(e.kind).toBe("js")
  })

  it("Rust and TypeScript give the same keyword results", async () => {
    const [w, j] = await both()
    for (const q of QUESTIONS) {
      const a = w.search(q, null, MODE_KEYWORD, 5)
      const b = j.search(q, null, MODE_KEYWORD, 5)
      expect(a.terms, q).toBe(b.terms)
      expect(a.hits.map((h) => h.doc), q).toEqual(b.hits.map((h) => h.doc))
      a.hits.forEach((h, i) => {
        expect(h.bm25).toBeCloseTo(b.hits[i].bm25, 9)
        expect(h.coverage).toBeCloseTo(b.hits[i].coverage, 9)
      })
    }
  })

  it("finds the right passage, in English and Telugu", async () => {
    const [w] = await both()
    expect(w.search("How do I install it?", null, MODE_KEYWORD, 3).hits[0].doc).toBe(0)
    expect(w.search("పొంగలి ఎప్పుడు వండుతారు?", null, MODE_KEYWORD, 3).hits[0].doc).toBe(2)
    expect(w.search("కనుమ రోజు ఏం చేస్తారు", null, MODE_KEYWORD, 3).hits[0].doc).toBe(3)
    // prefix: ముగ్గు → ముగ్గులు
    expect(w.search("ముగ్గు", null, MODE_KEYWORD, 3).hits[0].doc).toBe(2)
    expect(w.search("refund policy", null, MODE_KEYWORD, 3).hits).toHaveLength(0)
  })

  it("quantizes vectors to int8 and searches by meaning, same in both engines", async () => {
    const [w, j] = await both()
    const dim = 16
    const vecs = new Float32Array(PASSAGES.length * dim)
    let seed = 7
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1
    for (let i = 0; i < PASSAGES.length; i++) {
      let n = 0
      for (let k = 0; k < dim; k++) n += (vecs[i * dim + k] = rnd()) ** 2
      for (let k = 0; k < dim; k++) vecs[i * dim + k] /= Math.sqrt(n)
    }
    const qw = w.quantize(vecs, dim)
    const qj = j.quantize(vecs, dim)
    expect(Array.from(qw.q)).toEqual(Array.from(qj.q))
    expect(Array.from(qw.scales)).toEqual(Array.from(qj.scales))
    w.setVectors(qw.q, qw.scales, dim)
    j.setVectors(qj.q, qj.scales, dim)
    const query = vecs.slice(5 * dim, 6 * dim)
    const a = w.search("zzz", query, MODE_VECTOR, 3)
    const b = j.search("zzz", query, MODE_VECTOR, 3)
    expect(a.hits[0].doc).toBe(5)
    expect(a.hits[0].cosine).toBeGreaterThan(0.98)
    expect(a.hits.map((h) => h.doc)).toEqual(b.hits.map((h) => h.doc))
    // hybrid: keyword "install" + vector of passage 5 → both appear, RRF scores
    const h = w.search("install", query, MODE_HYBRID, 4)
    const docs = h.hits.map((x) => x.doc)
    expect(docs).toContain(0)
    expect(docs).toContain(5)
    expect(h.hits[0].fused).toBeLessThan(0.05) // RRF sums are small
  })

  it("tokenizer keeps Telugu vowel signs and drops question words", () => {
    expect(tokenize("రత్నదీపాలు, రంగుల పద్యం!")).toEqual(["రత్నదీపాలు", "రంగుల", "పద్యం"])
    expect(queryTerms("ask-page ఎలా install చేయాలి?")).toEqual(["ask", "install"])
  })

  it("handles many passages and memory rebuilds", async () => {
    const e = await createSearchEngine(ASK_CORE_WASM_BASE64)
    const texts = Array.from({ length: 4000 }, (_, i) => `passage ${i} word${i} common text about item ${i % 50}`)
    e.addPassages(texts)
    for (let i = 0; i < 50; i++) expect(e.search(`word${i * 79}`, null, MODE_KEYWORD, 3).hits[0].doc).toBe(i * 79)
  })
})
