// yuktai vanilla — AgenticPanel without React.
// Six page-tool tabs: Copilot, QA report, Forms, Design, Ask page, Voice.
// The panel marks itself with data-yuktai-panel, so the agents never audit
// the panel's own UI.

import {
  askAboutPage,
  auditToJSON,
  auditToMarkdown,
  createA11yCopilot,
  createContextIndex,
  createVoiceA11yController,
  reviewDesign,
  reviewForms,
  runQaAudit,
} from "./core.js"
import { announce, copyText, downloadText, flashElements, h, iconEl, nextId } from "./dom.js"

const TABS = [
  { id: "copilot", label: "Copilot", icon: "wand" },
  { id: "qa", label: "QA report", icon: "check" },
  { id: "forms", label: "Forms", icon: "form" },
  { id: "design", label: "Design", icon: "layout" },
  { id: "ask", label: "Ask page", icon: "chat" },
  { id: "voice", label: "Voice", icon: "mic" },
]

const VOICE_LANGS = [
  ["en-IN", "English (India)"],
  ["en-US", "English (US)"],
  ["te-IN", "తెలుగు (Telugu)"],
  ["hi-IN", "हिन्दी (Hindi)"],
  ["ta-IN", "தமிழ் (Tamil)"],
  ["kn-IN", "ಕನ್ನಡ (Kannada)"],
  ["ml-IN", "മലയാളം (Malayalam)"],
  ["mr-IN", "मराठी (Marathi)"],
  ["bn-IN", "বাংলা (Bengali)"],
  ["gu-IN", "ગુજરાતી (Gujarati)"],
]

const sevBadge = (sev) => h("span", { class: `yv-badge yv-sev-${sev}` }, sev)

function scoreBlock(score, text) {
  return h(
    "div",
    null,
    h("div", { class: "yv-score" }, h("strong", null, String(score)), h("span", { class: "yv-muted" }, "/ 100")),
    h("div", { class: "yv-meter", role: "img", "aria-label": `Score ${score} out of 100` }, h("span", { style: `width:${Math.max(0, Math.min(100, score))}%` })),
    h("p", { style: "margin:0 0 6px" }, text)
  )
}

function showButton(selectors) {
  const list = (selectors || []).filter(Boolean)
  if (!list.length) return null
  return h("button", { type: "button", class: "yv-btn yv-small", onclick: () => announce(`${flashElements(list)} element(s) outlined on the page`) }, iconEl("eye", 14), "Show on page")
}

/**
 * Mount the six-tab page tools panel.
 * @param container element / selector, or null to only build it (the widget uses this)
 * @param options { defaultTab, voiceLang, generate(question, context), summarize(pageText),
 *                  seniorFriendly, minFontSize, applySettings(config), onVoiceCommand }
 */
