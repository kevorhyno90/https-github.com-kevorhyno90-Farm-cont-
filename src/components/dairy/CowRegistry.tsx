import React, { useState } from 'react';
import { Search, Plus, FileSpreadsheet, Droplets, Trash2, CheckCircle2, GitFork, Activity, PenSquare, Download } from 'lucide-react';
import { Cow, MilkingRecord } from '../../types';
import { exportToCsv } from '../../utils/csvHelper';

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
  cows = [], 
  milkRecords = [],
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
  const [isDownloadingPedigree, setIsDownloadingPedigree] = useState(false);

  const [newCow, setNewCow] = useState<Partial<Cow>>({ status: 'Heifer' });

  // Derived Values
  const uniqueBreeds = Array.from(new Set(cows.map(c => c.breed).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(cows.map(c => c.status).filter(Boolean)));

  // Helper Functions
  const downloadPedigreeImage = async () => {
    if (!pedigreeCow) return;
    setIsDownloadingPedigree(true);
    try {
      if (!(window as any).html2canvas) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.async = false;
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      
      const element = document.getElementById('pedigree-tree-container');
      if (element) {
        const canvas = await (window as any).html2canvas(element, { 
          backgroundColor: '#f8fafc',
          scale: 2 
        });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `JR_Farm_${pedigreeCow.name}_Pedigree.png`;
        link.click();
      }
    } catch (err) {
      console.error("Failed to download pedigree", err);
    } finally {
      setIsDownloadingPedigree(false);
    }
  };

  const getAverageYield = (tag: string) => {
    if (!tag) return 0;
    const cowMilks = milkRecords.filter(r => r && r.id && r.id.toLowerCase() === tag.toLowerCase());
    if (cowMilks.length === 0) return 0;
    const totalYield = cowMilks.reduce((sum, record) => sum + (record.am || 0) + (record.pm || 0), 0);
    return totalYield / cowMilks.length;
  };

  const getCowAge = (dobString: string) => {
    if (!dobString) return 'Unknown';
    const birth = new Date(dobString);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}y ${rem}m` : `${years} years`;
  };

  const downloadBreedersCSV = () => {
    const headers = ['Tag ID', 'Name', 'Breed', 'DOB', 'Sire', 'Dam', 'Reg. No', 'Status', 'Avg Yield (L)', 'Notes'];
    const rows = cows.map(cow => [
      cow.id,
      cow.name,
      cow.breed,
      cow.dob,
      cow.sire || '',
      cow.dam || '',
      cow.registrationNo || '',
      cow.status,
      getAverageYield(cow.id).toFixed(1),
      cow.notes || ''
    ]);
    exportToCsv(`Cattle_Registry_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleCowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddCow && newCow.id && newCow.breed) {
      onAddCow(newCow as Cow);
      setShowAddCowForm(false);
      setNewCow({ status: 'Heifer' });
    }
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
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Cow Tag ID*</label><input required type="text" value={newCow.id || ''} onChange={e => setNewCow({...newCow, id: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Name / Nickname</label><input type="text" value={newCow.name || ''} onChange={e => setNewCow({...newCow, name: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Breed*</label><input required type="text" value={newCow.breed || ''} onChange={e => setNewCow({...newCow, breed: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Date of Birth</label><input type="date" value={newCow.dob || ''} onChange={e => setNewCow({...newCow, dob: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" /></div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Current Status*</label>
                <select required value={newCow.status || 'Heifer'} onChange={e => setNewCow({...newCow, status: e.target.value as any})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold bg-white">
                  <option value="Lactating">Lactating</option>
                  <option value="Dry">Dry</option>
                  <option value="Heifer">Heifer</option>
                  <option value="In-Calf">In-Calf</option>
                </select>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Registration No.</label><input type="text" value={newCow.registrationNo || ''} onChange={e => setNewCow({...newCow, registrationNo: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" placeholder="Optional" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Sire (Father)</label><input type="text" value={newCow.sire || ''} onChange={e => setNewCow({...newCow, sire: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" placeholder="Unknown" /></div>
              <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Dam (Mother)</label><input type="text" value={newCow.dam || ''} onChange={e => setNewCow({...newCow, dam: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" placeholder="Unknown" /></div>
              <div className="md:col-span-4"><label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Additional Notes</label><textarea value={newCow.notes || ''} onChange={e => setNewCow({...newCow, notes: e.target.value})} rows={2} className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold resize-none" placeholder="Enter any identifying marks, conditions, or history..."></textarea></div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-4xl animate-fadeIn m-auto mt-10 mb-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-2xl text-slate-800 flex items-center gap-2">
                  <GitFork className="text-emerald-600" />
                  {pedigreeCow.name} ({pedigreeCow.id})
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pedigree Lineage Tree</p>
              </div>
              <button onClick={() => setPedigreeCow(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors m-0 border-0 cursor-pointer">
                ✕
              </button>
            </div>

            <div id="pedigree-tree-container" className="relative border border-slate-100 rounded-3xl bg-slate-50 p-6 md:p-12 overflow-x-auto">
              <div className="min-w-[600px] flex items-center justify-center">
                {/* Grandparents Column */}
                <div className="flex flex-col gap-12 w-48 shrink-0">
                  {/* Paternal Grandparents */}
                  <div className="flex flex-col gap-4 relative">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm relative z-10">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Paternal Grand-Sire</span>
                      <span className="font-bold text-slate-700 text-xs">{pedigreeCow.grandSirePaternal || 'Unknown'}</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm relative z-10">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Paternal Grand-Dam</span>
                      <span className="font-bold text-slate-700 text-xs">{pedigreeCow.grandDamPaternal || 'Unknown'}</span>
                    </div>
                    {/* Connecting lines to Sire */}
                    <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 border-r-2 border-y-2 border-slate-200 rounded-r-lg z-0" style={{ height: 'calc(100% - 3rem)' }}></div>
                  </div>

                  {/* Maternal Grandparents */}
                  <div className="flex flex-col gap-4 relative">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm relative z-10">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Maternal Grand-Sire</span>
                      <span className="font-bold text-slate-700 text-xs">{pedigreeCow.grandSireMaternal || 'Unknown'}</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm relative z-10">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Maternal Grand-Dam</span>
                      <span className="font-bold text-slate-700 text-xs">{pedigreeCow.grandDamMaternal || 'Unknown'}</span>
                    </div>
                    {/* Connecting lines to Dam */}
                    <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 border-r-2 border-y-2 border-slate-200 rounded-r-lg z-0" style={{ height: 'calc(100% - 3rem)' }}></div>
                  </div>
                </div>

                {/* Parents Column */}
                <div className="flex flex-col justify-around h-full w-48 shrink-0 ml-12 relative py-8">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm relative z-10 mb-16">
                    <span className="text-[10px] uppercase font-black text-blue-500 block">Sire (Father)</span>
                    <span className="font-black text-blue-900 text-sm">{pedigreeCow.sire || 'Unknown'}</span>
                    <div className="absolute left-[-48px] top-1/2 w-12 h-0.5 bg-slate-200 z-0"></div>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 p-4 rounded-xl shadow-sm relative z-10 mt-16">
                    <span className="text-[10px] uppercase font-black text-pink-500 block">Dam (Mother)</span>
                    <span className="font-black text-pink-900 text-sm">{pedigreeCow.dam || 'Unknown'}</span>
                    <div className="absolute left-[-48px] top-1/2 w-12 h-0.5 bg-slate-200 z-0"></div>
                  </div>
                  {/* Connecting lines to self */}
                  <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 border-r-2 border-y-2 border-slate-300 rounded-r-lg z-0" style={{ height: 'calc(100% - 10rem)' }}></div>
                </div>

                {/* Target Cow (Self) */}
                <div className="w-56 shrink-0 ml-12 relative">
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-2xl shadow-lg relative z-10">
                    <span className="text-[10px] uppercase font-black text-emerald-600 block">Target Animal</span>
                    <span className="font-black text-emerald-950 text-lg block">{pedigreeCow.name}</span>
                    <span className="font-bold text-emerald-700 text-xs block font-mono">{pedigreeCow.id}</span>
                    <span className="mt-2 block text-[10px] bg-emerald-200 text-emerald-900 px-2 py-1 rounded font-bold w-max uppercase tracking-wider">{pedigreeCow.breed}</span>
                    <div className="absolute left-[-48px] top-1/2 w-12 h-0.5 bg-slate-300 z-0"></div>
                  </div>
                </div>

              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={downloadPedigreeImage} 
                disabled={isDownloadingPedigree}
                className="px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-200 rounded-xl font-black uppercase text-xs transition-colors cursor-pointer m-0 flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={14} /> 
                {isDownloadingPedigree ? 'Generating Image...' : 'Save as Image'}
              </button>
              <button onClick={() => setPedigreeCow(null)} className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-xs transition-colors cursor-pointer m-0 border-0">
                Close Pedigree View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
