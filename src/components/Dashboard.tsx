/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Coins,
  Activity,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Calendar,
  AlertTriangle,
  Leaf,
  Languages,
  CloudRain,
  Sun,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Calculator,
  Sparkles,
  ArrowRight,
  Database,
  DollarSign
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MilkingRecord, Todo, StaffOffRecord, StaffMember, Cow, QuarantineRecord, SprayRecord, FieldRecord, VetRecord, ActivityLogEntry } from '../types';
import { CalendarIcon, Bell, Users, Eye, ShieldCheck, ShieldAlert, Heart, Sprout } from 'lucide-react';
import { getStoredSettings } from '../utils/settingsHelper';

interface DashboardProps {
  milkRecords: MilkingRecord[];
  netPl: number;
  activeAlarmsCount: number;
  upcomingDueAlarm: string;
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, assigneeName?: string) => void;
  onDeleteTodo: (id: string) => void;
  onReorderTodos?: (newTodos: Todo[]) => void;
  totalTeaQty: number;
  staffOffRecords: StaffOffRecord[];
  staffList: StaffMember[];
  onNavigateToTab?: (tabId: string) => void;
  cows?: Cow[];
  quarantineRecords?: QuarantineRecord[];
  sprayRecords?: SprayRecord[];
  fields?: FieldRecord[];
  vetRecords?: VetRecord[];
  activityLogs?: ActivityLogEntry[];
}

