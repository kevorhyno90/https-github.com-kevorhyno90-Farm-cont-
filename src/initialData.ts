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
  InventoryItem,
  StaffOffRecord,
  Cow,
  VetRecord,
  GoatRecord,
  CalfRecord,
  BsfRecord,
  CropOpRecord,
  CropSaleRecord,
  AnimalSaleRecord,
  MortalityRecord,
  MilkOutflowRecord,
  SemenInventoryItem
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
  { id: 'Cow-101 (Daisy)', am: 17.0, pm: 13.5, staff: 'Mosoti', date: getRelativeDate(0) },
  { id: 'Cow-102 (Goldie)', am: 21.0, pm: 15.8, staff: 'Mosoti', date: getRelativeDate(0) },
  { id: 'Cow-103 (Ruby)', am: 13.5, pm: 11.5, staff: 'Mosoti', date: getRelativeDate(0) },

  { id: 'Cow-101 (Daisy)', am: 16.5, pm: 13.0, staff: 'Mosoti', date: getRelativeDate(-2) },
  { id: 'Cow-102 (Goldie)', am: 20.0, pm: 16.0, staff: 'Mosoti', date: getRelativeDate(-2) },
  { id: 'Cow-103 (Ruby)', am: 12.8, pm: 11.2, staff: 'Mosoti', date: getRelativeDate(-2) },

  { id: 'Cow-101 (Daisy)', am: 15.0, pm: 12.0, staff: 'Mosoti', date: getRelativeDate(-15) },
  { id: 'Cow-102 (Goldie)', am: 19.5, pm: 15.2, staff: 'Mosoti', date: getRelativeDate(-15) },

  { id: 'Cow-101 (Daisy)', am: 16.2, pm: 12.5, staff: 'Mosoti', date: getRelativeDate(-45) },
  { id: 'Cow-102 (Goldie)', am: 18.5, pm: 14.8, staff: 'Mosoti', date: getRelativeDate(-45) },
];

export const INITIAL_SEMEN_INVENTORY: SemenInventoryItem[] = [
  {
    id: 'SEMEN-HO-992',
    bullName: 'SEMEN-HO-992 (Holstein Pure)',
    breed: 'Holstein-Friesian',
    semenType: 'Sexed (Female)',
    origin: 'Imported (USA)',
    cost: 3500,
    quantity: 12
  },
  {
    id: 'SEMEN-JE-771',
    bullName: 'SEMEN-JE-771 (Jersey Prime)',
    breed: 'Jersey',
    semenType: 'Sexed (Female)',
    origin: 'Imported (EU)',
    cost: 3000,
    quantity: 8
  },
  {
    id: 'SEMEN-AYR-404',
    bullName: 'SEMEN-AYR-404 (Ayrshire Select)',
    breed: 'Ayrshire',
    semenType: 'Conventional',
    origin: 'Local (KAGRC)',
    cost: 1500,
    quantity: 15
  },
  {
    id: 'SEMEN-FR-301',
    bullName: 'SEMEN-FR-301 (Friesian Red-Star)',
    breed: 'Friesian',
    semenType: 'Sexed (Male)',
    origin: 'Local (KAGRC)',
    cost: 1800,
    quantity: 6
  }
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
  {
    ref: 'KEPHIS-EXP-201',
    date: getRelativeDate(-3),
    grade1Kg: 240,
    grade1PricePerKg: 150,
    rejectKg: 45,
    priceForRejects: 35,
    grade1Buyer: 'Kakuzi Agribusiness Exporters',
    rejectBuyer: 'Local Puree Processor',
    paymentMode: 'Deferred',
    nextHarvestSeason: 'October - December',
    paymentModeNextHarvestSeason: 'Deferred (Next harvest payouts)',
    debts: 5000,
    notes: 'Excellent fruit oil level verified by phytosanitary team.',
    totalSales: 37575
  },
  {
    ref: 'KEPHIS-EXP-202',
    date: getRelativeDate(-1),
    grade1Kg: 300,
    grade1PricePerKg: 160,
    rejectKg: 50,
    priceForRejects: 38,
    grade1Buyer: 'Sunripe East Africa Export Ltd',
    rejectBuyer: 'Local Juice Co.',
    paymentMode: 'M-Pesa / Immediate',
    nextHarvestSeason: 'March - May (Fly Crop)',
    paymentModeNextHarvestSeason: 'M-Pesa / Immediate',
    debts: 0,
    notes: 'Grade 1 selection approved under GlobalGAP standard.',
    totalSales: 49900
  }
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
  },
  {
    id: 'fld-4',
    blockName: 'Meadow Flat Block C',
    cropType: 'Boma Rhodes',
    acreage: 2.2,
    status: 'Growing',
    notes: 'Premium high-protein forage grass. Scheduled for cutting and baling in 2 weeks.',
    date: getRelativeDate(-10)
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Premium Dairy Meal', category: 'Feed', quantity: 24, unit: 'bags (50kg)', minStock: 10 },
  { id: 'inv-2', name: 'Super Napier Silage', category: 'Feed', quantity: 6.5, unit: 'tons', minStock: 2.0 },
  { id: 'inv-3', name: 'Copper Oxychloride Spray', category: 'Chemical', quantity: 8, unit: 'liters', minStock: 3 },
  { id: 'inv-4', name: 'NPK 26:0:0 Fertilizer', category: 'Fertilizer', quantity: 15, unit: 'bags (50kg)', minStock: 5 },
  { id: 'inv-5', name: 'Tea Pruning Knives', category: 'Tools', quantity: 12, unit: 'units', minStock: 4 }
];

