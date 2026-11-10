// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest"
import { createGridTools } from "../gridTools"
import { addOriginTrial, getModelContext, registerGridWebMCP, toWebMCPResult, type ModelContextTool } from "../webmcp"

type Row = { id: string; name: string }
const columns = [{ key: "name", label: "Name", type: "text" as const }]

function tools(data: Row[]) {
  return createGridTools<Row>(
    { data, columns, rowKey: "id", onFiltersChange: () => {}, onSortChange: () => {}, onSelectRow: () => {} },
    { name: "t" }
  )
}

/** A fake browser modelContext that records every registration. */
function fakeContext() {
  const seen: { tool: ModelContextTool; signal?: AbortSignal }[] = []
  return {
    seen,
    mc: {
      registerTool: async (tool: ModelContextTool, opts?: { signal?: AbortSignal }) => {
        seen.push({ tool, signal: opts?.signal })
      },
    },
  }
}

const doc = document as Document & { modelContext?: unknown }
const nav = navigator as Navigator & { modelContext?: unknown }

afterEach(() => {
  delete doc.modelContext
  delete nav.modelContext
  vi.useRealTimers()
  document.head.querySelectorAll("meta[http-equiv='origin-trial']").forEach((m) => m.remove())
})

describe("grid WebMCP", () => {
  it("returns JSON strings, never objects", async () => {
    const { seen, mc } = fakeContext()
    doc.modelContext = mc
    const h = registerGridWebMCP(tools([{ id: "1", name: "Asha" }]))
    await h.done
    expect(h.status.state).toBe("ready")
    const search = seen.find((s) => s.tool.name === "t_search")!.tool
    const out = await search.execute({ query: "Asha" })
    expect(typeof out).toBe("string")
    expect(JSON.parse(out)).toMatchObject({ success: true })
    expect(out).toContain("Asha")
    h.unregister()
  })

  it("marks read-only tools and tools that return row text", async () => {
    const { seen, mc } = fakeContext()
    doc.modelContext = mc
    const h = registerGridWebMCP(tools([{ id: "1", name: "Asha" }]))
    await h.done
    const byName = Object.fromEntries(seen.map((s) => [s.tool.name, s.tool.annotations]))
    expect(byName.t_search).toEqual({ readOnlyHint: true, untrustedContentHint: true })
    expect(byName.t_count).toEqual({ readOnlyHint: true, untrustedContentHint: false })
    expect(byName.t_filter).toEqual({ readOnlyHint: false, untrustedContentHint: false })
    h.unregister()
  })

  it("falls back to navigator.modelContext", async () => {
    const { seen, mc } = fakeContext()
    nav.modelContext = mc
    expect(getModelContext()).toBe(mc)
    const h = registerGridWebMCP(tools([]))
    await h.done
    expect(h.status.state).toBe("ready")
    expect(seen.length).toBeGreaterThan(0)
    h.unregister()
  })

  it("reports unsupported, then registers when WebMCP arrives late", async () => {
    vi.useFakeTimers()
    const states: string[] = []
    const h = registerGridWebMCP(tools([]), { onStatusChange: (s) => states.push(s.state) })
    expect(h.status.state).toBe("unsupported")
    const { mc } = fakeContext()
    doc.modelContext = mc
    await vi.advanceTimersByTimeAsync(300)
    await h.done
    expect(states).toEqual(["unsupported", "registering", "ready"])
    h.unregister()
  })

  it("stays unsupported (and finishes) when WebMCP never arrives", async () => {
    vi.useFakeTimers()
    const h = registerGridWebMCP(tools([]))
    await vi.advanceTimersByTimeAsync(6000)
    await h.done
    expect(h.status.state).toBe("unsupported")
  })

  it("unregister aborts the registration signal", async () => {
    const { seen, mc } = fakeContext()
    doc.modelContext = mc
    const h = registerGridWebMCP(tools([]))
    await h.done
    expect(seen[0].signal?.aborted).toBe(false)
    h.unregister()
    expect(seen.every((s) => s.signal?.aborted)).toBe(true)
  })

  it("uses the latest data without registering again", async () => {
    const { seen, mc } = fakeContext()
    doc.modelContext = mc
    let list = tools([{ id: "1", name: "Asha" }])
    const h = registerGridWebMCP(() => list)
    await h.done
    const count = seen.find((s) => s.tool.name === "t_count")!.tool
    list = tools([{ id: "1", name: "Asha" }, { id: "2", name: "Bala" }])
    expect(JSON.parse(await count.execute({})).data).toBe(2)
    expect(seen.filter((s) => s.tool.name === "t_count").length).toBe(1)
    h.unregister()
  })

  it("honours the agent's cancel signal", async () => {
    const { seen, mc } = fakeContext()
    doc.modelContext = mc
    const h = registerGridWebMCP(tools([]))
    await h.done
    const ctrl = new AbortController()
    ctrl.abort()
    const out = await seen[0].tool.execute({}, { signal: ctrl.signal })
    expect(JSON.parse(out)).toMatchObject({ success: false, message: "Cancelled by the agent." })
    h.unregister()
  })

  it("adds the origin trial token once", () => {
    addOriginTrial("TOKEN")
    addOriginTrial("TOKEN")
    expect(document.head.querySelectorAll("meta[http-equiv='origin-trial'][content='TOKEN']").length).toBe(1)
  })

  it("never throws on results that cannot be stringified", () => {
    const loop: Record<string, unknown> = {}
    loop.self = loop
    expect(JSON.parse(toWebMCPResult(loop))).toMatchObject({ success: false })
  })
})
