import { expect, it } from "vitest"
import { readPage } from "../src/reader/pageReader"
import { AskPage } from "../src/controller"
import { load } from "./fixtures"

it("reads and indexes a large page quickly", async () => {
  const sections = Array.from({ length: 300 }, (_, i) => `<section><h2>Section ${i}</h2><div><div><p>Paragraph ${i} about topic${i} with some ordinary words for search.</p><ul><li>Point A${i}</li><li>Point B${i}</li></ul></div></div></section>`).join("")
  const doc = load(`<!doctype html><html lang="en"><head><title>Big</title></head><body><main>${sections}</main></body></html>`)
  const t0 = performance.now()
  const snap = readPage(doc)
  const read = performance.now() - t0
  expect(snap.passages.length).toBeGreaterThanOrEqual(300)
  const p = new AskPage({ doc, worker: false })
  const t1 = performance.now()
  const a = await p.ask("topic257")
  const askMs = performance.now() - t1
  expect(a.sources[0].ref).toBe("Section 257")
  console.log({ blocks: snap.blocks.length, readMs: Math.round(read), firstAskMs: Math.round(askMs) })
  expect(read).toBeLessThan(2000)
  p.dispose()
})
