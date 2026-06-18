/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SprayRecord } from '../types';
import { FlaskConical, AlertTriangle, ShieldCheck, CalendarCheck, Clock, ShieldAlert, Plus, Sparkles, Trash2 } from 'lucide-react';

interface SprayLogProps {
  sprayRecords: SprayRecord[];
  onAddSpray: (rec: SprayRecord) => void;
  onDeleteSpray: (id: string) => void;
}

export function SprayLog({ sprayRecords, onAddSpray, onDeleteSpray }: SprayLogProps) {
  const [block, setBlock] = useState('');
  const [chemical, setChemical] = useState('');
  const [phi, setPhi] = useState<number | ''>('');
  const [target, setTarget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!block.trim() || !chemical.trim() || phi === '' || !target.trim()) return;

    const todayObj = new Date();
    const safeDateObj = new Date(todayObj);
    safeDateObj.setDate(safeDateObj.getDate() + Number(phi));

    onAddSpray({
      id: `sp-${Date.now()}`,
      block: block.trim(),
      chemical: chemical.trim(),
      phi: Number(phi),
      target: target.trim(),
      date: todayObj.toISOString().split('T')[0],
      safeDate: safeDateObj.toISOString().split('T')[0]
    });

    setBlock('');
    setChemical('');
    setPhi('');
    setTarget('');
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
            <h5 className="text-[11px] font-black tracking-widest text-slate-805 uppercase">Active Quarantine Controls & Safe Dates</h5>
            <p className="text-xs text-slate-400 font-medium">Real-time Safety Checkpoints for Plucking Managers</p>

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
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <Clock size={12} className="text-slate-450" />
                            <span>Sprayed: {rec.date} • Pre-Harvest Interval (PHI): {rec.phi} days</span>
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

                          <button
                            type="button"
                            onClick={() => onDeleteSpray(rec.id)}
                            className="text-slate-300 hover:text-red-600 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-red-100 bg-white shadow-xs shrink-0"
                            title="Delete spray history"
                          >
                            <Trash2 size={13} />
                          </button>
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
    </div>
  );
}
