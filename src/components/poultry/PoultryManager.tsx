import React, { useState, useEffect } from 'react';
import {
  PoultryFlock, PoultryEggRecord, PoultryHealthRecord,
  PoultryMortalityRecord, PoultryRecord, StaffMember
} from '../../types';
import {
  INITIAL_POULTRY_FLOCKS,
  INITIAL_POULTRY_EGGS,
  INITIAL_POULTRY_HEALTH,
  INITIAL_POULTRY_MORTALITY
} from '../../data/poultryInitialData';
import { PoultryFlockRegistry } from './PoultryFlockRegistry';
import { PoultryEggHub } from './PoultryEggHub';
import { PoultryHealthHub } from './PoultryHealthHub';
import { PoultryMortalityHub } from './PoultryMortalityHub';
import { PoultryAdvisoryHub } from './PoultryAdvisoryHub';
import { generatePoultryAuditPdf } from './PoultryPdfGenerator';
import { toIsoDate } from '../../utils/dateHelper';
import { setPersistentData } from '../../utils/storageDb';
import { REMOTE_SYNC_APPLIED_EVENT } from '../../context/FarmContext';
import {
  Layers, Egg, Stethoscope, AlertTriangle, BookOpen,
  Download, Share2, Plus, Sparkles, TrendingUp
} from 'lucide-react';

interface PoultryManagerProps {
  legacyPoultryRecords?: PoultryRecord[];
  onAddLegacyPoultry?: (rec: PoultryRecord) => void;
  onDeleteLegacyPoultry?: (id: string) => void;
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type PoultryTab = 'flocks' | 'eggs' | 'health' | 'mortality' | 'advisory';

export function PoultryManager({
  legacyPoultryRecords = [],
  onAddLegacyPoultry,
  onDeleteLegacyPoultry,
  staffList = [],
  onTriggerSectionReport
}: PoultryManagerProps) {
  const [activeTab, setActiveTab] = useState<PoultryTab>('flocks');

  // 1. Poultry Flocks State
  const [flocks, setFlocks] = useState<PoultryFlock[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_poultry_flocks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_POULTRY_FLOCKS;
  });

