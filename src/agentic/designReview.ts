// ─────────────────────────────────────────────────────────────────────────────
// Idea 10 — AI Design Review Agent
// Reviews layout and interaction quality from an accessibility and
// usability point of view: hierarchy, readability, focus states, clutter,
// touch targets and consistency. Heuristics over computed styles — runs in
// the browser, no screenshots leave the device.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import { FOCUSABLE, INTERACTIVE, hasDirectText, isBrowser, queryAll, resolveRoot, selectorFor, shorten, type AuditRoot } from "./dom"
import { runQaAudit } from "./qaAudit"

export type DesignCategory = "hierarchy" | "readability" | "interaction" | "clutter" | "consistency"

export interface DesignFinding {
  category: DesignCategory
  severity: "high" | "medium" | "low"
  message: string
  suggestion: string
  selector?: string
}

export interface DesignReview {
  score: number
  categories: Record<DesignCategory, { score: number; findings: number }>
  findings: DesignFinding[]
  summary: string
}

export interface DesignReviewOptions {
  root?: AuditRoot
  /** Minimum body text size in px (default 14; 16 recommended for seniors). */
  minFontSize?: number
  /** Maximum comfortable line length in characters (default 90). */
  maxLineLength?: number
}

const WEIGHT = { high: 12, medium: 6, low: 2 }

