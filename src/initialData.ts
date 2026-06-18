/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MilkingRecord,
  AIRecord,
  TeaRecord,
  AvocadoRecord,
  FinancialRecord,
  SprayRecord,
  Todo,
  Ingredient,
  StaffMember,
  LivestockRecord,
  FieldRecord,
  InventoryItem
} from './types';

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'st-0',
    name: 'Dr. Devin Omwenga',
    role: 'Overall Farm Manager',
    unit: 'General',
    phone: '+254 700 000 000',
    shiftMorning: 'Strategic Oversight & Operations Audit',
    shiftAfternoon: 'Technological & Business Development Review',
    status: 'Present'
  },
  {
    id: 'st-1',
    name: 'Mosoti',
    role: 'Senior Herdsman',
    unit: 'Dairy',
    phone: '+254 711 000 111',
    shiftMorning: 'Milking & Shed Clean',
    shiftAfternoon: 'TMR Mixing / Feed prep',
    status: 'Present'
  },
  {
    id: 'st-3',
    name: 'David',
    role: 'Horticulture Team Lead',
    unit: 'Horti',
    phone: '+254 733 000 333',
    shiftMorning: 'Tea Plucking Section A',
    shiftAfternoon: 'Tea Weights & Quality Inspection',
    status: 'Present'
  },
  {
    id: 'st-4',
    name: 'Charles',
    role: 'Field Operator',
    unit: 'Fields',
    phone: '+254 744 000 444',
    shiftMorning: 'Banana De-suckering',
    shiftAfternoon: 'Napier Grass Silage Harvest',
    status: 'Present'
  },
  {
    id: 'st-5',
    name: 'Josephine',
    role: 'Nursery Attendant',
    unit: 'Horti',
    phone: '+254 755 000 555',
    shiftMorning: 'Avocado Seedling Care',
    shiftAfternoon: 'Grading, Packing & Nursery Log',
    status: 'Present'
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { name: 'Maize Germ', cp: 11, me: 12.0, cost: 35 },
  { name: 'Wheat Bran', cp: 14, me: 9.2, cost: 28 },
  { name: 'Wheat Pollard', cp: 15, me: 11.5, cost: 32 },
  { name: 'Sunflower Meal', cp: 30, me: 9.0, cost: 45 },
  { name: 'Cotton Seed Cake', cp: 38, me: 10.5, cost: 58 },
  { name: 'Soya Bean Meal', cp: 44, me: 13.5, cost: 95 },
  { name: 'Fish Meal', cp: 60, me: 12.5, cost: 140 },
  { name: 'DCP / Mineral Premix', cp: 0, me: 0.0, cost: 180 },
  { name: 'Lime / Calcium Powder', cp: 0, me: 0.0, cost: 15 },
  { name: 'Feed Salt', cp: 0, me: 0.0, cost: 20 },
  { name: 'Molasses Co-binder', cp: 4, me: 11.2, cost: 30 }
];

export const INITIAL_MILK_RECORDS: MilkingRecord[] = [
  { id: 'Cow-101 (Daisy)', am: 15.5, pm: 12.0, staff: 'Mosoti', date: getRelativeDate(-6) },
  { id: 'Cow-102 (Goldie)', am: 18.0, pm: 14.5, staff: 'Mosoti', date: getRelativeDate(-6) },
  { id: 'Cow-103 (Ruby)', am: 12.0, pm: 10.0, staff: 'Mosoti', date: getRelativeDate(-6) },

  { id: 'Cow-101 (Daisy)', am: 16.0, pm: 11.5, staff: 'Mosoti', date: getRelativeDate(-5) },
  { id: 'Cow-102 (Goldie)', am: 17.5, pm: 15.0, staff: 'Mosoti', date: getRelativeDate(-5) },
  { id: 'Cow-103 (Ruby)', am: 11.8, pm: 9.5, staff: 'Mosoti', date: getRelativeDate(-5) },

  { id: 'Cow-101 (Daisy)', am: 15.8, pm: 12.2, staff: 'Mosoti', date: getRelativeDate(-4) },
  { id: 'Cow-102 (Goldie)', am: 19.0, pm: 14.0, staff: 'Mosoti', date: getRelativeDate(-4) },
  { id: 'Cow-103 (Ruby)', am: 12.5, pm: 10.2, staff: 'Mosoti', date: getRelativeDate(-4) },

  { id: 'Cow-101 (Daisy)', am: 16.2, pm: 12.5, staff: 'Mosoti', date: getRelativeDate(-3) },
  { id: 'Cow-102 (Goldie)', am: 18.5, pm: 14.8, staff: 'Mosoti', date: getRelativeDate(-3) },
  { id: 'Cow-103 (Ruby)', am: 13.0, pm: 11.0, staff: 'Mosoti', date: getRelativeDate(-3) },

  { id: 'Cow-101 (Daisy)', am: 15.0, pm: 12.0, staff: 'Mosoti', date: getRelativeDate(-2) },
  { id: 'Cow-102 (Goldie)', am: 19.5, pm: 15.2, staff: 'Mosoti', date: getRelativeDate(-2) },
  { id: 'Cow-103 (Ruby)', am: 12.2, pm: 10.5, staff: 'Mosoti', date: getRelativeDate(-2) },

  { id: 'Cow-101 (Daisy)', am: 16.5, pm: 13.0, staff: 'Mosoti', date: getRelativeDate(-1) },
  { id: 'Cow-102 (Goldie)', am: 20.0, pm: 16.0, staff: 'Mosoti', date: getRelativeDate(-1) },
  { id: 'Cow-103 (Ruby)', am: 12.8, pm: 11.2, staff: 'Mosoti', date: getRelativeDate(-1) },

  { id: 'Cow-101 (Daisy)', am: 17.0, pm: 13.5, staff: 'Mosoti', date: getRelativeDate(0) },
  { id: 'Cow-102 (Goldie)', am: 21.0, pm: 15.8, staff: 'Mosoti', date: getRelativeDate(0) },
  { id: 'Cow-103 (Ruby)', am: 13.5, pm: 11.5, staff: 'Mosoti', date: getRelativeDate(0) }
];

