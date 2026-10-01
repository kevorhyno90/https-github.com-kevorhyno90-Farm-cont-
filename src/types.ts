/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MilkingRecord {
  id: string; // Cow tag
  am: number; // Morning Liters
  pm: number; // Afternoon Liters
  staff: string; // Recorder staff
  date: string; // YYYY-MM-DD
  pricePerLiter?: number;
  buyer?: string;
  totalSales?: number;
  // Dispatch details included inside milk log record
  milkUsedAtHome?: number;
  milkUsedByWorkers?: number;
  milkUsedByCalf?: number;
  milkSpoiled?: number;
  debtsKsh?: number;
  debtCustomer?: string;
  debtsList?: { debtor: string; amount: number }[];
  notes?: string;
}

export interface AIRecord {
  cowId: string;
  date: string; // Service Date YYYY-MM-DD (Date inseminated)
  bull: string; // Semen / Bull details (Bull Name)
  semenRefId?: string; // Linked semen inventory straw ID when sourced from stock
  due: string; // Expected due date YYYY-MM-DD (Expected calving date)
  status: 'Pending' | 'Confirmed Pregnant' | 'Calved' | 'Failed';
  checkDate?: string; // Verification check date YYYY-MM-DD
  origin?: string; // origin of semen (Local/Imported)
  semenType?: string; // semen type (from semen inventory)
  cost?: number; // semen/straw cost
  returnHeatDate?: string; // Return heat date (autocalculated)
  calfName?: string; // calf name (auto added to calf registry)
  notes?: string;
}

export interface SemenInventoryItem {
  id: string; // straw reference / ID
  bullName: string;
  breed: string;
  semenType: string; // e.g. "Sexed (Female)", "Sexed (Male)", "Conventional"
  origin: string; // e.g. "Imported (USA)", "Imported (EU)", "Local (KAGRC)"
  cost: number;
  quantity: number; // straw stock count
}

export interface TeaRecord {
  qty: number; // Total Daily Harvest KG (casualPluckedKg + employeePluckedKg)
  ref: string; // Daily Collection List / Ticket Ref (e.g. KTDA-REC-8921)
  date: string; // YYYY-MM-DD
  pricePerKg?: number; // Factory/KTDA base price per KG (e.g. 58)
  buyer?: string; // e.g. "Chinga KTDA Factory", "Buying Center 03"
  totalSales?: number; // qty * pricePerKg
  casualPluckedKg?: number; // KG plucked by casual workers
  employeePluckedKg?: number; // KG plucked by permanent staff/employees
  casualRatePerKg?: number; // Rate paid per KG to casuals (default Ksh 12/kg)
  casualPayoutKes?: number; // Cash payable that week to casuals = casualPluckedKg * casualRatePerKg
  saturdayPayoutDate?: string; // The Saturday date of that week when casuals are paid
  casualPaymentStatus?: 'Pending Saturday Payout' | 'Paid / Disbursed' | 'Partial';
  blockOrZone?: string; // e.g. "Tea Block 1 - Upper Ridge"
  notes?: string;
}

export interface TeaPracticeRecord {
  id: string;
  practiceType: 'Pruning' | 'Fertilizer Application' | 'Weeding' | 'Pest & Disease Control' | 'Infilling' | 'Plucking Table Maintenance' | 'Drainage & Soil Conservation' | string;
  date: string; // When the practice was performed (YYYY-MM-DD)
  who: string; // Who performed it (e.g. "James Odhiambo & 4 Casuals", "Dr. Devin Omwenga")
  how: string; // How it was done / Method / Dosage (e.g. "Cut-back pruning to 24 inches with sterilized hand shears, sealed with copper paste")
  reason: string; // Why it was done (e.g. "Rejuvenate plucking table after 4-year cycle")
  blockOrZone: string; // Which block (e.g. "Tea Block 1 - Upper Ridge")
  nextDueDate: string; // Next time the practice will be done again (YYYY-MM-DD)
  costKes?: number; // Direct cash expense if any (e.g. fertilizer cost, casual day wages)
  notes?: string;
}

export interface AvocadoRecord {
  ref: string; // Unique reference identifier
  date: string; // Harvest/Export date (YYYY-MM-DD)
  grade1Kg: number; // Grade 1 quantity in KGs
  grade1PricePerKg: number; // Price per KG for Grade 1
  rejectKg: number; // Reject quantity in KGs
  priceForRejects: number; // Price per KG for rejects
  grade1Buyer: string; // Buyer for Grade 1
  rejectBuyer: string; // Buyer for rejects
  paymentMode: string; // E.g. Cash, Bank Transfer, Deferred
  nextHarvestSeason: string; // E.g. Oct-Dec Main Season, Mar-May Fly Crop
  paymentModeNextHarvestSeason?: string; // Legacy field for safety
  debts: number; // Debts on this lot
  notes: string; // General notes/remarks
  totalSales: number; // Autocalculated total money got
  sectionOrBlock?: string; // E.g. "Block 1 - Lower Valley Hass"
  buyerContact?: string; // E.g. "+254 712 345 678 / logistics@kakuzi.co.ke"
  rejectReason?: string; // E.g. "Scab & Thrips marking", "Sunburn", "Undersized < 150g"
  paymentStatus?: 'Paid' | 'Pending' | 'Partial';
  rejectionLossKes?: number; // Cost of rejects: rejectKg * (grade1PricePerKg - priceForRejects)
  rejectionRatePct?: number; // (rejectKg / (grade1Kg + rejectKg)) * 100
}

export interface AvocadoPracticeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  sectionOrBlock: string; // E.g. "Block 1 - Lower Valley Hass", "Block 2 - East Ridge Hass", "Block 3 - Fuerte", "Nursery", "All Blocks"
  practiceType: 'Disease Treatment' | 'Pruning' | 'Weeding' | 'Painting Copper White Paint' | 'Foliar Nutrition' | 'Irrigation & Mulching';
  targetDiseaseOrPest?: string; // E.g. "Anthracnose", "Phytophthora Root Rot", "Cercospora", "Scab", "Sun Scald Protection", "Skirt Clearance 0.5m", "Ring Mulching"
  drugOrChemicalName?: string; // E.g. "Copper Oxychloride 50% WP", "Ridomil Gold MZ", "Potassium Phosphonate", "Sun-Shield Copper White Paint"
  inventoryItemId?: string; // ID of item in inventory
  inventoryQtyDeducted?: number; // Amount deducted from inventory
  inventoryUnit?: string; // E.g. "kg", "liters", "units"
  dosageAndMethod: string; // E.g. "50g/20L knapsack canopy spray", "1:1 Copper paint 1m up lower trunk with brush", "Soil drench 15L per tree"
  operator: string; // Person who performed it (e.g. "Josephine", "David", "Mosoti")
  phiDays?: number; // Pre-Harvest Interval (days)
  reason: string; // Why it was done
  nextDueDate: string; // Next time the practice will be done again (YYYY-MM-DD)
  costKes?: number; // Direct cash expense if any
  notes?: string;
  status?: 'Completed' | 'Scheduled' | 'Overdue';
}

