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
  CropSaleRecord
} from '../types';
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
  Users
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
}

export function OtherSections({
  viewType,
  fields,
  livestock,
  inventory,
  onAddFields,
  onAddLivestock,
  onUpdateInventoryStock,
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
  aiRecords = []
}: OtherSectionsProps) {
  // Toggle for livestock sub segments
  const [livestockSubTab, setLivestockSubTab] = useState<'poultry_dogs' | 'goats' | 'calves' | 'bsf' | 'operations' | 'sales_mortality' | 'biogas_optimizer'>('poultry_dogs');
  const [agronomySubTab, setAgronomySubTab] = useState<'blocks' | 'crop_ops' | 'sales'>('blocks');

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
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'OPERATIONAL STORES & RAW INVENTORY LEDGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Item ID,Item Name,Primary Category,Current Stock,Unit Measure,Reorder Safety Level,Status Alert\n';
    inventory.forEach((item) => {
      const isLow = item.quantity <= item.minStock;
      csv += `"${item.id}","${item.name}","${item.category}",${item.quantity},"${item.unit}",${item.minStock},"${isLow ? 'RESTOCK REQUIRED' : 'Secure level'}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Warehouse_Inventory_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="flex bg-slate-100 p-1 rounded-xl border shrink-0 w-full md:w-auto">
              <button
                onClick={() => { setAgronomySubTab('blocks'); setShowAddForm(false); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
                  agronomySubTab === 'blocks' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Agronomy Blocks
              </button>
              <button
                onClick={() => { setAgronomySubTab('crop_ops'); setShowAddForm(false); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 ${
                  agronomySubTab === 'crop_ops' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Routine Crop Guides
              </button>
              <button
                onClick={() => { setAgronomySubTab('sales'); setShowAddForm(false); }}
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
                    Export Fields
                  </button>
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
                          placeholder="E.g. Rhodes Grass"
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

          {/* CROPS SCHEDULER & DISCOVERY GUIDELINE MODULE */}
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
                    Export Operations
                  </button>
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
                    Export Sales
                  </button>
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
                <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Diverse Livestock & BSF center</h4>
                <p className="text-xs text-slate-400 font-medium">Log records for poultry vaccine grids, dairy goats, wet milk-fed calves, organic Black Soldier Fly protein bins, and guard dog boosters.</p>
              </div>
            </div>

            {/* Sub segments selector tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border shrink-0 w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => { setLivestockSubTab('poultry_dogs'); setShowAddForm(false); }}
                className={`px-3 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all m-0 shrink-0 ${
                  livestockSubTab === 'poultry_dogs' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Poultry & Canines
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
          </div>

          {/* SUBTAB 2A: POULTRY & CANINES COOPERATIVE */}
          {livestockSubTab === 'poultry_dogs' && (
            <div className="space-y-6">
              {/* Poultry immunization schedule guide */}
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-amber-950">
                  <BookOpen size={16} className="text-amber-800" />
                  <h5 className="text-[11px] font-black tracking-widest uppercase">IMPERATIVE POULTRY VACCINATION & CANINE REMINDERS</h5>
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
                    <span className="font-extrabold text-slate-700 uppercase tracking-wide block">🐕 Guard Canine Checkups (Rabies & Deworming):</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 font-semibold">
                      <li>Deworming: Every 3 months (Praziquantel compounds)</li>
                      <li>Rabies Booster: Annual mandatory vaccination</li>
                      <li>Multi-Booster (DHLPP): Annual booster against Parvo & Hepatitis</li>
                      <li>Tick/Flea prevention: Monthly veterinary collars check</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/30 px-2 font-bold select-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Poultry Eggs & canine vaccination ledger</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadLivestockCSV}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0"
                    title="Export Poultry & Canine Records CSV"
                  >
                    <FileSpreadsheet size={13} />
                    Export Records
                  </button>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-amber-900 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-amber-800 flex items-center gap-1.5 m-0"
                  >
                    <Plus size={14} /> Add Ledger Log
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleLivestockSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4 font-sans text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Livestock Unit Type</label>
                      <select
                        value={lsType}
                        onChange={(e) => setLsType(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-650 cursor-pointer"
                      >
                        <option value="Poultry">Poultry / Layers / Chicks</option>
                        <option value="Dogs">Security Guard Canines</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Group ID / Breed / Name</label>
                      <input
                        type="text"
                        required
                        value={lsName}
                        onChange={(e) => setLsName(e.target.value)}
                        placeholder="E.g. Flock A (Lay) or Canine Major"
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
                        placeholder="E.g. 520 birds, German Shepherd"
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
                        placeholder="E.g. Administered typhoid vaccine, collected 12 crates eggs"
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Additional Observations / Notes</label>
                      <input
                        type="text"
                        value={lsNotes}
                        onChange={(e) => setLsNotes(e.target.value)}
                        placeholder="E.g. Feed intake robust, normal weight curves..."
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
                {livestock.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          item.type === 'Poultry' ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}>
                          {item.type} Section
                        </span>
                        <h5 className="font-extrabold text-[13.5px] uppercase text-[#0b251a]">{item.name}</h5>
                        <span className="text-xs font-mono font-bold text-slate-400">({item.countOrBreed})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-slate-705 leading-relaxed bg-slate-50 shrink-0 px-2 py-1 rounded inline-block">
                        <Activity size={12} className="text-amber-700 shrink-0 inline-block mr-1" />
                        <span>Activity: {item.activity}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 italic leading-normal">
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
                      <button
                        onClick={() => onDeleteLivestock(item.id)}
                        className="text-slate-305 hover:text-red-650 p-2 rounded transition-colors cursor-pointer m-0 border border-slate-100 hover:border-red-105 bg-white shadow-xs"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                    Export Goats
                  </button>
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
                    Export Calves
                  </button>
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
                    Export BSF Logs
                  </button>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">Operational Timeline Feed</h5>
                  <div className="text-[11px] font-mono text-slate-400 font-bold">
                    Showing operations across past, present, and future scheduled tasks.
                  </div>
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
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border justify-between items-center w-full">
                <span className="text-[10px] font-black text-slate-405 uppercase tracking-widest block ml-2">Add Sales Event / Mortality drop</span>
                <div className="flex gap-2">
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
                Export Stores
              </button>
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
