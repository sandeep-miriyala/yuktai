// yuktai vanilla — floating accessibility button + settings, and the optional
// "Page tools" button (AgenticPanel in a dialog). Same engine as the React
// <YuktAIWrapper>: wcagPlugin.execute() applies WCAG fixes, contrast, dark
// mode, motion, large targets, colour-blind filters, dyslexia font, font
// scaling, skip links, speak-on-focus, and remembers the choices.

import { DEFAULT_A11Y_SETTINGS, wcagPlugin } from "./core.js"
import { addStyles, announce, h, icon, iconEl, isBrowser, nextId, safeColor } from "./dom.js"
import { mountAgenticPanel } from "./panel.js"

const PREFS_KEY = "yuktai-a11y-prefs" // same key the engine reads
const FONT_STEPS = [0.8, 0.9, 1, 1.1, 1.2, 1.3]
const COLOR_MODES = [
  ["none", "None"],
  ["deuteranopia", "Deuteranopia (red-green)"],
  ["protanopia", "Protanopia (red-green)"],
  ["tritanopia", "Tritanopia (blue-yellow)"],
  ["achromatopsia", "Achromatopsia (no colour)"],
]
const TOGGLES = [
  ["highContrast", "High contrast", "Stronger text and borders", "contrast"],
  ["darkMode", "Dark mode", "Light text on a dark page", "moon"],
  ["reduceMotion", "Reduce motion", "Stop animations and transitions", "motion"],
  ["largeTargets", "Large targets", "Buttons and links at least 44×44", "target"],
  ["dyslexiaFont", "Dyslexia-friendly font", "Easier letters and wider spacing", "reading"],
  ["speechEnabled", "Speak on focus", "Read out each control you Tab to", "speaker"],
  ["autoFix", "Auto-fix page", "Add missing ARIA, labels and alt text; watch new content", "wand"],
  ["showSkipLinks", "Skip links", "“Skip to main content” on Tab", "skip"],
]

function readPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function writePrefs(config) {
  try {
    const keep = {}
    ;["highContrast", "darkMode", "reduceMotion", "largeTargets", "speechEnabled", "colorBlindMode", "dyslexiaFont", "fontSizeMultiplier"].forEach((k) => (keep[k] = config[k]))
    localStorage.setItem(PREFS_KEY, JSON.stringify(keep))
  } catch {
    /* private mode: settings still apply for this page */
  }
}

