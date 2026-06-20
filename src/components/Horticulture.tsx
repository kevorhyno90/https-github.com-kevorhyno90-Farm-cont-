/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeaRecord, AvocadoRecord } from '../types';
import { Leaf, Plus, Package, Activity, BadgePercent, Filter, TrendingUp, Trash2, Edit2, FileSpreadsheet } from 'lucide-react';

interface HorticultureProps {
  teaRecords: TeaRecord[];
  avoRecords: AvocadoRecord[];
  onAddTea: (rec: TeaRecord) => void;
  onAddAvo: (rec: AvocadoRecord) => void;
  onDeleteTea: (ref: string) => void;
  onDeleteAvo: (ref: string) => void;
  onEditTea?: (oldRef: string, updated: TeaRecord) => void;
  onEditAvo?: (oldRef: string, updated: AvocadoRecord) => void;
}

export function Horticulture({ teaRecords, avoRecords, onAddTea, onAddAvo, onDeleteTea, onDeleteAvo, onEditTea, onEditAvo }: HorticultureProps) {
  // Tea state
  const [teaQty, setTeaQty] = useState<number | ''>('');
  const [teaRef, setTeaRef] = useState('');
  const [teaPrice, setTeaPrice] = useState<number | ''>(58); // default base rate Ksh
  const [teaBuyer, setTeaBuyer] = useState('Chinga KTDA Factory'); // default buyer
  const [teaDate, setTeaDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit States
  const [editingTea, setEditingTea] = useState<TeaRecord | null>(null);
  const [editingAvo, setEditingAvo] = useState<AvocadoRecord | null>(null);

  // Avocado state
  const [avoRef, setAvoRef] = useState('');
  const [gradeA, setGradeA] = useState<number | ''>('');
  const [gradeB, setGradeB] = useState<number | ''>('');
  const [rejectKg, setRejectKg] = useState<number | ''>('');
  const [priceGradeA, setPriceGradeA] = useState<number | ''>(1500); // per box
  const [priceGradeB, setPriceGradeB] = useState<number | ''>(850);  // per box
  const [priceReject, setPriceReject] = useState<number | ''>(38);   // per KG
  const [avoBuyer, setAvoBuyer] = useState('Kakuzi Agribusiness Exporters');
  const [avoDate, setAvoDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teaQty === '' || !teaRef.trim()) return;
    const qtyVal = Number(teaQty);
    const prVal = teaPrice === '' ? 58 : Number(teaPrice);
    const buyVal = teaBuyer.trim() || 'KTDA Factory';
    onAddTea({
      qty: qtyVal,
      ref: teaRef.trim(),
      date: teaDate,
      pricePerKg: prVal,
      buyer: buyVal,
      totalSales: qtyVal * prVal
    });
    setTeaQty('');
    setTeaRef('');
    setTeaDate(new Date().toISOString().split('T')[0]);
  };

  const handleAvoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gradeA === '' || gradeB === '' || rejectKg === '' || !avoRef.trim()) return;
    const ga = Number(gradeA);
    const gb = Number(gradeB);
    const rj = Number(rejectKg);
    const pA = priceGradeA === '' ? 1500 : Number(priceGradeA);
    const pB = priceGradeB === '' ? 850 : Number(priceGradeB);
    const pR = priceReject === '' ? 38 : Number(priceReject);
    const buyVal = avoBuyer.trim() || 'Kakuzi Exporters';

    onAddAvo({
      gradeA: ga,
      gradeB: gb,
      reject: rj,
      ref: avoRef.trim(),
      date: avoDate,
      priceGradeA: pA,
      priceGradeB: pB,
      priceReject: pR,
      buyer: buyVal,
      totalSales: (ga * pA) + (gb * pB) + (rj * pR)
    });
    setGradeA('');
    setGradeB('');
    setRejectKg('');
    setAvoRef('');
    setAvoDate(new Date().toISOString().split('T')[0]);
  };

  // Compute total aggregates for Horticulture
  const totalTeaAllTime = teaRecords.reduce((sum, r) => sum + r.qty, 0);
  const totalAvoBoxes = avoRecords.reduce((sum, r) => sum + r.gradeA + r.gradeB, 0);

  // CSV downlod helper functions
  const downloadTeaCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'KTDA TEA EXPORTS HARVEST & DELIVERIES\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Plucking Ref,Primary Buyer,Harvest Weight (KG),Price/KG (Ksh),Gross Amount (Ksh)\n';
    teaRecords.forEach((t) => {
      const p = t.pricePerKg ?? 58;
      const b = t.buyer ?? 'Chinga KTDA Factory';
      const s = t.totalSales ?? (t.qty * p);
      csv += `${t.date},"${t.ref}","${b}",${t.qty},${p},${s}\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tea_Harvest_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAvoCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'AVOCADO EXPORT LOGISTICS & REVENUES\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Shipping Ref,Primary Exporter,Grade A (Boxes),Grade B (Boxes),Reject (KG),Price Grade A (Ksh),Price Grade B (Ksh),Price Reject (Ksh),Gross Revenue (Ksh)\n';
    avoRecords.forEach((item) => {
      const pA = item.priceGradeA ?? 1500;
      const pB = item.priceGradeB ?? 850;
      const pR = item.priceReject ?? 38;
      const b = item.buyer ?? 'Kakuzi Agribusiness Exporters';
      const s = item.totalSales ?? ((item.gradeA * pA) + (item.gradeB * pB) + (item.reject * pR));
      csv += `${item.date},"${item.ref}","${b}",${item.gradeA},${item.gradeB},${item.reject},${pA},${pB},${pR},${s}\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Avocado_Export_Logistics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Overview Intro Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-100 text-indigo-950 rounded-xl shrink-0">
          <Leaf size={24} className="text-emerald-800" />
        </div>
        <div>
          <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Horticulture Export Ledger</h4>
          <p className="text-xs text-slate-400 font-medium">
            Register daily tea leaf weights and avocado grading crates. Keep export records in absolute alignment with KEPHIS & GlobalGAP frameworks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tea plucking ledger */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Tea KTDA Deliveries</h5>
            <p className="text-xs text-slate-400 mt-1 font-medium">Record daily pluck weight delivered to factory</p>
          </div>

          <form onSubmit={handleTeaSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">KGs Harvested</label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={teaQty}
                onChange={(e) => setTeaQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="E.g. 145"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Collection Ref</label>
              <input
                type="text"
                required
                value={teaRef}
                onChange={(e) => setTeaRef(e.target.value)}
                placeholder="E.g. KTDA-TX-998"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Price per KG (Ksh)</label>
              <input
                type="number"
                required
                min="1"
                value={teaPrice}
                onChange={(e) => setTeaPrice(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="E.g. 58"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Primary Buyer</label>
              <input
                type="text"
                required
                value={teaBuyer}
                onChange={(e) => setTeaBuyer(e.target.value)}
                placeholder="E.g. Chinga KTDA Factory"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold text-slate-800"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Harvest Logging Date</label>
              <input
                type="date"
                required
                value={teaDate}
                onChange={(e) => setTeaDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono cursor-pointer bg-white"
              />
            </div>
            <button
              type="submit"
              className="col-span-2 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Save Tea Log & Income
            </button>
          </form>

          {/* Past tea logs */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">Collection Receipt Timeline</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadTeaCSV}
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded font-black text-[9px] uppercase transition-all shadow-xs cursor-pointer m-0"
                  title="Export Tea Harvests CSV"
                >
                  <FileSpreadsheet size={10} />
                  Export CSV
                </button>
                <span className="font-bold text-emerald-900">Total: {totalTeaAllTime.toLocaleString()} KG</span>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto pr-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[9px] uppercase font-black text-slate-400">
                    <td className="p-2 font-bold text-slate-500 uppercase">Collection Details</td>
                    <td className="p-2 font-bold text-slate-500 uppercase text-right">Yield & Rate</td>
                    <td className="p-2 font-bold text-slate-500 uppercase text-right">Sales Valuation</td>
                    <td className="p-2 font-bold text-slate-500 uppercase text-center">Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {[...teaRecords].sort((a,b)=> b.date.localeCompare(a.date)).map((t, idx) => {
                    const price = t.pricePerKg ?? 58;
                    const totVal = t.totalSales ?? (t.qty * price);
                    const buyer = t.buyer ?? 'Chinga KTDA Factory';
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/20">
                        <td className="p-2">
                          <span className="font-extrabold text-slate-700 block text-xs">{t.ref}</span>
                          <span className="block text-[9px] text-slate-450 uppercase font-mono">
                            {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="block text-[10px] font-medium text-emerald-800 italic truncate max-w-[155px]">
                            Buyer: {buyer}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <span className="font-mono font-black text-slate-800 block">{t.qty.toFixed(1)} KG</span>
                          <span className="font-mono text-[9px] text-slate-400 block">Ksh {price.toFixed(0)}/KG</span>
                        </td>
                        <td className="p-2 text-right">
                          <span className="font-mono font-black text-emerald-800 block">Ksh {totVal.toLocaleString()}</span>
                          <span className="text-[8px] bg-emerald-100 font-extrabold text-emerald-900 px-1 py-0.2 rounded inline-block uppercase">Sold</span>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onEditTea && (
                              <button
                                onClick={() => setEditingTea(t)}
                                className="text-slate-300 hover:text-[#0e3a24] p-1 rounded transition-colors cursor-pointer m-0 inline-block"
                                title="Edit Receipt"
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteTea(t.ref)}
                              className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 inline-block"
                              title="Delete Receipt"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Avocado packing graded ledger */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Avocado Export Harvest</h5>
            <p className="text-xs text-slate-400 mt-1 font-medium">Record graded crates ready for shipping exporter</p>
          </div>

          <form onSubmit={handleAvoSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Grade A (Export Boxes)</label>
              <input
                type="number"
                required
                min="0"
                value={gradeA}
                onChange={(e) => setGradeA(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Grade A quantity"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Grade A Price per Box (Ksh)</label>
              <input
                type="number"
                required
                min="1"
                value={priceGradeA}
                onChange={(e) => setPriceGradeA(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Grade B (Boxes)</label>
              <input
                type="number"
                required
                min="0"
                value={gradeB}
                onChange={(e) => setGradeB(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Grade B quantity"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Grade B Price per Box (Ksh)</label>
              <input
                type="number"
                required
                min="1"
                value={priceGradeB}
                onChange={(e) => setPriceGradeB(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Reject (KG)</label>
              <input
                type="number"
                required
                min="0"
                value={rejectKg}
                onChange={(e) => setRejectKg(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Rejects in weight"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Reject Price per KG (Ksh)</label>
              <input
                type="number"
                required
                min="1"
                value={priceReject}
                onChange={(e) => setPriceReject(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Shipping Ref</label>
              <input
                type="text"
                required
                value={avoRef}
                onChange={(e) => setAvoRef(e.target.value)}
                placeholder="E.g. KEPHIS-EXP-205"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Exporter / Buyer</label>
              <input
                type="text"
                required
                value={avoBuyer}
                onChange={(e) => setAvoBuyer(e.target.value)}
                placeholder="E.g. Kakuzi Exporters"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Export Logging Date</label>
              <input
                type="date"
                required
                value={avoDate}
                onChange={(e) => setAvoDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono cursor-pointer bg-white"
              />
            </div>
            <button
              type="submit"
              className="col-span-2 bg-emerald-905 bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Log Avocado Harvest & Export Income
            </button>
          </form>

          {/* Past avocado grading */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">Export Shipping Ledger</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadAvoCSV}
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 rounded font-black text-[9px] uppercase transition-all shadow-xs cursor-pointer m-0"
                  title="Export Avocado Logistics CSV"
                >
                  <FileSpreadsheet size={10} />
                  Export CSV
                </button>
                <span className="font-bold text-indigo-950">Total Boxes: {totalAvoBoxes} Bags/Crates</span>
              </div>
            </div>

            <div className="max-h-[30rem] overflow-y-auto pr-1">
              {avoRecords.map((item, idx) => {
                const totalCrates = item.gradeA + item.gradeB;
                const ratio = totalCrates > 0 ? (item.gradeA / totalCrates) * 100 : 0;
                const pA = item.priceGradeA ?? 1500;
                const pB = item.priceGradeB ?? 850;
                const pR = item.priceReject ?? 38;
                const totVal = item.totalSales ?? ((item.gradeA * pA) + (item.gradeB * pB) + (item.reject * pR));
                const buyer = item.buyer ?? 'Kakuzi Agribusiness Exporters';

                return (
                  <div key={idx} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs mb-3 hover:bg-slate-50 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-800">{item.ref}</span>
                        <span className="text-[9px] bg-slate-200/80 font-bold text-slate-500 px-2 py-0.5 rounded uppercase font-mono">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 font-extrabold italic uppercase leading-none">
                        Exporter: {buyer}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 font-medium">
                        <span>A: <strong>{item.gradeA}</strong> Box (Ksh {pA}/bx)</span>
                        <span>•</span>
                        <span>B: <strong>{item.gradeB}</strong> Box (Ksh {pB}/bx)</span>
                        <span>•</span>
                        <span>Reject: <strong>{item.reject}</strong> KG (Ksh {pR}/kg)</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                      <div className="text-left sm:text-right">
                        <span className="text-base font-black text-emerald-800 font-mono block">
                          Ksh {totVal.toLocaleString()}
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded font-black mt-1 inline-block uppercase">
                          {ratio.toFixed(0)}% Grade A
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {onEditAvo && (
                          <button
                            onClick={() => setEditingAvo(item)}
                            className="text-slate-300 hover:text-indigo-850 p-2 rounded transition-colors cursor-pointer m-0 border hover:border-slate-200 bg-white"
                            title="Edit shipment"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteAvo(item.ref)}
                          className="text-slate-300 hover:text-red-650 p-2 rounded transition-colors cursor-pointer m-0 border hover:border-red-100 bg-white"
                          title="Delete shipment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Editing Tea Modal */}
      {editingTea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Tea Record ({editingTea.ref})</h3>
              <button onClick={() => setEditingTea(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date</label>
                <input
                  type="date"
                  value={editingTea.date}
                  onChange={(e) => setEditingTea({ ...editingTea, date: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Quantity (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingTea.qty}
                  onChange={(e) => setEditingTea({ ...editingTea, qty: parseFloat(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Price per KG (Ksh)</label>
                <input
                  type="number"
                  value={editingTea.pricePerKg ?? 58}
                  onChange={(e) => setEditingTea({ ...editingTea, pricePerKg: parseInt(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Primary Buyer</label>
                <input
                  type="text"
                  value={editingTea.buyer ?? ''}
                  onChange={(e) => setEditingTea({ ...editingTea, buyer: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingTea(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditTea) {
                    onEditTea(editingTea.ref, {
                      ...editingTea,
                      totalSales: editingTea.qty * (editingTea.pricePerKg ?? 58),
                    });
                  }
                  setEditingTea(null);
                }}
                className="px-5 py-2.5 bg-emerald-950 text-white rounded-lg text-xs font-black uppercase hover:bg-emerald-900 m-0 shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Avocado Modal */}
      {editingAvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Avocado Shipment ({editingAvo.ref})</h3>
              <button onClick={() => setEditingAvo(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date</label>
                <input
                  type="date"
                  value={editingAvo.date}
                  onChange={(e) => setEditingAvo({ ...editingAvo, date: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Grade A (Box count)</label>
                  <input
                    type="number"
                    value={editingAvo.gradeA}
                    onChange={(e) => setEditingAvo({ ...editingAvo, gradeA: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Grade B (Box count)</label>
                  <input
                    type="number"
                    value={editingAvo.gradeB}
                    onChange={(e) => setEditingAvo({ ...editingAvo, gradeB: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Price Grade A (Ksh/box)</label>
                  <input
                    type="number"
                    value={editingAvo.priceGradeA ?? 1500}
                    onChange={(e) => setEditingAvo({ ...editingAvo, priceGradeA: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Price Grade B (Ksh/box)</label>
                  <input
                    type="number"
                    value={editingAvo.priceGradeB ?? 850}
                    onChange={(e) => setEditingAvo({ ...editingAvo, priceGradeB: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Reject (KG count)</label>
                  <input
                    type="number"
                    value={editingAvo.reject}
                    onChange={(e) => setEditingAvo({ ...editingAvo, reject: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Price Reject (Ksh/KG)</label>
                  <input
                    type="number"
                    value={editingAvo.priceReject ?? 38}
                    onChange={(e) => setEditingAvo({ ...editingAvo, priceReject: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Exporter / Buyer Name</label>
                <input
                  type="text"
                  value={editingAvo.buyer ?? ''}
                  onChange={(e) => setEditingAvo({ ...editingAvo, buyer: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingAvo(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditAvo) {
                    const pA = editingAvo.priceGradeA ?? 1500;
                    const pB = editingAvo.priceGradeB ?? 850;
                    const pR = editingAvo.priceReject ?? 38;
                    onEditAvo(editingAvo.ref, {
                      ...editingAvo,
                      totalSales: (editingAvo.gradeA * pA) + (editingAvo.gradeB * pB) + (editingAvo.reject * pR),
                    });
                  }
                  setEditingAvo(null);
                }}
                className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
