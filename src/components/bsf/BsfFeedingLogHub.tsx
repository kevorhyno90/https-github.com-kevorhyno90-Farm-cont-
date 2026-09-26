import React, { useState } from 'react';
import { BsfFeedingRecord, StaffMember } from '../../types';
import { Plus, Trash2, Calendar, Utensils, Thermometer, Droplets, Layers, User, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';

interface BsfFeedingLogHubProps {
  staffList?: StaffMember[];
  onSubstrateDeducted?: (substrateType: string, weightKg: number) => void;
}

const DEFAULT_FEEDING_LOGS: BsfFeedingRecord[] = [
  {
    id: 'feed-01',
    feedingDate: '2024-09-24',
    batchId: 'BSF-BATCH-202',
    substrateFed: 'Market Fruit Pulp & Vegetable Culls',
    substrateWeightFedKg: 180,
    trayOrBasinNumber: 'Bed Row 03 (Concrete Larvarium)',
    feedingStage: 'Active Fattening',
    bedTemperatureC: 30.5,
    bedMoisturePercent: 68,
    operator: 'James Odhiambo',
    notes: 'High voracity feeding. Temperature maintained in optimal 29-32°C range with moisture checked.'
  },
  {
    id: 'feed-02',
    feedingDate: '2024-09-24',
    batchId: 'BSF-BATCH-203',
    substrateFed: 'Fine Brewer Spent Grain & Starter Mash',
    substrateWeightFedKg: 65,
    trayOrBasinNumber: 'Nursery Trays Stack A-02',
    feedingStage: 'Starter (5-DOL)',
    bedTemperatureC: 28.2,
    bedMoisturePercent: 72,
    operator: 'Peter Mwangi',
    notes: 'Gentle top-dressing for 5-DOL neonates. Rapid assimilation observed.'
  },
  {
    id: 'feed-03',
    feedingDate: '2024-09-23',
    batchId: 'BSF-BATCH-201',
    substrateFed: 'Avocado Waste & Kitchen Culls',
    substrateWeightFedKg: 140,
    trayOrBasinNumber: 'Bed Row 02',
    feedingStage: 'Pre-Harvest Finishing',
    bedTemperatureC: 31.0,
    bedMoisturePercent: 65,
    operator: 'James Odhiambo',
    notes: 'Final feed cycle before prepupal ramp migration.'
  }
];

export function BsfFeedingLogHub({ staffList = [], onSubstrateDeducted }: BsfFeedingLogHubProps) {
  const [feedings, setFeedings] = useState<BsfFeedingRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_feedings');
      return stored ? JSON.parse(stored) : DEFAULT_FEEDING_LOGS;
    } catch {
      return DEFAULT_FEEDING_LOGS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [form, setForm] = useState<Partial<BsfFeedingRecord>>({
    feedingDate: toIsoDate(new Date()),
    batchId: 'BSF-BATCH-202',
    substrateFed: 'Market Vegetable & Fruit Culls',
    substrateWeightFedKg: 120,
    trayOrBasinNumber: 'Bed Row 03',
    feedingStage: 'Active Fattening',
    bedTemperatureC: 29.5,
    bedMoisturePercent: 70,
    operator: staffList[0]?.name || 'James Odhiambo',
    notes: ''
  });

  const saveFeedings = (data: BsfFeedingRecord[]) => {
    setFeedings(data);
    localStorage.setItem('jr_farm_bsf_feedings', JSON.stringify(data));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.feedingDate || !form.substrateFed || !form.substrateWeightFedKg) return;

    const newRecord: BsfFeedingRecord = {
      id: `feed-${Date.now()}`,
      feedingDate: form.feedingDate,
      batchId: form.batchId || 'BSF-BATCH-GEN',
      substrateFed: form.substrateFed,
      substrateWeightFedKg: Number(form.substrateWeightFedKg),
      trayOrBasinNumber: form.trayOrBasinNumber || 'General Bed',
      feedingStage: form.feedingStage || 'Active Fattening',
      bedTemperatureC: form.bedTemperatureC ? Number(form.bedTemperatureC) : 30,
      bedMoisturePercent: form.bedMoisturePercent ? Number(form.bedMoisturePercent) : 70,
      operator: form.operator || 'BSF Technician',
      notes: form.notes || ''
    };

    const updated = [newRecord, ...feedings];
    saveFeedings(updated);

    if (onSubstrateDeducted) {
      onSubstrateDeducted(newRecord.substrateFed, newRecord.substrateWeightFedKg);
    }

    setShowModal(false);
    setForm({
      feedingDate: toIsoDate(new Date()),
      batchId: 'BSF-BATCH-202',
      substrateFed: 'Market Vegetable & Fruit Culls',
      substrateWeightFedKg: 120,
      trayOrBasinNumber: 'Bed Row 03',
      feedingStage: 'Active Fattening',
      bedTemperatureC: 29.5,
      bedMoisturePercent: 70,
      operator: staffList[0]?.name || 'James Odhiambo',
      notes: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this BSF daily feeding record?')) {
      saveFeedings(feedings.filter(f => f.id !== id));
    }
  };

  const handleExportCsv = () => {
    const headers = ['Feeding Date', 'Batch ID', 'Substrate Type', 'Weight Fed (kg)', 'Tray/Bed #', 'Feeding Stage', 'Bed Temp (°C)', 'Moisture (%)', 'Operator', 'Notes'];
    const rows = filteredFeedings.map(f => [
      f.feedingDate,
      f.batchId,
      f.substrateFed,
      f.substrateWeightFedKg.toString(),
      f.trayOrBasinNumber,
      f.feedingStage,
      (f.bedTemperatureC || '').toString(),
      (f.bedMoisturePercent || '').toString(),
      f.operator || '',
      `"${(f.notes || '').replace(/"/g, '""')}"`
    ]);
    exportToCsv('BSF_Daily_Feeding_Log_JR_Farm.csv', headers, rows);
  };

  // Metrics
  const totalSubstrateFedKg = feedings.reduce((sum, f) => sum + (f.substrateWeightFedKg || 0), 0);
  const starterFedKg = feedings.filter(f => f.feedingStage === 'Starter (5-DOL)').reduce((sum, f) => sum + f.substrateWeightFedKg, 0);
  const fatteningFedKg = feedings.filter(f => f.feedingStage === 'Active Fattening').reduce((sum, f) => sum + f.substrateWeightFedKg, 0);
  const finishingFedKg = feedings.filter(f => f.feedingStage === 'Pre-Harvest Finishing').reduce((sum, f) => sum + f.substrateWeightFedKg, 0);

  const batches = Array.from(new Set(feedings.map(f => f.batchId)));
  const filteredFeedings = filterBatch === 'all' ? feedings : feedings.filter(f => f.batchId === filterBatch);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-900/40 via-amber-800/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Substrate Fed</span>
            <Utensils className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-200">
            {totalSubstrateFedKg.toLocaleString()} <span className="text-sm font-normal text-amber-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all larvarium beds & nursery trays</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 via-emerald-800/20 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fattening Feed</span>
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-200">
            {fatteningFedKg.toLocaleString()} <span className="text-sm font-normal text-emerald-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Active bioconversion stage intake</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 via-blue-800/20 to-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Starter 5-DOL Feed</span>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-200">
            {starterFedKg.toLocaleString()} <span className="text-sm font-normal text-blue-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Nursery tray neonate nutrition</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pre-Harvest Finishing</span>
            <Thermometer className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-200">
            {finishingFedKg.toLocaleString()} <span className="text-sm font-normal text-purple-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Final stage before pupation</p>
        </div>
      </div>

      {/* Header Actions & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            BSF Daily Feeding & Bed Tray Registry
          </h2>
          <p className="text-xs text-slate-400">
            Record exact substrate rations fed to each batch and bed tray with temperature and moisture readings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Filter Batch:</span>
            <select
              value={filterBatch}
              onChange={e => setFilterBatch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Substrate Feeding
          </button>
        </div>
      </div>

      {/* Table of Daily Feedings */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Feeding Date</th>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Tray / Bed Number</th>
                <th className="py-3 px-4">Substrate Fed</th>
                <th className="py-3 px-4 text-right">Ration (kg)</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Temp / Moisture</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFeedings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No feeding records found. Click &quot;Log Substrate Feeding&quot; to record your first entry.
                  </td>
                </tr>
              ) : (
                filteredFeedings.map(feed => (
                  <tr key={feed.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {feed.feedingDate}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-300">
                      {feed.batchId}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {feed.trayOrBasinNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={feed.substrateFed}>
                      {feed.substrateFed}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {feed.substrateWeightFedKg} kg
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        feed.feedingStage === 'Starter (5-DOL)'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : feed.feedingStage === 'Active Fattening'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {feed.feedingStage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-orange-400">
                          <Thermometer className="w-3.5 h-3.5" />
                          {feed.bedTemperatureC ? `${feed.bedTemperatureC}°C` : '30°C'}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Droplets className="w-3.5 h-3.5" />
                          {feed.bedMoisturePercent ? `${feed.bedMoisturePercent}%` : '70%'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {feed.operator || 'Staff'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(feed.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines Card */}
      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
          <p className="font-semibold text-amber-300">JR Farm BSF Feeding Best Practices:</p>
          <p>
            Maintain nursery starter feeding at 70-75% moisture with smooth bran/puree mix. During active fattening, feed in thin layers (4-6 cm) once every 24-48 hours to avoid anaerobic hotspots. Target internal bed temperatures of 28°C-34°C. Stop feeding 2 days before prepupal migration to facilitate self-harvest clean guts.
          </p>
        </div>
      </div>

      {/* Modal to Log Feeding */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Record Daily Substrate Feeding</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feeding Date</label>
                  <input
                    type="date"
                    required
                    value={form.feedingDate}
                    onChange={e => setForm({ ...form, feedingDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Batch ID</label>
                  <input
                    type="text"
                    required
                    value={form.batchId}
                    onChange={e => setForm({ ...form, batchId: e.target.value })}
                    placeholder="e.g. BSF-BATCH-202"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tray / Bed Number</label>
                  <input
                    type="text"
                    required
                    value={form.trayOrBasinNumber}
                    onChange={e => setForm({ ...form, trayOrBasinNumber: e.target.value })}
                    placeholder="e.g. Bed Row 03 or Tray Stack A-02"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feeding Stage</label>
                  <select
                    value={form.feedingStage}
                    onChange={e => setForm({ ...form, feedingStage: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter (5-DOL)">Starter (5-DOL Neonates)</option>
                    <option value="Active Fattening">Active Fattening</option>
                    <option value="Pre-Harvest Finishing">Pre-Harvest Finishing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Substrate Fed</label>
                  <input
                    type="text"
                    required
                    value={form.substrateFed}
                    onChange={e => setForm({ ...form, substrateFed: e.target.value })}
                    placeholder="e.g. Market Veg Culls & Fruit Pulp"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Substrate Weight Fed (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={form.substrateWeightFedKg}
                    onChange={e => setForm({ ...form, substrateWeightFedKg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bed Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.bedTemperatureC}
                    onChange={e => setForm({ ...form, bedTemperatureC: parseFloat(e.target.value) || 30 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bed Moisture (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.bedMoisturePercent}
                    onChange={e => setForm({ ...form, bedMoisturePercent: parseFloat(e.target.value) || 70 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Operator / Staff</label>
                  <select
                    value={form.operator}
                    onChange={e => setForm({ ...form, operator: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {staffList.length > 0 ? (
                      staffList.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="James Odhiambo">James Odhiambo</option>
                        <option value="Peter Mwangi">Peter Mwangi</option>
                        <option value="Dr. Devin Omwenga">Dr. Devin Omwenga</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Observations & Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Larval voracity, aeration status, drainage check, odor control..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/30 transition-all"
                >
                  Save Feeding Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
