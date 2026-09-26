import React, { useState, useEffect } from 'react';
import { AvocadoRecord, AvocadoPracticeRecord, AvocadoSectionNote, InventoryItem, StaffMember } from '../../types';
import { AvocadoSalesHub } from './AvocadoSalesHub';
import { AvocadoPracticesHub } from './AvocadoPracticesHub';
import { AvocadoSectionsHub } from './AvocadoSectionsHub';
import { AvocadoDiseaseGuideModal } from './AvocadoDiseaseGuideModal';
import { generateAvocadoAuditPdf } from './AvocadoPdfGenerator';
import {
  INITIAL_AVOCADO_RECORDS,
  INITIAL_AVOCADO_PRACTICE_RECORDS,
  INITIAL_AVOCADO_SECTION_NOTES,
  INITIAL_STAFF
} from '../../initialData';
import {
  Scale,
  ShieldCheck,
  Trees,
  BookOpen,
  FileDown,
  Share2,
  Sparkles,
  Calendar,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  Package
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface AvocadoManagerProps {
  avoRecords?: AvocadoRecord[];
  onAddAvo?: (rec: AvocadoRecord) => void;
  onDeleteAvo?: (ref: string) => void;
  onEditAvo?: (oldRef: string, updated: AvocadoRecord) => void;
  inventory?: InventoryItem[];
  onUpdateInventoryStock?: (id: string, newQty: number) => void;
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function AvocadoManager({
  avoRecords: propAvoRecords,
  onAddAvo: propOnAddAvo,
  onDeleteAvo: propOnDeleteAvo,
  onEditAvo: propOnEditAvo,
  inventory = [],
  onUpdateInventoryStock,
  staffList = INITIAL_STAFF,
  onTriggerSectionReport
}: AvocadoManagerProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'sales' | 'practices' | 'sections' | 'guide'>('sales');

  // Disease Guide Modal
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Fallback state for avoRecords if not provided via props
  const [localAvoRecords, setLocalAvoRecords] = useState<AvocadoRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_avo');
    return saved ? JSON.parse(saved) : INITIAL_AVOCADO_RECORDS;
  });

  const avoRecords = propAvoRecords || localAvoRecords;

  const handleAddAvo = (rec: AvocadoRecord) => {
    if (propOnAddAvo) {
      propOnAddAvo(rec);
    } else {
      const updated = [rec, ...localAvoRecords];
      setLocalAvoRecords(updated);
      localStorage.setItem('jr_farm_avo', JSON.stringify(updated));
    }
  };

  const handleDeleteAvo = (ref: string) => {
    if (propOnDeleteAvo) {
      propOnDeleteAvo(ref);
    } else {
      const updated = localAvoRecords.filter(r => r.ref !== ref);
      setLocalAvoRecords(updated);
      localStorage.setItem('jr_farm_avo', JSON.stringify(updated));
    }
  };

  const handleEditAvo = (oldRef: string, updated: AvocadoRecord) => {
    if (propOnEditAvo) {
      propOnEditAvo(oldRef, updated);
    } else {
      const updatedList = localAvoRecords.map(r => r.ref === oldRef ? updated : r);
      setLocalAvoRecords(updatedList);
      localStorage.setItem('jr_farm_avo', JSON.stringify(updatedList));
    }
  };

  // Routine Practices State
  const [practices, setPractices] = useState<AvocadoPracticeRecord[]>(() => {
    const saved = localStorage.getItem('jr_farm_avo_practices');
    return saved ? JSON.parse(saved) : INITIAL_AVOCADO_PRACTICE_RECORDS;
  });

  useEffect(() => {
    localStorage.setItem('jr_farm_avo_practices', JSON.stringify(practices));
  }, [practices]);

  const handleAddPractice = (practice: AvocadoPracticeRecord) => {
    setPractices(prev => [practice, ...prev]);
  };

  const handleDeletePractice = (id: string) => {
    setPractices(prev => prev.filter(p => p.id !== id));
  };

  // Section Notes State
  const [sectionNotes, setSectionNotes] = useState<AvocadoSectionNote[]>(() => {
    const saved = localStorage.getItem('jr_farm_avo_sections');
    return saved ? JSON.parse(saved) : INITIAL_AVOCADO_SECTION_NOTES;
  });

  useEffect(() => {
    localStorage.setItem('jr_farm_avo_sections', JSON.stringify(sectionNotes));
  }, [sectionNotes]);

  const handleUpdateSectionNote = (updated: AvocadoSectionNote) => {
    setSectionNotes(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  // High-level aggregates
  const totalG1 = avoRecords.reduce((sum, r) => sum + (r.grade1Kg || 0), 0);
  const totalRj = avoRecords.reduce((sum, r) => sum + (r.rejectKg || 0), 0);
  const totalHarvestKg = totalG1 + totalRj;
  const totalSalesGross = avoRecords.reduce((sum, r) => sum + (r.totalSales || 0), 0);
  const totalLoss = avoRecords.reduce((sum, r) => {
    const loss = r.rejectionLossKes ?? (r.rejectKg * Math.max(0, (r.grade1PricePerKg - r.priceForRejects)));
    return sum + loss;
  }, 0);

  const todayStr = toIsoDate(new Date());
  const overdueCount = practices.filter(p => p.nextDueDate < todayStr).length;
  const upcomingCount = practices.filter(p => p.nextDueDate >= todayStr).length;

  // WhatsApp Digest Builder
  const handleShareWhatsAppDigest = () => {
    const message = `🥑 *JR FARM EXPORT AVOCADO & AGRONOMY BRIEFING*
📅 *Date:* ${new Date().toLocaleDateString()}
⭐ *Total Harvest:* ${totalHarvestKg.toLocaleString()} KG
🌟 *Grade 1 Export:* ${totalG1.toLocaleString()} KG (${totalHarvestKg > 0 ? Math.round((totalG1 / totalHarvestKg) * 100) : 0}%)
🍂 *Rejects (Domestic/Oil):* ${totalRj.toLocaleString()} KG
💰 *Gross Sales Proceeds:* KES ${Math.round(totalSalesGross).toLocaleString()}
📉 *Reject Opportunity Loss:* KES ${Math.round(totalLoss).toLocaleString()}
🛡️ *Agronomic Practices Active:* ${practices.length} (Next Overdue: ${overdueCount})
👨‍🌾 *Approved by:* Dr. Devin Omwenga (General Farm Manager)
Estate: JR Farm Commercial Horticulture`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // PDF Audit Trigger
  const handleGeneratePdf = () => {
    generateAvocadoAuditPdf(avoRecords, practices, sectionNotes);
  };

  return (
    <div className="space-y-6">

      {/* Main Header Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-emerald-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🥑</span>
            <h2 className="text-xl font-black tracking-tight">JR Farm Export Avocado Division</h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
              KEPHIS & GlobalGAP Sovereign Ledger
            </span>
          </div>
          <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
            End-to-end commercial management for Hass & Fuerte orchards: Graded sales (Grade 1 vs Rejects with opportunity loss), routine disease treatments linked to inventory drugs, trunk copper white painting, and field health notes for all blocks.
          </p>
          <div className="pt-1 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
            <Award size={13} className="text-amber-400" />
            <span>Presented & Approved by: <strong>Dr. Devin Omwenga (General Farm Manager)</strong></span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleShareWhatsAppDigest}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Share WhatsApp Digest"
          >
            <Share2 size={14} />
            <span>WhatsApp Digest</span>
          </button>

          <button
            onClick={handleGeneratePdf}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Export Official PDF Audit"
          >
            <FileDown size={14} />
            <span>Download Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale size={15} />
            <span>Graded Sales & Buyers</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
              {avoRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('practices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'practices'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Routine Practices & Disease Treatments</span>
            {overdueCount > 0 && (
              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                {overdueCount} Overdue
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trees size={15} />
            <span>Orchard Sections & Field Notes</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
              {sectionNotes.length} Blocks
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowGuideModal(true)}
          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen size={14} className="text-emerald-700" />
          <span>Disease & Drug Guide</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'sales' && (
        <AvocadoSalesHub
          records={avoRecords}
          onAddRecord={handleAddAvo}
          onDeleteRecord={handleDeleteAvo}
          onEditRecord={handleEditAvo}
          onOpenPdfReport={handleGeneratePdf}
        />
      )}

      {activeTab === 'practices' && (
        <AvocadoPracticesHub
          practices={practices}
          onAddPractice={handleAddPractice}
          onDeletePractice={handleDeletePractice}
          inventory={inventory}
          onUpdateInventoryStock={onUpdateInventoryStock}
          staffList={staffList}
        />
      )}

      {activeTab === 'sections' && (
        <AvocadoSectionsHub
          sectionNotes={sectionNotes}
          onUpdateSectionNote={handleUpdateSectionNote}
          staffList={staffList}
        />
      )}

      {/* Disease Guide Modal */}
      <AvocadoDiseaseGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        inventory={inventory}
        onSelectTreatmentForPractice={() => {
          setActiveTab('practices');
          setShowGuideModal(false);
        }}
      />

    </div>
  );
}