export interface AvocadoSectionNote {
  id: string;
  sectionName: string; // E.g. "Block 1: Lower Valley Hass", "Block 2: East Ridge Hass", "Block 3: Fuerte Orchard", "Block 4: Young Grafted Orchard", "Nursery & Mother Trees", "Packhouse & Cold Storage"
  treeCount: number;
  variety: string; // E.g. "Hass on Duke 7", "Fuerte & Bacon", "Hass Grafted Saplings"
  spacingMeters?: string; // E.g. "5m x 5m (High Density)"
  phenologicalStage: 'Flowering' | 'Fruit Set' | 'Fruit Growth / Enlargement' | 'Maturity & Dry Matter Testing' | 'Harvesting' | 'Post-Harvest Dormancy';
  soilHealthStatus: 'Optimal' | 'Low Nitrogen' | 'Needs Zinc & Boron' | 'High Moisture / Waterlogging Risk';
  scoutingStatus: 'Clean / Certified' | 'Minor Thrips Spotted' | 'Pheromone Trap Warning' | 'Phytophthora Monitored';
  assignedSupervisor: string; // E.g. "Josephine (Lead Agronomist)", "David"
  lastInspectionDate: string; // YYYY-MM-DD
  notes: string; // Rich field observation note
  actionPlan: string; // Next scheduled remedial action
  updatedAt: string;
}


export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number; // Ksh
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
}

export interface SprayRecord {
  id: string;
  block: string;
  chemical: string;
  phi: number; // Pre-Harvest Interval in days
  target: string; // Pest / Disease
  date: string; // Spray Date YYYY-MM-DD
  safeDate: string; // Date after PHI YYYY-MM-DD
  nextSprayDate?: string; // Next spraying date YYYY-MM-DD
  intervalDays?: number; // Days before next spraying
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  assigneeName?: string;
}

export interface ActivityLogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export interface Ingredient {
  name: string;
  cp: number; // Crude Protein %
  me: number; // Metabolizable Energy (MJ/kg DM)
  cost?: number; // Cost per KG Ksh
  category?: string; // Material category (e.g., Fodder, Concentrate, Mineral)
}

export interface BatchIngredient {
  name: string;
  amount: number; // KG in the mix
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  unit: 'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General';
  phone: string;
  shiftMorning: string;
  shiftAfternoon: string;
  status: 'Present' | 'Off' | 'On Leave';

  // Enhanced fields (all optional to ensure 100% backward compatibility with existing data)
  nationalId?: string;
  joiningDate?: string;
  contractType?: 'Permanent' | 'Contract' | 'Casual' | 'Intern';
  wageType?: 'Monthly' | 'Daily' | 'Piece-rate';
  baseSalary?: number; // Base monthly salary or daily rate (KES)
  dailyRate?: number;
  mpesaNumber?: string;
  bankDetails?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedStation?: string;
  notes?: string;
  gender?: 'Male' | 'Female' | 'Other';
  annualLeaveEntitlement?: number; // Statutory or agreed annual leave days (default 21)
}

export interface DailyAttendanceRecord {
  date: string; // YYYY-MM-DD
  records: {
    [staffId: string]: {
      status: 'Present' | 'Off' | 'On Leave' | 'Half Day';
      checkInTime?: string;
      notes?: string;
    };
  };
}

export interface LivestockRecord {
  id: string;
  type: 'Poultry' | 'Dogs';
  name: string; // e.g. "Layers Batch A" or "Max (Guard)"
  countOrBreed: string; // "500 birds" or "German Shepherd"
  activity: string; // "Egg Collection", "Vaccination", etc.
  notes: string;
  date: string;
  price?: number;
  buyer?: string;
  totalSales?: number;
  gender?: 'Female' | 'Male' | 'Mixed' | string;
}

export interface FieldRecord {
  id: string;
  blockName: string;
  cropType: string; // "Maize", "Napier", "Eucalyptus"
  acreage: number;
  status: string; // "Growing", "Harvested", "Prepared"
  notes: string;
  date: string;
  
  // High-fidelity agricultural fields
  soilPh?: number;
  lastFertilizerDate?: string;
  projectedHarvestVolume?: string;
  irrigationMethod?: 'Drip' | 'Overhead' | 'Rainfed' | 'Manual' | 'None';
  datePlanted?: string;
}

export type InventoryCategory = 
  | 'Feeds & Raw Ingredients'
  | 'Veterinary & Animal Drugs'
  | 'Crop Protection & Agrochemicals'
  | 'Farm Tools & Implements'
  | 'Machinery & Milking Equipment'
  | 'Detergents & Biosecurity Hygiene'
  | 'Feed'
  | 'Chemical'
  | 'Machine Parts'
  | 'Tools'
  | 'Fencing'
  | 'Fertilizer';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string; // "bags (50kg)", "litres", "KG", "bottles (100ml)", "units/pieces", "doses", "sachets"
  minStock: number;
  dateReceived?: string; // YYYY-MM-DD
  location?: string; // e.g. "Feed Warehouse Bay 2", "Vet Pharmacy Cabinet", "Chemical Shed", "Parlour Wash Bay"
  expiryDate?: string; // YYYY-MM-DD
  intendedUse?: string; // e.g. "Post-milking teat dip", "Late blight fungicide", "High protein lactating cow feed"
  unitCostKes?: number;
  supplier?: string;
  batchNumber?: string;
  lastUsedDate?: string;
  lastRestockedDate?: string;
  notes?: string;
}

export type InventorySectionTarget = 
  | 'Dairy Herd & Parlour'
  | 'Poultry & Avian'
  | 'Horticulture & Crops'
  | 'Goat Dairy'
  | 'Calf Nursery'
  | 'Canines & Security'
  | 'General Farm Operations';