export function reviewDesign(options: DesignReviewOptions = {}): DesignReview {
  const root = resolveRoot(options.root)
  const findings: DesignFinding[] = []
  const add = (category: DesignCategory, severity: DesignFinding["severity"], message: string, suggestion: string, el?: Element) =>
    findings.push({ category, severity, message, suggestion, selector: el ? selectorFor(el) : undefined })

  if (root && isBrowser()) {
    const minFont = options.minFontSize ?? 14
    const maxLine = options.maxLineLength ?? 90
    const style = (el: Element) => window.getComputedStyle(el)

    // ── Hierarchy ───────────────────────────────────────────────────────
    const h1 = queryAll(root, "h1")
    if (h1.length === 0) add("hierarchy", "medium", "There is no h1, so the page has no clear main title.", "Add one prominent h1 near the top.")
    if (h1.length > 1) add("hierarchy", "low", `${h1.length} h1 headings compete for attention.`, "Keep one h1 and demote the rest.", h1[1])
    const sizeOf = (sel: string) => {
      const el = queryAll(root, sel)[0]
      return el ? parseFloat(style(el).fontSize) || 0 : 0
    }
    const [s1, s2, s3] = [sizeOf("h1"), sizeOf("h2"), sizeOf("h3")]
    if (s1 && s2 && s2 >= s1) add("hierarchy", "medium", `h2 (${s2}px) is as large as or larger than h1 (${s1}px).`, "Make each heading level visibly smaller than the one above it.")
    if (s2 && s3 && s3 > s2) add("hierarchy", "low", `h3 (${s3}px) is larger than h2 (${s2}px).`, "Keep heading sizes in descending order.")
    const audit = runQaAudit({ root: options.root, skip: ["color-contrast", "target-size", "duplicate-id", "page-title", "html-lang", "form-error", "positive-tabindex"] })
    for (const issue of audit.issues.filter((i) => i.rule === "heading-order").slice(0, 3)) {
      add("hierarchy", "low", issue.message, issue.fix, issue.element)
    }

    // ── Readability ─────────────────────────────────────────────────────
    let tiny = 0
    let tinyExample: Element | undefined
    for (const el of queryAll(root, "p,li,td,span,a,label,small,div").slice(0, 1500)) {
      if (!hasDirectText(el)) continue
      const size = parseFloat(style(el).fontSize) || 16
      if (size < minFont) {
        tiny++
        tinyExample ??= el
      }
    }
    if (tiny) add("readability", tiny > 10 ? "high" : "medium", `${tiny} text element(s) are smaller than ${minFont}px, e.g. "${shorten(tinyExample?.textContent ?? "", 30)}".`, `Use at least ${minFont}px for body text (16px for senior-friendly pages).`, tinyExample)

    for (const p of queryAll(root, "p").slice(0, 200)) {
      const s = style(p)
      const size = parseFloat(s.fontSize) || 16
      const width = p.getBoundingClientRect().width
      const chars = width / (size * 0.5)
      if (width > 0 && chars > maxLine && (p.textContent ?? "").length > maxLine) {
        add("readability", "low", `A paragraph is about ${Math.round(chars)} characters wide.`, `Limit text width to ~${maxLine} characters (e.g. max-width: 70ch).`, p)
        break
      }
      const lh = parseFloat(s.lineHeight)
      if (Number.isFinite(lh) && lh / size < 1.3) {
        add("readability", "low", `Line height is ${(lh / size).toFixed(2)}× the font size.`, "Use line-height of at least 1.5 for body text (WCAG 1.4.12).", p)
        break
      }
    }
    const contrast = runQaAudit({ root: options.root, skip: ["html-lang", "page-title", "image-alt", "heading-order", "single-h1", "landmark-main", "form-label", "button-name", "link-name", "positive-tabindex", "keyboard-access", "duplicate-id", "form-error", "target-size"] })
    if (contrast.issues.length) {
      add("readability", contrast.issues.length > 5 ? "high" : "medium", `${contrast.issues.length} text element(s) have weak contrast. ${contrast.issues[0].message}`, "Raise contrast to at least 4.5:1 for body text.", contrast.issues[0].element)
    }

    // ── Interaction: focus states & targets ─────────────────────────────
    const removedFocus = findRemovedFocusOutlines()
    if (removedFocus.length) {
      add("interaction", "high", `Focus outlines are removed by CSS (${removedFocus.slice(0, 2).join(", ")}) with no replacement.`, "Never remove outlines without a visible :focus-visible style (WCAG 2.4.7).")
    }
    const small = queryAll(root, INTERACTIVE).filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24) && !(el.tagName === "A" && el.closest("p,li"))
    })
    if (small.length) add("interaction", small.length > 5 ? "high" : "medium", `${small.length} control(s) are smaller than 24×24px.`, "Give controls at least 24×24px, ideally 44×44px for touch and seniors.", small[0])

    // ── Clutter ─────────────────────────────────────────────────────────
    const viewportH = window.innerHeight || 800
    const aboveFold = queryAll(root, FOCUSABLE).filter((el) => {
      const r = el.getBoundingClientRect()
      return r.height > 0 && r.top < viewportH
    })
    if (aboveFold.length > 40) add("clutter", "medium", `${aboveFold.length} interactive elements in the first screen.`, "Group secondary actions into menus and keep the first screen focused on one task.")
    const primaryButtons = queryAll(root, "button,a[href],[role='button']").filter((el) => {
      const r = el.getBoundingClientRect()
      if (r.height === 0 || r.top > viewportH) return false
      const bg = style(el).backgroundColor
      return Boolean(bg) && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && !/rgb\(255, 255, 255\)/.test(bg)
    })
    if (primaryButtons.length > 4) add("clutter", "medium", `${primaryButtons.length} filled buttons compete in the first screen.`, "Keep one primary action per view; make the rest secondary (outline or text).", primaryButtons[0])

    // ── Consistency ─────────────────────────────────────────────────────
    const families = new Set<string>()
    const sizes = new Set<number>()
    for (const el of queryAll(root, "body *").slice(0, 2000)) {
      if (!hasDirectText(el)) continue
      const s = style(el)
      families.add(s.fontFamily.split(",")[0].replace(/["']/g, "").trim().toLowerCase())
      sizes.add(Math.round(parseFloat(s.fontSize) || 0))
    }
    if (families.size > 4) add("consistency", "low", `${families.size} different font families are used.`, "Stick to 1–2 font families (e.g. one Telugu + one Latin).")
    if (sizes.size > 10) add("consistency", "low", `${sizes.size} different font sizes are used.`, "Use a small type scale (5–7 sizes) for a calmer page.")
    const imgsNoSize = queryAll(root, "img:not([width]):not([height])").filter((img) => !style(img).aspectRatio || style(img).aspectRatio === "auto")
    if (imgsNoSize.length > 3) add("consistency", "low", `${imgsNoSize.length} images have no width/height, so the layout jumps while loading.`, "Set width and height (or aspect-ratio) on images.", imgsNoSize[0])
  }

  const categories = (["hierarchy", "readability", "interaction", "clutter", "consistency"] as DesignCategory[]).reduce(
    (acc, cat) => {
      const list = findings.filter((f) => f.category === cat)
      acc[cat] = { score: Math.max(0, 100 - list.reduce((n, f) => n + WEIGHT[f.severity] * 2, 0)), findings: list.length }
      return acc
    },
    {} as DesignReview["categories"]
  )
  const score = Math.max(0, 100 - findings.reduce((n, f) => n + WEIGHT[f.severity], 0))
  const worst = Object.entries(categories).sort((a, b) => a[1].score - b[1].score)[0]
  return {
    score,
    categories,
    findings,
    summary: findings.length
      ? `Design score ${score}/100 with ${findings.length} finding(s). Weakest area: ${worst[0]}.`
      : "No design issues found by the automatic review.",
  }
}

/** CSS rules that set outline:none on :focus without a visible replacement. */
function findRemovedFocusOutlines(): string[] {
  const out: string[] = []
  let focusVisibleStyled = false
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested) visit(nested)
      const r = rule as CSSStyleRule
      if (!r.selectorText || !/:focus/.test(r.selectorText)) continue
      const outline = `${r.style.outline} ${r.style.outlineStyle} ${r.style.outlineWidth}`
      const removes = /\bnone\b|\b0(px)?\b/.test(outline)
      const replaces = Boolean(r.style.boxShadow && r.style.boxShadow !== "none") || Boolean(r.style.borderColor) || Boolean(r.style.backgroundColor) || Boolean(r.style.textDecoration)
      if (/:focus-visible/.test(r.selectorText) && (!removes || replaces)) focusVisibleStyled = true
      if (removes && !replaces) out.push(r.selectorText)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      /* cross-origin stylesheet — can't be read, skip */
    }
  }
  // A separate visible :focus-visible style is a valid replacement
  return focusVisibleStyled ? [] : out
}
