import React, { useState, useEffect, useMemo } from 'react';
import {
  DogProfile,
  CanineVaccinationRecord,
  CanineTreatmentRecord,
  CanineSaleRecord,
  CanineMortalityRecord,
  CaninePatrolRecord,
  CanineTrainingRecord,
  CanineFeedingRecord,
  CanineBreedingRecord,
  CanineKennelBiosecurityRecord,
  StaffMember,
  LivestockRecord
} from '../types';
import {
  Shield, ShieldCheck, ShieldAlert, Award, Plus, Trash2, Edit2, Search,
  Calendar, FileText, Download, Share2, Printer, Heart, CheckCircle2,
  AlertTriangle, Clock, DollarSign, Eye, Activity, Phone, UserCheck,
  Stethoscope, Syringe, Sparkles, TrendingUp, ChevronRight, User,
  MapPin, Check, FileSpreadsheet, LayoutGrid, Table, Utensils,
  Dumbbell, Moon, Sun, AlertCircle, Droplets, Baby, Filter, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useFarmState } from '../context/FarmContext';
import { toIsoDate, offsetIsoDate } from '../utils/dateHelper';
import { exportToCsv } from '../utils/csvHelper';
import { KennelBaysMap } from './canines/KennelBaysMap';
import { EmergencyMedicalHub } from './canines/EmergencyMedicalHub';
import { ShiftHandoverChecklist } from './canines/ShiftHandoverChecklist';
import { generateKennelPlacardPdf } from './canines/KennelPlacardGenerator';

