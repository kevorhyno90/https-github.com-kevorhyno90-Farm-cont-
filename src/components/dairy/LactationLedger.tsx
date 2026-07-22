import React, { useState } from 'react';
import { MilkingRecord, MilkOutflowRecord, Cow } from '../../types';

import { exportToCsv } from '../../utils/csvHelper';
import { jsPDF } from 'jspdf';
import { toIsoDate } from '../../utils/dateHelper';
import { DairyDashboard } from './DairyDashboard';
import { Plus, Download, FileSpreadsheet, FileDown, Edit, Trash2, TrendingUp, Truck, X, Database, PenSquare } from 'lucide-react';

interface LactationLedgerProps {
  staffList: any[];
  milkOutflows: any[];
  aiRecords: any[];
  onTriggerSectionReport: any;
  cows: Cow[];
  milkRecords: MilkingRecord[];
  milkOutflow: MilkOutflowRecord[];
  onAddMilkRecord: (record: MilkingRecord) => void;
  onEditMilkRecord?: (id: string, date: string, record: MilkingRecord) => void;
  onDeleteMilkRecord: (id: string, date: string) => void;
  onAddOutflowRecord: (record: MilkOutflowRecord) => void;
  onEditMilkOutflow: (id: string, record: MilkOutflowRecord) => void;
  onDeleteMilkOutflow: (id: string) => void;
}


function isHighProducer(am: number, pm: number, cowId?: string, cows: any[] = []) {
  const threshold = cowId ? (cows.find((c: any) => c.id.toLowerCase() === cowId.toLowerCase())?.peakYieldTarget || 30) : 30;
  return am + pm >= threshold;
}

