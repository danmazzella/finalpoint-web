'use client';

import { useEffect } from 'react';

export default function ServiceWorkerManager() {
  useEffect(() => {
    // Unregister service workers in development to prevent caching issues
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            console.log('Unregistering service worker:', registration.scope);
            registration.unregister();
          });
        });
      }
    }

    // Production service worker management
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        // Register service worker with cache busting
        navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        }).then((registration) => {
          console.log('Service worker registered:', registration.scope);

          // Check for updates every time
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, force reload
                  console.log('New service worker available, reloading...');
                  window.location.reload();
                }
              });
            }
          });
        }).catch((error) => {
          console.error('Service worker registration failed:', error);
        });

        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Service worker message:', event.data);
        });

        navigator.serviceWorker.addEventListener('error', (event) => {
          console.error('Service worker error:', event);
        });
      }
    }
  }, []);

  return null;
}
