/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FieldRecord,
  LivestockRecord,
  InventoryItem,
  GoatRecord,
  CalfRecord,
  BsfRecord,
  CropOpRecord,
  StaffMember,
  CropSaleRecord,
  SilageRecord,
  HeiferRecord,
  PoultryRecord,
  QuarantineRecord
} from '../types';
import { exportToCsv } from '../utils/csvHelper';
import {
  TreePine,
  Shield,
  Warehouse,
  Plus,
  Compass,
  TrendingDown,
  AlertOctagon,
  Wrench,
  TrendingUp,
  Activity,
  Trash2,
  BookOpen,
  Calendar,
  CheckCircle,
  HelpCircle,
  Heart,
  Droplets,
  ClipboardList,
  Sparkles,
  Award,
  ChevronRight,
  User,
  Clock,
  BadgePercent,
  TrendingUp as IconTrendingUp,
  PenSquare,
  FileSpreadsheet,
  Skull,
  Search,
  DollarSign,
  Users,
  Printer,
  Download
} from 'lucide-react';

interface OtherSectionsProps {
  viewType: 'fields' | 'livestock' | 'inventory';
  fields: FieldRecord[];
  livestock: LivestockRecord[];
  inventory: InventoryItem[];
  onAddFields: (rec: FieldRecord) => void;
  onAddLivestock: (rec: LivestockRecord) => void;
  onUpdateInventoryStock: (id: string, newQty: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onDeleteFields: (id: string) => void;
  onDeleteLivestock: (id: string) => void;
  onDeleteInventoryItem: (id: string) => void;
  // Expanded Props
  goatRecords: GoatRecord[];
  calfRecords: CalfRecord[];
  bsfRecords: BsfRecord[];
  cropOps: CropOpRecord[];
  staffList: StaffMember[];
  onAddGoatRecord: (rec: GoatRecord) => void;
  onDeleteGoatRecord: (id: string) => void;
  onAddCalfRecord: (rec: CalfRecord) => void;
  onDeleteCalfRecord: (id: string) => void;
  onAddBsfRecord: (rec: BsfRecord) => void;
  onDeleteBsfRecord: (id: string) => void;
  onAddCropOp: (rec: CropOpRecord) => void;
  onDeleteCropOp: (id: string) => void;
  onUpdateCropOpStatus: (id: string, status: CropOpRecord['status'], completedBy?: string, notes?: string) => void;
  cropSales: CropSaleRecord[];
  onAddCropSale: (rec: CropSaleRecord) => void;
  onDeleteCropSale: (id: string) => void;
  animalSales: any[];
  onAddAnimalSale: (rec: any) => void;
  onDeleteAnimalSale: (id: string) => void;
  mortalities: any[];
  onAddMortality: (rec: any) => void;
  onDeleteMortality: (id: string) => void;
  onEditField?: (id: string, updated: FieldRecord) => void;
  onEditLivestock?: (id: string, updated: LivestockRecord) => void;
  onEditInventoryItem?: (id: string, updated: InventoryItem) => void;
  onEditGoatRecord?: (id: string, updated: GoatRecord) => void;
  onEditCalfRecord?: (id: string, updated: CalfRecord) => void;
  onEditBsfRecord?: (id: string, updated: BsfRecord) => void;
  onEditCropOp?: (id: string, updated: CropOpRecord) => void;
  onEditCropSale?: (id: string, updated: CropSaleRecord) => void;
  vetRecords?: any[];
  aiRecords?: any[];
  silageRecords?: SilageRecord[];
  onAddSilage?: (rec: SilageRecord) => void;
  onDeleteSilage?: (id: string) => void;
  heiferRecords?: HeiferRecord[];
  onAddHeifer?: (rec: HeiferRecord) => void;
  onDeleteHeifer?: (id: string) => void;
  poultryRecords?: PoultryRecord[];
  onAddPoultry?: (rec: PoultryRecord) => void;
  onDeletePoultry?: (id: string) => void;
  quarantineRecords?: QuarantineRecord[];
  onAddQuarantine?: (rec: QuarantineRecord) => void;
  onDeleteQuarantine?: (id: string) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
  activeSubModule?: string;
}

export function OtherSections({
  viewType,
  fields,
  livestock,
  inventory,
  onAddFields,
  onAddLivestock,
  onUpdateInventoryStock,
  activeSubModule,
  onAddInventoryItem,
  onDeleteFields,
  onDeleteLivestock,
  onDeleteInventoryItem,
  goatRecords,
  calfRecords,
  bsfRecords,
  cropOps,
  staffList,
  onAddGoatRecord,
  onDeleteGoatRecord,
  onAddCalfRecord,
  onDeleteCalfRecord,
  onAddBsfRecord,
  onDeleteBsfRecord,
  onAddCropOp,
  onDeleteCropOp,
  onUpdateCropOpStatus,
  cropSales,
  onAddCropSale,
  onDeleteCropSale,
  animalSales,
  onAddAnimalSale,
  onDeleteAnimalSale,
  mortalities,
  onAddMortality,
  onDeleteMortality,
  onEditField,
  onEditLivestock,
  onEditInventoryItem,
  onEditGoatRecord,
  onEditCalfRecord,
  onEditBsfRecord,
  onEditCropOp,
  onEditCropSale,
  vetRecords = [],
  aiRecords = [],
  silageRecords = [],
  onAddSilage,
  onDeleteSilage,
  heiferRecords = [],
  onAddHeifer,
  onDeleteHeifer,
  poultryRecords = [],
  onAddPoultry,
  onDeletePoultry,
  quarantineRecords = [],
  onAddQuarantine,
  onDeleteQuarantine,
  onTriggerSectionReport
}: OtherSectionsProps) {
  // Toggle for livestock sub segments
  const [livestockSubTab, setLivestockSubTab] = useState<'poultry' | 'poultry_dogs' | 'goats' | 'calves' | 'heifers' | 'quarantine' | 'bsf' | 'operations' | 'sales_mortality' | 'biogas_optimizer'>('poultry');
  const [agronomySubTab, setAgronomySubTab] = useState<'blocks' | 'silage' | 'crop_ops' | 'sales'>('blocks');

  React.useEffect(() => {
    if (activeSubModule === 'goats') {
      setLivestockSubTab('goats');
    } else if (activeSubModule === 'calves') {
      setLivestockSubTab('calves');
    } else if (activeSubModule === 'heifers') {
      setLivestockSubTab('heifers');
    } else if (activeSubModule === 'poultry') {
      setLivestockSubTab('poultry');
    } else if (activeSubModule === 'canines') {
      setLivestockSubTab('poultry_dogs');
    } else if (activeSubModule === 'bsf') {
      setLivestockSubTab('bsf');
    } else if (activeSubModule === 'biogas') {
      setLivestockSubTab('biogas_optimizer');
    }
  }, [activeSubModule]);

  // Interactive Geospatial Farm Layout Map States
  const [selectedMapFieldId, setSelectedMapFieldId] = useState<string | null>(null);
  const [mapFilterActive, setMapFilterActive] = useState<boolean>(false);

  // Edit State Variables
  const [editingField, setEditingField] = useState<FieldRecord | null>(null);
  const [editingLivestock, setEditingLivestock] = useState<LivestockRecord | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [editingGoat, setEditingGoat] = useState<GoatRecord | null>(null);
  const [editingCalf, setEditingCalf] = useState<CalfRecord | null>(null);
  const [editingBsf, setEditingBsf] = useState<BsfRecord | null>(null);
  const [editingCropOp, setEditingCropOp] = useState<CropOpRecord | null>(null);
  const [editingCropSale, setEditingCropSale] = useState<CropSaleRecord | null>(null);

  // Sovereign Biogas Optimizer States
  const [substrateType, setSubstrateType] = useState<'cattle_manure' | 'poultry_litter' | 'goat_droppings' | 'kitchen_waste'>('cattle_manure');
  const [wasteInputKg, setWasteInputKg] = useState<number>(50);
  const [waterRatio, setWaterRatio] = useState<number>(1); // e.g. 1:1, 1:2
  const [hrtDays, setHrtDays] = useState<number>(30); // hydraulic retention time
  const [digesterTemp, setDigesterTemp] = useState<number>(35); // mesophilic target Celsius

  // Silage and Rhodes Pasture Calculator local states
  const [silRaw, setSilRaw] = useState<string>('Maize');
  const [silAcres, setSilAcres] = useState<number>(1.5);
  const [silWeight, setSilWeight] = useState<number>(27000); // 1.5 * 18000
  const [silShowAdd, setSilShowAdd] = useState<boolean>(false);
  const [silDateMade, setSilDateMade] = useState<string>(new Date().toISOString().split('T')[0]);
  const [silDateOpened, setSilDateOpened] = useState<string>('');
  const [silQuality, setSilQuality] = useState<string>('Excellent (Golden yellow, lactic acid smell)');
  const [silNotes, setSilNotes] = useState<string>('');
  const [silAnimalsCount, setSilAnimalsCount] = useState<number>(10);
  const [silAverageWeight, setSilAverageWeight] = useState<number>(450);
  const [silDailyIntake, setSilDailyIntake] = useState<number>(13.5); // 3% of body weight as-fed

  // Boma Rhodes Calculator local states
  const [rhodesAcres, setRhodesAcres] = useState<number>(2.5);
  const [rhodesAnimalsCount, setRhodesAnimalsCount] = useState<number>(8);
  const [rhodesCustomDailyIntake, setRhodesCustomDailyIntake] = useState<number>(10); // 10kg DM per animal

  // Poultry Hub states
  const [pouShowAdd, setPouShowAdd] = useState<boolean>(false);
  const [pouStage, setPouStage] = useState<'Chick' | 'Grower' | 'Layer'>('Chick');
  const [pouBatchName, setPouBatchName] = useState<string>('');
  const [pouCount, setPouCount] = useState<number>(100);
  const [pouDate, setPouDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pouFeedGiven, setPouFeedGiven] = useState<number>(12);
  const [pouFeedType, setPouFeedType] = useState<string>('Chick Start Crumble');
  const [pouMortality, setPouMortality] = useState<number>(0);
  const [pouEggCrates, setPouEggCrates] = useState<number>(0);
  const [pouCrackedEggs, setPouCrackedEggs] = useState<number>(0);
  const [pouWater, setPouWater] = useState<number>(20);
  const [pouVaccines, setPouVaccines] = useState<string>('');
  const [pouNotes, setPouNotes] = useState<string>('');

  // Heifer Management states
  const [hefShowAdd, setHefShowAdd] = useState<boolean>(false);
  const [hefCowId, setHefCowId] = useState<string>('');
  const [hefDate, setHefDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hefWeight, setHefWeight] = useState<number>(220);
  const [hefGirth, setHefGirth] = useState<number>(135);
  const [hefRation, setHefRation] = useState<string>('Rhodes hay + Grower meal');
  const [hefAdg, setHefAdg] = useState<number>(650);
  const [hefBreedingReady, setHefBreedingReady] = useState<boolean>(false);
  const [hefNotes, setHefNotes] = useState<string>('');

  // Quarantine states
  const [quaShowAdd, setQuaShowAdd] = useState<boolean>(false);
  const [quaType, setQuaType] = useState<'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other'>('Cow');
  const [quaTag, setQuaTag] = useState<string>('');
  const [quaDateStart, setQuaDateStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quaDateEnd, setQuaDateEnd] = useState<string>('');
  const [quaReason, setQuaReason] = useState<string>('New purchase quarantine');
  const [quaSymptoms, setQuaSymptoms] = useState<string>('None');
  const [quaStatus, setQuaStatus] = useState<'Strict Isolation' | 'Under Observation' | 'Cleared & Released' | 'Failed & Culled'>('Under Observation');
  const [quaVet, setQuaVet] = useState<string>('');
  const [quaNotes, setQuaNotes] = useState<string>('');

  // CSV Exporters for individual sub-sections
  const downloadFieldsCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'REGISTERED FIELDS & AGRO FORESTRY COMPLIANCE DIRECTORY\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Plot ID,Block Name,Crop Type,Area (Acres),Status,Observational Notes,Date Logged\n';
    fields.forEach((f) => {
      csv += `"${f.id}","${f.blockName}","${f.cropType}",${f.acreage},"${f.status}","${f.notes || ''}","${f.date}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fields_Crop_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCropOpsCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'CROP AGRONOMY OPERATIONS LEDGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Operation ID,Target Crop,Operation Name,Staff Member/Operator,Status,Observation Notes\n';
    cropOps.forEach((op) => {
      csv += `${op.date},"${op.id}","${op.crop}","${op.operationName}","${op.completedBy || ''}","${op.status}","${op.notes}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Crop_Operational_Agronomy_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCropSalesCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'LOCAL CASH CROP COMPILATION SALES LEDGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Reference,Harvest Crop,Quantity Sold,Unit,Rate per Unit (Ksh),Gross Proceeds (Ksh),Buyer/Purchaser\n';
    cropSales.forEach((cs) => {
      csv += `${cs.date},"${cs.ref}","${cs.crop}",${cs.qty},"${cs.unit}",${cs.pricePerUnit},${cs.totalSales},"${cs.buyer}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Local_Crops_Cash_Sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadLivestockCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'AGRICULTURAL CANINE & POULTRY STATUS MANAGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Asset Name,Category Type,Quantity/Breed details,Current Activity,Observational Log\n';
    livestock.forEach((item) => {
      csv += `"${item.date}","${item.name}","${item.type}","${item.countOrBreed}","${item.activity}","${item.notes || ''}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Canine_Poultry_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCanineCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'AGRICULTURAL SECURITY CANINE STATUS LEDGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Canine Name,Breed Classification,Current Activity,Observational Log\n';
    livestock.filter(item => item.type === 'Dogs').forEach((item) => {
      csv += `"${item.date}","${item.name}","${item.countOrBreed}","${item.activity}","${item.notes || ''}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Canine_Security_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadGoatsCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'GOAT DAIRY & BREEDING HERD REGISTER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Record ID,Tag/Collar ID,Breed,Purpose,Milk Yield (Liters),Activity,Observational Notes\n';
    goatRecords.forEach((gt) => {
      csv += `${gt.date},"${gt.id}","${gt.tagId}","${gt.breed}","${gt.purpose}",${gt.milkYieldLiters ?? ''},"${gt.activity}","${gt.notes}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Goats_Dairy_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCalvesCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'NURSERY CALF WEANING & HEALTH DOSAGE HISTORY\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Record ID,Calf ID,Dam/Mother ID,DOB,Milk Intake (L),Creep Feed Intro Date,Weaned Status,Observational Notes\n';
    calfRecords.forEach((cf) => {
      csv += `${cf.date},"${cf.id}","${cf.calfId}","${cf.damId}","${cf.dob}",${cf.milkIntakeLiters},"${cf.creepFeedIntroDate || ''}","${cf.weaned ? 'Weaned' : 'Nursery active'}","${cf.notes}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Calves_Nursery_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadBsfCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'BLACK SOLDIER FLY (BSF) LARVAE REARING CYCLES\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Record ID,Batch ID,Substrate Feed Type,Inoculation Date,Larvae Harvested (KG),Status Stage,Observational Notes\n';
    bsfRecords.forEach((batch) => {
      csv += `${batch.date},"${batch.id}","${batch.batchId}","${batch.substrateType}","${batch.inoculationDate}",${batch.larvaeHarvestedKg},"${batch.status}","${batch.notes}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BSF_Larvae_Production_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadInventoryCSV = () => {
    const headers = ['Item ID', 'Item Name', 'Category', 'Current Stock', 'Unit', 'Min Stock', 'Status'];
    const rows = inventory.map(item => [
      item.id,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.minStock,
      item.quantity <= item.minStock ? 'RESTOCK REQUIRED' : 'Secure Level'
    ]);
    exportToCsv(`Warehouse_Inventory_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Other Crops Sales Form State
  const [csCrop, setCsCrop] = useState<string>('Banana');
  const [csQty, setCsQty] = useState<number | ''>('');
  const [csUnit, setCsUnit] = useState<string>('bunches');
  const [csPricePerUnit, setCsPricePerUnit] = useState<number | ''>('');
  const [csBuyer, setCsBuyer] = useState<string>('Local Market');
  const [csRef, setCsRef] = useState<string>('');
  const [csDate, setCsDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Forms Visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // Interactive Calf Weaning parameters
  const [calfBirthWeight, setCalfBirthWeight] = useState<number>(35);
  const [calfTargetAgeWeeks, setCalfTargetAgeWeeks] = useState<number>(10);

  // Improvement 1 & 3: Interactive Vet Diagnostics & Drug Withdrawal Safety Wizard states
  const [diagSpecies, setDiagSpecies] = useState<'Cattle' | 'Poultry' | 'Goat'>('Cattle');
  const [diagSymptom, setDiagSymptom] = useState<string>('fever_milk_drop');
  const [withMedType, setWithMedType] = useState<string>('antibiotic_pen');
  const [withTreatDate, setWithTreatDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Improvement 2: Interactive Poultry Performance Targeter states
  const [calcPouCount, setCalcPouCount] = useState<number>(500);
  const [calcPouEggCrates, setCalcPouEggCrates] = useState<number>(14);
  const [calcPouFeedBags, setCalcPouFeedBags] = useState<number>(1.5);
  const [calcPouFeedCostBag, setCalcPouFeedCostBag] = useState<number>(3250);
  const [calcPouCratePrice, setCalcPouCratePrice] = useState<number>(450);

  // Fields Form
  const [fBlock, setFBlock] = useState('');
  const [fCrop, setFCrop] = useState('');
  const [fAcres, setFAcres] = useState<number | ''>('');
  const [fStatus, setFStatus] = useState('Growing');
  const [fNotes, setFNotes] = useState('');
  const [fSoilPh, setFSoilPh] = useState<number | ''>('');
  const [fLastFert, setFLastFert] = useState('');
  const [fProjectedHarvest, setFProjectedHarvest] = useState('');
  const [fIrrigation, setFIrrigation] = useState<FieldRecord['irrigationMethod']>('Rainfed');
  const [fDatePlanted, setFDatePlanted] = useState('');
  const [fDateLogged, setFDateLogged] = useState(new Date().toISOString().split('T')[0]);

  // Crop Operations Form
  const [coCrop, setCoCrop] = useState<CropOpRecord['crop']>('Tea');
  const [coOperationName, setCoOperationName] = useState('');
  const [coDate, setCoDate] = useState(new Date().toISOString().split('T')[0]);
  const [coNotes, setCoNotes] = useState('');
  const [coStaff, setCoStaff] = useState(staffList[0]?.name || 'Charles');
  const [coInputsUsed, setCoInputsUsed] = useState('');
  const [coInputQuantityUsed, setCoInputQuantityUsed] = useState('');
  const [coEquipmentUsed, setCoEquipmentUsed] = useState('');
  const [coOperationCost, setCoOperationCost] = useState<number | ''>('');

  // Livestock/Poultry & Dogs Form
  const [lsType, setLsType] = useState<'Poultry' | 'Dogs'>('Poultry');
  const [lsName, setLsName] = useState('');
  const [lsCount, setLsCount] = useState('');
  const [lsActivity, setLsActivity] = useState('');
  const [lsNotes, setLsNotes] = useState('');
  const [lsDate, setLsDate] = useState(new Date().toISOString().split('T')[0]);

  // K-9 Veterinary Health Card generator states & logic
  const [showVetCardModal, setShowVetCardModal] = useState(false);
  const [selectedCanineId, setSelectedCanineId] = useState<string>('');
  const [vetCardName, setVetCardName] = useState('');
  const [vetCardBreed, setVetCardBreed] = useState('');
  const [vetCardDob, setVetCardDob] = useState('');
  const [vetCardChip, setVetCardChip] = useState('');
  const [vetCardGender, setVetCardGender] = useState('Male');
  const [vetCardSire, setVetCardSire] = useState('');
  const [vetCardDam, setVetCardDam] = useState('');
  const [vetCardHandler, setVetCardHandler] = useState('');
  const [vetCardVet, setVetCardVet] = useState('Dr. Devin Omwenga, DVM');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSelectCanineToPreFill = (canineId: string) => {
    setSelectedCanineId(canineId);
    if (!canineId) {
      setVetCardName('');
      setVetCardBreed('');
      setVetCardDob('');
      setVetCardChip('');
      setVetCardGender('Male');
      setVetCardSire('');
      setVetCardDam('');
      setVetCardHandler('');
      return;
    }
    const found = livestock.find(item => item.id === canineId);
    if (found) {
      setVetCardName(found.name);
      setVetCardBreed(found.countOrBreed);
      // Sensible defaults to populate a premium medical card
      setVetCardDob('2024-05-15');
      setVetCardChip(`K9-CHIP-${found.id.slice(0, 4).toUpperCase()}`);
      setVetCardGender('Male');
      setVetCardSire('Rocky (K9 Alpha)');
      setVetCardDam('Bella (K9 Beta)');
      setVetCardHandler('Sector 4 Security Patrol');
    }
  };

  const downloadCanineVetCardPdf = async (isEmpty: boolean) => {
    setIsGeneratingPdf(true);
    try {
      const loadScript = (url: string) => {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${url}`));
          document.head.appendChild(script);
        });
      };

      if (!(window as any).html2pdf) {
        await loadScript("/html2pdf.bundle.min.js");
      }

      const name = isEmpty ? "" : (vetCardName || "Unnamed Canine");
      const breed = isEmpty ? "" : (vetCardBreed || "N/A");
      const dob = isEmpty ? "" : (vetCardDob || "N/A");
      const chip = isEmpty ? "" : (vetCardChip || "N/A");
      const gender = isEmpty ? "" : (vetCardGender || "Male");
      const sire = isEmpty ? "" : (vetCardSire || "N/A");
      const dam = isEmpty ? "" : (vetCardDam || "N/A");
      const handler = isEmpty ? "" : (vetCardHandler || "N/A");
      const vetName = isEmpty ? "" : (vetCardVet || "Dr. Devin Omwenga, DVM");

      // Pull matching logs if not empty
      let matchingLogs: any[] = [];
      if (!isEmpty && vetCardName) {
        matchingLogs = livestock.filter(item => 
          item.type === 'Dogs' && 
          item.name.toLowerCase().includes(vetCardName.toLowerCase())
        );
      }

      // Render hidden container
      const pdfWrapper = document.createElement('div');
      pdfWrapper.style.width = '750px';
      pdfWrapper.style.padding = '35px';
      pdfWrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      pdfWrapper.style.color = '#1e293b';
      pdfWrapper.style.backgroundColor = '#ffffff';

      pdfWrapper.innerHTML = `
        <div style="border: 2px solid #0f172a; border-radius: 16px; padding: 30px; position: relative; background: #ffffff; box-sizing: border-box;">
          
          <!-- Green top ribbon -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, #10b981 0%, #047857 50%, #0f172a 100%); border-top-left-radius: 14px; border-top-right-radius: 14px;"></div>
          
          <!-- Header Block -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 22px; margin-top: 5px;">
            <div>
              <span style="font-size: 9px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 4px;">Sovereign Agri-Security K-9 Squad</span>
              <h1 style="font-size: 23px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;">Veterinary Health Passport</h1>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-weight: 600;">Official Pedigree & Immunization Medical Record</p>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 10px; font-weight: bold; color: #475569; background: #f1f5f9; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1;">
              <div>REGISTRY: SEC-K9-UNIT</div>
              <div style="margin-top: 2px;">PLOT NO: KT-205A</div>
              <div style="margin-top: 2px; color: #047857;">STATUS: VERIFIED</div>
            </div>
          </div>

          <!-- Section A: Pedigree & Identity -->
          <div style="margin-bottom: 22px;">
            <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; display: flex; align-items: center; margin-top: 0;">
              <span style="background: #0f172a; color: #ffffff; padding: 2px 7px; font-size: 10px; border-radius: 4px; margin-right: 8px;">A</span> 
              Canine Identification & Pedigree Registry
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.4;">
              <tr>
                <td style="width: 25%; padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Official K-9 Name:</td>
                <td style="width: 25%; padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${name || '<span style="color: #cbd5e1;">_________________</span>'}</td>
                <td style="width: 25%; padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Breed / Phenotype:</td>
                <td style="width: 25%; padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${breed || '<span style="color: #cbd5e1;">_________________</span>'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Microchip / Tag ID:</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #047857;">${chip || '<span style="color: #cbd5e1;">_________________</span>'}</td>
                <td style="padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Date of Birth / Age:</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #0f172a;">${dob || '<span style="color: #cbd5e1;">_________________</span>'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Gender / Sex:</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${gender || '<span style="color: #cbd5e1;">_________________</span>'}</td>
                <td style="padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Assigned Handler:</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">${handler || '<span style="color: #cbd5e1;">_________________</span>'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Sire (Father):</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">${sire || '<span style="color: #cbd5e1;">_________________</span>'}</td>
                <td style="padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Dam (Mother):</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">${dam || '<span style="color: #cbd5e1;">_________________</span>'}</td>
              </tr>
            </table>
          </div>

          <!-- Section B: Core Immunizations -->
          <div style="margin-bottom: 22px;">
            <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; display: flex; align-items: center; margin-top: 0;">
              <span style="background: #0f172a; color: #ffffff; padding: 2px 7px; font-size: 10px; border-radius: 4px; margin-right: 8px;">B</span>
              I. Mandatory Core Immunization Tracker
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 32%;">Antigen Type / Vaccination Target</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 14%;">Date Injected</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 18%;">Serial / Batch No.</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 22%;">Booster Due Date</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 14%;">DVM Stamp / Sign</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #fff;">
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">Rabies Prophylaxis (Mandatory)</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${!isEmpty ? 'Annual cycle' : ''}</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b;">${!isEmpty ? 'RB-COOP-921A' : '[Seal Stamp]'}</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #b91c1c;">${!isEmpty ? 'Annual Booster' : ''}</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${!isEmpty ? 'D. Omwenga' : ''}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">DHLPP (Parvovirus, Distemper, Hepatitis)</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;"></td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b;">[Seal Stamp]</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #b91c1c;"></td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1;"></td>
                </tr>
                <tr style="background: #fff;">
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">Canine Coronavirus / Giardia Booster</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;"></td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b;">[Seal Stamp]</td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #b91c1c;"></td>
                  <td style="padding: 6px 8px; border: 1px solid #cbd5e1;"></td>
                </tr>
                ${Array.from({ length: 3 }).map(() => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">__________________________________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">__________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">_______________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">__________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">_______</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Section C: Parasite Control & Deworming -->
          <div style="margin-bottom: 22px;">
            <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; display: flex; align-items: center; margin-top: 0;">
              <span style="background: #0f172a; color: #ffffff; padding: 2px 7px; font-size: 10px; border-radius: 4px; margin-right: 8px;">C</span>
              II. Clinical Deworming & Parasite Control Protocols
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 14%;">Admin Date</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 32%;">Product / Brand Administered</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 20%;">Dosage / Method</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 14%;">Weight (kg)</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 20%;">Attending Officer / Vet</th>
                </tr>
              </thead>
              <tbody>
                ${matchingLogs.length > 0 ? matchingLogs.slice(0, 2).map(item => `
                  <tr style="background: #fff;">
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${item.date}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${item.activity}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">Oral Broad-spectrum</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">32 kg</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${vetName}</td>
                  </tr>
                `).join('') : `
                  <tr style="background: #fff;">
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${!isEmpty ? new Date().toLocaleDateString() : ''}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${!isEmpty ? 'Praziquantel De-wormer (Endoguard)' : '__________________________________'}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${!isEmpty ? '1 tab per 10kg body weight' : ''}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${!isEmpty ? '30 kg' : ''}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${!isEmpty ? 'Dr. D. Omwenga' : ''}</td>
                  </tr>
                `}
                ${Array.from({ length: 3 }).map(() => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1; font-family: monospace;">__/__/____</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">______________________________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">_______________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">______</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">____________</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Section D: Medical Treatment History -->
          <div style="margin-bottom: 22px;">
            <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; display: flex; align-items: center; margin-top: 0;">
              <span style="background: #0f172a; color: #ffffff; padding: 2px 7px; font-size: 10px; border-radius: 4px; margin-right: 8px;">D</span>
              III. Veterinary Treatment, Diagnostic & Physical Records
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 14%;">Log Date</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 44%;">Symptom Diagnosis / Clinical Notes</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 28%;">Prescription / Active Compound Administered</th>
                  <th style="padding: 6px 8px; border: 1px solid #0f172a; width: 14%;">DVM Signature</th>
                </tr>
              </thead>
              <tbody>
                ${matchingLogs.length > 0 ? matchingLogs.map(item => `
                  <tr style="background: #fff;">
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${item.date}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${item.notes || 'Routine guard patrol fitness check'}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${item.activity}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 9px; font-weight: bold;">Dr. Omwenga</td>
                  </tr>
                `).join('') : `
                  <tr style="background: #fff;">
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1; font-family: monospace;">___/__/____</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">__________________________________________________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">_________________________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">______</td>
                  </tr>
                `}
                ${Array.from({ length: 3 }).map(() => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1; font-family: monospace;">__/__/____</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">__________________________________________________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">_________________________</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #cbd5e1;">______</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Official Signatures -->
          <div style="margin-top: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="width: 44%; border-top: 1px dashed #475569; padding-top: 6px; text-align: center;">
              <span style="font-size: 10px; font-weight: bold; color: #475569; display: block;">Authorized Attending Veterinarian</span>
              <span style="font-size: 9px; color: #64748b; font-family: monospace; display: block; margin-top: 2px;">DVM License Seal & Stamp</span>
            </div>
            
            <div style="width: 44%; border-top: 1px dashed #475569; padding-top: 6px; text-align: center;">
              <span style="font-size: 10px; font-weight: bold; color: #475569; display: block;">Authorized Estate Comptroller</span>
              <span style="font-size: 9px; color: #64748b; font-family: monospace; display: block; margin-top: 2px;">Dr. Devin Omwenga, DVM / Comptroller</span>
            </div>
          </div>

          <div style="margin-top: 22px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <p style="font-size: 9px; color: #94a3b8; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              Sovereign Agricultural Compliance • GlobalGAP Registered Plot No. KT-205A
            </p>
          </div>
        </div>
      `;

      const opt = {
        margin: [0.25, 0.25, 0.25, 0.25],
        filename: isEmpty ? 'Empty_Canine_Veterinary_Card.pdf' : `Canine_Health_Passport_${name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await (window as any).html2pdf().set(opt).from(pdfWrapper).save();
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Goat Form
  const [gtTag, setGtTag] = useState('');
  const [gtBreed, setGtBreed] = useState<GoatRecord['breed']>('Toggenburg');
  const [gtPurpose, setGtPurpose] = useState<GoatRecord['purpose']>('Dairy');
  const [gtMilk, setGtMilk] = useState<number | ''>('');
  const [gtActivity, setGtActivity] = useState('');
  const [gtNotes, setGtNotes] = useState('');
  const [gtDate, setGtDate] = useState(new Date().toISOString().split('T')[0]);

  // Calf Form
  const [cfId, setCfId] = useState('');
  const [cfName, setCfName] = useState('');
  const [cfSex, setCfSex] = useState<'Male' | 'Female'>('Female');
  const [cfDam, setCfDam] = useState('');
  const [cfDob, setCfDob] = useState('');
  const [cfMilk, setCfMilk] = useState<number | ''>(4);
  const [cfCreepDate, setCfCreepDate] = useState('');
  const [cfWeaned, setCfWeaned] = useState(false);
  const [cfNotes, setCfNotes] = useState('');
  const [cfDate, setCfDate] = useState(new Date().toISOString().split('T')[0]);

  // BSF Form
  const [bsBatchId, setBsBatchId] = useState('');
  const [bsSubstrate, setBsSubstrate] = useState('');
  const [bsInoculation, setBsInoculation] = useState('');
  const [bsLarvae, setBsLarvae] = useState<number | ''>(0);
  const [bsStatus, setBsStatus] = useState<BsfRecord['status']>('Inoculation');
  const [bsNotes, setBsNotes] = useState('');
  const [bsDate, setBsDate] = useState(new Date().toISOString().split('T')[0]);

  // Inventory Form
  const [invName, setInvName] = useState('');
  const [invCat, setInvCat] = useState<InventoryItem['category']>('Feed');
  const [invQty, setInvQty] = useState<number | ''>('');
  const [invUnit, setInvUnit] = useState('bags');
  const [invMin, setInvMin] = useState<number | ''>('');
  const [invDateReceived, setInvDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [invLocation, setInvLocation] = useState('');
  const [invExpiryDate, setInvExpiryDate] = useState('');

  // Animal Sales Form
  const [asCategory, setAsCategory] = useState<'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other'>('Poultry');
  const [asAnimalIdOrBatch, setAsAnimalIdOrBatch] = useState('');
  const [asQty, setAsQty] = useState<number | ''>(1);
  const [asPrice, setAsPrice] = useState<number | ''>('');
  const [asBuyer, setAsBuyer] = useState('');
  const [asRef, setAsRef] = useState('');
  const [asDate, setAsDate] = useState(new Date().toISOString().split('T')[0]);
  const [asWeightKg, setAsWeightKg] = useState<number | ''>('');
  const [asNotes, setAsNotes] = useState('');

  // Mortality Form
  const [mCategory, setMCategory] = useState<'Cow' | 'Goat' | 'Calf' | 'Poultry' | 'Dog' | 'Other'>('Poultry');
  const [mAnimalIdOrBatch, setMAnimalIdOrBatch] = useState('');
  const [mCount, setMCount] = useState<number | ''>(1);
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mCauseOfDeath, setMCauseOfDeath] = useState('');
  const [mVetConfirmed, setMVetConfirmed] = useState(false);
  const [mNotes, setMNotes] = useState('');

  // Handlers
  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fBlock.trim() || !fCrop.trim() || fAcres === '') return;
    onAddFields({
      id: `fld-${Date.now()}`,
      blockName: fBlock.trim(),
      cropType: fCrop.trim(),
      acreage: Number(fAcres),
      status: fStatus,
      notes: fNotes.trim() || 'No active notes',
      date: fDateLogged,
      soilPh: fSoilPh === '' ? undefined : Number(fSoilPh),
      lastFertilizerDate: fLastFert || undefined,
      projectedHarvestVolume: fProjectedHarvest.trim() || undefined,
      irrigationMethod: fIrrigation,
      datePlanted: fDatePlanted || undefined
    });
    setFBlock('');
    setFCrop('');
    setFAcres('');
    setFNotes('');
    setFSoilPh('');
    setFLastFert('');
    setFProjectedHarvest('');
    setFIrrigation('Rainfed');
    setFDatePlanted('');
    setFDateLogged(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const handleCropSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (csQty === '' || csPricePerUnit === '' || !csRef.trim() || !csCrop.trim() || !csUnit.trim()) return;
    const qtyNum = Number(csQty);
    const priceNum = Number(csPricePerUnit);
    onAddCropSale({
      id: `cs-${Date.now()}`,
      crop: csCrop,
      qty: qtyNum,
      unit: csUnit.trim(),
      pricePerUnit: priceNum,
      buyer: csBuyer.trim() || 'General Local Market',
      ref: csRef.trim(),
      date: csDate,
      totalSales: qtyNum * priceNum
    });
    setCsQty('');
    setCsPricePerUnit('');
    setCsRef('');
    setShowAddForm(false);
  };

  const handleCropOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coOperationName.trim() || !coDate) return;
    onAddCropOp({
      id: `co-${Date.now()}`,
      crop: coCrop,
      operationName: coOperationName.trim(),
      date: coDate,
      status: 'Pending',
      completedBy: coStaff,
      notes: coNotes.trim() || 'Scheduled task',
      inputsUsed: coInputsUsed.trim() || undefined,
      inputQuantityUsed: coInputQuantityUsed.trim() || undefined,
      equipmentUsed: coEquipmentUsed.trim() || undefined,
      operationCost: coOperationCost === '' ? undefined : Number(coOperationCost)
    });
    setCoOperationName('');
    setCoDate(new Date().toISOString().split('T')[0]);
    setCoNotes('');
    setCoInputsUsed('');
    setCoInputQuantityUsed('');
    setCoEquipmentUsed('');
    setCoOperationCost('');
    setShowAddForm(false);
  };

  const handleLivestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lsName.trim() || !lsCount.trim() || !lsActivity.trim()) return;
    onAddLivestock({
      id: `ls-${Date.now()}`,
      type: lsType,
      name: lsName.trim(),
      countOrBreed: lsCount.trim(),
      activity: lsActivity.trim(),
      notes: lsNotes.trim() || 'General healthy record',
      date: lsDate || new Date().toISOString().split('T')[0]
    });
    setLsName('');
    setLsCount('');
    setLsActivity('');
    setLsNotes('');
    setLsDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const handleGoatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gtTag.trim() || !gtActivity.trim()) return;
    onAddGoatRecord({
      id: `gt-${Date.now()}`,
      tagId: gtTag.trim(),
      breed: gtBreed,
      purpose: gtPurpose,
      milkYieldLiters: gtPurpose === 'Dairy' ? (gtMilk === '' ? 0 : Number(gtMilk)) : undefined,
      activity: gtActivity.trim(),
      notes: gtNotes.trim() || 'Active browse feeder',
      date: gtDate || new Date().toISOString().split('T')[0]
    });
    setGtTag('');
    setGtMilk('');
    setGtActivity('');
    setGtNotes('');
    setGtDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const handleCalfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfId.trim() || !cfDob) return;
    onAddCalfRecord({
      id: `cf-${Date.now()}`,
      calfId: cfId.trim(),
      damId: cfDam.trim() || 'Cow-Unknown',
      dob: cfDob,
      milkIntakeLiters: cfWeaned ? 0 : (cfMilk === '' ? 4 : Number(cfMilk)),
      creepFeedIntroDate: cfCreepDate || undefined,
      weaned: cfWeaned,
      notes: cfNotes.trim() || 'Healthy calf growth progress',
      date: cfDate || new Date().toISOString().split('T')[0],
      calfName: cfName.trim() || undefined,
      sex: cfSex
    });
    setCfId('');
    setCfName('');
    setCfSex('Female');
    setCfDam('');
    setCfDob('');
    setCfMilk(4);
    setCfCreepDate('');
    setCfWeaned(false);
    setCfNotes('');
    setCfDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const handleBsfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bsBatchId.trim() || !bsSubstrate.trim() || !bsInoculation) return;
    onAddBsfRecord({
      id: `bsf-${Date.now()}`,
      batchId: bsBatchId.trim(),
      substrateType: bsSubstrate.trim(),
      inoculationDate: bsInoculation,
      larvaeHarvestedKg: bsLarvae === '' ? 0 : Number(bsLarvae),
      status: bsStatus,
      notes: bsNotes.trim() || 'Active decomposition cycle',
      date: bsDate || new Date().toISOString().split('T')[0]
    });
    setBsBatchId('');
    setBsSubstrate('');
    setBsInoculation('');
    setBsLarvae('');
    setBsNotes('');
    setBsDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || invQty === '' || !invUnit.trim() || invMin === '') return;
    onAddInventoryItem({
      id: `inv-${Date.now()}`,
      name: invName.trim(),
      category: invCat,
      quantity: Number(invQty),
      unit: invUnit.trim(),
      minStock: Number(invMin),
      dateReceived: invDateReceived || undefined,
      location: invLocation.trim() || undefined,
      expiryDate: invExpiryDate || undefined
    });
    setInvName('');
    setInvQty('');
    setInvUnit('bags');
    setInvMin('');
    setInvDateReceived(new Date().toISOString().split('T')[0]);
    setInvLocation('');
    setInvExpiryDate('');
    setShowAddForm(false);
  };

  const handleAnimalSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asAnimalIdOrBatch.trim() || asQty === '' || asPrice === '') return;
    onAddAnimalSale({
      id: `sale-${Date.now()}`,
      category: asCategory,
      animalIdOrBatch: asAnimalIdOrBatch.trim(),
      qty: Number(asQty),
      price: Number(asPrice),
      buyer: asBuyer.trim() || 'General Local Buyer',
      ref: asRef.trim() || `SL-${Date.now().toString().slice(-4)}`,
      date: asDate,
      weightKg: asWeightKg === '' ? undefined : Number(asWeightKg),
      notes: asNotes.trim() || 'Livestock sales ledger transaction'
    });
    setAsAnimalIdOrBatch('');
    setAsQty(1);
    setAsPrice('');
    setAsBuyer('');
    setAsRef('');
    setAsDate(new Date().toISOString().split('T')[0]);
    setAsWeightKg('');
    setAsNotes('');
    setShowAddForm(false);
  };

  const handleMortalitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mAnimalIdOrBatch.trim() || mCount === '' || !mCauseOfDeath.trim()) return;
    onAddMortality({
      id: `mort-${Date.now()}`,
      category: mCategory,
      animalIdOrBatch: mAnimalIdOrBatch.trim(),
      count: Number(mCount),
      date: mDate,
      causeOfDeath: mCauseOfDeath.trim(),
      veterinaryConfirmed: mVetConfirmed,
      notes: mNotes.trim() || 'No additional mortality observations logged.'
    });
    setMAnimalIdOrBatch('');
    setMCount(1);
    setMDate(new Date().toISOString().split('T')[0]);
    setMCauseOfDeath('');
    setMVetConfirmed(false);
    setMNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. FIELDS, TREES & CROPS UNIT */}
      {viewType === 'fields' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl">
                <TreePine size={24} className="text-emerald-800" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Nyaronde Agronomy & Crops Hub</h4>
                  <span className="text-[10px] bg-emerald-900 text-emerald-100 border border-green-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Nyamira County</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Coordinate windbreaker blue gum, pasture paddocks, and operations logs for Tea, Avocado, Bananas, Corn & Sorghum.</p>
              </div>
            </div>

            {/* View Sub tabs */}
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border shrink-0 w-full md:w-auto gap-0.5">
              <button
                onClick={() => { setAgronomySubTab('blocks'); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
                  agronomySubTab === 'blocks' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Agronomy Blocks
              </button>
              <button
                onClick={() => { setAgronomySubTab('silage'); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
                  agronomySubTab === 'silage' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                🌾 Silage & Boma Rhodes
              </button>
              <button
                onClick={() => { setAgronomySubTab('crop_ops'); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
                  agronomySubTab === 'crop_ops' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Routine Crop Guides
              </button>
              <button
                onClick={() => { setAgronomySubTab('sales'); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
                  agronomySubTab === 'sales' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Other Crops Sales
              </button>
            </div>
          </div>

          {/* BLOCK SECTION MAIN SUB-TAB */}
          {agronomySubTab === 'blocks' && (
            <>
              <div className="flex justify-between items-center bg-white/40 px-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">Plots & Silage Fields Registry</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadFieldsCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-950 hover:bg-emerald-100 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Fields Directory CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('fields')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download Fields PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-850 active:scale-95 transition-all flex items-center gap-1.5 m-0"
                  >
                    <Plus size={14} /> Registered Block
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleFieldSubmit} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-md space-y-4 font-sans text-left">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-black text-emerald-900 uppercase">Register New Crop/Pasture Block</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Define core agronomic properties and environmental variables</p>
                  </div>

                  {/* Section A: Core Metrics */}
                  <div className="space-y-2">
                    <h6 className="text-[9px] font-black tracking-wider text-slate-400 uppercase">1. Block Identity & Crop Speciation</h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block / Section Name</label>
                        <input
                          type="text"
                          required
                          value={fBlock}
                          onChange={(e) => setFBlock(e.target.value)}
                          placeholder="E.g. Valley pasture E-2"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Crop / Pasture Species</label>
                        <input
                          type="text"
                          required
                          value={fCrop}
                          onChange={(e) => setFCrop(e.target.value)}
                          placeholder="E.g. Boma Rhodes"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Acreage (Acres)</label>
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="0.1"
                          value={fAcres}
                          onChange={(e) => setFAcres(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="Area size"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Agronomy Status</label>
                        <select
                          value={fStatus}
                          onChange={(e) => setFStatus(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-705 cursor-pointer text-slate-600 font-bold"
                        >
                          <option value="Prepared">Coarse Prepared</option>
                          <option value="Sown">Sown / Planted</option>
                          <option value="Growing">Vegetative Growing</option>
                          <option value="Harvested">Culled / Harvested</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Agronomic Parameters */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h6 className="text-[9px] font-black tracking-wider text-slate-400 uppercase">2. Agronomic & Soil Vitals</h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Soil pH value</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="14"
                          value={fSoilPh}
                          onChange={(e) => setFSoilPh(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="E.g. 6.5"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Last Fertilizer Application</label>
                        <input
                          type="date"
                          value={fLastFert}
                          onChange={(e) => setFLastFert(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Projected Yield Volume</label>
                        <input
                          type="text"
                          value={fProjectedHarvest}
                          onChange={(e) => setFProjectedHarvest(e.target.value)}
                          placeholder="E.g. 150 Bales, 2.5 Tons"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Irrigation Rig System</label>
                        <select
                          value={fIrrigation}
                          onChange={(e) => setFIrrigation(e.target.value as any)}
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold text-slate-705 cursor-pointer"
                        >
                          <option value="Rainfed">Rain-Fed Only</option>
                          <option value="Drip">Drip Irrigation</option>
                          <option value="Overhead">Overhead Pivot/Sprinkler</option>
                          <option value="Manual">Manual Hand Watering</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Timeline Backdating */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h6 className="text-[9px] font-black tracking-wider text-slate-400 uppercase">3. Timeline Settings & Backdating</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-indigo-755 uppercase block mb-1">Date Seed Sown / Planted</label>
                        <input
                          type="date"
                          value={fDatePlanted}
                          onChange={(e) => setFDatePlanted(e.target.value)}
                          className="text-xs border border-indigo-205 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Record Registry Date (Historical log support)</label>
                        <input
                          type="date"
                          value={fDateLogged}
                          onChange={(e) => setFDateLogged(e.target.value)}
                          className="text-xs border border-amber-205 bg-amber-50/10 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observation Log Details</label>
                    <textarea
                      value={fNotes}
                      onChange={(e) => setFNotes(e.target.value)}
                      placeholder="E.g. Superb leaf ratio, rain-fed responding..."
                      rows={2}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 transition-all text-white font-black text-xs uppercase rounded-lg m-0 shadow">
                      Commit Plot Record
                    </button>
                  </div>
                </form>
              )}

              {/* INTERACTIVE SPATIAL GRID MAP MODULE */}
              {fields.length > 0 && (
                <div className="bg-slate-900 border border-slate-950 text-slate-100 p-6 rounded-3xl shadow-xl space-y-6">
                  {/* Map Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                        <Compass className="animate-spin-slow text-emerald-400 animate-pulse" size={18} />
                      </div>
                      <div className="text-left">
                        <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400">Map Layout & IoT Multi-Spectral Sensor Feed</h5>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Real-time soil & vegetation indices from simulated IoT telemetry nodes</p>
                      </div>
                    </div>
                    {/* Micro advisory pills */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400">
                        ☀️ 24°C Sunny
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-teal-400 font-bold">💧 RH: 65%</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-400">Wind: 11 km/h</span>
                    </div>
                  </div>

                  {/* Layout Grid columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* The Visual Paddock Grid (Col-Span 7) */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981] block">1. Farm Area Layout & Coordinates Map</span>
                        <p className="text-[11px] text-slate-300">
                          Select any grid coordinate paddock block to execute a multi-spectral sensor sweep. Move slider/filters below or isolate records using the interactive filter latch toggle.
                        </p>
                      </div>

                      {/* Map Matrix Board */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {fields.map((f, idx) => {
                          const isActive = selectedMapFieldId === f.id || (!selectedMapFieldId && idx === 0);
                          
                          // Determine color gradients by crop name key matches
                          let colorGrad = 'from-emerald-800 to-teal-950 shadow-emerald-950/20'; // Default Tea
                          if (f.cropType.toLowerCase().includes('tea')) {
                            colorGrad = 'from-emerald-600 to-teal-900 border-emerald-500/20 shadow-emerald-950/30';
                          } else if (f.cropType.toLowerCase().includes('napier') || f.cropType.toLowerCase().includes('grass') || f.cropType.toLowerCase().includes('pasture')) {
                            colorGrad = 'from-lime-600 to-emerald-850 border-lime-600/20 shadow-lime-950/30';
                          } else if (f.cropType.toLowerCase().includes('gum') || f.cropType.toLowerCase().includes('eucalyptus')) {
                            colorGrad = 'from-slate-700 to-emerald-950 border-slate-600/20 shadow-slate-950/30';
                          } else if (f.cropType.toLowerCase().includes('avocado')) {
                            colorGrad = 'from-green-700 to-slate-900 border-green-600/20 shadow-green-950/30';
                          } else if (f.cropType.toLowerCase().includes('maize') || f.cropType.toLowerCase().includes('sorghum') || f.cropType.toLowerCase().includes('corn')) {
                            colorGrad = 'from-yellow-700 to-amber-950 border-amber-600/20 shadow-amber-950/30';
                          }

                          // Soil moisture warning pulse
                          const isDry = f.irrigationMethod === 'None' || (!f.irrigationMethod && idx === 2);

                          return (
                            <button
                              key={f.id}
                              onClick={() => setSelectedMapFieldId(f.id)}
                              type="button"
                              className={`p-3.5 rounded-2xl border text-left transition-all overflow-hidden flex flex-col justify-between relative group shadow-lg m-0 ${
                                isActive 
                                  ? 'bg-gradient-to-br ring-2 ring-emerald-400 scale-[1.03] border-emerald-400' 
                                  : 'bg-gradient-to-br hover:scale-[1.015] border-transparent hover:border-slate-600 cursor-pointer'
                              } ${colorGrad}`}
                              style={{ minHeight: '105px' }}
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-[9px] font-black bg-slate-950/40 text-slate-100 px-2 py-0.5 rounded font-mono uppercase">
                                  {f.acreage} Ac
                                </span>
                                {/* Pulsing satellite beacon */}
                                <span className="flex h-2 w-2 relative">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDry ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isDry ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                </span>
                              </div>

                              <div className="mt-4 z-10 text-left">
                                <span className="text-[10px] font-black tracking-wide block uppercase text-slate-100 leading-tight">
                                  {f.blockName}
                                </span>
                                <span className="text-[9px] font-semibold text-emerald-305 text-emerald-300 block mt-0.5 truncate uppercase">
                                  {f.cropType}
                                </span>
                              </div>

                              {/* Corner graphic grid coordinate identifier */}
                              <span className="absolute -bottom-1 -right-1 text-slate-100/10 font-black text-2xl font-mono select-none group-hover:text-slate-100/20 transition-all pointer-events-none">
                                G-{idx + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Filter stats latch row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 border border-slate-800 p-3 rounded-2xl gap-3">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] font-mono tracking-wider font-extrabold block text-slate-400 uppercase">Interactive Map Filtering Filter Loop</span>
                          <p className="text-[10.5px] text-slate-300 font-medium">
                            {mapFilterActive 
                              ? "Isolate records mode active! The lists below are filtered to the selected block." 
                              : "Map focus active. Filter loop disabled (showing all registry records below)."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMapFilterActive(!mapFilterActive)}
                          className={`px-4 py-2 border rounded-xl text-[10px] uppercase tracking-wider font-back font-mono transition-all m-0 shadow-md ${
                            mapFilterActive 
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-emerald-400' 
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 font-bold'
                          }`}
                        >
                          {mapFilterActive ? "⚡ Filter Isolate On" : "🔌 Enable Isolation"}
                        </button>
                      </div>
                    </div>

                    {/* Sensor stats telemetry board (Col-Span 5) */}
                    <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      {(() => {
                        const activeField = fields.find(f => f.id === selectedMapFieldId) || fields[0] || null;
                        if (!activeField) return null;

                        // Mock math derived from core fields to be robust and interactive
                        const mockPH = activeField.soilPh || 6.2;
                        const hasDrip = activeField.irrigationMethod === 'Drip' || activeField.irrigationMethod === 'Overhead';
                        const mockMoisture = hasDrip ? 68 : (activeField.status === 'Prepared' ? 44 : 41);
                        
                        // Crop health NDVI coefficient
                        let mockNdvi = 0.78;
                        if (activeField.status === 'Harvested') mockNdvi = 0.24;
                        else if (activeField.status === 'Prepared') mockNdvi = 0.16;
                        else if (activeField.status === 'Sown') mockNdvi = 0.38;
                        else if (activeField.cropType.toLowerCase().includes('tea')) mockNdvi = 0.82;
                        else if (activeField.cropType.toLowerCase().includes('avocado')) mockNdvi = 0.84;
                        
                        const nitrogen = (mockPH * 16.5).toFixed(0);
                        const phosphorus = (mockPH * 6.8).toFixed(0);
                        const potassium = (mockPH * 28).toFixed(0);

                        return (
                          <>
                            <div className="space-y-3">
                              {/* Header Title active panel */}
                              <div className="border-b border-slate-800 pb-3 text-left animate-fadeIn">
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase inline-block">
                                  IoT Diagnostics Panel
                                </span>
                                <h6 className="font-extrabold text-sm text-slate-100 uppercase mt-1.5">{activeField.blockName}</h6>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-mono">NODE-ID: {activeField.id.toUpperCase()}</p>
                              </div>

                              {/* Gauges stats grid */}
                              <div className="space-y-3.5 text-left">
                                {/* NDVI Health meter slider bar */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-400 font-black uppercase">Multi-spectral (NDVI) index</span>
                                    <span className={`font-black ${mockNdvi > 0.6 ? 'text-emerald-400' : 'text-amber-400'}`}>{mockNdvi.toFixed(2)}</span>
                                  </div>
                                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${mockNdvi > 0.6 ? 'bg-emerald-550 bg-emerald-500' : 'bg-amber-500'}`} 
                                      style={{ width: `${mockNdvi * 100}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-medium font-sans">
                                    {mockNdvi > 0.6 
                                      ? "🟢 Robust optical chlorophyll reflection. Crop canopy vegetative health excellent." 
                                      : "🟡 Mid-range foliage canopy exposure. Routine agronomy inputs recommended."}
                                  </p>
                                </div>

                                {/* Soil moisture telemetry bar slider */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-400 font-black uppercase">Soil moisture content</span>
                                    <span className="font-black text-blue-400">{mockMoisture}% Vol</span>
                                  </div>
                                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                      style={{ width: `${mockMoisture}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between text-[8px] text-slate-400 uppercase font-bold tracking-wider pt-0.5">
                                    <span>Dry (0%)</span>
                                    <span>Optimal (50%-80%)</span>
                                    <span>Saturated (100%)</span>
                                  </div>
                                </div>

                                {/* Soil chemistry stats */}
                                <div className="grid grid-cols-3 gap-2 py-1 pt-2 border-t border-slate-800">
                                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center">
                                    <span className="text-[7.5px] uppercase font-black text-slate-400 block tracking-wider">Nitrogen (N)</span>
                                    <span className="text-xs font-black text-emerald-305 text-emerald-300 font-mono block mt-0.5">{nitrogen} ppm</span>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center">
                                    <span className="text-[7.5px] uppercase font-black text-slate-400 block tracking-wider">Phosphorous (P)</span>
                                    <span className="text-xs font-black text-lime-305 text-lime-300 font-mono block mt-0.5">{phosphorus} ppm</span>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center">
                                    <span className="text-[7.5px] uppercase font-black text-slate-400 block tracking-wider">Potassium (K)</span>
                                    <span className="text-xs font-black text-sky-305 text-sky-305 text-sky-300 font-mono block mt-0.5">{potassium} ppm</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Sensor state health summary cards footer */}
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-[10.5px] leading-relaxed text-slate-300">
                              <div className="flex justify-between items-center mb-1 text-[8.5px] uppercase font-black tracking-wider text-slate-400 font-mono">
                                <span>Soil Temp</span>
                                <span>Soil PH</span>
                                <span>Projected Yield</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-black font-mono tracking-wider">
                                <span className="text-amber-200">21.8 °C</span>
                                <span className="text-emerald-300">{mockPH} pH</span>
                                <span className="text-white truncate max-w-[100px]" title={activeField.projectedHarvestVolume || "N/A"}>
                                  {activeField.projectedHarvestVolume || "N/A"}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(mapFilterActive && selectedMapFieldId
                  ? fields.filter(f => f.id === selectedMapFieldId)
                  : fields
                ).map((fld) => (
                  <div key={fld.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-extrabold text-[#0b251a] text-sm uppercase">{fld.blockName}</h5>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 mt-1 border rounded font-black inline-block uppercase">
                          {fld.cropType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase border px-2 py-1 rounded ${
                          fld.status === 'Growing' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {fld.status}
                        </span>
                        {onEditField && (
                          <button
                            onClick={() => setEditingField(fld)}
                            className="text-slate-300 hover:text-indigo-850 p-1 rounded transition-colors cursor-pointer m-0 border border-transparent hover:border-slate-100"
                            title="Edit Block"
                          >
                            <PenSquare size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteFields(fld.id)}
                          className="text-slate-300 hover:text-red-650 p-1 rounded transition-colors cursor-pointer m-0 border border-transparent hover:border-red-50"
                          title="Delete Block"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Section Size</span>
                        <span className="font-black font-mono text-slate-750">{fld.acreage} Acres</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Date</span>
                        <span className="font-semibold font-mono text-slate-405">{fld.date}</span>
                      </div>
                    </div>

                    {/* New Agronomic Highlights */}
                    {(fld.soilPh !== undefined || fld.lastFertilizerDate || fld.projectedHarvestVolume || fld.irrigationMethod || fld.datePlanted) && (
                      <div className="p-2.5 bg-emerald-50/20 border border-emerald-100/60 rounded-xl space-y-1.5 text-[11px] font-bold text-slate-700 text-left">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {fld.soilPh !== undefined && (
                            <span className="text-emerald-900 block">
                              🩸 Soil pH: <b className="font-mono bg-emerald-50 px-1 rounded">{fld.soilPh}</b>
                            </span>
                          )}
                          {fld.irrigationMethod && (
                            <span className="text-blue-900 block">
                              💧 Irrigation: <b className="bg-blue-50 px-1 rounded">{fld.irrigationMethod}</b>
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5 text-slate-500 font-semibold font-mono text-[10px]">
                          {fld.datePlanted && <p>🌱 Sowing Date: {fld.datePlanted}</p>}
                          {fld.lastFertilizerDate && <p>🪱 Fertilizer: {fld.lastFertilizerDate}</p>}
                          {fld.projectedHarvestVolume && <p>🔮 Projected: <b className="text-slate-800 font-bold">{fld.projectedHarvestVolume}</b></p>}
                        </div>
                      </div>
                    )}

                    <p className="border-t border-slate-50 pt-3 text-xs font-medium text-slate-500 italic">
                      "{fld.notes}"
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SILAGE PRESERVATION & PASTURE CARRY CAPACITY ENGINE */}
          {agronomySubTab === 'silage' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Introduction Banner */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl space-y-2 border border-slate-800">
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded uppercase">Agronomy Hub</span>
                <h4 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>🌾 Forage Conservation & Grazing Allocator</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-medium">
                  Establish food reserves for dry dry-seasons. Conserve raw green biomass through anaerobic fermentation (silage making) and calculate sustainable paddocking periods for Boma Rhodes hay.
                </p>
              </div>

              {/* BOMA RHODES CALCULATOR & EXPEDIENT */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 rounded-3xl border border-amber-200/60 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>👑 BOMA RHODES CARRY CAPACITY CALCULATOR</span>
                    </h5>
                    <p className="text-slate-500 text-[11px] font-bold uppercase mt-1">Acres to sustain herd days equivalent</p>
                  </div>
                  <div className="bg-amber-100 text-amber-950 px-3 py-1.5 rounded-xl text-[10.5px] font-extrabold tracking-tight uppercase">
                    Pasture dry matter standard yield
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Inputs */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h6 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Calculator parameters</h6>
                    
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Rhodes Pasture Area: <span className="font-mono text-slate-900 font-extrabold">{rhodesAcres} Acres</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="25"
                        step="0.5"
                        value={rhodesAcres}
                        onChange={(e) => setRhodesAcres(parseFloat(e.target.value))}
                        className="w-full accent-amber-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium">1 Acre yields ~250 bales (4,500kg Dry Matter) per season.</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Animals count: <span className="font-mono text-slate-900 font-extrabold">{rhodesAnimalsCount} Head</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="80"
                        step="1"
                        value={rhodesAnimalsCount}
                        onChange={(e) => setRhodesAnimalsCount(parseInt(e.target.value))}
                        className="w-full accent-amber-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Daily Forage Intake per head: <span className="font-mono text-slate-900 font-extrabold">{rhodesCustomDailyIntake} KG Dry Matter</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="1"
                        value={rhodesCustomDailyIntake}
                        onChange={(e) => setRhodesCustomDailyIntake(parseInt(e.target.value))}
                        className="w-full accent-amber-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 font-medium italic block mt-1">Cows consume ~2.5% of body weight in dry matter Daily.</span>
                    </div>
                  </div>

                  {/* Middle & Right: Outputs */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black text-amber-800 uppercase block mb-1">Projected Pasture Yield</span>
                        <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {Math.round(rhodesAcres * 250).toLocaleString()} <span className="text-xs text-slate-400 font-bold">bales</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-2 font-medium">
                          Equal to approximately <strong>{Math.round(rhodesAcres * 4500).toLocaleString()} KG</strong> of premium Boma Rhodes digestible Dry Matter forage biomass per season.
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-[9.5px] uppercase font-black text-amber-900 block mb-0.5">Value Equivalent</span>
                        <span className="text-xs font-mono font-bold text-slate-800">
                          Ksh {Math.round(rhodesAcres * 250 * 350).toLocaleString()} <span className="text-[9px] text-slate-400 font-bold font-sans uppercase">(@ Ksh 350/bale)</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-[9.5px] font-black text-amber-400 uppercase">HERD FEED LIFE-SPAN</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase">Computed</span>
                        </div>
                        
                        <div className="mt-4">
                          <span className="text-[10.5px] text-slate-300 font-medium block">Will feed {rhodesAnimalsCount} animal(s) for:</span>
                          <div className="text-4xl font-black text-amber-400 font-mono tracking-tight my-1">
                            {Math.round((rhodesAcres * 4500) / (rhodesAnimalsCount * rhodesCustomDailyIntake))} <span className="text-sm font-bold text-slate-300">Days</span>
                          </div>
                          <span className="text-[10.5px] text-slate-400 mt-0.5 inline-block font-bold">
                            (~ {((rhodesAcres * 4500) / (rhodesAnimalsCount * rhodesCustomDailyIntake) / 30.4).toFixed(1)} Months)
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800 text-[10.5px] text-slate-300 leading-tight">
                        <strong>Rhodes Guideline:</strong> Ensure harvesting at early bloom stage (10% flowering) for peak crude protein levels (~8-10% CP). Delay reduces protein content severely!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SILAGE TRACKING SYSTEM */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>🌽 ACTIVE SILAGE PRESERVATION REGISTER</span>
                    </h5>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Fermentation logs, opening dates, and quality notes</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSilShowAdd(!silShowAdd)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all m-0 cursor-pointer shadow"
                    >
                      <Plus size={14} />
                      Log Silage Batch
                    </button>
                    {onTriggerSectionReport && (
                      <button
                        onClick={() => onTriggerSectionReport('silage')}
                        className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 rounded-xl font-bold text-xs uppercase cursor-pointer m-0 font-bold shadow-md"
                        title="Download Silage PDF Report"
                      >
                        <Download size={13} />
                        Download PDF Report
                      </button>
                    )}
                  </div>
                </div>

                {/* ADD SILAGE FORM */}
                {silShowAdd && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const weight = silAcres * 18000;
                      const dailyRate = silAverageWeight * 0.03; // as-fed 3% weight daily silage
                      const lifespan = dailyRate > 0 && silAnimalsCount > 0 ? weight / (silAnimalsCount * dailyRate) : 0;

                      const newRec: SilageRecord = {
                        id: `sil-${Math.floor(1000 + Math.random() * 9000).toString()}`,
                        rawMaterial: silRaw,
                        acres: silAcres,
                        calculatedWeightKg: weight,
                        dateMade: silDateMade,
                        dateOpened: silDateOpened || undefined,
                        quality: silQuality,
                        notes: silNotes,
                        animalsFedCount: silAnimalsCount,
                        averageAnimalWeightKg: silAverageWeight,
                        recommendedDailyIntakePerAnimal: parseFloat(dailyRate.toFixed(1)),
                        daysOfFeedAvailable: Math.round(lifespan)
                      };

                      if (onAddSilage) {
                        onAddSilage(newRec);
                        setSilShowAdd(false);
                        setSilNotes('');
                        setSilDateOpened('');
                      }
                    }}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="md:col-span-3">
                      <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">🌽 PRE-FILL ESTIMATION ENGINE</span>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Define inputs to calculate yield weight autonomously</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Raw Material Crop Type</label>
                      <select
                        value={silRaw}
                        onChange={(e) => setSilRaw(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      >
                        <option value="Maize">Maize Crop (Grain dent stage)</option>
                        <option value="Sorghum">High-Energy Sugar Sorghum</option>
                        <option value="Napier Grass">Napier Grass (pre-headed)</option>
                        <option value="Boma Rhodes">Boma Rhodes green-harvest</option>
                        <option value="Other">Other Mixed Legumes/Vines</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Harvested Land Area (Acres): <strong className="font-mono text-slate-800 font-extrabold">{silAcres}</strong>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={silAcres}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSilAcres(val);
                          setSilWeight(val * 18000);
                        }}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Autocalculated Silage Weight (KG)
                      </label>
                      <input
                        type="number"
                        disabled
                        value={silAcres * 18000}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">Estimated @ standard 18,000 KG (18 Tons) per Acre</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Ensiled (Date Made)</label>
                      <input
                        type="date"
                        required
                        value={silDateMade}
                        onChange={(e) => setSilDateMade(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Opened (Optional)</label>
                      <input
                        type="date"
                        value={silDateOpened}
                        onChange={(e) => setSilDateOpened(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Anaerobic Quality Assessment</label>
                      <select
                        value={silQuality}
                        onChange={(e) => setSilQuality(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      >
                        <option value="Excellent (Golden yellow, lactic acid smell)">Excellent (Sweet lactic scent, pH ~3.8-4.2)</option>
                        <option value="Good (Slightly acidic brown)">Good (Acidic scent, minor run-off loss)</option>
                        <option value="Fair (Slight butyric content)">Fair (Strong pungent odour, usable)</option>
                        <option value="Spoiled (Mouldy, rancid smell)">Spoiled (Toxic yeast growths, toxic for herd)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Feeding Animals Count</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={silAnimalsCount}
                        onChange={(e) => setSilAnimalsCount(parseInt(e.target.value) || 0)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Average Animal Weight (KG): <strong className="font-mono text-emerald-800">{silAverageWeight} kg</strong>
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="800"
                        step="10"
                        value={silAverageWeight}
                        onChange={(e) => setSilAverageWeight(parseInt(e.target.value))}
                        className="w-full accent-emerald-800 h-2 bg-slate-200 rounded-lg cursor-pointer mt-3"
                      />
                    </div>

                    <div className="bg-emerald-100/65 border border-emerald-200/80 p-3.5 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] font-black text-emerald-950 uppercase">Veterinary Recommendation</span>
                      <p className="text-[10.5px] text-slate-700 leading-tight">
                        Cattle weight requires approx <strong>{(silAverageWeight * 0.03).toFixed(1)} KG</strong> fresh silage per head daily to support lactating maintenance.
                      </p>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Compaction, Seal details & Quality notes</label>
                      <textarea
                        rows={2}
                        value={silNotes}
                        onChange={(e) => setSilNotes(e.target.value)}
                        placeholder="E.g. Compaction was rigorous using tractor. Ensilage film of 1.2 mil and sandbags on top."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => setSilShowAdd(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold uppercase transition-all shadow-xs cursor-pointer m-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase transition-all shadow cursor-pointer m-0"
                      >
                        Save Conservation Log
                      </button>
                    </div>
                  </form>
                )}

                {/* SILAGE LOGS RENDERED */}
                <div className="grid grid-cols-1 gap-4">
                  {silageRecords.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold uppercase text-[10.5px]">
                      No conserved silage batches recorded yet.
                    </div>
                  ) : (
                    silageRecords.map((item, idx) => {
                      const computedDays = Math.round(item.calculatedWeightKg / (item.animalsFedCount * item.recommendedDailyIntakePerAnimal));
                      const isDanger = computedDays < 30;

                      return (
                        <div key={item.id} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/20 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono bg-indigo-900 text-white text-[10px] px-2.5 py-0.5 rounded font-black uppercase">
                                {item.id}
                              </span>
                              <span className="text-sm font-black text-slate-900">
                                {item.rawMaterial} Conserved Silage ({item.acres} Acres)
                              </span>
                              <span className="text-[9px] bg-slate-200/95 font-mono text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                                Made: {item.dateMade}
                              </span>
                              {item.dateOpened && (
                                <span className="text-[9px] bg-green-100 font-mono text-green-950 px-2 py-0.5 rounded font-bold uppercase">
                                  Opened: {item.dateOpened}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Conserved Forage</span>
                                <span className="text-sm font-mono font-extrabold text-slate-800">
                                  {item.calculatedWeightKg.toLocaleString()} KG
                                </span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Feeding Animals</span>
                                <span className="text-sm font-mono font-extrabold text-[#111]">
                                  {item.animalsFedCount} Cows
                                </span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Rec. Daily Intake</span>
                                <span className="text-sm font-mono font-extrabold text-[#111]">
                                  {item.recommendedDailyIntakePerAnimal} KG
                                </span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Assessed Quality</span>
                                <span className="text-[10px] font-bold text-emerald-800 block truncate">
                                  {item.quality}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium italic pt-1 leading-snug">
                              " {item.notes} "
                            </p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/60 shrink-0">
                            <div className="text-left md:text-right">
                              <span className="text-[9.5px] font-black text-slate-400 block uppercase">FEED LIFESPAN LEFT</span>
                              <div className={`text-2xl font-black font-mono tracking-tight ${isDanger ? 'text-rose-600' : 'text-slate-900'}`}>
                                {computedDays} <span className="text-xs font-bold text-slate-500">Days</span>
                              </div>
                              <span className="text-[8.5px] uppercase font-bold text-slate-400">
                                (~ {(computedDays / 30.4).toFixed(1)} months ration)
                              </span>
                            </div>

                            <div className="flex gap-1">
                              {onDeleteSilage && (
                                <button
                                  onClick={() => onDeleteSilage(item.id)}
                                  className="text-slate-300 hover:text-red-700 p-2.5 rounded-lg border hover:border-red-100/80 bg-white shadow-xs cursor-pointer m-0 transition-colors"
                                  title="Delete batch"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {agronomySubTab === 'crop_ops' && (
            <div className="space-y-6">
              {/* Static Crop agronomy guidelines container */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl space-y-4 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-yellow-400 animate-pulse shrink-0" />
                  <h5 className="text-xs uppercase font-black tracking-wider text-yellow-400">NYARONDE AGRONOMY & EXTENSION PROTOCOLS (KEPHIS APPROVED)</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <span className="font-extrabold text-white block">🍌 Bananas Guide</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Maintain a 3-stem density (1 sucker, 1 maiden, 1 bearer). Mulch 15cm thick away from core corm. Apply 30kg organic manure per year. Prop heavy bunches with bamboo forks.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <span className="font-extrabold text-white block">🥬 Vegetables Guide</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Sow sukuma wiki (kale) in nursery beds for 21 days. Transplant at rain onset with NPK 17:17:17. Secure stakes for tomato branches. Prune bottom leaves to deter blight.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <span className="font-extrabold text-white block">🌽 Maize Guide</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Till to rough-tilth. Plant at 75cm x 25cm. Weed at 3-leaf stage. Apply CAN topdressing at 45cm (knee height) during morning rains. Dry cobs on solar tarps to &lt;13.5% moisture.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <span className="font-extrabold text-white block">🌾 Sorghum Guide</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Sow at 60cm shallow rows. Thin young plants to 15cm base spacing. Bird-scaring setup must operate starting from milky grain formation phase until hand-harvesting.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <span className="font-extrabold text-white block">🥑 Avocado Guide</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Graft Hass scions on solid landrace rootstocks. Apply protective Copper Fungicide spray. Harvest only when oil content exceeds 21% using clippers. Never pull fruit.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <span className="font-extrabold text-white block">🌱 Tea Guide</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Pluck two leaves and a bud on a 7-day loop. Maintain a flat plucking table at 24 inches. Prune biennially. Apply NPK 26:0:0 fertilizer after first heavy county rains.
                    </p>
                  </div>
                </div>
              </div>

              {/* Log new operations action row */}
              <div className="flex justify-between items-center bg-white/35 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase font-bold tracking-widest block">Active Operations Log ledger</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCropOpsCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-teal-50 border border-teal-200 text-teal-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Crop Operations CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('fields')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download Agronomy PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-850 flex items-center gap-1.5 m-0 cursor-pointer"
                  >
                    <Plus size={14} /> Log Crop Operation
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleCropOpSubmit} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-md space-y-4 font-sans text-left">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-emerald-900">Task Scheduling & Crop Operations Register</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Capture operational logistics, inputs, and cost centers</p>
                  </div>

                  {/* Section A: Core Task Info */}
                  <div className="space-y-2">
                    <h6 className="text-[9px] font-black tracking-wider text-slate-400 uppercase">1. Operational Parameters</h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Crop</label>
                        <select
                          value={coCrop}
                          onChange={(e) => setCoCrop(e.target.value as any)}
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                        >
                          <option value="Tea">Tea</option>
                          <option value="Avocado">Avocado</option>
                          <option value="Banana">Bananas</option>
                          <option value="Vegetables">Vegetables (Kales/Tomato)</option>
                          <option value="Sorghum">Sorghum</option>
                          <option value="Maize">Maize (Seed/Corn)</option>
                          <option value="Boma Rhodes">Boma Rhodes🌾</option>
                          <option value="Beans">Beans 🫘</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Title</label>
                        <input
                          type="text"
                          required
                          value={coOperationName}
                          onChange={(e) => setCoOperationName(e.target.value)}
                          placeholder="E.g. De-suckering secondary stems"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Logged / Schedule</label>
                        <input
                          type="date"
                          required
                          value={coDate}
                          onChange={(e) => setCoDate(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Execution Operator</label>
                        <select
                          value={coStaff}
                          onChange={(e) => setCoStaff(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                        >
                          {staffList.map(st => (
                            <option key={st.id} value={st.name}>{st.name} ({st.unit})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Inputs & Costing */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h6 className="text-[9px] font-black tracking-wider text-slate-400 uppercase">2. Resource Consumption & Material Inputs</h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inputs Used / Sown</label>
                        <input
                          type="text"
                          value={coInputsUsed}
                          onChange={(e) => setCoInputsUsed(e.target.value)}
                          placeholder="E.g. NPK 17:17:17, Bio-larvicide"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Input Quantity Consumed</label>
                        <input
                          type="text"
                          value={coInputQuantityUsed}
                          onChange={(e) => setCoInputQuantityUsed(e.target.value)}
                          placeholder="E.g. 50 kg, 2.5 Litres"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Machinery / Equipment Used</label>
                        <input
                          type="text"
                          value={coEquipmentUsed}
                          onChange={(e) => setCoEquipmentUsed(e.target.value)}
                          placeholder="E.g. Solo Spray Pump, Jembe, Tractor"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Cost (Ksh)</label>
                        <input
                          type="number"
                          value={coOperationCost}
                          onChange={(e) => setCoOperationCost(e.target.value === '' ? '' : parseInt(e.target.value))}
                          placeholder="E.g. 2500"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Agronomy details & instructions</label>
                    <textarea
                      value={coNotes}
                      onChange={(e) => setCoNotes(e.target.value)}
                      placeholder="E.g. Apply mulch around banana roots. Prop heavy stems with wooden forks."
                      rows={2}
                      className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 transition-all text-white font-black text-xs uppercase rounded-lg m-0 shadow">
                      Commit Task Record
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of logged operations */}
              <div className="space-y-4">
                {cropOps.map((op) => (
                  <div key={op.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all font-sans text-left">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                          {op.crop} Crop
                        </span>
                        <h6 className="font-extrabold text-sm text-[#0b251a] uppercase">{op.operationName}</h6>
                      </div>
                      
                      <p className="text-xs text-slate-500 font-medium">Instructions & Diagnostics: <span className="font-semibold text-slate-700 italic">"{op.notes}"</span></p>

                      {/* Operations Expanded Parameters Metadata badge */}
                      {(op.inputsUsed || op.equipmentUsed || op.operationCost !== undefined) && (
                        <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[11px] font-bold text-slate-600">
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {op.inputsUsed && (
                              <span>💊 Inputs: <b className="text-slate-800 font-black">{op.inputsUsed}</b> {op.inputQuantityUsed ? `(${op.inputQuantityUsed})` : ''}</span>
                            )}
                            {op.equipmentUsed && (
                              <span>🛠️ Machine/Tools: <b className="text-slate-800 font-black">{op.equipmentUsed}</b></span>
                            )}
                          </div>
                          {op.operationCost !== undefined && (
                            <div className="text-red-700 text-[10px] font-mono tracking-wider font-extrabold uppercase pt-0.5 border-t border-slate-200/60 w-fit">
                              💰 Cost Applied: Ksh {op.operationCost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><User size={11} className="text-slate-405" /> Caregiver Assigned: {op.completedBy || 'Charles'}</span>
                        <span className="text-slate-200">•</span>
                        <span className="flex items-center gap-1"><Calendar size={11} /> Scheduled Date: {op.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Task Status</span>
                        <select
                          value={op.status}
                          onChange={(e) => onUpdateCropOpStatus(op.id, e.target.value as any)}
                          className={`text-[10px] font-black uppercase rounded border p-1 bg-white cursor-pointer ${
                            op.status === 'Completed' ? 'text-emerald-800 border-emerald-250 bg-emerald-50/50' :
                            op.status === 'In-Progress' ? 'text-amber-800 border-amber-200 bg-amber-50/50' : 'text-slate-500 border-slate-250'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In-Progress">In-Progress</option>
                          <option value="Completed">✓ Completed</option>
                        </select>
                      </div>
                      {onEditCropOp && (
                        <button
                          onClick={() => setEditingCropOp(op)}
                          className="text-slate-300 hover:text-indigo-805 p-2 border border-slate-100 rounded-xl hover:border-indigo-50 hover:bg-slate-50 cursor-pointer"
                          title="Edit Operations record"
                        >
                          <PenSquare size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteCropOp(op.id)}
                        className="text-slate-300 hover:text-red-600 p-2 border border-slate-100 rounded-xl hover:border-red-50 hover:bg-slate-50 cursor-pointer"
                        title="Delete Operations record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agronomySubTab === 'sales' && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl">
                    <BadgePercent size={22} className="text-emerald-800" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest leading-none">Total Local Crops Sales</span>
                    <h4 className="text-xl font-black font-mono text-emerald-800 mt-1">
                      Ksh {cropSales.reduce((sum, cs) => sum + cs.totalSales, 0).toLocaleString()}
                    </h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-800 rounded-2xl">
                    <IconTrendingUp size={22} className="text-indigo-850" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest leading-none">Transactions Count</span>
                    <h4 className="text-xl font-black font-mono text-slate-800 mt-1">
                      {cropSales.length} trade{cropSales.length === 1 ? '' : 's'}
                    </h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl font-black text-lg px-2.5">
                    🌽
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest leading-none">Primary Commodities</span>
                    <h4 className="text-xs font-black text-slate-805 mt-1.5 uppercase">
                      Maize, Vegetables, Bananas
                    </h4>
                  </div>
                </div>
              </div>

              {/* Action row to Log New Sale */}
              <div className="flex justify-between items-center bg-white/35 px-2 font-bold">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Local Commodities Sales Ledger</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCropSalesCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-950 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Cash Crop Sales CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('cropSales')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download Crop Sales PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-850 flex items-center gap-1.5 m-0 font-bold font-sans"
                  >
                    <Plus size={14} /> Record Crop Sale
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleCropSaleSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4 animate-fadeIn">
                  <h5 className="text-xs uppercase font-black tracking-widest text-[#0e3a24] border-b border-slate-100 pb-2">Log New Local Sales Invoice</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Select Crop</label>
                      <select
                        value={csCrop}
                        onChange={(e) => setCsCrop(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold text-slate-705"
                      >
                        <option value="Banana">Bananas 🍌</option>
                        <option value="Vegetables">Vegetables 🥬</option>
                        <option value="Maize">Maize (Seed/Corn) 🌽</option>
                        <option value="Sorghum">Sorghum 🌾</option>
                        <option value="Napier">Napier Grass 🌱</option>
                        <option value="Boma Rhodes">Boma Rhodes 🌾</option>
                        <option value="Eucalyptus">Eucalyptus Logs 🌲</option>
                        <option value="Beans">Beans 🫘</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Invoice / Receipt Ref</label>
                      <input
                        type="text"
                        required
                        value={csRef}
                        onChange={(e) => setCsRef(e.target.value)}
                        placeholder="E.g. NYM-B-082"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Quantity Sold</label>
                      <input
                        type="number"
                        required
                        min="0.1"
                        step="0.1"
                        value={csQty}
                        onChange={(e) => setCsQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="E.g. 15"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Unit of Measurement</label>
                      <input
                        type="text"
                        required
                        value={csUnit}
                        onChange={(e) => setCsUnit(e.target.value)}
                        placeholder="E.g. bunches, bags, crates"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Price per Unit (Ksh)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={csPricePerUnit}
                        onChange={(e) => setCsPricePerUnit(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="E.g. 1200"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Primary Buyer / Merchant</label>
                      <input
                        type="text"
                        required
                        value={csBuyer}
                        onChange={(e) => setCsBuyer(e.target.value)}
                        placeholder="E.g. Nyamira Fresh Green Market"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold text-slate-800"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sale Date</label>
                      <input
                        type="date"
                        required
                        value={csDate}
                        onChange={(e) => setCsDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0 cursor-pointer hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0 hover:bg-emerald-900 shadow transition-all">
                      Record Sale & Post Income
                    </button>
                  </div>
                </form>
              )}

              {/* List of Sales */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150/70 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black text-slate-405 uppercase tracking-widest block font-mono">Trading Transaction Logs</span>
                  <span className="font-mono text-emerald-950 font-extrabold uppercase text-[10px]">Total posted: {cropSales.length} receipt{cropSales.length === 1 ? '' : 's'}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[9px] uppercase font-black text-slate-400">
                        <td className="p-3 font-semibold">Receipt Details</td>
                        <td className="p-3 font-semibold">Commodity Sold</td>
                        <td className="p-3 font-semibold text-right">Yield Quantity</td>
                        <td className="p-3 font-semibold text-right">Price Rate</td>
                        <td className="p-3 font-semibold text-right">Gross Income (Ksh)</td>
                        <td className="p-3 font-semibold text-center">Actions</td>
                      </tr>
                    </thead>
                    <tbody>
                      {cropSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No crop sales recorded yet. Post a sale above!</td>
                        </tr>
                      ) : (
                        [...cropSales].sort((a,b)=> b.date.localeCompare(a.date)).map((cs) => (
                          <tr key={cs.id} className="border-b border-slate-50 hover:bg-slate-50/20">
                            <td className="p-3">
                              <span className="font-extrabold text-slate-700 block text-xs">{cs.ref}</span>
                              <span className="block text-[9px] text-slate-450 font-mono">{cs.date}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{cs.crop}</span>
                              <span className="block text-[9px] text-[#2d6a4f] font-semibold truncate max-w-[200px]">Buyer: {cs.buyer}</span>
                            </td>
                            <td className="p-3 text-right font-mono font-black text-slate-800">
                              {cs.qty} <span className="text-[10px] font-extrabold text-slate-400 uppercase">{cs.unit}</span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-500 font-semibold">
                              Ksh {cs.pricePerUnit.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-mono font-black text-emerald-800">
                              Ksh {cs.totalSales.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              {onEditCropSale && (
                                <button
                                  onClick={() => setEditingCropSale(cs)}
                                  className="text-slate-300 hover:text-indigo-850 p-1.5 border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-lg transition-all m-0 inline-block cursor-pointer"
                                  title="Edit Sales Record"
                                >
                                  <PenSquare size={12} />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteCropSale(cs.id)}
                                className="text-slate-300 hover:text-red-650 p-1.5 border border-transparent hover:border-red-50 hover:bg-red-50/20 rounded-lg transition-all m-0 inline-block cursor-pointer"
                                title="Delete Sales Record"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. POULTRY, GOATS, CALVES, BSF PROTOCOLS & SECURITY DOGS */}
      {viewType === 'livestock' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#fff8e1] text-amber-950 rounded-xl shrink-0">
                <Heart size={24} className="text-amber-700" />
              </div>
              <div>
                <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">
                  {activeSubModule === 'goats' ? 'Caprine Dairy Goat Logs' :
                   activeSubModule === 'calves' ? 'Liquidfed Calf Pipelines' :
                   activeSubModule === 'heifers' ? 'Heifer Progeny Board' :
                   activeSubModule === 'poultry' ? 'Avian Poultry Hub' :
                   activeSubModule === 'canines' ? 'Security Canine Patrol Logs' :
                   activeSubModule === 'bsf' ? 'Organic BSF Protein Batches' :
                   activeSubModule === 'biogas' ? 'Sovereign Biogas Optimizer' :
                   'Diverse Livestock & BSF center'}
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  {activeSubModule === 'goats' ? 'Log and track goat milk weights, kidding cycles, breeds, and veterinary records.' :
                   activeSubModule === 'calves' ? 'Monitor daily liquid milk-fed amounts, growth milestones, health statuses, and weaning schedules.' :
                   activeSubModule === 'heifers' ? 'Manage heifer pedigree, growth rates, insemination schedules, and future progeny projections.' :
                   activeSubModule === 'poultry' ? 'Log and track poultry vaccine grids, daily egg collections, feed intakes, mortality, and flock batches.' :
                   activeSubModule === 'canines' ? 'Track guard canine checkups, Rabies & deworming vaccines, health parameters, and routine patrol schedules.' :
                   activeSubModule === 'bsf' ? 'Track organic waste-to-BSF feedstocks, batch weights, harvest milestones, and protein production logs.' :
                   activeSubModule === 'biogas' ? 'Optimize anaerobic digester slurry ratios, loader feeds, water additions, and pressure metrics.' :
                   'Log records for poultry vaccine grids, dairy goats, wet milk-fed calves, organic Black Soldier Fly protein bins, and guard dog boosters.'}
                </p>
              </div>
            </div>

            {/* Sub segments selector tabs */}
            {!activeSubModule && (
              <div className="flex bg-slate-100 p-1 rounded-xl border shrink-0 w-full md:w-auto overflow-x-auto gap-0.5">
                <button
                  onClick={() => { setLivestockSubTab('poultry'); setShowAddForm(false); }}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'poultry' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🐔 Poultry Hub (Chicks/Layers)
                </button>
                <button
                  onClick={() => { setLivestockSubTab('heifers'); setShowAddForm(false); }}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'heifers' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🐄 Heifers Board
                </button>
                <button
                  onClick={() => { setLivestockSubTab('quarantine'); setShowAddForm(false); }}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'quarantine' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🩺 Quarantine Isolation
                </button>
                <button
                  onClick={() => { setLivestockSubTab('poultry_dogs'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'poultry_dogs' ? 'bg-slate-200/50 text-slate-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🐶 Security Canines
                </button>
                <button
                  onClick={() => { setLivestockSubTab('goats'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'goats' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Dairy Goats
                </button>
                <button
                  onClick={() => { setLivestockSubTab('calves'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'calves' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Calf Section
                </button>
                <button
                  onClick={() => { setLivestockSubTab('bsf'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'bsf' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  BSF Protein
                </button>
                <button
                  onClick={() => { setLivestockSubTab('operations'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'operations' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Animal Operations Log
                </button>
                <button
                  onClick={() => { setLivestockSubTab('sales_mortality'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                    livestockSubTab === 'sales_mortality' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Sales & Mortality Ledger
                </button>
                <button
                  onClick={() => { setLivestockSubTab('biogas_optimizer'); setShowAddForm(false); }}
                  className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-indigo-950 ${
                    livestockSubTab === 'biogas_optimizer' ? 'bg-amber-500/20 text-amber-950 shadow-xs ring-1 ring-amber-400' : 'text-slate-505 hover:text-slate-850'
                  }`}
                >
                  🔥 Biogas Digester Loader
                </button>
              </div>
            )}
          </div>

          {/* NEW SUBTAB: ADVANCED POULTRY LIFECYCLE HUB & ADVISORY SYSTEM */}
          {livestockSubTab === 'poultry' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Educational Advisory Carousel / Tabs */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl space-y-4 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-sm uppercase">Veterinary Advisory</span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-1 rounded uppercase font-bold">Comprehensive Poultry Guide</span>
                </div>
                <h4 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>🐔 Nyaronde Poultry Cooperative & Layer Advisor</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] bg-emerald-900 text-emerald-100 px-2 py-0.5 rounded font-black uppercase">Cohort 1: Chicks (Day 1 - Week 8)</span>
                    <h5 className="text-sm font-bold text-white">Chops & Thermal Rearing</h5>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Maintain brooder temperatures at 30-32°C during Week 1, decreasing 2°C weekly. Feed <strong>Chick Starter Crumble</strong> (high-protein ~20% CP) up to 35-40g daily per chick. Vaccinate strictly: 
                      Day 7 (Newcastle), Day 14 (Gumboro/IBD), Day 24 (Gumboro booster).
                    </p>
                  </div>

                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] bg-amber-900 text-amber-100 px-2 py-0.5 rounded font-black uppercase">Cohort 2: Growers (Week 9 - Week 18)</span>
                    <h5 className="text-sm font-bold text-white">Weight Management & Deworming</h5>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Transition birds to <strong>Growers Mash</strong>. Aim for uniform weights of 1.3 - 1.6 KG by week 18. Overfeeding causes pelvic fat pads resulting in future prolapses; underfeeding retards egg laying start. Deworm at Week 14. Give Fowl Pox vaccine at Week 18.
                    </p>
                  </div>

                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] bg-indigo-900 text-indigo-100 px-2 py-0.5 rounded font-black uppercase">Cohort 3: Layers (Week 19+)</span>
                    <h5 className="text-sm font-bold text-white">Calcium Fortification & Grits</h5>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Feed <strong>Layers Mash</strong> containing at least 3.5% Calcium. Add free-choice oyster shell grits to reinforce shell thickness and egg size, especially for older layers. Maintain 16 hours of daily photo-stimulation (lighting) to sustain over 85% Hen-Day lay output.
                    </p>
                  </div>
                </div>
              </div>

              {/* BRAND NEW: INTERACTIVE POULTRY PERFORMANCE & MARGIN OPTIMIZER CARD */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl space-y-6 shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] bg-[#eab308] font-extrabold text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">Avian Feed Metric Evaluator</span>
                      <span className="text-[9.5px] bg-slate-800 text-slate-350 border border-slate-700 px-2 py-0.5 rounded uppercase font-bold">Interactive Hen-Day Performance Matrix</span>
                    </div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span>🐣 Interactive Layer Flock Performance & Profit Targeter</span>
                    </h4>
                    <p className="text-xs text-slate-305 text-slate-300 leading-relaxed max-w-2xl font-bold">
                      Optimize daily egg crates, track Feed Conversion Ratios (FCR), and model feed costs vs. egg wholesale revenues to maximize cash reserves.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Left: Interactive Input Sliders */}
                  <div className="md:col-span-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <span className="text-[10px] uppercase font-black text-yellow-400 tracking-wider">Input Parameter Model</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                          Laying Hens: <span className="font-mono text-yellow-400 font-extrabold">{calcPouCount} birds</span>
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="2000"
                          step="25"
                          value={calcPouCount}
                          onChange={(e) => setCalcPouCount(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                          Egg Crates/Day: <span className="font-mono text-yellow-400 font-extrabold">{calcPouEggCrates} Crates</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="60"
                          step="1"
                          value={calcPouEggCrates}
                          onChange={(e) => setCalcPouEggCrates(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[9.5px] font-black text-slate-400 uppercase block mb-0.5">Feed Bags/Day (50kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={calcPouFeedBags}
                          onChange={(e) => setCalcPouFeedBags(parseFloat(e.target.value) || 0)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 p-2 rounded-lg font-bold text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] font-black text-slate-400 uppercase block mb-0.5">Feed Cost / Bag</label>
                        <input
                          type="number"
                          value={calcPouFeedCostBag}
                          onChange={(e) => setCalcPouFeedCostBag(parseInt(e.target.value) || 0)}
                          className="text-xs w-full bg-slate-950 border border-slate-800 p-2 rounded-lg font-bold text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] font-black text-slate-400 uppercase block mb-0.5">Crate Price (Ksh)</label>
                        <input
                          type="number"
                          value={calcPouCratePrice}
                          onChange={(e) => setCalcPouCratePrice(parseInt(e.target.value) || 0)}
                          className="text-xs w-full bg-slate-950 border border-slate-800 p-2 rounded-lg font-bold text-white font-mono"
                        />
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-400 leading-snug">
                      💡 <em>Calculated dynamic feed allocation per bird is <strong>{((calcPouFeedBags * 50 * 1000) / calcPouCount).toFixed(0)} grams</strong> daily. (Target recommended: 110g - 120g).</em>
                    </p>
                  </div>

                  {/* Middle: Calculated Productivity Metrics */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Avian Health & Productivity KPIs</span>
                      
                      <div className="mt-4 space-y-3.5">
                        <div>
                          <span className="text-[9.5px] text-slate-450 text-slate-400 block uppercase font-bold">Hen-Day Laying Production</span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-2xl font-mono font-black text-white">
                              {((calcPouEggCrates * 30 / calcPouCount) * 100).toFixed(1)}%
                            </span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              (calcPouEggCrates * 30 / calcPouCount) * 100 >= 80 ? 'bg-emerald-500/10 text-emerald-355 text-emerald-450 font-bold' : 'bg-red-500/10 text-red-300'
                            }`}>
                              {((calcPouEggCrates * 30 / calcPouCount) * 100) >= 80 ? 'Peak Output' : 'Needs Review'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Flock Feed Conversion Ratio (FCR)</span>
                          <span className="text-base font-mono font-black text-white block mt-0.5">
                            {((calcPouFeedBags * 50) / (calcPouEggCrates * 1.5)).toFixed(2)} <span className="text-[10.5px] text-slate-400 font-sans uppercase">kg feed/kg eggs</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <span className="text-[9px] font-black text-indigo-300 block uppercase mb-1">Total Daily Feed Intakes</span>
                      <span className="text-sm font-black text-slate-300 font-mono">
                        {calcPouFeedBags * 50} KG <span className="text-[10px] text-slate-405 font-bold">Total Feed Weight</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Cashflow Predictions & Real-time advisory */}
                  <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between text-xs leading-relaxed font-semibold">
                    <div>
                      <span className="text-[10px] uppercase font-black text-yellow-400 block mb-2">💸 MODEL BUDGETING FORECAST</span>
                      
                      <div className="space-y-1 text-[11.5px] leading-snug border-b border-slate-800 pb-2 mb-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans font-bold">Daily Income:</span>
                          <span className="text-white font-extrabold">Ksh {(calcPouEggCrates * calcPouCratePrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans font-bold">Daily Feed Cost:</span>
                          <span className="text-red-400 font-extrabold">- Ksh {(calcPouFeedBags * calcPouFeedCostBag).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800/60 font-bold">
                          <span className="text-slate-205 text-slate-300 font-sans font-bold">Net Profit/Day:</span>
                          <span className={`font-extrabold ${(calcPouEggCrates * calcPouCratePrice) - (calcPouFeedBags * calcPouFeedCostBag) >= 0 ? 'text-emerald-450 text-emerald-400' : 'text-rose-455 text-rose-400'}`}>
                            Ksh {((calcPouEggCrates * calcPouCratePrice) - (calcPouFeedBags * calcPouFeedCostBag)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const rate = (calcPouEggCrates * 30 / calcPouCount) * 100;
                        if (rate >= 80) {
                          return (
                            <p className="text-slate-305 text-slate-350 text-[11px] leading-snug">
                              🎯 <strong>Excellent Productivity:</strong> Your flock is in peak lay cycle. Keep light duration at strictly <strong>16 hours</strong> daily and ensure fine limestone chips are added to layers mash to sustain thick egg shells.
                            </p>
                          );
                        } else if (rate >= 65) {
                          return (
                            <p className="text-slate-305 text-slate-350 text-[11px] leading-snug">
                              ⚠️ <strong>Moderate Productivity:</strong> Review temperature controls in the coop and scan for external mites. Ensure continuous access to water with adequate minerals to prompt laying.
                            </p>
                          );
                        } else {
                          return (
                            <p className="text-slate-305 text-slate-340 text-[11px] leading-snug text-yellow-400">
                              🚨 <strong>Critical Lay Rate Drop:</strong> Laying is below standard. Immediate check: Are feeds expired or moldy? Have you vaccinated against Infectious Bronchitis (IB)? Add vitamin packs to water immediately.
                            </p>
                          );
                        }
                      })()}
                    </div>

                    <div className="text-[10px] bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-yellow-300 mt-2 font-bold flex items-center gap-1.5">
                      <span>💡</span>
                      <span>Target egg-laying benchmark is 1 crate/day for every 32-35 active feeding birds.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poultry Logs list with Add Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>🐔 DAILY POULTRY MANAGEMENT LEDGER</span>
                    </h5>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Track feed intake, mortality rates, and laying metrics</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPouShowAdd(!pouShowAdd)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-850 hover:bg-indigo-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all m-0 shadow cursor-pointer"
                    >
                      <Plus size={14} />
                      Log Poultry Entry
                    </button>
                    {onTriggerSectionReport && (
                      <button
                        onClick={() => onTriggerSectionReport('poultry')}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all m-0 shadow cursor-pointer font-bold"
                        title="Download Poultry PDF Report"
                      >
                        <Download size={13} />
                        Download PDF Report
                      </button>
                    )}
                  </div>
                </div>

                {pouShowAdd && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const id = `pou-${Math.floor(1000 + Math.random() * 9000).toString()}`;
                      const henDayLayRate = pouStage === 'Layer' ? parseFloat(((pouEggCrates * 30 - pouCrackedEggs) / (pouCount || 1) * 100).toFixed(1)) : undefined;

                      const newRec: PoultryRecord = {
                        id,
                        stage: pouStage,
                        batchName: pouBatchName || `${pouStage} flock`,
                        count: pouCount,
                        dateLogged: pouDate,
                        feedGivenKg: pouFeedGiven,
                        feedType: pouFeedType,
                        mortalityCount: pouMortality,
                        eggCratesHarvested: pouStage === 'Layer' ? pouEggCrates : undefined,
                        crackedEggsCount: pouStage === 'Layer' ? pouCrackedEggs : undefined,
                        waterIntakeLiters: pouWater,
                        vaccinesAdministered: pouVaccines || undefined,
                        percentageProduction: henDayLayRate,
                        notes: pouNotes
                      };

                      if (onAddPoultry) {
                        onAddPoultry(newRec);
                        setPouShowAdd(false);
                        setPouBatchName('');
                        setPouNotes('');
                        setPouVaccines('');
                      }
                    }}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Batch / Cohort Name</label>
                      <input
                        type="text"
                        placeholder="E.g. Kenbrow Batch #4"
                        required
                        value={pouBatchName}
                        onChange={(e) => setPouBatchName(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Lifecycle Stage</label>
                      <select
                        value={pouStage}
                        onChange={(e) => {
                          setPouStage(e.target.value as any);
                          if (e.target.value === 'Chick') setPouFeedType('Chick Start Crumble');
                          else if (e.target.value === 'Grower') setPouFeedType('Growers Mash');
                          else setPouFeedType('Layers Mash Premium');
                        }}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      >
                        <option value="Chick">Chick stage (Day 1 - Wk 8)</option>
                        <option value="Grower">Grower stage (Wk 9 - Wk 18)</option>
                        <option value="Layer">Layer stage (Wk 19+ / Egg production)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Current Birds Count</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={pouCount}
                        onChange={(e) => setPouCount(parseInt(e.target.value) || 0)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Recorded</label>
                      <input
                        type="date"
                        required
                        value={pouDate}
                        onChange={(e) => setPouDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Total Feed Daily Intake (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={pouFeedGiven}
                        onChange={(e) => setPouFeedGiven(parseFloat(e.target.value) || 0)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Feed Formulation Type</label>
                      <input
                        type="text"
                        value={pouFeedType}
                        onChange={(e) => setPouFeedType(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Mortality Count Today</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={pouMortality}
                        onChange={(e) => setPouMortality(parseInt(e.target.value) || 0)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Water Intake (Liters)</label>
                      <input
                        type="number"
                        min="0"
                        value={pouWater}
                        onChange={(e) => setPouWater(parseInt(e.target.value) || 0)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-[#ffffff]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Vaccines/Medications Administered</label>
                      <input
                        type="text"
                        placeholder="E.g. Day 7 Newcastle Vaccine"
                        value={pouVaccines}
                        onChange={(e) => setPouVaccines(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    {pouStage === 'Layer' && (
                      <>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Egg Crates Collected (30 Eggs/Crate)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            required
                            value={pouEggCrates}
                            onChange={(e) => setPouEggCrates(parseFloat(e.target.value) || 0)}
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cracked / Rejected Eggs Count</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={pouCrackedEggs}
                            onChange={(e) => setPouCrackedEggs(parseInt(e.target.value) || 0)}
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                          />
                        </div>

                        <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 flex flex-col justify-between">
                          <span className="text-[9.5px] font-black text-amber-900 uppercase">Interactive Layers Hint</span>
                          <span className="text-[10.5px] text-slate-700 leading-tight">
                            Estimated Lay \%: <strong>{(((pouEggCrates * 30 - pouCrackedEggs) / (pouCount || 1)) * 100).toFixed(1)}% Hen-Day</strong>. Target for profitable egg production is &gt;80%.
                          </span>
                        </div>
                      </>
                    )}

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Daily Log Notes & Observations</label>
                      <input
                        type="text"
                        value={pouNotes}
                        onChange={(e) => setPouNotes(e.target.value)}
                        placeholder="E.g. Droppings look healthy and firm. Brooder heater kept constant."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => setPouShowAdd(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer m-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase transition-all shadow cursor-pointer m-0"
                      >
                        Save Poultry Entry
                      </button>
                    </div>
                  </form>
                )}

                {/* Poultry records list */}
                <div className="grid grid-cols-1 gap-4">
                  {poultryRecords.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold uppercase text-[10.5px]">
                      No poultry ledger records registered yet.
                    </div>
                  ) : (
                    poultryRecords.map((item) => (
                      <div key={item.id} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/20 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono bg-indigo-950 text-white text-[10px] px-2.5 py-0.5 rounded font-black">
                              {item.id}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {item.batchName} ({item.count} Birds)
                            </span>
                            <span className="text-xs bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded">
                              {item.stage}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                              Date: {item.dateLogged}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div className="bg-white p-2 border border-slate-100 rounded-xl">
                              <span className="text-[9.5px] font-black text-slate-400 block uppercase">Feed Daily</span>
                              <span className="text-xs font-mono font-bold text-slate-800">
                                {item.feedGivenKg} KG ({item.feedType})
                              </span>
                            </div>
                            <div className="bg-white p-2 border border-slate-100 rounded-xl">
                              <span className="text-[9.5px] font-black text-slate-400 block uppercase">Water Intake</span>
                              <span className="text-xs font-mono font-bold text-slate-800">
                                {item.waterIntakeLiters || 0} Liters
                              </span>
                            </div>
                            <div className="bg-white p-2 border border-slate-100 rounded-xl">
                              <span className="text-[9.5px] font-black text-slate-400 block uppercase">Mortality Today</span>
                              <span className={`text-xs font-mono font-bold ${item.mortalityCount > 0 ? 'text-rose-600' : 'text-slate-505'}`}>
                                {item.mortalityCount} birds
                              </span>
                            </div>
                            {item.stage === 'Layer' ? (
                              <div className="bg-teal-50 border border-teal-100 p-2 rounded-xl">
                                <span className="text-[9px] font-black text-teal-900 block uppercase">Egg Production</span>
                                <span className="text-xs font-mono font-extrabold text-teal-950">
                                  {item.eggCratesHarvested || 0} Crates ({item.percentageProduction || 0}% Lay)
                                </span>
                              </div>
                            ) : (
                              <div className="bg-slate-100 p-2 rounded-xl">
                                <span className="text-[9px] font-black text-slate-500 block uppercase">Avg Feed/Bird</span>
                                <span className="text-xs font-mono font-bold text-slate-705">
                                  {item.feedGivenKg && item.count ? ((item.feedGivenKg / item.count) * 1000).toFixed(0) : 0} grams
                                </span>
                              </div>
                            )}
                          </div>

                          {item.vaccinesAdministered && (
                            <div className="text-[10.5px] bg-red-50 text-red-950 font-bold px-3 py-1 rounded inline-block">
                              🩺 Administered: {item.vaccinesAdministered}
                            </div>
                          )}

                          <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2.5 rounded-xl border border-slate-100">
                            " {item.notes} "
                          </p>
                        </div>

                        {onDeletePoultry && (
                          <button
                            onClick={() => onDeletePoultry(item.id)}
                            className="text-slate-300 hover:text-red-700 p-2 border rounded-xl hover:border-red-150 bg-white shadow-xs transition-all m-0 font-bold cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* 🐣 IMPERATIVE POULTRY VACCINATION & MANAGEMENT SCHEDULE */}
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-950">
                    <BookOpen size={16} className="text-amber-800" />
                    <h5 className="text-[11px] font-black tracking-widest uppercase">IMPERATIVE POULTRY VACCINATION & BIOSAFETY PROTOCOLS</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <span className="font-extrabold text-[#7d5600] uppercase tracking-wide block">🐣 Laying Avian Schedule (Newcastle / Gumboro):</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 font-semibold">
                        <li>Week 1: Newcastle Vaccine (drinking water/drops)</li>
                        <li>Week 2: Gumboro First Dose (Immunity booster)</li>
                        <li>Week 4: Newcastle & Bronchitis Booster</li>
                        <li>Week 8: Fowl Pox (wing web injection)</li>
                        <li>Week 18/Lay: Newcastle booster every 8 weeks</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-705 uppercase tracking-wide block">🛡️ Standard Biosecurity Guardrails:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 font-semibold">
                        <li>Footbaths: Disinfectant footbaths must be installed at all entrance doors.</li>
                        <li>Litter Management: Change wood shavings regularly to prevent ammonia accumulation.</li>
                        <li>Water Sanitation: Sanitize water lines weekly to eliminate bacterial pathogens.</li>
                        <li>Flock Isolation: Strictly prohibit unauthorized staff or visitor entries.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 🐔 Avian Activity Ledger & Historical Logs */}
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex justify-between items-center bg-white/30 px-2 font-bold select-none">
                    <div>
                      <h5 className="font-extrabold text-[13.5px] uppercase text-[#0b251a]">🐔 Avian Activity Ledger & Historical Logs</h5>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Historical flock vaccinations, treatments, and daily collections</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowAddForm(!showAddForm);
                        setLsType('Poultry');
                      }}
                      className="bg-amber-900 text-white font-black text-xs uppercase px-4 py-2 rounded-xl hover:bg-amber-800 flex items-center gap-1.5 m-0 cursor-pointer shadow-xs"
                    >
                      <Plus size={13} /> Add Activity Log
                    </button>
                  </div>

                  {showAddForm && lsType === 'Poultry' && (
                    <form onSubmit={handleLivestockSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4 font-sans text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Unit Type</label>
                          <input
                            type="text"
                            readOnly
                            value="Poultry / Avian"
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-slate-50 text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Group ID / Breed / Name</label>
                          <input
                            type="text"
                            required
                            value={lsName}
                            onChange={(e) => setLsName(e.target.value)}
                            placeholder="E.g. Layers Flock A or Broilers Batch 2"
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Count or Pedigree Details</label>
                          <input
                            type="text"
                            required
                            value={lsCount}
                            onChange={(e) => setLsCount(e.target.value)}
                            placeholder="E.g. 350 birds, Kenbro"
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-amber-800 uppercase block mb-1">Record Log Date (Historical)</label>
                          <input
                            type="date"
                            required
                            value={lsDate}
                            onChange={(e) => setLsDate(e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Logged Activity</label>
                          <input
                            type="text"
                            required
                            value={lsActivity}
                            onChange={(e) => setLsActivity(e.target.value)}
                            placeholder="E.g. Administered Deworming, checked feed intake"
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Additional Observations / Notes</label>
                          <input
                            type="text"
                            value={lsNotes}
                            onChange={(e) => setLsNotes(e.target.value)}
                            placeholder="E.g. Active, high energy, normal eggshell quality"
                            className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 text-right border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-black text-xs uppercase rounded-lg m-0 shadow">
                          Save Activity
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {livestock.filter(item => item.type === 'Poultry').length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold uppercase text-[10.5px]">
                        No poultry activity log entries registered yet.
                      </div>
                    ) : (
                      livestock.filter(item => item.type === 'Poultry').map((item) => (
                        <div key={item.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-200">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-amber-100 border-amber-200 text-amber-800">
                                {item.type} Section
                              </span>
                              <h5 className="font-extrabold text-[13.5px] uppercase text-[#0b251a]">{item.name}</h5>
                              <span className="text-xs font-mono font-bold text-slate-400">({item.countOrBreed})</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black text-slate-705 leading-relaxed bg-slate-50 shrink-0 px-2 py-1 rounded inline-block">
                              <Activity size={12} className="text-amber-700 shrink-0 inline-block mr-1" />
                              <span>Activity: {item.activity}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-505 italic leading-normal">
                              Observational diagnostics: "{item.notes}"
                            </p>
                          </div>
                          <div className="text-left md:text-right shrink-0 flex items-center gap-4">
                            <div>
                              <span className="text-[9px] uppercase font-black text-slate-400 block font-bold">Compiled Timestamp</span>
                              <span className="text-xs font-black font-mono text-slate-705 block mt-1">{item.date}</span>
                            </div>
                            {onEditLivestock && (
                              <button
                                onClick={() => setEditingLivestock(item)}
                                className="text-slate-305 hover:text-indigo-850 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-indigo-105 bg-white shadow-xs"
                              >
                                <PenSquare size={13} />
                              </button>
                            )}
                            {onDeleteLivestock && (
                              <button
                                onClick={() => onDeleteLivestock(item.id)}
                                className="text-slate-305 hover:text-rose-850 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-rose-105 bg-white shadow-xs"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEW SUBTAB: HEIFER REPRODUCTION & DEVELOPMENT SYSTEM */}
          {livestockSubTab === 'heifers' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Educational Advisory on Heifer rearing */}
              <div className="bg-amber-900 text-amber-50 p-6 rounded-3xl space-y-3 shadow">
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-black tracking-widest uppercase">Reproductive Science</span>
                <h4 className="text-xl font-bold tracking-tight text-white">🐄 Sustainable Heifer Growth to First Calving</h4>
                <p className="text-xs text-amber-100 leading-relaxed max-w-2xl font-medium">
                  Heifers are the future replacement cows of the dairy farm. Target steady, lean skeletel growth of <strong>655g to 750g average daily liveweight gain (ADG)</strong>. Monitor chest girth metrics so heifers can safely reach breeding size of <strong>290-310 KG</strong> at 14-16 months of maturity.
                </p>
                <div className="text-xs bg-amber-955 p-3 rounded-xl space-y-1.5 border border-amber-800">
                  <span className="text-yellow-400 font-extrabold uppercase text-[10.5px] block">👑 Best Feeding Strategy</span>
                  <p className="text-[10.5px] text-amber-100 leading-tight">
                    Provide ad-libitum access to clean Boma Rhodes hay blocks, fortified with 1-2kg of high-energy grower meal raw formulation diariamente. Calcium and trace mineral salts are mandatory to ensure follicular maturation, ovulation capacity, and robust fertility cycles.
                  </p>
                </div>
              </div>

              {/* Girth-to-Weight Interactive Calculator */}
              <div className="bg-gradient-to-r from-emerald-50 to-indigo-50/50 p-6 rounded-3xl border border-emerald-100 space-y-5">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">📐 CHEST GIRTH-TO-WEIGHT & AI MATURITY CALCULATOR</h5>
                  <p className="text-slate-400 text-[9.5px] font-bold uppercase mt-0.5">Use heart chest girth to predict heifer body weights instantly</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                    <span className="text-[10px] uppercase font-black text-indigo-900 tracking-wider">Adjustment dial</span>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Heifer Chest Girth: <span className="font-mono text-indigo-900 text-xs font-black">{hefGirth} cm</span>
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="180"
                        step="1"
                        value={hefGirth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setHefGirth(val);
                          // standard girth-weight projection for heifers: Girth 100cm = ~110kg, 140cm = ~240kg, 160cm = ~330kg
                          const estWt = Math.round(110 + (val - 100) * 3.65);
                          setHefWeight(estWt);
                          setHefBreedingReady(estWt >= 280);
                        }}
                        className="w-full accent-indigo-900 h-2 bg-slate-200 rounded-lg cursor-pointer mt-2"
                      />
                      <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 block">Measure around the chest directly behind forelegs.</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">Estimated Liveweight</span>
                      <div className="text-3xl font-black text-indigo-950 font-mono tracking-tight mt-1">
                        {hefWeight} <span className="text-xs text-slate-400 font-bold uppercase">KG</span>
                      </div>
                      <p className="text-[10px] text-slate-550 mt-1 font-medium leading-relaxed">
                        For dairy breeds (Holstein, Jersey, Friesian crosses), estimated by heart chest girth conversion curves.
                      </p>
                    </div>
                  </div>

                  <div className={`${hefBreedingReady ? 'bg-indigo-950 text-amber-200' : 'bg-slate-900 text-slate-200'} p-5 rounded-2xl flex flex-col justify-between transition-all`}>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 block uppercase">AI BREEDING ELIGIBILITY</span>
                      <div className="text-lg font-extrabold mt-2 tracking-tight">
                        {hefBreedingReady ? '🎉 BREEDING READY' : '❌ NOT MATURE FOR BULL'}
                      </div>
                      <p className="text-[10px] text-slate-350 leading-tight mt-1.5 font-medium">
                        {hefBreedingReady 
                          ? "This heifer has crossed the 280KG threshold and has adequate frame structure to warrant AI insemination." 
                          : `Requires ${280 - hefWeight} KG additional liveweight before puberty insemination is veterinary-permissible.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heifer record keeping table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>🐄 REGISTERED HEIFER MONITORS</span>
                    </h5>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Development histories, chest dimensions, and daily gains</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHefShowAdd(!hefShowAdd)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all m-0 shadow cursor-pointer"
                    >
                      <Plus size={14} />
                      Log Development metrics
                    </button>
                    {onTriggerSectionReport && (
                      <button
                        onClick={() => onTriggerSectionReport('heifers')}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all m-0 shadow cursor-pointer font-bold"
                        title="Download Heifer Progeny PDF Report"
                      >
                        <Download size={13} />
                        Download PDF Report
                      </button>
                    )}
                  </div>
                </div>

                {hefShowAdd && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const id = `hef-${Math.floor(1000 + Math.random() * 9000).toString()}`;
                      const estWt = Math.round(110 + (hefGirth - 100) * 3.65);

                      const newRec: HeiferRecord = {
                        id,
                        cowId: hefCowId,
                        dateLogged: hefDate,
                        weightKg: estWt,
                        girthCm: hefGirth,
                        feedRationType: hefRation,
                        averageDailyGainGrams: hefAdg,
                        breedingReady: estWt >= 280,
                        notes: hefNotes
                      };

                      if (onAddHeifer) {
                        onAddHeifer(newRec);
                        setHefShowAdd(false);
                        setHefCowId('');
                        setHefNotes('');
                      }
                    }}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Heifer Ear Tag or Name</label>
                      <input
                        type="text"
                        placeholder="E.g. Friesian Cross Lucy"
                        required
                        value={hefCowId}
                        onChange={(e) => setHefCowId(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Logged</label>
                      <input
                        type="date"
                        required
                        value={hefDate}
                        onChange={(e) => setHefDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Chest Girth Metric (cm)</label>
                      <input
                        type="number"
                        min="50"
                        max="220"
                        required
                        value={hefGirth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setHefGirth(val);
                          setHefWeight(Math.round(110 + (val - 100) * 3.65));
                        }}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Ration Mixture Details</label>
                      <input
                        type="text"
                        placeholder="Rhodes hay, lucerne block, mineral salts"
                        value={hefRation}
                        onChange={(e) => setHefRation(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                        Average Daily gain (grams/day): <strong className="font-mono text-slate-800">{hefAdg}g</strong>
                      </label>
                      <input
                        type="range"
                        min="300"
                        max="1000"
                        step="50"
                        value={hefAdg}
                        onChange={(e) => setHefAdg(parseInt(e.target.value))}
                        className="w-full accent-amber-800 h-2 bg-slate-200 rounded-lg cursor-pointer mt-3"
                      />
                    </div>

                    <div className="bg-amber-100/70 border border-amber-200 p-3 rounded-xl flex items-center">
                      <span className="text-[10.5px] font-bold text-slate-800 leading-tight">
                        Calculated Target weight is <strong>{hefWeight} KG</strong>. Pre-estimated by veterinarian algorithm.
                      </span>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">General Observations (Cycle signs, hair coat texture, vigor)</label>
                      <textarea
                        rows={2}
                        value={hefNotes}
                        onChange={(e) => setHefNotes(e.target.value)}
                        placeholder="Coat looks shiny, active and alert, shows early heat signs (estrus behavior)."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => setHefShowAdd(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer m-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase transition-all shadow cursor-pointer m-0"
                      >
                        Save Heifer Log
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {heiferRecords.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold uppercase text-[10.5px]">
                      No heifer development logs recorded yet.
                    </div>
                  ) : (
                    heiferRecords.map((item) => (
                      <div key={item.id} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/20 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono bg-amber-900 text-white text-[10px] px-2.5 py-0.5 rounded font-black uppercase">
                              {item.id}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              Heifer: {item.cowId}
                            </span>
                            <span className="text-[10.2px] font-mono text-slate-500 font-bold uppercase">
                              Date: {item.dateLogged}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 block uppercase">Chest Girth</span>
                              <span className="text-xs font-mono font-extrabold text-[#111]">
                                {item.girthCm || 0} cm
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 block uppercase">Calculated Weight</span>
                              <span className="text-xs font-mono font-extrabold text-[#111]">
                                {item.weightKg} KG
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 block uppercase">Ration Notes</span>
                              <span className="text-xs font-bold text-indigo-950 block truncate">
                                {item.feedRationType}
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 block uppercase">ADG (Daily Gain)</span>
                              <span className="text-xs font-mono font-bold text-emerald-800">
                                {item.averageDailyGainGrams} g/day
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 block uppercase">AI Eligibility</span>
                              <span className={`text-[10px] font-black uppercase ${item.breedingReady ? 'text-indigo-900' : 'text-slate-400'}`}>
                                {item.breedingReady ? 'Ready (AI Target)' : 'Immature'}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2.5 rounded-xl border border-slate-100">
                            " {item.notes} "
                          </p>
                        </div>

                        {onDeleteHeifer && (
                          <button
                            onClick={() => onDeleteHeifer(item.id)}
                            className="text-slate-300 hover:text-red-700 p-2.5 rounded-lg border hover:border-red-100/80 bg-white shadow-xs cursor-pointer m-0 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NEW SUBTAB: VETERINARY QUARANTINE ISOLATION CENTRE */}
          {livestockSubTab === 'quarantine' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Introduction Safety Checklist banner */}
              <div className="bg-rose-950 text-[#fff] p-6 rounded-3xl space-y-4 border border-rose-900 shadow">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-yellow-400 text-rose-950 px-2.5 py-1 rounded font-black tracking-widest uppercase">Biosecurity Protocol</span>
                  <span className="text-[10px] bg-rose-900 text-rose-100 border border-rose-800 px-2 py-1 rounded uppercase font-bold">Infection isolation</span>
                </div>
                <h4 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>🩺 Nyaronde Veterinary Quarantine isolation ledger</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] pt-1">
                  <div className="bg-rose-900/60 p-3 rounded-xl border border-rose-800 text-rose-100 space-y-1">
                    <span className="font-extrabold uppercase text-yellow-400 block">1. 21-Days Isolation</span>
                    <span>All newly purchased cattle/goats must undergo a mandatory 21-day quarantine prior to herd merger.</span>
                  </div>
                  <div className="bg-rose-900/60 p-3 rounded-xl border border-rose-800 text-rose-100 space-y-1">
                    <span className="font-extrabold uppercase text-yellow-400 block">2. Dedicated Equipment</span>
                    <span>Use exclusive feeding troughs, water buckets, and manure spades. Never move devices out of isolation zones.</span>
                  </div>
                  <div className="bg-rose-900/60 p-3 rounded-xl border border-rose-800 text-rose-100 space-y-1">
                    <span className="font-extrabold uppercase text-yellow-400 block">3. Footbath Hygiene</span>
                    <span>Re-fill entrance footbaths with copper sulfate or chlorine disinfectant daily. Step in before boarding/leaving.</span>
                  </div>
                  <div className="bg-rose-900/60 p-3 rounded-xl border border-rose-800 text-rose-100 space-y-1">
                    <span className="font-extrabold uppercase text-yellow-400 block">4. Separate milking</span>
                    <span>Always milk quarantined animals last. Pasteurize or safely discard milk; do not load into the main dairy cooler.</span>
                  </div>
                </div>
              </div>

              {/* IMPROVEMENTS 1 & 3: INTERACTIVE VET DIAGNOSTIC TREE & MEDICATION SAFETY WIZARD */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. INTERACTIVE CLINICAL DISEASE DIAGNOSTIC TREE */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-rose-500 font-extrabold text-white px-2.5 py-0.5 rounded uppercase tracking-wider">Clinical Tree</span>
                    <h5 className="text-base font-black text-white flex items-center gap-1.5 mt-1">
                      <span>🩺 Vet Clinical Symptom Diagnostic Advisor</span>
                    </h5>
                    <p className="text-slate-400 text-xs">Analyze critical physiological traits and receive vet recommendation procedures.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Target Specimen</label>
                      <select
                        value={diagSpecies}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setDiagSpecies(val);
                          // Default symptoms based on species
                          if (val === 'Cattle') setDiagSymptom('fever_milk_drop');
                          else if (val === 'Poultry') setDiagSymptom('resp_green_poop');
                          else if (val === 'Goat') setDiagSymptom('skin_nodules');
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 w-full text-white font-bold cursor-pointer"
                      >
                        <option value="Cattle">🐄 Dairy Cow / Calf</option>
                        <option value="Poultry">🐣 Poultry Flock</option>
                        <option value="Goat">🐐 Dairy Goat Herd</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Observed Clinical Signs</label>
                      <select
                        value={diagSymptom}
                        onChange={(e) => setDiagSymptom(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 w-full text-white font-bold cursor-pointer"
                      >
                        {diagSpecies === 'Cattle' && (
                          <>
                            <option value="fever_milk_drop">High Fever, swollen udder, milk is watery / clotted</option>
                            <option value="salivation_limping">Excessive drooling, frothing, painful foot blisters, limping</option>
                            <option value="bloody_waste">Severe blackish diarrhea, dry nose, rapid weight atrophy</option>
                          </>
                        )}
                        {diagSpecies === 'Poultry' && (
                          <>
                            <option value="resp_green_poop">Severe gasping/snicking, greenish diarrhea, twisted neck</option>
                            <option value="bloody_chicks">Pale combs, ruffled feathers, bloody diarrhea in brooder</option>
                            <option value="soft_shells">Sudden drop in eggs count, soft/shell-less eggs, head tremors</option>
                          </>
                        )}
                        {diagSpecies === 'Goat' && (
                          <>
                            <option value="skin_nodules">Nodular skin bumps, fever, ocular/nasal discharges</option>
                            <option value="cough_wasting">Heavy coughing, fast panting, heavy nasal mucus, wasting</option>
                          </>
                        )}
                        <option value="none">Observation only / General wellness isolate</option>
                      </select>
                    </div>
                  </div>

                  {/* Diagnostic Output Readout */}
                  {(() => {
                    let estimatedDisease = "General Isolation Observation";
                    let protocolPriority = "Medium Concern";
                    let protocolColor = "border-amber-500/30 bg-amber-500/10 text-amber-300";
                    let colorKey = "amber";
                    let primaryMed = "Isolate and check temperature twice daily.";
                    let bioSteps = "Observe for 7 days. Ensure footdisinfectant bath is renewed.";

                    if (diagSymptom === 'fever_milk_drop') {
                      estimatedDisease = "🛡️ Clinical Mastitis (Bacterial infection)";
                      protocolPriority = "URGENT (Separate Milking)";
                      protocolColor = "border-amber-500/40 bg-amber-500/10 text-amber-205";
                      colorKey = "amber";
                      primaryMed = "Intramammary infusions (dry-cow syringe), Systemic Penicillin, Flunixin Meglumine.";
                      bioSteps = "Must milk affected cattle manually last. Thoroughly discard infected milk; sanitize hands and cluster cups.";
                    } else if (diagSymptom === 'salivation_limping') {
                      estimatedDisease = "🚨 Foot and Mouth Disease (FMD Virus)";
                      protocolPriority = "CRITICAL BIOLOGICAL EMERGENCY (Strict Containment)";
                      protocolColor = "border-red-500/40 bg-red-500/10 text-rose-300";
                      colorKey = "red";
                      primaryMed = "No direct cure. Support therapy: antiseptic foot washing, mild analgesics, oxytetracycline spray fields.";
                      bioSteps = "Bar all visitors! Block all livestock movements. Dig deep pit for manure; sanitize tire tracks of outgoing feeds.";
                    } else if (diagSymptom === 'bloody_waste') {
                      estimatedDisease = "🚨 East Coast Fever (ECF - Tick Transmitted Protozoa)";
                      protocolPriority = "CRITICAL (High Mortality Vet Alert)";
                      protocolColor = "border-red-500/40 bg-red-500/10 text-rose-300";
                      colorKey = "red";
                      primaryMed = "Buparvaquone (Butalex) injection, plus Oxytetracycline LA.";
                      bioSteps = "Intense systemic acaricide tick spraying/dip immediately for surrounding healthy herds.";
                    } else if (diagSymptom === 'resp_green_poop') {
                      estimatedDisease = "💀 Newcastle Disease or Gumboro / IBD Virus";
                      protocolPriority = "CRITICAL (Extreme Virulence Layer Hazard)";
                      protocolColor = "border-red-500/40 bg-red-500/10 text-rose-300";
                      colorKey = "red";
                      primaryMed = "No therapy available for active virus. Support with dynamic vitamins/electrolytes.";
                      bioSteps = "Strictly incinerate or deep bury carcasses with quicklime. Sanitize brooder structures using formalin mist.";
                    } else if (diagSymptom === 'bloody_chicks') {
                      estimatedDisease = "🛡️ Avian Coccidiosis (Eimeria Parasite)";
                      protocolPriority = "URGENT (Brooder Containment)";
                      protocolColor = "border-amber-500/20 bg-amber-500/10 text-amber-300";
                      colorKey = "amber";
                      primaryMed = "Amprolium or Sulphaclozine-Sodium in drinking water for 5 continuous days.";
                      bioSteps = "Eliminate wet wood shavings in brooders. Replace with clean, dry shavings. Keep drinker areas bone dry.";
                    } else if (diagSymptom === 'soft_shells') {
                      estimatedDisease = "⚠️ Egg Drop Syndrome or Calcium/D3 Starvation";
                      protocolPriority = "NUTRITIONAL ADJUSTMENT";
                      protocolColor = "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
                      colorKey = "cyan";
                      primaryMed = "Continuous layer mash supplement feed, Oyster chalk grit, Dicalcium Phosphate (DCP).";
                      bioSteps = "Isolate older heavy-pecking hens. Maintain clean nests and feed bins.";
                    } else if (diagSymptom === 'skin_nodules') {
                      estimatedDisease = "⚠️ Lumpy Skin Disease / Capripox Virus";
                      protocolPriority = "URGENT isolate (Vector Spread danger)";
                      protocolColor = "border-amber-500/20 bg-amber-500/10 text-amber-300";
                      colorKey = "amber";
                      primaryMed = "Broad spectrum antibiotics to control secondary bacterial invasion, wound antiseptics.";
                      bioSteps = "Spray mosquito control fields. Block tick and fly contacts inside zero-grazing isolators.";
                    } else if (diagSymptom === 'cough_wasting') {
                      estimatedDisease = "🛡️ Contagious Caprine Pleuropneumonia (CCPP Mycoplasma)";
                      protocolPriority = "URGENT respiratory control";
                      protocolColor = "border-amber-500/20 bg-amber-500/10 text-amber-300";
                      colorKey = "amber";
                      primaryMed = "Oxytetracycline LA dose or Tylosin injections.";
                      bioSteps = "Avoid crowding. Keep airflow vents high in the goat shelter. Disinfect saliva droplets.";
                    }

                    return (
                      <div className={`p-4 border rounded-2xl ${protocolColor} space-y-3`}>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-[10px] uppercase font-black tracking-widest text-white">Advisory diagnostics</span>
                          <span className="text-[9.5px] font-mono font-black uppercase text-yellow-300">{protocolPriority}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase font-bold text-slate-400 block">Symptomatic Estimation</span>
                          <span className="text-sm font-black text-white">{estimatedDisease}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">Primary Vet Prescription (SOP)</span>
                            <span className="text-slate-100 font-medium">{primaryMed}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">Urgent Biosecurity Step</span>
                            <span className="text-slate-100 font-medium">{bioSteps}</span>
                          </div>
                        </div>

                        <div className="pt-2 text-[9.5px] font-bold text-yellow-300 flex items-center gap-1.5 border-t border-white/5">
                          <span>⚠️</span>
                          <span>Always authorize treatment choices with a certified veterinarian before dosage.</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. VETERINARY MEDICATION SAFETY & DRUG WITHDRAWAL WIZARD */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-emerald-600 font-extrabold text-white px-2.5 py-0.5 rounded uppercase tracking-wider">Product Safety Tracker</span>
                    <h5 className="text-base font-black text-white flex items-center gap-1.5 mt-1">
                      <span>🧪 Veterinary Drug Withdrawal Safety Indicator</span>
                    </h5>
                    <p className="text-slate-400 text-xs">Calculate milk and meat biosecurity countdowns to safeguard food standards.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Medication Category</label>
                      <select
                        value={withMedType}
                        onChange={(e) => setWithMedType(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 w-full text-white font-bold cursor-pointer"
                      >
                        <option value="antibiotic_pen">🛡️ Penicillin-Dihydrostreptomycin (3d Milk, 14d Meat)</option>
                        <option value="antibiotic_tet">🛡️ Oxytetracycline LA (Alamycin) (5d Milk, 21d Meat)</option>
                        <option value="dewormer_alben">🐛 Albendazole Dewormer (1d Milk, 10d Meat)</option>
                        <option value="acaricide_dip">🕷️ Triatix/Coopers Acaricide Spray (0d Milk, 1d Meat)</option>
                        <option value="sedative_xyl">💉 Xylazine / Vet Sedatives (1d Milk, 3d Meat)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Treatment Injection Date</label>
                      <input
                        type="date"
                        value={withTreatDate}
                        onChange={(e) => setWithTreatDate(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 w-full text-white font-bold font-mono"
                      />
                    </div>
                  </div>

                  {(() => {
                    // Extract withdrawal lengths
                    let milkDays = 3;
                    let meatDays = 14;
                    let title = "Penicillin Block";

                    if (withMedType === 'antibiotic_pen') {
                      milkDays = 3; meatDays = 14; title = "Pen-Strep Antibiotic";
                    } else if (withMedType === 'antibiotic_tet') {
                      milkDays = 5; meatDays = 21; title = "Oxytetracycline LA";
                    } else if (withMedType === 'dewormer_alben') {
                      milkDays = 1; meatDays = 10; title = "Albendazole Dewormer";
                    } else if (withMedType === 'acaricide_dip') {
                      milkDays = 0; meatDays = 1; title = "Triatix Acaricide";
                    } else if (withMedType === 'sedative_xyl') {
                      milkDays = 1; meatDays = 3; title = "Xylazine Sedative";
                    }

                    // Compute dates
                    const treatDateObj = new Date(withTreatDate);
                    const milkClearDateObj = new Date(treatDateObj);
                    milkClearDateObj.setDate(treatDateObj.getDate() + milkDays);

                    const meatClearDateObj = new Date(treatDateObj);
                    meatClearDateObj.setDate(treatDateObj.getDate() + meatDays);

                    const todayObj = new Date();
                    todayObj.setHours(0, 0, 0, 0);

                    // Check if current date is cleared
                    const isMilkCleared = todayObj >= milkClearDateObj;
                    const isMeatCleared = todayObj >= meatClearDateObj;

                    const formattedMilkDate = milkClearDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    const formattedMeatDate = meatClearDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                    // Count remaining days
                    const msPerDay = 1000 * 60 * 60 * 24;
                    const milkDaysRemaining = Math.max(0, Math.ceil((milkClearDateObj.getTime() - todayObj.getTime()) / msPerDay));
                    const meatDaysRemaining = Math.max(0, Math.ceil((meatClearDateObj.getTime() - todayObj.getTime()) / msPerDay));

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Milk safety */}
                        <div className={`p-4 border rounded-2xl ${isMilkCleared ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/10'} space-y-2`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase font-black text-slate-400">🥛 Milk Sales Safety</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isMilkCleared ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                              {isMilkCleared ? 'Cleared' : 'WITHDRAWN'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-lg font-mono font-black text-white">{isMilkCleared ? '0' : milkDaysRemaining} Days left</span>
                            <span className="text-[10px] text-slate-350 block font-bold">Clear date: {formattedMilkDate}</span>
                          </div>

                          <p className={`text-[10px] font-medium leading-relaxed ${isMilkCleared ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {isMilkCleared 
                              ? "✔ Milk chemical residues are down. Safe to deliver to the dairy cooperative." 
                              : `🔴 DISCARD! Milk has active antibiotic residues. Feeding calf is allowed, but do not sell to retail.`}
                          </p>
                        </div>

                        {/* Meat safety */}
                        <div className={`p-4 border rounded-2xl ${isMeatCleared ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/10'} space-y-2`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase font-black text-slate-400">🥩 Meat Slaughter Safety</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isMeatCleared ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                              {isMeatCleared ? 'Cleared' : 'WITHDRAWN'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-lg font-mono font-black text-white">{isMeatCleared ? '0' : meatDaysRemaining} Days left</span>
                            <span className="text-[10px] text-slate-350 block font-bold">Clear date: {formattedMeatDate}</span>
                          </div>

                          <p className={`text-[10px] font-medium leading-relaxed ${isMeatCleared ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {isMeatCleared 
                              ? "✔ Meat tissues completely secure for packaging and direct slaughterhouse dispatch." 
                              : `🔴 WARNING! Chemical withdrawals in muscle tissues are dangerous to consumer health.`}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Quarantine register list with Add Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>🩺 ISOLATED VET CASE HISTORY RECORD</span>
                    </h5>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Biosecurity incident logs and clearing clearance codes</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuaShowAdd(!quaShowAdd)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider m-0 shadow cursor-pointer transition-all"
                    >
                      <Plus size={14} />
                      Register Quarantine Isolate
                    </button>
                    {onTriggerSectionReport && (
                      <button
                        onClick={() => onTriggerSectionReport('quarantine')}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all m-0 shadow cursor-pointer font-bold"
                        title="Download Quarantine Isolate PDF Report"
                      >
                        <Download size={13} />
                        Download PDF Report
                      </button>
                    )}
                  </div>
                </div>

                {quaShowAdd && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const id = `qua-${Math.floor(1000 + Math.random() * 9000).toString()}`;
                      const newRec: QuarantineRecord = {
                        id,
                        animalType: quaType,
                        animalTagOrBatch: quaTag,
                        dateStarted: quaDateStart,
                        dateScheduledEnd: quaDateEnd || quaDateStart,
                        quarantineReason: quaReason,
                        symptomsObserved: quaSymptoms,
                        quarantineStatus: quaStatus,
                        vetInCharge: quaVet || 'Unassigned',
                        notes: quaNotes
                      };

                      if (onAddQuarantine) {
                        onAddQuarantine(newRec);
                        setQuaShowAdd(false);
                        setQuaTag('');
                        setQuaNotes('');
                        setQuaReason('');
                        setQuaVet('');
                      }
                    }}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Species</label>
                      <select
                        value={quaType}
                        onChange={(e) => setQuaType(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      >
                        <option value="Cow">Cattle / Cows</option>
                        <option value="Goat">Goat</option>
                        <option value="Calf">Young calf</option>
                        <option value="Poultry">Poultry bird</option>
                        <option value="Dog">Dog</option>
                        <option value="Other">Other Species</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tag ID / Cow Code Name</label>
                      <input
                        type="text"
                        placeholder="E.g. Tag NYO-432"
                        required
                        value={quaTag}
                        onChange={(e) => setQuaTag(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Isolation Started</label>
                      <input
                        type="date"
                        required
                        value={quaDateStart}
                        onChange={(e) => setQuaDateStart(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Expected Clearing Date (Optional)</label>
                      <input
                        type="date"
                        value={quaDateEnd}
                        onChange={(e) => setQuaDateEnd(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Primary Isolation Cause / Reason</label>
                      <input
                        type="text"
                        placeholder="E.g. New purchase quarantine, Foot and Mouth suspect"
                        required
                        value={quaReason}
                        onChange={(e) => setQuaReason(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Active Symptoms Observed</label>
                      <input
                        type="text"
                        placeholder="Fever, cough, diarrhea, or None"
                        value={quaSymptoms}
                        onChange={(e) => setQuaSymptoms(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Active Quarantine Status</label>
                      <select
                        value={quaStatus}
                        onChange={(e) => setQuaStatus(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      >
                        <option value="Strict Isolation">Strict Isolation (Absolute confinement)</option>
                        <option value="Under Observation">Under Observation (Testing ongoing)</option>
                        <option value="Cleared & Released">Cleared & Released (Approved merger)</option>
                        <option value="Failed & Culled">Failed & Culled (Euthanized/Sold)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Attending Veterinarian Name</label>
                      <input
                        type="text"
                        placeholder="Dr. Ronald Nyamira Range"
                        value={quaVet}
                        onChange={(e) => setQuaVet(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div className="bg-[#fef2f2] text-rose-950 p-3.5 border border-rose-200 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-black text-rose-900 uppercase">Milking Security Warning</span>
                      <p className="text-[10.5px] text-slate-700 leading-snug">
                        Keep isolates thoroughly locked from direct physical or water access with healthy herds! Use separate gloves.
                      </p>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Vet prescription / Treatment actions notes</label>
                      <textarea
                        rows={2}
                        value={quaNotes}
                        onChange={(e) => setQuaNotes(e.target.value)}
                        placeholder="Antibiotic doses administered, blood sample taken on Tuesday."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-white"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => setQuaShowAdd(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer m-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase transition-all shadow cursor-pointer m-0"
                      >
                        Register Isolated Animal
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {quarantineRecords.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold uppercase text-[10.5px]">
                      No current animals in veterinary quarantine.
                    </div>
                  ) : (
                    quarantineRecords.map((item) => {
                      const isCleared = item.quarantineStatus === 'Cleared & Released';

                      return (
                        <div key={item.id} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/20 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1.5 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono bg-rose-900 text-white text-[10px] px-2.5 py-0.5 rounded font-black uppercase">
                                {item.id}
                              </span>
                              <span className="text-sm font-black text-slate-900">
                                Species: {item.animalType} (Ear-Tag {item.animalTagOrBatch})
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                isCleared ? 'bg-green-150 text-green-950' : 'bg-rose-100 text-rose-850'
                              }`}>
                                {item.quarantineStatus}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-501">
                                Started: {item.dateStarted}
                              </span>
                              {item.dateScheduledEnd && (
                                <span className="text-[10px] font-mono font-bold text-slate-501">
                                  Expected Release: {item.dateScheduledEnd}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Isolation Reason</span>
                                <span className="text-xs font-bold text-rose-950">
                                  {item.quarantineReason}
                                </span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Symptoms Logged</span>
                                <span className="text-xs font-medium text-slate-700">
                                  {item.symptomsObserved}
                                </span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block uppercase">Attending Veterinarian</span>
                                <span className="text-xs font-bold text-slate-800">
                                  🩺 {item.vetInCharge || 'Unassigned Local Scout'}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2.5 rounded-xl border border-slate-100">
                              " {item.notes} "
                            </p>
                          </div>

                          {onDeleteQuarantine && (
                            <button
                              onClick={() => onDeleteQuarantine(item.id)}
                              className="text-slate-300 hover:text-red-700 p-2.5 rounded-lg border hover:border-red-100/80 bg-white shadow-xs cursor-pointer m-0 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2A: SECURITY CANINES COOPERATIVE */}
          {livestockSubTab === 'poultry_dogs' && (
            <div className="space-y-6">
              {/* Canine immunization & checkup guide */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900">
                  <Shield size={16} className="text-emerald-700" />
                  <h5 className="text-[11px] font-black tracking-widest uppercase">MANDATORY SECURITY CANINE PROTOCOLS & REMINDERS</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <span className="font-extrabold text-emerald-800 uppercase tracking-wide block">🐕 Guard Canine Checkups & Vaccine Routine:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 font-semibold">
                      <li>Deworming: Every 3 months (Praziquantel compounds)</li>
                      <li>Rabies Booster: Annual mandatory vaccination</li>
                      <li>Multi-Booster (DHLPP): Annual booster against Parvo & Hepatitis</li>
                      <li>Tick/Flea prevention: Monthly veterinary collars check</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wide block">👮 Patrol Guard Duties & Parameters:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 font-semibold">
                      <li>Log all perimeter patrol rounds, gate checks, and kennel cleanings.</li>
                      <li>Report any physical symptoms, changes in energy level, or diet refusal immediately.</li>
                      <li>Record veterinary visits and routine deworming events accurately.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/30 px-2 font-bold select-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Security Canine patrol & medical ledger</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowVetCardModal(true)}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-950 hover:bg-emerald-100 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Generate Vet Canine Health Passport PDF"
                  >
                    <Shield size={13} className="text-emerald-700" />
                    🐶 Vet Passport PDF
                  </button>
                  <button
                    onClick={downloadCanineCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Canine Records CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('livestock')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download Livestock PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setLsType('Dogs');
                    }}
                    className="bg-amber-900 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-amber-800 flex items-center gap-1.5 m-0"
                  >
                    <Plus size={14} /> Add Ledger Log
                  </button>
                </div>
              </div>

              {showAddForm && lsType === 'Dogs' && (
                <form onSubmit={handleLivestockSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4 font-sans text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Unit Type</label>
                      <input
                        type="text"
                        readOnly
                        value="Security Guard Canines"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold bg-slate-50 text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Group ID / Breed / Name</label>
                      <input
                        type="text"
                        required
                        value={lsName}
                        onChange={(e) => setLsName(e.target.value)}
                        placeholder="E.g. Canine Rex or Patrol Pack"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Count or Pedigree Details</label>
                      <input
                        type="text"
                        required
                        value={lsCount}
                        onChange={(e) => setLsCount(e.target.value)}
                        placeholder="E.g. German Shepherd"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-amber-800 uppercase block mb-1">Record Log Date (Historical)</label>
                      <input
                        type="date"
                        required
                        value={lsDate}
                        onChange={(e) => setLsDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Logged Activity</label>
                      <input
                        type="text"
                        required
                        value={lsActivity}
                        onChange={(e) => setLsActivity(e.target.value)}
                        placeholder="E.g. Deworming & annual rabies jab, night patrol round completed"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Additional Observations / Notes</label>
                      <input
                        type="text"
                        value={lsNotes}
                        onChange={(e) => setLsNotes(e.target.value)}
                        placeholder="E.g. Active, high alertness, verified gate sensors..."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 text-right border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-black text-xs uppercase rounded-lg m-0 shadow">
                      Save Activity
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {livestock.filter(item => item.type === 'Dogs').length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold uppercase text-[10.5px]">
                    No canine patrol log entries registered yet.
                  </div>
                ) : (
                  livestock.filter(item => item.type === 'Dogs').map((item) => (
                    <div key={item.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-200">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-800">
                            {item.type} Section
                          </span>
                          <h5 className="font-extrabold text-[13.5px] uppercase text-[#0b251a]">{item.name}</h5>
                          <span className="text-xs font-mono font-bold text-slate-400">({item.countOrBreed})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-705 leading-relaxed bg-slate-50 shrink-0 px-2 py-1 rounded inline-block">
                          <Activity size={12} className="text-amber-700 shrink-0 inline-block mr-1" />
                          <span>Activity: {item.activity}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-505 italic leading-normal">
                          Observational diagnostics: "{item.notes}"
                        </p>
                      </div>
                      <div className="text-left md:text-right shrink-0 flex items-center gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-black text-slate-400 block font-bold">Compiled Timestamp</span>
                          <span className="text-xs font-black font-mono text-slate-705 block mt-1">{item.date}</span>
                        </div>
                        {onEditLivestock && (
                          <button
                            onClick={() => setEditingLivestock(item)}
                            className="text-slate-305 hover:text-indigo-850 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-indigo-105 bg-white shadow-xs"
                          >
                            <PenSquare size={13} />
                          </button>
                        )}
                        {onDeleteLivestock && (
                          <button
                            onClick={() => onDeleteLivestock(item.id)}
                            className="text-slate-305 hover:text-rose-650 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-rose-105 bg-white shadow-xs"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 🐕 VETERINARY CANINE HEALTH PASSPORT MODAL */}
              {showVetCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="bg-slate-950 p-6 text-white flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                          <Shield size={20} className="text-emerald-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[15px] tracking-tight uppercase">🐕 Veterinary Canine Health Passport</h4>
                          <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider mt-0.5">Professional K-9 Pedigree & Treatment Ledger Engine</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowVetCardModal(false)}
                        className="text-slate-400 hover:text-white transition-colors text-lg font-bold p-1 cursor-pointer m-0"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-5 text-left font-sans text-xs">
                      
                      <div className="bg-emerald-50/70 border border-emerald-150 p-4 rounded-2xl text-emerald-950 flex flex-col gap-1.5">
                        <span className="font-black text-[10.5px] uppercase tracking-wide text-emerald-900">📄 Generate High-Standard Vet Records</span>
                        <p className="text-slate-650 font-medium leading-relaxed">
                          This module produces an official, clean single-page PDF Canine Health Passport. You can download an 
                          <strong> Empty Template</strong> to fill out manually in the kennels, or 
                          <strong> Pre-populate</strong> the card with a dog's active historical patrol logs.
                        </p>
                      </div>

                      {/* Dropdown to auto-fill */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Pre-populate from Active Canine Registry</label>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">Optional Helper</span>
                        </div>
                        <select
                          value={selectedCanineId}
                          onChange={(e) => handleSelectCanineToPreFill(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl p-3 font-bold bg-white focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">-- [Blank Template / Manual Input] --</option>
                          {livestock
                            .filter((item, idx, self) => 
                              item.type === 'Dogs' && 
                              self.findIndex(t => t.name === item.name) === idx
                            )
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                🐾 {item.name} ({item.countOrBreed})
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Custom input fields */}
                      <div className="space-y-4">
                        <span className="font-black text-[10.5px] text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
                          Canine Credentials & Pedigree Info
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Official Name</label>
                            <input
                              type="text"
                              value={vetCardName}
                              onChange={(e) => setVetCardName(e.target.value)}
                              placeholder="E.g. Canine Rex"
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breed / Phenotype</label>
                            <input
                              type="text"
                              value={vetCardBreed}
                              onChange={(e) => setVetCardBreed(e.target.value)}
                              placeholder="E.g. German Shepherd (GSD)"
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Microchip or Tag ID</label>
                            <input
                              type="text"
                              value={vetCardChip}
                              onChange={(e) => setVetCardChip(e.target.value)}
                              placeholder="E.g. K9-CHIP-821A"
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white font-mono text-emerald-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date of Birth / Est. Age</label>
                            <input
                              type="date"
                              value={vetCardDob}
                              onChange={(e) => setVetCardDob(e.target.value)}
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Gender / Sex</label>
                            <select
                              value={vetCardGender}
                              onChange={(e) => setVetCardGender(e.target.value)}
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                            >
                              <option value="Male">Male (Intact)</option>
                              <option value="Neutered Male">Neutered Male</option>
                              <option value="Female">Female (Intact)</option>
                              <option value="Spayed Female">Spayed Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Primary Handler Assigned</label>
                            <input
                              type="text"
                              value={vetCardHandler}
                              onChange={(e) => setVetCardHandler(e.target.value)}
                              placeholder="E.g. Corporal Charles Ngetich"
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sire (Father)</label>
                            <input
                              type="text"
                              value={vetCardSire}
                              onChange={(e) => setVetCardSire(e.target.value)}
                              placeholder="E.g. Rocky (Alpha Pack)"
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Dam (Mother)</label>
                            <input
                              type="text"
                              value={vetCardDam}
                              onChange={(e) => setVetCardDam(e.target.value)}
                              placeholder="E.g. Duchess (Bravo Pack)"
                              className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Attending Surgeon / DVM</label>
                          <input
                            type="text"
                            value={vetCardVet}
                            onChange={(e) => setVetCardVet(e.target.value)}
                            placeholder="Dr. Devin Omwenga, DVM"
                            className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 p-6 border-t border-slate-150 flex flex-col sm:flex-row sm:justify-between items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadCanineVetCardPdf(true)}
                        disabled={isGeneratingPdf}
                        className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-700 font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        📄 Download Empty Card
                      </button>

                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setShowVetCardModal(false)}
                          className="px-5 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs uppercase m-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadCanineVetCardPdf(false)}
                          disabled={isGeneratingPdf || !vetCardName}
                          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 m-0 disabled:opacity-50"
                        >
                          {isGeneratingPdf ? (
                            <span className="flex items-center gap-1.5">
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Compiling...
                            </span>
                          ) : (
                            "✨ Download Pre-filled Card"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2B: DAIRY GOAT REGISTER & PRODUCTION */}
          {livestockSubTab === 'goats' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/20 px-1 font-bold">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dairy Goat Registry & Milk yields</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadGoatsCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Goat Directory CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('goats')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download Goats PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-amber-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-amber-900 flex items-center gap-1.5 m-0 font-sans font-bold cursor-pointer"
                  >
                    <Plus size={14} /> Register Dairy Goat
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleGoatSubmit} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-md space-y-4 font-sans text-left">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-900">Add Goats Directory & Wellness Log</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Integrate backdated indices and yield variables</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tag ID / Collar Code</label>
                      <input
                        type="text"
                        required
                        value={gtTag}
                        onChange={(e) => setGtTag(e.target.value)}
                        placeholder="E.g. Goat-204"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breed Class</label>
                      <select
                        value={gtBreed}
                        onChange={(e) => setGtBreed(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                      >
                        <option value="Toggenburg">Toggenburg (Premium Dairy)</option>
                        <option value="Alpine">Alpine (High Yield)</option>
                        <option value="Saanen">Saanen (White Dairy)</option>
                        <option value="Galla">Galla (Hardy East-African)</option>
                        <option value="Boer">Boer (Meat Class)</option>
                        <option value="Cross">Crossbreed Utility</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Purpose Class</label>
                      <select
                        value={gtPurpose}
                        onChange={(e) => setGtPurpose(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                      >
                        <option value="Dairy">Dairy (Squeeze Milk)</option>
                        <option value="Meat">Meat / Breeding Sire</option>
                        <option value="Breeding">Rebreeding Doe</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-amber-800 uppercase block mb-1">Log Date (Historical)</label>
                      <input
                        type="date"
                        required
                        value={gtDate}
                        onChange={(e) => setGtDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>
                    {gtPurpose === 'Dairy' && (
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Daily yield (Liters)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={gtMilk}
                          onChange={(e) => setGtMilk(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="Liters per day"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                    )}
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Primary Activity</label>
                      <input
                        type="text"
                        required
                        value={gtActivity}
                        onChange={(e) => setGtActivity(e.target.value)}
                        placeholder="E.g. Hoof trimming, Albendazole deworming, weathers weight..."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breeding Remarks & Wellness</label>
                      <input
                        type="text"
                        value={gtNotes}
                        onChange={(e) => setGtNotes(e.target.value)}
                        placeholder="E.g. Twins kidding, high udder confirmation, dewormed on 20th"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-amber-950 text-white font-black text-xs uppercase rounded-lg m-0 hover:bg-amber-900 shadow">
                      Save Record
                    </button>
                  </div>
                </form>
              )}

              {/* Goat Cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goatRecords.map((gt) => (
                  <div key={gt.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-[#5d4037] text-sm uppercase tracking-wide block">{gt.tagId}</span>
                          <span className="text-[9px] bg-amber-50 text-amber-800 border uppercase px-2 py-0.5 mt-1 inline-block font-black rounded-lg">
                            {gt.breed} breed
                          </span>
                        </div>
                        {onEditGoatRecord && (
                          <button
                            onClick={() => setEditingGoat(gt)}
                            className="text-slate-300 hover:text-indigo-650 p-1 rounded-lg transition-all m-0 hover:bg-slate-50"
                            title="Edit Goat record"
                          >
                            <PenSquare size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteGoatRecord(gt.id)}
                          className="text-slate-300 hover:text-red-600 p-1 rounded-lg transition-all m-0 hover:bg-slate-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] leading-snug">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Purpose</span>
                          <span className="font-bold text-slate-700 block mt-0.5">{gt.purpose}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Yield</span>
                          <span className="font-bold text-slate-700 block mt-0.5 font-mono">
                            {gt.milkYieldLiters ? `${gt.milkYieldLiters} Liters/d` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 space-y-1 bg-slate-50/40 p-2.5 border rounded-xl">
                        <span className="text-[9px] uppercase font-black text-slate-405 block">Current Activity log</span>
                        <span className="text-xs text-slate-750 font-black block">{gt.activity}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-1">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase">Observation details:</span>
                      <p className="text-xs text-slate-500 font-medium italic">"{gt.notes}"</p>
                      <span className="text-[9px] font-mono text-slate-400 block text-right">Updated: {gt.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 2C: CALF LIFESPAN FLOW PILES */}
          {livestockSubTab === 'calves' && (
            <div className="space-y-6">
              {/* BRAND NEW: EDUCATIONAL & INTERACTIVE CALF WEANING REGISTER ADVISER */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl space-y-6 shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] bg-emerald-500 font-extrabold text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">Veterinary Rearing & Growth Science</span>
                      <span className="text-[9.5px] bg-slate-800 text-slate-350 border border-slate-705 px-2 py-0.5 rounded uppercase font-bold">Interactive Weaning Targetizer</span>
                    </div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span>🍼 Calving & Optimal Weaning weight Advisor</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-bold">
                      Maximize heifer puberty growth, rumen papillae development, and immunity transfer. Standard dairy guidelines recommend weaning calves once they double their birth weight and consume at least 1.5 KG of calf starter pellets daily.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Interactive Inputs */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">Weaning Sim Configuration</span>
                    
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                        Calf Birth Weight: <span className="font-mono text-emerald-400 font-extrabold">{calfBirthWeight} KG</span>
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="50"
                        step="1"
                        value={calfBirthWeight}
                        onChange={(e) => setCalfBirthWeight(parseInt(e.target.value))}
                        className="w-full accent-emerald-550 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                        Target Weaning Age: <span className="font-mono text-emerald-400 font-extrabold">{calfTargetAgeWeeks} Weeks ({calfTargetAgeWeeks * 7} Days)</span>
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="16"
                        step="1"
                        value={calfTargetAgeWeeks}
                        onChange={(e) => setCalfTargetAgeWeeks(parseInt(e.target.value))}
                        className="w-full accent-emerald-550 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Calculated Milestones</span>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs leading-none">
                        <div>
                          <span className="text-[9px] text-slate-450 block uppercase font-bold">Birth weight</span>
                          <span className="text-sm font-extrabold text-white mt-1 block">{calfBirthWeight} KG</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-450 block uppercase font-bold">Target Weaning Weight</span>
                          <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{calfBirthWeight * 2} KG</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-slate-800/80">
                          <span className="text-[9px] text-slate-455 text-slate-400 block uppercase font-bold">Total Gain Required</span>
                          <span className="text-sm font-extrabold text-white mt-1 block">{calfBirthWeight} KG</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <span className="text-[9px] font-black text-indigo-300 block uppercase mb-1">Target Average Daily Gain (ADG)</span>
                      <div className="text-2xl font-black text-white font-mono tracking-tight leading-none">
                        {((calfBirthWeight / (calfTargetAgeWeeks * 7)) * 1000).toFixed(0)} <span className="text-xs text-slate-400 font-sans uppercase font-extrabold">g / Day</span>
                      </div>
                    </div>
                  </div>

                  {/* dynamic feeding advisor based on ADG */}
                  <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between text-xs font-semibold leading-relaxed">
                    <div>
                      <span className="text-[10px] uppercase font-black text-yellow-405 text-yellow-400 block mb-2">🌿 ADG FEED RECOMMENDATION</span>
                      {(() => {
                        const adg = (calfBirthWeight / (calfTargetAgeWeeks * 7)) * 1000;
                        if (adg > 650) {
                          return (
                            <p className="text-slate-300">
                              <strong>High Performance:</strong> To achieve over <span className="text-white">650g/day</span>, feed colostrum early (within 2h). Administer premium <strong>Creep Starter pellets</strong> (at least 20% Crude Protein) beginning day 10. Limit fiber intake until rumen is matured.
                            </p>
                          );
                        } else if (adg > 500) {
                          return (
                            <p className="text-slate-300">
                              <strong>Steady Moderate ADG:</strong> Requires feeding at least 4-5 Liters whole clean milk daily (at 38°C) split into two feeds. Keep dry starter grains free choice with plenty of clean water to initiate rumen fermentation.
                            </p>
                          );
                        } else {
                          return (
                            <p className="text-slate-300">
                              <strong>Gradual Growth Plan:</strong> Feed 4 Liters milk daily. Rumen development will be slower; ensure calf has constant access to mineral salt block and young tender Rhodes grass leaf (avoid tough stalks).
                            </p>
                          );
                        }
                      })()}
                    </div>
                    <div className="text-[10.5px] bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-yellow-300 mt-2">
                       💡 <strong>Rule of thumb:</strong> Do NOT wean by age alone. Wean only when the calf eats 1.5 KG of dry calf starter pellet daily for 3 consecutive days.
                    </div>
                  </div>
                </div>

                {/* Educational Bento Feed Timeline */}
                <div className="border-t border-slate-850 pt-5 space-y-3">
                  <span className="text-[10px] uppercase font-black text-slate-405 text-slate-400 tracking-wider block">Optimal Calf Feeding Weaning Protocol Timeline</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium leading-relaxed text-slate-300">
                    <div className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl space-y-2">
                      <span className="text-[9.5px] bg-amber-500/10 text-amber-300 font-extrabold px-2 py-0.5 rounded block uppercase w-fit">Days 1 - 3</span>
                      <h5 className="font-extrabold text-white text-xs">The Colostrum Shield</h5>
                      <p className="text-[11px] leading-snug">
                        Feed colostrum equal to <strong>10% of birth weight</strong> (e.g. 3.5L for a 35kg calf) within 2 hours of birth. This transfers crucial maternal antibodies before gut closure.
                      </p>
                    </div>

                    <div className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl space-y-2">
                      <span className="text-[9.5px] bg-emerald-500/10 text-emerald-300 font-extrabold px-2 py-0.5 rounded block uppercase w-fit">Weeks 2 - 8</span>
                      <h5 className="font-extrabold text-white text-xs">Liquid Milk & Starter</h5>
                      <p className="text-[11px] leading-snug">
                        Feed 5-6 Liters milk daily (divided in two). Introduce sweet <strong>Calf Starter Creep Meal</strong> (18-20% crude protein) from day 10. Grain fermentation produces butyrate to grow rumen papillae.
                      </p>
                    </div>

                    <div className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl space-y-2">
                      <span className="text-[9.5px] bg-blue-500/10 text-blue-300 font-extrabold px-2 py-0.5 rounded block uppercase w-fit">Weeks 9 - 10</span>
                      <h5 className="font-extrabold text-white text-xs">Milk Deceleration</h5>
                      <p className="text-[11px] leading-snug">
                        Once starter feed intake reaches 1.0 KG daily, cut milk volume by half (single morning feeds of 2-3 Liters). This triggers the calf to eat search alternative nutrition form of dry starter.
                      </p>
                    </div>

                    <div className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl space-y-2">
                      <span className="text-[9.5px] bg-indigo-500/10 text-indigo-300 font-extrabold px-2 py-0.5 rounded block uppercase w-fit">Weeks 11+</span>
                      <h5 className="font-extrabold text-white text-xs">Weaning Complete</h5>
                      <p className="text-[11px] leading-snug">
                        Stop milk entirely once the calf consumes 1.5 KG dry starter pellets. Complete transition to weaner pellets, fine legumes, and unlimited clean dry water.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/20 px-1 font-bold">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Liquid-fed Calves pipeline</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCalvesCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Calves Directory CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('calves')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download Calves PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-amber-955 bg-amber-900 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-amber-800 flex items-center gap-1.5 m-0 font-sans font-bold"
                  >
                    <Plus size={14} /> Register Young Calf
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleCalfSubmit} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-md space-y-4 font-sans text-left">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-emerald-950">Log New Calf Profile & Pedigree</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Capture birth data, feed metrics, and logs</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf ID Tag (Unique)</label>
                      <input
                        type="text"
                        required
                        value={cfId}
                        onChange={(e) => setCfId(e.target.value)}
                        placeholder="E.g. Calf-903"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf Friendly Name</label>
                      <input
                        type="text"
                        value={cfName}
                        onChange={(e) => setCfName(e.target.value)}
                        placeholder="E.g. Spot (Optional)"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf Biological Sex</label>
                      <select
                        value={cfSex}
                        onChange={(e) => setCfSex(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold"
                      >
                        <option value="Female">Female (Heifer)</option>
                        <option value="Male">Male (Bull)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Dam Mother Cow ID</label>
                      <input
                        type="text"
                        value={cfDam}
                        onChange={(e) => setCfDam(e.target.value)}
                        placeholder="E.g. Cow-101 (Daisy)"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calving Date (DOB)</label>
                      <input
                        type="date"
                        required
                        value={cfDob}
                        onChange={(e) => setCfDob(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-emerald-800 uppercase block mb-1">Log Date (Historical)</label>
                      <input
                        type="date"
                        required
                        value={cfDate}
                        onChange={(e) => setCfDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>
                    {!cfWeaned && (
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Daily Milk volume (Liters)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.5"
                          value={cfMilk}
                          onChange={(e) => setCfMilk(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="Liters daily"
                          className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Creep Starter feed date</label>
                      <input
                        type="date"
                        value={cfCreepDate}
                        onChange={(e) => setCfCreepDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2 py-3">
                      <input
                        type="checkbox"
                        id="cfWeaned"
                        checked={cfWeaned}
                        onChange={(e) => setCfWeaned(e.target.checked)}
                        className="w-4 h-4 text-emerald-800 border-slate-300 rounded cursor-pointer"
                      />
                      <label htmlFor="cfWeaned" className="text-[10px] font-black text-slate-500 uppercase block cursor-pointer select-none">
                        Successfully Weaned (No Milk Fed)
                      </label>
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observation Diagnostics & Health logs</label>
                      <input
                        type="text"
                        value={cfNotes}
                        onChange={(e) => setCfNotes(e.target.value)}
                        placeholder="E.g. Fed active, consuming mineral salt block. Healthy fecal structure."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0 shadow hover:bg-emerald-900 cursor-pointer">
                      Commit Calf Profile
                    </button>
                  </div>
                </form>
              )}

              {/* Calf grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {calfRecords.map((cf) => {
                  const birthDate = new Date(cf.dob);
                  const now = new Date();
                  const ageDays = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={cf.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-[#2e7d32] text-sm uppercase tracking-wide block">
                              {cf.calfId} {cf.calfName ? `(${cf.calfName})` : ''}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[9.5px] font-black uppercase px-2 py-0.2 rounded border ${
                                cf.sex === 'Male' ? 'bg-blue-50 text-blue-805 border-blue-150' : 'bg-pink-50 text-pink-805 border-pink-150'
                              }`}>
                                👩‍👧 {cf.sex || 'Female'}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-450 block mt-1">Dam / Mother: <span className="text-slate-650 font-extrabold">{cf.damId}</span></span>
                          </div>
                          {onEditCalfRecord && (
                            <button
                              onClick={() => setEditingCalf(cf)}
                              className="text-slate-300 hover:text-indigo-650 p-1.5 rounded transition-all m-0 border border-transparent hover:border-slate-100 hover:bg-slate-50"
                              title="Edit Calf record"
                            >
                              <PenSquare size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteCalfRecord(cf.id)}
                            className="text-slate-300 hover:text-red-650 p-1.5 rounded transition-all m-0 border border-transparent hover:border-slate-100 hover:bg-slate-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] leading-snug">
                          <div className="bg-slate-50 p-2 border border-slate-50 rounded-xl">
                            <span className="text-[9px] uppercase font-black text-slate-400 block">Lifespan Age</span>
                            <span className="font-bold text-slate-700 block mt-0.5 font-mono">{ageDays} days on farm</span>
                          </div>
                          <div className="bg-slate-50 p-2 border border-slate-50 rounded-xl">
                            <span className="text-[9px] uppercase font-black text-slate-400 block">Daily Feeding</span>
                            <span className={`font-bold block mt-0.5 ${cf.weaned ? 'text-slate-400 line-through' : 'text-emerald-800'}`}>
                              {cf.weaned ? 'Weaned' : `${cf.milkIntakeLiters} L Milk`}
                            </span>
                          </div>
                        </div>

                        {cf.creepFeedIntroDate && (
                          <div className="mt-3.5 p-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle size={10} />
                            <span>Creep Feed Activated: {cf.creepFeedIntroDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[9px] text-slate-405 font-extrabold uppercase block">Growth remarks:</span>
                        <p className="text-xs text-slate-500 font-semibold italic">"{cf.notes}"</p>
                        <span className="text-[9px] text-slate-400 font-mono block text-right">Logged: {cf.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB 2D: BLACK SOLDIER FLY PROTEIN CYCLES */}
          {livestockSubTab === 'bsf' && (
            <div className="space-y-6">
              {/* Informative BSF protein guidelines container */}
              <div className="bg-zinc-850 bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-3 text-slate-100">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-yellow-400 shrink-0" />
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-yellow-400">BLACK SOLDIER FLY (BSF) REVENUE FLUID STAGES</h5>
                </div>
                <p className="text-xs text-slate-350 font-medium leading-relaxed">
                  BSF larvae act as organic recycling engines. They compost fruit pulp (e.g., avocado waste) and dairy manure into dried high-protein crude animal feed grids to bypass expensive soya/fish meal imports.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <span className="font-bold text-white block">1. Inoculation</span>
                    <span className="text-slate-400">Egg 5-day hatch onto waste feed substrate.</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <span className="font-bold text-white block">2. Larvae Feeding</span>
                    <span className="text-slate-400">Voracious consumption, high dry matter.</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <span className="font-bold text-white block">3. Harvest</span>
                    <span className="text-slate-400">Washed, solar-dried larvae feed.</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <span className="font-bold text-white block">4. Love Cage</span>
                    <span className="text-slate-400">Adult fly re-breeding egg collection cycles.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/20 px-1 font-bold">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Organic Grub Inoculation Ledger</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadBsfCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export BSF Batches CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export CSV
                  </button>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('bsf')}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
                      title="Download BSF PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-zinc-900 hover:bg-zinc-850 text-white font-black text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-1.5 m-0 font-sans font-bold"
                  >
                    <Plus size={14} /> Log BSF Batch
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleBsfSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 font-sans text-left">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900">Log Insect Grubs Batch & Protein Cycle</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Track eggs inoculation, larvae size harvested, and dates</p>
                  </div>

                  {/* BSF Quick Presets */}
                  <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-2">
                    <span className="text-[9.5px] uppercase font-black text-amber-800 tracking-wider flex items-center gap-1">
                      👑 SECURE BSF COMPREHENSIVE BIOMASS PRESETS
                    </span>
                    <p className="text-[10.5px] text-slate-600 leading-tight">Click one to pre-fill standard protein recycling substrate ratios:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {[
                        { label: '🥑 Avocado Pulp Eco-cycle', substrate: 'Waste Avocado skins & discarded pulp seeds', target: 'BSF-AVO-RECYCLE', larvae: 4.5, status: 'Harvest' as const, notes: 'Thermophilic digestion of lipids inside avocado waste' },
                        { label: '🌽 Maize Germ Sweepings', substrate: 'Maize germ floor sweepings & bran husk mix', target: 'BSF-MAIZE-BRAN', larvae: 2.8, status: 'Harvest' as const, notes: 'Dry carbohydrate substrate inoculation with high weight return' },
                        { label: '🌾 Brewers Spent Grain', substrate: 'Spent malted barley grain from local micro-breweries', target: 'BSF-BREW-MALT', larvae: 5.2, status: 'Harvest' as const, notes: 'Highly pre-digested nitrogen-rich substrate with peak pupae outcomes' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const code = `${preset.target}-${Math.floor(100 + Math.random() * 900)}`;
                            setBsBatchId(code);
                            setBsSubstrate(preset.substrate);
                            setBsLarvae(preset.larvae);
                            setBsStatus(preset.status);
                            setBsNotes(preset.notes);
                            const prevDate = new Date();
                            prevDate.setDate(prevDate.getDate() - 14);
                            setBsInoculation(prevDate.toISOString().split('T')[0]);
                          }}
                          className="text-left bg-white hover:bg-amber-50 p-2.5 rounded-xl border border-slate-200 hover:border-amber-350 text-[10.5px] text-slate-700 transition-all font-bold m-0 flex flex-col justify-between cursor-pointer shadow-xs"
                        >
                          <span className="text-slate-900 font-extrabold truncate">{preset.label}</span>
                          <span className="text-[9px] text-amber-700 font-mono mt-0.5 font-bold">Inoculate: ~14d cycle • {preset.larvae} KG</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Batch ID Code</label>
                      <input
                        type="text"
                        required
                        value={bsBatchId}
                        onChange={(e) => setBsBatchId(e.target.value)}
                        placeholder="E.g. BSF-BATCH-105"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Substrate Ingredient waste</label>
                      <input
                        type="text"
                        required
                        value={bsSubstrate}
                        onChange={(e) => setBsSubstrate(e.target.value)}
                        placeholder="E.g. Waste Avocado skin, Maize germ sweepings"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inoculation Date</label>
                      <input
                        type="date"
                        required
                        value={bsInoculation}
                        onChange={(e) => setBsInoculation(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-800 uppercase block mb-1">Log Date (Historical)</label>
                      <input
                        type="date"
                        required
                        value={bsDate}
                        onChange={(e) => setBsDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Larvae Harvested Volume (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bsLarvae}
                        onChange={(e) => setBsLarvae(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Recycle Stage Status</label>
                      <select
                        value={bsStatus}
                        onChange={(e) => setBsStatus(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-bold cursor-pointer text-slate-600"
                      >
                        <option value="Inoculation">Inoculation stage (Eggs)</option>
                        <option value="Larvae Feeding">Larvae Feeding stage</option>
                        <option value="Harvested">Harvested dry meal stage</option>
                        <option value="Love Cage Breeding">Love Cage Breeding (Adult flies)</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Decomposition Notes / Temperature logs</label>
                      <input
                        type="text"
                        value={bsNotes}
                        onChange={(e) => setBsNotes(e.target.value)}
                        placeholder="E.g. Heavy moisture sweepings. Grubs sized out rapidly."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs uppercase rounded-lg m-0 shadow cursor-pointer">
                      Log Fly Batch
                    </button>
                  </div>
                </form>
              )}

              {/* BSF Batch lists */}
              <div className="space-y-4">
                {bsfRecords.map((batch) => (
                  <div key={batch.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          batch.status === 'Harvested' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                          batch.status === 'Larvae Feeding' ? 'bg-yellow-50 text-yellow-800 border-yellow-150' :
                          'bg-zinc-50 border-zinc-200 text-slate-800'
                        }`}>
                          {batch.status}
                        </span>
                        <h5 className="font-extrabold text-[#2c3e50] text-sm uppercase block">{batch.batchId}</h5>
                      </div>
                      <p className="text-xs leading-normal font-black text-slate-705 bg-slate-50 px-2 py-1 rounded inline-block">
                        Recycle Substrate Waste: <span className="font-extrabold text-slate-800">{batch.substrateType}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 font-bold block">
                        <span>Inoculated: {batch.inoculationDate}</span>
                        <span>•</span>
                        <span className="text-emerald-800 font-black">Harvest volume: {batch.larvaeHarvestedKg || 'Growing...'} KG grubs</span>
                      </div>
                    </div>

                    <div className="text-left md:text-right shrink-0 flex items-center gap-4">
                      <p className="text-xs font-medium text-slate-500 italic max-w-xs truncate">
                        "{batch.notes}"
                      </p>
                      {onEditBsfRecord && (
                        <button
                          onClick={() => setEditingBsf(batch)}
                          className="text-slate-305 hover:text-indigo-850 p-2 border border-slate-100 hover:border-indigo-105 rounded-xl bg-white shadow-xs"
                        >
                          <PenSquare size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteBsfRecord(batch.id)}
                        className="text-slate-300 hover:text-red-650 p-2 border border-slate-100 hover:border-red-105 rounded-xl bg-white shadow-xs"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {livestockSubTab === 'operations' && (
            <div className="space-y-6">
              {/* Operations Banner */}
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-950">
                  <ClipboardList size={18} className="text-amber-800" />
                  <h5 className="text-[11px] font-black tracking-widest uppercase">ALL-ANIMAL OPERATIONS & SERVICES FEED</h5>
                </div>
                <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                  This unified log lists all operations under Dairy Cows (AI breedings & Vet interventions), Goat milking/checks, young Calving rosters, BSF insect bins, and Poultry booster drops.
                </p>
              </div>

              {/* Feed Display Container */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b w-full">
                  <div className="flex flex-col">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">Operational Timeline Feed</h5>
                    <div className="text-[11px] font-mono text-slate-400 font-bold mt-0.5">
                      Showing operations across past, present, and future scheduled tasks.
                    </div>
                  </div>
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('livestock')}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 font-bold text-[10px] uppercase rounded-lg transition-all shadow-md cursor-pointer m-0 font-bold"
                      title="Download Livestock Operations PDF Report"
                    >
                      <Download size={12} />
                      Download PDF Report
                    </button>
                  )}
                </div>

                {/* Combined Operations Feed Item mapper */}
                <div className="space-y-4">
                  {(() => {
                    const combinedOps: any[] = [];
                    // 1. Vet records
                    (vetRecords || []).forEach(v => {
                      combinedOps.push({
                        id: `v-${v.id || Math.random()}`,
                        type: 'veterinary',
                        category: 'Cow',
                        title: `Medical Treatment | ${v.treatment || 'Treatment'}`,
                        date: v.date || 'No Date',
                        details: v.notes || 'Routine checkup/drug injection.',
                        badgeColor: 'bg-red-50 text-red-800 border-red-150',
                        cost: v.cost ? `Cost: Ksh ${v.cost}` : undefined,
                        staff: v.recorder || 'On-Call Vet'
                      });
                    });

                    // 2. AI records
                    (aiRecords || []).forEach(ai => {
                      combinedOps.push({
                        id: `ai-${ai.cowId || Math.random()}-${ai.date}`,
                        type: 'ai',
                        category: 'Cow',
                        title: `Artificial Insemination (AI Service) - Dam: ${ai.cowId}`,
                        date: ai.date || 'No Date',
                        details: `Bull Semen: ${ai.bull} • Status: ${ai.status} • Scheduled Due: ${ai.due}`,
                        badgeColor: 'bg-purple-50 text-purple-800 border-purple-150',
                        staff: 'AI Vet Tech'
                      });
                    });

                    // 3. Goat records
                    (goatRecords || []).forEach(gt => {
                      combinedOps.push({
                        id: `gt-${gt.id}`,
                        type: 'milking/activity',
                        category: 'Goat',
                        title: `Dairy Goat record | Tag: ${gt.tagId}`,
                        date: gt.date || 'No Date',
                        details: `Yield: ${gt.milkYieldLiters || 0}L • Purpose: ${gt.purpose} • Activity: ${gt.activity} • ${gt.notes}`,
                        badgeColor: 'bg-amber-50 text-amber-800 border-amber-150',
                        staff: 'Goat Specialist'
                      });
                    });

                    // 4. Calf records
                    (calfRecords || []).forEach(cf => {
                      combinedOps.push({
                        id: `cf-${cf.id}`,
                        type: 'calving/feed',
                        category: 'Calf',
                        title: `Young Calf Activity | Tag: ${cf.calfId} ${cf.calfName ? `(${cf.calfName})` : ''}`,
                        date: cf.date || cf.dob || 'No Date',
                        details: `Sex: ${cf.sex || 'Female'} • Milk intake: ${cf.milkIntakeLiters}L • Weaned: ${cf.weaned ? 'Yes' : 'No'} • ${cf.notes}`,
                        badgeColor: 'bg-emerald-50 text-emerald-805 border-emerald-150',
                        staff: 'Nursery Attendant'
                      });
                    });

                    // 5. Poultry & canine records (livestock prop)
                    (livestock || []).forEach(ls => {
                      combinedOps.push({
                        id: `ls-${ls.id}`,
                        type: 'poultry_dog',
                        category: ls.type === 'Poultry' ? 'Poultry' : 'Dog',
                        title: `${ls.type} Log | Name/Breed: ${ls.name}`,
                        date: ls.date || 'No Date',
                        details: `Count/Breed Info: ${ls.countOrBreed} • Log Activity: ${ls.activity} • ${ls.notes || ''}`,
                        badgeColor: 'bg-indigo-50 text-indigo-805 border-indigo-150',
                        staff: 'Avian/K9 Warden'
                      });
                    });

                    // 6. BSF batch records
                    (bsfRecords || []).forEach(b => {
                      combinedOps.push({
                        id: `b-${b.id}`,
                        type: 'bsf',
                        category: 'BSF',
                        title: `Black Soldier Fly Inoculation | Batch: ${b.batchId}`,
                        date: b.inoculationDate || 'No Date',
                        details: `Substrate Waste: ${b.substrateType} • Yield Target: ${b.larvaeHarvestedKg || 'Growing'} KG • Status: ${b.status} • ${b.notes}`,
                        badgeColor: 'bg-zinc-150 text-zinc-900 border-zinc-200',
                        staff: 'Biogas & Larvae Team'
                      });
                    });

                    // Sort combined entries by date desc (future dates first, then past)
                    combinedOps.sort((a,b) => b.date.localeCompare(a.date));

                    if (combinedOps.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 font-bold">
                          No operations logged across the farm directories. Log individual entries to populate feed timelines.
                        </div>
                      );
                    }

                    return combinedOps.map(op => (
                      <div key={op.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${op.badgeColor}`}>
                              {op.category}
                            </span>
                            <h6 className="text-[13px] font-extrabold text-[#2c3e50] uppercase">{op.title}</h6>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                            {op.details}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold font-mono">
                            <span>Scheduled/Done Date: <span className="text-slate-700 font-extrabold">{op.date}</span></span>
                            {op.cost && <span className="text-red-700 uppercase font-black">• {op.cost}</span>}
                          </div>
                        </div>
                        <div className="shrink-0 text-left md:text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Operator assigned</span>
                          <span className="text-[11px] font-black text-slate-705 block mt-0.5">{op.staff}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {livestockSubTab === 'sales_mortality' && (
            <div className="space-y-6">
              {/* Sales & Mortality Stats */}
              <div className="grid grid-cols-1 md:flex-row md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-3xl flex items-center gap-4 w-full">
                  <div className="p-3 bg-emerald-100 text-emerald-950 rounded-2xl shrink-0">
                    <TrendingUp size={24} className="text-emerald-800" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-emerald-955 tracking-wider">Total Livestock Sales Revenues</h5>
                    <p className="text-xl font-black text-emerald-900 font-mono mt-1">
                      Ksh {(animalSales || []).reduce((acc, s) => acc + (s.price || 0) * (s.qty || 1), 0).toLocaleString()}
                    </p>
                    <span className="text-[9px] text-slate-455 font-bold block mt-0.5">Calculated across sales ledger lines</span>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-205 p-5 rounded-3xl flex items-center gap-4 w-full">
                  <div className="p-3 bg-rose-100 text-rose-955 rounded-2xl shrink-0">
                    <Skull size={24} className="text-rose-805" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-rose-955 tracking-wider">Total Mortalities recorded</h5>
                    <p className="text-xl font-black text-rose-900 font-mono mt-1">
                      {(mortalities || []).reduce((acc, m) => acc + (m.count || 1), 0)} Animals Deceased
                    </p>
                    <span className="text-[9px] text-slate-455 font-bold block mt-0.5">Loss minimization tracking active</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to trigger Adding forms */}
              <div className="flex flex-col md:flex-row bg-slate-100 p-1.5 rounded-2xl border justify-between items-center w-full gap-2 md:gap-0">
                <span className="text-[10px] font-black text-slate-405 uppercase tracking-widest block ml-2">Add Sales Event / Mortality drop</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {onTriggerSectionReport && (
                    <button
                      onClick={() => onTriggerSectionReport('livestock')}
                      type="button"
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 font-bold"
                      title="Download Livestock Sales & Mortality PDF Report"
                    >
                      <Download size={13} />
                      Download PDF Report
                    </button>
                  )}
                  <button
                    onClick={() => { setShowAddForm(!showAddForm); setAsCategory('Poultry'); }}
                    className="bg-emerald-900 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl hover:bg-emerald-805 flex items-center gap-1.5 m-0"
                  >
                    <Plus size={14} /> Log Livestock Sale
                  </button>
                  <button
                    onClick={() => { setShowAddForm(!showAddForm); setMCategory('Poultry'); }}
                    className="bg-rose-900 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl hover:bg-rose-805 flex items-center gap-1.5 m-0"
                  >
                    <Plus size={14} /> Log Deceased Mortality
                  </button>
                </div>
              </div>

              {/* TWO SEPARATE ADD FORMS */}
              {showAddForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-150 shadow-inner">
                  {/* Form 1: Add Livestock Sale */}
                  <form onSubmit={handleAnimalSaleSubmit} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-md space-y-4">
                    <h5 className="text-xs uppercase font-black tracking-widest text-emerald-800 border-b pb-2 flex items-center gap-1">💰 Add Animal Sale record</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Class Type</label>
                        <select
                          value={asCategory}
                          onChange={(e) => setAsCategory(e.target.value as any)}
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full bg-white font-bold text-slate-705"
                        >
                          <option value="Poultry">Poultry / Layers</option>
                          <option value="Dog">Security Canine / Puppy</option>
                          <option value="Goat">Dairy Goat</option>
                          <option value="Calf">Milk-fed Calf</option>
                          <option value="Cow">Adult Dairy Cow</option>
                          <option value="Other">Other Livestock</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Animal Tag ID / Flock ID</label>
                        <input
                          type="text"
                          required
                          value={asAnimalIdOrBatch}
                          onChange={(e) => setAsAnimalIdOrBatch(e.target.value)}
                          placeholder="e.g. Layers Flock 3 or Tag-51"
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Head count / Bird Qty</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={asQty}
                          onChange={(e) => setAsQty(e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sale price (Ksh / Head)</label>
                        <input
                          type="number"
                          required
                          min="50"
                          value={asPrice}
                          onChange={(e) => setAsPrice(e.target.value === '' ? '' : parseInt(e.target.value))}
                          placeholder="Sale price amount"
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold font-mono text-emerald-805"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Est Weight KG (Optional)</label>
                        <input
                          type="number"
                          value={asWeightKg}
                          onChange={(e) => setAsWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="Optional"
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Buyer name / Market</label>
                        <input
                          type="text"
                          value={asBuyer}
                          onChange={(e) => setAsBuyer(e.target.value)}
                          placeholder="E.g. Nairobi Agritrade"
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Invoice / Receipt Reference</label>
                        <input
                          type="text"
                          value={asRef}
                          onChange={(e) => setAsRef(e.target.value)}
                          placeholder="Optional invoice number"
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Invoice Sales date (Allows Past / Future)</label>
                        <input
                          type="date"
                          required
                          value={asDate}
                          onChange={(e) => setAsDate(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sales Ledger Notes</label>
                        <textarea
                          value={asNotes}
                          onChange={(e) => setAsNotes(e.target.value)}
                          rows={2}
                          className="text-xs border border-slate-200 rounded-lg p-2 text-slate-655 w-full"
                          placeholder="Provide details about delivery contract, buyer terms..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="submit" className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-900 border hover:bg-emerald-805 text-white rounded-xl cursor-pointer">Confirm Sale Transaction</button>
                    </div>
                  </form>

                  {/* Form 2: Add Mortality */}
                  <form onSubmit={handleMortalitySubmit} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-md space-y-4">
                    <h5 className="text-xs uppercase font-black tracking-widest text-[#d32f2f] border-b pb-2 flex items-center gap-1">💀 Add Deceased Mortality Record</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Class Type</label>
                        <select
                          value={mCategory}
                          onChange={(e) => setMCategory(e.target.value as any)}
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full bg-white font-bold text-slate-705"
                        >
                          <option value="Poultry">Poultry / Layers</option>
                          <option value="Dog">Security Canine / Puppy</option>
                          <option value="Goat">Dairy Goat</option>
                          <option value="Calf">Milk-fed Calf</option>
                          <option value="Cow">Adult Dairy Cow</option>
                          <option value="Other">Other Livestock</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Animal Tag ID / Flock ID</label>
                        <input
                          type="text"
                          required
                          value={mAnimalIdOrBatch}
                          onChange={(e) => setMAnimalIdOrBatch(e.target.value)}
                          placeholder="e.g. Flock B (broilers) or Goat-35"
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Deceased Head count</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={mCount}
                          onChange={(e) => setMCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Deceased (Allows Past / Future)</label>
                        <input
                          type="date"
                          required
                          value={mDate}
                          onChange={(e) => setMDate(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Diagnosed Cause of Death</label>
                      <input
                        type="text"
                        required
                        value={mCauseOfDeath}
                        onChange={(e) => setMCauseOfDeath(e.target.value)}
                        placeholder="E.g. suspected Coccidiosis breakout, pneumonia"
                        className="text-xs border border-slate-200 rounded-lg p-2.5 w-full font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="mVetConfirmed"
                        checked={mVetConfirmed}
                        onChange={(e) => setMVetConfirmed(e.target.checked)}
                        className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="mVetConfirmed" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Veterinary doctor autopsied / confirmed cause</label>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observations & Biosecurity action</label>
                      <textarea
                        value={mNotes}
                        onChange={(e) => setMNotes(e.target.value)}
                        rows={2}
                        className="text-xs border border-[#ddd] rounded-lg p-2 w-full text-slate-655"
                        placeholder="Log disinfection protocols, biosecurity cleanup operations, disposal method..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="submit" className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-rose-900 hover:bg-rose-805 text-white rounded-xl cursor-pointer">Log Loss Decease Event</button>
                    </div>
                  </form>
                </div>
              )}

              {/* TWIN LEDGERS TABULATION */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                {/* Sale ledger list card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider">Active Livestock Sales Ledger</h5>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{(animalSales || []).length} Transaction lines</span>
                  </div>
                  <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
                    {(animalSales || []).length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold">No animal sales transaction records logged.</div>
                    ) : (
                      (animalSales || []).map((sale) => (
                        <div key={sale.id} className="p-3 border border-slate-50 bg-slate-50/45 rounded-xl flex justify-between items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[8.5px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-150 px-1.5 py-0.2 rounded">{sale.category}</span>
                              <span className="font-extrabold text-[#2c3e50] text-xs uppercase">{sale.animalIdOrBatch}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-605">Qty: <span className="font-extrabold text-slate-855">{sale.qty}</span> • Buyer: <span className="font-extrabold text-slate-855">{sale.buyer}</span> • Ref: <span className="font-mono text-indigo-900 font-bold">{sale.ref}</span></p>
                            <p className="text-[10px] text-slate-400 font-bold font-mono">Sale Date: {sale.date} {sale.weightKg && `• Weight: ${sale.weightKg} KG`}</p>
                            {sale.notes && <p className="text-[10.5px] font-medium text-slate-550 block italic">"{sale.notes}"</p>}
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-2">
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Yield</span>
                              <span className="text-xs font-black text-emerald-805 font-mono">Ksh {((sale.price || 0) * (sale.qty || 1)).toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => onDeleteAnimalSale(sale.id)}
                              className="text-slate-300 hover:text-red-655 p-1.5 border border-transparent hover:border-red-105 rounded-lg hover:bg-white cursor-pointer m-0"
                              title="Delete Ledger Line"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mortality ledger list card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h5 className="text-xs font-black uppercase text-slate-805 tracking-wider">Historical Mortalities & Losses Registry</h5>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{(mortalities || []).length} Recorded losses</span>
                  </div>
                  <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
                    {(mortalities || []).length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold">No mortality events recorded. Farm is biosecure.</div>
                    ) : (
                      (mortalities || []).map((m) => (
                        <div key={m.id} className="p-3 border border-rose-55 bg-rose-50/20 rounded-xl flex justify-between items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[8.5px] font-black uppercase bg-rose-50 text-rose-805 border border-rose-150 px-1.5 py-0.2 rounded">{m.category}</span>
                              <span className="font-extrabold text-slate-855 text-xs uppercase">{m.animalIdOrBatch}</span>
                              {m.veterinaryConfirmed && (
                                <span className="text-[8px] bg-blue-50 text-blue-850 border border-blue-150 px-1 rounded uppercase font-bold">Autopsy ✓</span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-655">Deceased Count: <span className="font-extrabold text-rose-700">{m.count} head</span></p>
                            <p className="text-xs font-black text-rose-855 bg-rose-50/50 px-1.5 py-0.5 rounded inline-block">Cause: {m.causeOfDeath}</p>
                            <p className="text-[10px] text-slate-400 font-bold font-mono">Event Date: {m.date}</p>
                            {m.notes && <p className="text-[10.5px] font-medium text-slate-550 block italic">"{m.notes}"</p>}
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => onDeleteMortality(m.id)}
                              className="text-slate-300 hover:text-red-655 p-1.5 border border-transparent hover:border-rose-105 rounded-lg hover:bg-white cursor-pointer m-0"
                              title="Delete Defect record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {livestockSubTab === 'biogas_optimizer' && (
            <div className="space-y-6">
              {/* Educational banner */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-955">
                  <span className="text-base">💡</span>
                  <h5 className="text-[11px] font-black tracking-widest uppercase text-amber-900">Sovereign Smallholder Biogas Digestibility Optimizer</h5>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Convert animal waste and crop residues into continuous methane fuel pressure and liquefied rich organic bio-slurry compost. Ideal for zero-grazing cattle setups and poultry houses.
                </p>
              </div>

              {/* Grid 2 column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch">
                
                {/* Inputs Pane (col 5) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block border-b pb-1">
                      1. Digestor Input Specifications
                    </span>

                    {/* Substrates type selection */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Manure Substrate Category</label>
                      <select
                        value={substrateType}
                        onChange={(e) => setSubstrateType(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-2.5 w-full bg-white font-extrabold text-slate-700 cursor-pointer"
                      >
                        <option value="cattle_manure">🐄 Cattle Cowdung Slurry (0.040 m³ biogas/kg)</option>
                        <option value="poultry_litter">🐣 Poultry Avian Drops (0.080 m³ biogas/kg)</option>
                        <option value="goat_droppings">🐐 Dairy Goat Pellets (0.055 m³ biogas/kg)</option>
                        <option value="kitchen_waste">🌽 Kitchen Organic Scraps (0.120 m³ biogas/kg)</option>
                      </select>
                    </div>

                    {/* Daily Input Manure Inflow (KG) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Daily waste collected (Kg)</label>
                        <span className="font-mono text-xs font-black text-slate-800">{wasteInputKg} KG / day</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="500"
                        step="5"
                        value={wasteInputKg}
                        onChange={(e) => setWasteInputKg(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-1">
                        <span>Min (5 Kg)</span>
                        <span>Med (250 Kg)</span>
                        <span>Max (500 Kg)</span>
                      </div>
                    </div>

                    {/* Water Dilution Ratio */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-550 uppercase">Water-to-Waste Dilution Ratio</label>
                        <span className="font-mono text-xs font-black text-slate-800">1 : {waterRatio} Volumetric</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        value={waterRatio}
                        onChange={(e) => setWaterRatio(parseInt(e.target.value))}
                        className="w-full accent-amber-550 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-1">
                        <span>1:1 Solid Slurry</span>
                        <span>1:2 Medium</span>
                        <span>1:3 High Dilution</span>
                        <span>1:4 Fluid</span>
                      </div>
                    </div>

                    {/* Hydraulic Retention Days */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-550 uppercase">Hydraulic Retention Period (HRT)</label>
                        <span className="font-mono text-xs font-black text-slate-800">{hrtDays} Digestion Days</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="5"
                        value={hrtDays}
                        onChange={(e) => setHrtDays(parseInt(e.target.value))}
                        className="w-full accent-amber-550 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-1">
                        <span>15 Days (Fast)</span>
                        <span>30 Days (Standard)</span>
                        <span>60 Days (Complete)</span>
                      </div>
                    </div>

                    {/* Digestation Celsius Temp */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-550 uppercase">Target Slurry Temperature (°C)</label>
                        <span className="font-mono text-xs font-black text-slate-850">{digesterTemp}°C (Mesophilic Range)</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="45"
                        step="1"
                        value={digesterTemp}
                        onChange={(e) => setDigesterTemp(parseInt(e.target.value))}
                        className="w-full accent-amber-550 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-1">
                        <span>20°C (Slow action)</span>
                        <span>35°C (Optimum digestion)</span>
                        <span>45°C (High Thermophilic)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-650">
                    <p className="font-black text-slate-800 uppercase text-[9px] tracking-wide">🔬 Bio-Sludge Safety Warning</p>
                    <p className="text-[10.5px] font-semibold leading-relaxed">
                      Maintain balanced slurry load. pH should hover around 6.8 - 7.6. Acidification occurs if overloaded too quickly with sweet kitchen biomass. Adjust dilution water ratio if the crust thickens at top.
                    </p>
                  </div>
                </div>

                {/* Analytical Yield Display (col 7) */}
                <div className="lg:col-span-7 bg-slate-950 text-slate-150 p-6 rounded-3xl border border-slate-900 shadow-xl flex flex-col justify-between space-y-6">
                  
                  {/* Summary Metric Counters Row */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block pb-0.5">Yield Analytics Engine</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Estimated Constant Daily Outputs</h4>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wide">
                        Simulated live
                      </div>
                    </div>

                    {/* Main big numbers */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Biogas volume */}
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Est Continuous gas volume (CH₄)</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-3xl font-black text-white font-mono leading-none">
                            {(wasteInputKg * (
                              substrateType === 'cattle_manure' ? 0.040 :
                              substrateType === 'poultry_litter' ? 0.080 :
                              substrateType === 'goat_droppings' ? 0.055 : 0.120
                            ) * (digesterTemp / 35)).toFixed(2)}
                          </span>
                          <span className="text-xs font-black text-slate-400 font-mono">m³ / day</span>
                        </div>
                        <span className="text-[8.5px] font-semibold text-slate-500 block mt-2">Adjusted for mesophilic activity factor</span>
                      </div>

                      {/* Power potential cooking hours */}
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Bio-Stove Continuous cooking</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-3xl font-black text-amber-400 font-mono leading-none">
                            {Math.max(0.1, (
                              (wasteInputKg * (
                                substrateType === 'cattle_manure' ? 0.040 :
                                substrateType === 'poultry_litter' ? 0.080 :
                                substrateType === 'goat_droppings' ? 0.055 : 0.120
                              ) * (digesterTemp / 35)) / 0.45
                            )).toFixed(1)}
                          </span>
                          <span className="text-xs font-black text-slate-400 font-mono">Hours / day</span>
                        </div>
                        <span className="text-[8.5px] font-semibold text-slate-500 block mt-2">At 0.45 m³ active frame burner flow</span>
                      </div>

                    </div>

                    {/* Additional physical metrics list */}
                    <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800/60 text-xs font-mono font-bold">
                      
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Total Digester Slurry Load per day:</span>
                        <span className="text-white">{(wasteInputKg + (wasteInputKg * waterRatio)).toFixed(0)} Litres / day</span>
                      </div>

                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Minimum Active Digester Tank Volume:</span>
                        <span className="text-amber-400 font-black">
                          {((wasteInputKg + (wasteInputKg * waterRatio)) * hrtDays).toLocaleString()} Litres ({(((wasteInputKg + (wasteInputKg * waterRatio)) * hrtDays) / 1000).toFixed(1)} m³)
                        </span>
                      </div>

                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Liquefied Bio-Slurry fertilizer output:</span>
                        <span className="text-teal-400">
                          {((wasteInputKg + (wasteInputKg * waterRatio)) * 0.90).toFixed(1)} Litres/day of pure nitrogen compost
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Sovereign Carbon Credit offset:</span>
                        <span className="text-emerald-400">
                          ~{(wasteInputKg * (
                            substrateType === 'cattle_manure' ? 0.040 :
                            substrateType === 'poultry_litter' ? 0.080 :
                            substrateType === 'goat_droppings' ? 0.055 : 0.120
                          ) * 2.1).toFixed(1)} Kg CO₂ Equiv. Offset / day
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* LPG Equivalent Graphic Indicator */}
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-widest inline-block">Fossil Fuel Saver</span>
                      <h6 className="text-xs font-black text-white uppercase tracking-wider">LPG Equivalent Gas Generated</h6>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Based on caloric combustion factors, this digestion rate substitutes standard liquefied petroleum cylinders.
                      </p>
                    </div>
                    <div className="text-right shrink-0 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">13Kg Cylinder equivalent</span>
                      <span className="text-lg font-black text-white font-mono block mt-0.5 font-mono">
                        {Math.max(0.1, (
                          ((wasteInputKg * (
                            substrateType === 'cattle_manure' ? 0.040 :
                            substrateType === 'poultry_litter' ? 0.080 :
                            substrateType === 'goat_droppings' ? 0.055 : 0.120
                          ) * (digesterTemp / 35)) * 30) / 25
                        )).toFixed(1)} Tanks / Month
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* 3. WAREHOUSE INVENTORY BASE */}
      {viewType === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-100 text-zinc-950 rounded-xl">
                <Warehouse size={24} className="text-zinc-650" />
              </div>
              <div>
                <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Storage Warehouse Register</h4>
                <p className="text-xs text-slate-400 font-medium">Coordinate stocks of compounding grains, silages, GlobalGAP chemical spray liters, and wound tools.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={downloadInventoryCSV}
                type="button"
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-105 bg-slate-100 border border-slate-205 text-slate-808 hover:bg-slate-200 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0 shrink-0"
                title="Export Store Inventory CSV"
              >
                <FileSpreadsheet size={13} />
                Export CSV
              </button>
              {onTriggerSectionReport && (
                <button
                  onClick={() => onTriggerSectionReport('inventory')}
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 border border-amber-600/10 text-slate-950 rounded-xl font-bold text-xs uppercase transition-all shadow-md cursor-pointer m-0 shrink-0 font-bold"
                  title="Download Inventory PDF Report"
                >
                  <Download size={13} />
                  Download PDF Report
                </button>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-zinc-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-zinc-805 active:scale-95 transition-all flex items-center justify-center gap-1.5 m-0 w-full md:w-auto shrink-0"
              >
                <Plus size={14} /> Core Register Stock
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleInventorySubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Item Title Name</label>
                  <input
                    type="text"
                    required
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    placeholder="E.g. Saw blades"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Storage Class</label>
                  <select
                    value={invCat}
                    onChange={(e) => setInvCat(e.target.value as any)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-650 cursor-pointer"
                  >
                    <option value="Feed">Dry Feed / Silages</option>
                    <option value="Chemical">Agrochemicals / Sprays</option>
                    <option value="Machine Parts">Canine / Machine Parts</option>
                    <option value="Tools">Pruning / Weeding Tools</option>
                    <option value="Fencing">Fencing logs / Barbed wire</option>
                    <option value="Fertilizer">Soil Fertilizer bags</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Opening Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Stock count"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Metric Unit Type</label>
                  <input
                    type="text"
                    required
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    placeholder="E.g. bags (50kg)"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    value={invMin}
                    onChange={(e) => setInvMin(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Restock level"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Storage Location / Bin Name</label>
                  <input
                    type="text"
                    value={invLocation}
                    onChange={(e) => setInvLocation(e.target.value)}
                    placeholder="E.g. Main Silo, Store Gamma"
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Received (Backdate/Post-date Allowed)</label>
                  <input
                    type="date"
                    required
                    value={invDateReceived}
                    onChange={(e) => setInvDateReceived(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Chemical / Feed Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={invExpiryDate}
                    onChange={(e) => setInvExpiryDate(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-zinc-950 text-white font-black text-xs uppercase rounded-lg m-0">
                  Register Item
                </button>
              </div>
            </form>
          )}

          {/* Table display with interactive adjusters */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-655 font-black text-[10px] uppercase">
                  <td className="p-4">Item Warehouse Description</td>
                  <td className="p-4">Category</td>
                  <td className="p-4 font-mono text-center">Safety Restock Level</td>
                  <td className="p-4 font-mono text-right">Available Volume Balance</td>
                  <td className="p-4 text-center">Interactive Quick-Adjust</td>
                  <td className="p-4 text-center">Actions</td>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minStock;

                  return (
                    <tr key={item.id} className="border-b border-slate-55 hover:bg-slate-50/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Wrench size={14} className="text-slate-400" />
                          <div>
                            <span className="font-extrabold text-slate-800 tracking-wide text-[13px]">{item.name}</span>
                            {isLow && (
                              <span className="ml-2 inline-flex items-center gap-1.5 text-[8.5px] bg-red-100 border border-red-200 text-red-800 px-2 py-0.5 rounded font-black uppercase">
                                <AlertOctagon size={10} /> Low Stock alert
                              </span>
                            )}
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-450 font-bold font-mono">
                              {item.location && (
                                <span className="text-slate-600 bg-amber-50 px-1 py-0.2 rounded text-[9.5px]">
                                  📍 Loc: {item.location}
                                </span>
                              )}
                              {item.dateReceived && (
                                <span className="text-slate-500">📅 Recd: {item.dateReceived}</span>
                              )}
                              {item.expiryDate && (
                                <span className="text-amber-700 bg-amber-50/50 px-1 py-0.2 rounded">⚠️ Exp: {item.expiryDate}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border text-slate-550 uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-400 font-bold font-mono">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="p-4 text-right font-mono font-black text-sm text-slate-705">
                        <span className={isLow ? 'text-red-700' : 'text-slate-800'}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateInventoryStock(item.id, Math.max(0, item.quantity - 1))}
                            className="text-xs bg-slate-100 hover:bg-slate-205 text-slate-700 p-2 rounded-lg font-black leading-none inline-block cursor-pointer m-0 border hover:bg-slate-200"
                            title="Decrement 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onUpdateInventoryStock(item.id, item.quantity + 1)}
                            className="text-xs bg-slate-900 hover:bg-slate-850 text-white p-2 rounded-lg font-black leading-none inline-block cursor-pointer m-0 border hover:bg-slate-800"
                            title="Increment 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {onEditInventoryItem && (
                          <button
                            onClick={() => setEditingInventoryItem(item)}
                            className="text-slate-305 hover:text-indigo-850 p-2 border border-slate-100 hover:border-indigo-105 rounded-xl transition-colors cursor-pointer m-0 inline-block align-middle bg-white hover:bg-slate-50 mr-1"
                            title="Edit Inventory Item"
                          >
                            <PenSquare size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteInventoryItem(item.id)}
                          className="text-slate-305 hover:text-red-110 p-2 border border-slate-100 hover:border-red-105 rounded-xl transition-colors cursor-pointer m-0 inline-block align-middle bg-white hover:bg-slate-50"
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
      )}

    {/* Edit Field Modal */}
    {editingField && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans text-left">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Block / Field</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Adjust agronomic variables and coordinates</p>
            </div>
            <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block Name</label>
                <input
                  type="text"
                  value={editingField.blockName}
                  onChange={(e) => setEditingField({ ...editingField, blockName: e.target.value })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Crop Type / Species</label>
                <input
                  type="text"
                  value={editingField.cropType}
                  onChange={(e) => setEditingField({ ...editingField, cropType: e.target.value })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Acreage size</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingField.acreage}
                  onChange={(e) => setEditingField({ ...editingField, acreage: parseFloat(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Agronomy Status</label>
                <select
                  value={editingField.status}
                  onChange={(e) => setEditingField({ ...editingField, status: e.target.value })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
                >
                  <option value="Prepared">Coarse Prepared</option>
                  <option value="Sown">Sown / Planted</option>
                  <option value="Growing">Vegetative Growing</option>
                  <option value="Harvested">Culled / Harvested</option>
                  <option value="Fallow">Fallow</option>
                </select>
              </div>
            </div>

            {/* Advanced Agronomics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Soil pH level</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="14"
                  value={editingField.soilPh !== undefined ? editingField.soilPh : ''}
                  onChange={(e) => setEditingField({ ...editingField, soilPh: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                  placeholder="Not set"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Irrigation Rig System</label>
                <select
                  value={editingField.irrigationMethod || 'Rainfed'}
                  onChange={(e) => setEditingField({ ...editingField, irrigationMethod: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
                >
                  <option value="Rainfed">Rain-Fed Only</option>
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Overhead">Overhead Pivot/Sprinkler</option>
                  <option value="Manual">Manual Hand Watering</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Last Fertilizer Application</label>
                <input
                  type="date"
                  value={editingField.lastFertilizerDate || ''}
                  onChange={(e) => setEditingField({ ...editingField, lastFertilizerDate: e.target.value || undefined })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Projected Harvest Yield Volume</label>
                <input
                  type="text"
                  value={editingField.projectedHarvestVolume || ''}
                  onChange={(e) => setEditingField({ ...editingField, projectedHarvestVolume: e.target.value || undefined })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-semibold"
                  placeholder="E.g. 150 Bales"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black text-indigo-755 uppercase block mb-1">Sown / Planted Date</label>
                <input
                  type="date"
                  value={editingField.datePlanted || ''}
                  onChange={(e) => setEditingField({ ...editingField, datePlanted: e.target.value || undefined })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-amber-700 uppercase block mb-1">Log / Registration Date (Historical)</label>
                <input
                  type="date"
                  value={editingField.date}
                  onChange={(e) => setEditingField({ ...editingField, date: e.target.value })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block Notes / Observations</label>
              <textarea
                value={editingField.notes}
                onChange={(e) => setEditingField({ ...editingField, notes: e.target.value })}
                rows={2}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingField(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditField) {
                  onEditField(editingField.id, editingField);
                }
                setEditingField(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Poultry/Dogs Modal */}
    {editingLivestock && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Livestock Log</h3>
            <button onClick={() => setEditingLivestock(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Type</label>
                <select
                  value={editingLivestock.type}
                  onChange={(e) => setEditingLivestock({ ...editingLivestock, type: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Poultry">Poultry</option>
                  <option value="Dogs">Dogs</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Identifier Name</label>
                <input
                  type="text"
                  value={editingLivestock.name}
                  onChange={(e) => setEditingLivestock({ ...editingLivestock, name: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Count / Breed Info</label>
                <input
                  type="text"
                  value={editingLivestock.countOrBreed}
                  onChange={(e) => setEditingLivestock({ ...editingLivestock, countOrBreed: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Activity Action Done</label>
                <input
                  type="text"
                  value={editingLivestock.activity}
                  onChange={(e) => setEditingLivestock({ ...editingLivestock, activity: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Activity Diagnostic Notes</label>
              <textarea
                value={editingLivestock.notes}
                onChange={(e) => setEditingLivestock({ ...editingLivestock, notes: e.target.value })}
                rows={2}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingLivestock(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditLivestock) {
                  onEditLivestock(editingLivestock.id, editingLivestock);
                }
                setEditingLivestock(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Inventory Item Modal */}
    {editingInventoryItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Inventory Item</h3>
            <button onClick={() => setEditingInventoryItem(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Item Name</label>
                <input
                  type="text"
                  value={editingInventoryItem.name}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, name: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Item Category</label>
                <select
                  value={editingInventoryItem.category}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, category: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Feed">Feed</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Machine Parts">Machine Parts</option>
                  <option value="Tools">Tools</option>
                  <option value="Fencing">Fencing</option>
                  <option value="Fertilizer">Fertilizer</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editingInventoryItem.quantity}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, quantity: parseInt(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Measurement Unit</label>
                <input
                  type="text"
                  value={editingInventoryItem.unit}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, unit: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Understock Trigger (Min Quantity)</label>
                <input
                  type="number"
                  value={editingInventoryItem.minStock}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, minStock: parseInt(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Storage Location / Bin Name </label>
                <input
                  type="text"
                  value={editingInventoryItem.location || ''}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, location: e.target.value || undefined })}
                  placeholder="E.g. Barn Store A"
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date Received / Registered</label>
                <input
                  type="date"
                  value={editingInventoryItem.dateReceived || ''}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, dateReceived: e.target.value || undefined })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Chemical / Feed Expiry Date</label>
                <input
                  type="date"
                  value={editingInventoryItem.expiryDate || ''}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, expiryDate: e.target.value || undefined })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingInventoryItem(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditInventoryItem) {
                  onEditInventoryItem(editingInventoryItem.id, editingInventoryItem);
                }
                setEditingInventoryItem(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Goat Record Modal */}
    {editingGoat && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Goat Registry</h3>
            <button onClick={() => setEditingGoat(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tag ID</label>
                <input
                  type="text"
                  value={editingGoat.tagId}
                  onChange={(e) => setEditingGoat({ ...editingGoat, tagId: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breed Class</label>
                <select
                  value={editingGoat.breed}
                  onChange={(e) => setEditingGoat({ ...editingGoat, breed: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Toggenburg">Toggenburg</option>
                  <option value="Alpine">Alpine</option>
                  <option value="Saanen">Saanen</option>
                  <option value="Galla">Galla</option>
                  <option value="Boer">Boer</option>
                  <option value="Cross">Cross Breed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Flock Purpose</label>
                <select
                  value={editingGoat.purpose}
                  onChange={(e) => setEditingGoat({ ...editingGoat, purpose: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Breeding">Breeding</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Milk Yield Liters / day</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingGoat.milkYieldLiters || ''}
                  onChange={(e) => setEditingGoat({ ...editingGoat, milkYieldLiters: parseFloat(e.target.value) || undefined })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operational Diagnostics Action</label>
              <input
                type="text"
                value={editingGoat.activity}
                onChange={(e) => setEditingGoat({ ...editingGoat, activity: e.target.value })}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Individual Profile State Notes</label>
              <textarea
                value={editingGoat.notes}
                onChange={(e) => setEditingGoat({ ...editingGoat, notes: e.target.value })}
                rows={2}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingGoat(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditGoatRecord) {
                  onEditGoatRecord(editingGoat.id, editingGoat);
                }
                setEditingGoat(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Calf Record Modal */}
    {editingCalf && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Calf Profile</h3>
            <button onClick={() => setEditingCalf(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf ID Tag</label>
                <input
                  type="text"
                  value={editingCalf.calfId}
                  onChange={(e) => setEditingCalf({ ...editingCalf, calfId: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf Friendly Name</label>
                <input
                  type="text"
                  value={editingCalf.calfName || ''}
                  onChange={(e) => setEditingCalf({ ...editingCalf, calfName: e.target.value })}
                  placeholder="E.g. Spot"
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf Biological Sex</label>
                <select
                  value={editingCalf.sex || 'Female'}
                  onChange={(e) => setEditingCalf({ ...editingCalf, sex: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold bg-white"
                >
                  <option value="Female">Female (Heifer Calf)</option>
                  <option value="Male">Male (Bull Calf)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Mother Cow Dam ID</label>
                <input
                  type="text"
                  value={editingCalf.damId}
                  onChange={(e) => setEditingCalf({ ...editingCalf, damId: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calf DOB</label>
                <input
                  type="date"
                  value={editingCalf.dob}
                  onChange={(e) => setEditingCalf({ ...editingCalf, dob: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Milk Intake (L / day)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editingCalf.milkIntakeLiters}
                  onChange={(e) => setEditingCalf({ ...editingCalf, milkIntakeLiters: parseFloat(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Creep Feed Intro Date</label>
                <input
                  type="date"
                  value={editingCalf.creepFeedIntroDate || ''}
                  onChange={(e) => setEditingCalf({ ...editingCalf, creepFeedIntroDate: e.target.value || undefined })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Weaned Complete?</label>
                <select
                  value={editingCalf.weaned ? "true" : "false"}
                  onChange={(e) => setEditingCalf({ ...editingCalf, weaned: e.target.value === "true" })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="false">Unweaned (Milk Fed)</option>
                  <option value="true">Weaned (Solid Rations Only)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Growth & Veterinary Diary Notes</label>
              <textarea
                value={editingCalf.notes}
                onChange={(e) => setEditingCalf({ ...editingCalf, notes: e.target.value })}
                rows={2}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingCalf(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditCalfRecord) {
                  onEditCalfRecord(editingCalf.id, editingCalf);
                }
                setEditingCalf(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit BSF Record Modal */}
    {editingBsf && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit BSF Batch Log</h3>
            <button onClick={() => setEditingBsf(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Batch Code</label>
                <input
                  type="text"
                  value={editingBsf.batchId}
                  onChange={(e) => setEditingBsf({ ...editingBsf, batchId: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Substrate Medium</label>
                <input
                  type="text"
                  value={editingBsf.substrateType}
                  onChange={(e) => setEditingBsf({ ...editingBsf, substrateType: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inoculation Date</label>
                <input
                  type="date"
                  value={editingBsf.inoculationDate}
                  onChange={(e) => setEditingBsf({ ...editingBsf, inoculationDate: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Harvested size (KG grubs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingBsf.larvaeHarvestedKg}
                  onChange={(e) => setEditingBsf({ ...editingBsf, larvaeHarvestedKg: parseFloat(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Breeding System Status</label>
              <select
                value={editingBsf.status}
                onChange={(e) => setEditingBsf({ ...editingBsf, status: e.target.value as any })}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              >
                <option value="Inoculation">Inoculation</option>
                <option value="Larvae Feeding">Larvae Feeding</option>
                <option value="Harvested">Harvested</option>
                <option value="Love Cage Breeding">Love Cage Breeding</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operational Batch Notes</label>
              <textarea
                value={editingBsf.notes}
                onChange={(e) => setEditingBsf({ ...editingBsf, notes: e.target.value })}
                rows={2}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingBsf(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditBsfRecord) {
                  onEditBsfRecord(editingBsf.id, editingBsf);
                }
                setEditingBsf(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Crop Op Modal */}
    {editingCropOp && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans text-left">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Agronomy Task</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Adjust inputs, costs, timelines and staffing</p>
            </div>
            <button onClick={() => setEditingCropOp(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Assigned Crop</label>
                <select
                  value={editingCropOp.crop}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, crop: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
                >
                  <option value="Tea">Tea</option>
                  <option value="Avocado">Avocado</option>
                  <option value="Banana">Banana</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Sorghum">Sorghum</option>
                  <option value="Maize">Maize</option>
                  <option value="Boma Rhodes">Boma Rhodes</option>
                  <option value="Beans">Beans</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Title</label>
                <input
                  type="text"
                  value={editingCropOp.operationName}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, operationName: e.target.value })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Execution / Scheduled Date</label>
                <input
                  type="date"
                  value={editingCropOp.date}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, date: e.target.value })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Status</label>
                <select
                  value={editingCropOp.status}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, status: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">✓ Completed</option>
                </select>
              </div>
            </div>

            {/* Expanded Inputs & Costing section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Inputs Used</label>
                <input
                  type="text"
                  value={editingCropOp.inputsUsed || ''}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, inputsUsed: e.target.value || undefined })}
                  placeholder="Not set"
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Input Quantity</label>
                <input
                  type="text"
                  value={editingCropOp.inputQuantityUsed || ''}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, inputQuantityUsed: e.target.value || undefined })}
                  placeholder="Not set"
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Equipment Used</label>
                <input
                  type="text"
                  value={editingCropOp.equipmentUsed || ''}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, equipmentUsed: e.target.value || undefined })}
                  placeholder="Not set"
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Cost (Ksh)</label>
                <input
                  type="number"
                  value={editingCropOp.operationCost !== undefined ? editingCropOp.operationCost : ''}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, operationCost: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                  placeholder="Not set"
                  className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Completed / Assigned By Staff</label>
              <select
                value={editingCropOp.completedBy || ''}
                onChange={(e) => setEditingCropOp({ ...editingCropOp, completedBy: e.target.value })}
                className="border border-slate-200 rounded-lg p-2.5 w-full text-xs font-bold bg-white"
              >
                {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Diagnostics & Description Logs</label>
              <textarea
                value={editingCropOp.notes}
                onChange={(e) => setEditingCropOp({ ...editingCropOp, notes: e.target.value })}
                rows={2}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingCropOp(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditCropOp) {
                  onEditCropOp(editingCropOp.id, editingCropOp);
                }
                setEditingCropOp(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-900 transition-all text-white rounded-lg text-xs font-black uppercase m-0 shadow cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Crop Sale Modal */}
    {editingCropSale && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Crop Sale Transaction</h3>
            <button onClick={() => setEditingCropSale(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Commodity / Fruit Crop</label>
                <select
                  value={editingCropSale.crop}
                  onChange={(e) => setEditingCropSale({ ...editingCropSale, crop: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold text-indigo-900"
                >
                  <option value="Banana">Banana</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Sorghum">Sorghum</option>
                  <option value="Maize">Maize</option>
                  <option value="Napier">Napier</option>
                  <option value="Boma Rhodes">Boma Rhodes</option>
                  <option value="Eucalyptus">Eucalyptus</option>
                  <option value="Beans">Beans</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Invoice Receipt Ref</label>
                <input
                  type="text"
                  value={editingCropSale.ref}
                  onChange={(e) => setEditingCropSale({ ...editingCropSale, ref: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Yield Quantity</label>
                <input
                  type="number"
                  value={editingCropSale.qty}
                  onChange={(e) => {
                    const qty = parseFloat(e.target.value) || 0;
                    setEditingCropSale({
                      ...editingCropSale,
                      qty,
                      totalSales: qty * editingCropSale.pricePerUnit
                    });
                  }}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Measurement Unit</label>
                <input
                  type="text"
                  value={editingCropSale.unit}
                  onChange={(e) => setEditingCropSale({ ...editingCropSale, unit: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Rate Price per Unit (Ksh)</label>
                <input
                  type="number"
                  value={editingCropSale.pricePerUnit}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    setEditingCropSale({
                      ...editingCropSale,
                      pricePerUnit: rate,
                      totalSales: editingCropSale.qty * rate
                    });
                  }}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Gross Total Sales (Calculated)</label>
                <input
                  type="text"
                  disabled
                  value={`Ksh ${editingCropSale.totalSales.toLocaleString()}`}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-black font-mono bg-slate-50 text-indigo-950"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Selected Buyer Client</label>
                <input
                  type="text"
                  value={editingCropSale.buyer}
                  onChange={(e) => setEditingCropSale({ ...editingCropSale, buyer: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Post Transaction Date</label>
                <input
                  type="date"
                  value={editingCropSale.date}
                  onChange={(e) => setEditingCropSale({ ...editingCropSale, date: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setEditingCropSale(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onEditCropSale) {
                  onEditCropSale(editingCropSale.id, editingCropSale);
                }
                setEditingCropSale(null);
              }}
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
