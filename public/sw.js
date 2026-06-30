// Simple Service Worker for PWA Installation support (Pure Vanilla Javascript)
const CACHE_NAME = 'emc-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/emc-logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// A simple, non-interfering fetch listener so the browser handles all redirects, 
// CORS, and page requests natively without throwing "redirect mode is not follow" errors.
self.addEventListener('fetch', (event) => {
  // No-op to satisfy PWA requirements while leaving network requests intact
});
