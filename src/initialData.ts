/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MilkingRecord,
  AIRecord,
  TeaRecord,
  TeaPracticeRecord,
  AvocadoRecord,
  AvocadoPracticeRecord,
  AvocadoSectionNote,
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
  SemenInventoryItem,
  MachineItem,
  MachineServiceRecord
} from './types';

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};
const getFutureDate = (offsetDays: number): string => getRelativeDate(offsetDays);

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
  {
    qty: 142,
    ref: 'KTDA-TX-99827',
    date: getRelativeDate(-4),
    pricePerKg: 58,
    buyer: 'Chinga KTDA Factory',
    totalSales: 8236,
    casualPluckedKg: 85,
    employeePluckedKg: 57,
    casualRatePerKg: 12,
    casualPayoutKes: 1020,
    casualPaymentStatus: 'Paid / Disbursed',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    notes: 'Morning dew plucking. Clean two leaves and a bud leaf quality.'
  },
  {
    qty: 158,
    ref: 'KTDA-TX-99839',
    date: getRelativeDate(-3),
    pricePerKg: 58,
    buyer: 'Chinga KTDA Factory',
    totalSales: 9164,
    casualPluckedKg: 96,
    employeePluckedKg: 62,
    casualRatePerKg: 12,
    casualPayoutKes: 1152,
    casualPaymentStatus: 'Paid / Disbursed',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    notes: 'High plucking vigor. Leaf delivered to Buying Center 03 by 2 PM.'
  },
  {
    qty: 139,
    ref: 'KTDA-TX-99851',
    date: getRelativeDate(-2),
    pricePerKg: 60,
    buyer: 'Chinga KTDA Factory',
    totalSales: 8340,
    casualPluckedKg: 81,
    employeePluckedKg: 58,
    casualRatePerKg: 12,
    casualPayoutKes: 972,
    casualPaymentStatus: 'Pending Saturday Payout',
    blockOrZone: 'Tea Block 2 - Valley Plot',
    notes: 'Afternoon collection ticket verified with factory weighbridge clerk.'
  },
  {
    qty: 165,
    ref: 'KTDA-TX-99863',
    date: getRelativeDate(-1),
    pricePerKg: 60,
    buyer: 'Gathutu Tea Purchasing Ltd',
    totalSales: 9900,
    casualPluckedKg: 105,
    employeePluckedKg: 60,
    casualRatePerKg: 12,
    casualPayoutKes: 1260,
    casualPaymentStatus: 'Pending Saturday Payout',
    blockOrZone: 'Tea Block 2 - Valley Plot',
    notes: 'Peak vegetative flush. Excellent green leaf tenderness.'
  },
  {
    qty: 172,
    ref: 'KTDA-TX-99875',
    date: getRelativeDate(0),
    pricePerKg: 62,
    buyer: 'Gathutu Tea Purchasing Ltd',
    totalSales: 10664,
    casualPluckedKg: 112,
    employeePluckedKg: 60,
    casualRatePerKg: 12,
    casualPayoutKes: 1344,
    casualPaymentStatus: 'Pending Saturday Payout',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    notes: 'Today plucking receipt from KTDA scale station.'
  }
];

export const INITIAL_TEA_PRACTICE_RECORDS: TeaPracticeRecord[] = [
  {
    id: 'prc-01',
    practiceType: 'Pruning',
    date: getRelativeDate(-25),
    who: 'James Odhiambo & 6 Casual Pruners',
    how: 'Light prune down to 24 inches flat table using sterilized pruning knives; cut surfaces treated with copper hydroxide paste.',
    reason: 'Maintain optimal ergonomic plucking height and stimulate fresh vigorous vegetative flush branches.',
    blockOrZone: 'Tea Block 2 - Valley Plot',
    nextDueDate: getRelativeDate(340),
    costKes: 4800,
    notes: '1.2 acres pruned. Healthy wood without wood-rot or termites.'
  },
  {
    id: 'prc-02',
    practiceType: 'Fertilizer Application',
    date: getRelativeDate(-12),
    who: 'Peter Mwangi & Estate Field Team',
    how: 'Manual hand-broadcast of NPK 26:5:5 at 50g per bush spread under the leaf drip line after moderate rain showers on damp soil.',
    reason: 'Supply high nitrogen for leaf shoot multiplication and phosphate for root replenishment.',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    nextDueDate: getRelativeDate(110),
    costKes: 14500,
    notes: 'Applied 4 bags of 50kg NPK 26:5:5. Soil moisture optimal; no fertilizer scorch observed.'
  },
  {
    id: 'prc-03',
    practiceType: 'Weeding',
    date: getRelativeDate(-6),
    who: 'Casual Weeding Gang (4 Workers)',
    how: 'Manual shallow forking and hand pulling of creeping grasses and Couch grass along the tea rows; mulched with cut dry vegetative trash.',
    reason: 'Eliminate root competition for water and soil nutrients prior to October flush.',
    blockOrZone: 'Tea Block 1 - Upper Ridge',
    nextDueDate: getRelativeDate(35),
    costKes: 2400,
    notes: 'Zero chemical herbicide used to prevent leaf residue taint.'
  }
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
    rejectBuyer: 'Mt. Kenya Avocado Oil Processors',
    paymentMode: 'Deferred (Net 14)',
    nextHarvestSeason: 'October - December',
    paymentModeNextHarvestSeason: 'Deferred (Next harvest payouts)',
    debts: 5000,
    notes: 'Excellent fruit oil level (24.2%) verified by KEPHIS phytosanitary team.',
    totalSales: 37575,
    sectionOrBlock: 'Block 1: Lower Valley Hass (Prime Export)',
    buyerContact: '+254 722 000 111 / export@kakuzi.co.ke',
    rejectReason: 'Thrips russeting & wind rub marks',
    paymentStatus: 'Partial',
    rejectionLossKes: 45 * (150 - 35),
    rejectionRatePct: 15.8
  },
  {
    ref: 'KEPHIS-EXP-202',
    date: getRelativeDate(-1),
    grade1Kg: 300,
    grade1PricePerKg: 160,
    rejectKg: 35,
    priceForRejects: 38,
    grade1Buyer: 'Sunripe East Africa Export Ltd',
    rejectBuyer: 'Local Puree Factory',
    paymentMode: 'Bank Transfer / Immediate',
    nextHarvestSeason: 'March - May (Fly Crop)',
    paymentModeNextHarvestSeason: 'Bank Transfer / Immediate',
    debts: 0,
    notes: 'Grade 1 selection approved under GlobalGAP standard. Zero chemical residue.',
    totalSales: 49330,
    sectionOrBlock: 'Block 2: East Ridge Hass (Hillside Terraces)',
    buyerContact: '+254 733 999 888 / ops@sunripe.co.ke',
    rejectReason: 'Undersized (< 160g) fruitlets',
    paymentStatus: 'Paid',
    rejectionLossKes: 35 * (160 - 38),
    rejectionRatePct: 10.4
  },
  {
    ref: 'KEPHIS-EXP-203',
    date: getRelativeDate(0),
    grade1Kg: 410,
    grade1PricePerKg: 165,
    rejectKg: 40,
    priceForRejects: 40,
    grade1Buyer: 'Vegpro Kenya Agribusiness',
    rejectBuyer: 'Olivado EPZ Oil Extraction',
    paymentMode: 'M-Pesa / Immediate',
    nextHarvestSeason: 'October - December',
    paymentModeNextHarvestSeason: 'M-Pesa / Immediate',
    debts: 0,
    notes: 'Premium large caliber Hass. Dispatched via refrigerated reefer rig to Mombasa.',
    totalSales: 69250,
    sectionOrBlock: 'Block 1: Lower Valley Hass (Prime Export)',
    buyerContact: '+254 711 222 333 / procurement@vegpro.co.ke',
    rejectReason: 'Sunburn patches on exposed southern cheek',
    paymentStatus: 'Paid',
    rejectionLossKes: 40 * (165 - 40),
    rejectionRatePct: 8.9
  }
];

