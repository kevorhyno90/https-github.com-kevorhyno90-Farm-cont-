import React, { useEffect, useState, useRef } from 'react';
import { realtimeDb, auth } from '../firebase';
import { ref, set, get, child, onValue } from 'firebase/database';
import { Cloud, CloudOff, RefreshCw, Smartphone, Key, Check, X, ArrowUpRight, ArrowDownLeft, ShieldCheck, Copy, CheckCheck } from 'lucide-react';
import { executeSmartMerge } from '../utils/syncHelper';
import { nativeSetItem } from '../utils/nativeStorage';
import { REMOTE_SYNC_APPLIED_EVENT } from '../context/FarmContext';
import { motion, AnimatePresence } from 'motion/react';

const CLOUD_SYNC_PREF_KEY = 'jr_farm_cloud_sync_enabled';
const CLOUD_SYNC_KEY_STORAGE = 'jr_farm_cloud_sync_key';

// Unique device session ID to identify self-updates vs remote updates
const LOCAL_DEVICE_ID = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

export function FirebaseSyncer() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [farmId, setFarmId] = useState<string>('default_farm_001');
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

  // Direct P2P fast transfer modal state
  const [showP2pCode, setShowP2pCode] = useState(false);
  const [p2pExportCode, setP2pExportCode] = useState('');
  const [p2pImportCode, setP2pImportCode] = useState('');
  const [copyDone, setCopyDone] = useState(false);

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
  const lastRemoteUpdatedRef = useRef<string>('');
  const canUseCloud = userCloudSyncEnabled && isDeviceOnline && !!realtimeDb;

  const computeEffectiveFarmId = (user: any, key: string) => {
    const cleanKey = key.trim().toLowerCase();
    if (cleanKey) return cleanKey;
    if (user?.uid) return user.uid;
    return 'default_farm_001';
  };

  const buildAllFarmPayload = (): Record<string, any> => {
    const databasePayload: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('jr_farm_') && key !== 'jr_farm_cloud_last_synced_at') {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            databasePayload[key] = JSON.parse(raw);
          } catch {
            databasePayload[key] = raw;
          }
        }
      }
    }
    return databasePayload;
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

  // Track auth state reactively
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      const savedKey = localStorage.getItem(CLOUD_SYNC_KEY_STORAGE) || '';
      const id = computeEffectiveFarmId(user, savedKey);
      console.log(`[RTDB Sync] Auth/Room resolved: ${id}`);
      setFarmId(id);
    });
    return () => unsubscribe();
  }, []);

  // Push local changes to cloud
  const pushToCloud = async (isManual = false) => {
    if (isSyncingRef.current && !isManual) return;
    if (!farmId || !canUseCloud || !realtimeDb) return;
    try {
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      const databasePayload = buildAllFarmPayload();
      const nowIso = new Date().toISOString();
      lastRemoteUpdatedRef.current = nowIso;

      const roomRef = ref(realtimeDb, `cloudSyncRooms/${farmId}`);
      await set(roomRef, {
        database: databasePayload,
        updatedAt: nowIso,
        senderDeviceId: LOCAL_DEVICE_ID
      });

      setSyncStatus('success');
      setLastSync(new Date());

      if (isManual) {
        setSyncToast('Uploaded all farm records to cloud successfully!');
        setTimeout(() => setSyncToast(null), 3500);
      }

      setTimeout(() => setSyncStatus('idle'), 2500);
    } catch (err) {
      console.error("[RTDB Sync] Push Error:", err);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Manual pull from cloud
  const pullFromCloud = async () => {
    if (!farmId || !canUseCloud || !realtimeDb) return;
    try {
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      const dbRef = ref(realtimeDb);
      const snapshot = await get(child(dbRef, `cloudSyncRooms/${farmId}`));

      if (snapshot.exists()) {
        const reply = snapshot.val();
        if (reply && reply.database && typeof reply.database === 'object') {
          const mergedPayload = executeSmartMerge(reply.database, 'merge');

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
        }
      } else {
        setSyncToast(`Cloud room "${farmId}" is empty. Push from your phone first.`);
        setTimeout(() => setSyncToast(null), 3500);
      }
      setTimeout(() => setSyncStatus('idle'), 2500);
    } catch (err) {
      console.error("[RTDB Sync] Pull Error:", err);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Debounced push listener whenever local state changes
  useEffect(() => {
    if (!farmId || !canUseCloud) return;
    console.log(`[RTDB Sync] Syncer Active on Room: ${farmId}`);
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleLocalUpdate = () => {
      clearTimeout(timeoutId);
      // Fast 600ms debounce
      timeoutId = setTimeout(() => {
        pushToCloud(false);
      }, 600);
    };

    // If phone screen locks or user switches apps, push immediately
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
  }, [farmId, canUseCloud]);

  // Real-time listener: receives updates from other device automatically
  useEffect(() => {
    if (!farmId || !canUseCloud || !realtimeDb) return;
    const roomRef = ref(realtimeDb, `cloudSyncRooms/${farmId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (isSyncingRef.current) return;
      if (!snapshot.exists()) return;

      const reply = snapshot.val();
      if (!reply || !reply.database || typeof reply.database !== 'object') return;

      // Ignore echoes from this same device
      if (reply.senderDeviceId === LOCAL_DEVICE_ID) return;
      if (reply.updatedAt && reply.updatedAt === lastRemoteUpdatedRef.current) return;

      lastRemoteUpdatedRef.current = reply.updatedAt || new Date().toISOString();

      try {
        isSyncingRef.current = true;
        setSyncStatus('syncing');

        const mergedPayload = executeSmartMerge(reply.database, 'merge');

        // Apply merged records to local storage using nativeSetItem
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
        setTimeout(() => setSyncStatus('idle'), 2500);
      } catch (e) {
        console.error("[RTDB Sync] Merge error from snapshot", e);
        setSyncStatus('error');
      } finally {
        isSyncingRef.current = false;
      }
    }, (err) => {
      console.error("[RTDB Sync] Listener error:", err);
      setSyncStatus('error');
    });

    return () => {
      unsubscribe();
    };
  }, [farmId, canUseCloud, realtimeDb]);

  const handleSaveRoomKey = () => {
    const clean = tempKeyInput.trim().toLowerCase();
    localStorage.setItem(CLOUD_SYNC_KEY_STORAGE, clean);
    setCloudSyncKey(clean);
    const newId = computeEffectiveFarmId(currentUser, clean);
    setFarmId(newId);
    window.dispatchEvent(new Event('jr-farm-room-sync-state-updated'));
    setSyncToast(`Connected to room: "${clean || 'default_farm_001'}"`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleGenerateP2pCode = () => {
    try {
      const payload = buildAllFarmPayload();
      const jsonStr = JSON.stringify(payload);
      // Simple base64 encoding for instant copy-paste transfer
      const code = btoa(unescape(encodeURIComponent(jsonStr)));
      setP2pExportCode(code);
      setShowP2pCode(true);
    } catch (e) {
      alert("Error generating transfer code");
    }
  };

  const handleApplyP2pCode = () => {
    try {
      if (!p2pImportCode.trim()) return;
      const jsonStr = decodeURIComponent(escape(atob(p2pImportCode.trim())));
      const payload = JSON.parse(jsonStr);
      if (typeof payload !== 'object') throw new Error('Invalid code');

      const merged = executeSmartMerge(payload, 'merge');
      Object.entries(merged).forEach(([k, v]) => {
        nativeSetItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
      window.dispatchEvent(new Event(REMOTE_SYNC_APPLIED_EVENT));
      setSyncToast('Direct code data imported successfully!');
      setIsModalOpen(false);
      setP2pImportCode('');
    } catch (e) {
      alert("Invalid transfer code. Please check and try again.");
    }
  };

  const currentRoomDisplay = cloudSyncKey
    ? `Room Key: ${cloudSyncKey}`
    : currentUser?.email
    ? `Google: ${currentUser.email}`
    : 'Default Farm Room (default_farm_001)';

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
          !canUseCloud
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
        {!canUseCloud ? (
          <CloudOff size={22} />
        ) : syncStatus === 'syncing' ? (
          <RefreshCw className="animate-spin" size={22} />
        ) : syncStatus === 'error' ? (
          <CloudOff size={22} />
        ) : (
          <Cloud size={22} />
        )}

        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-2.5 font-semibold text-xs">
          {!canUseCloud
            ? 'Sync Off'
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-800/80 rounded-xl">
                    <Cloud size={20} className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Cross-Device Sync Center</h3>
                    <p className="text-emerald-100 text-xs">Phone ↔ PC Live Auto-Sync</p>
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
              <div className="p-6 space-y-4 overflow-y-auto">
                {/* Active Status Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Connection Status:</span>
                    <span className="flex items-center font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      {canUseCloud ? 'Active & Auto-Syncing' : 'Device Offline'}
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

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                    <Smartphone size={14} />
                    <span>How to connect Phone & PC:</span>
                  </div>
                  <p className="text-amber-800/90 leading-relaxed">
                    Enter the <strong>same Room Key</strong> (e.g. <code className="bg-amber-100 px-1 rounded font-bold">myfarm</code>) below on both Phone and PC.
                  </p>
                </div>

                {/* Room Key Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                    <Key size={14} className="text-emerald-600" />
                    <span>Sync Room Key:</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tempKeyInput}
                      onChange={(e) => setTempKeyInput(e.target.value)}
                      placeholder="e.g. myfarm"
                      className="flex-1 text-sm border border-gray-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveRoomKey}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm"
                    >
                      <Check size={14} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* Manual Push / Fetch Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => pushToCloud(true)}
                    disabled={!canUseCloud || syncStatus === 'syncing'}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                  >
                    <ArrowUpRight size={15} />
                    <span>Push to Cloud</span>
                  </button>

                  <button
                    onClick={pullFromCloud}
                    disabled={!canUseCloud || syncStatus === 'syncing'}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <ArrowDownLeft size={15} />
                    <span>Fetch from Cloud</span>
                  </button>
                </div>

                {/* Direct Instant Transfer Code (Fail-safe) */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Direct Share Code (Fail-Safe)</span>
                    <button
                      onClick={() => setShowP2pCode(!showP2pCode)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      {showP2pCode ? 'Hide' : 'Show Code'}
                    </button>
                  </div>

                  {showP2pCode && (
                    <div className="space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600 font-medium">1. On Phone: Generate Code</span>
                          <button
                            onClick={handleGenerateP2pCode}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-0.5 rounded text-[11px] font-semibold"
                          >
                            Generate Code
                          </button>
                        </div>
                        {p2pExportCode && (
                          <div className="relative">
                            <textarea
                              readOnly
                              rows={2}
                              value={p2pExportCode}
                              className="w-full text-[10px] font-mono bg-white p-2 border border-gray-200 rounded-lg break-all resize-none"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(p2pExportCode);
                                setCopyDone(true);
                                setTimeout(() => setCopyDone(false), 2000);
                              }}
                              className="absolute top-1.5 right-1.5 bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"
                              title="Copy Code"
                            >
                              {copyDone ? <CheckCheck size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium block mb-1">2. On PC: Paste Code to Load</span>
                        <div className="flex space-x-1.5">
                          <input
                            type="text"
                            placeholder="Paste code from phone here..."
                            value={p2pImportCode}
                            onChange={(e) => setP2pImportCode(e.target.value)}
                            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                          />
                          <button
                            onClick={handleApplyP2pCode}
                            disabled={!p2pImportCode.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center space-x-1 text-gray-600">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Realtime Database active</span>
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
