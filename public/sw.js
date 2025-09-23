// Service Worker for FinalPoint Push Notifications

const CACHE_NAME = 'finalpoint-v2'; // Increment version to clear old cache
const urlsToCache = [
    '/',
    '/dashboard',
    '/profile',
    '/picks'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Only cache the main page for now to avoid errors
                return cache.addAll(['/']);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
                // Don't fail the installation if caching fails
                return Promise.resolve();
            })
    );
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip Next.js static files and development assets
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/_next/') ||
        url.pathname.includes('localhost:3000') ||
        url.pathname.includes('localhost:3001') ||
        url.pathname.includes('localhost:3002') ||
        url.pathname.includes('localhost:3003') ||
        url.pathname.includes('localhost:3004') ||
        url.pathname.includes('localhost:3005')) {
        // Let these requests pass through to the network
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    // Return cached version
                    return response;
                }

                // Fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch error:', error);
                        // Return a fallback response for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }
                        throw error;
                    });
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {

    let notificationData = {
        title: 'FinalPoint',
        body: 'You have a new notification',
        icon: '/next.svg',
        badge: '/next.svg',
        tag: 'finalpoint-notification',
        data: {}
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/next.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/next.svg'
            }
        ],
        requireInteraction: false,
        silent: false
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
            .catch((error) => {
                console.error('Error showing notification:', error);
            })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {

    event.notification.close();

    if (event.action === 'open') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        event.notification.close();
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    }
});

// Background sync event
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background sync
            Promise.resolve()
        );
    }
});

// Message event (for communication with main thread)
self.addEventListener('message', (event) => {

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
