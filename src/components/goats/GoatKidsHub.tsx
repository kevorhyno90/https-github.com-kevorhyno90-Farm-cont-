import React, { useState } from 'react';
import { GoatKidRecord, GoatRecord, StaffMember } from '../../types';
import {
  Baby, Plus, Trash2, Calendar, TrendingUp, CheckCircle2,
  Scale, FileSpreadsheet, ShieldCheck, HeartHandshake, ArrowUpRight
} from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';

interface GoatKidsHubProps {
  staffList?: StaffMember[];
  onGraduateToAdultHerd?: (kid: GoatKidRecord) => void;
}

const DEFAULT_KIDS: GoatKidRecord[] = [
  {
    id: 'kid-01',
    kidTagId: 'JR-KID-401',
    kidName: 'Ruby',
    sex: 'Doeling',
    dob: '2024-09-01',
    birthWeightKg: 3.4,
    currentWeightKg: 7.8,
    damTagId: 'JR-GT-201',
    damName: 'Pippa (Toggenburg)',
    sireTagId: 'JR-GT-BILLY-01',
    sireName: 'Champion Billy',
    birthType: 'Twin',
    colostrumIntake: 'Adequate (<2 hrs)',
    weaningStatus: 'Creep Feeding',
    targetWeaningDate: '2024-11-24', // ~84 days
    dailyGainGramsPerDay: 176, // 4.4kg in 25 days = 176g/day
    vaccinations: 'Clostridial 8-way at 3 weeks',
    housingPen: 'Nursery Creep Stall 01',
    notes: 'Vigorous doeling showing high potential dairy udder conformation and heavy meat frame.'
  },
  {
    id: 'kid-02',
    kidTagId: 'JR-KID-402',
    kidName: 'Rex',
    sex: 'Buckling',
    dob: '2024-09-01',
    birthWeightKg: 3.8,
    currentWeightKg: 8.9,
    damTagId: 'JR-GT-201',
    damName: 'Pippa',
    sireTagId: 'JR-GT-BILLY-01',
    sireName: 'Champion Billy',
    birthType: 'Twin',
    colostrumIntake: 'Adequate (<2 hrs)',
    weaningStatus: 'Creep Feeding',
    targetWeaningDate: '2024-11-24',
    dailyGainGramsPerDay: 204, // 5.1kg in 25 days = 204g/day
    vaccinations: 'Clostridial 8-way at 3 weeks',
    housingPen: 'Nursery Creep Stall 01',
    notes: 'Twin brother of Ruby. Exceptional average daily gain exceeding 200g/day.'
  },
  {
    id: 'kid-03',
    kidTagId: 'JR-KID-398',
    kidName: 'Sammy',
    sex: 'Doeling',
    dob: '2024-06-15',
    birthWeightKg: 3.2,
    currentWeightKg: 18.5,
    damTagId: 'JR-GT-203',
    damName: 'Alpine Bella',
    sireTagId: 'JR-GT-BILLY-01',
    sireName: 'Champion Billy',
    birthType: 'Single',
    colostrumIntake: 'Adequate (<2 hrs)',
    weaningStatus: 'Weaned',
    targetWeaningDate: '2024-09-07',
    weanedWeightKg: 17.2,
    dailyGainGramsPerDay: 155,
    vaccinations: 'CCPP + Enterotoxaemia full course',
    housingPen: 'Growing Grower Pen B',
    notes: 'Successfully weaned onto wilted alfalfa & dairy goat grower pellets.'
  }
];

import { REMOTE_SYNC_APPLIED_EVENT } from '../../context/FarmContext';

