// yuktai vanilla — YuktaiGrid without React.
//
// renderGrid(container, rows, columns, options)   ← v5.1 vanilla signature (still works)
// renderGrid(container, { data, columns, ...options })
//
// Same features as <YuktaiGrid>: search, sort, pagination with page-size
// switching, table / card / auto view, 5 WCAG themes, row selection, custom
// cell render, highlighting with auto-scroll, loading and empty states,
// keyboard navigation with ARIA grid semantics, 44×44 targets, Telugu UI,
// built-in assistant (chat + voice) with custom rules, WebMCP, agentic bar.

import {
  applyGridFilters,
  createGridTools,
  detectAnomalies,
  getRowId,
  summarizeRows,
  toGridToolColumns,
} from "./core.js"
import { createAgenticGrid, createGridAgent, registerWebMCP } from "./agent.js"
import { mountAgenticGridBar } from "./bar.js"
import { announce, csvCell, downloadText, esc, h, icon, iconEl, nextId, prefersReducedMotion } from "./dom.js"

const UI = {
  en: {
    search: "Search…",
    searchAria: "Search grid",
    rows: "rows",
    selected: "selected",
    loading: "Loading…",
    noData: "No data found.",
    selectRow: (name) => `Select row ${name}`,
    selectPage: "Select all rows on this page",
    pageSize: "Rows per page",
    page: (p, n) => `Page ${p} of ${n}`,
    showing: (a, b, n) => (n ? `Showing ${a}–${b} of ${n}` : "No rows"),
    first: "First page",
    previous: "Previous page",
    next: "Next page",
    last: "Last page",
    yes: "Yes",
    no: "No",
    sortedAsc: (l) => `Sorted by ${l}, ascending`,
    sortedDesc: (l) => `Sorted by ${l}, descending`,
    sortCleared: "Sorting cleared",
    filters: (n) => `${n} filter(s) applied`,
    clearFilters: "Clear filters",
    removeFilter: (t) => `Remove filter: ${t}`,
    export: "Export CSV",
    tableView: "Table view",
    cardView: "Card view",
    highlighted: "highlighted",
    results: (n) => `${n} result(s)`,
    ops: { contains: "contains", equals: "is", startsWith: "starts with", endsWith: "ends with", greaterThan: ">", lessThan: "<", between: "between" },
  },
  te: {
    search: "శోధించండి…",
    searchAria: "గ్రిడ్‌లో శోధించండి",
    rows: "వరుసలు",
    selected: "ఎంచుకున్నవి",
    loading: "లోడ్ అవుతోంది…",
    noData: "డేటా కనబడలేదు.",
    selectRow: (name) => `వరుస ${name} ఎంచుకోండి`,
    selectPage: "ఈ పేజీలోని అన్ని వరుసలు ఎంచుకోండి",
    pageSize: "పేజీ పరిమాణం",
    page: (p, n) => `పేజీ ${p} / ${n}`,
    showing: (a, b, n) => (n ? `${n} లో ${a}–${b}` : "వరుసలు లేవు"),
    first: "మొదటి పేజీ",
    previous: "వెనుకకు",
    next: "ముందుకు",
    last: "చివరి పేజీ",
    yes: "అవును",
    no: "కాదు",
    sortedAsc: (l) => `${l} ప్రకారం ఆరోహణ క్రమం`,
    sortedDesc: (l) => `${l} ప్రకారం అవరోహణ క్రమం`,
    sortCleared: "క్రమం తీసేశారు",
    filters: (n) => `${n} ఫిల్టర్(లు) వేశారు`,
    clearFilters: "ఫిల్టర్లు తీసేయండి",
    removeFilter: (t) => `ఫిల్టర్ తీసేయండి: ${t}`,
    export: "CSV డౌన్‌లోడ్",
    tableView: "పట్టిక",
    cardView: "కార్డులు",
    highlighted: "హైలైట్",
    results: (n) => `${n} ఫలితాలు`,
    ops: { contains: "లో ఉంది", equals: "=", startsWith: "తో మొదలు", endsWith: "తో ముగింపు", greaterThan: ">", lessThan: "<", between: "మధ్య" },
  },
}

const THEMES = ["default", "high-contrast", "dark", "color-blind", "dyslexia"]
const norm = (v) => String(v == null ? "" : v).normalize("NFC").toLowerCase()

function normaliseColumns(columns, data) {
  const list = Array.isArray(columns) && columns.length ? columns : data[0] ? Object.keys(data[0]).map((key) => ({ key, label: key })) : []
  return list.map((c) => ({
    key: String(c.key),
    label: c.label == null ? String(c.key) : String(c.label),
    sortable: c.sortable !== false,
    type: c.type || "text",
    align: c.align || (c.type === "number" ? "right" : "left"),
    render: typeof c.render === "function" ? c.render : null,
    hiddenOnMobile: !!c.hiddenOnMobile,
    width: c.width,
  }))
}

/**
 * Render an accessible data grid.
 * @returns grid API (see README)
 */
