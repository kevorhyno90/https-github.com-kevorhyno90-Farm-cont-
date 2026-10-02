import React, { useState } from 'react';
import { GoatBreedingRecord, GoatRecord, StaffMember } from '../../types';
import {
  Heart, Plus, Trash2, Calendar, CheckCircle2, Clock, AlertCircle,
  FileSpreadsheet, Sparkles, User, Baby, Activity
} from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';

interface GoatBreedingHubProps {
  goats?: GoatRecord[];
  staffList?: StaffMember[];
  onKidBorn?: (doeTag: string, count: number, date: string) => void;
}

const DEFAULT_BREEDINGS: GoatBreedingRecord[] = [
  {
    id: 'brd-01',
    doeTagId: 'JR-GT-201',
    doeName: 'Pippa',
    buckTagId: 'JR-GT-BILLY-01',
    buckName: 'Champion Billy (Boer-Toggenburg Sire)',
    matingDate: '2024-06-15',
    matingType: 'Hand Mating',
    expectedKiddingDate: '2024-11-12', // ~150 days
    pregnancyStatus: 'Confirmed Pregnant',
    scanOrCheckDate: '2024-08-10',
    kidsCountBorn: undefined,
    operatorOrVet: 'Dr. Devin Omwenga',
    notes: 'Ultrasound confirmed twin fetus sacs. High viability and energetic fetal heartbeat.'
  },
  {
    id: 'brd-02',
    doeTagId: 'JR-GT-203',
    doeName: 'Alpine Bella',
    buckTagId: 'JR-GT-BILLY-01',
    buckName: 'Champion Billy',
    matingDate: '2024-05-01',
    matingType: 'Natural Paddock',
    expectedKiddingDate: '2024-09-28',
    pregnancyStatus: 'Confirmed Pregnant',
    actualKiddingDate: '2024-09-27',
    kidsCountBorn: 2,
    kiddingEase: 'Normal Unassisted',
    operatorOrVet: 'James Odhiambo',
    notes: 'Successfully delivered twins (1 doeling, 1 buckling). Colostrum fed vigorously.'
  },
  {
    id: 'brd-03',
    doeTagId: 'JR-GT-204',
    doeName: 'Galla Daisy',
    buckTagId: 'JR-GT-BILLY-02',
    buckName: 'Galla Stud Buck',
    matingDate: '2024-08-20',
    matingType: 'Hand Mating',
    expectedKiddingDate: '2025-01-17',
    pregnancyStatus: 'Pending Check',
    operatorOrVet: 'Dr. Devin Omwenga',
    notes: 'Observed standing heat on Aug 20. Serviced twice within 12 hours.'
  }
];

import { REMOTE_SYNC_APPLIED_EVENT } from '../../context/FarmContext';

