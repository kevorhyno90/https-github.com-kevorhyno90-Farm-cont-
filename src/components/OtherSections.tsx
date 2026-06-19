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
  FileSpreadsheet
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
  onEditCropSale
}: OtherSectionsProps) {
  // Toggle for livestock sub segments
  const [livestockSubTab, setLivestockSubTab] = useState<'poultry_dogs' | 'goats' | 'calves' | 'bsf'>('poultry_dogs');
  const [agronomySubTab, setAgronomySubTab] = useState<'blocks' | 'crop_ops' | 'sales'>('blocks');

  // Edit State Variables
  const [editingField, setEditingField] = useState<FieldRecord | null>(null);
  const [editingLivestock, setEditingLivestock] = useState<LivestockRecord | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [editingGoat, setEditingGoat] = useState<GoatRecord | null>(null);
  const [editingCalf, setEditingCalf] = useState<CalfRecord | null>(null);
  const [editingBsf, setEditingBsf] = useState<BsfRecord | null>(null);
  const [editingCropOp, setEditingCropOp] = useState<CropOpRecord | null>(null);
  const [editingCropSale, setEditingCropSale] = useState<CropSaleRecord | null>(null);

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

  // Crop Operations Form
  const [coCrop, setCoCrop] = useState<CropOpRecord['crop']>('Tea');
  const [coOperationName, setCoOperationName] = useState('');
  const [coDate, setCoDate] = useState('');
  const [coNotes, setCoNotes] = useState('');
  const [coStaff, setCoStaff] = useState(staffList[0]?.name || 'Charles');

  // Livestock/Poultry & Dogs Form
  const [lsType, setLsType] = useState<'Poultry' | 'Dogs'>('Poultry');
  const [lsName, setLsName] = useState('');
  const [lsCount, setLsCount] = useState('');
  const [lsActivity, setLsActivity] = useState('');
  const [lsNotes, setLsNotes] = useState('');

  // Goat Form
  const [gtTag, setGtTag] = useState('');
  const [gtBreed, setGtBreed] = useState<GoatRecord['breed']>('Toggenburg');
  const [gtPurpose, setGtPurpose] = useState<GoatRecord['purpose']>('Dairy');
  const [gtMilk, setGtMilk] = useState<number | ''>('');
  const [gtActivity, setGtActivity] = useState('');
  const [gtNotes, setGtNotes] = useState('');

  // Calf Form
  const [cfId, setCfId] = useState('');
  const [cfDam, setCfDam] = useState('');
  const [cfDob, setCfDob] = useState('');
  const [cfMilk, setCfMilk] = useState<number | ''>(4);
  const [cfCreepDate, setCfCreepDate] = useState('');
  const [cfWeaned, setCfWeaned] = useState(false);
  const [cfNotes, setCfNotes] = useState('');

  // BSF Form
  const [bsBatchId, setBsBatchId] = useState('');
  const [bsSubstrate, setBsSubstrate] = useState('');
  const [bsInoculation, setBsInoculation] = useState('');
  const [bsLarvae, setBsLarvae] = useState<number | ''>(0);
  const [bsStatus, setBsStatus] = useState<BsfRecord['status']>('Inoculation');
  const [bsNotes, setBsNotes] = useState('');

  // Inventory Form
  const [invName, setInvName] = useState('');
  const [invCat, setInvCat] = useState<InventoryItem['category']>('Feed');
  const [invQty, setInvQty] = useState<number | ''>('');
  const [invUnit, setInvUnit] = useState('bags');
  const [invMin, setInvMin] = useState<number | ''>('');

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
      date: new Date().toISOString().split('T')[0]
    });
    setFBlock('');
    setFCrop('');
    setFAcres('');
    setFNotes('');
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
      notes: coNotes.trim() || 'Scheduled task'
    });
    setCoOperationName('');
    setCoDate('');
    setCoNotes('');
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
      date: new Date().toISOString().split('T')[0]
    });
    setLsName('');
    setLsCount('');
    setLsActivity('');
    setLsNotes('');
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
      date: new Date().toISOString().split('T')[0]
    });
    setGtTag('');
    setGtMilk('');
    setGtActivity('');
    setGtNotes('');
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
      date: new Date().toISOString().split('T')[0]
    });
    setCfId('');
    setCfDam('');
    setCfDob('');
    setCfMilk(4);
    setCfCreepDate('');
    setCfWeaned(false);
    setCfNotes('');
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
      date: new Date().toISOString().split('T')[0]
    });
    setBsBatchId('');
    setBsSubstrate('');
    setBsInoculation('');
    setBsLarvae('');
    setBsNotes('');
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
      minStock: Number(invMin)
    });
    setInvName('');
    setInvQty('');
    setInvUnit('bags');
    setInvMin('');
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
                <form onSubmit={handleFieldSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full bg-white font-medium text-slate-705 cursor-pointer text-slate-600"
                      >
                        <option value="Prepared">Coarse Prepared</option>
                        <option value="Sown">Sown / Planted</option>
                        <option value="Growing">Vegetative Growing</option>
                        <option value="Harvested">Culled / harvested</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observation Log Details</label>
                      <input
                        type="text"
                        value={fNotes}
                        onChange={(e) => setFNotes(e.target.value)}
                        placeholder="E.g. Superb leaf ratio, rain-fed responding..."
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-semibold"
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
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0">
                      Commit Plot
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((fld) => (
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
                    className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-850 flex items-center gap-1.5 m-0"
                  >
                    <Plus size={14} /> Log Crop Operation
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleCropOpSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
                  <h5 className="text-xs uppercase font-black tracking-widest text-teal-800 border-b border-slate-100 pb-2">Log Field Task</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Execution / Due Date</label>
                      <input
                        type="date"
                        required
                        value={coDate}
                        onChange={(e) => setCoDate(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-3 w-full font-bold"
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
                    <div className="col-span-1 md:col-span-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Agronomy details & instructions</label>
                      <input
                        type="text"
                        value={coNotes}
                        onChange={(e) => setCoNotes(e.target.value)}
                        placeholder="E.g. Apply mulch around banana roots. Prop heavy stems with wooden forks."
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
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0">
                      Commit Task
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of logged operations */}
              <div className="space-y-4">
                {cropOps.map((op) => (
                  <div key={op.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                          {op.crop} Crop
                        </span>
                        <h6 className="font-extrabold text-sm text-[#0b251a] uppercase">{op.operationName}</h6>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Instructions & Diagnostics: <span className="font-semibold text-slate-700 italic">"{op.notes}"</span></p>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><User size={12} className="text-slate-405" /> Staff Assigned: {op.completedBy || 'Charles'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> Scheduled Date: {op.date}</span>
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
                <form onSubmit={handleLivestockSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div className="col-span-1 md:col-span-3">
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
                    <div className="col-span-1 md:col-span-3">
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
                  <div className="flex justify-end gap-2 text-right">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-amber-900 text-white font-black text-xs uppercase rounded-lg m-0">
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
                    className="bg-amber-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-amber-900 flex items-center gap-1.5 m-0 font-sans font-bold"
                  >
                    <Plus size={14} /> Register Dairy Goat
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleGoatSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
                  <h5 className="text-xs uppercase font-black tracking-widest text-[#5d4037] border-b pb-2">Add Goat Record</h5>
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
                    <button type="submit" className="px-5 py-2.5 bg-amber-950 text-white font-black text-xs uppercase rounded-lg m-0 hover:bg-amber-900">
                      Commit Goat Record
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
                <form onSubmit={handleCalfSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
                  <h5 className="text-xs uppercase font-black tracking-widest text-[#2e7d32] border-b pb-2">Log Calf profile</h5>
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
                    {!cfWeaned && (
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Daily Milk Bucket volume (Liters)</label>
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
                    <button type="submit" className="px-5 py-2.5 bg-emerald-950 text-white font-black text-xs uppercase rounded-lg m-0">
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
                            <span className="font-extrabold text-[#2e7d32] text-sm uppercase tracking-wide block">{cf.calfId}</span>
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
                <form onSubmit={handleBsfSubmit} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-4">
                  <h5 className="text-xs uppercase font-black tracking-widest text-slate-800 border-b pb-2">Log Insect grubs batch</h5>
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
                    <button type="submit" className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs uppercase rounded-lg m-0 shadow-sm">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Block / Field</h3>
            <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block Name</label>
                <input
                  type="text"
                  value={editingField.blockName}
                  onChange={(e) => setEditingField({ ...editingField, blockName: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Crop Type</label>
                <input
                  type="text"
                  value={editingField.cropType}
                  onChange={(e) => setEditingField({ ...editingField, cropType: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Acreage</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingField.acreage}
                  onChange={(e) => setEditingField({ ...editingField, acreage: parseFloat(e.target.value) || 0 })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status</label>
                <select
                  value={editingField.status}
                  onChange={(e) => setEditingField({ ...editingField, status: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Growing">Growing</option>
                  <option value="Harvested">Harvested</option>
                  <option value="Prepared">Prepared</option>
                  <option value="Fallow">Fallow</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Block Notes</label>
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
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Understock Reorder Alert Trigger (Min Quantity)</label>
              <input
                type="number"
                value={editingInventoryItem.minStock}
                onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, minStock: parseInt(e.target.value) || 0 })}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
              />
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-800">Edit Agronomy Task</h3>
            <button onClick={() => setEditingCropOp(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Assigned Crop</label>
                <select
                  value={editingCropOp.crop}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, crop: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Tea">Tea</option>
                  <option value="Avocado">Avocado</option>
                  <option value="Banana">Banana</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Sorghum">Sorghum</option>
                  <option value="Maize">Maize</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Title</label>
                <input
                  type="text"
                  value={editingCropOp.operationName}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, operationName: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Execution Date</label>
                <input
                  type="date"
                  value={editingCropOp.date}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, date: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operation Status</label>
                <select
                  value={editingCropOp.status}
                  onChange={(e) => setEditingCropOp({ ...editingCropOp, status: e.target.value as any })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">✓ Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Completed / Assigned By Staff</label>
              <select
                value={editingCropOp.completedBy || ''}
                onChange={(e) => setEditingCropOp({ ...editingCropOp, completedBy: e.target.value })}
                className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold"
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
              className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow"
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
