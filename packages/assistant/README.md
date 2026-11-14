# YuktAI Assistant

> Web accessibility and Ask this page, in one panel. Colours, dark mode, text size, read aloud in the right voice, safe fixes, a WCAG report, and answers from the page itself. Runs on the device: no server, no key, nothing sent anywhere.

Part of **YuktAI 6.0** by Sandeep Miriyala. Built on [`@yuktishaalaa/a11y`](../a11y) and [`@yuktishaalaa/ask-page`](../ask-page).

## Three ways

| Who | What | How |
|---|---|---|
| People using websites | **Browser extension** (Chrome, Edge, Brave) | Download the zip, unzip, `chrome://extensions` → Developer mode → **Load unpacked**. Alt+Shift+Y opens it, Alt+Shift+A asks the page. |
| Any website | **Script** | Paste before `</body>` (below) |
| React and Next.js apps | **npm** | `npm install @yuktishaalaa/assistant` |

### Script (HTML, WordPress, any platform)

```html
<script>
  window.YuktaiAssistantConfig = {
    features: ["ask", "a11y"],   // Ask this page + accessibility
    level: "AA",                 // "AA" | "AAA" | "off"
    contrast: "check",           // "check" | "fix" (darken faint text)
    mode: "auto",                // "auto" (safe fixes) | "check" (report only)
    title: "YuktAI Assistant",   // panel name: your site's name
    color: "#2F43C4",            // button colour: your brand colour
    side: "right",               // "right" | "left"
    offset: 20,                  // px from the corner, or { x: 20, y: 90 } above a chat button
    panelLang: "auto",           // "auto" | "en" | "te" | "hi" (visitors can change it)
    shortcut: true,              // Alt+Shift+Y opens and closes the panel
    launcher: true,              // false: no ♿ button (open it from your own button)
    ask: { modes: ["fast", "balanced"] }  // Ask this page options
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/assistant@6/dist/assistant.global.js" defer></script>
```

No `lang` setting: the language of the page and of each part is found from the text.

### Next.js (App Router)

```tsx
// app/layout.tsx
import { YuktaiAssistant } from "@yuktishaalaa/assistant/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <YuktaiAssistant features={["ask", "a11y"]} level="AA" title="YuktAI Assistant" color="#2F43C4" />
      </body>
    </html>
  )
}
```

It mounts after hydration and removes everything on unmount.

### React

```tsx
import { useEffect } from "react"
import { mountAssistant } from "@yuktishaalaa/assistant"

useEffect(() => {
  const assistant = mountAssistant({ features: ["ask", "a11y"], level: "AA", title: "YuktAI Assistant", color: "#2F43C4" })
  return () => assistant.destroy()
}, [])
```

## Options

| Option | Values | Default |
|---|---|---|
| `features` | `"a11y"`, `"ask"` | both |
| `level` | `"AA"`, `"AAA"`, `"off"` | `"AA"` |
| `contrast` | `"check"`, `"fix"` | `"check"` |
| `mode` | `"auto"` (safe fixes), `"check"` (report only) | `"auto"` |
| `side` | `"right"`, `"left"` | `"right"` |
| `ask` | Ask this page options (`modes`, `exclude`, `webmcp`, `webmcpToken`…) | |
| `launcher` | show the ♿ button | `true` |
| `title` | panel title, e.g. your site's name | `"YuktAI Assistant"` |
| `color` | brand colour for the button and selected items, e.g. `"#B3261E"` | blue |
| `shortcut` | Alt+Shift+Y opens and closes the panel | `true` |
| `panelLang` | panel language for new visitors: `"auto"`, `"en"`, `"te"`, `"hi"` | `"auto"` |
| `offset` | px from the corner: `90`, or `{ x: 20, y: 90 }` to sit above a chat button | `20` |

A wrong option or value (a typo like `titel`, `level: "A"`, a colour that isn't one) is reported in the browser console and the default is used, so the panel never breaks.

## What visitors get

- **Accessibility tab:** go to main content, WCAG level (Off / AA / AAA), fix low contrast, reduce motion, clear focus ring, wider spacing, page language (found automatically), read the page aloud, panel language (English, తెలుగు, हिन्दी), and a report: fixed / please check / not checked.
- **Colours tab:** Default, High contrast or Soft theme; dark mode (Off / On / Device); text size 100–200%. Saved on the device only.
- **Ask tab:** Ask this page, answers with the source highlighted.

The panel is in the page's language (English, Telugu, Hindi), keyboard friendly (tabs with arrow keys, Escape closes), and passes axe (WCAG 2.2 AA rules).

## Browsers

npm and script: all modern browsers on desktop and phones. Read aloud uses the device's voices; on-device AI answers in Ask need Chrome (other browsers get page search with highlights). Extension: Chrome, Edge, Brave on desktop.

## Privacy

Only runs on a page when the visitor or site asks. The extension needs a click (or a site you switched to "Always on", which the browser asks you about for that site only). No data is collected or sent; typing areas and passwords are never read.

## License

GPL-3.0-only. © Sandeep Miriyala — Yuktishaalaa AI Lab.
