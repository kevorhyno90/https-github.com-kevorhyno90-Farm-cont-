import React, { useState } from 'react';
import { TeaPracticeRecord, StaffMember } from '../../types';
import {
  Wrench, Plus, Trash2, Calendar, AlertTriangle, CheckCircle2,
  Clock, FileSpreadsheet, ShieldCheck, Tag, User, MapPin, Sparkles, Filter
} from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';
import { INITIAL_TEA_PRACTICE_RECORDS } from '../../initialData';

interface TeaPracticesHubProps {
  staffList?: StaffMember[];
}

const COMMON_PRACTICES = [
  'Pruning (Light Prune / Skiffing)',
  'Pruning (Cut-Back / Hard Rejuvenation)',
  'Fertilizer Application (NPK 26:5:5)',
  'Fertilizer Application (Organic Frass / Compost)',
  'Weeding (Manual Forking / Hand Pulling)',
  'Weeding (Slashing / Inter-row Mulching)',
  'Pest & Disease Control (Mites / Blister Blight)',
  'Infilling (Planting New Clonal Stumps)',
  'Plucking Table Leveling & Tipping',
  'Drainage Trenching & Soil Conservation'
];

export function TeaPracticesHub({ staffList = [] }: TeaPracticesHubProps) {
  const [practices, setPractices] = useState<TeaPracticeRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_tea_practices');
      return stored ? JSON.parse(stored) : INITIAL_TEA_PRACTICE_RECORDS;
    } catch {
      return INITIAL_TEA_PRACTICE_RECORDS;
    }
  });

  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<TeaPracticeRecord>>({
    practiceType: 'Pruning (Light Prune / Skiffing)',
    date: toIsoDate(new Date()),
    who: staffList[0]?.name || 'James Odhiambo & Pruning Team',
    how: 'Cut tea branches down to 24-26 inches flat plucking table using sterilized pruning knives; sealed with copper paste.',
    reason: 'Regenerate plucking table after 4-year cycle to stimulate dense vegetative flush.',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    nextDueDate: offsetIsoDate(365), // 1 year default
    costKes: 3600,
    notes: 'Covered 1 acre of mature clonal tea. Excellent wood condition.'
  });

  const savePractices = (data: TeaPracticeRecord[]) => {
    setPractices(data);
    localStorage.setItem('jr_farm_tea_practices', JSON.stringify(data));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.practiceType || !form.date || !form.nextDueDate) return;

    const newRecord: TeaPracticeRecord = {
      id: `prc-${Date.now()}`,
      practiceType: form.practiceType,
      date: form.date,
      who: form.who || 'Estate Team',
      how: form.how || 'Standard agricultural method',
      reason: form.reason || 'Agronomic routine maintenance',
      blockOrZone: form.blockOrZone || 'Tea Block 1',
      nextDueDate: form.nextDueDate,
      costKes: Number(form.costKes) || 0,
      notes: form.notes || ''
    };

    savePractices([newRecord, ...practices]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this tea agronomy practice log?')) {
      savePractices(practices.filter(p => p.id !== id));
    }
  };

  const handleSetQuickRecurrence = (days: number) => {
    const fromDate = form.date ? new Date(form.date) : new Date();
    setForm(prev => ({
      ...prev,
      nextDueDate: offsetIsoDate(days, fromDate)
    }));
  };

  const handleExportCsv = () => {
    const headers = [
      'Practice Type', 'Date Done', 'Who / Operator', 'How / Method & Dosage',
      'Reason', 'Tea Block / Zone', 'Next Due Date', 'Cost (KES)', 'Notes'
    ];
    const rows = filteredPractices.map(p => [
      p.practiceType,
      p.date,
      p.who,
      `"${p.how.replace(/"/g, '""')}"`,
      `"${p.reason.replace(/"/g, '""')}"`,
      p.blockOrZone,
      p.nextDueDate,
      (p.costKes || 0).toString(),
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);
    exportToCsv('JR_Farm_Tea_Agronomic_Practices.csv', headers, rows);
  };

  const filteredPractices = filterType === 'all'
    ? practices
    : practices.filter(p => p.practiceType.toLowerCase().includes(filterType.toLowerCase()));

  // Metrics
  const totalPractices = practices.length;
  const nowTime = new Date().getTime();
  const overdueCount = practices.filter(p => {
    const dueTime = new Date(p.nextDueDate).getTime();
    return dueTime < nowTime;
  }).length;
  const dueNext30Days = practices.filter(p => {
    const dueTime = new Date(p.nextDueDate).getTime();
    const diffDays = (dueTime - nowTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;
  const totalPracticeSpend = practices.reduce((sum, p) => sum + (p.costKes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Practices Logged</span>
            <Wrench size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-950">{totalPractices}</span>
            <span className="text-xs font-semibold text-emerald-700">operations</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">Pruning, weeding & fertilizer</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/80 shadow-xs">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue Cycles</span>
            <AlertTriangle size={16} className="text-red-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-red-950">{overdueCount}</span>
            <span className="text-xs font-semibold text-red-700">need action</span>
          </div>
          <p className="text-[10px] text-red-800/80 mt-1">Next due date passed</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due Within 30 Days</span>
            <Clock size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">{dueNext30Days}</span>
            <span className="text-xs font-semibold text-amber-700">upcoming</span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">Schedule labor & inputs</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Agronomy Spend</span>
            <Tag size={16} className="text-purple-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-purple-950">KES {totalPracticeSpend.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-purple-800/80 mt-1">Fertilizer, tools & labor</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Wrench size={16} className="text-emerald-700" />
            Tea Agronomy, Husbandry & Recurring Practice Tracker
          </h3>
          <p className="text-[11px] text-gray-500">
            Track exact dates, who did it, method/dosage, reason, and automatically schedule the next time the practice will be done again.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            <option value="all">All Practice Types</option>
            <option value="Pruning">Pruning</option>
            <option value="Fertilizer">Fertilizer Application</option>
            <option value="Weeding">Weeding</option>
            <option value="Pest">Pest & Disease Control</option>
            <option value="Infilling">Infilling</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
          >
            <Plus size={14} />
            <span>Log Field Practice</span>
          </button>
        </div>
      </div>

      {/* Practices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPractices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
            No agronomy practice records found matching the filter.
          </div>
        ) : (
          filteredPractices.map(p => {
            const dueTime = new Date(p.nextDueDate).getTime();
            const isOverdue = dueTime < nowTime;
            const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={p.id}
                className="bg-white border border-gray-200 hover:border-emerald-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Badge & Date */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-900 rounded-md">
                        {p.practiceType}
                      </span>
                      <p className="font-mono text-xs font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        {p.blockOrZone}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        isOverdue
                          ? 'bg-red-100 text-red-800'
                          : diffDays <= 30
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isOverdue ? `Overdue by ${Math.abs(diffDays)}d` : `Due in ${diffDays}d`}
                      </span>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Date Performed & Next Return Date */}
                  <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Date Done</span>
                      <span className="font-mono font-bold text-gray-900 text-xs flex items-center gap-1 mt-0.5">
                        <Calendar size={11} className="text-emerald-700" />
                        {p.date}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-purple-700 font-bold block">Next Time Again</span>
                      <span className="font-mono font-black text-purple-950 text-xs flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-purple-700" />
                        {p.nextDueDate}
                      </span>
                    </div>
                  </div>

                  {/* Who, How, Reason */}
                  <div className="mt-3 text-[11px] text-gray-600 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-900">{p.who}</span>
                      {p.costKes ? (
                        <span className="ml-auto font-mono font-bold text-purple-800">KES {p.costKes.toLocaleString()}</span>
                      ) : null}
                    </div>

                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 space-y-1">
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[9px] block">How / Method:</span>
                        <span className="text-gray-800 font-medium leading-relaxed">{p.how}</span>
                      </div>
                      <div className="pt-1 border-t border-gray-200/50">
                        <span className="text-gray-400 font-bold uppercase text-[9px] block">Reason / Objective:</span>
                        <span className="text-gray-700 italic">{p.reason}</span>
                      </div>
                    </div>

                    {p.notes && (
                      <p className="text-[10px] text-gray-500 italic">
                        &quot;{p.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Return Schedule Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Recurring Status:</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Repeat Scheduled ({p.nextDueDate})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Agronomic Practice */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Record Tea Agronomic Practice</h3>
                <p className="text-[11px] text-gray-500">Track who, how, reason, and schedule the next recurring date</p>
              </div>
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
                  <label className="block font-bold text-gray-700 mb-1">Practice Type *</label>
                  <select
                    value={form.practiceType}
                    onChange={e => setForm(prev => ({ ...prev, practiceType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    {COMMON_PRACTICES.map(cp => (
                      <option key={cp} value={cp}>{cp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tea Block / Zone *</label>
                  <input
                    type="text"
                    required
                    value={form.blockOrZone}
                    onChange={e => setForm(prev => ({ ...prev, blockOrZone: e.target.value }))}
                    placeholder="e.g. Tea Block 1 - Upper Ridge"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date Performed *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Who Performed It *</label>
                  <input
                    type="text"
                    required
                    value={form.who}
                    onChange={e => setForm(prev => ({ ...prev, who: e.target.value }))}
                    placeholder="e.g. James Odhiambo & 4 Casuals"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">How Was It Done? (Method, Tools, Rate) *</label>
                <textarea
                  rows={2}
                  required
                  value={form.how}
                  onChange={e => setForm(prev => ({ ...prev, how: e.target.value }))}
                  placeholder="e.g. Pruned down to 24 inches flat table with shears; broadcasted 50g NPK per bush under leaf drip line on wet soil..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason / Agronomic Justification *</label>
                <textarea
                  rows={2}
                  required
                  value={form.reason}
                  onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Rejuvenate plucking table after 4-year cycle; pre-rains vegetative shoot boost; eliminate weed competition..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              {/* Next Due Date & Quick Recurrence Shortcuts */}
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-black text-purple-950">
                    Next Time The Practice Will Be Done Again *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetQuickRecurrence(30)}
                      className="px-2 py-0.5 bg-white text-purple-800 border border-purple-200 rounded text-[10px] font-bold hover:bg-purple-100"
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickRecurrence(90)}
                      className="px-2 py-0.5 bg-white text-purple-800 border border-purple-200 rounded text-[10px] font-bold hover:bg-purple-100"
                    >
                      +3 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickRecurrence(365)}
                      className="px-2 py-0.5 bg-white text-purple-800 border border-purple-200 rounded text-[10px] font-bold hover:bg-purple-100"
                    >
                      +1 Year
                    </button>
                  </div>
                </div>

                <input
                  type="date"
                  required
                  value={form.nextDueDate}
                  onChange={e => setForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-purple-300 rounded-xl font-mono font-bold text-purple-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Direct Cost (KES, if any)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.costKes}
                    onChange={e => setForm(prev => ({ ...prev, costKes: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Additional Observations</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Weather damp, rain forecast"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
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
                  className="px-5 py-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Save Field Practice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