interface CaninesManagerProps {
  staffList?: StaffMember[];
  livestock?: LivestockRecord[];
  onAddLivestock?: (rec: any) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type CanineSubTab =
  | 'registry'
  | 'housing'
  | 'vaccines'
  | 'treatments'
  | 'patrols'
  | 'handover'
  | 'medkit'
  | 'treatments'
  | 'patrols'
  | 'training'
  | 'feeding'
  | 'breeding'
  | 'biosecurity'
  | 'sales'
  | 'mortality';

type ViewMode = 'cards' | 'table';

// Local storage persistent keys
const STORAGE_KEYS = {
  PROFILES: 'jr_farm_canine_profiles_v2',
  VACCINES: 'jr_farm_canine_vaccines_v2',
  TREATMENTS: 'jr_farm_canine_treatments_v2',
  PATROLS: 'jr_farm_canine_patrols_v2',
  TRAINING: 'jr_farm_canine_training_v2',
  FEEDING: 'jr_farm_canine_feeding_v2',
  BREEDING: 'jr_farm_canine_breeding_v2',
  BIOSECURITY: 'jr_farm_canine_biosecurity_v2',
  SALES: 'jr_farm_canine_sales_v2',
  MORTALITY: 'jr_farm_canine_mortality_v2'
};

// Seed dogs for realistic operational experience
const DEFAULT_DOGS: DogProfile[] = [
  {
    id: 'k9-001',
    name: 'Major',
    breed: 'German Shepherd (East German Working Line)',
    gender: 'Male',
    dob: '2022-04-15',
    chipId: '985141001298411',
    kennelNo: 'Kennel A-01 (Patrol Block)',
    dutyRole: 'Perimeter Patrol',
    status: 'Active Duty',
    handlerName: 'Officer Kevin O. (Lead K-9 Handler)',
    sire: 'Rex vom Haus (Imp. DE)',
    dam: 'Kira vom Schwarzberg',
    colorMarkings: 'Sable / Black & Tan',
    acquisitionDate: '2022-06-10',
    notes: 'Exceptional perimeter deterrence, fast bite engagement, trained in night tracking.'
  },
  {
    id: 'k9-002',
    name: 'Shadow',
    breed: 'Belgian Malinois',
    gender: 'Male',
    dob: '2023-01-20',
    chipId: '985141002381922',
    kennelNo: 'Kennel A-02 (Tactical Bay)',
    dutyRole: 'Main Gate Security',
    status: 'Active Duty',
    handlerName: 'Sgt. John Kimani',
    sire: 'Ares du Domaine',
    dam: 'Viper vom Falken',
    colorMarkings: 'Fawn with Dark Mask',
    acquisitionDate: '2023-03-15',
    notes: 'High drive, instant obedience, vehicle inspection specialist, quick response.'
  },
  {
    id: 'k9-003',
    name: 'Rex',
    breed: 'Rottweiler (Working Stock)',
    gender: 'Male',
    dob: '2021-11-05',
    chipId: '985141003492833',
    kennelNo: 'Kennel B-01 (Heavy Guard)',
    dutyRole: 'Compound Guard',
    status: 'Active Duty',
    handlerName: 'Cpl. Samuel Ndungu',
    sire: 'Titan von der Burg',
    dam: 'Hera vom Silbersee',
    colorMarkings: 'Black & Rust Mahogany',
    acquisitionDate: '2022-01-10',
    notes: 'Imposing presence, protective instinct around farm equipment & warehouse stores.'
  },
  {
    id: 'k9-004',
    name: 'Simba',
    breed: 'Boerboel (South African Mastiff)',
    gender: 'Neutered Male',
    dob: '2022-08-10',
    chipId: '985141004510294',
    kennelNo: 'Kennel B-02 (Night Watch)',
    dutyRole: 'Night Watch',
    status: 'Active Duty',
    handlerName: 'Security Team Night Shift',
    sire: 'Groot Karoo Bullet',
    dam: 'Kalahari Zara',
    colorMarkings: 'Red Fawn with Black Mask',
    acquisitionDate: '2022-10-15',
    notes: 'Stationed at dairy pens and calf nursery overnight. Calm demeanor until aroused.'
  },
  {
    id: 'k9-005',
    name: 'Bella',
    breed: 'German Shepherd',
    gender: 'Female',
    dob: '2021-06-18',
    chipId: '985141005629184',
    kennelNo: 'Maternity Bay M-01',
    dutyRole: 'Breeding Stock',
    status: 'Active Duty',
    handlerName: 'Dr. Devin Omwenga',
    sire: 'Von Jagdfuchs Max',
    dam: 'Greta von der Donau',
    colorMarkings: 'Deep Black & Red',
    acquisitionDate: '2021-08-20',
    notes: 'Proven dam with outstanding drive and calm maternal temperament. Litter registered.'
  },
  {
    id: 'k9-006',
    name: 'Bruno',
    breed: 'Doberman Pinscher',
    gender: 'Male',
    dob: '2023-09-01',
    chipId: '985141006738291',
    kennelNo: 'Kennel C-01 (Apprentice Block)',
    dutyRole: 'Puppy in Training',
    status: 'In Training',
    handlerName: 'Officer Kevin O.',
    sire: 'Major (K9-001)',
    dam: 'Bella (K9-005)',
    colorMarkings: 'Black & Tan',
    acquisitionDate: '2023-11-01',
    notes: 'Completing Phase 2 obedience and perimeter familiarization. Excellent agility.'
  }
];

const DEFAULT_VACCINES: CanineVaccinationRecord[] = [
  {
    id: 'vax-01',
    dogId: 'k9-001',
    dogName: 'Major',
    vaccineType: 'Rabies',
    dateAdministered: '2024-03-10',
    nextDueDate: '2025-03-10',
    batchNo: 'RAB-NOB-9921',
    administeredBy: 'Dr. Devin Omwenga, DVM',
    cost: 1500,
    notes: 'Annual mandatory Rabies booster administered sub-Q. No adverse reaction.'
  },
  {
    id: 'vax-02',
    dogId: 'k9-001',
    dogName: 'Major',
    vaccineType: 'DHLPP 5-in-1',
    dateAdministered: '2024-03-10',
    nextDueDate: '2025-03-10',
    batchNo: 'DHLPP-ZOET-441',
    administeredBy: 'Dr. Devin Omwenga, DVM',
    cost: 2500,
    notes: 'Multi-booster covering Parvovirus, Distemper, Adenovirus & Leptospirosis.'
  },
  {
    id: 'vax-03',
    dogId: 'k9-002',
    dogName: 'Shadow',
    vaccineType: 'Rabies',
    dateAdministered: '2024-04-12',
    nextDueDate: '2025-04-12',
    batchNo: 'RAB-DEF-3810',
    administeredBy: 'Dr. Devin Omwenga, DVM',
    cost: 1500,
    notes: 'Annual Rabies booster.'
  },
  {
    id: 'vax-04',
    dogId: 'k9-003',
    dogName: 'Rex',
    vaccineType: 'Deworming',
    dateAdministered: '2024-08-01',
    nextDueDate: '2024-11-01',
    batchNo: 'ENDOG-882B',
    administeredBy: 'Dr. Devin Omwenga, DVM',
    cost: 800,
    notes: 'Broad-spectrum Praziquantel + Pyrantel pamoate tablet administration.'
  },
  {
    id: 'vax-05',
    dogId: 'k9-004',
    dogName: 'Simba',
    vaccineType: 'Flea & Tick Prevention',
    dateAdministered: '2024-09-05',
    nextDueDate: '2024-10-05',
    batchNo: 'BRAV-CHEW-11',
    administeredBy: 'Dr. Devin Omwenga, DVM',
    cost: 3200,
    notes: 'Oral chewable isoxazoline protection against African ticks and tick-fever.'
  }
];

const DEFAULT_TREATMENTS: CanineTreatmentRecord[] = [
  {
    id: 'treat-01',
    dogId: 'k9-001',
    dogName: 'Major',
    date: '2024-07-14',
    diagnosis: 'Minor Pad Laceration (Right Hind)',
    symptoms: 'Mild lameness after thorny brush night patrol sweep along tea perimeter',
    treatmentAdministered: 'Antiseptic lavage (Chlorhexidine), silver sulfadiazine ointment, protective bandage for 48h. Amoxicillin 500mg BID x 5 days.',
    temperature: 38.6,
    weightKg: 38.5,
    attendingVet: 'Dr. Devin Omwenga (General Farm Manager / DVM)',
    cost: 2200,
    status: 'Recovered',
    nextFollowUpDate: '2024-07-20',
    notes: 'Complete recovery, full weight-bearing resumed, returned to patrol.'
  },
  {
    id: 'treat-02',
    dogId: 'k9-003',
    dogName: 'Rex',
    date: '2024-08-22',
    diagnosis: 'Acute Otitis Externa (Bilateral Ear Infection)',
    symptoms: 'Head shaking, brown discharge in ear canal, discomfort on palpation',
    treatmentAdministered: 'Surolan ear drops (5 drops per ear BID for 7 days), ear cleaning with Cerumene.',
    temperature: 38.8,
    weightKg: 46.2,
    attendingVet: 'Dr. Devin Omwenga (General Farm Manager / DVM)',
    cost: 1800,
    status: 'Recovered',
    notes: 'Canals clear and healthy upon otoscopic re-examination.'
  }
];

const DEFAULT_PATROLS: CaninePatrolRecord[] = [
  {
    id: 'patrol-01',
    dogId: 'k9-001',
    dogName: 'Major',
    handlerName: 'Officer Kevin O.',
    date: '2024-09-24',
    shift: 'Night Shift (18:00 - 06:00)',
    patrolSector: 'North Boundary & Tea Zone',
    incidentStatus: 'All Clear (Normal)',
    durationMinutes: 720,
    notes: 'Full perimeter sweep completed every 90 minutes. High alert response, no intrusions.'
  },
  {
    id: 'patrol-02',
    dogId: 'k9-002',
    dogName: 'Shadow',
    handlerName: 'Sgt. John Kimani',
    date: '2024-09-24',
    shift: 'Day Shift (06:00 - 18:00)',
    patrolSector: 'Main Gate Sentry',
    incidentStatus: 'All Clear (Normal)',
    durationMinutes: 720,
    notes: 'Screened 14 delivery vehicles and visitors. Immediate sit-stay obedience maintained.'
  },
  {
    id: 'patrol-03',
    dogId: 'k9-004',
    dogName: 'Simba',
    handlerName: 'Night Security Unit',
    date: '2024-09-23',
    shift: 'Night Shift (18:00 - 06:00)',
    patrolSector: 'Livestock & Dairy Pens',
    incidentStatus: 'Predator / Wildlife Alert',
    incidentDetails: 'Deterred marauding stray dog pack and feral wildlife near calf holding pen.',
    durationMinutes: 720,
    notes: 'Bark deterrence successful, fence intact, calves secured without incident.'
  }
];

const DEFAULT_TRAINING: CanineTrainingRecord[] = [
  {
    id: 'tr-01',
    dogId: 'k9-002',
    dogName: 'Shadow',
    trainingDate: '2024-09-18',
    discipline: 'Bite Work & Protection',
    level: 'Level 4: Tactical Master',
    scorePercentage: 96,
    trainerName: 'Lead Trainer Kevin O.',
    passed: true,
    nextEvaluationDate: '2024-12-18',
    notes: 'Flawless bite grip on sleeve, instantaneous release on verbal command ("Out").'
  },
  {
    id: 'tr-02',
    dogId: 'k9-006',
    dogName: 'Bruno',
    trainingDate: '2024-09-20',
    discipline: 'Basic Obedience (Heel/Sit/Down)',
    level: 'Level 1: Novice/Puppy',
    scorePercentage: 88,
    trainerName: 'Officer Kevin O.',
    passed: true,
    nextEvaluationDate: '2024-10-20',
    notes: 'Demonstrated solid off-leash heel work and 3-minute stay with distractions.'
  },
  {
    id: 'tr-03',
    dogId: 'k9-001',
    dogName: 'Major',
    trainingDate: '2024-09-15',
    discipline: 'Scent & Tracking',
    level: 'Level 3: Advanced Guard',
    scorePercentage: 92,
    trainerName: 'Sgt. John Kimani',
    passed: true,
    nextEvaluationDate: '2024-11-15',
    notes: 'Successfully tracked 600m perimeter scent trial through tea bushes in damp conditions.'
  }
];

const DEFAULT_FEEDING: CanineFeedingRecord[] = [
  {
    id: 'feed-01',
    dogId: 'k9-001',
    dogName: 'Major',
    date: '2024-09-25',
    dietType: 'High-Protein Kibble (28%)',
    dailyGrams: 850,
    feedingSchedule: 'Once Daily (Evening)',
    bodyConditionScore: 5,
    weightKg: 38.5,
    dailyCostKes: 380,
    appetite: 'Vigorous / Excellent',
    notes: 'Fed post-patrol at 18:30. Water bowl refreshed with electrolyte replenishment.'
  },
  {
    id: 'feed-02',
    dogId: 'k9-003',
    dogName: 'Rex',
    date: '2024-09-25',
    dietType: 'Raw Meat & Bones (BARF)',
    dailyGrams: 1100,
    feedingSchedule: 'Once Daily (Evening)',
    bodyConditionScore: 5,
    weightKg: 46.2,
    dailyCostKes: 480,
    appetite: 'Vigorous / Excellent',
    notes: 'Raw beef heart, trachea, and calcium bone meal mix. Stool firm and normal.'
  }
];

const DEFAULT_BREEDING: CanineBreedingRecord[] = [
  {
    id: 'breed-01',
    damId: 'k9-005',
    damName: 'Bella',
    sireName: 'Major (K9-001 - German Shepherd)',
    heatDate: '2024-04-10',
    matingDate: '2024-04-22',
    expectedWhelpingDate: '2024-06-24',
    actualWhelpingDate: '2024-06-23',
    litterSize: 7,
    malesCount: 4,
    femalesCount: 3,
    puppySurvivingCount: 7,
    veterinaryNotes: 'Natural whelping supervised by Dr. Devin Omwenga. All 7 pups healthy, vigorous nursing.',
    status: 'Weaned',
    notes: 'Litter fully weaned at 8 weeks. 2 pups retained for farm security roster; 5 reserved for sale.'
  }
];

const DEFAULT_BIOSECURITY: CanineKennelBiosecurityRecord[] = [
  {
    id: 'bio-01',
    kennelId: 'Kennel Block A (Patrol Run 01-04)',
    inspectionDate: '2024-09-24',
    sanitizedWith: 'Virkon-S Disinfectant',
    beddingReplaced: true,
    waterBowlsSterilized: true,
    pestsControlled: true,
    status: 'Passed & Certified',
    inspectedBy: 'Dr. Devin Omwenga, DVM',
    notes: 'Power-washed, Virkon-S 1:100 contact time 30 mins, cedar shavings bedding replaced.'
  },
  {
    id: 'bio-02',
    kennelId: 'Maternity & Nursery Bay M-01',
    inspectionDate: '2024-09-23',
    sanitizedWith: 'Virkon-S Disinfectant',
    beddingReplaced: true,
    waterBowlsSterilized: true,
    pestsControlled: true,
    status: 'Passed & Certified',
    inspectedBy: 'Officer Kevin O.',
    notes: 'Thermal lamps checked, infrared thermometer reading 24°C, sanitization verified.'
  }
];

const DEFAULT_SALES: CanineSaleRecord[] = [
  {
    id: 'sale-01',
    dogName: 'Thor (Sire: Major x Dam: Bella)',
    breed: 'German Shepherd (Working Line)',
    saleDate: '2024-08-28',
    buyerName: 'Eng. Patrick Mutiso',
    buyerPhone: '+254 722 345 678',
    buyerLocation: 'Karen, Nairobi',
    amount: 85000,
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'JR-K9-REC-2024-01',
    purpose: 'Security Guard Dog',
    notes: 'Supplied with complete JR Farm Veterinary Health Passport, microchip registered, vaccinated.'
  },
  {
    id: 'sale-02',
    dogName: 'Zeus (Sire: Major x Dam: Bella)',
    breed: 'German Shepherd (Working Line)',
    saleDate: '2024-09-02',
    buyerName: 'Naivasha Horticultural Logistics Ltd',
    buyerPhone: '+254 733 987 654',
    buyerLocation: 'Naivasha Flower Farm Perimeter',
    amount: 95000,
    paymentMethod: 'M-Pesa',
    receiptNumber: 'JR-K9-REC-2024-02',
    purpose: 'Security Guard Dog',
    notes: 'Trained for high-alert night deterrence. Delivered with 30-day health guarantee.'
  }
];

const DEFAULT_MORTALITY: CanineMortalityRecord[] = [
  {
    id: 'mort-01',
    dogName: 'Baron (Honorary Veteran)',
    breed: 'Rottweiler',
    dateOfDeath: '2023-10-14',
    causeOfDeath: 'Natural Old Age / Congestive Heart Failure',
    veterinaryFindings: 'Attained age 11 years. Post-mortem revealed end-stage cardiomegaly without infectious signs.',
    attendingVet: 'Dr. Devin Omwenga, DVM',
    disposalMethod: 'Estate Burial',
    biosecurityPrecautions: 'Deep pit burial (2.5 meters) in designated farm canine sanctuary with agricultural quicklime seal.',
    notes: 'Served JR Farm honorably as lead estate sentry for 9 years.'
  }
];

export function CaninesManager({
  staffList = [],
  livestock = [],
  onAddLivestock,
  onTriggerSectionReport
}: CaninesManagerProps) {
  const { financials, setFinancials } = useFarmState();

  // Active sub-navigation
  const [subTab, setSubTab] = useState<CanineSubTab>('registry');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [breedFilter, setBreedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected dog for detailed Dossier modal
  const [dossierDog, setDossierDog] = useState<DogProfile | null>(null);

  // Persistence State
  const [dogs, setDogs] = useState<DogProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return stored ? JSON.parse(stored) : DEFAULT_DOGS;
    } catch {
      return DEFAULT_DOGS;
    }
  });

  const [vaccines, setVaccines] = useState<CanineVaccinationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VACCINES);
      return stored ? JSON.parse(stored) : DEFAULT_VACCINES;
    } catch {
      return DEFAULT_VACCINES;
    }
  });

  const [treatments, setTreatments] = useState<CanineTreatmentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TREATMENTS);
      return stored ? JSON.parse(stored) : DEFAULT_TREATMENTS;
    } catch {
      return DEFAULT_TREATMENTS;
    }
  });

  const [patrols, setPatrols] = useState<CaninePatrolRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PATROLS);
      return stored ? JSON.parse(stored) : DEFAULT_PATROLS;
    } catch {
      return DEFAULT_PATROLS;
    }
  });

  const [training, setTraining] = useState<CanineTrainingRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRAINING);
      return stored ? JSON.parse(stored) : DEFAULT_TRAINING;
    } catch {
      return DEFAULT_TRAINING;
    }
  });

  const [feeding, setFeeding] = useState<CanineFeedingRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEEDING);
      return stored ? JSON.parse(stored) : DEFAULT_FEEDING;
    } catch {
      return DEFAULT_FEEDING;
    }
  });

  const [breeding, setBreeding] = useState<CanineBreedingRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BREEDING);
      return stored ? JSON.parse(stored) : DEFAULT_BREEDING;
    } catch {
      return DEFAULT_BREEDING;
    }
  });

  const [biosecurity, setBiosecurity] = useState<CanineKennelBiosecurityRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BIOSECURITY);
      return stored ? JSON.parse(stored) : DEFAULT_BIOSECURITY;
    } catch {
      return DEFAULT_BIOSECURITY;
    }
  });

  const [sales, setSales] = useState<CanineSaleRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SALES);
      return stored ? JSON.parse(stored) : DEFAULT_SALES;
    } catch {
      return DEFAULT_SALES;
    }
  });

  const [mortalities, setMortalities] = useState<CanineMortalityRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MORTALITY);
      return stored ? JSON.parse(stored) : DEFAULT_MORTALITY;
    } catch {
      return DEFAULT_MORTALITY;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(dogs));
  }, [dogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(vaccines));
  }, [vaccines]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(treatments));
  }, [treatments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATROLS, JSON.stringify(patrols));
  }, [patrols]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRAINING, JSON.stringify(training));
  }, [training]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDING, JSON.stringify(feeding));
  }, [feeding]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BREEDING, JSON.stringify(breeding));
  }, [breeding]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BIOSECURITY, JSON.stringify(biosecurity));
  }, [biosecurity]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MORTALITY, JSON.stringify(mortalities));
  }, [mortalities]);

  // Modals state
  const [modalType, setModalType] = useState<
    | 'dog'
    | 'vaccine'
    | 'treatment'
    | 'patrol'
    | 'training'
    | 'feeding'
    | 'breeding'
    | 'biosecurity'
    | 'sale'
    | 'mortality'
    | null
  >(null);

  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  // 1. Dog Form
  const [dogForm, setDogForm] = useState<Partial<DogProfile>>({
    name: '',
    breed: 'German Shepherd (East German Line)',
    gender: 'Male',
    dob: toIsoDate(new Date()),
    chipId: '',
    kennelNo: 'Kennel A-01',
    dutyRole: 'Perimeter Patrol',
    status: 'Active Duty',
    handlerName: 'Officer Kevin O. (Lead K-9 Handler)',
    sire: '',
    dam: '',
    colorMarkings: '',
    notes: ''
  });

  // 2. Vaccine Form
  const [vaxForm, setVaxForm] = useState<Partial<CanineVaccinationRecord>>({
    dogId: '',
    dogName: '',
    vaccineType: 'Rabies',
    dateAdministered: toIsoDate(new Date()),
    nextDueDate: offsetIsoDate(365),
    batchNo: '',
    administeredBy: 'Dr. Devin Omwenga, DVM',
    cost: 1500,
    notes: ''
  });

  // 3. Treatment Form
  const [treatForm, setTreatForm] = useState<Partial<CanineTreatmentRecord>>({
    dogId: '',
    dogName: '',
    date: toIsoDate(new Date()),
    diagnosis: '',
    symptoms: '',
    treatmentAdministered: '',
    temperature: 38.5,
    weightKg: 35,
    attendingVet: 'Dr. Devin Omwenga (General Farm Manager / DVM)',
    cost: 2000,
    status: 'Recovered',
    nextFollowUpDate: '',
    notes: ''
  });

  // 4. Patrol Form
  const [patrolForm, setPatrolForm] = useState<Partial<CaninePatrolRecord>>({
    dogId: '',
    dogName: '',
    handlerName: 'Officer Kevin O.',
    date: toIsoDate(new Date()),
    shift: 'Night Shift (18:00 - 06:00)',
    patrolSector: 'North Boundary & Tea Zone',
    incidentStatus: 'All Clear (Normal)',
    durationMinutes: 720,
    incidentDetails: '',
    notes: ''
  });

  // 5. Training Form
  const [trForm, setTrForm] = useState<Partial<CanineTrainingRecord>>({
    dogId: '',
    dogName: '',
    trainingDate: toIsoDate(new Date()),
    discipline: 'Bite Work & Protection',
    level: 'Level 3: Advanced Guard',
    scorePercentage: 90,
    trainerName: 'Officer Kevin O.',
    passed: true,
    nextEvaluationDate: offsetIsoDate(90),
    notes: ''
  });

  // 6. Feeding Form
  const [feedForm, setFeedForm] = useState<Partial<CanineFeedingRecord>>({
    dogId: '',
    dogName: '',
    date: toIsoDate(new Date()),
    dietType: 'High-Protein Kibble (28%)',
    dailyGrams: 850,
    feedingSchedule: 'Once Daily (Evening)',
    bodyConditionScore: 5,
    weightKg: 38,
    dailyCostKes: 380,
    appetite: 'Vigorous / Excellent',
    notes: ''
  });

  // 7. Breeding Form
  const [breedForm, setBreedForm] = useState<Partial<CanineBreedingRecord>>({
    damId: '',
    damName: '',
    sireName: '',
    heatDate: toIsoDate(new Date()),
    matingDate: toIsoDate(new Date()),
    expectedWhelpingDate: offsetIsoDate(63),
    status: 'Mated / Pregnant',
    litterSize: 0,
    malesCount: 0,
    femalesCount: 0,
    veterinaryNotes: '',
    notes: ''
  });

  // 8. Biosecurity Form
  const [bioForm, setBioForm] = useState<Partial<CanineKennelBiosecurityRecord>>({
    kennelId: 'Kennel Block A (Patrol Run)',
    inspectionDate: toIsoDate(new Date()),
    sanitizedWith: 'Virkon-S Disinfectant',
    beddingReplaced: true,
    waterBowlsSterilized: true,
    pestsControlled: true,
    status: 'Passed & Certified',
    inspectedBy: 'Dr. Devin Omwenga, DVM',
    notes: ''
  });

  // 9. Sale Form
  const [saleForm, setSaleForm] = useState<Partial<CanineSaleRecord>>({
    dogId: '',
    dogName: '',
    breed: 'German Shepherd',
    saleDate: toIsoDate(new Date()),
    buyerName: '',
    buyerPhone: '',
    buyerLocation: '',
    amount: 85000,
    paymentMethod: 'Bank Transfer',
    receiptNumber: `JR-K9-${Date.now().toString().slice(-4)}`,
    purpose: 'Security Guard Dog',
    notes: ''
  });
  const [syncSaleToFinancials, setSyncSaleToFinancials] = useState(true);

  // 10. Mortality Form
  const [mortForm, setMortForm] = useState<Partial<CanineMortalityRecord>>({
    dogId: '',
    dogName: '',
    breed: 'German Shepherd',
    dateOfDeath: toIsoDate(new Date()),
    causeOfDeath: '',
    veterinaryFindings: '',
    attendingVet: 'Dr. Devin Omwenga, DVM',
    disposalMethod: 'Estate Burial',
    biosecurityPrecautions: 'Deep sanitary pit with agricultural quicklime biosecurity seal.',
    notes: ''
  });

  // CSV Exporters
  const exportDogsCsv = () => {
    const headers = ['Name', 'Breed', 'Gender', 'DOB', 'Chip ID', 'Kennel', 'Role', 'Status', 'Handler'];
    const rows = filteredDogs.map(d => [
      d.name, d.breed, d.gender, d.dob, d.chipId || '', d.kennelNo || '', d.dutyRole, d.status, d.handlerName || ''
    ]);
    exportToCsv('JR_Farm_Canine_Registry.csv', headers, rows);
  };

  const exportVaccinesCsv = () => {
    const headers = ['Canine Name', 'Vaccine Target', 'Date Administered', 'Next Due Date', 'Batch No', 'Administered By', 'Cost (KES)'];
    const rows = vaccines.map(v => [
      v.dogName, v.vaccineType, v.dateAdministered, v.nextDueDate, v.batchNo || '', v.administeredBy, v.cost || 0
    ]);
    exportToCsv('JR_Farm_Canine_Vaccinations.csv', headers, rows);
  };

  const exportTreatmentsCsv = () => {
    const headers = ['Canine Name', 'Date', 'Diagnosis', 'Symptoms', 'Treatment', 'Temp (C)', 'Weight (kg)', 'Status', 'Attending Vet'];
    const rows = treatments.map(t => [
      t.dogName, t.date, t.diagnosis, t.symptoms || '', t.treatmentAdministered, t.temperature || '', t.weightKg || '', t.status, t.attendingVet
    ]);
    exportToCsv('JR_Farm_Canine_Treatments.csv', headers, rows);
  };

  // Helpers
  const calculateAge = (dobString?: string) => {
    if (!dobString) return 'Unknown';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 'Unknown';
    const now = new Date();
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 1) return '< 1 month';
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} yrs`;
  };

  const isDueOrOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const getDueStatusText = (dueDateStr?: string) => {
    if (!dueDateStr) return 'No Date';
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `⚠️ Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return '🚨 Due Today!';
    if (diffDays <= 14) return `⏰ Due in ${diffDays}d`;
    return `Upcoming in ${diffDays}d`;
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalDogs = dogs.length;
    const activeDuty = dogs.filter(d => d.status === 'Active Duty').length;
    const inTraining = dogs.filter(d => d.status === 'In Training').length;
    const overdueVax = vaccines.filter(v => isDueOrOverdue(v.nextDueDate)).length;
    const totalPatrolsCount = patrols.length;
    const totalSalesKes = sales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const avgScore = training.length > 0 
      ? Math.round(training.reduce((a, b) => a + (b.scorePercentage || 0), 0) / training.length) 
      : 0;

    return {
      totalDogs,
      activeDuty,
      inTraining,
      overdueVax,
      totalPatrolsCount,
      totalSalesKes,
      avgScore
    };
  }, [dogs, vaccines, patrols, sales, training]);

  // Filtered Dogs
  const filteredDogs = useMemo(() => {
    return dogs.filter(dog => {
      const matchSearch =
        dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dog.chipId && dog.chipId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dog.handlerName && dog.handlerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dog.kennelNo && dog.kennelNo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchBreed = breedFilter === 'all' || dog.breed.toLowerCase().includes(breedFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || dog.status === statusFilter;

      return matchSearch && matchBreed && matchStatus;
    });
  }, [dogs, searchTerm, breedFilter, statusFilter]);

  // Handlers for Add / Edit
  const handleOpenAddDog = () => {
    setEditingItem(null);
    setDogForm({
      name: '',
      breed: 'German Shepherd (East German Line)',
      gender: 'Male',
      dob: toIsoDate(new Date()),
      chipId: `98514100${Math.floor(1000000 + Math.random() * 9000000)}`,
      kennelNo: 'Kennel A-01',
      dutyRole: 'Perimeter Patrol',
      status: 'Active Duty',
      handlerName: staffList.length > 0 ? staffList[0].name : 'Officer Kevin O.',
      sire: '',
      dam: '',
      colorMarkings: '',
      notes: ''
    });
    setModalType('dog');
  };

  const handleEditDog = (dog: DogProfile) => {
    setEditingItem(dog);
    setDogForm(dog);
    setModalType('dog');
  };

  const handleSaveDog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogForm.name) return;

    if (editingItem) {
      setDogs(prev => prev.map(d => d.id === editingItem.id ? { ...d, ...dogForm } as DogProfile : d));
    } else {
      const newDog: DogProfile = {
        ...dogForm,
        id: `k9-${Date.now().toString().slice(-4)}`
      } as DogProfile;
      setDogs(prev => [newDog, ...prev]);

      // Backwards compatibility with generic livestock ledger
      if (onAddLivestock) {
        onAddLivestock({
          type: 'Dogs',
          name: newDog.name,
          countOrBreed: `${newDog.breed} (Chip: ${newDog.chipId || 'N/A'})`,
          activity: `K-9 Registered: ${newDog.dutyRole}`,
          date: toIsoDate(new Date()),
          notes: `Kennel: ${newDog.kennelNo || 'Main'} | Handler: ${newDog.handlerName || 'Security Unit'}`
        });
      }
    }
    setModalType(null);
  };

  const handleDeleteDog = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove canine ${name} from registry?`)) {
      setDogs(prev => prev.filter(d => d.id !== id));
      if (dossierDog?.id === id) setDossierDog(null);
    }
  };

  // Vaccine save
  const handleSaveVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaxForm.dogName) return;

    const newVax: CanineVaccinationRecord = {
      ...vaxForm,
      id: `vax-${Date.now().toString().slice(-4)}`
    } as CanineVaccinationRecord;

    setVaccines(prev => [newVax, ...prev]);
    setModalType(null);

    // Also log in livestock general ledger
    if (onAddLivestock) {
      onAddLivestock({
        type: 'Dogs',
        name: newVax.dogName,
        countOrBreed: `Canine Immunization (${newVax.vaccineType})`,
        activity: `Vaccinated: ${newVax.vaccineType} (Due: ${newVax.nextDueDate})`,
        date: newVax.dateAdministered,
        notes: `Administered by: ${newVax.administeredBy} | Batch: ${newVax.batchNo || 'N/A'}`
      });
    }
  };

  // Treatment save
  const handleSaveTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatForm.dogName || !treatForm.diagnosis) return;

    const newTreat: CanineTreatmentRecord = {
      ...treatForm,
      id: `treat-${Date.now().toString().slice(-4)}`
    } as CanineTreatmentRecord;

    setTreatments(prev => [newTreat, ...prev]);
    setModalType(null);

    if (onAddLivestock) {
      onAddLivestock({
        type: 'Dogs',
        name: newTreat.dogName,
        countOrBreed: `Veterinary Clinical Visit`,
        activity: `Diagnosis: ${newTreat.diagnosis}`,
        date: newTreat.date,
        notes: `Status: ${newTreat.status} | Treatment: ${newTreat.treatmentAdministered}`
      });
    }
  };

  // Patrol save
  const handleSavePatrol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patrolForm.dogName) return;

    const newPatrol: CaninePatrolRecord = {
      ...patrolForm,
      id: `patrol-${Date.now().toString().slice(-4)}`
    } as CaninePatrolRecord;

    setPatrols(prev => [newPatrol, ...prev]);
    setModalType(null);
  };

  // Training save
  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trForm.dogName) return;

    const newTr: CanineTrainingRecord = {
      ...trForm,
      id: `tr-${Date.now().toString().slice(-4)}`
    } as CanineTrainingRecord;

    setTraining(prev => [newTr, ...prev]);
    setModalType(null);
  };

  // Feeding save
  const handleSaveFeeding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedForm.dogName) return;

    const newFeed: CanineFeedingRecord = {
      ...feedForm,
      id: `feed-${Date.now().toString().slice(-4)}`
    } as CanineFeedingRecord;

    setFeeding(prev => [newFeed, ...prev]);
    setModalType(null);
  };

  // Breeding save
  const handleSaveBreeding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breedForm.damName) return;

    const newBreed: CanineBreedingRecord = {
      ...breedForm,
      id: `breed-${Date.now().toString().slice(-4)}`
    } as CanineBreedingRecord;

    setBreeding(prev => [newBreed, ...prev]);
    setModalType(null);
  };

  // Biosecurity save
  const handleSaveBiosecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioForm.kennelId) return;

    const newBio: CanineKennelBiosecurityRecord = {
      ...bioForm,
      id: `bio-${Date.now().toString().slice(-4)}`
    } as CanineKennelBiosecurityRecord;

    setBiosecurity(prev => [newBio, ...prev]);
    setModalType(null);
  };

  // Sale save
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.dogName || !saleForm.buyerName) return;

    const newSale: CanineSaleRecord = {
      ...saleForm,
      id: `sale-${Date.now().toString().slice(-4)}`
    } as CanineSaleRecord;

    setSales(prev => [newSale, ...prev]);

    // Optional: mark dog as sold
    if (newSale.dogId) {
      setDogs(prev => prev.map(d => d.id === newSale.dogId ? { ...d, status: 'Sold' } : d));
    }

    // Auto-record to Financials
    if (syncSaleToFinancials && setFinancials) {
      const financialEntry = {
        id: `fin-${Date.now()}`,
        date: newSale.saleDate,
        type: 'Income' as const,
        category: 'Canine Sales',
        amount: Number(newSale.amount) || 0,
        description: `Sale of K-9 ${newSale.dogName} (${newSale.breed}) to ${newSale.buyerName}`,
        referenceNumber: newSale.receiptNumber
      };
      setFinancials((prev: any[]) => [financialEntry, ...prev]);
    }

    setModalType(null);
  };

  // Mortality save
  const handleSaveMortality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortForm.dogName || !mortForm.causeOfDeath) return;

    const newMort: CanineMortalityRecord = {
      ...mortForm,
      id: `mort-${Date.now().toString().slice(-4)}`
    } as CanineMortalityRecord;

    setMortalities(prev => [newMort, ...prev]);

    // Mark dog as deceased in registry
    if (newMort.dogId) {
      setDogs(prev => prev.map(d => d.id === newMort.dogId ? { ...d, status: 'Deceased' } : d));
    }

    setModalType(null);
  };

  // PDF Generator 1: Single Dog Official Veterinary Health Passport
  const generateDogHealthPassportPdf = (dog: DogProfile) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const primaryColor = [15, 23, 42]; // Slate 900
    const emeraldColor = [4, 120, 87]; // Emerald 700

    // Header Background Strip
    doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.rect(0, 0, 595.28, 40, 'F');

    // Header Titles
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('JR FARM — SOVEREIGN AGRI-SECURITY K-9 SQUAD', 40, 26);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(18);
    doc.text('CANINE VETERINARY HEALTH PASSPORT & PEDIGREE', 40, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Official Medical Record • Registration Chip: ${dog.chipId || 'UNTAGGED'} • Printed: ${toIsoDate(new Date())}`, 40, 84);

    // Canine ID Card Block
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(40, 95, 515, 120, 6, 6, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.text('SECTION A: CANINE PEDIGREE & IDENTITY DOSSIER', 55, 115);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`K-9 Name: ${dog.name}`, 55, 135);
    doc.text(`Breed: ${dog.breed}`, 280, 135);

    doc.setFont('helvetica', 'normal');
    doc.text(`Sex / Status: ${dog.gender} (${dog.status})`, 55, 155);
    doc.text(`Date of Birth: ${dog.dob} (Age: ${calculateAge(dog.dob)})`, 280, 155);

    doc.text(`Kennel Unit: ${dog.kennelNo || 'Main'}`, 55, 175);
    doc.text(`Assigned Handler: ${dog.handlerName || 'Estate Security Unit'}`, 280, 175);

    doc.text(`Sire (Father): ${dog.sire || 'Registered Pedigree'}`, 55, 195);
    doc.text(`Dam (Mother): ${dog.dam || 'Registered Pedigree'}`, 280, 195);

    // Section B: Immunization Records
    let yPos = 235;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.text('SECTION B: MANDATORY CORE IMMUNIZATIONS & DEWORMING', 40, yPos);
    yPos += 12;

    const dogVax = vaccines.filter(v => v.dogId === dog.id || v.dogName.toLowerCase() === dog.name.toLowerCase());
    
    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(40, yPos, 515, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Vaccine / Target', 50, yPos + 14);
    doc.text('Admin Date', 200, yPos + 14);
    doc.text('Batch / Serial', 285, yPos + 14);
    doc.text('Booster Due', 380, yPos + 14);
    doc.text('Attending Vet', 470, yPos + 14);
    yPos += 20;

    if (dogVax.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('No formal vaccination logs recorded for this canine yet.', 50, yPos + 16);
      yPos += 25;
    } else {
      dogVax.forEach((v, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        doc.rect(40, yPos, 515, 18, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(40, yPos, 515, 18, 'S');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(v.vaccineType, 50, yPos + 12);

        doc.setFont('helvetica', 'normal');
        doc.text(v.dateAdministered, 200, yPos + 12);
        doc.text(v.batchNo || '—', 285, yPos + 12);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isDueOrOverdue(v.nextDueDate) ? 220 : 15, isDueOrOverdue(v.nextDueDate) ? 38 : 23, isDueOrOverdue(v.nextDueDate) ? 38 : 42);
        doc.text(v.nextDueDate, 380, yPos + 12);

        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(v.administeredBy || 'Dr. Devin Omwenga', 470, yPos + 12);
        yPos += 18;
      });
    }

    // Section C: Clinical Treatments
    yPos += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.text('SECTION C: CLINICAL EXAMINATIONS & DIAGNOSTIC TREATMENTS', 40, yPos);
    yPos += 12;

    const dogTreats = treatments.filter(t => t.dogId === dog.id || t.dogName.toLowerCase() === dog.name.toLowerCase());
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(40, yPos, 515, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Date', 50, yPos + 14);
    doc.text('Clinical Diagnosis', 115, yPos + 14);
    doc.text('Treatment Administered', 260, yPos + 14);
    doc.text('Status', 450, yPos + 14);
    doc.text('Temp / Wt', 500, yPos + 14);
    yPos += 20;

    if (dogTreats.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('No clinical injuries or medical illnesses reported; canine is healthy.', 50, yPos + 16);
      yPos += 25;
    } else {
      dogTreats.forEach((t, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        doc.rect(40, yPos, 515, 20, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(40, yPos, 515, 20, 'S');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(t.date, 50, yPos + 13);

        doc.setFont('helvetica', 'bold');
        doc.text(t.diagnosis.substring(0, 28), 115, yPos + 13);

        doc.setFont('helvetica', 'normal');
        doc.text(t.treatmentAdministered.substring(0, 40), 260, yPos + 13);

        doc.setTextColor(4, 120, 87);
        doc.text(t.status, 450, yPos + 13);

        doc.setTextColor(71, 85, 105);
        doc.text(`${t.temperature || 38.5}°C / ${t.weightKg || '—'}kg`, 500, yPos + 13);
        yPos += 20;
      });
    }

    // Official Sign-off and Stamp Area
    yPos = Math.max(yPos + 40, 680);
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, yPos, 260, yPos);
    doc.line(335, yPos, 555, yPos);
    doc.setLineDashPattern([], 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Attending Veterinarian Seal & Stamp', 40, yPos + 15);
    doc.text('Presented & Approved by: Dr. Devin Omwenga', 335, yPos + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('General Farm Manager / DVM (JR Farm)', 335, yPos + 28);
    doc.text('Global Veterinary Standards & Sovereign Security Protocol', 40, yPos + 28);

    doc.save(`JR_Farm_Canine_Passport_${dog.name.replace(/\s+/g, '_')}.pdf`);
  };

  // PDF Generator 2: Master Canine Operations & Health Audit Report
  const generateFullCanineAuditPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const emeraldColor = [4, 120, 87];

    // Banner
    doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.rect(0, 0, 595.28, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('JR FARM — SECURITY CANINE UNIT AUDIT & CENSUS', 40, 28);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Comprehensive Estate Security, Health & Asset Valuation Report • Generated: ${new Date().toLocaleString()}`, 40, 60);

    // KPI Summary
    doc.setFillColor(241, 245, 249);
    doc.rect(40, 70, 515, 45, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`Active Canines: ${stats.activeDuty} / ${stats.totalDogs}`, 55, 88);
    doc.text(`In Training: ${stats.inTraining}`, 190, 88);
    doc.text(`Overdue / Due Vaccines: ${stats.overdueVax}`, 280, 88);
    doc.text(`Canine Sales Revenue: KES ${stats.totalSalesKes.toLocaleString()}`, 380, 88);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Patrol Shifts Logged: ${stats.totalPatrolsCount} | Overall Tactical Training Score: ${stats.avgScore}%`, 55, 104);

    let yPos = 135;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.text('CANINE REGISTER & DEPLOYMENT SQUAD', 40, yPos);
    yPos += 10;

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(40, yPos, 515, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.text('Name', 50, yPos + 12);
    doc.text('Breed', 120, yPos + 12);
    doc.text('Chip ID', 240, yPos + 12);
    doc.text('Role', 340, yPos + 12);
    doc.text('Handler', 420, yPos + 12);
    doc.text('Status', 500, yPos + 12);
    yPos += 18;

    dogs.forEach((d, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(40, yPos, 515, 16, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(d.name, 50, yPos + 11);
      doc.text(d.breed.substring(0, 24), 120, yPos + 11);
      doc.text(d.chipId || '—', 240, yPos + 11);
      doc.text(d.dutyRole, 340, yPos + 11);
      doc.text(d.handlerName ? d.handlerName.substring(0, 16) : 'Unassigned', 420, yPos + 11);
      doc.text(d.status, 500, yPos + 11);
      yPos += 16;
    });

    // Upcoming Immunization Alert
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.text('UPCOMING IMMUNIZATION & DEWORMING SCHEDULE', 40, yPos);
    yPos += 10;

    doc.setFillColor(15, 23, 42);
    doc.rect(40, yPos, 515, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.text('Canine Name', 50, yPos + 12);
    doc.text('Vaccine Target', 150, yPos + 12);
    doc.text('Last Administered', 270, yPos + 12);
    doc.text('Next Due Date', 370, yPos + 12);
    doc.text('Attending Veterinarian', 460, yPos + 12);
    yPos += 18;

    vaccines.slice(0, 12).forEach((v, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(40, yPos, 515, 16, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(v.dogName, 50, yPos + 11);
      doc.text(v.vaccineType, 150, yPos + 11);
      doc.text(v.dateAdministered, 270, yPos + 11);
      doc.text(v.nextDueDate, 370, yPos + 11);
      doc.text(v.administeredBy || 'Dr. Devin Omwenga', 460, yPos + 11);
      yPos += 16;
    });

    // Sign off
    yPos = Math.max(yPos + 40, 720);
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, yPos, 555, yPos);
    doc.setLineDashPattern([], 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', 40, yPos + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('JR Farm Official Security & Livestock Registry • All rights reserved', 40, yPos + 30);

    doc.save(`JR_Farm_Master_Canine_Audit_${toIsoDate(new Date())}.pdf`);
  };

  // WhatsApp Roster Share
  const handleShareWhatsApp = () => {
    const text = `*JR FARM — SECURITY CANINE SQUAD BRIEFING* 🐕
Date: ${toIsoDate(new Date())}
Total Dogs: ${stats.totalDogs} | Active Duty: ${stats.activeDuty} | Training: ${stats.inTraining}
Upcoming/Overdue Vaccines: ${stats.overdueVax}
Patrol Shifts Completed: ${stats.totalPatrolsCount}
Canine Commercial Sales: KES ${stats.totalSalesKes.toLocaleString()}

*Lead Canines on Active Duty:*
${dogs.filter(d => d.status === 'Active Duty').map(d => `• ${d.name} (${d.breed}) - ${d.dutyRole} [Handler: ${d.handlerName || 'Security'}]`).join('\n')}

_Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-green-700 shrink-0 shadow-xs">
              <Shield size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 rounded-full">
                  JR FARM AGRI-SECURITY
                </span>
                <span className="text-xs text-gray-500 font-medium">K-9 Squadron & Working Dogs Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Canine Management & Operations
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Complete registry, vaccination trackers, clinical treatments, night patrols, tactical training, breeding litters, and commercial sales ledger.
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-green-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Share Briefing to WhatsApp"
            >
              <Share2 size={14} />
              <span>WhatsApp Briefing</span>
            </button>

            <button
              onClick={generateFullCanineAuditPdf}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Download Full Unit Audit PDF"
            >
              <Download size={14} />
              <span>Master Unit Audit PDF</span>
            </button>

            <button
              onClick={handleOpenAddDog}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus size={15} />
              <span>Register New Canine</span>
            </button>
          </div>
        </div>

        {/* 6 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-gray-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Dogs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-gray-900">{stats.totalDogs}</span>
              <span className="text-[10px] font-semibold text-gray-500">canines</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Patrol</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-700">{stats.activeDuty}</span>
              <span className="text-[10px] font-semibold text-emerald-600">on duty</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">In Training</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-700">{stats.inTraining}</span>
              <span className="text-[10px] font-semibold text-amber-600">apprentices</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${stats.overdueVax > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${stats.overdueVax > 0 ? 'text-red-700' : 'text-gray-500'}`}>
              Vaccine Alerts
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-black ${stats.overdueVax > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {stats.overdueVax}
              </span>
              <span className="text-[10px] font-semibold text-gray-500">due/overdue</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Patrol Shifts</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-indigo-700">{stats.totalPatrolsCount}</span>
              <span className="text-[10px] font-semibold text-indigo-600">logged</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Canine Sales</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-blue-900">KES {(stats.totalSalesKes / 1000).toFixed(0)}k</span>
              <span className="text-[10px] font-semibold text-blue-600">earned</span>
            </div>
          </div>
        </div>

        {/* Overdue Warning Callout if any */}
        {stats.overdueVax > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <span>
                <strong>Veterinary Notice:</strong> {stats.overdueVax} canine(s) have immunizations or quarterly deworming due or overdue.
              </span>
            </div>
            <button
              onClick={() => setSubTab('vaccines')}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0"
            >
              View Vaccines
            </button>
          </div>
        )}
      </div>

      {/* 10 Subtab Navigation Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setSubTab('registry')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'registry'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🐕</span>
            <span>Registry & Roster</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">{dogs.length}</span>
          </button>

          <button
            onClick={() => setSubTab('housing')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'housing'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🏠</span>
            <span>Kennel Bays & Map</span>
          </button>

          <button
            onClick={() => setSubTab('vaccines')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'vaccines'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>💉</span>
            <span>Vaccines & Deworming</span>
            {stats.overdueVax > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setSubTab('treatments')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'treatments'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🩺</span>
            <span>Clinical Treatments</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">{treatments.length}</span>
          </button>

          <button
            onClick={() => setSubTab('patrols')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'patrols'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🛡️</span>
            <span>Patrol & Sentry Logs</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">{patrols.length}</span>
          </button>

          <button
            onClick={() => setSubTab('handover')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'handover'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📋</span>
            <span>Shift Handovers</span>
          </button>

          <button
            onClick={() => setSubTab('medkit')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'medkit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🚨</span>
            <span>Emergency Meds & Antivenom</span>
          </button>

          <button
            onClick={() => setSubTab('training')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'training'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🎖️</span>
            <span>Training & Skills</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">{training.length}</span>
          </button>

          <button
            onClick={() => setSubTab('feeding')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'feeding'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🥩</span>
            <span>Nutrition & BCS</span>
          </button>

          <button
            onClick={() => setSubTab('breeding')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'breeding'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🐾</span>
            <span>Breeding & Litters</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">{breeding.length}</span>
          </button>

          <button
            onClick={() => setSubTab('biosecurity')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'biosecurity'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🧼</span>
            <span>Kennel Biosecurity</span>
          </button>

          <button
            onClick={() => setSubTab('sales')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>💰</span>
            <span>Sales & Placements</span>
          </button>

          <button
            onClick={() => setSubTab('mortality')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'mortality'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🕊️</span>
            <span>Mortality & Biosecure Disposal</span>
          </button>
        </div>

        {/* View Toggle (Only active for registry) */}
        {subTab === 'registry' && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Data Table View"
            >
              <Table size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: REGISTRY & ROSTER */}
      {/* ========================================================= */}
      {subTab === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search dog name, chip ID, handler..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={breedFilter}
                onChange={e => setBreedFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Breeds</option>
                <option value="German Shepherd">German Shepherd</option>
                <option value="Belgian Malinois">Belgian Malinois</option>
                <option value="Rottweiler">Rottweiler</option>
                <option value="Boerboel">Boerboel</option>
                <option value="Doberman">Doberman</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="Active Duty">Active Duty</option>
                <option value="In Training">In Training</option>
                <option value="Medical Rest">Medical Rest</option>
                <option value="Sold">Sold</option>
                <option value="Deceased">Deceased</option>
              </select>

              <button
                onClick={() => {
                  exportDogsCsv();
                }}
                className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                title="Export Registry to CSV"
              >
                <FileSpreadsheet size={15} />
              </button>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDogs.map(dog => (
                <div
                  key={dog.id}
                  className="bg-white border border-gray-200 hover:border-emerald-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-slate-800"></div>

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pt-1 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-gray-900">{dog.name}</h3>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              dog.status === 'Active Duty'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dog.status === 'In Training'
                                ? 'bg-amber-100 text-amber-800'
                                : dog.status === 'Medical Rest'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {dog.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">{dog.breed}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDossierDog(dog)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Full K-9 Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => generateDogHealthPassportPdf(dog)}
                          className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Download Veterinary Health Passport PDF"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => generateKennelPlacardPdf(dog)}
                          className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Print Kennel Gate Door Placard (A5)"
                        >
                          <span className="text-xs">🪧</span>
                        </button>
                        <button
                          onClick={() => handleEditDog(dog)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDog(dog.id, dog.name)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Canine"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 my-3">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Role & Post:</span>
                        <span className="font-semibold text-gray-900 truncate block">{dog.dutyRole}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Kennel Unit:</span>
                        <span className="font-semibold text-gray-900 truncate block">{dog.kennelNo || 'Main Block'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Age / DOB:</span>
                        <span className="font-semibold text-gray-900 truncate block">{calculateAge(dog.dob)} ({dog.dob})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Chip / Tag:</span>
                        <span className="font-mono font-semibold text-emerald-700 text-[11px] truncate block">
                          {dog.chipId || 'Untagged'}
                        </span>
                      </div>
                    </div>

                    {/* Handler & Pedigree */}
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-gray-400" />
                        <span className="font-medium">Handler:</span>
                        <span className="font-bold text-gray-800">{dog.handlerName || 'Estate Security Unit'}</span>
                      </div>
                      {dog.notes && (
                        <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-xl border border-gray-100 line-clamp-2">
                          "{dog.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setDossierDog(dog)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Dossier & History</span>
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setVaxForm(prev => ({ ...prev, dogId: dog.id, dogName: dog.name }));
                        setModalType('vaccine');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-green-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      + Vaccine
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-3.5 pl-5">Canine Name</th>
                      <th className="p-3.5">Breed</th>
                      <th className="p-3.5">Gender</th>
                      <th className="p-3.5">Age</th>
                      <th className="p-3.5">Chip / ID</th>
                      <th className="p-3.5">Duty Role</th>
                      <th className="p-3.5">Kennel</th>
                      <th className="p-3.5">Handler</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDogs.map((dog, idx) => (
                      <tr key={dog.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3.5 pl-5 font-bold text-gray-900">
                          <button
                            onClick={() => setDossierDog(dog)}
                            className="hover:text-emerald-700 underline text-left cursor-pointer"
                          >
                            {dog.name}
                          </button>
                        </td>
                        <td className="p-3.5 text-gray-700">{dog.breed}</td>
                        <td className="p-3.5 text-gray-600">{dog.gender}</td>
                        <td className="p-3.5 text-gray-600">{calculateAge(dog.dob)}</td>
                        <td className="p-3.5 font-mono text-emerald-700 text-[11px]">{dog.chipId || '—'}</td>
                        <td className="p-3.5 font-semibold text-gray-800">{dog.dutyRole}</td>
                        <td className="p-3.5 text-gray-600">{dog.kennelNo || '—'}</td>
                        <td className="p-3.5 text-gray-700">{dog.handlerName || '—'}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              dog.status === 'Active Duty'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {dog.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5 space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => generateDogHealthPassportPdf(dog)}
                            className="p-1 text-gray-500 hover:text-emerald-700 rounded transition-colors"
                            title="Print Passport PDF"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => handleEditDog(dog)}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteDog(dog.id, dog.name)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB HOUSING: KENNEL BAYS MAP */}
      {subTab === 'housing' && (
        <KennelBaysMap
          dogs={dogs}
          onUpdateDogKennel={(dogId, kennelNo) => {
            setDogs(prev => prev.map(d => d.id === dogId ? { ...d, kennelNo } : d));
          }}
        />
      )}

      {/* SUBTAB HANDOVER: SHIFT HANDOVERS */}
      {subTab === 'handover' && (
        <ShiftHandoverChecklist staffList={staffList} dogs={dogs} />
      )}

      {/* SUBTAB MEDKIT: EMERGENCY MEDS & ANTIVENOM */}
      {subTab === 'medkit' && (
        <EmergencyMedicalHub />
      )}

      {/* SUBTAB 2: VACCINES & DEWORMING */}
      {/* ========================================================= */}
      {subTab === 'vaccines' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Immunization, Rabies Prophylaxis & Deworming Hub</h3>
              <p className="text-xs text-gray-500">Track Rabies, DHLPP 5-in-1, quarterly dewormers, and tick/flea prevention.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportVaccinesCsv}
                className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => {
                  setVaxForm({
                    dogId: dogs[0]?.id || '',
                    dogName: dogs[0]?.name || '',
                    vaccineType: 'Rabies',
                    dateAdministered: toIsoDate(new Date()),
                    nextDueDate: offsetIsoDate(365),
                    batchNo: '',
                    administeredBy: 'Dr. Devin Omwenga, DVM',
                    cost: 1500,
                    notes: ''
                  });
                  setModalType('vaccine');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Log Vaccine / Deworming</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3.5 pl-5">Canine Name</th>
                    <th className="p-3.5">Vaccine / Anthelmintic</th>
                    <th className="p-3.5">Date Administered</th>
                    <th className="p-3.5">Next Due Date</th>
                    <th className="p-3.5">Booster Status</th>
                    <th className="p-3.5">Batch / Serial</th>
                    <th className="p-3.5">Attending Officer</th>
                    <th className="p-3.5">Cost (KES)</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vaccines.map((vax, idx) => {
                    const dueWarning = isDueOrOverdue(vax.nextDueDate);
                    return (
                      <tr key={vax.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3.5 pl-5 font-bold text-gray-900">{vax.dogName}</td>
                        <td className="p-3.5 font-semibold text-emerald-800">{vax.vaccineType}</td>
                        <td className="p-3.5 text-gray-600 font-mono">{vax.dateAdministered}</td>
                        <td className="p-3.5 font-bold font-mono text-gray-900">{vax.nextDueDate}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              dueWarning
                                ? 'bg-red-100 text-red-700 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {getDueStatusText(vax.nextDueDate)}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-gray-500 text-[11px]">{vax.batchNo || '—'}</td>
                        <td className="p-3.5 text-gray-700">{vax.administeredBy}</td>
                        <td className="p-3.5 font-bold text-gray-900">KES {(vax.cost || 0).toLocaleString()}</td>
                        <td className="p-3.5 text-right pr-5">
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this vaccination log?')) {
                                setVaccines(prev => prev.filter(v => v.id !== vax.id));
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: CLINICAL TREATMENTS */}
      {/* ========================================================= */}
      {subTab === 'treatments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Veterinary Clinical Treatments & Health Exam</h3>
              <p className="text-xs text-gray-500">Record illnesses, wounds, diagnoses, temperatures, and antibiotic courses.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportTreatmentsCsv}
                className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => {
                  setTreatForm({
                    dogId: dogs[0]?.id || '',
                    dogName: dogs[0]?.name || '',
                    date: toIsoDate(new Date()),
                    diagnosis: '',
                    symptoms: '',
                    treatmentAdministered: '',
                    temperature: 38.5,
                    weightKg: 35,
                    attendingVet: 'Dr. Devin Omwenga (General Farm Manager / DVM)',
                    cost: 2000,
                    status: 'Recovered',
                    nextFollowUpDate: '',
                    notes: ''
                  });
                  setModalType('treatment');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Log Clinical Exam / Treatment</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map(treat => (
              <div key={treat.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-gray-900">{treat.dogName}</h4>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          treat.status === 'Recovered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : treat.status === 'Under Treatment'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {treat.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-500">Date: {treat.date}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this treatment entry?')) {
                        setTreatments(prev => prev.filter(t => t.id !== treat.id));
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Diagnosis:</span>
                    <p className="font-bold text-gray-900">{treat.diagnosis}</p>
                  </div>
                  {treat.symptoms && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Presenting Symptoms:</span>
                      <p className="text-gray-700">{treat.symptoms}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Therapy & Prescription:</span>
                    <p className="text-emerald-800 font-medium">{treat.treatmentAdministered}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span>🌡️ {treat.temperature || 38.5}°C</span>
                    <span>⚖️ {treat.weightKg || '—'} kg</span>
                    <span>💰 KES {(treat.cost || 0).toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">{treat.attendingVet}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: PATROL & SENTRY LOGS */}
      {/* ========================================================= */}
      {subTab === 'patrols' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Estate Perimeter Patrol & Gate Sentry Ledger</h3>
              <p className="text-xs text-gray-500">Record patrol shifts, sector coverage, intruder deterrence, and wildlife defense.</p>
            </div>
            <button
              onClick={() => {
                setPatrolForm({
                  dogId: dogs[0]?.id || '',
                  dogName: dogs[0]?.name || '',
                  handlerName: staffList.length > 0 ? staffList[0].name : 'Officer Kevin O.',
                  date: toIsoDate(new Date()),
                  shift: 'Night Shift (18:00 - 06:00)',
                  patrolSector: 'North Boundary & Tea Zone',
                  incidentStatus: 'All Clear (Normal)',
                  durationMinutes: 720,
                  incidentDetails: '',
                  notes: ''
                });
                setModalType('patrol');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Security Patrol Shift</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3.5 pl-5">Date & Shift</th>
                    <th className="p-3.5">K-9 & Handler</th>
                    <th className="p-3.5">Sector Assigned</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Incident Status</th>
                    <th className="p-3.5">Observations / Incident Details</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patrols.map((pt, idx) => (
                    <tr key={pt.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3.5 pl-5 font-mono">
                        <span className="font-bold text-gray-900 block">{pt.date}</span>
                        <span className="text-[11px] text-gray-500">{pt.shift}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{pt.dogName}</span>
                        <span className="text-[11px] text-gray-500">{pt.handlerName}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-emerald-800">{pt.patrolSector}</td>
                      <td className="p-3.5 text-gray-700">{pt.durationMinutes ? `${pt.durationMinutes / 60} hrs` : '12 hrs'}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            pt.incidentStatus === 'All Clear (Normal)'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pt.incidentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-700 max-w-xs truncate">
                        {pt.incidentDetails || pt.notes || 'Normal perimeter sweep completed without incident.'}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this patrol record?')) {
                              setPatrols(prev => prev.filter(p => p.id !== pt.id));
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: TRAINING & SKILLS */}
      {/* ========================================================= */}
      {subTab === 'training' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">K-9 Tactical Training, Bite Work & Discipline Scores</h3>
              <p className="text-xs text-gray-500">Track obedience, bite-release commands, scent detection trials, and certifications.</p>
            </div>
            <button
              onClick={() => {
                setTrForm({
                  dogId: dogs[0]?.id || '',
                  dogName: dogs[0]?.name || '',
                  trainingDate: toIsoDate(new Date()),
                  discipline: 'Bite Work & Protection',
                  level: 'Level 3: Advanced Guard',
                  scorePercentage: 90,
                  trainerName: 'Officer Kevin O.',
                  passed: true,
                  nextEvaluationDate: offsetIsoDate(90),
                  notes: ''
                });
                setModalType('training');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Training Session</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {training.map(tr => (
              <div key={tr.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-gray-900">{tr.dogName}</h4>
                    <span className="text-xs font-mono text-gray-500">{tr.trainingDate}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-black rounded-xl ${
                      tr.scorePercentage >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : tr.scorePercentage >= 75
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tr.scorePercentage}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Discipline:</span>
                    <span className="font-semibold text-gray-900">{tr.discipline}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Certification Tier:</span>
                    <span className="font-semibold text-emerald-800">{tr.level}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Evaluator:</span>
                    <span>{tr.trainerName}</span>
                  </div>
                  {tr.notes && (
                    <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-xl border border-gray-100 mt-2">
                      "{tr.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Next Eval: {tr.nextEvaluationDate || 'Scheduled in 90d'}</span>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete training record?')) {
                        setTraining(prev => prev.filter(t => t.id !== tr.id));
                      }
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 6: NUTRITION & BODY CONDITION SCORE (BCS) */}
      {/* ========================================================= */}
      {subTab === 'feeding' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Working Canine Nutrition, Rations & Body Condition Score</h3>
              <p className="text-xs text-gray-500">Track high-protein rations (28% CP), BARF raw meat diets, and veterinary BCS (1-9).</p>
            </div>
            <button
              onClick={() => {
                setFeedForm({
                  dogId: dogs[0]?.id || '',
                  dogName: dogs[0]?.name || '',
                  date: toIsoDate(new Date()),
                  dietType: 'High-Protein Kibble (28%)',
                  dailyGrams: 850,
                  feedingSchedule: 'Once Daily (Evening)',
                  bodyConditionScore: 5,
                  weightKg: 38,
                  dailyCostKes: 380,
                  appetite: 'Vigorous / Excellent',
                  notes: ''
                });
                setModalType('feeding');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Daily Feed & BCS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeding.map(f => (
              <div key={f.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-gray-900">{f.dogName}</h4>
                    <span className="text-xs text-gray-500">{f.date} • {f.feedingSchedule}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                      BCS {f.bodyConditionScore}/9 (Optimal)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Diet Formulation:</span>
                    <span className="font-bold text-gray-900">{f.dietType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Daily Ration:</span>
                    <span className="font-bold text-emerald-800">{f.dailyGrams} grams / day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Appetite:</span>
                    <span className="font-semibold text-gray-800">{f.appetite}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Daily Feed Cost:</span>
                    <span className="font-semibold text-gray-900">KES {(f.dailyCostKes || 0).toLocaleString()}</span>
                  </div>
                </div>

                {f.notes && (
                  <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-xl border border-gray-100">
                    "{f.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 7: BREEDING & LITTERS */}
      {/* ========================================================= */}
      {subTab === 'breeding' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Canine Breeding, Gestation (63d) & Whelping Nursery</h3>
              <p className="text-xs text-gray-500">Manage maternal breeding lines, mating pairings, expected whelping dates, and puppy litters.</p>
            </div>
            <button
              onClick={() => {
                setBreedForm({
                  damId: dogs.find(d => d.gender === 'Female')?.id || '',
                  damName: dogs.find(d => d.gender === 'Female')?.name || 'Bella',
                  sireName: 'Major (K9-001 - German Shepherd)',
                  heatDate: toIsoDate(new Date()),
                  matingDate: toIsoDate(new Date()),
                  expectedWhelpingDate: offsetIsoDate(63),
                  status: 'Mated / Pregnant',
                  litterSize: 0,
                  malesCount: 0,
                  femalesCount: 0,
                  veterinaryNotes: '',
                  notes: ''
                });
                setModalType('breeding');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Mating / Litter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breeding.map(br => (
              <div key={br.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-gray-900">{br.damName} × {br.sireName}</h4>
                    <span className="text-xs text-gray-500">Mated: {br.matingDate}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      br.status === 'Weaned'
                        ? 'bg-emerald-100 text-emerald-800'
                        : br.status === 'Delivered (Litter Active)'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {br.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Expected Whelping:</span>
                    <span className="font-bold text-gray-900">{br.expectedWhelpingDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Actual Whelping:</span>
                    <span className="font-bold text-emerald-800">{br.actualWhelpingDate || 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Litter Size:</span>
                    <span className="font-bold text-gray-900">
                      {br.litterSize ? `${br.litterSize} pups (${br.malesCount || 0}M / ${br.femalesCount || 0}F)` : 'In utero'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">Surviving Weaned:</span>
                    <span className="font-bold text-emerald-800">{br.puppySurvivingCount || '—'} pups</span>
                  </div>
                </div>

                {br.veterinaryNotes && (
                  <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <strong>DVM Observation:</strong> {br.veterinaryNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 8: KENNEL BIOSECURITY */}
      {/* ========================================================= */}
      {subTab === 'biosecurity' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Kennel Hygiene, Disinfection & Biosecurity Clearances</h3>
              <p className="text-xs text-gray-500">Track Virkon-S disinfection schedules, bedding replacements, and kennel audit certificates.</p>
            </div>
            <button
              onClick={() => {
                setBioForm({
                  kennelId: 'Kennel Block A (Patrol Run)',
                  inspectionDate: toIsoDate(new Date()),
                  sanitizedWith: 'Virkon-S Disinfectant',
                  beddingReplaced: true,
                  waterBowlsSterilized: true,
                  pestsControlled: true,
                  status: 'Passed & Certified',
                  inspectedBy: 'Dr. Devin Omwenga, DVM',
                  notes: ''
                });
                setModalType('biosecurity');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Kennel Sanitization</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {biosecurity.map(bio => (
              <div key={bio.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-gray-900">{bio.kennelId}</h4>
                    <span className="text-xs text-gray-500">Date: {bio.inspectionDate}</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>{bio.status}</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Sanitization Agent:</span>
                    <span className="font-semibold text-emerald-800">{bio.sanitizedWith}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Bedding Replaced:</span>
                    <span className="text-gray-900">{bio.beddingReplaced ? 'Yes (Clean shavings)' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Water Bowls Sterilized:</span>
                    <span className="text-gray-900">{bio.waterBowlsSterilized ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Inspecting Officer:</span>
                    <span className="font-semibold text-gray-900">{bio.inspectedBy}</span>
                  </div>
                  {bio.notes && (
                    <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-xl border border-gray-100">
                      "{bio.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 9: SALES & PLACEMENTS */}
      {/* ========================================================= */}
      {subTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Commercial Pedigree Canine Sales & Placements</h3>
              <p className="text-xs text-gray-500">Manage buyer agreements, trained canine handovers, and estate financial revenue.</p>
            </div>
            <button
              onClick={() => {
                setSaleForm({
                  dogId: '',
                  dogName: '',
                  breed: 'German Shepherd',
                  saleDate: toIsoDate(new Date()),
                  buyerName: '',
                  buyerPhone: '',
                  buyerLocation: '',
                  amount: 85000,
                  paymentMethod: 'Bank Transfer',
                  receiptNumber: `JR-K9-${Date.now().toString().slice(-4)}`,
                  purpose: 'Security Guard Dog',
                  notes: ''
                });
                setModalType('sale');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Record Canine Sale</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3.5 pl-5">Date</th>
                    <th className="p-3.5">Canine / Breed</th>
                    <th className="p-3.5">Buyer Details</th>
                    <th className="p-3.5">Purpose</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Receipt #</th>
                    <th className="p-3.5">Sale Amount</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map((sale, idx) => (
                    <tr key={sale.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3.5 pl-5 font-mono text-gray-600">{sale.saleDate}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{sale.dogName}</span>
                        <span className="text-[11px] text-gray-500">{sale.breed}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{sale.buyerName}</span>
                        <span className="text-[11px] text-gray-500">{sale.buyerPhone} • {sale.buyerLocation || 'Kenya'}</span>
                      </td>
                      <td className="p-3.5 text-gray-700">{sale.purpose}</td>
                      <td className="p-3.5 font-medium text-gray-800">{sale.paymentMethod}</td>
                      <td className="p-3.5 font-mono text-emerald-700 text-[11px]">{sale.receiptNumber}</td>
                      <td className="p-3.5 font-black text-emerald-700">KES {sale.amount.toLocaleString()}</td>
                      <td className="p-3.5 text-right pr-5">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this sale record?')) {
                              setSales(prev => prev.filter(s => s.id !== sale.id));
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 10: MORTALITY & BIOSECURE DISPOSAL */}
      {/* ========================================================= */}
      {subTab === 'mortality' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">Canine Mortality, Post-Mortem & Biosecure Disposal</h3>
              <p className="text-xs text-gray-500">Record causes of death, veterinary autopsy findings, and deep quicklime sanitary burial.</p>
            </div>
            <button
              onClick={() => {
                setMortForm({
                  dogId: '',
                  dogName: '',
                  breed: 'German Shepherd',
                  dateOfDeath: toIsoDate(new Date()),
                  causeOfDeath: '',
                  veterinaryFindings: '',
                  attendingVet: 'Dr. Devin Omwenga, DVM',
                  disposalMethod: 'Estate Burial',
                  biosecurityPrecautions: 'Deep sanitary pit with agricultural quicklime biosecurity seal.',
                  notes: ''
                });
                setModalType('mortality');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Record Canine Mortality</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mortalities.map(mort => (
              <div key={mort.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-gray-900">{mort.dogName}</h4>
                    <span className="text-xs text-gray-500">{mort.breed} • Date of Passing: {mort.dateOfDeath}</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-800 rounded-full">
                    {mort.disposalMethod}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Cause of Death:</span>
                    <p className="font-bold text-red-700">{mort.causeOfDeath}</p>
                  </div>
                  {mort.veterinaryFindings && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Post-Mortem Findings:</span>
                      <p className="text-gray-700">{mort.veterinaryFindings}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Biosecurity Precautions:</span>
                    <p className="text-gray-700">{mort.biosecurityPrecautions || 'Sanitary disposal completed.'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <span>Attending DVM: {mort.attendingVet || 'Dr. Devin Omwenga, DVM'}</span>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete mortality entry?')) {
                        setMortalities(prev => prev.filter(m => m.id !== mort.id));
                      }
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE CANINE DOSSIER POPUP MODAL */}
      {/* ========================================================= */}
      {dossierDog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-green-700 flex items-center justify-center font-black text-xl">
                  🐕
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{dossierDog.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      {dossierDog.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{dossierDog.breed}</p>
                </div>
              </div>
              <button
                onClick={() => setDossierDog(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Microchip Tag</span>
                <span className="font-mono font-bold text-emerald-700">{dossierDog.chipId || 'Untagged'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Age / Gender</span>
                <span className="font-bold text-gray-900">{calculateAge(dossierDog.dob)} • {dossierDog.gender}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Kennel Post</span>
                <span className="font-bold text-gray-900">{dossierDog.kennelNo || 'Main'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Assigned Handler</span>
                <span className="font-bold text-gray-900">{dossierDog.handlerName || 'Estate Unit'}</span>
              </div>
            </div>

            {/* Pedigree Details */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs space-y-1">
              <span className="font-bold text-emerald-900 block">Pedigree & Lineage:</span>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div><strong>Sire:</strong> {dossierDog.sire || 'Registered Pedigree Sire'}</div>
                <div><strong>Dam:</strong> {dossierDog.dam || 'Registered Pedigree Dam'}</div>
              </div>
            </div>

            {/* Specific Vaccine Timeline for this dog */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">Immunization Records</h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-xs">
                {vaccines.filter(v => v.dogId === dossierDog.id || v.dogName.toLowerCase() === dossierDog.name.toLowerCase()).map(v => (
                  <div key={v.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-gray-900">{v.vaccineType}</span>
                      <span className="text-gray-500 block text-[11px]">Given: {v.dateAdministered} • Batch: {v.batchNo || 'N/A'}</span>
                    </div>
                    <span className="font-bold text-emerald-700">Next: {v.nextDueDate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-gray-500">JR Farm Agri-Security Certified Dossier</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateDogHealthPassportPdf(dossierDog)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Download Health Passport PDF</span>
                </button>
                <button
                  onClick={() => generateKennelPlacardPdf(dossierDog)}
                  className="px-4 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🪧 Print Door Placard (A5)</span>
                </button>
                <button
                  onClick={() => setDossierDog(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGISTER / EDIT CANINE */}
      {/* ========================================================= */}
      {modalType === 'dog' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingItem ? 'Edit Canine Profile' : 'Register New Canine to Squad'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDog} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Canine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major, Rex, Shadow"
                    value={dogForm.name}
                    onChange={e => setDogForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Breed / Lineage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. German Shepherd"
                    value={dogForm.breed}
                    onChange={e => setDogForm(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={dogForm.gender}
                    onChange={e => setDogForm(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Male">Male (Intact)</option>
                    <option value="Female">Female (Intact)</option>
                    <option value="Neutered Male">Neutered Male</option>
                    <option value="Spayed Female">Spayed Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dogForm.dob}
                    onChange={e => setDogForm(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Microchip / Tattoo ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 985141001298411"
                    value={dogForm.chipId}
                    onChange={e => setDogForm(prev => ({ ...prev, chipId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kennel Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Kennel A-01"
                    value={dogForm.kennelNo}
                    onChange={e => setDogForm(prev => ({ ...prev, kennelNo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duty Role *</label>
                  <select
                    value={dogForm.dutyRole}
                    onChange={e => setDogForm(prev => ({ ...prev, dutyRole: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Perimeter Patrol">Perimeter Patrol</option>
                    <option value="Main Gate Security">Main Gate Security</option>
                    <option value="Night Watch">Night Watch</option>
                    <option value="Compound Guard">Compound Guard</option>
                    <option value="Livestock Guardian">Livestock Guardian</option>
                    <option value="Breeding Stock">Breeding Stock</option>
                    <option value="Puppy in Training">Puppy in Training</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Operational Status *</label>
                  <select
                    value={dogForm.status}
                    onChange={e => setDogForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Active Duty">Active Duty</option>
                    <option value="In Training">In Training</option>
                    <option value="Medical Rest">Medical Rest</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Sold">Sold</option>
                    <option value="Deceased">Deceased</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Assigned Handler</label>
                  <input
                    type="text"
                    placeholder="e.g. Officer Kevin O."
                    value={dogForm.handlerName}
                    onChange={e => setDogForm(prev => ({ ...prev, handlerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sire (Father)</label>
                  <input
                    type="text"
                    placeholder="Sire pedigree"
                    value={dogForm.sire}
                    onChange={e => setDogForm(prev => ({ ...prev, sire: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dam (Mother)</label>
                  <input
                    type="text"
                    placeholder="Dam pedigree"
                    value={dogForm.dam}
                    onChange={e => setDogForm(prev => ({ ...prev, dam: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Temperament / Clinical Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Drive, aggression control, bite certification, health conditions..."
                    value={dogForm.notes}
                    onChange={e => setDogForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Save Canine Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VACCINE */}
      {/* ========================================================= */}
      {modalType === 'vaccine' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Log Canine Vaccination / Deworming</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveVaccine} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Canine *</label>
                <select
                  required
                  value={vaxForm.dogName}
                  onChange={e => {
                    const found = dogs.find(d => d.name === e.target.value);
                    setVaxForm(prev => ({ ...prev, dogName: e.target.value, dogId: found?.id || '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">-- Choose Canine --</option>
                  {dogs.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.breed})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vaccine / Anthelmintic *</label>
                  <select
                    value={vaxForm.vaccineType}
                    onChange={e => setVaxForm(prev => ({ ...prev, vaccineType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Rabies">Rabies (Mandatory Annual)</option>
                    <option value="DHLPP 5-in-1">DHLPP 5-in-1 Multi-booster</option>
                    <option value="Deworming">Deworming (Praziquantel - Quarterly)</option>
                    <option value="Flea & Tick Prevention">Flea & Tick Prevention</option>
                    <option value="Parvovirus Booster">Parvovirus Booster</option>
                    <option value="Kennel Cough (Bordetella)">Kennel Cough (Bordetella)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch / Serial No.</label>
                  <input
                    type="text"
                    placeholder="e.g. RAB-9921"
                    value={vaxForm.batchNo}
                    onChange={e => setVaxForm(prev => ({ ...prev, batchNo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date Administered</label>
                  <input
                    type="date"
                    value={vaxForm.dateAdministered}
                    onChange={e => setVaxForm(prev => ({ ...prev, dateAdministered: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Next Booster Due Date</label>
                  <input
                    type="date"
                    value={vaxForm.nextDueDate}
                    onChange={e => setVaxForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Attending Officer / DVM</label>
                <input
                  type="text"
                  value={vaxForm.administeredBy}
                  onChange={e => setVaxForm(prev => ({ ...prev, administeredBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CLINICAL TREATMENT */}
      {/* ========================================================= */}
      {modalType === 'treatment' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Record Veterinary Clinical Exam</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveTreatment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Canine *</label>
                <select
                  required
                  value={treatForm.dogName}
                  onChange={e => {
                    const found = dogs.find(d => d.name === e.target.value);
                    setTreatForm(prev => ({ ...prev, dogName: e.target.value, dogId: found?.id || '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">-- Choose Canine --</option>
                  {dogs.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.breed})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={treatForm.date}
                    onChange={e => setTreatForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Recovery Status</label>
                  <select
                    value={treatForm.status}
                    onChange={e => setTreatForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Recovered">Recovered</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Scheduled Follow-up">Scheduled Follow-up</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minor paw pad laceration, Otitis externa"
                  value={treatForm.diagnosis}
                  onChange={e => setTreatForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Prescription & Administered Therapy</label>
                <textarea
                  rows={2}
                  placeholder="Medication dosage, antibiotic, ointment, bandaging..."
                  value={treatForm.treatmentAdministered}
                  onChange={e => setTreatForm(prev => ({ ...prev, treatmentAdministered: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={treatForm.temperature}
                    onChange={e => setTreatForm(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={treatForm.weightKg}
                    onChange={e => setTreatForm(prev => ({ ...prev, weightKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cost (KES)</label>
                  <input
                    type="number"
                    value={treatForm.cost}
                    onChange={e => setTreatForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PATROL */}
      {/* ========================================================= */}
      {modalType === 'patrol' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Log Security Patrol Shift</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSavePatrol} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Canine *</label>
                <select
                  required
                  value={patrolForm.dogName}
                  onChange={e => {
                    const found = dogs.find(d => d.name === e.target.value);
                    setPatrolForm(prev => ({ ...prev, dogName: e.target.value, dogId: found?.id || '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">-- Choose Canine --</option>
                  {dogs.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.breed})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Shift Type</label>
                  <select
                    value={patrolForm.shift}
                    onChange={e => setPatrolForm(prev => ({ ...prev, shift: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Night Shift (18:00 - 06:00)">Night Shift (18:00 - 06:00)</option>
                    <option value="Day Shift (06:00 - 18:00)">Day Shift (06:00 - 18:00)</option>
                    <option value="Evening Patrol (18:00 - 22:00)">Evening Patrol (18:00 - 22:00)</option>
                    <option value="Perimeter Sweep">Perimeter Sweep</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Patrol Sector</label>
                  <select
                    value={patrolForm.patrolSector}
                    onChange={e => setPatrolForm(prev => ({ ...prev, patrolSector: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="North Boundary & Tea Zone">North Boundary & Tea Zone</option>
                    <option value="South Fence & Stream">South Fence & Stream</option>
                    <option value="Main Gate Sentry">Main Gate Sentry</option>
                    <option value="Livestock & Dairy Pens">Livestock & Dairy Pens</option>
                    <option value="Homestead & Storage">Homestead & Storage</option>
                    <option value="Full Estate Perimeter">Full Estate Perimeter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident Status</label>
                <select
                  value={patrolForm.incidentStatus}
                  onChange={e => setPatrolForm(prev => ({ ...prev, incidentStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="All Clear (Normal)">All Clear (Normal)</option>
                  <option value="Trespasser Deterred">Trespasser Deterred</option>
                  <option value="Perimeter Breach / Fence Damage">Perimeter Breach / Fence Damage</option>
                  <option value="Predator / Wildlife Alert">Predator / Wildlife Alert</option>
                  <option value="Canine Fatigued / Injured">Canine Fatigued / Injured</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident / Patrol Observations</label>
                <textarea
                  rows={2}
                  placeholder="Details of patrol rounds, fences inspected, intruder deterrence..."
                  value={patrolForm.incidentDetails}
                  onChange={e => setPatrolForm(prev => ({ ...prev, incidentDetails: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Patrol Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRAINING */}
      {/* ========================================================= */}
      {modalType === 'training' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Log Tactical Training Session</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveTraining} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Canine *</label>
                <select
                  required
                  value={trForm.dogName}
                  onChange={e => {
                    const found = dogs.find(d => d.name === e.target.value);
                    setTrForm(prev => ({ ...prev, dogName: e.target.value, dogId: found?.id || '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">-- Choose Canine --</option>
                  {dogs.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.breed})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discipline</label>
                  <select
                    value={trForm.discipline}
                    onChange={e => setTrForm(prev => ({ ...prev, discipline: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Bite Work & Protection">Bite Work & Protection</option>
                    <option value="Basic Obedience (Heel/Sit/Down)">Basic Obedience</option>
                    <option value="Advanced Obedience & Recall">Advanced Obedience</option>
                    <option value="Perimeter & Fence Patrol">Perimeter & Fence Patrol</option>
                    <option value="Scent & Tracking">Scent & Tracking</option>
                    <option value="Agility & Obstacle">Agility & Obstacle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Level / Tier</label>
                  <select
                    value={trForm.level}
                    onChange={e => setTrForm(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Level 1: Novice/Puppy">Level 1: Novice</option>
                    <option value="Level 2: Intermediate Working">Level 2: Intermediate</option>
                    <option value="Level 3: Advanced Guard">Level 3: Advanced</option>
                    <option value="Level 4: Tactical Master">Level 4: Tactical Master</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Performance Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={trForm.scorePercentage}
                    onChange={e => setTrForm(prev => ({ ...prev, scorePercentage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trainer</label>
                  <input
                    type="text"
                    value={trForm.trainerName}
                    onChange={e => setTrForm(prev => ({ ...prev, trainerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Training Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FEEDING */}
      {/* ========================================================= */}
      {modalType === 'feeding' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Log Nutrition Ration & BCS</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveFeeding} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Canine *</label>
                <select
                  required
                  value={feedForm.dogName}
                  onChange={e => {
                    const found = dogs.find(d => d.name === e.target.value);
                    setFeedForm(prev => ({ ...prev, dogName: e.target.value, dogId: found?.id || '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">-- Choose Canine --</option>
                  {dogs.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.breed})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Diet Formulation</label>
                  <select
                    value={feedForm.dietType}
                    onChange={e => setFeedForm(prev => ({ ...prev, dietType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="High-Protein Kibble (28%)">High-Protein Kibble (28%)</option>
                    <option value="Raw Meat & Bones (BARF)">Raw Meat & Bones (BARF)</option>
                    <option value="Boiled Offal & Rice">Boiled Offal & Rice</option>
                    <option value="Mixed Nutrition + Supplements">Mixed + Supplements</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ration (Grams/Day)</label>
                  <input
                    type="number"
                    value={feedForm.dailyGrams}
                    onChange={e => setFeedForm(prev => ({ ...prev, dailyGrams: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Body Condition Score (1-9)</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={feedForm.bodyConditionScore}
                    onChange={e => setFeedForm(prev => ({ ...prev, bodyConditionScore: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Daily Cost (KES)</label>
                  <input
                    type="number"
                    value={feedForm.dailyCostKes}
                    onChange={e => setFeedForm(prev => ({ ...prev, dailyCostKes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Feeding Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BREEDING */}
      {/* ========================================================= */}
      {modalType === 'breeding' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Record Breeding Mating / Litter</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveBreeding} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dam (Mother) *</label>
                  <input
                    type="text"
                    required
                    value={breedForm.damName}
                    onChange={e => setBreedForm(prev => ({ ...prev, damName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sire (Father) *</label>
                  <input
                    type="text"
                    required
                    value={breedForm.sireName}
                    onChange={e => setBreedForm(prev => ({ ...prev, sireName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mating Date</label>
                  <input
                    type="date"
                    value={breedForm.matingDate}
                    onChange={e => setBreedForm(prev => ({
                      ...prev,
                      matingDate: e.target.value,
                      expectedWhelpingDate: offsetIsoDate(63, new Date(e.target.value))
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Whelping (+63d)</label>
                  <input
                    type="date"
                    value={breedForm.expectedWhelpingDate}
                    onChange={e => setBreedForm(prev => ({ ...prev, expectedWhelpingDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Breeding Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BIOSECURITY */}
      {/* ========================================================= */}
      {modalType === 'biosecurity' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Record Kennel Biosecurity & Disinfection</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveBiosecurity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kennel Unit / Block *</label>
                <input
                  type="text"
                  required
                  value={bioForm.kennelId}
                  onChange={e => setBioForm(prev => ({ ...prev, kennelId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disinfectant Agent</label>
                  <select
                    value={bioForm.sanitizedWith}
                    onChange={e => setBioForm(prev => ({ ...prev, sanitizedWith: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Virkon-S Disinfectant">Virkon-S Disinfectant</option>
                    <option value="Bleach (Sodium Hypochlorite)">Bleach (Sodium Hypochlorite)</option>
                    <option value="Lime Wash (Calcium Hydroxide)">Lime Wash (Agricultural Lime)</option>
                    <option value="High-Pressure Steam / Water Wash">Steam & Power Wash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Audit Status</label>
                  <select
                    value={bioForm.status}
                    onChange={e => setBioForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Passed & Certified">Passed & Certified</option>
                    <option value="Needs Deep Scrub">Needs Deep Scrub</option>
                    <option value="Quarantine Sealed">Quarantine Sealed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Save Biosecurity Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SALE */}
      {/* ========================================================= */}
      {modalType === 'sale' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Record Canine Sale / Placement</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveSale} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Canine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thor"
                    value={saleForm.dogName}
                    onChange={e => setSaleForm(prev => ({ ...prev, dogName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    value={saleForm.breed}
                    onChange={e => setSaleForm(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Eng. Patrick Mutiso"
                    value={saleForm.buyerName}
                    onChange={e => setSaleForm(prev => ({ ...prev, buyerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Buyer Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+254 7..."
                    value={saleForm.buyerPhone}
                    onChange={e => setSaleForm(prev => ({ ...prev, buyerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sale Price (KES) *</label>
                  <input
                    type="number"
                    required
                    value={saleForm.amount}
                    onChange={e => setSaleForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={e => setSaleForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-900">
                <input
                  type="checkbox"
                  id="syncFin"
                  checked={syncSaleToFinancials}
                  onChange={e => setSyncSaleToFinancials(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="syncFin" className="font-bold cursor-pointer">
                  Auto-sync revenue to JR Farm Financials under category "Canine Sales"
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MORTALITY */}
      {/* ========================================================= */}
      {modalType === 'mortality' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Record Canine Mortality</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveMortality} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Canine Name *</label>
                  <input
                    type="text"
                    required
                    value={mortForm.dogName}
                    onChange={e => setMortForm(prev => ({ ...prev, dogName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    value={mortForm.breed}
                    onChange={e => setMortForm(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Death</label>
                  <input
                    type="date"
                    value={mortForm.dateOfDeath}
                    onChange={e => setMortForm(prev => ({ ...prev, dateOfDeath: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disposal Method</label>
                  <select
                    value={mortForm.disposalMethod}
                    onChange={e => setMortForm(prev => ({ ...prev, disposalMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Estate Burial">Estate Sanitary Burial (Quicklime)</option>
                    <option value="Incineration">Veterinary Incineration</option>
                    <option value="Sanitary Disposal">Sanitary Biosecure Disposal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cause of Death *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute snake envenomation, Gastric dilatation-volvulus (GDV)"
                  value={mortForm.causeOfDeath}
                  onChange={e => setMortForm(prev => ({ ...prev, causeOfDeath: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Post-Mortem Findings</label>
                <textarea
                  rows={2}
                  placeholder="Necropsy observations by attending veterinarian..."
                  value={mortForm.veterinaryFindings}
                  onChange={e => setMortForm(prev => ({ ...prev, veterinaryFindings: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold">
                  Save Mortality Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
