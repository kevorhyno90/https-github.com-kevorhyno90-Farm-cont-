import React, { useState } from 'react';
import { AvocadoRecord } from '../../types';
import { AVOCADO_ORCHARD_SECTIONS } from './AvocadoDiseaseReference';
import {
  TrendingUp,
  Plus,
  Scale,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface AvocadoSalesHubProps {
  records: AvocadoRecord[];
  onAddRecord: (record: AvocadoRecord) => void;
  onDeleteRecord: (ref: string) => void;
  onEditRecord?: (oldRef: string, updated: AvocadoRecord) => void;
  onOpenPdfReport?: () => void;
}

export function AvocadoSalesHub({
  records,
  onAddRecord,
  onDeleteRecord,
  onEditRecord,
  onOpenPdfReport
}: AvocadoSalesHubProps) {
  // Form states
  const [saleDate, setSaleDate] = useState<string>(toIsoDate(new Date()));
  const [lotRef, setLotRef] = useState<string>(`EXP-LOT-${Date.now().toString().slice(-4)}`);
  const [sectionOrBlock, setSectionOrBlock] = useState<string>(AVOCADO_ORCHARD_SECTIONS[0].name);

  // Grade 1 Export States
  const [grade1Kg, setGrade1Kg] = useState<number | ''>(320);
  const [grade1PricePerKg, setGrade1PricePerKg] = useState<number | ''>(165);
  const [grade1Buyer, setGrade1Buyer] = useState<string>('Kakuzi Agribusiness Exporters');
  const [grade1BuyerContact, setGrade1BuyerContact] = useState<string>('+254 722 000 111 / export@kakuzi.co.ke');

  // Rejects States
  const [rejectKg, setRejectKg] = useState<number | ''>(38);
  const [priceForRejects, setPriceForRejects] = useState<number | ''>(40);
  const [rejectBuyer, setRejectBuyer] = useState<string>('Mt. Kenya Avocado Oil Processors');
  const [rejectReason, setRejectReason] = useState<string>('Thrips russeting & minor wind rub');

  // Payment & Terms
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer (Net 14)');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [nextHarvestSeason, setNextHarvestSeason] = useState<string>('October - December (Main Crop)');
  const [debts, setDebts] = useState<number | ''>(0);
  const [notes, setNotes] = useState<string>('Sample dry-matter tested 24.2% oil content. Class 1 phytosanitary clearance passed.');

  // Editing state
  const [editingRef, setEditingRef] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [buyerFilter, setBuyerFilter] = useState<string>('All');

  // Calculations
  const g1 = Number(grade1Kg) || 0;
  const p1 = Number(grade1PricePerKg) || 0;
  const rj = Number(rejectKg) || 0;
  const pr = Number(priceForRejects) || 0;
  const batchTotalKg = g1 + rj;
  const grade1Subtotal = g1 * p1;
  const rejectSubtotal = rj * pr;
  const totalSalesGross = grade1Subtotal + rejectSubtotal;
  const rejectionRatePct = batchTotalKg > 0 ? (rj / batchTotalKg) * 100 : 0;
  const rejectionOpportunityLoss = rj * Math.max(0, p1 - pr);

  // Overall Aggregates
  const totalAllHarvestKg = records.reduce((sum, r) => sum + (r.grade1Kg || 0) + (r.rejectKg || 0), 0);
  const totalAllGrade1Kg = records.reduce((sum, r) => sum + (r.grade1Kg || 0), 0);
  const totalAllRejectKg = records.reduce((sum, r) => sum + (r.rejectKg || 0), 0);
  const totalAllSalesKes = records.reduce((sum, r) => sum + (r.totalSales || 0), 0);
  const totalAllDebtsKes = records.reduce((sum, r) => sum + (r.debts || 0), 0);
  const totalAllRejectionLossKes = records.reduce((sum, r) => {
    const loss = r.rejectionLossKes ?? (r.rejectKg * Math.max(0, r.grade1PricePerKg - r.priceForRejects));
    return sum + loss;
  }, 0);
  const overallRejectPct = totalAllHarvestKg > 0 ? ((totalAllRejectKg / totalAllHarvestKg) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotRef.trim() || grade1Kg === '' || grade1PricePerKg === '' || rejectKg === '' || priceForRejects === '') return;

    const newRecord: AvocadoRecord = {
      ref: lotRef.trim(),
      date: saleDate,
      grade1Kg: g1,
      grade1PricePerKg: p1,
      rejectKg: rj,
      priceForRejects: pr,
      grade1Buyer: grade1Buyer.trim() || 'Kakuzi Exporters',
      rejectBuyer: rejectBuyer.trim() || 'Local Puree Processor',
      paymentMode: paymentMode.trim() || 'Deferred',
      nextHarvestSeason: nextHarvestSeason.trim() || 'Oct-Dec',
      paymentModeNextHarvestSeason: paymentMode.trim(),
      debts: debts === '' ? 0 : Number(debts),
      notes: notes.trim() || 'None',
      totalSales: totalSalesGross,
      sectionOrBlock: sectionOrBlock.trim(),
      buyerContact: grade1BuyerContact.trim() || undefined,
      rejectReason: rejectReason.trim() || undefined,
      paymentStatus: paymentStatus,
      rejectionLossKes: rejectionOpportunityLoss,
      rejectionRatePct: Number(rejectionRatePct.toFixed(1))
    };

    if (editingRef && onEditRecord) {
      onEditRecord(editingRef, newRecord);
      setEditingRef(null);
    } else {
      onAddRecord(newRecord);
    }

    // Reset lot reference for next batch
    setLotRef(`EXP-LOT-${Date.now().toString().slice(-4)}`);
    setNotes('');
  };

  // CSV Export
  const downloadCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'JR FARM EXPORT AVOCADO SALES & REJECTION AUDIT\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Shipping Ref,Block/Section,Grade 1 (KG),Grade 1 Price/KG,Grade 1 Subtotal,Grade 1 Buyer,Reject (KG),Reject Price/KG,Reject Subtotal,Reject Buyer,Reject Reason,Total Harvest (KG),Gross Total (KES),Reject Rate %,Rejection Opportunity Loss (KES),Payment Status,Debts\n';
    records.forEach((r) => {
      const g1Sub = (r.grade1Kg || 0) * (r.grade1PricePerKg || 0);
      const rjSub = (r.rejectKg || 0) * (r.priceForRejects || 0);
      const totKg = (r.grade1Kg || 0) + (r.rejectKg || 0);
      const loss = r.rejectionLossKes ?? ((r.rejectKg || 0) * Math.max(0, (r.grade1PricePerKg || 0) - (r.priceForRejects || 0)));
      const rate = r.rejectionRatePct ?? (totKg > 0 ? (((r.rejectKg || 0) / totKg) * 100).toFixed(1) : 0);
      csv += `${r.date},"${r.ref}","${r.sectionOrBlock || 'Main Block'}",${r.grade1Kg},${r.grade1PricePerKg},${g1Sub},"${r.grade1Buyer}",${r.rejectKg},${r.priceForRejects},${rjSub},"${r.rejectBuyer}","${r.rejectReason || 'Defects'}",${totKg},${r.totalSales},${rate}%,${loss},"${r.paymentStatus || 'Paid'}",${r.debts || 0}\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Avocado_Sales_Audit_${toIsoDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesBuyer = buyerFilter === 'All' || r.grade1Buyer.toLowerCase().includes(buyerFilter.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.ref.toLowerCase().includes(q) ||
      r.grade1Buyer.toLowerCase().includes(q) ||
      (r.rejectBuyer && r.rejectBuyer.toLowerCase().includes(q)) ||
      (r.sectionOrBlock && r.sectionOrBlock.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q));
    return matchesBuyer && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Harvest</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-slate-900">{totalAllHarvestKg.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">KG</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Hass & Fuerte</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Grade 1 Export</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-emerald-900">{totalAllGrade1Kg.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-700">KG</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            {totalAllHarvestKg > 0 ? ((totalAllGrade1Kg / totalAllHarvestKg) * 100).toFixed(1) : 0}% Packout
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Rejects (Domestic)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-amber-900">{totalAllRejectKg.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-700">KG</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-1">
            {overallRejectPct}% Rejection Rate
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Gross Revenue</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-emerald-950 font-mono">
              KES {Math.round(totalAllSalesKes).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Export + Puree</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Rejection Opportunity Loss</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-rose-700 font-mono">
              KES {Math.round(totalAllRejectionLossKes).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold block mt-1">Lost to Defects</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lot Debts</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-slate-800 font-mono">
              KES {Math.round(totalAllDebtsKes).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Unsettled Balance</span>
        </div>
      </div>

      {/* Main Grid: Form (5 cols) + Sales Ledger (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Graded Sales Entry Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Scale size={16} className="text-emerald-700" />
                {editingRef ? 'Edit Export Avocado Lot' : 'Log Graded Harvest & Sales Lot'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Record Grade 1 export weights, reject quantities, prices, and buyers.
              </p>
            </div>
            {editingRef && (
              <button
                type="button"
                onClick={() => setEditingRef(null)}
                className="text-[10px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* Date, Ref & Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Export Date
                </label>
                <input
                  type="date"
                  required
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold font-mono text-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Lot / Shipping Ref
                </label>
                <input
                  type="text"
                  required
                  value={lotRef}
                  onChange={(e) => setLotRef(e.target.value)}
                  placeholder="E.g. EXP-LOT-202"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Orchard Section
                </label>
                <select
                  value={sectionOrBlock}
                  onChange={(e) => setSectionOrBlock(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
                >
                  {AVOCADO_ORCHARD_SECTIONS.map((sec) => (
                    <option key={sec.id} value={sec.name}>
                      {sec.name} ({sec.code})
                    </option>
                  ))}
                  <option value="Mixed Blocks">Mixed Blocks</option>
                </select>
              </div>
            </div>

            {/* GRADE 1 SECTION */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  ⭐ Grade 1 (Export Quality)
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800">
                  Subtotal: KES {grade1Subtotal.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Weight (KG)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={grade1Kg}
                    onChange={(e) => setGrade1Kg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="KG"
                    className="w-full text-xs bg-white border border-emerald-300 rounded-xl p-2 font-black font-mono text-emerald-950"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Price / KG (KES)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={grade1PricePerKg}
                    onChange={(e) => setGrade1PricePerKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="KES/KG"
                    className="w-full text-xs bg-white border border-emerald-300 rounded-xl p-2 font-black font-mono text-emerald-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Grade 1 Buyer</label>
                  <input
                    type="text"
                    required
                    value={grade1Buyer}
                    onChange={(e) => setGrade1Buyer(e.target.value)}
                    placeholder="E.g. Kakuzi Agribusiness Exporters"
                    className="w-full text-xs bg-white border border-emerald-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Buyer Contact / Logistics</label>
                  <input
                    type="text"
                    value={grade1BuyerContact}
                    onChange={(e) => setGrade1BuyerContact(e.target.value)}
                    placeholder="E.g. Phone, email, reefer truck plate"
                    className="w-full text-xs bg-white border border-emerald-300 rounded-xl p-2 text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* REJECTS SECTION */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  🍂 Rejects (Domestic / Puree / Oil)
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-800">
                  Subtotal: KES {rejectSubtotal.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-amber-900 block mb-1">Reject Weight (KG)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={rejectKg}
                    onChange={(e) => setRejectKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="KG"
                    className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2 font-black font-mono text-amber-950"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-amber-900 block mb-1">Price / KG (KES)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={priceForRejects}
                    onChange={(e) => setPriceForRejects(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="KES/KG"
                    className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2 font-black font-mono text-amber-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-amber-900 block mb-1">Reject Buyer</label>
                  <input
                    type="text"
                    required
                    value={rejectBuyer}
                    onChange={(e) => setRejectBuyer(e.target.value)}
                    placeholder="E.g. Mt. Kenya Oil Processors, Local Puree"
                    className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-amber-900 block mb-1">Primary Reject Reason</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g. Scab, thrips russeting, sunburn, undersized"
                    className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2 text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* LIVE IMPACT ANALYSIS BANNER */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Batch Financial Analysis
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  Total KG: {batchTotalKg.toLocaleString()} KG
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[9px] block">Gross Proceeds</span>
                  <strong className="text-emerald-300 font-mono text-xs">
                    KES {totalSalesGross.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[9px] block">Rejection Rate</span>
                  <strong className={`font-mono text-xs ${
                    rejectionRatePct > 20 ? 'text-rose-400' : rejectionRatePct > 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {rejectionRatePct.toFixed(1)}%
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[9px] block">Reject Loss Cost</span>
                  <strong className="text-rose-400 font-mono text-xs">
                    KES {Math.round(rejectionOpportunityLoss).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Payment Terms, Status & Debts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Payment Mode
                </label>
                <input
                  type="text"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  placeholder="E.g. Bank Transfer, M-Pesa"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
                >
                  <option value="Paid">Paid in Full</option>
                  <option value="Pending">Pending Payment</option>
                  <option value="Partial">Partial Advance</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Outstanding Debt (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  value={debts}
                  onChange={(e) => setDebts(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="KES"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Harvest Notes & Phytosanitary Observations
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Export crating conditions, dry matter, oil test score..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>{editingRef ? 'Update Avocado Lot' : 'Log Graded Harvest & Sales Lot'}</span>
            </button>

          </form>
        </div>

        {/* Right Container: Graded Sales Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Action Ribbon & Filters */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, buyer, notes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={downloadCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={13} />
                <span>Export CSV</span>
              </button>

              {onOpenPdfReport && (
                <button
                  type="button"
                  onClick={onOpenPdfReport}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>PDF Audit</span>
                </button>
              )}

              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Lots: {filteredRecords.length}
              </span>
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredRecords.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                <Scale size={36} className="mx-auto text-slate-300" />
                <h5 className="text-sm font-bold text-slate-700">No sales lots recorded yet</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Log your avocado harvests with Grade 1 vs Rejects breakdown on the left.
                </p>
              </div>
            ) : (
              filteredRecords.map((r) => {
                const totKg = (r.grade1Kg || 0) + (r.rejectKg || 0);
                const g1Sub = (r.grade1Kg || 0) * (r.grade1PricePerKg || 0);
                const rjSub = (r.rejectKg || 0) * (r.priceForRejects || 0);
                const loss = r.rejectionLossKes ?? ((r.rejectKg || 0) * Math.max(0, (r.grade1PricePerKg || 0) - (r.priceForRejects || 0)));
                const rjPct = r.rejectionRatePct ?? (totKg > 0 ? (((r.rejectKg || 0) / totKg) * 100).toFixed(1) : 0);

                return (
                  <div
                    key={r.ref}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {r.ref}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          {r.date}
                        </span>
                        {r.sectionOrBlock && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {r.sectionOrBlock}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.paymentStatus || 'Paid'}
                        </span>

                        {onEditRecord && (
                          <button
                            onClick={() => {
                              setEditingRef(r.ref);
                              setLotRef(r.ref);
                              setSaleDate(r.date);
                              setGrade1Kg(r.grade1Kg);
                              setGrade1PricePerKg(r.grade1PricePerKg);
                              setRejectKg(r.rejectKg);
                              setPriceForRejects(r.priceForRejects);
                              setGrade1Buyer(r.grade1Buyer);
                              setRejectBuyer(r.rejectBuyer);
                              setPaymentMode(r.paymentMode || 'Deferred');
                              setDebts(r.debts || 0);
                              setNotes(r.notes || '');
                              if (r.sectionOrBlock) setSectionOrBlock(r.sectionOrBlock);
                              if (r.buyerContact) setGrade1BuyerContact(r.buyerContact);
                              if (r.rejectReason) setRejectReason(r.rejectReason);
                              if (r.paymentStatus) setPaymentStatus(r.paymentStatus);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Lot"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteRecord(r.ref)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Lot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Grade 1 vs Reject Breakdown Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      {/* Grade 1 Box */}
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-950 text-[11px]">⭐ Grade 1 Export</span>
                          <span className="font-mono font-bold text-emerald-800">
                            KES {g1Sub.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900">
                          <strong>{r.grade1Kg} KG</strong> @ KES {r.grade1PricePerKg}/kg
                        </p>
                        <p className="text-[10px] text-slate-600 truncate">
                          Buyer: <strong className="text-slate-800">{r.grade1Buyer}</strong>
                        </p>
                      </div>

                      {/* Reject Box */}
                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-950 text-[11px]">🍂 Rejects (Puree / Oil)</span>
                          <span className="font-mono font-bold text-amber-800">
                            KES {rjSub.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900">
                          <strong>{r.rejectKg} KG</strong> @ KES {r.priceForRejects}/kg ({rjPct}%)
                        </p>
                        <p className="text-[10px] text-slate-600 truncate">
                          Buyer: <strong className="text-slate-800">{r.rejectBuyer}</strong>
                        </p>
                      </div>

                    </div>

                    {/* Financial Summary & Opportunity Loss */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        {loss > 0 && (
                          <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 inline-block mr-2">
                            Defect Opportunity Cost: -KES {Math.round(loss).toLocaleString()}
                          </span>
                        )}
                        {r.debts > 0 && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 inline-block">
                            Outstanding Debt: KES {r.debts.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Gross Money Got</span>
                        <span className="text-sm font-black text-emerald-900 font-mono">
                          KES {(r.totalSales || (g1Sub + rjSub)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Notes & Reason */}
                    {(r.rejectReason || r.notes) && (
                      <div className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                        {r.rejectReason && <span>Defect Reason: {r.rejectReason}. </span>}
                        {r.notes && <span>{r.notes}</span>}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
