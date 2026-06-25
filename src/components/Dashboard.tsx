/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { MilkingRecord, Todo, StaffOffRecord, StaffMember, Cow, QuarantineRecord, SprayRecord, FieldRecord, VetRecord } from '../types';
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
  totalTeaQty: number;
  staffOffRecords: StaffOffRecord[];
  staffList: StaffMember[];
  onNavigateToTab?: (tabId: string) => void;
  cows?: Cow[];
  quarantineRecords?: QuarantineRecord[];
  sprayRecords?: SprayRecord[];
  fields?: FieldRecord[];
  vetRecords?: VetRecord[];
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
  totalTeaQty,
  staffOffRecords = [],
  staffList = [],
  onNavigateToTab,
  cows = [],
  quarantineRecords = [],
  sprayRecords = [],
  fields = [],
  vetRecords = []
}: DashboardProps) {
  const [newTodo, setNewTodo] = useState('');
  const [todoAssignee, setTodoAssignee] = useState('');
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
    <div className="space-y-8">
      {/* ESTATE BRANDED GREETING METADATA BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0e3020] border border-emerald-900/40 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-left">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl -z-0 pointer-events-none"></div>
        <div className="absolute top-4 right-4 z-25">
          {/* Latch bilingual integration switcher */}
          <button
            onClick={() => setIsSwahili(!isSwahili)}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-950 border border-emerald-800/60 text-emerald-300 hover:text-white font-extrabold tracking-wider uppercase text-[10px] transition-all flex items-center gap-2 shadow-lg cursor-pointer max-w-[155px]"
          >
            <Languages size={14} className="animate-spin-once" />
            <span>{isSwahili ? "Swahili 🇰🇪" : "English 🇬🇧"}</span>
          </button>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2 pr-28">
            <span className="text-[10px] uppercase font-black tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full font-mono">
              🛡️ {t("Sovereign Compliance Registered")}
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
              {t("GlobalGAP Plot: KT-205A")}
            </span>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase">
              {t("JR Farm Omni-Estate")}
            </h1>
            <p className="text-slate-300 font-medium text-xs md:text-sm leading-relaxed">
              {t("Comprehensive estate, livestock, and crop export management platform for JR Farm, including feed formulation, dairy ledger, GlobalGAP spray logs, and financials.")}
            </p>
          </div>

          {/* Core high-level metadata telemetry status bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-emerald-800/40 max-w-3xl text-left">
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wide mt-1">{t("Management Core")}</span>
              <span className="text-xs font-black text-white font-mono block mt-1">{t("Sovereign Active")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wide mt-1">{t("Audit Compliance")}</span>
              <span className="text-xs font-black text-emerald-300 font-mono block mt-1">{t("100% Certified")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wide mt-1">{t("Traceback Records")}</span>
              <span className="text-xs font-black text-yellow-500 font-mono block mt-1">{t("Blockchain Latch")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wide mt-1">{t("System Node")}</span>
              <span className="text-xs font-black text-white font-mono block mt-1">{t("Online & Synced")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-40"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Milk Yield (Today)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2 font-mono">{todayLiters.toFixed(1)} L</h3>
              <p className="text-xs text-emerald-600 font-bold mt-2">Active dairy herd log</p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 opacity-40"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tea Weights (Harvest)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2 font-mono">{totalTeaQty.toLocaleString()} KG</h3>
              <p className="text-xs text-purple-600 font-bold mt-2">KTDA delivery aggregate</p>
            </div>
            <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
              <Leaf size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-30"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Cash Balance</p>
              <h3 className={`text-2xl font-black mt-2 font-mono ${netPl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Ksh {netPl.toLocaleString()}
              </h3>
              <p className="text-xs text-amber-600 font-bold mt-2">Overall P&L account</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <Coins size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-40"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calving Alarm</p>
              <h3 className="text-[14px] font-black text-rose-800 mt-3 truncate max-w-[160px]" title={upcomingDueAlarm}>
                {upcomingDueAlarm}
              </h3>
              <p className="text-xs text-rose-600 font-bold mt-2">
                {activeAlarmsCount} pending breed cycles
              </p>
            </div>
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 🧑‍🌾 Staff Attendance & Leave Alerts Reminders */}
      {(() => {
        const todayString = new Date().toISOString().split('T')[0];

        const getDayOffsetString = (offset: number) => {
          const d = new Date();
          d.setDate(d.getDate() + offset);
          return d.toISOString().split('T')[0];
        };

        const activeOffsToday = staffOffRecords.filter(r => {
          return r.status === 'Approved' && r.startDate <= todayString && todayString <= r.endDate;
        });

        const upcomingOffs = staffOffRecords.filter(r => {
          return r.status === 'Approved' && r.startDate > todayString && r.startDate <= getDayOffsetString(3);
        });

        // Calculate and check conflicts in the next 5 days
        const conflicts: string[] = [];
        const units = ['Dairy', 'Horti', 'Fields', 'Security'];

        for (let offset = 0; offset <= 5; offset++) {
          const checkDate = getDayOffsetString(offset);
          const dateFormatted = new Date(checkDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          units.forEach(unit => {
            const unitStaffIds = staffList.filter(s => s.unit === unit).map(s => s.id);
            const activeOffUnit = staffOffRecords.filter(r => {
              return r.status === 'Approved' && 
                     r.startDate <= checkDate && 
                     checkDate <= r.endDate && 
                     unitStaffIds.includes(r.staffId);
            });

            if (activeOffUnit.length > 1) {
              const names = activeOffUnit.map(r => r.staffName).join(' & ');
              conflicts.push(`Multiple ${unit} officers (${names}) are schedule-off on ${dateFormatted}! Unit coverage vulnerable.`);
            }
          });
        }

        return (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden transition-all hover:shadow-indigo-950/20">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500 rounded-bl-full opacity-5 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-indigo-900/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/15 text-indigo-300 rounded-xl border border-indigo-500/25">
                  <Bell size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200">Workforce Duty & Leave Alert Center</h4>
                  <p className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-widest mt-1 leading-none">Smart coverage guards & real-time team availability</p>
                </div>
              </div>
              <div className="text-[10px] font-mono text-indigo-200 bg-indigo-900/40 px-3 py-1.5 rounded-lg border border-indigo-900/60 font-black">
                SYSTEM CALENDAR: {todayString}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Currently Off Today */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Off-Duty Today ({activeOffsToday.length})</span>
                </div>
                {activeOffsToday.length === 0 ? (
                  <p className="text-[11px] text-slate-450 font-bold italic py-2">✓ Entire farm workforce is active and report on-field.</p>
                ) : (
                  <div className="space-y-2">
                    {activeOffsToday.map((r) => {
                      const sMatch = staffList.find(s => s.id === r.staffId);
                      return (
                        <div key={r.id} className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-xs text-white block">{r.staffName}</span>
                              <span className="text-[9px] uppercase font-black bg-rose-500/10 text-rose-300 px-1.5 py-0.2 rounded font-mono block mt-1 w-max">
                                {r.type}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase font-black bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                              {sMatch?.unit || 'Unit'}
                            </span>
                          </div>
                          {r.notes && (
                            <p className="text-[10px] text-slate-400 mt-1.5 border-t border-red-950/20 pt-1 italic">
                              "{r.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Col 2: Upcoming Off/Leaves */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Scheduled Leaves ({upcomingOffs.length})</span>
                </div>
                {upcomingOffs.length === 0 ? (
                  <p className="text-[11px] text-slate-450 font-bold italic py-2">No departures planned in next 3 days.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingOffs.map((r) => {
                      const sMatch = staffList.find(s => s.id === r.staffId);
                      return (
                        <div key={r.id} className="p-3 bg-amber-950/30 border border-amber-900/30 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-xs text-white block">{r.staffName}</span>
                              <span className="text-[9px] uppercase font-black bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded font-mono block mt-1 w-max">
                                {r.type}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase font-black bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                              {sMatch?.unit || 'Unit'}
                            </span>
                          </div>
                          <p className="text-[9px] text-amber-200 mt-2 font-mono font-bold uppercase tracking-wider">
                            Starts: {r.startDate}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Col 3: Coverage safeties & conflicts */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Labor Overlap Security ({conflicts.length})</span>
                </div>
                {conflicts.length === 0 ? (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-[11px] text-emerald-300 font-bold leading-relaxed">
                    ✓ Optimal workforce redundancy intact. Overlap protection validated.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[12rem] overflow-y-auto pr-1">
                    {conflicts.map((msg, idx) => (
                      <div key={idx} className="p-3 bg-red-950/40 border border-red-920 rounded-xl text-[10px] text-red-200 font-bold leading-normal flex gap-2">
                        <span className="text-red-400 font-black shrink-0 font-mono">!</span>
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🛡️ ACTIVE ESTATE HEALTH & BIO-SECURITY SCORECARD */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Find active quarantines
        const activeQuarantines = quarantineRecords.filter(q => q.quarantineStatus !== 'Cleared & Released');

        // 2. Find active pesticide spraying withholding windows (PHI)
        const activeSprayWarnings = sprayRecords.filter(s => s.safeDate >= todayStr);

        // 3. Find active chemical/medical withdrawal days (milking or meat withdrawal)
        const activeWithdrawals = vetRecords.filter(vet => {
          if (!vet.withdrawalMilkDays && !vet.withdrawalMeatDays) return false;
          const treatmentDate = new Date(vet.date);
          const withdrawalDays = Math.max(vet.withdrawalMilkDays || 0, vet.withdrawalMeatDays || 0);
          const safeDate = new Date(treatmentDate);
          safeDate.setDate(safeDate.getDate() + withdrawalDays);
          const safeStr = safeDate.toISOString().split('T')[0];
          return safeStr >= todayStr;
        });

        // 4. Find abnormal soil pH records (pH < 4.8 or pH > 7.5)
        const abnormalSoilFields = fields.filter(f => {
          if (!f.soilPh) return false;
          if (f.cropType.toLowerCase().includes('tea')) {
            return f.soilPh < 4.8 || f.soilPh > 6.2;
          }
          return f.soilPh < 5.8 || f.soilPh > 7.5;
        });

        // Compute biosecurity rating score (starts at 100)
        let bioScore = 100;
        bioScore -= activeQuarantines.length * 15;
        bioScore -= activeSprayWarnings.length * 15;
        bioScore -= activeWithdrawals.length * 15;
        bioScore -= abnormalSoilFields.length * 10;
        bioScore = Math.max(10, Math.min(100, bioScore));

        // Status description and color theme
        let scoreColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
        let scoreBgBar = 'bg-emerald-600';
        let statusText = isSwahili ? "MURI KIJANI - Salama Kabisa" : "EXCELLENT - GlobalGAP Compliant";
        let scoreTextDesc = isSwahili 
          ? "Mazao yote ya mauzo ya nje na mifugo yako yanafuata kanuni kamili za afya. Hakuna marufuku ya kuvuna."
          : "All active livestock and field blocks meet premium GlobalGAP and biosecurity criteria. Free to harvest.";

        if (bioScore < 90 && bioScore >= 70) {
          scoreColor = 'text-amber-700 bg-amber-50 border-amber-150';
          scoreBgBar = 'bg-amber-500';
          statusText = isSwahili ? "TAHADHARI - Kuna Vizuizi vya Muda" : "CAUTION - Active Withholding Protocols";
          scoreTextDesc = isSwahili
            ? "Kuna dawa zilizopuliziwa hivi karibuni au wanyama walio chini ya matibabu. Angalia tarehe salama za kuvuna."
            : "Recent chemical application or animal treatments require temporary withholding. Verify pre-harvest dates.";
        } else if (bioScore < 70) {
          scoreColor = 'text-rose-700 bg-rose-50 border-rose-150';
          scoreBgBar = 'bg-rose-600';
          statusText = isSwahili ? "HATARI - Utii upo chini sana" : "CRITICAL - Active Containment or PHI Violation Risk";
          scoreTextDesc = isSwahili
            ? "Mlipuko au unyunyiziaji wa hivi karibuni unahatarisha uthibitisho vya GlobalGAP. Tenga mazao na maziwa!"
            : "Active isolation containment or pending Pre-Harvest Intervals (PHI) violate export standards if neglected.";
        }

        // Aggregate list of warnings
        const allAlarms = [
          ...activeQuarantines.map(q => ({
            id: `quar-${q.id}`,
            type: 'Quarantine Isolation' as const,
            title: isSwahili ? `Mnyama Katika Karantini: ${q.animalTagOrBatch}` : `Strict Animal Quarantine: Tag ${q.animalTagOrBatch}`,
            desc: isSwahili 
              ? `Hali: ${q.quarantineStatus}. Sababu: ${q.quarantineReason}. Dalili zilizorekodiwa: "${q.symptomsObserved}"`
              : `Status: ${q.quarantineStatus}. Reason: ${q.quarantineReason}. Symptoms: "${q.symptomsObserved}"`,
            sop: isSwahili
              ? `MWONGOZO WA USALAMA (SOP):\n1. Weka mnyama mbali na wengine kwa mita 50.\n2. Milia ng'ombe huyu MWISHO ili kuzuia kuenea kwa bakteria.\n3. Osha mikono na vifaa kwa Iodini kabla ya kuhudumia wengine.`
              : `BIOSECURITY SOP:\n1. Maintain strict 50-meter separation from healthy herds.\n2. ALWAYS milk this cow last to prevent cross-contamination.\n3. Disinfect hands and milking clusters with 0.5% chlorhexidine before handling other dairy stock.`,
            badge: 'Strict Isolation',
            color: 'rose'
          })),
          ...activeSprayWarnings.map(s => ({
            id: `spray-${s.id}`,
            type: 'Pre-Harvest Interval (PHI)' as const,
            title: isSwahili ? `Kizuizi cha PHI: Block ${s.block}` : `Active Pesticide PHI: Block ${s.block}`,
            desc: isSwahili
              ? `Dawa iliyotumika: ${s.chemical}. Tarehe salama ya kuvuna: ${s.safeDate}. Usivune kabla ya tarehe hii!`
              : `Chemical applied: ${s.chemical}. Safe harvest release date: ${s.safeDate}. Do NOT harvest crops from this block before release!`,
            sop: isSwahili
              ? `MWONGOZO WA USALAMA (SOP):\n1. Weka bango nyekundu la onyo mlangoni mwa Block ${s.block}.\n2. Wajulishe wafanyakazi wote kuzuia kuingia bila viatu na nguo za usalama.\n3. Rekodi tarehe ya mwisho ya kipindi cha kuzuia matumizi katika daftari la GlobalGAP.`
              : `GlobalGAP SOP:\n1. Post highly visible RED hazard signage at the entry point of Block ${s.block}.\n2. Brief all plucking teams to suspend operations in this sector.\n3. Compile chemical batch traceability sheet and verify that pre-harvest interval (PHI) of ${s.phi} days has fully elapsed before loading shipping crates.`,
            badge: `PHI: ${s.safeDate}`,
            color: 'amber'
          })),
          ...activeWithdrawals.map(v => {
            const expDate = new Date(v.date);
            const withdrawalDays = Math.max(v.withdrawalMilkDays || 0, v.withdrawalMeatDays || 0);
            expDate.setDate(expDate.getDate() + withdrawalDays);
            const releaseDateStr = expDate.toISOString().split('T')[0];

            return {
              id: `vet-${v.id}`,
              type: 'Drug Withdrawal' as const,
              title: isSwahili ? `Kizuizi cha Dawa za Matibabu: ${v.cowId}` : `Chemical Drug Withdrawal: Cow Tag ${v.cowId}`,
              desc: isSwahili
                ? `Mnyama alipewa dawa ya ${v.drugAdministered || 'antibiotics'}. Lita za maziwa lazima zimwagwe na zisitumike hadi: ${releaseDateStr}.`
                : `Animal administered with ${v.drugAdministered || 'antibiotics'}. Yields must be discarded/poured out. Withholding active until: ${releaseDateStr}.`,
              sop: isSwahili
                ? `MWONGOZO WA USALAMA (SOP):\n1. Mwaga maziwa yote ya ng'ombe huyu kwa udongo (usilishe ndama bila kuchemsha).\n2. Weka rangi maalum ya bluu kwenye kiwele cha ng'ombe huyu.\n3. Hakikisha tarehe ya mwisho ya kuzuia imepita kabla ya kuchanganya na maziwa ya jumla.`
                : `VETERINARY DRUG WITHHOLDING SOP:\n1. Pour milk down the drain. Do NOT feed to calves as it triggers early drug-resistance.\n2. Mark the cow's tail and udder with high-visibility purple tail-tape.\n3. Run a Delvotest or snap-test to verify zero antibiotic residues before releasing milk to the bulk commercial tank.`,
              badge: `Drug Release: ${releaseDateStr}`,
              color: 'rose'
            };
          }),
          ...abnormalSoilFields.map(f => ({
            id: `soil-${f.id}`,
            type: 'Soil pH Defect' as const,
            title: isSwahili ? `Udongo Una Tindikali Kali: Block ${f.blockName}` : `Sub-optimal Soil pH: Block ${f.blockName}`,
            desc: isSwahili
              ? `Kipimo cha pH kipo: ${f.soilPh || 'N/A'}. Hii inazuia mmea wa ${f.cropType} kufyonza virutubisho vyema.`
              : `Soil pH measured at ${f.soilPh || 'N/A'}. Crop '${f.cropType}' requires adjustments to avoid toxic aluminum uptake or nutrient lock.`,
            sop: isSwahili
              ? `MWONGOZO WA USALAMA (SOP):\n1. Weka chokaa ya kilimo (Agricultural Lime) ya Dolomite kilo 50 kwa kila ekari.\n2. Punguza matumizi ya mbolea zenye Naitrojeni ya Ammonium (kama urea) ambayo huongeza asidi.\n3. Pima udongo tena baada ya siku 60.`
              : `SOIL REGENERATION SOP:\n1. Top-dress with Dolomitic Agricultural Lime (approx 500kg per acre based on pH deficiency).\n2. Suspend acidifying ammonium-based nitrogen feeds; prefer Nitrate-based fertilizers (Calcium Ammonium Nitrate).\n3. Re-test soil saturation index after 60 days of organic compost cover-cropping.`,
            badge: `pH: ${f.soilPh}`,
            color: 'amber'
          }))
        ];

        return (
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full opacity-60 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${bioScore >= 90 ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}>
                  {bioScore >= 90 ? <ShieldCheck size={22} className="animate-pulse" /> : <ShieldAlert size={22} className="animate-bounce" />}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    {isSwahili ? "Mizani ya Afya ya Shamba & Biosecurity" : "Real-time Biosecurity & Crop Safety Core"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {isSwahili ? "Mfumo wa uthibitisho wa GlobalGAP na ufuatiliaji vya vizuizi vya kemikali" : "Automated GlobalGAP quarantine tracking & pesticide pre-harvest audits."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quality Health Index</span>
                  <span className={`text-base font-mono font-black ${bioScore >= 90 ? 'text-emerald-700' : bioScore >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {bioScore}%
                  </span>
                </div>
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                  <div className={`h-full ${scoreBgBar}`} style={{ width: `${bioScore}%` }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Scorecard Pane */}
              <div className="lg:col-span-4 space-y-4">
                <div className={`p-5 rounded-2xl border ${scoreColor} flex flex-col justify-between h-full min-h-[140px]`}>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80 block mb-1">Estate Status</span>
                    <h4 className="text-xs font-black uppercase leading-normal tracking-wide">{statusText}</h4>
                    <p className="text-[11px] font-medium leading-relaxed mt-2 text-slate-600">
                      {scoreTextDesc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100/40 text-[10px] font-mono font-black opacity-85 uppercase flex items-center gap-1.5 mt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    <span>{isSwahili ? "Imethibitishwa na AI" : "Verified by Autonomous Audits"}</span>
                  </div>
                </div>
              </div>

              {/* Warnings and SOP Guidelines */}
              <div className="lg:col-span-8 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  {isSwahili ? `Arifa za Kiusalama na PHI zilizogunduliwa (${allAlarms.length})` : `Detected Biosecurity Warnings & PHI Audits (${allAlarms.length})`}
                </h4>

                {allAlarms.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center space-y-2">
                    <ShieldCheck size={28} className="text-emerald-600" />
                    <p className="text-xs text-slate-700 font-extrabold uppercase">✓ No active biological warnings detected</p>
                    <p className="text-[10px] text-slate-400 font-medium">Your farm complies 100% with GlobalGAP food export standards and chemical limits today.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[20rem] overflow-y-auto pr-1">
                    {allAlarms.map((alarm) => {
                      const isExpanded = expandedSopId === alarm.id;
                      return (
                        <div key={alarm.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-2.5 items-start">
                              <span className="text-lg mt-0.5 shrink-0">
                                {alarm.color === 'rose' ? '🛑' : '⚠️'}
                              </span>
                              <div>
                                <span className="text-[9px] uppercase font-mono font-black text-slate-400 block tracking-wider leading-none">
                                  {alarm.type}
                                </span>
                                <h5 className="text-xs font-black text-slate-800 uppercase mt-1 leading-normal">
                                  {alarm.title}
                                </h5>
                                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                                  {alarm.desc}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end shrink-0 gap-2">
                              <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                                alarm.color === 'rose' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {alarm.badge}
                              </span>
                              <button
                                onClick={() => setExpandedSopId(isExpanded ? null : alarm.id)}
                                type="button"
                                className="text-[9px] font-black uppercase text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-emerald-500/5 px-2 py-1 rounded hover:bg-emerald-500/10 transition-all border border-emerald-500/10"
                              >
                                <span>{isExpanded ? (isSwahili ? "Funga SOP" : "Hide SOP") : (isSwahili ? "Mwongozo SOP" : "Action SOP")}</span>
                                <span className="font-mono text-[8px]">{isExpanded ? '▲' : '▼'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Action Plan SOP Panel */}
                          {isExpanded && (
                            <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 bg-emerald-950 text-emerald-100 p-4 rounded-xl font-mono text-[10px] leading-relaxed shadow-inner">
                              <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase tracking-wider mb-2 border-b border-emerald-900/60 pb-1.5 text-[9px]">
                                <ShieldCheck size={11} />
                                <span>{isSwahili ? "Mkakati wa Kuondoa Hatari (SOP)" : "Remediation Standard Operating Procedure"}</span>
                              </div>
                              <pre className="whitespace-pre-wrap text-emerald-200 font-semibold font-mono font-bold">
                                {alarm.sop}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recharts production trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">7-Day Milk Production Trend</h4>
              <p className="text-xs text-slate-400 font-medium">Morning (AM) vs Afternoon (PM) yield</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                No milking records compiled yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e5631" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1e5631" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <Area type="monotone" dataKey="Total" stroke="#1e5631" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Liter" />
                  <Line type="monotone" dataKey="AM" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} name="AM (L)" />
                  <Line type="monotone" dataKey="PM" stroke="#a855f7" strokeWidth={1.5} dot={{ r: 3 }} name="PM (L)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Strategic Tasks */}
        <div className="bg-white p-8 rounded-3xl border border-slate-105 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Strategic Task Assignment</h4>
              <p className="text-xs text-slate-400 font-medium">Link operations directly to key officers</p>
            </div>

            <form onSubmit={handleSubmitTodo} className="space-y-3 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="E.g. Clear pasture sector D..."
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-slate-700 font-medium"
              />
              <div className="flex gap-2">
                <select
                  value={todoAssignee}
                  onChange={(e) => setTodoAssignee(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 font-semibold cursor-pointer"
                >
                  <option value="">-- Assign Operator (Optional) --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.unit})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-emerald-950 text-white rounded-xl px-5 py-2 flex items-center justify-center hover:bg-emerald-800 active:scale-95 transition-all shadow-sm font-black text-xs uppercase cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">All tasks completed successfully!</p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-3 rounded-xl border border-slate-100/80 transition-all ${
                      todo.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white hover:border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className="flex items-start gap-3 flex-1 text-left"
                    >
                      <span className="mt-0.5 text-emerald-800 shrink-0">
                        {todo.completed ? (
                          <CheckSquare size={16} className="fill-emerald-100" />
                        ) : (
                          <Square size={16} />
                        )}
                      </span>
                      <div>
                        <span
                          className={`text-xs text-slate-700 font-medium leading-relaxed ${
                            todo.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {todo.text}
                        </span>
                        {todo.assigneeName && (
                          <span className={`inline-block ml-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                            todo.completed ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-850 border border-emerald-100'
                          }`}>
                            👤 {todo.assigneeName}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="text-slate-300 hover:text-red-600 p-1 rounded-lg transition-colors shrink-0 m-0 cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Climate & Precision Soil Advisory Hub */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md font-mono mb-1 inline-block">
              📡 LIVE SATELLITE METEOROLOGY
            </span>
            <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider block">
              {t("Nyaronde, Nyamira County Weather & Agro-Advisory Simulator")}
            </h4>
            <p className="text-xs text-slate-450 text-slate-400 font-medium">
              Live orbital indices combined with soil moisture tension mapping for optimal agricultural compliance.
            </p>
          </div>

          {/* Dual Toggle Modes: Satellite Live vs Local Simulator */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsLiveWeather(true)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all m-0 border flex items-center gap-1.5 cursor-pointer ${
                isLiveWeather
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-900 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Sparkles size={12} className={weatherLoading ? "animate-spin" : ""} />
              <span>Live Satellite Link</span>
            </button>
            <button
              onClick={() => {
                setIsLiveWeather(false);
                setWeatherCondition('sunny');
                setSoilMoisture(42);
              }}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all m-0 border flex items-center gap-1.5 cursor-pointer ${
                !isLiveWeather
                  ? 'bg-slate-900 text-slate-300 border-slate-850 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>Field Simulator</span>
            </button>

            {/* Simulated controllers when live is off */}
            {!isLiveWeather && (
              <div className="flex gap-1 ml-2 border-l pl-2 border-slate-250">
                <button
                  onClick={() => { setWeatherCondition('sunny'); setSoilMoisture(42); }}
                  type="button"
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider m-0 ${
                    weatherCondition === 'sunny' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  ☀
                </button>
                <button
                  onClick={() => { setWeatherCondition('rainy'); setSoilMoisture(85); }}
                  type="button"
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider m-0 ${
                    weatherCondition === 'rainy' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  ☂
                </button>
                <button
                  onClick={() => { setWeatherCondition('dry-cold'); setSoilMoisture(21); }}
                  type="button"
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider m-0 ${
                    weatherCondition === 'dry-cold' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  ❄
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Display cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Climate card - showing live Open-Meteo or simulated */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${
              isLiveWeather ? 'bg-emerald-50 text-emerald-850' :
              weatherCondition === 'sunny' ? 'bg-amber-100 text-amber-800' :
              weatherCondition === 'rainy' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              <span className="text-xl font-bold font-mono">
                {isLiveWeather ? (
                  liveWeather?.current?.weather_code <= 3 ? '⛅' : 
                  liveWeather?.current?.weather_code >= 51 ? '🌧️' : '☀️'
                ) : (
                  weatherCondition === 'sunny' ? '☀' : weatherCondition === 'rainy' ? '☂' : '❄'
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider leading-none">
                {isLiveWeather ? "Satellite telemetry (Nyaronde)" : t("Simulated Climate")}
              </span>
              <h5 className="text-[14px] font-black font-mono text-slate-800 mt-1">
                {isLiveWeather ? (
                  weatherLoading ? "Linking..." :
                  liveWeather ? `${liveWeather.current.temperature_2m}°C • ${liveWeather.current.weather_code <= 3 ? "Partly Cloudy" : "Active Rain"}` : "Orbiting..."
                ) : (
                  weatherCondition === 'sunny' ? '23°C • Clear Sunny' :
                  weatherCondition === 'rainy' ? '16°C • Downpour Rain' :
                  '14°C • Frost Mist'
                )}
              </h5>
              <p className="text-[10px] text-slate-450 text-slate-400 font-bold">
                {t("Relative Humidity")}: {isLiveWeather ? (liveWeather?.current?.relative_humidity_2m ? `${liveWeather.current.relative_humidity_2m}%` : "76%") : (weatherCondition === 'sunny' ? '30%' : weatherCondition === 'rainy' ? '92%' : '65%')}
              </p>
            </div>
          </div>

          {/* Soil Moisture Control or Satellite Wind / Speed card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            {isLiveWeather ? (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider leading-none">
                  Live Atmosphere & Wind Velocity
                </span>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-bold text-slate-750 flex items-center gap-1">
                    <Wind size={12} className="text-emerald-500" /> Wind Speed
                  </span>
                  <span className="font-mono text-xs font-black text-slate-800">
                    {liveWeather ? `${liveWeather.current.wind_speed_10m} km/h` : "8.4 km/h"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-750 flex items-center gap-1">
                    <Thermometer size={12} className="text-emerald-500" /> Comfort Index
                  </span>
                  <span className="font-mono text-xs font-black text-slate-800">
                    Optimal
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider leading-none">{t("Soil Moisture Tension")}</span>
                  <span className={`font-black font-mono text-xs px-2 py-0.5 rounded ${
                    soilMoisture < 25 ? 'bg-red-100 text-red-800' :
                    soilMoisture > 75 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {soilMoisture}% {soilMoisture < 25 ? 'Low' : soilMoisture > 75 ? 'High' : 'Ideal'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-900"
                />
                <div className="flex justify-between text-[9px] text-slate-350 font-bold uppercase tracking-wider">
                  <span>{t("Dry (Dusted)")}</span>
                  <span>{t("Saturated (Log)")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Warning / Real Time satellite notification badge */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isLiveWeather ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' :
            soilMoisture < 30 || weatherCondition === 'rainy'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
          }`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block leading-none">
                {isLiveWeather ? "Satellite Health Index" : t("Smart Soil State")}
              </span>
              <p className="text-[11px] font-black mt-2 leading-snug">
                {isLiveWeather ? (
                  weatherError ? weatherError : "✔ Satellite links steady. Real-time Nyaronde crop evapotranspiration coefficients optimal."
                ) : (
                  soilMoisture < 30
                    ? '⚠️ Alert: Dry moisture levels detected! Engage drip valves immediately to bypass avocado leaf drops.'
                    : soilMoisture > 80
                    ? '✋ Saturated Soil: Hold scheduled drip irrigation runs for Fields Block-A and B.'
                    : '✔ Ideal capillary moisture pressure. Soil water release curves are optimum.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 4-Day Extended Live Satellite Feed forecast when Live is active */}
        {isLiveWeather && liveWeather && (
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs space-y-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
              7-Day Satellite Agriculture Projection
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {liveWeather.daily.time?.slice(0, 4).map((day: string, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black text-slate-500 font-mono">
                    {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xl my-1.5">
                    {liveWeather.daily.weather_code[idx] <= 3 ? '⛅' : '🌦️'}
                  </span>
                  <div className="flex gap-2 text-xs font-black">
                    <span className="text-slate-800">{liveWeather.daily.temperature_2m_max[idx]}°C</span>
                    <span className="text-slate-400 font-normal">{liveWeather.daily.temperature_2m_min[idx]}°C</span>
                  </div>
                  <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 mt-1.5 uppercase">
                    🌧️ {liveWeather.daily.precipitation_probability_max[idx]}% Rain
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Textual Advisory and Soil Treatment Dosage Optimizer calculator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Advisory card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-2">
                {`${(getStoredSettings()?.administrator || 'Dr. Devin Omwenga').toUpperCase()}'S CUSTOMIZED AGRO ADVISORY`}
              </span>
              <div className="flex gap-3">
                <span className="text-lg text-emerald-800 mt-0.5">💡</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {isLiveWeather ? (
                    liveWeather?.current?.weather_code <= 3 
                      ? "High solar radiation accelerates avocado lipid accumulation (oil conversion fraction). Keep water reserves high; review the GlobalGAP registered pesticide spray cycles in case of visual powdery mildew."
                      : "Rainfall detected. Moisture flushes are beneficial for premium tea shoots. To maintain food standards limits, delay copper sprays until wind velocity is < 10 km/h and rain halts completely."
                  ) : (
                    weatherCondition === 'sunny' ? 'Excellent avocado oil conversion. Graded harvest lines for Grade-A exporters should operate at maximum throughput. Ensure high cow safety water levels since herd dry intake rises during sunny weather.' :
                    weatherCondition === 'rainy' ? 'Positive tea flush density is expected. High damp levels increase phytophthora spread risk. Delay foliar copper sprays until rainfall stops; review the GlobalGAP sprayer quarantine logs safety criteria.' :
                    'Moderate frost hazard warning. Check mulch density across lower acreage lines. Provide warm molasses mixture water feeds to milking herds to maintain energy reserves.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Soil Treatment dosage calculator block */}
          <div className="bg-emerald-950 p-5 rounded-2xl text-emerald-100 border border-emerald-900 shadow-lg space-y-3 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-1.5">
                <Calculator size={15} className="text-yellow-400 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Soil Chem Dosage Optimizer
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/95 mt-1 leading-relaxed">
                Precision formula optimization to neutralize crop soil pH acidity levels.
              </p>

              {/* Input Selectors */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-300 block mb-1">Target Crop</label>
                  <select
                    value={calcCrop}
                    onChange={(e: any) => setCalcCrop(e.target.value)}
                    className="w-full bg-emerald-900 text-white font-black text-[10px] border border-emerald-800 rounded px-1.5 py-1 outline-hidden"
                  >
                    <option value="tea">Nyamira Tea</option>
                    <option value="avocado">Hass Avocado</option>
                    <option value="napier">Napier Grass</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-300 block mb-1">Current pH</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="9"
                    value={calcPh}
                    onChange={(e: any) => setCalcPh(e.target.value)}
                    className="w-full bg-emerald-900 text-white font-mono text-[10px] font-black border border-emerald-800 rounded px-1.5 py-1 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output box */}
            <div className="bg-emerald-990/40 border border-emerald-800/80 p-2.5 rounded-lg mt-2.5 text-[10px] space-y-1">
              <span className="text-[9px] font-mono tracking-widest uppercase font-black text-yellow-500 block">
                Recommended Action:
              </span>
              <p className="font-extrabold text-white leading-tight">
                {calcResult.dosage}
              </p>
              <p className="text-[9px] text-emerald-300 italic leading-snug pt-1">
                {calcResult.description}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Precision agricultural calculators & troubleshooting features suite launcher */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <Sparkles className="text-yellow-500 animate-pulse" size={20} />
              {isSwahili ? "Mtaaluma wa Maendeleo na Utafiti" : "Precision & Diagnostics Suite"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-normal">
              {isSwahili
                ? "Bofya zana yoyote hapa chini ili kufungua mifumo yetu mipya ya kisasa ya uchunguzi na usimamizi wa shamba."
                : "Launch agricultural modules, interactive solvers, and real-time smart troubleshooting tools designed for JR Farm."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Diagnostics Troubleshooting Wizard */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('diagnostics_sub')}
            className="group cursor-pointer bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 p-5 rounded-2xl transition-all space-y-3 relative overflow-hidden"
            id="launch-diagnostics-wizard"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-bl-full transition-all"></div>
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl w-fit">
              <Activity size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-blue-700 transition-colors">
                {isSwahili ? "Mtaaluma wa Magonjwa" : "Diagnostics Wizard"}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                Instant symptoms scanner for tomatoes, maize, avocados, cattle, & poultry with treatment SOPs.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-black uppercase tracking-wider pt-2">
              <span>{isSwahili ? "Fungua Sasa" : "Launch Checker"}</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Smart Inventory Auto Deduct */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('inventory_deduct_sub')}
            className="group cursor-pointer bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 p-5 rounded-2xl transition-all space-y-3 relative overflow-hidden"
            id="launch-inventory-deduct"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-bl-full transition-all"></div>
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl w-fit">
              <Database size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-indigo-700 transition-colors">
                {isSwahili ? "Upunguzaji wa Stoo" : "Stock Auto-Deduct"}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                Run feed mixing & chemical spraying protocols with automatic warehouse stock deductions.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-black uppercase tracking-wider pt-2">
              <span>{isSwahili ? "Tekeleza SOP" : "Simulate SOP"}</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: PHI & Breeding Timeline */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('timelines_sub')}
            className="group cursor-pointer bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 p-5 rounded-2xl transition-all space-y-3 relative overflow-hidden"
            id="launch-gestation-timelines"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-bl-full transition-all"></div>
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl w-fit">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-purple-700 transition-colors">
                {isSwahili ? "Muda wa Ngojea / Mimba" : "Gestation & PHI"}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                Visual countdown trackers for chemical spray harvest delays & artificial insemination calendars.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-purple-600 font-black uppercase tracking-wider pt-2">
              <span>{isSwahili ? "Ubao wa Muda" : "View Timelines"}</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Milk-to-Feed Profit Margin Analyser */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('analyzer_sub')}
            className="group cursor-pointer bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 p-5 rounded-2xl transition-all space-y-3 relative overflow-hidden"
            id="launch-margin-analyser"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-bl-full transition-all"></div>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl w-fit">
              <DollarSign size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-emerald-700 transition-colors">
                {isSwahili ? "Uchambuzi wa Faida" : "Milk-to-Feed Margin"}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                Recalculate exact feed-to-milk yield ratios with bio-slurry credits to boost operating P&L.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black uppercase tracking-wider pt-2">
              <span>{isSwahili ? "Chambua Faida" : "Analyse Margins"}</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* GlobalGAP Quick Warnings banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-800 rounded-xl text-yellow-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h5 className="font-extrabold text-[13px] tracking-wide uppercase text-green-300">GlobalGAP Compliance Mode Enabled</h5>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              All crop export and livestock records conform to safety restrictions. Pre-Harvest Intervals (PHI) are strictly monitored. Ensure spray records are compiled.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">G-GAP Status</p>
          <span className="inline-block mt-2 px-3 py-1 bg-emerald-900 border border-green-700 rounded-full text-xs font-black text-emerald-300">
            COMPLIANT ●
          </span>
        </div>
      </div>
    </div>
  );
}
