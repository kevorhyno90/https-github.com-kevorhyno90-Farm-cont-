import React, { useState, useMemo } from 'react';
import { PoultryMortalityRecord, PoultryFlock } from '../../types';
import {
  AlertTriangle, Plus, Edit2, Trash2, Calendar, Skull, DollarSign,
  Search, Filter, ShieldAlert, CheckCircle2, Flame, ArrowDownCircle
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { autoPostFinancialTransaction } from '../../utils/inventoryHelper';

interface PoultryMortalityHubProps {
  mortalityRecords: PoultryMortalityRecord[];
  flocks: PoultryFlock[];
  onAddMortalityRecord: (rec: PoultryMortalityRecord, autoDeductFromFlock?: boolean) => void;
  onUpdateMortalityRecord: (id: string, updated: PoultryMortalityRecord) => void;
  onDeleteMortalityRecord: (id: string) => void;
  preselectedFlock?: PoultryFlock | null;
  onClearPreselectedFlock?: () => void;
}

const COMMON_CAUSES = [
  'Low Lay Rate / Unproductive & Vent Prolapse',
  'Coccidiosis (Bloody enteritis)',
  'Newcastle Disease (Respiratory & nervous signs)',
  'Heat Stress / Crowding Suffocation',
  'Cannibalism & Feather/Vent Pecking',
  'Chronic Respiratory Disease (CRD)',
  'Old Age / Spent Layer Depletion',
  'Egg Bound / Internal Layer Peritonitis',
  'Predator Attack (Hawk, Mongoose, Stray Canine)',
  'Accidental Trauma / Leg Fracture',
  'Severe Bumblefoot / Septic Joint',
  'Unknown Cause (Post-mortem pending)'
];

const DISPOSAL_METHODS = [
  'Deep Pit Burial with Lime',
  'High-heat Incineration',
  'Sold for Table Meat',
  'Farm Staff Consumption'
];

export function PoultryMortalityHub({
  mortalityRecords,
  flocks,
  onAddMortalityRecord,
  onUpdateMortalityRecord,
  onDeleteMortalityRecord,
  preselectedFlock,
  onClearPreselectedFlock
}: PoultryMortalityHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PoultryMortalityRecord | null>(null);

  // Form State
  const [flockId, setFlockId] = useState<string>('');
  const [date, setDate] = useState<string>(toIsoDate(new Date()));
  const [type, setType] = useState<PoultryMortalityRecord['type']>('Culling (Low Production / Spent)');
  const [count, setCount] = useState<number>(1);
  const [primaryCause, setPrimaryCause] = useState<string>(COMMON_CAUSES[0]);
  const [postMortemSigns, setPostMortemSigns] = useState<string>('');
  const [disposalMethod, setDisposalMethod] = useState<PoultryMortalityRecord['disposalMethod']>('Sold for Table Meat');
  const [revenueCollectedKsh, setRevenueCollectedKsh] = useState<number>(700);
  const [actionTaken, setActionTaken] = useState<string>('Isolated and removed to maintain flock feed efficiency.');
  const [loggedBy, setLoggedBy] = useState<string>('Peter Kibet');
  const [notes, setNotes] = useState<string>('');
  const [autoDeduct, setAutoDeduct] = useState<boolean>(true);

  React.useEffect(() => {
    if (preselectedFlock) {
      openAddModal(preselectedFlock);
      if (onClearPreselectedFlock) onClearPreselectedFlock();
    }
  }, [preselectedFlock]);

  const openAddModal = (targetFlock?: PoultryFlock) => {
    const f = targetFlock || flocks[0];
    setEditingRecord(null);
    setFlockId(f ? f.id : '');
    setDate(toIsoDate(new Date()));
    setType('Culling (Low Production / Spent)');
    setCount(1);
    setPrimaryCause(COMMON_CAUSES[0]);
    setPostMortemSigns('');
    setDisposalMethod('Sold for Table Meat');
    setRevenueCollectedKsh(700);
    setActionTaken('Isolated and removed to maintain flock feed efficiency.');
    setLoggedBy('Peter Kibet');
    setNotes('');
    setAutoDeduct(true);
    setShowModal(true);
  };

  const openEditModal = (rec: PoultryMortalityRecord) => {
    setEditingRecord(rec);
    setFlockId(rec.flockId);
    setDate(rec.date);
    setType(rec.type);
    setCount(rec.count);
    setPrimaryCause(rec.primaryCause);
    setPostMortemSigns(rec.postMortemSigns || '');
    setDisposalMethod(rec.disposalMethod);
    setRevenueCollectedKsh(rec.revenueCollectedKsh || 0);
    setActionTaken(rec.actionTaken || '');
    setLoggedBy(rec.loggedBy);
    setNotes(rec.notes || '');
    setAutoDeduct(false); // don't double deduct on edit
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selFlock = flocks.find(f => f.id === flockId);
    const flockName = selFlock ? selFlock.flockName : 'Poultry Flock';
    const species = selFlock ? selFlock.species : 'Chicken';

    if (editingRecord) {
      const updated: PoultryMortalityRecord = {
        ...editingRecord,
        flockId,
        flockName,
        species,
        date,
        type,
        count: Number(count),
        primaryCause,
        postMortemSigns,
        disposalMethod,
        revenueCollectedKsh: disposalMethod === 'Sold for Table Meat' ? Number(revenueCollectedKsh) : undefined,
        actionTaken,
        loggedBy,
        notes
      };
      onUpdateMortalityRecord(editingRecord.id, updated);
    } else {
      const newRec: PoultryMortalityRecord = {
        id: `mort-${Date.now()}`,
        flockId,
        flockName,
        species,
        date,
        type,
        count: Number(count),
        primaryCause,
        postMortemSigns,
        disposalMethod,
        revenueCollectedKsh: disposalMethod === 'Sold for Table Meat' ? Number(revenueCollectedKsh) : undefined,
        actionTaken,
        loggedBy,
        notes
      };
      onAddMortalityRecord(newRec, autoDeduct);

      // Cross-module auto-posting for culled bird / table meat revenue
      if (newRec.revenueCollectedKsh && newRec.revenueCollectedKsh > 0) {
        autoPostFinancialTransaction({
          type: 'Income',
          category: 'Poultry / Meat Sales',
          amount: newRec.revenueCollectedKsh,
          description: `Culled Poultry Sale: ${newRec.count} ${newRec.species} from ${newRec.flockName}`,
          date: newRec.date
        });
      }
    }
    setShowModal(false);
  };

  const filteredRecords = useMemo(() => {
    return mortalityRecords
      .filter(r => {
        const matchesSearch =
          r.flockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.primaryCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.postMortemSigns || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || r.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [mortalityRecords, searchTerm, typeFilter]);

  // Aggregate Metrics
  const totalDeaths = mortalityRecords.filter(m => m.type.startsWith('Mortality') || m.type.includes('Predator') || m.type.includes('Accidental')).reduce((s, m) => s + m.count, 0);
  const totalCulled = mortalityRecords.filter(m => m.type.startsWith('Culling') || m.type.includes('Slaughter')).reduce((s, m) => s + m.count, 0);
  const totalCullRevenue = mortalityRecords.reduce((s, m) => s + (m.revenueCollectedKsh || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Skull size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Natural Mortalities</div>
            <div className="text-xl font-bold font-mono text-rose-700">{totalDeaths} <span className="text-xs font-normal text-gray-500">birds lost</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ArrowDownCircle size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Culled Birds</div>
            <div className="text-xl font-bold font-mono text-amber-800">{totalCulled} <span className="text-xs font-normal text-gray-500">culled for meat/health</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cull Meat Sales Revenue</div>
            <div className="text-xl font-bold font-mono text-emerald-800">KSh {totalCullRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search cause, flock, signs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
            >
              <option value="All">All Types</option>
              <option value="Mortality (Natural / Disease)">Mortality (Natural / Disease)</option>
              <option value="Culling (Low Production / Spent)">Culling (Low Production)</option>
              <option value="Culling (Severe Sickness / Humane)">Culling (Humane)</option>
              <option value="Predator Attack / Loss">Predator Attack</option>
              <option value="Emergency Slaughter / Table Sale">Emergency Meat Sale</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Log Culling or Mortality
        </button>
      </div>

      {/* Records Table / List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
          <ShieldAlert size={40} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-sm font-bold text-gray-800">No Culling or Mortality Records Logged</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Keep your flock inventory accurate by recording spent bird cullings, table meat sales, and natural mortalities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((r) => {
            const isCull = r.type.includes('Culling') || r.type.includes('Slaughter');
            const isDuck = r.species === 'Duck';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl p-1 bg-rose-50 rounded-lg">{isDuck ? '🦆' : '🐔'}</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {r.flockName}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                      isCull ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {r.type.split('(')[0].trim()}
                    </span>

                    <span className="text-[11px] font-mono text-gray-500 font-semibold">
                      📅 {r.date}
                    </span>

                    <span className="bg-rose-100 text-rose-900 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      -{r.count} {r.count === 1 ? 'bird' : 'birds'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.revenueCollectedKsh ? (
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        +KSh {r.revenueCollectedKsh.toLocaleString()}
                      </span>
                    ) : null}

                    <button
                      onClick={() => openEditModal(r)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Edit Record"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete record for ${r.flockName} (${r.count} birds)?`)) {
                          onDeleteMortalityRecord(r.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50/70 p-3.5 rounded-xl text-xs border border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Primary Cause / Diagnosis</span>
                    <span className="font-bold text-gray-900">{r.primaryCause}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Disposal / Destination</span>
                    <span className="font-semibold text-gray-800">{r.disposalMethod}</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Logged by: {r.loggedBy}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Corrective Action Taken</span>
                    <span className="text-gray-700 italic">{r.actionTaken || 'Pen sanitized & inspected'}</span>
                  </div>
                </div>

                {r.postMortemSigns && (
                  <div className="text-xs text-gray-800 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 flex items-start gap-1.5">
                    <span className="font-bold text-amber-900 shrink-0">🔬 Necropsy Findings:</span>
                    <span>{r.postMortemSigns}</span>
                  </div>
                )}

                {r.notes && (
                  <p className="text-[11px] text-gray-600 italic">
                    "{r.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Mortality Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>⚠️</span> {editingRecord ? 'Edit Culling / Mortality Entry' : 'Record Culling or Bird Loss'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tracks mortality causes, post-mortem findings, disposal method, and table meat sales.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Flock *</label>
                  <select
                    required
                    value={flockId}
                    onChange={(e) => setFlockId(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    {flocks.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.species === 'Duck' ? '🦆' : '🐔'} {f.flockName} (Current: {f.currentCount} birds)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Entry Classification *</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setType(t);
                      if (t.includes('Mortality') || t.includes('Humane')) {
                        setDisposalMethod('Deep Pit Burial with Lime');
                      } else {
                        setDisposalMethod('Sold for Table Meat');
                      }
                    }}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Culling (Low Production / Spent)">Culling (Low Production / Spent)</option>
                    <option value="Mortality (Natural / Disease)">Mortality (Natural / Disease)</option>
                    <option value="Culling (Severe Sickness / Humane)">Culling (Humane Euthanasia)</option>
                    <option value="Predator Attack / Loss">Predator Attack / Loss</option>
                    <option value="Accidental / Trauma">Accidental / Trauma</option>
                    <option value="Emergency Slaughter / Table Sale">Emergency Slaughter / Table Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">Bird Count Depleted *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-semibold p-2.5 border border-rose-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Disposal Method *</label>
                  <select
                    value={disposalMethod}
                    onChange={(e) => setDisposalMethod(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Sold for Table Meat">Sold for Table Meat (Farm-gate)</option>
                    <option value="Deep Pit Burial with Lime">Deep Pit Burial with Lime</option>
                    <option value="High-heat Incineration">High-heat Incineration</option>
                    <option value="Farm Staff Consumption">Farm Staff Consumption</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Primary Cause / Reason *</label>
                  <input
                    type="text"
                    required
                    list="cause-suggestions"
                    value={primaryCause}
                    onChange={(e) => setPrimaryCause(e.target.value)}
                    placeholder="E.g. Old age low lay rate, coccidiosis, heat stress"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                  <datalist id="cause-suggestions">
                    {COMMON_CAUSES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                {disposalMethod === 'Sold for Table Meat' && (
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">Meat Sale Revenue (KSh)</label>
                    <input
                      type="number"
                      min="0"
                      value={revenueCollectedKsh}
                      onChange={(e) => setRevenueCollectedKsh(parseFloat(e.target.value) || 0)}
                      placeholder="700"
                      className="w-full text-xs font-semibold p-2.5 border border-emerald-300 rounded-xl font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Logged / Certified By</label>
                  <input
                    type="text"
                    required
                    value={loggedBy}
                    onChange={(e) => setLoggedBy(e.target.value)}
                    placeholder="Peter Kibet"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Post-Mortem / Necropsy Signs (Optional)</label>
                  <input
                    type="text"
                    value={postMortemSigns}
                    onChange={(e) => setPostMortemSigns(e.target.value)}
                    placeholder="E.g. Enlarged liver, clotted blood in cecum, or pin-bone spacing shrunk"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Action Taken / Corrective Biosecurity</label>
                  <input
                    type="text"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="E.g. Disinfected brooder corners, medicated with vitamins."
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                {!editingRecord && (
                  <div className="sm:col-span-2 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoDeduct"
                      checked={autoDeduct}
                      onChange={(e) => setAutoDeduct(e.target.checked)}
                      className="rounded text-rose-600 cursor-pointer"
                    />
                    <label htmlFor="autoDeduct" className="text-xs text-rose-900 font-bold cursor-pointer">
                      Automatically deduct {count} {count === 1 ? 'bird' : 'birds'} from the flock's current stocking count
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  {editingRecord ? 'Save Changes' : 'Save Culling / Loss'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
