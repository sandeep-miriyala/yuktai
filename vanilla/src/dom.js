// yuktai vanilla — DOM helpers, icons, styles, announcements.

export const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined"

export function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
}

/** Create an element: h("button", { class: "x", type: "button", onclick }, "text", child) */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue
      if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value)
      else if (key === "html") el.innerHTML = value
      else if (key === "text") el.textContent = value
      else if (value === true) el.setAttribute(key, "")
      else el.setAttribute(key, String(value))
    }
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue
    el.append(child instanceof Node ? child : document.createTextNode(String(child)))
  }
  return el
}

let uid = 0
export const nextId = (prefix = "yv") => `${prefix}-${++uid}`

export function safeColor(value, fallback) {
  if (typeof value !== "string" || !isBrowser()) return fallback
  const probe = document.createElement("span")
  probe.style.color = value
  return probe.style.color ? value : fallback
}

export const prefersReducedMotion = () =>
  isBrowser() &&
  ((window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    document.documentElement.hasAttribute("data-yuktai-reduce-motion"))

/* ───────────── icons (inline SVG, no icon font, no CDN) ───────────── */

// Icon shapes come from the shared list, so React and vanilla icons are identical.
import { ICON_PATHS as PATHS } from "../../src/icons/paths"
import { iconSvg } from "../../src/icons/variant"

export const ICON_NAMES = Object.keys(PATHS)

/**
 * yuktai icon as SVG markup.
 *   icon("mic")                                  outline, 20px, decorative
 *   icon("mic", 24, "Voice input")               with an accessible name
 *   icon("mic", { size: 24, variant: "filled", color: "#005a9c", label: "Voice input" })
 * Variants: "outline" (default) and "filled". Filled glyphs get >= 3:1 contrast (WCAG 1.4.11).
 */
export function icon(name, size = 20, label, options) {
  const opts = typeof size === "object" && size !== null ? { ...size } : { ...(options || {}), size, label }
  return iconSvg(name, opts)
}

export function iconEl(name, size, label) {
  const span = document.createElement("span")
  span.className = "yv-ic"
  span.innerHTML = icon(name, size, label)
  return span
}

/* ───────────── announcements (one polite live region per page) ───────────── */

let liveNode = null
export function announce(text) {
  if (!isBrowser() || !text) return
  if (!liveNode || !document.contains(liveNode)) {
    liveNode = h("div", { id: "yuktai-vanilla-live", class: "yv-sr", role: "status", "aria-live": "polite", "aria-atomic": "true" })
    document.body.appendChild(liveNode)
  }
  liveNode.textContent = ""
  setTimeout(() => {
    if (liveNode) liveNode.textContent = String(text).slice(0, 300)
  }, 30)
}

/* ───────────── downloads ───────────── */

export function downloadText(filename, text, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = h("a", { href: url, download: filename, hidden: true })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = h("textarea", { "aria-hidden": "true", style: "position:fixed;opacity:0;left:-9999px" })
    area.value = text
    document.body.appendChild(area)
    area.select()
    let ok = false
    try {
      ok = document.execCommand("copy")
    } catch {
      ok = false
    }
    area.remove()
    return ok
  }
}

/** Spreadsheet-safe CSV cell: quotes, and neutralises formulas (=, +, -, @). */
export function csvCell(value) {
  let text = String(value == null ? "" : value)
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text
  return '"' + text.replace(/"/g, '""') + '"'
}

/** Briefly outline elements on the page (for "show me" buttons). */
export function flashElements(selectors) {
  const list = (selectors || [])
    .map((s) => {
      try {
        return document.querySelector(s)
      } catch {
        return null
      }
    })
    .filter(Boolean)
  list.forEach((el) => {
    el.setAttribute("data-yv-flash", "")
    setTimeout(() => el.removeAttribute("data-yv-flash"), 4000)
  })
  if (list[0]) list[0].scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" })
  return list.length
}

/* ───────────── styles ───────────── */

export function addStyles(primary, side) {
  if (!isBrowser() || document.getElementById("yuktai-vanilla-css")) return
  const s = document.createElement("style")
  s.id = "yuktai-vanilla-css"
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
.yv-grid,.yv-box,.yv-dialog{--yv-bg:#fff;--yv-surface:#fff;--yv-soft:#f8fafc;--yv-head:#f8fafc;--yv-hover:#f1f5f9;--yv-text:#0f172a;--yv-muted:#475569;--yv-border:#e2e8f0;--yv-border-strong:#94a3b8;--yv-accent-bg:#E8F1F8;--yv-accent-text:#003F6E;--yv-hl-bg:#fef3c7;--yv-hl-edge:#b45309;--yv-sel-bg:#EEF5FB}
.yv-theme-dark{--yv-bg:#0f172a;--yv-surface:#111c33;--yv-soft:#16233f;--yv-head:#16233f;--yv-hover:#1e2d4d;--yv-text:#f1f5f9;--yv-muted:#cbd5e1;--yv-border:#334155;--yv-border-strong:#64748b;--yv-accent-bg:#0B2A4A;--yv-accent-text:#DCEBFA;--yv-hl-bg:#4a3a0c;--yv-hl-edge:#fbbf24;--yv-sel-bg:#12304f}
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
.yv-fab.yv-fab-alt{background:#fff;color:var(--yv-primary);border-color:var(--yv-primary)}
.yv-fab:hover{filter:brightness(1.08)}
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
`
  document.head.appendChild(s)
}
