// Offline: ఒక్కసారి తెరిస్తే వేదిక దగ్గర network లేకపోయినా వివరాలు కనిపిస్తాయి.
// కొత్త version వచ్చినప్పుడు page ను దానంతట అదే reload చేయదు; తర్వాతి సారి తెరిచినప్పుడు కొత్తది.
const CACHE = "shubhalekha-__VERSION__";
const FILES = __FILES__;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("shubhalekha-") && k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // బయటి links (Maps, WhatsApp) కి జోక్యం లేదు
  // ముందు network (తాజా వివరాలు), అది లేకపోతే cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./")))
  );
});
