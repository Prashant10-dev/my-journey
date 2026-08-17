const CACHE_NAME = "my-journey-v2";

const CORE_FILES = [
  "/my-journey/",
  "/my-journey/index.html",
  "/my-journey/style.css",
  "/my-journey/script.js",
  "/my-journey/projects.html",
  "/my-journey/first-post.html",
  "/my-journey/second-post.html",
  "/my-journey/manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, copy));

          return response;
        }

        return caches.match(event.request);
      })
      .catch(() => caches.match(event.request))
  );
});
