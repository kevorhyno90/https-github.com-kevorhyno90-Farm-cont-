import React, { useState } from 'react';
import { Search, Plus, FileSpreadsheet, Droplets, Trash2, CheckCircle2, GitFork, Activity, PenSquare, Download } from 'lucide-react';
import { Cow, MilkingRecord } from '../../types';

interface CowRegistryProps {
  cows: Cow[];
  milkRecords: MilkingRecord[];
  onAddCow?: (cow: Cow) => void;
  onDeleteCow: (id: string) => void;
  onUpdateCowStatus?: (id: string, status: 'Lactating' | 'Dry' | 'Heifer' | 'In-Calf') => void;
  setEditingCow: (cow: Cow) => void;
  onTriggerSectionReport?: (section: string) => void;
}

export function CowRegistry({ 
  cows, 
  milkRecords,
  onAddCow,
  onDeleteCow,
  onUpdateCowStatus,
  setEditingCow,
  onTriggerSectionReport
}: CowRegistryProps) {

  // Local State
  const [cowSearch, setCowSearch] = useState('');
  const [cowBreedFilter, setCowBreedFilter] = useState('');
  const [cowStatusFilter, setCowStatusFilter] = useState('');
  const [showAddCowForm, setShowAddCowForm] = useState(false);
  const [pedigreeCow, setPedigreeCow] = useState<Cow | null>(null);

  // Derived Values
  const uniqueBreeds = Array.from(new Set(cows.map(c => c.breed).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(cows.map(c => c.status).filter(Boolean)));

  // Helper Functions
  const getAverageYield = (tag: string) => {
    if (!tag) return 0;
    const cowMilks = milkRecords.filter(r => r && r.id && r.id.toLowerCase() === tag.toLowerCase());
    if (cowMilks.length === 0) return 0;
    const totalYield = cowMilks.reduce((sum, record) => sum + (record.am || 0) + (record.pm || 0), 0);
    return totalYield / cowMilks.length;
  };

  const getCowAge = (dobString: string) => {
    const birth = new Date(dobString);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}y ${rem}m` : `${years} years`;
  };

  const downloadBreedersCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'REGISTERED BREEDERS REGISTRY DIRECTORY\n';
    csv += 'Tag ID,Name,Breed,DOB,Sire,Dam,Reg. No,Status,Yield(Avg),Notes\n';
    
    cows.forEach(cow => {
      const avg = getAverageYield(cow.id).toFixed(1);
      csv += `"${cow.id}","${cow.name}","${cow.breed}","${cow.dob}","${cow.sire}","${cow.dam}","${cow.registrationNo}","${cow.status}","${avg}","${cow.notes}"\n`;
    });
    
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_breeders_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Please use the main Dairy Breeding tab to add a cow in this version.");
    setShowAddCowForm(false);
  };

  return (
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
            <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 mb-4"><Plus size={16}/> Add New Cattle to Registry</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Cow Tag ID*</label><input required type="text" className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Name / Nickname</label><input type="text" className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Breed*</label><input required type="text" className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Date of Birth</label><input type="date" className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAddCowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer m-0 border-none">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer m-0 border-none"><CheckCircle2 size={14}/> Save ID Card</button>
            </div>
          </form>
        )}

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(() => {
            const searchLower = cowSearch.toLowerCase();
            const filteredCows = cows.filter(c => {
              const matchesSearch = (c.id?.toLowerCase().includes(searchLower) || c.name?.toLowerCase().includes(searchLower) || c.registrationNo?.toLowerCase().includes(searchLower));
              const matchesBreed = cowBreedFilter ? c.breed === cowBreedFilter : true;
              const matchesStatus = cowStatusFilter ? c.status === cowStatusFilter : true;
              return matchesSearch && matchesBreed && matchesStatus;
            });

            if (filteredCows.length === 0) {
              return (
                <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="text-slate-300" size={24} />
                  </div>
                  <h4 className="text-slate-700 font-black text-sm uppercase mb-1">No Cattle Found</h4>
                  <p className="text-slate-400 text-xs font-bold mb-6 max-w-md">
                    Try adjusting your search criteria, or add a new animal to the directory.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setCowSearch(''); setCowBreedFilter(''); setCowStatusFilter(''); }}
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
                        <button
                          onClick={() => setEditingCow(cow)}
                          className="text-slate-300 hover:text-indigo-805 p-1.5 rounded transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0"
                          title="Edit Cow Details"
                        >
                          <PenSquare size={13} />
                        </button>
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
                      <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                        <span className="text-[9px] uppercase font-black text-slate-400 block">Breed</span>
                        <span className="font-extrabold text-slate-700 truncate block mt-0.5">{cow.breed}</span>
                      </div>
                      <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                        <span className="text-[9px] uppercase font-black text-slate-400 block">Calculated Age</span>
                        <span className="font-extrabold text-slate-700 block mt-0.5">{getCowAge(cow.dob)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Status:</span>
                      <select
                        value={cow.status}
                        onChange={(e) => onUpdateCowStatus && onUpdateCowStatus(cow.id, e.target.value as any)}
                        className="text-[10px] font-black uppercase text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-250 cursor-pointer focus:outline-none"
                      >
                        <option value="Lactating">Lactating</option>
                        <option value="Dry">Dry</option>
                        <option value="Heifer">Heifer</option>
                        <option value="In-Calf">In-Calf</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-3 space-y-2">
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
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px] leading-tight">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Sire:</span>
                        <span className="font-extrabold text-slate-800 truncate max-w-[150px]">{cow.sire || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Dam:</span>
                        <span className="font-extrabold text-slate-800 truncate max-w-[150px]">{cow.dam || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-3 space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 font-bold flex items-center gap-1">
                      <Activity size={11} className="text-emerald-700" /> Lactation Yield Metric
                    </span>
                    <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="text-xs text-slate-500 font-bold">Log average per day:</span>
                      <span className="text-xs font-black font-mono text-emerald-850">
                        {avgYield > 0 ? `${avgYield.toFixed(1)} Liters` : 'No logs'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50">
                    <button
                      onClick={() => setPedigreeCow(cow)}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer m-0"
                    >
                      View Pedigree Family Tree
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {pedigreeCow && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="font-black text-lg text-slate-800 mb-4">{pedigreeCow.name} Pedigree</h3>
            <p className="text-xs text-slate-500 mb-6 font-bold">Pedigree view is in development.</p>
            <button onClick={() => setPedigreeCow(null)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-black uppercase text-xs">Close</button>
          </div>
        </div>
      )}
    </>
  );
}
