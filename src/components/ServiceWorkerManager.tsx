'use client';

import { useEffect } from 'react';

export default function ServiceWorkerManager() {
  useEffect(() => {
    // Unregister service workers in development to prevent caching issues
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log('Unregistered service worker in development mode');
          });
        });
      }
    }
  }, []);

  return null;
}
