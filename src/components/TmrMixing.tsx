/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Truck, Scale, Sparkles, Check, Trash2, ClipboardCheck, Activity, Calendar, FlaskConical, RefreshCw, Layers, Printer, Download } from 'lucide-react';

interface TmrMixingProps {
 onTriggerSectionReport?: (sectionKey: string) => void;
}

export function TmrMixing({ onTriggerSectionReport }: TmrMixingProps = {}) {
 const deferredMixLogWriteRef = useRef<number | null>(null);

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
 const [loadedStep4, setLoadedStep4] = useState(false); // Used for fallback standard Dairy Meal

 // Load active laboratory mix recipe-to-TMR dynamic state
 const [activeRecipeItems, setActiveRecipeItems] = useState<{ name: string; ratio: number }[]>(() => {
 try {
 const saved = localStorage.getItem('jr_farm_feed_formulator_batch');
 if (saved) {
 const parsed = JSON.parse(saved);
 if (Array.isArray(parsed) && parsed.length > 0) {
 const total = parsed.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
 if (total > 0) {
 return parsed.map((item: any) => ({
 name: item.name,
 ratio: (Number(item.amount) || 0) / total
 }));
 }
 }
 }
 } catch (e) {
 console.error('Error parsing feed formulation batch items in TMR:', e);
 }
 // Custom premium fallback compounding proportions
 return [
 { name: 'Maize Germ Meal Base', ratio: 0.50 },
 { name: 'Wheat Pollard Concentrate', ratio: 0.25 },
 { name: 'Cotton Seed Cake (Expeller)', ratio: 0.15 },
 { name: 'Soya Bean Meal (High Protein)', ratio: 0.08 },
 { name: 'Dicalcium Phosphate (DCP)', ratio: 0.02 }
 ];
 });

 const [useCustomFormula, setUseCustomFormula] = useState<boolean>(false);
 const [loadedCustomIngredients, setLoadedCustomIngredients] = useState<Record<string, boolean>>({});
 const [syncFeedback, setSyncFeedback] = useState<string>('');

 // Manual trigger to load last batch from laboratory
 const handleReloadFormula = () => {
 try {
 const saved = localStorage.getItem('jr_farm_feed_formulator_batch');
 if (saved) {
 const parsed = JSON.parse(saved);
 if (Array.isArray(parsed) && parsed.length > 0) {
 const total = parsed.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
 if (total > 0) {
 setActiveRecipeItems(
 parsed.map((item: any) => ({
 name: item.name,
 ratio: (Number(item.amount) || 0) / total
 }))
 );
 setLoadedCustomIngredients({});
 setSyncFeedback('Successfully synchronized with Laboratory Feed Formulator batch!');
 setTimeout(() => setSyncFeedback(''), 4500);
 return;
 }
 }
 }
 setSyncFeedback('No custom batch detected. Loaded standard premium formulation templates.');
 setTimeout(() => setSyncFeedback(''), 4500);
 } catch (e) {
 console.error(e);
 setSyncFeedback('Error syncing laboratory data.');
 setTimeout(() => setSyncFeedback(''), 4500);
 }
 };

 // Mix logs state with localStorage persistence
 const [mixLogs, setMixLogs] = useState<{ id: string; date: string; cows: number; totalKg: number; moisture: number; mode: string }[]>(() => {
 const saved = localStorage.getItem('jr_farm_tmr_mix_logs');
 return saved ? JSON.parse(saved) : [
 { id: 'tmr-1', date: new Date().toISOString().split('T')[0], cows: 12, totalKg: 504, moisture: 65, mode: 'Standard Template' }
 ];
 });

 React.useEffect(() => {
 if (deferredMixLogWriteRef.current !== null) {
 window.clearTimeout(deferredMixLogWriteRef.current);
 }

 deferredMixLogWriteRef.current = window.setTimeout(() => {
 deferredMixLogWriteRef.current = null;
 localStorage.setItem('jr_farm_tmr_mix_logs', JSON.stringify(mixLogs));
 }, 0);

 return () => {
 if (deferredMixLogWriteRef.current !== null) {
 window.clearTimeout(deferredMixLogWriteRef.current);
 deferredMixLogWriteRef.current = null;
 }
 };
 }, [mixLogs]);

 // Math with moisture tuning (Sorghum is scaled to maintain constant Dry Matter intake)
 // Standard DM = 35% (corresponding to 65% moisture).
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
 moisture: silageMoisture,
 mode: useCustomFormula ? 'Laboratory Formula Mode' : 'Standard Template'
 };
 setMixLogs([newLog, ...mixLogs]);
 
 // Reset loading milestones
 setLoadedStep1(false);
 setLoadedStep2(false);
 setLoadedStep3(false);
 setLoadedStep4(false);
 setLoadedCustomIngredients({});
 };

 const handleDeleteLog = (id: string) => {
 setMixLogs(mixLogs.filter(log => log.id !== id));
 };

 // Determine if all custom concentrate elements are ticked off
 const allCustomLoaded = useCustomFormula
 ? activeRecipeItems.every(item => loadedCustomIngredients[item.name])
 : loadedStep4;

 const allWagonStepsLoaded = loadedStep1 && loadedStep2 && loadedStep3 && allCustomLoaded;

 return (
 <div className="space-y-8 animate-fadeIn">
 {/* Introduction Banner */}
 <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-4 text-left">
 <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl shrink-0">
 <Truck size={24} className="text-emerald-800" />
 </div>
 <div>
 <h4 className="text-white font-black text-sm uppercase tracking-wider">TMR Mixer Wagon Calculator</h4>
 <p className="text-xs text-white font-medium font-medium font-medium">
 Calculate Total Mixed Rations (TMR) to secure uniform lactation nutrition, adjust for forage dry matter, and prevent sorting by dairy cows.
 </p>
 </div>
 </div>

 {/* Real-time synchronization and print controls */}
 <div className="flex flex-wrap gap-2 shrink-0 self-start md:self-center">
 <button
 onClick={handleReloadFormula}
 className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-105 bg-slate-800 hover:bg-slate-800 text-white border border-white/15 hover:border-white/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer m-0"
 >
 <RefreshCw size={13} className="text-emerald-800" />
 <span>Sync Lab Formula</span>
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('inventory')}
 type="button"
 className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download TMR & Inventory PDF Report"
 >
 <Download size={13} />
 Download PDF Report
 </button>
 )}
 </div>
 </div>

 {syncFeedback && (
 <div className="p-3.5 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase text-center border-l-4 border-emerald-500 animate-pulse">
 ✨ {syncFeedback}
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Diet Formulation Inputs */}
 <div className="bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-sm lg:col-span-5 space-y-6">
 <div className="text-left">
 <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Interactive Diet Parameters</h5>
 <p className="text-xs text-white font-medium font-medium mt-1 font-semibold">Adjust weight variables in kilograms (fresh weight)</p>
 </div>

 <div className="space-y-4 text-left">
 <div>
 <div className="flex justify-between mb-1">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider">Sorghum Silage (Base Weight)</label>
 <span className="text-[11px] text-emerald-900 font-bold font-mono">{getPercent(adjustedSorghum)}% of TMR</span>
 </div>
 <input
 type="number"
 min="0"
 step="0.5"
 value={sorghum}
 onChange={(e) => setSorghum(parseFloat(e.target.value) || 0)}
 placeholder="KG"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
 />
 </div>

 {/* Moisture Compensator slider */}
 <div className="bg-amber-900/20 p-4 rounded-2xl border border-amber-100 space-y-2">
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
 className="w-full h-1 appearance-none bg-slate-800 rounded-lg cursor-pointer accent-amber-700"
 />
 <div className="flex justify-between text-[9px] text-amber-700 font-bold uppercase tracking-wide">
 <span>Standard (65%)</span>
 <span>Wet Rain (80%)</span>
 </div>
 <p className="text-[10px] text-white font-medium font-medium font-medium leading-relaxed pt-1">
 Compensates for wet harvested silages. Adjusted Silage Fresh Weight per Cow: <strong className="text-white font-mono">{adjustedSorghum.toFixed(1)} KG</strong> (Original: {sorghum} KG) to preserve strict dry-matter targets.
 </p>
 </div>

 <div>
 <div className="flex justify-between mb-1">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider">Fresh Napier / Kikuyu Grass</label>
 <span className="text-[11px] text-emerald-950 font-bold font-mono">{getPercent(napier)}% of TMR</span>
 </div>
 <input
 type="number"
 min="0"
 step="0.5"
 value={napier}
 onChange={(e) => setNapier(parseFloat(e.target.value) || 0)}
 placeholder="KG"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
 />
 </div>

 <div>
 <div className="flex justify-between mb-1">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider">Rhodes Grass Hay</label>
 <span className="text-[11px] text-emerald-950 font-bold font-mono">{getPercent(rhodes)}% of TMR</span>
 </div>
 <input
 type="number"
 min="0"
 step="0.5"
 value={rhodes}
 onChange={(e) => setRhodes(parseFloat(e.target.value) || 0)}
 placeholder="KG"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
 />
 </div>

 {/* Premium Cross-Module Feed-to-TMR Integrator Controller */}
 <div className="pt-4 border-t border-white/10 space-y-3">
 <div className="flex justify-between items-center">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider">Concentrate Customization</label>
 <span className="text-[11px] text-emerald-950 font-bold font-mono">{getPercent(dairyMeal)}% of TMR</span>
 </div>

 {/* Concentrate Value block */}
 <div className="grid grid-cols-3 gap-2.5 items-center">
 <div className="col-span-1">
 <input
 type="number"
 min="0"
 step="0.1"
 value={dairyMeal}
 onChange={(e) => setDairyMeal(parseFloat(e.target.value) || 0)}
 placeholder="KG"
 className="text-xs border border-white/15 rounded-lg p-2.5 w-full font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none text-center"
 />
 </div>
 <div className="col-span-2 text-right">
 <span className="text-[10px] font-bold text-white font-medium font-medium uppercase tracking-wider block">Est. Concentrate per Cow</span>
 <span className="text-[11px] font-mono text-emerald-900 font-extrabold">{dairyMeal.toFixed(1)} KG/Cow/day</span>
 </div>
 </div>

 {/* Dynamic Toggle Card */}
 <div className="p-3.5 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors space-y-2">
 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 id="toggleFormula"
 className="rounded text-emerald-700 focus:ring-emerald-600 focus:outline-none cursor-pointer h-4 w-4"
 checked={useCustomFormula}
 onChange={(e) => setUseCustomFormula(e.target.checked)}
 />
 <label htmlFor="toggleFormula" className="text-xs font-black text-emerald-950 uppercase cursor-pointer select-none">
 Use Lab formulation ratios
 </label>
 </div>
 <p className="text-[9px] text-white font-medium font-medium font-medium leading-relaxed">
 Instead of generic commercial dairy meal bags, dynamically split the concentrate quantity ({dairyMeal.toFixed(1)} kg) into your exact custom lab ratio mix!
 </p>

 {useCustomFormula && (
 <div className="border-t border-emerald-500/10 pt-2 text-[9.5px] font-semibold text-white font-medium font-medium space-y-1">
 <span className="text-[8px] font-black uppercase text-emerald-800 tracking-wider block">Pushed Ratios Breakdown:</span>
 {activeRecipeItems.map((item, idz) => (
 <div key={idz} className="flex justify-between items-center font-mono">
 <span className="truncate max-w-[130px]">{item.name}</span>
 <span>{(item.ratio * 100).toFixed(0)}% ({(item.ratio * dairyMeal).toFixed(2)} KG/cow)</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Scale multiplier (Herd Size) */}
 <div className="pt-3 border-t border-white/10">
 <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block mb-1">Active Milking Herd Size</label>
 <input
 type="number"
 min="1"
 required
 value={cowsCount}
 onChange={(e) => setCowsCount(parseInt(e.target.value) || 1)}
 placeholder="Number of Cows"
 className="text-xs border border-emerald-250 rounded-lg p-3 w-full font-mono font-bold bg-emerald-900/20 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
 />
 <span className="text-[10px] text-slate-450 mt-1 block font-semibold uppercase">Used to scale batch mixing instructions on wagon scale</span>
 </div>
 </div>
 </div>

 {/* Diagnostic mixing visualization */}
 <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
 {/* Main classic double border container */}
 <div className="bg-slate-900 p-10 border-8 border-double border-emerald-900/60 rounded-[40px] shadow-sm text-center flex flex-col justify-center items-center space-y-6 min-h-[300px]">
 <div>
 <p className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-widest mb-1">Adjusted TMR Feed Weight</p>
 <span className="text-xs font-bold text-emerald-800 bg-emerald-900/20 border border-emerald-100 px-3 py-1 rounded-full uppercase">
 Per Cow / Day (Fresh Basis)
 </span>
 </div>
 <div>
 <h1 className="text-8xl font-black text-white font-mono tracking-tighter leading-none">
 {weightPerCow.toFixed(1)} <span className="text-xl font-bold text-white font-medium font-medium uppercase font-mono">KG</span>
 </h1>
 </div>

 {/* Total mixer load scale display */}
 <div className="bg-slate-800 border border-white/10 rounded-2xl p-5 w-full max-w-sm flex items-center justify-between">
 <div className="text-left">
 <span className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block">Mixer Target ({cowsCount} Cows)</span>
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

 {/* Quick loading recipes lists - Dynamic Sequenced wagon list */}
 <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-md border-t border-emerald-800 space-y-4 text-left">
 <div className="flex justify-between items-center flex-wrap gap-2 pb-2 border-b border-white/5">
 <h5 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-2">
 <Scale size={14} /> Wagon Loading Sequence (Adjusted)
 </h5>
 <span className="text-[9px] text-green-300 font-black uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
 Mode: {useCustomFormula ? "Compounded Laboratory Ratios" : "Standard Feed Template"}
 </span>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
 <button
 type="button"
 onClick={() => setLoadedStep1(!loadedStep1)}
 className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
 loadedStep1 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-805 text-slate-250'
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className="text-[10px] text-emerald-400 font-bold block">1. Silage Block</span>
 {loadedStep1 && <Check size={12} className="text-yellow-400 animate-bounce" />}
 </div>
 <span className="text-lg font-black font-mono block">{(adjustedSorghum * cowsCount).toFixed(0)} KG</span>
 <span className={`text-[9px] block mt-1 ${loadedStep1 ? 'text-green-300' : 'text-white font-medium'}`}>
 {loadedStep1 ? '✓ Loaded into bucket' : 'Sorghum base'}
 </span>
 </button>

 <button
 type="button"
 onClick={() => setLoadedStep2(!loadedStep2)}
 className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
 loadedStep2 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-805 text-slate-250'
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className="text-[10px] text-emerald-400 font-bold block">2. Fresh Napier</span>
 {loadedStep2 && <Check size={12} className="text-yellow-400 animate-bounce" />}
 </div>
 <span className="text-lg font-black font-mono block">{(napier * cowsCount).toFixed(0)} KG</span>
 <span className={`text-[9px] block mt-1 ${loadedStep2 ? 'text-green-300' : 'text-white font-bold'}`}>
 {loadedStep2 ? '✓ Loaded into bucket' : 'For moisture profile'}
 </span>
 </button>

 <button
 type="button"
 onClick={() => setLoadedStep3(!loadedStep3)}
 className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
 loadedStep3 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-805 text-slate-250'
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className="text-[10px] text-emerald-400 font-bold block">3. Rhodes Hay</span>
 {loadedStep3 && <Check size={12} className="text-yellow-400" />}
 </div>
 <span className="text-lg font-black font-mono block">{(rhodes * cowsCount).toFixed(0)} KG</span>
 <span className={`text-[9px] block mt-1 ${loadedStep3 ? 'text-green-300' : 'text-white font-bold'}`}>
 {loadedStep3 ? '✓ Loaded' : 'Scratch dry factor'}
 </span>
 </button>

 {/* Standard Step 4 card - only visible if useCustomFormula is false */}
 {!useCustomFormula ? (
 <button
 type="button"
 onClick={() => setLoadedStep4(!loadedStep4)}
 className={`p-3 border rounded-xl text-left relative overflow-hidden transition-all m-0 cursor-pointer ${
 loadedStep4 ? 'bg-emerald-800 border-green-500 text-white opacity-60' : 'bg-emerald-900 border-emerald-805 text-slate-250'
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className="text-[10px] text-emerald-400 font-bold block">4. commercial Meal</span>
 {loadedStep4 && <Check size={12} className="text-yellow-400" />}
 </div>
 <span className="text-lg font-black font-mono block">{(dairyMeal * cowsCount).toFixed(0)} KG</span>
 <span className={`text-[9px] block mt-1 ${loadedStep4 ? 'text-green-300' : 'text-white font-bold'}`}>
 {loadedStep4 ? '✓ Loaded' : 'Standard bag concentrate'}
 </span>
 </button>
 ) : (
 <div className="p-3 bg-emerald-900/60 border border-emerald-800 text-slate-205 rounded-xl flex flex-col justify-center items-center text-center">
 <FlaskConical className="text-yellow-450 text-yellow-400 animate-pulse mb-1" size={16} />
 <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">Dynamic Recipe Mode</span>
 <p className="text-[8px] text-slate-350 leading-tight block mt-0.5">Split across {activeRecipeItems.length} custom subchecks below!</p>
 </div>
 )}
 </div>

 {/* CUSTOM RECIPE SUBCOLUMNS - ONLY Rendered if useCustomFormula is true */}
 {useCustomFormula && (
 <div className="pt-3 border-t border-white/5 text-left space-y-2">
 <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">
 Step 4 Ingredients Subchecks:
 </span>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
 {activeRecipeItems.map((item, index) => {
 const isLoaded = loadedCustomIngredients[item.name];
 const scaledWeight = item.ratio * dairyMeal * cowsCount;
 return (
 <button
 key={index}
 type="button"
 onClick={() => {
 setLoadedCustomIngredients({
 ...loadedCustomIngredients,
 [item.name]: !isLoaded
 });
 }}
 className={`p-2.5 border rounded-xl flex items-center justify-between text-left transition-all cursor-pointer m-0 ${
 isLoaded ? 'bg-emerald-800/80 border-green-500 text-white opacity-70' : 'bg-emerald-900/50 border-emerald-800 text-white font-medium hover:bg-emerald-900'
 }`}
 >
 <div className="min-w-0 flex-1 pr-1.5">
 <span className="text-[8.5px] font-black uppercase tracking-wide truncate block text-emerald-400">{item.name}</span>
 <span className="text-xs font-black font-mono block text-white">{scaledWeight.toFixed(1)} KG</span>
 </div>
 {isLoaded ? (
 <Check size={14} className="text-yellow-400 shrink-0" />
 ) : (
 <span className="text-[8px] border border-white/20 text-white font-medium font-medium px-1 py-0.2 rounded font-mono shrink-0 uppercase">Load</span>
 )}
 </button>
 );
 })}
 </div>
 </div>
 )}
 
 {allWagonStepsLoaded && (
 <div className="bg-emerald-850 p-3 rounded-xl border border-green-500/50 flex items-center gap-2.5 animate-bounce mt-3 justify-center text-center">
 <span className="text-sm">🎉</span>
 <p className="text-[10px] font-extrabold text-green-300 uppercase tracking-widest leading-relaxed">
 TMR FEED WAGON MIX COMPLETE & AUDITED. DISCHARGING CALIBRATED DISPATCH INTO HERD FEED RANGE NOW.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Historical Mix Logs */}
 <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-sm space-y-4 text-left">
 <div className="flex items-center gap-2 text-white pb-2 border-b border-white/10">
 <ClipboardCheck size={18} className="text-emerald-700" />
 <h5 className="text-xs font-black uppercase tracking-wider">Mixer Run Operations Log</h5>
 </div>

 {mixLogs.length === 0 ? (
 <p className="text-center text-slate-450 text-xs italic py-6">No historical runs recorded today.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-white font-medium font-medium">
 <thead>
 <tr className="border-b border-white/10 text-[10px] uppercase font-black text-white font-medium font-medium">
 <th className="py-3">Date</th>
 <th className="py-3">Milking Herd size</th>
 <th className="py-3">silage moisture</th>
 <th className="py-3">diet methodology</th>
 <th className="py-3 text-right">total wagon load weight</th>
 <th className="py-3 text-center">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 font-medium">
 {mixLogs.map((log) => (
 <tr key={log.id} className="hover:bg-slate-800">
 <td className="py-3 flex items-center gap-2">
 <Calendar size={12} className="text-slate-450 font-mono text-white font-medium font-medium" />
 <span className="font-mono font-bold text-slate-750">{log.date}</span>
 </td>
 <td className="py-3 font-mono text-slate-750 font-black">{log.cows} Head</td>
 <td className="py-3">
 <span className="bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
 {log.moisture}% moisture
 </span>
 </td>
 <td className="py-3">
 <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
 log.mode ? (log.mode.includes('Lab') ? 'bg-indigo-100 text-indigo-950 border border-indigo-200' : 'bg-slate-800 text-slate-750') : 'bg-slate-800 text-slate-750'
 }`}>
 {log.mode || 'Standard Template'}
 </span>
 </td>
 <td className="py-3 text-right font-mono font-black text-emerald-950 text-sm">
 {log.totalKg.toLocaleString()} KG
 </td>
 <td className="py-3 text-center">
 <button
 onClick={() => handleDeleteLog(log.id)}
 className="text-slate-350 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 bg-transparent border-none"
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
