import React, { useState } from 'react';
import { BsfEggCollectionRecord, StaffMember } from '../../types';
import { Plus, Trash2, Calendar, Sparkles, Clock, CheckCircle2, User, Layers } from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';

interface BsfEggCollectionHubProps {
  staffList?: StaffMember[];
  onInoculateNewBatch?: (eggBatchNumber: string, eggGrams: number, date: string) => void;
}

const DEFAULT_EGG_COLLECTIONS: BsfEggCollectionRecord[] = [
  {
    id: 'egg-01',
    eggBatchNumber: 'EGG-BATCH-2024-042',
    dayOfCollection: '2024-09-24',
    eggWeightGrams: 34.5,
    cageOrAviarySource: 'Love Cage 01 (Alpha Aviary)',
    incubationDate: '2024-09-24',
    expectedHatchDate: '2024-09-28',
    hatchRatePercent: 92,
    substrateInoculated: 'Finely ground wheat bran with 70% moisture',
    destinationBatchId: 'BSF-BATCH-204',
    collectorName: 'James Odhiambo',
    notes: 'Harvested from 12 wood flute eggies blocks. Healthy golden egg clusters without mold.'
  },
  {
    id: 'egg-02',
    eggBatchNumber: 'EGG-BATCH-2024-041',
    dayOfCollection: '2024-09-21',
    eggWeightGrams: 28.0,
    cageOrAviarySource: 'Love Cage 02 (Beta Aviary)',
    incubationDate: '2024-09-21',
    expectedHatchDate: '2024-09-25',
    hatchRatePercent: 90,
    substrateInoculated: 'Moistened starter bran puree',
    destinationBatchId: 'BSF-BATCH-203',
    collectorName: 'Peter Mwangi',
    notes: 'Hatched on day 4 into active 5-DOL neonate crawling mass.'
  }
];

