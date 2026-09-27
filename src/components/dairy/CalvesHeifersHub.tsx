import React, { useState } from 'react';
import { Cow, CalfRecord, HeiferRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import {
  Baby, Award, Heart, Plus, Scale, Sparkles, AlertCircle, CheckCircle2,
  Calendar, ArrowRight, Activity, TrendingUp, Info, HelpCircle,
  LayoutList, LayoutGrid, Trash2, Milk, ChevronRight, Check, ShieldCheck,
  Search, Filter, ArrowUpRight, Stethoscope
} from 'lucide-react';

interface CalvesHeifersHubProps {
  cows: Cow[];
  onAddCow: (cow: Cow) => void;
  onGoToSubTab?: (tab: any) => void;
}

export function CalvesHeifersHub({ cows, onAddCow, onGoToSubTab }: CalvesHeifersHubProps) {
  // Local state for calves & heifers stored in localStorage / state
  const [activeView, setActiveView] = useState<'calves' | 'heifers' | 'weaning_sim'>('calves');
  const [calfViewMode, setCalfViewMode] = useState<'table' | 'cards'>('table');
  const [calfSearch, setCalfSearch] = useState('');
  const [calfFilter, setCalfFilter] = useState<'all' | 'female' | 'male' | 'nursery' | 'weaned'>('all');

  // Sample or persisted calves
  const [calves, setCalves] = useState<CalfRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_dairy_calves') || localStorage.getItem('jr_farm_calves');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'calf-101',
        tag: 'CALF-C101 (Bella)',
        dam: 'Cow-101 (Daisy)',
        sire: 'SEMEN-HO-992 (Holstein Pure)',
        dob: toIsoDate(new Date(Date.now() - 35 * 86400000)), // 5 weeks old
        sex: 'Female',
        status: 'Healthy',
        weight: 52,
        notes: 'Vigorous drinker. Drinking 3L AM + 3L PM. Rumen starting on calf starter pellets.',
        colostrumFedWithin2Hours: true,
        navelDipped: true,
        disbudded: true,
        dewormed: false,
        stage: 'Pre-Weaning'
      },
      {
        id: 'calf-102',
        tag: 'CALF-C102 (Ruby Jr)',
        dam: 'Cow-103 (Ruby)',
        sire: 'SEMEN-JE-771 (Jersey Prime)',
        dob: toIsoDate(new Date(Date.now() - 14 * 86400000)), // 2 weeks old
        sex: 'Female',
        status: 'Healthy',
        weight: 34,
        notes: 'Colostrum intake verified within 2 hrs of birth. Navel treated with iodine.',
        colostrumFedWithin2Hours: true,
        navelDipped: true,
        disbudded: false,
        dewormed: false,
        stage: 'Pre-Weaning'
      },
      {
        id: 'calf-103',
        tag: 'CALF-C103 (Max Bull)',
        dam: 'Cow-102 (Goldie)',
        sire: 'SEMEN-HO-992 (Holstein Pure)',
        dob: toIsoDate(new Date(Date.now() - 55 * 86400000)), // ~8 weeks old
        sex: 'Male',
        status: 'Weaned',
        weight: 76,
        notes: 'Successfully transitioned to grower meal & wilted sweet potato vines.',
        colostrumFedWithin2Hours: true,
        navelDipped: true,
        disbudded: true,
        dewormed: true,
        stage: 'Weaned'
      }
    ];
  });

  // Sample or persisted replacement heifers
  const [heifers, setHeifers] = useState<HeiferRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_dairy_heifers') || localStorage.getItem('jr_farm_heifers');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'heifer-201',
        tag: 'H-201 (Princess)',
        breed: 'Holstein-Friesian',
        dob: toIsoDate(new Date(Date.now() - 420 * 86400000)), // 14 months old
        girth: 154,
        weight: 305,
        sire: 'SEMEN-HO-992',
        dam: 'Cow-101 (Daisy)',
        status: 'Ready for Service',
        notes: 'Target liveweight reached (>300kg). Standing heat expected soon for first AI service.'
      },
      {
        id: 'heifer-202',
        tag: 'H-202 (Buttercup)',
        breed: 'Jersey',
        dob: toIsoDate(new Date(Date.now() - 360 * 86400000)), // 12 months old
        girth: 142,
        weight: 250,
        sire: 'SEMEN-JE-771',
        dam: 'Cow-102 (Goldie)',
        status: 'Growing',
        notes: 'Superb skeletal frame. Currently on Rhodes grass hay + dairy heifer ration.'
      },
      {
        id: 'heifer-203',
        tag: 'H-203 (Duchess)',
        breed: 'Ayrshire',
        dob: toIsoDate(new Date(Date.now() - 510 * 86400000)), // 17 months old
        girth: 160,
        weight: 335,
        sire: 'SEMEN-AYR-404',
        dam: 'Cow-103 (Ruby)',
        status: 'In-Calf',
        notes: 'Confirmed in-calf to Sexed Female Ayrshire. Due in 5 months.'
      }
    ];
  });

  const saveCalves = (newCalves: CalfRecord[]) => {
    setCalves(newCalves);
    try {
      localStorage.setItem('jr_farm_dairy_calves', JSON.stringify(newCalves));
      localStorage.setItem('jr_farm_calves', JSON.stringify(newCalves));
      window.dispatchEvent(new Event('local-storage-update'));
    } catch {}
  };

  const saveHeifers = (newHeifers: HeiferRecord[]) => {
    setHeifers(newHeifers);
    try {
      localStorage.setItem('jr_farm_dairy_heifers', JSON.stringify(newHeifers));
      localStorage.setItem('jr_farm_heifers', JSON.stringify(newHeifers));
      window.dispatchEvent(new Event('local-storage-update'));
    } catch {}
  };

  // Weaning Simulator Parameters
  const [simBirthWeight, setSimBirthWeight] = useState(35);
  const [simTargetWeaningWeeks, setSimTargetWeaningWeeks] = useState(10);
  const targetWeanWeight = simBirthWeight * 2;
  const daysToWean = simTargetWeaningWeeks * 7;
  const reqDailyGainGrams = Math.round(((targetWeanWeight - simBirthWeight) * 1000) / daysToWean);

  // Form states for adding calf
  const [showAddCalfModal, setShowAddCalfModal] = useState(false);
  const [newCalfTag, setNewCalfTag] = useState('');
  const [newCalfDam, setNewCalfDam] = useState('');
  const [newCalfSire, setNewCalfSire] = useState('');
  const [newCalfDob, setNewCalfDob] = useState(toIsoDate());
  const [newCalfSex, setNewCalfSex] = useState<'Female' | 'Male'>('Female');
  const [newCalfWeight, setNewCalfWeight] = useState<number | ''>(36);
  const [newCalfNotes, setNewCalfNotes] = useState('');

  // Form states for adding heifer
  const [showAddHeiferModal, setShowAddHeiferModal] = useState(false);
  const [newHeiferTag, setNewHeiferTag] = useState('');
  const [newHeiferBreed, setNewHeiferBreed] = useState('Holstein-Friesian');
  const [newHeiferDob, setNewHeiferDob] = useState(toIsoDate(new Date(Date.now() - 365 * 86400000)));
  const [newHeiferGirth, setNewHeiferGirth] = useState<number | ''>(145);
  const [newHeiferWeight, setNewHeiferWeight] = useState<number | ''>(260);
  const [newHeiferSire, setNewHeiferSire] = useState('');
  const [newHeiferDam, setNewHeiferDam] = useState('');
  const [newHeiferNotes, setNewHeiferNotes] = useState('');

  // Handle Graduate Heifer to Adult Cow Registry
  const handleGraduateHeifer = (h: HeiferRecord) => {
    const newAdultCow: Cow = {
      id: h.tag.split(' ')[0] || `COW-${Date.now().toString().slice(-4)}`,
      name: h.tag,
      breed: h.breed,
      dob: h.dob,
      status: 'Lactating',
      gender: 'Female',
      notes: `Graduated from Heifer Progeny board. Dam: ${h.dam || 'N/A'}, Sire: ${h.sire || 'N/A'}. Final recorded heifer liveweight: ${h.weight}kg.`,
      sire: h.sire,
      dam: h.dam,
      peakYieldTarget: 32
    };

    onAddCow(newAdultCow);
    const remaining = heifers.filter(item => item.id !== h.id);
    saveHeifers(remaining);
    alert(`🎉 Successfully graduated ${h.tag} into the active Adult Cow Registry as a lactating dairy cow!`);
    if (onGoToSubTab) onGoToSubTab('registry');
  };

  // Promote Calf directly to Replacement Heifers Pipeline
  const handlePromoteCalfToHeifer = (calf: CalfRecord) => {
    const currentWt = calf.weight || 70;
    const isServiceReady = currentWt >= 290;
    const newHeiferTag = calf.tag.startsWith('CALF-')
      ? calf.tag.replace(/^CALF-/, 'H-')
      : `H-${calf.tag}`;

    const newHeifer: HeiferRecord = {
      id: `heifer-${Date.now()}`,
      tag: newHeiferTag,
      breed: calf.breed || 'Holstein / Dairy Cross',
      dob: calf.dob,
      girth: calf.girthCm || Math.min(155, Math.round(75 + currentWt * 0.65)),
      weight: currentWt,
      sire: calf.sire,
      dam: calf.dam,
      status: isServiceReady ? 'Ready for Service' : 'Growing',
      notes: `Promoted from nursery liquid-fed calf. Weaning weight: ${currentWt}kg. ${calf.notes || ''}`
    };

    saveHeifers([...heifers, newHeifer]);
    saveCalves(calves.filter(c => c.id !== calf.id));
    alert(`🎉 Success! ${calf.tag} has graduated from the Nursery and entered the Replacement Heifer Pipeline as "${newHeifer.tag}".`);
    setActiveView('heifers');
  };

  // Shortcut to log veterinary health treatment for calf or heifer
  const handleLogVetForAnimal = (tag: string) => {
    localStorage.setItem('jr_farm_preselected_vet_animal', tag);
    if (onGoToSubTab) onGoToSubTab('veterinary');
  };

  // Quick liveweight logger
  const handleUpdateCalfWeight = (calf: CalfRecord) => {
    const promptVal = prompt(`Enter updated liveweight for ${calf.tag} (kg):`, String(calf.weight || 45));
    if (promptVal && !isNaN(Number(promptVal))) {
      const newWeight = Math.max(15, Number(promptVal));
      const isNowWeaned = newWeight >= 70 || calf.status === 'Weaned';
      const updated = calves.map(c =>
        c.id === calf.id
          ? {
              ...c,
              weight: newWeight,
              currentWeightKg: newWeight,
              status: isNowWeaned ? 'Weaned' : c.status
            }
          : c
      );
      saveCalves(updated);
    }
  };

  // Toggle clinical milestones
  const handleToggleMilestone = (calfId: string, field: 'navelDipped' | 'colostrumFedWithin2Hours' | 'disbudded' | 'dewormed') => {
    const updated = calves.map(c => {
      if (c.id === calfId) {
        return { ...c, [field]: !c[field] };
      }
      return c;
    });
    saveCalves(updated);
  };

  // Toggle milk intake / weaning step-down
  const handleToggleMilkStatus = (calf: CalfRecord) => {
    const isCurrentlyWeaned = calf.status === 'Weaned';
    const nextStatus = isCurrentlyWeaned ? 'Healthy' : 'Weaned';
    const updated = calves.map(c => (c.id === calf.id ? { ...c, status: nextStatus } : c));
    saveCalves(updated);
  };

  // Delete calf
  const handleDeleteCalf = (id: string, tag: string) => {
    if (window.confirm(`Are you sure you want to remove calf "${tag}" from the nursery?`)) {
      saveCalves(calves.filter(c => c.id !== id));
    }
  };

  // Age calculators
  const calcAgeDays = (dobStr: string) => {
    const diff = Date.now() - new Date(dobStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const calcAgeWeeks = (dobStr: string) => {
    const diff = Date.now() - new Date(dobStr).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24 * 7)));
  };

  // Filtered calves list
  const filteredCalves = calves.filter(calf => {
    const query = calfSearch.toLowerCase();
    const matchesSearch =
      calf.tag.toLowerCase().includes(query) ||
      (calf.dam && calf.dam.toLowerCase().includes(query)) ||
      (calf.sire && calf.sire.toLowerCase().includes(query)) ||
      (calf.notes && calf.notes.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (calfFilter === 'female') return calf.sex === 'Female';
    if (calfFilter === 'male') return calf.sex === 'Male';
    if (calfFilter === 'weaned') return calf.status === 'Weaned' || (calf.weight || 0) >= 70;
    if (calfFilter === 'nursery') return calf.status !== 'Weaned' && (calf.weight || 0) < 70;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xl font-bold shrink-0">
            🍼
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Nursery Calves</span>
            <span className="text-2xl font-black text-gray-900">{calves.length}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Liquid milk phase</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 text-xl font-bold shrink-0">
            🐄
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Replacement Heifers</span>
            <span className="text-2xl font-black text-gray-900">{heifers.length}</span>
            <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">Growing progeny</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xl font-bold shrink-0">
            ⚖️
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Service Ready Heifers</span>
            <span className="text-2xl font-black text-gray-900">
              {heifers.filter(h => (h.weight || 0) >= 290 || h.status === 'Ready for Service').length}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">Weight &gt; 290kg (AI Ready)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-xl font-bold shrink-0">
            📊
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Target ADG Growth</span>
            <span className="text-2xl font-black text-gray-900">+700g</span>
            <span className="text-[11px] text-purple-600 font-semibold block mt-0.5">Daily liveweight gain</span>
          </div>
        </div>
      </div>

      {/* Visual Calf-to-Heifer Lifecycle Pipeline Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  Calf-to-Heifer Rearing Pipeline
                  <span className="text-[10px] font-normal uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    24-Month Roadmap
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-100/70">
                  Track female progeny from nursery milk feeding into replacement heifers, breeding readiness, and first lactation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-200/80 font-mono">
              <span>Nursery Calves: <strong className="text-white">{calves.length}</strong></span>
              <span>•</span>
              <span>Heifers: <strong className="text-white">{heifers.length}</strong></span>
              <span>•</span>
              <span>AI Ready: <strong className="text-white">{heifers.filter(h => (h.weight || 0) >= 290).length}</strong></span>
            </div>
          </div>

          {/* 6-Stage Progression Flow */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1 text-left">
            <div 
              onClick={() => setActiveView('calves')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                activeView === 'calves' 
                  ? 'bg-emerald-500/25 border-emerald-400 text-white ring-1 ring-emerald-400' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/90'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-emerald-400">Stage 1</span>
                <span className="text-xs">🍼</span>
              </div>
              <div className="text-xs font-bold text-white">Nursery Liquid Milk</div>
              <div className="text-[10px] text-emerald-200/80 font-mono">0 – 8 Weeks</div>
              <p className="text-[10px] text-white/60 mt-1 line-clamp-2">6L Milk/day + 10% Colostrum in 2 hrs. Navel dip & disbud.</p>
            </div>

            <div 
              onClick={() => setActiveView('calves')}
              className="p-2.5 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white/90 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-amber-400">Stage 2</span>
                <span className="text-xs">⚖️</span>
              </div>
              <div className="text-xs font-bold text-white">Weaning Gate</div>
              <div className="text-[10px] text-amber-200/80 font-mono">8 – 12 Weeks</div>
              <p className="text-[10px] text-white/60 mt-1 line-clamp-2">Target &gt;70kg (2x birth wt) & 1.5kg calf pellets/day. Promote to heifer.</p>
            </div>

            <div 
              onClick={() => setActiveView('heifers')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                activeView === 'heifers' 
                  ? 'bg-indigo-500/25 border-indigo-400 text-white ring-1 ring-indigo-400' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/90'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-indigo-400">Stage 3</span>
                <span className="text-xs">🌿</span>
              </div>
              <div className="text-xs font-bold text-white">Growing Heifer</div>
              <div className="text-[10px] text-indigo-200/80 font-mono">3 – 12 Months</div>
              <p className="text-[10px] text-white/60 mt-1 line-clamp-2">Forage + 16% CP heifer meal. Frame development (+700g/d ADG).</p>
            </div>

            <div 
              onClick={() => setActiveView('heifers')}
              className="p-2.5 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white/90 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-emerald-400">Stage 4</span>
                <span className="text-xs">🎯</span>
              </div>
              <div className="text-xs font-bold text-white">AI Service Ready</div>
              <div className="text-[10px] text-emerald-200/80 font-mono">12 – 15 Months</div>
              <p className="text-[10px] text-white/60 mt-1 line-clamp-2">Target &gt;290kg liveweight / 150cm girth. Inseminate with sexed semen.</p>
            </div>

            <div 
              onClick={() => setActiveView('heifers')}
              className="p-2.5 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white/90 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-purple-400">Stage 5</span>
                <span className="text-xs">🤰</span>
              </div>
              <div className="text-xs font-bold text-white">In-Calf Heifer</div>
              <div className="text-[10px] text-purple-200/80 font-mono">15 – 24 Months</div>
              <p className="text-[10px] text-white/60 mt-1 line-clamp-2">Gestation monitoring & lead feeding 3 weeks before expected calving.</p>
            </div>

            <div 
              onClick={() => onGoToSubTab && onGoToSubTab('registry')}
              className="p-2.5 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white/90 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-amber-300">Stage 6</span>
                <span className="text-xs">🥛</span>
              </div>
              <div className="text-xs font-bold text-white">Milking Cow Herd</div>
              <div className="text-[10px] text-amber-200/80 font-mono">24 Months+</div>
              <p className="text-[10px] text-white/60 mt-1 line-clamp-2">First calving. Graduates to Adult Cow Registry & milk recording.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveView('calves')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'calves'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Baby size={14} className="text-emerald-600" />
            Liquid-Fed Calves ({calves.length})
          </button>
          <button
            onClick={() => setActiveView('heifers')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'heifers'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Award size={14} className="text-indigo-600" />
            Replacement Heifers ({heifers.length})
          </button>
          <button
            onClick={() => setActiveView('weaning_sim')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'weaning_sim'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Scale size={14} className="text-amber-600" />
            Growth & Weaning Science
          </button>
        </div>

        <div>
          {activeView === 'calves' && (
            <button
              onClick={() => setShowAddCalfModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} /> Log Newborn Calf
            </button>
          )}
          {activeView === 'heifers' && (
            <button
              onClick={() => setShowAddHeiferModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Heifer Progeny
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: LIQUID FED CALVES */}
      {activeView === 'calves' && (
        <div className="space-y-4">
          {/* Best practice callout banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex items-start gap-3">
            <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <span className="font-bold">Colostrum & Nursery Golden Rule:</span> Every calf must receive <strong>10% of body weight (3-4 Liters)</strong> of high-quality maternal colostrum within the first 2 hours of life for passive immunity transfer. Wean only when consuming at least 1.5kg of calf starter pellets daily and body weight has doubled (&ge;70kg), then graduate them into the Replacement Heifers pipeline.
            </div>
          </div>

          {/* Subheader Toolbar: Search, Filters & View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calf tag, dam, sire..."
                  value={calfSearch}
                  onChange={e => setCalfSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-emerald-500 focus:bg-white w-48 sm:w-60"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-semibold">
                <button
                  onClick={() => setCalfFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    calfFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({calves.length})
                </button>
                <button
                  onClick={() => setCalfFilter('female')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    calfFilter === 'female' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ♀ Heifer Track ({calves.filter(c => c.sex === 'Female').length})
                </button>
                <button
                  onClick={() => setCalfFilter('nursery')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    calfFilter === 'nursery' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🍼 Liquid Phase ({calves.filter(c => c.status !== 'Weaned' && (c.weight || 0) < 70).length})
                </button>
                <button
                  onClick={() => setCalfFilter('weaned')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    calfFilter === 'weaned' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🌿 Weaned ({calves.filter(c => c.status === 'Weaned' || (c.weight || 0) >= 70).length})
                </button>
              </div>
            </div>

            {/* List / Cards View Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-end md:self-auto">
              <button
                onClick={() => setCalfViewMode('table')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  calfViewMode === 'table'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Switch to List/Table View"
              >
                <LayoutList size={14} className={calfViewMode === 'table' ? 'text-emerald-600' : ''} />
                <span>List View</span>
              </button>
              <button
                onClick={() => setCalfViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  calfViewMode === 'cards'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Switch to Cards View"
              >
                <LayoutGrid size={14} className={calfViewMode === 'cards' ? 'text-emerald-600' : ''} />
                <span>Cards View</span>
              </button>
            </div>
          </div>

          {/* TABLE / LIST VIEW (DEFAULT) */}
          {calfViewMode === 'table' && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                      <th className="p-3.5">Calf Tag & Sex</th>
                      <th className="p-3.5">Age & DOB</th>
                      <th className="p-3.5">Pedigree Lineage</th>
                      <th className="p-3.5">Liveweight & Growth</th>
                      <th className="p-3.5">Milk Intake & Diet</th>
                      <th className="p-3.5">Veterinary Milestones</th>
                      <th className="p-3.5">Heifer Pipeline Stage</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCalves.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                          No calves found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCalves.map(calf => {
                        const ageWks = calcAgeWeeks(calf.dob);
                        const ageDays = calcAgeDays(calf.dob);
                        const currentWt = calf.weight || 35;
                        const isWeaned = calf.status === 'Weaned' || currentWt >= 70;
                        const weanProgress = Math.min(100, Math.round((currentWt / 70) * 100));
                        const isFemale = calf.sex === 'Female';
                        const isReadyForHeifer = isFemale && (currentWt >= 65 || isWeaned);

                        return (
                          <tr key={calf.id} className="hover:bg-gray-50/70 transition-colors">
                            {/* Tag & Animal */}
                            <td className="p-3.5 font-bold text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isFemale ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {isFemale ? '♀' : '♂'}
                                </div>
                                <div>
                                  <span className="text-gray-900 font-bold block">{calf.tag}</span>
                                  <span className="text-[10px] text-gray-400 font-normal truncate max-w-[140px] block">
                                    {calf.notes || 'Nursery progeny'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Age & DOB */}
                            <td className="p-3.5">
                              <span className="font-semibold text-gray-800 block">{ageWks} wks ({ageDays}d)</span>
                              <span className="text-[10px] text-gray-400 font-mono block">DOB: {calf.dob}</span>
                            </td>

                            {/* Pedigree */}
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                                  <strong className="text-gray-700">Dam:</strong> {calf.dam || '—'}
                                </span>
                                <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                                  <strong className="text-gray-700">Sire:</strong> {calf.sire || 'AI Straw'}
                                </span>
                              </div>
                            </td>

                            {/* Liveweight & Progress to Weaning */}
                            <td className="p-3.5">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-gray-900">{currentWt} kg</span>
                                  <button
                                    onClick={() => handleUpdateCalfWeight(calf)}
                                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                                    title="Click to update liveweight"
                                  >
                                    ⚖️ Log
                                  </button>
                                </div>
                                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-200">
                                  <div
                                    className={`h-full rounded-full ${
                                      currentWt >= 70 ? 'bg-emerald-500' : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${weanProgress}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400 block font-mono">
                                  {currentWt >= 70 ? 'Target doubled (70kg)' : `${70 - currentWt}kg to weaning gate`}
                                </span>
                              </div>
                            </td>

                            {/* Milk Intake & Protocol */}
                            <td className="p-3.5">
                              <div className="space-y-1">
                                {isWeaned ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                    🌿 Weaned (Starter Meal)
                                  </span>
                                ) : ageWks >= 7 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <Milk size={11} /> 2.0 L/day (Step-down)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <Milk size={11} /> 6.0 L/day (3L AM/PM)
                                  </span>
                                )}
                                <button
                                  onClick={() => handleToggleMilkStatus(calf)}
                                  className="text-[9px] text-gray-400 hover:text-gray-700 underline block"
                                >
                                  {isWeaned ? 'Revert to milk' : 'Mark as weaned'}
                                </button>
                              </div>
                            </td>

                            {/* Clinical Milestones (Interactive toggles) */}
                            <td className="p-3.5">
                              <div className="flex flex-wrap gap-1 max-w-[140px]">
                                <button
                                  onClick={() => handleToggleMilestone(calf.id, 'colostrumFedWithin2Hours')}
                                  title="Colostrum fed within 2h"
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border cursor-pointer ${
                                    calf.colostrumFedWithin2Hours
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-100 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  🍼 Colostrum {calf.colostrumFedWithin2Hours && '✓'}
                                </button>
                                <button
                                  onClick={() => handleToggleMilestone(calf.id, 'navelDipped')}
                                  title="Navel dipped with 7% iodine"
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border cursor-pointer ${
                                    calf.navelDipped
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-100 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  🩹 Navel {calf.navelDipped && '✓'}
                                </button>
                                <button
                                  onClick={() => handleToggleMilestone(calf.id, 'disbudded')}
                                  title="Disbudded / Horn buds cauterized (2-4 wks)"
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border cursor-pointer ${
                                    calf.disbudded
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-gray-100 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  ✂️ Disbud {calf.disbudded && '✓'}
                                </button>
                                <button
                                  onClick={() => handleToggleMilestone(calf.id, 'dewormed')}
                                  title="Dewormed at weaning"
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border cursor-pointer ${
                                    calf.dewormed
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-100 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  💊 Deworm {calf.dewormed && '✓'}
                                </button>
                              </div>
                            </td>

                            {/* Heifer Pipeline Stage */}
                            <td className="p-3.5">
                              {isFemale ? (
                                isReadyForHeifer ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                                    <Sparkles size={11} className="text-indigo-600" /> Ready for Heifers Board
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    🍼 Pre-Weaning Nursery
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  🐂 Bull Calf Track
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleUpdateCalfWeight(calf)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                                title="Update liveweight"
                              >
                                ⚖️ Weight
                              </button>

                              <button
                                onClick={() => handleLogVetForAnimal(calf.tag)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                                title="Log illness, fever, or medication in Veterinary Log"
                              >
                                <Stethoscope size={11} />
                                <span>Vet Log</span>
                              </button>

                              {isFemale && (
                                <button
                                  onClick={() => handlePromoteCalfToHeifer(calf)}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1 ${
                                    isReadyForHeifer
                                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-xs ring-1 ring-indigo-400'
                                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                                  }`}
                                  title="Promote to Replacement Heifers Pipeline"
                                >
                                  <span>Promote to Heifer</span>
                                  <ArrowRight size={11} />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteCalf(calf.id, calf.tag)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                title="Delete calf record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARDS VIEW (ALTERNATIVE) */}
          {calfViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredCalves.map(calf => {
                const currentWt = calf.weight || 35;
                const isFemale = calf.sex === 'Female';
                const isReady = isFemale && (currentWt >= 65 || calf.status === 'Weaned');

                return (
                  <div key={calf.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isFemale ? 'text-pink-700 bg-pink-50 border-pink-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                        }`}>
                          {calf.sex} {isFemale ? 'Heifer Track' : 'Bull Calf'}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-1">{calf.tag}</h4>
                        <span className="text-xs text-gray-500 font-medium">Age: {calcAgeWeeks(calf.dob)} weeks ({calcAgeDays(calf.dob)} days)</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        calf.status === 'Weaned' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {calf.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold">Current Weight</span>
                        <span className="font-black text-gray-900 text-sm">{currentWt} kg</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold">Milk Intake</span>
                        <span className="font-bold text-emerald-600 text-xs">
                          {calf.status === 'Weaned' ? 'Weaned / Pellets' : '5 - 6 Liters/day'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold">Dam (Mother)</span>
                        <span className="font-medium text-gray-700 truncate block">{calf.dam || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold">Sire (Father)</span>
                        <span className="font-medium text-gray-700 truncate block">{calf.sire || 'AI Semen'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[9px]">
                      <span className={`px-2 py-0.5 rounded border font-semibold ${calf.colostrumFedWithin2Hours ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        🍼 Colostrum {calf.colostrumFedWithin2Hours ? '✓' : '—'}
                      </span>
                      <span className={`px-2 py-0.5 rounded border font-semibold ${calf.navelDipped ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        🩹 Navel {calf.navelDipped ? '✓' : '—'}
                      </span>
                      <span className={`px-2 py-0.5 rounded border font-semibold ${calf.disbudded ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        ✂️ Disbud {calf.disbudded ? '✓' : '—'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 italic bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                      "{calf.notes}"
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <button
                        onClick={() => handleUpdateCalfWeight(calf)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                      >
                        ⚖️ Update Weight
                      </button>

                      <button
                        onClick={() => handleLogVetForAnimal(calf.tag)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                        title="Log sick calf in Veterinary Log"
                      >
                        <Stethoscope size={12} />
                        <span>Vet Log</span>
                      </button>

                      {isFemale && (
                        <button
                          onClick={() => handlePromoteCalfToHeifer(calf)}
                          className={`text-xs font-bold flex items-center gap-1 cursor-pointer ${
                            isReady ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-600 hover:text-indigo-700'
                          }`}
                        >
                          Promote to Heifer <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REPLACEMENT HEIFERS */}
      {activeView === 'heifers' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-200/70 p-4 rounded-2xl flex items-start gap-3">
            <Award size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900">
              <span className="font-bold">Replacement Heifer Breeding Benchmark:</span> Heifers represent tomorrow's high-yielding milkers. Inseminate at <strong>14-16 months</strong> when chest girth reaches <strong>150-155 cm (290-310 kg liveweight)</strong>. Target first calving at 24 months to minimize rearing costs.
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">Heifer Tag / Name</th>
                    <th className="p-3.5">Breed</th>
                    <th className="p-3.5">Age</th>
                    <th className="p-3.5">Chest Girth (cm)</th>
                    <th className="p-3.5">Liveweight (kg)</th>
                    <th className="p-3.5">Breeding Readiness</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {heifers.map(heifer => {
                    const isServiceReady = (heifer.weight || 0) >= 290;
                    return (
                      <tr key={heifer.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900">
                          <span className="text-indigo-700 block">{heifer.tag}</span>
                          <span className="text-[10px] text-gray-400 font-normal">Dam: {heifer.dam || '—'}</span>
                        </td>
                        <td className="p-3.5 font-medium text-gray-600">{heifer.breed}</td>
                        <td className="p-3.5 font-mono text-gray-700">{calcAgeWeeks(heifer.dob)} wks</td>
                        <td className="p-3.5 font-mono text-gray-700">{heifer.girth || '—'} cm</td>
                        <td className="p-3.5 font-mono font-bold text-gray-900">
                          {heifer.weight ? `${heifer.weight} kg` : '—'}
                        </td>
                        <td className="p-3.5">
                          {isServiceReady ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={11} /> Ready to Inseminate (&gt;290kg)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Activity size={11} /> Growing (+{290 - (heifer.weight || 0)}kg needed)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-700">{heifer.status}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleLogVetForAnimal(heifer.tag)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Log illness, deworming, or vaccine for heifer in Veterinary Log"
                          >
                            <Stethoscope size={11} />
                            <span>Vet Log</span>
                          </button>
                          {isServiceReady && heifer.status !== 'In-Calf' && (
                            <button
                              onClick={() => {
                                if (onGoToSubTab) onGoToSubTab('breeding_ledger');
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                            >
                              Log AI Service
                            </button>
                          )}
                          <button
                            onClick={() => handleGraduateHeifer(heifer)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                            title="Promote to Adult Dairy Cow Registry"
                          >
                            Graduate to Cow Registry 🎓
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GROWTH & WEANING SCIENCE SIMULATOR */}
      {activeView === 'weaning_sim' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
              ⚖️
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Bovine Weaning & Average Daily Gain (ADG) Modeler</h4>
              <p className="text-xs text-gray-500">Calculate required daily growth rates to meet optimal puberty and lactation targets.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5 bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <span className="text-xs font-bold text-gray-900 block">Simulation Variables</span>
              
              <div>
                <label className="text-xs font-semibold text-gray-700 flex justify-between mb-1">
                  <span>Calf Birth Weight</span>
                  <span className="font-mono text-emerald-700 font-bold">{simBirthWeight} kg</span>
                </label>
                <input
                  type="range"
                  min="25"
                  max="50"
                  value={simBirthWeight}
                  onChange={e => setSimBirthWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 flex justify-between mb-1">
                  <span>Target Weaning Age</span>
                  <span className="font-mono text-indigo-700 font-bold">{simTargetWeaningWeeks} Weeks ({daysToWean} Days)</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="16"
                  value={simTargetWeaningWeeks}
                  onChange={e => setSimTargetWeaningWeeks(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-900 block">Veterinary Science Targets</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Target Weaning Weight</span>
                  <span className="text-2xl font-black text-emerald-900">{targetWeanWeight} kg</span>
                  <span className="text-[10px] text-emerald-700 block mt-1">2x Birth Weight</span>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Required ADG</span>
                  <span className="text-2xl font-black text-indigo-900">+{reqDailyGainGrams} g/day</span>
                  <span className="text-[10px] text-indigo-700 block mt-1">Average Daily Gain</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs text-gray-600">
                <span className="font-bold text-gray-900 block">Nutritional Pathway to Achieve Target:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Weeks 1-4:</strong> 6 Liters whole milk/day (divided into 2-3 warm feeds at 38°C) + clean water + handful of 20% CP starter pellets.</li>
                  <li><strong>Weeks 5-8:</strong> 4 Liters milk/day + unrestricted high-energy calf starter + clean hay/alfalfa.</li>
                  <li><strong>Weeks 9-10 (Weaning step-down):</strong> 2 Liters milk/day for 7 days, then stop once eating 1.5kg calf pellets consistently.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Calf */}
      {showAddCalfModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              🍼 Register Newborn Nursery Calf
            </h4>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newCalfTag.trim()) return;
                const newCalf: CalfRecord = {
                  id: `calf-${Date.now()}`,
                  tag: newCalfTag.trim(),
                  dam: newCalfDam.trim() || 'Unspecified Dam',
                  sire: newCalfSire.trim() || 'AI Semen Straw',
                  dob: newCalfDob,
                  sex: newCalfSex,
                  status: 'Healthy',
                  weight: Number(newCalfWeight) || 35,
                  notes: newCalfNotes.trim() || 'Vigorous newborn'
                };
                saveCalves([...calves, newCalf]);
                setShowAddCalfModal(false);
                setNewCalfTag('');
                setNewCalfNotes('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Calf Tag / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CALF-C104 (Bella Jr)"
                  value={newCalfTag}
                  onChange={e => setNewCalfTag(e.target.value)}
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Dam (Mother)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cow-101"
                    value={newCalfDam}
                    onChange={e => setNewCalfDam(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Sire (Father)</label>
                  <input
                    type="text"
                    placeholder="e.g. SEMEN-HO-992"
                    value={newCalfSire}
                    onChange={e => setNewCalfSire(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Birth Date</label>
                  <input
                    type="date"
                    required
                    value={newCalfDob}
                    onChange={e => setNewCalfDob(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Sex</label>
                  <select
                    value={newCalfSex}
                    onChange={e => setNewCalfSex(e.target.value as any)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2"
                  >
                    <option value="Female">Female (Heifer)</option>
                    <option value="Male">Male (Bull)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Birth Wt (kg)</label>
                  <input
                    type="number"
                    value={newCalfWeight}
                    onChange={e => setNewCalfWeight(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Notes / Colostrum Timing</label>
                <input
                  type="text"
                  placeholder="e.g. Received 3.5L colostrum within 90 minutes. Active suckling."
                  value={newCalfNotes}
                  onChange={e => setNewCalfNotes(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCalfModal(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Save Calf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Heifer */}
      {showAddHeiferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              🐄 Register Replacement Heifer
            </h4>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newHeiferTag.trim()) return;
                const newH: HeiferRecord = {
                  id: `heifer-${Date.now()}`,
                  tag: newHeiferTag.trim(),
                  breed: newHeiferBreed,
                  dob: newHeiferDob,
                  girth: Number(newHeiferGirth) || 140,
                  weight: Number(newHeiferWeight) || 260,
                  sire: newHeiferSire.trim() || undefined,
                  dam: newHeiferDam.trim() || undefined,
                  status: (Number(newHeiferWeight) || 260) >= 290 ? 'Ready for Service' : 'Growing',
                  notes: newHeiferNotes.trim() || 'Healthy growing dairy replacement heifer.'
                };
                saveHeifers([...heifers, newH]);
                setShowAddHeiferModal(false);
                setNewHeiferTag('');
                setNewHeiferNotes('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Heifer Tag / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. H-204 (Queenie)"
                  value={newHeiferTag}
                  onChange={e => setNewHeiferTag(e.target.value)}
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Breed</label>
                  <select
                    value={newHeiferBreed}
                    onChange={e => setNewHeiferBreed(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                  >
                    <option value="Holstein-Friesian">Holstein-Friesian</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Ayrshire">Ayrshire</option>
                    <option value="Guernsey">Guernsey</option>
                    <option value="Friesian Cross">Friesian Cross</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newHeiferDob}
                    onChange={e => setNewHeiferDob(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Chest Girth (cm)</label>
                  <input
                    type="number"
                    value={newHeiferGirth}
                    onChange={e => setNewHeiferGirth(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Liveweight (kg)</label>
                  <input
                    type="number"
                    value={newHeiferWeight}
                    onChange={e => setNewHeiferWeight(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Dam (Mother)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cow-101"
                    value={newHeiferDam}
                    onChange={e => setNewHeiferDam(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Sire (Father)</label>
                  <input
                    type="text"
                    placeholder="e.g. SEMEN-HO-992"
                    value={newHeiferSire}
                    onChange={e => setNewHeiferSire(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Notes / Diet</label>
                <input
                  type="text"
                  placeholder="e.g. Fed silage + Rhodes grass hay. Good body condition score 3.25."
                  value={newHeiferNotes}
                  onChange={e => setNewHeiferNotes(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHeiferModal(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Save Heifer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
