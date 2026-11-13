"use client"
// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/assistant/next — for Next.js (App Router) and React.
//
//   // app/layout.tsx
//   import { YuktaiAssistant } from "@yuktishaalaa/assistant/next"
//   <body>{children}<YuktaiAssistant features={["ask", "a11y"]} level="AA" /></body>
//
// The Assistant's code (custom elements) is loaded in the browser only, after
// hydration, so server rendering never touches HTMLElement and the server
// HTML and the first client render stay identical. Unmount removes everything.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react"
import type { Assistant, AssistantConfig } from "./index"

export function YuktaiAssistant(props: AssistantConfig) {
  const key = JSON.stringify(props)
  useEffect(() => {
    let assistant: Assistant | null = null
    let gone = false
    import("@yuktishaalaa/assistant").then(({ mountAssistant }) => {
      if (!gone) assistant = mountAssistant(props)
    })
    return () => {
      gone = true
      assistant?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

export default YuktaiAssistant
export type { AssistantConfig } from "./index"
