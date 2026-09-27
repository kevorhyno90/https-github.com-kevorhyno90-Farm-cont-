/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import LactationLedger from './dairy/LactationLedger';
import GeneticsManager from './dairy/GeneticsManager';
import { CowRegistry } from './dairy/CowRegistry';
import { VeterinaryLog } from './dairy/VeterinaryLog';
import { BreedingLedger } from './dairy/BreedingLedger';
import { CalvesHeifersHub } from './dairy/CalvesHeifersHub';
import { generateDairyAuditPdf } from './dairy/DairyPdfGenerator';
import { TmrMixing } from './TmrMixing';
import {
  MilkingRecord, AIRecord, StaffMember, Cow, VetRecord,
  MilkOutflowRecord, SemenInventoryItem, CalfRecord, SilageRecord
} from '../types';
import { toIsoDate } from '../utils/dateHelper';
import {
  Activity, CalendarDays, Award, HeartPulse, Sparkles,
  Download, Share2, AlertTriangle, ShieldCheck, FileSpreadsheet,
  Plus, TrendingUp, Baby, Scale, Trash2, ArrowRight, Truck
} from 'lucide-react';

interface DairyAnimalSaleRecord {
  id: string;
  animalId: string;
  type: 'Cow' | 'Calf' | 'Other';
  date: string;
  price: number;
  buyer: string;
  notes: string;
}

interface DairyMortalityRecord {
  id: string;
  animalId: string;
  type: 'Cow' | 'Calf' | 'Other';
  date: string;
  causeOfDeath: string;
  disposalMethod: string;
  notes: string;
}

interface DairyBreedingProps {
  milkRecords: MilkingRecord[];
  aiRecords: AIRecord[];
  milkOutflows: MilkOutflowRecord[];
  onAddMilkOutflow: (rec: MilkOutflowRecord) => void;
  onDeleteMilkOutflow: (id: string) => void;
  onEditMilkOutflow?: (id: string, updated: MilkOutflowRecord) => void;
  staffList: StaffMember[];
  onAddMilkRecord: (rec: MilkingRecord) => void;
  onAddAIRecord: (rec: AIRecord) => void;
  onUpdateAIStatus: (cowId: string, date: string, status: AIRecord['status']) => void;
  onDeleteMilkRecord: (id: string, date: string) => void;
  onDeleteAIRecord: (cowId: string, date: string) => void;
  cows: Cow[];
  vetRecords: VetRecord[];
  onAddCow: (rec: Cow) => void;
  onDeleteCow: (id: string) => void;
  onUpdateCowStatus: (id: string, status: Cow['status']) => void;
  onAddVetRecord: (rec: VetRecord) => void;
  onDeleteVetRecord: (id: string) => void;
  onEditMilkRecord?: (id: string, date: string, updated: MilkingRecord) => void;
  onEditAIRecord?: (cowId: string, date: string, updated: AIRecord) => void;
  onEditCow?: (id: string, updated: Cow) => void;
  onEditVetRecord?: (id: string, updated: VetRecord) => void;
  animalSales: DairyAnimalSaleRecord[];
  onAddAnimalSale: (rec: DairyAnimalSaleRecord) => void;
  onDeleteAnimalSale: (id: string) => void;
  mortalities: DairyMortalityRecord[];
  onAddMortality: (rec: DairyMortalityRecord) => void;
  onDeleteMortality: (id: string) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
  semenInventory?: SemenInventoryItem[];
  setSemenInventory?: React.Dispatch<React.SetStateAction<SemenInventoryItem[]>>;
  onAddCalfRecord?: (rec: CalfRecord) => void;
  silageRecords?: SilageRecord[];
  onAddSilage?: (rec: SilageRecord) => void;
  onDeleteSilage?: (id: string) => void;
  activeSubModule?: 'milk' | 'breeding' | 'veterinary' | 'cows' | 'calves' | 'heifers' | 'tmr';
}

type DairySubTab =
  | 'registry'
  | 'lactation'
  | 'breeding_ledger'
  | 'breeding_wheel'
  | 'semen_inventory'
  | 'veterinary'
  | 'calves_heifers'
  | 'tmr_nutrition'
  | 'life_ledger';

