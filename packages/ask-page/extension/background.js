// Ask this page: Chrome extension (Manifest V3).
//
// Why an extension: a bookmarklet adds <script src="…">, which a site's
// Content Security Policy can block. Scripts the browser injects for an
// extension are not blocked by the page's CSP. Only runs when you click the
// button (activeTab): no access to any site until then, no data collected.
//
// WebMCP: the panel registers its read-only tools by itself when the browser
// supports WebMCP; the button then shows "MCP".
//
// The panel itself then adapts to the site's rules: no Web Worker → page
// thread; no WebAssembly → TypeScript search; Trusted Types → its own policy
// or plain DOM building.

const isWebPage = (url) => /^https?:|^file:/.test(url || "")

async function run(tabId, args) {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", ...args })
  return res?.result
}

async function toggle(tab) {
  if (!tab.id || !isWebPage(tab.url)) return
  try {
    const loaded = await run(tab.id, { func: () => !!document.querySelector("yuktai-ask") })
    if (!loaded) {
      await run(tab.id, { func: () => { window.YuktaiAskConfig = Object.assign({ modes: ["fast", "balanced"], developer: true }, window.YuktaiAskConfig) } })
      await run(tab.id, { files: ["ask-page.global.js"] })
    }
    await run(tab.id, {
      func: () => {
        const el = document.querySelector("yuktai-ask")
        if (el && typeof el.toggle === "function") el.toggle()
      },
    })
    // WebMCP connects by itself; show "MCP" on the button once AI agents can use the tools
    const mcp = await run(tab.id, {
      func: async () => {
        const el = document.querySelector("yuktai-ask")
        for (let i = 0; i < 30 && el?.webmcp?.state === "connecting"; i++) await new Promise((r) => setTimeout(r, 100))
        return el?.webmcp?.state ?? "unsupported"
      },
    })
    const on = mcp === "connected"
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#15803d" })
    await chrome.action.setBadgeText({ tabId: tab.id, text: on ? "MCP" : "" })
    await chrome.action.setTitle({ tabId: tab.id, title: on ? "Ask this page · WebMCP connected (AI agents can use it)" : "Ask this page (Alt+Shift+A)" })
  } catch (e) {
    // chrome:// pages, the Web Store and PDF viewer can't be scripted
    chrome.action.setBadgeText({ tabId: tab.id, text: "!" })
    chrome.action.setTitle({ tabId: tab.id, title: "Ask this page can't run on this page" })
  }
}

chrome.action.onClicked.addListener(toggle)
// for automated tests (scripts/e2e-csp.mjs)
self.askToggle = toggle
