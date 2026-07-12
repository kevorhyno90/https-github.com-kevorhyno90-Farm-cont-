import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, writeBatch, onSnapshot } from 'firebase/firestore';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { executeSmartMerge } from '../utils/syncHelper';
import { nativeSetItem } from '../utils/nativeStorage';

export function FirebaseSyncer() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [farmId, setFarmId] = useState<string | null>(null);

  const isSyncingRef = useRef(false);
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);

  // Bug 1 & 4 fix: Track auth state reactively so FARM_ID is never stale
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const id = user ? user.uid : 'default_farm_001';
      console.log(`[Sync] Auth resolved. Using FARM_ID: ${id}`);
      setFarmId(id);
    });
    return () => unsubscribe();
  }, []);

  // Push local changes to cloud
  const pushToCloud = async (isManual = false) => {
    if (isSyncingRef.current && !isManual) return;
    if (!farmId) return;
    try {
      isSyncingRef.current = true;
      setSyncStatus('syncing');
      const keys = Object.keys(localStorage).filter(k => k.startsWith('jr_farm_') && k !== 'jr_farm_cloud_last_synced_at');

      const batch = writeBatch(db);

      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val) {
          const docRef = doc(db, `farmData/${farmId}/storage/${key}`);
          batch.set(docRef, {
            data: val,
            updatedAt: new Date().toISOString()
          });
        }
      }

      await batch.commit();
      setSyncStatus('success');
      setLastSync(new Date());

      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error("Firebase Push Error:", err);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Bug 4 fix: Re-subscribe to push listener whenever farmId changes
  useEffect(() => {
    if (!farmId) return;
    console.log(`[Sync] Syncer Mounted. Listening to database room: ${farmId}`);
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleLocalUpdate = () => {
      console.log("[Sync] local-storage-update event received, scheduling push...");
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("[Sync] Executing debounced push...");
        pushToCloud(false);
      }, 2000);
    };

    window.addEventListener('local-storage-update', handleLocalUpdate);
    return () => {
      window.removeEventListener('local-storage-update', handleLocalUpdate);
      clearTimeout(timeoutId);
    };
  }, [farmId]);

  // Bug 4 fix: Re-subscribe snapshot listener whenever farmId changes
  useEffect(() => {
    if (!farmId) return;
    const storageRef = collection(db, `farmData/${farmId}/storage`);

    const unsubscribe = onSnapshot(storageRef, (snapshot) => {
      console.log(`[Sync] Snapshot arrived! Contains ${snapshot.docs.length} documents.`);

      if (isSyncingRef.current) {
        console.warn("[Sync] Ignored snapshot because app is currently syncing.");
        return;
      }

      if (!snapshot.empty) {
        let hasChanges = false;
        const cloudPayload: Record<string, any> = {};

        snapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          const key = docSnap.id;

          if (docData && docData.data) {
            const cloudRaw = docData.data;
            const localRaw = localStorage.getItem(key);

            if (cloudRaw !== localRaw) {
              hasChanges = true;
            }

            try {
              cloudPayload[key] = JSON.parse(cloudRaw);
            } catch {
              cloudPayload[key] = cloudRaw;
            }
          }
        });

        if (hasChanges) {
          isSyncingRef.current = true;
          setSyncStatus('syncing');

          try {
            const mergedPayload = executeSmartMerge(cloudPayload, 'merge');

            // Bug 2 fix: Use originalSetItem to bypass the interceptor.
            // This prevents the interceptor from firing 'local-storage-update'
            // and causing an infinite push → snapshot → push loop.
            Object.entries(mergedPayload).forEach(([k, v]) => {
              const stringVal = typeof v === 'string' ? v : JSON.stringify(v);
              nativeSetItem(k, stringVal);
            });

            setSyncStatus('success');
            setLastSync(new Date());
            setShowRefreshPrompt(true);
            setTimeout(() => setSyncStatus('idle'), 3000);
          } catch (e) {
            console.error("Merge error from snapshot", e);
            setSyncStatus('error');
          } finally {
            // Bug 2 fix: Release the lock only after all writes are done (no async pushToCloud here)
            isSyncingRef.current = false;
          }
        } else {
          console.log("[Sync] Snapshot ignored because local data is already identical to cloud data.");
        }
      } else {
        console.log("[Sync] Snapshot arrived but it is empty.");
      }
    }, (err) => {
      console.error("Snapshot error:", err);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [farmId]);

  const handleManualSync = async () => {
    await pushToCloud(true);
    alert("Local data successfully backed up to the Cloud!");
    window.location.reload();
  };

  return (
    <>
      {showRefreshPrompt && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center space-x-4 animate-bounce">
          <span className="font-bold text-sm">New data synced from cloud!</span>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-black hover:bg-blue-50"
          >
            Refresh Now
          </button>
          <button
            onClick={() => setShowRefreshPrompt(false)}
            className="text-white hover:text-blue-200"
          >
            <CloudOff size={16} />
          </button>
        </div>
      )}
      <button
        onClick={handleManualSync}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all z-50 flex items-center justify-center
          ${syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
            syncStatus === 'error' ? 'bg-red-500 hover:bg-red-600' :
            syncStatus === 'success' ? 'bg-emerald-500' :
            'bg-slate-800 hover:bg-slate-700'
          } text-white group`}
        title="Cloud Sync (Click to Force Sync)"
      >
        {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" size={24} /> :
         syncStatus === 'error' ? <CloudOff size={24} /> :
         <Cloud size={24} />}

        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-3 font-bold text-sm">
          {syncStatus === 'syncing' ? 'Syncing...' :
           syncStatus === 'error' ? 'Sync Failed' :
           syncStatus === 'success' ? 'Synced!' :
           lastSync ? `Synced ${lastSync.toLocaleTimeString()}` :
           'Cloud Sync'}
        </span>
      </button>
    </>
  );
}
