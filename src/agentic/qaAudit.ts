// ─────────────────────────────────────────────────────────────────────────────
// Idea 5 — AI QA Tester for Web Pages
// Runs a QA pass over the live DOM and returns a pass/fail report with
// WCAG references, plain-English reasons and suggested fixes.
// Original code for yuktai. Rule wording is our own; WCAG criterion numbers
// are public references to the W3C standard.
// ─────────────────────────────────────────────────────────────────────────────

import {
  INTERACTIVE,
  accessibleName,
  contrastRatio,
  effectiveBackground,
  hasDirectText,
  isLargeText,
  parseColor,
  queryAll,
  resolveRoot,
  selectorFor,
  shorten,
  type AuditRoot,
  isDocument,
} from "./dom"

export type AuditSeverity = "critical" | "serious" | "moderate" | "minor"

export type AuditRuleId =
  | "html-lang"
  | "page-title"
  | "image-alt"
  | "heading-order"
  | "single-h1"
  | "landmark-main"
  | "form-label"
  | "button-name"
  | "link-name"
  | "color-contrast"
  | "positive-tabindex"
  | "keyboard-access"
  | "duplicate-id"
  | "form-error"
  | "target-size"

export interface AuditIssue {
  /** Stable within one report, e.g. "image-alt-3". */
  id: string
  rule: AuditRuleId
  severity: AuditSeverity
  /** WCAG success criterion, e.g. "1.1.1", or "best practice". */
  wcag: string
  message: string
  /** Why it matters, in plain English. */
  why: string
  /** What to change. */
  fix: string
  selector: string
  snippet: string
  /** True when the copilot can apply a safe fix in the browser. */
  autoFixable: boolean
  element?: Element
}

export interface AuditCheck {
  rule: AuditRuleId
  title: string
  passed: boolean
  issueCount: number
}

export interface AuditReport {
  url: string
  title: string
  generatedAt: string
  score: number
  passed: boolean
  checks: AuditCheck[]
  issues: AuditIssue[]
  summary: string
}

export interface AuditOptions {
  root?: AuditRoot
  /** Skip rules you don't need. */
  skip?: AuditRuleId[]
  /** Cap contrast checks on very large pages (default 600 elements). */
  maxContrastChecks?: number
  /** Minimum interactive target size in CSS px (WCAG 2.5.8 uses 24). */
  minTargetSize?: number
}

interface RuleInfo {
  title: string
  wcag: string
  severity: AuditSeverity
  why: string
}

export const AUDIT_RULES: Record<AuditRuleId, RuleInfo> = {
  "html-lang": {
    title: "Page language is set",
    wcag: "3.1.1",
    severity: "serious",
    why: "Screen readers pick their voice and pronunciation from the page language. Without it, Telugu or Hindi text may be read with English rules.",
  },
  "page-title": {
    title: "Page has a title",
    wcag: "2.4.2",
    severity: "serious",
    why: "The title is the first thing announced and the name shown on browser tabs and bookmarks.",
  },
  "image-alt": {
    title: "Images have alternative text",
    wcag: "1.1.1",
    severity: "critical",
    why: "People who cannot see the image get no information from it unless alt text describes it (or alt=\"\" marks it as decorative).",
  },
  "heading-order": {
    title: "Headings follow a logical order",
    wcag: "1.3.1",
    severity: "moderate",
    why: "Many screen-reader users jump between headings. Skipped levels make the page outline confusing.",
  },
  "single-h1": {
    title: "Page has one main heading",
    wcag: "best practice",
    severity: "minor",
    why: "A single h1 tells everyone what the page is about.",
  },
  "landmark-main": {
    title: "Main content landmark exists",
    wcag: "1.3.1 / 2.4.1",
    severity: "moderate",
    why: "A <main> region lets keyboard and screen-reader users skip straight past menus to the content.",
  },
  "form-label": {
    title: "Form fields have labels",
    wcag: "1.3.1 / 4.1.2",
    severity: "critical",
    why: "Without a label, a screen reader just says \"edit text\" and the user has to guess what to type.",
  },
  "button-name": {
    title: "Buttons have names",
    wcag: "4.1.2",
    severity: "critical",
    why: "An icon-only button with no name is announced as just \"button\", so its purpose is unknown.",
  },
  "link-name": {
    title: "Links have names",
    wcag: "2.4.4",
    severity: "serious",
    why: "Links are often read out of context in a list. An empty link gives no clue where it goes.",
  },
  "color-contrast": {
    title: "Text has enough contrast",
    wcag: "1.4.3",
    severity: "serious",
    why: "Low-contrast text is hard to read for older users, people with low vision, and anyone outdoors on a phone.",
  },
  "positive-tabindex": {
    title: "No positive tabindex",
    wcag: "2.4.3",
    severity: "moderate",
    why: "tabindex greater than 0 forces a custom keyboard order that usually doesn't match the visual order.",
  },
  "keyboard-access": {
    title: "Clickable things work with a keyboard",
    wcag: "2.1.1",
    severity: "critical",
    why: "A div or span with a click handler can't be reached or activated with Tab and Enter, locking out keyboard users.",
  },
  "duplicate-id": {
    title: "IDs are unique",
    wcag: "best practice",
    severity: "minor",
    why: "Labels and ARIA references point at ids. Duplicates make them point at the wrong element.",
  },
  "form-error": {
    title: "Errors are linked to their fields",
    wcag: "3.3.1",
    severity: "serious",
    why: "When a field is marked invalid, the error message must be connected to it so it's announced together with the field.",
  },
  "target-size": {
    title: "Touch targets are large enough",
    wcag: "2.5.8",
    severity: "moderate",
    why: "Small targets are hard to tap for people with tremors, seniors and everyone on mobile.",
  },
}

