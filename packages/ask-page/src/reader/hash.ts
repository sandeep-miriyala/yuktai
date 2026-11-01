// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/reader/hash.ts
// A fast, stable 64-bit text hash (two FNV-1a 32 passes) for cache keys and
// "has the page changed?" checks. Not for security.
// ─────────────────────────────────────────────────────────────────────────────

export function hashText(s: string): string {
  let a = 0x811c9dc5
  let b = 0x01000193 ^ 0x5bd1e995
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a ^= c
    a = Math.imul(a, 0x01000193)
    b ^= c + i
    b = Math.imul(b, 0x01000193)
  }
  return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0")
}