export const INITIAL_AVOCADO_PRACTICE_RECORDS: AvocadoPracticeRecord[] = [
  {
    id: 'avo-prc-1',
    date: getRelativeDate(-14),
    sectionOrBlock: 'Block 1: Lower Valley Hass (Prime Export)',
    practiceType: 'Disease Treatment',
    targetDiseaseOrPest: 'Anthracnose Fruit & Twig Blight (Colletotrichum)',
    drugOrChemicalName: 'Copper Oxychloride 50% WP',
    inventoryItemId: 'inv-3',
    inventoryQtyDeducted: 3,
    inventoryUnit: 'liters',
    dosageAndMethod: '50g per 20L knapsack canopy spray to full foliage run-off',
    operator: 'Josephine',
    phiDays: 14,
    reason: 'Preventive protective copper spray during heavy flowering/fruit-set rains',
    nextDueDate: getFutureDate(16),
    costKes: 2400,
    status: 'Completed',
    notes: 'Calibrated knapsack nozzle for fine mist. PHI interval active for export.'
  },
  {
    id: 'avo-prc-2',
    date: getRelativeDate(-10),
    sectionOrBlock: 'Block 2: East Ridge Hass (Hillside Terraces)',
    practiceType: 'Painting Copper White Paint',
    targetDiseaseOrPest: 'Sun Scald, Bark Cracking & Stem Canker',
    drugOrChemicalName: 'Sun-Shield Copper White Trunk Paint',
    inventoryItemId: 'inv-6',
    inventoryQtyDeducted: 4,
    inventoryUnit: 'liters',
    dosageAndMethod: '1:1 Copper Oxychloride + White Acrylic Latex painted 1.2m up lower trunk with brush',
    operator: 'Mosoti',
    phiDays: 0,
    reason: 'Trunk whitewash to block thermal radiation, sun scald cracking, and borers',
    nextDueDate: getFutureDate(170),
    costKes: 1800,
    status: 'Completed',
    notes: 'Covered exposed southern and western bark surfaces up to first main fork.'
  },
  {
    id: 'avo-prc-3',
    date: getRelativeDate(-7),
    sectionOrBlock: 'Block 1: Lower Valley Hass (Prime Export)',
    practiceType: 'Pruning',
    targetDiseaseOrPest: 'Skirt Clearance (0.5m) & Canopy Opening',
    drugOrChemicalName: 'Pruning Wound Sealant (Copper-infused)',
    inventoryItemId: 'inv-7',
    inventoryQtyDeducted: 1,
    inventoryUnit: 'units',
    dosageAndMethod: 'Sanitized bypass pruners; painted branch cuts > 2.5cm with copper seal',
    operator: 'David',
    phiDays: 0,
    reason: 'Elevate lower branches 0.5m off soil to block Phytophthora spore splashing',
    nextDueDate: getFutureDate(83),
    costKes: 1500,
    status: 'Completed',
    notes: 'Pruners sterilized in 70% alcohol between rows. Trimmings mulched under drip line.'
  },
  {
    id: 'avo-prc-4',
    date: getRelativeDate(-4),
    sectionOrBlock: 'Block 3: Fuerte & Cross-Pollinator Orchard',
    practiceType: 'Weeding',
    targetDiseaseOrPest: 'Under-canopy weed ring management',
    drugOrChemicalName: 'Manual Tools & Organic Biomass Mulch',
    dosageAndMethod: 'Manual hand hoeing 1.5m radius + 15cm coarse organic mulch (15cm collar gap)',
    operator: 'Casual Crew Lead (David)',
    phiDays: 0,
    reason: 'Moisture retention, root temperature stabilization, and zero herbicide weed suppression',
    nextDueDate: getFutureDate(41),
    costKes: 2200,
    status: 'Completed',
    notes: 'Mulch collar kept 15cm away from trunk base to prevent Phytophthora collar rot.'
  },
  {
    id: 'avo-prc-5',
    date: getRelativeDate(-2),
    sectionOrBlock: 'Block 1: Lower Valley Hass (Prime Export)',
    practiceType: 'Disease Treatment',
    targetDiseaseOrPest: 'Phytophthora Root Rot (Phytophthora cinnamomi)',
    drugOrChemicalName: 'Potassium Phosphonate / Foli-R-Fos 400',
    inventoryItemId: 'inv-8',
    inventoryQtyDeducted: 2,
    inventoryUnit: 'liters',
    dosageAndMethod: 'Trunk injection 20ml per 1m canopy diameter into sapwood xylem',
    operator: 'Dr. Devin Omwenga',
    phiDays: 0,
    reason: 'Systemic phosphonate booster during autumn root flush to stimulate phytoalexins',
    nextDueDate: getFutureDate(88),
    costKes: 3500,
    status: 'Completed',
    notes: 'Trunk injection completed on 45 sentinel trees. Tree vigor index optimal.'
  }
];

