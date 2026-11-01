// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/config.ts
// Defaults, and the rules that keep owner config and visitor settings valid.
// ─────────────────────────────────────────────────────────────────────────────

import type { Mode, OwnerConfig, PageCheck, Settings } from "./types"

export const VERSION = "0.1.0"

export const ALL_MODES: Mode[] = ["fast", "balanced", "best"]
export const ALL_CHECKS: PageCheck[] = ["accessibility", "forms", "images", "structure"]
export const TOP_K_CHOICES = [3, 5, 8, 10]

export const DEFAULT_TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js"
export const DEFAULT_EMBEDDING_MODEL = "Xenova/multilingual-e5-small"
export const DEFAULT_WEBLLM_MODEL = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"
/** Approximate one-time download for the default embedding model (q8). */
export const EMBEDDING_MODEL_MB = 118

export const DEFAULT_SETTINGS: Settings = {
  mode: "fast",
  topK: 5,
  answerStyle: "short",
  sayUnknown: true,
  checks: [...ALL_CHECKS],
  lang: "auto",
  fontScale: 1,
}

/** Owner config with every default filled in. */
export interface ResolvedConfig extends Required<Omit<OwnerConfig, "defaults" | "webllmUrl" | "root">> {
  defaults: Settings
  webllmUrl: string
  root: string
}

export function resolveConfig(owner: OwnerConfig = {}): ResolvedConfig {
  const modes = (owner.modes ?? ALL_MODES).filter((m) => ALL_MODES.includes(m))
  const allowed = modes.length ? modes : ["fast" as Mode]
  const defaults = sanitizeSettings({ ...DEFAULT_SETTINGS, ...owner.defaults }, allowed)
  return {
    modes: allowed,
    defaults,
    questions: (owner.questions ?? []).filter((q) => q && typeof q.text === "string" && q.text.trim()),
    suggestions: owner.suggestions ?? "both",
    suggestionCount: clamp(Math.round(owner.suggestionCount ?? 6), 3, 6),
    disabledPageTypes: owner.disabledPageTypes ?? [],
    allowPins: owner.allowPins ?? true,
    cache: owner.cache ?? true,
    root: owner.root ?? "",
    exclude: owner.exclude ?? [],
    transformersUrl: owner.transformersUrl ?? DEFAULT_TRANSFORMERS_URL,
    embeddingModel: owner.embeddingModel ?? DEFAULT_EMBEDDING_MODEL,
    webllmUrl: owner.webllmUrl ?? "",
    webllmModel: owner.webllmModel ?? DEFAULT_WEBLLM_MODEL,
    webmcp: owner.webmcp ?? true,
    title: owner.title ?? "",
    side: owner.side === "left" ? "left" : "right",
    launcher: owner.launcher ?? true,
  }
}

/** Visitor settings from storage can be stale or edited: repair them. */
export function sanitizeSettings(s: Partial<Settings>, modes: Mode[] = ALL_MODES): Settings {
  const d = DEFAULT_SETTINGS
  const mode = s.mode && modes.includes(s.mode) ? s.mode : modes.includes(d.mode) ? d.mode : modes[0]
  return {
    mode,
    topK: TOP_K_CHOICES.includes(Number(s.topK)) ? Number(s.topK) : d.topK,
    answerStyle: s.answerStyle === "quote" || s.answerStyle === "detailed" || s.answerStyle === "short" ? s.answerStyle : d.answerStyle,
    sayUnknown: typeof s.sayUnknown === "boolean" ? s.sayUnknown : d.sayUnknown,
    checks: Array.isArray(s.checks) ? s.checks.filter((c) => ALL_CHECKS.includes(c)) : [...d.checks],
    lang: s.lang === "en" || s.lang === "te" || s.lang === "hi" || s.lang === "auto" ? s.lang : d.lang,
    fontScale: clamp(Number(s.fontScale) || 1, 0.85, 1.6),
  }
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** Does an owner question apply to this path? */
export function pathMatches(pattern: string | undefined, path: string): boolean {
  if (!pattern) return true
  if (pattern.endsWith("*")) return path.startsWith(pattern.slice(0, -1))
  return path === pattern || path === pattern + "/" || path + "/" === pattern
}
