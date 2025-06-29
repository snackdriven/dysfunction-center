// Service Worker for Executive Dysfunction Center
// Provides offline functionality and caching strategies

const CACHE_NAME = 'edc-v1.0.0';
const STATIC_CACHE = 'edc-static-v1.0.0';
const DYNAMIC_CACHE = 'edc-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Core pages for offline access
  '/dashboard',
  '/tasks',
  '/habits',
  '/mood',
  '/journal',
  '/calendar'
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /^\/api\/tasks/,
  /^\/api\/habits/,
  /^\/api\/mood/,
  /^\/api\/journal/,
  /^\/api\/preferences/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAssets(request));
  } else {
    // HTML pages - Stale While Revalidate
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this API endpoint should be cached
  const shouldCache = CACHEABLE_API_PATTERNS.some(pattern => 
    pattern.test(url.pathname)
  );
  
  if (!shouldCache) {
    return fetch(request);
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Add offline indicator to response headers
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-By', 'service-worker-cache');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Return offline fallback for essential data
    return createOfflineFallback(request.url);
  }
}

// Handle static assets with Cache First strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle page requests with Stale While Revalidate strategy
async function handlePageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in the background
    fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then(c => c.put(request, networkResponse));
        }
      })
      .catch(() => {
        // Network failed, but we already have cached version
      });
    
    return cachedResponse;
  }
  
  try {
    // No cached version, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed and no cache available
    return createOfflinePage();
  }
}

// Create offline fallback responses
function createOfflineFallback(url) {
  if (url.includes('/api/tasks')) {
    return new Response(JSON.stringify({
      tasks: [],
      offline: true,
      message: 'Tasks not available offline'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.includes('/api/habits')) {
    return new Response(JSON.stringify({
      habits: [],
      offline: true,
      message: 'Habits not available offline'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.includes('/api/mood')) {
    return new Response(JSON.stringify({
      entries: [],
      offline: true,
      message: 'Mood data not available offline'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    offline: true,
    message: 'Data not available offline'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Create offline page
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Executive Dysfunction Center - Offline</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          text-align: center;
          padding: 2rem;
          background: #f8fafc;
          color: #374151;
        }
        .container {
          max-width: 400px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 1.5rem; line-height: 1.6; }
        .button {
          background: #6366f1;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>Don't worry! You can still access your cached data and continue working on your executive dysfunction management.</p>
        <a href="/" class="button">Go to Dashboard</a>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline tasks
    await syncOfflineData('tasks');
    await syncOfflineData('habits');
    await syncOfflineData('mood');
    await syncOfflineData('journal');
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncOfflineData(dataType) {
  // Get offline data from IndexedDB and sync with server
  // This would integrate with your offline storage implementation
  console.log(`[SW] Syncing ${dataType} data...`);
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service worker loaded successfully');
