// Popup: open the Assistant, open Ask, or keep it on for this site.
const $ = (id) => document.getElementById(id)
const status = (t) => ($("status").textContent = t)

;(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const web = /^https?:/.test(tab?.url || "")
  const origin = web ? new URL(tab.url).origin : ""
  if (origin) $("site").textContent = new URL(tab.url).host
  if (!web) {
    for (const id of ["open", "ask", "always"]) $(id).disabled = true
    status("This page can't be changed by extensions (browser or store pages).")
    return
  }
  $("always").checked = await chrome.runtime.sendMessage({ type: "always-get", origin })

  const go = async (action) => {
    const r = await chrome.runtime.sendMessage({ type: "inject", tab, action })
    if (r?.ok) window.close()
    else status("YuktAI can't run on this page.")
  }
  $("open").addEventListener("click", () => go("open"))
  $("ask").addEventListener("click", () => go("ask"))
  $("always").addEventListener("change", async (e) => {
    const on = e.target.checked
    if (on) {
      // must be asked from the click itself
      const granted = await chrome.permissions.request({ origins: [origin + "/*"] })
      if (!granted) {
        e.target.checked = false
        status("Not switched on: permission was not given.")
        return
      }
    }
    await chrome.runtime.sendMessage({ type: "always-set", origin, on })
    status(on ? "On for this site. It starts on every page here." : "Off for this site.")
  })
})()
