import React, { useState } from 'react';
import { GoatRecord, GoatBreedingRecord, GoatTreatmentRecord, GoatKidRecord, StaffMember } from '../../types';
import {
  Tag, Heart, Stethoscope, Baby, Download, Share2, Plus,
  FileSpreadsheet, ShieldCheck, Sparkles, Milk, Scale
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { GoatRegistryHub } from './GoatRegistryHub';
import { GoatBreedingHub } from './GoatBreedingHub';
import { GoatTreatmentHub } from './GoatTreatmentHub';
import { GoatKidsHub } from './GoatKidsHub';
import { generateGoatHerdAuditPdf } from './GoatPdfGenerator';

interface GoatManagerProps {
  goatRecords: GoatRecord[];
  onAddGoatRecord: (rec: GoatRecord) => void;
  onDeleteGoatRecord: (id: string) => void;
  onEditGoatRecord?: (id: string, updated: GoatRecord) => void;
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type GoatSubTab = 'registry' | 'breeding' | 'treatment' | 'kids';

export function GoatManager({
  goatRecords = [],
  onAddGoatRecord,
  onDeleteGoatRecord,
  onEditGoatRecord,
  staffList = [],
  onTriggerSectionReport
}: GoatManagerProps) {
  const [subTab, setSubTab] = useState<GoatSubTab>('registry');

  // WhatsApp Briefing
  const handleShareWhatsApp = () => {
    const totalHead = goatRecords.length;
    const milkingDoes = goatRecords.filter(g => (g.milkYieldLiters || 0) > 0 || g.status === 'Active Lactating').length;
    const totalMilk = goatRecords.reduce((s, g) => s + (g.milkYieldLiters || 0), 0);
    const avgWeight = totalHead > 0
      ? Math.round(goatRecords.reduce((s, g) => s + (g.weightKg || 48), 0) / totalHead)
      : 0;

    const text = `*JR FARM — DUAL-PURPOSE CAPRINE HERD BRIEFING* 🐐
Date: ${toIsoDate(new Date())}
Total Dual-Purpose Goats: ${totalHead} Head
Active Milking Does: ${milkingDoes} Does
Total Daily Milk Output: ${totalMilk.toFixed(1)} Liters/day
Average Body Liveweight: ${avgWeight} KG (Milk & Meat Build)
Purpose: 100% Dual-Purpose (Toggenburg, Alpine, Galla, Anglo-Nubian)

_Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadPdf = () => {
    // Read breeding, treatments, kids from localStorage if present
    let breedings: GoatBreedingRecord[] = [];
    let treatments: GoatTreatmentRecord[] = [];
    let kids: GoatKidRecord[] = [];

    try {
      const bStored = localStorage.getItem('jr_farm_goat_breedings');
      if (bStored) breedings = JSON.parse(bStored);
    } catch {}

    try {
      const tStored = localStorage.getItem('jr_farm_goat_treatments');
      if (tStored) treatments = JSON.parse(tStored);
    } catch {}

    try {
      const kStored = localStorage.getItem('jr_farm_goat_kids');
      if (kStored) kids = JSON.parse(kStored);
    } catch {}

    generateGoatHerdAuditPdf(goatRecords, breedings, treatments, kids);
  };

  // Graduate kid to adult herd
  const handleGraduateKid = (kid: GoatKidRecord) => {
    const newAdultGoat: GoatRecord = {
      id: `gt-grad-${Date.now()}`,
      tagId: kid.kidTagId,
      name: kid.kidName || (kid.sex === 'Doeling' ? 'Young Doe' : 'Young Buck'),
      breed: 'Dual Purpose Cross',
      purpose: 'Dual Purpose',
      dualPurposeTarget: 'High Milk & Meat',
      sex: kid.sex === 'Doeling' ? 'Doe' : 'Buck',
      dob: kid.dob,
      weightKg: kid.currentWeightKg,
      milkYieldLiters: kid.sex === 'Doeling' ? 0 : undefined,
      parity: 0,
      damTag: kid.damTagId,
      sireTag: kid.sireTagId,
      housingPen: 'Elevated Pen A',
      status: kid.sex === 'Doeling' ? 'Maiden Doeling' : 'Growing Buckling',
      activity: 'Graduated from Nursery into Adult Herd',
      notes: `Graduated from kids nursery with final nursery weight ${kid.currentWeightKg}kg (ADG +${kid.dailyGainGramsPerDay}g/day).`,
      date: toIsoDate(new Date())
    };

    onAddGoatRecord(newAdultGoat);
    alert(`Successfully graduated ${kid.kidTagId} into the adult Goat Registry!`);
    setSubTab('registry');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs text-2xl">
              🐐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-800 bg-amber-100 rounded-full">
                  JR FARM CAPRINE DIVISION
                </span>
                <span className="text-xs text-gray-500 font-medium">Dual-Purpose Milk & Meat Husbandry</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Caprine Dual-Purpose Management System
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Optimized management for dual-purpose Toggenburg, Alpine, Galla, and Anglo-Nubian goats (high-volume dairy yield + heavy carcass liveweight growth).
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-green-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Share2 size={14} />
              <span>WhatsApp Briefing</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Download Herd Audit PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setSubTab('registry')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'registry'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Tag size={14} />
            <span>Goat Registry</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">
              {goatRecords.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('breeding')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'breeding'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Heart size={14} />
            <span>Breeding Section (~150d Gestation)</span>
          </button>

          <button
            onClick={() => setSubTab('treatment')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'treatment'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Stethoscope size={14} />
            <span>Treatment Section (CCPP & Withdrawal)</span>
          </button>

          <button
            onClick={() => setSubTab('kids')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'kids'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Baby size={14} />
            <span>Kids Nursery Section</span>
          </button>
        </div>
      </div>

      {/* Active Subtab Content */}
      {subTab === 'registry' && (
        <GoatRegistryHub
          goats={goatRecords}
          onAddGoat={onAddGoatRecord}
          onEditGoat={onEditGoatRecord}
          onDeleteGoat={onDeleteGoatRecord}
          staffList={staffList}
          onNavigateToBreeding={(doeTag) => setSubTab('breeding')}
          onNavigateToTreatment={(goatTag) => setSubTab('treatment')}
        />
      )}

      {subTab === 'breeding' && (
        <GoatBreedingHub
          goats={goatRecords}
          staffList={staffList}
          onKidBorn={(doeTag, count, date) => {
            alert(`Logged kidding for ${doeTag} with ${count} kids! Opening Kids Nursery Hub.`);
            setSubTab('kids');
          }}
        />
      )}

      {subTab === 'treatment' && (
        <GoatTreatmentHub
          goats={goatRecords}
          staffList={staffList}
        />
      )}

      {subTab === 'kids' && (
        <GoatKidsHub
          staffList={staffList}
          onGraduateToAdultHerd={handleGraduateKid}
        />
      )}
    </div>
  );
}
