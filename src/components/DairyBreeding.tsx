/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LactationLedger from './dairy/LactationLedger';
import GeneticsManager from './dairy/GeneticsManager';
import { CowRegistry } from './dairy/CowRegistry';
import { DairyDashboard } from './dairy/DairyDashboard';
import { VeterinaryLog } from './dairy/VeterinaryLog';
import { BreedingLedger } from './dairy/BreedingLedger';
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

 // Edit States for Milk, AI, Cow, Vet

 // Milking record states

 // Standalone Daily Outflow entry states


 // AI record states

 // Cow Identity form states
 const [newCowGsp, setNewCowGsp] = useState('');
 const [newCowGdp, setNewCowGdp] = useState('');
 const [newCowGsm, setNewCowGsm] = useState('');
 const [newCowGdm, setNewCowGdm] = useState('');
 const [newCowReg, setNewCowReg] = useState('');
 const [showAddCowForm, setShowAddCowForm] = useState(false);
 const [cowSearch, setCowSearch] = useState('');
 const [cowBreedFilter, setCowBreedFilter] = useState('');
 const [cowStatusFilter, setCowStatusFilter] = useState('');

 // Vet log form states

 // Filtering milking records

 // Daily Outflow states










 // CSV Exporters for individual sections

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



 // Filter milking logs
 const filteredMilk = milkRecords

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


 // Unique breeds and statuses for filtering the cattle directory
 const uniqueBreeds = Array.from(new Set(cows.map(c => c.breed).filter(Boolean)));
 const uniqueStatuses = Array.from(new Set(cows.map(c => c.status).filter(Boolean)));

 return (
 <div className="space-y-8 animate-fadeIn">
 {/* Dairy Master Banner */}
 <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-4">
 <div className="p-3.5 bg-emerald-100 text-green-600 rounded-2xl shrink-0">
 <Activity size={24} className="text-green-600" />
 </div>
 <div>
 <h4 className="text-gray-900 font-semibold text-sm tracking-tight">
 {activeSubModule === 'milk' ? 'Daily Milking & Milk Sales' :
 activeSubModule === 'breeding' ? 'Artificial Insemination & Breeding' :
 activeSubModule === 'veterinary' ? 'Veterinary Treatment Clinic' :
 activeSubModule === 'cows' ? 'Cattle Pedigree & Registry' :
 'Premium Dairy & Lactation Hub'}
 </h4>
 <p className="text-xs text-gray-900 font-medium font-medium">
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
 <div className="flex bg-white border border-gray-200 p-1.5 rounded-xl border border-gray-200 w-full md:w-auto shrink-0 justify-between self-stretch md:self-auto overflow-x-auto gap-1">
 {(!activeSubModule) && (
 <button
 onClick={() => setSubTab('lactation')}
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 ${
 subTab === 'lactation' ? 'bg-white shadow-sm text-gray-900 shadow-sm' : 'text-gray-900 font-medium hover:text-gray-900'
 }`}
 >
 Lactation & AI
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'cows') && (
 <button
 onClick={() => setSubTab('registry')}
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'registry' ? 'bg-white shadow-sm text-gray-900 shadow-sm' : 'text-gray-900 font-medium hover:text-gray-500'
 }`}
 >
 Cow Directory
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'breeding') && (
 <button
 onClick={() => setSubTab('breeding_ledger')}
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'breeding_ledger' ? 'bg-white shadow-sm text-gray-500 shadow-sm ring-1 ring-emerald-500/20' : 'text-green-600 hover:text-green-600 bg-emerald-500/5'
 }`}
 >
 📋 Breeding Ledger
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'breeding') && (
 <button
 onClick={() => setSubTab('breeding_wheel')}
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'breeding_wheel' ? 'bg-white shadow-sm text-gray-500 shadow-sm ring-1 ring-emerald-500/20' : 'text-green-600 hover:text-green-600 bg-emerald-500/5'
 }`}
 >
 🎡 Breeding Wheel
 </button>
 )}
 {(!activeSubModule) && (
 <button
 onClick={() => setSubTab('veterinary')}
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 relative ${
 subTab === 'veterinary' ? 'bg-white shadow-sm text-gray-900 shadow-sm' : 'text-gray-900 font-medium hover:text-gray-900'
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
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'life_ledger' ? 'bg-white shadow-sm text-gray-900 shadow-sm' : 'text-gray-900 font-medium hover:text-gray-900'
 }`}
 >
 Sales & Loss
 </button>
 )}
 {(!activeSubModule || activeSubModule === 'breeding') && (
 <button
 onClick={() => setSubTab('semen_inventory')}
 className={`px-3 py-2 text-xs tracking-tight font-semibold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1.5 ${
 subTab === 'semen_inventory' ? 'bg-white shadow-sm text-gray-900 shadow-sm' : 'text-gray-900 font-medium hover:text-gray-900'
 }`}
 >
 🧬 Semen Straws
 </button>
 )}
 </div>
 )}
 </div>

 {/* SUB-TAB: GENETIC SEMEN INVENTORY */}

        {subTab === 'lactation' && (
          <LactationLedger
            cows={cows}
            milkRecords={milkRecords}
            milkOutflow={milkOutflows}
            milkOutflows={milkOutflows}
            staffList={staffList}
            aiRecords={aiRecords}
            onTriggerSectionReport={onTriggerSectionReport}
            onAddMilkRecord={onAddMilkRecord}
            onEditMilkRecord={onEditMilkRecord}
            onDeleteMilkRecord={onDeleteMilkRecord}
            onAddOutflowRecord={onAddMilkOutflow}
            onEditMilkOutflow={onEditMilkOutflow}
            onDeleteMilkOutflow={onDeleteMilkOutflow}
          />
        )}


        {subTab === 'breeding_wheel' && (
          <GeneticsManager
            cows={cows}
            aiRecords={aiRecords}
            getAverageYield={getAverageYield}
            getCowAge={getCowAge}
            onTriggerSectionReport={onTriggerSectionReport}
            onGoToSubTab={setSubTab}
            onUpdateCowStatus={onUpdateCowStatus}
          />
        )}

 {subTab === 'semen_inventory' && (
 <div className="space-y-6 animate-fadeIn" id="semen-inventory-section">
 <div className="bg-white shadow-sm text-gray-900 rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
 <div className="relative z-10 space-y-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="space-y-2">
 <span className="bg-amber-500/10 text-amber-400 font-semibold tracking-normal text-[10px]  px-2.5 py-1 rounded-full border border-amber-500/20">
 🧬 Genetic Stock Center
 </span>
 <h3 className="text-xl font-semibold text-gray-900 text-gray-900">Semen Straws & Breeding Sire Inventory</h3>
 <p className="text-gray-900 font-medium text-xs font-medium">Manage and monitor high-yield genetic straws in stock. Select these genetic resources during artificial insemination (AI) service logs to track usage and auto-deduct straw inventory.</p>
 </div>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('ai')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-gray-500 font-semibold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold shrink-0 self-start md:self-center"
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
 <div className="bg-white shadow-sm p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
 <h4 className="text-xs font-semibold  text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
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
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Straw Code / Reference ID</label>
 <input
 name="id"
 type="text"
 required
 placeholder="E.g. SEMEN-JE-800"
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Bull / Sire Name</label>
 <input
 name="bullName"
 type="text"
 required
 placeholder="E.g. Jersey Prime Elite"
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Breed</label>
 <select
 name="breed"
 required
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white shadow-sm "
 >
 <option value="Holstein-Friesian">Holstein-Friesian</option>
 <option value="Jersey">Jersey</option>
 <option value="Ayrshire">Ayrshire</option>
 <option value="Guernsey">Guernsey</option>
 <option value="Friesian">Friesian</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Semen Type</label>
 <select
 name="semenType"
 required
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white shadow-sm "
 >
 <option value="Sexed (Female)">Sexed (Female)</option>
 <option value="Sexed (Male)">Sexed (Male)</option>
 <option value="Conventional">Conventional</option>
 </select>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Origin</label>
 <input
 name="origin"
 type="text"
 required
 placeholder="E.g. Imported (USA)"
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Cost (Ksh/Straw)</label>
 <input
 name="cost"
 type="number"
 required
 min="0"
 placeholder="Cost"
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Quantity in Stock (Straws)</label>
 <input
 name="quantity"
 type="number"
 required
 min="1"
 placeholder="E.g. 10"
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <button
 type="submit"
 className="w-full bg-white shadow-sm hover:bg-white border border-gray-200 text-gray-900 font-semibold text-xs  p-3 rounded-xl transition-all shadow-md m-0 cursor-pointer"
 >
 Register Genetic Straw
 </button>
 </form>
 </div>

 {/* Inventory Table */}
 <div className="bg-white shadow-sm p-5 rounded-3xl border border-gray-100 shadow-xs md:col-span-2 space-y-4">
 <div className="flex justify-between items-center border-b border-gray-100 pb-2">
 <h4 className="text-xs font-semibold  text-gray-900 flex items-center gap-1.5">
 📋 Straws Registry Ledger
 </h4>
 <span className="text-[10px] font-mono font-bold text-gray-900 font-medium bg-white border border-gray-200 px-2 py-0.5 rounded">
 {semenInventory.length} types registered
 </span>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-gray-100 text-[10px] font-semibold  text-gray-900 font-medium tracking-normal">
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
 <tr key={item.id} className="border-b border-gray-200 hover:bg-white border border-gray-200">
 <td className="p-2.5 font-bold">
 <span className="font-mono text-gray-900 block">{item.id}</span>
 <span className="text-[10px] text-gray-900 font-medium font-medium block">{item.bullName}</span>
 </td>
 <td className="p-2.5 font-medium">
 <span className="text-gray-500 block">{item.breed}</span>
 <span className="text-[9px] text-indigo-700 bg-indigo-900/20 px-1.5 py-0.2 rounded font-semibold  inline-block mt-0.5">{item.semenType}</span>
 </td>
 <td className="p-2.5 text-gray-900 font-medium font-semibold">{item.origin}</td>
 <td className="p-2.5 text-right font-mono font-bold text-gray-900 font-semibold">Ksh {item.cost.toLocaleString()}</td>
 <td className="p-2.5 text-center">
 <span className={`px-2 py-0.5 rounded font-semibold text-[10px] font-mono ${
 item.quantity <= 2 
 ? 'bg-rose-100 text-rose-700 border border-rose-200' 
 : 'bg-emerald-100 text-green-600 border border-emerald-200'
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
 className="text-rose-600 hover:text-rose-850 font-bold hover:bg-rose-900/20 px-2 py-1 rounded transition-colors text-[10px]  cursor-pointer"
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
 <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h4 className="text-gray-900 font-semibold text-sm tracking-tight flex items-center gap-1.5 font-bold">
 <TrendingUp size={16} className="text-rose-700" />
 Cattle Sales & Mortality Ledger
 </h4>
 <p className="text-xs text-gray-900 font-medium font-medium">Download reports of livestock sales, capital disposal, and sanitary mortality audits.</p>
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('life_ledger')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-gray-500 font-semibold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
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
 <div className="bg-white text-gray-900 rounded-3xl p-5 border border-emerald-900 shadow-sm relative overflow-hidden">
 <span className="text-[9px] font-semibold text-green-600 tracking-tight block mb-1">Total Cattle Sales Value</span>
 <span className="text-2xl font-semibold text-gray-900 font-mono">
 Ksh {animalSales
 .filter(s => s.type === 'Cow' || s.type === 'Calf')
 .reduce((sum, s) => sum + s.price, 0)
 .toLocaleString()}
 </span>
 <p className="text-[10px] text-green-600 mt-1 font-semibold">
 From {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').length} livestock transactions
 </p>
 </div>

 <div className="bg-rose-900/20 border border-rose-150 rounded-3xl p-5 shadow-xs">
 <span className="text-[9px] font-semibold text-rose-500 tracking-tight block mb-1">Cattle Mortalities</span>
 <span className="text-2xl font-semibold text-gray-900 font-mono text-rose-950">
 {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length} Animals
 </span>
 <p className="text-[10px] text-rose-600 mt-1 font-semibold">
 Recorded losses requiring sanitary disposal checks
 </p>
 </div>

 <div className="bg-white shadow-sm border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-center">
 <span className="text-[9px] font-semibold text-gray-900 font-medium tracking-tight block mb-0.5">Herd Active Rate</span>
 <span className="text-base font-semibold text-gray-900 mt-1">
 {cows.length} Live Cattle Registered
 </span>
 <p className="text-[10px] text-gray-900 font-medium font-medium">
 Active milking register capacity
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 
 {/* COLUMN 1: ANIMAL SALES HISTORY */}
 <div className="bg-white shadow-sm rounded-3xl border border-gray-100 p-6 space-y-6 shadow-sm">
 <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
 <div className="space-y-0.5">
 <h4 className="text-sm font-semibold text-gray-900  tracking-wide">Cattle Sales & Culling Logs</h4>
 <p className="text-[10px] text-gray-500 font-semibold ">Manage bovine disposals and secondary revenue</p>
 </div>
 <span className="bg-emerald-100 text-green-600 text-[9px] font-semibold px-2 py-0.5 rounded ">Ledger</span>
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
 className="space-y-4 bg-white border border-gray-200 border border-gray-100 p-4 rounded-2xl"
 >
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Animal Category</label>
 <select name="animalType" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-xs">
 <option value="Cow">Milking Cow</option>
 <option value="Calf">Young Calf</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Tag / ID Number</label>
 <input type="text" name="animalId" required placeholder="e.g., J-601" className="w-full bg-white shadow-sm border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2 font-bold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Sale Date</label>
 <input type="date" name="saleDate" defaultValue={toIsoDate()} required className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2 font-semibold text-xs font-mono" />
 </div>
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Sale Value (Ksh)</label>
 <input type="number" name="salePrice" required placeholder="80000" className="w-full bg-white shadow-sm border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-2 font-bold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Buyer / Purchaser Details</label>
 <input type="text" name="saleBuyer" placeholder="Brookside heifers breeder or local dealer" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-gray-900 font-medium block mb-1">Transaction Notes (e.g. Weight, Breed, Lineage, Pedigree status)</label>
 <input type="text" name="saleNotes" placeholder="e.g. Sold due to low daily lactation yield of 8L or pedigree grade upgrade" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <button type="submit" className="w-full py-2.5 bg-white hover:bg-emerald-900 text-gray-900 font-semibold text-xs tracking-tight rounded-xl transition-all cursor-pointer border-0 m-0">
 Save Cattle Sale Transaction
 </button>
 </form>

 {/* Sales List */}
 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
 {animalSales.filter(s => s.type === 'Cow' || s.type === 'Calf').length === 0 ? (
 <p className="text-center text-gray-900 font-medium py-6 text-xs font-bold">No cattle sales transactions recorded.</p>
 ) : (
 animalSales
 .filter(s => s.type === 'Cow' || s.type === 'Calf')
 .map(sale => (
 <div key={sale.id} className="p-3.5 bg-white shadow-sm border border-gray-100 rounded-2xl flex justify-between items-center shadow-xs">
 <div className="space-y-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="font-semibold text-xs text-gray-900 ">
 {sale.animalId}
 </span>
 <span className="bg-white text-gray-900 font-semibold text-[8px] font-semibold px-1.5 py-0.5 rounded ">
 {sale.type}
 </span>
 <span className="text-[10px] text-gray-900 font-medium font-bold font-mono">
 {sale.date}
 </span>
 </div>
 <span className="text-[10px] text-gray-500 block font-semibold leading-relaxed">
 Purchaser: {sale.buyer} • Notes: <span className="italic">"{sale.notes}"</span>
 </span>
 </div>
 <div className="flex items-center gap-3">
 <span className="font-mono text-xs font-semibold text-green-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
 Ksh {sale.price.toLocaleString()}
 </span>
 <button
 onClick={() => onDeleteAnimalSale(sale.id)}
 className="text-gray-500 hover:text-red-700 cursor-pointer m-0 bg-transparent border-0"
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
 <div className="bg-white shadow-sm rounded-3xl border border-gray-100 p-6 space-y-6 shadow-sm">
 <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
 <div className="space-y-0.5">
 <h4 className="text-sm font-semibold text-gray-900  tracking-wide">Cattle Mortality Ledger</h4>
 <p className="text-[10px] text-gray-500 font-semibold ">Log sanitations, post-mortems and disease casualties</p>
 </div>
 <span className="bg-rose-100 text-rose-950 text-[9px] font-semibold px-2 py-0.5 rounded ">Loss Register</span>
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
 <label className="text-[10px] font-semibold tracking-tight text-rose-900 block mb-1">Animal Category</label>
 <select name="animalType" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-xs text-rose-950">
 <option value="Cow">Milking Cow</option>
 <option value="Calf">Young Calf</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-rose-900 block mb-1">Tag / ID Number</label>
 <input type="text" name="animalId" required placeholder="e.g., J-603" className="w-full bg-white shadow-sm border border-gray-200 focus:border-red-700 rounded-xl px-3 py-2 font-bold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-rose-900 block mb-1">Incident Date</label>
 <input type="date" name="mortalityDate" defaultValue={toIsoDate()} required className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2 font-semibold text-xs font-mono" />
 </div>
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-rose-900 block mb-1">Cause of Death</label>
 <select name="mortalityCause" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-xs text-rose-950">
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
 <label className="text-[10px] font-semibold tracking-tight text-rose-900 block mb-1">Safe Disposal Protocol (How disposing?)</label>
 <input type="text" name="mortalityDisposal" placeholder="e.g. Buried 6ft deep with agricultural chemical lime" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <div>
 <label className="text-[10px] font-semibold tracking-tight text-rose-900 block mb-1">Autopsy / Post-Mortem & Diagnosis Notes</label>
 <input type="text" name="mortalityNotes" placeholder="e.g. Diagnosed by Dr Devin; triggered by extreme early-morning wet clover bloat" className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-3 py-2 font-semibold text-xs" />
 </div>
 </div>

 <button type="submit" className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-gray-900 font-semibold text-xs tracking-tight rounded-xl transition-all cursor-pointer border-0 m-0">
 Save Cattle Loss Incident
 </button>
 </form>

 {/* Mortality List */}
 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
 {mortalities.filter(m => m.type === 'Cow' || m.type === 'Calf').length === 0 ? (
 <p className="text-center text-gray-900 font-medium py-6 text-xs font-bold">No cattle mortality incidents recorded.</p>
 ) : (
 mortalities
 .filter(m => m.type === 'Cow' || m.type === 'Calf')
 .map(inc => (
 <div key={inc.id} className="p-3.5 bg-rose-900/20 border border-rose-100 rounded-2xl flex justify-between items-center shadow-xs">
 <div className="space-y-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="font-semibold text-xs text-rose-950 ">
 {inc.animalId}
 </span>
 <span className="bg-rose-100 text-rose-900 text-[8px] font-semibold px-1.5 py-0.5 rounded ">
 {inc.type}
 </span>
 <span className="text-[10px] text-gray-900 font-medium font-bold font-mono">
 {inc.date}
 </span>
 <span className="bg-red-950/50 text-gray-900 text-[8px] font-semibold px-1.5 py-0.5 rounded ">
 {inc.causeOfDeath}
 </span>
 </div>
 <span className="text-[10px] text-gray-500 block font-semibold leading-relaxed">
 Disposal: {inc.disposalMethod} • Notes: <span className="italic">"{inc.notes}"</span>
 </span>
 </div>
 <button
 onClick={() => onDeleteMortality(inc.id)}
 className="text-gray-500 hover:text-red-700 cursor-pointer m-0 bg-transparent border-0"
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
        {subTab === 'breeding_ledger' && (
          <BreedingLedger
            cows={cows}
            aiRecords={aiRecords}
            semenInventory={semenInventory}
            staffList={staffList}
            onAddAIRecord={onAddAIRecord}
            onDeleteAIRecord={onDeleteAIRecord}
            onEditAIRecord={onEditAIRecord}
            onUpdateAIStatus={onUpdateAIStatus}
            onAddCalfRecord={onAddCalfRecord}
            setSemenInventory={setSemenInventory}
            onTriggerSectionReport={onTriggerSectionReport}
          />
        )}
 {/* SUB-TAB 2: COW IDENTITY DIRECTORY */}
 {subTab === 'registry' && (
 <CowRegistry
 cows={cows}
 milkRecords={milkRecords}
 onDeleteCow={onDeleteCow}
 onTriggerSectionReport={onTriggerSectionReport}
 onUpdateCowStatus={onUpdateCowStatus}
 onAddCow={onAddCow}
            onEditCow={onEditCow}
 />
 )}

 {/* SUB-TAB 3: VETERINARY LOGS & DEWORMING REMINDERS */}
        {subTab === 'veterinary' && (
          <VeterinaryLog
            cows={cows}
            vetRecords={vetRecords}
            staffList={staffList}
            onAddVetRecord={onAddVetRecord}
            onDeleteVetRecord={onDeleteVetRecord}
            onEditVetRecord={onEditVetRecord}
            onTriggerSectionReport={onTriggerSectionReport}
          />
        )}
 {/* SUB-TAB: ANIMAL BREEDING & GESTATION WHEEL */}




 {/* Pedigree & Relationship Tree Modal */}

   </div>
  );
}