export function GoatBreedingHub({ goats = [], staffList = [], onKidBorn }: GoatBreedingHubProps) {
  const [breedings, setBreedings] = useState<GoatBreedingRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_goat_breedings');
      return stored ? JSON.parse(stored) : DEFAULT_BREEDINGS;
    } catch {
      return DEFAULT_BREEDINGS;
    }
  });

  React.useEffect(() => {
    const handleRemoteSync = () => {
      try {
        const stored = localStorage.getItem('jr_farm_goat_breedings');
        if (stored) setBreedings(JSON.parse(stored));
      } catch {}
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    window.addEventListener('storage', handleRemoteSync);
    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
      window.removeEventListener('storage', handleRemoteSync);
    };
  }, []);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<GoatBreedingRecord>>({
    doeTagId: goats.find(g => (g.sex || g.gender) === 'Doe')?.tagId || 'JR-GT-201',
    doeName: '',
    buckTagId: 'JR-GT-BILLY-01',
    buckName: 'Champion Billy (Dual-Purpose Sire)',
    matingDate: toIsoDate(new Date()),
    matingType: 'Hand Mating',
    expectedKiddingDate: offsetIsoDate(150),
    pregnancyStatus: 'Pending Check',
    operatorOrVet: staffList[0]?.name || 'Dr. Devin Omwenga',
    notes: ''
  });

  const saveBreedings = (data: GoatBreedingRecord[]) => {
    setBreedings(data);
    localStorage.setItem('jr_farm_goat_breedings', JSON.stringify(data));
  };

  const handleMatingDateChange = (date: string) => {
    setForm(prev => ({
      ...prev,
      matingDate: date,
      expectedKiddingDate: offsetIsoDate(150, new Date(date))
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doeTagId || !form.buckTagId || !form.matingDate) return;

    const newRecord: GoatBreedingRecord = {
      id: `brd-${Date.now()}`,
      doeTagId: form.doeTagId,
      doeName: form.doeName || goats.find(g => g.tagId === form.doeTagId)?.name || '',
      buckTagId: form.buckTagId,
      buckName: form.buckName || 'Stud Buck',
      matingDate: form.matingDate,
      matingType: form.matingType || 'Hand Mating',
      expectedKiddingDate: form.expectedKiddingDate || offsetIsoDate(150, new Date(form.matingDate)),
      pregnancyStatus: form.pregnancyStatus || 'Pending Check',
      scanOrCheckDate: form.scanOrCheckDate,
      actualKiddingDate: form.actualKiddingDate,
      kidsCountBorn: form.kidsCountBorn ? Number(form.kidsCountBorn) : undefined,
      kiddingEase: form.kiddingEase || 'Normal Unassisted',
      operatorOrVet: form.operatorOrVet || 'Dr. Devin Omwenga',
      notes: form.notes || ''
    };

    saveBreedings([newRecord, ...breedings]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this caprine breeding entry?')) {
      saveBreedings(breedings.filter(b => b.id !== id));
    }
  };

  const handleRecordKidding = (record: GoatBreedingRecord) => {
    const kids = prompt('Enter number of live kids born (e.g. 1, 2, 3):', '2');
    if (!kids) return;
    const count = parseInt(kids, 10) || 1;

    const updated = breedings.map(b => {
      if (b.id === record.id) {
        return {
          ...b,
          actualKiddingDate: toIsoDate(new Date()),
          kidsCountBorn: count,
          pregnancyStatus: 'Confirmed Pregnant' as const,
          notes: `${b.notes ? b.notes + ' ' : ''}Kidding completed on ${toIsoDate(new Date())} with ${count} kids.`
        };
      }
      return b;
    });

    saveBreedings(updated);

    if (onKidBorn) {
      onKidBorn(record.doeTagId, count, toIsoDate(new Date()));
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Doe Tag', 'Doe Name', 'Buck / Sire Tag', 'Sire Name', 'Mating Date',
      'Mating Type', 'Expected Kidding Date', 'Pregnancy Status',
      'Actual Kidding Date', 'Kids Born', 'Kidding Ease', 'Vet/Operator', 'Notes'
    ];
    const rows = filteredBreedings.map(b => [
      b.doeTagId,
      b.doeName || '',
      b.buckTagId,
      b.buckName || '',
      b.matingDate,
      b.matingType,
      b.expectedKiddingDate,
      b.pregnancyStatus,
      b.actualKiddingDate || '',
      (b.kidsCountBorn || '').toString(),
      b.kiddingEase || '',
      b.operatorOrVet || '',
      `"${(b.notes || '').replace(/"/g, '""')}"`
    ]);
    exportToCsv('JR_Farm_Goat_Breeding_Schedule.csv', headers, rows);
  };

  const filteredBreedings = filterStatus === 'all'
    ? breedings
    : breedings.filter(b => b.pregnancyStatus === filterStatus);

  // Metrics
  const totalServices = breedings.length;
  const confirmedPregnant = breedings.filter(b => b.pregnancyStatus === 'Confirmed Pregnant' && !b.actualKiddingDate).length;
  const totalKidsBorn = breedings.reduce((sum, b) => sum + (b.kidsCountBorn || 0), 0);
  const pendingCheck = breedings.filter(b => b.pregnancyStatus === 'Pending Check').length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Matings</span>
            <Heart size={16} className="text-purple-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-purple-950">{totalServices}</span>
            <span className="text-xs font-semibold text-purple-700">serviced</span>
          </div>
          <p className="text-[10px] text-purple-800/80 mt-1">Dual-purpose sire bloodlines</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed In-Kid</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-950">{confirmedPregnant}</span>
            <span className="text-xs font-semibold text-emerald-700">does gestating</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">150-day gestation window</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Check</span>
            <Clock size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">{pendingCheck}</span>
            <span className="text-xs font-semibold text-amber-700">awaiting scan</span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">Day 30-45 ultrasound check</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kids Delivered</span>
            <Baby size={16} className="text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-950">{totalKidsBorn}</span>
            <span className="text-xs font-semibold text-blue-700">live kids</span>
          </div>
          <p className="text-[10px] text-blue-800/80 mt-1">Enrolled in Nursery Hub</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Heart size={16} className="text-purple-600" />
            Caprine Breeding & Kidding Calendar (~150-Day Gestation)
          </h3>
          <p className="text-[11px] text-gray-500">
            Track heat detection, stud buck mating dates, ultrasound pregnancy confirmations, and expected kidding timelines.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            <option value="all">All Pregnancy Statuses</option>
            <option value="Confirmed Pregnant">Confirmed Pregnant</option>
            <option value="Pending Check">Pending Check</option>
            <option value="Open / Not Pregnant">Open / Not Pregnant</option>
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
            className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
          >
            <Plus size={14} />
            <span>Record Mating Event</span>
          </button>
        </div>
      </div>

      {/* Breeding Cards / Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBreedings.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
            No breeding entries found for the selected filter.
          </div>
        ) : (
          filteredBreedings.map(b => {
            const today = new Date().getTime();
            const matingTime = new Date(b.matingDate).getTime();
            const kiddingTime = new Date(b.expectedKiddingDate).getTime();
            const totalDuration = kiddingTime - matingTime;
            const elapsed = today - matingTime;
            const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
            const daysRemaining = Math.max(0, Math.ceil((kiddingTime - today) / (1000 * 60 * 60 * 24)));

            return (
              <div
                key={b.id}
                className="bg-white border border-gray-200 hover:border-purple-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Doe & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-gray-900">{b.doeTagId}</span>
                        {b.doeName && (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {b.doeName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Sire: <span className="font-semibold text-gray-800">{b.buckTagId}</span> {b.buckName ? `(${b.buckName})` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        b.pregnancyStatus === 'Confirmed Pregnant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.pregnancyStatus === 'Pending Check'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {b.pregnancyStatus}
                      </span>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Dates & Gestation Bar */}
                  <div className="mt-3 bg-purple-50/40 p-3 rounded-2xl border border-purple-100/70 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Mating Date:</span>
                      <span className="font-mono font-bold text-gray-800">{b.matingDate}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Expected Kidding:</span>
                      <span className="font-mono font-bold text-purple-900">{b.expectedKiddingDate}</span>
                    </div>

                    {/* Progress Bar */}
                    {!b.actualKiddingDate ? (
                      <div className="pt-1">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-purple-700">Gestation Progress ({progressPercent}%)</span>
                          <span className="text-amber-800">{daysRemaining} days left</span>
                        </div>
                        <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        Kidded on {b.actualKiddingDate} • {b.kidsCountBorn} live kids ({b.kiddingEase || 'Unassisted'})
                      </div>
                    )}
                  </div>

                  {/* Notes & Attending Vet */}
                  <div className="mt-3 text-[11px] text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mating Type:</span>
                      <span className="font-semibold text-gray-700">{b.matingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Supervisor / Vet:</span>
                      <span className="font-semibold text-gray-700">{b.operatorOrVet || 'Dr. Devin Omwenga'}</span>
                    </div>
                    {b.notes && (
                      <p className="mt-1 text-[10px] text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                        &quot;{b.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action: Log Kidding if Pregnant and not yet kidded */}
                {b.pregnancyStatus === 'Confirmed Pregnant' && !b.actualKiddingDate && (
                  <button
                    onClick={() => handleRecordKidding(b)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Baby size={14} />
                    <span>Record Successful Kidding</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Mating */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Log Goat Mating / Service Event</h3>
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
                  <label className="block font-bold text-gray-700 mb-1">Doe Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={form.doeTagId}
                    onChange={e => setForm(prev => ({ ...prev, doeTagId: e.target.value }))}
                    placeholder="e.g. JR-GT-201"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Doe Name (Optional)</label>
                  <input
                    type="text"
                    value={form.doeName}
                    onChange={e => setForm(prev => ({ ...prev, doeName: e.target.value }))}
                    placeholder="e.g. Pippa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Buck / Sire Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={form.buckTagId}
                    onChange={e => setForm(prev => ({ ...prev, buckTagId: e.target.value }))}
                    placeholder="e.g. JR-GT-BILLY-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Buck Name / Breed</label>
                  <input
                    type="text"
                    value={form.buckName}
                    onChange={e => setForm(prev => ({ ...prev, buckName: e.target.value }))}
                    placeholder="e.g. Champion Billy (Boer-Togg)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mating Date *</label>
                  <input
                    type="date"
                    required
                    value={form.matingDate}
                    onChange={e => handleMatingDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Kidding Date (+150d)</label>
                  <input
                    type="date"
                    readOnly
                    value={form.expectedKiddingDate}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl font-mono text-purple-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mating Method</label>
                  <select
                    value={form.matingType}
                    onChange={e => setForm(prev => ({ ...prev, matingType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Hand Mating">Hand Mating (Supervised Stall)</option>
                    <option value="Natural Paddock">Natural Paddock (Free Roam)</option>
                    <option value="Artificial Insemination">Artificial Insemination (AI)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pregnancy Status</label>
                  <select
                    value={form.pregnancyStatus}
                    onChange={e => setForm(prev => ({ ...prev, pregnancyStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Pending Check">Pending Ultrasound Check</option>
                    <option value="Confirmed Pregnant">Confirmed Pregnant</option>
                    <option value="Open / Not Pregnant">Open / Not Pregnant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Attending Vet / Staff</label>
                  <select
                    value={form.operatorOrVet}
                    onChange={e => setForm(prev => ({ ...prev, operatorOrVet: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Dr. Devin Omwenga">Dr. Devin Omwenga (General Farm Manager)</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Scan / Palpation Date</label>
                  <input
                    type="date"
                    value={form.scanOrCheckDate}
                    onChange={e => setForm(prev => ({ ...prev, scanOrCheckDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observations / Breeding Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Standing heat signs, buck vigor, teaser response, mineral flush..."
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
                  className="px-5 py-2 font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs"
                >
                  Save Mating Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
