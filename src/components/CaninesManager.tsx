import React, { useState, useEffect, useMemo } from 'react';
import {
  DogProfile,
  CanineVaccinationRecord,
  CanineTreatmentRecord,
  CanineSaleRecord,
  CanineMortalityRecord,
  StaffMember,
  LivestockRecord
} from '../types';
import {
  Shield, ShieldCheck, ShieldAlert, Award, Plus, Trash2, Edit2, Search,
  Calendar, FileText, Download, Share2, Printer, Heart, CheckCircle2,
  AlertTriangle, Clock, DollarSign, Eye, Activity, Phone, UserCheck,
  Stethoscope, Syringe, Sparkles, TrendingUp, ChevronRight, User,
  MapPin, Check, FileSpreadsheet, LayoutGrid, Table
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useFarmState } from '../context/FarmContext';
import { toIsoDate, offsetIsoDate } from '../utils/dateHelper';

interface CaninesManagerProps {
  staffList?: StaffMember[];
  livestock?: LivestockRecord[];
  onAddLivestock?: (rec: any) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type CanineSubTab = 'registry' | 'vaccines' | 'treatments' | 'sales' | 'mortality';
type ViewMode = 'cards' | 'table';

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

  // Today string
  const todayStr = toIsoDate(new Date());

  // =========================================================================
  // PERSISTENT CANINE STORAGE (localStorage with initial seed)
  // =========================================================================
  const [dogs, setDogs] = useState<DogProfile[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_canine_profiles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Seed dogs
    return [
      {
        id: 'k9-01',
        name: 'Major',
        breed: 'German Shepherd (GSD)',
        gender: 'Male',
        dob: '2023-03-15',
        chipId: 'K9-JR-8821',
        kennelNo: 'Kennel A-01',
        dutyRole: 'Perimeter Patrol',
        status: 'Active Duty',
        handlerName: 'Corporal Charles Ngetich',
        sire: 'Thor vom Haus',
        dam: 'Bella von Alpha',
        colorMarkings: 'Black & Tan Saddle',
        notes: 'High drive, excellent perimeter deterrence and obedience.'
      },
      {
        id: 'k9-02',
        name: 'Rex',
        breed: 'German Shepherd (GSD)',
        gender: 'Male',
        dob: '2023-03-15',
        chipId: 'K9-JR-8822',
        kennelNo: 'Kennel A-02',
        dutyRole: 'Night Watch',
        status: 'Active Duty',
        handlerName: 'Corporal Charles Ngetich',
        sire: 'Thor vom Haus',
        dam: 'Bella von Alpha',
        colorMarkings: 'Sable',
        notes: 'Assigned to night patrols around milking parlor and fodder store.'
      },
      {
        id: 'k9-03',
        name: 'Bruno',
        breed: 'Rottweiler',
        gender: 'Neutered Male',
        dob: '2022-07-20',
        chipId: 'K9-JR-7419',
        kennelNo: 'Kennel B-01',
        dutyRole: 'Main Gate Security',
        status: 'Active Duty',
        handlerName: 'David Koech',
        sire: 'Maximus King',
        dam: 'Roxie Queen',
        colorMarkings: 'Black & Mahogany',
        notes: 'Stationed at primary farm entrance. Calm temperament, fierce guardian.'
      },
      {
        id: 'k9-04',
        name: 'Simba',
        breed: 'Boerboel',
        gender: 'Male',
        dob: '2024-01-10',
        chipId: 'K9-JR-9104',
        kennelNo: 'Kennel C-01',
        dutyRole: 'Livestock Guardian',
        status: 'In Training',
        handlerName: 'David Koech',
        sire: 'Goliath South',
        dam: 'Zara Shield',
        colorMarkings: 'Fawn with Black Mask',
        notes: 'Under training for pasture herd protection against night predators.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_canine_profiles', JSON.stringify(dogs));
    } catch (e) {
      console.error('Failed to save dogs to localStorage', e);
    }
  }, [dogs]);

  // Vaccinations & Deworming records
  const [vaccinations, setVaccinations] = useState<CanineVaccinationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_canine_vaccinations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'vax-01',
        dogId: 'k9-01',
        dogName: 'Major',
        vaccineType: 'Rabies',
        dateAdministered: offsetIsoDate(-60),
        nextDueDate: offsetIsoDate(305),
        batchNo: 'RAB-2026-X8',
        administeredBy: 'Dr. Devin Omwenga (DVM)',
        cost: 1500,
        notes: 'Annual mandatory Rabies vaccine administered subcutaneously.'
      },
      {
        id: 'vax-02',
        dogId: 'k9-01',
        dogName: 'Major',
        vaccineType: 'Deworming',
        dateAdministered: offsetIsoDate(-75),
        nextDueDate: offsetIsoDate(15),
        batchNo: 'PRZ-902',
        administeredBy: 'Dr. Devin Omwenga (DVM)',
        cost: 600,
        notes: 'Praziquantel oral broad-spectrum tablet.'
      },
      {
        id: 'vax-03',
        dogId: 'k9-02',
        dogName: 'Rex',
        vaccineType: 'DHLPP 5-in-1',
        dateAdministered: offsetIsoDate(-40),
        nextDueDate: offsetIsoDate(325),
        batchNo: 'DHLPP-8812',
        administeredBy: 'Dr. Devin Omwenga (DVM)',
        cost: 2500,
        notes: 'Parvovirus, Distemper, Hepatitis multi-booster.'
      },
      {
        id: 'vax-04',
        dogId: 'k9-03',
        dogName: 'Bruno',
        vaccineType: 'Deworming',
        dateAdministered: offsetIsoDate(-85),
        nextDueDate: offsetIsoDate(5),
        batchNo: 'PRZ-902',
        administeredBy: 'Dr. Devin Omwenga (DVM)',
        cost: 600,
        notes: 'Quarterly routine deworming.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_canine_vaccinations', JSON.stringify(vaccinations));
    } catch (e) {
      console.error('Failed to save vaccinations', e);
    }
  }, [vaccinations]);

  // Clinical Treatments records
  const [treatments, setTreatments] = useState<CanineTreatmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_canine_treatments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'tx-01',
        dogId: 'k9-01',
        dogName: 'Major',
        date: offsetIsoDate(-10),
        diagnosis: 'Minor paw pad laceration from perimeter fence wire',
        symptoms: 'Mild limping on right forelimb, slight bleeding',
        treatmentAdministered: 'Antiseptic chlorhexidine scrub, wound sutured (2 nylon stitches), Betamox LA injection',
        temperature: 38.6,
        weightKg: 36.5,
        attendingVet: 'Dr. Devin Omwenga (DVM)',
        cost: 2200,
        status: 'Recovered',
        notes: 'Wound fully healed, stitches removed, back on full duty.'
      },
      {
        id: 'tx-02',
        dogId: 'k9-04',
        dogName: 'Simba',
        date: offsetIsoDate(-3),
        diagnosis: 'Mild gastrointestinal upset / diet change adaptation',
        symptoms: 'Loose stool, slight lethargy, normal appetite',
        treatmentAdministered: 'Probiotic paste (Canikur) + Oral rehydration salts + bland rice and boiled chicken diet',
        temperature: 38.9,
        weightKg: 42.0,
        attendingVet: 'Dr. Devin Omwenga (DVM)',
        cost: 1400,
        status: 'Under Treatment',
        nextFollowUpDate: offsetIsoDate(2),
        notes: 'Improving well, stool firming up, active.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_canine_treatments', JSON.stringify(treatments));
    } catch (e) {
      console.error('Failed to save treatments', e);
    }
  }, [treatments]);

  // Canine Sales & Placements
  const [sales, setSales] = useState<CanineSaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_canine_sales');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'sale-01',
        dogName: 'K-9 Kaiser',
        breed: 'German Shepherd (GSD)',
        saleDate: offsetIsoDate(-45),
        buyerName: 'Kipchoge Security Services Ltd',
        buyerPhone: '+254 722 890 123',
        buyerLocation: 'Kericho Tea Hub',
        amount: 85000,
        paymentMethod: 'Bank Transfer',
        receiptNumber: 'K9-INV-2026-001',
        purpose: 'Security Guard Dog',
        notes: 'Fully trained obedience & perimeter deterrence officer. Microchipped and vaccinated.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_canine_sales', JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales', e);
    }
  }, [sales]);

  // Canine Mortality & Post-Mortem Records
  const [mortalities, setMortalities] = useState<CanineMortalityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_canine_mortality');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_canine_mortality', JSON.stringify(mortalities));
    } catch (e) {
      console.error('Failed to save mortalities', e);
    }
  }, [mortalities]);

  // Modals state
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [editingDog, setEditingDog] = useState<DogProfile | null>(null);
  const [selectedDogDossier, setSelectedDogDossier] = useState<DogProfile | null>(null);
  const [showAddVaxModal, setShowAddVaxModal] = useState(false);
  const [preselectedVaxDogId, setPreselectedVaxDogId] = useState<string>('');
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [preselectedTxDogId, setPreselectedTxDogId] = useState<string>('');
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showAddMortalityModal, setShowAddMortalityModal] = useState(false);

  // Add / Edit Dog Form State
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('German Shepherd (GSD)');
  const [dogGender, setDogGender] = useState<'Male' | 'Female' | 'Neutered Male' | 'Spayed Female'>('Male');
  const [dogDob, setDogDob] = useState(() => offsetIsoDate(-365));
  const [dogChip, setDogChip] = useState('');
  const [dogKennel, setDogKennel] = useState('Kennel A-01');
  const [dogRole, setDogRole] = useState<'Perimeter Patrol' | 'Main Gate Security' | 'Night Watch' | 'Livestock Guardian' | 'Compound Guard' | 'Breeding Stock' | 'Puppy in Training'>('Perimeter Patrol');
  const [dogStatus, setDogStatus] = useState<'Active Duty' | 'In Training' | 'Medical Rest' | 'Off Duty' | 'Sold' | 'Deceased'>('Active Duty');
  const [dogHandler, setDogHandler] = useState('');
  const [dogSire, setDogSire] = useState('');
  const [dogDam, setDogDam] = useState('');
  const [dogMarkings, setDogMarkings] = useState('');
  const [dogNotes, setDogNotes] = useState('');

  // Add Vaccination Form State
  const [vaxDogId, setVaxDogId] = useState('');
  const [vaxType, setVaxType] = useState<'Rabies' | 'DHLPP 5-in-1' | 'Deworming' | 'Flea & Tick Prevention' | 'Parvovirus Booster' | 'Kennel Cough (Bordetella)' | 'Other'>('Rabies');
  const [vaxDate, setVaxDate] = useState(todayStr);
  const [vaxNextDue, setVaxNextDue] = useState(() => offsetIsoDate(365));
  const [vaxBatch, setVaxBatch] = useState('');
  const [vaxAdminBy, setVaxAdminBy] = useState('Dr. Devin Omwenga (DVM)');
  const [vaxCost, setVaxCost] = useState('');
  const [vaxNotes, setVaxNotes] = useState('');

  // Add Treatment Form State
  const [txDogId, setTxDogId] = useState('');
  const [txDate, setTxDate] = useState(todayStr);
  const [txDiagnosis, setTxDiagnosis] = useState('');
  const [txSymptoms, setTxSymptoms] = useState('');
  const [txMedication, setTxMedication] = useState('');
  const [txTemp, setTxTemp] = useState('38.5');
  const [txWeight, setTxWeight] = useState('35.0');
  const [txVet, setTxVet] = useState('Dr. Devin Omwenga (DVM)');
  const [txCost, setTxCost] = useState('');
  const [txStatus, setTxStatus] = useState<'Recovered' | 'Under Treatment' | 'Critical' | 'Scheduled Follow-up'>('Recovered');
  const [txNextFollowUp, setTxNextFollowUp] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Add Sale Form State
  const [saleDogId, setSaleDogId] = useState('');
  const [saleDogName, setSaleDogName] = useState('');
  const [saleBreed, setSaleBreed] = useState('German Shepherd (GSD)');
  const [saleDate, setSaleDate] = useState(todayStr);
  const [saleBuyer, setSaleBuyer] = useState('');
  const [salePhone, setSalePhone] = useState('');
  const [saleLocation, setSaleLocation] = useState('');
  const [saleAmount, setSaleAmount] = useState('75000');
  const [salePaymentMethod, setSalePaymentMethod] = useState<'Cash' | 'M-Pesa' | 'Bank Transfer'>('M-Pesa');
  const [saleReceipt, setSaleReceipt] = useState('');
  const [salePurpose, setSalePurpose] = useState<'Security Guard Dog' | 'Trained Family Pet' | 'Breeding' | 'Working Livestock Guardian'>('Security Guard Dog');
  const [saleAutoFinance, setSaleAutoFinance] = useState(true);
  const [saleNotes, setSaleNotes] = useState('');

  // Add Mortality Form State
  const [mortDogId, setMortDogId] = useState('');
  const [mortDogName, setMortDogName] = useState('');
  const [mortBreed, setMortBreed] = useState('');
  const [mortDate, setMortDate] = useState(todayStr);
  const [mortCause, setMortCause] = useState('Acute Illness');
  const [mortFindings, setMortFindings] = useState('');
  const [mortVet, setMortVet] = useState('Dr. Devin Omwenga (DVM)');
  const [mortDisposal, setMortDisposal] = useState<'Estate Burial' | 'Incineration' | 'Sanitary Disposal'>('Estate Burial');
  const [mortBiosecurity, setMortBiosecurity] = useState('Kennel bleached with Virkon S, quarantine perimeter observed');
  const [mortNotes, setMortNotes] = useState('');

  // Security Handlers from staffList
  const securityStaff = useMemo(() => {
    return staffList.filter((s) => s.unit === 'Security' || s.role?.toLowerCase()?.includes('guard') || s.role?.toLowerCase()?.includes('security'));
  }, [staffList]);

  // =========================================================================
  // VACCINE EXPIRY & OVERDUE HELPERS
  // =========================================================================
  const getVaccineStatus = (dogId: string) => {
    const dogVaxes = vaccinations.filter((v) => v.dogId === dogId);
    if (dogVaxes.length === 0) return { status: 'Unvaccinated', label: 'No vaccines logged', color: 'rose' };

    const overdue = dogVaxes.some((v) => v.nextDueDate < todayStr);
    if (overdue) return { status: 'Overdue', label: '⚠️ Vaccine / Booster Overdue', color: 'rose' };

    const dueSoon = dogVaxes.some((v) => v.nextDueDate >= todayStr && v.nextDueDate <= offsetIsoDate(14));
    if (dueSoon) return { status: 'DueSoon', label: '🔔 Booster Due Within 14d', color: 'amber' };

    return { status: 'Current', label: '✓ All Vaccines Up-to-Date', color: 'emerald' };
  };

  // KPIs
  const totalDogsCount = dogs.length;
  const activeDutyCount = dogs.filter((d) => d.status === 'Active Duty').length;
  const trainingCount = dogs.filter((d) => d.status === 'In Training').length;
  const medicalRestCount = dogs.filter((d) => d.status === 'Medical Rest').length;
  const overdueVaxCount = dogs.filter((d) => getVaccineStatus(d.id).status === 'Overdue').length;

  // Filtered Dogs
  const filteredDogs = useMemo(() => {
    return dogs.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.chipId && d.chipId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.handlerName && d.handlerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchBreed = breedFilter === 'all' || d.breed === breedFilter;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchBreed && matchStatus;
    });
  }, [dogs, searchTerm, breedFilter, statusFilter]);

  // Auto-calculate next due date when vaccine type changes
  const handleVaxTypeChange = (type: any) => {
    setVaxType(type);
    if (type === 'Deworming') {
      setVaxNextDue(offsetIsoDate(90, new Date(vaxDate)));
    } else if (type === 'Flea & Tick Prevention') {
      setVaxNextDue(offsetIsoDate(30, new Date(vaxDate)));
    } else {
      setVaxNextDue(offsetIsoDate(365, new Date(vaxDate)));
    }
  };

  // =========================================================================
  // SUBMIT HANDLERS
  // =========================================================================
  const handleSaveDog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogName.trim()) {
      alert('Please enter canine official name.');
      return;
    }

    if (editingDog) {
      setDogs(
        dogs.map((d) =>
          d.id === editingDog.id
            ? {
                ...d,
                name: dogName.trim(),
                breed: dogBreed,
                gender: dogGender,
                dob: dogDob,
                chipId: dogChip.trim() || undefined,
                kennelNo: dogKennel.trim() || undefined,
                dutyRole: dogRole,
                status: dogStatus,
                handlerName: dogHandler.trim() || undefined,
                sire: dogSire.trim() || undefined,
                dam: dogDam.trim() || undefined,
                colorMarkings: dogMarkings.trim() || undefined,
                notes: dogNotes.trim() || undefined
              }
            : d
        )
      );
      setEditingDog(null);
      alert(`✓ Updated profile for ${dogName.trim()} successfully!`);
    } else {
      const newDog: DogProfile = {
        id: `k9-${Date.now()}`,
        name: dogName.trim(),
        breed: dogBreed,
        gender: dogGender,
        dob: dogDob,
        chipId: dogChip.trim() || `K9-JR-${Math.floor(1000 + Math.random() * 9000)}`,
        kennelNo: dogKennel.trim() || 'Kennel A-01',
        dutyRole: dogRole,
        status: dogStatus,
        handlerName: dogHandler.trim() || undefined,
        sire: dogSire.trim() || undefined,
        dam: dogDam.trim() || undefined,
        colorMarkings: dogMarkings.trim() || undefined,
        acquisitionDate: todayStr,
        notes: dogNotes.trim() || undefined
      };
      setDogs([newDog, ...dogs]);

      // Sync with generic livestock records if needed
      if (onAddLivestock) {
        onAddLivestock({
          type: 'Dogs',
          name: newDog.name,
          countOrBreed: newDog.breed,
          activity: `Registered into Canine Unit (${newDog.dutyRole})`,
          notes: newDog.notes || 'Official security guard dog record',
          date: todayStr
        });
      }

      setShowAddDogModal(false);
      resetDogForm();
      alert(`✓ Registered K-9 officer ${newDog.name} into JR Farm Security Unit!`);
    }
  };

  const resetDogForm = () => {
    setDogName('');
    setDogBreed('German Shepherd (GSD)');
    setDogGender('Male');
    setDogDob(offsetIsoDate(-365));
    setDogChip('');
    setDogKennel('Kennel A-01');
    setDogRole('Perimeter Patrol');
    setDogStatus('Active Duty');
    setDogHandler('');
    setDogSire('');
    setDogDam('');
    setDogMarkings('');
    setDogNotes('');
  };

  const handleOpenEditDog = (dog: DogProfile) => {
    setEditingDog(dog);
    setDogName(dog.name);
    setDogBreed(dog.breed);
    setDogGender(dog.gender);
    setDogDob(dog.dob);
    setDogChip(dog.chipId || '');
    setDogKennel(dog.kennelNo || '');
    setDogRole(dog.dutyRole);
    setDogStatus(dog.status);
    setDogHandler(dog.handlerName || '');
    setDogSire(dog.sire || '');
    setDogDam(dog.dam || '');
    setDogMarkings(dog.colorMarkings || '');
    setDogNotes(dog.notes || '');
  };

  // Submit Vaccination
  const handleSaveVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDog = dogs.find((d) => d.id === vaxDogId) || dogs[0];
    if (!targetDog) {
      alert('Please register a dog first.');
      return;
    }

    const newVax: CanineVaccinationRecord = {
      id: `vax-${Date.now()}`,
      dogId: targetDog.id,
      dogName: targetDog.name,
      vaccineType: vaxType,
      dateAdministered: vaxDate,
      nextDueDate: vaxNextDue,
      batchNo: vaxBatch.trim() || undefined,
      administeredBy: vaxAdminBy.trim() || 'Dr. Devin Omwenga (DVM)',
      cost: vaxCost ? Number(vaxCost) : undefined,
      notes: vaxNotes.trim() || 'Standard preventive veterinary immunization'
    };

    setVaccinations([newVax, ...vaccinations]);
    setShowAddVaxModal(false);
    setVaxNotes('');
    setVaxBatch('');
    setVaxCost('');
    alert(`✓ Logged ${vaxType} for ${targetDog.name}. Next booster scheduled for ${vaxNextDue}.`);
  };

  // Submit Treatment
  const handleSaveTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDog = dogs.find((d) => d.id === txDogId) || dogs[0];
    if (!targetDog || !txDiagnosis.trim()) {
      alert('Please enter clinical diagnosis.');
      return;
    }

    const newTx: CanineTreatmentRecord = {
      id: `tx-${Date.now()}`,
      dogId: targetDog.id,
      dogName: targetDog.name,
      date: txDate,
      diagnosis: txDiagnosis.trim(),
      symptoms: txSymptoms.trim() || undefined,
      treatmentAdministered: txMedication.trim() || 'Veterinary care administered',
      temperature: txTemp ? Number(txTemp) : undefined,
      weightKg: txWeight ? Number(txWeight) : undefined,
      attendingVet: txVet.trim() || 'Dr. Devin Omwenga (DVM)',
      cost: txCost ? Number(txCost) : undefined,
      status: txStatus,
      nextFollowUpDate: txNextFollowUp || undefined,
      notes: txNotes.trim() || undefined
    };

    setTreatments([newTx, ...treatments]);

    // If critical or under treatment, set dog status to Medical Rest
    if (txStatus === 'Under Treatment' || txStatus === 'Critical') {
      setDogs(dogs.map((d) => (d.id === targetDog.id ? { ...d, status: 'Medical Rest' } : d)));
    } else if (txStatus === 'Recovered' && targetDog.status === 'Medical Rest') {
      setDogs(dogs.map((d) => (d.id === targetDog.id ? { ...d, status: 'Active Duty' } : d)));
    }

    setShowAddTxModal(false);
    setTxDiagnosis('');
    setTxSymptoms('');
    setTxMedication('');
    setTxNotes('');
    setTxCost('');
    alert(`✓ Veterinary clinical treatment recorded for ${targetDog.name}!`);
  };

  // Submit Sale
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDog = dogs.find((d) => d.id === saleDogId);
    const finalDogName = targetDog ? targetDog.name : saleDogName.trim();
    if (!finalDogName || !saleBuyer.trim() || !saleAmount) {
      alert('Please provide dog name, buyer details, and amount.');
      return;
    }

    const amountNum = Number(saleAmount);
    const newSale: CanineSaleRecord = {
      id: `sale-${Date.now()}`,
      dogId: targetDog ? targetDog.id : undefined,
      dogName: finalDogName,
      breed: targetDog ? targetDog.breed : saleBreed,
      saleDate: saleDate,
      buyerName: saleBuyer.trim(),
      buyerPhone: salePhone.trim(),
      buyerLocation: saleLocation.trim() || undefined,
      amount: amountNum,
      paymentMethod: salePaymentMethod,
      receiptNumber: saleReceipt.trim() || `K9-REC-${Date.now().toString().slice(-5)}`,
      purpose: salePurpose,
      notes: saleNotes.trim() || undefined
    };

    setSales([newSale, ...sales]);

    // Mark dog as Sold if matched
    if (targetDog) {
      setDogs(dogs.map((d) => (d.id === targetDog.id ? { ...d, status: 'Sold' } : d)));
    }

    // Auto-record revenue in farm financials
    if (saleAutoFinance && setFinancials) {
      const finTx = {
        id: `fin-k9-${Date.now()}`,
        date: saleDate,
        type: 'Income',
        category: 'Canine Sales',
        amount: amountNum,
        description: `Sale of K-9 ${finalDogName} (${newSale.breed}) to ${saleBuyer.trim()} [Receipt: ${newSale.receiptNumber}]`
      };
      setFinancials((prev: any[]) => [finTx, ...prev]);
    }

    setShowAddSaleModal(false);
    setSaleBuyer('');
    setSalePhone('');
    setSaleNotes('');
    alert(`✓ Canine sale successfully registered! KES ${amountNum.toLocaleString()} logged in Farm Ledger.`);
  };

  // Submit Mortality
  const handleSaveMortality = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDog = dogs.find((d) => d.id === mortDogId);
    const finalName = targetDog ? targetDog.name : mortDogName.trim();
    if (!finalName || !mortCause.trim()) {
      alert('Please provide dog name and cause of loss.');
      return;
    }

    const newMort: CanineMortalityRecord = {
      id: `mort-${Date.now()}`,
      dogId: targetDog ? targetDog.id : undefined,
      dogName: finalName,
      breed: targetDog ? targetDog.breed : mortBreed || 'Canine',
      dateOfDeath: mortDate,
      causeOfDeath: mortCause.trim(),
      veterinaryFindings: mortFindings.trim() || undefined,
      attendingVet: mortVet.trim() || 'Dr. Devin Omwenga (DVM)',
      disposalMethod: mortDisposal,
      biosecurityPrecautions: mortBiosecurity.trim() || undefined,
      notes: mortNotes.trim() || undefined
    };

    setMortalities([newMort, ...mortalities]);

    // Update dog status to Deceased
    if (targetDog) {
      setDogs(dogs.map((d) => (d.id === targetDog.id ? { ...d, status: 'Deceased' } : d)));
    }

    setShowAddMortalityModal(false);
    setMortCause('');
    setMortFindings('');
    setMortNotes('');
    alert(`✓ Logged mortality record for ${finalName}. Archive preserved for veterinary audit.`);
  };

  // =========================================================================
  // PDF REPORT GENERATOR: VETERINARY HEALTH PASSPORT & CENSUS AUDIT
  // =========================================================================
  const generateDogPassportPdf = (targetDog: DogProfile) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // Header Bar
    doc.setFillColor(6, 78, 59); // emerald-900
    doc.rect(margin, y, contentWidth, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('JR FARM', margin + 6, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(167, 243, 208); // emerald-200
    doc.text('OFFICIAL K-9 CANINE VETERINARY HEALTH PASSPORT & PEDIGREE DOSSIER', margin + 6, y + 18);

    y += 33;

    // SECTION A: CANINE CREDENTIALS
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`1. CANINE IDENTIFICATION & CREDENTIALS — ${targetDog.name.toUpperCase()}`, margin, y);
    y += 5;

    // Details Grid Table
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 34, 'F');
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(8.5);

    const leftCol = margin + 4;
    const midCol = margin + 95;

    doc.setFont('helvetica', 'bold');
    doc.text('Official K-9 Name:', leftCol, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.name, leftCol + 35, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Breed / Phenotype:', midCol, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.breed, midCol + 35, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Microchip / Tag ID:', leftCol, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.chipId || 'N/A', leftCol + 35, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Date of Birth / Age:', midCol, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.dob, midCol + 35, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Gender / Sex:', leftCol, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.gender, leftCol + 35, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.text('Duty Role / Station:', midCol, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.text(`${targetDog.dutyRole} (${targetDog.kennelNo || 'Kennel'})`, midCol + 35, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.text('Assigned Handler:', leftCol, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.handlerName || 'Estate Security Unit', leftCol + 35, y + 28);

    doc.setFont('helvetica', 'bold');
    doc.text('Current Duty Status:', midCol, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(targetDog.status, midCol + 35, y + 28);

    y += 42;

    // SECTION B: VACCINATION & DEWORMING TIMELINE
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. VACCINATION & DEWORMING IMMUNIZATION LEDGER', margin, y);
    y += 5;

    const dogVaxes = vaccinations.filter((v) => v.dogId === targetDog.id);

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('VACCINE / PROTOCOL', margin + 3, y + 5);
    doc.text('DATE ADMINISTERED', margin + 55, y + 5);
    doc.text('NEXT BOOSTER DUE', margin + 95, y + 5);
    doc.text('BATCH #', margin + 135, y + 5);
    doc.text('ADMINISTERED BY', margin + 160, y + 5);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    if (dogVaxes.length === 0) {
      doc.setTextColor(156, 163, 175);
      doc.text('No vaccinations logged yet for this canine.', margin + 3, y + 5);
      y += 8;
    } else {
      dogVaxes.forEach((v) => {
        doc.setTextColor(17, 24, 39);
        doc.text(v.vaccineType, margin + 3, y + 4.5);
        doc.text(v.dateAdministered, margin + 55, y + 4.5);

        // Highlight overdue
        const isOverdue = v.nextDueDate < todayStr;
        doc.setTextColor(isOverdue ? 185 : 6, isOverdue ? 28 : 78, isOverdue ? 28 : 59);
        doc.text(`${v.nextDueDate} ${isOverdue ? '(!)' : ''}`, margin + 95, y + 4.5);

        doc.setTextColor(107, 114, 128);
        doc.text(v.batchNo || '-', margin + 135, y + 4.5);
        doc.text(v.administeredBy, margin + 160, y + 4.5);

        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
        y += 7.5;
      });
    }

    y += 8;

    // SECTION C: CLINICAL & MEDICAL TREATMENTS
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. VETERINARY CLINICAL EXAMS & TREATMENT RECORDS', margin, y);
    y += 5;

    const dogTxs = treatments.filter((t) => t.dogId === targetDog.id);

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('DATE', margin + 3, y + 5);
    doc.text('CLINICAL DIAGNOSIS', margin + 28, y + 5);
    doc.text('TREATMENT / ACTIVE COMPOUND', margin + 85, y + 5);
    doc.text('TEMP / WT', margin + 145, y + 5);
    doc.text('STATUS', margin + 170, y + 5);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    if (dogTxs.length === 0) {
      doc.setTextColor(156, 163, 175);
      doc.text('Clean medical history: No clinical veterinary interventions on record.', margin + 3, y + 5);
      y += 8;
    } else {
      dogTxs.forEach((t) => {
        doc.setTextColor(17, 24, 39);
        doc.text(t.date, margin + 3, y + 4.5);
        doc.text(t.diagnosis.substring(0, 32), margin + 28, y + 4.5);
        doc.text(t.treatmentAdministered.substring(0, 34), margin + 85, y + 4.5);
        doc.text(`${t.temperature ? `${t.temperature}°C` : '-'} / ${t.weightKg ? `${t.weightKg}k` : '-'}`, margin + 145, y + 4.5);
        doc.text(t.status, margin + 170, y + 4.5);

        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
        y += 7.5;
      });
    }

    y += 15;

    // SECTION D: OFFICIAL APPROVAL & VET SIGN-OFF
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.rect(margin, y, contentWidth, 22, 'D');

    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Official JR Farm K-9 Security & Veterinary Health Record • Generated on ${new Date().toLocaleString()}`,
      margin + 6,
      y + 15
    );

    // Save PDF
    doc.save(`JR_Farm_Canine_Passport_${targetDog.name}.pdf`);
  };

  // Full Census PDF
  const generateFullCanineCensusPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // Header Bar
    doc.setFillColor(6, 78, 59);
    doc.rect(margin, y, contentWidth, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('JR FARM', margin + 6, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(167, 243, 208);
    doc.text(`SECURITY CANINE UNIT CENSUS & VETERINARY AUDIT REPORT • DATE: ${todayStr}`, margin + 6, y + 18);

    y += 34;

    // KPIs Row
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(
      `CENSUS SUMMARY: Total Pack: ${totalDogsCount} | Active Duty: ${activeDutyCount} | In Training: ${trainingCount} | Medical Rest: ${medicalRestCount}`,
      margin,
      y
    );
    y += 8;

    // Table 1: Roster
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('K-9 NAME', margin + 3, y + 5);
    doc.text('BREED', margin + 35, y + 5);
    doc.text('CHIP ID / KENNEL', margin + 75, y + 5);
    doc.text('DUTY ROLE', margin + 115, y + 5);
    doc.text('HANDLER', margin + 150, y + 5);
    doc.text('STATUS', margin + 175, y + 5);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    dogs.forEach((d) => {
      doc.setTextColor(17, 24, 39);
      doc.text(d.name, margin + 3, y + 4.5);
      doc.text(d.breed.substring(0, 20), margin + 35, y + 4.5);
      doc.text(`${d.chipId || '-'} (${d.kennelNo || '-'})`, margin + 75, y + 4.5);
      doc.text(d.dutyRole.substring(0, 18), margin + 115, y + 4.5);
      doc.text((d.handlerName || 'Security').substring(0, 14), margin + 150, y + 4.5);
      doc.text(d.status, margin + 175, y + 4.5);

      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
      y += 7.5;
    });

    y += 10;

    // Table 2: Sales Summary
    if (sales.length > 0) {
      doc.setTextColor(6, 78, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`CANINE SALES & PLACEMENT LOGS (${sales.length} transactions)`, margin, y);
      y += 5;

      doc.setFillColor(243, 244, 246);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setTextColor(55, 65, 81);
      doc.setFontSize(7.5);
      doc.text('DATE', margin + 3, y + 5);
      doc.text('DOG NAME & BREED', margin + 28, y + 5);
      doc.text('BUYER', margin + 80, y + 5);
      doc.text('AMOUNT (KES)', margin + 130, y + 5);
      doc.text('RECEIPT #', margin + 165, y + 5);
      y += 8;

      doc.setFont('helvetica', 'normal');
      sales.forEach((s) => {
        doc.setTextColor(17, 24, 39);
        doc.text(s.saleDate, margin + 3, y + 4.5);
        doc.text(`${s.dogName} (${s.breed})`.substring(0, 28), margin + 28, y + 4.5);
        doc.text(s.buyerName.substring(0, 24), margin + 80, y + 4.5);
        doc.text(`KES ${s.amount.toLocaleString()}`, margin + 130, y + 4.5);
        doc.text(s.receiptNumber || '-', margin + 165, y + 4.5);
        y += 7;
      });
      y += 8;
    }

    // Sign off
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, y, contentWidth, 20, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', margin + 6, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Official JR Farm Security Canine Census • Printed on ${new Date().toLocaleString()}`, margin + 6, y + 14);

    doc.save(`JR_Farm_Canine_Census_${todayStr}.pdf`);
  };

  // WhatsApp Share
  const handleShareSummary = () => {
    const text = `*🐕 JR FARM — SECURITY CANINE UNIT AUDIT SUMMARY*
📅 Date: ${todayStr}

• Total Guard Dogs: ${totalDogsCount}
• Active Duty: ${activeDutyCount}
• In Training: ${trainingCount}
• Medical Rest: ${medicalRestCount}
• Vaccine Overdue Alerts: ${overdueVaxCount}

📋 Guard Dogs Roster:
${dogs.map((d) => `• ${d.name} (${d.breed}) — ${d.dutyRole} [${d.status}]`).join('\n')}

Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Unique breeds
  const breedOptions = useMemo(() => {
    return Array.from(new Set(dogs.map((d) => d.breed)));
  }, [dogs]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* TOP BANNER & ACTION BAR                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
              <Shield size={26} className="text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                JR FARM SECURITY SQUAD
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
                K-9 Security Canines &amp; Guard Dog Management
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-2xl font-medium">
            Registry, clinical treatment records, mandatory Rabies &amp; DHLPP vaccine timelines, guard dog sales, and mortality audit archives.
          </p>
          <p className="text-[11px] text-emerald-800 font-bold mt-1">
            Presented &amp; Approved by: Dr. Devin Omwenga (General Farm Manager)
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={generateFullCanineCensusPdf}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer transition-all hover:scale-102"
            title="Download Full Unit PDF Census"
          >
            <Download size={14} />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={handleShareSummary}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            title="Share summary via WhatsApp"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            onClick={() => {
              resetDogForm();
              setEditingDog(null);
              setShowAddDogModal(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer transition-colors"
          >
            <Plus size={14} />
            <span>Register Dog</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI METRIC CARDS                                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Total Pack</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{totalDogsCount}</span>
            <span className="text-xs font-semibold text-emerald-700">Officers</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">Active Duty</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-800">{activeDutyCount}</span>
            <span className="text-xs font-semibold text-gray-400">Patrols</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">In Training</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-800">{trainingCount}</span>
            <span className="text-xs font-semibold text-gray-400">Pups / Recruits</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">Medical Care</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-800">{medicalRestCount}</span>
            <span className="text-xs font-semibold text-gray-400">Resting</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">Vaccine Alerts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{overdueVaxCount}</span>
            <span className="text-xs font-semibold text-rose-600">{overdueVaxCount > 0 ? 'Action Needed' : 'All Clear'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TABS NAVIGATION                                                       */}
      {/* ========================================================================= */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto gap-1">
        <button
          onClick={() => setSubTab('registry')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            subTab === 'registry' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield size={14} className={subTab === 'registry' ? 'text-emerald-600' : ''} />
          <span>1. K-9 Dog Registry</span>
          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full font-mono">{dogs.length}</span>
        </button>

        <button
          onClick={() => setSubTab('vaccines')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            subTab === 'vaccines' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Syringe size={14} className={subTab === 'vaccines' ? 'text-emerald-600' : ''} />
          <span>2. Vaccination &amp; Deworming</span>
          {overdueVaxCount > 0 && (
            <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {overdueVaxCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('treatments')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            subTab === 'treatments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Stethoscope size={14} className={subTab === 'treatments' ? 'text-emerald-600' : ''} />
          <span>3. Clinical Treatments</span>
          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full font-mono">{treatments.length}</span>
        </button>

        <button
          onClick={() => setSubTab('sales')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            subTab === 'sales' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DollarSign size={14} className={subTab === 'sales' ? 'text-emerald-600' : ''} />
          <span>4. Canine Sales &amp; Placements</span>
          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full font-mono">{sales.length}</span>
        </button>

        <button
          onClick={() => setSubTab('mortality')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            subTab === 'mortality' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart size={14} className={subTab === 'mortality' ? 'text-rose-600' : ''} />
          <span>5. Mortality &amp; Post-Mortem</span>
          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full font-mono">{mortalities.length}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: DOG REGISTRY                                                   */}
      {/* ========================================================================= */}
      {subTab === 'registry' && (
        <div className="space-y-6">
          {/* Search, Filter & Layout Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dog name, breed, chip ID, handler..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <select
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-white font-semibold text-gray-700"
              >
                <option value="all">All Breeds</option>
                {breedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-white font-semibold text-gray-700"
              >
                <option value="all">All Duty Statuses</option>
                <option value="Active Duty">Active Duty</option>
                <option value="In Training">In Training</option>
                <option value="Medical Rest">Medical Rest</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Sold">Sold</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Cards View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Table View"
              >
                <Table size={15} />
              </button>
            </div>
          </div>

          {/* Dogs Cards View */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDogs.map((d) => {
                const vaxStat = getVaccineStatus(d.id);
                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-3xl border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-lg shadow-inner">
                            🐾
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {d.dutyRole}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  d.status === 'Active Duty'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : d.status === 'In Training'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : d.status === 'Medical Rest'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {d.status}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 leading-tight">{d.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">{d.breed}</p>
                          </div>
                        </div>
                      </div>

                      {/* Credentials */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block font-sans">Chip / Tag</span>
                          <strong className="text-gray-900">{d.chipId || 'Not chipped'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block font-sans">Kennel</span>
                          <strong className="text-gray-900">{d.kennelNo || 'General'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block font-sans">Gender</span>
                          <strong className="text-gray-900">{d.gender}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block font-sans">DOB / Age</span>
                          <strong className="text-gray-900">{d.dob}</strong>
                        </div>
                      </div>

                      {/* Handler & Health status */}
                      <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <UserCheck size={13} className="text-emerald-700" />
                          <span>Handler: <strong className="text-gray-800">{d.handlerName || 'Security'}</strong></span>
                        </div>
                      </div>

                      {/* Vaccine Badge */}
                      <div className="mt-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg block text-center border ${
                            vaxStat.color === 'emerald'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : vaxStat.color === 'amber'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {vaxStat.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-white flex items-center justify-between gap-1 text-xs">
                      <button
                        onClick={() => setSelectedDogDossier(d)}
                        className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Dossier</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => generateDogPassportPdf(d)}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg cursor-pointer"
                          title="Generate Official Vet Health Passport PDF"
                        >
                          <FileText size={14} />
                        </button>

                        <button
                          onClick={() => {
                            setPreselectedVaxDogId(d.id);
                            setVaxDogId(d.id);
                            setShowAddVaxModal(true);
                          }}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Log Vaccine / Deworming"
                        >
                          <Syringe size={14} />
                        </button>

                        <button
                          onClick={() => {
                            setPreselectedTxDogId(d.id);
                            setTxDogId(d.id);
                            setShowAddTxModal(true);
                          }}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                          title="Log Veterinary Clinical Exam"
                        >
                          <Stethoscope size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenEditDog(d)}
                          className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${d.name} from the canine registry?`)) {
                              setDogs(dogs.filter((x) => x.id !== d.id));
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Canine"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">K-9 Officer</th>
                      <th className="p-4">Breed &amp; Gender</th>
                      <th className="p-4">Chip &amp; Kennel</th>
                      <th className="p-4">Duty &amp; Handler</th>
                      <th className="p-4">Vaccine Standing</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredDogs.map((d) => {
                      const vax = getVaccineStatus(d.id);
                      return (
                        <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900 text-sm">{d.name}</div>
                            <div className="text-[10px] text-gray-400">DOB: {d.dob}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-800">{d.breed}</div>
                            <div className="text-[10px] text-gray-500">{d.gender}</div>
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            <div>{d.chipId || '-'}</div>
                            <div className="text-[10px] text-emerald-800 font-bold">{d.kennelNo || '-'}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                              {d.dutyRole}
                            </span>
                            <div className="text-[10px] text-gray-500 mt-1">{d.handlerName || 'Security'}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                                vax.color === 'emerald'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : vax.color === 'amber'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {vax.label}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                              {d.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedDogDossier(d)}
                                className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                title="View Dossier"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => generateDogPassportPdf(d)}
                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                                title="Passport PDF"
                              >
                                <FileText size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenEditDog(d)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete ${d.name}?`)) setDogs(dogs.filter((x) => x.id !== d.id));
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: VACCINATION & DEWORMING HUB                                     */}
      {/* ========================================================================= */}
      {subTab === 'vaccines' && (
        <div className="space-y-6">
          {/* Protocol Guide */}
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Syringe size={18} className="text-emerald-600" />
                  JR Farm Canine Immunization &amp; Parasite Control Schedule
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mandatory biosecurity protocol enforced by Dr. Devin Omwenga (General Farm Manager / DVM).
                </p>
              </div>
              <button
                onClick={() => {
                  setVaxDogId(dogs[0]?.id || '');
                  setShowAddVaxModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>+ Record Vaccine / Deworming</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2 border-t border-gray-100">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <strong className="text-emerald-900 block font-bold text-xs">💉 Rabies Vaccine</strong>
                <p className="text-emerald-800 text-[11px] mt-1">Annual mandatory booster. Crucial for farm staff &amp; visitor safety.</p>
                <span className="text-[10px] text-emerald-700 font-mono mt-2 block">Interval: Every 12 Months</span>
              </div>

              <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-2xl">
                <strong className="text-sky-900 block font-bold text-xs">🛡️ DHLPP 5-in-1 Booster</strong>
                <p className="text-sky-800 text-[11px] mt-1">Distemper, Hepatitis, Leptospirosis, Parvovirus, Parainfluenza.</p>
                <span className="text-[10px] text-sky-700 font-mono mt-2 block">Interval: Every 12 Months</span>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl">
                <strong className="text-amber-900 block font-bold text-xs">💊 Broad-Spectrum Deworming</strong>
                <p className="text-amber-800 text-[11px] mt-1">Praziquantel / Fenbendazole compounds to prevent internal parasites.</p>
                <span className="text-[10px] text-amber-700 font-mono mt-2 block">Interval: Every 3 Months</span>
              </div>

              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                <strong className="text-indigo-900 block font-bold text-xs">🪲 Flea &amp; Tick Prevention</strong>
                <p className="text-indigo-800 text-[11px] mt-1">Spot-on topical fipronil or Bravecto chewables to guard against tick fever.</p>
                <span className="text-[10px] text-indigo-700 font-mono mt-2 block">Interval: Monthly / Quarterly</span>
              </div>
            </div>
          </div>

          {/* Vaccination Ledger Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-sm text-gray-900">Official Immunization Ledger</h4>
              <span className="text-xs text-gray-500 font-mono">{vaccinations.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">K-9 Officer</th>
                    <th className="p-4">Vaccine / Protocol</th>
                    <th className="p-4">Administered Date</th>
                    <th className="p-4">Next Booster Due</th>
                    <th className="p-4">Batch # &amp; Cost</th>
                    <th className="p-4">Attending DVM</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {vaccinations.map((v) => {
                    const isOverdue = v.nextDueDate < todayStr;
                    const isDueSoon = !isOverdue && v.nextDueDate <= offsetIsoDate(14);
                    return (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{v.dogName}</td>
                        <td className="p-4">
                          <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                            {v.vaccineType}
                          </span>
                          {v.notes && <div className="text-[10px] text-gray-400 mt-1 max-w-xs truncate">{v.notes}</div>}
                        </td>
                        <td className="p-4 font-mono text-gray-700">{v.dateAdministered}</td>
                        <td className="p-4 font-mono">
                          <strong className={isOverdue ? 'text-rose-700 font-bold' : isDueSoon ? 'text-amber-700 font-bold' : 'text-emerald-800'}>
                            {v.nextDueDate}
                          </strong>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div>{v.batchNo || '-'}</div>
                          {v.cost && <div className="text-gray-400">KES {v.cost.toLocaleString()}</div>}
                        </td>
                        <td className="p-4 text-gray-700">{v.administeredBy}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isDueSoon
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isOverdue ? '⚠️ Overdue' : isDueSoon ? 'Due Soon' : 'Valid'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this vaccination log?')) {
                                setVaccinations(vaccinations.filter((x) => x.id !== v.id));
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
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

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CLINICAL TREATMENTS                                            */}
      {/* ========================================================================= */}
      {subTab === 'treatments' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope size={18} className="text-emerald-600" />
                Veterinary Clinical Diagnostics &amp; Treatments
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Exams, wound management, illness diagnosis, and prescription medications supervised by Dr. Devin Omwenga.
              </p>
            </div>
            <button
              onClick={() => {
                setTxDogId(dogs[0]?.id || '');
                setShowAddTxModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>+ Record Clinical Exam</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-sm text-gray-900">Treatment &amp; Physical Examination Logs</h4>
              <span className="text-xs text-gray-500 font-mono">{treatments.length} cases</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">K-9 Patient</th>
                    <th className="p-4">Clinical Diagnosis</th>
                    <th className="p-4">Treatment Administered</th>
                    <th className="p-4">Temp / Wt</th>
                    <th className="p-4">Attending Vet</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {treatments.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-mono text-gray-700">{t.date}</td>
                      <td className="p-4 font-bold text-gray-900">{t.dogName}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{t.diagnosis}</div>
                        {t.symptoms && <div className="text-[10px] text-gray-500 mt-0.5">Symptoms: {t.symptoms}</div>}
                      </td>
                      <td className="p-4 text-gray-700 max-w-xs">{t.treatmentAdministered}</td>
                      <td className="p-4 font-mono text-[11px]">
                        <div>{t.temperature ? `${t.temperature}°C` : '-'}</div>
                        <div className="text-gray-500">{t.weightKg ? `${t.weightKg} kg` : '-'}</div>
                      </td>
                      <td className="p-4 text-gray-700">{t.attendingVet}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            t.status === 'Recovered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : t.status === 'Under Treatment'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this treatment record?')) {
                              setTreatments(treatments.filter((x) => x.id !== t.id));
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
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

      {/* ========================================================================= */}
      {/* SUB-TAB 4: CANINE SALES & PLACEMENTS                                      */}
      {/* ========================================================================= */}
      {subTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                Trained Guard Dog &amp; Puppy Placements
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Log external security dog acquisitions, trained K-9 sales, and sync revenue directly with JR Farm accounts.
              </p>
            </div>
            <button
              onClick={() => {
                setSaleDogId(dogs[0]?.id || '');
                setShowAddSaleModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>+ Record Canine Sale / Placement</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-gray-900">Sales &amp; Revenue Ledger</h4>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                  Total Canine Sales Revenue: KES{' '}
                  {sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0).toLocaleString()}
                </p>
              </div>
              <span className="text-xs text-gray-500 font-mono">{sales.length} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Sale Date</th>
                    <th className="p-4">Canine &amp; Breed</th>
                    <th className="p-4">Buyer Particulars</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4 text-right">Amount (KES)</th>
                    <th className="p-4">Payment &amp; Receipt</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-mono text-gray-700">{s.saleDate}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{s.dogName}</div>
                        <div className="text-[10px] text-gray-500">{s.breed}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{s.buyerName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{s.buyerPhone}</div>
                        {s.buyerLocation && <div className="text-[10px] text-gray-400">{s.buyerLocation}</div>}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                          {s.purpose}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        KES {s.amount.toLocaleString()}
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        <div>{s.paymentMethod}</div>
                        <div className="text-gray-400 text-[10px]">{s.receiptNumber}</div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this canine sale transaction?')) {
                              setSales(sales.filter((x) => x.id !== s.id));
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
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

      {/* ========================================================================= */}
      {/* SUB-TAB 5: MORTALITY & POST-MORTEM                                        */}
      {/* ========================================================================= */}
      {subTab === 'mortality' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Heart size={18} className="text-rose-600" />
                Canine Mortality &amp; Post-Mortem Audit Archive
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Official records of canine deaths, post-mortem veterinary findings, and biosecurity disposal protocols.
              </p>
            </div>
            <button
              onClick={() => {
                setMortDogId(dogs[0]?.id || '');
                setShowAddMortalityModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>+ Record Canine Loss</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-sm text-gray-900">Post-Mortem &amp; Loss Archive</h4>
              <span className="text-xs text-gray-500 font-mono">{mortalities.length} cases</span>
            </div>
            {mortalities.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                ✓ No canine casualties or mortalities on record. All guard dogs healthy.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Date of Loss</th>
                      <th className="p-4">Canine &amp; Breed</th>
                      <th className="p-4">Cause of Death</th>
                      <th className="p-4">Post-Mortem Findings</th>
                      <th className="p-4">Disposal &amp; Biosecurity</th>
                      <th className="p-4">Attending DVM</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {mortalities.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono text-gray-700">{m.dateOfDeath}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{m.dogName}</div>
                          <div className="text-[10px] text-gray-500">{m.breed}</div>
                        </td>
                        <td className="p-4 font-bold text-rose-700">{m.causeOfDeath}</td>
                        <td className="p-4 max-w-xs text-gray-600">{m.veterinaryFindings || 'Post-mortem conducted'}</td>
                        <td className="p-4 text-gray-600">
                          <div className="font-semibold text-gray-800">{m.disposalMethod}</div>
                          {m.biosecurityPrecautions && <div className="text-[10px] text-gray-400">{m.biosecurityPrecautions}</div>}
                        </td>
                        <td className="p-4 text-gray-700">{m.attendingVet}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this mortality record?')) {
                                setMortalities(mortalities.filter((x) => x.id !== m.id));
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CANINE OFFICER PROFILE                                  */}
      {/* ========================================================================= */}
      {(showAddDogModal || editingDog) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-7 border border-gray-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingDog ? `Edit K-9 Profile — ${editingDog.name}` : 'Register New Security Canine Officer'}
                  </h3>
                  <p className="text-xs text-gray-500">JR Farm Guard Dog &amp; Pedigree Registry</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddDogModal(false);
                  setEditingDog(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Official Name *</label>
                  <input
                    type="text"
                    required
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    placeholder="e.g. Major or Rex"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Breed / Phenotype *</label>
                  <select
                    value={dogBreed}
                    onChange={(e) => setDogBreed(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="German Shepherd (GSD)">German Shepherd (GSD)</option>
                    <option value="Rottweiler">Rottweiler</option>
                    <option value="Belgian Malinois">Belgian Malinois</option>
                    <option value="Boerboel">South African Boerboel</option>
                    <option value="Doberman Pinscher">Doberman Pinscher</option>
                    <option value="Labrador Retriever">Labrador Retriever</option>
                    <option value="Cross-Breed Guard">Cross-Breed Guard</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Gender / Sex</label>
                  <select
                    value={dogGender}
                    onChange={(e) => setDogGender(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Male">Male (Intact)</option>
                    <option value="Neutered Male">Neutered Male</option>
                    <option value="Female">Female (Intact)</option>
                    <option value="Spayed Female">Spayed Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dogDob}
                    onChange={(e) => setDogDob(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Microchip / Collar Tag</label>
                  <input
                    type="text"
                    value={dogChip}
                    onChange={(e) => setDogChip(e.target.value)}
                    placeholder="e.g. K9-JR-8821"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Kennel / Housing Area</label>
                  <input
                    type="text"
                    value={dogKennel}
                    onChange={(e) => setDogKennel(e.target.value)}
                    placeholder="e.g. Kennel A-01"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Duty Status</label>
                  <select
                    value={dogStatus}
                    onChange={(e) => setDogStatus(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Active Duty">Active Duty</option>
                    <option value="In Training">In Training</option>
                    <option value="Medical Rest">Medical Rest</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Sold">Sold</option>
                    <option value="Deceased">Deceased</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Assigned Security Role</label>
                  <select
                    value={dogRole}
                    onChange={(e) => setDogRole(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Perimeter Patrol">Perimeter Patrol (Fences &amp; Boundaries)</option>
                    <option value="Main Gate Security">Main Gate Security (Access Control)</option>
                    <option value="Night Watch">Night Watch (Milking Sheds &amp; Stores)</option>
                    <option value="Livestock Guardian">Livestock Guardian (Predator Deterrence)</option>
                    <option value="Compound Guard">Compound Guard (Homestead)</option>
                    <option value="Breeding Stock">Breeding Stock</option>
                    <option value="Puppy in Training">Puppy in Training</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Primary Security Handler</label>
                  <input
                    type="text"
                    value={dogHandler}
                    onChange={(e) => setDogHandler(e.target.value)}
                    placeholder="e.g. Corporal Charles Ngetich"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Sire (Father)</label>
                  <input
                    type="text"
                    value={dogSire}
                    onChange={(e) => setDogSire(e.target.value)}
                    placeholder="e.g. Thor vom Haus"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Dam (Mother)</label>
                  <input
                    type="text"
                    value={dogDam}
                    onChange={(e) => setDogDam(e.target.value)}
                    placeholder="e.g. Bella von Alpha"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Color &amp; Markings</label>
                  <input
                    type="text"
                    value={dogMarkings}
                    onChange={(e) => setDogMarkings(e.target.value)}
                    placeholder="e.g. Black &amp; Tan Saddle"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Special Behavior &amp; Training Notes</label>
                <textarea
                  rows={2}
                  value={dogNotes}
                  onChange={(e) => setDogNotes(e.target.value)}
                  placeholder="e.g. Excellent bite grip, responds to Kiswahili commands, alert at night."
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDogModal(false);
                    setEditingDog(null);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"
                >
                  {editingDog ? 'Save Changes' : 'Save K-9 Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD VACCINATION / DEWORMING                                     */}
      {/* ========================================================================= */}
      {showAddVaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-7 border border-emerald-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Syringe size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Record Canine Vaccination &amp; Deworming</h3>
              </div>
              <button onClick={() => setShowAddVaxModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVaccination} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Target Canine *</label>
                  <select
                    value={vaxDogId}
                    onChange={(e) => setVaxDogId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                  >
                    {dogs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Vaccine / Protocol *</label>
                  <select
                    value={vaxType}
                    onChange={(e) => handleVaxTypeChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Rabies">Rabies (Annual)</option>
                    <option value="DHLPP 5-in-1">DHLPP 5-in-1 Multi-booster</option>
                    <option value="Deworming">Deworming (Quarterly)</option>
                    <option value="Flea & Tick Prevention">Flea &amp; Tick Prevention</option>
                    <option value="Parvovirus Booster">Parvovirus Booster</option>
                    <option value="Kennel Cough (Bordetella)">Kennel Cough (Bordetella)</option>
                    <option value="Other">Other Protocol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Administration Date</label>
                  <input
                    type="date"
                    value={vaxDate}
                    onChange={(e) => {
                      setVaxDate(e.target.value);
                      if (vaxType === 'Deworming') {
                        setVaxNextDue(offsetIsoDate(90, new Date(e.target.value)));
                      } else if (vaxType === 'Flea & Tick Prevention') {
                        setVaxNextDue(offsetIsoDate(30, new Date(e.target.value)));
                      } else {
                        setVaxNextDue(offsetIsoDate(365, new Date(e.target.value)));
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Next Booster Due Date *</label>
                  <input
                    type="date"
                    required
                    value={vaxNextDue}
                    onChange={(e) => setVaxNextDue(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-bold font-mono text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Batch / Serial #</label>
                  <input
                    type="text"
                    value={vaxBatch}
                    onChange={(e) => setVaxBatch(e.target.value)}
                    placeholder="e.g. RAB-2026-X8"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Cost (KES)</label>
                  <input
                    type="number"
                    value={vaxCost}
                    onChange={(e) => setVaxCost(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Attending Surgeon / DVM</label>
                <input
                  type="text"
                  value={vaxAdminBy}
                  onChange={(e) => setVaxAdminBy(e.target.value)}
                  placeholder="Dr. Devin Omwenga (DVM)"
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Observations / Notes</label>
                <input
                  type="text"
                  value={vaxNotes}
                  onChange={(e) => setVaxNotes(e.target.value)}
                  placeholder="e.g. No adverse reaction observed, healthy weight."
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddVaxModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Vaccination Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD CLINICAL EXAM & TREATMENT                                   */}
      {/* ========================================================================= */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-7 border border-emerald-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Record Veterinary Clinical Exam</h3>
              </div>
              <button onClick={() => setShowAddTxModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTreatment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Target Canine *</label>
                  <select
                    value={txDogId}
                    onChange={(e) => setTxDogId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                  >
                    {dogs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={txDiagnosis}
                  onChange={(e) => setTxDiagnosis(e.target.value)}
                  placeholder="e.g. Mild tick-fever symptoms / Foot pad abrasion"
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Symptoms Observed</label>
                <input
                  type="text"
                  value={txSymptoms}
                  onChange={(e) => setTxSymptoms(e.target.value)}
                  placeholder="e.g. Reduced appetite, elevated body temperature"
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Prescription &amp; Medication Administered *</label>
                <textarea
                  rows={2}
                  required
                  value={txMedication}
                  onChange={(e) => setTxMedication(e.target.value)}
                  placeholder="e.g. Doxycycline 100mg BID x 14 days, Multivitamin injection, antiseptic spray"
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Body Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={txTemp}
                    onChange={(e) => setTxTemp(e.target.value)}
                    placeholder="38.5"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Body Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={txWeight}
                    onChange={(e) => setTxWeight(e.target.value)}
                    placeholder="35.0"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Clinical Status</label>
                  <select
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Recovered">Recovered</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Critical">Critical</option>
                    <option value="Scheduled Follow-up">Scheduled Follow-up</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Attending Vet</label>
                  <input
                    type="text"
                    value={txVet}
                    onChange={(e) => setTxVet(e.target.value)}
                    placeholder="Dr. Devin Omwenga (DVM)"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Treatment Cost (KES)</label>
                  <input
                    type="number"
                    value={txCost}
                    onChange={(e) => setTxCost(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Treatment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD CANINE SALE / PLACEMENT                                     */}
      {/* ========================================================================= */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-7 border border-emerald-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Record Guard Dog Sale / Placement</h3>
              </div>
              <button onClick={() => setShowAddSaleModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Select Dog from Pack</label>
                  <select
                    value={saleDogId}
                    onChange={(e) => {
                      setSaleDogId(e.target.value);
                      const sel = dogs.find((d) => d.id === e.target.value);
                      if (sel) {
                        setSaleDogName(sel.name);
                        setSaleBreed(sel.breed);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="">-- Or Manual Entry Below --</option>
                    {dogs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Date of Sale *</label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold font-mono"
                  />
                </div>
              </div>

              {!saleDogId && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Dog / Puppy Name *</label>
                    <input
                      type="text"
                      value={saleDogName}
                      onChange={(e) => setSaleDogName(e.target.value)}
                      placeholder="e.g. Kaiser or Pack of 2 Pups"
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Breed</label>
                    <input
                      type="text"
                      value={saleBreed}
                      onChange={(e) => setSaleBreed(e.target.value)}
                      placeholder="German Shepherd"
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={saleBuyer}
                    onChange={(e) => setSaleBuyer(e.target.value)}
                    placeholder="e.g. Kipchoge Security Services"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Buyer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={salePhone}
                    onChange={(e) => setSalePhone(e.target.value)}
                    placeholder="+254 722 000 000"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Sale Price (KES) *</label>
                  <input
                    type="number"
                    required
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono font-bold text-emerald-800 text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Payment Method</label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Placement Purpose</label>
                  <select
                    value={salePurpose}
                    onChange={(e) => setSalePurpose(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Security Guard Dog">Security Guard Dog</option>
                    <option value="Trained Family Pet">Trained Family Pet</option>
                    <option value="Breeding">Breeding Stock</option>
                    <option value="Working Livestock Guardian">Working Livestock Guardian</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoFinanceCheck"
                  checked={saleAutoFinance}
                  onChange={(e) => setSaleAutoFinance(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="autoFinanceCheck" className="text-xs font-semibold text-emerald-950 cursor-pointer">
                  Auto-record revenue in JR Farm Financials (Category: Canine Sales)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"
                >
                  Confirm Sale &amp; Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD CANINE LOSS / MORTALITY                                     */}
      {/* ========================================================================= */}
      {showAddMortalityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-7 border border-rose-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-rose-600" />
                <h3 className="text-base font-bold text-gray-900">Record Canine Mortality &amp; Post-Mortem</h3>
              </div>
              <button onClick={() => setShowAddMortalityModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMortality} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Target Canine *</label>
                  <select
                    value={mortDogId}
                    onChange={(e) => {
                      setMortDogId(e.target.value);
                      const sel = dogs.find((d) => d.id === e.target.value);
                      if (sel) {
                        setMortDogName(sel.name);
                        setMortBreed(sel.breed);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="">-- Select from Pack --</option>
                    {dogs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Date of Loss *</label>
                  <input
                    type="date"
                    required
                    value={mortDate}
                    onChange={(e) => setMortDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Primary Cause of Loss *</label>
                <select
                  value={mortCause}
                  onChange={(e) => setMortCause(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-bold text-rose-800"
                >
                  <option value="Snake Bite / Envenomation">Snake Bite / Envenomation</option>
                  <option value="Suspected Acute Poisoning">Suspected Acute Poisoning</option>
                  <option value="Gastric Dilatation-Volvulus (Bloat)">Gastric Dilatation-Volvulus (Bloat)</option>
                  <option value="Severe Trauma / Patrol Injury">Severe Trauma / Patrol Injury</option>
                  <option value="Old Age & Heart Failure">Old Age &amp; Heart Failure</option>
                  <option value="Canine Parvovirus">Canine Parvovirus</option>
                  <option value="Other Illness">Other Illness</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Post-Mortem Veterinary Findings</label>
                <textarea
                  rows={2}
                  value={mortFindings}
                  onChange={(e) => setMortFindings(e.target.value)}
                  placeholder="e.g. Fang marks on lateral neck, severe tissue necrosis, lung congestion consistent with venomous viper bite."
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Disposal Protocol</label>
                  <select
                    value={mortDisposal}
                    onChange={(e) => setMortDisposal(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="Estate Burial">Estate Sanitary Deep Burial with Quicklime</option>
                    <option value="Incineration">Incineration</option>
                    <option value="Sanitary Disposal">Authorized Veterinary Disposal</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Attending Surgeon</label>
                  <input
                    type="text"
                    value={mortVet}
                    onChange={(e) => setMortVet(e.target.value)}
                    placeholder="Dr. Devin Omwenga (DVM)"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Biosecurity Precautions Taken</label>
                <input
                  type="text"
                  value={mortBiosecurity}
                  onChange={(e) => setMortBiosecurity(e.target.value)}
                  placeholder="e.g. Kennels disinfected with Virkon S, other dogs inspected."
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddMortalityModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"
                >
                  Record Mortality Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CANINE PROFILE DOSSIER                                             */}
      {/* ========================================================================= */}
      {selectedDogDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-7 border border-gray-200 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 text-2xl font-black flex items-center justify-center shadow-inner">
                  🐾
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {selectedDogDossier.dutyRole}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedDogDossier.status === 'Active Duty'
                          ? 'bg-emerald-500 text-white'
                          : selectedDogDossier.status === 'In Training'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {selectedDogDossier.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDogDossier.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedDogDossier.breed}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDogDossier(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generateDogPassportPdf(selectedDogDossier)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                <Download size={13} />
                <span>Download Official Vet Passport PDF</span>
              </button>

              <button
                onClick={() => {
                  setPreselectedVaxDogId(selectedDogDossier.id);
                  setVaxDogId(selectedDogDossier.id);
                  setShowAddVaxModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                <Syringe size={13} />
                <span>+ Log Vaccine</span>
              </button>

              <button
                onClick={() => {
                  setPreselectedTxDogId(selectedDogDossier.id);
                  setTxDogId(selectedDogDossier.id);
                  setShowAddTxModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200 cursor-pointer"
              >
                <Stethoscope size={13} />
                <span>+ Log Treatment</span>
              </button>
            </div>

            {/* Dossier Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Identity &amp; Housing</span>
                <div>
                  <span className="text-gray-500">Microchip Tag ID:</span>{' '}
                  <strong className="text-gray-900 font-mono">{selectedDogDossier.chipId || 'Not provided'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Kennel Location:</span>{' '}
                  <strong className="text-gray-900">{selectedDogDossier.kennelNo || 'General Unit'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>{' '}
                  <strong className="text-gray-900 font-mono">{selectedDogDossier.dob}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Gender / Reproduction:</span>{' '}
                  <strong className="text-gray-900">{selectedDogDossier.gender}</strong>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Security &amp; Pedigree</span>
                <div>
                  <span className="text-gray-500">Assigned Handler:</span>{' '}
                  <strong className="text-gray-900">{selectedDogDossier.handlerName || 'Estate Security Unit'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Sire (Father):</span>{' '}
                  <strong className="text-gray-900">{selectedDogDossier.sire || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Dam (Mother):</span>{' '}
                  <strong className="text-gray-900">{selectedDogDossier.dam || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Color / Coat:</span>{' '}
                  <strong className="text-gray-900">{selectedDogDossier.colorMarkings || 'Standard'}</strong>
                </div>
              </div>
            </div>

            {/* Vaccine History in Dossier */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Vaccine &amp; Deworming Standing</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                {vaccinations.filter((v) => v.dogId === selectedDogDossier.id).length === 0 ? (
                  <div className="p-3 text-gray-400 italic text-center">No vaccination logs registered for this dog yet.</div>
                ) : (
                  vaccinations
                    .filter((v) => v.dogId === selectedDogDossier.id)
                    .map((v) => (
                      <div key={v.id} className="p-2.5 flex justify-between items-center border-b border-gray-100 last:border-none">
                        <div>
                          <strong className="text-gray-900 mr-2">{v.vaccineType}</strong>
                          <span className="text-gray-500 font-mono text-[10px]">
                            Administered: {v.dateAdministered} • Next Due: {v.nextDueDate}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            v.nextDueDate < todayStr ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {v.nextDueDate < todayStr ? 'Overdue' : 'Valid'}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Medical History in Dossier */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Medical &amp; Veterinary Treatment History</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                {treatments.filter((t) => t.dogId === selectedDogDossier.id).length === 0 ? (
                  <div className="p-3 text-gray-400 italic text-center">Clean veterinary record: No illnesses or injuries.</div>
                ) : (
                  treatments
                    .filter((t) => t.dogId === selectedDogDossier.id)
                    .map((t) => (
                      <div key={t.id} className="p-2.5 flex justify-between items-start border-b border-gray-100 last:border-none">
                        <div>
                          <strong className="text-gray-900 block">{t.diagnosis}</strong>
                          <span className="text-gray-500 text-[10px] block mt-0.5">{t.treatmentAdministered}</span>
                          <span className="text-gray-400 font-mono text-[9px] block mt-0.5">Date: {t.date} • Vet: {t.attendingVet}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {t.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
