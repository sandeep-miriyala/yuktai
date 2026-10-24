// yuktai vanilla — agents without React.
//
//   createGridAgent    ← useYuktaiGridAgent   (YuktaiGridAgent.tsx)
//   parseGridIntent    ← parseGridIntent      (YuktaiGridAgent.tsx, same rules)
//   registerWebMCP     ← <YuktaiGridWebMCP>   (YuktaiGridWebMCP.tsx)
//   createAgenticGrid  ← useAgenticGrid       (agentic/react.tsx)
//
// The behaviour follows the React versions line by line. Instead of React
// state, each object keeps plain state and calls subscribe() listeners.

import {
  answerGridQuestion,
  applyGridFilters,
  askInsight,
  createGridTools,
  executeGridQuery,
  getRowId,
  planTasks,
  runTasks,
  toGridToolColumns,
} from "./core.js"

/* ───────────────────────── small helpers ───────────────────────── */

function emitter() {
  const listeners = new Set()
  return {
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    emit(value) {
      listeners.forEach((fn) => {
        try {
          fn(value)
        } catch (error) {
          console.error("[yuktai] listener failed", error)
        }
      })
    },
  }
}

const toError = (error) => (error instanceof Error ? error : new Error(String(error)))

/* ───────────────────────── grid agent ───────────────────────── */

const MESSAGES = {
  en: {
    done: "Done.",
    toolMissing: (name) => `The action "${name}" is not available here.`,
    missingInput: (fields) => `Missing: ${fields}.`,
    notUnderstood:
      "Sorry, I didn't understand. Try: a word to search, “sort by <column>”, or “clear filters”.",
    noMatch: (text) => `Nothing matched "${text}".`,
    failed: "Something went wrong while running this action.",
  },
  te: {
    done: "పూర్తయింది.",
    toolMissing: (name) => `"${name}" సౌకర్యం ఇక్కడ అందుబాటులో లేదు.`,
    missingInput: (fields) => `ఇవి కావాలి: ${fields}.`,
    notUnderstood:
      "క్షమించండి, అర్థం కాలేదు. ఇలా ప్రయత్నించండి: వెతకాల్సిన పదం, “<కాలమ్> ప్రకారం క్రమం”, లేదా “ఫిల్టర్లు తీసేయి”.",
    noMatch: (text) => `"${text}" కి ఏమీ సరిపోలేదు.`,
    failed: "ఈ పని చేస్తుండగా సమస్య వచ్చింది.",
  },
}

const norm = (s) => String(s ?? "").normalize("NFC").toLowerCase().trim()