export function mountAgenticPanel(container, options = {}) {
  const target = container == null ? null : typeof container === "string" ? document.querySelector(container) : container
  if (container != null && !target) throw new Error("mountAgenticPanel: container not found")

  const tablistId = nextId("yv-tabs")
  const root = h("section", { class: `yv-box yv-agentic-panel${options.theme ? " yv-theme-" + options.theme : ""}`, "data-yuktai-panel": "", "aria-label": options.title || "Page tools" })
  const tablist = h("div", { class: "yv-tabs", role: "tablist", "aria-label": "Page tools", id: tablistId })
  const panels = {}
  TABS.forEach((tab) => {
    const tabId = `${tablistId}-${tab.id}`
    const panelId = `${tabId}-panel`
    tablist.append(h("button", { type: "button", class: "yv-tab", role: "tab", id: tabId, "aria-controls": panelId, "aria-selected": "false", tabindex: -1, "data-tab": tab.id }, iconEl(tab.icon, 15), " ", tab.label))
    panels[tab.id] = h("div", { role: "tabpanel", id: panelId, "aria-labelledby": tabId, hidden: true, tabindex: 0 })
  })
  root.append(tablist, ...Object.values(panels))
  if (target) target.appendChild(root)

  const built = {}
  let current = null
  function select(id, focus) {
    if (!panels[id]) id = "qa"
    current = id
    tablist.querySelectorAll("[role=tab]").forEach((tab) => {
      const on = tab.getAttribute("data-tab") === id
      tab.setAttribute("aria-selected", String(on))
      tab.tabIndex = on ? 0 : -1
      if (on && focus) tab.focus()
    })
    Object.entries(panels).forEach(([key, panel]) => (panel.hidden = key !== id))
    if (!built[id]) {
      built[id] = true
      BUILDERS[id](panels[id])
    }
  }
  tablist.addEventListener("click", (e) => {
    const tab = e.target.closest("[role=tab]")
    if (tab) select(tab.getAttribute("data-tab"), true)
  })
  tablist.addEventListener("keydown", (e) => {
    const ids = TABS.map((t) => t.id)
    const focused = e.target.closest && e.target.closest("[role=tab]")
    const i = ids.indexOf(focused ? focused.getAttribute("data-tab") : current)
    let next = null
    if (e.key === "ArrowRight") next = ids[(i + 1) % ids.length]
    else if (e.key === "ArrowLeft") next = ids[(i - 1 + ids.length) % ids.length]
    else if (e.key === "Home") next = ids[0]
    else if (e.key === "End") next = ids[ids.length - 1]
    if (next) {
      e.preventDefault()
      e.stopPropagation()
      select(next, true)
    }
  })

  /* ── 1. Copilot ── */
  let copilot = null
  function buildCopilot(panel) {
    const list = h("ul", { class: "yv-list" })
    const statusLine = h("p", { class: "yv-status", role: "status", "aria-live": "polite" })
    const explainBox = h("div", { class: "yv-answer", "aria-live": "polite" })
    const watchBtn = h("button", { type: "button", class: "yv-btn", "aria-pressed": "false" }, iconEl("eye", 16), "Watch page")
    copilot = createA11yCopilot({
      defaultLang: options.defaultLang,
      debounceMs: 600,
      onUpdate: (state) => paint(state),
    })
    function paint(state) {
      const report = state.report
      watchBtn.setAttribute("aria-pressed", String(state.watching))
      statusLine.textContent = report ? `${report.summary} Fixes applied: ${state.appliedFixes}.${state.watching ? " Watching for page changes." : ""}` : "Scan the page to see issues."
      list.replaceChildren(
        ...(report ? report.issues.slice(0, 40) : []).map((issue) =>
          h(
            "li",
            { class: "yv-item" },
            h("p", null, sevBadge(issue.severity), " ", h("b", null, issue.message)),
            h("p", { class: "yv-muted" }, `WCAG ${issue.wcag} · `, h("code", null, issue.selector)),
            h(
              "div",
              { class: "yv-row" },
              h("button", { type: "button", class: "yv-btn yv-small", onclick: () => (explainBox.textContent = copilot.explain(issue.id)) }, iconEl("info", 14), "Explain"),
              issue.autoFixable
                ? h("button", { type: "button", class: "yv-btn yv-small", onclick: () => announce(copilot.applyFix(issue.id).message) }, iconEl("wand", 14), "Fix")
                : null,
              showButton([issue.selector])
            )
          )
        )
      )
    }
    panel.append(
      h("p", { class: "yv-muted" }, "Finds accessibility problems, explains them in plain English, and applies safe fixes you can undo."),
      h(
        "div",
        { class: "yv-row" },
        h("button", { type: "button", class: "yv-btn yv-primary", onclick: () => copilot.scan() }, iconEl("search", 16), "Scan page"),
        watchBtn,
        h("button", { type: "button", class: "yv-btn", onclick: () => announce(`${copilot.applyAllFixes().filter((r) => r.applied).length} fix(es) applied`) }, iconEl("wand", 16), "Apply all safe fixes"),
        h("button", { type: "button", class: "yv-btn", onclick: () => announce(`${copilot.undoAll()} change(s) undone`) }, iconEl("undo", 16), "Undo all")
      ),
      statusLine,
      explainBox,
      list
    )
    watchBtn.addEventListener("click", () => (copilot.getState().watching ? copilot.stop() : copilot.start()))
    paint(copilot.getState())
  }

  /* ── 2. QA report ── */
  function buildQa(panel) {
    const out = h("div", { "aria-live": "polite" })
    let report = null
    const run = () => {
      report = runQaAudit(options.auditOptions || {})
      const issues = report.issues
      out.replaceChildren(
        scoreBlock(report.score, report.summary),
        h(
          "div",
          { class: "yv-row" },
          h("button", { type: "button", class: "yv-btn yv-small", onclick: async () => announce((await copyText(auditToMarkdown(report))) ? "Markdown report copied" : "Copy failed") }, iconEl("copy", 14), "Copy Markdown"),
          h("button", { type: "button", class: "yv-btn yv-small", onclick: () => downloadText("yuktai-qa-report.md", auditToMarkdown(report), "text/markdown;charset=utf-8") }, iconEl("download", 14), "Markdown"),
          h("button", { type: "button", class: "yv-btn yv-small", onclick: () => downloadText("yuktai-qa-report.json", auditToJSON(report), "application/json") }, iconEl("download", 14), "JSON")
        ),
        h(
          "details",
          { class: "yv-history" },
          h("summary", null, `Checks (${report.checks.filter((c) => c.passed).length}/${report.checks.length} passed)`),
          h("ul", { class: "yv-steps" }, ...report.checks.map((c) => h("li", null, h("span", { class: c.passed ? "yv-ok" : "yv-fail" }, c.passed ? "✓ " : "✗ "), c.title || c.rule, c.issueCount ? ` — ${c.issueCount} issue(s)` : "")))
        ),
        h(
          "ul",
          { class: "yv-list" },
          ...issues.slice(0, 60).map((issue) =>
            h(
              "li",
              { class: "yv-item" },
              h("p", null, sevBadge(issue.severity), " ", h("b", null, issue.message)),
              h("p", null, h("b", null, "Fix: "), issue.fix),
              h("p", { class: "yv-muted" }, `${issue.rule} · WCAG ${issue.wcag} · `, h("code", null, issue.selector)),
              showButton([issue.selector])
            )
          )
        ),
        issues.length > 60 ? h("p", { class: "yv-muted" }, `${issues.length - 60} more issue(s) in the downloaded report.`) : null
      )
      announce(report.summary)
    }
    panel.append(
      h("p", { class: "yv-muted" }, "15 WCAG checks on this page with a 0–100 score. Heuristic: still test with a keyboard and a screen reader."),
      h("button", { type: "button", class: "yv-btn yv-primary", onclick: run }, iconEl("check", 16), "Run QA audit"),
      out
    )
  }

  /* ── 3. Forms ── */
  function buildForms(panel) {
    const senior = h("input", { type: "checkbox", id: nextId("yv-senior"), checked: options.seniorFriendly !== false })
    const out = h("div", { "aria-live": "polite" })
    const run = () => {
      const reviews = reviewForms({ seniorFriendly: senior.checked, maxFieldsPerStep: options.maxFieldsPerStep || 8 })
      if (!reviews.length) {
        out.replaceChildren(h("p", { class: "yv-answer" }, "There are no forms on this page."))
        return announce("No forms found")
      }
      out.replaceChildren(
        ...reviews.map((r) =>
          h(
            "div",
            { class: "yv-item", style: "margin-top:10px" },
            scoreBlock(r.score, r.summary),
            h(
              "ul",
              { class: "yv-steps" },
              ...r.findings.map((f) => h("li", null, h("span", { class: `yv-badge yv-sev-${f.level === "problem" ? "serious" : "minor"}` }, f.level), " ", f.message, h("br"), h("span", { class: "yv-muted" }, f.suggestion)))
            ),
            showButton(r.findings.map((f) => f.selector))
          )
        )
      )
      announce(`${reviews.length} form(s) reviewed`)
    }
    panel.append(
      h("p", { class: "yv-muted" }, "Checks labels, autocomplete, error messages and senior-friendly tips."),
      h("div", { class: "yv-row" }, h("label", { class: "yv-check", for: senior.id }, senior), h("label", { for: senior.id }, "Senior-friendly checks"), h("button", { type: "button", class: "yv-btn yv-primary", onclick: run }, iconEl("form", 16), "Review forms")),
      out
    )
  }

  /* ── 4. Design ── */
  function buildDesign(panel) {
    const sizeId = nextId("yv-min")
    const size = h("input", { id: sizeId, class: "yv-input", type: "number", min: 10, max: 24, value: options.minFontSize || 16, style: "width:90px" })
    const out = h("div", { "aria-live": "polite" })
    const run = () => {
      const d = reviewDesign({ minFontSize: Number(size.value) || 16, maxLineLength: options.maxLineLength || 90 })
      out.replaceChildren(
        scoreBlock(d.score, d.summary),
        h("div", { class: "yv-cats" }, ...Object.entries(d.categories).map(([name, c]) => h("div", { class: "yv-cat" }, h("span", { class: "yv-muted" }, name), h("strong", null, String(c.score)), h("span", { class: "yv-muted" }, `${c.findings} finding(s)`)))),
        h(
          "ul",
          { class: "yv-list" },
          ...d.findings.slice(0, 40).map((f) => h("li", { class: "yv-item" }, h("p", null, sevBadge(f.severity), " ", h("b", null, f.category), ": ", f.message), h("p", { class: "yv-muted" }, f.suggestion), showButton([f.selector])))
        )
      )
      announce(d.summary)
    }
    panel.append(
      h("p", { class: "yv-muted" }, "Hierarchy, readability, interaction, clutter and consistency. Heuristic, not a visual-design certification."),
      h("div", { class: "yv-row" }, h("label", { for: sizeId }, "Minimum text size (px)"), size, h("button", { type: "button", class: "yv-btn yv-primary", onclick: run }, iconEl("layout", 16), "Review design")),
      out
    )
  }

  /* ── 5. Ask page ── */
  function buildAsk(panel) {
    const inputId = nextId("yv-pq")
    const input = h("input", { id: inputId, class: "yv-input", type: "text", placeholder: "What is this page about?", autocomplete: "off" })
    const out = h("div", { "aria-live": "polite" })
    let index = null
    const run = async () => {
      const q = input.value.trim() || "What is this page about?"
      const a = await askAboutPage(q, { summarize: options.summarize })
      const nodes = [h("div", { class: "yv-answer" }, a.answer)]
      if (a.suggestions.length) nodes.push(h("ul", { class: "yv-steps" }, ...a.suggestions.map((s) => h("li", null, s))))
      const show = showButton(a.targets)
      if (show) nodes.push(show)
      if (a.intent === "unknown") {
        // keyword search (BM25) over the page text, optional model answer
        if (!index) index = createContextIndex({ includePage: true, documents: options.documents, engine: options.engine })
        else index.rebuild()
        const c = await index.ask(q, { generate: options.generate })
        nodes.push(h("h4", { style: "margin:12px 0 4px" }, c.generated ? "Answer (your model)" : "From the page text"), h("div", { class: "yv-answer" }, c.answer))
      }
      out.replaceChildren(...nodes)
      announce(a.answer)
    }
    const form = h("form", { class: "yv-row" }, h("label", { for: inputId, class: "yv-sr" }, "Ask about this page"), input, h("button", { type: "submit", class: "yv-btn yv-primary" }, "Ask"))
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      run()
    })
    const examples = ["What is this page about?", "Which fields have no label?", "Which images have no alt text?", "Show the page structure", "How many links are there?", "Tell me about the forms"]
    panel.append(
      h("p", { class: "yv-muted" }, "Answers from this page only, offline. Pass generate() to use your own model."),
      form,
      h("div", { class: "yv-chips" }, ...examples.map((x) => h("button", { type: "button", class: "yv-chip", onclick: () => ((input.value = x), run()) }, x))),
      out
    )
  }

  /* ── 6. Voice ── */
  let voice = null
  function buildVoice(panel) {
    const langId = nextId("yv-lang")
    const lang = h("select", { id: langId, class: "yv-input", style: "width:auto" }, ...VOICE_LANGS.map(([v, l]) => h("option", { value: v, selected: v === (options.voiceLang || "en-IN") }, l)))
    const startBtn = h("button", { type: "button", class: "yv-btn yv-primary", "aria-pressed": "false" }, iconEl("mic", 16), "Start listening")
    const cmdId = nextId("yv-cmd")
    const cmd = h("input", { id: cmdId, class: "yv-input", type: "text", placeholder: "Type a command, e.g. make text bigger", autocomplete: "off" })
    const log = h("div", { class: "yv-answer", role: "status", "aria-live": "polite" })
    const supported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

    const make = () => {
      if (voice) voice.stop()
      voice = createVoiceA11yController({
        lang: lang.value,
        speak: options.speak !== false,
        initial: options.getSettings ? options.getSettings() : undefined,
        apply: options.applySettings,
        onTranscript: (text, command) => {
          log.textContent = `Heard: “${text}”\n${command ? command.say : "Not a voice command. Try: make text bigger, high contrast on, dark mode, next row, reset."}`
          options.onVoiceCommand && options.onVoiceCommand(text, command)
        },
      })
    }
    make()
    lang.addEventListener("change", () => {
      const wasOn = startBtn.getAttribute("aria-pressed") === "true"
      make()
      if (wasOn) voice.start()
    })
    startBtn.addEventListener("click", () => {
      if (startBtn.getAttribute("aria-pressed") === "true") {
        voice.stop()
        startBtn.setAttribute("aria-pressed", "false")
        startBtn.lastChild.textContent = "Start listening"
        return
      }
      if (!voice.start()) {
        log.textContent = "Speech recognition is not available in this browser. Typed commands below still work."
        return
      }
      startBtn.setAttribute("aria-pressed", "true")
      startBtn.lastChild.textContent = "Stop listening"
      log.textContent = "Listening… say “make text bigger” or “next row”."
    })
    const form = h("form", { class: "yv-row" }, h("label", { for: cmdId, class: "yv-sr" }, "Type a voice command"), cmd, h("button", { type: "submit", class: "yv-btn" }, "Run"))
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      if (!cmd.value.trim()) return
      await voice.handle(cmd.value)
    })
    const phrases = ["make text bigger", "make text smaller", "high contrast on", "dark mode", "reduce motion", "dyslexia font", "next row", "previous row", "first row", "reset", "పెద్ద అక్షరాలు", "హై కాంట్రాస్ట్", "తర్వాతి వరుస"]
    panel.append(
      h("p", { class: "yv-muted" }, supported ? "Speak accessibility commands in English or Telugu. Text size moves 80–130% in 10% steps." : "Your browser has no speech recognition. You can still type the same commands."),
      h("div", { class: "yv-row" }, h("label", { for: langId }, "Language"), lang, startBtn),
      form,
      h("div", { class: "yv-chips" }, ...phrases.map((p) => h("button", { type: "button", class: "yv-chip", onclick: () => ((cmd.value = p), voice.handle(p)) }, p))),
      log
    )
  }

  const BUILDERS = { copilot: buildCopilot, qa: buildQa, forms: buildForms, design: buildDesign, ask: buildAsk, voice: buildVoice }
  select(options.defaultTab || "qa", false)

  return {
    element: root,
    select: (id) => select(id, false),
    get tab() {
      return current
    },
    get copilot() {
      return copilot
    },
    destroy() {
      copilot && copilot.stop()
      voice && voice.stop()
      root.remove()
    },
  }
}
