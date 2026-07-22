import { Ingredient } from '../types';

export const PRESETS = {
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

export const generate500Ingredients = (customIngredients: Ingredient[]): Ingredient[] => {
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

export const ANIMAL_NUTRITION_STANDARDS = [
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
