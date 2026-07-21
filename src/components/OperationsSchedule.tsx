import React, { useState, useEffect, useRef } from 'react';
import { 
 Calendar, 
 Clock, 
 CheckCircle2, 
 Plus, 
 Layers, 
 HelpCircle, 
 Activity, 
 Filter, 
 ChevronRight, 
 UtensilsCrossed, 
 AlertCircle, 
 ShieldCheck, 
 Trash2,
 Bell,
 BellRing,
 PenSquare,
 Sparkles,
 Info,
 Printer,
 Download
} from 'lucide-react';

interface TimetableItem {
 id: string;
 category: 'Cows & Calves' | 'Goats & Pigs' | 'Crops & Orchards' | 'Poultry & Dogs';
 operation: string; // E.g., "Deworming dogs", "Foliar Spraying"
 when: string; // E.g., "Every 3 Months"
 how: string; // SOP details
 why: string; // Agricultural or medical reason
 status: 'Completed' | 'Pending' | 'In Progress';
 targetDate: string; // Target execution date e.g. "YYYY-MM-DD"
 assignedTo?: string; // Opt assigned team or person
 custom?: boolean;
}

interface ActiveReminder {
 id: string;
 operation: string;
 secondsLeft: number;
 fireAt: number;
}

const ACTIVE_REMINDER_STORAGE_KEY = 'jr_farm_active_reminders_v1';
const DAILY_DUE_ALERTS_STORAGE_KEY = 'jr_farm_daily_due_alerts_v1';

const getTodayIso = () => new Date().toISOString().split('T')[0];

const getOffsetIso = (days: number) => {
 const date = new Date();
 date.setDate(date.getDate() + days);
 return date.toISOString().split('T')[0];
};

const getDaysDiffText = (targetDateStr: string) => {
 if (!targetDateStr) return null;
 const todayVal = new Date();
 const targetVal = new Date(targetDateStr);
 
 todayVal.setHours(0, 0, 0, 0);
 targetVal.setHours(0, 0, 0, 0);
 
 const diffTime = targetVal.getTime() - todayVal.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
 if (diffDays < 0) {
 return {
 text: `⚠️ Overdue by ${Math.abs(diffDays)} Day${Math.abs(diffDays) === 1 ? '' : 's'}`,
 badgeStyle: 'bg-rose-900/20 text-rose-700 border-rose-100'
 };
 } else if (diffDays === 0) {
 return {
 text: '🚨 Today',
 badgeStyle: 'bg-amber-900/20 text-amber-700 border-amber-200 animate-pulse'
 };
 } else if (diffDays === 1) {
 return {
 text: '📅 Tomorrow',
 badgeStyle: 'bg-blue-900/20 text-blue-700 border-blue-150'
 };
 } else {
 return {
 text: `📅 In ${diffDays} Days`,
 badgeStyle: 'bg-slate-50 border border-gray-200 text-gray-900 font-semibold border-gray-200'
 };
 }
};

const DEFAULT_TIMETABLE: TimetableItem[] = [
 // COWS & CALVES
 {
 id: 'tt-1',
 category: 'Cows & Calves',
 operation: 'Teat Dipping & Hygiene Routine',
 when: 'Daily (Every morning and afternoon milking session)',
 how: 'Strip foremilk, dip teats in Chlorhexidine for 30s, wipe dry with single-use towels, and seal post-milking with thick iodine.',
 why: 'Prevents mastitis infections and seals the physical teat sphincter against environmental germs while it contracts.',
 status: 'Completed',
 targetDate: getOffsetIso(0),
 assignedTo: 'Milking Crew'
 },
 {
 id: 'tt-2',
 category: 'Cows & Calves',
 operation: 'Calf Decorn/Dehorning',
 when: 'At 2 to 6 Weeks of age',
 how: 'Apply a topical local lidocaine ring block, then use a hot iron dehorner precisely on the horn buds for 5 seconds.',
 why: 'Safer herd management. Prevents horn-gouging injuries among cows in restricted zero-grazing stalls.',
 status: 'Pending',
 targetDate: getOffsetIso(3),
 assignedTo: 'Veterinary Officer (Dr. Peter)'
 },
 {
 id: 'tt-3',
 category: 'Cows & Calves',
 operation: 'Postpartum Selenium Boost',
 when: '4 Weeks before expected calving date',
 how: 'Inject or drench the dry pregnant cow with Vitamin E and Selenium mineral booster mixture.',
 why: 'Prevents retained placenta (delayed membranes separation) and raises calf baseline antibody absorption metrics.',
 status: 'Completed',
 targetDate: getOffsetIso(-3),
 assignedTo: 'Livestock Manager'
 },

 // GOATS & PIGS
 {
 id: 'tt-4',
 category: 'Goats & Pigs',
 operation: 'Hoof Trimming and Copper Dip',
 when: 'Every 4 to 6 Weeks',
 how: 'Trim excess hoof horn flat to parallel the growth ring using hand shear clippers. Dip in 5% Copper Sulfate solution.',
 why: 'Prevents lameness, foot-rot, and joint arthritis on moist concrete surfaces.',
 status: 'Pending',
 targetDate: getOffsetIso(7),
 assignedTo: 'Small Ruminants Team'
 },

 // CROPS & ORCHARDS
 {
 id: 'tt-5',
 category: 'Crops & Orchards',
 operation: 'Avocado Pre-Harvest Copper Spray',
 when: '21 to 30 Days before Hass/Fuerte harvest maturity',
 how: 'Spray orchard canopy with Micronized Copper Oxychloride fungicide solution.',
 why: 'Prevents anthracnose fruit spots, guaranteeing GlobalGAP premium export grade clearance.',
 status: 'Completed',
 targetDate: getOffsetIso(-1),
 assignedTo: 'Agronomy Handler'
 },
 {
 id: 'tt-6',
 category: 'Crops & Orchards',
 operation: 'Tea Triennial Hard Pruning',
 when: 'Every 3 Years (During cool, dry offseason)',
 how: 'Cut tea branches back to a flat table 24-28 inches high. Paint large cuts with copper paste.',
 why: 'Resets the plucking table width and increases light penetration for vigorous young plucking shoots.',
 status: 'Pending',
 targetDate: getOffsetIso(24),
 assignedTo: 'Field Operations'
 },

 // POULTRY & DOGS
 {
 id: 'tt-7',
 category: 'Poultry & Dogs',
 operation: 'Newcastle and Gumboro Drinking Water Vaccinations',
 when: 'Newcastle on Week 1 & 3; Gumboro on Week 2 booster',
 how: 'Starve birds of water for 2 hours, then mix soluble vaccine vials with cool clean water and dry milk powder stabilizer.',
 why: 'Builds vital antibody titles to protect flock from fatal virus sweep outages.',
 status: 'Completed',
 targetDate: getOffsetIso(-2),
 assignedTo: 'Poultry Team'
 },
 {
 id: 'tt-8',
 category: 'Poultry & Dogs',
 operation: 'K-9 Parvovirus and Rabies Vaccines',
 when: 'DHLPP Vaccine at 8, 12, & 16 weeks; Rabies at 12 weeks',
 how: 'Administer 1ml vaccine subcutaneously in the loose neck skin folds.',
 why: 'Rabies prevents fatal human spillover. Parvovirus is highly contagious and fatal to young puppies.',
 status: 'Pending',
 targetDate: getOffsetIso(4),
 assignedTo: 'Canine Care Specialist'
 }
];

