import React, { useState, useMemo } from 'react';
import { TeaRecord } from '../../types';
import {
  Calendar, Leaf, Users, UserCheck, DollarSign,
  TrendingUp, FileSpreadsheet, BarChart3, PieChart
} from 'lucide-react';
import { exportToCsv } from '../../utils/csvHelper';

interface TeaMonthlyHubProps {
  teaRecords: TeaRecord[];
  casualRatePerKg?: number;
  factoryPricePerKg?: number;
}

interface MonthSummary {
  monthKey: string; // YYYY-MM
  monthName: string; // e.g. "September 2024"
  totalMonthKg: number;
  casualKg: number;
  employeeKg: number;
  casualWagesPaid: number;
  estimatedGrossValue: number;
  netMargin: number;
  daysPlucked: number;
  avgDailyKg: number;
}

export function TeaMonthlyHub({
  teaRecords = [],
  casualRatePerKg = 12,
  factoryPricePerKg = 58
}: TeaMonthlyHubProps) {
  // Aggregate records by month
  const monthlyData: MonthSummary[] = useMemo(() => {
    const map: Record<string, TeaRecord[]> = {};

    teaRecords.forEach(r => {
      const monthKey = r.date.slice(0, 7); // YYYY-MM
      if (!map[monthKey]) map[monthKey] = [];
      map[monthKey].push(r);
    });

    const summaries: MonthSummary[] = Object.keys(map).map(mKey => {
      const recs = map[mKey];
      const totalMonthKg = recs.reduce((sum, r) => sum + (r.qty || 0), 0);
      const casualKg = recs.reduce((sum, r) => sum + (r.casualPluckedKg ?? Math.round(r.qty * 0.6)), 0);
      const employeeKg = recs.reduce((sum, r) => sum + (r.employeePluckedKg ?? (r.qty - (r.casualPluckedKg ?? Math.round(r.qty * 0.6)))), 0);
      const casualWagesPaid = recs.reduce((sum, r) => sum + (r.casualPayoutKes ?? Math.round((r.casualPluckedKg ?? Math.round(r.qty * 0.6)) * (r.casualRatePerKg ?? casualRatePerKg))), 0);
      const estimatedGrossValue = recs.reduce((sum, r) => sum + (r.totalSales ?? (r.qty * (r.pricePerKg ?? factoryPricePerKg))), 0);
      const netMargin = estimatedGrossValue - casualWagesPaid;

      // Unique days plucked
      const uniqueDays = new Set(recs.map(r => r.date)).size;
      const avgDailyKg = uniqueDays > 0 ? Math.round(totalMonthKg / uniqueDays) : 0;

      // Format month name
      const [year, month] = mKey.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
        monthKey: mKey,
        monthName,
        totalMonthKg,
        casualKg,
        employeeKg,
        casualWagesPaid,
        estimatedGrossValue,
        netMargin,
        daysPlucked: uniqueDays,
        avgDailyKg
      };
    });

    return summaries.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [teaRecords, casualRatePerKg, factoryPricePerKg]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    monthlyData[0]?.monthKey || new Date().toISOString().slice(0, 7)
  );

  const activeMonth = monthlyData.find(m => m.monthKey === selectedMonthKey) || monthlyData[0];

  const handleExportCsv = () => {
    const headers = [
      'Month', 'Total Tea of Month (KG)', 'Casual Workers Plucked (KG)',
      'Employees Plucked (KG)', 'Casual Labour Cash Paid (KES)',
      'Gross Factory Value (KES)', 'Net Estate Surplus (KES)', 'Days Plucked', 'Daily Average (KG)'
    ];
    const rows = monthlyData.map(m => [
      m.monthName,
      m.totalMonthKg.toString(),
      m.casualKg.toString(),
      m.employeeKg.toString(),
      m.casualWagesPaid.toString(),
      m.estimatedGrossValue.toString(),
      m.netMargin.toString(),
      m.daysPlucked.toString(),
      m.avgDailyKg.toString()
    ]);
    exportToCsv('JR_Farm_Tea_Monthly_Production.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Month Selector & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-700" />
            Monthly Tea Production & Green Leaf Factory Statement
          </h3>
          <p className="text-[11px] text-gray-500">
            Comprehensive monthly green leaf aggregates, casual wages expense, and factory revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-bold">Select Month:</span>
            <select
              value={selectedMonthKey}
              onChange={e => setSelectedMonthKey(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl bg-white font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {monthlyData.map(m => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthName} ({m.totalMonthKg.toLocaleString()} KG)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet size={13} />
            <span>Export Monthly CSV</span>
          </button>
        </div>
      </div>

      {/* Selected Month Spotlight KPI Cards */}
      {activeMonth && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Tea of That Month</span>
                <Leaf size={16} className="text-emerald-700" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-emerald-950">
                  {activeMonth.totalMonthKg.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-700">KG</span>
              </div>
              <p className="text-[10px] text-emerald-800/80 mt-1">{activeMonth.monthName} Total Output</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Casual Cash Paid</span>
                <DollarSign size={16} className="text-purple-700" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-purple-950">
                  KES {activeMonth.casualWagesPaid.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-purple-800/80 mt-1">Paid on Saturdays to casuals</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 shadow-xs">
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Gross Factory Payout</span>
                <TrendingUp size={16} className="text-blue-700" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-blue-950">
                  KES {activeMonth.estimatedGrossValue.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-blue-800/80 mt-1">@ KES {factoryPricePerKg}/kg factory base</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/80 shadow-xs">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Net Leaf Margin</span>
                <DollarSign size={16} className="text-amber-700" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-amber-950">
                  KES {activeMonth.netMargin.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-amber-800/80 mt-1">Surplus after casual labour</p>
            </div>
          </div>

          {/* Visual Plucker Breakdown Bar */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-900">{activeMonth.monthName} Plucking Distribution:</span>
              <span className="text-gray-500 font-mono">
                {activeMonth.daysPlucked} plucking days • ~{activeMonth.avgDailyKg} KG / day average
              </span>
            </div>

            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                style={{
                  width: `${activeMonth.totalMonthKg > 0 ? (activeMonth.casualKg / activeMonth.totalMonthKg) * 100 : 50}%`
                }}
                title={`Casuals: ${activeMonth.casualKg.toFixed(1)} KG`}
              >
                {activeMonth.totalMonthKg > 0 ? `${Math.round((activeMonth.casualKg / activeMonth.totalMonthKg) * 100)}%` : ''}
              </div>
              <div
                className="bg-blue-600 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                style={{
                  width: `${activeMonth.totalMonthKg > 0 ? (activeMonth.employeeKg / activeMonth.totalMonthKg) * 100 : 50}%`
                }}
                title={`Employees: ${activeMonth.employeeKg.toFixed(1)} KG`}
              >
                {activeMonth.totalMonthKg > 0 ? `${Math.round((activeMonth.employeeKg / activeMonth.totalMonthKg) * 100)}%` : ''}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-sm inline-block"></span>
                <span className="text-gray-700 font-medium">Casual Pluckers: </span>
                <span className="font-mono font-bold text-gray-900">{activeMonth.casualKg.toFixed(1)} KG</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-sm inline-block"></span>
                <span className="text-gray-700 font-medium">Permanent Staff: </span>
                <span className="font-mono font-bold text-gray-900">{activeMonth.employeeKg.toFixed(1)} KG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Month-by-Month Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Historical Monthly Tea Production Ledger
          </h4>
          <span className="text-[10px] text-gray-400 font-medium">
            Aggregated from daily verified delivery tickets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-right">Total Month Tea</th>
                <th className="py-3 px-4 text-right">Casual Plucked</th>
                <th className="py-3 px-4 text-right">Employee Plucked</th>
                <th className="py-3 px-4 text-right">Casual Cash Paid</th>
                <th className="py-3 px-4 text-right">Gross Factory Value</th>
                <th className="py-3 px-4 text-right">Net Margin</th>
                <th className="py-3 px-4 text-center">Days Plucked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyData.map(m => (
                <tr
                  key={m.monthKey}
                  onClick={() => setSelectedMonthKey(m.monthKey)}
                  className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                    m.monthKey === selectedMonthKey ? 'bg-emerald-50/40 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {m.monthName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-950">
                    {m.totalMonthKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                    {m.casualKg.toFixed(1)} kg
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                    {m.employeeKg.toFixed(1)} kg
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                    KES {m.casualWagesPaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                    KES {m.estimatedGrossValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    KES {m.netMargin.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-gray-600">
                    {m.daysPlucked} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
