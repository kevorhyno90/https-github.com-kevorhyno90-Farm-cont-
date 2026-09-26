import React, { useState } from 'react';
import { BsfPupaeHarvestRecord, StaffMember } from '../../types';
import { Plus, Trash2, Scale, Sun, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface BsfPupaeHarvestHubProps {
  staffList?: StaffMember[];
  onTransferToLoveCage?: (pupaeKg: number, batchId: string) => void;
}

const DEFAULT_PUPAE_HARVESTS: BsfPupaeHarvestRecord[] = [
  {
    id: 'pupae-01',
    harvestDate: '2024-09-24',
    batchId: 'BSF-BATCH-201',
    pupaeHarvestedKg: 28.5,
    pupaeGrade: 'Dark Pupae (Breeding Stock)',
    destination: 'Transferred to Love Cage',
    trayOrBedNumber: 'Concrete Bed Row 02',
    operator: 'James Odhiambo',
    notes: 'Selected robust dark pupae transferred to Love Cage 01 for adult fly emergence.'
  },
  {
    id: 'pupae-02',
    harvestDate: '2024-09-23',
    batchId: 'BSF-BATCH-200',
    pupaeHarvestedKg: 42.0,
    pupaeGrade: 'Prepupae (Self-Harvest Ramps)',
    destination: 'Solar Drying Tunnel',
    trayOrBedNumber: 'Self-harvest migration ramp Bed 01',
    operator: 'Peter Mwangi',
    notes: 'Migrated out into collection gutter naturally. Washed and spread on solar tunnel screens.'
  }
];

export function BsfPupaeHarvestHub({ staffList = [], onTransferToLoveCage }: BsfPupaeHarvestHubProps) {
  const [records, setRecords] = useState<BsfPupaeHarvestRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_pupae_harvests');
      return stored ? JSON.parse(stored) : DEFAULT_PUPAE_HARVESTS;
    } catch {
      return DEFAULT_PUPAE_HARVESTS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<BsfPupaeHarvestRecord>>({
    harvestDate: toIsoDate(new Date()),
    batchId: 'BSF-BATCH-202',
    pupaeHarvestedKg: 25.0,
    pupaeGrade: 'Dark Pupae (Breeding Stock)',
    destination: 'Transferred to Love Cage',
    trayOrBedNumber: 'Bed Row 03',
    operator: staffList[0]?.name || 'James Odhiambo',
    notes: ''
  });

  const saveRecords = (data: BsfPupaeHarvestRecord[]) => {
    setRecords(data);
    localStorage.setItem('jr_farm_bsf_pupae_harvests', JSON.stringify(data));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId || !form.pupaeHarvestedKg) return;

    const newRec: BsfPupaeHarvestRecord = {
      ...form,
      id: `pupae-${Date.now().toString().slice(-4)}`
    } as BsfPupaeHarvestRecord;

    saveRecords([newRec, ...records]);

    if (onTransferToLoveCage && newRec.destination === 'Transferred to Love Cage') {
      onTransferToLoveCage(newRec.pupaeHarvestedKg, newRec.batchId);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this pupae harvest record?')) {
      saveRecords(records.filter(r => r.id !== id));
    }
  };

  const totalPupaeKg = records.reduce((acc, curr) => acc + (curr.pupaeHarvestedKg || 0), 0);
  const breedingStockKg = records
    .filter(r => r.destination === 'Transferred to Love Cage')
    .reduce((acc, curr) => acc + (curr.pupaeHarvestedKg || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Pupae Harvested & Dark Seed Transfer Hub</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
              {totalPupaeKg} KG Total Harvested ({breedingStockKg} KG Aviary Stock)
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Log prepupae migration, dark pupae screening for Love Cage breeding, solar drying, and livestock feeding.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              harvestDate: toIsoDate(new Date()),
              batchId: 'BSF-BATCH-202',
              pupaeHarvestedKg: 25.0,
              pupaeGrade: 'Dark Pupae (Breeding Stock)',
              destination: 'Transferred to Love Cage',
              trayOrBedNumber: 'Bed Row 03',
              operator: staffList[0]?.name || 'James Odhiambo',
              notes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Record Pupae Harvest</span>
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map(rec => (
          <div key={rec.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{rec.harvestDate}</span>
                <h4 className="text-base font-black text-gray-900">{rec.batchId}</h4>
              </div>
              <button onClick={() => handleDelete(rec.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                <Trash2 size={13} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Pupae Harvested:</span>
                <span className="text-base font-black text-amber-800">{rec.pupaeHarvestedKg} KG</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Grade / Stage:</span>
                <span className="font-semibold text-gray-900">{rec.pupaeGrade}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Destination:</span>
                <span className="font-bold text-emerald-700">{rec.destination}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Tray / Bed Unit:</span>
                <span className="font-semibold text-gray-800">{rec.trayOrBedNumber || 'Standard Tray'}</span>
              </div>
            </div>

            {rec.notes && (
              <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                "{rec.notes}"
              </p>
            )}

            <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
              <span>Operator: {rec.operator || 'James Odhiambo'}</span>
              <span className="font-bold text-amber-700">Screened & Weighed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Record BSF Pupae Harvest</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSF-BATCH-202"
                    value={form.batchId}
                    onChange={e => setForm(prev => ({ ...prev, batchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={form.harvestDate}
                    onChange={e => setForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pupae Harvested (KG) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.pupaeHarvestedKg}
                    onChange={e => setForm(prev => ({ ...prev, pupaeHarvestedKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-black text-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pupae Grade</label>
                  <select
                    value={form.pupaeGrade}
                    onChange={e => setForm(prev => ({ ...prev, pupaeGrade: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Dark Pupae (Breeding Stock)">Dark Pupae (Breeding Stock)</option>
                    <option value="Prepupae (Self-Harvest Ramps)">Prepupae (Self-Harvest Ramps)</option>
                    <option value="Mixed Prepupae & Larvae">Mixed Prepupae & Larvae</option>
                    <option value="Solar Dried Pupae">Solar Dried Whole Pupae</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Destination</label>
                  <select
                    value={form.destination}
                    onChange={e => setForm(prev => ({ ...prev, destination: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Transferred to Love Cage">Transferred to Love Cage (Adult Fly Mating)</option>
                    <option value="Feed for Livestock">Feed for Livestock (Direct feeding)</option>
                    <option value="Solar Drying Tunnel">Solar Drying Tunnel (Storage / Meal)</option>
                    <option value="Commercial Sale">Commercial Sale (Seed pupae to farmer)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tray / Bed Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Bed Row 03"
                    value={form.trayOrBedNumber}
                    onChange={e => setForm(prev => ({ ...prev, trayOrBedNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
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

              <div>
                <label className="block font-bold text-gray-700 mb-1">Harvest Notes</label>
                <textarea
                  rows={2}
                  placeholder="Sieve screening, self-harvest ramp angle, pupae color..."
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
                  Save Pupae Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
