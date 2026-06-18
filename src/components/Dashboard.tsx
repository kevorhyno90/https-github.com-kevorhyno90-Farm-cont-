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
import { MilkingRecord, Todo } from '../types';

interface DashboardProps {
  milkRecords: MilkingRecord[];
  netPl: number;
  activeAlarmsCount: number;
  upcomingDueAlarm: string;
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string) => void;
  onDeleteTodo: (id: string) => void;
  totalTeaQty: number;
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
  totalTeaQty
}: DashboardProps) {
  const [newTodo, setNewTodo] = useState('');
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
    onAddTodo(newTodo.trim());
    setNewTodo('');
  };

  return (
    <div className="space-y-8">
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
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Dr. Devin Omwenga's Strategic Plan</h4>
            <p className="text-xs text-slate-400 font-medium">Operational priority action steps</p>
          </div>

          <form onSubmit={handleSubmitTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="E.g. Clear pasture sector D..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-slate-700 font-medium"
            />
            <button
              type="submit"
              className="bg-emerald-950 text-white rounded-xl px-4 flex items-center justify-center hover:bg-emerald-800 active:scale-95 transition-all shadow-sm"
              aria-label="Add Task"
            >
              <Plus size={16} />
            </button>
          </form>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
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
                    <span
                      className={`text-xs text-slate-700 font-medium leading-relaxed ${
                        todo.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {todo.text}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="text-slate-300 hover:text-red-600 p-1 rounded-lg transition-colors shrink-0 m-0"
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

      {/* Dynamic Climate & Soil Advisory Simulator Panel */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Limuru Weather & Agro-Advisory Simulator</h4>
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