export const INITIAL_AVOCADO_SECTION_NOTES: AvocadoSectionNote[] = [
  {
    id: 'sec-1',
    sectionName: 'Block 1: Lower Valley Hass (Prime Export)',
    treeCount: 450,
    variety: 'Hass (Export Grade A) on Duke 7 rootstock',
    spacingMeters: '5m x 5m (High Density)',
    phenologicalStage: 'Fruit Growth / Enlargement',
    soilHealthStatus: 'Optimal',
    scoutingStatus: 'Clean / Certified',
    assignedSupervisor: 'Josephine (Lead Agronomist)',
    lastInspectionDate: getRelativeDate(-1),
    notes: 'Excellent fruitlet retention across all 450 trees. Average fruit caliber 18-22 (200-240g). Dual drip lines checked; flow rate uniform at 2.2L/hr. Zero sign of Phytophthora root rot bleeding.',
    actionPlan: 'Maintain bi-weekly copper spray rotation against anthracnose and monitor fruit sizing against export contracts.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-2',
    sectionName: 'Block 2: East Ridge Hass (Hillside Terraces)',
    treeCount: 380,
    variety: 'Hass on Mexican Native Grafts',
    spacingMeters: '6m x 5m (Contour Spacing)',
    phenologicalStage: 'Fruit Growth / Enlargement',
    soilHealthStatus: 'Optimal',
    scoutingStatus: 'Clean / Certified',
    assignedSupervisor: 'Mosoti (Field Supervisor)',
    lastInspectionDate: getRelativeDate(-3),
    notes: 'Terrace bunds intact after last heavy downpour. Trunk whitewashing with copper white paint intact on southern trunks with zero sun scald peeling. Grevillea windbreaks effectively mitigating branch rub.',
    actionPlan: 'Inspect pheromone fruit fly traps on Friday; re-apply sticky lure sheets if dust accumulation exceeds 30%.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-3',
    sectionName: 'Block 3: Fuerte & Cross-Pollinator Orchard',
    treeCount: 210,
    variety: 'Fuerte (Type B) & Bacon / Zutano',
    spacingMeters: '7m x 6m (Spreading Canopy)',
    phenologicalStage: 'Harvesting',
    soilHealthStatus: 'Optimal',
    scoutingStatus: 'Clean / Certified',
    assignedSupervisor: 'David (Harvest Lead)',
    lastInspectionDate: getRelativeDate(-2),
    notes: 'Green-skin Fuerte harvesting in progress. Early season domestic market prices strong at KES 120/kg for local supermarket contracts. Synchronous flowering successfully pollinated Block 1 & 2.',
    actionPlan: 'Complete final pick of remaining Fuerte canopy fruitlets by month-end, then initiate post-harvest window pruning.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-4',
    sectionName: 'Block 4: Young Grafted Orchard (Year 2 Saplings)',
    treeCount: 320,
    variety: 'Hass & Pinkerton on Dusa Clonal Rootstock',
    spacingMeters: '5m x 4m',
    phenologicalStage: 'Fruit Set',
    soilHealthStatus: 'Needs Zinc & Boron',
    scoutingStatus: 'Minor Thrips Spotted',
    assignedSupervisor: 'Josephine',
    lastInspectionDate: getRelativeDate(-4),
    notes: 'Young saplings showing vigorous spring vegetative flush. Low level thrips nymph activity observed on upper tender shoots. Formative branch pinching completed on 95% of saplings.',
    actionPlan: 'Schedule organic Neem + Abamectin spot foliar spray to knock down thrips before flower buds set next week.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-5',
    sectionName: 'Block 5: Certified Mother Trees & Grafting Nursery',
    treeCount: 650,
    variety: 'Certified KEPHIS Mother Scion Trees + Seedlings',
    spacingMeters: 'Nursery Tables / Shade Net (30%)',
    phenologicalStage: 'Fruit Set',
    soilHealthStatus: 'Optimal',
    scoutingStatus: 'Clean / Certified',
    assignedSupervisor: 'Dr. Devin Omwenga & David',
    lastInspectionDate: getRelativeDate(-2),
    notes: 'Mother trees fully disease-free under KEPHIS audit. 450 rootstock bags ready for top-cleft grafting next week with certified Hass scion budwood. Damping-off prevention drench applied.',
    actionPlan: 'Initiate cleft grafting batch next Monday using sterilized budding knives and paraffin sealing tape.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-6',
    sectionName: 'Packhouse & Cold Storage Bay (4.5°C Pre-Cooling)',
    treeCount: 0,
    variety: 'Post-Harvest Sorting, De-Sapping & Reefer Crating',
    spacingMeters: '400 sq meter Packhouse Facility',
    phenologicalStage: 'Harvesting',
    soilHealthStatus: 'Optimal',
    scoutingStatus: 'Clean / Certified',
    assignedSupervisor: 'Clerk Charles Mutisya',
    lastInspectionDate: getRelativeDate(0),
    notes: 'Container cold room running stably at 4.5°C with 85-90% relative humidity. De-sapping rollers sanitized with 150ppm food-grade sodium hypochlorite solution. 4kg carton export flats in stock.',
    actionPlan: 'Conduct calibration on Mettler Toledo digital bench scales prior to Kakuzi 10-ton container intake.',
    updatedAt: new Date().toISOString()
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
  { id: 'inv-3', name: 'Copper Oxychloride 50% WP', category: 'Chemical', quantity: 18, unit: 'kg', minStock: 5 },
  { id: 'inv-4', name: 'NPK 26:0:0 Fertilizer', category: 'Fertilizer', quantity: 15, unit: 'bags (50kg)', minStock: 5 },
  { id: 'inv-5', name: 'Tea Pruning Knives', category: 'Tools', quantity: 12, unit: 'units', minStock: 4 },
  { id: 'inv-6', name: 'Sun-Shield Copper White Trunk Paint', category: 'Chemical', quantity: 25, unit: 'liters', minStock: 8 },
  { id: 'inv-7', name: 'Pruning Wound Sealant (Copper-infused)', category: 'Tools', quantity: 10, unit: 'units', minStock: 3 },
  { id: 'inv-8', name: 'Potassium Phosphonate / Foli-R-Fos 400', category: 'Chemical', quantity: 12, unit: 'liters', minStock: 4 },
  { id: 'inv-9', name: 'Ridomil Gold MZ 68WG (Metalaxyl)', category: 'Chemical', quantity: 8, unit: 'kg', minStock: 2 },
  { id: 'inv-10', name: 'Kocide 2000 (Copper Hydroxide)', category: 'Chemical', quantity: 10, unit: 'kg', minStock: 3 },
  { id: 'inv-11', name: 'Abamectin 1.8% EC (Thrips & Mites)', category: 'Chemical', quantity: 6, unit: 'liters', minStock: 2 },
  { id: 'inv-12', name: 'Spinosad Bait GF-120 (Fruit Fly)', category: 'Chemical', quantity: 5, unit: 'liters', minStock: 2 },
  { id: 'inv-13', name: 'Agricultural Hydrated Lime (Trunk Wash)', category: 'Fertilizer', quantity: 20, unit: 'bags (25kg)', minStock: 5 },
  { id: 'inv-14', name: 'Zinc & Boron Chelated Foliar Feed', category: 'Fertilizer', quantity: 15, unit: 'liters', minStock: 4 }
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
    gender: 'Female',
    locality: 'Barn A - Stall 01',
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
    gender: 'Female',
    locality: 'Milking Shed 1',
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
    gender: 'Female',
    locality: 'Milking Shed 2',
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
    gender: 'Female',
    locality: 'Heifer Pen 3',
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
    gender: 'Female',
    locality: 'Maternity Paddock',
    notes: 'Awaiting calving due in early July.',
    sire: 'Alpine Ranger (AR-101)',
    dam: 'Swiss Heidi (SH-44)',
    grandSirePaternal: 'Sentry (S-555)',
    grandDamPaternal: 'Ranger Belle (RB-12)',
    grandSireMaternal: 'Swiss Edelweiss (SE-21)',
    grandDamMaternal: 'Heidi Pure (HP-01)',
    registrationNo: 'KAG-BS-2021-3938'
  },
  { 
    id: 'Bull-106 (Maximus)', 
    name: 'Maximus', 
    breed: 'Holstein-Friesian', 
    dob: '2020-05-14', 
    status: 'Bull', 
    gender: 'Male',
    locality: 'Bull Pen 1',
    notes: 'Active herd breeding sire and studbook bull.',
    sire: 'Supreme Champion Bull (SH-404)',
    dam: 'Meadow Queen (MQ-12)',
    grandSirePaternal: 'Friesian King (FK-99)',
    grandDamPaternal: 'Meadow Queen (MQ-12)',
    grandSireMaternal: 'Dairy Lord (DL-88)',
    grandDamMaternal: 'Super Milkmaid (SM-05)',
    registrationNo: 'KAG-HF-2020-1102'
  }
];