export interface InventoryMovementLog {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  movementType: 'Consumption / Usage' | 'Restock / Purchase' | 'Adjustment / Audit' | 'Expired Disposal';
  quantityChanged: number;
  quantityBefore: number;
  quantityAfter: number;
  unit: string;
  usedBySection: InventorySectionTarget;
  purposeOrReason: string;
  loggedBy: string;
  date: string; // YYYY-MM-DD
  costKes?: number;
}

export interface MachineItem {
  id: string;
  name: string; // e.g. "Truck V8", "New Model Harrier", "Tractor", "Chaffcutter", etc.
  regNoOrSerial: string; // e.g. "KDL 450V", "KDA 980H", "TRAC-MF-375"
  category: 'Heavy Fleet & Vehicles' | 'Tractors & Field Implements' | 'Fodder & Feed Processing' | 'Workshop & Power Tools' | 'Spraying & Water Utilities' | 'Dairy & Processing Equipment';
  modelOrSpecs: string; // e.g. "Toyota Land Cruiser V8 4.5L Twin Turbo", "Massey Ferguson 375 75HP"
  condition: 'Brand New' | 'Excellent' | 'Good Working Condition' | 'Fair / Needs Attention' | 'Critical Repair / Breakdown';
  status: 'Operational' | 'In Use' | 'Under Maintenance' | 'Awaiting Spares' | 'Standby';
  assignedOperator: string; // e.g. "David (Lead Driver)", "Mosoti", "Josephine"
  currentUsageMetric: string; // e.g. "124,500 KM", "3,420 Hours", "850 Operating Hours"
  fuelOrPowerType: 'Diesel' | 'Petrol' | 'Electric (3-Phase)' | 'Electric (Single Phase)' | 'Battery / Solar' | 'PTO-driven' | 'Manual';
  purchaseDate?: string; // YYYY-MM-DD
  purchaseCostKes?: number;
  lastServiceDate?: string; // YYYY-MM-DD
  nextServiceDueDate?: string; // YYYY-MM-DD
  notes?: string;
}

export interface MachineServiceRecord {
  id: string;
  machineId: string; // Links to MachineItem.id
  machineName: string;
  regNoOrSerial: string;
  serviceDate: string; // YYYY-MM-DD
  serviceTicketRef: string; // e.g. "SRV-2026-081"
  serviceType: 'Routine Scheduled Service' | 'Major Engine Overhaul' | 'Oil & Filter Change' | 'Hydraulic & Transmission' | 'Blade / Tool Sharpening & Replacement' | 'Electrical & Battery' | 'Emergency Breakdown Repair';
  whatWasServiced: string; // Details of service work done
  servicedBy: string; // Mechanic / Garage / Operator
  cost: number; // Cost in KES
  sparePartsUsed?: string; // Spare parts / lubricants used
  conditionAfterService: 'Brand New' | 'Excellent' | 'Good Working Condition' | 'Fair / Needs Attention' | 'Critical Repair / Breakdown';
  nextServiceDate: string; // YYYY-MM-DD
  nextServiceKmOrHours?: string; // e.g. "135,000 KM" or "3,650 Hours"
  remarksOrNotes: string; // Notes / remarks on service outcome
  postToFinances?: boolean; // Synced to financials
  status?: 'Completed' | 'In Progress' | 'Scheduled';
}


export interface StaffOffRecord {
  id: string;
  staffId: string;
  staffName: string;
  type: 'Day Off' | 'Annual Leave' | 'Sick Leave' | 'Compassionate Leave';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes?: string;
  status: 'Approved' | 'Pending' | 'Completed';

  // Smart departure & return tracking
  departureTime?: string; // e.g. "05:00 PM"
  returnTime?: string; // e.g. "07:00 AM"
  actualReturnDate?: string; // YYYY-MM-DD
  nextScheduledOffDate?: string; // YYYY-MM-DD (next scheduled off rotation)
  handoverStaffId?: string;
  handoverStaffName?: string;
}

export interface Cow {
  id: string; // Cow tag
  name: string;
  breed: string;
  dob: string;
  status: 'Lactating' | 'Dry' | 'Heifer' | 'In-Calf' | 'Bull' | 'Steer' | 'Calf' | string;
  gender?: 'Female' | 'Male' | string;
  locality?: string; // Barn, Pen, Shed, Paddock, or Pasture Locality
  notes: string;
  sire?: string;
  dam?: string;
  grandSirePaternal?: string;
  grandDamPaternal?: string;
  grandSireMaternal?: string;
  grandDamMaternal?: string;
  registrationNo?: string;
  peakYieldTarget?: number; // Custom target for Peak Dairy status (defaults to 30)
}

export interface VetRecord {
  id: string;
  cowId: string; // Cow tag or general livestock ID
  cowName?: string; // Friendly name from registry
  animalCategory?: 'Cow' | 'Bull' | 'Heifer' | 'Calf' | 'Goat' | 'Poultry' | 'Dog' | 'Other';
  date: string; // YYYY-MM-DD
  type: 'Deworming' | 'Treatment' | 'Vaccination' | 'General Practice';
  diseaseOrCondition?: string; // e.g. Mastitis, East Coast Fever (ECF), Foot & Mouth Disease, Anaplasmosis, etc.
  symptoms?: string; // Clinical signs & symptoms observed
  causer?: string; // Suspected cause / vector / etiology: e.g. Tick vector, Bacterial, Viral, Parasitic, Metabolic
  treatment: string; // Intervention / Procedure description
  drugAdministered?: string; // Active drug or formulation
  drugUsedFromInventory?: string; // Inventory drug/item name or pharmacy stock
  dosage?: string;
  administrationRoute?: 'IM' | 'IV' | 'SC' | 'Oral' | 'Topical' | 'Intramammary' | 'Other';
  cost: number; // Ksh
  staff: string;
  notes: string;
  repeatMedicalNotes?: string; // Repeat notes, follow-up medical review, recovery evaluation
  nextDueDate?: string; // YYYY-MM-DD (next scheduled treatment or review date)
  nextTreatmentDate?: string; // Alias / explicit date for next treatment / repeat
  recoveryStatus?: 'Under Treatment' | 'Recovered' | 'Scheduled Repeat' | 'Critical' | 'Chronic' | 'Resolved' | 'Discontinued' | string;
  
