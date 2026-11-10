/**
 * WebMCP for the grid: one implementation for React (YuktaiGridWebMCP) and
 * vanilla (registerWebMCP), matching the WebMCP draft that Chrome ships:
 *
 *  - document.modelContext.registerTool(tool, { signal }); navigator.modelContext
 *    as a fallback (older Chrome builds).
 *  - execute(input, { signal }) resolves to a STRING (JSON). Objects are not
 *    passed back, so agents never see "[object Object]".
 *  - annotations: readOnlyHint for tools that only read, untrustedContentHint
 *    for tools that return row text (cell values may contain instructions
 *    aimed at an agent; the agent should treat them as data).
 *  - Late arrival: the browser may offer modelContext a moment after load
 *    (origin trial meta just added, an extension or polyfill), so we keep
 *    looking for a few seconds.
 *  - Aborting the signal unregisters the tools.
 *
 * Nothing here reads what the visitor types; tools only see what an agent
 * sends them, and only return grid data the page already shows.
 */

import type { GridTool, GridToolResult } from "./gridTools";

/* ================= types ================= */

export type WebMCPState = "unsupported" | "registering" | "ready" | "partial" | "error";

export type WebMCPStatus = {
  state: WebMCPState;
  /** Tools that the browser actually accepted */
  registered: string[];
  errors: { tool: string; message: string }[];
};

export type ModelContextTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: Record<string, unknown>, ctx?: { signal?: AbortSignal }) => Promise<string>;
};

export type ModelContext = {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
};

export type RegisterGridWebMCPOptions = {
  onStatusChange?: (status: WebMCPStatus) => void;
  /** WebMCP origin trial token for this site (Chrome). Adds the meta tag once. */
  originTrialToken?: string;
  /** When to look for modelContext again, in ms after start. */
  retries?: number[];
  /** Mostly for tests. Defaults to the global document. */
  doc?: Document;
};

export type GridWebMCPHandle = {
  readonly status: WebMCPStatus;
  /** Resolves when the current registration round has finished. */
  readonly done: Promise<void>;
  unregister: () => void;
};

const DEFAULT_RETRIES = [0, 300, 1000, 2500, 5000];

/* ================= helpers ================= */

/** The browser's WebMCP entry point, or null. document first, then navigator. */
export function getModelContext(doc?: Document): ModelContext | null {
  const d = (doc ?? (typeof document !== "undefined" ? document : undefined)) as
    | (Document & { modelContext?: ModelContext })
    | undefined;
  if (d?.modelContext && typeof d.modelContext.registerTool === "function") return d.modelContext;
  const nav = (d?.defaultView?.navigator ?? (typeof navigator !== "undefined" ? navigator : undefined)) as
    | (Navigator & { modelContext?: ModelContext })
    | undefined;
  if (nav?.modelContext && typeof nav.modelContext.registerTool === "function") return nav.modelContext;
  return null;
}

/** True when this browser offers WebMCP right now. */
export function hasWebMCP(doc?: Document): boolean {
  return getModelContext(doc) !== null;
}

/** Adds the site's WebMCP origin trial token to <head>, once. */
export function addOriginTrial(token: string, doc?: Document): void {
  const d = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!token || !d?.head) return;
  const metas = Array.from(d.head.querySelectorAll("meta[http-equiv='origin-trial']"));
  if (metas.some((m) => m.getAttribute("content") === token)) return;
  const m = d.createElement("meta");
  m.setAttribute("http-equiv", "origin-trial");
  m.setAttribute("content", token);
  d.head.appendChild(m);
}

/** A grid tool result as the string WebMCP expects. */
export function toWebMCPResult(result: GridToolResult | unknown): string {
  if (typeof result === "string") return result;
  try {
    return JSON.stringify(result ?? { success: false, message: "No result." });
  } catch {
    return JSON.stringify({ success: false, message: "The result could not be converted to text." });
  }
}

const cancelled = (): GridToolResult => ({
  success: false,
  message: "Cancelled by the agent.",
  error: { code: "NOT_SUPPORTED" },
});

/**
 * Turns a grid tool into a WebMCP tool. `latest` is looked up at call time,
 * so data changes never need a new registration.
 */
export function toModelContextTool(tool: GridTool, latest: () => GridTool[]): ModelContextTool {
  const out: ModelContextTool = {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
    async execute(input, ctx) {
      if (ctx?.signal?.aborted) return toWebMCPResult(cancelled());
      const current = latest().find((t) => t.name === tool.name);
      if (!current) {
        return toWebMCPResult({
          success: false,
          message: `Tool "${tool.name}" is no longer available.`,
          error: { code: "NOT_SUPPORTED" },
        });
      }
      const result = await current.execute(input ?? {});
      if (ctx?.signal?.aborted) return toWebMCPResult(cancelled());
      return toWebMCPResult(result);
    },
  };
  if (tool.annotations) out.annotations = { ...tool.annotations };
  return out;
}

/* ================= registration ================= */

/**
 * Registers grid tools with WebMCP and reports the real status.
 * `tools` may be an array or a function returning the current array.
 */
export function registerGridWebMCP(
  tools: GridTool[] | (() => GridTool[]),
  options: RegisterGridWebMCPOptions = {}
): GridWebMCPHandle {
  const read = () => (typeof tools === "function" ? tools() : tools) || [];
  const controller = new AbortController();
  const timers: ReturnType<typeof setTimeout>[] = [];
  let status: WebMCPStatus = { state: "unsupported", registered: [], errors: [] };
  let started = false;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => (resolveDone = r));

  const report = (s: WebMCPStatus) => {
    status = s;
    options.onStatusChange?.(s);
  };

  if (options.originTrialToken) addOriginTrial(options.originTrialToken, options.doc);

  const register = async (mc: ModelContext) => {
    started = true;
    report({ state: "registering", registered: [], errors: [] });
    const registered: string[] = [];
    const errors: WebMCPStatus["errors"] = [];
    for (const tool of read()) {
      if (controller.signal.aborted) return;
      try {
        await mc.registerTool(toModelContextTool(tool, read), { signal: controller.signal });
        registered.push(tool.name);
      } catch (error) {
        errors.push({ tool: tool.name, message: error instanceof Error ? error.message : String(error) });
      }
    }
    if (controller.signal.aborted) return;
    report({
      state: errors.length === 0 ? "ready" : registered.length > 0 ? "partial" : "error",
      registered,
      errors,
    });
  };

  const now = getModelContext(options.doc);
  if (now) {
    register(now).finally(resolveDone);
  } else {
    // Not there yet: say so honestly, but keep looking for a few seconds
    report({ state: "unsupported", registered: [], errors: [] });
    const retries = (options.retries ?? DEFAULT_RETRIES).filter((ms) => ms > 0);
    if (retries.length === 0) resolveDone();
    retries.forEach((ms, i) => {
      timers.push(
        setTimeout(() => {
          if (started || controller.signal.aborted) return;
          const mc = getModelContext(options.doc);
          if (mc) register(mc).finally(resolveDone);
          else if (i === retries.length - 1) resolveDone();
        }, ms)
      );
    });
  }

  return {
    get status() {
      return status;
    },
    done,
    unregister() {
      timers.forEach(clearTimeout);
      controller.abort();
      resolveDone();
    },
  };
}
