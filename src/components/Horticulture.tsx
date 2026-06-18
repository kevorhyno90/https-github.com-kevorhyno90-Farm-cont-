/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeaRecord, AvocadoRecord } from '../types';
import { Leaf, Plus, Package, Activity, BadgePercent, Filter, TrendingUp, Trash2 } from 'lucide-react';

interface HorticultureProps {
  teaRecords: TeaRecord[];
  avoRecords: AvocadoRecord[];
  onAddTea: (rec: TeaRecord) => void;
  onAddAvo: (rec: AvocadoRecord) => void;
  onDeleteTea: (ref: string) => void;
  onDeleteAvo: (ref: string) => void;
}

export function Horticulture({ teaRecords, avoRecords, onAddTea, onAddAvo, onDeleteTea, onDeleteAvo }: HorticultureProps) {
  // Tea state
  const [teaQty, setTeaQty] = useState<number | ''>('');
  const [teaRef, setTeaRef] = useState('');
  const [teaPrice, setTeaPrice] = useState<number | ''>(58); // default base rate Ksh
  const [teaBuyer, setTeaBuyer] = useState('Chinga KTDA Factory'); // default buyer

  // Avocado state
  const [avoRef, setAvoRef] = useState('');
  const [gradeA, setGradeA] = useState<number | ''>('');
  const [gradeB, setGradeB] = useState<number | ''>('');
  const [rejectKg, setRejectKg] = useState<number | ''>('');
  const [priceGradeA, setPriceGradeA] = useState<number | ''>(1500); // per box
  const [priceGradeB, setPriceGradeB] = useState<number | ''>(850);  // per box
  const [priceReject, setPriceReject] = useState<number | ''>(38);   // per KG
  const [avoBuyer, setAvoBuyer] = useState('Kakuzi Agribusiness Exporters');

  const handleTeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teaQty === '' || !teaRef.trim()) return;
    const qtyVal = Number(teaQty);
    const prVal = teaPrice === '' ? 58 : Number(teaPrice);
    const buyVal = teaBuyer.trim() || 'KTDA Factory';
    onAddTea({
      qty: qtyVal,
      ref: teaRef.trim(),
      date: new Date().toISOString().split('T')[0],
      pricePerKg: prVal,
      buyer: buyVal,
      totalSales: qtyVal * prVal
    });
    setTeaQty('');
    setTeaRef('');
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
      date: new Date().toISOString().split('T')[0],
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
  };

  // Compute total aggregates for Horticulture
  const totalTeaAllTime = teaRecords.reduce((sum, r) => sum + r.qty, 0);
  const totalAvoBoxes = avoRecords.reduce((sum, r) => sum + r.gradeA + r.gradeB, 0);

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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Collection Receipt Timeline</label>
              <span className="font-bold text-emerald-900">Total: {totalTeaAllTime.toLocaleString()} KG</span>
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
                          <button
                            onClick={() => onDeleteTea(t.ref)}
                            className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 inline-block"
                            title="Delete Receipt"
                          >
                            <Trash2 size={12} />
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Export Shipping Ledger</label>
              <span className="font-bold text-indigo-950">Total Boxes: {totalAvoBoxes} Bags/Crates</span>
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
                      <button
                        onClick={() => onDeleteAvo(item.ref)}
                        className="text-slate-300 hover:text-red-650 p-2 rounded transition-colors cursor-pointer m-0 border hover:border-red-100 bg-white"
                        title="Delete shipment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
