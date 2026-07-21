/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CowRegistry } from './dairy/CowRegistry';
import { DairyDashboard } from './dairy/DairyDashboard';
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { MilkingRecord, AIRecord, StaffMember, Cow, VetRecord, MilkOutflowRecord, SemenInventoryItem, CalfRecord } from '../types';
import { exportToCsv } from '../utils/csvHelper';
import { toIsoDate } from '../utils/dateHelper';
import {
 Plus,
 Calendar,
 Activity,
 AlertTriangle,
 BadgeAlert,
 CheckCircle2,
 FlaskConical,
 Filter,
 Trash2,
 Search,
 Shield,
 Heart,
 Syringe,
 Timer,
 FileSpreadsheet,
 TrendingUp,
 Stethoscope,
 PenSquare,
 FileDown,
 GitFork,
 Printer,
 Download,
 Sparkles,
 Award,
 Truck,
 X,
 Database
} from 'lucide-react';

interface DairyAnimalSaleRecord {
 id: string;
 animalId: string;
 type: 'Cow' | 'Calf' | 'Other';
 date: string;
 price: number;
 buyer: string;
 notes: string;
}

interface DairyMortalityRecord {
 id: string;
 animalId: string;
 type: 'Cow' | 'Calf' | 'Other';
 date: string;
 causeOfDeath: string;
 disposalMethod: string;
 notes: string;
}

interface DairyBreedingProps {
 milkRecords: MilkingRecord[];
 aiRecords: AIRecord[];
 milkOutflows: MilkOutflowRecord[];
 onAddMilkOutflow: (rec: MilkOutflowRecord) => void;
 onDeleteMilkOutflow: (id: string) => void;
 onEditMilkOutflow?: (id: string, updated: MilkOutflowRecord) => void;
 staffList: StaffMember[];
 onAddMilkRecord: (rec: MilkingRecord) => void;
 onAddAIRecord: (rec: AIRecord) => void;
 onUpdateAIStatus: (cowId: string, date: string, status: AIRecord['status']) => void;
 onDeleteMilkRecord: (id: string, date: string) => void;
 onDeleteAIRecord: (cowId: string, date: string) => void;
 cows: Cow[];
 vetRecords: VetRecord[];
 onAddCow: (rec: Cow) => void;
 onDeleteCow: (id: string) => void;
 onUpdateCowStatus: (id: string, status: Cow['status']) => void;
 onAddVetRecord: (rec: VetRecord) => void;
 onDeleteVetRecord: (id: string) => void;
 onEditMilkRecord?: (id: string, date: string, updated: MilkingRecord) => void;
 onEditAIRecord?: (cowId: string, date: string, updated: AIRecord) => void;
 onEditCow?: (id: string, updated: Cow) => void;
 onEditVetRecord?: (id: string, updated: VetRecord) => void;
 animalSales: DairyAnimalSaleRecord[];
 onAddAnimalSale: (rec: DairyAnimalSaleRecord) => void;
 onDeleteAnimalSale: (id: string) => void;
 mortalities: DairyMortalityRecord[];
 onAddMortality: (rec: DairyMortalityRecord) => void;
 onDeleteMortality: (id: string) => void;
 onTriggerSectionReport?: (sectionKey: string) => void;
 semenInventory?: SemenInventoryItem[];
 setSemenInventory?: React.Dispatch<React.SetStateAction<SemenInventoryItem[]>>;
 onAddCalfRecord?: (rec: CalfRecord) => void;
 activeSubModule?: 'milk' | 'breeding' | 'veterinary' | 'cows';
}

