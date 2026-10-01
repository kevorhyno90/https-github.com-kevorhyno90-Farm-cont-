import React, { useState, useMemo } from 'react';
import { PoultryHealthRecord, PoultryFlock } from '../../types';
import {
  Stethoscope, Plus, Edit2, Trash2, ShieldCheck, AlertTriangle,
  Calendar, CheckCircle2, Search, Filter, Clock, DollarSign
} from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';

interface PoultryHealthHubProps {
  healthRecords: PoultryHealthRecord[];
  flocks: PoultryFlock[];
  onAddHealthRecord: (rec: PoultryHealthRecord) => void;
  onUpdateHealthRecord: (id: string, updated: PoultryHealthRecord) => void;
  onDeleteHealthRecord: (id: string) => void;
  preselectedFlock?: PoultryFlock | null;
  onClearPreselectedFlock?: () => void;
}

const COMMON_DISEASES = [
  'Newcastle Disease (Prophylaxis / Outbreak)',
  'Infectious Bursal Disease (Gumboro)',
  'Coccidiosis (Eimeria tenella / necatrix)',
  'Chronic Respiratory Disease (CRD / Mycoplasma)',
  'Fowl Pox (Wing web inoculation)',
  'Fowl Typhoid (Salmonella gallinarum)',
  'Infectious Coryza (Avibacterium paragallinarum)',
  'Roundworms & Cecal Worms (Ascaridia / Heterakis)',
  'External Mites & Lice Infestation',
  'Heat Stress & Dehydration Prophylaxis',
  'Duck Viral Enteritis (Duck Plague)',
  'Duck Limberneck / Botulism Prevention',
  'Egg Peritonitis / Salpingitis',
  'Nutritional Calcium & Vitamin D Deficiency'
];

const COMMON_SYMPTOMS = [
  'Bloody / reddish soft droppings',
  'Gasping, coughing & nasal discharge',
  'Drooping wings & ruffled feathers',
  'Sudden drop in egg production (>15%)',
  'Swollen eyes & facial edema',
  'Lethargy & huddling in corners',
  'Loss of balance / uncoordinated walk',
  'Soft-shelled or cracked deformed eggs',
  'Pale or shriveled wattle and comb',
  'Routine biosecurity prophylaxis (No symptoms)'
];

const COMMON_DRUGS = [
  'Amprolium 20% Soluble Powder',
  'Newcastle LaSota Live Vaccine',
  'Gumboro Intermediate Plus Vaccine',
  'Oxytetracycline 20% WS (Alamycin)',
  'Tylosin Tartrate 100% Soluble (CRD)',
  'Piperazine Dihydrochloride Dewormer',
  'Levamisole HCl Soluble Dewormer',
  'Vitalyte WS Multivitamin & Electrolyte',
  'Aliseryl WS Antibiotic + Vitamin Complex',
  'Virkon S / TH4+ Biosecurity Spray'
];

