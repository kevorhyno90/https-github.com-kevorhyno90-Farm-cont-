import React, { useState, useMemo } from 'react';
import {
  Search, Plus, FileSpreadsheet, Download, LayoutList, LayoutGrid,
  Heart, Sparkles, Scale, Milk, CheckCircle2, AlertTriangle, ArrowRight,
  ChevronDown, ChevronUp, Calendar, Trash2, PenSquare, Info, Award,
  Activity, ShieldAlert, Check, X, ShieldCheck, Stethoscope, Dna,
  Syringe, Printer, Clock, FileText, CheckCircle
} from 'lucide-react';
import { CalfRecord, HeiferRecord, Cow, VetRecord, AIRecord, MilkingRecord } from '../../types';
import { exportToCsv } from '../../utils/csvHelper';

export interface YoungstockManagerProps {
  calfRecords: CalfRecord[];
  heiferRecords?: HeiferRecord[];
  cows?: Cow[];
  vetRecords?: VetRecord[];
  aiRecords?: AIRecord[];
  milkRecords?: MilkingRecord[];
  onAddCalfRecord: (rec: CalfRecord) => void;
  onDeleteCalfRecord: (id: string) => void;
  onEditCalfRecord?: (id: string, updated: CalfRecord) => void;
  onAddHeifer?: (rec: HeiferRecord) => void;
  onDeleteHeifer?: (id: string) => void;
  onEditHeifer?: (id: string, updated: HeiferRecord) => void;
  onAddCow?: (cow: Cow) => void;
  onAddVetRecord?: (rec: VetRecord) => void;
  onAddAiRecord?: (rec: any) => void;
  onAddMilkRecord?: (rec: MilkingRecord) => void;
  onEditMilkRecord?: (id: string, updated: MilkingRecord, date?: string) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
  initialSubTab?: 'all' | 'calves' | 'heifers';
}

// Unified Youngstock interface for high-density rendering
export interface UnifiedYoungstock {
  id: string;
  source: 'calf' | 'heifer';
  tag: string;
  name: string;
  sex: 'Female' | 'Male';
  dob: string;
  ageDays: number;
  ageMonths: number;
  stage: 'Pre-Weaning' | 'Weaned' | 'Yearling' | 'Breeding Heifer' | 'In-Calf' | 'Bull Calf' | 'Young Bull';
  damId: string;
  sire: string;
  breed: string;
  birthWeightKg: number;
  currentWeightKg: number;
  girthCm: number;
  adgGrams: number;
  milkIntakeLiters: number;
  weaned: boolean;
  creepFeedIntroDate?: string;
  feedRation?: string;
  colostrumFedWithin2Hours?: boolean;
  colostrumVolumeLiters?: number;
  navelDipped?: boolean;
  disbudded?: boolean;
  dewormed?: boolean;
  locality: string;
  breedingReady: boolean;
  pregnancyConfirmed?: boolean;
  expectedCalvingDate?: string;
  notes: string;
  dateLogged: string;
  rawCalf?: CalfRecord;
  rawHeifer?: HeiferRecord;
}

