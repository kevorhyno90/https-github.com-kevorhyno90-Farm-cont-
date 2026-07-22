import React, { useState } from 'react';
import { AIRecord, Cow, SemenInventoryItem, CalfRecord, StaffMember } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import { exportToCsv } from '../../utils/csvHelper';
import { jsPDF } from 'jspdf';
import {
  Plus, Search, FileSpreadsheet, Download, FileDown, Shield, TrendingUp, CheckCircle2, FlaskConical, AlertTriangle, PenSquare, Trash2, Calendar
} from 'lucide-react';

interface BreedingLedgerProps {
  cows: Cow[];
  aiRecords: AIRecord[];
  semenInventory?: SemenInventoryItem[];
  staffList: StaffMember[];
  onAddAIRecord: (rec: AIRecord) => void;
  onDeleteAIRecord: (cowId: string, date: string) => void;
  onEditAIRecord?: (cowId: string, date: string, updated: AIRecord) => void;
  onUpdateAIStatus: (cowId: string, date: string, status: AIRecord['status']) => void;
  onAddCalfRecord?: (rec: CalfRecord) => void;
  setSemenInventory?: React.Dispatch<React.SetStateAction<SemenInventoryItem[]>>;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function BreedingLedger({
  cows,
  aiRecords,
  semenInventory = [],
  staffList,
  onAddAIRecord,
  onDeleteAIRecord,
  onEditAIRecord,
  onUpdateAIStatus,
  onAddCalfRecord,
  setSemenInventory,
  onTriggerSectionReport
}: BreedingLedgerProps) {
 const [editingAI, setEditingAI] = useState<AIRecord | null>(null);
 const [aiCowId, setAiCowId] = useState('');
 const [aiDate, setAiDate] = useState(toIsoDate());
 const [aiBull, setAiBull] = useState('');
 const [aiSelectedSemenId, setAiSelectedSemenId] = useState('');
 const [aiCheckDate, setAiCheckDate] = useState('');
 const [aiOrigin, setAiOrigin] = useState('Imported');
 const [aiSemenType, setAiSemenType] = useState('Sexed (Female)');
 const [aiCost, setAiCost] = useState<number | ''>('');
 const [aiNotes, setAiNotes] = useState('');
 const [aiStatus, setAiStatus] = useState<AIRecord['status']>('Pending');
 const [aiCalfName, setAiCalfName] = useState('');
 const [aiCalfSex, setAiCalfSex] = useState<'Male' | 'Female'>('Female');

 const handleDownloadAIPdf = () => {
 const doc = new jsPDF();
 const pageWidth = doc.internal.pageSize.getWidth(); // A4: 210mm
 const pageHeight = doc.internal.pageSize.getHeight(); // A4: 297mm
 const margin = 12;
 const contentWidth = pageWidth - (margin * 2); // 186mm
 
 let pageNumber = 1;
 
 const drawHeader = (pageNum: number) => {
 // Elegant breeding-crimson background brand bar
 doc.setFillColor(153, 27, 27); // red-800
 doc.rect(margin, 12, contentWidth, 24, 'F');
 
 // Title
 doc.setTextColor(255, 255, 255);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(13);
 doc.text('ARTIFICIAL INSEMINATION & BREEDING LEDGER', margin + 6, 21);
 
 // Subtitle
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(8);
 doc.setTextColor(254, 226, 226); // red-100
 const generatedDate = new Date().toLocaleString('en-US', { 
 weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
 hour: '2-digit', minute: '2-digit'
 });
 doc.text(`Generated: ${generatedDate} | Straw Usage & Gestation Timetable | Page ${pageNum}`, margin + 6, 28);
 };
 
 const drawFooter = (pageNum: number) => {
 // Simple hairline divider at footer
 doc.setDrawColor(254, 226, 226); // red-100
 doc.setLineWidth(0.3);
 doc.line(margin, pageHeight - 14, margin + contentWidth, pageHeight - 14);

 doc.setFont('helvetica', 'italic');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184); // slate-400
 doc.text('Sovereign Breeding, Gestation & AI Registry System', margin, pageHeight - 9);
 doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 9);
 };
 