  // Veterinary Clinical Parameters
  diagnosis?: string;
  temperature?: number; // °C
  heartRate?: number; // bpm
  respiratoryRate?: number; // breaths/min
  withdrawalMilkDays?: number;
  withdrawalMeatDays?: number;
  prognosis?: 'Good' | 'Fair' | 'Guarded' | 'Poor';
  retreatmentScheduled?: boolean;
  treatmentStatus?: 'Done' | 'In Progress' | 'Failed' | 'Remind Later' | 'Pending';
  reminderStatus?: 'Done' | 'In Progress' | 'Failed' | 'Remind Later' | 'Pending';
  updatedAt?: string; // ISO timestamp for conflict-free sync
}

export interface GoatRecord {
  id: string;
  tagId: string;
  name?: string;
  breed: 'Toggenburg' | 'Alpine' | 'Saanen' | 'Galla' | 'Boer' | 'Anglo-Nubian' | 'Cross' | string;
  purpose: 'Dairy' | 'Meat' | 'Breeding' | 'Dual Purpose' | string;
  dualPurposeTarget?: 'High Milk & Meat' | 'Standard Dual' | 'Meat Emphasis' | 'Milk Emphasis' | string;
  milkYieldLiters?: number;
  weightKg?: number;
  sex?: 'Doe' | 'Buck' | 'Wether' | 'Female' | 'Male' | string;
  dob?: string;
  hornStatus?: 'Polled' | 'Disbudded' | 'Horned';
  parity?: number;
  damTag?: string;
  sireTag?: string;
  housingPen?: string;
  status?: 'Active Lactating' | 'Dry Doe' | 'Breeding Buck' | 'Maiden Doeling' | 'Growing Buckling' | 'Sold' | 'Culled' | string;
  activity: string; // e.g., "Kidding twins", "Foot rot dressing", "Normal grazing"
  notes: string;
  date: string;
  gender?: 'Female' | 'Male' | 'Wether' | string;
}

export interface GoatBreedingRecord {
  id: string;
  doeTagId: string;
  doeName?: string;
  buckTagId: string;
  buckName?: string;
  matingDate: string; // YYYY-MM-DD
  matingType: 'Natural Paddock' | 'Hand Mating' | 'Artificial Insemination';
  expectedKiddingDate: string; // ~150 days from mating
  pregnancyStatus: 'Confirmed Pregnant' | 'Open / Not Pregnant' | 'Pending Check';
  scanOrCheckDate?: string;
  actualKiddingDate?: string;
  kidsCountBorn?: number;
  kiddingEase?: 'Normal Unassisted' | 'Slight Assistance' | 'Difficult (Dystocia)' | 'Cesarean';
  operatorOrVet?: string;
  notes?: string;
}

export interface GoatTreatmentRecord {
  id: string;
  treatmentDate: string;
  goatTagId: string;
  goatName?: string;
  diagnosis: string; // e.g. "CCPP (Pleuropneumonia)", "Enterotoxaemia", "Mastitis", "Haemonchus / Worms", "Foot Rot", "Orf / Sore Mouth", "Mange / Lice"
  medication: string;
  dosage: string;
  route: 'Intramuscular (IM)' | 'Subcutaneous (SC)' | 'Oral Drench' | 'Topical / Footbath' | 'Eye Drops';
  withdrawalMilkDays: number;
  withdrawalMeatDays: number;
  costKes: number;
  administeredBy: string; // Dr. Devin Omwenga / Registered Vet / Staff
  recoveryStatus: 'Fully Recovered' | 'Under Treatment' | 'Follow-up Required';
  followUpDate?: string;
  notes?: string;
}

export interface GoatKidRecord {
  id: string;
  kidTagId: string;
  kidName?: string;
  sex: 'Doeling' | 'Buckling';
  dob: string;
  birthWeightKg: number;
  currentWeightKg: number;
  damTagId: string;
  damName?: string;
  sireTagId: string;
  sireName?: string;
  birthType: 'Single' | 'Twin' | 'Triplet' | 'Quadruplet';
  colostrumIntake: 'Adequate (<2 hrs)' | 'Delayed' | 'Assisted Bottle Feed';
  weaningStatus: 'Nursing' | 'Creep Feeding' | 'Weaned';
  targetWeaningDate?: string;
  weanedWeightKg?: number;
  dailyGainGramsPerDay?: number;
  vaccinations?: string;
  housingPen?: string;
  notes?: string;
}

export interface CalfRecord {
  id: string;
  calfId?: string;
  damId?: string; // Mother Cow tag
  dob: string; // Date of birth
  milkIntakeLiters?: number; // Daily liquid feeder volume
  creepFeedIntroDate?: string; // Creep ration start
  weaned?: boolean;
  notes: string;
  date?: string;
  calfName?: string;
  sex?: 'Male' | 'Female';
  tag?: string;
  weight?: number;
  status?: string;
  dam?: string;
  sire?: string;
  breed?: string;
  // Enhanced zootechnical & veterinary fields
  birthWeightKg?: number;
  currentWeightKg?: number;
  girthCm?: number;
  stage?: 'Pre-Weaning' | 'Weaned' | 'Yearling' | 'Breeding Heifer' | 'In-Calf Heifer' | 'Bull Calf' | 'Young Bull';
  colostrumFedWithin2Hours?: boolean;
  colostrumVolumeLiters?: number;
  colostrumQualityBrix?: number;
  navelDipped?: boolean;
  disbudded?: boolean;
  dewormed?: boolean;
  locality?: string; // Pen / Hutch ID
  targetBreedingDate?: string;
  expectedCalvingDate?: string;
  graduated?: boolean;
  graduatedTo?: string; // e.g. 'CowRegistry' or 'Heifers'
  updatedAt?: string;
}

export interface BsfRecord {
  id: string;
  batchId: string; // e.g., "BSF-BATCH-202"
  substrateType: string; // e.g., "Overripe Avocado & Banana peels"
  inoculationDate: string; // YYYY-MM-DD
  larvaeHarvestedKg: number; // harvested size
  status: 'Inoculation' | 'Larvae Feeding' | 'Harvested' | 'Love Cage Breeding';
  notes: string;
  date: string;
  // Enhanced tracking attributes
  eggWeightGrams?: number;
  substrateWeightKg?: number;
  feedConversionRatio?: number;
  frassHarvestedKg?: number;
  temperatureC?: number;
  moisturePercent?: number;
  destination?: 'Poultry Feed' | 'Dairy Ration' | 'Aquaculture' | 'Commercial Sale' | 'Love Cage Breeding Stock';
  operator?: string;
  harvestDate?: string;
}

