const CACHE_NAME = 'stride-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful, clone and cache the response
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a generic offline response for API calls
              return new Response(
                JSON.stringify({ 
                  message: 'You are offline. Please check your connection.',
                  offline: true 
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // If it's a successful response for a GET request, cache it
            if (response.ok && request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // For navigation requests, return the cached index.html
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            // For other requests, return a generic offline response
            return new Response(
              'You are offline. Please check your connection.',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' }
              }
            );
          });
      })
  );
});

// Background sync for offline task updates
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: 'Time to complete your daily habits!',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-192.png',
    tag: 'habit-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Tasks'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Stride Reminder';
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Stride Reminder', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for habit reminders
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'habit-reminder') {
    event.waitUntil(checkAndSendReminders());
  }
});

// Helper function to sync offline task updates
async function syncTasks() {
  try {
    console.log('Syncing offline task updates...');
    
    // Get offline task updates from IndexedDB or localStorage
    const offlineUpdates = await getOfflineTaskUpdates();
    
    for (const update of offlineUpdates) {
      try {
        await fetch('/api/tasks/' + update.taskId + '/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(update.data)
        });
        
        // Remove from offline storage after successful sync
        await removeOfflineUpdate(update.id);
        console.log('Synced offline update:', update.id);
      } catch (error) {
        console.error('Failed to sync update:', update.id, error);
      }
    }
    
    console.log('Offline sync completed');
  } catch (error) {
    console.error('Error during offline sync:', error);
  }
}

// Helper function to check and send habit reminders
async function checkAndSendReminders() {
  try {
    console.log('Checking for habit reminders...');
    
    // This would typically check user's reminder settings
    // and send notifications for overdue habits
    const now = new Date();
    const currentHour = now.getHours();
    
    // Example: Send reminder at 9 AM and 6 PM
    if (currentHour === 9 || currentHour === 18) {
      await self.registration.showNotification('Stride Reminder', {
        body: 'Don\'t forget to complete your daily habits!',
        icon: '/manifest-icon-192.png',
        tag: 'daily-reminder'
      });
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// Placeholder functions for offline storage
async function getOfflineTaskUpdates() {
  // This would interface with IndexedDB to get offline updates
  return [];
}

async function removeOfflineUpdate(id) {
  // This would remove the synced update from IndexedDB
  console.log('Removing offline update:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_TASK_UPDATE') {
    // Cache task update for offline sync
    cacheTaskUpdate(event.data.payload);
  }
});

async function cacheTaskUpdate(updateData) {
  // This would store the task update in IndexedDB for later sync
  console.log('Caching task update for offline sync:', updateData);
}
