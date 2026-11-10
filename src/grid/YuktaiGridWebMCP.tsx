"use client";

/**
 * YuktaiGridWebMCP — exposes grid tools to AI agents through WebMCP
 * (document.modelContext). Renders nothing.
 *
 * 5.5.4: results are JSON strings, tools carry readOnlyHint /
 * untrustedContentHint, navigator.modelContext is used when document's is
 * missing, the browser is checked again for a few seconds (late arrival), and
 * an origin trial token can be passed. Shared with vanilla in ./webmcp.ts.
 *
 * What changed from 4.6.x:
 *  - Uses the SAME tool list as the in-page Agent (createGridTools), or a
 *    `tools` list passed in by YuktaiGrid — so what agents can call always
 *    matches what the UI can do.
 *  - Real status: onStatusChange reports "unsupported" | "registering" |
 *    "ready" | "partial" | "error", which tools actually registered, and
 *    per-tool errors. Nothing is swallowed silently any more.
 *  - Data changes do NOT re-register tools. Each registered tool calls the
 *    latest tool through a ref; tools are re-registered only when the tool
 *    list itself changes (names / descriptions / schemas).
 *  - Registrations are serialised: a new round waits until the previous
 *    round has finished and been aborted, so a tool name is never
 *    registered twice at the same moment.
 *
 * Backward compatible: the 4.6.x props (data, columns, name, onSelectRow,
 * onHighlightRows, onOpenRow) still work.
 */

import { useEffect, useMemo, useRef } from "react";
import { registerGridWebMCP, type GridWebMCPHandle, type WebMCPStatus } from "./webmcp";
import {
  createGridTools,
  type CreateGridToolsOptions,
  type GridTool,
  type GridToolColumn,
  type GridToolContext,
  type GridToolLocale,
} from "./gridTools";

/* ================= WebMCP (shared with vanilla) ================= */

export type { WebMCPState, WebMCPStatus } from "./webmcp";

/* ================= Props ================= */

type WebMCPColumn = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
};

export type YuktaiGridWebMCPProps<T> = {
  /**
   * Ready-made tools (YuktaiGrid passes its own list here). When given,
   * data/columns/callbacks below are not needed.
   */
  tools?: GridTool[];

  /* ── Standalone use (4.6.x style) ── */
  data?: T[];
  columns?: WebMCPColumn[];
  rowKey?: string;
  locale?: GridToolLocale;
  onSelectRow?: (id: string) => void;
  onHighlightRows?: (ids: string[]) => void;
  onOpenRow?: (id: string) => void;

  /** Tool name prefix (default "yuktai_grid") */
  name?: string;
  /** Agent-facing descriptions per tool, e.g. { search: "Search Telugu poems…" } */
  descriptions?: CreateGridToolsOptions["descriptions"];

  /** Called whenever the registration status changes */
  onStatusChange?: (status: WebMCPStatus) => void;

  /**
   * WebMCP origin trial token for your site (Chrome). Without it, WebMCP works
   * only where the browser already enables it (flag, extension, later Chrome).
   */
  originTrialToken?: string;
};

/** Signature of a tool list — changes only when names/descriptions/schemas change. */
function signatureOf(tools: GridTool[]): string {
  return JSON.stringify(tools.map((t) => [t.name, t.title, t.description, t.inputSchema]));
}

export function YuktaiGridWebMCP<T extends Record<string, unknown>>({
  tools: toolsProp,
  data = [],
  columns = [],
  rowKey,
  locale,
  onSelectRow,
  onHighlightRows,
  onOpenRow,
  name = "yuktai_grid",
  descriptions,
  onStatusChange,
  originTrialToken,
}: YuktaiGridWebMCPProps<T>) {
  // Standalone mode: build the tools here from the 4.6.x-style props
  const tools = useMemo<GridTool[]>(() => {
    if (toolsProp) return toolsProp;
    const context: GridToolContext<T> = {
      data,
      columns: columns as GridToolColumn[],
      rowKey,
      locale,
      onSelectRow,
      onHighlightRows,
      onOpenRow,
    };
    return createGridTools(context, { name, descriptions });
  }, [toolsProp, data, columns, rowKey, locale, onSelectRow, onHighlightRows, onOpenRow, name, descriptions]);

  // Registered tools always run the LATEST tool (fresh data), via this ref
  const latestTools = useRef(tools);
  latestTools.current = tools;

  const statusCallback = useRef(onStatusChange);
  statusCallback.current = onStatusChange;

  // Previous registration round; a new round waits for it (no overlapping names)
  const previousRound = useRef<Promise<void>>(Promise.resolve());

  const signature = signatureOf(tools);

  useEffect(() => {
    let handle: GridWebMCPHandle | null = null;
    let cancelled = false;

    // The next round starts only after the previous one has finished (and been
    // unregistered), so a tool name is never registered twice at once.
    const round = previousRound.current.then(() => {
      if (cancelled) return;
      handle = registerGridWebMCP(() => latestTools.current, {
        onStatusChange: (status) => statusCallback.current?.(status),
        originTrialToken,
      });
      return handle.done;
    });
    previousRound.current = round.catch(() => undefined);

    // Aborting unregisters this round's tools
    return () => {
      cancelled = true;
      handle?.unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, originTrialToken]);

  return null;
}

export default YuktaiGridWebMCP;