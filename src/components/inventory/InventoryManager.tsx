import React, { useState, useMemo, useEffect } from 'react';
import {
  InventoryItem, InventoryCategory, InventoryMovementLog,
  InventorySectionTarget, StaffMember
} from '../../types';
import {
  INITIAL_EXPANDED_INVENTORY,
  INITIAL_MOVEMENT_LOGS
} from '../../data/inventoryExpandedData';
import {
  getItemStockStatus,
  dispenseItemStock,
  logInventoryMovement
} from '../../utils/inventoryHelper';
import { generateInventoryAuditPdf } from './InventoryPdfGenerator';
import { toIsoDate } from '../../utils/dateHelper';
import { REMOTE_SYNC_APPLIED_EVENT } from '../../context/FarmContext';
import {
  Warehouse, Search, Plus, Edit2, Trash2, Download, AlertTriangle,
  CheckCircle2, Clock, MapPin, DollarSign, ArrowDownRight, ArrowUpRight,
  Filter, Layers, ShieldCheck, Flame, Stethoscope, Droplets, Wrench,
  Sparkles, RefreshCw, X, FileSpreadsheet, Box
} from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryStock?: (id: string, newQty: number) => void;
  onEditInventoryItem?: (id: string, updated: InventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type InventorySubTab = 'stocks' | 'dispense' | 'movements' | 'locations';

const CATEGORIES_LIST: InventoryCategory[] = [
  'Feeds & Raw Ingredients',
  'Veterinary & Animal Drugs',
  'Crop Protection & Agrochemicals',
  'Farm Tools & Implements',
  'Machinery & Milking Equipment',
  'Detergents & Biosecurity Hygiene'
];

const SECTIONS_LIST: InventorySectionTarget[] = [
  'Dairy Herd & Parlour',
  'Poultry & Avian',
  'Horticulture & Crops',
  'Goat Dairy',
  'Calf Nursery',
  'Canines & Security',
  'General Farm Operations'
];

export function InventoryManager({
  inventory = [],
  onAddInventoryItem,
  onUpdateInventoryStock,
  onEditInventoryItem,
  onDeleteInventoryItem,
  staffList = [],
  onTriggerSectionReport
}: InventoryManagerProps) {
  const [subTab, setSubTab] = useState<InventorySubTab>('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Movement logs state
  const [movementLogs, setMovementLogs] = useState<InventoryMovementLog[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_inventory_movements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MOVEMENT_LOGS;
  });

  // Recent system alert banner
  const [systemAlert, setSystemAlert] = useState<{ type: 'depleted' | 'low_stock' | 'success'; message: string } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Form states for Add / Edit
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<InventoryCategory>('Feeds & Raw Ingredients');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemUnit, setItemUnit] = useState('bags (50kg)');
  const [itemMinStock, setItemMinStock] = useState<number>(5);
  const [itemLocation, setItemLocation] = useState('Feed Warehouse Bay 1');
  const [itemIntendedUse, setItemIntendedUse] = useState('');
  const [itemUnitCost, setItemUnitCost] = useState<number>(0);
  const [itemSupplier, setItemSupplier] = useState('');
  const [itemExpiryDate, setItemExpiryDate] = useState('');
  const [itemBatch, setItemBatch] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  // Form states for Dispense
  const [dispenseTargetItemId, setDispenseTargetItemId] = useState<string>('');
  const [dispenseAmount, setDispenseAmount] = useState<number>(1);
  const [dispenseSection, setDispenseSection] = useState<InventorySectionTarget>('Dairy Herd & Parlour');
  const [dispenseReason, setDispenseReason] = useState<string>('');
  const [dispenseStaff, setDispenseStaff] = useState<string>('Peter Kibet');

  // Form states for Restock
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockSupplier, setRestockSupplier] = useState<string>('');
  const [restockCost, setRestockCost] = useState<number>(0);
  const [restockExpiry, setRestockExpiry] = useState<string>('');

  // Combine parent inventory with expanded initial data if user only has basic stock
  const allInventoryItems: InventoryItem[] = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return INITIAL_EXPANDED_INVENTORY;
    }
    // Check if initial expanded items are already present, else merge seamlessly
    const existingIds = new Set(inventory.map(i => i.id));
    const merged = [...inventory];
    INITIAL_EXPANDED_INVENTORY.forEach(expItem => {
      if (!existingIds.has(expItem.id)) {
        merged.push(expItem);
      }
    });
    return merged;
  }, [inventory]);

  const isRemoteSyncingInvRef = React.useRef(false);

  // Save movement logs
  useEffect(() => {
    if (isRemoteSyncingInvRef.current) return;
    try {
      const serialized = JSON.stringify(movementLogs);
      if (localStorage.getItem('jr_farm_inventory_movements') === serialized) return;
      localStorage.setItem('jr_farm_inventory_movements', serialized);
    } catch {}
  }, [movementLogs]);

  // Listen for remote sync updates from other devices
  useEffect(() => {
    const handleRemoteSync = () => {
      isRemoteSyncingInvRef.current = true;
      try {
        const saved = localStorage.getItem('jr_farm_inventory_movements');
        if (saved) setMovementLogs(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to reload inventory movements on sync', err);
      } finally {
        setTimeout(() => {
          isRemoteSyncingInvRef.current = false;
        }, 500);
      }
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    };
  }, []);

  // Metrics Calculations
  const stats = useMemo(() => {
    let totalItems = allInventoryItems.length;
    let totalValuation = 0;
    let depletedCount = 0;
    let lowStockCount = 0;
    let expiredCount = 0;

    allInventoryItems.forEach(item => {
      const val = (item.quantity || 0) * (item.unitCostKes || 0);
      totalValuation += val;
      const status = getItemStockStatus(item);
      if (status === 'Out of Stock (Over)') depletedCount += 1;
      else if (status === 'Low Stock Warning') lowStockCount += 1;
      else if (status === 'Expired') expiredCount += 1;
    });

    return { totalItems, totalValuation, depletedCount, lowStockCount, expiredCount };
  }, [allInventoryItems]);

  // Critical alerts list
  const criticalDepleted = allInventoryItems.filter(i => getItemStockStatus(i) === 'Out of Stock (Over)');
  const criticalLowStock = allInventoryItems.filter(i => getItemStockStatus(i) === 'Low Stock Warning');
  const criticalExpired = allInventoryItems.filter(i => getItemStockStatus(i) === 'Expired');

  // Locations list
  const storageLocations = useMemo(() => {
    const set = new Set<string>();
    allInventoryItems.forEach(i => {
      if (i.location) set.add(i.location);
    });
    return Array.from(set).sort();
  }, [allInventoryItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return allInventoryItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.intendedUse || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        item.category === selectedCategory ||
        (selectedCategory === 'Feeds & Raw Ingredients' && item.category === 'Feed') ||
        (selectedCategory === 'Crop Protection & Agrochemicals' && (item.category === 'Chemical' || item.category === 'Fertilizer')) ||
        (selectedCategory === 'Farm Tools & Implements' && item.category === 'Tools');

      const itemStatus = getItemStockStatus(item);
      const matchesStatus =
        selectedStatus === 'All' ||
        itemStatus === selectedStatus;

      const matchesLocation =
        selectedLocation === 'All' ||
        item.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [allInventoryItems, searchTerm, selectedCategory, selectedStatus, selectedLocation]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setActiveItem(null);
    setItemName('');
    setItemCategory('Feeds & Raw Ingredients');
    setItemQty(10);
    setItemUnit('bags (50kg)');
    setItemMinStock(5);
    setItemLocation('Feed Warehouse Bay 1');
    setItemIntendedUse('');
    setItemUnitCost(0);
    setItemSupplier('');
    setItemExpiryDate('');
    setItemBatch('');
    setItemNotes('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setActiveItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemQty(item.quantity);
    setItemUnit(item.unit);
    setItemMinStock(item.minStock);
    setItemLocation(item.location || '');
    setItemIntendedUse(item.intendedUse || '');
    setItemUnitCost(item.unitCostKes || 0);
    setItemSupplier(item.supplier || '');
    setItemExpiryDate(item.expiryDate || '');
    setItemBatch(item.batchNumber || '');
    setItemNotes(item.notes || '');
    setShowEditModal(true);
  };

  const handleOpenDispenseModal = (item?: InventoryItem) => {
    const target = item || (filteredItems.length > 0 ? filteredItems[0] : allInventoryItems[0]);
    setActiveItem(target);
    setDispenseTargetItemId(target ? target.id : '');
    setDispenseAmount(1);
    setDispenseSection('Dairy Herd & Parlour');
    setDispenseReason('');
    setDispenseStaff('Peter Kibet');
    setShowDispenseModal(true);
  };

  const handleOpenRestockModal = (item: InventoryItem) => {
    setActiveItem(item);
    setRestockAmount(10);
    setRestockSupplier(item.supplier || '');
    setRestockCost(item.unitCostKes || 0);
    setRestockExpiry(item.expiryDate || '');
    setShowRestockModal(true);
  };

  // Submit Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: itemName,
      category: itemCategory,
      quantity: Number(itemQty),
      unit: itemUnit,
      minStock: Number(itemMinStock),
      location: itemLocation,
      intendedUse: itemIntendedUse,
      unitCostKes: Number(itemUnitCost),
      supplier: itemSupplier,
      expiryDate: itemExpiryDate || undefined,
      batchNumber: itemBatch || undefined,
      dateReceived: toIsoDate(new Date()),
      notes: itemNotes
    };

    onAddInventoryItem(newItem);
    logInventoryMovement({
      itemId: newItem.id,
      itemName: newItem.name,
      category: newItem.category,
      movementType: 'Restock / Purchase',
      quantityChanged: newItem.quantity,
      quantityBefore: 0,
      quantityAfter: newItem.quantity,
      unit: newItem.unit,
      usedBySection: 'General Farm Operations',
      purposeOrReason: 'Initial commodity intake into inventory catalogue',
      loggedBy: 'Dr. Devin Omwenga'
    });

    setShowAddModal(false);
    setSystemAlert({ type: 'success', message: `✅ Successfully registered "${newItem.name}" into inventory.` });
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const updated: InventoryItem = {
      ...activeItem,
      name: itemName,
      category: itemCategory,
      quantity: Number(itemQty),
      unit: itemUnit,
      minStock: Number(itemMinStock),
      location: itemLocation,
      intendedUse: itemIntendedUse,
      unitCostKes: Number(itemUnitCost),
      supplier: itemSupplier,
      expiryDate: itemExpiryDate || undefined,
      batchNumber: itemBatch || undefined,
      notes: itemNotes
    };

    if (onEditInventoryItem) {
      onEditInventoryItem(activeItem.id, updated);
    } else if (onUpdateInventoryStock) {
      onUpdateInventoryStock(activeItem.id, Number(itemQty));
    }

    setShowEditModal(false);
    setSystemAlert({ type: 'success', message: `✅ Changes saved for "${updated.name}".` });
  };

  // Submit Dispense / Consumption
  const handleSaveDispense = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = allInventoryItems.find(i => i.id === dispenseTargetItemId) || activeItem;
    if (!targetItem) return;

    const res = dispenseItemStock(
      targetItem,
      Number(dispenseAmount),
      dispenseSection,
      dispenseReason || `Routine consumption for ${dispenseSection}`,
      dispenseStaff
    );

    // Update parent state
    if (onUpdateInventoryStock) {
      onUpdateInventoryStock(targetItem.id, res.updatedItem.quantity);
    } else if (onEditInventoryItem) {
      onEditInventoryItem(targetItem.id, res.updatedItem);
    }

    // Prepend to local movement log
    setMovementLogs(prev => [res.movementLog, ...prev]);

    setShowDispenseModal(false);

    if (res.alertType === 'depleted') {
      setSystemAlert({
        type: 'depleted',
        message: res.alertMessage || `🚨 OVER: "${targetItem.name}" is completely finished (0 ${targetItem.unit})!`
      });
    } else if (res.alertType === 'low_stock') {
      setSystemAlert({
        type: 'low_stock',
        message: res.alertMessage || `⚠️ LOW STOCK: "${targetItem.name}" is below safety threshold.`
      });
    } else {
      setSystemAlert({
        type: 'success',
        message: `✅ Dispensed ${dispenseAmount} ${targetItem.unit} of "${targetItem.name}" to ${dispenseSection}. Remaining balance: ${res.updatedItem.quantity} ${targetItem.unit}.`
      });
    }
  };

  // Submit Restock
  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const qtyBefore = activeItem.quantity;
    const qtyAfter = Number((qtyBefore + Number(restockAmount)).toFixed(2));

    const updated: InventoryItem = {
      ...activeItem,
      quantity: qtyAfter,
      unitCostKes: restockCost ? Number(restockCost) : activeItem.unitCostKes,
      supplier: restockSupplier || activeItem.supplier,
      expiryDate: restockExpiry || activeItem.expiryDate,
      lastRestockedDate: toIsoDate(new Date())
    };

    if (onUpdateInventoryStock) {
      onUpdateInventoryStock(activeItem.id, qtyAfter);
    } else if (onEditInventoryItem) {
      onEditInventoryItem(activeItem.id, updated);
    }

    const newLog = logInventoryMovement({
      itemId: activeItem.id,
      itemName: activeItem.name,
      category: activeItem.category,
      movementType: 'Restock / Purchase',
      quantityChanged: Number(restockAmount),
      quantityBefore: qtyBefore,
      quantityAfter: qtyAfter,
      unit: activeItem.unit,
      usedBySection: 'General Farm Operations',
      purposeOrReason: `Received fresh shipment from ${restockSupplier || 'Supplier'}`,
      loggedBy: 'Dr. Devin Omwenga',
      costKes: Number(restockAmount) * (restockCost || activeItem.unitCostKes || 0)
    });

    setMovementLogs(prev => [newLog, ...prev]);
    setShowRestockModal(false);
    setSystemAlert({
      type: 'success',
      message: `✅ Restocked +${restockAmount} ${activeItem.unit} of "${activeItem.name}". New balance: ${qtyAfter} ${activeItem.unit}.`
    });
  };

  // PDF Export
  const handleDownloadPdf = () => {
    generateInventoryAuditPdf(allInventoryItems, movementLogs);
  };

  // CSV Export
  const handleExportCsv = () => {
    let csv = 'SKU / ID,Item Name,Category,Quantity,Unit,Min Safety Stock,Location,Intended Use,Unit Cost Kes,Total Value Kes,Supplier,Expiry Date,Status\n';
    allInventoryItems.forEach(i => {
      const status = getItemStockStatus(i);
      const tot = i.quantity * (i.unitCostKes || 0);
      csv += `"${i.id}","${i.name}","${i.category}",${i.quantity},"${i.unit}",${i.minStock},"${i.location || ''}","${(i.intendedUse || '').replace(/"/g, '""')}",${i.unitCostKes || 0},${tot},"${i.supplier || ''}","${i.expiryDate || ''}","${status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JR_Farm_Inventory_Stock_${toIsoDate(new Date())}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Ribbon */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded tracking-wide uppercase">
              Central Farm Warehouse & Pharmacy
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
              Valuation: KSh {Math.round(stats.totalValuation).toLocaleString()}
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>📦</span> Comprehensive Inventory & Resource Center
          </h2>
          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            Manage feeds ingredients, veterinary animal drugs, crop protection chemicals, farm tools, machinery parts, and parlour detergents.
            Track intended use, locations, balances, and cross-section consumption with auto-deduction and depletion alerts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenDispenseModal()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Dispense / Deduct items for a farm section"
          >
            <ArrowDownRight size={14} />
            Dispense / Use Stock
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Register a new inventory commodity"
          >
            <Plus size={14} />
            Register Commodity
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Download PDF Warehouse Valuation Audit"
          >
            <Download size={14} />
            PDF Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Commodities</span>
          <div className="text-xl font-bold font-mono text-gray-900 mt-1">
            {stats.totalItems} <span className="text-xs font-normal text-gray-500">SKUs</span>
          </div>
          <span className="text-[10px] text-gray-500">Active store inventory</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Asset Value</span>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            KSh {Math.round(stats.totalValuation).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Verified cost balance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-rose-700 uppercase block flex items-center gap-1">
            <span>🚨</span> Out of Stock (Over)
          </span>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">
            {stats.depletedCount} <span className="text-xs font-normal text-gray-500">depleted</span>
          </div>
          <span className="text-[10px] text-rose-600 font-semibold">Immediate reorder required</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase block flex items-center gap-1">
            <span>⚠️</span> Low Stock Warnings
          </span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {stats.lowStockCount} <span className="text-xs font-normal text-gray-500">items</span>
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">At or below reorder buffer</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase block flex items-center gap-1">
            <span>🛑</span> Expired / Past Date
          </span>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1">
            {stats.expiredCount} <span className="text-xs font-normal text-gray-500">items</span>
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">Quarantine from application</span>
        </div>
      </div>

      {/* Critical System Alert Banner (Notification) */}
      {(criticalDepleted.length > 0 || systemAlert) && (
        <div className="space-y-2">
          {criticalDepleted.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex items-start justify-between gap-3 shadow-sm animate-pulse">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-rose-950">
                    🚨 CRITICAL OUT OF STOCK (OVER) ALARM: {criticalDepleted.length} commodity is completely depleted!
                  </h4>
                  <p className="text-rose-800">
                    The following items have reached <strong>0 stock</strong>. Operations requiring these materials will stall until replenished:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {criticalDepleted.map(item => (
                      <span key={item.id} className="bg-white border border-rose-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-rose-900 shadow-2xs">
                        {item.name} ({item.category}) • Location: {item.location || 'Store'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenRestockModal(criticalDepleted[0])}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer"
              >
                Restock Now
              </button>
            </div>
          )}

          {systemAlert && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              systemAlert.type === 'depleted' ? 'bg-rose-50 text-rose-900 border-rose-200' :
              systemAlert.type === 'low_stock' ? 'bg-amber-50 text-amber-900 border-amber-200' :
              'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                {systemAlert.type === 'depleted' ? <AlertTriangle size={16} className="text-rose-600 shrink-0" /> :
                 systemAlert.type === 'low_stock' ? <AlertTriangle size={16} className="text-amber-600 shrink-0" /> :
                 <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                <span>{systemAlert.message}</span>
              </div>
              <button
                onClick={() => setSystemAlert(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subtab Navigation */}
      <div className="flex bg-white border border-gray-200 p-1.5 rounded-2xl shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setSubTab('stocks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'stocks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Box size={15} />
          Warehouse Stock Balance ({allInventoryItems.length})
        </button>

        <button
          onClick={() => setSubTab('dispense')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'dispense'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <ArrowDownRight size={15} />
          Cross-Section Dispense Center
        </button>

        <button
          onClick={() => setSubTab('movements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'movements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Clock size={15} />
          Stock Movement & Audit Ledger ({movementLogs.length})
        </button>

        <button
          onClick={() => setSubTab('locations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'locations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <MapPin size={15} />
          Storage Locations & Bins ({storageLocations.length})
        </button>
      </div>

      {/* 1. STOCKS CATALOGUE TAB */}
      {subTab === 'stocks' && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Categories ({allInventoryItems.length})
            </button>

            {CATEGORIES_LIST.map(cat => {
              const count = allInventoryItems.filter(i =>
                i.category === cat ||
                (cat === 'Feeds & Raw Ingredients' && i.category === 'Feed') ||
                (cat === 'Crop Protection & Agrochemicals' && (i.category === 'Chemical' || i.category === 'Fertilizer')) ||
                (cat === 'Farm Tools & Implements' && i.category === 'Tools')
              ).length;

              const emoji =
                cat.includes('Feed') ? '🌽' :
                cat.includes('Veterinary') ? '🩺' :
                cat.includes('Crop') ? '🌿' :
                cat.includes('Tools') ? '🛠️' :
                cat.includes('Machinery') ? '⚙️' : '🧼';

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item name, intended use, location, supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Stock">✅ In Stock</option>
                  <option value="Low Stock Warning">⚠️ Low Stock Warning</option>
                  <option value="Out of Stock (Over)">🚨 Out of Stock (Over)</option>
                  <option value="Expired">🛑 Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-500">Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="text-xs font-medium border border-gray-200 rounded-xl px-2.5 py-2 bg-white"
                >
                  <option value="All">All Locations</option>
                  {storageLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <Warehouse size={40} className="mx-auto text-gray-300 mb-3" />
              <h4 className="text-sm font-bold text-gray-800">No Inventory Items Found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                No items match your active search or filters. Click "Register Commodity" to add a new inventory item.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const status = getItemStockStatus(item);
                const isOver = status === 'Out of Stock (Over)';
                const isLow = status === 'Low Stock Warning';
                const isExpired = status === 'Expired';
                const totalItemValuation = item.quantity * (item.unitCostKes || 0);

                const categoryEmoji =
                  item.category.includes('Feed') ? '🌽' :
                  item.category.includes('Veterinary') ? '🩺' :
                  item.category.includes('Crop') ? '🌿' :
                  item.category.includes('Tools') ? '🛠️' :
                  item.category.includes('Machinery') ? '⚙️' : '🧼';

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                      isOver ? 'border-rose-300 ring-1 ring-rose-300 bg-rose-50/10' :
                      isLow ? 'border-amber-300' :
                      isExpired ? 'border-purple-300' :
                      'border-gray-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-2xl p-1 bg-gray-50 rounded-xl border border-gray-100">{categoryEmoji}</span>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">
                              {item.name}
                            </h4>
                            <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                              {item.category}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                          isOver ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
                          isLow ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          isExpired ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* Intended Use & Application */}
                      {item.intendedUse && (
                        <p className="text-xs text-gray-600 bg-gray-50/80 p-2 rounded-xl border border-gray-100 line-clamp-2" title={item.intendedUse}>
                          <span className="font-bold text-gray-700">Use:</span> {item.intendedUse}
                        </p>
                      )}
                    </div>

                    {/* Quantity & Stock Level Balance */}
                    <div className="space-y-2 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Available Balance</span>
                          <span className={`text-base font-bold font-mono ${
                            isOver ? 'text-rose-700' : isLow ? 'text-amber-800' : 'text-gray-900'
                          }`}>
                            {item.quantity} <span className="text-[11px] font-normal text-gray-500">{item.unit}</span>
                          </span>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>Reorder Threshold: <strong>{item.minStock} {item.unit.split(' ')[0]}</strong></span>
                          {item.unitCostKes ? (
                            <span>Valuation: <strong className="font-mono text-gray-800">KSh {Math.round(totalItemValuation).toLocaleString()}</strong></span>
                          ) : null}
                        </div>
                      </div>

                      {/* Location, Expiry & Supplier */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1 text-gray-600 truncate" title={item.location}>
                          <MapPin size={12} className="text-amber-600 shrink-0" />
                          <span className="truncate">{item.location || 'Store Alpha'}</span>
                        </div>

                        {item.expiryDate ? (
                          <div className={`flex items-center gap-1 justify-end font-mono ${
                            isExpired ? 'text-purple-700 font-bold' : 'text-gray-600'
                          }`}>
                            <Clock size={12} className="shrink-0" />
                            <span>Exp: {item.expiryDate}</span>
                          </div>
                        ) : (
                          <div className="text-right text-gray-400 text-[10px]">No expiry date</div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          onClick={() => handleOpenDispenseModal(item)}
                          disabled={item.quantity <= 0}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold border border-rose-200 transition-colors disabled:opacity-40"
                          title="Dispense / Deduct stock for a section"
                        >
                          <ArrowDownRight size={12} /> Dispense
                        </button>

                        <button
                          onClick={() => handleOpenRestockModal(item)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200 transition-colors"
                          title="Restock incoming shipment"
                        >
                          <ArrowUpRight size={12} /> Restock
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Commodity Details"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove "${item.name}" from inventory?`)) {
                              onDeleteInventoryItem(item.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. CROSS-SECTION DISPENSE CENTER TAB */}
      {subTab === 'dispense' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded tracking-wide uppercase">
              Section Distribution Hub
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              📤 Dispense Commodity to Farm Department
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Consume feed ingredients, veterinary drugs, agrochemicals, or parlour detergents with automatic inventory deduction and real-time depletion alarms.
            </p>
          </div>

          <form onSubmit={handleSaveDispense} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Select Item to Dispense *</label>
              <select
                required
                value={dispenseTargetItemId}
                onChange={(e) => {
                  setDispenseTargetItemId(e.target.value);
                  const sel = allInventoryItems.find(i => i.id === e.target.value);
                  if (sel) setActiveItem(sel);
                }}
                className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl bg-white"
              >
                {allInventoryItems.map(item => (
                  <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                    {item.name} — Current Balance: {item.quantity} {item.unit} ({item.location || 'Store'}) {item.quantity <= 0 ? '(DEPLETED)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Farm Section *</label>
                <select
                  value={dispenseSection}
                  onChange={(e) => setDispenseSection(e.target.value as any)}
                  className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl bg-white"
                >
                  {SECTIONS_LIST.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">Quantity to Deduct *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={dispenseAmount}
                  onChange={(e) => setDispenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-3 border border-rose-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Purpose / Clinical Reason *</label>
              <input
                type="text"
                required
                placeholder="E.g. Dosing 500 chicks for coccidiosis, compounding 200kg TMR ration, parlour wash"
                value={dispenseReason}
                onChange={(e) => setDispenseReason(e.target.value)}
                className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Authorized Staff / Worker</label>
              <input
                type="text"
                required
                placeholder="Peter Kibet"
                value={dispenseStaff}
                onChange={(e) => setDispenseStaff(e.target.value)}
                className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl"
              />
            </div>

            {/* Live Deductions Impact Preview */}
            {(() => {
              const sel = allInventoryItems.find(i => i.id === dispenseTargetItemId);
              if (!sel) return null;
              const willRemain = Math.max(0, Number((sel.quantity - dispenseAmount).toFixed(2)));
              const willBeDepleted = willRemain <= 0;
              const willBeLow = willRemain <= sel.minStock && !willBeDepleted;

              return (
                <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                  willBeDepleted ? 'bg-rose-50 border-rose-300 text-rose-950' :
                  willBeLow ? 'bg-amber-50 border-amber-300 text-amber-950' :
                  'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="font-bold flex justify-between">
                    <span>Stock Impact Preview:</span>
                    <span className="font-mono">
                      Current: {sel.quantity} {sel.unit} ➔ Will Remain: <strong>{willRemain} {sel.unit}</strong>
                    </span>
                  </div>
                  {willBeDepleted && (
                    <div className="text-rose-700 font-bold flex items-center gap-1">
                      🚨 Warning: This deduction will completely exhaust "{sel.name}" to 0! A critical depletion alarm will trigger.
                    </div>
                  )}
                  {willBeLow && (
                    <div className="text-amber-800 font-semibold flex items-center gap-1">
                      ⚠️ Note: Remaining balance ({willRemain} {sel.unit}) will fall below minimum safe stock ({sel.minStock} {sel.unit}).
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
              >
                Confirm & Auto-Deduct from Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STOCK MOVEMENT & AUDIT HISTORY TAB */}
      {subTab === 'movements' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <span>📋</span> Inventory Movement & Consumption Audit History
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Every deduction, restock shipment, and department consumption event.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
              {movementLogs.length} Logged Audit Events
            </span>
          </div>

          {movementLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              No inventory movements logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4 text-right">Qty Changed</th>
                    <th className="py-3 px-4 text-right">Balance After</th>
                    <th className="py-3 px-4">Benefited Department</th>
                    <th className="py-3 px-4">Purpose / Reason</th>
                    <th className="py-3 px-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movementLogs.map(mov => {
                    const isConsumption = mov.quantityChanged < 0;

                    return (
                      <tr key={mov.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-800 whitespace-nowrap">
                          {mov.date}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900 block">{mov.itemName}</span>
                          <span className="text-[10px] text-gray-500">{mov.category}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold inline-flex items-center gap-1 ${
                            isConsumption ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isConsumption ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                            {mov.movementType}
                          </span>
                        </td>

                        <td className={`py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                          isConsumption ? 'text-rose-700' : 'text-emerald-700'
                        }`}>
                          {mov.quantityChanged > 0 ? `+${mov.quantityChanged}` : mov.quantityChanged} {mov.unit.split(' ')[0]}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-gray-800 whitespace-nowrap">
                          {mov.quantityAfter} {mov.unit.split(' ')[0]}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold text-[10.5px]">
                            {mov.usedBySection}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[11px] max-w-[240px]">
                          <span className="text-gray-700 block truncate" title={mov.purposeOrReason}>
                            {mov.purposeOrReason}
                          </span>
                          {mov.costKes ? (
                            <span className="text-[10px] font-mono text-emerald-800 font-bold">KSh {mov.costKes.toLocaleString()}</span>
                          ) : null}
                        </td>

                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-[11px]">
                          {mov.loggedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. STORAGE LOCATIONS & BINS TAB */}
      {subTab === 'locations' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <span>📍</span> Physical Storage Facilities & Pharmacy Cabinets
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Organized by room, bay, cabinet, and cold chain refrigerator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storageLocations.map(loc => {
              const itemsInLoc = allInventoryItems.filter(i => i.location === loc);
              const totalLocValue = itemsInLoc.reduce((acc, i) => acc + (i.quantity * (i.unitCostKes || 0)), 0);

              return (
                <div key={loc} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <MapPin size={14} className="text-amber-600" />
                        <span>{loc}</span>
                      </h5>
                      <span className="text-[11px] text-gray-500">{itemsInLoc.length} commodities stored</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      KSh {Math.round(totalLocValue).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {itemsInLoc.map(it => {
                      const st = getItemStockStatus(it);
                      return (
                        <div key={it.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50/70 hover:bg-gray-100/70 transition-colors">
                          <div>
                            <span className="font-semibold text-gray-900 block">{it.name}</span>
                            <span className="text-[10px] text-gray-500">{it.intendedUse ? it.intendedUse.substring(0, 36) + '..' : it.category}</span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-gray-900 block">{it.quantity} {it.unit.split(' ')[0]}</span>
                            <span className={`text-[9.5px] font-bold ${
                              st === 'Out of Stock (Over)' ? 'text-rose-600' :
                              st === 'Low Stock Warning' ? 'text-amber-600' :
                              st === 'Expired' ? 'text-purple-600' : 'text-emerald-700'
                            }`}>
                              {st}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW COMMODITY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>📦</span> Register New Commodity / Resource
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add feed ingredients, animal/crop drugs, tools, equipment, or detergents.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Item / Commodity Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Penicillin-Streptomycin, Layers Complete Mash, Ridomil Gold, Teat Dip"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Commodity Category *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Storage Location / Cabinet *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Vet Pharmacy Cabinet, Feed Warehouse Bay 1, Chemical Shed"
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Initial Opening Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={itemQty}
                    onChange={(e) => setItemQty(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Measurement Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. bags (50kg), litres, bottles (100ml), kg, units, vials"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">Minimum Safety Stock Level *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={itemMinStock}
                    onChange={(e) => setItemMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-amber-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Unit Cost (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2400"
                    value={itemUnitCost}
                    onChange={(e) => setItemUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Intended Use & Clinical / Farm Application *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Post-milking teat immersion, acute mastitis treatment, high-energy lactating cow ration"
                    value={itemIntendedUse}
                    onChange={(e) => setItemIntendedUse(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Supplier / Agrovet Source</label>
                  <input
                    type="text"
                    placeholder="E.g. Unga Farm Care, Norbrook, DeLaval, Twiga Chemical"
                    value={itemSupplier}
                    onChange={(e) => setItemSupplier(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Expiry Date (If drug/chemical)</label>
                  <input
                    type="date"
                    value={itemExpiryDate}
                    onChange={(e) => setItemExpiryDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Save Commodity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COMMODITY */}
      {showEditModal && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>✏️</span> Edit Commodity: {activeItem.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update quantities, locations, minimum restock levels, or uses.
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Category *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={itemQty}
                    onChange={(e) => setItemQty(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">Safety Min Stock *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={itemMinStock}
                    onChange={(e) => setItemMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-amber-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Unit Cost (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemUnitCost}
                    onChange={(e) => setItemUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Intended Use *</label>
                  <input
                    type="text"
                    required
                    value={itemIntendedUse}
                    onChange={(e) => setItemIntendedUse(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={itemExpiryDate}
                    onChange={(e) => setItemExpiryDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Supplier</label>
                  <input
                    type="text"
                    value={itemSupplier}
                    onChange={(e) => setItemSupplier(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESTOCK COMMODITY */}
      {showRestockModal && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>📥</span> Restock: {activeItem.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Current Stock: <strong className="font-mono">{activeItem.quantity} {activeItem.unit}</strong>
                </p>
              </div>
              <button onClick={() => setShowRestockModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveRestock} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">Incoming Shipment Quantity *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-3 border border-emerald-300 rounded-xl font-mono text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Supplier / Agrovet</label>
                <input
                  type="text"
                  placeholder={activeItem.supplier || 'Supplier name'}
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Unit Cost (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    value={restockCost}
                    onChange={(e) => setRestockCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={restockExpiry}
                    onChange={(e) => setRestockExpiry(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-950 flex justify-between">
                <span>New Balance After Shipment:</span>
                <span className="font-mono font-bold">
                  {(activeItem.quantity + Number(restockAmount)).toFixed(1)} {activeItem.unit}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DISPENSE QUICK POPUP (FROM CARD BUTTON) */}
      {showDispenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>📤</span> Dispense Stock
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deduct quantity for department use. Auto-deducts and notifies if depleted.
                </p>
              </div>
              <button onClick={() => setShowDispenseModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveDispense} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Item to Dispense *</label>
                <select
                  required
                  value={dispenseTargetItemId}
                  onChange={(e) => {
                    setDispenseTargetItemId(e.target.value);
                    const sel = allInventoryItems.find(i => i.id === e.target.value);
                    if (sel) setActiveItem(sel);
                  }}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                >
                  {allInventoryItems.map(item => (
                    <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Department *</label>
                  <select
                    value={dispenseSection}
                    onChange={(e) => setDispenseSection(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    {SECTIONS_LIST.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">Quantity to Deduct *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={dispenseAmount}
                    onChange={(e) => setDispenseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold p-2.5 border border-rose-300 rounded-xl font-mono text-rose-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Purpose / Clinical Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Brooder chicks vaccination, Parlour line descaling"
                  value={dispenseReason}
                  onChange={(e) => setDispenseReason(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Dispensed By</label>
                <input
                  type="text"
                  required
                  value={dispenseStaff}
                  onChange={(e) => setDispenseStaff(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispenseModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Confirm & Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
