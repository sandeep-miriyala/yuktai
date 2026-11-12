// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/gridExport.ts (v5.7.0)
// Downloads of what the grid shows: CSV, Excel (.xlsx), JSON and PDF (the
// browser's print dialog). No extra library: an .xlsx file is a zip of a few
// XML files, written here with the "stored" (uncompressed) method.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridDownloadFormat } from "./types"

export type ExportCell = string | number | boolean | null

/** A table ready to download. `level` > 0 marks a child row (parent and child grids). */
export interface ExportTable {
  /** Title and file name, without the extension. */
  name: string
  headers: string[]
  rows: { cells: ExportCell[]; level?: number }[]
  /** Page language, for the PDF view (screen readers and fonts). */
  lang?: string
}

export const DOWNLOAD_FORMATS: readonly GridDownloadFormat[] = ["csv", "xlsx", "json", "pdf"]

/* ───────────── CSV ───────────── */

/**
 * Text a spreadsheet would run as a formula (=, +, -, @, tab, return) gets a
 * leading ' so opening the file never runs anything (CSV injection).
 */
export function safeSpreadsheetText(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

function csvCell(value: ExportCell): string {
  if (value == null) return ""
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : ""
  if (typeof value === "boolean") return value ? "true" : "false"
  const text = safeSpreadsheetText(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** CSV with a byte-order mark, so Excel opens Telugu and other scripts correctly. */
export function toCSV(table: ExportTable): string {
  const lines = [table.headers.map(csvCell).join(",")]
  for (const row of table.rows) lines.push(row.cells.map(csvCell).join(","))
  return "﻿" + lines.join("\r\n") + "\r\n"
}

/* ───────────── JSON ───────────── */

/** One object per row, keyed by column header; child rows carry "level". */
export function toJSON(table: ExportTable): string {
  const rows = table.rows.map((row) => {
    const out: Record<string, ExportCell> = {}
    table.headers.forEach((h, i) => {
      out[h] = row.cells[i] ?? null
    })
    if (row.level) out.level = row.level
    return out
  })
  return JSON.stringify(rows, null, 2)
}

/* ───────────── XLSX ───────────── */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** A zip with the "stored" method (no compression), UTF-8 names. */
export function zipStored(files: { name: string; data: string }[]): Uint8Array {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = enc.encode(file.name)
    const data = enc.encode(file.data)
    const crc = crc32(data)
    const local = new Uint8Array(30 + name.length)
    const v = new DataView(local.buffer)
    v.setUint32(0, 0x04034b50, true)
    v.setUint16(4, 20, true)
    v.setUint16(6, 0x0800, true) // UTF-8 names
    v.setUint16(8, 0, true) // stored
    v.setUint32(14, crc, true)
    v.setUint32(18, data.length, true)
    v.setUint32(22, data.length, true)
    v.setUint16(26, name.length, true)
    local.set(name, 30)
    parts.push(local, data)

    const entry = new Uint8Array(46 + name.length)
    const c = new DataView(entry.buffer)
    c.setUint32(0, 0x02014b50, true)
    c.setUint16(4, 20, true)
    c.setUint16(6, 20, true)
    c.setUint16(8, 0x0800, true)
    c.setUint16(10, 0, true)
    c.setUint32(16, crc, true)
    c.setUint32(20, data.length, true)
    c.setUint32(24, data.length, true)
    c.setUint16(28, name.length, true)
    c.setUint32(42, offset, true)
    entry.set(name, 46)
    central.push(entry)
    offset += local.length + data.length
  }
  const centralSize = central.reduce((n, e) => n + e.length, 0)
  const end = new Uint8Array(22)
  const e = new DataView(end.buffer)
  e.setUint32(0, 0x06054b50, true)
  e.setUint16(8, files.length, true)
  e.setUint16(10, files.length, true)
  e.setUint32(12, centralSize, true)
  e.setUint32(16, offset, true)
  const all = [...parts, ...central, end]
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of all) {
    out.set(p, at)
    at += p.length
  }
  return out
}

const xmlEscape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // characters XML 1.0 does not allow (control characters on purpose)
    // oxlint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")

/** Column number (0-based) → "A", "B", … "AA". */
export function columnLetter(index: number): string {
  let n = index + 1
  let out = ""
  while (n > 0) {
    const r = (n - 1) % 26
    out = String.fromCharCode(65 + r) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

function xlsxCell(ref: string, value: ExportCell, style: number): string {
  const s = style ? ` s="${style}"` : ""
  if (value == null || value === "") return ""
  if (typeof value === "number") return Number.isFinite(value) ? `<c r="${ref}"${s}><v>${value}</v></c>` : ""
  if (typeof value === "boolean") return `<c r="${ref}" t="b"${s}><v>${value ? 1 : 0}</v></c>`
  return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`
}

/** An Excel workbook with one sheet; the header row is bold and stays on top. */
export function toXLSX(table: ExportTable): Uint8Array {
  const sheetName = xmlEscape((table.name || "Sheet1").replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Sheet1")
  const rowsXml: string[] = []
  const header = table.headers.map((h, i) => xlsxCell(`${columnLetter(i)}1`, h, 1)).join("")
  rowsXml.push(`<row r="1">${header}</row>`)
  table.rows.forEach((row, r) => {
    const n = r + 2
    const cells = row.cells.map((v, i) => xlsxCell(`${columnLetter(i)}${n}`, v, 0)).join("")
    const outline = row.level ? ` outlineLevel="${Math.min(7, row.level)}"` : ""
    rowsXml.push(`<row r="${n}"${outline}>${cells}</row>`)
  })
  const sheet =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetData>${rowsXml.join("")}</sheetData></worksheet>`

  return zipStored([
    {
      name: "[Content_Types].xml",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`,
    },
    {
      name: "_rels/.rels",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`,
    },
    { name: "xl/worksheets/sheet1.xml", data: sheet },
    {
      name: "xl/styles.xml",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
        `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
        `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>` +
        `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
        `</styleSheet>`,
    },
  ])
}

/* ───────────── PDF (print) ───────────── */

const htmlEscape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** A printable page with the table: headers repeat on every printed page. */
export function toPrintHTML(table: ExportTable): string {
  const cell = (v: ExportCell) => (v == null ? "" : htmlEscape(String(v)))
  const head = table.headers.map((h) => `<th scope="col">${cell(h)}</th>`).join("")
  const body = table.rows
    .map((row) => {
      const cells = row.cells
        .map((v, i) => (i === 0 && row.level ? `<td style="padding-left:${8 + row.level * 18}px">${cell(v)}</td>` : `<td>${cell(v)}</td>`))
        .join("")
      return `<tr>${cells}</tr>`
    })
    .join("")
  return (
    `<!doctype html><html lang="${htmlEscape(table.lang || "en")}"><head><meta charset="utf-8"><title>${cell(table.name)}</title>` +
    `<style>body{font:12px system-ui,sans-serif;margin:16px;color:#000}h1{font-size:16px}` +
    `table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px 8px;text-align:left;vertical-align:top}` +
    `thead{display:table-header-group}tr{break-inside:avoid}</style></head>` +
    `<body><h1>${cell(table.name)}</h1><p>${table.rows.length} rows</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
  )
}

/* ───────────── run a download ───────────── */

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** File name: letters, digits and Indic letters kept; the rest becomes "-". */
export function safeFileName(name: string): string {
  const clean = name.normalize("NFC").replace(/[^\p{L}\p{M}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "")
  return clean.slice(0, 80) || "grid"
}

/** Download the table. "pdf" opens the print dialog, where readers pick "Save as PDF". */
export function downloadTable(table: ExportTable, format: GridDownloadFormat): void {
  if (typeof document === "undefined") return
  const base = safeFileName(table.name)
  if (format === "csv") saveBlob(new Blob([toCSV(table)], { type: "text/csv;charset=utf-8" }), `${base}.csv`)
  else if (format === "json") saveBlob(new Blob([toJSON(table)], { type: "application/json" }), `${base}.json`)
  else if (format === "xlsx")
    saveBlob(
      new Blob([toXLSX(table) as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `${base}.xlsx`
    )
  else {
    const frame = document.createElement("iframe")
    frame.setAttribute("aria-hidden", "true")
    frame.tabIndex = -1
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0"
    frame.srcdoc = toPrintHTML(table)
    frame.onload = () => {
      try {
        frame.contentWindow?.focus()
        frame.contentWindow?.print()
      } finally {
        setTimeout(() => frame.remove(), 60_000)
      }
    }
    document.body.appendChild(frame)
  }
}
