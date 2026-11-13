// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/a11y — web accessibility for any page, in the browser.
//
//   import { createA11y } from "@yuktishaalaa/a11y"
//   const a11y = createA11y({ level: "AA" })
//   const report = a11y.run()          // fixed / check / unknown
//   a11y.setPrefs({ textSize: 130 })   // visitor's choices
//   a11y.destroy()                     // puts the page back as it was
//
// Or with no code: <body data-yuktai-a11y="auto" data-yuktai-level="AA"> and
// the a11y.global.js script.
// ─────────────────────────────────────────────────────────────────────────────

import { auditAria, undoAria } from "./aria"
import { DEFAULT_SETTINGS, readAttributes, type A11ySettings } from "./attributes"
import { checkElementContrast, nearestPassingColor, toHex } from "./contrast"
import { findAll } from "./finder"
import { annotateLanguages, isSkipped, pageLanguage, undoLanguages } from "./language"
import { applyPrefs, clearPrefs, DEFAULT_PREFS, type Prefs } from "./prefs"
import { describe, WCAG, type Finding, type Report } from "./report"

export * from "./contrast"
export * from "./language"
export * from "./speak"
export * from "./prefs"
export * from "./attributes"
export { accessibleName, auditAria, undoAria } from "./aria"
export { findAll, type FoundTree } from "./finder"
export { addSpeakButtons, type SpeakButtonsOptions } from "./speakButtons"
export { message, describe, toJSON, MESSAGES, WCAG, type Finding, type Report, type RuleId, type FindingStatus } from "./report"

export const VERSION = "6.0.0"

export interface A11yOptions extends Partial<A11ySettings> {
  /** Document to work on. Default: the current document. */
  document?: Document
  /** Read data-yuktai-* attributes from <body>/<html> (they win over options). Default true. */
  attributes?: boolean
  /** Re-run on content added later (React, Next.js, infinite lists). Default true. */
  observe?: boolean
  /** Called after each run. */
  onReport?: (report: Report) => void
}

export interface A11y {
  readonly settings: A11ySettings
  /** Checks the page and applies the safe fixes allowed by `mode`. */
  run(): Report
  /** The last report. */
  readonly report: Report | null
  setPrefs(p: Partial<Prefs>): Prefs
  readonly prefs: Prefs
  /** Removes every change YuktAI made (lang, roles, colours, preferences). */
  undo(): void
  /** undo() and stop watching the page. */
  destroy(): void
}

const TEXT_TAGS = "p,h1,h2,h3,h4,h5,h6,li,td,th,dt,dd,a,button,label,span,small,strong,em,b,figcaption,caption,blockquote,summary,legend"

function hasOwnText(el: Element): boolean {
  for (const n of Array.from(el.childNodes)) if (n.nodeType === 3 && (n.textContent ?? "").trim()) return true
  return false
}

