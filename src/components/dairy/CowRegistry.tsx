import React from 'react';
import { Search, Plus, FileSpreadsheet, Droplets, Trash2, CheckCircle2 } from 'lucide-react';
import { CowRecord, MilkingRecord } from '../../types';

interface CowRegistryProps {
  cows: CowRecord[];
  cowSearch: string;
  setCowSearch: (val: string) => void;
  onTriggerSectionReport?: (section: string) => void;
  setEditingCow: (cow: CowRecord) => void;
  onDeleteCow: (id: string) => void;
  milkRecords: MilkingRecord[];
}

export function CowRegistry({ 
  cows, 
  cowSearch, 
  setCowSearch, 
  onTriggerSectionReport, 
  setEditingCow, 
  onDeleteCow,
  milkRecords 
}: CowRegistryProps) {
  return (
{/* SUB-TAB 2: COW IDENTITY DIRECTORY */}
      <>
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search Cow tag ID or name..."
                  value={cowSearch}
                  onChange={(e) => setCowSearch(e.target.value)}
                  className="text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl w-full font-bold focus:outline-none bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* Filter by Breed */}
              <div className="w-full sm:w-44">
                <select
                  value={cowBreedFilter}
                  onChange={(e) => setCowBreedFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
                >
                  <option value="">All Breeds</option>
                  {uniqueBreeds.map((breed) => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Breeding Status */}
              <div className="w-full sm:w-44">
                <select
                  value={cowStatusFilter}
                  onChange={(e) => setCowStatusFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
                >
                  <option value="">All Breeding Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
              <button
                onClick={downloadBreedersCSV}
                type="button"
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-950 hover:bg-indigo-100 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                title="Download Cow Directory CSV"
              >
                <FileSpreadsheet size={13} />
                Export Breeders
              </button>
              {onTriggerSectionReport && (
                <button
                  onClick={() => onTriggerSectionReport('cows')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                  title="Download Cattle Breeders PDF Report"
                >
                  <Download size={13} />
                  Breeders PDF Report
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {cows.length === 0 ? (
              <div className="col-span-1 md:col-span-3 text-center py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-4">
                <div className="text-slate-400 font-bold text-base uppercase tracking-wider">No Registered Cattle Found</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  The Cattle Identity Directory is currently empty. Register a new cow tag using the <strong className="text-emerald-950 font-black">"Add Cow ID Card"</strong> button above, or quickly populate the registry with premium demo dairy herd data.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const demoCows: Cow[] = [
                      { 
                        id: 'Cow-101 (Daisy)', 
                        name: 'Daisy', 
                        breed: 'Holstein-Friesian', 
                        dob: '2021-04-12', 
                        status: 'Dry', 
                        notes: 'High lactation index mother.',
                        sire: 'Supreme Champion Bull (SH-404)',
                        dam: 'Daisy Mother Superior (DM-09)',
                        grandSirePaternal: 'Friesian King (FK-99)',
                        grandDamPaternal: 'Meadow Queen (MQ-12)',
                        grandSireMaternal: 'Dairy Lord (DL-88)',
                        grandDamMaternal: 'Super Milkmaid (SM-05)',
                        registrationNo: 'KAG-HF-2021-9302'
                      },
                      { 
                        id: 'Cow-102 (Goldie)', 
                        name: 'Goldie', 
                        breed: 'Guernsey', 
                        dob: '2020-08-30', 
                        status: 'Lactating', 
                        notes: 'Solid prime butterfat producer.',
                        sire: 'Giltspur Goldmine (GG-102)',
                        dam: 'Sunset Buttercup (SB-55)',
                        grandSirePaternal: 'Guernsey Duke (GD-401)',
                        grandDamPaternal: 'Giltspur Belle (GB-88)',
                        grandSireMaternal: 'Sovereign Prince (SP-99)',
                        grandDamMaternal: 'Sunset Gold (SG-12)',
                        registrationNo: 'KAG-G-2020-4381'
                      },
                      { 
                        id: 'Cow-103 (Ruby)', 
                        name: 'Ruby', 
                        breed: 'Jersey', 
                        dob: '2022-01-15', 
                        status: 'Lactating', 
                        notes: 'High yield milk solids champion.',
                        sire: 'Jersey Lad (JL-401)',
                        dam: 'Ruby Rose (RR-02)',
                        grandSirePaternal: 'Jersey King (JK-99)',
                        grandDamPaternal: 'Golden Maid (GM-11)',
                        grandSireMaternal: 'Prince Charming (PC-202)',
                        grandDamMaternal: 'Rosebud (RB-10)',
                        registrationNo: 'KAG-J-2022-1104'
                      }
                    ];
                    demoCows.forEach(c => onAddCow(c));
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-black uppercase rounded-xl transition-all shadow-md cursor-pointer border-none"
                >
                  🌱 Seed Premium Demo Cows
                </button>
              </div>
            ) : (
              (() => {
                const filteredCows = cows.filter(c => {
                  const matchesSearch = c.id.toLowerCase().includes(cowSearch.toLowerCase()) || c.name.toLowerCase().includes(cowSearch.toLowerCase());
                  const matchesBreed = !cowBreedFilter || c.breed === cowBreedFilter;
                  const matchesStatus = !cowStatusFilter || c.status === cowStatusFilter;
                  return matchesSearch && matchesBreed && matchesStatus;
                });

                if (filteredCows.length === 0) {
                  return (
                    <div className="col-span-1 md:col-span-3 text-center py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-3">
                      <div className="text-slate-400 font-bold text-base uppercase tracking-wider">No Matching Cattle Found</div>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        No registered cattle match your search query, breed, or status filters. Try adjusting your filter settings or clear all filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCowSearch('');
                          setCowBreedFilter('');
                          setCowStatusFilter('');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-850 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer border-none"
                      >
                        Clear Filters
                      </button>
                    </div>
                  );
                }

                return filteredCows.map(cow => {
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
                        <div className="bg-slate-55 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px] leading-tight">
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
                });
              })()
            </>
          </div>
        </div>
      
  );
}