export interface BsfSubstrateBatch {
  id: string;
  date: string;
  sourceType: 'Avocado Waste & Pulp' | 'Dairy Cattle Manure' | 'Spent Brewers Grain' | 'Market Vegetable Trimmings' | 'Kitchen & Fruit Peelings' | 'Mixed Organic Biomass';
  rawWeightKg: number;
  moistureAdjusted: boolean;
  allocatedToBatchId: string;
  wasteDivertedKg: number;
  operator?: string;
  notes?: string;
}

export interface BsfHarvestDistribution {
  id: string;
  batchId: string;
  date: string;
  harvestType: 'Fresh Live Larvae' | 'Solar-Dried Whole Grubs' | 'Defatted Insect Protein Meal' | 'Pure Organic Frass Fertilizer';
  quantityKg: number;
  destinationUnit: 'Kuku Layers & Broilers' | 'Dairy TMR Mix' | 'Canine High-Protein Ration' | 'Farm Orchards & Greenhouses (Frass)' | 'External Buyer';
  proteinValueEquivKes?: number;
  operator?: string;
  notes?: string;
}

export interface BsfCommercialSale {
  id: string;
  date: string;
  buyerName: string;
  buyerPhone: string;
  buyerLocation?: string;
  productType: 'Live Larvae' | 'Dried Grubs' | 'Pupae / Seed Pupae' | 'BSF Eggs' | 'BSF Seed 5-DOL Neonates' | 'Organic Frass Biofertilizer';
  quantityKg: number;
  unitPriceKes: number;
  totalAmountKes: number;
  paymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer';
  receiptNumber?: string;
  notes?: string;
}

export interface BsfLoveCageBreedingLog {
  id: string;
  cageId: string;
  date: string;
  pupaeIntroducedKg: number;
  eggClustersHarvestedGrams: number;
  hatchRatePercentage: number;
  attractantUsed: 'Fermented Fruit & Yeast' | 'Decomposing Bran' | 'Manure Extract';
  lightingConditions: 'Natural Sunlight & UV Led' | 'Full Spectrum Halogen';
  ambientTempC: number;
  ambientHumidityPercent: number;
  notes?: string;
}

export interface BsfEggCollectionRecord {
  id: string;
  eggBatchNumber: string; // e.g. "EGG-BATCH-2024-042"
  dayOfCollection: string; // YYYY-MM-DD
  eggWeightGrams: number; // weight in grams
  cageOrAviarySource: string; // e.g. "Love Cage 01 - Alpha"
  incubationDate?: string;
  expectedHatchDate?: string; // +4 days
  hatchRatePercent?: number; // e.g. 92%
  substrateInoculated?: string;
  destinationBatchId?: string;
  collectorName?: string;
  notes?: string;
}

export interface BsfPupaeHarvestRecord {
  id: string;
  harvestDate: string; // YYYY-MM-DD
  batchId: string; // e.g. "BSF-BATCH-201"
  pupaeHarvestedKg: number; // kg
  pupaeGrade: 'Dark Pupae (Breeding Stock)' | 'Prepupae (Self-Harvest Ramps)' | 'Mixed Prepupae & Larvae' | 'Solar Dried Pupae';
  destination: 'Transferred to Love Cage' | 'Feed for Livestock' | 'Solar Drying Tunnel' | 'Commercial Sale';
  trayOrBedNumber?: string;
  operator?: string;
  notes?: string;
}

export interface BsfFeedingRecord {
  id: string;
  feedingDate: string; // YYYY-MM-DD
  batchId: string; // e.g. "BSF-BATCH-202"
  substrateFed: string; // e.g. "Overripe Avocado & Banana peels"
  substrateWeightFedKg: number; // kg
  trayOrBasinNumber: string; // e.g. "Bed Row 04"
  feedingStage: 'Starter (5-DOL)' | 'Active Fattening' | 'Pre-Harvest Finishing';
  bedTemperatureC?: number;
  bedMoisturePercent?: number;
  operator?: string;
  notes?: string;
}

export interface CropOpRecord {
  id: string;
  crop: 'Tea' | 'Avocado' | 'Banana' | 'Vegetables' | 'Sorghum' | 'Maize' | 'Beans' | string;
  operationName: string; // E.g., "De-suckering", "Foliar spray", "Thinning"
  date: string; // YYYY-MM-DD
  status: 'Pending' | 'Completed' | 'In-Progress';
  completedBy?: string; // Staff member assigned
  notes: string;
  
  // Comprehensive crop operation details
  inputsUsed?: string; // e.g. "DAP Fertilizer", "Foliar feed", "Actara pesticide"
  inputQuantityUsed?: string; // e.g., "50 kg", "200 ml"
  equipmentUsed?: string; // e.g., "Tractor, Knapsack Sprayer, Handtools"
  operationCost?: number; // Ksh
}

export interface CropSaleRecord {
  id: string;
  crop: 'Banana' | 'Vegetables' | 'Sorghum' | 'Maize' | 'Napier' | 'Eucalyptus' | string;
  qty: number;
  unit: string; // 'bunches', 'crates', 'bags', 'KGs', etc.
  pricePerUnit: number; // Ksh
  buyer: string;
  ref: string; // Invoice / Receipt ref
  date: string; // YYYY-MM-DD
  totalSales: number; // qty * pricePerUnit
}

export interface AnimalSaleRecord {
  id: string;
  category: 'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other';
  animalIdOrBatch: string; // Name, tag, or batch
  qty: number;
  price: number; // Ksh
  buyer: string;
  ref: string; // e.g., SL-101
  date: string; // YYYY-MM-DD
  weightKg?: number; // Estimated weight in KG
  notes: string;
}

export interface MortalityRecord {
  id: string;
  category: 'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other';
  animalIdOrBatch: string; // e.g., "Cow-104 (Blossom)" or "Layers Batch 2"
  count: number; // count of deceased
  date: string; // YYYY-MM-DD
  causeOfDeath: string;
  veterinaryConfirmed: boolean;
  notes: string;
}

export interface MilkOutflowRecord {
  id: string;
  date: string; // YYYY-MM-DD
  totalMilkedOverride?: number; // Total milked per day

  // Morning distribution
  morningBuyerLiters?: number; // Liters taken by regular morning buyer
  morningBuyerName?: string; // e.g. "Regular Morning Buyer"
  morningBuyerPricePerLiter?: number; // Price per liter for morning buyer
  morningBuyerPaidFriday?: boolean; // Paid on Friday status
  morningBuyerFridayPaymentDate?: string; // Date Friday payment received
  isSaturdayMorningNoBuyer?: boolean; // True on Saturdays (she doesn't take milk)

