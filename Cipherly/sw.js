const CACHE = 'cipherly-v4';
const ASSETS = ['./', './index.html', './generator.html', './offline.html', './styles.css', './fonts.css', './visual-polish.css', './app.js', './theme.js', './brand-mark.svg', './manifest.webmanifest', './fonts/dm-mono-400.woff2', './fonts/dm-mono-500.woff2', './fonts/dm-sans-variable.woff2', './fonts/playfair-display-variable.woff2', './fonts/playfair-display-italic-variable.woff2', './errors/400.html', './errors/401.html', './errors/403.html', './errors/404.html', './errors/500.html', './errors/503.html'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('cipherly-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const pathname = new URL(request.url).pathname;
        const fallback = pathname.endsWith('/generator.html') ? './generator.html' : pathname.endsWith('/index.html') || pathname.endsWith('/') ? './index.html' : './offline.html';
        return (await caches.match(fallback)) || (await caches.match('./offline.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
