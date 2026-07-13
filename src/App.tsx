/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, Component, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Truck,
  Activity,
  Heart,
  Leaf,
  Sprout,
  Coins,
  Warehouse,
  FileText,
  Clock,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  Printer,
  Download,
  FileDown,
  ArrowLeft,
  Database,
  BookOpen,
  CalendarDays,
  Settings,
  DollarSign,
  Award,
  Droplets,
  HeartPulse,
  Sparkles,
  Compass,
  Shield,
  Monitor
} from 'lucide-react';

import { realtimeDb, db, isFirestoreSyncEnabled } from './firebase';
import { ref, push, set } from 'firebase/database';
import { getStoredSettings, applyOrientationPreference } from './utils/settingsHelper';
import { toIsoDate } from './utils/dateHelper';
import { buildDefaultDeductLogs, buildDefaultDiagnosticHistory, buildDefaultTimetable } from './utils/appFallbacks';
import { buildReportPdfFilename } from './utils/reportHelper';
import { AiAdvisor } from './components/AiAdvisor';
import { FirebaseSyncer } from './components/FirebaseSyncer';
import { FarmProvider, useFarmState } from './context/FarmContext';
import { LandingPage } from './components/LandingPage';
import { auth } from './firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';

const CLOUD_SYNC_PREF_KEY = 'jr_farm_cloud_sync_enabled';
const MOBILE_MENU_HINT_SEEN_KEY = 'jr_farm_mobile_menu_hint_seen';
const INITIAL_ALARM_RENDER_LIMIT = 8;

// Modular Subcomponents (Lazy Loaded)
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Roster = React.lazy(() => import('./components/Roster').then(m => ({ default: m.Roster })));
const FeedFormulator = React.lazy(() => import('./components/FeedFormulator').then(m => ({ default: m.FeedFormulator })));
const TmrMixing = React.lazy(() => import('./components/TmrMixing').then(m => ({ default: m.TmrMixing })));
const DairyBreeding = React.lazy(() => import('./components/DairyBreeding').then(m => ({ default: m.DairyBreeding })));
const Horticulture = React.lazy(() => import('./components/Horticulture').then(m => ({ default: m.Horticulture })));
const AzollaManager = React.lazy(() => import('./components/AzollaManager').then(m => ({ default: m.AzollaManager })));
const SprayLog = React.lazy(() => import('./components/SprayLog').then(m => ({ default: m.SprayLog })));
const Financials = React.lazy(() => import('./components/Financials').then(m => ({ default: m.Financials })));
const OtherSections = React.lazy(() => import('./components/OtherSections').then(m => ({ default: m.OtherSections })));
const BackupCenter = React.lazy(() => import('./components/BackupCenter').then(m => ({ default: m.BackupCenter })));
const FarmerAcademy = React.lazy(() => import('./components/FarmerAcademy'));
const OperationsSchedule = React.lazy(() => import('./components/OperationsSchedule'));
const SettingsCenter = React.lazy(() => import('./components/SettingsCenter').then(m => ({ default: m.SettingsCenter })));

// Master Types
import {
  MilkingRecord,
  AIRecord,
  TeaRecord,
  AvocadoRecord,
  FinancialRecord,
  SprayRecord,
  Todo,
  Ingredient,
  StaffMember,
  LivestockRecord,
  FieldRecord,
  InventoryItem,
  StaffOffRecord,
  Cow,
  VetRecord,
  GoatRecord,
  CalfRecord,
  BsfRecord,
  CropOpRecord,
  CropSaleRecord,
  AnimalSaleRecord,
  MortalityRecord,
  MilkOutflowRecord,
  SemenInventoryItem,
  SilageRecord,
  HeiferRecord,
  PoultryRecord,
  QuarantineRecord,
  ActivityLogEntry
} from './types';



export const LOGO_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="emerald" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <!-- Circular Badge Backdrop -->
  <rect width="256" height="256" rx="48" fill="#022c22" />
  <!-- Main Emblem -->
  <!-- Outer glowing green-gold circle -->
  <circle cx="128" cy="128" r="96" fill="none" stroke="url(#gold)" stroke-width="6" />
  <circle cx="128" cy="128" r="88" fill="none" stroke="url(#emerald)" stroke-width="1.5" stroke-dasharray="8 4" />

  <!-- Stylized Sunrays at top -->
  <g stroke="url(#gold)" stroke-width="3" stroke-linecap="round" opacity="0.8">
    <line x1="128" y1="52" x2="128" y2="60" />
    <line x1="108" y1="56" x2="112" y2="64" />
    <line x1="148" y1="56" x2="144" y2="64" />
    <line x1="92" y1="68" x2="98" y2="74" />
    <line x1="164" y1="68" x2="158" y2="74" />
  </g>

  <!-- Elegant Tea Plant & Crown design -->
  <g transform="translate(128, 130)">
    <!-- Center Tea Leaf -->
    <path d="M0,-50 C12,-20 8,-5 0,10 C-8,-5 -12,-20 0,-50 Z" fill="url(#emerald)" />
    <!-- Left Leaf -->
    <path d="M-3,-35 C-25,-25 -25,-5 -8,5 C-5,-5 2,-20 -3,-35 Z" fill="url(#emerald)" opacity="0.9" />
    <!-- Right Leaf -->
    <path d="M3,-35 C25,-25 25,-5 8,5 C5,-5 -2,-20 3,-35 Z" fill="url(#emerald)" opacity="0.9" />
    
    <!-- Central stalk with grain details -->
    <path d="M0,10 L0,-30" stroke="url(#gold)" stroke-width="3.5" stroke-linecap="round" />
    
    <!-- Grain kernels (L & R) -->
    <path d="M-2,-10 C-10,-14 -10,-8 -2,-4" fill="url(#gold)" />
    <path d="M2,-10 C10,-14 10,-8 2,-4" fill="url(#gold)" />
    <path d="M-2,-20 C-10,-24 -10,-18 -2,-14" fill="url(#gold)" />
    <path d="M2,-20 C10,-24 10,-18 2,-14" fill="url(#gold)" />

    <!-- Dairy Cow Silhouette overlay Representing Dairy -->
    <path d="M-22,12 C-22,-2 -30,2 -35,2 C-38,2 -36,8 -30,10 C-24,11 -18,18 0,18 C18,18 24,11 30,10 C36,8 38,2 35,2 C30,2 22,-2 22,12 C20,24 15,28 0,28 C-15,28 -20,24 -22,12 Z" fill="#ffffff" />
    <!-- Golden Horns -->
    <path d="M-20,6 C-24,-2 -28,-6 -34,-4 C-32,2 -26,4 -21,8" fill="url(#gold)" />
    <path d="M20,6 C24,-2 28,-6 34,-4 C32,2 26,4 21,8" fill="url(#gold)" />
  </g>

  <!-- Crown on Top -->
  <path d="M112,82 L116,92 L128,86 L140,92 L144,82 L136,85 L128,78 L120,85 Z" fill="url(#gold)" />
  
  <!-- "JR" initials in the middle center base -->
  <text x="128" y="205" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="2">JR</text>
  <text x="128" y="218" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="9" fill="url(#gold)" text-anchor="middle" letter-spacing="1.5" opacity="0.95">ESTATE</text>
