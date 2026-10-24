/*! yuktai vanilla 5.3.0 — accessible data grid, page agents and WCAG tools for plain HTML.
 *  No framework, no API keys, runs in the browser. ISC © Sandeep Miriyala, Yuktishaalaa AI Lab.
 *  Built from github.com/sandeepmiriyala03/yuktai (vanilla/src + src/agentic, src/grid, src/core). */
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // vanilla/src/core.js
  var core_exports = {};
  __export(core_exports, {
    AUDIT_RULES: () => AUDIT_RULES,
    DEFAULT_A11Y_SETTINGS: () => DEFAULT_A11Y_SETTINGS,
    FONT_MAX: () => FONT_MAX,
    FONT_MIN: () => FONT_MIN,
    FONT_STEP: () => FONT_STEP,
    accessibleName: () => accessibleName,
    aggregate: () => aggregate,
    analyzePage: () => analyzePage,
    answerGridQuestion: () => answerGridQuestion,
    applyGridFilters: () => applyGridFilters,
    askAboutPage: () => askAboutPage,
    askInsight: () => askInsight,
    auditToJSON: () => auditToJSON,
    auditToMarkdown: () => auditToMarkdown,
    clearFilters: () => clearFilters,
    clearSort: () => clearSort,
    comparePeriods: () => comparePeriods,
    contrastRatio: () => contrastRatio,
    countGrid: () => countGrid,
    createA11yCopilot: () => createA11yCopilot,
    createContextIndex: () => createContextIndex,
    createGridTools: () => createGridTools,
    createVoiceA11yController: () => createVoiceA11yController,
    detectAnomalies: () => detectAnomalies,
    detectPageIntent: () => detectPageIntent,
    executeGridQuery: () => executeGridQuery,
    filterGrid: () => filterGrid,
    findMentionedColumn: () => findMentionedColumn,
    getColumns: () => getColumns,
    getRow: () => getRow,
    getRowId: () => getRowId,
    gridPassages: () => gridPassages,
    groupBy: () => groupBy,
    highlightRows: () => highlightRows,
    moveGridRowFocus: () => moveGridRowFocus,
    openRow: () => openRow,
    pagePassages: () => pagePassages,
    parseAmount: () => parseAmount,
    parseColor: () => parseColor,
    parseGridQuery: () => parseGridQuery,
    parseVoiceA11yCommand: () => parseVoiceA11yCommand,
    planTasks: () => planTasks,
    readFormFields: () => readFormFields,
    relativeLuminance: () => relativeLuminance,
    reviewDesign: () => reviewDesign,
    reviewForm: () => reviewForm,
    reviewForms: () => reviewForms,
    runGridQuery: () => runGridQuery,
    runQaAudit: () => runQaAudit,
    runTasks: () => runTasks,
    searchGrid: () => searchGrid,
    selectRow: () => selectRow,
    sortGrid: () => sortGrid,
    summarizeRows: () => summarizeRows,
    toGridToolColumns: () => toGridToolColumns,
    tokenize: () => tokenize,
    trend: () => trend,
    wcagPlugin: () => wcagPlugin
  });

  // src/grid/gridTools.ts
  var MESSAGES = {
    en: {
      found: (n) => `${n} row(s) found.`,
      count: (n) => `${n} row(s).`,
      columns: "Grid columns retrieved.",
      rowFound: "Row found.",
      notFound: (id) => `Row "${id}" not found.`,
      noneFound: "None of the given rows were found.",
      highlighted: (n) => `${n} row(s) highlighted.`,
      selected: (id) => `Row "${id}" selected.`,
      opened: (id) => `Row "${id}" opened.`,
      notSupported: (action) => `This grid does not support "${action}".`,
      emptyQuery: "Please enter something to search.",
      noIds: "No row IDs were given.",
      unknownColumn: (key) => `Unknown column "${key}".`,
      badOperator: (op) => `Unknown filter operator "${op}".`,
      badValue: "The filter value is not valid for this column.",
      filtered: (n) => `Filter applied: ${n} row(s) match.`,
      filtersCleared: "All filters cleared.",
      sorted: (label, dir) => `Sorted by ${label} (${dir === "asc" ? "ascending" : "descending"}).`,
      sortCleared: "Sorting cleared.",
      internal: "Something went wrong while running this action."
    },
    te: {
      found: (n) => `${n} \u0C35\u0C30\u0C41\u0C38(\u0C32\u0C41) \u0C26\u0C4A\u0C30\u0C3F\u0C15\u0C3E\u0C2F\u0C3F.`,
      count: (n) => `\u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 ${n} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41.`,
      columns: "\u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C32 \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41.",
      rowFound: "\u0C35\u0C30\u0C41\u0C38 \u0C26\u0C4A\u0C30\u0C3F\u0C15\u0C3F\u0C02\u0C26\u0C3F.",
      notFound: (id) => `"${id}" \u0C35\u0C30\u0C41\u0C38 \u0C26\u0C4A\u0C30\u0C15\u0C32\u0C47\u0C26\u0C41.`,
      noneFound: "\u0C07\u0C1A\u0C4D\u0C1A\u0C3F\u0C28 \u0C35\u0C30\u0C41\u0C38\u0C32\u0C47\u0C35\u0C40 \u0C26\u0C4A\u0C30\u0C15\u0C32\u0C47\u0C26\u0C41.",
      highlighted: (n) => `${n} \u0C35\u0C30\u0C41\u0C38(\u0C32\u0C41) \u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D \u0C1A\u0C47\u0C36\u0C3E\u0C28\u0C41.`,
      selected: (id) => `"${id}" \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.`,
      opened: (id) => `"${id}" \u0C24\u0C46\u0C30\u0C3F\u0C1A\u0C3E\u0C28\u0C41.`,
      notSupported: (action) => `\u0C08 \u0C2A\u0C1F\u0C4D\u0C1F\u0C3F\u0C15\u0C32\u0C4B "${action}" \u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C32\u0C47\u0C26\u0C41.`,
      emptyQuery: "\u0C35\u0C46\u0C24\u0C15\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C0F\u0C26\u0C48\u0C28\u0C3E \u0C30\u0C3E\u0C2F\u0C02\u0C21\u0C3F.",
      noIds: "\u0C35\u0C30\u0C41\u0C38 ID\u0C32\u0C41 \u0C07\u0C35\u0C4D\u0C35\u0C32\u0C47\u0C26\u0C41.",
      unknownColumn: (key) => `"${key}" \u0C05\u0C28\u0C47 \u0C15\u0C3E\u0C32\u0C2E\u0C4D \u0C32\u0C47\u0C26\u0C41.`,
      badOperator: (op) => `"${op}" \u0C05\u0C28\u0C47 \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C3F\u0C27\u0C3E\u0C28\u0C02 \u0C32\u0C47\u0C26\u0C41.`,
      badValue: "\u0C08 \u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C15\u0C3F \u0C08 \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C3F\u0C32\u0C41\u0C35 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C26\u0C41.",
      filtered: (n) => `\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C35\u0C47\u0C36\u0C3E\u0C28\u0C41: ${n} \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C2F\u0C3E\u0C2F\u0C3F.`,
      filtersCleared: "\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C28\u0C4D\u0C28\u0C40 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C28\u0C41.",
      sorted: (label, dir) => `${label} \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02 (${dir === "asc" ? "\u0C06\u0C30\u0C4B\u0C39\u0C23" : "\u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23"}).`,
      sortCleared: "\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C28\u0C41.",
      internal: "\u0C08 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C21\u0C17\u0C3E \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F."
    }
  };
  function msg(context) {
    return MESSAGES[context.locale ?? "en"];
  }
  function ok(message, data) {
    return { success: true, message, data };
  }
  function fail(code, message) {
    return { success: false, message, error: { code } };
  }
  var OPERATORS = [
    "contains",
    "equals",
    "startsWith",
    "endsWith",
    "greaterThan",
    "lessThan",
    "between"
  ];
  function getRowId(row, rowKey = "id") {
    const value = row == null ? void 0 : row[rowKey];
    return value === void 0 || value === null ? "" : String(value);
  }
  function normalizeText(value) {
    return String(value ?? "").normalize("NFC").toLowerCase().trim();
  }
  function toNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const text = String(value ?? "").trim();
    if (text === "") return null;
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }
  function toTime(value) {
    if (value instanceof Date) return value.getTime();
    const t = new Date(String(value ?? "")).getTime();
    return Number.isFinite(t) ? t : null;
  }
  function toIdList(value) {
    const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    return list.map((v) => String(v).trim()).filter(Boolean);
  }
  function findColumn(context, key) {
    const wanted = normalizeText(key);
    return context.columns.find(
      (c) => normalizeText(c.key) === wanted || normalizeText(c.label) === wanted
    );
  }
  function findRow(context, id) {
    return context.data.find((row) => getRowId(row, context.rowKey) === id);
  }
  function cellValue(row, key) {
    return row[key];
  }
  function matchesFilter(row, filter, column) {
    const raw = cellValue(row, column.key);
    const kind = column.type ?? "text";
    if (kind === "number" || kind === "date") {
      const read = kind === "number" ? toNumber : toTime;
      const cell = read(raw);
      if (cell === null) return false;
      if (filter.operator === "between") {
        const [a, b] = filter.value;
        const lo = read(a);
        const hi = read(b);
        return lo !== null && hi !== null && cell >= Math.min(lo, hi) && cell <= Math.max(lo, hi);
      }
      const target2 = read(filter.value);
      if (target2 === null) return false;
      switch (filter.operator) {
        case "equals":
          return cell === target2;
        case "greaterThan":
          return cell > target2;
        case "lessThan":
          return cell < target2;
        default:
          break;
      }
    }
    const text = normalizeText(raw);
    const target = normalizeText(filter.value);
    switch (filter.operator) {
      case "equals":
        return text === target;
      case "startsWith":
        return text.startsWith(target);
      case "endsWith":
        return text.endsWith(target);
      case "contains":
        return text.includes(target);
      default:
        return false;
    }
  }
  function isValidFilter(filter, column) {
    const kind = column.type ?? "text";
    const read = kind === "date" ? toTime : toNumber;
    if (filter.operator === "between") {
      if (kind === "text" || !Array.isArray(filter.value) || filter.value.length !== 2) return false;
      return read(filter.value[0]) !== null && read(filter.value[1]) !== null;
    }
    if (filter.operator === "greaterThan" || filter.operator === "lessThan") {
      return kind !== "text" && read(filter.value) !== null;
    }
    return !Array.isArray(filter.value) && String(filter.value).trim() !== "";
  }
  function applyGridFilters(data, columns, filters) {
    if (!filters.length) return data;
    return applyFilters({ data, columns }, filters);
  }
  function toGridToolColumns(columns) {
    return columns.map((c) => ({
      key: String(c.key),
      label: c.label,
      type: c.type === "number" ? "number" : c.type === "date" ? "date" : "text"
    }));
  }
  function applyFilters(context, filters) {
    return context.data.filter(
      (row) => filters.every((f) => {
        const column = findColumn(context, f.key);
        return column ? matchesFilter(row, f, column) : true;
      })
    );
  }
  function searchGrid(context, query) {
    var _a;
    const m = msg(context);
    const text = normalizeText(query);
    if (!text) return fail("INVALID_INPUT", m.emptyQuery);
    const rows = context.data.filter(
      (row) => context.columns.some((column) => normalizeText(row[column.key]).includes(text))
    );
    const ids = rows.map((row) => getRowId(row, context.rowKey)).filter(Boolean);
    (_a = context.onHighlightRows) == null ? void 0 : _a.call(context, ids);
    return ok(m.found(rows.length), rows);
  }
  function countGrid(context) {
    return ok(msg(context).count(context.data.length), context.data.length);
  }
  function getColumns(context) {
    return ok(msg(context).columns, context.columns);
  }
  function getRow(context, id) {
    const m = msg(context);
    const rowId = String(id ?? "").trim();
    if (!rowId) return fail("INVALID_INPUT", m.noIds);
    const row = findRow(context, rowId);
    return row ? ok(m.rowFound, row) : fail("NOT_FOUND", m.notFound(rowId));
  }
  function highlightRows(context, ids) {
    const m = msg(context);
    const wanted = toIdList(ids);
    if (wanted.length === 0) return fail("INVALID_INPUT", m.noIds);
    if (!context.onHighlightRows) return fail("NOT_SUPPORTED", m.notSupported("highlight"));
    const known = wanted.filter((id) => findRow(context, id) !== void 0);
    if (known.length === 0) return fail("NOT_FOUND", m.noneFound);
    context.onHighlightRows(known);
    return ok(m.highlighted(known.length), known);
  }
  function selectRow(context, id) {
    const m = msg(context);
    const rowId = String(id ?? "").trim();
    if (!rowId) return fail("INVALID_INPUT", m.noIds);
    if (!context.onSelectRow) return fail("NOT_SUPPORTED", m.notSupported("select"));
    if (!findRow(context, rowId)) return fail("NOT_FOUND", m.notFound(rowId));
    context.onSelectRow(rowId);
    return ok(m.selected(rowId), rowId);
  }
  function openRow(context, id) {
    const m = msg(context);
    const rowId = String(id ?? "").trim();
    if (!rowId) return fail("INVALID_INPUT", m.noIds);
    if (!context.onOpenRow) return fail("NOT_SUPPORTED", m.notSupported("open"));
    if (!findRow(context, rowId)) return fail("NOT_FOUND", m.notFound(rowId));
    context.onOpenRow(rowId);
    return ok(m.opened(rowId), rowId);
  }
  function filterGrid(context, filter) {
    const m = msg(context);
    const column = findColumn(context, (filter == null ? void 0 : filter.key) ?? "");
    if (!column) return fail("INVALID_INPUT", m.unknownColumn(String((filter == null ? void 0 : filter.key) ?? "")));
    if (!OPERATORS.includes(filter.operator)) return fail("INVALID_INPUT", m.badOperator(String(filter.operator)));
    const normalized = { ...filter, key: column.key };
    if (!isValidFilter(normalized, column)) return fail("INVALID_INPUT", m.badValue);
    if (!context.onFiltersChange) return fail("NOT_SUPPORTED", m.notSupported("filter"));
    const filters = [...(context.filters ?? []).filter((f) => f.key !== column.key), normalized];
    const count = applyFilters(context, filters).length;
    context.onFiltersChange(filters);
    return ok(m.filtered(count), { filters, count });
  }
  function clearFilters(context) {
    const m = msg(context);
    if (!context.onFiltersChange) return fail("NOT_SUPPORTED", m.notSupported("clear filters"));
    context.onFiltersChange([]);
    return ok(m.filtersCleared, []);
  }
  function sortGrid(context, key, direction = "asc") {
    const m = msg(context);
    const column = findColumn(context, key);
    if (!column) return fail("INVALID_INPUT", m.unknownColumn(String(key)));
    if (direction !== "asc" && direction !== "desc") return fail("INVALID_INPUT", m.badValue);
    if (!context.onSortChange) return fail("NOT_SUPPORTED", m.notSupported("sort"));
    const sort = { key: column.key, direction };
    context.onSortChange(sort);
    return ok(m.sorted(column.label, direction), sort);
  }
  function clearSort(context) {
    const m = msg(context);
    if (!context.onSortChange) return fail("NOT_SUPPORTED", m.notSupported("clear sort"));
    context.onSortChange(null);
    return ok(m.sortCleared, null);
  }
  var DEFAULT_DESCRIPTIONS = {
    search: "Search all columns for text. Matching rows are highlighted.",
    count: "Count the rows currently in the grid.",
    columns: "List the grid's columns with their keys, labels and types.",
    get_row: "Get one row by its ID.",
    highlight: "Highlight one or more rows by ID without filtering the grid.",
    select: "Select one row by ID.",
    open: "Open one row by ID to show its full details.",
    filter: "Filter the grid by one column. Replaces any existing filter on that column.",
    clear_filters: "Remove all filters.",
    sort: "Sort the grid by one column, ascending or descending.",
    clear_sort: "Remove sorting."
  };
  var LABELS = {
    en: {
      search: "Search",
      count: "Count",
      columns: "Columns",
      get_row: "Get row",
      highlight: "Highlight",
      select: "Select",
      open: "Open",
      filter: "Filter",
      clear_filters: "Clear filters",
      sort: "Sort",
      clear_sort: "Clear sort"
    },
    te: {
      search: "\u0C35\u0C46\u0C24\u0C41\u0C15\u0C41",
      count: "\u0C32\u0C46\u0C15\u0C4D\u0C15",
      columns: "\u0C15\u0C3E\u0C32\u0C2E\u0C4D\u200C\u0C32\u0C41",
      get_row: "\u0C35\u0C30\u0C41\u0C38 \u0C1A\u0C42\u0C2A\u0C41",
      highlight: "\u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D",
      select: "\u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B",
      open: "\u0C24\u0C46\u0C30\u0C41\u0C35\u0C41",
      filter: "\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D",
      clear_filters: "\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F",
      sort: "\u0C15\u0C4D\u0C30\u0C2E\u0C02",
      clear_sort: "\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F"
    }
  };
  async function safe(context, run) {
    try {
      return run();
    } catch {
      return fail("INTERNAL", msg(context).internal);
    }
  }
  function createGridTools(context, options = {}) {
    const prefix = options.name ?? "yuktai_grid";
    const labels = LABELS[context.locale ?? "en"];
    const describe = (id) => {
      var _a;
      return ((_a = options.descriptions) == null ? void 0 : _a[id]) ?? DEFAULT_DESCRIPTIONS[id];
    };
    const idProp = { id: { type: "string", description: "Row ID" } };
    const columnKeys = context.columns.map((c) => c.key);
    const all = [
      {
        id: "search",
        available: true,
        schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
        run: (i) => searchGrid(context, String(i.query ?? ""))
      },
      {
        id: "count",
        available: true,
        schema: { type: "object", properties: {} },
        run: () => countGrid(context)
      },
      {
        id: "columns",
        available: true,
        schema: { type: "object", properties: {} },
        run: () => getColumns(context)
      },
      {
        id: "get_row",
        available: true,
        schema: { type: "object", properties: idProp, required: ["id"] },
        run: (i) => getRow(context, String(i.id ?? ""))
      },
      {
        id: "highlight",
        available: !!context.onHighlightRows,
        schema: {
          type: "object",
          properties: { ids: { type: "array", items: { type: "string" }, description: "Row IDs" } },
          required: ["ids"]
        },
        run: (i) => highlightRows(context, toIdList(i.ids))
      },
      {
        id: "select",
        available: !!context.onSelectRow,
        schema: { type: "object", properties: idProp, required: ["id"] },
        run: (i) => selectRow(context, String(i.id ?? ""))
      },
      {
        id: "open",
        available: !!context.onOpenRow,
        schema: { type: "object", properties: idProp, required: ["id"] },
        run: (i) => openRow(context, String(i.id ?? ""))
      },
      {
        id: "filter",
        available: !!context.onFiltersChange,
        schema: {
          type: "object",
          properties: {
            key: { type: "string", enum: columnKeys },
            operator: { type: "string", enum: OPERATORS },
            value: { description: "Text or number; for 'between' an array of two numbers or dates" }
          },
          required: ["key", "operator", "value"]
        },
        run: (i) => filterGrid(context, {
          key: String(i.key ?? ""),
          operator: String(i.operator ?? ""),
          value: i.value
        })
      },
      {
        id: "clear_filters",
        available: !!context.onFiltersChange,
        schema: { type: "object", properties: {} },
        run: () => clearFilters(context)
      },
      {
        id: "sort",
        available: !!context.onSortChange,
        schema: {
          type: "object",
          properties: {
            key: { type: "string", enum: columnKeys },
            direction: { type: "string", enum: ["asc", "desc"] }
          },
          required: ["key"]
        },
        run: (i) => sortGrid(context, String(i.key ?? ""), i.direction === "desc" ? "desc" : "asc")
      },
      {
        id: "clear_sort",
        available: !!context.onSortChange,
        schema: { type: "object", properties: {} },
        run: () => clearSort(context)
      }
    ];
    return all.filter((t) => t.available).map((t) => ({
      name: `${prefix}_${t.id}`,
      title: LABELS.en[t.id],
      description: describe(t.id),
      label: labels[t.id],
      inputSchema: t.schema,
      execute: (input) => safe(context, () => t.run(input ?? {}))
    }));
  }

  // src/agentic/gridQuery.ts
  var norm = (v) => String(v ?? "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
  var STOPWORDS = new Set(
    "show me find list get give which who what all the a an rows row records record entries with where that are is have has having and or of for in on to please display only those whose any".split(" ")
  );
  function parseAmount(text) {
    const m = norm(text).replace(/(₹|rs\.?|inr|\$|usd|€|£)/g, " ").match(/(-?\d[\d,]*(?:\.\d+)?|-?\.\d+)\s*(k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion)?(?![\p{L}])/u);
    if (!m) return null;
    const base = Number(m[1].replace(/,/g, ""));
    if (!Number.isFinite(base)) return null;
    const unit = m[2] ?? "";
    const mult = /^k|thousand/.test(unit) ? 1e3 : /^la/.test(unit) ? 1e5 : /^(crore|cr)/.test(unit) ? 1e7 : /^(m|mn|million)$/.test(unit) ? 1e6 : /^(bn|billion)$/.test(unit) ? 1e9 : 1;
    return base * mult;
  }
  function columnNames(c) {
    const names = /* @__PURE__ */ new Set([norm(c.label), norm(c.key), norm(c.key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2"))]);
    for (const n of Array.from(names)) {
      if (n.endsWith("s")) names.add(n.slice(0, -1));
      else names.add(`${n}s`);
    }
    return Array.from(names).filter((n) => n.length > 1);
  }
  function findMentionedColumn(text, columns, kind) {
    const t = ` ${norm(text)} `;
    let best;
    for (const c of columns) {
      if (kind && (c.type ?? "text") !== kind) continue;
      for (const name of columnNames(c)) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${escaped}($|[^\\p{L}\\p{M}\\p{N}])`, "u").test(t) && (!best || name.length > best.length)) {
          best = { column: c, length: name.length };
        }
      }
    }
    return best == null ? void 0 : best.column;
  }
  var MONEY_HINT = /amount|balance|total|price|salary|value|due|revenue|cost|fee|sales|outstanding|paid/i;
  function defaultNumericColumn(columns) {
    const numeric = columns.filter((c) => c.type === "number");
    return numeric.find((c) => MONEY_HINT.test(`${c.key} ${c.label}`)) ?? numeric[0];
  }
  var GT = /(>=|=>|>|\bover\b|\babove\b|\bmore than\b|\bgreater than\b|\bexceeds?\b|\bexceeding\b|\bhigher than\b|\bat least\b|\bminimum\b|\bmin\b|కంటే ఎక్కువ)/;
  var LT = /(<=|=<|<|\bunder\b|\bbelow\b|\bless than\b|\blower than\b|\bat most\b|\bmaximum\b|\bmax\b|\bup to\b|కంటే తక్కువ)/;
  var DATE_AFTER = /\b(after|since|from)\b/;
  var DATE_BEFORE = /\b(before|until|till)\b/;
  var UNIT = "(?:\\s*(?:k|thousand|lakhs?|lacs?|crores?|cr|mn|million|m|bn|billion))?";
  var NUM = `(?:\u20B9|rs\\.?\\s*|\\$)?\\s*-?\\d[\\d,]*(?:\\.\\d+)?${UNIT}`;
  function parseGridQuery(query, columns, options = {}) {
    var _a;
    const parsed = { filters: [], search: [], sort: null, limit: null, notes: [], explanation: "" };
    let text = norm(query).replace(/[?!]+/g, " ").replace(/\.(?!\d)/g, " ").trim();
    const explain = [];
    const limitMatch = text.match(/\b(top|first|bottom|last|lowest|highest)\s+(\d+)\b/);
    if (limitMatch) {
      parsed.limit = Number(limitMatch[2]);
      text = text.replace(limitMatch[0], ` ${limitMatch[1]} `);
    }
    const sortBy = text.match(/\b(?:sort(?:ed)?|order(?:ed)?)\s+by\s+([\p{L}\p{M}\p{N} _]+?)(?:\s+(asc|ascending|desc|descending))?(?=$|,|\band\b|\bthen\b)/u);
    const ranked = text.match(/\b(top|highest|largest|biggest|most|bottom|lowest|smallest|least)\b(?:\s+\d+)?\s+(?:by\s+)?([\p{L}\p{M}\p{N} _]+)/u);
    if (sortBy) {
      const column = findMentionedColumn(sortBy[1], columns);
      if (column) {
        parsed.sort = { key: column.key, direction: /^desc/.test(sortBy[2] ?? "") ? "desc" : "asc" };
        text = text.replace(sortBy[0], " ");
      }
    } else if (ranked) {
      const column = findMentionedColumn(ranked[2], columns, "number") ?? findMentionedColumn(ranked[2], columns) ?? defaultNumericColumn(columns);
      if (column) {
        const desc = /top|highest|largest|biggest|most/.test(ranked[1]);
        parsed.sort = { key: column.key, direction: desc ? "desc" : "asc" };
        text = text.replace(new RegExp(`\\b${ranked[1]}\\b`), " ");
        if (!limitMatch && /top|bottom/.test(ranked[1])) parsed.limit = 10;
      }
    }
    const betweenRe = new RegExp(`\\bbetween\\s+(${NUM}|\\d{4}-\\d{2}-\\d{2})\\s+(?:and|to|-)\\s+(${NUM}|\\d{4}-\\d{2}-\\d{2})`, "u");
    let between;
    while (between = text.match(betweenRe)) {
      const lead = text.slice(Math.max(0, (between.index ?? 0) - 40), between.index ?? 0);
      const isDate = /\d{4}-\d{2}-\d{2}/.test(between[1]);
      const column = isDate ? findMentionedColumn(lead, columns, "date") ?? columns.find((c) => c.type === "date") : findMentionedColumn(lead, columns, "number") ?? defaultNumericColumn(columns);
      const lo = isDate ? between[1] : parseAmount(between[1]);
      const hi = isDate ? between[2] : parseAmount(between[2]);
      if (column && lo !== null && hi !== null) {
        parsed.filters.push({ key: column.key, operator: "between", value: [lo, hi] });
        explain.push(`${column.label} between ${between[1]} and ${between[2]}`);
      }
      text = text.replace(between[0], " ");
    }
    const clauses = text.split(new RegExp("\\s*(?:(?<!\\d),|,(?!\\d)|;|\\band\\b|(?<!(?:starts?|starting|ends?|ending|begins?|beginning)\\s)\\bwith\\b|\\bwhere\\b|\\bwho\\b|\\bthat\\b|&|\u0C2E\u0C30\u0C3F\u0C2F\u0C41)\\s*", "u")).map((c) => c.trim()).filter(Boolean);
    const textColumns = columns.filter((c) => (c.type ?? "text") === "text");
    const distinct = /* @__PURE__ */ new Map();
    for (const c of textColumns) {
      const values = /* @__PURE__ */ new Set();
      for (const row of (options.data ?? []).slice(0, 5e3)) {
        const v = norm(row[c.key]);
        if (v && v.length <= 40) values.add(v);
        if (values.size > 300) break;
      }
      if (values.size && values.size <= 300) distinct.set(c.key, values);
    }
    for (const clause of clauses) {
      const before = parsed.filters.length;
      const mentioned = findMentionedColumn(clause, columns);
      const amountMatch = clause.match(new RegExp(NUM, "u"));
      const dateMatch = clause.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch && (DATE_AFTER.test(clause) || DATE_BEFORE.test(clause) || GT.test(clause) || LT.test(clause))) {
        const column = ((mentioned == null ? void 0 : mentioned.type) === "date" ? mentioned : void 0) ?? columns.find((c) => c.type === "date");
        if (column) {
          const after = DATE_AFTER.test(clause) || GT.test(clause);
          parsed.filters.push({ key: column.key, operator: after ? "greaterThan" : "lessThan", value: dateMatch[0] });
          explain.push(`${column.label} ${after ? "after" : "before"} ${dateMatch[0]}`);
        }
      } else if (amountMatch && (GT.test(clause) || LT.test(clause) || (mentioned == null ? void 0 : mentioned.type) === "number" && /\b(is|equals?)\b|=/.test(clause))) {
        let column = (mentioned == null ? void 0 : mentioned.type) === "number" ? mentioned : void 0;
        if (!column) {
          column = defaultNumericColumn(columns);
          if (column) parsed.notes.push(`Assumed "${clause}" refers to ${column.label}.`);
        }
        const value = parseAmount(amountMatch[0]);
        if (column && value !== null) {
          const inclusive = /at least|minimum|\bmin\b|>=|=>|at most|maximum|\bmax\b|up to|<=|=</.test(clause);
          if (GT.test(clause)) {
            parsed.filters.push({ key: column.key, operator: "greaterThan", value: inclusive ? value - 1e-9 : value });
            explain.push(`${column.label} ${inclusive ? "\u2265" : ">"} ${value.toLocaleString("en-IN")}`);
          } else if (LT.test(clause)) {
            parsed.filters.push({ key: column.key, operator: "lessThan", value: inclusive ? value + 1e-9 : value });
            explain.push(`${column.label} ${inclusive ? "\u2264" : "<"} ${value.toLocaleString("en-IN")}`);
          } else {
            parsed.filters.push({ key: column.key, operator: "equals", value });
            explain.push(`${column.label} = ${value.toLocaleString("en-IN")}`);
          }
        }
      } else {
        const starts = clause.match(/\b(?:starts?|starting|begins?|beginning)\s+with\s+(.+)$/);
        const ends = clause.match(/\b(?:ends?|ending)\s+with\s+(.+)$/);
        const contains = clause.match(/\b(?:contains?|containing|including|includes?|mentions?)\s+(.+)$/);
        const equals = clause.match(/\b(?:is|equals?|=|:)\s+(.+)$/);
        const target = starts ?? ends ?? contains ?? equals;
        if (target) {
          const column = mentioned ?? textColumns[0];
          const value = target[1].replace(/^["'“‘]|["'”’]$/g, "").trim();
          if (column && value) {
            const operator = starts ? "startsWith" : ends ? "endsWith" : contains ? "contains" : "equals";
            parsed.filters.push({ key: column.key, operator, value });
            explain.push(`${column.label} ${operator === "equals" ? "is" : operator === "contains" ? "contains" : operator === "startsWith" ? "starts with" : "ends with"} "${value}"`);
            if (!mentioned) parsed.notes.push(`Assumed "${clause}" refers to ${column.label}.`);
          }
        }
      }
      if (parsed.filters.length === before) {
        for (const [key, values] of distinct) {
          let hit = "";
          for (const v of values) {
            if (v.length < 2 || v.length <= hit.length) continue;
            const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if (new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${escaped}($|[^\\p{L}\\p{M}\\p{N}])`, "u").test(clause)) hit = v;
          }
          if (hit) {
            const column = columns.find((c) => c.key === key);
            parsed.filters.push({ key, operator: "equals", value: hit });
            explain.push(`${column.label} is "${hit}"`);
          }
        }
      }
      if (parsed.filters.length === before) {
        const words = clause.split(/\s+/).filter((w) => !STOPWORDS.has(w) && !/^(top|first|bottom|last|lowest|highest|by|desc|asc|sort(ed)?)$/.test(w));
        const isColumnWord = words.length > 0 && words.every((w) => columns.some((c) => columnNames(c).includes(w)));
        if (words.length && !isColumnWord && !(mentioned && words.length === 1)) {
          const term = words.join(" ");
          if (!/^(customers?|users?|people|items?|entries|poems?|orders?|products?|employees?|students?|members?)$/.test(term)) {
            parsed.search.push(term);
            explain.push(`any column contains "${term}"`);
          }
        }
      }
    }
    if (parsed.sort) {
      const label = ((_a = columns.find((c) => c.key === parsed.sort.key)) == null ? void 0 : _a.label) ?? parsed.sort.key;
      explain.push(`sorted by ${label} ${parsed.sort.direction === "desc" ? "high \u2192 low" : "low \u2192 high"}`);
    }
    if (parsed.limit) explain.push(`first ${parsed.limit}`);
    parsed.explanation = explain.length ? `Showing rows where ${explain.join(", ")}.` : "No conditions understood \u2014 showing all rows.";
    return parsed;
  }
  function compare(a, b, type) {
    if (type === "number") return (Number(a) || 0) - (Number(b) || 0);
    if (type === "date") return (new Date(String(a)).getTime() || 0) - (new Date(String(b)).getTime() || 0);
    return String(a ?? "").localeCompare(String(b ?? ""), void 0, { numeric: true });
  }
  function executeGridQuery(data, columns, parsed) {
    let rows = applyGridFilters(data, columns, parsed.filters);
    for (const term of parsed.search) {
      rows = rows.filter((row) => columns.some((c) => norm(row[c.key]).includes(term)));
    }
    if (parsed.sort) {
      const column = columns.find((c) => c.key === parsed.sort.key);
      const dir = parsed.sort.direction === "desc" ? -1 : 1;
      rows = [...rows].sort((a, b) => dir * compare(a[parsed.sort.key], b[parsed.sort.key], column == null ? void 0 : column.type));
    }
    if (parsed.limit) rows = rows.slice(0, parsed.limit);
    return rows;
  }
  function runGridQuery(query, context, options = {}) {
    var _a, _b, _c;
    const parsed = parseGridQuery(query, context.columns, { data: context.data });
    const rows = executeGridQuery(context.data, context.columns, parsed);
    const ids = rows.map((r) => getRowId(r, context.rowKey)).filter(Boolean);
    if (options.apply !== false) {
      if (parsed.filters.length) (_a = context.onFiltersChange) == null ? void 0 : _a.call(context, parsed.filters);
      if (parsed.sort) (_b = context.onSortChange) == null ? void 0 : _b.call(context, parsed.sort);
      if (ids.length) (_c = context.onHighlightRows) == null ? void 0 : _c.call(context, ids);
    }
    const message = rows.length ? `${rows.length} row(s) found. ${parsed.explanation}${parsed.notes.length ? ` (${parsed.notes.join(" ")})` : ""}` : `No rows match. ${parsed.explanation}`;
    return { rows, ids, parsed, message };
  }
  function quantile(sorted, q) {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base + 1] !== void 0 ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
  }
  function detectAnomalies(data, columns, options = {}) {
    const factor = options.factor ?? 1.5;
    const out = [];
    const numeric = columns.filter((c) => c.type === "number" && (!options.columns || options.columns.includes(c.key)));
    const fmt2 = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    for (const c of numeric) {
      const values = data.map((r) => Number(r[c.key])).filter((n) => Number.isFinite(n));
      if (values.length < 5) continue;
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = quantile(sorted, 0.25);
      const q3 = quantile(sorted, 0.75);
      const iqr = q3 - q1;
      if (iqr === 0) continue;
      const lo = q1 - factor * iqr;
      const hi = q3 + factor * iqr;
      for (const row of data) {
        const v = Number(row[c.key]);
        if (!Number.isFinite(v) || v >= lo && v <= hi) continue;
        out.push({
          rowId: getRowId(row, options.rowKey),
          column: c.key,
          label: c.label,
          value: v,
          kind: v > hi ? "high" : "low",
          reason: `${c.label} ${fmt2(v)} is far ${v > hi ? "above" : "below"} the typical range (${fmt2(q1)}\u2013${fmt2(q3)}).`
        });
      }
    }
    const rowKey = options.rowKey ?? "id";
    const seen = /* @__PURE__ */ new Map();
    for (const row of data) {
      const signature = JSON.stringify(columns.filter((c) => c.key !== rowKey).map((c) => norm(row[c.key])));
      const id = getRowId(row, options.rowKey);
      const first = seen.get(signature);
      if (first !== void 0) {
        out.push({ rowId: id, column: rowKey, label: "Row", value: id, kind: "duplicate", reason: `Row ${id} has the same values as row ${first}.` });
      } else seen.set(signature, id);
    }
    return out;
  }
  function summarizeRows(rows, columns) {
    if (!rows.length) return "No rows to summarise.";
    const lines = [`${rows.length} row(s).`];
    const fmt2 = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    for (const c of columns) {
      const raw = rows.map((r) => r[c.key]);
      if (c.type === "number") {
        const nums = raw.map(Number).filter(Number.isFinite);
        if (!nums.length) continue;
        const total = nums.reduce((a, b) => a + b, 0);
        lines.push(`${c.label}: total ${fmt2(total)}, average ${fmt2(total / nums.length)}, range ${fmt2(Math.min(...nums))}\u2013${fmt2(Math.max(...nums))}.`);
      } else if (c.type === "date") {
        const times = raw.map((v) => new Date(String(v)).getTime()).filter(Number.isFinite);
        if (!times.length) continue;
        const iso = (t) => new Date(t).toISOString().slice(0, 10);
        lines.push(`${c.label}: from ${iso(Math.min(...times))} to ${iso(Math.max(...times))}.`);
      } else {
        const counts = /* @__PURE__ */ new Map();
        for (const v of raw) {
          const key = String(v ?? "").trim();
          if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        if (counts.size === 0 || counts.size > Math.max(8, rows.length / 3)) continue;
        const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
        lines.push(`${c.label}: ${top.map(([k, n]) => `${k} (${n})`).join(", ")}.`);
      }
    }
    return lines.join("\n");
  }
  function answerGridQuestion(question, context) {
    var _a;
    const q = norm(question);
    if (/unusual|anomal|outlier|odd|strange|suspicious|duplicate|అసాధారణ/.test(q)) {
      const anomalies = detectAnomalies(context.data, context.columns, { rowKey: context.rowKey });
      const ids = Array.from(new Set(anomalies.map((a) => a.rowId)));
      if (ids.length) (_a = context.onHighlightRows) == null ? void 0 : _a.call(context, ids);
      const byId = new Set(ids);
      return {
        kind: "anomalies",
        message: anomalies.length ? `${ids.length} unusual row(s):
${anomalies.slice(0, 10).map((a) => `\u2022 ${a.reason}`).join("\n")}` : "Nothing unusual found.",
        ids,
        rows: context.data.filter((r) => byId.has(getRowId(r, context.rowKey))),
        anomalies
      };
    }
    if (/summar|overview|describe|సారాంశం/.test(q)) {
      const filtered = applyGridFilters(context.data, context.columns, context.filters ?? []);
      return { kind: "summary", message: summarizeRows(filtered, context.columns), ids: [], rows: filtered };
    }
    const result = runGridQuery(question, context);
    return { kind: "query", message: result.message, ids: result.ids, rows: result.rows };
  }

  // src/agentic/insights.ts
  var num = (v) => {
    const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[,₹$%\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  var time = (v) => {
    const t = v instanceof Date ? v.getTime() : new Date(String(v ?? "")).getTime();
    return Number.isFinite(t) ? t : null;
  };
  function aggregate(values, agg) {
    if (agg === "count") return values.length;
    if (!values.length) return 0;
    switch (agg) {
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "avg":
        return values.reduce((a, b) => a + b, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
    }
  }
  function groupBy(data, groupKey, metricKey, agg = "sum") {
    const buckets = /* @__PURE__ */ new Map();
    for (const row of data) {
      const group = String(row[groupKey] ?? "\u2014").trim() || "\u2014";
      const list = buckets.get(group) ?? [];
      if (metricKey === null || agg === "count") list.push(1);
      else {
        const v = num(row[metricKey]);
        if (v !== null) list.push(v);
      }
      buckets.set(group, list);
    }
    return Array.from(buckets.entries()).map(([group, values]) => ({ group, value: aggregate(values, agg), count: values.length })).sort((a, b) => b.value - a.value);
  }
  function startOfPeriod(date, period, weekStartsOn = 1) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (period === "week") d.setDate(d.getDate() - (d.getDay() - weekStartsOn + 7) % 7);
    if (period === "month") d.setDate(1);
    if (period === "quarter") d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
    if (period === "year") d.setMonth(0, 1);
    return d;
  }
  function addPeriods(date, period, n) {
    const d = new Date(date);
    if (period === "day") d.setDate(d.getDate() + n);
    if (period === "week") d.setDate(d.getDate() + 7 * n);
    if (period === "month") d.setMonth(d.getMonth() + n);
    if (period === "quarter") d.setMonth(d.getMonth() + 3 * n);
    if (period === "year") d.setFullYear(d.getFullYear() + n);
    return d;
  }
  function comparePeriods(data, o) {
    const ref = o.referenceDate ? new Date(o.referenceDate) : /* @__PURE__ */ new Date();
    const curFrom = startOfPeriod(ref, o.period, o.weekStartsOn);
    const curTo = o.toDate === false ? addPeriods(curFrom, o.period, 1) : new Date(Math.max(ref.getTime() + 1, curFrom.getTime() + 1));
    const prevFrom = addPeriods(curFrom, o.period, -1);
    const prevTo = o.toDate === false ? curFrom : new Date(prevFrom.getTime() + (curTo.getTime() - curFrom.getTime()));
    const agg = o.agg ?? "sum";
    const cur = /* @__PURE__ */ new Map();
    const prev = /* @__PURE__ */ new Map();
    for (const row of data) {
      const t = time(row[o.dateKey]);
      if (t === null) continue;
      const bucket = t >= curFrom.getTime() && t < curTo.getTime() ? cur : t >= prevFrom.getTime() && t < prevTo.getTime() ? prev : null;
      if (!bucket) continue;
      const group = o.groupKey ? String(row[o.groupKey] ?? "\u2014") : "All";
      const v = agg === "count" ? 1 : num(row[o.metricKey]);
      if (v === null) continue;
      bucket.set(group, [...bucket.get(group) ?? [], v]);
    }
    const groups = /* @__PURE__ */ new Set([...cur.keys(), ...prev.keys()]);
    const rows = Array.from(groups).map((group) => {
      const current = aggregate(cur.get(group) ?? [], agg);
      const previous = aggregate(prev.get(group) ?? [], agg);
      return {
        group,
        current,
        previous,
        change: current - previous,
        changePct: previous === 0 ? null : (current - previous) / Math.abs(previous) * 100
      };
    });
    return { period: o.period, current: { from: curFrom, to: curTo }, previous: { from: prevFrom, to: prevTo }, rows };
  }
  function trend(data, dateKey, metricKey, period, agg = "sum") {
    const buckets = /* @__PURE__ */ new Map();
    for (const row of data) {
      const t = time(row[dateKey]);
      const v = agg === "count" ? 1 : num(row[metricKey]);
      if (t === null || v === null) continue;
      const key = startOfPeriod(new Date(t), period).getTime();
      buckets.set(key, [...buckets.get(key) ?? [], v]);
    }
    return Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]).map(([k, values]) => ({ start: new Date(k), value: aggregate(values, agg) }));
  }
  var RATE = /rate|conversion|ratio|percent|%|score|rating|margin|ctr|avg|average/i;
  function detectPeriod(q) {
    const m = q.match(/\b(today|yesterday|this|last|previous|past)\s*(day|week|month|quarter|year)?\b/);
    if (!m) return null;
    if (m[1] === "today") return { period: "day", shift: 0 };
    if (m[1] === "yesterday") return { period: "day", shift: -1 };
    if (!m[2]) return null;
    return { period: m[2], shift: m[1] === "this" ? 0 : -1 };
  }
  var fmt = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  var pct = (n) => n === null ? "new" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
  function askInsight(question, data, columns, options = {}) {
    var _a;
    const q = question.toLowerCase();
    const numeric = columns.filter((c) => c.type === "number");
    const metric = findMentionedColumn(q, columns, "number") ?? numeric.find((c) => /amount|revenue|sales|total|value/i.test(`${c.key} ${c.label}`)) ?? numeric[0];
    const dateCol = columns.find((c) => c.type === "date") ?? columns.find((c) => /date|time|day|created|month/i.test(`${c.key} ${c.label}`));
    const groupPhrase = ((_a = q.match(/\b(?:which|by|per|each|across|every|top|for each)\s+([\p{L}\p{M}\p{N} _]+)/u)) == null ? void 0 : _a[1]) ?? "";
    const group = findMentionedColumn(groupPhrase, columns, "text");
    const wantsCount = /how many|number of|count/.test(q);
    const agg = wantsCount ? "count" : /average|avg|mean/.test(q) ? "avg" : /\btotal\b|\bsum\b/.test(q) ? "sum" : metric && RATE.test(`${metric.key} ${metric.label}`) ? "avg" : "sum";
    const down = /drop|decline|decrease|fell|fall|down|worst|lost|shrink|reduc/.test(q);
    const up = /increase|growth|grew|rise|rose|up\b|best|improv|gain/.test(q);
    const lowest = /lowest|least|smallest|bottom|worst|minimum/.test(q);
    const period = detectPeriod(q);
    if (!metric && !wantsCount) return { kind: "unknown", answer: "I couldn't find a numeric column to analyse.", table: [] };
    const metricLabel = wantsCount ? "rows" : metric.label;
    if (period && dateCol && (up || down || /change|compare|vs|versus/.test(q))) {
      const ref = options.referenceDate ? new Date(options.referenceDate) : /* @__PURE__ */ new Date();
      const reference = period.shift ? addPeriods(ref, period.period, period.shift) : ref;
      const cmp = comparePeriods(data, {
        dateKey: dateCol.key,
        metricKey: (metric == null ? void 0 : metric.key) ?? dateCol.key,
        groupKey: group == null ? void 0 : group.key,
        agg,
        period: period.period,
        referenceDate: reference,
        toDate: period.shift === 0
      });
      const sorted = [...cmp.rows].sort((a, b) => down ? a.change - b.change : b.change - a.change);
      const table = sorted.map((r) => ({ [(group == null ? void 0 : group.label) ?? "Group"]: r.group, Current: fmt(r.current), Previous: fmt(r.previous), Change: fmt(r.change), "Change %": pct(r.changePct) }));
      if (!sorted.length) return { kind: "period-change", answer: `No ${metricLabel} data in this ${period.period} or the one before.`, table };
      const top = sorted[0];
      const span = `${period.shift ? "last" : "this"} ${period.period} vs the ${period.period} before`;
      const moved = top.change === 0 ? "did not change" : top.change < 0 ? `dropped ${fmt(Math.abs(top.change))}` : `rose ${fmt(top.change)}`;
      const detail = `${metricLabel} ${moved} (${fmt(top.previous)} \u2192 ${fmt(top.current)}, ${pct(top.changePct)}) \u2014 ${span}.`;
      const noneMatched = down && top.change >= 0 || up && top.change <= 0;
      const answer = group ? noneMatched ? `No ${group.label.toLowerCase()} ${down ? "dropped" : "grew"}. Closest is ${top.group}: ${detail}` : `${top.group}: ${detail}` : detail;
      return { kind: "period-change", answer, table };
    }
    if (/trend|over time|month by month|week by week/.test(q) && dateCol && metric) {
      const p = /week/.test(q) ? "week" : /day|daily/.test(q) ? "day" : /year/.test(q) ? "year" : "month";
      const series = trend(data, dateCol.key, metric.key, p, agg);
      const table = series.map((s) => ({ Period: s.start.toISOString().slice(0, 10), [metric.label]: fmt(s.value) }));
      if (series.length < 2) return { kind: "trend", answer: `Not enough ${p}s of data for a trend.`, table };
      const first = series[0].value;
      const last = series[series.length - 1].value;
      const peak = series.reduce((a, b) => b.value > a.value ? b : a);
      return {
        kind: "trend",
        answer: `${metric.label} went from ${fmt(first)} to ${fmt(last)} over ${series.length} ${p}s (${pct(first ? (last - first) / Math.abs(first) * 100 : null)}). Peak: ${fmt(peak.value)} in the ${p} of ${peak.start.toISOString().slice(0, 10)}.`,
        table
      };
    }
    if (group) {
      const groups = groupBy(data, group.key, (metric == null ? void 0 : metric.key) ?? null, agg);
      const ordered = lowest ? [...groups].reverse() : groups;
      const table = ordered.map((g) => ({ [group.label]: g.group, [`${agg} of ${metricLabel}`]: fmt(g.value), Rows: g.count }));
      if (!ordered.length) return { kind: "group", answer: "No data.", table };
      const top = ordered[0];
      return {
        kind: "group",
        answer: `${top.group} has the ${lowest ? "lowest" : "highest"} ${agg === "sum" ? "total" : agg === "avg" ? "average" : agg} ${metricLabel}: ${fmt(top.value)} (across ${ordered.length} ${group.label.toLowerCase()} groups).`,
        table
      };
    }
    const values = wantsCount ? data.map(() => 1) : data.map((r) => num(r[metric.key])).filter((v) => v !== null);
    const value = aggregate(values, agg);
    return {
      kind: "total",
      answer: `${agg === "avg" ? "Average" : agg === "count" ? "Count of" : agg === "sum" ? "Total" : agg} ${metricLabel}: ${fmt(value)} across ${data.length} row(s).`,
      table: [{ Metric: metricLabel, Aggregation: agg, Value: fmt(value) }]
    };
  }

  // src/agentic/taskRunner.ts
  var VERBS = "highlight|mark|flag|sort|order|rank|arrange|summari[sz]e|summary|recap|count|how many|open|select|pick|show|filter|find|list|clear|reset|remove|detect|spot|tell";
  function planTasks(instruction) {
    const strong = instruction.replace(/[?!]/g, " ").split(/\s*(?:;|\.(?!\d)\s*|,?\s*\band then\b|,?\s*\bthen\b|,?\s*\bafter that\b|,?\s*\bfinally\b|,?\s*\bnext\b|ఆ తర్వాత)\s*/i);
    const parts = strong.flatMap((segment) => segment.split(new RegExp(`\\s*(?:,|\\band\\b)\\s+(?=(?:${VERBS})\\b)`, "i")));
    return parts.map((p) => p.trim()).filter((p) => p.length > 1).map((text) => ({ action: classify(text), text }));
  }
  function classify(text) {
    const t = text.toLowerCase();
    if (/^(clear|reset|remove)\b/.test(t)) return "clear";
    if (/unusual|anomal|outlier|suspicious|odd ones|duplicate/.test(t)) return "anomalies";
    if (/summari[sz]e|summary|what changed|recap|overview/.test(t)) return "summarize";
    if (/^(highlight|mark|flag)\b/.test(t)) return "highlight";
    if (/^(sort|order|rank|arrange)\b/.test(t)) return "sort";
    if (/^(count|how many)\b/.test(t)) return "count";
    if (/^(open|go to)\b/.test(t) && !/filtered|results?/.test(t)) return "open";
    if (/^(select|pick)\b/.test(t)) return "select";
    return "filter";
  }
  function conditionText(text) {
    return text.replace(new RegExp(`^\\s*(?:${VERBS}|open|go to)\\b`, "i"), " ").replace(/\b(the|filtered|results?|rows?|records?|entries|items?|ones|them|those|only|me|all)\b/gi, " ").replace(/\s+/g, " ").trim();
  }
  function describeFilter(f, columns) {
    var _a;
    const label = ((_a = columns.find((c) => c.key === f.key)) == null ? void 0 : _a.label) ?? f.key;
    const v = Array.isArray(f.value) ? `${f.value[0]}\u2013${f.value[1]}` : typeof f.value === "number" ? f.value.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : `"${f.value}"`;
    const op = { contains: "contains", equals: "is", startsWith: "starts with", endsWith: "ends with", greaterThan: ">", lessThan: "<", between: "between" }[f.operator];
    return `${label} ${op} ${v}`;
  }
  async function runTasks(instruction, context, options = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const plan = planTasks(instruction);
    const { columns, data } = context;
    let filters = [...context.filters ?? []];
    let search = [];
    let sort = null;
    let highlighted = [];
    const visible = () => executeGridQuery(data, columns, { filters, search, sort, limit: null, notes: [], explanation: "" });
    const before = { rows: visible().length, filters: [...filters] };
    const results = [];
    const ctx = () => ({ ...context, filters });
    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];
      const cond = conditionText(step.text);
      let result;
      try {
        switch (step.action) {
          case "clear": {
            filters = [];
            search = [];
            sort = null;
            highlighted = [];
            (_a = context.onFiltersChange) == null ? void 0 : _a.call(context, []);
            (_b = context.onSortChange) == null ? void 0 : _b.call(context, null);
            (_c = context.onHighlightRows) == null ? void 0 : _c.call(context, []);
            result = { ...step, success: true, message: `Cleared filters, sorting and highlights. ${data.length} row(s) shown.` };
            break;
          }
          case "filter": {
            const parsed = parseGridQuery(cond, columns, { data });
            if (!parsed.filters.length && !parsed.search.length && !parsed.sort) {
              result = { ...step, success: true, message: `Showing ${visible().length} row(s) with the current filters.` };
              break;
            }
            for (const f of parsed.filters) filters = [...filters.filter((x) => x.key !== f.key), f];
            search = [...search, ...parsed.search];
            if (parsed.sort) {
              sort = parsed.sort;
              (_d = context.onSortChange) == null ? void 0 : _d.call(context, sort);
            }
            (_e = context.onFiltersChange) == null ? void 0 : _e.call(context, filters);
            const rows = visible();
            const ids = rows.map((r) => getRowId(r, context.rowKey)).filter(Boolean);
            if (parsed.search.length && ids.length) {
              highlighted = ids;
              (_f = context.onHighlightRows) == null ? void 0 : _f.call(context, ids);
            }
            result = { ...step, success: true, message: `${rows.length} row(s) now shown. ${parsed.explanation}`, ids };
            break;
          }
          case "highlight": {
            const pool = visible();
            const parsed = parseGridQuery(cond, columns, { data: pool });
            const rows = parsed.filters.length || parsed.search.length ? executeGridQuery(pool, columns, { ...parsed, sort: null, limit: parsed.limit }) : pool;
            const ids = rows.map((r2) => getRowId(r2, context.rowKey)).filter(Boolean);
            if (!ids.length) {
              result = { ...step, success: false, message: `Nothing to highlight for "${cond || "all rows"}".` };
              break;
            }
            const r = highlightRows(ctx(), ids);
            if (r.success) highlighted = r.data ?? ids;
            result = { ...step, success: r.success, message: r.success ? `Highlighted ${highlighted.length} row(s)${cond ? ` matching "${cond}"` : ""}.` : r.message, ids: highlighted };
            break;
          }
          case "sort": {
            const parsed = parseGridQuery(step.text, columns, { data });
            let next = parsed.sort;
            if (!next) {
              const column = findMentionedColumn(cond, columns);
              if (column) next = { key: column.key, direction: /desc|high|large|big|most|newest|latest|z.?to.?a/i.test(step.text) ? "desc" : "asc" };
            }
            if (!next) {
              result = { ...step, success: false, message: `Which column should I sort by? Columns: ${columns.map((c) => c.label).join(", ")}.` };
              break;
            }
            sort = next;
            (_g = context.onSortChange) == null ? void 0 : _g.call(context, sort);
            const label = ((_h = columns.find((c) => c.key === sort.key)) == null ? void 0 : _h.label) ?? sort.key;
            result = { ...step, success: true, message: `Sorted by ${label} (${sort.direction === "desc" ? "high \u2192 low" : "low \u2192 high"}).` };
            break;
          }
          case "count": {
            result = { ...step, success: true, message: `${visible().length} row(s) shown${highlighted.length ? `, ${highlighted.length} highlighted` : ""}.` };
            break;
          }
          case "anomalies": {
            const pool = visible();
            const found = detectAnomalies(pool, columns, { rowKey: context.rowKey });
            const ids = Array.from(new Set(found.map((a) => a.rowId)));
            if (ids.length) {
              const r = highlightRows(ctx(), ids);
              if (r.success) highlighted = r.data ?? ids;
            }
            result = {
              ...step,
              success: true,
              message: found.length ? `${ids.length} unusual row(s): ${found.slice(0, 5).map((a) => a.reason).join(" ")}` : "Nothing unusual in the shown rows.",
              ids
            };
            break;
          }
          case "open":
          case "select": {
            const pool = visible();
            const byId = pool.find((r2) => cond && getRowId(r2, context.rowKey).toLowerCase() === cond.toLowerCase());
            const target = byId ?? executeGridQuery(pool, columns, parseGridQuery(cond, columns, { data: pool }))[0] ?? (cond ? void 0 : pool[0]);
            if (!target) {
              result = { ...step, success: false, message: `No row matches "${cond}".` };
              break;
            }
            const id = getRowId(target, context.rowKey);
            const r = step.action === "open" ? openRow(ctx(), id) : selectRow(ctx(), id);
            result = { ...step, success: r.success, message: r.message, ids: [id] };
            break;
          }
          case "summarize": {
            const rows = visible();
            result = { ...step, success: true, message: `${changeSummary(before, rows.length, filters, sort, highlighted, columns)}
${summarizeRows(rows, columns)}` };
            break;
          }
        }
      } catch (error) {
        result = { ...step, success: false, message: `This step failed: ${error instanceof Error ? error.message : String(error)}` };
      }
      results.push(result);
      (_i = options.onStep) == null ? void 0 : _i.call(options, result, i, plan.length);
    }
    const afterRows = visible().length;
    return {
      steps: results,
      before,
      after: { rows: afterRows, filters, sort, highlighted },
      summary: changeSummary(before, afterRows, filters, sort, highlighted, columns)
    };
  }
  function changeSummary(before, afterRows, filters, sort, highlighted, columns) {
    var _a;
    const parts = [`Rows: ${before.rows} \u2192 ${afterRows}.`];
    const added = filters.filter((f) => !before.filters.some((b) => JSON.stringify(b) === JSON.stringify(f)));
    const removed = before.filters.filter((b) => !filters.some((f) => JSON.stringify(b) === JSON.stringify(f)));
    if (added.length) parts.push(`Filters added: ${added.map((f) => describeFilter(f, columns)).join("; ")}.`);
    if (removed.length) parts.push(`Filters removed: ${removed.map((f) => describeFilter(f, columns)).join("; ")}.`);
    if (sort) parts.push(`Sorted by ${((_a = columns.find((c) => c.key === sort.key)) == null ? void 0 : _a.label) ?? sort.key} ${sort.direction === "desc" ? "high \u2192 low" : "low \u2192 high"}.`);
    if (highlighted.length) parts.push(`${highlighted.length} row(s) highlighted.`);
    return parts.join(" ");
  }

  // src/agentic/dom.ts
  var YUKTAI_IGNORE = "[data-yuktai-panel]";
  function isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }
  function isDocument(node) {
    return typeof node === "object" && node !== null && node.nodeType === 9;
  }
  function resolveRoot(root) {
    if (root) return root;
    return isBrowser() ? document : null;
  }
  function queryAll(root, selector, options = {}) {
    return Array.from(root.querySelectorAll(selector)).filter(
      (el) => !el.closest(YUKTAI_IGNORE) && (options.includeHidden || isVisible(el))
    );
  }
  function isVisible(el) {
    if (!isBrowser()) return false;
    if (el.closest("[hidden],[aria-hidden='true']")) return false;
    let node = el;
    while (node) {
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      node = node.parentElement;
    }
    return true;
  }
  function cleanText(text) {
    return (text ?? "").replace(/\s+/g, " ").trim();
  }
  function shorten(text, max = 60) {
    const t = cleanText(text);
    return t.length > max ? `${t.slice(0, max - 1)}\u2026` : t;
  }
  function selectorFor(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 4) {
      const tag = node.tagName.toLowerCase();
      if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) {
        parts.unshift(`${tag}#${node.id}`);
        break;
      }
      const parent = node.parentElement;
      if (!parent) {
        parts.unshift(tag);
        break;
      }
      const siblings = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
      parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${siblings.indexOf(node) + 1})` : tag);
      node = parent;
    }
    return parts.join(" > ");
  }
  function textById(ids, doc) {
    return ids.split(/\s+/).map((id) => {
      var _a;
      return cleanText((_a = doc.getElementById(id)) == null ? void 0 : _a.textContent);
    }).filter(Boolean).join(" ");
  }
  function accessibleName(el) {
    const doc = el.ownerDocument;
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = textById(labelledBy, doc);
      if (text) return text;
    }
    const ariaLabel = cleanText(el.getAttribute("aria-label"));
    if (ariaLabel) return ariaLabel;
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") {
      const id = el.getAttribute("id");
      if (id) {
        const label = doc.querySelector(`label[for="${cssEscape(id)}"]`);
        const text = cleanText(label == null ? void 0 : label.textContent);
        if (text) return text;
      }
      const wrapping = el.closest("label");
      if (wrapping) {
        const text = cleanText(wrapping.textContent);
        if (text) return text;
      }
      const type = (el.getAttribute("type") ?? "").toLowerCase();
      if (type === "submit" || type === "button" || type === "reset") {
        return cleanText(el.getAttribute("value")) || (type === "submit" ? "Submit" : "");
      }
      if (type === "image") return cleanText(el.getAttribute("alt"));
    }
    if (tag === "img") return cleanText(el.getAttribute("alt"));
    if (tag === "button" || tag === "a" || el.getAttribute("role")) {
      const text = cleanText(el.textContent);
      if (text) return text;
      const imgAlt = Array.from(el.querySelectorAll("img[alt], svg[aria-label]")).map((c) => cleanText(c.getAttribute("alt") ?? c.getAttribute("aria-label"))).filter(Boolean).join(" ");
      if (imgAlt) return imgAlt;
    }
    return cleanText(el.getAttribute("title"));
  }
  function cssEscape(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
    return value.replace(/["\\]/g, "\\$&");
  }
  function parseColor(value) {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    const rgb = v.match(/^rgba?\(([^)]+)\)$/);
    if (rgb) {
      const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
      const [r, g, b] = parts.slice(0, 3).map(Number);
      const alphaRaw = parts[3];
      const a = alphaRaw === void 0 ? 1 : alphaRaw.endsWith("%") ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw);
      if ([r, g, b, a].some((n) => !Number.isFinite(n))) return null;
      return { r, g, b, a };
    }
    const hex = v.match(/^#([0-9a-f]{3,8})$/);
    if (hex) {
      let h2 = hex[1];
      if (h2.length === 3 || h2.length === 4) h2 = h2.split("").map((c) => c + c).join("");
      if (h2.length !== 6 && h2.length !== 8) return null;
      return {
        r: parseInt(h2.slice(0, 2), 16),
        g: parseInt(h2.slice(2, 4), 16),
        b: parseInt(h2.slice(4, 6), 16),
        a: h2.length === 8 ? parseInt(h2.slice(6, 8), 16) / 255 : 1
      };
    }
    return null;
  }
  function blend(top, bottom) {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / a;
    return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a };
  }
  function relativeLuminance(c) {
    const channel = (v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
  }
  function contrastRatio(fg, bg) {
    const opaqueBg = bg.a < 1 ? blend(bg, { r: 255, g: 255, b: 255, a: 1 }) : bg;
    const opaqueFg = fg.a < 1 ? blend(fg, opaqueBg) : fg;
    const l1 = relativeLuminance(opaqueFg);
    const l2 = relativeLuminance(opaqueBg);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return Math.round((hi + 0.05) / (lo + 0.05) * 100) / 100;
  }
  function effectiveBackground(el) {
    const layers = [];
    let node = el;
    while (node) {
      const style = window.getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== "none") return null;
      const color = parseColor(style.backgroundColor);
      if (color && color.a > 0) {
        layers.push(color);
        if (color.a >= 1) break;
      }
      node = node.parentElement;
    }
    let result = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) result = blend(layers[i], result);
    return result;
  }
  function isLargeText(el) {
    const style = window.getComputedStyle(el);
    const size = parseFloat(style.fontSize) || 16;
    const weight = parseInt(style.fontWeight, 10) || 400;
    return size >= 24 || size >= 18.66 && weight >= 700;
  }
  function hasDirectText(el) {
    return Array.from(el.childNodes).some((n) => n.nodeType === 3 && cleanText(n.textContent).length > 0);
  }
  var FOCUSABLE = "a[href],button,input:not([type='hidden']),select,textarea,summary,[tabindex]:not([tabindex='-1']),[contenteditable='true']";
  var INTERACTIVE = "a[href],button,input:not([type='hidden']),select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='tab'],[role='menuitem']";

  // src/agentic/qaAudit.ts
  var AUDIT_RULES = {
    "html-lang": {
      title: "Page language is set",
      wcag: "3.1.1",
      severity: "serious",
      why: "Screen readers pick their voice and pronunciation from the page language. Without it, Telugu or Hindi text may be read with English rules."
    },
    "page-title": {
      title: "Page has a title",
      wcag: "2.4.2",
      severity: "serious",
      why: "The title is the first thing announced and the name shown on browser tabs and bookmarks."
    },
    "image-alt": {
      title: "Images have alternative text",
      wcag: "1.1.1",
      severity: "critical",
      why: 'People who cannot see the image get no information from it unless alt text describes it (or alt="" marks it as decorative).'
    },
    "heading-order": {
      title: "Headings follow a logical order",
      wcag: "1.3.1",
      severity: "moderate",
      why: "Many screen-reader users jump between headings. Skipped levels make the page outline confusing."
    },
    "single-h1": {
      title: "Page has one main heading",
      wcag: "best practice",
      severity: "minor",
      why: "A single h1 tells everyone what the page is about."
    },
    "landmark-main": {
      title: "Main content landmark exists",
      wcag: "1.3.1 / 2.4.1",
      severity: "moderate",
      why: "A <main> region lets keyboard and screen-reader users skip straight past menus to the content."
    },
    "form-label": {
      title: "Form fields have labels",
      wcag: "1.3.1 / 4.1.2",
      severity: "critical",
      why: 'Without a label, a screen reader just says "edit text" and the user has to guess what to type.'
    },
    "button-name": {
      title: "Buttons have names",
      wcag: "4.1.2",
      severity: "critical",
      why: 'An icon-only button with no name is announced as just "button", so its purpose is unknown.'
    },
    "link-name": {
      title: "Links have names",
      wcag: "2.4.4",
      severity: "serious",
      why: "Links are often read out of context in a list. An empty link gives no clue where it goes."
    },
    "color-contrast": {
      title: "Text has enough contrast",
      wcag: "1.4.3",
      severity: "serious",
      why: "Low-contrast text is hard to read for older users, people with low vision, and anyone outdoors on a phone."
    },
    "positive-tabindex": {
      title: "No positive tabindex",
      wcag: "2.4.3",
      severity: "moderate",
      why: "tabindex greater than 0 forces a custom keyboard order that usually doesn't match the visual order."
    },
    "keyboard-access": {
      title: "Clickable things work with a keyboard",
      wcag: "2.1.1",
      severity: "critical",
      why: "A div or span with a click handler can't be reached or activated with Tab and Enter, locking out keyboard users."
    },
    "duplicate-id": {
      title: "IDs are unique",
      wcag: "best practice",
      severity: "minor",
      why: "Labels and ARIA references point at ids. Duplicates make them point at the wrong element."
    },
    "form-error": {
      title: "Errors are linked to their fields",
      wcag: "3.3.1",
      severity: "serious",
      why: "When a field is marked invalid, the error message must be connected to it so it's announced together with the field."
    },
    "target-size": {
      title: "Touch targets are large enough",
      wcag: "2.5.8",
      severity: "moderate",
      why: "Small targets are hard to tap for people with tremors, seniors and everyone on mobile."
    }
  };
  var SEVERITY_WEIGHT = { critical: 10, serious: 5, moderate: 2, minor: 1 };
  function runQaAudit(options = {}) {
    const root = resolveRoot(options.root);
    const skip = new Set(options.skip ?? []);
    const issues = [];
    const counters = {};
    const doc = root ? isDocument(root) ? root : root.ownerDocument : null;
    const add = (rule, el, message, fix, autoFixable = false) => {
      if (skip.has(rule)) return;
      const info = AUDIT_RULES[rule];
      const n = counters[rule] = (counters[rule] ?? 0) + 1;
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
        element: el ?? void 0
      });
    };
    if (root && doc) {
      if (!doc.documentElement.getAttribute("lang")) {
        add("html-lang", doc.documentElement, "The <html> element has no lang attribute.", 'Add lang to <html>, e.g. <html lang="te"> or "en".', true);
      }
      if (!doc.title.trim()) {
        add("page-title", null, "The page has no <title>.", "Add a short, descriptive <title> that names this page.");
      }
      for (const img of queryAll(root, "img")) {
        if (img.getAttribute("role") === "presentation" || img.getAttribute("role") === "none") continue;
        if (!img.hasAttribute("alt") && !img.getAttribute("aria-label") && !img.getAttribute("aria-labelledby")) {
          const title = img.getAttribute("title");
          add(
            "image-alt",
            img,
            `Image has no alt text${img.getAttribute("src") ? ` (${shorten(img.getAttribute("src") ?? "", 40)})` : ""}.`,
            title ? `Use the title as alt: alt="${shorten(title, 40)}".` : 'Describe the image in alt, or use alt="" if it is purely decorative.',
            Boolean(title)
          );
        }
      }
      const headings = queryAll(root, "h1,h2,h3,h4,h5,h6");
      let last = 0;
      for (const h2 of headings) {
        const level = Number(h2.tagName[1]);
        if (last > 0 && level > last + 1) {
          add("heading-order", h2, `Heading jumps from h${last} to h${level}: "${shorten(h2.textContent ?? "", 40)}".`, `Change it to h${last + 1}, or add the missing level above it.`);
        }
        last = level;
      }
      const h1s = headings.filter((h2) => h2.tagName === "H1");
      if (h1s.length === 0) add("single-h1", null, "The page has no h1.", "Add one h1 that names the page.");
      else if (h1s.length > 1) add("single-h1", h1s[1], `The page has ${h1s.length} h1 headings.`, "Keep one h1; turn the others into h2.");
      if (root.querySelectorAll("main,[role='main']").length === 0) {
        add("landmark-main", null, "No <main> landmark found.", "Wrap the primary content in <main>.");
      }
      const fields = queryAll(root, "input,select,textarea").filter((el) => {
        const type = (el.getAttribute("type") ?? "text").toLowerCase();
        return !["hidden", "submit", "button", "reset", "image"].includes(type);
      });
      for (const field of fields) {
        if (!accessibleName(field)) {
          const hint = field.getAttribute("placeholder") || field.getAttribute("name");
          add(
            "form-label",
            field,
            `Form field has no label${hint ? ` (placeholder/name: "${shorten(hint, 30)}")` : ""}.`,
            hint ? `Add a visible <label>. Quick fix: aria-label="${shorten(hint, 30)}".` : "Add a visible <label for=\u2026> describing what to enter.",
            Boolean(hint)
          );
        }
        if (field.getAttribute("aria-invalid") === "true") {
          const describedBy = field.getAttribute("aria-describedby") || field.getAttribute("aria-errormessage");
          if (!describedBy) {
            add("form-error", field, "Field is marked invalid but no error message is linked to it.", "Put the error text in an element with an id and point aria-describedby at it.");
          }
        }
      }
      for (const btn of queryAll(root, "button,[role='button'],input[type='submit'],input[type='button']")) {
        if (!accessibleName(btn)) {
          const title = btn.getAttribute("title");
          add("button-name", btn, "Button has no accessible name.", title ? `Use the title as the name: aria-label="${title}".` : "Add visible text or an aria-label that says what the button does.", Boolean(title));
        }
      }
      for (const link of queryAll(root, "a[href]")) {
        if (!accessibleName(link)) {
          const title = link.getAttribute("title");
          add("link-name", link, `Link has no text (${shorten(link.getAttribute("href") ?? "", 40)}).`, title ? `Use the title as the name: aria-label="${title}".` : "Add link text that says where it goes.", Boolean(title));
        }
      }
      for (const el of queryAll(root, "[tabindex]")) {
        if (Number(el.getAttribute("tabindex")) > 0) {
          add("positive-tabindex", el, `tabindex="${el.getAttribute("tabindex")}" overrides the natural tab order.`, 'Use tabindex="0" and fix the order in the HTML instead.', true);
        }
      }
      const native = "a[href],button,input,select,textarea,summary";
      for (const el of queryAll(root, "[onclick],[role='button'],[role='link']")) {
        if (el.matches(native) || el.hasAttribute("tabindex")) continue;
        add("keyboard-access", el, `<${el.tagName.toLowerCase()}> is clickable but can't be reached with the keyboard.`, 'Use a real <button>, or add tabindex="0", a role and Enter/Space key handling.', true);
      }
      const seen = /* @__PURE__ */ new Map();
      for (const el of Array.from(root.querySelectorAll("[id]"))) {
        if (el.closest("[data-yuktai-panel]")) continue;
        seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      }
      for (const [id, count] of seen) {
        if (count > 1) add("duplicate-id", root.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`), `id="${id}" is used ${count} times.`, "Give each element a unique id.");
      }
      const max = options.maxContrastChecks ?? 600;
      let checked = 0;
      for (const el of queryAll(root, "body *")) {
        if (checked >= max) break;
        if (!hasDirectText(el) || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(el.tagName)) continue;
        checked++;
        const fg = parseColor(window.getComputedStyle(el).color);
        const bg = effectiveBackground(el);
        if (!fg || !bg) continue;
        const ratio = contrastRatio(fg, bg);
        const needed = isLargeText(el) ? 3 : 4.5;
        if (ratio < needed) {
          add("color-contrast", el, `Contrast ${ratio}:1 is below ${needed}:1 for "${shorten(el.textContent ?? "", 30)}".`, `Darken the text or lighten the background until the ratio is at least ${needed}:1.`);
        }
      }
      const min = options.minTargetSize ?? 24;
      for (const el of queryAll(root, INTERACTIVE)) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (el.tagName === "A" && el.closest("p,li,td")) continue;
        if (rect.width < min || rect.height < min) {
          add("target-size", el, `Target is ${Math.round(rect.width)}\xD7${Math.round(rect.height)}px (minimum ${min}\xD7${min}).`, `Increase padding so it's at least ${min}\xD7${min}px (44\xD744 is better for seniors).`);
        }
      }
    }
    return buildReport(issues, doc, skip);
  }
  function buildReport(issues, doc, skip) {
    var _a;
    const checks = Object.keys(AUDIT_RULES).filter((rule) => !skip.has(rule)).map((rule) => {
      const issueCount = issues.filter((i) => i.rule === rule).length;
      return { rule, title: AUDIT_RULES[rule].title, passed: issueCount === 0, issueCount };
    });
    let penalty = 0;
    for (const check of checks) {
      const weight = SEVERITY_WEIGHT[AUDIT_RULES[check.rule].severity];
      penalty += Math.min(25, check.issueCount * weight);
    }
    const score = Math.max(0, 100 - penalty);
    const failed = checks.filter((c) => !c.passed);
    const critical = issues.filter((i) => i.severity === "critical").length;
    return {
      url: ((_a = doc == null ? void 0 : doc.location) == null ? void 0 : _a.href) ?? "",
      title: (doc == null ? void 0 : doc.title) ?? "",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      score,
      passed: critical === 0 && score >= 80,
      checks,
      issues,
      summary: issues.length === 0 ? `All ${checks.length} checks passed.` : `${checks.length - failed.length} of ${checks.length} checks passed. ${issues.length} issue(s) found, ${critical} critical. Score ${score}/100.`
    };
  }
  function auditToMarkdown(report) {
    const lines = [
      `# Accessibility QA report`,
      ``,
      `- Page: ${report.title || "(untitled)"} ${report.url}`,
      `- Generated: ${report.generatedAt}`,
      `- Score: **${report.score}/100** \u2014 ${report.passed ? "PASS" : "FAIL"}`,
      ``,
      report.summary,
      ``,
      `## Checks`,
      ``,
      `| Check | Result | Issues |`,
      `|---|---|---|`,
      ...report.checks.map((c) => `| ${c.title} | ${c.passed ? "\u2705 Pass" : "\u274C Fail"} | ${c.issueCount} |`)
    ];
    if (report.issues.length) {
      lines.push(``, `## Issues`, ``);
      for (const i of report.issues) {
        lines.push(
          `### ${i.id} \xB7 ${i.severity} \xB7 WCAG ${i.wcag}`,
          ``,
          `- **Problem:** ${i.message}`,
          `- **Why it matters:** ${i.why}`,
          `- **Fix:** ${i.fix}`,
          `- **Where:** \`${i.selector}\``,
          ``
        );
      }
    }
    return lines.join("\n");
  }
  function auditToJSON(report) {
    return JSON.stringify({ ...report, issues: report.issues.map(({ element: _e, ...rest }) => rest) }, null, 2);
  }

  // src/agentic/a11yCopilot.ts
  function createA11yCopilot(options = {}) {
    let report = null;
    let observer = null;
    let timer = null;
    let applying = false;
    const undo = [];
    const state = () => ({ report, watching: observer !== null, appliedFixes: undo.length });
    const notify = () => {
      var _a;
      return (_a = options.onUpdate) == null ? void 0 : _a.call(options, state());
    };
    const find = (issueId) => report == null ? void 0 : report.issues.find((i) => i.id === issueId);
    const setAttr = (el, attribute, value) => {
      undo.push({ element: el, attribute, previous: el.getAttribute(attribute) });
      el.setAttribute(attribute, value);
    };
    function fixIssue(issue) {
      const el = issue.element;
      const done = (applied, message) => ({ issueId: issue.id, applied, message });
      if (!issue.autoFixable || !el) return done(false, "This needs a human decision \u2014 see the suggested fix.");
      switch (issue.rule) {
        case "html-lang": {
          const lang = options.defaultLang || (isBrowser() ? navigator.language : "") || "en";
          setAttr(el, "lang", lang);
          return done(true, `Set lang="${lang}" on <html>.`);
        }
        case "image-alt": {
          const title = el.getAttribute("title");
          if (!title) break;
          setAttr(el, "alt", title);
          return done(true, `Used the image title as alt text: "${title}".`);
        }
        case "form-label": {
          const hint = el.getAttribute("placeholder") || el.getAttribute("name");
          if (!hint) break;
          const label = hint.replace(/[_-]+/g, " ").trim();
          setAttr(el, "aria-label", label);
          return done(true, `Added aria-label="${label}". A visible <label> is still better.`);
        }
        case "button-name":
        case "link-name": {
          const title = el.getAttribute("title");
          if (!title) break;
          setAttr(el, "aria-label", title);
          return done(true, `Added aria-label="${title}".`);
        }
        case "positive-tabindex": {
          setAttr(el, "tabindex", "0");
          return done(true, "Changed tabindex to 0 so the natural order applies.");
        }
        case "keyboard-access": {
          setAttr(el, "tabindex", "0");
          if (!el.getAttribute("role")) setAttr(el, "role", "button");
          const listener = (e) => {
            const key = e.key;
            if (key === "Enter" || key === " ") {
              e.preventDefault();
              el.click();
            }
          };
          el.addEventListener("keydown", listener);
          undo.push({ element: el, attribute: "", previous: null, listener });
          return done(true, "Made it focusable and added Enter/Space support.");
        }
        default:
          break;
      }
      return done(false, "No safe automatic fix for this one \u2014 see the suggested fix.");
    }
    function scan() {
      report = runQaAudit(options);
      if (options.autoApply) {
        applying = true;
        const results = report.issues.filter((i) => i.autoFixable).map(fixIssue);
        applying = false;
        if (results.some((r) => r.applied)) report = runQaAudit(options);
      }
      notify();
      return report;
    }
    return {
      start() {
        if (!isBrowser() || observer) return;
        const root = resolveRoot(options.root);
        const target = isDocument(root) ? root.body : root;
        if (!target) return;
        observer = new MutationObserver((mutations) => {
          if (applying) return;
          const relevant = mutations.some((m) => {
            var _a, _b;
            return !((_b = (_a = m.target).closest) == null ? void 0 : _b.call(_a, "[data-yuktai-panel]"));
          });
          if (!relevant) return;
          if (timer) clearTimeout(timer);
          timer = setTimeout(scan, options.debounceMs ?? 600);
        });
        observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ["alt", "aria-label", "aria-invalid", "tabindex", "lang", "title"] });
        scan();
      },
      stop() {
        observer == null ? void 0 : observer.disconnect();
        observer = null;
        if (timer) clearTimeout(timer);
        timer = null;
        notify();
      },
      scan,
      explain(issueId) {
        const issue = find(issueId);
        if (!issue) return `No issue "${issueId}" in the current report. Run a scan first.`;
        return [
          `${issue.message}`,
          `Why it matters: ${issue.why}`,
          `How to fix: ${issue.fix}`,
          `Standard: WCAG ${issue.wcag} (${issue.severity}).`,
          issue.autoFixable ? "I can apply a safe fix for this in the browser." : "This one needs a change in your code."
        ].join("\n");
      },
      applyFix(issueId) {
        const issue = find(issueId);
        if (!issue) return { issueId, applied: false, message: "Issue not found. Run a scan first." };
        applying = true;
        const result = fixIssue(issue);
        applying = false;
        if (result.applied) scan();
        return result;
      },
      applyAllFixes() {
        if (!report) scan();
        applying = true;
        const results = ((report == null ? void 0 : report.issues) ?? []).filter((i) => i.autoFixable).map(fixIssue);
        applying = false;
        scan();
        return results;
      },
      undoAll() {
        const count = undo.length;
        applying = true;
        while (undo.length) {
          const entry = undo.pop();
          if (entry.listener) entry.element.removeEventListener("keydown", entry.listener);
          else if (entry.previous === null) entry.element.removeAttribute(entry.attribute);
          else entry.element.setAttribute(entry.attribute, entry.previous);
        }
        applying = false;
        scan();
        return count;
      },
      getState: state
    };
  }

  // src/agentic/formReview.ts
  var VAGUE_LABELS = /^(field|input|value|text|enter|details?|info|data|\*|:)$/i;
  var VAGUE_BUTTONS = /^(go|ok|submit|send|click here|>|→|next)$/i;
  var AUTOCOMPLETE_HINTS = [
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
    [/dob|birth/i, "bday"]
  ];
  function hasVisibleLabel(el) {
    const id = el.getAttribute("id");
    if (id && el.ownerDocument.querySelector(`label[for="${id.replace(/"/g, '\\"')}"]`)) return true;
    return Boolean(el.closest("label"));
  }
  function readFormFields(form) {
    return queryAll(form, "input,select,textarea").filter((el) => !["hidden", "submit", "button", "reset", "image"].includes((el.getAttribute("type") ?? "text").toLowerCase())).map((el) => ({
      label: accessibleName(el),
      type: el.tagName === "INPUT" ? (el.getAttribute("type") ?? "text").toLowerCase() : el.tagName.toLowerCase(),
      name: el.getAttribute("name") ?? el.getAttribute("id") ?? "",
      required: el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
      hasVisibleLabel: hasVisibleLabel(el),
      selector: selectorFor(el),
      element: el
    }));
  }
  function reviewForm(form, options = {}) {
    var _a;
    const senior = options.seniorFriendly !== false;
    const maxFields = options.maxFieldsPerStep ?? 8;
    const fields = readFormFields(form);
    const findings = [];
    const add = (level, message, suggestion, field) => findings.push({ level, message, suggestion, field: (field == null ? void 0 : field.label) || (field == null ? void 0 : field.name), selector: field == null ? void 0 : field.selector });
    for (const f of fields) {
      const el = f.element;
      const display = f.label || f.name || f.type;
      const placeholder = el.getAttribute("placeholder");
      if (!f.label && placeholder) {
        add("problem", `"${placeholder}" uses only a placeholder as its label.`, "Placeholders disappear when typing starts and aren't read by every screen reader. Add a visible label above the field.", f);
      } else if (!f.label) {
        add("problem", `A ${f.type} field${f.name ? ` ("${f.name}")` : ""} has no label.`, "Add a visible <label> that says exactly what to enter.", f);
      } else if (!f.hasVisibleLabel && placeholder && !el.getAttribute("aria-label")) {
        add("problem", `"${display}" uses only a placeholder as its label.`, "Placeholders disappear when typing starts. Add a visible label above the field.", f);
      } else if (VAGUE_LABELS.test(f.label)) {
        add("improvement", `The label "${f.label}" is unclear.`, 'Say exactly what is needed, e.g. "Mobile number (10 digits)".', f);
      }
      if (f.required && f.label && !/\*|required|mandatory|తప్పనిసరి|आवश्यक/i.test(f.label)) {
        add("improvement", `"${display}" is required but the label doesn't say so.`, 'Add "(required)" to the label so everyone knows before submitting.', f);
      }
      const key = `${f.name} ${f.label}`;
      for (const [pattern, token, type] of AUTOCOMPLETE_HINTS) {
        if (!pattern.test(key)) continue;
        if (!el.getAttribute("autocomplete")) {
          add("improvement", `"${display}" has no autocomplete hint.`, `Add autocomplete="${token}" so browsers can fill it in (WCAG 1.3.5).`, f);
        }
        if (type && f.type === "text") {
          add("improvement", `"${display}" uses type="text".`, `Use type="${type}" for the right mobile keyboard and validation.`, f);
        }
        break;
      }
      if (el.getAttribute("aria-invalid") === "true" && !el.getAttribute("aria-describedby") && !el.getAttribute("aria-errormessage")) {
        add("problem", `"${display}" shows an error that isn't connected to the field.`, "Link the error text with aria-describedby and explain how to fix it.", f);
      }
      if (senior) {
        const size = parseFloat(window.getComputedStyle(el).fontSize) || 16;
        if (size < 16) {
          add("improvement", `"${display}" text is ${size}px.`, "Use at least 16px in inputs; it is easier to read and stops mobile browsers from zooming.", f);
        }
      }
    }
    if (fields.length > maxFields) {
      add("improvement", `This form has ${fields.length} fields on one screen.`, `Split it into steps of about ${maxFields} fields with a progress indicator.`);
    }
    const submit = queryAll(form, "button,input[type='submit'],input[type='button']");
    if (submit.length === 0) {
      add("problem", "No submit button found.", 'Add a clear <button type="submit"> so the form can be completed with the keyboard.');
    } else if (senior) {
      const label = cleanText(accessibleName(submit[submit.length - 1]));
      if (VAGUE_BUTTONS.test(label)) {
        add("improvement", `The button says "${label}".`, 'Name the result, e.g. "Send message" or "Book appointment".');
      }
    }
    if (!queryAll(form, "[role='alert'],[aria-live]", { includeHidden: true }).length && fields.some((f) => f.required)) {
      add("improvement", "No live region for error messages.", 'Add an element with role="alert" so errors are announced when the form is submitted.');
    }
    const problems = findings.filter((f) => f.level === "problem").length;
    const improvements = findings.length - problems;
    const score = Math.max(0, 100 - problems * 15 - improvements * 4);
    const name = form.getAttribute("aria-label") || cleanText((_a = form.querySelector("legend,h1,h2,h3")) == null ? void 0 : _a.textContent) || form.getAttribute("name") || form.getAttribute("id") || "Form";
    return {
      name: shorten(name, 50),
      selector: selectorFor(form),
      fields,
      findings,
      score,
      summary: findings.length === 0 ? `"${shorten(name, 40)}" looks clear: ${fields.length} labelled field(s), nothing to fix.` : `"${shorten(name, 40)}" has ${fields.length} field(s): ${problems} problem(s) and ${improvements} suggestion(s). Score ${score}/100.`
    };
  }
  function reviewForms(options = {}) {
    const root = resolveRoot(options.root);
    if (!root) return [];
    return queryAll(root, "form,[role='form']").map((form) => reviewForm(form, options));
  }

  // src/agentic/pageInsights.ts
  function analyzePage(root) {
    var _a;
    const r = resolveRoot(root);
    const empty = {
      title: "",
      description: "",
      language: "",
      headings: [],
      landmarks: {},
      counts: { links: 0, buttons: 0, images: 0, forms: 0, tables: 0, fields: 0 },
      unlabeledFields: [],
      imagesWithoutAlt: [],
      purpose: ""
    };
    if (!r) return empty;
    const doc = isDocument(r) ? r : r.ownerDocument;
    const headings = queryAll(r, "h1,h2,h3,h4,h5,h6").map((h2) => ({ level: Number(h2.tagName[1]), text: shorten(h2.textContent ?? "", 80) }));
    const landmarks = {};
    for (const [name, sel] of Object.entries({
      header: "header,[role='banner']",
      navigation: "nav,[role='navigation']",
      main: "main,[role='main']",
      search: "search,[role='search']",
      footer: "footer,[role='contentinfo']"
    })) landmarks[name] = queryAll(r, sel).length;
    const fields = queryAll(r, "input,select,textarea").filter(
      (el) => !["hidden", "submit", "button", "reset", "image"].includes((el.getAttribute("type") ?? "text").toLowerCase())
    );
    const unlabeledFields = fields.filter((el) => !accessibleName(el)).map((el) => ({
      type: el.tagName === "INPUT" ? el.getAttribute("type") ?? "text" : el.tagName.toLowerCase(),
      hint: el.getAttribute("placeholder") || el.getAttribute("name") || "",
      selector: selectorFor(el)
    }));
    const imagesWithoutAlt = queryAll(r, "img:not([alt])").map((img) => ({ src: img.getAttribute("src") ?? "", selector: selectorFor(img) }));
    const outline = {
      title: doc.title,
      description: cleanText((_a = doc.querySelector('meta[name="description"]')) == null ? void 0 : _a.getAttribute("content")),
      language: doc.documentElement.getAttribute("lang") ?? "",
      headings,
      landmarks,
      counts: {
        links: queryAll(r, "a[href]").length,
        buttons: queryAll(r, "button,[role='button'],input[type='submit']").length,
        images: queryAll(r, "img").length,
        forms: queryAll(r, "form,[role='form']").length,
        tables: queryAll(r, "table,[role='grid'],[role='table']").length,
        fields: fields.length
      },
      unlabeledFields,
      imagesWithoutAlt,
      purpose: ""
    };
    outline.purpose = describePurpose(outline, fields);
    return outline;
  }
  function describePurpose(o, fields) {
    var _a;
    const name = ((_a = o.headings.find((h2) => h2.level === 1)) == null ? void 0 : _a.text) || o.title || "This page";
    const text = fields.map((f) => `${f.getAttribute("type")} ${f.getAttribute("name")} ${accessibleName(f)}`).join(" ").toLowerCase();
    const actions = [];
    if (/password/.test(text)) actions.push("sign in or create an account");
    else if (/search|query|వెతుకు/.test(text) || o.landmarks.search) actions.push("search");
    if (/message|comment|feedback|contact|enquiry/.test(text)) actions.push("send a message");
    if (/card|payment|upi|amount/.test(text)) actions.push("make a payment");
    if (o.counts.tables) actions.push(`browse ${o.counts.tables} table(s) of data`);
    if (!actions.length && o.counts.forms) actions.push(`fill in ${o.counts.forms} form(s)`);
    if (!actions.length) actions.push("read content");
    const sections = o.headings.filter((h2) => h2.level === 2).slice(0, 5).map((h2) => h2.text);
    return [
      `"${name}" lets you ${actions.join(", ")}.`,
      o.description ? `It describes itself as: ${shorten(o.description, 140)}` : "",
      sections.length ? `Main sections: ${sections.join(" \xB7 ")}.` : ""
    ].filter(Boolean).join(" ");
  }
  var INTENTS = [
    ["missing-labels", /label|unlabel|లేబుల్/i],
    ["images", /image|alt text|picture|photo|చిత్ర/i],
    ["structure", /heading|structure|outline|section|landmark|శీర్షిక/i],
    ["forms", /form|field|input|ఫారం/i],
    ["links", /link|లింక్/i],
    ["counts", /how many|count|ఎన్ని/i],
    ["purpose", /what (does|is)|purpose|about|summar|explain|ఏమి|గురించి/i]
  ];
  function detectPageIntent(question) {
    for (const [intent, pattern] of INTENTS) if (pattern.test(question)) return intent;
    return "unknown";
  }
  async function askAboutPage(question, options = {}) {
    var _a;
    const o = analyzePage(options.root);
    const intent = detectPageIntent(question);
    switch (intent) {
      case "missing-labels": {
        if (!o.unlabeledFields.length) {
          return { intent, answer: `All ${o.counts.fields} form field(s) have labels.`, targets: [], suggestions: [] };
        }
        return {
          intent,
          answer: `${o.unlabeledFields.length} of ${o.counts.fields} field(s) have no label: ${o.unlabeledFields.map((f) => `${f.type}${f.hint ? ` ("${f.hint}")` : ""}`).join(", ")}.`,
          targets: o.unlabeledFields.map((f) => f.selector),
          suggestions: ["Add a visible <label for=\u2026> to each field.", "Run the Accessibility Copilot to add aria-labels from placeholders as a quick fix."]
        };
      }
      case "images":
        return {
          intent,
          answer: o.imagesWithoutAlt.length ? `${o.imagesWithoutAlt.length} of ${o.counts.images} image(s) have no alt text.` : `All ${o.counts.images} image(s) have alt text.`,
          targets: o.imagesWithoutAlt.map((i) => i.selector),
          suggestions: o.imagesWithoutAlt.length ? ['Describe meaningful images in alt; use alt="" for decorative ones.'] : []
        };
      case "structure": {
        const outline = o.headings.slice(0, 15).map((h2) => `${"  ".repeat(h2.level - 1)}h${h2.level} ${h2.text}`).join("\n");
        const missing = Object.entries(o.landmarks).filter(([, n]) => n === 0).map(([k]) => k);
        return {
          intent,
          answer: `${o.headings.length} heading(s).
${outline}${missing.length ? `
Missing landmarks: ${missing.join(", ")}.` : ""}`,
          targets: [],
          suggestions: missing.includes("main") ? ["Wrap the primary content in <main>."] : []
        };
      }
      case "forms": {
        const reviews = reviewForms({ root: options.root });
        return {
          intent,
          answer: reviews.length ? reviews.map((r) => r.summary).join("\n") : "There are no forms on this page.",
          targets: reviews.flatMap((r) => r.findings.map((f) => f.selector).filter((s) => Boolean(s))),
          suggestions: reviews.flatMap((r) => r.findings.slice(0, 3).map((f) => f.suggestion))
        };
      }
      case "links":
      case "counts": {
        const c = o.counts;
        return {
          intent,
          answer: `${c.links} links, ${c.buttons} buttons, ${c.fields} form fields in ${c.forms} form(s), ${c.images} images, ${c.tables} tables.`,
          targets: [],
          suggestions: []
        };
      }
      case "purpose":
      case "unknown": {
        let answer = o.purpose;
        if (options.summarize) {
          try {
            const r = resolveRoot(options.root);
            const text = cleanText((_a = r && isDocument(r) ? r.body : r) == null ? void 0 : _a.textContent).slice(0, 4e3);
            answer = await options.summarize(text) || answer;
          } catch {
          }
        }
        const suggestions = [];
        if (o.unlabeledFields.length) suggestions.push(`${o.unlabeledFields.length} form field(s) need labels.`);
        if (o.imagesWithoutAlt.length) suggestions.push(`${o.imagesWithoutAlt.length} image(s) need alt text.`);
        return { intent, answer, targets: [], suggestions };
      }
    }
  }

  // src/agentic/contextIndex.ts
  var STOP = new Set(
    "a an the is are was were be to of and or in on at for with what which who whom how why when where does do did this that these those it its from by as about any all please tell me show give".split(" ")
  );
  function tokenize(text) {
    return (text.normalize("NFC").toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).filter((t) => t.length > 1 && !STOP.has(t));
  }
  function pagePassages(root, maxChars = 600) {
    const r = resolveRoot(root);
    if (!r) return [];
    const out = [];
    let heading = "";
    let buffer = "";
    const flush = () => {
      if (buffer.trim()) out.push({ id: `page-${out.length + 1}`, source: "page", text: buffer.trim(), ref: heading || void 0 });
      buffer = "";
    };
    for (const el of queryAll(r, "h1,h2,h3,h4,p,li,td,th,dt,dd,blockquote,figcaption,label,summary")) {
      if (el.querySelector("p,li,h1,h2,h3,h4")) continue;
      const text = cleanText(el.textContent);
      if (!text) continue;
      if (/^H[1-4]$/.test(el.tagName)) {
        flush();
        heading = text;
        buffer = `${text}. `;
        continue;
      }
      if (buffer.length + text.length > maxChars) flush();
      buffer += `${text} `;
    }
    flush();
    return out;
  }
  function gridPassages(data, columns, rowKey = "id") {
    return data.map((row, i) => {
      const r = row;
      const id = String(r[rowKey] ?? i + 1);
      return {
        id: `grid-${id}`,
        source: "grid",
        ref: id,
        text: columns.map((c) => `${c.label}: ${String(r[c.key] ?? "")}`).join(". ")
      };
    });
  }
  function createContextIndex(options = {}) {
    let passages = [];
    let docs = [];
    let df = /* @__PURE__ */ new Map();
    let avgLen = 0;
    function rebuild() {
      passages = [
        ...options.includePage === false ? [] : pagePassages(options.root),
        ...options.rows && options.columns ? gridPassages(options.rows, options.columns, options.rowKey) : [],
        ...(options.documents ?? []).map((d) => ({ id: d.id, source: "custom", text: d.text }))
      ];
      docs = passages.map((p) => tokenize(p.text));
      df = /* @__PURE__ */ new Map();
      for (const tokens of docs) for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
      avgLen = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, docs.length);
    }
    rebuild();
    function search(question, k = 5) {
      const q = tokenize(question);
      if (!q.length) return [];
      const N = docs.length;
      const scored = docs.map((tokens, i) => {
        let score = 0;
        for (const term of q) {
          let tf = 0;
          for (const t of tokens) if (t === term || term.length >= 4 && t.startsWith(term) || t.length >= 4 && term.startsWith(t)) tf++;
          if (!tf) continue;
          const idf = Math.log(1 + (N - (df.get(term) ?? 1) + 0.5) / ((df.get(term) ?? 1) + 0.5));
          score += idf * (tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * (tokens.length / (avgLen || 1)))));
        }
        return { ...passages[i], score };
      });
      return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
    }
    async function ask(question, opts = {}) {
      const hits = search(question, opts.k ?? 4);
      if (!hits.length) return { answer: "I couldn't find anything about that on this page or in the data.", hits, generated: false };
      if (opts.generate) {
        try {
          const context = hits.map((h2, i) => `[${i + 1}] ${h2.text}`).join("\n");
          const answer2 = await opts.generate(question, context);
          if (answer2 == null ? void 0 : answer2.trim()) return { answer: answer2.trim(), hits, generated: true };
        } catch {
        }
      }
      const qTokens = new Set(tokenize(question));
      const sentences = hits.flatMap((h2) => h2.text.split(new RegExp("(?<=[.!?\u0964])\\s+|\\.\\s+(?=\\p{Lu})", "u")).map((s) => ({ s: s.trim(), h: h2 }))).map(({ s, h: h2 }) => ({ s, h: h2, overlap: tokenize(s).filter((t) => qTokens.has(t)).length })).filter((x) => x.s && x.overlap > 0).sort((a, b) => b.overlap - a.overlap).slice(0, 3);
      const answer = sentences.length ? sentences.map((x) => x.h.source === "grid" ? `Row ${x.h.ref}: ${x.s}` : x.s).join("\n") : hits[0].text.slice(0, 300);
      return { answer, hits, generated: false };
    }
    return {
      search,
      ask,
      /** Call after the page or data changes. */
      rebuild,
      update(next) {
        Object.assign(options, next);
        rebuild();
      },
      size: () => passages.length
    };
  }

  // src/agentic/designReview.ts
  var WEIGHT = { high: 12, medium: 6, low: 2 };
  function reviewDesign(options = {}) {
    const root = resolveRoot(options.root);
    const findings = [];
    const add = (category, severity, message, suggestion, el) => findings.push({ category, severity, message, suggestion, selector: el ? selectorFor(el) : void 0 });
    if (root && isBrowser()) {
      const minFont = options.minFontSize ?? 14;
      const maxLine = options.maxLineLength ?? 90;
      const style = (el) => window.getComputedStyle(el);
      const h1 = queryAll(root, "h1");
      if (h1.length === 0) add("hierarchy", "medium", "There is no h1, so the page has no clear main title.", "Add one prominent h1 near the top.");
      if (h1.length > 1) add("hierarchy", "low", `${h1.length} h1 headings compete for attention.`, "Keep one h1 and demote the rest.", h1[1]);
      const sizeOf = (sel) => {
        const el = queryAll(root, sel)[0];
        return el ? parseFloat(style(el).fontSize) || 0 : 0;
      };
      const [s1, s2, s3] = [sizeOf("h1"), sizeOf("h2"), sizeOf("h3")];
      if (s1 && s2 && s2 >= s1) add("hierarchy", "medium", `h2 (${s2}px) is as large as or larger than h1 (${s1}px).`, "Make each heading level visibly smaller than the one above it.");
      if (s2 && s3 && s3 > s2) add("hierarchy", "low", `h3 (${s3}px) is larger than h2 (${s2}px).`, "Keep heading sizes in descending order.");
      const audit = runQaAudit({ root: options.root, skip: ["color-contrast", "target-size", "duplicate-id", "page-title", "html-lang", "form-error", "positive-tabindex"] });
      for (const issue of audit.issues.filter((i) => i.rule === "heading-order").slice(0, 3)) {
        add("hierarchy", "low", issue.message, issue.fix, issue.element);
      }
      let tiny = 0;
      let tinyExample;
      for (const el of queryAll(root, "p,li,td,span,a,label,small,div").slice(0, 1500)) {
        if (!hasDirectText(el)) continue;
        const size = parseFloat(style(el).fontSize) || 16;
        if (size < minFont) {
          tiny++;
          tinyExample ??= el;
        }
      }
      if (tiny) add("readability", tiny > 10 ? "high" : "medium", `${tiny} text element(s) are smaller than ${minFont}px, e.g. "${shorten((tinyExample == null ? void 0 : tinyExample.textContent) ?? "", 30)}".`, `Use at least ${minFont}px for body text (16px for senior-friendly pages).`, tinyExample);
      for (const p of queryAll(root, "p").slice(0, 200)) {
        const s = style(p);
        const size = parseFloat(s.fontSize) || 16;
        const width = p.getBoundingClientRect().width;
        const chars = width / (size * 0.5);
        if (width > 0 && chars > maxLine && (p.textContent ?? "").length > maxLine) {
          add("readability", "low", `A paragraph is about ${Math.round(chars)} characters wide.`, `Limit text width to ~${maxLine} characters (e.g. max-width: 70ch).`, p);
          break;
        }
        const lh = parseFloat(s.lineHeight);
        if (Number.isFinite(lh) && lh / size < 1.3) {
          add("readability", "low", `Line height is ${(lh / size).toFixed(2)}\xD7 the font size.`, "Use line-height of at least 1.5 for body text (WCAG 1.4.12).", p);
          break;
        }
      }
      const contrast = runQaAudit({ root: options.root, skip: ["html-lang", "page-title", "image-alt", "heading-order", "single-h1", "landmark-main", "form-label", "button-name", "link-name", "positive-tabindex", "keyboard-access", "duplicate-id", "form-error", "target-size"] });
      if (contrast.issues.length) {
        add("readability", contrast.issues.length > 5 ? "high" : "medium", `${contrast.issues.length} text element(s) have weak contrast. ${contrast.issues[0].message}`, "Raise contrast to at least 4.5:1 for body text.", contrast.issues[0].element);
      }
      const removedFocus = findRemovedFocusOutlines();
      if (removedFocus.length) {
        add("interaction", "high", `Focus outlines are removed by CSS (${removedFocus.slice(0, 2).join(", ")}) with no replacement.`, "Never remove outlines without a visible :focus-visible style (WCAG 2.4.7).");
      }
      const small = queryAll(root, INTERACTIVE).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24) && !(el.tagName === "A" && el.closest("p,li"));
      });
      if (small.length) add("interaction", small.length > 5 ? "high" : "medium", `${small.length} control(s) are smaller than 24\xD724px.`, "Give controls at least 24\xD724px, ideally 44\xD744px for touch and seniors.", small[0]);
      const viewportH = window.innerHeight || 800;
      const aboveFold = queryAll(root, FOCUSABLE).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.top < viewportH;
      });
      if (aboveFold.length > 40) add("clutter", "medium", `${aboveFold.length} interactive elements in the first screen.`, "Group secondary actions into menus and keep the first screen focused on one task.");
      const primaryButtons = queryAll(root, "button,a[href],[role='button']").filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.top > viewportH) return false;
        const bg = style(el).backgroundColor;
        return Boolean(bg) && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && !/rgb\(255, 255, 255\)/.test(bg);
      });
      if (primaryButtons.length > 4) add("clutter", "medium", `${primaryButtons.length} filled buttons compete in the first screen.`, "Keep one primary action per view; make the rest secondary (outline or text).", primaryButtons[0]);
      const families = /* @__PURE__ */ new Set();
      const sizes = /* @__PURE__ */ new Set();
      for (const el of queryAll(root, "body *").slice(0, 2e3)) {
        if (!hasDirectText(el)) continue;
        const s = style(el);
        families.add(s.fontFamily.split(",")[0].replace(/["']/g, "").trim().toLowerCase());
        sizes.add(Math.round(parseFloat(s.fontSize) || 0));
      }
      if (families.size > 4) add("consistency", "low", `${families.size} different font families are used.`, "Stick to 1\u20132 font families (e.g. one Telugu + one Latin).");
      if (sizes.size > 10) add("consistency", "low", `${sizes.size} different font sizes are used.`, "Use a small type scale (5\u20137 sizes) for a calmer page.");
      const imgsNoSize = queryAll(root, "img:not([width]):not([height])").filter((img) => !style(img).aspectRatio || style(img).aspectRatio === "auto");
      if (imgsNoSize.length > 3) add("consistency", "low", `${imgsNoSize.length} images have no width/height, so the layout jumps while loading.`, "Set width and height (or aspect-ratio) on images.", imgsNoSize[0]);
    }
    const categories = ["hierarchy", "readability", "interaction", "clutter", "consistency"].reduce(
      (acc, cat) => {
        const list = findings.filter((f) => f.category === cat);
        acc[cat] = { score: Math.max(0, 100 - list.reduce((n, f) => n + WEIGHT[f.severity] * 2, 0)), findings: list.length };
        return acc;
      },
      {}
    );
    const score = Math.max(0, 100 - findings.reduce((n, f) => n + WEIGHT[f.severity], 0));
    const worst = Object.entries(categories).sort((a, b) => a[1].score - b[1].score)[0];
    return {
      score,
      categories,
      findings,
      summary: findings.length ? `Design score ${score}/100 with ${findings.length} finding(s). Weakest area: ${worst[0]}.` : "No design issues found by the automatic review."
    };
  }
  function findRemovedFocusOutlines() {
    const out = [];
    let focusVisibleStyled = false;
    const visit = (rules) => {
      for (const rule of Array.from(rules)) {
        const nested = rule.cssRules;
        if (nested) visit(nested);
        const r = rule;
        if (!r.selectorText || !/:focus/.test(r.selectorText)) continue;
        const outline = `${r.style.outline} ${r.style.outlineStyle} ${r.style.outlineWidth}`;
        const removes = /\bnone\b|\b0(px)?\b/.test(outline);
        const replaces = Boolean(r.style.boxShadow && r.style.boxShadow !== "none") || Boolean(r.style.borderColor) || Boolean(r.style.backgroundColor) || Boolean(r.style.textDecoration);
        if (/:focus-visible/.test(r.selectorText) && (!removes || replaces)) focusVisibleStyled = true;
        if (removes && !replaces) out.push(r.selectorText);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        visit(sheet.cssRules);
      } catch {
      }
    }
    return focusVisibleStyled ? [] : out;
  }

  // src/core/ai/rewriter.ts
  function getRewriterAPI() {
    var _a;
    const w = window;
    return w.Rewriter || ((_a = w.ai) == null ? void 0 : _a.rewriter) || null;
  }
  async function checkRewriterSupport() {
    try {
      const API = getRewriterAPI();
      if (!API) return false;
      if (typeof API.availability === "function") {
        const status = await API.availability();
        return status === "readily" || status === "available" || status === "downloadable";
      }
      if (typeof API.capabilities === "function") {
        const caps = await API.capabilities();
        return (caps == null ? void 0 : caps.available) !== "no";
      }
      return typeof API.create === "function";
    } catch {
      return false;
    }
  }
  async function rewriteText(text) {
    if (!text || text.trim().length < 20) {
      return { success: false, original: text, rewritten: text, error: "Text too short" };
    }
    try {
      const API = getRewriterAPI();
      if (!API) throw new Error("Rewriter API not available");
      const rewriter = await API.create({
        tone: "more-casual",
        format: "plain-text",
        length: "as-is",
        outputLanguage: "en"
      });
      const rewritten = await rewriter.rewrite(text, {
        context: "Rewrite this text in simple plain English. Use short sentences. Avoid jargon. Make it easy to understand for everyone."
      });
      rewriter.destroy();
      return {
        success: true,
        original: text,
        rewritten: rewritten.trim()
      };
    } catch (error) {
      return {
        success: false,
        original: text,
        rewritten: text,
        error: error instanceof Error ? error.message : "Rewrite failed"
      };
    }
  }
  async function rewritePage() {
    var _a;
    const supported = await checkRewriterSupport();
    if (!supported) {
      return { fixed: 0, error: "Chrome Built-in AI Rewriter not available. Enable via chrome://flags." };
    }
    const textElements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption"
    );
    let fixed = 0;
    for (const el of textElements) {
      const original = (_a = el.innerText) == null ? void 0 : _a.trim();
      if (!original || original.length < 20) continue;
      if (el.closest("[data-yuktai-panel]")) continue;
      const result = await rewriteText(original);
      if (result.success && result.rewritten !== original) {
        el.dataset.yuktaiOriginal = original;
        el.innerText = result.rewritten;
        fixed++;
      }
    }
    return { fixed };
  }
  function restorePage() {
    const rewritten = document.querySelectorAll("[data-yuktai-original]");
    for (const el of rewritten) {
      const original = el.dataset.yuktaiOriginal;
      if (original) {
        el.innerText = original;
        delete el.dataset.yuktaiOriginal;
      }
    }
  }

  // src/core/ai/summarizer.ts
  var SUMMARY_BOX_ID = "yuktai-summary-box";
  function getSummarizerAPI() {
    var _a;
    const w = window;
    return w.Summarizer || ((_a = w.ai) == null ? void 0 : _a.summarizer) || null;
  }
  async function checkSummarizerSupport() {
    try {
      const API = getSummarizerAPI();
      if (!API) return false;
      if (typeof API.availability === "function") {
        const status = await API.availability();
        return status === "readily" || status === "available" || status === "downloadable";
      }
      if (typeof API.capabilities === "function") {
        const caps = await API.capabilities();
        return (caps == null ? void 0 : caps.available) !== "no";
      }
      return typeof API.create === "function";
    } catch {
      return false;
    }
  }
  function getPageText() {
    var _a;
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, blockquote, article, section"
    );
    const texts = [];
    for (const el of elements) {
      if (el.closest("[data-yuktai-panel]")) continue;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const text = (_a = el.innerText) == null ? void 0 : _a.trim();
      if (text && text.length > 10) texts.push(text);
    }
    return texts.join(" ").slice(0, 5e3);
  }
  async function summarizePage() {
    const supported = await checkSummarizerSupport();
    if (!supported) {
      return {
        success: false,
        summary: "",
        error: "Chrome Built-in AI Summarizer not available. Enable via chrome://flags."
      };
    }
    const pageText = getPageText();
    if (!pageText || pageText.length < 100) {
      return {
        success: false,
        summary: "",
        error: "Not enough text on this page to summarise."
      };
    }
    try {
      const API = getSummarizerAPI();
      if (!API) throw new Error("Summarizer API not available");
      const summarizer = await API.create({
        type: "tl;dr",
        format: "plain-text",
        length: "short",
        outputLanguage: "en"
      });
      const summary = await summarizer.summarize(pageText, {
        context: "Summarise this page in 2-3 simple sentences for a screen reader user who wants to know if this page is relevant to them."
      });
      summarizer.destroy();
      injectSummaryBox(summary.trim());
      return { success: true, summary: summary.trim() };
    } catch (error) {
      return {
        success: false,
        summary: "",
        error: error instanceof Error ? error.message : "Summary failed"
      };
    }
  }
  function injectSummaryBox(summary) {
    removeSummaryBox();
    const box = document.createElement("div");
    box.id = SUMMARY_BOX_ID;
    box.setAttribute("data-yuktai-panel", "true");
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Page summary by yuktai");
    box.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    background: #0d9488;
    color: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 10px 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;
    const text = document.createElement("p");
    text.style.cssText = "margin: 0; flex: 1;";
    text.textContent = `\u{1F4CB} Page summary: ${summary}`;
    const close = document.createElement("button");
    close.textContent = "\xD7";
    close.setAttribute("aria-label", "Close page summary");
    close.style.cssText = `
    background: none; border: none; color: #ffffff;
    font-size: 20px; cursor: pointer; padding: 0 4px;
    line-height: 1; flex-shrink: 0;
  `;
    close.addEventListener("click", removeSummaryBox);
    box.appendChild(text);
    box.appendChild(close);
    document.body.prepend(box);
  }
  function removeSummaryBox() {
    const existing = document.getElementById(SUMMARY_BOX_ID);
    if (existing) existing.remove();
  }

  // src/core/ai/translator.ts
  var SUPPORTED_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "it", label: "Italian" },
    { code: "pt", label: "Portuguese" },
    { code: "nl", label: "Dutch" },
    { code: "pl", label: "Polish" },
    { code: "ru", label: "Russian" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "zh", label: "Chinese" },
    { code: "ar", label: "Arabic" },
    { code: "tr", label: "Turkish" },
    { code: "vi", label: "Vietnamese" },
    { code: "bn", label: "Bengali" },
    { code: "id", label: "Indonesian" }
  ];
  var currentLanguage = "en";
  function getTranslatorAPI() {
    const w = window;
    return w.Translator || w.translation || null;
  }
  async function checkTranslatorSupport(targetLanguage) {
    try {
      const w = window;
      const API = getTranslatorAPI();
      if (!API) return false;
      if (w.Translator && typeof w.Translator.availability === "function") {
        try {
          const status = await w.Translator.availability({
            sourceLanguage: "en",
            targetLanguage
          });
          return status === "readily" || status === "available" || status === "downloadable" || status === "after-download";
        } catch {
        }
      }
      if (w.Translator && typeof w.Translator.canTranslate === "function") {
        const result = await w.Translator.canTranslate({
          sourceLanguage: "en",
          targetLanguage
        });
        return result !== "no";
      }
      if (w.translation && typeof w.translation.canTranslate === "function") {
        const result = await w.translation.canTranslate({
          sourceLanguage: "en",
          targetLanguage
        });
        return result !== "no";
      }
      return false;
    } catch {
      return false;
    }
  }
  async function createTranslator(targetLanguage) {
    const w = window;
    const options = {
      sourceLanguage: "en",
      targetLanguage
    };
    if (w.Translator && typeof w.Translator.create === "function") {
      return await w.Translator.create(options);
    }
    if (w.translation && typeof w.translation.createTranslator === "function") {
      return await w.translation.createTranslator(options);
    }
    throw new Error("Translation API not available");
  }
  async function translatePage(targetLanguage) {
    var _a;
    if (targetLanguage === currentLanguage) {
      return { success: true, language: targetLanguage, fixed: 0 };
    }
    if (targetLanguage === "en") {
      restoreOriginalText();
      currentLanguage = "en";
      return { success: true, language: "en", fixed: 0 };
    }
    const supported = await checkTranslatorSupport(targetLanguage);
    if (!supported) {
      return {
        success: false,
        language: targetLanguage,
        fixed: 0,
        error: `Translation to ${targetLanguage} not available. Enable via chrome://flags.`
      };
    }
    try {
      const translator = await createTranslator(targetLanguage);
      const elements = document.querySelectorAll(
        "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, label, figcaption, span, a"
      );
      let fixed = 0;
      for (const el of elements) {
        if (el.closest("[data-yuktai-panel]")) continue;
        if (el.children.length > 0) continue;
        const original = (_a = el.innerText) == null ? void 0 : _a.trim();
        if (!original || original.length < 2) continue;
        if (!el.dataset.yuktaiTranslationOriginal) {
          el.dataset.yuktaiTranslationOriginal = original;
        }
        const translated = await translator.translate(original);
        if (translated && translated !== original) {
          el.innerText = translated;
          fixed++;
        }
      }
      if (typeof translator.destroy === "function") translator.destroy();
      currentLanguage = targetLanguage;
      return { success: true, language: targetLanguage, fixed };
    } catch (error) {
      return {
        success: false,
        language: targetLanguage,
        fixed: 0,
        error: error instanceof Error ? error.message : "Translation failed"
      };
    }
  }
  function restoreOriginalText() {
    const translated = document.querySelectorAll(
      "[data-yuktai-translation-original]"
    );
    for (const el of translated) {
      const original = el.dataset.yuktaiTranslationOriginal;
      if (original) {
        el.innerText = original;
        delete el.dataset.yuktaiTranslationOriginal;
      }
    }
    currentLanguage = "en";
  }

  // src/core/ai/voice.ts
  var VOICE_COMMANDS = [
    {
      phrases: ["go to main", "skip to main", "main content"],
      action: "focus-main",
      label: "Jump to main content"
    },
    {
      phrases: ["go to navigation", "go to nav", "open menu"],
      action: "focus-nav",
      label: "Jump to navigation"
    },
    {
      phrases: ["go to search", "search", "find"],
      action: "focus-search",
      label: "Jump to search"
    },
    {
      phrases: ["scroll down", "page down", "next"],
      action: "scroll-down",
      label: "Scroll down"
    },
    {
      phrases: ["scroll up", "page up", "back up"],
      action: "scroll-up",
      label: "Scroll up"
    },
    {
      phrases: ["go back", "previous page"],
      action: "go-back",
      label: "Go back"
    },
    {
      phrases: ["click", "press", "select"],
      action: "click-focused",
      label: "Click focused element"
    },
    {
      phrases: ["next item", "tab forward", "tab"],
      action: "tab-forward",
      label: "Move to next element"
    },
    {
      phrases: ["previous item", "tab back", "shift tab"],
      action: "tab-back",
      label: "Move to previous element"
    },
    {
      phrases: ["stop listening", "stop voice", "quiet"],
      action: "stop-voice",
      label: "Stop voice control"
    }
  ];
  var recognition = null;
  var isListening = false;
  var onCommand = null;
  function checkVoiceSupport() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  function matchCommand(spoken) {
    const lower = spoken.toLowerCase().trim();
    for (const cmd of VOICE_COMMANDS) {
      for (const phrase of cmd.phrases) {
        if (lower.includes(phrase)) {
          return { action: cmd.action, label: cmd.label };
        }
      }
    }
    return null;
  }
  function executeAction(action) {
    switch (action) {
      case "focus-main": {
        const main = document.querySelector("main, [role='main'], #main");
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: "smooth" });
        }
        break;
      }
      case "focus-nav": {
        const nav = document.querySelector("nav, [role='navigation']");
        if (nav) {
          nav.focus();
          nav.scrollIntoView({ behavior: "smooth" });
        }
        break;
      }
      case "focus-search": {
        const search = document.querySelector(
          "input[type='search'], input[role='searchbox'], [aria-label*='search' i]"
        );
        if (search) {
          search.focus();
          search.scrollIntoView({ behavior: "smooth" });
        }
        break;
      }
      case "scroll-down": {
        window.scrollBy({ top: 400, behavior: "smooth" });
        break;
      }
      case "scroll-up": {
        window.scrollBy({ top: -400, behavior: "smooth" });
        break;
      }
      case "go-back": {
        window.history.back();
        break;
      }
      case "click-focused": {
        const focused = document.activeElement;
        if (focused && focused !== document.body) focused.click();
        break;
      }
      case "tab-forward": {
        const focusable = getFocusableElements();
        const current = focusable.indexOf(document.activeElement);
        const next = focusable[current + 1] || focusable[0];
        if (next) next.focus();
        break;
      }
      case "tab-back": {
        const focusable = getFocusableElements();
        const current = focusable.indexOf(document.activeElement);
        const prev = focusable[current - 1] || focusable[focusable.length - 1];
        if (prev) prev.focus();
        break;
      }
      case "stop-voice": {
        stopVoiceControl();
        break;
      }
    }
  }
  function getFocusableElements() {
    return Array.from(
      document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest("[data-yuktai-panel]"));
  }
  function startVoiceControl(callback) {
    if (!checkVoiceSupport()) return false;
    if (isListening) return true;
    if (callback) onCommand = callback;
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const spoken = event.results[event.results.length - 1][0].transcript;
      const match = matchCommand(spoken);
      if (match) {
        executeAction(match.action);
        const result = {
          success: true,
          command: spoken,
          action: match.label
        };
        if (onCommand) onCommand(result);
        if (match.action === "stop-voice") return;
      }
    };
    recognition.onend = () => {
      if (isListening) recognition == null ? void 0 : recognition.start();
    };
    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      if (onCommand) {
        onCommand({
          success: false,
          command: "",
          action: "",
          error: `Voice error: ${event.error}`
        });
      }
    };
    recognition.start();
    isListening = true;
    showListeningIndicator();
    return true;
  }
  function stopVoiceControl() {
    isListening = false;
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    onCommand = null;
    removeListeningIndicator();
  }
  var INDICATOR_ID = "yuktai-voice-indicator";
  function showListeningIndicator() {
    removeListeningIndicator();
    const indicator = document.createElement("div");
    indicator.id = INDICATOR_ID;
    indicator.setAttribute("data-yuktai-panel", "true");
    indicator.setAttribute("aria-live", "polite");
    indicator.setAttribute("aria-label", "yuktai voice control is listening");
    indicator.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9995;
    background: #0d9488;
    color: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 99px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    pointer-events: none;
  `;
    const dot = document.createElement("span");
    dot.style.cssText = `
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffffff;
    animation: yuktai-pulse 1.2s infinite;
    flex-shrink: 0;
  `;
    if (!document.getElementById("yuktai-pulse-style")) {
      const style = document.createElement("style");
      style.id = "yuktai-pulse-style";
      style.textContent = `
      @keyframes yuktai-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.4; transform: scale(0.7); }
      }
    `;
      document.head.appendChild(style);
    }
    const label = document.createElement("span");
    label.textContent = "Listening for commands...";
    indicator.appendChild(dot);
    indicator.appendChild(label);
    document.body.appendChild(indicator);
  }
  function removeListeningIndicator() {
    const existing = document.getElementById(INDICATOR_ID);
    if (existing) existing.remove();
  }

  // src/core/ai/labeller.ts
  var UNLABELLED_SELECTORS = [
    "button:not([aria-label]):not([aria-labelledby])",
    "a:not([aria-label]):not([aria-labelledby])",
    "input:not([aria-label]):not([aria-labelledby]):not([id])",
    "select:not([aria-label]):not([aria-labelledby])",
    "textarea:not([aria-label]):not([aria-labelledby])",
    "[role='button']:not([aria-label])",
    "[role='link']:not([aria-label])",
    "[role='checkbox']:not([aria-label])",
    "[role='tab']:not([aria-label])"
  ].join(", ");
  function getWriterAPI() {
    var _a;
    const w = window;
    return w.Writer || ((_a = w.ai) == null ? void 0 : _a.writer) || null;
  }
  async function checkLabellerSupport() {
    try {
      const API = getWriterAPI();
      if (!API) return false;
      if (typeof API.availability === "function") {
        const status = await API.availability();
        return status === "readily" || status === "available" || status === "downloadable";
      }
      if (typeof API.capabilities === "function") {
        const caps = await API.capabilities();
        return (caps == null ? void 0 : caps.available) !== "no";
      }
      return typeof API.create === "function";
    } catch {
      return false;
    }
  }
  function getElementContext(el) {
    var _a, _b, _c, _d, _e, _f, _g;
    const parts = [];
    const innerText = (_a = el.innerText) == null ? void 0 : _a.trim();
    if (innerText) parts.push(`element text: "${innerText}"`);
    const placeholder = (_b = el.placeholder) == null ? void 0 : _b.trim();
    if (placeholder) parts.push(`placeholder: "${placeholder}"`);
    const name = (_c = el.getAttribute("name")) == null ? void 0 : _c.trim();
    if (name) parts.push(`name: "${name}"`);
    const type = (_d = el.getAttribute("type")) == null ? void 0 : _d.trim();
    if (type) parts.push(`type: "${type}"`);
    const id = el.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) parts.push(`label: "${(_e = label.innerText) == null ? void 0 : _e.trim()}"`);
    }
    const parentText = (_g = (_f = el.parentElement) == null ? void 0 : _f.innerText) == null ? void 0 : _g.trim().slice(0, 60);
    if (parentText) parts.push(`parent context: "${parentText}"`);
    parts.push(`tag: ${el.tagName.toLowerCase()}`);
    const role = el.getAttribute("role");
    if (role) parts.push(`role: ${role}`);
    return parts.join(". ");
  }
  async function generateLabel(writer, context) {
    const prompt = `
    Generate a short, clear aria-label for an HTML element.
    The label must be 2-6 words maximum.
    The label must describe what the element does or what it is.
    Do not include punctuation.
    Do not explain \u2014 just output the label text only.

    Element details:
    ${context}

    Output only the label. Nothing else.
  `.trim();
    const result = await writer.write(prompt);
    return result.trim().replace(/^["']|["']$/g, "").replace(/\.$/, "").trim();
  }
  async function applySmartLabels() {
    const supported = await checkLabellerSupport();
    if (!supported) {
      return {
        success: false,
        fixed: 0,
        elements: [],
        error: "Chrome Built-in AI Writer not available. Enable via chrome://flags."
      };
    }
    const elements = document.querySelectorAll(UNLABELLED_SELECTORS);
    if (elements.length === 0) {
      return { success: true, fixed: 0, elements: [] };
    }
    try {
      const API = getWriterAPI();
      if (!API) throw new Error("Writer API not available");
      const writer = await API.create({
        tone: "neutral",
        format: "plain-text",
        length: "short",
        outputLanguage: "en"
      });
      let fixed = 0;
      const labelledElements = [];
      for (const el of elements) {
        if (el.closest("[data-yuktai-panel]")) continue;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const context = getElementContext(el);
        const label = await generateLabel(writer, context);
        if (label && label.length > 0) {
          el.dataset.yuktaiLabelOriginal = el.getAttribute("aria-label") || "";
          el.setAttribute("aria-label", label);
          fixed++;
          labelledElements.push({ tag: el.tagName.toLowerCase(), label });
        }
      }
      writer.destroy();
      return { success: true, fixed, elements: labelledElements };
    } catch (error) {
      return {
        success: false,
        fixed: 0,
        elements: [],
        error: error instanceof Error ? error.message : "Label generation failed"
      };
    }
  }
  function removeSmartLabels() {
    const labelled = document.querySelectorAll("[data-yuktai-label-original]");
    for (const el of labelled) {
      const original = el.dataset.yuktaiLabelOriginal;
      if (original) {
        el.setAttribute("aria-label", original);
      } else {
        el.removeAttribute("aria-label");
      }
      delete el.dataset.yuktaiLabelOriginal;
    }
  }

  // src/core/renderer.tsx
  var _liveRegionNode = null;
  var _colorBlindSvgNode = null;
  var _skipBarNode = null;
  var _auditBadgeNode = null;
  var _visualAlertNode = null;
  var _keyboardCheatsheetNode = null;
  var _timeoutWarningNode = null;
  var _timeoutTimer = null;
  var _currentConfig = null;
  var CB_FILTER_REFS = {
    deuteranopia: "yuktai-cb-d",
    protanopia: "yuktai-cb-p",
    tritanopia: "yuktai-cb-t"
  };
  var FORM_TAGS = /* @__PURE__ */ new Set(["input", "select", "textarea"]);
  var LANDMARK_MAP = {
    nav: "navigation",
    header: "banner",
    footer: "contentinfo",
    main: "main",
    aside: "complementary"
  };
  function speak(text, priority = "polite") {
    if (typeof window === "undefined") return;
    if (!(_currentConfig == null ? void 0 : _currentConfig.speechEnabled)) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1;
    utt.pitch = 1;
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) utt.voice = voices[0];
    window.speechSynthesis.speak(utt);
  }
  function showVisualAlert(message, type = "info") {
    if (typeof document === "undefined") return;
    const colors = {
      // White text on these backgrounds is at least 4.5:1 (WCAG 1.4.3)
      success: { bg: "#0a7a44", border: "#075e34", icon: "\u2713" },
      error: { bg: "#b52a1c", border: "#8f2116", icon: "\u2715" },
      warning: { bg: "#a35f00", border: "#7a4700", icon: "\u26A0" },
      info: { bg: "#1557b0", border: "#0f4287", icon: "\u2139" }
    };
    const c = colors[type];
    if (!_visualAlertNode) {
      _visualAlertNode = document.createElement("div");
      _visualAlertNode.setAttribute("role", "alert");
      _visualAlertNode.setAttribute("aria-live", "assertive");
      _visualAlertNode.setAttribute("aria-atomic", "true");
      _visualAlertNode.style.cssText = `
      position: fixed;
      top: 80px;
      right: 16px;
      left: auto;
      z-index: 999999;
      max-width: 320px;
      width: calc(100% - 32px);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.3s, opacity 0.3s;
      transform: translateX(120%);
      opacity: 0;
    `;
      document.body.appendChild(_visualAlertNode);
    }
    _visualAlertNode.style.background = c.bg;
    _visualAlertNode.style.border = `1px solid ${c.border}`;
    _visualAlertNode.style.color = "#fff";
    _visualAlertNode.innerHTML = `
    <span style="font-size:18px;font-weight:700">${c.icon}</span>
    <span style="flex:1;line-height:1.4">${message}</span>
    <button
      onclick="this.parentElement.style.transform='translateX(120%)';this.parentElement.style.opacity='0'"
      style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;padding:0;line-height:1"
      aria-label="Close notification">\xD7</button>
  `;
    if (window.innerWidth <= 480) {
      _visualAlertNode.style.right = "8px";
      _visualAlertNode.style.left = "8px";
      _visualAlertNode.style.maxWidth = "none";
      _visualAlertNode.style.width = "auto";
    }
    requestAnimationFrame(() => {
      if (_visualAlertNode) {
        _visualAlertNode.style.transform = "translateX(0)";
        _visualAlertNode.style.opacity = "1";
      }
    });
    setTimeout(() => {
      if (_visualAlertNode) {
        _visualAlertNode.style.transform = "translateX(120%)";
        _visualAlertNode.style.opacity = "0";
      }
    }, 5e3);
  }
  function announce(message, type = "info", useSpeech = true) {
    if (_liveRegionNode) _liveRegionNode.textContent = message;
    showVisualAlert(message, type);
    if (useSpeech) speak(message, type === "error" ? "assertive" : "polite");
  }
  function injectSkipLinks() {
    if (typeof document === "undefined") return;
    if (_skipBarNode) return;
    const targets = [
      { label: "Skip to main content", selector: "main,[role='main'],#main,#main-content" },
      { label: "Skip to navigation", selector: "nav,[role='navigation'],#nav,#navigation" },
      { label: "Skip to search", selector: "[role='search'],#search,input[type='search']" }
    ];
    const bar = document.createElement("div");
    bar.setAttribute("data-yuktai-skip-bar", "true");
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "Skip links");
    bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    background: #111;
    transform: translateY(-100%);
    transition: transform 0.2s ease;
    font-family: system-ui, sans-serif;
  `;
    let hasAnyTarget = false;
    targets.forEach(({ label, selector }) => {
      const target = document.querySelector(selector);
      if (!target) return;
      hasAnyTarget = true;
      if (!target.getAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = label;
      link.style.cssText = `
      color: #fff;
      background: #1a73e8;
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      border: 2px solid transparent;
      transition: background 0.15s, border-color 0.15s;
    `;
      link.addEventListener("focus", () => {
        bar.style.transform = "translateY(0)";
      });
      link.addEventListener("blur", () => {
        setTimeout(() => {
          if (!bar.matches(":focus-within")) {
            bar.style.transform = "translateY(-100%)";
          }
        }, 2e3);
      });
      link.addEventListener("click", (e) => {
        e.preventDefault();
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        announce(`Jumped to ${label.replace("Skip to ", "")}`, "info");
        bar.style.transform = "translateY(-100%)";
      });
      bar.appendChild(link);
    });
    if (!hasAnyTarget) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      bar.style.transform = "translateY(0)";
      bar.style.position = "sticky";
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth < 768) {
        bar.style.transform = "translateY(0)";
      }
    });
    document.body.insertBefore(bar, document.body.firstChild);
    _skipBarNode = bar;
  }
  function injectFocusStyles() {
    if (typeof document === "undefined") return;
    if (document.querySelector("[data-yuktai-focus-style]")) return;
    const style = document.createElement("style");
    style.setAttribute("data-yuktai-focus-style", "true");
    style.textContent = `

    /* \u2500\u2500 Focus indicator \u2014 WCAG 2.4.11 minimum 2px solid \u2500\u2500 */
    [data-yuktai-a11y] *:focus-visible {
      outline: 3px solid #1a73e8 !important;
      outline-offset: 3px !important;
      border-radius: 2px !important;
      box-shadow: 0 0 0 6px rgba(26,115,232,0.15) !important;
    }

    /* \u2500\u2500 High contrast focus \u2500\u2500 */
    [data-yuktai-high-contrast] *:focus-visible {
      outline: 3px solid #ffff00 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(255,255,0,0.2) !important;
    }

    /* \u2500\u2500 Keyboard hint mode \u2500\u2500 */
    [data-yuktai-keyboard] *:focus {
      outline: 3px solid #ff6b35 !important;
      outline-offset: 3px !important;
    }

    /* \u2500\u2500 Remove default outline \u2014 replaced above \u2500\u2500 */
    [data-yuktai-a11y] *:focus:not(:focus-visible) {
      outline: none !important;
    }

    /* \u2500\u2500 Large targets \u2014 WCAG 2.5.8 \u2500\u2500 */
    [data-yuktai-large-targets] button,
    [data-yuktai-large-targets] a,
    [data-yuktai-large-targets] input,
    [data-yuktai-large-targets] select,
    [data-yuktai-large-targets] [role="button"] {
      min-height: 44px !important;
      min-width: 44px !important;
    }

    /* \u2500\u2500 Reduce motion \u2014 WCAG 2.3.3 \u2500\u2500 */
    [data-yuktai-reduce-motion] *,
    [data-yuktai-reduce-motion] *::before,
    [data-yuktai-reduce-motion] *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }

    /* \u2500\u2500 High contrast mode \u2500\u2500 */
    [data-yuktai-high-contrast] {
      filter: contrast(1.4) brightness(1.05) !important;
    }

    /* \u2500\u2500 Dark mode \u2500\u2500 */
    [data-yuktai-dark] {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    [data-yuktai-dark] img,
    [data-yuktai-dark] video,
    [data-yuktai-dark] canvas {
      filter: invert(1) hue-rotate(180deg) !important;
    }

    /* \u2500\u2500 Dyslexia font \u2500\u2500 */
    [data-yuktai-dyslexia] * {
      font-family: "Atkinson Hyperlegible", "Arial", sans-serif !important;
      letter-spacing: 0.05em !important;
      word-spacing: 0.1em !important;
      line-height: 1.8 !important;
    }

    /* \u2500\u2500 Link underline enforcement \u2500\u2500 */
    [data-yuktai-a11y] a:not([role]):not([class]) {
      text-decoration: underline !important;
    }

    /* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       RESPONSIVE BREAKPOINTS
    \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

    /* Skip link bar \u2014 wrap on small screens */
    @media (max-width: 768px) {
      [data-yuktai-skip-bar] {
        flex-wrap: wrap;
      }
      [data-yuktai-skip-bar] a {
        font-size: 12px !important;
        padding: 6px 10px !important;
      }
    }

    /* Preference panel \u2014 bottom sheet on mobile */
    @media (max-width: 480px) {
      [data-yuktai-panel] {
        width: 100% !important;
        right: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        border-radius: 16px 16px 0 0 !important;
        max-height: 85vh !important;
      }
    }

    /* FAB button \u2014 reposition on mobile */
    @media (max-width: 480px) {
      [data-yuktai-pref-toggle] {
        bottom: 12px !important;
        right: 12px !important;
        width: 44px !important;
        height: 44px !important;
      }
    }

    /* Audit badge \u2014 reposition on mobile */
    @media (max-width: 480px) {
      [data-yuktai-badge] {
        bottom: 12px !important;
        left: 12px !important;
        font-size: 11px !important;
        padding: 4px 10px !important;
      }
    }

    /* Keyboard cheatsheet \u2014 full width on mobile */
    @media (max-width: 480px) {
      [data-yuktai-cheatsheet] {
        width: calc(100vw - 32px) !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
      }
    }

    /* Timeout warning \u2014 full width on mobile */
    @media (max-width: 480px) {
      [data-yuktai-timeout] {
        width: calc(100vw - 32px) !important;
      }
    }

    /* Visual alert \u2014 full width on mobile */
    @media (max-width: 480px) {
      [data-yuktai-alert] {
        right: 8px !important;
        left: 8px !important;
        max-width: none !important;
        width: auto !important;
      }
    }
  `;
    document.head.appendChild(style);
    document.documentElement.setAttribute("data-yuktai-a11y", "true");
  }
  function initKeyboardNavigator() {
    if (typeof document === "undefined") return;
    if (document.querySelector("[data-yuktai-kb-init]")) return;
    document.documentElement.setAttribute("data-yuktai-kb-init", "true");
    document.addEventListener("keydown", (e) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const target = document.activeElement;
      if (!target) return;
      const role = target.getAttribute("role") || "";
      if (e.key === "Escape") {
        const modal = target.closest("[role='dialog'],[role='alertdialog']");
        if (modal) {
          modal.style.display = "none";
          announce("Dialog closed", "info");
          return;
        }
        const menu = target.closest("[role='menu'],[role='menubar']");
        if (menu) {
          menu.style.display = "none";
          announce("Menu closed", "info");
        }
      }
      if (role === "menuitem" || target.closest("[role='menu'],[role='menubar']")) {
        const menu = target.closest("[role='menu'],[role='menubar']");
        if (!menu) return;
        const items = Array.from(
          menu.querySelectorAll("[role='menuitem']:not([disabled])")
        );
        const idx = items.indexOf(target);
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          (_a = items[(idx + 1) % items.length]) == null ? void 0 : _a.focus();
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          (_b = items[(idx - 1 + items.length) % items.length]) == null ? void 0 : _b.focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          (_c = items[0]) == null ? void 0 : _c.focus();
        } else if (e.key === "End") {
          e.preventDefault();
          (_d = items[items.length - 1]) == null ? void 0 : _d.focus();
        }
      }
      if (role === "tab" || target.closest("[role='tablist']")) {
        const tablist = target.closest("[role='tablist']");
        if (!tablist) return;
        const tabs = Array.from(
          tablist.querySelectorAll("[role='tab']:not([disabled])")
        );
        const idx = tabs.indexOf(target);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = tabs[(idx + 1) % tabs.length];
          next == null ? void 0 : next.focus();
          next == null ? void 0 : next.click();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
          prev == null ? void 0 : prev.focus();
          prev == null ? void 0 : prev.click();
        }
      }
      if (role === "option" || target.closest("[role='listbox']")) {
        const listbox = target.closest("[role='listbox']");
        if (!listbox) return;
        const options = Array.from(
          listbox.querySelectorAll("[role='option']:not([aria-disabled='true'])")
        );
        const idx = options.indexOf(target);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          (_e = options[(idx + 1) % options.length]) == null ? void 0 : _e.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          (_f = options[(idx - 1 + options.length) % options.length]) == null ? void 0 : _f.focus();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          target.setAttribute("aria-selected", "true");
          options.forEach((o) => {
            if (o !== target) o.setAttribute("aria-selected", "false");
          });
          announce(`Selected: ${(_g = target.textContent) == null ? void 0 : _g.trim()}`, "success");
        }
      }
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        toggleKeyboardCheatsheet();
      }
      if (e.key === "Tab" && (_currentConfig == null ? void 0 : _currentConfig.speechEnabled)) {
        setTimeout(() => {
          var _a2;
          const focused = document.activeElement;
          if (!focused) return;
          const label = focused.getAttribute("aria-label") || focused.getAttribute("title") || ((_a2 = focused.textContent) == null ? void 0 : _a2.trim()) || focused.tagName.toLowerCase();
          const roleLabel = focused.getAttribute("role") || focused.tagName.toLowerCase();
          speak(`${label}, ${roleLabel}`);
        }, 100);
      }
    });
  }
  function trapFocus(modal) {
    const focusable = modal.querySelectorAll(
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[role="button"]'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();
    modal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
  function toggleKeyboardCheatsheet() {
    if (typeof document === "undefined") return;
    if (_keyboardCheatsheetNode) {
      _keyboardCheatsheetNode.remove();
      _keyboardCheatsheetNode = null;
      return;
    }
    const panel = document.createElement("div");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Keyboard shortcuts");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("data-yuktai-cheatsheet", "true");
    panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999999;
    background: #1a1a2e;
    color: #fff;
    border-radius: 12px;
    padding: 24px;
    width: min(320px, calc(100vw - 32px));
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
  `;
    const shortcuts = [
      ["Alt + A", "Open/close this menu"],
      ["Tab", "Next focusable element"],
      ["Shift+Tab", "Previous focusable element"],
      ["Enter", "Activate button or link"],
      ["Space", "Check checkbox / scroll"],
      ["Arrow keys", "Navigate lists and menus"],
      ["Escape", "Close dialog or menu"],
      ["Home", "First item in list"],
      ["End", "Last item in list"]
    ];
    panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="margin:0;font-size:16px;font-weight:700;color:#74c0fc">
        \u2328 Keyboard shortcuts
      </h2>
      <button data-yuktai-close
        style="background:none;border:none;color:#aaa;cursor:pointer;font-size:20px;padding:0;line-height:1"
        aria-label="Close shortcuts">\xD7</button>
    </div>
    ${shortcuts.map(([key, desc]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a4a">
        <kbd style="background:#2a2a4a;color:#74c0fc;padding:3px 8px;border-radius:4px;font-size:12px;font-family:monospace;border:1px solid #3a3a6a">${key}</kbd>
        <span style="font-size:12px;color:#ccc;text-align:right;flex:1;margin-left:12px">${desc}</span>
      </div>
    `).join("")}
  `;
    const closeBtn = panel.querySelector("[data-yuktai-close]");
    closeBtn == null ? void 0 : closeBtn.addEventListener("click", () => {
      panel.remove();
      _keyboardCheatsheetNode = null;
    });
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        panel.remove();
        _keyboardCheatsheetNode = null;
      }
    });
    document.body.appendChild(panel);
    _keyboardCheatsheetNode = panel;
    trapFocus(panel);
    announce("Keyboard shortcuts opened. Press Escape to close.", "info");
  }
  function injectAuditBadge(report) {
    if (typeof document === "undefined") return;
    if (!(_currentConfig == null ? void 0 : _currentConfig.showAuditBadge)) return;
    if (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) return;
    if (_auditBadgeNode) _auditBadgeNode.remove();
    const score = report.score;
    const color = score >= 90 ? "#0f9d58" : score >= 70 ? "#f29900" : "#d93025";
    const emoji = score >= 90 ? "\u267F" : score >= 70 ? "\u26A0" : "\u2715";
    const badge = document.createElement("button");
    badge.setAttribute("aria-label", `Accessibility score: ${score} out of 100`);
    badge.setAttribute("data-yuktai-badge", "true");
    badge.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 999998;
    background: ${color};
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    font-family: system-ui, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: transform 0.15s;
  `;
    badge.innerHTML = `${emoji} ${score}/100 <span style="font-weight:400;opacity:0.85">${report.details.length} issues</span>`;
    badge.addEventListener("click", () => showAuditDetails(report));
    document.body.appendChild(badge);
    _auditBadgeNode = badge;
  }
  function showAuditDetails(report) {
    const existing = document.querySelector("[data-yuktai-audit-details]");
    if (existing) {
      existing.remove();
      return;
    }
    const panel = document.createElement("div");
    panel.setAttribute("data-yuktai-audit-details", "true");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Accessibility audit details");
    panel.style.cssText = `
    position: fixed;
    bottom: 56px;
    left: 16px;
    right: 16px;
    z-index: 999999;
    background: #1a1a2e;
    color: #fff;
    border-radius: 12px;
    padding: 16px;
    width: auto;
    max-width: 340px;
    max-height: 60vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
    font-size: 12px;
  `;
    const sevColor = {
      critical: "#d93025",
      serious: "#f29900",
      moderate: "#1a73e8",
      minor: "#0f9d58"
    };
    panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <strong style="font-size:14px;color:#74c0fc">Audit report</strong>
      <span style="color:#aaa">${report.fixed} fixed \xB7 ${report.renderTime}ms</span>
    </div>
    ${report.details.slice(0, 20).map((d) => `
      <div style="padding:6px 0;border-bottom:1px solid #2a2a4a">
        <div style="display:flex;gap:6px;align-items:center">
          <span style="background:${sevColor[d.severity]};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase">${d.severity}</span>
          <code style="color:#74c0fc">&lt;${d.tag}&gt;</code>
        </div>
        <div style="color:#ccc;margin-top:3px">${d.fix}</div>
      </div>
    `).join("")}
    ${report.details.length > 20 ? `<div style="color:#888;padding:8px 0;text-align:center">+${report.details.length - 20} more issues</div>` : ""}
  `;
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") panel.remove();
    });
    document.body.appendChild(panel);
    trapFocus(panel);
  }
  function startTimeoutWarning(seconds) {
    if (typeof document === "undefined") return;
    if (_timeoutTimer) clearTimeout(_timeoutTimer);
    _timeoutTimer = setTimeout(() => {
      if (_timeoutWarningNode) return;
      const warning = document.createElement("div");
      warning.setAttribute("role", "alertdialog");
      warning.setAttribute("aria-label", "Session timeout warning");
      warning.setAttribute("aria-modal", "true");
      warning.setAttribute("data-yuktai-timeout", "true");
      warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999999;
      background: #fff;
      color: #111;
      border-radius: 12px;
      padding: 24px;
      width: min(320px, calc(100vw - 32px));
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      font-family: system-ui, sans-serif;
      border: 2px solid #d93025;
    `;
      warning.innerHTML = `
      <h2 style="margin:0 0 8px;font-size:18px;color:#d93025">\u23F1 Session timeout</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#444">
        Your session will expire soon. Do you need more time?
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button data-yuktai-extend
          style="flex:1;min-width:120px;padding:10px;background:#1a73e8;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">
          Yes, more time
        </button>
        <button data-yuktai-dismiss
          style="flex:1;min-width:120px;padding:10px;background:#f1f3f4;color:#111;border:none;border-radius:8px;cursor:pointer;font-size:14px">
          No, sign out
        </button>
      </div>
    `;
      const extend = warning.querySelector("[data-yuktai-extend]");
      const dismiss = warning.querySelector("[data-yuktai-dismiss]");
      extend == null ? void 0 : extend.addEventListener("click", () => {
        warning.remove();
        _timeoutWarningNode = null;
        announce("Session extended. You have more time.", "success");
        if (_currentConfig == null ? void 0 : _currentConfig.timeoutWarning) {
          startTimeoutWarning(_currentConfig.timeoutWarning);
        }
      });
      dismiss == null ? void 0 : dismiss.addEventListener("click", () => {
        warning.remove();
        _timeoutWarningNode = null;
      });
      document.body.appendChild(warning);
      _timeoutWarningNode = warning;
      trapFocus(warning);
      announce("Warning: Your session will expire soon. Do you need more time?", "warning");
    }, seconds * 1e3);
  }
  function applyConfigToDOM(config) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.toggleAttribute("data-yuktai-high-contrast", !!config.highContrast);
    root.toggleAttribute("data-yuktai-dark", !!config.darkMode);
    root.toggleAttribute("data-yuktai-reduce-motion", !!config.reduceMotion);
    root.toggleAttribute("data-yuktai-large-targets", !!config.largeTargets);
    root.toggleAttribute("data-yuktai-keyboard", !!config.keyboardHints);
    root.toggleAttribute("data-yuktai-dyslexia", !!config.dyslexiaFont);
    if (config.localFont) {
      document.body.style.fontFamily = `"${config.localFont}", system-ui, sans-serif`;
    } else if (!config.dyslexiaFont) {
      document.body.style.fontFamily = "";
    }
    if (config.fontSizeMultiplier && config.fontSizeMultiplier !== 1) {
      document.documentElement.style.fontSize = `${config.fontSizeMultiplier * 100}%`;
    } else {
      document.documentElement.style.fontSize = "";
    }
    if (config.colorBlindMode && config.colorBlindMode !== "none") {
      const filterValue = config.colorBlindMode === "achromatopsia" ? "grayscale(100%)" : `url(#${CB_FILTER_REFS[config.colorBlindMode]})`;
      document.body.style.filter = filterValue;
    } else {
      document.body.style.filter = "";
    }
  }
  function loadPreferences(config) {
    try {
      const saved = localStorage.getItem("yuktai-a11y-prefs");
      if (saved) Object.assign(config, JSON.parse(saved));
    } catch {
    }
  }
  async function handlePlainEnglish(enabled) {
    if (enabled) {
      const supported = await checkRewriterSupport();
      if (!supported) {
        announce("Plain English requires Chrome 127+", "warning");
        return;
      }
      announce("Rewriting page in plain English...", "info", false);
      const result = await rewritePage();
      announce(
        result.error ? `Plain English failed: ${result.error}` : `${result.fixed} sections rewritten in plain English`,
        result.error ? "error" : "success",
        false
      );
    } else {
      restorePage();
      announce("Original text restored", "info", false);
    }
  }
  async function handleSummarisePage(enabled) {
    if (enabled) {
      const supported = await checkSummarizerSupport();
      if (!supported) {
        announce("Page summariser requires Chrome 127+", "warning");
        return;
      }
      announce("Generating page summary...", "info", false);
      const result = await summarizePage();
      announce(
        result.error ? `Summary failed: ${result.error}` : "Page summary added at top",
        result.error ? "error" : "success",
        false
      );
    } else {
      removeSummaryBox();
      announce("Page summary removed", "info", false);
    }
  }
  async function handleTranslate(language) {
    if (language === "en") {
      restoreOriginalText();
      announce("Page restored to English", "info", false);
      return;
    }
    announce(`Translating page to ${language}...`, "info", false);
    const result = await translatePage(language);
    announce(
      result.error ? `Translation failed: ${result.error}` : `Page translated to ${language}`,
      result.error ? "error" : "success",
      false
    );
  }
  async function handleVoiceControl(enabled) {
    if (enabled) {
      if (!checkVoiceSupport()) {
        announce("Voice control not supported in this browser", "warning");
        return;
      }
      startVoiceControl((result) => {
        if (result.success) announce(`Voice: ${result.action}`, "info", false);
      });
      announce("Voice control started. Say a command.", "success", false);
    } else {
      stopVoiceControl();
      announce("Voice control stopped", "info", false);
    }
  }
  async function handleSmartLabels(enabled) {
    if (enabled) {
      const supported = await checkLabellerSupport();
      if (!supported) {
        announce("Smart labels requires Chrome 127+", "warning");
        return;
      }
      announce("Generating smart labels...", "info", false);
      const result = await applySmartLabels();
      announce(
        result.error ? `Smart labels failed: ${result.error}` : `${result.fixed} elements labelled`,
        result.error ? "error" : "success",
        false
      );
    } else {
      removeSmartLabels();
      announce("Smart labels removed", "info", false);
    }
  }
  function ensureLiveRegion() {
    if (typeof document === "undefined" || _liveRegionNode) return;
    const node = document.createElement("div");
    node.setAttribute("aria-live", "polite");
    node.setAttribute("aria-atomic", "true");
    node.setAttribute("aria-relevant", "text");
    node.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);";
    document.body.appendChild(node);
    _liveRegionNode = node;
  }
  function ensureColorBlindFilters() {
    if (typeof document === "undefined" || _colorBlindSvgNode) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;";
    svg.innerHTML = `
    <defs>
      <filter id="${CB_FILTER_REFS.deuteranopia}">
        <feColorMatrix type="matrix"
          values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${CB_FILTER_REFS.protanopia}">
        <feColorMatrix type="matrix"
          values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
      </filter>
      <filter id="${CB_FILTER_REFS.tritanopia}">
        <feColorMatrix type="matrix"
          values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
      </filter>
    </defs>
  `;
    document.body.appendChild(svg);
    _colorBlindSvgNode = svg;
  }
  function hasAccessibleName(el) {
    var _a, _b, _c;
    if (((_a = el.getAttribute("aria-label")) == null ? void 0 : _a.trim()) || el.getAttribute("aria-labelledby") || ((_b = el.getAttribute("title")) == null ? void 0 : _b.trim())) return true;
    if ((_c = el.textContent) == null ? void 0 : _c.trim()) return true;
    return !!el.querySelector("img[alt]:not([alt='']), svg[aria-label], svg title, [aria-label]");
  }
  function calculateScore(report) {
    const weights = { critical: 20, serious: 10, moderate: 5, minor: 2 };
    const deduction = report.details.reduce(
      (acc, d) => acc + (weights[d.severity] || 0),
      0
    );
    return Math.max(0, Math.min(100, 100 - deduction));
  }
  var wcagPlugin = {
    name: "yuktai-a11y",
    version: "4.0.0",
    observer: null,
    async execute(config) {
      if (!config.enabled) {
        this.stopObserver();
        return "yuktai: disabled.";
      }
      _currentConfig = config;
      loadPreferences(config);
      ensureLiveRegion();
      ensureColorBlindFilters();
      injectFocusStyles();
      initKeyboardNavigator();
      if (config.showSkipLinks !== false) injectSkipLinks();
      if (config.showPreferencePanel !== false) {
      }
      applyConfigToDOM(config);
      const report = this.applyFixes(config);
      report.score = calculateScore(report);
      if (config.showAuditBadge) injectAuditBadge(report);
      if (config.timeoutWarning) startTimeoutWarning(config.timeoutWarning);
      if (config.autoFix) this.startObserver(config);
      if (config.plainEnglish) await handlePlainEnglish(true);
      if (config.summarisePage) await handleSummarisePage(true);
      if (config.translateLanguage && config.translateLanguage !== "en") await handleTranslate(config.translateLanguage);
      if (config.voiceControl) await handleVoiceControl(true);
      if (config.smartLabels) await handleSmartLabels(true);
      const msg2 = `${report.fixed} fixes applied. Score: ${report.score}/100.`;
      announce(msg2, report.score >= 90 ? "success" : "info", false);
      return `yuktai v4.0.0: ${msg2} Scanned ${report.scanned} elements in ${report.renderTime}ms.`;
    },
    applyFixes(config) {
      const report = {
        fixed: 0,
        scanned: 0,
        renderTime: 0,
        score: 100,
        details: []
      };
      if (typeof document === "undefined") return report;
      const start = performance.now();
      const elements = document.querySelectorAll("*");
      report.scanned = elements.length;
      const push = (tag, fix, severity, el) => {
        report.details.push({ tag, fix, severity, element: el.outerHTML.slice(0, 100) });
        report.fixed++;
      };
      elements.forEach((el) => {
        var _a, _b;
        const h2 = el;
        const tag = h2.tagName.toLowerCase();
        if (tag === "html" && !h2.getAttribute("lang")) {
          h2.setAttribute("lang", "en");
          push(tag, 'lang="en" added', "critical", h2);
        }
        if (tag === "meta") {
          const name = h2.getAttribute("name");
          const content = h2.getAttribute("content") || "";
          if (name === "viewport" && content.includes("user-scalable=no")) {
            h2.setAttribute("content", content.replace("user-scalable=no", "user-scalable=yes"));
            push(tag, "user-scalable=yes restored", "serious", h2);
          }
          if (name === "viewport" && /maximum-scale=1(?:[^0-9]|$)/.test(content)) {
            h2.setAttribute("content", content.replace(/maximum-scale=1(?=[^0-9]|$)/, "maximum-scale=5"));
            push(tag, "maximum-scale=5 restored", "serious", h2);
          }
        }
        if (tag === "main" && !h2.getAttribute("tabindex")) {
          h2.setAttribute("tabindex", "-1");
          if (!h2.getAttribute("id")) h2.setAttribute("id", "main-content");
        }
        if (tag === "img") {
          if (!h2.hasAttribute("alt")) {
            h2.setAttribute("alt", "");
            h2.setAttribute("aria-hidden", "true");
            push(tag, 'alt="" aria-hidden="true"', "serious", h2);
          }
        }
        if (tag === "svg") {
          if (!h2.getAttribute("aria-hidden") && !h2.getAttribute("aria-label") && !el.querySelector("title")) {
            h2.setAttribute("aria-hidden", "true");
            push(tag, 'aria-hidden="true" (decorative svg)', "minor", h2);
          }
          if (!h2.getAttribute("focusable")) h2.setAttribute("focusable", "false");
        }
        if (tag === "iframe") {
          if (!h2.getAttribute("title") && !h2.getAttribute("aria-label")) {
            h2.setAttribute("title", "embedded content");
            h2.setAttribute("aria-label", "embedded content");
            push(tag, "title + aria-label added", "serious", h2);
          }
        }
        if (tag === "button") {
          if (!hasAccessibleName(h2)) {
            const label = h2.getAttribute("title") || "button";
            h2.setAttribute("aria-label", label);
            push(tag, `aria-label="${label}" (empty button)`, "critical", h2);
          }
          if (h2.hasAttribute("disabled") && !h2.getAttribute("aria-disabled")) {
            h2.setAttribute("aria-disabled", "true");
            report.fixed++;
          }
        }
        if (tag === "a") {
          const anchor = h2;
          if (!hasAccessibleName(h2)) {
            h2.setAttribute("aria-label", h2.getAttribute("title") || "link");
            push(tag, "aria-label added (empty link)", "critical", h2);
          }
          if (anchor.target === "_blank" && !((_a = anchor.rel) == null ? void 0 : _a.includes("noopener"))) {
            anchor.rel = "noopener noreferrer";
            report.fixed++;
          }
        }
        if (FORM_TAGS.has(tag)) {
          const input = h2;
          const hasLabel = !!(input.labels && input.labels.length) || !!h2.getAttribute("title") || input.type === "hidden" || input.type === "submit" || input.type === "button" || input.type === "reset";
          if (!hasLabel && !h2.getAttribute("aria-label") && !h2.getAttribute("aria-labelledby")) {
            const label = h2.getAttribute("placeholder") || h2.getAttribute("name") || tag;
            h2.setAttribute("aria-label", label);
            push(tag, `aria-label="${label}"`, "serious", h2);
          }
          if (h2.hasAttribute("required") && !h2.getAttribute("aria-required")) {
            h2.setAttribute("aria-required", "true");
            report.fixed++;
          }
          if (tag === "input" && !input.autocomplete) {
            const n = input.name || "";
            const hint = input.type === "email" || n.includes("email") ? "email" : input.type === "tel" || n.includes("tel") ? "tel" : input.type === "password" ? "current-password" : "";
            if (hint) {
              input.autocomplete = hint;
              report.fixed++;
            }
          }
        }
        if (tag === "th" && !h2.getAttribute("scope")) {
          h2.setAttribute("scope", h2.closest("thead") ? "col" : "row");
          push(tag, "scope added to <th>", "moderate", h2);
        }
        const nestedSection = (tag === "header" || tag === "footer") && !!((_b = h2.parentElement) == null ? void 0 : _b.closest("article,aside,main,nav,section,[role='dialog'],[role='region']"));
        if (LANDMARK_MAP[tag] && !h2.getAttribute("role") && !nestedSection) {
          h2.setAttribute("role", LANDMARK_MAP[tag]);
          push(tag, `role="${LANDMARK_MAP[tag]}"`, "minor", h2);
        }
        const role = h2.getAttribute("role") || "";
        if (role === "tab" && !h2.getAttribute("aria-selected")) {
          h2.setAttribute("aria-selected", "false");
          report.fixed++;
        }
        if (["alert", "status", "log"].includes(role) && !h2.getAttribute("aria-live")) {
          h2.setAttribute("aria-live", role === "alert" ? "assertive" : "polite");
          push(tag, `aria-live added on role=${role}`, "moderate", h2);
        }
        if (role === "combobox" && !h2.getAttribute("aria-expanded")) {
          h2.setAttribute("aria-expanded", "false");
          push(tag, 'aria-expanded="false" on combobox', "serious", h2);
        }
        if ((role === "checkbox" || role === "radio") && !h2.getAttribute("aria-checked")) {
          h2.setAttribute("aria-checked", "false");
          push(tag, `aria-checked="false" on role=${role}`, "serious", h2);
        }
      });
      report.renderTime = parseFloat((performance.now() - start).toFixed(2));
      return report;
    },
    scan() {
      const report = {
        fixed: 0,
        scanned: 0,
        renderTime: 0,
        score: 100,
        details: []
      };
      if (typeof document === "undefined") return report;
      const start = performance.now();
      const elements = document.querySelectorAll("*");
      report.scanned = elements.length;
      const push = (tag, fix, severity, el) => report.details.push({ tag, fix, severity, element: el.outerHTML.slice(0, 100) });
      elements.forEach((el) => {
        var _a;
        const h2 = el;
        const tag = h2.tagName.toLowerCase();
        if ((tag === "a" || tag === "button") && !((_a = h2.innerText) == null ? void 0 : _a.trim()) && !h2.getAttribute("aria-label"))
          push(tag, "needs aria-label (empty)", "critical", h2);
        if (tag === "img" && !h2.hasAttribute("alt"))
          push(tag, "needs alt text", "serious", h2);
        if (FORM_TAGS.has(tag) && !h2.getAttribute("aria-label") && !h2.getAttribute("aria-labelledby"))
          push(tag, "needs aria-label", "serious", h2);
        if (tag === "iframe" && !h2.getAttribute("title") && !h2.getAttribute("aria-label"))
          push(tag, "iframe needs title", "serious", h2);
      });
      report.fixed = report.details.length;
      report.score = calculateScore(report);
      report.renderTime = parseFloat((performance.now() - start).toFixed(2));
      return report;
    },
    startObserver(config) {
      if (this.observer || typeof document === "undefined") return;
      this.observer = new MutationObserver(() => this.applyFixes(config));
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });
    },
    stopObserver() {
      var _a;
      (_a = this.observer) == null ? void 0 : _a.disconnect();
      this.observer = null;
    },
    // ── Public API — available to any app using yuktai ──
    announce,
    speak,
    showVisualAlert,
    trapFocus,
    handlePlainEnglish,
    handleSummarisePage,
    handleTranslate,
    handleVoiceControl,
    handleSmartLabels,
    SUPPORTED_LANGUAGES
  };

  // src/agentic/voiceA11yCommands.ts
  var OFF = /\b(off|disable|stop|remove|no more|turn off|switch off|deactivate)\b|ఆఫ్|ఆపు|తీసివేయి|बंद/i;
  var TOGGLES = [
    { pattern: /high contrast|contrast|హై కాంట్రాస్ట్|కాంట్రాస్ట్/i, key: "highContrast", name: "High contrast" },
    { pattern: /dark mode|dark theme|night mode|డార్క్ మోడ్|చీకటి/i, key: "darkMode", name: "Dark mode" },
    { pattern: /reduce motion|less motion|stop animation|animations?|కదలికలు/i, key: "reduceMotion", name: "Reduced motion" },
    { pattern: /large targets?|bigger buttons?|big buttons?|larger buttons?|పెద్ద బటన్/i, key: "largeTargets", name: "Large targets" },
    { pattern: /dyslexia|readable font|easy font/i, key: "dyslexiaFont", name: "Dyslexia-friendly font" },
    { pattern: /speak on focus|read aloud|read out|screen reader|speech|చదివి వినిపించు/i, key: "speechEnabled", name: "Speak on focus" },
    { pattern: /skip links?/i, key: "showSkipLinks", name: "Skip links" }
  ];
  var COLOR_MODES = [
    [/deuteranop|green.?blind/i, "deuteranopia"],
    [/protanop|red.?blind/i, "protanopia"],
    [/tritanop|blue.?blind/i, "tritanopia"],
    [/grey ?scale|gray ?scale|achromat|black and white/i, "achromatopsia"]
  ];
  var FONT_STEP = 0.1;
  var FONT_MIN = 0.8;
  var FONT_MAX = 1.3;
  function parseVoiceA11yCommand(transcript, current = {}) {
    const t = transcript.trim().toLowerCase();
    if (!t) return null;
    if (/\b(next|down)\s+(row|line|record|item)\b|తర్వాతి (వరుస|అంశం)/.test(t)) return { type: "grid", action: "next-row", say: "Next row." };
    if (/\b(previous|prev|back|up)\s+(row|line|record|item)\b|ముందరి (వరుస|అంశం)|వెనుక (వరుస|అంశం)/.test(t)) return { type: "grid", action: "previous-row", say: "Previous row." };
    if (/\bfirst\s+(row|record|item)\b|మొదటి (వరుస|అంశం)/.test(t)) return { type: "grid", action: "first-row", say: "First row." };
    if (/\blast\s+(row|record|item)\b|చివరి (వరుస|అంశం)/.test(t)) return { type: "grid", action: "last-row", say: "Last row." };
    if (/\b(open|expand|read)\s+(this\s+)?(row|record|item)\b|ఈ (వరుస|అంశం) తెరువు/.test(t)) return { type: "grid", action: "open-row", say: "Opening row." };
    if (/\b(reset|default|restore)\b.*\b(settings?|accessibility|everything|all)\b|^reset$|రీసెట్/.test(t)) {
      return { type: "reset", say: "Accessibility settings reset." };
    }
    const multiplier = current.fontSizeMultiplier ?? 1;
    const clamp = (n) => Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, n)) * 100) / 100;
    if (/\b(bigger|larger|increase|zoom in)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(bigger|larger|up)\b|పెద్ద అక్షరాలు|అక్షరాలు పెద్ద/.test(t)) {
      const next = clamp(multiplier + FONT_STEP);
      return { type: "setting", patch: { fontSizeMultiplier: next }, say: `Text size ${Math.round(next * 100)}%.` };
    }
    if (/\b(smaller|decrease|reduce|zoom out)\b.*\b(text|font|letters?)\b|\b(text|font)\b.*\b(smaller|down)\b|చిన్న అక్షరాలు|అక్షరాలు చిన్న/.test(t)) {
      const next = clamp(multiplier - FONT_STEP);
      return { type: "setting", patch: { fontSizeMultiplier: next }, say: `Text size ${Math.round(next * 100)}%.` };
    }
    if (/\b(normal|default|reset)\b.*\b(text|font)\s*(size)?\b/.test(t)) {
      return { type: "setting", patch: { fontSizeMultiplier: 1 }, say: "Text size 100%." };
    }
    const off = OFF.test(t);
    for (const [pattern, mode] of COLOR_MODES) {
      if (pattern.test(t)) {
        return off ? { type: "setting", patch: { colorBlindMode: "none" }, say: "Colour filter off." } : { type: "setting", patch: { colorBlindMode: mode }, say: `${mode} filter on.` };
      }
    }
    if (/colou?r.?blind/.test(t) && off) return { type: "setting", patch: { colorBlindMode: "none" }, say: "Colour filter off." };
    for (const toggle of TOGGLES) {
      if (!toggle.pattern.test(t)) continue;
      let value = /\btoggle\b/.test(t) ? !current[toggle.key] : !off;
      if (toggle.key === "reduceMotion" && !/reduce motion|less motion|కదలికలు తగ్గించు/.test(t) && /animations?/.test(t)) {
        value = off || /\bno\b/.test(t);
      }
      return { type: "setting", patch: { [toggle.key]: value }, say: `${toggle.name} ${value ? "on" : "off"}.` };
    }
    return null;
  }
  var DEFAULT_A11Y_SETTINGS = {
    highContrast: false,
    darkMode: false,
    reduceMotion: false,
    largeTargets: false,
    dyslexiaFont: false,
    speechEnabled: false,
    colorBlindMode: "none",
    fontSizeMultiplier: 1
  };
  function moveGridRowFocus(action, options = {}) {
    var _a, _b;
    if (!isBrowser()) return null;
    const root = options.root ?? document;
    const selector = options.rowSelector ?? "[data-yuktai-row-id], [role='row']";
    const rows = Array.from(root.querySelectorAll(selector)).filter((r) => !r.querySelector("th,[role='columnheader']"));
    if (!rows.length) return null;
    const active = (_a = document.activeElement) == null ? void 0 : _a.closest(selector);
    const index = active ? rows.indexOf(active) : -1;
    if (action === "open-row") {
      const row2 = index >= 0 ? rows[index] : rows[0];
      row2.click();
      return row2;
    }
    const nextIndex = action === "first-row" ? 0 : action === "last-row" ? rows.length - 1 : action === "next-row" ? Math.min(rows.length - 1, index + 1) : Math.max(0, index - 1);
    const row = rows[nextIndex];
    if (!row.hasAttribute("tabindex")) row.setAttribute("tabindex", "-1");
    row.focus();
    (_b = row.scrollIntoView) == null ? void 0 : _b.call(row, { block: "nearest" });
    return row;
  }
  function createVoiceA11yController(options = {}) {
    let config = { enabled: true, ...DEFAULT_A11Y_SETTINGS, ...options.initial };
    let recognition2 = null;
    let listening = false;
    const apply = async (next) => {
      if (options.apply) return options.apply(next);
      return wcagPlugin.execute(next);
    };
    const say = (text) => {
      if (options.speak === false || !isBrowser() || !("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang ?? "en-IN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };
    async function handle(transcript) {
      var _a;
      const command = parseVoiceA11yCommand(transcript, config);
      (_a = options.onTranscript) == null ? void 0 : _a.call(options, transcript, command);
      if (!command) return null;
      if (command.type === "grid") {
        const row = moveGridRowFocus(command.action, { root: options.gridRoot });
        say(row ? command.say : "No table rows found.");
        return command;
      }
      config = command.type === "reset" ? { ...config, ...DEFAULT_A11Y_SETTINGS } : { ...config, ...command.patch };
      await apply(config);
      say(command.say);
      return command;
    }
    function start() {
      if (!isBrowser() || listening) return listening;
      const Ctor = window;
      const Recognition = Ctor.SpeechRecognition ?? Ctor.webkitSpeechRecognition;
      if (!Recognition) return false;
      recognition2 = new Recognition();
      recognition2.lang = options.lang ?? "en-IN";
      recognition2.continuous = true;
      recognition2.interimResults = false;
      recognition2.onresult = (event) => {
        var _a;
        const results = event.results;
        const last = results[results.length - 1];
        if ((_a = last == null ? void 0 : last[0]) == null ? void 0 : _a.transcript) void handle(last[0].transcript);
      };
      recognition2.onend = () => {
        if (listening) recognition2 == null ? void 0 : recognition2.start();
      };
      recognition2.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") listening = false;
      };
      listening = true;
      recognition2.start();
      return true;
    }
    function stop() {
      listening = false;
      recognition2 == null ? void 0 : recognition2.stop();
      recognition2 = null;
    }
    return {
      start,
      stop,
      /** Run a command from text (also handy for typed commands and tests). */
      handle,
      isListening: () => listening,
      getConfig: () => ({ ...config })
    };
  }

  // vanilla/src/agent.js
  function emitter() {
    const listeners = /* @__PURE__ */ new Set();
    return {
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      emit(value) {
        listeners.forEach((fn) => {
          try {
            fn(value);
          } catch (error) {
            console.error("[yuktai] listener failed", error);
          }
        });
      }
    };
  }
  var toError = (error) => error instanceof Error ? error : new Error(String(error));
  var MESSAGES2 = {
    en: {
      done: "Done.",
      toolMissing: (name) => `The action "${name}" is not available here.`,
      missingInput: (fields) => `Missing: ${fields}.`,
      notUnderstood: "Sorry, I didn't understand. Try: a word to search, \u201Csort by <column>\u201D, or \u201Cclear filters\u201D.",
      noMatch: (text) => `Nothing matched "${text}".`,
      failed: "Something went wrong while running this action."
    },
    te: {
      done: "\u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C2F\u0C3F\u0C02\u0C26\u0C3F.",
      toolMissing: (name) => `"${name}" \u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C07\u0C15\u0C4D\u0C15\u0C21 \u0C05\u0C02\u0C26\u0C41\u0C2C\u0C3E\u0C1F\u0C41\u0C32\u0C4B \u0C32\u0C47\u0C26\u0C41.`,
      missingInput: (fields) => `\u0C07\u0C35\u0C3F \u0C15\u0C3E\u0C35\u0C3E\u0C32\u0C3F: ${fields}.`,
      notUnderstood: "\u0C15\u0C4D\u0C37\u0C2E\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F, \u0C05\u0C30\u0C4D\u0C25\u0C02 \u0C15\u0C3E\u0C32\u0C47\u0C26\u0C41. \u0C07\u0C32\u0C3E \u0C2A\u0C4D\u0C30\u0C2F\u0C24\u0C4D\u0C28\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F: \u0C35\u0C46\u0C24\u0C15\u0C3E\u0C32\u0C4D\u0C38\u0C3F\u0C28 \u0C2A\u0C26\u0C02, \u201C<\u0C15\u0C3E\u0C32\u0C2E\u0C4D> \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u201D, \u0C32\u0C47\u0C26\u0C3E \u201C\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F\u201D.",
      noMatch: (text) => `"${text}" \u0C15\u0C3F \u0C0F\u0C2E\u0C40 \u0C38\u0C30\u0C3F\u0C2A\u0C4B\u0C32\u0C47\u0C26\u0C41.`,
      failed: "\u0C08 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C21\u0C17\u0C3E \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F."
    }
  };
  var norm2 = (s) => String(s ?? "").normalize("NFC").toLowerCase().trim();
  var RX = {
    clearFilters: /\b(clear|remove|reset)\b.*\bfilters?\b|ఫిల్టర్.*(తీసే|తొలగ)/i,
    clearSort: /\b(clear|remove|reset)\b.*\bsort(ing)?\b|క్రమం.*(తీసే|తొలగ)/i,
    count: /^\s*(how many|count)\b|ఎన్ని|లెక్క/i,
    sort: /\bsort\b|\border by\b|క్రమ|అమర్చ|సార్ట్/i,
    desc: /\b(desc|descending|z\s*-\s*a|highest|largest|most)\b|అవరోహణ|తగ్గే|పెద్ద|అధిక|చివర|ఎక్కువ నుండి/i,
    openEn: /^\s*open\s+(.+?)\s*$/i,
    openTe: /^\s*(.+?)\s*(తెరువు|తెరవండి|తెరవు)\s*$/,
    searchFiller: /^\s*(search(\s+for)?|find|show(\s+me)?|filter(\s+by)?|look\s+for|వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s+|\s+(వెతుకు|వెతకండి|శోధించు|శోధించండి|చూపించు|చూపించండి)\s*$/gi
  };
  function findColumnInText(text, columns) {
    const t = norm2(text);
    let best = null;
    for (const c of columns) {
      for (const name of [c.label, c.key]) {
        const n = norm2(name);
        if (n && t.includes(n) && (!best || n.length > best.len)) best = { key: c.key, len: n.length };
      }
    }
    return best ? best.key : null;
  }
  function parseGridIntent(text, context) {
    const raw = String(text ?? "").trim();
    if (!raw) return null;
    const columns = context && context.columns || [];
    if (RX.clearFilters.test(raw)) return { kind: "tool", tool: "clear_filters", input: {} };
    if (RX.clearSort.test(raw)) return { kind: "tool", tool: "clear_sort", input: {} };
    if (RX.count.test(raw)) return { kind: "tool", tool: "count", input: {} };
    if (RX.sort.test(raw)) {
      const key = findColumnInText(raw, columns);
      if (!key) return null;
      return { kind: "tool", tool: "sort", input: { key, direction: RX.desc.test(raw) ? "desc" : "asc" } };
    }
    const open = raw.match(RX.openEn) || raw.match(RX.openTe);
    if (open && open[1]) return { kind: "open", text: open[1].trim() };
    const query = raw.replace(RX.searchFiller, "").trim();
    return query ? { kind: "tool", tool: "search", input: { query } } : null;
  }
  function isStructured(value) {
    return !!value && typeof value === "object" && typeof value.success === "boolean" && typeof value.message === "string";
  }
  function missingRequired(tool, input) {
    const required = tool.inputSchema && tool.inputSchema.required;
    if (!Array.isArray(required)) return [];
    return required.map(String).filter((k) => input[k] === void 0 || input[k] === null || String(input[k]).trim() === "");
  }
  function findTool(tools, name) {
    const exact = tools.find((t) => t.name === name);
    if (exact) return exact;
    const matches = tools.filter((t) => t.name.endsWith(`_${name}`)).sort((a, b) => a.name.length - b.name.length);
    if (!matches.length) return void 0;
    if (matches.length > 1 && matches[0].name.length === matches[1].name.length) return void 0;
    return matches[0];
  }
  var normalizeRuleText = (value) => String(value ?? "").normalize("NFC").trim().toLocaleLowerCase();
  function findCustomRule(input, rules) {
    const text = normalizeRuleText(input);
    return (rules || []).find(
      (rule) => (rule.phrases || []).some((phrase) => {
        const p = normalizeRuleText(phrase);
        return p.length > 0 && text.includes(p);
      })
    );
  }
  function createGridAgent(options = {}) {
    const read = (value) => typeof value === "function" ? value() : value;
    const opts = { locale: "en", rowKey: "id", historyLimit: 20, customRules: [], ...options };
    const events = emitter();
    let pending = 0;
    let lastResult = null;
    let lastError = null;
    let history = [];
    let stepId = 0;
    const m = () => MESSAGES2[opts.locale === "te" ? "te" : "en"];
    const tools = () => read(opts.tools) || [];
    const state = () => ({ loading: pending > 0, lastResult, lastError, history: history.slice() });
    const changed = () => events.emit(state());
    function record(tool, input, result, source, id) {
      if (id === stepId) lastResult = result;
      history = [...history, { id, tool, input, result, source, at: Date.now() }].slice(-opts.historyLimit);
      changed();
    }
    async function run(name, input, source) {
      const id = ++stepId;
      const tool = findTool(tools(), name);
      if (!tool) {
        const result = { success: false, message: m().toolMissing(name), error: { code: "NOT_SUPPORTED" } };
        lastError = new Error(result.message);
        opts.onError && opts.onError(lastError);
        record(name, input, result, source, id);
        return result;
      }
      const missing = missingRequired(tool, input);
      if (missing.length) {
        const result = { success: false, message: m().missingInput(missing.join(", ")), error: { code: "INVALID_INPUT" }, tool: tool.name };
        record(tool.name, input, result, source, id);
        opts.onResult && opts.onResult(result);
        return result;
      }
      pending++;
      changed();
      try {
        const raw = await tool.execute(input);
        const result = isStructured(raw) ? { ...raw, tool: tool.name } : { success: true, message: m().done, data: raw, tool: tool.name };
        if (result.success) lastError = null;
        record(tool.name, input, result, source, id);
        opts.onResult && opts.onResult(result);
        return result;
      } catch (error) {
        lastError = toError(error);
        const result = { success: false, message: m().failed, error: { code: "INTERNAL" }, tool: tool.name };
        opts.onError && opts.onError(lastError);
        record(tool.name, input, result, source, id);
        return result;
      } finally {
        pending = Math.max(0, pending - 1);
        changed();
      }
    }
    const executeTool = (name, input = {}) => run(name, input || {}, "tool");
    async function ask(text) {
      const columns = read(opts.columns) || [];
      const rule = findCustomRule(text, opts.customRules);
      if (rule) {
        const id = ++stepId;
        try {
          const message = await rule.execute({ input: text, data: read(opts.data) || [], columns, executeTool });
          const result = { success: true, message: String(message ?? m().done), tool: `rule:${rule.name}` };
          record(`rule:${rule.name}`, { text }, result, "ask", id);
          opts.onResult && opts.onResult(result);
          return result;
        } catch (error) {
          lastError = toError(error);
          opts.onError && opts.onError(lastError);
          const result = { success: false, message: m().failed, error: { code: "INTERNAL" }, tool: `rule:${rule.name}` };
          record(`rule:${rule.name}`, { text }, result, "ask", id);
          return result;
        }
      }
      const intent = (opts.parseIntent || parseGridIntent)(text, { columns, locale: opts.locale });
      if (!intent) {
        const result = { success: false, message: m().notUnderstood, error: { code: "NOT_UNDERSTOOD" } };
        record("ask", { text }, result, "ask", ++stepId);
        return result;
      }
      if (intent.kind === "tool") return run(intent.tool, intent.input, "ask");
      const found = await run("search", { query: intent.text }, "ask");
      if (!found.success) return found;
      const rows = Array.isArray(found.data) ? found.data : [];
      if (!rows.length) {
        const result = { success: false, message: m().noMatch(intent.text), error: { code: "NOT_FOUND" }, tool: found.tool };
        record("open", { text: intent.text }, result, "ask", ++stepId);
        return result;
      }
      return run("open", { id: getRowId(rows[0], opts.rowKey) }, "ask");
    }
    function clearHistory() {
      history = [];
      lastResult = null;
      lastError = null;
      changed();
    }
    return {
      ask,
      executeTool,
      clearHistory,
      subscribe: events.subscribe,
      getState: state,
      get tools() {
        return tools();
      },
      get loading() {
        return pending > 0;
      },
      get lastResult() {
        return lastResult;
      },
      get lastError() {
        return lastError;
      },
      get history() {
        return history.slice();
      }
    };
  }
  function registerWebMCP(tools, options = {}) {
    const read = () => (typeof tools === "function" ? tools() : tools) || [];
    const report = (status) => {
      current.status = status;
      options.onStatusChange && options.onStatusChange(status);
    };
    const current = {
      status: { state: "unsupported", registered: [], errors: [] },
      done: Promise.resolve(),
      unregister() {
        controller.abort();
      }
    };
    const modelContext = typeof document !== "undefined" ? document.modelContext : void 0;
    const controller = new AbortController();
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      report({ state: "unsupported", registered: [], errors: [] });
      return current;
    }
    current.done = (async () => {
      report({ state: "registering", registered: [], errors: [] });
      const registered = [];
      const errors = [];
      for (const tool of read()) {
        if (controller.signal.aborted) return;
        try {
          await modelContext.registerTool(
            {
              name: tool.name,
              title: tool.title,
              description: tool.description,
              inputSchema: tool.inputSchema,
              execute: (input) => {
                const latest = read().find((t) => t.name === tool.name);
                return latest ? latest.execute(input || {}) : { success: false, message: `Tool "${tool.name}" is no longer available.`, error: { code: "NOT_SUPPORTED" } };
              }
            },
            { signal: controller.signal }
          );
          registered.push(tool.name);
        } catch (error) {
          errors.push({ tool: tool.name, message: toError(error).message });
        }
      }
      if (controller.signal.aborted) return;
      report({ state: errors.length === 0 ? "ready" : registered.length ? "partial" : "error", registered, errors });
    })();
    return current;
  }
  var BI_PATTERN = /\b(trend|over time|this (week|month|quarter|year)|last (week|month|quarter|year)|compare|versus|vs)\b|\b(by|per|each|which)\b.*\b(total|average|avg|sum|drop|increase|growth|highest|lowest|most|least)\b|\b(total|average|avg|sum)\b.*\b(by|per|each)\b/i;
  var EMPTY_QUERY = { filters: [], search: [], sort: null, limit: null, notes: [], explanation: "" };
  function createAgenticGrid(options = {}) {
    const events = emitter();
    const rowKey = options.rowKey || "id";
    const bind = options.bind || null;
    let data = Array.isArray(options.data) ? options.data : [];
    let columns = toGridToolColumns(options.columns || []);
    let own = { filters: [], sort: null, highlightIds: [] };
    let answer = "";
    let kind = null;
    let table = [];
    let steps = [];
    let busy = false;
    const getFilters = () => bind ? bind.getFilters() : own.filters;
    const getSort = () => bind ? bind.getSort() : own.sort;
    const getHighlights = () => bind ? bind.getHighlightIds() : own.highlightIds;
    const getData = () => bind ? bind.getData() : data;
    const setFilters = (f) => bind ? bind.setFilters(f) : own = { ...own, filters: f };
    const setSort = (s) => bind ? bind.setSort(s) : own = { ...own, sort: s };
    const setHighlights = (ids) => bind ? bind.setHighlightIds(ids) : own = { ...own, highlightIds: ids };
    function gridData() {
      return executeGridQuery(getData(), columns, { ...EMPTY_QUERY, filters: getFilters(), sort: getSort() });
    }
    const snapshot = () => {
      const rows = gridData();
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
        visibleIds: rows.map((r) => getRowId(r, rowKey))
      };
    };
    const changed = () => events.emit(snapshot());
    const context = () => ({
      get data() {
        return getData();
      },
      columns,
      rowKey,
      get filters() {
        return getFilters();
      },
      onFiltersChange: (f) => {
        setFilters(f);
        changed();
      },
      onSortChange: (s) => {
        setSort(s);
        changed();
      },
      onHighlightRows: (ids) => {
        setHighlights(ids);
        changed();
      },
      onOpenRow: options.onOpenRow,
      onSelectRow: (id) => {
        if (bind && bind.selectRow) bind.selectRow(id);
        else setHighlights([id]);
        changed();
      }
    });
    async function ask(question) {
      const q = String(question ?? "").trim();
      if (!q) return snapshot();
      busy = true;
      steps = [];
      table = [];
      changed();
      try {
        if (planTasks(q).length > 1) {
          const live = [];
          const result = await runTasks(q, context(), {
            onStep: (step) => {
              live.push(step);
              steps = live.slice();
              changed();
            }
          });
          kind = "tasks";
          answer = result.summary;
        } else if (BI_PATTERN.test(q)) {
          const filtered = applyGridFilters(getData(), columns, getFilters());
          const insight = askInsight(q, filtered, columns, { referenceDate: options.referenceDate });
          kind = "insight";
          answer = insight.answer;
          table = insight.table || [];
        } else {
          const result = answerGridQuestion(q, context());
          kind = result.kind;
          answer = result.message;
        }
      } catch (error) {
        console.error("[yuktai] ask failed", error);
        kind = null;
        answer = "Something went wrong while answering. Please rephrase the question.";
      } finally {
        busy = false;
        changed();
      }
      return snapshot();
    }
    function reset() {
      setFilters([]);
      setSort(null);
      setHighlights([]);
      answer = "";
      kind = null;
      table = [];
      steps = [];
      changed();
    }
    function update(next = {}) {
      if (Array.isArray(next.data)) data = next.data;
      if (Array.isArray(next.columns)) columns = toGridToolColumns(next.columns);
      changed();
    }
    return {
      ask,
      reset,
      update,
      subscribe: events.subscribe,
      getState: snapshot,
      get gridData() {
        return gridData();
      },
      get highlightIds() {
        return getHighlights().slice();
      },
      get filters() {
        return getFilters().slice();
      },
      get sort() {
        return getSort();
      },
      get answer() {
        return answer;
      },
      get kind() {
        return kind;
      },
      get table() {
        return table.slice();
      },
      get steps() {
        return steps.slice();
      },
      get busy() {
        return busy;
      },
      get visibleIds() {
        return gridData().map((r) => getRowId(r, rowKey));
      }
    };
  }

  // vanilla/src/dom.js
  var isBrowser2 = () => typeof window !== "undefined" && typeof document !== "undefined";
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (value == null || value === false) continue;
        if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
        else if (key === "html") el.innerHTML = value;
        else if (key === "text") el.textContent = value;
        else if (value === true) el.setAttribute(key, "");
        else el.setAttribute(key, String(value));
      }
    }
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
  }
  var uid = 0;
  var nextId = (prefix = "yv") => `${prefix}-${++uid}`;
  function safeColor(value, fallback) {
    if (typeof value !== "string" || !isBrowser2()) return fallback;
    const probe = document.createElement("span");
    probe.style.color = value;
    return probe.style.color ? value : fallback;
  }
  var prefersReducedMotion = () => isBrowser2() && (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-yuktai-reduce-motion"));
  var PATHS = {
    accessibility: '<circle cx="12" cy="4" r="2"/><path d="M4 8l8-1 8 1M12 7v5m-5 9 5-8 5 8M7 12l-2 5m12-5 2 5"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    motion: '<path d="M4 12h12m-5-5 5 5-5 5M20 5v14"/>',
    reading: '<path d="M4 5h16M4 10h12M4 15h16M4 20h10"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="16" cy="10" r="1.3"/><path d="M12 21a3 3 0 0 1 0-6h2"/>',
    skip: '<path d="M5 5l7 7-7 7M13 5l7 7-7 7"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
    sort: '<path d="m8 9 4-4 4 4m-8 6 4 4 4-4"/>',
    sortUp: '<path d="m6 15 6-6 6 6"/>',
    sortDown: '<path d="m6 9 6 6 6-6"/>',
    chevrons: '<path d="m8 9 4-4 4 4m-8 6 4 4 4-4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    cards: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    first: '<path d="m11 18-6-6 6-6M19 18l-6-6 6-6"/>',
    last: '<path d="m13 18 6-6-6-6M5 18l6-6-6-6"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z"/>',
    alert: '<path d="m12 3 10 18H2L12 3z"/><path d="M12 9v5m0 3h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9h.01"/>',
    form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    wand: '<path d="m15 4 5 5L9 20H4v-5z"/><path d="m13 6 5 5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>'
  };
  var ICON_NAMES = Object.keys(PATHS);
  function icon(name, size = 20, label) {
    const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"';
    return `<svg ${a11y} width="${Number(size) || 20}" height="${Number(size) || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${PATHS[name] || PATHS.spark}</svg>`;
  }
  function iconEl(name, size, label) {
    const span = document.createElement("span");
    span.className = "yv-ic";
    span.innerHTML = icon(name, size, label);
    return span;
  }
  var liveNode = null;
  function announce2(text) {
    if (!isBrowser2() || !text) return;
    if (!liveNode || !document.contains(liveNode)) {
      liveNode = h("div", { id: "yuktai-vanilla-live", class: "yv-sr", role: "status", "aria-live": "polite", "aria-atomic": "true" });
      document.body.appendChild(liveNode);
    }
    liveNode.textContent = "";
    setTimeout(() => {
      if (liveNode) liveNode.textContent = String(text).slice(0, 300);
    }, 30);
  }
  function downloadText(filename, text, type = "text/plain;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = h("a", { href: url, download: filename, hidden: true });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = h("textarea", { "aria-hidden": "true", style: "position:fixed;opacity:0;left:-9999px" });
      area.value = text;
      document.body.appendChild(area);
      area.select();
      let ok2 = false;
      try {
        ok2 = document.execCommand("copy");
      } catch {
        ok2 = false;
      }
      area.remove();
      return ok2;
    }
  }
  function csvCell(value) {
    let text = String(value == null ? "" : value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function flashElements(selectors) {
    const list = (selectors || []).map((s) => {
      try {
        return document.querySelector(s);
      } catch {
        return null;
      }
    }).filter(Boolean);
    list.forEach((el) => {
      el.setAttribute("data-yv-flash", "");
      setTimeout(() => el.removeAttribute("data-yv-flash"), 4e3);
    });
    if (list[0]) list[0].scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    return list.length;
  }
  function addStyles(primary, side) {
    if (!isBrowser2() || document.getElementById("yuktai-vanilla-css")) return;
    const s = document.createElement("style");
    s.id = "yuktai-vanilla-css";
    s.textContent = `
:root{--yv-primary:${primary}}
.yv-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.yv-ic{display:inline-flex;line-height:0}
[data-yv-flash]{outline:3px solid #d97706!important;outline-offset:3px!important;background-color:#fef3c7!important;color:#111!important}
.yv-grid,.yv-grid *,.yv-box,.yv-box *,.yv-fab,.yv-dialog,.yv-dialog *{box-sizing:border-box}
.yv-grid button,.yv-box button,.yv-dialog button,.yv-grid select,.yv-box select,.yv-dialog select,.yv-grid input,.yv-box input,.yv-dialog input,.yv-box textarea{font:inherit;color:inherit}
.yv-grid :focus-visible,.yv-box :focus-visible,.yv-dialog :focus-visible,.yv-fab:focus-visible{outline:3px solid #2563eb;outline-offset:2px}
.yv-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;padding:8px 12px;border:1px solid var(--yv-border);border-radius:8px;background:var(--yv-surface);color:var(--yv-text);cursor:pointer;font-weight:600;line-height:1.2}
.yv-btn:hover:not(:disabled){background:var(--yv-hover)}
.yv-btn:disabled{opacity:.45;cursor:not-allowed}
.yv-btn.yv-primary{background:var(--yv-primary);border-color:var(--yv-primary);color:#fff}
.yv-btn.yv-icon{padding:0;width:44px}
.yv-btn.yv-small{min-height:36px;padding:6px 10px;font-size:.85em}
.yv-btn[aria-pressed=true]{background:var(--yv-accent-bg);border-color:var(--yv-primary);color:var(--yv-accent-text)}
.yv-input{min-height:44px;width:100%;min-width:0;padding:8px 10px;font-size:16px!important;border:1px solid var(--yv-border-strong);border-radius:8px;background:var(--yv-surface);color:var(--yv-text)}
.yv-muted{color:var(--yv-muted);font-size:.875em}
.yv-chip{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:4px 12px;border:1px solid var(--yv-border);border-radius:999px;background:var(--yv-surface);color:var(--yv-text);cursor:pointer;font-size:.85em}
.yv-chip:hover{background:var(--yv-hover)}
.yv-answer{margin-top:10px;padding:12px;border:1px solid var(--yv-border);border-radius:8px;background:var(--yv-soft);white-space:pre-wrap;overflow-wrap:anywhere}
.yv-answer:empty{display:none}
.yv-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:999px;font-size:.8em;font-weight:700;border:1px solid currentColor;background:var(--yv-badge-bg,transparent)}
.yv-sev-critical{color:#b91c1c}.yv-sev-serious{color:#c2410c}.yv-sev-moderate{color:#a16207}.yv-sev-minor{color:#475569}
.yv-sev-high{color:#b91c1c}.yv-sev-medium{color:#a16207}.yv-sev-low{color:#475569}

/* themes (shared by grid, boxes and dialogs) */
.yv-grid,.yv-box,.yv-dialog{--yv-bg:#fff;--yv-surface:#fff;--yv-soft:#f8fafc;--yv-head:#f8fafc;--yv-hover:#f1f5f9;--yv-text:#0f172a;--yv-muted:#475569;--yv-border:#e2e8f0;--yv-border-strong:#94a3b8;--yv-accent-bg:#ccfbf1;--yv-accent-text:#115e59;--yv-hl-bg:#fef3c7;--yv-hl-edge:#b45309;--yv-sel-bg:#f0fdfa}
.yv-theme-dark{--yv-bg:#0f172a;--yv-surface:#111c33;--yv-soft:#16233f;--yv-head:#16233f;--yv-hover:#1e2d4d;--yv-text:#f1f5f9;--yv-muted:#cbd5e1;--yv-border:#334155;--yv-border-strong:#64748b;--yv-accent-bg:#134e4a;--yv-accent-text:#ccfbf1;--yv-hl-bg:#4a3a0c;--yv-hl-edge:#fbbf24;--yv-sel-bg:#123a3a}
.yv-theme-high-contrast{--yv-bg:#fff;--yv-surface:#fff;--yv-soft:#fff;--yv-head:#fff;--yv-hover:#e5e5e5;--yv-text:#000;--yv-muted:#000;--yv-border:#000;--yv-border-strong:#000;--yv-accent-bg:#000;--yv-accent-text:#fff;--yv-hl-bg:#ffff00;--yv-hl-edge:#000;--yv-sel-bg:#e5e5e5}
.yv-theme-high-contrast.yv-grid,.yv-theme-high-contrast .yv-btn,.yv-theme-high-contrast .yv-input{border-width:2px}
.yv-theme-high-contrast .yv-btn.yv-primary{background:#000;border-color:#000}
.yv-theme-color-blind{--yv-accent-bg:#dbeafe;--yv-accent-text:#1e3a8a;--yv-hl-bg:#ffedd5;--yv-hl-edge:#1d4ed8;--yv-sel-bg:#e0f2fe}
.yv-theme-color-blind tr.yv-hl td,.yv-theme-color-blind .yv-card.yv-hl{background-image:repeating-linear-gradient(135deg,transparent 0 8px,rgba(29,78,216,.10) 8px 12px)}
.yv-theme-dyslexia{font-family:"Atkinson Hyperlegible",Verdana,Arial,sans-serif!important;letter-spacing:.03em;word-spacing:.12em;line-height:1.75}
.yv-theme-dyslexia td,.yv-theme-dyslexia th{padding-top:14px;padding-bottom:14px}

/* grid */
.yv-grid{position:relative;width:100%;background:var(--yv-bg);color:var(--yv-text);border:1px solid var(--yv-border);border-radius:12px;overflow:hidden;font-size:15px;line-height:1.5}
.yv-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--yv-border)}
.yv-search{display:flex;align-items:center;gap:8px;flex:1 1 240px;min-width:0;min-height:44px;padding:0 10px;border:1px solid var(--yv-border-strong);border-radius:8px;background:var(--yv-surface)}
.yv-search input{flex:1;min-width:0;min-height:42px;font-size:16px!important;border:0;outline:0;background:transparent;color:inherit}
.yv-search:focus-within{outline:3px solid #2563eb;outline-offset:2px}
.yv-info{color:var(--yv-muted);font-size:.875em}
.yv-tools{display:flex;gap:6px;flex-wrap:wrap}
.yv-filterbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid var(--yv-border);background:var(--yv-soft)}
.yv-filterbar[hidden]{display:none}
.yv-tablewrap{width:100%;overflow:auto;max-height:var(--yv-max-height,none)}
.yv-table{width:100%;border-collapse:collapse;text-align:left}
.yv-table th,.yv-table td{padding:8px 12px;border-bottom:1px solid var(--yv-border);vertical-align:middle}
.yv-table th{position:sticky;top:0;z-index:1;background:var(--yv-head);color:var(--yv-text);font-size:.85em;font-weight:700;white-space:nowrap}
.yv-table td{white-space:nowrap}
.yv-wrap .yv-table td{white-space:normal;overflow-wrap:anywhere}
.yv-table tbody tr:hover td{background:var(--yv-hover)}
.yv-table [role=gridcell]:focus,.yv-table [role=columnheader]:focus{outline:3px solid #2563eb;outline-offset:-3px}
.yv-table tr[aria-selected=true] td{background:var(--yv-sel-bg)}
.yv-table tr.yv-hl td,.yv-card.yv-hl{background:var(--yv-hl-bg)!important;color:var(--yv-text)}
.yv-table tr.yv-hl td:first-child{box-shadow:inset 5px 0 var(--yv-hl-edge)}
.yv-table tr[data-yuktai-row-id]:focus{outline:3px solid #2563eb;outline-offset:-3px}
.yv-sortbtn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 4px;border:0;background:transparent;color:inherit;font:inherit;font-weight:700;cursor:pointer}
.yv-align-right{text-align:right!important}.yv-align-center{text-align:center!important}
.yv-check{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;cursor:pointer}
.yv-check input{width:18px;height:18px;accent-color:var(--yv-primary);cursor:pointer;margin:0}
.yv-cellbadge{display:inline-block;padding:2px 10px;border-radius:999px;border:1px solid var(--yv-border-strong);background:var(--yv-soft);font-size:.85em;font-weight:600}
.yv-empty,.yv-loading{padding:28px 16px;text-align:center;color:var(--yv-muted)}
.yv-cards{display:grid;gap:10px;padding:12px;list-style:none;margin:0}
.yv-card{border:1px solid var(--yv-border);border-radius:10px;padding:10px 12px;background:var(--yv-surface)}
.yv-card[aria-selected=true]{background:var(--yv-sel-bg);border-color:var(--yv-primary)}
.yv-card.yv-hl{border-left:6px solid var(--yv-hl-edge)}
.yv-card:focus{outline:3px solid #2563eb;outline-offset:2px}
.yv-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.yv-card-title{font-weight:700;margin:0;font-size:1em;overflow-wrap:anywhere}
.yv-card dl{display:grid;grid-template-columns:minmax(90px,38%) 1fr;gap:4px 10px;margin:6px 0 0}
.yv-card dt{color:var(--yv-muted);font-size:.85em}
.yv-card dd{margin:0;overflow-wrap:anywhere}
.yv-pager{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-top:1px solid var(--yv-border)}
.yv-pager .yv-pages{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.yv-pager select{min-height:44px;padding:6px 8px;border:1px solid var(--yv-border-strong);border-radius:8px;background:var(--yv-surface);color:var(--yv-text)}

/* boxes: assistant, agentic bar, page tools */
.yv-box{background:var(--yv-bg);color:var(--yv-text);border:1px solid var(--yv-border);border-radius:12px;padding:12px;font-size:15px;line-height:1.5}
.yv-grid .yv-box{border:0;border-bottom:1px solid var(--yv-border);border-radius:0}
.yv-box h2,.yv-box h3,.yv-dialog h2,.yv-dialog h3{margin:0 0 6px;font-size:1.05em}
.yv-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.yv-row>.yv-input{flex:1 1 220px}
.yv-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.yv-steps{margin:8px 0 0;padding-left:22px}
.yv-steps li{margin:3px 0}
.yv-mini{width:100%;border-collapse:collapse;margin-top:10px;font-size:.9em}
.yv-mini th,.yv-mini td{border:1px solid var(--yv-border);padding:6px 8px;text-align:left}
.yv-mini th{background:var(--yv-head)}
.yv-history{margin-top:8px}
.yv-history summary{cursor:pointer;min-height:36px;display:flex;align-items:center}
.yv-history ol{margin:6px 0 0;padding-left:22px;font-size:.9em}
.yv-ok{color:#047857}.yv-fail{color:#b91c1c}
.yv-theme-dark .yv-ok{color:#6ee7b7}.yv-theme-dark .yv-fail{color:#fca5a5}
.yv-tabs{display:flex;gap:4px;overflow-x:auto;padding:4px;border-bottom:1px solid var(--yv-border);margin:-4px -4px 10px}
.yv-tab{white-space:nowrap;min-height:44px;padding:6px 12px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--yv-text);font-weight:700;cursor:pointer}
.yv-tab[aria-selected=true]{background:var(--yv-accent-bg);color:var(--yv-accent-text);border-color:var(--yv-primary)}
.yv-list{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:8px}
.yv-item{border:1px solid var(--yv-border);border-radius:8px;padding:10px;background:var(--yv-surface)}
.yv-item p{margin:4px 0}
.yv-item code{font-size:.8em;overflow-wrap:anywhere}
.yv-score{display:flex;align-items:baseline;gap:8px;margin:6px 0}
.yv-score strong{font-size:2em;line-height:1}
.yv-meter{height:8px;border-radius:99px;background:var(--yv-border);overflow:hidden;margin:4px 0 8px}
.yv-meter span{display:block;height:100%;background:var(--yv-primary)}
.yv-cats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:8px 0}
.yv-cat{border:1px solid var(--yv-border);border-radius:8px;padding:8px;background:var(--yv-soft)}
.yv-cat strong{display:block;font-size:1.3em}

/* floating buttons and dialogs */
.yv-fabs{position:fixed;bottom:max(16px,env(safe-area-inset-bottom));${side}:16px;display:flex;flex-direction:column;gap:10px;z-index:2147483000}
.yv-fab{width:56px;height:56px;display:grid;place-items:center;border:2px solid #fff;border-radius:50%;background:var(--yv-primary);color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.25);cursor:pointer}
.yv-fab.yv-fab-alt{background:#1e293b}
.yv-dialog{position:fixed;bottom:max(90px,calc(env(safe-area-inset-bottom) + 84px));${side}:12px;width:min(440px,calc(100vw - 24px));max-height:calc(100dvh - 110px);overflow:auto;background:var(--yv-bg);color:var(--yv-text);border:1px solid var(--yv-border);border-radius:16px;box-shadow:0 12px 40px rgba(15,23,42,.25);z-index:2147483001;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.yv-dialog.yv-wide{width:min(620px,calc(100vw - 24px))}
.yv-dialog-head{position:sticky;top:0;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:14px 16px;border-bottom:1px solid var(--yv-border);background:var(--yv-bg)}
.yv-dialog-head h2{margin:0;font-size:1.1em}
.yv-dialog-body{padding:12px 16px 16px}
.yv-dialog .yv-box{border:0;padding:0}
.yv-option{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--yv-border)}
.yv-option-icon{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:9px;background:var(--yv-accent-bg);color:var(--yv-accent-text)}
.yv-option-copy{flex:1;min-width:0}
.yv-option-copy b{display:block;font-size:.95em}
.yv-option-copy small{display:block;color:var(--yv-muted);font-size:.8em}
.yv-switch{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:52px;min-height:44px;cursor:pointer}
.yv-switch input{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;cursor:pointer}
.yv-switch span{position:relative;pointer-events:none;width:44px;height:26px;border-radius:99px;background:#64748b;transition:background .15s}
.yv-switch span::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .15s}
.yv-switch input:checked+span{background:var(--yv-primary)}
.yv-switch input:checked+span::after{transform:translateX(18px)}
.yv-switch input:focus-visible+span{outline:3px solid #2563eb;outline-offset:3px}
.yv-steps-bar{display:flex;gap:4px;flex:1}
.yv-step{flex:1;min-width:0;height:28px;border:0;border-radius:6px;background:transparent;padding:0;cursor:pointer;position:relative}
.yv-step::after{content:"";position:absolute;left:0;right:0;top:10px;height:8px;border-radius:8px;background:#cbd5e1}
.yv-step[aria-pressed=true]::after{background:var(--yv-primary)}
.yv-status{margin:10px 0 0;padding:9px 11px;border-radius:8px;background:var(--yv-soft);border:1px solid var(--yv-border);font-size:.85em}
.yv-status:empty{display:none}
@media (max-width:560px){.yv-dialog{${side}:8px;width:calc(100vw - 16px)}.yv-toolbar{align-items:stretch}.yv-search{flex-basis:100%}}
@media (prefers-reduced-motion:reduce){.yv-switch span,.yv-switch span::after{transition:none}}
`;
    document.head.appendChild(s);
  }

  // vanilla/src/bar.js
  var KIND_LABEL = { query: "Grid query", anomalies: "Anomalies", summary: "Summary", insight: "BI insight", tasks: "Task steps" };
  function mountAgenticGridBar(container, agentic, options = {}) {
    const target = typeof container === "string" ? document.querySelector(container) : container;
    if (!target) throw new Error("mountAgenticGridBar: container not found");
    if (!agentic || typeof agentic.ask !== "function") throw new Error("mountAgenticGridBar: pass the object from createAgenticGrid() or grid.agentic");
    const titleText = options.title || "Ask about this data";
    const inputId = nextId("yv-q");
    const hintId = nextId("yv-qh");
    const input = h("input", {
      id: inputId,
      class: "yv-input",
      type: "text",
      autocomplete: "off",
      placeholder: options.placeholder || "Ask the grid\u2026 e.g. salary over 1 lakh in Hyderabad",
      "aria-describedby": hintId
    });
    const askBtn = h("button", { type: "submit", class: "yv-btn yv-primary" }, iconEl("spark", 16), "Ask");
    const resetBtn = h("button", { type: "button", class: "yv-btn" }, iconEl("reset", 16), "Show all rows");
    const kind = h("p", { class: "yv-muted", style: "margin:10px 0 0", hidden: true });
    const answer = h("div", { class: "yv-answer", role: "status", "aria-live": "polite" });
    const extra = h("div");
    const examples = options.examples || ["salary over 1 lakh", "anything unusual?", "average salary by department", "show salary over 80k, then sort by salary, then summarize"];
    const chips = h("div", { class: "yv-chips", "aria-label": "Example questions" }, ...examples.map((x) => h("button", { type: "button", class: "yv-chip", "data-example": x }, x)));
    const form = h("form", { class: "yv-row", role: "search", "aria-label": titleText }, h("label", { for: inputId, class: "yv-sr" }, titleText), input, askBtn, resetBtn);
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
    );
    target.appendChild(box);
    function paint(state) {
      askBtn.disabled = !!state.busy;
      box.setAttribute("aria-busy", String(!!state.busy));
      if (state.busy) return;
      answer.textContent = state.answer || "";
      kind.hidden = !state.kind;
      kind.textContent = state.kind ? `${KIND_LABEL[state.kind] || state.kind} \xB7 ${state.visibleIds.length} row(s) shown` : "";
      extra.replaceChildren();
      if (state.table && state.table.length) {
        const headers = Object.keys(state.table[0]);
        const table = h("table", { class: "yv-mini" });
        table.innerHTML = `<caption class="yv-sr">Answer table</caption><thead><tr>${headers.map((x) => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${state.table.map((r) => `<tr>${headers.map((x) => `<td>${esc(r[x])}</td>`).join("")}</tr>`).join("")}</tbody>`;
        extra.append(h("div", { style: "overflow-x:auto" }, table));
      }
      if (state.steps && state.steps.length) {
        extra.append(
          h(
            "ol",
            { class: "yv-steps", "aria-label": "Steps" },
            ...state.steps.map((s) => h("li", null, h("span", { class: s.success === false ? "yv-fail" : "yv-ok" }, s.success === false ? "\u2717 " : "\u2713 "), h("b", null, s.action), ": ", s.message || s.text))
          )
        );
      }
    }
    const unsubscribe = agentic.subscribe(paint);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      agentic.ask(input.value);
    });
    resetBtn.addEventListener("click", () => {
      input.value = "";
      agentic.reset();
    });
    chips.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-example]");
      if (!chip) return;
      input.value = chip.getAttribute("data-example");
      agentic.ask(input.value);
    });
    return {
      element: box,
      ask: (q) => {
        input.value = q;
        return agentic.ask(q);
      },
      destroy() {
        unsubscribe();
        box.remove();
      }
    };
  }

  // vanilla/src/grid.js
  var UI = {
    en: {
      search: "Search\u2026",
      searchAria: "Search grid",
      rows: "rows",
      selected: "selected",
      loading: "Loading\u2026",
      noData: "No data found.",
      selectRow: (name) => `Select row ${name}`,
      selectPage: "Select all rows on this page",
      pageSize: "Rows per page",
      page: (p, n) => `Page ${p} of ${n}`,
      showing: (a, b, n) => n ? `Showing ${a}\u2013${b} of ${n}` : "No rows",
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
      ops: { contains: "contains", equals: "is", startsWith: "starts with", endsWith: "ends with", greaterThan: ">", lessThan: "<", between: "between" }
    },
    te: {
      search: "\u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F\u2026",
      searchAria: "\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C32\u0C4B \u0C36\u0C4B\u0C27\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F",
      rows: "\u0C35\u0C30\u0C41\u0C38\u0C32\u0C41",
      selected: "\u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C41\u0C28\u0C4D\u0C28\u0C35\u0C3F",
      loading: "\u0C32\u0C4B\u0C21\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F\u2026",
      noData: "\u0C21\u0C47\u0C1F\u0C3E \u0C15\u0C28\u0C2C\u0C21\u0C32\u0C47\u0C26\u0C41.",
      selectRow: (name) => `\u0C35\u0C30\u0C41\u0C38 ${name} \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F`,
      selectPage: "\u0C08 \u0C2A\u0C47\u0C1C\u0C40\u0C32\u0C4B\u0C28\u0C3F \u0C05\u0C28\u0C4D\u0C28\u0C3F \u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F",
      pageSize: "\u0C2A\u0C47\u0C1C\u0C40 \u0C2A\u0C30\u0C3F\u0C2E\u0C3E\u0C23\u0C02",
      page: (p, n) => `\u0C2A\u0C47\u0C1C\u0C40 ${p} / ${n}`,
      showing: (a, b, n) => n ? `${n} \u0C32\u0C4B ${a}\u2013${b}` : "\u0C35\u0C30\u0C41\u0C38\u0C32\u0C41 \u0C32\u0C47\u0C35\u0C41",
      first: "\u0C2E\u0C4A\u0C26\u0C1F\u0C3F \u0C2A\u0C47\u0C1C\u0C40",
      previous: "\u0C35\u0C46\u0C28\u0C41\u0C15\u0C15\u0C41",
      next: "\u0C2E\u0C41\u0C02\u0C26\u0C41\u0C15\u0C41",
      last: "\u0C1A\u0C3F\u0C35\u0C30\u0C3F \u0C2A\u0C47\u0C1C\u0C40",
      yes: "\u0C05\u0C35\u0C41\u0C28\u0C41",
      no: "\u0C15\u0C3E\u0C26\u0C41",
      sortedAsc: (l) => `${l} \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C06\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02`,
      sortedDesc: (l) => `${l} \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C05\u0C35\u0C30\u0C4B\u0C39\u0C23 \u0C15\u0C4D\u0C30\u0C2E\u0C02`,
      sortCleared: "\u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C30\u0C41",
      filters: (n) => `${n} \u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D(\u0C32\u0C41) \u0C35\u0C47\u0C36\u0C3E\u0C30\u0C41`,
      clearFilters: "\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C02\u0C21\u0C3F",
      removeFilter: (t) => `\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C02\u0C21\u0C3F: ${t}`,
      export: "CSV \u0C21\u0C4C\u0C28\u0C4D\u200C\u0C32\u0C4B\u0C21\u0C4D",
      tableView: "\u0C2A\u0C1F\u0C4D\u0C1F\u0C3F\u0C15",
      cardView: "\u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41\u0C32\u0C41",
      highlighted: "\u0C39\u0C48\u0C32\u0C48\u0C1F\u0C4D",
      results: (n) => `${n} \u0C2B\u0C32\u0C3F\u0C24\u0C3E\u0C32\u0C41`,
      ops: { contains: "\u0C32\u0C4B \u0C09\u0C02\u0C26\u0C3F", equals: "=", startsWith: "\u0C24\u0C4B \u0C2E\u0C4A\u0C26\u0C32\u0C41", endsWith: "\u0C24\u0C4B \u0C2E\u0C41\u0C17\u0C3F\u0C02\u0C2A\u0C41", greaterThan: ">", lessThan: "<", between: "\u0C2E\u0C27\u0C4D\u0C2F" }
    }
  };
  var THEMES = ["default", "high-contrast", "dark", "color-blind", "dyslexia"];
  var norm3 = (v) => String(v == null ? "" : v).normalize("NFC").toLowerCase();
  function normaliseColumns(columns, data) {
    const list = Array.isArray(columns) && columns.length ? columns : data[0] ? Object.keys(data[0]).map((key) => ({ key, label: key })) : [];
    return list.map((c) => ({
      key: String(c.key),
      label: c.label == null ? String(c.key) : String(c.label),
      sortable: c.sortable !== false,
      type: c.type || "text",
      align: c.align || (c.type === "number" ? "right" : "left"),
      render: typeof c.render === "function" ? c.render : null,
      hiddenOnMobile: !!c.hiddenOnMobile,
      width: c.width
    }));
  }
  function renderGrid(container, rowsOrOptions, columnsArg, optionsArg) {
    const target = typeof container === "string" ? document.querySelector(container) : container;
    if (!target || typeof target.appendChild !== "function") throw new Error("renderGrid: container not found. Pass an element or a CSS selector.");
    const opts = Array.isArray(rowsOrOptions) ? { ...optionsArg || {}, data: rowsOrOptions, columns: columnsArg } : { ...rowsOrOptions || {} };
    const locale = opts.locale || "en-IN";
    const lang2 = String(locale).split("-")[0];
    const t = UI[lang2 === "te" ? "te" : "en"];
    const toolLocale = lang2 === "te" ? "te" : "en";
    const numberLocale = lang2 === "en" || lang2 === "te" ? "en-IN" : locale;
    const rowKey = opts.rowKey || "id";
    const label = opts.label || opts.ariaLabel || "Data grid";
    const pagination = opts.pagination === false ? false : typeof opts.pagination === "object" ? opts.pagination : {};
    const sizeOptions = pagination && pagination.sizeOptions || [10, 20, 50, 100];
    const selectable = opts.selectable !== false;
    const autoScroll = opts.autoScrollToHighlight !== false;
    const breakpoint = Number(opts.mobileBreakpoint) || 640;
    let data = Array.isArray(opts.data) ? opts.data.slice() : [];
    let columns = normaliseColumns(opts.columns, data);
    let toolColumns = toGridToolColumns(columns);
    let filters = [];
    let sort = null;
    let query = "";
    let page = 1;
    let pageSize = Number(pagination && pagination.pageSize || opts.pageSize) || 10;
    let theme = THEMES.includes(opts.theme) ? opts.theme : "default";
    let view = ["table", "card", "auto"].includes(opts.view) ? opts.view : "auto";
    let loading = !!opts.loading;
    let narrow = false;
    let active = { r: 1, c: 0 };
    const selected = new Set((opts.selectedKeys || []).map(String));
    const highlights = new Set((opts.highlightIds || []).map(String));
    const ids = { grid: nextId("yv-grid"), title: nextId("yv-title"), status: nextId("yv-status") };
    if (!sizeOptions.includes(pageSize)) sizeOptions.push(pageSize);
    sizeOptions.sort((a, b) => a - b);
    const keyOf = (row) => getRowId(row, rowKey) || String(data.indexOf(row));
    const titleOf = (row) => {
      const first = columns.find((c) => c.type === "text") || columns[0];
      return first ? String(row[first.key] ?? keyOf(row)) : keyOf(row);
    };
    const host = h("section", {
      class: `yv-grid yv-theme-${theme}${opts.wrap ? " yv-wrap" : ""}${opts.className ? " " + opts.className : ""}`,
      role: "region",
      "aria-labelledby": ids.title,
      lang: opts.lang || (lang2 !== "en" ? locale : null)
    });
    if (opts.maxHeight) host.style.setProperty("--yv-max-height", typeof opts.maxHeight === "number" ? `${opts.maxHeight}px` : opts.maxHeight);
    const title = h("h3", { id: ids.title, class: opts.showTitle ? "yv-grid-title" : "yv-sr" }, label);
    if (opts.showTitle) title.style.cssText = "margin:0;padding:12px 12px 0;font-size:1.05em";
    const searchInput = h("input", { type: "search", placeholder: t.search, "aria-label": t.searchAria, "aria-controls": ids.grid, autocomplete: "off", spellcheck: "false" });
    const searchBox = opts.search === false ? null : h("label", { class: "yv-search" }, iconEl("search", 18), searchInput);
    const info = h("span", { class: "yv-info", "aria-hidden": "true" });
    const viewBtn = h("button", { type: "button", class: "yv-btn yv-icon", "data-view-toggle": "" });
    const exportBtn = opts.exportable === false ? null : h("button", { type: "button", class: "yv-btn" }, iconEl("download", 16), t.export);
    const tools = h("div", { class: "yv-tools" }, view === "auto" || opts.viewToggle ? viewBtn : null, exportBtn);
    const toolbar = h("div", { class: "yv-toolbar" }, searchBox, info, tools);
    const filterBar = h("div", { class: "yv-filterbar", hidden: true, "aria-label": t.filters(0) });
    const slot = h("div", { class: "yv-slot" });
    const body = h("div", { class: "yv-body", id: ids.grid });
    const pager = h("div", { class: "yv-pager" });
    const status = h("p", { class: "yv-sr", id: ids.status, role: "status", "aria-live": "polite", "aria-atomic": "true" });
    host.append(title, toolbar, filterBar, slot, body, pager, status);
    target.appendChild(host);
    let statusTimer = null;
    const say = (text) => {
      clearTimeout(statusTimer);
      status.textContent = "";
      statusTimer = setTimeout(() => status.textContent = text, 40);
    };
    function compare2(a, b, column, dir) {
      const av = a[column.key];
      const bv = b[column.key];
      if (av == null || av === "") return bv == null || bv === "" ? 0 : 1;
      if (bv == null || bv === "") return -1;
      let out;
      if (column.type === "number") out = Number(av) - Number(bv);
      else if (column.type === "date") out = new Date(av).getTime() - new Date(bv).getTime();
      else out = String(av).localeCompare(String(bv), locale, { numeric: true, sensitivity: "base" });
      if (!Number.isFinite(out)) out = String(av).localeCompare(String(bv));
      return dir === "desc" ? -out : out;
    }
    function viewRows() {
      let out = applyGridFilters(data, toolColumns, filters);
      if (query) {
        const q = norm3(query);
        out = out.filter((row) => columns.some((c) => norm3(row[c.key]).includes(q) || norm3(formatPlain(c, row[c.key])).includes(q)));
      }
      if (sort && sort.key) {
        const column = columns.find((c) => c.key === sort.key);
        if (column) out = out.slice().sort((a, b) => compare2(a, b, column, sort.direction));
      }
      return out;
    }
    function formatPlain(column, value) {
      if (value == null || value === "") return "";
      if (column.type === "number" && Number.isFinite(Number(value))) return Number(value).toLocaleString(numberLocale);
      if (column.type === "date") {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(numberLocale, { year: "numeric", month: "short", day: "numeric" });
      }
      if (column.type === "boolean") return value === true || value === "true" ? t.yes : t.no;
      return String(value);
    }
    function cellContent(column, row, index) {
      const value = row[column.key];
      if (column.render) {
        try {
          const out = column.render(value, row, index);
          if (out instanceof Node) return out;
          return document.createTextNode(out == null ? "" : String(out));
        } catch (error) {
          console.error("[yuktai] column render failed", column.key, error);
          return document.createTextNode(formatPlain(column, value));
        }
      }
      if (column.type === "badge" && value != null && value !== "") return h("span", { class: "yv-cellbadge" }, String(value));
      return document.createTextNode(formatPlain(column, value));
    }
    const isCards = () => view === "card" || view === "auto" && narrow;
    function pageBounds(total) {
      if (pagination === false) return { pages: 1, start: 0, end: total };
      const pages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.min(Math.max(1, page), pages);
      return { pages, start: (page - 1) * pageSize, end: Math.min(total, page * pageSize) };
    }
    let lastRows = [];
    function render() {
      const rows = viewRows();
      lastRows = rows;
      const { pages, start, end } = pageBounds(rows.length);
      const current = rows.slice(start, end);
      host.className = `yv-grid yv-theme-${theme}${opts.wrap ? " yv-wrap" : ""}${opts.className ? " " + opts.className : ""}`;
      host.setAttribute("aria-busy", String(loading));
      info.textContent = `${rows.length.toLocaleString(numberLocale)} ${t.rows}${selectable ? ` \xB7 ${selected.size.toLocaleString(numberLocale)} ${t.selected}` : ""}`;
      viewBtn.innerHTML = icon(isCards() ? "grid" : "cards", 18);
      viewBtn.setAttribute("aria-label", isCards() ? t.tableView : t.cardView);
      viewBtn.title = isCards() ? t.tableView : t.cardView;
      renderFilterBar();
      const hadFocus = body.contains(document.activeElement);
      body.replaceChildren(loading ? h("div", { class: "yv-loading", role: "status" }, t.loading) : isCards() ? renderCards(current, start) : renderTable(current, start, rows.length));
      if (hadFocus && !loading) restoreFocus();
      renderPager(rows.length, pages, start, end);
    }
    function renderTable(current, start, total) {
      const visibleCols = columns;
      const colCount = visibleCols.length + (selectable ? 1 : 0);
      const table = h("table", {
        class: "yv-table",
        role: "grid",
        "aria-labelledby": ids.title,
        "aria-rowcount": total + 1,
        "aria-colcount": colCount,
        "aria-multiselectable": selectable ? "true" : null
      });
      const headRow = h("tr", { role: "row", "aria-rowindex": 1 });
      if (selectable) {
        const all = current.length > 0 && current.every((r) => selected.has(keyOf(r)));
        const some = current.some((r) => selected.has(keyOf(r)));
        const box = h("input", { type: "checkbox", "data-select-page": "", "aria-label": t.selectPage, tabindex: -1 });
        box.checked = all;
        box.indeterminate = !all && some;
        headRow.append(h("th", { role: "columnheader", scope: "col", "aria-colindex": 1, tabindex: -1, "data-col": 0 }, h("label", { class: "yv-check" }, box)));
      }
      visibleCols.forEach((c, i) => {
        const colIndex = i + (selectable ? 1 : 0);
        const sorted = sort && sort.key === c.key ? sort.direction : null;
        const th = h("th", {
          role: "columnheader",
          scope: "col",
          "aria-colindex": colIndex + 1,
          "aria-sort": c.sortable ? sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none" : null,
          class: c.align !== "left" ? `yv-align-${c.align}` : null,
          tabindex: -1,
          "data-col": colIndex
        });
        if (c.width) th.style.width = typeof c.width === "number" ? `${c.width}px` : c.width;
        if (c.sortable) {
          const btn = h("button", { type: "button", class: "yv-sortbtn", "data-sort": c.key, tabindex: -1 }, c.label);
          btn.insertAdjacentHTML("beforeend", icon(sorted === "asc" ? "sortUp" : sorted === "desc" ? "sortDown" : "sort", 14));
          th.append(btn);
        } else th.append(c.label);
        headRow.append(th);
      });
      const tbody = h("tbody");
      if (!current.length) {
        const empty = opts.empty instanceof Node ? opts.empty.cloneNode(true) : document.createTextNode(opts.empty ? String(opts.empty) : t.noData);
        tbody.append(h("tr", { role: "row", "aria-rowindex": 2 }, h("td", { role: "gridcell", class: "yv-empty", colspan: colCount, tabindex: -1, "data-col": 0 }, empty)));
      }
      current.forEach((row, i) => {
        const key = keyOf(row);
        const isSel = selected.has(key);
        const isHl = highlights.has(key);
        const tr = h("tr", {
          role: "row",
          "aria-rowindex": start + i + 2,
          "aria-selected": selectable ? String(isSel) : null,
          "data-yuktai-row-id": key,
          class: isHl ? "yv-hl" : null
        });
        if (selectable) {
          const box = h("input", { type: "checkbox", "data-select": key, "aria-label": t.selectRow(titleOf(row)), tabindex: -1 });
          box.checked = isSel;
          tr.append(h("td", { role: "gridcell", "aria-colindex": 1, tabindex: -1, "data-col": 0 }, h("label", { class: "yv-check" }, box)));
        }
        visibleCols.forEach((c, ci) => {
          const colIndex = ci + (selectable ? 1 : 0);
          const td = h("td", { role: "gridcell", "aria-colindex": colIndex + 1, tabindex: -1, "data-col": colIndex, class: c.align !== "left" ? `yv-align-${c.align}` : null });
          td.append(cellContent(c, row, start + i));
          if (ci === 0 && isHl) td.append(h("span", { class: "yv-sr" }, ` (${t.highlighted})`));
          tr.append(td);
        });
        tbody.append(tr);
      });
      table.append(h("thead", null, headRow), tbody);
      const rowsInTable = table.querySelectorAll("tr");
      active.r = Math.min(active.r, rowsInTable.length - 1);
      const cell = cellAt(table, active.r, active.c) || cellAt(table, 0, 0);
      if (cell) cell.setAttribute("tabindex", "0");
      return h("div", { class: "yv-tablewrap" }, table);
    }
    function renderCards(current, start) {
      if (!current.length) {
        const empty = opts.empty instanceof Node ? opts.empty.cloneNode(true) : document.createTextNode(opts.empty ? String(opts.empty) : t.noData);
        return h("div", { class: "yv-empty", role: "status" }, empty);
      }
      const list = h("ul", { class: "yv-cards", "aria-labelledby": ids.title });
      current.forEach((row, i) => {
        const key = keyOf(row);
        const isSel = selected.has(key);
        const isHl = highlights.has(key);
        const headingId = nextId("yv-card");
        const card = h("li", {
          class: `yv-card${isHl ? " yv-hl" : ""}`,
          "data-yuktai-row-id": key,
          "aria-labelledby": headingId,
          "aria-selected": selectable ? String(isSel) : null,
          tabindex: -1
        });
        const head = h("div", { class: "yv-card-head" }, h("p", { class: "yv-card-title", id: headingId }, titleOf(row), isHl ? h("span", { class: "yv-sr" }, ` (${t.highlighted})`) : null));
        if (selectable) {
          const box = h("input", { type: "checkbox", "data-select": key, "aria-label": t.selectRow(titleOf(row)) });
          box.checked = isSel;
          head.append(h("label", { class: "yv-check" }, box));
        }
        const dl = h("dl");
        columns.forEach((c) => {
          if (c.hiddenOnMobile) return;
          dl.append(h("dt", null, c.label), h("dd", null, cellContent(c, row, start + i)));
        });
        card.append(head, dl);
        if (typeof opts.onRowClick === "function") {
          card.append(h("button", { type: "button", class: "yv-btn yv-small", "data-open": key, style: "margin-top:8px" }, opts.openLabel || (lang2 === "te" ? "\u0C24\u0C46\u0C30\u0C41\u0C35\u0C41" : "Open")));
        }
        list.append(card);
      });
      return list;
    }
    function renderFilterBar() {
      filterBar.replaceChildren();
      if (!filters.length) {
        filterBar.hidden = true;
        return;
      }
      filterBar.hidden = false;
      filterBar.setAttribute("aria-label", t.filters(filters.length));
      filterBar.append(h("span", { class: "yv-muted" }, iconEl("filter", 15), " ", t.filters(filters.length)));
      filters.forEach((f, i) => {
        const column = columns.find((c) => c.key === f.key);
        const value = Array.isArray(f.value) ? f.value.map((v) => formatPlain(column || {}, v)).join(" \u2013 ") : column ? formatPlain(column, f.value) : String(f.value);
        const text = `${column ? column.label : f.key} ${t.ops[f.operator] || f.operator} ${value}`;
        const chip = h("button", { type: "button", class: "yv-chip", "data-remove-filter": i, "aria-label": t.removeFilter(text) }, text, iconEl("close", 14));
        filterBar.append(chip);
      });
      filterBar.append(h("button", { type: "button", class: "yv-btn yv-small", "data-clear-filters": "" }, t.clearFilters));
    }
    function renderPager(total, pages, start, end) {
      pager.replaceChildren();
      if (pagination === false) {
        pager.append(h("span", { class: "yv-muted" }, t.results(total.toLocaleString(numberLocale))));
        return;
      }
      const fmt2 = (n) => n.toLocaleString(numberLocale);
      const left = h("span", { class: "yv-muted" }, total ? t.showing(fmt2(start + 1), fmt2(end), fmt2(total)) : t.showing(0, 0, 0));
      const controls = h("div", { class: "yv-pages" });
      if (pagination.showSizeChanger !== false) {
        const selectId = nextId("yv-size");
        const select = h("select", { id: selectId, "data-page-size": "" }, ...sizeOptions.map((n) => h("option", { value: n, selected: n === pageSize }, String(n))));
        controls.append(h("label", { for: selectId, class: "yv-muted" }, t.pageSize), select);
      }
      const nav = (name, labelText, disabled, action) => {
        const b = h("button", { type: "button", class: "yv-btn yv-icon", "aria-label": labelText, title: labelText, disabled, "data-page": action });
        b.innerHTML = icon(name, 18);
        return b;
      };
      controls.append(
        nav("first", t.first, page <= 1, "first"),
        nav("left", t.previous, page <= 1, "prev"),
        h("span", { class: "yv-muted", "aria-current": "page" }, t.page(fmt2(page), fmt2(pages))),
        nav("right", t.next, page >= pages, "next"),
        nav("last", t.last, page >= pages, "last")
      );
      pager.append(left, controls);
    }
    function cellAt(table, r, c) {
      const row = table.querySelectorAll("tr")[r];
      if (!row) return null;
      const cells = row.querySelectorAll("th,td");
      return cells[Math.min(c, cells.length - 1)] || null;
    }
    function focusCell(r, c) {
      const table = body.querySelector("table");
      if (!table) return;
      const rows = table.querySelectorAll("tr");
      r = Math.max(0, Math.min(r, rows.length - 1));
      const cells = rows[r].querySelectorAll("th,td");
      c = Math.max(0, Math.min(c, cells.length - 1));
      table.querySelectorAll('[tabindex="0"]').forEach((el) => el.setAttribute("tabindex", "-1"));
      const cell = cells[c];
      cell.setAttribute("tabindex", "0");
      active = { r, c };
      cell.focus();
    }
    function restoreFocus() {
      const table = body.querySelector("table");
      if (table) focusCell(active.r, active.c);
      else {
        const first = body.querySelector(".yv-card");
        if (first) first.focus();
      }
    }
    function onGridKey(e) {
      const table = body.querySelector("table");
      const cell = e.target.closest && e.target.closest("th,td");
      if (!table || !cell || !table.contains(cell)) return;
      const row = cell.parentElement;
      const r = Array.prototype.indexOf.call(table.querySelectorAll("tr"), row);
      const c = Array.prototype.indexOf.call(row.querySelectorAll("th,td"), cell);
      const lastRow = table.querySelectorAll("tr").length - 1;
      let handled = true;
      switch (e.key) {
        case "ArrowRight":
          focusCell(r, c + 1);
          break;
        case "ArrowLeft":
          focusCell(r, c - 1);
          break;
        case "ArrowDown":
          focusCell(r + 1, c);
          break;
        case "ArrowUp":
          focusCell(r - 1, c);
          break;
        case "Home":
          e.ctrlKey ? focusCell(0, 0) : focusCell(r, 0);
          break;
        case "End":
          e.ctrlKey ? focusCell(lastRow, 999) : focusCell(r, 999);
          break;
        case "PageDown":
          if (pagination !== false) {
            active = { r: Math.max(1, r), c };
            goTo(page + 1, true);
          }
          break;
        case "PageUp":
          if (pagination !== false) {
            active = { r: Math.max(1, r), c };
            goTo(page - 1, true);
          }
          break;
        case "Enter":
        case " ": {
          const sortBtn = cell.querySelector("[data-sort]");
          const box = cell.querySelector("input[type=checkbox]");
          if (sortBtn) toggleSort(sortBtn.getAttribute("data-sort"));
          else if (box) box.click();
          else if (e.key === "Enter" && row.hasAttribute("data-yuktai-row-id") && typeof opts.onRowClick === "function") openRowByKey(row.getAttribute("data-yuktai-row-id"));
          else if (e.key === " " && selectable && row.hasAttribute("data-yuktai-row-id")) toggleSelect(row.getAttribute("data-yuktai-row-id"));
          else handled = false;
          break;
        }
        default:
          handled = false;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    function toggleSort(key) {
      const column = columns.find((c) => c.key === key);
      if (!column || !column.sortable) return;
      if (!sort || sort.key !== key) sort = { key, direction: "asc" };
      else if (sort.direction === "asc") sort = { key, direction: "desc" };
      else sort = null;
      page = 1;
      const table = body.querySelector("table");
      if (table && body.contains(document.activeElement)) active = { r: 0, c: active.c };
      render();
      say(sort ? sort.direction === "asc" ? t.sortedAsc(column.label) : t.sortedDesc(column.label) : t.sortCleared);
      opts.onSortChange && opts.onSortChange(sort ? { key: sort.key, direction: sort.direction } : null);
    }
    function emitSelection() {
      opts.onSelectionChange && opts.onSelectionChange(Array.from(selected));
      host.dispatchEvent(new CustomEvent("yuktai:selection", { detail: { keys: Array.from(selected) }, bubbles: true }));
    }
    function toggleSelect(key, force) {
      const on = force === void 0 ? !selected.has(key) : force;
      on ? selected.add(key) : selected.delete(key);
      render();
      emitSelection();
    }
    function goTo(n, keepFocus) {
      const { pages } = pageBounds(lastRows.length);
      const next = Math.min(Math.max(1, n), pages);
      if (next === page && !keepFocus) return;
      page = next;
      render();
      say(t.page(page, pages));
      if (keepFocus && body.querySelector("table")) restoreFocus();
    }
    function openRowByKey(key) {
      const row = data.find((r) => keyOf(r) === String(key));
      if (!row) return false;
      if (typeof opts.onRowClick === "function") opts.onRowClick(row, data.indexOf(row));
      if (typeof opts.onOpenRow === "function") opts.onOpenRow(String(key));
      return true;
    }
    function setHighlights(list, scroll = autoScroll) {
      highlights.clear();
      (list || []).forEach((item) => highlights.add(typeof item === "object" && item !== null ? keyOf(item) : String(item)));
      if (scroll && highlights.size) {
        const index = lastRows.length ? lastRows.findIndex((r) => highlights.has(keyOf(r))) : viewRows().findIndex((r) => highlights.has(keyOf(r)));
        if (index >= 0 && pagination !== false) page = Math.floor(index / pageSize) + 1;
      }
      render();
      if (scroll && highlights.size) {
        const first = body.querySelector(".yv-hl");
        if (first && first.scrollIntoView) first.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    }
    let searchTimer = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        query = searchInput.value.trim();
        page = 1;
        render();
        say(t.results(lastRows.length.toLocaleString(numberLocale)));
      }, 160);
    });
    host.addEventListener("click", (e) => {
      const el = e.target.closest("button, input, tr[data-yuktai-row-id]");
      if (!el || !host.contains(el)) return;
      if (el.matches("[data-sort]")) return toggleSort(el.getAttribute("data-sort"));
      if (el.matches("[data-page]")) {
        const action = el.getAttribute("data-page");
        const { pages } = pageBounds(lastRows.length);
        return goTo(action === "first" ? 1 : action === "prev" ? page - 1 : action === "next" ? page + 1 : pages);
      }
      if (el.matches("[data-remove-filter]")) {
        filters = filters.filter((_, i) => i !== Number(el.getAttribute("data-remove-filter")));
        page = 1;
        render();
        opts.onFiltersChange && opts.onFiltersChange(filters.slice());
        return;
      }
      if (el.matches("[data-clear-filters]")) return api.clearFilters();
      if (el.matches("[data-open]")) return openRowByKey(el.getAttribute("data-open"));
      if (el === viewBtn) {
        view = isCards() ? "table" : "card";
        render();
        return;
      }
      if (el === exportBtn) return api.exportCSV();
      if (el.matches("tr[data-yuktai-row-id]") && typeof opts.onRowClick === "function" && !e.target.closest("label,input,button,a")) {
        openRowByKey(el.getAttribute("data-yuktai-row-id"));
      }
    });
    host.addEventListener("change", (e) => {
      const el = e.target;
      if (el.matches("[data-select]")) {
        el.checked ? selected.add(el.getAttribute("data-select")) : selected.delete(el.getAttribute("data-select"));
        render();
        emitSelection();
      } else if (el.matches("[data-select-page]")) {
        const { start, end } = pageBounds(lastRows.length);
        lastRows.slice(start, end).forEach((r) => el.checked ? selected.add(keyOf(r)) : selected.delete(keyOf(r)));
        render();
        emitSelection();
      } else if (el.matches("[data-page-size]")) {
        pageSize = Number(el.value) || pageSize;
        page = 1;
        render();
        body.closest(".yv-grid").querySelector("[data-page-size]").focus();
      }
    });
    body.addEventListener("keydown", onGridKey);
    body.addEventListener("focusin", (e) => {
      const table = body.querySelector("table");
      const cell = e.target.closest && e.target.closest("th,td");
      if (!table || !cell) return;
      const row = cell.parentElement;
      const r = Array.prototype.indexOf.call(table.querySelectorAll("tr"), row);
      const c = Array.prototype.indexOf.call(row.querySelectorAll("th,td"), cell);
      if (r < 0 || c < 0) return;
      table.querySelectorAll('[tabindex="0"]').forEach((el) => el !== cell && el.setAttribute("tabindex", "-1"));
      cell.setAttribute("tabindex", "0");
      active = { r, c };
    });
    let resizeObserver = null;
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0] && entries[0].contentRect.width;
        const next = width > 0 && width < breakpoint;
        if (next !== narrow) {
          narrow = next;
          if (view === "auto") render();
        }
      });
      resizeObserver.observe(host);
    }
    const toolContext = {
      get data() {
        return data;
      },
      get columns() {
        return toolColumns;
      },
      rowKey,
      locale: toolLocale,
      get filters() {
        return filters;
      },
      onHighlightRows: (list) => setHighlights(list),
      onSelectRow: (id) => {
        selected.add(String(id));
        setHighlights([String(id)]);
        emitSelection();
      },
      onOpenRow: typeof opts.onRowClick === "function" || typeof opts.onOpenRow === "function" ? (id) => openRowByKey(id) : void 0,
      onFiltersChange: (next) => {
        filters = next.slice();
        page = 1;
        render();
        opts.onFiltersChange && opts.onFiltersChange(filters.slice());
      },
      onSortChange: (next) => {
        sort = next ? { key: next.key, direction: next.direction === "desc" ? "desc" : "asc" } : null;
        page = 1;
        render();
        opts.onSortChange && opts.onSortChange(sort);
      }
    };
    let toolList = createGridTools(toolContext, { name: opts.toolName || "yuktai_grid", descriptions: opts.toolDescriptions });
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
        if (opts.onAgentResult) opts.onAgentResult({ success: r.success, message: r.message, tool: r.tool });
      },
      onError: opts.onAgentError
    });
    let webmcp = { status: { state: "unsupported", registered: [], errors: [] }, unregister() {
    } };
    if (opts.webmcp) {
      webmcp = registerWebMCP(() => toolList, {
        onStatusChange: (s) => {
          opts.onWebMCPStatusChange && opts.onWebMCPStatusChange(s);
          host.dispatchEvent(new CustomEvent("yuktai:webmcp", { detail: s, bubbles: true }));
        }
      });
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
        selectRow: (id) => toolContext.onSelectRow(id)
      }
    });
    let assistant = null;
    if (opts.ai) {
      assistant = mountGridAssistant(slot, agent, {
        locale: toolLocale,
        inputLanguage: opts.inputLanguage || (toolLocale === "te" ? "te-IN" : "en-IN"),
        examples: opts.assistantExamples,
        webmcp: () => webmcp.status,
        showWebMCP: !!opts.webmcp
      });
      if (opts.webmcp) host.addEventListener("yuktai:webmcp", () => assistant && assistant.refreshStatus());
    }
    let bar = null;
    if (opts.agentic) {
      const barOpts = typeof opts.agentic === "object" ? opts.agentic : {};
      bar = mountAgenticGridBar(slot, agentic, barOpts);
    }
    const api = {
      element: host,
      host,
      /** Tools shared by the assistant and WebMCP (createGridTools). */
      get tools() {
        return toolList;
      },
      agent,
      agentic,
      get webmcpStatus() {
        return webmcp.status;
      },
      // data
      refresh(nextRows) {
        if (Array.isArray(nextRows)) {
          data = nextRows.slice();
          selected.clear();
          highlights.clear();
          page = 1;
        }
        render();
        return api;
      },
      setData(nextRows, nextColumns) {
        if (Array.isArray(nextColumns)) {
          columns = normaliseColumns(nextColumns, nextRows || data);
          toolColumns = toGridToolColumns(columns);
          toolList = createGridTools(toolContext, { name: opts.toolName || "yuktai_grid", descriptions: opts.toolDescriptions });
        }
        return api.refresh(nextRows);
      },
      getData: () => data.slice(),
      getRows: () => viewRows(),
      getPageRows() {
        const rows = viewRows();
        const { start, end } = pageBounds(rows.length);
        return rows.slice(start, end);
      },
      // selection
      getSelectedRows: () => data.filter((r) => selected.has(keyOf(r))),
      getSelectedKeys: () => Array.from(selected),
      select(keys, on = true) {
        ;
        [].concat(keys).forEach((k) => on ? selected.add(String(k)) : selected.delete(String(k)));
        render();
        emitSelection();
        return api;
      },
      clearSelection() {
        selected.clear();
        render();
        emitSelection();
        return api;
      },
      // search, filter, sort
      search(text) {
        query = String(text || "").trim();
        searchInput.value = query;
        page = 1;
        render();
        return lastRows.length;
      },
      setFilters(next) {
        toolContext.onFiltersChange(Array.isArray(next) ? next : []);
        return api;
      },
      addFilter(filter) {
        return agent.executeTool("filter", filter);
      },
      getFilters: () => filters.slice(),
      clearFilters() {
        toolContext.onFiltersChange([]);
        say(lang2 === "te" ? "\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C36\u0C3E\u0C30\u0C41" : "Filters cleared");
        return api;
      },
      sortBy(key, direction = "asc") {
        toolContext.onSortChange(key ? { key, direction } : null);
        return api;
      },
      clearSort() {
        toolContext.onSortChange(null);
        return api;
      },
      getSort: () => sort ? { ...sort } : null,
      // highlight
      highlight(list, scroll) {
        setHighlights(list, scroll === void 0 ? autoScroll : scroll);
        return api;
      },
      clearHighlight() {
        setHighlights([], false);
        return api;
      },
      getHighlightIds: () => Array.from(highlights),
      // pages and view
      goToPage(n) {
        goTo(Number(n) || 1);
        return api;
      },
      nextPage() {
        goTo(page + 1);
        return api;
      },
      prevPage() {
        goTo(page - 1);
        return api;
      },
      getPage: () => ({ page, pageSize, pages: pageBounds(lastRows.length).pages, total: lastRows.length }),
      setPageSize(n) {
        pageSize = Number(n) || pageSize;
        if (!sizeOptions.includes(pageSize)) sizeOptions.push(pageSize), sizeOptions.sort((a, b) => a - b);
        page = 1;
        render();
        return api;
      },
      setTheme(next) {
        theme = THEMES.includes(next) ? next : "default";
        render();
        return api;
      },
      getTheme: () => theme,
      setView(next) {
        view = ["table", "card", "auto"].includes(next) ? next : "auto";
        render();
        return api;
      },
      setLoading(on) {
        loading = !!on;
        render();
        return api;
      },
      openRow: (key) => openRowByKey(key),
      // agents
      /** Smart question: grid query, BI insight or multi-step task (useAgenticGrid). */
      async ask(question) {
        const s = await agentic.ask(question);
        return s.answer;
      },
      /** Same, but returns the full state: { answer, kind, table, steps, ... } */
      askDetailed: (question) => agentic.ask(question),
      /** Built-in assistant pipeline: custom rules → phrase parser → tool. */
      assistantAsk: (text) => agent.ask(text),
      executeTool: (name, input) => agent.executeTool(name, input),
      biSummary: () => summarizeRows(viewRows(), toolColumns),
      anomalies: () => detectAnomalies(viewRows(), toolColumns, { rowKey }),
      async runTasks(text) {
        const s = await agentic.ask(text);
        return s.answer;
      },
      reset() {
        agentic.reset();
        query = "";
        searchInput.value = "";
        render();
        return api;
      },
      exportCSV(filename = opts.exportFileName || "yuktai-grid-export.csv") {
        const rows = selected.size ? data.filter((r) => selected.has(keyOf(r))) : viewRows();
        const csv = "\uFEFF" + [columns.map((c) => csvCell(c.label)).join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(","))].join("\r\n");
        downloadText(filename, csv, "text/csv;charset=utf-8");
        announce2(`${rows.length} row(s) exported`);
        return rows.length;
      },
      destroy() {
        clearTimeout(searchTimer);
        clearTimeout(statusTimer);
        resizeObserver && resizeObserver.disconnect();
        webmcp.unregister();
        assistant && assistant.destroy();
        bar && bar.destroy();
        host.remove();
      }
    };
    if (typeof opts.onReady === "function") opts.onReady(api);
    render();
    return api;
  }
  var ASSISTANT_TEXT = {
    en: {
      title: "Ask the grid",
      hint: "Type or speak: a word to search, \u201Csort by <column>\u201D, \u201Chow many\u201D, \u201Cclear filters\u201D, \u201Copen <name>\u201D.",
      placeholder: "Ask the grid\u2026",
      ask: "Ask",
      listen: "Speak",
      stop: "Stop",
      listening: "Listening\u2026",
      noVoice: "Voice input is not available in this browser. Type your question instead.",
      history: "History",
      clear: "Clear history",
      webmcp: { unsupported: "WebMCP: not available in this browser (no document.modelContext).", registering: "WebMCP: registering tools\u2026", ready: "WebMCP: tools ready", partial: "WebMCP: some tools failed", error: "WebMCP: registration failed" }
    },
    te: {
      title: "\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C28\u0C41 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F",
      hint: "\u0C1F\u0C48\u0C2A\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C2E\u0C3E\u0C1F\u0C4D\u0C32\u0C3E\u0C21\u0C02\u0C21\u0C3F: \u0C35\u0C46\u0C24\u0C15\u0C3E\u0C32\u0C4D\u0C38\u0C3F\u0C28 \u0C2A\u0C26\u0C02, \u201C<\u0C15\u0C3E\u0C32\u0C2E\u0C4D> \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C15\u0C4D\u0C30\u0C2E\u0C02\u201D, \u201C\u0C0E\u0C28\u0C4D\u0C28\u0C3F\u201D, \u201C\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F\u201D.",
      placeholder: "\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D\u200C\u0C28\u0C41 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F\u2026",
      ask: "\u0C05\u0C21\u0C41\u0C17\u0C41",
      listen: "\u0C2E\u0C3E\u0C1F\u0C4D\u0C32\u0C3E\u0C21\u0C41",
      stop: "\u0C06\u0C2A\u0C41",
      listening: "\u0C35\u0C3F\u0C02\u0C1F\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41\u2026",
      noVoice: "\u0C08 \u0C2C\u0C4D\u0C30\u0C4C\u0C1C\u0C30\u0C4D\u200C\u0C32\u0C4B \u0C35\u0C3E\u0C2F\u0C3F\u0C38\u0C4D \u0C07\u0C28\u0C4D\u200C\u0C2A\u0C41\u0C1F\u0C4D \u0C32\u0C47\u0C26\u0C41. \u0C1F\u0C48\u0C2A\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F.",
      history: "\u0C1A\u0C30\u0C3F\u0C24\u0C4D\u0C30",
      clear: "\u0C1A\u0C30\u0C3F\u0C24\u0C4D\u0C30 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F",
      webmcp: { unsupported: "WebMCP: \u0C08 \u0C2C\u0C4D\u0C30\u0C4C\u0C1C\u0C30\u0C4D\u200C\u0C32\u0C4B \u0C32\u0C47\u0C26\u0C41.", registering: "WebMCP: \u0C28\u0C2E\u0C4B\u0C26\u0C41 \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C4B\u0C02\u0C26\u0C3F\u2026", ready: "WebMCP: \u0C38\u0C3F\u0C26\u0C4D\u0C27\u0C02", partial: "WebMCP: \u0C15\u0C4A\u0C28\u0C4D\u0C28\u0C3F \u0C35\u0C3F\u0C2B\u0C32\u0C02", error: "WebMCP: \u0C35\u0C3F\u0C2B\u0C32\u0C02" }
    }
  };
  function mountGridAssistant(container, agent, options = {}) {
    const t = ASSISTANT_TEXT[options.locale === "te" ? "te" : "en"];
    const inputId = nextId("yv-ask");
    const hintId = nextId("yv-hint");
    const input = h("input", { id: inputId, class: "yv-input", type: "text", placeholder: t.placeholder, autocomplete: "off", "aria-describedby": hintId });
    const askBtn = h("button", { type: "submit", class: "yv-btn yv-primary" }, iconEl("spark", 16), t.ask);
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const micBtn = h("button", { type: "button", class: "yv-btn", "aria-pressed": "false" }, iconEl("mic", 16), t.listen);
    const answer = h("div", { class: "yv-answer", role: "status", "aria-live": "polite" });
    const historyList = h("ol");
    const historyBox = h("details", { class: "yv-history" }, h("summary", null, t.history), historyList, h("button", { type: "button", class: "yv-btn yv-small", "data-clear-history": "" }, t.clear));
    const webmcpLine = options.showWebMCP ? h("p", { class: "yv-muted", style: "margin:8px 0 0" }) : null;
    const examples = options.examples || (options.locale === "te" ? ["\u0C0E\u0C28\u0C4D\u0C28\u0C3F", "\u0C2B\u0C3F\u0C32\u0C4D\u0C1F\u0C30\u0C4D\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C47\u0C2F\u0C3F"] : ["how many", "clear filters", "clear sort"]);
    const chips = h("div", { class: "yv-chips" }, ...examples.map((x) => h("button", { type: "button", class: "yv-chip", "data-example": x }, x)));
    const form = h("form", { class: "yv-row", role: "search", "aria-label": t.title }, h("label", { for: inputId, class: "yv-sr" }, t.title), input, askBtn, micBtn);
    const box = h("section", { class: "yv-box yv-assistant", "aria-label": t.title }, h("h3", null, iconEl("chat", 16), " ", t.title), h("p", { id: hintId, class: "yv-muted", style: "margin:0 0 8px" }, t.hint), form, chips, answer, historyBox, webmcpLine);
    container.appendChild(box);
    async function run(text) {
      const q = String(text || "").trim();
      if (!q) return;
      askBtn.disabled = true;
      try {
        const result = await agent.ask(q);
        answer.textContent = result.message;
        answer.className = `yv-answer ${result.success ? "" : "yv-fail"}`;
      } finally {
        askBtn.disabled = false;
      }
    }
    const unsubscribe = agent.subscribe((state) => {
      historyList.replaceChildren(
        ...state.history.slice().reverse().map((step) => h("li", null, h("span", { class: step.result.success ? "yv-ok" : "yv-fail" }, step.result.success ? "\u2713 " : "\u2717 "), step.result.message, h("span", { class: "yv-muted" }, ` (${step.tool})`)))
      );
      historyBox.querySelector("summary").textContent = `${t.history} (${state.history.length})`;
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      run(input.value);
    });
    box.addEventListener("click", (e) => {
      const el = e.target.closest("[data-example],[data-clear-history]");
      if (!el) return;
      if (el.hasAttribute("data-example")) {
        input.value = el.getAttribute("data-example");
        run(input.value);
      } else {
        agent.clearHistory();
        answer.textContent = "";
      }
    });
    let recognition2 = null;
    micBtn.addEventListener("click", () => {
      if (!SR) {
        answer.textContent = t.noVoice;
        return;
      }
      if (recognition2) {
        recognition2.stop();
        return;
      }
      recognition2 = new SR();
      recognition2.lang = options.inputLanguage || "en-IN";
      recognition2.interimResults = false;
      recognition2.maxAlternatives = 1;
      micBtn.setAttribute("aria-pressed", "true");
      micBtn.lastChild.textContent = t.stop;
      answer.textContent = t.listening;
      recognition2.onresult = (e) => {
        const phrase = e.results[0][0].transcript;
        input.value = phrase;
        run(phrase);
      };
      recognition2.onerror = (e) => {
        answer.textContent = `${t.noVoice} (${e.error})`;
      };
      recognition2.onend = () => {
        recognition2 = null;
        micBtn.setAttribute("aria-pressed", "false");
        micBtn.lastChild.textContent = t.listen;
      };
      try {
        recognition2.start();
      } catch (error) {
        answer.textContent = `${t.noVoice} (${error.message})`;
        recognition2 = null;
      }
    });
    if (!SR) micBtn.title = t.noVoice;
    function refreshStatus() {
      if (!webmcpLine || !options.webmcp) return;
      const s = options.webmcp();
      webmcpLine.textContent = t.webmcp[s.state] + (s.registered && s.registered.length ? ` (${s.registered.length})` : "");
    }
    refreshStatus();
    return {
      element: box,
      ask: run,
      refreshStatus,
      destroy() {
        unsubscribe();
        recognition2 && recognition2.stop();
        box.remove();
      }
    };
  }

  // vanilla/src/panel.js
  var TABS = [
    { id: "copilot", label: "Copilot", icon: "wand" },
    { id: "qa", label: "QA report", icon: "check" },
    { id: "forms", label: "Forms", icon: "form" },
    { id: "design", label: "Design", icon: "layout" },
    { id: "ask", label: "Ask page", icon: "chat" },
    { id: "voice", label: "Voice", icon: "mic" }
  ];
  var VOICE_LANGS = [
    ["en-IN", "English (India)"],
    ["en-US", "English (US)"],
    ["te-IN", "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 (Telugu)"],
    ["hi-IN", "\u0939\u093F\u0928\u094D\u0926\u0940 (Hindi)"],
    ["ta-IN", "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD (Tamil)"],
    ["kn-IN", "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1 (Kannada)"],
    ["ml-IN", "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02 (Malayalam)"],
    ["mr-IN", "\u092E\u0930\u093E\u0920\u0940 (Marathi)"],
    ["bn-IN", "\u09AC\u09BE\u0982\u09B2\u09BE (Bengali)"],
    ["gu-IN", "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0 (Gujarati)"]
  ];
  var sevBadge = (sev) => h("span", { class: `yv-badge yv-sev-${sev}` }, sev);
  function scoreBlock(score, text) {
    return h(
      "div",
      null,
      h("div", { class: "yv-score" }, h("strong", null, String(score)), h("span", { class: "yv-muted" }, "/ 100")),
      h("div", { class: "yv-meter", role: "img", "aria-label": `Score ${score} out of 100` }, h("span", { style: `width:${Math.max(0, Math.min(100, score))}%` })),
      h("p", { style: "margin:0 0 6px" }, text)
    );
  }
  function showButton(selectors) {
    const list = (selectors || []).filter(Boolean);
    if (!list.length) return null;
    return h("button", { type: "button", class: "yv-btn yv-small", onclick: () => announce2(`${flashElements(list)} element(s) outlined on the page`) }, iconEl("eye", 14), "Show on page");
  }
  function mountAgenticPanel(container, options = {}) {
    const target = container == null ? null : typeof container === "string" ? document.querySelector(container) : container;
    if (container != null && !target) throw new Error("mountAgenticPanel: container not found");
    const tablistId = nextId("yv-tabs");
    const root = h("section", { class: `yv-box yv-agentic-panel${options.theme ? " yv-theme-" + options.theme : ""}`, "data-yuktai-panel": "", "aria-label": options.title || "Page tools" });
    const tablist = h("div", { class: "yv-tabs", role: "tablist", "aria-label": "Page tools", id: tablistId });
    const panels = {};
    TABS.forEach((tab) => {
      const tabId = `${tablistId}-${tab.id}`;
      const panelId = `${tabId}-panel`;
      tablist.append(h("button", { type: "button", class: "yv-tab", role: "tab", id: tabId, "aria-controls": panelId, "aria-selected": "false", tabindex: -1, "data-tab": tab.id }, iconEl(tab.icon, 15), " ", tab.label));
      panels[tab.id] = h("div", { role: "tabpanel", id: panelId, "aria-labelledby": tabId, hidden: true, tabindex: 0 });
    });
    root.append(tablist, ...Object.values(panels));
    if (target) target.appendChild(root);
    const built = {};
    let current = null;
    function select(id, focus) {
      if (!panels[id]) id = "qa";
      current = id;
      tablist.querySelectorAll("[role=tab]").forEach((tab) => {
        const on = tab.getAttribute("data-tab") === id;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      Object.entries(panels).forEach(([key, panel]) => panel.hidden = key !== id);
      if (!built[id]) {
        built[id] = true;
        BUILDERS[id](panels[id]);
      }
    }
    tablist.addEventListener("click", (e) => {
      const tab = e.target.closest("[role=tab]");
      if (tab) select(tab.getAttribute("data-tab"), true);
    });
    tablist.addEventListener("keydown", (e) => {
      const ids = TABS.map((t) => t.id);
      const focused = e.target.closest && e.target.closest("[role=tab]");
      const i = ids.indexOf(focused ? focused.getAttribute("data-tab") : current);
      let next = null;
      if (e.key === "ArrowRight") next = ids[(i + 1) % ids.length];
      else if (e.key === "ArrowLeft") next = ids[(i - 1 + ids.length) % ids.length];
      else if (e.key === "Home") next = ids[0];
      else if (e.key === "End") next = ids[ids.length - 1];
      if (next) {
        e.preventDefault();
        e.stopPropagation();
        select(next, true);
      }
    });
    let copilot = null;
    function buildCopilot(panel) {
      const list = h("ul", { class: "yv-list" });
      const statusLine = h("p", { class: "yv-status", role: "status", "aria-live": "polite" });
      const explainBox = h("div", { class: "yv-answer", "aria-live": "polite" });
      const watchBtn = h("button", { type: "button", class: "yv-btn", "aria-pressed": "false" }, iconEl("eye", 16), "Watch page");
      copilot = createA11yCopilot({
        defaultLang: options.defaultLang,
        debounceMs: 600,
        onUpdate: (state) => paint(state)
      });
      function paint(state) {
        const report = state.report;
        watchBtn.setAttribute("aria-pressed", String(state.watching));
        statusLine.textContent = report ? `${report.summary} Fixes applied: ${state.appliedFixes}.${state.watching ? " Watching for page changes." : ""}` : "Scan the page to see issues.";
        list.replaceChildren(
          ...(report ? report.issues.slice(0, 40) : []).map(
            (issue) => h(
              "li",
              { class: "yv-item" },
              h("p", null, sevBadge(issue.severity), " ", h("b", null, issue.message)),
              h("p", { class: "yv-muted" }, `WCAG ${issue.wcag} \xB7 `, h("code", null, issue.selector)),
              h(
                "div",
                { class: "yv-row" },
                h("button", { type: "button", class: "yv-btn yv-small", onclick: () => explainBox.textContent = copilot.explain(issue.id) }, iconEl("info", 14), "Explain"),
                issue.autoFixable ? h("button", { type: "button", class: "yv-btn yv-small", onclick: () => announce2(copilot.applyFix(issue.id).message) }, iconEl("wand", 14), "Fix") : null,
                showButton([issue.selector])
              )
            )
          )
        );
      }
      panel.append(
        h("p", { class: "yv-muted" }, "Finds accessibility problems, explains them in plain English, and applies safe fixes you can undo."),
        h(
          "div",
          { class: "yv-row" },
          h("button", { type: "button", class: "yv-btn yv-primary", onclick: () => copilot.scan() }, iconEl("search", 16), "Scan page"),
          watchBtn,
          h("button", { type: "button", class: "yv-btn", onclick: () => announce2(`${copilot.applyAllFixes().filter((r) => r.applied).length} fix(es) applied`) }, iconEl("wand", 16), "Apply all safe fixes"),
          h("button", { type: "button", class: "yv-btn", onclick: () => announce2(`${copilot.undoAll()} change(s) undone`) }, iconEl("undo", 16), "Undo all")
        ),
        statusLine,
        explainBox,
        list
      );
      watchBtn.addEventListener("click", () => copilot.getState().watching ? copilot.stop() : copilot.start());
      paint(copilot.getState());
    }
    function buildQa(panel) {
      const out = h("div", { "aria-live": "polite" });
      let report = null;
      const run = () => {
        report = runQaAudit(options.auditOptions || {});
        const issues = report.issues;
        out.replaceChildren(
          scoreBlock(report.score, report.summary),
          h(
            "div",
            { class: "yv-row" },
            h("button", { type: "button", class: "yv-btn yv-small", onclick: async () => announce2(await copyText(auditToMarkdown(report)) ? "Markdown report copied" : "Copy failed") }, iconEl("copy", 14), "Copy Markdown"),
            h("button", { type: "button", class: "yv-btn yv-small", onclick: () => downloadText("yuktai-qa-report.md", auditToMarkdown(report), "text/markdown;charset=utf-8") }, iconEl("download", 14), "Markdown"),
            h("button", { type: "button", class: "yv-btn yv-small", onclick: () => downloadText("yuktai-qa-report.json", auditToJSON(report), "application/json") }, iconEl("download", 14), "JSON")
          ),
          h(
            "details",
            { class: "yv-history" },
            h("summary", null, `Checks (${report.checks.filter((c) => c.passed).length}/${report.checks.length} passed)`),
            h("ul", { class: "yv-steps" }, ...report.checks.map((c) => h("li", null, h("span", { class: c.passed ? "yv-ok" : "yv-fail" }, c.passed ? "\u2713 " : "\u2717 "), c.title || c.rule, c.issueCount ? ` \u2014 ${c.issueCount} issue(s)` : "")))
          ),
          h(
            "ul",
            { class: "yv-list" },
            ...issues.slice(0, 60).map(
              (issue) => h(
                "li",
                { class: "yv-item" },
                h("p", null, sevBadge(issue.severity), " ", h("b", null, issue.message)),
                h("p", null, h("b", null, "Fix: "), issue.fix),
                h("p", { class: "yv-muted" }, `${issue.rule} \xB7 WCAG ${issue.wcag} \xB7 `, h("code", null, issue.selector)),
                showButton([issue.selector])
              )
            )
          ),
          issues.length > 60 ? h("p", { class: "yv-muted" }, `${issues.length - 60} more issue(s) in the downloaded report.`) : null
        );
        announce2(report.summary);
      };
      panel.append(
        h("p", { class: "yv-muted" }, "15 WCAG checks on this page with a 0\u2013100 score. Heuristic: still test with a keyboard and a screen reader."),
        h("button", { type: "button", class: "yv-btn yv-primary", onclick: run }, iconEl("check", 16), "Run QA audit"),
        out
      );
    }
    function buildForms(panel) {
      const senior = h("input", { type: "checkbox", id: nextId("yv-senior"), checked: options.seniorFriendly !== false });
      const out = h("div", { "aria-live": "polite" });
      const run = () => {
        const reviews = reviewForms({ seniorFriendly: senior.checked, maxFieldsPerStep: options.maxFieldsPerStep || 8 });
        if (!reviews.length) {
          out.replaceChildren(h("p", { class: "yv-answer" }, "There are no forms on this page."));
          return announce2("No forms found");
        }
        out.replaceChildren(
          ...reviews.map(
            (r) => h(
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
        );
        announce2(`${reviews.length} form(s) reviewed`);
      };
      panel.append(
        h("p", { class: "yv-muted" }, "Checks labels, autocomplete, error messages and senior-friendly tips."),
        h("div", { class: "yv-row" }, h("label", { class: "yv-check", for: senior.id }, senior), h("label", { for: senior.id }, "Senior-friendly checks"), h("button", { type: "button", class: "yv-btn yv-primary", onclick: run }, iconEl("form", 16), "Review forms")),
        out
      );
    }
    function buildDesign(panel) {
      const sizeId = nextId("yv-min");
      const size = h("input", { id: sizeId, class: "yv-input", type: "number", min: 10, max: 24, value: options.minFontSize || 16, style: "width:90px" });
      const out = h("div", { "aria-live": "polite" });
      const run = () => {
        const d = reviewDesign({ minFontSize: Number(size.value) || 16, maxLineLength: options.maxLineLength || 90 });
        out.replaceChildren(
          scoreBlock(d.score, d.summary),
          h("div", { class: "yv-cats" }, ...Object.entries(d.categories).map(([name, c]) => h("div", { class: "yv-cat" }, h("span", { class: "yv-muted" }, name), h("strong", null, String(c.score)), h("span", { class: "yv-muted" }, `${c.findings} finding(s)`)))),
          h(
            "ul",
            { class: "yv-list" },
            ...d.findings.slice(0, 40).map((f) => h("li", { class: "yv-item" }, h("p", null, sevBadge(f.severity), " ", h("b", null, f.category), ": ", f.message), h("p", { class: "yv-muted" }, f.suggestion), showButton([f.selector])))
          )
        );
        announce2(d.summary);
      };
      panel.append(
        h("p", { class: "yv-muted" }, "Hierarchy, readability, interaction, clutter and consistency. Heuristic, not a visual-design certification."),
        h("div", { class: "yv-row" }, h("label", { for: sizeId }, "Minimum text size (px)"), size, h("button", { type: "button", class: "yv-btn yv-primary", onclick: run }, iconEl("layout", 16), "Review design")),
        out
      );
    }
    function buildAsk(panel) {
      const inputId = nextId("yv-pq");
      const input = h("input", { id: inputId, class: "yv-input", type: "text", placeholder: "What is this page about?", autocomplete: "off" });
      const out = h("div", { "aria-live": "polite" });
      let index = null;
      const run = async () => {
        const q = input.value.trim() || "What is this page about?";
        const a = await askAboutPage(q, { summarize: options.summarize });
        const nodes = [h("div", { class: "yv-answer" }, a.answer)];
        if (a.suggestions.length) nodes.push(h("ul", { class: "yv-steps" }, ...a.suggestions.map((s) => h("li", null, s))));
        const show = showButton(a.targets);
        if (show) nodes.push(show);
        if (a.intent === "unknown") {
          if (!index) index = createContextIndex({ includePage: true, documents: options.documents });
          else index.rebuild();
          const c = await index.ask(q, { generate: options.generate });
          nodes.push(h("h4", { style: "margin:12px 0 4px" }, c.generated ? "Answer (your model)" : "From the page text"), h("div", { class: "yv-answer" }, c.answer));
        }
        out.replaceChildren(...nodes);
        announce2(a.answer);
      };
      const form = h("form", { class: "yv-row" }, h("label", { for: inputId, class: "yv-sr" }, "Ask about this page"), input, h("button", { type: "submit", class: "yv-btn yv-primary" }, "Ask"));
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        run();
      });
      const examples = ["What is this page about?", "Which fields have no label?", "Which images have no alt text?", "Show the page structure", "How many links are there?", "Tell me about the forms"];
      panel.append(
        h("p", { class: "yv-muted" }, "Answers from this page only, offline. Pass generate() to use your own model."),
        form,
        h("div", { class: "yv-chips" }, ...examples.map((x) => h("button", { type: "button", class: "yv-chip", onclick: () => (input.value = x, run()) }, x))),
        out
      );
    }
    let voice = null;
    function buildVoice(panel) {
      const langId = nextId("yv-lang");
      const lang = h("select", { id: langId, class: "yv-input", style: "width:auto" }, ...VOICE_LANGS.map(([v, l]) => h("option", { value: v, selected: v === (options.voiceLang || "en-IN") }, l)));
      const startBtn = h("button", { type: "button", class: "yv-btn yv-primary", "aria-pressed": "false" }, iconEl("mic", 16), "Start listening");
      const cmdId = nextId("yv-cmd");
      const cmd = h("input", { id: cmdId, class: "yv-input", type: "text", placeholder: "Type a command, e.g. make text bigger", autocomplete: "off" });
      const log = h("div", { class: "yv-answer", role: "status", "aria-live": "polite" });
      const supported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      const make = () => {
        if (voice) voice.stop();
        voice = createVoiceA11yController({
          lang: lang.value,
          speak: options.speak !== false,
          initial: options.getSettings ? options.getSettings() : void 0,
          apply: options.applySettings,
          onTranscript: (text, command) => {
            log.textContent = `Heard: \u201C${text}\u201D
${command ? command.say : "Not a voice command. Try: make text bigger, high contrast on, dark mode, next row, reset."}`;
            options.onVoiceCommand && options.onVoiceCommand(text, command);
          }
        });
      };
      make();
      lang.addEventListener("change", () => {
        const wasOn = startBtn.getAttribute("aria-pressed") === "true";
        make();
        if (wasOn) voice.start();
      });
      startBtn.addEventListener("click", () => {
        if (startBtn.getAttribute("aria-pressed") === "true") {
          voice.stop();
          startBtn.setAttribute("aria-pressed", "false");
          startBtn.lastChild.textContent = "Start listening";
          return;
        }
        if (!voice.start()) {
          log.textContent = "Speech recognition is not available in this browser. Typed commands below still work.";
          return;
        }
        startBtn.setAttribute("aria-pressed", "true");
        startBtn.lastChild.textContent = "Stop listening";
        log.textContent = "Listening\u2026 say \u201Cmake text bigger\u201D or \u201Cnext row\u201D.";
      });
      const form = h("form", { class: "yv-row" }, h("label", { for: cmdId, class: "yv-sr" }, "Type a voice command"), cmd, h("button", { type: "submit", class: "yv-btn" }, "Run"));
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!cmd.value.trim()) return;
        await voice.handle(cmd.value);
      });
      const phrases = ["make text bigger", "make text smaller", "high contrast on", "dark mode", "reduce motion", "dyslexia font", "next row", "previous row", "first row", "reset", "\u0C2A\u0C46\u0C26\u0C4D\u0C26 \u0C05\u0C15\u0C4D\u0C37\u0C30\u0C3E\u0C32\u0C41", "\u0C39\u0C48 \u0C15\u0C3E\u0C02\u0C1F\u0C4D\u0C30\u0C3E\u0C38\u0C4D\u0C1F\u0C4D", "\u0C24\u0C30\u0C4D\u0C35\u0C3E\u0C24\u0C3F \u0C35\u0C30\u0C41\u0C38"];
      panel.append(
        h("p", { class: "yv-muted" }, supported ? "Speak accessibility commands in English or Telugu. Text size moves 80\u2013130% in 10% steps." : "Your browser has no speech recognition. You can still type the same commands."),
        h("div", { class: "yv-row" }, h("label", { for: langId }, "Language"), lang, startBtn),
        form,
        h("div", { class: "yv-chips" }, ...phrases.map((p) => h("button", { type: "button", class: "yv-chip", onclick: () => (cmd.value = p, voice.handle(p)) }, p))),
        log
      );
    }
    const BUILDERS = { copilot: buildCopilot, qa: buildQa, forms: buildForms, design: buildDesign, ask: buildAsk, voice: buildVoice };
    select(options.defaultTab || "qa", false);
    return {
      element: root,
      select: (id) => select(id, false),
      get tab() {
        return current;
      },
      get copilot() {
        return copilot;
      },
      destroy() {
        copilot && copilot.stop();
        voice && voice.stop();
        root.remove();
      }
    };
  }

  // vanilla/src/widget.js
  var PREFS_KEY = "yuktai-a11y-prefs";
  var FONT_STEPS = [0.8, 0.9, 1, 1.1, 1.2, 1.3];
  var COLOR_MODES2 = [
    ["none", "None"],
    ["deuteranopia", "Deuteranopia (red-green)"],
    ["protanopia", "Protanopia (red-green)"],
    ["tritanopia", "Tritanopia (blue-yellow)"],
    ["achromatopsia", "Achromatopsia (no colour)"]
  ];
  var TOGGLES2 = [
    ["highContrast", "High contrast", "Stronger text and borders", "contrast"],
    ["darkMode", "Dark mode", "Light text on a dark page", "moon"],
    ["reduceMotion", "Reduce motion", "Stop animations and transitions", "motion"],
    ["largeTargets", "Large targets", "Buttons and links at least 44\xD744", "target"],
    ["dyslexiaFont", "Dyslexia-friendly font", "Easier letters and wider spacing", "reading"],
    ["speechEnabled", "Speak on focus", "Read out each control you Tab to", "speaker"],
    ["autoFix", "Auto-fix page", "Add missing ARIA, labels and alt text; watch new content", "wand"],
    ["showSkipLinks", "Skip links", "\u201CSkip to main content\u201D on Tab", "skip"]
  ];
  function readPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  function writePrefs(config) {
    try {
      const keep = {};
      ["highContrast", "darkMode", "reduceMotion", "largeTargets", "speechEnabled", "colorBlindMode", "dyslexiaFont", "fontSizeMultiplier"].forEach((k) => keep[k] = config[k]);
      localStorage.setItem(PREFS_KEY, JSON.stringify(keep));
    } catch {
    }
  }
  function createWidget(userConfig = {}) {
    const cfg = { position: "left", title: "Accessibility", showPageTools: false, ...userConfig };
    const side = cfg.position === "right" ? "right" : "left";
    const primary = safeColor(cfg.primaryColor, "#0f766e");
    const base = {
      enabled: true,
      autoFix: true,
      showSkipLinks: true,
      showPreferencePanel: false,
      ...DEFAULT_A11Y_SETTINGS,
      ...cfg.config || {}
    };
    let settings = { ...base, ...readPrefs() };
    let fabs, fab, toolsFab, dialog, toolsDialog, panelApi, lastFocus;
    let lastMessage = "";
    async function apply(next, quiet) {
      settings = { ...settings, ...next, enabled: true };
      writePrefs(settings);
      try {
        lastMessage = await wcagPlugin.execute({ ...settings });
        if (!settings.autoFix) wcagPlugin.stopObserver();
      } catch (error) {
        console.error("[yuktai] accessibility engine failed", error);
        lastMessage = "Some settings could not be applied. See the browser console.";
      }
      syncDialog();
      if (!quiet) announce2("Accessibility settings updated");
      return lastMessage;
    }
    async function reset() {
      try {
        localStorage.removeItem(PREFS_KEY);
      } catch {
      }
      settings = { ...base };
      await apply(settings, true);
      announce2("Accessibility settings reset");
      return settings;
    }
    function buildDialog() {
      const titleId = nextId("yv-a11y-title");
      const fontId = nextId("yv-font");
      const cbId = nextId("yv-cb");
      const d = h("section", { class: "yv-dialog", role: "dialog", "aria-modal": "false", "aria-labelledby": titleId, "data-yuktai-panel": "" });
      const options = TOGGLES2.map(([key, label, desc, ic]) => {
        const id = nextId("yv-opt");
        const input = h("input", { id, type: "checkbox", role: "switch", "data-setting": key, "aria-describedby": `${id}-d` });
        return h("div", { class: "yv-option" }, h("span", { class: "yv-option-icon" }, iconEl(ic, 18)), h("span", { class: "yv-option-copy" }, h("label", { for: id }, h("b", null, label)), h("small", { id: `${id}-d` }, desc)), h("span", { class: "yv-switch" }, input, h("span", { "aria-hidden": "true" })));
      });
      const steps = h(
        "div",
        { class: "yv-steps-bar", role: "group", "aria-labelledby": fontId },
        ...FONT_STEPS.map((n) => h("button", { type: "button", class: "yv-step", "data-font": n, "aria-label": `${Math.round(n * 100)} percent`, "aria-pressed": "false" }))
      );
      const cb = h("select", { id: cbId, class: "yv-input", "data-colorblind": "" }, ...COLOR_MODES2.map(([v, l]) => h("option", { value: v }, l)));
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
      );
      d.addEventListener("change", (e) => {
        const el = e.target;
        if (el.matches("[data-setting]")) apply({ [el.getAttribute("data-setting")]: el.checked });
        else if (el.matches("[data-colorblind]")) apply({ colorBlindMode: el.value });
      });
      d.addEventListener("click", (e) => {
        const el = e.target.closest("button");
        if (!el) return;
        if (el.hasAttribute("data-close")) return closeSettings();
        if (el.hasAttribute("data-reset")) return reset();
        if (el.hasAttribute("data-font")) return setFont(Number(el.getAttribute("data-font")));
        if (el.hasAttribute("data-font-step")) {
          const i = FONT_STEPS.indexOf(Number(settings.fontSizeMultiplier || 1));
          return setFont(FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, (i < 0 ? 2 : i) + Number(el.getAttribute("data-font-step"))))]);
        }
      });
      d.addEventListener("keydown", (e) => trapAndEscape(e, d, closeSettings));
      return d;
    }
    function syncDialog() {
      if (!dialog) return;
      dialog.querySelectorAll("[data-setting]").forEach((el) => el.checked = !!settings[el.getAttribute("data-setting")] && settings[el.getAttribute("data-setting")] !== false);
      const showSkip = dialog.querySelector('[data-setting="showSkipLinks"]');
      if (showSkip) showSkip.checked = settings.showSkipLinks !== false;
      const fontValue = Number(settings.fontSizeMultiplier || 1);
      dialog.querySelector("[data-font-value]").textContent = `${Math.round(fontValue * 100)}%`;
      dialog.querySelectorAll("[data-font]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(Number(b.getAttribute("data-font")) - fontValue) < 1e-3)));
      dialog.querySelector("[data-colorblind]").value = settings.colorBlindMode || "none";
      const fixed = /(\d+) fixes applied/.exec(lastMessage);
      dialog.querySelector("[data-status]").textContent = fixed ? `${fixed[1]} automatic accessibility fix(es) applied on this page.` : lastMessage;
    }
    function setFont(n) {
      if (!FONT_STEPS.some((s) => Math.abs(s - n) < 1e-3)) return;
      apply({ fontSizeMultiplier: n }, true);
      announce2(`Text size ${Math.round(n * 100)} percent`);
    }
    function trapAndEscape(e, box, close) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(box.querySelectorAll("button,input,select,textarea,[tabindex]:not([tabindex='-1'])")).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!items.length) return;
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault();
        items[0].focus();
      }
    }
    function openSettings() {
      if (!fab) init();
      if (dialog) return;
      closeTools();
      lastFocus = document.activeElement;
      dialog = buildDialog();
      layer().appendChild(dialog);
      fab.setAttribute("aria-expanded", "true");
      syncDialog();
      dialog.querySelector("[data-close]").focus();
      document.addEventListener("pointerdown", outside, true);
    }
    function closeSettings() {
      if (!dialog) return;
      dialog.remove();
      dialog = null;
      fab.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      (lastFocus && document.contains(lastFocus) ? lastFocus : fab).focus();
    }
    function outside(e) {
      if (dialog && !dialog.contains(e.target) && !fabs.contains(e.target)) closeSettings();
      if (toolsDialog && !toolsDialog.contains(e.target) && !fabs.contains(e.target)) closeTools();
    }
    function openTools(tab) {
      if (!fab) init();
      if (toolsDialog) {
        if (tab && panelApi) panelApi.select(tab);
        return;
      }
      closeSettings();
      lastFocus = document.activeElement;
      const titleId = nextId("yv-tools-title");
      toolsDialog = h("section", { class: "yv-dialog yv-wide", role: "dialog", "aria-modal": "false", "aria-labelledby": titleId, "data-yuktai-panel": "" });
      const body = h("div", { class: "yv-dialog-body" });
      toolsDialog.append(
        h("header", { class: "yv-dialog-head" }, h("h2", { id: titleId }, cfg.toolsTitle || "Page tools"), h("button", { type: "button", class: "yv-btn yv-icon", "aria-label": "Close page tools", html: icon("close"), onclick: () => closeTools() })),
        body
      );
      layer().appendChild(toolsDialog);
      panelApi = mountAgenticPanel(body, {
        defaultTab: tab || cfg.defaultTab || "qa",
        voiceLang: cfg.voiceLang,
        generate: cfg.generate,
        summarize: cfg.summarize,
        defaultLang: cfg.defaultLang,
        getSettings: () => ({ ...settings }),
        applySettings: (config) => apply(config, true)
      });
      toolsFab && toolsFab.setAttribute("aria-expanded", "true");
      toolsDialog.addEventListener("keydown", (e) => trapAndEscape(e, toolsDialog, closeTools));
      toolsDialog.querySelector("[role=tab][aria-selected=true]").focus();
      document.addEventListener("pointerdown", outside, true);
    }
    function closeTools() {
      if (!toolsDialog) return;
      panelApi && panelApi.destroy();
      panelApi = null;
      toolsDialog.remove();
      toolsDialog = null;
      toolsFab && toolsFab.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      (lastFocus && document.contains(lastFocus) ? lastFocus : toolsFab || fab).focus();
    }
    const layer = () => document.documentElement || document.body;
    function init() {
      if (!isBrowser2() || fab || !document.body) return;
      addStyles(primary, side);
      fabs = h("div", { class: "yv-fabs", "data-yuktai-fabs": "" });
      fab = h("button", { type: "button", class: "yv-fab", "aria-label": "Accessibility settings", title: "Accessibility settings", "aria-haspopup": "dialog", "aria-expanded": "false", html: icon("accessibility", 26) });
      fab.addEventListener("click", () => dialog ? closeSettings() : openSettings());
      fabs.append(fab);
      if (cfg.showPageTools) {
        toolsFab = h("button", { type: "button", class: "yv-fab yv-fab-alt", "aria-label": "Page tools: QA, forms, design, ask, voice", title: "Page tools", "aria-haspopup": "dialog", "aria-expanded": "false", html: icon("tools", 24) });
        toolsFab.addEventListener("click", () => toolsDialog ? closeTools() : openTools());
        fabs.prepend(toolsFab);
      }
      layer().appendChild(fabs);
      if (cfg.applyOnLoad !== false) apply({}, true);
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
        closeSettings();
        closeTools();
        fabs && fabs.remove();
        fab = toolsFab = fabs = null;
      }
    };
  }

  // vanilla/src/index.js
  var VERSION = "5.3.0";
  (function boot() {
    if (!isBrowser2()) return;
    if (window.yuktai && window.yuktai.__vanillaInitialized) return;
    const cfg = window.YUKTAI_CONFIG || {};
    const primary = safeColor(cfg.primaryColor, "#0f766e");
    const side = cfg.position === "right" ? "right" : "left";
    const widget = createWidget(cfg);
    const ensureStyles = () => addStyles(primary, side);
    const withStyles = (fn) => (...args) => {
      ensureStyles();
      return fn(...args);
    };
    const yuktai = {
      __vanillaInitialized: true,
      version: VERSION,
      // ── floating accessibility widget ──
      init: () => widget.init(),
      open: () => widget.open(),
      close: () => widget.close(),
      openTools: (tab) => widget.openTools(tab),
      closeTools: () => widget.closeTools(),
      apply: (settings) => widget.apply(settings),
      reset: () => widget.reset(),
      getSettings: () => widget.getSettings(),
      // ── UI (vanilla versions of the React components) ──
      renderGrid: withStyles(renderGrid),
      //            <YuktaiGrid>
      mountAgenticGridBar: withStyles(mountAgenticGridBar),
      // <AgenticGridBar>
      mountAgenticPanel: withStyles(mountAgenticPanel),
      // <AgenticPanel>
      mountGridAssistant: withStyles(mountGridAssistant),
      // <YuktaiGridAI embedded>
      // ── agents (vanilla versions of the React hooks) ──
      createAgenticGrid,
      //  useAgenticGrid
      createGridAgent,
      //    useYuktaiGridAgent
      parseGridIntent,
      registerWebMCP,
      //     <YuktaiGridWebMCP>
      // ── icons ──
      icon,
      iconNames: ICON_NAMES.slice(),
      // ── everything from the package core (same code as npm) ──
      ...core_exports,
      // ── v5.1 vanilla compatibility ──
      runPageQA: () => runQaAudit().summary,
      getCapabilities: () => ({
        version: VERSION,
        inlineSVG: true,
        grid: true,
        gridAssistant: true,
        agenticGrid: true,
        ruleBasedBI: true,
        taskRunner: true,
        anomalyChecks: true,
        pageQA: true,
        a11yCopilot: true,
        formsReview: true,
        designReview: true,
        pageQandA: true,
        localPageSearch: true,
        voiceCommands: true,
        voice: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
        speech: "speechSynthesis" in window,
        webMCP: !!(document.modelContext && typeof document.modelContext.registerTool === "function"),
        modelConnected: false
      })
    };
    window.yuktai = yuktai;
    if (cfg.autoInit !== false) {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => widget.init(), { once: true });
      else widget.init();
    }
  })();
})();
