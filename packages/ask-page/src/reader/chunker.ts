// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/reader/chunker.ts
//
// Groups blocks into passages: everything under one heading, split when it
// grows past ~700 characters. Each passage starts with its heading so the
// heading's words are searchable, and keeps the block indexes it came from.
// ─────────────────────────────────────────────────────────────────────────────

import type { Block, Passage } from "../types"

export const MAX_CHARS = 700

export function chunk(blocks: Block[], max = MAX_CHARS): Passage[] {
  const out: Passage[] = []
  let cur: { ref: string; parts: string[]; blocks: number[]; size: number } | null = null

  const flush = () => {
    if (cur && cur.parts.length) {
      const body = cur.parts.join("\n")
      if (body.trim()) out.push({ id: out.length, text: body, ref: cur.ref, blocks: cur.blocks })
    }
    cur = null
  }

  blocks.forEach((b, i) => {
    if (b.kind === "heading") {
      flush()
      cur = { ref: b.text, parts: [b.text], blocks: [i], size: b.text.length }
      return
    }
    if (!cur || cur.ref !== b.heading) {
      flush()
      cur = { ref: b.heading, parts: [], blocks: [], size: 0 }
    }
    if (cur.size + b.text.length > max && cur.parts.length > (cur.parts[0] === cur.ref ? 1 : 0)) {
      const ref = cur.ref
      flush()
      // continue the section; repeat the heading so the passage stands alone
      cur = { ref, parts: [ref], blocks: [], size: ref.length }
    }
    cur!.parts.push(b.text)
    cur!.blocks.push(i)
    cur!.size += b.text.length
  })
  flush()

  // a heading with nothing under it joins the passage after it
  const merged: Passage[] = []
  for (const p of out) {
    const prev = merged[merged.length - 1]
    if (prev && prev.text === prev.ref && prev.blocks.length === 1 && p.text.length + prev.text.length < max) {
      prev.text = `${prev.text}\n${p.text}`
      prev.blocks.push(...p.blocks)
      // the content sits under the later, more specific heading: name it by that
      prev.ref = p.ref || prev.ref
      continue
    }
    merged.push({ ...p, id: merged.length })
  }
  return merged
}
