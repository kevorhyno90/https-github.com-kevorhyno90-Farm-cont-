/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ingredient } from '../types';
import { Beaker, Layers, Plus, Trash2, ShieldAlert, BadgeCheck, DollarSign, Sparkles } from 'lucide-react';

interface FeedFormulatorProps {
  ingredients: Ingredient[];
  onAddIngredientToLib: (ing: Ingredient) => void;
  onDeleteIngredientToLib: (name: string) => void;
}

const PRESETS = {
  standard: {
    label: "Standard Milker (16% CP, 10.5 ME)",
    targetCp: 16.0,
    items: [
      { id: 'b-1', name: 'Maize Germ', amount: 50 },
      { id: 'b-2', name: 'Wheat Pollard', amount: 25 },
      { id: 'b-3', name: 'Cotton Seed Cake', amount: 15 },
      { id: 'b-4', name: 'Soya Bean Meal', amount: 8 },
      { id: 'b-5', name: 'DCP / Mineral Premix', amount: 2 }
    ]
  },
  premium: {
    label: "Peak Lactation Concentrate (19.5% CP, 11.5 ME)",
    targetCp: 19.5,
    items: [
      { id: 'b-1', name: 'Soya Bean Meal', amount: 35 },
      { id: 'b-2', name: 'Wheat Pollard', amount: 25 },
      { id: 'b-3', name: 'Cotton Seed Cake', amount: 20 },
      { id: 'b-4', name: 'Maize Germ', amount: 18 },
      { id: 'b-5', name: 'DCP / Mineral Premix', amount: 2 }
    ]
  },
  drycow: {
    label: "Dry Cow Maintenance Ration (12% CP, 9.0 ME)",
    targetCp: 12.0,
    items: [
      { id: 'b-1', name: 'Wheat Pollard', amount: 60 },
      { id: 'b-2', name: 'Maize Germ', amount: 30 },
      { id: 'b-3', name: 'Cotton Seed Cake', amount: 8 },
      { id: 'b-4', name: 'DCP / Mineral Premix', amount: 2 }
    ]
  }
};