export default function LactationLedger({
  staffList,
  milkOutflows,
  aiRecords,
  onTriggerSectionReport,
  cows,
  milkRecords,
  milkOutflow,
  onAddMilkRecord,
  onEditMilkRecord,
  onDeleteMilkRecord,
  onAddOutflowRecord,
  onEditMilkOutflow,
  onDeleteMilkOutflow
}: LactationLedgerProps) {

 const [editingMilk, setEditingMilk] = useState<MilkingRecord | null>(null);
 const [editingOutflow, setEditingOutflow] = useState<MilkOutflowRecord | null>(null);
 const [editNewDebtorName, setEditNewDebtorName] = useState('');
 const [editNewDebtorAmount, setEditNewDebtorAmount] = useState<number | ''>('');
 const [cowTag, setCowTag] = useState('');
 const [amLiters, setAmLiters] = useState<number | ''>('');
 const [pmLiters, setPmLiters] = useState<number | ''>('');
 const [staffName, setStaffName] = useState(staffList[0]?.name || 'Mosoti');
 const [isMilkSold, setIsMilkSold] = useState(true);
 const [milkPrice, setMilkPrice] = useState<number | ''>(52);
 const [milkBuyer, setMilkBuyer] = useState('Brookside Dairy Ltd');
 const [outflowCalf, setOutflowCalf] = useState<number | ''>('');
 const [outflowDebtsList, setOutflowDebtsList] = useState<{ debtor: string; amount: number }[]>([]);
 const [outflowDebtorName, setOutflowDebtorName] = useState('');
 const [outflowDebtorAmount, setOutflowDebtorAmount] = useState<number | ''>('');
 const [showDownloadModal, setShowDownloadModal] = useState(false);
 const [downloadType, setDownloadType] = useState<'csv' | 'pdf'>('pdf');
 const [downloadPeriod, setDownloadPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
 const [milkingDate, setMilkingDate] = useState(toIsoDate());
 const [filterCow, setFilterCow] = useState('');
 const [outflowDate, setOutflowDate] = useState(toIsoDate());
 const [outflowHome, setOutflowHome] = useState<number | ''>('');
 const [outflowWorkers, setOutflowWorkers] = useState<number | ''>('');
 const [outflowSpoiled, setOutflowSpoiled] = useState<number | ''>('');
 const [outflowDebts, setOutflowDebts] = useState<number | ''>('');
 const [outflowCustomer, setOutflowCustomer] = useState('');
 const [outflowNotes, setOutflowNotes] = useState('');
 const [outflowPrice, setOutflowPrice] = useState<number | ''>(52);

 const handleAddDebtorToList = () => {
 if (!outflowDebtorName.trim() || outflowDebtorAmount === '') return;
 setOutflowDebtsList([
 ...outflowDebtsList,
 { debtor: outflowDebtorName.trim(), amount: Number(outflowDebtorAmount) }
 ]);
 setOutflowDebtorName('');
 setOutflowDebtorAmount('');
 };

 const handleRemoveDebtorFromList = (index: number) => {
 setOutflowDebtsList(outflowDebtsList.filter((_, idx) => idx !== index));
 };

 const handleMilkingSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!cowTag.trim() || amLiters === '' || pmLiters === '') return;
 const amVal = Number(amLiters);
 const pmVal = Number(pmLiters);
 const totalVol = amVal + pmVal;

 const prVal = isMilkSold ? (milkPrice === '' ? 52 : Number(milkPrice)) : 0;
 const buyVal = isMilkSold ? (milkBuyer.trim() || 'Brookside Dairy Ltd') : '';

 onAddMilkRecord({
 id: cowTag.trim(),
 am: amVal,
 pm: pmVal,
 staff: staffName,
 date: milkingDate,
 pricePerLiter: prVal,
 buyer: buyVal,
 totalSales: isMilkSold ? (totalVol * prVal) : 0
 });

 setCowTag('');
 setAmLiters('');
 setPmLiters('');
 setMilkingDate(toIsoDate());
 };

 const downloadMilkCSV = () => {
 // Filter data by selected period
 const today = toIsoDate();
 const getStartOfWeek = (d: string) => {
 const date = new Date(d);
 const day = date.getDay();
 const diff = date.getDate() - day + (day === 0 ? -6 : 1);
 return toIsoDate(new Date(date.setDate(diff)));
 };
 const startOfWeek = getStartOfWeek(today);
 const startOfMonth = today.substring(0, 8) + '01';

 const filterFn = (r: { date: string }) => {
 if (downloadPeriod === 'today') return r.date === today;
 if (downloadPeriod === 'week') return r.date >= startOfWeek && r.date <= today;
 if (downloadPeriod === 'month') return r.date >= startOfMonth && r.date <= today;
 return true;
 };

 const targetMilk = milkRecords.filter(filterFn);
 const targetOutflow = milkOutflows.filter(filterFn);

 if (targetMilk.length === 0 && targetOutflow.length === 0) {
 alert('No milk or outflow records exist for the selected period. Adjust the period or log records before exporting.');
 return;
 }

 let csv = 'data:text/csv;charset=utf-8,';
 csv += 'CONSOLIDATED DAIRY PRODUCTION & DISPATCH LEDGER\n';
 csv += `Generated: ${new Date().toLocaleString()} | Period: ${downloadPeriod.toUpperCase()}\n\n`;
 
 csv += '--- DAILY SUMMARIES ---\n';
 csv += 'Date,Total Harvest (L),Home Consumed (L),Workers Consumed (L),Calf Consumed (L),Spoiled (L),Unpaid Debts (Ksh),Total Sales Revenue (Ksh)\n';
 
 const allDatesSet = new Set<string>();
 targetMilk.forEach(r => allDatesSet.add(r.date));
 targetOutflow.forEach(o => allDatesSet.add(o.date));
 const sortedDates = Array.from(allDatesSet).sort((a, b) => b.localeCompare(a));

 sortedDates.forEach((dateKey) => {
 const dayMilks = targetMilk.filter(r => r.date === dateKey);
 const dayOutflow = targetOutflow.find(o => o.date === dateKey);
 
 const yieldVol = dayMilks.reduce((sum, r) => sum + ((r.am ?? 0) + (r.pm ?? 0)), 0);
 const homeL = dayOutflow ? dayOutflow.milkUsedAtHome : 0;
 const workersL = dayOutflow ? dayOutflow.milkUsedByWorkers : 0;
 const calfL = dayOutflow ? (dayOutflow.milkUsedByCalf || 0) : 0;
 const spoiledL = dayOutflow ? dayOutflow.milkSpoiled : 0;
 const debtsKsh = dayOutflow ? dayOutflow.debtsKsh : 0;
 const daySales = dayMilks.reduce((sum, r) => sum + (r.totalSales ?? (((r.am ?? 0) + (r.pm ?? 0)) * (r.pricePerLiter ?? 52))), 0);
 
 csv += `${dateKey},${yieldVol},${homeL},${workersL},${calfL},${spoiledL},${debtsKsh},${daySales}\n`;
 });

 csv += '\n--- INDIVIDUAL COW MILKING RECORDS ---\n';
 csv += 'Date,Cow Tag ID,AM Liters,PM Liters,Total Liters,Staff Officer\n';
 targetMilk.sort((a, b) => b.date.localeCompare(a.date)).forEach((m) => {
 csv += `${m.date},"${m.id}",${m.am ?? 0},${m.pm ?? 0},${((m.am ?? 0) + (m.pm ?? 0)).toFixed(2)},"${m.staff}"\n`;
 });

 const encodedUri = encodeURI(csv);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `Sovereign_Dairy_Consolidated_${downloadPeriod}_${toIsoDate()}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 setShowDownloadModal(false);
 };

 const handleDownloadPdf = () => {
 const doc = new jsPDF();
 const pageWidth = doc.internal.pageSize.getWidth(); // A4: 210mm
 const pageHeight = doc.internal.pageSize.getHeight(); // A4: 297mm
 const margin = 12;
 const contentWidth = pageWidth - (margin * 2); // 186mm
 
 let pageNumber = 1;
 
 const drawHeader = (pageNum: number) => {
 // Sleek background brand bar
 doc.setFillColor(15, 23, 42); // slate-900
 doc.rect(margin, 12, contentWidth, 24, 'F');
 
 // Title
 doc.setTextColor(255, 255, 255);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(13);
 doc.text('CONSOLIDATED MILK LOG & DISPATCH LEDGER', margin + 6, 21);
 
 // Subtitle
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(8);
 doc.setTextColor(203, 213, 225); // slate-300
 const generatedDate = new Date().toLocaleString('en-US', { 
 weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
 hour: '2-digit', minute: '2-digit'
 });
 doc.text(`Generated: ${generatedDate} | Combined Yield & Outflow Registry | Page ${pageNum}`, margin + 6, 28);
 };
 
 const drawFooter = (pageNum: number) => {
 // Simple hairline divider at footer
 doc.setDrawColor(226, 232, 240); // slate-200
 doc.setLineWidth(0.3);
 doc.line(margin, pageHeight - 14, margin + contentWidth, pageHeight - 14);

 doc.setFont('helvetica', 'italic');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184); // slate-400
 doc.text('Sovereign Dairy Milk Log & Dispatch Ledger System', margin, pageHeight - 9);
 doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 9);
 };
 
 // Draw initial template
 drawHeader(pageNumber);
 drawFooter(pageNumber);
 
 let y = 43; // spacing from header
 
 // Aggregate Summary calculation
 const totalHarvest = milkRecords.reduce((sum, r) => sum + ((r.am ?? 0) + (r.pm ?? 0)), 0);
 const totalHome = milkOutflows.reduce((sum, o) => sum + o.milkUsedAtHome, 0);
 const totalWorkers = milkOutflows.reduce((sum, o) => sum + o.milkUsedByWorkers, 0);
 const totalCalves = milkOutflows.reduce((sum, o) => sum + (o.milkUsedByCalf || 0), 0);
 const totalSpoilt = milkOutflows.reduce((sum, o) => sum + o.milkSpoiled, 0);
 const totalDebts = milkOutflows.reduce((sum, o) => sum + o.debtsKsh, 0);
 const totalSales = milkRecords.reduce((sum, r) => sum + (r.totalSales ?? (((r.am ?? 0) + (r.pm ?? 0)) * (r.pricePerLiter ?? 52))), 0);

 // Summary Metrics Banner
 doc.setFillColor(248, 250, 252); // slate-50
 doc.rect(margin, y, contentWidth, 28, 'F');
 doc.setDrawColor(226, 232, 240); // slate-200
 doc.setLineWidth(0.5);
 doc.rect(margin, y, contentWidth, 28, 'S');
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(8.5);
 doc.setTextColor(51, 65, 85); // slate-700
 doc.text('CONSOLIDATED HERD PRODUCTION & DISPATCH YIELD SUMMARY', margin + 6, y + 6);
 
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(100, 116, 139); // slate-500
 doc.text('Total Harvested', margin + 6, y + 13);
 doc.text('Home Consumed', margin + 36, y + 13);
 doc.text('Staff Portions', margin + 66, y + 13);
 doc.text('Calf Consumed', margin + 96, y + 13);
 doc.text('Total Spoilt', margin + 124, y + 13);
 doc.text('Total Debts', margin + 148, y + 13);
 doc.text('Total Sales', margin + 168, y + 13);
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(9.5);
 doc.setTextColor(30, 41, 59); // slate-800
 doc.text(`${totalHarvest.toFixed(1)} L`, margin + 6, y + 21);
 doc.text(`${totalHome.toFixed(1)} L`, margin + 36, y + 21);
 doc.text(`${totalWorkers.toFixed(1)} L`, margin + 66, y + 21);
 doc.text(`${totalCalves.toFixed(1)} L`, margin + 96, y + 21);
 doc.setTextColor(239, 68, 68); // red for spoiled
 doc.text(`${totalSpoilt.toFixed(1)} L`, margin + 124, y + 21);
 doc.setTextColor(245, 158, 11); // amber for debts
 doc.text(`Ksh ${totalDebts.toLocaleString()}`, margin + 148, y + 21);
 doc.setTextColor(16, 185, 129); // emerald-500 for total sales
 doc.text(`Ksh ${totalSales.toLocaleString()}`, margin + 168, y + 21);
 
 y += 37; // Advance down
 
 // Details header
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(10);
 doc.setTextColor(15, 23, 42);
 doc.text('CONSOLIDATED DAILY PRODUCTION YIELDS & DISPATCH ENTRIES', margin, y);
 
 y += 5;
 
 // Draw Table Header Box
 doc.setFillColor(15, 23, 42); // slate-900
 doc.rect(margin, y, contentWidth, 8.5, 'F');
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7.5);
 doc.setTextColor(255, 255, 255);
 doc.text('Date', margin + 3, y + 5.5);
 doc.text('Harvested', margin + 28, y + 5.5);
 doc.text('Home (L)', margin + 49, y + 5.5);
 doc.text('Staff (L)', margin + 67, y + 5.5);
 doc.text('Calf (L)', margin + 85, y + 5.5);
 doc.text('Spoiled (L)', margin + 103, y + 5.5);
 doc.text('Unpaid Debts (Ksh) & Debtor', margin + 121, y + 5.5);
 doc.text('Est. Sales', margin + 160, y + 5.5);
 
 y += 8.5;
 
 // Sort items newest first
 const allDatesSet = new Set<string>();
 milkRecords.forEach(r => allDatesSet.add(r.date));
 milkOutflows.forEach(o => allDatesSet.add(o.date));
 const sortedDates = Array.from(allDatesSet).sort((a, b) => b.localeCompare(a));
 
 sortedDates.forEach((dateKey, index) => {
 // Dynamic page breaks
 if (y > pageHeight - 22) {
 doc.addPage();
 pageNumber++;
 drawHeader(pageNumber);
 drawFooter(pageNumber);
 
 y = 43;
 
 // Redraw Table Header on new page
 doc.setFillColor(15, 23, 42);
 doc.rect(margin, y, contentWidth, 8.5, 'F');
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7.5);
 doc.setTextColor(255, 255, 255);
 doc.text('Date', margin + 3, y + 5.5);
 doc.text('Harvested', margin + 28, y + 5.5);
 doc.text('Home (L)', margin + 49, y + 5.5);
 doc.text('Staff (L)', margin + 67, y + 5.5);
 doc.text('Calf (L)', margin + 85, y + 5.5);
 doc.text('Spoiled (L)', margin + 103, y + 5.5);
 doc.text('Unpaid Debts (Ksh) & Debtor', margin + 121, y + 5.5);
 doc.text('Est. Sales', margin + 160, y + 5.5);
 y += 8.5;
 }
 
 const dayMilks = milkRecords.filter(r => r.date === dateKey);
 const dayOutflow = milkOutflows.find(o => o.date === dateKey);
 
 const yieldVol = dayMilks.reduce((sum, r) => sum + ((r.am ?? 0) + (r.pm ?? 0)), 0);
 const homeL = dayOutflow ? dayOutflow.milkUsedAtHome : 0;
 const workersL = dayOutflow ? dayOutflow.milkUsedByWorkers : 0;
 const calfL = dayOutflow ? (dayOutflow.milkUsedByCalf || 0) : 0;
 const spoiledL = dayOutflow ? dayOutflow.milkSpoiled : 0;
 const debtsKsh = dayOutflow ? dayOutflow.debtsKsh : 0;
 const debtCustomer = dayOutflow ? dayOutflow.debtCustomer : '';
 const daySales = dayMilks.reduce((sum, r) => sum + (r.totalSales ?? (((r.am ?? 0) + (r.pm ?? 0)) * (r.pricePerLiter ?? 52))), 0);
 
 // Row alternating color background
 if (index % 2 === 1) {
 doc.setFillColor(248, 250, 252); // slate-50
 doc.rect(margin, y, contentWidth, 7.5, 'F');
 }
 
 // Row bottom subtle hairline border
 doc.setDrawColor(241, 245, 249); // slate-100
 doc.setLineWidth(0.2);
 doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);
 
 // Row text drawing
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7.5);
 doc.setTextColor(51, 65, 85); // slate-700
 
 const dateString = new Date(dateKey).toLocaleDateString('en-US', { 
 year: 'numeric', month: 'short', day: 'numeric' 
 });
 doc.text(dateString, margin + 3, y + 4.8);
 
 doc.setFont('helvetica', 'normal');
 doc.text(yieldVol > 0 ? `${yieldVol.toFixed(1)} L` : '—', margin + 28, y + 4.8);
 doc.text(homeL > 0 ? `${homeL.toFixed(1)} L` : '—', margin + 49, y + 4.8);
 doc.text(workersL > 0 ? `${workersL.toFixed(1)} L` : '—', margin + 67, y + 4.8);
 doc.text(calfL > 0 ? `${calfL.toFixed(1)} L` : '—', margin + 85, y + 4.8);
 
 if (spoiledL > 0) {
 doc.setTextColor(239, 68, 68);
 doc.text(`${spoiledL.toFixed(1)} L`, margin + 103, y + 4.8);
 doc.setTextColor(51, 65, 85);
 } else {
 doc.text('—', margin + 103, y + 4.8);
 }
 
 if (debtsKsh > 0) {
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(220, 38, 38); // Crimson red
 const debtText = `Ksh ${debtsKsh.toLocaleString()}` + (debtCustomer ? ` (${debtCustomer})` : '');
 const truncatedDebt = debtText.length > 25 ? debtText.substring(0, 23) + '..' : debtText;
 doc.text(truncatedDebt, margin + 121, y + 4.8);
 doc.setTextColor(51, 65, 85);
 doc.setFont('helvetica', 'normal');
 } else {
 doc.text('—', margin + 121, y + 4.8);
 }
 
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(16, 185, 129); // emerald
 doc.text(daySales > 0 ? `Ksh ${daySales.toLocaleString()}` : '—', margin + 160, y + 4.8);
 doc.setTextColor(51, 65, 85);
 doc.setFont('helvetica', 'normal');
 
 y += 7.5;
 });
 
 // Save generated PDF file with date stamp
 const fileDateStr = toIsoDate();
 doc.save(`milk_production_and_dispatch_ledger_${fileDateStr}.pdf`);
 };

 const handleOutflowSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!outflowDate) return;

 // Compile multiple debtors
 const finalDebts = [...outflowDebtsList];
 if (outflowCustomer.trim() && outflowDebts !== '') {
 finalDebts.push({
 debtor: outflowCustomer.trim(),
 amount: Number(outflowDebts)
 });
 }

 const totalDebtsVal = finalDebts.reduce((sum, d) => sum + d.amount, 0);
 const combinedDebtorNames = finalDebts.map(d => `${d.debtor} (Ksh ${d.amount})`).join(', ');

 onAddOutflowRecord({
 id: `mo-${Date.now()}`,
 date: outflowDate,
 milkUsedAtHome: outflowHome === '' ? 0 : Number(outflowHome),
 milkUsedByWorkers: outflowWorkers === '' ? 0 : Number(outflowWorkers),
 milkUsedByCalf: outflowCalf === '' ? 0 : Number(outflowCalf),
 milkSpoiled: outflowSpoiled === '' ? 0 : Number(outflowSpoiled),
 debtsKsh: finalDebts.length > 0 ? totalDebtsVal : 0,
 debtCustomer: finalDebts.length > 0 ? combinedDebtorNames : undefined,
 debtsList: finalDebts.length > 0 ? finalDebts : undefined,
 salesPricePerLiter: outflowPrice === '' ? 52 : Number(outflowPrice),
 notes: outflowNotes.trim() || undefined
 });

 setOutflowHome('');
 setOutflowWorkers('');
 setOutflowCalf('');
 setOutflowSpoiled('');
 setOutflowDebts('');
 setOutflowCustomer('');
 setOutflowDebtsList([]);
 setOutflowNotes('');
 setOutflowPrice(52);
 };
  return (
    <>
 <div className="space-y-8">
 {/* Analytics Dashboard */}
 <DairyDashboard milkRecords={milkRecords} milkOutflows={milkOutflows} aiRecords={aiRecords} cows={cows} />

 {/* Forms Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 
 {/* COLUMN 1: Individual Cow Milking Form */}
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
 <div className="border-b border-gray-100 pb-3">
 <h5 className="text-[11px] font-semibold tracking-normal text-green-600  flex items-center gap-1">
 <TrendingUp size={12} /> Cow Milking Console
 </h5>
 <p className="text-[10px] text-gray-900 font-medium mt-1 font-bold">Record individual morning & afternoon yields</p>
 </div>

 <form onSubmit={handleMilkingSubmit} className="space-y-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Select / Type Cow Tag ID</label>
 {cows.length > 0 ? (
 <select
 required
 value={cowTag}
 onChange={(e) => setCowTag(e.target.value)}
 className="text-xs border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full font-bold bg-white shadow-sm outline-none"
 >
 <option value="">-- Choose registered cow --</option>
 {cows.map(c => (
 <option key={c.id} value={c.id}>{c.id} ({c.name} - {c.status})</option>
 ))}
 </select>
 ) : (
 <input
 type="text"
 required
 value={cowTag}
 onChange={(e) => setCowTag(e.target.value)}
 placeholder="E.g. Cow-104 (Blossom)"
 className="text-xs border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full font-bold outline-none"
 />
 )}
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">AM Liters</label>
 <input
 type="number"
 required
 min="0"
 step="0.1"
 value={amLiters}
 onChange={(e) => setAmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Morning L"
 className="text-xs border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full font-mono font-bold outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">PM Liters</label>
 <input
 type="number"
 required
 min="0"
 step="0.1"
 value={pmLiters}
 onChange={(e) => setPmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Afternoon L"
 className="text-xs border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full font-mono font-bold outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Milking Date</label>
 <input
 type="date"
 required
 value={milkingDate}
 onChange={(e) => setMilkingDate(e.target.value)}
 className="text-xs border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full font-bold font-mono outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Milking Officer</label>
 <select
 value={staffName}
 onChange={(e) => setStaffName(e.target.value)}
 className="text-xs border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full bg-white shadow-sm font-medium text-gray-900 font-semibold outline-none"
 >
 {staffList.map((st) => (
 <option key={st.id} value={st.name}>
 {st.name}
 </option>
 ))}
 </select>
 </div>
 </div>

 <button
 type="submit"
 className="w-full bg-white hover:bg-emerald-900 text-gray-900 font-semibold text-xs  p-3 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Record Cow Yield
 </button>
 </form>
 </div>

 {/* COLUMN 2: Daily Milk Dispatch Form */}
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 text-gray-900">
 <div className="border-b border-gray-200 pb-3">
 <h5 className="text-[11px] font-semibold tracking-normal text-green-600  flex items-center gap-1">
 <Truck size={12} /> Daily Global Dispatch
 </h5>
 <p className="text-[10px] text-gray-900 font-medium mt-1 font-bold">Record consumption, spoils & set today's price</p>
 </div>

 <form onSubmit={handleOutflowSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-1">Dispatch Date</label>
 <input
 type="date"
 required
 value={outflowDate}
 onChange={(e) => setOutflowDate(e.target.value)}
 className="text-xs bg-white border border-gray-200 focus:border-emerald-500 rounded-xl p-3 w-full font-bold font-mono outline-none text-gray-900"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-amber-400 tracking-tight block mb-1">Sales Price / Liter (Ksh)</label>
 <input
 type="number"
 required
 min="1"
 value={outflowPrice}
 onChange={(e) => setOutflowPrice(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="e.g. 52"
 className="text-xs bg-white border border-gray-200 focus:border-amber-500 rounded-xl p-3 w-full font-mono font-bold outline-none text-amber-400"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-gray-200 p-3 rounded-xl bg-white">
 <div>
 <label className="text-[9px] font-semibold text-gray-900 font-medium tracking-tight block mb-1" title="Used at Home">Home (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowHome}
 onChange={(e) => setOutflowHome(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-white shadow-sm border border-gray-200 focus:border-emerald-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-gray-900"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold text-gray-900 font-medium tracking-tight block mb-1" title="Used by Workers">Staff (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowWorkers}
 onChange={(e) => setOutflowWorkers(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-white shadow-sm border border-gray-200 focus:border-emerald-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-gray-900"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold text-gray-900 font-medium tracking-tight block mb-1" title="Consumed by Calf">Calf (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowCalf}
 onChange={(e) => setOutflowCalf(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-white shadow-sm border border-gray-200 focus:border-emerald-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-gray-900"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold text-rose-400 tracking-tight block mb-1" title="Spoiled Milk">Spoilt (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowSpoiled}
 onChange={(e) => setOutflowSpoiled(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-white shadow-sm border border-gray-200 focus:border-rose-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-rose-300"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-2 border border-gray-200 p-3 rounded-xl bg-white">
 <div className="flex justify-between items-center mb-1">
 <label className="text-[9px] font-semibold text-rose-400 tracking-tight block">🚨 Log Debtors (Optional)</label>
 {outflowDebtsList.length > 0 && (
 <span className="text-[9px] font-mono font-semibold text-rose-400">Total: Ksh {outflowDebtsList.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</span>
 )}
 </div>
 <div className="flex gap-2">
 <input
 type="text"
 value={outflowCustomer}
 onChange={(e) => setOutflowCustomer(e.target.value)}
 placeholder="Debtor Name"
 className="text-xs bg-white shadow-sm border border-gray-200 focus:border-emerald-500 rounded-lg p-2 w-full font-bold outline-none text-gray-900"
 />
 <input
 type="number"
 min="0"
 value={outflowDebts}
 onChange={(e) => setOutflowDebts(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="Ksh"
 className="text-xs bg-white shadow-sm border border-gray-200 focus:border-emerald-500 rounded-lg p-2 w-24 font-mono font-bold outline-none text-gray-900"
 />
 <button
 type="button"
 onClick={handleAddDebtorToList}
 className="bg-rose-950 hover:bg-rose-900 text-rose-300 px-3 rounded-lg font-semibold text-[10px]  transition-colors"
 >
 Add
 </button>
 </div>
 {outflowDebtsList.length > 0 && (
 <div className="mt-2 space-y-1">
 {outflowDebtsList.map((d, idx) => (
 <div key={idx} className="flex justify-between items-center bg-white shadow-sm px-2 py-1.5 rounded-lg border border-gray-200">
 <span className="text-[10px] font-bold text-gray-900 font-medium">👤 {d.debtor}</span>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-mono font-semibold text-rose-400">Ksh {d.amount.toLocaleString()}</span>
 <button type="button" onClick={() => handleRemoveDebtorFromList(idx)} className="text-gray-900 font-medium hover:text-red-700"><X size={12}/></button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <button
 type="submit"
 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs  p-3 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Save Daily Dispatch
 </button>
 </form>
 </div>
 </div>

 {/* Unified Ledger Log */}
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
 <div className="flex justify-between items-end border-b border-gray-100 pb-3">
 <div>
 <h5 className="text-[11px] font-semibold tracking-normal text-gray-900  flex items-center gap-1">
 <Database size={12} /> Combined Production & Dispatch Ledger
 </h5>
 <p className="text-[10px] text-gray-900 font-medium mt-1 font-bold">Historical data computed automatically per day</p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => { setDownloadType('csv'); setShowDownloadModal(true); }}
 type="button"
 className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-green-600 rounded-lg font-semibold text-[9px]  transition-all shadow-xs cursor-pointer"
 title="Export Yield History as CSV"
 >
 <FileSpreadsheet size={12} />
 CSV
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => { setDownloadType('pdf'); setShowDownloadModal(true); }}
 type="button"
 className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-500 rounded-lg font-semibold text-[9px]  transition-all shadow-xs cursor-pointer"
 >
 <Download size={12} />
 PDF
 </button>
 )}
 </div>
 </div>

 <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
 {(() => {
 const allDates = Array.from(new Set([...milkRecords.map(r => r.date), ...milkOutflows.map(o => o.date)])).sort((a, b) => b.localeCompare(a));
 
 if (allDates.length === 0) {
 return (
 <div className="text-center py-8 text-gray-900 font-medium font-bold  text-[10px]">
 No production or dispatch records found
 </div>
 );
 }

 return allDates.map(dateStr => {
 const dayMilks = milkRecords.filter(r => r.date === dateStr);
 const dayOutflow = milkOutflows.find(o => o.date === dateStr);
 
 const yieldTotal = dayMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
 const home = dayOutflow ? dayOutflow.milkUsedAtHome : 0;
 const workers = dayOutflow ? dayOutflow.milkUsedByWorkers : 0;
 const calf = dayOutflow ? (dayOutflow.milkUsedByCalf || 0) : 0;
 const spoiled = dayOutflow ? dayOutflow.milkSpoiled : 0;
 const consumed = home + workers + calf + spoiled;
 
 const price = dayOutflow?.salesPricePerLiter ?? 52;
 const netSold = Math.max(0, yieldTotal - consumed);
 const revenue = netSold * price;

 const debtsKsh = dayOutflow ? dayOutflow.debtsKsh : 0;

 return (
 <div key={dateStr} className="bg-white border border-gray-200 border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:border-gray-200 transition-all">
 {/* Day Header */}
 <div className="bg-white border border-gray-200 p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
 <div className="flex items-center gap-3">
 <div className="bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs">
 <span className="font-semibold text-gray-900 text-xs tracking-tight block font-mono">
 {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 </div>
 {dayOutflow && (
 <span className="text-[9px] font-semibold  text-amber-600 bg-amber-900/20 px-2 py-1 rounded-md border border-amber-100">
 Price: Ksh {price}/L
 </span>
 )}
 </div>

 <div className="flex flex-wrap gap-2 text-[10px] font-semibold tracking-tight">
 <span className="bg-white shadow-sm text-gray-900 font-semibold border border-gray-200 px-2 py-1 rounded-md shadow-xs">
 Yield: {yieldTotal.toFixed(1)} L
 </span>
 {consumed > 0 && (
 <span className="bg-amber-900/20 text-amber-700 border border-amber-200 px-2 py-1 rounded-md shadow-xs">
 Dispatch: {consumed.toFixed(1)} L
 </span>
 )}
 <span className="bg-emerald-50 text-green-600 border border-emerald-200 px-2 py-1 rounded-md shadow-xs">
 Net: {netSold.toFixed(1)} L
 </span>
 <span className="bg-emerald-600 text-white border border-emerald-700 px-2 py-1 rounded-md shadow-xs">
 Ksh {revenue.toLocaleString()}
 </span>
 </div>
 </div>

 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Left: Milking Detail */}
 <div className="space-y-2">
 <h6 className="text-[9px] font-semibold  text-gray-900 font-medium tracking-normal mb-2 border-b border-gray-200 pb-1">Cow Yields ({dayMilks.length})</h6>
 {dayMilks.length === 0 ? (
 <span className="text-[10px] text-gray-900 font-medium font-bold italic">No cow records logged.</span>
 ) : (
 <div className="space-y-1.5">
 {dayMilks.map(m => {
 const mTotal = (m.am ?? 0) + (m.pm ?? 0);
 const isHigh = isHighProducer(m.am ?? 0, m.pm ?? 0, m.id, cows);
 return (
 <div key={m.id} className="flex justify-between items-center bg-white shadow-sm p-2 rounded-lg border border-gray-100 shadow-2xs group">
 <div className="flex items-center gap-2">
 <span className="font-bold text-gray-900 text-xs">{m.id}</span>
 {isHigh && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded font-semibold tracking-tight">Peak</span>}
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[9px] font-mono text-gray-900 font-medium">AM:{m.am} PM:{m.pm}</span>
 <span className="text-[10px] font-mono font-semibold text-green-600 bg-emerald-50 px-1.5 py-0.5 rounded">{mTotal.toFixed(1)} L</span>
 {onEditMilkRecord && (
 <button onClick={() => setEditingMilk(m)} className="text-gray-900 font-medium hover:text-green-600 transition-colors opacity-100"><PenSquare size={12}/></button>
 )}
 <button onClick={() => onDeleteMilkRecord(m.id, m.date)} className="text-gray-900 font-medium hover:text-red-500 transition-colors opacity-100"><Trash2 size={12}/></button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Right: Dispatch Detail */}
 <div className="space-y-2">
 <h6 className="text-[9px] font-semibold  text-gray-900 font-medium tracking-normal mb-2 border-b border-gray-200 pb-1">Dispatch & Debts</h6>
 {!dayOutflow ? (
 <span className="text-[10px] text-gray-900 font-medium font-bold italic">No dispatch logged.</span>
 ) : (
 <div className="space-y-2">
 {consumed > 0 && (
 <div className="flex flex-wrap gap-2 text-[9px] font-bold">
 {home > 0 && <span className="bg-blue-900/20 text-blue-700 px-2 py-1 rounded border border-blue-100">🏠 Home: {home}L</span>}
 {workers > 0 && <span className="bg-amber-900/20 text-amber-700 px-2 py-1 rounded border border-amber-100">👥 Staff: {workers}L</span>}
 {calf > 0 && <span className="bg-purple-900/20 text-purple-700 px-2 py-1 rounded border border-purple-100">🍼 Calf: {calf}L</span>}
 {spoiled > 0 && <span className="bg-rose-900/20 text-rose-700 px-2 py-1 rounded border border-rose-100">⚠️ Spoilt: {spoiled}L</span>}
 </div>
 )}
 
 {debtsKsh > 0 && (
 <div className="bg-rose-900/20 p-2 rounded-lg border border-rose-100">
 <span className="text-[9px] font-semibold text-rose-600  tracking-wide block mb-1">Unpaid Debts (Ksh {debtsKsh.toLocaleString()})</span>
 <div className="flex flex-wrap gap-1">
 {dayOutflow.debtsList && dayOutflow.debtsList.length > 0 ? (
 dayOutflow.debtsList.map((d, i) => (
 <span key={i} className="text-[9px] font-mono text-rose-800 bg-white shadow-sm px-1.5 py-0.5 rounded shadow-2xs">👤 {d.debtor}: Ksh {d.amount}</span>
 ))
 ) : (
 <span className="text-[9px] font-mono text-rose-800 bg-white shadow-sm px-1.5 py-0.5 rounded shadow-2xs">👤 {dayOutflow.debtCustomer}</span>
 )}
 </div>
 </div>
 )}

 <div className="flex justify-end gap-3 mt-2 border-t border-gray-100 pt-2">
 {onEditMilkOutflow && (
 <button onClick={() => setEditingOutflow(dayOutflow)} className="text-[9px] text-gray-900 font-medium hover:text-green-600 font-semibold tracking-tight flex items-center gap-1 transition-colors">
 <PenSquare size={10}/> Edit Dispatch
 </button>
 )}
 <button onClick={() => onDeleteMilkOutflow(dayOutflow.id)} className="text-[9px] text-gray-900 font-medium hover:text-red-500 font-semibold tracking-tight flex items-center gap-1 transition-colors">
 <Trash2 size={10}/> Delete Dispatch Log
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
 });
 })()}
 </div>
 </div>
 </div>
 {/* Edit Milking Record Modal */}
 {editingMilk && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm ">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4 animate-fadeIn max-h-[95vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-gray-100">
 <h3 className="text-sm font-semibold  text-gray-900">Edit Milk Record & Dispatch</h3>
 <button onClick={() => setEditingMilk(null)} className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-3 font-sans text-xs">
 
 {/* Primary details */}
 <div className="bg-white border border-gray-200 p-2.5 rounded-2xl space-y-2.5 border border-gray-100">
 <h4 className="font-semibold  text-[9px] text-gray-900 font-medium tracking-normal">1. Production Yield</h4>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Cow / Tag ID</label>
 <input
 type="text"
 value={editingMilk.id}
 disabled
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold bg-white border border-gray-200 text-gray-900 font-medium font-mono"
 />
 </div>
 <div>
 <input
 type="text"
 placeholder="YYYY-MM-DD or DD/MM/YYYY"
 value={''}
 onChange={(e) => undefined}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Record Date</label>
 <input
 type="text"
 value={editingMilk.date}
 onChange={(e) => setEditingMilk({ ...editingMilk, date: e.target.value })}
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold bg-white border border-gray-200 text-gray-900 font-semibold font-mono"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">AM Yield Details (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingMilk.am}
 onChange={(e) => setEditingMilk({ ...editingMilk, am: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">PM Yield Details (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingMilk.pm}
 onChange={(e) => setEditingMilk({ ...editingMilk, pm: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 </div>

 {/* Commercial and Staff details */}
 <div className="bg-white border border-gray-200 p-2.5 rounded-2xl space-y-2.5 border border-gray-100">
 <h4 className="font-semibold  text-[9px] text-gray-900 font-medium tracking-normal">2. Commercial & Buyer</h4>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Price per Liter (Ksh)</label>
 <input
 type="number"
 value={editingMilk.pricePerLiter ?? ''}
 placeholder="e.g. 52"
 onChange={(e) => setEditingMilk({ ...editingMilk, pricePerLiter: parseFloat(e.target.value) || undefined })}
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Buyer / Processor</label>
 <input
 type="text"
 value={editingMilk.buyer ?? ''}
 placeholder="e.g. Brookside Dairy"
 onChange={(e) => setEditingMilk({ ...editingMilk, buyer: e.target.value })}
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Supervising Operator</label>
 <select
 value={editingMilk.staff}
 onChange={(e) => setEditingMilk({ ...editingMilk, staff: e.target.value })}
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold"
 >
 {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
 </select>
 </div>
 </div>



 </div>
 <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
 <button
 onClick={() => setEditingMilk(null)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium hover:bg-white border border-gray-200 m-0 cursor-pointer bg-white shadow-sm "
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditMilkRecord) {
 const price = editingMilk.pricePerLiter ?? 0;
 const totalVol = (editingMilk.am || 0) + (editingMilk.pm || 0);
 const recalculatedSales = totalVol * price;
 const finalRecord = {
 ...editingMilk,
 totalSales: recalculatedSales
 };
 onEditMilkRecord(editingMilk.id, editingMilk.date, finalRecord);
 }
 setEditingMilk(null);
 }}
 className="px-5 py-2.5 bg-indigo-950 text-gray-900 rounded-lg text-xs font-semibold  hover:bg-indigo-900 m-0 shadow cursor-pointer"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}
 {/* Edit Milk Outflow & Dispatch Record Modal */}
 {editingOutflow && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm font-sans">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4 animate-fadeIn max-h-[95vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-gray-100">
 <h3 className="text-sm font-semibold  text-gray-900">Edit Milk Outflow & Dispatch</h3>
 <button onClick={() => setEditingOutflow(null)} className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold m-0 cursor-pointer bg-transparent border-none">✕</button>
 </div>
 
 <div className="space-y-3.5 text-xs">
 {/* Date & Price */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Dispatch Date</label>
 <input
 type="date"
 value={editingOutflow.date}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, date: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white border border-gray-200 text-gray-900 font-semibold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-amber-500  block mb-1">Sales Price / L (Ksh)</label>
 <input
 type="number"
 value={editingOutflow.salesPricePerLiter ?? 52}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, salesPricePerLiter: e.target.value === '' ? undefined : Number(e.target.value) })}
 className="border border-amber-200 rounded-lg p-2.5 w-full text-xs font-bold bg-amber-900/20 text-amber-900 font-mono"
 />
 </div>
 </div>

 {/* Volumes Section */}
 <div className="bg-white border border-gray-200 p-3 rounded-2xl border border-gray-100 space-y-3">
 <h4 className="font-semibold  text-[9px] text-gray-900 font-medium tracking-normal">1. Milk Allocation Volumes (Liters)</h4>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Home Consumed (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkUsedAtHome}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkUsedAtHome: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Workers / Staff Portions (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkUsedByWorkers}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkUsedByWorkers: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Calves Intake (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkUsedByCalf ?? 0}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkUsedByCalf: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Spoiled / Spilt (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkSpoiled}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkSpoiled: parseFloat(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 </div>

 {/* Debtors list and entry */}
 <div className="bg-white border border-gray-200 p-3 rounded-2xl border border-gray-100 space-y-3">
 <div className="flex justify-between items-center">
 <h4 className="font-semibold  text-[9px] text-gray-900 font-medium tracking-normal">2. Unpaid Credit / Debts (Ksh)</h4>
 <span className="text-[9px] font-semibold text-rose-800 bg-rose-900/20 px-2 py-0.5 rounded border border-rose-100">
 Total: Ksh {(editingOutflow.debtsKsh || 0).toLocaleString()}
 </span>
 </div>

 {/* Existing Debtors List */}
 <div className="space-y-1.5 max-h-24 overflow-y-auto">
 {(editingOutflow.debtsList || []).length === 0 ? (
 <div className="text-[10px] text-gray-900 font-medium font-bold italic py-1">No debtors recorded for this dispatch date.</div>
 ) : (
 (editingOutflow.debtsList || []).map((debt, dIdx) => (
 <div key={dIdx} className="flex justify-between items-center bg-white shadow-sm border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-bold">
 <span className="text-gray-900 font-semibold">{debt.debtor}</span>
 <div className="flex items-center gap-2">
 <span className="text-green-600">Ksh {debt.amount}</span>
 <button
 type="button"
 onClick={() => {
 const updatedList = (editingOutflow.debtsList || []).filter((_, i) => i !== dIdx);
 setEditingOutflow({
 ...editingOutflow,
 debtsList: updatedList,
 debtsKsh: updatedList.reduce((sum, d) => sum + d.amount, 0),
 debtCustomer: updatedList.map(d => `${d.debtor} (Ksh ${d.amount})`).join(', ')
 });
 }}
 className="text-red-500 hover:text-red-700 font-semibold text-[10px] m-0 p-0 cursor-pointer bg-transparent border-none"
 >
 ✕
 </button>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Add Debt Input Form inside Edit Modal */}
 <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
 <div>
 <label className="text-[8.5px] font-semibold text-gray-900 font-medium  block mb-1">Add Debtor Customer</label>
 <input
 type="text"
 value={editNewDebtorName}
 onChange={(e) => setEditNewDebtorName(e.target.value)}
 placeholder="E.g. Mama Amara"
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold bg-white shadow-sm "
 />
 </div>
 <div className="flex gap-2 items-end">
 <div className="flex-1">
 <label className="text-[8.5px] font-semibold text-gray-900 font-medium  block mb-1">Debt Ksh</label>
 <input
 type="number"
 value={editNewDebtorAmount}
 onChange={(e) => setEditNewDebtorAmount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
 placeholder="Amount"
 className="border border-gray-200 rounded-lg p-2 w-full text-xs font-bold font-mono bg-white shadow-sm "
 />
 </div>
 <button
 type="button"
 onClick={() => {
 if (!editNewDebtorName.trim() || editNewDebtorAmount === '') return;
 const list = editingOutflow.debtsList || [];
 const updatedList = [...list, { debtor: editNewDebtorName.trim(), amount: Number(editNewDebtorAmount) }];
 setEditingOutflow({
 ...editingOutflow,
 debtsList: updatedList,
 debtsKsh: updatedList.reduce((sum, d) => sum + d.amount, 0),
 debtCustomer: updatedList.map(d => `${d.debtor} (Ksh ${d.amount})`).join(', ')
 });
 setEditNewDebtorName('');
 setEditNewDebtorAmount('');
 }}
 className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]  px-3 py-2 rounded-lg transition-all m-0 cursor-pointer h-[32px] border-none"
 >
 + Add
 </button>
 </div>
 </div>
 </div>

 {/* Notes */}
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Remarks / Dispatch Notes</label>
 <textarea
 value={editingOutflow.notes || ''}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, notes: e.target.value })}
 placeholder="Notes or descriptions about the dispatch allocation..."
 rows={2}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-medium"
 />
 </div>

 </div>

 {/* Modal Actions */}
 <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
 <button
 onClick={() => setEditingOutflow(null)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium hover:bg-white border border-gray-200 m-0 cursor-pointer bg-white shadow-sm "
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditMilkOutflow) {
 onEditMilkOutflow(editingOutflow.id, editingOutflow);
 }
 setEditingOutflow(null);
 }}
 className="px-5 py-2.5 bg-indigo-950 text-gray-900 rounded-lg text-xs font-semibold  hover:bg-indigo-900 m-0 shadow cursor-pointer border-none"
 >
 Save Changes
 </button>
 </div>

 </div>
 </div>
 )}
    </>
  );
}