  // Internal Farm Consumption
  milkUsedAtHome: number; // Liters given to Owner / Home
  milkUsedByWorkers: number; // Liters given to Employees
  milkUsedByCalf?: number; // Liters fed to nursery calves

  // Evening / Local Sales
  eveningLocalCashLiters?: number; // Liters sold locally for instant cash
  eveningCashPricePerLiter?: number; // Price per liter for local cash
  eveningLocalDebtLiters?: number; // Liters sold on monthly credit/debt
  eveningDebtPricePerLiter?: number; // Price per liter for debt

  // Loss / Spoilage
  milkSpoiled: number; // Liters spoiled, sour, or discarded (antibiotics, mastitis)
  spoilageReason?: string; // e.g. "Curdled", "Mastitis", "Drug residue withdrawal discard"

  // Debts & Accounts
  debtsKsh: number; // Value of milk sold on credit (debts) Ksh
  debtCustomer?: string; // Debtor Name / Account
  debtsList?: { debtor: string; amount: number; liters?: number; settled?: boolean; dateSettled?: string }[];

  // Owner Remittances
  remittedToOwnerKsh?: number; // Amount of daily milk money sent to owner
  remittanceMethod?: 'M-PESA' | 'Cash' | 'Bank' | 'Pending';
  remittanceRef?: string; // M-PESA code or receipt number
  remittanceDate?: string;

  salesPricePerLiter?: number; // Price per liter fallback
  notes?: string;
}

export interface MorningBuyerPaymentRecord {
  id: string;
  weekStartDate: string; // Monday of the billing week
  weekEndDate: string; // Sunday of the billing week
  fridayPaymentDate: string; // Expected Friday payment date
  buyerName: string;
  totalLiters: number;
  ratePerLiter: number;
  totalAmountDue: number;
  amountPaid: number;
  status: 'Pending' | 'Paid' | 'Partial';
  paymentMethod: 'M-PESA' | 'Cash' | 'Bank';
  referenceCode?: string;
  paidOnDate?: string;
  notes?: string;
}

export interface OwnerRemittanceRecord {
  id: string;
  date: string;
  amountKsh: number;
  paymentSource: 'Morning Buyer (Friday Pay)' | 'Evening Local Cash' | 'Monthly Debt Collection' | 'Combined Dairy Sales';
  channel: 'M-PESA' | 'Cash' | 'Bank Transfer';
  referenceCode?: string;
  recipientName?: string; // e.g. "Farm Owner"
  notes?: string;
}

export interface SilageRecord {
  id: string;
  rawMaterial: string; // "Maize", "Sorghum", "Napier", "Boma Rhodes", "Other"
  acres: number;
  calculatedWeightKg: number; // weight of silage made from acres
  dateMade: string; // YYYY-MM-DD
  dateOpened?: string; // YYYY-MM-DD
  quality: string; // "Excellent (Golden yellow, lactic acid smell)", "Good (Acidic scent)", "Fair (Slight butyric)", "Spoiled (Mouldy, rancid)"
  notes: string;
  animalsFedCount: number;
  averageAnimalWeightKg: number; // in KG
  recommendedDailyIntakePerAnimal: number; // in KG (typically 1.5% - 3% of body weight depending on DM content)
  daysOfFeedAvailable: number; // calculated feed lifespan
}

export interface HeiferRecord {
  id: string;
  cowId?: string; // Target heifer identification tag
  dateLogged?: string; // YYYY-MM-DD
  weightKg?: number; // Target 280-320kg for insemination
  girthCm?: number; // chest girth correlation
  feedRationType?: string; // "Grower cake + dry Rhodes fiber", "Dairy meal booster", "Silage + High Protein legume"
  averageDailyGainGrams?: number;
  breedingReady?: boolean; // status if weight & puberty parameters met
  notes: string;
  tag?: string;
  breed?: string;
  dob?: string;
  girth?: number;
  weight?: number;
  sire?: string;
  dam?: string;
  status?: string;
  name?: string;
  locality?: string;
  birthWeightKg?: number;
  firstHeatDate?: string;
  lastServiceDate?: string;
  serviceBullOrStraw?: string;
  pregnancyConfirmed?: boolean;
  expectedCalvingDate?: string;
  steamingUpDietStarted?: boolean;
  graduatedToMilkingHerd?: boolean;
  updatedAt?: string;
}

export interface PoultryRecord {
  id: string;
  stage: 'Chick' | 'Grower' | 'Layer';
  batchName: string; // identifier
  count: number; // current stocking count
  dateLogged: string; // YYYY-MM-DD
  feedGivenKg: number;
  feedType: string; // "Chick Start Crumble", "Growers Mashes", "Layers High Calcium mash"
  mortalityCount: number;
  eggCratesHarvested?: number; // layers only (1 crate = 30 eggs)
  crackedEggsCount?: number;
  waterIntakeLiters?: number;
  vaccinesAdministered?: string; // E.g. "Gumboro booster", "Newcastle vaccine"
  percentageProduction?: number; // calculated egg laying percentage based on count
  notes: string;
}

export type PoultrySpecies = 'Chicken' | 'Duck' | 'Turkey' | 'Quail' | 'Geese' | 'Guinea Fowl' | 'Other';
export type PoultryStage = 'Chicks / Ducklings' | 'Growers / Pullets' | 'Adults / Layers / Breeders' | 'Broilers / Table Meat';
export type PoultryProductionState = 
  | 'Active Egg Laying' 
  | 'Point of Lay' 
  | 'Brooding / Nursery' 
  | 'Growing Stage' 
  | 'Molting' 
  | 'Meat Finishing' 
  | 'Breeding Pen' 
  | 'Retired / Spent';

export interface PoultryFlock {
  id: string;
  flockName: string; // E.g. "Kuroiler Layers Flock A", "Pekin Duck Adults"
  species: PoultrySpecies;
  breed: string; // E.g. "Kuroiler", "ISA Brown", "Kenbro", "Kienyeji", "Pekin", "Muscovy"
  stage: PoultryStage;
  stateOfProduction: PoultryProductionState;
  initialCount: number;
  currentCount: number;
  hatchDate: string; // YYYY-MM-DD
  housingPen: string; // E.g. "Coop A - Deep Litter", "Duck Pond Pasture", "Brooder 2"
  source?: string; // E.g. "Kenchic Hatchery", "Farm Incubation", "Local Breeder"
  targetWeightKg?: number;
  targetLayRatePercent?: number; // Target lay % (e.g. 85%)
  costPerBird?: number; // KSh
  description?: string;
  dateAcquired: string; // YYYY-MM-DD
  status: 'Active' | 'Culled' | 'Sold' | 'Depleted';
  updatedAt?: string;
}

