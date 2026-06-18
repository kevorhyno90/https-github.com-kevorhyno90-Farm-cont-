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
}

export interface AIRecord {
  cowId: string;
  date: string; // Service Date YYYY-MM-DD
  bull: string; // Semen / Bull details
  due: string; // Expected due date YYYY-MM-DD
  status: 'Pending' | 'Confirmed Pregnant' | 'Calved' | 'Failed';
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
  gradeA: number; // Boxes
  gradeB: number; // Boxes
  reject: number; // KG
  ref: string; // Shipping ref
  date: string; // YYYY-MM-DD
  priceGradeA?: number;
  priceGradeB?: number;
  priceReject?: number;
  buyer?: string;
  totalSales?: number;
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
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  assigneeName?: string;
}

export interface Ingredient {
  name: string;
  cp: number; // Crude Protein %
  me: number; // Metabolizable Energy (MJ/kg DM)
  cost?: number; // Cost per KG Ksh
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
}

export interface FieldRecord {
  id: string;
  blockName: string;
  cropType: string; // "Maize", "Napier", "Eucalyptus"
  acreage: number;
  status: string; // "Growing", "Harvested", "Prepared"
  notes: string;
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Feed' | 'Chemical' | 'Machine Parts' | 'Tools' | 'Fencing' | 'Fertilizer';
  quantity: number;
  unit: string; // "bags", "liters", "KG", "units"
  minStock: number;
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
}

export interface Cow {
  id: string; // Cow tag
  name: string;
  breed: string;
  dob: string;
  status: 'Lactating' | 'Dry' | 'Heifer' | 'In-Calf';
  notes: string;
}

export interface VetRecord {
  id: string;
  cowId: string; // Cow tag or Cow name
  date: string; // YYYY-MM-DD
  type: 'Deworming' | 'Treatment' | 'Vaccination' | 'General Practice';
  treatment: string; // e.g. "Safeguard deworming bolus", "Mastitis antibiotic syringe"
  nextDueDate?: string; // YYYY-MM-DD (vital for deworming reminders!)
  cost: number; // Ksh
  staff: string;
  notes: string;
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
  crop: 'Tea' | 'Avocado' | 'Banana' | 'Vegetables' | 'Sorghum' | 'Maize';
  operationName: string; // E.g., "De-suckering", "Foliar spray", "Thinning"
  date: string; // YYYY-MM-DD
  status: 'Pending' | 'Completed' | 'In-Progress';
  completedBy?: string; // Staff member assigned
  notes: string;
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

