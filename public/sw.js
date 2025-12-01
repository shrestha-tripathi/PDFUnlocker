// Service Worker for PDF Password Remover PWA
// Version: 2.0.0
// Strategy: Network-first for all app resources to ensure fresh content

const CACHE_VERSION = 'v2';
const CACHE_NAME = `pdf-unlock-${CACHE_VERSION}`;

// Assets to pre-cache (only essential offline assets)
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching essential assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately - don't wait for old SW to finish
  self.skipWaiting();
});

// Activate event - clean up ALL old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('pdf-unlock-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Now controlling all clients');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - NETWORK-FIRST strategy for everything
// This ensures users always get the latest content when online
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except for CDN resources we need
  if (url.origin !== self.location.origin) {
    // Allow pdf.js worker from CDN with network-first
    if (url.hostname === 'unpkg.com' || url.hostname === 'cdnjs.cloudflare.com') {
      event.respondWith(networkFirst(request));
    }
    return;
  }

  // Use network-first for ALL same-origin requests
  // This ensures fresh content when online, cached content when offline
  event.respondWith(networkFirst(request));
});

/**
 * Network-first strategy:
 * 1. Try to fetch from network
 * 2. If successful, cache the response and return it
 * 3. If network fails, return cached version
 * 4. If no cache, return offline fallback
 */
async function networkFirst(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone and cache the fresh response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network returned error, try cache
    throw new Error('Network response not ok');
  } catch (error) {
    // Network failed, try to serve from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', url.pathname);
      return cachedResponse;
    }
    
    // For navigation requests, return the cached index page
    if (request.mode === 'navigate') {
      const indexResponse = await caches.match('/');
      if (indexResponse) {
        console.log('[SW] Serving cached index for navigation');
        return indexResponse;
      }
    }
    
    // No cache available, return a basic offline response
    console.log('[SW] No cache available for:', url.pathname);
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