// Age-Based Milestone & SOP Guideline Engine
export function getYoungstockMilestone(item: UnifiedYoungstock): {
  title: string;
  badgeColor: string;
  isUrgent: boolean;
  description: string;
  actionText?: string;
} {
  const { ageDays, ageMonths, disbudded, weaned, pregnancyConfirmed, expectedCalvingDate, sex, currentWeightKg } = item;

  if (pregnancyConfirmed) {
    if (expectedCalvingDate) {
      const due = new Date(expectedCalvingDate).getTime();
      const diffDays = Math.round((due - Date.now()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 60 && diffDays > 0) {
        return {
          title: `🐄 Steaming-Up (${diffDays}d to Calve)`,
          badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
          isUrgent: true,
          description: 'Feed transitional high-density forage and anionic salts 60–21 days pre-calving.',
          actionText: 'Steaming-Up'
        };
      }
    }
    return {
      title: '✨ Confirmed In-Calf',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      isUrgent: false,
      description: 'Gestation progressing normally.'
    };
  }

  if (sex === 'Female' && (currentWeightKg >= 280 || ageMonths >= 14)) {
    return {
      title: '✨ AI Window (≥280kg Ready)',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      isUrgent: true,
      description: 'Reached mature breeding frame. Eligible for first artificial insemination.',
      actionText: 'Inseminate'
    };
  }

  if (ageDays <= 14) {
    return {
      title: '🍼 Maternal Immunity Watch',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      isUrgent: false,
      description: 'Ensure navel is dry and calf drinks 4.5–5.0 Liters warm milk daily.'
    };
  }

  if (ageDays > 14 && ageDays <= 35) {
    if (!disbudded) {
      return {
        title: '⚠️ Disbudding Window (Due)',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        isUrgent: true,
        description: 'Horn bud cauterization is safest between days 14–28 before attaching to skull.',
        actionText: 'Disbud'
      };
    }
    return {
      title: '✓ Disbudding Complete',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      isUrgent: false,
      description: 'Horn buds cauterized. Consuming dry creep starter feed.'
    };
  }

  if (ageDays > 35 && ageDays <= 70) {
    return {
      title: '💉 1st Clostridial / Blackquarter',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      isUrgent: ageDays >= 55,
      description: 'Primary immunization against Blackquarter, Anthrax, and Enterotoxemia.',
      actionText: 'Vaccinate'
    };
  }

  if (ageDays > 70 && ageDays <= 100) {
    if (!weaned) {
      return {
        title: '🥛 Weaning & Deworming (Due)',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        isUrgent: true,
        description: 'Step-down milk volume as dry starter reaches 1.5kg daily; administer first dewormer.',
        actionText: 'Wean & Deworm'
      };
    }
    return {
      title: '✓ Weaned to Solid Diet',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      isUrgent: false,
      description: 'Consuming dry weaner rations, good quality hay, and clean water.'
    };
  }

  if (ageMonths > 3 && ageMonths <= 6) {
    return {
      title: '🌿 Weaner Phase & ECF Watch',
      badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      isUrgent: false,
      description: 'Maintain 650g/day ADG; monitor tick dip intervals for East Coast Fever.'
    };
  }

  if (ageMonths > 6 && ageMonths <= 9) {
    return {
      title: '💉 Brucellosis (S19 / RB51)',
      badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
      isUrgent: false,
      description: 'Calfhood brucellosis vaccination window recommended for dairy replacements.'
    };
  }

  if (ageMonths > 9 && ageMonths <= 13) {
    const diff = Math.max(0, 280 - currentWeightKg);
    return {
      title: `⚖️ Weight Watch (${diff}kg to AI)`,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      isUrgent: false,
      description: 'Targeting 280–300kg liveweight before puberty insemination.'
    };
  }

  return {
    title: '🌿 Routine Growing Stock',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    isUrgent: false,
    description: 'Routine nutrition and mineral salt block monitoring.'
  };
}

export function YoungstockManager({
  calfRecords = [],
  heiferRecords = [],
  cows = [],
  vetRecords = [],
  aiRecords = [],
  milkRecords = [],
  onAddCalfRecord,
  onDeleteCalfRecord,
  onEditCalfRecord,
  onAddHeifer,
  onDeleteHeifer,
  onEditHeifer,
  onAddCow,
  onAddVetRecord,
  onAddAiRecord,
  onAddMilkRecord,
  onEditMilkRecord,
  onTriggerSectionReport,
  initialSubTab = 'all'
}: YoungstockManagerProps) {

  // View state: LIST / TABLE VIEW is default as requested
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'calves' | 'weaners' | 'heifers' | 'in_calf' | 'bulls' | 'tools'>(
    initialSubTab === 'heifers' ? 'heifers' : initialSubTab === 'calves' ? 'calves' : 'all'
  );

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sexFilter, setSexFilter] = useState<'all' | 'Female' | 'Male'>('all');
  const [weanedFilter, setWeanedFilter] = useState<'all' | 'liquid' | 'weaned'>('all');
  const [breedingFilter, setBreedingFilter] = useState<'all' | 'ready' | 'growing'>('all');

  // Interactive Tools state
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [simBirthWeight, setSimBirthWeight] = useState(35);
  const [simTargetWeeks, setSimTargetWeeks] = useState(10);
  const [tapeGirthCm, setTapeGirthCm] = useState(145);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedYoungstock | null>(null);
  const [tapeItem, setTapeItem] = useState<UnifiedYoungstock | null>(null);
  const [graduateItem, setGraduateItem] = useState<UnifiedYoungstock | null>(null);
  const [graduateStatus, setGraduateStatus] = useState<'Lactating' | 'Dry' | 'Heifer' | 'In-Calf'>('Lactating');
  const [graduateLocality, setGraduateLocality] = useState('');

  // Brand-New Modals: Profile Card, AI Insemination, and Medical Check
  const [profileItem, setProfileItem] = useState<UnifiedYoungstock | null>(null);
  const [inseminateItem, setInseminateItem] = useState<UnifiedYoungstock | null>(null);
  const [medicalItem, setMedicalItem] = useState<UnifiedYoungstock | null>(null);

  // Form State for Add Modal
  const [formType, setFormType] = useState<'calf' | 'heifer'>('calf');
  const [formTag, setFormTag] = useState('');
  const [formName, setFormName] = useState('');
  const [formSex, setFormSex] = useState<'Female' | 'Male'>('Female');
  const [formDob, setFormDob] = useState(() => new Date().toISOString().split('T')[0]);
  const [formBreed, setFormBreed] = useState('Friesian');
  const [formDam, setFormDam] = useState('');
  const [formSire, setFormSire] = useState('');
  const [formBirthWeight, setFormBirthWeight] = useState<number | ''>(35);
  const [formGirth, setFormGirth] = useState<number | ''>(100);
  const [formWeight, setFormWeight] = useState<number | ''>(110);
  const [formMilk, setFormMilk] = useState<number | ''>(5);
  const [formWeaned, setFormWeaned] = useState(false);
  const [formCreepDate, setFormCreepDate] = useState('');
  const [formColostrum, setFormColostrum] = useState(true);
  const [formColostrumLiters, setFormColostrumLiters] = useState<number | ''>(4);
  const [formNavelDipped, setFormNavelDipped] = useState(true);
  const [formDisbudded, setFormDisbudded] = useState(false);
  const [formDewormed, setFormDewormed] = useState(false);
  const [formLocality, setFormLocality] = useState('Nursery Hutch');
  const [formRation, setFormRation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formInCalf, setFormInCalf] = useState(false);
  const [formExpectedCalving, setFormExpectedCalving] = useState('');

  // AI Insemination Form State
  const [aiDate, setAiDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [aiBull, setAiBull] = useState('ABS Friesian Super Sire #402');
  const [aiTechnician, setAiTechnician] = useState('Dr. Maina (Inseminator)');
  const [aiCost, setAiCost] = useState(2500);
  const [aiNotes, setAiNotes] = useState('First service at optimal liveweight threshold.');

  // Medical Check Form State
  const [medDate, setMedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [medCondition, setMedCondition] = useState('Calf Scours / Dehydration');
  const [medTreatment, setMedTreatment] = useState('Oral Electrolytes + Kaolin Pectin');
  const [medDrug, setMedDrug] = useState('Aliseryl WS + Diakur Plus');
  const [medCost, setMedCost] = useState(450);
  const [medRepeatDate, setMedRepeatDate] = useState('');
  const [medNotes, setMedNotes] = useState('Calf active, suckling reflex intact. Rehydrating 2x daily.');

  // Girth tape calculation: standard dairy chest girth to liveweight
  const calculateWeightFromGirth = (girth: number) => {
    if (!girth || girth < 50) return 40;
    return Math.round(110 + (girth - 100) * 3.65);
  };

  // Build Unified Youngstock list from both calfRecords and heiferRecords
  const unifiedList = useMemo<UnifiedYoungstock[]>(() => {
    const list: UnifiedYoungstock[] = [];
    const now = new Date();

    // 1. Process calf records
    calfRecords.forEach((c) => {
      const bDate = new Date(c.dob || c.date || now.toISOString());
      const ageDays = Math.max(0, Math.floor((now.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24)));
      const ageMonths = parseFloat((ageDays / 30.4375).toFixed(1));

      // Determine stage
      let stage: UnifiedYoungstock['stage'] = 'Pre-Weaning';
      if (c.stage) {
        stage = c.stage;
      } else if (c.sex === 'Male') {
        stage = ageDays > 180 ? 'Young Bull' : 'Bull Calf';
      } else if (c.weaned) {
        stage = ageMonths >= 12 ? 'Breeding Heifer' : 'Weaned';
      } else {
        stage = 'Pre-Weaning';
      }

      const birthWt = c.birthWeightKg || (c.weight && c.weight < 60 ? c.weight : 35);
      const currentWt = c.currentWeightKg || (c.weight && c.weight >= 60 ? c.weight : (c.girthCm ? calculateWeightFromGirth(c.girthCm) : (c.weaned ? 90 : Math.round(birthWt + (ageDays * 0.65)))));
      const girth = c.girthCm || (c.weight ? Math.round(100 + (c.weight - 110) / 3.65) : 85);
      const adg = ageDays > 0 ? Math.round(((currentWt - birthWt) / ageDays) * 1000) : 650;

      list.push({
        id: c.id,
        source: 'calf',
        tag: c.calfId || c.tag || `Calf-${c.id.slice(-4)}`,
        name: c.calfName || '',
        sex: c.sex || 'Female',
        dob: c.dob || c.date || now.toISOString().split('T')[0],
        ageDays,
        ageMonths,
        stage,
        damId: c.damId || c.dam || 'Cow-Unknown',
        sire: c.sire || 'AI Sire Unknown',
        breed: c.breed || 'Friesian / Cross',
        birthWeightKg: birthWt,
        currentWeightKg: currentWt,
        girthCm: girth,
        adgGrams: adg,
        milkIntakeLiters: c.weaned ? 0 : (c.milkIntakeLiters ?? 4),
        weaned: !!c.weaned,
        creepFeedIntroDate: c.creepFeedIntroDate,
        feedRation: c.weaned ? 'Calf Weaner Pellets + Rhodes Hay' : 'Whole Milk + Creep Starter',
        colostrumFedWithin2Hours: c.colostrumFedWithin2Hours ?? true,
        colostrumVolumeLiters: c.colostrumVolumeLiters ?? 4,
        navelDipped: c.navelDipped ?? true,
        disbudded: c.disbudded ?? (ageDays > 28),
        dewormed: c.dewormed ?? (ageDays > 60),
        locality: c.locality || 'Nursery Pens',
        breedingReady: c.sex !== 'Male' && ageMonths >= 12 && currentWt >= 280,
        notes: c.notes || 'Normal youngstock growth',
        dateLogged: c.date || now.toISOString().split('T')[0],
        rawCalf: c
      });
    });

    // 2. Process heifer records
    heiferRecords.forEach((h) => {
      const tag = h.cowId || h.tag || `Heifer-${h.id.slice(-4)}`;
      if (list.some(item => item.tag === tag)) return;

      const logDate = new Date(h.dateLogged || now.toISOString());
      let bDate = h.dob ? new Date(h.dob) : new Date(logDate.getTime() - 400 * 24 * 60 * 60 * 1000);
      const ageDays = Math.max(0, Math.floor((now.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24)));
      const ageMonths = parseFloat((ageDays / 30.4375).toFixed(1));

      const girth = h.girthCm || h.girth || 150;
      const currentWt = h.weightKg || h.weight || calculateWeightFromGirth(girth);
      const birthWt = h.birthWeightKg || 38;
      const adg = h.averageDailyGainGrams || 720;
      const isBreeding = h.breedingReady ?? (currentWt >= 280);
      const inCalf = !!h.pregnancyConfirmed;

      list.push({
        id: h.id,
        source: 'heifer',
        tag,
        name: h.name || '',
        sex: 'Female',
        dob: h.dob || bDate.toISOString().split('T')[0],
        ageDays,
        ageMonths,
        stage: inCalf ? 'In-Calf' : (isBreeding ? 'Breeding Heifer' : 'Yearling'),
        damId: h.dam || 'Cow-Dam',
        sire: h.sire || h.serviceBullOrStraw || 'AI Sire Semen',
        breed: h.breed || 'Friesian Dairy',
        birthWeightKg: birthWt,
        currentWeightKg: currentWt,
        girthCm: girth,
        adgGrams: adg,
        milkIntakeLiters: 0,
        weaned: true,
        feedRation: h.feedRationType || 'Boma Rhodes hay + Heifer Grower concentrate',
        colostrumFedWithin2Hours: true,
        colostrumVolumeLiters: 4,
        navelDipped: true,
        disbudded: true,
        dewormed: true,
        locality: h.locality || 'Heifer Barn Pen',
        breedingReady: isBreeding,
        pregnancyConfirmed: inCalf,
        expectedCalvingDate: h.expectedCalvingDate,
        notes: h.notes || 'Heifer development log',
        dateLogged: h.dateLogged || now.toISOString().split('T')[0],
        rawHeifer: h
      });
    });

    return list;
  }, [calfRecords, heiferRecords]);

  // Filtered List based on Active Sub-Tab & Filters
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      if (activeFilterTab === 'calves' && (item.ageDays > 90 || item.weaned)) return false;
      if (activeFilterTab === 'weaners' && (!item.weaned || item.ageMonths > 12)) return false;
      if (activeFilterTab === 'heifers' && (item.sex !== 'Female' || item.ageMonths < 10)) return false;
      if (activeFilterTab === 'in_calf' && !item.pregnancyConfirmed) return false;
      if (activeFilterTab === 'bulls' && item.sex !== 'Male') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.tag.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.damId.toLowerCase().includes(q) ||
          item.sire.toLowerCase().includes(q) ||
          item.locality.toLowerCase().includes(q) ||
          item.stage.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (sexFilter !== 'all' && item.sex !== sexFilter) return false;
      if (weanedFilter === 'liquid' && item.weaned) return false;
      if (weanedFilter === 'weaned' && !item.weaned) return false;
      if (breedingFilter === 'ready' && !item.breedingReady) return false;
      if (breedingFilter === 'growing' && item.breedingReady) return false;

      return true;
    });
  }, [unifiedList, activeFilterTab, searchTerm, sexFilter, weanedFilter, breedingFilter]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalHead = unifiedList.length;
    const nurseryCalves = unifiedList.filter(c => !c.weaned);
    const totalMilkFed = nurseryCalves.reduce((acc, c) => acc + (c.milkIntakeLiters || 0), 0);
    const weaners = unifiedList.filter(c => c.weaned && c.ageMonths <= 12);
    const breedingHeifers = unifiedList.filter(c => c.breedingReady);
    const inCalfHeifers = unifiedList.filter(c => c.pregnancyConfirmed);

    return {
      totalHead,
      nurseryCount: nurseryCalves.length,
      totalMilkFed: parseFloat(totalMilkFed.toFixed(1)),
      weanersCount: weaners.length,
      breedingCount: breedingHeifers.length,
      inCalfCount: inCalfHeifers.length
    };
  }, [unifiedList]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Tag ID', 'Friendly Name', 'Sex', 'Stage', 'DOB', 'Age (Days)', 'Age (Months)',
      'Dam ID', 'Sire / Semen Straw', 'Breed', 'Birth Weight (KG)', 'Current Weight (KG)',
      'Chest Girth (CM)', 'ADG (g/day)', 'Daily Milk (L)', 'Weaned', 'Colostrum <2h',
      'Navel Dipped', 'Disbudded', 'Locality', 'Breeding Ready', 'In-Calf', 'Next Care Due', 'Notes'
    ];

    const rows = filteredList.map(item => {
      const milestone = getYoungstockMilestone(item);
      return [
        item.tag,
        item.name || '-',
        item.sex,
        item.stage,
        item.dob,
        item.ageDays,
        item.ageMonths,
        item.damId,
        item.sire,
        item.breed,
        item.birthWeightKg,
        item.currentWeightKg,
        item.girthCm,
        item.adgGrams,
        item.milkIntakeLiters,
        item.weaned ? 'Yes' : 'No',
        item.colostrumFedWithin2Hours ? 'Yes' : 'No',
        item.navelDipped ? 'Yes' : 'No',
        item.disbudded ? 'Yes' : 'No',
        item.locality,
        item.breedingReady ? 'Yes' : 'No',
        item.pregnancyConfirmed ? 'Yes' : 'No',
        milestone.title,
        item.notes.replace(/,/g, ' ')
      ];
    });

    exportToCsv(`Youngstock_Heifer_Registry_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // Sync Milk to Daily Milking Log Handler
  const handleSyncMilkToMilkingLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const needed = metrics.totalMilkFed;

    if (needed <= 0) {
      showToast('No calves currently on liquid milk intake.');
      return;
    }

    const existingToday = milkRecords.find(m => m.date === today);

    if (existingToday && onEditMilkRecord) {
      onEditMilkRecord(existingToday.id, {
        ...existingToday,
        milkUsedByCalf: needed
      }, today);
      showToast(`✓ Updated today's milking ledger with ${needed} L calf milk deduction.`);
    } else if (onAddMilkRecord) {
      onAddMilkRecord({
        id: `m-today-${Date.now()}`,
        date: today,
        morningYield: 0,
        eveningYield: 0,
        totalYield: 0,
        milkUsedByCalf: needed,
        lossSpillage: 0,
        milkSoldDirect: 0,
        milkSoldHotel: 0,
        hotelBalancePayment: 0,
        notes: `Auto-synced ${needed} L daily calf intake from Youngstock Nursery.`
      });
      showToast(`✓ Created today's milk entry with ${needed} L calf milk deduction.`);
    }

    window.dispatchEvent(new Event('local-storage-update'));
  };

  // Quick Tape Liveweight Save
  const handleSaveTape = () => {
    if (!tapeItem) return;
    const newGirth = tapeGirthCm;
    const newWeight = calculateWeightFromGirth(newGirth);

    if (tapeItem.source === 'calf') {
      const updated: CalfRecord = {
        ...(tapeItem.rawCalf || {
          id: tapeItem.id,
          calfId: tapeItem.tag,
          dob: tapeItem.dob,
          notes: tapeItem.notes
        }),
        girthCm: newGirth,
        currentWeightKg: newWeight,
        weight: newWeight,
        updatedAt: new Date().toISOString()
      };
      if (onEditCalfRecord) {
        onEditCalfRecord(tapeItem.id, updated);
      }
    } else {
      const updated: HeiferRecord = {
        ...(tapeItem.rawHeifer || {
          id: tapeItem.id,
          cowId: tapeItem.tag,
          notes: tapeItem.notes
        }),
        girthCm: newGirth,
        weightKg: newWeight,
        weight: newWeight,
        breedingReady: newWeight >= 280,
        dateLogged: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
      if (onEditHeifer) {
        onEditHeifer(tapeItem.id, updated);
      }
    }

    showToast(`✓ Weight tape recorded: ${tapeItem.tag} is ${newWeight} KG (${newGirth} cm).`);
    setTapeItem(null);
  };

  // Submit AI Insemination for Heifer
  const handleSaveAiService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inseminateItem) return;

    // Calculate Dates
    const serviceDate = new Date(aiDate);
    const returnHeat = new Date(serviceDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pdCheck = new Date(serviceDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const calvingDue = new Date(serviceDate.getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Add AI record
    if (onAddAiRecord) {
      const aiRec: AIRecord = {
        id: `ai-${Date.now()}`,
        cowId: inseminateItem.tag,
        date: aiDate,
        bull: aiBull,
        technician: aiTechnician,
        due: calvingDue,
        status: 'Pending',
        checkDate: pdCheck,
        returnHeatDate: returnHeat,
        cost: aiCost,
        notes: `Heifer maiden service. ${aiNotes}`
      };
      onAddAiRecord(aiRec);
    }

    // 2. Update Heifer status
    if (inseminateItem.source === 'heifer' && onEditHeifer) {
      const updated: HeiferRecord = {
        ...(inseminateItem.rawHeifer || {
          id: inseminateItem.id,
          cowId: inseminateItem.tag,
          notes: inseminateItem.notes
        }),
        status: 'Served (Pending PD)',
        lastServiceDate: aiDate,
        serviceBullOrStraw: aiBull,
        expectedCalvingDate: calvingDue,
        pregnancyConfirmed: false,
        updatedAt: new Date().toISOString()
      };
      onEditHeifer(inseminateItem.id, updated);
    }

    showToast(`✓ Insemination logged for ${inseminateItem.tag}! Return heat check on ${returnHeat}.`);
    setInseminateItem(null);
  };

  // Submit Medical Check / Scour Intervention
  const handleSaveMedicalIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalItem) return;

    if (onAddVetRecord) {
      const vetRec: VetRecord = {
        id: `vet-young-${Date.now()}`,
        date: medDate,
        cowId: medicalItem.tag,
        diseaseOrCondition: medCondition,
        treatment: medTreatment,
        drugUsed: medDrug,
        cost: medCost,
        nextTreatmentDate: medRepeatDate || undefined,
        category: 'Calf',
        notes: `Youngstock Clinical Log: ${medNotes}`,
        updatedAt: new Date().toISOString()
      };
      onAddVetRecord(vetRec);
    }

    showToast(`✓ Medical record logged for ${medicalItem.tag} in Veterinary Ledger.`);
    setMedicalItem(null);
  };

  // Submit Add Youngstock Form
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTag.trim() || !formDob) return;

    const birthWt = typeof formBirthWeight === 'number' ? formBirthWeight : 35;
    const girth = typeof formGirth === 'number' ? formGirth : 100;
    const estWeight = typeof formWeight === 'number' ? formWeight : calculateWeightFromGirth(girth);
    const milk = formWeaned ? 0 : (typeof formMilk === 'number' ? formMilk : 4);

    if (formType === 'calf') {
      const newCalf: CalfRecord = {
        id: `cf-${Date.now()}`,
        calfId: formTag.trim(),
        calfName: formName.trim() || undefined,
        sex: formSex,
        dob: formDob,
        breed: formBreed,
        damId: formDam.trim() || 'Cow-Unknown',
        sire: formSire.trim() || undefined,
        birthWeightKg: birthWt,
        currentWeightKg: estWeight,
        girthCm: girth,
        weight: estWeight,
        milkIntakeLiters: milk,
        weaned: formWeaned,
        creepFeedIntroDate: formCreepDate || undefined,
        colostrumFedWithin2Hours: formColostrum,
        colostrumVolumeLiters: typeof formColostrumLiters === 'number' ? formColostrumLiters : 4,
        navelDipped: formNavelDipped,
        disbudded: formDisbudded,
        dewormed: formDewormed,
        locality: formLocality.trim() || 'Nursery Pens',
        notes: formNotes.trim() || 'Young calf registered with complete pedigree.',
        date: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };

      onAddCalfRecord(newCalf);
      showToast(`✓ Registered calf ${newCalf.calfId} in Nursery.`);
    } else {
      const newHeifer: HeiferRecord = {
        id: `hef-${Date.now()}`,
        cowId: formTag.trim(),
        name: formName.trim() || undefined,
        tag: formTag.trim(),
        breed: formBreed,
        dob: formDob,
        dam: formDam.trim() || undefined,
        sire: formSire.trim() || undefined,
        birthWeightKg: birthWt,
        weightKg: estWeight,
        girthCm: girth,
        feedRationType: formRation.trim() || 'Grower mix + Rhodes hay',
        averageDailyGainGrams: 750,
        breedingReady: estWeight >= 280,
        pregnancyConfirmed: formInCalf,
        expectedCalvingDate: formExpectedCalving || undefined,
        locality: formLocality.trim() || 'Heifer Barn',
        notes: formNotes.trim() || 'Heifer logged into growth board.',
        dateLogged: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };

      if (onAddHeifer) {
        onAddHeifer(newHeifer);
      }
      showToast(`✓ Registered heifer ${newHeifer.cowId} in Replacement Board.`);
    }

    setShowAddModal(false);
    setFormTag('');
    setFormName('');
    setFormDam('');
    setFormSire('');
    setFormNotes('');
  };

  // Save Edit Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.source === 'calf') {
      const updated: CalfRecord = {
        ...(editingItem.rawCalf || {
          id: editingItem.id,
          calfId: editingItem.tag,
          dob: editingItem.dob,
          notes: editingItem.notes
        }),
        calfId: editingItem.tag,
        calfName: editingItem.name || undefined,
        sex: editingItem.sex,
        dob: editingItem.dob,
        breed: editingItem.breed,
        damId: editingItem.damId,
        sire: editingItem.sire,
        birthWeightKg: editingItem.birthWeightKg,
        currentWeightKg: editingItem.currentWeightKg,
        girthCm: editingItem.girthCm,
        weight: editingItem.currentWeightKg,
        milkIntakeLiters: editingItem.weaned ? 0 : editingItem.milkIntakeLiters,
        weaned: editingItem.weaned,
        creepFeedIntroDate: editingItem.creepFeedIntroDate,
        colostrumFedWithin2Hours: editingItem.colostrumFedWithin2Hours,
        colostrumVolumeLiters: editingItem.colostrumVolumeLiters,
        navelDipped: editingItem.navelDipped,
        disbudded: editingItem.disbudded,
        dewormed: editingItem.dewormed,
        locality: editingItem.locality,
        notes: editingItem.notes,
        updatedAt: new Date().toISOString()
      };

      if (onEditCalfRecord) {
        onEditCalfRecord(editingItem.id, updated);
      }
      try {
        const c1 = JSON.parse(localStorage.getItem('jr_farm_calves') || '[]');
        const c2 = JSON.parse(localStorage.getItem('jr_farm_dairy_calves') || '[]');
        const updateArr = (arr: any[]) => arr.map((item: any) => (item.id === editingItem.id || item.calfId === editingItem.tag) ? { ...item, ...updated } : item);
        localStorage.setItem('jr_farm_calves', JSON.stringify(updateArr(c1)));
        localStorage.setItem('jr_farm_dairy_calves', JSON.stringify(updateArr(c2)));
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated: HeiferRecord = {
        ...(editingItem.rawHeifer || {
          id: editingItem.id,
          cowId: editingItem.tag,
          notes: editingItem.notes
        }),
        cowId: editingItem.tag,
        name: editingItem.name,
        tag: editingItem.tag,
        breed: editingItem.breed,
        dob: editingItem.dob,
        dam: editingItem.damId,
        sire: editingItem.sire,
        birthWeightKg: editingItem.birthWeightKg,
        weightKg: editingItem.currentWeightKg,
        girthCm: editingItem.girthCm,
        feedRationType: editingItem.feedRation,
        breedingReady: editingItem.currentWeightKg >= 280,
        pregnancyConfirmed: editingItem.pregnancyConfirmed,
        expectedCalvingDate: editingItem.expectedCalvingDate,
        locality: editingItem.locality,
        notes: editingItem.notes,
        updatedAt: new Date().toISOString()
      };

      if (onEditHeifer) {
        onEditHeifer(editingItem.id, updated);
      }
      try {
        const h1 = JSON.parse(localStorage.getItem('jr_farm_heifers') || '[]');
        const h2 = JSON.parse(localStorage.getItem('jr_farm_dairy_heifers') || '[]');
        const updateArr = (arr: any[]) => arr.map((item: any) => (item.id === editingItem.id || item.cowId === editingItem.tag || item.tag === editingItem.tag) ? { ...item, ...updated } : item);
        localStorage.setItem('jr_farm_heifers', JSON.stringify(updateArr(h1)));
        localStorage.setItem('jr_farm_dairy_heifers', JSON.stringify(updateArr(h2)));
      } catch (err) {
        console.error(err);
      }
    }

    window.dispatchEvent(new Event('local-storage-update'));
    showToast(`✓ Profile updated for ${editingItem.tag}.`);
    setEditingItem(null);
  };

  // Graduate Action Handler
  const handleExecuteGraduation = () => {
    if (!graduateItem) return;

    if (graduateItem.source === 'calf' && graduateItem.sex === 'Female') {
      const newHeifer: HeiferRecord = {
        id: `hef-${Date.now()}`,
        cowId: graduateItem.tag,
        name: graduateItem.name,
        tag: graduateItem.tag,
        breed: graduateItem.breed,
        dob: graduateItem.dob,
        dam: graduateItem.damId,
        sire: graduateItem.sire,
        birthWeightKg: graduateItem.birthWeightKg,
        weightKg: graduateItem.currentWeightKg,
        girthCm: graduateItem.girthCm,
        feedRationType: 'High protein Heifer grower pellets + Lucerne hay',
        averageDailyGainGrams: 750,
        breedingReady: graduateItem.currentWeightKg >= 280,
        locality: graduateLocality || 'Heifer Barn Pen 1',
        notes: `Graduated from Youngstock Nursery. ${graduateItem.notes}`,
        dateLogged: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };

      if (onAddHeifer) {
        onAddHeifer(newHeifer);
      }
      onDeleteCalfRecord(graduateItem.id);
      showToast(`✓ Promoted ${graduateItem.tag} to Heifer Roster!`);
    } else {
      if (onAddCow) {
        const newCow: Cow = {
          id: `cow-${Date.now()}`,
          tag: graduateItem.tag,
          name: graduateItem.name || graduateItem.tag,
          breed: graduateItem.breed || 'Friesian',
          dob: graduateItem.dob,
          status: graduateStatus,
          gender: 'Female',
          dam: graduateItem.damId,
          sire: graduateItem.sire,
          weight: graduateItem.currentWeightKg,
          girth: graduateItem.girthCm,
          locality: graduateLocality || 'Main Milking Barn',
          remarks: `Graduated from Heifer Roster. First Calving expected/achieved.`
        };

        onAddCow(newCow);
      }

      if (graduateItem.source === 'heifer' && onDeleteHeifer) {
        onDeleteHeifer(graduateItem.id);
      } else if (graduateItem.source === 'calf') {
        onDeleteCalfRecord(graduateItem.id);
      }

      showToast(`✓ Graduated ${graduateItem.tag} into Main Cow Registry as ${graduateStatus}!`);
    }

    setGraduateItem(null);
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold animate-bounce">
          <CheckCircle className="text-emerald-400" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-900/40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-emerald-500 font-bold text-gray-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Youngstock & Replacement Heifers
              </span>
              <span className="text-[10px] bg-white/10 text-emerald-200 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-mono">
                {metrics.totalHead} Head Tracked
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-medium">
                🍼 {metrics.totalMilkFed} L Milk Fed Daily
              </span>
            </div>
            <h3 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Calf Nursery & Heifer Development Board</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track birth weights, heart-girth growth curves, colostrum immunology, milk intake, and automated breeding weight markers ($280+\text{ kg}$). Transition weaned stock and graduate mature heifers directly into the milking herd.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Sync Milk to Milking Log Button */}
            <button
              onClick={handleSyncMilkToMilkingLog}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl font-bold text-xs transition-all shadow-md"
              title="Auto-deduct nursery calf milk in today's milking ledger"
            >
              <Milk size={14} />
              <span>Sync {metrics.totalMilkFed}L Milk</span>
            </button>

            <button
              onClick={() => setShowToolsDrawer(!showToolsDrawer)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                showToolsDrawer
                  ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <Scale size={14} />
              <span>Scientific Tools</span>
              {showToolsDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl font-bold text-xs transition-all shadow-xs"
              title="Export complete Youngstock directory CSV"
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>

            {onTriggerSectionReport && (
              <button
                onClick={() => onTriggerSectionReport('calves')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl font-bold text-xs transition-all"
                title="Download PDF Report"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs rounded-xl shadow-lg transition-all"
            >
              <Plus size={15} />
              <span>Register Youngstock</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Youngstock</span>
            <div className="text-xl font-black text-white mt-0.5 font-mono">{metrics.totalHead}</div>
            <span className="text-[9px] text-emerald-400 font-medium">Calves & Heifers</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Liquid Milk Fed</span>
            <div className="text-xl font-black text-amber-400 mt-0.5 font-mono">{metrics.nurseryCount} calves</div>
            <span className="text-[9px] text-slate-300 font-medium">{metrics.totalMilkFed} L / day deducted</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Weaned Stock</span>
            <div className="text-xl font-black text-emerald-300 mt-0.5 font-mono">{metrics.weanersCount}</div>
            <span className="text-[9px] text-slate-300 font-medium">Starter + forage diets</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Ready for AI (&ge;280kg)</span>
            <div className="text-xl font-black text-cyan-300 mt-0.5 font-mono">{metrics.breedingCount}</div>
            <span className="text-[9px] text-cyan-400 font-medium">Met breeding threshold</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">In-Calf Heifers</span>
            <div className="text-xl font-black text-purple-300 mt-0.5 font-mono">{metrics.inCalfCount}</div>
            <span className="text-[9px] text-purple-400 font-medium">Steaming-up phase</span>
          </div>
        </div>
      </div>

      {/* Interactive Tools & Scientific Calculators Drawer */}
      {showToolsDrawer && (
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-600" size={18} />
              <h4 className="text-sm font-bold text-gray-900">
                Veterinary Rearing Calculators & Protocols
              </h4>
            </div>
            <button
              onClick={() => setShowToolsDrawer(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tool 1: Interactive Weaning Targetizer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Milk size={14} /> Weaning Targetizer
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  Target: 2x Birth Wt
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600">Birth Weight:</span>
                    <span className="text-emerald-700 font-mono">{simBirthWeight} KG</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="50"
                    step="1"
                    value={simBirthWeight}
                    onChange={(e) => setSimBirthWeight(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600">Target Weaning Age:</span>
                    <span className="text-emerald-700 font-mono">{simTargetWeeks} Wks ({simTargetWeeks * 7} Days)</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="16"
                    step="1"
                    value={simTargetWeeks}
                    onChange={(e) => setSimTargetWeeks(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold block">Target Weaning Wt:</span>
                    <span className="font-bold text-gray-900 font-mono text-sm">{simBirthWeight * 2} KG</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold block">Target ADG:</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      {((simBirthWeight / (simTargetWeeks * 7)) * 1000).toFixed(0)} g/day
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] text-gray-600 leading-snug">
                  💡 <strong>Gold Rule:</strong> Wean only when the calf consumes $\ge 1.5\text{ kg}$ dry starter pellets daily for 3 consecutive days, ensuring rumen papillae fermentation is mature.
                </p>
              </div>
            </div>

            {/* Tool 2: Chest Girth Weight Estimator */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Scale size={14} /> Heart Girth Tape Predictor
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  Weight Tape Formula
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600">Chest Girth Tape:</span>
                    <span className="text-indigo-800 font-mono">{tapeGirthCm} CM</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="1"
                    value={tapeGirthCm}
                    onChange={(e) => setTapeGirthCm(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold block">Estimated Live Weight</span>
                    <span className="text-2xl font-black text-indigo-950 font-mono">
                      {calculateWeightFromGirth(tapeGirthCm)} <span className="text-xs text-gray-600 font-medium">KG</span>
                    </span>
                  </div>
                  <div>
                    {calculateWeightFromGirth(tapeGirthCm) >= 280 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200">
                        <CheckCircle2 size={12} /> Ready for AI (&ge;280kg)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg border border-amber-200">
                        Growing (Needs {280 - calculateWeightFromGirth(tapeGirthCm)} kg)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[10.5px] text-gray-600 leading-snug">
                  🔬 Based on dairy research tape correlation: $100\text{ cm} \approx 110\text{ kg}$, with $\approx 3.65\text{ kg}$ incremental gain per additional centimeter of heart circumference.
                </p>
              </div>
            </div>

            {/* Tool 3: Colostrum & Steaming Up Protocols */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Stethoscope size={14} /> Veterinary Guidelines
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  SOP Benchmarks
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong className="text-emerald-800 text-[11px] block">🍼 The 10% Colostrum Shield:</strong>
                  <span className="text-[10.5px] text-gray-600 block mt-0.5">
                    Feed colostrum equal to 10% of calf weight (e.g. 3.5L for 35kg calf) within exactly <strong>2 hours of birth</strong> before gut pores seal.
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong className="text-purple-800 text-[11px] block">🐄 Heifer Steaming-Up (60 Days Pre-Calving):</strong>
                  <span className="text-[10.5px] text-gray-600 block mt-0.5">
                    Transition in-calf heifers 60–21 days prior to calving with mineralized high-protein forage and anionic salts to prevent milk fever and dystocia.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Subtabs, Search, Filters, and Table/Cards View Toggle */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Sub-Tab Filter Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Youngstock', count: unifiedList.length },
              { id: 'calves', label: '🍼 Nursery Calves (<3m)', count: unifiedList.filter(c => !c.weaned || c.ageDays <= 90).length },
              { id: 'weaners', label: '🌿 Weaners (3-12m)', count: unifiedList.filter(c => c.weaned && c.ageMonths <= 12).length },
              { id: 'heifers', label: '🐄 Replacement Heifers', count: unifiedList.filter(c => c.sex === 'Female' && c.ageMonths >= 10).length },
              { id: 'in_calf', label: '✨ In-Calf Heifers', count: unifiedList.filter(c => c.pregnancyConfirmed).length },
              { id: 'bulls', label: '🐂 Bull Calves', count: unifiedList.filter(c => c.sex === 'Male').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilterTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeFilterTab === tab.id ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table vs Cards Toggle Button */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Dense List/Table View (Recommended)"
            >
              <LayoutList size={14} />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by Tag, Name, Dam, Sire, Pen, Stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Genders (Female & Male)</option>
              <option value="Female">Female (Heifers)</option>
              <option value="Male">Male (Bulls)</option>
            </select>
          </div>

          <div>
            <select
              value={weanedFilter}
              onChange={(e) => setWeanedFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Diet Types</option>
              <option value="liquid">Liquid Milk Fed Only</option>
              <option value="weaned">Weaned (Solid Rations)</option>
            </select>
          </div>

          <div>
            <select
              value={breedingFilter}
              onChange={(e) => setBreedingFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Breeding Status: All</option>
              <option value="ready">Ready for AI (&ge;280kg)</option>
              <option value="growing">Growing (&lt;280kg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table View (Primary) OR Cards View */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Tag & Animal</th>
                  <th className="py-3 px-3">Stage / Sex</th>
                  <th className="py-3 px-3">DOB & Age</th>
                  <th className="py-3 px-3">Pedigree (Dam & Sire)</th>
                  <th className="py-3 px-3">Weight & ADG</th>
                  <th className="py-3 px-3">Nutrition & Milk</th>
                  <th className="py-3 px-3">Veterinary SOPs</th>
                  <th className="py-3 px-3">Next Care Due</th>
                  <th className="py-3 px-3">Pen / Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Info size={28} className="mx-auto text-gray-400" />
                        <p className="font-semibold text-gray-700">No youngstock records match your criteria.</p>
                        <p className="text-[11px] text-gray-500">Try clearing filters or click "Register Youngstock" to add a new profile.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const isBreedingHeifer = item.sex === 'Female' && item.currentWeightKg >= 280;
                    const milestone = getYoungstockMilestone(item);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Tag & Animal (Clickable for Pedigree Certificate Profile) */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setProfileItem(item)}
                            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                            title="Click to view complete Pedigree & Growth Card"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${item.sex === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                            <div>
                              <div className="font-bold text-gray-900 font-mono text-[13px] flex items-center gap-1.5">
                                <span className="underline decoration-emerald-500/40">{item.tag}</span>
                                {item.name && (
                                  <span className="font-medium text-gray-600 text-xs font-sans">({item.name})</span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium">{item.breed}</span>
                            </div>
                          </button>
                        </td>

                        {/* Stage / Sex */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9.5px] border ${
                              item.stage === 'In-Calf'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : item.stage === 'Breeding Heifer'
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                : item.stage === 'Weaned'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : item.stage === 'Pre-Weaning'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {item.stage}
                            </span>
                            <div className="text-[10px] text-gray-500 font-semibold">
                              {item.sex === 'Male' ? '♂ Bull' : '♀ Heifer'}
                            </div>
                          </div>
                        </td>

                        {/* DOB & Age */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800 text-xs">
                            {item.ageDays < 90 ? `${item.ageDays} days` : `${item.ageMonths} mos`}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            DOB: {item.dob}
                          </div>
                        </td>

                        {/* Pedigree */}
                        <td className="py-3 px-3">
                          <div className="text-xs">
                            <span className="text-gray-500 text-[10px] font-semibold block">Dam: <strong className="text-gray-800 font-mono">{item.damId}</strong></span>
                            <span className="text-gray-500 text-[10px] font-semibold block">Sire: <strong className="text-gray-800 font-mono">{item.sire}</strong></span>
                          </div>
                        </td>

                        {/* Weight & ADG */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-mono font-bold text-gray-900">
                              <span>{item.currentWeightKg} kg</span>
                              <span className="text-[10px] text-gray-400">({item.girthCm}cm)</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                              <span>Gain: +{item.adgGrams} g/d</span>
                              <span className="text-gray-400 text-[9px]">(Birth: {item.birthWeightKg}kg)</span>
                            </div>
                          </div>
                        </td>

                        {/* Nutrition & Milk */}
                        <td className="py-3 px-3">
                          {item.weaned ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <Check size={11} className="text-emerald-600" /> Weaned
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                                🍼 {item.milkIntakeLiters} L / day
                              </span>
                              {item.creepFeedIntroDate && (
                                <span className="text-[9.5px] text-gray-500 block">Starter: {item.creepFeedIntroDate}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Veterinary Milestones */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {item.colostrumFedWithin2Hours ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold" title="Colostrum administered within 2 hours of birth">
                                ✓ Colostrum
                              </span>
                            ) : (
                              <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                                ✗ No Colostrum
                              </span>
                            )}
                            {item.navelDipped && (
                              <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold" title="Navel dipped with 7% iodine">
                                ✓ Navel
                              </span>
                            )}
                            {item.disbudded && (
                              <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-bold" title="Disbudded / Dehorned">
                                ✓ Dehorned
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Automated Next Care Due Milestone */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${milestone.badgeColor}`}>
                              {milestone.title}
                            </span>
                            <span className="text-[9.5px] text-gray-500 block leading-tight max-w-[170px]">
                              {milestone.description}
                            </span>
                          </div>
                        </td>

                        {/* Locality */}
                        <td className="py-3 px-3 font-medium text-gray-700 text-xs">
                          {item.locality || 'General Nursery'}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Profile Card Modal */}
                            <button
                              onClick={() => setProfileItem(item)}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200"
                              title="View Pedigree & Growth Certificate"
                            >
                              <FileText size={13} />
                            </button>

                            {/* Medical Check Button */}
                            <button
                              onClick={() => {
                                setMedicalItem(item);
                                setMedCondition(item.ageDays < 60 ? 'Calf Scours / Dehydration' : 'Routine Preventive Deworming');
                                setMedTreatment(item.ageDays < 60 ? 'Oral Electrolytes + Kaolin Pectin' : 'Oral Albendazole 10% drench');
                                setMedDrug(item.ageDays < 60 ? 'Aliseryl WS + Diakur Plus' : 'Albendazole 10%');
                              }}
                              className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-gray-200"
                              title="Log Medical Check / Scour Intervention directly to Veterinary Ledger"
                            >
                              <Stethoscope size={13} />
                            </button>

                            {/* Inseminate Button (For Ready Heifers) */}
                            {item.sex === 'Female' && (
                              <button
                                onClick={() => {
                                  setInseminateItem(item);
                                  setAiBull('ABS Friesian Super Sire #402');
                                }}
                                className={`p-1.5 rounded-lg transition-colors border ${
                                  isBreedingHeifer
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                                    : 'text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 border-gray-200'
                                }`}
                                title="Log AI Insemination directly to AI & Breeding Ledger"
                              >
                                <Syringe size={13} />
                              </button>
                            )}

                            {/* Tape Liveweight Button */}
                            <button
                              onClick={() => {
                                setTapeItem(item);
                                setTapeGirthCm(item.girthCm || 100);
                              }}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200"
                              title="Update liveweight / heart girth tape"
                            >
                              <Scale size={13} />
                            </button>

                            {/* Graduate Animal Button */}
                            <button
                              onClick={() => {
                                setGraduateItem(item);
                                setGraduateLocality(item.locality);
                                setGraduateStatus(item.pregnancyConfirmed ? 'In-Calf' : 'Lactating');
                              }}
                              className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-gray-200"
                              title={
                                item.source === 'calf'
                                  ? 'Graduate to Heifer Roster'
                                  : 'Graduate to Milking Herd (Cow Registry)'
                              }
                            >
                              <ArrowRight size={13} />
                            </button>

                            {/* Edit Profile Button */}
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-200"
                              title="Edit youngstock profile"
                            >
                              <PenSquare size={13} />
                            </button>

                            {/* Delete Profile Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${item.tag} from youngstock registry?`)) {
                                  if (item.source === 'calf') {
                                    onDeleteCalfRecord(item.id);
                                  } else if (onDeleteHeifer) {
                                    onDeleteHeifer(item.id);
                                  }
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-gray-200"
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (Optional Toggle) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const milestone = getYoungstockMilestone(item);
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <button
                        onClick={() => setProfileItem(item)}
                        className="font-mono font-bold text-emerald-800 text-sm block text-left hover:underline"
                      >
                        {item.tag} {item.name ? `(${item.name})` : ''}
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.sex === 'Male' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-pink-50 text-pink-800 border-pink-200'
                        }`}>
                          {item.sex === 'Male' ? '♂ Bull' : '♀ Heifer'}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                          {item.stage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setProfileItem(item)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 border border-gray-200 rounded-lg hover:bg-emerald-50"
                        title="View Profile Certificate"
                      >
                        <FileText size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setMedicalItem(item);
                          setMedCondition(item.ageDays < 60 ? 'Calf Scours / Dehydration' : 'Routine Preventive Deworming');
                        }}
                        className="p-1.5 text-gray-500 hover:text-rose-700 border border-gray-200 rounded-lg hover:bg-rose-50"
                        title="Medical Check"
                      >
                        <Stethoscope size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setTapeItem(item);
                          setTapeGirthCm(item.girthCm || 100);
                        }}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 border border-gray-200 rounded-lg hover:bg-emerald-50"
                        title="Tape Weight"
                      >
                        <Scale size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Milestone Alert Banner */}
                  <div className={`p-2.5 rounded-2xl border ${milestone.badgeColor}`}>
                    <span className="text-[10.5px] font-bold block">{milestone.title}</span>
                    <span className="text-[10px] opacity-90 block mt-0.5">{milestone.description}</span>
                  </div>

                  {/* Pedigree & Age */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[9.5px] text-gray-500 font-semibold block">Dam / Mother</span>
                      <span className="font-bold text-gray-800 font-mono text-xs">{item.damId}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-gray-500 font-semibold block">Age on Farm</span>
                      <span className="font-bold text-emerald-700 text-xs font-mono">{item.ageDays} days ({item.ageMonths} mo)</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-gray-500 font-semibold block">Liveweight</span>
                      <span className="font-bold text-gray-800 font-mono text-xs">{item.currentWeightKg} KG</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-gray-500 font-semibold block">Daily Intake</span>
                      <span className="font-bold text-gray-800 text-xs">{item.weaned ? 'Weaned' : `${item.milkIntakeLiters} L Milk`}</span>
                    </div>
                  </div>

                  {/* Remarks */}
                  {item.notes && (
                    <p className="text-[11px] text-gray-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-medium">Pen: {item.locality}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors"
                      title="Edit youngstock profile"
                    >
                      <PenSquare size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setGraduateItem(item);
                        setGraduateLocality(item.locality);
                        setGraduateStatus(item.pregnancyConfirmed ? 'In-Calf' : 'Lactating');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                    >
                      <span>Graduate</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Register Youngstock Profile (Calf or Heifer) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Plus size={18} className="text-emerald-600" />
                  <span>Register Youngstock Profile</span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Capture newborn birth markers, pedigree, heart-girth metrics, and nursery protocols.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormType('calf')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    formType === 'calf' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
                  }`}
                >
                  🍼 Newborn / Young Calf
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('heifer')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    formType === 'heifer' ? 'bg-white text-indigo-900 shadow-xs' : 'text-gray-600'
                  }`}
                >
                  🐄 Growing / Replacement Heifer
                </button>
              </div>

              {/* 1. Identity & Biological Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Ear Tag ID (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Calf-905 or H-102"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Friendly Name</label>
                  <input
                    type="text"
                    placeholder="E.g. Bella / Daisy II"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Biological Sex</label>
                  <select
                    value={formSex}
                    onChange={(e) => setFormSex(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white focus:border-emerald-500"
                  >
                    <option value="Female">Female (Heifer)</option>
                    <option value="Male">Male (Bull)</option>
                  </select>
                </div>
              </div>

              {/* 2. DOB, Breed, Dam & Sire */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    required
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Breed</label>
                  <input
                    type="text"
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Dam (Mother Tag)</label>
                  <input
                    type="text"
                    placeholder="E.g. Cow-101"
                    value={formDam}
                    onChange={(e) => setFormDam(e.target.value)}
                    list="damList"
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500"
                  />
                  <datalist id="damList">
                    {cows.map(c => <option key={c.id} value={c.tag} />)}
                  </datalist>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Sire / Semen Straw</label>
                  <input
                    type="text"
                    placeholder="E.g. Straw ABS #402"
                    value={formSire}
                    onChange={(e) => setFormSire(e.target.value)}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 3. Weight & Girth Tape */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Birth Weight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="20"
                    max="65"
                    value={formBirthWeight}
                    onChange={(e) => setFormBirthWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Heart Girth (CM)</label>
                  <input
                    type="number"
                    min="50"
                    max="220"
                    value={formGirth}
                    onChange={(e) => {
                      const g = e.target.value === '' ? '' : parseInt(e.target.value);
                      setFormGirth(g);
                      if (typeof g === 'number') {
                        setFormWeight(calculateWeightFromGirth(g));
                      }
                    }}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Estimated Weight (KG)</label>
                  <input
                    type="number"
                    min="20"
                    max="600"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>
              </div>

              {/* 4. Nutrition & Weaning */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Daily Milk (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    disabled={formWeaned}
                    value={formWeaned ? 0 : formMilk}
                    onChange={(e) => setFormMilk(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className={`w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 ${formWeaned ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Starter Creep Feed Date</label>
                  <input
                    type="date"
                    value={formCreepDate}
                    onChange={(e) => setFormCreepDate(e.target.value)}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="addWeaned"
                    checked={formWeaned}
                    onChange={(e) => setFormWeaned(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="addWeaned" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Weaned (No Liquid Milk)
                  </label>
                </div>
              </div>

              {/* 5. Veterinary SOP Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formColostrum}
                    onChange={(e) => setFormColostrum(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Colostrum &le;2h (4L Fed)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNavelDipped}
                    onChange={(e) => setFormNavelDipped(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Navel Dipped (7% Iodine)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDisbudded}
                    onChange={(e) => setFormDisbudded(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Disbudded / Cauterized</span>
                </label>
              </div>

              {/* 6. Locality & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Pen / Housing Locality</label>
                  <input
                    type="text"
                    placeholder="E.g. Nursery Hutch 2"
                    value={formLocality}
                    onChange={(e) => setFormLocality(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Health Observations & Notes</label>
                  <input
                    type="text"
                    placeholder="Active suckling reflex, clear eyes, consuming calf starter pellet."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Youngstock Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <PenSquare size={18} className="text-indigo-600" />
                  <span>Edit Youngstock: {editingItem.tag}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update growth measurements, ration changes, health milestones, or housing pen.
                </p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Ear Tag ID</label>
                  <input
                    type="text"
                    required
                    value={editingItem.tag}
                    onChange={(e) => setEditingItem({ ...editingItem, tag: e.target.value })}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Friendly Name</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Sex</label>
                  <select
                    value={editingItem.sex}
                    onChange={(e) => setEditingItem({ ...editingItem, sex: e.target.value as any })}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="Female">Female (Heifer)</option>
                    <option value="Male">Male (Bull)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">DOB</label>
                  <input
                    type="date"
                    required
                    value={editingItem.dob}
                    onChange={(e) => setEditingItem({ ...editingItem, dob: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Dam (Mother Tag)</label>
                  <input
                    type="text"
                    value={editingItem.damId}
                    onChange={(e) => setEditingItem({ ...editingItem, damId: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Sire / Semen Straw</label>
                  <input
                    type="text"
                    value={editingItem.sire}
                    onChange={(e) => setEditingItem({ ...editingItem, sire: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Current Weight (KG)</label>
                  <input
                    type="number"
                    value={editingItem.currentWeightKg}
                    onChange={(e) => setEditingItem({ ...editingItem, currentWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Chest Girth (CM)</label>
                  <input
                    type="number"
                    value={editingItem.girthCm}
                    onChange={(e) => {
                      const g = parseInt(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        girthCm: g,
                        currentWeightKg: calculateWeightFromGirth(g)
                      });
                    }}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Birth Weight (KG)</label>
                  <input
                    type="number"
                    value={editingItem.birthWeightKg}
                    onChange={(e) => setEditingItem({ ...editingItem, birthWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Daily Milk (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={editingItem.weaned}
                    value={editingItem.weaned ? 0 : editingItem.milkIntakeLiters}
                    onChange={(e) => setEditingItem({ ...editingItem, milkIntakeLiters: parseFloat(e.target.value) || 0 })}
                    className={`w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 ${editingItem.weaned ? 'bg-gray-100' : 'bg-white'}`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="editWeaned"
                    checked={editingItem.weaned}
                    onChange={(e) => setEditingItem({ ...editingItem, weaned: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="editWeaned" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Weaned (Off liquid milk)
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Pen Locality</label>
                  <input
                    type="text"
                    value={editingItem.locality}
                    onChange={(e) => setEditingItem({ ...editingItem, locality: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Clinical Remarks & Diagnostics</label>
                <textarea
                  rows={2}
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Fast Heart-Girth Liveweight Tape Updater */}
      {tapeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="text-emerald-600" size={18} />
                <h4 className="text-sm font-bold text-gray-900">
                  Update Weight Tape: {tapeItem.tag}
                </h4>
              </div>
              <button onClick={() => setTapeItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-600">Chest Circumference (Tape):</span>
                  <span className="text-emerald-700 font-mono text-sm">{tapeGirthCm} CM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="210"
                  step="1"
                  value={tapeGirthCm}
                  onChange={(e) => setTapeGirthCm(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block">Calculated Body Weight</span>
                  <span className="text-2xl font-black text-emerald-950 font-mono">
                    {calculateWeightFromGirth(tapeGirthCm)} <span className="text-xs font-semibold text-emerald-700">KG</span>
                  </span>
                </div>
                <div>
                  {calculateWeightFromGirth(tapeGirthCm) >= 280 ? (
                    <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold block">
                      ✓ Ready for AI
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-xs font-bold block">
                      Growing
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTapeItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTape}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Weight Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Full Pedigree & Growth Profile Card Certificate Modal */}
      {profileItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-200 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md">
                  {profileItem.sex === 'Male' ? '🐂' : '🐄'}
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <span>{profileItem.tag}</span>
                    {profileItem.name && <span className="text-gray-500 font-medium text-xs">({profileItem.name})</span>}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                      {profileItem.breed}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      DOB: {profileItem.dob} ({profileItem.ageDays}d / {profileItem.ageMonths}m)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-gray-500 hover:text-emerald-700 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors"
                  title="Print Profile Card"
                >
                  <Printer size={15} />
                </button>
                <button onClick={() => setProfileItem(null)} className="text-gray-400 hover:text-gray-600 p-1.5">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 3-Generation Pedigree Lineage Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 border-b border-slate-200 pb-1.5">
                <Dna size={14} className="text-indigo-600" />
                <span>Pedigree Lineage & Bloodline</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-pink-700 font-bold uppercase tracking-wider block">Maternal Dam (Mother)</span>
                  <span className="font-bold text-gray-900 font-mono text-sm block">{profileItem.damId}</span>
                  <span className="text-[10px] text-gray-500 block">Milking Herd Lineage</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Paternal Sire (Father)</span>
                  <span className="font-bold text-gray-900 font-mono text-sm block">{profileItem.sire}</span>
                  <span className="text-[10px] text-gray-500 block">AI Straw Semen Source</span>
                </div>
              </div>
            </div>

            {/* Live Growth & Weight Progression */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Scale size={14} className="text-emerald-600" />
                  <span>Growth Journey & Liveweight</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Gain: +{profileItem.adgGrams} g/day
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-gray-500 font-medium block">Birth Weight</span>
                  <span className="text-base font-bold text-gray-900 font-mono mt-0.5 block">{profileItem.birthWeightKg} KG</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-gray-500 font-medium block">Heart Girth</span>
                  <span className="text-base font-bold text-indigo-900 font-mono mt-0.5 block">{profileItem.girthCm} CM</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-gray-500 font-medium block">Current Weight</span>
                  <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">{profileItem.currentWeightKg} KG</span>
                </div>
              </div>

              {/* Progress bar to 280kg AI marker */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10.5px] font-semibold">
                  <span className="text-gray-600">Progress to AI Breeding Weight (280 KG)</span>
                  <span className="font-mono text-emerald-800 font-bold">
                    {Math.min(100, Math.round((profileItem.currentWeightKg / 280) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((profileItem.currentWeightKg / 280) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Veterinary Immunology & SOP Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 border-b border-slate-200 pb-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Immunology & Health Milestones</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 size={14} className={profileItem.colostrumFedWithin2Hours ? 'text-emerald-600' : 'text-gray-300'} />
                  <div>
                    <span className="font-bold text-[11px] block">Colostrum &le;2h (10% Rule)</span>
                    <span className="text-[9.5px] text-gray-500 block">4.0L fed for maternal antibodies</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 size={14} className={profileItem.navelDipped ? 'text-emerald-600' : 'text-gray-300'} />
                  <div>
                    <span className="font-bold text-[11px] block">Navel Dipped (7% Iodine)</span>
                    <span className="text-[9.5px] text-gray-500 block">Prevents joint & navel ill</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 size={14} className={profileItem.disbudded ? 'text-emerald-600' : 'text-gray-300'} />
                  <div>
                    <span className="font-bold text-[11px] block">Horn Buds Cauterized</span>
                    <span className="text-[9.5px] text-gray-500 block">Disbudded at 2–4 weeks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 size={14} className={profileItem.weaned ? 'text-emerald-600' : 'text-amber-500'} />
                  <div>
                    <span className="font-bold text-[11px] block">{profileItem.weaned ? 'Weaned to Dry Feed' : 'Liquid Milk Fed'}</span>
                    <span className="text-[9.5px] text-gray-500 block">{profileItem.weaned ? 'Rumen papillae mature' : `${profileItem.milkIntakeLiters} L / day intake`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 text-[11px]">Housed at: <strong>{profileItem.locality}</strong></span>
              <button
                onClick={() => setProfileItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Direct AI Insemination for Heifers */}
      {inseminateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="text-emerald-600" size={18} />
                <h4 className="text-sm font-black text-gray-900">
                  Log AI Service: {inseminateItem.tag}
                </h4>
              </div>
              <button onClick={() => setInseminateItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAiService} className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-emerald-900 font-bold block text-xs">
                  {inseminateItem.tag} is {inseminateItem.currentWeightKg} KG ({inseminateItem.ageMonths} mos).
                </span>
                <span className="text-[10.5px] text-emerald-700 block mt-0.5">
                  Eligible for maiden service. Insemination will auto-schedule 21-day return heat check and 283-day gestation calendar.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Insemination Date</label>
                <input
                  type="date"
                  required
                  value={aiDate}
                  onChange={(e) => setAiDate(e.target.value)}
                  className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Semen Straw / Bull Selection</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. ABS Friesian Super Sire #402"
                  value={aiBull}
                  onChange={(e) => setAiBull(e.target.value)}
                  className="w-full text-xs font-bold border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Inseminator / Tech</label>
                  <input
                    type="text"
                    required
                    value={aiTechnician}
                    onChange={(e) => setAiTechnician(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Service Fee (KES)</label>
                  <input
                    type="number"
                    value={aiCost}
                    onChange={(e) => setAiCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Service Notes</label>
                <input
                  type="text"
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setInseminateItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Confirm Insemination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Medical Check / Scour Intervention Modal */}
      {medicalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="text-rose-600" size={18} />
                <h4 className="text-sm font-black text-gray-900">
                  Medical Intervention: {medicalItem.tag}
                </h4>
              </div>
              <button onClick={() => setMedicalItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMedicalIntervention} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Date Administered</label>
                <input
                  type="date"
                  required
                  value={medDate}
                  onChange={(e) => setMedDate(e.target.value)}
                  className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              {/* Quick condition selector */}
              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Intervention Category</label>
                <select
                  value={medCondition}
                  onChange={(e) => {
                    const c = e.target.value;
                    setMedCondition(c);
                    if (c.includes('Scours')) {
                      setMedTreatment('Oral Electrolyte Fluid Replacement');
                      setMedDrug('Aliseryl WS + Diakur');
                    } else if (c.includes('Pneumonia')) {
                      setMedTreatment('Injectable Antibiotic + Anti-inflammatory');
                      setMedDrug('Betamox LA + Meloxicam');
                    } else if (c.includes('Deworming')) {
                      setMedTreatment('Broad Spectrum Nematode Drench');
                      setMedDrug('Albendazole 10%');
                    } else if (c.includes('Navel')) {
                      setMedTreatment('Topical Disinfection + Systemic Penicillin');
                      setMedDrug('7% Iodine spray + PenStrep');
                    }
                  }}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white"
                >
                  <option value="Calf Scours / Dehydration">🍼 Calf Scours / Dehydration (Rehydration)</option>
                  <option value="Calf Pneumonia / Respiratory">🫁 Calf Pneumonia / Respiratory Distress</option>
                  <option value="Routine Preventive Deworming">🪱 Routine Preventive Deworming</option>
                  <option value="Navel Infection / Joint Ill">🧴 Navel Infection / Joint Ill</option>
                  <option value="Coccidiosis / Bloody Scour">🩸 Coccidiosis / Bloody Scour</option>
                  <option value="General Health Intervention">General Health Intervention</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Procedure / Treatment Administered</label>
                <input
                  type="text"
                  required
                  value={medTreatment}
                  onChange={(e) => setMedTreatment(e.target.value)}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Drug Used & Dosage</label>
                  <input
                    type="text"
                    value={medDrug}
                    onChange={(e) => setMedDrug(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Medication Cost (KES)</label>
                  <input
                    type="number"
                    value={medCost}
                    onChange={(e) => setMedCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Repeat Check Date (Optional)</label>
                  <input
                    type="date"
                    value={medRepeatDate}
                    onChange={(e) => setMedRepeatDate(e.target.value)}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Clinical Notes</label>
                  <input
                    type="text"
                    value={medNotes}
                    onChange={(e) => setMedNotes(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMedicalItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Medical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: One-Click Graduation Confirmation */}
      {graduateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="text-purple-600" size={20} />
                <h4 className="text-sm font-black text-gray-900">
                  Graduate Youngstock: {graduateItem.tag}
                </h4>
              </div>
              <button onClick={() => setGraduateItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 leading-relaxed">
                {graduateItem.source === 'calf' && graduateItem.sex === 'Female' ? (
                  <>
                    Promote weaned heifer calf <strong>{graduateItem.tag}</strong> ({graduateItem.currentWeightKg} KG, {graduateItem.ageMonths} mos) into the <strong>Heifer Roster</strong> for breeding management.
                  </>
                ) : (
                  <>
                    Promote mature replacement heifer <strong>{graduateItem.tag}</strong> ({graduateItem.currentWeightKg} KG) into the <strong>Main Cow Registry (Milking Herd)</strong> as an active production cow.
                  </>
                )}
              </p>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">New Housing / Pen Locality</label>
                <input
                  type="text"
                  value={graduateLocality}
                  onChange={(e) => setGraduateLocality(e.target.value)}
                  placeholder="E.g. Milking Barn Row 1"
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              {graduateItem.source !== 'calf' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Initial Cow Registry Status</label>
                  <select
                    value={graduateStatus}
                    onChange={(e) => setGraduateStatus(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="Lactating">Lactating (Fresh Calver)</option>
                    <option value="In-Calf">In-Calf Heifer (Steaming-Up)</option>
                    <option value="Dry">Dry Cow</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setGraduateItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteGraduation}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <span>Confirm Graduation</span>
                  <Check size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: Edit Youngstock Profile */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <PenSquare className="text-indigo-600" size={20} />
                <div>
                  <h4 className="text-sm font-black text-gray-900">
                    Edit {editingItem.source === 'calf' ? 'Calf' : 'Heifer'} Profile: {editingItem.tag}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Update identification, weight metrics, parentage, and management logs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Row 1: Identification & Pedigree */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Ear Tag ID (Required)</label>
                  <input
                    type="text"
                    required
                    value={editingItem.tag}
                    onChange={(e) => setEditingItem({ ...editingItem, tag: e.target.value })}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Friendly Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="E.g. Bella"
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Sex</label>
                  <select
                    value={editingItem.sex}
                    onChange={(e) => setEditingItem({ ...editingItem, sex: e.target.value as any })}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white focus:border-indigo-500"
                  >
                    <option value="Female">Female (Heifer)</option>
                    <option value="Male">Male (Bull)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: DOB, Breed, Dam, Sire */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={editingItem.dob}
                    onChange={(e) => setEditingItem({ ...editingItem, dob: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Breed Class</label>
                  <input
                    type="text"
                    value={editingItem.breed}
                    onChange={(e) => setEditingItem({ ...editingItem, breed: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Dam (Mother Tag)</label>
                  <input
                    type="text"
                    value={editingItem.damId || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, damId: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Sire / Straw</label>
                  <input
                    type="text"
                    value={editingItem.sire || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, sire: e.target.value })}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Weight, Girth Tape & Pen Locality */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Birth Weight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="65"
                    value={editingItem.birthWeightKg || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, birthWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Heart Girth (CM)</label>
                  <input
                    type="number"
                    min="40"
                    max="240"
                    value={editingItem.girthCm || ''}
                    onChange={(e) => {
                      const g = parseFloat(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        girthCm: g,
                        currentWeightKg: g > 0 ? calculateWeightFromGirth(g) : editingItem.currentWeightKg
                      });
                    }}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Liveweight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="800"
                    value={editingItem.currentWeightKg || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, currentWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white text-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1">Pen / Locality</label>
                  <input
                    type="text"
                    value={editingItem.locality || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, locality: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Source Specific Attributes */}
              {editingItem.source === 'calf' ? (
                <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/70">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-1">Feeding / Weaning Status</label>
                      <label className="flex items-center gap-2 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={editingItem.weaned}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            weaned: e.target.checked,
                            milkIntakeLiters: e.target.checked ? 0 : (editingItem.milkIntakeLiters || 4)
                          })}
                          className="w-4 h-4 text-emerald-600 rounded-sm"
                        />
                        <span className="text-xs font-bold text-gray-800">
                          {editingItem.weaned ? '✓ Fully Weaned (Solid Rations Only)' : '🥛 Liquid-Fed (Active Milk Intake)'}
                        </span>
                      </label>
                    </div>
                    {!editingItem.weaned && (
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Daily Milk Intake (Liters)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="12"
                          value={editingItem.milkIntakeLiters || 0}
                          onChange={(e) => setEditingItem({ ...editingItem, milkIntakeLiters: parseFloat(e.target.value) || 0 })}
                          className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-900 block mb-1.5">Nursery Health Milestones Completed</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 bg-white p-2 rounded-xl border border-amber-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingItem.colostrumFedWithin2Hours}
                          onChange={(e) => setEditingItem({ ...editingItem, colostrumFedWithin2Hours: e.target.checked })}
                          className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
                        />
                        <span className="text-[11px] font-medium">Colostrum &lt;2h</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 bg-white p-2 rounded-xl border border-amber-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingItem.navelDipped}
                          onChange={(e) => setEditingItem({ ...editingItem, navelDipped: e.target.checked })}
                          className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
                        />
                        <span className="text-[11px] font-medium">Navel Dipped</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 bg-white p-2 rounded-xl border border-amber-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingItem.disbudded}
                          onChange={(e) => setEditingItem({ ...editingItem, disbudded: e.target.checked })}
                          className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
                        />
                        <span className="text-[11px] font-medium">Disbudded</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 bg-white p-2 rounded-xl border border-amber-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingItem.dewormed}
                          onChange={(e) => setEditingItem({ ...editingItem, dewormed: e.target.checked })}
                          className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
                        />
                        <span className="text-[11px] font-medium">Dewormed</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-200/70">
                  <div>
                    <label className="text-[10px] font-bold text-indigo-900 block mb-1">Feed Ration Profile</label>
                    <input
                      type="text"
                      value={editingItem.feedRation || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, feedRation: e.target.value })}
                      placeholder="E.g. Grower pellets + hay"
                      className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-indigo-900 block mb-1">Breeding Status</label>
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={!!editingItem.pregnancyConfirmed}
                        onChange={(e) => setEditingItem({ ...editingItem, pregnancyConfirmed: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded-sm"
                      />
                      <span className="text-xs font-bold text-gray-800">
                        {editingItem.pregnancyConfirmed ? '✨ Confirmed In-Calf' : '🌿 Open / Maiden Heifer'}
                      </span>
                    </label>
                  </div>
                  {editingItem.pregnancyConfirmed && (
                    <div>
                      <label className="text-[10px] font-bold text-indigo-900 block mb-1">Expected Calving Date</label>
                      <input
                        type="date"
                        value={editingItem.expectedCalvingDate || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, expectedCalvingDate: e.target.value })}
                        className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Clinical Remarks & Notes</label>
                <textarea
                  rows={2}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="Health observations, growth traits, vaccination notes..."
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