export function createA11y(options: A11yOptions = {}): A11y {
  const doc = options.document ?? document
  const settings: A11ySettings = options.attributes === false ? { ...DEFAULT_SETTINGS, ...stripUndefined(options) } : readAttributes(doc, stripUndefined(options))
  let prefs: Prefs = { ...DEFAULT_PREFS, level: settings.level }
  let last: Report | null = null
  let observer: MutationObserver | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let running = false

  const run = (): Report => {
    running = true
    const report: Report = { level: settings.level, mode: settings.mode, fixed: [], check: [], unknown: [], scanned: 0, at: new Date().toISOString() }
    try {
      if (settings.mode === "off") return (last = report)
      const fix = settings.mode === "auto"
      const tree = findAll(doc)
      report.scanned = tree.elements.length
      const add = (f: Finding) => report[f.status].push(f)

      // Language (3.1.1, 3.1.2)
      if (settings.lang === "auto") {
        const page = pageLanguage(doc)
        if (page.mismatch && page.detected) add({ rule: "page-lang-mismatch", status: "check", wcag: WCAG["page-lang-mismatch"], where: "html", data: { declared: page.declared, detected: page.detected.lang }, el: doc.documentElement })
        for (const c of annotateLanguages(doc, { apply: fix })) {
          const rule = c.scope === "page" ? "page-lang-missing" : "part-lang-missing"
          add({ rule, status: fix ? "fixed" : "check", wcag: WCAG[rule], where: c.scope === "page" ? "html" : describe(c.el), data: { lang: c.lang }, el: c.el })
        }
      }

      // Names, roles, structure
      for (const f of auditAria(doc, tree.elements, { fix })) add(f)

      // Contrast (1.4.3 / 1.4.6): only elements that hold text themselves.
      if (settings.level !== "off") {
        for (const el of tree.elements) {
          if (!el.matches(TEXT_TAGS) || !hasOwnText(el) || isSkipped(el) || el.closest("[data-yuktai-ui],[data-yuktai-a11y='off'],[hidden],[aria-hidden='true']")) continue
          const r = checkElementContrast(el, settings.level)
          if (r.status === "pass") continue
          if (r.status === "unknown") {
            add({ rule: "contrast-unknown", status: "unknown", wcag: WCAG["contrast-unknown"], where: describe(el), data: { reason: r.reason ?? "" }, el })
            continue
          }
          if (fix && settings.contrast === "fix" && r.fg && r.bg && r.required) {
            const c = nearestPassingColor(r.fg, r.bg, r.required)
            const h = el as HTMLElement
            if (!h.hasAttribute("data-yuktai-color")) h.setAttribute("data-yuktai-color", h.style.getPropertyValue("color") || "-")
            h.style.setProperty("color", toHex(c), "important")
            add({ rule: "contrast", status: "fixed", wcag: settings.level === "AAA" ? "1.4.6" : "1.4.3", where: describe(el), data: { ratio: r.ratio ?? 0, required: r.required, to: toHex(c) }, el })
          } else {
            add({ rule: "contrast", status: "check", wcag: settings.level === "AAA" ? "1.4.6" : "1.4.3", where: describe(el), data: { ratio: r.ratio ?? 0, required: r.required ?? 0 }, el })
          }
        }
      }

      // What we could not look into: never a pass.
      for (const el of tree.closed) add({ rule: "closed-shadow-root", status: "unknown", wcag: "", where: describe(el), el })
      for (const el of tree.crossOrigin) add({ rule: "iframe-cross-origin", status: "unknown", wcag: "", where: describe(el), data: { src: el.getAttribute("src") ?? "" }, el })
    } finally {
      // Our own changes fire mutations; ignore the ones from this run.
      observer?.takeRecords()
      running = false
    }
    last = report
    options.onReport?.(report)
    return report
  }

  const undo = () => {
    undoLanguages(doc)
    undoAria(doc)
    doc.querySelectorAll("[data-yuktai-color]").forEach((el) => {
      const h = el as HTMLElement
      const prev = h.getAttribute("data-yuktai-color")
      h.style.removeProperty("color")
      if (prev && prev !== "-") h.style.setProperty("color", prev)
      h.removeAttribute("data-yuktai-color")
    })
    clearPrefs(doc)
    last = null
  }

  if (options.observe !== false && typeof MutationObserver !== "undefined" && settings.mode !== "off") {
    observer = new MutationObserver((records) => {
      if (running) return
      if (!records.some((r) => r.type === "childList" && r.addedNodes.length)) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(run, 400)
    })
    // Started after the first run by the caller of run(); watching body subtree.
    queueMicrotask(() => doc.body && observer?.observe(doc.body, { childList: true, subtree: true }))
  }

  return {
    settings,
    run,
    get report() {
      return last
    },
    setPrefs(p) {
      prefs = { ...prefs, ...p }
      applyPrefs(doc, prefs)
      return prefs
    },
    get prefs() {
      return prefs
    },
    undo,
    destroy() {
      observer?.disconnect()
      observer = null
      if (timer) clearTimeout(timer)
      undo()
    },
  }
}

function stripUndefined<T extends object>(o: T): Partial<A11ySettings> {
  const out: Record<string, unknown> = {}
  for (const k of ["mode", "level", "contrast", "lang", "speak"] as const) {
    const v = (o as Record<string, unknown>)[k]
    if (v !== undefined) out[k] = v
  }
  return out as Partial<A11ySettings>
}