export function BsfEggCollectionHub({ staffList = [], onInoculateNewBatch }: BsfEggCollectionHubProps) {
  const [collections, setCollections] = useState<BsfEggCollectionRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_egg_collections');
      return stored ? JSON.parse(stored) : DEFAULT_EGG_COLLECTIONS;
    } catch {
      return DEFAULT_EGG_COLLECTIONS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<BsfEggCollectionRecord>>({
    eggBatchNumber: `EGG-BATCH-${toIsoDate(new Date()).slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
    dayOfCollection: toIsoDate(new Date()),
    eggWeightGrams: 25.0,
    cageOrAviarySource: 'Love Cage 01 (Alpha Aviary)',
    incubationDate: toIsoDate(new Date()),
    expectedHatchDate: offsetIsoDate(4),
    hatchRatePercent: 90,
    substrateInoculated: 'Finely ground wheat bran puree (70% moisture)',
    destinationBatchId: `BSF-BATCH-${Math.floor(200 + Math.random() * 50)}`,
    collectorName: staffList[0]?.name || 'James Odhiambo',
    notes: ''
  });

  const saveCollections = (data: BsfEggCollectionRecord[]) => {
    setCollections(data);
    localStorage.setItem('jr_farm_bsf_egg_collections', JSON.stringify(data));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eggBatchNumber || !form.eggWeightGrams) return;

    const newRec: BsfEggCollectionRecord = {
      ...form,
      id: `egg-${Date.now().toString().slice(-4)}`
    } as BsfEggCollectionRecord;

    saveCollections([newRec, ...collections]);

    if (onInoculateNewBatch) {
      onInoculateNewBatch(newRec.eggBatchNumber, newRec.eggWeightGrams, newRec.dayOfCollection);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this egg collection entry?')) {
      saveCollections(collections.filter(c => c.id !== id));
    }
  };

  const totalGrams = collections.reduce((acc, curr) => acc + (curr.eggWeightGrams || 0), 0);
  const totalNeonates = Math.round(totalGrams * 35000);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Egg Collection, Day of Harvest & Batch Tracking</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full">
              {totalGrams.toFixed(1)} Grams Harvested (~{(totalNeonates / 1000).toFixed(0)}k Neonates)
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Log exact day of egg collection, egg batch numbers, cluster weights in grams, incubator setup, and hatch dates (+4d).
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              eggBatchNumber: `EGG-BATCH-${toIsoDate(new Date()).slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
              dayOfCollection: toIsoDate(new Date()),
              eggWeightGrams: 25.0,
              cageOrAviarySource: 'Love Cage 01 (Alpha Aviary)',
              incubationDate: toIsoDate(new Date()),
              expectedHatchDate: offsetIsoDate(4),
              hatchRatePercent: 90,
              substrateInoculated: 'Finely ground wheat bran puree (70% moisture)',
              destinationBatchId: `BSF-BATCH-${Math.floor(200 + Math.random() * 50)}`,
              collectorName: staffList[0]?.name || 'James Odhiambo',
              notes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Log Egg Collection</span>
        </button>
      </div>

      {/* Grid of Collection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map(col => (
          <div key={col.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{col.dayOfCollection}</span>
                <h4 className="text-base font-black text-gray-900">{col.eggBatchNumber}</h4>
              </div>
              <button onClick={() => handleDelete(col.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                <Trash2 size={13} />
              </button>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-purple-900 uppercase">Egg Weight Harvested:</span>
                <span className="text-base font-black text-purple-900">{col.eggWeightGrams} grams</span>
              </div>
              <div className="flex justify-between text-purple-800 text-[11px]">
                <span>Est. Neonates (35k/g):</span>
                <span className="font-mono font-bold">~{(col.eggWeightGrams * 35000).toLocaleString()} neonates</span>
              </div>
              <div className="flex justify-between text-purple-800 text-[11px]">
                <span>Source Aviary:</span>
                <span className="font-semibold">{col.cageOrAviarySource}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span>Incubation Start:</span>
                <span className="font-mono font-bold text-gray-800">{col.incubationDate || col.dayOfCollection}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Hatch (+4d):</span>
                <span className="font-mono font-bold text-emerald-700">{col.expectedHatchDate || 'Day 4'}</span>
              </div>
              <div className="flex justify-between">
                <span>Hatchability Rate:</span>
                <span className="font-semibold text-emerald-800">{col.hatchRatePercent || 90}%</span>
              </div>
              <div className="flex justify-between">
                <span>Destination Batch:</span>
                <span className="font-mono font-bold text-slate-800">{col.destinationBatchId || 'Tray Colony'}</span>
              </div>
            </div>

            {col.notes && (
              <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                "{col.notes}"
              </p>
            )}

            <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
              <span>Collector: {col.collectorName || 'Farm Staff'}</span>
              <span className="font-bold text-purple-700">Eggies Disinfected</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-gray-900">Record BSF Egg Collection</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Egg Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={form.eggBatchNumber}
                    onChange={e => setForm(prev => ({ ...prev, eggBatchNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Day of Egg Collection *</label>
                  <input
                    type="date"
                    required
                    value={form.dayOfCollection}
                    onChange={e => {
                      const day = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        dayOfCollection: day,
                        incubationDate: day,
                        expectedHatchDate: offsetIsoDate(4, new Date(day))
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Egg Weight (Grams) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.eggWeightGrams}
                    onChange={e => setForm(prev => ({ ...prev, eggWeightGrams: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-black text-purple-700"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    ~{Math.round((form.eggWeightGrams || 0) * 35000).toLocaleString()} neonates
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Source Love Cage</label>
                  <input
                    type="text"
                    value={form.cageOrAviarySource}
                    onChange={e => setForm(prev => ({ ...prev, cageOrAviarySource: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Incubation Date</label>
                  <input
                    type="date"
                    value={form.incubationDate}
                    onChange={e => setForm(prev => ({ ...prev, incubationDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Hatch Date (+4d)</label>
                  <input
                    type="date"
                    value={form.expectedHatchDate}
                    onChange={e => setForm(prev => ({ ...prev, expectedHatchDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Destination Batch ID</label>
                  <input
                    type="text"
                    placeholder="e.g. BSF-BATCH-205"
                    value={form.destinationBatchId}
                    onChange={e => setForm(prev => ({ ...prev, destinationBatchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Collector Name</label>
                  <input
                    type="text"
                    value={form.collectorName}
                    onChange={e => setForm(prev => ({ ...prev, collectorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Starter Substrate Inoculated</label>
                <input
                  type="text"
                  placeholder="e.g. Finely ground wheat bran puree (70% moisture)"
                  value={form.substrateInoculated}
                  onChange={e => setForm(prev => ({ ...prev, substrateInoculated: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Collection & Eggies Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Wood flute condition, odor, cluster density..."
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
                  Save Egg Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