export const INITIAL_VET_RECORDS: VetRecord[] = [
  {
    id: 'vet-1',
    cowId: 'Cow-101 (Daisy)',
    cowName: 'Daisy',
    animalCategory: 'Cow',
    date: getRelativeDate(-15),
    type: 'Deworming',
    diseaseOrCondition: 'Internal Gastrointestinal Parasites',
    symptoms: 'Mild rough coat, periodic soft stools',
    causer: 'Internal parasites (Nematodes & Haemonchus contortus)',
    treatment: 'Valbazen Broad Spectrum Dewormer Drench',
    drugAdministered: 'Albendazole 10% Oral Suspension',
    drugUsedFromInventory: 'Albendazole 10% Oral Suspension (Store Alpha)',
    dosage: '60ml oral drench',
    administrationRoute: 'Oral',
    withdrawalMilkDays: 3,
    withdrawalMeatDays: 14,
    nextDueDate: getRelativeDate(75), // 90 days interval
    cost: 1550,
    staff: 'Dr. Devin Omwenga',
    recoveryStatus: 'Recovered',
    repeatMedicalNotes: 'Herd anthelmintic rotation planned in 75 days with levamisole.',
    notes: 'Dosed post-dry off. Excellent coat condition response.'
  },
  {
    id: 'vet-2',
    cowId: 'Cow-103 (Ruby)',
    cowName: 'Ruby',
    animalCategory: 'Cow',
    date: getRelativeDate(-8),
    type: 'Treatment',
    diseaseOrCondition: 'Clinical Mastitis (Left-Rear Quarter)',
    symptoms: 'Swollen inflamed quarter, clot flakes in milk, mild tenderness',
    causer: 'Bacterial infection (Streptococcus uberis / Environmental)',
    treatment: 'Intramammary Cefa-Lak + Pen-Strep systemic injection',
    drugAdministered: 'Penicillin-Streptomycin 20/20 + Cephapirin',
    drugUsedFromInventory: 'Penicillin-Streptomycin 100ml (Farm Pharmacy)',
    dosage: '20ml IM daily for 3 days + 1 intramammary tube',
    administrationRoute: 'Intramammary',
    withdrawalMilkDays: 5,
    withdrawalMeatDays: 10,
    cost: 3200,
    staff: 'Dr. Devin Omwenga',
    recoveryStatus: 'Recovered',
    repeatMedicalNotes: 'CMT test negative on day 5. Milk returned to bulk dispatch after withdrawal.',
    notes: 'Left rear quarter light mastitis flare. Cleared successfully, milk withdrawal ended.'
  },
  {
    id: 'vet-3',
    cowId: 'Cow-102 (Goldie)',
    cowName: 'Goldie',
    animalCategory: 'Cow',
    date: getRelativeDate(-2),
    type: 'Vaccination',
    diseaseOrCondition: 'Foot & Mouth Disease (FMD) Prophylaxis',
    symptoms: 'None (Healthy animal, prophylactic immunization)',
    causer: 'Viral exposure prevention (Aphthovirus SAT-1, SAT-2, O, A)',
    treatment: 'Quadrivalent Inactivated Foot & Mouth Vaccine',
    drugAdministered: 'FMD Quadrivalent Vaccine',
    drugUsedFromInventory: 'FMD Quadrivalent Vaccine (Cold Chain Refrigerator)',
    dosage: '2ml subcutaneous into dewlap',
    administrationRoute: 'SC',
    withdrawalMilkDays: 0,
    withdrawalMeatDays: 0,
    nextDueDate: getRelativeDate(180), // 6 months booster
    cost: 1200,
    staff: 'Dr. Devin Omwenga',
    recoveryStatus: 'Recovered',
    repeatMedicalNotes: 'Next herd booster due in 6 months. Cold chain maintained at 4°C.',
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
    id: 'mo-today',
    date: getRelativeDate(0),
    morningBuyerLiters: 0,
    morningBuyerName: 'Mama Mary (Contract Buyer)',
    morningBuyerPricePerLiter: 55,
    isSaturdayMorningNoBuyer: true,
    milkUsedAtHome: 4.0,
    milkUsedByWorkers: 5.0,
    milkUsedByCalf: 6.0,
    eveningLocalCashLiters: 22.0,
    eveningCashPricePerLiter: 60,
    eveningLocalDebtLiters: 5.0,
    eveningDebtPricePerLiter: 60,
    milkSpoiled: 0.0,
    debtsKsh: 300,
    debtCustomer: 'Mama Brian',
    notes: 'Saturday dispatch: morning buyer rested, morning milk sold locally in cash.'
  },
  {
    id: 'mo-fri',
    date: getRelativeDate(-1),
    morningBuyerLiters: 35.0,
    morningBuyerName: 'Mama Mary (Contract Buyer)',
    morningBuyerPricePerLiter: 55,
    isSaturdayMorningNoBuyer: false,
    morningBuyerPaidFriday: true,
    morningBuyerFridayPaymentDate: getRelativeDate(-1),
    milkUsedAtHome: 3.5,
    milkUsedByWorkers: 5.0,
    milkUsedByCalf: 6.0,
    eveningLocalCashLiters: 18.0,
    eveningCashPricePerLiter: 60,
    eveningLocalDebtLiters: 0,
    eveningDebtPricePerLiter: 60,
    milkSpoiled: 0.0,
    debtsKsh: 0,
    remittedToOwnerKsh: 1925,
    remittanceMethod: 'M-PESA',
    remittanceRef: 'QKL998231',
    notes: 'Friday delivery completed and weekly reconciliation settled.'
  },
  {
    id: 'mo-thu',
    date: getRelativeDate(-2),
    morningBuyerLiters: 33.0,
    morningBuyerName: 'Mama Mary (Contract Buyer)',
    morningBuyerPricePerLiter: 55,
    isSaturdayMorningNoBuyer: false,
    milkUsedAtHome: 4.0,
    milkUsedByWorkers: 5.0,
    milkUsedByCalf: 6.0,
    eveningLocalCashLiters: 16.5,
    eveningCashPricePerLiter: 60,
    eveningLocalDebtLiters: 3.0,
    eveningDebtPricePerLiter: 60,
    milkSpoiled: 0.0,
    debtsKsh: 180,
    debtCustomer: 'Pastor James',
    notes: 'Thursday delivery.'
  },
  {
    id: 'mo-wed',
    date: getRelativeDate(-3),
    morningBuyerLiters: 31.5,
    morningBuyerName: 'Mama Mary (Contract Buyer)',
    morningBuyerPricePerLiter: 55,
    isSaturdayMorningNoBuyer: false,
    milkUsedAtHome: 3.5,
    milkUsedByWorkers: 5.0,
    milkUsedByCalf: 6.0,
    eveningLocalCashLiters: 19.0,
    eveningCashPricePerLiter: 60,
    eveningLocalDebtLiters: 0,
    eveningDebtPricePerLiter: 60,
    milkSpoiled: 0.0,
    debtsKsh: 0,
    notes: 'Wednesday delivery.'
  },
  {
    id: 'mo-tue',
    date: getRelativeDate(-4),
    morningBuyerLiters: 34.0,
    morningBuyerName: 'Mama Mary (Contract Buyer)',
    morningBuyerPricePerLiter: 55,
    isSaturdayMorningNoBuyer: false,
    milkUsedAtHome: 4.0,
    milkUsedByWorkers: 5.0,
    milkUsedByCalf: 6.0,
    eveningLocalCashLiters: 17.0,
    eveningCashPricePerLiter: 60,
    eveningLocalDebtLiters: 4.0,
    eveningDebtPricePerLiter: 60,
    milkSpoiled: 0.0,
    debtsKsh: 240,
    debtCustomer: 'Mama Brian',
    notes: 'Tuesday delivery.'
  },
  {
    id: 'mo-mon',
    date: getRelativeDate(-5),
    morningBuyerLiters: 32.0,
    morningBuyerName: 'Mama Mary (Contract Buyer)',
    morningBuyerPricePerLiter: 55,
    isSaturdayMorningNoBuyer: false,
    milkUsedAtHome: 3.5,
    milkUsedByWorkers: 5.0,
    milkUsedByCalf: 6.0,
    eveningLocalCashLiters: 18.5,
    eveningCashPricePerLiter: 60,
    eveningLocalDebtLiters: 0,
    eveningDebtPricePerLiter: 60,
    milkSpoiled: 0.0,
    debtsKsh: 0,
    notes: 'Monday delivery.'
  }
];

