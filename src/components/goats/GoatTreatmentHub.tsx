import React, { useState } from 'react';
import { GoatTreatmentRecord, GoatRecord, StaffMember } from '../../types';
import {
  Activity, Plus, Trash2, Calendar, AlertTriangle, ShieldCheck,
  CheckCircle2, Clock, FileSpreadsheet, DollarSign, Stethoscope, Droplets
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';

interface GoatTreatmentHubProps {
  goats?: GoatRecord[];
  staffList?: StaffMember[];
}

const DEFAULT_TREATMENTS: GoatTreatmentRecord[] = [
  {
    id: 'trt-01',
    treatmentDate: '2024-09-24',
    goatTagId: 'JR-GT-203',
    goatName: 'Alpine Bella',
    diagnosis: 'Caprine Foot Rot (Interdigital Necrobacillosis)',
    medication: 'Oxytetracycline 20% LA + Copper Sulfate Footbath (10%)',
    dosage: '5ml IM + 5-min footbath soak',
    route: 'Intramuscular (IM)',
    withdrawalMilkDays: 7,
    withdrawalMeatDays: 21,
    costKes: 850,
    administeredBy: 'Dr. Devin Omwenga',
    recoveryStatus: 'Under Treatment',
    followUpDate: '2024-09-28',
    notes: 'Hooves carefully pared. Dry stall bedding provided to keep hooves clean.'
  },
  {
    id: 'trt-02',
    treatmentDate: '2024-09-20',
    goatTagId: 'JR-GT-201',
    goatName: 'Pippa',
    diagnosis: 'Routine Haemonchus Deworming (Barber Pole Worm)',
    medication: 'Albendazole 10% Oral Suspension',
    dosage: '10ml oral drench',
    route: 'Oral Drench',
    withdrawalMilkDays: 3,
    withdrawalMeatDays: 14,
    costKes: 300,
    administeredBy: 'James Odhiambo',
    recoveryStatus: 'Fully Recovered',
    notes: 'FAMACHA score checked: eye mucous membrane restored to healthy pink score 2.'
  },
  {
    id: 'trt-03',
    treatmentDate: '2024-09-18',
    goatTagId: 'JR-GT-BILLY-01',
    goatName: 'Champion Billy',
    diagnosis: 'CCPP Prophylactic Annual Booster Vaccine',
    medication: 'Inactivated CCPP Culture Vaccine',
    dosage: '0.5ml SC at neck fold',
    route: 'Subcutaneous (SC)',
    withdrawalMilkDays: 0,
    withdrawalMeatDays: 0,
    costKes: 650,
    administeredBy: 'Dr. Devin Omwenga',
    recoveryStatus: 'Fully Recovered',
    notes: 'Herd sire annual respiratory booster administered. No adverse reaction.'
  }
];

const COMMON_DIAGNOSES = [
  'CCPP (Contagious Caprine Pleuropneumonia)',
  'Enterotoxaemia (Pulpy Kidney Clostridia)',
  'Caprine Mastitis (Clinical Udder Inflammation)',
  'Haemonchus Contortus (Barber Pole Worms)',
  'Caprine Foot Rot (Interdigital Infection)',
  'Orf (Contagious Ecthyma / Sore Mouth)',
  'Mange / External Lice & Fleas',
  'Pneumonia / Bronchial Wheezing',
  'Ruminal Bloat / Frothy Fermentation',
  'Trace Mineral / Selenium-Vitamin E Deficiency'
];

export function GoatTreatmentHub({ goats = [], staffList = [] }: GoatTreatmentHubProps) {
  const [treatments, setTreatments] = useState<GoatTreatmentRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_goat_treatments');
      return stored ? JSON.parse(stored) : DEFAULT_TREATMENTS;
    } catch {
      return DEFAULT_TREATMENTS;
    }
  });

  const [filterRecovery, setFilterRecovery] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<GoatTreatmentRecord>>({
    treatmentDate: toIsoDate(new Date()),
    goatTagId: goats[0]?.tagId || 'JR-GT-203',
    goatName: '',
    diagnosis: 'Caprine Foot Rot (Interdigital Infection)',
    medication: 'Oxytetracycline 20% LA',
    dosage: '5ml IM',
    route: 'Intramuscular (IM)',
    withdrawalMilkDays: 7,
    withdrawalMeatDays: 21,
    costKes: 650,
    administeredBy: 'Dr. Devin Omwenga',
    recoveryStatus: 'Under Treatment',
    followUpDate: toIsoDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
    notes: ''
  });

  const saveTreatments = (data: GoatTreatmentRecord[]) => {
    setTreatments(data);
    localStorage.setItem('jr_farm_goat_treatments', JSON.stringify(data));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.goatTagId || !form.diagnosis || !form.medication) return;

    const newRecord: GoatTreatmentRecord = {
      id: `trt-${Date.now()}`,
      treatmentDate: form.treatmentDate || toIsoDate(new Date()),
      goatTagId: form.goatTagId,
      goatName: form.goatName || goats.find(g => g.tagId === form.goatTagId)?.name || '',
      diagnosis: form.diagnosis,
      medication: form.medication,
      dosage: form.dosage || 'Standard dose',
      route: form.route || 'Intramuscular (IM)',
      withdrawalMilkDays: Number(form.withdrawalMilkDays) || 0,
      withdrawalMeatDays: Number(form.withdrawalMeatDays) || 0,
      costKes: Number(form.costKes) || 0,
      administeredBy: form.administeredBy || 'Dr. Devin Omwenga',
      recoveryStatus: form.recoveryStatus || 'Under Treatment',
      followUpDate: form.followUpDate,
      notes: form.notes || ''
    };

    saveTreatments([newRecord, ...treatments]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this caprine veterinary treatment entry?')) {
      saveTreatments(treatments.filter(t => t.id !== id));
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Treatment Date', 'Goat Tag', 'Goat Name', 'Diagnosis', 'Medication',
      'Dosage', 'Route', 'Milk Withdrawal (Days)', 'Meat Withdrawal (Days)',
      'Cost (KES)', 'Administered By', 'Recovery Status', 'Follow-up Date', 'Notes'
    ];
    const rows = filteredTreatments.map(t => [
      t.treatmentDate,
      t.goatTagId,
      t.goatName || '',
      t.diagnosis,
      t.medication,
      t.dosage,
      t.route,
      t.withdrawalMilkDays.toString(),
      t.withdrawalMeatDays.toString(),
      t.costKes.toString(),
      t.administeredBy,
      t.recoveryStatus,
      t.followUpDate || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    exportToCsv('JR_Farm_Goat_Veterinary_Treatments.csv', headers, rows);
  };

  const filteredTreatments = filterRecovery === 'all'
    ? treatments
    : treatments.filter(t => t.recoveryStatus === filterRecovery);

  // Metrics
  const totalTreatments = treatments.length;
  const activeCases = treatments.filter(t => t.recoveryStatus !== 'Fully Recovered').length;
  const totalVetCostKes = treatments.reduce((sum, t) => sum + (t.costKes || 0), 0);
  const activeWithdrawals = treatments.filter(t => {
    if (t.recoveryStatus === 'Fully Recovered') return false;
    const treatTime = new Date(t.treatmentDate).getTime();
    const now = new Date().getTime();
    const daysSince = (now - treatTime) / (1000 * 60 * 60 * 24);
    return daysSince < Math.max(t.withdrawalMilkDays, t.withdrawalMeatDays);
  }).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Health Logs</span>
            <Activity size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-950">{totalTreatments}</span>
            <span className="text-xs font-semibold text-emerald-700">events</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">Preventive & curative records</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Sickbay</span>
            <Stethoscope size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">{activeCases}</span>
            <span className="text-xs font-semibold text-amber-700">under treatment</span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">Under Dr. Devin Omwenga care</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/80 shadow-xs">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Withdrawal</span>
            <AlertTriangle size={16} className="text-red-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-red-950">{activeWithdrawals}</span>
            <span className="text-xs font-semibold text-red-700">restricted</span>
          </div>
          <p className="text-[10px] text-red-800/80 mt-1">Milk & meat safe holding active</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vet Care Spend</span>
            <DollarSign size={16} className="text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-950">KES {totalVetCostKes.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-blue-800/80 mt-1">Pharmacy & diagnostics total</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Stethoscope size={16} className="text-emerald-600" />
            Caprine Health, Vaccination & Veterinary Treatments
          </h3>
          <p className="text-[11px] text-gray-500">
            Log diagnosis, antibiotics, dewormers, and mandatory milk & meat withdrawal withholding safety periods.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterRecovery}
            onChange={e => setFilterRecovery(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            <option value="all">All Recovery Statuses</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Fully Recovered">Fully Recovered</option>
            <option value="Follow-up Required">Follow-up Required</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
          >
            <FileSpreadsheet size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus size={14} />
            <span>Record Vet Treatment</span>
          </button>
        </div>
      </div>

      {/* Treatment Ledger Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Goat Tag</th>
                <th className="py-3 px-4">Diagnosis / Condition</th>
                <th className="py-3 px-4">Medication & Route</th>
                <th className="py-3 px-4">Withdrawal Periods</th>
                <th className="py-3 px-4">Attending Vet</th>
                <th className="py-3 px-4">Cost (KES)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTreatments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No treatment records matching the filter.
                  </td>
                </tr>
              ) : (
                filteredTreatments.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        {t.treatmentDate}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900">{t.goatTagId}</span>
                      {t.goatName && <span className="block text-[10px] text-amber-700 font-semibold">{t.goatName}</span>}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs">
                      {t.diagnosis}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="font-semibold">{t.medication}</div>
                      <div className="text-[10px] text-gray-500">{t.dosage} • {t.route}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.withdrawalMilkDays > 0 ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Milk: {t.withdrawalMilkDays}d
                        </span>
                        <span className={`inline-block ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.withdrawalMeatDays > 0 ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Meat: {t.withdrawalMeatDays}d
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {t.administeredBy}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      KES {t.costKes}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.recoveryStatus === 'Fully Recovered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.recoveryStatus === 'Under Treatment'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {t.recoveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Treatment */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Record Caprine Health & Vet Treatment</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Treatment Date *</label>
                  <input
                    type="date"
                    required
                    value={form.treatmentDate}
                    onChange={e => setForm(prev => ({ ...prev, treatmentDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Goat Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={form.goatTagId}
                    onChange={e => setForm(prev => ({ ...prev, goatTagId: e.target.value }))}
                    placeholder="e.g. JR-GT-203"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Clinical Diagnosis / Condition *</label>
                <input
                  type="text"
                  required
                  list="diagnoses-list"
                  value={form.diagnosis}
                  onChange={e => setForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Select or type diagnosis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                />
                <datalist id="diagnoses-list">
                  {COMMON_DIAGNOSES.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Medication / Active Drug *</label>
                  <input
                    type="text"
                    required
                    value={form.medication}
                    onChange={e => setForm(prev => ({ ...prev, medication: e.target.value }))}
                    placeholder="e.g. Oxytetracycline 20% LA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={e => setForm(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g. 5ml IM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Administration Route</label>
                  <select
                    value={form.route}
                    onChange={e => setForm(prev => ({ ...prev, route: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                    <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                    <option value="Oral Drench">Oral Drench</option>
                    <option value="Topical / Footbath">Topical / Footbath</option>
                    <option value="Eye Drops">Eye Drops</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Recovery Status</label>
                  <select
                    value={form.recoveryStatus}
                    onChange={e => setForm(prev => ({ ...prev, recoveryStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Fully Recovered">Fully Recovered</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Milk Withhold (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.withdrawalMilkDays}
                    onChange={e => setForm(prev => ({ ...prev, withdrawalMilkDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Meat Withhold (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.withdrawalMeatDays}
                    onChange={e => setForm(prev => ({ ...prev, withdrawalMeatDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold text-red-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Treatment Cost (KES)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.costKes}
                    onChange={e => setForm(prev => ({ ...prev, costKes: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Attending Vet / Practitioner</label>
                  <select
                    value={form.administeredBy}
                    onChange={e => setForm(prev => ({ ...prev, administeredBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Dr. Devin Omwenga">Dr. Devin Omwenga (General Farm Manager)</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={e => setForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Clinical Notes & Action</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Temperature reading, lung auscultation, hoof paring status..."
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
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Treatment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
