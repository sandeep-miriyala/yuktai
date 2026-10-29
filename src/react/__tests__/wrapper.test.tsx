// @vitest-environment happy-dom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

// No AI model in tests: the 💬 retrieval-first flow must work without one
vi.mock("../../core/ai/transformers-rag", () => ({
  isTransformersSupported: () => false,
  getModelLoadStatus: () => "idle",
  answerFromContext: vi.fn(),
  askPageWithTransformers: vi.fn(),
}))

import { YuktAIWrapper, type YuktAIWrapperProps } from "../YuktAIWrapper"
import { loadRagCore } from "../../agentic/rust/ragEngine"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | null = null
let host: HTMLElement

function mount(props: Omit<YuktAIWrapperProps, "children">) {
  host = document.createElement("div")
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(createElement(YuktAIWrapper, { ...props, children: createElement("main", { id: "page" }) })))
}

const labels = () =>
  Array.from(host.querySelectorAll("button[aria-label]"))
    .map((b) => b.getAttribute("aria-label")!)
    .filter((l) => /^(Open|Ask a question|Show yuktai|Hide yuktai)/.test(l))

const A11Y = "Open accessibility preferences"
const RAG = "Ask a question about this page"
const AGENT = "Open AI agent"
const VIBE = "Open Vibe Coder"
const SHOW = "Show yuktai tools"
const HIDE = "Hide yuktai tools"

const click = (label: string) => act(() => (host.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement).click())

beforeAll(async () => {
  await loadRagCore()
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  host?.remove()
  document.body.innerHTML = ""
  localStorage.clear()
  document.documentElement.removeAttribute("data-yuktai-tools")
})

describe("legacy mode (no v5.3.9 props): exactly as before", () => {
  it("shows ♿ only by default", () => {
    mount({})
    expect(labels()).toEqual([A11Y])
  })

  it("showAgent also shows ⚡ Vibe Coder, like before", () => {
    mount({ showRag: true, showAgent: true })
    expect(labels().sort()).toEqual([A11Y, AGENT, RAG, VIBE].sort())
  })
})

describe("opt-in mode: only what the developer enables", () => {
  it("shows only the buttons that are turned on", () => {
    mount({ showRag: true, showAccessibility: false })
    expect(labels()).toEqual([RAG])
  })

  it("Vibe Coder no longer depends on showAgent", () => {
    mount({ showAgent: true, showVibeCoder: false, showAccessibility: true })
    expect(labels().sort()).toEqual([A11Y, AGENT].sort())
  })

  it("stacks enabled buttons with no gaps", () => {
    mount({ showAccessibility: true, showVibeCoder: true })
    const bottom = (l: string) => (host.querySelector(`button[aria-label="${l}"]`) as HTMLElement).style.bottom
    expect(bottom(A11Y)).toBe("24px")
    expect(bottom(VIBE)).toBe("84px")
  })
})

describe("launcher", () => {
  it("hides everything behind one button, toggles, remembers, and closes with Esc", () => {
    mount({ launcher: true, showAccessibility: true, showRag: true, showAgent: true, showVibeCoder: true, engine: "rust" })
    expect(labels()).toEqual([SHOW])
    expect(document.documentElement.getAttribute("data-yuktai-tools")).toBe("closed")

    click(SHOW)
    expect(labels().sort()).toEqual([A11Y, AGENT, HIDE, RAG, VIBE].sort())
    expect(localStorage.getItem("yuktai-tools-open")).toBe("1")
    expect(host.querySelector(`button[aria-label="${HIDE}"]`)!.getAttribute("aria-expanded")).toBe("true")
    const bottom = (l: string) => (host.querySelector(`button[aria-label="${l}"]`) as HTMLElement).style.bottom
    expect([bottom(HIDE), bottom(A11Y), bottom(RAG), bottom(AGENT), bottom(VIBE)]).toEqual(["24px", "84px", "144px", "204px", "264px"])

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })))
    expect(labels()).toEqual([SHOW])
    expect(localStorage.getItem("yuktai-tools-open")).toBe("0")
  })

  it("opens on load when the visitor left it open", () => {
    localStorage.setItem("yuktai-tools-open", "1")
    mount({ launcher: true, showAccessibility: true })
    expect(labels().sort()).toEqual([A11Y, HIDE].sort())
  })

  it("closing the launcher closes an open panel", () => {
    mount({ launcher: true, showRag: true, engine: "rust" })
    click(SHOW)
    click(RAG)
    expect(host.querySelector('[role="dialog"][aria-label="Ask this page"]')).not.toBeNull()
    click(HIDE)
    expect(host.querySelector('[role="dialog"]')).toBeNull()
  })
})

