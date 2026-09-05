// Minimal service worker so Chrome treats this as an installable PWA.
// No offline caching is implemented - this just needs to exist and register.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
self.addEventListener("fetch", () => {});