export const INITIAL_MACHINES: MachineItem[] = [
  {
    id: 'mach-1',
    name: 'Truck V8',
    regNoOrSerial: 'KDL 450V',
    category: 'Heavy Fleet & Vehicles',
    modelOrSpecs: 'Toyota Land Cruiser 200 Series 4.5L V8 Twin Turbo Diesel (Heavy Farm Transport & Logistics)',
    condition: 'Excellent',
    status: 'Operational',
    assignedOperator: 'David (Lead Driver)',
    currentUsageMetric: '142,300 KM',
    fuelOrPowerType: 'Diesel',
    purchaseDate: '2021-04-12',
    purchaseCostKes: 6800000,
    lastServiceDate: getRelativeDate(-12),
    nextServiceDueDate: getFutureDate(78),
    notes: 'Primary heavy farm tow rig, bulk produce hauler, and long-distance cattle transit rig.'
  },
  {
    id: 'mach-2',
    name: 'New Model Harrier',
    regNoOrSerial: 'KDA 980H',
    category: 'Heavy Fleet & Vehicles',
    modelOrSpecs: 'Toyota Harrier 2.5L Hybrid (80-Series New Model) Executive Farm Operations SUV',
    condition: 'Brand New',
    status: 'Operational',
    assignedOperator: 'Dr. Devin Omwenga (Farm Manager)',
    currentUsageMetric: '28,400 KM',
    fuelOrPowerType: 'Petrol',
    purchaseDate: '2023-08-15',
    purchaseCostKes: 4950000,
    lastServiceDate: getRelativeDate(-20),
    nextServiceDueDate: getFutureDate(70),
    notes: 'Management field inspection, export client tours, and executive estate coordination.'
  },
  {
    id: 'mach-3',
    name: 'Tractor',
    regNoOrSerial: 'TRAC-01 (KT-375A)',
    category: 'Tractors & Field Implements',
    modelOrSpecs: 'Massey Ferguson 375 4WD 75HP Heavy-Duty Agricultural Tractor',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'David (Tractor Operator)',
    currentUsageMetric: '3,850 Operating Hours',
    fuelOrPowerType: 'Diesel',
    purchaseDate: '2019-11-20',
    purchaseCostKes: 3200000,
    lastServiceDate: getRelativeDate(-25),
    nextServiceDueDate: getFutureDate(65),
    notes: 'Main workhorse for heavy ploughing, harrowing, trailer hauling, and PTO silage cutting.'
  },
  {
    id: 'mach-4',
    name: 'Chaffcutter',
    regNoOrSerial: 'CC-01 (HD-10HP)',
    category: 'Fodder & Feed Processing',
    modelOrSpecs: 'Commercial 3-Phase 10HP High-Speed Napier & Super Boma Silage Chopper (3 Tons/Hr)',
    condition: 'Excellent',
    status: 'Operational',
    assignedOperator: 'Mosoti (Silage Team)',
    currentUsageMetric: '1,420 Hours',
    fuelOrPowerType: 'Electric (3-Phase)',
    purchaseDate: '2022-02-10',
    purchaseCostKes: 220000,
    lastServiceDate: getRelativeDate(-8),
    nextServiceDueDate: getFutureDate(22),
    notes: 'Rotary reversible hardened manganese blades. Daily Napier chopping for dairy herd TMR.'
  },
  {
    id: 'mach-5',
    name: 'Brush Cutter',
    regNoOrSerial: 'BC-02 (Stihl FS 450)',
    category: 'Workshop & Power Tools',
    modelOrSpecs: 'Stihl FS 450 Heavy-Duty Professional 2-Stroke Motorized Clearing Saw & Trimmer',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'Casual Crew Lead (David)',
    currentUsageMetric: '460 Hours',
    fuelOrPowerType: 'Petrol',
    purchaseDate: '2022-06-18',
    purchaseCostKes: 78000,
    lastServiceDate: getRelativeDate(-15),
    nextServiceDueDate: getFutureDate(45),
    notes: 'Used for avocado orchard row clearing, fence line maintenance, and road reserve trimming.'
  },
  {
    id: 'mach-6',
    name: 'Metal Grinder',
    regNoOrSerial: 'MG-01 (Bosch GWS)',
    category: 'Workshop & Power Tools',
    modelOrSpecs: 'Bosch Professional GWS 2200W 230mm Heavy Industrial Workshop Angle Grinder',
    condition: 'Excellent',
    status: 'Operational',
    assignedOperator: 'Mosoti (Workshop Fabricator)',
    currentUsageMetric: '310 Hours',
    fuelOrPowerType: 'Electric (Single Phase)',
    purchaseDate: '2021-09-05',
    purchaseCostKes: 24500,
    lastServiceDate: getRelativeDate(-30),
    nextServiceDueDate: getFutureDate(60),
    notes: 'Used for sharpening chaffcutter blades, disc plough refurbishment, gate welding, and repairs.'
  },
  {
    id: 'mach-7',
    name: 'Hammer Mill',
    regNoOrSerial: 'HM-03 (15HP Grinder)',
    category: 'Fodder & Feed Processing',
    modelOrSpecs: '15HP High-Speed Multi-Screen Hammer Mill for Maize, Soya, Minerals & Dry Feed Meals',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'David',
    currentUsageMetric: '890 Hours',
    fuelOrPowerType: 'Electric (3-Phase)',
    purchaseDate: '2021-03-14',
    purchaseCostKes: 285000,
    lastServiceDate: getRelativeDate(-18),
    nextServiceDueDate: getFutureDate(42),
    notes: 'Fitted with 2mm & 4mm interchangeable stainless screens. Weekly dairy meal formulation.'
  },
  {
    id: 'mach-8',
    name: 'Feed Mixer',
    regNoOrSerial: 'FM-01 (TMR 1.5-Ton)',
    category: 'Fodder & Feed Processing',
    modelOrSpecs: 'Horizontal Twin-Auger Industrial Dairy TMR Feed Mixer & Molasses Injector (1.5-Ton)',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'Josephine & Mosoti',
    currentUsageMetric: '720 Hours',
    fuelOrPowerType: 'Electric (3-Phase)',
    purchaseDate: '2022-07-22',
    purchaseCostKes: 480000,
    lastServiceDate: getRelativeDate(-10),
    nextServiceDueDate: getFutureDate(50),
    notes: 'Homogeneous mixing of silage, dairy meal, wheat bran, and mineral premixes with zero segregation.'
  },
  {
    id: 'mach-9',
    name: 'Powersaw',
    regNoOrSerial: 'PS-01 (Stihl MS 382)',
    category: 'Workshop & Power Tools',
    modelOrSpecs: 'Stihl MS 382 Heavy Professional Timber Chainsaw (72.2cc, 25-inch Bar)',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'David',
    currentUsageMetric: '280 Hours',
    fuelOrPowerType: 'Petrol',
    purchaseDate: '2020-10-11',
    purchaseCostKes: 95000,
    lastServiceDate: getRelativeDate(-14),
    nextServiceDueDate: getFutureDate(46),
    notes: 'Felling windbreak timber, avocado canopy heavy limb pruning, and farm firewood cutting.'
  },
  {
    id: 'mach-10',
    name: 'Water Cleaner / Plant',
    regNoOrSerial: 'WTP-01 (Borehole RO)',
    category: 'Spraying & Water Utilities',
    modelOrSpecs: 'Automated Deep Borehole Multi-Stage Sand/Carbon Filter, UV Sterilizer & RO Booster Plant',
    condition: 'Excellent',
    status: 'Operational',
    assignedOperator: 'Dr. Devin Omwenga & Mosoti',
    currentUsageMetric: '4,200 Operating Hours',
    fuelOrPowerType: 'Electric (3-Phase)',
    purchaseDate: '2022-01-20',
    purchaseCostKes: 1250000,
    lastServiceDate: getRelativeDate(-7),
    nextServiceDueDate: getFutureDate(23),
    notes: 'Clean drinking water for livestock dairy parlor, staff quarters, and spray water purification.'
  },
  {
    id: 'mach-11',
    name: 'Automatic Knapsack',
    regNoOrSerial: 'AKS-01 (Electric 16L)',
    category: 'Spraying & Water Utilities',
    modelOrSpecs: '16L Lithium-Ion Battery Powered Automatic Constant-Pressure Knapsack Sprayer',
    condition: 'Brand New',
    status: 'Operational',
    assignedOperator: 'Josephine',
    currentUsageMetric: '140 Hours',
    fuelOrPowerType: 'Battery / Solar',
    purchaseDate: '2023-11-04',
    purchaseCostKes: 18500,
    lastServiceDate: getRelativeDate(-5),
    nextServiceDueDate: getFutureDate(25),
    notes: 'Equipped with pressure regulator for uniform avocado fungicide and foliar nutrient spraying.'
  },
  {
    id: 'mach-12',
    name: 'TukTuk',
    regNoOrSerial: 'KT-812C',
    category: 'Heavy Fleet & Vehicles',
    modelOrSpecs: 'Bajaj Maxima Cargo 470cc Single-Cylinder Diesel 3-Wheeler Estate Feeder',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'David',
    currentUsageMetric: '34,200 KM',
    fuelOrPowerType: 'Diesel',
    purchaseDate: '2021-05-19',
    purchaseCostKes: 520000,
    lastServiceDate: getRelativeDate(-16),
    nextServiceDueDate: getFutureDate(44),
    notes: 'Milk delivery to collection center, tea leaf field ferry, and daily feed bunk distribution.'
  },
  {
    id: 'mach-13',
    name: 'Disc Plough',
    regNoOrSerial: 'DP-03 (Baldan 3-Disc)',
    category: 'Tractors & Field Implements',
    modelOrSpecs: 'Baldan Heavy-Duty 3-Disc Reversible Tractor Trailed Plough (26-inch Discs)',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'David',
    currentUsageMetric: '620 Hectares',
    fuelOrPowerType: 'PTO-driven',
    purchaseDate: '2020-03-15',
    purchaseCostKes: 380000,
    lastServiceDate: getRelativeDate(-40),
    nextServiceDueDate: getFutureDate(50),
    notes: 'Greased hubs and sharpened scraper blades. Deep virgin land preparation and pasture renewal.'
  },
  {
    id: 'mach-14',
    name: 'Harrows',
    regNoOrSerial: 'HR-02 (24-Disc Tandem)',
    category: 'Tractors & Field Implements',
    modelOrSpecs: '24-Disc Heavy Offset Tandem Cultivator Harrow & Clod Pulverizer',
    condition: 'Good Working Condition',
    status: 'Operational',
    assignedOperator: 'David',
    currentUsageMetric: '580 Hectares',
    fuelOrPowerType: 'PTO-driven',
    purchaseDate: '2020-04-10',
    purchaseCostKes: 420000,
    lastServiceDate: getRelativeDate(-35),
    nextServiceDueDate: getFutureDate(55),
    notes: 'Secondary seedbed preparation for Napier, maize, and pasture planting.'
  },
  {
    id: 'mach-15',
    name: 'Dual Pulverizing Machine',
    regNoOrSerial: 'DPM-01 (Dual Chamber)',
    category: 'Fodder & Feed Processing',
    modelOrSpecs: 'Dual-Chamber Micro-Pulverizer for Calcitic Lime, Bone Meal, Eggshells & Mineral Salts',
    condition: 'Excellent',
    status: 'Operational',
    assignedOperator: 'Mosoti',
    currentUsageMetric: '390 Hours',
    fuelOrPowerType: 'Electric (3-Phase)',
    purchaseDate: '2022-10-08',
    purchaseCostKes: 340000,
    lastServiceDate: getRelativeDate(-11),
    nextServiceDueDate: getFutureDate(49),
    notes: 'Produces ultra-fine calcium and mineral meal supplements for poultry and lactating dairy cows.'
  },
  {
    id: 'mach-16',
    name: 'Vacuum Machine',
    regNoOrSerial: 'VM-01 (De Laval Rotary)',
    category: 'Dairy & Processing Equipment',
    modelOrSpecs: 'Industrial Twin-Pump Dairy Milking Oil-Vane Vacuum Unit & Vacuum Packaging Sealer',
    condition: 'Excellent',
    status: 'Operational',
    assignedOperator: 'Josephine (Dairy Lead)',
    currentUsageMetric: '2,900 Hours',
    fuelOrPowerType: 'Electric (Single Phase)',
    purchaseDate: '2021-08-30',
    purchaseCostKes: 310000,
    lastServiceDate: getRelativeDate(-6),
    nextServiceDueDate: getFutureDate(24),
    notes: 'Provides constant 48 kPa vacuum for automated dairy milking claw clusters; sanitary filter replaced.'
  }
];

