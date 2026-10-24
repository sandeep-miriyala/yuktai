// yuktai vanilla demo — service worker.
// Same-origin files: served from cache at once, refreshed in the background
// (stale-while-revalidate), so the demo works offline after the first visit.
// Other sites (for example the XERJ badge) always go to the network.
const CACHE = "yuktai-vanilla-v5.3.2"
const CORE = [
  "./",
  "./index.html",
  "./index.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("yuktai-vanilla-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // badges and links: network only

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: request.mode === "navigate" })
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => null)
      if (cached) {
        event.waitUntil(network)
        return cached
      }
      const fresh = await network
      if (fresh) return fresh
      if (request.mode === "navigate") return (await cache.match("./index.html")) || Response.error()
      return Response.error()
    })
  )
})