export function FeedFormulator({ ingredients, onAddIngredientToLib, onDeleteIngredientToLib }: FeedFormulatorProps) {
  // New laboratory ingredient state
  const [libName, setLibName] = useState('');
  const [libCp, setLibCp] = useState<number | ''>('');
  const [libMe, setLibMe] = useState<number | ''>('');
  const [libCost, setLibCost] = useState<number | ''>('');

  // Active batch ingredients formulation with localStorage persistence
  const [batchItems, setBatchItems] = useState<{ id: string; name: string; amount: number }[]>(() => {
    const saved = localStorage.getItem('jr_farm_feed_formulator_batch');
    return saved ? JSON.parse(saved) : [
      { id: 'b-1', name: 'Maize Germ', amount: 50 },
      { id: 'b-2', name: 'Wheat Pollard', amount: 25 },
      { id: 'b-3', name: 'Cotton Seed Cake', amount: 15 },
      { id: 'b-4', name: 'Soya Bean Meal', amount: 8 },
      { id: 'b-5', name: 'DCP / Mineral Premix', amount: 2 }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('jr_farm_feed_formulator_batch', JSON.stringify(batchItems));
  }, [batchItems]);

  const handleAddLabIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libName.trim() || libCp === '' || libMe === '') return;
    onAddIngredientToLib({
      name: libName.trim(),
      cp: Number(libCp),
      me: Number(libMe),
      cost: libCost !== '' ? Number(libCost) : undefined
    });
    setLibName('');
    setLibCp('');
    setLibMe('');
    setLibCost('');
  };

  const handleAddBatchRow = () => {
    const available = ingredients.find((i) => !batchItems.some((b) => b.name === i.name));
    const nameToUse = available ? available.name : ingredients[0]?.name || '';
    setBatchItems([
      ...batchItems,
      {
        id: `b-${Date.now()}-${Math.random()}`,
        name: nameToUse,
        amount: 10
      }
    ]);
  };

  const handleUpdateBatchName = (id: string, name: string) => {
    setBatchItems(batchItems.map((item) => (item.id === id ? { ...item, name } : item)));
  };

  const handleUpdateBatchAmount = (id: string, amount: number) => {
    setBatchItems(batchItems.map((item) => (item.id === id ? { ...item, amount } : item)));
  };

  const handleRemoveBatchItem = (id: string) => {
    setBatchItems(batchItems.filter((item) => item.id !== id));
  };

  // Compute batch statistics
  let totalWeight = 0;
  let totalCpWeight = 0;
  let totalMeWeight = 0;
  let totalCost = 0;

  batchItems.forEach((bItem) => {
    const rawIng = ingredients.find((i) => i.name === bItem.name);
    if (rawIng && bItem.amount > 0) {
      totalWeight += bItem.amount;
      totalCpWeight += rawIng.cp * bItem.amount;
      totalMeWeight += rawIng.me * bItem.amount;
      totalCost += (rawIng.cost || 0) * bItem.amount;
    }
  });

  const averageCp = totalWeight > 0 ? totalCpWeight / totalWeight : 0;
  const averageMe = totalWeight > 0 ? totalMeWeight / totalWeight : 0;
  const averageCostPerKg = totalWeight > 0 ? totalCost / totalWeight : 0;

  // Classify resulting feed quality
  let categoryLabel = 'Low Protein Supplement';
  let categoryColor = 'text-amber-500 bg-amber-50 border-amber-200';
  let isOptimal = false;

  if (averageCp >= 15 && averageCp < 18) {
    categoryLabel = 'Standard Dairy Meal (Young Milkers / Medium Yield)';
    categoryColor = 'text-green-600 bg-emerald-50/50 border-emerald-200';
    isOptimal = true;
  } else if (averageCp >= 18 && averageCp <= 21) {
    categoryLabel = ' Lactation Concentrate (High Yield Premium Peak)';
    categoryColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    isOptimal = true;
  } else if (averageCp > 21) {
    categoryLabel = 'High Protein Booster (Mix base ratios down)';
    categoryColor = 'text-purple-600 bg-purple-50 border-purple-200';
  } else if (totalWeight > 0) {
    categoryLabel = 'Ration too lean in Crude Protein (<15% CP). Boost Sunflower/Cotton Cake.';
    categoryColor = 'text-rose-600 bg-rose-50 border-rose-200';
  }

  return (
    <div className="space-y-8">
      {/* Introduction banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl shrink-0">
          <Beaker size={24} />
        </div>
        <div>
          <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Feed Formulation Lab</h4>
          <p className="text-xs text-slate-400 font-medium">
            Formulate custom feeds and analyze Crude Protein (CP%) & metabolizable energy (ME) dry-matter ratios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredient Register Library */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:col-span-1">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Ingredient Laboratory</h5>
            <p className="text-xs text-slate-400 mt-1 font-medium">Add materials to your compounding bank</p>
          </div>

          <form onSubmit={handleAddLabIngredient} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Ingredient Name</label>
              <input
                type="text"
                required
                value={libName}
                onChange={(e) => setLibName(e.target.value)}
                placeholder="E.g. Groundnut Meal"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Crude Protein (CP %)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={libCp}
                  onChange={(e) => setLibCp(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="E.g. 36"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Energy ME (MJ/kg)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="30"
                  step="0.1"
                  value={libMe}
                  onChange={(e) => setLibMe(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="E.g. 11.2"
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Cost per KG (Ksh)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={libCost}
                onChange={(e) => setLibCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="E.g. 45"
                className="text-xs border border-slate-200 rounded-lg p-3 w-full"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all m-0"
            >
              Add to Lab Inventory
            </button>
          </form>

          {/* Current bank inventory */}
          <div className="border-t border-slate-100 pt-5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Available Lab Materials</label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ingredients.map((ing) => (
                <div key={ing.name} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 transition-all">
                  <div className="flex-1">
                    <span className="font-extrabold text-slate-800">{ing.name}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {ing.cost ? `Ksh ${ing.cost}/kg` : 'No price set'}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2.5">
                    <div>
                      <span className="font-mono font-bold bg-white text-emerald-950 border border-slate-150 px-2 py-0.5 rounded text-[10px] block">
                        {ing.cp}% CP
                      </span>
                      <span className="font-mono text-slate-400 font-semibold block text-[9px] mt-0.5">
                        {ing.me} MJ
                      </span>
                    </div>
                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => onDeleteIngredientToLib(ing.name)}
                      className="text-slate-350 hover:text-red-600 p-1 rounded transition-colors cursor-pointer m-0"
                      title="Delete Material"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Batch Formulating Engine */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          {/* Quick-Apply Template Presets Selector */}
          <div className="bg-indigo-50/60 p-4 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-indigo-950">
              <Sparkles size={14} className="text-indigo-700 font-black animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Load Ration Target Preset Template</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setBatchItems(PRESETS.standard.items)}
                className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
              >
                Standard Milker (16% CP)
              </button>
              <button
                type="button"
                onClick={() => setBatchItems(PRESETS.premium.items)}
                className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
              >
                High Lactation (19.5% CP)
              </button>
              <button
                type="button"
                onClick={() => setBatchItems(PRESETS.drycow.items)}
                className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
              >
                Dry Cow Care (12% CP)
              </button>
            </div>
          </div>

          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Recipe Compounding Board</h5>
              <p className="text-xs text-slate-400 mt-1 font-medium">Specify absolute material kilograms in formula</p>
            </div>
            <button
              onClick={handleAddBatchRow}
              className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 border border-emerald-100 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-colors m-0 cursor-pointer"
            >
              <Plus size={14} /> Add Raw Material
            </button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {batchItems.length === 0 ? (
              <p className="text-center text-slate-400 text-xs italic py-10">Add ingredients to formulate your batch.</p>
            ) : (
              batchItems.map((item) => (
                <div key={item.id} className="flex gap-3 items-center bg-slate-50/70 border border-slate-100 p-3 rounded-xl transition-all hover:border-slate-200">
                  <div className="flex-1">
                    <select
                      value={item.name}
                      onChange={(e) => handleUpdateBatchName(item.id, e.target.value)}
                      className="text-xs font-extrabold text-slate-800 border border-slate-200 rounded-lg p-2.5 w-full bg-white leading-none"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.name} value={ing.name}>
                          {ing.name} ({ing.cp}% CP, {ing.me} MJ/kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28 flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      value={item.amount}
                      onChange={(e) => handleUpdateBatchAmount(item.id, parseFloat(e.target.value) || 0)}
                      placeholder="KG"
                      className="text-xs border border-slate-200 rounded-lg p-2.5 w-full bg-white text-right font-mono font-bold"
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase">KG</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBatchItem(item.id)}
                    className="text-slate-300 hover:text-red-600 p-2.5 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer m-0"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Aggregate Results Dashboard */}
          {totalWeight > 0 ? (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-950 text-white rounded-2xl text-center shadow-md">
                  <span className="text-[10px] text-emerald-400/90 font-black tracking-wider uppercase block">Total Weight</span>
                  <h3 className="text-3xl font-black font-mono mt-1 text-white">{totalWeight.toFixed(1)} <span className="text-xs">KG</span></h3>
                </div>

                <div className="p-4 bg-emerald-950 text-white rounded-2xl text-center shadow-md border-l border-emerald-900">
                  <span className="text-[10px] text-emerald-400/90 font-black tracking-wider uppercase block">Crude Protein</span>
                  <h3 className="text-3xl font-black font-mono mt-1 text-yellow-500">{averageCp.toFixed(1)}<span className="text-xs">%</span></h3>
                </div>

                <div className="p-4 bg-emerald-950 text-white rounded-2xl text-center shadow-md border-l border-emerald-900">
                  <span className="text-[10px] text-emerald-400/90 font-black tracking-wider uppercase block">Energy (ME)</span>
                  <h3 className="text-3xl font-black font-mono mt-1 text-sky-400">{averageMe.toFixed(1)} <span className="text-[10px] font-normal">MJ/kg</span></h3>
                </div>

                <div className="p-4 bg-emerald-950 text-white rounded-2xl text-center shadow-md border-l border-emerald-900">
                  <span className="text-[10px] text-emerald-400/90 font-black tracking-wider uppercase block">Est. Cost</span>
                  <h3 className="text-xl font-black font-mono mt-2 text-emerald-300">
                    Ksh {totalCost.toLocaleString()}
                    <span className="text-[10px] text-emerald-400 block font-normal">Ksh {averageCostPerKg.toFixed(1)}/kg</span>
                  </h3>
                </div>
              </div>

              {/* Feed classification feedback banner */}
              <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${categoryColor}`}>
                {isOptimal ? (
                  <BadgeCheck size={20} className="shrink-0 text-emerald-800" />
                ) : (
                  <ShieldAlert size={20} className="shrink-0" />
                )}
                <div>
                  <span className="font-extrabold uppercase tracking-wide block">Formulation Safety Diagnostic:</span>
                  <p className="mt-0.5 font-semibold text-slate-700">{categoryLabel}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-center">
              <span className="text-xs text-slate-400 font-extrabold">Batch parameters currently zero. Add ingredients and weights to compute diagnostics.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