interface OperationsScheduleProps {
 onTriggerSectionReport?: (sectionKey: string) => void;
}

export default function OperationsSchedule({ onTriggerSectionReport }: OperationsScheduleProps = {}) {
 const deferredStorageHandlesRef = useRef<Map<string, number>>(new Map());

 const scheduleJsonStorageWrite = (key: string, value: unknown) => {
 const existingHandle = deferredStorageHandlesRef.current.get(key);
 if (existingHandle !== undefined) {
 window.clearTimeout(existingHandle);
 }

 const handle = window.setTimeout(() => {
 deferredStorageHandlesRef.current.delete(key);
 localStorage.setItem(key, JSON.stringify(value));
 }, 0);

 deferredStorageHandlesRef.current.set(key, handle);
 };

 const [items, setItems] = useState<TimetableItem[]>(() => {
 const saved = localStorage.getItem('jr_farm_custom_timetable');
 if (saved) {
 try {
 const parsed = JSON.parse(saved) as Array<Partial<TimetableItem>>;
 // Ensure older custom items get a default date
 return parsed.map((item) => ({
 ...item,
 status: item.status || 'Pending',
 targetDate: item.targetDate || getTodayIso(),
 assignedTo: item.assignedTo || 'Unassigned'
 })) as TimetableItem[];
 } catch (e) {
 return DEFAULT_TIMETABLE;
 }
 }
 return DEFAULT_TIMETABLE;
 });

 const [filterCategory, setFilterCategory] = useState<string>('all');
 const [sortBy, setSortBy] = useState<'dateAsc' | 'dateDesc' | 'status' | 'category'>('dateAsc');
 const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
 const [showAddModal, setShowAddModal] = useState(false);
 const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);

 // New timetable item form state
 const [category, setCategory] = useState<TimetableItem['category']>('Cows & Calves');
 const [operation, setOperation] = useState('');
 const [when, setWhen] = useState('');
 const [how, setHow] = useState('');
 const [why, setWhy] = useState('');
 const [targetDate, setTargetDate] = useState(getTodayIso());
 const [assignedTo, setAssignedTo] = useState('');

 // Notification states
 const [permission, setPermission] = useState<NotificationPermission>('default');
 const [toastMessage, setToastMessage] = useState<string | null>(null);
 const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
 const [activeNotificationAlert, setActiveNotificationAlert] = useState<{ title: string; bodyText: string } | null>(null);

 useEffect(() => {
 return () => {
 deferredStorageHandlesRef.current.forEach((handle) => window.clearTimeout(handle));
 deferredStorageHandlesRef.current.clear();
 };
 }, []);

 useEffect(() => {
 if ('Notification' in window) {
 setPermission(Notification.permission);
 }

 // Recover any queued countdown reminders after refresh/reopen.
 try {
 const raw = localStorage.getItem(ACTIVE_REMINDER_STORAGE_KEY);
 if (raw) {
 const parsed = JSON.parse(raw) as ActiveReminder[];
 const now = Date.now();
 const recovered = parsed
 .filter((r) => Number.isFinite(r.fireAt) && r.fireAt > now)
 .map((r) => ({
 ...r,
 secondsLeft: Math.max(1, Math.ceil((r.fireAt - now) / 1000))
 }));
 setActiveReminders(recovered);
 }
 } catch (_) {
 localStorage.removeItem(ACTIVE_REMINDER_STORAGE_KEY);
 }

 // Interval to count down alerts using absolute fireAt timestamps.
 const timer = setInterval(() => {
 setActiveReminders((prev) => {
 const now = Date.now();
 const next: ActiveReminder[] = [];

 for (const reminder of prev) {
 const secondsLeft = Math.ceil((reminder.fireAt - now) / 1000);
 if (secondsLeft <= 0) {
 triggerActualNotification(reminder.operation);
 } else {
 next.push({ ...reminder, secondsLeft });
 }
 }

 return next;
 });
 }, 1000);

 return () => clearInterval(timer);
 }, []);

 useEffect(() => {
 try {
 if (activeReminders.length === 0) {
 localStorage.removeItem(ACTIVE_REMINDER_STORAGE_KEY);
 return;
 }
 scheduleJsonStorageWrite(ACTIVE_REMINDER_STORAGE_KEY, activeReminders);
 } catch (_) {}
 }, [activeReminders]);

 useEffect(() => {
 const today = getTodayIso();
 const dueOrOverdue = items.filter((item) => {
 if (item.status === 'Completed') return false;
 if (!item.targetDate) return false;
 return new Date(item.targetDate).getTime() <= new Date(today).getTime();
 });

 if (dueOrOverdue.length === 0) return;

 try {
 const raw = localStorage.getItem(DAILY_DUE_ALERTS_STORAGE_KEY);
 const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
 const alreadyAlerted = new Set(parsed[today] || []);
 const pendingIds = dueOrOverdue.map((item) => item.id).filter((id) => !alreadyAlerted.has(id));

 if (pendingIds.length === 0) return;

 triggerActualNotification(
 `Operations Due: ${pendingIds.length} item${pendingIds.length === 1 ? '' : 's'}`,
 'Recovered on app open: You have pending or overdue SOP operations that need attention.'
 );

 parsed[today] = [...alreadyAlerted, ...pendingIds];
 scheduleJsonStorageWrite(DAILY_DUE_ALERTS_STORAGE_KEY, parsed);
 } catch (_) {}
 }, [items]);

 const showToast = (msg: string) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(null), 4000);
 };

 const requestNotificationPermission = async () => {
 if (!('Notification' in window)) {
 showToast("Web Notifications are not supported in this browser environment.");
 return;
 }
 try {
 const res = await Notification.requestPermission();
 setPermission(res);
 if (res === 'granted') {
 showToast("✓ Taskbar notifications successfully authorized!");
 } else {
 showToast("⚠️ Notifications were denied or dismissed.");
 }
 } catch (err) {
 // Browsers in restricted Sandboxed Iframes can throw exceptions
 setPermission('denied');
 showToast("⚠️ Sandboxed Iframe blocked web notifications. In-app alarms active!");
 }
 };

 const triggerActualNotification = (title: string, bodyText?: string) => {
 const defaultBody = "Scheduled animal/crop operation reminder is active. Click to check off SOP.";
 const body = bodyText || defaultBody;

 // Trigger local reactive state for gorgeous on-screen modal alert
 setActiveNotificationAlert({ title, bodyText: body });

 // Try standard background push notification
 if ('Notification' in window && Notification.permission === 'granted') {
 try {
 new Notification(`JR Farm Alert: ${title}`, {
 body: body,
 icon: '/icon-192.png',
 tag: 'jr-farm-reminder',
 requireInteraction: true
 });
 } catch (e) {
 console.warn("Standard push failed (sandboxed iframe context), using in-app fallback");
 }
 }
 
 // Play subtle high-frequency buzzer note
 try {
 const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.type = 'sine';
 osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch notification chime
 gain.gain.setValueAtTime(0.15, ctx.currentTime);
 osc.start();
 osc.stop(ctx.currentTime + 0.3);
 } catch (_) {}

 showToast(`🔔 ALERT TRIGGERED: "${title}"`);
 };

 const handleTestNotificationImmediate = () => {
 if ('Notification' in window && Notification.permission !== 'granted') {
 requestNotificationPermission();
 }
 triggerActualNotification("Immediate Push Alert Test", "Perfect! Your JR Farm Audio-Visual backup alert works flawlessly. If you open this app in a New Tab, standard lockscreen taskbar notifications will also fire.");
 };

 const handleScheduleTestReminder = (opName: string, secs: number = 10) => {
 if ('Notification' in window && Notification.permission !== 'granted') {
 requestNotificationPermission();
 }
 const newRem = {
 id: `rem-${Date.now()}`,
 operation: opName,
 secondsLeft: secs,
 fireAt: Date.now() + (secs * 1000)
 };
 setActiveReminders(prev => [...prev, newRem]);
 showToast(`⏱️ Queued "${opName}" check alert in ${secs} seconds.`);
 };

 const handleSaveToLocalStorage = (newItems: TimetableItem[]) => {
 setItems(newItems);
 scheduleJsonStorageWrite('jr_farm_custom_timetable', newItems);
 };

 const handleToggleStatus = (id: string) => {
 const updated = items.map(item => {
 if (item.id === id) {
 return { ...item, status: item.status === 'Completed' ? 'Pending' : 'Completed' };
 }
 return item;
 });
 handleSaveToLocalStorage(updated);
 };
 
 const handleUpdateStatusDirect = (id: string, nextStatus: 'Pending' | 'In Progress' | 'Completed') => {
 const updated = items.map(item => {
 if (item.id === id) {
 return { ...item, status: nextStatus };
 }
 return item;
 });
 handleSaveToLocalStorage(updated);
 };

 const handleAddCustom = (e: React.FormEvent) => {
 e.preventDefault();
 if (!operation || !when || !how || !why || !targetDate) return;

 if (editingItem) {
 // Edit mode
 const updated = items.map(item => 
 item.id === editingItem.id 
 ? { ...item, category, operation, when, how, why, targetDate, assignedTo: assignedTo || 'General Team' } 
 : item
 );
 handleSaveToLocalStorage(updated);
 setEditingItem(null);
 showToast("✓ SOP operation updated successfully");
 } else {
 // Create mode
 const newItem: TimetableItem = {
 id: `tt-custom-${Date.now()}`,
 category,
 operation,
 when,
 how,
 why,
 status: 'Pending',
 targetDate,
 assignedTo: assignedTo || 'General Team',
 custom: true
 };

 const updated = [newItem, ...items];
 handleSaveToLocalStorage(updated);
 showToast("✓ New custom SOP task created successfully");
 }

 // Reset Form
 setOperation('');
 setWhen('');
 setHow('');
 setWhy('');
 setTargetDate(getTodayIso());
 setAssignedTo('');
 setShowAddModal(false);
 };

 const handleStartEdit = (item: TimetableItem) => {
 setEditingItem(item);
 setCategory(item.category);
 setOperation(item.operation);
 setWhen(item.when);
 setHow(item.how);
 setWhy(item.why);
 setTargetDate(item.targetDate || getTodayIso());
 setAssignedTo(item.assignedTo || '');
 setShowAddModal(true);
 };

 const handleDeleteItem = (id: string) => {
 const updated = items.filter(item => item.id !== id);
 handleSaveToLocalStorage(updated);
 showToast("✕ SOP task deleted successfully");
 };

 const filteredItems = (filterCategory === 'all' 
 ? items 
 : items.filter(i => i.category === filterCategory)
 ).sort((a, b) => {
 if (sortBy === 'dateAsc') {
 return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
 } else if (sortBy === 'dateDesc') {
 return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
 } else if (sortBy === 'status') {
 if (a.status === b.status) {
 return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
 }
 const statusOrder: Record<TimetableItem['status'], number> = {
 'Pending': 0,
 'In Progress': 1,
 'Completed': 2
 };
 return statusOrder[a.status] - statusOrder[b.status];
 } else {
 return a.category.localeCompare(b.category);
 }
 });

 return (
 <div className="space-y-6 font-sans antialiased text-gray-900 animate-fadeIn" id="timetable-root">
 
 {/* Toast alert box */}
 {toastMessage && (
 <div className="fixed bottom-6 right-6 z-50 bg-white shadow-sm border border-gray-200 text-gray-900 font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fadeIn">
 <BellRing size={16} className="text-yellow-400 animate-bounce" />
 <span>{toastMessage}</span>
 </div>
 )}

 {/* Header Banner */}
 <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="p-1 px-2.5 bg-yellow-105 bg-yellow-100 text-yellow-800 rounded-lg text-[9px] font-semibold tracking-tight">
 Chronological Ledger
 </span>
 <span className="text-[10px] text-gray-900 font-medium font-semibold tracking-normal ">
 Operations Timetable System
 </span>
 </div>
 <h2 className="text-xl font-semibold text-gray-900 text-gray-900 flex items-center gap-2">
 <Calendar className="text-green-600" size={22} />
 On-Farm Standard Operating Procedures
 </h2>
 <p className="text-xs text-gray-500 font-medium pb-1">
 Monitor which operations are performed when, how they are executed, and why they are vital to secure maximum dairy, crop, and canine yields.
 </p>
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto self-center md:self-auto ">
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('schedule')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-gray-500 hover:text-gray-500 border border-amber-600/10 font-bold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 shrink-0 h-10 font-bold"
 title="Download Operations & Schedules PDF Report"
 >
 <Download size={13} />
 Download PDF Report
 </button>
 )}
 <button
 onClick={() => {
 setEditingItem(null);
 setOperation('');
 setWhen('');
 setHow('');
 setWhy('');
 setShowAddModal(true);
 }}
 className="w-full sm:w-auto h-10 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-emerald-900 active:scale-[0.98] text-gray-900 font-semibold text-xs tracking-tight rounded-xl transition-all shadow-sm cursor-pointer border-0 m-0 shrink-0"
 >
 <Plus size={15} />
 Create Custom SOP Task
 </button>
 </div>
 </div>

 {/* Browser to Phone-Taskbar push control center */}
 <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-gray-900 rounded-3xl p-6 border border-indigo-900 shadow-md space-y-4">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="bg-indigo-700 text-indigo-100 font-bold text-[8.5px] tracking-tight px-2 py-0.5 rounded-full">
 Phone & Desktop Link
 </span>
 <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5  tracking-wide">
 <Bell size={14} className="text-yellow-400 shrink-0" /> Phone Taskbar Notification Driver
 </h4>
 </div>
 <p className="text-xs text-indigo-200/80 font-medium max-w-xl">
 Enable push reminders that route directly through your smartphone's browser sandbox onto its lockscreen taskbar. This guarantees you never miss critical medical, seed crop, or breeding operations.
 </p>
 </div>

 <div className="flex flex-col gap-3 min-w-xs">
 <div className="flex gap-2 flex-wrap sm:flex-nowrap justify-end">
 {permission === 'granted' ? (
 <span className="bg-emerald-800 text-green-600 text-[10px] font-semibold  px-4 py-2.5 rounded-xl block shrink-0 border border-emerald-700/50">
 ✓ System Authorized
 </span>
 ) : permission === 'denied' ? (
 <div className="flex flex-col gap-2 w-full">
 <span className="bg-red-900/60 text-red-200 text-[9px] font-semibold  px-3 py-2 rounded-xl text-center border border-red-800/50">
 ⚠️ Blocked by Sandbox Iframe
 </span>
 <a
 href={window.location.href}
 target="_blank"
 rel="noopener noreferrer"
 className="bg-yellow-500 hover:bg-yellow-400 text-gray-500 text-[10px] font-semibold  px-4 py-2.5 rounded-xl transition-all text-center inline-block cursor-pointer decoration-none"
 >
 🚀 Open App in New Tab to Approve
 </a>
 </div>
 ) : (
 <button
 onClick={requestNotificationPermission}
 className="bg-yellow-500 hover:bg-yellow-400 text-gray-500 text-[10px] font-semibold  px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer border-0"
 >
 🔔 Auth Notifications
 </button>
 )}

 {permission !== 'denied' && (
 <button
 onClick={handleTestNotificationImmediate}
 className="bg-white shadow-sm /10 hover:bg-gray-50 /15 text-gray-900 border border-white/20 text-[10px] font-semibold  px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer m-0"
 >
 ⚡ Immediate Test Push
 </button>
 )}
 </div>
 
 {permission === 'denied' && (
 <p className="text-[10px] text-indigo-300 font-semibold text-right leading-normal">
 Standard Web Browsers block notification permissions inside system preview frames. Click "Open App in New Tab" to authorize system lockscreen alerts. In-app bells and Audio chimes will continue to work perfectly here!
 </p>
 )}
 </div>
 </div>

 {/* Trigger specific scheduling test alerts */}
 <div className="pt-4 border-t border-indigo-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div className="space-y-1">
 <span className="text-[10px] font-semibold  text-indigo-305 text-indigo-400 tracking-normal block">Choose major crop/animal reminder to test:</span>
 <div className="flex gap-1.5 flex-wrap">
 <button
 onClick={() => handleScheduleTestReminder("Deworming & Rabies Vaccine Run 🦠", 10)}
 className="bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 border border-gray-200 text-indigo-200 font-semibold text-[10px] px-2.5 py-1.5 rounded-lg"
 >
 🐕 Canine Vaccines (10s)
 </button>
 <button
 onClick={() => handleScheduleTestReminder("Avocado Anthracnose Copper Spray 🥑", 15)}
 className="bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 border border-gray-200 text-indigo-200 font-semibold text-[10px] px-2.5 py-1.5 rounded-lg"
 >
 🥑 Orchard Spraying (15s)
 </button>
 <button
 onClick={() => handleScheduleTestReminder("Calf Starter Decorn Lidocaine blocks 🐄", 20)}
 className="bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 border border-gray-200 text-indigo-200 font-semibold text-[10px] px-2.5 py-1.5 rounded-lg"
 >
 🍼 Calf Bud Decorn (20s)
 </button>
 </div>
 </div>

 {activeReminders.length > 0 && (
 <div className="p-3 bg-indigo-900/60 rounded-xl border border-indigo-805 text-xs font-bold text-yellow-300 animate-pulse space-y-1 w-full md:w-auto shrink-0">
 <span className="block text-[9px] tracking-tight text-indigo-200 mb-1">Pending Timer triggers:</span>
 {activeReminders.map(r => (
 <div key={r.id} className="flex justify-between items-center gap-4 text-[10px]">
 <span className="truncate">{r.operation}</span>
 <span className="font-mono bg-indigo-950 px-1 py-0.5 rounded">{r.secondsLeft}s left</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 
 {/* Kanban Board vs List View Toggle */}
 <div className="flex justify-start gap-2 border-b border-gray-100 pb-2">
 <button
 onClick={() => setViewMode('kanban')}
 type="button"
 className={`px-4 py-2 text-xs font-semibold tracking-tight rounded-xl transition-all cursor-pointer border ${
 viewMode === 'kanban'
 ? 'bg-white text-gray-900 border-emerald-950 shadow-sm font-bold'
 : 'bg-white shadow-sm text-gray-900 font-medium hover:text-gray-900 border-gray-200'
 }`}
 >
 🗂️ Operations Kanban Board
 </button>
 <button
 onClick={() => setViewMode('list')}
 type="button"
 className={`px-4 py-2 text-xs font-semibold tracking-tight rounded-xl transition-all cursor-pointer border ${
 viewMode === 'list'
 ? 'bg-white text-gray-900 border-emerald-950 shadow-sm font-bold'
 : 'bg-white shadow-sm text-gray-900 font-medium hover:text-gray-900 border-gray-200'
 }`}
 >
 📋 Standard Timetable List
 </button>
 </div>
 
 {/* Filter and Stats Segment */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 border border-gray-200 border border-gray-100 p-4 rounded-2xl">
 <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto flex-wrap">
 <div className="flex items-center gap-1">
 <span className="text-[10px] font-semibold  text-gray-500 flex items-center gap-1">
 <Filter size={12} /> Filter:
 </span>
 <div className="flex gap-1 flex-wrap">
 {['all', 'Cows & Calves', 'Goats & Pigs', 'Crops & Orchards', 'Poultry & Dogs'].map((cat) => (
 <button
 key={cat}
 onClick={() => setFilterCategory(cat)}
 className={`text-[10px] font-semibold  px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer m-0 ${
 filterCategory === cat
 ? 'bg-slate-905 bg-white shadow-sm text-gray-900 border-gray-200'
 : 'bg-white shadow-sm text-gray-900 font-medium hover:text-gray-900 border-gray-200'
 }`}
 >
 {cat === 'all' ? 'Show All' : cat}
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-1.5 min-w-[200px]">
 <span className="text-[10px] font-semibold  text-gray-500 shrink-0">Sort By:</span>
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value as 'dateAsc' | 'dateDesc' | 'status' | 'category')}
 className="bg-white shadow-sm border border-gray-200 rounded-lg text-[10px] font-semibold  px-2.5 py-1.5 text-gray-900 font-semibold w-full sm:w-auto"
 >
 <option value="dateAsc">Planned Date (Soonest first)</option>
 <option value="dateDesc">Planned Date (Latest first)</option>
 <option value="status">Status (Pending first)</option>
 <option value="category">Category</option>
 </select>
 </div>
 </div>

 <div className="flex items-center gap-3 shrink-0 text-xs">
 <div className="flex items-center gap-1.5 text-gray-900 font-medium font-bold">
 <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
 <span>Completed: {items.filter(i => i.status === 'Completed').length}</span>
 </div>
 <div className="flex items-center gap-1.5 text-gray-900 font-medium font-bold">
 <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block"></span>
 <span>Pending: {items.filter(i => i.status === 'Pending').length}</span>
 </div>
 </div>
 </div>

 {/* KANBAN BOARD SECTION */}
 {viewMode === 'kanban' && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
 {/* COLUMN 1: PENDING / SCHEDULED */}
 <div className="bg-slate-50 border border-gray-200 p-4 rounded-3xl border border-gray-100 space-y-4">
 <div className="flex justify-between items-center px-1">
 <span className="text-[11px] font-semibold  text-amber-800 tracking-normal">📋 Scheduled / Pending</span>
 <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
 {filteredItems.filter(i => i.status === 'Pending').length}
 </span>
 </div>
 <div className="space-y-3">
 {filteredItems.filter(i => i.status === 'Pending').length === 0 ? (
 <p className="text-[11px] text-gray-900 font-medium italic text-center py-6">No pending chores in this filter.</p>
 ) : (
 filteredItems.filter(i => i.status === 'Pending').map(item => {
 const diffText = getDaysDiffText(item.targetDate);
 return (
 <div key={item.id} className="bg-white shadow-sm p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 relative group">
 <div>
 <span className="text-[9px] bg-slate-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-semibold ">{item.category}</span>
 <h4 className="text-xs font-semibold text-gray-900 mt-2 leading-snug">{item.operation}</h4>
 </div>
 <div className="text-[10px] text-gray-900 font-medium font-bold space-y-0.5">
 <p>🕒 {item.when}</p>
 <p>👤 {item.assignedTo || 'General Team'}</p>
 {diffText && <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-semibold  rounded border ${diffText.badgeStyle}`}>{diffText.text}</span>}
 </div>
 <div className="flex gap-1.5 pt-2 border-t border-gray-100">
 <button
 onClick={() => handleUpdateStatusDirect(item.id, 'In Progress')}
 className="w-full py-1.5 bg-indigo-900/20 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-[10px] font-semibold  rounded-lg cursor-pointer"
 >
 Start Task →
 </button>
 <button
 onClick={() => handleUpdateStatusDirect(item.id, 'Completed')}
 className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-green-600 border border-emerald-200 text-[10px] font-semibold  rounded-lg cursor-pointer font-bold"
 title="Mark Completed"
 >
 ✓
 </button>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 
 {/* COLUMN 2: IN PROGRESS */}
 <div className="bg-slate-50 border border-gray-200 p-4 rounded-3xl border border-gray-100 space-y-4">
 <div className="flex justify-between items-center px-1">
 <span className="text-[11px] font-semibold  text-indigo-800 tracking-normal">⚡ In Progress</span>
 <span className="bg-indigo-100 text-indigo-850 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
 {filteredItems.filter(i => i.status === 'In Progress').length}
 </span>
 </div>
 <div className="space-y-3">
 {filteredItems.filter(i => i.status === 'In Progress').length === 0 ? (
 <p className="text-[11px] text-gray-900 font-medium italic text-center py-6">No tasks in progress.</p>
 ) : (
 filteredItems.filter(i => i.status === 'In Progress').map(item => {
 const diffText = getDaysDiffText(item.targetDate);
 return (
 <div key={item.id} className="bg-white shadow-sm p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 relative">
 <div>
 <span className="text-[9px] bg-slate-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-semibold ">{item.category}</span>
 <h4 className="text-xs font-semibold text-gray-900 mt-2 leading-snug">{item.operation}</h4>
 </div>
 <div className="text-[10px] text-gray-900 font-medium font-bold space-y-0.5">
 <p>🕒 {item.when}</p>
 <p>👤 {item.assignedTo || 'General Team'}</p>
 {diffText && <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-semibold  rounded border ${diffText.badgeStyle}`}>{diffText.text}</span>}
 </div>
 <div className="flex gap-1.5 pt-2 border-t border-gray-100">
 <button
 onClick={() => handleUpdateStatusDirect(item.id, 'Pending')}
 className="w-1/2 py-1.5 bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 text-gray-900 font-semibold border text-[10px] font-semibold  rounded-lg cursor-pointer"
 >
 ← Revert
 </button>
 <button
 onClick={() => handleUpdateStatusDirect(item.id, 'Completed')}
 className="w-1/2 py-1.5 bg-white hover:bg-emerald-900 text-gray-900 text-[10px] font-semibold  rounded-lg cursor-pointer border-none shadow"
 >
 Complete ✓
 </button>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 
 {/* COLUMN 3: COMPLETED */}
 <div className="bg-slate-50 border border-gray-200 p-4 rounded-3xl border border-gray-100 space-y-4">
 <div className="flex justify-between items-center px-1">
 <span className="text-[11px] font-semibold  text-green-600 tracking-normal">✅ Verified / Completed</span>
 <span className="bg-emerald-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
 {filteredItems.filter(i => i.status === 'Completed').length}
 </span>
 </div>
 <div className="space-y-3">
 {filteredItems.filter(i => i.status === 'Completed').length === 0 ? (
 <p className="text-[11px] text-gray-900 font-medium italic text-center py-6">No completed tasks yet.</p>
 ) : (
 filteredItems.filter(i => i.status === 'Completed').map(item => {
 return (
 <div key={item.id} className="bg-white shadow-sm /80 p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 opacity-90 relative">
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600"></div>
 <div>
 <span className="text-[9px] bg-slate-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-semibold ">{item.category}</span>
 <h4 className="text-xs font-semibold text-gray-500 line-through mt-2 leading-snug">{item.operation}</h4>
 </div>
 <div className="text-[10px] text-gray-500 text-gray-900 font-medium font-bold space-y-0.5">
 <p>👤 {item.assignedTo || 'General Team'}</p>
 </div>
 <div className="flex gap-1.5 pt-2 border-t border-gray-100">
 <button
 onClick={() => handleUpdateStatusDirect(item.id, 'In Progress')}
 className="w-full py-1.5 bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 text-gray-900 font-semibold border text-[10px] font-semibold  rounded-lg cursor-pointer"
 >
 ← Move to In Progress
 </button>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 </div>
 )}
 
 {/* TIMETABLE LIST SECTION */}
 {viewMode === 'list' && (
 <div className="space-y-4" id="timetable-timeline">
 {filteredItems.length === 0 ? (
 <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-12 text-center text-gray-900 font-medium font-bold text-xs space-y-2">
 <AlertCircle className="mx-auto text-gray-900 font-medium" size={32} />
 <p>No operations scheduled in this category.</p>
 <p className="text-[11px] font-normal text-gray-900 font-medium">Add a custom SOP using the button above.</p>
 </div>
 ) : (
 filteredItems.map((item) => {
 const timeDiffBadge = getDaysDiffText(item.targetDate);
 return (
 <div 
 key={item.id} 
 className={`bg-white shadow-sm border rounded-3xl p-5 md:p-6 transition-all shadow-xs relative overflow-hidden ${
 item.status === 'Completed' 
 ? 'border-gray-200 bg-slate-50 border border-gray-200 opacity-90' 
 : 'border-gray-100 hover:border-emerald-700/20'
 }`}
 >
 {/* Completed decorative line */}
 {item.status === 'Completed' && (
 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600"></div>
 )}

 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
 <div className="space-y-3 flex-1">
 
 {/* Category, Status & Edit/Delete button header */}
 <div className="flex items-center justify-between md:justify-start gap-2 flex-wrap">
 <span className="bg-slate-150 text-gray-900 text-[8.5px] font-semibold px-2 py-0.5 rounded-md  tracking-wide">
 {item.category}
 </span>
 <button
 onClick={() => handleToggleStatus(item.id)}
 className={`text-[8px] font-semibold px-2 py-0.5 rounded-md tracking-tight cursor-pointer m-0 ${
 item.status === 'Completed'
 ? 'bg-emerald-100 text-green-600'
 : 'bg-yellow-100 text-yellow-800'
 }`}
 >
 {item.status === 'Completed' ? '✓ Completed' : '● Scheduled'}
 </button>
 
 {/* RELATIVE TIME BADGE OR DONE STATUS */}
 {item.status === 'Completed' ? (
 <span className="bg-emerald-55 bg-emerald-50 text-green-600 border border-emerald-200 text-[8.5px] font-semibold px-2 py-0.5 rounded-md  tracking-wide">
 ✓ Done
 </span>
 ) : (
 timeDiffBadge && (
 <span className={`text-[8.5px] font-semibold px-2 py-0.5 rounded-md  tracking-wide border ${timeDiffBadge.badgeStyle}`}>
 {timeDiffBadge.text}
 </span>
 )
 )}

 {item.custom && (
 <span className="bg-purple-100 text-purple-800 text-[8px] font-semibold px-2 py-0.5 rounded-md  tracking-wide">
 Custom Added
 </span>
 )}

 <div className="flex items-center gap-1.5 ml-auto">
 {/* EDIT OP BUTTON */}
 <button
 onClick={() => handleStartEdit(item)}
 className="text-gray-900 font-medium hover:text-indigo-805 p-1 hover:bg-slate-55 rounded cursor-pointer border-0 bg-transparent"
 title="Edit SOP operation values"
 >
 <PenSquare size={13} className="text-gray-900 font-medium hover:text-indigo-650" />
 </button>

 {/* DELETE OP BUTTON */}
 <button
 onClick={() => handleDeleteItem(item.id)}
 className="text-gray-900 font-medium hover:text-rose-800 font-bold p-1 cursor-pointer bg-transparent border-0"
 title="Delete Operations record"
 >
 <Trash2 size={13} className="text-gray-500 hover:text-red-600" />
 </button>
 </div>
 </div>

 {/* Operation Name */}
 <h3 className={`text-base font-semibold text-gray-900 ${item.status === 'Completed' ? 'line-through text-gray-500 text-gray-900 font-medium' : ''}`}>
 {item.operation}
 </h3>

 {/* Operational Timeline Details */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
 
 {/* PLANNED DATE & ASSIGNED */}
 <div className="space-y-1">
 <span className="text-[9px] font-semibold  text-gray-900 font-medium tracking-normal flex items-center gap-1">
 <Calendar size={11} className="text-green-600" /> Target Date & Team
 </span>
 <div className="text-xs space-y-1 bg-slate-50 border border-gray-200 p-2.5 rounded-xl border border-gray-200">
 <p className="font-semibold text-gray-900 flex items-center gap-1">
 <Clock size={10} className="text-gray-500" /> {item.targetDate ? new Date(item.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
 </p>
 <p className="font-semibold text-[9px] text-indigo-700 bg-indigo-900/20 px-2 py-0.5 rounded-md inline-block">
 👤 {item.assignedTo || 'General Team'}
 </p>
 </div>
 </div>

 {/* WHEN */}
 <div className="space-y-1">
 <span className="text-[9px] font-semibold  text-gray-900 font-medium tracking-normal flex items-center gap-1">
 <Clock size={11} className="text-amber-500" /> Frequency/Cadence
 </span>
 <p className="text-xs font-semibold text-gray-500 bg-slate-50 border border-gray-200 p-2.5 rounded-xl border border-gray-200">
 {item.when}
 </p>
 </div>

 {/* HOW */}
 <div className="space-y-1">
 <span className="text-[9px] font-semibold  text-gray-900 font-medium tracking-normal flex items-center gap-1">
 <Activity size={11} className="text-blue-500" /> Action SOP
 </span>
 <p className="text-xs text-gray-500 bg-slate-50 border border-gray-200 p-2.5 rounded-xl border border-gray-200 leading-relaxed font-semibold">
 {item.how}
 </p>
 </div>

 {/* WHY */}
 <div className="space-y-1">
 <span className="text-[9px] font-semibold  text-gray-900 font-medium tracking-normal flex items-center gap-1">
 <HelpCircle size={11} className="text-purple-500" /> Technical Impact
 </span>
 <p className="text-xs text-gray-500 bg-slate-50 border border-gray-200 p-2.5 rounded-xl border border-gray-200 leading-relaxed italic font-medium">
 "{item.why}"
 </p>
 </div>
 </div>

 </div>

 {/* Desktop Toggle status side click */}
 <div className="shrink-0 flex items-center pt-2 md:pt-4">
 <button
 onClick={() => handleToggleStatus(item.id)}
 className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer m-0 ${
 item.status === 'Completed'
 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/10'
 : 'bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 text-gray-900 font-medium hover:text-gray-900 font-medium'
 }`}
 title={item.status === 'Completed' ? 'Mark Task as Pending' : 'Mark Task as Done'}
 >
 <CheckCircle2 size={18} />
 </button>
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 )}

 {/* CREATE / EDIT SOP TIMETABLE MODAL */}
 {showAddModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm font-sans">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 space-y-5 animate-scaleUp border border-gray-100 max-h-[90vh] overflow-y-auto">
 
 <div className="flex justify-between items-start pb-3 border-b border-gray-100">
 <div className="space-y-0.5">
 <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md text-[8px] font-semibold ">
 Standard Operating Procedures
 </span>
 <h3 className="text-base font-semibold text-gray-500">
 {editingItem ? 'Edit SOP Operation values' : 'Add Custom SOP Operation'}
 </h3>
 </div>
 <button
 onClick={() => setShowAddModal(false)}
 className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold text-base bg-slate-50 border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer border-0 m-0"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleAddCustom} className="space-y-4">
 
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 Farm Section Category
 </label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as TimetableItem['category'])}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-xs"
 >
 <option value="Cows & Calves">Cows & Calves</option>
 <option value="Goats & Pigs">Goats & Pigs</option>
 <option value="Crops & Orchards">Crops & Orchards</option>
 <option value="Poultry & Dogs">Poultry & Dogs</option>
 </select>
 </div>

 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 Operation Name
 </label>
 <input
 type="text"
 required
 placeholder="e.g., Alfalfa hay sorting & visual feed mold quarantine"
 value={operation}
 onChange={(e) => setOperation(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2.5 font-bold text-xs"
 />
 </div>

 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 When is it done? (Temporal cadence/Cadence triggers)
 </label>
 <input
 type="text"
 required
 placeholder="e.g., Every Monday at 8:00 AM, or Week 5 post-calving"
 value={when}
 onChange={(e) => setWhen(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2.5 font-bold text-xs"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 Scheduled Executing Date
 </label>
 <input
 type="date"
 required
 value={targetDate}
 onChange={(e) => setTargetDate(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2.5 font-bold text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 Assigned Owner / Team
 </label>
 <input
 type="text"
 placeholder="e.g., Milking Crew, Dr. Peter"
 value={assignedTo}
 onChange={(e) => setAssignedTo(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2.5 font-bold text-xs"
 />
 </div>
 </div>

 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 How is it executed? (Action SOP)
 </label>
 <textarea
 required
 rows={2}
 placeholder="e.g., Pull visual samples from center of silage stack. Sift manually for white, pinkish spores. Dump or lock moldy silage slices in safe quarantine dump."
 value={how}
 onChange={(e) => setHow(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2 font-semibold text-xs leading-relaxed"
 />
 </div>

 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">
 Why is it vital? (Technical agricultural justification)
 </label>
 <textarea
 required
 rows={2}
 placeholder="e.g., Silage mold contains deadly mycotoxins like aflatoxins that trigger immediate dairy liver damage and induce spontaneous calving abortions."
 value={why}
 onChange={(e) => setWhy(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2 font-semibold text-xs leading-relaxed"
 />
 </div>

 <div className="flex gap-2 pt-2 border-t border-gray-100">
 <button
 type="button"
 onClick={() => setShowAddModal(false)}
 className="flex-1 bg-slate-50 border border-gray-200 hover:bg-slate-50 border border-gray-200 text-gray-900 font-medium font-semibold  text-xs rounded-xl py-3 transition-colors cursor-pointer border-0 m-0"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="flex-1 bg-white hover:bg-emerald-900 text-gray-900 font-semibold  text-xs rounded-xl py-3 transition-colors cursor-pointer border-0 m-0"
 >
 Save SOP Task
 </button>
 </div>

 </form>
 </div>
 </div>
 )}

 {/* FAIL-SAFE IN-APP SIMULATED NOTIFICATION DIALOG */}
 {activeNotificationAlert && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 font-sans animate-fadeIn">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 space-y-6 border border-amber-200 animate-scaleUp relative overflow-hidden">
 {/* Top caution stripe */}
 <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 animate-pulse"></div>
 
 <div className="flex items-start gap-4">
 <div className="p-3 bg-amber-900/20 text-amber-600 rounded-2xl shrink-0 animate-bounce">
 <BellRing size={28} />
 </div>
 <div className="space-y-1">
 <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-semibold tracking-tight">
 ⚠️ Fail-Safe Active Alarm
 </span>
 <h3 className="text-lg font-semibold text-gray-500 leading-tight">
 {activeNotificationAlert.title}
 </h3>
 </div>
 </div>

 <div className="bg-slate-50 border border-gray-200 border border-gray-200 p-4 rounded-2xl space-y-2">
 <span className="text-[10px] font-bold text-gray-900 font-medium tracking-tight block">Standard Operating Procedure:</span>
 <p className="text-xs text-gray-900 font-semibold leading-relaxed">
 {activeNotificationAlert.bodyText}
 </p>
 </div>

 {/* Sandbox explaining notice */}
 <div className="p-3 bg-indigo-900/20 border border-indigo-100 rounded-xl flex gap-3 text-[11px] text-indigo-950 leading-normal font-medium">
 <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
 <div>
 <p className="font-semibold text-indigo-900">Why did this pop up here?</p>
 <p className="text-indigo-805 mt-0.5">
 Because this app is running in a **sandboxed preview frame**, browsers block taskbar/lockscreen notifications. Open the application in a **New Tab** (top right) to authorize native system push alerts.
 </p>
 </div>
 </div>

 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => setActiveNotificationAlert(null)}
 className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-gray-500 font-semibold  text-xs rounded-xl py-3.5 transition-all cursor-pointer border-0 m-0 shadow-md shadow-amber-500/15"
 >
 Acknowledge Alert & Mute SOP
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
