import React, { useState } from 'react';
import { TeaRecord } from '../../types';
import {
  Calendar, DollarSign, CheckCircle2, Clock, Users,
  Leaf, ChevronDown, ChevronUp, FileSpreadsheet, Send, ShieldCheck
} from 'lucide-react';
import { useFarmState, REMOTE_SYNC_APPLIED_EVENT } from '../../context/FarmContext';
import { exportToCsv } from '../../utils/csvHelper';

interface TeaWeeklyPayoutHubProps {
  teaRecords: TeaRecord[];
  casualRatePerKg?: number;
}

interface WeekGroup {
  saturdayDate: string; // YYYY-MM-DD
  startDate: string; // Sunday/Monday of that week
  totalWeekKg: number;
  casualKg: number;
  employeeKg: number;
  cashPaidThatWeek: number; // strictly casuals!
  records: TeaRecord[];
  isPaid: boolean;
}

// Helper to find the Saturday of the week for a given date
function getSaturdayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  const diffToSat = 6 - day; // days until Saturday
  d.setDate(d.getDate() + diffToSat);
  return d.toISOString().split('T')[0];
}

function getMondayOfWeek(saturdayStr: string): string {
  const d = new Date(saturdayStr);
  d.setDate(d.getDate() - 5); // Monday is 5 days before Saturday
  return d.toISOString().split('T')[0];
}

