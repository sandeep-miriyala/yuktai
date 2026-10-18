// ─────────────────────────────────────────────────────────────────────────────
// Idea 6 — Context-Aware Agent for Forms
// Reads every form on the page, lists its fields and reviews the flow for
// accessibility and senior-friendliness.
// Original code for yuktai.
// ─────────────────────────────────────────────────────────────────────────────

import { accessibleName, cleanText, queryAll, resolveRoot, selectorFor, shorten, type AuditRoot } from "./dom"

export type FormFindingLevel = "problem" | "improvement"

export interface FormField {
  label: string
  type: string
  name: string
  required: boolean
  hasVisibleLabel: boolean
  selector: string
  element: Element
}

export interface FormFinding {
  level: FormFindingLevel
  message: string
  suggestion: string
  field?: string
  selector?: string
}

export interface FormReview {
  name: string
  selector: string
  fields: FormField[]
  findings: FormFinding[]
  /** 0–100, higher is easier to complete. */
  score: number
  summary: string
}

export interface FormReviewOptions {
  root?: AuditRoot
  /** Extra checks for older users: font size, field count, vague buttons (default true). */
  seniorFriendly?: boolean
  /** Forms with more fields than this get a "split into steps" suggestion (default 8). */
  maxFieldsPerStep?: number
}

const VAGUE_LABELS = /^(field|input|value|text|enter|details?|info|data|\*|:)$/i
const VAGUE_BUTTONS = /^(go|ok|submit|send|click here|>|→|next)$/i

/** Field names that should carry an autocomplete token (WCAG 1.3.5). */
const AUTOCOMPLETE_HINTS: Array<[RegExp, string, string?]> = [
  [/e-?mail/i, "email", "email"],
  [/phone|mobile|tel/i, "tel", "tel"],
  [/^(full)?name$|full.?name/i, "name"],
  [/first.?name|given/i, "given-name"],
  [/last.?name|surname|family/i, "family-name"],
  [/address|street/i, "street-address"],
  [/zip|postal|pin.?code|pincode/i, "postal-code"],
  [/city|town/i, "address-level2"],
  [/country/i, "country-name"],
  [/password/i, "current-password", "password"],
  [/dob|birth/i, "bday"],
]

function hasVisibleLabel(el: Element): boolean {
  const id = el.getAttribute("id")
  if (id && el.ownerDocument.querySelector(`label[for="${id.replace(/"/g, '\\"')}"]`)) return true
  return Boolean(el.closest("label"))
}

export function readFormFields(form: Element): FormField[] {
  return queryAll(form, "input,select,textarea")
    .filter((el) => !["hidden", "submit", "button", "reset", "image"].includes((el.getAttribute("type") ?? "text").toLowerCase()))
    .map((el) => ({
      label: accessibleName(el),
      type: el.tagName === "INPUT" ? (el.getAttribute("type") ?? "text").toLowerCase() : el.tagName.toLowerCase(),
      name: el.getAttribute("name") ?? el.getAttribute("id") ?? "",
      required: el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
      hasVisibleLabel: hasVisibleLabel(el),
      selector: selectorFor(el),
      element: el,
    }))
}