</svg>`;

class ErrorBoundary extends (Component as any) {
  state = { hasError: false, error: null, errorInfo: null };

  constructor(props: { children: ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '25px', backgroundColor: '#fef2f2', color: '#991b1b', height: '100vh', overflow: 'auto', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Application Crashed!</h2>
          <p style={{ fontWeight: 'bold' }}>Please send this error message to the developer:</p>
          <pre style={{ backgroundColor: '#fee2e2', padding: '15px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #fca5a5' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #e2e8f0', color: '#334155', marginTop: '15px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}



export default function App() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasEnteredApp, setHasEnteredApp] = useState(() => {
    return sessionStorage.getItem('jr_farm_entered') === 'true';
  });

  useEffect(() => {
    // Handle redirect result explicitly for mobile browsers
    getRedirectResult(auth).then((result) => {
      if (result && result.user) {
        sessionStorage.setItem('jr_farm_entered', 'true');
        setHasEnteredApp(true);
      }
    }).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        sessionStorage.setItem('jr_farm_entered', 'true');
        setHasEnteredApp(true);
      }
      setIsAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleEnter = (uid?: string) => {
    sessionStorage.setItem('jr_farm_entered', 'true');
    setHasEnteredApp(true);
  };

  if (isAuthLoading && !hasEnteredApp) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <FarmProvider>
      {!hasEnteredApp ? (
        <LandingPage onEnter={handleEnter} />
      ) : (
        <FarmCoreApp />
      )}
    </FarmProvider>
  );
}

function FarmCoreApp() {
  const getStoredFeedFormula = () => {
    try {
      const saved = localStorage.getItem('jr_farm_feed_formulator_batch');
      if (saved) {
        return JSON.parse(saved) as { id: string; name: string; amount: number }[];
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'b-1', name: 'Maize Germ Meal', amount: 50 },
      { id: 'b-2', name: 'Wheat Pollard Base', amount: 25 },
      { id: 'b-3', name: 'Cotton Seed Cake (Expeller)', amount: 15 },
      { id: 'b-4', name: 'Soya Bean Meal (Solvent)', amount: 8 },
      { id: 'b-5', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ];
  };

  const getIngredientNutrients = (name: string): { cp: number; me: number; cost: number } => {
    const custom = (ingredients || []).find(i => i.name.toLowerCase() === name.toLowerCase());
    if (custom) {
      return { cp: custom.cp, me: custom.me, cost: custom.cost || 40 };
    }
    const baseList: Record<string, { cp: number; me: number; cost: number }> = {
      'maize germ meal': { cp: 11.0, me: 12.0, cost: 35 },
      'wheat pollard base': { cp: 15.0, me: 11.5, cost: 32 },
      'soya bean meal (solvent)': { cp: 44.0, me: 13.5, cost: 95 },
      'cotton seed cake (expeller)': { cp: 38.0, me: 10.5, cost: 58 },
      'dicalcium phosphate (dcp)': { cp: 0.1, me: 0, cost: 180 },
      'lime / limestone powder': { cp: 0.1, me: 0, cost: 15 },
      'fish meal (60% protein)': { cp: 60.0, me: 12.5, cost: 140 },
      'sunflower seed meal (decorticated)': { cp: 32.0, me: 9.5, cost: 48 },
      'napier grass (pennisetum purpureum)': { cp: 8.5, me: 7.8, cost: 8 },
      'lucerne / alfalfa hay (grade a)': { cp: 19.5, me: 10.2, cost: 45 },
      'maize silage (dough stage)': { cp: 8.1, me: 10.5, cost: 15 },
      'brachiaria grass (b. decumbens)': { cp: 10.2, me: 8.5, cost: 12 },
      'rhodes grass hay (chloris gayana)': { cp: 7.8, me: 8.0, cost: 18 },
      'boma rhodes premium bales': { cp: 8.5, me: 8.2, cost: 22 }
    };
    const key = name.toLowerCase().trim();
    if (baseList[key]) return baseList[key];
    for (const [k, v] of Object.entries(baseList)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return { cp: 12.0, me: 9.5, cost: 30 };
  };

  // Dynamic Settings Configuration and Orientation States
  const [farmSettings, setFarmSettings] = useState(() => getStoredSettings());
  const [viewportOrientation, setViewportOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dash');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [liveTime, setLiveTime] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(false);
    }
  }, [activeTab]);
 
  // Sidebar enhancement states
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [slimSidebar, setSlimSidebar] = useState<boolean>(false);

  // Sandbox and PWA install helpers
  const [isInIframeSandbox, setIsInIframeSandbox] = useState<boolean>(false);
  const [dismissedPwaBanner, setDismissedPwaBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jr_farm_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsInIframeSandbox(window.self !== window.top);
    } catch (e) {
      setIsInIframeSandbox(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePwaInstallAction = async () => {
    if (isInIframeSandbox) {
      alert("Browser Security Notice: Direct application installation is completely disabled inside sandboxed preview frames (iframes).\n\nPlease click the green banner at the top of the app to launch it in a New Tab, then use either our header 'Install' button or Chrome's address bar to install it as a native PC desktop app instantly!");
      return;
    }
    if (!deferredPrompt) {
      setActiveTab('settings');
      triggerAppToastMessage("Opened Settings. Select 'PC & Mobile Install' to read step-by-step installation guides!");
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Installation outcome: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error("Installation error:", err);
    }
  };

  // Reports composer filter states
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('ALL');
  const [reportDateFilter, setReportDateFilter] = useState<string>('all'); // all, today, week, month, last3months, last6months, specific_month, month_interval, year, custom
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportSpecificMonth, setReportSpecificMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reportStartMonth, setReportStartMonth] = useState<string>(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reportEndMonth, setReportEndMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const isRecordInSelectedDateRange = (dateInput: any): boolean => {
    if (!dateInput) return true;
    
    let recordDate: Date;
    if (typeof dateInput === 'string') {
      const datePart = dateInput.split(' ')[0];
      recordDate = new Date(datePart);
    } else if (typeof dateInput === 'number') {
      recordDate = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      recordDate = dateInput;
    } else {
      return true; // Unrecognized type, don't filter it out and don't crash
    }

    if (isNaN(recordDate.getTime())) return true;

    const rDate = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
    
    const today = new Date();
    const tDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (reportDateFilter === 'all') {
      return true;
    }
    
    if (reportDateFilter === 'today') {
      return rDate.getTime() === tDate.getTime();
    }
    
    if (reportDateFilter === 'week') {
      const oneWeekAgo = new Date(tDate);
      oneWeekAgo.setDate(tDate.getDate() - 7);
      return rDate >= oneWeekAgo && rDate <= tDate;
    }
    
    if (reportDateFilter === 'month') {
      const oneMonthAgo = new Date(tDate);
      oneMonthAgo.setDate(tDate.getDate() - 30);
      return rDate >= oneMonthAgo && rDate <= tDate;
    }

    if (reportDateFilter === 'last3months') {
      const startLimit = new Date(tDate);
      startLimit.setMonth(tDate.getMonth() - 3);
      return rDate >= startLimit && rDate <= tDate;
    }

    if (reportDateFilter === 'last6months') {
      const startLimit = new Date(tDate);
      startLimit.setMonth(tDate.getMonth() - 6);
      return rDate >= startLimit && rDate <= tDate;
    }

    if (reportDateFilter === 'specific_month' && reportSpecificMonth) {
      const [yearStr, monthStr] = reportSpecificMonth.split('-');
      const targetYear = parseInt(yearStr, 10);
      const targetMonth = parseInt(monthStr, 10) - 1; // 0-indexed month
      return rDate.getFullYear() === targetYear && rDate.getMonth() === targetMonth;
    }

    if (reportDateFilter === 'month_interval') {
      const startStr = reportStartMonth || '';
      const endStr = reportEndMonth || '';
      
      let sDate: Date | null = null;
      let eDate: Date | null = null;
      
      if (startStr) {
        const [sy, sm] = startStr.split('-');
        sDate = new Date(parseInt(sy, 10), parseInt(sm, 10) - 1, 1);
      }
      if (endStr) {
        const [ey, em] = endStr.split('-');
        // set to the last day of that month
        eDate = new Date(parseInt(ey, 10), parseInt(em, 10), 0);
      }
      
      if (sDate && eDate) {
        return rDate >= sDate && rDate <= eDate;
      } else if (sDate) {
        return rDate >= sDate;
      } else if (eDate) {
        return rDate <= eDate;
      }
      return true;
    }
    
    if (reportDateFilter === 'year') {
      const oneYearAgo = new Date(tDate);
      oneYearAgo.setDate(tDate.getDate() - 365);
      return rDate >= oneYearAgo && rDate <= tDate;
    }
    
    if (reportDateFilter === 'custom') {
      const start = reportStartDate ? new Date(reportStartDate) : null;
      const end = reportEndDate ? new Date(reportEndDate) : null;
      
      const sDate = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
      const eDate = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;

      if (sDate && eDate) {
        return rDate >= sDate && rDate <= eDate;
      } else if (sDate) {
        return rDate >= sDate;
      } else if (eDate) {
        return rDate <= eDate;
      }
      return true;
    }

    return true;
  };

  const getReportPeriodString = (): string => {
    if (reportDateFilter === 'all') return 'All-Time Historical';
    if (reportDateFilter === 'today') return `Today (${new Date().toLocaleDateString()})`;
    if (reportDateFilter === 'week') return 'Past 7 Days';
    if (reportDateFilter === 'month') return 'Past 30 Days';
    if (reportDateFilter === 'last3months') return 'Past 3 Months';
    if (reportDateFilter === 'last6months') return 'Past 6 Months';
    if (reportDateFilter === 'specific_month' && reportSpecificMonth) {
      const [y, m] = reportSpecificMonth.split('-');
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
    }
    if (reportDateFilter === 'month_interval') {
      const formatMonth = (str: string) => {
        if (!str) return '?';
        const [y, m] = str.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
      };
      return `${formatMonth(reportStartMonth)} to ${formatMonth(reportEndMonth)}`;
    }
    if (reportDateFilter === 'year') return 'Past 12 Months';
    if (reportDateFilter === 'custom') {
      return `${reportStartDate || '?'} to ${reportEndDate || '?'}`;
    }
    return 'Selected Interval';
  };

  // Unified Sensitive Alarms Notification engine states
  const [bellNotificationTrayOpen, setBellNotificationTrayOpen] = useState<boolean>(false);
  const [notificationPermissionState, setNotificationPermissionState] = useState<NotificationPermission>('default');
  const [isAuthorizingPush, setIsAuthorizingPush] = useState<boolean>(false);
  const [failSafeNotificationModal, setFailSafeNotificationModal] = useState<{ title: string; body: string } | null>(null);
  const [appToastMessage, setAppToastMessage] = useState<string | null>(null);
  const [userCloudSyncEnabled, setUserCloudSyncEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CLOUD_SYNC_PREF_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  const [selectedRingtone, setSelectedRingtone] = useState<string>(() => {
    return localStorage.getItem('jr_farm_notification_ringtone') || 'chime';
  });
  const [continuousLoop, setContinuousLoop] = useState<boolean>(() => {
    return localStorage.getItem('jr_farm_notification_loop') === 'true';
  });
  const [activeAudioSource, setActiveAudioSource] = useState<any>(null);
  const [alarmRenderLimit, setAlarmRenderLimit] = useState<number>(INITIAL_ALARM_RENDER_LIMIT);
  const [bellTrayContentReady, setBellTrayContentReady] = useState<boolean>(false);
  const bellTrayWasOpenRef = useRef<boolean>(false);
  const alarmRenderUpgradeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bellTrayContentRafRef = useRef<number | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermissionState(Notification.permission);
    }
    // Retrieve and apply the user's saved screen orientation lock/auto-rotate setting
    try {
      const stored = getStoredSettings();
      if (stored && stored.orientationPreference) {
        applyOrientationPreference(stored.orientationPreference);
      }
    } catch (e) {
      console.warn("Could not apply initial orientation settings:", e);
    }
  }, []);

  useEffect(() => {
    const refreshCloudSyncPreference = () => {
      try {
        setUserCloudSyncEnabled(localStorage.getItem(CLOUD_SYNC_PREF_KEY) !== 'false');
      } catch (_) {
        setUserCloudSyncEnabled(true);
      }
    };

    window.addEventListener('storage', refreshCloudSyncPreference);
    window.addEventListener('jr-farm-sync-pref-updated', refreshCloudSyncPreference as EventListener);
    return () => {
      window.removeEventListener('storage', refreshCloudSyncPreference);
      window.removeEventListener('jr-farm-sync-pref-updated', refreshCloudSyncPreference as EventListener);
    };
  }, []);

  const headerCloudSyncStatus = !isFirestoreSyncEnabled
    ? { label: 'SYNC LOCKED', tone: 'text-slate-600 bg-slate-100 border-slate-200' }
    : !userCloudSyncEnabled
      ? { label: 'SYNC PAUSED', tone: 'text-amber-800 bg-amber-50 border-amber-200' }
      : !db
        ? { label: 'SYNC OFFLINE', tone: 'text-rose-800 bg-rose-50 border-rose-200' }
        : { label: 'SYNC ENABLED', tone: 'text-emerald-800 bg-emerald-50 border-emerald-200' };

  const triggerAppToastMessage = (txt: string) => {
    setAppToastMessage(txt);
    setTimeout(() => setAppToastMessage(null), 4000);
  };

  // Main Persistent States consumed from unified Context
  const {
    staffList, setStaffList,
    ingredients, setIngredients,
    milkRecords, setMilkRecords,
    aiRecords, setAiRecords,
    teaRecords, setTeaRecords,
    avoRecords, setAvoRecords,
    financials, setFinancials,
    sprayRecords, setSprayRecords,
    milkOutflows, setMilkOutflows,
    todos, setTodos,
    fields, setFields,
    livestock, setLivestock,
    inventory, setInventory,
    staffOffRecords, setStaffOffRecords,
    cows, setCows,
    vetRecords, setVetRecords,
    goatRecords, setGoatRecords,
    calfRecords, setCalfRecords,
    bsfRecords, setBsfRecords,
    cropOps, setCropOps,
    cropSales, setCropSales,
    animalSales, setAnimalSales,
    mortalities, setMortalities,
    activityLogs, setActivityLogs,
    silageRecords, setSilageRecords,
    heiferRecords, setHeiferRecords,
    poultryRecords, setPoultryRecords,
    quarantineRecords, setQuarantineRecords,
    semenInventory, setSemenInventory,
    azollaRecords, setAzollaRecords
  } = useFarmState();

  // Report modal state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const getStoredDiagHistory = () => {
    try {
      const saved = localStorage.getItem('jr_farm_diagnostic_history');
      return saved ? JSON.parse(saved) : buildDefaultDiagnosticHistory();
    } catch {
      return [];
    }
  };

  const getStoredDeductLogs = () => {
    try {
      const saved = localStorage.getItem('jr_farm_academy_auto_deduct_logs');
      return saved ? JSON.parse(saved) : buildDefaultDeductLogs();
    } catch {
      return [];
    }
  };

  const getStoredTimetable = () => {
    try {
      const saved = localStorage.getItem('jr_farm_custom_timetable');
      return saved ? JSON.parse(saved) : buildDefaultTimetable();
    } catch {
      return [];
    }
  };

  const generateHtmlReportContent = (sections: Record<string, boolean>): string => {
    // Override raw records with the filtered records in the scope of this function
    const milkRecords = filteredMilkRecords;
    const milkOutflows = filteredMilkOutflows;
    const aiRecords = filteredAiRecords;
    const silageRecords = filteredSilageRecords;
    const heiferRecords = filteredHeiferRecords;
    const teaRecords = filteredTeaRecords;
    const avoRecords = filteredAvoRecords;
    const cropSales = filteredCropSales;
    const financials = filteredFinancials;
    const sprayRecords = filteredSprayRecords;
    const quarantineRecords = filteredQuarantineRecords;
    const goatRecords = filteredGoatRecords;
    const calfRecords = filteredCalfRecords;
    const bsfRecords = filteredBsfRecords;
    const inventory = filteredInventory;
    const vetRecords = filteredVetRecords;
    const poultryRecords = filteredPoultryRecords;
    const staffOffRecords = filteredStaffOffRecords;
    const livestock = filteredLivestock;
    const todos = filteredTodos;
    
    const getStoredDiagHistory = () => filteredDiagHistory;
    const getStoredTimetable = () => filteredTimetable;
    
    // Calculated aggregates for financials inside this scope
    const activeIncome = reportIncome;
    const activeExpense = reportExpense;
    const activeNet = reportNetBalance;

    let sectionsHtml = '';
    
    // Helper for table header & body
    const buildTableHtml = (headers: string[], rows: string[][]) => {
      const headerRowHtml = headers.map(h => `<th style="text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; background-color: #f8fafc; color: #475569; font-weight: bold; font-family: sans-serif;">${h}</th>`).join('');
      const bodyRowsHtml = rows.map(r => {
        return `<tr style="border-bottom: 1px solid #f1f5f9;">` + r.map(cell => `<td style="padding: 10px; font-family: sans-serif;">${cell}</td>`).join('') + `</tr>`;
      }).join('');
      return `<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; margin-bottom: 25px;"><thead><tr>${headerRowHtml}</tr></thead><tbody>${bodyRowsHtml}</tbody></table>`;
    };

    // 1. Staff
    if (sections.staff) {
      const rows = staffList.map(st => [
        `<strong>${st.name}</strong>`,
        st.unit,
        st.shiftMorning,
        st.shiftAfternoon,
        `<strong>${st.status}</strong>`
      ]);
      
      let stOffHtml = '';
      if (staffOffRecords && staffOffRecords.length > 0) {
        const offRows = staffOffRecords.map(o => {
          const stName = staffList.find(s => s.id === o.staffId)?.name || o.staffId;
          return [
            `<strong>${stName}</strong>`,
            `<span style="font-family: monospace;">${o.startDate}</span>`,
            `<span style="font-family: monospace;">${o.endDate}</span>`,
            `<em>${o.reason}</em>`,
            `<strong>${o.dutyReliefCover || 'None'}</strong>`
          ];
        });
        stOffHtml = `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #475569; margin-top: 15px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #64748b; padding-left: 6px;">
            Allocated Shift Off & Duty Leaves Log
          </h4>
          ${buildTableHtml(['Employee on Leave', 'Start Date', 'Resume Date', 'Sovereign Leave Reason', 'Relief Partner Cover'], offRows)}
        `;
      }

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Staff Deployment Schedule</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${staffList.length} staff)</span>
          </h3>
          ${buildTableHtml(['Name', 'Section', 'Morning Shift', 'Afternoon Shift', 'Duty Status'], rows)}
          ${stOffHtml}
        </div>
      `;
    }

    // 2. Milk
    if (sections.milk) {
      const rows = milkRecords.map(m => [
        `<span style="font-family: monospace; font-weight: bold;">${m.date}</span>`,
        `<strong>${m.id}</strong>`,
        (m.am ?? 0).toFixed(1),
        (m.pm ?? 0).toFixed(1),
        `<strong>${((m.am ?? 0) + (m.pm ?? 0)).toFixed(1)} L</strong>`,
        m.staff
      ]);
      
      let outflowsHtml = '';
      if (milkOutflows && milkOutflows.length > 0) {
        const outRows = milkOutflows.map(mo => {
          const dayMilks = milkRecords.filter(r => r.date === mo.date);
          const yieldTotal = dayMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
          const home = mo.milkUsedAtHome || 0;
          const workers = mo.milkUsedByWorkers || 0;
          const calf = mo.milkUsedByCalf || 0;
          const spoiled = mo.milkSpoiled || 0;
          const consumed = home + workers + calf + spoiled;
          const netSold = Math.max(0, yieldTotal - consumed);
          const price = (mo as any).salesPricePerLiter ?? 52;
          const revenue = netSold * price;
          
          return [
            `<span style="font-family: monospace; font-weight: bold;">${mo.date}</span>`,
            `<strong>Market Sales (Direct)</strong> <span style="font-size: 9px; color: #64748b;">(Home: ${home}L | Staff: ${workers}L | Calf: ${calf}L | Spoilt: ${spoiled}L)</span>`,
            `<strong>${netSold.toFixed(1)} L</strong>`,
            `Ksh ${price}`,
            `<span style="color: #166534; font-weight: bold;">Ksh ${revenue.toLocaleString()}</span>`,
            `<span style="color: ${mo.debtsKsh > 0 ? '#b91c1c' : '#166534'};">Ksh ${mo.debtsKsh.toLocaleString()}</span>`
          ];
        });
        outflowsHtml = `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #475569; margin-top: 15px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #64748b; padding-left: 6px;">
            Dairy Bulk Sales, Consumption & Outflow Dispatches
          </h4>
          ${buildTableHtml(['Dispatch Date', 'Client/Destination / Consumption Breakdown', 'Volume Sold', 'Price/L', 'Gross Revenue', 'Pending Debt'], outRows)}
        `;
      }

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Dairy Production Log</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${milkRecords.length} records)</span>
          </h3>
          ${buildTableHtml(['Date', 'Cow Tag ID', 'AM Liters', 'PM Liters', 'Total Yield', 'Milker'], rows)}
          ${outflowsHtml}
        </div>
      `;
    }

    // 3. AI
    if (sections.ai) {
      const rows = aiRecords.map(ai => [
        `<strong>${ai.cowId}</strong>`,
        `<span style="font-family: monospace;">${ai.date}</span>`,
        `<span style="font-style: italic; color: #475569;">${ai.bull}</span>`,
        `<span style="font-family: monospace; font-weight: bold;">${ai.due}</span>`,
        `<span style="font-weight: bold;">${ai.status}</span>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Artificial Insemination & Breeding</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${aiRecords.length} cycles)</span>
          </h3>
          ${buildTableHtml(['Cow Tag ID', 'Service Date', 'Bull Name/Semen Ref', 'Expected Due', 'Pregnancy Status'], rows)}
        </div>
      `;

      // Add Semen Straw Inventory table
      const semenRows = semenInventory.map(s => [
        `<strong>${s.id}</strong>`,
        `<strong>${s.bullName}</strong>`,
        `<span>${s.breed}</span>`,
        `<span>${s.semenType}</span>`,
        `<span style="font-size: 11px; color: #475569;">${s.origin}</span>`,
        `<span style="font-family: monospace; font-weight: bold;">Ksh ${s.cost.toLocaleString()}</span>`,
        `<span style="font-family: monospace; font-weight: bold; color: ${s.quantity <= 3 ? '#b91c1c' : '#1e293b'};">${s.quantity} units</span>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Genetic Semen Straw Stock Inventory</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${semenInventory.length} lines)</span>
          </h3>
          ${buildTableHtml(['Straw ID/Ref', 'Sire/Bull Name', 'Breed', 'Semen Type', 'Origin', 'Straw Cost', 'Stock Quantity'], semenRows)}
        </div>
      `;
    }

    // 3.5 Cattle Breeders Registry
    if (sections.cows || sections.cows_registry) {
      const cowRows = cows.map(c => [
        `<span style="font-family: monospace; font-weight: bold; color: #047857;">${c.id}</span>`,
        `<strong>${c.name}</strong>`,
        `<span style="font-weight: bold;">${c.breed}</span>`,
        `<span style="font-family: monospace;">${c.dob}</span>`,
        `<div style="font-size: 11px; line-height: 1.2;">
           <div>Sire: <span style="color: #475569;">${c.sire || 'Imported Semen Specimen'}</span></div>
           <div style="margin-top: 1px;">Dam: <span style="color: #475569;">${c.dam || 'Acr-Grade Sire Maternal'}</span></div>
         </div>`,
        `<span style="font-family: monospace; font-weight: 600;">${c.registrationNo || 'UNREG-PENDING'}</span>`,
        `<span style="font-weight: bold; text-transform: uppercase; color: ${
          c.status === 'Lactating' ? '#047857' : c.status === 'In-Calf' ? '#1d4ed8' : '#64748b'
        }; font-size: 10px;">${c.status}</span>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Registered Dairy Breeders Directory (Cattle Registry)</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${cows.length} head)</span>
          </h3>
          ${buildTableHtml(['Ear Tag ID', 'Breed Group Name', 'Breed', 'Date of Birth', 'Maternal & Sire Pedigree', 'Official Registry ID', 'Breeding Status'], cowRows)}
        </div>
      `;
    }

    // 3.6 Cattle Sales & Mortality Ledger
    if (sections.life_ledger || sections.cattle_sales || sections.cattle_mortality) {
      let lifeLedgerHtml = '';
      if (animalSales && animalSales.length > 0 && (sections.life_ledger || sections.cattle_sales)) {
        const salesRows = animalSales.map(as => [
          `<span style="font-family: monospace;">${as.date}</span>`,
          `<strong>${as.animalId}</strong> (${as.animalType})`,
          `${as.weightKg || 'N/A'} kg`,
          `<strong>Ksh ${as.price.toLocaleString()}</strong>`,
          as.buyerName,
          as.notes || 'No notes'
        ]);
        lifeLedgerHtml += `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #475569; margin-top: 15px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #b91c1c; padding-left: 6px;">
            Cattle Animal Disposals & Sales Ledger
          </h4>
          ${buildTableHtml(['Date', 'Animal Tag ID (Type)', 'Weight (KG)', 'Revenue', 'Customer / Buyer', 'Authorized Note'], salesRows)}
        `;
      }
      if (mortalities && mortalities.length > 0 && (sections.life_ledger || sections.cattle_mortality)) {
        const mortRows = mortalities.map(m => [
          `<span style="font-family: monospace;">${m.date}</span>`,
          `<strong>${m.animalId}</strong> (${m.animalType})`,
          `<em style="color: #b91c1c;">${m.causeDescription}</em>`,
          m.disposalSop,
          m.managerSignOffBy
        ]);
        lifeLedgerHtml += `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #475569; margin-top: 25px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #b91c1c; padding-left: 6px;">
            Cattle Mortalities, Stillbirths & Loss Registers
          </h4>
          ${buildTableHtml(['Mortality Date', 'Animal Tag ID (Type)', 'Primary Cause of Death / Diagnosis', 'Disposal SOP Routine', 'Authorized Sign-off Officer'], mortRows)}
        `;
      }

      if (lifeLedgerHtml) {
        sectionsHtml += `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
              <span>Cattle Sales & Mortality Ledger</span>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">(Disposal logs)</span>
            </h3>
            ${lifeLedgerHtml}
          </div>
        `;
      }
    }

    // 4. Tea Harvest
    if (sections.tea) {
      const rows = teaRecords.map(t => [
        `<span style="font-family: monospace;">${t.date}</span>`,
        `<strong>${t.ref}</strong>`,
        t.buyer || 'Chinga KTDA',
        `<strong>${t.qty.toLocaleString()} KG</strong>`,
        `<span style="color: #166534; font-weight: bold; font-family: monospace;">Ksh ${(t.totalSales || (t.qty * (t.pricePerKg ?? 58))).toLocaleString()}</span>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Tea Exports Harvest & Deliveries</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${teaRecords.length} dispatches)</span>
          </h3>
          ${buildTableHtml(['Date', 'Plucking Ref', 'Factory Buyer', 'Harvest Weight', 'Gross Revenue'], rows)}
        </div>
      `;
    }

    // 5. Avocado
    if (sections.avo) {
      const rows = avoRecords.map(item => [
        `<span style="font-family: monospace;">${item.date}</span>`,
        `<strong>${item.ref}</strong>`,
        `${item.grade1Kg} kg`,
        `Ksh ${item.grade1PricePerKg}`,
        `${item.rejectKg} kg`,
        `Ksh ${item.priceForRejects}`,
        item.grade1Buyer,
        item.rejectBuyer,
        item.paymentModeNextHarvestSeason,
        `Ksh ${item.debts.toLocaleString()}`,
        `<span style="color: #166534; font-weight: bold; font-family: monospace;">Ksh ${item.totalSales.toLocaleString()}</span>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Avocado Export Grading & Logistics</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${avoRecords.length} records)</span>
          </h3>
          ${buildTableHtml(['Date', 'Ref', 'Grade 1 KG', 'Price/KG', 'Reject KG', 'Reject Price/KG', 'G1 Buyer', 'Reject Buyer', 'Payment Mode', 'Debts', 'Total Money Got'], rows)}
        </div>
      `;
    }

    // 6. Crop Sales
    if (sections.cropSales) {
      const rows = cropSales.map(cs => [
        `<span style="font-family: monospace;">${cs.date}</span>`,
        `<strong>${cs.crop}</strong>`,
        `${cs.qty} ${cs.unit}`,
        `<span style="font-family: monospace;">Ksh ${cs.pricePerUnit}</span>`,
        `<span style="color: #166534; font-weight: bold; font-family: monospace;">Ksh ${cs.totalSales.toLocaleString()}</span>`,
        cs.buyer
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Local Commodities Cash Transactions</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${cropSales.length} trades)</span>
          </h3>
          ${buildTableHtml(['Date', 'Commodity Crop', 'Quantity', 'Price per Unit', 'Gross Revenue', 'Buyer Name'], rows)}
        </div>
      `;
    }

    // 7. Financial Ledger
    if (sections.financials) {
      // Group financials by Category
      const grouped: Record<string, typeof financials> = {};
      financials.forEach(f => {
        const cat = f.category ? f.category.trim() : 'Uncategorized';
        if (!grouped[cat]) {
          grouped[cat] = [];
        }
        grouped[cat].push(f);
      });

      let tableBodyHtml = '';
      Object.entries(grouped).forEach(([catName, items]) => {
        // Calculate Category totals
        const catIncome = items.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const catExpense = items.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
        const catNet = catIncome - catExpense;

        // Add Category Section Header Row
        tableBodyHtml += `
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="4" style="padding: 8px 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #1e293b; border-bottom: 1.5px solid #cbd5e1; font-family: sans-serif;">
              Category: ${catName}
            </td>
          </tr>
        `;

        // Add item rows
        items.forEach(f => {
          tableBodyHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 10px; font-family: monospace; font-size: 12px;">${f.date}</td>
              <td style="padding: 8px 10px; font-family: sans-serif; font-size: 12px;">
                <strong>${f.category}</strong> <span style="font-size: 10px; color: #64748b;">(${f.description})</span>
              </td>
              <td style="padding: 8px 10px; font-family: sans-serif; font-size: 12px;">
                <span style="text-transform: uppercase; font-weight: bold; color: ${f.type === 'income' ? '#166534' : '#9a3412'};">${f.type}</span>
              </td>
              <td style="padding: 8px 10px; font-family: monospace; font-size: 12px;">
                <span style="font-weight: bold; color: ${f.type === 'income' ? '#166534' : '#9a3412'};">Ksh ${f.amount.toLocaleString()}</span>
              </td>
            </tr>
          `;
        });

        // Add Category Subtotal Row
        tableBodyHtml += `
          <tr style="background-color: #f8fafc; font-weight: bold; border-bottom: 2.5px solid #cbd5e1;">
            <td style="padding: 10px; color: #475569; font-family: sans-serif; font-size: 11px;">${catName} Subtotal</td>
            <td style="padding: 10px; color: #475569; font-family: sans-serif; font-size: 11px;" colspan="2">
              Income: <span style="color: #166534;">Ksh ${catIncome.toLocaleString()}</span> &bull; 
              Expense: <span style="color: #9a3412;">Ksh ${catExpense.toLocaleString()}</span>
            </td>
            <td style="padding: 10px; color: ${catNet >= 0 ? '#166534' : '#b91c1c'}; font-family: monospace; font-size: 12px;">
              Net: Ksh ${catNet.toLocaleString()}
            </td>
          </tr>
        `;
      });

      const tableHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; margin-bottom: 25px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; background-color: #f8fafc; color: #475569; font-weight: bold; font-family: sans-serif;">Date</th>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; background-color: #f8fafc; color: #475569; font-weight: bold; font-family: sans-serif;">Reference & Description</th>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; background-color: #f8fafc; color: #475569; font-weight: bold; font-family: sans-serif;">Type</th>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; background-color: #f8fafc; color: #475569; font-weight: bold; font-family: sans-serif;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableBodyHtml}
          </tbody>
        </table>
      `;

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Operational Accounting General Ledger</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${financials.length} journals)</span>
          </h3>
          ${tableHtml}
          
          <div style="margin-top: 10px; background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: sans-serif; font-size: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
            <div>
              <span style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 10px; display: block;">Period Income (Inflow)</span>
              <strong style="color: #166534; font-size: 14px; font-family: monospace;">Ksh ${activeIncome.toLocaleString()}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 10px; display: block;">Period Expense (Outflow)</span>
              <strong style="color: #9a3412; font-size: 14px; font-family: monospace;">Ksh ${activeExpense.toLocaleString()}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 10px; display: block;">Period Net Subtotal</span>
              <strong style="color: ${activeNet >= 0 ? '#166534' : '#b91c1c'}; font-size: 14px; font-family: monospace;">Ksh ${activeNet.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      `;
    }

    // 8. Spray
    if (sections.spray) {
      const rows = sprayRecords.map(s => [
        `<strong>${s.block}</strong>`,
        `<em>${s.chemical}</em>`,
        `<span style="font-weight: bold; color: #9a3412; font-family: monospace;">${s.phi} Days</span>`,
        s.target,
        `<span style="font-weight: bold; color: #166534; font-family: monospace;">${s.safeDate}</span>`,
        `<span style="font-weight: bold; font-family: monospace;">${s.nextSprayDate || 'N/A'}</span>`,
        `<strong>${s.intervalDays ?? 14} Days</strong>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Agrochemical Spray Compliance & Quarantines</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${sprayRecords.length} treatments)</span>
          </h3>
          ${buildTableHtml(['Plot Section', 'Chemical Brand', 'PHI Quarantine', 'Target Pest', 'Safe Pick Date', 'Next Spray Date', 'Repeat Interval'], rows)}
        </div>
      `;
    }

    // 9. Fields
    if (sections.fields) {
      const rows = fields.map(f => [
        `<span style="font-family: monospace;">${f.id}</span>`,
        `<strong>${f.blockName}</strong>`,
        `<em>${f.cropType}</em>`,
        `<strong>${f.acreage} Acres</strong>`,
        `<strong>${f.status}</strong>`
      ]);

      let opsHtml = '';
      if (cropOps && cropOps.length > 0) {
        const opRows = cropOps.map(op => {
          const bName = fields.find(f => f.id === op.fieldId)?.blockName || op.fieldId;
          return [
            `<span style="font-family: monospace;">${op.date}</span>`,
            `<strong>${bName}</strong>`,
            `<em>${op.opType}</em>`,
            op.details,
            `<strong>${op.status}</strong>`,
            op.completedBy || 'N/A'
          ];
        });
        opsHtml = `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #475569; margin-top: 15px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #64748b; padding-left: 6px;">
            Silage & Field Agronomy Checklist Tasks
          </h4>
          ${buildTableHtml(['Operation Date', 'Field Plot Block', 'Operation Type', 'Agronomy Instructions', 'Status', 'Assigned Handler'], opRows)}
        `;
      }

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 850;">
            <span>Registered Blocks & Silage Fields Directory</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${fields.length} plots)</span>
          </h3>
          ${buildTableHtml(['Plot ID', 'Block Name', 'Primary Feed Crop', 'Size', 'Audit Status'], rows)}
          ${opsHtml}
        </div>
      `;
    }

    // 10. Livestock (General)
    if (sections.livestock) {
      const rows = livestock.map(item => [
        `<span style="font-family: monospace;">${item.date}</span>`,
        `<strong>${item.name}</strong>`,
        `<em>${item.type}</em>`,
        item.countOrBreed,
        `<strong>${item.activity}</strong>`,
        `<span style="font-style: italic; color: #64748b;">${item.notes}</span>`
      ]);

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>General Livestock & Canines Activity Log</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${livestock.length} entries)</span>
          </h3>
          ${buildTableHtml(['Date Logged', 'Animal/Group Name', 'Livestock Type', 'Breed/Count', 'Activity Phase', 'Notes'], rows)}
        </div>
      `;
    }

    // 11. Goats
    if (sections.goats) {
      const rows = goatRecords.map(gt => [
        `<span style="font-family: monospace;">${gt.date}</span>`,
        `<strong>${gt.tagId}</strong>`,
        `<em>${gt.breed}</em>`,
        gt.purpose,
        `<strong style="font-family: monospace;">${gt.milkYieldLiters !== undefined ? `${gt.milkYieldLiters} L` : 'N/A'}</strong>`,
        gt.notes
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Goats Dairy Herd & Lactation Logs</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${goatRecords.length} records)</span>
          </h3>
          ${buildTableHtml(['Date', 'Tag/Collar ID', 'Breed Class', 'Classification', 'Yield', 'Observations'], rows)}
        </div>
      `;
    }

    // 12. Calves
    if (sections.calves) {
      const rows = calfRecords.map(cf => [
        `<span style="font-family: monospace;">${cf.date}</span>`,
        `<strong>${cf.calfId}</strong>`,
        `<em>${cf.damId}</em>`,
        `<strong style="font-family: monospace;">${cf.milkIntakeLiters} Liters</strong>`,
        `<strong>${cf.weaned ? 'WEANED' : 'Active Nursery'}</strong>`,
        `<span style="font-style: italic; color: #64748b;">${cf.notes}</span>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Nursery Young Calf Nutrition Logs</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${calfRecords.length} records)</span>
          </h3>
          ${buildTableHtml(['Date Logged', 'Calf ID', 'Mother Cow ID', 'Liquid Milk Intake', 'Weaned Status', 'Clinical Note'], rows)}
        </div>
      `;
    }

    // 13. BSF
    if (sections.bsf) {
      const rows = bsfRecords.map(batch => [
        `<span style="font-family: monospace;">${batch.date}</span>`,
        `<strong>${batch.batchId}</strong>`,
        `<em>${batch.substrateType}</em>`,
        `<span style="font-family: monospace;">${batch.inoculationDate}</span>`,
        `<strong style="font-family: monospace; color: #854d0e;">${batch.larvaeHarvestedKg} KG</strong>`,
        `<strong>${batch.status}</strong>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Organic Black Soldier Fly (BSF) Larval Cycles</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${bsfRecords.length} batches)</span>
          </h3>
          ${buildTableHtml(['Date', 'Batch ID', 'Substrate Type', 'Inoculated', 'Larvae Harvested', 'Stage Status'], rows)}
        </div>
      `;
    }

    // 13.5 Azolla
    if (sections.azolla) {
      const rows = azollaRecords.map(a => [
        `<span style="font-family: monospace; font-weight: bold;">${a.date}</span>`,
        `<strong>${a.pondId}</strong>`,
        `<strong style="font-family: monospace; color: #166534;">${a.harvestYieldKg} KG</strong>`,
        `<span>${a.distributedTo}</span>`,
        `<em>${a.notes}</em>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Azolla Aquatic Ponds (Protein Feed)</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${azollaRecords.length} harvests)</span>
          </h3>
          ${buildTableHtml(['Harvest Date', 'Pond ID', 'Yield (KG)', 'Distributed To', 'Notes'], rows)}
        </div>
      `;
    }

    // 14. Feed Formulation
    if (sections.formula) {
      const fItems = getStoredFeedFormula();
      let fWeight = 0, fCpW = 0, fMeW = 0, fCostT = 0;
      fItems.forEach((bItem) => {
        const raw = getIngredientNutrients(bItem.name);
        if (bItem.amount > 0) {
          fWeight += bItem.amount;
          fCpW += raw.cp * bItem.amount;
          fMeW += raw.me * bItem.amount;
          fCostT += raw.cost * bItem.amount;
        }
      });
      const fCpAvg = fWeight > 0 ? fCpW / fWeight : 0;
      const fMeAvg = fWeight > 0 ? fMeW / fWeight : 0;
      const fCostAvg = fWeight > 0 ? fCostT / fWeight : 0;

      let fQualityStr = 'Low Protein Supplement';
      if (fCpAvg >= 15 && fCpAvg < 18) {
        fQualityStr = 'Standard Ration (Young Milkers / Duck Cover)';
      } else if (fCpAvg >= 18 && fCpAvg <= 21) {
        fQualityStr = 'Intense Lactation / Premium Poultry Layer';
      } else if (fCpAvg > 21) {
        fQualityStr = 'Elite Concentrated Booster (High Nitrogen)';
      } else if (fWeight > 0) {
        fQualityStr = 'Sub-optimal Protein Ration (<15% CP)';
      }

      const summaryHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-family: sans-serif;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
            <div style="float: left; width: 25%;">
              <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Total Weight</span>
              <strong style="font-size: 14px; color: #0f172a; font-family: monospace;">${fWeight.toFixed(1)} KG</strong>
            </div>
            <div style="float: left; width: 25%;">
              <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Crude Protein</span>
              <strong style="font-size: 14px; color: #15803d; font-family: monospace;">${fCpAvg.toFixed(2)}% CP</strong>
            </div>
            <div style="float: left; width: 25%;">
              <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Energy Profile</span>
              <strong style="font-size: 14px; color: #0f172a; font-family: monospace;">${fMeAvg.toFixed(2)} MJ</strong>
            </div>
            <div style="float: left; width: 25%;">
              <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Formula Cost</span>
              <strong style="font-size: 14px; color: #1e3a8a; font-family: monospace;">Ksh ${fCostAvg.toFixed(2)}/kg</strong>
            </div>
            <div style="clear: both;"></div>
          </div>
          <div style="font-size: 10px; text-align: center; color: #475569; font-weight: bold; margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 8px;">
            Assessment Classification: ${fQualityStr}
          </div>
        </div>
      `;

      const rows = fItems.map(item => {
        const raw = getIngredientNutrients(item.name);
        const pct = fWeight > 0 ? (item.amount / fWeight) * 100 : 0;
        const costVal = raw.cost * item.amount;
        return [
          `<strong>${item.name}</strong>`,
          `<strong style="font-family: monospace;">${item.amount.toFixed(1)} kg</strong>`,
          `<span style="font-family: monospace;">${pct.toFixed(1)}%</span>`,
          `<span style="font-family: monospace;">${raw.cp.toFixed(1)}% CP</span>`,
          `<span style="font-family: monospace;">${raw.me.toFixed(1)} MJ</span>`,
          `<strong style="font-family: monospace; color: #15803d;">Ksh ${costVal.toLocaleString()}</strong>`
        ];
      });

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Optimized Feed Formulation & Compounding Board (Formula Made)</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${fItems.length} recipe ingredients)</span>
          </h3>
          ${summaryHtml}
          ${buildTableHtml(['Ingredient Name', 'Inclusion weight', 'Proportional %', 'Crude Protein (CP)', 'Energy (ME)', 'Inclusion Cost'], rows)}
        </div>
      `;
    }

    // 15. Inventory
    if (sections.inventory) {
      const rows = inventory.map(item => {
        const isLow = item.quantity <= item.minStock;
        return [
          `<span style="font-family: monospace;">${item.id}</span>`,
          `<strong>${item.name}</strong>`,
          `<em>${item.category}</em>`,
          `<strong style="font-family: monospace;">${item.quantity} ${item.unit}</strong>`,
          `<span style="font-family: monospace;">${item.minStock}</span>`,
          `<span style="font-weight: bold; color: ${isLow ? '#9a3412' : '#166534'};">${isLow ? 'RESTOCK' : 'SECURE'}</span>`
        ];
      });
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Storage Warehouse Stocks Reserves</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${inventory.length} items)</span>
          </h3>
          ${buildTableHtml(['Item ID', 'Name', 'Category Classification', 'Available Stock', 'Safety Level', 'Alert Status'], rows)}
        </div>
      `;
    }

    // 15. Vet
    if (sections.vet) {
      const rows = vetRecords.map(vet => [
        `<span style="font-family: monospace;">${vet.date}</span>`,
        `<strong>${vet.cowId}</strong>`,
        `<em>${vet.type}</em>`,
        `<strong>${vet.treatment}</strong> <span style="font-size: 10px; color: #64748b; display: block;">${vet.notes}</span>`,
        `<strong style="font-family: monospace;">Ksh ${vet.cost.toLocaleString()}</strong>`,
        vet.staff
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Clinical Veterinary Treatments & Diagnostics</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${vetRecords.length} entries)</span>
          </h3>
          ${buildTableHtml(['Incident Date', 'Animal Cow Tag', 'Treatment Type', 'Clinical Diagnosis', 'Authorized Cost', 'Vet'], rows)}
        </div>
      `;
    }

    // 16. Academy
    if (sections.academy) {
      let diagHistList: any[] = [];
      try {
        const saved = localStorage.getItem('jr_farm_diagnostic_history');
        diagHistList = saved ? JSON.parse(saved) : buildDefaultDiagnosticHistory();
      } catch {
        diagHistList = [];
      }

      let deductLogs: any[] = [];
      try {
        const saved = localStorage.getItem('jr_farm_academy_auto_deduct_logs');
        deductLogs = saved ? JSON.parse(saved) : buildDefaultDeductLogs();
      } catch {
        deductLogs = [];
      }

      const rowsDiag = diagHistList.map(h => [
        `<span style="font-family: monospace;">${h.timestamp}</span>`,
        `<span style="text-transform: uppercase; font-weight: bold;">${h.specimen}</span>`,
        `<em>${h.symptom}</em>`,
        `<strong>${h.conditionName}</strong>`,
        `<strong>${h.likelihood}</strong>`,
        h.isOffline ? 'Sovereign Free AI' : 'Gemini AI Pro'
      ]);

      const rowsDeduct = deductLogs.map(l => [
        `<span style="font-family: monospace;">${l.timestamp}</span>`,
        `<strong>${l.taskTitle}</strong>`,
        `<span style="font-size: 11px; color: #475569;">${l.deductionText}</span>`,
        l.success ? `<span style="color: #166534; font-weight: bold;">PASSED</span>` : `<span style="color: #b91c1c; font-weight: bold;">FAILED</span>`
      ]);

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Farmer's Academy Clinical Cases History Archive</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${diagHistList.length} cases)</span>
          </h3>
          ${buildTableHtml(['Timestamp', 'Specimen Type', 'Active Symptoms', 'Clinical Condition Name', 'Confidence', 'Diagnostic Method'], rowsDiag)}
        </div>
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Auto-Deduct SOP Actions Audit Ledger</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${deductLogs.length} events)</span>
          </h3>
          ${buildTableHtml(['Timestamp', 'SOP Task Action', 'Automated Inventory & Financial Deduction Text', 'Ledger Integrity'], rowsDeduct)}
        </div>
      `;
    }

    // 17. Timetable (Operations Schedule Calendar Tasks)
    if (sections.timetable) {
      let timetableList: any[] = [];
      try {
        const saved = localStorage.getItem('jr_farm_custom_timetable');
        timetableList = saved ? JSON.parse(saved) : buildDefaultTimetable();
      } catch {
        timetableList = [];
      }

      const rows = timetableList.map(t => [
        `<span style="font-family: monospace;">${t.targetDate}</span>`,
        `<span style="font-weight: bold;">${t.category}</span>`,
        `<strong>${t.operation}</strong>`,
        `<em>${t.when}</em>`,
        `<span style="font-size: 11px; color: #475569;">SOP: ${t.how} (${t.why})</span>`,
        `<strong>${t.status}</strong>`,
        `<em>${t.assignedTo || 'Unassigned'}</em>`
      ]);

      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Operations & Timetable Schedule Calendar</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${timetableList.length} tasks)</span>
          </h3>
          ${buildTableHtml(['Target Date', 'Category/Group', 'Task Operation', 'Interval/Intervals', 'SOP Directions & Objective', 'Status', 'Assigned Specialist'], rows)}
        </div>
      `;
    }

    // 18. Silage
    if (sections.silage || sections.ai_silage) {
      const rows = silageRecords.map(item => [
        `<span style="font-family: monospace; font-weight: bold;">${item.dateMade}</span>`,
        `<strong>${item.rawMaterial}</strong>`,
        `<strong>${item.acres} Acres</strong>`,
        `<span style="font-family: monospace;">${item.calculatedWeightKg.toLocaleString()} KG</span>`,
        `<span style="font-size: 11px;">${item.quality}</span>`,
        `<span style="font-size: 11px;">Feed: ${item.animalsFedCount} head (${item.averageAnimalWeightKg}kg)<br>Lifespan: <strong>${item.daysOfFeedAvailable} Days</strong></span>`,
        `<em style="font-size: 11px;">${item.notes}</em>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Silage Preservation & Feed Rations Audit</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${silageRecords.length} records)</span>
          </h3>
          ${buildTableHtml(['Date Made', 'Raw Crop Material', 'Acres Area', 'Silage Weight (KG)', 'Quality Diagnosis', 'Livestock Feed Projections', 'Compaction Notes'], rows)}
        </div>
      `;
    }

    // 19. Heifers
    if (sections.heifers || sections.ai_heifers) {
      const rows = heiferRecords.map(item => [
        `<span style="font-family: monospace; font-weight: bold;">${item.dateLogged}</span>`,
        `<strong>${item.cowId}</strong>`,
        `<strong>${item.weightKg} KG</strong> <small>(${item.girthCm || 'N/A'} cm girth)</small>`,
        `<span style="color: #166534; font-weight: bold; font-family: monospace;">+${item.averageDailyGainGrams}g / Day</span>`,
        `<strong>${item.breedingReady ? 'READY (AI Eligible)' : 'Growing'}</strong>`,
        `<em style="font-size: 11px;">${item.notes}</em>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Heifer Progressive Growth & Puberty Monitors</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${heiferRecords.length} animals)</span>
          </h3>
          ${buildTableHtml(['Date Logged', 'Heifer Ear Tag ID', 'Liveweight & Chest Girth', 'Average Daily Gain (ADG)', 'Puberty/Breeding Status', 'Feeding & Ration Details'], rows)}
        </div>
      `;
    }

    // 20. Poultry
    if (sections.poultry || sections.live_poultry) {
      const rows = poultryRecords.map(item => [
        `<span style="font-family: monospace; font-weight: bold;">${item.dateLogged}</span>`,
        `<strong>${item.batchName}</strong> (${item.stage})`,
        `<strong>${item.count ? `${item.count} Birds` : 'N/A'}</strong>`,
        `<span style="font-family: monospace;">${item.feedGivenKg} KG</span> <small>(${item.feedType})</small>`,
        `<strong>${item.eggCratesHarvested !== undefined ? `${item.eggCratesHarvested} Cr` : 'N/A'}</strong> <small>(cracked: ${item.crackedEggsCount ?? 0})</small>`,
        `<strong>${item.mortalityCount || 0} death(s)</strong>`,
        `<span style="font-size: 11px;">Production Index: <strong>${item.percentageProduction !== undefined ? `${item.percentageProduction}%` : 'N/A'}</strong></span>`,
        `<em style="font-size: 11px;">${item.notes}</em>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Poultry Flock Development Ledger & Egg Harvesting</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${poultryRecords.length} reports)</span>
          </h3>
          ${buildTableHtml(['Date Logged', 'Cohort Group Name', 'Flock Count', 'Daily Feed Ration', 'Egg Crates Yield', 'Mortality Rate', 'Hen-Day Production %', 'Operational Notes'], rows)}
        </div>
      `;
    }

    // 21. Quarantine
    if (sections.quarantine || sections.spray_quarantine || sections.vet_withdrawal) {
      const rows = quarantineRecords.map(item => [
        `<span style="font-family: monospace; font-weight: bold;">${item.dateStarted}</span>`,
        `<strong>${item.animalTagOrBatch}</strong> (${item.animalType})`,
        `<strong>${item.quarantineReason}</strong>`,
        `<em>${item.symptomsObserved || 'None'}</em>`,
        `<strong style="color: ${item.quarantineStatus === 'Cleared & Released' ? '#166534' : '#b91c1c'};">${item.quarantineStatus}</strong>`,
        `Dr. ${item.vetInCharge}`,
        `<em style="font-size: 11px;">${item.notes}</em>`
      ]);
      sectionsHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
            <span>Biosecurity Vet Isolation & Quarantine Protocols</span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${quarantineRecords.length} active quarantines)</span>
          </h3>
          ${buildTableHtml(['Isolation Start', 'Animal Tag ID / Specimen', 'Quarantine Reason', 'Symptoms Tracked', 'Release Status', 'Attending Veterinarian', 'Prescription Notes'], rows)}
        </div>
      `;
    }

    // 22. To-Dos
    if (sections.todos) {
      const pendingRows = todos.filter(t => !t.completed).map(t => [
        `<span style="font-family: monospace;">${t.date}</span>`,
        `<strong>${t.text}</strong>`,
        `<span style="font-weight: bold; color: #b91c1c;">PENDING</span>`
      ]);
      const completedRows = todos.filter(t => t.completed).map(t => [
        `<span style="font-family: monospace;">${t.date}</span>`,
        `<strong style="text-decoration: line-through; color: #64748b;">${t.text}</strong>`,
        `<span style="font-weight: bold; color: #166534;">COMPLETED</span>`
      ]);
      
      let todosHtml = '';
      if (pendingRows.length > 0) {
        todosHtml += `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #b91c1c; margin-top: 15px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #b91c1c; padding-left: 6px;">
            Action Required: Pending Farm Tasks
          </h4>
          ${buildTableHtml(['Date Added', 'Task Description', 'Status'], pendingRows)}
        `;
      }
      if (completedRows.length > 0) {
        todosHtml += `
          <h4 style="font-size: 11px; font-family: sans-serif; text-transform: uppercase; color: #166534; margin-top: 15px; margin-bottom: 5px; font-weight: 700; border-left: 3px solid #166534; padding-left: 6px;">
            Completed Farm Tasks
          </h4>
          ${buildTableHtml(['Date Added', 'Task Description', 'Status'], completedRows)}
        `;
      }

      if (todosHtml) {
        sectionsHtml += `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <h3 style="font-size: 15px; font-family: sans-serif; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; font-weight: 800;">
              <span>Farm Manager's Daily Checklist & To-Dos</span>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${todos.length} total tasks)</span>
            </h3>
            ${todosHtml}
          </div>
        `;
      }
    }

    const netPlAmount = financials.reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JR Farm Cooperative Estate Report</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 45px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      border-bottom: 3px double #0f172a;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }
    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
    }
    .logo-container svg {
      width: 96px;
      height: 96px;
    }
    .header h1 {
      font-family: monospace;
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -1.5px;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      font-style: italic;
    }
    .header p {
      font-size: 11px;
      color: #475569;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 15px 0;
    }
    .meta-line {
      font-size: 12px;
      font-family: monospace;
      color: #64748b;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      border: 1.5px solid #cbd5e1;
      padding: 20px 16px;
      border-radius: 12px;
      background-color: #f8fafc;
      text-align: center;
    }
    .summary-card span {
      font-size: 10px;
      font-weight: 950;
      text-transform: uppercase;
      color: #64748b;
      display: block;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .summary-card h3 {
      font-size: 22px;
      font-weight: 900;
      font-family: monospace;
      color: #0f172a;
      margin: 0;
    }
    .sign-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      font-size: 12px;
      margin-top: 60px;
      border-top: 2px solid #e2e8f0;
      padding-top: 30px;
    }
    .sign-box {
      text-align: center;
    }
    .sign-line {
      border-top: 1.5px solid #94a3b8;
      margin-top: 40px;
      padding-top: 8px;
      font-family: monospace;
      font-weight: bold;
      color: #1e293b;
    }
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background-color: #022c22;
      color: #ffffff;
      border: none;
      padding: 16px 32px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(2, 44, 34, 0.4);
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .print-btn:hover {
      background-color: #064e3b;
      transform: translateY(-3px);
      box-shadow: 0 15px 30px -5px rgba(2, 44, 34, 0.5);
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .print-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        ${LOGO_SVG_STRING}
      </div>
      <h1>${getStoredSettings()?.estateName || "JR FARM COOPERATIVE ESTATE"}</h1>
      <p>Sovereign Agricultural Compliance &bull; GlobalGAP Registered Plot No. ${getStoredSettings()?.locationCode || "KT-205A"}</p>
      <div class="meta-line">
        <span>Authorized Comptroller: ${getStoredSettings()?.administrator || "Dr. Devin Omwenga"}</span> &bull; <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #854d0e;">Report Period: ${getReportPeriodString()}</span> &bull; <span>Generated: ${new Date().toLocaleString()}</span>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <span>All-time Milk Yield</span>
        <h3>${milkRecords.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0).toFixed(1)} L</h3>
      </div>
      <div class="summary-card">
        <span>All-time Tea Volumes</span>
        <h3>${totalTeaQty.toLocaleString()} KG</h3>
      </div>
      <div class="summary-card">
        <span>P&L Operating Balance</span>
        <h3 style="color: ${netPlAmount >= 0 ? '#166534' : '#9a3412'};">Ksh ${netPlAmount.toLocaleString()}</h3>
      </div>
    </div>

    <div class="report-sections">
      ${sectionsHtml || '<p style="text-align: center; color: #94a3b8; font-weight: bold; padding: 40px 0;">No active sections selected for this compilation report.</p>'}
    </div>

    <div class="sign-section">
      <div class="sign-box">
        <div style="height: 40px;"></div>
        <div class="sign-line">Mosoti (Senior Herdsman)</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Operations Inspector Sig</div>
      </div>
      <div class="sign-box">
        <div style="height: 40px;"></div>
        <div class="sign-line">${getStoredSettings()?.administrator || "Dr. Devin Omwenga"} (Overall Farm Manager)</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Sovereign Superintendent Sig</div>
      </div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>
    `;
  };

  const getSectionsMetadata = () => {
    return [
      {
        key: 'staff',
        label: 'Staff Deployment Roster',
        count: staffList.length,
        subsections: [
          { key: 'staff_shifts', label: 'Daily Shift Assignments', count: staffList.length },
          { key: 'staff_offs', label: 'Shift Offs & Leaves Ledger', count: staffOffRecords?.length || 0 }
        ]
      },
      {
        key: 'milk',
        label: 'Daily Milking Records',
        count: filteredMilkRecords.length,
        subsections: [
          { key: 'milk_production', label: 'Daily Cow Milking Logs', count: filteredMilkRecords.length },
          { key: 'milk_outflows', label: 'Bulk Sales & Dispatches', count: filteredMilkOutflows.length }
        ]
      },
      {
        key: 'ai',
        label: 'Insemination & Breeding',
        count: filteredAiRecords.length,
        subsections: [
          { key: 'ai_breeding', label: 'Breeding Cycles Log', count: filteredAiRecords.length },
          { key: 'ai_silage', label: 'Bulk Silage Pits Inventory', count: filteredSilageRecords.length },
          { key: 'ai_heifers', label: 'Heifer Progeny Growth tracker', count: filteredHeiferRecords.length }
        ]
      },
      {
        key: 'cows',
        label: 'Cattle Breeders Registry',
        count: cows.length,
        subsections: [
          { key: 'cows_registry', label: 'Registered Dairy Breeders Directory', count: cows.length }
        ]
      },
      {
        key: 'life_ledger',
        label: 'Cattle Sales & Mortality Ledger',
        count: (animalSales?.length || 0) + (mortalities?.length || 0),
        subsections: [
          { key: 'cattle_sales', label: 'Cattle Disposals & Sales', count: animalSales?.length || 0 },
          { key: 'cattle_mortality', label: 'Cattle Mortalities & Loss Registers', count: mortalities?.length || 0 }
        ]
      },
      {
        key: 'tea',
        label: 'KTDA Tea Deliveries',
        count: filteredTeaRecords.length,
        subsections: [
          { key: 'tea_dispatches', label: 'Green Leaf Dispatches Log', count: filteredTeaRecords.length },
          { key: 'tea_grading', label: 'Tea Factory Buyer Grader Audits', count: 4 }
        ]
      },
      {
        key: 'avo',
        label: 'Avocado Exports Logs',
        count: filteredAvoRecords.length,
        subsections: [
          { key: 'avo_shipments', label: 'Container Shipment Dispatches', count: filteredAvoRecords.length },
          { key: 'avo_packhouse', label: 'Packhouse Grading Check', count: 3 }
        ]
      },
      {
        key: 'cropSales',
        label: 'Commodities Cash Sales',
        count: filteredCropSales.length,
        subsections: [
          { key: 'crop_cash_sales', label: 'Commodities Direct Cash Sales', count: filteredCropSales.length },
          { key: 'crop_ops', label: 'Crop Field Care Operations', count: cropOps?.length || 0 }
        ]
      },
      {
        key: 'financials',
        label: 'Operational Ledger',
        count: filteredFinancials.length,
        subsections: [
          { key: 'fin_revenues', label: 'Direct Operating Revenues', count: filteredFinancials.filter(f => f.type === 'income').length },
          { key: 'fin_expenses', label: 'Operating Expenses & Incurrence', count: filteredFinancials.filter(f => f.type === 'expense').length },
          { key: 'fin_capital', label: 'Capital Budgets & Cash Outflows', count: filteredFinancials.filter(f => f.type === 'capital_budget').length }
        ]
      },
      {
        key: 'spray',
        label: 'GlobalGAP Spray Logs',
        count: filteredSprayRecords.length,
        subsections: [
          { key: 'spray_logs', label: 'Insecticide & Anti-Fungal Sprays', count: filteredSprayRecords.length }
        ]
      },
      {
        key: 'fields',
        label: 'Registered Field plots',
        count: fields.length,
        subsections: [
          { key: 'fields_registry', label: 'Active Farm Plot Allocations', count: fields.length },
          { key: 'fields_agroforestry', label: 'Agroforestry Conservation Trees Index', count: fields.filter(f => f.conservationTreeCount > 0).length }
        ]
      },
      {
        key: 'livestock',
        label: 'Security Canine Logs',
        count: livestock.filter(l => l.type === 'Dogs' || l.category === 'Canine').length,
        subsections: [
          { key: 'live_canines', label: 'Canine Guard Patrol Logs', count: livestock.filter(l => l.type === 'Dogs' || l.category === 'Canine').length }
        ]
      },
      {
        key: 'poultry',
        label: 'Poultry Hub & Egg Logs',
        count: filteredPoultryRecords.length,
        subsections: [
          { key: 'live_poultry', label: 'Layer Bird Flock Monitor', count: filteredPoultryRecords.length }
        ]
      },
      {
        key: 'goats',
        label: 'Goat Milk Registers',
        count: filteredGoatRecords.length,
        subsections: [
          { key: 'goats_milk', label: 'Milking Doe Daily Yields', count: filteredGoatRecords.length },
          { key: 'goats_herd', label: 'Breeding Bucks & Does Register', count: 2 }
        ]
      },
      {
        key: 'calves',
        label: 'Liquidfed Calves log',
        count: filteredCalfRecords.length,
        subsections: [
          { key: 'calves_log', label: 'Milk Replacer Feeding Schedule', count: filteredCalfRecords.length },
          { key: 'calves_health', label: 'Deworming and Standard Vaccination Meds', count: filteredCalfRecords.filter(c => c.dosageHistory && c.dosageHistory.length > 0).length }
        ]
      },
      {
        key: 'bsf',
        label: 'Organic BSF Batches',
        count: filteredBsfRecords.length,
        subsections: [
          { key: 'bsf_rearing', label: 'Organic Substrate Rearing Stages', count: filteredBsfRecords.length },
          { key: 'bsf_harvest', label: 'High Protein Larvae Harvest Records', count: filteredBsfRecords.filter(b => b.harvestedYield > 0).length }
        ]
      },
      {
        key: 'formula',
        label: 'Feed Formulation Recipe',
        count: getStoredFeedFormula().length,
        subsections: [
          { key: 'formula_recipe', label: 'Compounded Diet Matrix', count: getStoredFeedFormula().length },
          { key: 'formula_nutrients', label: 'Target Nutrient Standard Check', count: 6 }
        ]
      },
      {
        key: 'inventory',
        label: 'Storage Stocks reserves',
        count: filteredInventory.length,
        subsections: [
          { key: 'inventory_reserves', label: 'Warehouse Commodity Materials', count: filteredInventory.length },
          { key: 'inventory_alerts', label: 'Critical Low Stock Reorder Alarms', count: filteredInventory.filter(i => i.qty <= i.reorderLevel).length }
        ]
      },
      {
        key: 'vet',
        label: 'Clinical Treatments',
        count: filteredVetRecords.length,
        subsections: [
          { key: 'vet_treatments', label: 'Clinical Treatment Protocols Log', count: filteredVetRecords.length }
        ]
      },
      {
        key: 'academy',
        label: "Academy Diag History",
        count: filteredDiagHistory.length,
        subsections: [
          { key: 'academy_casebook', label: 'Clinical Cases Diagnosis Cases Log', count: filteredDiagHistory.length },
          { key: 'academy_sop_logs', label: 'Auto-Deducted Policy Failure Audits', count: getStoredDeductLogs().length }
        ]
      },
      {
        key: 'timetable',
        label: 'Operations Calendar Tasks',
        count: filteredTimetable.length,
        subsections: [
          { key: 'timetable_schedule', label: 'Operations Calendar Tasks Scheduled', count: filteredTimetable.length },
          { key: 'timetable_protocols', label: 'Standard SOP Protocols & Check drills', count: 18 }
        ]
      },
      {
        key: 'quarantine',
        label: 'Biosecurity & Quarantine Logs',
        count: filteredQuarantineRecords.length,
        subsections: [
          { key: 'spray_quarantine', label: 'Safe PHI Harvest Withholding Warnings', count: filteredQuarantineRecords.length },
          { key: 'vet_withdrawal', label: 'Bio-hazard Withdrawal Safe Period Audits', count: filteredQuarantineRecords.length }
        ]
      },
      {
        key: 'todos',
        label: "Daily Checklist & To-Dos",
        count: todos.length,
        subsections: []
      }
    ];
  };

  const getFilteredSectionsMetadata = () => {
    const rawSections = getSectionsMetadata();
    const sectionCategories: Record<string, string> = {
      staff: 'Staff',
      milk: 'Livestock',
      ai: 'Livestock',
      cows: 'Livestock',
      life_ledger: 'Livestock',
      tea: 'Crop Exports',
      avo: 'Crop Exports',
      cropSales: 'Crop Exports',
      financials: 'Operations',
      spray: 'Crop Exports',
      fields: 'Main',
      livestock: 'Livestock',
      poultry: 'Livestock',
      goats: 'Livestock',
      calves: 'Livestock',
      bsf: 'Feed & Factory',
      formula: 'Feed & Factory',
      inventory: 'Operations',
      vet: 'Livestock',
      academy: 'Academy',
      timetable: 'Operations',
      quarantine: 'Livestock',
      todos: 'Operations'
    };

    return rawSections.filter(sec => {
      // 1. Category Filter
      const cat = sectionCategories[sec.key] || 'Other';
      if (reportCategoryFilter !== 'ALL' && cat !== reportCategoryFilter) {
        return false;
      }
      // 2. Search query filter
      if (reportSearchQuery.trim()) {
        const query = reportSearchQuery.toLowerCase();
        const matchesLabel = sec.label.toLowerCase().includes(query);
        const matchesSubsections = sec.subsections.some(s => s.label.toLowerCase().includes(query));
        return matchesLabel || matchesSubsections;
      }
      return true;
    });
  };

  const handleSelectAllSections = (status: boolean) => {
    const keys = [
      'staff', 'staff_shifts', 'staff_offs',
      'milk', 'milk_production', 'milk_outflows',
      'ai', 'ai_breeding', 'ai_silage', 'ai_heifers',
      'cows', 'cows_registry',
      'life_ledger', 'cattle_sales', 'cattle_mortality',
      'tea', 'tea_dispatches', 'tea_grading',
      'avo', 'avo_shipments', 'avo_packhouse',
      'cropSales', 'crop_cash_sales', 'crop_ops',
      'financials', 'fin_revenues', 'fin_expenses', 'fin_capital',
      'spray', 'spray_logs', 'spray_quarantine',
      'fields', 'fields_registry', 'fields_agroforestry',
      'livestock', 'live_canines', 'live_poultry',
      'poultry',
      'goats', 'goats_milk', 'goats_herd',
      'calves', 'calves_log', 'calves_health',
      'bsf', 'bsf_rearing', 'bsf_harvest',
      'formula', 'formula_recipe', 'formula_nutrients',
      'inventory', 'inventory_reserves', 'inventory_alerts',
      'vet', 'vet_treatments', 'vet_withdrawal',
      'academy', 'academy_casebook', 'academy_sop_logs',
      'timetable', 'timetable_schedule', 'timetable_protocols',
      'quarantine', 'todos'
    ];
    const updated = {} as Record<string, boolean>;
    keys.forEach(k => {
      updated[k] = status;
    });
    setSelectedSections(updated);
  };

  const handleToggleParent = (key: string, currentVal: boolean, subKeys: string[]) => {
    setSelectedSections(prev => {
      const next = { ...prev, [key]: !currentVal };
      subKeys.forEach(s => {
        next[s] = !currentVal;
      });
      return next;
    });
  };

  const handleDownloadPdfReport = async (customKeys?: string[]) => {
    let tempSections: Record<string, boolean>;
    if (customKeys && customKeys.length > 0) {
      tempSections = {
        staff: false, milk: false, ai: false, tea: false, avo: false,
        cropSales: false, financials: false, spray: false, fields: false,
        livestock: false, goats: false, calves: false, bsf: false,
        formula: false, inventory: false, vet: false, academy: false, timetable: false,
        silage: false, heifers: false, poultry: false, quarantine: false, todos: false
      } as Record<string, boolean>;
      customKeys.forEach(k => {
        const mappedKey = k === 'schedule' ? 'timetable' : k;
        tempSections[mappedKey] = true;
      });
    } else {
      tempSections = { ...selectedSections };
    }

    const activeKeys = Object.keys(tempSections).filter(k => tempSections[k]);
    if (activeKeys.length === 0) {
      triggerAppToastMessage('Select at least one section before generating a PDF report.');
      return;
    }

    const htmlContent = generateHtmlReportContent(tempSections);
    const filename = buildReportPdfFilename(activeKeys, 17);

    const loadScript = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${url}`));
        document.head.appendChild(script);
      });
    };

    try {
      if (!(window as any).html2pdf) {
        await loadScript("/html2pdf.bundle.min.js");
      }

      // Create a clean container to render the HTML into PDF
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Select the container from within the tempDiv (or use tempDiv itself)
      const reportContainer = tempDiv.querySelector('.container') || tempDiv;
      
      // Style the reportContainer nicely for PDF page bounds
      (reportContainer as HTMLElement).style.width = '790px';
      (reportContainer as HTMLElement).style.padding = '30px';
      (reportContainer as HTMLElement).style.boxShadow = 'none';
      (reportContainer as HTMLElement).style.border = 'none';
      (reportContainer as HTMLElement).style.background = '#ffffff';

      // Hide the print button in the rendered PDF
      const printBtn = reportContainer.querySelector('.print-btn');
      if (printBtn) {
        (printBtn as HTMLElement).remove();
      }

      // Append temporarily to the DOM to ensure styles/computed calculations work correctly
      document.body.appendChild(tempDiv);

      const opt = {
        margin: [0.35, 0.35, 0.35, 0.35],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true, 
          logging: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await (window as any).html2pdf().set(opt).from(reportContainer).save();
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("PDF generation failed, falling back to HTML download:", error);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fallbackFilename = filename.replace('.pdf', '.html');
      link.href = url;
      link.setAttribute('download', fallbackFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleTriggerSectionReport = (key: string) => {
    handleTriggerSectionReportMulti([key]);
  };

  const handleTriggerSectionReportMulti = (keys: string[]) => {
    const resetSections: Record<string, boolean> = {
      staff: false, milk: false, ai: false, cows: false, life_ledger: false, tea: false, avo: false,
      cropSales: false, financials: false, spray: false, fields: false,
      livestock: false, goats: false, calves: false, bsf: false,
      inventory: false, vet: false, academy: false, timetable: false,
      silage: false, heifers: false, poultry: false, quarantine: false, todos: false
    } as any;
    
    keys.forEach(k => {
      const mappedKey = k === 'schedule' ? 'timetable' : k;
      if (mappedKey in resetSections) {
        resetSections[mappedKey] = true;
      } else {
        resetSections[k] = true;
      }
    });
    
    setSelectedSections(resetSections);
    setActiveTab('report_view');
  };





  const handleDownloadDirectPdf = async (customKeys?: string[]) => {
    // Obsolete
  };
  /*
    await new Promise(resolve => setTimeout(resolve, 850));

    // Intercept original window properties
    const originalGetComputedStyle = window.getComputedStyle;
    const fillStyleDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
    const strokeStyleDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'strokeStyle');
    const originalFillStyleSet = fillStyleDesc?.set;
    const originalStrokeStyleSet = strokeStyleDesc?.set;

    try {
      // 1. Intercept getComputedStyle to sanitize on-the-fly to protect third-party layout solvers
      window.getComputedStyle = function(el, pseudoElt) {
        const originalStyle = originalGetComputedStyle.call(this, el, pseudoElt);
        return new Proxy(originalStyle, {
          get(target, prop, receiver) {
            if (prop === 'getPropertyValue') {
              return (propertyName: string) => {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string' && val.includes('oklch')) {
                  return replaceOklchParenthesisSafe(val);
                }
                return val;
              };
            }
            try {
              const val = Reflect.get(target, prop, receiver);
              if (typeof val === 'function') {
                return val.bind(target);
              }
              if (typeof prop === 'string' && typeof val === 'string' && val.includes('oklch')) {
                return replaceOklchParenthesisSafe(val);
              }
              return val;
            } catch (err) {
              try {
                const val = target[prop as any];
                if (typeof val === 'function') {
                  return val.bind(target);
                }
                return val;
              } catch (_) {
                return undefined;
              }
            }
          },
          ownKeys(target) {
            return Reflect.ownKeys(target);
          },
          getOwnPropertyDescriptor(target, prop) {
            return Reflect.getOwnPropertyDescriptor(target, prop);
          }
        });
      };

      // 2. Intercept Canvas fillStyle & strokeStyle setters for nested graph libraries
      if (originalFillStyleSet) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
          set(val) {
            if (typeof val === 'string' && val.includes('oklch')) {
              val = replaceOklchParenthesisSafe(val);
            }
            originalFillStyleSet.call(this, val);
          },
          configurable: true
        });
      }
      if (originalStrokeStyleSet) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'strokeStyle', {
          set(val) {
            if (typeof val === 'string' && val.includes('oklch')) {
              val = replaceOklchParenthesisSafe(val);
            }
            originalStrokeStyleSet.call(this, val);
          },
          configurable: true
        });
      }

      setPdfProgressText('Mounting CDN PDF render drivers...');
      
      const loadScript = (url: string) => {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${url}`));
          document.head.appendChild(script);
        });
      };

      if (!(window as any).html2pdf) {
        try {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
        } catch (err1) {
          await loadScript("https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js");
        }
      }

      setPdfProgressText('Compiling & sanitizing responsive layout rules...');
      const sourceElement = document.getElementById('printable-area-pdf');
      if (!sourceElement) {
        throw new Error("Preview element not found in DOM");
      }

      // Unique human labels for specific subset exports
      let filename = 'JR_Farm_Compiled_Report.pdf';
      const activeKeys = Object.keys(tempSections).filter(k => tempSections[k]);
      
      if (activeKeys.length === 1) {
        const key = activeKeys[0];
        const formattedKey = key === 'ai' ? 'Insemination_Breeding' : key.charAt(0).toUpperCase() + key.slice(1);
        filename = `JR_Farm_${formattedKey}_Report_${toIsoDate()}.pdf`;
      } else if (activeKeys.length < 15) {
        filename = `JR_Farm_Active_Sections_Report_${toIsoDate()}.pdf`;
      } else {
        filename = `JR_Farm_Master_Estate_Report_${toIsoDate()}.pdf`;
      }

      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document) => {
            const element = clonedDoc.getElementById('printable-area-pdf');
            if (element) {
              const clone = element.cloneNode(true) as HTMLElement;
              
              // Clear other elements to bypass scrolls and viewport clipping sizes
              clonedDoc.body.innerHTML = '';
              clonedDoc.body.style.margin = '0';
              clonedDoc.body.style.padding = '0';
              clonedDoc.body.style.backgroundColor = '#ffffff';
              clonedDoc.body.style.color = '#000000';
              clonedDoc.body.style.width = '820px';
              clonedDoc.body.style.height = 'auto';
              clonedDoc.body.style.overflow = 'visible';
              clonedDoc.body.appendChild(clone);

              clone.style.display = 'block';
              clone.style.opacity = '1';
              clone.style.visibility = 'visible';
              clone.style.position = 'static';
              clone.style.left = '0px';
              clone.style.top = '0px';
              clone.style.width = '820px';
              clone.style.maxHeight = 'none';
              clone.style.height = 'auto';
              clone.style.overflow = 'visible';
              clone.style.padding = '30px';
              clone.style.background = '#ffffff';
              clone.style.color = '#000000';

              // Expand sub-table and scrollable list viewport boxes to layout full-length tables
              const rawScrollables = clone.querySelectorAll('.overflow-y-auto, .overflow-x-auto, .overflow-hidden, .max-h-\\[70vh\\], .max-h-\\[75vh\\], .max-h-96');
              rawScrollables.forEach((node) => {
                const el = node as HTMLElement;
                el.style.overflow = 'visible';
                el.style.maxHeight = 'none';
                el.style.height = 'auto';
              });

              // Clean up interactive and print-hidden components from the render tree
              const guideAlert = clone.querySelector('.print\\:hidden, #pdf-guide-alert');
              if (guideAlert) {
                guideAlert.remove();
              }
              const actionButtons = clone.querySelectorAll('button');
              actionButtons.forEach(btn => btn.remove());
            }

            sanitizeStylesheets(clonedDoc);
          }
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: 'tr, h5, .grid' }
      };

      setPdfProgressText('Downloading direct PDF document file...');
      await (window as any).html2pdf().set(opt).from(sourceElement).save();

    } catch (e) {
      console.error('PDF library fail, falling back to native print popup:', e);
      window.print();
    } finally {
      // Restore original getters
      window.getComputedStyle = originalGetComputedStyle;
      if (originalFillStyleSet) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
          set: originalFillStyleSet,
          configurable: true
        });
      }
      if (originalStrokeStyleSet) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'strokeStyle', {
          set: originalStrokeStyleSet,
          configurable: true
        });
      }
      
      setIsPdfExporting(false);
      setPdfProgressText('');
    }
  };
  */

  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    staff: true, staff_shifts: true, staff_offs: true,
    milk: true, milk_production: true, milk_outflows: true,
    ai: true, ai_breeding: true, ai_silage: true, ai_heifers: true,
    cows: true, cows_registry: true,
    life_ledger: true, cattle_sales: true, cattle_mortality: true,
    tea: true, tea_dispatches: true, tea_grading: true,
    avo: true, avo_shipments: true, avo_packhouse: true,
    cropSales: true, crop_cash_sales: true, crop_ops: true,
    financials: true, fin_revenues: true, fin_expenses: true, fin_capital: true,
    spray: true, spray_logs: true, spray_quarantine: true,
    fields: true, fields_registry: true, fields_agroforestry: true,
    livestock: true, live_canines: true, live_poultry: true,
    poultry: true,
    goats: true, goats_milk: true, goats_herd: true,
    calves: true, calves_log: true, calves_health: true,
    bsf: true, bsf_rearing: true, bsf_harvest: true,
    formula: true, formula_recipe: true, formula_nutrients: true,
    inventory: true, inventory_reserves: true, inventory_alerts: true,
    vet: true, vet_treatments: true, vet_withdrawal: true,
    academy: true, academy_casebook: true, academy_sop_logs: true,
    timetable: true, timetable_schedule: true, timetable_protocols: true,
    quarantine: true,
    todos: true,
    azolla: true
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});



  // Reset and toggle selected sections when Master Report is opened:
  // Dynamically include only sections that have user-added records, OR represent the active section they are filling!
  useEffect(() => {
    if (showReportModal) {
      const withRecs = {
        staff: staffList.length > 0,
        milk: milkRecords.length > 0,
        ai: aiRecords.length > 0,
        tea: teaRecords.length > 0,
        avo: avoRecords.length > 0,
        cropSales: cropSales.length > 0,
        financials: financials.length > 0,
        spray: sprayRecords.length > 0,
        fields: fields.length > 0,
        livestock: livestock.filter(item => item.type === 'Dogs' || item.category === 'Canine').length > 0,
        cows: cows.length > 0,
        life_ledger: animalSales.length > 0 || mortalities.length > 0,
        poultry: poultryRecords.length > 0,
        goats: goatRecords.length > 0,
        calves: calfRecords.length > 0,
        bsf: bsfRecords.length > 0,
        formula: getStoredFeedFormula().length > 0,
        inventory: inventory.length > 0,
        vet: vetRecords.length > 0,
        academy: getStoredDiagHistory().length > 0,
        timetable: getStoredTimetable().length > 0,
        quarantine: quarantineRecords.length > 0,
        todos: todos.length > 0,
        azolla: azollaRecords.length > 0
      } as Record<string, boolean>;
 
      // Force active tab keys
      if (activeTab === 'roster') withRecs.staff = true;
      if (activeTab === 'factory' || activeTab === 'tmr') withRecs.formula = true;
      if (activeTab === 'dairy') { withRecs.milk = true; withRecs.ai = true; withRecs.vet = true; withRecs.calves = true; withRecs.cows = true; withRecs.life_ledger = true; }
      if (activeTab === 'cows') { withRecs.cows = true; }
      if (activeTab === 'horti') { withRecs.tea = true; withRecs.avo = true; withRecs.cropSales = true; }
      if (activeTab === 'azolla') { withRecs.azolla = true; }
      if (activeTab === 'spray') withRecs.spray = true;
      if (activeTab === 'finance') withRecs.financials = true;
      if (activeTab === 'fields') withRecs.fields = true;
      if (activeTab === 'livestock') { withRecs.livestock = true; withRecs.goats = true; }
      if (activeTab === 'poultry') { withRecs.poultry = true; }
      if (activeTab === 'inventory') withRecs.inventory = true;
      if (activeTab === 'education' || activeTab === 'diagnostics_sub' || activeTab === 'inventory_deduct_sub' || activeTab === 'timelines_sub' || activeTab === 'analyzer_sub') withRecs.academy = true;
      if (activeTab === 'timetable') withRecs.timetable = true;
 
      setSelectedSections({
        staff: withRecs.staff, staff_shifts: withRecs.staff, staff_offs: withRecs.staff,
        milk: withRecs.milk, milk_production: withRecs.milk, milk_outflows: withRecs.milk,
        ai: withRecs.ai, ai_breeding: withRecs.ai, ai_silage: withRecs.ai, ai_heifers: withRecs.ai,
        cows: withRecs.cows, cows_registry: withRecs.cows,
        life_ledger: withRecs.life_ledger, cattle_sales: withRecs.life_ledger, cattle_mortality: withRecs.life_ledger,
        tea: withRecs.tea, tea_dispatches: withRecs.tea, tea_grading: withRecs.tea,
        avo: withRecs.avo, avo_shipments: withRecs.avo, avo_packhouse: withRecs.avo,
        cropSales: withRecs.cropSales, crop_cash_sales: withRecs.cropSales, crop_ops: withRecs.cropSales,
        financials: withRecs.financials, fin_revenues: withRecs.financials, fin_expenses: withRecs.financials, fin_capital: withRecs.financials,
        spray: withRecs.spray, spray_logs: withRecs.spray, spray_quarantine: withRecs.spray,
        fields: withRecs.fields, fields_registry: withRecs.fields, fields_agroforestry: withRecs.fields,
        livestock: withRecs.livestock, live_canines: withRecs.livestock,
        poultry: withRecs.poultry, live_poultry: withRecs.poultry,
        goats: withRecs.goats, goats_milk: withRecs.goats, goats_herd: withRecs.goats,
        calves: withRecs.calves, calves_log: withRecs.calves, calves_health: withRecs.calves,
        bsf: withRecs.bsf, bsf_rearing: withRecs.bsf, bsf_harvest: withRecs.bsf,
        formula: withRecs.formula, formula_recipe: withRecs.formula, formula_nutrients: withRecs.formula,
        inventory: withRecs.inventory, inventory_reserves: withRecs.inventory, inventory_alerts: withRecs.inventory,
        vet: withRecs.vet, vet_treatments: withRecs.vet, vet_withdrawal: withRecs.vet,
        academy: withRecs.academy, academy_casebook: withRecs.academy, academy_sop_logs: withRecs.academy,
        timetable: withRecs.timetable, timetable_schedule: withRecs.timetable, timetable_protocols: withRecs.timetable,
        quarantine: withRecs.quarantine, quarantine_logs: withRecs.quarantine, quarantine_active: withRecs.quarantine,
        todos: withRecs.todos,
        azolla: withRecs.azolla
      });
    }
  }, [showReportModal, activeTab, staffList, milkRecords, aiRecords, teaRecords, avoRecords, cropSales, financials, sprayRecords, fields, livestock, poultryRecords, goatRecords, calfRecords, bsfRecords, inventory, vetRecords, quarantineRecords, todos]);



  // Live timer effect
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setLiveTime(new Date().toLocaleTimeString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live calculated variables
  const totalIncome = financials
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financials
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netPl = totalIncome - totalExpense;

  const totalTeaQty = teaRecords.reduce((sum, r) => sum + r.qty, 0);

  // Dynamic filtered lists and aggregates for report custom date filter
  const filteredMilkRecords = milkRecords.filter(m => isRecordInSelectedDateRange(m.date));
  const filteredMilkOutflows = (milkOutflows || []).filter(mo => isRecordInSelectedDateRange(mo.date));
  const filteredAiRecords = aiRecords.filter(ai => isRecordInSelectedDateRange(ai.date));
  const filteredTeaRecords = teaRecords.filter(tea => isRecordInSelectedDateRange(tea.date));
  const filteredAvoRecords = avoRecords.filter(avo => isRecordInSelectedDateRange(avo.date));
  const filteredCropSales = cropSales.filter(cs => isRecordInSelectedDateRange(cs.date));
  const filteredFinancials = financials.filter(f => isRecordInSelectedDateRange(f.date));
  const filteredSprayRecords = sprayRecords.filter(s => isRecordInSelectedDateRange(s.date));
  const filteredGoatRecords = goatRecords.filter(g => isRecordInSelectedDateRange(g.date));
  const filteredCalfRecords = calfRecords.filter(c => isRecordInSelectedDateRange(c.dateAdded || c.date));
  const filteredBsfRecords = bsfRecords.filter(b => isRecordInSelectedDateRange(b.date || b.dateLogged));
  const filteredInventory = inventory.filter(i => isRecordInSelectedDateRange(i.lastStockedDate || i.date));
  const filteredVetRecords = vetRecords.filter(v => isRecordInSelectedDateRange(v.date));
  const filteredDiagHistory = getStoredDiagHistory().filter((d: any) => isRecordInSelectedDateRange(d.date || d.timestamp));
  const filteredTimetable = getStoredTimetable().filter((t: any) => isRecordInSelectedDateRange(t.targetDate || t.date));
  const filteredSilageRecords = silageRecords.filter(s => isRecordInSelectedDateRange(s.dateMade));
  const filteredHeiferRecords = heiferRecords.filter(h => isRecordInSelectedDateRange(h.dateLogged));
  const filteredPoultryRecords = poultryRecords.filter(p => isRecordInSelectedDateRange(p.dateLogged));
  const filteredQuarantineRecords = quarantineRecords.filter(q => isRecordInSelectedDateRange(q.dateStarted));
  const filteredStaffOffRecords = staffOffRecords.filter(o => isRecordInSelectedDateRange(o.startDate));
  const filteredLivestock = livestock.filter(l => isRecordInSelectedDateRange(l.date));
  const filteredTodos = todos.filter(t => isRecordInSelectedDateRange(t.date));
  const filteredAzollaRecords = azollaRecords.filter(a => isRecordInSelectedDateRange(a.date));

  const reportIncome = filteredFinancials.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const reportExpense = filteredFinancials.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const reportNetBalance = reportIncome - reportExpense;

  const reportMilkVolume = filteredMilkRecords.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
  const reportTeaVolume = filteredTeaRecords.reduce((sum, r) => sum + r.qty, 0);

  const activeAlarmsCount = aiRecords.filter(
    (cycle) => cycle.status === 'Confirmed Pregnant' || cycle.status === 'Pending'
  ).length;

  // Compute upcoming due pregnancy
  const getUpcomingDueAlarm = (): string => {
    const active = aiRecords.filter((cycle) => cycle.status === 'Confirmed Pregnant');
    if (!active.length) return '-- No Pending Births --';
    // Sort by due date relative to today
    const sorted = [...active].sort((a, b) => a.due.localeCompare(b.due));
    const next = sorted[0];
    const daysLeft = Math.ceil(
      (new Date(next.due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return `${next.cowId}: Overdue!`;
    return `${next.cowId}: Due in ${daysLeft} days`;
  };

  const upcomingDueAlarm = getUpcomingDueAlarm();

  const alarmComputationDay = new Date().toISOString().slice(0, 10);

  // Unified Sensitive Alarms engine
  const sensitiveSectionAlarms = useMemo(() => {
    const list: Array<{
      id: string;
      section: 'Dairy' | 'Vet' | 'Spray' | 'Stock' | 'Roster' | 'Crops' | 'Schedule';
      title: string;
      body: string;
      severity: 'high' | 'medium' | 'info';
      date?: string;
      actionLabel: string;
      actionTab: string;
    }> = [];

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayNum = todayDate.getTime();

    // 1. Dairy Breeding AI expected birth / heats
    aiRecords.forEach((ai) => {
      if (ai.status === 'Confirmed Pregnant') {
        const diffDays = Math.ceil(
          (new Date(ai.due).getTime() - todayNum) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 7) {
          list.push({
            id: `ai-due-${ai.cowId}-${ai.due}`,
            section: 'Dairy',
            title: `🐄 Expected Calving Near: Cow ${ai.cowId}`,
            body: `Cow ${ai.cowId} is expected to calve on ${ai.due} (${diffDays < 0 ? 'Overdue!' : `${diffDays} days left`}). Transfer cow to the clean calving stall immediately for birth preparation.`,
            severity: diffDays < 0 ? 'high' : 'medium',
            date: ai.due,
            actionLabel: 'Check Breeding Log',
            actionTab: 'dairy'
          });
        }
      } else if (ai.status === 'Pending') {
        const checkDateStr = ai.checkDate || ai.date;
        const diffDays = Math.ceil(
          (new Date(checkDateStr).getTime() - todayNum) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 3) {
          list.push({
            id: `ai-check-${ai.cowId}-${checkDateStr}`,
            section: 'Dairy',
            title: `🔍 AI Pregnancy Check Scheduled: Cow ${ai.cowId}`,
            body: `Verify breeding heat/pregnancy status check due on ${checkDateStr}. Scheduled to confirm AI fertilization success.`,
            severity: 'medium',
            date: checkDateStr,
            actionLabel: 'Verify AI Status',
            actionTab: 'dairy'
          });
        }
      }
    });

    // 2. Vet records (vaccinations, next boosters, deworming)
    vetRecords.forEach((vet) => {
      if (vet.nextDueDate) {
        const diffDays = Math.ceil(
          (new Date(vet.nextDueDate).getTime() - todayNum) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 7) {
          list.push({
            id: `vet-due-${vet.id}`,
            section: 'Vet',
            title: `💉 Animal Vet Booster / Treatment Due: Tag ${vet.cowId}`,
            body: `Scheduled next booster / retreatment (${vet.type}) due on ${vet.nextDueDate}. Last administered treatment was: "${vet.treatment}"`,
            severity: diffDays < 0 ? 'high' : 'medium',
            date: vet.nextDueDate,
            actionLabel: 'Open Medical Log',
            actionTab: 'dairy'
          });
        }
      }
    });

    // 3. Spray logs crop withholding interval checks (PHI)
    sprayRecords.forEach((spray) => {
      const diffDays = Math.ceil(
        (new Date(spray.safeDate).getTime() - todayNum) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 0) {
        list.push({
          id: `spray-warn-${spray.id}`,
          section: 'Spray',
          title: `🚫 Pesticide PHI Quarantine: Block ${spray.block}`,
          body: `Substance quarantine Active until ${spray.safeDate} due to "${spray.chemical}" spraying. Absolutely DO NOT harvest any crop or grazing feed from Block ${spray.block}.`,
          severity: 'high',
          date: spray.safeDate,
          actionLabel: 'View Spray Log',
          actionTab: 'spray'
        });
      } else if (diffDays >= -3) {
        list.push({
          id: `spray-clear-${spray.id}`,
          section: 'Spray',
          title: `✅ Withholding Period Expired: Block ${spray.block}`,
          body: `Quarantine withholding period for "${spray.chemical}" has successfully ended. Block ${spray.block} is now biochemically safe to harvest.`,
          severity: 'info',
          date: spray.safeDate,
          actionLabel: 'Review Spray Specs',
          actionTab: 'spray'
        });
      }
    });

    // 4. Warehouse Stock Level Breaches
    inventory.forEach((item) => {
      if (item.quantity <= item.minStock) {
        list.push({
          id: `inv-low-${item.id}`,
          section: 'Stock',
          title: `📦 Critical Low Stock: ${item.name}`,
          body: `Current count is down to ${item.quantity} ${item.unit} (Minimum requirement is ${item.minStock} ${item.unit}). Restock immediately to sustain routine feeding and treatments.`,
          severity: 'high',
          actionLabel: 'Review Stock',
          actionTab: 'inventory'
        });
      }
    });

    // 5. Staff Absenteeism
    staffOffRecords.forEach((off) => {
      const startVal = new Date(off.startDate).getTime();
      const endVal = new Date(off.endDate).getTime();
      if (todayNum >= startVal && todayNum <= endVal && off.status === 'Approved') {
        list.push({
          id: `roster-abs-${off.id}`,
          section: 'Roster',
          title: `👤 Staff Out: ${off.staffName}`,
          body: `${off.staffName} is out on approved ${off.type} until ${off.endDate}. Please coordinate appropriate shift relief.`,
          severity: 'info',
          date: off.endDate,
          actionLabel: 'Roster Planner',
          actionTab: 'roster'
        });
      }
    });

    // 6. Crop Operations scheduled today or overdue
    cropOps.forEach((op) => {
      if (op.status !== 'Completed') {
        const diffDays = Math.ceil(
          (new Date(op.date).getTime() - todayNum) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 3) {
          list.push({
            id: `crop-op-rem-${op.id}`,
            section: 'Crops',
            title: `🌿 Field Crop Task Scheduled: ${op.crop}`,
            body: `Pending horticultural operation "${op.operationName}" is scheduled for ${op.date}. Inputs designated: ${op.inputsUsed || 'None Specified'}.`,
            severity: diffDays < 0 ? 'high' : 'medium',
            date: op.date,
            actionLabel: 'Agronomy Fields',
            actionTab: 'fields'
          });
        }
      }
    });

    // New: Azolla Water and Nutrients Reminder
    if (azollaRecords.length > 0) {
      // Find latest record date
      const sortedAzolla = [...azollaRecords].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sortedAzolla[0];
      const diffDays = Math.ceil((todayNum - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) {
        list.push({
          id: `azolla-water-${latest.id}`,
          section: 'Crops',
          title: `💧 Azolla Ponds Maintenance Due`,
          body: `It has been ${diffDays} days since the last Azolla harvest/record. Remember to top up water levels and add manure/nutrients to maintain optimal growth.`,
          severity: 'medium',
          actionLabel: 'Manage Azolla',
          actionTab: 'azolla'
        });
      }
    }

    // New: BSF Feeding and Egg Harvesting Reminder
    const activeBsf = bsfRecords.filter(b => b.status !== 'Harvested');
    activeBsf.forEach(batch => {
      const diffDays = Math.ceil((todayNum - new Date(batch.inoculationDate).getTime()) / (1000 * 60 * 60 * 24));
      // Remind every 3 days for feeding or egg check
      if (diffDays > 0 && diffDays % 3 === 0) {
        list.push({
          id: `bsf-maint-${batch.id}-${diffDays}`,
          section: 'Stock',
          title: `🐛 BSF Batch Maintenance: ${batch.batchId}`,
          body: `Batch ${batch.batchId} has been active for ${diffDays} days. Ensure consistent feeding (substrate) and check love cages for egg harvesting if applicable.`,
          severity: 'medium',
          actionLabel: 'Check BSF Batches',
          actionTab: 'factory'
        });
      }
    });

    // 7. Standard Custom Timetable items from OperationsCalendar
    try {
      const rawTimetable = localStorage.getItem('jr_farm_custom_timetable');
      if (rawTimetable) {
        const parsedTimetable = JSON.parse(rawTimetable);
        parsedTimetable.forEach((item: any) => {
          if (item.status === 'Pending' && item.targetDate) {
            const diffDays = Math.ceil(
              (new Date(item.targetDate).getTime() - todayNum) / (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 3) {
              list.push({
                id: `timetable-task-${item.id}`,
                section: 'Schedule',
                title: `🕒 operations Calendar Schedule: ${item.operation}`,
                body: `Calendar Task SOP is pending for category. Details: ${item.how}. Assignee: ${item.assignedTo || 'General Team'}.`,
                severity: diffDays < 0 ? 'high' : 'medium',
                date: item.targetDate,
                actionLabel: 'Operations SOPs',
                actionTab: 'timetable'
              });
            }
          }
        });
      }
    } catch (_) {}

    return list;
  }, [
    aiRecords,
    vetRecords,
    sprayRecords,
    inventory,
    staffOffRecords,
    cropOps,
    azollaRecords,
    bsfRecords,
    alarmComputationDay
  ]);

  const visibleSensitiveSectionAlarms = useMemo(() => {
    return sensitiveSectionAlarms.slice(0, alarmRenderLimit);
  }, [sensitiveSectionAlarms, alarmRenderLimit]);

  useEffect(() => {
    if (bellTrayContentRafRef.current !== null) {
      cancelAnimationFrame(bellTrayContentRafRef.current);
      bellTrayContentRafRef.current = null;
    }

    if (!bellNotificationTrayOpen) {
      setBellTrayContentReady(false);
      return;
    }

    setBellTrayContentReady(false);
    bellTrayContentRafRef.current = requestAnimationFrame(() => {
      setBellTrayContentReady(true);
      bellTrayContentRafRef.current = null;
    });

    return () => {
      if (bellTrayContentRafRef.current !== null) {
        cancelAnimationFrame(bellTrayContentRafRef.current);
        bellTrayContentRafRef.current = null;
      }
    };
  }, [bellNotificationTrayOpen]);

  useEffect(() => {
    if (alarmRenderUpgradeTimeoutRef.current) {
      clearTimeout(alarmRenderUpgradeTimeoutRef.current);
      alarmRenderUpgradeTimeoutRef.current = null;
    }

    if (!bellNotificationTrayOpen) {
      setAlarmRenderLimit(INITIAL_ALARM_RENDER_LIMIT);
      return;
    }

    setAlarmRenderLimit(INITIAL_ALARM_RENDER_LIMIT);
    if (sensitiveSectionAlarms.length <= INITIAL_ALARM_RENDER_LIMIT) {
      return;
    }

    alarmRenderUpgradeTimeoutRef.current = setTimeout(() => {
      setAlarmRenderLimit(sensitiveSectionAlarms.length);
      alarmRenderUpgradeTimeoutRef.current = null;
    }, 120);

    return () => {
      if (alarmRenderUpgradeTimeoutRef.current) {
        clearTimeout(alarmRenderUpgradeTimeoutRef.current);
        alarmRenderUpgradeTimeoutRef.current = null;
      }
    };
  }, [bellNotificationTrayOpen, sensitiveSectionAlarms.length]);

  const setupPushSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const publicVapidKey = 'BEjz8oIUeEp29dUbSKWjNFvo0Rtt1hWCi0SvFSBVePNFamrVbIb_CarvRxLY5Av0wnURkaNtoArFeBRPs0XMfnc';

      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      const subId = subscription.endpoint.split('/').pop() || Date.now().toString();
      const subRef = ref(realtimeDb, `pushSubscriptions/${subId}`);
      await set(subRef, JSON.parse(JSON.stringify(subscription)));
      console.log('Push subscription saved successfully.');
    } catch (pushErr) {
      console.error('Failed to subscribe to Web Push:', pushErr);
    }

    try {
      new Notification("JR Farm Pro", {
        body: "Perfect! Lockscreen push and taskbar reminders authorized successfully! You will now receive alerts for all breeding, medication, the quarantine, and stock warnings.",
        icon: "/icon-192.png"
      });
    } catch (_) {}
  };

  // Web Notification controller
  const requestAppNotificationPermission = async () => {
    if (!('Notification' in window)) {
      triggerAppToastMessage("Web Notifications are not supported in this browser.");
      return;
    }
    if (isAuthorizingPush) {
      return;
    }

    setIsAuthorizingPush(true);
    try {
      const res = await Notification.requestPermission();
      setNotificationPermissionState(res);
      if (res === 'granted') {
        triggerAppToastMessage("✓ Smartphone Taskbar Alerts Authorized!");

        // Defer heavier push setup so UI can paint right after interaction.
        setTimeout(() => {
          void setupPushSubscription();
        }, 0);
      } else {
        triggerAppToastMessage("⚠️ Permissions were denied or dismissed.");
      }
    } catch (_) {
      setNotificationPermissionState('denied');
      triggerAppToastMessage("⚠️ Standard browser sandbox blocked permission. Use New Tab.");
    } finally {
      setIsAuthorizingPush(false);
    }
  };

  const stopAlarmSound = () => {
    if (activeAudioSource) {
      try {
        activeAudioSource.stop();
      } catch (_) {}
      setActiveAudioSource(null);
    }
  };

  const markBellToggleInteraction = () => {
    if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      return;
    }

    const warningThresholdMs = 50;
    const startMark = 'jr-farm-bell-toggle-start';
    const endMark = 'jr-farm-bell-toggle-end';
    const measureName = 'jr-farm-bell-toggle';

    performance.mark(startMark);
    requestAnimationFrame(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      const entries = performance.getEntriesByName(measureName);
      const latest = entries[entries.length - 1];
      if (latest && latest.duration >= warningThresholdMs) {
        console.warn(`[Perf] ${measureName} slow interaction: ${latest.duration.toFixed(1)}ms (threshold ${warningThresholdMs}ms)`);
      }
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    });
  };

  useEffect(() => {
    const wasOpen = bellTrayWasOpenRef.current;
    bellTrayWasOpenRef.current = bellNotificationTrayOpen;

    if (wasOpen || !bellNotificationTrayOpen) {
      return;
    }
    if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      return;
    }

    const warningThresholdMs = 50;
    const startMark = 'jr-farm-bell-list-render-start';
    const endMark = 'jr-farm-bell-list-render-end';
    const measureName = 'jr-farm-bell-list-render';

    performance.mark(startMark);
    requestAnimationFrame(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      const entries = performance.getEntriesByName(measureName);
      const latest = entries[entries.length - 1];
      if (latest && latest.duration >= warningThresholdMs) {
        console.warn(`[Perf] ${measureName} slow render: ${latest.duration.toFixed(1)}ms (threshold ${warningThresholdMs}ms)`);
      }
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    });
  }, [bellNotificationTrayOpen]);

  const playSyntheticBellChime = (ringtoneId?: string, overrideLoop?: boolean) => {
    try {
      const targetId = ringtoneId || selectedRingtone;
      const isLoop = overrideLoop !== undefined ? overrideLoop : continuousLoop;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Stop any existing playing audio source
      if (activeAudioSource) {
        try {
          activeAudioSource.stop();
        } catch (_) {}
      }

      let stopFn = () => {};

      if (targetId === 'chime') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const oscs: OscillatorNode[] = [];

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          const startTime = ctx.currentTime + idx * 0.15;
          const duration = 0.5;
          
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration + 0.1);
          oscs.push(osc);
        });

        stopFn = () => {
          oscs.forEach(o => { try { o.stop(); } catch (_) {} });
        };
      } 
      else if (targetId === 'telephone') {
        const playRingSequence = (time: number) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const ringerGain = ctx.createGain();
          const mainGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 440;
          osc2.frequency.value = 480;
          
          osc1.connect(ringerGain);
          osc2.connect(ringerGain);
          ringerGain.connect(mainGain);
          mainGain.connect(ctx.destination);
          
          mainGain.gain.setValueAtTime(0, time);
          mainGain.gain.linearRampToValueAtTime(0.18, time + 0.05);
          mainGain.gain.setValueAtTime(0.18, time + 0.4);
          mainGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);
          
          osc1.start(time);
          osc2.start(time);
          osc1.stop(time + 0.5);
          osc2.stop(time + 0.5);
          
          // Second ring
          const osc1b = ctx.createOscillator();
          const osc2b = ctx.createOscillator();
          const mainGainB = ctx.createGain();
          
          osc1b.type = 'sine';
          osc2b.type = 'sine';
          osc1b.frequency.value = 440;
          osc2b.frequency.value = 480;
          
          osc1b.connect(mainGainB);
          osc2b.connect(mainGainB);
          mainGainB.connect(ctx.destination);
          
          const time2 = time + 0.6;
          mainGainB.gain.setValueAtTime(0, time2);
          mainGainB.gain.linearRampToValueAtTime(0.18, time2 + 0.05);
          mainGainB.gain.setValueAtTime(0.18, time2 + 0.4);
          mainGainB.gain.exponentialRampToValueAtTime(0.0001, time2 + 0.45);
          
          osc1b.start(time2);
          osc2b.start(time2);
          osc1b.stop(time2 + 0.5);
          osc2b.stop(time2 + 0.5);

          return {
            stop: () => {
              try { osc1.stop(); osc2.stop(); osc1b.stop(); osc2b.stop(); } catch (_) {}
            }
          };
        };

        let result = playRingSequence(ctx.currentTime);
        let interval: any = null;
        if (isLoop) {
          interval = setInterval(() => {
            result = playRingSequence(ctx.currentTime);
          }, 3000);
        }
        stopFn = () => {
          if (interval) clearInterval(interval);
          try { result.stop(); } catch (_) {}
        };
      } 
      else if (targetId === 'siren') {
        const playSirenSequence = (time: number, len: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, time);
          osc.frequency.linearRampToValueAtTime(1100, time + len * 0.45);
          osc.frequency.linearRampToValueAtTime(600, time + len * 0.9);
          
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.12, time + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + len);
          
          osc.start(time);
          osc.stop(time + len + 0.1);

          return osc;
        };

        const duration = 2.0;
        let activeOsc = playSirenSequence(ctx.currentTime, duration);
        let interval: any = null;
        if (isLoop) {
          interval = setInterval(() => {
            activeOsc = playSirenSequence(ctx.currentTime, duration);
          }, duration * 1000 + 200);
        }
        
        stopFn = () => {
          if (interval) clearInterval(interval);
          try { activeOsc.stop(); } catch (_) {}
        };
      } 
      else if (targetId === 'melody') {
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const playTune = (baseTime: number) => {
          const playNote = (freq: number, start: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.02);
            
            osc.start(start);
            osc.stop(start + duration);
            return osc;
          };

          const oscList: OscillatorNode[] = [];
          oscList.push(playNote(notes[0], baseTime + 0.0, 0.2));
          oscList.push(playNote(notes[2], baseTime + 0.2, 0.2));
          oscList.push(playNote(notes[4], baseTime + 0.4, 0.2));
          oscList.push(playNote(notes[3], baseTime + 0.6, 0.2));
          oscList.push(playNote(notes[5], baseTime + 0.8, 0.4));

          return {
            stop: () => {
              oscList.forEach(o => { try { o.stop(); } catch (_) {} });
            }
          };
        };

        let activeTune = playTune(ctx.currentTime);
        let interval: any = null;
        if (isLoop) {
          interval = setInterval(() => {
            activeTune = playTune(ctx.currentTime);
          }, 2000);
        }

        stopFn = () => {
          if (interval) clearInterval(interval);
          try { activeTune.stop(); } catch (_) {}
        };
      }

      setActiveAudioSource({ stop: stopFn });

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (_) {}
  };

  const triggerAppLockscreenNotification = (title: string, bodyText: string) => {
    setFailSafeNotificationModal({ title, body: bodyText });
    playSyntheticBellChime();

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`JR Farm Alert: ${title}`, {
          body: bodyText,
          icon: '/icon-192.png',
          tag: 'jr-farm-bell-notification',
          requireInteraction: true
        });
      } catch (_) {}
    }
  };

  const handleResetToDefaults = () => {
    const keys = [
      'jr_farm_staff', 'jr_farm_ingredients', 'jr_farm_milk', 'jr_farm_ai',
      'jr_farm_tea', 'jr_farm_avo', 'jr_farm_financials', 'jr_farm_sprays',
      'jr_farm_todos', 'jr_farm_fields', 'jr_farm_livestock', 'jr_farm_inventory',
      'jr_farm_staff_off', 'jr_farm_cows', 'jr_farm_vets', 'jr_farm_goats',
      'jr_farm_calves', 'jr_farm_bsfs', 'jr_farm_crop_ops', 'jr_farm_crop_sales'
    ];
    keys.forEach(k => {
      localStorage.removeItem(k);
    });
  };

  const handleImportFullBackup = (dbData: Record<string, any>): boolean => {
    if (!dbData || typeof dbData !== 'object') return false;
    try {
      Object.entries(dbData).forEach(([k, val]) => {
        if (k.startsWith('jr_farm_')) {
          localStorage.setItem(k, JSON.stringify(val));
        }
      });
      return true;
    } catch {
      return false;
    }
  };

  // state updates handlers
  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTodo = (text: string, assigneeName?: string) => {
    const newTodoItem: Todo = {
      id: `todo-${Date.now()}`,
      text,
      completed: false,
      date: toIsoDate(),
      assigneeName
    };
    setTodos([...todos, newTodoItem]);
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };


  const handleUpdateStaffStatus = (id: string, status: 'Present' | 'Off' | 'On Leave') => {
    setStaffList(
      staffList.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleAddStaff = (member: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: `st-${Date.now()}`
    };
    setStaffList([...staffList, newStaff]);
  };

  const handleAddIngredientLib = (ing: Ingredient) => {
    setIngredients([...ingredients, ing]);
  };

  const handleAddMilkRecord = (rec: MilkingRecord) => {
    setMilkRecords([rec, ...milkRecords]);
    if (rec.pricePerLiter && rec.pricePerLiter > 0) {
      const yieldVol = (rec.am ?? 0) + (rec.pm ?? 0);
      const calcSales = rec.totalSales ?? (yieldVol * rec.pricePerLiter);
      const buyerName = rec.buyer ?? 'Brookside Dairy Ltd';
      const autoIncome: FinancialRecord = {
        id: `f-auto-${Date.now()}`,
        type: 'income',
        amount: calcSales,
        category: 'Milk Sale',
        description: `Milk sale payout for Cow ${rec.id} to (${buyerName}) - ${yieldVol.toFixed(1)} Liters @ Ksh ${rec.pricePerLiter}/L`,
        date: rec.date
      };
      setFinancials((prev) => [autoIncome, ...prev]);
    }
  };

  const handleAddMilkOutflow = (rec: MilkOutflowRecord) => {
    setMilkOutflows([rec, ...milkOutflows]);
    if (rec.debtsKsh > 0) {
      const debtor = rec.debtCustomer || 'Informal Debtor';
      const autoDebtIncome: FinancialRecord = {
        id: `f-debt-${Date.now()}`,
        type: 'income',
        amount: rec.debtsKsh,
        category: 'Milk Sale',
        description: `Informal Milk Credit (Debt) - ${debtor}. Liters: worker=${rec.milkUsedByWorkers}L, home=${rec.milkUsedAtHome}L, spoiled=${rec.milkSpoiled}L`,
        date: rec.date
      };
      setFinancials((prev) => [autoDebtIncome, ...prev]);
    }
  };

  const handleDeleteMilkOutflow = (id: string) => {
    setMilkOutflows(milkOutflows.filter(m => m.id !== id));
  };

  const handleAddAIRecord = (rec: AIRecord) => {
    setAiRecords([rec, ...aiRecords]);
  };

  const handleUpdateAIStatus = (cowId: string, date: string, status: AIRecord['status']) => {
    setAiRecords(
      aiRecords.map((cycle) => {
        if (cycle.cowId === cowId && cycle.date === date) {
          // If status changes to Calved or Failed we can update, let's keep estimated due
          return { ...cycle, status };
        }
        return cycle;
      })
    );
  };

  const handleAddTea = (rec: TeaRecord) => {
    setTeaRecords([rec, ...teaRecords]);
    const teaPrice = rec.pricePerKg ?? 58;
    const finalSales = rec.totalSales ?? (rec.qty * teaPrice);
    const buyerName = rec.buyer ?? 'Chinga KTDA Factory';
    const autoIncome: FinancialRecord = {
      id: `f-auto-${Date.now()}`,
      type: 'income',
      amount: finalSales,
      category: 'Tea Sale',
      description: `Tea sale payout for Ref ${rec.ref} to (${buyerName}) - ${rec.qty} KG @ Ksh ${teaPrice}/KG`,
      date: rec.date
    };
    setFinancials((prev) => [autoIncome, ...prev]);
  };

  const handleAddAvo = (rec: AvocadoRecord) => {
    setAvoRecords([rec, ...avoRecords]);
    const finalSales = rec.totalSales;
    const buyerName = rec.grade1Buyer || 'Kakuzi Agribusiness Exporters';
    const autoIncome: FinancialRecord = {
      id: `f-auto-${Date.now()}`,
      type: 'income',
      amount: finalSales,
      category: 'Avocado Sale',
      description: `Avocado Export Ref ${rec.ref} to (${buyerName}) - Grd 1: ${rec.grade1Kg} KG @ Ks${rec.grade1PricePerKg}/KG, Rejects: ${rec.rejectKg} KG @ Ks${rec.priceForRejects}/KG`,
      date: rec.date
    };
    setFinancials((prev) => [autoIncome, ...prev]);
  };

  const handleAddCropSale = (rec: CropSaleRecord) => {
    setCropSales([rec, ...cropSales]);
    const autoIncome: FinancialRecord = {
      id: `f-auto-${Date.now()}`,
      type: 'income',
      amount: rec.totalSales,
      category: 'General Crop Sale',
      description: `Crop Sale (${rec.crop}) payout Ref ${rec.ref} to (${rec.buyer}) - ${rec.qty} ${rec.unit} @ Ksh ${rec.pricePerUnit}/${rec.unit}`,
      date: rec.date
    };
    setFinancials((prev) => [autoIncome, ...prev]);
  };

  const handleAddTransaction = (rec: FinancialRecord) => {
    setFinancials([rec, ...financials]);
  };

  const handleDeleteTransaction = (id: string) => {
    setFinancials(financials.filter((f) => f.id !== id));
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
    setStaffOffRecords(staffOffRecords.filter((r) => r.staffId !== id)); // Clean up off records if staff is deleted
  };

  const handleAddOffRecord = (record: Omit<StaffOffRecord, 'id'>) => {
    const newRecord: StaffOffRecord = {
      ...record,
      id: `off-${Date.now()}`
    };
    setStaffOffRecords([newRecord, ...staffOffRecords]);
    
    // Automatically update the main staffList status field if the off start date is <= today and today is <= end date!
    const today = toIsoDate();
    if (newRecord.startDate <= today && today <= newRecord.endDate && newRecord.status === 'Approved') {
      const liveStatus = newRecord.type === 'Day Off' ? 'Off' : 'On Leave';
      setStaffList((prev) => prev.map((s) => s.id === newRecord.staffId ? { ...s, status: liveStatus } : s));
    }
  };

  const handleDeleteOffRecord = (id: string) => {
    const target = staffOffRecords.find((r) => r.id === id);
    setStaffOffRecords(staffOffRecords.filter((r) => r.id !== id));
    if (target) {
      setStaffList((prev) => prev.map((s) => s.id === target.staffId ? { ...s, status: 'Present' } : s));
    }
  };

  const handleUpdateOffRecordStatus = (id: string, status: 'Approved' | 'Pending' | 'Completed') => {
    setStaffOffRecords((prevList) =>
      prevList.map((r) => {
        if (r.id === id) {
          const updated = { ...r, status };
          const today = toIsoDate();
          if (updated.startDate <= today && today <= updated.endDate) {
            if (status === 'Approved') {
              const liveStatus = updated.type === 'Day Off' ? 'Off' : 'On Leave';
              setStaffList((prev) => prev.map((s) => s.id === updated.staffId ? { ...s, status: liveStatus } : s));
            } else {
              setStaffList((prev) => prev.map((s) => s.id === updated.staffId ? { ...s, status: 'Present' } : s));
            }
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleDeleteIngredientLib = (name: string) => {
    setIngredients(ingredients.filter((i) => i.name !== name));
  };

  const handleDeleteMilkRecord = (id: string, date: string) => {
    setMilkRecords(milkRecords.filter((m) => !(m.id === id && m.date === date)));
  };

  const handleDeleteAIRecord = (cowId: string, date: string) => {
    setAiRecords(aiRecords.filter((a) => !(a.cowId === cowId && a.date === date)));
  };

  const handleDeleteTea = (ref: string) => {
    setTeaRecords(teaRecords.filter((t) => t.ref !== ref));
  };

  const handleDeleteAvo = (ref: string) => {
    setAvoRecords(avoRecords.filter((a) => a.ref !== ref));
  };

  const handleDeleteCropSale = (id: string) => {
    setCropSales(cropSales.filter((s) => s.id !== id));
  };

  const handleDeleteSpray = (id: string) => {
    setSprayRecords(sprayRecords.filter((s) => s.id !== id));
  };

  const handleDeleteFields = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleDeleteLivestock = (id: string) => {
    setLivestock(livestock.filter((l) => l.id !== id));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter((i) => i.id !== id));
  };

  const handleAddSpray = (rec: SprayRecord) => {
    setSprayRecords([rec, ...sprayRecords]);
    
    // Auto-deduct matching chemical from warehouse inventory
    const chemicalLower = rec.chemical.toLowerCase();
    const matched = inventory.find(item => item.name.toLowerCase().includes(chemicalLower) && item.category === 'Chemical');
    if (matched) {
      const deductionAmount = 1; // Default 1 unit/liter per spray run
      const nextQty = Math.max(0, matched.quantity - deductionAmount);
      setInventory(prev => prev.map(item => item.id === matched.id ? { ...item, quantity: nextQty } : item));
      
      if (nextQty <= matched.minStock) {
        handleAddTodo(`⚠️ LOW STOCK ALERT: Chemical "${matched.name}" is down to ${nextQty} ${matched.unit}. Restock required immediately.`, 'Storekeeper');
      }
    }
  };

  const deferNotificationWork = (work: () => void) => {
    if (typeof requestAnimationFrame === 'undefined') {
      setTimeout(work, 0);
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(work, 0);
    });
  };
 
  const handleAddFields = (rec: FieldRecord) => {
    setFields([rec, ...fields]);
  };
 
  const handleAddLivestock = (rec: LivestockRecord) => {
    setLivestock([rec, ...livestock]);
  };
 
  const handleUpdateInventoryStock = (id: string, newQty: number) => {
    setInventory(
      inventory.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };
 
  const handleAddInventoryItem = (item: InventoryItem & { deductions?: Array<{ name: string; amount: number }> }) => {
    setInventory(prev => {
      let updated = [...prev, { id: item.id, name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, minStock: item.minStock, dateReceived: item.dateReceived, location: item.location, expiryDate: item.expiryDate }];
      
      if (item.deductions) {
        item.deductions.forEach(ded => {
          const lowerName = ded.name.toLowerCase();
          updated = updated.map(inv => {
            if (inv.name.toLowerCase().includes(lowerName) && (inv.category === 'Feed' || inv.category === 'Fertilizer')) {
              const nextQty = Math.max(0, inv.quantity - ded.amount);
              if (nextQty <= inv.minStock) {
                setTimeout(() => handleAddTodo(`⚠️ LOW STOCK ALERT: Raw Feed Material "${inv.name}" is down to ${nextQty.toFixed(1)} ${inv.unit} left after compounding.`, 'Storekeeper'), 100);
              }
              return { ...inv, quantity: nextQty };
            }
            return inv;
          });
        });
      }
      return updated;
    });
  };

  const handleAddCow = (rec: Cow) => {
    setCows([rec, ...cows]);
  };

  const handleDeleteCow = (id: string) => {
    setCows(cows.filter(c => c.id !== id));
  };

  const handleUpdateCowStatus = (id: string, status: Cow['status']) => {
    setCows(cows.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleAddVetRecord = (rec: VetRecord) => {
    setVetRecords([rec, ...vetRecords]);
    if (rec.cost > 0) {
      handleAddTransaction({
        id: `f-vet-${Date.now()}`,
        type: 'expense',
        amount: rec.cost,
        category: 'Veternary Care',
        description: `Vet care ${rec.type} for ${rec.cowId} (${rec.treatment})`,
        date: rec.date
      });
    }
  };

  const handleDeleteVetRecord = (id: string) => {
    setVetRecords(vetRecords.filter(r => r.id !== id));
  };

  const handleAddAnimalSale = (rec: AnimalSaleRecord) => {
    setAnimalSales([rec, ...animalSales]);
    if (rec.price > 0) {
      handleAddTransaction({
        id: `tx-sale-${rec.id}`,
        type: 'income',
        amount: rec.price,
        category: 'Livestock Sale',
        description: `Sold ${rec.qty}x ${rec.category} (${rec.animalIdOrBatch})`,
        date: rec.date
      });
    }
  };

  const handleDeleteAnimalSale = (id: string) => {
    setAnimalSales(prev => prev.filter(r => r.id !== id));
    handleDeleteTransaction(`tx-sale-${id}`);
  };

  const handleAddMortality = (rec: MortalityRecord) => {
    setMortalities([rec, ...mortalities]);
  };

  const handleDeleteMortality = (id: string) => {
    setMortalities(prev => prev.filter(r => r.id !== id));
  };

  const handleAddGoatRecord = (rec: GoatRecord) => {
    setGoatRecords([rec, ...goatRecords]);
  };

  const handleDeleteGoatRecord = (id: string) => {
    setGoatRecords(goatRecords.filter(r => r.id !== id));
  };

  const handleAddCalfRecord = (rec: CalfRecord) => {
    setCalfRecords([rec, ...calfRecords]);
  };

  const handleDeleteCalfRecord = (id: string) => {
    setCalfRecords(calfRecords.filter(r => r.id !== id));
  };

  const handleAddBsfRecord = (rec: BsfRecord) => {
    setBsfRecords([rec, ...bsfRecords]);
  };

  const handleDeleteBsfRecord = (id: string) => {
    setBsfRecords(bsfRecords.filter(r => r.id !== id));
  };

  const handleAddCropOp = (rec: CropOpRecord) => {
    setCropOps([rec, ...cropOps]);
  };

  const handleDeleteCropOp = (id: string) => {
    setCropOps(cropOps.filter(r => r.id !== id));
  };

  const handleAddSilage = (rec: SilageRecord) => {
    setSilageRecords([rec, ...silageRecords]);
  };

  const handleDeleteSilage = (id: string) => {
    setSilageRecords(silageRecords.filter(s => s.id !== id));
  };

  const handleAddHeifer = (rec: HeiferRecord) => {
    setHeiferRecords([rec, ...heiferRecords]);
  };

  const handleDeleteHeifer = (id: string) => {
    setHeiferRecords(heiferRecords.filter(h => h.id !== id));
  };

  const handleAddPoultry = (rec: PoultryRecord) => {
    setPoultryRecords([rec, ...poultryRecords]);
  };

  const handleDeletePoultry = (id: string) => {
    setPoultryRecords(poultryRecords.filter(p => p.id !== id));
  };

  const handleAddQuarantine = (rec: QuarantineRecord) => {
    setQuarantineRecords([rec, ...quarantineRecords]);
  };

  const handleDeleteQuarantine = (id: string) => {
    setQuarantineRecords(quarantineRecords.filter(q => q.id !== id));
  };

  const handleUpdateCropOpStatus = (id: string, status: CropOpRecord['status'], completedBy?: string, notes?: string) => {
    setCropOps(cropOps.map(c => c.id === id ? { ...c, status, completedBy: completedBy ?? c.completedBy, notes: notes ?? c.notes } : c));
  };

  const handleEditStaff = (id: string, updated: StaffMember) => {
    setStaffList((prev) => prev.map((s) => s.id === id ? updated : s));
  };

  const handleEditMilkRecord = (id: string, date: string, updated: MilkingRecord) => {
    setMilkRecords((prev) => prev.map((m) => (m.id === id && m.date === date) ? updated : m));
  };

  const handleEditMilkOutflow = (id: string, updated: MilkOutflowRecord) => {
    setMilkOutflows((prev) => prev.map((m) => m.id === id ? updated : m));
  };

  const handleEditAIRecord = (cowId: string, date: string, updated: AIRecord) => {
    setAiRecords((prev) => prev.map((a) => (a.cowId === cowId && a.date === date) ? updated : a));
  };

  const handleEditTea = (oldRef: string, updated: TeaRecord) => {
    setTeaRecords((prev) => prev.map((t) => t.ref === oldRef ? updated : t));
  };

  const handleEditAvo = (oldRef: string, updated: AvocadoRecord) => {
    setAvoRecords((prev) => prev.map((a) => a.ref === oldRef ? updated : a));
  };

  const handleEditFinancialRecord = (id: string, updated: FinancialRecord) => {
    setFinancials((prev) => prev.map((f) => f.id === id ? updated : f));
  };

  const handleEditSprayRecord = (id: string, updated: SprayRecord) => {
    setSprayRecords((prev) => prev.map((s) => s.id === id ? updated : s));
  };

  const handleEditFieldRecord = (id: string, updated: FieldRecord) => {
    setFields((prev) => prev.map((f) => f.id === id ? updated : f));
  };

  const handleEditLivestockRecord = (id: string, updated: LivestockRecord) => {
    setLivestock((prev) => prev.map((l) => l.id === id ? updated : l));
  };

  const handleEditInventoryItem = (id: string, updated: InventoryItem) => {
    setInventory((prev) => prev.map((i) => i.id === id ? updated : i));
  };

  const handleEditStaffOffRecord = (id: string, updated: StaffOffRecord) => {
    setStaffOffRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCow = (id: string, updated: Cow) => {
    setCows((prev) => prev.map((c) => c.id === id ? updated : c));
  };

  const handleEditVetRecord = (id: string, updated: VetRecord) => {
    setVetRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditGoatRecord = (id: string, updated: GoatRecord) => {
    setGoatRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCalfRecord = (id: string, updated: CalfRecord) => {
    setCalfRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditBsfRecord = (id: string, updated: BsfRecord) => {
    setBsfRecords((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCropOpRecord = (id: string, updated: CropOpRecord) => {
    setCropOps((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  const handleEditCropSale = (id: string, updated: CropSaleRecord) => {
    setCropSales((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  // CSV Exporter helper
  const handleExportCSV = () => {
    // Override raw records with the filtered records in the scope of this function
    const milkRecords = filteredMilkRecords;
    const milkOutflows = filteredMilkOutflows;
    const aiRecords = filteredAiRecords;
    const silageRecords = filteredSilageRecords;
    const heiferRecords = filteredHeiferRecords;
    const teaRecords = filteredTeaRecords;
    const avoRecords = filteredAvoRecords;
    const cropSales = filteredCropSales;
    const financials = filteredFinancials;
    const sprayRecords = filteredSprayRecords;
    const quarantineRecords = filteredQuarantineRecords;
    const goatRecords = filteredGoatRecords;
    const calfRecords = filteredCalfRecords;
    const bsfRecords = filteredBsfRecords;
    const inventory = filteredInventory;
    const vetRecords = filteredVetRecords;
    const poultryRecords = filteredPoultryRecords;
    const staffOffRecords = filteredStaffOffRecords;
    const livestock = filteredLivestock;
    const todos = filteredTodos;
    
    const getStoredDiagHistory = () => filteredDiagHistory;
    const getStoredTimetable = () => filteredTimetable;
    
    // Shadow selectedSections to ensure the Master CSV exports ALL sections every time
    const selectedSections = {
      staff: true, milk: true, ai: true, tea: true, avo: true,
      cropSales: true, financials: true, spray: true, fields: true,
      livestock: true, goats: true, calves: true, bsf: true,
      formula: true, inventory: true, vet: true, academy: true,
      timetable: true, silage: true, ai_silage: true, heifers: true,
      ai_heifers: true, poultry: true, live_poultry: true,
      quarantine: true, spray_quarantine: true, vet_withdrawal: true, todos: true
    };

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'JR FARM MASTER ESTATE REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Estate Manager: Dr. Devin Omwenga\n\n`;

    // 1. Staff deployment
    if (selectedSections.staff) {
      csvContent += '--- STAFF DEPLOYMENT STATUS ROSTER ---\n';
      csvContent += 'Name,Section/Unit,Morning Shift,Afternoon Shift,Status\n';
      staffList.forEach((st) => {
        csvContent += `"${st.name}","${st.unit}","${st.shiftMorning}","${st.shiftAfternoon}","${st.status}"\n`;
      });
      csvContent += '\n';
      
      if (staffOffRecords && staffOffRecords.length > 0) {
        csvContent += '--- ALLOCATED SHIFT OFF & DUTY LEAVES LOG ---\n';
        csvContent += 'Employee on Leave,Start Date,Resume Date,Sovereign Leave Reason,Relief Partner Cover\n';
        staffOffRecords.forEach((o) => {
          const stName = staffList.find(s => s.id === o.staffId)?.name || o.staffId;
          csvContent += `"${stName}",${o.startDate},${o.endDate},"${o.reason}","${o.dutyReliefCover || 'None'}"\n`;
        });
        csvContent += '\n';
      }
    }

    // 2. Milking records Section
    if (selectedSections.milk) {
      csvContent += '--- MILKING RECORDS & BULK SALES ---\n';
      csvContent += 'Date,Cow Tag ID,AM Liters,PM Liters,Total Liters,Price/L (Ksh),Buyer/Purchaser,Total Milk Sales (Ksh),Recorder Officer\n';
      milkRecords.forEach((m) => {
        const p = m.pricePerLiter ?? 0;
        const b = m.buyer ?? 'Domestic Use';
        const s = m.totalSales ?? (((m.am ?? 0) + (m.pm ?? 0)) * p);
        csvContent += `${m.date},"${m.id}",${m.am ?? 0},${m.pm ?? 0},${((m.am ?? 0) + (m.pm ?? 0)).toFixed(2)},${p},"${b}",${s},"${m.staff}"\n`;
      });
      csvContent += '\n';
      
      if (milkOutflows && milkOutflows.length > 0) {
        csvContent += '--- DAIRY BULK SALES & OUTFLOW DISPATCHES ---\n';
        csvContent += 'Dispatch Date,Client/Destination,Volume (L),Price/L,Gross Revenue,Pending Debt\n';
        milkOutflows.forEach((mo) => {
          csvContent += `${mo.date},"${mo.destination}",${mo.liters},${mo.pricePerLiter || 0},${mo.liters * (mo.pricePerLiter || 0)},${mo.debtsKsh}\n`;
        });
        csvContent += '\n';
      }
    }

    // 3. Breeding / AI Records Section
    if (selectedSections.ai) {
      csvContent += '--- ARTIFICIAL INSEMINATION AND BREEDING HERD CYCLES ---\n';
      csvContent += 'Cow Tag ID,Service Date,Bull Name / Semen Reference,Expected Due Date (Gestation),Pregnancy Status\n';
      aiRecords.forEach((cycle) => {
        csvContent += `"${cycle.cowId}",${cycle.date},"${cycle.bull}",${cycle.due},"${cycle.status}"\n`;
      });
      csvContent += '\n';
    }

    // 4. Tea harvest Section
    if (selectedSections.tea) {
      csvContent += '--- KTDA TEA EXPORTS HARVEST & DELIVERIES ---\n';
      csvContent += 'Date,Plucking Ref,Primary Buyer,Harvest Weight (KG),Price/KG (Ksh),Gross Amount (Ksh)\n';
      teaRecords.forEach((t) => {
        const p = t.pricePerKg ?? 58;
        const b = t.buyer ?? 'Chinga KTDA Factory';
        const s = t.totalSales ?? (t.qty * p);
        csvContent += `${t.date},"${t.ref}","${b}",${t.qty},${p},${s}\n`;
      });
      csvContent += '\n';
    }

    // 5. Avocado Section
    if (selectedSections.avo) {
      csvContent += '--- AVOCADO EXPORT LOGISTICS ---\n';
      csvContent += 'Date,Shipping Ref,Grade 1 KG,Grade 1 Price/KG,Reject KG,Price for Rejects,Grade 1 Buyer,Reject Buyer,Payment Mode Next Harvest,Debts,Notes,Total Money Got\n';
      avoRecords.forEach((item) => {
        csvContent += `${item.date},"${item.ref}",${item.grade1Kg},${item.grade1PricePerKg},${item.rejectKg},${item.priceForRejects},"${item.grade1Buyer}","${item.rejectBuyer}","${item.paymentModeNextHarvestSeason}",${item.debts},"${item.notes.replace(/"/g, '""')}",${item.totalSales}\n`;
      });
      csvContent += '\n';
    }

    // 6. Other Crops Local Sales Section
    if (selectedSections.cropSales) {
      csvContent += '--- OTHER FIELD CROPS LOCAL SALES RECORD ---\n';
      csvContent += 'Date,Invoice/Receipt Ref,Local Crop,Quantity Sold,Unit,Rate per Unit (Ksh),Gross Income (Ksh),Primary Buyer\n';
      cropSales.forEach((cs) => {
        csvContent += `${cs.date},"${cs.ref}","${cs.crop}",${cs.qty},"${cs.unit}",${cs.pricePerUnit},${cs.totalSales},"${cs.buyer}"\n`;
      });
      csvContent += '\n';
    }

    // 7. Financials Section
    if (selectedSections.financials) {
      csvContent += '--- OPERATING FINANCIAL GENERAL LEDGER ---\n';
      csvContent += 'Date,Transaction,Amount (Ksh),Type,Description\n';
      financials.forEach((f) => {
        csvContent += `${f.date},"${f.category}",${f.amount},${f.type.toUpperCase()},"${f.description}"\n`;
      });
      csvContent += '\n';
    }

    // 8. Spray Section
    if (selectedSections.spray) {
      csvContent += '--- AGROCHEMICAL SPRAY QUARANTINE INDEX ---\n';
      csvContent += 'Date Sprayed,Plot/Section,Chemical Brand,PHI Days,Pest Target,Authorized Harvest Date\n';
      sprayRecords.forEach((s) => {
        csvContent += `${s.date},"${s.block}","${s.chemical}",${s.phi},"${s.target}",${s.safeDate}\n`;
      });
      csvContent += '\n';
    }

    // 9. Fields Directory Section
    if (selectedSections.fields) {
      csvContent += '--- REGISTERED FIELDS & AGRO FORESTRY COMPLIANCE DIRECTORY ---\n';
      csvContent += 'Plot ID,Block Name,Crop Type,Area (Acres),Status,Observational Notes,Date Logged\n';
      fields.forEach((f) => {
        csvContent += `"${f.id}","${f.blockName}","${f.cropType}",${f.acreage},"${f.status}","${f.notes || ''}","${f.date}"\n`;
      });
      csvContent += '\n';
    }

    // 10. General Livestock Log Section
    if (selectedSections.livestock) {
      csvContent += '--- GENERAL LIVESTOCK & CANINES ACTIVITY LEDGER ---\n';
      csvContent += 'Date,Animal/Group Name,Livestock Type,Breed/Count,Current Activity,Observational Log\n';
      livestock.forEach((item) => {
        csvContent += `"${item.date}","${item.name}","${item.type}","${item.countOrBreed}","${item.activity}","${item.notes || ''}"\n`;
      });
      csvContent += '\n';
    }

    // 11. Goats Section
    if (selectedSections.goats) {
      csvContent += '--- GOAT DAIRY & BREEDING HERD REGISTER ---\n';
      csvContent += 'Date,Record ID,Tag/Collar ID,Breed,Purpose,Milk Yield (Liters),Activity,Observational Notes\n';
      goatRecords.forEach((gt) => {
        csvContent += `${gt.date},"${gt.id}","${gt.tagId}","${gt.breed}","${gt.purpose}",${gt.milkYieldLiters ?? ''},"${gt.activity}","${gt.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 12. Calves Section
    if (selectedSections.calves) {
      csvContent += '--- NURSERY CALF WEANING & HEALTH DOSAGE HISTORY ---\n';
      csvContent += 'Date,Record ID,Calf ID,Dam/Mother ID,DOB,Milk Intake (L),Creep Feed Intro Date,Weaned Status,Observational Notes\n';
      calfRecords.forEach((cf) => {
        csvContent += `${cf.date},"${cf.id}","${cf.calfId}","${cf.damId}","${cf.dob}",${cf.milkIntakeLiters},"${cf.creepFeedIntroDate || ''}","${cf.weaned ? 'Weaned' : 'Nursery active'}","${cf.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 13. BSF Batches Section
    if (selectedSections.bsf) {
      csvContent += '--- BLACK SOLDIER FLY (BSF) LARVAE REARING CYCLES ---\n';
      csvContent += 'Date,Record ID,Batch ID,Substrate Feed Type,Inoculation Date,Larvae Harvested (KG),Status Stage,Observational Notes\n';
      bsfRecords.forEach((batch) => {
        csvContent += `${batch.date},"${batch.id}","${batch.batchId}","${batch.substrateType}","${batch.inoculationDate}",${batch.larvaeHarvestedKg},"${batch.status}","${batch.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 14. Feed Formulation
    if (selectedSections.formula) {
      csvContent += '--- COMPILED FEED FORMULATION RECIPE ---\n';
      csvContent += 'Ingredient Sourced,Inclusion weight (kg),Proportional Share (%),Crude Protein (CP %),Energy (ME MJ/kg),Unit Cost (Ksh/kg),Inclusion Cost (Ksh)\n';
      const fItems = getStoredFeedFormula();
      let fWeight = 0;
      fItems.forEach(item => fWeight += item.amount);
      fItems.forEach((item) => {
        const raw = getIngredientNutrients(item.name);
        const pct = fWeight > 0 ? (item.amount / fWeight) * 100 : 0;
        const costVal = raw.cost * item.amount;
        csvContent += `"${item.name}",${item.amount.toFixed(1)},${pct.toFixed(1)},${raw.cp.toFixed(1)},${raw.me.toFixed(1)},${raw.cost.toFixed(1)},${costVal.toFixed(1)}\n`;
      });
      csvContent += '\n';
    }

    // 15. Inventory items
    if (selectedSections.inventory) {
      csvContent += '--- STORAGE WAREHOUSE INVENTORY RESERVES ---\n';
      csvContent += 'Item ID,Item Name,Primary Category,Current Stock,Unit Measure,Reorder Safety Level,Status Alert\n';
      inventory.forEach((item) => {
        const isLow = item.quantity <= item.minStock;
        csvContent += `"${item.id}","${item.name}","${item.category}",${item.quantity},"${item.unit}",${item.minStock},"${isLow ? 'RESTOCK REQUIRED' : 'Secure level'}"\n`;
      });
      csvContent += '\n';
    }

    // 15. Vet records
    if (selectedSections.vet) {
      csvContent += '--- VETERINARY CLINICAL OPERATIONS & HERD TREATMENTS ---\n';
      csvContent += 'Incident Date,Target animal Tag,Type,clinical Diagnosis / Drugs,Cost (Ksh),Veterinary Inoculator,Notes\n';
      vetRecords.forEach((vet) => {
        csvContent += `${vet.date},"${vet.cowId}","${vet.type}","${vet.treatment}",${vet.cost},"${vet.staff}","${vet.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 16. Academy Cases and SOP Logs
    if (selectedSections.academy) {
      csvContent += '--- FARMER\'S ACADEMY CLINICAL DIAGNOSTICS & AUDIT LOGS ---\n';
      csvContent += 'Timestamp,Case Date,Patient Specimen,Clinical Signs,Clinical Suggested Diagnosis,Isolation SOP Guide\n';
      getStoredDiagHistory().forEach((item: any) => {
        csvContent += `"${item.timestamp || item.date}","${item.date}","${item.specimen || item.animalType}","${item.symptom || item.symptoms}","${item.conditionName || item.diagnosisSuggested}","${item.sop || item.isolationGuide || 'Strict bio-security isolation immediately'}"\n`;
      });
      csvContent += '\n';

      if (getStoredDeductLogs().length > 0) {
        csvContent += '--- AUTO-DEDUCT SOP ACTIONS INVENTORY AUDIT LEDGER ---\n';
        csvContent += 'Timestamp/Date,Task Title / Item,Deduction Text / Material,Comptroller Staff,Status\n';
        getStoredDeductLogs().forEach((log: any) => {
          csvContent += `"${log.timestamp || log.date}","${log.taskTitle || log.itemId}","${log.deductionText || log.action || log.qty}","${log.staff || ''}","${log.success ? 'PASSED' : 'FAILED'}"\n`;
        });
        csvContent += '\n';
      }
    }

    // 17. Timetable Schedule
    if (selectedSections.timetable) {
      csvContent += '--- OPERATIONS & TIMETABLE SCHEDULE CALENDAR ---\n';
      csvContent += 'Target Date,Category Group,Standard Operation Description,Timing Interval,Protocol SOP Directions,Specialist Assigned\n';
      getStoredTimetable().forEach((t: any) => {
        csvContent += `${t.targetDate || t.date},"${t.category}","${t.operation || t.title}","${t.when || t.frequency}","SOP: ${t.how} (${t.why})","${t.assignedTo || 'Unassigned'}"\n`;
      });
      csvContent += '\n';
    }

    // 18. Silage Preservation
    if (selectedSections.silage || selectedSections.ai_silage) {
      csvContent += '--- SILAGE PRESERVATION & FEED RATIONS AUDIT ---\n';
      csvContent += 'Date Made,Raw Crop Material,Area (Acres),Silage Weight (KG),Quality Diagnosis,Animals Fed Count,Days Feed Available,Notes\n';
      silageRecords.forEach((item) => {
        csvContent += `${item.dateMade},"${item.rawMaterial}",${item.acres},${item.calculatedWeightKg},"${item.quality}",${item.animalsFedCount},${item.daysOfFeedAvailable},"${item.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 19. Heifers Progeny Growth
    if (selectedSections.heifers || selectedSections.ai_heifers) {
      csvContent += '--- HEIFER PROGRESSIVE GROWTH & PUBERTY MONITORS ---\n';
      csvContent += 'Date Logged,Heifer Ear Tag ID,Weight (KG),Chest Girth (cm),Avg Daily Gain (grams),Breeding Ready,Notes\n';
      heiferRecords.forEach((item) => {
        csvContent += `${item.dateLogged},"${item.cowId}",${item.weightKg},${item.girthCm || 0},${item.averageDailyGainGrams},"${item.breedingReady ? 'READY (AI Eligible)' : 'Growing'}","${item.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 20. Poultry Flock Monitor
    if (selectedSections.poultry || selectedSections.live_poultry) {
      csvContent += '--- POULTRY FLOCK DEVELOPMENT LEDGER & EGG YIELDS ---\n';
      csvContent += 'Date Logged,Cohort Group Name,Stage,Count (Birds),Feed Type,Feed Given (KG),Egg Crates Harvested,Cracked Eggs Count,Mortality Count,Notes\n';
      poultryRecords.forEach((item) => {
        csvContent += `${item.dateLogged},"${item.batchName}","${item.stage}",${item.count || 0},"${item.feedType}",${item.feedGivenKg},${item.eggCratesHarvested || 0},${item.crackedEggsCount || 0},${item.mortalityCount || 0},"${item.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 21. Quarantine Protocols
    if (selectedSections.quarantine || selectedSections.spray_quarantine || selectedSections.vet_withdrawal) {
      csvContent += '--- BIOSECURITY VET ISOLATION & QUARANTINE PROTOCOLS ---\n';
      csvContent += 'Date Started,Animal Tag/Batch,Animal Type,Quarantine Reason,Symptoms Observed,Quarantine Status,Vet In Charge,Notes\n';
      quarantineRecords.forEach((item) => {
        csvContent += `${item.dateStarted},"${item.animalTagOrBatch}","${item.animalType}","${item.quarantineReason}","${item.symptomsObserved || 'None'}","${item.quarantineStatus}","Dr. ${item.vetInCharge}","${item.notes}"\n`;
      });
      csvContent += '\n';
    }

    // 22. Todos (Farm Manager Checklist)
    if (selectedSections.todos) {
      csvContent += '--- FARM MANAGER DAILY CHECKLIST & TO-DOS ---\n';
      csvContent += 'Date Added,Task Description,Status\n';
      todos.forEach((t) => {
        csvContent += `${t.date},"${t.text}","${t.completed ? 'COMPLETED' : 'PENDING'}"\n`;
      });
      csvContent += '\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'JR_Farm_Master_Estate_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive navigation links
  const sidebarLinks = [
    { id: 'dash', label: 'Command Center', icon: LayoutDashboard, category: 'Main' },
    { id: 'roster', label: 'Staff Roster', icon: Users, category: 'Main' },

    { id: 'factory', label: 'Feed Formulator', icon: FlaskConical, category: 'Feed & Factory' },
    { id: 'tmr', label: 'TMR Mixing', icon: Truck, category: 'Feed & Factory' },
    { id: 'bsf', label: 'Organic BSF Batches', icon: Leaf, category: 'Feed & Factory' },

    { id: 'dairy_milk', label: 'Dairy Milking', icon: Activity, category: 'Livestock' },
    { id: 'breeding', label: 'AI & Breeding Cycles', icon: CalendarDays, category: 'Livestock' },
    { id: 'veterinary', label: 'Veterinary Clinic', icon: HeartPulse, category: 'Livestock' },
    { id: 'cows', label: 'Cattle Registry', icon: Award, category: 'Livestock' },
    { id: 'goats', label: 'Caprine Goat Logs', icon: Sparkles, category: 'Livestock' },
    { id: 'calves', label: 'Liquidfed Calves', icon: Compass, category: 'Livestock' },
    { id: 'heifers', label: 'Heifer Progeny', icon: Award, category: 'Livestock' },
    { id: 'poultry', label: 'Poultry Hub', icon: ClipboardList, category: 'Livestock' },
    { id: 'canines', label: 'Security Canines', icon: Shield, category: 'Livestock' },

    { id: 'tea', label: 'KTDA Tea Deliveries', icon: Leaf, category: 'Crop Exports' },
    { id: 'avo', label: 'Avocado Export Shipments', icon: Sprout, category: 'Crop Exports' },
    { id: 'azolla', label: 'Azolla Aquatic Ponds', icon: Droplets, category: 'Crop Exports' },
    { id: 'fields', label: 'Fields & Trees', icon: Sprout, category: 'Crop Exports' },
    { id: 'spray', label: 'GlobalGAP Spray', icon: FlaskConical, category: 'Crop Exports' },

    { id: 'finance', label: 'Financials (P&L)', icon: Coins, category: 'Operations' },
    { id: 'inventory', label: 'Inventory Store', icon: Warehouse, category: 'Operations' },
    { id: 'biogas', label: 'Biogas Optimizer', icon: Droplets, category: 'Operations' },
    { id: 'backup', label: 'Database Backup', icon: Database, category: 'Operations' },

    { id: 'education', label: "Farmer's Academy", icon: BookOpen, category: 'Academy' },
    { id: 'diagnostics_sub', label: "🔍 Diagnostics Wizard", icon: Activity, category: 'Academy' },
    { id: 'inventory_deduct_sub', label: "📦 Stock Auto-Deduct", icon: Database, category: 'Academy' },
    { id: 'timelines_sub', label: "⏳ Gestation & PHI", icon: CalendarDays, category: 'Academy' },
    { id: 'analyzer_sub', label: "📊 Milk-to-Feed Analyser", icon: DollarSign, category: 'Academy' },
    { id: 'timetable', label: "Operations Schedule", icon: CalendarDays, category: 'Academy' },

    { id: 'settings', label: "Control Settings", icon: Settings, category: 'Operations' }
  ];

  const renderReportContent = (sections: Record<string, boolean>, forPdf = false) => {
    try {
    // Override raw records with the filtered records in the scope of this function
    const milkRecords = filteredMilkRecords;
    const milkOutflows = filteredMilkOutflows;
    const aiRecords = filteredAiRecords;
    const silageRecords = filteredSilageRecords;
    const heiferRecords = filteredHeiferRecords;
    const teaRecords = filteredTeaRecords;
    const avoRecords = filteredAvoRecords;
    const cropSales = filteredCropSales;
    const financials = filteredFinancials;
    const sprayRecords = filteredSprayRecords;
    const quarantineRecords = filteredQuarantineRecords;
    const goatRecords = filteredGoatRecords;
    const calfRecords = filteredCalfRecords;
    const bsfRecords = filteredBsfRecords;
    const inventory = filteredInventory;
    const vetRecords = filteredVetRecords;
    const poultryRecords = filteredPoultryRecords;
    const staffOffRecords = filteredStaffOffRecords;
    const livestock = filteredLivestock;
    const todos = filteredTodos;
    
    const getStoredDiagHistory = () => filteredDiagHistory;
    const getStoredTimetable = () => filteredTimetable;
    
    // Calculated aggregates for financials inside this scope
    const activeIncome = reportIncome;
    const activeExpense = reportExpense;
    const activeNet = reportNetBalance;

    return (
      <div className="space-y-6 text-black">
        {/* Formal Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1 flex flex-col items-center justify-center">
          <div 
            className="w-16 h-16 mb-2 overflow-hidden opacity-95" 
            dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }} 
          />
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase font-mono">{getStoredSettings()?.estateName || "JR FARM COOPERATIVE ESTATE"}</h1>
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
            Sovereign Agricultural compliance. GlobalGAP Registered Plot No. {getStoredSettings()?.locationCode || "KT-205A"}
          </p>
          <div className="pt-2 text-xs text-slate-500 font-bold font-mono flex flex-wrap items-center justify-center gap-2">
            <span>Authorized Comptroller: {getStoredSettings()?.administrator || "Dr. Devin Omwenga"}</span> • <span className="bg-yellow-100 text-yellow-900 px-2 py-0.5 rounded font-black">Report Period: {getReportPeriodString()}</span> • <span>Generated: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* High-Level P&L Summary Cards for print */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
            <span className="text-[9px] uppercase font-black text-slate-400 block">Milk Compiled in Period</span>
            <h3 className="text-xl font-black font-mono text-slate-800 mt-1">
              {reportMilkVolume.toFixed(1)} L
            </h3>
          </div>
          <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
            <span className="text-[9px] uppercase font-black text-slate-400 block">Tea Volumes in Period</span>
            <h3 className="text-xl font-black font-mono text-slate-800 mt-1">
              {reportTeaVolume.toLocaleString()} KG
            </h3>
          </div>
          <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
            <span className="text-[9px] uppercase font-black text-slate-400 block">Operating Balance in Period</span>
            <h3 className={`text-xl font-black font-mono mt-1 ${reportNetBalance >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              Ksh {reportNetBalance.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Sections Compilation Stack */}
        <div className="space-y-8 pt-4">
          {Object.values(sections).filter(Boolean).length === 0 && (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <FileText className="mx-auto text-slate-300" size={48} />
              <p className="font-black text-xs uppercase tracking-widest font-sans">No Report Sections Compiled</p>
              <p className="text-[10px] text-slate-405 font-medium font-sans">Toggle section blocks in the composer panel to preview or export.</p>
            </div>
          )}

          {/* 1. Staff deployment List */}
          {sections.staff && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>1. Staff Deployment Schedule</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({staffList.length} staff)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Name</th>
                    <th className="p-1">Section</th>
                    <th className="p-1">Morning Shift</th>
                    <th className="p-1">Afternoon Shift</th>
                    <th className="p-1 text-center">Duty Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st) => (
                    <tr key={st.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-bold text-slate-800">{st.name}</td>
                      <td className="p-1.5">{st.unit}</td>
                      <td className="p-1.5 text-slate-500">{st.shiftMorning}</td>
                      <td className="p-1.5 text-slate-500">{st.shiftAfternoon}</td>
                      <td className="p-1.5 text-center font-bold text-slate-700">{st.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {staffOffRecords && staffOffRecords.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-l-2 border-slate-600 pl-1.5 mb-1">
                    Allocated Shift Off & Duty Leaves Log
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse mt-1">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Employee on Leave</th>
                        <th className="p-1">Start Date</th>
                        <th className="p-1">Resume Date</th>
                        <th className="p-1">Sovereign Leave Reason</th>
                        <th className="p-1">Relief Partner Cover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffOffRecords.map((o) => {
                        const stName = staffList.find(s => s.id === o.staffId)?.name || o.staffId;
                        return (
                          <tr key={o.id} className="border-b border-slate-100">
                            <td className="p-1.5 font-bold text-slate-800">{stName}</td>
                            <td className="p-1.5 font-mono text-slate-700">{o.startDate}</td>
                            <td className="p-1.5 font-mono text-slate-700">{o.endDate}</td>
                            <td className="p-1.5 italic text-slate-600">{o.reason}</td>
                            <td className="p-1.5 font-bold text-slate-800">{o.dutyReliefCover || 'None'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Milk harvest yields */}
          {sections.milk && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>2. Dairy Production Log</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({milkRecords.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date</th>
                    <th className="p-1">Cow Tag ID</th>
                    <th className="p-1 text-right">AM Liters</th>
                    <th className="p-1 text-right">PM Liters</th>
                    <th className="p-1 text-right">Total Yield</th>
                    <th className="p-1">Milker</th>
                  </tr>
                </thead>
                <tbody>
                  {milkRecords.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{m.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{m.id}</td>
                      <td className="p-1.5 text-right font-mono">{(m.am ?? 0).toFixed(1)}</td>
                      <td className="p-1.5 text-right font-mono">{(m.pm ?? 0).toFixed(1)}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{((m.am ?? 0) + (m.pm ?? 0)).toFixed(1)} L</td>
                      <td className="p-1.5">{m.staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {milkOutflows && milkOutflows.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-l-2 border-slate-600 pl-1.5 mb-1">
                    Dairy Bulk Sales, Consumption & Outflow Dispatches
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse mt-1">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Dispatch Date</th>
                        <th className="p-1">Consumption / Sales Details</th>
                        <th className="p-1 text-right">Volume Sold</th>
                        <th className="p-1 text-right">Price/L</th>
                        <th className="p-1 text-right">Gross Revenue</th>
                        <th className="p-1 text-right">Pending Debt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milkOutflows.map((mo) => {
                        const dayMilks = milkRecords.filter(r => r.date === mo.date);
                        const yieldTotal = dayMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
                        const home = mo.milkUsedAtHome || 0;
                        const workers = mo.milkUsedByWorkers || 0;
                        const calf = mo.milkUsedByCalf || 0;
                        const spoiled = mo.milkSpoiled || 0;
                        const consumed = home + workers + calf + spoiled;
                        const netSold = Math.max(0, yieldTotal - consumed);
                        const price = (mo as any).salesPricePerLiter ?? 52;
                        const revenue = netSold * price;
                        return (
                          <tr key={mo.id} className="border-b border-slate-100">
                            <td className="p-1.5 font-mono text-slate-700 font-bold">{mo.date}</td>
                            <td className="p-1.5 text-slate-800">
                              <span className="font-bold">Market Sales (Direct)</span>
                              <span className="text-[10px] font-normal text-slate-500 block">Home: {home}L | Staff: {workers}L | Calf: {calf}L | Spoilt: {spoiled}L</span>
                            </td>
                            <td className="p-1.5 text-right font-mono font-bold">{netSold.toFixed(1)} L</td>
                            <td className="p-1.5 text-right font-mono">Ksh {price}</td>
                            <td className="p-1.5 text-right font-mono font-bold text-emerald-800">Ksh {revenue.toLocaleString()}</td>
                            <td className={`p-1.5 text-right font-mono font-bold ${mo.debtsKsh > 0 ? 'text-rose-700' : 'text-emerald-800'}`}>Ksh {mo.debtsKsh.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. Insemination & Breeding */}
          {sections.ai && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                  <span>3a. Artificial Insemination & Breeding Cycles</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">({aiRecords.length} cycles)</span>
                </h5>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                      <th className="p-1">Cow Tag ID</th>
                      <th className="p-1">Service Date</th>
                      <th className="p-1">Bull Name/Semen Ref</th>
                      <th className="p-1">Gestation Expected Due</th>
                      <th className="p-1">Pregnancy Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiRecords.map((ai, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-1.5 font-bold text-slate-800">{ai.cowId}</td>
                        <td className="p-1.5 font-mono text-slate-700 font-bold">{ai.date}</td>
                        <td className="p-1.5 italic text-slate-600">{ai.bull}</td>
                        <td className="p-1.5 font-mono font-bold">{ai.due}</td>
                        <td className="p-1.5">{ai.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Semen Straws Inventory Table */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                  <span>3b. Genetic Semen Straws & Sire Stock Inventory</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">({semenInventory.length} sires)</span>
                </h5>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                      <th className="p-1">Straw ID/Ref</th>
                      <th className="p-1">Sire/Bull Name</th>
                      <th className="p-1">Breed</th>
                      <th className="p-1">Semen Type</th>
                      <th className="p-1">Origin</th>
                      <th className="p-1 text-right">Straw Cost</th>
                      <th className="p-1 text-right">In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semenInventory.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-1.5 font-bold text-slate-800">{item.id}</td>
                        <td className="p-1.5 font-bold text-slate-700">{item.bullName}</td>
                        <td className="p-1.5 text-slate-600">{item.breed}</td>
                        <td className="p-1.5 text-slate-600">{item.semenType}</td>
                        <td className="p-1.5 text-slate-500">{item.origin}</td>
                        <td className="p-1.5 text-right font-mono">Ksh {item.cost.toLocaleString()}</td>
                        <td className={`p-1.5 text-right font-mono font-bold ${item.quantity <= 3 ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.quantity} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3.5 Cattle Breeders Registry */}
          {(sections.cows || sections.cows_registry) && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>3.5 Registered Dairy Breeders Directory (Cattle Registry)</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({cows.length} head)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Ear Tag ID</th>
                    <th className="p-1">Breed Group Name</th>
                    <th className="p-1">Breed</th>
                    <th className="p-1">Date of Birth</th>
                    <th className="p-1">Maternal & Sire Pedigree</th>
                    <th className="p-1">Official Registry ID</th>
                    <th className="p-1">Breeding Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cows.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-emerald-800 font-bold">{c.id}</td>
                      <td className="p-1.5 font-bold text-slate-800">{c.name}</td>
                      <td className="p-1.5 text-slate-600 font-bold">{c.breed}</td>
                      <td className="p-1.5 font-mono">{c.dob}</td>
                      <td className="p-1.5">
                        <div className="text-[10px] leading-tight text-slate-500">
                          <div>Sire: <span className="font-semibold text-slate-700">{c.sire || 'Imported Semen Specimen'}</span></div>
                          <div>Dam: <span className="font-semibold text-slate-700">{c.dam || 'Acr-Grade Sire Maternal'}</span></div>
                        </div>
                      </td>
                      <td className="p-1.5 font-mono text-slate-600 font-bold">{c.registrationNo || 'UNREG-PENDING'}</td>
                      <td className={`p-1.5 font-bold text-[10px] uppercase ${
                        c.status === 'Lactating' ? 'text-emerald-700' : c.status === 'In-Calf' ? 'text-blue-700' : 'text-slate-500'
                      }`}>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3.6 Cattle Sales & Mortality Ledger */}
          {(sections.life_ledger || sections.cattle_sales || sections.cattle_mortality) && (
            <div className="space-y-4">
              {/* Sales Sub-section */}
              {(sections.life_ledger || sections.cattle_sales) && animalSales && animalSales.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                    <span>3.6.1 Cattle Disposals & Sales Ledger</span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">({animalSales.length} records)</span>
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Date</th>
                        <th className="p-1">Animal ID (Type)</th>
                        <th className="p-1 text-right">Weight (KG)</th>
                        <th className="p-1 text-right">Revenue</th>
                        <th className="p-1">Buyer / Customer</th>
                        <th className="p-1">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {animalSales.map((as, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="p-1.5 font-mono text-slate-600">{as.date}</td>
                          <td className="p-1.5 font-bold text-slate-800">{as.animalId} <span className="text-[10px] text-slate-400 font-normal">({as.animalType})</span></td>
                          <td className="p-1.5 text-right font-mono">{as.weightKg || 'N/A'} kg</td>
                          <td className="p-1.5 text-right font-mono text-emerald-700 font-bold">Ksh {as.price.toLocaleString()}</td>
                          <td className="p-1.5 font-bold text-slate-700">{as.buyerName}</td>
                          <td className="p-1.5 text-slate-500 italic">{as.notes || 'No notes'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mortality Sub-section */}
              {(sections.life_ledger || sections.cattle_mortality) && mortalities && mortalities.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                    <span>3.6.2 Cattle Mortalities, Stillbirths & Loss Registers</span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">({mortalities.length} records)</span>
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Mortality Date</th>
                        <th className="p-1">Animal Tag ID (Type)</th>
                        <th className="p-1">Primary Cause / Diagnosis</th>
                        <th className="p-1">Disposal SOP Routine</th>
                        <th className="p-1">Sign-off Officer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mortalities.map((m, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="p-1.5 font-mono text-slate-600">{m.date}</td>
                          <td className="p-1.5 font-bold text-slate-850">{m.animalId} <span className="text-[10px] text-slate-400 font-normal">({m.animalType})</span></td>
                          <td className="p-1.5 text-rose-700 font-semibold italic">{m.causeDescription}</td>
                          <td className="p-1.5 text-slate-600">{m.disposalSop}</td>
                          <td className="p-1.5 font-bold text-slate-700">{m.managerSignOffBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. Tea harvest */}
          {sections.tea && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>4. Tea Exports Harvest & Deliveries</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({teaRecords.length} dispatches)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date</th>
                    <th className="p-1">Plucking Ref</th>
                    <th className="p-1">Factory Buyer</th>
                    <th className="p-1 text-right">Harvest Weight</th>
                    <th className="p-1 text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {teaRecords.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{t.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{t.ref}</td>
                      <td className="p-1.5">{t.buyer || 'Chinga KTDA'}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{t.qty.toLocaleString()} KG</td>
                      <td className="p-1.5 text-right font-mono text-emerald-800">Ksh {(t.totalSales || (t.qty * (t.pricePerKg ?? 58))).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Avocado Grading */}
          {sections.avo && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>5. Avocado Export Grading & Logistics</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({avoRecords.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1 text-[10px] uppercase">Date</th>
                    <th className="p-1 text-[10px] uppercase">Ref</th>
                    <th className="p-1 text-right text-[10px] uppercase">Grade 1 KG</th>
                    <th className="p-1 text-right text-[10px] uppercase">G1 Price/KG</th>
                    <th className="p-1 text-right text-[10px] uppercase">Reject KG</th>
                    <th className="p-1 text-right text-[10px] uppercase">Reject Price/KG</th>
                    <th className="p-1 text-[10px] uppercase">G1 Buyer</th>
                    <th className="p-1 text-[10px] uppercase">Reject Buyer</th>
                    <th className="p-1 text-[10px] uppercase">Payment Mode</th>
                    <th className="p-1 text-right text-[10px] uppercase">Debts</th>
                    <th className="p-1 text-right text-[10px] uppercase">Total Money Got</th>
                  </tr>
                </thead>
                <tbody>
                  {avoRecords.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 text-[10px]">
                      <td className="p-1.5 font-mono text-slate-750 font-bold">{item.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{item.ref}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{item.grade1Kg} kg</td>
                      <td className="p-1.5 text-right font-mono">Ksh {item.grade1PricePerKg}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{item.rejectKg} kg</td>
                      <td className="p-1.5 text-right font-mono">Ksh {item.priceForRejects}</td>
                      <td className="p-1.5 font-medium">{item.grade1Buyer}</td>
                      <td className="p-1.5 font-medium">{item.rejectBuyer}</td>
                      <td className="p-1.5 font-medium">{item.paymentModeNextHarvestSeason}</td>
                      <td className="p-1.5 text-right font-mono text-rose-700 font-bold">Ksh {item.debts.toLocaleString()}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-emerald-800">
                        Ksh {item.totalSales.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. Crop Sales */}
          {sections.cropSales && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>6. Local Commodities cash transactions</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({cropSales.length} trades)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date</th>
                    <th className="p-1">Commodity Crop</th>
                    <th className="p-1">Quantity</th>
                    <th className="p-1 text-right">Price per Unit</th>
                    <th className="p-1 text-right">Gross Revenue</th>
                    <th className="p-1">Buyer Name</th>
                  </tr>
                </thead>
                <tbody>
                  {cropSales.map((cs, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{cs.date}</td>
                      <td className="p-1.5 font-bold text-slate-805">{cs.crop}</td>
                      <td className="p-1.5 italic">{cs.qty} {cs.unit}</td>
                      <td className="p-1.5 text-right font-mono">Ksh {cs.pricePerUnit}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-emerald-800 font-mono">Ksh {cs.totalSales.toLocaleString()}</td>
                      <td className="p-1.5 text-slate-700">{cs.buyer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. Financial Ledger */}
          {sections.financials && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>7. Operational accounting General Ledger</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({filteredFinancials.length} journals)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date</th>
                    <th className="p-1">Reference & description</th>
                    <th className="p-1">Accounting Type</th>
                    <th className="p-1 text-right">Amount (Ksh)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFinancials.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{f.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">
                        {f.category} <span className="text-[10px] text-slate-450 font-medium italic">({f.description})</span>
                      </td>
                      <td className="p-1.5 uppercase font-mono font-black text-[10px]">
                        <span className={f.type === 'income' ? 'text-emerald-700' : 'text-amber-700'}>
                          {f.type}
                        </span>
                      </td>
                      <td className={`p-1.5 text-right font-mono font-bold ${f.type === 'income' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        Ksh {f.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center text-[10px] font-sans mt-2">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px]">Period Income</span>
                  <strong className="text-emerald-800 font-mono font-bold text-xs">Ksh {reportIncome.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px]">Period Expense</span>
                  <strong className="text-amber-800 font-mono font-bold text-xs">Ksh {reportExpense.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px]">Period Net Subtotal</span>
                  <strong className={`font-mono font-bold text-xs ${reportNetBalance >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    Ksh {reportNetBalance.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* 8. Spray Compliance and Quarantines */}
          {sections.spray && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>8. Agrochemical Spray Compliance & Quarantines</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({sprayRecords.length} treatments)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Plot Section</th>
                    <th className="p-1">Chemical Brand</th>
                    <th className="p-1 text-center font-mono">PHI Quarantine</th>
                    <th className="p-1">Target pest</th>
                    <th className="p-1">Safe pick date</th>
                  </tr>
                </thead>
                <tbody>
                  {sprayRecords.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-bold text-slate-800">{s.block}</td>
                      <td className="p-1.5 italic">{s.chemical}</td>
                      <td className="p-1.5 text-center font-mono font-bold">{s.phi} Days</td>
                      <td className="p-1.5 text-slate-705">{s.target}</td>
                      <td className="p-1.5 font-mono font-bold text-green-700">{s.safeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 9. Registered field Plots */}
          {sections.fields && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>9. Registered Blocks & Silage Fields Directory</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({fields.length} plots)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Plot ID</th>
                    <th className="p-1">Block Name</th>
                    <th className="p-1">Primary Feed Crop</th>
                    <th className="p-1 text-right">Size (Acres)</th>
                    <th className="p-1 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{f.id}</td>
                      <td className="p-1.5 font-bold text-slate-805">{f.blockName}</td>
                      <td className="p-1.5 italic text-slate-655">{f.cropType}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{f.acreage} Acres</td>
                      <td className="p-1.5 text-center font-bold text-[10px] text-slate-600">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 10. General Livestock */}
          {sections.livestock && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>10. General Livestock & Canines Activity Log</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({livestock.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date Logged</th>
                    <th className="p-1">Animal/Group Name</th>
                    <th className="p-1">Livestock Type</th>
                    <th className="p-1">Breed/Count</th>
                    <th className="p-1">Activity</th>
                    <th className="p-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {livestock.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{item.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{item.name}</td>
                      <td className="p-1.5">{item.countOrBreed}</td>
                      <td className="p-1.5 font-bold text-slate-700">{item.activity}</td>
                      <td className="p-1.5 text-slate-500 italic">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 11. Goats Milk registers */}
          {sections.goats && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>11. Goats Dairy herd & lactation logs</span>
                <span className="text-[9px] font-mono text-slate-454 font-bold">({goatRecords.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date</th>
                    <th className="p-1">Tag/Collar ID</th>
                    <th className="p-1">Breed Class</th>
                    <th className="p-1">Classification</th>
                    <th className="p-1 text-right">Yield (Liters)</th>
                    <th className="p-1">Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {goatRecords.map((gt) => (
                    <tr key={gt.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{gt.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{gt.tagId}</td>
                      <td className="p-1.5 italic text-slate-505">{gt.breed}</td>
                      <td className="p-1.5">{gt.purpose}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-slate-800">{gt.milkYieldLiters !== undefined ? `${gt.milkYieldLiters} L` : 'N/A'}</td>
                      <td className="p-1.5 font-medium">{gt.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 12. Liquidfed Calves log */}
          {sections.calves && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>12. Nursery young calf nutrition logs</span>
                <span className="text-[9px] font-mono text-slate-454 font-bold">({calfRecords.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date Logged</th>
                    <th className="p-1">Calf ID</th>
                    <th className="p-1">Mother Cow ID</th>
                    <th className="p-1 text-right">Liquid Milk Intake</th>
                    <th className="p-1">Weaned Status</th>
                    <th className="p-1">Clinical Note</th>
                  </tr>
                </thead>
                <tbody>
                  {calfRecords.map((cf) => (
                    <tr key={cf.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{cf.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{cf.calfId}</td>
                      <td className="p-1.5 italic text-slate-505">{cf.damId}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{cf.milkIntakeLiters} Liters</td>
                      <td className="p-1.5 font-bold text-slate-705">{cf.weaned ? 'WEANED' : 'active Nursery'}</td>
                      <td className="p-1.5 italic text-slate-500">{cf.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 13. Black Soldier Fly Cycles */}
          {sections.bsf && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>13. organic black Soldier Fly (BSF) Larval cycles</span>
                <span className="text-[9px] font-mono text-slate-454 font-bold">({bsfRecords.length} batches)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date</th>
                    <th className="p-1">Batch ID</th>
                    <th className="p-1">Substrate Type</th>
                    <th className="p-1 text-center font-mono">Inoculated</th>
                    <th className="p-1 text-right">larvae Harvested</th>
                    <th className="p-1">Stage status</th>
                  </tr>
                </thead>
                <tbody>
                  {bsfRecords.map((batch) => (
                    <tr key={batch.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{batch.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{batch.batchId}</td>
                      <td className="p-1.5 italic text-slate-705">{batch.substrateType}</td>
                      <td className="p-1.5 text-center font-mono">{batch.inoculationDate}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-yellow-800">{batch.larvaeHarvestedKg} KG</td>
                      <td className="p-1.5 font-mono font-semibold text-[10px] text-slate-500">{batch.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 13.5 Azolla Ponds */}
          {sections.azolla && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>13.5 Azolla Aquatic Ponds (Protein Feed)</span>
                <span className="text-[9px] font-mono text-slate-454 font-bold">({azollaRecords.length} harvests)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Harvest Date</th>
                    <th className="p-1">Pond ID</th>
                    <th className="p-1 text-right">Yield (KG)</th>
                    <th className="p-1">Distributed To</th>
                    <th className="p-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {azollaRecords.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{a.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{a.pondId}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-emerald-800">{a.harvestYieldKg} KG</td>
                      <td className="p-1.5 text-slate-705">{a.distributedTo}</td>
                      <td className="p-1.5 italic text-slate-500">{a.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 14. Stock reserves */}
          {sections.inventory && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>14. Storage Warehouse stocks reserves</span>
                <span className="text-[9px] font-mono text-slate-454 font-bold">({inventory.length} items)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Item ID</th>
                    <th className="p-1">Name</th>
                    <th className="p-1">Category Classification</th>
                    <th className="p-1 text-right">Available stock</th>
                    <th className="p-1">Safety level</th>
                    <th className="p-1 text-center">Alert status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isLow = item.quantity <= item.minStock;
                    return (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="p-1.5 font-mono text-slate-700 font-bold">{item.id}</td>
                        <td className="p-1.5 font-bold text-slate-800">{item.name}</td>
                        <td className="p-1.5 italic text-slate-600">{item.category}</td>
                        <td className="p-1.5 text-right font-mono font-bold">{item.quantity} {item.unit}</td>
                        <td className="p-1.5 text-right font-mono text-slate-450">{item.minStock}</td>
                        <td className="p-1.5 text-center text-[10px] font-black">
                          {isLow ? <span className="text-amber-700">RESTOCK</span> : <span className="text-emerald-700">SECURE</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 15. vet clinicals */}
          {sections.vet && (
            <div className="space-y-2">
               <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>15. Clinical veterinary treatments & diagnostics</span>
                <span className="text-[9px] font-mono text-slate-454 font-bold">({vetRecords.length} entries)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Incident Date</th>
                    <th className="p-1">Animal Cow Tag</th>
                    <th className="p-1">Treatment Type</th>
                    <th className="p-1">clinical Diagnosis / Intervention</th>
                    <th className="p-1 text-right">Authorized Cost</th>
                    <th className="p-1">Inoculator Vet</th>
                  </tr>
                </thead>
                <tbody>
                  {vetRecords.map((vet) => (
                    <tr key={vet.id} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-700 font-bold">{vet.date}</td>
                      <td className="p-1.5 font-bold text-slate-800">{vet.cowId}</td>
                      <td className="p-1.5 italic text-slate-500">{vet.type}</td>
                      <td className="p-1.5 font-mono">{vet.treatment} <span className="text-[10px] text-slate-500 block">{vet.notes}</span></td>
                      <td className="p-1.5 text-right font-mono font-black">Ksh {vet.cost.toLocaleString()}</td>
                      <td className="p-1.5">{vet.staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 16. Compiled Feed Formulation Recipe */}
          {sections.formula && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>16. Compiled Feed Formulation Recipe</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({getStoredFeedFormula().length} ingredients)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Ingredient Sourced</th>
                    <th className="p-1 text-right">Inclusion Weight (KG)</th>
                    <th className="p-1 text-right">Share (%)</th>
                    <th className="p-1 text-right">Crude Protein (CP %)</th>
                    <th className="p-1 text-right">Energy (ME MJ/kg)</th>
                    <th className="p-1 text-right">Unit Cost</th>
                    <th className="p-1 text-right">Inclusion Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const fItems = getStoredFeedFormula();
                    let fWeight = 0;
                    fItems.forEach(item => fWeight += item.amount);
                    return fItems.map((item, idx) => {
                      const raw = getIngredientNutrients(item.name);
                      const pct = fWeight > 0 ? (item.amount / fWeight) * 100 : 0;
                      const costVal = raw.cost * item.amount;
                      return (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="p-1.5 font-bold text-slate-800">{item.name}</td>
                          <td className="p-1.5 text-right font-mono font-bold">{item.amount.toFixed(1)} KG</td>
                          <td className="p-1.5 text-right font-mono text-slate-600">{pct.toFixed(1)}%</td>
                          <td className="p-1.5 text-right font-mono text-emerald-800 font-bold">{raw.cp.toFixed(1)}%</td>
                          <td className="p-1.5 text-right font-mono text-slate-600">{raw.me.toFixed(1)} MJ</td>
                          <td className="p-1.5 text-right font-mono">Ksh {raw.cost.toFixed(1)}</td>
                          <td className="p-1.5 text-right font-mono font-bold text-slate-800">Ksh {costVal.toFixed(1)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* 17. Heifers Progeny Growth */}
          {(sections.heifers || sections.ai_heifers) && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>17. Heifer Progressive Growth & Puberty Monitors</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({heiferRecords.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date Logged</th>
                    <th className="p-1">Heifer Tag ID</th>
                    <th className="p-1 text-right">Weight (KG)</th>
                    <th className="p-1 text-right">Chest Girth (cm)</th>
                    <th className="p-1 text-right">Avg Daily Gain</th>
                    <th className="p-1">Breeding Ready</th>
                    <th className="p-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {heiferRecords.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-650">{item.dateLogged}</td>
                      <td className="p-1.5 font-bold text-slate-800">{item.cowId}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-slate-800">{item.weightKg} kg</td>
                      <td className="p-1.5 text-right font-mono">{item.girthCm || 'N/A'} cm</td>
                      <td className="p-1.5 text-right font-mono text-emerald-800">+{item.averageDailyGainGrams}g/day</td>
                      <td className={`p-1.5 font-bold ${item.breedingReady ? 'text-emerald-700' : 'text-slate-550'}`}>
                        {item.breedingReady ? 'READY (AI Eligible)' : 'Growing'}
                      </td>
                      <td className="p-1.5 text-slate-500 italic text-[10px]">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 18. Poultry Hub */}
          {(sections.poultry || sections.live_poultry) && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>18. Poultry Flock Development Ledger & Egg Yields</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({poultryRecords.length} reports)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date Logged</th>
                    <th className="p-1">Cohort Group</th>
                    <th className="p-1">Stage</th>
                    <th className="p-1 text-right">Count (Birds)</th>
                    <th className="p-1">Feed Given</th>
                    <th className="p-1 text-right">Egg Crates Sourced</th>
                    <th className="p-1 text-right">Mortality</th>
                    <th className="p-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {poultryRecords.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-650">{item.dateLogged}</td>
                      <td className="p-1.5 font-bold text-slate-800">{item.batchName}</td>
                      <td className="p-1.5 text-[10px] uppercase font-bold text-slate-600">{item.stage}</td>
                      <td className="p-1.5 text-right font-mono">{item.count || 0}</td>
                      <td className="p-1.5 italic text-slate-600">{item.feedGivenKg} kg ({item.feedType})</td>
                      <td className="p-1.5 text-right font-mono font-bold text-amber-800">{item.eggCratesHarvested || 0} Crates</td>
                      <td className={`p-1.5 text-right font-mono font-bold ${item.mortalityCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                        {item.mortalityCount || 0}
                      </td>
                      <td className="p-1.5 text-slate-500 italic text-[10px]">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 19. Quarantine Protocols */}
          {(sections.quarantine || sections.spray_quarantine || sections.vet_withdrawal) && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>19. Biosecurity Vet Isolation & Quarantine Protocols</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({quarantineRecords.length} quarantines)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date Started</th>
                    <th className="p-1">Animal Tag/Batch</th>
                    <th className="p-1">Animal Type</th>
                    <th className="p-1">Quarantine Reason</th>
                    <th className="p-1">Symptoms Observed</th>
                    <th className="p-1">Quarantine Status</th>
                    <th className="p-1">Vet In Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {quarantineRecords.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-650">{item.dateStarted}</td>
                      <td className="p-1.5 font-bold text-slate-800">{item.animalTagOrBatch}</td>
                      <td className="p-1.5 text-slate-600">{item.animalType}</td>
                      <td className="p-1.5 font-bold text-amber-850 italic">{item.quarantineReason}</td>
                      <td className="p-1.5 text-slate-600">{item.symptomsObserved || 'None'}</td>
                      <td className="p-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          item.quarantineStatus === 'Active Quarantine' ? 'bg-rose-100 text-rose-800' : 'bg-green-100 text-green-800'
                        }`}>{item.quarantineStatus}</span>
                      </td>
                      <td className="p-1.5 font-bold text-slate-700">Dr. {item.vetInCharge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 20. Silage Preservation */}
          {(sections.silage || sections.ai_silage) && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>20. Silage Preservation & Feed Rations Audit</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({silageRecords.length} records)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Date Made</th>
                    <th className="p-1">Raw Crop Material</th>
                    <th className="p-1 text-right">Area (Acres)</th>
                    <th className="p-1 text-right">Silage Weight (KG)</th>
                    <th className="p-1 text-center">Quality Grade</th>
                    <th className="p-1 text-right">Animals Fed</th>
                    <th className="p-1 text-right">Feed Longevity</th>
                  </tr>
                </thead>
                <tbody>
                  {silageRecords.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-650">{item.dateMade}</td>
                      <td className="p-1.5 font-bold text-slate-800">{item.rawMaterial}</td>
                      <td className="p-1.5 text-right font-mono">{item.acres} Acres</td>
                      <td className="p-1.5 text-right font-mono font-bold text-slate-800">{item.calculatedWeightKg.toLocaleString()} KG</td>
                      <td className="p-1.5 text-center font-bold text-emerald-800 uppercase">{item.quality}</td>
                      <td className="p-1.5 text-right font-mono">{item.animalsFedCount} head</td>
                      <td className="p-1.5 text-right font-mono font-bold text-amber-800">{item.daysOfFeedAvailable} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 21. Operations Timetable Schedule */}
          {sections.timetable && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>21. Operations & Timetable Schedule Calendar</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({getStoredTimetable().length} tasks)</span>
              </h5>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                    <th className="p-1">Target Date</th>
                    <th className="p-1">Category Group</th>
                    <th className="p-1">Standard Operation</th>
                    <th className="p-1">Timing Interval</th>
                    <th className="p-1">SOP Protocol Directions</th>
                    <th className="p-1">Specialist Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {getStoredTimetable().map((t: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-1.5 font-mono text-slate-650 font-bold">{t.targetDate || t.date}</td>
                      <td className="p-1.5 uppercase font-bold text-slate-600 text-[10px]">{t.category}</td>
                      <td className="p-1.5 font-bold text-slate-800">{t.operation || t.title}</td>
                      <td className="p-1.5 text-slate-550 italic">{t.when || t.frequency}</td>
                      <td className="p-1.5 text-slate-600">SOP: {t.how} ({t.why})</td>
                      <td className="p-1.5 font-bold text-slate-700">{t.assignedTo || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 22. Farmer's Academy Clinical Diagnostics & Audit Logs */}
          {sections.academy && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                  <span>22a. Farmer's Academy Clinical Diagnostics Casebook</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">({getStoredDiagHistory().length} cases)</span>
                </h5>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                      <th className="p-1">Case Timestamp</th>
                      <th className="p-1">Date</th>
                      <th className="p-1">Patient Specimen</th>
                      <th className="p-1">Clinical Signs</th>
                      <th className="p-1">Clinical Suggested Diagnosis</th>
                      <th className="p-1">Isolation SOP Guide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStoredDiagHistory().map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-1.5 font-mono text-slate-500">{item.timestamp || item.date}</td>
                        <td className="p-1.5 font-mono text-slate-700 font-bold">{item.date}</td>
                        <td className="p-1.5 font-bold text-emerald-800">{item.specimen || item.animalType}</td>
                        <td className="p-1.5 text-slate-600 italic">{item.symptom || item.symptoms}</td>
                        <td className="p-1.5 font-bold text-slate-800">{item.conditionName || item.diagnosisSuggested}</td>
                        <td className="p-1.5 text-slate-500">{item.sop || item.isolationGuide || 'Strict bio-security isolation immediately'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {getStoredDeductLogs().length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                    <span>22b. Auto-Deduct SOP Actions Inventory Audit Ledger</span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">({getStoredDeductLogs().length} audits)</span>
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Timestamp/Date</th>
                        <th className="p-1">Task Title / Item</th>
                        <th className="p-1">Deduction Text / Material</th>
                        <th className="p-1">Comptroller Staff</th>
                        <th className="p-1 text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getStoredDeductLogs().map((log: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="p-1.5 font-mono text-slate-500">{log.timestamp || log.date}</td>
                          <td className="p-1.5 font-bold text-slate-800">{log.taskTitle || log.itemId}</td>
                          <td className="p-1.5 italic text-slate-600">{log.deductionText || log.action || log.qty}</td>
                          <td className="p-1.5 font-bold text-slate-700">{log.staff || 'System Auto'}</td>
                          <td className="p-1.5 text-center">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              log.success ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                            }`}>{log.success ? 'PASSED' : 'FAILED'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 23. Todos */}
          {sections.todos && (
            <div className="space-y-4">
              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 flex justify-between">
                <span>Farm Manager's Daily Checklist & To-Dos</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">({todos.length} total tasks)</span>
              </h5>
              
              {todos.filter(t => !t.completed).length > 0 && (
                <div className="mt-2">
                  <h5 className="text-[10px] font-black text-rose-700 uppercase tracking-widest border-l-2 border-rose-700 pl-1.5 mb-1">
                    Action Required: Pending Farm Tasks
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse mt-1">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Date Added</th>
                        <th className="p-1">Task Description</th>
                        <th className="p-1 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todos.filter(t => !t.completed).map((t) => (
                        <tr key={t.id} className="border-b border-slate-100">
                          <td className="p-1.5 font-mono text-slate-700">{t.date}</td>
                          <td className="p-1.5 font-bold text-slate-800">{t.text}</td>
                          <td className="p-1.5 font-bold text-rose-700 text-right">PENDING</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {todos.filter(t => t.completed).length > 0 && (
                <div className="mt-2">
                  <h5 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest border-l-2 border-emerald-700 pl-1.5 mb-1">
                    Completed Farm Tasks
                  </h5>
                  <table className="w-full text-[11px] text-left border-collapse mt-1">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-500 font-black">
                        <th className="p-1">Date Added</th>
                        <th className="p-1">Task Description</th>
                        <th className="p-1 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todos.filter(t => t.completed).map((t) => (
                        <tr key={t.id} className="border-b border-slate-100">
                          <td className="p-1.5 font-mono text-slate-500">{t.date}</td>
                          <td className="p-1.5 font-bold text-slate-500 line-through">{t.text}</td>
                          <td className="p-1.5 font-bold text-emerald-700 text-right">COMPLETED</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sign-off Stamps */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-xs shrink-0">
          <div className="border-t border-slate-400 pt-3 text-center space-y-1">
            <div className="h-10"></div>
            <span className="font-mono font-bold block text-slate-800">Mosoti (Senior Herdsman)</span>
            <span className="text-[10px] text-slate-450 block uppercase">Operations Inspector Sig</span>
          </div>
          <div className="border-t border-slate-400 pt-3 text-center space-y-1">
            <div className="h-10"></div>
            <span className="font-mono font-bold block text-slate-800">{getStoredSettings()?.administrator || "Dr. Devin Omwenga"} (Overall Farm Manager)</span>
            <span className="text-[10px] text-slate-450 block uppercase">Sovereign Superintendent Sig</span>
          </div>
        </div>
      </div>
    );
    } catch (e: any) {
      return (
        <div style={{ color: 'red', padding: '20px', background: '#fee2e2', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Master Report Crashed</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{e.toString()}\n{e.stack}</pre>
        </div>
      );
    }
  };

  // Visual Orientation Enforcement System for Mobile/Tablet Devices
  const showOrientationBlocker = 
    typeof window !== 'undefined' && 
    (window.innerWidth < 1280 || window.matchMedia("(hover: none)").matches) && // Apply to mobile, tablets, and sub-1280px screens
    ((farmSettings.orientationPreference === 'portrait' && viewportOrientation === 'landscape') ||
     (farmSettings.orientationPreference === 'landscape' && viewportOrientation === 'portrait'));

  const handleBypassOrientation = () => {
    const updated = { ...farmSettings, orientationPreference: 'any' as const };
    localStorage.setItem('jr_farm_estate_settings', JSON.stringify(updated));
    setFarmSettings(updated);
    applyOrientationPreference('any');
    triggerAppToastMessage("Orientation unlocked. Native auto-rotate enabled.");
  };

  return (
    <ErrorBoundary>
    <div className="farm-app-shell relative flex min-h-screen overflow-hidden text-slate-900 font-sans">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_48%,_#e2e8f0_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      {/* Dynamic Screen Orientation Blocker Overlay */}
      {showOrientationBlocker && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/92 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-white select-none animate-fade-in font-sans">
          <div className="max-w-md bg-slate-900/85 border border-white/10 p-8 rounded-[2rem] shadow-2xl space-y-6 flex flex-col items-center relative overflow-hidden farm-soft-ring">
            {/* Subtle decorative background gradient */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/12 rounded-full blur-3xl pointer-events-none" />

            {/* Animated Rotate Icon */}
            <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative animate-pulse shrink-0">
              <div className="animate-spin duration-1000 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>
            </div>

            {/* Informative Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-black italic tracking-tight uppercase text-white">
                {farmSettings.orientationPreference === 'portrait' ? "📱 Portrait View Required" : "📐 Landscape View Required"}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                You locked the app display layout to <strong className="text-yellow-500 font-extrabold">{farmSettings.orientationPreference === 'portrait' ? "Portrait (Tall Screen)" : "Landscape (Wide View)"}</strong> in the farm Settings configuration.
              </p>
              <p className="text-[11px] text-slate-400 leading-normal italic">
                Please turn your device or unlock native rotation to continue.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full pt-2 space-y-2 shrink-0">
              <button
                onClick={handleBypassOrientation}
                className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-98 transition-all"
              >
                🔓 Disable Lock (Allow Free Turn)
              </button>
              
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-1">
                Superintendent Compliance Safe System
              </p>
            </div>
          </div>
        </div>
      )}
      {/* 1. DESKTOP SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-950/92 backdrop-blur-xl text-slate-100 h-screen border-r border-white/10 shadow-2xl overflow-y-auto flex flex-col z-40 transition-all duration-300 ${
        slimSidebar ? 'w-20' : 'w-72'
      } hidden lg:flex`}>
        <div className="p-8 text-center border-b border-white/8 mb-6 shrink-0 relative flex flex-col items-center">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 rounded text-[9px] font-black uppercase tracking-wider">
            Live
          </div>
          {/* Collapse sidebar trigger button */}
          <button
            onClick={() => setSlimSidebar(!slimSidebar)}
            className="absolute top-2 left-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/40 text-slate-300 hover:text-white transition-all cursor-pointer m-0 active:scale-95 border-none"
            title={slimSidebar ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {slimSidebar ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
          </button>
 
          {/* Branded Logo */}
          <div className="flex justify-center mb-3">
            <div 
              className="w-16 h-16 shadow-xl rounded-2xl border border-white/10 overflow-hidden bg-white/5 p-[1px]" 
              dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }} 
            />
          </div>
          {!slimSidebar && (
            <>
              <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">{getStoredSettings()?.estateName || "JR FARM OMNI-ESTATE"}</h1>
              <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-1 font-mono">
                Manager: {getStoredSettings()?.administrator || "Dr. Devin Omwenga"}
              </p>
            </>
          )}
        </div>
 
        {/* Sidebar Search query input */}
        {!slimSidebar && (
          <div className="px-4 mb-4 relative">
            <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none text-emerald-400">
              <Search size={13} />
            </div>
            <input
              type="text"
              placeholder="Search sections..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border-emerald-400/50 transition-colors font-semibold"
            />
            {sidebarSearch && (
              <button
                onClick={() => setSidebarSearch('')}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white text-xs bg-transparent border-0 cursor-pointer p-0 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}
 
        {/* Sidebar Nav links grouped by category */}
        <nav className="flex-1 px-4 space-y-6">
          {slimSidebar ? (
            <div className="space-y-4 flex flex-col items-center">
              {sidebarLinks
                .filter((link) => 
                  link.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                  link.category.toLowerCase().includes(sidebarSearch.toLowerCase())
                )
                .map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  
                  let hasDot = false;
                  let dotColor = 'bg-yellow-500';
                  
                  if (link.id === 'inventory') {
                    const lowCount = inventory.filter(i => i.quantity <= i.minStock).length;
                    if (lowCount > 0) { hasDot = true; dotColor = 'bg-rose-500 animate-pulse'; }
                  } else if (link.id === 'timetable') {
                    const pendingTasks = todos.filter(t => !t.completed).length;
                    if (pendingTasks > 0) { hasDot = true; dotColor = 'bg-amber-500'; }
                  } else if (link.id === 'roster') {
                    const onLeave = staffList.filter(s => s.status === 'On Leave').length;
                    if (onLeave > 0) { hasDot = true; dotColor = 'bg-emerald-500'; }
                  }
 
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative border-none ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-md border-b-4 border-yellow-500 font-extrabold'
                          : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                      }`}
                      title={link.label}
                    >
                      <Icon size={18} className={isActive ? 'text-yellow-500' : 'text-emerald-400'} />
                      {hasDot && (
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${dotColor}`}></span>
                      )}
                    </button>
                  );
                })}
            </div>
          ) : (
            ['Main', 'Feed & Factory', 'Livestock', 'Crop Exports', 'Operations', 'Academy'].map((cat) => {
              const catLinks = sidebarLinks
                .filter((link) => link.category === cat)
                .filter((link) => 
                  link.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                  link.category.toLowerCase().includes(sidebarSearch.toLowerCase())
                );
 
              if (catLinks.length === 0) return null;
              const isCollapsed = collapsedCats[cat];
 
              return (
                <div key={cat} className="space-y-1">
                  <button
                    onClick={() => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
                    className="w-full flex items-center justify-between px-4 py-1.5 text-[9px] font-black text-emerald-555 text-emerald-500 hover:text-emerald-300 uppercase tracking-widest text-left cursor-pointer bg-transparent border-0 m-0"
                  >
                    <span>{cat}</span>
                    {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                  </button>
 
                  {!isCollapsed && (
                    <div className="space-y-0.5 animate-fadeIn">
                      {catLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = activeTab === link.id;
                        
                        let badgeText = '';
                        let badgeColor = 'bg-yellow-500 text-slate-950';
                        
                        if (link.id === 'inventory') {
                          const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;
                          if (lowStockCount > 0) {
                            badgeText = `${lowStockCount}`;
                            badgeColor = 'bg-rose-500 text-white animate-pulse';
                          }
                        } else if (link.id === 'timetable') {
                          const pendingTasks = todos.filter(t => !t.completed).length;
                          if (pendingTasks > 0) {
                            badgeText = `${pendingTasks}`;
                            badgeColor = 'bg-amber-500 text-slate-950';
                          }
                        } else if (link.id === 'roster') {
                          const onLeaveCount = staffList.filter(s => s.status === 'On Leave').length;
                          if (onLeaveCount > 0) {
                            badgeText = `${onLeaveCount}`;
                            badgeColor = 'bg-emerald-600 text-white';
                          }
                        }
 
                        return (
                          <button
                            key={link.id}
                            onClick={() => {
                              setActiveTab(link.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-wide leading-none border-none ${
                              isActive
                                ? 'bg-emerald-800 text-white shadow-md border-l-4 border-yellow-500 pl-3 font-extrabold'
                                : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={16} className={isActive ? 'text-yellow-500' : 'text-emerald-400'} />
                              <span>{link.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {badgeText && (
                                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black ${badgeColor}`}>
                                  {badgeText}
                                </span>
                              )}
                              <ChevronRight size={12} className={isActive ? 'text-yellow-500 opacity-100' : 'opacity-0'} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>
 
        {/* Master PDF printable report downloader trigger */}
        <div className="p-4 border-t border-white/10 shrink-0 flex justify-center">
          {slimSidebar ? (
            <button
              onClick={() => setShowReportModal(true)}
              className="w-12 h-12 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-slate-950 rounded-xl flex items-center justify-center shadow-md m-0 cursor-pointer border-none"
              title="Download Master Report"
            >
              <FileText size={18} />
            </button>
          ) : (
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 m-0 cursor-pointer border-none"
            >
              <FileText size={16} />
              Master Report
            </button>
          )}
        </div>
      </aside>

      {/* 2. MOBILE MENU HEADER BAR */}
      <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${
        slimSidebar ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Dynamic PWA Install Auto-Modal */}
        {isInstallable && !dismissedPwaBanner && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border-4 border-teal-50 flex flex-col items-center text-center transform transition-all">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-5 shadow-inner">
                <Monitor size={40} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">Install JR Farm</h3>
              <p className="text-sm text-slate-500 mb-8 font-semibold leading-relaxed">
                Install the JR Farm Omni-Estate app on your device for lightning-fast offline access and a premium native experience!
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    handlePwaInstallAction();
                    setDismissedPwaBanner(true);
                    try { localStorage.setItem('jr_farm_pwa_banner_dismissed', 'true'); } catch (e) {}
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-teal-500/30 cursor-pointer text-lg tracking-wide uppercase flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Install Now
                </button>
                <button 
                  onClick={() => {
                    setDismissedPwaBanner(true);
                    try { localStorage.setItem('jr_farm_pwa_banner_dismissed', 'true'); } catch (e) {}
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic PWA Iframe Install Warning Banner */}
        {isInIframeSandbox && !dismissedPwaBanner && (
          <div className="bg-teal-900 text-teal-100 px-6 py-3 text-[11px] font-bold flex items-center justify-between gap-4 border-b border-teal-950 text-left animate-slideIn">
            <div className="flex items-center gap-2.5 flex-1 flex-wrap">
              <span className="bg-yellow-500 text-slate-950 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                PC INSTALL
              </span>
              <span>
                You are currently viewing this app inside a sandboxed preview frame. Browser security disables app installation inside iframes. 
                <a 
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-400 font-extrabold ml-1 cursor-pointer text-teal-100 transition-colors inline-block"
                >
                  Click here to open in a New Tab
                </a> to unlock the browser's native "Install" button and run as a standalone offline PC app!
              </span>
            </div>
            <button 
              onClick={() => {
                setDismissedPwaBanner(true);
                try {
                  localStorage.setItem('jr_farm_pwa_banner_dismissed', 'true');
                } catch (e) {}
              }}
              className="text-teal-300 hover:text-white font-black bg-transparent border-0 cursor-pointer p-1 transition-colors text-xs shrink-0"
              title="Dismiss this notice"
            >
              ✕
            </button>
          </div>
        )}

        <header className="farm-shell-panel border-b border-white/50 px-6 py-4 flex justify-between items-center z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors m-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {activeTab !== 'dash' && (
              <button
                onClick={() => setActiveTab('dash')}
                className="flex items-center gap-2 bg-white/70 hover:bg-white text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black transition-all border border-slate-200/80 cursor-pointer m-0 active:scale-95 shadow-sm"
                title="Go back to Dashboard"
              >
                <ArrowLeft size={13} className="text-emerald-800" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
            )}
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">
              {sidebarLinks.find((l) => l.id === activeTab)?.label || 'System Core'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative text-slate-800">
            <span
              className={`hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${headerCloudSyncStatus.tone}`}
              title="Cloud sync runtime status"
            >
              {headerCloudSyncStatus.label}
            </span>
            {/* Unified Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  markBellToggleInteraction();
                  setBellNotificationTrayOpen((prev) => !prev);
                }}
                className={`p-2.5 rounded-xl border transition-all relative flex items-center justify-center cursor-pointer m-0 active:scale-95 ${
                  sensitiveSectionAlarms.length > 0
                    ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-600 animate-pulse'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                }`}
                title="Unified Sensitive Reminders"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-[10px] font-black shrink-0 tracking-tight font-mono">{sensitiveSectionAlarms.length}</span>
                  {sensitiveSectionAlarms.length > 0 ? (
                    <span className="relative flex h-3.5 w-3.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[8px] text-white font-extrabold items-center justify-center">!</span>
                    </span>
                  ) : null}
                  <span className="text-[10px] uppercase font-bold tracking-tight">Alarms</span>
                </div>
              </button>

              {/* Notification drop-down cabinet */}
              {bellNotificationTrayOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans text-slate-850">
                  <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wide">
                        Sensitive Alarm Hub
                      </span>
                      <h4 className="text-xs font-black uppercase font-mono tracking-wide">Reminders Center</h4>
                    </div>
                    <button
                      onClick={() => setBellNotificationTrayOpen(false)}
                      className="text-slate-400 hover:text-white font-black text-xs border-0 m-0 bg-transparent cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>

                  {!bellTrayContentReady ? (
                    <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Loading reminders center...</span>
                    </div>
                  ) : (
                    <>
                      {/* Device push state permission status */}
                      <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-2">
                        <p className="text-[11px] text-slate-500 leading-normal font-medium">
                          Receive alerts on your **smartphone / PC lockscreen taskbar** dynamically in real time.
                        </p>
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-[10px] uppercase font-black text-slate-600 block">
                            Status: <strong className={notificationPermissionState === 'granted' ? 'text-green-600' : 'text-amber-500'}>{notificationPermissionState.toUpperCase()}</strong>
                          </span>
                          {notificationPermissionState !== 'granted' ? (
                            <button
                              onClick={requestAppNotificationPermission}
                              disabled={isAuthorizingPush}
                              className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-300 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border-0 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                              {isAuthorizingPush ? '⏳ Authorizing...' : '🔔 Auth Taskbar Push'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                triggerAppToastMessage("Scheduling push test...");
                                deferNotificationWork(() => {
                                  triggerAppLockscreenNotification(
                                    "Standard Push Active", 
                                    "Success! JR Farm tasks are now fully connected to your phone bar / PC lockscreen. You will receive active alarms of your farm."
                                  );
                                });
                              }}
                              className="bg-slate-200 hover:bg-slate-250 text-slate-700 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border-0 cursor-pointer"
                            >
                              ⚡ Test Phone Bar Push
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alarm Ringtone Sound Customizer */}
                      <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold">🎶</span>
                          <span className="text-[10px] uppercase font-black text-slate-600 tracking-wider">
                            Ringtone Sound Customization
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Select Sound Track</label>
                            <select
                              value={selectedRingtone}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedRingtone(val);
                                localStorage.setItem('jr_farm_notification_ringtone', val);
                                playSyntheticBellChime(val, false); // Quick preview
                              }}
                              className="w-full bg-white border border-slate-200 text-[10px] p-2.5 rounded-lg font-black cursor-pointer"
                            >
                              <option value="chime">Country Chime 🔔</option>
                              <option value="telephone">Classic Ringer 📞</option>
                              <option value="siren">Emergency Siren 🚨</option>
                              <option value="melody">Happy Barn ⛅</option>
                            </select>
                          </div>
                          
                          <div className="flex flex-col justify-end">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Ringtone Loop Mode</label>
                            <button
                              onClick={() => {
                                const next = !continuousLoop;
                                setContinuousLoop(next);
                                localStorage.setItem('jr_farm_notification_loop', next ? 'true' : 'false');
                                triggerAppToastMessage(next ? "✓ Ringtone continuous looping is now active!" : "Ringtone single play activated.");
                              }}
                              className={`w-full text-[10px] font-black uppercase p-2.5 border rounded-lg text-center transition-colors cursor-pointer ${
                                continuousLoop 
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' 
                                  : 'bg-white border-slate-200 text-slate-600 font-bold'
                              }`}
                            >
                              {continuousLoop ? "🔄 Loop Mode" : "⚡ Single Play"}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              playSyntheticBellChime(selectedRingtone, continuousLoop);
                              triggerAppToastMessage("🔊 Playing alarm ringtone preview...");
                            }}
                            className="flex-1 bg-slate-905 hover:bg-slate-800 text-slate-900 border border-slate-350 bg-slate-100 font-black text-[9px] uppercase py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            🔊 Play Preview
                          </button>
                          <button
                            onClick={() => {
                              stopAlarmSound();
                              triggerAppToastMessage("🔇 Alarm muted.");
                            }}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-black text-[9px] uppercase py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            🔇 Stop Ringtone
                          </button>
                        </div>
                      </div>

                      {/* Alarm stream list */}
                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {sensitiveSectionAlarms.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <span className="text-3xl block">☘️</span>
                            <p className="text-xs font-bold text-slate-550 uppercase font-mono">ALL SENSITIVE SECTIONS 100% CLEAR</p>
                            <p className="text-[10px] text-slate-400 font-medium">No overdue births, active pesticide quarantines, low stock levels, or pending vaccinations.</p>
                          </div>
                        ) : (
                          visibleSensitiveSectionAlarms.map((alarm) => (
                            <div key={alarm.id} className="p-4 hover:bg-slate-50 space-y-2 transition-colors text-left">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                  alarm.severity === 'high'
                                    ? 'bg-red-50 border-red-200 text-red-600'
                                    : alarm.severity === 'medium'
                                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                                    : 'bg-blue-50 border-blue-200 text-blue-600'
                                }`}>
                                  ⚠️ {alarm.section}: {alarm.severity.toUpperCase()}
                                </span>
                                {alarm.date && (
                                  <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                    Due: {alarm.date}
                                  </span>
                                )}
                              </div>
                              
                              <h5 className="text-[11px] font-black text-slate-800 leading-tight">
                                {alarm.title}
                              </h5>
                              
                              <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
                                {alarm.body}
                              </p>

                              <div className="flex gap-2 pt-1.5">
                                <button
                                  onClick={() => {
                                    setActiveTab(alarm.actionTab);
                                    setBellNotificationTrayOpen(false);
                                    triggerAppToastMessage(`Redirected to ${alarm.actionLabel}...`);
                                  }}
                                  className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase py-2 rounded-lg border-0 block cursor-pointer transition-colors"
                                >
                                  ⚙️ Go Resolve
                                </button>
                                <button
                                  onClick={() => {
                                    triggerAppToastMessage("Scheduling lockscreen push...");
                                    deferNotificationWork(() => {
                                      triggerAppLockscreenNotification(alarm.title, alarm.body);
                                      triggerAppToastMessage("Pushed directly to phone lockscreen taskbar!");
                                    });
                                  }}
                                  className="bg-yellow-500 text-slate-950 font-black text-[10px] uppercase px-3 py-2 rounded-lg border-0 cursor-pointer hover:bg-yellow-400"
                                  title="Send this specific alarm to phone lockscreen tray"
                                >
                                  📲 Push Alert
                                </button>
                              </div>
                            </div>
                          ))
                        )}

                        {visibleSensitiveSectionAlarms.length < sensitiveSectionAlarms.length && (
                          <div className="p-3 text-center border-t border-slate-100 bg-slate-50/70">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wide">Loading more alarms...</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 text-center">
                        <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase">
                          • JR Farm Sovereign Supervisor Suite •
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* High-visibility PWA Install Trigger */}
            <button
              onClick={handlePwaInstallAction}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-2 m-0 cursor-pointer active:scale-95 ${
                isInstallable 
                  ? 'bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-500/20' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
              title="Install JR Farm Omni-Estate as a standalone desktop/mobile application"
            >
              <Monitor size={13} className={isInstallable ? 'text-teal-100 animate-pulse' : 'text-teal-700'} />
              <span>Install App</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono font-bold bg-slate-50 border px-3 py-1.5 rounded-full shadow-inner">
              <Clock size={12} className="text-emerald-800 shrink-0" />
              <span>{liveTime || 'Synchronizing...'}</span>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="lg:hidden bg-yellow-500 text-slate-950 font-black p-2 rounded-lg text-xs hover:bg-yellow-400 transition-all flex items-center gap-1.5 m-0 cursor-pointer border-0"
              title="View Master Report"
            >
              <FileText size={14} />
            </button>
          </div>
        </header>

        {!mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="fixed bottom-5 left-5 lg:hidden z-40 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-xl border border-emerald-500/60 flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
            aria-label="Open Menu"
            title="Open Menu"
            type="button"
          >
            <Menu size={14} />
            Menu
          </button>
        )}
 
        {/* 3. MOBILE SYSTEM SLIDING DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="relative flex flex-col w-full max-w-xs h-full bg-emerald-950 text-emerald-100 shadow-2xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center pb-6 border-b border-emerald-900 mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 shadow-md rounded-xl border border-yellow-500/20 overflow-hidden bg-emerald-950 p-[1px] shrink-0" 
                    dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }} 
                  />
                  <div>
                    <h1 className="text-base font-black text-white italic tracking-tighter leading-none">{getStoredSettings()?.estateName ? getStoredSettings().estateName.split(" ")[0] : "JR FARM"}</h1>
                    <p className="text-[9px] text-green-400 font-bold uppercase mt-1 leading-none">{getStoredSettings()?.administrator || "Dr. Devin Omwenga"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-emerald-900 border border-emerald-800 text-emerald-205 m-0 border-none"
                >
                  <X size={16} />
                </button>
              </div>
 
              {/* Mobile Search input */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-emerald-400">
                  <Search size={12} />
                </div>
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-emerald-900/60 border border-emerald-800 text-white placeholder-emerald-400 rounded-xl py-2 pl-8 pr-8 text-xs outline-none focus:border-yellow-500 font-semibold"
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white text-xs bg-transparent border-0 cursor-pointer p-0 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
 
              <nav className="flex-1 space-y-5">
                {['Main', 'Feed & Factory', 'Livestock', 'Crop Exports', 'Operations', 'Academy'].map((cat) => {
                  const catLinks = sidebarLinks
                    .filter((link) => link.category === cat)
                    .filter((link) => 
                      link.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                      link.category.toLowerCase().includes(sidebarSearch.toLowerCase())
                    );
 
                  if (catLinks.length === 0) return null;
                  const isCollapsed = collapsedCats[cat];
 
                  return (
                    <div key={cat} className="space-y-1">
                      <button
                        onClick={() => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-[9px] font-black text-emerald-500 hover:text-emerald-305 uppercase tracking-widest text-left cursor-pointer bg-transparent border-0 m-0"
                      >
                        <span>{cat}</span>
                        {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                      </button>
 
                      {!isCollapsed && (
                        <div className="space-y-0.5 animate-fadeIn">
                          {catLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = activeTab === link.id;
                            
                            let badgeText = '';
                            let badgeColor = 'bg-yellow-500 text-slate-955';
                            
                            if (link.id === 'inventory') {
                              const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;
                              if (lowStockCount > 0) {
                                badgeText = `${lowStockCount}`;
                                badgeColor = 'bg-rose-500 text-white animate-pulse';
                              }
                            } else if (link.id === 'timetable') {
                              const pendingTasks = todos.filter(t => !t.completed).length;
                              if (pendingTasks > 0) {
                                badgeText = `${pendingTasks}`;
                                badgeColor = 'bg-amber-500 text-slate-950';
                              }
                            } else if (link.id === 'roster') {
                              const onLeaveCount = staffList.filter(s => s.status === 'On Leave').length;
                              if (onLeaveCount > 0) {
                                badgeText = `${onLeaveCount}`;
                                badgeColor = 'bg-emerald-600 text-white';
                              }
                            }
 
                            return (
                              <button
                                key={link.id}
                                onClick={() => {
                                  setActiveTab(link.id);
                                  setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs border-none ${
                                  isActive
                                    ? 'bg-emerald-800 text-white border-l-4 border-yellow-500 pl-2 font-extrabold'
                                    : 'text-emerald-100 hover:bg-emerald-900/60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon size={14} className={isActive ? 'text-yellow-500' : 'text-emerald-400'} />
                                  <span>{link.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {badgeText && (
                                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black ${badgeColor}`}>
                                      {badgeText}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
 
              <div className="pt-6 border-t border-emerald-900 mt-6">
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-yellow-500 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 m-0 border-none"
                >
                  <FileText size={15} />
                  Master Report
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* 4. MAIN CENTRAL PANEL VIEWS CONTROLLER */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full transition-all">
          <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Agribusiness Module...</p>
            </div>
          }>
          {activeTab !== 'dash' && (
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 farm-shell-card p-4 rounded-[1.4rem] print:hidden">
              <button
                onClick={() => setActiveTab('dash')}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-900 m-0"
              >
                ← Back to Dashboard Hub
              </button>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block sm:inline">Active Module</span>
                <button
                  onClick={() => {
                    let keys: string[] = [];
                    if (activeTab === 'roster') keys = ['staff'];
                    else if (activeTab === 'factory') keys = ['bsf', 'inventory'];
                    else if (activeTab === 'tmr') keys = ['inventory'];
                    else if (activeTab === 'dairy') keys = ['milk', 'ai', 'vet', 'calves'];
                    else if (activeTab === 'horti') keys = ['tea', 'avo', 'cropSales'];
                    else if (activeTab === 'spray') keys = ['spray'];
                    else if (activeTab === 'finance') keys = ['financials'];
                    else if (activeTab === 'fields') keys = ['fields'];
                    else if (activeTab === 'livestock') keys = ['livestock', 'goats'];
                    else if (activeTab === 'inventory') keys = ['inventory'];
                    else if (activeTab === 'education' || activeTab === 'diagnostics_sub' || activeTab === 'inventory_deduct_sub' || activeTab === 'analyzer_sub' || activeTab === 'clinical_archive') keys = ['academy'];
                    else if (activeTab === 'timetable' || activeTab === 'timelines_sub') keys = ['timetable'];
                    
                    if (keys.length > 0) {
                      handleTriggerSectionReportMulti(keys);
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-amber-600/10 m-0 cursor-pointer shadow-sm animate-fade-in"
                >
                  <FileText size={14} />
                  View {
                    activeTab === 'roster' ? 'Staff Roster' :
                    activeTab === 'factory' ? 'Feed Formula' :
                    activeTab === 'tmr' ? 'TMR Mixing' :
                    activeTab === 'dairy' ? 'Milking & Breeding' :
                    activeTab === 'horti' ? 'Horticulture Harvest' :
                    activeTab === 'spray' ? 'Spray & Quarantine' :
                    activeTab === 'finance' ? 'Ledger & Financials' :
                    activeTab === 'fields' ? 'Agronomy Fields' :
                    activeTab === 'livestock' ? 'Livestock & Canines' :
                    activeTab === 'inventory' ? 'Warehouse Stock' :
                    (activeTab === 'education' || activeTab === 'diagnostics_sub' || activeTab === 'inventory_deduct_sub' || activeTab === 'timelines_sub' || activeTab === 'analyzer_sub') ? "Farmer's Academy Guide" :
                    activeTab === 'timetable' ? "Operations Calendar" : 'Section'
                  } Report
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dash' && (
            <Dashboard
              milkRecords={milkRecords}
              netPl={netPl}
              activeAlarmsCount={activeAlarmsCount}
              upcomingDueAlarm={upcomingDueAlarm}
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onReorderTodos={setTodos}
              totalTeaQty={totalTeaQty}
              staffOffRecords={staffOffRecords}
              staffList={staffList}
              onNavigateToTab={(tabId) => setActiveTab(tabId)}
              cows={cows}
              quarantineRecords={quarantineRecords}
              sprayRecords={sprayRecords}
              fields={fields}
              vetRecords={vetRecords}
              activityLogs={activityLogs}
              inventory={inventory}
            />
          )}

          {activeTab === 'roster' && (
            <Roster
              staffList={staffList}
              onUpdateStatus={handleUpdateStaffStatus}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onEditStaff={handleEditStaff}
              staffOffRecords={staffOffRecords}
              onAddOffRecord={handleAddOffRecord}
              onDeleteOffRecord={handleDeleteOffRecord}
              onUpdateOffRecordStatus={handleUpdateOffRecordStatus}
              onEditStaffOffRecord={handleEditStaffOffRecord}
              onTriggerSectionReport={handleTriggerSectionReport}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'factory' && (
            <FeedFormulator
              ingredients={ingredients}
              onAddIngredientToLib={handleAddIngredientLib}
              onDeleteIngredientToLib={handleDeleteIngredientLib}
              onTriggerSectionReport={handleTriggerSectionReport}
              onAddInventoryItem={handleAddInventoryItem}
            />
          )}

          {activeTab === 'tmr' && (
            <TmrMixing
              onTriggerSectionReport={handleTriggerSectionReport}
            />
          )}

          {(activeTab === 'dairy' || activeTab === 'dairy_milk' || activeTab === 'breeding' || activeTab === 'veterinary' || activeTab === 'cows') && (
            <DairyBreeding
              milkRecords={milkRecords}
              aiRecords={aiRecords}
              milkOutflows={milkOutflows}
              onAddMilkOutflow={handleAddMilkOutflow}
              onDeleteMilkOutflow={handleDeleteMilkOutflow}
              onEditMilkOutflow={handleEditMilkOutflow}
              staffList={staffList}
              onAddMilkRecord={handleAddMilkRecord}
              onAddAIRecord={handleAddAIRecord}
              onUpdateAIStatus={handleUpdateAIStatus}
              onDeleteMilkRecord={handleDeleteMilkRecord}
              onDeleteAIRecord={handleDeleteAIRecord}
              cows={cows}
              vetRecords={vetRecords}
              onAddCow={handleAddCow}
              onDeleteCow={handleDeleteCow}
              onUpdateCowStatus={handleUpdateCowStatus}
              onAddVetRecord={handleAddVetRecord}
              onDeleteVetRecord={handleDeleteVetRecord}
              onEditMilkRecord={handleEditMilkRecord}
              onEditAIRecord={handleEditAIRecord}
              onEditCow={handleEditCow}
              onEditVetRecord={handleEditVetRecord}
              animalSales={animalSales}
              onAddAnimalSale={handleAddAnimalSale}
              onDeleteAnimalSale={handleDeleteAnimalSale}
              mortalities={mortalities}
              onAddMortality={handleAddMortality}
              onDeleteMortality={handleDeleteMortality}
              onTriggerSectionReport={handleTriggerSectionReport}
              semenInventory={semenInventory}
              setSemenInventory={setSemenInventory}
              onAddCalfRecord={handleAddCalfRecord}
              activeSubModule={
                activeTab === 'dairy_milk' ? 'milk' :
                activeTab === 'breeding' ? 'breeding' :
                activeTab === 'veterinary' ? 'veterinary' :
                activeTab === 'cows' ? 'cows' :
                undefined
              }
            />
          )}

          {(activeTab === 'horti' || activeTab === 'tea' || activeTab === 'avo') && (
            <Horticulture
              teaRecords={teaRecords}
              avoRecords={avoRecords}
              onAddTea={handleAddTea}
              onAddAvo={handleAddAvo}
              onDeleteTea={handleDeleteTea}
              onDeleteAvo={handleDeleteAvo}
              onEditTea={handleEditTea}
              onEditAvo={handleEditAvo}
              onTriggerSectionReport={handleTriggerSectionReport}
              activeSubModule={
                activeTab === 'tea' ? 'tea' :
                activeTab === 'avo' ? 'avo' :
                undefined
              }
            />
          )}

          {activeTab === 'azolla' && (
            <AzollaManager
              records={azollaRecords}
              onAddRecord={(rec) => setAzollaRecords([...azollaRecords, rec])}
              onDeleteRecord={(id) => setAzollaRecords(azollaRecords.filter(r => r.id !== id))}
              onTriggerSectionReport={handleTriggerSectionReport}
            />
          )}

          {activeTab === 'spray' && (
            <SprayLog
              sprayRecords={sprayRecords}
              onAddSpray={handleAddSpray}
              onDeleteSpray={handleDeleteSpray}
              onEditSprayRecord={handleEditSprayRecord}
              onTriggerSectionReport={handleTriggerSectionReport}
            />
          )}

          {activeTab === 'finance' && (
            <Financials
              financialRecords={financials}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onEditFinancialRecord={handleEditFinancialRecord}
              onTriggerSectionReport={handleTriggerSectionReport}
              cows={cows}
              fields={fields}
              milkRecords={milkRecords}
              vetRecords={vetRecords}
              aiRecords={aiRecords}
            />
          )}

          {/* Sub-view switcher for agronomy / canine logs / warehouse */}
          {(activeTab === 'fields' || activeTab === 'livestock' || activeTab === 'inventory' || activeTab === 'goats' || activeTab === 'calves' || activeTab === 'heifers' || activeTab === 'poultry' || activeTab === 'canines' || activeTab === 'bsf' || activeTab === 'biogas') && (
            <OtherSections
              viewType={
                activeTab === 'fields' ? 'fields' :
                activeTab === 'inventory' ? 'inventory' :
                'livestock'
              }
              activeSubModule={
                activeTab === 'goats' ? 'goats' :
                activeTab === 'calves' ? 'calves' :
                activeTab === 'heifers' ? 'heifers' :
                activeTab === 'poultry' ? 'poultry' :
                activeTab === 'canines' ? 'canines' :
                activeTab === 'bsf' ? 'bsf' :
                activeTab === 'biogas' ? 'biogas' :
                undefined
              }
              fields={fields}
              livestock={livestock}
              inventory={inventory}
              onAddFields={handleAddFields}
              onAddLivestock={handleAddLivestock}
              onUpdateInventoryStock={handleUpdateInventoryStock}
              onAddInventoryItem={handleAddInventoryItem}
              onDeleteFields={handleDeleteFields}
              onDeleteLivestock={handleDeleteLivestock}
              onDeleteInventoryItem={handleDeleteInventoryItem}
              goatRecords={goatRecords}
              calfRecords={calfRecords}
              bsfRecords={bsfRecords}
              cropOps={cropOps}
              staffList={staffList}
              onAddGoatRecord={handleAddGoatRecord}
              onDeleteGoatRecord={handleDeleteGoatRecord}
              onAddCalfRecord={handleAddCalfRecord}
              onDeleteCalfRecord={handleDeleteCalfRecord}
              onAddBsfRecord={handleAddBsfRecord}
              onDeleteBsfRecord={handleDeleteBsfRecord}
              onAddCropOp={handleAddCropOp}
              onDeleteCropOp={handleDeleteCropOp}
              onUpdateCropOpStatus={handleUpdateCropOpStatus}
              cropSales={cropSales}
              onAddCropSale={handleAddCropSale}
              onDeleteCropSale={handleDeleteCropSale}
              animalSales={animalSales}
              onAddAnimalSale={handleAddAnimalSale}
              onDeleteAnimalSale={handleDeleteAnimalSale}
              mortalities={mortalities}
              onAddMortality={handleAddMortality}
              onDeleteMortality={handleDeleteMortality}
              onEditField={handleEditFieldRecord}
              onEditLivestock={handleEditLivestockRecord}
              onEditInventoryItem={handleEditInventoryItem}
              onEditGoatRecord={handleEditGoatRecord}
              onEditCalfRecord={handleEditCalfRecord}
              onEditBsfRecord={handleEditBsfRecord}
              onEditCropOp={handleEditCropOpRecord}
              onEditCropSale={handleEditCropSale}
              vetRecords={vetRecords}
              aiRecords={aiRecords}
              silageRecords={silageRecords}
              onAddSilage={handleAddSilage}
              onDeleteSilage={handleDeleteSilage}
              heiferRecords={heiferRecords}
              onAddHeifer={handleAddHeifer}
              onDeleteHeifer={handleDeleteHeifer}
              poultryRecords={poultryRecords}
              onAddPoultry={handleAddPoultry}
              onDeletePoultry={handleDeletePoultry}
              quarantineRecords={quarantineRecords}
              onAddQuarantine={handleAddQuarantine}
              onDeleteQuarantine={handleDeleteQuarantine}
              onTriggerSectionReport={handleTriggerSectionReport}
            />
          )}

          {activeTab === 'backup' && (
            <BackupCenter
              onResetToDefaults={handleResetToDefaults}
              onImportFullBackup={handleImportFullBackup}
            />
          )}

          {(activeTab === 'education' || activeTab === 'diagnostics_sub' || activeTab === 'inventory_deduct_sub' || activeTab === 'timelines_sub' || activeTab === 'analyzer_sub') && (
            <FarmerAcademy 
              inventory={inventory}
              setInventory={setInventory}
              sprayRecords={sprayRecords}
              setSprayRecords={setSprayRecords}
              vetRecords={vetRecords}
              setVetRecords={setVetRecords}
              cows={cows}
              financials={financials}
              setFinancials={setFinancials}
              fields={fields}
              onTriggerSectionReport={handleTriggerSectionReport}
              initialTab={
                activeTab === 'diagnostics_sub' ? 'diagnostics' :
                activeTab === 'inventory_deduct_sub' ? 'inventory_deduct' :
                activeTab === 'timelines_sub' ? 'timelines' :
                activeTab === 'analyzer_sub' ? 'calculators' :
                undefined
              }
            />
          )}

          {activeTab === 'timetable' && (
            <OperationsSchedule onTriggerSectionReport={handleTriggerSectionReport} />
          )}

          {activeTab === 'settings' && (
            <SettingsCenter 
              onSaveConfig={(config) => {
                console.log("Comptroller settings updated online", config);
                setFarmSettings(config);
              }}
              onResetAllData={() => {
                handleResetToDefaults();
                window.location.reload();
              }}
            />
          )}

          {activeTab === 'report_view' && (
            <div className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200">
              {/* Report Header */}
              <div className="bg-emerald-950 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-yellow-500" />
                  <div>
                    <h3 className="font-extrabold text-base uppercase tracking-widest text-white">Full-Page Interactive Report Hub</h3>
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5 font-sans">Sovereign Compliance & Master Auditing</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('dash')}
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-850 text-emerald-200 text-xs font-bold rounded-xl transition-all border border-emerald-800 cursor-pointer m-0"
                  >
                    ← Back to Dashboard
                  </button>
                  <button
                    onClick={() => handleSelectAllSections(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700 m-0"
                  >
                    Select All Sections
                  </button>
                  <button
                    onClick={() => handleSelectAllSections(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700 m-0"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Split Composer Workspace */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[600px] bg-slate-100">
                {/* Left Pane: Table of Contents / Selector (Hidden on print) */}
                <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto flex flex-col justify-between print:hidden gap-5 shrink-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-800">Estate Compiler Index</h4>
                      <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mt-0.5">Toggle sections to customize report</p>
                    </div>

                    {/* Module Filter & Search Bar */}
                    <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                          Search Sections
                        </label>
                        <input
                          type="text"
                          value={reportSearchQuery}
                          onChange={(e) => setReportSearchQuery(e.target.value)}
                          placeholder="Type to search modules..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                          Module Category
                        </label>
                        <select
                          value={reportCategoryFilter}
                          onChange={(e) => setReportCategoryFilter(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                        >
                          <option value="ALL">All Modules</option>
                          <option value="Main">Main / Geography</option>
                          <option value="Staff">Staff Deployment</option>
                          <option value="Livestock">Livestock Systems</option>
                          <option value="Crop Exports">Crop & Fruit Exports</option>
                          <option value="Feed & Factory">Feed & BSF Protein</option>
                          <option value="Operations">Operating Logs</option>
                          <option value="Academy">Academy & Diagnostics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                          Date Period Filter
                        </label>
                        <select
                          value={reportDateFilter}
                          onChange={(e) => setReportDateFilter(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week (Last 7 Days)</option>
                          <option value="month">This Month (Last 30 Days)</option>
                          <option value="last3months">Last 3 Months</option>
                          <option value="last6months">Last 6 Months</option>
                          <option value="specific_month">Specific Month</option>
                          <option value="month_interval">Month Interval / Range</option>
                          <option value="year">This Year (Last 365 Days)</option>
                          <option value="custom">Custom Date Range</option>
                        </select>
                      </div>

                      {reportDateFilter === 'specific_month' && (
                        <div className="pt-1">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Select Specific Month</label>
                          <input
                            type="month"
                            value={reportSpecificMonth}
                            onChange={(e) => setReportSpecificMonth(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                          />
                        </div>
                      )}

                      {reportDateFilter === 'month_interval' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Start Month</label>
                            <input
                              type="month"
                              value={reportStartMonth}
                              onChange={(e) => setReportStartMonth(e.target.value)}
                              className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">End Month</label>
                            <input
                              type="month"
                              value={reportEndMonth}
                              onChange={(e) => setReportEndMonth(e.target.value)}
                              className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                            />
                          </div>
                        </div>
                      )}

                      {reportDateFilter === 'custom' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Start Date</label>
                            <input
                              type="date"
                              value={reportStartDate}
                              onChange={(e) => setReportStartDate(e.target.value)}
                              className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">End Date</label>
                            <input
                              type="date"
                              value={reportEndDate}
                              onChange={(e) => setReportEndDate(e.target.value)}
                              className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
 
                     {/* Section list with record counts as checkbox buttons */}
                    <div className="space-y-2 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto pr-1">
                      {getFilteredSectionsMetadata().map((sec) => {
                        const isExpanded = !!expandedSections[sec.key];
                        const isChecked = !!selectedSections[sec.key];
                        const subKeys = sec.subsections.map(s => s.key);
                        const hasSubsections = sec.subsections.length > 0;

                        return (
                          <div key={sec.key} className="space-y-1 bg-white p-2 rounded-2xl border border-slate-200">
                            {/* Parent Section Block */}
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleParent(sec.key, isChecked, subKeys)}
                                  className={`flex-1 flex items-center gap-2 p-1.5 rounded-lg border text-left font-bold transition-all ${
                                    isChecked
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="accent-emerald-700 pointer-events-none scale-90"
                                  />
                                  <span className="text-[11px] font-sans truncate pr-1" title={sec.label}>
                                    {sec.label}
                                  </span>
                                </button>
                              </div>

                              {/* Collapse/Expand subsections */}
                              {hasSubsections && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedSections(prev => ({
                                      ...prev,
                                      [sec.key]: !prev[sec.key]
                                    }));
                                  }}
                                  className="p-1 px-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                >
                                  <span className="text-[9px] font-black uppercase tracking-wider font-mono">
                                    {isExpanded ? 'Hide' : `Show (${sec.subsections.length})`}
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Collapsible Subsection Branch */}
                            {hasSubsections && isExpanded && (
                              <div className="pl-4 pr-1 py-1 bg-slate-50/50 rounded-lg space-y-1 border-l-2 border-slate-200 ml-3">
                                {sec.subsections.map(sub => {
                                  const isSubChecked = !!selectedSections[sub.key];
                                  return (
                                    <button
                                      key={sub.key}
                                      type="button"
                                      onClick={() => {
                                        setSelectedSections(prev => {
                                          const nextStatus = !prev[sub.key];
                                          const updated = { ...prev, [sub.key]: nextStatus };
                                          // If we checked a sub-item, make sure parent is also checked
                                          if (nextStatus) {
                                            updated[sec.key] = true;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className={`w-full flex items-center justify-between p-1.5 rounded-md border text-left transition-all ${
                                        isSubChecked
                                          ? 'border-emerald-100/50 bg-white text-emerald-950 font-bold'
                                          : 'border-transparent bg-transparent text-slate-400 hover:bg-slate-100'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={isSubChecked}
                                          readOnly
                                          className="accent-emerald-700 pointer-events-none scale-75"
                                        />
                                        <span className="text-[10px] font-medium truncate font-sans">{sub.label}</span>
                                      </div>
                                      <span className={`text-[8px] px-1 py-0.2 rounded-full border font-mono shrink-0 font-bold ${
                                        isSubChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200/50'
                                      }`}>
                                        {sub.count}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden lg:block">
                    Full-Page Document Previewer
                  </div>
                </div>

                {/* Right Pane: Full-Page Document Preview Container */}
                <div className="p-8 overflow-y-auto flex-1 bg-white space-y-6 max-h-[80vh] border-l border-slate-200" id="printable-area">
                  {renderReportContent(selectedSections, false)}
                </div>
              </div>

              {/* Action Buttons Footer (Hidden on print) */}
              <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0 print:hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                  ⚡ Live Compilation Active
                </span>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="px-5 py-3 bg-emerald-100 border border-emerald-200 text-emerald-950 font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-emerald-250 transition-all m-0 cursor-pointer"
                  >
                    <Download size={14} /> Download (CSV)
                  </button>

                  <button
                    onClick={() => handleDownloadPdfReport()}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-2 transition-all m-0 cursor-pointer shadow-sm border border-amber-600/15"
                  >
                    <FileDown size={14} /> Download (PDF)
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-all m-0 cursor-pointer"
                  >
                    <Printer size={14} /> Print Master Deck
                  </button>
                </div>
              </div>
            </div>
          )}
          </React.Suspense>
        </main>
      </div>

      {/* 5. MASTER PRINT / EXPORT REPORT PREVIEW MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-yellow-500" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">Master Estate Compiler Panel</h3>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5 font-sans">Auditing & Compliance Reports</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-emerald-200 cursor-pointer m-0 border border-emerald-850"
              >
                <X size={16} />
              </button>
            </div>

            {/* Split Composer Workspace */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0 bg-slate-100">
              {/* Left Pane: Table of Contents (Hidden on print) */}
              <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto flex flex-col justify-between print:hidden gap-5 shrink-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800">Master Volume Index</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">All estate sections are auto-included</p>
                  </div>

                  {/* Module Filter & Search Bar */}
                  <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                        Search Sections
                      </label>
                      <input
                        type="text"
                        value={reportSearchQuery}
                        onChange={(e) => setReportSearchQuery(e.target.value)}
                        placeholder="Type to search modules..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                        Module Category
                      </label>
                      <select
                        value={reportCategoryFilter}
                        onChange={(e) => setReportCategoryFilter(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                      >
                        <option value="ALL">All Modules</option>
                        <option value="Main">Main / Geography</option>
                        <option value="Staff">Staff Deployment</option>
                        <option value="Livestock">Livestock Systems</option>
                        <option value="Crop Exports">Crop & Fruit Exports</option>
                        <option value="Feed & Factory">Feed & BSF Protein</option>
                        <option value="Operations">Operating Logs</option>
                        <option value="Academy">Academy & Diagnostics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                        Date Period Filter
                      </label>
                      <select
                        value={reportDateFilter}
                        onChange={(e) => setReportDateFilter(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week (Last 7 Days)</option>
                        <option value="month">This Month (Last 30 Days)</option>
                        <option value="last3months">Last 3 Months</option>
                        <option value="last6months">Last 6 Months</option>
                        <option value="specific_month">Specific Month</option>
                        <option value="month_interval">Month Interval / Range</option>
                        <option value="year">This Year (Last 365 Days)</option>
                        <option value="custom">Custom Date Range</option>
                      </select>
                    </div>

                    {reportDateFilter === 'specific_month' && (
                      <div className="pt-1">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Select Specific Month</label>
                        <input
                          type="month"
                          value={reportSpecificMonth}
                          onChange={(e) => setReportSpecificMonth(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                        />
                      </div>
                    )}

                    {reportDateFilter === 'month_interval' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Start Month</label>
                          <input
                            type="month"
                            value={reportStartMonth}
                            onChange={(e) => setReportStartMonth(e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">End Month</label>
                          <input
                            type="month"
                            value={reportEndMonth}
                            onChange={(e) => setReportEndMonth(e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                          />
                        </div>
                      </div>
                    )}

                    {reportDateFilter === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Start Date</label>
                          <input
                            type="date"
                            value={reportStartDate}
                            onChange={(e) => setReportStartDate(e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">End Date</label>
                          <input
                            type="date"
                            value={reportEndDate}
                            onChange={(e) => setReportEndDate(e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-200 focus:outline-none text-slate-800 bg-slate-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Section list with record counts as checklists */}
                  <div className="space-y-2 max-h-[35vh] lg:max-h-[40vh] overflow-y-auto pr-1">
                    {getFilteredSectionsMetadata().map((sec) => {
                      const isExpanded = !!expandedSections[sec.key];
                      const isChecked = !!selectedSections[sec.key];
                      const subKeys = sec.subsections.map(s => s.key);
                      const hasSubsections = sec.subsections.length > 0;

                      return (
                        <div key={sec.key} className="space-y-1 bg-white p-2 rounded-2xl border border-slate-200">
                          {/* Parent Section Block */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleParent(sec.key, isChecked, subKeys)}
                                className={`flex-1 flex items-center gap-2 p-1.5 rounded-lg border text-left font-bold transition-all ${
                                  isChecked
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950/90'
                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className="accent-emerald-700 pointer-events-none scale-90"
                                />
                                <span className="text-[11px] font-sans truncate pr-1" title={sec.label}>
                                  {sec.label}
                                </span>
                              </button>
                            </div>

                            {/* Collapse/Expand subsections */}
                            {hasSubsections && (
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedSections(prev => ({
                                    ...prev,
                                    [sec.key]: !prev[sec.key]
                                  }));
                                }}
                                className="p-1 px-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                              >
                                <span className="text-[9px] font-black uppercase tracking-wider font-mono">
                                  {isExpanded ? 'Hide' : `Show (${sec.subsections.length})`}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Collapsible Subsection Branch */}
                          {hasSubsections && isExpanded && (
                            <div className="pl-4 pr-1 py-1 bg-slate-50/50 rounded-lg space-y-1 border-l-2 border-slate-200 ml-3">
                              {sec.subsections.map(sub => {
                                const isSubChecked = !!selectedSections[sub.key];
                                return (
                                  <button
                                    key={sub.key}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSections(prev => {
                                        const nextStatus = !prev[sub.key];
                                        const updated = { ...prev, [sub.key]: nextStatus };
                                        if (nextStatus) {
                                          updated[sec.key] = true;
                                        }
                                        return updated;
                                      });
                                    }}
                                    className={`w-full flex items-center justify-between p-1.5 rounded-md border text-left transition-all ${
                                      isSubChecked
                                        ? 'border-emerald-100/50 bg-white text-emerald-950 font-bold'
                                        : 'border-transparent bg-transparent text-slate-400 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <input
                                        type="checkbox"
                                        checked={isSubChecked}
                                        readOnly
                                        className="accent-emerald-700 pointer-events-none scale-75"
                                      />
                                      <span className="text-[10px] font-medium truncate font-sans">{sub.label}</span>
                                    </div>
                                    <span className={`text-[8px] px-1 py-0.2 rounded-full border font-mono shrink-0 font-bold ${
                                      isSubChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200/50'
                                    }`}>
                                      {sub.count}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden lg:block">
                  Master Book: 17 Consolidated Modules
                </div>
              </div>

              {/* Right Pane: Document Preview Container */}
              <div className="p-8 overflow-y-auto flex-1 bg-white max-h-[70vh] lg:max-h-[75vh] space-y-6" id="printable-area">
                {renderReportContent(selectedSections, false)}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all m-0"
              >
                Close Preview
              </button>
              <button
                onClick={handleExportCSV}
                className="px-5 py-3 bg-emerald-100 border border-emerald-200 text-emerald-950 font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-emerald-200 transition-all m-0 cursor-pointer"
              >
                <Download size={14} /> Download Master (CSV)
              </button>

              <button
                onClick={() => handleDownloadPdfReport()}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-2 transition-all m-0 cursor-pointer shadow-sm border border-amber-600/15"
              >
                <FileDown size={14} /> Download Master (PDF)
              </button>

              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-all m-0 cursor-pointer"
              >
                <Printer size={14} /> Print Master Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sovereign AI Advisor Bot overlay icon / panel */}
      <AiAdvisor 
        farmState={{
          cowsCount: livestock ? livestock.length : 0,
          milkTotal: milkRecords ? milkRecords.reduce((sum, r) => sum + (r.am || 0) + (r.pm || 0), 0) : 0,
          fieldsCount: fields ? fields.length : 0,
          staffCount: staffList ? staffList.length : 0,
          income: totalIncome,
          expense: totalExpense
        }} 
      />

      {/* 6. FAIL-SAFE ALARM MODAL FOR HIGH PRIORITY SENSITIVE REMINDERS */}
      {failSafeNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-red-200">
            <div className="bg-red-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <h4 className="text-xs font-black uppercase font-mono tracking-wider">CRITICAL FARM ALARM CHIME</h4>
              </div>
              <button
                onClick={() => {
                  stopAlarmSound();
                  setFailSafeNotificationModal(null);
                }}
                className="text-white opacity-80 hover:opacity-100 font-extrabold text-sm border-0 bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 font-bold border border-red-100 text-xl animate-bounce">
                ⚠️
              </div>
              
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-snug">
                {failSafeNotificationModal.title}
              </h3>
              
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {failSafeNotificationModal.body}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    stopAlarmSound();
                    triggerAppToastMessage("Alarm ringtone muted.");
                  }}
                  className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-200 font-black text-[10px] uppercase py-2.5 rounded-lg cursor-pointer"
                >
                  🔇 Mute Alert Tone
                </button>
                <button
                  onClick={() => {
                    playSyntheticBellChime();
                    triggerAppToastMessage("Playing test...");
                  }}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 border border-slate-200 font-bold text-[10px] uppercase px-3 rounded-lg cursor-pointer"
                  title="Replay notification alarm chime"
                >
                  🔊 Replay
                </button>
              </div>
              
              <button
                onClick={() => {
                  stopAlarmSound();
                  setFailSafeNotificationModal(null);
                  setBellNotificationTrayOpen(true);
                }}
                className="w-full bg-slate-900 text-white font-extrabold text-[11px] uppercase py-3 rounded-xl hover:bg-slate-850 cursor-pointer border-0 transition-colors"
              >
                ⚙️ Access Notification Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. APP NOTIFICATION TOAST NOTIFIER */}
      {appToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-[11px] font-black uppercase px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-705">
          <span className="text-amber-400">🔔</span>
          <span>{appToastMessage}</span>
        </div>
      )}
      <FirebaseSyncer />
    </div>
    </ErrorBoundary>
  );
}
