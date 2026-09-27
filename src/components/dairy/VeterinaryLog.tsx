import React, { useState, useMemo } from 'react';
import { VetRecord, Cow, StaffMember, InventoryItem } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import {
  Plus, Search, FileSpreadsheet, Download, CheckCircle2, Timer,
  PenSquare, Trash2, HeartPulse, Stethoscope, Pill, AlertCircle,
  Activity, Calendar, Shield, LayoutList, LayoutGrid, Eye, ArrowRight,
  Clock, MapPin, Sparkles, Filter, X
} from 'lucide-react';
import { exportToCsv } from '../../utils/csvHelper';

interface VeterinaryLogProps {
  vetRecords: VetRecord[];
  cows: Cow[];
  staffList: StaffMember[];
  inventory?: InventoryItem[];
  onAddVetRecord: (rec: VetRecord) => void;
  onDeleteVetRecord: (id: string) => void;
  onEditVetRecord?: (id: string, updated: VetRecord) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function VeterinaryLog({
  vetRecords = [],
  cows = [],
  staffList = [],
  inventory = [],
  onAddVetRecord,
  onDeleteVetRecord,
  onEditVetRecord,
  onTriggerSectionReport
}: VeterinaryLogProps) {
  // Views and Modals
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showAddVetForm, setShowAddVetForm] = useState(false);
  const [editingVet, setEditingVet] = useState<VetRecord | null>(null);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<VetRecord | null>(null);

  // Filters
  const [vetSearch, setVetSearch] = useState('');
  const [vetTypeFilter, setVetTypeFilter] = useState('');
  const [vetStatusFilter, setVetStatusFilter] = useState('');
  const [vetCowFilter, setVetCowFilter] = useState('');

  // Form State
  const [vetCowId, setVetCowId] = useState('');
  const [vetCowName, setVetCowName] = useState('');
  const [vetAnimalCategory, setVetAnimalCategory] = useState<VetRecord['animalCategory']>('Cow');
  const [vetDate, setVetDate] = useState(toIsoDate());
  const [vetType, setVetType] = useState<VetRecord['type']>('Treatment');
  const [vetDiseaseOrCondition, setVetDiseaseOrCondition] = useState('');
  const [vetSymptoms, setVetSymptoms] = useState('');
  const [vetCauser, setVetCauser] = useState('');
  const [vetTreatment, setVetTreatment] = useState('');
  const [vetDrugAdministered, setVetDrugAdministered] = useState('');
  const [vetDrugUsedFromInventory, setVetDrugUsedFromInventory] = useState('');
  const [vetDosage, setVetDosage] = useState('');
  const [vetRoute, setVetRoute] = useState<VetRecord['administrationRoute']>('IM');
  const [vetCost, setVetCost] = useState<number | ''>('');
  const [vetStaff, setVetStaff] = useState('Dr. Devin Omwenga (Vet)');
  const [vetNotes, setVetNotes] = useState('');
  const [vetRepeatMedicalNotes, setVetRepeatMedicalNotes] = useState('');
  const [vetNextDue, setVetNextDue] = useState('');
  const [vetRecoveryStatus, setVetRecoveryStatus] = useState<string>('Under Treatment');

  // Clinical Vitals
  const [vetTemp, setVetTemp] = useState<number | ''>('');
  const [vetHeartRate, setVetHeartRate] = useState<number | ''>('');
  const [vetRespRate, setVetRespRate] = useState<number | ''>('');
  const [vetWithdrawalMilk, setVetWithdrawalMilk] = useState<number | ''>('');
  const [vetWithdrawalMeat, setVetWithdrawalMeat] = useState<number | ''>('');
  const [vetPrognosis, setVetPrognosis] = useState<VetRecord['prognosis']>('Good');

  // Curated list of farm pharmaceuticals and veterinary supplies
  const standardPharmacyDrugs = [
    'Buparvaquone (Butalex / Bupatox 50ml)',
    'Oxytetracycline 20% L.A. 100ml',
    'Penicillin-Streptomycin 20/20 100ml',
    'Cefa-Lak Intramammary Infusion Tubes',
    'Noroclox Dry Cow Intramammary Tubes',
    'Albendazole 10% Oral Suspension',
    'Levafas Diamond (Levamisole + Oxyclozanide)',
    'Ivermectin 1% Injectable Solution',
    'Triatix Cattle Dip / Amitraz 12.5%',
    'Calcium Borogluconate 40% (Cal-Boro IV)',
    'Ketol / Propylene Glycol Oral Drench',
    'Multivitamin + Iron Injection 100ml',
    'Meloxicam 20mg/ml Anti-inflammatory',
    'Dexamethasone Sodium Phosphate',
    'Oxytocin 10 IU/ml Injection',
    'Gentian Violet / Oxytetracycline Wound Spray',
    'FMD Quadrivalent Vaccine (Cold Chain)',
    'Anthrax & Blackquarter Dual Vaccine',
    'Lumpy Skin Disease (LSD) Vaccine',
    'Normal Saline 0.9% / Dextrose 5% Infusion'
  ];

  // Combined inventory drug options
  const inventoryDrugOptions = useMemo(() => {
    const invNames = (inventory || [])
      .filter(item => item && item.name)
      .map(item => `${item.name} (${item.unit || 'unit'})`);
    return Array.from(new Set([...invNames, ...standardPharmacyDrugs]));
  }, [inventory]);

  // Selected cow details for quick info display in form
  const selectedCowInfo = useMemo(() => {
    if (!vetCowId || vetAnimalCategory !== 'Cow') return null;
    return cows.find(c => c.id.toLowerCase() === vetCowId.toLowerCase());
  }, [vetCowId, vetAnimalCategory, cows]);

