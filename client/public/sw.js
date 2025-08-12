// Service Worker for Momentum PWA - Advanced Offline Support
const CACHE_NAME = 'momentum-v2';
const STATIC_CACHE = 'momentum-static-v2';
const DYNAMIC_CACHE = 'momentum-dynamic-v2';
const API_CACHE = 'momentum-api-v2';
const OFFLINE_DB = 'momentum-offline';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth/user',
  '/api/tasks',
  '/api/settings'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      initOfflineDB()
    ])
  );
  self.skipWaiting();
});

// Enhanced fetch event with different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default handling
  event.respondWith(
    caches.match(request).then(response => 
      response || fetch(request)
    )
  );
});

// API request handler with offline fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
      
      // Store data in IndexedDB for offline access
      if (request.method === 'GET') {
        await storeDataOffline(url.pathname, await response.clone().json());
      }
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, serving from cache:', url.pathname);
    
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline data
    const offlineData = await getOfflineData(url.pathname);
    if (offlineData) {
      return new Response(JSON.stringify(offlineData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle POST/PUT/PATCH requests when offline
    if (request.method !== 'GET') {
      await queueOfflineAction(request);
      return new Response(JSON.stringify({ success: true, offline: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return error for failed requests
    return new Response(JSON.stringify({ error: 'Offline - no cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static request handler with cache-first strategy
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for document requests
    if (request.destination === 'document') {
      return await caches.match('/offline.html') || 
             await caches.match('/');
    }
    
    throw error;
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const expectedCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!expectedCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      cleanupOfflineDB()
    ])
  );
  self.clients.claim();
});

// Handle background sync for offline data sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  } else if (event.tag === 'habit-data-sync') {
    event.waitUntil(syncHabitData());
  }
});

// IndexedDB functions for offline storage
async function initOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for API responses
      if (!db.objectStoreNames.contains('api_cache')) {
        db.createObjectStore('api_cache', { keyPath: 'endpoint' });
      }
      
      // Store for offline actions (POST/PUT/PATCH)
      if (!db.objectStoreNames.contains('offline_actions')) {
        const store = db.createObjectStore('offline_actions', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store for user data
      if (!db.objectStoreNames.contains('user_data')) {
        db.createObjectStore('user_data', { keyPath: 'key' });
      }
    };
  });
}

async function storeDataOffline(endpoint, data) {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['api_cache'], 'readwrite');
    const store = transaction.objectStore('api_cache');
    
    await store.put({
      endpoint: endpoint,
      data: data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
}

async function getOfflineData(endpoint) {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['api_cache'], 'readonly');
    const store = transaction.objectStore('api_cache');
    
    return new Promise((resolve) => {
      const request = store.get(endpoint);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
}

async function queueOfflineAction(request) {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['offline_actions'], 'readwrite');
    const store = transaction.objectStore('offline_actions');
    
    const body = await request.text();
    
    await store.add({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: Date.now()
    });
    
    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await self.registration;
      await registration.sync.register('background-sync');
    }
  } catch (error) {
    console.error('Failed to queue offline action:', error);
  }
}

async function syncOfflineActions() {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['offline_actions'], 'readwrite');
    const store = transaction.objectStore('offline_actions');
    
    const actions = await new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
    
    console.log(`Syncing ${actions.length} offline actions`);
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        if (response.ok) {
          // Remove successful action from queue
          await store.delete(action.id);
          console.log('Synced offline action:', action.url);
        }
      } catch (error) {
        console.error('Failed to sync action:', action.url, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncHabitData() {
  // Sync habit completions and updates
  console.log('Syncing habit data...');
  // Implementation will be added when we implement offline habit tracking
}

async function cleanupOfflineDB() {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['api_cache'], 'readwrite');
    const store = transaction.objectStore('api_cache');
    
    // Remove data older than 7 days
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.timestamp < weekAgo) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  } catch (error) {
    console.error('Failed to cleanup offline DB:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0iIzNiODJmNiIgcng9IjI0Ii8+CiAgPHRleHQgeD0iOTYiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPk08L3RleHQ+CiAgPGNpcmNsZSBjeD0iOTYiIGN5PSI4MCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNOTYgNjAgTDk2IDQwIE04OCA2OCBMMTA0IDY4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=',
      badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0iIzNiODJmNiIgcng9IjI0Ii8+CiAgPHRleHQgeD0iOTYiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPk08L3RleHQ+CiAgPGNpcmNsZSBjeD0iOTYiIGN5PSI4MCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNOTYgNjAgTDk2IDQwIE04OCA2OCBMMTA0IDY4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'mark-complete',
          title: 'Mark Complete',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0iIzNiODJmNiIgcng9IjI0Ii8+CiAgPHRleHQgeD0iOTYiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPk08L3RleHQ+CiAgPGNpcmNsZSBjeD0iOTYiIGN5PSI4MCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNOTYgNjAgTDk2IDQwIE04OCA2OCBMMTA0IDY4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4='
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'mark-complete') {
    // Handle habit completion from notification
    event.waitUntil(
      clients.openWindow('/?action=complete&id=' + event.notification.data.habitId)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});