export function GoatKidsHub({ staffList = [], onGraduateToAdultHerd }: GoatKidsHubProps) {
  const [kids, setKids] = useState<GoatKidRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_goat_kids');
      return stored ? JSON.parse(stored) : DEFAULT_KIDS;
    } catch {
      return DEFAULT_KIDS;
    }
  });

  React.useEffect(() => {
    const handleRemoteSync = () => {
      try {
        const stored = localStorage.getItem('jr_farm_goat_kids');
        if (stored) setKids(JSON.parse(stored));
      } catch {}
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    window.addEventListener('storage', handleRemoteSync);
    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
      window.removeEventListener('storage', handleRemoteSync);
    };
  }, []);

  const [filterSex, setFilterSex] = useState<string>('all');
  const [filterWeaning, setFilterWeaning] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<GoatKidRecord>>({
    kidTagId: `JR-KID-${Math.floor(400 + Math.random() * 599)}`,
    kidName: '',
    sex: 'Doeling',
    dob: toIsoDate(new Date()),
    birthWeightKg: 3.2,
    currentWeightKg: 3.2,
    damTagId: 'JR-GT-201',
    damName: '',
    sireTagId: 'JR-GT-BILLY-01',
    sireName: 'Champion Billy',
    birthType: 'Twin',
    colostrumIntake: 'Adequate (<2 hrs)',
    weaningStatus: 'Nursing',
    targetWeaningDate: offsetIsoDate(84), // 12 weeks
    dailyGainGramsPerDay: 160,
    vaccinations: 'Pending 3-week booster',
    housingPen: 'Nursery Creep Stall 01',
    notes: ''
  });

  const saveKids = (data: GoatKidRecord[]) => {
    setKids(data);
    localStorage.setItem('jr_farm_goat_kids', JSON.stringify(data));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kidTagId || !form.dob || !form.birthWeightKg) return;

    // Calculate ADG
    const birthWt = Number(form.birthWeightKg) || 3;
    const currWt = Number(form.currentWeightKg) || birthWt;
    const dobTime = new Date(form.dob).getTime();
    const nowTime = new Date().getTime();
    const daysAge = Math.max(1, Math.floor((nowTime - dobTime) / (1000 * 60 * 60 * 24)));
    const adg = Math.round(((currWt - birthWt) / daysAge) * 1000);

    const newRecord: GoatKidRecord = {
      id: `kid-${Date.now()}`,
      kidTagId: form.kidTagId,
      kidName: form.kidName,
      sex: form.sex || 'Doeling',
      dob: form.dob,
      birthWeightKg: birthWt,
      currentWeightKg: currWt,
      damTagId: form.damTagId || 'JR-GT-DAM',
      damName: form.damName,
      sireTagId: form.sireTagId || 'JR-GT-SIRE',
      sireName: form.sireName,
      birthType: form.birthType || 'Twin',
      colostrumIntake: form.colostrumIntake || 'Adequate (<2 hrs)',
      weaningStatus: form.weaningStatus || 'Nursing',
      targetWeaningDate: form.targetWeaningDate || (form.dob ? offsetIsoDate(84, new Date(form.dob)) : offsetIsoDate(84)),
      weanedWeightKg: form.weanedWeightKg,
      dailyGainGramsPerDay: adg > 0 ? adg : (form.dailyGainGramsPerDay || 160),
      vaccinations: form.vaccinations || 'Pending',
      housingPen: form.housingPen || 'Nursery Stall',
      notes: form.notes || ''
    };

    saveKids([newRecord, ...kids]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this goat kid record?')) {
      saveKids(kids.filter(k => k.id !== id));
    }
  };

  const handleGraduate = (kid: GoatKidRecord) => {
    if (window.confirm(`Graduate ${kid.kidTagId} (${kid.kidName || kid.sex}) into the adult Dual-Purpose Goat Herd?`)) {
      if (onGraduateToAdultHerd) {
        onGraduateToAdultHerd(kid);
      }
      // Update kid status to Weaned / Graduated
      const updated = kids.map(k => k.id === kid.id ? { ...k, weaningStatus: 'Weaned' as const, notes: `${k.notes ? k.notes + ' ' : ''}Graduated into adult herd.` } : k);
      saveKids(updated);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Kid Tag', 'Kid Name', 'Sex', 'DOB', 'Birth Weight (kg)', 'Current Weight (kg)',
      'ADG (g/day)', 'Dam Tag', 'Sire Tag', 'Birth Type', 'Colostrum Intake',
      'Weaning Status', 'Target Weaning Date', 'Weaned Weight (kg)', 'Housing Pen', 'Notes'
    ];
    const rows = filteredKids.map(k => [
      k.kidTagId,
      k.kidName || '',
      k.sex,
      k.dob,
      k.birthWeightKg.toString(),
      k.currentWeightKg.toString(),
      (k.dailyGainGramsPerDay || '').toString(),
      k.damTagId,
      k.sireTagId,
      k.birthType,
      k.colostrumIntake,
      k.weaningStatus,
      k.targetWeaningDate || '',
      (k.weanedWeightKg || '').toString(),
      k.housingPen || '',
      `"${(k.notes || '').replace(/"/g, '""')}"`
    ]);
    exportToCsv('JR_Farm_Goat_Kids_Nursery.csv', headers, rows);
  };

  const filteredKids = kids.filter(k => {
    const matchSex = filterSex === 'all' || k.sex === filterSex;
    const matchWeaning = filterWeaning === 'all' || k.weaningStatus === filterWeaning;
    return matchSex && matchWeaning;
  });

  // Metrics
  const totalKids = kids.length;
  const doelingsCount = kids.filter(k => k.sex === 'Doeling').length;
  const bucklingsCount = kids.filter(k => k.sex === 'Buckling').length;
  const nursingCount = kids.filter(k => k.weaningStatus === 'Nursing').length;
  const creepCount = kids.filter(k => k.weaningStatus === 'Creep Feeding').length;
  const weanedCount = kids.filter(k => k.weaningStatus === 'Weaned').length;
  const avgADG = totalKids > 0
    ? Math.round(kids.reduce((s, k) => s + (k.dailyGainGramsPerDay || 160), 0) / totalKids)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kids in Nursery</span>
            <Baby size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">{totalKids}</span>
            <span className="text-xs font-semibold text-amber-700">kids</span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">{doelingsCount} Doelings • {bucklingsCount} Bucklings</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Daily Gain</span>
            <TrendingUp size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-950">{avgADG}</span>
            <span className="text-xs font-semibold text-emerald-700">g / day</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">High dual-purpose growth rate</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Creep Feeding</span>
            <Scale size={16} className="text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-950">{creepCount}</span>
            <span className="text-xs font-semibold text-blue-700">on solid starter</span>
          </div>
          <p className="text-[10px] text-blue-800/80 mt-1">Gaining rumen capacity</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Weaned Stock</span>
            <CheckCircle2 size={16} className="text-purple-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-purple-950">{weanedCount}</span>
            <span className="text-xs font-semibold text-purple-700">ready for herd</span>
          </div>
          <p className="text-[10px] text-purple-800/80 mt-1">12-week target reached</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Baby size={16} className="text-amber-600" />
            Caprine Kids Nursery, Growth Trajectory & Weaning Registry
          </h3>
          <p className="text-[11px] text-gray-500">
            Monitor birth weights, Average Daily Gain (ADG), creep ration transition, colostrum intake, and graduation to adult herd.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterSex}
            onChange={e => setFilterSex(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            <option value="all">All Sexes</option>
            <option value="Doeling">Doelings (Females)</option>
            <option value="Buckling">Bucklings (Males)</option>
          </select>

          <select
            value={filterWeaning}
            onChange={e => setFilterWeaning(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            <option value="all">All Weaning Stages</option>
            <option value="Nursing">Nursing (Milk Fed)</option>
            <option value="Creep Feeding">Creep Feeding</option>
            <option value="Weaned">Weaned</option>
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
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
          >
            <Plus size={14} />
            <span>Enroll New Kid</span>
          </button>
        </div>
      </div>

      {/* Kids Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKids.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
            No kid records found matching the active filter.
          </div>
        ) : (
          filteredKids.map(kid => {
            const daysAge = Math.max(1, Math.floor((new Date().getTime() - new Date(kid.dob).getTime()) / (1000 * 60 * 60 * 24)));
            const weeksAge = (daysAge / 7).toFixed(1);

            return (
              <div
                key={kid.id}
                className="bg-white border border-gray-200 hover:border-amber-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Kid Tag & Badges */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-gray-900">{kid.kidTagId}</span>
                        {kid.kidName && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {kid.kidName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Born: <span className="font-medium text-gray-700">{kid.dob}</span> ({weeksAge} wks / {daysAge} days old)
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        kid.sex === 'Doeling' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {kid.sex}
                      </span>
                      <button
                        onClick={() => handleDelete(kid.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Growth & Weight Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-3 bg-amber-50/40 p-3 rounded-2xl border border-amber-100/70">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Birth Weight</span>
                      <span className="font-mono font-bold text-gray-800 text-xs">{kid.birthWeightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Current Weight</span>
                      <span className="font-mono font-black text-amber-950 text-sm">{kid.currentWeightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block">Daily Gain</span>
                      <span className="font-mono font-black text-emerald-800 text-xs">+{kid.dailyGainGramsPerDay || 160}g/d</span>
                    </div>
                  </div>

                  {/* Weaning & Lineage */}
                  <div className="mt-3 text-[11px] text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stage:</span>
                      <span className={`font-semibold px-2 py-0.2 rounded ${
                        kid.weaningStatus === 'Weaned'
                          ? 'bg-purple-100 text-purple-800'
                          : kid.weaningStatus === 'Creep Feeding'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {kid.weaningStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dam & Sire:</span>
                      <span className="font-semibold text-gray-800 font-mono text-[10px]">
                        {kid.damTagId} × {kid.sireTagId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Birth Type / Colostrum:</span>
                      <span className="text-gray-700 text-[10px]">
                        {kid.birthType} • {kid.colostrumIntake}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stall / Pen:</span>
                      <span className="text-gray-700">{kid.housingPen || 'Creep Stall 01'}</span>
                    </div>
                    {kid.notes && (
                      <p className="mt-1 text-[10px] text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                        &quot;{kid.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Graduate Button if Weaned */}
                {kid.weaningStatus === 'Weaned' && onGraduateToAdultHerd && (
                  <button
                    onClick={() => handleGraduate(kid)}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight size={14} />
                    <span>Graduate to Adult Dual-Purpose Herd</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Enroll Kid */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Enroll Newborn Goat Kid in Nursery</h3>
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
                  <label className="block font-bold text-gray-700 mb-1">Kid Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={form.kidTagId}
                    onChange={e => setForm(prev => ({ ...prev, kidTagId: e.target.value }))}
                    placeholder="e.g. JR-KID-405"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kid Name (Optional)</label>
                  <input
                    type="text"
                    value={form.kidName}
                    onChange={e => setForm(prev => ({ ...prev, kidName: e.target.value }))}
                    placeholder="e.g. Ruby"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sex / Gender *</label>
                  <select
                    value={form.sex}
                    onChange={e => setForm(prev => ({ ...prev, sex: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Doeling">Doeling (Female Kid)</option>
                    <option value="Buckling">Buckling (Male Kid)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={form.dob}
                    onChange={e => setForm(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Birth Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.birthWeightKg}
                    onChange={e => setForm(prev => ({ ...prev, birthWeightKg: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.currentWeightKg}
                    onChange={e => setForm(prev => ({ ...prev, currentWeightKg: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Birth Type</label>
                  <select
                    value={form.birthType}
                    onChange={e => setForm(prev => ({ ...prev, birthType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Single">Single</option>
                    <option value="Twin">Twin</option>
                    <option value="Triplet">Triplet</option>
                    <option value="Quadruplet">Quadruplet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dam Tag (Mother Doe)</label>
                  <input
                    type="text"
                    value={form.damTagId}
                    onChange={e => setForm(prev => ({ ...prev, damTagId: e.target.value }))}
                    placeholder="e.g. JR-GT-201"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sire Tag (Buck)</label>
                  <input
                    type="text"
                    value={form.sireTagId}
                    onChange={e => setForm(prev => ({ ...prev, sireTagId: e.target.value }))}
                    placeholder="e.g. JR-GT-BILLY-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Colostrum Intake Status</label>
                  <select
                    value={form.colostrumIntake}
                    onChange={e => setForm(prev => ({ ...prev, colostrumIntake: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Adequate (<2 hrs)">Adequate (&lt;2 hrs natural suckle)</option>
                    <option value="Assisted Bottle Feed">Assisted Bottle Feed</option>
                    <option value="Delayed">Delayed (&gt;4 hrs)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Weaning Status</label>
                  <select
                    value={form.weaningStatus}
                    onChange={e => setForm(prev => ({ ...prev, weaningStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Nursing">Nursing (Milk Fed)</option>
                    <option value="Creep Feeding">Creep Feeding (Pellets + Milk)</option>
                    <option value="Weaned">Weaned (Forage/Grower)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observations / Nursery Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Navel iodine dip, vigor, suckling reflex, creep intake..."
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
                  className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                >
                  Save Kid Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
