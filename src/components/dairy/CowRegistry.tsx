import React, { useState } from 'react';
import {
  Search, Plus, FileSpreadsheet, Droplets, Trash2, CheckCircle2,
  GitFork, Activity, PenSquare, Download, LayoutList, LayoutGrid,
  MapPin, MessageSquare, Dna, Info, X
} from 'lucide-react';
import { Cow, MilkingRecord } from '../../types';
import { exportToCsv } from '../../utils/csvHelper';

interface CowRegistryProps {
  cows: Cow[];
  milkRecords: MilkingRecord[];
  onAddCow?: (cow: Cow) => void;
  onDeleteCow: (id: string) => void;
  onUpdateCowStatus?: (id: string, status: Cow['status']) => void;
  onEditCow?: (id: string, updated: Cow) => void;
  onTriggerSectionReport?: (section: string) => void;
}

export function CowRegistry({ 
  cows = [], 
  milkRecords = [],
  onAddCow,
  onDeleteCow,
  onUpdateCowStatus,
  onEditCow,
  onTriggerSectionReport
}: CowRegistryProps) {

  // Local State
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [cowSearch, setCowSearch] = useState('');
  const [cowBreedFilter, setCowBreedFilter] = useState('');
  const [cowStatusFilter, setCowStatusFilter] = useState('');
  const [cowGenderFilter, setCowGenderFilter] = useState('');
  const [cowLocalityFilter, setCowLocalityFilter] = useState('');
  const [showAddCowForm, setShowAddCowForm] = useState(false);
  const [pedigreeCow, setPedigreeCow] = useState<Cow | null>(null);
  const [isDownloadingPedigree, setIsDownloadingPedigree] = useState(false);
  const [selectedRemarkCow, setSelectedRemarkCow] = useState<Cow | null>(null);

  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [newCow, setNewCow] = useState<Partial<Cow>>({ status: 'Heifer', gender: 'Female', locality: '' });

  // Derived Values
  const uniqueBreeds = Array.from(new Set(cows.map(c => c.breed).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(cows.map(c => c.status).filter(Boolean)));
  const uniqueLocalities = Array.from(new Set(cows.map(c => c.locality).filter(Boolean))) as string[];

  // Helper Functions
  const downloadPedigreeImage = async () => {
    if (!pedigreeCow) return;
    setIsDownloadingPedigree(true);
    
    // Yield to the main thread so the UI can paint the "Generating Image..." loading state 
    // before html2canvas synchronously blocks the thread.
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      if (!(window as any).htmlToImage) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
        script.async = false;
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      
      const element = document.getElementById('pedigree-tree-container');
      if (element) {
        const imgData = await (window as any).htmlToImage.toPng(element, { 
          backgroundColor: '#f8fafc',
          pixelRatio: 2 
        });
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
    const headers = [
      'Tag ID', 'Name', 'Breed', 'Gender', 'Locality / Pen', 
      'DOB', 'Age', 'Status', 'Sire (Father)', 'Dam (Mother)', 
      'Reg. No', 'Avg Yield (L/d)', 'Remarks / Notes'
    ];
    const rows = cows.map(cow => [
      cow.id,
      cow.name,
      cow.breed,
      cow.gender || 'Female',
      cow.locality || 'Unassigned',
      cow.dob,
      getCowAge(cow.dob),
      cow.status,
      cow.sire || '',
      cow.dam || '',
      cow.registrationNo || '',
      getAverageYield(cow.id).toFixed(1),
      cow.notes || ''
    ]);
    exportToCsv(`Cattle_Registry_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleCowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddCow && newCow.id && newCow.breed) {
      onAddCow({
        ...newCow,
        gender: newCow.gender || 'Female',
        status: newCow.status || 'Heifer',
        locality: newCow.locality?.trim() || 'General Barn',
        notes: newCow.notes || ''
      } as Cow);
      setShowAddCowForm(false);
      setNewCow({ status: 'Heifer', gender: 'Female', locality: '' });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search Tag, Name, Locality, Sire, Dam..."
                value={cowSearch}
                onChange={(e) => setCowSearch(e.target.value)}
                className="text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl w-full font-bold focus:outline-none bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="w-full sm:w-36">
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

            <div className="w-full sm:w-40">
              <select
                value={cowStatusFilter}
                onChange={(e) => setCowStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-32">
              <select
                value={cowGenderFilter}
                onChange={(e) => setCowGenderFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="">All Sexes</option>
                <option value="Female">Female ♀</option>
                <option value="Male">Male ♂</option>
              </select>
            </div>

            <div className="w-full sm:w-44">
              <select
                value={cowLocalityFilter}
                onChange={(e) => setCowLocalityFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-3 w-full font-bold text-slate-600 bg-white focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="">All Localities / Pens</option>
                {uniqueLocalities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
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
                title="Compact Table List View"
              >
                <LayoutList size={13} />
                List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid size={13} />
                Cards
              </button>
            </div>

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
              className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-900 flex items-center justify-center gap-1.5 m-0 shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Add Cow ID Card
            </button>
          </div>
        </div>

        {showAddCowForm && (
          <form onSubmit={handleCowSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                <Plus size={16} className="text-emerald-600"/> Add New Cattle to Registry
              </h4>
              <span className="text-[11px] font-bold text-slate-400">Complete identification, housing & lineage ledger</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Cow Tag ID*</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Cow-107" 
                  value={newCow.id || ''} 
                  onChange={e => setNewCow({...newCow, id: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold font-mono focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Cow Friendly Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bella" 
                  value={newCow.name || ''} 
                  onChange={e => setNewCow({...newCow, name: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Breed Class*</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Holstein-Friesian" 
                  value={newCow.breed || ''} 
                  onChange={e => setNewCow({...newCow, breed: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Gender / Sex*</label>
                <select 
                  required 
                  value={newCow.gender || 'Female'} 
                  onChange={e => setNewCow({...newCow, gender: e.target.value as any})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Female">Female ♀</option>
                  <option value="Male">Male ♂</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={newCow.dob || ''} 
                  onChange={e => setNewCow({...newCow, dob: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold font-mono focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Breeding Status*</label>
                <select 
                  required 
                  value={newCow.status || 'Heifer'} 
                  onChange={e => setNewCow({...newCow, status: e.target.value as any})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Lactating">Lactating</option>
                  <option value="Dry">Dry</option>
                  <option value="Heifer">Heifer</option>
                  <option value="In-Calf">In-Calf</option>
                  <option value="Bull">Bull (Breeding Male)</option>
                  <option value="Steer">Steer (Castrated)</option>
                  <option value="Calf">Young Calf</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin size={10} className="text-emerald-600" /> Locality / Housing Pen*
                </label>
                <input
                  list="cow-localities-list"
                  type="text"
                  placeholder="e.g. Barn A, Milking Shed 1"
                  value={newCow.locality || ''}
                  onChange={e => setNewCow({...newCow, locality: e.target.value})}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold focus:border-emerald-500 focus:outline-none"
                />
                <datalist id="cow-localities-list">
                  <option value="Barn A - Stall 01" />
                  <option value="Barn A - Stall 02" />
                  <option value="Milking Shed 1" />
                  <option value="Milking Shed 2" />
                  <option value="Heifer Pen 3" />
                  <option value="Maternity Paddock" />
                  <option value="Calf Pen" />
                  <option value="Bull Pen 1" />
                  <option value="Isolation / Vet Stall" />
                  {uniqueLocalities.map(loc => <option key={loc} value={loc} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Registration / Studbook #</label>
                <input 
                  type="text" 
                  value={newCow.registrationNo || ''} 
                  onChange={e => setNewCow({...newCow, registrationNo: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold font-mono focus:border-emerald-500 focus:outline-none" 
                  placeholder="e.g. KAG-HF-2024-001" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Dna size={10} className="text-blue-600" /> Sire (Father / AI Straw)
                </label>
                <input 
                  type="text" 
                  value={newCow.sire || ''} 
                  onChange={e => setNewCow({...newCow, sire: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold focus:border-emerald-500 focus:outline-none" 
                  placeholder="e.g. Supreme Champion (SH-404)" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Dna size={10} className="text-pink-600" /> Dam (Mother / Dam Tag)
                </label>
                <input 
                  type="text" 
                  value={newCow.dam || ''} 
                  onChange={e => setNewCow({...newCow, dam: e.target.value})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold focus:border-emerald-500 focus:outline-none" 
                  placeholder="e.g. Daisy Mother (DM-09)" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Activity size={10} className="text-emerald-600" /> Target Yield (L/d)
                </label>
                <input 
                  type="number" 
                  value={newCow.peakYieldTarget || ''} 
                  onChange={e => setNewCow({...newCow, peakYieldTarget: e.target.value ? Number(e.target.value) : undefined})} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-bold font-mono focus:border-emerald-500 focus:outline-none" 
                  placeholder="e.g. 30" 
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-6">
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <MessageSquare size={10} className="text-slate-600" /> Remarks / Observations / Health History / Distinguishing Marks
                </label>
                <textarea 
                  value={newCow.notes || ''} 
                  onChange={e => setNewCow({...newCow, notes: e.target.value})} 
                  rows={2} 
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-medium resize-none focus:border-emerald-500 focus:outline-none" 
                  placeholder="Enter remarks, body markings, dehorning, temperament, vaccination history, or special handling notes..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowAddCowForm(false)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer m-0 border-none"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer m-0 border-none"
              >
                <CheckCircle2 size={14}/> Save Cattle Record
              </button>
            </div>
          </form>
        )}

        {/* Directory View (Table or Cards) */}
        {(() => {
          const searchLower = cowSearch.toLowerCase();
          const filteredCows = cows.filter(c => {
            const matchesSearch = (
              c.id?.toLowerCase().includes(searchLower) || 
              c.name?.toLowerCase().includes(searchLower) || 
              c.registrationNo?.toLowerCase().includes(searchLower) ||
              c.locality?.toLowerCase().includes(searchLower) ||
              c.sire?.toLowerCase().includes(searchLower) ||
              c.dam?.toLowerCase().includes(searchLower) ||
              c.notes?.toLowerCase().includes(searchLower)
            );
            const matchesBreed = cowBreedFilter ? c.breed === cowBreedFilter : true;
            const matchesStatus = cowStatusFilter ? c.status === cowStatusFilter : true;
            const matchesGender = cowGenderFilter ? (c.gender || 'Female') === cowGenderFilter : true;
            const matchesLocality = cowLocalityFilter ? c.locality === cowLocalityFilter : true;
            return matchesSearch && matchesBreed && matchesStatus && matchesGender && matchesLocality;
          });

          if (filteredCows.length === 0) {
            return (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-slate-300" size={24} />
                </div>
                <h4 className="text-slate-700 font-black text-sm uppercase mb-1">No Cattle Found</h4>
                <p className="text-slate-400 text-xs font-bold mb-6 max-w-md">
                  Try adjusting your search criteria, or add a new animal to the directory.
                </p>
                <button
                  type="button"
                  onClick={() => { 
                    setCowSearch(''); 
                    setCowBreedFilter(''); 
                    setCowStatusFilter(''); 
                    setCowGenderFilter(''); 
                    setCowLocalityFilter(''); 
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-850 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer border-none"
                >
                  Clear Filters
                </button>
              </div>
            );
          }

          if (viewMode === 'table') {
            return (
              <div className="bg-white border border-gray-200 rounded-3xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="py-3.5 px-4">Tag ID & Name</th>
                        <th className="py-3.5 px-4">Breed & Sex</th>
                        <th className="py-3.5 px-4">Locality / Pen</th>
                        <th className="py-3.5 px-4">Age / DOB</th>
                        <th className="py-3.5 px-4">Milking Status</th>
                        <th className="py-3.5 px-4">Lineage (Sire / Dam)</th>
                        <th className="py-3.5 px-4 text-center">Avg Yield</th>
                        <th className="py-3.5 px-4">Remarks & Notes</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCows.map(cow => {
                        const avgYield = getAverageYield(cow.id);
                        return (
                          <tr key={cow.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-black font-mono text-slate-900 text-xs block">{cow.id}</span>
                                {cow.registrationNo && (
                                  <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                    {cow.registrationNo}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 block mt-0.5">{cow.name || 'Unnamed'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-slate-800 block">{cow.breed}</span>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                cow.gender === 'Male' 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                  : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}>
                                {cow.gender === 'Male' ? '♂ Male' : '♀ Female'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-lg">
                                <MapPin size={11} className="text-emerald-600 shrink-0" />
                                {cow.locality || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-slate-700 block">{getCowAge(cow.dob)}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">{cow.dob || '—'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={cow.status}
                                onChange={(e) => onUpdateCowStatus && onUpdateCowStatus(cow.id, e.target.value as any)}
                                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
                                  cow.status === 'Lactating'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : cow.status === 'In-Calf'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                    : cow.status === 'Dry'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : cow.status === 'Heifer'
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : cow.status === 'Bull'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-slate-50 text-slate-800 border-slate-300'
                                }`}
                              >
                                <option value="Lactating">Lactating</option>
                                <option value="Dry">Dry</option>
                                <option value="Heifer">Heifer</option>
                                <option value="In-Calf">In-Calf</option>
                                <option value="Bull">Bull</option>
                                <option value="Steer">Steer</option>
                                <option value="Calf">Calf</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Sire:</span>
                                  <span className="font-bold text-slate-700 truncate max-w-[130px]">{cow.sire || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Dam:</span>
                                  <span className="font-bold text-slate-700 truncate max-w-[130px]">{cow.dam || '—'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {avgYield > 0 ? (
                                <span className="font-black font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1">
                                  <Droplets size={12} className="text-emerald-600" />
                                  {avgYield.toFixed(1)} L/d
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic font-mono">—</span>
                              )}
                              {cow.peakYieldTarget && (
                                <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Target: {cow.peakYieldTarget}L</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 max-w-[200px]">
                              {cow.notes ? (
                                <div className="flex items-center justify-between gap-1.5 group bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-150 transition-colors">
                                  <span className="text-[11px] text-slate-700 truncate block font-medium" title={cow.notes}>
                                    {cow.notes}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRemarkCow(cow)}
                                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors shrink-0"
                                    title="View full remarks & history"
                                  >
                                    <MessageSquare size={12} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-300 italic">No remarks</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setPedigreeCow(cow)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                                  title="View Pedigree Family Tree"
                                >
                                  <GitFork size={13} />
                                </button>
                                <button
                                  onClick={() => setEditingCow(cow)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Cow Details"
                                >
                                  <PenSquare size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove cattle ${cow.id} (${cow.name}) from registry?`)) {
                                      onDeleteCow(cow.id);
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Cow Record"
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
                  <span>Showing <strong className="text-slate-800 font-mono">{filteredCows.length}</strong> cattle ({filteredCows.filter(c => c.status === 'Lactating').length} lactating, {filteredCows.filter(c => c.status === 'In-Calf').length} in-calf, {filteredCows.filter(c => c.status === 'Heifer').length} heifers)</span>
                  <span className="text-[11px] text-slate-400">Click <strong>Pedigree</strong> icon to view 3-generation ancestry chart</span>
                </div>
              </div>
            );
          }

          // Card Grid View
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCows.map(cow => {
                const avgYield = getAverageYield(cow.id);
                return (
                  <div key={cow.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-200 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-black text-slate-800 text-[13.5px] uppercase block tracking-wider font-mono">{cow.id}</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-1 block">Name: <span className="text-slate-700 font-extrabold">{cow.name || 'Unnamed'}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCow(cow)}
                            className="text-slate-300 hover:text-indigo-805 p-1.5 rounded transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0 cursor-pointer"
                            title="Edit Cow Details"
                          >
                            <PenSquare size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove cattle ${cow.id} (${cow.name})?`)) {
                                onDeleteCow(cow.id);
                              }
                            }}
                            className="text-slate-300 hover:text-red-600 p-1.5 rounded transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50 m-0 cursor-pointer"
                            title="Delete Cow Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Metric Badges Grid: Breed, Gender, Locality, Age */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
                        <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Breed</span>
                          <span className="font-extrabold text-slate-700 truncate block mt-0.5">{cow.breed}</span>
                        </div>
                        <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Gender</span>
                          <span className={`font-extrabold block mt-0.5 ${cow.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'}`}>
                            {cow.gender === 'Male' ? '♂ Male' : '♀ Female'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                          <span className="text-[9px] uppercase font-black text-slate-400 block flex items-center gap-0.5">
                            <MapPin size={9} className="text-emerald-600" /> Locality
                          </span>
                          <span className="font-extrabold text-slate-700 truncate block mt-0.5" title={cow.locality || 'Unassigned'}>
                            {cow.locality || 'General'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Age</span>
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
                          <option value="Bull">Bull</option>
                          <option value="Steer">Steer</option>
                          <option value="Calf">Calf</option>
                        </select>
                      </div>
                    </div>

                    {/* Lineage Section: Sire & Dam */}
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
                          <span className="text-slate-400 font-semibold">Sire (Father):</span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[150px]">{cow.sire || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Dam (Mother):</span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[150px]">{cow.dam || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remarks Section */}
                    {cow.notes && (
                      <div className="border-t border-slate-100 mt-3 pt-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                            <MessageSquare size={11} className="text-slate-500" /> Remarks & History
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRemarkCow(cow)}
                            className="text-[10px] text-emerald-700 hover:underline font-bold"
                          >
                            Expand
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-medium leading-relaxed line-clamp-2">
                          {cow.notes}
                        </p>
                      </div>
                    )}

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
              })}
            </div>
          );
        })()}
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
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[9px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{pedigreeCow.breed}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        pedigreeCow.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {pedigreeCow.gender === 'Male' ? '♂ Male' : '♀ Female'}
                      </span>
                    </div>
                    {pedigreeCow.locality && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-white/70 px-2 py-1 rounded border border-emerald-200">
                        <MapPin size={10} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{pedigreeCow.locality}</span>
                      </div>
                    )}
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

      {/* Edit Cow Registry Modal */}
      {editingCow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PenSquare size={16} className="text-emerald-600" />
                  Edit Cattle Record & Pedigree
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  Update identity, housing locality, lineage & health remarks
                </p>
              </div>
              <button 
                onClick={() => setEditingCow(null)} 
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors m-0 border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Cow Ear Tag ID (Locked)</label>
                  <input
                    type="text"
                    value={editingCow.id}
                    disabled
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-black bg-slate-50 text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Cow Friendly Name</label>
                  <input
                    type="text"
                    value={editingCow.name}
                    onChange={(e) => setEditingCow({ ...editingCow, name: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Breed Class</label>
                  <input
                    type="text"
                    value={editingCow.breed}
                    onChange={(e) => setEditingCow({ ...editingCow, breed: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Gender / Sex</label>
                  <select
                    value={editingCow.gender || 'Female'}
                    onChange={(e) => setEditingCow({ ...editingCow, gender: e.target.value as any })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Female">Female ♀</option>
                    <option value="Male">Male ♂</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingCow.dob}
                    onChange={(e) => setEditingCow({ ...editingCow, dob: e.target.value })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Production / Life Status</label>
                  <select
                    value={editingCow.status}
                    onChange={(e) => setEditingCow({ ...editingCow, status: e.target.value as any })}
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Lactating">Lactating</option>
                    <option value="Dry">Dry Rest</option>
                    <option value="Heifer">Heifer</option>
                    <option value="In-Calf">In-Calf</option>
                    <option value="Bull">Bull (Breeding Male)</option>
                    <option value="Steer">Steer (Castrated)</option>
                    <option value="Calf">Young Calf</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 flex items-center gap-1">
                    <MapPin size={10} className="text-emerald-600" /> Locality / Housing Pen
                  </label>
                  <input
                    list="edit-cow-localities"
                    type="text"
                    value={editingCow.locality || ''}
                    onChange={(e) => setEditingCow({ ...editingCow, locality: e.target.value })}
                    placeholder="e.g. Barn A, Milking Shed 1"
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <datalist id="edit-cow-localities">
                    <option value="Barn A - Stall 01" />
                    <option value="Barn A - Stall 02" />
                    <option value="Milking Shed 1" />
                    <option value="Milking Shed 2" />
                    <option value="Heifer Pen 3" />
                    <option value="Maternity Paddock" />
                    <option value="Calf Pen" />
                    <option value="Bull Pen 1" />
                    <option value="Isolation / Vet Stall" />
                    {uniqueLocalities.map(loc => <option key={loc} value={loc} />)}
                  </datalist>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Studbook Reg # (Optional)</label>
                  <input
                    type="text"
                    value={editingCow.registrationNo || ''}
                    onChange={(e) => setEditingCow({ ...editingCow, registrationNo: e.target.value })}
                    placeholder="E.g. KAG-HF-YYYY-1120"
                    className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Peak Yield Target (L/day)</label>
                <input
                  type="number"
                  value={editingCow.peakYieldTarget || ''}
                  onChange={(e) => setEditingCow({ ...editingCow, peakYieldTarget: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="E.g. 30"
                  className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold font-mono sm:w-48 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Pedigree section border divider */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Dna size={12} className="text-emerald-600" /> Pedigree & Lineage Records
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-blue-600 block mb-1">Sire (Father / AI Code)</label>
                    <input
                      type="text"
                      value={editingCow.sire || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, sire: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-pink-600 block mb-1">Dam (Mother / Dam Tag)</label>
                    <input
                      type="text"
                      value={editingCow.dam || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, dam: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Paternal Grand Sire</label>
                    <input
                      type="text"
                      value={editingCow.grandSirePaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandSirePaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Paternal Grand Dam</label>
                    <input
                      type="text"
                      value={editingCow.grandDamPaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandDamPaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Maternal Grand Sire</label>
                    <input
                      type="text"
                      value={editingCow.grandSireMaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandSireMaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Maternal Grand Dam</label>
                    <input
                      type="text"
                      value={editingCow.grandDamMaternal || ''}
                      onChange={(e) => setEditingCow({ ...editingCow, grandDamMaternal: e.target.value })}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 flex items-center gap-1">
                  <MessageSquare size={10} className="text-slate-600" /> Remarks / Observations / Health History / Distinguishing Marks
                </label>
                <textarea
                  rows={3}
                  value={editingCow.notes || ''}
                  onChange={(e) => setEditingCow({ ...editingCow, notes: e.target.value })}
                  className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-medium resize-none focus:border-emerald-500 focus:outline-none"
                  placeholder="Enter remarks, body markings, veterinary treatments, temperament, or specific observations..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditingCow(null)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onEditCow) {
                    onEditCow(editingCow.id, editingCow);
                  }
                  setEditingCow(null);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-md transition-colors m-0 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remarks Detail View Modal */}
      {selectedRemarkCow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-black text-sm text-emerald-800">{selectedRemarkCow.id}</span>
                <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {selectedRemarkCow.name || 'Unnamed Animal'} Remarks & History
                </h4>
              </div>
              <button
                onClick={() => setSelectedRemarkCow(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors m-0 border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Breed & Sex</span>
                <span className="font-bold text-slate-700 block mt-0.5">
                  {selectedRemarkCow.breed} ({selectedRemarkCow.gender === 'Male' ? '♂ M' : '♀ F'})
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Locality</span>
                <span className="font-bold text-slate-700 block mt-0.5 truncate">
                  {selectedRemarkCow.locality || 'General'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Status</span>
                <span className="font-bold text-slate-700 block mt-0.5">
                  {selectedRemarkCow.status}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                Recorded Remarks, Health History & Distinguishing Marks
              </span>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedRemarkCow.notes || 'No remarks recorded for this animal.'}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <div className="text-[11px] text-slate-500">
                <span className="font-bold">Sire:</span> {selectedRemarkCow.sire || '—'} | <span className="font-bold">Dam:</span> {selectedRemarkCow.dam || '—'}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRemarkCow(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
