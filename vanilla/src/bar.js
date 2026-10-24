// yuktai vanilla — AgenticGridBar without React.
// A question bar for createAgenticGrid(): grid questions, BI answers and
// multi-step tasks. Every answer is a plain sentence; BI answers also show a
// small table, and tasks show their steps.

import { esc, h, iconEl, nextId } from "./dom.js"

const KIND_LABEL = { query: "Grid query", anomalies: "Anomalies", summary: "Summary", insight: "BI insight", tasks: "Task steps" }

export function mountAgenticGridBar(container, agentic, options = {}) {
  const target = typeof container === "string" ? document.querySelector(container) : container
  if (!target) throw new Error("mountAgenticGridBar: container not found")
  if (!agentic || typeof agentic.ask !== "function") throw new Error("mountAgenticGridBar: pass the object from createAgenticGrid() or grid.agentic")

  const titleText = options.title || "Ask about this data"
  const inputId = nextId("yv-q")
  const hintId = nextId("yv-qh")
  const input = h("input", {
    id: inputId,
    class: "yv-input",
    type: "text",
    autocomplete: "off",
    placeholder: options.placeholder || "Ask the grid… e.g. salary over 1 lakh in Hyderabad",
    "aria-describedby": hintId,
  })
  const askBtn = h("button", { type: "submit", class: "yv-btn yv-primary" }, iconEl("spark", 16), "Ask")
  const resetBtn = h("button", { type: "button", class: "yv-btn" }, iconEl("reset", 16), "Show all rows")
  const kind = h("p", { class: "yv-muted", style: "margin:10px 0 0", hidden: true })
  const answer = h("div", { class: "yv-answer", role: "status", "aria-live": "polite" })
  const extra = h("div")
  const examples = options.examples || ["salary over 1 lakh", "anything unusual?", "average salary by department", "show salary over 80k, then sort by salary, then summarize"]
  const chips = h("div", { class: "yv-chips", "aria-label": "Example questions" }, ...examples.map((x) => h("button", { type: "button", class: "yv-chip", "data-example": x }, x)))
  const form = h("form", { class: "yv-row", role: "search", "aria-label": titleText }, h("label", { for: inputId, class: "yv-sr" }, titleText), input, askBtn, resetBtn)
  const box = h(
    "section",
    { class: `yv-box yv-agentic-bar${options.theme ? " yv-theme-" + options.theme : ""}`, "aria-label": titleText },
    h("h3", null, iconEl("spark", 16), " ", titleText),
    h("p", { id: hintId, class: "yv-muted", style: "margin:0 0 8px" }, options.hint || "Plain-English questions. Understands 10k, 1.5 lakh, 2cr. Every answer says which filters it used."),
    form,
    chips,
    kind,
    answer,
    extra
  )
  target.appendChild(box)

  function paint(state) {
    askBtn.disabled = !!state.busy
    box.setAttribute("aria-busy", String(!!state.busy))
    if (state.busy) return
    answer.textContent = state.answer || ""
    kind.hidden = !state.kind
    kind.textContent = state.kind ? `${KIND_LABEL[state.kind] || state.kind} · ${state.visibleIds.length} row(s) shown` : ""
    extra.replaceChildren()
    if (state.table && state.table.length) {
      const headers = Object.keys(state.table[0])
      const table = h("table", { class: "yv-mini" })
      table.innerHTML = `<caption class="yv-sr">Answer table</caption><thead><tr>${headers.map((x) => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${state.table
        .map((r) => `<tr>${headers.map((x) => `<td>${esc(r[x])}</td>`).join("")}</tr>`)
        .join("")}</tbody>`
      extra.append(h("div", { style: "overflow-x:auto" }, table))
    }
    if (state.steps && state.steps.length) {
      extra.append(
        h(
          "ol",
          { class: "yv-steps", "aria-label": "Steps" },
          ...state.steps.map((s) => h("li", null, h("span", { class: s.success === false ? "yv-fail" : "yv-ok" }, s.success === false ? "✗ " : "✓ "), h("b", null, s.action), ": ", s.message || s.text))
        )
      )
    }
  }

  const unsubscribe = agentic.subscribe(paint)
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    agentic.ask(input.value)
  })
  resetBtn.addEventListener("click", () => {
    input.value = ""
    agentic.reset()
  })
  chips.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-example]")
    if (!chip) return
    input.value = chip.getAttribute("data-example")
    agentic.ask(input.value)
  })

  return {
    element: box,
    ask: (q) => {
      input.value = q
      return agentic.ask(q)
    },
    destroy() {
      unsubscribe()
      box.remove()
    },
  }
}
