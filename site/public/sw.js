// YuktaiDocs service worker (Next.js site): the whole site works offline after the first visit.
// The Next.js files under /_next/ are cached as they are fetched (network first).
//   • this site's files: network first, so a new release shows on the first
//     visit; the cache answers when offline or when the network takes > 4 s.
//     (Before v7 the cache came first, so a returning visitor saw the old
//     release once and needed a refresh.)
//   • the YuktAI script (jsDelivr or unpkg, a fixed version): cache first
// Bump CACHE whenever you publish a change, so visitors get the new files.
const CACHE = "yuktaidocs-v35"
// The site may live under a base path (GitHub Pages: /yuktai/). Every path below is
// relative to where this worker sits, so the same file works at / and at /yuktai/.
const BASE = new URL("./", self.location.href).pathname.replace(/\/$/, "")
const at = (p) => BASE + p
const CORE = [
  "/",
  "/accessibility/",
  "/grid/",
  "/agents/",
  "/ask/",
  "/page-tools/",
  "/nextjs/",
  "/python/",
  "/php/",
  "/jquery/",
  "/icons/",
  "/playground/",
  "/rust/",
  "/about/",
  "/create/",
  "/guide/",
  "/manifest.json",
  "/icons/favicon.svg",
  "/icons/icon-192.png",
  "/icons/favicon-32.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png"
]

self.addEventListener("install", (event) => {
  // cache: "reload" skips the browser's HTTP cache, so the new release is stored, not an old copy
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE.map((u) => new Request(at(u), { cache: "reload" }))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const old = (await caches.keys()).filter((k) => k.startsWith("yuktaidocs-") && k !== CACHE)
    await Promise.all(old.map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

const isYuktai = (url) =>
  url.startsWith("https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@") || url.startsWith("https://unpkg.com/@yuktishaalaa/yuktai@")

const timeout = (ms) => new Promise((resolve) => setTimeout(() => resolve(null), ms))

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin
  if (!sameOrigin && !isYuktai(request.url)) return // npm, GitHub, analytics, version check: network only

  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const network = fetch(request)
      .then((response) => {
        if (response && response.ok) cache.put(request, response.clone())
        return response
      })
      .catch(() => null)
    const cached = await cache.match(request, { ignoreSearch: sameOrigin })

    if (!sameOrigin) { // a fixed YuktAI version never changes: cache first
      if (cached) return cached
      return (await network) || Response.error()
    }

    // This site: network first, so updates show at once; cache when offline or slow.
    event.waitUntil(network)
    const fresh = await (cached ? Promise.race([network, timeout(4000)]) : network)
    if (fresh) return fresh
    if (cached) return cached
    if (request.mode === "navigate") return (await cache.match(at("/"))) || Response.error()
    return Response.error()
  })())
})