const SEVERITY_WEIGHT: Record<AuditSeverity, number> = { critical: 10, serious: 5, moderate: 2, minor: 1 }

export function runQaAudit(options: AuditOptions = {}): AuditReport {
  const root = resolveRoot(options.root)
  const skip = new Set(options.skip ?? [])
  const issues: AuditIssue[] = []
  const counters: Partial<Record<AuditRuleId, number>> = {}

  const doc: Document | null = root ? (isDocument(root) ? root : root.ownerDocument) : null

  const add = (
    rule: AuditRuleId,
    el: Element | null,
    message: string,
    fix: string,
    autoFixable = false
  ) => {
    if (skip.has(rule)) return
    const info = AUDIT_RULES[rule]
    const n = (counters[rule] = (counters[rule] ?? 0) + 1)
    issues.push({
      id: `${rule}-${n}`,
      rule,
      severity: info.severity,
      wcag: info.wcag,
      message,
      why: info.why,
      fix,
      selector: el ? selectorFor(el) : "document",
      snippet: el ? shorten(el.outerHTML, 120) : "",
      autoFixable,
      element: el ?? undefined,
    })
  }

  if (root && doc) {
    // ── Document-level ──────────────────────────────────────────────────
    if (!doc.documentElement.getAttribute("lang")) {
      add("html-lang", doc.documentElement, "The <html> element has no lang attribute.", 'Add lang to <html>, e.g. <html lang="te"> or "en".', true)
    }
    if (!doc.title.trim()) {
      add("page-title", null, "The page has no <title>.", "Add a short, descriptive <title> that names this page.")
    }

    // ── Images ──────────────────────────────────────────────────────────
    for (const img of queryAll(root, "img")) {
      if (img.getAttribute("role") === "presentation" || img.getAttribute("role") === "none") continue
      if (!img.hasAttribute("alt") && !img.getAttribute("aria-label") && !img.getAttribute("aria-labelledby")) {
        const title = img.getAttribute("title")
        add(
          "image-alt",
          img,
          `Image has no alt text${img.getAttribute("src") ? ` (${shorten(img.getAttribute("src") ?? "", 40)})` : ""}.`,
          title ? `Use the title as alt: alt="${shorten(title, 40)}".` : 'Describe the image in alt, or use alt="" if it is purely decorative.',
          Boolean(title)
        )
      }
    }

    // ── Headings & landmarks ────────────────────────────────────────────
    const headings = queryAll(root, "h1,h2,h3,h4,h5,h6")
    let last = 0
    for (const h of headings) {
      const level = Number(h.tagName[1])
      if (last > 0 && level > last + 1) {
        add("heading-order", h, `Heading jumps from h${last} to h${level}: "${shorten(h.textContent ?? "", 40)}".`, `Change it to h${last + 1}, or add the missing level above it.`)
      }
      last = level
    }
    const h1s = headings.filter((h) => h.tagName === "H1")
    if (h1s.length === 0) add("single-h1", null, "The page has no h1.", "Add one h1 that names the page.")
    else if (h1s.length > 1) add("single-h1", h1s[1], `The page has ${h1s.length} h1 headings.`, "Keep one h1; turn the others into h2.")

    if (root.querySelectorAll("main,[role='main']").length === 0) {
      add("landmark-main", null, "No <main> landmark found.", "Wrap the primary content in <main>.")
    }

    // ── Forms ───────────────────────────────────────────────────────────
    const fields = queryAll(root, "input,select,textarea").filter((el) => {
      const type = (el.getAttribute("type") ?? "text").toLowerCase()
      return !["hidden", "submit", "button", "reset", "image"].includes(type)
    })
    for (const field of fields) {
      if (!accessibleName(field)) {
        const hint = field.getAttribute("placeholder") || field.getAttribute("name")
        add(
          "form-label",
          field,
          `Form field has no label${hint ? ` (placeholder/name: "${shorten(hint, 30)}")` : ""}.`,
          hint ? `Add a visible <label>. Quick fix: aria-label="${shorten(hint, 30)}".` : "Add a visible <label for=…> describing what to enter.",
          Boolean(hint)
        )
      }
      if (field.getAttribute("aria-invalid") === "true") {
        const describedBy = field.getAttribute("aria-describedby") || field.getAttribute("aria-errormessage")
        if (!describedBy) {
          add("form-error", field, "Field is marked invalid but no error message is linked to it.", "Put the error text in an element with an id and point aria-describedby at it.")
        }
      }
    }

    // ── Buttons & links ─────────────────────────────────────────────────
    for (const btn of queryAll(root, "button,[role='button'],input[type='submit'],input[type='button']")) {
      if (!accessibleName(btn)) {
        const title = btn.getAttribute("title")
        add("button-name", btn, "Button has no accessible name.", title ? `Use the title as the name: aria-label="${title}".` : "Add visible text or an aria-label that says what the button does.", Boolean(title))
      }
    }
    for (const link of queryAll(root, "a[href]")) {
      if (!accessibleName(link)) {
        const title = link.getAttribute("title")
        add("link-name", link, `Link has no text (${shorten(link.getAttribute("href") ?? "", 40)}).`, title ? `Use the title as the name: aria-label="${title}".` : "Add link text that says where it goes.", Boolean(title))
      }
    }

    // ── Keyboard ────────────────────────────────────────────────────────
    for (const el of queryAll(root, "[tabindex]")) {
      if (Number(el.getAttribute("tabindex")) > 0) {
        add("positive-tabindex", el, `tabindex="${el.getAttribute("tabindex")}" overrides the natural tab order.`, 'Use tabindex="0" and fix the order in the HTML instead.', true)
      }
    }
    const native = "a[href],button,input,select,textarea,summary"
    for (const el of queryAll(root, "[onclick],[role='button'],[role='link']")) {
      if (el.matches(native) || el.hasAttribute("tabindex")) continue
      add("keyboard-access", el, `<${el.tagName.toLowerCase()}> is clickable but can't be reached with the keyboard.`, "Use a real <button>, or add tabindex=\"0\", a role and Enter/Space key handling.", true)
    }

    // ── Duplicate ids ───────────────────────────────────────────────────
    const seen = new Map<string, number>()
    for (const el of Array.from(root.querySelectorAll("[id]"))) {
      if (el.closest("[data-yuktai-panel]")) continue
      seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    }
    for (const [id, count] of seen) {
      if (count > 1) add("duplicate-id", root.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`), `id="${id}" is used ${count} times.`, "Give each element a unique id.")
    }

    // ── Contrast ────────────────────────────────────────────────────────
    const max = options.maxContrastChecks ?? 600
    let checked = 0
    for (const el of queryAll(root, "body *")) {
      if (checked >= max) break
      if (!hasDirectText(el) || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(el.tagName)) continue
      checked++
      const fg = parseColor(window.getComputedStyle(el).color)
      const bg = effectiveBackground(el)
      if (!fg || !bg) continue
      const ratio = contrastRatio(fg, bg)
      const needed = isLargeText(el) ? 3 : 4.5
      if (ratio < needed) {
        add("color-contrast", el, `Contrast ${ratio}:1 is below ${needed}:1 for "${shorten(el.textContent ?? "", 30)}".`, `Darken the text or lighten the background until the ratio is at least ${needed}:1.`)
      }
    }

    // ── Target size ─────────────────────────────────────────────────────
    const min = options.minTargetSize ?? 24
    for (const el of queryAll(root, INTERACTIVE)) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue // not laid out (or test env)
      if (el.tagName === "A" && el.closest("p,li,td")) continue // inline links are exempt
      if (rect.width < min || rect.height < min) {
        add("target-size", el, `Target is ${Math.round(rect.width)}×${Math.round(rect.height)}px (minimum ${min}×${min}).`, `Increase padding so it's at least ${min}×${min}px (44×44 is better for seniors).`)
      }
    }
  }

  return buildReport(issues, doc, skip)
}

