/**
 * ExamKlar Service Worker
 * Provides offline functionality and PWA features
 */

const CACHE_NAME = 'examklar-v1.3.0';
const CACHE_STATIC_NAME = 'examklar-static-v1.3.0';
const CACHE_DYNAMIC_NAME = 'examklar-dynamic-v1.3.0';

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
    './',
    './index.html',
    './manifest.json',
    './styles/global.css',
    './styles/components.css',
    './core/utils.js',
    './core/storage.js',
    './core/app.js',
    './core/performance.js',
    './core/accessibility.js',
    './core/mobile-gestures.js',
    './core/pwa-installer.js',
    './core/browser-compatibility.js',
    // Module files for offline access
    './modules/content/index.html',
    './modules/content/content.js',
    './modules/content/content.css',
    './modules/flashcards/index.html',
    './modules/flashcards/flashcards.js',
    './modules/flashcards/flashcards.css',
    './modules/flashcards/player.html',
    './modules/quiz/index.html',
    './modules/quiz/quiz.js',
    './modules/dashboard/index.html',
    './modules/dashboard/dashboard.js',
    './modules/dashboard/dashboard.css',
    './modules/dashboard/components/progress-chart.js',
    './modules/dashboard/components/streak-counter.js',
    './modules/dashboard/components/achievements.js',
    // Advanced features
    './modules/advanced/index.html',
    './modules/advanced/advanced.js',
    './modules/advanced/advanced.css',
    './modules/advanced/tests/export-test.html',
    './modules/advanced/tests/darkmode-test.html',
    './modules/advanced/tests/search-test.html',
    // AI Assistant module
    './modules/ai-assistant/index.html',
    './modules/ai-assistant/ai-assistant.js',
    './modules/ai-assistant/ai-assistant.css',
    './modules/ai-assistant/tests/chat-test.html',
    './modules/ai-assistant/tests/ai-test.html',
    './modules/ai-assistant/tests/feedback-test.html',
    './modules/ai-assistant/tests/fallback-test.html',
    // Test pages
    './comprehensive-test.html'
];

// Dynamic cache patterns
const CACHE_DYNAMIC_PATTERNS = [
    /^.*\.(png|jpg|jpeg|svg|gif|webp)$/,
    /^.*\.(woff|woff2|ttf|eot)$/,
    /^.*\.json$/
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then((cache) => {
                console.log('[SW] Precaching static files');
                return cache.addAll(STATIC_CACHE_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static files:', error);
            })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_STATIC_NAME && 
                            cacheName !== CACHE_DYNAMIC_NAME &&
                            cacheName.startsWith('examklar-')) {
                            console.log('[SW] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (!url.origin.includes(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[SW] Serving from cache:', request.url);
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Don't cache if not ok
                        if (!networkResponse.ok) {
                            return networkResponse;
                        }
                        
                        // Check if should be dynamically cached
                        if (shouldCache(request.url)) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_DYNAMIC_NAME)
                                .then((cache) => {
                                    console.log('[SW] Caching dynamically:', request.url);
                                    cache.put(request, responseClone);
                                })
                                .catch((error) => {
                                    console.error('[SW] Dynamic caching failed:', error);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.log('[SW] Network fetch failed:', error);
                        
                        // Return offline fallback for HTML pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }
                        
                        // Return cached version if available
                        return caches.match(request);
                    });
            })
    );
});

/**
 * Background Sync for offline data
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'examklar-data-sync') {
        event.waitUntil(syncOfflineData());
    }
});

/**
 * Push notifications (for study reminders)
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Tid til din daglige læring! 📚',
        icon: './assets/icons/icon-192x192.png',
        badge: './assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Start Læring',
                icon: './assets/icons/play-icon.png'
            },
            {
                action: 'close',
                title: 'Senere',
                icon: './assets/icons/close-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('ExamKlar Påmindelse', options)
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./index.html?module=content')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('./index.html')
        );
    }
});

/**
 * Check if URL should be cached
 */
function shouldCache(url) {
    return CACHE_DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Sync offline data when back online
 */
async function syncOfflineData() {
    try {
        console.log('[SW] Syncing offline data...');
        
        // Get all clients
        const clients = await self.clients.matchAll();
        
        // Notify clients that sync is happening
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_START'
            });
        });
        
        // Simulate data sync (in real app, this would sync with server)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Notify clients that sync is complete
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE'
            });
        });
        
        console.log('[SW] Offline data sync completed');
    } catch (error) {
        console.error('[SW] Offline sync failed:', error);
        
        // Notify clients of sync failure
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_ERROR',
                error: error.message
            });
        });
    }
}

/**
 * Periodic background sync for study reminders
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'study-reminder') {
        event.waitUntil(checkStudyReminder());
    }
});

/**
 * Check if user needs study reminder
 */
async function checkStudyReminder() {
    try {
        // This would check user's study streak and send reminder if needed
        const clients = await self.clients.matchAll();
        
        if (clients.length === 0) {
            // App is not open, check if reminder is needed
            // Implementation would read from IndexedDB or cache
            console.log('[SW] Checking if study reminder is needed...');
        }
    } catch (error) {
        console.error('[SW] Study reminder check failed:', error);
    }
}

/**
 * Cache management utilities
 */
const cacheUtils = {
    /**
     * Clean old cache entries
     */
    async cleanOldCache() {
        try {
            const cache = await caches.open(CACHE_DYNAMIC_NAME);
            const requests = await cache.keys();
            
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
            
            for (const request of requests) {
                const response = await cache.match(request);
                const cachedDate = new Date(response.headers.get('date')).getTime();
                
                if (now - cachedDate > maxAge) {
                    console.log('[SW] Removing old cache entry:', request.url);
                    await cache.delete(request);
                }
            }
        } catch (error) {
            console.error('[SW] Cache cleanup failed:', error);
        }
    },
    
    /**
     * Get cache size
     */
    async getCacheSize() {
        try {
            const cacheNames = await caches.keys();
            let totalSize = 0;
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();
                
                for (const request of requests) {
                    const response = await cache.match(request);
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
            
            return totalSize;
        } catch (error) {
            console.error('[SW] Failed to calculate cache size:', error);
            return 0;
        }
    }
};

// Periodic cache cleanup (every 24 hours)
setInterval(() => {
    cacheUtils.cleanOldCache();
}, 24 * 60 * 60 * 1000);

console.log('[SW] Service Worker script loaded');