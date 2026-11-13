import type { ReactNode } from "react"
import { YuktaiAssistant } from "@yuktishaalaa/assistant/next"

export const metadata = { title: "YuktAI Assistant: Next.js" }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // no lang here on purpose: YuktAI finds it from the text (or write lang="te" yourself)
    <html>
      <body>
        {children}
        <YuktaiAssistant features={["ask", "a11y"]} level="AA" />
      </body>
    </html>
  )
}
