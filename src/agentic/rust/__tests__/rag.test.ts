// @vitest-environment happy-dom
//
// The Rust RAG engine must give EXACTLY what TypeScript gives: same passages,
// same scores (bit for bit), same order, same answers.

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createContextIndex } from "../../contextIndex"
import { loadRagCore, RagCore, RAG_AUTO_MIN_PASSAGES, wantsRustRag } from "../ragEngine"

let rustAnswered = 0
const realSearch = RagCore.prototype.search
RagCore.prototype.search = function (...args: Parameters<RagCore["search"]>) {
  const r = realSearch.apply(this, args)
  if (r) rustAnswered++
  return r
}

beforeAll(async () => {
  expect(await loadRagCore()).not.toBeNull()
})

afterAll(() => {
  console.log(`Rust answered ${rustAnswered} RAG searches`)
  expect(rustAnswered).toBeGreaterThan(500)
})

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const WORDS = [
  "Hyderabad", "hyderabad", "Vizag", "salary", "salaries", "Salary", "leave", "leaves", "policy", "policies",
  "రత్నదీపాలు", "రత్నం", "రత్న", "జయంతి", "యాజ్ఞవల్క్య", "పద్యం", "పద్యాలు", "రంగు", "రంగుల", "సీత", "సీతమ్మ",
  "the", "is", "a", "of", "2024", "10", "₹10,000", "Ravi", "Sita", "office", "offices", "𝒜𝒷𝒸𝒹",
]

function makeDocs(seed: number, n: number) {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => ({
    id: `d${i}`,
    text: Array.from({ length: 1 + Math.floor(r() * 30) }, () => WORDS[Math.floor(r() * WORDS.length)]).join(r() < 0.5 ? " " : ", "),
  }))
}

const QUESTIONS = [
  "salary", "What is the salary policy?", "leave policies in Hyderabad", "sal", "sala", "salaryhike",
  "రత్న", "రత్నదీపాలు ఏమిటి?", "జయంతి ఎప్పుడు", "సీత పద్యం", "Ravi office 2024", "₹10,000", "zzz", "of the", "𝒜𝒷𝒸",
]

const view = (hits: { id: string; score: number }[]) => hits.map((h) => `${h.id}:${h.score}`)

describe("engine choice", () => {
  it("uses Rust only when asked", () => {
    expect(wantsRustRag(undefined, 1e6)).toBe(false)
    expect(wantsRustRag("ts", 1e6)).toBe(false)
    expect(wantsRustRag("rust", 1)).toBe(true)
    expect(wantsRustRag("auto", RAG_AUTO_MIN_PASSAGES - 1)).toBe(false)
    expect(wantsRustRag("auto", RAG_AUTO_MIN_PASSAGES)).toBe(true)
  })

  it("reports the engine", async () => {
    const ts = createContextIndex({ includePage: false, documents: makeDocs(1, 10) })
    const rust = createContextIndex({ includePage: false, documents: makeDocs(1, 10), engine: "rust" })
    expect(await ts.whenEngineReady()).toBe("ts")
    expect(await rust.whenEngineReady()).toBe("rust")
    expect(rust.engine).toBe("rust")
  })
})

describe("search: TypeScript and Rust agree exactly", () => {
  for (const size of [5, 60, 800]) {
    it(`${size} documents`, async () => {
      for (let seed = 1; seed <= 6; seed++) {
        const documents = makeDocs(seed * 13 + size, size)
        const ts = createContextIndex({ includePage: false, documents })
        const rust = createContextIndex({ includePage: false, documents, engine: "rust" })
        await rust.whenEngineReady()
        for (const q of QUESTIONS) {
          for (const k of [1, 3, 5, 50]) {
            expect(view(rust.search(q, k))).toEqual(view(ts.search(q, k)))
          }
        }
      }
    })
  }

  it("grid rows as passages", async () => {
    const r = rng(5)
    const rows = Array.from({ length: 500 }, (_, i) => ({
      id: String(i),
      name: WORDS[Math.floor(r() * WORDS.length)],
      city: WORDS[Math.floor(r() * WORDS.length)],
      salary: Math.floor(r() * 200000),
    }))
    const columns = [
      { key: "name", label: "Name", type: "text" as const },
      { key: "city", label: "City", type: "text" as const },
      { key: "salary", label: "Salary", type: "number" as const },
    ]
    const ts = createContextIndex({ includePage: false, rows, columns })
    const rust = createContextIndex({ includePage: false, rows, columns, engine: "rust" })
    await rust.whenEngineReady()
    for (const q of [...QUESTIONS, "salary 15000", "City Hyderabad", "Name సీత"]) {
      expect(view(rust.search(q, 5))).toEqual(view(ts.search(q, 5)))
    }
  })

  it("odd k values fall back to TypeScript safely", async () => {
    const documents = makeDocs(9, 30)
    const ts = createContextIndex({ includePage: false, documents })
    const rust = createContextIndex({ includePage: false, documents, engine: "rust" })
    await rust.whenEngineReady()
    for (const k of [0, -1, 2.5, Infinity]) {
      expect(view(rust.search("salary policy", k))).toEqual(view(ts.search("salary policy", k)))
    }
  })
})

describe("Ask page: same answers from the real page text", () => {
  it("answers the same, and follows page changes", async () => {
    document.body.innerHTML = `
      <main>
        <h1>Sri Yagnavalkya Jayanti</h1>
        <p>యాజ్ఞవల్క్య జయంతి ఉత్సవాలు హైదరాబాదులో జరుగుతాయి. Registration closes on 10 November.</p>
        <h2>Leave policy</h2>
        <p>Staff get 12 casual leaves. Leave requests go to the office manager.</p>
        <ul><li>రంగు రంగుల రత్నదీపాలు — పద్యాలు</li><li>Salary is paid on the 1st.</li></ul>
      </main>`
    const ts = createContextIndex({})
    const rust = createContextIndex({ engine: "rust" })
    for (const q of ["When does registration close?", "leave policy", "జయంతి ఎక్కడ", "రత్నదీపాలు", "salary"]) {
      const [a, b] = [await ts.ask(q), await rust.ask(q)]
      expect(b.answer).toBe(a.answer)
      expect(view(b.hits)).toEqual(view(a.hits))
    }
    expect(rust.engine).toBe("rust")

    // Page changes: rebuild picks it up in both engines
    document.querySelector("ul")!.insertAdjacentHTML("beforeend", "<li>Holiday list: Sankranti, Ugadi</li>")
    ts.rebuild()
    rust.rebuild()
    const [a, b] = [await ts.ask("holiday list"), await rust.ask("holiday list")]
    expect(b.answer).toBe(a.answer)
    expect(a.answer).toMatch(/Sankranti/)
  })
})
