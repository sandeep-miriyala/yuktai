import { describe, expect, it } from "vitest"
import { readPage } from "../src/reader/pageReader"
import { describeField } from "../src/reader/privacyFilter"
import { DOCS, FORM, TELUGU, load } from "./fixtures"

describe("page reader and privacy filter", () => {
  it("never reads typed values, passwords, editors or owner-private text", () => {
    const doc = load(FORM, "https://example.com/signup")
    const snap = readPage(doc)
    const all = snap.passages.map((p) => p.text).join("\n") + snap.blocks.map((b) => b.text).join("\n")
    for (const secret of ["Ravi Kumar", "ravi@example.com", "SuperSecret#2026", "4111-1111", "TOPSECRETDRAFT", "HIDDEN-OWNER-NOTE"]) {
      expect(all).not.toContain(secret)
    }
    expect(all).toContain("Full name") // labels stay
    expect(snap.sensitive).toBe(true) // password field → memory only
  })

  it("describes form fields by label, type and required, never value", () => {
    const doc = load(FORM)
    const pw = describeField(doc.getElementById("pw") as HTMLInputElement)
    expect(pw).toEqual({ label: "Password", type: "password", required: true, hint: "" })
    expect(JSON.stringify(describeField(doc.getElementById("bio") as HTMLTextAreaElement))).not.toContain("private note")
  })

  it("reads main content only, keeps headings as source names", () => {
    const snap = readPage(load(DOCS, "https://example.com/docs/ask-page"))
    const text = snap.passages.map((p) => p.text).join("\n")
    expect(text).not.toContain("Copyright") // footer skipped? footer is outside <main>
    expect(text).toContain("npm install @yuktishaalaa/ask-page")
    const install = snap.passages.find((p) => p.text.includes("npm install"))!
    expect(install.ref).toBe("Installation")
    const opts = snap.passages.find((p) => p.text.includes("Save vectors on the device"))!
    expect(opts.ref).toBe("Options")
    expect(opts.text).toContain("cache | true | Save vectors on the device")
    expect(snap.lang).toBe("en")
    expect(snap.sensitive).toBe(false)
    expect(snap.hash).toMatch(/^[0-9a-f]{16}$/)
  })

  it("reads Telugu pages and detects the language", () => {
    const snap = readPage(load(TELUGU))
    expect(snap.lang).toBe("te")
    const kanuma = snap.passages.find((p) => p.ref === "కనుమ")!
    expect(kanuma.text).toContain("పశువులను పూజిస్తారు")
  })

  it("the hash changes when the page changes", () => {
    const doc = load(DOCS)
    const a = readPage(doc).hash
    doc.querySelector("main p")!.textContent = "Changed text for the intro paragraph."
    expect(readPage(doc).hash).not.toBe(a)
  })
})