export const INITIAL_MACHINE_SERVICES: MachineServiceRecord[] = [
  {
    id: 'srv-1',
    machineId: 'mach-1',
    machineName: 'Truck V8',
    regNoOrSerial: 'KDL 450V',
    serviceDate: getRelativeDate(-12),
    serviceTicketRef: 'SRV-2026-081',
    serviceType: 'Routine Scheduled Service',
    whatWasServiced: 'Changed synthetic engine oil (10W-40 10L), replaced oil filter & primary fuel filter, cleaned air filter, bled brake lines, lubricated propeller shaft universal joints, rotated all terrain tires.',
    servicedBy: 'Toyota Kenya Authorized Garage',
    cost: 18500,
    sparePartsUsed: '1x Genuine Toyota Oil Filter, 1x Fuel Filter, 10L Castrol 10W-40 Diesel Oil',
    conditionAfterService: 'Excellent',
    nextServiceDate: getFutureDate(78),
    nextServiceKmOrHours: 'At 147,000 KM',
    remarksOrNotes: 'Twin turbo boost pressure nominal. Suspension bushings in top condition.',
    postToFinances: true,
    status: 'Completed'
  },
  {
    id: 'srv-2',
    machineId: 'mach-3',
    machineName: 'Tractor',
    regNoOrSerial: 'TRAC-01 (KT-375A)',
    serviceDate: getRelativeDate(-25),
    serviceTicketRef: 'SRV-2026-072',
    serviceType: 'Hydraulic & Transmission',
    whatWasServiced: 'Drained and renewed hydraulic transmission fluid (45L UTTO), changed dual spin-on hydraulic filters, tightened 3-point linkage stabilizer arms, adjusted clutch free-play.',
    servicedBy: 'Agri-Mechanic Field Services (Eng. Kiprono)',
    cost: 26000,
    sparePartsUsed: '45L Shell Spirax S4 TXM Hydraulic Oil, 2x Donaldson Hydraulic Filters',
    conditionAfterService: 'Good Working Condition',
    nextServiceDate: getFutureDate(65),
    nextServiceKmOrHours: 'At 4,100 Hours',
    remarksOrNotes: 'PTO shaft seal holding dry with zero seepage. Full hydraulic lift power restored.',
    postToFinances: true,
    status: 'Completed'
  },
  {
    id: 'srv-3',
    machineId: 'mach-4',
    machineName: 'Chaffcutter',
    regNoOrSerial: 'CC-01 (HD-10HP)',
    serviceDate: getRelativeDate(-8),
    serviceTicketRef: 'SRV-2026-085',
    serviceType: 'Blade / Tool Sharpening & Replacement',
    whatWasServiced: 'Removed, dressed and precision ground 6 rotary cutting blades. Adjusted counter-shear anvil clearance to 0.8mm for clean silage cut. Greased high-speed pillow block bearings.',
    servicedBy: 'Internal Workshop - Mosoti',
    cost: 3200,
    sparePartsUsed: 'High-temperature lithium bearing grease, 2x lock nuts',
    conditionAfterService: 'Excellent',
    nextServiceDate: getFutureDate(22),
    nextServiceKmOrHours: 'After 100 Tons silage processing',
    remarksOrNotes: 'Napier chop length uniform at 1.5cm; zero bruising or jamming.',
    postToFinances: true,
    status: 'Completed'
  },
  {
    id: 'srv-4',
    machineId: 'mach-10',
    machineName: 'Water Cleaner / Plant',
    regNoOrSerial: 'WTP-01 (Borehole RO)',
    serviceDate: getRelativeDate(-7),
    serviceTicketRef: 'SRV-2026-088',
    serviceType: 'Routine Scheduled Service',
    whatWasServiced: 'Backwashed multi-media quartz sand and activated carbon columns. Replaced 5-micron spun polypropylene sediment pre-filter cartridges. Chemical CIP sanitize of reverse osmosis membrane.',
    servicedBy: 'WaterTech Engineering Ltd',
    cost: 8500,
    sparePartsUsed: '3x 20-inch 5-Micron Spun Filters, Food-Grade Citric Acid Descaler',
    conditionAfterService: 'Excellent',
    nextServiceDate: getFutureDate(23),
    nextServiceKmOrHours: 'Monthly maintenance',
    remarksOrNotes: 'Permeate TDS tested at 48 ppm; water clarity crystal clear with zero odor.',
    postToFinances: true,
    status: 'Completed'
  },
  {
    id: 'srv-5',
    machineId: 'mach-16',
    machineName: 'Vacuum Machine',
    regNoOrSerial: 'VM-01 (De Laval Rotary)',
    serviceDate: getRelativeDate(-6),
    serviceTicketRef: 'SRV-2026-090',
    serviceType: 'Oil & Filter Change',
    whatWasServiced: 'Flushed oil reservoir and replenished ISO 68 food-grade vacuum pump oil. Replaced exhaust mist separator element. Verified vacuum regulator setpoint at 48.0 kPa.',
    servicedBy: 'De Laval Technical Service',
    cost: 4500,
    sparePartsUsed: '2L De Laval Genuine Vacuum Pump Oil, 1x Exhaust Air Filter',
    conditionAfterService: 'Excellent',
    nextServiceDate: getFutureDate(24),
    nextServiceKmOrHours: 'At 3,150 Hours',
    remarksOrNotes: 'Milking pulsation rate synchronized at 60 ppm with 60:40 milk-to-rest ratio.',
    postToFinances: true,
    status: 'Completed'
  }
];