export function renderGrid(container, rowsOrOptions, columnsArg, optionsArg) {
  const target = typeof container === "string" ? document.querySelector(container) : container
  if (!target || typeof target.appendChild !== "function") throw new Error("renderGrid: container not found. Pass an element or a CSS selector.")

  const opts = Array.isArray(rowsOrOptions)
    ? { ...(optionsArg || {}), data: rowsOrOptions, columns: columnsArg }
    : { ...(rowsOrOptions || {}) }

  const locale = opts.locale || "en-IN"
  const lang2 = String(locale).split("-")[0]
  const t = UI[lang2 === "te" ? "te" : "en"]
  const toolLocale = lang2 === "te" ? "te" : "en"
  const numberLocale = lang2 === "en" || lang2 === "te" ? "en-IN" : locale
  const rowKey = opts.rowKey || "id"
  const label = opts.label || opts.ariaLabel || "Data grid"
  const pagination = opts.pagination === false ? false : typeof opts.pagination === "object" ? opts.pagination : {}
  const sizeOptions = (pagination && pagination.sizeOptions) || [10, 20, 50, 100]
  const selectable = opts.selectable !== false
  const autoScroll = opts.autoScrollToHighlight !== false
  const breakpoint = Number(opts.mobileBreakpoint) || 640

  // ── state ──
  let data = Array.isArray(opts.data) ? opts.data.slice() : []
  let columns = normaliseColumns(opts.columns, data)
  let toolColumns = toGridToolColumns(columns)
  let filters = []
  let sort = null
  let query = ""
  let page = 1
  let pageSize = Number((pagination && pagination.pageSize) || opts.pageSize) || 10
  let theme = THEMES.includes(opts.theme) ? opts.theme : "default"
  let view = ["table", "card", "auto"].includes(opts.view) ? opts.view : "auto"
  let loading = !!opts.loading
  let narrow = false
  let active = { r: 1, c: 0 } // roving focus position in the table (row 0 = header)
  const selected = new Set((opts.selectedKeys || []).map(String))
  const highlights = new Set((opts.highlightIds || []).map(String))
  const ids = { grid: nextId("yv-grid"), title: nextId("yv-title"), status: nextId("yv-status") }

  if (!sizeOptions.includes(pageSize)) sizeOptions.push(pageSize)
  sizeOptions.sort((a, b) => a - b)

  const keyOf = (row) => getRowId(row, rowKey) || String(data.indexOf(row))
  const titleOf = (row) => {
    const first = columns.find((c) => c.type === "text") || columns[0]
    return first ? String(row[first.key] ?? keyOf(row)) : keyOf(row)
  }

  // ── DOM skeleton (built once; only the body is re-rendered) ──
  const host = h("section", {
    class: `yv-grid yv-theme-${theme}${opts.wrap ? " yv-wrap" : ""}${opts.className ? " " + opts.className : ""}`,
    role: "region",
    "aria-labelledby": ids.title,
    lang: opts.lang || (lang2 !== "en" ? locale : null),
  })
  if (opts.maxHeight) host.style.setProperty("--yv-max-height", typeof opts.maxHeight === "number" ? `${opts.maxHeight}px` : opts.maxHeight)
  const title = h("h3", { id: ids.title, class: opts.showTitle ? "yv-grid-title" : "yv-sr" }, label)
  if (opts.showTitle) title.style.cssText = "margin:0;padding:12px 12px 0;font-size:1.05em"

  const searchInput = h("input", { type: "search", placeholder: t.search, "aria-label": t.searchAria, "aria-controls": ids.grid, autocomplete: "off", spellcheck: "false" })
  const searchBox = opts.search === false ? null : h("label", { class: "yv-search" }, iconEl("search", 18), searchInput)
  const info = h("span", { class: "yv-info", "aria-hidden": "true" })
  const viewBtn = h("button", { type: "button", class: "yv-btn yv-icon", "data-view-toggle": "" })
  const exportBtn = opts.exportable === false ? null : h("button", { type: "button", class: "yv-btn" }, iconEl("download", 16), t.export)
  const tools = h("div", { class: "yv-tools" }, view === "auto" || opts.viewToggle ? viewBtn : null, exportBtn)
  const toolbar = h("div", { class: "yv-toolbar" }, searchBox, info, tools)
  const filterBar = h("div", { class: "yv-filterbar", hidden: true, "aria-label": t.filters(0) })
  const slot = h("div", { class: "yv-slot" }) // assistant + agentic bar go here
  const body = h("div", { class: "yv-body", id: ids.grid })
  const pager = h("div", { class: "yv-pager" })
  const status = h("p", { class: "yv-sr", id: ids.status, role: "status", "aria-live": "polite", "aria-atomic": "true" })
  host.append(title, toolbar, filterBar, slot, body, pager, status)
  target.appendChild(host)

  let statusTimer = null
  const say = (text) => {
    clearTimeout(statusTimer)
    status.textContent = ""
    statusTimer = setTimeout(() => (status.textContent = text), 40)
  }

  // ── data pipeline: filters (tools) → search → sort ──
  function compare(a, b, column, dir) {
    const av = a[column.key]
    const bv = b[column.key]
    if (av == null || av === "") return bv == null || bv === "" ? 0 : 1
    if (bv == null || bv === "") return -1
    let out
    if (column.type === "number") out = Number(av) - Number(bv)
    else if (column.type === "date") out = new Date(av).getTime() - new Date(bv).getTime()
    else out = String(av).localeCompare(String(bv), locale, { numeric: true, sensitivity: "base" })
    if (!Number.isFinite(out)) out = String(av).localeCompare(String(bv))
    return dir === "desc" ? -out : out
  }

  function viewRows() {
    let out = applyGridFilters(data, toolColumns, filters)
    if (query) {
      const q = norm(query)
      out = out.filter((row) => columns.some((c) => norm(row[c.key]).includes(q) || norm(formatPlain(c, row[c.key])).includes(q)))
    }
    if (sort && sort.key) {
      const column = columns.find((c) => c.key === sort.key)
      if (column) out = out.slice().sort((a, b) => compare(a, b, column, sort.direction))
    }
    return out
  }

  // ── formatting ──
  function formatPlain(column, value) {
    if (value == null || value === "") return ""
    if (column.type === "number" && Number.isFinite(Number(value))) return Number(value).toLocaleString(numberLocale)
    if (column.type === "date") {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(numberLocale, { year: "numeric", month: "short", day: "numeric" })
    }
    if (column.type === "boolean") return value === true || value === "true" ? t.yes : t.no
    return String(value)
  }

  function cellContent(column, row, index) {
    const value = row[column.key]
    if (column.render) {
      try {
        const out = column.render(value, row, index)
        if (out instanceof Node) return out
        return document.createTextNode(out == null ? "" : String(out))
      } catch (error) {
        console.error("[yuktai] column render failed", column.key, error)
        return document.createTextNode(formatPlain(column, value))
      }
    }
    if (column.type === "badge" && value != null && value !== "") return h("span", { class: "yv-cellbadge" }, String(value))
    return document.createTextNode(formatPlain(column, value))
  }

  // ── rendering ──
  const isCards = () => view === "card" || (view === "auto" && narrow)

  function pageBounds(total) {
    if (pagination === false) return { pages: 1, start: 0, end: total }
    const pages = Math.max(1, Math.ceil(total / pageSize))
    page = Math.min(Math.max(1, page), pages)
    return { pages, start: (page - 1) * pageSize, end: Math.min(total, page * pageSize) }
  }

  let lastRows = []
  function render() {
    const rows = viewRows()
    lastRows = rows
    const { pages, start, end } = pageBounds(rows.length)
    const current = rows.slice(start, end)

    host.className = `yv-grid yv-theme-${theme}${opts.wrap ? " yv-wrap" : ""}${opts.className ? " " + opts.className : ""}`
    host.setAttribute("aria-busy", String(loading))
    info.textContent = `${rows.length.toLocaleString(numberLocale)} ${t.rows}${selectable ? ` · ${selected.size.toLocaleString(numberLocale)} ${t.selected}` : ""}`
    viewBtn.innerHTML = icon(isCards() ? "grid" : "cards", 18)
    viewBtn.setAttribute("aria-label", isCards() ? t.tableView : t.cardView)
    viewBtn.title = isCards() ? t.tableView : t.cardView
    renderFilterBar()

    const hadFocus = body.contains(document.activeElement)
    body.replaceChildren(loading ? h("div", { class: "yv-loading", role: "status" }, t.loading) : isCards() ? renderCards(current, start) : renderTable(current, start, rows.length))
    if (hadFocus && !loading) restoreFocus()
    renderPager(rows.length, pages, start, end)
  }

  function renderTable(current, start, total) {
    const visibleCols = columns
    const colCount = visibleCols.length + (selectable ? 1 : 0)
    const table = h("table", {
      class: "yv-table",
      role: "grid",
      "aria-labelledby": ids.title,
      "aria-rowcount": total + 1,
      "aria-colcount": colCount,
      "aria-multiselectable": selectable ? "true" : null,
    })
    const headRow = h("tr", { role: "row", "aria-rowindex": 1 })
    if (selectable) {
      const all = current.length > 0 && current.every((r) => selected.has(keyOf(r)))
      const some = current.some((r) => selected.has(keyOf(r)))
      const box = h("input", { type: "checkbox", "data-select-page": "", "aria-label": t.selectPage, tabindex: -1 })
      box.checked = all
      box.indeterminate = !all && some
      headRow.append(h("th", { role: "columnheader", scope: "col", "aria-colindex": 1, tabindex: -1, "data-col": 0 }, h("label", { class: "yv-check" }, box)))
    }
    visibleCols.forEach((c, i) => {
      const colIndex = i + (selectable ? 1 : 0)
      const sorted = sort && sort.key === c.key ? sort.direction : null
      const th = h("th", {
        role: "columnheader",
        scope: "col",
        "aria-colindex": colIndex + 1,
        "aria-sort": c.sortable ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : null,
        class: c.align !== "left" ? `yv-align-${c.align}` : null,
        tabindex: -1,
        "data-col": colIndex,
      })
      if (c.width) th.style.width = typeof c.width === "number" ? `${c.width}px` : c.width
      if (c.sortable) {
        const btn = h("button", { type: "button", class: "yv-sortbtn", "data-sort": c.key, tabindex: -1 }, c.label)
        btn.insertAdjacentHTML("beforeend", icon(sorted === "asc" ? "sortUp" : sorted === "desc" ? "sortDown" : "sort", 14))
        th.append(btn)
      } else th.append(c.label)
      headRow.append(th)
    })
    const tbody = h("tbody")
    if (!current.length) {
      const empty = opts.empty instanceof Node ? opts.empty.cloneNode(true) : document.createTextNode(opts.empty ? String(opts.empty) : t.noData)
      tbody.append(h("tr", { role: "row", "aria-rowindex": 2 }, h("td", { role: "gridcell", class: "yv-empty", colspan: colCount, tabindex: -1, "data-col": 0 }, empty)))
    }
    current.forEach((row, i) => {
      const key = keyOf(row)
      const isSel = selected.has(key)
      const isHl = highlights.has(key)
      const tr = h("tr", {
        role: "row",
        "aria-rowindex": start + i + 2,
        "aria-selected": selectable ? String(isSel) : null,
        "data-yuktai-row-id": key,
        class: isHl ? "yv-hl" : null,
      })
      if (selectable) {
        const box = h("input", { type: "checkbox", "data-select": key, "aria-label": t.selectRow(titleOf(row)), tabindex: -1 })
        box.checked = isSel
        tr.append(h("td", { role: "gridcell", "aria-colindex": 1, tabindex: -1, "data-col": 0 }, h("label", { class: "yv-check" }, box)))
      }
      visibleCols.forEach((c, ci) => {
        const colIndex = ci + (selectable ? 1 : 0)
        const td = h("td", { role: "gridcell", "aria-colindex": colIndex + 1, tabindex: -1, "data-col": colIndex, class: c.align !== "left" ? `yv-align-${c.align}` : null })
        td.append(cellContent(c, row, start + i))
        if (ci === 0 && isHl) td.append(h("span", { class: "yv-sr" }, ` (${t.highlighted})`))
        tr.append(td)
      })
      tbody.append(tr)
    })
    table.append(h("thead", null, headRow), tbody)
    // roving tabindex: exactly one cell is in the tab order
    const rowsInTable = table.querySelectorAll("tr")
    active.r = Math.min(active.r, rowsInTable.length - 1)
    const cell = cellAt(table, active.r, active.c) || cellAt(table, 0, 0)
    if (cell) cell.setAttribute("tabindex", "0")
    return h("div", { class: "yv-tablewrap" }, table)
  }

  function renderCards(current, start) {
    if (!current.length) {
      const empty = opts.empty instanceof Node ? opts.empty.cloneNode(true) : document.createTextNode(opts.empty ? String(opts.empty) : t.noData)
      return h("div", { class: "yv-empty", role: "status" }, empty)
    }
    const list = h("ul", { class: "yv-cards", "aria-labelledby": ids.title })
    current.forEach((row, i) => {
      const key = keyOf(row)
      const isSel = selected.has(key)
      const isHl = highlights.has(key)
      const headingId = nextId("yv-card")
      const card = h("li", {
        class: `yv-card${isHl ? " yv-hl" : ""}`,
        "data-yuktai-row-id": key,
        "aria-labelledby": headingId,
        "aria-selected": selectable ? String(isSel) : null,
        tabindex: -1,
      })
      const head = h("div", { class: "yv-card-head" }, h("p", { class: "yv-card-title", id: headingId }, titleOf(row), isHl ? h("span", { class: "yv-sr" }, ` (${t.highlighted})`) : null))
      if (selectable) {
        const box = h("input", { type: "checkbox", "data-select": key, "aria-label": t.selectRow(titleOf(row)) })
        box.checked = isSel
        head.append(h("label", { class: "yv-check" }, box))
      }
      const dl = h("dl")
      columns.forEach((c) => {
        if (c.hiddenOnMobile) return
        dl.append(h("dt", null, c.label), h("dd", null, cellContent(c, row, start + i)))
      })
      card.append(head, dl)
      if (typeof opts.onRowClick === "function") {
        card.append(h("button", { type: "button", class: "yv-btn yv-small", "data-open": key, style: "margin-top:8px" }, opts.openLabel || (lang2 === "te" ? "తెరువు" : "Open")))
      }
      list.append(card)
    })
    return list
  }

  function renderFilterBar() {
    filterBar.replaceChildren()
    if (!filters.length) {
      filterBar.hidden = true
      return
    }
    filterBar.hidden = false
    filterBar.setAttribute("aria-label", t.filters(filters.length))
    filterBar.append(h("span", { class: "yv-muted" }, iconEl("filter", 15), " ", t.filters(filters.length)))
    filters.forEach((f, i) => {
      const column = columns.find((c) => c.key === f.key)
      const value = Array.isArray(f.value) ? f.value.map((v) => formatPlain(column || {}, v)).join(" – ") : column ? formatPlain(column, f.value) : String(f.value)
      const text = `${column ? column.label : f.key} ${t.ops[f.operator] || f.operator} ${value}`
      const chip = h("button", { type: "button", class: "yv-chip", "data-remove-filter": i, "aria-label": t.removeFilter(text) }, text, iconEl("close", 14))
      filterBar.append(chip)
    })
    filterBar.append(h("button", { type: "button", class: "yv-btn yv-small", "data-clear-filters": "" }, t.clearFilters))
  }

  function renderPager(total, pages, start, end) {
    pager.replaceChildren()
    if (pagination === false) {
      pager.append(h("span", { class: "yv-muted" }, t.results(total.toLocaleString(numberLocale))))
      return
    }
    const fmt = (n) => n.toLocaleString(numberLocale)
    const left = h("span", { class: "yv-muted" }, total ? t.showing(fmt(start + 1), fmt(end), fmt(total)) : t.showing(0, 0, 0))
    const controls = h("div", { class: "yv-pages" })
    if (pagination.showSizeChanger !== false) {
      const selectId = nextId("yv-size")
      const select = h("select", { id: selectId, "data-page-size": "" }, ...sizeOptions.map((n) => h("option", { value: n, selected: n === pageSize }, String(n))))
      controls.append(h("label", { for: selectId, class: "yv-muted" }, t.pageSize), select)
    }
    const nav = (name, labelText, disabled, action) => {
      const b = h("button", { type: "button", class: "yv-btn yv-icon", "aria-label": labelText, title: labelText, disabled, "data-page": action })
      b.innerHTML = icon(name, 18)
      return b
    }
    controls.append(
      nav("first", t.first, page <= 1, "first"),
      nav("left", t.previous, page <= 1, "prev"),
      h("span", { class: "yv-muted", "aria-current": "page" }, t.page(fmt(page), fmt(pages))),
      nav("right", t.next, page >= pages, "next"),
      nav("last", t.last, page >= pages, "last")
    )
    pager.append(left, controls)
  }

  // ── keyboard grid navigation ──
  function cellAt(table, r, c) {
    const row = table.querySelectorAll("tr")[r]
    if (!row) return null
    const cells = row.querySelectorAll("th,td")
    return cells[Math.min(c, cells.length - 1)] || null
  }

  function focusCell(r, c) {
    const table = body.querySelector("table")
    if (!table) return
    const rows = table.querySelectorAll("tr")
    r = Math.max(0, Math.min(r, rows.length - 1))
    const cells = rows[r].querySelectorAll("th,td")
    c = Math.max(0, Math.min(c, cells.length - 1))
    table.querySelectorAll('[tabindex="0"]').forEach((el) => el.setAttribute("tabindex", "-1"))
    const cell = cells[c]
    cell.setAttribute("tabindex", "0")
    active = { r, c }
    cell.focus()
  }

  function restoreFocus() {
    const table = body.querySelector("table")
    if (table) focusCell(active.r, active.c)
    else {
      const first = body.querySelector(".yv-card")
      if (first) first.focus()
    }
  }

  function onGridKey(e) {
    const table = body.querySelector("table")
    const cell = e.target.closest && e.target.closest("th,td")
    if (!table || !cell || !table.contains(cell)) return
    const row = cell.parentElement
    const r = Array.prototype.indexOf.call(table.querySelectorAll("tr"), row)
    const c = Array.prototype.indexOf.call(row.querySelectorAll("th,td"), cell)
    const lastRow = table.querySelectorAll("tr").length - 1
    let handled = true
    switch (e.key) {
      case "ArrowRight":
        focusCell(r, c + 1)
        break
      case "ArrowLeft":
        focusCell(r, c - 1)
        break
      case "ArrowDown":
        focusCell(r + 1, c)
        break
      case "ArrowUp":
        focusCell(r - 1, c)
        break
      case "Home":
        e.ctrlKey ? focusCell(0, 0) : focusCell(r, 0)
        break
      case "End":
        e.ctrlKey ? focusCell(lastRow, 999) : focusCell(r, 999)
        break
      case "PageDown":
        if (pagination !== false) {
          active = { r: Math.max(1, r), c }
          goTo(page + 1, true)
        }
        break
      case "PageUp":
        if (pagination !== false) {
          active = { r: Math.max(1, r), c }
          goTo(page - 1, true)
        }
        break
      case "Enter":
      case " ": {
        const sortBtn = cell.querySelector("[data-sort]")
        const box = cell.querySelector("input[type=checkbox]")
        if (sortBtn) toggleSort(sortBtn.getAttribute("data-sort"))
        else if (box) box.click()
        else if (e.key === "Enter" && row.hasAttribute("data-yuktai-row-id") && typeof opts.onRowClick === "function") openRowByKey(row.getAttribute("data-yuktai-row-id"))
        else if (e.key === " " && selectable && row.hasAttribute("data-yuktai-row-id")) toggleSelect(row.getAttribute("data-yuktai-row-id"))
        else handled = false
        break
      }
      default:
        handled = false
    }
    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // ── actions ──
  function toggleSort(key) {
    const column = columns.find((c) => c.key === key)
    if (!column || !column.sortable) return
    if (!sort || sort.key !== key) sort = { key, direction: "asc" }
    else if (sort.direction === "asc") sort = { key, direction: "desc" }
    else sort = null
    page = 1
    const table = body.querySelector("table")
    if (table && body.contains(document.activeElement)) active = { r: 0, c: active.c }
    render()
    say(sort ? (sort.direction === "asc" ? t.sortedAsc(column.label) : t.sortedDesc(column.label)) : t.sortCleared)
    opts.onSortChange && opts.onSortChange(sort ? { key: sort.key, direction: sort.direction } : null)
  }

  function emitSelection() {
    opts.onSelectionChange && opts.onSelectionChange(Array.from(selected))
    host.dispatchEvent(new CustomEvent("yuktai:selection", { detail: { keys: Array.from(selected) }, bubbles: true }))
  }

  function toggleSelect(key, force) {
    const on = force === undefined ? !selected.has(key) : force
    on ? selected.add(key) : selected.delete(key)
    render()
    emitSelection()
  }

  function goTo(n, keepFocus) {
    const { pages } = pageBounds(lastRows.length)
    const next = Math.min(Math.max(1, n), pages)
    if (next === page && !keepFocus) return
    page = next
    render()
    say(t.page(page, pages))
    if (keepFocus && body.querySelector("table")) restoreFocus()
  }

  function openRowByKey(key) {
    const row = data.find((r) => keyOf(r) === String(key))
    if (!row) return false
    if (typeof opts.onRowClick === "function") opts.onRowClick(row, data.indexOf(row))
    if (typeof opts.onOpenRow === "function") opts.onOpenRow(String(key))
    return true
  }

  function setHighlights(list, scroll = autoScroll) {
    highlights.clear()
    ;(list || []).forEach((item) => highlights.add(typeof item === "object" && item !== null ? keyOf(item) : String(item)))
    if (scroll && highlights.size) {
      const index = lastRows.length ? lastRows.findIndex((r) => highlights.has(keyOf(r))) : viewRows().findIndex((r) => highlights.has(keyOf(r)))
      if (index >= 0 && pagination !== false) page = Math.floor(index / pageSize) + 1
    }
    render()
    if (scroll && highlights.size) {
      const first = body.querySelector(".yv-hl")
      if (first && first.scrollIntoView) first.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" })
    }
  }

  // ── events (delegated, so re-rendering never loses listeners) ──
  let searchTimer = null
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      query = searchInput.value.trim()
      page = 1
      render()
      say(t.results(lastRows.length.toLocaleString(numberLocale)))
    }, 160)
  })
  host.addEventListener("click", (e) => {
    const el = e.target.closest("button, input, tr[data-yuktai-row-id]")
    if (!el || !host.contains(el)) return
    if (el.matches("[data-sort]")) return toggleSort(el.getAttribute("data-sort"))
    if (el.matches("[data-page]")) {
      const action = el.getAttribute("data-page")
      const { pages } = pageBounds(lastRows.length)
      return goTo(action === "first" ? 1 : action === "prev" ? page - 1 : action === "next" ? page + 1 : pages)
    }
    if (el.matches("[data-remove-filter]")) {
      filters = filters.filter((_, i) => i !== Number(el.getAttribute("data-remove-filter")))
      page = 1
      render()
      opts.onFiltersChange && opts.onFiltersChange(filters.slice())
      return
    }
    if (el.matches("[data-clear-filters]")) return api.clearFilters()
    if (el.matches("[data-open]")) return openRowByKey(el.getAttribute("data-open"))
    if (el === viewBtn) {
      view = isCards() ? "table" : "card"
      render()
      return
    }
    if (el === exportBtn) return api.exportCSV()
    if (el.matches("tr[data-yuktai-row-id]") && typeof opts.onRowClick === "function" && !e.target.closest("label,input,button,a")) {
      openRowByKey(el.getAttribute("data-yuktai-row-id"))
    }
  })
  host.addEventListener("change", (e) => {
    const el = e.target
    if (el.matches("[data-select]")) {
      el.checked ? selected.add(el.getAttribute("data-select")) : selected.delete(el.getAttribute("data-select"))
      render()
      emitSelection()
    } else if (el.matches("[data-select-page]")) {
      const { start, end } = pageBounds(lastRows.length)
      lastRows.slice(start, end).forEach((r) => (el.checked ? selected.add(keyOf(r)) : selected.delete(keyOf(r))))
      render()
      emitSelection()
    } else if (el.matches("[data-page-size]")) {
      pageSize = Number(el.value) || pageSize
      page = 1
      render()
      body.closest(".yv-grid").querySelector("[data-page-size]").focus()
    }
  })
  body.addEventListener("keydown", onGridKey)
  body.addEventListener("focusin", (e) => {
    const table = body.querySelector("table")
    const cell = e.target.closest && e.target.closest("th,td")
    if (!table || !cell) return
    const row = cell.parentElement
    const r = Array.prototype.indexOf.call(table.querySelectorAll("tr"), row)
    const c = Array.prototype.indexOf.call(row.querySelectorAll("th,td"), cell)
    if (r < 0 || c < 0) return
    table.querySelectorAll('[tabindex="0"]').forEach((el) => el !== cell && el.setAttribute("tabindex", "-1"))
    cell.setAttribute("tabindex", "0")
    active = { r, c }
  })

  // responsive card view
  let resizeObserver = null
  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0] && entries[0].contentRect.width
      const next = width > 0 && width < breakpoint
      if (next !== narrow) {
        narrow = next
        if (view === "auto") render()
      }
    })
    resizeObserver.observe(host)
  }

  // ── tools, assistant, WebMCP, agentic bar ──
  const toolContext = {
    get data() {
      return data
    },
    get columns() {
      return toolColumns
    },
    rowKey,
    locale: toolLocale,
    get filters() {
      return filters
    },
    onHighlightRows: (list) => setHighlights(list),
    onSelectRow: (id) => {
      selected.add(String(id))
      setHighlights([String(id)])
      emitSelection()
    },
    onOpenRow: typeof opts.onRowClick === "function" || typeof opts.onOpenRow === "function" ? (id) => openRowByKey(id) : undefined,
    onFiltersChange: (next) => {
      filters = next.slice()
      page = 1
      render()
      opts.onFiltersChange && opts.onFiltersChange(filters.slice())
    },
    onSortChange: (next) => {
      sort = next ? { key: next.key, direction: next.direction === "desc" ? "desc" : "asc" } : null
      page = 1
      render()
      opts.onSortChange && opts.onSortChange(sort)
    },
  }
  let toolList = createGridTools(toolContext, { name: opts.toolName || "yuktai_grid", descriptions: opts.toolDescriptions })

  const agent = createGridAgent({
    tools: () => toolList,
    data: () => data,
    columns: () => toolColumns.map((c) => ({ key: c.key, label: c.label })),
    rowKey,
    locale: toolLocale,
    customRules: opts.customRules || [],
    parseIntent: opts.parseIntent,
    historyLimit: opts.historyLimit || 20,
    onResult: (r) => {
      if (opts.onAgentResult) opts.onAgentResult({ success: r.success, message: r.message, tool: r.tool })
    },
    onError: opts.onAgentError,
  })

  let webmcp = { status: { state: "unsupported", registered: [], errors: [] }, unregister() {} }
  if (opts.webmcp) {
    webmcp = registerWebMCP(() => toolList, {
      onStatusChange: (s) => {
        opts.onWebMCPStatusChange && opts.onWebMCPStatusChange(s)
        host.dispatchEvent(new CustomEvent("yuktai:webmcp", { detail: s, bubbles: true }))
      },
    })
  }

  const agentic = createAgenticGrid({
    data,
    columns: toolColumns,
    rowKey,
    referenceDate: opts.referenceDate,
    onOpenRow: toolContext.onOpenRow,
    bind: {
      getData: () => data,
      getFilters: () => filters,
      getSort: () => sort,
      getHighlightIds: () => Array.from(highlights),
      setFilters: (f) => toolContext.onFiltersChange(f),
      setSort: (s) => toolContext.onSortChange(s),
      setHighlightIds: (list) => setHighlights(list),
      selectRow: (id) => toolContext.onSelectRow(id),
    },
  })

  let assistant = null
  if (opts.ai) {
    assistant = mountGridAssistant(slot, agent, {
      locale: toolLocale,
      inputLanguage: opts.inputLanguage || (toolLocale === "te" ? "te-IN" : "en-IN"),
      examples: opts.assistantExamples,
      webmcp: () => webmcp.status,
      showWebMCP: !!opts.webmcp,
    })
    if (opts.webmcp) host.addEventListener("yuktai:webmcp", () => assistant && assistant.refreshStatus())
  }
  let bar = null
  if (opts.agentic) {
    const barOpts = typeof opts.agentic === "object" ? opts.agentic : {}
    bar = mountAgenticGridBar(slot, agentic, barOpts)
  }

  // ── public API ──
  const api = {
    element: host,
    host,
    /** Tools shared by the assistant and WebMCP (createGridTools). */
    get tools() {
      return toolList
    },
    agent,
    agentic,
    get webmcpStatus() {
      return webmcp.status
    },

    // data
    refresh(nextRows) {
      if (Array.isArray(nextRows)) {
        data = nextRows.slice()
        selected.clear()
        highlights.clear()
        page = 1
      }
      render()
      return api
    },
    setData(nextRows, nextColumns) {
      if (Array.isArray(nextColumns)) {
        columns = normaliseColumns(nextColumns, nextRows || data)
        toolColumns = toGridToolColumns(columns)
        toolList = createGridTools(toolContext, { name: opts.toolName || "yuktai_grid", descriptions: opts.toolDescriptions })
      }
      return api.refresh(nextRows)
    },
    getData: () => data.slice(),
    getRows: () => viewRows(),
    getPageRows() {
      const rows = viewRows()
      const { start, end } = pageBounds(rows.length)
      return rows.slice(start, end)
    },

    // selection
    getSelectedRows: () => data.filter((r) => selected.has(keyOf(r))),
    getSelectedKeys: () => Array.from(selected),
    select(keys, on = true) {
      ;[].concat(keys).forEach((k) => (on ? selected.add(String(k)) : selected.delete(String(k))))
      render()
      emitSelection()
      return api
    },
    clearSelection() {
      selected.clear()
      render()
      emitSelection()
      return api
    },

    // search, filter, sort
    search(text) {
      query = String(text || "").trim()
      searchInput.value = query
      page = 1
      render()
      return lastRows.length
    },
    setFilters(next) {
      toolContext.onFiltersChange(Array.isArray(next) ? next : [])
      return api
    },
    addFilter(filter) {
      return agent.executeTool("filter", filter)
    },
    getFilters: () => filters.slice(),
    clearFilters() {
      toolContext.onFiltersChange([])
      say(lang2 === "te" ? "ఫిల్టర్లు తీసేశారు" : "Filters cleared")
      return api
    },
    sortBy(key, direction = "asc") {
      toolContext.onSortChange(key ? { key, direction } : null)
      return api
    },
    clearSort() {
      toolContext.onSortChange(null)
      return api
    },
    getSort: () => (sort ? { ...sort } : null),

    // highlight
    highlight(list, scroll) {
      setHighlights(list, scroll === undefined ? autoScroll : scroll)
      return api
    },
    clearHighlight() {
      setHighlights([], false)
      return api
    },
    getHighlightIds: () => Array.from(highlights),

    // pages and view
    goToPage(n) {
      goTo(Number(n) || 1)
      return api
    },
    nextPage() {
      goTo(page + 1)
      return api
    },
    prevPage() {
      goTo(page - 1)
      return api
    },
    getPage: () => ({ page, pageSize, pages: pageBounds(lastRows.length).pages, total: lastRows.length }),
    setPageSize(n) {
      pageSize = Number(n) || pageSize
      if (!sizeOptions.includes(pageSize)) sizeOptions.push(pageSize), sizeOptions.sort((a, b) => a - b)
      page = 1
      render()
      return api
    },
    setTheme(next) {
      theme = THEMES.includes(next) ? next : "default"
      render()
      return api
    },
    getTheme: () => theme,
    setView(next) {
      view = ["table", "card", "auto"].includes(next) ? next : "auto"
      render()
      return api
    },
    setLoading(on) {
      loading = !!on
      render()
      return api
    },
    openRow: (key) => openRowByKey(key),

    // agents
    /** Smart question: grid query, BI insight or multi-step task (useAgenticGrid). */
    async ask(question) {
      const s = await agentic.ask(question)
      return s.answer
    },
    /** Same, but returns the full state: { answer, kind, table, steps, ... } */
    askDetailed: (question) => agentic.ask(question),
    /** Built-in assistant pipeline: custom rules → phrase parser → tool. */
    assistantAsk: (text) => agent.ask(text),
    executeTool: (name, input) => agent.executeTool(name, input),
    biSummary: () => summarizeRows(viewRows(), toolColumns),
    anomalies: () => detectAnomalies(viewRows(), toolColumns, { rowKey }),
    async runTasks(text) {
      const s = await agentic.ask(text)
      return s.answer
    },
    reset() {
      agentic.reset()
      query = ""
      searchInput.value = ""
      render()
      return api
    },

    exportCSV(filename = opts.exportFileName || "yuktai-grid-export.csv") {
      const rows = selected.size ? data.filter((r) => selected.has(keyOf(r))) : viewRows()
      const csv = "﻿" + [columns.map((c) => csvCell(c.label)).join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(","))].join("\r\n")
      downloadText(filename, csv, "text/csv;charset=utf-8")
      announce(`${rows.length} row(s) exported`)
      return rows.length
    },

    destroy() {
      clearTimeout(searchTimer)
      clearTimeout(statusTimer)
      resizeObserver && resizeObserver.disconnect()
      webmcp.unregister()
      assistant && assistant.destroy()
      bar && bar.destroy()
      host.remove()
    },
  }

  if (typeof opts.onReady === "function") opts.onReady(api)
  render()
  return api
}

