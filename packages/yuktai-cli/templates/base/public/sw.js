// Offline support. Pages and files are fetched from the network first and kept in a cache,
// so the app still opens without a connection. Only this site's own files are cached.
const CACHE = "yuktai-app-v3";
const scope = new URL(self.registration.scope).pathname; // "/" or "/<repo>/" on GitHub Pages

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([scope, scope + "manifest.json", scope + "icons/icon-192.png"]).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(req)) || (req.mode === "navigate" ? caches.match(scope) : undefined) || Response.error()),
  );
});