export function reviewForm(form: Element, options: FormReviewOptions = {}): FormReview {
  const senior = options.seniorFriendly !== false
  const maxFields = options.maxFieldsPerStep ?? 8
  const fields = readFormFields(form)
  const findings: FormFinding[] = []
  const add = (level: FormFindingLevel, message: string, suggestion: string, field?: FormField) =>
    findings.push({ level, message, suggestion, field: field?.label || field?.name, selector: field?.selector })

  for (const f of fields) {
    const el = f.element
    const display = f.label || f.name || f.type
    const placeholder = el.getAttribute("placeholder")
    if (!f.label && placeholder) {
      add("problem", `"${placeholder}" uses only a placeholder as its label.`, "Placeholders disappear when typing starts and aren't read by every screen reader. Add a visible label above the field.", f)
    } else if (!f.label) {
      add("problem", `A ${f.type} field${f.name ? ` ("${f.name}")` : ""} has no label.`, "Add a visible <label> that says exactly what to enter.", f)
    } else if (!f.hasVisibleLabel && placeholder && !el.getAttribute("aria-label")) {
      add("problem", `"${display}" uses only a placeholder as its label.`, "Placeholders disappear when typing starts. Add a visible label above the field.", f)
    } else if (VAGUE_LABELS.test(f.label)) {
      add("improvement", `The label "${f.label}" is unclear.`, "Say exactly what is needed, e.g. \"Mobile number (10 digits)\".", f)
    }

    if (f.required && f.label && !/\*|required|mandatory|తప్పనిసరి|आवश्यक/i.test(f.label)) {
      add("improvement", `"${display}" is required but the label doesn't say so.`, "Add \"(required)\" to the label so everyone knows before submitting.", f)
    }

    const key = `${f.name} ${f.label}`
    for (const [pattern, token, type] of AUTOCOMPLETE_HINTS) {
      if (!pattern.test(key)) continue
      if (!el.getAttribute("autocomplete")) {
        add("improvement", `"${display}" has no autocomplete hint.`, `Add autocomplete="${token}" so browsers can fill it in (WCAG 1.3.5).`, f)
      }
      if (type && f.type === "text") {
        add("improvement", `"${display}" uses type="text".`, `Use type="${type}" for the right mobile keyboard and validation.`, f)
      }
      break
    }

    if (el.getAttribute("aria-invalid") === "true" && !el.getAttribute("aria-describedby") && !el.getAttribute("aria-errormessage")) {
      add("problem", `"${display}" shows an error that isn't connected to the field.`, "Link the error text with aria-describedby and explain how to fix it.", f)
    }

    if (senior) {
      const size = parseFloat(window.getComputedStyle(el).fontSize) || 16
      if (size < 16) {
        add("improvement", `"${display}" text is ${size}px.`, "Use at least 16px in inputs; it is easier to read and stops mobile browsers from zooming.", f)
      }
    }
  }

  if (fields.length > maxFields) {
    add("improvement", `This form has ${fields.length} fields on one screen.`, `Split it into steps of about ${maxFields} fields with a progress indicator.`)
  }

  const submit = queryAll(form, "button,input[type='submit'],input[type='button']")
  if (submit.length === 0) {
    add("problem", "No submit button found.", "Add a clear <button type=\"submit\"> so the form can be completed with the keyboard.")
  } else if (senior) {
    const label = cleanText(accessibleName(submit[submit.length - 1]))
    if (VAGUE_BUTTONS.test(label)) {
      add("improvement", `The button says "${label}".`, "Name the result, e.g. \"Send message\" or \"Book appointment\".")
    }
  }

  if (!queryAll(form, "[role='alert'],[aria-live]", { includeHidden: true }).length && fields.some((f) => f.required)) {
    add("improvement", "No live region for error messages.", "Add an element with role=\"alert\" so errors are announced when the form is submitted.")
  }

  const problems = findings.filter((f) => f.level === "problem").length
  const improvements = findings.length - problems
  const score = Math.max(0, 100 - problems * 15 - improvements * 4)
  const name =
    form.getAttribute("aria-label") ||
    cleanText(form.querySelector("legend,h1,h2,h3")?.textContent) ||
    form.getAttribute("name") ||
    form.getAttribute("id") ||
    "Form"

  return {
    name: shorten(name, 50),
    selector: selectorFor(form),
    fields,
    findings,
    score,
    summary:
      findings.length === 0
        ? `"${shorten(name, 40)}" looks clear: ${fields.length} labelled field(s), nothing to fix.`
        : `"${shorten(name, 40)}" has ${fields.length} field(s): ${problems} problem(s) and ${improvements} suggestion(s). Score ${score}/100.`,
  }
}

/** Reviews every <form> (and every role="form") on the page. */
export function reviewForms(options: FormReviewOptions = {}): FormReview[] {
  const root = resolveRoot(options.root)
  if (!root) return []
  return queryAll(root, "form,[role='form']").map((form) => reviewForm(form, options))
}