export function createWidget(userConfig = {}) {
  const cfg = { position: "left", title: "Accessibility", showPageTools: false, ...userConfig }
  const side = cfg.position === "right" ? "right" : "left"
  const primary = safeColor(cfg.primaryColor, "#0f766e")
  const base = {
    enabled: true,
    autoFix: true,
    showSkipLinks: true,
    showPreferencePanel: false,
    ...DEFAULT_A11Y_SETTINGS,
    ...(cfg.config || {}),
  }
  let settings = { ...base, ...readPrefs() }
  let fabs, fab, toolsFab, dialog, toolsDialog, panelApi, lastFocus
  let lastMessage = ""

  async function apply(next, quiet) {
    settings = { ...settings, ...next, enabled: true }
    writePrefs(settings) // the engine reloads saved prefs, so save first
    try {
      lastMessage = await wcagPlugin.execute({ ...settings })
      if (!settings.autoFix) wcagPlugin.stopObserver()
    } catch (error) {
      console.error("[yuktai] accessibility engine failed", error)
      lastMessage = "Some settings could not be applied. See the browser console."
    }
    syncDialog()
    if (!quiet) announce("Accessibility settings updated")
    return lastMessage
  }

  async function reset() {
    try {
      localStorage.removeItem(PREFS_KEY)
    } catch {
      /* ignore */
    }
    settings = { ...base }
    await apply(settings, true)
    announce("Accessibility settings reset")
    return settings
  }

  /* ── settings dialog ── */
  function buildDialog() {
    const titleId = nextId("yv-a11y-title")
    const fontId = nextId("yv-font")
    const cbId = nextId("yv-cb")
    const d = h("section", { class: "yv-dialog", role: "dialog", "aria-modal": "false", "aria-labelledby": titleId, "data-yuktai-panel": "" })
    const options = TOGGLES.map(([key, label, desc, ic]) => {
      const id = nextId("yv-opt")
      const input = h("input", { id, type: "checkbox", role: "switch", "data-setting": key, "aria-describedby": `${id}-d` })
      return h("div", { class: "yv-option" }, h("span", { class: "yv-option-icon" }, iconEl(ic, 18)), h("span", { class: "yv-option-copy" }, h("label", { for: id }, h("b", null, label)), h("small", { id: `${id}-d` }, desc)), h("span", { class: "yv-switch" }, input, h("span", { "aria-hidden": "true" })))
    })
    const steps = h(
      "div",
      { class: "yv-steps-bar", role: "group", "aria-labelledby": fontId },
      ...FONT_STEPS.map((n) => h("button", { type: "button", class: "yv-step", "data-font": n, "aria-label": `${Math.round(n * 100)} percent`, "aria-pressed": "false" }))
    )
    const cb = h("select", { id: cbId, class: "yv-input", "data-colorblind": "" }, ...COLOR_MODES.map(([v, l]) => h("option", { value: v }, l)))
    d.append(
      h(
        "header",
        { class: "yv-dialog-head" },
        h("div", null, h("div", { class: "yv-muted", style: "font-weight:800;font-size:.75em;letter-spacing:.05em" }, "YUKTAI"), h("h2", { id: titleId }, cfg.title), h("p", { class: "yv-muted", style: "margin:2px 0 0" }, "Saved on this device. Works on every page.")),
        h("button", { type: "button", class: "yv-btn yv-icon", "data-close": "", "aria-label": "Close accessibility settings", html: icon("close") })
      ),
      h(
        "div",
        { class: "yv-dialog-body" },
        ...options,
        h(
          "div",
          { style: "padding:12px 0;border-bottom:1px solid var(--yv-border)" },
          h("div", { style: "display:flex;justify-content:space-between" }, h("b", { id: fontId }, "Text size"), h("strong", { "data-font-value": "" })),
          h("div", { class: "yv-row", style: "flex-wrap:nowrap;margin-top:6px" }, h("button", { type: "button", class: "yv-btn yv-icon", "data-font-step": "-1", "aria-label": "Smaller text", html: icon("minus", 16) }), steps, h("button", { type: "button", class: "yv-btn yv-icon", "data-font-step": "1", "aria-label": "Bigger text", html: icon("plus", 16) }))
        ),
        h("div", { style: "padding:12px 0" }, h("label", { for: cbId }, h("b", null, "Colour-blind filter")), cb),
        h("div", { class: "yv-row" }, h("button", { type: "button", class: "yv-btn", "data-reset": "" }, iconEl("reset", 16), "Reset all"), h("button", { type: "button", class: "yv-btn yv-primary", "data-close": "" }, iconEl("check", 16), "Done")),
        h("p", { class: "yv-status", role: "status", "aria-live": "polite", "data-status": "" })
      )
    )
    d.addEventListener("change", (e) => {
      const el = e.target
      if (el.matches("[data-setting]")) apply({ [el.getAttribute("data-setting")]: el.checked })
      else if (el.matches("[data-colorblind]")) apply({ colorBlindMode: el.value })
    })
    d.addEventListener("click", (e) => {
      const el = e.target.closest("button")
      if (!el) return
      if (el.hasAttribute("data-close")) return closeSettings()
      if (el.hasAttribute("data-reset")) return reset()
      if (el.hasAttribute("data-font")) return setFont(Number(el.getAttribute("data-font")))
      if (el.hasAttribute("data-font-step")) {
        const i = FONT_STEPS.indexOf(Number(settings.fontSizeMultiplier || 1))
        return setFont(FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, (i < 0 ? 2 : i) + Number(el.getAttribute("data-font-step"))))])
      }
    })
    d.addEventListener("keydown", (e) => trapAndEscape(e, d, closeSettings))
    return d
  }

  function syncDialog() {
    if (!dialog) return
    dialog.querySelectorAll("[data-setting]").forEach((el) => (el.checked = !!settings[el.getAttribute("data-setting")] && settings[el.getAttribute("data-setting")] !== false))
    const showSkip = dialog.querySelector('[data-setting="showSkipLinks"]')
    if (showSkip) showSkip.checked = settings.showSkipLinks !== false
    const fontValue = Number(settings.fontSizeMultiplier || 1)
    dialog.querySelector("[data-font-value]").textContent = `${Math.round(fontValue * 100)}%`
    dialog.querySelectorAll("[data-font]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(Number(b.getAttribute("data-font")) - fontValue) < 0.001)))
    dialog.querySelector("[data-colorblind]").value = settings.colorBlindMode || "none"
    const fixed = /(\d+) fixes applied/.exec(lastMessage)
    dialog.querySelector("[data-status]").textContent = fixed
      ? `${fixed[1]} automatic accessibility fix(es) applied on this page.`
      : lastMessage
  }

  function setFont(n) {
    if (!FONT_STEPS.some((s) => Math.abs(s - n) < 0.001)) return
    apply({ fontSizeMultiplier: n }, true)
    announce(`Text size ${Math.round(n * 100)} percent`)
  }

  function trapAndEscape(e, box, close) {
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      close()
      return
    }
    if (e.key !== "Tab") return
    const items = Array.from(box.querySelectorAll("button,input,select,textarea,[tabindex]:not([tabindex='-1'])")).filter((x) => !x.disabled && x.offsetParent !== null)
    if (!items.length) return
    if (e.shiftKey && document.activeElement === items[0]) {
      e.preventDefault()
      items[items.length - 1].focus()
    } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
      e.preventDefault()
      items[0].focus()
    }
  }

  function openSettings() {
    if (!fab) init()
    if (dialog) return
    closeTools()
    lastFocus = document.activeElement
    dialog = buildDialog()
    layer().appendChild(dialog)
    fab.setAttribute("aria-expanded", "true")
    syncDialog()
    dialog.querySelector("[data-close]").focus()
    document.addEventListener("pointerdown", outside, true)
  }
  function closeSettings() {
    if (!dialog) return
    dialog.remove()
    dialog = null
    fab.setAttribute("aria-expanded", "false")
    document.removeEventListener("pointerdown", outside, true)
    ;(lastFocus && document.contains(lastFocus) ? lastFocus : fab).focus()
  }
  function outside(e) {
    if (dialog && !dialog.contains(e.target) && !fabs.contains(e.target)) closeSettings()
    if (toolsDialog && !toolsDialog.contains(e.target) && !fabs.contains(e.target)) closeTools()
  }

  /* ── page tools dialog (AgenticPanel) ── */
  function openTools(tab) {
    if (!fab) init()
    if (toolsDialog) {
      if (tab && panelApi) panelApi.select(tab)
      return
    }
    closeSettings()
    lastFocus = document.activeElement
    const titleId = nextId("yv-tools-title")
    toolsDialog = h("section", { class: "yv-dialog yv-wide", role: "dialog", "aria-modal": "false", "aria-labelledby": titleId, "data-yuktai-panel": "" })
    const body = h("div", { class: "yv-dialog-body" })
    toolsDialog.append(
      h("header", { class: "yv-dialog-head" }, h("h2", { id: titleId }, cfg.toolsTitle || "Page tools"), h("button", { type: "button", class: "yv-btn yv-icon", "aria-label": "Close page tools", html: icon("close"), onclick: () => closeTools() })),
      body
    )
    layer().appendChild(toolsDialog)
    panelApi = mountAgenticPanel(body, {
      defaultTab: tab || cfg.defaultTab || "qa",
      voiceLang: cfg.voiceLang,
      generate: cfg.generate,
      summarize: cfg.summarize,
      defaultLang: cfg.defaultLang,
      getSettings: () => ({ ...settings }),
      applySettings: (config) => apply(config, true),
    })
    toolsFab && toolsFab.setAttribute("aria-expanded", "true")
    toolsDialog.addEventListener("keydown", (e) => trapAndEscape(e, toolsDialog, closeTools))
    toolsDialog.querySelector("[role=tab][aria-selected=true]").focus()
    document.addEventListener("pointerdown", outside, true)
  }
  function closeTools() {
    if (!toolsDialog) return
    panelApi && panelApi.destroy()
    panelApi = null
    toolsDialog.remove()
    toolsDialog = null
    toolsFab && toolsFab.setAttribute("aria-expanded", "false")
    document.removeEventListener("pointerdown", outside, true)
    ;(lastFocus && document.contains(lastFocus) ? lastFocus : toolsFab || fab).focus()
  }

  // Floating UI lives directly under <html>: colour-blind mode puts a CSS
  // filter on <body>, and a filtered ancestor would break position:fixed.
  const layer = () => document.documentElement || document.body

  /* ── init ── */
  function init() {
    if (!isBrowser() || fab || !document.body) return
    addStyles(primary, side)
    fabs = h("div", { class: "yv-fabs", "data-yuktai-fabs": "" }) // not data-yuktai-panel: the engine turns those into bottom sheets on phones
    fab = h("button", { type: "button", class: "yv-fab", "aria-label": "Accessibility settings", title: "Accessibility settings", "aria-haspopup": "dialog", "aria-expanded": "false", html: icon("accessibility", 26) })
    fab.addEventListener("click", () => (dialog ? closeSettings() : openSettings()))
    fabs.append(fab)
    if (cfg.showPageTools) {
      toolsFab = h("button", { type: "button", class: "yv-fab yv-fab-alt", "aria-label": "Page tools: QA, forms, design, ask, voice", title: "Page tools", "aria-haspopup": "dialog", "aria-expanded": "false", html: icon("tools", 24) })
      toolsFab.addEventListener("click", () => (toolsDialog ? closeTools() : openTools()))
      fabs.prepend(toolsFab)
    }
    // Keep the buttons outside <body> filters (colour-blind mode filters <body>,
    // which would otherwise move position:fixed elements).
    layer().appendChild(fabs)
    if (cfg.applyOnLoad !== false) apply({}, true)
  }

  return {
    init,
    open: openSettings,
    close: closeSettings,
    openTools,
    closeTools,
    apply: (next) => apply(next || {}),
    reset,
    getSettings: () => ({ ...settings }),
    destroy() {
      closeSettings()
      closeTools()
      fabs && fabs.remove()
      fab = toolsFab = fabs = null
    },
  }
}
