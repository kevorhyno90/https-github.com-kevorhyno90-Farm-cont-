import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Activity, TrendingUp, BellRing, Baby, TestTube, AlertTriangle, Radio, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MilkingRecord, MilkOutflowRecord, AIRecord, Cow } from '../../types';

interface DairyDashboardProps {
  milkRecords: MilkingRecord[];
  milkOutflows: MilkOutflowRecord[];
  aiRecords: AIRecord[];
  cows: Cow[];
}

export function DairyDashboard({ milkRecords, milkOutflows, aiRecords, cows }: DairyDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Interactive Lactation Cow Curve state
  const [selectedCowId, setSelectedCowId] = React.useState<string>('');

  // ── Milking Telemetry Stream Simulator ──────────────────────────────────
  const [telemetryActive, setTelemetryActive] = useState(false);
  const [telemetryReadings, setTelemetryReadings] = useState<{ cowId: string; yield: number; session: string; pulse: number }[]>([]);
  const [telemetryTick, setTelemetryTick] = useState(0);
  const telemetryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTelemetry = () => {
    if (telemetryRef.current) clearInterval(telemetryRef.current);
    telemetryRef.current = null;
    setTelemetryActive(false);
  };

  const startTelemetry = () => {
    if (cows.length === 0) return;
    setTelemetryActive(true);
    const tick = () => {
      setTelemetryTick(t => t + 1);
      setTelemetryReadings(
        cows.slice(0, 8).map(cow => ({
          cowId: cow.id,
          yield: parseFloat((Math.random() * 6 + 2).toFixed(2)),
          session: new Date().getHours() < 12 ? 'AM' : 'PM',
          pulse: Math.floor(Math.random() * 20 + 55)
        }))
      );
    };
    tick();
    telemetryRef.current = setInterval(tick, 2000);
  };

  useEffect(() => {
    return () => { if (telemetryRef.current) clearInterval(telemetryRef.current); };
  }, []);
  // ── end telemetry ─────────────────────────────────────────────────────

  const getStartOfWeek = (d: string) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  };
  const startOfWeek = getStartOfWeek(today);
  const startOfMonth = today.substring(0, 8) + '01';

  const calcStats = (filterFn: (r: any) => boolean) => {
    const filteredMilks = milkRecords.filter(filterFn);
    const filteredOutflows = milkOutflows.filter(filterFn);
    
    const yieldL = filteredMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
    const home = filteredOutflows.reduce((sum, o) => sum + o.milkUsedAtHome, 0);
    const workers = filteredOutflows.reduce((sum, o) => sum + o.milkUsedByWorkers, 0);
    const calf = filteredOutflows.reduce((sum, o) => sum + (o.milkUsedByCalf || 0), 0);
    const spoiled = filteredOutflows.reduce((sum, o) => sum + o.milkSpoiled, 0);
    const consumedL = home + workers + calf + spoiled;
    const netSoldL = Math.max(0, yieldL - consumedL);

    let revenue = 0;
    const uniqueDates = Array.from(new Set(filteredMilks.map(m => m.date)));
    uniqueDates.forEach(dateKey => {
      const dayMilks = filteredMilks.filter(m => m.date === dateKey);
      const dayOutflow = milkOutflows.find(o => o.date === dateKey);
      
      const dYield = dayMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
      const dHome = dayOutflow ? dayOutflow.milkUsedAtHome : 0;
      const dWorkers = dayOutflow ? dayOutflow.milkUsedByWorkers : 0;
      const dCalf = dayOutflow ? (dayOutflow.milkUsedByCalf || 0) : 0;
      const dSpoiled = dayOutflow ? dayOutflow.milkSpoiled : 0;
      
      const dConsumed = dHome + dWorkers + dCalf + dSpoiled;
      const dNetSold = Math.max(0, dYield - dConsumed);
      const price = dayOutflow?.salesPricePerLiter ?? 52;
      revenue += (dNetSold * price);
    });

    return { yieldL, consumedL, netSoldL, revenue };
  };

  const dayStats = calcStats(r => r.date === today);
  const weekStats = calcStats(r => r.date >= startOfWeek && r.date <= today);
  const monthStats = calcStats(r => r.date >= startOfMonth && r.date <= today);

  // FCR metrics: standard dairy cow feed dry matter allocation is 12 kg
  const lactatingCowsCount = cows.filter(c => c.status === 'Lactating').length || 1;
  const averageFeedKg = 12;
  const dailyFcr = dayStats.yieldL > 0 
    ? (dayStats.yieldL / (lactatingCowsCount * averageFeedKg)).toFixed(2) 
    : '0.00';

  // Lactation curves line chart mapping
  const lactationCurveData = React.useMemo(() => {
    if (!selectedCowId) return [];
    const cowMilks = milkRecords
      .filter(r => r.id && r.id.toLowerCase() === selectedCowId.toLowerCase())
      .sort((a, b) => a.date.localeCompare(b.date));
    return cowMilks.map((r, idx) => ({
      day: `Day ${idx + 1}`,
      yield: (r.am || 0) + (r.pm || 0),
      date: r.date
    }));
  }, [milkRecords, selectedCowId]);

  // Prepare Chart Data
  const sortedDates = Array.from(new Set(milkRecords.map(m => m.date))).sort();
  const chartData = sortedDates.map(date => {
    const dayMilks = milkRecords.filter(m => m.date === date);
    const yieldL = dayMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
    
    const dayOutflow = milkOutflows.find(o => o.date === date);
    const consumed = dayOutflow ? (dayOutflow.milkUsedAtHome + dayOutflow.milkUsedByWorkers + (dayOutflow.milkUsedByCalf || 0) + dayOutflow.milkSpoiled) : 0;
    
    const netSoldL = Math.max(0, yieldL - consumed);
    const price = dayOutflow?.salesPricePerLiter ?? 52;
    const revenue = netSoldL * price;
    
    const dateObj = new Date(date);
    const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return { name: displayDate, fullDate: date, yield: parseFloat(yieldL.toFixed(1)), revenue: Math.round(revenue) };
  });
  
  const recentChartData = chartData.slice(-14);

  // Smart Alerts Logic
  const calculateAlerts = () => {
    const alerts: { id: string; type: 'pd' | 'dry' | 'calving' | 'heat'; cowId: string; cowName: string; dateDue: string; daysRemaining: number; severity: 'high' | 'medium' | 'low' }[] = [];
    const todayDate = new Date();

    aiRecords.forEach((ai, idx) => {
      if (ai.status === 'Failed' || ai.status === 'Calved') return;

      const aiDate = new Date(ai.date);
      const daysSinceAI = Math.floor((todayDate.getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const cowName = cows.find(c => c.id === ai.cowId)?.name || 'Unknown Cow';

      // 1. Heat Check (21 days)
      if (ai.status === 'Pending' && daysSinceAI >= 18 && daysSinceAI <= 24) {
        const dueDate = new Date(aiDate);
        dueDate.setDate(dueDate.getDate() + 21);
        alerts.push({ id: `heat-${idx}`, type: 'heat', cowId: ai.cowId, cowName, dateDue: dueDate.toISOString().split('T')[0], daysRemaining: 21 - daysSinceAI, severity: 'medium' });
      }

      // 2. PD Check (45-60 days)
      if (ai.status === 'Pending' && daysSinceAI >= 40 && daysSinceAI <= 70) {
        const dueDate = new Date(aiDate);
        dueDate.setDate(dueDate.getDate() + 60);
        alerts.push({ id: `pd-${idx}`, type: 'pd', cowId: ai.cowId, cowName, dateDue: dueDate.toISOString().split('T')[0], daysRemaining: 60 - daysSinceAI, severity: 'high' });
      }

      // 3. Drying Off (220 days)
      if (ai.status === 'Confirmed Pregnant' && daysSinceAI >= 200 && daysSinceAI <= 230) {
        const dueDate = new Date(aiDate);
        dueDate.setDate(dueDate.getDate() + 220);
        alerts.push({ id: `dry-${idx}`, type: 'dry', cowId: ai.cowId, cowName, dateDue: dueDate.toISOString().split('T')[0], daysRemaining: 220 - daysSinceAI, severity: 'medium' });
      }

      // 4. Calving (283 days)
      if (ai.status === 'Confirmed Pregnant' && daysSinceAI >= 260) {
        const dueDate = new Date(aiDate);
        dueDate.setDate(dueDate.getDate() + 283);
        alerts.push({ id: `calve-${idx}`, type: 'calving', cowId: ai.cowId, cowName, dateDue: dueDate.toISOString().split('T')[0], daysRemaining: 283 - daysSinceAI, severity: 'high' });
      }
    });

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const activeAlerts = calculateAlerts();

  return (
    <div className="space-y-8">
      {/* Smart Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm text-left">
          <div className="flex items-center gap-3 mb-4">
            <BellRing className="text-red-500 animate-pulse" size={24} />
            <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">Smart Action Alerts ({activeAlerts.length})</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-start gap-4 hover:border-red-300 transition-all cursor-default">
                <div className={`p-3 rounded-full ${alert.type === 'calving' ? 'bg-purple-100 text-purple-600' : alert.type === 'pd' ? 'bg-blue-100 text-blue-600' : alert.type === 'dry' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                  {alert.type === 'calving' ? <Baby size={20} /> : alert.type === 'pd' ? <TestTube size={20} /> : alert.type === 'dry' ? <AlertTriangle size={20} /> : <Activity size={20} />}
                </div>
                <div>
                  <h5 className="text-[11px] font-black uppercase text-slate-800">{alert.cowId} - {alert.cowName}</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    {alert.type === 'calving' ? 'Expected Calving' : alert.type === 'pd' ? 'PD Check Due' : alert.type === 'dry' ? 'Drying Off Due' : 'Return to Heat Check'}
                  </p>
                  <p className={`text-[11px] font-black mt-1 ${alert.daysRemaining <= 3 ? 'text-red-600' : 'text-slate-600'}`}>
                    {alert.daysRemaining < 0 ? `Overdue by ${Math.abs(alert.daysRemaining)} days` : alert.daysRemaining === 0 ? 'DUE TODAY' : `Due in ${alert.daysRemaining} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={48} className="text-emerald-500" /></div>
          <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Today's Performance</h5>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-800">{dayStats.yieldL.toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">Liters Yield</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-slate-50">
            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase">Net Sold</span><span className="font-mono font-bold text-emerald-600">{dayStats.netSoldL.toFixed(1)} L</span></div>
            <div className="flex flex-col text-right"><span className="text-[9px] font-bold text-slate-400 uppercase">Revenue</span><span className="font-mono font-bold text-slate-800">Ksh {dayStats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={48} className="text-indigo-500" /></div>
          <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">This Week</h5>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-800">{weekStats.yieldL.toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">Liters Yield</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-slate-50">
            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase">Net Sold</span><span className="font-mono font-bold text-indigo-600">{weekStats.netSoldL.toFixed(1)} L</span></div>
            <div className="flex flex-col text-right"><span className="text-[9px] font-bold text-slate-400 uppercase">Revenue</span><span className="font-mono font-bold text-slate-800">Ksh {weekStats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-sky-200 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={48} className="text-sky-500" /></div>
          <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Feed Conversion Ratio</h5>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-800">{dailyFcr}</span>
            <span className="text-sm font-bold text-slate-400">L / KG DM</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-slate-50">
            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase">Lactating Herd</span><span className="font-mono font-bold text-slate-800">{lactatingCowsCount} cows</span></div>
            <div className="flex flex-col text-right"><span className="text-[9px] font-bold text-slate-400 uppercase">Standard Feed</span><span className="font-mono font-bold text-slate-800">{averageFeedKg} kg / cow</span></div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={48} className="text-amber-500" /></div>
          <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">This Month</h5>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-white">{monthStats.yieldL.toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">Liters Yield</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase">Net Sold</span><span className="font-mono font-bold text-amber-400">{monthStats.netSoldL.toFixed(1)} L</span></div>
            <div className="flex flex-col text-right"><span className="text-[9px] font-bold text-slate-400 uppercase">Est. Revenue</span><span className="font-mono font-bold text-white">Ksh {monthStats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {recentChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
            <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-wide">14-Day Yield Trend</h4>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={recentChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="yield" name="Yield (Liters)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
            <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-wide">14-Day Revenue Trend</h4>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={recentChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `Ksh ${value}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} formatter={(value: number) => [`Ksh ${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Lactation Curve Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Individual Lactation Curve Analysis</h4>
            <p className="text-[10.5px] text-slate-400 font-bold uppercase mt-0.5">MILK YIELD (AM + PM) PLOTTED OVER DAYS IN LACTATION</p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Select Cow:</label>
            <select
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="">-- Choose Cow tag --</option>
              {cows.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.name} ({c.breed})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedCowId ? (
          lactationCurveData.length > 0 ? (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={lactationCurveData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Liters Produced', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' } }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value} Liters`, 'Daily Yield']} />
                  <Line type="monotone" dataKey="yield" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 italic text-xs">No milking records logged for Cow {selectedCowId}. Add records under the milking log to plot the curve.</div>
          )
        ) : (
          <div className="p-8 text-center text-slate-400 italic text-xs">Please select a cow from the dropdown menu to visualize its individual lactation curve.</div>
        )}
      </div>

      {/* ── Milking Telemetry Stream Simulator ── */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${telemetryActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Radio size={20} className={telemetryActive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                Live Milking Telemetry
                {telemetryActive && (
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                    STREAMING
                  </span>
                )}
              </h4>
              <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                {telemetryActive
                  ? `Live sensor feed · Tick #${telemetryTick} · Refreshes every 2s`
                  : 'Simulate real-time sensor data from the milking parlour'}
              </p>
            </div>
          </div>
          <button
            onClick={telemetryActive ? stopTelemetry : startTelemetry}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer m-0 border-0 ${
              telemetryActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-900/40'
            }`}
          >
            <Zap size={13} />
            {telemetryActive ? 'Stop Stream' : 'Start Live Stream'}
          </button>
        </div>

        {telemetryActive && telemetryReadings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {telemetryReadings.map((r, i) => (
              <div key={r.cowId + i} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-emerald-700/40 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase truncate">{r.cowId}</p>
                <p className="text-2xl font-black text-white mt-1">{r.yield}
                  <span className="text-xs text-emerald-400 font-bold ml-1">L</span>
                </p>
                <div className="mt-2 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((r.yield / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 font-bold mt-1.5">
                  {r.session} session · ♥ {r.pulse} bpm
                </p>
              </div>
            ))}
          </div>
        ) : !telemetryActive ? (
          <div className="text-center py-8 border border-dashed border-slate-700 rounded-2xl">
            <Radio size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-xs font-bold">Press <span className="text-emerald-400">Start Live Stream</span> to activate sensor simulation</p>
            <p className="text-slate-600 text-[10px] mt-1">Streams per-cow yield, session, and heart-rate pulse data</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