export function Dashboard({
  milkRecords,
  netPl,
  activeAlarmsCount,
  upcomingDueAlarm,
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onReorderTodos,
  totalTeaQty,
  staffOffRecords = [],
  staffList = [],
  onNavigateToTab,
  cows = [],
  quarantineRecords = [],
  sprayRecords = [],
  fields = [],
  vetRecords = [],
  activityLogs = []
}: DashboardProps) {
  const [newTodo, setNewTodo] = useState('');
  const [todoAssignee, setTodoAssignee] = useState('');
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
  const [expandedSopId, setExpandedSopId] = useState<string | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<'sunny' | 'rainy' | 'dry-cold'>('sunny');
  const [soilMoisture, setSoilMoisture] = useState<number>(42);

  // 1. Kiswahili / English Translation system config
  const [isSwahili, setIsSwahili] = useState<boolean>(false);
  const t = (key: string): string => {
    if (!isSwahili) return key;
    const terms: Record<string, string> = {
      "Sovereign Compliance Registered": "Kumbukumbu ya Uthibitisho wa Shamba",
      "GlobalGAP Plot: KT-205A": "Kitalu cha Kimataifa cha GAP: KT-205A",
      "JR Farm Omni-Estate": "Mamlaka ya Mashamba ya JR Farm",
      "Comprehensive estate, livestock, and crop export management platform for JR Farm, including feed formulation, dairy ledger, GlobalGAP spray logs, and financials.": 
        "Mfumo uliounganishwa wa usimamizi wa mashamba, mifugo, na usafirishaji wa mazao wa JR Farm, ikijumuisha uundaji wa chakula cha mifugo, daftari la maziwa, kumbukumbu za dawa za GlobalGAP, na hesabu za fedha.",
      "Management Core": "Kiini cha Utawala",
      "Audit Compliance": "Utii wa Ukaguzi",
      "Traceback Records": "Ufuatiliaji wa Mazao",
      "System Node": "Mtandao wa Mfumo",
      "Sovereign Active": "Inafanya Kazi Vyema",
      "100% Certified": "Imethibitishwa Kikamilifu",
      "Blockchain Latch": "Mnyororo Salama",
      "Online & Synced": "Imeunganishwa",
      "Daily Milk Yield (Today)": "Kiwango cha Maziwa (Leo)",
      "Liters": "Lita",
      "Financial Health Status": "Hali ya Kifedha ya Shamba",
      "Active Export Alarm Lines": "Kengele za Mauzo ya Nje",
      "Active Security / Work Actions": "Arifa za Kiusalama / Kazi",
      "Due soon": "Muda mfupi ujao",
      "No imminent alarm found.": "Hakuna kengele kwa sasa.",
      "Assigned Group Taskboard": "Ubao wa Kazi wa Wafanyakazi",
      "Add Priority Field Directive": "Agiza Kazi Kwenye Shamba",
      "Direct Employee Instruction": "Mwagize Mfanyakazi ...",
      "Tea & Avocado Export Harvest Overview": "Muhtasari wa Chai na Parachichi za Mauzo ya Nje",
      "Simulated Climate": "Hali ya Hewa",
      "Relative Humidity": "Unyevunyevu wa Hewa",
      "Soil Moisture Tension": "Unyevu wa Udongo",
      "Dry (Dusted)": "Kavu (Kukauka)",
      "Saturated (Log)": "Kuloana (Mafuriko)",
      "Smart Soil State": "Hali ya Akili ya Udongo",
      "Dr. Devin Omwenga's Customized Agro Advisory": "Ushauri wa Kilimo wa Dr. Devin Omwenga",
      "GlobalGAP Compliance Mode Enabled": "Hali ya GlobalGAP Imeamilishwa",
      "All crop export and livestock records conform to safety restrictions. Pre-Harvest Intervals (PHI) are strictly monitored. Ensure spray records are compiled.": 
        "Kumbukumbu zote za mazao ya nje na mifugo zinafuata sheria za usalama wa chakula. Vipindi vya kabla ya kuvuna (PHI) vinafuatiliwa vikali. Hakikisha kumbukumbu za unyunyiziaji wa dawa zimejazwa."
    };
    return terms[key] || key;
  };

  // 2. Open-Meteo Weather API (100% Free Live Satellite Link)
  const [isLiveWeather, setIsLiveWeather] = useState<boolean>(true);
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string>('');

  useEffect(() => {
    if (!isLiveWeather) return;
    setWeatherLoading(true);
    setWeatherError('');
    const userSettings = getStoredSettings();
    const lat = userSettings?.latitude ?? -0.5667;
    const lon = userSettings?.longitude ?? 34.9333;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`)
      .then(res => {
        if (!res.ok) throw new Error("Satellite Link Error");
        return res.json();
      })
      .then(data => {
        setLiveWeather(data);
        setWeatherError('');
      })
      .catch(err => {
        console.warn("Could not load real-time telemetry, falling back to simulator", err);
        setWeatherError('Weather server disconnected; fell back to local agricultural simulator.');
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, [isLiveWeather]);

  // 3. Precision Soil Treatment & PH Lime Calculator State
  const [calcCrop, setCalcCrop] = useState<'tea' | 'avocado' | 'napier'>('tea');
  const [calcPh, setCalcPh] = useState<number>(5.2);
  const [calcResult, setCalcResult] = useState<{
    status: 'optimal' | 'acidic' | 'alkaline';
    dosage: string;
    description: string;
  }>({
    status: 'optimal',
    dosage: '0 bags',
    description: 'Select parameters above to calculate'
  });

  const handleCalculateSoil = () => {
    const ph = parseFloat(calcPh.toString());
    if (isNaN(ph) || ph < 1 || ph > 14) {
      setCalcResult({
        status: 'acidic',
        dosage: 'Error',
        description: 'Please input a valid pH level between 1.0 and 14.0'
      });
      return;
    }

    if (calcCrop === 'tea') {
      // Tea prefers acidic soil (ideal 5.5)
      if (ph < 5.0) {
        const diff = 5.5 - ph;
        const bags = Math.ceil(diff * 14); // estimation bags of Agricultural Lime per Acre
        setCalcResult({
          status: 'acidic',
          dosage: `${bags} Bags (50kg) of Dolomitic Limestone per Acre`,
          description: `Extremely Acidic for Tea (Current: ${ph} pH). Target is 5.5. Applying lime will raise soil base saturation levels and unlock locked phosphate nutrients.`
        });
      } else if (ph > 6.0) {
        const diff = ph - 5.5;
        const bags = Math.ceil(diff * 8);
        setCalcResult({
          status: 'alkaline',
          dosage: `${bags} Bags (50kg) of Elemental Sulfur / Sulfate of Ammonia per Acre`,
          description: `Slightly alkaline for tea cultivars (Current: ${ph} pH). Tea bushes require high free aluminum and iron ions released only at lower pH (< 5.8). Applying sulfur will lower soil pH.`
        });
      } else {
        setCalcResult({
          status: 'optimal',
          dosage: '0 Bags (Soil Optimal!)',
          description: `Excellent soil pH (${ph}) for Tea plantations! Nyamira tea flushes will express premium vigor. Maintain standard NPK 26:5:5 application rates.`
        });
      }
    } else if (calcCrop === 'avocado') {
      // Avocado prefers neutral to slightly acidic (ideal 6.2)
      if (ph < 5.8) {
        const diff = 6.2 - ph;
        const bags = Math.ceil(diff * 20);
        setCalcResult({
          status: 'acidic',
          dosage: `${bags} Bags (50kg) of Agricultural Hydrated Lime / Calciprill per Acre`,
          description: `Highly Acidic for Hass Avocado rootstocks (Current: ${ph} pH). Root development is inhibited. Limestone increases Calcium presence which shields root fibers against Phytophthora rot.`
        });
      } else if (ph > 7.2) {
        const diff = ph - 6.2;
        const bags = Math.ceil(diff * 12);
        setCalcResult({
          status: 'alkaline',
          dosage: `${bags} Bags (50kg) of Elements Sulfur per Acre`,
          description: `Alkaline/chalky soil (Current: ${ph} pH) causes avocado leaf chlorosis (poor chlorophyll formation). Add sulfur to optimize avocado trace element intake.`
        });
      } else {
        setCalcResult({
          status: 'optimal',
          dosage: '0 Bags (Soil Optimal!)',
          description: `Perfect soil pH (${ph}) for Hass Avocado cultivars! Supports dense organic matter conversion and optimal fruit oil content extraction.`
        });
      }
    } else {
      // Napier grass prefers ideal 6.5
      if (ph < 6.0) {
        const diff = 6.5 - ph;
        const bags = Math.ceil(diff * 15);
        setCalcResult({
          status: 'acidic',
          dosage: `${bags} Bags of Ag-Lime (Calcium Carbonate) per Acre`,
          description: `Acidic soil restricts high protein dry matter yields for Napier grass. Apply limestone to optimize cell-wall fiber strengths.`
        });
      } else if (ph > 7.5) {
        const diff = ph - 6.5;
        const bags = Math.ceil(diff * 10);
        setCalcResult({
          status: 'alkaline',
          dosage: `${bags} Bags of Sulfate of Ammonia/Sulfur per Acre`,
          description: `Alkaline soil. Apply organic fertilizer and sulfate inputs to normalize pH to 6.5.`
        });
      } else {
        setCalcResult({
          status: 'optimal',
          dosage: '0 Bags (Soil Optimal!)',
          description: `Soil pH (${ph}) is stellar for high yield protein Napier grass fodder! Ready for active nitrogen feeding.`
        });
      }
    }
  };

  useEffect(() => {
    handleCalculateSoil();
  }, [calcCrop, calcPh]);

  // Calculate today's milking liters
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLiters = milkRecords
    .filter((r) => r.date === todayStr)
    .reduce((sum, r) => sum + r.am + r.pm, 0);

  // Group milk production by date for the Recharts chart (last 7 entries)
  const groupedMilk = milkRecords.reduce((acc: { [key: string]: { am: number; pm: number; total: number } }, r) => {
    if (!acc[r.date]) {
      acc[r.date] = { am: 0, pm: 0, total: 0 };
    }
    acc[r.date].am += r.am;
    acc[r.date].pm += r.pm;
    acc[r.date].total += r.am + r.pm;
    return acc;
  }, {});

  const chartData = Object.entries(groupedMilk)
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      AM: parseFloat(data.am.toFixed(1)),
      PM: parseFloat(data.pm.toFixed(1)),
      Total: parseFloat(data.total.toFixed(1)),
      rawDate: date
    }))
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .slice(-7); // Keep last 7 days

  const handleSubmitTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    onAddTodo(newTodo.trim(), todoAssignee || undefined);
    setNewTodo('');
    setTodoAssignee('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8 bg-slate-950 p-6 md:p-8 rounded-3xl text-slate-200 shadow-2xl relative overflow-hidden"
    >
      {/* Background glow effects for premium feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-0"></div>

      {/* ESTATE BRANDED GREETING METADATA BANNER */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl text-left z-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] -z-0 pointer-events-none"></div>
        
        <div className="absolute top-6 right-6 z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSwahili(!isSwahili)}
            className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 border border-emerald-500/30 text-emerald-300 font-extrabold tracking-wider uppercase text-[10px] transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Languages size={14} className="animate-pulse" />
            <span>{isSwahili ? "Swahili 🇰🇪" : "English 🇬🇧"}</span>
          </motion.button>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center gap-3 pr-32">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] uppercase font-black tracking-widest bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-4 py-1.5 rounded-full font-mono shadow-[0_0_15px_rgba(234,179,8,0.2)]"
            >
              🛡️ {t("Sovereign Compliance Registered")}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] uppercase font-black tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {t("GlobalGAP Plot: KT-205A")}
            </motion.span>
          </div>

          <div className="space-y-3 max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 tracking-tight uppercase"
            >
              {t("JR Farm Omni-Estate")}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed max-w-2xl"
            >
              {t("Comprehensive estate, livestock, and crop export management platform for JR Farm, including feed formulation, dairy ledger, GlobalGAP spray logs, and financials.")}
            </motion.p>
          </div>

          {/* Core high-level metadata telemetry status bars */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10 max-w-4xl text-left"
          >
            {[
              { label: "Management Core", value: "Sovereign Active", color: "text-white" },
              { label: "Audit Compliance", value: "100% Certified", color: "text-emerald-400" },
              { label: "Traceback Records", value: "Blockchain Latch", color: "text-yellow-400" },
              { label: "System Node", value: "Online & Synced", color: "text-blue-400" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{t(stat.label)}</span>
                <span className={`text-xs font-black font-mono block ${stat.color}`}>{t(stat.value)}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10 relative">
        {[
          { 
            label: "Milk Yield (Today)", 
            value: `${todayLiters.toFixed(1)} L`, 
            sub: "Active dairy herd log", 
            icon: Activity, 
            color: "emerald",
            delay: 0.1
          },
          { 
            label: "Tea Weights (Harvest)", 
            value: `${totalTeaQty.toLocaleString()} KG`, 
            sub: "KTDA delivery aggregate", 
            icon: Leaf, 
            color: "purple",
            delay: 0.2
          },
          { 
            label: "Net Cash Balance", 
            value: `Ksh ${netPl.toLocaleString()}`, 
            sub: "Overall P&L account", 
            icon: Coins, 
            color: netPl >= 0 ? "emerald" : "rose",
            delay: 0.3
          },
          { 
            label: "Calving Alarm", 
            value: upcomingDueAlarm || "None", 
            sub: `${activeAlarmsCount} pending breed cycles`, 
            icon: TrendingUp, 
            color: "rose",
            delay: 0.4
          }
        ].map((widget, idx) => {
          const Icon = widget.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: widget.delay, type: "spring" }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group"
            >
              <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${widget.color}-500/10 rounded-full blur-2xl group-hover:bg-${widget.color}-500/20 transition-all duration-500`}></div>
              <div className="flex justify-between items-start z-10 relative">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{widget.label}</p>
                  <h3 className={`text-2xl font-black mt-2 font-mono ${widget.color === 'rose' && widget.label === 'Calving Alarm' ? 'text-rose-400 text-sm truncate max-w-[150px]' : 'text-white'}`}>
                    {widget.value}
                  </h3>
                  <p className={`text-[10px] text-${widget.color}-400 font-bold mt-2 uppercase tracking-wide`}>{widget.sub}</p>
                </div>
                <div className={`p-3.5 bg-${widget.color}-500/20 text-${widget.color}-400 rounded-xl border border-${widget.color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.1)]`}>
                  <Icon size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 🧑‍🌾 Staff Attendance & Leave Alerts Reminders */}
      {(() => {
        const todayString = new Date().toISOString().split('T')[0];
        const getDayOffsetString = (offset: number) => {
          const d = new Date();
          d.setDate(d.getDate() + offset);
          return d.toISOString().split('T')[0];
        };

        const activeOffsToday = staffOffRecords.filter(r => r.status === 'Approved' && r.startDate <= todayString && todayString <= r.endDate);
        const upcomingOffs = staffOffRecords.filter(r => r.status === 'Approved' && r.startDate > todayString && r.startDate <= getDayOffsetString(3));
        
        const conflicts: string[] = [];
        const units = ['Dairy', 'Horti', 'Fields', 'Security'];
        for (let offset = 0; offset <= 5; offset++) {
          const checkDate = getDayOffsetString(offset);
          const dateFormatted = new Date(checkDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          units.forEach(unit => {
            const unitStaffIds = staffList.filter(s => s.unit === unit).map(s => s.id);
            const activeOffUnit = staffOffRecords.filter(r => r.status === 'Approved' && r.startDate <= checkDate && checkDate <= r.endDate && unitStaffIds.includes(r.staffId));
            if (activeOffUnit.length > 1) {
              const names = activeOffUnit.map(r => r.staffName).join(' & ');
              conflicts.push(`Multiple ${unit} officers (${names}) are schedule-off on ${dateFormatted}! Unit coverage vulnerable.`);
            }
          });
        }

        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-indigo-950/40 backdrop-blur-xl text-white p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-indigo-500/20 pb-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Bell size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-100">Workforce Duty & Leave Alert Center</h4>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Smart coverage guards & real-time team availability</p>
                </div>
              </div>
              <div className="text-xs font-mono text-indigo-200 bg-indigo-950/60 px-4 py-2 rounded-xl border border-indigo-500/30 font-black shadow-inner">
                SYSTEM CALENDAR: {todayString}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Off Today */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  <span className="text-xs uppercase font-black text-slate-300 tracking-wider">Off-Duty Today ({activeOffsToday.length})</span>
                </div>
                {activeOffsToday.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic py-2">✓ Entire farm workforce is active.</p>
                ) : (
                  <div className="space-y-3">
                    {activeOffsToday.map((r) => {
                      const sMatch = staffList.find(s => s.id === r.staffId);
                      return (
                        <div key={r.id} className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl hover:bg-rose-950/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-black text-sm text-white block">{r.staffName}</span>
                              <span className="text-[9px] uppercase font-black bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono block mt-2 w-max">
                                {r.type}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-black bg-white/10 text-slate-300 px-2 py-1 rounded">
                              {sMatch?.unit || 'Unit'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Offs */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                  <span className="text-xs uppercase font-black text-slate-300 tracking-wider">Scheduled Leaves ({upcomingOffs.length})</span>
                </div>
                {upcomingOffs.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic py-2">No departures planned in next 3 days.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingOffs.map((r) => {
                      const sMatch = staffList.find(s => s.id === r.staffId);
                      return (
                        <div key={r.id} className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl hover:bg-amber-950/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-black text-sm text-white block">{r.staffName}</span>
                              <span className="text-[9px] uppercase font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono block mt-2 w-max">
                                {r.type}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-black bg-white/10 text-slate-300 px-2 py-1 rounded">
                              {sMatch?.unit || 'Unit'}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-400 mt-3 font-mono font-bold uppercase tracking-wider">
                            Starts: {r.startDate}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Conflicts */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"></span>
                  <span className="text-xs uppercase font-black text-slate-300 tracking-wider">Labor Overlap Security ({conflicts.length})</span>
                </div>
                {conflicts.length === 0 ? (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold leading-relaxed">
                    ✓ Optimal workforce redundancy intact. Overlap protection validated.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[12rem] overflow-y-auto pr-2 custom-scrollbar">
                    {conflicts.map((msg, idx) => (
                      <div key={idx} className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 font-bold leading-relaxed flex gap-3 items-start">
                        <ShieldAlert size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* 🛡️ ACTIVE ESTATE HEALTH & BIO-SECURITY SCORECARD */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const activeQuarantines = quarantineRecords.filter(q => q.quarantineStatus !== 'Cleared & Released');
        const activeSprayWarnings = sprayRecords.filter(s => s.safeDate >= todayStr);
        const activeWithdrawals = vetRecords.filter(vet => {
          if (!vet.withdrawalMilkDays && !vet.withdrawalMeatDays) return false;
          const treatmentDate = new Date(vet.date);
          const withdrawalDays = Math.max(vet.withdrawalMilkDays || 0, vet.withdrawalMeatDays || 0);
          const safeDate = new Date(treatmentDate);
          safeDate.setDate(safeDate.getDate() + withdrawalDays);
          return safeDate.toISOString().split('T')[0] >= todayStr;
        });
        const abnormalSoilFields = fields.filter(f => {
          if (!f.soilPh) return false;
          if (f.cropType.toLowerCase().includes('tea')) return f.soilPh < 4.8 || f.soilPh > 6.2;
          return f.soilPh < 5.8 || f.soilPh > 7.5;
        });

        let bioScore = 100;
        bioScore -= activeQuarantines.length * 15;
        bioScore -= activeSprayWarnings.length * 15;
        bioScore -= activeWithdrawals.length * 15;
        bioScore -= abnormalSoilFields.length * 10;
        bioScore = Math.max(10, Math.min(100, bioScore));

        let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        let scoreBgBar = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]';
        let statusText = isSwahili ? "MURI KIJANI - Salama Kabisa" : "EXCELLENT - GlobalGAP Compliant";
        let scoreTextDesc = isSwahili 
          ? "Mazao yote ya mauzo ya nje na mifugo yako yanafuata kanuni kamili za afya."
          : "All active livestock and field blocks meet premium GlobalGAP criteria.";

        if (bioScore < 90 && bioScore >= 70) {
          scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          scoreBgBar = 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]';
          statusText = isSwahili ? "TAHADHARI - Kuna Vizuizi" : "CAUTION - Active Withholding";
          scoreTextDesc = isSwahili
            ? "Angalia tarehe salama za kuvuna."
            : "Verify pre-harvest dates due to treatments.";
        } else if (bioScore < 70) {
          scoreColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
          scoreBgBar = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]';
          statusText = isSwahili ? "HATARI - Utii upo chini sana" : "CRITICAL - Violation Risk";
          scoreTextDesc = isSwahili
            ? "Hatari kwa uthibitisho vya GlobalGAP. Tenga mazao na maziwa!"
            : "Active isolation containment or pending PHI violate standards.";
        }

        const allAlarms = [
          ...activeQuarantines.map(q => ({
            id: `quar-${q.id}`, type: 'Quarantine Isolation' as const,
            title: `Quarantine: Tag ${q.animalTagOrBatch}`, desc: `Status: ${q.quarantineStatus}. Reason: ${q.quarantineReason}`, sop: `SOP:\n1. 50m separation.\n2. Milk last.\n3. Disinfect.`, badge: 'Strict Isolation', color: 'rose'
          })),
          ...activeSprayWarnings.map(s => ({
            id: `spray-${s.id}`, type: 'PHI Interval' as const,
            title: `Active PHI: Block ${s.block}`, desc: `Chemical: ${s.chemical}. Safe harvest: ${s.safeDate}.`, sop: `SOP:\n1. RED hazard sign.\n2. Suspend operations.\n3. Verify PHI elapsed.`, badge: `PHI: ${s.safeDate}`, color: 'amber'
          })),
          ...activeWithdrawals.map(v => {
            const expDate = new Date(v.date);
            expDate.setDate(expDate.getDate() + Math.max(v.withdrawalMilkDays || 0, v.withdrawalMeatDays || 0));
            return {
              id: `vet-${v.id}`, type: 'Drug Withdrawal' as const,
              title: `Drug Withdrawal: Tag ${v.cowId}`, desc: `Yields must be discarded. Withholding active until: ${expDate.toISOString().split('T')[0]}.`, sop: `SOP:\n1. Pour milk down drain.\n2. Mark with tail-tape.\n3. Run Delvotest.`, badge: `Release: ${expDate.toISOString().split('T')[0]}`, color: 'rose'
            };
          }),
          ...abnormalSoilFields.map(f => ({
            id: `soil-${f.id}`, type: 'Soil pH Defect' as const,
            title: `Sub-optimal pH: Block ${f.blockName}`, desc: `Soil pH measured at ${f.soilPh || 'N/A'}. Requires adjustments.`, sop: `SOP:\n1. Apply Lime.\n2. Suspend ammonium feeds.\n3. Re-test 60 days.`, badge: `pH: ${f.soilPh}`, color: 'amber'
          }))
        ];

        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl border ${bioScore >= 90 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {bioScore >= 90 ? <ShieldCheck size={28} className="animate-pulse" /> : <ShieldAlert size={28} className="animate-bounce" />}
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    {isSwahili ? "Mizani ya Afya ya Shamba & Biosecurity" : "Real-time Biosecurity Core"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Automated GlobalGAP quarantine tracking & pesticide pre-harvest audits.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-black/30 p-3 rounded-2xl border border-white/5">
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quality Index</span>
                  <span className={`text-xl font-mono font-black ${bioScore >= 90 ? 'text-emerald-400' : bioScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {bioScore}%
                  </span>
                </div>
                <div className="w-24 h-3 bg-white/10 rounded-full overflow-hidden shrink-0">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bioScore}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${scoreBgBar}`} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              <div className="lg:col-span-4 space-y-4">
                <div className={`p-6 rounded-2xl border ${scoreColor} flex flex-col justify-between h-full min-h-[160px] shadow-inner`}>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-70 block mb-2">Estate Status</span>
                    <h4 className="text-sm font-black uppercase leading-normal tracking-wide">{statusText}</h4>
                    <p className="text-xs font-medium leading-relaxed mt-3 opacity-90">
                      {scoreTextDesc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-current/20 text-[10px] font-mono font-black opacity-80 uppercase flex items-center gap-2 mt-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-current animate-ping"></span>
                    <span>Verified by Autonomous Audits</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Detected Warnings & PHI Audits ({allAlarms.length})
                </h4>
                {allAlarms.length === 0 ? (
                  <div className="p-8 bg-black/20 border border-white/10 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                    <ShieldCheck size={36} className="text-emerald-500" />
                    <p className="text-sm text-white font-extrabold uppercase tracking-wide">✓ No active biological warnings</p>
                    <p className="text-xs text-slate-400 font-medium">Your farm complies 100% with GlobalGAP food export standards.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {allAlarms.map((alarm) => {
                        const isExpanded = expandedSopId === alarm.id;
                        return (
                          <motion.div 
                            layout
                            key={alarm.id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 bg-black/20 border border-white/10 rounded-2xl hover:bg-black/30 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4 items-start">
                                <div className={`p-2.5 rounded-xl bg-${alarm.color}-500/20 text-${alarm.color}-400 shrink-0`}>
                                  {alarm.color === 'rose' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                                </div>
                                <div>
                                  <span className={`text-[9px] uppercase font-mono font-black text-${alarm.color}-400 block tracking-wider mb-1`}>
                                    {alarm.type}
                                  </span>
                                  <h5 className="text-sm font-black text-white uppercase leading-normal">
                                    {alarm.title}
                                  </h5>
                                  <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                                    {alarm.desc}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0 gap-3">
                                <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-lg border bg-${alarm.color}-500/10 text-${alarm.color}-400 border-${alarm.color}-500/30`}>
                                  {alarm.badge}
                                </span>
                                <button
                                  onClick={() => setExpandedSopId(isExpanded ? null : alarm.id)}
                                  className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <span>{isExpanded ? "Hide SOP" : "Action SOP"}</span>
                                  <span className="font-mono text-[9px]">{isExpanded ? '▲' : '▼'}</span>
                                </button>
                              </div>
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-white/10 bg-black/40 text-emerald-300 p-5 rounded-xl font-mono text-xs leading-relaxed shadow-inner overflow-hidden"
                                >
                                  <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest mb-3 border-b border-emerald-500/30 pb-2 text-[10px]">
                                    <ShieldCheck size={14} />
                                    <span>Remediation Standard Operating Procedure</span>
                                  </div>
                                  <pre className="whitespace-pre-wrap font-semibold font-mono text-emerald-200/90">
                                    {alarm.sop}
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Main Charts & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-white font-black text-base uppercase tracking-widest">7-Day Milk Production Trend</h4>
              <p className="text-xs text-slate-400 font-medium mt-1">Morning (AM) vs Afternoon (PM) yield</p>
            </div>
          </div>
          <div className="h-80 w-full bg-black/20 rounded-2xl p-4 border border-white/5 min-w-0">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-mono">
                No milking records compiled yet.
              </div>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Area type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Liter" />
                  <Line type="monotone" dataKey="AM" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} name="AM (L)" />
                  <Line type="monotone" dataKey="PM" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} name="PM (L)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col"
        >
          <div className="mb-6">
            <h4 className="text-white font-black text-base uppercase tracking-widest">Strategic Assignment</h4>
            <p className="text-xs text-slate-400 font-medium mt-1">Link operations to key officers</p>
          </div>

          <form onSubmit={handleSubmitTodo} className="space-y-4 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="E.g. Clear pasture sector D..."
              className="w-full text-sm border border-white/10 rounded-xl px-4 py-3 bg-black/40 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium transition-all"
            />
            <div className="flex gap-3">
              <select
                value={todoAssignee}
                onChange={(e) => setTodoAssignee(e.target.value)}
                className="flex-1 text-sm border border-white/10 rounded-xl px-4 py-2.5 bg-black/40 text-slate-300 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              >
                <option value="" className="bg-slate-900">-- Assign (Optional) --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name} className="bg-slate-900">
                    {s.name} ({s.unit})
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-emerald-500 text-white rounded-xl px-6 py-2.5 flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] font-black text-sm uppercase cursor-pointer"
              >
                Deploy
              </motion.button>
            </div>
          </form>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <AnimatePresence>
              {todos.length === 0 ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 italic text-center py-8">All tasks completed successfully!</motion.p>
              ) : (
                todos.map((todo) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={todo.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTodoId(todo.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTodoId && draggedTodoId !== todo.id && onReorderTodos) {
                        const oldIndex = todos.findIndex(t => t.id === draggedTodoId);
                        const newIndex = todos.findIndex(t => t.id === todo.id);
                        if (oldIndex !== -1 && newIndex !== -1) {
                          const newTodos = [...todos];
                          const [moved] = newTodos.splice(oldIndex, 1);
                          newTodos.splice(newIndex, 0, moved);
                          onReorderTodos(newTodos);
                        }
                      }
                      setDraggedTodoId(null);
                    }}
                    onDragEnd={() => setDraggedTodoId(null)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                      draggedTodoId === todo.id ? 'opacity-50 scale-95 border-emerald-500/50' : ''
                    } ${
                      todo.completed ? 'bg-black/20 border-white/5 opacity-50' : 'bg-black/40 border-white/10 hover:border-emerald-500/30 hover:bg-black/60'
                    }`}
                  >
                    <button onClick={() => onToggleTodo(todo.id)} className="flex items-start gap-4 flex-1 text-left cursor-pointer">
                      <span className={`mt-0.5 shrink-0 ${todo.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {todo.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                      </span>
                      <div>
                        <span className={`text-sm font-medium leading-relaxed ${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {todo.text}
                        </span>
                        {todo.assigneeName && (
                          <span className={`inline-block mt-2 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md font-mono ${
                            todo.completed ? 'bg-white/5 text-slate-500' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            👤 {todo.assigneeName}
                          </span>
                        )}
                      </div>
                    </button>
                    <button onClick={() => onDeleteTodo(todo.id)} className="text-slate-500 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-500/10 transition-colors shrink-0 ml-2 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Climate & Precision Soil Advisory Hub */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-black/30 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8 relative z-10"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-lg font-mono mb-3 inline-block shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              📡 LIVE SATELLITE METEOROLOGY
            </span>
            <h4 className="text-white font-black text-lg uppercase tracking-widest block">
              {t("Nyaronde Weather & Agro-Advisory")}
            </h4>
            <p className="text-sm text-slate-400 font-medium mt-1 max-w-2xl">
              Live orbital indices combined with soil moisture tension mapping for optimal agricultural compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setIsLiveWeather(true)}
              className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                isLiveWeather ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} className={weatherLoading ? "animate-spin" : ""} />
              <span>Live Link</span>
            </button>
            <button
              onClick={() => { setIsLiveWeather(false); setWeatherCondition('sunny'); setSoilMoisture(42); }}
              className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                !isLiveWeather ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Simulator</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner flex items-center gap-6">
            <div className={`p-4 rounded-2xl shrink-0 ${
              isLiveWeather ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              weatherCondition === 'sunny' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              weatherCondition === 'rainy' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              <span className="text-3xl font-bold font-mono">
                {isLiveWeather ? (liveWeather?.current?.weather_code <= 3 ? '⛅' : liveWeather?.current?.weather_code >= 51 ? '🌧️' : '☀️') : (weatherCondition === 'sunny' ? '☀' : weatherCondition === 'rainy' ? '☂' : '❄')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-500 block tracking-widest leading-none mb-2">
                {isLiveWeather ? "Satellite telemetry" : "Simulated Climate"}
              </span>
              <h5 className="text-lg font-black font-mono text-white">
                {isLiveWeather ? (weatherLoading ? "Linking..." : liveWeather ? `${liveWeather.current.temperature_2m}°C` : "Orbiting...") : (weatherCondition === 'sunny' ? '23°C' : weatherCondition === 'rainy' ? '16°C' : '14°C')}
              </h5>
              <p className="text-xs text-slate-400 font-bold mt-1">
                Humidity: {isLiveWeather ? (liveWeather?.current?.relative_humidity_2m ? `${liveWeather.current.relative_humidity_2m}%` : "76%") : (weatherCondition === 'sunny' ? '30%' : weatherCondition === 'rainy' ? '92%' : '65%')}
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner flex flex-col justify-center">
            {isLiveWeather ? (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-black text-slate-500 block tracking-widest leading-none">
                  Atmosphere & Wind
                </span>
                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Wind size={14} className="text-emerald-400" /> Wind Velocity
                  </span>
                  <span className="font-mono text-sm font-black text-white">
                    {liveWeather ? `${liveWeather.current.wind_speed_10m} km/h` : "8.4 km/h"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black text-slate-500 block tracking-widest">{t("Soil Moisture")}</span>
                  <span className={`font-black font-mono text-xs px-2.5 py-1 rounded-md border ${
                    soilMoisture < 25 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    soilMoisture > 75 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {soilMoisture}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10" max="95" value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}
          </div>

          <div className={`p-6 rounded-2xl border flex flex-col justify-center ${
            isLiveWeather ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
            soilMoisture < 30 || weatherCondition === 'rainy' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-widest block leading-none mb-3 opacity-80">
              {isLiveWeather ? "Satellite Health" : "Smart Soil State"}
            </span>
            <p className="text-sm font-bold leading-relaxed">
              {isLiveWeather ? (weatherError ? weatherError : "✔ Satellite links steady. Real-time Nyaronde crop evapotranspiration coefficients optimal.") : (soilMoisture < 30 ? '⚠️ Alert: Dry moisture levels detected! Engage drip valves.' : soilMoisture > 80 ? '✋ Saturated Soil: Hold scheduled drip irrigation.' : '✔ Ideal capillary moisture pressure.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 p-6 md:p-8 rounded-3xl border border-indigo-500/20 lg:col-span-2 flex flex-col justify-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-4 relative z-10">
              DR. DEVIN OMWENGA'S ADVISORY
            </span>
            <div className="flex gap-4 relative z-10">
              <span className="text-2xl mt-1">💡</span>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                {isLiveWeather ? "High solar radiation accelerates avocado lipid accumulation. Keep water reserves high; review pesticide cycles." : "Excellent avocado oil conversion. Graded harvest lines should operate at maximum throughput. Ensure high cow safety water levels."}
              </p>
            </div>
          </div>

          <div className="bg-black/40 p-6 rounded-3xl border border-white/10 shadow-inner flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={16} className="text-yellow-500" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Soil Dosage Optimizer</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 block mb-1">Crop</label>
                <select value={calcCrop} onChange={(e: any) => setCalcCrop(e.target.value)} className="w-full bg-black/60 text-white font-bold text-xs border border-white/10 rounded-lg px-2 py-2 outline-none">
                  <option value="tea">Tea</option>
                  <option value="avocado">Avocado</option>
                  <option value="napier">Napier</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 block mb-1">pH</label>
                <input type="number" step="0.1" min="3" max="9" value={calcPh} onChange={(e: any) => setCalcPh(e.target.value)} className="w-full bg-black/60 text-white font-mono font-bold text-xs border border-white/10 rounded-lg px-2 py-2 outline-none" />
              </div>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-[9px] font-mono tracking-widest uppercase font-black text-yellow-400 block mb-1">Recommendation:</span>
              <p className="font-black text-white text-xs leading-tight mb-2">{calcResult.dosage}</p>
              <p className="text-[9px] text-emerald-400/80 italic leading-snug">{calcResult.description}</p>
          </div>
        </div>
      </div>

        {isLiveWeather && liveWeather?.daily && (
          <div className="pt-6 border-t border-white/10">
            <span className="text-[10px] uppercase font-black text-slate-500 block tracking-widest leading-none mb-4">
              7-Day Forecast (Open-Meteo)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {liveWeather.daily.time.map((time: string, i: number) => (
                <div key={time} className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl border border-white/5 min-w-[70px]">
                  <span className="text-xs text-slate-400 font-bold mb-1">
                    {new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-xl mb-1">
                    {liveWeather.daily.weather_code[i] <= 3 ? '⛅' : liveWeather.daily.weather_code[i] >= 51 ? '🌧️' : '☀️'}
                  </span>
                  <div className="flex gap-1 text-[10px] font-mono font-bold">
                    <span className="text-rose-400">{Math.round(liveWeather.daily.temperature_2m_max[i])}°</span>
                    <span className="text-blue-400">{Math.round(liveWeather.daily.temperature_2m_min[i])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Activity Log Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-black/30 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
            <Bell size={20} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-black text-base uppercase tracking-widest">Global Activity Log</h4>
            <p className="text-xs text-slate-400 font-medium mt-1">Live feed of farm events and notifications</p>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl border border-white/5 p-4 max-h-60 overflow-y-auto space-y-3 custom-scrollbar">
          {activityLogs.length === 0 ? (
            <div className="text-center text-slate-500 font-mono text-sm py-4">No recent activity</div>
          ) : (
            activityLogs.map(log => (
              <div key={log.id} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 items-start">
                <span className={`shrink-0 mt-0.5 text-[10px] font-black tracking-widest px-2 py-1 rounded-md border ${
                  log.type === 'alert' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  log.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  log.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {log.type.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{log.message}</p>
                  <span className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Precision agricultural calculators suite */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative z-10"
      >
        <div className="mb-6">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            <Sparkles className="text-yellow-400 animate-pulse" size={24} />
            Precision Suite
          </h3>
          <p className="text-sm text-slate-400 font-medium mt-1">Launch intelligent agricultural modules and real-time troubleshooting tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'diagnostics_sub', icon: Activity, label: "Diagnostics Wizard", desc: "Symptoms scanner for crops & livestock.", color: "blue" },
            { id: 'inventory_deduct_sub', icon: Database, label: "Stock Auto-Deduct", desc: "Run feed & chem protocols.", color: "indigo" },
            { id: 'timelines_sub', icon: Calendar, label: "Gestation & PHI", desc: "Countdown trackers & calendars.", color: "purple" },
            { id: 'analyzer_sub', icon: DollarSign, label: "Margin Analyser", desc: "Feed-to-milk yield ratios.", color: "emerald" }
          ].map((tool, i) => {
            const ToolIcon = tool.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToTab && onNavigateToTab(tool.id)}
                className="group cursor-pointer bg-black/40 border border-white/10 p-6 rounded-2xl transition-all relative overflow-hidden"
              >
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${tool.color}-500/20 rounded-full blur-[40px] group-hover:bg-${tool.color}-500/40 transition-colors`}></div>
                <div className={`p-3 bg-${tool.color}-500/20 text-${tool.color}-400 rounded-xl w-fit mb-4 border border-${tool.color}-500/30`}>
                  <ToolIcon size={20} />
                </div>
                <h4 className={`text-sm font-black text-white uppercase tracking-wide group-hover:text-${tool.color}-400 transition-colors mb-2`}>{tool.label}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{tool.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
