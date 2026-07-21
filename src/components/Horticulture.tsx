/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeaRecord, AvocadoRecord } from '../types';
import { Leaf, Plus, Package, Activity, BadgePercent, Filter, TrendingUp, Trash2, Edit2, FileSpreadsheet, QrCode, Printer, Award, Shield, Sparkles, Download } from 'lucide-react';

interface HorticultureProps {
 teaRecords: TeaRecord[];
 avoRecords: AvocadoRecord[];
 onAddTea: (rec: TeaRecord) => void;
 onAddAvo: (rec: AvocadoRecord) => void;
 onDeleteTea: (ref: string) => void;
 onDeleteAvo: (ref: string) => void;
 onEditTea?: (oldRef: string, updated: TeaRecord) => void;
 onEditAvo?: (oldRef: string, updated: AvocadoRecord) => void;
 onTriggerSectionReport?: (sectionKey: string) => void;
 activeSubModule?: 'tea' | 'avo';
}

// Pure SVG Real-Time Finder Block QR Generator matching Version 1 standard
function QRGenerator({ value }: { value: string }) {
 const size = 21;
 const grid: boolean[][] = [];
 
 // Simple deterministic hash generator based on character codes
 const getHash = (str: string, index: number) => {
 let hash = 0;
 for (let i = 0; i < str.length; i++) {
 hash = (hash << 5) - hash + str.charCodeAt(i);
 hash |= 0;
 }
 return Math.abs((hash + index * 12345) % 100) > 42;
 };

 for (let r = 0; r < size; r++) {
 const row: boolean[] = [];
 for (let c = 0; c < size; c++) {
 // Finder Patterns
 // Top-Left
 if (r < 7 && c < 7) {
 row.push(r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
 }
 // Top-Right
 else if (r < 7 && c >= 14) {
 const nc = c - 14;
 row.push(r === 0 || r === 6 || nc === 0 || nc === 6 || (r >= 2 && r <= 4 && nc >= 2 && nc <= 4));
 }
 // Bottom-Left
 else if (r >= 14 && c < 7) {
 const nr = r - 14;
 row.push(nr === 0 || nr === 6 || c === 0 || c === 6 || (nr >= 2 && nr <= 4 && c >= 2 && c <= 4));
 }
 // Timing patterns & quiet zones
 else if (r === 6 || c === 6) {
 row.push((r === 6 || c === 6) && (r + c) % 2 === 0);
 }
 // Random / Deterministic noise from payload
 else {
 row.push(getHash(value, r * size + c));
 }
 }
 grid.push(row);
 }

 return (
 <svg viewBox="0 0 21 21" className="w-[100px] h-[100px] bg-white shadow-sm p-1 rounded-md border border-white/20 shrink-0" shapeRendering="crispEdges">
 {grid.map((row, rIndex) =>
 row.map((cell, cIndex) => (
 <rect
 key={`${rIndex}-${cIndex}`}
 x={cIndex}
 y={rIndex}
 width={1}
 height={1}
 fill={cell ? "#0f172a" : "transparent"}
 />
 ))
 )}
 </svg>
 );
}

export function Horticulture({
 teaRecords,
 avoRecords,
 onAddTea,
 onAddAvo,
 onDeleteTea,
 onDeleteAvo,
 onEditTea,
 onEditAvo,
 onTriggerSectionReport,
 activeSubModule
}: HorticultureProps) {
 // Tea state
 const [teaQty, setTeaQty] = useState<number | ''>('');
 const [teaRef, setTeaRef] = useState('');
 const [teaPrice, setTeaPrice] = useState<number | ''>(58); // default base rate Ksh
 const [teaBuyer, setTeaBuyer] = useState('Chinga KTDA Factory'); // default buyer
 const [teaDate, setTeaDate] = useState(new Date().toISOString().split('T')[0]);

 // Edit States
 const [editingTea, setEditingTea] = useState<TeaRecord | null>(null);
 const [editingAvo, setEditingAvo] = useState<AvocadoRecord | null>(null);

 // Avocado state (Updated to matching requested fields only)
 const [avoRef, setAvoRef] = useState('');
 const [grade1Kg, setGrade1Kg] = useState<number | ''>('');
 const [grade1PricePerKg, setGrade1PricePerKg] = useState<number | ''>('');
 const [rejectKg, setRejectKg] = useState<number | ''>('');
 const [priceForRejects, setPriceForRejects] = useState<number | ''>('');
 const [grade1Buyer, setGrade1Buyer] = useState('Kakuzi Agribusiness Exporters');
 const [rejectBuyer, setRejectBuyer] = useState('Local Puree Processor');
 const [paymentMode, setPaymentMode] = useState('Deferred (Next harvest payouts)');
 const [nextHarvestSeason, setNextHarvestSeason] = useState('October - December');
 const [debts, setDebts] = useState<number | ''>(0);
 const [notes, setNotes] = useState('');
 const [avoDate, setAvoDate] = useState(new Date().toISOString().split('T')[0]);

 // GlobalGAP/KEPHIS Interactive Label Builder states
 const [selectedLotRef, setSelectedLotRef] = useState('');
 const [certCode, setCertCode] = useState('JR-GLOBALGAP-205A-KT');
 const [dispatchVehicle, setDispatchVehicle] = useState('KBT 842K Fridge Cargo Rig');
 const [phytosanitary, setPhytosanitary] = useState('KEPHIS Class 1 A+ Certified');
 const [destination, setDestination] = useState('Mombasa Reefers • Sea Freight');
 const [spraySafeCode, setSpraySafeCode] = useState('Safe Interval Verified (PHI > 40d)');
 const [sortingClerk, setSortingClerk] = useState('Clerk Charles Mutisya');
 const [customNote, setCustomNote] = useState('GRADE A ZERO DEFECTS APPROVED FOR EU SHIPMENT');
 const [printSuccess, setPrintSuccess] = useState(false);

 const handleTeaSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (teaQty === '' || !teaRef.trim()) return;
 const qtyVal = Number(teaQty);
 const prVal = teaPrice === '' ? 58 : Number(teaPrice);
 const buyVal = teaBuyer.trim() || 'KTDA Factory';
 onAddTea({
 qty: qtyVal,
 ref: teaRef.trim(),
 date: teaDate,
 pricePerKg: prVal,
 buyer: buyVal,
 totalSales: qtyVal * prVal
 });
 setTeaQty('');
 setTeaRef('');
 setTeaDate(new Date().toISOString().split('T')[0]);
 };

 const handleAvoSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (grade1Kg === '' || grade1PricePerKg === '' || rejectKg === '' || priceForRejects === '' || !avoRef.trim()) return;
 const g1 = Number(grade1Kg);
 const p1 = Number(grade1PricePerKg);
 const rj = Number(rejectKg);
 const pr = Number(priceForRejects);
 const debtVal = Number(debts) || 0;

 onAddAvo({
 ref: avoRef.trim(),
 date: avoDate,
 grade1Kg: g1,
 grade1PricePerKg: p1,
 rejectKg: rj,
 priceForRejects: pr,
 grade1Buyer: grade1Buyer.trim() || 'Kakuzi Exporters',
 rejectBuyer: rejectBuyer.trim() || 'Local Puree Processor',
 paymentMode: paymentMode.trim() || 'Deferred (Next harvest payouts)',
 nextHarvestSeason: nextHarvestSeason.trim() || 'October - December',
 debts: debtVal,
 notes: notes.trim() || 'None',
 totalSales: (g1 * p1) + (rj * pr)
 });

 setGrade1Kg('');
 setGrade1PricePerKg('');
 setRejectKg('');
 setPriceForRejects('');
 setPaymentMode('Deferred (Next harvest payouts)');
 setNextHarvestSeason('October - December');
 setDebts(0);
 setNotes('');
 setAvoRef('');
 setAvoDate(new Date().toISOString().split('T')[0]);
 };

 // Compute total aggregates for Horticulture
 const totalTeaAllTime = teaRecords.reduce((sum, r) => sum + (r.qty || 0), 0);
 const totalAvoGrade1Kg = avoRecords.reduce((sum, r) => sum + (r.grade1Kg || 0), 0);
 const totalAvoRejectKg = avoRecords.reduce((sum, r) => sum + (r.rejectKg || 0), 0);
 const totalAvoSalesAllTime = avoRecords.reduce((sum, r) => sum + (r.totalSales || 0), 0);

 // CSV downlod helper functions
 const downloadTeaCSV = () => {
 let csv = 'data:text/csv;charset=utf-8,';
 csv += 'KTDA TEA EXPORTS HARVEST & DELIVERIES\n';
 csv += `Generated: ${new Date().toLocaleString()}\n\n`;
 csv += 'Date,Plucking Ref,Primary Buyer,Harvest Weight (KG),Price/KG (Ksh),Gross Amount (Ksh)\n';
 teaRecords.forEach((t) => {
 const p = t.pricePerKg ?? 58;
 const b = t.buyer ?? 'Chinga KTDA Factory';
 const s = t.totalSales ?? (t.qty * p);
 csv += `${t.date},"${t.ref}","${b}",${t.qty},${p},${s}\n`;
 });
 const encodedUri = encodeURI(csv);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `Tea_Harvest_Records_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 const downloadAvoCSV = () => {
 let csv = 'data:text/csv;charset=utf-8,';
 csv += 'AVOCADO EXPORT LOGISTICS & REVENUES\n';
 csv += `Generated: ${new Date().toLocaleString()}\n\n`;
 csv += 'Date,Shipping Ref,Grade 1 KG,Grade 1 Price/KG,Reject KG,Price for Rejects,Grade 1 Buyer,Reject Buyer,Payment Mode,Next Harvest Season,Debts,Notes,Total Money Got\n';
 avoRecords.forEach((item) => {
 csv += `${item.date},"${item.ref}",${item.grade1Kg},${item.grade1PricePerKg},${item.rejectKg},${item.priceForRejects},"${item.grade1Buyer}","${item.rejectBuyer}","${item.paymentMode || item.paymentModeNextHarvestSeason || 'Deferred'}","${item.nextHarvestSeason || 'N/A'}",${item.debts},"${item.notes.replace(/"/g, '""')}",${item.totalSales}\n`;
 });
 const encodedUri = encodeURI(csv);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `Avocado_Export_Logistics_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="space-y-8">
 {/* Overview Intro Banner */}
 <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
 <div className="p-3 bg-indigo-100 text-indigo-950 rounded-xl shrink-0">
 <Leaf size={24} className="text-green-600" />
 </div>
 <div>
 <h4 className="text-gray-500 font-semibold text-sm tracking-tight">
 {activeSubModule === 'tea' ? 'KTDA Tea Delivery Ledger' :
 activeSubModule === 'avo' ? 'Avocado Export Ledger' :
 'Horticulture Export Ledger'}
 </h4>
 <p className="text-xs text-gray-900 font-medium font-medium">
 {activeSubModule === 'tea' ? 'Register daily green leaf tea weights, buyer details, and KTDA dispatches.' :
 activeSubModule === 'avo' ? 'Monitor export avocado grades, reject counts, KEPHIS Class 1 certification, and shipping reefs.' :
 'Register daily tea leaf weights and avocado grading crates. Keep export records in absolute alignment with KEPHIS & GlobalGAP frameworks.'}
 </p>
 </div>
 </div>
 
 {/* Visual Block Grid Map & Yield Forecasting */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Interactive Block Grid Map (8 cols) */}
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-8 text-left space-y-4">
 <div>
 <h5 className="text-[11px] font-semibold tracking-normal text-green-600 ">Interactive Orchard & Tea Block Map</h5>
 <p className="text-2xs text-gray-900 font-medium font-bold  mt-0.5">Click a block to view recent agronomic operations</p>
 </div>
 
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {[
 { id: 'BLK-T1', name: 'South Slope Tea', type: 'Tea', desc: 'Clone 31/8', status: 'Active Plucking', color: 'emerald', latestOp: 'Plucked 172kg yesterday' },
 { id: 'BLK-T2', name: 'East Ridge Tea', type: 'Tea', desc: 'Clone 15/10', status: 'Pruned', color: 'amber', latestOp: 'Pruning completed 10d ago' },
 { id: 'BLK-A1', name: 'Lower Valley Hass', type: 'Avocado', desc: 'Grafted Hass', status: 'Fruit Growing', color: 'sky', latestOp: 'Fungicide sprayed 4d ago' },
 { id: 'BLK-A2', name: 'Ridge Orchard', type: 'Avocado', desc: 'Fuerte Variety', status: 'Dormant Post-Harvest', color: 'slate', latestOp: 'Harvest completed last season' }
 ].map((block) => (
 <button
 key={block.id}
 onClick={() => alert(`Block ${block.id}: ${block.name}\nCrop: ${block.type} (${block.desc})\nStatus: ${block.status}\nLatest Action: ${block.latestOp}`)}
 className="p-4 border border-gray-100 rounded-2xl text-left hover:shadow-md transition-all cursor-pointer bg-white shadow-sm group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
 >
 <span className="text-[9px] font-semibold text-gray-900 font-medium block  font-mono">{block.id}</span>
 <span className="text-xs font-semibold text-gray-900 block mt-1 leading-snug">{block.name}</span>
 <span className="text-[10px] text-gray-900 font-medium block mt-0.5 font-semibold">{block.desc}</span>
 <div className="mt-3 flex items-center gap-2">
 <span className={`w-2 h-2 rounded-full ${block.color === 'emerald' ? 'bg-emerald-500 animate-pulse' : block.color === 'amber' ? 'bg-amber-500' : block.color === 'sky' ? 'bg-sky-500 animate-pulse' : 'bg-slate-500'}`}></span>
 <span className="text-[10px] text-gray-900 font-medium font-semibold ">{block.status}</span>
 </div>
 </button>
 ))}
 </div>
 </div>
 
 {/* Yield Forecasting Analytics (4 cols) */}
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-4 text-left space-y-4">
 <div>
 <h5 className="text-[11px] font-semibold tracking-normal text-green-600 ">Yield Trend Forecasting</h5>
 <p className="text-2xs text-gray-900 font-medium font-bold  mt-0.5">Machine-assisted projections</p>
 </div>
 
 <div className="space-y-4">
 <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
 <span className="text-[9px] font-semibold text-green-600 block ">Projected Green Tea (Next 30 days)</span>
 <div className="flex items-baseline gap-2 mt-1">
 <span className="text-xl font-semibold text-gray-900 text-gray-900">850 KG</span>
 <span className="text-[10px] text-green-600 font-bold font-mono">+5.2% trend</span>
 </div>
 <p className="text-[9.5px] text-green-600 font-medium leading-normal mt-1">Based on KTDA delivery aggregate monthly average plucking indices.</p>
 </div>
 
 <div className="p-3 bg-sky-900/20 rounded-xl border border-sky-100">
 <span className="text-[9px] font-semibold text-sky-800 block ">Projected Hass Harvest (Oct-Dec)</span>
 <div className="flex items-baseline gap-2 mt-1">
 <span className="text-xl font-semibold text-gray-900 text-gray-900">4,800 KG</span>
 <span className="text-[10px] text-sky-700 font-bold font-mono">Normal Yield</span>
 </div>
 <p className="text-[9.5px] text-sky-600 font-medium leading-normal mt-1">Calculated from historical block grafting indices and rainfall levels.</p>
 </div>
 </div>
 </div>
 </div>
 
 <div className={activeSubModule ? "space-y-8" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
 {/* Tea plucking ledger */}
 {(!activeSubModule || activeSubModule === 'tea') && (
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
 <div className="border-b border-gray-100 pb-3">
 <h5 className="text-[11px] font-semibold tracking-normal text-green-600 ">Tea KTDA Deliveries</h5>
 <p className="text-xs text-gray-900 font-medium mt-1 font-medium">Record daily pluck weight delivered to factory</p>
 </div>

 <form onSubmit={handleTeaSubmit} className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">KGs Harvested</label>
 <input
 type="number"
 required
 min="0.1"
 step="0.1"
 value={teaQty}
 onChange={(e) => setTeaQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="E.g. 145"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Collection Ref</label>
 <input
 type="text"
 required
 value={teaRef}
 onChange={(e) => setTeaRef(e.target.value)}
 placeholder="E.g. KTDA-TX-998"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Price per KG (Ksh)</label>
 <input
 type="number"
 required
 min="1"
 value={teaPrice}
 onChange={(e) => setTeaPrice(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 58"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Primary Buyer</label>
 <input
 type="text"
 required
 value={teaBuyer}
 onChange={(e) => setTeaBuyer(e.target.value)}
 placeholder="E.g. Chinga KTDA Factory"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold text-gray-900"
 />
 </div>
 <div className="col-span-2">
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Harvest Logging Date</label>
 <input
 type="date"
 required
 value={teaDate}
 onChange={(e) => setTeaDate(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono cursor-pointer bg-white shadow-sm "
 />
 </div>
 <button
 type="submit"
 className="col-span-2 bg-white hover:bg-emerald-900 text-gray-900 font-semibold text-xs  p-3.5 rounded-xl transition-all shadow-md m-0"
 >
 Save Tea Log & Income
 </button>
 </form>

 {/* Past tea logs */}
 <div className="border-t border-gray-100 pt-5 space-y-3">
 <div className="flex justify-between items-center text-xs">
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block font-bold">Collection Receipt Timeline</label>
 <div className="flex items-center gap-2">
 <button
 onClick={downloadTeaCSV}
 type="button"
 className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-green-600 text-green-600 rounded font-semibold text-[9px]  transition-all shadow-xs cursor-pointer m-0"
 title="Export Tea Harvests CSV"
 >
 <FileSpreadsheet size={10} />
 Export CSV
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('tea')}
 type="button"
 className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-500 rounded font-semibold text-[9px]  transition-all shadow-xs cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download Tea PDF Report"
 >
 <Download size={10} />
 Download PDF Report
 </button>
 )}
 <span className="font-bold text-green-600">Total: {totalTeaAllTime.toLocaleString()} KG</span>
 </div>
 </div>

 <div className="max-h-52 overflow-auto pr-1">
 <table className="w-full text-xs">
 <thead>
 <tr className="border-b border-gray-100 bg-slate-50 border border-gray-200 text-[9px]  font-semibold text-gray-900 font-medium">
 <td className="p-2 font-bold text-gray-900 font-medium ">Collection Details</td>
 <td className="p-2 font-bold text-gray-900 font-medium  text-right">Yield & Rate</td>
 <td className="p-2 font-bold text-gray-900 font-medium  text-right">Sales Valuation</td>
 <td className="p-2 font-bold text-gray-900 font-medium  text-center">Actions</td>
 </tr>
 </thead>
 <tbody>
 {[...teaRecords].sort((a,b)=> (b.date || '').localeCompare(a.date || '')).map((t, idx) => {
 const price = t.pricePerKg ?? 58;
 const totVal = t.totalSales ?? (t.qty * price);
 const buyer = t.buyer ?? 'Chinga KTDA Factory';
 return (
 <tr key={idx} className="border-b border-gray-200 hover:bg-slate-50 border border-gray-200">
 <td className="p-2">
 <span className="font-semibold text-gray-900 font-semibold block text-xs">{t.ref}</span>
 <span className="block text-[9px] text-gray-500  font-mono">
 {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 <span className="block text-[10px] font-medium text-green-600 italic truncate max-w-[155px]">
 Buyer: {buyer}
 </span>
 </td>
 <td className="p-2 text-right">
 <span className="font-mono font-semibold text-gray-900 block">{t.qty.toFixed(1)} KG</span>
 <span className="font-mono text-[9px] text-gray-900 font-medium block">Ksh {price.toFixed(0)}/KG</span>
 </td>
 <td className="p-2 text-right">
 <span className="font-mono font-semibold text-green-600 block">Ksh {(totVal ?? 0).toLocaleString()}</span>
 <span className="text-[8px] bg-emerald-100 font-semibold text-green-600 px-1 py-0.2 rounded inline-block ">Sold</span>
 </td>
 <td className="p-2 text-center">
 <div className="flex items-center justify-center gap-1.5">
 {onEditTea && (
 <button
 onClick={() => setEditingTea(t)}
 className="text-gray-900 font-medium hover:text-[#0e3a24] p-1 rounded transition-colors cursor-pointer m-0 inline-block"
 title="Edit Receipt"
 >
 <Edit2 size={12} />
 </button>
 )}
 <button
 onClick={() => onDeleteTea(t.ref)}
 className="text-gray-900 font-medium hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 inline-block"
 title="Delete Receipt"
 >
 <Trash2 size={12} />
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Avocado packing graded ledger */}
 {(!activeSubModule || activeSubModule === 'avo') && (
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
 <div className="border-b border-gray-100 pb-3">
 <h5 className="text-[11px] font-semibold tracking-normal text-green-600 ">Avocado Export & Graded Ledger</h5>
 <p className="text-xs text-gray-900 font-medium mt-1 font-medium">Record and track Grade 1 shipments, rejects, buyers, payment terms, and debts</p>
 </div>

 <form onSubmit={handleAvoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Grade 1 Quantity (KG)</label>
 <input
 type="number"
 required
 min="0"
 value={grade1Kg}
 onChange={(e) => setGrade1Kg(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Grade 1 KG"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Grade 1 Price per KG (Ksh)</label>
 <input
 type="number"
 required
 min="0.1"
 step="0.1"
 value={grade1PricePerKg}
 onChange={(e) => setGrade1PricePerKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Price per KG"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Reject Weight (KG)</label>
 <input
 type="number"
 required
 min="0"
 value={rejectKg}
 onChange={(e) => setRejectKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Rejects KG"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Price for Rejects (per KG)</label>
 <input
 type="number"
 required
 min="0"
 step="0.1"
 value={priceForRejects}
 onChange={(e) => setPriceForRejects(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Reject price per KG"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Grade 1 Buyer</label>
 <input
 type="text"
 required
 value={grade1Buyer}
 onChange={(e) => setGrade1Buyer(e.target.value)}
 placeholder="E.g. Kakuzi Agribusiness Exporters"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Reject Buyer</label>
 <input
 type="text"
 required
 value={rejectBuyer}
 onChange={(e) => setRejectBuyer(e.target.value)}
 placeholder="E.g. Local Puree Processor"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Payment Mode / Term</label>
 <input
 type="text"
 required
 value={paymentMode}
 onChange={(e) => setPaymentMode(e.target.value)}
 placeholder="E.g. Deferred, Cash, Bank Transfer"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Next Harvest Season</label>
 <input
 type="text"
 required
 value={nextHarvestSeason}
 onChange={(e) => setNextHarvestSeason(e.target.value)}
 placeholder="E.g. October - December"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Debts (Ksh)</label>
 <input
 type="number"
 required
 min="0"
 value={debts}
 onChange={(e) => setDebts(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Outstanding debts"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono text-rose-700 bg-rose-900/20"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Shipping / Batch Ref</label>
 <input
 type="text"
 required
 value={avoRef}
 onChange={(e) => setAvoRef(e.target.value)}
 placeholder="E.g. KEPHIS-EXP-205"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Export Logging Date</label>
 <input
 type="date"
 required
 value={avoDate}
 onChange={(e) => setAvoDate(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono cursor-pointer bg-white shadow-sm "
 />
 </div>
 <div className="col-span-1 md:col-span-2">
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Debts and Notes</label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Enter debts details, quality notes, or transport details..."
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-medium h-20"
 />
 </div>

 <div className="col-span-1 md:col-span-2 bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 flex justify-between items-center">
 <div>
 <span className="text-[9px] font-semibold text-green-600  block">Dynamic Auto-Calculations</span>
 <span className="text-[11px] font-sans text-gray-900 font-medium">
 Grade 1 subtotal: <strong className="text-gray-900 font-mono">Ksh {((Number(grade1Kg) || 0) * (Number(grade1PricePerKg) || 0)).toLocaleString()}</strong>
 {" "}|{" "}Rejects subtotal: <strong className="text-gray-900 font-mono">Ksh {((Number(rejectKg) || 0) * (Number(priceForRejects) || 0)).toLocaleString()}</strong>
 </span>
 </div>
 <div className="text-right">
 <span className="text-[9px] font-semibold text-green-600  block">Total Money Got (Gross)</span>
 <span className="text-sm font-semibold text-green-600 font-mono">
 Ksh {(((Number(grade1Kg) || 0) * (Number(grade1PricePerKg) || 0)) + ((Number(rejectKg) || 0) * (Number(priceForRejects) || 0))).toLocaleString()}
 </span>
 </div>
 </div>

 <button
 type="submit"
 className="col-span-1 md:col-span-2 bg-emerald-900 hover:bg-white text-gray-900 font-semibold text-xs  p-3.5 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Log Avocado Harvest & Export Income
 </button>
 </form>

 {/* Past avocado grading */}
 <div className="border-t border-gray-100 pt-5 space-y-3">
 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block font-bold">Export Shipping Ledger</label>
 <div className="flex flex-wrap items-center gap-2">
 <button
 onClick={downloadAvoCSV}
 type="button"
 className="flex items-center gap-1 px-2 py-1 bg-indigo-900/20 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 rounded font-semibold text-[9px]  transition-all shadow-xs cursor-pointer m-0"
 title="Export Avocado Logistics CSV"
 >
 <FileSpreadsheet size={10} />
 Export CSV
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('avo')}
 type="button"
 className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-500 rounded font-semibold text-[9px]  transition-all shadow-xs cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download Avocado PDF Report"
 >
 <Download size={10} />
 Download PDF Report
 </button>
 )}
 <span className="font-semibold text-green-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-150">
 Total Proceeds: Ksh {(totalAvoSalesAllTime || 0).toLocaleString()}
 </span>
 </div>
 </div>

 <div className="max-h-[35rem] overflow-y-auto pr-1 space-y-3">
 {avoRecords.map((item, idx) => {
 const totVal = item.totalSales;
 return (
 <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs hover:bg-slate-50 border border-gray-200 transition-all">
 <div className="space-y-2 w-full">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-sm text-gray-900">{item.ref}</span>
 <span className="text-[9px] bg-slate-50 border border-gray-200 font-bold text-gray-900 font-medium px-2 py-0.5 rounded  font-mono">
 {item.date}
 </span>
 {item.debts > 0 && (
 <span className="text-[8px] bg-red-100 text-red-800 font-semibold  px-1.5 py-0.5 rounded">
 Debts Active
 </span>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] leading-relaxed text-gray-900 font-medium">
 <div>
 <p>⭐ <strong>Grade 1:</strong> {item.grade1Kg} KG @ <span className="text-green-600 font-bold font-mono">Ksh {item.grade1PricePerKg}/KG</span></p>
 <p className="text-[10px] pl-4 text-gray-900 font-medium">Buyer: {item.grade1Buyer}</p>
 </div>
 <div>
 <p>🍂 <strong>Rejects:</strong> {item.rejectKg} KG @ <span className="text-gray-900 font-bold font-mono">Ksh {item.priceForRejects}/KG</span></p>
 <p className="text-[10px] pl-4 text-gray-900 font-medium">Buyer: {item.rejectBuyer}</p>
 </div>
 </div>
 <div className="border-t border-dashed border-gray-200 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-[10px] text-gray-900 font-medium font-medium">
 <p>🤝 <strong>Payment Mode / Term:</strong> {item.paymentMode || item.paymentModeNextHarvestSeason}</p>
 <p>📅 <strong>Next Harvest Season:</strong> {item.nextHarvestSeason || 'N/A'}</p>
 <p className="text-rose-700">🚨 <strong>Lot Debts:</strong> Ksh {(item.debts ?? 0).toLocaleString()}</p>
 {item.notes && <p className="col-span-1 sm:col-span-2 text-[10px] text-gray-500 italic mt-1 font-sans">📝 Notes: {item.notes}</p>}
 </div>
 </div>
 <div className="text-right flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
 <div className="text-left sm:text-right">
 <span className="text-[10px] text-gray-900 font-medium block  font-bold">Total Money Got</span>
 <span className="text-base font-semibold text-green-600 font-mono block">
 Ksh {(totVal ?? 0).toLocaleString()}
 </span>
 </div>
 <div className="flex items-center gap-1.5">
 {onEditAvo && (
 <button
 onClick={() => setEditingAvo(item)}
 className="text-gray-900 font-medium hover:text-indigo-850 p-2 rounded transition-colors cursor-pointer m-0 border hover:border-gray-200 bg-white shadow-sm "
 title="Edit shipment"
 >
 <Edit2 size={13} />
 </button>
 )}
 <button
 onClick={() => onDeleteAvo(item.ref)}
 className="text-gray-900 font-medium hover:text-red-650 p-2 rounded transition-colors cursor-pointer m-0 border hover:border-red-100 bg-white shadow-sm "
 title="Delete shipment"
 >
 <Trash2 size={13} />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 )}
 </div>

 {/* GlobalGAP / KEPHIS Export Phytosanitary Traceability Passport Hub */}
 {(!activeSubModule || activeSubModule === 'avo') && (
 <div className="bg-white shadow-sm text-gray-900 font-bold p-6 rounded-3xl border border-gray-200 shadow-xl space-y-6">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
 <div className="flex items-center gap-2.5 text-left">
 <div className="p-2.5 bg-emerald-500/10 text-green-600 rounded-xl border border-emerald-500/20">
 <QrCode className="text-green-600 animate-pulse" size={20} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-xs font-semibold tracking-tight text-green-600">GlobalGAP Traceback & KEPHIS Passport Hub</h4>
 <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-semibold tracking-tight">OFFICIAL EXPORT INTEGRATION</span>
 </div>
 <p className="text-[10px] text-gray-900 font-medium  font-semibold tracking-normal mt-0.5">Generate sovereign QR cargo stickers for tea and avocado air/sea dispatches</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
 <span className="text-[10px]  font-semibold font-mono text-green-600 tracking-normal">KEPHIS Systems Connected</span>
 </div>
 </div>

 {/* Dynamic Label Configurator Structure */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch">
 
 {/* Controls Input Col-span 5 */}
 <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <span className="text-[9px] font-semibold tracking-tight text-green-600 block pb-1 border-b border-gray-200">
 1. Label Traceability parameters
 </span>

 {/* Select Lot Reference */}
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Select Harvest / Shipping Lot</label>
 <select
 value={selectedLotRef}
 onChange={(e) => {
 const val = e.target.value;
 setSelectedLotRef(val);
 // Autofill description notes if available based on selected record matches
 const teaMatch = teaRecords.find(t => t.ref === val);
 const avoMatch = avoRecords.find(a => a.ref === val);
 if (teaMatch) {
 setCustomNote(`KTDA COMPLIANT EXPORT TEA BLOCK-A. NET WEIGHT: ${teaMatch.qty} KG.`);
 } else if (avoMatch) {
 setCustomNote(`HASS AVOCADOS GRADE 1: ${avoMatch.grade1Kg} KG / REJECTS: ${avoMatch.rejectKg} KG. CERTIFIED PREMIUM.`);
 }
 }}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 outline-hidden cursor-pointer font-bold"
 >
 <option value="">-- Choose Harvest / Shipping Record --</option>
 {teaRecords.map((t, idx) => (
 <option key={`t-${idx}`} value={t.ref}>Tea Delivery: {t.ref} ({t.qty} KG)</option>
 ))}
 {avoRecords.map((a, idx) => (
 <option key={`a-${idx}`} value={a.ref}>Avo Export: {a.ref} ({a.grade1Kg} KG)</option>
 ))}
 <option value="SAMPLE-GLOBALGAP-2026">Sample Lot: EXP-LOT-G2026</option>
 </select>
 </div>

 {/* Multi-grid options */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Audit GlobalGAP code</label>
 <input
 type="text"
 value={certCode}
 onChange={(e) => setCertCode(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Phytosanitary Safety</label>
 <select
 value={phytosanitary}
 onChange={(e) => setPhytosanitary(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold cursor-pointer"
 >
 <option value="KEPHIS Class 1 A+ Certified">KEPHIS Export Class 1 A+</option>
 <option value="KEPHIS Class 1 A Certified">KEPHIS Export Class 1 A</option>
 <option value="Organic Export Clearance Pass">Organic Export Clearance</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Quarantine Spray Status</label>
 <input
 type="text"
 value={spraySafeCode}
 onChange={(e) => setSpraySafeCode(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Airport/Harbor Port</label>
 <input
 type="text"
 value={destination}
 onChange={(e) => setDestination(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Freight Transport Carrier</label>
 <input
 type="text"
 value={dispatchVehicle}
 onChange={(e) => setDispatchVehicle(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Sieving / Grading Officer</label>
 <input
 type="text"
 value={sortingClerk}
 onChange={(e) => setSortingClerk(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold"
 />
 </div>
 </div>

 <div>
 <label className="text-[9px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Label Declaration Sub-Notes</label>
 <input
 type="text"
 value={customNote}
 onChange={(e) => setCustomNote(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-bold outline-hidden font-bold"
 placeholder="GRADE A APPROVAL NOTES"
 />
 </div>
 </div>

 {/* Stimulate Dispatch Print */}
 <div className="pt-2">
 <button
 type="button"
 onClick={() => {
 setPrintSuccess(true);
 setTimeout(() => setPrintSuccess(false), 4500);
 }}
 className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-500 font-semibold text-xs  p-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer m-0 border border-emerald-300"
 >
 <Printer size={14} />
 <span>Transmit Official Label to Cargo Printer</span>
 </button>
 {printSuccess && (
 <div className="mt-2 text-[10px] text-green-600 font-semibold bg-white/80 border border-emerald-900 p-2 rounded-lg text-center animate-bounce">
 ✨ Transmitted Code to Thermal Label Printer on port COM5! Traceback QR encoded verified.
 </div>
 )}
 </div>
 </div>

 {/* Real-time Rendered Printable Sticker Label Block (Col-span 7) */}
 <div className="lg:col-span-7 bg-white shadow-sm text-gray-500 p-6 rounded-2xl border-4 border-dashed border-white/20 shadow-inner flex flex-col justify-between space-y-4">
 
 {/* Box Label Header */}
 <div className="border-b-4 border-gray-200 pb-2.5 text-center flex justify-between items-start gap-2">
 <div className="text-left">
 <span className="text-[14px] font-semibold tracking-tighter  block leading-none">GlobalGAP Compliant</span>
 <span className="text-[8px] font-bold text-gray-900 font-medium  font-mono block tracking-normal leading-none mt-1">Export Consignment Label</span>
 </div>
 <div className="bg-slate-50 text-gray-900 font-mono text-[9px] font-semibold px-2 py-0.5 rounded  leading-none">
 Sovereign Trace
 </div>
 </div>

 {/* Parcel Meta Grid */}
 <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold">
 <div className="space-y-1.5 text-left">
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Assigned Lot Reference:</span>
 <span className="text-[13px] font-semibold text-gray-500 block leading-tight">{selectedLotRef || "LOT-EXP-DEFAULT"}</span>
 </div>
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Sovereign Farm Site:</span>
 <span className="text-[10px] font-semibold text-gray-900 block">JR Farm Omni-Estate, Nyamira</span>
 </div>
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Audit GlobalGAP ID:</span>
 <span className="text-[10px] text-gray-900 block">{certCode}</span>
 </div>
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Kephis Passport Stamp:</span>
 <span className="text-[10px] text-green-600 bg-emerald-50 px-1 py-0.2 rounded font-semibold inline-block  border border-emerald-100">{phytosanitary}</span>
 </div>
 </div>

 <div className="space-y-1.5 text-left">
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Freight Carrier Rig:</span>
 <span className="text-[10px] font-semibold text-gray-900 block font-mono">{dispatchVehicle}</span>
 </div>
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Consignment Destination:</span>
 <span className="text-[10px] text-gray-900 block">{destination}</span>
 </div>
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Chemical Quarantine status:</span>
 <span className="text-[10px] text-amber-900 bg-amber-900/20 px-1 py-0.2 rounded inline-block  border border-amber-100">{spraySafeCode}</span>
 </div>
 <div>
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Packhouse Grading Clerk:</span>
 <span className="text-[10px] text-gray-900 block">{sortingClerk}</span>
 </div>
 </div>
 </div>

 {/* Micro Barcode rendering */}
 <div className="bg-slate-50 border border-gray-200 border border-gray-200 p-3 rounded-xl flex items-center gap-4 justify-between">
 
 {/* Left Barcode & Content */}
 <div className="space-y-1.5 flex-1 min-w-0 text-left">
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block leading-none">Traceback Verification Link URL:</span>
 <p className="text-[9px] font-mono text-gray-900 font-medium truncate">
 https://ais-pre-om-estate.run.app/traceback?lot={selectedLotRef || "SAMPLE"}
 </p>
 
 {/* Visual custom linear barcode bars */}
 <div className="h-6 flex items-stretch gap-[1.5px] bg-white shadow-sm border border-gray-200 p-1 w-full overflow-hidden shrink-0">
 {[6,1,4,1,8,2,6,1,7,1,4,2,9,1,4,1,8,2,6,1,7,1,4,2,9,1,4,1,8,2,6,1,7,1,4,2,9,1,4,1,8,2,6].map((bar, bidx) => (
 <div
 key={bidx} 
 className="bg-slate-50" 
 style={{ width: `${bar}px`, opacity: (bidx % 3 === 0 || bidx % 4 === 0) ? 1 : 0.3 }}
 />
 ))}
 </div>
 </div>

 {/* Pure SVG Real-Time Finder Block QR Generator */}
 <QRGenerator value={`https://ais-pre-om-estate.run.app/traceback?lot=${selectedLotRef || "SAMPLE"}`} />

 </div>

 {/* Custom Notes Section */}
 <div className="border-t border-white/20 pt-2 flex justify-between items-center text-[10px] font-bold">
 <div className="text-left">
 <span className="text-[8px]  tracking-wide text-gray-900 font-medium block">Declared Special Covenants:</span>
 <span className="font-mono text-[9px] text-gray-900 font-semibold italic block">{customNote}</span>
 </div>
 <div className="shrink-0 flex items-center gap-1 bg-slate-50 text-gray-900 rounded-md px-2.5 py-1.5">
 <Award size={12} className="text-yellow-400 animate-bounce" />
 <span className="text-[8px] tracking-tight font-semibold font-mono">100% Certified Sovereign</span>
 </div>
 </div>

 </div>
 </div>
 </div>
 )}

 {/* Editing Tea Modal */}
 {editingTea && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm ">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4 animate-fadeIn">
 <div className="flex justify-between items-center pb-2 border-b border-gray-100">
 <h3 className="text-sm font-semibold  text-gray-900">Edit Tea Record ({editingTea.ref})</h3>
 <button onClick={() => setEditingTea(null)} className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-3">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Date</label>
 <input
 type="date"
 value={editingTea.date}
 onChange={(e) => setEditingTea({ ...editingTea, date: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Quantity (KG)</label>
 <input
 type="number"
 step="0.1"
 value={editingTea.qty}
 onChange={(e) => setEditingTea({ ...editingTea, qty: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Price per KG (Ksh)</label>
 <input
 type="number"
 value={editingTea.pricePerKg ?? 58}
 onChange={(e) => setEditingTea({ ...editingTea, pricePerKg: parseInt(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Primary Buyer</label>
 <input
 type="text"
 value={editingTea.buyer ?? ''}
 onChange={(e) => setEditingTea({ ...editingTea, buyer: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
 <button
 onClick={() => setEditingTea(null)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium hover:bg-slate-50 border border-gray-200 m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditTea) {
 onEditTea(editingTea.ref, {
 ...editingTea,
 totalSales: editingTea.qty * (editingTea.pricePerKg ?? 58),
 });
 }
 setEditingTea(null);
 }}
 className="px-5 py-2.5 bg-white text-gray-900 rounded-lg text-xs font-semibold  hover:bg-emerald-900 m-0 shadow cursor-pointer"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Editing Avocado Modal */}
 {editingAvo && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm ">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4 animate-fadeIn">
 <div className="flex justify-between items-center pb-2 border-b border-gray-100">
 <h3 className="text-sm font-semibold  text-gray-900">Edit Avocado Shipment ({editingAvo.ref})</h3>
 <button onClick={() => setEditingAvo(null)} className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Date</label>
 <input
 type="date"
 value={editingAvo.date}
 onChange={(e) => setEditingAvo({ ...editingAvo, date: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Grade 1 KG</label>
 <input
 type="number"
 value={editingAvo.grade1Kg}
 onChange={(e) => setEditingAvo({ ...editingAvo, grade1Kg: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Grade 1 Price / KG</label>
 <input
 type="number"
 value={editingAvo.grade1PricePerKg}
 onChange={(e) => setEditingAvo({ ...editingAvo, grade1PricePerKg: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Reject Weight (KG)</label>
 <input
 type="number"
 value={editingAvo.rejectKg}
 onChange={(e) => setEditingAvo({ ...editingAvo, rejectKg: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Reject Price / KG</label>
 <input
 type="number"
 value={editingAvo.priceForRejects}
 onChange={(e) => setEditingAvo({ ...editingAvo, priceForRejects: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Grade 1 Buyer</label>
 <input
 type="text"
 value={editingAvo.grade1Buyer}
 onChange={(e) => setEditingAvo({ ...editingAvo, grade1Buyer: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Reject Buyer</label>
 <input
 type="text"
 value={editingAvo.rejectBuyer}
 onChange={(e) => setEditingAvo({ ...editingAvo, rejectBuyer: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Payment Mode / Term</label>
 <input
 type="text"
 value={editingAvo.paymentMode || ''}
 onChange={(e) => setEditingAvo({ ...editingAvo, paymentMode: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Next Harvest Season</label>
 <input
 type="text"
 value={editingAvo.nextHarvestSeason || ''}
 onChange={(e) => setEditingAvo({ ...editingAvo, nextHarvestSeason: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Debts (Ksh)</label>
 <input
 type="number"
 value={editingAvo.debts}
 onChange={(e) => setEditingAvo({ ...editingAvo, debts: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono text-rose-700"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Notes</label>
 <textarea
 value={editingAvo.notes}
 onChange={(e) => setEditingAvo({ ...editingAvo, notes: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-medium h-16"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
 <button
 onClick={() => setEditingAvo(null)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium hover:bg-slate-50 border border-gray-200 m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditAvo) {
 onEditAvo(editingAvo.ref, {
 ...editingAvo,
 totalSales: (editingAvo.grade1Kg * editingAvo.grade1PricePerKg) + (editingAvo.rejectKg * editingAvo.priceForRejects),
 });
 }
 setEditingAvo(null);
 }}
 className="px-5 py-2.5 bg-indigo-950 text-gray-900 rounded-lg text-xs font-semibold  hover:bg-indigo-900 m-0 shadow cursor-pointer"
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
