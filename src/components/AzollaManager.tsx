import React, { useState } from 'react';
import { AzollaRecord } from '../types';
import { Leaf, Plus, Trash2, Sprout, TrendingUp, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AzollaManagerProps {
  records: AzollaRecord[];
  onAddRecord: (rec: AzollaRecord) => void;
  onDeleteRecord: (id: string) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function AzollaManager({ records, onAddRecord, onDeleteRecord, onTriggerSectionReport }: AzollaManagerProps) {
  const [date, setDate] = useState('');
  const [pondId, setPondId] = useState('');
  const [harvestYieldKg, setHarvestYieldKg] = useState<number | ''>('');
  const [distributedTo, setDistributedTo] = useState('');
  const [expensesKsh, setExpensesKsh] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !pondId || harvestYieldKg === '' || !distributedTo) return;

    const newRec: AzollaRecord = {
      id: `AZO-${Date.now()}`,
      date,
      pondId,
      harvestYieldKg: Number(harvestYieldKg),
      distributedTo,
      expensesKsh: expensesKsh === '' ? 0 : Number(expensesKsh),
      notes
    };

    onAddRecord(newRec);
    
    setDate('');
    setPondId('');
    setHarvestYieldKg('');
    setDistributedTo('');
    setExpensesKsh('');
    setNotes('');
  };

  // Group data by Date for the chart
  const chartData = records.reduce((acc, r) => {
    const existing = acc.find(x => x.date === r.date);
    if (existing) {
      existing.yield += r.harvestYieldKg;
      existing.expenses += (r.expensesKsh || 0);
    } else {
      acc.push({ date: r.date, yield: r.harvestYieldKg, expenses: (r.expensesKsh || 0) });
    }
    return acc;
  }, [] as any[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalYield = records.reduce((sum, r) => sum + r.harvestYieldKg, 0);
  const totalExpenses = records.reduce((sum, r) => sum + (r.expensesKsh || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-emerald-800 to-green-600 p-6 rounded-xl shadow-lg text-white">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sprout className="w-8 h-8" />
            Azolla Production
          </h2>
          <p className="text-green-100 opacity-90 mt-1">Manage ponds, harvests, and distribution</p>
        </div>
        {onTriggerSectionReport && (
          <button
            onClick={() => onTriggerSectionReport('azolla')}
            className="flex items-center gap-2 bg-slate-900/40 backdrop-blur-md/20 hover:bg-slate-900/40 backdrop-blur-md/30 px-4 py-2 rounded-lg transition-all shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Plus className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Log Harvest</h3>
          </div>
          
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Pond ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pond A"
                  value={pondId}
                  onChange={e => setPondId(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Yield (KG)</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="0.0"
                  value={harvestYieldKg}
                  onChange={e => setHarvestYieldKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Expenses (Ksh) *Optional</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={expensesKsh}
                  onChange={e => setExpensesKsh(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Distributed To</label>
              <select
                required
                value={distributedTo}
                onChange={e => setDistributedTo(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Destination...</option>
                <option value="Dairy Cows">Dairy Cows</option>
                <option value="Poultry">Poultry</option>
                <option value="Pigs">Pigs</option>
                <option value="Sold">Sold / Market</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Quality, weather impacts, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              Save Harvest Record
            </button>
          </form>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-white">Production Metrics</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{totalYield.toLocaleString()} <span className="text-sm font-normal text-slate-500">KG Total</span></div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px] h-[300px]">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260} minWidth={240} minHeight={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="yield" name="Yield (KG)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-2">
                <Leaf className="w-12 h-12 opacity-20" />
                <p>No harvest data to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/10">
        <div className="px-6 py-4 border-b border-white/15 bg-slate-800/40 flex justify-between items-center">
          <h3 className="font-semibold text-white">Harvest History</h3>
          <span className="text-sm text-slate-500">{records.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-500 text-sm border-b">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Pond</th>
                <th className="px-6 py-3 font-medium text-right">Yield (KG)</th>
                <th className="px-6 py-3 font-medium">Destination</th>
                <th className="px-6 py-3 font-medium text-right">Expenses (Ksh)</th>
                <th className="px-6 py-3 font-medium">Notes</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-200">{rec.date}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-white">{rec.pondId}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-200 text-right font-semibold text-emerald-600">
                      {rec.harvestYieldKg.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-200">{rec.distributedTo}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-200 text-right">
                      {rec.expensesKsh ? rec.expensesKsh.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 max-w-[200px] truncate">{rec.notes || '-'}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-900/20"
                        title="Delete Record"
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
    </div>
  );
}
