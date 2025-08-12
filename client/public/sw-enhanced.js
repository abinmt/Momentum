// Enhanced Service Worker for Momentum PWA - Phase 2.4
const CACHE_NAME = 'momentum-static-v3';
const DYNAMIC_CACHE = 'momentum-dynamic-v3';
const API_CACHE = 'momentum-api-v3';
const IMAGE_CACHE = 'momentum-images-v1';
const OFFLINE_DB = 'momentum-offline';

// Advanced cache configuration
const CACHE_CONFIG = {
  maxEntries: {
    dynamic: 50,
    api: 100,
    images: 30
  },
  maxAge: {
    static: 7 * 24 * 60 * 60 * 1000,   // 7 days
    dynamic: 3 * 24 * 60 * 60 * 1000,  // 3 days
    api: 1 * 60 * 60 * 1000,           // 1 hour
    images: 7 * 24 * 60 * 60 * 1000    // 7 days
  }
};

// Assets to cache immediately with priority levels
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json'
];

const IMPORTANT_ASSETS = [
  '/offline.html',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Network-first patterns for dynamic content
const NETWORK_FIRST_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/notifications\//
];

// Cache-first patterns for static resources
const CACHE_FIRST_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot)$/,
  /\/icon-.*\.svg$/
];

// Install event with progressive caching
self.addEventListener('install', (event) => {
  console.log('SW: Installing enhanced service worker v3');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets first
      caches.open(CACHE_NAME).then(cache => {
        console.log('SW: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      // Cache important assets in background
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('SW: Caching important assets');
        return cache.addAll(IMPORTANT_ASSETS).catch(err => {
          console.warn('SW: Some important assets failed to cache', err);
        });
      }),
      // Initialize offline database
      initOfflineDB()
    ])
  );
  
  self.skipWaiting();
});

// Activation with cache cleanup
self.addEventListener('activate', (event) => {
  console.log('SW: Activating enhanced service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      // Claim all clients
      self.clients.claim(),
      // Initialize background sync
      setupBackgroundSync()
    ])
  );
});

// Enhanced fetch handler with multiple strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external requests
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }
  
  // Route requests based on patterns
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (matchesPattern(url, CACHE_FIRST_PATTERNS)) {
    event.respondWith(cacheFirst(request));
  } else if (matchesPattern(url, NETWORK_FIRST_PATTERNS)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// API request handler with offline fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network first for authentication and real-time data
    if (matchesPattern(url, NETWORK_FIRST_PATTERNS)) {
      return await networkFirst(request, API_CACHE);
    }
    
    // Stale while revalidate for general API requests
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.maxAge.api)) {
      // Return cached response and update in background
      fetchAndCache(request, API_CACHE);
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request.clone(), networkResponse.clone());
      await manageCache(cache, CACHE_CONFIG.maxEntries.api);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('SW: Network failed for API request', error);
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Store failed request for background sync
    await storeFailedRequest(request);
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Request will sync when online'
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Image request handler with size optimization
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request.clone(), networkResponse.clone());
      await manageCache(cache, CACHE_CONFIG.maxEntries.images);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('SW: Failed to fetch image', error);
    // Return placeholder or cached fallback
    return new Response('', { status: 404 });
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.maxAge.static)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request.clone(), networkResponse.clone());
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request.clone(), networkResponse.clone());
    await manageCache(cache, CACHE_CONFIG.maxEntries.dynamic);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    const cache = caches.open(DYNAMIC_CACHE);
    cache.then(c => c.put(request, response.clone()));
    return response;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncFailedRequests());
  } else if (event.tag === 'habit-reminder') {
    event.waitUntil(sendScheduledNotifications());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received', event);
  
  const options = {
    body: 'Keep your momentum going!',
    icon: '/icon-192x192.svg',
    badge: '/icon-192x192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.svg'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.title = payload.title || 'Momentum';
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title || 'Momentum', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification click received', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  } else if (event.action !== 'close') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Utility functions
function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url.pathname));
}

function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

function isExpired(response, maxAge) {
  const date = new Date(response.headers.get('date'));
  return Date.now() - date.getTime() > maxAge;
}

async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('SW: Background fetch failed', error);
  }
}

async function manageCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const oldestKeys = keys.slice(0, keys.length - maxEntries);
    await Promise.all(oldestKeys.map(key => cache.delete(key)));
  }
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  await Promise.all(
    cacheNames
      .filter(name => !validCaches.includes(name))
      .map(name => {
        console.log('SW: Deleting old cache', name);
        return caches.delete(name);
      })
  );
}

async function initOfflineDB() {
  // Initialize IndexedDB for offline data storage
  console.log('SW: Initializing offline database');
  // Implementation would use IndexedDB API
}

async function setupBackgroundSync() {
  console.log('SW: Setting up background sync');
}

async function storeFailedRequest(request) {
  console.log('SW: Storing failed request for sync', request.url);
  // Store in IndexedDB for later sync
}

async function syncFailedRequests() {
  console.log('SW: Syncing failed requests');
  // Retrieve and retry failed requests
}

async function sendScheduledNotifications() {
  console.log('SW: Sending scheduled notifications');
  // Check for scheduled habit reminders
}