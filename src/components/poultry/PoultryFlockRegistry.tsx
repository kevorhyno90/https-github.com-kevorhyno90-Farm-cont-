import React, { useState } from 'react';
import { PoultryFlock, PoultrySpecies, PoultryStage, PoultryProductionState } from '../../types';
import {
  Plus, Edit2, Trash2, Search, Filter, Egg, Stethoscope, AlertTriangle,
  Layers, MapPin, Calendar, CheckCircle2, TrendingUp, Users, DollarSign
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface PoultryFlockRegistryProps {
  flocks: PoultryFlock[];
  onAddFlock: (flock: PoultryFlock) => void;
  onUpdateFlock: (id: string, updated: PoultryFlock) => void;
  onDeleteFlock: (id: string) => void;
  onSelectFlockForEgg?: (flock: PoultryFlock) => void;
  onSelectFlockForHealth?: (flock: PoultryFlock) => void;
  onSelectFlockForMortality?: (flock: PoultryFlock) => void;
}

export function PoultryFlockRegistry({
  flocks,
  onAddFlock,
  onUpdateFlock,
  onDeleteFlock,
  onSelectFlockForEgg,
  onSelectFlockForHealth,
  onSelectFlockForMortality
}: PoultryFlockRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | PoultrySpecies>('All');
  const [stageFilter, setStageFilter] = useState<'All' | PoultryStage>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingFlock, setEditingFlock] = useState<PoultryFlock | null>(null);

  // Form State
  const [flockName, setFlockName] = useState('');
  const [species, setSpecies] = useState<PoultrySpecies>('Chicken');
  const [breed, setBreed] = useState('');
  const [stage, setStage] = useState<PoultryStage>('Adults / Layers / Breeders');
  const [stateOfProduction, setStateOfProduction] = useState<PoultryProductionState>('Active Egg Laying');
  const [initialCount, setInitialCount] = useState(100);
  const [currentCount, setCurrentCount] = useState(100);
  const [hatchDate, setHatchDate] = useState(toIsoDate(new Date()));
  const [housingPen, setHousingPen] = useState('');
  const [source, setSource] = useState('Kenchic Hatchery');
  const [targetLayRatePercent, setTargetLayRatePercent] = useState<number>(80);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(2.0);
  const [costPerBird, setCostPerBird] = useState<number>(120);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Culled' | 'Sold' | 'Depleted'>('Active');

  const openAddModal = () => {
    setEditingFlock(null);
    setFlockName('');
    setSpecies('Chicken');
    setBreed('');
    setStage('Adults / Layers / Breeders');
    setStateOfProduction('Active Egg Laying');
    setInitialCount(100);
    setCurrentCount(100);
    setHatchDate(toIsoDate(new Date()));
    setHousingPen('Deep Litter Coop 1');
    setSource('Kenchic Hatchery');
    setTargetLayRatePercent(80);
    setTargetWeightKg(2.0);
    setCostPerBird(120);
    setDescription('');
    setStatus('Active');
    setShowModal(true);
  };

  const openEditModal = (f: PoultryFlock) => {
    setEditingFlock(f);
    setFlockName(f.flockName);
    setSpecies(f.species);
    setBreed(f.breed);
    setStage(f.stage);
    setStateOfProduction(f.stateOfProduction);
    setInitialCount(f.initialCount);
    setCurrentCount(f.currentCount);
    setHatchDate(f.hatchDate);
    setHousingPen(f.housingPen);
    setSource(f.source || '');
    setTargetLayRatePercent(f.targetLayRatePercent || 80);
    setTargetWeightKg(f.targetWeightKg || 2.0);
    setCostPerBird(f.costPerBird || 0);
    setDescription(f.description || '');
    setStatus(f.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFlock) {
      const updated: PoultryFlock = {
        ...editingFlock,
        flockName,
        species,
        breed,
        stage,
        stateOfProduction,
        initialCount: Number(initialCount),
        currentCount: Number(currentCount),
        hatchDate,
        housingPen,
        source,
        targetLayRatePercent: targetLayRatePercent ? Number(targetLayRatePercent) : undefined,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : undefined,
        costPerBird: costPerBird ? Number(costPerBird) : undefined,
        description,
        status,
        updatedAt: new Date().toISOString()
      };
      onUpdateFlock(editingFlock.id, updated);
    } else {
      const newFlock: PoultryFlock = {
        id: `flk-${Date.now()}`,
        flockName,
        species,
        breed,
        stage,
        stateOfProduction,
        initialCount: Number(initialCount),
        currentCount: Number(currentCount),
        hatchDate,
        housingPen,
        source,
        targetLayRatePercent: targetLayRatePercent ? Number(targetLayRatePercent) : undefined,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : undefined,
        costPerBird: costPerBird ? Number(costPerBird) : undefined,
        description,
        dateAcquired: toIsoDate(new Date()),
        status: 'Active'
      };
      onAddFlock(newFlock);
    }
    setShowModal(false);
  };

  // Age Calculator
  const calculateAge = (hatch: string) => {
    if (!hatch) return 'Unknown age';
    const birth = new Date(hatch).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Just hatched';
    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;
    if (weeks === 0) return `${diffDays} days old`;
    return `${weeks} wks, ${remDays}d`;
  };

  const filteredFlocks = flocks.filter(f => {
    const matchesSearch = 
      f.flockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.housingPen.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || f.species === speciesFilter;
    const matchesStage = stageFilter === 'All' || f.stage === stageFilter;
    return matchesSearch && matchesSpecies && matchesStage;
  });

  const totalHead = flocks.reduce((acc, f) => acc + (f.currentCount || 0), 0);
  const totalLayers = flocks.filter(f => f.stateOfProduction === 'Active Egg Laying').reduce((acc, f) => acc + (f.currentCount || 0), 0);
  const totalGrowers = flocks.filter(f => f.stage === 'Growers / Pullets').reduce((acc, f) => acc + (f.currentCount || 0), 0);
  const totalChicks = flocks.filter(f => f.stage === 'Chicks / Ducklings').reduce((acc, f) => acc + (f.currentCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Avian Headcount</div>
            <div className="text-xl font-bold text-gray-900">{totalHead.toLocaleString()} <span className="text-xs font-normal text-gray-500">birds</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Egg size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Egg Layers</div>
            <div className="text-xl font-bold text-emerald-700">{totalLayers.toLocaleString()} <span className="text-xs font-normal text-gray-500">hens/ducks</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Growers & Pullets</div>
            <div className="text-xl font-bold text-blue-700">{totalGrowers.toLocaleString()} <span className="text-xs font-normal text-gray-500">birds</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Chicks & Ducklings</div>
            <div className="text-xl font-bold text-purple-700">{totalChicks.toLocaleString()} <span className="text-xs font-normal text-gray-500">nursery</span></div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and New Flock Button */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search flock name, breed, pen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Species:</span>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value as any)}
              className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
            >
              <option value="All">All Species</option>
              <option value="Chicken">🐔 Chicken</option>
              <option value="Duck">🦆 Duck</option>
              <option value="Turkey">🦃 Turkey</option>
              <option value="Quail">🥚 Quail</option>
              <option value="Geese">🪿 Geese</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
            >
              <option value="All">All Stages</option>
              <option value="Adults / Layers / Breeders">Adults / Layers</option>
              <option value="Growers / Pullets">Growers / Pullets</option>
              <option value="Chicks / Ducklings">Chicks / Ducklings</option>
              <option value="Broilers / Table Meat">Broilers / Meat</option>
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Register New Flock / Group
        </button>
      </div>

      {/* Flocks Cards Grid */}
      {filteredFlocks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
          <Layers size={40} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-sm font-bold text-gray-800">No Poultry Flocks Found</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Get started by registering a group of birds (e.g. Duck adults, duck growers, chicks, or a chicken flock).
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
          >
            Register First Flock
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFlocks.map((flk) => {
            const ageText = calculateAge(flk.hatchDate);
            const depletionCount = flk.initialCount - flk.currentCount;
            const speciesEmoji = flk.species === 'Duck' ? '🦆' : flk.species === 'Turkey' ? '🦃' : flk.species === 'Quail' ? '🥚' : '🐔';

            return (
              <div
                key={flk.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Header ribbon */}
                <div className="p-4 border-b border-gray-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 bg-amber-50 rounded-xl border border-amber-100">{speciesEmoji}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-amber-700 transition-colors">
                          {flk.flockName}
                        </h4>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {flk.breed} • <span className="font-mono text-gray-700 font-bold">{ageText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(flk)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit Flock"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove flock "${flk.flockName}"?`)) {
                            onDeleteFlock(flk.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Flock"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      flk.stage.includes('Adults') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      flk.stage.includes('Growers') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      flk.stage.includes('Chicks') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {flk.stage.split('/')[0].trim()}
                    </span>

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                      {flk.stateOfProduction}
                    </span>

                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      flk.status === 'Active' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      ● {flk.status}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                    <div>
                      <div className="text-[10px] text-gray-500 font-semibold uppercase">Current Count</div>
                      <div className="text-base font-bold font-mono text-gray-900">
                        {flk.currentCount} <span className="text-[10px] font-normal text-gray-500">/ {flk.initialCount}</span>
                      </div>
                      {depletionCount > 0 && (
                        <div className="text-[9.5px] text-rose-600 font-medium">-{depletionCount} culled/loss</div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-500 font-semibold uppercase">Housing Pen</div>
                      <div className="text-xs font-semibold text-gray-800 flex items-center gap-1 mt-0.5 truncate" title={flk.housingPen}>
                        <MapPin size={11} className="text-amber-600 shrink-0" />
                        <span className="truncate">{flk.housingPen}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">{flk.source || 'Farm Stock'}</div>
                    </div>
                  </div>

                  {/* Targets & Performance */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {flk.targetLayRatePercent ? (
                      <div>
                        <span className="text-gray-500">Target Lay Rate:</span>
                        <div className="font-bold text-emerald-700 font-mono">{flk.targetLayRatePercent}% Hen-Day</div>
                      </div>
                    ) : null}
                    {flk.targetWeightKg ? (
                      <div>
                        <span className="text-gray-500">Target Bodyweight:</span>
                        <div className="font-bold text-gray-800 font-mono">~{flk.targetWeightKg} KG</div>
                      </div>
                    ) : null}
                  </div>

                  {flk.description && (
                    <p className="text-[11px] text-gray-600 italic bg-amber-50/40 p-2 rounded-lg border border-amber-100/60 line-clamp-2">
                      "{flk.description}"
                    </p>
                  )}
                </div>

                {/* Quick Action Footer */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 w-full">
                    {flk.stateOfProduction === 'Active Egg Laying' && onSelectFlockForEgg && (
                      <button
                        onClick={() => onSelectFlockForEgg(flk)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200 transition-colors"
                        title="Record daily eggs for this flock"
                      >
                        <Egg size={12} /> Log Egg
                      </button>
                    )}
                    {onSelectFlockForHealth && (
                      <button
                        onClick={() => onSelectFlockForHealth(flk)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold border border-blue-200 transition-colors"
                        title="Log health, vaccine, or drug treatment"
                      >
                        <Stethoscope size={12} /> Health
                      </button>
                    )}
                    {onSelectFlockForMortality && (
                      <button
                        onClick={() => onSelectFlockForMortality(flk)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold border border-rose-200 transition-colors"
                        title="Record culling or bird mortality"
                      >
                        <AlertTriangle size={12} /> Cull/Loss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Flock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>🐔</span> {editingFlock ? 'Edit Poultry / Waterfowl Flock' : 'Register New Flock / Group of Birds'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record group metadata, age, housing pen, stocking count, and production state.
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
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Flock / Group Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Pekin Duck Adults, Kenbro Growers Batch 3, Ducklings Unit 2"
                    value={flockName}
                    onChange={(e) => setFlockName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Species *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Chicken">🐔 Chicken / Fowl</option>
                    <option value="Duck">🦆 Duck / Waterfowl</option>
                    <option value="Turkey">🦃 Turkey</option>
                    <option value="Quail">🥚 Quail</option>
                    <option value="Geese">🪿 Geese</option>
                    <option value="Guinea Fowl">🪶 Guinea Fowl</option>
                    <option value="Other">Other Avian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Breed / Lineage *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Kuroiler, ISA Brown, Pekin, Muscovy, Khaki Campbell"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Lifecycle Stage *</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Adults / Layers / Breeders">Adults / Layers / Breeders</option>
                    <option value="Growers / Pullets">Growers / Pullets</option>
                    <option value="Chicks / Ducklings">Chicks / Ducklings</option>
                    <option value="Broilers / Table Meat">Broilers / Table Meat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">State of Production *</label>
                  <select
                    value={stateOfProduction}
                    onChange={(e) => setStateOfProduction(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Active Egg Laying">Active Egg Laying</option>
                    <option value="Point of Lay">Point of Lay (Pre-lay ~16-18 wks)</option>
                    <option value="Brooding / Nursery">Brooding / Nursery Stage</option>
                    <option value="Growing Stage">Growing Stage</option>
                    <option value="Molting">Molting (Feather resting)</option>
                    <option value="Meat Finishing">Meat Finishing</option>
                    <option value="Breeding Pen">Breeding / Hatching Egg Pen</option>
                    <option value="Retired / Spent">Retired / Spent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Hatch Date (Calculates Age) *</label>
                  <input
                    type="date"
                    required
                    value={hatchDate}
                    onChange={(e) => setHatchDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Stock Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={currentCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCurrentCount(val);
                      if (!editingFlock) setInitialCount(val);
                    }}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Housing Pen / Coop Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Main Deep Litter House 1, Pond Yard A"
                    value={housingPen}
                    onChange={(e) => setHousingPen(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Origin / Hatchery Source</label>
                  <input
                    type="text"
                    placeholder="E.g. Kenchic, KALRO, Farm Hatchery"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Lay Rate % (If Layer)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetLayRatePercent}
                    onChange={(e) => setTargetLayRatePercent(parseFloat(e.target.value) || 0)}
                    placeholder="85"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Mature Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                    placeholder="2.2"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Cost Per Chick / Bird (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    value={costPerBird}
                    onChange={(e) => setCostPerBird(parseFloat(e.target.value) || 0)}
                    placeholder="120"
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Flock Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Active">Active Flock</option>
                    <option value="Culled">Fully Culled</option>
                    <option value="Sold">Sold</option>
                    <option value="Depleted">Depleted</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Description & Characteristics</label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Vigorous foragers, high resistance to cold, responsive to whistling."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  {editingFlock ? 'Save Changes' : 'Save Flock Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
