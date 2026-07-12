/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SprayRecord } from '../types';
import { FlaskConical, AlertTriangle, ShieldCheck, CalendarCheck, Clock, ShieldAlert, Plus, Sparkles, Trash2, Edit2, FileSpreadsheet, Printer, Download } from 'lucide-react';

interface SprayLogProps {
  sprayRecords: SprayRecord[];
  onAddSpray: (rec: SprayRecord) => void;
  onDeleteSpray: (id: string) => void;
  onEditSprayRecord?: (id: string, updated: SprayRecord) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function SprayLog({ sprayRecords, onAddSpray, onDeleteSpray, onEditSprayRecord, onTriggerSectionReport }: SprayLogProps) {
  const [block, setBlock] = useState('');
  const [chemical, setChemical] = useState('');
  const [phi, setPhi] = useState<number | ''>('');
  const [target, setTarget] = useState('');
  const [sprayDate, setSprayDate] = useState(new Date().toISOString().split('T')[0]);

  // Next spray date scheduling
  const [intervalDays, setIntervalDays] = useState<number | ''>(14);
  const [nextSprayDate, setNextSprayDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Editing state
  const [editingSpray, setEditingSpray] = useState<SprayRecord | null>(null);

  const handleSprayDateChange = (val: string) => {
    setSprayDate(val);
    if (typeof intervalDays === 'number' && val) {
      const base = new Date(val);
      base.setDate(base.getDate() + intervalDays);
      setNextSprayDate(base.toISOString().split('T')[0]);
    }
  };

  const handleIntervalDaysChange = (val: number | '') => {
    setIntervalDays(val);
    if (typeof val === 'number' && sprayDate) {
      const base = new Date(sprayDate);
      base.setDate(base.getDate() + val);
      setNextSprayDate(base.toISOString().split('T')[0]);
    }
  };

  const handleNextSprayDateChange = (val: string) => {
    setNextSprayDate(val);
    if (sprayDate && val) {
      const t1 = new Date(sprayDate).getTime();
      const t2 = new Date(val).getTime();
      const diffTime = t2 - t1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIntervalDays(diffDays >= 0 ? diffDays : 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!block.trim() || !chemical.trim() || phi === '' || !target.trim() || !sprayDate) return;

    const baseDate = new Date(sprayDate);
    const safeDateObj = new Date(baseDate);
    safeDateObj.setDate(safeDateObj.getDate() + Number(phi));

    onAddSpray({
      id: `sp-${Date.now()}`,
      block: block.trim(),
      chemical: chemical.trim(),
      phi: Number(phi),
      target: target.trim(),
      date: sprayDate,
      safeDate: safeDateObj.toISOString().split('T')[0],
      nextSprayDate: nextSprayDate || undefined,
      intervalDays: typeof intervalDays === 'number' ? intervalDays : undefined
    });

    setBlock('');
    setChemical('');
    setPhi('');
    setTarget('');
    
    const todayStr = new Date().toISOString().split('T')[0];
    setSprayDate(todayStr);
    setIntervalDays(14);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    setNextSprayDate(futureDate.toISOString().split('T')[0]);
  };

  const getQuarantineStatus = (safeDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const safeDate = new Date(safeDateStr);
    safeDate.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil((safeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isQuarantined: daysLeft > 0,
      daysRemaining: daysLeft
    };
  };

  const downloadSprayCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'GLOBALGAP SPRAY COMPLIANCE PROTOCOLS & LOGS\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date Sprayed,Plot/Section,Chemical Brand,PHI Days,Pest Target,Authorized Harvest Date,Next Spray Date,Repeat Interval Days\n';
    sprayRecords.forEach((s) => {
      csv += `${s.date},"${s.block}","${s.chemical}",${s.phi},"${s.target}",${s.safeDate},"${s.nextSprayDate || ''}",${s.intervalDays ?? ''}\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GlobalGAP_Spray_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Introduction banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-950 rounded-xl shrink-0">
          <FlaskConical size={24} className="text-red-800" />
        </div>
        <div>
          <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">GlobalGAP Spray Compliance Register</h4>
          <p className="text-xs text-slate-400 font-medium">
            Document crop chemical controls. Under strict GlobalGAP export criteria, crops must NEVER be plucked before their Pre-Harvest Intervals (PHI) clear.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spray Event Logger */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 lg:col-span-1 h-fit">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-red-900 uppercase">Document Spray Treatment</h5>
            <p className="text-xs text-slate-400 mt-1 font-medium">Log active block fungicide/pesticide sprays</p>
          </div>

          {/* Quick IPM & Pest Solution Presets */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-2">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500 animate-pulse" />
              Quick IPM Presets (Pest Control)
            </span>
            <p className="text-[10px] text-slate-500 leading-tight">Click to instant-populate standard GlobalGAP treatment guidelines:</p>
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { label: '🥑 Avocado: Fruit Fly', block: 'Avocado Block B', chemical: 'Methyl Eugenol Pheromone Trap', phi: 0, target: 'Bactrocera dorsalis Fruit Fly' },
                { label: '🌱 Tea: Red Mites', block: 'Tea Sector South', chemical: 'Wettable Sulphur formulation', phi: 3, target: 'Oligonychus coffeae Red Mites' },
                { label: '🌽 Maize: Armyworm', block: 'Maize Block Flat-B', chemical: 'Pyrethrum-based Organic Bio-Spray', phi: 7, target: 'Spodoptera frugiperda Armyworm' },
                { label: '🌾 Rhodes: Rust', block: 'Meadow Flat Block C', chemical: 'Copper Oxychloride (Copper Fungicide)', phi: 14, target: 'Puccinia graminis leaf rust' },
                { label: '🍅 Vegetables: Whitefly', block: 'Greenhouse Section A', chemical: 'Acetamiprid Whitefly blocker', phi: 7, target: 'Bemisia tabaci whiteflies' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBlock(p.block);
                    setChemical(p.chemical);
                    setPhi(p.phi);
                    setTarget(p.target);
                    // Trigger next date calculations
                    const baseDate = new Date(sprayDate);
                    const safeDateObj = new Date(baseDate);
                    safeDateObj.setDate(safeDateObj.getDate() + p.phi);
                    if (typeof intervalDays === 'number') {
                      const nextObj = new Date(baseDate);
                      nextObj.setDate(nextObj.getDate() + intervalDays);
                      setNextSprayDate(nextObj.toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full text-left bg-white hover:bg-slate-100 p-2 rounded-xl border border-slate-200/80 hover:border-slate-350 text-[11px] font-bold text-slate-700 transition-all flex justify-between items-center cursor-pointer m-0"
                >
                  <span className="truncate">{p.label}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">PHI {p.phi}d</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Target Treatment Block</label>
              <input
                type="text"
                required
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="E.g. Avocado Block C"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Chemical/Brand Used</label>
              <input
                type="text"
                required
                value={chemical}
                onChange={(e) => setChemical(e.target.value)}
                placeholder="E.g. Copper Oxychloride"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Sprayed Execution Date</label>
              <input
                type="date"
                required
                value={sprayDate}
                onChange={(e) => handleSprayDateChange(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">PHI Interval (Days)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={phi}
                  onChange={(e) => setPhi(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="E.g. 7"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Target Pest / Disease</label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="E.g. Rust / Thrips"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                />
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4 space-y-3">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">📅 Next Treatment Schedule</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider block mb-1">Interval Days</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={intervalDays}
                    onChange={(e) => handleIntervalDaysChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="E.g. 14"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider block mb-1">Next Spray Date</label>
                  <input
                    type="date"
                    value={nextSprayDate}
                    onChange={(e) => handleNextSprayDateChange(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-950 hover:bg-red-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
            >
              Sign off Spray Incident
            </button>
          </form>
        </div>

        {/* Quarantine Active Monitors & Archive Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h5 className="text-[11px] font-black tracking-widest text-slate-805 uppercase">Active Quarantine Controls & Safe Dates</h5>
                <p className="text-xs text-slate-400 font-medium">Real-time Safety Checkpoints for Plucking Managers</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadSprayCSV}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 rounded-xl font-black text-[10px] uppercase transition-all shadow-xs cursor-pointer m-0"
                  title="Download Spray Records CSV"
                >
                  <FileSpreadsheet size={12} />
                  Export CSV
                </button>
                {onTriggerSectionReport && (
                  <button
                    onClick={() => onTriggerSectionReport('spray')}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-[10px] uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                    title="Download Spray PDF Report"
                  >
                    <Download size={12} />
                    Download PDF Report
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {sprayRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">No spray intervals registered in the system index.</p>
              ) : (
                [...sprayRecords].reverse().map((rec) => {
                  const qStatus = getQuarantineStatus(rec.safeDate);

                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        qStatus.isQuarantined
                          ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-sm'
                          : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs text-slate-850 uppercase tracking-wider">
                              {rec.block}
                            </span>
                            <span className={`text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full border ${
                              qStatus.isQuarantined
                                ? 'bg-red-100 border-red-200 text-red-800'
                                : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                            }`}>
                              {qStatus.isQuarantined ? '❌ QUARANTINED' : '✅ cleared for picking'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            Chemical: <span className="font-extrabold text-slate-700">{rec.chemical}</span> • Target: {rec.target}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                              <Clock size={12} className="text-slate-450" />
                              <span>Sprayed: {rec.date} • Pre-Harvest Interval (PHI): {rec.phi} days</span>
                            </div>
                            {(() => {
                              const daysRemaining = Math.max(0, Math.ceil((new Date(rec.safeDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)));
                              if (daysRemaining > 0) {
                                return (
                                  <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full font-black font-mono animate-pulse">
                                    PHI Withholding: {daysRemaining} days left
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[10px] bg-emerald-105 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-black font-mono">
                                  Withholding Expired
                                </span>
                              );
                            })()}
                          </div>
 
                          {(() => {
                            const name = rec.chemical.toLowerCase();
                            let tox = { label: 'WHO Class II: Moderately Hazardous', color: 'text-amber-700 bg-amber-50 border-amber-200' };
                            if (name.includes('dimethoate') || name.includes('carbofuran') || name.includes('methomyl') || name.includes('ddvp')) {
                              tox = { label: 'WHO Class Ib: Highly Hazardous', color: 'text-red-705 bg-red-50 border-red-200' };
                            } else if (name.includes('copper') || name.includes('sulphur') || name.includes('mancozeb') || name.includes('neem')) {
                              tox = { label: 'WHO Class III: Slightly Hazardous', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
                            }
                            return (
                              <div className={`mt-2 px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-wide inline-block ${tox.color}`}>
                                {tox.label} • PPE Required
                              </div>
                            );
                          })()}

                          <div className="flex items-center gap-4 mt-2 bg-[#ffffff]/60 p-2 rounded-xl border border-slate-100/80 max-w-sm">
                            <div>
                              <span className="text-[8px] uppercase font-black text-slate-400 block tracking-wider leading-none">
                                Interval
                              </span>
                              <span className="text-[11px] font-black text-slate-700 block mt-0.5">
                                {rec.intervalDays ?? 14} Days
                              </span>
                            </div>
                            <div className="border-l border-slate-200 pl-3">
                              <span className="text-[8px] uppercase font-black text-slate-400 block tracking-wider leading-none">
                                Next Spraying Date
                              </span>
                              <span className="text-[11px] font-black text-slate-800 block mt-0.5 font-mono">
                                {rec.nextSprayDate ? new Date(rec.nextSprayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-left sm:text-right shrink-0">
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider leading-none">
                              Authorized Plucking Date
                            </span>
                            <span className={`text-sm font-black font-mono block mt-1.5 ${
                              qStatus.isQuarantined ? 'text-red-700' : 'text-emerald-800'
                            }`}>
                              {new Date(rec.safeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {qStatus.isQuarantined && (
                              <span className="text-[9px] font-extrabold text-red-600 block mt-1 uppercase italic bg-red-100/50 px-2 py-0.5 rounded-md inline-block">
                                {qStatus.daysRemaining} days remaining quarantine
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {onEditSprayRecord && (
                              <button
                                type="button"
                                onClick={() => setEditingSpray(rec)}
                                className="text-slate-300 hover:text-indigo-805 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-indigo-100 bg-white shadow-xs shrink-0"
                                title="Edit spray record"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteSpray(rec.id)}
                              className="text-slate-300 hover:text-red-650 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-red-100 bg-white shadow-xs shrink-0"
                              title="Delete spray history"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Spray Record Modal */}
      {editingSpray && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Spray Log</h3>
              <button onClick={() => setEditingSpray(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block / Unit Targeted</label>
                <input
                  type="text"
                  value={editingSpray.block}
                  onChange={(e) => setEditingSpray({ ...editingSpray, block: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Chemical Applied</label>
                <input
                  type="text"
                  value={editingSpray.chemical}
                  onChange={(e) => setEditingSpray({ ...editingSpray, chemical: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Pest / Disease</label>
                <input
                  type="text"
                  value={editingSpray.target}
                  onChange={(e) => setEditingSpray({ ...editingSpray, target: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">PHI (Days)</label>
                  <input
                    type="number"
                    value={editingSpray.phi}
                    onChange={(e) => {
                      const phiVal = parseInt(e.target.value) || 0;
                      const dateObj = new Date(editingSpray.date);
                      dateObj.setDate(dateObj.getDate() + phiVal);
                      setEditingSpray({
                        ...editingSpray,
                        phi: phiVal,
                        safeDate: dateObj.toISOString().split('T')[0]
                      });
                    }}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sprayed Date</label>
                  <input
                    type="date"
                    value={editingSpray.date}
                    onChange={(e) => {
                      const sDate = e.target.value;
                      const dateObj = new Date(sDate);
                      dateObj.setDate(dateObj.getDate() + editingSpray.phi);
                      
                      const repeatDays = editingSpray.intervalDays ?? 14;
                      const nextObj = new Date(sDate);
                      nextObj.setDate(nextObj.getDate() + repeatDays);

                      setEditingSpray({
                        ...editingSpray,
                        date: sDate,
                        safeDate: dateObj.toISOString().split('T')[0],
                        nextSprayDate: nextObj.toISOString().split('T')[0]
                      });
                    }}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-dashed border-slate-200 pt-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Interval Days</label>
                  <input
                    type="number"
                    value={editingSpray.intervalDays ?? 14}
                    onChange={(e) => {
                      const repeatDays = parseInt(e.target.value) || 0;
                      const baseDate = new Date(editingSpray.date);
                      baseDate.setDate(baseDate.getDate() + repeatDays);
                      setEditingSpray({
                        ...editingSpray,
                        intervalDays: repeatDays,
                        nextSprayDate: baseDate.toISOString().split('T')[0]
                      });
                    }}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Next Spray Date</label>
                  <input
                    type="date"
                    value={editingSpray.nextSprayDate || ''}
                    onChange={(e) => {
                      const nSprayDate = e.target.value;
                      const t1 = new Date(editingSpray.date).getTime();
                      const t2 = new Date(nSprayDate).getTime();
                      const diffDays = Math.ceil((t2 - t1) / (1000 * 60 * 60 * 24));
                      setEditingSpray({
                        ...editingSpray,
                        nextSprayDate: nSprayDate,
                        intervalDays: diffDays >= 0 ? diffDays : 0
                      });
                    }}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingSpray(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditSprayRecord) {
                    onEditSprayRecord(editingSpray.id, editingSpray);
                  }
                  setEditingSpray(null);
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
