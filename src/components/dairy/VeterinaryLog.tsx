import React, { useState } from 'react';
import { VetRecord, Cow, StaffMember } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import {
  Plus, Search, FileSpreadsheet, Download, BadgeAlert, CheckCircle2, Timer, PenSquare, Trash2
} from 'lucide-react';

interface VeterinaryLogProps {
  vetRecords: VetRecord[];
  cows: Cow[];
  staffList: StaffMember[];
  onAddVetRecord: (rec: VetRecord) => void;
  onDeleteVetRecord: (id: string) => void;
  onEditVetRecord?: (id: string, updated: VetRecord) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function VeterinaryLog({
  vetRecords,
  cows,
  staffList,
  onAddVetRecord,
  onDeleteVetRecord,
  onEditVetRecord,
  onTriggerSectionReport
}: VeterinaryLogProps) {
 const [editingVet, setEditingVet] = useState<VetRecord | null>(null);
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

 // Find cows that haven't been dewormed in the last 90 days or have an overdue nextDueDate
 const todayStr = toIsoDate();
 const dewormingReminders = cows.map(cow => {
 // Find latest deworming record
 const cowDoses = vetRecords
 .filter(r => (r.cowId.toLowerCase() === cow.id.toLowerCase() || r.cowId.toLowerCase() === 'all animals') && r.type === 'Deworming')
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

  return (
    <>
 <div className="space-y-6">
 {/* Active Deworming Alerts section */}
 {activeRemindersCount > 0 ? (
 <div className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-3 shadow-sm">
 <div className="flex items-center gap-2.5 text-red-800">
 <BadgeAlert size={20} className="text-red-600 animate-pulse shrink-0" />
 <h5 className="font-semibold tracking-tight text-sm">Action Required: Deworming Due</h5>
 </div>
 <p className="text-sm text-red-700 font-medium leading-relaxed">
 Under organic health standards, deworming calendars must be kept strictly precise (90-day dosage intervals) to prevent fluke/nematode weight loss.
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
 {dewormingReminders
 .filter(r => r.status !== 'safe')
 .map(rem => (
 <div key={rem.cow.id} className="p-4 bg-white border border-red-100 rounded-xl flex justify-between items-center shadow-sm">
 <div>
 <span className="text-sm font-semibold text-gray-900 block">{rem.cow.id} ({rem.cow.name})</span>
 <span className="text-xs text-gray-500 font-medium block mt-1">{rem.cow.breed} • Status: {rem.cow.status}</span>
 </div>
 <div className="text-right">
 <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-red-700 bg-red-100 border border-red-200">
 {rem.status === 'overdue' ? 'Overdue Dose' : 'Due Soon'}
 </span>
 <span className="text-xs text-gray-900 font-medium font-mono block mt-2">{rem.text}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex items-center gap-3">
 <CheckCircle2 size={20} className="text-green-600 shrink-0" />
 <div>
 <h5 className="text-green-800 text-sm font-semibold">Herd Deworming Compliant</h5>
 <p className="text-xs text-green-700 mt-1">Every cow has received a broad spectrum anthelmintic dose within the required timeline safety metrics.</p>
 </div>
 </div>
 )}

 {/* Controls & Search */}
 <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3 top-3.5 text-gray-900 font-medium" size={14} />
 <input
 type="text"
 placeholder="Search medications or diagnosis..."
 value={vetSearch}
 onChange={(e) => setVetSearch(e.target.value)}
 className="text-xs pl-9 pr-4 py-3 border border-gray-200 rounded-xl w-full font-bold focus:outline-none"
 />
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 <button
 onClick={downloadVetClinicalCSV}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-900/20 border border-red-205 text-red-950 hover:bg-red-100 font-semibold text-xs  rounded-xl transition-all shadow-xs cursor-pointer m-0"
 title="Download Vet Logs CSV"
 >
 <FileSpreadsheet size={13} />
 Export Vet History
 </button>
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('vet')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-gray-500 font-semibold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Download Vet Clinic PDF Report"
 >
 <Download size={13} />
 Download PDF Report
 </button>
 )}
 <button
 onClick={() => setShowAddVetForm(!showAddVetForm)}
 className="bg-white shadow-sm text-gray-900 font-semibold text-xs  px-5 py-3 rounded-xl hover:bg-white border border-gray-200 flex items-center justify-center gap-1.5 m-0 shadow-sm"
 >
 <Plus size={14} /> Log Vet Intervention / Deworming
 </button>
 </div>
 </div>

 {showAddVetForm && (
 <form onSubmit={handleVetSubmit} className="bg-white shadow-sm p-6 rounded-2xl border border-gray-200 shadow-md space-y-6">
 <div className="border-b border-gray-100 pb-3 flex justify-between items-center bg-white border border-gray-200 -m-6 mb-4 p-6 rounded-t-2xl">
 <div>
 <h5 className="text-sm  font-semibold tracking-normal text-[#1a237e]">Log Comprehensive Veterinary Clinical Intervention</h5>
 <p className="text-[10px] text-gray-900 font-medium font-bold mt-0.5 tracking-tight">Professional clinical-grade chart for veterinarians & caregivers</p>
 </div>
 <span className="bg-[#1a237e]/10 text-[#1a237e] text-[9px] font-semibold  px-2 py-1 rounded border border-[#1a237e]/20">Registered Practitioner Mode</span>
 </div>

 {/* SECTION A: PATIENT IDENTITY & ENTRY TIMING */}
 <div className="space-y-3">
 {/* Clinical Diagnostic Presets */}
 <div className="p-3.5 bg-blue-900/20 border border-blue-200/60 rounded-2xl space-y-2 mb-4">
 <span className="text-[9.5px]  font-semibold text-blue-900 tracking-normal flex items-center gap-1">
 💉 EXCLUSIVE CLINICAL DIAGNOSTIC PRESETS
 </span>
 <p className="text-[10.5px] text-gray-900 font-medium leading-tight">Click one to pre-fill standard clinical parameters & withholding times:</p>
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
 className="text-left bg-white shadow-sm hover:bg-indigo-900/20 p-2.5 rounded-xl border border-gray-200 hover:border-indigo-350 text-[10.5px] text-gray-900 font-semibold transition-all font-bold m-0 flex flex-col justify-between cursor-pointer shadow-xs"
 >
 <span className="text-indigo-950 font-semibold truncate">{p.label}</span>
 <span className="text-[9px] text-[#2c3e50] font-mono mt-0.5 font-bold">{p.type} • Milk WH {p.milkWithholding}d</span>
 </button>
 ))}
 </div>
 </div>

 <h6 className="text-[10px] font-semibold tracking-normal text-indigo-900 ">1. Patient Identification & Timeline</h6>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Animal Category</label>
 <select
 value={vetAnimalCategory}
 onChange={(e) => setVetAnimalCategory(e.target.value as any)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full bg-white shadow-sm font-bold"
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
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Patient Identifier / Tag ID</label>
 {vetAnimalCategory === 'Cow' && cows.length > 0 ? (
 <select
 required
 value={vetCowId}
 onChange={(e) => setVetCowId(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold bg-white shadow-sm "
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
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 )}
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Intervention Date (Historical / Recent)</label>
 <input
 type="date"
 required
 value={vetDate}
 onChange={(e) => setVetDate(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Intervention Class</label>
 <select
 value={vetType}
 onChange={(e) => setVetType(e.target.value as any)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full bg-white shadow-sm font-bold"
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
 <div className="space-y-3 pt-2 border-t border-gray-100">
 <h6 className="text-[10px] font-semibold tracking-normal text-indigo-900 ">2. Clinical Vitals & Diagnosis</h6>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Body Temperature (°C)</label>
 <input
 type="number"
 step="0.1"
 value={vetTemp}
 onChange={(e) => setVetTemp(e.target.value === '' ? '' : parseFloat(e.target.value))}
 placeholder="E.g. 38.5"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Heart Rate (bpm)</label>
 <input
 type="number"
 value={vetHeartRate}
 onChange={(e) => setVetHeartRate(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 60"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Respiratory Rate (breaths/min)</label>
 <input
 type="number"
 value={vetRespRate}
 onChange={(e) => setVetRespRate(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 24"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-500  block mb-1">Primary Diagnosis / Indication</label>
 <input
 type="text"
 value={vetDiagnosis}
 onChange={(e) => setVetDiagnosis(e.target.value)}
 placeholder="E.g. Sub-clinical Mastitis, Anaplasmosis"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 </div>
 </div>

 {/* SECTION C: PHARMACOLOGY, ROUTE & COST */}
 <div className="space-y-3 pt-2 border-t border-gray-100">
 <h6 className="text-[10px] font-semibold tracking-normal text-indigo-900 ">3. Pharmacological Treatment Plan</h6>
 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
 <div className="md:col-span-2">
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Medication / Treatment Description</label>
 <input
 type="text"
 required
 value={vetTreatment}
 onChange={(e) => setVetTreatment(e.target.value)}
 placeholder="E.g. Intramammary antibiotic infusion, Alben_bolus..."
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Active Drug Name</label>
 <input
 type="text"
 value={vetDrug}
 onChange={(e) => setVetDrug(e.target.value)}
 placeholder="E.g. Penicillin G, Albendazole"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Dosage Administered</label>
 <input
 type="text"
 value={vetDosage}
 onChange={(e) => setVetDosage(e.target.value)}
 placeholder="E.g. 20ml IM, 1 bolus"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Administration Route</label>
 <select
 value={vetRoute}
 onChange={(e) => setVetRoute(e.target.value as any)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full bg-white shadow-sm font-bold"
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
 <div className="space-y-3 pt-2 border-t border-gray-100">
 <h6 className="text-[10px] font-semibold tracking-normal text-indigo-900 ">4. Withdrawal Regulations & Compliance Alerts</h6>
 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
 <div>
 <label className="text-[10px] font-semibold text-amber-700  block mb-1">Milk Withdrawal (Days)</label>
 <input
 type="number"
 value={vetWithdrawalMilk}
 onChange={(e) => setVetWithdrawalMilk(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 3 (Milk discard)"
 className="text-xs border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-amber-700  block mb-1">Meat Withdrawal (Days)</label>
 <input
 type="number"
 value={vetWithdrawalMeat}
 onChange={(e) => setVetWithdrawalMeat(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 21 (No slaughter)"
 className="text-xs border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Intervention Cost (Ksh)</label>
 <input
 type="number"
 value={vetCost}
 onChange={(e) => setVetCost(e.target.value === '' ? '' : parseInt(e.target.value))}
 placeholder="E.g. 1500"
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-mono font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Prognosis Evaluation</label>
 <select
 value={vetPrognosis}
 onChange={(e) => setVetPrognosis(e.target.value as any)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full bg-white shadow-sm font-bold"
 >
 <option value="Good">Good (Favorable recovery expected)</option>
 <option value="Fair">Fair (Moderate recovery chance)</option>
 <option value="Guarded">Guarded (Uncertain/Complex response)</option>
 <option value="Poor">Poor (High structural damage / warning)</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Next Follow-up & Due Date</label>
 <input
 type="date"
 value={vetNextDue}
 onChange={(e) => setVetNextDue(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-mono font-bold"
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
 <label htmlFor="vetRetreatmentScheduled" className="text-[11px] font-semibold text-gray-500  selection:bg-transparent">
 Flag for scheduled Retreatment Visit (System-monitored follow-up)
 </label>
 </div>
 </div>

 {/* NOTES & STAFF SECTION */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
 <div className="md:col-span-2">
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Practitioner Notes & Observational Observations</label>
 <input
 type="text"
 value={vetNotes}
 onChange={(e) => setVetNotes(e.target.value)}
 placeholder="E.g. Normal rumination index, mild congestion of mucosal membrane. Advised owner to avoid damp stalls."
 className="text-xs border border-gray-200 rounded-lg p-3 w-full font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Supervising Veterinary Surgeon</label>
 <select
 value={vetStaff}
 onChange={(e) => setVetStaff(e.target.value)}
 className="text-xs border border-gray-200 rounded-lg p-3 w-full bg-white shadow-sm font-bold text-indigo-950"
 >
 <option value="Dr. Devin Omwenga (Vet)">Dr. Devin Omwenga (Vet Manager)</option>
 {staffList.map(st => (
 <option key={st.id} value={`${st.name} (${st.unit})`}>{st.name} ({st.unit})</option>
 ))}
 </select>
 </div>
 </div>

 <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
 <button
 type="button"
 onClick={() => setShowAddVetForm(false)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium m-0 cursor-pointer"
 >
 Cancel
 </button>
 <button type="submit" className="px-5 py-2.5 bg-[#1a237e] text-gray-900 font-semibold text-xs  rounded-lg m-0 shadow-sm hover:bg-[#12185c] cursor-pointer">
 Save Clinical Entry
 </button>
 </div>
 </form>
 )}

 {/* History ledger */}
 <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
 <h5 className="text-[10px] font-semibold tracking-normal text-gray-900 font-medium  font-bold ">HERD INTERVENTION HISTORY TIMELINE</h5>
 <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
 {[...vetRecords]
 .filter(r => r.treatment.toLowerCase().includes(vetSearch.toLowerCase()) || r.cowId.toLowerCase().includes(vetSearch.toLowerCase()) || r.notes.toLowerCase().includes(vetSearch.toLowerCase()))
 .sort((a,b) => b.date.localeCompare(a.date))
 .map((record) => (
 <div key={record.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:bg-white border border-gray-200 shadow-sm transition-all flex flex-col md:flex-row justify-between gap-4">
 <div className="space-y-2 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <span className={`text-[9px] font-semibold  px-2 py-0.5 rounded border ${
 record.type === 'Deworming' ? 'bg-cyan-900/20 text-cyan-800 border-cyan-200' :
 record.type === 'Treatment' ? 'bg-rose-900/20 text-rose-800 border-rose-200' :
 record.type === 'Vaccination' ? 'bg-purple-900/20 text-purple-800 border-purple-200' :
 'bg-indigo-900/20 text-indigo-805 border-indigo-200'
 }`}>
 {record.type}
 </span>
 
 <span className="bg-white border border-gray-200 text-gray-900 text-[9px] font-semibold  px-2 py-0.5 rounded border border-gray-200">
 {record.animalCategory || 'Cow'}
 </span>
 
 <h6 className="font-semibold text-xs text-gray-900  tracking-wide">
 Identifier / Tag: <span className="text-green-600 font-semibold">{record.cowId}</span>
 </h6>

 {record.prognosis && (
 <span className={`text-[9px] font-semibold  px-2 py-0.5 rounded border ml-auto ${
 record.prognosis === 'Good' ? 'bg-emerald-50 text-green-600 border-emerald-200' :
 record.prognosis === 'Fair' ? 'bg-blue-900/20 text-blue-800 border-blue-200' :
 record.prognosis === 'Guarded' ? 'bg-amber-900/20 text-amber-800 border-amber-200' :
 'bg-red-900/20 text-red-800 border-red-200'
 }`}>
 Prognosis: {record.prognosis}
 </span>
 )}
 </div>

 {/* Diagnosis & Treatment */}
 <div className="p-3 bg-white border border-gray-200 rounded-xl border border-gray-100 space-y-1">
 {record.diagnosis && (
 <p className="text-xs font-bold text-indigo-950">
 Clinical Diagnosis: <span className="font-semibold text-gray-900">{record.diagnosis}</span>
 </p>
 )}
 <p className="text-xs font-medium text-gray-900 font-semibold leading-relaxed">
 Medication / Intervention: <span className="font-semibold text-gray-500">{record.treatment}</span>
 </p>
 {(record.drugAdministered || record.dosage) && (
 <div className="text-[11px] text-gray-900 font-medium font-semibold tracking-tight flex flex-wrap gap-x-3 gap-y-1">
 {record.drugAdministered && <span>💊 Active Drug: <b className="text-gray-900">{record.drugAdministered}</b></span>}
 {record.dosage && <span>⚖️ Dosage: <b className="text-gray-900">{record.dosage}</b></span>}
 {record.administrationRoute && <span>💉 Route: <b className="text-gray-900">{record.administrationRoute}</b></span>}
 </div>
 )}
 </div>

 {/* Clinical Vitals */}
 {(record.temperature || record.heartRate || record.respiratoryRate) && (
 <div className="flex flex-wrap gap-4 text-[11px] font-bold text-gray-900 font-medium bg-white border border-gray-200 p-2 rounded-lg border border-gray-100">
 {record.temperature && <span>🌡️ Temp: <b className="text-gray-500">{record.temperature}°C</b></span>}
 {record.heartRate && <span>❤️ Heart Rate: <b className="text-gray-500">{record.heartRate} bpm</b></span>}
 {record.respiratoryRate && <span>🫁 Resp Rate: <b className="text-gray-500">{record.respiratoryRate} bpm</b></span>}
 </div>
 )}

 {/* Withdrawal Periods Warnings */}
 {(record.withdrawalMilkDays || record.withdrawalMeatDays) && (
 <div className="flex flex-wrap gap-3 p-2 rounded-xl bg-amber-900/20 border border-amber-100">
 {record.withdrawalMilkDays ? (
 <span className="text-[10px] font-semibold text-amber-850 ">
 ⚠️ Milk Withdrawal: <b className="font-bold underline text-amber-950">{record.withdrawalMilkDays} Days</b> (Discard yield)
 </span>
 ) : null}
 {record.withdrawalMeatDays ? (
 <span className="text-[10px] font-semibold text-amber-850 ">
 🍖 Meat Withdrawal: <b className="font-bold underline text-amber-950">{record.withdrawalMeatDays} Days</b> (No slaughter)
 </span>
 ) : null}
 </div>
 )}

 <p className="text-xs font-semibold text-gray-900 font-medium italic">
 Observations: "{record.notes}"
 </p>

 {record.nextDueDate && (
 <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 w-fit">
 <Timer size={12} />
 <span>Deadline reminder / Follow-up due: <b className="font-semibold underline">{record.nextDueDate}</b></span>
 </div>
 )}

 {record.retreatmentScheduled && (
 <div className="flex items-center gap-1.5 text-[10px] font-semibold text-red-900 bg-red-900/20 p-1.5 px-2.5 rounded-lg border border-red-100 w-fit ">
 <span>🔔 Critical: Retreatment Scheduled</span>
 </div>
 )}
 </div>

 <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-4 text-left md:text-right shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
 <div>
 <span className="text-[9px]  font-semibold text-gray-900 font-medium block font-bold">Intervention Timestamp</span>
 <span className="text-xs font-semibold text-indigo-950 block mt-0.5 font-mono">{record.date}</span>
 <span className="text-[10px] text-gray-900 font-medium font-bold block mt-0.5">{record.staff}</span>
 </div>
 <div className="flex items-center gap-2 mt-2">
 {record.cost > 0 && (
 <span className="text-xs font-mono font-semibold text-red-700 bg-red-900/20 border border-red-100 px-2.5 py-0.5 rounded-full inline-block">
 Ksh {record.cost.toLocaleString()}
 </span>
 )}
 {onEditVetRecord && (
 <button
 onClick={() => setEditingVet(record)}
 className="text-gray-900 font-medium hover:text-indigo-805 p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:bg-white border border-gray-200 m-0"
 title="Edit health record"
 >
 <PenSquare size={13} />
 </button>
 )}
 <button
 onClick={() => onDeleteVetRecord(record.id)}
 className="text-gray-900 font-medium hover:text-red-650 p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:bg-white border border-gray-200 m-0"
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
 
 {/* Edit Veterinary Record Modal */}
 {editingVet && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm font-sans">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-gray-100 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center pb-2 border-b border-gray-100">
 <div>
 <h3 className="text-sm font-semibold  text-gray-900">Edit Clinical Veterinary Log</h3>
 <p className="text-[10px] text-gray-900 font-medium font-bold  mt-0.5">Adjust clinical parameters and medical records</p>
 </div>
 <button onClick={() => setEditingVet(null)} className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold m-0 cursor-pointer">✕</button>
 </div>
 
 <div className="space-y-4 text-left">
 {/* Patient and Timeline */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Animal Category</label>
 <select
 value={editingVet.animalCategory || 'Cow'}
 onChange={(e) => setEditingVet({ ...editingVet, animalCategory: e.target.value as any })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white shadow-sm "
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
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Tag ID / Cow Ref</label>
 <input
 type="text"
 value={editingVet.cowId}
 onChange={(e) => setEditingVet({ ...editingVet, cowId: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Type</label>
 <select
 value={editingVet.type}
 onChange={(e) => setEditingVet({ ...editingVet, type: e.target.value as any })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white shadow-sm "
 >
 <option value="Deworming">Deworming</option>
 <option value="Treatment">Treatment</option>
 <option value="Vaccination">Vaccination</option>
 <option value="General Practice">General Practice</option>
 </select>
 </div>
 </div>

 {/* Vitals and Diagnosis */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Temp (°C)</label>
 <input
 type="number"
 step="0.1"
 value={editingVet.temperature || ''}
 onChange={(e) => setEditingVet({ ...editingVet, temperature: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Heart (bpm)</label>
 <input
 type="number"
 value={editingVet.heartRate || ''}
 onChange={(e) => setEditingVet({ ...editingVet, heartRate: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Resp (bpm)</label>
 <input
 type="number"
 value={editingVet.respiratoryRate || ''}
 onChange={(e) => setEditingVet({ ...editingVet, respiratoryRate: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Diagnosis</label>
 <input
 type="text"
 value={editingVet.diagnosis || ''}
 onChange={(e) => setEditingVet({ ...editingVet, diagnosis: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-semibold"
 />
 </div>
 </div>

 {/* Treatment and Pharmacology */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Intervention</label>
 <input
 type="text"
 required
 value={editingVet.treatment}
 onChange={(e) => setEditingVet({ ...editingVet, treatment: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Drug Name</label>
 <input
 type="text"
 value={editingVet.drugAdministered || ''}
 onChange={(e) => setEditingVet({ ...editingVet, drugAdministered: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-semibold"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Dosage</label>
 <input
 type="text"
 value={editingVet.dosage || ''}
 onChange={(e) => setEditingVet({ ...editingVet, dosage: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-semibold"
 />
 </div>
 </div>

 {/* Routing, Cost, and Timeline */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Route</label>
 <select
 value={editingVet.administrationRoute || 'IM'}
 onChange={(e) => setEditingVet({ ...editingVet, administrationRoute: e.target.value as any })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white shadow-sm "
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
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Cost (Ksh)</label>
 <input
 type="number"
 value={editingVet.cost}
 onChange={(e) => setEditingVet({ ...editingVet, cost: parseInt(e.target.value) || 0 })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Log Date</label>
 <input
 type="date"
 value={editingVet.date}
 onChange={(e) => setEditingVet({ ...editingVet, date: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Prognosis</label>
 <select
 value={editingVet.prognosis || 'Good'}
 onChange={(e) => setEditingVet({ ...editingVet, prognosis: e.target.value as any })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white shadow-sm "
 >
 <option value="Good">Good</option>
 <option value="Fair">Fair</option>
 <option value="Guarded">Guarded</option>
 <option value="Poor">Poor</option>
 </select>
 </div>
 </div>

 {/* Withdrawals and Follow-ups */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
 <div>
 <label className="text-[10px] font-semibold text-amber-700  block mb-1">Milk Withdrawal (Days)</label>
 <input
 type="number"
 value={editingVet.withdrawalMilkDays || ''}
 onChange={(e) => setEditingVet({ ...editingVet, withdrawalMilkDays: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-amber-700  block mb-1">Meat Withdrawal (Days)</label>
 <input
 type="number"
 value={editingVet.withdrawalMeatDays || ''}
 onChange={(e) => setEditingVet({ ...editingVet, withdrawalMeatDays: e.target.value === '' ? undefined : parseInt(e.target.value) })}
 className="border border-amber-200 bg-amber-900/20 text-amber-955 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Next Follow-up Due</label>
 <input
 type="date"
 value={editingVet.nextDueDate || ''}
 onChange={(e) => setEditingVet({ ...editingVet, nextDueDate: e.target.value || undefined })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
 />
 </div>
 </div>

 {/* Retreatment alert and Staff */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
 <div className="flex items-center gap-2 bg-rose-900/20 p-2 rounded-xl border border-rose-100">
 <input
 type="checkbox"
 id="editVetRetreatment"
 checked={editingVet.retreatmentScheduled || false}
 onChange={(e) => setEditingVet({ ...editingVet, retreatmentScheduled: e.target.checked })}
 className="w-4 h-4 text-indigo-900 border-white/20 rounded"
 />
 <label htmlFor="editVetRetreatment" className="text-[10px] font-semibold text-rose-950  selection:bg-transparent">
 Retreatment Scheduled visit
 </label>
 </div>
 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Supervising Officer</label>
 <input
 type="text"
 value={editingVet.staff}
 onChange={(e) => setEditingVet({ ...editingVet, staff: e.target.value })}
 className="border border-gray-200 rounded-lg p-2.5 w-full text-xs font-bold text-indigo-950"
 />
 </div>
 </div>

 <div>
 <label className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1">Notes / Observations</label>
 <textarea
 value={editingVet.notes}
 onChange={(e) => setEditingVet({ ...editingVet, notes: e.target.value })}
 rows={2}
 className="border border-gray-200 rounded-lg p-3 w-full text-xs font-bold"
 />
 </div>
 </div>
 
 <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
 <button
 onClick={() => setEditingVet(null)}
 className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 font-medium hover:bg-white border border-gray-200 m-0 cursor-pointer"
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
 className="px-5 py-2.5 bg-indigo-955 text-gray-900 rounded-lg text-xs font-semibold  hover:bg-indigo-900 m-0 shadow cursor-pointer"
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