export const INITIAL_AI_RECORDS: AIRecord[] = [
  {
    cowId: 'Cow-101 (Daisy)',
    date: getRelativeDate(-180),
    bull: 'SEMEN-HO-992 (Holstein Pure)',
    due: getRelativeDate(103), // ~283 days gestation
    status: 'Confirmed Pregnant'
  },
  {
    cowId: 'Cow-103 (Ruby)',
    date: getRelativeDate(-260),
    bull: 'SEMEN-JE-771 (Jersey Prime)',
    due: getRelativeDate(23),
    status: 'Confirmed Pregnant'
  },
  {
    cowId: 'Cow-105 (Cherry)',
    date: getRelativeDate(-10),
    bull: 'SEMEN-AYR-404 (Ayrshire Select)',
    due: getRelativeDate(273),
    status: 'Pending'
  }
];

export const INITIAL_TEA_RECORDS: TeaRecord[] = [
  { qty: 142, ref: 'KTDA-TX-99827', date: getRelativeDate(-4), pricePerKg: 58, buyer: 'Chinga KTDA Factory', totalSales: 8236 },
  { qty: 158, ref: 'KTDA-TX-99839', date: getRelativeDate(-3), pricePerKg: 58, buyer: 'Chinga KTDA Factory', totalSales: 9164 },
  { qty: 139, ref: 'KTDA-TX-99851', date: getRelativeDate(-2), pricePerKg: 60, buyer: 'Chinga KTDA Factory', totalSales: 8340 },
  { qty: 165, ref: 'KTDA-TX-99863', date: getRelativeDate(-1), pricePerKg: 60, buyer: 'Gathutu Tea Purchasing Ltd', totalSales: 9900 },
  { qty: 172, ref: 'KTDA-TX-99875', date: getRelativeDate(0), pricePerKg: 62, buyer: 'Gathutu Tea Purchasing Ltd', totalSales: 10664 }
];

export const INITIAL_AVOCADO_RECORDS: AvocadoRecord[] = [
  { gradeA: 24, gradeB: 12, reject: 45, ref: 'KEPHIS-EXP-201', date: getRelativeDate(-3), priceGradeA: 1450, priceGradeB: 800, priceReject: 35, buyer: 'Kakuzi Agribusiness Exporters', totalSales: 45975 },
  { gradeA: 30, gradeB: 15, reject: 50, ref: 'KEPHIS-EXP-202', date: getRelativeDate(-1), priceGradeA: 1500, priceGradeB: 850, priceReject: 38, buyer: 'Sunripe East Africa Export Ltd', totalSales: 59650 }
];

export const INITIAL_FINICAL_RECORDS: FinancialRecord[] = [
  {
    id: 'f-1',
    type: 'income',
    amount: 145000,
    category: 'Tea Sale',
    description: 'Monthly payout from KTDA Factory delivery bonus',
    date: getRelativeDate(-5)
  },
  {
    id: 'f-2',
    type: 'expense',
    amount: 32000,
    category: 'Animal Feed',
    description: 'Purchased 8 bags of Soya bean meal & mineral supplementation from Coop store',
    date: getRelativeDate(-4)
  },
  {
    id: 'f-3',
    type: 'income',
    amount: 84300,
    category: 'Dairy Sale',
    description: 'Milk sale segment payout for Brookside Cooperative delivery',
    date: getRelativeDate(-2)
  },
  {
    id: 'f-4',
    type: 'expense',
    amount: 15000,
    category: 'Veternary Care',
    description: 'AI semen straws and vet visit fee for wellness checkup',
    date: getRelativeDate(-2)
  },
  {
    id: 'f-5',
    type: 'expense',
    amount: 25000,
    category: 'Wages',
    description: 'Weekly wages advance for tea plucking staff & dairy team',
    date: getRelativeDate(-1)
  }
];

