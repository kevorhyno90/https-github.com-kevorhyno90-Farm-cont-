import React, { useState } from 'react';
import { TeaRecord, StaffMember } from '../../types';
import {
  Leaf, Plus, Trash2, Edit3, Calendar, FileSpreadsheet,
  Users, UserCheck, Scale, DollarSign, Filter, Search, Tag
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';

interface TeaDailyHarvestHubProps {
  teaRecords: TeaRecord[];
  onAddTea: (rec: TeaRecord) => void;
  onEditTea?: (oldRef: string, updated: TeaRecord) => void;
  onDeleteTea: (ref: string) => void;
  staffList?: StaffMember[];
  casualRatePerKg?: number;
  factoryPricePerKg?: number;
}

export function TeaDailyHarvestHub({
  teaRecords = [],
  onAddTea,
  onEditTea,
  onDeleteTea,
  staffList = [],
  casualRatePerKg = 12,
  factoryPricePerKg = 58
}: TeaDailyHarvestHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRef, setEditingRef] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<{
    date: string;
    ref: string;
    casualPluckedKg: number | '';
    employeePluckedKg: number | '';
    casualRatePerKg: number;
    factoryPricePerKg: number;
    buyer: string;
    blockOrZone: string;
    notes: string;
  }>({
    date: toIsoDate(new Date()),
    ref: `KTDA-REC-${Math.floor(10000 + Math.random() * 90000)}`,
    casualPluckedKg: 95,
    employeePluckedKg: 60,
    casualRatePerKg: casualRatePerKg,
    factoryPricePerKg: factoryPricePerKg,
    buyer: 'Chinga KTDA Factory',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    notes: 'Clean two leaves and a bud. Checked at collection center.'
  });

  const handleOpenAdd = () => {
    setEditingRef(null);
    setForm({
      date: toIsoDate(new Date()),
      ref: `KTDA-REC-${Math.floor(10000 + Math.random() * 90000)}`,
      casualPluckedKg: '',
      employeePluckedKg: '',
      casualRatePerKg: casualRatePerKg,
      factoryPricePerKg: factoryPricePerKg,
      buyer: 'Chinga KTDA Factory',
      blockOrZone: 'Tea Block 1 - Upper Ridge',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rec: TeaRecord) => {
    setEditingRef(rec.ref);
    const cKg = rec.casualPluckedKg ?? Math.round(rec.qty * 0.6);
    const eKg = rec.employeePluckedKg ?? (rec.qty - cKg);
    setForm({
      date: rec.date,
      ref: rec.ref,
      casualPluckedKg: cKg,
      employeePluckedKg: eKg,
      casualRatePerKg: rec.casualRatePerKg ?? casualRatePerKg,
      factoryPricePerKg: rec.pricePerKg ?? factoryPricePerKg,
      buyer: rec.buyer || 'Chinga KTDA Factory',
      blockOrZone: rec.blockOrZone || 'Tea Block 1 - Upper Ridge',
      notes: rec.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ref.trim() || form.casualPluckedKg === '' || form.employeePluckedKg === '') return;

    const cKg = Number(form.casualPluckedKg) || 0;
    const eKg = Number(form.employeePluckedKg) || 0;
    const totalKg = cKg + eKg;
    const rate = Number(form.casualRatePerKg) || 12;
    const fPrice = Number(form.factoryPricePerKg) || 58;
    const casualCash = Math.round(cKg * rate);

    const record: TeaRecord = {
      qty: totalKg,
      ref: form.ref.trim(),
      date: form.date,
      pricePerKg: fPrice,
      buyer: form.buyer || 'Chinga KTDA Factory',
      totalSales: totalKg * fPrice,
      casualPluckedKg: cKg,
      employeePluckedKg: eKg,
      casualRatePerKg: rate,
      casualPayoutKes: casualCash,
      casualPaymentStatus: 'Pending Saturday Payout',
      blockOrZone: form.blockOrZone,
      notes: form.notes
    };

    if (editingRef && onEditTea) {
      onEditTea(editingRef, record);
    } else {
      onAddTea(record);
    }

    setShowModal(false);
  };

  const handleDelete = (ref: string) => {
    if (window.confirm(`Delete daily tea harvest ticket ${ref}?`)) {
      onDeleteTea(ref);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Date', 'Receipt / List Ref', 'Casual Plucked (KG)', 'Employee Plucked (KG)',
      'Total Harvest (KG)', 'Casual Rate (KES/KG)', 'Saturday Casual Cash (KES)',
      'Factory Price (KES/KG)', 'Gross Value (KES)', 'Buyer / Factory', 'Block / Zone', 'Notes'
    ];
    const rows = filteredRecords.map(r => {
      const cKg = r.casualPluckedKg ?? Math.round(r.qty * 0.6);
      const eKg = r.employeePluckedKg ?? (r.qty - cKg);
      const rate = r.casualRatePerKg ?? casualRatePerKg;
      const cPay = r.casualPayoutKes ?? Math.round(cKg * rate);
      const fPrice = r.pricePerKg ?? factoryPricePerKg;
      return [
        r.date,
        r.ref,
        cKg.toString(),
        eKg.toString(),
        r.qty.toString(),
        rate.toString(),
        cPay.toString(),
        fPrice.toString(),
        (r.totalSales ?? (r.qty * fPrice)).toString(),
        r.buyer || 'Chinga KTDA Factory',
        r.blockOrZone || '',
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
    });
    exportToCsv('JR_Farm_Tea_Daily_Harvests.csv', headers, rows);
  };

  // Filter & Aggregates
  const filteredRecords = teaRecords.filter(r => {
    return (
      (r.ref && r.ref.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.buyer && r.buyer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.blockOrZone && r.blockOrZone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalHarvestKg = filteredRecords.reduce((sum, r) => sum + (r.qty || 0), 0);
  const totalCasualKg = filteredRecords.reduce((sum, r) => sum + (r.casualPluckedKg ?? Math.round(r.qty * 0.6)), 0);
  const totalEmployeeKg = filteredRecords.reduce((sum, r) => sum + (r.employeePluckedKg ?? (r.qty - (r.casualPluckedKg ?? Math.round(r.qty * 0.6)))), 0);
  const totalCasualWages = filteredRecords.reduce((sum, r) => sum + (r.casualPayoutKes ?? Math.round((r.casualPluckedKg ?? Math.round(r.qty * 0.6)) * (r.casualRatePerKg ?? casualRatePerKg))), 0);

  return (
    <div className="space-y-6">
      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Green Leaf</span>
            <Leaf size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-950">{totalHarvestKg.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-700">KG plucked</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">Verified factory receipts</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Casuals Plucked</span>
            <Users size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">{Math.round(totalCasualKg).toLocaleString()}</span>
            <span className="text-xs font-semibold text-amber-700">KG ({totalHarvestKg > 0 ? Math.round((totalCasualKg / totalHarvestKg) * 100) : 0}%)</span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">Subject to Saturday cash wages</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Employees Plucked</span>
            <UserCheck size={16} className="text-blue-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-950">{Math.round(totalEmployeeKg).toLocaleString()}</span>
            <span className="text-xs font-semibold text-blue-700">KG ({totalHarvestKg > 0 ? Math.round((totalEmployeeKg / totalHarvestKg) * 100) : 0}%)</span>
          </div>
          <p className="text-[10px] text-blue-800/80 mt-1">Permanent monthly staff roster</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Casual Saturday Wages</span>
            <DollarSign size={16} className="text-purple-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-purple-950">KES {Math.round(totalCasualWages).toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-purple-800/80 mt-1">@ KES {casualRatePerKg}/kg casual rate</p>
        </div>
      </div>

      {/* Control Bar: Search, Add, CSV */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Leaf size={16} className="text-emerald-600" />
            Daily Tea Harvest Receipts & Weighbridge Ledger
          </h3>
          <p className="text-[11px] text-gray-500">
            Enter daily collection tickets with exact breakdown of kg plucked by casual workers vs employees.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search receipt ref, block..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
          >
            <FileSpreadsheet size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
          >
            <Plus size={14} />
            <span>Record Daily Harvest</span>
          </button>
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Receipt / List #</th>
                <th className="py-3 px-4">Block / Zone</th>
                <th className="py-3 px-4 text-right">Casual (KG)</th>
                <th className="py-3 px-4 text-right">Employee (KG)</th>
                <th className="py-3 px-4 text-right">Total Day (KG)</th>
                <th className="py-3 px-4 text-right">Casual Cash (KES)</th>
                <th className="py-3 px-4">Buyer / Factory</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No daily harvest records found. Click &quot;Record Daily Harvest&quot; to add your first weighbridge receipt.
                  </td>
                </tr>
              ) : (
                [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => {
                  const cKg = r.casualPluckedKg ?? Math.round(r.qty * 0.6);
                  const eKg = r.employeePluckedKg ?? (r.qty - cKg);
                  const rate = r.casualRatePerKg ?? casualRatePerKg;
                  const cPay = r.casualPayoutKes ?? Math.round(cKg * rate);

                  return (
                    <tr key={r.ref || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {r.date}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900">{r.ref}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {r.blockOrZone || 'Tea Block 1'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        {cKg.toFixed(1)} kg
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                        {eKg.toFixed(1)} kg
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-gray-900 bg-slate-50/50">
                        {r.qty.toFixed(1)} kg
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                        KES {cPay.toLocaleString()}
                        <span className="block text-[9px] text-gray-400 font-normal">@ Ksh {rate}/kg</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <span className="font-medium">{r.buyer || 'KTDA Factory'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1 text-gray-400 hover:text-emerald-700"
                            title="Edit Record"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.ref)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Daily Harvest Receipt */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {editingRef ? 'Edit Daily Harvest Receipt' : 'Record Daily Tea Harvest & Scale Ticket'}
                </h3>
                <p className="text-[11px] text-gray-500">Record daily casual vs employee plucking split</p>
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
                  <label className="block font-bold text-gray-700 mb-1">Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ticket / Receipt Ref *</label>
                  <input
                    type="text"
                    required
                    value={form.ref}
                    onChange={e => setForm(prev => ({ ...prev, ref: e.target.value }))}
                    placeholder="e.g. KTDA-TX-99880"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Casual vs Employee Plucking Inputs */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60">
                <div>
                  <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Users size={12} className="text-amber-700" />
                    Casual Workers Plucked (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={form.casualPluckedKg}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      casualPluckedKg: e.target.value === '' ? '' : parseFloat(e.target.value)
                    }))}
                    placeholder="e.g. 95"
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl font-mono font-black text-amber-900 bg-white"
                  />
                  <span className="text-[10px] text-amber-700 block mt-1">Paid on Saturday</span>
                </div>

                <div>
                  <label className="block font-bold text-blue-900 mb-1 flex items-center gap-1">
                    <UserCheck size={12} className="text-blue-700" />
                    Employees Plucked (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={form.employeePluckedKg}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      employeePluckedKg: e.target.value === '' ? '' : parseFloat(e.target.value)
                    }))}
                    placeholder="e.g. 60"
                    className="w-full px-3 py-2 border border-blue-300 rounded-xl font-mono font-black text-blue-900 bg-white"
                  />
                  <span className="text-[10px] text-blue-700 block mt-1">On Monthly Payroll</span>
                </div>

                {/* Auto Calculated Day Total & Cash Liability */}
                <div className="col-span-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500 font-semibold">Total Day Yield: </span>
                    <span className="font-mono font-black text-gray-900 text-sm">
                      {((Number(form.casualPluckedKg) || 0) + (Number(form.employeePluckedKg) || 0)).toFixed(1)} KG
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800 font-semibold">Casual Saturday Cash: </span>
                    <span className="font-mono font-black text-purple-900 text-sm">
                      KES {Math.round((Number(form.casualPluckedKg) || 0) * (Number(form.casualRatePerKg) || 12)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Casual Plucking Rate (KES/KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={form.casualRatePerKg}
                    onChange={e => setForm(prev => ({ ...prev, casualRatePerKg: parseFloat(e.target.value) || 12 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Factory Base Price (KES/KG)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={form.factoryPricePerKg}
                    onChange={e => setForm(prev => ({ ...prev, factoryPricePerKg: parseFloat(e.target.value) || 58 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Buyer / Factory</label>
                  <input
                    type="text"
                    required
                    value={form.buyer}
                    onChange={e => setForm(prev => ({ ...prev, buyer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tea Block / Zone</label>
                  <input
                    type="text"
                    value={form.blockOrZone}
                    onChange={e => setForm(prev => ({ ...prev, blockOrZone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Plucking Notes & Leaf Quality</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Moisture conditions, dew weight deduction, buying center scale verification..."
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
                  className="px-5 py-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Save Daily Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