 // Draw initial template
 drawHeader(pageNumber);
 drawFooter(pageNumber);
 
 let y = 43; // spacing from header
 
 // Aggregate Summary counters
 const totalAI = aiRecords.length;
 const confirmedPreg = aiRecords.filter(r => r.status === 'Confirmed Pregnant').length;
 const pendingScan = aiRecords.filter(r => r.status === 'Pending').length;
 const calvedCount = aiRecords.filter(r => r.status === 'Calved').length;
 const failedCount = aiRecords.filter(r => r.status === 'Failed').length;
 const totalStrawCost = aiRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

 // Summary Metrics Banner
 doc.setFillColor(254, 242, 242); // red-50
 doc.rect(margin, y, contentWidth, 28, 'F');
 doc.setDrawColor(252, 165, 165); // red-300
 doc.setLineWidth(0.5);
 doc.rect(margin, y, contentWidth, 28, 'S');
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(8.5);
 doc.setTextColor(153, 27, 27); // red-800
 doc.text('GENETIC REPRODUCTIVE SERVICES AGGREGATE SUMMARY', margin + 6, y + 6);
 
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(185, 28, 28); // red-700
 doc.text('Total Inseminations', margin + 6, y + 13);
 doc.text('Confirmed Pregnant', margin + 40, y + 13);
 doc.text('Pending Check', margin + 74, y + 13);
 doc.text('Calved Successful', margin + 104, y + 13);
 doc.text('Failed Straws', margin + 134, y + 13);
 doc.text('Straw Inv Investment', margin + 158, y + 13);
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(9.5);
 doc.setTextColor(30, 41, 59); // slate-800
 doc.text(`${totalAI} Straws`, margin + 6, y + 21);
 doc.setTextColor(22, 101, 52); // green-800
 doc.text(`${confirmedPreg} Pregnant`, margin + 40, y + 21);
 doc.setTextColor(29, 78, 216); // blue-700
 doc.text(`${pendingScan} Pending`, margin + 74, y + 21);
 doc.setTextColor(107, 33, 168); // purple-800
 doc.text(`${calvedCount} Calved`, margin + 104, y + 21);
 doc.setTextColor(185, 28, 28); // red-700
 doc.text(`${failedCount} Failed`, margin + 134, y + 21);
 doc.setTextColor(15, 23, 42);
 doc.text(`Ksh ${totalStrawCost.toLocaleString()}`, margin + 158, y + 21);
 
 y += 37; // Advance down
 
 // Details header
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(10);
 doc.setTextColor(153, 27, 27);
 doc.text('CHRONOLOGICAL ARTIFICIAL INSEMINATION (AI) LOG REGISTRY', margin, y);
 
 y += 5;
 
