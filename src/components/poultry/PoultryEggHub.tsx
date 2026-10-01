import React, { useState, useMemo } from 'react';
import { PoultryEggRecord, PoultryFlock } from '../../types';
import {
  Egg, Plus, Edit2, Trash2, Calendar, Download, TrendingUp,
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight, DollarSign, Filter
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface PoultryEggHubProps {
  eggRecords: PoultryEggRecord[];
  flocks: PoultryFlock[];
  onAddEggRecord: (rec: PoultryEggRecord) => void;
  onUpdateEggRecord: (id: string, updated: PoultryEggRecord) => void;
  onDeleteEggRecord: (id: string) => void;
  preselectedFlock?: PoultryFlock | null;
  onClearPreselectedFlock?: () => void;
}

export function PoultryEggHub({
  eggRecords,
  flocks,
  onAddEggRecord,
  onUpdateEggRecord,
  onDeleteEggRecord,
  preselectedFlock,
  onClearPreselectedFlock
}: PoultryEggHubProps) {
  // Current active month in YYYY-MM format
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mo}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedFlockFilter, setSelectedFlockFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PoultryEggRecord | null>(null);

  // Form State
  const [flockId, setFlockId] = useState<string>('');
  const [date, setDate] = useState<string>(toIsoDate(new Date()));
  const [goodEggsCount, setGoodEggsCount] = useState<number>(300);
  const [crackedEggsCount, setCrackedEggsCount] = useState<number>(3);
  const [abnormalEggsCount, setAbnormalEggsCount] = useState<number>(1);
  const [pricePerCrate, setPricePerCrate] = useState<number>(380);
  const [cratesSold, setCratesSold] = useState<number>(0);
  const [collectedBy, setCollectedBy] = useState<string>('Peter Kibet');
  const [collectionTime, setCollectionTime] = useState<'Morning' | 'Afternoon' | 'Combined Daily Total'>('Morning');
  const [notes, setNotes] = useState<string>('');

  // If a flock is passed as preselected, open the modal for it
  React.useEffect(() => {
    if (preselectedFlock) {
      openAddModal(preselectedFlock);
      if (onClearPreselectedFlock) onClearPreselectedFlock();
    }
  }, [preselectedFlock]);

  const layingFlocks = useMemo(() => {
    return flocks.filter(f => f.stateOfProduction === 'Active Egg Laying' || f.stage.includes('Adults'));
  }, [flocks]);

  const openAddModal = (targetFlock?: PoultryFlock) => {
    const f = targetFlock || (layingFlocks.length > 0 ? layingFlocks[0] : flocks[0]);
    setEditingRecord(null);
    setFlockId(f ? f.id : '');
    setDate(toIsoDate(new Date()));
    setGoodEggsCount(f ? Math.round(f.currentCount * 0.8) : 100);
    setCrackedEggsCount(2);
    setAbnormalEggsCount(1);
    setPricePerCrate(f?.species === 'Duck' ? 550 : 380);
    setCratesSold(0);
    setCollectedBy('Peter Kibet');
    setCollectionTime('Morning');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (rec: PoultryEggRecord) => {
    setEditingRecord(rec);
    setFlockId(rec.flockId);
    setDate(rec.date);
    setGoodEggsCount(rec.goodEggsCount);
    setCrackedEggsCount(rec.crackedEggsCount || 0);
    setAbnormalEggsCount(rec.abnormalEggsCount || 0);
    setPricePerCrate(rec.pricePerCrate || 380);
    setCratesSold(rec.cratesSold || 0);
    setCollectedBy(rec.collectedBy || '');
    setCollectionTime(rec.collectionTime || 'Morning');
    setNotes(rec.notes || '');
    setShowModal(true);
  };

  // Unique months available in records
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthStr);
    eggRecords.forEach(r => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [eggRecords, currentMonthStr]);

  // Records for current selected month
  const monthRecords = useMemo(() => {
    return eggRecords
      .filter(r => r.date.startsWith(selectedMonth))
      .filter(r => selectedFlockFilter === 'All' || r.flockId === selectedFlockFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [eggRecords, selectedMonth, selectedFlockFilter]);

  // Monthly Aggregated Metrics
  const monthlyStats = useMemo(() => {
    let totalGood = 0;
    let totalCracked = 0;
    let totalAbnormal = 0;
    let totalEggs = 0;
    let totalCrates = 0;
    let layRateSum = 0;
    let layRateCount = 0;
    let estimatedRevenue = 0;

    monthRecords.forEach(r => {
      totalGood += r.goodEggsCount || 0;
      totalCracked += r.crackedEggsCount || 0;
      totalAbnormal += r.abnormalEggsCount || 0;
      totalEggs += r.totalEggs || (r.goodEggsCount + (r.crackedEggsCount || 0) + (r.abnormalEggsCount || 0));
      totalCrates += r.cratesCollected || 0;
      if (r.layRatePercentage && r.layRatePercentage > 0) {
        layRateSum += r.layRatePercentage;
        layRateCount += 1;
      }
      const cratePrice = r.pricePerCrate || 380;
      estimatedRevenue += (r.cratesCollected || 0) * cratePrice;
    });

    const avgLayRate = layRateCount > 0 ? layRateSum / layRateCount : 0;
    const crackPercent = totalEggs > 0 ? (totalCracked / totalEggs) * 100 : 0;

    return {
      totalGood,
      totalCracked,
      totalAbnormal,
      totalEggs,
      totalCrates,
      avgLayRate,
      crackPercent,
      estimatedRevenue,
      daysLogged: monthRecords.length
    };
  }, [monthRecords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selFlock = flocks.find(f => f.id === flockId);
    const flockName = selFlock ? selFlock.flockName : 'Poultry Flock';
    const species = selFlock ? selFlock.species : 'Chicken';
    const flockCount = selFlock ? selFlock.currentCount : 100;

    const total = Number(goodEggsCount) + Number(crackedEggsCount) + Number(abnormalEggsCount);
    const crates = Math.floor(total / 30);
    const remainder = total % 30;
    const layRate = flockCount > 0 ? Number(((goodEggsCount / flockCount) * 100).toFixed(1)) : 0;

    if (editingRecord) {
      const updated: PoultryEggRecord = {
        ...editingRecord,
        flockId,
        flockName,
        species,
        date,
        goodEggsCount: Number(goodEggsCount),
        crackedEggsCount: Number(crackedEggsCount),
        abnormalEggsCount: Number(abnormalEggsCount),
        totalEggs: total,
        cratesCollected: crates,
        cratesLooseRemainder: remainder,
        layingFlockBirdCount: flockCount,
        layRatePercentage: layRate,
        cratesSold: Number(cratesSold) || undefined,
        pricePerCrate: Number(pricePerCrate),
        collectedBy,
        collectionTime,
        notes
      };
      onUpdateEggRecord(editingRecord.id, updated);
    } else {
      const newRec: PoultryEggRecord = {
        id: `egg-${Date.now()}`,
        flockId,
        flockName,
        species,
        date,
        goodEggsCount: Number(goodEggsCount),
        crackedEggsCount: Number(crackedEggsCount),
        abnormalEggsCount: Number(abnormalEggsCount),
        totalEggs: total,
        cratesCollected: crates,
        cratesLooseRemainder: remainder,
        layingFlockBirdCount: flockCount,
        layRatePercentage: layRate,
        cratesSold: Number(cratesSold) || undefined,
        pricePerCrate: Number(pricePerCrate),
        collectedBy,
        collectionTime,
        notes
      };
      onAddEggRecord(newRec);
    }
    setShowModal(false);
  };

  const handleExportCsv = () => {
    let csv = 'Date,Flock Name,Species,Good Eggs,Cracked Eggs,Abnormal Eggs,Total Eggs,Crates Collected,Loose Eggs,Lay Rate %,Price Per Crate,Estimated Value Ksh,Collected By,Notes\n';
    monthRecords.forEach(r => {
      const val = (r.cratesCollected || 0) * (r.pricePerCrate || 380);
      csv += `"${r.date}","${r.flockName}","${r.species}",${r.goodEggsCount},${r.crackedEggsCount || 0},${r.abnormalEggsCount || 0},${r.totalEggs},${r.cratesCollected},${r.cratesLooseRemainder || 0},${r.layRatePercentage || 0},${r.pricePerCrate || 380},${val},"${r.collectedBy || ''}","${(r.notes || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JR_Farm_Egg_Production_${selectedMonth}.csv`;
    a.click();
  };

  // Month formatted nicely (e.g. October 2026)
  const formatMonthTitle = (mStr: string) => {
    const [yr, mo] = mStr.split('-');
    const dt = new Date(parseInt(yr), parseInt(mo) - 1, 1);
    return dt.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Month Selector & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/80 px-3 py-1.5 rounded-xl">
            <Calendar size={16} className="text-amber-700" />
            <span className="text-xs font-bold text-amber-900">Viewing Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 text-gray-900 cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthTitle(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Flock Filter:</span>
            <select
              value={selectedFlockFilter}
              onChange={(e) => setSelectedFlockFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white"
            >
              <option value="All">All Flocks (Chickens & Ducks)</option>
              {flocks.map(f => (
                <option key={f.id} value={f.id}>
                  {f.species === 'Duck' ? '🦆' : '🐔'} {f.flockName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={monthRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Export Monthly Egg Ledger to CSV"
          >
            <Download size={14} />
            Export Month CSV
          </button>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus size={15} />
            Log Daily Egg Harvest
          </button>
        </div>
      </div>

      {/* Monthly Aggregation Rollup Dashboard */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 p-6 rounded-3xl border border-amber-200/60 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-600 text-white">
                Monthly Aggregated Rollup
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {monthRecords.length} collection logs in {formatMonthTitle(selectedMonth)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              🥚 {formatMonthTitle(selectedMonth)} Egg Yield & Commercial Valuation
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Estimated Tray Value</span>
            <div className="text-xl font-bold font-mono text-emerald-800">
              KSh {monthlyStats.estimatedRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Monthly Eggs Harvested</span>
            <div className="text-2xl font-bold font-mono text-gray-900 mt-1">
              {monthlyStats.totalGood.toLocaleString()} <span className="text-xs font-normal text-gray-500">eggs</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Across all chicken & duck layer units
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Crates / Trays (30s)</span>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
              {monthlyStats.totalCrates} <span className="text-xs font-normal text-gray-500">crates</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Standard commercial 30-egg trays
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Average Hen-Day Lay Rate</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${monthlyStats.avgLayRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {monthlyStats.avgLayRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
              {monthlyStats.avgLayRate >= 80 ? (
                <span className="text-emerald-600 font-bold">✓ Exceeds 80% Commercial Target</span>
              ) : (
                <span className="text-amber-600 font-medium">Standard Target is 80%+</span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Cracked / Hairline Rejects</span>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
              {monthlyStats.totalCracked} <span className="text-xs font-normal text-gray-500">({monthlyStats.crackPercent.toFixed(1)}%)</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Safe reject threshold is &lt;2.5%
            </div>
          </div>
        </div>

        {/* Lay Rate Performance Progress Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-700">Flock Lay Efficiency Gauge vs Commercial Target</span>
            <span className="font-mono text-amber-800">{monthlyStats.avgLayRate.toFixed(1)}% / 85.0% Goal</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all ${
                monthlyStats.avgLayRate >= 80 ? 'bg-emerald-500' : monthlyStats.avgLayRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (monthlyStats.avgLayRate / 90) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Records Table for the Month */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <span>📅</span> Daily Egg Harvesting Log — {formatMonthTitle(selectedMonth)}
          </h4>
          <span className="text-xs text-gray-500 font-medium">
            {monthRecords.length} Daily Records Recorded
          </span>
        </div>

        {monthRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No egg records logged for {formatMonthTitle(selectedMonth)}. Click "Log Daily Egg Harvest" to add.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Flock / Species</th>
                  <th className="py-3 px-4 text-right">Good Eggs</th>
                  <th className="py-3 px-4 text-right">Cracked</th>
                  <th className="py-3 px-4 text-right">Crates (30s)</th>
                  <th className="py-3 px-4 text-right">Lay Rate %</th>
                  <th className="py-3 px-4 text-right">Tray Value</th>
                  <th className="py-3 px-4">Collector & Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthRecords.map((r) => {
                  const estVal = (r.cratesCollected || 0) * (r.pricePerCrate || 380);
                  const isDuck = r.species === 'Duck';

                  return (
                    <tr key={r.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-800 whitespace-nowrap">
                        {r.date}
                        {r.collectionTime && (
                          <span className="block text-[9.5px] text-gray-500 font-normal">{r.collectionTime}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          <span>{isDuck ? '🦆' : '🐔'}</span>
                          <span>{r.flockName}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {r.layingFlockBirdCount} birds in pen
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        {r.goodEggsCount}
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        {r.crackedEggsCount && r.crackedEggsCount > 0 ? (
                          <span className="text-rose-600 font-bold">{r.crackedEggsCount}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-900">
                        {r.cratesCollected} <span className="text-[10px] font-normal text-gray-500">crt</span>
                        {r.cratesLooseRemainder ? (
                          <span className="text-[10px] text-gray-500 font-normal"> + {r.cratesLooseRemainder}</span>
                        ) : null}
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          (r.layRatePercentage || 0) >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.layRatePercentage ? r.layRatePercentage.toFixed(1) : 0}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        KSh {estVal.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-[11px] max-w-[200px]">
                        <div className="text-gray-800 font-medium">{r.collectedBy}</div>
                        {r.notes && (
                          <div className="text-gray-500 italic truncate" title={r.notes}>
                            "{r.notes}"
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(r)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit Record"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete egg record for ${r.date} (${r.flockName})?`)) {
                                onDeleteEggRecord(r.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Daily Egg Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>🥚</span> {editingRecord ? 'Edit Daily Egg Record' : 'Record Daily Egg Production'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tracks table eggs, cracked units, crates (30s) and calculates Hen-Day lay percentage.
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
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Laying Flock *</label>
                  <select
                    required
                    value={flockId}
                    onChange={(e) => {
                      setFlockId(e.target.value);
                      const sel = flocks.find(f => f.id === e.target.value);
                      if (sel) {
                        setPricePerCrate(sel.species === 'Duck' ? 550 : 380);
                        setGoodEggsCount(Math.round(sel.currentCount * 0.82));
                      }
                    }}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    {flocks.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.species === 'Duck' ? '🦆' : '🐔'} {f.flockName} ({f.currentCount} birds, {f.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Collection Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Collection Shift</label>
                  <select
                    value={collectionTime}
                    onChange={(e) => setCollectionTime(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Morning">🌅 Morning Collection (Peak)</option>
                    <option value="Afternoon">🌇 Afternoon Collection</option>
                    <option value="Combined Daily Total">☀️ Combined Daily Total</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">Good / Market Eggs (Pieces) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={goodEggsCount}
                    onChange={(e) => setGoodEggsCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-emerald-300 rounded-xl font-mono bg-emerald-50/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">Cracked / Reject Eggs (Pieces)</label>
                  <input
                    type="number"
                    min="0"
                    value={crackedEggsCount}
                    onChange={(e) => setCrackedEggsCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-rose-200 rounded-xl font-mono bg-rose-50/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Soft / Abnormal Eggs</label>
                  <input
                    type="number"
                    min="0"
                    value={abnormalEggsCount}
                    onChange={(e) => setAbnormalEggsCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Price Per Crate (30s) KSh</label>
                  <input
                    type="number"
                    min="0"
                    value={pricePerCrate}
                    onChange={(e) => setPricePerCrate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Recorded / Collected By</label>
                  <input
                    type="text"
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    placeholder="Peter Kibet"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                {/* Calculation Summary Preview */}
                <div className="sm:col-span-2 bg-amber-50 p-3.5 rounded-2xl border border-amber-200/80 space-y-1 text-xs">
                  <div className="font-bold text-amber-950 flex items-center justify-between">
                    <span>Summary Preview:</span>
                    <span className="font-mono">
                      {Math.floor((Number(goodEggsCount) + Number(crackedEggsCount) + Number(abnormalEggsCount)) / 30)} Crates + {(Number(goodEggsCount) + Number(crackedEggsCount) + Number(abnormalEggsCount)) % 30} loose
                    </span>
                  </div>
                  <div className="text-gray-700">
                    Total Eggs: <strong>{Number(goodEggsCount) + Number(crackedEggsCount) + Number(abnormalEggsCount)}</strong> pieces • 
                    Estimated Value: <strong>KSh {(Math.floor((Number(goodEggsCount) + Number(crackedEggsCount) + Number(abnormalEggsCount)) / 30) * pricePerCrate).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Notes & Quality Remarks</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Clean shells, bright yolks, calcium grit supplied in water."
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  {editingRecord ? 'Save Changes' : 'Save Daily Egg Harvest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
