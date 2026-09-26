import React, { useState, useMemo } from 'react';
import { GoatRecord, StaffMember } from '../../types';
import {
  Plus, Trash2, Edit3, Search, Milk, Scale, Heart, Filter,
  FileSpreadsheet, ShieldCheck, Tag, Calendar, User, Eye, Layers, Sparkles
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';

interface GoatRegistryHubProps {
  goats: GoatRecord[];
  onAddGoat: (goat: GoatRecord) => void;
  onEditGoat?: (id: string, updated: GoatRecord) => void;
  onDeleteGoat: (id: string) => void;
  staffList?: StaffMember[];
  onNavigateToBreeding?: (doeTag: string) => void;
  onNavigateToTreatment?: (goatTag: string) => void;
}

const DUAL_PURPOSE_BREEDS = [
  'Toggenburg (High Milk + Hardy Meat)',
  'Alpine (Heavy Dairy + Vigorous Growth)',
  'Saanen (Maximum Milk Producer)',
  'Galla (Indigenous Kenyan Meat & Creamy Milk)',
  'Anglo-Nubian (Dual Purpose Muscling & High Butterfat)',
  'Boer x Dairy Cross (Fast Fattening Meat & Milk)',
  'Crossbreed Utility'
];

export function GoatRegistryHub({
  goats,
  onAddGoat,
  onEditGoat,
  onDeleteGoat,
  staffList = [],
  onNavigateToBreeding,
  onNavigateToTreatment
}: GoatRegistryHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [breedFilter, setBreedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<GoatRecord>>({
    tagId: `JR-GT-${Math.floor(200 + Math.random() * 800)}`,
    name: '',
    breed: 'Toggenburg (High Milk + Hardy Meat)',
    purpose: 'Dual Purpose',
    dualPurposeTarget: 'High Milk & Meat',
    sex: 'Doe',
    dob: toIsoDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2)), // ~2 yrs old
    weightKg: 52,
    milkYieldLiters: 2.8,
    hornStatus: 'Polled',
    parity: 2,
    damTag: 'JR-GT-DAM-01',
    sireTag: 'JR-GT-SIRE-BILLY',
    housingPen: 'Elevated Pen A-01',
    status: 'Active Lactating',
    activity: 'Twice-daily machine milking & mineral lick browsing',
    notes: 'Robust dual-purpose doe. High milk persistency and strong muscular hindquarters.',
    date: toIsoDate(new Date())
  });

  // Filtered Goats
  const filteredGoats = useMemo(() => {
    return goats.filter(g => {
      const matchSearch =
        (g.tagId && g.tagId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.name && g.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.breed && g.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.notes && g.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchBreed = breedFilter === 'all' || g.breed === breedFilter;
      const matchStatus = statusFilter === 'all' || g.status === statusFilter;
      const matchSex = sexFilter === 'all' || (g.sex || g.gender) === sexFilter;

      return matchSearch && matchBreed && matchStatus && matchSex;
    });
  }, [goats, searchTerm, breedFilter, statusFilter, sexFilter]);

  // KPIs
  const totalGoats = goats.length;
  const milkingDoes = goats.filter(g => (g.milkYieldLiters || 0) > 0 || g.status === 'Active Lactating').length;
  const totalDailyMilk = goats.reduce((sum, g) => sum + (g.milkYieldLiters || 0), 0);
  const avgWeightKg = totalGoats > 0
    ? Math.round(goats.reduce((sum, g) => sum + (g.weightKg || 48), 0) / totalGoats)
    : 0;

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      tagId: `JR-GT-${Math.floor(200 + Math.random() * 800)}`,
      name: '',
      breed: 'Toggenburg (High Milk + Hardy Meat)',
      purpose: 'Dual Purpose',
      dualPurposeTarget: 'High Milk & Meat',
      sex: 'Doe',
      dob: toIsoDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2)),
      weightKg: 52,
      milkYieldLiters: 2.8,
      hornStatus: 'Polled',
      parity: 2,
      damTag: '',
      sireTag: '',
      housingPen: 'Elevated Pen A-01',
      status: 'Active Lactating',
      activity: 'Routine milking & sweet potato vines supplementation',
      notes: '',
      date: toIsoDate(new Date())
    });
    setShowModal(true);
  };

  const handleOpenEdit = (goat: GoatRecord) => {
    setEditingId(goat.id);
    setForm({ ...goat });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tagId) return;

    if (editingId && onEditGoat) {
      const updated: GoatRecord = {
        ...form,
        id: editingId,
        tagId: form.tagId,
        breed: form.breed || 'Toggenburg',
        purpose: 'Dual Purpose',
        activity: form.activity || 'Standard routine',
        notes: form.notes || '',
        date: form.date || toIsoDate(new Date())
      } as GoatRecord;
      onEditGoat(editingId, updated);
    } else {
      const newGoat: GoatRecord = {
        ...form,
        id: `goat-${Date.now()}`,
        tagId: form.tagId,
        breed: form.breed || 'Toggenburg',
        purpose: 'Dual Purpose',
        activity: form.activity || 'Enrolled in Dual-Purpose Herd',
        notes: form.notes || '',
        date: form.date || toIsoDate(new Date())
      } as GoatRecord;
      onAddGoat(newGoat);
    }

    setShowModal(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Tag ID', 'Name', 'Breed', 'Purpose', 'Sex', 'Weight (kg)',
      'Daily Milk (L)', 'Parity', 'Status', 'Horn Status', 'Housing Pen',
      'Dam Tag', 'Sire Tag', 'DOB', 'Notes'
    ];
    const rows = filteredGoats.map(g => [
      g.tagId,
      g.name || '',
      g.breed,
      'Dual Purpose (Milk & Meat)',
      g.sex || g.gender || 'Doe',
      (g.weightKg || '').toString(),
      (g.milkYieldLiters || '').toString(),
      (g.parity || '').toString(),
      g.status || 'Active',
      g.hornStatus || 'Polled',
      g.housingPen || '',
      g.damTag || '',
      g.sireTag || '',
      g.dob || '',
      `"${(g.notes || '').replace(/"/g, '""')}"`
    ]);
    exportToCsv('JR_Farm_Dual_Purpose_Goat_Registry.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dual-Purpose Herd</span>
            <Tag size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">{totalGoats}</span>
            <span className="text-xs font-semibold text-amber-700">head</span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">100% Dual Purpose Milk & Meat</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lactating Does</span>
            <Milk size={16} className="text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-950">{milkingDoes}</span>
            <span className="text-xs font-semibold text-blue-700">milking</span>
          </div>
          <p className="text-[10px] text-blue-800/80 mt-1">Daily Parlor Squeeze</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Milk Output</span>
            <Milk size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-950">{totalDailyMilk.toFixed(1)}</span>
            <span className="text-xs font-semibold text-emerald-700">Liters / day</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">~{(totalDailyMilk / (milkingDoes || 1)).toFixed(1)} L/doe average</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Herd Liveweight</span>
            <Scale size={16} className="text-purple-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-purple-950">{avgWeightKg}</span>
            <span className="text-xs font-semibold text-purple-700">KG carcass build</span>
          </div>
          <p className="text-[10px] text-purple-800/80 mt-1">High meat yield conformation</p>
        </div>
      </div>

      {/* Control Bar: Filters, Search, CSV, Add */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tag, name, breed..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Breed Filter */}
          <select
            value={breedFilter}
            onChange={e => setBreedFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700"
          >
            <option value="all">All Breeds</option>
            {DUAL_PURPOSE_BREEDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Sex Filter */}
          <select
            value={sexFilter}
            onChange={e => setSexFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700"
          >
            <option value="all">All Sexes</option>
            <option value="Doe">Does (Female)</option>
            <option value="Buck">Bucks (Breeding Sires)</option>
            <option value="Wether">Wethers (Fattening)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="Active Lactating">Active Lactating</option>
            <option value="Dry Doe">Dry Doe</option>
            <option value="Breeding Buck">Breeding Buck</option>
            <option value="Maiden Doeling">Maiden Doeling</option>
            <option value="Growing Buckling">Growing Buckling</option>
          </select>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 justify-end">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
          >
            <Plus size={14} />
            <span>Register Dual-Purpose Goat</span>
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoats.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
              No dual-purpose goats found matching the active filters.
            </div>
          ) : (
            filteredGoats.map(goat => {
              const isDoe = (goat.sex || goat.gender) === 'Doe' || (goat.sex || goat.gender) === 'Female';
              const isBuck = (goat.sex || goat.gender) === 'Buck' || (goat.sex || goat.gender) === 'Male';

              return (
                <div
                  key={goat.id}
                  className="bg-white border border-gray-200 hover:border-amber-400 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
                >
                  <div>
                    {/* Top Tag & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-gray-900">{goat.tagId}</span>
                          {goat.name && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {goat.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{goat.breed}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(goat)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit Goat Details"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete record for ${goat.tagId}?`)) {
                              onDeleteGoat(goat.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Goat"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Dual Purpose Pill */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-md">
                        Dual Purpose: Milk & Meat
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        goat.status === 'Active Lactating'
                          ? 'bg-blue-100 text-blue-800'
                          : goat.status === 'Breeding Buck'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {goat.status || 'Active'}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded-md">
                        {goat.sex || goat.gender || 'Doe'}
                      </span>
                    </div>

                    {/* Metric Highlights */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Liveweight</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-gray-900 font-mono">{goat.weightKg || 48}</span>
                          <span className="text-[10px] font-semibold text-gray-500">kg</span>
                        </div>
                        <span className="text-[9px] text-gray-400">Meat conformation</span>
                      </div>

                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Milk Yield</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-blue-900 font-mono">
                            {goat.milkYieldLiters !== undefined ? `${goat.milkYieldLiters}` : '—'}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-600">L / day</span>
                        </div>
                        <span className="text-[9px] text-blue-500">{goat.parity ? `Parity ${goat.parity}` : 'Dairy trait'}</span>
                      </div>
                    </div>

                    {/* Pedigree & Pen Details */}
                    <div className="mt-3 text-[11px] text-gray-600 space-y-1 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Housing Pen:</span>
                        <span className="font-semibold text-gray-800">{goat.housingPen || 'Elevated Pen A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Horn Status:</span>
                        <span className="font-semibold text-gray-800">{goat.hornStatus || 'Polled'}</span>
                      </div>
                      {(goat.damTag || goat.sireTag) && (
                        <div className="flex justify-between text-[10px] pt-1 border-t border-gray-200/50">
                          <span className="text-gray-400">Pedigree:</span>
                          <span className="font-mono text-gray-700">D: {goat.damTag || '—'} | S: {goat.sireTag || '—'}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {goat.notes && (
                      <p className="mt-2 text-[11px] text-gray-600 italic bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
                        &quot;{goat.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Quick Hub Navigation Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {isDoe && onNavigateToBreeding && (
                      <button
                        onClick={() => onNavigateToBreeding(goat.tagId)}
                        className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[10px] font-bold transition-all text-center"
                      >
                        Breeding Log
                      </button>
                    )}
                    {onNavigateToTreatment && (
                      <button
                        onClick={() => onNavigateToTreatment(goat.tagId)}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold transition-all text-center"
                      >
                        Vet Treatment
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tag / Name</th>
                  <th className="py-3 px-4">Breed Class</th>
                  <th className="py-3 px-4">Sex</th>
                  <th className="py-3 px-4">Liveweight</th>
                  <th className="py-3 px-4">Daily Milk</th>
                  <th className="py-3 px-4">Parity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pen</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGoats.map(goat => (
                  <tr key={goat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-gray-900">{goat.tagId}</div>
                      {goat.name && <div className="text-[10px] text-amber-700 font-semibold">{goat.name}</div>}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{goat.breed}</td>
                    <td className="py-3 px-4 text-gray-600">{goat.sex || goat.gender || 'Doe'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{goat.weightKg || 48} kg</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {goat.milkYieldLiters !== undefined ? `${goat.milkYieldLiters} L` : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{goat.parity || 1}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                        {goat.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{goat.housingPen || 'Pen A'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(goat)}
                          className="p-1 text-gray-400 hover:text-amber-600"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteGoat(goat.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Dual-Purpose Goat */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {editingId ? 'Edit Dual-Purpose Goat Record' : 'Register New Dual-Purpose Goat'}
                </h3>
                <p className="text-[11px] text-gray-500">JR Farm Caprine Milk & Meat Dual-Utility Registry</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tag ID / Collar Code *</label>
                  <input
                    type="text"
                    required
                    value={form.tagId}
                    onChange={e => setForm(prev => ({ ...prev, tagId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Goat Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Pippa, Bella, Billy"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Breed Class *</label>
                  <select
                    value={form.breed}
                    onChange={e => setForm(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    {DUAL_PURPOSE_BREEDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sex / Gender *</label>
                  <select
                    value={form.sex}
                    onChange={e => setForm(prev => ({ ...prev, sex: e.target.value as any, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Doe">Doe (Female Milker / Breeder)</option>
                    <option value="Buck">Buck (Male Breeding Sire)</option>
                    <option value="Wether">Wether (Castrated Fattening)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Liveweight (KG) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.weightKg}
                    onChange={e => setForm(prev => ({ ...prev, weightKg: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Daily Milk (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.milkYieldLiters}
                    onChange={e => setForm(prev => ({ ...prev, milkYieldLiters: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Parity / Kidding #</label>
                  <input
                    type="number"
                    min="0"
                    value={form.parity}
                    onChange={e => setForm(prev => ({ ...prev, parity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Active Lactating">Active Lactating</option>
                    <option value="Dry Doe">Dry Doe (Resting)</option>
                    <option value="Breeding Buck">Breeding Buck</option>
                    <option value="Maiden Doeling">Maiden Doeling</option>
                    <option value="Growing Buckling">Growing Buckling</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Horn Status</label>
                  <select
                    value={form.hornStatus}
                    onChange={e => setForm(prev => ({ ...prev, hornStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Polled">Polled (Naturally Hornless)</option>
                    <option value="Disbudded">Disbudded (Capped)</option>
                    <option value="Horned">Horned</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Housing Pen</label>
                  <input
                    type="text"
                    value={form.housingPen}
                    onChange={e => setForm(prev => ({ ...prev, housingPen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dam Tag (Mother)</label>
                  <input
                    type="text"
                    value={form.damTag}
                    onChange={e => setForm(prev => ({ ...prev, damTag: e.target.value }))}
                    placeholder="e.g. JR-GT-DAM-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sire Tag (Father)</label>
                  <input
                    type="text"
                    value={form.sireTag}
                    onChange={e => setForm(prev => ({ ...prev, sireTag: e.target.value }))}
                    placeholder="e.g. JR-GT-SIRE-BILLY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes & Dual-Purpose Traits</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Body conformation score, lactation curve, kid rearing maternal instinct..."
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
                  {editingId ? 'Update Goat' : 'Save Goat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
