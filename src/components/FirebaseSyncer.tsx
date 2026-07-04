import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

export function FirebaseSyncer() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const FARM_ID = auth.currentUser ? auth.currentUser.uid : 'default_farm_001';

  // Background Sync to Cloud
  useEffect(() => {
    const syncToCloud = async () => {
      try {
        setSyncStatus('syncing');
        const keys = Object.keys(localStorage).filter(k => k.startsWith('jr_farm_'));
        
        const batch = writeBatch(db);
        
        for (const key of keys) {
          const val = localStorage.getItem(key);
          if (val) {
            const docRef = doc(db, `farmData/${FARM_ID}/storage/${key}`);
            batch.set(docRef, { 
              data: val,
              updatedAt: new Date().toISOString()
            });
          }
        }
        
        await batch.commit();
        setSyncStatus('success');
        setLastSync(new Date());
        
        // Reset status after a few seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        console.error("Firebase Sync Error:", err);
        setSyncStatus('error');
      }
    };

    // Auto-sync every 5 minutes (300000 ms)
    const interval = setInterval(syncToCloud, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    try {
      setSyncStatus('syncing');
      
      // Attempt to restore FROM cloud first to check if cloud has data
      const storageRef = collection(db, `farmData/${FARM_ID}/storage`);
      const snapshot = await getDocs(storageRef);
      
      if (!snapshot.empty) {
        let restoredCount = 0;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data().data;
          if (data) {
            localStorage.setItem(docSnap.id, data);
            restoredCount++;
          }
        });
        
        if (restoredCount > 0) {
          alert(`Successfully restored ${restoredCount} records from the Cloud! The app will now reload.`);
          window.location.reload();
          return;
        }
      }
      
      // If cloud is empty, push local data to cloud
      const keys = Object.keys(localStorage).filter(k => k.startsWith('jr_farm_'));
      const batch = writeBatch(db);
      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val) {
          const docRef = doc(db, `farmData/${FARM_ID}/storage/${key}`);
          batch.set(docRef, { data: val, updatedAt: new Date().toISOString() });
        }
      }
      await batch.commit();
      
      setSyncStatus('success');
      setLastSync(new Date());
      setTimeout(() => setSyncStatus('idle'), 3000);
      
      alert("Local data successfully backed up to the Cloud!");
      
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      alert("Failed to connect to Firebase. Check your configuration.");
    }
  };

  return (
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
          'Cloud Sync'}
       </span>
    </button>
  );
}
