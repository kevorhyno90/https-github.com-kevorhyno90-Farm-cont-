/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Database, 
  DownloadCloud, 
  UploadCloud, 
  RefreshCw, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HardDriveUpload, 
  FileBadge,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface BackupCenterProps {
  onResetToDefaults: () => void;
  onImportFullBackup: (data: Record<string, any>) => boolean;
}

export function BackupCenter({ onResetToDefaults, onImportFullBackup }: BackupCenterProps) {
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud Sync States
  const [syncKey, setSyncKey] = useState<string>(() => localStorage.getItem('jr_farm_cloud_sync_key') || '');
  const [isSyncSaving, setIsSyncSaving] = useState(false);
  const [isSyncLoading, setIsSyncLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => localStorage.getItem('jr_farm_cloud_last_synced_at') || '');

  // Retrieve storage statistics
  const getStats = () => {
    const keys = [
      'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
      'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
      'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
      'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
      'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales',
      'jr_farm_custom_timetable', 'jr_farm_milk_outflows', 'jr_farm_tmr_mix_logs'
    ];

    let totalKeysFound = 0;
    let totalEstimatedRecords = 0;
    let totalSizeInBytes = 0;

    const keyRecords: Record<string, number> = {};

    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        totalKeysFound++;
        totalSizeInBytes += val.length * 2; // approximation for UTF-16 characters
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            totalEstimatedRecords += parsed.length;
            // Clean up name for representation
            const displayKey = k.replace('jr_farm_', '').replace('_', ' ').toUpperCase();
            keyRecords[displayKey] = parsed.length;
          }
        } catch (e) {
          totalEstimatedRecords++;
        }
      }
    });

    return {
      totalKeysFound,
      totalEstimatedRecords,
      totalSizeInBytes,
      keyRecords
    };
  };

  const stats = getStats();

  // Cloud Sync Room Saved Handler (Upload)
  const handleCloudSyncSave = async () => {
    if (!syncKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid Cloud Sync Key (e.g. your name or farm prefix).' });
      return;
    }
    const cleanKey = syncKey.trim().toLowerCase();
    if (cleanKey.length < 3) {
      setStatusMsg({ type: 'error', text: 'Cloud Sync Key must be at least 3 characters long.' });
      return;
    }

    setIsSyncSaving(true);
    setStatusMsg({ type: null, text: '' });

    try {
      const keys = [
        'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
        'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
        'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
        'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
        'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales',
        'jr_farm_custom_timetable', 'jr_farm_milk_outflows', 'jr_farm_tmr_mix_logs',
        'jr_farm_estate_settings'
      ];

      const databasePayload: Record<string, any> = {};
      keys.forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            databasePayload[k] = JSON.parse(raw);
          } catch {
            databasePayload[k] = raw;
          }
        }
      });

      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncKey: cleanKey, database: databasePayload })
      });

      const reply = await res.json();
      if (!res.ok) {
        throw new Error(reply.error || 'Server rejected synchronization request.');
      }

      // Save sync key & time
      const nowStr = new Date().toLocaleString();
      localStorage.setItem('jr_farm_cloud_sync_key', cleanKey);
      localStorage.setItem('jr_farm_cloud_last_synced_at', nowStr);
      setLastSyncedAt(nowStr);

      setStatusMsg({
        type: 'success',
        text: `📡 Success: Database synced to cloud sync room "${cleanKey}"! You can now load this database state on any page or device (e.g., PC) using the same code.`
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Cloud Sync Upload Failed: ${err.message || 'Check connection'}`
      });
    } finally {
      setIsSyncSaving(false);
    }
  };

  // Cloud Sync Room Pull Handler (Download)
  const handleCloudSyncLoad = async () => {
    if (!syncKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid Cloud Sync Key to search for and import.' });
      return;
    }
    const cleanKey = syncKey.trim().toLowerCase();
    setIsSyncLoading(true);
    setStatusMsg({ type: null, text: '' });

    try {
      const res = await fetch(`/api/sync/load/${cleanKey}`);
      const reply = await res.json();

      if (!res.ok) {
        throw new Error(reply.error || 'Room not found.');
      }

      if (!reply.database || typeof reply.database !== 'object') {
        throw new Error('Retrieved sync room contains corrupted databases.');
      }

      // Import the retrieved database state
      const success = onImportFullBackup(reply.database);
      if (success) {
        const nowStr = new Date().toLocaleString();
        localStorage.setItem('jr_farm_cloud_sync_key', cleanKey);
        localStorage.setItem('jr_farm_cloud_last_synced_at', nowStr);
        setLastSyncedAt(nowStr);

        setStatusMsg({
          type: 'success',
          text: `📡 Success: State pulled from Cloud Sync Room "${cleanKey}" successfully! Re-binding system engine...`
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Database injection refused by system validator.');
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Cloud Sync Pull Failed: ${err.message || 'Ensure room key spelling is correct.'}`
      });
    } finally {
      setIsSyncLoading(false);
    }
  };

  // Export Full JSON Snapshot
  const handleExportBackup = () => {
    setIsExporting(true);
    setStatusMsg({ type: null, text: '' });

    setTimeout(() => {
      try {
        const keys = [
          'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
          'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
          'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
          'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
          'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales'
        ];

        const backupPayload: Record<string, any> = {
          metadata: {
            app: "JR Farm Omni-Estate Platform",
            version: "1.2.0",
            exportedAt: new Date().toISOString(),
            designer: "Dr. Devin Omwenga & AI Builder",
            totalKeys: keys.length
          },
          database: {}
        };

        keys.forEach(k => {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              backupPayload.database[k] = JSON.parse(raw);
            } catch {
              backupPayload.database[k] = raw;
            }
          }
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
        const downloadAnchor = document.createElement('a');
        const d = new Date();
        const stamp = d.toISOString().split('T')[0] + '_' + d.toTimeString().split(' ')[0].replace(/:/g, '-');
        
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `jr_farm_cooperative_backup_${stamp}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setStatusMsg({
          type: 'success',
          text: `Success: High-fidelity backup bundle exported successfully! (${stats.totalEstimatedRecords} records)`
        });
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: `Export failed: ${err.message || 'Unknown state storage access error'}`
        });
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  // Upload and restore full backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMsg({ type: null, text: '' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        const parsed = JSON.parse(rawText);

        if (!parsed || typeof parsed !== 'object' || !parsed.database) {
          throw new Error("Invalid backup bundle format. Must contain metadata and database keys.");
        }

        const success = onImportFullBackup(parsed.database);
        if (success) {
          setStatusMsg({
            type: 'success',
            text: "High-fidelity backup restored successfully! Reloading system core to bind state..."
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error("Target content verification failed during database ingestion.");
        }
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: `Import failed: ${err.message || 'Invalid or corrupted JSON backup file.'}`
        });
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setStatusMsg({ type: 'error', text: 'Error reading selected file.' });
      setIsImporting(false);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerReset = () => {
    if (confirm("WARNING: Doing this will overwrite your current database with clean, beautiful preset default files. Are you sure you wish to rebuild the seed state?")) {
      setIsResetting(true);
      setTimeout(() => {
        onResetToDefaults();
        setStatusMsg({
          type: 'success',
          text: 'Database successfully seeded. Reloading system command center...'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-emerald-950 p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden shadow-lg border border-emerald-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/40 rounded-full blur-2xl -mr-20 -mt-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800 border border-green-750 text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck size={12} />
              Sovereign Storage Shield
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase font-mono">
              Database & Backup Core
            </h1>
            <p className="text-emerald-300 text-xs sm:text-sm max-w-xl">
              All ledger entries, formulations, spray journals, and herdsman logs are securely stored on-device inside your browser's Sandboxed Database. Keep copy backup snapshots to guarantee zero data loss.
            </p>
          </div>
          <div className="shrink-0">
            <Database size={80} className="text-emerald-800/60 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* State Statistics Dashboard Panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
              <Layers size={18} className="text-emerald-700" />
              Database Statistics
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                <span className="text-xs text-slate-500 font-bold block mb-1">Active Modules</span>
                <span className="text-2xl font-mono font-black text-emerald-950">
                  {stats.totalKeysFound} <span className="text-xs text-slate-400 font-normal">/ 20</span>
                </span>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                <span className="text-xs text-slate-500 font-bold block mb-1">Total Entries</span>
                <span className="text-2xl font-mono font-black text-amber-950">
                  {stats.totalEstimatedRecords}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 divide-y divide-slate-100">
              {Object.entries(stats.keyRecords).map(([name, count]) => (
                <div key={name} className="flex justify-between items-center py-2 text-xs">
                  <span className="font-semibold text-slate-600">{name}</span>
                  <span className="font-mono px-2 py-0.5 bg-slate-100 text-slate-800 rounded-lg font-bold">
                    {count} records
                  </span>
                </div>
              ))}
              {Object.keys(stats.keyRecords).length === 0 && (
                <p className="text-slate-400 text-xs italic py-4">No records written to database yet.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed font-semibold">
            Estimated storage footprint: <span className="font-mono text-slate-800">{(stats.totalSizeInBytes / 1024).toFixed(2)} KB</span> in secure Web SQL space.
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs xl:col-span-2 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-700" />
              Backup and Recovery Actions
            </h2>
            <p className="text-slate-500 text-xs font-semibold">
              Manage physical database exports and load full digital snapshots of your agricultural registry.
            </p>
          </div>

          {/* Status Message */}
          {statusMsg.text && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-650 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-650 shrink-0 mt-0.5" />
              )}
              <span className="font-semibold">{statusMsg.text}</span>
            </div>
          )}

          {/* New Cloud Sync Room Feature */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 rounded-2xl border border-emerald-800 text-white space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/10 rounded-full blur-xl -mr-10 -mt-10"></div>
            <div className="space-y-1 relative">
              <div className="inline-flex items-center gap-1 bg-amber-500 text-emerald-950 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                <RefreshCw size={10} className="animate-spin" /> Cross-Device Cloud Sync
              </div>
              <h3 className="text-base font-extrabold font-mono uppercase italic">📡 Instant PC & Mobile Transfer</h3>
              <p className="text-emerald-200 text-xs leading-relaxed max-w-2xl font-medium">
                Want to access your farm registry on your PC or another phone? Enter a custom Sync Key below to upload your data from this device, then use the same key to pull it on your other browser!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:items-end relative">
              <div className="md:col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-emerald-300 block tracking-wider">
                  Create / Load Key Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. MyKevFarm"
                  value={syncKey}
                  onChange={(e) => setSyncKey(e.target.value)}
                  className="w-full bg-emerald-1100 bg-emerald-900 border border-emerald-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 font-bold text-xs text-white placeholder-emerald-555"
                />
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCloudSyncSave}
                  disabled={isSyncSaving || isSyncLoading}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-650 disabled:bg-emerald-800/50 test-white text-white font-black hover:text-yellow-400 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSyncSaving ? <RefreshCw className="animate-spin" size={14} /> : <DownloadCloud size={14} />}
                  📡 Push State to Cloud
                </button>
                <button
                  type="button"
                  onClick={handleCloudSyncLoad}
                  disabled={isSyncSaving || isSyncLoading}
                  className="flex-1 bg-amber-505 bg-yellow-405 bg-amber-500 hover:bg-amber-400 text-emerald-955 text-emerald-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSyncLoading ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />}
                  📥 Pull State from Cloud
                </button>
              </div>
            </div>

            {lastSyncedAt && (
              <p className="text-[10px] text-emerald-300 font-semibold italic flex items-center gap-1.5 pt-1">
                <span>● Registered Room Key: <strong className="font-mono text-yellow-400 uppercase">{syncKey}</strong></span>
                <span>|</span>
                <span>Last Synced: <strong>{lastSyncedAt}</strong></span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="border border-slate-150 p-5 rounded-2xl bg-slate-50 flex flex-col justify-between">
              <div className="space-y-1.5 mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-100 text-sky-850 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  <FileJson size={12} strokeWidth={2.5} />
                  Safe Encapsulation
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Export Backup Snapshot</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Downloads a complete offline backup file (`.json`) containing all farm operations, staff configurations, and harvest financials on your machine.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <DownloadCloud size={14} />}
                Export Snapshot
              </button>
            </div>

            {/* Import */}
            <div className="border border-slate-150 p-5 rounded-2xl bg-slate-50 flex flex-col justify-between">
              <div className="space-y-1.5 mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-850 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  <HardDriveUpload size={12} strokeWidth={2.5} />
                  Database Rewrite
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Upload & Restore Database</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload an existing `.json` backup file. WARNING: This replaces all current farm data with the exact records of your uploaded file.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isImporting ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />}
                  Restore Snapshot
                </button>
              </div>
            </div>
          </div>

          {/* Preset default rebuild */}
          <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-rose-900 tracking-wider">Reconstruct Seed State</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed max-w-xl">
                Need a clean slate? This deletes any records inputted and resets the enterprise ledger to the factory preset values.
              </p>
            </div>
            <button
              onClick={triggerReset}
              disabled={isResetting}
              className="shrink-0 bg-rose-500 hover:bg-rose-600 font-black text-white text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider border-0 cursor-pointer shadow-xs transition-colors active:scale-95 disabled:opacity-50"
            >
              Reset Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