/* ───────────────────────── built-in grid assistant (chat + voice) ───────────────────────── */

const ASSISTANT_TEXT = {
  en: {
    title: "Ask the grid",
    hint: "Type or speak: a word to search, “sort by <column>”, “how many”, “clear filters”, “open <name>”.",
    placeholder: "Ask the grid…",
    ask: "Ask",
    listen: "Speak",
    stop: "Stop",
    listening: "Listening…",
    noVoice: "Voice input is not available in this browser. Type your question instead.",
    history: "History",
    clear: "Clear history",
    webmcp: { unsupported: "WebMCP: not available in this browser (no document.modelContext).", registering: "WebMCP: registering tools…", ready: "WebMCP: tools ready", partial: "WebMCP: some tools failed", error: "WebMCP: registration failed" },
  },
  te: {
    title: "గ్రిడ్‌ను అడగండి",
    hint: "టైప్ చేయండి లేదా మాట్లాడండి: వెతకాల్సిన పదం, “<కాలమ్> ప్రకారం క్రమం”, “ఎన్ని”, “ఫిల్టర్లు తీసేయి”.",
    placeholder: "గ్రిడ్‌ను అడగండి…",
    ask: "అడుగు",
    listen: "మాట్లాడు",
    stop: "ఆపు",
    listening: "వింటున్నాను…",
    noVoice: "ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ లేదు. టైప్ చేయండి.",
    history: "చరిత్ర",
    clear: "చరిత్ర తీసేయి",
    webmcp: { unsupported: "WebMCP: ఈ బ్రౌజర్‌లో లేదు.", registering: "WebMCP: నమోదు చేస్తోంది…", ready: "WebMCP: సిద్ధం", partial: "WebMCP: కొన్ని విఫలం", error: "WebMCP: విఫలం" },
  },
}