const RX = {
  clearFilters: /\b(clear|remove|reset)\b.*\bfilters?\b|ఫిల్టర్.*(తీసే|తొలగ)/i,
  clearSort: /\b(clear|remove|reset)\b.*\bsort(ing)?\b|క్రమం.*(తీసే|తొలగ)/i,
  count: /^\s*(how many|count)\b|ఎన్ని|లెక్క/i,
  sort: /\bsort\b|\border by\b|క్రమ|అమర్చ|సార్ట్/i,
  desc: /\b(desc|descending|z\s*-\s*a|highest|largest|most)\b|అవరోహణ|తగ్గే|పెద్ద|అధిక|చివర|ఎక్కువ నుండి/i,
  openEn: /^\s*open\s+(.+?)\s*$/i,
  openTe: /^\s*(.+?)\s*(తెరువు|తెరవండి|తెరవు)\s*$/,
  searchFiller:
    /^\s*(search(\s+for)?|find|show(\s+me)?|filter(\s+by)?|look\s+for|వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s+|\s+(వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s*$/gi,
}

function findColumnInText(text, columns) {
  const t = norm(text)
  let best = null
  for (const c of columns) {
    for (const name of [c.label, c.key]) {
      const n = norm(name)
      if (n && t.includes(n) && (!best || n.length > best.len)) best = { key: c.key, len: n.length }
    }
  }
  return best ? best.key : null
}

/** Built-in phrase parser (English + Telugu). Returns null when nothing matches. */
export function parseGridIntent(text, context) {
  const raw = String(text ?? "").trim()
  if (!raw) return null
  const columns = (context && context.columns) || []
  if (RX.clearFilters.test(raw)) return { kind: "tool", tool: "clear_filters", input: {} }
  if (RX.clearSort.test(raw)) return { kind: "tool", tool: "clear_sort", input: {} }
  if (RX.count.test(raw)) return { kind: "tool", tool: "count", input: {} }
  if (RX.sort.test(raw)) {
    const key = findColumnInText(raw, columns)
    if (!key) return null
    return { kind: "tool", tool: "sort", input: { key, direction: RX.desc.test(raw) ? "desc" : "asc" } }
  }
  const open = raw.match(RX.openEn) || raw.match(RX.openTe)
  if (open && open[1]) return { kind: "open", text: open[1].trim() }
  const query = raw.replace(RX.searchFiller, "").trim()
  return query ? { kind: "tool", tool: "search", input: { query } } : null
}

function isStructured(value) {
  return !!value && typeof value === "object" && typeof value.success === "boolean" && typeof value.message === "string"
}

function missingRequired(tool, input) {
  const required = tool.inputSchema && tool.inputSchema.required
  if (!Array.isArray(required)) return []
  return required.map(String).filter((k) => input[k] === undefined || input[k] === null || String(input[k]).trim() === "")
}

/** Exact name first, then "<prefix>_<shortId>". */
function findTool(tools, name) {
  const exact = tools.find((t) => t.name === name)
  if (exact) return exact
  const matches = tools.filter((t) => t.name.endsWith(`_${name}`)).sort((a, b) => a.name.length - b.name.length)
  if (!matches.length) return undefined
  if (matches.length > 1 && matches[0].name.length === matches[1].name.length) return undefined
  return matches[0]
}

const normalizeRuleText = (value) => String(value ?? "").normalize("NFC").trim().toLocaleLowerCase()

function findCustomRule(input, rules) {
  const text = normalizeRuleText(input)
  return (rules || []).find((rule) =>
    (rule.phrases || []).some((phrase) => {
      const p = normalizeRuleText(phrase)
      return p.length > 0 && text.includes(p)
    })
  )
}

/**
 * Vanilla version of useYuktaiGridAgent.
 *
 * Every option can be a value or a function returning the current value
 * (tools, data, columns), so the agent always sees fresh grid state.
 */
export function createGridAgent(options = {}) {
  const read = (value) => (typeof value === "function" ? value() : value)
  const opts = { locale: "en", rowKey: "id", historyLimit: 20, customRules: [], ...options }
  const events = emitter()
  let pending = 0
  let lastResult = null
  let lastError = null
  let history = []
  let stepId = 0

  const m = () => MESSAGES[opts.locale === "te" ? "te" : "en"]
  const tools = () => read(opts.tools) || []
  const state = () => ({ loading: pending > 0, lastResult, lastError, history: history.slice() })
  const changed = () => events.emit(state())

  function record(tool, input, result, source, id) {
    if (id === stepId) lastResult = result
    history = [...history, { id, tool, input, result, source, at: Date.now() }].slice(-opts.historyLimit)
    changed()
  }

  async function run(name, input, source) {
    const id = ++stepId
    const tool = findTool(tools(), name)
    if (!tool) {
      const result = { success: false, message: m().toolMissing(name), error: { code: "NOT_SUPPORTED" } }
      lastError = new Error(result.message)
      opts.onError && opts.onError(lastError)
      record(name, input, result, source, id)
      return result
    }
    const missing = missingRequired(tool, input)
    if (missing.length) {
      const result = { success: false, message: m().missingInput(missing.join(", ")), error: { code: "INVALID_INPUT" }, tool: tool.name }
      record(tool.name, input, result, source, id)
      opts.onResult && opts.onResult(result)
      return result
    }
    pending++
    changed()
    try {
      const raw = await tool.execute(input)
      const result = isStructured(raw) ? { ...raw, tool: tool.name } : { success: true, message: m().done, data: raw, tool: tool.name }
      if (result.success) lastError = null
      record(tool.name, input, result, source, id)
      opts.onResult && opts.onResult(result)
      return result
    } catch (error) {
      lastError = toError(error)
      const result = { success: false, message: m().failed, error: { code: "INTERNAL" }, tool: tool.name }
      opts.onError && opts.onError(lastError)
      record(tool.name, input, result, source, id)
      return result
    } finally {
      pending = Math.max(0, pending - 1)
      changed()
    }
  }

  /** Run one tool by full name or short id ("search", "filter", …). Never throws. */
  const executeTool = (name, input = {}) => run(name, input || {}, "tool")

  /** Understand a sentence and run the matching tool. Custom rules first. */
  async function ask(text) {
    const columns = read(opts.columns) || []
    const rule = findCustomRule(text, opts.customRules)
    if (rule) {
      const id = ++stepId
      try {
        const message = await rule.execute({ input: text, data: read(opts.data) || [], columns, executeTool })
        const result = { success: true, message: String(message ?? m().done), tool: `rule:${rule.name}` }
        record(`rule:${rule.name}`, { text }, result, "ask", id)
        opts.onResult && opts.onResult(result)
        return result
      } catch (error) {
        lastError = toError(error)
        opts.onError && opts.onError(lastError)
        const result = { success: false, message: m().failed, error: { code: "INTERNAL" }, tool: `rule:${rule.name}` }
        record(`rule:${rule.name}`, { text }, result, "ask", id)
        return result
      }
    }

    const intent = (opts.parseIntent || parseGridIntent)(text, { columns, locale: opts.locale })
    if (!intent) {
      const result = { success: false, message: m().notUnderstood, error: { code: "NOT_UNDERSTOOD" } }
      record("ask", { text }, result, "ask", ++stepId)
      return result
    }
    if (intent.kind === "tool") return run(intent.tool, intent.input, "ask")

    // "open X": search first, then open the first match
    const found = await run("search", { query: intent.text }, "ask")
    if (!found.success) return found
    const rows = Array.isArray(found.data) ? found.data : []
    if (!rows.length) {
      const result = { success: false, message: m().noMatch(intent.text), error: { code: "NOT_FOUND" }, tool: found.tool }
      record("open", { text: intent.text }, result, "ask", ++stepId)
      return result
    }
    return run("open", { id: getRowId(rows[0], opts.rowKey) }, "ask")
  }

  function clearHistory() {
    history = []
    lastResult = null
    lastError = null
    changed()
  }

  return {
    ask,
    executeTool,
    clearHistory,
    subscribe: events.subscribe,
    getState: state,
    get tools() {
      return tools()
    },
    get loading() {
      return pending > 0
    },
    get lastResult() {
      return lastResult
    },
    get lastError() {
      return lastError
    },
    get history() {
      return history.slice()
    },
  }
}

/* ───────────────────────── WebMCP ───────────────────────── */

/**
 * Register grid tools with WebMCP (document.modelContext).
 * Reports the REAL status: unsupported | registering | ready | partial | error.
 * Returns { status, unregister() }.
 *
 * `tools` may be an array or a function returning the current array; the
 * registered tools always call the latest version, so data changes do not
 * need a new registration.
 */
export function registerWebMCP(tools, options = {}) {
  const read = () => (typeof tools === "function" ? tools() : tools) || []
  const report = (status) => {
    current.status = status
    options.onStatusChange && options.onStatusChange(status)
  }
  const current = {
    status: { state: "unsupported", registered: [], errors: [] },
    done: Promise.resolve(),
    unregister() {
      controller.abort()
    },
  }
  const modelContext = typeof document !== "undefined" ? document.modelContext : undefined
  const controller = new AbortController()

  if (!modelContext || typeof modelContext.registerTool !== "function") {
    report({ state: "unsupported", registered: [], errors: [] })
    return current
  }

  current.done = (async () => {
    report({ state: "registering", registered: [], errors: [] })
    const registered = []
    const errors = []
    for (const tool of read()) {
      if (controller.signal.aborted) return
      try {
        await modelContext.registerTool(
          {
            name: tool.name,
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema,
            execute: (input) => {
              const latest = read().find((t) => t.name === tool.name)
              return latest
                ? latest.execute(input || {})
                : { success: false, message: `Tool "${tool.name}" is no longer available.`, error: { code: "NOT_SUPPORTED" } }
            },
          },
          { signal: controller.signal }
        )
        registered.push(tool.name)
      } catch (error) {
        errors.push({ tool: tool.name, message: toError(error).message })
      }
    }
    if (controller.signal.aborted) return
    report({ state: errors.length === 0 ? "ready" : registered.length ? "partial" : "error", registered, errors })
  })()

  return current
}

/* ───────────────────────── agentic grid (useAgenticGrid) ───────────────────────── */

const BI_PATTERN =
  /\b(trend|over time|this (week|month|quarter|year)|last (week|month|quarter|year)|compare|versus|vs)\b|\b(by|per|each|which)\b.*\b(total|average|avg|sum|drop|increase|growth|highest|lowest|most|least)\b|\b(total|average|avg|sum)\b.*\b(by|per|each)\b/i

const EMPTY_QUERY = { filters: [], search: [], sort: null, limit: null, notes: [], explanation: "" }

/**
 * Vanilla version of useAgenticGrid: one ask() for grid questions,
 * BI questions and multi-step tasks.
 *
 * Standalone: keeps its own filters / sort / highlights → read gridData.
 * Attached to a grid (renderGrid does this): pass `bind` with the grid's
 * getters and setters, and every answer changes the visible grid.
 */
export function createAgenticGrid(options = {}) {
  const events = emitter()
  const rowKey = options.rowKey || "id"
  const bind = options.bind || null
  let data = Array.isArray(options.data) ? options.data : []
  let columns = toGridToolColumns(options.columns || [])
  let own = { filters: [], sort: null, highlightIds: [] }
  let answer = ""
  let kind = null
  let table = []
  let steps = []
  let busy = false

  const getFilters = () => (bind ? bind.getFilters() : own.filters)
  const getSort = () => (bind ? bind.getSort() : own.sort)
  const getHighlights = () => (bind ? bind.getHighlightIds() : own.highlightIds)
  const getData = () => (bind ? bind.getData() : data)

  const setFilters = (f) => (bind ? bind.setFilters(f) : (own = { ...own, filters: f }))
  const setSort = (s) => (bind ? bind.setSort(s) : (own = { ...own, sort: s }))
  const setHighlights = (ids) => (bind ? bind.setHighlightIds(ids) : (own = { ...own, highlightIds: ids }))

  function gridData() {
    return executeGridQuery(getData(), columns, { ...EMPTY_QUERY, filters: getFilters(), sort: getSort() })
  }

  const snapshot = () => {
    const rows = gridData()
    return {
      gridData: rows,
      highlightIds: getHighlights().slice(),
      filters: getFilters().slice(),
      sort: getSort(),
      answer,
      kind,
      table: table.slice(),
      steps: steps.slice(),
      busy,
      visibleIds: rows.map((r) => getRowId(r, rowKey)),
    }
  }
  const changed = () => events.emit(snapshot())

  const context = () => ({
    get data() {
      return getData()
    },
    columns,
    rowKey,
    get filters() {
      return getFilters()
    },
    onFiltersChange: (f) => {
      setFilters(f)
      changed()
    },
    onSortChange: (s) => {
      setSort(s)
      changed()
    },
    onHighlightRows: (ids) => {
      setHighlights(ids)
      changed()
    },
    onOpenRow: options.onOpenRow,
    onSelectRow: (id) => {
      if (bind && bind.selectRow) bind.selectRow(id)
      else setHighlights([id])
      changed()
    },
  })

  async function ask(question) {
    const q = String(question ?? "").trim()
    if (!q) return snapshot()
    busy = true
    steps = []
    table = []
    changed()
    try {
      if (planTasks(q).length > 1) {
        const live = []
        const result = await runTasks(q, context(), {
          onStep: (step) => {
            live.push(step)
            steps = live.slice()
            changed()
          },
        })
        kind = "tasks"
        answer = result.summary
      } else if (BI_PATTERN.test(q)) {
        const filtered = applyGridFilters(getData(), columns, getFilters())
        const insight = askInsight(q, filtered, columns, { referenceDate: options.referenceDate })
        kind = "insight"
        answer = insight.answer
        table = insight.table || []
      } else {
        const result = answerGridQuestion(q, context())
        kind = result.kind
        answer = result.message
      }
    } catch (error) {
      console.error("[yuktai] ask failed", error)
      kind = null
      answer = "Something went wrong while answering. Please rephrase the question."
    } finally {
      busy = false
      changed()
    }
    return snapshot()
  }

  function reset() {
    setFilters([])
    setSort(null)
    setHighlights([])
    answer = ""
    kind = null
    table = []
    steps = []
    changed()
  }

  /** Replace rows/columns (standalone use). */
  function update(next = {}) {
    if (Array.isArray(next.data)) data = next.data
    if (Array.isArray(next.columns)) columns = toGridToolColumns(next.columns)
    changed()
  }

  return {
    ask,
    reset,
    update,
    subscribe: events.subscribe,
    getState: snapshot,
    get gridData() {
      return gridData()
    },
    get highlightIds() {
      return getHighlights().slice()
    },
    get filters() {
      return getFilters().slice()
    },
    get sort() {
      return getSort()
    },
    get answer() {
      return answer
    },
    get kind() {
      return kind
    },
    get table() {
      return table.slice()
    },
    get steps() {
      return steps.slice()
    },
    get busy() {
      return busy
    },
    get visibleIds() {
      return gridData().map((r) => getRowId(r, rowKey))
    },
  }
}

export { createGridTools }
