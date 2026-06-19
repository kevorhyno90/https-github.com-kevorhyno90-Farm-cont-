/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinancialRecord } from '../types';
import { Coins, Plus, TrendingUp, TrendingDown, Trash2, Search, Filter, BookOpen, Edit2, FileSpreadsheet, FileDown } from 'lucide-react';

interface FinancialsProps {
  financialRecords: FinancialRecord[];
  onAddTransaction: (rec: FinancialRecord) => void;
  onDeleteTransaction: (id: string) => void;
  onEditFinancialRecord?: (id: string, updated: FinancialRecord) => void;
  onTriggerSectionPdf?: (sectionKey: string) => void;
}

export function Financials({ financialRecords, onAddTransaction, onDeleteTransaction, onEditFinancialRecord, onTriggerSectionPdf }: FinancialsProps) {
  // Income form state
  const [incAmt, setIncAmt] = useState<number | ''>('');
  const [incSrc, setIncSrc] = useState('');
  const [incDesc, setIncDesc] = useState('');

  // Editing state
  const [editingFinancial, setEditingFinancial] = useState<FinancialRecord | null>(null);

  // Expense form state
  const [expAmt, setExpAmt] = useState<number | ''>('');
  const [expSrc, setExpSrc] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Search/Filter state
  const [term, setTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incAmt === '' || !incSrc.trim()) return;
    onAddTransaction({
      id: `f-${Date.now()}`,
      type: 'income',
      amount: Number(incAmt),
      category: incSrc.trim(),
      description: incDesc.trim() || 'No description set',
      date: new Date().toISOString().split('T')[0]
    });
    setIncAmt('');
    setIncSrc('');
    setIncDesc('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmt === '' || !expSrc.trim()) return;
    onAddTransaction({
      id: `f-${Date.now()}`,
      type: 'expense',
      amount: Number(expAmt),
      category: expSrc.trim(),
      description: expDesc.trim() || 'No description set',
      date: new Date().toISOString().split('T')[0]
    });
    setExpAmt('');
    setExpSrc('');
    setExpDesc('');
  };

  // Calculations
  const totalIncome = financialRecords
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financialRecords
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netPl = totalIncome - totalExpense;

  // Filter lists
  const filteredRecords = financialRecords
    .filter((r) => {
      const matchType = typeFilter === 'all' || r.type === typeFilter;
      const matchTerm =
        !term ||
        r.category.toLowerCase().includes(term.toLowerCase()) ||
        r.description.toLowerCase().includes(term.toLowerCase());
      return matchType && matchTerm;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const downloadFinancialsCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'NYARONDE FARM ACCOUNTING LEDGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Transaction Reference ID,Type,Category/Source,Description,Amount (Ksh)\n';
    filteredRecords.forEach((f) => {
      csv += `${f.date},"${f.id}","${f.type}","${f.category}","${f.description}",${f.amount}\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Financial_Operational_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-teal-100 text-teal-950 rounded-xl shrink-0">
          <BookOpen className="text-emerald-900" size={24} />
        </div>
        <div>
          <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Estate Accounting Ledger</h4>
          <p className="text-xs text-slate-400 font-medium">
            Monitor farm operational P&L. Record income streams and verify operational expenses.
          </p>
        </div>
      </div>

      {/* Main double borders net worth */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border-8 border-double border-emerald-700/60 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Active Net Operating Balance</span>
          <h1 className={`text-5xl font-black font-mono tracking-tight ${netPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Ksh {netPl.toLocaleString()}
          </h1>
          <p className="text-xs text-slate-350">Accrued aggregate of all logged operational streams</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 bg-slate-800 border border-slate-700/60 p-4 rounded-2xl text-center md:px-6">
            <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wider">Total Incomes</span>
            <h3 className="text-emerald-400 font-black font-mono text-lg mt-1">+{totalIncome.toLocaleString()}</h3>
          </div>
          <div className="flex-1 bg-slate-800 border border-slate-700/60 p-4 rounded-2xl text-center md:px-6">
            <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wider">Total Outgoings</span>
            <h3 className="text-rose-400 font-black font-mono text-lg mt-1">-{totalExpense.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Forms layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income logger */}
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-emerald-950 uppercase">Log Income Stream</h5>
            <p className="text-xs text-emerald-700 font-medium">Record revenue payouts, sales advances, or cash receipts</p>
          </div>

          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Amount (Ksh)</label>
              <input
                type="number"
                required
                min="1"
                value={incAmt}
                onChange={(e) => setIncAmt(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Amount in Ksh"
                className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-bold bg-white focus:ring-emerald-700/10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Source / Category</label>
                <select
                  required
                  value={incSrc}
                  onChange={(e) => setIncSrc(e.target.value)}
                  className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-semibold bg-white cursor-pointer"
                >
                  <option value="">Choose category...</option>
                  <option value="Milk Sale">Brookside Milk Deliveries</option>
                  <option value="Tea Sale">KTDA Tea Bonus/Advances</option>
                  <option value="Avocado Sale">Avocado Export Payout</option>
                  <option value="Poultry / Eggs">Flock Egg Trays Sale</option>
                  <option value="Crops Sale">Fields / Timber / Bananas</option>
                  <option value="Other Revenue">Other Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Details / Bill Notes</label>
                <input
                  type="text"
                  required
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  placeholder="E.g. Rec ref #33989"
                  className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-medium bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Post Revenue Transaction
            </button>
          </form>
        </div>

        {/* Expense logger */}
        <div className="bg-rose-50 border border-rose-150 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-rose-950 uppercase">Log Farm Expense</h5>
            <p className="text-xs text-rose-700 font-medium">Record wages, veterinarian fees, chemical treatments, or machine repair</p>
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Amount (Ksh)</label>
              <input
                type="number"
                required
                min="1"
                value={expAmt}
                onChange={(e) => setExpAmt(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Amount in Ksh"
                className="text-xs border border-rose-200 rounded-lg p-3 w-full font-bold bg-white focus:ring-rose-700/10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Expense Category</label>
                <select
                  required
                  value={expSrc}
                  onChange={(e) => setExpSrc(e.target.value)}
                  className="text-xs border border-rose-200 rounded-lg p-3 w-full font-semibold bg-white cursor-pointer"
                >
                  <option value="">Choose category...</option>
                  <option value="Animal Feed">Compounding Raw Feed Materials</option>
                  <option value="Veternary Care">Vet Checks / AI Semen Straws</option>
                  <option value="Sprays / Fertilizers">Chemical sprays / soil NPK bags</option>
                  <option value="Wages">Wages & Plucker Compensation</option>
                  <option value="Maintenance / Fuel">Tractor fuel & repairs</option>
                  <option value="Store Supplies">General operational tools</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Transaction Details</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="E.g. Payee Victor advance wages"
                  className="text-xs border border-rose-200 rounded-lg p-3 w-full font-medium bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Post Debit Transaction
            </button>
          </form>
        </div>
      </div>

      {/* Audit table list */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-[#0b251a] uppercase">Operational Auditing Ledger</h5>
            <p className="text-xs text-slate-400 font-medium">Granular drilldown of all processed accounts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={downloadFinancialsCSV}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0 shrink-0"
              title="Download Ledger CSV"
            >
              <FileSpreadsheet size={13} />
              Export CSV
            </button>
            {onTriggerSectionPdf && (
              <button
                onClick={() => onTriggerSectionPdf('financials')}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 shrink-0"
                title="Export Financial Report as PDF"
              >
                <FileDown size={13} />
                Export Ledger PDF
              </button>
            )}

            <div className="relative flex-1 sm:w-48">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search ledger..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="text-xs border border-slate-200 bg-slate-50/50 rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:bg-white font-bold"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50 focus:outline-none font-bold"
            >
              <option value="all">All ledger records</option>
              <option value="income">Credits only</option>
              <option value="expense">Debits only</option>
            </select>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto pr-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-black">
                <td className="p-3">Reference Date</td>
                <td className="p-3">Category</td>
                <td className="p-3">Auditing Details</td>
                <td className="p-3 text-right">Accounting Flow</td>
                <td className="p-3 text-center">Audit</td>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 italic py-10">
                    No transactions qualify the current filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                    <td className="p-3 font-mono text-slate-400 font-bold">{r.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        r.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-600 max-w-xs truncate" title={r.description}>
                      {r.description}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-sm">
                      <span className={r.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}>
                        {r.type === 'income' ? '+' : '-'} Ksh {r.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditFinancialRecord && (
                          <button
                            onClick={() => setEditingFinancial(r)}
                            className="text-slate-300 hover:text-indigo-800 p-2 border border-transparent hover:border-slate-200 rounded-lg transition-colors cursor-pointer m-0"
                            title="Edit entry"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTransaction(r.id)}
                          className="text-slate-300 hover:text-red-650 p-2 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer m-0"
                          title="Void entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Financial Record Modal */}
      {editingFinancial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Transaction Flow</h3>
              <button onClick={() => setEditingFinancial(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Flow Type</label>
                <select
                  value={editingFinancial.type}
                  onChange={(e) => setEditingFinancial({ ...editingFinancial, type: e.target.value as 'income' | 'expense' })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="income">Income (+ Record)</option>
                  <option value="expense">Expense (- Loss)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Amount (Ksh)</label>
                  <input
                    type="number"
                    value={editingFinancial.amount}
                    onChange={(e) => setEditingFinancial({ ...editingFinancial, amount: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingFinancial.date}
                    onChange={(e) => setEditingFinancial({ ...editingFinancial, date: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Source / Category</label>
                <input
                  type="text"
                  value={editingFinancial.category}
                  onChange={(e) => setEditingFinancial({ ...editingFinancial, category: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-extrabold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Description</label>
                <textarea
                  value={editingFinancial.description}
                  onChange={(e) => setEditingFinancial({ ...editingFinancial, description: e.target.value })}
                  rows={2}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingFinancial(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditFinancialRecord) {
                    onEditFinancialRecord(editingFinancial.id, editingFinancial);
                  }
                  setEditingFinancial(null);
                }}
                className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