export interface PoultryHealthRecord {
  id: string;
  flockId: string;
  flockName: string;
  species: PoultrySpecies;
  dateRecorded: string; // YYYY-MM-DD
  category: 'Vaccination' | 'Disease Treatment' | 'Deworming' | 'Supplementation' | 'Biosecurity Spray';
  diseaseOrCondition: string; // "Newcastle Disease", "Coccidiosis", "Gumboro (IBD)", "Fowl Pox", "CRD", etc.
  symptomsObserved: string; // "Bloody diarrhea, ruffled feathers", "Gasping & nasal discharge", etc.
  drugsOrVaccineUsed: string; // "Amprolium 20%", "Newcastle LaSota", "Oxytetracycline", "Piperazine", etc.
  dosage: string; // "1g per 2L water for 5 consecutive days"
  administrationRoute: 'Drinking Water' | 'Eye Drop' | 'Wing Web Stab' | 'Feed Mix' | 'Subcutaneous Injection' | 'Aerosol Spray';
  affectedCount: number;
  mortalityInEpisode?: number;
  withdrawalPeriodDays: number; // Meat and egg safe withdrawal window (days)
  withdrawalEndDate?: string; // YYYY-MM-DD
  vetOrStaff: string;
  costKsh: number;
  outcome: 'Fully Recovered' | 'Under Treatment' | 'Scheduled Booster' | 'Worsened / Mortality';
  notes: string;
}

export interface PoultryMortalityRecord {
  id: string;
  flockId: string;
  flockName: string;
  species: PoultrySpecies;
  date: string; // YYYY-MM-DD
  type: 
    | 'Mortality (Natural / Disease)' 
    | 'Culling (Low Production / Spent)' 
    | 'Culling (Severe Sickness / Humane)' 
    | 'Predator Attack / Loss' 
    | 'Accidental / Trauma' 
    | 'Emergency Slaughter / Table Sale';
  count: number;
  primaryCause: string; // E.g. "Coccidiosis", "Newcastle / Respiratory", "Heat Stress / Suffocation", "Low Lay Rate", etc.
  postMortemSigns?: string; // Necropsy observations
  disposalMethod: 'Deep Pit Burial with Lime' | 'High-heat Incineration' | 'Sold for Table Meat' | 'Farm Staff Consumption';
  revenueCollectedKsh?: number;
  actionTaken?: string;
  loggedBy: string;
  notes?: string;
}

export interface PoultryEggRecord {
  id: string;
  flockId: string;
  flockName: string;
  species: PoultrySpecies;
  date: string; // YYYY-MM-DD
  goodEggsCount: number; // Table eggs ready for market / sale
  crackedEggsCount: number; // Broken or hair-cracked eggs
  abnormalEggsCount: number; // Soft shell, deformed, micro eggs
  totalEggs: number; // good + cracked + abnormal
  cratesCollected: number; // Math.floor(totalEggs / 30)
  cratesLooseRemainder: number; // totalEggs % 30
  layingFlockBirdCount: number;
  layRatePercentage: number; // (goodEggsCount / layingFlockBirdCount) * 100
  cratesSold?: number;
  pricePerCrate?: number; // Default e.g. 380 KSh / tray
  collectedBy: string;
  collectionTime?: 'Morning' | 'Afternoon' | 'Combined Daily Total';
  notes?: string;
}

export interface QuarantineRecord {
  id: string;
  animalType: 'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other';
  animalTagOrBatch: string;
  dateStarted: string; // YYYY-MM-DD
  dateScheduledEnd: string; // YYYY-MM-DD
  quarantineReason: string; // "New herd addition", "FMD outbreak containment", "Mastitis isolation"
  symptomsObserved: string;
  quarantineStatus: 'Strict Isolation' | 'Under Observation' | 'Cleared & Released' | 'Failed & Culled';
  vetInCharge: string;
  notes: string;
}

export interface AzollaRecord {
  id: string;
  date: string;
  pondId: string;
  harvestYieldKg: number;
  distributedTo: string;
  expensesKsh?: number;
  notes?: string;
}

export interface DogProfile {
  id: string;
  name: string;
  breed: string; // German Shepherd, Rottweiler, Belgian Malinois, Boerboel, Doberman, Labrador, etc.
  gender: 'Male' | 'Female' | 'Neutered Male' | 'Spayed Female';
  dob: string; // YYYY-MM-DD
  chipId?: string; // Microchip / Tattoo / Collar Tag
  kennelNo?: string; // E.g. Kennel A-01
  dutyRole: 'Perimeter Patrol' | 'Main Gate Security' | 'Night Watch' | 'Livestock Guardian' | 'Compound Guard' | 'Breeding Stock' | 'Puppy in Training';
  status: 'Active Duty' | 'In Training' | 'Medical Rest' | 'Off Duty' | 'Sold' | 'Deceased';
  handlerId?: string;
  handlerName?: string;
  sire?: string;
  dam?: string;
  colorMarkings?: string;
  acquisitionDate?: string;
  notes?: string;
}

export interface CanineVaccinationRecord {
  id: string;
  dogId: string;
  dogName: string;
  vaccineType: 'Rabies' | 'DHLPP 5-in-1' | 'Deworming' | 'Flea & Tick Prevention' | 'Parvovirus Booster' | 'Kennel Cough (Bordetella)' | 'Other';
  dateAdministered: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  batchNo?: string;
  administeredBy: string; // E.g. Dr. Devin Omwenga
  cost?: number; // KES
  notes?: string;
}

export interface CanineTreatmentRecord {
  id: string;
  dogId: string;
  dogName: string;
  date: string; // YYYY-MM-DD
  diagnosis: string; // Clinical diagnosis
  symptoms?: string;
  treatmentAdministered: string; // Medication / Injection / Wound dressing
  temperature?: number; // °C
  weightKg?: number;
  attendingVet: string; // Default: Dr. Devin Omwenga (General Farm Manager / DVM)
  cost?: number; // KES
  status: 'Recovered' | 'Under Treatment' | 'Critical' | 'Scheduled Follow-up';
  nextFollowUpDate?: string;
  notes?: string;
}

