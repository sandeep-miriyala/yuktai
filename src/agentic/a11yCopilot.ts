// ─────────────────────────────────────────────────────────────────────────────
// Idea 1 — AI Accessibility Copilot
// Watches the page live, explains each WCAG issue in plain English and can
// apply safe fixes in the browser — every fix can be undone.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import { isBrowser, resolveRoot, type AuditRoot, isDocument, YUKTAI_IGNORE } from "./dom"
import { runQaAudit, type AuditIssue, type AuditOptions, type AuditReport } from "./qaAudit"

export interface CopilotFixResult {
  issueId: string
  applied: boolean
  message: string
}

export interface CopilotState {
  report: AuditReport | null
  watching: boolean
  appliedFixes: number
}

export interface A11yCopilotOptions extends AuditOptions {
  /** Called after every scan (initial, manual or caused by DOM changes). */
  onUpdate?: (state: CopilotState) => void
  /** Wait this long after DOM changes before rescanning (default 600ms). */
  debounceMs?: number
  /** Apply every safe fix automatically after each scan (default false). */
  autoApply?: boolean
  /** Language used when the page has no lang attribute (default: browser language). */
  defaultLang?: string
}

interface UndoEntry {
  element: Element
  attribute: string
  previous: string | null
  listener?: (e: Event) => void
}

export interface A11yCopilot {
  start(): void
  stop(): void
  scan(): AuditReport
  explain(issueId: string): string
  applyFix(issueId: string): CopilotFixResult
  applyAllFixes(): CopilotFixResult[]
  undoAll(): number
  getState(): CopilotState
}

export function createA11yCopilot(options: A11yCopilotOptions = {}): A11yCopilot {
  let report: AuditReport | null = null
  let observer: MutationObserver | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let applying = false
  const undo: UndoEntry[] = []

  const state = (): CopilotState => ({ report, watching: observer !== null, appliedFixes: undo.length })
  const notify = () => options.onUpdate?.(state())

  const find = (issueId: string): AuditIssue | undefined => report?.issues.find((i) => i.id === issueId)

  const setAttr = (el: Element, attribute: string, value: string) => {
    undo.push({ element: el, attribute, previous: el.getAttribute(attribute) })
    el.setAttribute(attribute, value)
  }

  function fixIssue(issue: AuditIssue): CopilotFixResult {
    const el = issue.element
    const done = (applied: boolean, message: string): CopilotFixResult => ({ issueId: issue.id, applied, message })
    if (!issue.autoFixable || !el) return done(false, "This needs a human decision — see the suggested fix.")

    switch (issue.rule) {
      case "html-lang": {
        const lang = options.defaultLang || (isBrowser() ? navigator.language : "") || "en"
        setAttr(el, "lang", lang)
        return done(true, `Set lang="${lang}" on <html>.`)
      }
      case "image-alt": {
        const title = el.getAttribute("title")
        if (!title) break
        setAttr(el, "alt", title)
        return done(true, `Used the image title as alt text: "${title}".`)
      }
      case "form-label": {
        const hint = el.getAttribute("placeholder") || el.getAttribute("name")
        if (!hint) break
        const label = hint.replace(/[_-]+/g, " ").trim()
        setAttr(el, "aria-label", label)
        return done(true, `Added aria-label="${label}". A visible <label> is still better.`)
      }
      case "button-name":
      case "link-name": {
        const title = el.getAttribute("title")
        if (!title) break
        setAttr(el, "aria-label", title)
        return done(true, `Added aria-label="${title}".`)
      }
      case "positive-tabindex": {
        setAttr(el, "tabindex", "0")
        return done(true, "Changed tabindex to 0 so the natural order applies.")
      }
      case "keyboard-access": {
        setAttr(el, "tabindex", "0")
        if (!el.getAttribute("role")) setAttr(el, "role", "button")
        const listener = (e: Event) => {
          const key = (e as KeyboardEvent).key
          if (key === "Enter" || key === " ") {
            e.preventDefault()
            ;(el as HTMLElement).click()
          }
        }
        el.addEventListener("keydown", listener)
        undo.push({ element: el, attribute: "", previous: null, listener })
        return done(true, "Made it focusable and added Enter/Space support.")
      }
      default:
        break
    }
    return done(false, "No safe automatic fix for this one — see the suggested fix.")
  }

  function scan(): AuditReport {
    report = runQaAudit(options)
    if (options.autoApply) {
      applying = true
      const results = report.issues.filter((i) => i.autoFixable).map(fixIssue)
      applying = false
      if (results.some((r) => r.applied)) report = runQaAudit(options)
    }
    notify()
    return report
  }

  return {
    start() {
      if (!isBrowser() || observer) return
      const root = resolveRoot(options.root as AuditRoot | undefined)
      const target = isDocument(root) ? root.body : root
      if (!target) return
      observer = new MutationObserver((mutations) => {
        if (applying) return
        // Ignore changes yuktai makes to its own panels
        const relevant = mutations.some((m) => !(m.target as Element).closest?.(YUKTAI_IGNORE))
        if (!relevant) return
        if (timer) clearTimeout(timer)
        timer = setTimeout(scan, options.debounceMs ?? 600)
      })
      observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ["alt", "aria-label", "aria-invalid", "tabindex", "lang", "title"] })
      scan()
    },

    stop() {
      observer?.disconnect()
      observer = null
      if (timer) clearTimeout(timer)
      timer = null
      notify()
    },

    scan,

    explain(issueId: string): string {
      const issue = find(issueId)
      if (!issue) return `No issue "${issueId}" in the current report. Run a scan first.`
      return [
        `${issue.message}`,
        `Why it matters: ${issue.why}`,
        `How to fix: ${issue.fix}`,
        `Standard: WCAG ${issue.wcag} (${issue.severity}).`,
        issue.autoFixable ? "I can apply a safe fix for this in the browser." : "This one needs a change in your code.",
      ].join("\n")
    },

    applyFix(issueId: string): CopilotFixResult {
      const issue = find(issueId)
      if (!issue) return { issueId, applied: false, message: "Issue not found. Run a scan first." }
      applying = true
      const result = fixIssue(issue)
      applying = false
      if (result.applied) scan()
      return result
    },

    applyAllFixes(): CopilotFixResult[] {
      if (!report) scan()
      applying = true
      const results = (report?.issues ?? []).filter((i) => i.autoFixable).map(fixIssue)
      applying = false
      scan()
      return results
    },

    undoAll(): number {
      const count = undo.length
      applying = true
      while (undo.length) {
        const entry = undo.pop()!
        if (entry.listener) entry.element.removeEventListener("keydown", entry.listener)
        else if (entry.previous === null) entry.element.removeAttribute(entry.attribute)
        else entry.element.setAttribute(entry.attribute, entry.previous)
      }
      applying = false
      scan()
      return count
    },

    getState: state,
  }
}