export const INITIAL_STAFF_OFF_RECORDS: StaffOffRecord[] = [
  {
    id: 'off-1',
    staffId: 'st-1', // Mosoti
    staffName: 'Mosoti',
    type: 'Day Off',
    startDate: getRelativeDate(0), // Today
    endDate: getRelativeDate(0),
    notes: 'Approved standard weekly rest day.',
    status: 'Approved'
  },
  {
    id: 'off-2',
    staffId: 'st-3', // David
    staffName: 'David',
    type: 'Annual Leave',
    startDate: getRelativeDate(2), // Starts in 2 days
    endDate: getRelativeDate(12),
    notes: 'Family visit in Kisumu.',
    status: 'Pending'
  },
  {
    id: 'off-3',
    staffId: 'st-5', // Josephine
    staffName: 'Josephine',
    type: 'Sick Leave',
    startDate: getRelativeDate(-4),
    endDate: getRelativeDate(-2),
    notes: 'Recovered from flu.',
    status: 'Completed'
  }
];

export const INITIAL_COWS: Cow[] = [
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
    notes: 'Excellent feed conversion ratio.',
    sire: 'Jersey King (JK-202)',
    dam: 'Ruby Queen (RQ-101)',
    grandSirePaternal: 'Ferdinand (F-001)',
    grandDamPaternal: 'Jersey Princess (JP-11)',
    grandSireMaternal: 'Westerville Chief (WC-50)',
    grandDamMaternal: 'Ruby Duchess (RD-49)',
    registrationNo: 'KAG-J-2022-1049'
  },
  { 
    id: 'Cow-104 (Blossom)', 
    name: 'Blossom', 
    breed: 'Ayrshire', 
    dob: '2023-11-10', 
    status: 'Heifer', 
    notes: 'Ready for first AI straw soon.',
    sire: 'Ayrshire Archer (AA-55)',
    dam: 'Blossom Senior (BS-82)',
    grandSirePaternal: 'Gala Warrior (GW-33)',
    grandDamPaternal: 'Archer Lass (AL-21)',
    grandSireMaternal: 'Red Knight (RK-99)',
    grandDamMaternal: 'Blossom Beauty (BB-02)',
    registrationNo: 'KAG-A-2023-7740'
  },
  { 
    id: 'Cow-105 (Cherry)', 
    name: 'Cherry', 
    breed: 'Brown Swiss', 
    dob: '2021-12-22', 
    status: 'In-Calf', 
    notes: 'Awaiting calving due in early July.',
    sire: 'Alpine Ranger (AR-101)',
    dam: 'Swiss Heidi (SH-44)',
    grandSirePaternal: 'Sentry (S-555)',
    grandDamPaternal: 'Ranger Belle (RB-12)',
    grandSireMaternal: 'Swiss Edelweiss (SE-21)',
    grandDamMaternal: 'Heidi Pure (HP-01)',
    registrationNo: 'KAG-BS-2021-3938'
  }
];

export const INITIAL_VET_RECORDS: VetRecord[] = [
  {
    id: 'vet-1',
    cowId: 'Cow-101 (Daisy)',
    date: getRelativeDate(-15),
    type: 'Deworming',
    treatment: 'Valbazen Broad Spectrum Dewormer',
    nextDueDate: getRelativeDate(75), // 90 days interval
    cost: 1550,
    staff: 'Dr. Devin Omwenga',
    notes: 'Dosed post-dry off. Excellent coat condition response.'
  },
  {
    id: 'vet-2',
    cowId: 'Cow-103 (Ruby)',
    date: getRelativeDate(-8),
    type: 'Treatment',
    treatment: 'Mastitis teat ointment & Penicillin G',
    cost: 3200,
    staff: 'Dr. Devin Omwenga',
    notes: 'Left rear quarter light mastitis flare. Cleared successfully, milk withdrawal ended.'
  },
  {
    id: 'vet-3',
    cowId: 'Cow-102 (Goldie)',
    date: getRelativeDate(-2),
    type: 'Vaccination',
    treatment: 'Foot & Mouth Disease (FMD) Vaccine',
    cost: 1200,
    staff: 'Dr. Devin Omwenga',
    notes: 'Bi-annual routine booster dose.'
  }
];