export const INITIAL_SPRAY_RECORDS: SprayRecord[] = [
  {
    id: 'sp-1',
    block: 'Avocado Block C',
    chemical: 'Copper Oxychloride (Fungicide)',
    phi: 7,
    target: 'Anthracnose Rot prevention',
    date: getRelativeDate(-6),
    safeDate: getRelativeDate(1)
  },
  {
    id: 'sp-2',
    block: 'Tea Section South',
    chemical: 'Deltamethrin (Insecticide)',
    phi: 14,
    target: 'Thrips outbreak protection',
    date: getRelativeDate(-12),
    safeDate: getRelativeDate(2)
  }
];

export const INITIAL_TODOS: Todo[] = [
  { id: 'todo-1', text: 'Dr. Devin Omwenga: Complete audit for GlobalGAP certification checklist', completed: false, date: getRelativeDate(0) },
  { id: 'todo-2', text: 'Administer Dewormer to Jersey Heifers', completed: true, date: getRelativeDate(-1) },
  { id: 'todo-3', text: 'Herdsman Mosoti: Prepare TMR silage bunker 2', completed: false, date: getRelativeDate(0) },
  { id: 'todo-4', text: 'David: Weed the young grafted avocado nursery plot', completed: false, date: getRelativeDate(0) }
];

export const INITIAL_LIVESTOCK: LivestockRecord[] = [
  {
    id: 'ls-1',
    type: 'Poultry',
    name: 'Layers Flock A (Chicks)',
    countOrBreed: '350 Birds',
    activity: 'Vaccination',
    notes: 'Administered Gumboro vaccine booster in drinking water. Intake active.',
    date: getRelativeDate(-1)
  },
  {
    id: 'ls-2',
    type: 'Poultry',
    name: 'Layers Flock B (Production)',
    countOrBreed: '520 Birds',
    activity: 'Egg Collection',
    notes: 'Collected 14 crates today. Egg weight premium average.',
    date: getRelativeDate(0)
  },
  {
    id: 'ls-3',
    type: 'Dogs',
    name: 'Major & Rex (Security Guard)',
    countOrBreed: 'German Shepherds',
    activity: 'Deworming & Rabies Jab',
    notes: 'Vet checked and vaccinated. Healthy weight and extreme alertness.',
    date: getRelativeDate(-5)
  }
];

export const INITIAL_FIELDS: FieldRecord[] = [
  {
    id: 'fld-1',
    blockName: 'Section A - West Slope',
    cropType: 'Tea (Clone 31/8)',
    acreage: 2.5,
    status: 'Growing',
    notes: 'Heavy plucking ongoing. Fertilization scheduled for next rain.',
    date: getRelativeDate(-2)
  },
  {
    id: 'fld-2',
    blockName: 'Flat Area Nord',
    cropType: 'Napier Grass (Super Napier)',
    acreage: 1.8,
    status: 'Growing',
    notes: 'Harvested 3 silage cuts this year. Responding wonderfully to manure slurry application.',
    date: getRelativeDate(0)
  },
  {
    id: 'fld-3',
    blockName: 'Gravel Ridge Block',
    cropType: 'Blue Gum Eucalyptus',
    acreage: 3.0,
    status: 'Growing',
    notes: 'Tree count ~1400. Excellent windbreaker barrier for avocado orchard.',
    date: getRelativeDate(-30)
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Premium Dairy Meal', category: 'Feed', quantity: 24, unit: 'bags (50kg)', minStock: 10 },
  { id: 'inv-2', name: 'Super Napier Silage', category: 'Feed', quantity: 6.5, unit: 'tons', minStock: 2.0 },
  { id: 'inv-3', name: 'Copper Oxychloride Spray', category: 'Chemical', quantity: 8, unit: 'liters', minStock: 3 },
  { id: 'inv-4', name: 'NPK 26:0:0 Fertilizer', category: 'Fertilizer', quantity: 15, unit: 'bags (50kg)', minStock: 5 },
  { id: 'inv-5', name: 'Tea Pruning Knives', category: 'Tools', quantity: 12, unit: 'units', minStock: 4 }
];
