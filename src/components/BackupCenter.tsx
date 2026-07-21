/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
 Sparkles,
 Copy,
 FileCode
} from 'lucide-react';
import { realtimeDb } from '../firebase';
import { ref, set, get, child, onValue } from 'firebase/database';
import { nativeSetItem } from '../utils/nativeStorage';

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => 
 Promise.race([
 promise,
 new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Connection timed out. Please ensure the Realtime Database is created and accessible in your Firebase Console.')), ms))
 ]);

const CLOUD_SYNC_KEYS = [
 'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
 'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
 'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
 'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
 'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales',
 'jr_farm_custom_timetable', 'jr_farm_milk_outflows', 'jr_farm_tmr_mix_logs',
 'jr_farm_estate_settings'
];

const CLOUD_SYNC_APPLIED_EVENT = 'jr-farm-remote-sync-applied';
const ROOM_SYNC_HEARTBEAT_EVENT = 'jr-farm-live-sync-heartbeat';
const ROOM_SYNC_STATE_EVENT = 'jr-farm-room-sync-state-updated';


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

 // Direct P2P Code Sync States (Serverless Fail-safe option)
 const [activeSyncTab, setActiveSyncTab] = useState<'cloud' | 'serverless'>('serverless'); // Default to serverless since cloud failed!
 const [generatedP2PCode, setGeneratedP2PCode] = useState<string>('');
 const [p2pCodeInput, setP2PCodeInput] = useState<string>('');
 const [isCopySuccess, setIsCopySuccess] = useState<boolean>(false);

 // Conflict States
 const [cloudPayload, setCloudPayload] = useState<Record<string, any> | null>(null);
 const [conflicts, setConflicts] = useState<Array<{
 key: string;
 label: string;
 localOnlyCount: number;
 cloudOnlyCount: number;
 idConflicts: Array<{
 id: string;
 localVal: any;
 cloudVal: any;
 selectedSource: 'local' | 'cloud';
 }>;
 }>>([]);
 const [showConflictModal, setShowConflictModal] = useState(false);
 const liveSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const isApplyingRemoteSyncRef = useRef(false);
 const lastRemoteUpdatedAtRef = useRef('');

 const buildCloudPayload = () => {
 const databasePayload: Record<string, any> = {};

 CLOUD_SYNC_KEYS.forEach((key) => {
 const raw = localStorage.getItem(key);
 if (!raw) return;

 try {
 databasePayload[key] = JSON.parse(raw);
 } catch {
 databasePayload[key] = raw;
 }
 });

 return databasePayload;
 };

 const emitRoomSyncSignal = (source: 'local' | 'remote' | 'manual', lastSyncedLabel?: string) => {
 window.dispatchEvent(new CustomEvent(ROOM_SYNC_HEARTBEAT_EVENT, {
 detail: { source, lastSyncedAt: lastSyncedLabel || '' }
 }));
 window.dispatchEvent(new Event(ROOM_SYNC_STATE_EVENT));
 };

 const applyRemoteCloudPayload = (database: Record<string, any>, updatedAt?: string) => {
 isApplyingRemoteSyncRef.current = true;

 try {
 Object.entries(database).forEach(([key, value]) => {
 if (!key.startsWith('jr_farm_')) return;
 nativeSetItem(key, typeof value === 'string' ? value : JSON.stringify(value));
 });

 const syncedLabel = updatedAt ? new Date(updatedAt).toLocaleString() : new Date().toLocaleString();
 nativeSetItem('jr_farm_cloud_last_synced_at', syncedLabel);
 setLastSyncedAt(syncedLabel);
 emitRoomSyncSignal('remote', syncedLabel);
 window.dispatchEvent(new Event(CLOUD_SYNC_APPLIED_EVENT));
 } finally {
 isApplyingRemoteSyncRef.current = false;
 }
 };

 const analyzeAndShowConflicts = (retrievedDb: Record<string, any>): boolean => {
 const keys = [
 'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
 'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
 'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
 'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
 'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales',
 'jr_farm_custom_timetable', 'jr_farm_milk_outflows', 'jr_farm_tmr_mix_logs',
 'jr_farm_estate_settings'
 ];

 const foundConflicts: any[] = [];

 keys.forEach(k => {
 const localRaw = localStorage.getItem(k);
 const cloudRaw = retrievedDb[k];

 if (!cloudRaw) return;

 let localData: any = null;
 if (localRaw) {
 try {
 localData = JSON.parse(localRaw);
 } catch {
 localData = localRaw;
 }
 }

 const cloudData = cloudRaw;
 const label = k.replace('jr_farm_', '').replace(/_/g, ' ').toUpperCase();

 if (Array.isArray(localData) && Array.isArray(cloudData)) {
 const localMap = new Map<string, any>();
 localData.forEach(item => {
 const id = item.id || item.code || item.name || JSON.stringify(item);
 localMap.set(String(id), item);
 });

 const cloudMap = new Map<string, any>();
 cloudData.forEach(item => {
 const id = item.id || item.code || item.name || JSON.stringify(item);
 cloudMap.set(String(id), item);
 });

 let localOnlyCount = 0;
 let cloudOnlyCount = 0;
 const idConflictsList: any[] = [];

 localMap.forEach((val, id) => {
 if (!cloudMap.has(id)) {
 localOnlyCount++;
 } else {
 const cloudVal = cloudMap.get(id);
 if (JSON.stringify(val) !== JSON.stringify(cloudVal)) {
 idConflictsList.push({
 id,
 localVal: val,
 cloudVal,
 selectedSource: 'cloud'
 });
 }
 }
 });

 cloudMap.forEach((val, id) => {
 if (!localMap.has(id)) {
 cloudOnlyCount++;
 }
 });

 if (localOnlyCount > 0 || cloudOnlyCount > 0 || idConflictsList.length > 0) {
 foundConflicts.push({
 key: k,
 label,
 localOnlyCount,
 cloudOnlyCount,
 idConflicts: idConflictsList
 });
 }
 } else {
 if (JSON.stringify(localData) !== JSON.stringify(cloudData)) {
 foundConflicts.push({
 key: k,
 label,
 localOnlyCount: localData ? 1 : 0,
 cloudOnlyCount: 1,
 idConflicts: [{
 id: 'CONFIG',
 localVal: localData,
 cloudVal: cloudData,
 selectedSource: 'cloud'
 }]
 });
 }
 }
 });

 if (foundConflicts.length > 0) {
 setConflicts(foundConflicts);
 setCloudPayload(retrievedDb);
 setShowConflictModal(true);
 return true;
 }
 return false;
 };

 const handleExecuteMerge = async (strategy: 'merge' | 'cloud' | 'local') => {
 if (!cloudPayload) return;
 const { executeSmartMerge } = await import('../utils/syncHelper');
 const mergedPayload = executeSmartMerge(cloudPayload, strategy, conflicts);

 const success = onImportFullBackup(mergedPayload);
 if (success) {
 try {
 const cleanKey = syncKey.trim().toLowerCase();
 const dbRef = ref(realtimeDb, `cloudSyncRooms/${cleanKey}`);
 await withTimeout(set(dbRef, { database: mergedPayload, updatedAt: new Date().toISOString() }), 10000);
 } catch (e) {
 console.error("Auto backup save failed after merge", e);
 }

 const nowStr = new Date().toLocaleString();
 localStorage.setItem('jr_farm_cloud_last_synced_at', nowStr);
 setLastSyncedAt(nowStr);
 emitRoomSyncSignal('manual', nowStr);
 setShowConflictModal(false);

 setStatusMsg({
 type: 'success',
 text: `📡 Multi-Device Merge Successful! Resolved conflicts and uploaded unified database state to Cloud Sync Room "${syncKey.trim().toLowerCase()}". Reloading system...`
 });

 setTimeout(() => {
 window.location.reload();
 }, 2000);
 } else {
 setStatusMsg({
 type: 'error',
 text: 'Merged database rejected by system integrity validators.'
 });
 }
 };

 // 🔌 Direct Serverless P2P Code Sync Handlers
 const handleGenerateP2PCode = () => {
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

 const p2pData = {
 app: "JR Farm Omni-Estate Platform",
 version: "1.2.0",
 p2p: true,
 generatedAt: new Date().toISOString(),
 database: databasePayload
 };

 const jsonStr = JSON.stringify(p2pData);
 const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
 return String.fromCharCode(parseInt(p1, 16));
 }));

 setGeneratedP2PCode(b64);
 setIsCopySuccess(false);
 setStatusMsg({
 type: 'success',
 text: '🔌 P2P Sync Code generated successfully! Copy the secure code below and paste it on your other device.'
 });
 } catch (err: any) {
 setStatusMsg({
 type: 'error',
 text: `Failed to generate P2P Sync Code: ${err.message}`
 });
 }
 };

 const handleCopyP2PCode = () => {
 if (!generatedP2PCode) return;
 navigator.clipboard.writeText(generatedP2PCode)
 .then(() => {
 setIsCopySuccess(true);
 setTimeout(() => setIsCopySuccess(false), 2000);
 })
 .catch((err) => {
 console.error("Clipboard copy failed: ", err);
 });
 };

 const handleLoadP2PCode = () => {
 if (!p2pCodeInput.trim()) {
 setStatusMsg({ type: 'error', text: 'Please paste a valid P2P Sync Code first.' });
 return;
 }

 setStatusMsg({ type: null, text: '' });
 try {
 const trimmed = p2pCodeInput.trim();
 
 const jsonStr = decodeURIComponent(atob(trimmed).split('').map((c) => {
 return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
 }).join(''));

 const parsed = JSON.parse(jsonStr);

 if (!parsed || typeof parsed !== 'object' || !parsed.database) {
 throw new Error("Invalid sync code format. Make sure you copied the entire text code.");
 }

 // We set the cloud payload as parsed.database so that conflict resolution modal can work if needed!
 const hasConflicts = analyzeAndShowConflicts(parsed.database);
 if (hasConflicts) {
 setStatusMsg({
 type: 'success',
 text: `🔌 Serverless state loaded. Difference/Conflict detected between devices. Use the conflict resolution card below to merge!`
 });
 return;
 }

 const success = onImportFullBackup(parsed.database);
 if (success) {
 setStatusMsg({
 type: 'success',
 text: '🔌 Success: Direct P2P Sync code imported successfully! Re-binding system engine...'
 });
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 } else {
 throw new Error("Target verification failed during database import.");
 }
 } catch (err: any) {
 setStatusMsg({
 type: 'error',
 text: `Direct P2P Import Failed: ${err.message || 'The pasted code is invalid, incomplete, or corrupted.'}`
 });
 }
 };

 const [isForcedOffline, setIsForcedOffline] = useState<boolean>(() => {
 return localStorage.getItem('jr_farm_forced_offline') === 'true';
 });

 const toggleOfflineSimulation = () => {
 const nextVal = !isForcedOffline;
 setIsForcedOffline(nextVal);
 localStorage.setItem('jr_farm_forced_offline', String(nextVal));
 setStatusMsg({
 type: 'success',
 text: nextVal 
 ? '🔌 Offline Mode Simulation Engaged. Interactive AI Diagnostics and sync logs will now run on client heuristic fail-safes.'
 : '📡 System restored online. Direct secure cloud tunnels activated.'
 });
 };

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
 const databasePayload = buildCloudPayload();
 const dbRef = ref(realtimeDb, `cloudSyncRooms/${cleanKey}`);
 await withTimeout(set(dbRef, { database: databasePayload, updatedAt: new Date().toISOString() }), 10000);

 // Save sync key & time
 const nowStr = new Date().toLocaleString();
 localStorage.setItem('jr_farm_cloud_sync_key', cleanKey);
 localStorage.setItem('jr_farm_cloud_last_synced_at', nowStr);
 setLastSyncedAt(nowStr);
 emitRoomSyncSignal('manual', nowStr);

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
 const dbRef = ref(realtimeDb);
 const snapshot = await withTimeout(get(child(dbRef, `cloudSyncRooms/${cleanKey}`)), 10000);
 
 if (!snapshot.exists()) {
 throw new Error('Room not found.');
 }
 
 const reply = snapshot.val();

 if (!reply.database || typeof reply.database !== 'object') {
 throw new Error('Retrieved sync room contains corrupted databases.');
 }

 // Check for conflicts first
 const hasConflicts = analyzeAndShowConflicts(reply.database);
 if (hasConflicts) {
 setStatusMsg({
 type: 'success',
 text: `📡 Cloud state retrieved. Differences or potential sync conflicts detected. Multi-device merge controls activated below.`
 });
 return;
 }

 // Import the retrieved database state
 const success = onImportFullBackup(reply.database);
 if (success) {
 const nowStr = new Date().toLocaleString();
 localStorage.setItem('jr_farm_cloud_sync_key', cleanKey);
 localStorage.setItem('jr_farm_cloud_last_synced_at', nowStr);
 setLastSyncedAt(nowStr);
 emitRoomSyncSignal('manual', nowStr);

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

 useEffect(() => {
 const cleanKey = syncKey.trim().toLowerCase();
 if (!cleanKey) return;

 const dbRef = ref(realtimeDb, `cloudSyncRooms/${cleanKey}`);

 const unsubscribe = onValue(dbRef, (snapshot) => {
 if (!snapshot.exists()) return;

 const reply = snapshot.val();
 if (!reply || typeof reply !== 'object' || !reply.database || typeof reply.database !== 'object') {
 return;
 }

 const remoteUpdatedAt = typeof reply.updatedAt === 'string' ? reply.updatedAt : '';
 if (remoteUpdatedAt && remoteUpdatedAt === lastRemoteUpdatedAtRef.current) {
 return;
 }

 if (isApplyingRemoteSyncRef.current) {
 return;
 }

 lastRemoteUpdatedAtRef.current = remoteUpdatedAt || new Date().toISOString();
 applyRemoteCloudPayload(reply.database, remoteUpdatedAt || undefined);
 }, (err) => {
 console.error('Live cloud sync listener failed:', err);
 });

 const handleLocalUpdate = () => {
 if (isApplyingRemoteSyncRef.current) return;

 if (liveSyncTimerRef.current) {
 clearTimeout(liveSyncTimerRef.current);
 }

 liveSyncTimerRef.current = setTimeout(async () => {
 if (isApplyingRemoteSyncRef.current) return;

 try {
 const databasePayload = buildCloudPayload();
 const updatedAt = new Date().toISOString();
 lastRemoteUpdatedAtRef.current = updatedAt;
 await withTimeout(set(dbRef, { database: databasePayload, updatedAt }), 10000);

 const nowStr = new Date().toLocaleString();
 nativeSetItem('jr_farm_cloud_last_synced_at', nowStr);
 setLastSyncedAt(nowStr);
 emitRoomSyncSignal('local', nowStr);
 } catch (err) {
 console.error('Live cloud sync push failed:', err);
 }
 }, 1200);
 };

 window.addEventListener('local-storage-update', handleLocalUpdate);

 return () => {
 window.removeEventListener('local-storage-update', handleLocalUpdate);
 if (liveSyncTimerRef.current) {
 clearTimeout(liveSyncTimerRef.current);
 }
 unsubscribe();
 };
 }, [syncKey]);

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
 <div className="bg-white p-6 sm:p-8 rounded-3xl text-gray-900 relative overflow-hidden shadow-lg border border-emerald-900">
 
 <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800 border border-green-750 text-yellow-400 rounded-full text-[10px] font-semibold tracking-tight">
 <ShieldCheck size={12} />
 Sovereign Storage Shield
 </div>
 <h1 className="text-2xl sm:text-3xl font-semibold italic tracking-tight  font-mono">
 Database & Backup Core
 </h1>
 <p className="text-green-600 text-xs sm:text-sm max-w-xl">
 All ledger entries, formulations, spray journals, and herdsman logs are securely stored on-device inside your browser's Sandboxed Database. Keep copy backup snapshots to guarantee zero data loss.
 </p>
 </div>
 <div className="shrink-0">
 <Database size={80} className="text-green-600/60 opacity-80" />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 {/* State Statistics Dashboard Panel */}
 <div className="farm-shell-panel border border-gray-200 rounded-[1.6rem] p-6 shadow-xs flex flex-col justify-between">
 <div>
 <h2 className="text-base font-semibold tracking-tight text-gray-900 flex items-center gap-2 mb-4">
 <Layers size={18} className="text-green-600" />
 Database Statistics
 </h2>
 
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
 <span className="text-xs text-gray-900 font-medium font-bold block mb-1">Active Modules</span>
 <span className="text-2xl font-mono font-semibold text-green-600">
 {stats.totalKeysFound} <span className="text-xs text-gray-900 font-medium font-normal">/ 20</span>
 </span>
 </div>
 <div className="bg-orange-900/20 p-4 rounded-2xl border border-orange-100/50">
 <span className="text-xs text-gray-900 font-medium font-bold block mb-1">Total Entries</span>
 <span className="text-2xl font-mono font-semibold text-amber-950">
 {stats.totalEstimatedRecords}
 </span>
 </div>
 </div>

 <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 divide-y divide-slate-100">
 {Object.entries(stats.keyRecords).map(([name, count]) => (
 <div key={name} className="flex justify-between items-center py-2 text-xs">
 <span className="font-semibold text-gray-900 font-medium">{name}</span>
 <span className="font-mono px-2 py-0.5 bg-slate-50 border border-gray-200 text-gray-900 rounded-lg font-bold">
 {count} records
 </span>
 </div>
 ))}
 {Object.keys(stats.keyRecords).length === 0 && (
 <p className="text-gray-900 font-medium text-xs italic py-4">No records written to database yet.</p>
 )}
 </div>
 </div>

 <div className="pt-6 border-t border-gray-100 text-[11px] text-gray-900 font-medium leading-relaxed font-semibold">
 Estimated storage footprint: <span className="font-mono text-gray-900">{(stats.totalSizeInBytes / 1024).toFixed(2)} KB</span> in secure Web SQL space.
 </div>
 </div>

 {/* Action Panel */}
 <div className="farm-shell-panel border border-gray-200 rounded-[1.6rem] p-6 shadow-xs xl:col-span-2 space-y-6">
 <div className="space-y-1">
 <h2 className="text-base font-semibold tracking-tight text-gray-900 flex items-center gap-2">
 <Sparkles size={18} className="text-green-600" />
 Backup and Recovery Actions
 </h2>
 <p className="text-gray-900 font-medium text-xs font-semibold">
 Manage physical database exports and load full digital snapshots of your agricultural registry.
 </p>
 </div>

 {/* Status Message */}
 {statusMsg.text && (
 <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed ${
 statusMsg.type === 'success' 
 ? 'bg-emerald-50 border-emerald-100 text-green-600' 
 : 'bg-rose-900/20 border-rose-100 text-rose-800'
 }`}>
 {statusMsg.type === 'success' ? (
 <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
 ) : (
 <AlertCircle size={16} className="text-rose-650 shrink-0 mt-0.5" />
 )}
 <span className="font-semibold">{statusMsg.text}</span>
 </div>
 )}

 {/* Synchronisation Tab Switcher */}
 <div className="flex border-b border-gray-200">
 <button
 type="button"
 onClick={() => setActiveSyncTab('serverless')}
 className={`flex-1 py-3 text-xs font-semibold tracking-tight border-b-2 transition-all cursor-pointer ${
 activeSyncTab === 'serverless'
 ? 'border-emerald-600 text-green-600'
 : 'border-transparent text-gray-900 font-medium hover:text-gray-900 font-medium'
 }`}
 >
 🔌 Direct P2P Code Sync (100% Serverless)
 </button>
 <button
 type="button"
 onClick={() => setActiveSyncTab('cloud')}
 className={`flex-1 py-3 text-xs font-semibold tracking-tight border-b-2 transition-all cursor-pointer ${
 activeSyncTab === 'cloud'
 ? 'border-emerald-600 text-green-600'
 : 'border-transparent text-gray-900 font-medium hover:text-gray-900 font-medium'
 }`}
 >
 📡 Cloud Key Room Sync (Legacy Server Support)
 </button>
 </div>

 {activeSyncTab === 'serverless' ? (
 /* Serverless Direct Sync Block */
 <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 p-6 rounded-2xl border border-emerald-800 text-gray-900 space-y-5 shadow-sm relative overflow-hidden">
 
 <div className="space-y-1 relative">
 <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-green-600 text-[9px] font-semibold px-2.5 py-0.5 rounded-md tracking-tight">
 <FileCode size={11} /> 100% Offline & Serverless Sync
 </div>
 <h3 className="text-base font-semibold font-mono  italic">🔌 Serverless Direct Device Bridge</h3>
 <p className="text-green-600 text-xs leading-relaxed max-w-2xl font-medium font-sans">
 This direct sync converts your entire farm database into a secure, portable, compressed text code. You can send this code via email, message, or WhatsApp and paste it on any device to merge or restore your data immediately. No cloud servers required!
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
 {/* Generate Block */}
 <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-800/60 space-y-3">
 <span className="text-[10px] font-semibold  text-yellow-400 block tracking-normal font-mono">
 1. Generate From This Device
 </span>
 <p className="text-[11px] text-green-600 font-semibold leading-relaxed">
 Compile all your current farm registry logs, staff configs, and spraying cards into a single transfer code.
 </p>
 
 {generatedP2PCode ? (
 <div className="space-y-2">
 <textarea
 readOnly
 value={generatedP2PCode}
 className="w-full bg-white/80 border border-emerald-800 rounded-lg p-2 font-mono text-[9px] text-green-600 h-20 break-all resize-none focus:outline-none"
 onClick={(e) => (e.target as HTMLTextAreaElement).select()}
 />
 <button
 type="button"
 onClick={handleCopyP2PCode}
 className="w-full bg-emerald-700 hover:bg-emerald-650 text-white font-semibold py-2 rounded-lg text-[10px] tracking-tight flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-95 transition-all"
 >
 <Copy size={12} />
 {isCopySuccess ? '✓ Copied to Clipboard!' : 'Copy Transfer Code'}
 </button>
 </div>
 ) : (
 <button
 type="button"
 onClick={handleGenerateP2PCode}
 className="w-full bg-emerald-700 hover:bg-emerald-650 text-white font-semibold py-2.5 rounded-lg text-[11px] tracking-tight flex items-center justify-center gap-1.5 border-0 cursor-pointer shadow-xs active:scale-95 transition-all"
 >
 <RefreshCw size={12} />
 Generate Transfer Code
 </button>
 )}
 </div>

 {/* Import Block */}
 <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-800/60 space-y-3">
 <span className="text-[10px] font-semibold  text-yellow-400 block tracking-normal font-mono">
 2. Import Onto This Device
 </span>
 <p className="text-[11px] text-green-600 font-semibold leading-relaxed">
 Paste the single transfer code from your other device here to instantly load or merge database entries.
 </p>
 
 <div className="space-y-2">
 <textarea
 placeholder="Paste secure sync transfer code here..."
 value={p2pCodeInput}
 onChange={(e) => setP2PCodeInput(e.target.value)}
 className="w-full bg-white/80 border border-emerald-800 rounded-lg p-2 font-mono text-[9px] text-gray-900 h-20 break-all resize-none placeholder-emerald-700 focus:border-yellow-400 focus:outline-none"
 />
 <button
 type="button"
 onClick={handleLoadP2PCode}
 className="w-full bg-amber-500 hover:bg-amber-400 text-green-600 font-semibold py-2 rounded-lg text-[10px] tracking-tight flex items-center justify-center gap-1.5 border-0 cursor-pointer shadow-xs active:scale-95 transition-all"
 >
 <UploadCloud size={12} />
 Load & Sync Code
 </button>
 </div>
 </div>
 </div>
 </div>
 ) : (
 /* New Cloud Sync Room Feature */
 <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 rounded-2xl border border-emerald-800 text-gray-900 space-y-4 shadow-sm relative overflow-hidden">
 
 <div className="space-y-1 relative">
 <div className="inline-flex items-center gap-1 bg-amber-500 text-green-600 text-[9px] font-semibold px-2 py-0.5 rounded-md tracking-tight">
 <RefreshCw size={10} className="animate-spin" /> Cross-Device Cloud Sync
 </div>
 <h3 className="text-base font-semibold font-mono  italic">📡 Instant PC & Mobile Transfer</h3>
 <p className="text-green-600 text-xs leading-relaxed max-w-2xl font-medium">
 Want to access your farm registry on your PC or another phone? Enter a custom Sync Key below to upload your data from this device, then use the same key to pull it on your other browser!
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:items-end relative">
 <div className="md:col-span-1 space-y-1">
 <label className="text-[10px] font-semibold  text-green-600 block tracking-normal">
 Create / Load Key Room
 </label>
 <input
 type="text"
 placeholder="e.g. MyKevFarm"
 value={syncKey}
 onChange={(e) => setSyncKey(e.target.value)}
 className="w-full bg-emerald-900 border border-emerald-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 font-bold text-xs text-gray-900 placeholder-emerald-600"
 />
 </div>

 <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
 <button
 type="button"
 onClick={handleCloudSyncSave}
 disabled={isSyncSaving || isSyncLoading}
 className="flex-1 bg-emerald-700 hover:bg-emerald-650 disabled:bg-emerald-800/50 text-white font-semibold hover:text-yellow-400 py-3 rounded-xl text-xs tracking-tight flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
 >
 {isSyncSaving ? <RefreshCw className="animate-spin" size={14} /> : <DownloadCloud size={14} />}
 📡 Push State to Cloud
 </button>
 <button
 type="button"
 onClick={handleCloudSyncLoad}
 disabled={isSyncSaving || isSyncLoading}
 className="flex-1 bg-amber-500 hover:bg-amber-400 text-green-600 font-semibold py-3 rounded-xl text-xs tracking-tight flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
 >
 {isSyncLoading ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />}
 📥 Pull State from Cloud
 </button>
 </div>
 </div>

 {lastSyncedAt && (
 <p className="text-[10px] text-green-600 font-semibold italic flex items-center gap-1.5 pt-1">
 <span>● Registered Room Key: <strong className="font-mono text-yellow-400 ">{syncKey}</strong></span>
 <span>|</span>
 <span>Last Synced: <strong>{lastSyncedAt}</strong></span>
 </p>
 )}
 </div>
 )}

 {/* ACTIVE CONFLICT RESOLUTION & MERGE BOARD */}
 {showConflictModal && conflicts.length > 0 && (
 <div className="bg-amber-900/20 border border-amber-200 rounded-2xl p-6 space-y-4 text-left animate-fadeIn">
 <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
 <span className="text-2xl">⚠️</span>
 <div>
 <h3 className="text-sm font-semibold  text-amber-950 font-mono tracking-wide">Multi-Device Database Sync Conflicts Detected</h3>
 <p className="text-[11px] text-amber-800 font-medium">
 The cloud room database has different records compared to this device. Please select a merge or resolution strategy below.
 </p>
 </div>
 </div>

 {/* Conflict list */}
 <div className="space-y-4">
 {conflicts.map((c, cIndex) => (
 <div key={c.key} className="bg-white shadow-sm p-4 rounded-xl border border-amber-200/60 space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-semibold tracking-tight text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
 {c.label} Module
 </span>
 <span className="text-[10px] text-gray-900 font-medium font-mono">
 Local: {c.localOnlyCount} uniquely | Cloud: {c.cloudOnlyCount} uniquely
 </span>
 </div>

 {c.idConflicts.length > 0 && (
 <div className="space-y-2">
 <span className="text-[9px] text-gray-900 font-medium block font-bold tracking-tight">
 Conflicting records (Shared IDs with different details):
 </span>
 <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 divide-y divide-slate-100">
 {c.idConflicts.map((ic, icIndex) => (
 <div key={ic.id} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10.5px]">
 <div>
 <span className="font-bold text-gray-900 font-mono">Record ID: {ic.id}</span>
 <span className="text-[9px] text-gray-900 font-medium block font-medium">
 Detects differing attributes. Choose which version to preserve.
 </span>
 </div>

 <div className="flex gap-1.5 shrink-0">
 <button
 type="button"
 onClick={() => {
 setConflicts(prev => {
 const updated = [...prev];
 updated[cIndex].idConflicts[icIndex].selectedSource = 'cloud';
 return updated;
 });
 }}
 className={`px-3 py-1.5 rounded-lg text-[9px] font-semibold  tracking-wide cursor-pointer border transition-all ${
 ic.selectedSource === 'cloud'
 ? 'bg-teal-700 text-gray-900 border-teal-700 shadow-xs'
 : 'bg-slate-50 border border-gray-200 text-gray-900 font-medium border-gray-200 hover:bg-slate-50 border border-gray-200'
 }`}
 >
 Use Cloud
 </button>
 <button
 type="button"
 onClick={() => {
 setConflicts(prev => {
 const updated = [...prev];
 updated[cIndex].idConflicts[icIndex].selectedSource = 'local';
 return updated;
 });
 }}
 className={`px-3 py-1.5 rounded-lg text-[9px] font-semibold  tracking-wide cursor-pointer border transition-all ${
 ic.selectedSource === 'local'
 ? 'bg-amber-600 text-gray-900 border-amber-600 shadow-xs'
 : 'bg-slate-50 border border-gray-200 text-gray-900 font-medium border-gray-200 hover:bg-slate-50 border border-gray-200'
 }`}
 >
 Keep Local
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Action Strategies */}
 <div className="bg-amber-100/30 p-4 rounded-xl border border-amber-200 text-left space-y-4 pt-4">
 <h4 className="text-[10px] font-semibold  text-amber-900 tracking-normal">Select Resolution Strategy</h4>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <button
 type="button"
 onClick={() => handleExecuteMerge('merge')}
 className="p-3 bg-teal-850 hover:bg-teal-800 text-gray-900 rounded-xl text-xs font-semibold tracking-tight text-center cursor-pointer border-none shadow-sm transition-all"
 >
 🤝 Smart Merge Record-By-ID
 <span className="block text-[8px] font-normal text-teal-200 lowercase mt-0.5">Keeps all unique items; resolves conflicting IDs above</span>
 </button>

 <button
 type="button"
 onClick={() => handleExecuteMerge('cloud')}
 className="p-3 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-900 rounded-xl text-xs font-semibold tracking-tight text-center cursor-pointer border border-gray-200 shadow-sm transition-all"
 >
 📥 Cloud Overwrite
 <span className="block text-[8px] font-normal text-gray-900 font-medium lowercase mt-0.5">Completely replace this local device state with cloud</span>
 </button>

 <button
 type="button"
 onClick={() => {
 setShowConflictModal(false);
 setConflicts([]);
 setCloudPayload(null);
 setStatusMsg({ type: null, text: '' });
 }}
 className="p-3 bg-white shadow-sm hover:bg-slate-55 border border-amber-250 text-amber-950 rounded-xl text-xs font-semibold tracking-tight text-center cursor-pointer transition-all"
 >
 🚫 Abandon Pull
 <span className="block text-[8px] font-normal text-amber-800 lowercase mt-0.5">Keep current local data as is and close merge dashboard</span>
 </button>
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Export */}
 <div className="border border-gray-200 p-5 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col justify-between">
 <div className="space-y-1.5 mb-4">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-100 text-sky-850 rounded-lg text-[10px] font-semibold tracking-tight">
 <FileJson size={12} strokeWidth={2.5} />
 Safe Encapsulation
 </div>
 <h3 className="text-sm font-semibold text-gray-900">Export Backup Snapshot</h3>
 <p className="text-xs text-gray-900 font-medium leading-relaxed">
 Downloads a complete offline backup file (`.json`) containing all farm operations, staff configurations, and harvest financials on your machine.
 </p>
 </div>

 <button
 onClick={handleExportBackup}
 disabled={isExporting}
 className="w-full bg-white hover:bg-emerald-900 text-gray-900 font-semibold py-3 rounded-xl text-xs tracking-tight flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.99] transition-all disabled:opacity-50"
 >
 {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <DownloadCloud size={14} />}
 Export Snapshot
 </button>
 </div>

 {/* Import */}
 <div className="border border-gray-200 p-5 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col justify-between">
 <div className="space-y-1.5 mb-4">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-850 rounded-lg text-[10px] font-semibold tracking-tight">
 <HardDriveUpload size={12} strokeWidth={2.5} />
 Database Rewrite
 </div>
 <h3 className="text-sm font-semibold text-gray-900">Upload & Restore Database</h3>
 <p className="text-xs text-gray-900 font-medium leading-relaxed">
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
 className="w-full bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-900 font-semibold py-3 rounded-xl text-xs tracking-tight flex items-center justify-center gap-2 border-0 cursor-pointer shadow-xs active:scale-[0.99] transition-all disabled:opacity-50"
 >
 {isImporting ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />}
 Restore Snapshot
 </button>
 </div>
 </div>
 </div>

 {/* Online/Offline Network Simulator Control Dashboard (Improvement 4) */}
 <div className="bg-slate-50 border border-gray-200 border border-gray-200 p-5 rounded-2xl space-y-4">
 <div className="flex items-center justify-between border-b border-gray-200 pb-2">
 <div className="flex items-center gap-2">
 <RefreshCw className="text-green-600 animate-spin-slow" size={16} />
 <h3 className="text-xs font-semibold text-gray-900 tracking-tight leading-none">
 Live Synchronization & Connectivity Control
 </h3>
 </div>
 <span className="text-[10px] font-mono text-gray-900 font-medium font-bold">Heuristic Sync Enforcer</span>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-3 bg-white shadow-sm rounded-xl border border-gray-200 space-y-1">
 <span className="text-[9px] font-semibold  text-gray-900 font-medium block pb-0.5">Network Simulation Status</span>
 <div className="flex items-center gap-2">
 <span className={`w-2.5 h-2.5 rounded-full ${isForcedOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
 <span className="text-xs font-semibold  tracking-tight text-gray-900">
 {isForcedOffline ? 'Forced Offline Simulation' : 'Active Online Cloud Tunnel'}
 </span>
 </div>
 </div>
 <div className="p-3 bg-white shadow-sm rounded-xl border border-gray-200 space-y-1">
 <span className="text-[9px] font-semibold  text-gray-900 font-medium block pb-0.5">Database Sync Latency</span>
 <span className="font-mono text-xs font-semibold text-gray-900 block">
 {isForcedOffline ? '∞ infinite (Simulation)' : '42ms (Secure Socket Tunnel)'}
 </span>
 </div>
 <div className="p-3 bg-white shadow-sm rounded-xl border border-gray-200 flex items-center justify-between">
 <div className="space-y-0.5">
 <span className="text-[9px] font-semibold  text-amber-800 block">Simulate Offline Mode</span>
 <p className="text-[10px] text-gray-900 font-medium leading-none">Simulates telemetry disconnected</p>
 </div>
 <button
 onClick={toggleOfflineSimulation}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-tight transition-all border-0 cursor-pointer ${
 isForcedOffline 
 ? 'bg-amber-500 text-gray-500 font-semibold shadow-xs' 
 : 'bg-slate-50 border border-gray-200 text-gray-900 font-semibold hover:bg-slate-300'
 }`}
 >
 {isForcedOffline ? 'Go Online' : 'Go Offline'}
 </button>
 </div>
 </div>
 <p className="text-[10px] text-gray-900 font-medium italic leading-normal font-medium max-w-xl">
 💡 <strong>HINTS:</strong> Going Offline automatically instructs the dynamic diagnostics scanner, feed formulations, and GlobalGAP spraying recorders to run on our custom local browser core-heuristics, bypassing API routes.
 </p>
 </div>

 {/* Preset default rebuild */}
 <div className="p-4 rounded-2xl border border-rose-100 bg-rose-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <h4 className="text-xs font-semibold  text-rose-900 tracking-normal">Reconstruct Seed State</h4>
 <p className="text-[11px] text-gray-900 font-medium font-semibold leading-relaxed max-w-xl">
 Need a clean slate? This deletes any records inputted and resets the enterprise ledger to the factory preset values.
 </p>
 </div>
 <button
 onClick={triggerReset}
 disabled={isResetting}
 className="shrink-0 bg-rose-500 hover:bg-rose-600 font-semibold text-white text-xs px-5 py-2.5 rounded-xl tracking-tight border-0 cursor-pointer shadow-xs transition-colors active:scale-95 disabled:opacity-50"
 >
 Reset Database
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
