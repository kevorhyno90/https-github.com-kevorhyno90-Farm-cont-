import React, { useState } from 'react';
import { BsfHarvestDistribution, StaffMember } from '../../types';
import { Scale, Plus, Trash2, Sparkles, Sprout, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface BsfHarvestHubProps {
  staffList?: StaffMember[];
  onLogHarvestYield?: (batchId: string, larvaeKg: number, frassKg: number) => void;
}

const DEFAULT_HARVESTS: BsfHarvestDistribution[] = [
  {
    id: 'harv-01',
    batchId: 'BSF-BATCH-201',
    date: '2024-09-24',
    harvestType: 'Fresh Live Larvae',
    quantityKg: 45,
    destinationUnit: 'Kuku Layers & Broilers',
    proteinValueEquivKes: 5400,
    operator: 'James Odhiambo',
    notes: 'Vigorous 5th-instar prepupae harvested via vibration sieve. Fed live directly to layers.'
  },
  {
    id: 'harv-02',
    batchId: 'BSF-BATCH-201',
    date: '2024-09-24',
    harvestType: 'Pure Organic Frass Fertilizer',
    quantityKg: 120,
    destinationUnit: 'Farm Orchards & Greenhouses (Frass)',
    proteinValueEquivKes: 4800,
    operator: 'James Odhiambo',
    notes: 'Rich biological fertilizer residue with insect exuviae and chitin. Applied to Hass avocado trees.'
  },
  {
    id: 'harv-03',
    batchId: 'BSF-BATCH-200',
    date: '2024-09-20',
    harvestType: 'Solar-Dried Whole Grubs',
    quantityKg: 35,
    destinationUnit: 'Dairy TMR Mix',
    proteinValueEquivKes: 4200,
    operator: 'Dr. Devin Omwenga',
    notes: 'Blanched in 90°C water for 2 mins, then solar tunnel dried to 8% moisture. Mixed in calf grower.'
  }
];

export function BsfHarvestHub({ staffList = [], onLogHarvestYield }: BsfHarvestHubProps) {
  const [harvests, setHarvests] = useState<BsfHarvestDistribution[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_harvests');
      return stored ? JSON.parse(stored) : DEFAULT_HARVESTS;
    } catch {
      return DEFAULT_HARVESTS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<BsfHarvestDistribution>>({
    batchId: 'BSF-BATCH-202',
    date: toIsoDate(new Date()),
    harvestType: 'Fresh Live Larvae',
    quantityKg: 30,
    destinationUnit: 'Kuku Layers & Broilers',
    proteinValueEquivKes: 3600,
    operator: staffList[0]?.name || 'James Odhiambo',
    notes: ''
  });

  const saveHarvests = (data: BsfHarvestDistribution[]) => {
    setHarvests(data);
    localStorage.setItem('jr_farm_bsf_harvests', JSON.stringify(data));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: BsfHarvestDistribution = {
      ...form,
      id: `harv-${Date.now().toString().slice(-4)}`
    } as BsfHarvestDistribution;

    saveHarvests([newEntry, ...harvests]);

    if (onLogHarvestYield && newEntry.batchId) {
      if (newEntry.harvestType === 'Pure Organic Frass Fertilizer') {
        onLogHarvestYield(newEntry.batchId, 0, newEntry.quantityKg);
      } else {
        onLogHarvestYield(newEntry.batchId, newEntry.quantityKg, 0);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this harvest record?')) {
      saveHarvests(harvests.filter(h => h.id !== id));
    }
  };

  const totalLarvaeKg = harvests
    .filter(h => h.harvestType !== 'Pure Organic Frass Fertilizer')
    .reduce((acc, curr) => acc + (curr.quantityKg || 0), 0);

  const totalFrassKg = harvests
    .filter(h => h.harvestType === 'Pure Organic Frass Fertilizer')
    .reduce((acc, curr) => acc + (curr.quantityKg || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Larvae Harvest & Frass Biofertilizer Production</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
              {totalLarvaeKg} KG Protein • {totalFrassKg} KG Frass
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Track live grub separation, solar drying, crude protein conversion, and organic biofertilizer distribution.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              batchId: 'BSF-BATCH-202',
              date: toIsoDate(new Date()),
              harvestType: 'Fresh Live Larvae',
              quantityKg: 30,
              destinationUnit: 'Kuku Layers & Broilers',
              proteinValueEquivKes: 3600,
              operator: staffList[0]?.name || 'James Odhiambo',
              notes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Record Harvest Output</span>
        </button>
      </div>

      {/* Grid of Harvest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {harvests.map(harv => {
          const isFrass = harv.harvestType === 'Pure Organic Frass Fertilizer';

          return (
            <div
              key={harv.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs space-y-3 ${
                isFrass ? 'border-amber-200' : 'border-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{harv.date}</span>
                  <h4 className="text-base font-black text-gray-900">{harv.harvestType}</h4>
                </div>
                <button onClick={() => handleDelete(harv.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Yield Quantity:</span>
                  <span className={`text-base font-black ${isFrass ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {harv.quantityKg} KG
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Origin Batch:</span>
                  <span className="font-mono font-bold text-slate-800">{harv.batchId}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Assigned Destination:</span>
                  <span className="font-semibold text-gray-900">{harv.destinationUnit}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Protein Economic Value:</span>
                  <span className="font-bold text-emerald-800">KES {(harv.proteinValueEquivKes || 0).toLocaleString()}</span>
                </div>
              </div>

              {harv.notes && (
                <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                  "{harv.notes}"
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                <span>Operator: {harv.operator || 'James Odhiambo'}</span>
                <span className="font-bold text-emerald-700">Verified & Sieved</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Record BSF Harvest & Product Dispatch</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSF-BATCH-202"
                    value={form.batchId}
                    onChange={e => setForm(prev => ({ ...prev, batchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harvested Product *</label>
                  <select
                    value={form.harvestType}
                    onChange={e => setForm(prev => ({ ...prev, harvestType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Fresh Live Larvae">Fresh Live Larvae (5th Instar)</option>
                    <option value="Solar-Dried Whole Grubs">Solar-Dried Whole Grubs (Crude Fat/Protein)</option>
                    <option value="Defatted Insect Protein Meal">Defatted Insect Protein Meal</option>
                    <option value="Pure Organic Frass Fertilizer">Pure Organic Frass Fertilizer (NPK Biofertilizer)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Yield Quantity (KG) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.quantityKg}
                    onChange={e => {
                      const qty = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        quantityKg: qty,
                        proteinValueEquivKes: qty * 120 // KES 120/kg value
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Assigned Destination Unit *</label>
                  <select
                    value={form.destinationUnit}
                    onChange={e => setForm(prev => ({ ...prev, destinationUnit: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Kuku Layers & Broilers">Kuku Layers & Broilers (Promotes hard eggshells & plumage)</option>
                    <option value="Dairy TMR Mix">Dairy Calves / Heifers TMR Mix (High-protein ration)</option>
                    <option value="Canine High-Protein Ration">Canine Working Dog Nutrition</option>
                    <option value="Farm Orchards & Greenhouses (Frass)">Farm Orchards & Greenhouses (Organic Frass Fertilizer)</option>
                    <option value="External Buyer">Commercial Sale to External Farmer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commercial Value Offset (KES)</label>
                  <input
                    type="number"
                    value={form.proteinValueEquivKes}
                    onChange={e => setForm(prev => ({ ...prev, proteinValueEquivKes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Attending Operator</label>
                  <input
                    type="text"
                    value={form.operator}
                    onChange={e => setForm(prev => ({ ...prev, operator: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Harvest Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Sieve size, moisture level, blanching temperature..."
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
                  Save Harvest Yield
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