export interface CanineSaleRecord {
  id: string;
  dogId?: string;
  dogName: string;
  breed: string;
  saleDate: string; // YYYY-MM-DD
  buyerName: string;
  buyerPhone: string;
  buyerLocation?: string;
  amount: number; // KES
  paymentMethod: 'Cash' | 'M-Pesa' | 'Bank Transfer';
  receiptNumber?: string;
  purpose: 'Security Guard Dog' | 'Trained Family Pet' | 'Breeding' | 'Working Livestock Guardian';
  notes?: string;
}

export interface CanineMortalityRecord {
  id: string;
  dogId?: string;
  dogName: string;
  breed: string;
  dateOfDeath: string; // YYYY-MM-DD
  causeOfDeath: string; // E.g. Snake bite, Acute poisoning, Gastric torsion, Old age, Parvovirus
  veterinaryFindings?: string;
  attendingVet?: string;
  disposalMethod: 'Estate Burial' | 'Incineration' | 'Sanitary Disposal';
  biosecurityPrecautions?: string;
  notes?: string;
}

export interface CaninePatrolRecord {
  id: string;
  dogId: string;
  dogName: string;
  handlerName: string;
  date: string; // YYYY-MM-DD
  shift: 'Night Shift (18:00 - 06:00)' | 'Day Shift (06:00 - 18:00)' | 'Evening Patrol (18:00 - 22:00)' | 'Perimeter Sweep';
  patrolSector: 'North Boundary & Tea Zone' | 'South Fence & Stream' | 'Main Gate Sentry' | 'Livestock & Dairy Pens' | 'Homestead & Storage' | 'Full Estate Perimeter';
  incidentStatus: 'All Clear (Normal)' | 'Trespasser Deterred' | 'Perimeter Breach / Fence Damage' | 'Predator / Wildlife Alert' | 'Canine Fatigued / Injured';
  incidentDetails?: string;
  durationMinutes?: number;
  notes?: string;
}

export interface CanineTrainingRecord {
  id: string;
  dogId: string;
  dogName: string;
  trainingDate: string; // YYYY-MM-DD
  discipline: 'Bite Work & Protection' | 'Basic Obedience (Heel/Sit/Down)' | 'Advanced Obedience & Recall' | 'Perimeter & Fence Patrol' | 'Scent & Tracking' | 'Agility & Obstacle' | 'Socialization';
  level: 'Level 1: Novice/Puppy' | 'Level 2: Intermediate Working' | 'Level 3: Advanced Guard' | 'Level 4: Tactical Master';
  scorePercentage: number; // 0 - 100
  trainerName: string;
  passed: boolean;
  nextEvaluationDate?: string;
  notes?: string;
}

export interface CanineFeedingRecord {
  id: string;
  dogId: string;
  dogName: string;
  date: string; // YYYY-MM-DD
  dietType: 'High-Protein Kibble (28%)' | 'Raw Meat & Bones (BARF)' | 'Boiled Offal & Rice' | 'Mixed Nutrition + Supplements';
  dailyGrams: number; // Daily ration weight
  feedingSchedule: 'Once Daily (Evening)' | 'Twice Daily (Morning & Evening)' | 'Three Times (Puppy Routine)';
  bodyConditionScore: number; // 1 to 9 (Ideal: 4-5)
  weightKg?: number;
  dailyCostKes?: number;
  appetite: 'Vigorous / Excellent' | 'Normal' | 'Sluggish / Picky' | 'Refused Food (Alert Vet)';
  notes?: string;
}

export interface CanineBreedingRecord {
  id: string;
  damId: string;
  damName: string;
  sireName: string;
  heatDate: string; // YYYY-MM-DD
  matingDate: string; // YYYY-MM-DD
  expectedWhelpingDate: string; // YYYY-MM-DD (+63 days)
  actualWhelpingDate?: string;
  litterSize?: number;
  malesCount?: number;
  femalesCount?: number;
  puppySurvivingCount?: number;
  veterinaryNotes?: string;
  status: 'Mated / Pregnant' | 'Delivered (Litter Active)' | 'Weaned' | 'Unsuccessful Mating';
  notes?: string;
}

export interface CanineKennelBiosecurityRecord {
  id: string;
  kennelId: string;
  inspectionDate: string; // YYYY-MM-DD
  sanitizedWith: 'Virkon-S Disinfectant' | 'Bleach (Sodium Hypochlorite)' | 'Lime Wash (Calcium Hydroxide)' | 'High-Pressure Steam / Water Wash';
  beddingReplaced: boolean;
  waterBowlsSterilized: boolean;
  pestsControlled: boolean;
  status: 'Passed & Certified' | 'Needs Deep Scrub' | 'Quarantine Sealed';
  inspectedBy: string;
  notes?: string;
}

export interface CanineKennelBay {
  id: string; // e.g. 'A-01'
  name: string; // e.g. 'Kennel A-01 (Patrol Alpha)'
  block: 'Block A (Patrol)' | 'Block B (Heavy Guard)' | 'Maternity Bay' | 'Quarantine Unit';
  status: 'Occupied' | 'Vacant & Clean' | 'Cleaning in Progress' | 'Quarantine Locked';
  currentDogId?: string;
  currentDogName?: string;
  lastSanitizedDate?: string;
  dimensions?: string;
  notes?: string;
}

export interface CanineEmergencyMedicalItem {
  id: string;
  itemName: string;
  category: 'Antivenom & Toxins' | 'Trauma & Wound Care' | 'Preventatives & Antibiotics' | 'Sanitation & Disinfection';
  quantityOnHand: number;
  unit: 'Vials' | 'Boxes' | 'Tubs' | 'Tablets' | 'Kits';
  minimumThreshold: number;
  expiryDate: string; // YYYY-MM-DD
  storageLocation: string; // e.g. 'Estate Vet Refrigerator (2-8°C)', 'Patrol Trauma Pack'
  emergencyInstructions?: string;
  lastRestockedDate?: string;
}

export interface CanineShiftHandoverRecord {
  id: string;
  date: string;
  shift: 'Night to Day Handover' | 'Day to Night Handover' | 'Midday Sweep Handover';
  outgoingHandler: string;
  incomingHandler: string;
  dogsInspected: string[];
  pawPadsClearOfThorns: boolean;
  coatTickSweepDone: boolean;
  waterRefreshed: boolean;
  kennelLocksInspected: boolean;
  gearInspected: boolean;
  perimeterFenceIntact: boolean;
  handoverNotes?: string;
}