export const INITIAL_GOAT_RECORDS: GoatRecord[] = [
  {
    id: 'gt-1',
    tagId: 'Goat-201 (Pippa)',
    breed: 'Toggenburg',
    purpose: 'Dairy',
    milkYieldLiters: 2.8,
    activity: 'Milk Log',
    notes: 'Premium lactation doe. Milk is high-protein for family consumption.',
    date: getRelativeDate(-1)
  },
  {
    id: 'gt-2',
    tagId: 'Goat-202 (Billy)',
    breed: 'Boer',
    purpose: 'Meat',
    activity: 'Weight tracking & deworming',
    notes: 'Breeding buck. Achieved 68kg liveweight chest girth.',
    date: getRelativeDate(-5)
  },
  {
    id: 'gt-3',
    tagId: 'Goat-203 (Alpine Doe)',
    breed: 'Alpine',
    purpose: 'Dairy',
    milkYieldLiters: 2.2,
    activity: 'Foot rot preventive dressing',
    notes: 'Trimmed hoofs and added copper sulfate dip. Alert on dry bedding.',
    date: getRelativeDate(0)
  }
];

export const INITIAL_CALF_RECORDS: CalfRecord[] = [
  {
    id: 'cf-1',
    calfId: 'Calf-901 (Princess)',
    damId: 'Cow-101 (Daisy)',
    dob: getRelativeDate(-45),
    milkIntakeLiters: 5.0,
    creepFeedIntroDate: getRelativeDate(-15),
    weaned: false,
    notes: 'Highly active. Consuming calf-starter creep feed aggressively.',
    date: getRelativeDate(0)
  },
  {
    id: 'cf-2',
    calfId: 'Calf-902 (Rocky)',
    damId: 'Cow-103 (Ruby)',
    dob: getRelativeDate(-90),
    milkIntakeLiters: 0, // Fully weaned
    creepFeedIntroDate: getRelativeDate(-60),
    weaned: true,
    notes: 'Successfully weaned to alfalfa hay and high protein dry concentrates.',
    date: getRelativeDate(-1)
  }
];

export const INITIAL_BSF_RECORDS: BsfRecord[] = [
  {
    id: 'bsf-1',
    batchId: 'BSF-BATCH-001',
    substrateType: 'Overripe Avocados & Banana waste',
    inoculationDate: getRelativeDate(-16),
    larvaeHarvestedKg: 35.8,
    status: 'Harvested',
    notes: 'Superior harvest size. Grubs dried in solar dryer for poultry feed supplement.',
    date: getRelativeDate(-1)
  },
  {
    id: 'bsf-2',
    batchId: 'BSF-BATCH-002',
    substrateType: 'Kitchen waste & Maize feed dust',
    inoculationDate: getRelativeDate(-8),
    larvaeHarvestedKg: 0, // Growing
    status: 'Larvae Feeding',
    notes: 'Highly voracious feed intake. Moderate temperature around 28C maintained.',
    date: getRelativeDate(0)
  }
];

export const INITIAL_CROP_OP_RECORDS: CropOpRecord[] = [
  { id: 'co-1', crop: 'Tea', operationName: 'Pruning & Mulching', date: getRelativeDate(-10), status: 'Completed', completedBy: 'David', notes: 'Lower slope block C pruned to maintain a 24-inch flat plucking table.' },
  { id: 'co-2', crop: 'Avocado', operationName: 'Foliar Copper Fungicide Spray', date: getRelativeDate(-2), status: 'Completed', completedBy: 'Josephine', notes: 'Pre-harvest copper spray for anthracnose defense. 21 days PHI lock active.' },
  { id: 'co-3', crop: 'Banana', operationName: 'De-suckering & Propping', date: getRelativeDate(0), status: 'In-Progress', completedBy: 'Charles', notes: 'Removed secondary water suckers. Retained only 1 mother + 1 daughter + 1 granddaughter system.' },
  { id: 'co-4', crop: 'Vegetables', operationName: 'Sack or Drip watering & compost prep', date: getRelativeDate(0), status: 'In-Progress', completedBy: 'Charles', notes: 'Drip line flush for kales/sukuma and tomatoes. Composted dairy dry manure.' },
  { id: 'co-5', crop: 'Sorghum', operationName: 'Thinning & Bird scaring setup', date: getRelativeDate(2), status: 'Pending', completedBy: 'Charles', notes: 'Thin young sorghum plants to 15cm spacing. Prepare reflective flash tapes.' },
  { id: 'co-6', crop: 'Maize', operationName: 'NPK 23:23:0 Top Dressing & Weeding', date: getRelativeDate(1), status: 'Pending', completedBy: 'David', notes: 'Scheduled for knee-high stage fertilization coinciding with rains.' }
];