  // Handler when cow is selected from registry
  const handleSelectCow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setVetCowId(selectedId);
    if (!selectedId) {
      setVetCowName('');
      return;
    }
    const matched = cows.find(c => c.id === selectedId);
    if (matched) {
      setVetCowName(matched.name || '');
    } else if (selectedId === 'All Cattle / Herd Protocol') {
      setVetCowName('Entire Herd');
    }
  };

  // Clinical Diagnostic Presets for 1-click population
  const applyPreset = (preset: {
    type: VetRecord['type'];
    disease: string;
    symptoms: string;
    causer: string;
    treatment: string;
    drug: string;
    inventoryDrug: string;
    dosage: string;
    route: VetRecord['administrationRoute'];
    temp: number;
    hr: number;
    rr: number;
    milkWH: number;
    meatWH: number;
    cost: number;
    recoveryStatus: string;
    repeatNotes: string;
    notes: string;
    daysToNext: number;
  }) => {
    setVetType(preset.type);
    setVetDiseaseOrCondition(preset.disease);
    setVetSymptoms(preset.symptoms);
    setVetCauser(preset.causer);
    setVetTreatment(preset.treatment);
    setVetDrugAdministered(preset.drug);
    setVetDrugUsedFromInventory(preset.inventoryDrug);
    setVetDosage(preset.dosage);
    setVetRoute(preset.route);
    setVetTemp(preset.temp);
    setVetHeartRate(preset.hr);
    setVetRespRate(preset.rr);
    setVetWithdrawalMilk(preset.milkWH);
    setVetWithdrawalMeat(preset.meatWH);
    setVetCost(preset.cost);
    setVetRecoveryStatus(preset.recoveryStatus);
    setVetRepeatMedicalNotes(preset.repeatNotes);
    setVetNotes(preset.notes);
    setVetPrognosis('Good');

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + preset.daysToNext);
    setVetNextDue(toIsoDate(nextDate));
  };

  // Submit new vet record
  const handleVetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetCowId || !vetTreatment.trim()) return;

    const newRecord: VetRecord = {
      id: `vet-${Date.now()}`,
      cowId: vetCowId,
      cowName: vetCowName || undefined,
      animalCategory: vetAnimalCategory,
      date: vetDate,
      type: vetType,
      diseaseOrCondition: vetDiseaseOrCondition.trim() || undefined,
      symptoms: vetSymptoms.trim() || undefined,
      causer: vetCauser.trim() || undefined,
      treatment: vetTreatment.trim(),
      drugAdministered: vetDrugAdministered.trim() || undefined,
      drugUsedFromInventory: vetDrugUsedFromInventory.trim() || undefined,
      dosage: vetDosage.trim() || undefined,
      administrationRoute: vetRoute,
      cost: vetCost === '' ? 0 : Number(vetCost),
      staff: vetStaff,
      notes: vetNotes.trim() || 'Health intervention recorded successfully.',
      repeatMedicalNotes: vetRepeatMedicalNotes.trim() || undefined,
      nextDueDate: vetNextDue || undefined,
      nextTreatmentDate: vetNextDue || undefined,
      recoveryStatus: vetRecoveryStatus || 'Under Treatment',
      treatmentStatus: vetRecoveryStatus === 'Recovered' || vetRecoveryStatus === 'Resolved' ? 'Done' : 'In Progress',
      reminderStatus: vetNextDue ? 'In Progress' : 'Done',
      
      // Clinical vitals:
      diagnosis: vetDiseaseOrCondition.trim() || undefined,
      temperature: vetTemp === '' ? undefined : Number(vetTemp),
      heartRate: vetHeartRate === '' ? undefined : Number(vetHeartRate),
      respiratoryRate: vetRespRate === '' ? undefined : Number(vetRespRate),
      withdrawalMilkDays: vetWithdrawalMilk === '' ? undefined : Number(vetWithdrawalMilk),
      withdrawalMeatDays: vetWithdrawalMeat === '' ? undefined : Number(vetWithdrawalMeat),
      prognosis: vetPrognosis,
      retreatmentScheduled: !!vetNextDue && (vetRecoveryStatus === 'Under Treatment' || vetRecoveryStatus === 'Scheduled Repeat')
    };

    onAddVetRecord(newRecord);

    // Reset Form
    setVetTreatment('');
    setVetDiseaseOrCondition('');
    setVetSymptoms('');
    setVetCauser('');
    setVetDrugAdministered('');
    setVetDrugUsedFromInventory('');
    setVetDosage('');
    setVetCost('');
    setVetNotes('');
    setVetRepeatMedicalNotes('');
    setVetNextDue('');
    setVetTemp('');
    setVetHeartRate('');
    setVetRespRate('');
    setVetWithdrawalMilk('');
    setVetWithdrawalMeat('');
    setVetRecoveryStatus('Under Treatment');
    setShowAddVetForm(false);
  };

  // CSV Export with comprehensive clinical & inventory tracking fields
  const downloadVetClinicalCSV = () => {
    if (vetRecords.length === 0) {
      alert('No veterinary records found to export.');
      return;
    }

    const headers = [
      'Record ID', 'Date', 'Cow Tag ID', 'Cow Friendly Name', 'Animal Category',
      'Intervention Type', 'Disease / Condition', 'Symptoms Observed', 'Suspected Cause / Etiology',
      'Treatment Protocol', 'Drug Administered', 'Drug from Inventory', 'Dosage', 'Route',
      'Cost (Ksh)', 'Recovery Status', 'Next Treatment / Due Date', 'Repeat Medical Notes',
      'Milk Withdrawal (Days)', 'Meat Withdrawal (Days)', 'Supervising Staff'
    ];

    const rows = vetRecords.map(rec => [
      rec.id,
      rec.date,
      rec.cowId,
      rec.cowName || '',
      rec.animalCategory || 'Cow',
      rec.type,
      rec.diseaseOrCondition || rec.diagnosis || '',
      rec.symptoms || '',
      rec.causer || '',
      rec.treatment,
      rec.drugAdministered || '',
      rec.drugUsedFromInventory || '',
      rec.dosage || '',
      rec.administrationRoute || 'IM',
      rec.cost || 0,
      rec.recoveryStatus || 'Completed',
      rec.nextDueDate || rec.nextTreatmentDate || '',
      rec.repeatMedicalNotes || '',
      rec.withdrawalMilkDays || 0,
      rec.withdrawalMeatDays || 0,
      rec.staff
    ]);

    exportToCsv(`Herd_Veterinary_Health_Ledger_${toIsoDate()}`, headers, rows);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    const s = vetSearch.toLowerCase();
    return vetRecords.filter(r => {
      const matchesSearch = 
        r.cowId?.toLowerCase().includes(s) ||
        r.cowName?.toLowerCase().includes(s) ||
        r.treatment?.toLowerCase().includes(s) ||
        r.diseaseOrCondition?.toLowerCase().includes(s) ||
        r.diagnosis?.toLowerCase().includes(s) ||
        r.symptoms?.toLowerCase().includes(s) ||
        r.causer?.toLowerCase().includes(s) ||
        r.drugAdministered?.toLowerCase().includes(s) ||
        r.drugUsedFromInventory?.toLowerCase().includes(s) ||
        r.staff?.toLowerCase().includes(s) ||
        r.notes?.toLowerCase().includes(s);

      const matchesType = vetTypeFilter ? r.type === vetTypeFilter : true;
      const matchesStatus = vetStatusFilter ? r.recoveryStatus === vetStatusFilter : true;
      const matchesCow = vetCowFilter ? r.cowId === vetCowFilter : true;

      return matchesSearch && matchesType && matchesStatus && matchesCow;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [vetRecords, vetSearch, vetTypeFilter, vetStatusFilter, vetCowFilter]);

  // Statistics for top health KPI bar
  const stats = useMemo(() => {
    const totalInterventions = vetRecords.length;
    const activeCases = vetRecords.filter(r => 
      r.recoveryStatus === 'Under Treatment' || 
      r.recoveryStatus === 'Critical' || 
      r.recoveryStatus === 'Scheduled Repeat' ||
      r.treatmentStatus === 'In Progress'
    ).length;
    
    const today = toIsoDate();
    const upcomingFollowUps = vetRecords.filter(r => {
      const due = r.nextDueDate || r.nextTreatmentDate;
      return due && due >= today && r.recoveryStatus !== 'Recovered' && r.recoveryStatus !== 'Resolved';
    }).length;

    const totalSpend = vetRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    return { totalInterventions, activeCases, upcomingFollowUps, totalSpend };
  }, [vetRecords]);

  return (
    <>
      <div className="space-y-6">
        {/* TOP HEALTH OVERVIEW KPI BAR (Replaced intrusive red alert box with clean KPI cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Stethoscope size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Health Interventions</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{stats.totalInterventions}</span>
              <span className="text-[11px] text-emerald-700 font-bold">Total procedures logged</span>
            </div>
          </div>

          <div 
            onClick={() => setVetStatusFilter(vetStatusFilter === 'Under Treatment' ? '' : 'Under Treatment')}
            className={`border rounded-2xl p-5 shadow-xs flex items-center gap-4 cursor-pointer transition-all ${
              vetStatusFilter === 'Under Treatment'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300'
                : 'bg-white border-slate-100 hover:border-amber-200'
            }`}
            title="Click to filter active cases"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <HeartPulse size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Under Treatment</span>
              <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{stats.activeCases}</span>
              <span className="text-[11px] text-slate-500 font-bold">
                {vetStatusFilter === 'Under Treatment' ? 'Filtered active cases' : 'Active medical care'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Next Due / Repeats</span>
              <span className="text-xl font-black text-indigo-900 font-mono mt-0.5 block">{stats.upcomingFollowUps}</span>
              <span className="text-[11px] text-slate-500 font-bold">Scheduled future doses</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
              <Activity size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Veterinary Spend</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">Ksh {stats.totalSpend.toLocaleString()}</span>
              <span className="text-[11px] text-rose-700 font-bold">Health & medicine budget</span>
            </div>
          </div>
        </div>

        {/* TOOLBAR CONTROLS: SEARCH, FILTERS, EXPORT & NEW RECORD BUTTON */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search Tag, Disease, Symptom, Drug..."
                value={vetSearch}
                onChange={(e) => setVetSearch(e.target.value)}
                className="text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl w-full font-bold focus:outline-none bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="w-full sm:w-44">
              <select
                value={vetCowFilter}
                onChange={(e) => setVetCowFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="">All Animals</option>
                {cows.map(cow => (
                  <option key={cow.id} value={cow.id}>{cow.id} ({cow.name})</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-40">
              <select
                value={vetTypeFilter}
                onChange={(e) => setVetTypeFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="">All Procedures</option>
                <option value="Treatment">Clinical Treatment</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Deworming">Deworming</option>
                <option value="General Practice">General Checkup</option>
              </select>
            </div>

            <div className="w-full sm:w-40">
              <select
                value={vetStatusFilter}
                onChange={(e) => setVetStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="">All Recovery Statuses</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Scheduled Repeat">Scheduled Repeat</option>
                <option value="Recovered">Recovered / Cleared</option>
                <option value="Critical">Critical Monitoring</option>
                <option value="Chronic">Chronic / Guarded</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dense Clinical Table View"
              >
                <LayoutList size={13} />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Timeline View"
              >
                <LayoutGrid size={13} />
                Cards
              </button>
            </div>

            <button
              onClick={downloadVetClinicalCSV}
              type="button"
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-950 hover:bg-indigo-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
              title="Download Veterinary History CSV"
            >
              <FileSpreadsheet size={13} />
              Export Health CSV
            </button>

            {onTriggerSectionReport && (
              <button
                onClick={() => onTriggerSectionReport('vet')}
                type="button"
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                title="Download Cattle Health PDF Report"
              >
                <Download size={13} />
                Health PDF Report
              </button>
            )}

            <button
              onClick={() => setShowAddVetForm(!showAddVetForm)}
              className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-900 flex items-center justify-center gap-1.5 m-0 shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Log Health Treatment
            </button>
          </div>
        </div>

        {/* LOG NEW VETERINARY HEALTH INTERVENTION FORM */}
        {showAddVetForm && (
          <form onSubmit={handleVetSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope size={18} className="text-emerald-600" />
                  Log Comprehensive Veterinary & Animal Health Treatment
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Track diseases, symptoms, causes, pharmacy drugs from inventory, repeat protocols, and recovery progress
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
                Registry Linked • Clinical Ledger
              </span>
            </div>

            {/* Quick Diagnostic Presets */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-600" /> 1-Click Clinical Protocol Presets
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Click any standard protocol to automatically pre-fill disease, symptoms, causes, drug, dosage, and withdrawal times:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {[
                  {
                    label: '🩺 East Coast Fever (ECF)',
                    type: 'Treatment' as const,
                    disease: 'Theileria parva (East Coast Fever)',
                    symptoms: 'High fever (40.5°C), swollen prescapular lymph nodes, anorexia, corneal opacity',
                    causer: 'Tick vector (Rhipicephalus appendiculatus - Brown Ear Tick)',
                    treatment: 'Deep IM Buparvaquone + supportive Oxytetracycline 20% L.A.',
                    drug: 'Buparvaquone + Oxytetracycline 20%',
                    inventoryDrug: 'Buparvaquone (Butalex / Bupatox 50ml)',
                    dosage: '1ml per 20kg bodyweight IM',
                    route: 'IM' as const,
                    temp: 40.5, hr: 95, rr: 38,
                    milkWH: 3, meatWH: 28, cost: 4500,
                    recoveryStatus: 'Under Treatment',
                    repeatNotes: 'Re-examine temperature in 48 hours. Administer 2nd dose if pyrexia persists.',
                    notes: 'Tick-borne protocol initialized. Quarantined in isolation stall.',
                    daysToNext: 2
                  },
                  {
                    label: '🥛 Clinical Mastitis',
                    type: 'Treatment' as const,
                    disease: 'Clinical Mastitis (Quarter Inflammation)',
                    symptoms: 'Swollen hard quarter, yellow watery milk with fibrin clots, local pain',
                    causer: 'Bacterial infection (Staphylococcus aureus / Streptococcus uberis)',
                    treatment: 'Intramammary antibiotic infusion + systemic Pen-Strep',
                    drug: 'Cefa-Lak Intramammary + Penicillin-Streptomycin',
                    inventoryDrug: 'Cefa-Lak Intramammary Infusion Tubes',
                    dosage: '1 intramammary tube per quarter + 20ml IM systemic',
                    route: 'Intramammary' as const,
                    temp: 39.2, hr: 80, rr: 24,
                    milkWH: 5, meatWH: 10, cost: 1800,
                    recoveryStatus: 'Under Treatment',
                    repeatNotes: 'Strip infected quarter 3x daily. Strict milk discard for 5 days.',
                    notes: 'Milked last with dedicated cluster. Teat dip applied.',
                    daysToNext: 3
                  },
                  {
                    label: '🪱 Routine Deworming',
                    type: 'Deworming' as const,
                    disease: 'Gastrointestinal Nematode Parasitism',
                    symptoms: 'Mild rough coat, periodic soft stools, preventive routine',
                    causer: 'Internal parasites (Nematodes / Roundworms / Flukes)',
                    treatment: 'Broad-spectrum oral anthelmintic drenching',
                    drug: 'Albendazole 10% Oral Suspension',
                    inventoryDrug: 'Albendazole 10% Oral Suspension',
                    dosage: '10ml per 100kg bodyweight',
                    route: 'Oral' as const,
                    temp: 38.5, hr: 68, rr: 18,
                    milkWH: 3, meatWH: 14, cost: 850,
                    recoveryStatus: 'Recovered',
                    repeatNotes: 'Next scheduled herd anthelmintic rotation in 90 days.',
                    notes: 'Dosed post-milking using automatic drench gun.',
                    daysToNext: 90
                  },
                  {
                    label: '🛡️ FMD Vaccination',
                    type: 'Vaccination' as const,
                    disease: 'Foot & Mouth Disease (FMD) Prophylaxis',
                    symptoms: 'None (Healthy animal, prophylactic herd immunization)',
                    causer: 'Viral exposure prevention (Aphthovirus SAT-1, SAT-2, O, A)',
                    treatment: 'Inactivated Quadrivalent FMD Vaccine',
                    drug: 'FMD Quadrivalent Vaccine',
                    inventoryDrug: 'FMD Quadrivalent Vaccine (Cold Chain)',
                    dosage: '2ml subcutaneous into dewlap',
                    route: 'SC' as const,
                    temp: 38.6, hr: 70, rr: 20,
                    milkWH: 0, meatWH: 0, cost: 1200,
                    recoveryStatus: 'Recovered',
                    repeatNotes: 'Next herd booster due in 6 months (180 days).',
                    notes: 'Cold chain verified at 4°C prior to inoculation.',
                    daysToNext: 180
                  },
                  {
                    label: '🫁 Calf / Adult Pneumonia',
                    type: 'Treatment' as const,
                    disease: 'Bovine Respiratory Disease (Pneumonia)',
                    symptoms: 'Coughing, rapid shallow respiration (45 bpm), purulent nasal discharge, fever',
                    causer: 'Bacterial/Viral complex (Mannheimia haemolytica / Pasteurella)',
                    treatment: 'Broad-spectrum antibiotic + NSAID anti-inflammatory',
                    drug: 'Oxytetracycline 20% L.A. + Meloxicam',
                    inventoryDrug: 'Oxytetracycline 20% L.A. 100ml',
                    dosage: '20ml IM deep + 10ml Meloxicam',
                    route: 'IM' as const,
                    temp: 40.2, hr: 88, rr: 45,
                    milkWH: 7, meatWH: 21, cost: 2200,
                    recoveryStatus: 'Under Treatment',
                    repeatNotes: 'Recheck lung sounds in 72 hours. Ensure dry bedding.',
                    notes: 'Respiratory distress observed during morning walk.',
                    daysToNext: 3
                  },
                  {
                    label: '⚡ Milk Fever (Downer)',
                    type: 'Treatment' as const,
                    disease: 'Milk Fever (Parturient Hypocalcemia)',
                    symptoms: 'Recumbent "S-shape" posture, cold extremities/ears, muscle tremors, anorexia',
                    causer: 'Metabolic deficiency (Acute drop in serum calcium post-calving)',
                    treatment: 'Slow IV infusion of Calcium Borogluconate 40%',
                    drug: 'Calcium Borogluconate 40% + Magnesium',
                    inventoryDrug: 'Calcium Borogluconate 40% (Cal-Boro IV)',
                    dosage: '500ml slow IV infusion warmed to body temp',
                    route: 'IV' as const,
                    temp: 37.4, hr: 92, rr: 28,
                    milkWH: 0, meatWH: 0, cost: 2500,
                    recoveryStatus: 'Under Treatment',
                    repeatNotes: 'Monitor heart rhythm during IV infusion. Administer oral calcium paste at 12 hours.',
                    notes: 'Calved 18 hours prior. Emergency clinical response.',
                    daysToNext: 1
                  }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-left bg-white hover:bg-indigo-50 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all font-bold cursor-pointer shadow-2xs"
                  >
                    <span className="text-[11px] font-extrabold text-slate-800 block truncate">{p.label}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{p.type} • Ksh {p.cost}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: ANIMAL FROM REGISTRY & DATES */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">1</span>
                Patient Selection from Cattle Registry & Timeline
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Select Animal from Registry*
                  </label>
                  <select
                    required
                    value={vetCowId}
                    onChange={handleSelectCow}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose Registered Animal --</option>
                    <optgroup label="Registered Dairy Cows">
                      {cows.map(cow => (
                        <option key={cow.id} value={cow.id}>
                          {cow.id} ({cow.name || 'Unnamed'}) — {cow.breed} [{cow.locality || 'General Barn'}]
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Special & Herd Protocols">
                      <option value="All Cattle / Herd Protocol">All Cattle / Herd Protocol (Entire Herd)</option>
                      <option value="All Heifers Group">All Heifers Group</option>
                      <option value="All Calves Group">All Calves Group</option>
                      <option value="Other Livestock / General">Other Livestock / Custom Animal</option>
                    </optgroup>
                  </select>

                  {/* Registered animal info pill if matched */}
                  {selectedCowInfo && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
                      <span>🏷️ <strong>{selectedCowInfo.name}</strong> ({selectedCowInfo.id})</span>
                      <span>•</span>
                      <span>{selectedCowInfo.breed}</span>
                      <span>•</span>
                      <span className={selectedCowInfo.gender === 'Male' ? 'text-blue-700' : 'text-pink-700'}>
                        {selectedCowInfo.gender === 'Male' ? '♂ Male' : '♀ Female'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} /> {selectedCowInfo.locality || 'Barn'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-emerald-800">Status: {selectedCowInfo.status}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Intervention / Diagnosis Date*
                  </label>
                  <input
                    required
                    type="date"
                    value={vetDate}
                    onChange={e => setVetDate(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Intervention Class*
                  </label>
                  <select
                    required
                    value={vetType}
                    onChange={e => setVetType(e.target.value as any)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Treatment">Clinical Treatment (Sick Animal)</option>
                    <option value="Vaccination">Booster Vaccination (FMD, Anthrax, ECF)</option>
                    <option value="Deworming">Deworming Anthelmintic Protocol</option>
                    <option value="General Practice">General Practice / Checkup / Surgery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: DISEASE/VACCINATION, SYMPTOMS & CAUSER */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h5 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">2</span>
                Disease / Vaccination, Clinical Symptoms & Suspected Causer
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Disease / Vaccination / Condition*
                  </label>
                  <input
                    required
                    list="cattle-diseases-list"
                    type="text"
                    placeholder="e.g. Clinical Mastitis, East Coast Fever, FMD"
                    value={vetDiseaseOrCondition}
                    onChange={e => setVetDiseaseOrCondition(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <datalist id="cattle-diseases-list">
                    <option value="Clinical Mastitis (Acute / Subclinical)" />
                    <option value="Theileria parva (East Coast Fever - ECF)" />
                    <option value="Foot & Mouth Disease (FMD) Prophylaxis" />
                    <option value="Anaplasmosis (Gall Sickness)" />
                    <option value="Anthrax (Bacillus anthracis)" />
                    <option value="Blackquarter (Blackleg - Clostridium)" />
                    <option value="Lumpy Skin Disease (LSD)" />
                    <option value="Bovine Respiratory Disease (Pneumonia)" />
                    <option value="Milk Fever (Parturient Hypocalcemia)" />
                    <option value="Ketosis (Acetonemia)" />
                    <option value="Bloat (Ruminal Tympany)" />
                    <option value="Foot Rot (Interdigital Dermatitis)" />
                    <option value="Calf Scours / Enteritis" />
                    <option value="Eye Pinkeye (Infectious Bovine Keratoconjunctivitis)" />
                    <option value="Gastrointestinal Parasites (Nematodes/Flukes)" />
                    <option value="Brucellosis Screening & Vaccination" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Observed Symptoms & Clinical Signs
                  </label>
                  <input
                    list="cattle-symptoms-list"
                    type="text"
                    placeholder="e.g. High fever, swollen quarter, milk clots, anorexia"
                    value={vetSymptoms}
                    onChange={e => setVetSymptoms(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-medium focus:border-emerald-500 focus:outline-none"
                  />
                  <datalist id="cattle-symptoms-list">
                    <option value="High fever (40.5°C), enlarged prescapular lymph node, lacrimation" />
                    <option value="Swollen hot quarter, yellow watery milk with clots, pain on milking" />
                    <option value="Profuse watery diarrhea, severe dehydration, sunken eyes, dullness" />
                    <option value="Recumbent S-curve neck, cold extremities, subnormal temp, muscle tremors" />
                    <option value="Coughing, rapid shallow respiration, purulent nasal discharge" />
                    <option value="Severe lameness, interdigital swelling, necrotic odor, crack in hoof" />
                    <option value="Frothy distension of left paralumbar fossa, respiratory distress" />
                    <option value="Cutaneous nodular eruptions on hide, fever, edema in dewlap" />
                    <option value="Pale mucous membranes, jaundice, coffee-colored dark urine, anemia" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Suspected Causer / Etiology / Vector
                  </label>
                  <input
                    list="cattle-causers-list"
                    type="text"
                    placeholder="e.g. Tick vector (Rhipicephalus), Bacterial, Viral, Metabolic"
                    value={vetCauser}
                    onChange={e => setVetCauser(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-medium focus:border-emerald-500 focus:outline-none"
                  />
                  <datalist id="cattle-causers-list">
                    <option value="Tick vector (Rhipicephalus appendiculatus - Brown Ear Tick)" />
                    <option value="Tick vector (Boophilus decoloratus - Blue Tick / Anaplasma)" />
                    <option value="Bacterial infection (Staphylococcus aureus / Streptococcus uberis)" />
                    <option value="Bacterial infection (Escherichia coli / Coliforms)" />
                    <option value="Bacterial infection (Clostridium chauvoei - Blackleg)" />
                    <option value="Viral infection (Aphthovirus - Foot and Mouth Disease)" />
                    <option value="Viral infection (Capripoxvirus - Lumpy Skin Disease)" />
                    <option value="Internal parasites (Haemonchus, Ostertagia, Liver Fluke)" />
                    <option value="Metabolic calcium drop (Post-calving hypocalcemia)" />
                    <option value="Negative energy balance / High production ketosis" />
                    <option value="Feed bloat / Rapid legume & wet clover fermentation" />
                    <option value="Physical foot trauma / Muddy lane stone bruising" />
                  </datalist>
                </div>
              </div>
            </div>

            {/* SECTION 3: DRUG USED FROM INVENTORY & PHARMACEUTICAL PROTOCOL */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h5 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">3</span>
                Treatment Protocol, Drug Used from Inventory & Withdrawals
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Intervention / Procedure Summary*
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Intramammary antibiotic infusion + systemic antibiotic, IV calcium"
                    value={vetTreatment}
                    onChange={e => setVetTreatment(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                    <Pill size={11} className="text-emerald-600" />
                    Drug Used from Farm Pharmacy / Inventory*
                  </label>
                  <input
                    list="farm-inventory-drugs-list"
                    type="text"
                    placeholder="Select or type drug name from inventory..."
                    value={vetDrugUsedFromInventory}
                    onChange={e => {
                      setVetDrugUsedFromInventory(e.target.value);
                      if (!vetDrugAdministered) setVetDrugAdministered(e.target.value);
                    }}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <datalist id="farm-inventory-drugs-list">
                    {inventoryDrugOptions.map((drug, i) => (
                      <option key={i} value={drug} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Dosage Administered
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20ml IM daily, 1 tube, 60ml drench"
                    value={vetDosage}
                    onChange={e => setVetDosage(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Administration Route
                  </label>
                  <select
                    value={vetRoute}
                    onChange={e => setVetRoute(e.target.value as any)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="IM">IM (Intramuscular)</option>
                    <option value="IV">IV (Intravenous)</option>
                    <option value="SC">SC (Subcutaneous)</option>
                    <option value="Oral">Oral (Drench / Bolus)</option>
                    <option value="Intramammary">Intramammary (Infusion)</option>
                    <option value="Topical">Topical (Wound / Spray / Dip)</option>
                    <option value="Other">Other Routing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-700 mb-1">
                    Milk Withdrawal (Days)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3 (Discard milk)"
                    value={vetWithdrawalMilk}
                    onChange={e => setVetWithdrawalMilk(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full text-xs p-3 border border-amber-200 bg-amber-50 text-amber-900 rounded-xl font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-700 mb-1">
                    Meat Withdrawal (Days)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 14 (No slaughter)"
                    value={vetWithdrawalMeat}
                    onChange={e => setVetWithdrawalMeat(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full text-xs p-3 border border-amber-200 bg-amber-50 text-amber-900 rounded-xl font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: NEXT TREATMENT, REPEAT NOTES & RECOVERY STATUS */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h5 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">4</span>
                Next Treatment Date, Repeat Medical Notes & Recovery Tracking
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar size={11} className="text-emerald-600" />
                    Next Treatment / Repeat Due Date
                  </label>
                  <input
                    type="date"
                    value={vetNextDue}
                    onChange={e => setVetNextDue(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Recovery & Health Status
                  </label>
                  <select
                    value={vetRecoveryStatus}
                    onChange={e => setVetRecoveryStatus(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Under Treatment">Under Treatment (Active Case)</option>
                    <option value="Scheduled Repeat">Scheduled Repeat Dose</option>
                    <option value="Recovered">Recovered / Case Resolved</option>
                    <option value="Critical">Critical (Intensive Monitoring)</option>
                    <option value="Chronic">Chronic / Guarded Outlook</option>
                    <option value="Resolved">Resolved / Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Intervention Cost (Ksh)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={vetCost}
                    onChange={e => setVetCost(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Attending Officer / Veterinarian
                  </label>
                  <select
                    value={vetStaff}
                    onChange={e => setVetStaff(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Dr. Devin Omwenga (Vet)">Dr. Devin Omwenga (Vet Manager)</option>
                    {staffList.map(st => (
                      <option key={st.id} value={`${st.name} (${st.unit})`}>
                        {st.name} ({st.unit})
                      </option>
                    ))}
                    <option value="Resident Farm Attendant">Resident Farm Attendant</option>
                    <option value="External Private Vet">External Private Vet</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Repeat Medical Notes & Follow-up Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Repeat 2nd dose in 48 hours if fever persists. Strip quarters 3x daily. Milk discard strictly observed."
                    value={vetRepeatMedicalNotes}
                    onChange={e => setVetRepeatMedicalNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-medium resize-none focus:border-emerald-500 focus:outline-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    General Observational Notes & Milking Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Normal rumination index, mild congestion of mucosal membrane. Advised owner to avoid damp stalls."
                    value={vetNotes}
                    onChange={e => setVetNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-medium resize-none focus:border-emerald-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddVetForm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer m-0 border-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer m-0 border-none"
              >
                <CheckCircle2 size={15} /> Save Health Record
              </button>
            </div>
          </form>
        )}

        {/* LEDGER HEADER & COUNT */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Herd Veterinary & Animal Health History
            </h4>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              Showing <strong className="text-slate-800 font-mono">{filteredRecords.length}</strong> recorded interventions
            </p>
          </div>
        </div>

        {/* ZERO STATE */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="text-slate-300" size={28} />
            </div>
            <h4 className="text-slate-800 font-black text-sm uppercase mb-1">No Veterinary Records Found</h4>
            <p className="text-slate-400 text-xs font-bold mb-6 max-w-md">
              No medical interventions match your current search or filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setVetSearch('');
                setVetTypeFilter('');
                setVetStatusFilter('');
                setVetCowFilter('');
              }}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer border-none"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* COMPACT DENSE TABLE VIEW */
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Date & Patient</th>
                    <th className="py-3.5 px-4">Procedure & Condition</th>
                    <th className="py-3.5 px-4">Symptoms & Cause</th>
                    <th className="py-3.5 px-4">Drug Used (Inventory)</th>
                    <th className="py-3.5 px-4">Next Due / Repeat Notes</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Cost (Ksh)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map(record => {
                    const matchedCow = cows.find(c => c.id.toLowerCase() === record.cowId.toLowerCase());
                    const cowDisplayName = record.cowName || (matchedCow ? matchedCow.name : '');
                    const isUnderTreatment = record.recoveryStatus === 'Under Treatment' || record.treatmentStatus === 'In Progress';

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date & Patient */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-slate-800 block">{record.date}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-black font-mono text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {record.cowId}
                            </span>
                            {cowDisplayName && (
                              <span className="text-[11px] font-bold text-slate-600 truncate max-w-[100px]">
                                {cowDisplayName}
                              </span>
                            )}
                          </div>
                          {matchedCow?.locality && (
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 flex items-center gap-0.5">
                              <MapPin size={9} /> {matchedCow.locality}
                            </span>
                          )}
                        </td>

                        {/* Procedure & Condition */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1 border ${
                            record.type === 'Treatment' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            record.type === 'Vaccination' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            record.type === 'Deworming' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {record.type}
                          </span>
                          <span className="font-extrabold text-slate-900 block text-xs leading-snug">
                            {record.diseaseOrCondition || record.diagnosis || record.treatment}
                          </span>
                          {record.diseaseOrCondition && record.diseaseOrCondition !== record.treatment && (
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                              {record.treatment}
                            </span>
                          )}
                        </td>

                        {/* Symptoms & Cause */}
                        <td className="py-3.5 px-4 max-w-[220px]">
                          {record.symptoms ? (
                            <div className="space-y-0.5">
                              <span className="text-[11px] text-slate-700 font-medium line-clamp-2 block" title={record.symptoms}>
                                🔍 {record.symptoms}
                              </span>
                              {record.causer && (
                                <span className="text-[10px] text-slate-500 font-semibold truncate block" title={record.causer}>
                                  Vector: {record.causer}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No symptoms noted</span>
                          )}
                        </td>

                        {/* Drug Used (Inventory) */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          {record.drugUsedFromInventory || record.drugAdministered ? (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 text-[11px] block truncate" title={record.drugUsedFromInventory || record.drugAdministered}>
                                💊 {record.drugUsedFromInventory || record.drugAdministered}
                              </span>
                              {record.dosage && (
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  Dose: {record.dosage} ({record.administrationRoute || 'IM'})
                                </span>
                              )}
                              {record.withdrawalMilkDays ? (
                                <span className="inline-block text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                                  ⚠️ Milk WH: {record.withdrawalMilkDays}d
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">—</span>
                          )}
                        </td>

                        {/* Next Due / Repeat Notes */}
                        <td className="py-3.5 px-4 max-w-[180px]">
                          {(record.nextDueDate || record.nextTreatmentDate) ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                                <Timer size={10} /> {record.nextDueDate || record.nextTreatmentDate}
                              </span>
                              {record.repeatMedicalNotes && (
                                <span className="text-[10px] text-slate-600 truncate block font-medium" title={record.repeatMedicalNotes}>
                                  {record.repeatMedicalNotes}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic font-mono">None scheduled</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            record.recoveryStatus === 'Recovered' || record.recoveryStatus === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            record.recoveryStatus === 'Critical' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                            record.recoveryStatus === 'Scheduled Repeat' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                            record.recoveryStatus === 'Chronic' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            {record.recoveryStatus || 'Under Treatment'}
                          </span>
                        </td>

                        {/* Cost & Staff */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-black text-slate-900 text-xs block">
                            Ksh {(record.cost || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5 truncate max-w-[110px]">
                            {record.staff || 'Farm Vet'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedRecordForDetails(record)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="View Full Health Chart"
                            >
                              <Eye size={13} />
                            </button>
                            {onEditVetRecord && (
                              <button
                                onClick={() => setEditingVet(record)}
                                className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Edit Health Record"
                              >
                                <PenSquare size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Delete veterinary record for ${record.cowId} on ${record.date}?`)) {
                                  onDeleteVetRecord(record.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50/80 px-4 py-2.5 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-slate-500 font-medium">
              <span>Total Interventions: <strong className="text-slate-800 font-mono">{filteredRecords.length}</strong></span>
              <span className="text-[11px] text-slate-400">Click <strong>Eye</strong> icon to view complete clinical observation history</span>
            </div>
          </div>
        ) : (
          /* CARD TIMELINE VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecords.map(record => {
              const matchedCow = cows.find(c => c.id.toLowerCase() === record.cowId.toLowerCase());
              const cowDisplayName = record.cowName || (matchedCow ? matchedCow.name : '');

              return (
                <div key={record.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-200 transition-all flex flex-col justify-between">
                  <div>
                    {/* Top Row: Date, Cow Tag & Actions */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-slate-800">{record.date}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            record.type === 'Treatment' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            record.type === 'Vaccination' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            record.type === 'Deworming' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {record.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-black font-mono text-emerald-950 text-sm bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {record.cowId}
                          </span>
                          {cowDisplayName && (
                            <span className="font-extrabold text-slate-700 text-xs">
                              {cowDisplayName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedRecordForDetails(record)}
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                          title="View Full Details"
                        >
                          <Eye size={13} />
                        </button>
                        {onEditVetRecord && (
                          <button
                            onClick={() => setEditingVet(record)}
                            className="text-slate-400 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                            title="Edit Record"
                          >
                            <PenSquare size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete veterinary record for ${record.cowId}?`)) {
                              onDeleteVetRecord(record.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Condition / Disease Banner */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                        Condition & Procedure
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-xs leading-snug">
                        {record.diseaseOrCondition || record.diagnosis || record.treatment}
                      </h5>
                      {record.treatment && record.treatment !== record.diseaseOrCondition && (
                        <p className="text-[11px] text-slate-600 font-medium">
                          {record.treatment}
                        </p>
                      )}
                    </div>

                    {/* Symptoms & Causer */}
                    {(record.symptoms || record.causer) && (
                      <div className="mt-2.5 p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/60 space-y-1 text-xs">
                        {record.symptoms && (
                          <div>
                            <span className="text-[9px] font-black uppercase text-indigo-900 block">Symptoms:</span>
                            <span className="text-[11px] text-slate-700 font-medium block leading-tight">{record.symptoms}</span>
                          </div>
                        )}
                        {record.causer && (
                          <div className="pt-1">
                            <span className="text-[9px] font-black uppercase text-indigo-900 block">Suspected Cause / Vector:</span>
                            <span className="text-[11px] text-slate-600 font-medium block leading-tight">{record.causer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drug Administered & Inventory */}
                    {(record.drugUsedFromInventory || record.drugAdministered) && (
                      <div className="mt-2.5 p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100/60 space-y-1 text-xs">
                        <span className="text-[9px] font-black uppercase text-emerald-800 flex items-center gap-1">
                          <Pill size={10} /> Drug Used (Inventory):
                        </span>
                        <span className="font-extrabold text-slate-900 text-[11px] block">
                          {record.drugUsedFromInventory || record.drugAdministered}
                        </span>
                        {record.dosage && (
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Dose: {record.dosage} • Route: {record.administrationRoute || 'IM'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Withdrawal Notice */}
                    {(record.withdrawalMilkDays || record.withdrawalMeatDays) ? (
                      <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-bold flex flex-wrap gap-2">
                        {record.withdrawalMilkDays ? (
                          <span>⚠️ Milk Discard: <strong>{record.withdrawalMilkDays} Days</strong></span>
                        ) : null}
                        {record.withdrawalMeatDays ? (
                          <span>🍖 Meat WH: <strong>{record.withdrawalMeatDays} Days</strong></span>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Next Treatment & Repeat Notes */}
                    {(record.nextDueDate || record.nextTreatmentDate) && (
                      <div className="mt-2.5 p-2.5 bg-indigo-50 border border-indigo-200/80 rounded-2xl space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-black uppercase text-indigo-800 flex items-center gap-1">
                            <Timer size={11} /> Next Scheduled Dose:
                          </span>
                          <span className="font-mono font-black text-indigo-950">
                            {record.nextDueDate || record.nextTreatmentDate}
                          </span>
                        </div>
                        {record.repeatMedicalNotes && (
                          <p className="text-[10.5px] text-slate-600 font-medium leading-tight pt-0.5">
                            {record.repeatMedicalNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Recovery Status & Cost */}
                  <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      record.recoveryStatus === 'Recovered' || record.recoveryStatus === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      record.recoveryStatus === 'Critical' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                      record.recoveryStatus === 'Scheduled Repeat' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {record.recoveryStatus || 'Under Treatment'}
                    </span>
                    <span className="font-mono font-black text-slate-900 text-xs">
                      Ksh {(record.cost || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL MEDICAL CHART DETAILS MODAL */}
      {selectedRecordForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400 block">{selectedRecordForDetails.date}</span>
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  <Stethoscope className="text-emerald-600" size={20} />
                  {selectedRecordForDetails.cowId}
                  {selectedRecordForDetails.cowName && ` (${selectedRecordForDetails.cowName})`}
                  <span className="text-xs font-bold text-slate-400 font-sans">Medical Chart</span>
                </h4>
              </div>
              <button
                onClick={() => setSelectedRecordForDetails(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors m-0 border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Procedure</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedRecordForDetails.type}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Recovery Status</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedRecordForDetails.recoveryStatus || 'Active'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Next Due Date</span>
                <span className="font-bold text-slate-800 block mt-0.5 font-mono">
                  {selectedRecordForDetails.nextDueDate || selectedRecordForDetails.nextTreatmentDate || 'None'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Total Cost</span>
                <span className="font-bold text-slate-800 block mt-0.5 font-mono">
                  Ksh {(selectedRecordForDetails.cost || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Disease / Condition & Procedure:</span>
                <h5 className="font-extrabold text-slate-900 text-sm">
                  {selectedRecordForDetails.diseaseOrCondition || selectedRecordForDetails.treatment}
                </h5>
                {selectedRecordForDetails.treatment && selectedRecordForDetails.treatment !== selectedRecordForDetails.diseaseOrCondition && (
                  <p className="text-slate-600 font-medium">{selectedRecordForDetails.treatment}</p>
                )}
              </div>

              {selectedRecordForDetails.symptoms && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-900 block">Clinical Symptoms Observed:</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedRecordForDetails.symptoms}</p>
                </div>
              )}

              {selectedRecordForDetails.causer && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Suspected Cause / Etiology / Vector:</span>
                  <p className="text-slate-700 font-medium">{selectedRecordForDetails.causer}</p>
                </div>
              )}

              {(selectedRecordForDetails.drugUsedFromInventory || selectedRecordForDetails.drugAdministered) && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-900 block flex items-center gap-1">
                    <Pill size={11} /> Drug Administered & Inventory Reference:
                  </span>
                  <p className="font-extrabold text-emerald-950 text-xs">
                    {selectedRecordForDetails.drugUsedFromInventory || selectedRecordForDetails.drugAdministered}
                  </p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-emerald-900 font-medium">
                    {selectedRecordForDetails.dosage && <span>Dose: <strong>{selectedRecordForDetails.dosage}</strong></span>}
                    <span>Route: <strong>{selectedRecordForDetails.administrationRoute || 'IM'}</strong></span>
                    {selectedRecordForDetails.withdrawalMilkDays ? (
                      <span>Milk WH: <strong className="underline">{selectedRecordForDetails.withdrawalMilkDays} Days</strong></span>
                    ) : null}
                    {selectedRecordForDetails.withdrawalMeatDays ? (
                      <span>Meat WH: <strong className="underline">{selectedRecordForDetails.withdrawalMeatDays} Days</strong></span>
                    ) : null}
                  </div>
                </div>
              )}

              {selectedRecordForDetails.repeatMedicalNotes && (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-900 block flex items-center gap-1">
                    <Timer size={11} /> Repeat Medical Notes & Follow-up Instructions:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">{selectedRecordForDetails.repeatMedicalNotes}</p>
                </div>
              )}

              {selectedRecordForDetails.notes && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Clinical Observations:</span>
                  <p className="text-slate-700 font-medium leading-relaxed italic">"{selectedRecordForDetails.notes}"</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold">Attending Vet: {selectedRecordForDetails.staff}</span>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetails(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase transition-colors cursor-pointer"
              >
                Close Medical Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VETERINARY RECORD MODAL */}
      {editingVet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PenSquare size={16} className="text-emerald-600" />
                  Edit Animal Health Record
                </h4>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  Update patient identity, diseases, symptoms, causes, drugs & repeat notes
                </p>
              </div>
              <button
                onClick={() => setEditingVet(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors m-0 border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Animal Tag ID</label>
                  <input
                    type="text"
                    value={editingVet.cowId}
                    onChange={e => setEditingVet({ ...editingVet, cowId: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Friendly Name</label>
                  <input
                    type="text"
                    value={editingVet.cowName || ''}
                    onChange={e => setEditingVet({ ...editingVet, cowName: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Intervention Date</label>
                  <input
                    type="date"
                    value={editingVet.date}
                    onChange={e => setEditingVet({ ...editingVet, date: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Intervention Class</label>
                  <select
                    value={editingVet.type}
                    onChange={e => setEditingVet({ ...editingVet, type: e.target.value as any })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Treatment">Treatment</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Deworming">Deworming</option>
                    <option value="General Practice">General Practice</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Disease / Condition</label>
                  <input
                    type="text"
                    value={editingVet.diseaseOrCondition || editingVet.treatment}
                    onChange={e => setEditingVet({ ...editingVet, diseaseOrCondition: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Symptoms Observed</label>
                  <input
                    type="text"
                    value={editingVet.symptoms || ''}
                    onChange={e => setEditingVet({ ...editingVet, symptoms: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Suspected Cause / Etiology</label>
                  <input
                    type="text"
                    value={editingVet.causer || ''}
                    onChange={e => setEditingVet({ ...editingVet, causer: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Drug Used from Inventory</label>
                  <input
                    list="edit-inventory-drugs"
                    type="text"
                    value={editingVet.drugUsedFromInventory || editingVet.drugAdministered || ''}
                    onChange={e => setEditingVet({ ...editingVet, drugUsedFromInventory: e.target.value, drugAdministered: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <datalist id="edit-inventory-drugs">
                    {inventoryDrugOptions.map((drug, i) => (
                      <option key={i} value={drug} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Dosage & Route</label>
                  <input
                    type="text"
                    value={editingVet.dosage || ''}
                    onChange={e => setEditingVet({ ...editingVet, dosage: e.target.value })}
                    placeholder="e.g. 20ml IM"
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Next Treatment Date</label>
                  <input
                    type="date"
                    value={editingVet.nextDueDate || editingVet.nextTreatmentDate || ''}
                    onChange={e => setEditingVet({ ...editingVet, nextDueDate: e.target.value, nextTreatmentDate: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Recovery Status</label>
                  <select
                    value={editingVet.recoveryStatus || 'Under Treatment'}
                    onChange={e => setEditingVet({ ...editingVet, recoveryStatus: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Scheduled Repeat">Scheduled Repeat</option>
                    <option value="Recovered">Recovered / Cleared</option>
                    <option value="Critical">Critical</option>
                    <option value="Chronic">Chronic</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Cost (Ksh)</label>
                  <input
                    type="number"
                    value={editingVet.cost}
                    onChange={e => setEditingVet({ ...editingVet, cost: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Repeat Medical Notes</label>
                <textarea
                  rows={2}
                  value={editingVet.repeatMedicalNotes || ''}
                  onChange={e => setEditingVet({ ...editingVet, repeatMedicalNotes: e.target.value })}
                  className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-medium resize-none focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Clinical Observations</label>
                <textarea
                  rows={2}
                  value={editingVet.notes || ''}
                  onChange={e => setEditingVet({ ...editingVet, notes: e.target.value })}
                  className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-medium resize-none focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditingVet(null)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onEditVetRecord) {
                    onEditVetRecord(editingVet.id, editingVet);
                  }
                  setEditingVet(null);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