 // Draw Table Header Box
 doc.setFillColor(153, 27, 27); // red-800
 doc.rect(margin, y, contentWidth, 8.5, 'F');
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7.5);
 doc.setTextColor(255, 255, 255);
 doc.text('Date Service', margin + 3, y + 5.5);
 doc.text('Cow ID', margin + 28, y + 5.5);
 doc.text('Sire Bull / Straw', margin + 50, y + 5.5);
 doc.text('Breeding Status', margin + 90, y + 5.5);
 doc.text('Return Heat', margin + 120, y + 5.5);
 doc.text('Expected Calving Due', margin + 148, y + 5.5);
 
 y += 8.5;
 
 // Sort items newest first
 const sortedAI = [...aiRecords].sort((a, b) => b.date.localeCompare(a.date));
 
 sortedAI.forEach((item, index) => {
 // Dynamic page breaks
 if (y > pageHeight - 22) {
 doc.addPage();
 pageNumber++;
 drawHeader(pageNumber);
 drawFooter(pageNumber);
 
 y = 43;
 
 // Redraw Table Header on new page
 doc.setFillColor(153, 27, 27);
 doc.rect(margin, y, contentWidth, 8.5, 'F');
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7.5);
 doc.setTextColor(255, 255, 255);
 doc.text('Date Service', margin + 3, y + 5.5);
 doc.text('Cow ID', margin + 28, y + 5.5);
 doc.text('Sire Bull / Straw', margin + 50, y + 5.5);
 doc.text('Breeding Status', margin + 90, y + 5.5);
 doc.text('Return Heat', margin + 120, y + 5.5);
 doc.text('Expected Calving Due', margin + 148, y + 5.5);
 y += 8.5;
 }
 
 // Row alternating color background
 if (index % 2 === 1) {
 doc.setFillColor(254, 252, 252); // red-50/20 alternate
 doc.rect(margin, y, contentWidth, 7.5, 'F');
 }
 
 // Row bottom subtle hairline border
 doc.setDrawColor(254, 242, 242); // red-50
 doc.setLineWidth(0.2);
 doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);
 
 // Row text drawing
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7.5);
 doc.setTextColor(51, 65, 85); // slate-700
 
 const serviceDate = new Date(item.date).toLocaleDateString('en-US', { 
 year: 'numeric', month: 'short', day: 'numeric' 
 });
 doc.text(serviceDate, margin + 3, y + 4.8);
 
 doc.text(item.cowId, margin + 28, y + 4.8);
 
 doc.setFont('helvetica', 'normal');
 const bullDetails = `${item.bull} ${item.semenType ? `(${item.semenType})` : ''}`;
 const truncatedBull = bullDetails.length > 22 ? bullDetails.substring(0, 20) + '..' : bullDetails;
 doc.text(truncatedBull, margin + 50, y + 4.8);
 
 doc.setFont('helvetica', 'bold');
 if (item.status === 'Confirmed Pregnant') {
 doc.setTextColor(22, 101, 52); // green
 doc.text('Pregnant', margin + 90, y + 4.8);
 } else if (item.status === 'Pending') {
 doc.setTextColor(29, 78, 216); // blue
 doc.text('Pending Scan', margin + 90, y + 4.8);
 } else if (item.status === 'Calved') {
 doc.setTextColor(107, 33, 168); // purple
 doc.text('Calved 🍼', margin + 90, y + 4.8);
 } else {
 doc.setTextColor(185, 28, 28); // red
 doc.text('Failed Straw', margin + 90, y + 4.8);
 }
 doc.setTextColor(51, 65, 85);
 doc.setFont('helvetica', 'normal');
 
 const heatStr = item.returnHeatDate ? new Date(item.returnHeatDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
 doc.text(heatStr, margin + 120, y + 4.8);
 
 const dueStr = item.due ? new Date(item.due).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
 doc.setFont('helvetica', 'bold');
 doc.text(dueStr, margin + 148, y + 4.8);
 doc.setFont('helvetica', 'normal');
 
 y += 7.5;
 });
 
 // Save generated PDF file with date stamp
 const fileDateStr = toIsoDate();
 doc.save(`artificial_insemination_breeding_report_${fileDateStr}.pdf`);
 };

 const handleAISubmit = (e: React.FormEvent) => {
 e.preventDefault();

 const selectedSemen = aiSelectedSemenId
 ? semenInventory.find(item => item.id === aiSelectedSemenId)
 : null;

 if (semenInventory.length > 0 && !selectedSemen) {
 alert('Select a tracked semen straw from Genetic Inventory before saving AI service.');
 return;
 }

 const resolvedBull = selectedSemen ? selectedSemen.bullName : aiBull.trim();
 if (!aiCowId.trim() || !aiDate || !resolvedBull) return;

 const serviceDateObj = new Date(aiDate);
 // Estimate due date (standard cow gestation is ~283 days)
 const dueDateObj = new Date(serviceDateObj);
 dueDateObj.setDate(dueDateObj.getDate() + 283);
 const estimatedDue = toIsoDate(dueDateObj);

 // Return heat date is ~21 days after service date
 const returnHeatObj = new Date(serviceDateObj);
 returnHeatObj.setDate(returnHeatObj.getDate() + 21);
 const calculatedReturnHeat = toIsoDate(returnHeatObj);

 onAddAIRecord({
 cowId: aiCowId.trim(),
 date: aiDate,
 bull: resolvedBull,
 semenRefId: selectedSemen?.id,
 due: estimatedDue,
 status: aiStatus,
 checkDate: aiCheckDate || undefined,
 origin: selectedSemen?.origin || aiOrigin,
 semenType: selectedSemen?.semenType || aiSemenType,
 cost: selectedSemen?.cost ?? (aiCost === '' ? undefined : Number(aiCost)),
 returnHeatDate: calculatedReturnHeat,
 calfName: aiCalfName.trim() || undefined,
 notes: aiNotes.trim() || undefined
 });

 // Auto-deduct from linked semen inventory straw count
 if (setSemenInventory && selectedSemen) {
 setSemenInventory(prev => prev.map(item => (
 item.id === selectedSemen.id
 ? { ...item, quantity: Math.max(0, item.quantity - 1) }
 : item
 )));
 }

 // Auto-add calf to registry if calved
 if (aiStatus === 'Calved' && aiCalfName.trim() && onAddCalfRecord) {
 onAddCalfRecord({
 id: `calf-${Date.now()}`,
 calfId: `Calf-${aiCalfName.trim()}`,
 damId: aiCowId.trim(),
 dob: aiDate,
 milkIntakeLiters: 4.0,
 weaned: false,
 notes: `Auto-registered from mother cow ${aiCowId.trim()}'s AI calving confirmation. Notes: ${aiNotes}`,
 date: aiDate,
 calfName: aiCalfName.trim(),
 sex: aiCalfSex
 });
 }

 setAiCowId('');
 setAiDate(toIsoDate());
 setAiBull('');
 setAiSelectedSemenId('');
 setAiCheckDate('');
 setAiOrigin('Imported');
 setAiSemenType('Sexed (Female)');
 setAiCost('');
 setAiNotes('');
 setAiStatus('Pending');
 setAiCalfName('');
 };

 const downloadAICyclesCSV = () => {
 if (aiRecords.length === 0) {
 alert('No AI records found to export. Log insemination cycles first.');
 return;
 }

 let csv = 'data:text/csv;charset=utf-8,';
 csv += 'ARTIFICIAL INSEMINATION AND GESTATION TIMESCALES\n';
 csv += `Generated: ${new Date().toLocaleString()}\n\n`;
 csv += 'Cow Tag ID,Service Date,Bull Name / Semen Reference,Expected Due Date (Gestation),Pregnancy Status\n';
 aiRecords.forEach((cycle) => {
 csv += `"${cycle.cowId}",${cycle.date},"${cycle.bull}",${cycle.due},"${cycle.status}"\n`;
 });
 const encodedUri = encodeURI(csv);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `AI_Breeding_Interventions_${toIsoDate()}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

  return (
    <>
 <div className="space-y-6">
 {/* Header Actions for Breeding Ledger */}
 <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h4 className="text-gray-900 font-semibold text-sm tracking-tight flex items-center gap-1.5 font-bold">
 <FlaskConical size={16} className="text-[#8b0000]" />
 Breeding Registry & AI Ledger
 </h4>
 <p className="text-xs text-gray-900 font-medium font-medium">Download artificial insemination logs, gestation timetables, and PDF reports.</p>
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 <button
 onClick={downloadAICyclesCSV}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-900/20 border border-rose-200 text-rose-950 hover:bg-rose-100 font-semibold text-xs  rounded-xl transition-all shadow-xs cursor-pointer m-0 font-bold"
 title="Download AI Records CSV"
 >
 <FileSpreadsheet size={13} />
 Export AI Logs
 </button>
 <button
 onClick={handleDownloadAIPdf}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-700 hover:bg-red-600 text-gray-900 font-semibold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 border-none font-bold"
 title="Download Artificial Insemination PDF Report"
 >
 <Download size={13} />
 AI PDF Report
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('ai')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-gray-500 font-semibold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download Inseminations PDF Report"
 >
 <Download size={13} />
 Download PDF Report
 </button>
 )}
 </div>
 </div>

 {/* Breeding Ledger (AI Tracker) */}
 <div className="bg-white shadow-sm p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
 <div className="border-b border-gray-100 pb-3">
 <h5 className="text-[11px] font-semibold tracking-normal text-[#8b0000]  flex items-center gap-1">
 <FlaskConical size={12} /> Breeding Ledger
 </h5>
 <p className="text-xs text-gray-900 font-medium mt-1 font-medium">Artificial Insemination (AI) tracker & gestations</p>
 </div>

 <form onSubmit={handleAISubmit} className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Inseminated Cow ID</label>
 {cows.length > 0 ? (
 <select
 required
 value={aiCowId}
 onChange={(e) => setAiCowId(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold bg-white shadow-sm "
 >
 <option value="">-- Choose cow --</option>
 {cows.map(c => (
 <option key={c.id} value={c.id}>{c.id} {c.name ? `(${c.name})` : ''}</option>
 ))}
 </select>
 ) : (
 <input
 type="text"
 required
 value={aiCowId}
 onChange={(e) => setAiCowId(e.target.value)}
 placeholder="E.g. Cow-101 (Daisy)"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 )}
 </div>

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Service Date (Inseminated)</label>
 <input
 type="date"
 required
 value={aiDate}
 onChange={(e) => setAiDate(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Check Date (Scan/Verification)</label>
 <input
 type="date"
 value={aiCheckDate}
 onChange={(e) => setAiCheckDate(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>

 {/* Semen Straw Selector from Genetic Inventory */}
 <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Select Semen Straw (From Genetic Inventory)</label>
 <select
 value={aiSelectedSemenId}
 onChange={(e) => {
 const selectedId = e.target.value;
 setAiSelectedSemenId(selectedId);
 if (selectedId) {
 const item = semenInventory.find(s => s.id === selectedId);
 if (item) {
 setAiBull(item.bullName);
 setAiOrigin(item.origin);
 setAiSemenType(item.semenType);
 setAiCost(item.cost);
 }
 } else {
 setAiBull('');
 setAiOrigin('Imported');
 setAiSemenType('Sexed (Female)');
 setAiCost('');
 }
 }}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold bg-white shadow-sm "
 >
 <option value="">{semenInventory.length > 0 ? '-- Select tracked straw --' : '-- Custom / Manual Entry --'}</option>
 {semenInventory.map(item => (
 <option key={item.id} value={item.id}>
 {item.id} - {item.bullName} ({item.quantity} straws left)
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Bull Name / Semen straw reference</label>
 <input
 type="text"
 required={semenInventory.length === 0}
 value={aiBull}
 onChange={(e) => setAiBull(e.target.value)}
 disabled={semenInventory.length > 0}
 placeholder={semenInventory.length > 0 ? 'Auto-filled from selected tracked straw' : 'E.g. SEMEN-HO-991 (Holstein Elite)'}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono disabled:bg-white border border-gray-200 disabled:text-gray-900 font-medium"
 />
 {semenInventory.length > 0 && (
 <p className="mt-1 text-[10px] font-semibold text-gray-900 font-medium">
 Genetic inventory lock is active. Pick a tracked straw to keep breeding and stock ledgers synchronized.
 </p>
 )}
 </div>
 </div>

 {/* Semen Origin, Type, and Cost */}
 <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Semen Origin</label>
 <input
 type="text"
 required
 value={aiOrigin}
 onChange={(e) => setAiOrigin(e.target.value)}
 placeholder="E.g. KAGRC (Local)"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Semen Type</label>
 <select
 value={aiSemenType}
 onChange={(e) => setAiSemenType(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold bg-white shadow-sm "
 >
 <option value="Sexed (Female)">Sexed (Female)</option>
 <option value="Sexed (Male)">Sexed (Male)</option>
 <option value="Conventional">Conventional</option>
 </select>
 </div>

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Straw Cost (Ksh)</label>
 <input
 type="number"
 value={aiCost}
 onChange={(e) => setAiCost(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="E.g. 1500"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 </div>

 {/* AI pregnancy status and calf option */}
 <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-3">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">AI Straw status</label>
 <select
 value={aiStatus}
 onChange={(e) => setAiStatus(e.target.value as any)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold bg-white shadow-sm "
 >
 <option value="Pending">Pending Scan/Confirmation</option>
 <option value="Confirmed Pregnant">Confirmed Pregnant</option>
 <option value="Calved">Calved Successfully</option>
 <option value="Failed">Straw Failed (Returned to Heat)</option>
 </select>
 </div>

 {aiStatus === 'Calved' && (
 <>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Calf Name (Auto-added to Registry)</label>
 <input
 type="text"
 required
 value={aiCalfName}
 onChange={(e) => setAiCalfName(e.target.value)}
 placeholder="E.g. Precious Junior"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Calf Sex</label>
 <select
 value={aiCalfSex}
 onChange={(e) => setAiCalfSex(e.target.value as any)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold bg-white shadow-sm "
 >
 <option value="Female">Female (Heifer)</option>
 <option value="Male">Male (Bull Calf)</option>
 </select>
 </div>
 </>
 )}
 </div>

 {/* Autocalculated Breeding Dates Alert Panel */}
 {aiDate && (
 <div className="col-span-2 bg-indigo-900/20 p-3.5 rounded-2xl border border-indigo-100/50 flex flex-col sm:flex-row justify-between text-xs font-semibold text-indigo-950 gap-3">
 <div>
 🔄 Expected Return Heat Date: <span className="font-semibold text-rose-800">
 {(() => {
 const d = new Date(aiDate);
 d.setDate(d.getDate() + 21);
 return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
 })()}
 </span> (21-day cycle)
 </div>
 <div>
 🍼 Expected Calving Date: <span className="font-semibold text-indigo-900">
 {(() => {
 const d = new Date(aiDate);
 d.setDate(d.getDate() + 283);
 return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
 })()}
 </span> (283-day gestation)
 </div>
 </div>
 )}

 <div className="col-span-2">
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Insemination Notes</label>
 <textarea
 value={aiNotes}
 onChange={(e) => setAiNotes(e.target.value)}
 placeholder="Notes about the straw batch, sire details, or cow's condition during insemination..."
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-medium h-16"
 />
 </div>

 <button
 type="submit"
 className="col-span-2 bg-rose-950 hover:bg-rose-900 text-gray-900 font-semibold text-xs  p-3.5 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Log AI Breeding Service Straw
 </button>
 </form>

 {/* Dynamic breeding registry table list */}
 <div className="border-t border-gray-100 pt-5 space-y-2">
 <label className="text-[10px] font-semibold text-gray-900 font-medium tracking-tight block mb-2 font-bold">Registered Breeding Gestations</label>
 <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
 {aiRecords.map((cycle, idx) => {
 // Determine gestation safety alerts
 const daysLeft = Math.ceil(
 (new Date(cycle.due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
 );
 const isClose = daysLeft > 0 && daysLeft <= 30;

 return (
 <div key={idx} className="p-3.5 border border-gray-100 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-xs text-gray-900">{cycle.cowId}</span>
 {cycle.status === 'Confirmed Pregnant' && (
 <span className="text-[8px] bg-emerald-150 bg-emerald-100 text-green-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold ">
 Pregnant
 </span>
 )}
 {cycle.status === 'Pending' && (
 <span className="text-[8px] bg-blue-900/20 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-full font-semibold ">
 Awaiting scan
 </span>
 )}
 {cycle.status === 'Calved' && (
 <span className="text-[8px] bg-purple-900/20 text-purple-800 border border-purple-100 px-2 py-0.5 rounded-full font-semibold ">
 Calved
 </span>
 )}
 {cycle.status === 'Failed' && (
 <span className="text-[8px] bg-red-900/20 text-red-800 border border-red-100 px-2 py-0.5 rounded-full font-semibold ">
 Failed Straw
 </span>
 )}
 </div>
 <p className="text-[10px] text-gray-900 font-medium font-bold font-mono ">
 Semen: {cycle.bull} {cycle.semenType ? `(${cycle.semenType})` : ''} {cycle.origin ? `• Origin: ${cycle.origin}` : ''} • Service: {cycle.date}
 </p>
 {cycle.cost && (
 <p className="text-[10px] text-indigo-900 font-semibold font-mono">
 Straw Cost: Ksh {cycle.cost.toLocaleString()}
 </p>
 )}
 <div className="flex flex-wrap gap-1.5 mt-1">
 {cycle.returnHeatDate && (
 <span className="text-[10px] text-rose-700 bg-rose-900/20 border border-rose-100/50 rounded-lg px-2 py-0.5 inline-block font-semibold font-mono">
 🔄 Return Heat: {new Date(cycle.returnHeatDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 )}
 {cycle.checkDate && (
 <span className="text-[10px] text-teal-700 bg-teal-900/20 border border-teal-100/50 rounded-lg px-2 py-0.5 inline-block font-semibold font-mono">
 🔍 Check Date: {new Date(cycle.checkDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 )}
 {cycle.calfName && (
 <span className="text-[10px] text-purple-800 bg-purple-900/20 border border-purple-100/50 rounded-lg px-2 py-0.5 inline-block font-semibold font-mono">
 🍼 Calf: {cycle.calfName}
 </span>
 )}
 </div>
 {cycle.notes && (
 <div className="text-[10px] text-gray-900 font-medium bg-white border border-gray-200 border border-gray-100 rounded-lg p-2 max-w-[450px] italic">
 Notes: {cycle.notes}
 </div>
 )}
 <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
 <Calendar size={12} className="text-rose-700 font-bold shrink-0" />
 <span>Expected Calving: {new Date(cycle.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
 {daysLeft > 0 && (
 <span className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded ${isClose ? 'text-rose-600 bg-rose-900/20' : 'text-gray-900 font-medium bg-white border border-gray-200'}`}>
 ({daysLeft} days)
 </span>
 )}
 </div>
 </div>

 <div className="flex flex-row sm:flex-col items-end gap-2 text-right">
 <span className="text-[10px] text-gray-900 font-medium font-semibold tracking-tight block">Update Status</span>
 <div className="flex items-center gap-2">
 <select
 value={cycle.status}
 onChange={(e) => onUpdateAIStatus(cycle.cowId, cycle.date, e.target.value as any)}
 className="text-[10px] font-semibold  border border-gray-200 rounded p-1.5 bg-white shadow-sm shrink-0 cursor-pointer focus:outline-none"
 >
 <option value="Pending">Pending Scan</option>
 <option value="Confirmed Pregnant">Confirmed</option>
 <option value="Calved">Calved</option>
 <option value="Failed">Straw Failed</option>
 </select>
 {onEditAIRecord && (
 <button
 onClick={() => setEditingAI(cycle)}
 className="text-gray-900 font-medium hover:text-indigo-800 p-1.5 border border-gray-100 hover:bg-white rounded transition-colors cursor-pointer m-0"
 title="Edit Service Record"
 >
 <PenSquare size={13} />
 </button>
 )}
 <button
 onClick={() => onDeleteAIRecord(cycle.cowId, cycle.date)}
 className="text-gray-900 font-medium hover:text-red-655 p-1.5 border border-gray-100 hover:bg-white border border-gray-200 rounded transition-colors cursor-pointer m-0"
 title="Delete Service record"
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
 </div>


 {/* Edit AI Breeding Record Modal */}
 {editingAI && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm font-sans">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-gray-100">
 <h3 className="text-sm font-semibold  text-gray-900">Edit Insemination Log</h3>
 <button onClick={() => setEditingAI(null)} className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Target Cow ID</label>
 <input
 type="text"
 value={editingAI.cowId}
 disabled
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold bg-white border border-gray-200 text-gray-900 font-medium font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Service Date</label>
 <input
 type="date"
 value={editingAI.date}
 disabled
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold bg-white border border-gray-200 text-gray-900 font-medium font-mono"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Bull / Semen Code</label>
 <input
 type="text"
 value={editingAI.bull}
 onChange={(e) => setEditingAI({ ...editingAI, bull: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Scanned Pregnancy Status</label>
 <select
 value={editingAI.status}
 onChange={(e) => setEditingAI({ ...editingAI, status: e.target.value as any })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold bg-white shadow-sm "
 >
 <option value="Pending">Pending Scan</option>
 <option value="Confirmed Pregnant">Confirmed Pregnant</option>
 <option value="Calved">Calved Successfully</option>
 <option value="Failed">Straw Failed (Returned to Heat)</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Semen Origin</label>
 <input
 type="text"
 value={editingAI.origin || ''}
 onChange={(e) => setEditingAI({ ...editingAI, origin: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Semen Type</label>
 <select
 value={editingAI.semenType || 'Conventional'}
 onChange={(e) => setEditingAI({ ...editingAI, semenType: e.target.value as any })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold bg-white shadow-sm "
 >
 <option value="Sexed (Female)">Sexed (Female)</option>
 <option value="Sexed (Male)">Sexed (Male)</option>
 <option value="Conventional">Conventional</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Straw Cost (Ksh)</label>
 <input
 type="number"
 value={editingAI.cost ?? ''}
 onChange={(e) => setEditingAI({ ...editingAI, cost: e.target.value === '' ? undefined : Number(e.target.value) })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Expected Return Heat Date</label>
 <input
 type="date"
 value={editingAI.returnHeatDate || ''}
 onChange={(e) => setEditingAI({ ...editingAI, returnHeatDate: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Expected Calving Date</label>
 <input
 type="date"
 value={editingAI.due}
 onChange={(e) => setEditingAI({ ...editingAI, due: e.target.value })}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 {editingAI.status === 'Calved' && (
 <div>
 <label className="text-[10px] font-semibold text-purple-700  block mb-1">Calf Name (Auto-added to Registry on save)</label>
 <input
 type="text"
 required
 value={editingAI.calfName || ''}
 onChange={(e) => setEditingAI({ ...editingAI, calfName: e.target.value })}
 placeholder="E.g. Precious Junior"
 className="border border-purple-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 )}

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Breeding Notes</label>
 <textarea
 value={editingAI.notes || ''}
 onChange={(e) => setEditingAI({ ...editingAI, notes: e.target.value })}
 placeholder="Notes about the breeding session..."
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-medium h-16"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
 <button
 onClick={() => setEditingAI(null)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium hover:bg-white m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditAIRecord) {
 onEditAIRecord(editingAI.cowId, editingAI.date, editingAI);
 }
 if (editingAI.status === 'Calved' && editingAI.calfName && onAddCalfRecord) {
 onAddCalfRecord({
 id: `calf-${Date.now()}`,
 calfId: `Calf-${editingAI.calfName.trim()}`,
 damId: editingAI.cowId,
 dob: new Date().toISOString().split('T')[0],
 milkIntakeLiters: 4.0,
 weaned: false,
 notes: `Auto-registered from Mother ${editingAI.cowId}'s AI calving edit.`,
 date: new Date().toISOString().split('T')[0],
 calfName: editingAI.calfName.trim(),
 sex: 'Female'
 });
 }
 setEditingAI(null);
 }}
 className="px-5 py-2.5 bg-indigo-950 text-gray-900 rounded-lg text-xs font-semibold  hover:bg-indigo-900 m-0 shadow cursor-pointer"
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