export const INITIAL_CROP_SALES: CropSaleRecord[] = [
  { id: 'cs-1', crop: 'Banana', qty: 15, unit: 'bunches', pricePerUnit: 1200, buyer: 'Nyamira Fresh Green Market', ref: 'NYM-B-041', date: getRelativeDate(-4), totalSales: 18000 },
  { id: 'cs-2', crop: 'Vegetables', qty: 25, unit: 'crates', pricePerUnit: 800, buyer: 'Nairobi Organic Hub Retail', ref: 'NRO-V-992', date: getRelativeDate(-2), totalSales: 20000 },
  { id: 'cs-3', crop: 'Maize', qty: 40, unit: 'bags (90kg)', pricePerUnit: 3600, buyer: 'National Cereals Board (NCPB)', ref: 'NCPB-M-112', date: getRelativeDate(-1), totalSales: 144000 }
];

export const INITIAL_ANIMAL_SALES: AnimalSaleRecord[] = [
  {
    id: 'as-1',
    category: 'Poultry',
    animalIdOrBatch: 'Layers Batch A (Retired culled hens)',
    qty: 50,
    price: 35000,
    buyer: 'Nyamira Retail Hotel Chain',
    ref: 'SL-PL-005',
    date: getRelativeDate(-6),
    weightKg: 105,
    notes: 'Sold at Ksh 700 per live bird post-lay period.'
  },
  {
    id: 'as-2',
    category: 'Goat',
    animalIdOrBatch: 'Boer Cross Kid Male #12',
    qty: 1,
    price: 12500,
    buyer: 'Neighbouring Stud breeder Joseph',
    ref: 'SL-GT-012',
    date: getRelativeDate(-3),
    weightKg: 28,
    notes: 'Premium Boer kid sold for breeding. High growth pedigree.'
  }
];

export const INITIAL_MORTALITY_RECORDS: MortalityRecord[] = [
  {
    id: 'mr-1',
    category: 'Poultry',
    animalIdOrBatch: 'Layers Batch B (Chicks)',
    count: 12,
    date: getRelativeDate(-10),
    causeOfDeath: 'Coocidiosis cold damp stress',
    veterinaryConfirmed: true,
    notes: 'Experienced brooding draft in section 2. Handled via Amprolium dose in water.'
  },
  {
    id: 'mr-2',
    category: 'Calf',
    animalIdOrBatch: 'Calf-Dry-Run-Abort',
    count: 1,
    date: getRelativeDate(-20),
    causeOfDeath: 'Stillborn delivery abortion (Brucella negative)',
    veterinaryConfirmed: true,
    notes: 'Dam had slight fall near slippery drinking trough. Rest of herd screened and cleared.'
  }
];

export const INITIAL_MILK_OUTFLOW_RECORDS: MilkOutflowRecord[] = [
  {
    id: 'mo-1',
    date: getRelativeDate(0),
    milkUsedAtHome: 4.0,
    milkUsedByWorkers: 5.0,
    milkSpoiled: 0.0,
    debtsKsh: 0,
    debtCustomer: '',
    notes: 'Today\'s dispatch.'
  },
  {
    id: 'mo-2',
    date: getRelativeDate(-2),
    milkUsedAtHome: 4.5,
    milkUsedByWorkers: 6.0,
    milkSpoiled: 1.5,
    debtsKsh: 250,
    debtCustomer: 'Alice Kemunto (Worker credits)',
    notes: 'Home milk for guests; Kemunto dry period credits.'
  },
  {
    id: 'mo-3',
    date: getRelativeDate(-15),
    milkUsedAtHome: 3.5,
    milkUsedByWorkers: 5.0,
    milkSpoiled: 0.0,
    debtsKsh: 420,
    debtCustomer: 'Bob Nyabuto (Local shop)',
    notes: 'Local shop purchased on credit, 8 liters at Ksh 52.5.'
  },
  {
    id: 'mo-4',
    date: getRelativeDate(-45),
    milkUsedAtHome: 3.0,
    milkUsedByWorkers: 4.0,
    milkSpoiled: 1.0,
    debtsKsh: 0,
    debtCustomer: '',
    notes: 'Old historic dispatch.'
  }
];