function buildReport(issues: AuditIssue[], doc: Document | null, skip: Set<AuditRuleId>): AuditReport {
  const checks: AuditCheck[] = (Object.keys(AUDIT_RULES) as AuditRuleId[])
    .filter((rule) => !skip.has(rule))
    .map((rule) => {
      const issueCount = issues.filter((i) => i.rule === rule).length
      return { rule, title: AUDIT_RULES[rule].title, passed: issueCount === 0, issueCount }
    })

  // Each rule can cost at most 25 points so one noisy rule can't zero the score.
  let penalty = 0
  for (const check of checks) {
    const weight = SEVERITY_WEIGHT[AUDIT_RULES[check.rule].severity]
    penalty += Math.min(25, check.issueCount * weight)
  }
  const score = Math.max(0, 100 - penalty)
  const failed = checks.filter((c) => !c.passed)
  const critical = issues.filter((i) => i.severity === "critical").length

  return {
    url: doc?.location?.href ?? "",
    title: doc?.title ?? "",
    generatedAt: new Date().toISOString(),
    score,
    passed: critical === 0 && score >= 80,
    checks,
    issues,
    summary:
      issues.length === 0
        ? `All ${checks.length} checks passed.`
        : `${checks.length - failed.length} of ${checks.length} checks passed. ${issues.length} issue(s) found, ${critical} critical. Score ${score}/100.`,
  }
}