export function mountGridAssistant(container, agent, options = {}) {
  const t = ASSISTANT_TEXT[options.locale === "te" ? "te" : "en"]
  const inputId = nextId("yv-ask")
  const hintId = nextId("yv-hint")
  const input = h("input", { id: inputId, class: "yv-input", type: "text", placeholder: t.placeholder, autocomplete: "off", "aria-describedby": hintId })
  const askBtn = h("button", { type: "submit", class: "yv-btn yv-primary" }, iconEl("spark", 16), t.ask)
  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const micBtn = h("button", { type: "button", class: "yv-btn", "aria-pressed": "false" }, iconEl("mic", 16), t.listen)
  const answer = h("div", { class: "yv-answer", role: "status", "aria-live": "polite" })
  const historyList = h("ol")
  const historyBox = h("details", { class: "yv-history" }, h("summary", null, t.history), historyList, h("button", { type: "button", class: "yv-btn yv-small", "data-clear-history": "" }, t.clear))
  const webmcpLine = options.showWebMCP ? h("p", { class: "yv-muted", style: "margin:8px 0 0" }) : null
  const examples = options.examples || (options.locale === "te" ? ["ఎన్ని", "ఫిల్టర్లు తీసేయి"] : ["how many", "clear filters", "clear sort"])
  const chips = h("div", { class: "yv-chips" }, ...examples.map((x) => h("button", { type: "button", class: "yv-chip", "data-example": x }, x)))
  const form = h("form", { class: "yv-row", role: "search", "aria-label": t.title }, h("label", { for: inputId, class: "yv-sr" }, t.title), input, askBtn, micBtn)
  const box = h("section", { class: "yv-box yv-assistant", "aria-label": t.title }, h("h3", null, iconEl("chat", 16), " ", t.title), h("p", { id: hintId, class: "yv-muted", style: "margin:0 0 8px" }, t.hint), form, chips, answer, historyBox, webmcpLine)
  container.appendChild(box)

  async function run(text) {
    const q = String(text || "").trim()
    if (!q) return
    askBtn.disabled = true
    try {
      const result = await agent.ask(q)
      answer.textContent = result.message
      answer.className = `yv-answer ${result.success ? "" : "yv-fail"}`
    } finally {
      askBtn.disabled = false
    }
  }

  const unsubscribe = agent.subscribe((state) => {
    historyList.replaceChildren(
      ...state.history
        .slice()
        .reverse()
        .map((step) => h("li", null, h("span", { class: step.result.success ? "yv-ok" : "yv-fail" }, step.result.success ? "✓ " : "✗ "), step.result.message, h("span", { class: "yv-muted" }, ` (${step.tool})`)))
    )
    historyBox.querySelector("summary").textContent = `${t.history} (${state.history.length})`
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    run(input.value)
  })
  box.addEventListener("click", (e) => {
    const el = e.target.closest("[data-example],[data-clear-history]")
    if (!el) return
    if (el.hasAttribute("data-example")) {
      input.value = el.getAttribute("data-example")
      run(input.value)
    } else {
      agent.clearHistory()
      answer.textContent = ""
    }
  })

  let recognition = null
  micBtn.addEventListener("click", () => {
    if (!SR) {
      answer.textContent = t.noVoice
      return
    }
    if (recognition) {
      recognition.stop()
      return
    }
    recognition = new SR()
    recognition.lang = options.inputLanguage || "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    micBtn.setAttribute("aria-pressed", "true")
    micBtn.lastChild.textContent = t.stop
    answer.textContent = t.listening
    recognition.onresult = (e) => {
      const phrase = e.results[0][0].transcript
      input.value = phrase
      run(phrase)
    }
    recognition.onerror = (e) => {
      answer.textContent = `${t.noVoice} (${e.error})`
    }
    recognition.onend = () => {
      recognition = null
      micBtn.setAttribute("aria-pressed", "false")
      micBtn.lastChild.textContent = t.listen
    }
    try {
      recognition.start()
    } catch (error) {
      answer.textContent = `${t.noVoice} (${error.message})`
      recognition = null
    }
  })
  if (!SR) micBtn.title = t.noVoice

  function refreshStatus() {
    if (!webmcpLine || !options.webmcp) return
    const s = options.webmcp()
    webmcpLine.textContent = t.webmcp[s.state] + (s.registered && s.registered.length ? ` (${s.registered.length})` : "")
  }
  refreshStatus()

  return {
    element: box,
    ask: run,
    refreshStatus,
    destroy() {
      unsubscribe()
      recognition && recognition.stop()
      box.remove()
    },
  }
}

export { esc }
