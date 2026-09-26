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
  qty: number; // KG
  ref: string; // Collection Ref
  date: string; // YYYY-MM-DD
  pricePerKg?: number;
  buyer?: string;
  totalSales?: number;
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

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Feed' | 'Chemical' | 'Machine Parts' | 'Tools' | 'Fencing' | 'Fertilizer';
  quantity: number;
  unit: string; // "bags", "liters", "KG", "units"
  minStock: number;
  dateReceived?: string; // YYYY-MM-DD
  location?: string; // e.g. "Store Alpha", "Workshop A", etc.
  expiryDate?: string; // optional YYYY-MM-DD
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
  animalCategory?: 'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other';
  date: string; // YYYY-MM-DD
  type: 'Deworming' | 'Treatment' | 'Vaccination' | 'General Practice';
  treatment: string; // e.g. "Safeguard deworming bolus", "Mastitis antibiotic syringe"
  nextDueDate?: string; // YYYY-MM-DD (vital for deworming reminders!)
  cost: number; // Ksh
  staff: string;
  notes: string;
  
  // Veterinary Clinical Parameters
  diagnosis?: string;
  temperature?: number; // °C
  heartRate?: number; // bpm
  respiratoryRate?: number; // breaths/min
  drugAdministered?: string;
  dosage?: string;
  administrationRoute?: 'IM' | 'IV' | 'SC' | 'Oral' | 'Topical' | 'Intramammary' | 'Other';
  withdrawalMilkDays?: number;
  withdrawalMeatDays?: number;
  prognosis?: 'Good' | 'Fair' | 'Guarded' | 'Poor';
  retreatmentScheduled?: boolean;
  treatmentStatus?: 'Done' | 'In Progress' | 'Failed' | 'Remind Later' | 'Pending';
  reminderStatus?: 'Done' | 'In Progress' | 'Failed' | 'Remind Later' | 'Pending';
}

export interface GoatRecord {
  id: string;
  tagId: string;
  breed: 'Toggenburg' | 'Alpine' | 'Saanen' | 'Galla' | 'Boer' | 'Cross';
  purpose: 'Dairy' | 'Meat' | 'Breeding';
  milkYieldLiters?: number;
  activity: string; // e.g., "Kidding twins", "Foot rot dressing", "Normal grazing"
  notes: string;
  date: string;
  gender?: 'Female' | 'Male' | 'Wether' | string;
}

export interface CalfRecord {
  id: string;
  calfId: string;
  damId: string; // Mother Cow tag
  dob: string; // Date of birth
  milkIntakeLiters: number; // Daily liquid feeder volume
  creepFeedIntroDate?: string; // Creep ration start
  weaned: boolean;
  notes: string;
  date: string;
  calfName?: string;
  sex?: 'Male' | 'Female';
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
  milkUsedAtHome: number; // Liters used/reserved at home
  milkUsedByWorkers: number; // Liters given/sold to workers
  milkUsedByCalf?: number; // Liters consumed by calves
  milkSpoiled: number; // Liters spoiled or discarded
  debtsKsh: number; // Value of milk sold on credit (debts) Ksh or Outstanding debt quantity description
  debtCustomer?: string; // Debtor Name / Account
  debtsList?: { debtor: string; amount: number }[]; // List of multiple debtors
  salesPricePerLiter?: number; // Price per liter for the day
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
  cowId: string; // Target heifer identification tag
  dateLogged: string; // YYYY-MM-DD
  weightKg: number; // Target 280-320kg for insemination
  girthCm?: number; // chest girth correlation
  feedRationType: string; // "Grower cake + dry Rhodes fiber", "Dairy meal booster", "Silage + High Protein legume"
  averageDailyGainGrams: number;
  breedingReady: boolean; // status if weight & puberty parameters met
  notes: string;
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



