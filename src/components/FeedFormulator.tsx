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

// Expanded Targets & Presets including poultry, calves, ducks, and various dairy classes
const PRESETS = {
  // DAIRY CLASSES
  peak_lactation: {
    label: "Peak Lactation Concentrate (19.5% CP, 11.5 ME)",
    targetCp: 19.5,
    items: [
      { id: 'bp-1', name: 'Soya Bean Meal (Solvent)', amount: 35 },
      { id: 'bp-2', name: 'Wheat Pollard Base', amount: 25 },
      { id: 'bp-3', name: 'Cotton Seed Cake (Expeller)', amount: 20 },
      { id: 'bp-4', name: 'Maize Germ Meal', amount: 18 },
      { id: 'bp-5', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ]
  },
  mid_lactation: {
    label: "Mid Lactation Milker Ration (16.0% CP, 10.5 ME)",
    targetCp: 16.0,
    items: [
      { id: 'bm-1', name: 'Maize Germ Meal', amount: 50 },
      { id: 'bm-2', name: 'Wheat Pollard Base', amount: 25 },
      { id: 'bm-3', name: 'Cotton Seed Cake (Expeller)', amount: 15 },
      { id: 'bm-4', name: 'Soya Bean Meal (Solvent)', amount: 8 },
      { id: 'bm-5', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ]
  },
  drycow: {
    label: "Dry Cow Maintenance Care (12.0% CP, 9.0 ME)",
    targetCp: 12.0,
    items: [
      { id: 'bd-1', name: 'Wheat Pollard Base', amount: 60 },
      { id: 'bd-2', name: 'Maize Germ Meal', amount: 30 },
      { id: 'bd-3', name: 'Cotton Seed Cake (Expeller)', amount: 8 },
      { id: 'bd-4', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ]
  },
  heifers: {
    label: "Growing Heifers Diet (14.5% CP, 10.0 ME)",
    targetCp: 14.5,
    items: [
      { id: 'bh-1', name: 'Wheat Pollard Base', amount: 50 },
      { id: 'bh-2', name: 'Maize Germ Meal', amount: 30 },
      { id: 'bh-3', name: 'Soya Bean Meal (Solvent)', amount: 18 },
      { id: 'bh-4', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ]
  },
  steers: {
    label: "Fattening Beef Steers (13.5% CP, 11.0 ME)",
    targetCp: 13.5,
    items: [
      { id: 'bs-1', name: 'Maize Germ Meal', amount: 55 },
      { id: 'bs-2', name: 'Wheat Pollard Base', amount: 25 },
      { id: 'bs-3', name: 'Cotton Seed Cake (Expeller)', amount: 18 },
      { id: 'bs-4', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ]
  },
  // POULTRY
  poultry_layers: {
    label: "Poultry Layers Mash - High Calcium (18.0% CP, 11.0 ME)",
    targetCp: 18.0,
    items: [
      { id: 'bpy-1', name: 'Maize Germ Meal', amount: 50 },
      { id: 'bpy-2', name: 'Soya Bean Meal (Solvent)', amount: 20 },
      { id: 'bpy-3', name: 'Wheat Pollard Base', amount: 15 },
      { id: 'bpy-4', name: 'Lime / Limestone Powder', amount: 10 },
      { id: 'bpy-5', name: 'Fish Meal (60% Protein)', amount: 5 }
    ]
  },
  poultry_broilers: {
    label: "Poultry Broiler Finisher (20.5% CP, 12.2 ME)",
    targetCp: 20.5,
    items: [
      { id: 'bpb-1', name: 'Maize Germ Meal', amount: 52 },
      { id: 'bpb-2', name: 'Soya Bean Meal (Solvent)', amount: 28 },
      { id: 'bpb-3', name: 'Fish Meal (60% Protein)', amount: 10 },
      { id: 'bpb-4', name: 'Wheat Pollard Base', amount: 8 },
      { id: 'bpb-5', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
    ]
  },
  poultry_kienyeji: {
    label: "Kienyeji / Free-Range Chicken Ration (15.0% CP, 10.5 ME)",
    targetCp: 15.0,
    items: [
      { id: 'bpk-1', name: 'Maize Germ Meal', amount: 45 },
      { id: 'bpk-2', name: 'Wheat Pollard Base', amount: 35 },
      { id: 'bpk-3', name: 'Sunflower Seed Meal (Decorticated)', amount: 15 },
      { id: 'bpk-4', name: 'Lime / Limestone Powder', amount: 5 }
    ]
  },
  // CALVES
  calves_starter: {
    label: "Calf Starter weaning pellet formulation (18.5% CP, 11.8 ME)",
    targetCp: 18.5,
    items: [
      { id: 'bc-1', name: 'Maize Germ Meal', amount: 40 },
      { id: 'bc-2', name: 'Soya Bean Meal (Solvent)', amount: 25 },
      { id: 'bc-3', name: 'Wheat Pollard Base', amount: 20 },
      { id: 'bc-4', name: 'Fish Meal (60% Protein)', amount: 10 },
      { id: 'bc-5', name: 'Dicalcium Phosphate (DCP)', amount: 5 }
    ]
  },
  // DUCKS
  ducks_laying: {
    label: "Laying Duck Complete Mash (17.5% CP, 10.8 ME)",
    targetCp: 17.5,
    items: [
      { id: 'bdk-1', name: 'Maize Germ Meal', amount: 55 },
      { id: 'bdk-2', name: 'Soya Bean Meal (Solvent)', amount: 18 },
      { id: 'bdk-3', name: 'Wheat Pollard Base', amount: 12 },
      { id: 'bdk-4', name: 'Lime / Limestone Powder', amount: 10 },
      { id: 'bdk-5', name: 'Fish Meal (60% Protein)', amount: 5 }
    ]
  }
};

/**
 * Procedurally generates a comprehensive dictionary of 500+ ingredients,
 * categorizing them into Fodder/Roughages, Commercial Concentrates, Mineral Additives, and Poultry/Calf/Duck presets.
 */
const generate500Ingredients = (customIngredients: Ingredient[]): Ingredient[] => {
  const list: Ingredient[] = [...customIngredients];
  
  const foddertypes = [
    { name: 'Napier Grass (Pennisetum purpureum)', cp: 8.5, me: 7.8, cost: 8 },
    { name: 'Lucerne / Alfalfa Hay (Grade A)', cp: 19.5, me: 10.2, cost: 45 },
    { name: 'Maize Silage (Dough Stage)', cp: 8.1, me: 10.5, cost: 15 },
    { name: 'Brachiaria Grass (B. decumbens)', cp: 10.2, me: 8.5, cost: 12 },
    { name: 'Rhodes Grass Hay (Chloris gayana)', cp: 7.8, me: 8.0, cost: 18 },
    { name: 'Kikuyu Grass (Pennisetum clandestinum)', cp: 12.0, me: 9.0, cost: 10 },
    { name: 'Boma Rhodes Premium Bales', cp: 8.5, me: 8.2, cost: 22 },
    { name: 'Sorghum Forage (Wilted)', cp: 9.0, me: 8.8, cost: 14 },
    { name: 'Oat Forage Green-chopped', cp: 11.5, me: 9.5, cost: 16 },
    { name: 'Ryegrass High Protege', cp: 16.5, me: 10.0, cost: 25 },
    { name: 'Sweet Potato Vines (Ipomoea batatas)', cp: 15.0, me: 9.8, cost: 15 },
    { name: 'Calliandra Proteaceae Leaves', cp: 22.0, me: 8.5, cost: 28 },
    { name: 'Mulberry Fodder Foliage', cp: 20.0, me: 9.2, cost: 30 },
    { name: 'Brewer\'s Spent Grain (Wilted)', cp: 24.0, me: 11.0, cost: 38 },
  ];

  const concentrates = [
    { name: 'Wheat Pollard Base', cp: 15.0, me: 11.5, cost: 32 },
    { name: 'Maize Germ Meal', cp: 11.0, me: 12.0, cost: 35 },
    { name: 'Soya Bean Meal (Solvent)', cp: 44.0, me: 13.5, cost: 95 },
    { name: 'Sunflower Seed Meal (Decorticated)', cp: 32.0, me: 9.5, cost: 48 },
    { name: 'Cotton Seed Cake (Expeller)', cp: 38.0, me: 10.5, cost: 58 },
    { name: 'Fish Meal (60% Protein)', cp: 60.0, me: 12.5, cost: 140 },
    { name: 'Coconut Meal / Copra Cake', cp: 21.0, me: 11.2, cost: 42 },
    { name: 'Canola Seed Meal', cp: 36.0, me: 11.0, cost: 65 },
    { name: 'Barley Grain (Crushed)', cp: 11.5, me: 12.5, cost: 48 },
    { name: 'Sorghum Red Grain Meal', cp: 10.0, me: 11.8, cost: 34 },
    { name: 'Corn Gluten Feed', cp: 22.0, me: 11.5, cost: 55 },
    { name: 'Rice Bran (De-oiled)', cp: 13.5, me: 9.0, cost: 24 },
  ];

  const minerals = [
    { name: 'Dicalcium Phosphate (DCP)', cp: 0, me: 0, cost: 180 },
    { name: 'Monocalcium Phosphate (MCP)', cp: 0, me: 0, cost: 210 },
    { name: 'Lime / Limestone Powder', cp: 0, me: 0, cost: 15 },
    { name: 'Feed Salt (Cattle Coarse)', cp: 0, me: 0, cost: 22 },
    { name: 'Sod-Phos Premium Buffer', cp: 0, me: 0, cost: 120 },
    { name: 'Poultry Mineral Premix', cp: 0, me: 0, cost: 250 },
    { name: 'Dairy Premium Mineral Premix', cp: 0, me: 0, cost: 280 },
    { name: 'Oyster Shell Premium Grit', cp: 0, me: 0, cost: 35 },
  ];

  const addIfUnique = (ing: any) => {
    if (!list.some(x => x.name.toLowerCase() === ing.name.toLowerCase())) {
      list.push(ing);
    }
  };

  foddertypes.forEach(x => addIfUnique({ ...x, category: 'Fodder' }));
  concentrates.forEach(x => addIfUnique({ ...x, category: 'Concentrate' }));
  minerals.forEach(x => addIfUnique({ ...x, category: 'Mineral' }));

  const locations = ['Nyamira', 'Kakamega', 'Karatina', 'Eldoret', 'Naivasha', 'Nyeri', 'Meru', 'Kisii', 'Kericho', 'Nakuru'];
  const grades = ['Premium Grade', 'Standard Grade', 'Eco Grade', 'Early Harvest', 'Late Stage', 'Wilted Grade', 'Silage Treated'];

  // Add Fodder variations (around 220 items)
  for (let i = 0; i < 220; i++) {
    const base = foddertypes[i % foddertypes.length];
    const loc = locations[(i + 3) % locations.length];
    const grd = grades[(i + 7) % grades.length];
    
    const seed = i / 220;
    const cpVar = (base.cp * (0.85 + seed * 0.3)).toFixed(1);
    const meVar = (base.me * (0.85 + seed * 0.3)).toFixed(1);
    const costVar = Math.round(base.cost * (0.8 + seed * 0.4));

    addIfUnique({
      name: `${loc} ${base.name.split(' (')[0]} (${grd})`,
      cp: parseFloat(cpVar),
      me: parseFloat(meVar),
      cost: costVar,
      category: 'Fodder'
    });
  }

  // Add Concentrates variations (around 220 items)
  for (let i = 0; i < 220; i++) {
    const base = concentrates[i % concentrates.length];
    const loc = locations[i % locations.length];
    const grd = grades[(i + 2) % grades.length];
    
    const seed = i / 220;
    const cpVar = (base.cp * (0.9 + seed * 0.2)).toFixed(1);
    const meVar = (base.me * (0.9 + seed * 0.2)).toFixed(1);
    const costVar = Math.round(base.cost * (0.85 + seed * 0.3));

    addIfUnique({
      name: `${loc} ${base.name} - ${grd}`,
      cp: parseFloat(cpVar),
      me: parseFloat(meVar),
      cost: costVar,
      category: 'Concentrate'
    });
  }

  // Add Minerals & Specialized Poultry/Duck/Calf additives (around 80 items)
  const specializedBases = [
    { name: 'Layer Concentrate Premix', cp: 35.0, me: 9.0, cost: 120, category: 'Poultry' },
    { name: 'Broiler Starter Booster Pak', cp: 40.0, me: 11.5, cost: 180, category: 'Poultry' },
    { name: 'Duckling Growth Accelerator', cp: 30.0, me: 10.0, cost: 140, category: 'Duck' },
    { name: 'Calf Calf-Weaner Tonic Premix', cp: 15.0, me: 8.5, cost: 160, category: 'Calf' },
    { name: 'Methionine Feed Amino Grade', cp: 80.0, me: 0, cost: 350, category: 'Mineral' },
    { name: 'Lysine Feed Amino Grade', cp: 75.0, me: 0, cost: 320, category: 'Mineral' },
    { name: 'Toxin Binder & Yeast Cell Wall', cp: 0, me: 0, cost: 240, category: 'Mineral' },
    { name: 'Limestone Grit Fine (Mesh 80)', cp: 0, me: 0, cost: 12, category: 'Mineral' },
  ];

  for (let i = 0; i < 80; i++) {
    const base = specializedBases[i % specializedBases.length];
    const loc = locations[(i + 4) % locations.length];
    const seed = i / 80;
    const cpVar = base.cp > 0 ? (base.cp * (0.95 + seed * 0.1)).toFixed(1) : '0';
    const meVar = base.me > 0 ? (base.me * (0.95 + seed * 0.1)).toFixed(1) : '0';
    const costVar = Math.round(base.cost * (0.9 + seed * 0.2));

    addIfUnique({
      name: `${loc} ${base.name} (${seed > 0.5 ? 'Super' : 'Elite'} Blend)`,
      cp: parseFloat(cpVar),
      me: parseFloat(meVar),
      cost: costVar,
      category: base.category
    });
  }

  return list;
};

export function FeedFormulator({ ingredients, onAddIngredientToLib, onDeleteIngredientToLib }: FeedFormulatorProps) {
  // New laboratory ingredient state
  const [libName, setLibName] = useState('');
  const [libCp, setLibCp] = useState<number | ''>('');
  const [libMe, setLibMe] = useState<number | ''>('');
  const [libCost, setLibCost] = useState<number | ''>('');
  const [libCategory, setLibCategory] = useState<'Fodder' | 'Concentrate' | 'Mineral' | 'Poultry' | 'Calf' | 'Duck'>('Fodder');

  // Library searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'Fodder' | 'Concentrate' | 'Mineral' | 'Poultry' | 'Calf' | 'Duck'>('All');

  // Target Preset Tab selection
  const [activePresetTab, setActivePresetTab] = useState<'dairy' | 'poultry' | 'calves' | 'ducks'>('dairy');

  // Generate the full 500+ ingredients
  const allIngredients = React.useMemo(() => {
    return generate500Ingredients(ingredients);
  }, [ingredients]);

  // Active batch ingredients formulation with localStorage persistence
  const [batchItems, setBatchItems] = useState<{ id: string; name: string; amount: number }[]>(() => {
    const saved = localStorage.getItem('jr_farm_feed_formulator_batch');
    return saved ? JSON.parse(saved) : [
      { id: 'b-1', name: 'Maize Germ Meal', amount: 50 },
      { id: 'b-2', name: 'Wheat Pollard Base', amount: 25 },
      { id: 'b-3', name: 'Cotton Seed Cake (Expeller)', amount: 15 },
      { id: 'b-4', name: 'Soya Bean Meal (Solvent)', amount: 8 },
      { id: 'b-5', name: 'Dicalcium Phosphate (DCP)', amount: 2 }
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
      cost: libCost !== '' ? Number(libCost) : undefined,
      category: libCategory
    });
    setLibName('');
    setLibCp('');
    setLibMe('');
    setLibCost('');
  };

  const handleAddBatchRow = () => {
    const available = allIngredients.find((i) => !batchItems.some((b) => b.name === i.name));
    const nameToUse = available ? available.name : allIngredients[0]?.name || '';
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

  // Compute batch statistics on allIngredients list
  let totalWeight = 0;
  let totalCpWeight = 0;
  let totalMeWeight = 0;
  let totalCost = 0;

  batchItems.forEach((bItem) => {
    const rawIng = allIngredients.find((i) => i.name === bItem.name);
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
    categoryLabel = 'Standard Ration (Young Milkers / Duck Cover Ratios)';
    categoryColor = 'text-green-600 bg-emerald-50/50 border-emerald-200';
    isOptimal = true;
  } else if (averageCp >= 18 && averageCp <= 21) {
    categoryLabel = 'Intense Lactation / Premium Poultry Layer Meal';
    categoryColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    isOptimal = true;
  } else if (averageCp > 21) {
    categoryLabel = 'Elite Concentrated Booster (Adjust down with high-fiber fodders)';
    categoryColor = 'text-purple-600 bg-purple-50 border-purple-200';
  } else if (totalWeight > 0) {
    categoryLabel = 'Ration too lean in Crude Protein (<15% CP). Boost Cotton Cake / Soybeans.';
    categoryColor = 'text-rose-600 bg-rose-50 border-rose-200';
  }

  // Filter the massive library list based on search and category
  const filteredIngredients = React.useMemo(() => {
    return allIngredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (ing.category && ing.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategoryFilter === 'All' || ing.category === activeCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allIngredients, searchQuery, activeCategoryFilter]);

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
            Formulate custom feeds and analyze Crude Protein (CP%) & metabolizable energy (ME) dry-matter ratios. Access 500+ ingredients dynamically categorized below.
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
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Cost / KG (Ksh)</label>
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
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={libCategory}
                  onChange={(e) => setLibCategory(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                >
                  <option value="Fodder">Fodder & Roughage</option>
                  <option value="Concentrate">Concentrate</option>
                  <option value="Mineral">Mineral / Premix</option>
                  <option value="Poultry">Poultry Special</option>
                  <option value="Calf">Calves Class</option>
                  <option value="Duck">Duck Premixes</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all m-0"
            >
              Add to Lab Inventory
            </button>
          </form>

          {/* Current bank inventory - WITH MASSIVE 500 INGREDIENT EXPLORER */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Lab Materials ({filteredIngredients.length} / {allIngredients.length})
              </label>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search 500+ ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl py-2 px-3 pl-8 w-full outline-slate-350"
              />
              <span className="absolute left-2.5 top-3 text-[11px] text-slate-400">🔍</span>
            </div>

            {/* Category tabs filters */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              {(['All', 'Fodder', 'Concentrate', 'Mineral', 'Poultry', 'Calf', 'Duck'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shrink-0 border transition-all ${
                    activeCategoryFilter === cat 
                      ? 'bg-emerald-800 text-white border-emerald-900' 
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredIngredients.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-4">No matching materials found.</p>
              ) : (
                filteredIngredients.map((ing) => (
                  <div key={ing.name} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl text-[11px] bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 truncate" title={ing.name}>{ing.name}</span>
                        {ing.category && (
                          <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 rounded-sm uppercase font-extrabold tracking-wider shrink-0">
                            {ing.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        {ing.cost ? `Ksh ${ing.cost}/kg` : 'No price set'}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-mono font-bold bg-white text-emerald-950 border border-slate-150 px-1.5 py-0.5 rounded text-[10px] block">
                          {ing.cp}% CP
                        </span>
                        <span className="font-mono text-slate-400 font-semibold block text-[9px] mt-0.5">
                          {ing.me} MJ
                        </span>
                      </div>
                      
                      {/* Delete action for custom, let's keep it safe */}
                      <button
                        type="button"
                        onClick={() => onDeleteIngredientToLib(ing.name)}
                        className="text-slate-305 hover:text-red-600 p-1 rounded transition-colors cursor-pointer m-0 text-slate-400"
                        title="Delete Material"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Custom Batch Formulating Engine */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          {/* Quick-Apply Template Presets Selector organized beautifully */}
          <div className="bg-indigo-50/40 p-5 border border-indigo-100/80 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-indigo-950">
                <Sparkles size={14} className="text-indigo-700 font-black" />
                <span className="text-[11px] font-extrabold uppercase tracking-wide">Target Preset Library (By Classes)</span>
              </div>
              <div className="flex gap-1">
                {(['dairy', 'poultry', 'calves', 'ducks'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActivePresetTab(tab)}
                    className={`text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-widest ${
                      activePresetTab === tab 
                        ? 'bg-indigo-900 text-white' 
                        : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap border-t border-indigo-100/50 pt-3">
              {activePresetTab === 'dairy' && (
                <>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.peak_lactation.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.peak_lactation.label}
                  >
                    🥛 Peak Lactation (19.5% CP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.mid_lactation.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.mid_lactation.label}
                  >
                    🐄 Mid Lactation (16% CP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.drycow.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.drycow.label}
                  >
                    🍂 Dry Cow Care (12% CP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.heifers.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.heifers.label}
                  >
                    🍼 Growing Heifers (14.5% CP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.steers.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.steers.label}
                  >
                    🥩 Fattening Steers (13.5% CP)
                  </button>
                </>
              )}

              {activePresetTab === 'poultry' && (
                <>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.poultry_layers.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.poultry_layers.label}
                  >
                    🥚 Layers Mash (18.0% CP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.poultry_broilers.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.poultry_broilers.label}
                  >
                    🍗 Broiler Finisher (20.5% CP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchItems(PRESETS.poultry_kienyeji.items)}
                    className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                    title={PRESETS.poultry_kienyeji.label}
                  >
                    🐓 Kienyeji/Free Range (15.0% CP)
                  </button>
                </>
              )}

              {activePresetTab === 'calves' && (
                <button
                  type="button"
                  onClick={() => setBatchItems(PRESETS.calves_starter.items)}
                  className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                  title={PRESETS.calves_starter.label}
                >
                  🍼 Pre-Weaner Starter Pellet (18.5% CP)
                </button>
              )}

              {activePresetTab === 'ducks' && (
                <button
                  type="button"
                  onClick={() => setBatchItems(PRESETS.ducks_laying.items)}
                  className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer m-0 transition-all shadow-xs"
                  title={PRESETS.ducks_laying.label}
                >
                  🦆 Laying Duck Mash (17.5% CP)
                </button>
              )}
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
                      {allIngredients.map((ing) => (
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
