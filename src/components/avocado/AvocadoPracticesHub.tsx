import React, { useState } from 'react';
import { AvocadoPracticeRecord, InventoryItem, StaffMember } from '../../types';
import { AVOCADO_DISEASE_COMPENDIUM, AVOCADO_ORCHARD_SECTIONS, AvocadoDiseaseInfo } from './AvocadoDiseaseReference';
import { AvocadoDiseaseGuideModal } from './AvocadoDiseaseGuideModal';
import {
  ShieldCheck,
  Plus,
  Calendar,
  Sparkles,
  Scissors,
  Paintbrush,
  Droplets,
  AlertCircle,
  Clock,
  Trash2,
  CheckCircle2,
  Package,
  BookOpen,
  Filter,
  Check,
  RefreshCw,
  Search
} from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';

const getFutureDate = (days: number): string => offsetIsoDate(days);

interface AvocadoPracticesHubProps {
  practices: AvocadoPracticeRecord[];
  onAddPractice: (practice: AvocadoPracticeRecord) => void;
  onDeletePractice: (id: string) => void;
  inventory: InventoryItem[];
  onUpdateInventoryStock?: (id: string, newQty: number) => void;
  staffList: StaffMember[];
}

export function AvocadoPracticesHub({
  practices,
  onAddPractice,
  onDeletePractice,
  inventory,
  onUpdateInventoryStock,
  staffList
}: AvocadoPracticesHubProps) {
  // Modal state for Disease & Drug Guide
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Form states
  const [practiceDate, setPracticeDate] = useState<string>(toIsoDate(new Date()));
  const [sectionOrBlock, setSectionOrBlock] = useState<string>(AVOCADO_ORCHARD_SECTIONS[0].name);
  const [practiceType, setPracticeType] = useState<AvocadoPracticeRecord['practiceType']>('Disease Treatment');
  const [targetDiseaseOrPest, setTargetDiseaseOrPest] = useState<string>('Anthracnose Fruit & Twig Blight');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');
  const [customDrugName, setCustomDrugName] = useState<string>('');
  const [deductStock, setDeductStock] = useState<boolean>(true);
  const [stockQtyToDeduct, setStockQtyToDeduct] = useState<number | ''>(2);
  const [dosageAndMethod, setDosageAndMethod] = useState<string>('50g per 20L knapsack sprayer to full canopy run-off');
  const [operator, setOperator] = useState<string>(staffList[0]?.name || 'Josephine');
  const [phiDays, setPhiDays] = useState<number | ''>(14);
  const [reason, setReason] = useState<string>('Pre-harvest copper spray for anthracnose defense and fruit spot protection');
  const [nextDueDate, setNextDueDate] = useState<string>(getFutureDate(30));
  const [costKes, setCostKes] = useState<number | ''>(1800);
  const [notes, setNotes] = useState<string>('');

  // Table filter states
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick preset handlers based on practiceType
  const handlePracticeTypeChange = (type: AvocadoPracticeRecord['practiceType']) => {
    setPracticeType(type);
    if (type === 'Disease Treatment') {
      setTargetDiseaseOrPest('Anthracnose Fruit & Twig Blight');
      setDosageAndMethod('50g per 20L knapsack sprayer to full canopy run-off');
      setReason('Preventive copper fungicide spray after fruit set during wet conditions');
      setPhiDays(14);
      setNextDueDate(getFutureDate(30));
      // Try to select Copper Oxychloride from inventory if available
      const copperItem = inventory.find(i => i.name.toLowerCase().includes('copper'));
      if (copperItem) setSelectedInventoryId(copperItem.id);
    } else if (type === 'Painting Copper White Paint') {
      setTargetDiseaseOrPest('Sun Scald, Bark Cracking & Stem Canker');
      setDosageAndMethod('1:1 Copper Oxychloride + White Acrylic Latex painted 1.2m up lower trunk with brush');
      setReason('Protect tree trunks against sun scald, thermal bark splitting, and fungal ingress');
      setPhiDays(0);
      setNextDueDate(getFutureDate(180)); // 6 months recurrence
      const paintItem = inventory.find(i => i.name.toLowerCase().includes('paint') || i.name.toLowerCase().includes('copper'));
      if (paintItem) setSelectedInventoryId(paintItem.id);
    } else if (type === 'Pruning') {
      setTargetDiseaseOrPest('Skirt Clearance (0.5m) & Canopy Opening');
      setDosageAndMethod('Sanitized pruning shears at 45° angle; paint cut wounds > 2.5cm with copper sealant');
      setReason('Elevate skirt branches to prevent Phytophthora soil splash and open canopy for light & wind');
      setPhiDays(0);
      setNextDueDate(getFutureDate(90));
      setSelectedInventoryId('');
    } else if (type === 'Weeding') {
      setTargetDiseaseOrPest('Under-canopy weed competition');
      setDosageAndMethod('Manual ring weeding 1.5m radius + 15cm dry organic mulch layer (zero contact with trunk)');
      setReason('Eliminate nutrient/moisture competition and suppress fungal spore humidity');
      setPhiDays(0);
      setNextDueDate(getFutureDate(45));
      setSelectedInventoryId('');
    } else if (type === 'Foliar Nutrition') {
      setTargetDiseaseOrPest('Zinc & Boron Fruit Set Boost');
      setDosageAndMethod('Chelated Zinc-Boron foliar spray @ 20ml per 20L water');
      setReason('Optimize fruit set retention and reduce early fruitlet drop');
      setPhiDays(0);
      setNextDueDate(getFutureDate(30));
    }
  };

  // Callback when user picks a drug from the Disease Guide Modal
  const handleSelectFromGuide = (disease: AvocadoDiseaseInfo, drug: any) => {
    setPracticeType('Disease Treatment');
    setTargetDiseaseOrPest(disease.name);
    setReason(`Targeted protocol for ${disease.name} (${disease.scientificName})`);
    setDosageAndMethod(drug.defaultDosage);
    setPhiDays(drug.phiDays);
    setNextDueDate(getFutureDate(disease.recommendedIntervalDays || 30));

    // Match inventory
    const match = inventory.find(inv =>
      inv.name.toLowerCase().includes(drug.matchingInventoryKeyword.toLowerCase()) ||
      drug.tradeName.toLowerCase().includes(inv.name.toLowerCase())
    );

    if (match) {
      setSelectedInventoryId(match.id);
      setCustomDrugName(match.name);
    } else {
      setSelectedInventoryId('');
      setCustomDrugName(drug.tradeName);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceDate || !sectionOrBlock || !practiceType) return;

    let chosenDrugName = customDrugName.trim();
    let deductedQty = 0;
    let invUnit = '';

    // If an inventory item was selected
    if (selectedInventoryId) {
      const invItem = inventory.find(i => i.id === selectedInventoryId);
      if (invItem) {
        chosenDrugName = invItem.name;
        invUnit = invItem.unit;
        if (deductStock && stockQtyToDeduct !== '' && Number(stockQtyToDeduct) > 0) {
          deductedQty = Number(stockQtyToDeduct);
          if (onUpdateInventoryStock) {
            const newStock = Math.max(0, invItem.quantity - deductedQty);
            onUpdateInventoryStock(invItem.id, newStock);
          }
        }
      }
    }

    const newRecord: AvocadoPracticeRecord = {
      id: `avo-prc-${Date.now()}`,
      date: practiceDate,
      sectionOrBlock,
      practiceType,
      targetDiseaseOrPest: targetDiseaseOrPest.trim() || undefined,
      drugOrChemicalName: chosenDrugName || undefined,
      inventoryItemId: selectedInventoryId || undefined,
      inventoryQtyDeducted: deductedQty > 0 ? deductedQty : undefined,
      inventoryUnit: invUnit || undefined,
      dosageAndMethod: dosageAndMethod.trim() || 'Standard orchard protocol',
      operator: operator.trim() || 'Josephine',
      phiDays: phiDays === '' ? undefined : Number(phiDays),
      reason: reason.trim() || 'Export quality maintenance',
      nextDueDate: nextDueDate || getFutureDate(30),
      costKes: costKes === '' ? 0 : Number(costKes),
      notes: notes.trim() || undefined,
      status: 'Completed'
    };

    onAddPractice(newRecord);

    // Reset some fields
    setNotes('');
    setPracticeDate(toIsoDate(new Date()));
  };

  // Filtered practices list
  const filteredPractices = practices.filter((p) => {
    const matchesType = typeFilter === 'All' || p.practiceType === typeFilter;
    const matchesSec = sectionFilter === 'All' || p.sectionOrBlock === sectionFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.practiceType && p.practiceType.toLowerCase().includes(q)) ||
      (p.targetDiseaseOrPest && p.targetDiseaseOrPest.toLowerCase().includes(q)) ||
      (p.drugOrChemicalName && p.drugOrChemicalName.toLowerCase().includes(q)) ||
      (p.sectionOrBlock && p.sectionOrBlock.toLowerCase().includes(q)) ||
      (p.operator && p.operator.toLowerCase().includes(q)) ||
      (p.reason && p.reason.toLowerCase().includes(q));
    return matchesType && matchesSec && matchesSearch;
  });

  const todayStr = toIsoDate(new Date());

  // Inventory chemical/fertilizer items
  const relevantInventory = inventory.filter(i =>
    i.category === 'Chemical' || i.category === 'Fertilizer' || i.category === 'Tools' ||
    i.name.toLowerCase().includes('copper') || i.name.toLowerCase().includes('spray')
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Disease Guide Trigger */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-emerald-700/50">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-700/60 rounded-2xl border border-emerald-500/40 text-emerald-200">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight">Export Avocado Routine Practices & Disease Care</h3>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
                GlobalGAP Compliant
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
              Track disease treatments (with real inventory drug link), skirt pruning, ring weeding, and trunk copper white paint. Automatically schedule next due dates to never miss a protective cycle.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuideModal(true)}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <BookOpen size={16} />
          <span>Disease & Drug Compendium</span>
        </button>
      </div>

      {/* Main Grid: Logging Form (5 cols) + Ledger & Next Due Scheduler (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Container */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-700" />
                Record Agronomic Routine Practice
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select practice type, link drugs from inventory, and set next due date.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            
            {/* Practice Type Quick Selection Pills */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Practice Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(['Disease Treatment', 'Painting Copper White Paint', 'Pruning', 'Weeding', 'Foliar Nutrition', 'Irrigation & Mulching'] as AvocadoPracticeRecord['practiceType'][]).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handlePracticeTypeChange(type)}
                    className={`p-2 rounded-xl text-[10px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                      practiceType === type
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {type === 'Disease Treatment' && <Droplets size={12} className="shrink-0 text-emerald-300" />}
                    {type === 'Painting Copper White Paint' && <Paintbrush size={12} className="shrink-0 text-amber-300" />}
                    {type === 'Pruning' && <Scissors size={12} className="shrink-0 text-sky-300" />}
                    {type === 'Weeding' && <CheckCircle2 size={12} className="shrink-0 text-emerald-300" />}
                    <span className="truncate">{type === 'Painting Copper White Paint' ? 'Copper White Paint' : type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Disease / Reason */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Target Disease, Pest or Agronomic Goal
              </label>
              <input
                type="text"
                required
                value={targetDiseaseOrPest}
                onChange={(e) => setTargetDiseaseOrPest(e.target.value)}
                placeholder="E.g. Anthracnose, Phytophthora Root Rot, Sun Scald, Skirt Pruning"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Drug / Material from Inventory */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Package size={13} className="text-emerald-700" />
                  Drug / Chemical from Inventory
                </label>
                <span className="text-[9px] text-emerald-700 font-bold">
                  {relevantInventory.length} chemicals available
                </span>
              </div>

              <select
                value={selectedInventoryId}
                onChange={(e) => {
                  setSelectedInventoryId(e.target.value);
                  const selected = inventory.find(i => i.id === e.target.value);
                  if (selected) {
                    setCustomDrugName(selected.name);
                  }
                }}
                className="w-full text-xs bg-white border border-emerald-200 rounded-xl p-2 font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Select Drug / Item from Store Inventory --</option>
                {relevantInventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stock: {item.quantity} {item.unit}) [{item.category}]
                  </option>
                ))}
              </select>

              {/* If no inventory item or custom chemical */}
              {!selectedInventoryId && (
                <div>
                  <input
                    type="text"
                    value={customDrugName}
                    onChange={(e) => setCustomDrugName(e.target.value)}
                    placeholder="Or enter custom chemical name / material..."
                    className="w-full text-xs bg-white border border-emerald-200 rounded-xl p-2 text-slate-900 font-medium"
                  />
                </div>
              )}

              {/* Deduction toggle & amount */}
              {selectedInventoryId && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900 text-[11px]">
                    <input
                      type="checkbox"
                      checked={deductStock}
                      onChange={(e) => setDeductStock(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Deduct from Inventory Stock</span>
                  </label>

                  {deductStock && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">Qty:</span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={stockQtyToDeduct}
                        onChange={(e) => setStockQtyToDeduct(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-20 text-xs bg-white border border-emerald-300 rounded-lg p-1.5 font-bold font-mono text-center"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section/Block + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Orchard Section / Block
                </label>
                <select
                  value={sectionOrBlock}
                  onChange={(e) => setSectionOrBlock(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 cursor-pointer"
                >
                  {AVOCADO_ORCHARD_SECTIONS.map((sec) => (
                    <option key={sec.id} value={sec.name}>
                      {sec.name} ({sec.code})
                    </option>
                  ))}
                  <option value="All Orchard Blocks (Whole Estate)">All Orchard Blocks (Whole Estate)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Date Done
                </label>
                <input
                  type="date"
                  required
                  value={practiceDate}
                  onChange={(e) => setPracticeDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono text-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Method, Dosage & PHI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  How Done (Method & Dosage)
                </label>
                <input
                  type="text"
                  required
                  value={dosageAndMethod}
                  onChange={(e) => setDosageAndMethod(e.target.value)}
                  placeholder="E.g. 50g/20L knapsack canopy spray, painted 1m up lower trunk"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  PHI (Days Safe)
                </label>
                <input
                  type="number"
                  min="0"
                  value={phiDays}
                  onChange={(e) => setPhiDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Days"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Operator (Who) + Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Who (Operator / Supervisor)
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 cursor-pointer"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                  <option value="Casual Spray Crew">Casual Spray Crew</option>
                  <option value="Dr. Devin Omwenga">Dr. Devin Omwenga (Farm Manager)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Direct Cost (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  value={costKes}
                  onChange={(e) => setCostKes(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="KES"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono text-slate-900"
                />
              </div>
            </div>

            {/* NEXT TIME THE PRACTICE WILL BE DONE AGAIN */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-700" />
                  Next Time Practice Will Be Done Again
                </label>
                <span className="text-[10px] text-amber-800 font-mono font-bold">
                  {nextDueDate}
                </span>
              </div>

              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2.5 font-bold font-mono text-slate-900 cursor-pointer"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-amber-800 self-center mr-1">Recurrence:</span>
                {[
                  { label: '+14 Days', days: 14 },
                  { label: '+30 Days', days: 30 },
                  { label: '+90 Days (Quarterly)', days: 90 },
                  { label: '+180 Days (Paint)', days: 180 },
                  { label: '+1 Year', days: 365 }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => setNextDueDate(getFutureDate(item.days))}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason & Notes */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Reason & Agronomic Observations
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Why the practice was done, tree response, spray conditions..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Log Practice & Schedule Next Due Date</span>
            </button>

          </form>
        </div>

        {/* Right Container: Filterable Ledger & Next Due Scheduler (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search practices, drugs, who..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer"
              >
                <option value="All">All Practice Types</option>
                <option value="Disease Treatment">Disease Treatment</option>
                <option value="Painting Copper White Paint">Copper White Paint</option>
                <option value="Pruning">Pruning</option>
                <option value="Weeding">Weeding</option>
                <option value="Foliar Nutrition">Foliar Nutrition</option>
              </select>

              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total: {filteredPractices.length}
              </span>
            </div>
          </div>

          {/* Practice Records List */}
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredPractices.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                <ShieldCheck size={36} className="mx-auto text-slate-300" />
                <h5 className="text-sm font-bold text-slate-700">No practices recorded yet</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Log your routine avocado disease treatments, trunk copper whitewash, or pruning on the left.
                </p>
              </div>
            ) : (
              filteredPractices.map((p) => {
                const isOverdue = p.nextDueDate < todayStr;
                const isDueToday = p.nextDueDate === todayStr;

                return (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg text-white font-bold text-xs ${
                          p.practiceType === 'Disease Treatment' ? 'bg-emerald-700' :
                          p.practiceType === 'Painting Copper White Paint' ? 'bg-amber-600' :
                          p.practiceType === 'Pruning' ? 'bg-sky-600' :
                          p.practiceType === 'Weeding' ? 'bg-teal-600' : 'bg-slate-700'
                        }`}>
                          {p.practiceType === 'Disease Treatment' && <Droplets size={14} />}
                          {p.practiceType === 'Painting Copper White Paint' && <Paintbrush size={14} />}
                          {p.practiceType === 'Pruning' && <Scissors size={14} />}
                          {p.practiceType === 'Weeding' && <CheckCircle2 size={14} />}
                          {p.practiceType !== 'Disease Treatment' && p.practiceType !== 'Painting Copper White Paint' && p.practiceType !== 'Pruning' && p.practiceType !== 'Weeding' && <Sparkles size={14} />}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-black text-slate-900">{p.practiceType}</h5>
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md font-mono">
                              {p.date}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-800">
                            {p.sectionOrBlock}
                          </span>
                        </div>
                      </div>

                      {/* Next Due Date Status */}
                      <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            : isDueToday
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <Clock size={12} />
                          <span>
                            Next Due: {p.nextDueDate} {isOverdue ? '(OVERDUE)' : isDueToday ? '(TODAY)' : ''}
                          </span>
                        </div>

                        <button
                          onClick={() => onDeletePractice(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete practice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Target & Drug Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-500 font-medium">Target / Disease:</span>{' '}
                        <strong className="text-slate-900 font-bold">{p.targetDiseaseOrPest || 'General Maintenance'}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium">Drug / Inventory Material:</span>{' '}
                        <strong className="text-emerald-800 font-bold">
                          {p.drugOrChemicalName || 'Manual Tools / None'}
                        </strong>
                        {p.inventoryQtyDeducted && (
                          <span className="text-[10px] text-amber-700 ml-1 font-mono">
                            (-{p.inventoryQtyDeducted} {p.inventoryUnit || ''} from store)
                          </span>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-medium">Method & Dosage:</span>{' '}
                        <span className="font-mono text-slate-800 font-medium">{p.dosageAndMethod}</span>
                      </div>
                    </div>

                    {/* Operator, Reason & Cost */}
                    <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                      <div>
                        <span>Operator: <strong className="text-slate-800">{p.operator}</strong></span>
                        {p.phiDays !== undefined && (
                          <span className="ml-3 font-semibold text-emerald-700">PHI: {p.phiDays} Days</span>
                        )}
                        {p.reason && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Reason: {p.reason}
                          </p>
                        )}
                      </div>

                      {p.costKes ? (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Cost</span>
                          <span className="text-xs font-bold font-mono text-slate-900">
                            KES {p.costKes.toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Disease & Drug Compendium Modal */}
      <AvocadoDiseaseGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        inventory={inventory}
        onSelectTreatmentForPractice={handleSelectFromGuide}
      />

    </div>
  );
}
