/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MilkingRecord, AIRecord, StaffMember, Cow, VetRecord } from '../types';
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
  Award
} from 'lucide-react';

interface DairyBreedingProps {
  milkRecords: MilkingRecord[];
  aiRecords: AIRecord[];
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
  animalSales: any[];
  onAddAnimalSale: (rec: any) => void;
  onDeleteAnimalSale: (id: string) => void;
  mortalities: any[];
  onAddMortality: (rec: any) => void;
  onDeleteMortality: (id: string) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function DairyBreeding({
  milkRecords,
  aiRecords,
  staffList,
  onAddMilkRecord,
  onAddAIRecord,
  onUpdateAIStatus,
  onDeleteMilkRecord,
  onDeleteAIRecord,
  cows,
  vetRecords,
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
  onTriggerSectionReport
}: DairyBreedingProps) {
  // Sub-tabs state inside Dairy module
  const [subTab, setSubTab] = useState<'lactation' | 'registry' | 'veterinary' | 'life_ledger' | 'breeding_wheel'>('lactation');

  // Breeding Wheel states
  const [selectedWheelCow, setSelectedWheelCow] = useState<string>('');
  const [simulatedDate, setSimulatedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [wheelHoveredMonth, setWheelHoveredMonth] = useState<number | null>(null);

  // Edit States for Milk, AI, Cow, Vet
  const [editingMilk, setEditingMilk] = useState<MilkingRecord | null>(null);
  const [editingAI, setEditingAI] = useState<AIRecord | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [editingVet, setEditingVet] = useState<VetRecord | null>(null);

  // Milking record states
  const [cowTag, setCowTag] = useState('');
  const [amLiters, setAmLiters] = useState<number | ''>('');
  const [pmLiters, setPmLiters] = useState<number | ''>('');
  const [staffName, setStaffName] = useState(staffList[0]?.name || 'Mosoti');
  const [isMilkSold, setIsMilkSold] = useState(true);
  const [milkPrice, setMilkPrice] = useState<number | ''>(52);
  const [milkBuyer, setMilkBuyer] = useState('Brookside Dairy Ltd');

  // AI record states
  const [aiCowId, setAiCowId] = useState('');
  const [aiDate, setAiDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiBull, setAiBull] = useState('');

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
  const [milkingDate, setMilkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [pedigreeCow, setPedigreeCow] = useState<Cow | null>(null);
  const [showAddCowForm, setShowAddCowForm] = useState(false);
  const [cowSearch, setCowSearch] = useState('');

  // Vet log form states
  const [vetCowId, setVetCowId] = useState('');
  const [vetAnimalCategory, setVetAnimalCategory] = useState<VetRecord['animalCategory']>('Cow');
  const [vetDate, setVetDate] = useState(new Date().toISOString().split('T')[0]);
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
    setMilkingDate(new Date().toISOString().split('T')[0]);
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCowId.trim() || !aiDate || !aiBull.trim()) return;

    // Estimate due date (standard cow gestation is ~283 days)
    const serviceDateObj = new Date(aiDate);
    const dueDateObj = new Date(serviceDateObj);
    dueDateObj.setDate(dueDateObj.getDate() + 283);
    const estimatedDue = dueDateObj.toISOString().split('T')[0];

    onAddAIRecord({
      cowId: aiCowId.trim(),
      date: aiDate,
      bull: aiBull.trim(),
      due: estimatedDue,
      status: 'Pending'
    });

    setAiCowId('');
    setAiDate(new Date().toISOString().split('T')[0]);
    setAiBull('');
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
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'COW MILKING RECORDS & PRODUCTION SALES\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Cow Tag ID,AM Liters,PM Liters,Total Liters,Price/L (Ksh),Buyer,Total Sales (Ksh),Staff Officer\n';
    filteredMilk.forEach((m) => {
      const p = m.pricePerLiter ?? 0;
      const b = m.buyer ?? 'Domestic Use';
      const s = m.totalSales ?? ((m.am + m.pm) * p);
      csv += `${m.date},"${m.id}",${m.am},${m.pm},${(m.am + m.pm).toFixed(2)},${p},"${b}",${s},"${m.staff}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Milking_Production_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadBreedersCSV = () => {
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
    link.setAttribute('download', `Breeders_Cow_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAICyclesCSV = () => {
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
    link.setAttribute('download', `AI_Breeding_Interventions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadVetClinicalCSV = () => {
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
    link.setAttribute('download', `Herd_Veterinary_Interventions_${new Date().toISOString().split('T')[0]}.csv`);
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
    const cowMilks = milkRecords.filter(r => r.id.toLowerCase() === tag.toLowerCase());
    if (cowMilks.length === 0) return 0;
    const total = cowMilks.reduce((sum, r) => sum + r.am + r.pm, 0);
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
  const todayStr = new Date().toISOString().split('T')[0];
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
        nextDate = lastDateObj.toISOString().split('T')[0];
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

  const handleDownloadPedigree = (cow: Cow) => {
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
    const blob = new Blob([certificateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedigree_\${cow.name.toLowerCase()}_\${cow.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dairy Master Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100 text-emerald-950 rounded-2xl shrink-0">
            <Activity size={24} className="text-emerald-800" />
          </div>
          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Premium Dairy & Lactation Hub</h4>
            <p className="text-xs text-slate-400 font-medium">
              Monitor individual calf pipelines, genetic straws, milk scales, deworming calendars, and health indicators at Nyaronde.
            </p>
          </div>
        </div>

        {/* Dynamic sub navigation tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 w-full md:w-auto shrink-0 justify-between self-stretch md:self-auto overflow-x-auto gap-1">
          <button
            onClick={() => setSubTab('lactation')}
            className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
              subTab === 'lactation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Lactation & AI
          </button>
          <button
            onClick={() => setSubTab('registry')}
            className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
              subTab === 'registry' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-805'
            }`}
          >
            Cow Directory
          </button>
          <button
            onClick={() => setSubTab('breeding_wheel')}
            className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
              subTab === 'breeding_wheel' ? 'bg-white text-slate-950 shadow-sm ring-1 ring-emerald-500/20' : 'text-emerald-700 hover:text-emerald-900 bg-emerald-500/5'
            }`}
          >
            🎡 Breeding Wheel
          </button>
          <button
            onClick={() => setSubTab('veterinary')}
            className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 relative ${
              subTab === 'veterinary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vet & Deworming
            {activeRemindersCount > 0 && (
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
          <button
            onClick={() => setSubTab('life_ledger')}
            className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
              subTab === 'life_ledger' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sales & Loss
          </button>
        </div>
      </div>

      {/* SUB-TAB 4: COWS & CALVES SALES & MORTALITY LEDGER */}
      {subTab === 'life_ledger' && (
        <div className="space-y-6 animate-fadeIn" id="life-ledger-dairy">
          
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

            <div className="bg-rose-50 border border-rose-150 rounded-3xl p-5 shadow-xs">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-1">Cattle Mortalities</span>
              <span className="text-2xl font-black font-mono text-rose-950">
                {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length} Animals
              </span>
              <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                Recorded losses requiring sanitary disposal checks
              </p>
            </div>

            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs flex flex-col justify-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Herd Active Rate</span>
              <span className="text-base font-extrabold text-slate-900 mt-1">
                {cows.length} Live Cattle Registered
              </span>
              <p className="text-[10px] text-slate-500 font-medium">
                Active milking register capacity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMN 1: ANIMAL SALES HISTORY */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Cattle Sales & Culling Logs</h4>
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
                  const aType = data.get('animalType') as string;
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
                className="space-y-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Animal Category</label>
                    <select name="animalType" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-xs">
                      <option value="Cow">Milking Cow</option>
                      <option value="Calf">Young Calf</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Tag / ID Number</label>
                    <input type="text" name="animalId" required placeholder="e.g., J-601" className="w-full bg-white border border-slate-205 focus:border-emerald-700 rounded-xl px-3 py-2 font-bold text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Sale Date</label>
                    <input type="date" name="saleDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Sale Value (Ksh)</label>
                    <input type="number" name="salePrice" required placeholder="80000" className="w-full bg-white border border-slate-205 focus:border-emerald-700 rounded-xl px-3 py-2 font-bold text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Buyer / Purchaser Details</label>
                    <input type="text" name="saleBuyer" placeholder="Brookside heifers breeder or local dealer" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Transaction Notes (e.g. Weight, Breed, Lineage, Pedigree status)</label>
                    <input type="text" name="saleNotes" placeholder="e.g. Sold due to low daily lactation yield of 8L or pedigree grade upgrade" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs" />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 m-0">
                  Save Cattle Sale Transaction
                </button>
              </form>

              {/* Sales List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-xs font-bold">No cattle sales transactions recorded.</p>
                ) : (
                  animalSales
                    .filter(s => s.type === 'Cow' || s.type === 'Calf')
                    .map(sale => (
                      <div key={sale.id} className="p-3.5 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs text-slate-900 uppercase">
                              {sale.animalId}
                            </span>
                            <span className="bg-slate-150 text-slate-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {sale.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">
                              {sale.date}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-450 block font-semibold leading-relaxed">
                            Purchaser: {sale.buyer} • Notes: <span className="italic">"{sale.notes}"</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
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
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Cattle Mortality Ledger</h4>
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
                  const mType = data.get('animalType') as string;
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
                className="space-y-4 bg-rose-50/20 border border-rose-100/50 p-4 rounded-2xl"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Animal Category</label>
                    <select name="animalType" className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2.5 font-bold text-xs text-rose-950">
                      <option value="Cow">Milking Cow</option>
                      <option value="Calf">Young Calf</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Tag / ID Number</label>
                    <input type="text" name="animalId" required placeholder="e.g., J-603" className="w-full bg-white border border-slate-205 focus:border-red-700 rounded-xl px-3 py-2 font-bold text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Incident Date</label>
                    <input type="date" name="mortalityDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Cause of Death</label>
                    <select name="mortalityCause" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-xs text-rose-950">
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
                    <input type="text" name="mortalityDisposal" placeholder="e.g. Buried 6ft deep with agricultural chemical lime" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-900 block mb-1">Autopsy / Post-Mortem & Diagnosis Notes</label>
                    <input type="text" name="mortalityNotes" placeholder="e.g. Diagnosed by Dr Devin; triggered by extreme early-morning wet clover bloat" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs" />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 m-0">
                  Save Cattle Loss Incident
                </button>
              </form>

              {/* Mortality List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-xs font-bold">No cattle mortality incidents recorded.</p>
                ) : (
                  mortalities
                    .filter(m => m.type === 'Cow' || m.type === 'Calf')
                    .map(inc => (
                      <div key={inc.id} className="p-3.5 bg-rose-50/10 border border-rose-100 rounded-2xl flex justify-between items-center shadow-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs text-rose-950 uppercase">
                              {inc.animalId}
                            </span>
                            <span className="bg-rose-100 text-rose-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {inc.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">
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

      {/* SUB-TAB 1: LACTATION & AI BREEDING */}
      {subTab === 'lactation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Production Console (Milking Yield Logging) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase flex items-center gap-1">
                <TrendingUp size={12} /> Production Console
              </h5>
              <p className="text-xs text-slate-400 mt-1 font-medium">Record morning & afternoon daily milking yields</p>
            </div>

            <form onSubmit={handleMilkingSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Select / Type Cow Tag ID</label>
                {cows.length > 0 ? (
                  <select
                    required
                    value={cowTag}
                    onChange={(e) => setCowTag(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
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
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">AM Liters</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={amLiters}
                  onChange={(e) => setAmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="Morning L"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">PM Liters</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={pmLiters}
                  onChange={(e) => setPmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="Afternoon L"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Milking Date (Supports Now, Past & Future Dates)</label>
                <input
                  type="date"
                  required
                  value={milkingDate}
                  onChange={(e) => setMilkingDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isMilkSold"
                  checked={isMilkSold}
                  onChange={(e) => setIsMilkSold(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 border-slate-300 rounded focus:ring-emerald-700/10 cursor-pointer"
                />
                <label htmlFor="isMilkSold" className="text-[11px] font-black text-slate-700 uppercase tracking-wide cursor-pointer flex items-center gap-1.5 select-none font-bold">
                  Commercialize Sale (Post to Finance Ledger)
                </label>
              </div>

              {isMilkSold && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Price per Liter (Ksh)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={milkPrice}
                      onChange={(e) => setMilkPrice(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Milk Purchaser / Buyer</label>
                    <input
                      type="text"
                      required
                      value={milkBuyer}
                      onChange={(e) => setMilkBuyer(e.target.value)}
                      placeholder="E.g. Brookside Dairy Ltd"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold text-slate-800"
                    />
                  </div>
                </>
              )}

              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Milking Officer</label>
                <select
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-700"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.unit})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
              >
                Record Milking Log
              </button>
            </form>

            {/* Recents logs */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">Compounded Yield History</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadMilkCSV}
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-900 rounded font-black text-[9px] uppercase transition-all shadow-xs shrink-0 cursor-pointer"
                    title="Export Yield History as CSV"
                  >
                    <FileSpreadsheet size={10} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('milk')}
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-black text-[9px] uppercase transition-all shadow-xs shrink-0 cursor-pointer"
                      title="Export Milking Report as HTML"
                    >
                      <FileDown size={10} />
                      Export Report (HTML)
                    </button>
                  )}
                  <Filter size={12} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter Cow..."
                    value={filterCow}
                    onChange={(e) => setFilterCow(e.target.value)}
                    className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[9px] uppercase font-black">
                      <td className="p-2 font-black uppercase">Cow / Date</td>
                      <td className="p-2 font-black uppercase text-right">Yield AM/PM</td>
                      <td className="p-2 font-black uppercase text-right">Commercials / Buyer</td>
                      <td className="p-2 font-black uppercase">Staff</td>
                      <td className="p-2 font-black uppercase text-center">Actions</td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMilk.map((m, idx) => {
                      const price = m.pricePerLiter ?? 0;
                      const sales = m.totalSales ?? ((m.am + m.pm) * price);
                      const buyer = m.buyer ?? '';
                      return (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40">
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span className="font-black text-slate-800">{m.id}</span>
                              {isHighProducer(m.am, m.pm, m.id) && (
                                <span className="ml-1 inline-block text-[8px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-black uppercase">
                                  Peak
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-slate-400 text-[9px] font-mono block">
                              {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono">
                            <span className="font-black text-emerald-800 block">{(m.am + m.pm).toFixed(1)} L</span>
                            <span className="text-[9px] text-slate-400 block">{m.am} / {m.pm} L</span>
                          </td>
                          <td className="p-2 text-right font-mono">
                            {price > 0 ? (
                              <>
                                <span className="font-black text-slate-800 block">Ksh {sales.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                                <span className="text-[9px] text-slate-400 italic block truncate max-w-[125px]">{buyer}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 font-extrabold text-[9px] uppercase block">Domestic Use</span>
                            )}
                          </td>
                          <td className="p-2 font-semibold text-slate-500 text-[10px] max-w-[80px] truncate">{m.staff}</td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onEditMilkRecord && (
                                <button
                                  onClick={() => setEditingMilk(m)}
                                  className="text-slate-300 hover:text-emerald-900 p-1 rounded transition-colors cursor-pointer m-0 inline-block align-middle border border-transparent hover:border-slate-100 hover:bg-slate-50"
                                  title="Edit Record"
                                >
                                  <PenSquare size={12} />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteMilkRecord(m.id, m.date)}
                                className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 inline-block align-middle border border-transparent hover:border-slate-100 hover:bg-slate-50"
                                title="Delete Record"
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

          {/* Breeding Ledger (AI Tracker) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="text-[11px] font-black tracking-widest text-[#8b0000] uppercase flex items-center gap-1">
                <FlaskConical size={12} /> Breeding Ledger
              </h5>
              <p className="text-xs text-slate-400 mt-1 font-medium">Artificial Insemination (AI) tracker & gestations</p>
            </div>

            <form onSubmit={handleAISubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Inseminated Cow ID</label>
                {cows.length > 0 ? (
                  <select
                    required
                    value={aiCowId}
                    onChange={(e) => setAiCowId(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                  >
                    <option value="">-- Choose cow --</option>
                    {cows.map(c => (
                      <option key={c.id} value={c.id}>{c.id}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={aiCowId}
                    onChange={(e) => setAiCowId(e.target.value)}
                    placeholder="E.g. Cow-101 (Daisy)"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Service Date</label>
                <input
                  type="date"
                  required
                  value={aiDate}
                  onChange={(e) => setAiDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Bull Name / Semen straw reference</label>
                <input
                  type="text"
                  required
                  value={aiBull}
                  onChange={(e) => setAiBull(e.target.value)}
                  placeholder="E.g. SEMEN-HO-991 (Holstein Elite)"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                />
              </div>

              <button
                type="submit"
                className="col-span-2 bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0"
              >
                Log AI Service Straw
              </button>
            </form>

            {/* Dynamic breeding registry table list */}
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-bold">Registered Breeding Gestations</label>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {aiRecords.map((cycle, idx) => {
                  // Determine gestation safety alerts
                  const daysLeft = Math.ceil(
                    (new Date(cycle.due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isClose = daysLeft > 0 && daysLeft <= 30;

                  return (
                    <div key={idx} className="p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-800">{cycle.cowId}</span>
                          {cycle.status === 'Confirmed Pregnant' && (
                            <span className="text-[8px] bg-emerald-150 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black uppercase">
                              Pregnant
                            </span>
                          )}
                          {cycle.status === 'Pending' && (
                            <span className="text-[8px] bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-full font-black uppercase">
                              Awaiting scan
                            </span>
                          )}
                          {cycle.status === 'Calved' && (
                            <span className="text-[8px] bg-purple-50 text-purple-800 border border-purple-100 px-2 py-0.5 rounded-full font-black uppercase">
                              Calved
                            </span>
                          )}
                          {cycle.status === 'Failed' && (
                            <span className="text-[8px] bg-red-50 text-red-800 border border-red-100 px-2 py-0.5 rounded-full font-black uppercase">
                              Failed Straw
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                          Semen: {cycle.bull} • Service: {cycle.date}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                          <Calendar size={12} className="text-rose-700 font-bold shrink-0" />
                          <span>Expected Due: {new Date(cycle.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {daysLeft > 0 && (
                            <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${isClose ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-100'}`}>
                              ({daysLeft} days)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-end gap-2 text-right">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Update Status</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={cycle.status}
                            onChange={(e) => onUpdateAIStatus(cycle.cowId, cycle.date, e.target.value as any)}
                            className="text-[10px] font-black uppercase border border-slate-200 rounded p-1.5 bg-white shrink-0 cursor-pointer focus:outline-none"
                          >
                            <option value="Pending">Pending Scan</option>
                            <option value="Confirmed Pregnant">Confirmed</option>
                            <option value="Calved">Calved</option>
                            <option value="Failed">Straw Failed</option>
                          </select>
                          {onEditAIRecord && (
                            <button
                              onClick={() => setEditingAI(cycle)}
                              className="text-slate-300 hover:text-indigo-800 p-1.5 border border-slate-100 hover:bg-slate-55 rounded transition-colors cursor-pointer m-0"
                              title="Edit Service Record"
                            >
                              <PenSquare size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteAIRecord(cycle.cowId, cycle.date)}
                            className="text-slate-300 hover:text-red-655 p-1.5 border border-slate-100 hover:bg-slate-50 rounded transition-colors cursor-pointer m-0"
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
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search Cow tag ID or name..."
                value={cowSearch}
                onChange={(e) => setCowSearch(e.target.value)}
                className="text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl w-full font-bold focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={downloadBreedersCSV}
                type="button"
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-950 hover:bg-indigo-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                title="Download Cow Directory CSV"
              >
                <FileSpreadsheet size={13} />
                Export Breeders
              </button>
              <button
                onClick={downloadAICyclesCSV}
                type="button"
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-950 hover:bg-rose-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                title="Download AI Records CSV"
              >
                <FileSpreadsheet size={13} />
                Export AI Logs
              </button>
              {onTriggerSectionReport && (
                <button
                  onClick={() => onTriggerSectionReport('ai')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10"
                  title="Export Inseminations Report in HTML"
                >
                  <FileDown size={13} />
                  Insemination Reports (HTML)
                </button>
              )}
              <button
                onClick={() => setShowAddCowForm(!showAddCowForm)}
                className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-900 flex items-center justify-center gap-1.5 m-0 shadow-sm"
              >
                <Plus size={14} /> Add Cow ID Card
              </button>
            </div>
          </div>

          {showAddCowForm && (
            <form onSubmit={handleCowSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
              <h5 className="text-xs uppercase font-black tracking-widest text-[#004d40] border-b border-slate-100 pb-2">Register New Cow Tag</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cow Tag ID (Unique)</label>
                  <input
                    type="text"
                    required
                    value={newCowTag}
                    onChange={(e) => setNewCowTag(e.target.value)}
                    placeholder="E.g. Cow-106"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cow Name</label>
                  <input
                    type="text"
                    required
                    value={newCowName}
                    onChange={(e) => setNewCowName(e.target.value)}
                    placeholder="E.g. Blossom Junior"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breed Type</label>
                  <select
                    value={newCowBreed}
                    onChange={(e) => setNewCowBreed(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                  >
                    <option value="Holstein-Friesian">Holstein-Friesian</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Ayrshire">Ayrshire</option>
                    <option value="Guernsey">Guernsey</option>
                    <option value="Brown Swiss">Brown Swiss</option>
                    <option value="Sahiwal">Sahiwal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newCowDob}
                    onChange={(e) => setNewCowDob(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Lactation State</label>
                  <select
                    value={newCowStatus}
                    onChange={(e) => setNewCowStatus(e.target.value as any)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                  >
                    <option value="Lactating">Lactating (Milking Active)</option>
                    <option value="Dry">Dry (Pregnancy Rest)</option>
                    <option value="Heifer">Heifer (Young Female)</option>
                    <option value="In-Calf">In-Calf (Pregnant Heifer)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peak Yield Target (L/day)</label>
                  <input
                    type="number"
                    value={newCowPeakYield}
                    onChange={(e) => setNewCowPeakYield(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="E.g. 30 (Default)"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Studbook Reg # (Optional)</label>
                  <input
                    type="text"
                    value={newCowReg}
                    onChange={(e) => setNewCowReg(e.target.value)}
                    placeholder="E.g. KAG-HF-2023-1120"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sire / Father</label>
                  <input
                    type="text"
                    value={newCowSire}
                    onChange={(e) => setNewCowSire(e.target.value)}
                    placeholder="E.g. Supreme Bull (SH-404)"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Dam / Mother</label>
                  <input
                    type="text"
                    value={newCowDam}
                    onChange={(e) => setNewCowDam(e.target.value)}
                    placeholder="E.g. Daisy Mother (DM-09)"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>

                {/* Sub-generation Grandparents */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Paternal Grand Sire</label>
                  <input
                    type="text"
                    value={newCowGsp}
                    onChange={(e) => setNewCowGsp(e.target.value)}
                    placeholder="Sire's Father"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Paternal Grand Dam</label>
                  <input
                    type="text"
                    value={newCowGdp}
                    onChange={(e) => setNewCowGdp(e.target.value)}
                    placeholder="Sire's Mother"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Maternal Grand Sire</label>
                  <input
                    type="text"
                    value={newCowGsm}
                    onChange={(e) => setNewCowGsm(e.target.value)}
                    placeholder="Dam's Father"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Maternal Grand Dam</label>
                  <input
                    type="text"
                    value={newCowGdm}
                    onChange={(e) => setNewCowGdm(e.target.value)}
                    placeholder="Dam's Mother"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>

                <div className="col-span-1 md:col-span-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Lactation Grade Notes</label>
                  <input
                    type="text"
                    value={newCowNotes}
                    onChange={(e) => setNewCowNotes(e.target.value)}
                    placeholder="E.g. High lactation yield index, first calving expected with zero stress..."
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCowForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0 shadow-sm">
                  Register Cow Card
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cows
              .filter(c => c.id.toLowerCase().includes(cowSearch.toLowerCase()) || c.name.toLowerCase().includes(cowSearch.toLowerCase()))
              .map(cow => {
                const avgYield = getAverageYield(cow.id);
                return (
                  <div key={cow.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-200 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-black text-slate-800 text-[13.5px] uppercase block tracking-wider">{cow.id}</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-1 block">Name: <span className="text-slate-600 font-extrabold">{cow.name}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          {onEditCow && (
                            <button
                              onClick={() => setEditingCow(cow)}
                              className="text-slate-300 hover:text-indigo-805 p-1.5 rounded transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0"
                              title="Edit Cow Details"
                            >
                              <PenSquare size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteCow(cow.id)}
                            className="text-slate-300 hover:text-red-600 p-1.5 rounded transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0"
                            title="Delete Cow Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="bg-slate-55 bg-slate-50/50 p-2 border border-slate-100/40 rounded-xl">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Breed</span>
                          <span className="font-extrabold text-slate-700 truncate block mt-0.5">{cow.breed}</span>
                        </div>
                        <div className="bg-slate-55 bg-slate-50/50 p-2 border border-slate-100/40 rounded-xl">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Calculated Age</span>
                          <span className="font-extrabold text-slate-700 block mt-0.5">{getCowAge(cow.dob)}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase">State Status:</span>
                        <select
                          value={cow.status}
                          onChange={(e) => onUpdateCowStatus(cow.id, e.target.value as any)}
                          className="text-[10px] font-black uppercase text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-250 cursor-pointer focus:outline-none"
                        >
                          <option value="Lactating">Lactating</option>
                          <option value="Dry">Dry</option>
                          <option value="Heifer">Heifer</option>
                          <option value="In-Calf">In-Calf</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-100/65 mt-4 pt-3 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span className="uppercase text-slate-400 font-extrabold flex items-center gap-1">
                          <GitFork size={11} className="text-emerald-700" /> Ancestry / Lineage
                        </span>
                        {cow.registrationNo ? (
                          <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 uppercase font-black">{cow.registrationNo}</span>
                        ) : (
                          <span className="text-slate-400 italic">No Studbook Reg</span>
                        )}
                      </div>
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 space-y-1.5 text-[11px] leading-tight">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Sire:</span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[150px]" title={cow.sire || 'Unregistered Bull'}>
                            {cow.sire || 'Unknown Sire ♂'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Dam:</span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[150px]" title={cow.dam || 'Unregistered Cow'}>
                            {cow.dam || 'Unknown Dam ♀'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100/60 mt-4 pt-3 space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 font-bold flex items-center gap-1">
                        <Activity size={11} className="text-emerald-700" /> Lactation Yield Metric
                      </span>
                      <div className="flex justify-between items-center bg-emerald-50/30 p-2 rounded-xl border border-emerald-100">
                        <span className="text-xs text-slate-500 font-bold">Log average per day:</span>
                        <span className="text-xs font-black font-mono text-emerald-850">
                          {avgYield > 0 ? `${avgYield.toFixed(1)} Liters` : 'No logs'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold italic mt-2">"{cow.notes}"</p>
                    </div>

                    <div className="pt-2 border-t border-slate-50">
                      <button
                        onClick={() => setPedigreeCow(cow)}
                        className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer m-0"
                      >
                        🧬 View Pedigree Family Tree
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VETERINARY LOGS & DEWORMING REMINDERS */}
      {subTab === 'veterinary' && (
        <div className="space-y-6">
          {/* Active Deworming Alerts section */}
          {activeRemindersCount > 0 ? (
            <div className="bg-red-50 border border-red-150 p-6 rounded-3xl space-y-3 shadow-xs">
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
                    <div key={rem.cow.id} className="p-3 bg-white border border-red-100 rounded-2xl flex justify-between items-center shadow-xs">
                      <div>
                        <span className="text-xs font-black text-slate-800 block uppercase">{rem.cow.id} ({rem.cow.name})</span>
                        <span className="text-[10px] text-slate-400 font-extrabold block uppercase mt-0.5 mt-1">{rem.cow.breed} • Status: {rem.cow.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase text-red-700 bg-red-100 border border-red-200">
                          {rem.status === 'overdue' ? 'Overdue Dose' : 'Due Soon'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-mono block mt-1">{rem.text}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-800 shrink-0" />
              <div>
                <h5 className="text-[#0e4d29] text-xs font-extrabold uppercase">ALL HERD DEWORMING COMPLIANT</h5>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Every cow has received a broad spectrum anthelmintic dose within the required timeline safety metrics.</p>
              </div>
            </div>
          )}

          {/* Controls & Search */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search medications or diagnosis..."
                value={vetSearch}
                onChange={(e) => setVetSearch(e.target.value)}
                className="text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl w-full font-bold focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={downloadVetClinicalCSV}
                type="button"
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-50 border border-red-205 text-red-950 hover:bg-red-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                title="Download Vet Logs CSV"
              >
                <FileSpreadsheet size={13} />
                Export Vet History
              </button>
              {onTriggerSectionReport && (
                <button
                  onClick={() => onTriggerSectionReport('vet')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10"
                  title="Export Vet History Report as HTML"
                >
                  <FileDown size={13} />
                  Export Vet Report (HTML)
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
            <form onSubmit={handleVetSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-slate-50 -m-6 mb-4 p-6 rounded-t-2xl">
                <div>
                  <h5 className="text-sm uppercase font-black tracking-widest text-[#1a237e]">Log Comprehensive Veterinary Clinical Intervention</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Professional clinical-grade chart for veterinarians & caregivers</p>
                </div>
                <span className="bg-[#1a237e]/10 text-[#1a237e] text-[9px] font-black uppercase px-2 py-1 rounded border border-[#1a237e]/20">Registered Practitioner Mode</span>
              </div>

              {/* SECTION A: PATIENT IDENTITY & ENTRY TIMING */}
              <div className="space-y-3">
                <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">1. Patient Identification & Timeline</h6>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Animal Category</label>
                    <select
                      value={vetAnimalCategory}
                      onChange={(e) => setVetAnimalCategory(e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
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
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Patient Identifier / Tag ID</label>
                    {vetAnimalCategory === 'Cow' && cows.length > 0 ? (
                      <select
                        required
                        value={vetCowId}
                        onChange={(e) => setVetCowId(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
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
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Intervention Date (Historical / Recent)</label>
                    <input
                      type="date"
                      required
                      value={vetDate}
                      onChange={(e) => setVetDate(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Intervention Class</label>
                    <select
                      value={vetType}
                      onChange={(e) => setVetType(e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
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
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">2. Clinical Vitals & Diagnosis</h6>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Body Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vetTemp}
                      onChange={(e) => setVetTemp(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="E.g. 38.5"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={vetHeartRate}
                      onChange={(e) => setVetHeartRate(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="E.g. 60"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Respiratory Rate (breaths/min)</label>
                    <input
                      type="number"
                      value={vetRespRate}
                      onChange={(e) => setVetRespRate(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="E.g. 24"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-505 uppercase block mb-1">Primary Diagnosis / Indication</label>
                    <input
                      type="text"
                      value={vetDiagnosis}
                      onChange={(e) => setVetDiagnosis(e.target.value)}
                      placeholder="E.g. Sub-clinical Mastitis, Anaplasmosis"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: PHARMACOLOGY, ROUTE & COST */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">3. Pharmacological Treatment Plan</h6>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Medication / Treatment Description</label>
                    <input
                      type="text"
                      required
                      value={vetTreatment}
                      onChange={(e) => setVetTreatment(e.target.value)}
                      placeholder="E.g. Intramammary antibiotic infusion, Alben_bolus..."
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Active Drug Name</label>
                    <input
                      type="text"
                      value={vetDrug}
                      onChange={(e) => setVetDrug(e.target.value)}
                      placeholder="E.g. Penicillin G, Albendazole"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Dosage Administered</label>
                    <input
                      type="text"
                      value={vetDosage}
                      onChange={(e) => setVetDosage(e.target.value)}
                      placeholder="E.g. 20ml IM, 1 bolus"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Administration Route</label>
                    <select
                      value={vetRoute}
                      onChange={(e) => setVetRoute(e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
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
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h6 className="text-[10px] font-black tracking-wider text-indigo-900 uppercase">4. Withdrawal Regulations & Compliance Alerts</h6>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Milk Withdrawal (Days)</label>
                    <input
                      type="number"
                      value={vetWithdrawalMilk}
                      onChange={(e) => setVetWithdrawalMilk(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="E.g. 3 (Milk discard)"
                      className="text-xs border border-amber-200 bg-amber-50/20 text-amber-955 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Meat Withdrawal (Days)</label>
                    <input
                      type="number"
                      value={vetWithdrawalMeat}
                      onChange={(e) => setVetWithdrawalMeat(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="E.g. 21 (No slaughter)"
                      className="text-xs border border-amber-200 bg-amber-50/20 text-amber-955 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Intervention Cost (Ksh)</label>
                    <input
                      type="number"
                      value={vetCost}
                      onChange={(e) => setVetCost(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="E.g. 1500"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Prognosis Evaluation</label>
                    <select
                      value={vetPrognosis}
                      onChange={(e) => setVetPrognosis(e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                    >
                      <option value="Good">Good (Favorable recovery expected)</option>
                      <option value="Fair">Fair (Moderate recovery chance)</option>
                      <option value="Guarded">Guarded (Uncertain/Complex response)</option>
                      <option value="Poor">Poor (High structural damage / warning)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Next Follow-up & Due Date</label>
                    <input
                      type="date"
                      value={vetNextDue}
                      onChange={(e) => setVetNextDue(e.target.value)}
                      className="text-xs border border-slate-205 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="vetRetreatmentScheduled"
                    checked={vetRetreatmentScheduled}
                    onChange={(e) => setVetRetreatmentScheduled(e.target.checked)}
                    className="w-4 h-4 text-indigo-900 border-slate-300 rounded"
                  />
                  <label htmlFor="vetRetreatmentScheduled" className="text-[11px] font-extrabold text-slate-705 uppercase selection:bg-transparent">
                    Flag for scheduled Retreatment Visit (System-monitored follow-up)
                  </label>
                </div>
              </div>

              {/* NOTES & STAFF SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Practitioner Notes & Observational Observations</label>
                  <input
                    type="text"
                    value={vetNotes}
                    onChange={(e) => setVetNotes(e.target.value)}
                    placeholder="E.g. Normal rumination index, mild congestion of mucosal membrane. Advised owner to avoid damp stalls."
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Supervising Veterinary Surgeon</label>
                  <select
                    value={vetStaff}
                    onChange={(e) => setVetStaff(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold text-indigo-950"
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
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0 cursor-pointer"
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
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h5 className="text-[10px] font-black tracking-wider text-slate-400 uppercase font-bold uppercase">HERD INTERVENTION HISTORY TIMELINE</h5>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {[...vetRecords]
                .filter(r => r.treatment.toLowerCase().includes(vetSearch.toLowerCase()) || r.cowId.toLowerCase().includes(vetSearch.toLowerCase()) || r.notes.toLowerCase().includes(vetSearch.toLowerCase()))
                .sort((a,b) => b.date.localeCompare(a.date))
                .map((record) => (
                  <div key={record.id} className="p-4 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50/50 shadow-sm transition-all flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          record.type === 'Deworming' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' :
                          record.type === 'Treatment' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          record.type === 'Vaccination' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          'bg-indigo-50 text-indigo-805 border-indigo-200'
                        }`}>
                          {record.type}
                        </span>
                        
                        <span className="bg-slate-100 text-slate-800 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-slate-200">
                          {record.animalCategory || 'Cow'}
                        </span>
                        
                        <h6 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                          Identifier / Tag: <span className="text-emerald-900 font-extrabold">{record.cowId}</span>
                        </h6>

                        {record.prognosis && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ml-auto ${
                            record.prognosis === 'Good' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            record.prognosis === 'Fair' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            record.prognosis === 'Guarded' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            Prognosis: {record.prognosis}
                          </span>
                        )}
                      </div>

                      {/* Diagnosis & Treatment */}
                      <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-1">
                        {record.diagnosis && (
                          <p className="text-xs font-bold text-indigo-950">
                            Clinical Diagnosis: <span className="font-black text-slate-900">{record.diagnosis}</span>
                          </p>
                        )}
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">
                          Medication / Intervention: <span className="font-extrabold text-slate-950">{record.treatment}</span>
                        </p>
                        {(record.drugAdministered || record.dosage) && (
                          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex flex-wrap gap-x-3 gap-y-1">
                            {record.drugAdministered && <span>💊 Active Drug: <b className="text-slate-800">{record.drugAdministered}</b></span>}
                            {record.dosage && <span>⚖️ Dosage: <b className="text-slate-800">{record.dosage}</b></span>}
                            {record.administrationRoute && <span>💉 Route: <b className="text-slate-800">{record.administrationRoute}</b></span>}
                          </div>
                        )}
                      </div>

                      {/* Clinical Vitals */}
                      {(record.temperature || record.heartRate || record.respiratoryRate) && (
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600 bg-slate-50/30 p-2 rounded-lg border border-slate-100">
                          {record.temperature && <span>🌡️ Temp: <b className="text-slate-950">{record.temperature}°C</b></span>}
                          {record.heartRate && <span>❤️ Heart Rate: <b className="text-slate-950">{record.heartRate} bpm</b></span>}
                          {record.respiratoryRate && <span>🫁 Resp Rate: <b className="text-slate-950">{record.respiratoryRate} bpm</b></span>}
                        </div>
                      )}

                      {/* Withdrawal Periods Warnings */}
                      {(record.withdrawalMilkDays || record.withdrawalMeatDays) && (
                        <div className="flex flex-wrap gap-3 p-2 rounded-xl bg-amber-50/40 border border-amber-100">
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

                      <p className="text-xs font-semibold text-slate-500 italic">
                        Observations: "{record.notes}"
                      </p>

                      {record.nextDueDate && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 w-fit">
                          <Timer size={12} />
                          <span>Deadline reminder / Follow-up due: <b className="font-black underline">{record.nextDueDate}</b></span>
                        </div>
                      )}

                      {record.retreatmentScheduled && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-red-900 bg-red-50 p-1.5 px-2.5 rounded-lg border border-red-100 w-fit uppercase">
                          <span>🔔 Critical: Retreatment Scheduled</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-4 text-left md:text-right shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block font-bold">Intervention Timestamp</span>
                        <span className="text-xs font-black font-semibold text-indigo-950 block mt-0.5 font-mono">{record.date}</span>
                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{record.staff}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {record.cost > 0 && (
                          <span className="text-xs font-mono font-black text-red-700 bg-red-50/50 border border-red-100 px-2.5 py-0.5 rounded-full inline-block">
                            Ksh {record.cost.toLocaleString()}
                          </span>
                        )}
                        {onEditVetRecord && (
                          <button
                            onClick={() => setEditingVet(record)}
                            className="text-slate-300 hover:text-indigo-805 p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0"
                            title="Edit health record"
                          >
                            <PenSquare size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteVetRecord(record.id)}
                          className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0"
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
                color: 'text-amber-600 bg-amber-50 border-amber-200'
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
                color: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse'
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
                <p className="text-xs text-emerald-350 font-medium leading-relaxed max-w-2xl">
                  Simulate gestation timelines clockwise. Plot services (12 o'clock starting sector), follow gestating development (blue), track mandatory dry-off dates (amber at 220 days), and countdown to calving due (red at 283 days).
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
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
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              
              {/* Left pane: The Circular SVG Wheel (col 6) */}
              <div className="lg:col-span-6 bg-white border border-slate-150 p-6 rounded-3xl shadow-xs flex flex-col items-center justify-center space-y-4">
                
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
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase text-slate-500 font-sans border-t pt-3 w-full">
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
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Focus Cow Scorecard</span>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
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
                      <div className="bg-slate-50 p-3 rounded-2xl border">
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-0.5">Lineage AI Straw</span>
                        <span className="font-extrabold text-slate-800 block">
                          {focusedCowData.latestAI ? focusedCowData.latestAI.bull : 'None Logged'}
                        </span>
                        <span className="text-[8.5px] font-semibold text-slate-450 block mt-1">
                          Insemination: {focusedCowData.latestAI ? focusedCowData.latestAI.date : 'N/A'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border">
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-0.5">Calculated Calving due</span>
                        <span className="font-extrabold text-rose-800 block">
                          {focusedCowData.latestAI ? focusedCowData.latestAI.due : 'None Logged'}
                        </span>
                        <span className="text-[8.5px] font-semibold text-slate-450 block mt-1">
                          Approx {focusedCowData.latestAI ? '283 days gestation' : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Gestation Proband Status Description bar */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">🗓️ Chronological Cycle Status</p>
                      <p className="text-xs text-slate-700 font-semibold mt-1 leading-relaxed">
                        {focusedCowData.scoreText}
                      </p>
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
                  <div className="bg-slate-50 border p-6 rounded-3xl text-center text-slate-450 py-12">
                    Select a cow node or name from the list to display interactive cycle statistics.
                  </div>
                )}

                {/* 2. Urgent Events Forecasting Window */}
                <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div className="text-left">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">30-Day Gestation Forecast Planner</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Calculated countdowns from simulated clock date</p>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2.5 py-1 rounded font-mono">
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
                            <span className="font-mono text-xs font-black px-2.5 py-1 bg-white/60 border rounded-lg inline-block">
                              {evt.daysLeft === 0 ? 'DUE TODAY' : `In ${evt.daysLeft} days`}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Cow Directory Listing for quick wheel selection */}
                <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="border-b pb-3 flex justify-between items-center">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">Herd Reproductive Directory</h5>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Quick Selector</span>
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
                              : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Milk Record</h3>
              <button onClick={() => setEditingMilk(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cow / Tag ID</label>
                  <input
                    type="text"
                    value={editingMilk.id}
                    disabled
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-slate-50 text-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Record Date</label>
                  <input
                    type="date"
                    value={editingMilk.date}
                    disabled
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-slate-50 text-slate-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">AM Yield Details (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMilk.am}
                    onChange={(e) => setEditingMilk({ ...editingMilk, am: parseFloat(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">PM Yield Details (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMilk.pm}
                    onChange={(e) => setEditingMilk({ ...editingMilk, pm: parseFloat(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Supervising Operator</label>
                <select
                  value={editingMilk.staff}
                  onChange={(e) => setEditingMilk({ ...editingMilk, staff: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingMilk(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditMilkRecord) {
                    onEditMilkRecord(editingMilk.id, editingMilk.date, editingMilk);
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

      {/* Edit AI Breeding Record Modal */}
      {editingAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Insemination Log</h3>
              <button onClick={() => setEditingAI(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Cow ID</label>
                  <input
                    type="text"
                    value={editingAI.cowId}
                    disabled
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-slate-50 text-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Service Date</label>
                  <input
                    type="date"
                    value={editingAI.date}
                    disabled
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-slate-50 text-slate-400 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bull / Semen Code</label>
                  <input
                    type="text"
                    value={editingAI.bull}
                    onChange={(e) => setEditingAI({ ...editingAI, bull: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Scanned Pregnancy Status</label>
                  <select
                    value={editingAI.status}
                    onChange={(e) => setEditingAI({ ...editingAI, status: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    <option value="Pending">Pending Scan</option>
                    <option value="Confirmed Pregnant">Confirmed Pregnant</option>
                    <option value="Calved">Calved</option>
                    <option value="Failed">Straw Failed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Expected Due Date</label>
                <input
                  type="date"
                  value={editingAI.due}
                  onChange={(e) => setEditingAI({ ...editingAI, due: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingAI(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditAIRecord) {
                    onEditAIRecord(editingAI.cowId, editingAI.date, editingAI);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Cow Record & Pedigree</h3>
              <button onClick={() => setEditingCow(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cow TAG / ID</label>
                  <input
                    type="text"
                    value={editingCow.id}
                    disabled
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-slate-50 text-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cow Friendly Name</label>
                  <input
                    type="text"
                    value={editingCow.name}
                    onChange={(e) => setEditingCow({ ...editingCow, name: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breed Class</label>
                  <input
                    type="text"
                    value={editingCow.breed}
                    onChange={(e) => setEditingCow({ ...editingCow, breed: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingCow.dob}
                    onChange={(e) => setEditingCow({ ...editingCow, dob: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Milking/Production Status</label>
                  <select
                    value={editingCow.status}
                    onChange={(e) => setEditingCow({ ...editingCow, status: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-white"
                  >
                    <option value="Lactating">Lactating</option>
                    <option value="Dry">Dry Rest</option>
                    <option value="Heifer">Heifer</option>
                    <option value="In-Calf">In-Calf</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peak Yield Target (L/day)</label>
                  <input
                    type="number"
                    value={editingCow.peakYieldTarget || ''}
                    onChange={(e) => setEditingCow({ ...editingCow, peakYieldTarget: e.target.value === '' ? undefined : Number(e.target.value) })}
                    placeholder="E.g. 30"
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Studbook Reg # (Optional)</label>
                  <input
                    type="text"
                    value={editingCow.registrationNo || ''}
                    onChange={(e) => setEditingCow({ ...editingCow, registrationNo: e.target.value })}
                    placeholder="E.g. KAG-HF-2023-1120"
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {/* Pedigree section border divider */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">Pedigree Tree Config (Ancestry Ledger)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Sire (Father)</label>
                    <input
                      type="text"
                      value={editingCow.sire || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, sire: e.target.value })}
                      className="border border-slate-205 border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Dam (Mother)</label>
                    <input
                      type="text"
                      value={editingCow.dam || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, dam: e.target.value })}
                      className="border border-slate-205 border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">Paternal Grand Sire</label>
                    <input
                      type="text"
                      value={editingCow.grandSirePaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandSirePaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">Paternal Grand Dam</label>
                    <input
                      type="text"
                      value={editingCow.grandDamPaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandDamPaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">Maternal Grand Sire</label>
                    <input
                      type="text"
                      value={editingCow.grandSireMaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandSireMaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">Maternal Grand Dam</label>
                    <input
                      type="text"
                      value={editingCow.grandDamMaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandDamMaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Lactation Grade / General Notes</label>
                <input
                  type="text"
                  value={editingCow.notes || ''}
                  onChange={(e) => setEditingCow({ ...editingCow, notes: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-semibold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingCow(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-800">Edit Clinical Veterinary Log</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Adjust clinical parameters and medical records</p>
              </div>
              <button onClick={() => setEditingVet(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 text-left">
              {/* Patient and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Animal Category</label>
                  <select
                    value={editingVet.animalCategory || 'Cow'}
                    onChange={(e) => setEditingVet({ ...editingVet, animalCategory: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
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
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tag ID / Cow Ref</label>
                  <input
                    type="text"
                    value={editingVet.cowId}
                    onChange={(e) => setEditingVet({ ...editingVet, cowId: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Type</label>
                  <select
                    value={editingVet.type}
                    onChange={(e) => setEditingVet({ ...editingVet, type: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
                  >
                    <option value="Deworming">Deworming</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="General Practice">General Practice</option>
                  </select>
                </div>
              </div>

              {/* Vitals and Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingVet.temperature || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, temperature: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Heart (bpm)</label>
                  <input
                    type="number"
                    value={editingVet.heartRate || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, heartRate: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Resp (bpm)</label>
                  <input
                    type="number"
                    value={editingVet.respiratoryRate || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, respiratoryRate: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={editingVet.diagnosis || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, diagnosis: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Treatment and Pharmacology */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Intervention</label>
                  <input
                    type="text"
                    required
                    value={editingVet.treatment}
                    onChange={(e) => setEditingVet({ ...editingVet, treatment: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Drug Name</label>
                  <input
                    type="text"
                    value={editingVet.drugAdministered || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, drugAdministered: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={editingVet.dosage || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, dosage: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Routing, Cost, and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Route</label>
                  <select
                    value={editingVet.administrationRoute || 'IM'}
                    onChange={(e) => setEditingVet({ ...editingVet, administrationRoute: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
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
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cost (Ksh)</label>
                  <input
                    type="number"
                    value={editingVet.cost}
                    onChange={(e) => setEditingVet({ ...editingVet, cost: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Log Date</label>
                  <input
                    type="date"
                    value={editingVet.date}
                    onChange={(e) => setEditingVet({ ...editingVet, date: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Prognosis</label>
                  <select
                    value={editingVet.prognosis || 'Good'}
                    onChange={(e) => setEditingVet({ ...editingVet, prognosis: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Guarded">Guarded</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              {/* Withdrawals and Follow-ups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Milk Withdrawal (Days)</label>
                  <input
                    type="number"
                    value={editingVet.withdrawalMilkDays || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, withdrawalMilkDays: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    className="border border-amber-200 bg-amber-50/20 text-amber-955 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Meat Withdrawal (Days)</label>
                  <input
                    type="number"
                    value={editingVet.withdrawalMeatDays || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, withdrawalMeatDays: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    className="border border-amber-200 bg-amber-50/20 text-amber-955 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Next Follow-up Due</label>
                  <input
                    type="date"
                    value={editingVet.nextDueDate || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, nextDueDate: e.target.value || undefined })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {/* Retreatment alert and Staff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                  <input
                    type="checkbox"
                    id="editVetRetreatment"
                    checked={editingVet.retreatmentScheduled || false}
                    onChange={(e) => setEditingVet({ ...editingVet, retreatmentScheduled: e.target.checked })}
                    className="w-4 h-4 text-indigo-900 border-slate-300 rounded"
                  />
                  <label htmlFor="editVetRetreatment" className="text-[10px] font-black text-rose-950 uppercase selection:bg-transparent">
                    Retreatment Scheduled visit
                  </label>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Supervising Officer</label>
                  <input
                    type="text"
                    value={editingVet.staff}
                    onChange={(e) => setEditingVet({ ...editingVet, staff: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold text-indigo-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Notes / Observations</label>
                <textarea
                  value={editingVet.notes}
                  onChange={(e) => setEditingVet({ ...editingVet, notes: e.target.value })}
                  rows={2}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingVet(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl p-6 md:p-8 border border-slate-100 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    Official Pedigree Deed
                  </span>
                  {pedigreeCow.registrationNo && (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider border border-blue-200">
                      Reg: {pedigreeCow.registrationNo}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
                  <Award className="text-amber-500" size={20} />
                  Lineage: {pedigreeCow.name}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  Tag ID: {pedigreeCow.id} | Breed: {pedigreeCow.breed} | DOB: {pedigreeCow.dob}
                </p>
              </div>
              <button 
                onClick={() => setPedigreeCow(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-lg m-0 p-1 cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Tree Presentation Area */}
            <div className="py-2">
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-4 text-center tracking-widest">
                Three Generation Ancestor Pedigree Mapping (Live Active Ledger)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {/* FIRST GENERATION: PROBAND (SELF) */}
                <div className="flex flex-col justify-center">
                  <div className="p-4 bg-emerald-50/50 border-2 border-emerald-950/20 rounded-2xl shadow-sm text-center relative hover:border-emerald-600 transition-colors">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-950 text-white rounded px-2 py-0.5 text-[8px] uppercase font-black tracking-wider">
                      Proband/Subject
                    </div>
                    <div className="pt-4 pb-2">
                      <span className="text-base font-black text-slate-900 block mt-1">{pedigreeCow.name}</span>
                      <span className="text-[11px] font-bold text-slate-400 block mt-1">Tag: {pedigreeCow.id}</span>
                      <span className="text-[10px] bg-emerald-950/10 text-emerald-900 font-black px-2 py-1 rounded mt-2 inline-block">
                        Breed: {pedigreeCow.breed}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECOND GENERATION: PARENTS */}
                <div className="flex flex-col justify-center space-y-6">
                  {/* SIRE (FATHER ♂) */}
                  <div className="p-4 bg-blue-50/20 border-2 border-blue-900/10 rounded-2xl shadow-sm relative hover:border-blue-400 transition-colors">
                    <span className="text-[8px] font-black uppercase text-blue-700 block tracking-wider mb-1">Sire / Father ♂</span>
                    <span className="text-sm font-black text-slate-800 block">{pedigreeCow.sire || 'Imported Semen Specimen'}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">Certified Pureblood Lineage</span>
                    
                    {pedigreeCow.sire && cows.find(c => c.id.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase()) && (
                      <button 
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
                  <div className="p-4 bg-rose-50/20 border-2 border-rose-900/10 rounded-2xl shadow-sm relative hover:border-rose-400 transition-colors">
                    <span className="text-[8px] font-black uppercase text-rose-700 block tracking-wider mb-1">Dam / Mother ♀</span>
                    <span className="text-sm font-black text-slate-800 block">{pedigreeCow.dam || 'Acr-Grade Sire Maternal'}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">Excellent Butterfat Producer</span>

                    {pedigreeCow.dam && cows.find(c => c.id.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase()) && (
                      <button 
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
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-[7.5px] font-black uppercase text-blue-600 block">Paternal Grand Sire</span>
                      <span className="text-xs font-bold text-slate-800 block">{pedigreeCow.grandSirePaternal || 'Sire Sire G2 ♂'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-[7.5px] font-black uppercase text-rose-600 block">Paternal Grand Dam</span>
                      <span className="text-xs font-bold text-slate-800 block">{pedigreeCow.grandDamPaternal || 'Sire Dam G2 ♀'}</span>
                    </div>
                  </div>

                  {/* MATERNAL GRANDPARENTS */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-[7.5px] font-black uppercase text-blue-600 block">Maternal Grand Sire</span>
                      <span className="text-xs font-bold text-slate-800 block">{pedigreeCow.grandSireMaternal || 'Dam Sire G2 ♂'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-[7.5px] font-black uppercase text-rose-600 block">Maternal Grand Dam</span>
                      <span className="text-xs font-bold text-slate-800 block">{pedigreeCow.grandDamMaternal || 'Dam Dam G2 ♀'}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pedigree Certificate Actions (Download & Print) */}
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 text-center sm:text-left">
                <Sparkles className="text-emerald-700 shrink-0" size={15} />
                <span>Verified by JR Cooperative Registry board. Ready for local Studbook print download.</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleDownloadPedigree(pedigreeCow)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase rounded-xl transition-all shadow-sm cursor-pointer m-0"
                >
                  <Download size={13} />
                  Download Pedigree Slip (HTML)
                </button>
                <button
                  onClick={() => {
                    // Open a small customizable print setup of this element or trigger download
                    handleDownloadPedigree(pedigreeCow);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase rounded-xl transition-all cursor-pointer m-0"
                  title="Generate certified documentation of the breeding pedigree chart"
                >
                  <Printer size={13} />
                  Print Official Deed
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setPedigreeCow(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase text-xs rounded-xl transition-colors cursor-pointer m-0"
              >
                Close Family Tree
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
