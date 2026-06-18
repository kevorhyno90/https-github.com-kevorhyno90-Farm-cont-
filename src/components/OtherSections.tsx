/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FieldRecord, LivestockRecord, InventoryItem } from '../types';
import {
  TreePine,
  Shield,
  Warehouse,
  Plus,
  Compass,
  TrendingDown,
  AlertOctagon,
  Wrench,
  TrendingUp,
  Activity,
  Trash2
} from 'lucide-react';

interface OtherSectionsProps {
  viewType: 'fields' | 'livestock' | 'inventory';
  fields: FieldRecord[];
  livestock: LivestockRecord[];
  inventory: InventoryItem[];
  onAddFields: (rec: FieldRecord) => void;
  onAddLivestock: (rec: LivestockRecord) => void;
  onUpdateInventoryStock: (id: string, newQty: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onDeleteFields: (id: string) => void;
  onDeleteLivestock: (id: string) => void;
  onDeleteInventoryItem: (id: string) => void;
}

export function OtherSections({
  viewType,
  fields,
  livestock,
  inventory,
  onAddFields,
  onAddLivestock,
  onUpdateInventoryStock,
  onAddInventoryItem,
  onDeleteFields,
  onDeleteLivestock,
  onDeleteInventoryItem
}: OtherSectionsProps) {
  // Fields Form
  const [fBlock, setFBlock] = useState('');
  const [fCrop, setFCrop] = useState('');
  const [fAcres, setFAcres] = useState<number | ''>('');
  const [fStatus, setFStatus] = useState('Growing');
  const [fNotes, setFNotes] = useState('');

  // Livestock Form
  const [lsType, setLsType] = useState<'Poultry' | 'Dogs'>('Poultry');
  const [lsName, setLsName] = useState('');
  const [lsCount, setLsCount] = useState('');
  const [lsActivity, setLsActivity] = useState('');
  const [lsNotes, setLsNotes] = useState('');

  // Inventory Form
  const [invName, setInvName] = useState('');
  const [invCat, setInvCat] = useState<InventoryItem['category']>('Feed');
  const [invQty, setInvQty] = useState<number | ''>('');
  const [invUnit, setInvUnit] = useState('bags');
  const [invMin, setInvMin] = useState<number | ''>('');

  const [showAddForm, setShowAddForm] = useState(false);

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fBlock.trim() || !fCrop.trim() || fAcres === '') return;
    onAddFields({
      id: `fld-${Date.now()}`,
      blockName: fBlock.trim(),
      cropType: fCrop.trim(),
      acreage: Number(fAcres),
      status: fStatus,
      notes: fNotes.trim() || 'No active notes',
      date: new Date().toISOString().split('T')[0]
    });
    setFBlock('');
    setFCrop('');
    setFAcres('');
    setFNotes('');
    setShowAddForm(false);
  };

  const handleLivestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lsName.trim() || !lsCount.trim() || !lsActivity.trim()) return;
    onAddLivestock({
      id: `ls-${Date.now()}`,
      type: lsType,
      name: lsName.trim(),
      countOrBreed: lsCount.trim(),
      activity: lsActivity.trim(),
      notes: lsNotes.trim() || 'General healthy record',
      date: new Date().toISOString().split('T')[0]
    });
    setLsName('');
    setLsCount('');
    setLsActivity('');
    setLsNotes('');
    setShowAddForm(false);
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || invQty === '' || !invUnit.trim() || invMin === '') return;
    onAddInventoryItem({
      id: `inv-${Date.now()}`,
      name: invName.trim(),
      category: invCat,
      quantity: Number(invQty),
      unit: invUnit.trim(),
      minStock: Number(invMin)
    });
    setInvName('');
    setInvQty('');
    setInvUnit('bags');
    setInvMin('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. FIELDS & TREES UNIT */}
      {viewType === 'fields' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl">
                <TreePine size={24} className="text-emerald-800" />
              </div>
              <div>
                <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Agronomy & Forestry Blocks</h4>
                <p className="text-xs text-slate-400 font-medium">Manage pasture plots, silage blocks, Napier, and windbreaker blue gum forestry.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-870 active:scale-95 transition-all flex items-center gap-1.5 m-0"
            >
              <Plus size={14} /> Registered Block
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleFieldSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block / Section Name</label>
                  <input
                    type="text"
                    required
                    value={fBlock}
                    onChange={(e) => setFBlock(e.target.value)}
                    placeholder="E.g. Valley pasture E-2"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Crop / Pasture Species</label>
                  <input
                    type="text"
                    required
                    value={fCrop}
                    onChange={(e) => setFCrop(e.target.value)}
                    placeholder="E.g. Rhodes Grass"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Acreage (Acres)</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={fAcres}
                    onChange={(e) => setFAcres(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Area size"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Agronomy Status</label>
                  <select
                    value={fStatus}
                    onChange={(e) => setFStatus(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-705 cursor-pointer text-slate-600"
                  >
                    <option value="Prepared">Coarse Prepared</option>
                    <option value="Sown">Sown / Planted</option>
                    <option value="Growing">Vegetative Growing</option>
                    <option value="Harvested">Culled / harvested</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observation Log Details</label>
                  <input
                    type="text"
                    value={fNotes}
                    onChange={(e) => setFNotes(e.target.value)}
                    placeholder="E.g. Superb leaf ratio, rain-fed responding..."
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0">
                  Commit Plot
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((fld) => (
              <div key={fld.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-extrabold text-[#0b251a] text-sm uppercase">{fld.blockName}</h5>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 mt-1 hover:bg-slate-200 border rounded font-black inline-block uppercase">
                      {fld.cropType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase border px-2 py-1 rounded ${
                      fld.status === 'Growing' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {fld.status}
                    </span>
                    <button
                      onClick={() => onDeleteFields(fld.id)}
                      className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 border border-transparent hover:border-red-50"
                      title="Delete Block"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Section Size</span>
                    <span className="font-black font-mono text-slate-705">{fld.acreage} Acres</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Date</span>
                    <span className="font-semibold font-mono text-slate-405">{fld.date}</span>
                  </div>
                </div>
                <p className="border-t border-slate-50 pt-3 text-xs font-medium text-slate-500 italic">
                  "{fld.notes}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. POULTRY & BREEDING SECURITY DOGS */}
      {viewType === 'livestock' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-950 rounded-xl">
                <Shield size={24} className="text-amber-700" />
              </div>
              <div>
                <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Avian & Guard Security Health Log</h4>
                <p className="text-xs text-slate-400 font-medium">Record poultry layer flocks, egg compiles, vaccine booster routines, and security canine checkups.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-955 bg-amber-900 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-amber-800 active:scale-95 transition-all flex items-center gap-1.5 m-0"
            >
              <Plus size={14} /> Save Ledger Log
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleLivestockSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Unit Type</label>
                  <select
                    value={lsType}
                    onChange={(e) => setLsType(e.target.value as any)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-650 cursor-pointer"
                  >
                    <option value="Poultry">Poultry / Layers / Chicks</option>
                    <option value="Dogs">Security Guard Canines</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Group ID / Breed / Name</label>
                  <input
                    type="text"
                    required
                    value={lsName}
                    onChange={(e) => setLsName(e.target.value)}
                    placeholder="E.g. Flock A (Lay) or Canine Major"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Count or Pedigree Details</label>
                  <input
                    type="text"
                    required
                    value={lsCount}
                    onChange={(e) => setLsCount(e.target.value)}
                    placeholder="E.g. 520 birds, German Shepherd"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div className="col-span-1 md:col-span-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Logged Activity</label>
                  <input
                    type="text"
                    required
                    value={lsActivity}
                    onChange={(e) => setLsActivity(e.target.value)}
                    placeholder="E.g. Administered typhoid vaccine, collected 12 crates eggs"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div className="col-span-1 md:col-span-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Additional Observations / Notes</label>
                  <input
                    type="text"
                    value={lsNotes}
                    onChange={(e) => setLsNotes(e.target.value)}
                    placeholder="E.g. Feed intake robust, normal weight curves..."
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-amber-950 bg-amber-900 text-white font-black text-xs uppercase rounded-lg m-0">
                  Save Activity
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {livestock.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      item.type === 'Poultry' ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      {item.type} Section
                    </span>
                    <h5 className="font-extrabold text-[13.5px] uppercase text-[#0b251a]">{item.name}</h5>
                    <span className="text-xs font-mono font-bold text-slate-400">({item.countOrBreed})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-705 leading-relaxed bg-slate-50 shrink-0 px-2 py-1 rounded inline-block">
                    <Activity size={12} className="text-emerald-700 shrink-0 inline-block mr-1" />
                    <span>Activity: {item.activity}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 italic leading-normal">
                    Observational diagnostics: "{item.notes}"
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0 flex items-center gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-400 ml-1 block">Compiled timestamp</span>
                    <span className="text-xs font-black font-mono text-slate-705 block mt-1">{item.date}</span>
                  </div>
                  <button
                    onClick={() => onDeleteLivestock(item.id)}
                    className="text-slate-305 hover:text-red-650 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-red-100 bg-white shadow-xs"
                    title="Delete record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WAREHOUSE INVENTORY BASE */}
      {viewType === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-100 text-zinc-950 rounded-xl">
                <Warehouse size={24} className="text-zinc-650" />
              </div>
              <div>
                <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Storage Warehouse Register</h4>
                <p className="text-xs text-slate-400 font-medium">Coordinate stocks of compounding grains, silages, GlobalGAP chemical spray liters, and wound tools.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-zinc-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-1.5 m-0"
            >
              <Plus size={14} /> Core Register Stock
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleInventorySubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Item Title Name</label>
                  <input
                    type="text"
                    required
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    placeholder="E.g. Saw blades"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Storage Class</label>
                  <select
                    value={invCat}
                    onChange={(e) => setInvCat(e.target.value as any)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-650 cursor-pointer"
                  >
                    <option value="Feed">Dry Feed / Silages</option>
                    <option value="Chemical">Agrochemicals / Sprays</option>
                    <option value="Machine Parts">Canine / Machine Parts</option>
                    <option value="Tools">Pruning / Weeding Tools</option>
                    <option value="Fencing">Fencing logs / Barbed wire</option>
                    <option value="Fertilizer">Soil Fertilizer bags</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Opening Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Stock count"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Metric Unit Type</label>
                  <input
                    type="text"
                    required
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    placeholder="E.g. bags (50kg)"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    value={invMin}
                    onChange={(e) => setInvMin(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Restock level"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-zinc-950 text-white font-black text-xs uppercase rounded-lg m-0">
                  Register Item
                </button>
              </div>
            </form>
          )}

          {/* Table display with interactive adjusters */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-650 font-black text-[10px] uppercase">
                  <td className="p-4">Item Warehouse Description</td>
                  <td className="p-4">Category</td>
                  <td className="p-4 font-mono text-center">Safety Restock Level</td>
                  <td className="p-4 font-mono text-right">Available Volume Balance</td>
                  <td className="p-4 text-center">Interactive Quick-Adjust</td>
                  <td className="p-4 text-center">Actions</td>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minStock;

                  return (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Wrench size={14} className="text-slate-400" />
                          <div>
                            <span className="font-extrabold text-slate-800 tracking-wide text-[13px]">{item.name}</span>
                            {isLow && (
                              <span className="ml-2 inline-flex items-center gap-1.5 text-[8.5px] bg-red-100 border border-red-200 text-red-800 px-2 py-0.5 rounded font-black uppercase">
                                <AlertOctagon size={10} /> Low Stock alert
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border text-slate-500 uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-400 font-bold font-mono">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="p-4 text-right font-mono font-black text-sm text-slate-705">
                        <span className={isLow ? 'text-red-700' : 'text-slate-800'}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateInventoryStock(item.id, Math.max(0, item.quantity - 1))}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg font-black leading-none inline-block cursor-pointer m-0"
                            title="Decrement 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onUpdateInventoryStock(item.id, item.quantity + 1)}
                            className="text-xs bg-slate-900 hover:bg-slate-850 text-white p-2 rounded-lg font-black leading-none inline-block cursor-pointer m-0"
                            title="Increment 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onDeleteInventoryItem(item.id)}
                          className="text-slate-300 hover:text-red-650 p-2 border border-transparent hover:border-red-105 rounded-xl transition-colors cursor-pointer m-0 inline-block align-middle"
                          title="Purge Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
