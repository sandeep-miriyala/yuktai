// YuktAI Assistant: browser extension (Manifest V3).
//
// Privacy: runs on a page only when you ask — the toolbar popup, Alt+Shift+A,
// or a site you switched to "Always on". No data is collected or sent.
// Scripts the browser injects for an extension are not blocked by a site's
// Content Security Policy, so this works where a <script> tag cannot.

const isWebPage = (url) => /^https?:|^file:/.test(url || "")

async function run(tabId, args) {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", ...args })
  return res?.result
}

/** Puts the Assistant on the tab (once) and runs `action` on it: "open" | "ask" | "close". */
async function inject(tab, action) {
  if (!tab?.id || !isWebPage(tab.url)) return { ok: false, reason: "not-a-web-page" }
  try {
    const loaded = await run(tab.id, { func: () => !!document.querySelector("yuktai-assistant") })
    if (!loaded) {
      await run(tab.id, { func: () => { window.YuktaiAssistantConfig = Object.assign({ features: ["a11y", "ask"] }, window.YuktaiAssistantConfig) } })
      await run(tab.id, { files: ["assistant.global.js"] })
    }
    await run(tab.id, {
      args: [action],
      func: async (act) => {
        for (let i = 0; i < 40 && !window.YuktaiAssistant?.instance; i++) {
          if (window.YuktaiAssistant && document.readyState === "complete") window.YuktaiAssistant.mount()
          await new Promise((r) => setTimeout(r, 50))
        }
        const a = window.YuktaiAssistant?.instance
        if (!a) return
        if (act === "ask") a.ask()
        else if (act === "close") a.close()
        else a.open()
      },
    })
    return { ok: true }
  } catch (e) {
    // chrome:// pages, the Web Store and the PDF viewer can't be scripted
    return { ok: false, reason: "blocked" }
  }
}

const scriptId = (origin) => "yuktai-always-" + origin.replace(/[^a-z0-9]/gi, "_")

/** "Always on this site": asks the browser for this one site only, then runs on every page of it. */
async function setAlways(origin, on) {
  const id = scriptId(origin)
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] })
  if (!on) {
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [id] })
    await chrome.permissions.remove({ origins: [origin + "/*"] }).catch(() => {})
    return false
  }
  if (!existing.length) {
    await chrome.scripting.registerContentScripts([
      { id, matches: [origin + "/*"], js: ["boot.js", "assistant.global.js"], world: "MAIN", runAt: "document_idle", persistAcrossSessions: true },
    ])
  }
  return true
}

async function isAlways(origin) {
  const found = await chrome.scripting.getRegisteredContentScripts({ ids: [scriptId(origin)] })
  return found.length > 0
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  ;(async () => {
    if (msg.type === "inject") reply(await inject(msg.tab, msg.action))
    else if (msg.type === "always-get") reply(await isAlways(msg.origin))
    else if (msg.type === "always-set") reply(await setAlways(msg.origin, msg.on))
  })()
  return true
})

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "ask-page") await inject(tab, "ask")
})

// for automated tests
self.yuktaiInject = inject
