import React, { useEffect, useState, useRef } from 'react';
import { db, auth, isFirestoreSyncEnabled } from '../firebase';
import { collection, doc, writeBatch, onSnapshot, getDocs } from 'firebase/firestore';
import { Cloud, CloudOff, RefreshCw, Smartphone, Laptop, Key, Check, X, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { executeSmartMerge } from '../utils/syncHelper';
import { nativeSetItem } from '../utils/nativeStorage';
import { REMOTE_SYNC_APPLIED_EVENT } from '../context/FarmContext';
import { motion, AnimatePresence } from 'motion/react';

const CLOUD_SYNC_PREF_KEY = 'jr_farm_cloud_sync_enabled';
const CLOUD_SYNC_KEY_STORAGE = 'jr_farm_cloud_sync_key';

export function FirebaseSyncer() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cloudSyncKey, setCloudSyncKey] = useState<string>(() => {
    try {
      return localStorage.getItem(CLOUD_SYNC_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const [firestoreUnavailable, setFirestoreUnavailable] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [userCloudSyncEnabled, setUserCloudSyncEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(CLOUD_SYNC_PREF_KEY);
      return raw !== 'false';
    } catch {
      return true;
    }
  });

  const isSyncingRef = useRef(false);
  const canUseFirestore = isFirestoreSyncEnabled && userCloudSyncEnabled && isDeviceOnline && !!db && !firestoreUnavailable;

  const cloudSyncDisabledReason = !isFirestoreSyncEnabled
    ? 'Disabled by config'
    : !userCloudSyncEnabled
    ? 'Disabled by user'
    : !isDeviceOnline
    ? 'Device offline'
    : firestoreUnavailable
    ? 'Firestore unavailable'
    : !db
    ? 'Firestore not initialized'
    : null;

  const computeEffectiveFarmId = (user: any, key: string) => {
    const cleanKey = key.trim().toLowerCase();
    if (cleanKey) return `room_${cleanKey}`;
    if (user?.uid) return user.uid;
    return 'default_farm_001';
  };

  useEffect(() => {
    const handleOnline = () => setIsDeviceOnline(true);
    const handleOffline = () => setIsDeviceOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const refreshPreference = () => {
      try {
        setUserCloudSyncEnabled(localStorage.getItem(CLOUD_SYNC_PREF_KEY) !== 'false');
      } catch (_) {
        setUserCloudSyncEnabled(true);
      }
    };

    window.addEventListener('storage', refreshPreference);
    window.addEventListener('jr-farm-sync-pref-updated', refreshPreference as EventListener);
    return () => {
      window.removeEventListener('storage', refreshPreference);
      window.removeEventListener('jr-farm-sync-pref-updated', refreshPreference as EventListener);
    };
  }, []);

  // Listen for sync key changes from BackupCenter or other tabs
  useEffect(() => {
    const handleKeyUpdate = () => {
      try {
        const savedKey = localStorage.getItem(CLOUD_SYNC_KEY_STORAGE) || '';
        setCloudSyncKey(savedKey);
        setFarmId(computeEffectiveFarmId(currentUser, savedKey));
      } catch {}
    };

    window.addEventListener('storage', handleKeyUpdate);
    window.addEventListener('jr-farm-room-sync-state-updated', handleKeyUpdate);
    return () => {
      window.removeEventListener('storage', handleKeyUpdate);
      window.removeEventListener('jr-farm-room-sync-state-updated', handleKeyUpdate);
    };
  }, [currentUser]);

  // Track auth state reactively and compute effective farmId
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      const savedKey = localStorage.getItem(CLOUD_SYNC_KEY_STORAGE) || '';
      const id = computeEffectiveFarmId(user, savedKey);
      console.log(`[Sync] Auth/Room resolved. Using FARM_ID: ${id}`);
      setFarmId(id);
    });
    return () => unsubscribe();
  }, []);

  // Push local changes to cloud
  const pushToCloud = async (isManual = false) => {
    if (isSyncingRef.current && !isManual) return;
    if (!farmId || !canUseFirestore || !db) return;
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

      if (isManual) {
        setSyncToast('Uploaded all farm records to cloud successfully!');
        setTimeout(() => setSyncToast(null), 3500);
      }

      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error("Firebase Push Error:", err);
      if ((err as any)?.code === 'not-found') {
        setFirestoreUnavailable(true);
      }
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Manual pull from cloud
  const pullFromCloud = async () => {
    if (!farmId || !canUseFirestore || !db) return;
    try {
      isSyncingRef.current = true;
      setSyncStatus('syncing');
      const storageRef = collection(db, `farmData/${farmId}/storage`);
      const snapshot = await getDocs(storageRef);

      if (!snapshot.empty) {
        const cloudPayload: Record<string, any> = {};
        snapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          const key = docSnap.id;
          if (docData && docData.data) {
            try {
              cloudPayload[key] = JSON.parse(docData.data);
            } catch {
              cloudPayload[key] = docData.data;
            }
          }
        });

        const mergedPayload = executeSmartMerge(cloudPayload, 'merge');
        Object.entries(mergedPayload).forEach(([k, v]) => {
          const stringVal = typeof v === 'string' ? v : JSON.stringify(v);
          nativeSetItem(k, stringVal);
        });

        // Trigger immediate React state re-hydration
        window.dispatchEvent(new Event(REMOTE_SYNC_APPLIED_EVENT));
        setLastSync(new Date());
        setSyncStatus('success');
        setSyncToast('Fetched latest breeding and farm data from cloud!');
        setTimeout(() => setSyncToast(null), 3500);
      } else {
        setSyncToast('Cloud room is currently empty. Push from your phone first.');
        setTimeout(() => setSyncToast(null), 3500);
      }
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error("Firebase Pull Error:", err);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Debounced push listener whenever local state changes
  useEffect(() => {
    if (!farmId || !canUseFirestore) return;
    console.log(`[Sync] Syncer Mounted. Listening to database room: ${farmId}`);
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleLocalUpdate = () => {
      clearTimeout(timeoutId);
      // Fast 600ms debounce for responsive sync
      timeoutId = setTimeout(() => {
        pushToCloud(false);
      }, 600);
    };

    // If user locks their phone or switches tabs, flush push immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearTimeout(timeoutId);
        pushToCloud(false);
      }
    };

    window.addEventListener('local-storage-update', handleLocalUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => pushToCloud(false));

    return () => {
      window.removeEventListener('local-storage-update', handleLocalUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [farmId, canUseFirestore]);

  // Real-time Firestore snapshot listener: receives updates from phone to PC
  useEffect(() => {
    if (!farmId || !canUseFirestore || !db) return;
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

            // Apply merged records to local storage using nativeSetItem to prevent push-back echo
            Object.entries(mergedPayload).forEach(([k, v]) => {
              const stringVal = typeof v === 'string' ? v : JSON.stringify(v);
              nativeSetItem(k, stringVal);
            });

            // CRITICAL FIX: Instantly notify FarmContext to reload state into React memory!
            window.dispatchEvent(new Event(REMOTE_SYNC_APPLIED_EVENT));

            setSyncStatus('success');
            setLastSync(new Date());
            setSyncToast('⚡ New record auto-synced from phone!');
            setTimeout(() => setSyncToast(null), 4000);
            setTimeout(() => setSyncStatus('idle'), 3000);
          } catch (e) {
            console.error("Merge error from snapshot", e);
            setSyncStatus('error');
          } finally {
            isSyncingRef.current = false;
          }
        }
      }
    }, (err) => {
      console.error("Snapshot error:", err);
      if ((err as any)?.code === 'not-found') {
        setFirestoreUnavailable(true);
      }
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [farmId, canUseFirestore, db]);

  const handleSaveRoomKey = () => {
    const clean = tempKeyInput.trim().toLowerCase();
    localStorage.setItem(CLOUD_SYNC_KEY_STORAGE, clean);
    setCloudSyncKey(clean);
    const newId = computeEffectiveFarmId(currentUser, clean);
    setFarmId(newId);
    window.dispatchEvent(new Event('jr-farm-room-sync-state-updated'));
    setSyncToast(`Connected to room: "${clean || 'Default'}"`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const currentRoomDisplay = cloudSyncKey
    ? `Room Key: ${cloudSyncKey}`
    : currentUser?.email
    ? `Google: ${currentUser.email}`
    : 'Default Shared Farm (default_farm_001)';

  return (
    <>
      {/* Toast Alert for incoming real-time syncs */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white backdrop-blur border border-emerald-500/50 px-5 py-2.5 rounded-full shadow-2xl z-[100] flex items-center space-x-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-semibold text-xs text-emerald-300">{syncToast}</span>
            <button onClick={() => setSyncToast(null)} className="text-gray-400 hover:text-white pl-2">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Syncer Button */}
      <motion.button
        drag
        dragMomentum={false}
        onClick={() => {
          setTempKeyInput(cloudSyncKey);
          setIsModalOpen(true);
        }}
        className={`fixed bottom-6 right-6 p-3.5 rounded-full shadow-2xl transition-all z-50 flex items-center justify-center cursor-pointer border ${
          !canUseFirestore
            ? 'bg-gray-800 text-gray-400 border-gray-700'
            : syncStatus === 'syncing'
            ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
            : syncStatus === 'error'
            ? 'bg-rose-600 text-white border-rose-400'
            : syncStatus === 'success'
            ? 'bg-emerald-600 text-white border-emerald-400'
            : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'
        } group`}
        title="Cross-Device Cloud Sync Center"
      >
        {!canUseFirestore ? (
          <CloudOff size={22} />
        ) : syncStatus === 'syncing' ? (
          <RefreshCw className="animate-spin" size={22} />
        ) : syncStatus === 'error' ? (
          <CloudOff size={22} />
        ) : (
          <Cloud size={22} />
        )}

        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-2.5 font-semibold text-xs">
          {!canUseFirestore
            ? `Sync Off (${cloudSyncDisabledReason || 'Offline'})`
            : syncStatus === 'syncing'
            ? 'Syncing...'
            : syncStatus === 'error'
            ? 'Sync Error'
            : syncStatus === 'success'
            ? 'Synced!'
            : lastSync
            ? `Synced ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Cloud Sync'}
        </span>
      </motion.button>

      {/* Cross-Device Sync Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-800/80 rounded-xl">
                    <Cloud size={20} className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Cross-Device Sync Center</h3>
                    <p className="text-emerald-100 text-xs">Phone ↔ PC Auto Live Sync</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Active Status Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Connection Status:</span>
                    <span className="flex items-center font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      {canUseFirestore ? 'Active & Auto-Syncing' : cloudSyncDisabledReason || 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Current Sync Room:</span>
                    <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {currentRoomDisplay}
                    </span>
                  </div>

                  {lastSync && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last Synced:</span>
                      <span>{lastSync.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Linking Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                    <Smartphone size={14} />
                    <span>How to link your Phone and PC:</span>
                  </div>
                  <p className="text-amber-800/90 leading-relaxed">
                    Set the <strong>exact same Sync Room Key</strong> below on both your Phone and PC. Any breeding record, milk log, or expense added on your phone will appear on your PC instantly!
                  </p>
                </div>

                {/* Room Key Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                    <Key size={14} className="text-emerald-600" />
                    <span>Sync Room Key (e.g., your farm name or code):</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tempKeyInput}
                      onChange={(e) => setTempKeyInput(e.target.value)}
                      placeholder="e.g. jrfarm or myfarm123"
                      className="flex-1 text-sm border border-gray-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveRoomKey}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm"
                    >
                      <Check size={14} />
                      <span>Save Key</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Leave blank to use default public room or Google login account.
                  </p>
                </div>

                {/* Manual Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => pushToCloud(true)}
                    disabled={!canUseFirestore || syncStatus === 'syncing'}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                  >
                    <ArrowUpRight size={16} />
                    <span>Push to Cloud</span>
                  </button>

                  <button
                    onClick={pullFromCloud}
                    disabled={!canUseFirestore || syncStatus === 'syncing'}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <ArrowDownLeft size={16} />
                    <span>Fetch from Cloud</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center space-x-1 text-gray-600">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Real-time continuous sync active</span>
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
