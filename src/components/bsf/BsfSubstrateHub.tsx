import React, { useState } from 'react';
import { BsfSubstrateBatch, StaffMember } from '../../types';
import { Leaf, Plus, Trash2, Recycle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface BsfSubstrateHubProps {
  staffList?: StaffMember[];
  onAddSubstrateToBatch?: (substrateWeight: number, batchId: string) => void;
}

const DEFAULT_SUBSTRATES: BsfSubstrateBatch[] = [
  {
    id: 'sub-01',
    date: '2024-09-24',
    sourceType: 'Avocado Waste & Pulp',
    rawWeightKg: 180,
    moistureAdjusted: true,
    allocatedToBatchId: 'BSF-BATCH-202',
    wasteDivertedKg: 180,
    operator: 'James Odhiambo',
    notes: 'Discarded avocado pulp and cracked skins from packing shed. High lipid dry matter.'
  },
  {
    id: 'sub-02',
    date: '2024-09-23',
    sourceType: 'Spent Brewers Grain',
    rawWeightKg: 250,
    moistureAdjusted: true,
    allocatedToBatchId: 'BSF-BATCH-203',
    wasteDivertedKg: 250,
    operator: 'Peter Mwangi',
    notes: 'Fresh brewer malt mash from micro-brewery partners. Rich in protein & crude fiber.'
  },
  {
    id: 'sub-03',
    date: '2024-09-21',
    sourceType: 'Dairy Cattle Manure',
    rawWeightKg: 320,
    moistureAdjusted: false,
    allocatedToBatchId: 'BSF-BATCH-201',
    wasteDivertedKg: 320,
    operator: 'Dr. Devin Omwenga',
    notes: 'Collected from zero-grazing unit slurry separator. Co-composted with dry wheat bran.'
  }
];

export function BsfSubstrateHub({ staffList = [], onAddSubstrateToBatch }: BsfSubstrateHubProps) {
  const [substrates, setSubstrates] = useState<BsfSubstrateBatch[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_substrates');
      return stored ? JSON.parse(stored) : DEFAULT_SUBSTRATES;
    } catch {
      return DEFAULT_SUBSTRATES;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<BsfSubstrateBatch>>({
    date: toIsoDate(new Date()),
    sourceType: 'Avocado Waste & Pulp',
    rawWeightKg: 150,
    moistureAdjusted: true,
    allocatedToBatchId: 'BSF-BATCH-204',
    wasteDivertedKg: 150,
    operator: staffList[0]?.name || 'James Odhiambo',
    notes: ''
  });

  const saveSubstrates = (data: BsfSubstrateBatch[]) => {
    setSubstrates(data);
    localStorage.setItem('jr_farm_bsf_substrates', JSON.stringify(data));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: BsfSubstrateBatch = {
      ...form,
      id: `sub-${Date.now().toString().slice(-4)}`
    } as BsfSubstrateBatch;

    saveSubstrates([newEntry, ...substrates]);
    if (onAddSubstrateToBatch && newEntry.allocatedToBatchId) {
      onAddSubstrateToBatch(newEntry.rawWeightKg, newEntry.allocatedToBatchId);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this substrate feed entry?')) {
      saveSubstrates(substrates.filter(s => s.id !== id));
    }
  };

  const totalDivertedKg = substrates.reduce((acc, curr) => acc + (curr.wasteDivertedKg || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Substrate Sourcing & Waste Upcycling Hub</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {totalDivertedKg.toLocaleString()} KG Waste Diverted
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Track organic avocado pulp, dairy manure, spent brewer grains, and market trimmings upcycled into protein.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              date: toIsoDate(new Date()),
              sourceType: 'Avocado Waste & Pulp',
              rawWeightKg: 150,
              moistureAdjusted: true,
              allocatedToBatchId: 'BSF-BATCH-204',
              wasteDivertedKg: 150,
              operator: staffList[0]?.name || 'James Odhiambo',
              notes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Log Biomass Substrate</span>
        </button>
      </div>

      {/* Grid of Substrate Log Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {substrates.map(sub => (
          <div key={sub.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{sub.date}</span>
                <h4 className="text-base font-black text-gray-900">{sub.sourceType}</h4>
              </div>
              <button onClick={() => handleDelete(sub.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                <Trash2 size={13} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Raw Mass Fed:</span>
                <span className="text-base font-black text-emerald-700">{sub.rawWeightKg} KG</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Allocated Batch:</span>
                <span className="font-mono font-bold text-slate-800">{sub.allocatedToBatchId}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Moisture Adjusted (65-70%):</span>
                <span className={`font-semibold ${sub.moistureAdjusted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {sub.moistureAdjusted ? 'Optimal' : 'Raw Wet Slurry'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Attending Operator:</span>
                <span className="font-semibold text-gray-800">{sub.operator || 'Farm Staff'}</span>
              </div>
            </div>

            {sub.notes && (
              <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                "{sub.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Log Organic Waste Substrate Upcycling</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Substrate Source Biomass *</label>
                <select
                  value={form.sourceType}
                  onChange={e => setForm(prev => ({ ...prev, sourceType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="Avocado Waste & Pulp">Avocado Waste & Discarded Pulp</option>
                  <option value="Spent Brewers Grain">Spent Brewers Grain (Malt Mash)</option>
                  <option value="Dairy Cattle Manure">Dairy Cattle Manure & Slurry Solids</option>
                  <option value="Market Vegetable Trimmings">Market Vegetable & Fruit Trimmings</option>
                  <option value="Kitchen & Fruit Peelings">Kitchen & Canteen Organic Peelings</option>
                  <option value="Mixed Organic Biomass">Mixed Organic High-Carb Biomass</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Raw Weight (KG) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={form.rawWeightKg}
                    onChange={e => setForm(prev => ({ ...prev, rawWeightKg: Number(e.target.value), wasteDivertedKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Allocated to BSF Batch *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSF-BATCH-204"
                    value={form.allocatedToBatchId}
                    onChange={e => setForm(prev => ({ ...prev, allocatedToBatchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date Logged</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Operator</label>
                  <input
                    type="text"
                    value={form.operator}
                    onChange={e => setForm(prev => ({ ...prev, operator: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                <input
                  type="checkbox"
                  id="moist"
                  checked={form.moistureAdjusted}
                  onChange={e => setForm(prev => ({ ...prev, moistureAdjusted: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="moist" className="font-bold text-emerald-950 cursor-pointer">
                  Moisture content pre-conditioned between 65% – 70% before grub feeding
                </label>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Processing Notes</label>
                <textarea
                  rows={2}
                  placeholder="Substrate condition, shredding/grinding applied, odor management..."
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Substrate Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
