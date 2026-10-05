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

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        const safeUpdate = () => {
          if (typeof navigator !== 'undefined' && navigator.onLine) {
            registration.update().catch(() => {});
          }
        };

        safeUpdate();

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            safeUpdate();
          }
        });
        window.addEventListener('focus', () => {
          safeUpdate();
        });

        // Periodic update check every 60s when online
        setInterval(() => {
          safeUpdate();
        }, 60 * 1000);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error('ServiceWorker registration error:', err);
      });
  });

  // Automatically refresh when a new service worker activates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
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
export const IMMEDIATE_SYNC_EVENT = 'local-storage-update-immediate';
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
  let hasDeletions = false;

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
              hasDeletions = true;
              const existingDeletedRaw = localStorage.getItem('jr_farm_deleted_records');
              const existingDeleted: string[] = existingDeletedRaw ? JSON.parse(existingDeletedRaw) : [];
              const combined = Array.from(new Set([...existingDeleted, ...deleted]))
                .filter(kId => !newKeys.has(kId))
                .slice(-2000);
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

  // If there were actual record deletions, trigger immediate push to cloud (0ms delay)
  if (hasDeletions) {
    window.dispatchEvent(new Event(IMMEDIATE_SYNC_EVENT));
  } else if (hasChanges) {
    scheduleSyncDispatch();
  }
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key: string) {
  if (key.startsWith('jr_farm_') && key !== 'jr_farm_deleted_records' && key !== 'jr_farm_cloud_last_synced_at') {
    try {
      const oldVal = localStorage.getItem(key);
      if (oldVal) {
        try {
          const oldArr = JSON.parse(oldVal);
          if (Array.isArray(oldArr)) {
            const deleted = oldArr.map(x => getItemKey(x, key)).filter(Boolean);
            if (deleted.length > 0) {
              const existingDeletedRaw = localStorage.getItem('jr_farm_deleted_records');
              const existingDeleted: string[] = existingDeletedRaw ? JSON.parse(existingDeletedRaw) : [];
              const combined = Array.from(new Set([...existingDeleted, ...deleted])).slice(-2000);
              nativeSetItem('jr_farm_deleted_records', JSON.stringify(combined));
              window.dispatchEvent(new Event(IMMEDIATE_SYNC_EVENT));
            }
          }
        } catch {}
      }
    } catch {}
  }
  originalRemoveItem.call(localStorage, key);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