export function PoultryHealthHub({
  healthRecords,
  flocks,
  onAddHealthRecord,
  onUpdateHealthRecord,
  onDeleteHealthRecord,
  preselectedFlock,
  onClearPreselectedFlock
}: PoultryHealthHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PoultryHealthRecord | null>(null);

  // Form State
  const [flockId, setFlockId] = useState<string>('');
  const [dateRecorded, setDateRecorded] = useState<string>(toIsoDate(new Date()));
  const [category, setCategory] = useState<'Vaccination' | 'Disease Treatment' | 'Deworming' | 'Supplementation' | 'Biosecurity Spray'>('Vaccination');
  const [diseaseOrCondition, setDiseaseOrCondition] = useState<string>(COMMON_DISEASES[0]);
  const [symptomsObserved, setSymptomsObserved] = useState<string>('');
  const [drugsOrVaccineUsed, setDrugsOrVaccineUsed] = useState<string>(COMMON_DRUGS[0]);
  const [dosage, setDosage] = useState<string>('1g per 2 Liters of drinking water for 5 days');
  const [administrationRoute, setAdministrationRoute] = useState<'Drinking Water' | 'Eye Drop' | 'Wing Web Stab' | 'Feed Mix' | 'Subcutaneous Injection' | 'Aerosol Spray'>('Drinking Water');
  const [affectedCount, setAffectedCount] = useState<number>(0);
  const [mortalityInEpisode, setMortalityInEpisode] = useState<number>(0);
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState<number>(3);
  const [vetOrStaff, setVetOrStaff] = useState<string>('Dr. Joseph Ndwiga');
  const [costKsh, setCostKsh] = useState<number>(1200);
  const [outcome, setOutcome] = useState<'Fully Recovered' | 'Under Treatment' | 'Scheduled Booster' | 'Worsened / Mortality'>('Fully Recovered');
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (preselectedFlock) {
      openAddModal(preselectedFlock);
      if (onClearPreselectedFlock) onClearPreselectedFlock();
    }
  }, [preselectedFlock]);

  const openAddModal = (targetFlock?: PoultryFlock) => {
    const f = targetFlock || flocks[0];
    setEditingRecord(null);
    setFlockId(f ? f.id : '');
    setDateRecorded(toIsoDate(new Date()));
    setCategory('Vaccination');
    setDiseaseOrCondition(COMMON_DISEASES[0]);
    setSymptomsObserved('Routine biosecurity vaccination (No symptoms)');
    setDrugsOrVaccineUsed(COMMON_DRUGS[1]);
    setDosage('1 drop per chick ocular / nostril');
    setAdministrationRoute('Eye Drop');
    setAffectedCount(0);
    setMortalityInEpisode(0);
    setWithdrawalPeriodDays(0);
    setVetOrStaff('Dr. Joseph Ndwiga');
    setCostKsh(1200);
    setOutcome('Fully Recovered');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (rec: PoultryHealthRecord) => {
    setEditingRecord(rec);
    setFlockId(rec.flockId);
    setDateRecorded(rec.dateRecorded);
    setCategory(rec.category);
    setDiseaseOrCondition(rec.diseaseOrCondition);
    setSymptomsObserved(rec.symptomsObserved);
    setDrugsOrVaccineUsed(rec.drugsOrVaccineUsed);
    setDosage(rec.dosage);
    setAdministrationRoute(rec.administrationRoute);
    setAffectedCount(rec.affectedCount || 0);
    setMortalityInEpisode(rec.mortalityInEpisode || 0);
    setWithdrawalPeriodDays(rec.withdrawalPeriodDays || 0);
    setVetOrStaff(rec.vetOrStaff);
    setCostKsh(rec.costKsh || 0);
    setOutcome(rec.outcome);
    setNotes(rec.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selFlock = flocks.find(f => f.id === flockId);
    const flockName = selFlock ? selFlock.flockName : 'Poultry Flock';
    const species = selFlock ? selFlock.species : 'Chicken';

    // Calculate withdrawal end date
    const d = new Date(dateRecorded);
    d.setDate(d.getDate() + Number(withdrawalPeriodDays));
    const withdrawalEndDate = toIsoDate(d);

    if (editingRecord) {
      const updated: PoultryHealthRecord = {
        ...editingRecord,
        flockId,
        flockName,
        species,
        dateRecorded,
        category,
        diseaseOrCondition,
        symptomsObserved,
        drugsOrVaccineUsed,
        dosage,
        administrationRoute,
        affectedCount: Number(affectedCount),
        mortalityInEpisode: Number(mortalityInEpisode),
        withdrawalPeriodDays: Number(withdrawalPeriodDays),
        withdrawalEndDate,
        vetOrStaff,
        costKsh: Number(costKsh),
        outcome,
        notes
      };
      onUpdateHealthRecord(editingRecord.id, updated);
    } else {
      const newRec: PoultryHealthRecord = {
        id: `hlth-${Date.now()}`,
        flockId,
        flockName,
        species,
        dateRecorded,
        category,
        diseaseOrCondition,
        symptomsObserved,
        drugsOrVaccineUsed,
        dosage,
        administrationRoute,
        affectedCount: Number(affectedCount),
        mortalityInEpisode: Number(mortalityInEpisode),
        withdrawalPeriodDays: Number(withdrawalPeriodDays),
        withdrawalEndDate,
        vetOrStaff,
        costKsh: Number(costKsh),
        outcome,
        notes
      };
      onAddHealthRecord(newRec);
    }
    setShowModal(false);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return healthRecords
      .filter(r => {
        const matchesSearch =
          r.flockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.diseaseOrCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.drugsOrVaccineUsed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.symptomsObserved || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
        const matchesOutcome = outcomeFilter === 'All' || r.outcome === outcomeFilter;
        return matchesSearch && matchesCategory && matchesOutcome;
      })
      .sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());
  }, [healthRecords, searchTerm, categoryFilter, outcomeFilter]);

  // Active Withdrawal Check
  const todayStr = toIsoDate(new Date());
  const activeWithdrawals = healthRecords.filter(r => {
    return r.withdrawalEndDate && r.withdrawalEndDate >= todayStr && r.withdrawalPeriodDays > 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Active Withdrawal Alerts */}
      {activeWithdrawals.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h5 className="font-bold text-rose-900">
              ⚠️ Active Drug Withdrawal Alert ({activeWithdrawals.length} flock medications active)
            </h5>
            <p className="text-rose-800">
              Eggs or meat from these flocks must NOT enter the food supply chain until the withdrawal window expires:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {activeWithdrawals.map(w => (
                <span key={w.id} className="bg-white/80 border border-rose-300 px-2.5 py-1 rounded-lg text-[11px] font-mono text-rose-900 font-bold">
                  {w.flockName}: {w.drugsOrVaccineUsed} (Safe: {w.withdrawalEndDate})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Search, Add */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search diseases, drugs, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Vaccination">💉 Vaccination</option>
              <option value="Disease Treatment">🩺 Disease Treatment</option>
              <option value="Deworming">🐛 Deworming</option>
              <option value="Supplementation">🧪 Supplementation</option>
              <option value="Biosecurity Spray">🛡️ Biosecurity Spray</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
            >
              <option value="All">All Outcomes</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Fully Recovered">Fully Recovered</option>
              <option value="Scheduled Booster">Scheduled Booster</option>
              <option value="Worsened / Mortality">Worsened / Mortality</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Log Health / Treatment Record
        </button>
      </div>

      {/* Health Records Feed */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
          <Stethoscope size={40} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-sm font-bold text-gray-800">No Poultry Health Records Found</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Log routine vaccinations (Newcastle, Gumboro), deworming doses, or clinical treatments for any flock.
          </p>
          <button
            onClick={() => openAddModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Log First Treatment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((r) => {
            const isWithdrawing = r.withdrawalEndDate && r.withdrawalEndDate >= todayStr && r.withdrawalPeriodDays > 0;
            const isDuck = r.species === 'Duck';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl p-1 bg-blue-50 rounded-lg">{isDuck ? '🦆' : '🐔'}</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {r.flockName}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                      r.category === 'Vaccination' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      r.category === 'Disease Treatment' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      r.category === 'Deworming' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {r.category}
                    </span>

                    <span className="text-[11px] font-mono text-gray-500 font-semibold">
                      📅 {r.dateRecorded}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                      r.outcome === 'Fully Recovered' ? 'bg-emerald-50 text-emerald-700' :
                      r.outcome === 'Under Treatment' ? 'bg-amber-50 text-amber-800 animate-pulse' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      ● {r.outcome}
                    </span>

                    <button
                      onClick={() => openEditModal(r)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Health Record"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete health record for ${r.flockName} (${r.diseaseOrCondition})?`)) {
                          onDeleteHealthRecord(r.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Primary Condition & Drugs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50/70 p-3.5 rounded-xl text-xs border border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Disease / Condition</span>
                    <span className="font-bold text-gray-900 text-[13px]">{r.diseaseOrCondition}</span>
                    {r.affectedCount && r.affectedCount > 0 ? (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                        {r.affectedCount} birds exhibiting symptoms
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Medication & Route</span>
                    <span className="font-semibold text-blue-900">{r.drugsOrVaccineUsed}</span>
                    <span className="text-[11px] text-gray-600 block mt-0.5 font-mono">
                      {r.dosage} ({r.administrationRoute})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Food Safety & Withdrawal</span>
                    {isWithdrawing ? (
                      <span className="font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={12} /> Unsafe till {r.withdrawalEndDate} ({r.withdrawalPeriodDays}d)
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} /> Cleared / Zero Withdrawal
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 block">
                      Vet / Admin: {r.vetOrStaff} {r.costKsh ? `• KSh ${r.costKsh}` : ''}
                    </span>
                  </div>
                </div>

                {/* Symptoms and observations */}
                {r.symptomsObserved && (
                  <div className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="font-bold text-gray-500 shrink-0">Symptoms:</span>
                    <span>{r.symptomsObserved}</span>
                  </div>
                )}

                {r.notes && (
                  <p className="text-[11px] text-gray-600 italic bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
                    "{r.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Health Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>🩺</span> {editingRecord ? 'Edit Avian Health / Vaccine Log' : 'Log Flock Disease or Vaccination'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record diagnoses, drugs, administration route, dosage, and meat/egg withdrawal dates.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Flock / Cohort *</label>
                  <select
                    required
                    value={flockId}
                    onChange={(e) => setFlockId(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    {flocks.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.species === 'Duck' ? '🦆' : '🐔'} {f.flockName} ({f.currentCount} birds, {f.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Date Recorded *</label>
                  <input
                    type="date"
                    required
                    value={dateRecorded}
                    onChange={(e) => setDateRecorded(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Intervention Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setCategory(cat);
                      if (cat === 'Vaccination') {
                        setWithdrawalPeriodDays(0);
                      } else if (cat === 'Disease Treatment') {
                        setWithdrawalPeriodDays(5);
                      } else if (cat === 'Deworming') {
                        setWithdrawalPeriodDays(3);
                      }
                    }}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Vaccination">💉 Vaccination</option>
                    <option value="Disease Treatment">🩺 Disease Treatment</option>
                    <option value="Deworming">🐛 Deworming</option>
                    <option value="Supplementation">🧪 Vitamin / Mineral Supplementation</option>
                    <option value="Biosecurity Spray">🛡️ Biosecurity / Virucidal Spray</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Disease, Condition, or Protocol *</label>
                  <input
                    type="text"
                    required
                    list="disease-suggestions"
                    value={diseaseOrCondition}
                    onChange={(e) => setDiseaseOrCondition(e.target.value)}
                    placeholder="E.g. Newcastle Disease, Coccidiosis, CRD"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                  <datalist id="disease-suggestions">
                    {COMMON_DISEASES.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>

                {/* Quick Symptoms Picker Chips */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase">Symptoms Observed *</label>
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {COMMON_SYMPTOMS.map(sym => (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => {
                          if (!symptomsObserved.includes(sym)) {
                            setSymptomsObserved(prev => prev ? `${prev}; ${sym}` : sym);
                          }
                        }}
                        className="text-[10px] bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-2 py-1 rounded-lg border border-gray-200 transition-colors"
                      >
                        + {sym}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={symptomsObserved}
                    onChange={(e) => setSymptomsObserved(e.target.value)}
                    placeholder="E.g. Bloody diarrhea, gasping, or select chips above"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Drug or Vaccine Administered *</label>
                  <input
                    type="text"
                    required
                    list="drug-suggestions"
                    value={drugsOrVaccineUsed}
                    onChange={(e) => setDrugsOrVaccineUsed(e.target.value)}
                    placeholder="E.g. Amprolium 20%, Newcastle LaSota"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                  <datalist id="drug-suggestions">
                    {COMMON_DRUGS.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Administration Route *</label>
                  <select
                    value={administrationRoute}
                    onChange={(e) => setAdministrationRoute(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Drinking Water">Drinking Water (Flock treatment)</option>
                    <option value="Eye Drop">Eye Drop / Ocular (Vaccines)</option>
                    <option value="Wing Web Stab">Wing Web Stab (Fowl Pox)</option>
                    <option value="Feed Mix">Feed Mix / Top-dressing</option>
                    <option value="Subcutaneous Injection">Subcutaneous Injection</option>
                    <option value="Aerosol Spray">Aerosol Spray / Mist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Dosage & Frequency *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="E.g. 1g per 2L water for 5 days"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">Meat & Egg Withdrawal (Days) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={withdrawalPeriodDays}
                    onChange={(e) => setWithdrawalPeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-rose-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Birds Symptomatic / Affected</label>
                  <input
                    type="number"
                    min="0"
                    value={affectedCount}
                    onChange={(e) => setAffectedCount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Attending Vet / Technician</label>
                  <input
                    type="text"
                    required
                    value={vetOrStaff}
                    onChange={(e) => setVetOrStaff(e.target.value)}
                    placeholder="Dr. Joseph Ndwiga"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Cost of Treatment (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    value={costKsh}
                    onChange={(e) => setCostKsh(parseFloat(e.target.value) || 0)}
                    placeholder="1200"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Recovery Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Fully Recovered">Fully Recovered (Normal activity)</option>
                    <option value="Under Treatment">Under Active Medication</option>
                    <option value="Scheduled Booster">Scheduled Booster Pending</option>
                    <option value="Worsened / Mortality">Worsened / Mortality Episode</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Clinical Notes & Observations</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Clean drinking nipples disinfected; water intake monitored closely."
                    className="w-full text-xs font-medium p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  {editingRecord ? 'Save Changes' : 'Save Health Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