export function TeaWeeklyPayoutHub({
  teaRecords = [],
  casualRatePerKg = 12
}: TeaWeeklyPayoutHubProps) {
  const { setFinancials } = useFarmState();

  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [disbursedWeeks, setDisbursedWeeks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_tea_weekly_disbursed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    const handleRemoteSync = () => {
      try {
        const saved = localStorage.getItem('jr_farm_tea_weekly_disbursed');
        if (saved) setDisbursedWeeks(JSON.parse(saved));
      } catch {}
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    };
  }, []);

  // Group tea records by Saturday of that week
  const weekGroups: WeekGroup[] = React.useMemo(() => {
    const map: Record<string, TeaRecord[]> = {};

    teaRecords.forEach(r => {
      const sat = getSaturdayOfWeek(r.date);
      if (!map[sat]) map[sat] = [];
      map[sat].push(r);
    });

    const groups: WeekGroup[] = Object.keys(map).map(sat => {
      const recs = map[sat].sort((a, b) => a.date.localeCompare(b.date));
      const totalWeekKg = recs.reduce((sum, r) => sum + (r.qty || 0), 0);
      const casualKg = recs.reduce((sum, r) => sum + (r.casualPluckedKg ?? Math.round(r.qty * 0.6)), 0);
      const employeeKg = recs.reduce((sum, r) => sum + (r.employeePluckedKg ?? (r.qty - (r.casualPluckedKg ?? Math.round(r.qty * 0.6)))), 0);
      const cashPaidThatWeek = recs.reduce((sum, r) => sum + (r.casualPayoutKes ?? Math.round((r.casualPluckedKg ?? Math.round(r.qty * 0.6)) * (r.casualRatePerKg ?? casualRatePerKg))), 0);
      const isPaid = disbursedWeeks[sat] || recs.every(r => r.casualPaymentStatus === 'Paid / Disbursed');

      return {
        saturdayDate: sat,
        startDate: getMondayOfWeek(sat),
        totalWeekKg,
        casualKg,
        employeeKg,
        cashPaidThatWeek,
        records: recs,
        isPaid
      };
    });

    // Sort descending by Saturday date (most recent first)
    return groups.sort((a, b) => b.saturdayDate.localeCompare(a.saturdayDate));
  }, [teaRecords, disbursedWeeks, casualRatePerKg]);

  const toggleExpand = (sat: string) => {
    setExpandedWeeks(prev => ({ ...prev, [sat]: !prev[sat] }));
  };

  const handleDisburseWages = (week: WeekGroup) => {
    if (!window.confirm(`Confirm Saturday payout disbursement of KES ${week.cashPaidThatWeek.toLocaleString()} for ${week.casualKg.toFixed(1)} KG casual tea plucking?`)) {
      return;
    }

    const updated = { ...disbursedWeeks, [week.saturdayDate]: true };
    setDisbursedWeeks(updated);
    localStorage.setItem('jr_farm_tea_weekly_disbursed', JSON.stringify(updated));

    // Auto-record to Farm Financials
    if (setFinancials) {
      setFinancials(prev => [
        {
          id: `fin-tea-wage-${Date.now()}`,
          date: week.saturdayDate,
          type: 'Expense' as const,
          category: 'Casual Labour & Wages',
          amount: week.cashPaidThatWeek,
          description: `Saturday Tea Plucking Casual Wages (Week ending ${week.saturdayDate}): ${week.casualKg.toFixed(1)} KG @ Ksh ${casualRatePerKg}/KG`,
          recordedBy: 'Dr. Devin Omwenga'
        },
        ...prev
      ]);
    }

    alert(`Successfully disbursed KES ${week.cashPaidThatWeek.toLocaleString()} for Saturday ${week.saturdayDate}. Recorded into Farm Financials!`);
  };

  const handleExportCsv = () => {
    const headers = [
      'Week Ending Saturday', 'Start Date', 'Total Tea of Week (KG)',
      'Casual Workers Plucked (KG)', 'Employees Plucked (KG)',
      'Cash Paid That Week (KES - Casuals Only)', 'Payout Status', 'Daily Receipt Count'
    ];
    const rows = weekGroups.map(w => [
      w.saturdayDate,
      w.startDate,
      w.totalWeekKg.toString(),
      w.casualKg.toString(),
      w.employeeKg.toString(),
      w.cashPaidThatWeek.toString(),
      w.isPaid ? 'Paid / Disbursed' : 'Pending Saturday Payout',
      w.records.length.toString()
    ]);
    exportToCsv('JR_Farm_Tea_Saturday_Weekly_Payouts.csv', headers, rows);
  };

  // KPIs
  const totalWeeksLogged = weekGroups.length;
  const currentWeek = weekGroups[0];
  const pendingPayoutTotal = weekGroups.filter(w => !w.isPaid).reduce((sum, w) => sum + w.cashPaidThatWeek, 0);
  const allTimeCasualWagesPaid = weekGroups.filter(w => w.isPaid).reduce((sum, w) => sum + w.cashPaidThatWeek, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Current Week Tea</span>
            <Leaf size={16} className="text-purple-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-purple-950">
              {currentWeek ? currentWeek.totalWeekKg.toLocaleString() : '0'}
            </span>
            <span className="text-xs font-semibold text-purple-700">KG this week</span>
          </div>
          <p className="text-[10px] text-purple-800/80 mt-1">Week ending Saturday {currentWeek?.saturdayDate || ''}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Casual Cash This Saturday</span>
            <DollarSign size={16} className="text-amber-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-950">
              KES {currentWeek ? currentWeek.cashPaidThatWeek.toLocaleString() : '0'}
            </span>
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">
            For {currentWeek ? Math.round(currentWeek.casualKg) : 0} KG casual tea only
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/80 shadow-xs">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Saturday Cash</span>
            <Clock size={16} className="text-red-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-red-950">KES {pendingPayoutTotal.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-red-800/80 mt-1">Awaiting Saturday cash disbursement</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Disbursed To Date</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-emerald-950">KES {allTimeCasualWagesPaid.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 mt-1">Casual labour expenses logged</p>
        </div>
      </div>

      {/* Control Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-purple-600" />
            Saturday Casual Labour Wage Ledger & Weekly Aggregates
          </h3>
          <p className="text-[11px] text-gray-500">
            Every Saturday, cash wages are calculated strictly for casual pluckers (@ Ksh {casualRatePerKg}/kg). Regular staff are compensated via monthly payroll.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <FileSpreadsheet size={13} />
          <span>Export Weekly Ledger CSV</span>
        </button>
      </div>

      {/* Weekly Cards List */}
      <div className="space-y-4">
        {weekGroups.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
            No weekly tea harvest records found. Record daily harvests in the Daily Harvests tab first.
          </div>
        ) : (
          weekGroups.map(week => {
            const isExpanded = expandedWeeks[week.saturdayDate] ?? true;

            return (
              <div
                key={week.saturdayDate}
                className="bg-white border border-gray-200 hover:border-purple-200 rounded-3xl overflow-hidden shadow-xs transition-all"
              >
                {/* Week Header Summary */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-gray-900">
                        Week Ending Saturday, {week.saturdayDate}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        ({week.startDate} to {week.saturdayDate})
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        week.isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {week.isPaid ? 'Paid / Disbursed' : 'Pending Saturday Payout'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <div>
                        <span className="text-gray-500">Total Tea of That Week: </span>
                        <span className="font-mono font-black text-gray-900">{week.totalWeekKg.toFixed(1)} KG</span>
                      </div>
                      <div>
                        <span className="text-amber-800">Casuals: </span>
                        <span className="font-mono font-bold text-amber-900">{week.casualKg.toFixed(1)} KG</span>
                      </div>
                      <div>
                        <span className="text-blue-800">Employees: </span>
                        <span className="font-mono font-bold text-blue-900">{week.employeeKg.toFixed(1)} KG</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash Paid That Week & Action */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                        Cash Paid That Week
                      </span>
                      <span className="font-mono text-xl font-black text-purple-950">
                        KES {week.cashPaidThatWeek.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-400 block">(Casual pluckers only)</span>
                    </div>

                    {!week.isPaid ? (
                      <button
                        onClick={() => handleDisburseWages(week)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <Send size={13} />
                        <span>Disburse Saturday Cash</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={14} />
                        <span>Disbursed & Synced</span>
                      </div>
                    )}

                    <button
                      onClick={() => toggleExpand(week.saturdayDate)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      title={isExpanded ? 'Collapse Days' : 'Expand Days'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Day-by-Day Breakdown of that Week */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[9px] border-b border-gray-100">
                          <tr>
                            <th className="py-2 px-3">Day / Date</th>
                            <th className="py-2 px-3">Ticket / List #</th>
                            <th className="py-2 px-3 text-right">Casual Plucked (KG)</th>
                            <th className="py-2 px-3 text-right">Employee Plucked (KG)</th>
                            <th className="py-2 px-3 text-right">Day Total (KG)</th>
                            <th className="py-2 px-3 text-right">Casual Wages (KES)</th>
                            <th className="py-2 px-3">Buying Center / Buyer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {week.records.map((r, idx) => {
                            const cKg = r.casualPluckedKg ?? Math.round(r.qty * 0.6);
                            const eKg = r.employeePluckedKg ?? (r.qty - cKg);
                            const rate = r.casualRatePerKg ?? casualRatePerKg;
                            const cPay = r.casualPayoutKes ?? Math.round(cKg * rate);
                            const dayName = new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-mono">
                                  <span className="font-bold text-gray-900">{dayName}</span>, {r.date}
                                </td>
                                <td className="py-2 px-3 font-mono font-medium text-gray-700">
                                  {r.ref}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                                  {cKg.toFixed(1)} kg
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                                  {eKg.toFixed(1)} kg
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-black text-gray-900">
                                  {r.qty.toFixed(1)} kg
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-purple-700">
                                  KES {cPay.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                  {r.buyer || 'Chinga KTDA Factory'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-gray-200">
                          <tr>
                            <td colSpan={2} className="py-2 px-3 text-gray-800">
                              Week Totals
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-amber-800 font-bold">
                              {week.casualKg.toFixed(1)} kg
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-blue-800 font-bold">
                              {week.employeeKg.toFixed(1)} kg
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-gray-900 font-black">
                              {week.totalWeekKg.toFixed(1)} kg
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-purple-900 font-black">
                              KES {week.cashPaidThatWeek.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-[10px] text-gray-400">
                              Only Casuals Paid in Cash
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
