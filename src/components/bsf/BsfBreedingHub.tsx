import React, { useState } from 'react';
import { BsfLoveCageBreedingLog } from '../../types';
import { Plus, Trash2, Heart, Sun, Thermometer, Droplets, Sparkles, CheckCircle2 } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

const DEFAULT_BREEDING_LOGS: BsfLoveCageBreedingLog[] = [
  {
    id: 'cage-01',
    cageId: 'Love Cage 01 — Aviary Alpha (Greenhouse)',
    date: '2024-09-24',
    pupaeIntroducedKg: 15,
    eggClustersHarvestedGrams: 32.5,
    hatchRatePercentage: 92,
    attractantUsed: 'Fermented Fruit & Yeast',
    lightingConditions: 'Natural Sunlight & UV Led',
    ambientTempC: 31,
    ambientHumidityPercent: 72,
    notes: 'Intense oviposition in wood flutes. Flies active under afternoon solar illumination.'
  },
  {
    id: 'cage-02',
    cageId: 'Love Cage 02 — Aviary Beta (Nursery)',
    date: '2024-09-22',
    pupaeIntroducedKg: 12,
    eggClustersHarvestedGrams: 26.0,
    hatchRatePercentage: 89,
    attractantUsed: 'Decomposing Bran',
    lightingConditions: 'Natural Sunlight & UV Led',
    ambientTempC: 29.5,
    ambientHumidityPercent: 68,
    notes: 'Eggies harvested into 5-DOL neonate starter boxes. Optimal hatchability.'
  }
];

export function BsfBreedingHub() {
  const [logs, setLogs] = useState<BsfLoveCageBreedingLog[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_breeding_logs');
      return stored ? JSON.parse(stored) : DEFAULT_BREEDING_LOGS;
    } catch {
      return DEFAULT_BREEDING_LOGS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<BsfLoveCageBreedingLog>>({
    cageId: 'Love Cage 01 — Aviary Alpha (Greenhouse)',
    date: toIsoDate(new Date()),
    pupaeIntroducedKg: 15,
    eggClustersHarvestedGrams: 30,
    hatchRatePercentage: 90,
    attractantUsed: 'Fermented Fruit & Yeast',
    lightingConditions: 'Natural Sunlight & UV Led',
    ambientTempC: 30,
    ambientHumidityPercent: 70,
    notes: ''
  });

  const saveLogs = (data: BsfLoveCageBreedingLog[]) => {
    setLogs(data);
    localStorage.setItem('jr_farm_bsf_breeding_logs', JSON.stringify(data));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: BsfLoveCageBreedingLog = {
      ...form,
      id: `cage-${Date.now().toString().slice(-4)}`
    } as BsfLoveCageBreedingLog;

    saveLogs([newEntry, ...logs]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete breeding aviary log?')) {
      saveLogs(logs.filter(l => l.id !== id));
    }
  };

  const totalEggsGrams = logs.reduce((acc, curr) => acc + (curr.eggClustersHarvestedGrams || 0), 0);
  const estimatedNeonates = Math.round(totalEggsGrams * 35000); // 1g eggs ~ 35,000 neonates

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Love Cage Aviary Breeding & Eggies Hatchery</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full">
              {totalEggsGrams.toFixed(1)}g Eggs (~{(estimatedNeonates / 1000).toFixed(0)}k Neonates)
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Adult fly mating aviary, natural sunlight mating chambers, wood eggies collection, and neonate incubators.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              cageId: 'Love Cage 01 — Aviary Alpha (Greenhouse)',
              date: toIsoDate(new Date()),
              pupaeIntroducedKg: 15,
              eggClustersHarvestedGrams: 30,
              hatchRatePercentage: 90,
              attractantUsed: 'Fermented Fruit & Yeast',
              lightingConditions: 'Natural Sunlight & UV Led',
              ambientTempC: 30,
              ambientHumidityPercent: 70,
              notes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Log Aviary Egg Harvest</span>
        </button>
      </div>

      {/* Grid of Breeding Aviary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map(log => (
          <div key={log.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{log.date}</span>
                <h4 className="text-base font-black text-gray-900">{log.cageId}</h4>
              </div>
              <button onClick={() => handleDelete(log.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                <Trash2 size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Eggs Harvested:</span>
                <span className="text-base font-black text-purple-700">{log.eggClustersHarvestedGrams} grams</span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  ~{(log.eggClustersHarvestedGrams * 35000).toLocaleString()} neonates
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Hatchability Rate:</span>
                <span className="text-base font-black text-emerald-700">{log.hatchRatePercentage}%</span>
                <span className="text-[10px] text-emerald-600 block">5-DOL Nursery Viable</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Pupae Loaded:</span>
                <span className="font-semibold text-gray-800">{log.pupaeIntroducedKg} KG Dark Pupae</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Attractant Scent:</span>
                <span className="font-semibold text-gray-800">{log.attractantUsed}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Thermometer size={13} className="text-amber-600" />
                <span>{log.ambientTempC}°C</span>
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={13} className="text-blue-600" />
                <span>{log.ambientHumidityPercent}% Humidity</span>
              </span>
              <span className="flex items-center gap-1">
                <Sun size={13} className="text-yellow-600" />
                <span className="truncate max-w-[120px]">{log.lightingConditions}</span>
              </span>
            </div>

            {log.notes && (
              <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                "{log.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Record Love Cage Aviary & Eggies Harvest</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Aviary Cage ID *</label>
                <input
                  type="text"
                  required
                  value={form.cageId}
                  onChange={e => setForm(prev => ({ ...prev, cageId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-bold text-gray-700 mb-1">Pupae Loaded (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.pupaeIntroducedKg}
                    onChange={e => setForm(prev => ({ ...prev, pupaeIntroducedKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Egg Mass Harvested (Grams) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.eggClustersHarvestedGrams}
                    onChange={e => setForm(prev => ({ ...prev, eggClustersHarvestedGrams: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Hatchability (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.hatchRatePercentage}
                    onChange={e => setForm(prev => ({ ...prev, hatchRatePercentage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ambient Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.ambientTempC}
                    onChange={e => setForm(prev => ({ ...prev, ambientTempC: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ambient Humidity (%)</label>
                  <input
                    type="number"
                    value={form.ambientHumidityPercent}
                    onChange={e => setForm(prev => ({ ...prev, ambientHumidityPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Attractant Scent Formulation</label>
                <select
                  value={form.attractantUsed}
                  onChange={e => setForm(prev => ({ ...prev, attractantUsed: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="Fermented Fruit & Yeast">Fermented Fruit & Yeast Puree</option>
                  <option value="Decomposing Bran">Decomposing Wheat Bran & Sugar</option>
                  <option value="Manure Extract">Dilute Manure Slurry Extract</option>
                </select>
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
                  Save Aviary Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
