/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Truck, Scale, Sparkles, Check, Trash2, ClipboardCheck, Activity, Calendar } from 'lucide-react';

export function TmrMixing() {
  const [sorghum, setSorghum] = useState<number>(20);
  const [napier, setNapier] = useState<number>(15);
  const [rhodes, setRhodes] = useState<number>(3);
  const [dairyMeal, setDairyMeal] = useState<number>(4);
  const [cowsCount, setCowsCount] = useState<number>(12); // Dairy herd size scaling factor
  const [silageMoisture, setSilageMoisture] = useState<number>(65); // Standard silage moisture is 65% (35% DM)

  // Load steps checklist state
  const [loadedStep1, setLoadedStep1] = useState(false);
  const [loadedStep2, setLoadedStep2] = useState(false);
  const [loadedStep3, setLoadedStep3] = useState(false);
  const [loadedStep4, setLoadedStep4] = useState(false);

  // Mix logs state with localStorage persistence
  const [mixLogs, setMixLogs] = useState<{ id: string; date: string; cows: number; totalKg: number; moisture: number }[]>(() => {
    const saved = localStorage.getItem('jr_farm_tmr_mix_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'tmr-1', date: new Date().toISOString().split('T')[0], cows: 12, totalKg: 504, moisture: 65 }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('jr_farm_tmr_mix_logs', JSON.stringify(mixLogs));
  }, [mixLogs]);

  // Math with moisture tuning (Sorghum is scaled to maintain constant Dry Matter intake)
  // Standard DM = 35% (corresponding to 65% moisture).
  // If moisture rises, the fresh weight is increased to supply the exact same DM kilograms.
  const stdDM = 0.35;
  const currentDM = 1 - (silageMoisture / 100);
  const adjustedSorghum = currentDM > 0 ? (sorghum * stdDM) / currentDM : sorghum;

  const weightPerCow = adjustedSorghum + napier + rhodes + dairyMeal;
  const totalMixForHerd = weightPerCow * cowsCount;

  // Percentage distribution
  const getPercent = (val: number) => {
    if (weightPerCow === 0) return 0;
    return Math.round((val / weightPerCow) * 100);
  };

  const handleRecordBatch = () => {
    const newLog = {
      id: `tmr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      cows: cowsCount,
      totalKg: Math.round(totalMixForHerd),
      moisture: silageMoisture
    };
    setMixLogs([newLog, ...mixLogs]);
    
    // Reset loading milestones
    setLoadedStep1(false);
    setLoadedStep2(false);
    setLoadedStep3(false);
    setLoadedStep4(false);
  };

  const handleDeleteLog = (id: string) => {
    setMixLogs(mixLogs.filter(log => log.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl shrink-0">
          <Truck size={24} />
        </div>
        <div>
          <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">TMR Mixer Wagon Calculator</h4>
          <p className="text-xs text-slate-400 font-medium">
            Calculate Total Mixed Rations (TMR) to secure uniform lactation nutrition, adjust for forage dry matter, and prevent sorting by dairy cows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Diet Formulation Inputs */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-5 space-y-6">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Interactive Diet Parameters</h5>
            <p className="text-xs text-slate-400 mt-1 font-medium">Adjust weight variables in kilograms (fresh weight)</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sorghum Silage (Base Weight)</label>
                <span className="text-[11px] text-emerald-900 font-bold font-mono">{getPercent(adjustedSorghum)}% of mix</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={sorghum}
                onChange={(e) => setSorghum(parseFloat(e.target.value) || 0)}
                placeholder="KG"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* Moisture Compensator slider */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[10px] font-black uppercase text-amber-800">Silage Moisture Compensator</span>
                <span className="font-extrabold text-amber-900 font-mono text-[11px]">{silageMoisture}% Moisture</span>
              </div>
              <input
                type="range"
                min="45"
                max="85"
                value={silageMoisture}
                onChange={(e) => setSilageMoisture(Number(e.target.value))}
                className="w-full h-1 appearance-none bg-slate-200 rounded-lg cursor-pointer accent-amber-700"
              />
              <div className="flex justify-between text-[9px] text-amber-700 font-bold uppercase tracking-wide">
                <span>Standard (65%)</span>
                <span>Wet Rain (80%)</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed pt-1">
                Compensates for wet harvested silages. Adjusted Silage Fresh Weight per Cow: <strong className="text-slate-800 font-mono">{adjustedSorghum.toFixed(1)} KG</strong> (Original: {sorghum} KG) to preserve strict dry-matter targets.
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Fresh Napier / Kikuyu Grass</label>
                <span className="text-[11px] text-emerald-950 font-bold font-mono">{getPercent(napier)}% of mix</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={napier}
                onChange={(e) => setNapier(parseFloat(e.target.value) || 0)}
                placeholder="KG"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Rhodes Grass Hay</label>
                <span className="text-[11px] text-emerald-950 font-bold font-mono">{getPercent(rhodes)}% of mix</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={rhodes}
                onChange={(e) => setRhodes(parseFloat(e.target.value) || 0)}
                placeholder="KG"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dairy Meal Concentrate</label>
                <span className="text-[11px] text-emerald-950 font-bold font-mono">{getPercent(dairyMeal)}% of mix</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={dairyMeal}
                onChange={(e) => setDairyMeal(parseFloat(e.target.value) || 0)}
                placeholder="KG"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* Scale multiplier (Herd Size) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block mb-1">Active Milking Herd Size</label>
              <input
                type="number"
                min="1"
                required
                value={cowsCount}
                onChange={(e) => setCowsCount(parseInt(e.target.value) || 1)}
                placeholder="Number of Cows"
                className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-mono font-bold bg-emerald-50/20 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Used to scale batch mixing instructions.</span>
            </div>
          </div>
        </div>

        {/* Diagnostic mixing visualization */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Main classic double border container */}
          <div className="bg-white p-10 border-8 border-double border-emerald-900/60 rounded-[40px] shadow-sm text-center flex flex-col justify-center items-center space-y-6 min-h-[300px]">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adjusted TMR Feed Weight</p>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">
                Per Cow / Day (Fresh Basis)
              </span>
            </div>
            <div>
              <h1 className="text-8xl font-black text-slate-800 font-mono tracking-tighter leading-none">
                {weightPerCow.toFixed(1)} <span className="text-xl font-bold text-slate-500 uppercase font-mono">KG</span>
              </h1>
            </div>

            {/* Total mixer load scale display */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full max-w-sm flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mixer Target ({cowsCount} Cows)</span>
                <h3 className="text-2xl font-black font-mono text-emerald-950 mt-1">
                  {totalMixForHerd.toFixed(1)} KG
                </h3>
              </div>
              <button
                onClick={handleRecordBatch}
                className="bg-emerald-950 text-white rounded-xl text-xs font-black uppercase px-4 py-3 hover:bg-emerald-900 transition-all cursor-pointer m-0 border-none"
              >
                Log Mixer Run
              </button>
            </div>
          </div>

          {/* Quick loading recipes lists */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md border-t border-emerald-800 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                <Scale size={14} /> Wagon Loading Sequence (Adjusted)
              </h5>
              <span className="text-[10px] text-green-300 font-extrabold">Tap ingredients as they enter the mixer bucket:</span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setLoadedStep1(!loadedStep1)}
                className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
                  loadedStep1 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-800 text-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">1. Silage</span>
                  {loadedStep1 && <Check size={12} className="text-yellow-400" />}
                </div>
                <span className="text-lg font-black font-mono block">{(adjustedSorghum * cowsCount).toFixed(0)} KG</span>
                <span className={`text-[9px] block mt-1 ${loadedStep1 ? 'text-green-300' : 'text-slate-300'}`}>
                  {loadedStep1 ? '✓ Loaded' : 'Sorghum base'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoadedStep2(!loadedStep2)}
                className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
                  loadedStep2 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-800 text-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">2. Napier</span>
                  {loadedStep2 && <Check size={12} className="text-yellow-400" />}
                </div>
                <span className="text-lg font-black font-mono block">{(napier * cowsCount).toFixed(0)} KG</span>
                <span className={`text-[9px] block mt-1 ${loadedStep2 ? 'text-green-300' : 'text-slate-300'}`}>
                  {loadedStep2 ? '✓ Loaded' : 'For moisture'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoadedStep3(!loadedStep3)}
                className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
                  loadedStep3 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-800 text-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">3. Rhodes Hay</span>
                  {loadedStep3 && <Check size={12} className="text-yellow-400" />}
                </div>
                <span className="text-lg font-black font-mono block">{(rhodes * cowsCount).toFixed(0)} KG</span>
                <span className={`text-[9px] block mt-1 ${loadedStep3 ? 'text-green-300' : 'text-slate-300'}`}>
                  {loadedStep3 ? '✓ Loaded' : 'Scratch factor'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoadedStep4(!loadedStep4)}
                className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
                  loadedStep4 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-800 text-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">4. Dairy Meal</span>
                  {loadedStep4 && <Check size={12} className="text-yellow-400" />}
                </div>
                <span className="text-lg font-black font-mono block">{(dairyMeal * cowsCount).toFixed(0)} KG</span>
                <span className={`text-[9px] block mt-1 ${loadedStep4 ? 'text-green-300' : 'text-slate-300'}`}>
                  {loadedStep4 ? '✓ Loaded' : 'Concentrate'}
                </span>
              </button>
            </div>
            
            {loadedStep1 && loadedStep2 && loadedStep3 && loadedStep4 && (
              <div className="bg-emerald-850 p-3 rounded-xl border border-green-500/50 flex items-center gap-2.5 animate-bounce mt-3">
                <span className="text-sm">🎉</span>
                <p className="text-[10px] font-extrabold text-green-300 uppercase tracking-wider">Wagon Load Completed and Audited. Discharging into troughs now.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Mix Logs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-slate-100">
          <ClipboardCheck size={18} className="text-emerald-700" />
          <h5 className="text-xs font-black uppercase tracking-wider">Mixer Run Operations Log</h5>
        </div>

        {mixLogs.length === 0 ? (
          <p className="text-center text-slate-450 text-xs italic py-6">No historical runs recorded today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400">
                  <th className="py-3">Date</th>
                  <th className="py-3">Milking Herd size</th>
                  <th className="py-3">silage moisture</th>
                  <th className="py-3 text-right">total wagon load weight</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {mixLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 flex items-center gap-2">
                      <Calendar size={12} className="text-slate-400 font-mono" />
                      <span className="font-mono font-bold text-slate-700">{log.date}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-700 font-black">{log.cows} Head</td>
                    <td className="py-3">
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                        {log.moisture}% moisture
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-black text-emerald-950 text-sm">
                      {log.totalKg.toLocaleString()} KG
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-slate-350 hover:text-red-600 p-1 rounded transition-colors cursor-pointer m-0 inline-block align-middle"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
