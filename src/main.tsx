import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { nativeSetItem } from './utils/nativeStorage';
import { getItemKey } from './utils/syncHelper';
import App from './App.tsx';
import './index.css';

// Guard against detached-node Range.selectNode errors thrown by third-party instrumentation scripts.
if (typeof window !== 'undefined' && typeof Range !== 'undefined') {
  const originalSelectNode = Range.prototype.selectNode;
  Range.prototype.selectNode = function(node: Node) {
    if (!node || !node.parentNode) {
      return;
    }
    return originalSelectNode.call(this, node);
  };
}

// Register PWA Service Worker for offline resilience only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('📱 ServiceWorker registration successful with scope: ', registration.scope);
        // Only check for updates when device has active internet connectivity
        const safeUpdate = () => {
          if (typeof navigator !== 'undefined' && navigator.onLine) {
            registration.update().catch(() => {});
          }
        };

        // Actively check for updates immediately upon load if online
        safeUpdate();

        // Re-check for new updates whenever the app is reopened, tab is focused, or screen wakes up
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            safeUpdate();
          }
        });
        window.addEventListener('focus', () => {
          safeUpdate();
        });

        // Periodic update check only if online
        setInterval(() => {
          safeUpdate();
        }, 60 * 1000);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('⚡ New update ready, requesting activation...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error('❌ ServiceWorker registration failed: ', err);
      });
  });

  // Automatically refresh clients when a new service worker takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('⚡ New ServiceWorker activated! Refreshing application to latest build...');
      window.location.reload();
    }
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Unregister any existing service workers in development mode to prevent caching conflicts
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('🗑️ Unregistered old service worker in dev mode');
    }
  });
}

// Global Interceptor to track deletions and trigger real-time auto-sync
let pendingSyncDispatchHandle: number | null = null;

const scheduleSyncDispatch = () => {
  if (pendingSyncDispatchHandle !== null) return;

  pendingSyncDispatchHandle = window.setTimeout(() => {
    pendingSyncDispatchHandle = null;
    window.dispatchEvent(new Event('local-storage-update'));
  }, 0);
};

localStorage.setItem = function(key: string, value: string) {
  let hasChanges = false;

  if (key.startsWith('jr_farm_') && key !== 'jr_farm_deleted_records' && key !== 'jr_farm_cloud_last_synced_at') {
    try {
      const oldVal = localStorage.getItem(key);
      if (oldVal !== value) {
        hasChanges = true;
      }

      if (oldVal && value) {
        try {
          const oldArr = JSON.parse(oldVal);
          const newArr = JSON.parse(value);
          if (Array.isArray(oldArr) && Array.isArray(newArr)) {
            const newKeys = new Set(newArr.map(x => getItemKey(x, key)).filter(Boolean));
            const deleted = oldArr
              .map(x => getItemKey(x, key))
              .filter(kId => kId && !newKeys.has(kId));

            if (deleted.length > 0) {
              const existingDeletedRaw = localStorage.getItem('jr_farm_deleted_records');
              const existingDeleted: string[] = existingDeletedRaw ? JSON.parse(existingDeletedRaw) : [];
              const combined = Array.from(new Set([...existingDeleted, ...deleted]))
                .filter(kId => !newKeys.has(kId));
              nativeSetItem('jr_farm_deleted_records', JSON.stringify(combined));
            }
          }
        } catch {
          // ignore non-JSON arrays
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  nativeSetItem(key, value);

  // Dispatch event only if there were actual changes
  if (hasChanges) {
    scheduleSyncDispatch();
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

