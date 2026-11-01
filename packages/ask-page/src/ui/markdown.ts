// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/ui/markdown.ts
//
// Renders answer text (from the page or a model) as a little HTML. Safe by
// construction: every character is HTML-escaped FIRST, then only a handful
// of patterns become tags (bold, italic, code, lists, paragraphs, [n] cites).
// No links, no images, no raw HTML can get through, so no sanitizer is needed.
// ─────────────────────────────────────────────────────────────────────────────

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^_]+)_(?=$|[\s).,!?])/g, "$1<em>$2</em>")
    .replace(/\[(\d{1,2})\]/g, '<sup class="cite">[$1]</sup>')
}

export function renderMarkdown(src: string): string {
  const lines = escapeHtml(src.replace(/\r/g, "")).split("\n")
  const out: string[] = []
  let list: string[] | null = null
  let para: string[] = []
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`)
    para = []
  }
  const flushList = () => {
    if (list) out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`)
    list = null
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    const m = line.match(/^\s*[-*•]\s+(.*)$/)
    if (m) {
      flushPara()
      ;(list ??= []).push(m[1])
    } else if (!line.trim()) {
      flushPara()
      flushList()
    } else {
      flushList()
      para.push(line.trim())
    }
  }
  flushPara()
  flushList()
  return out.join("")
}