describe("💬 Ask page with engine=\"rust\"", () => {
  it("answers from the page with Rust, shows sources and time, no model needed", async () => {
    document.body.innerHTML = `
      <article>
        <h1>Sri Yagnavalkya Jayanti</h1>
        <p>యాజ్ఞవల్క్య జయంతి ఉత్సవాలు హైదరాబాదులో జరుగుతాయి. Registration closes on 10 November.</p>
        <h2>Volunteers</h2>
        <p>Volunteers meet at the temple hall at 6 am.</p>
      </article>`
    mount({ showRag: true, engine: "rust" })
    click(RAG)
    const dialog = () => host.querySelector('[role="dialog"][aria-label="Ask this page"]') as HTMLElement
    expect(dialog().textContent).toMatch(/Rust page search · On device/)

    const input = dialog().querySelector("input") as HTMLInputElement
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
    act(() => {
      setValue.call(input, "When does registration close?")
      input.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      ;(dialog().querySelector('button[aria-label="Submit question"]') as HTMLButtonElement).click()
      await new Promise((r) => setTimeout(r, 50))
    })
    const text = dialog().textContent!
    expect(text).toMatch(/Registration closes on 10 November/)
    expect(text).toMatch(/From this page/)
    expect(text).toMatch(/Found in .* ms · Rust · on device/)
  })
})

describe("💬 with Gemini Nano + engine=\"rust\"", () => {
  it("gives the model only the passages Rust found, then shows the AI answer", async () => {
    const prompts: string[] = []
    const w = window as unknown as { LanguageModel?: unknown }
    w.LanguageModel = {
      availability: async () => "available",
      create: async () => ({
        prompt: async (p: string) => {
          prompts.push(p)
          return "Registration closes on **10 November**."
        },
        destroy: () => {},
      }),
    }
    document.body.innerHTML = `
      <article>
        <h1>Sri Yagnavalkya Jayanti</h1>
        <p>Registration closes on 10 November.</p>
        <h2>Food</h2>
        <p>Prasadam is served after the evening programme in the dining hall.</p>
      </article>`
    mount({ showRag: true, engine: "rust" })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1000)) // AI detection runs after 800 ms
    })
    click(RAG)
    const dialog = () => host.querySelector('[role="dialog"][aria-label="Ask this page"]') as HTMLElement
    expect(dialog().textContent).toMatch(/Rust page search \+ Gemini Nano/)
    const input = dialog().querySelector("input") as HTMLInputElement
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
    act(() => {
      setValue.call(input, "When does registration close?")
      input.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      ;(dialog().querySelector('button[aria-label="Submit question"]') as HTMLButtonElement).click()
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(prompts).toHaveLength(1)
    expect(prompts[0]).toMatch(/Registration closes on 10 November/)
    expect(prompts[0]).not.toMatch(/Prasadam/) // only the passage Rust found, not the whole page
    expect(dialog().textContent).toMatch(/Registration closes on 10 November\./)
    expect(dialog().textContent).toMatch(/answer written by AI/)
    delete w.LanguageModel
  })
})

describe("🛠 page tools (showPageTools, v5.3.11)", () => {
  const TOOLS = "Open page tools"
  const bottomOf = (label: string) => (host.querySelector(`button[aria-label="${label}"]`) as HTMLElement).style.bottom

  it("adds 🛠 without changing which other buttons show", () => {
    mount({ showPageTools: true })
    expect(labels().sort()).toEqual([A11Y, TOOLS].sort())
    expect(bottomOf(A11Y)).toBe("24px")
    expect(bottomOf(TOOLS)).toBe("84px")
  })

  it("sits above the highest button in opt-in mode", () => {
    mount({ showAccessibility: true, showRag: true, showPageTools: true })
    expect(bottomOf(A11Y)).toBe("24px")
    expect(bottomOf(RAG)).toBe("84px")
    expect(bottomOf(TOOLS)).toBe("144px")
  })

  it("is hidden until the launcher opens", () => {
    mount({ launcher: true, showAccessibility: true, showPageTools: true })
    expect(labels()).toEqual([SHOW])
    click(SHOW)
    expect(labels()).toContain(TOOLS)
    expect(bottomOf(TOOLS)).toBe("144px")
  })

  it("opens the panel on the chosen tab and runs the QA report", () => {
    mount({ showPageTools: true, pageToolsTab: "qa" })
    click(TOOLS)
    const dialog = host.querySelector('[role="dialog"][aria-label="yuktai page tools"]')
    expect(dialog).not.toBeNull()
    expect(host.querySelector(`button[aria-label="${TOOLS}"]`)!.getAttribute("aria-expanded")).toBe("true")
    const tabs = Array.from(dialog!.querySelectorAll('[role="tab"]')).map((t) => t.textContent)
    expect(tabs).toEqual(["Copilot", "QA report", "Forms", "Design", "Ask page", "Voice"])
    expect(dialog!.querySelector('[role="tab"][aria-selected="true"]')!.textContent).toBe("QA report")
    const run = Array.from(dialog!.querySelectorAll("button")).find((b) => b.textContent === "Run QA check")!
    act(() => run.click())
    expect(dialog!.textContent).toMatch(/(PASS|FAIL) — \d+ of 15 checks passed/)
  })

  it("closes with ✕, with Escape, and when another panel opens", () => {
    mount({ showPageTools: true })
    const dialog = () => host.querySelector('[aria-label="yuktai page tools"]')
    click(TOOLS)
    click("Close page tools")
    expect(dialog()).toBeNull()
    click(TOOLS)
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })) })
    expect(dialog()).toBeNull()
    click(TOOLS)
    click(A11Y)
    expect(dialog()).toBeNull()
  })
})
