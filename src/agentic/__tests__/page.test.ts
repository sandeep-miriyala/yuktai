// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest"
import { createA11yCopilot } from "../a11yCopilot"
import { createContextIndex } from "../contextIndex"
import { reviewDesign } from "../designReview"
import { contrastRatio, parseColor } from "../dom"
import { reviewForms } from "../formReview"
import { analyzePage, askAboutPage } from "../pageInsights"
import { auditToJSON, auditToMarkdown, runQaAudit } from "../qaAudit"

const PAGE = `
  <header><nav><a href="/">Home</a><a href="/x"><svg></svg></a></nav></header>
  <h1>Contact Ratnalabala</h1>
  <h3>Skipped level</h3>
  <p style="color:#aaaaaa;background:#ffffff">Light grey text that is hard to read.</p>
  <p>Telugu poems are read aloud in male and female voices.</p>
  <img src="logo.png">
  <img src="poet.png" title="Poet portrait">
  <form aria-label="Contact form">
    <input type="text" name="full_name" placeholder="Your name">
    <input type="text" id="email" name="email" required><label for="email">Email</label>
    <textarea name="message" aria-invalid="true"></textarea>
    <button type="submit">Go</button>
  </form>
  <div onclick="void 0" class="card">Open card</div>
  <span tabindex="3">Odd tab order</span>
  <button class="icon-only"><svg></svg></button>
`

beforeEach(() => {
  document.documentElement.removeAttribute("lang")
  document.title = "Contact"
  document.body.innerHTML = PAGE
})

describe("dom helpers", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio(parseColor("#000")!, parseColor("#fff")!)).toBe(21)
    expect(contrastRatio(parseColor("#aaaaaa")!, parseColor("#ffffff")!)).toBeLessThan(4.5)
  })
})

describe("idea 5 — QA audit", () => {
  it("finds the expected problems", () => {
    const report = runQaAudit()
    const rules = new Set(report.issues.map((i) => i.rule))
    for (const rule of ["html-lang", "image-alt", "heading-order", "landmark-main", "form-label", "link-name", "button-name", "positive-tabindex", "keyboard-access", "form-error"]) {
      expect(rules, rule).toContain(rule)
    }
    expect(report.passed).toBe(false)
    expect(report.score).toBeLessThan(80)
  })

  it("exports markdown and JSON without DOM nodes", () => {
    const report = runQaAudit()
    expect(auditToMarkdown(report)).toContain("# Accessibility QA report")
    expect(() => JSON.parse(auditToJSON(report))).not.toThrow()
  })

  it("ignores yuktai's own panels", () => {
    document.body.innerHTML = `<main><h1>Ok</h1><div data-yuktai-panel><img src="x.png"></div></main>`
    document.documentElement.lang = "en"
    expect(runQaAudit().issues.filter((i) => i.rule === "image-alt")).toHaveLength(0)
  })
})

describe("idea 1 — copilot", () => {
  it("explains, fixes and undoes", () => {
    const copilot = createA11yCopilot({ defaultLang: "te" })
    const report = copilot.scan()
    const label = report.issues.find((i) => i.rule === "form-label")!
    expect(copilot.explain(label.id)).toContain("Why it matters")

    const before = report.issues.length
    const results = copilot.applyAllFixes()
    expect(results.some((r) => r.applied)).toBe(true)
    expect(document.documentElement.getAttribute("lang")).toBe("te")
    expect(document.querySelector("input[name='full_name']")!.getAttribute("aria-label")).toBe("Your name")
    expect(copilot.getState().report!.issues.length).toBeLessThan(before)

    copilot.undoAll()
    expect(document.documentElement.hasAttribute("lang")).toBe(false)
    expect(document.querySelector("input[name='full_name']")!.hasAttribute("aria-label")).toBe(false)
  })
})

describe("idea 2 — page understanding", () => {
  it("describes the page and lists unlabeled fields", async () => {
    const outline = analyzePage()
    expect(outline.counts.forms).toBe(1)
    expect(outline.unlabeledFields.map((f) => f.hint)).toEqual(expect.arrayContaining(["Your name", "message"]))
    const answer = await askAboutPage("Which form fields are missing labels?")
    expect(answer.intent).toBe("missing-labels")
    expect(answer.answer).toContain("Your name")
    const purpose = await askAboutPage("What does this page do?")
    expect(purpose.answer).toContain("Contact Ratnalabala")
  })
})

describe("idea 6 — forms", () => {
  it("reviews the contact form", () => {
    const [review] = reviewForms()
    expect(review.name).toBe("Contact form")
    const messages = review.findings.map((f) => f.message).join("\n")
    expect(messages).toMatch(/placeholder/)
    expect(messages).toMatch(/autocomplete/)
    expect(messages).toMatch(/isn't connected/)
    expect(messages).toMatch(/button says "Go"/)
    expect(review.score).toBeLessThan(80)
  })
})

describe("idea 7 — page + data RAG", () => {
  it("answers from page text and grid rows", async () => {
    const index = createContextIndex({
      rows: [
        { id: "p1", title: "గర్వం", poet: "మిరియాల వెంకటరత్నం" },
        { id: "p2", title: "మనసు", poet: "మిరియాల వెంకటరత్నం" },
      ],
      columns: [
        { key: "title", label: "Title" },
        { key: "poet", label: "Poet" },
      ],
    })
    expect(index.search("మనసు")[0].ref).toBe("p2")
    const page = await index.ask("Which voices read the poems?")
    expect(page.answer).toMatch(/male and female voices/)
    const generated = await index.ask("poems voices", { generate: async (_q, ctx) => `From context: ${ctx.length > 0}` })
    expect(generated.generated).toBe(true)
  })
})

describe("idea 10 — design review", () => {
  it("runs and returns category scores", () => {
    const style = document.createElement("style")
    style.textContent = "button:focus { outline: none; }"
    document.head.appendChild(style)
    const review = reviewDesign()
    expect(review.categories.hierarchy).toBeDefined()
    expect(review.findings.some((f) => f.category === "interaction" && /Focus outlines/.test(f.message))).toBe(true)
    style.remove()
  })
})
