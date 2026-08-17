const CACHE_NAME = "my-journey-v3";

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

  const url = new URL(event.request.url);

  // IMPORTANT:
  // Only handle requests belonging to this website.
  // Do NOT intercept raw.githubusercontent.com,
  // YouTube, APIs, or other external resources.
  if (url.origin !== self.location.origin) {
    return;
  }

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