  // 2. Poultry Egg Records State
  const [eggRecords, setEggRecords] = useState<PoultryEggRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_poultry_eggs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_POULTRY_EGGS;
  });

  // 3. Poultry Health Records State
  const [healthRecords, setHealthRecords] = useState<PoultryHealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_poultry_health');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_POULTRY_HEALTH;
  });

  // 4. Poultry Mortality & Culling Records State
  const [mortalityRecords, setMortalityRecords] = useState<PoultryMortalityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_poultry_mortality');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_POULTRY_MORTALITY;
  });

  // Preselected flock for cross-hub routing
  const [targetedFlock, setTargetedFlock] = useState<PoultryFlock | null>(null);

  // Persistence
  useEffect(() => {
    setPersistentData('jr_farm_poultry_flocks', flocks);
  }, [flocks]);

  useEffect(() => {
    setPersistentData('jr_farm_poultry_eggs', eggRecords);
  }, [eggRecords]);

  useEffect(() => {
    setPersistentData('jr_farm_poultry_health', healthRecords);
  }, [healthRecords]);

  useEffect(() => {
    setPersistentData('jr_farm_poultry_mortality', mortalityRecords);
  }, [mortalityRecords]);

  // Live remote sync listener to reload poultry datasets when changed on PC or Phone
  useEffect(() => {
    const handleRemoteSync = () => {
      try {
        const fSaved = localStorage.getItem('jr_farm_poultry_flocks');
        if (fSaved) setFlocks(JSON.parse(fSaved));
        const eSaved = localStorage.getItem('jr_farm_poultry_eggs');
        if (eSaved) setEggRecords(JSON.parse(eSaved));
        const hSaved = localStorage.getItem('jr_farm_poultry_health');
        if (hSaved) setHealthRecords(JSON.parse(hSaved));
        const mSaved = localStorage.getItem('jr_farm_poultry_mortality');
        if (mSaved) setMortalityRecords(JSON.parse(mSaved));
      } catch (err) {
        console.error("Failed to reload poultry records on remote sync", err);
      }
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    window.addEventListener('storage', handleRemoteSync);
    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
      window.removeEventListener('storage', handleRemoteSync);
    };
  }, []);

  // Flock CRUD
  const handleAddFlock = (newFlock: PoultryFlock) => {
    setFlocks([newFlock, ...flocks]);
  };

  const handleUpdateFlock = (id: string, updated: PoultryFlock) => {
    setFlocks(flocks.map(f => (f.id === id ? updated : f)));
  };

  const handleDeleteFlock = (id: string) => {
    setFlocks(flocks.filter(f => f.id !== id));
  };

  // Egg CRUD
  const handleAddEggRecord = (newEgg: PoultryEggRecord) => {
    setEggRecords([newEgg, ...eggRecords]);

    // Mirror to legacy poultry records if supported
    if (onAddLegacyPoultry) {
      const legacy: PoultryRecord = {
        id: `legacy-${newEgg.id}`,
        stage: newEgg.species === 'Duck' ? 'Layer' : 'Layer',
        batchName: newEgg.flockName,
        count: newEgg.layingFlockBirdCount,
        dateLogged: newEgg.date,
        feedGivenKg: Math.round((newEgg.layingFlockBirdCount * 130) / 1000),
        feedType: 'Layers High Calcium mash',
        mortalityCount: 0,
        eggCratesHarvested: newEgg.cratesCollected,
        crackedEggsCount: newEgg.crackedEggsCount,
        waterIntakeLiters: Math.round(newEgg.layingFlockBirdCount * 0.25),
        percentageProduction: newEgg.layRatePercentage,
        notes: newEgg.notes || 'Daily egg collection recorded via Avian Hub'
      };
      onAddLegacyPoultry(legacy);
    }
  };

  const handleUpdateEggRecord = (id: string, updated: PoultryEggRecord) => {
    setEggRecords(eggRecords.map(e => (e.id === id ? updated : e)));
  };

  const handleDeleteEggRecord = (id: string) => {
    setEggRecords(eggRecords.filter(e => e.id !== id));
  };

  // Health CRUD
  const handleAddHealthRecord = (newHealth: PoultryHealthRecord) => {
    setHealthRecords([newHealth, ...healthRecords]);
  };

  const handleUpdateHealthRecord = (id: string, updated: PoultryHealthRecord) => {
    setHealthRecords(healthRecords.map(h => (h.id === id ? updated : h)));
  };

  const handleDeleteHealthRecord = (id: string) => {
    setHealthRecords(healthRecords.filter(h => h.id !== id));
  };

  // Mortality CRUD (with auto-deduction from flock count)
  const handleAddMortalityRecord = (newMort: PoultryMortalityRecord, autoDeduct = true) => {
    setMortalityRecords([newMort, ...mortalityRecords]);

    if (autoDeduct) {
      setFlocks(prev => prev.map(f => {
        if (f.id === newMort.flockId) {
          const newCount = Math.max(0, f.currentCount - newMort.count);
          return {
            ...f,
            currentCount: newCount,
            status: newCount === 0 ? 'Depleted' : f.status
          };
        }
        return f;
      }));
    }
  };

  const handleUpdateMortalityRecord = (id: string, updated: PoultryMortalityRecord) => {
    setMortalityRecords(mortalityRecords.map(m => (m.id === id ? updated : m)));
  };

  const handleDeleteMortalityRecord = (id: string) => {
    setMortalityRecords(mortalityRecords.filter(m => m.id !== id));
  };

  // Cross navigation from Flock Registry
  const handleSelectFlockForEgg = (flock: PoultryFlock) => {
    setTargetedFlock(flock);
    setActiveTab('eggs');
  };

  const handleSelectFlockForHealth = (flock: PoultryFlock) => {
    setTargetedFlock(flock);
    setActiveTab('health');
  };

  const handleSelectFlockForMortality = (flock: PoultryFlock) => {
    setTargetedFlock(flock);
    setActiveTab('mortality');
  };

  // WhatsApp Briefing Generator
  const handleShareWhatsApp = () => {
    const totalBirds = flocks.reduce((acc, f) => acc + (f.currentCount || 0), 0);
    const activeLayers = flocks.filter(f => f.stateOfProduction === 'Active Egg Laying').reduce((acc, f) => acc + (f.currentCount || 0), 0);
    const chickens = flocks.filter(f => f.species === 'Chicken').reduce((acc, f) => acc + (f.currentCount || 0), 0);
    const ducks = flocks.filter(f => f.species === 'Duck').reduce((acc, f) => acc + (f.currentCount || 0), 0);

    const todayStr = toIsoDate(new Date());
    const todayEggs = eggRecords.filter(r => r.date === todayStr);
    const totalEggsToday = todayEggs.reduce((acc, r) => acc + (r.goodEggsCount || 0), 0);
    const totalCratesToday = todayEggs.reduce((acc, r) => acc + (r.cratesCollected || 0), 0);

    const text = `*JR FARM — AVIAN & WATERFOWL HERD BRIEFING* 🐔🦆
Date: ${todayStr}
Total Avian Flock: ${totalBirds.toLocaleString()} Birds
• Chickens: ${chickens} Head
• Ducks: ${ducks} Head
Active Laying Birds: ${activeLayers} Layers

*TODAY'S EGG COLLECTION:*
Total Good Table Eggs: ${totalEggsToday} eggs (${totalCratesToday} Crates / Trays)
Registered Flocks: ${flocks.length} Active Cohorts

_Comprehensive Farm Audit Prepared by: Dr. Devin Omwenga_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadPdf = () => {
    generatePoultryAuditPdf(flocks, eggRecords, healthRecords, mortalityRecords);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner Ribbon */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded tracking-wide uppercase">
              Avian & Waterfowl Ecosystem
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-semibold">
              {flocks.length} Flocks • {flocks.reduce((s, f) => s + (f.currentCount || 0), 0)} Total Birds
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>🐔</span> Comprehensive Poultry & Waterfowl Hub
          </h2>
          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            Manage groups of birds across lifecycle stages (Duck adults/growers/ducklings, Chicken layers/growers/chicks),
            track daily egg production with monthly rollups, monitor diseases and withdrawal windows, and record culls and table meat sales.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Share Realtime Briefing via WhatsApp"
          >
            <Share2 size={14} />
            WhatsApp Briefing
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Download Comprehensive Avian Audit PDF"
          >
            <Download size={14} />
            Download PDF Audit
          </button>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex bg-white border border-gray-200 p-1.5 rounded-2xl shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('flocks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'flocks'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Layers size={15} />
          Flock & Group Registry ({flocks.length})
        </button>

        <button
          onClick={() => setActiveTab('eggs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'eggs'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Egg size={15} />
          Daily Egg Ledger & Monthly Rollup ({eggRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'health'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Stethoscope size={15} />
          Health, Disease & Drugs ({healthRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('mortality')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mortality'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle size={15} />
          Culling & Mortality Log ({mortalityRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('advisory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'advisory'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <BookOpen size={15} />
          Performance, Feeds & Advisory
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'flocks' && (
        <PoultryFlockRegistry
          flocks={flocks}
          onAddFlock={handleAddFlock}
          onUpdateFlock={handleUpdateFlock}
          onDeleteFlock={handleDeleteFlock}
          onSelectFlockForEgg={handleSelectFlockForEgg}
          onSelectFlockForHealth={handleSelectFlockForHealth}
          onSelectFlockForMortality={handleSelectFlockForMortality}
        />
      )}

      {activeTab === 'eggs' && (
        <PoultryEggHub
          eggRecords={eggRecords}
          flocks={flocks}
          onAddEggRecord={handleAddEggRecord}
          onUpdateEggRecord={handleUpdateEggRecord}
          onDeleteEggRecord={handleDeleteEggRecord}
          preselectedFlock={targetedFlock}
          onClearPreselectedFlock={() => setTargetedFlock(null)}
        />
      )}

      {activeTab === 'health' && (
        <PoultryHealthHub
          healthRecords={healthRecords}
          flocks={flocks}
          onAddHealthRecord={handleAddHealthRecord}
          onUpdateHealthRecord={handleUpdateHealthRecord}
          onDeleteHealthRecord={handleDeleteHealthRecord}
          preselectedFlock={targetedFlock}
          onClearPreselectedFlock={() => setTargetedFlock(null)}
        />
      )}

      {activeTab === 'mortality' && (
        <PoultryMortalityHub
          mortalityRecords={mortalityRecords}
          flocks={flocks}
          onAddMortalityRecord={handleAddMortalityRecord}
          onUpdateMortalityRecord={handleUpdateMortalityRecord}
          onDeleteMortalityRecord={handleDeleteMortalityRecord}
          preselectedFlock={targetedFlock}
          onClearPreselectedFlock={() => setTargetedFlock(null)}
        />
      )}

      {activeTab === 'advisory' && (
        <PoultryAdvisoryHub />
      )}
    </div>
  );
}
