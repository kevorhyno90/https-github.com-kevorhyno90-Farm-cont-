/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Coins,
  Activity,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Calendar,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MilkingRecord, Todo, StaffOffRecord, StaffMember } from '../types';
import { CalendarIcon, Bell, Users, Eye } from 'lucide-react';

interface DashboardProps {
  milkRecords: MilkingRecord[];
  netPl: number;
  activeAlarmsCount: number;
  upcomingDueAlarm: string;
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, assigneeName?: string) => void;
  onDeleteTodo: (id: string) => void;
  totalTeaQty: number;
  staffOffRecords: StaffOffRecord[];
  staffList: StaffMember[];
}

export function Dashboard({
  milkRecords,
  netPl,
  activeAlarmsCount,
  upcomingDueAlarm,
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  totalTeaQty,
  staffOffRecords = [],
  staffList = []
}: DashboardProps) {
  const [newTodo, setNewTodo] = useState('');
  const [todoAssignee, setTodoAssignee] = useState('');
  const [weatherCondition, setWeatherCondition] = useState<'sunny' | 'rainy' | 'dry-cold'>('sunny');
  const [soilMoisture, setSoilMoisture] = useState<number>(42);

  // Calculate today's milking liters
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLiters = milkRecords
    .filter((r) => r.date === todayStr)
    .reduce((sum, r) => sum + r.am + r.pm, 0);

  // Group milk production by date for the Recharts chart (last 7 entries)
  const groupedMilk = milkRecords.reduce((acc: { [key: string]: { am: number; pm: number; total: number } }, r) => {
    if (!acc[r.date]) {
      acc[r.date] = { am: 0, pm: 0, total: 0 };
    }
    acc[r.date].am += r.am;
    acc[r.date].pm += r.pm;
    acc[r.date].total += r.am + r.pm;
    return acc;
  }, {});

  const chartData = Object.entries(groupedMilk)
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      AM: parseFloat(data.am.toFixed(1)),
      PM: parseFloat(data.pm.toFixed(1)),
      Total: parseFloat(data.total.toFixed(1)),
      rawDate: date
    }))
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .slice(-7); // Keep last 7 days

  const handleSubmitTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    onAddTodo(newTodo.trim(), todoAssignee || undefined);
    setNewTodo('');
    setTodoAssignee('');
  };

  return (
    <div className="space-y-8">
      {/* ESTATE BRANDED GREETING METADATA BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0e3020] border border-emerald-900/40 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-left">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl -z-0 pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full font-mono">
              🛡️ Sovereign Compliance Registered
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
              GlobalGAP Plot: KT-205A
            </span>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase">
              JR Farm Omni-Estate
            </h1>
            <p className="text-slate-250 text-slate-350 text-slate-300 font-medium text-xs md:text-sm leading-relaxed">
              Comprehensive estate, livestock, and crop export management platform for JR Farm, including feed formulation, dairy ledger, GlobalGAP spray logs, and financials.
            </p>
          </div>

          {/* Core high-level metadata telemetry status bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-emerald-800/40 max-w-3xl text-left">
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-405 text-emerald-400 block tracking-wide mt-1">Management Core</span>
              <span className="text-xs font-black text-white font-mono block mt-1">Sovereign Active</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-405 text-emerald-400 block tracking-wide mt-1">Audit Compliance</span>
              <span className="text-xs font-black text-emerald-300 font-mono block mt-1">100% Certified</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-405 text-emerald-400 block tracking-wide mt-1">Traceback Records</span>
              <span className="text-xs font-black text-yellow-500 font-mono block mt-1">Blockchain Latch</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-405 text-emerald-400 block tracking-wide mt-1">System Node</span>
              <span className="text-xs font-black text-white font-mono block mt-1">Online & Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-40"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Milk Yield (Today)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2 font-mono">{todayLiters.toFixed(1)} L</h3>
              <p className="text-xs text-emerald-600 font-bold mt-2">Active dairy herd log</p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 opacity-40"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tea Weights (Harvest)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2 font-mono">{totalTeaQty.toLocaleString()} KG</h3>
              <p className="text-xs text-purple-600 font-bold mt-2">KTDA delivery aggregate</p>
            </div>
            <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
              <Leaf size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-30"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Cash Balance</p>
              <h3 className={`text-2xl font-black mt-2 font-mono ${netPl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Ksh {netPl.toLocaleString()}
              </h3>
              <p className="text-xs text-amber-600 font-bold mt-2">Overall P&L account</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <Coins size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-40"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calving Alarm</p>
              <h3 className="text-[14px] font-black text-rose-800 mt-3 truncate max-w-[160px]" title={upcomingDueAlarm}>
                {upcomingDueAlarm}
              </h3>
              <p className="text-xs text-rose-600 font-bold mt-2">
                {activeAlarmsCount} pending breed cycles
              </p>
            </div>
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 🧑‍🌾 Staff Attendance & Leave Alerts Reminders */}
      {(() => {
        const todayString = new Date().toISOString().split('T')[0];

        const getDayOffsetString = (offset: number) => {
          const d = new Date();
          d.setDate(d.getDate() + offset);
          return d.toISOString().split('T')[0];
        };

        const activeOffsToday = staffOffRecords.filter(r => {
          return r.status === 'Approved' && r.startDate <= todayString && todayString <= r.endDate;
        });

        const upcomingOffs = staffOffRecords.filter(r => {
          return r.status === 'Approved' && r.startDate > todayString && r.startDate <= getDayOffsetString(3);
        });

        // Calculate and check conflicts in the next 5 days
        const conflicts: string[] = [];
        const units = ['Dairy', 'Horti', 'Fields', 'Security'];

        for (let offset = 0; offset <= 5; offset++) {
          const checkDate = getDayOffsetString(offset);
          const dateFormatted = new Date(checkDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          units.forEach(unit => {
            const unitStaffIds = staffList.filter(s => s.unit === unit).map(s => s.id);
            const activeOffUnit = staffOffRecords.filter(r => {
              return r.status === 'Approved' && 
                     r.startDate <= checkDate && 
                     checkDate <= r.endDate && 
                     unitStaffIds.includes(r.staffId);
            });

            if (activeOffUnit.length > 1) {
              const names = activeOffUnit.map(r => r.staffName).join(' & ');
              conflicts.push(`Multiple ${unit} officers (${names}) are schedule-off on ${dateFormatted}! Unit coverage vulnerable.`);
            }
          });
        }

        return (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden transition-all hover:shadow-indigo-950/20">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500 rounded-bl-full opacity-5 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-indigo-900/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/15 text-indigo-300 rounded-xl border border-indigo-500/25">
                  <Bell size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200">Workforce Duty & Leave Alert Center</h4>
                  <p className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-widest mt-1 leading-none">Smart coverage guards & real-time team availability</p>
                </div>
              </div>
              <div className="text-[10px] font-mono text-indigo-200 bg-indigo-900/40 px-3 py-1.5 rounded-lg border border-indigo-900/60 font-black">
                SYSTEM CALENDAR: {todayString}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Currently Off Today */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Off-Duty Today ({activeOffsToday.length})</span>
                </div>
                {activeOffsToday.length === 0 ? (
                  <p className="text-[11px] text-slate-450 font-bold italic py-2">✓ Entire farm workforce is active and report on-field.</p>
                ) : (
                  <div className="space-y-2">
                    {activeOffsToday.map((r) => {
                      const sMatch = staffList.find(s => s.id === r.staffId);
                      return (
                        <div key={r.id} className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-xs text-white block">{r.staffName}</span>
                              <span className="text-[9px] uppercase font-black bg-rose-500/10 text-rose-300 px-1.5 py-0.2 rounded font-mono block mt-1 w-max">
                                {r.type}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase font-black bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                              {sMatch?.unit || 'Unit'}
                            </span>
                          </div>
                          {r.notes && (
                            <p className="text-[10px] text-slate-400 mt-1.5 border-t border-red-950/20 pt-1 italic">
                              "{r.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Col 2: Upcoming Off/Leaves */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Scheduled Leaves ({upcomingOffs.length})</span>
                </div>
                {upcomingOffs.length === 0 ? (
                  <p className="text-[11px] text-slate-450 font-bold italic py-2">No departures planned in next 3 days.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingOffs.map((r) => {
                      const sMatch = staffList.find(s => s.id === r.staffId);
                      return (
                        <div key={r.id} className="p-3 bg-amber-950/30 border border-amber-900/30 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-xs text-white block">{r.staffName}</span>
                              <span className="text-[9px] uppercase font-black bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded font-mono block mt-1 w-max">
                                {r.type}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase font-black bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                              {sMatch?.unit || 'Unit'}
                            </span>
                          </div>
                          <p className="text-[9px] text-amber-200 mt-2 font-mono font-bold uppercase tracking-wider">
                            Starts: {r.startDate}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Col 3: Coverage safeties & conflicts */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Labor Overlap Security ({conflicts.length})</span>
                </div>
                {conflicts.length === 0 ? (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-[11px] text-emerald-300 font-bold leading-relaxed">
                    ✓ Optimal workforce redundancy intact. Overlap protection validated.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[12rem] overflow-y-auto pr-1">
                    {conflicts.map((msg, idx) => (
                      <div key={idx} className="p-3 bg-red-950/40 border border-red-920 rounded-xl text-[10px] text-red-200 font-bold leading-normal flex gap-2">
                        <span className="text-red-400 font-black shrink-0 font-mono">!</span>
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recharts production trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">7-Day Milk Production Trend</h4>
              <p className="text-xs text-slate-400 font-medium">Morning (AM) vs Afternoon (PM) yield</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                No milking records compiled yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e5631" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1e5631" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <Area type="monotone" dataKey="Total" stroke="#1e5631" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Liter" />
                  <Line type="monotone" dataKey="AM" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} name="AM (L)" />
                  <Line type="monotone" dataKey="PM" stroke="#a855f7" strokeWidth={1.5} dot={{ r: 3 }} name="PM (L)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Strategic Tasks */}
        <div className="bg-white p-8 rounded-3xl border border-slate-105 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Strategic Task Assignment</h4>
              <p className="text-xs text-slate-400 font-medium">Link operations directly to key officers</p>
            </div>

            <form onSubmit={handleSubmitTodo} className="space-y-3 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="E.g. Clear pasture sector D..."
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-slate-700 font-medium"
              />
              <div className="flex gap-2">
                <select
                  value={todoAssignee}
                  onChange={(e) => setTodoAssignee(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 font-semibold cursor-pointer"
                >
                  <option value="">-- Assign Operator (Optional) --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.unit})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-emerald-950 text-white rounded-xl px-5 py-2 flex items-center justify-center hover:bg-emerald-800 active:scale-95 transition-all shadow-sm font-black text-xs uppercase cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">All tasks completed successfully!</p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-3 rounded-xl border border-slate-100/80 transition-all ${
                      todo.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white hover:border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className="flex items-start gap-3 flex-1 text-left"
                    >
                      <span className="mt-0.5 text-emerald-800 shrink-0">
                        {todo.completed ? (
                          <CheckSquare size={16} className="fill-emerald-100" />
                        ) : (
                          <Square size={16} />
                        )}
                      </span>
                      <div>
                        <span
                          className={`text-xs text-slate-700 font-medium leading-relaxed ${
                            todo.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {todo.text}
                        </span>
                        {todo.assigneeName && (
                          <span className={`inline-block ml-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                            todo.completed ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-850 border border-emerald-100'
                          }`}>
                            👤 {todo.assigneeName}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="text-slate-300 hover:text-red-600 p-1 rounded-lg transition-colors shrink-0 m-0 cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Climate & Soil Advisory Simulator Panel */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Nyaronde, Nyamira County Weather & Agro-Advisory Simulator</h4>
            <p className="text-xs text-slate-400 font-medium">Contextual farming intelligence based on micro-climates & ambient factors</p>
          </div>
          {/* Controllers */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-black text-slate-500 mr-2">Simulate weather:</span>
            <button
              onClick={() => { setWeatherCondition('sunny'); setSoilMoisture(42); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all m-0 border cursor-pointer ${
                weatherCondition === 'sunny'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              ☀ Sunny Dry
            </button>
            <button
              onClick={() => { setWeatherCondition('rainy'); setSoilMoisture(85); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all m-0 border cursor-pointer ${
                weatherCondition === 'rainy'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              ☂ Rainy Wet
            </button>
            <button
              onClick={() => { setWeatherCondition('dry-cold'); setSoilMoisture(21); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all m-0 border cursor-pointer ${
                weatherCondition === 'dry-cold'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              ❄ Frosty Mist
            </button>
          </div>
        </div>

        {/* Dynamic Display cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Climate card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${
              weatherCondition === 'sunny' ? 'bg-amber-100 text-amber-800' :
              weatherCondition === 'rainy' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              <span className="text-xl font-bold font-mono">
                {weatherCondition === 'sunny' ? '☀' : weatherCondition === 'rainy' ? '☂' : '❄'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider leading-none">Simulated Climate</span>
              <h5 className="text-[14px] font-black font-mono text-slate-800 mt-1">
                {weatherCondition === 'sunny' ? '23°C • Clear Sunny' :
                 weatherCondition === 'rainy' ? '16°C • Downpour Rain' :
                 '14°C • Frost Mist'}
              </h5>
              <p className="text-[10px] text-slate-400 font-bold">Relative Humidity: {weatherCondition === 'sunny' ? '30%' : weatherCondition === 'rainy' ? '92%' : '65%'}</p>
            </div>
          </div>

          {/* Moisture slider card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider leading-none">Soil Moisture Tension</span>
              <span className={`font-black font-mono text-xs px-2 py-0.5 rounded ${
                soilMoisture < 25 ? 'bg-red-100 text-red-800' :
                soilMoisture > 75 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {soilMoisture}% {soilMoisture < 25 ? 'Low' : soilMoisture > 75 ? 'High' : 'Ideal'}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-900"
            />
            <div className="flex justify-between text-[9px] text-slate-350 font-bold uppercase tracking-wider">
              <span>Dry (Dusted)</span>
              <span>Saturated (Log)</span>
            </div>
          </div>

          {/* Diagnostic alert badge */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            soilMoisture < 30 || weatherCondition === 'rainy'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
          }`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block leading-none">Smart Soil State</span>
              <p className="text-[11px] font-black mt-2 leading-snug">
                {soilMoisture < 30
                  ? '⚠️ Alert: Dry moisture levels detected! Engage drip valves immediately to bypass avocado leaf drops.'
                  : soilMoisture > 80
                  ? '✋ Saturated Soil: Hold scheduled drip irrigation runs for Fields Block-A and B.'
                  : '✔ Ideal capillary moisture pressure. Soil water release curves are optimum.'}
              </p>
            </div>
          </div>
        </div>

        {/* Textual Advisory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-2">Dr. Devin Omwenga's Customized Agro Advisory</span>
          <div className="flex gap-3">
            <span className="text-lg text-emerald-800 mt-0.5">💡</span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {weatherCondition === 'sunny' && 'Excellent avocado oil conversion. Graded harvest lines for Grade-A exporters should operate at maximum throughput. Ensure high cow safety water levels since herd dry intake rises during sunny weather.'}
              {weatherCondition === 'rainy' && 'Positive tea flush density is expected. High damp levels increase phytophthora spread risk. Delay foliar copper sprays until rainfall stops; review the GlobalGAP sprayer quarantine logs safety criteria.'}
              {weatherCondition === 'dry-cold' && 'Moderate frost hazard warning. Check mulch density across lower acreage lines. Provide warm molasses mixture water feeds to milking herds to maintain energy reserves.'}
            </p>
          </div>
        </div>
      </div>

      {/* GlobalGAP Quick Warnings banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-800 rounded-xl text-yellow-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h5 className="font-extrabold text-[13px] tracking-wide uppercase text-green-300">GlobalGAP Compliance Mode Enabled</h5>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              All crop export and livestock records conform to safety restrictions. Pre-Harvest Intervals (PHI) are strictly monitored. Ensure spray records are compiled.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">G-GAP Status</p>
          <span className="inline-block mt-2 px-3 py-1 bg-emerald-900 border border-green-700 rounded-full text-xs font-black text-emerald-300">
            COMPLIANT ●
          </span>
        </div>
      </div>
    </div>
  );
}
