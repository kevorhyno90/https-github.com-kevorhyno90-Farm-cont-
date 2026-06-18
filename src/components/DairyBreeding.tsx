/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MilkingRecord, AIRecord, StaffMember } from '../types';
import { Plus, Calendar, Activity, AlertTriangle, BadgeAlert, CheckCircle2, FlaskConical, Filter, Trash2 } from 'lucide-react';

interface DairyBreedingProps {
  milkRecords: MilkingRecord[];
  aiRecords: AIRecord[];
  staffList: StaffMember[];
  onAddMilkRecord: (rec: MilkingRecord) => void;
  onAddAIRecord: (rec: AIRecord) => void;
  onUpdateAIStatus: (cowId: string, date: string, status: AIRecord['status']) => void;
  onDeleteMilkRecord: (id: string, date: string) => void;
  onDeleteAIRecord: (cowId: string, date: string) => void;
}

export function DairyBreeding({
  milkRecords,
  aiRecords,
  staffList,
  onAddMilkRecord,
  onAddAIRecord,
  onUpdateAIStatus,
  onDeleteMilkRecord,
  onDeleteAIRecord
}: DairyBreedingProps) {
  // Milking record states
  const [cowTag, setCowTag] = useState('');
  const [amLiters, setAmLiters] = useState<number | ''>('');
  const [pmLiters, setPmLiters] = useState<number | ''>('');
  const [staffName, setStaffName] = useState(staffList[0]?.name || 'Mosoti');
  const [isMilkSold, setIsMilkSold] = useState(true);
  const [milkPrice, setMilkPrice] = useState<number | ''>(52);
  const [milkBuyer, setMilkBuyer] = useState('Brookside Dairy Ltd');

  // AI record states
  const [aiCowId, setAiCowId] = useState('');
  const [aiDate, setAiDate] = useState('');
  const [aiBull, setAiBull] = useState('');

  // Filtering milking records
  const [filterCow, setFilterCow] = useState('');

  const handleMilkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cowTag.trim() || amLiters === '' || pmLiters === '') return;
    const amVal = Number(amLiters);
    const pmVal = Number(pmLiters);
    const totalVol = amVal + pmVal;

    const prVal = isMilkSold ? (milkPrice === '' ? 52 : Number(milkPrice)) : 0;
    const buyVal = isMilkSold ? (milkBuyer.trim() || 'Brookside Dairy Ltd') : '';

    onAddMilkRecord({
      id: cowTag.trim(),
      am: amVal,
      pm: pmVal,
      staff: staffName,
      date: new Date().toISOString().split('T')[0],
      pricePerLiter: prVal,
      buyer: buyVal,
      totalSales: isMilkSold ? (totalVol * prVal) : 0
    });
    setCowTag('');
    setAmLiters('');
    setPmLiters('');
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCowId.trim() || !aiDate || !aiBull.trim()) return;

    // Estimate due date (standard cow gestation is ~283 days)
    const serviceDateObj = new Date(aiDate);
    const dueDateObj = new Date(serviceDateObj);
    dueDateObj.setDate(dueDateObj.getDate() + 283);
    const estimatedDue = dueDateObj.toISOString().split('T')[0];

    onAddAIRecord({
      cowId: aiCowId.trim(),
      date: aiDate,
      bull: aiBull.trim(),
      due: estimatedDue,
      status: 'Pending'
    });

    setAiCowId('');
    setAiDate('');
    setAiBull('');
  };

  // Filter milking logs
  const filteredMilk = milkRecords
    .filter((r) => !filterCow || r.id.toLowerCase().includes(filterCow.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  // High production cows warning highlight (e.g. >30L total per day)
  const isHighProducer = (am: number, pm: number) => am + pm >= 30;

  return (
    <div className="space-y-8">
      {/* Dairy & AI Section Headers */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl shrink-0">
          <img
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b251a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M12 5h10M17 10h5M14 15c0-2.8 1-3.5 3-5h5'/><path d='M3 9a6 6 0 0 1 12 0v5a3 3 0 0 0 6 0'/></svg>"
            className="w-6 h-6 inline-block"
            alt="cow"
          />
        </div>
        <div>
          <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Lactation Management & Breeding</h4>
          <p className="text-xs text-slate-400 font-medium">
            Monitor daily milking volumes and supervise artificial insemination (AI) gestation terms under Dr. Devin Omwenga's parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Console (Milking Yield Logging) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Production Console</h5>
              <p className="text-xs text-slate-400 mt-1 font-medium">Record morning & afternoon daily milking yields</p>
            </div>
          </div>

          <form onSubmit={handleMilkingSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Cow Tag ID</label>
              <input
                type="text"
                required
                value={cowTag}
                onChange={(e) => setCowTag(e.target.value)}
                placeholder="E.g. Cow-104 (Blossom)"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">AM Liters</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={amLiters}
                onChange={(e) => setAmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Morning L"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">PM Liters</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={pmLiters}
                onChange={(e) => setPmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Afternoon L"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isMilkSold"
                checked={isMilkSold}
                onChange={(e) => setIsMilkSold(e.target.checked)}
                className="w-4 h-4 text-emerald-800 border-slate-300 rounded focus:ring-emerald-700/10 cursor-pointer"
              />
              <label htmlFor="isMilkSold" className="text-[11px] font-black text-slate-700 uppercase tracking-wide cursor-pointer flex items-center gap-1.5 select-none">
                Commercialize Sale (Post to Finance Ledger)
              </label>
            </div>

            {isMilkSold && (
              <>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Price per Liter (Ksh)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={milkPrice}
                    onChange={(e) => setMilkPrice(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Milk Purchaser / Buyer</label>
                  <input
                    type="text"
                    required
                    value={milkBuyer}
                    onChange={(e) => setMilkBuyer(e.target.value)}
                    placeholder="E.g. Brookside Dairy Ltd"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold text-slate-800"
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Milking Officer</label>
              <select
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-700"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} ({st.unit})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Record Milking Log
            </button>
          </form>

          {/* Recents logs */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Compounded Yield History</label>
              <div className="flex items-center gap-2">
                <Filter size={12} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter Cow..."
                  value={filterCow}
                  onChange={(e) => setFilterCow(e.target.value)}
                  className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto pr-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[9px] uppercase font-black">
                    <td className="p-2 font-bold uppercase">Cow / Date</td>
                    <td className="p-2 font-bold uppercase text-right">Yield AM/PM</td>
                    <td className="p-2 font-bold uppercase text-right">Commercials / Buyer</td>
                    <td className="p-2 font-bold uppercase">Staff</td>
                    <td className="p-2 font-bold uppercase text-center">Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredMilk.map((m, idx) => {
                    const price = m.pricePerLiter ?? 0;
                    const sales = m.totalSales ?? ((m.am + m.pm) * price);
                    const buyer = m.buyer ?? '';
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40">
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span className="font-black text-slate-800">{m.id}</span>
                            {isHighProducer(m.am, m.pm) && (
                              <span className="ml-1 inline-block text-[8px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-black uppercase">
                                Peak
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-slate-400 text-[9px] font-mono block">
                            {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono">
                          <span className="font-black text-emerald-800 block">{(m.am + m.pm).toFixed(1)} L</span>
                          <span className="text-[9px] text-slate-400 block">{m.am} / {m.pm} L</span>
                        </td>
                        <td className="p-2 text-right font-mono">
                          {price > 0 ? (
                            <>
                              <span className="font-black text-slate-800 block">Ksh {sales.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                              <span className="text-[9px] text-slate-400 italic block truncate max-w-[125px]">{buyer}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-extrabold text-[9px] uppercase block">Domestic Use</span>
                          )}
                        </td>
                        <td className="p-2 font-semibold text-slate-500 text-[10px] max-w-[80px] truncate">{m.staff}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => onDeleteMilkRecord(m.id, m.date)}
                            className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 inline-block align-middle"
                            title="Delete Record"
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

        {/* Breeding Ledger (AI Tracker) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Breeding Ledger</h5>
            <p className="text-xs text-slate-400 mt-1 font-medium">Artificial Insemination (AI) tracker & gestations</p>
          </div>

          <form onSubmit={handleAISubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Inseminated Cow ID</label>
              <input
                type="text"
                required
                value={aiCowId}
                onChange={(e) => setAiCowId(e.target.value)}
                placeholder="E.g. Cow-101 (Daisy)"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Service Date</label>
              <input
                type="date"
                required
                value={aiDate}
                onChange={(e) => setAiDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Bull Name / Semen straw reference</label>
              <input
                type="text"
                required
                value={aiBull}
                onChange={(e) => setAiBull(e.target.value)}
                placeholder="E.g. SEMEN-HO-991 (Holstein Elite)"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
              />
            </div>

            <button
              type="submit"
              className="col-span-2 bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Log AI Service Straw
            </button>
          </form>

          {/* Dynamic breeding registry table list */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Registered Breeding Gestations</label>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {aiRecords.map((cycle, idx) => {
                // Determine gestation safety alerts
                const daysLeft = Math.ceil(
                  (new Date(cycle.due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isClose = daysLeft > 0 && daysLeft <= 30;

                return (
                  <div key={idx} className="p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800">{cycle.cowId}</span>
                        {cycle.status === 'Confirmed Pregnant' && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black uppercase">
                            Pregnant
                          </span>
                        )}
                        {cycle.status === 'Pending' && (
                          <span className="text-[8px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-black uppercase">
                            Awaiting scan
                          </span>
                        )}
                        {cycle.status === 'Calved' && (
                          <span className="text-[8px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-black uppercase">
                            Calved
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                        Semen: {cycle.bull} • Service: {cycle.date}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                        <Calendar size={12} className="text-rose-700 font-bold shrink-0" />
                        <span>Expected Due: {new Date(cycle.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {daysLeft > 0 && (
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">
                            ({daysLeft} days until birth)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end gap-2 text-right">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Update Status</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={cycle.status}
                          onChange={(e) => onUpdateAIStatus(cycle.cowId, cycle.date, e.target.value as any)}
                          className="text-[10px] font-black uppercase border border-slate-200 rounded p-1.5 bg-white shrink-0 cursor-pointer focus:outline-none"
                        >
                          <option value="Pending">Pending Scan</option>
                          <option value="Confirmed Pregnant">Confirmed</option>
                          <option value="Calved">Calved Successfully</option>
                          <option value="Failed">Term Failed / Retreated</option>
                        </select>
                        <button
                          onClick={() => onDeleteAIRecord(cycle.cowId, cycle.date)}
                          className="text-slate-300 hover:text-red-655 p-1.5 border border-transparent hover:border-red-50 rounded transition-colors cursor-pointer m-0"
                          title="Delete Service record"
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
    </div>
  );
}