/** Markdown report you can download, paste into a ticket or attach to a PR. */
export function auditToMarkdown(report: AuditReport): string {
  const lines = [
    `# Accessibility QA report`,
    ``,
    `- Page: ${report.title || "(untitled)"} ${report.url}`,
    `- Generated: ${report.generatedAt}`,
    `- Score: **${report.score}/100** — ${report.passed ? "PASS" : "FAIL"}`,
    ``,
    report.summary,
    ``,
    `## Checks`,
    ``,
    `| Check | Result | Issues |`,
    `|---|---|---|`,
    ...report.checks.map((c) => `| ${c.title} | ${c.passed ? "✅ Pass" : "❌ Fail"} | ${c.issueCount} |`),
  ]
  if (report.issues.length) {
    lines.push(``, `## Issues`, ``)
    for (const i of report.issues) {
      lines.push(
        `### ${i.id} · ${i.severity} · WCAG ${i.wcag}`,
        ``,
        `- **Problem:** ${i.message}`,
        `- **Why it matters:** ${i.why}`,
        `- **Fix:** ${i.fix}`,
        `- **Where:** \`${i.selector}\``,
        ``
      )
    }
  }
  return lines.join("\n")
}

/** JSON without DOM references, safe to store or send to a server. */
export function auditToJSON(report: AuditReport): string {
  return JSON.stringify({ ...report, issues: report.issues.map(({ element: _e, ...rest }) => rest) }, null, 2)
}