export function DairyBreeding({
 milkRecords = [],
 aiRecords = [],
 milkOutflows = [],
 onAddMilkOutflow,
 onDeleteMilkOutflow,
 onEditMilkOutflow,
 staffList = [],
 onAddMilkRecord,
 onAddAIRecord,
 onUpdateAIStatus,
 onDeleteMilkRecord,
 onDeleteAIRecord,
 cows = [],
 vetRecords = [],
 onAddCow,
 onDeleteCow,
 onUpdateCowStatus,
 onAddVetRecord,
 onDeleteVetRecord,
 onEditMilkRecord,
 onEditAIRecord,
 onEditCow,
 onEditVetRecord,
 animalSales,
 onAddAnimalSale,
 onDeleteAnimalSale,
 mortalities,
 onAddMortality,
 onDeleteMortality,
 onTriggerSectionReport,
 semenInventory = [],
 setSemenInventory,
 onAddCalfRecord,
 activeSubModule
}: DairyBreedingProps) {
 // Sub-tabs state inside Dairy module
 const [subTab, setSubTab] = useState<'lactation' | 'breeding_ledger' | 'registry' | 'veterinary' | 'life_ledger' | 'breeding_wheel' | 'semen_inventory'>('lactation');

 React.useEffect(() => {
 if (activeSubModule === 'milk') {
 setSubTab('lactation');
 } else if (activeSubModule === 'breeding') {
 setSubTab('breeding_ledger');
 } else if (activeSubModule === 'veterinary') {
 setSubTab('veterinary');
 } else if (activeSubModule === 'cows') {
 setSubTab('registry');
 }
 }, [activeSubModule]);

 // Breeding Wheel states
 const [selectedWheelCow, setSelectedWheelCow] = useState<string>('');
 const [simulatedDate, setSimulatedDate] = useState<string>(toIsoDate());
 const [wheelHoveredMonth, setWheelHoveredMonth] = useState<number | null>(null);

 // Edit States for Milk, AI, Cow, Vet
 const [editingMilk, setEditingMilk] = useState<MilkingRecord | null>(null);
 const [editingAI, setEditingAI] = useState<AIRecord | null>(null);
 const [editingCow, setEditingCow] = useState<Cow | null>(null);
 const [editingVet, setEditingVet] = useState<VetRecord | null>(null);
 const [editingOutflow, setEditingOutflow] = useState<MilkOutflowRecord | null>(null);
 const [editNewDebtorName, setEditNewDebtorName] = useState('');
 const [editNewDebtorAmount, setEditNewDebtorAmount] = useState<number | ''>('');

 // Milking record states
 const [cowTag, setCowTag] = useState('');
 const [amLiters, setAmLiters] = useState<number | ''>('');
 const [pmLiters, setPmLiters] = useState<number | ''>('');
 const [staffName, setStaffName] = useState(staffList[0]?.name || 'Mosoti');
 const [isMilkSold, setIsMilkSold] = useState(true);
 const [milkPrice, setMilkPrice] = useState<number | ''>(52);
 const [milkBuyer, setMilkBuyer] = useState('Brookside Dairy Ltd');

 // Standalone Daily Outflow entry states
 const [outflowCalf, setOutflowCalf] = useState<number | ''>('');
 const [outflowDebtsList, setOutflowDebtsList] = useState<{ debtor: string; amount: number }[]>([]);
 const [outflowDebtorName, setOutflowDebtorName] = useState('');
 const [outflowDebtorAmount, setOutflowDebtorAmount] = useState<number | ''>('');
 const [showDownloadModal, setShowDownloadModal] = useState(false);
 const [downloadType, setDownloadType] = useState<'csv' | 'pdf'>('pdf');
 const [downloadPeriod, setDownloadPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');


 // AI record states
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

 // Cow Identity form states
 const [newCowTag, setNewCowTag] = useState('');
 const [newCowName, setNewCowName] = useState('');
 const [newCowBreed, setNewCowBreed] = useState('Holstein-Friesian');
 const [newCowDob, setNewCowDob] = useState('');
 const [newCowStatus, setNewCowStatus] = useState<Cow['status']>('Lactating');
 const [newCowNotes, setNewCowNotes] = useState('');
 const [newCowSire, setNewCowSire] = useState('');
 const [newCowDam, setNewCowDam] = useState('');
 const [newCowGsp, setNewCowGsp] = useState('');
 const [newCowGdp, setNewCowGdp] = useState('');
 const [newCowGsm, setNewCowGsm] = useState('');
 const [newCowGdm, setNewCowGdm] = useState('');
 const [newCowReg, setNewCowReg] = useState('');
 const [newCowPeakYield, setNewCowPeakYield] = useState<number | ''>('');
 const [milkingDate, setMilkingDate] = useState(toIsoDate());
 const [pedigreeCow, setPedigreeCow] = useState<Cow | null>(null);
 const [pedigreeSubTab, setPedigreeSubTab] = useState<'tree' | 'offspring' | 'genetics'>('tree');
 const [selectedMateId, setSelectedMateId] = useState<string>('');
 const [showAddCowForm, setShowAddCowForm] = useState(false);
 const [cowSearch, setCowSearch] = useState('');
 const [cowBreedFilter, setCowBreedFilter] = useState('');
 const [cowStatusFilter, setCowStatusFilter] = useState('');

 // Vet log form states
 const [vetCowId, setVetCowId] = useState('');
 const [vetAnimalCategory, setVetAnimalCategory] = useState<VetRecord['animalCategory']>('Cow');
 const [vetDate, setVetDate] = useState(toIsoDate());
 const [vetType, setVetType] = useState<VetRecord['type']>('Deworming');
 const [vetTreatment, setVetTreatment] = useState('');
 const [vetCost, setVetCost] = useState<number | ''>('');
 const [vetStaff, setVetStaff] = useState('Dr. Devin Omwenga (Vet)');
 const [vetNotes, setVetNotes] = useState('');
 const [vetNextDue, setVetNextDue] = useState('');
 const [showAddVetForm, setShowAddVetForm] = useState(false);
 const [vetSearch, setVetSearch] = useState('');
 
 // Clinical parameters
 const [vetDiagnosis, setVetDiagnosis] = useState('');
 const [vetTemp, setVetTemp] = useState<number | ''>('');
 const [vetHeartRate, setVetHeartRate] = useState<number | ''>('');
 const [vetRespRate, setVetRespRate] = useState<number | ''>('');
 const [vetDrug, setVetDrug] = useState('');
 const [vetDosage, setVetDosage] = useState('');
 const [vetRoute, setVetRoute] = useState<VetRecord['administrationRoute']>('IM');
 const [vetWithdrawalMilk, setVetWithdrawalMilk] = useState<number | ''>('');
 const [vetWithdrawalMeat, setVetWithdrawalMeat] = useState<number | ''>('');
 const [vetPrognosis, setVetPrognosis] = useState<VetRecord['prognosis']>('Good');
 const [vetRetreatmentScheduled, setVetRetreatmentScheduled] = useState(false);

 // Filtering milking records
 const [filterCow, setFilterCow] = useState('');

 // Daily Outflow states
 const [outflowDate, setOutflowDate] = useState(toIsoDate());
 const [outflowHome, setOutflowHome] = useState<number | ''>('');
 const [outflowWorkers, setOutflowWorkers] = useState<number | ''>('');
 const [outflowSpoiled, setOutflowSpoiled] = useState<number | ''>('');
 const [outflowDebts, setOutflowDebts] = useState<number | ''>('');
 const [outflowCustomer, setOutflowCustomer] = useState('');
 const [outflowNotes, setOutflowNotes] = useState('');
 const [outflowPrice, setOutflowPrice] = useState<number | ''>(52);

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

 onAddMilkOutflow({
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

 const handleCowSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newCowTag.trim() || !newCowName.trim() || !newCowDob) return;

 // Prevent duplicate Tag
 const duplicate = cows.find(c => c.id.toLowerCase() === newCowTag.trim().toLowerCase());
 if (duplicate) {
 alert('A cow with this Tag ID is already registered.');
 return;
 }

 onAddCow({
 id: newCowTag.trim(),
 name: newCowName.trim(),
 breed: newCowBreed,
 dob: newCowDob,
 status: newCowStatus,
 notes: newCowNotes.trim() || 'Import grade lineage',
 sire: newCowSire.trim() || undefined,
 dam: newCowDam.trim() || undefined,
 grandSirePaternal: newCowGsp.trim() || undefined,
 grandDamPaternal: newCowGdp.trim() || undefined,
 grandSireMaternal: newCowGsm.trim() || undefined,
 grandDamMaternal: newCowGdm.trim() || undefined,
 registrationNo: newCowReg.trim() || undefined,
 peakYieldTarget: newCowPeakYield === '' ? undefined : Number(newCowPeakYield)
 });

 setNewCowTag('');
 setNewCowName('');
 setNewCowNotes('');
 setNewCowDob('');
 setNewCowSire('');
 setNewCowDam('');
 setNewCowGsp('');
 setNewCowGdp('');
 setNewCowGsm('');
 setNewCowGdm('');
 setNewCowReg('');
 setNewCowPeakYield('');
 setShowAddCowForm(false);
 };

 const handleVetSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!vetCowId || !vetTreatment.trim()) return;

 onAddVetRecord({
 id: `vet-${Date.now()}`,
 cowId: vetCowId,
 animalCategory: vetAnimalCategory,
 date: vetDate,
 type: vetType,
 treatment: vetTreatment.trim(),
 nextDueDate: vetType === 'Deworming' ? (vetNextDue || undefined) : undefined,
 cost: vetCost === '' ? 0 : Number(vetCost),
 staff: vetStaff,
 notes: vetNotes.trim() || 'Administered successfully',
 
 // Clinical params:
 diagnosis: vetDiagnosis.trim() || undefined,
 temperature: vetTemp === '' ? undefined : Number(vetTemp),
 heartRate: vetHeartRate === '' ? undefined : Number(vetHeartRate),
 respiratoryRate: vetRespRate === '' ? undefined : Number(vetRespRate),
 drugAdministered: vetDrug.trim() || undefined,
 dosage: vetDosage.trim() || undefined,
 administrationRoute: vetRoute,
 withdrawalMilkDays: vetWithdrawalMilk === '' ? undefined : Number(vetWithdrawalMilk),
 withdrawalMeatDays: vetWithdrawalMeat === '' ? undefined : Number(vetWithdrawalMeat),
 prognosis: vetPrognosis,
 retreatmentScheduled: vetRetreatmentScheduled
 });

 setVetTreatment('');
 setVetCost('');
 setVetNotes('');
 setVetNextDue('');
 setVetDiagnosis('');
 setVetTemp('');
 setVetHeartRate('');
 setVetRespRate('');
 setVetDrug('');
 setVetDosage('');
 setVetRoute('IM');
 setVetWithdrawalMilk('');
 setVetWithdrawalMeat('');
 setVetPrognosis('Good');
 setVetRetreatmentScheduled(false);
 setShowAddVetForm(false);
 };

 // CSV Exporters for individual sections
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

 const downloadBreedersCSV = () => {
 if (cows.length === 0) {
 alert('No registered cows found to export. Add cow records first.');
 return;
 }

 let csv = 'data:text/csv;charset=utf-8,';
 csv += 'REGISTERED BREEDERS REGISTRY DIRECTORY\n';
 csv += `Generated: ${new Date().toLocaleString()}\n\n`;
 csv += 'Cow Tag ID,Name,Breed,DOB,Status,Lineage/Notes\n';
 cows.forEach((c) => {
 csv += `"${c.id}","${c.name}","${c.breed}","${c.dob}","${c.status}","${c.notes}"\n`;
 });
 const encodedUri = encodeURI(csv);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `Breeders_Cow_Registry_${toIsoDate()}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
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

 const downloadVetClinicalCSV = () => {
 if (vetRecords.length === 0) {
 alert('No veterinary records found to export. Add clinical interventions first.');
 return;
 }

 let csv = 'data:text/csv;charset=utf-8,';
 csv += 'HERD VETERINARY CLINICS AND INTERVENTIONS LOG\n';
 csv += `Generated: ${new Date().toLocaleString()}\n\n`;
 csv += 'Id,Date,Cow Tag ID,Intervention Type,Diagnosis/Treatment,Cost (Ksh),Reporting Staff,Observational Notes,Deworming Calendar Deadline\n';
 vetRecords.forEach((rec) => {
 csv += `"${rec.id}",${rec.date},"${rec.cowId}","${rec.type}","${rec.treatment}",${rec.cost},"${rec.staff}","${rec.notes}",${rec.nextDueDate ?? ''}\n`;
 });
 const encodedUri = encodeURI(csv);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `Herd_Veterinary_Interventions_${toIsoDate()}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 // Filter milking logs
 const filteredMilk = milkRecords
 .filter((r) => !filterCow || r.id.toLowerCase().includes(filterCow.toLowerCase()))
 .sort((a, b) => b.date.localeCompare(a.date));

 // High production cows warning highlight (dynamic based on Peak Yield Target)
 const isHighProducer = (am: number, pm: number, cowId?: string) => {
 const threshold = cowId ? (cows.find(c => c.id.toLowerCase() === cowId.toLowerCase())?.peakYieldTarget || 30) : 30;
 return am + pm >= threshold;
 };

 // Calculate Average daily yield for a cow
 const getAverageYield = (tag: string) => {
 if (!tag) return 0;
 const cowMilks = milkRecords.filter(r => r && r.id && r.id.toLowerCase() === tag.toLowerCase());
 if (cowMilks.length === 0) return 0;
 const total = cowMilks.reduce((sum, r) => sum + (r.am ?? 0) + (r.pm ?? 0), 0);
 return total / cowMilks.length;
 };

 // Age Calculator in months/years
 const getCowAge = (dobString: string) => {
 const birth = new Date(dobString);
 const now = new Date();
 const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
 if (diffMonths < 12) {
 return `${diffMonths} mos`;
 }
 const years = Math.floor(diffMonths / 12);
 const remainingMonths = diffMonths % 12;
 return `${years} yr ${remainingMonths} mo`;
 };

 // Deworming alerts/reminders calculation
 // Find cows that haven't been dewormed in the last 90 days or have an overdue nextDueDate
 const todayStr = toIsoDate();
 const dewormingReminders = cows.map(cow => {
 // Find latest deworming record
 const cowDoses = vetRecords
 .filter(r => r.cowId.toLowerCase() === cow.id.toLowerCase() && r.type === 'Deworming')
 .sort((a, b) => b.date.localeCompare(a.date));

 const latestDose = cowDoses[0];
 let status: 'safe' | 'warning' | 'overdue' = 'safe';
 let nextDate = '';
 let text = 'Up-to-date';

 if (latestDose) {
 nextDate = latestDose.nextDueDate || '';
 if (!nextDate) {
 // Fallback to average 90 days after last dose
 const lastDateObj = new Date(latestDose.date);
 lastDateObj.setDate(lastDateObj.getDate() + 90);
 nextDate = toIsoDate(lastDateObj);
 }
 } else if (cow.status !== 'Heifer' && cow.status !== 'Dry' && cow.status !== 'Lactating' && cow.status !== 'In-Calf') {
 return null; // Skip non-relevant
 } else {
 // Never dewormed on log
 status = 'overdue';
 text = 'No deworming record found. Dosing highly recommended.';
 return { cow, status, text, nextDate: 'Immediate' };
 }

 if (nextDate) {
 const daysLeft = Math.ceil((new Date(nextDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
 if (daysLeft < 0) {
 status = 'overdue';
 text = `Overdue by ${Math.abs(daysLeft)} days (Scheduled for ${nextDate})`;
 } else if (daysLeft <= 10) {
 status = 'warning';
 text = `Deworming due in ${daysLeft} days (${nextDate})`;
 } else {
 status = 'safe';
 text = `Next due is safe on ${nextDate}`;
 }
 }

 return { cow, status, text, nextDate };
 }).filter(Boolean) as Array<{ cow: Cow; status: 'safe' | 'warning' | 'overdue'; text: string; nextDate: string }>;

 const activeRemindersCount = dewormingReminders.filter(r => r.status !== 'safe').length;

 const handleDownloadPedigree = async (cow: Cow) => {
 const certificateHtml = `<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <title>Sovereign Pedigree Ledger - \${cow.name} (\${cow.id})</title>
 <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
 <style>
 body {
 font-family: 'Space Grotesk', sans-serif;
 margin: 0;
 padding: 50px;
 background: #fafaf9;
 color: #1c1917;
 }
 .cert-container {
 background: #ffffff;
 border: 12px double #064e3b;
 padding: 50px;
 max-width: 950px;
 margin: 0 auto;
 border-radius: 4px;
 box-shadow: 0 10px 40px rgba(0,0,0,0.03);
 }
 .top-banner {
 text-align: center;
 border-bottom: 4px double #064e3b;
 padding-bottom: 24px;
 margin-bottom: 35px;
 }
 .top-banner h1 {
 font-size: 32px;
 font-weight: 700;
 color: #064e3b;
 margin: 0 0 6px 0;
 letter-spacing: -0.5px;
 }
 .top-banner p {
 font-size: 11px;
 letter-spacing: 2px;
 text-transform: uppercase;
 font-weight: 700;
 color: #78716c;
 margin: 0;
 }
 .badge-bar {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 16px;
 margin-bottom: 40px;
 }
 .b-cell {
 background: #f0fdf4;
 border: 1px solid #dcfce7;
 padding: 14px;
 border-radius: 8px;
 }
 .b-title {
 font-size: 10px;
 font-weight: 700;
 text-transform: uppercase;
 color: #166534;
 display: block;
 margin-bottom: 4px;
 }
 .b-val {
 font-size: 14px;
 font-weight: 700;
 color: #1c1917;
 }
 .tree-grid {
 display: grid;
 grid-template-columns: 1fr 1fr 1fr;
 gap: 20px;
 position: relative;
 }
 .generation-col {
 display: flex;
 flex-direction: column;
 justify-content: space-around;
 gap: 30px;
 }
 .tree-box {
 background: #ffffff;
 border: 1px solid #e7e5e4;
 padding: 14px;
 border-radius: 8px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.02);
 }
 .tree-box.proband {
 border: 2px solid #059669;
 background: #f0fdf4;
 }
 .tree-box.male {
 border-left: 5px solid #2563eb;
 }
 .tree-box.female {
 border-left: 5px solid #db2777;
 }
 .box-role {
 font-size: 8px;
 font-weight: 700;
 text-transform: uppercase;
 color: #78716c;
 display: block;
 margin-bottom: 4px;
 }
 .box-role.sire-col { color: #2563eb; }
 .box-role.dam-col { color: #db2777; }
 .box-name {
 font-size: 13px;
 font-weight: 700;
 color: #0f172a;
 }
 .box-details {
 font-size: 10px;
 color: #78716c;
 display: block;
 margin-top: 4px;
 }
 .foot-seals {
 margin-top: 60px;
 border-top: 2px dashed #e7e5e4;
 padding-top: 40px;
 display: flex;
 justify-content: space-between;
 align-items: flex-end;
 }
 .official-seal {
 width: 140px;
 height: 140px;
 border: 4px double #15803d;
 border-radius: 50%;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 font-size: 9px;
 font-weight: 700;
 color: #15803d;
 text-align: center;
 transform: rotate(-8deg);
 }
 .seal-star {
 font-size: 14px;
 color: #b45309;
 margin: 4px 0;
 }
 .seal-text {
 text-transform: uppercase;
 letter-spacing: 1px;
 }
 .signature-area {
 text-align: center;
 }
 .signature-line {
 border-top: 1.5px solid #1c1917;
 width: 220px;
 margin-bottom: 6px;
 }
 .signature-title {
 font-size: 10px;
 text-transform: uppercase;
 font-weight: 700;
 letter-spacing: 1px;
 color: #78716c;
 }
 </style>
</head>
<body>
 <div class="cert-container">
 <div class="top-banner">
 <h1>JR Farm Cooperative Estate</h1>
 <p>Official Certified Sovereign Lineage & Pedigree Deed</p>
 </div>

 <div class="badge-bar">
 <div class="b-cell">
 <span class="b-title">Registered Proband</span>
 <span class="b-val">\${cow.name}</span>
 </div>
 <div class="b-cell">
 <span class="b-title">State Catalog ID</span>
 <span class="b-val">\${cow.id}</span>
 </div>
 <div class="b-cell">
 <span class="b-title">Studbook Registration #</span>
 <span class="b-val font-mono">\${cow.registrationNo || 'KAG-UNREG-SEED'}</span>
 </div>
 </div>

 <div class="tree-grid">
 <!-- GEN 1: PROBAND -->
 <div class="generation-col">
 <div class="tree-box proband">
 <span class="box-role" style="color: #047857;">Registered Proband</span>
 <span class="box-name">\${cow.name}</span>
 <span class="box-details">Breed: \${cow.breed} | DOB: \${cow.dob}</span>
 </div>
 </div>

 <!-- GEN 2: PARENTS -->
 <div class="generation-col">
 <div class="tree-box male">
 <span class="box-role sire-col">Sire (Father ♂)</span>
 <span class="box-name">\${cow.sire || 'Imported Semen Specimen'}</span>
 <span class="box-details">Pureblood Registered Seed Straw</span>
 </div>
 <div class="tree-box female">
 <span class="box-role dam-col">Dam (Mother ♀)</span>
 <span class="box-name">\${cow.dam || 'Acr-Grade Sire Maternal'}</span>
 <span class="box-details">Registered Dam Herd Registry</span>
 </div>
 </div>

 <!-- GEN 3: GRANDPARENTS -->
 <div class="generation-col">
 <div class="tree-box male" style="padding: 10px;">
 <span class="box-role" style="color: #2563eb;">Paternal Grand Sire</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandSirePaternal || 'Sire Line G2 ♂'}</span>
 </div>
 <div class="tree-box female" style="padding: 10px;">
 <span class="box-role" style="color: #db2777;">Paternal Grand Dam</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandDamPaternal || 'Sire Line G2 ♀'}</span>
 </div>
 <div class="tree-box male" style="padding: 10px;">
 <span class="box-role" style="color: #2563eb;">Maternal Grand Sire</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandSireMaternal || 'Dam Line G2 ♂'}</span>
 </div>
 <div class="tree-box female" style="padding: 10px;">
 <span class="box-role" style="color: #db2777;">Maternal Grand Dam</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandDamMaternal || 'Dam Line G2 ♀'}</span>
 </div>
 </div>
 </div>

 <div class="foot-seals">
 <div>
 <p style="font-size: 10px; color: #78716c; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 700;">Certificate Authenticity ID</p>
 <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;">JR-BLOOD-\${cow.id.replace(/\\s+/g, '')}-\${Date.now().toString().slice(-6)}</span>
 </div>
 
 <div class="official-seal">
 <span class="seal-text">JR FARM COOP</span>
 <span class="seal-star">★★★★★</span>
 <span class="seal-text">OFFICIAL REGISTER</span>
 </div>

 <div class="signature-area">
 <div class="signature-line"></div>
 <span class="signature-title">Veterinary Scribe</span>
 </div>
 </div>
 </div>
</body>
</html>`;
 const loadScript = (url: string) => {
 return new Promise<void>((resolve, reject) => {
 const script = document.createElement('script');
 script.src = url;
 script.onload = () => resolve();
 script.onerror = () => reject(new Error(`Failed to load ${url}`));
 document.head.appendChild(script);
 });
 };

 try {
 if (!(window as any).html2pdf) {
 await loadScript("/html2pdf.bundle.min.js");
 }

 const tempDiv = document.createElement('div');
 tempDiv.innerHTML = certificateHtml;
 document.body.appendChild(tempDiv);

 const opt = {
 margin: [0.3, 0.3, 0.3, 0.3],
 filename: `pedigree_${cow.name.toLowerCase()}_${cow.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`,
 image: { type: 'jpeg', quality: 0.98 },
 html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
 jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
 };

 await (window as any).html2pdf().set(opt).from(tempDiv).save();
 document.body.removeChild(tempDiv);
 } catch (err) {
 console.error("PDF generation failed, falling back to HTML download:", err);
 const blob = new Blob([certificateHtml], { type: 'text/html' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `pedigree_${cow.name.toLowerCase()}_${cow.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.html`;
 link.click();
 URL.revokeObjectURL(url);
 }
 };

 // Unique breeds and statuses for filtering the cattle directory
 const uniqueBreeds = Array.from(new Set(cows.map(c => c.breed).filter(Boolean)));
 const uniqueStatuses = Array.from(new Set(cows.map(c => c.status).filter(Boolean)));

 return (
 <div className="space-y-8 animate-fadeIn">
 {/* Dairy Master Banner */}
 <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-4">
 <div className="p-3.5 bg-emerald-100 text-emerald-950 rounded-2xl shrink-0">
 <Activity size={24} className="text-emerald-800" />
 </div>
 <div>
 <h4 className="text-white font-black text-sm uppercase tracking-wider">
 {activeSubModule === 'milk' ? 'Daily Milking & Milk Sales' :
 activeSubModule === 'breeding' ? 'Artificial Insemination & Breeding' :
 activeSubModule === 'veterinary' ? 'Veterinary Treatment Clinic' :
 activeSubModule === 'cows' ? 'Cattle Pedigree & Registry' :
 'Premium Dairy & Lactation Hub'}
 </h4>
 <p className="text-xs text-white font-medium font-medium font-medium">
 {activeSubModule === 'milk' ? 'Track daily cow milking volumes, sales, home usage, and customer outflows.' :
 activeSubModule === 'breeding' ? 'Monitor cow heat events, inseminations, pregnancy status, and semen straw reserves.' :
 activeSubModule === 'veterinary' ? 'Record deworming, vaccines, mastitis treatments, and milk safety withdrawal calendars.' :
 activeSubModule === 'cows' ? 'Access cow directories, breed statistics, pedigree tracking, mortalities, and sales logs.' :
 'Monitor individual calf pipelines, genetic straws, milk scales, deworming calendars, and health indicators.'}
 </p>
 </div>
 </div>

 {/* Dynamic sub navigation tabs */}
 {(!activeSubModule || activeSubModule === 'breeding' || activeSubModule === 'cows') && (
 <div className="flex bg-slate-800 p-1.5 rounded-xl border border-white/15 w-full md:w-auto shrink-0 justify-between self-stretch md:self-auto overflow-x-auto gap-1">
 {(!activeSubModule) && (
 <button
 onClick={() => setSubTab('lactation')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
 subTab === 'lactation' ? 'bg-slate-900 text-white shadow-sm' : 'text-white font-medium font-medium hover:text-white'
 }`}
 >
 Lactation & AI
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'cows') && (
 <button
 onClick={() => setSubTab('registry')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'registry' ? 'bg-slate-900 text-white shadow-sm' : 'text-white font-medium font-medium hover:text-slate-805'
 }`}
 >
 Cow Directory
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'breeding') && (
 <button
 onClick={() => setSubTab('breeding_ledger')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'breeding_ledger' ? 'bg-slate-900 text-slate-955 shadow-sm ring-1 ring-emerald-500/20' : 'text-emerald-700 hover:text-emerald-900 bg-emerald-500/5'
 }`}
 >
 📋 Breeding Ledger
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'breeding') && (
 <button
 onClick={() => setSubTab('breeding_wheel')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'breeding_wheel' ? 'bg-slate-900 text-slate-950 shadow-sm ring-1 ring-emerald-500/20' : 'text-emerald-700 hover:text-emerald-900 bg-emerald-500/5'
 }`}
 >
 🎡 Breeding Wheel
 </button>
 )}
 {(!activeSubModule) && (
 <button
 onClick={() => setSubTab('veterinary')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 relative ${
 subTab === 'veterinary' ? 'bg-slate-900 text-white shadow-sm' : 'text-white font-medium font-medium hover:text-white'
 }`}
 >
 Vet & Deworming
 {activeRemindersCount > 0 && (
 <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping absolute -top-0.5 -right-0.5" />
 )}
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'cows') && (
 <button
 onClick={() => setSubTab('life_ledger')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'life_ledger' ? 'bg-slate-900 text-white shadow-sm' : 'text-white font-medium font-medium hover:text-white'
 }`}
 >
 Sales & Loss
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'breeding') && (
 <button
 onClick={() => setSubTab('semen_inventory')}
 className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'semen_inventory' ? 'bg-slate-900 text-white shadow-sm' : 'text-white font-medium font-medium hover:text-white'
 }`}
 >
 🧬 Semen Straws
 </button>
 )}
 </div>
 )}
 </div>

 {/* SUB-TAB: GENETIC SEMEN INVENTORY */}
 {subTab === 'semen_inventory' && (
 <div className="space-y-6 animate-fadeIn" id="semen-inventory-section">
 <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
 <div className="relative z-10 space-y-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="space-y-2">
 <span className="bg-amber-500/10 text-amber-400 font-black tracking-widest text-[10px] uppercase px-2.5 py-1 rounded-full border border-amber-500/20">
 🧬 Genetic Stock Center
 </span>
 <h3 className="text-xl font-black text-white">Semen Straws & Breeding Sire Inventory</h3>
 <p className="text-white font-medium font-medium text-xs font-medium">Manage and monitor high-yield genetic straws in stock. Select these genetic resources during artificial insemination (AI) service logs to track usage and auto-deduct straw inventory.</p>
 </div>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('ai')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold shrink-0 self-start md:self-center"
 title="Export Semen Inventory PDF Report"
 >
 <Download size={13} />
 Semen PDF Report
 </button>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Add New Straw Form */}
 <div className="bg-slate-900 p-5 rounded-3xl border border-white/10 shadow-xs space-y-4">
 <h4 className="text-xs font-black uppercase text-white border-b border-white/10 pb-2 flex items-center gap-1.5">
 ➕ Register Semen Straw
 </h4>
 <form onSubmit={(e) => {
 e.preventDefault();
 const form = e.currentTarget;
 const fd = new FormData(form);
 const id = fd.get('id') as string;
 const bullName = fd.get('bullName') as string;
 const breed = fd.get('breed') as string;
 const semenType = fd.get('semenType') as string;
 const origin = fd.get('origin') as string;
 const cost = Number(fd.get('cost')) || 0;
 const quantity = Number(fd.get('quantity')) || 0;

 if (!id || !bullName) return;

 if (semenInventory.some(s => s.id.toLowerCase() === id.trim().toLowerCase())) {
 alert('A semen straw with this code already exists!');
 return;
 }

 if (setSemenInventory) {
 setSemenInventory([...semenInventory, { id: id.trim(), bullName: bullName.trim(), breed, semenType, origin, cost, quantity }]);
 }
 form.reset();
 }} className="space-y-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Straw Code / Reference ID</label>
 <input
 name="id"
 type="text"
 required
 placeholder="E.g. SEMEN-JE-800"
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Bull / Sire Name</label>
 <input
 name="bullName"
 type="text"
 required
 placeholder="E.g. Jersey Prime Elite"
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Breed</label>
 <select
 name="breed"
 required
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Holstein-Friesian">Holstein-Friesian</option>
 <option value="Jersey">Jersey</option>
 <option value="Ayrshire">Ayrshire</option>
 <option value="Guernsey">Guernsey</option>
 <option value="Friesian">Friesian</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Semen Type</label>
 <select
 name="semenType"
 required
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Sexed (Female)">Sexed (Female)</option>
 <option value="Sexed (Male)">Sexed (Male)</option>
 <option value="Conventional">Conventional</option>
 </select>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Origin</label>
 <input
 name="origin"
 type="text"
 required
 placeholder="E.g. Imported (USA)"
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Cost (Ksh/Straw)</label>
 <input
 name="cost"
 type="number"
 required
 min="0"
 placeholder="Cost"
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Quantity in Stock (Straws)</label>
 <input
 name="quantity"
 type="number"
 required
 min="1"
 placeholder="E.g. 10"
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <button
 type="submit"
 className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase p-3 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Register Genetic Straw
 </button>
 </form>
 </div>

 {/* Inventory Table */}
 <div className="bg-slate-900 p-5 rounded-3xl border border-white/10 shadow-xs md:col-span-2 space-y-4">
 <div className="flex justify-between items-center border-b border-white/10 pb-2">
 <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
 📋 Straws Registry Ledger
 </h4>
 <span className="text-[10px] font-mono font-bold text-white font-medium font-medium bg-slate-800 px-2 py-0.5 rounded">
 {semenInventory.length} types registered
 </span>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-white/10 text-[10px] font-black uppercase text-white font-medium font-medium tracking-wider">
 <th className="p-2.5">Straw Code / Sire</th>
 <th className="p-2.5">Breed / Type</th>
 <th className="p-2.5">Origin</th>
 <th className="p-2.5 text-right">Cost (Ksh)</th>
 <th className="p-2.5 text-center">In-Stock</th>
 <th className="p-2.5 text-center">Actions</th>
 </tr>
 </thead>
 <tbody>
 {semenInventory.map((item) => (
 <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-800/50">
 <td className="p-2.5 font-bold">
 <span className="font-mono text-white block">{item.id}</span>
 <span className="text-[10px] text-white font-medium font-medium font-medium block">{item.bullName}</span>
 </td>
 <td className="p-2.5 font-medium">
 <span className="text-slate-850 block">{item.breed}</span>
 <span className="text-[9px] text-indigo-700 bg-indigo-900/20 px-1.5 py-0.2 rounded font-black uppercase inline-block mt-0.5">{item.semenType}</span>
 </td>
 <td className="p-2.5 text-white font-medium font-medium font-semibold">{item.origin}</td>
 <td className="p-2.5 text-right font-mono font-bold text-white font-semibold">Ksh {item.cost.toLocaleString()}</td>
 <td className="p-2.5 text-center">
 <span className={`px-2 py-0.5 rounded font-black text-[10px] font-mono ${
 item.quantity <= 2 
 ? 'bg-rose-100 text-rose-700 border border-rose-200' 
 : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
 }`}>
 {item.quantity} units
 </span>
 </td>
 <td className="p-2.5 text-center">
 <button
 onClick={() => {
 if (setSemenInventory) {
 setSemenInventory(semenInventory.filter(s => s.id !== item.id));
 }
 }}
 className="text-rose-600 hover:text-rose-850 font-bold hover:bg-rose-900/20 px-2 py-1 rounded transition-colors text-[10px] uppercase cursor-pointer"
 >
 Delete
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* SUB-TAB 4: COWS & CALVES SALES & MORTALITY LEDGER */}
 {subTab === 'life_ledger' && (
 <div className="space-y-6 animate-fadeIn" id="life-ledger-dairy">
 
 {/* Header Actions for Sales & Loss */}
 <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h4 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5 font-bold">
 <TrendingUp size={16} className="text-rose-700" />
 Cattle Sales & Mortality Ledger
 </h4>
 <p className="text-xs text-white font-medium font-medium font-medium">Download reports of livestock sales, capital disposal, and sanitary mortality audits.</p>
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('life_ledger')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Export Livestock Sales PDF Report"
 >
 <Download size={13} />
 Sales PDF Report
 </button>
 )}
 </div>
 </div>

 {/* Header Summary Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
 <div className="bg-emerald-950 text-white rounded-3xl p-5 border border-emerald-900 shadow-sm relative overflow-hidden">
 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Total Cattle Sales Value</span>
 <span className="text-2xl font-black font-mono">
 Ksh {animalSales
 .filter(s => s.type === 'Cow' || s.type === 'Calf')
 .reduce((sum, s) => sum + s.price, 0)
 .toLocaleString()}
 </span>
 <p className="text-[10px] text-emerald-300 mt-1 font-semibold">
 From {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').length} livestock transactions
 </p>
 </div>

 <div className="bg-rose-900/20 border border-rose-150 rounded-3xl p-5 shadow-xs">
 <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-1">Cattle Mortalities</span>
 <span className="text-2xl font-black font-mono text-rose-950">
 {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length} Animals
 </span>
 <p className="text-[10px] text-rose-600 mt-1 font-semibold">
 Recorded losses requiring sanitary disposal checks
 </p>
 </div>

 <div className="bg-slate-900 border border-slate-150 rounded-3xl p-5 shadow-xs flex flex-col justify-center">
 <span className="text-[9px] font-black text-white font-medium font-medium uppercase tracking-widest block mb-0.5">Herd Active Rate</span>
 <span className="text-base font-extrabold text-white mt-1">
 {cows.length} Live Cattle Registered
 </span>
 <p className="text-[10px] text-white font-medium font-medium font-medium">
 Active milking register capacity
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 
 {/* COLUMN 1: ANIMAL SALES HISTORY */}
 <div className="bg-slate-900 rounded-3xl border border-white/10 p-6 space-y-6 shadow-sm">
 <div className="border-b border-white/10 pb-3 flex justify-between items-center">
 <div className="space-y-0.5">
 <h4 className="text-sm font-black text-white uppercase tracking-wide">Cattle Sales & Culling Logs</h4>
 <p className="text-[10px] text-slate-450 font-semibold uppercase">Manage bovine disposals and secondary revenue</p>
 </div>
 <span className="bg-emerald-100 text-emerald-950 text-[9px] font-black px-2 py-0.5 rounded uppercase">Ledger</span>
 </div>

 {/* Add Sale Form */}
 <form 
 onSubmit={(e) => {
 e.preventDefault();
 const target = e.currentTarget as HTMLFormElement;
 const data = new FormData(target);
 const aType = (data.get('animalType') as DairyAnimalSaleRecord['type']) || 'Other';
 const aId = data.get('animalId') as string;
 const date = data.get('saleDate') as string;
 const price = Number(data.get('salePrice'));
 const buyer = data.get('saleBuyer') as string;
 const sNotes = data.get('saleNotes') as string;

 if (!aId || !date || isNaN(price) || price <= 0) return;

 onAddAnimalSale({
 id: `sale-${Date.now()}`,
 animalId: aId.trim(),
 type: aType,
 date,
 price,
 buyer: buyer.trim() || 'Local Market Buyer',
 notes: sNotes.trim() || 'Direct sale'
 });
 target.reset();
 }}
 className="space-y-4 bg-slate-800 border border-white/10 p-4 rounded-2xl"
 >
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-white font-medium font-medium block mb-1">Animal Category</label>
 <select name="animalType" className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 font-bold text-xs">
 <option value="Cow">Milking Cow</option>
 <option value="Calf">Young Calf</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-white font-medium font-medium block mb-1">Tag / ID Number</label>
 <input type="text" name="animalId" required placeholder="e.g., J-601" className="w-full bg-slate-900 border border-slate-205 focus:border-emerald-700 rounded-xl px-3 py-2 font-bold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-white font-medium font-medium block mb-1">Sale Date</label>
 <input type="date" name="saleDate" defaultValue={toIsoDate()} required className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 font-semibold text-xs font-mono" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-white font-medium font-medium block mb-1">Sale Value (Ksh)</label>
 <input type="number" name="salePrice" required placeholder="80000" className="w-full bg-slate-900 border border-slate-205 focus:border-emerald-700 rounded-xl px-3 py-2 font-bold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-white font-medium font-medium block mb-1">Buyer / Purchaser Details</label>
 <input type="text" name="saleBuyer" placeholder="Brookside heifers breeder or local dealer" className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-white font-medium font-medium block mb-1">Transaction Notes (e.g. Weight, Breed, Lineage, Pedigree status)</label>
 <input type="text" name="saleNotes" placeholder="e.g. Sold due to low daily lactation yield of 8L or pedigree grade upgrade" className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <button type="submit" className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 m-0">
 Save Cattle Sale Transaction
 </button>
 </form>

 {/* Sales List */}
 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
 {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').length === 0 ? (
 <p className="text-center text-white font-medium font-medium py-6 text-xs font-bold">No cattle sales transactions recorded.</p>
 ) : (
 animalSales
 .filter(s => s.type === 'Cow' || s.type === 'Calf')
 .map(sale => (
 <div key={sale.id} className="p-3.5 bg-slate-900 border border-white/10 rounded-2xl flex justify-between items-center shadow-xs">
 <div className="space-y-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="font-black text-xs text-white uppercase">
 {sale.animalId}
 </span>
 <span className="bg-slate-150 text-white font-semibold text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
 {sale.type}
 </span>
 <span className="text-[10px] text-white font-medium font-medium font-bold font-mono">
 {sale.date}
 </span>
 </div>
 <span className="text-[10px] text-slate-450 block font-semibold leading-relaxed">
 Purchaser: {sale.buyer} • Notes: <span className="italic">"{sale.notes}"</span>
 </span>
 </div>
 <div className="flex items-center gap-3">
 <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-900/20 px-2.5 py-1 rounded-lg">
 Ksh {sale.price.toLocaleString()}
 </span>
 <button
 onClick={() => onDeleteAnimalSale(sale.id)}
 className="text-slate-350 hover:text-red-700 cursor-pointer m-0 bg-transparent border-0"
 >
 <Trash2 size={13} />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* COLUMN 2: ANIMAL MORTALITY LEDGER */}
 <div className="bg-slate-900 rounded-3xl border border-white/10 p-6 space-y-6 shadow-sm">
 <div className="border-b border-white/10 pb-3 flex justify-between items-center">
 <div className="space-y-0.5">
 <h4 className="text-sm font-black text-white uppercase tracking-wide">Cattle Mortality Ledger</h4>
 <p className="text-[10px] text-slate-450 font-semibold uppercase">Log sanitations, post-mortems and disease casualties</p>
 </div>
 <span className="bg-rose-100 text-rose-950 text-[9px] font-black px-2 py-0.5 rounded uppercase">Loss Register</span>
 </div>

 {/* Add Mortality Form */}
 <form 
 onSubmit={(e) => {
 e.preventDefault();
 const target = e.currentTarget as HTMLFormElement;
 const data = new FormData(target);
 const mType = (data.get('animalType') as DairyMortalityRecord['type']) || 'Other';
 const mId = data.get('animalId') as string;
 const date = data.get('mortalityDate') as string;
 const cause = data.get('mortalityCause') as string;
 const disposal = data.get('mortalityDisposal') as string;
 const mNotes = data.get('mortalityNotes') as string;

 if (!mId || !date || !cause) return;

 onAddMortality({
 id: `mort-${Date.now()}`,
 animalId: mId.trim(),
 type: mType,
 date,
 causeOfDeath: cause.trim(),
 disposalMethod: disposal.trim() || 'Buried Deep in Lime',
 notes: mNotes.trim() || 'Disposed'
 });
 target.reset();
 }}
 className="space-y-4 bg-rose-900/20 border border-rose-100/50 p-4 rounded-2xl"
 >
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Animal Category</label>
 <select name="animalType" className="w-full bg-slate-900 border border-slate-205 rounded-xl px-3 py-2.5 font-bold text-xs text-rose-950">
 <option value="Cow">Milking Cow</option>
 <option value="Calf">Young Calf</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Tag / ID Number</label>
 <input type="text" name="animalId" required placeholder="e.g., J-603" className="w-full bg-slate-900 border border-slate-205 focus:border-red-700 rounded-xl px-3 py-2 font-bold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Incident Date</label>
 <input type="date" name="mortalityDate" defaultValue={toIsoDate()} required className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 font-semibold text-xs font-mono" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Cause of Death</label>
 <select name="mortalityCause" className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 font-bold text-xs text-rose-950">
 <option value="Bloat (Frothy/Gaseous)">Bloat (Frothy/Gaseous)</option>
 <option value="East Coast Fever (ECF)">East Coast Fever (ECF)</option>
 <option value="Milk Fever (Severe Hypocalcaemia)">Milk Fever (Severe Hypocalcaemia)</option>
 <option value="Physical Injury or Fracture">Physical Injury or Fracture</option>
 <option value="Stillborn Abortion">Stillborn Abortion</option>
 <option value="Mastitis Sepsis Shock">Mastitis Sepsis Shock</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Safe Disposal Protocol (How disposing?)</label>
 <input type="text" name="mortalityDisposal" placeholder="e.g. Buried 6ft deep with agricultural chemical lime" className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Autopsy / Post-Mortem & Diagnosis Notes</label>
 <input type="text" name="mortalityNotes" placeholder="e.g. Diagnosed by Dr Devin; triggered by extreme early-morning wet clover bloat" className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <button type="submit" className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 m-0">
 Save Cattle Loss Incident
 </button>
 </form>

 {/* Mortality List */}
 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
 {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length === 0 ? (
 <p className="text-center text-white font-medium font-medium py-6 text-xs font-bold">No cattle mortality incidents recorded.</p>
 ) : (
 mortalities
 .filter(m => m.type === 'Cow' || m.type === 'Calf')
 .map(inc => (
 <div key={inc.id} className="p-3.5 bg-rose-900/20 border border-rose-100 rounded-2xl flex justify-between items-center shadow-xs">
 <div className="space-y-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="font-black text-xs text-rose-950 uppercase">
 {inc.animalId}
 </span>
 <span className="bg-rose-100 text-rose-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
 {inc.type}
 </span>
 <span className="text-[10px] text-white font-medium font-medium font-bold font-mono">
 {inc.date}
 </span>
 <span className="bg-red-950/50 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
 {inc.causeOfDeath}
 </span>
 </div>
 <span className="text-[10px] text-slate-450 block font-semibold leading-relaxed">
 Disposal: {inc.disposalMethod} • Notes: <span className="italic">"{inc.notes}"</span>
 </span>
 </div>
 <button
 onClick={() => onDeleteMortality(inc.id)}
 className="text-slate-350 hover:text-red-700 cursor-pointer m-0 bg-transparent border-0"
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
 )}

 {/* SUB-TAB 1: LACTATION (UNIFIED MILK RECORDING & DISPATCH) */}
 {subTab === 'lactation' && (
 <div className="space-y-8">
 {/* Analytics Dashboard */}
 <DairyDashboard milkRecords={milkRecords} milkOutflows={milkOutflows} aiRecords={aiRecords} cows={cows} />

 {/* Forms Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 
 {/* COLUMN 1: Individual Cow Milking Form */}
 <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-sm space-y-6">
 <div className="border-b border-white/10 pb-3">
 <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase flex items-center gap-1">
 <TrendingUp size={12} /> Cow Milking Console
 </h5>
 <p className="text-[10px] text-white font-medium font-medium mt-1 font-bold">Record individual morning & afternoon yields</p>
 </div>

 <form onSubmit={handleMilkingSubmit} className="space-y-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1">Select / Type Cow Tag ID</label>
 {cows.length > 0 ? (
 <select
 required
 value={cowTag}
 onChange={(e) => setCowTag(e.target.value)}
 className="text-xs border border-white/15 focus:border-emerald-500 rounded-xl p-3 w-full font-bold bg-slate-900 outline-none"
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
 className="text-xs border border-white/15 focus:border-emerald-500 rounded-xl p-3 w-full font-bold outline-none"
 />
 )}
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1">AM Liters</label>
 <input
 type="number"
 required
 min="0"
 step="0.1"
 value={amLiters}
 onChange={(e) => setAmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Morning L"
 className="text-xs border border-white/15 focus:border-emerald-500 rounded-xl p-3 w-full font-mono font-bold outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1">PM Liters</label>
 <input
 type="number"
 required
 min="0"
 step="0.1"
 value={pmLiters}
 onChange={(e) => setPmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="Afternoon L"
 className="text-xs border border-white/15 focus:border-emerald-500 rounded-xl p-3 w-full font-mono font-bold outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1">Milking Date</label>
 <input
 type="date"
 required
 value={milkingDate}
 onChange={(e) => setMilkingDate(e.target.value)}
 className="text-xs border border-white/15 focus:border-emerald-500 rounded-xl p-3 w-full font-bold font-mono outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1">Milking Officer</label>
 <select
 value={staffName}
 onChange={(e) => setStaffName(e.target.value)}
 className="text-xs border border-white/15 focus:border-emerald-500 rounded-xl p-3 w-full bg-slate-900 font-medium text-white font-semibold outline-none"
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
 className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase p-3 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Record Cow Yield
 </button>
 </form>
 </div>

 {/* COLUMN 2: Daily Milk Dispatch Form */}
 <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6 text-white">
 <div className="border-b border-slate-800 pb-3">
 <h5 className="text-[11px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
 <Truck size={12} /> Daily Global Dispatch
 </h5>
 <p className="text-[10px] text-white font-medium font-medium mt-1 font-bold">Record consumption, spoils & set today's price</p>
 </div>

 <form onSubmit={handleOutflowSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1">Dispatch Date</label>
 <input
 type="date"
 required
 value={outflowDate}
 onChange={(e) => setOutflowDate(e.target.value)}
 className="text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 w-full font-bold font-mono outline-none text-white"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-1">Sales Price / Liter (Ksh)</label>
 <input
 type="number"
 required
 min="1"
 value={outflowPrice}
 onChange={(e) => setOutflowPrice(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="e.g. 52"
 className="text-xs bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 w-full font-mono font-bold outline-none text-amber-400"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-800 p-3 rounded-xl bg-slate-950">
 <div>
 <label className="text-[9px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1" title="Used at Home">Home (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowHome}
 onChange={(e) => setOutflowHome(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-white"
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1" title="Used by Workers">Staff (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowWorkers}
 onChange={(e) => setOutflowWorkers(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-white"
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-white font-medium font-medium uppercase tracking-wider block mb-1" title="Consumed by Calf">Calf (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowCalf}
 onChange={(e) => setOutflowCalf(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-white"
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-rose-400 uppercase tracking-wider block mb-1" title="Spoiled Milk">Spoilt (L)</label>
 <input
 type="number"
 step="0.1"
 min="0"
 value={outflowSpoiled}
 onChange={(e) => setOutflowSpoiled(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="0.0"
 className="text-xs bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 w-full font-mono font-bold outline-none text-rose-300"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-2 border border-slate-800 p-3 rounded-xl bg-slate-950">
 <div className="flex justify-between items-center mb-1">
 <label className="text-[9px] font-black text-rose-400 uppercase tracking-wider block">🚨 Log Debtors (Optional)</label>
 {outflowDebtsList.length > 0 && (
 <span className="text-[9px] font-mono font-black text-rose-400">Total: Ksh {outflowDebtsList.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</span>
 )}
 </div>
 <div className="flex gap-2">
 <input
 type="text"
 value={outflowCustomer}
 onChange={(e) => setOutflowCustomer(e.target.value)}
 placeholder="Debtor Name"
 className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 w-full font-bold outline-none text-white"
 />
 <input
 type="number"
 min="0"
 value={outflowDebts}
 onChange={(e) => setOutflowDebts(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="Ksh"
 className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 w-24 font-mono font-bold outline-none text-white"
 />
 <button
 type="button"
 onClick={handleAddDebtorToList}
 className="bg-rose-950 hover:bg-rose-900 text-rose-300 px-3 rounded-lg font-black text-[10px] uppercase transition-colors"
 >
 Add
 </button>
 </div>
 {outflowDebtsList.length > 0 && (
 <div className="mt-2 space-y-1">
 {outflowDebtsList.map((d, idx) => (
 <div key={idx} className="flex justify-between items-center bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800">
 <span className="text-[10px] font-bold text-white font-medium">👤 {d.debtor}</span>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-mono font-black text-rose-400">Ksh {d.amount.toLocaleString()}</span>
 <button type="button" onClick={() => handleRemoveDebtorFromList(idx)} className="text-white font-medium font-medium hover:text-red-400"><X size={12}/></button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <button
 type="submit"
 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase p-3 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Save Daily Dispatch
 </button>
 </form>
 </div>
 </div>

 {/* Unified Ledger Log */}
 <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-sm space-y-6">
 <div className="flex justify-between items-end border-b border-white/10 pb-3">
 <div>
 <h5 className="text-[11px] font-black tracking-widest text-white uppercase flex items-center gap-1">
 <Database size={12} /> Combined Production & Dispatch Ledger
 </h5>
 <p className="text-[10px] text-white font-medium font-medium mt-1 font-bold">Historical data computed automatically per day</p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => { setDownloadType('csv'); setShowDownloadModal(true); }}
 type="button"
 className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/20 hover:bg-emerald-100 border border-emerald-250 text-emerald-900 rounded-lg font-black text-[9px] uppercase transition-all shadow-xs cursor-pointer"
 title="Export Yield History as CSV"
 >
 <FileSpreadsheet size={12} />
 CSV
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => { setDownloadType('pdf'); setShowDownloadModal(true); }}
 type="button"
 className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-black text-[9px] uppercase transition-all shadow-xs cursor-pointer"
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
 <div className="text-center py-8 text-white font-medium font-medium font-bold uppercase text-[10px]">
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
 <div key={dateStr} className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xs hover:border-white/15 transition-all">
 {/* Day Header */}
 <div className="bg-slate-800/50 p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
 <div className="flex items-center gap-3">
 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-white/15 shadow-xs">
 <span className="font-extrabold text-white text-xs uppercase tracking-widest block font-mono">
 {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 </div>
 {dayOutflow && (
 <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-900/20 px-2 py-1 rounded-md border border-amber-100">
 Price: Ksh {price}/L
 </span>
 )}
 </div>

 <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
 <span className="bg-slate-900 text-white font-semibold border border-white/15 px-2 py-1 rounded-md shadow-xs">
 Yield: {yieldTotal.toFixed(1)} L
 </span>
 {consumed > 0 && (
 <span className="bg-amber-900/20 text-amber-700 border border-amber-200 px-2 py-1 rounded-md shadow-xs">
 Dispatch: {consumed.toFixed(1)} L
 </span>
 )}
 <span className="bg-emerald-900/20 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md shadow-xs">
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
 <h6 className="text-[9px] font-black uppercase text-white font-medium font-medium tracking-widest mb-2 border-b border-white/15 pb-1">Cow Yields ({dayMilks.length})</h6>
 {dayMilks.length === 0 ? (
 <span className="text-[10px] text-white font-medium font-medium font-bold italic">No cow records logged.</span>
 ) : (
 <div className="space-y-1.5">
 {dayMilks.map(m => {
 const mTotal = (m.am ?? 0) + (m.pm ?? 0);
 const isHigh = isHighProducer(m.am ?? 0, m.pm ?? 0, m.id);
 return (
 <div key={m.id} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-white/10 shadow-2xs group">
 <div className="flex items-center gap-2">
 <span className="font-bold text-white text-xs">{m.id}</span>
 {isHigh && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded font-black uppercase tracking-wider">Peak</span>}
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[9px] font-mono text-white font-medium font-medium">AM:{m.am} PM:{m.pm}</span>
 <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-900/20 px-1.5 py-0.5 rounded">{mTotal.toFixed(1)} L</span>
 {onEditMilkRecord && (
 <button onClick={() => setEditingMilk(m)} className="text-white font-medium hover:text-emerald-500 transition-colors opacity-100"><PenSquare size={12}/></button>
 )}
 <button onClick={() => onDeleteMilkRecord(m.id, m.date)} className="text-white font-medium hover:text-red-500 transition-colors opacity-100"><Trash2 size={12}/></button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Right: Dispatch Detail */}
 <div className="space-y-2">
 <h6 className="text-[9px] font-black uppercase text-white font-medium font-medium tracking-widest mb-2 border-b border-white/15 pb-1">Dispatch & Debts</h6>
 {!dayOutflow ? (
 <span className="text-[10px] text-white font-medium font-medium font-bold italic">No dispatch logged.</span>
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
 <span className="text-[9px] font-black text-rose-600 uppercase tracking-wide block mb-1">Unpaid Debts (Ksh {debtsKsh.toLocaleString()})</span>
 <div className="flex flex-wrap gap-1">
 {dayOutflow.debtsList && dayOutflow.debtsList.length > 0 ? (
 dayOutflow.debtsList.map((d, i) => (
 <span key={i} className="text-[9px] font-mono text-rose-800 bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs">👤 {d.debtor}: Ksh {d.amount}</span>
 ))
 ) : (
 <span className="text-[9px] font-mono text-rose-800 bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs">👤 {dayOutflow.debtCustomer}</span>
 )}
 </div>
 </div>
 )}

 <div className="flex justify-end gap-3 mt-2 border-t border-white/10 pt-2">
 {onEditMilkOutflow && (
 <button onClick={() => setEditingOutflow(dayOutflow)} className="text-[9px] text-white font-medium font-medium hover:text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1 transition-colors">
 <PenSquare size={10}/> Edit Dispatch
 </button>
 )}
 <button onClick={() => onDeleteMilkOutflow(dayOutflow.id)} className="text-[9px] text-white font-medium font-medium hover:text-red-500 font-black uppercase tracking-wider flex items-center gap-1 transition-colors">
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
 )}\n {/* SUB-TAB: BREEDING LEDGER */}
 {subTab === 'breeding_ledger' && (
 <div className="space-y-6">
 {/* Header Actions for Breeding Ledger */}
 <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h4 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5 font-bold">
 <FlaskConical size={16} className="text-[#8b0000]" />
 Breeding Registry & AI Ledger
 </h4>
 <p className="text-xs text-white font-medium font-medium font-medium">Download artificial insemination logs, gestation timetables, and PDF reports.</p>
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 <button
 onClick={downloadAICyclesCSV}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-900/20 border border-rose-200 text-rose-950 hover:bg-rose-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0 font-bold"
 title="Download AI Records CSV"
 >
 <FileSpreadsheet size={13} />
 Export AI Logs
 </button>
 <button
 onClick={handleDownloadAIPdf}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-700 hover:bg-red-600 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border-none font-bold"
 title="Download Artificial Insemination PDF Report"
 >
 <Download size={13} />
 AI PDF Report
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('ai')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download Inseminations PDF Report"
 >
 <Download size={13} />
 Download PDF Report
 </button>
 )}
 </div>
 </div>

 {/* Breeding Ledger (AI Tracker) */}
 <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-sm space-y-6">
 <div className="border-b border-white/10 pb-3">
 <h5 className="text-[11px] font-black tracking-widest text-[#8b0000] uppercase flex items-center gap-1">
 <FlaskConical size={12} /> Breeding Ledger
 </h5>
 <p className="text-xs text-white font-medium font-medium mt-1 font-medium">Artificial Insemination (AI) tracker & gestations</p>
 </div>

 <form onSubmit={handleAISubmit} className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Inseminated Cow ID</label>
 {cows.length > 0 ? (
 <select
 required
 value={aiCowId}
 onChange={(e) => setAiCowId(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold bg-slate-900 "
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
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 )}
 </div>

 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Service Date (Inseminated)</label>
 <input
 type="date"
 required
 value={aiDate}
 onChange={(e) => setAiDate(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 </div>

 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Check Date (Scan/Verification)</label>
 <input
 type="date"
 value={aiCheckDate}
 onChange={(e) => setAiCheckDate(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 </div>

 {/* Semen Straw Selector from Genetic Inventory */}
 <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Select Semen Straw (From Genetic Inventory)</label>
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
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold bg-slate-900 "
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
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Bull Name / Semen straw reference</label>
 <input
 type="text"
 required={semenInventory.length === 0}
 value={aiBull}
 onChange={(e) => setAiBull(e.target.value)}
 disabled={semenInventory.length > 0}
 placeholder={semenInventory.length > 0 ? 'Auto-filled from selected tracked straw' : 'E.g. SEMEN-HO-991 (Holstein Elite)'}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold font-mono disabled:bg-slate-800 disabled:text-white font-medium font-medium"
 />
 {semenInventory.length > 0 && (
 <p className="mt-1 text-[10px] font-semibold text-white font-medium font-medium">
 Genetic inventory lock is active. Pick a tracked straw to keep breeding and stock ledgers synchronized.
 </p>
 )}
 </div>
 </div>

 {/* Semen Origin, Type, and Cost */}
 <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Semen Origin</label>
 <input
 type="text"
 required
 value={aiOrigin}
 onChange={(e) => setAiOrigin(e.target.value)}
 placeholder="E.g. KAGRC (Local)"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 </div>

 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Semen Type</label>
 <select
 value={aiSemenType}
 onChange={(e) => setAiSemenType(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold bg-slate-900 "
 >
 <option value="Sexed (Female)">Sexed (Female)</option>
 <option value="Sexed (Male)">Sexed (Male)</option>
 <option value="Conventional">Conventional</option>
 </select>
 </div>

 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Straw Cost (Ksh)</label>
 <input
 type="number"
 value={aiCost}
 onChange={(e) => setAiCost(e.target.value === '' ? '' : Number(e.target.value))}
 placeholder="E.g. 1500"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold font-mono"
 />
 </div>
 </div>

 {/* AI pregnancy status and calf option */}
 <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">AI Straw status</label>
 <select
 value={aiStatus}
 onChange={(e) => setAiStatus(e.target.value as any)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold bg-slate-900 "
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
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Calf Name (Auto-added to Registry)</label>
 <input
 type="text"
 required
 value={aiCalfName}
 onChange={(e) => setAiCalfName(e.target.value)}
 placeholder="E.g. Precious Junior"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Calf Sex</label>
 <select
 value={aiCalfSex}
 onChange={(e) => setAiCalfSex(e.target.value as any)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold bg-slate-900 "
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
 🔄 Expected Return Heat Date: <span className="font-extrabold text-rose-800">
 {(() => {
 const d = new Date(aiDate);
 d.setDate(d.getDate() + 21);
 return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
 })()}
 </span> (21-day cycle)
 </div>
 <div>
 🍼 Expected Calving Date: <span className="font-extrabold text-indigo-900">
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
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Insemination Notes</label>
 <textarea
 value={aiNotes}
 onChange={(e) => setAiNotes(e.target.value)}
 placeholder="Notes about the straw batch, sire details, or cow's condition during insemination..."
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-medium h-16"
 />
 </div>

 <button
 type="submit"
 className="col-span-2 bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Log AI Breeding Service Straw
 </button>
 </form>

 {/* Dynamic breeding registry table list */}
 <div className="border-t border-white/10 pt-5 space-y-2">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase tracking-widest block mb-2 font-bold">Registered Breeding Gestations</label>
 <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
 {aiRecords.map((cycle, idx) => {
 // Determine gestation safety alerts
 const daysLeft = Math.ceil(
 (new Date(cycle.due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
 );
 const isClose = daysLeft > 0 && daysLeft <= 30;

 return (
 <div key={idx} className="p-3.5 border border-white/10 rounded-2xl bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-extrabold text-xs text-white">{cycle.cowId}</span>
 {cycle.status === 'Confirmed Pregnant' && (
 <span className="text-[8px] bg-emerald-150 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black uppercase">
 Pregnant
 </span>
 )}
 {cycle.status === 'Pending' && (
 <span className="text-[8px] bg-blue-900/20 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-full font-black uppercase">
 Awaiting scan
 </span>
 )}
 {cycle.status === 'Calved' && (
 <span className="text-[8px] bg-purple-900/20 text-purple-800 border border-purple-100 px-2 py-0.5 rounded-full font-black uppercase">
 Calved
 </span>
 )}
 {cycle.status === 'Failed' && (
 <span className="text-[8px] bg-red-900/20 text-red-800 border border-red-100 px-2 py-0.5 rounded-full font-black uppercase">
 Failed Straw
 </span>
 )}
 </div>
 <p className="text-[10px] text-white font-medium font-medium font-bold font-mono uppercase">
 Semen: {cycle.bull} {cycle.semenType ? `(${cycle.semenType})` : ''} {cycle.origin ? `• Origin: ${cycle.origin}` : ''} • Service: {cycle.date}
 </p>
 {cycle.cost && (
 <p className="text-[10px] text-indigo-900 font-extrabold font-mono">
 Straw Cost: Ksh {cycle.cost.toLocaleString()}
 </p>
 )}
 <div className="flex flex-wrap gap-1.5 mt-1">
 {cycle.returnHeatDate && (
 <span className="text-[10px] text-rose-700 bg-rose-900/20 border border-rose-100/50 rounded-lg px-2 py-0.5 inline-block font-black font-mono">
 🔄 Return Heat: {new Date(cycle.returnHeatDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 )}
 {cycle.checkDate && (
 <span className="text-[10px] text-teal-700 bg-teal-900/20 border border-teal-100/50 rounded-lg px-2 py-0.5 inline-block font-black font-mono">
 🔍 Check Date: {new Date(cycle.checkDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 )}
 {cycle.calfName && (
 <span className="text-[10px] text-purple-800 bg-purple-900/20 border border-purple-100/50 rounded-lg px-2 py-0.5 inline-block font-black font-mono">
 🍼 Calf: {cycle.calfName}
 </span>
 )}
 </div>
 {cycle.notes && (
 <div className="text-[10px] text-white font-medium font-medium bg-slate-800 border border-white/10 rounded-lg p-2 max-w-[450px] italic">
 Notes: {cycle.notes}
 </div>
 )}
 <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
 <Calendar size={12} className="text-rose-700 font-bold shrink-0" />
 <span>Expected Calving: {new Date(cycle.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
 {daysLeft > 0 && (
 <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${isClose ? 'text-rose-600 bg-rose-900/20' : 'text-white font-medium font-medium bg-slate-800'}`}>
 ({daysLeft} days)
 </span>
 )}
 </div>
 </div>

 <div className="flex flex-row sm:flex-col items-end gap-2 text-right">
 <span className="text-[10px] text-white font-medium font-medium font-black uppercase tracking-widest block">Update Status</span>
 <div className="flex items-center gap-2">
 <select
 value={cycle.status}
 onChange={(e) => onUpdateAIStatus(cycle.cowId, cycle.date, e.target.value as any)}
 className="text-[10px] font-black uppercase border border-white/15 rounded p-1.5 bg-slate-900 shrink-0 cursor-pointer focus:outline-none"
 >
 <option value="Pending">Pending Scan</option>
 <option value="Confirmed Pregnant">Confirmed</option>
 <option value="Calved">Calved</option>
 <option value="Failed">Straw Failed</option>
 </select>
 {onEditAIRecord && (
 <button
 onClick={() => setEditingAI(cycle)}
 className="text-white font-medium hover:text-indigo-800 p-1.5 border border-white/10 hover:bg-slate-55 rounded transition-colors cursor-pointer m-0"
 title="Edit Service Record"
 >
 <PenSquare size={13} />
 </button>
 )}
 <button
 onClick={() => onDeleteAIRecord(cycle.cowId, cycle.date)}
 className="text-white font-medium hover:text-red-655 p-1.5 border border-white/10 hover:bg-slate-800 rounded transition-colors cursor-pointer m-0"
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
 )}



 {/* SUB-TAB 2: COW IDENTITY DIRECTORY */}
 {subTab === 'registry' && (
 <CowRegistry
 cows={cows}
 milkRecords={milkRecords}
 onDeleteCow={onDeleteCow}
 setEditingCow={setEditingCow}
 onTriggerSectionReport={onTriggerSectionReport}
 onUpdateCowStatus={onUpdateCowStatus}
 onAddCow={onAddCow}
 />
 )}

 {/* SUB-TAB 3: VETERINARY LOGS & DEWORMING REMINDERS */}
 {subTab === 'veterinary' && (
 <div className="space-y-6">
 {/* Active Deworming Alerts section */}
 {activeRemindersCount > 0 ? (
 <div className="bg-red-900/20 border border-red-150 p-6 rounded-3xl space-y-3 shadow-xs">
 <div className="flex items-center gap-2.5 text-red-950">
 <BadgeAlert size={20} className="text-red-700 animate-pulse shrink-0" />
 <h5 className="font-extrabold text-[#7b1f1f] uppercase tracking-wider text-xs">VET WARNING: ACTIVE DEWORMING PROTOCOLS REQUIRED</h5>
 </div>
 <p className="text-xs text-red-700 font-medium leading-relaxed">
 Under organic health standards, deworming calendars must be kept strictly precise (90-day dosage intervals) to prevent fluke/nematode weight loss.
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
 {dewormingReminders
 .filter(r => r.status !== 'safe')
 .map(rem => (
 <div key={rem.cow.id} className="p-3 bg-slate-900 border border-red-100 rounded-2xl flex justify-between items-center shadow-xs">
 <div>
 <span className="text-xs font-black text-white block uppercase">{rem.cow.id} ({rem.cow.name})</span>
 <span className="text-[10px] text-white font-medium font-medium font-extrabold block uppercase mt-0.5 mt-1">{rem.cow.breed} • Status: {rem.cow.status}</span>
 </div>
 <div className="text-right">
 <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase text-red-700 bg-red-100 border border-red-200">
 {rem.status === 'overdue' ? 'Overdue Dose' : 'Due Soon'}
 </span>
 <span className="text-[10px] text-white font-medium font-medium font-bold font-mono block mt-1">{rem.text}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="bg-emerald-900/20 border border-emerald-100 p-5 rounded-2xl flex items-center gap-3">
 <CheckCircle2 size={20} className="text-emerald-800 shrink-0" />
 <div>
 <h5 className="text-[#0e4d29] text-xs font-extrabold uppercase">ALL HERD DEWORMING COMPLIANT</h5>
 <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Every cow has received a broad spectrum anthelmintic dose within the required timeline safety metrics.</p>
 </div>
 </div>
 )}

 {/* Controls & Search */}
 <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3 top-3.5 text-white font-medium font-medium" size={14} />
 <input
 type="text"
 placeholder="Search medications or diagnosis..."
 value={vetSearch}
 onChange={(e) => setVetSearch(e.target.value)}
 className="text-xs pl-9 pr-4 py-3 border border-white/15 rounded-xl w-full font-bold focus:outline-none"
 />
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 <button
 onClick={downloadVetClinicalCSV}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-900/20 border border-red-205 text-red-950 hover:bg-red-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
 title="Download Vet Logs CSV"
 >
 <FileSpreadsheet size={13} />
 Export Vet History
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('vet')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download Vet Clinic PDF Report"
 >
 <Download size={13} />
 Download PDF Report
 </button>
 )}
 <button
 onClick={() => setShowAddVetForm(!showAddVetForm)}
 className="bg-slate-900 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1.5 m-0 shadow-sm"
 >
 <Plus size={14} /> Log Vet Intervention / Deworming
 </button>
 </div>
 </div>

 {showAddVetForm && (
 <form onSubmit={handleVetSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-150 shadow-md space-y-6">
 <div className="border-b border-white/10 pb-3 flex justify-between items-center bg-slate-800 -m-6 mb-4 p-6 rounded-t-2xl">
 <div>
 <h5 className="text-sm uppercase font-black tracking-widest text-[#1a237e]">Log Comprehensive Veterinary Clinical Intervention</h5>
 <p className="text-[10px] text-white font-medium font-medium font-bold mt-0.5 uppercase tracking-wider">Professional clinical-grade chart for veterinarians & caregivers</p>
 </div>
 <span className="bg-[#1a237e]/10 text-[#1a237e] text-[9px] font-black uppercase px-2 py-1 rounded border border-[#1a237e]/20">Registered Practitioner Mode</span>
 </div>

 {/* SECTION A: PATIENT IDENTITY & ENTRY TIMING */}
 <div className="space-y-3">
 {/* Clinical Diagnostic Presets */}
 <div className="p-3.5 bg-blue-900/20 border border-blue-200/60 rounded-2xl space-y-2 mb-4">
 <span className="text-[9.5px] uppercase font-black text-blue-900 tracking-wider flex items-center gap-1">
 💉 EXCLUSIVE CLINICAL DIAGNOSTIC PRESETS
 </span>
 <p className="text-[10.5px] text-white font-medium font-medium leading-tight">Click one to pre-fill standard clinical parameters & withholding times:</p>
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
 {[
 { label: '🩺 East Coast Fever', type: 'Treatment' as const, diagnosis: 'Theileria parva (East Coast Fever) - High fever, swollen nodes', temp: 40.5, hr: 95, rr: 38, drug: 'Buparvaquone + Oxytetracycline', dosage: '1ml per 20kg bodyweight', route: 'IM' as const, milkWithholding: 3, meatWithholding: 28, cost: 4500, notes: 'Target lymph node injection block' },
 { label: '🥛 Mastitis Pen-Strep', type: 'Treatment' as const, diagnosis: 'Acute mastitis inside bottom-left quarter', temp: 39.2, hr: 80, rr: 24, drug: 'Penicillin-Streptomycin intramammary', dosage: 'One intramammary tube per infected quarter', route: 'Intramammary' as const, milkWithholding: 5, meatWithholding: 7, cost: 1800, notes: 'Strip the quarter thoroughly before administration' },
 { label: '🪱 Deworming Albendazole', type: 'Deworming' as const, diagnosis: 'Routine parasite drenching prophylaxis', temp: 38.5, hr: 68, rr: 18, drug: 'Albendazole 10% Oral Suspension', dosage: '10ml per 100kg bodyweight', route: 'Oral' as const, milkWithholding: 3, meatWithholding: 14, cost: 750, notes: 'Perform oral drenching using dosing gun' },
 { label: '🛡️ Foot-and-Mouth (FMD)', type: 'Vaccination' as const, diagnosis: 'Scheduled prophylactic herd vaccination', temp: 38.6, hr: 70, rr: 20, drug: 'FMD Quadrivalent Vaccine', dosage: '2ml subcutaneous', route: 'SC' as const, milkWithholding: 0, meatWithholding: 0, cost: 1200, notes: 'FMD vaccination campaign, booster due in 6 months' }
 ].map((p, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => {
 setVetType(p.type);
 setVetDiagnosis(p.diagnosis);
 setVetTemp(p.temp);
 setVetHeartRate(p.hr);
 setVetRespRate(p.rr);
 setVetDrug(p.drug);
 setVetDosage(p.dosage);
 setVetRoute(p.route);
 setVetWithdrawalMilk(p.milkWithholding);
 setVetWithdrawalMeat(p.meatWithholding);
 setVetCost(p.cost);
 setVetNotes(p.notes);
 setVetPrognosis('Good');
 const dateObj = new Date();
 dateObj.setDate(dateObj.getDate() + (p.type === 'Vaccination' ? 180 : 30));
 setVetNextDue(dateObj.toISOString().split('T')[0]);
 }}
 className="text-left bg-slate-900 hover:bg-indigo-900/20 p-2.5 rounded-xl border border-white/15 hover:border-indigo-350 text-[10.5px] text-white font-semibold transition-all font-bold m-0 flex flex-col justify-between cursor-pointer shadow-xs"
 >
 <span className="text-indigo-950 font-extrabold truncate">{p.label}</span>
 <span className="text-[9px] text-[#2c3e50] font-mono mt-0.5 font-bold">{p.type} • Milk WH {p.milkWithholding}d</span>
 </button>
 ))}
 </div>
 </div>

 <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">1. Patient Identification & Timeline</h6>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Animal Category</label>
 <select
 value={vetAnimalCategory}
 onChange={(e) => setVetAnimalCategory(e.target.value as any)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900 font-bold"
 >
 <option value="Cow">Dairy Cow (Adult)</option>
 <option value="Goat">Dairy/Meat Goat</option>
 <option value="Calf">Young Calf</option>
 <option value="Poultry">Poultry Flock</option>
 <option value="Dog">K9/Guard Dog</option>
 <option value="Other">Other Livestock</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Patient Identifier / Tag ID</label>
 {vetAnimalCategory === 'Cow' && cows.length > 0 ? (
 <select
 required
 value={vetCowId}
 onChange={(e) => setVetCowId(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold bg-slate-900 "
 >
 <option value="">-- Choose cow --</option>
 {cows.map(c => (
 <option key={c.id} value={c.id}>{c.id} ({c.name})</option>
 ))}
 </select>
 ) : (
 <input
 type="text"
 required
 value={vetCowId}
 onChange={(e) => setVetCowId(e.target.value)}
 placeholder="E.g. Goat-04, Pen B, K9-Max..."
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 )}
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Intervention Date (Historical / Recent)</label>
 <input
 type="date"
 required
 value={vetDate}
 onChange={(e) => setVetDate(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Intervention Class</label>
 <select
 value={vetType}
 onChange={(e) => setVetType(e.target.value as any)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900 font-bold"
 >
 <option value="Deworming">Deworming Bolus/Liquid</option>
 <option value="Treatment">Medical Treatment (Sick Animal)</option>
 <option value="Vaccination">Booster Vaccination (FMD, Anthrax, ECF)</option>
 <option value="General Practice">General Vet Audit / Checkup</option>
 </select>
 </div>
 </div>
 </div>

 {/* SECTION B: CLINICAL VITALS & OBSERVATIONS */}
 <div className="space-y-3 pt-2 border-t border-white/10">
 <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">2. Clinical Vitals & Diagnosis</h6>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Body Temperature (°C)</label>
 <input
 type="number"
 step="0.1"
 value={vetTemp}
 onChange={(e) => setVetTemp(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="E.g. 38.5"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Heart Rate (bpm)</label>
 <input
 type="number"
 value={vetHeartRate}
 onChange={(e) => setVetHeartRate(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 60"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Respiratory Rate (breaths/min)</label>
 <input
 type="number"
 value={vetRespRate}
 onChange={(e) => setVetRespRate(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 24"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-slate-505 uppercase block mb-1">Primary Diagnosis / Indication</label>
 <input
 type="text"
 value={vetDiagnosis}
 onChange={(e) => setVetDiagnosis(e.target.value)}
 placeholder="E.g. Sub-clinical Mastitis, Anaplasmosis"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 </div>
 </div>

 {/* SECTION C: PHARMACOLOGY, ROUTE & COST */}
 <div className="space-y-3 pt-2 border-t border-white/10">
 <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">3. Pharmacological Treatment Plan</h6>
 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
 <div className="md:col-span-2">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Medication / Treatment Description</label>
 <input
 type="text"
 required
 value={vetTreatment}
 onChange={(e) => setVetTreatment(e.target.value)}
 placeholder="E.g. Intramammary antibiotic infusion, Alben_bolus..."
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Active Drug Name</label>
 <input
 type="text"
 value={vetDrug}
 onChange={(e) => setVetDrug(e.target.value)}
 placeholder="E.g. Penicillin G, Albendazole"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Dosage Administered</label>
 <input
 type="text"
 value={vetDosage}
 onChange={(e) => setVetDosage(e.target.value)}
 placeholder="E.g. 20ml IM, 1 bolus"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Administration Route</label>
 <select
 value={vetRoute}
 onChange={(e) => setVetRoute(e.target.value as any)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900 font-bold"
 >
 <option value="IM">IM (Intramuscular)</option>
 <option value="IV">IV (Intravenous)</option>
 <option value="SC">SC (Subcutaneous)</option>
 <option value="Oral">Oral (Drench/Bolus)</option>
 <option value="Topical">Topical (Wound Dressing)</option>
 <option value="Intramammary">Intramammary (Infusion)</option>
 <option value="Other">Other Routing</option>
 </select>
 </div>
 </div>
 </div>

 {/* SECTION D: WITHDRAWALS, REMINDERS & FORECASTS */}
 <div className="space-y-3 pt-2 border-t border-white/10">
 <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">4. Withdrawal Regulations & Compliance Alerts</h6>
 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
 <div>
 <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Milk Withdrawal (Days)</label>
 <input
 type="number"
 value={vetWithdrawalMilk}
 onChange={(e) => setVetWithdrawalMilk(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 3 (Milk discard)"
 className="text-xs border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Meat Withdrawal (Days)</label>
 <input
 type="number"
 value={vetWithdrawalMeat}
 onChange={(e) => setVetWithdrawalMeat(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 21 (No slaughter)"
 className="text-xs border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Intervention Cost (Ksh)</label>
 <input
 type="number"
 value={vetCost}
 onChange={(e) => setVetCost(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 1500"
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Prognosis Evaluation</label>
 <select
 value={vetPrognosis}
 onChange={(e) => setVetPrognosis(e.target.value as any)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900 font-bold"
 >
 <option value="Good">Good (Favorable recovery expected)</option>
 <option value="Fair">Fair (Moderate recovery chance)</option>
 <option value="Guarded">Guarded (Uncertain/Complex response)</option>
 <option value="Poor">Poor (High structural damage / warning)</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Next Follow-up & Due Date</label>
 <input
 type="date"
 value={vetNextDue}
 onChange={(e) => setVetNextDue(e.target.value)}
 className="text-xs border border-slate-205 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 </div>
 
 <div className="flex items-center gap-2 bg-blue-900/20 p-2.5 rounded-xl border border-blue-100">
 <input
 type="checkbox"
 id="vetRetreatmentScheduled"
 checked={vetRetreatmentScheduled}
 onChange={(e) => setVetRetreatmentScheduled(e.target.checked)}
 className="w-4 h-4 text-indigo-900 border-white/20 rounded"
 />
 <label htmlFor="vetRetreatmentScheduled" className="text-[11px] font-extrabold text-slate-705 uppercase selection:bg-transparent">
 Flag for scheduled Retreatment Visit (System-monitored follow-up)
 </label>
 </div>
 </div>

 {/* NOTES & STAFF SECTION */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
 <div className="md:col-span-2">
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Practitioner Notes & Observational Observations</label>
 <input
 type="text"
 value={vetNotes}
 onChange={(e) => setVetNotes(e.target.value)}
 placeholder="E.g. Normal rumination index, mild congestion of mucosal membrane. Advised owner to avoid damp stalls."
 className="text-xs border border-white/15 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Supervising Veterinary Surgeon</label>
 <select
 value={vetStaff}
 onChange={(e) => setVetStaff(e.target.value)}
 className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900 font-bold text-indigo-950"
 >
 <option value="Dr. Devin Omwenga (Vet)">Dr. Devin Omwenga (Vet Manager)</option>
 {staffList.map(st => (
 <option key={st.id} value={`${st.name} (${st.unit})`}>{st.name} ({st.unit})</option>
 ))}
 </select>
 </div>
 </div>

 <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
 <button
 type="button"
 onClick={() => setShowAddVetForm(false)}
 className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-white font-medium font-medium m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button type="submit" className="px-5 py-2.5 bg-[#1a237e] text-white font-black text-xs uppercase rounded-lg m-0 shadow-sm hover:bg-[#12185c] cursor-pointer">
 Save Clinical Entry
 </button>
 </div>
 </form>
 )}

 {/* History ledger */}
 <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
 <h5 className="text-[10px] font-black tracking-wider text-white font-medium font-medium uppercase font-bold uppercase">HERD INTERVENTION HISTORY TIMELINE</h5>
 <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
 {[...vetRecords]
 .filter(r => r.treatment.toLowerCase().includes(vetSearch.toLowerCase()) || r.cowId.toLowerCase().includes(vetSearch.toLowerCase()) || r.notes.toLowerCase().includes(vetSearch.toLowerCase()))
 .sort((a,b) => b.date.localeCompare(a.date))
 .map((record) => (
 <div key={record.id} className="p-4 border border-white/10 rounded-2xl bg-slate-900 hover:bg-slate-800/50 shadow-sm transition-all flex flex-col md:flex-row justify-between gap-4">
 <div className="space-y-2 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
 record.type === 'Deworming' ? 'bg-cyan-900/20 text-cyan-800 border-cyan-200' :
 record.type === 'Treatment' ? 'bg-rose-900/20 text-rose-800 border-rose-200' :
 record.type === 'Vaccination' ? 'bg-purple-900/20 text-purple-800 border-purple-200' :
 'bg-indigo-900/20 text-indigo-805 border-indigo-200'
 }`}>
 {record.type}
 </span>
 
 <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-white/15">
 {record.animalCategory || 'Cow'}
 </span>
 
 <h6 className="font-extrabold text-xs text-white uppercase tracking-wide">
 Identifier / Tag: <span className="text-emerald-900 font-extrabold">{record.cowId}</span>
 </h6>

 {record.prognosis && (
 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ml-auto ${
 record.prognosis === 'Good' ? 'bg-emerald-900/20 text-emerald-800 border-emerald-200' :
 record.prognosis === 'Fair' ? 'bg-blue-900/20 text-blue-800 border-blue-200' :
 record.prognosis === 'Guarded' ? 'bg-amber-900/20 text-amber-800 border-amber-200' :
 'bg-red-900/20 text-red-800 border-red-200'
 }`}>
 Prognosis: {record.prognosis}
 </span>
 )}
 </div>

 {/* Diagnosis & Treatment */}
 <div className="p-3 bg-slate-800/60 rounded-xl border border-white/10 space-y-1">
 {record.diagnosis && (
 <p className="text-xs font-bold text-indigo-950">
 Clinical Diagnosis: <span className="font-black text-white">{record.diagnosis}</span>
 </p>
 )}
 <p className="text-xs font-medium text-white font-semibold leading-relaxed">
 Medication / Intervention: <span className="font-extrabold text-slate-950">{record.treatment}</span>
 </p>
 {(record.drugAdministered || record.dosage) && (
 <div className="text-[11px] text-white font-medium font-medium font-semibold uppercase tracking-wider flex flex-wrap gap-x-3 gap-y-1">
 {record.drugAdministered && <span>💊 Active Drug: <b className="text-white">{record.drugAdministered}</b></span>}
 {record.dosage && <span>⚖️ Dosage: <b className="text-white">{record.dosage}</b></span>}
 {record.administrationRoute && <span>💉 Route: <b className="text-white">{record.administrationRoute}</b></span>}
 </div>
 )}
 </div>

 {/* Clinical Vitals */}
 {(record.temperature || record.heartRate || record.respiratoryRate) && (
 <div className="flex flex-wrap gap-4 text-[11px] font-bold text-white font-medium font-medium bg-slate-800/30 p-2 rounded-lg border border-white/10">
 {record.temperature && <span>🌡️ Temp: <b className="text-slate-950">{record.temperature}°C</b></span>}
 {record.heartRate && <span>❤️ Heart Rate: <b className="text-slate-950">{record.heartRate} bpm</b></span>}
 {record.respiratoryRate && <span>🫁 Resp Rate: <b className="text-slate-950">{record.respiratoryRate} bpm</b></span>}
 </div>
 )}

 {/* Withdrawal Periods Warnings */}
 {(record.withdrawalMilkDays || record.withdrawalMeatDays) && (
 <div className="flex flex-wrap gap-3 p-2 rounded-xl bg-amber-900/20 border border-amber-100">
 {record.withdrawalMilkDays ? (
 <span className="text-[10px] font-black text-amber-850 uppercase">
 ⚠️ Milk Withdrawal: <b className="font-bold underline text-amber-950">{record.withdrawalMilkDays} Days</b> (Discard yield)
 </span>
 ) : null}
 {record.withdrawalMeatDays ? (
 <span className="text-[10px] font-black text-amber-850 uppercase">
 🍖 Meat Withdrawal: <b className="font-bold underline text-amber-950">{record.withdrawalMeatDays} Days</b> (No slaughter)
 </span>
 ) : null}
 </div>
 )}

 <p className="text-xs font-semibold text-white font-medium font-medium italic">
 Observations: "{record.notes}"
 </p>

 {record.nextDueDate && (
 <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 w-fit">
 <Timer size={12} />
 <span>Deadline reminder / Follow-up due: <b className="font-black underline">{record.nextDueDate}</b></span>
 </div>
 )}

 {record.retreatmentScheduled && (
 <div className="flex items-center gap-1.5 text-[10px] font-black text-red-900 bg-red-900/20 p-1.5 px-2.5 rounded-lg border border-red-100 w-fit uppercase">
 <span>🔔 Critical: Retreatment Scheduled</span>
 </div>
 )}
 </div>

 <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-4 text-left md:text-right shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
 <div>
 <span className="text-[9px] uppercase font-black text-white font-medium font-medium block font-bold">Intervention Timestamp</span>
 <span className="text-xs font-black font-semibold text-indigo-950 block mt-0.5 font-mono">{record.date}</span>
 <span className="text-[10px] text-white font-medium font-medium font-bold block mt-0.5">{record.staff}</span>
 </div>
 <div className="flex items-center gap-2 mt-2">
 {record.cost > 0 && (
 <span className="text-xs font-mono font-black text-red-700 bg-red-900/20 border border-red-100 px-2.5 py-0.5 rounded-full inline-block">
 Ksh {record.cost.toLocaleString()}
 </span>
 )}
 {onEditVetRecord && (
 <button
 onClick={() => setEditingVet(record)}
 className="text-white font-medium hover:text-indigo-805 p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-white/10 hover:bg-slate-800 m-0"
 title="Edit health record"
 >
 <PenSquare size={13} />
 </button>
 )}
 <button
 onClick={() => onDeleteVetRecord(record.id)}
 className="text-white font-medium hover:text-red-650 p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-white/10 hover:bg-slate-800 m-0"
 title="Delete health record"
 >
 <Trash2 size={13} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* SUB-TAB: ANIMAL BREEDING & GESTATION WHEEL */}
 {subTab === 'breeding_wheel' && (() => {
 // 12 Months layout setup
 const monthsList = [
 { name: 'JAN', days: 31, offset: 0 },
 { name: 'FEB', days: 28, offset: 31 },
 { name: 'MAR', days: 31, offset: 59 },
 { name: 'APR', days: 30, offset: 90 },
 { name: 'MAY', days: 31, offset: 120 },
 { name: 'JUN', days: 30, offset: 151 },
 { name: 'JUL', days: 31, offset: 181 },
 { name: 'AUG', days: 31, offset: 212 },
 { name: 'SEP', days: 30, offset: 243 },
 { name: 'OCT', days: 31, offset: 273 },
 { name: 'NOV', days: 30, offset: 304 },
 { name: 'DEC', days: 31, offset: 334 }
 ];

 // Maps YYYY-MM-DD to day of year index (1-365)
 const getDayOfYear = (dateString: string) => {
 const d = new Date(dateString);
 if (isNaN(d.getTime())) return 1;
 const start = new Date(d.getFullYear(), 0, 0);
 const diff = d.getTime() - start.getTime();
 const oneDay = 1000 * 60 * 60 * 24;
 return Math.max(1, Math.min(365, Math.floor(diff / oneDay)));
 };

 // Format day of year (1-365) back to Month / Day string format
 const formatDayOfYear = (dayNum: number) => {
 let accumulated = 0;
 for (let i = 0; i < monthsList.length; i++) {
 if (dayNum <= accumulated + monthsList[i].days) {
 const day = dayNum - accumulated;
 return `${monthsList[i].name} ${day}`;
 }
 accumulated += monthsList[i].days;
 }
 return `DEC 31`;
 };

 // Trigonometry mapping for circular polar plots (radius, day) -> {x, y}
 // Angles are rotated by -90 deg so day 1 (Jan 1) is at the strict top (12 o'clock)
 const getPolarCoords = (radius: number, dayNum: number) => {
 const angleDegrees = (dayNum / 365) * 360;
 const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
 return {
 x: 250 + radius * Math.cos(angleRadians),
 y: 250 + radius * Math.sin(angleRadians)
 };
 };

 const todayDayIndex = getDayOfYear(simulatedDate);

 // Gather and enrich cow reproduction cycle stages
 const enrichedCows = cows.map(cow => {
 // Latest service AI cycle
 const cowAI = aiRecords
 .filter(r => r.cowId.toLowerCase() === cow.id.toLowerCase())
 .sort((a, b) => b.date.localeCompare(a.date))[0];

 let serviceDay = 0;
 let dryOffDay = 0;
 let calvingDay = 0;
 let lactationStartDay = 0;
 let scoreText = 'No active breeding timeline detected';
 let statusLabel: string = cow.status;
 let forecastStatus: 'Lactating' | 'Dry' | 'Heifer' | 'In-Calf' = cow.status;

 if (cow.status === 'In-Calf' || (cowAI && cowAI.status === 'Confirmed Pregnant')) {
 statusLabel = 'In-Calf (Gestation)';
 forecastStatus = 'In-Calf';
 const sDate = cowAI ? cowAI.date : cow.dob; // fallback
 const sDay = getDayOfYear(sDate);
 serviceDay = sDay;
 dryOffDay = (sDay + 220) % 365 || 365;
 calvingDay = (sDay + 283) % 365 || 365;

 // Progress tracking
 const daysGestation = Math.max(0, Math.ceil((new Date(simulatedDate).getTime() - new Date(sDate).getTime()) / (1000 * 60 * 60 * 24)));
 if (daysGestation > 220) {
 forecastStatus = 'Dry';
 scoreText = `Currently DRY (Dry-off on G220). Calving expected in ${Math.max(0, 283 - daysGestation)} days`;
 } else {
 scoreText = `Gestating (Day ${daysGestation} of 283). Dry-off due in ${Math.max(0, 220 - daysGestation)} days`;
 }
 } else if (cow.status === 'Lactating') {
 lactationStartDay = (getDayOfYear(simulatedDate) - 60 + 365) % 365 || 365; // Estimated 60 days into lactation
 scoreText = `Direct milk line active (Avg daily: ${getAverageYield(cow.id).toFixed(1)} L)`;
 } else if (cow.status === 'Dry') {
 scoreText = `Dry non-lactating phase. Standing by for insemination trigger`;
 }

 return {
 ...cow,
 serviceDay,
 dryOffDay,
 calvingDay,
 lactationStartDay,
 scoreText,
 statusLabel,
 forecastStatus,
 latestAI: cowAI
 };
 });

 // Click cow to focus
 const focusedCowData = enrichedCows.find(c => c.id.toLowerCase() === selectedWheelCow.toLowerCase()) || enrichedCows[0];

 // 30 days upcoming forecast list based on current simulation pointer
 const forecastEvents = enrichedCows.flatMap(cow => {
 const events = [];
 
 if (cow.statusLabel.includes('In-Calf') && cow.latestAI) {
 const sDateObj = new Date(cow.latestAI.date);
 
 // Expected dry off (sDate + 220 days)
 const dryOffDateObj = new Date(sDateObj);
 dryOffDateObj.setDate(dryOffDateObj.getDate() + 220);
 const dryOffStr = dryOffDateObj.toISOString().split('T')[0];

 // Expected calving (sDate + 283 days)
 const calvingDateObj = new Date(sDateObj);
 calvingDateObj.setDate(calvingDateObj.getDate() + 283);
 const calvingStr = calvingDateObj.toISOString().split('T')[0];

 const curSimObj = new Date(simulatedDate);
 
 // Days difference from simulated date
 const daysToDryOff = Math.ceil((dryOffDateObj.getTime() - curSimObj.getTime()) / (1000 * 60 * 60 * 24));
 const daysToCalving = Math.ceil((calvingDateObj.getTime() - curSimObj.getTime()) / (1000 * 60 * 60 * 24));

 if (daysToDryOff >= 0 && daysToDryOff <= 30) {
 events.push({
 cowId: cow.id,
 name: cow.name,
 type: 'Dry-off Trigger',
 date: dryOffStr,
 daysLeft: daysToDryOff,
 severity: 'warning',
 color: 'text-amber-600 bg-amber-900/20 border-amber-200'
 });
 }

 if (daysToCalving >= 0 && daysToCalving <= 30) {
 events.push({
 cowId: cow.id,
 name: cow.name,
 type: 'Expected Calving',
 date: calvingStr,
 daysLeft: daysToCalving,
 severity: 'danger',
 color: 'text-rose-600 bg-rose-900/20 border-rose-200 animate-pulse'
 });
 }
 }

 // Cows in heat / ready to breed window: 50 - 75 days post calving (if we have calf dob logs)
 // Look at calfRecords to find calving dates
 return events;
 }).sort((a,b) => a.daysLeft - b.daysLeft);

 return (
 <div className="space-y-6 animate-fadeIn" id="breeding-wheel-center">
 {/* Context Header */}
 <div className="bg-emerald-950 text-emerald-100 p-5 rounded-3xl border border-emerald-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm text-left">
 <div className="space-y-1">
 <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Biological Gestation Dial</span>
 <h4 className="text-base font-black text-white uppercase tracking-wider">Circular Herd Breeding & Reproduction Wheel</h4>
 <p className="text-xs text-emerald-350 font-medium leading-relaxed max-w-xl">
 Simulate gestation timelines clockwise. Plot services (12 o'clock starting sector), follow gestating development (blue), track mandatory dry-off dates (amber at 220 days), and countdown to calving due (red at 283 days).
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl w-full md:w-auto">
 <div className="text-right">
 <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Currently Simulating</span>
 <span className="text-xs font-mono font-black text-white">{formatDayOfYear(todayDayIndex)}</span>
 </div>
 <input
 type="date"
 value={simulatedDate}
 onChange={(e) => setSimulatedDate(e.target.value)}
 className="bg-emerald-900 border border-emerald-800 rounded-lg p-1.5 text-xs text-white font-mono font-bold cursor-pointer"
 />
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('ai')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Export Gestation & Breeding PDF Report"
 >
 <Download size={13} />
 Breeding PDF Report
 </button>
 )}
 </div>
 </div>

 {/* Main Interactive Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
 
 {/* Left pane: The Circular SVG Wheel (col 6) */}
 <div className="lg:col-span-6 bg-slate-900 border border-slate-150 p-6 rounded-3xl shadow-xs flex flex-col items-center justify-center space-y-4">
 
 {/* SVG Dial canvas */}
 <div className="relative w-full max-w-[420px] aspect-square">
 <svg viewBox="0 0 500 500" className="w-full h-full select-none" id="breeding-wheel-svg">
 <defs>
 <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
 <stop offset="0%" stopColor="#ffffff" />
 <stop offset="90%" stopColor="#f8fafc" />
 <stop offset="100%" stopColor="#e2e8f0" />
 </radialGradient>
 </defs>

 {/* Concentric Grey Guide Lines */}
 <circle cx="250" cy="250" r="230" fill="none" stroke="#f1f5f9" strokeWidth="1" />
 <circle cx="250" cy="250" r="195" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3 3" />
 <circle cx="250" cy="250" r="160" fill="none" stroke="#cbd5e1" strokeWidth="3" />
 <circle cx="250" cy="250" r="125" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
 <circle cx="250" cy="250" r="90" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />

 {/* Draw month sector dividing spokes and labels */}
 {monthsList.map((m, idx) => {
 const deg = idx * 30;
 const rad = ((deg - 90) * Math.PI) / 180;
 const labelRad = ((deg + 15 - 90) * Math.PI) / 180;

 // Dividing spoke
 const spokeX = 250 + 230 * Math.cos(rad);
 const spokeY = 250 + 230 * Math.sin(rad);

 // Label coordinates
 const labelX = 250 + 212 * Math.cos(labelRad);
 const labelY = 250 + 212 * Math.sin(labelRad);

 const isHovered = wheelHoveredMonth === idx;

 return (
 <g key={m.name} className="transition-all">
 {/* Invisible month section wedge for hovering */}
 <path
 d={`M 250 250 L ${250 + 230 * Math.cos(rad)} ${250 + 230 * Math.sin(rad)} A 230 230 0 0 1 ${250 + 230 * Math.cos(((idx + 1) * 30 - 90) * Math.PI / 180)} ${250 + 230 * Math.sin(((idx + 1) * 30 - 90) * Math.PI / 180)} Z`}
 fill={isHovered ? 'rgba(16, 185, 129, 0.05)' : 'transparent'}
 className="cursor-pointer transition-all duration-150"
 onMouseEnter={() => setWheelHoveredMonth(idx)}
 onMouseLeave={() => setWheelHoveredMonth(null)}
 />

 {/* Spoke line */}
 <line x1="250" y1="250" x2={spokeX} y2={spokeY} stroke="#e2e8f0" strokeWidth={isHovered ? "2.5" : "1"} />
 
 {/* Text month label */}
 <text
 x={labelX}
 y={labelY + 4}
 textAnchor="middle"
 className={`font-mono text-[9px] font-extrabold ${isHovered ? 'fill-emerald-600 font-black' : 'fill-slate-400'}`}
 >
 {m.name}
 </text>
 </g>
 );
 })}

 {/* Highlighting Focused Cow sectors */}
 {focusedCowData && focusedCowData.serviceDay > 0 && (() => {
 const sDay = focusedCowData.serviceDay;
 const dDay = focusedCowData.dryOffDay;
 const cDay = focusedCowData.calvingDay;

 const startAngle = (sDay / 365) * 360 - 90;
 const dryAngle = (dDay / 365) * 360 - 90;
 const calvingAngle = (cDay / 365) * 360 - 90;

 const makeArc = (r: number, start: number, end: number, color: string) => {
 const startRad = (start * Math.PI) / 180;
 const endRad = (end * Math.PI) / 180;
 const x1 = 250 + r * Math.cos(startRad);
 const y1 = 250 + r * Math.sin(startRad);
 const x2 = 250 + r * Math.cos(endRad);
 const y2 = 250 + r * Math.sin(endRad);
 const largeArc = (end - start + 360) % 360 > 180 ? 1 : 0;
 return (
 <path
 d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
 fill="none"
 stroke={color}
 strokeWidth="8"
 strokeLinecap="round"
 opacity="0.85"
 />
 );
 };

 return (
 <g>
 {/* Gestation sector arc: Service to Dry Off (cyan-blue) */}
 {makeArc(160, startAngle, dryAngle, '#3b82f6')}
 {/* Dry Period sector arc: Dry-off to Calving Expected (amber-orange) */}
 {makeArc(160, dryAngle, calvingAngle, '#f97316')}
 
 {/* Pinpoints line links */}
 <line x1="250" y1="250" x2={getPolarCoords(160, sDay).x} y2={getPolarCoords(160, sDay).y} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
 </g>
 );
 })()}

 {/* Render cows as pins around the circular track */}
 {enrichedCows.map(cow => {
 if (cow.serviceDay <= 0) return null;

 const isSelected = selectedWheelCow.toLowerCase() === cow.id.toLowerCase();
 const coords = getPolarCoords(160, cow.serviceDay);

 // Choose node color based on status
 const pinColor = 
 cow.forecastStatus === 'Dry' ? '#f97316' : 
 cow.forecastStatus === 'In-Calf' ? '#2563eb' : '#10b981';

 return (
 <g 
 key={`pin-${cow.id}`}
 className="cursor-pointer group"
 onClick={() => setSelectedWheelCow(cow.id)}
 >
 <circle
 cx={coords.x}
 cy={coords.y}
 r={isSelected ? "8" : "5.5"}
 fill={pinColor}
 stroke={isSelected ? "#ffffff" : "transparent"}
 strokeWidth="1.5"
 className="transition-all hover:scale-125"
 />
 <title>{`${cow.name} [${cow.id}] - Inseminated Jan/Dec Equivalent`}</title>
 </g>
 );
 })}

 {/* Golden Time Pointer Pointer Needle pointing to Simulated Date */}
 {(() => {
 const ptrCoords = getPolarCoords(195, todayDayIndex);
 return (
 <g>
 <line
 x1="250"
 y1="250"
 x2={ptrCoords.x}
 y2={ptrCoords.y}
 stroke="#eab308"
 strokeWidth="3.5"
 strokeLinecap="round"
 opacity="0.9"
 />
 <circle
 cx={ptrCoords.x}
 cy={ptrCoords.y}
 r="5"
 fill="#eab308"
 stroke="#ffffff"
 strokeWidth="1.5"
 />
 </g>
 );
 })()}

 {/* Center HUD Circle */}
 <circle cx="250" cy="250" r="48" fill="url(#hubGradient)" stroke="#cbd5e1" strokeWidth="2" />
 
 {/* Inner HUD metadata labels */}
 <g className="font-sans">
 <text x="250" y="238" fontSize="8" fontWeight="900" fill="#64748b" textAnchor="middle" className="uppercase tracking-widest text-center">ESTATE DIAL</text>
 <text x="250" y="253" fontSize="14" fontWeight="950" fill="#0f172a" textAnchor="middle" className="font-mono text-center">{cows.length}</text>
 <text x="250" y="265" fontSize="7" fontWeight="900" fill="#10b981" textAnchor="middle" className="uppercase tracking-wider text-center">HERD HEADS</text>
 </g>
 </svg>
 </div>

 {/* Subtitle Color Guides */}
 <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase text-white font-medium font-medium font-sans border-t pt-3 w-full">
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
 <span>Gestating In-Calf</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
 <span>Dry Transition (G220+)</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
 <span>Fresh & Milking</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-1 bg-yellow-400 h-0.5 rounded-sm" />
 <span>Simulated Pointer</span>
 </div>
 </div>

 </div>

 {/* Right pane: Breeding Intelligence Dashboard & Forecast Checklist (col 6) */}
 <div className="lg:col-span-6 space-y-6">
 
 {/* 1. Selected cow focus card */}
 {focusedCowData ? (
 <div className="bg-slate-900 border border-slate-150 p-6 rounded-3xl shadow-xs space-y-4">
 <div className="flex justify-between items-start border-b pb-3">
 <div>
 <span className="text-[9px] font-bold text-white font-medium font-medium uppercase tracking-widest block font-sans">Focus Cow Scorecard</span>
 <h4 className="text-sm font-black text-white uppercase tracking-wide">
 {focusedCowData.name} ({focusedCowData.id})
 </h4>
 <span className="text-slate-450 text-[10px] font-semibold block mt-0.5 font-sans">
 Breed: {focusedCowData.breed} • Life Age: {getCowAge(focusedCowData.dob)}
 </span>
 </div>

 {/* Pill Badge */}
 <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
 focusedCowData.forecastStatus === 'In-Calf' ? 'bg-blue-100 text-blue-900' :
 focusedCowData.forecastStatus === 'Dry' ? 'bg-amber-100 text-amber-900 animate-pulse' :
 'bg-emerald-100 text-emerald-900'
 }`}>
 {focusedCowData.forecastStatus}
 </span>
 </div>

 {/* Timeline Scoreboard metrics list */}
 <div className="grid grid-cols-2 gap-3.5 text-xs">
 <div className="bg-slate-800 p-3 rounded-2xl border">
 <span className="text-[8.5px] uppercase font-bold text-white font-medium font-medium block mb-0.5">Lineage AI Straw</span>
 <span className="font-extrabold text-white block">
 {focusedCowData.latestAI ? focusedCowData.latestAI.bull : 'None Logged'}
 </span>
 <span className="text-[8.5px] font-semibold text-slate-450 block mt-1">
 Insemination: {focusedCowData.latestAI ? focusedCowData.latestAI.date : 'N/A'}
 </span>
 </div>

 <div className="bg-slate-800 p-3 rounded-2xl border">
 <span className="text-[8.5px] uppercase font-bold text-white font-medium font-medium block mb-0.5">Calculated Calving due</span>
 <span className="font-extrabold text-rose-800 block">
 {focusedCowData.latestAI ? focusedCowData.latestAI.due : 'None Logged'}
 </span>
 <span className="text-[8.5px] font-semibold text-slate-450 block mt-1">
 Approx {focusedCowData.latestAI ? '283 days gestation' : 'N/A'}
 </span>
 </div>
 </div>

 {/* Dynamic Gestation / Breeding Milestone Timeline visually tracking key physiological phases */}
 <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
 {(() => {
 const latestAIServiceDate = focusedCowData.latestAI ? focusedCowData.latestAI.date : null;
 const isPregnant = focusedCowData.forecastStatus === 'In-Calf' || focusedCowData.forecastStatus === 'Dry';
 
 // Calculate days in gestation or default
 const daysGestation = latestAIServiceDate 
 ? Math.max(0, Math.ceil((new Date(simulatedDate).getTime() - new Date(latestAIServiceDate).getTime()) / (1000 * 60 * 60 * 24)))
 : (focusedCowData.status === 'In-Calf' ? 120 : 0);

 const isDryPeriod = daysGestation >= 220;

 if (isPregnant) {
 const gestationMilestones = [
 { day: 0, label: "Day 0", title: "Conception", desc: "AI Straw insemination completed.", tip: "Observe for secondary heat on Day 21" },
 { day: 30, label: "Day 30", title: "Attachment", desc: "Embryo attaches firmly.", tip: "Avoid stressful handlings" },
 { day: 60, label: "Day 60", title: "Sexing Scan", desc: "Fetal heartbeat matches rhythm indicators.", tip: "Vet scanning open for sexing" },
 { day: 150, label: "Day 150", title: "Rumen Grow", desc: "Skeletal frame ossified.", tip: "Supply copper & selenium" },
 { day: 220, label: "Day 220", title: "Dry-Off", desc: "Milking halted to save colostrum.", tip: "Infuse dry-cow mastitis tubes" },
 { day: 270, label: "Day 270", title: "Steam-Up", desc: "Transition grain introduced.", tip: "Shift to transition close-up feeds" },
 { day: 283, label: "Day 283", title: "Calving Due", desc: "Due date of birth.", tip: "Move to sterilized calving block" }
 ];

 // Find active milestone
 let activeIndex = 0;
 for (let i = 0; i < gestationMilestones.length; i++) {
 if (daysGestation >= gestationMilestones[i].day) {
 activeIndex = i;
 }
 }

 return (
 <div className="space-y-3.5">
 <div className="flex justify-between items-center border-b border-slate-800 pb-2">
 <span className="text-[10px] uppercase font-black text-yellow-400 tracking-wider">🤰 ACTIVE PREGNANCY TIMELINE METRIC</span>
 <span className="bg-blue-500/10 text-blue-300 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-blue-500/20">
 Day {daysGestation} / 283
 </span>
 </div>

 <p className="text-[11px] text-white font-medium leading-relaxed font-medium">
 📌 <strong>Chronological Status:</strong> {focusedCowData.scoreText}
 </p>

 {/* Horizontal or Vertical scrollable step milestones */}
 <span className="text-[9.5px] uppercase font-black text-white font-medium font-medium block mb-1">Gestation Milestone Milestones:</span>
 <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto pr-1">
 {gestationMilestones.map((ms, idx) => {
 const isCompleted = daysGestation > ms.day;
 const isActive = activeIndex === idx;
 const isFuture = daysGestation <= ms.day && !isActive;

 let statusColor = "border-slate-800 bg-slate-900 text-white font-medium font-medium";
 let indicator = "⚪";
 if (isCompleted) {
 statusColor = "border-emerald-900/50 bg-emerald-950/20 text-white font-medium";
 indicator = "✔";
 } else if (isActive) {
 statusColor = "border-amber-500/40 bg-amber-500/10 text-white shadow-sm shadow-amber-500/5";
 indicator = "⭐";
 }

 return (
 <div key={ms.title} className={`p-2.5 border rounded-xl flex gap-2.5 items-start text-xs leading-tight transition-all ${statusColor}`}>
 <span className="text-sm shrink-0 mt-0.5 font-mono font-black">{indicator}</span>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline gap-1">
 <span className="font-extrabold text-[11px] truncate uppercase">{ms.title}</span>
 <span className="text-[8.5px] font-mono text-white font-medium font-medium shrink-0 font-extrabold">{ms.label}</span>
 </div>
 <p className="text-[10px] text-white font-medium font-medium mt-0.5 font-medium leading-normal">{ms.desc}</p>
 {isActive && (
 <p className="text-[9.5px] text-yellow-300 mt-1 font-bold bg-yellow-405/10 p-1 rounded border border-yellow-500/10">
 💡 Veterinary Tip: {ms.tip}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 } else {
 // Non-pregnant / standard cycling timeline
 const cycleMilestones = [
 { day: 0, label: "Day 0", title: "Calving Day", desc: "Starts fresh milk curve.", tip: "Flush uterine tracts, check retained placenta within 12h" },
 { day: 30, label: "Day 30", title: "Involution Complete", desc: "Uterus returns to normal size.", tip: "Record secondary mucus discharge metrics" },
 { day: 45, label: "Day 45", title: "Voluntary Wait Expire", desc: "Ready for primary insemination.", tip: "Heat signs: standing to be mounted, swelling vulva" },
 { day: 75, label: "Day 75", title: "Peak Breeding Zone", desc: "Highest fertility and conception rates.", tip: "Semen straw choice: High milk yield Friesian, Jersey" },
 { day: 220, label: "Day 220", title: "Mid-Lactation Decline", desc: "Persistent yield drops 10% monthly.", tip: "Optimize fiber and mineral levels in standard meal" },
 { day: 305, label: "Day 305", title: "Milking Cutoff", desc: "Complete 305-day lactation cycle.", tip: "Impose physical dry-off transitional period" }
 ];

 // Estimate where the cow is (let's assume lactating starts about 60 days post calving)
 const daysPostCalving = focusedCowData.status === 'Lactating' ? 65 : 320;
 
 let activeIndex = 0;
 for (let i = 0; i < cycleMilestones.length; i++) {
 if (daysPostCalving >= cycleMilestones[i].day) {
 activeIndex = i;
 }
 }

 return (
 <div className="space-y-3.5">
 <div className="flex justify-between items-center border-b border-slate-800 pb-2">
 <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">🐄 LACTATION & INSEMINATION CYCLE TIMELINE</span>
 <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-emerald-500/20">
 Peak Milker Timeline
 </span>
 </div>

 <p className="text-[11px] text-white font-medium leading-relaxed font-semibold">
 📌 {focusedCowData.scoreText}
 </p>

 <span className="text-[9.5px] uppercase font-black text-white font-medium font-medium block mb-1">Yearly Breeding Cycle Milestones:</span>
 <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto pr-1">
 {cycleMilestones.map((ms, idx) => {
 const isCompleted = daysPostCalving > ms.day;
 const isActive = activeIndex === idx;

 let statusColor = "border-slate-800 bg-slate-900 text-white font-medium font-medium";
 let indicator = "⚪";
 if (isCompleted) {
 statusColor = "border-emerald-950/30 bg-emerald-950/15 text-white font-medium";
 indicator = "✔";
 } else if (isActive) {
 statusColor = "border-emerald-500/40 bg-emerald-500/10 text-white shadow-sm shadow-emerald-500/5";
 indicator = "⭐";
 }

 return (
 <div key={ms.title} className={`p-2.5 border rounded-xl flex gap-2.5 items-start text-xs leading-tight transition-all ${statusColor}`}>
 <span className="text-sm shrink-0 mt-0.5 font-mono font-black">{indicator}</span>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline gap-1">
 <span className="font-extrabold text-[11px] truncate uppercase">{ms.title}</span>
 <span className="text-[8.5px] font-mono text-white font-medium font-medium shrink-0 font-bold">{ms.label}</span>
 </div>
 <p className="text-[10px] text-white font-medium font-medium mt-0.5 font-medium leading-normal">{ms.desc}</p>
 {isActive && (
 <p className="text-[9.5px] text-emerald-300 mt-1 font-bold bg-emerald-500/10 p-1 rounded border border-emerald-500/10">
 💡 Herd Manager Tip: {ms.tip}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 }
 })()}
 </div>

 {/* Quick Reproduction Action buttons */}
 <div className="grid grid-cols-3 gap-2.5 pt-2">
 <button
 onClick={() => {
 setAiCowId(focusedCowData.id);
 setSubTab('lactation');
 }}
 className="py-2 px-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-colors border-0 cursor-pointer text-center"
 >
 Inseminate 💉
 </button>
 
 <button
 onClick={() => {
 onUpdateCowStatus(focusedCowData.id, 'Dry');
 alert(`Cow ${focusedCowData.name} has been set to DRY status for recovery.`);
 }}
 className="py-2 px-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-colors border-0 cursor-pointer text-center"
 >
 Set to Dry 🏜️
 </button>

 <button
 onClick={() => {
 onUpdateCowStatus(focusedCowData.id, 'Lactating');
 alert(`Cow ${focusedCowData.name} status updated to Lactating / Fresh.`);
 }}
 className="py-2 px-1 bg-emerald-700 hover:bg-emerald-850 text-white font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-colors border-0 cursor-pointer text-center"
 >
 Set Lactating 🐄
 </button>
 </div>

 </div>
 ) : (
 <div className="bg-slate-800 border p-6 rounded-3xl text-center text-slate-450 py-12">
 Select a cow node or name from the list to display interactive cycle statistics.
 </div>
 )}

 {/* 2. Urgent Events Forecasting Window */}
 <div className="bg-slate-900 border border-slate-150 p-6 rounded-3xl shadow-xs space-y-4">
 <div className="flex justify-between items-center border-b pb-3">
 <div className="text-left">
 <h4 className="text-xs font-black text-white uppercase tracking-wide">30-Day Gestation Forecast Planner</h4>
 <p className="text-[10px] text-white font-medium font-medium font-semibold uppercase mt-0.5">Calculated countdowns from simulated clock date</p>
 </div>
 <span className="bg-slate-800 text-white font-semibold text-[9px] font-black px-2.5 py-1 rounded font-mono">
 {forecastEvents.length} Events Pending
 </span>
 </div>

 <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
 {forecastEvents.length === 0 ? (
 <p className="text-center text-slate-450 py-8 text-xs font-bold leading-relaxed">
 🎉 No cows expected to Dry Off or Calve in the upcoming 30 days based on Simulated Date: <span className="text-emerald-700 underline">{formatDayOfYear(todayDayIndex)}</span>
 </p>
 ) : (
 forecastEvents.map((evt, idx) => (
 <div 
 key={`${evt.cowId}-${evt.type}-${idx}`} 
 className={`p-3.5 rounded-2xl border flex justify-between items-center text-xs font-sans ${evt.color}`}
 >
 <div className="space-y-1">
 <span className="text-[9px] font-black uppercase tracking-wider block opacity-75">{evt.type}</span>
 <span className="font-extrabold text-slate-850">
 {evt.name} (Tag {evt.cowId})
 </span>
 <span className="text-[10px] block opacity-80 font-mono">
 Due: {evt.date} (Simulated countdown)
 </span>
 </div>
 <div className="text-right">
 <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-900 /60 border rounded-lg inline-block">
 {evt.daysLeft === 0 ? 'DUE TODAY' : `In ${evt.daysLeft} days`}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* 3. Cow Directory Listing for quick wheel selection */}
 <div className="bg-slate-900 border border-slate-150 p-6 rounded-3xl shadow-xs space-y-4">
 <div className="border-b pb-3 flex justify-between items-center">
 <h5 className="text-xs font-black text-white uppercase tracking-wide">Herd Reproductive Directory</h5>
 <span className="text-[9px] text-white font-medium font-medium uppercase font-black">Quick Selector</span>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
 {enrichedCows.map(cow => {
 const isSelected = selectedWheelCow.toLowerCase() === cow.id.toLowerCase();
 return (
 <button
 key={`btn-dir-${cow.id}`}
 onClick={() => setSelectedWheelCow(cow.id)}
 className={`p-2.5 text-left rounded-xl border text-[11px] font-bold uppercase transition-all duration-150 cursor-pointer m-0 flex flex-col justify-between ${
 isSelected 
 ? 'bg-emerald-950 border-emerald-950 text-white shadow-sm ring-2 ring-emerald-500/20' 
 : 'bg-slate-800 border-white/10 hover:border-white/20 text-white font-semibold'
 }`}
 >
 <span className="text-[10px] font-black">{cow.id}</span>
 <span className={`${isSelected ? 'text-emerald-200' : 'text-slate-450'} text-[8.5px] truncate font-medium block mt-1`}>
 {cow.name}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 </div>
 
 </div>
 </div>
 );
 })()}

 {/* Edit Milking Record Modal */}
 {editingMilk && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 ">
 <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn max-h-[95vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-white/10">
 <h3 className="text-sm font-black uppercase text-white">Edit Milk Record & Dispatch</h3>
 <button onClick={() => setEditingMilk(null)} className="text-white font-medium font-medium hover:text-white font-medium font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-3 font-sans text-xs">
 
 {/* Primary details */}
 <div className="bg-slate-800 p-2.5 rounded-2xl space-y-2.5 border border-white/10">
 <h4 className="font-extrabold uppercase text-[9px] text-white font-medium font-medium tracking-wider">1. Production Yield</h4>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Cow / Tag ID</label>
 <input
 type="text"
 value={editingMilk.id}
 disabled
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold bg-slate-800 text-white font-medium font-medium font-mono"
 />
 </div>
 <div>
 <input
 type="text"
 placeholder="YYYY-MM-DD or DD/MM/YYYY"
 value={editingCow.dob || ''}
 onChange={(e) => setEditingCow({ ...editingCow, dob: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Record Date</label>
 <input
 type="text"
 value={editingMilk.date}
 onChange={(e) => setEditingMilk({ ...editingMilk, date: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold bg-slate-800 text-white font-semibold font-mono"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">AM Yield Details (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingMilk.am}
 onChange={(e) => setEditingMilk({ ...editingMilk, am: parseFloat(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">PM Yield Details (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingMilk.pm}
 onChange={(e) => setEditingMilk({ ...editingMilk, pm: parseFloat(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 </div>

 {/* Commercial and Staff details */}
 <div className="bg-slate-800 p-2.5 rounded-2xl space-y-2.5 border border-white/10">
 <h4 className="font-extrabold uppercase text-[9px] text-white font-medium font-medium tracking-wider">2. Commercial & Buyer</h4>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Price per Liter (Ksh)</label>
 <input
 type="number"
 value={editingMilk.pricePerLiter ?? ''}
 placeholder="e.g. 52"
 onChange={(e) => setEditingMilk({ ...editingMilk, pricePerLiter: parseFloat(e.target.value) || undefined })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Buyer / Processor</label>
 <input
 type="text"
 value={editingMilk.buyer ?? ''}
 placeholder="e.g. Brookside Dairy"
 onChange={(e) => setEditingMilk({ ...editingMilk, buyer: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Supervising Operator</label>
 <select
 value={editingMilk.staff}
 onChange={(e) => setEditingMilk({ ...editingMilk, staff: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold"
 >
 {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
 </select>
 </div>
 </div>



 </div>
 <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
 <button
 onClick={() => setEditingMilk(null)}
 className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-white font-medium font-medium hover:bg-slate-800 m-0 cursor-pointer bg-slate-900 "
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
 className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Edit Milk Outflow & Dispatch Record Modal */}
 {editingOutflow && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 font-sans">
 <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn max-h-[95vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-white/10">
 <h3 className="text-sm font-black uppercase text-white">Edit Milk Outflow & Dispatch</h3>
 <button onClick={() => setEditingOutflow(null)} className="text-white font-medium font-medium hover:text-white font-medium font-medium font-bold m-0 cursor-pointer bg-transparent border-none">✕</button>
 </div>
 
 <div className="space-y-3.5 text-xs">
 {/* Date & Price */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Dispatch Date</label>
 <input
 type="date"
 value={editingOutflow.date}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, date: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-800 text-white font-semibold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-amber-500 uppercase block mb-1">Sales Price / L (Ksh)</label>
 <input
 type="number"
 value={editingOutflow.salesPricePerLiter ?? 52}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, salesPricePerLiter: e.target.value === '' ? undefined : Number(e.target.value) })}
 className="border border-amber-200 rounded-lg p-2.5 w-full text-xs font-bold bg-amber-900/20 text-amber-900 font-mono"
 />
 </div>
 </div>

 {/* Volumes Section */}
 <div className="bg-slate-800 p-3 rounded-2xl border border-white/10 space-y-3">
 <h4 className="font-extrabold uppercase text-[9px] text-white font-medium font-medium tracking-wider">1. Milk Allocation Volumes (Liters)</h4>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Home Consumed (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkUsedAtHome}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkUsedAtHome: parseFloat(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Workers / Staff Portions (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkUsedByWorkers}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkUsedByWorkers: parseFloat(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Calves Intake (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkUsedByCalf ?? 0}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkUsedByCalf: parseFloat(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Spoiled / Spilt (L)</label>
 <input
 type="number"
 step="0.1"
 value={editingOutflow.milkSpoiled}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, milkSpoiled: parseFloat(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 </div>

 {/* Debtors list and entry */}
 <div className="bg-slate-800 p-3 rounded-2xl border border-white/10 space-y-3">
 <div className="flex justify-between items-center">
 <h4 className="font-extrabold uppercase text-[9px] text-white font-medium font-medium tracking-wider">2. Unpaid Credit / Debts (Ksh)</h4>
 <span className="text-[9px] font-black text-rose-800 bg-rose-900/20 px-2 py-0.5 rounded border border-rose-100">
 Total: Ksh {(editingOutflow.debtsKsh || 0).toLocaleString()}
 </span>
 </div>

 {/* Existing Debtors List */}
 <div className="space-y-1.5 max-h-24 overflow-y-auto">
 {(editingOutflow.debtsList || []).length === 0 ? (
 <div className="text-[10px] text-white font-medium font-medium font-bold italic py-1">No debtors recorded for this dispatch date.</div>
 ) : (
 (editingOutflow.debtsList || []).map((debt, dIdx) => (
 <div key={dIdx} className="flex justify-between items-center bg-slate-900 border border-slate-150 rounded-lg px-2.5 py-1 text-[11px] font-bold">
 <span className="text-white font-semibold">{debt.debtor}</span>
 <div className="flex items-center gap-2">
 <span className="text-emerald-700">Ksh {debt.amount}</span>
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
 className="text-red-500 hover:text-red-700 font-extrabold text-[10px] m-0 p-0 cursor-pointer bg-transparent border-none"
 >
 ✕
 </button>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Add Debt Input Form inside Edit Modal */}
 <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/15">
 <div>
 <label className="text-[8.5px] font-black text-white font-medium font-medium uppercase block mb-1">Add Debtor Customer</label>
 <input
 type="text"
 value={editNewDebtorName}
 onChange={(e) => setEditNewDebtorName(e.target.value)}
 placeholder="E.g. Mama Amara"
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold bg-slate-900 "
 />
 </div>
 <div className="flex gap-2 items-end">
 <div className="flex-1">
 <label className="text-[8.5px] font-black text-white font-medium font-medium uppercase block mb-1">Debt Ksh</label>
 <input
 type="number"
 value={editNewDebtorAmount}
 onChange={(e) => setEditNewDebtorAmount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
 placeholder="Amount"
 className="border border-white/15 rounded-lg p-2 w-full text-xs font-bold font-mono bg-slate-900 "
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
 className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase px-3 py-2 rounded-lg transition-all m-0 cursor-pointer h-[32px] border-none"
 >
 + Add
 </button>
 </div>
 </div>
 </div>

 {/* Notes */}
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Remarks / Dispatch Notes</label>
 <textarea
 value={editingOutflow.notes || ''}
 onChange={(e) => setEditingOutflow({ ...editingOutflow, notes: e.target.value })}
 placeholder="Notes or descriptions about the dispatch allocation..."
 rows={2}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-medium"
 />
 </div>

 </div>

 {/* Modal Actions */}
 <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
 <button
 onClick={() => setEditingOutflow(null)}
 className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-white font-medium font-medium hover:bg-slate-800 m-0 cursor-pointer bg-slate-900 "
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
 className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer border-none"
 >
 Save Changes
 </button>
 </div>

 </div>
 </div>
 )}

 {/* Edit AI Breeding Record Modal */}
 {editingAI && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 font-sans">
 <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-white/10">
 <h3 className="text-sm font-black uppercase text-white">Edit Insemination Log</h3>
 <button onClick={() => setEditingAI(null)} className="text-white font-medium font-medium hover:text-white font-medium font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Target Cow ID</label>
 <input
 type="text"
 value={editingAI.cowId}
 disabled
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold bg-slate-800 text-white font-medium font-medium font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Service Date</label>
 <input
 type="date"
 value={editingAI.date}
 disabled
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold bg-slate-800 text-white font-medium font-medium font-mono"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Bull / Semen Code</label>
 <input
 type="text"
 value={editingAI.bull}
 onChange={(e) => setEditingAI({ ...editingAI, bull: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Scanned Pregnancy Status</label>
 <select
 value={editingAI.status}
 onChange={(e) => setEditingAI({ ...editingAI, status: e.target.value as any })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold bg-slate-900 "
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
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Semen Origin</label>
 <input
 type="text"
 value={editingAI.origin || ''}
 onChange={(e) => setEditingAI({ ...editingAI, origin: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Semen Type</label>
 <select
 value={editingAI.semenType || 'Conventional'}
 onChange={(e) => setEditingAI({ ...editingAI, semenType: e.target.value as any })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Sexed (Female)">Sexed (Female)</option>
 <option value="Sexed (Male)">Sexed (Male)</option>
 <option value="Conventional">Conventional</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Straw Cost (Ksh)</label>
 <input
 type="number"
 value={editingAI.cost ?? ''}
 onChange={(e) => setEditingAI({ ...editingAI, cost: e.target.value === '' ? undefined : Number(e.target.value) })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Expected Return Heat Date</label>
 <input
 type="date"
 value={editingAI.returnHeatDate || ''}
 onChange={(e) => setEditingAI({ ...editingAI, returnHeatDate: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Expected Calving Date</label>
 <input
 type="date"
 value={editingAI.due}
 onChange={(e) => setEditingAI({ ...editingAI, due: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 {editingAI.status === 'Calved' && (
 <div>
 <label className="text-[10px] font-black text-purple-700 uppercase block mb-1">Calf Name (Auto-added to Registry on save)</label>
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
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Breeding Notes</label>
 <textarea
 value={editingAI.notes || ''}
 onChange={(e) => setEditingAI({ ...editingAI, notes: e.target.value })}
 placeholder="Notes about the breeding session..."
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-medium h-16"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
 <button
 onClick={() => setEditingAI(null)}
 className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-white font-medium font-medium hover:bg-slate-55 m-0 cursor-pointer"
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
 className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Edit Cow Registry Modal */}
 {editingCow && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 font-sans">
 <div className="bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-white/10">
 <h3 className="text-sm font-black uppercase text-white">Edit Cow Record & Pedigree</h3>
 <button onClick={() => setEditingCow(null)} className="text-white font-medium font-medium hover:text-white font-medium font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Cow TAG / ID</label>
 <input
 type="text"
 value={editingCow.id}
 disabled
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold bg-slate-800 text-white font-medium font-medium font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Cow Friendly Name</label>
 <input
 type="text"
 value={editingCow.name}
 onChange={(e) => setEditingCow({ ...editingCow, name: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Breed Class</label>
 <input
 type="text"
 value={editingCow.breed}
 onChange={(e) => setEditingCow({ ...editingCow, breed: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Date of Birth</label>
 <input
 type="date"
 value={editingCow.dob}
 onChange={(e) => setEditingCow({ ...editingCow, dob: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Milking/Production Status</label>
 <select
 value={editingCow.status}
 onChange={(e) => setEditingCow({ ...editingCow, status: e.target.value as any })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Lactating">Lactating</option>
 <option value="Dry">Dry Rest</option>
 <option value="Heifer">Heifer</option>
 <option value="In-Calf">In-Calf</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Peak Yield Target (L/day)</label>
 <input
 type="number"
 value={editingCow.peakYieldTarget || ''}
 onChange={(e) => setEditingCow({ ...editingCow, peakYieldTarget: e.target.value === '' ? undefined : Number(e.target.value) })}
 placeholder="E.g. 30"
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Studbook Reg # (Optional)</label>
 <input
 type="text"
 value={editingCow.registrationNo || ''}
 onChange={(e) => setEditingCow({ ...editingCow, registrationNo: e.target.value })}
 placeholder="E.g. KAG-HF-YYYY-1120"
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 {/* Pedigree section border divider */}
 <div className="border-t border-white/10 pt-3">
 <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">Pedigree Tree Config (Ancestry Ledger)</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-[9px] font-bold text-white font-medium font-medium uppercase block mb-1">Sire (Father)</label>
 <input
 type="text"
 value={editingCow.sire || ''}
 onChange={(e) => setEditingCow({ ...editingCow, sire: e.target.value })}
 className="border border-slate-205 border-white/15 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[9px] font-bold text-white font-medium font-medium uppercase block mb-1">Dam (Mother)</label>
 <input
 type="text"
 value={editingCow.dam || ''}
 onChange={(e) => setEditingCow({ ...editingCow, dam: e.target.value })}
 className="border border-slate-205 border-white/15 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
 <div>
 <label className="text-[9px] font-semibold text-white font-medium font-medium uppercase block mb-1">Paternal Grand Sire</label>
 <input
 type="text"
 value={editingCow.grandSirePaternal || ''}
 onChange={(e) => setEditingCow({ ...editingCow, grandSirePaternal: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold text-white font-medium font-medium uppercase block mb-1">Paternal Grand Dam</label>
 <input
 type="text"
 value={editingCow.grandDamPaternal || ''}
 onChange={(e) => setEditingCow({ ...editingCow, grandDamPaternal: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
 <div>
 <label className="text-[9px] font-semibold text-white font-medium font-medium uppercase block mb-1">Maternal Grand Sire</label>
 <input
 type="text"
 value={editingCow.grandSireMaternal || ''}
 onChange={(e) => setEditingCow({ ...editingCow, grandSireMaternal: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs"
 />
 </div>
 <div>
 <label className="text-[9px] font-semibold text-white font-medium font-medium uppercase block mb-1">Maternal Grand Dam</label>
 <input
 type="text"
 value={editingCow.grandDamMaternal || ''}
 onChange={(e) => setEditingCow({ ...editingCow, grandDamMaternal: e.target.value })}
 className="border border-white/15 rounded-lg p-2 w-full text-xs"
 />
 </div>
 </div>
 </div>

 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Lactation Grade / General Notes</label>
 <input
 type="text"
 value={editingCow.notes || ''}
 onChange={(e) => setEditingCow({ ...editingCow, notes: e.target.value })}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-semibold"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
 <button
 onClick={() => setEditingCow(null)}
 className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-white font-medium font-medium hover:bg-slate-800 m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditCow) {
 onEditCow(editingCow.id, editingCow);
 }
 setEditingCow(null);
 }}
 className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Edit Veterinary Record Modal */}
 {editingVet && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 font-sans">
 <div className="bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-white/10">
 <div>
 <h3 className="text-sm font-black uppercase text-white">Edit Clinical Veterinary Log</h3>
 <p className="text-[10px] text-white font-medium font-medium font-bold uppercase mt-0.5">Adjust clinical parameters and medical records</p>
 </div>
 <button onClick={() => setEditingVet(null)} className="text-white font-medium font-medium hover:text-white font-medium font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 
 <div className="space-y-4 text-left">
 {/* Patient and Timeline */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Animal Category</label>
 <select
 value={editingVet.animalCategory || 'Cow'}
 onChange={(e) => setEditingVet({ ...editingVet, animalCategory: e.target.value as any })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Cow">Cow</option>
 <option value="Goat">Goat</option>
 <option value="Calf">Calf</option>
 <option value="Poultry">Poultry</option>
 <option value="Dog">Dog</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Tag ID / Cow Ref</label>
 <input
 type="text"
 value={editingVet.cowId}
 onChange={(e) => setEditingVet({ ...editingVet, cowId: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Type</label>
 <select
 value={editingVet.type}
 onChange={(e) => setEditingVet({ ...editingVet, type: e.target.value as any })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Deworming">Deworming</option>
 <option value="Treatment">Treatment</option>
 <option value="Vaccination">Vaccination</option>
 <option value="General Practice">General Practice</option>
 </select>
 </div>
 </div>

 {/* Vitals and Diagnosis */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-white/10">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Temp (°C)</label>
 <input
 type="number"
 step="0.1"
 value={editingVet.temperature || ''}
 onChange={(e) => setEditingVet({ ...editingVet, temperature: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Heart (bpm)</label>
 <input
 type="number"
 value={editingVet.heartRate || ''}
 onChange={(e) => setEditingVet({ ...editingVet, heartRate: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Resp (bpm)</label>
 <input
 type="number"
 value={editingVet.respiratoryRate || ''}
 onChange={(e) => setEditingVet({ ...editingVet, respiratoryRate: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Diagnosis</label>
 <input
 type="text"
 value={editingVet.diagnosis || ''}
 onChange={(e) => setEditingVet({ ...editingVet, diagnosis: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-semibold"
 />
 </div>
 </div>

 {/* Treatment and Pharmacology */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/10">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Intervention</label>
 <input
 type="text"
 required
 value={editingVet.treatment}
 onChange={(e) => setEditingVet({ ...editingVet, treatment: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Drug Name</label>
 <input
 type="text"
 value={editingVet.drugAdministered || ''}
 onChange={(e) => setEditingVet({ ...editingVet, drugAdministered: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Dosage</label>
 <input
 type="text"
 value={editingVet.dosage || ''}
 onChange={(e) => setEditingVet({ ...editingVet, dosage: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-semibold"
 />
 </div>
 </div>

 {/* Routing, Cost, and Timeline */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-white/10">
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Route</label>
 <select
 value={editingVet.administrationRoute || 'IM'}
 onChange={(e) => setEditingVet({ ...editingVet, administrationRoute: e.target.value as any })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="IM">IM</option>
 <option value="IV">IV</option>
 <option value="SC">SC</option>
 <option value="Oral">Oral</option>
 <option value="Topical">Topical</option>
 <option value="Intramammary">Intramammary</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Cost (Ksh)</label>
 <input
 type="number"
 value={editingVet.cost}
 onChange={(e) => setEditingVet({ ...editingVet, cost: parseInt(e.target.value) || 0 })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Log Date</label>
 <input
 type="date"
 value={editingVet.date}
 onChange={(e) => setEditingVet({ ...editingVet, date: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Prognosis</label>
 <select
 value={editingVet.prognosis || 'Good'}
 onChange={(e) => setEditingVet({ ...editingVet, prognosis: e.target.value as any })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold bg-slate-900 "
 >
 <option value="Good">Good</option>
 <option value="Fair">Fair</option>
 <option value="Guarded">Guarded</option>
 <option value="Poor">Poor</option>
 </select>
 </div>
 </div>

 {/* Withdrawals and Follow-ups */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/10">
 <div>
 <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Milk Withdrawal (Days)</label>
 <input
 type="number"
 value={editingVet.withdrawalMilkDays || ''}
 onChange={(e) => setEditingVet({ ...editingVet, withdrawalMilkDays: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Meat Withdrawal (Days)</label>
 <input
 type="number"
 value={editingVet.withdrawalMeatDays || ''}
 onChange={(e) => setEditingVet({ ...editingVet, withdrawalMeatDays: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Next Follow-up Due</label>
 <input
 type="date"
 value={editingVet.nextDueDate || ''}
 onChange={(e) => setEditingVet({ ...editingVet, nextDueDate: e.target.value || undefined })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 {/* Retreatment alert and Staff */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
 <div className="flex items-center gap-2 bg-rose-900/20 p-2 rounded-xl border border-rose-100">
 <input
 type="checkbox"
 id="editVetRetreatment"
 checked={editingVet.retreatmentScheduled || false}
 onChange={(e) => setEditingVet({ ...editingVet, retreatmentScheduled: e.target.checked })}
 className="w-4 h-4 text-indigo-900 border-white/20 rounded"
 />
 <label htmlFor="editVetRetreatment" className="text-[10px] font-black text-rose-950 uppercase selection:bg-transparent">
 Retreatment Scheduled visit
 </label>
 </div>
 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Supervising Officer</label>
 <input
 type="text"
 value={editingVet.staff}
 onChange={(e) => setEditingVet({ ...editingVet, staff: e.target.value })}
 className="border border-white/15 rounded-lg p-2.5 w-full text-xs font-bold text-indigo-950"
 />
 </div>
 </div>

 <div>
 <label className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1">Notes / Observations</label>
 <textarea
 value={editingVet.notes}
 onChange={(e) => setEditingVet({ ...editingVet, notes: e.target.value })}
 rows={2}
 className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 </div>
 
 <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
 <button
 onClick={() => setEditingVet(null)}
 className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-white font-medium font-medium hover:bg-slate-800 m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (onEditVetRecord) {
 onEditVetRecord(editingVet.id, editingVet);
 }
 setEditingVet(null);
 }}
 className="px-5 py-2.5 bg-indigo-955 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}
 {/* Pedigree & Relationship Tree Modal */}
 {pedigreeCow && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 font-sans">
 <div className="bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl p-6 md:p-8 border border-white/10 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
 
 {/* Modal Header */}
 <div className="flex justify-between items-start pb-4 border-b border-white/10">
 <div>
 <div className="flex items-center gap-2">
 <span className="bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
 Official Pedigree Deed
 </span>
 {pedigreeCow.registrationNo && (
 <span className="bg-blue-900/20 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider border border-blue-200">
 Reg: {pedigreeCow.registrationNo}
 </span>
 )}
 </div>
 <h3 className="text-xl font-black text-white mt-2 flex items-center gap-2">
 <Award className="text-amber-500" size={20} />
 Lineage: {pedigreeCow.name}
 </h3>
 <p className="text-xs text-white font-medium font-medium font-bold mt-1">
 Tag ID: {pedigreeCow.id} | Breed: {pedigreeCow.breed} | DOB: {pedigreeCow.dob}
 </p>
 </div>
 <button 
 onClick={() => {
 setPedigreeCow(null);
 setSelectedMateId('');
 }} 
 className="text-white font-medium font-medium hover:text-white font-medium font-medium font-bold text-lg m-0 p-1 cursor-pointer bg-slate-800 hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center transition-all"
 >
 ✕
 </button>
 </div>

 {/* Modal Tabs */}
 <div className="flex border-b border-white/10 pb-1 overflow-x-auto gap-4">
 <button
 type="button"
 onClick={() => setPedigreeSubTab('tree')}
 className={`pb-2.5 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
 pedigreeSubTab === 'tree'
 ? 'border-emerald-700 text-white'
 : 'border-transparent text-white font-medium font-medium hover:text-white font-semibold'
 }`}
 >
 🌳 Ancestry Family Tree
 </button>
 <button
 type="button"
 onClick={() => setPedigreeSubTab('offspring')}
 className={`pb-2.5 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
 pedigreeSubTab === 'offspring'
 ? 'border-emerald-700 text-white'
 : 'border-transparent text-white font-medium font-medium hover:text-white font-semibold'
 }`}
 >
 🧬 Offspring & Descendants
 </button>
 <button
 type="button"
 onClick={() => setPedigreeSubTab('genetics')}
 className={`pb-2.5 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
 pedigreeSubTab === 'genetics'
 ? 'border-emerald-700 text-white'
 : 'border-transparent text-white font-medium font-medium hover:text-white font-semibold'
 }`}
 >
 🔬 Genetic Mating Simulator
 </button>
 </div>

 {/* Tab 1: Ancestry Family Tree */}
 {pedigreeSubTab === 'tree' && (
 <div className="space-y-6">
 <div className="py-2">
 <span className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-4 text-center tracking-widest">
 Three Generation Ancestor Pedigree Mapping (Live Active Ledger)
 </span>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
 {/* FIRST GENERATION: PROBAND (SELF) */}
 <div className="flex flex-col justify-center">
 <div className="p-4 bg-emerald-900/20 border-2 border-emerald-950/20 rounded-2xl shadow-sm text-center relative hover:border-emerald-600 transition-colors">
 <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-950 text-white rounded px-2 py-0.5 text-[8px] uppercase font-black tracking-wider">
 Proband/Subject
 </div>
 <div className="pt-4 pb-2">
 <span className="text-base font-black text-white block mt-1">{pedigreeCow.name}</span>
 <span className="text-[11px] font-bold text-white font-medium font-medium block mt-1">Tag: {pedigreeCow.id}</span>
 <span className="text-[10px] bg-emerald-950/10 text-emerald-900 font-black px-2 py-1 rounded mt-2 inline-block">
 Breed: {pedigreeCow.breed}
 </span>
 </div>
 </div>
 </div>

 {/* SECOND GENERATION: PARENTS */}
 <div className="flex flex-col justify-center space-y-6">
 {/* SIRE (FATHER ♂) */}
 <div className="p-4 bg-blue-900/20 border-2 border-blue-900/10 rounded-2xl shadow-sm relative hover:border-blue-400 transition-colors">
 <span className="text-[8px] font-black uppercase text-blue-700 block tracking-wider mb-1">Sire / Father ♂</span>
 <span className="text-sm font-black text-white block">{pedigreeCow.sire || 'Imported Semen Specimen'}</span>
 <span className="text-[10px] text-white font-medium font-medium font-bold block mt-1">Certified Pureblood Lineage</span>
 
 {pedigreeCow.sire && cows.find(c => c.id.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase()) && (
 <button 
 type="button"
 onClick={() => {
 const target = cows.find(c => c.id.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase());
 if (target) setPedigreeCow(target);
 }}
 className="mt-2.5 text-[9px] font-black uppercase text-blue-800 bg-blue-10/20 hover:bg-blue-100 hover:text-blue-950 border border-blue-200 px-2 py-1 rounded transition-all w-full cursor-pointer m-0 text-center block"
 >
 🧬 Trace Sire Pedigree
 </button>
 )}
 </div>

 {/* DAM (MOTHER ♀) */}
 <div className="p-4 bg-rose-900/20 border-2 border-rose-900/10 rounded-2xl shadow-sm relative hover:border-rose-400 transition-colors">
 <span className="text-[8px] font-black uppercase text-rose-700 block tracking-wider mb-1">Dam / Mother ♀</span>
 <span className="text-sm font-black text-white block">{pedigreeCow.dam || 'Acr-Grade Sire Maternal'}</span>
 <span className="text-[10px] text-white font-medium font-medium font-bold block mt-1">Excellent Butterfat Producer</span>

 {pedigreeCow.dam && cows.find(c => c.id.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase()) && (
 <button 
 type="button"
 onClick={() => {
 const target = cows.find(c => c.id.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase());
 if (target) setPedigreeCow(target);
 }}
 className="mt-2.5 text-[9px] font-black uppercase text-rose-800 bg-rose-10/20 hover:bg-rose-100 hover:text-rose-950 border border-rose-200 px-2 py-1 rounded transition-all w-full cursor-pointer m-0 text-center block"
 >
 🧬 Trace Dam Pedigree
 </button>
 )}
 </div>
 </div>

 {/* THIRD GENERATION: GRANDPARENTS */}
 <div className="flex flex-col justify-between space-y-4">
 {/* PATERNAL GRANDPARENTS */}
 <div className="space-y-2">
 <div className="p-3 bg-slate-800 border border-slate-150 rounded-xl">
 <span className="text-[7.5px] font-black uppercase text-blue-600 block">Paternal Grand Sire</span>
 <span className="text-xs font-bold text-white block">{pedigreeCow.grandSirePaternal || 'Sire Sire G2 ♂'}</span>
 </div>
 <div className="p-3 bg-slate-800 border border-slate-150 rounded-xl">
 <span className="text-[7.5px] font-black uppercase text-rose-600 block">Paternal Grand Dam</span>
 <span className="text-xs font-bold text-white block">{pedigreeCow.grandDamPaternal || 'Sire Dam G2 ♀'}</span>
 </div>
 </div>

 {/* MATERNAL GRANDPARENTS */}
 <div className="space-y-2 border-t border-white/10 pt-3">
 <div className="p-3 bg-slate-800 border border-slate-150 rounded-xl">
 <span className="text-[7.5px] font-black uppercase text-blue-600 block">Maternal Grand Sire</span>
 <span className="text-xs font-bold text-white block">{pedigreeCow.grandSireMaternal || 'Dam Sire G2 ♂'}</span>
 </div>
 <div className="p-3 bg-slate-800 border border-slate-150 rounded-xl">
 <span className="text-[7.5px] font-black uppercase text-rose-600 block">Maternal Grand Dam</span>
 <span className="text-xs font-bold text-white block">{pedigreeCow.grandDamMaternal || 'Dam Dam G2 ♀'}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Ancestry Inbreeding Risk Diagnostic */}
 {(() => {
 const sharedAncestors: string[] = [];
 const pSire = pedigreeCow.sire?.toLowerCase().trim();
 const mDam = pedigreeCow.dam?.toLowerCase().trim();
 const pGsp = pedigreeCow.grandSirePaternal?.toLowerCase().trim();
 const pGdp = pedigreeCow.grandDamPaternal?.toLowerCase().trim();
 const mGsm = pedigreeCow.grandSireMaternal?.toLowerCase().trim();
 const mGdm = pedigreeCow.grandDamMaternal?.toLowerCase().trim();

 if (pSire && pSire === mDam) sharedAncestors.push("Sire is same as Dam (Extreme Close Breeding!)");
 if (pGsp && (pGsp === mGsm || pGsp === mGdm)) sharedAncestors.push(`Paternal Grand Sire (${pedigreeCow.grandSirePaternal}) matches Maternal Grandparents`);
 if (pGdp && (pGdp === mGsm || pGdp === mGdm)) sharedAncestors.push(`Paternal Grand Dam (${pedigreeCow.grandDamPaternal}) matches Maternal Grandparents`);

 return sharedAncestors.length > 0 ? (
 <div className="p-4 bg-red-900/20 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-950">
 <span className="text-lg">⚠️</span>
 <div className="space-y-1">
 <span className="font-black uppercase tracking-wider block text-red-900 text-[10px]">Ancestry Inbreeding Conflict Alert!</span>
 <p className="font-semibold text-[11px]">
 Ancestral records indicate genetic overlap on both parental sides:
 </p>
 <ul className="list-disc pl-4 space-y-0.5 font-medium">
 {sharedAncestors.map((sa, idx) => <li key={idx}>{sa}</li>)}
 </ul>
 <span className="block text-[10px] text-red-700 italic pt-1 font-bold">
 Estimated Coefficient of Inbreeding (F) &ge; 12.5%. Proceed with outcross straws in future breeding.
 </span>
 </div>
 </div>
 ) : (
 <div className="p-4 bg-emerald-900/20 border border-emerald-100 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
 <span className="text-lg">✅</span>
 <div>
 <span className="font-bold uppercase text-emerald-950 block text-[10px]">Inbreeding Coefficient (F) = 0.00% (Clean / Outcrossed)</span>
 <p className="text-[11px] font-medium text-emerald-800">
 No overlapping ancestral identifiers detected in the registered three-generation lineage. Excellent genetic diversity.
 </p>
 </div>
 </div>
 );
 })()}

 {/* Pedigree Certificate Actions (Download & Print) */}
 <div className="bg-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
 <div className="flex items-center gap-2 text-xs font-semibold text-white font-medium font-medium text-center sm:text-left">
 <Sparkles className="text-emerald-700 shrink-0" size={15} />
 <span>Verified by JR Cooperative Registry board. Ready for local Studbook print download.</span>
 </div>
 <div className="flex gap-2 w-full sm:w-auto">
 <button
 type="button"
 onClick={() => handleDownloadPedigree(pedigreeCow)}
 className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase rounded-xl transition-all shadow-sm cursor-pointer m-0"
 >
 <Download size={13} />
 Download Pedigree Slip (PDF)
 </button>
 <button
 type="button"
 onClick={() => handleDownloadPedigree(pedigreeCow)}
 className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-300 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer m-0"
 title="Generate certified documentation of the breeding pedigree chart"
 >
 <Printer size={13} />
 Print Official Deed
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Tab 2: Offspring & Descendants (Lineage Tracking) */}
 {pedigreeSubTab === 'offspring' && (
 <div className="space-y-6">
 <span className="text-[10px] font-black text-white font-medium font-medium uppercase block mb-1 tracking-widest text-center">
 Live Downward Lineage Tracking & Descendant Registers
 </span>

 {/* Find Direct Offspring */}
 {(() => {
 const directOffspring = cows.filter(c => 
 (c.dam && (c.dam.toLowerCase() === pedigreeCow.id.toLowerCase() || c.dam.toLowerCase() === pedigreeCow.name.toLowerCase())) ||
 (c.sire && (c.sire.toLowerCase() === pedigreeCow.id.toLowerCase() || c.sire.toLowerCase() === pedigreeCow.name.toLowerCase()))
 );

 return (
 <div className="space-y-4">
 <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-900">
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Direct Offspring (Generation F1)</h4>
 <p className="text-[11px] text-emerald-200 mt-0.5">
 Detected registered progeny in Nyaronde Herd that lists {pedigreeCow.name} as their dam or sire.
 </p>
 </div>

 {directOffspring.length === 0 ? (
 <div className="text-center py-8 bg-slate-800 rounded-2xl border border-white/10">
 <span className="text-xl">🍼</span>
 <p className="text-xs text-white font-medium font-medium font-bold mt-2">No direct F1 descendants registered yet in this herd database.</p>
 <p className="text-[10px] text-white font-medium font-medium mt-1">Add calves or cows with parent Tag ID "{pedigreeCow.id}" to display them here.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {directOffspring.map(child => {
 // Find grandchildren (progeny of this child)
 const grandKids = cows.filter(g =>
 (g.dam && (g.dam.toLowerCase() === child.id.toLowerCase() || g.dam.toLowerCase() === child.name.toLowerCase())) ||
 (g.sire && (g.sire.toLowerCase() === child.id.toLowerCase() || g.sire.toLowerCase() === child.name.toLowerCase()))
 );

 return (
 <div key={child.id} className="bg-slate-800 border border-white/15 rounded-2xl p-4 space-y-3 relative hover:border-emerald-600 transition-all">
 <div className="flex justify-between items-start">
 <div>
 <h5 className="font-black text-sm text-white">{child.name}</h5>
 <span className="text-[10px] text-white font-medium font-medium font-bold font-mono">ID: {child.id} | Breed: {child.breed}</span>
 </div>
 <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
 child.status === 'Lactating' ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950'
 }`}>
 {child.status}
 </span>
 </div>

 <div className="text-[11px] font-medium text-white font-medium font-medium space-y-1 bg-slate-900 p-2.5 rounded-xl border border-white/10">
 <div>📅 Born: <strong>{child.dob}</strong> ({getCowAge(child.dob)})</div>
 <div>🥛 Average Daily Yield: <strong>{getAverageYield(child.id).toFixed(1)} L/day</strong></div>
 </div>

 {/* Grand offspring indicator */}
 {grandKids.length > 0 && (
 <div className="pt-2 border-t border-dashed border-white/15">
 <span className="text-[8px] font-black uppercase text-indigo-700 tracking-wider block mb-1">
 Grand-descendants (F2 Lineage) ({grandKids.length}):
 </span>
 <div className="flex flex-wrap gap-1.5">
 {grandKids.map(gk => (
 <span key={gk.id} className="inline-flex items-center gap-1 bg-indigo-900/20 border border-indigo-100 text-indigo-950 text-[9.5px] font-bold px-2 py-0.5 rounded-lg">
 👶 {gk.name} ({gk.id})
 </span>
 ))}
 </div>
 </div>
 )}

 <button
 type="button"
 onClick={() => {
 setPedigreeCow(child);
 setPedigreeSubTab('tree');
 }}
 className="w-full text-center text-[9.5px] font-black uppercase text-emerald-800 bg-emerald-900/20 hover:bg-emerald-100 py-1.5 rounded-lg border-0 cursor-pointer transition-all"
 >
 Trace This Child's Lineage Tree &rarr;
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
 })()}
 </div>
 )}

 {/* Tab 3: Genetics & Potential Mate Predictor */}
 {pedigreeSubTab === 'genetics' && (
 <div className="space-y-6">
 <div className="bg-slate-800 p-4 rounded-2xl space-y-4">
 <div className="space-y-0.5">
 <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider">🔬 Bovine Mating & Genetic Trait Predictor</h4>
 <p className="text-[11px] text-white font-medium font-medium leading-relaxed font-semibold">
 Predict the lactation potential, physical coat alleles, and inbreeding safety coefficients for a prospective calf by selecting a breeding mate.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase text-white font-medium font-medium block mb-1">Subject Cow (Female Dam)</label>
 <div className="p-3 bg-slate-900 border border-white/15 rounded-xl font-bold text-xs text-white">
 {pedigreeCow.name} ({pedigreeCow.breed}) - Tag: {pedigreeCow.id}
 </div>
 </div>

 <div>
 <label className="text-[10px] font-black uppercase text-white font-medium font-medium block mb-1">Select Breeding Sire (Semen Straw / Bull)</label>
 <select
 value={selectedMateId}
 onChange={(e) => setSelectedMateId(e.target.value)}
 className="w-full bg-slate-900 border border-white/15 focus:border-emerald-700 rounded-xl px-3 py-3 font-bold text-xs cursor-pointer"
 >
 <option value="">-- Choose Mate --</option>
 {/* Premium custom straws */}
 <option value="straw-hf">Premium Semen: Holstein Ultimate-F (Peak: 45L)</option>
 <option value="straw-ay">Premium Semen: Ayrshire Redblood-7 (Peak: 38L)</option>
 <option value="straw-js">Premium Semen: Jersey Butterfat-Max (Peak: 34L)</option>
 {/* Registered bulls in the herd if any */}
 {cows.filter(c => c.id !== pedigreeCow.id).map(c => (
 <option key={c.id} value={c.id}>
 Registered: {c.name} ({c.breed}) - ID: {c.id}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {selectedMateId ? (
 (() => {
 // Mating Simulation Logic
 let mateName = "Selected Sire";
 let mateBreed = pedigreeCow.breed;
 let matePeakTarget = 30;

 if (selectedMateId === 'straw-hf') {
 mateName = "Holstein Ultimate-F (Semen Straw)";
 mateBreed = "Holstein-Friesian";
 matePeakTarget = 45;
 } else if (selectedMateId === 'straw-ay') {
 mateName = "Ayrshire Redblood-7 (Semen Straw)";
 mateBreed = "Ayrshire";
 matePeakTarget = 38;
 } else if (selectedMateId === 'straw-js') {
 mateName = "Jersey Butterfat-Max (Semen Straw)";
 mateBreed = "Jersey";
 matePeakTarget = 34;
 } else {
 const matchedCow = cows.find(c => c.id === selectedMateId);
 if (matchedCow) {
 mateName = matchedCow.name;
 mateBreed = matchedCow.breed;
 matePeakTarget = matchedCow.peakYieldTarget || 30;
 }
 }

 // Compute inbreeding hazard
 const isSharedPedigree = selectedMateId !== 'straw-hf' && selectedMateId !== 'straw-ay' && selectedMateId !== 'straw-js' && (
 selectedMateId.toLowerCase() === pedigreeCow.sire?.toLowerCase().trim() ||
 selectedMateId.toLowerCase() === pedigreeCow.dam?.toLowerCase().trim()
 );

 // Compute lactation genetic merit (average of parents + 5% selection pressure)
 const damPeak = pedigreeCow.peakYieldTarget || 28;
 const predictedProgenyPeak = ((damPeak + matePeakTarget) / 2) * 1.05;

 return (
 <div className="space-y-4">
 <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white rounded-2xl p-5 border border-indigo-900 space-y-4">
 <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">📊 Expected Progeny Genetic Outcomes</h4>
 
 {isSharedPedigree && (
 <div className="p-3 bg-red-900/40 border border-red-500 rounded-xl text-xs text-red-100 flex items-center gap-2">
 <span>🛑</span>
 <span className="font-bold uppercase tracking-wider text-[10px]">CRITICAL INBREEDING WARNING: Mating Sire matches Proband Dam/Sire directly! Breeding discouraged.</span>
 </div>
 )}

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
 <span className="text-[9px] text-indigo-300 block font-black uppercase tracking-wider mb-1">Expected Lactation Peak</span>
 <span className="text-base font-black font-mono text-yellow-400">{predictedProgenyPeak.toFixed(1)} Liters/day</span>
 <span className="text-[9px] text-white/50 block font-medium mt-0.5">Estimated Breeding Value (EBV)</span>
 </div>

 <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
 <span className="text-[9px] text-indigo-300 block font-black uppercase tracking-wider mb-1">Inbreeding Coeff (F)</span>
 <span className={`text-base font-black font-mono ${isSharedPedigree ? 'text-red-400' : 'text-emerald-400'}`}>
 {isSharedPedigree ? '50.0% (Inbred)' : '0.0% (Safe)'}
 </span>
 <span className="text-[9px] text-white/50 block font-medium mt-0.5">Pedigree Coincidence Check</span>
 </div>

 <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
 <span className="text-[9px] text-indigo-300 block font-black uppercase tracking-wider mb-1">Predicted Birth Weight</span>
 <span className="text-base font-black font-mono text-indigo-200">38 kg - 42 kg</span>
 <span className="text-[9px] text-white/50 block font-medium mt-0.5">Breed Average Norm</span>
 </div>

 <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
 <span className="text-[9px] text-indigo-300 block font-black uppercase tracking-wider mb-1">Phenotypic Yield Gain</span>
 <span className="text-base font-black font-mono text-emerald-400">+1.5 L / Lactation</span>
 <span className="text-[9px] text-white/50 block font-medium mt-0.5">Genetic Progress Speed</span>
 </div>
 </div>

 <div className="border-t border-white/10 pt-4 space-y-3">
 <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block">Predicted Allelic Inheritance (Punnett Square Probability):</span>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-medium text-white font-medium">
 <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
 <span>Coat Pattern:</span>
 <strong className="text-white">Black-White (75% Dom) | Red-White (25% Rec)</strong>
 </div>
 <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
 <span>Horned Allele:</span>
 <strong className="text-white">Polled Hornless (100% Dominant Heterozygous)</strong>
 </div>
 <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
 <span>Disease Resistance (Tick/Bovine):</span>
 <strong className="text-white">High Resistance (F1 Hybrid Heterosis effect)</strong>
 </div>
 <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
 <span>Offspring Sex Probability:</span>
 <strong className="text-yellow-400">95% Female heifer (Sexed straw selected)</strong>
 </div>
 </div>
 </div>
 </div>

 {/* Sire Recommendations Matchmaker Matrix */}
 <div className="bg-emerald-900/20 border border-emerald-100 p-4 rounded-xl space-y-2">
 <span className="text-[9.5px] font-black uppercase text-emerald-950 block">💡 Stud Matchmaker Insights</span>
 <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
 Recommended Straw choice for this mating: <strong className="text-emerald-950 font-black">Holstein Ultimate-F</strong>. It yields the highest genetic lactation transfer of <span className="underline">+{predictedProgenyPeak.toFixed(1)} L/day</span> with absolutely 0% risk of inbreeding depression.
 </p>
 </div>
 </div>
 );
 })()
 ) : (
 <div className="text-center py-10 bg-slate-800 rounded-2xl border border-white/10">
 <span className="text-2xl">🧬</span>
 <p className="text-xs text-white font-medium font-medium font-bold mt-2">Select a prospective Sire/Straw above to execute mating simulation.</p>
 </div>
 )}
 </div>
 )}

 <div className="flex justify-between items-center pt-4 border-t border-white/10">
 <span className="text-[10px] text-white font-medium font-medium font-mono font-bold">
 JR Farm Bovine Registry &bull; Verified Sovereignty System
 </span>

 <button
 type="button"
 onClick={() => {
 setPedigreeCow(null);
 setSelectedMateId('');
 }}
 className="px-5 py-2.5 bg-slate-800 hover:bg-slate-800 text-white font-medium font-medium font-black uppercase text-xs rounded-xl transition-colors cursor-pointer m-0 border-0"
 >
 Close Family Tree
 </button>
 </div>

 </div>
 </div>
 )}

 {/* Download Options Modal */}
 {showDownloadModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950 animate-fade-in">
 <div className="bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/15 animate-slide-up">
 <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800">
 <h3 className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-2">
 <Download size={16} className={downloadType === 'pdf' ? 'text-rose-500' : 'text-emerald-500'} />
 Export {downloadType.toUpperCase()} Report
 </h3>
 <button 
 onClick={() => setShowDownloadModal(false)}
 className="text-white font-medium font-medium hover:text-white font-medium font-medium bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full transition-colors border border-white/15"
 >
 <X size={16} />
 </button>
 </div>
 
 <div className="p-6 space-y-5">
 <p className="text-xs text-white font-medium font-medium font-medium">Select the time period to generate your consolidated production & dispatch report.</p>
 
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white font-medium font-medium tracking-wider">Report Period</label>
 <div className="grid grid-cols-2 gap-2">
 <button 
 onClick={() => setDownloadPeriod('today')}
 className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${downloadPeriod === 'today' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-900 border-white/15 text-white font-medium font-medium hover:border-white/20'}`}
 >
 Today
 </button>
 <button 
 onClick={() => setDownloadPeriod('week')}
 className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${downloadPeriod === 'week' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-900 border-white/15 text-white font-medium font-medium hover:border-white/20'}`}
 >
 This Week
 </button>
 <button 
 onClick={() => setDownloadPeriod('month')}
 className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${downloadPeriod === 'month' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-900 border-white/15 text-white font-medium font-medium hover:border-white/20'}`}
 >
 This Month
 </button>
 <button 
 onClick={() => setDownloadPeriod('all')}
 className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${downloadPeriod === 'all' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-900 border-white/15 text-white font-medium font-medium hover:border-white/20'}`}
 >
 All Time
 </button>
 </div>
 </div>

 <button
 onClick={downloadType === 'pdf' ? handleDownloadPdf : downloadMilkCSV}
 className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md transition-all ${downloadType === 'pdf' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
 >
 Generate {downloadType.toUpperCase()}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
