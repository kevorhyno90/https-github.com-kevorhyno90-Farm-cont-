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
  onTriggerSectionReport
}: DairyBreedingProps) {
  // Sub-tabs state inside Dairy module
  const [subTab, setSubTab] = useState<'lactation' | 'registry' | 'veterinary'>('lactation');

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
  const [aiDate, setAiDate] = useState('');
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
  const [pedigreeCow, setPedigreeCow] = useState<Cow | null>(null);
  const [showAddCowForm, setShowAddCowForm] = useState(false);
  const [cowSearch, setCowSearch] = useState('');

  // Vet log form states
  const [vetCowId, setVetCowId] = useState('');
  const [vetType, setVetType] = useState<VetRecord['type']>('Deworming');
  const [vetTreatment, setVetTreatment] = useState('');
  const [vetCost, setVetCost] = useState<number | ''>('');
  const [vetStaff, setVetStaff] = useState(staffList[0]?.name || 'Dr. Devin Omwenga');
  const [vetNotes, setVetNotes] = useState('');
  const [vetNextDue, setVetNextDue] = useState('');
  const [showAddVetForm, setShowAddVetForm] = useState(false);
  const [vetSearch, setVetSearch] = useState('');

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
      date: new Date().toISOString().split('T')[0],
      pricePerLiter: prVal,
      buyer: buyVal,
      totalSales: isMilkSold ? (totalVol * prVal) : 0
    });
    setCowTag('');
    setAmLiters('');
    setPmLiters('');
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
    setAiDate('');
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
      registrationNo: newCowReg.trim() || undefined
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
    setShowAddCowForm(false);
  };

  const handleVetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetCowId || !vetTreatment.trim()) return;

    onAddVetRecord({
      id: `vet-${Date.now()}`,
      cowId: vetCowId,
      date: new Date().toISOString().split('T')[0],
      type: vetType,
      treatment: vetTreatment.trim(),
      nextDueDate: vetType === 'Deworming' ? (vetNextDue || undefined) : undefined,
      cost: vetCost === '' ? 0 : Number(vetCost),
      staff: vetStaff,
      notes: vetNotes.trim() || 'Administered successfully'
    });

    setVetTreatment('');
    setVetCost('');
    setVetNotes('');
    setVetNextDue('');
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

  // High production cows warning highlight (e.g. >30L total per day)
  const isHighProducer = (am: number, pm: number) => am + pm >= 30;

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
          <div className="p-3.5 bg-emerald-150 bg-emerald-100 text-emerald-950 rounded-2xl shrink-0">
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
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 w-full md:w-auto shrink-0 justify-between self-stretch md:self-auto">
          <button
            onClick={() => setSubTab('lactation')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
              subTab === 'lactation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Lactation & AI
          </button>
          <button
            onClick={() => setSubTab('registry')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 flex items-center gap-1.5 ${
              subTab === 'registry' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cow Identity Directory
          </button>
          <button
            onClick={() => setSubTab('veterinary')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 flex items-center gap-1.5 relative ${
              subTab === 'veterinary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vet & Deworming Care
            {activeRemindersCount > 0 && (
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>
      </div>

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
                              {isHighProducer(m.am, m.pm) && (
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
            <form onSubmit={handleVetSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
              <h5 className="text-xs uppercase font-black tracking-widest text-[#1a237e] border-b border-slate-100 pb-2">Log Medical Action</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Animal (Cow)</label>
                  {cows.length > 0 ? (
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
                      placeholder="E.g. Cow-101 (Daisy)"
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Intervention Type</label>
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
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Treatment / Medication Administered</label>
                  <input
                    type="text"
                    required
                    value={vetTreatment}
                    onChange={(e) => setVetTreatment(e.target.value)}
                    placeholder="E.g. Albendazole 1500mg, Pen-Strep..."
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Financial Cost (Ksh)</label>
                  <input
                    type="number"
                    value={vetCost}
                    onChange={(e) => setVetCost(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="E.g. 1500"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                  />
                </div>
                {vetType === 'Deworming' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Next Deworming Due Date</label>
                    <input
                      type="date"
                      required
                      value={vetNextDue}
                      onChange={(e) => setVetNextDue(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Supervising Officer / Vet</label>
                  <select
                    value={vetStaff}
                    onChange={(e) => setVetStaff(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                  >
                    <option value="Dr. Devin Omwenga">Dr. Devin Omwenga (Vet Manager)</option>
                    {staffList.map(st => (
                      <option key={st.id} value={st.name}>{st.name} ({st.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Diagnosis & Intervention Notes</label>
                  <input
                    type="text"
                    value={vetNotes}
                    onChange={(e) => setVetNotes(e.target.value)}
                    placeholder="E.g. High worm load on fecal smear. Strict milk withdrawal for 3 days."
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVetForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-black text-xs uppercase rounded-lg m-0 shadow-sm">
                  Commit Intervention
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
                  <div key={record.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-55/60 bg-slate-50 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          record.type === 'Deworming' ? 'bg-[#e0f7fa] text-[#006064] border-[#b2ebf2]' :
                          record.type === 'Treatment' ? 'bg-[#ffebee] text-[#b71c1c] border-[#ffcdd2]' :
                          'bg-indigo-50 text-indigo-800 border-indigo-150'
                        }`}>
                          {record.type}
                        </span>
                        <h6 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                          Cow Reference: <span className="text-emerald-900 font-black">{record.cowId}</span>
                        </h6>
                      </div>
                      <p className="text-xs font-black text-slate-705 leading-relaxed bg-white/70 px-2 py-1.5 rounded border border-slate-100">
                        Diagnostics & Treatment: <span className="font-extrabold text-[#111]">{record.treatment}</span>
                      </p>
                      <p className="text-xs font-medium text-slate-505 italic">
                        Observational Details: "{record.notes}"
                      </p>
                      {record.nextDueDate && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#b71c1c]">
                          <Timer size={12} />
                          <span>Deworming Calendar Deadline: {record.nextDueDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-4 text-left md:text-right shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block">Logged / Caregiver</span>
                        <span className="text-xs font-black font-semibold text-slate-705 block mt-0.5 font-mono">{record.date}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Veterinary Log</h3>
              <button onClick={() => setEditingVet(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cow TAG ID</label>
                  <select
                    value={editingVet.cowId}
                    onChange={(e) => setEditingVet({ ...editingVet, cowId: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    {cows.map(c => <option key={c.id} value={c.id}>{c.id} ({c.name})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Type of Intervention</label>
                  <select
                    value={editingVet.type}
                    onChange={(e) => setEditingVet({ ...editingVet, type: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    <option value="Treatment">Treatment</option>
                    <option value="Deworming">Deworming</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Treatment Description</label>
                <input
                  type="text"
                  value={editingVet.treatment}
                  onChange={(e) => setEditingVet({ ...editingVet, treatment: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cost (Ksh)</label>
                  <input
                    type="number"
                    value={editingVet.cost}
                    onChange={(e) => setEditingVet({ ...editingVet, cost: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Intervention Date</label>
                  <input
                    type="date"
                    value={editingVet.date}
                    onChange={(e) => setEditingVet({ ...editingVet, date: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Deadline / Next Due</label>
                  <input
                    type="date"
                    value={editingVet.nextDueDate || ''}
                    onChange={(e) => setEditingVet({ ...editingVet, nextDueDate: e.target.value || undefined })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Caregiver Staff</label>
                  <select
                    value={editingVet.staff}
                    onChange={(e) => setEditingVet({ ...editingVet, staff: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                  </select>
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
                className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
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
