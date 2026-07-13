import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { nativeSetItem } from './utils/nativeStorage';
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
      })
      .catch((err) => {
        console.error('❌ ServiceWorker registration failed: ', err);
      });
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
localStorage.setItem = function(key: string, value: string) {
  let hasChanges = false;
  
  if (key.startsWith('jr_farm_') && key !== 'jr_farm_deleted_records' && key !== 'jr_farm_cloud_last_synced_at') {
    try {
      const oldVal = localStorage.getItem(key);
      // Fire for both first-time writes (oldVal === null) and changed values
      if (oldVal !== value) {
        hasChanges = true;
      }
      
      if (oldVal) {
        const oldArr = JSON.parse(oldVal);
        const newArr = JSON.parse(value);
        if (Array.isArray(oldArr) && Array.isArray(newArr)) {
          const newIds = new Set(newArr.map(x => x?.id || x?.code || x?.ref).filter(Boolean));
          const deleted = oldArr
            .map(x => x?.id || x?.code || x?.ref)
            .filter(id => id && !newIds.has(id));
          
          if (deleted.length > 0) {
             const existingDeletedRaw = localStorage.getItem('jr_farm_deleted_records');
             const existingDeleted = existingDeletedRaw ? JSON.parse(existingDeletedRaw) : [];
             const combined = Array.from(new Set([...existingDeleted, ...deleted]));
             nativeSetItem('jr_farm_deleted_records', JSON.stringify(combined));
          }
        }
      }
    } catch (e) {
      // Ignore parse errors, some items may not be JSON arrays
    }
  }
  
  nativeSetItem(key, value);

  // Dispatch event only if there were actual changes
  if (hasChanges) {
    console.log(`[Sync] Value changed for ${key}, dispatching push...`);
    window.dispatchEvent(new Event('local-storage-update'));
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

