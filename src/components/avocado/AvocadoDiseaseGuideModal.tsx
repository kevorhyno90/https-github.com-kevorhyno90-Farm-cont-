import React, { useState } from 'react';
import { AVOCADO_DISEASE_COMPENDIUM, AvocadoDiseaseInfo } from './AvocadoDiseaseReference';
import { Search, X, ShieldAlert, Sparkles, Droplets, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { InventoryItem } from '../../types';

interface AvocadoDiseaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSelectTreatmentForPractice?: (disease: AvocadoDiseaseInfo, drug: any) => void;
}

export function AvocadoDiseaseGuideModal({
  isOpen,
  onClose,
  inventory,
  onSelectTreatmentForPractice
}: AvocadoDiseaseGuideModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDiseaseId, setActiveDiseaseId] = useState<string>(AVOCADO_DISEASE_COMPENDIUM[0].id);

  if (!isOpen) return null;

  const categories = ['All', 'Fungal Disease', 'Oomycete / Root Rot', 'Insect Pest', 'Physiological Disorder'];

  const filtered = AVOCADO_DISEASE_COMPENDIUM.filter((d) => {
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(term) ||
      d.scientificName.toLowerCase().includes(term) ||
      d.symptoms.some(s => s.toLowerCase().includes(term)) ||
      d.recommendedDrugs.some(drug => drug.tradeName.toLowerCase().includes(term) || drug.activeIngredient.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  const activeDisease = AVOCADO_DISEASE_COMPENDIUM.find(d => d.id === activeDiseaseId) || filtered[0] || AVOCADO_DISEASE_COMPENDIUM[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl border border-emerald-500/30">
              <ShieldAlert className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Export Avocado Disease & Drug Compendium</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono">
                  KEPHIS / GlobalGAP Verified
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Pathogen identification, symptoms, inventory drug prescriptions, and cultural agronomic protocols.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search diseases, drugs, or symptoms..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Left List + Right Detail */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-0">
          
          {/* Left Column: Disease Selector */}
          <div className="md:col-span-4 p-4 space-y-2 overflow-y-auto max-h-[58vh]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Disease or Disorder ({filtered.length})
            </span>
            {filtered.map((d) => {
              const isSelected = activeDisease.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDiseaseId(d.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {d.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                      d.severity === 'Critical / High Risk'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.severity === 'Critical / High Risk' ? 'High Risk' : 'Moderate'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic font-serif block">
                    {d.scientificName}
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-semibold text-slate-700">
                      {d.category}
                    </span>
                    <span>• {d.recommendedDrugs.length} drugs</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Full Details & Drug Guide */}
          <div className="md:col-span-8 p-6 space-y-6 overflow-y-auto max-h-[58vh] bg-white">
            {activeDisease ? (
              <>
                {/* Header */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-lg font-black text-slate-900">{activeDisease.name}</h4>
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      {activeDisease.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic font-serif">
                    Causal Agent: {activeDisease.scientificName}
                  </p>
                </div>

                {/* Symptoms */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
                  <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={14} className="text-rose-600" />
                    Key Symptoms & Orchard Identification
                  </h5>
                  <ul className="space-y-1.5">
                    {activeDisease.symptoms.map((s, idx) => (
                      <li key={idx} className="text-xs text-rose-950 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Drugs & Inventory Matching */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Droplets size={14} className="text-emerald-700" />
                      Prescribed Drugs & Inventory Availability
                    </h5>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Select a drug to pre-populate practice logger
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeDisease.recommendedDrugs.map((drug, idx) => {
                      // Check if matching drug exists in user's inventory
                      const stockMatch = inventory.find(inv =>
                        inv.name.toLowerCase().includes(drug.matchingInventoryKeyword.toLowerCase()) ||
                        drug.tradeName.toLowerCase().includes(inv.name.toLowerCase())
                      );

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                {drug.tradeName}
                              </span>
                              <span className="text-[10px] text-slate-600 font-medium">
                                Active Ingredient: <strong className="text-slate-800">{drug.activeIngredient}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {stockMatch ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  In Stock: {stockMatch.quantity} {stockMatch.unit}
                                </span>
                              ) : (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                                  Not in Inventory
                                </span>
                              )}

                              {onSelectTreatmentForPractice && (
                                <button
                                  onClick={() => {
                                    onSelectTreatmentForPractice(activeDisease, drug);
                                    onClose();
                                  }}
                                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <span>Log Practice</span>
                                  <ExternalLink size={10} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[10px]">
                            <div>
                              <span className="text-slate-500 font-medium">Method:</span>{' '}
                              <strong className="text-slate-800">{drug.applicationMethod}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">Pre-Harvest Interval:</span>{' '}
                              <strong className="text-emerald-700">{drug.phiDays} Days PHI</strong>
                            </div>
                            <div className="sm:col-span-3">
                              <span className="text-slate-500 font-medium">Recommended Dosage:</span>{' '}
                              <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {drug.defaultDosage}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cultural & Preventative Agronomy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                    <h6 className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-emerald-600" />
                      Cultural Practices (Pruning & Weeding)
                    </h6>
                    <ul className="space-y-1">
                      {activeDisease.culturalPractices.map((c, i) => (
                        <li key={i} className="text-[11px] text-emerald-900 flex items-start gap-1.5">
                          <CheckCircle2 size={11} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                    <h6 className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 size={12} className="text-amber-600" />
                      Preventative Cycle & Next Due Timing
                    </h6>
                    <ul className="space-y-1">
                      {activeDisease.preventativeMeasures.map((p, i) => (
                        <li key={i} className="text-[11px] text-amber-900 flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-2 border-t border-amber-200 text-[10px] text-amber-800 font-bold">
                      Recommended Reschedule Interval: Every {activeDisease.recommendedIntervalDays} days
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Official JR Farm Agronomy Protocol • Certified by Dr. Devin Omwenga</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            Close Compendium
          </button>
        </div>

      </div>
    </div>
  );
}
