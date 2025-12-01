'use client';

import { useEffect, useCallback } from 'react';

export default function ServiceWorkerRegistration() {
  const handleUpdate = useCallback((registration: ServiceWorkerRegistration) => {
    const newWorker = registration.waiting;
    
    if (newWorker) {
      // Tell the new service worker to skip waiting and activate
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to get fresh content
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Get base path for GitHub Pages deployment
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      
      // Register service worker
      navigator.serviceWorker
        .register(`${basePath}/sw.js`)
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration.scope);

          // Check if there's already a waiting worker (update available)
          if (registration.waiting) {
            console.log('[App] Update available, activating new service worker...');
            handleUpdate(registration);
            return;
          }

          // Listen for new service worker installing
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[App] New service worker installing...');
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, auto-update
                    console.log('[App] New content available, updating...');
                    handleUpdate(registration);
                  } else {
                    // First install, content is cached for offline
                    console.log('[App] Content cached for offline use');
                  }
                }
              });
            }
          });

          // Periodically check for updates (every 60 seconds)
          setInterval(() => {
            registration.update();
          }, 60 * 1000);
        })
        .catch((error) => {
          console.error('[App] Service Worker registration failed:', error);
        });

      // Handle page becoming visible - check for updates
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.ready.then((registration) => {
            registration.update();
          });
        }
      });
    }
  }, [handleUpdate]);

  return null;
}
