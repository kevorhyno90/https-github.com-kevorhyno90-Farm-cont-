/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ingredient } from '../types';
import { Beaker, Layers, Plus, Trash2, ShieldAlert, BadgeCheck, DollarSign, Sparkles, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedFormulatorProps {
  ingredients: Ingredient[];
  onAddIngredientToLib: (ing: Ingredient) => void;
  onDeleteIngredientToLib: (name: string) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
  onAddInventoryItem?: (item: any) => void;
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

const ANIMAL_NUTRITION_STANDARDS = [
  {
    grp: "Dairy",
    stage: "Peak Lactation Cow (0-100 Days)",
    desc: "First stage of milking with maximum yield requirements. Demands high protein to prevent body-fat depletion (negative energy balance) and sustain top daily output levels.",
    cpRange: "18.5% - 20.0%",
    meRange: "11.5 - 12.0 MJ/kg",
    intake: "16 - 20 kg DM/day",
    ingredients: "Soya Bean Meal, Maize Germ, Cotton Cake, DCP Mineral, Maize Silage, Lucerne Hay"
  },
  {
    grp: "Dairy",
    stage: "Mid Lactation Cow (101-200 Days)",
    desc: "Winding down peak performance. Milk yield stabilizes. Maintain energy to support pregnancy re-conception while preventing excessive weight gain.",
    cpRange: "15.5% - 17.0%",
    meRange: "10.5 - 11.2 MJ/kg",
    intake: "14 - 17 kg DM/day",
    ingredients: "Wheat Pollard Base, Maize Silage, Cotton Seed Cake, Napier Grass, Premium Minerals"
  },
  {
    grp: "Dairy",
    stage: "Dry Cow Maintenance",
    desc: "Mandatory rest period (approx. 60 days pre-calving) to regenerate milk-secreting tissue. Keep protein and calcium moderate to avoid metabolic fever upon calving.",
    cpRange: "11.5% - 13.0%",
    meRange: "8.5 - 9.5 MJ/kg",
    intake: "10 - 12 kg DM/day",
    ingredients: "Boma Rhodes Hay, Wheat Pollard Base, Oat Forage, Soda-Phos Buffer Minerals"
  },
  {
    grp: "Dairy",
    stage: "Growing Heifers (Yearlings)",
    desc: "Immature female cows progressing towards first service. Needs balanced nutrition to support skeleton frame development and lean muscle tissue without fattening udders.",
    cpRange: "14.0% - 15.5%",
    meRange: "9.8 - 10.5 MJ/kg",
    intake: "8 - 10 kg DM/day",
    ingredients: "Lucerne Hay Hay, Wheat Pollard, Cotton Cake, Sweet Potato Vines, DCP"
  },
  {
    grp: "Dairy",
    stage: "Fattening Beef Steers",
    desc: "Male cattle growing continuously for meat production. Requires high energy starch finishes to accelerate intramuscular marbling and weight gain scores.",
    cpRange: "12.5% - 13.8%",
    meRange: "11.0 - 11.8 MJ/kg",
    intake: "9 - 11 kg DM/day",
    ingredients: "Maize Germ Meal, Brewer's Spent Grain, Molasses, Vet Spray checks"
  },
  {
    grp: "Poultry",
    stage: "Poultry Layers (Active Laying)",
    desc: "Hens producing marketable table eggs. Extremely high requirement for Calcium and Crude Protein to ensure correct egg size and dynamic shell thickness strength.",
    cpRange: "17.5% - 18.5%",
    meRange: "11.0 - 11.5 MJ/kg",
    intake: "110g - 125g / day",
    ingredients: "Lime/Limestone, Soya Meal, Oyster Shell Premium, Sunflower Cakes, Fish Meal"
  },
  {
    grp: "Poultry",
    stage: "Poultry Broiler Finisher",
    desc: "Fast-growing meat birds in final market stages. Energy demands are extreme to maximize breast meat percentage ratios and fat yield parameters.",
    cpRange: "19.5% - 21.0%",
    meRange: "12.0 - 12.6 MJ/kg",
    intake: "130g - 160g / day",
    ingredients: "Maize Germ Meal, Premium Soya Bean Meal, Fish Meal (60% Protein), Broiler Booster"
  },
  {
    grp: "Poultry",
    stage: "Kienyeji / Free-Range Chicken",
    desc: "Improved and indigenous free-roaming hens. Resilient and adaptable but require balanced supplement mash to significantly improve egg laying frequency.",
    cpRange: "14.5% - 16.0%",
    meRange: "10.0 - 10.8 MJ/kg",
    intake: "95g - 115g / day",
    ingredients: "Wheat Pollard, Maize Germ, Sunflower Seed Cake, Limestone Powder"
  },
  {
    grp: "Calves",
    stage: "Young Calves (Starter Phase)",
    desc: "Delicate weaning phase (0-3 months) developing rumen capacity. Highly digestible protein sources prevent diarrhea while encouraging skeletal posture.",
    cpRange: "18.0% - 19.5%",
    meRange: "11.5 - 12.2 MJ/kg",
    intake: "1.0 - 2.5 kg DM/day",
    ingredients: "Toddler Calf Tonic, Soya Bean Meal, Maize Germ Meal, Fine Limestone Grit"
  },
  {
    grp: "Ducks",
    stage: "Laying Ducks complete",
    desc: "Laying ducks have slightly higher niacin and water-solubles requirements than chickens, and demand coarse grits to withstand continuous eggshell release schedules.",
    cpRange: "17.0% - 18.0%",
    meRange: "10.5 - 11.0 MJ/kg",
    intake: "150g - 190g / day",
    ingredients: "Lime Powder, Soya Bean, Fish Meal, Oyster Shell Premium, Rice Bran"
  }
];

export function FeedFormulator({ ingredients, onAddIngredientToLib, onDeleteIngredientToLib, onTriggerSectionReport, onAddInventoryItem }: FeedFormulatorProps) {
  // New laboratory ingredient state
  const [libName, setLibName] = useState('');
  const [libCp, setLibCp] = useState<number | ''>('');
  const [libMe, setLibMe] = useState<number | ''>('');
  const [libCost, setLibCost] = useState<number | ''>('');
  const [libCategory, setLibCategory] = useState<'Fodder' | 'Concentrate' | 'Mineral' | 'Poultry' | 'Calf' | 'Duck'>('Fodder');

  // Animal Requirements tab state
  const [requirementsTab, setRequirementsTab] = useState<'All' | 'Dairy' | 'Poultry' | 'Calves' | 'Ducks'>('All');
  const requirementsScrollRef = React.useRef<HTMLDivElement>(null);
  const scrollRequirements = (direction: 'left' | 'right') => {
    if (requirementsScrollRef.current) {
      const scrollAmount = 380;
      requirementsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Library searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'Fodder' | 'Concentrate' | 'Mineral' | 'Poultry' | 'Calf' | 'Duck'>('All');
  const [visibleCount, setVisibleCount] = useState(30);

  React.useEffect(() => {
    setVisibleCount(30);
  }, [searchQuery, activeCategoryFilter]);

  // Target Preset Tab selection
  const [activePresetTab, setActivePresetTab] = useState<'dairy' | 'poultry' | 'calves' | 'ducks'>('dairy');

  // Formulation modes: 'sandbox' (manual entry) vs 'lcf' (least-cost formulation optimizer)
  const [formulationMode, setFormulationMode] = useState<'sandbox' | 'lcf'>('sandbox');

  // Least Cost Feed Formulation (LCF) states
  const [lcfTargetCp, setLcfTargetCp] = useState<number>(18.0);
  const [lcfTargetMe, setLcfTargetMe] = useState<number>(11.5);
  const [lcfCandidates, setLcfCandidates] = useState<{ name: string; cp: number; me: number; cost: number; minLimit: number; maxLimit: number; enabled: boolean }[]>([
    { name: 'Maize Germ Meal', cp: 11.0, me: 12.0, cost: 35, minLimit: 10, maxLimit: 60, enabled: true },
    { name: 'Soya Bean Meal (Solvent)', cp: 44.0, me: 13.5, cost: 95, minLimit: 5, maxLimit: 30, enabled: true },
    { name: 'Wheat Pollard Base', cp: 15.0, me: 11.5, cost: 32, minLimit: 10, maxLimit: 40, enabled: true },
    { name: 'Cotton Seed Cake (Expeller)', cp: 38.0, me: 10.5, cost: 58, minLimit: 5, maxLimit: 25, enabled: true },
    { name: 'Dicalcium Phosphate (DCP)', cp: 0.1, me: 0, cost: 180, minLimit: 1, maxLimit: 3, enabled: true },
    { name: 'Lime / Limestone Powder', cp: 0.1, me: 0, cost: 15, minLimit: 1, maxLimit: 4, enabled: true }
  ]);
  const [lcfResult, setLcfResult] = useState<{
    weights: number[];
    cost: number;
    cp: number;
    me: number;
    isFeasible: boolean;
    cpDev: number;
    meDev: number;
  } | null>(null);
  const [isLcfSolving, setIsLcfSolving] = useState(false);

  // LCF sub mode: 'simplex' (Multi-Ingredient LP) vs 'pearsons' (Pearson's Square)
  const [lcfSubMode, setLcfSubMode] = useState<'simplex' | 'pearsons'>('simplex');

  // Pearson's Square States
  const [pearsonsIngA, setPearsonsIngA] = useState<string>('Soya Bean Meal (Solvent)');
  const [pearsonsIngB, setPearsonsIngB] = useState<string>('Maize Germ Meal');
  const [pearsonsTargetCp, setPearsonsTargetCp] = useState<number>(16.0);
  const [pearsonsTotalWeight, setPearsonsTotalWeight] = useState<number>(100);

  const [lcfSearchQuery, setLcfSearchQuery] = useState('');
  const [isLcfSearchDropdownOpen, setIsLcfSearchDropdownOpen] = useState(false);

  // Generate the full 500+ ingredients
  const allIngredients = React.useMemo(() => {
    return generate500Ingredients(ingredients);
  }, [ingredients]);

  // Pearson's Square Solver logic
  const pearsonsResult = React.useMemo(() => {
    const aObj = allIngredients.find(i => i.name === pearsonsIngA) || { name: 'Soya Bean Meal (Solvent)', cp: 44, me: 13.5, cost: 95 };
    const bObj = allIngredients.find(i => i.name === pearsonsIngB) || { name: 'Maize Germ Meal', cp: 11, me: 12.0, cost: 35 };

    const cpA = aObj.cp;
    const cpB = bObj.cp;
    const target = pearsonsTargetCp;

    // We need target to be strictly between cpA and cpB.
    const isFeasible = (target > cpA && target < cpB) || (target > cpB && target < cpA);

    if (!isFeasible) {
      return {
        isFeasible: false,
        msg: `Infeasible: Target CP (${target}%) must be between the Crude Protein levels of the two selected ingredients (A: ${cpA}%, B: ${cpB}%).`,
        aObj,
        bObj,
        partsA: 0,
        partsB: 0,
        totalParts: 0,
        pctA: 0,
        pctB: 0,
        kgA: 0,
        kgB: 0,
        totalCost: 0,
        avgCostPerKg: 0,
        avgMe: 0
      };
    }

    // Parts are calculated diagonally
    const partsA = Math.abs(cpB - target);
    const partsB = Math.abs(cpA - target);
    const totalParts = partsA + partsB;

    const pctA = (partsA / totalParts) * 100;
    const pctB = (partsB / totalParts) * 100;

    const kgA = (pctA / 100) * pearsonsTotalWeight;
    const kgB = (pctB / 100) * pearsonsTotalWeight;

    const costA = kgA * (aObj.cost || 0);
    const costB = kgB * (bObj.cost || 0);
    const totalCost = costA + costB;
    const avgCostPerKg = totalCost / pearsonsTotalWeight;

    const avgMe = (pctA * aObj.me + pctB * bObj.me) / 100;

    return {
      isFeasible: true,
      aObj,
      bObj,
      partsA,
      partsB,
      totalParts,
      pctA,
      pctB,
      kgA,
      kgB,
      totalCost,
      avgCostPerKg,
      avgMe
    };
  }, [allIngredients, pearsonsIngA, pearsonsIngB, pearsonsTargetCp, pearsonsTotalWeight]);

  const handleApplyPearsonsToBatch = () => {
    if (!pearsonsResult.isFeasible) return;
    const newItems = [
      {
        id: `b-pearsons-a-${Date.now()}`,
        name: pearsonsResult.aObj.name,
        amount: parseFloat(pearsonsResult.kgA.toFixed(1))
      },
      {
        id: `b-pearsons-b-${Date.now()}`,
        name: pearsonsResult.bObj.name,
        amount: parseFloat(pearsonsResult.kgB.toFixed(1))
      }
    ];
    setBatchItems(newItems);
    setFormulationMode('sandbox');
    alert(`🎯 Applied Pearson's Square formulation (${pearsonsResult.pctA.toFixed(1)}% / ${pearsonsResult.pctB.toFixed(1)}%) to the Compounding Board!`);
  };

  // Available candidates that can be added (not already in candidates list)
  const availableCandidatesToAdd = React.useMemo(() => {
    return allIngredients.filter(
      (ing) => !lcfCandidates.some((c) => c.name.toLowerCase() === ing.name.toLowerCase())
    );
  }, [allIngredients, lcfCandidates]);

  // Search results for adding candidates
  const filteredCandidatesToAdd = React.useMemo(() => {
    if (!lcfSearchQuery.trim()) return [];
    return availableCandidatesToAdd.filter((ing) =>
      ing.name.toLowerCase().includes(lcfSearchQuery.toLowerCase()) ||
      (ing.category && ing.category.toLowerCase().includes(lcfSearchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [availableCandidatesToAdd, lcfSearchQuery]);

  const handleAddLcfCandidate = (ing: Ingredient) => {
    if (lcfCandidates.some(c => c.name.toLowerCase() === ing.name.toLowerCase())) {
      alert(`${ing.name} is already listed as a candidate.`);
      return;
    }
    setLcfCandidates([
      ...lcfCandidates,
      {
        name: ing.name,
        cp: ing.cp,
        me: ing.me,
        cost: ing.cost || 40,
        minLimit: 0,
        maxLimit: 100,
        enabled: true
      }
    ]);
    setLcfSearchQuery('');
    setIsLcfSearchDropdownOpen(false);
  };

  const filteredAnimalRequirements = React.useMemo(() => {
    if (requirementsTab === 'All') return ANIMAL_NUTRITION_STANDARDS;
    return ANIMAL_NUTRITION_STANDARDS.filter(item => item.grp === requirementsTab);
  }, [requirementsTab]);

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

  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [isRecipeSearchDropdownOpen, setIsRecipeSearchDropdownOpen] = useState(false);

  const availableRecipeIngredientsToAdd = React.useMemo(() => {
    return allIngredients.filter(
      (ing) => !batchItems.some((b) => b.name.toLowerCase() === ing.name.toLowerCase())
    );
  }, [allIngredients, batchItems]);

  const filteredRecipeIngredientsToAdd = React.useMemo(() => {
    if (!recipeSearchQuery.trim()) return [];
    return availableRecipeIngredientsToAdd.filter((ing) =>
      ing.name.toLowerCase().includes(recipeSearchQuery.toLowerCase()) ||
      (ing.category && ing.category.toLowerCase().includes(recipeSearchQuery.toLowerCase()))
    ).slice(0, 8);
  }, [availableRecipeIngredientsToAdd, recipeSearchQuery]);

  const handleAddIngredientToBatch = (ing: Ingredient) => {
    if (batchItems.some((b) => b.name.toLowerCase() === ing.name.toLowerCase())) {
      alert(`${ing.name} is already in the recipe compounding board.`);
      return;
    }
    setBatchItems([
      ...batchItems,
      {
        id: `b-${Date.now()}-${Math.random()}`,
        name: ing.name,
        amount: 10
      }
    ]);
    setRecipeSearchQuery('');
    setIsRecipeSearchDropdownOpen(false);
  };

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

  const handleSolveLCF = () => {
    setIsLcfSolving(true);
    setLcfResult(null);

    setTimeout(() => {
      const enabledList = lcfCandidates.filter(c => c.enabled);
      if (enabledList.length < 2) {
        setIsLcfSolving(false);
        alert("Please enable at least 2 raw materials for the LCF solver.");
        return;
      }

      // Objective: meet lcfTargetCp and lcfTargetMe at minimum cost per 100g weight
      const n = enabledList.length;
      let bestW = enabledList.map(c => (c.minLimit + c.maxLimit) / 2);
      // Normalize to sum to 100
      let initSum = bestW.reduce((a,b)=>a+b, 0) || 1;
      bestW = bestW.map(w => (w / initSum) * 100);

      const evaluate = (w: number[]) => {
        let totCost = 0;
        let totCp = 0;
        let totMe = 0;
        let totW = 0;
        let boundsViolation = 0;

        for (let i = 0; i < n; i++) {
          totW += w[i];
          totCost += (w[i] / 100) * enabledList[i].cost;
          totCp += (w[i] / 100) * enabledList[i].cp;
          totMe += (w[i] / 100) * enabledList[i].me;

          // Check bound limits
          if (w[i] < enabledList[i].minLimit) {
            boundsViolation += (enabledList[i].minLimit - w[i]) * 1500;
          }
          if (w[i] > enabledList[i].maxLimit) {
            boundsViolation += (w[i] - enabledList[i].maxLimit) * 1500;
          }
        }

        const cpDev = Math.abs(totCp - lcfTargetCp);
        const meDev = Math.abs(totMe - lcfTargetMe);
        const weightDev = Math.abs(totW - 100);

        // Huge weights to lock nutrition and total weight
        const score = totCost + (cpDev * 1200) + (meDev * 800) + (weightDev * 20000) + boundsViolation;
        return { score, cost: totCost, cp: totCp, me: totMe, cpDev, meDev, weightDev };
      };

      let bestScore = evaluate(bestW).score;
      let temp = 20.0;
      const cool = 0.992;

      // Iterative Optimization Cycle
      for (let step = 0; step < 20000; step++) {
        let mutated = [...bestW];
        const i1 = Math.floor(Math.random() * n);
        const i2 = Math.floor(Math.random() * n);
        
        if (i1 !== i2) {
          const delta = (Math.random() - 0.5) * temp;
          mutated[i1] = Math.max(enabledList[i1].minLimit, Math.min(enabledList[i1].maxLimit, mutated[i1] + delta));
          mutated[i2] = Math.max(enabledList[i2].minLimit, Math.min(enabledList[i2].maxLimit, mutated[i2] - delta));
        }

        // Re-scale to 100
        const currentSum = mutated.reduce((acc, v) => acc + v, 0) || 1;
        mutated = mutated.map(v => (v / currentSum) * 100);

        // Project back to limits and re-normalize again
        for (let i = 0; i < n; i++) {
          mutated[i] = Math.max(enabledList[i].minLimit, Math.min(enabledList[i].maxLimit, mutated[i]));
        }
        const currentSum2 = mutated.reduce((acc, v) => acc + v, 0) || 1;
        mutated = mutated.map(v => (v / currentSum2) * 100);

        const scoreObj = evaluate(mutated);
        if (scoreObj.score < bestScore) {
          bestScore = scoreObj.score;
          bestW = [...mutated];
        }
        temp *= cool;
      }

      // Final evaluation of best parameters
      const finalEval = evaluate(bestW);
      const isFeasible = finalEval.cpDev < 1.2 && finalEval.meDev < 1.0;

      setLcfResult({
        weights: bestW.map(w => Math.round(w * 10) / 10),
        cost: Math.round(finalEval.cost * 100) / 100,
        cp: Math.round(finalEval.cp * 10) / 10,
        me: Math.round(finalEval.me * 10) / 10,
        isFeasible,
        cpDev: finalEval.cpDev,
        meDev: finalEval.meDev
      });
      setIsLcfSolving(false);
    }, 450);
  };

  const handleApplyLcfToBatch = () => {
    if (!lcfResult) return;
    const enabledList = lcfCandidates.filter(c => c.enabled);
    const newItems = enabledList.map((c, idx) => {
      const amount = lcfResult.weights[idx];
      return {
        id: `b-lcf-${idx}-${Date.now()}`,
        name: c.name,
        amount: amount
      };
    }).filter(item => item.amount > 0);

    setBatchItems(newItems);
    setFormulationMode('sandbox');
    alert("🚀 Successfully synchronized the optimized Least Cost Formulation ratios to your Recipe Compounding Board!");
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
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
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
        {onTriggerSectionReport && (
          <button
            onClick={() => onTriggerSectionReport('formula')}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 shrink-0 self-start sm:self-center border border-amber-600/10 font-bold"
            title="Download Feed Formula PDF Report"
          >
            <Download size={13} />
            Download PDF Report
          </button>
        )}
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
                <>
                  {filteredIngredients.slice(0, visibleCount).map((ing) => (
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
                          className="text-slate-305 hover:text-red-656 text-slate-400 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0"
                          title="Delete Material"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredIngredients.length > visibleCount && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 50)}
                      className="w-full text-center py-2 text-[10px] font-black uppercase text-emerald-800 hover:text-emerald-950 bg-slate-100/60 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/80 mt-2 cursor-pointer"
                    >
                      Show More (+{filteredIngredients.length - visibleCount} more items)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Custom Batch Formulating Engine */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          {/* Mode Selector Tabs */}
          <div className="flex border-b border-slate-100 pb-2 gap-4">
            <button
              type="button"
              onClick={() => setFormulationMode('sandbox')}
              className={`pb-2.5 px-1 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                formulationMode === 'sandbox'
                  ? 'border-emerald-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              🛠️ Manual Compounding Sandbox
            </button>
            <button
              type="button"
              onClick={() => setFormulationMode('lcf')}
              className={`pb-2.5 px-1 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                formulationMode === 'lcf'
                  ? 'border-emerald-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ⚙️ Least-Cost Feed (LCF) Optimizer
            </button>
          </div>

          {formulationMode === 'sandbox' ? (
            <div className="space-y-6 animate-fadeIn">
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
            <div>
              <h5 className="text-[11px] font-black tracking-widest text-emerald-900 uppercase">Recipe Compounding Board</h5>
              <p className="text-xs text-slate-400 mt-1 font-medium">Add materials and specify relative weights (kilograms) in formula</p>
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase shrink-0">
              ⚡ Lag-free 500+ Material Querying
            </div>
          </div>

          {/* New Optimized Material Select & Search Section */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3 relative">
            <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <span>➕</span> Search & Choose ingredients to add
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">
                Find exactly what you want from the full catalog
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Quick Select Popular Materials Dropdown */}
              <div>
                <select
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const found = allIngredients.find(ing => ing.name === e.target.value);
                    if (found) {
                      handleAddIngredientToBatch(found);
                    }
                    e.target.value = '';
                  }}
                  className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 w-full font-bold text-slate-700 outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>--- Quick Add Popular Material ---</option>
                  {availableRecipeIngredientsToAdd.slice(0, 30).map((ing) => (
                    <option key={ing.name} value={ing.name}>
                      {ing.name} ({ing.cp}% CP, {ing.me} MJ)
                    </option>
                  ))}
                </select>
              </div>

              {/* Autocomplete Input Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search 500+ materials..."
                  value={recipeSearchQuery}
                  onChange={(e) => {
                    setRecipeSearchQuery(e.target.value);
                    setIsRecipeSearchDropdownOpen(true);
                  }}
                  onFocus={() => setIsRecipeSearchDropdownOpen(true)}
                  className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 w-full font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {recipeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecipeSearchQuery('');
                      setIsRecipeSearchDropdownOpen(false);
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}

                {/* Auto-suggest dropdown results */}
                {isRecipeSearchDropdownOpen && filteredRecipeIngredientsToAdd.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredRecipeIngredientsToAdd.map((ing) => (
                      <button
                        key={ing.name}
                        type="button"
                        onClick={() => {
                          handleAddIngredientToBatch(ing);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-extrabold text-slate-800 block truncate">{ing.name}</span>
                          {ing.category && (
                            <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 rounded uppercase font-black tracking-wider">
                              {ing.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          <span className="font-mono font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                            {ing.cp}% CP
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-0.5 font-mono">
                            {ing.me} MJ
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {isRecipeSearchDropdownOpen && recipeSearchQuery && filteredRecipeIngredientsToAdd.length === 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl p-3 shadow-lg z-30 text-center text-[10px] text-slate-400 italic">
                    No matching unadded library materials.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Compounding Board Recipe List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {batchItems.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <p className="text-slate-500 font-extrabold text-sm uppercase">Get Started by Choosing Materials</p>
                <p className="text-slate-400 text-xs mt-1">Use the quick dropdown or type to search ingredients above to begin compounding.</p>
              </div>
            ) : (
              batchItems.map((item) => {
                const rawIng = allIngredients.find((i) => i.name === item.name);
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-slate-50/70 border border-slate-100 p-4 rounded-2xl transition-all hover:bg-slate-50 hover:border-slate-250">
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm block truncate" title={item.name}>
                          {item.name}
                        </span>
                        {rawIng?.category && (
                          <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-black tracking-widest shrink-0">
                            {rawIng.category}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 items-center">
                        <span className="text-[10px] text-emerald-800 font-extrabold font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                          {rawIng?.cp ?? 0}% CP
                        </span>
                        <span className="text-[10px] text-sky-800 font-extrabold font-mono bg-sky-50 px-1.5 py-0.5 rounded">
                          {rawIng?.me ?? 0} MJ/kg
                        </span>
                        {rawIng?.cost && (
                          <span className="text-[10px] text-slate-500 font-bold">
                            Ksh {rawIng.cost}/kg
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      {/* Weight Input */}
                      <div className="w-32 flex items-center gap-2">
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="0.1"
                          value={item.amount}
                          onChange={(e) => handleUpdateBatchAmount(item.id, parseFloat(e.target.value) || 0)}
                          placeholder="KG"
                          className="text-xs border border-slate-200 rounded-xl p-2.5 w-full bg-white text-right font-mono font-black text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase font-mono">KG</span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchItem(item.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-55 px-2.5 py-2.5 rounded-xl transition-all cursor-pointer m-0 border border-transparent hover:border-red-100"
                        title="Remove ingredient"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
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

              {/* Dynamic TMR sync cross-link banner */}
              <div className="p-4 rounded-xl border border-[#0d3621]/20 bg-[#0d3621]/5 text-xs flex items-center gap-3">
                <Sparkles size={20} className="shrink-0 text-emerald-800 animate-pulse" />
                <div className="text-left">
                  <span className="font-extrabold uppercase tracking-wide block text-[#0d3621]">✨ Cross-Module Wagon Sync Active:</span>
                  <p className="mt-0.5 font-semibold text-slate-650">
                    Your active recipe is automatically saved. Jump over to the **TMR Mixing** tab and toggle **"Use Lab formulation ratios"** to dynamically load these exact proportions into your daily mixer bucket feed seq!
                  </p>
                </div>
              </div>
 
              {/* Export to warehouse stock button */}
              {onAddInventoryItem && (
                <button
                  type="button"
                  onClick={() => {
                    const mixName = prompt("Enter a custom name for this compounded feed mix lot:", `Compounded Herd Ration (${averageCp.toFixed(1)}% CP)`);
                    if (!mixName) return;
                    onAddInventoryItem({
                      id: `comp-feed-${Date.now()}`,
                      name: mixName,
                      category: 'Feed',
                      quantity: totalWeight,
                      unit: 'kg',
                      minStock: 100,
                      notes: `Formulated recipe: ${averageCp.toFixed(1)}% CP, ${averageMe.toFixed(1)} MJ/kg ME. Cost: KES ${averageCostPerKg.toFixed(1)}/kg.`,
                      deductions: batchItems.map(item => ({ name: item.name, amount: item.amount }))
                    });
                    alert(`✓ Successfully exported ${totalWeight.toFixed(1)} KG of "${mixName}" to your Warehouse Inventory stock list!`);
                  }}
                  className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer m-0 text-center shadow flex items-center justify-center gap-2"
                >
                  <Plus size={14} className="text-emerald-300" />
                  Export Compounding Mix to Warehouse Inventory
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-center">
              <span className="text-xs text-slate-400 font-extrabold">Batch parameters currently zero. Add ingredients and weights to compute diagnostics.</span>
            </div>
          )}
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn text-left">
              {/* LCF UI Header */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">LINEAR OPTIMAL MATRIX SOLVER</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase">Least-Cost Formulations (LCF)</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Minimize formulation costs mathematically</h4>
                <p className="text-xs text-slate-300 leading-normal font-medium">
                  Optimize your feed formulations using advanced mathematical calculators. Choose between classical Pearson's Square (for 2-ingredient blends) or Multi-Ingredient Simplex LP.
                </p>
              </div>

              {/* LCF Sub-Tabs Selector */}
              <div className="flex border-b border-slate-200 pb-1 gap-6">
                <button
                  type="button"
                  onClick={() => setLcfSubMode('simplex')}
                  className={`pb-2.5 px-1 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    lcfSubMode === 'simplex'
                      ? 'border-emerald-700 text-slate-800 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📊 Multi-Ingredient Simplex LP
                </button>
                <button
                  type="button"
                  onClick={() => setLcfSubMode('pearsons')}
                  className={`pb-2.5 px-1 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    lcfSubMode === 'pearsons'
                      ? 'border-emerald-700 text-slate-800 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📐 Pearson's Square (2-Ingredients)
                </button>
              </div>

              {lcfSubMode === 'pearsons' ? (
                /* Pearson's Square Interface */
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-50 p-5 border rounded-2xl border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Controls */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Formulation Ratios Controls</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Select your basal and protein concentrates</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                            🥩 Ingredient A (High Protein/Concentrate)
                          </label>
                          <select
                            value={pearsonsIngA}
                            onChange={(e) => setPearsonsIngA(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 w-full font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            {allIngredients.filter(i => i.cp >= 15).map((ing) => (
                              <option key={`p-a-${ing.name}`} value={ing.name}>
                                {ing.name} ({ing.cp}% CP, Ksh {ing.cost || 0}/kg)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                            🌽 Ingredient B (Low Protein/Basal Feed)
                          </label>
                          <select
                            value={pearsonsIngB}
                            onChange={(e) => setPearsonsIngB(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 w-full font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            {allIngredients.filter(i => i.cp < 15).map((ing) => (
                              <option key={`p-b-${ing.name}`} value={ing.name}>
                                {ing.name} ({ing.cp}% CP, Ksh {ing.cost || 0}/kg)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                              🎯 Target CP %: <span className="text-emerald-800 font-extrabold font-mono">{pearsonsTargetCp}%</span>
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="50"
                              step="0.5"
                              value={pearsonsTargetCp}
                              onChange={(e) => setPearsonsTargetCp(parseFloat(e.target.value) || 16)}
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                              ⚖️ Total Batch Size (kg):
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10000"
                              value={pearsonsTotalWeight}
                              onChange={(e) => setPearsonsTotalWeight(parseFloat(e.target.value) || 100)}
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SVG Square Diagram */}
                    <div className="flex items-center justify-center bg-slate-900 rounded-2xl p-4 border border-slate-800">
                      <svg width="100%" height="220" viewBox="0 0 450 220" className="font-mono text-[10px] font-bold max-w-full">
                        {/* Diagonals */}
                        <line x1="120" x2="330" y1="30" y2="190" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="120" x2="330" y1="190" y2="30" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />

                        {/* Top-Left Box: Ingredient A */}
                        <g transform="translate(10, 10)">
                          <rect width="110" height="40" rx="6" fill="#0f172a" stroke="#059669" strokeWidth="1.5" />
                          <text x="55" y="15" fill="#34d399" textAnchor="middle" fontSize="9" fontWeight="black">A: {pearsonsResult.aObj.name.substring(0, 15)}...</text>
                          <text x="55" y="30" fill="#f59e0b" textAnchor="middle" fontSize="11" fontWeight="black">{pearsonsResult.aObj.cp}% CP</text>
                        </g>

                        {/* Bottom-Left Box: Ingredient B */}
                        <g transform="translate(10, 170)">
                          <rect width="110" height="40" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
                          <text x="55" y="15" fill="#60a5fa" textAnchor="middle" fontSize="9" fontWeight="black">B: {pearsonsResult.bObj.name.substring(0, 15)}...</text>
                          <text x="55" y="30" fill="#f59e0b" textAnchor="middle" fontSize="11" fontWeight="black">{pearsonsResult.bObj.cp}% CP</text>
                        </g>

                        {/* Center Circle: Target CP */}
                        <g transform="translate(195, 85)">
                          <rect width="60" height="48" rx="24" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
                          <text x="30" y="20" fill="#10b981" textAnchor="middle" fontSize="8" fontWeight="extrabold">TARGET</text>
                          <text x="30" y="36" fill="#ffffff" textAnchor="middle" fontSize="14" fontWeight="black">{pearsonsTargetCp}%</text>
                        </g>

                        {/* Top-Right Box: Parts of A */}
                        <g transform="translate(330, 10)">
                          <rect width="110" height="40" rx="6" fill="#0f172a" stroke="#059669" strokeWidth="1.5" />
                          <text x="55" y="15" fill="#34d399" textAnchor="middle" fontSize="9" fontWeight="black">PARTS OF A</text>
                          <text x="55" y="30" fill="#ffffff" textAnchor="middle" fontSize="11" fontWeight="black">{pearsonsResult.partsA.toFixed(1)} Parts</text>
                        </g>

                        {/* Bottom-Right Box: Parts of B */}
                        <g transform="translate(330, 170)">
                          <rect width="110" height="40" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
                          <text x="55" y="15" fill="#60a5fa" textAnchor="middle" fontSize="9" fontWeight="black">PARTS OF B</text>
                          <text x="55" y="30" fill="#ffffff" textAnchor="middle" fontSize="11" fontWeight="black">{pearsonsResult.partsB.toFixed(1)} Parts</text>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* Calculations Details Output */}
                  {pearsonsResult.isFeasible ? (
                    <div className="bg-[#0f172a] text-slate-100 p-6 rounded-3xl space-y-5 border border-slate-800">
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">Pearson's Square Formulation Result</span>
                          <h4 className="text-sm font-black text-white mt-0.5 uppercase">Exact 2-Ingredient Balancing Complete</h4>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-emerald-500 text-slate-950">
                          100% Balanced CP% Target
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Ingredient A details */}
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-left">
                          <span className="text-[9px] text-emerald-400 block uppercase font-bold truncate max-w-full">{pearsonsResult.aObj.name}</span>
                          <h3 className="text-xl font-black text-white font-mono">{pearsonsResult.pctA.toFixed(1)}%</h3>
                          <p className="text-xs text-slate-400 font-semibold font-mono">
                            {pearsonsResult.kgA.toFixed(1)} kg of formula
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold font-mono">
                            Cost: Ksh {(pearsonsResult.kgA * (pearsonsResult.aObj.cost || 0)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </p>
                        </div>

                        {/* Ingredient B details */}
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-left">
                          <span className="text-[9px] text-sky-400 block uppercase font-bold truncate max-w-full">{pearsonsResult.bObj.name}</span>
                          <h3 className="text-xl font-black text-white font-mono">{pearsonsResult.pctB.toFixed(1)}%</h3>
                          <p className="text-xs text-slate-400 font-semibold font-mono">
                            {pearsonsResult.kgB.toFixed(1)} kg of formula
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold font-mono">
                            Cost: Ksh {(pearsonsResult.kgB * (pearsonsResult.bObj.cost || 0)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </p>
                        </div>

                        {/* Aggregates */}
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-left">
                          <span className="text-[9px] text-amber-400 block uppercase font-bold">Combined Feed Metrics</span>
                          <h3 className="text-sm font-black text-white font-mono">Total: Ksh {pearsonsResult.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                          <p className="text-xs text-slate-400 font-semibold font-mono">
                            Unit Cost: Ksh {pearsonsResult.avgCostPerKg.toFixed(1)}/kg
                          </p>
                          <p className="text-[10px] text-sky-400 font-extrabold font-mono uppercase tracking-wide">
                            Energy: {pearsonsResult.avgMe.toFixed(1)} MJ/kg
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-[11px] space-y-1">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-left">🎓 Mathematical Steps of Pearson Square formulation:</span>
                        <p className="text-slate-350 leading-relaxed font-semibold text-left">
                          1. Subtract diagonally: Ingredient A parts = |{pearsonsResult.bObj.cp}% - {pearsonsTargetCp}%| = {pearsonsResult.partsA.toFixed(1)} parts.<br />
                          2. Subtract diagonally: Ingredient B parts = |{pearsonsResult.aObj.cp}% - {pearsonsTargetCp}%| = {pearsonsResult.partsB.toFixed(1)} parts.<br />
                          3. Sum of parts: {pearsonsResult.partsA.toFixed(1)} + {pearsonsResult.partsB.toFixed(1)} = {pearsonsResult.totalParts.toFixed(1)} total parts.<br />
                          4. Ingredient A percentage: ({pearsonsResult.partsA.toFixed(1)} / {pearsonsResult.totalParts.toFixed(1)}) * 100 = {pearsonsResult.pctA.toFixed(1)}%.<br />
                          5. Ingredient B percentage: ({pearsonsResult.partsB.toFixed(1)} / {pearsonsResult.totalParts.toFixed(1)}) * 100 = {pearsonsResult.pctB.toFixed(1)}%.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyPearsonsToBatch}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-center cursor-pointer m-0 border-none"
                      >
                        ⚡ APPLY PEARSON BLEND TO RECIPE COMPOUNDING BOARD
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-950/40 text-red-200 border border-red-900/50 p-6 rounded-2xl space-y-2 text-left">
                      <h5 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                        ⚠️ Mathematical Constraint Violated
                      </h5>
                      <p className="text-xs leading-relaxed font-medium">
                        {pearsonsResult.msg}
                      </p>
                      <p className="text-[11px] text-slate-400 italic">
                        Tip: To formulate a {pearsonsTargetCp}% protein blend, one ingredient must have a protein level HIGHER than {pearsonsTargetCp}% (e.g., Soya at {pearsonsResult.aObj.cp}%), and the other must be LOWER (e.g., Maize at {pearsonsResult.bObj.cp}%). Adjust your selections to resolve this constraint.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Original Multi-Ingredient Solver Interface */
                <div className="space-y-6 animate-fadeIn">
                  {/* Targets Setup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 border rounded-2xl border-slate-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        🎯 Target Crude Protein Score: <span className="font-mono text-emerald-800 font-extrabold text-xs">{lcfTargetCp}% CP</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        step="0.5"
                        value={lcfTargetCp}
                        onChange={(e) => setLcfTargetCp(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-800"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                        <span>10% CP (MAINTENANCE)</span>
                        <span>40% CP (HIGH NITROGEN)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        ⚡ Target Metabolizable Energy: <span className="font-mono text-emerald-800 font-extrabold text-xs">{lcfTargetMe} MJ/kg</span>
                      </label>
                      <input
                        type="range"
                        min="7"
                        max="14"
                        step="0.1"
                        value={lcfTargetMe}
                        onChange={(e) => setLcfTargetMe(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-800"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                        <span>7 MJ (ROUGHAGE)</span>
                        <span>14 MJ (HIGH ENERGY FAT)</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidates Inventory Header */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[10.5px] uppercase font-black text-slate-800 tracking-wider">Candidate Feedstuffs list & inclusion bounds</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Toggle / Buy Price (KSH)</span>
                    </div>

                    {/* Search & Add candidates section */}
                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3 relative">
                      <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                          <span>➕</span> Add candidate raw materials to matrix
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">
                          Select below or search the 500+ material library
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Quick select dropdown */}
                        <div>
                          <select
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const found = allIngredients.find(ing => ing.name === e.target.value);
                              if (found) {
                                handleAddLcfCandidate(found);
                              }
                              e.target.value = '';
                            }}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 w-full font-bold text-slate-700 outline-none cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>--- Quick Add Popular Material ---</option>
                            {availableCandidatesToAdd.slice(0, 30).map((ing) => (
                              <option key={ing.name} value={ing.name}>
                                {ing.name} ({ing.cp}% CP, {ing.me} MJ)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Filtered Search input */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search & add from 550+ ingredients..."
                            value={lcfSearchQuery}
                            onChange={(e) => {
                              setLcfSearchQuery(e.target.value);
                              setIsLcfSearchDropdownOpen(true);
                            }}
                            onFocus={() => setIsLcfSearchDropdownOpen(true)}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 w-full font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          {lcfSearchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setLcfSearchQuery('');
                                setIsLcfSearchDropdownOpen(false);
                              }}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}

                          {/* Dropdown search results */}
                          {isLcfSearchDropdownOpen && filteredCandidatesToAdd.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                              {filteredCandidatesToAdd.map((ing) => (
                                <button
                                  key={ing.name}
                                  type="button"
                                  onClick={() => {
                                    handleAddLcfCandidate(ing);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs"
                                >
                                  <div className="min-w-0 pr-2">
                                    <span className="font-extrabold text-slate-800 block truncate">{ing.name}</span>
                                    {ing.category && (
                                      <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 rounded uppercase font-black tracking-wider">
                                        {ing.category}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0 flex items-center gap-1.5">
                                    <span className="font-mono font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                                      {ing.cp}% CP
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5 font-mono">
                                      {ing.me} MJ
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {isLcfSearchDropdownOpen && lcfSearchQuery && filteredCandidatesToAdd.length === 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl p-3 shadow-lg z-30 text-center text-[10px] text-slate-400 italic">
                              No matching unadded library materials.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {lcfCandidates.map((cand, idx) => (
                        <div key={cand.name} className={`p-4 border rounded-2xl flex flex-col justify-between transition-all ${
                          cand.enabled ? 'bg-white border-slate-200 ring-1 ring-emerald-500/5' : 'bg-slate-50/50 border-slate-100 opacity-60'
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={cand.enabled}
                                onChange={(e) => {
                                  const updated = [...lcfCandidates];
                                  updated[idx].enabled = e.target.checked;
                                  setLcfCandidates(updated);
                                }}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-505 accent-emerald-800 mt-0.5 shrink-0 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 block truncate leading-tight max-w-[140px]" title={cand.name}>{cand.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = lcfCandidates.filter((_, cIdx) => cIdx !== idx);
                                      setLcfCandidates(updated);
                                    }}
                                    className="text-slate-350 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                                    title="Remove Candidate"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold block mt-1 font-mono uppercase">
                                  {cand.cp}% CP • {cand.me} MJ
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] text-slate-400 font-black uppercase block leading-none">Price/kg</span>
                              <div className="flex items-center gap-1 mt-1 font-mono">
                                <span className="text-[9px] text-slate-400 font-bold">Ksh</span>
                                <input
                                  type="number"
                                  value={cand.cost}
                                  onChange={(e) => {
                                    const updated = [...lcfCandidates];
                                    updated[idx].cost = parseFloat(e.target.value) || 0;
                                    setLcfCandidates(updated);
                                  }}
                                  className="text-xs w-11 bg-slate-50 border p-1 rounded font-mono font-black text-right outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          </div>

                          {cand.enabled && (
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-dashed border-slate-100 text-[10px] font-semibold text-slate-500">
                              <div>
                                <span className="text-slate-400 block uppercase text-[8px] font-bold">Min inclusion %</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={cand.minLimit}
                                  onChange={(e) => {
                                    const updated = [...lcfCandidates];
                                    updated[idx].minLimit = parseFloat(e.target.value) || 0;
                                    setLcfCandidates(updated);
                                  }}
                                  className="text-[11px] font-mono font-bold w-full border bg-slate-50/50 p-1.5 rounded-lg text-center mt-1 outline-none focus:border-semibold"
                                />
                              </div>
                              <div>
                                <span className="text-slate-400 block uppercase text-[8px] font-bold">Max inclusion %</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={cand.maxLimit}
                                  onChange={(e) => {
                                    const updated = [...lcfCandidates];
                                    updated[idx].maxLimit = parseFloat(e.target.value) || 0;
                                    setLcfCandidates(updated);
                                  }}
                                  className="text-[11px] font-mono font-bold w-full border bg-slate-50/50 p-1.5 rounded-lg text-center mt-1 outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Solve Button */}
                  <button
                    type="button"
                    onClick={handleSolveLCF}
                    disabled={isLcfSolving}
                    className="w-full bg-[#0d3621] hover:bg-[#0c2f1e] text-white font-extrabold text-xs uppercase py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isLcfSolving ? '⌛ SOLVING MATHEMATICAL MATRIX COMBINATIONS...' : '🚀 CALIBRATE LEAST-COST FORMULATION (LCF)'}
                  </button>

                  {/* Solver Output Results */}
                  {lcfResult && (
                    <div className="bg-[#0f172a] text-white p-5 rounded-3xl space-y-4 border border-slate-800 animate-fadeIn text-left">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                        <div>
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">Optimization Engine Report</span>
                          <h4 className="text-xs font-black text-white mt-0.5">MATRIX SOLUTION REQUISITES MET</h4>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950">
                          Feasible & Cost-Optimized
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                          <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Optimal Cost/kg</span>
                          <span className="text-lg font-mono font-black text-white mt-1 block">
                            Ksh {lcfResult.cost.toFixed(1)}
                          </span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                          <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Crude Protein</span>
                          <span className="text-lg font-mono font-black text-amber-400 mt-1 block">
                            {lcfResult.cp.toFixed(1)}%
                          </span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                          <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Metabolizable Energy</span>
                          <span className="text-lg font-mono font-black text-sky-400 mt-1 block">
                            {lcfResult.me.toFixed(1)} <span className="text-[9px] font-normal font-sans">MJ</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-[9px] uppercase font-black text-slate-400 block">Calculated Formulation Ratios:</span>
                        <div className="space-y-1">
                          {lcfCandidates.filter(c => c.enabled).map((cand, idx) => {
                            const weight = lcfResult.weights[idx] || 0;
                            if (weight <= 0) return null;
                            return (
                              <div key={cand.name} className="flex items-center justify-between text-xs font-mono bg-slate-950/80 p-2 rounded-lg border border-white/5">
                                <span className="text-slate-300 font-sans">{cand.name}</span>
                                <div className="flex gap-3">
                                  <span className="text-emerald-400 font-bold">{weight.toFixed(1)}%</span>
                                  <span className="text-slate-500">({weight.toFixed(1)} kg)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyLcfToBatch}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-center"
                      >
                        ⚡ APPLY OPTIMIZED MIX TO MANUAL COMPOUNDING RECIPE
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Animal Nutritional Requirements Panel */}
      <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 animate-fadeIn mt-6 text-left">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded font-black uppercase tracking-wider animate-pulse">OFFICIAL NRC/KALRO REFERENCE</span>
              <span className="text-[9px] text-slate-400 font-black uppercase">Standard Dietary Targets</span>
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-wider mt-1.5 font-sans">Animal Nutritional Requirements Guidelines</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Consult these official dietary metrics to guide your manual compounding and Least-Cost Feed (LCF) optimization parameters.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {(['All', 'Dairy', 'Poultry', 'Calves', 'Ducks'] as const).map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setRequirementsTab(catName)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    requirementsTab === catName
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {catName === 'All' ? '📑 See All Stages' : catName}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 border-l border-slate-800 pl-3">
              <button
                type="button"
                onClick={() => scrollRequirements('left')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollRequirements('right')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Deck - Fits the page perfectly without pushing content vertically down */}
        <div className="relative group/deck">
          {/* Subtle fade indicators for left/right scroll */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10 opacity-40 group-hover/deck:opacity-80 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10 opacity-40 group-hover/deck:opacity-80 transition-opacity" />

          <div
            ref={requirementsScrollRef}
            className="flex flex-row overflow-x-auto gap-5 pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-emerald-700/60 scrollbar-track-slate-950/40"
          >
            {filteredAnimalRequirements.map((req) => (
              <div
                key={req.stage}
                className="w-[280px] sm:w-[330px] shrink-0 snap-start bg-slate-950/95 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 hover:bg-slate-950 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-1.5">
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider leading-none ${
                      req.grp === 'Dairy' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                      req.grp === 'Poultry' ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' :
                      req.grp === 'Calves' ? 'bg-sky-400/10 text-sky-400 border border-sky-400/20' :
                      'bg-pink-400/10 text-pink-400 border border-pink-400/10'
                    }`}>
                      {req.grp}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{req.intake}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider leading-snug">{req.stage}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium mt-1 min-h-[50px] line-clamp-3 hover:line-clamp-none transition-all duration-200">
                      {req.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80 border-dashed mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-900 border border-slate-800/30 rounded-xl text-center">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">Protein (CP)</span>
                      <span className="text-xs font-mono font-black text-amber-400 mt-0.5 block">{req.cpRange}</span>
                    </div>
                    <div className="p-2 bg-slate-900 border border-slate-800/30 rounded-xl text-center">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">Energy (ME)</span>
                      <span className="text-xs font-mono font-black text-sky-400 mt-0.5 block">{req.meRange}</span>
                    </div>
                  </div>

                  <div className="space-y-1 p-2.5 bg-slate-900/40 border border-slate-800/40 rounded-xl">
                    <span className="text-[8px] uppercase font-black text-slate-500 block tracking-wider">Ideal Feedstocks:</span>
                    <p className="text-[10px] text-slate-300 leading-normal font-semibold italic truncate" title={req.ingredients}>
                      {req.ingredients}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