export function DairyBreeding({
  milkRecords = [],
  aiRecords = [],
  milkOutflows = [],
  onAddMilkOutflow,
  onDeleteMilkOutflow,
  onEditMilkOutflow,
  staffList = [],
  onAddMilkRecord,
  onAddAIRecord,
  onUpdateAIStatus,
  onDeleteMilkRecord,
  onDeleteAIRecord,
  cows = [],
  vetRecords = [],
  onAddCow,
  onDeleteCow,
  onUpdateCowStatus,
  onAddVetRecord,
  onDeleteVetRecord,
  onEditMilkRecord,
  onEditAIRecord,
  onEditCow,
  onEditVetRecord,
  animalSales = [],
  onAddAnimalSale,
  onDeleteAnimalSale,
  mortalities = [],
  onAddMortality,
  onDeleteMortality,
  onTriggerSectionReport,
  semenInventory = [],
  setSemenInventory,
  onAddCalfRecord,
  silageRecords = [],
  onAddSilage,
  onDeleteSilage,
  activeSubModule
}: DairyBreedingProps) {
  const [subTab, setSubTab] = useState<DairySubTab>('registry');

  // React to activeSubModule when navigating from sidebar or dashboard
  useEffect(() => {
    if (activeSubModule === 'milk') {
      setSubTab('lactation');
    } else if (activeSubModule === 'breeding') {
      setSubTab('breeding_ledger');
    } else if (activeSubModule === 'veterinary') {
      setSubTab('veterinary');
    } else if (activeSubModule === 'cows') {
      setSubTab('registry');
    } else if (activeSubModule === 'calves' || activeSubModule === 'heifers') {
      setSubTab('calves_heifers');
    } else if (activeSubModule === 'tmr') {
      setSubTab('tmr_nutrition');
    }
  }, [activeSubModule]);

  const todayStr = toIsoDate();

  // Active Milk Withdrawal Safeguard calculation
  const activeWithdrawals = useMemo(() => {
    return vetRecords.filter(r => {
      if (!r.withdrawalMilkDays || r.withdrawalMilkDays <= 0) return false;
      const treatDate = new Date(r.date);
      const safeDate = new Date(treatDate);
      safeDate.setDate(safeDate.getDate() + r.withdrawalMilkDays);
      return safeDate >= new Date(todayStr);
    }).map(r => {
      const treatDate = new Date(r.date);
      const safeDate = new Date(treatDate);
      safeDate.setDate(safeDate.getDate() + (r.withdrawalMilkDays || 0));
      const daysLeft = Math.ceil((safeDate.getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...r,
        safeDateStr: toIsoDate(safeDate),
        daysRemaining: Math.max(0, daysLeft)
      };
    });
  }, [vetRecords, todayStr]);

  // Overall Statistics
  const totalCows = cows.length;
  const lactatingCount = cows.filter(c =>
    (c.status?.toLowerCase() || '').includes('lactat') ||
    (c.status?.toLowerCase() || '').includes('milk')
  ).length;

  const todayMilks = milkRecords.filter(m => m.date === todayStr);
  const totalLitersToday = todayMilks.reduce((sum, m) => sum + (m.am || 0) + (m.pm || 0), 0);
  const avgYieldToday = todayMilks.length > 0 ? (totalLitersToday / todayMilks.length).toFixed(1) : '—';

  const inCalfCount = aiRecords.filter(a => a.status === 'Confirmed Pregnant').length;
  const totalStraws = semenInventory.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Top producer today
  const topCowToday = useMemo(() => {
    if (todayMilks.length === 0) return null;
    let maxMilk = 0;
    let maxId = '';
    todayMilks.forEach(m => {
      const vol = (m.am || 0) + (m.pm || 0);
      if (vol > maxMilk) {
        maxMilk = vol;
        maxId = m.id;
      }
    });
    return { id: maxId, liters: maxMilk };
  }, [todayMilks]);

  // WhatsApp Operations Briefing
  const handleShareWhatsApp = () => {
    const text = `*JR FARM — BOVINE DAIRY HERD & LACTATION BRIEFING* 🥛🐄
Date: ${todayStr}
Total Cattle Headcount: ${totalCows} Cows
Active Milking Herd: ${lactatingCount} Cows (${totalCows > 0 ? Math.round((lactatingCount / totalCows) * 100) : 0}% in-milk)
Today's Milking Yield: ${totalLitersToday.toFixed(1)} Liters (Avg: ${avgYieldToday} L/cow/day)
${topCowToday ? `★ Star Producer Today: ${topCowToday.id} (${topCowToday.liters.toFixed(1)} L)\n` : ''}Active Confirmed In-Calf: ${inCalfCount} Cows
Liquid N2 Semen Straw Reserves: ${totalStraws} Straws
${activeWithdrawals.length > 0
  ? `⚠️ BULK TANK WITHDRAWAL ALERT: ${activeWithdrawals.length} Cow(s) under antibiotic milk withdrawal!\n`
  : '✅ Milk Safety Status: 100% Bulk Tank Residue-Free\n'}
_Presented & Approved by: Dr. Devin Omwenga (Overall Farm Manager & Vet Director)_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Master PDF Audit Report
  const handleDownloadPdf = () => {
    generateDairyAuditPdf(
      cows,
      milkRecords,
      aiRecords,
      vetRecords,
      semenInventory,
      animalSales,
      mortalities,
      milkOutflows
    );
  };

  // Average daily yield for a cow
  const getAverageYield = (tag: string) => {
    if (!tag) return 0;
    const cowMilks = milkRecords.filter(r => r && r.id && r.id.toLowerCase() === tag.toLowerCase());
    if (cowMilks.length === 0) return 0;
    const total = cowMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
    return total / cowMilks.length;
  };

  // Age Calculator in months/years
  const getCowAge = (dobString: string) => {
    if (!dobString) return 'Unknown';
    const birth = new Date(dobString);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 12) {
      return `${diffMonths} mos`;
    }
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    return `${years} yr ${remainingMonths} mo`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* MASTER TOP BANNER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 text-3xl shadow-xs">
              🐄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 rounded-full">
                  JR FARM DAIRY OPERATIONS
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full">
                  Lactation, Breeding & Clinical Hub
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Bovine Dairy Herd & High-Yield Lactation Suite
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Precision daily milk logging, semen genetic straws, return heat gestation tracking, antibiotic milk withdrawal safeguards, and progeny pipeline.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Share Executive Daily Milking Briefing on WhatsApp"
            >
              <Share2 size={14} />
              WhatsApp Briefing
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Generate and Download Official Dairy Audit PDF"
            >
              <Download size={14} />
              Export Dairy Audit PDF
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-gray-100">
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Cattle</span>
            <span className="text-xl font-black text-gray-900">{totalCows} Head</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Pedigree registered</span>
          </div>

          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Active Milking</span>
            <span className="text-xl font-black text-emerald-700">{lactatingCount} Cows</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              {totalCows > 0 ? Math.round((lactatingCount / totalCows) * 100) : 0}% of herd in-milk
            </span>
          </div>

          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Today's Milk Yield</span>
            <span className="text-xl font-black text-indigo-700">{totalLitersToday.toFixed(1)} L</span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">Avg: {avgYieldToday} L/cow</span>
          </div>

          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Confirmed In-Calf</span>
            <span className="text-xl font-black text-amber-700">{inCalfCount} Cows</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Active gestations</span>
          </div>

          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Semen Straws</span>
            <span className="text-xl font-black text-purple-700">{totalStraws} Units</span>
            <span className="text-[10px] text-purple-600 block mt-0.5">{semenInventory.length} sire lines</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            activeWithdrawals.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-500">Milk Withdrawal</span>
            <span className={`text-xl font-black ${
              activeWithdrawals.length > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {activeWithdrawals.length} Cow(s)
            </span>
            <span className={`text-[10px] font-semibold block mt-0.5 ${
              activeWithdrawals.length > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {activeWithdrawals.length > 0 ? '⛔ Bulk Tank Hazard' : '✅ 100% Residue Safe'}
            </span>
          </div>
        </div>
      </div>

      {/* CRITICAL ANTIBIOTIC MILK WITHDRAWAL QUARANTINE SAFEGUARD */}
      {activeWithdrawals.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-xs animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={24} />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white rounded">
                  Mandatory Milk Withdrawal Active
                </span>
                <span className="text-xs font-bold text-rose-950">
                  Bulk Cooler Residue Contamination Safeguard
                </span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                The following cattle received veterinary drugs with active milk withdrawal periods. <strong>DO NOT pour milk into the commercial bulk tank.</strong> Milk must be isolated and safely discarded or fed to nursery calves only.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3 pt-2 border-t border-rose-200/80">
                {activeWithdrawals.map(w => (
                  <div key={w.id} className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs flex justify-between items-center text-xs">
                    <div>
                      <span className="font-black text-rose-950 block">{w.cowId}</span>
                      <span className="text-[11px] text-gray-600 font-medium">
                        Drug: {w.drugAdministered || w.treatment}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-700 block text-[11px]">
                        {w.daysRemaining} days left
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Safe on: {w.safeDateStr}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED SUB-TAB NAVIGATION BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 shadow-xs overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <button
            onClick={() => setSubTab('registry')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'registry'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Award size={14} />
            🏷️ Cattle Directory & Pedigree
          </button>

          <button
            onClick={() => setSubTab('lactation')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'lactation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Activity size={14} />
            🥛 Milking & Bulk Dispatch
          </button>

          <button
            onClick={() => setSubTab('breeding_ledger')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'breeding_ledger'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <CalendarDays size={14} />
            📋 AI & Breeding Cycles
          </button>

          <button
            onClick={() => setSubTab('breeding_wheel')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'breeding_wheel'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sparkles size={14} />
            🎡 Gestation Wheel & Curves
          </button>

          <button
            onClick={() => setSubTab('semen_inventory')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'semen_inventory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🧬</span> Semen Straw Bank ({totalStraws})
          </button>

          <button
            onClick={() => setSubTab('veterinary')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 relative ${
              subTab === 'veterinary'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <HeartPulse size={14} />
            🩺 Veterinary & Withdrawal Clinic
            {activeWithdrawals.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setSubTab('calves_heifers')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'calves_heifers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Baby size={14} />
            🍼 Calves & Heifers Pipeline
          </button>

          <button
            onClick={() => setSubTab('tmr_nutrition')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'tmr_nutrition'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Truck size={14} />
            🥣 TMR Nutrition & Silage Pits
          </button>

          <button
            onClick={() => setSubTab('life_ledger')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'life_ledger'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={14} />
            📈 Livestock Sales & Loss
          </button>
        </div>
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. CATTLE DIRECTORY & PEDIGREE */}
      {subTab === 'registry' && (
        <CowRegistry
          cows={cows}
          milkRecords={milkRecords}
          onDeleteCow={onDeleteCow}
          onTriggerSectionReport={onTriggerSectionReport}
          onUpdateCowStatus={onUpdateCowStatus}
          onAddCow={onAddCow}
          onEditCow={onEditCow}
        />
      )}

      {/* 2. LACTATION & BULK DISPATCH */}
      {subTab === 'lactation' && (
        <LactationLedger
          cows={cows}
          milkRecords={milkRecords}
          milkOutflow={milkOutflows}
          milkOutflows={milkOutflows}
          staffList={staffList}
          aiRecords={aiRecords}
          vetRecords={vetRecords}
          onTriggerSectionReport={onTriggerSectionReport}
          onAddMilkRecord={onAddMilkRecord}
          onEditMilkRecord={onEditMilkRecord}
          onDeleteMilkRecord={onDeleteMilkRecord}
          onAddOutflowRecord={onAddMilkOutflow}
          onEditMilkOutflow={onEditMilkOutflow}
          onDeleteMilkOutflow={onDeleteMilkOutflow}
        />
      )}

      {/* 3. BREEDING LEDGER */}
      {subTab === 'breeding_ledger' && (
        <BreedingLedger
          cows={cows}
          aiRecords={aiRecords}
          semenInventory={semenInventory}
          staffList={staffList}
          onAddAIRecord={onAddAIRecord}
          onDeleteAIRecord={onDeleteAIRecord}
          onEditAIRecord={onEditAIRecord}
          onUpdateAIStatus={onUpdateAIStatus}
          onAddCalfRecord={onAddCalfRecord}
          setSemenInventory={setSemenInventory}
          onTriggerSectionReport={onTriggerSectionReport}
        />
      )}

      {/* 4. BREEDING & GESTATION WHEEL */}
      {subTab === 'breeding_wheel' && (
        <GeneticsManager
          cows={cows}
          aiRecords={aiRecords}
          getAverageYield={getAverageYield}
          getCowAge={getCowAge}
          onTriggerSectionReport={onTriggerSectionReport}
          onGoToSubTab={setSubTab}
          onUpdateCowStatus={onUpdateCowStatus}
        />
      )}

      {/* 5. SEMEN STRAW INVENTORY */}
      {subTab === 'semen_inventory' && (
        <div className="space-y-6 animate-fadeIn" id="semen-inventory-section">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-1 rounded-full border border-amber-200">
                  🧬 Liquid N2 Cryogenic Storage
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  Sire Semen Straws & Genetic Bank
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage high-index genetic straws in stock. Deduct automatically upon Artificial Insemination service logging.
                </p>
              </div>
              {onTriggerSectionReport && (
                <button
                  onClick={() => onTriggerSectionReport('ai')}
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Download size={14} />
                  Semen Straws PDF
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add New Straw Form */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                ➕ Register Genetic Semen Straw
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const id = fd.get('id') as string;
                  const bullName = fd.get('bullName') as string;
                  const breed = fd.get('breed') as string;
                  const semenType = fd.get('semenType') as string;
                  const origin = fd.get('origin') as string;
                  const cost = Number(fd.get('cost')) || 0;
                  const quantity = Number(fd.get('quantity')) || 0;

                  if (!id || !bullName) return;

                  if (semenInventory.some(s => s.id.toLowerCase() === id.trim().toLowerCase())) {
                    alert('A semen straw with this code already exists!');
                    return;
                  }

                  if (setSemenInventory) {
                    setSemenInventory([
                      ...semenInventory,
                      {
                        id: id.trim(),
                        bullName: bullName.trim(),
                        breed,
                        semenType,
                        origin,
                        cost,
                        quantity
                      }
                    ]);
                  }
                  form.reset();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    Straw Code / Reference ID
                  </label>
                  <input
                    name="id"
                    type="text"
                    required
                    placeholder="E.g. SEMEN-HO-995"
                    className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    Bull / Sire Name
                  </label>
                  <input
                    name="bullName"
                    type="text"
                    required
                    placeholder="E.g. AltaSprings Commander"
                    className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Breed</label>
                    <select
                      name="breed"
                      required
                      className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold bg-white"
                    >
                      <option value="Holstein-Friesian">Holstein-Friesian</option>
                      <option value="Jersey">Jersey</option>
                      <option value="Ayrshire">Ayrshire</option>
                      <option value="Guernsey">Guernsey</option>
                      <option value="Friesian">Friesian</option>
                      <option value="Fleckvieh">Fleckvieh</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Semen Type</label>
                    <select
                      name="semenType"
                      required
                      className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold bg-white"
                    >
                      <option value="Sexed (Female)">Sexed (Female)</option>
                      <option value="Sexed (Male)">Sexed (Male)</option>
                      <option value="Conventional">Conventional</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Origin</label>
                    <input
                      name="origin"
                      type="text"
                      required
                      placeholder="E.g. Imported (USA)"
                      className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
                      Cost (Ksh/Straw)
                    </label>
                    <input
                      name="cost"
                      type="number"
                      required
                      min="0"
                      placeholder="3500"
                      className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    Quantity in Stock (Straws)
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    required
                    min="1"
                    placeholder="E.g. 10"
                    className="border border-gray-200 rounded-xl p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Register Genetic Straw
                </button>
              </form>
            </div>

            {/* Inventory Table */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs md:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  📋 Straws Registry Ledger
                </h4>
                <span className="text-[10px] font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {semenInventory.length} types registered ({totalStraws} straws)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Straw Code / Sire</th>
                      <th className="p-3">Breed / Type</th>
                      <th className="p-3">Origin</th>
                      <th className="p-3 text-right">Cost (Ksh)</th>
                      <th className="p-3 text-center">In-Stock</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {semenInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-bold">
                          <span className="font-mono text-gray-900 block">{item.id}</span>
                          <span className="text-[11px] text-gray-500 font-medium block">{item.bullName}</span>
                        </td>
                        <td className="p-3 font-medium">
                          <span className="text-gray-700 block">{item.breed}</span>
                          <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">
                            {item.semenType}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">{item.origin}</td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900">
                          Ksh {item.cost.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                              item.quantity <= 2
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {item.quantity} units
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (setSemenInventory) {
                                setSemenInventory(semenInventory.filter(s => s.id !== item.id));
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 font-bold hover:bg-rose-50 px-2 py-1 rounded transition-colors text-[10px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. VETERINARY LOG */}
      {subTab === 'veterinary' && (
        <VeterinaryLog
          cows={cows}
          vetRecords={vetRecords}
          staffList={staffList}
          onAddVetRecord={onAddVetRecord}
          onDeleteVetRecord={onDeleteVetRecord}
          onEditVetRecord={onEditVetRecord}
          onTriggerSectionReport={onTriggerSectionReport}
        />
      )}

      {/* 7. CALVES & HEIFERS PIPELINE */}
      {subTab === 'calves_heifers' && (
        <CalvesHeifersHub
          cows={cows}
          onAddCow={onAddCow}
          onGoToSubTab={setSubTab}
        />
      )}

      {/* 8. TMR CATTLE NUTRITION & SILAGE PITS */}
      {subTab === 'tmr_nutrition' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Interactive TMR Mixer */}
          <TmrMixing onTriggerSectionReport={onTriggerSectionReport} />

          {/* Silage Pits & Feed Rations Directory */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-200">
                  🌾 Fermented Forage & Bunk Preservation
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  Silage Pits & Bunker Stores
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Track pit silage tonnage, moisture testing, lactic fermentation quality, and herd feed lifespan days.
                </p>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Stored Silage</span>
                <span className="text-lg font-black text-emerald-950 font-mono">
                  {silageRecords.reduce((sum, s) => sum + (s.calculatedWeightKg || 0), 0).toLocaleString()} KG
                </span>
              </div>
            </div>

            {/* Silage Form + List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {onAddSilage && (
                <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Plus size={14} className="text-emerald-600" />
                    Record Sealed Silage Pit
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const material = fd.get('rawMaterial') as string;
                      const acres = Number(fd.get('acres')) || 0;
                      const weight = Number(fd.get('weight')) || (acres * 15000);
                      const dateMade = (fd.get('dateMade') as string) || toIsoDate();
                      const quality = fd.get('quality') as string;
                      const notes = fd.get('notes') as string;
                      const animals = Number(fd.get('animals')) || cows.length || 12;
                      const dailyIntake = Number(fd.get('dailyIntake')) || 15;
                      const daysAvailable = Math.round(weight / Math.max(1, animals * dailyIntake));

                      if (!material) return;

                      onAddSilage({
                        id: `silage-${Date.now()}`,
                        rawMaterial: material,
                        acres,
                        calculatedWeightKg: weight,
                        dateMade,
                        quality: quality || 'Excellent (Golden yellow, lactic acid smell)',
                        animalsFedCount: animals,
                        averageAnimalWeightKg: 450,
                        recommendedDailyIntakePerAnimal: dailyIntake,
                        daysOfFeedAvailable: daysAvailable,
                        notes: notes || 'Compacted and sealed with UV polythene and soil weights.'
                      });
                      e.currentTarget.reset();
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">Forage Crop</label>
                      <select name="rawMaterial" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold">
                        <option value="Maize (Dough Stage)">Maize (Dough Stage)</option>
                        <option value="Sorghum (Sweet High-Sugar)">Sorghum (Sweet High-Sugar)</option>
                        <option value="Super Napier (Pakchong 1)">Super Napier (Pakchong 1)</option>
                        <option value="Boma Rhodes Grass">Boma Rhodes Grass</option>
                        <option value="Lucerne / Alfalfa Wilted">Lucerne / Alfalfa Wilted</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-700 block mb-1">Acres Harvested</label>
                        <input type="number" step="0.1" name="acres" defaultValue="1.5" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-700 block mb-1">Pit Yield (KG)</label>
                        <input type="number" name="weight" defaultValue="22500" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-700 block mb-1">Date Sealed</label>
                        <input type="date" name="dateMade" defaultValue={todayStr} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-700 block mb-1">Fermentation Quality</label>
                        <select name="quality" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs">
                          <option value="Excellent (Golden yellow, lactic acid smell)">Excellent (Lactic)</option>
                          <option value="Good (Clean acidic aroma)">Good (Clean Acidic)</option>
                          <option value="Fair (Slight butyric scent)">Fair (Needs fast feedout)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">Preservation / Inoculant Notes</label>
                      <input type="text" name="notes" placeholder="e.g. Inoculated with Lactobacillus plantarum" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                      Save Silage Pit Record
                    </button>
                  </form>
                </div>
              )}

              {/* Stored Silage Pits Listing */}
              <div className={`space-y-3 ${onAddSilage ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-800">
                    Active Bunker Stores & Pits ({silageRecords.length})
                  </h4>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('silage')}
                      type="button"
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} />
                      Export Silage Audit
                    </button>
                  )}
                </div>

                {silageRecords.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                    No silage pits logged yet. Use the form to record newly ensiled forage.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {silageRecords.map((pit) => (
                      <div key={pit.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-gray-900 block">{pit.rawMaterial}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Ensiled: {pit.dateMade}</span>
                          </div>
                          {onDeleteSilage && (
                            <button
                              onClick={() => onDeleteSilage(pit.id)}
                              className="text-gray-400 hover:text-rose-600 cursor-pointer p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Weight</span>
                            <span className="text-xs font-mono font-bold text-emerald-800">{(pit.calculatedWeightKg || 0).toLocaleString()} kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Acres</span>
                            <span className="text-xs font-mono font-bold text-gray-700">{pit.acres} ac</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Lifespan</span>
                            <span className="text-xs font-mono font-bold text-indigo-700">~{pit.daysOfFeedAvailable || '—'} days</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-600 flex justify-between items-center">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium">
                            {pit.quality}
                          </span>
                          <span className="text-[10px] text-gray-400 italic truncate max-w-[140px]">
                            {pit.notes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. CATTLE SALES & LOSS LEDGER */}
      {subTab === 'life_ledger' && (
        <div className="space-y-6 animate-fadeIn" id="life-ledger-dairy">
          {/* Header Actions for Sales & Loss */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-gray-900 font-bold text-sm tracking-tight flex items-center gap-1.5">
                <TrendingUp size={16} className="text-rose-600" />
                Cattle Sales & Mortality Ledger
              </h4>
              <p className="text-xs text-gray-500">
                Log bovine culling, secondary livestock sales revenue, and sanitary post-mortem audits.
              </p>
            </div>
            {onTriggerSectionReport && (
              <button
                onClick={() => onTriggerSectionReport('life_ledger')}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Download size={14} />
                Sales & Loss PDF
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Column */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-5 shadow-xs">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Cattle Sales & Culling Logs</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Secondary bovine revenue</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Ksh {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').reduce((sum, s) => sum + s.price, 0).toLocaleString()} Total
                </span>
              </div>

              {/* Add Sale Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget as HTMLFormElement;
                  const data = new FormData(target);
                  const aType = (data.get('animalType') as DairyAnimalSaleRecord['type']) || 'Other';
                  const aId = data.get('animalId') as string;
                  const date = data.get('saleDate') as string;
                  const price = Number(data.get('salePrice'));
                  const buyer = data.get('saleBuyer') as string;
                  const sNotes = data.get('saleNotes') as string;

                  if (!aId || !date || isNaN(price) || price <= 0) return;

                  onAddAnimalSale({
                    id: `sale-${Date.now()}`,
                    animalId: aId.trim(),
                    type: aType,
                    date,
                    price,
                    buyer: buyer.trim() || 'Local Market Buyer',
                    notes: sNotes.trim() || 'Direct sale'
                  });
                  target.reset();
                }}
                className="space-y-3 bg-gray-50/70 border border-gray-200 p-4 rounded-2xl"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Category</label>
                    <select name="animalType" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold">
                      <option value="Cow">Milking Cow</option>
                      <option value="Calf">Young Calf / Heifer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Tag / ID</label>
                    <input type="text" name="animalId" required placeholder="e.g., Cow-104" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Sale Date</label>
                    <input type="date" name="saleDate" defaultValue={todayStr} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Sale Value (Ksh)</label>
                    <input type="number" name="salePrice" required placeholder="85000" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Buyer / Purchaser</label>
                  <input type="text" name="saleBuyer" placeholder="Brookside heifers breeder or local dealer" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Transaction Notes</label>
                  <input type="text" name="saleNotes" placeholder="e.g. Culled due to low milk yield or upgraded pedigree" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                </div>

                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                  Save Cattle Sale Transaction
                </button>
              </form>

              {/* Sales List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').length === 0 ? (
                  <p className="text-center text-gray-400 py-6 text-xs">No cattle sales transactions recorded.</p>
                ) : (
                  animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').map(sale => (
                    <div key={sale.id} className="p-3 bg-white border border-gray-200 rounded-xl flex justify-between items-center shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{sale.animalId}</span>
                          <span className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {sale.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{sale.date}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Buyer: {sale.buyer} • Notes: "{sale.notes}"
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          Ksh {sale.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => onDeleteAnimalSale(sale.id)}
                          className="text-gray-400 hover:text-rose-600 cursor-pointer p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mortalities Column */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-5 shadow-xs">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Cattle Mortality & Autopsy Ledger</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Sanitary disposal & casualty audits</p>
                </div>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length} Incidents
                </span>
              </div>

              {/* Add Mortality Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget as HTMLFormElement;
                  const data = new FormData(target);
                  const mType = (data.get('animalType') as DairyMortalityRecord['type']) || 'Other';
                  const mId = data.get('animalId') as string;
                  const date = data.get('mortalityDate') as string;
                  const cause = data.get('mortalityCause') as string;
                  const disposal = data.get('mortalityDisposal') as string;
                  const mNotes = data.get('mortalityNotes') as string;

                  if (!mId || !date || !cause) return;

                  onAddMortality({
                    id: `mort-${Date.now()}`,
                    animalId: mId.trim(),
                    type: mType,
                    date,
                    causeOfDeath: cause.trim(),
                    disposalMethod: disposal.trim() || 'Buried Deep in Lime',
                    notes: mNotes.trim() || 'Disposed'
                  });
                  target.reset();
                }}
                className="space-y-3 bg-rose-50/50 border border-rose-200/80 p-4 rounded-2xl"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-rose-900 block mb-1">Category</label>
                    <select name="animalType" className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-950">
                      <option value="Cow">Milking Cow</option>
                      <option value="Calf">Young Calf / Heifer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-rose-900 block mb-1">Tag / ID</label>
                    <input type="text" name="animalId" required placeholder="e.g., Cow-105" className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-rose-900 block mb-1">Incident Date</label>
                    <input type="date" name="mortalityDate" defaultValue={todayStr} required className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-rose-900 block mb-1">Cause of Death</label>
                    <select name="mortalityCause" className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-950">
                      <option value="Bloat (Frothy/Gaseous)">Bloat (Frothy/Gaseous)</option>
                      <option value="East Coast Fever (ECF)">East Coast Fever (ECF)</option>
                      <option value="Milk Fever (Hypocalcaemia)">Milk Fever (Hypocalcaemia)</option>
                      <option value="Physical Injury / Fracture">Physical Injury / Fracture</option>
                      <option value="Stillborn Abortion">Stillborn Abortion</option>
                      <option value="Mastitis Sepsis Shock">Mastitis Sepsis Shock</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-rose-900 block mb-1">Safe Disposal Protocol</label>
                  <input type="text" name="mortalityDisposal" placeholder="e.g. Buried 6ft deep with agricultural lime" className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-rose-900 block mb-1">Post-Mortem & Diagnosis Notes</label>
                  <input type="text" name="mortalityNotes" placeholder="e.g. Confirmed by Dr. Devin Omwenga (Vet)" className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs" />
                </div>

                <button type="submit" className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                  Save Cattle Loss Incident
                </button>
              </form>

              {/* Mortality List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length === 0 ? (
                  <p className="text-center text-gray-400 py-6 text-xs">No cattle mortality incidents recorded.</p>
                ) : (
                  mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').map(inc => (
                    <div key={inc.id} className="p-3 bg-white border border-rose-200 rounded-xl flex justify-between items-center shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-rose-950">{inc.animalId}</span>
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {inc.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{inc.date}</span>
                          <span className="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100">
                            {inc.causeOfDeath}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Disposal: {inc.disposalMethod} • Notes: "{inc.notes}"
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteMortality(inc.id)}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer p-1"
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
      )}
    </div>
  );
}
