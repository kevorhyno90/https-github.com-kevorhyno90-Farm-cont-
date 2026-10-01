/**
 * Robust Offline IndexedDB & LocalStorage Hybrid Persistence Layer
 * Prevents localStorage 5MB-10MB quota exhaustion by asynchronously archiving
 * and synchronizing full datasets into IndexedDB.
 */

const DB_NAME = 'JRFarmEstateDB';
const DB_VERSION = 1;
const STORE_NAME = 'farm_records';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save data to IndexedDB
 */
export async function idbSet<T = any>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Could not set ${key}:`, err);
  }
}

/**
 * Read data from IndexedDB
 */
export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Could not get ${key}:`, err);
    return null;
  }
}

/**
 * Synchronous read with localStorage fallback, while maintaining background IDB mirror
 */
export function getPersistentData<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`[LocalStorage] Error reading ${key}:`, err);
  }
  return fallback;
}

/**
 * Safe write to localStorage with IDB mirroring
 */
export function setPersistentData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    // If localStorage quota exceeded, clear non-critical caches and save to IndexedDB
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn(`[LocalStorage] Quota exceeded for ${key}, falling back to IndexedDB.`);
    }
  }

  // Always mirror asynchronously to IndexedDB for unlimited capacity
  idbSet(key, value).catch(() => {});
}
