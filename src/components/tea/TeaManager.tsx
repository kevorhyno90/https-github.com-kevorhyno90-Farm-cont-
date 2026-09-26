import React, { useState } from 'react';
import { TeaRecord, TeaPracticeRecord, StaffMember } from '../../types';
import {
  Leaf, Calendar, BarChart3, Wrench, Download, Share2,
  DollarSign, Users, UserCheck, ShieldCheck, Sparkles
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { TeaDailyHarvestHub } from './TeaDailyHarvestHub';
import { TeaWeeklyPayoutHub } from './TeaWeeklyPayoutHub';
import { TeaMonthlyHub } from './TeaMonthlyHub';
import { TeaPracticesHub } from './TeaPracticesHub';
import { generateTeaAuditPdf } from './TeaPdfGenerator';
import { INITIAL_TEA_PRACTICE_RECORDS } from '../../initialData';

interface TeaManagerProps {
  teaRecords: TeaRecord[];
  onAddTea: (rec: TeaRecord) => void;
  onDeleteTea: (ref: string) => void;
  onEditTea?: (oldRef: string, updated: TeaRecord) => void;
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type TeaSubTab = 'daily' | 'weekly' | 'monthly' | 'practices';

export function TeaManager({
  teaRecords = [],
  onAddTea,
  onDeleteTea,
  onEditTea,
  staffList = [],
  onTriggerSectionReport
}: TeaManagerProps) {
  const [subTab, setSubTab] = useState<TeaSubTab>('daily');
  const [casualRatePerKg, setCasualRatePerKg] = useState<number>(12); // KES 12/kg default
  const [factoryPricePerKg, setFactoryPricePerKg] = useState<number>(58); // KES 58/kg base KTDA

  // WhatsApp Saturday / Weekly Briefing
  const handleShareWhatsApp = () => {
    const totalHarvestKg = teaRecords.reduce((sum, r) => sum + (r.qty || 0), 0);
    const totalCasualKg = teaRecords.reduce((sum, r) => sum + (r.casualPluckedKg ?? Math.round(r.qty * 0.6)), 0);
    const totalEmployeeKg = teaRecords.reduce((sum, r) => sum + (r.employeePluckedKg ?? (r.qty - (r.casualPluckedKg ?? Math.round(r.qty * 0.6)))), 0);
    const totalCasualCash = teaRecords.reduce((sum, r) => sum + (r.casualPayoutKes ?? Math.round((r.casualPluckedKg ?? Math.round(r.qty * 0.6)) * casualRatePerKg)), 0);

    const text = `*JR FARM — COMMERCIAL TEA HARVEST & SATURDAY PAYROLL BRIEFING* 🍃
Date: ${toIsoDate(new Date())}
Total Green Leaf Harvested: ${totalHarvestKg.toLocaleString()} KG
Amount Plucked by Casual Workers: ${Math.round(totalCasualKg).toLocaleString()} KG
Amount Plucked by Regular Staff: ${Math.round(totalEmployeeKg).toLocaleString()} KG
Total Cash Paid to Casuals (Saturday Wages): KES ${Math.round(totalCasualCash).toLocaleString()}
Casual Plucking Rate: KES ${casualRatePerKg}/KG
Factory Delivery Base: KES ${factoryPricePerKg}/KG (Chinga KTDA Factory)

_Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadPdf = () => {
    let practices: TeaPracticeRecord[] = INITIAL_TEA_PRACTICE_RECORDS;
    try {
      const stored = localStorage.getItem('jr_farm_tea_practices');
      if (stored) practices = JSON.parse(stored);
    } catch {}

    generateTeaAuditPdf(teaRecords, practices, casualRatePerKg, factoryPricePerKg);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs text-2xl">
              🍃
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 rounded-full">
                  JR FARM TEA ESTATE
                </span>
                <span className="text-xs text-gray-500 font-medium">Commercial Green Leaf & Labour Operations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Tea Harvesting, Saturday Casual Payroll & Agronomy Suite
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Track daily weighing scale tickets, split casual vs employee plucking kg, disburse Saturday casual cash wages, monitor monthly factory yields, and schedule field practices.
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
              <span>Download Tea Audit PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setSubTab('daily')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'daily'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Leaf size={14} />
            <span>Daily Harvests & Scale List</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">
              {teaRecords.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('weekly')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'weekly'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Calendar size={14} />
            <span>Weekly Saturday Payouts</span>
          </button>

          <button
            onClick={() => setSubTab('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'monthly'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={14} />
            <span>Total Tea of Month</span>
          </button>

          <button
            onClick={() => setSubTab('practices')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'practices'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Wrench size={14} />
            <span>Field Agronomy & Return Dates</span>
          </button>
        </div>
      </div>

      {/* Subtab Contents */}
      {subTab === 'daily' && (
        <TeaDailyHarvestHub
          teaRecords={teaRecords}
          onAddTea={onAddTea}
          onEditTea={onEditTea}
          onDeleteTea={onDeleteTea}
          staffList={staffList}
          casualRatePerKg={casualRatePerKg}
          factoryPricePerKg={factoryPricePerKg}
        />
      )}

      {subTab === 'weekly' && (
        <TeaWeeklyPayoutHub
          teaRecords={teaRecords}
          casualRatePerKg={casualRatePerKg}
        />
      )}

      {subTab === 'monthly' && (
        <TeaMonthlyHub
          teaRecords={teaRecords}
          casualRatePerKg={casualRatePerKg}
          factoryPricePerKg={factoryPricePerKg}
        />
      )}

      {subTab === 'practices' && (
        <TeaPracticesHub
          staffList={staffList}
        />
      )}
    </div>
  );
}
