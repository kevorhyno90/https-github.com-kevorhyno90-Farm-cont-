import React, { useState, useEffect } from 'react';
import { MachineItem, MachineServiceRecord, StaffMember } from '../../types';
import { MachineryServiceModal } from './MachineryServiceModal';
import { MachineEditModal } from './MachineEditModal';
import { generateMachineryAuditPdf } from './MachineryPdfGenerator';
import { useFarmState } from '../../context/FarmContext';
import { INITIAL_MACHINES, INITIAL_MACHINE_SERVICES, INITIAL_STAFF } from '../../initialData';
import {
  Wrench,
  Truck,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileDown,
  Share2,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  Edit2,
  ShieldCheck,
  Award,
  DollarSign,
  Droplets,
  Zap,
  Activity
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface MachineryManagerProps {
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

export function MachineryManager({
  staffList = INITIAL_STAFF,
  onTriggerSectionReport
}: MachineryManagerProps) {
  const {
    machines = INITIAL_MACHINES,
    setMachines,
    machineServices = INITIAL_MACHINE_SERVICES,
    setMachineServices,
    setFinancials
  } = useFarmState();

  const services = machineServices;
  const setServices = setMachineServices;

  // Active view tab
  const [activeTab, setActiveTab] = useState<'fleet' | 'services'>('fleet');

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [preSelectedMachineId, setPreSelectedMachineId] = useState<string | undefined>(undefined);
  const [serviceToEdit, setServiceToEdit] = useState<MachineServiceRecord | null>(null);

  const [isMachineEditModalOpen, setIsMachineEditModalOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState<MachineItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Handle saving service record
  const handleSaveService = (record: MachineServiceRecord, syncToFinancials: boolean) => {
    if (serviceToEdit) {
      setServices(prev => prev.map(s => s.id === record.id ? record : s));
    } else {
      setServices(prev => [record, ...prev]);

      // Post expense to Farm Financials if checked
      if (syncToFinancials && record.cost > 0) {
        setFinancials(prev => [
          {
            id: `fin-mach-${Date.now()}`,
            type: 'expense',
            amount: record.cost,
            category: 'Machinery Maintenance & Repairs',
            description: `Workshop Service for ${record.machineName} (${record.regNoOrSerial}): ${record.whatWasServiced.slice(0, 60)}...`,
            date: record.serviceDate
          },
          ...prev
        ]);
      }
    }

    // Update the machine's lastServiceDate, nextServiceDueDate, and condition
    setMachines(prev => prev.map(m => {
      if (m.id === record.machineId) {
        return {
          ...m,
          lastServiceDate: record.serviceDate,
          nextServiceDueDate: record.nextServiceDate,
          condition: record.conditionAfterService,
          status: record.conditionAfterService === 'Critical Repair / Breakdown' ? 'Under Maintenance' : 'Operational'
        };
      }
      return m;
    }));
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Handle saving machine specs
  const handleSaveMachine = (machine: MachineItem) => {
    if (machineToEdit) {
      setMachines(prev => prev.map(m => m.id === machine.id ? machine : m));
    } else {
      setMachines(prev => [machine, ...prev]);
    }
  };

  const handleDeleteMachine = (id: string) => {
    if (confirm('Are you sure you want to remove this machine from the active registry?')) {
      setMachines(prev => prev.filter(m => m.id !== id));
    }
  };

  // Aggregates & KPIs
  const totalAssets = machines.length;
  const operationalCount = machines.filter(m => m.status === 'Operational' || m.status === 'In Use').length;
  const maintenanceCount = machines.filter(m => m.status === 'Under Maintenance' || m.status === 'Awaiting Spares').length;
  const totalServiceSpend = services.reduce((sum, s) => sum + (s.cost || 0), 0);
  const todayStr = toIsoDate(new Date());
  const overdueCount = machines.filter(m => m.nextServiceDueDate && m.nextServiceDueDate < todayStr).length;

  // Filtered Machines
  const filteredMachines = machines.filter((m) => {
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.regNoOrSerial.toLowerCase().includes(q) ||
      m.modelOrSpecs.toLowerCase().includes(q) ||
      m.assignedOperator.toLowerCase().includes(q);
    return matchesCat && matchesStatus && matchesSearch;
  });

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.machineName.toLowerCase().includes(q) ||
      s.regNoOrSerial.toLowerCase().includes(q) ||
      s.whatWasServiced.toLowerCase().includes(q) ||
      s.servicedBy.toLowerCase().includes(q) ||
      s.serviceTicketRef.toLowerCase().includes(q);
    return matchesSearch;
  });

  // PDF Export
  const handleDownloadPdf = () => {
    generateMachineryAuditPdf(machines, services);
  };

  // WhatsApp Digest
  const handleShareWhatsAppDigest = () => {
    const message = `🚜 *JR FARM FLEET & MACHINERY WORKSHOP BRIEFING*
📅 *Date:* ${new Date().toLocaleDateString()}
⚙️ *Total Equipment Assets:* ${totalAssets} Units
✅ *Operational Fleet:* ${operationalCount} (${totalAssets > 0 ? Math.round((operationalCount / totalAssets) * 100) : 0}%)
🔧 *Under Maintenance:* ${maintenanceCount} Units
🚨 *Overdue for Service:* ${overdueCount} Units
💰 *Total Maintenance Spend:* KES ${Math.round(totalServiceSpend).toLocaleString()}
👨‍🔧 *Approved by:* Dr. Devin Omwenga (General Farm Manager)
Estate: JR Farm Omni-Estate Engineering & Workshop`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // CSV Export
  const downloadCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'JR FARM MACHINERY SERVICE & MAINTENANCE AUDIT\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Ticket Ref,Machine Name,Reg/Serial No,Service Date,Service Type,What Was Serviced,Cost (KES),Serviced By,Parts Used,Condition After Service,Next Service Due,Next Service Target,Remarks\n';
    services.forEach((s) => {
      csv += `"${s.serviceTicketRef}","${s.machineName}","${s.regNoOrSerial}",${s.serviceDate},"${s.serviceType}","${s.whatWasServiced.replace(/"/g, '""')}",${s.cost},"${s.servicedBy}","${s.sparePartsUsed || 'None'}","${s.conditionAfterService}",${s.nextServiceDate},"${s.nextServiceKmOrHours || ''}","${s.remarksOrNotes.replace(/"/g, '""')}"\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Machinery_Maintenance_Audit_${toIsoDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Truck size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">JR Farm Fleet & Machinery Workshop</h2>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
              16 Priority Agricultural Assets
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Centralized asset tracking for heavy fleet (Track V8, New Model Harrier), farm tractors, implements (disc plough, harrows), fodder processors (chaffcutter, hammer mill, feed mixer, dual pulverizer), power tools, and water plant. Track dates of service, what was serviced, costs, conditions, and next service schedules.
          </p>
          <div className="pt-1 text-[11px] text-amber-300 font-semibold flex items-center gap-2">
            <Award size={13} className="text-amber-400" />
            <span>Presented & Approved by: <strong>Dr. Devin Omwenga (General Farm Manager)</strong></span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setMachineToEdit(null);
              setIsMachineEditModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Plus size={14} />
            <span>Add Equipment</span>
          </button>

          <button
            onClick={() => {
              setServiceToEdit(null);
              setPreSelectedMachineId(undefined);
              setIsServiceModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench size={14} />
            <span>Log Service / Repair</span>
          </button>

          <button
            onClick={handleShareWhatsAppDigest}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Share WhatsApp Digest"
          >
            <Share2 size={14} />
            <span>WhatsApp Digest</span>
          </button>

          {onTriggerSectionReport && (
            <button
              onClick={() => onTriggerSectionReport('machinery')}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Open Section Audit View"
            >
              <FileDown size={14} />
              <span>Full Audit View</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
            title="Download PDF Audit"
          >
            <FileDown size={14} />
            <span>PDF Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Equipment</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-slate-900">{totalAssets}</span>
            <span className="text-xs font-bold text-slate-500">Units</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">16 Farm Assets Tracked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Operational Ready</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-900">{operationalCount}</span>
            <span className="text-xs font-bold text-emerald-700">Units</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            {totalAssets > 0 ? Math.round((operationalCount / totalAssets) * 100) : 0}% Field Readiness
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Under Maintenance</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-amber-900">{maintenanceCount}</span>
            <span className="text-xs font-bold text-amber-700">Units</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-1">In Workshop / Standby</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Overdue for Service</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-rose-700">{overdueCount}</span>
            <span className="text-xs font-bold text-rose-700">Alerts</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold block mt-1">
            {overdueCount > 0 ? 'Requires Immediate Service' : 'All Schedules Up-to-Date'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Maintenance Spend</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-slate-900 font-mono">
              KES {Math.round(totalServiceSpend).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Cumulative Services</span>
        </div>
      </div>

      {/* Tabs Navigation & Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck size={14} />
            <span>Fleet & Machinery Registry</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
              {machines.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench size={14} />
            <span>Service & Maintenance Ledger</span>
            <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full font-mono">
              {services.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search machine, reg, service..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
            />
          </div>

          {activeTab === 'fleet' && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Heavy Fleet & Vehicles">Heavy Fleet & Vehicles</option>
                <option value="Tractors & Field Implements">Tractors & Implements</option>
                <option value="Fodder & Feed Processing">Fodder & Feed Processing</option>
                <option value="Workshop & Power Tools">Workshop Tools</option>
                <option value="Spraying & Water Utilities">Spraying & Utilities</option>
                <option value="Dairy & Processing Equipment">Dairy & Processing Equipment</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="In Use">In Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Awaiting Spares">Awaiting Spares</option>
                <option value="Standby">Standby</option>
              </select>
            </>
          )}

          {activeTab === 'services' && (
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV</span>
            </button>
          )}
        </div>

      </div>

      {/* TAB 1: FLEET & MACHINERY REGISTRY */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMachines.map((m) => {
            const isOverdue = m.nextServiceDueDate && m.nextServiceDueDate < todayStr;
            const machineServices = services.filter(s => s.machineId === m.id);

            return (
              <div
                key={m.id}
                className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  isOverdue
                    ? 'border-rose-300 ring-2 ring-rose-100'
                    : m.status === 'Operational'
                    ? 'border-slate-200 hover:border-emerald-300'
                    : 'border-amber-300'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.regNoOrSerial}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                        {m.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMachineToEdit(m);
                          setIsMachineEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Machine Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteMachine(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Machine"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {m.modelOrSpecs}
                  </p>
                </div>

                {/* Status & Condition Badges */}
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold text-[9px] uppercase">Status</span>
                      <span className={`font-bold block truncate ${
                        m.status === 'Operational' ? 'text-emerald-700' :
                        m.status === 'In Use' ? 'text-sky-700' :
                        m.status === 'Under Maintenance' ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold text-[9px] uppercase">Condition</span>
                      <span className={`font-bold block truncate ${
                        m.condition === 'Excellent' || m.condition === 'Brand New' ? 'text-emerald-700' :
                        m.condition === 'Good Working Condition' ? 'text-slate-800' :
                        m.condition === 'Fair / Needs Attention' ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {m.condition}
                      </span>
                    </div>
                  </div>

                  {/* Operator & Usage Metric */}
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Operator:</span>
                      <strong className="text-slate-900 truncate max-w-[120px]">{m.assignedOperator}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Usage / Odo:</span>
                      <span className="font-mono font-bold text-slate-800">{m.currentUsageMetric}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Power / Fuel:</span>
                      <span className="font-semibold text-slate-700">{m.fuelOrPowerType}</span>
                    </div>
                  </div>

                  {/* Next Service Due Alert */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] ${
                    isOverdue
                      ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className={isOverdue ? 'text-rose-600' : 'text-amber-600'} />
                      <span className="font-bold">Next Service Due:</span>
                    </div>
                    <span className="font-mono font-black">
                      {m.nextServiceDueDate || 'Not Scheduled'} {isOverdue ? '(OVERDUE)' : ''}
                    </span>
                  </div>

                  {m.notes && (
                    <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100 truncate">
                      {m.notes}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setServiceToEdit(null);
                      setPreSelectedMachineId(m.id);
                      setIsServiceModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Wrench size={12} />
                    <span>Log Service</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('services');
                      setSearchQuery(m.name);
                    }}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono"
                    title="View Service History"
                  >
                    {machineServices.length} Logs
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SERVICE & MAINTENANCE LEDGER */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Service, Maintenance & Repair History ({filteredServices.length} Records)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complete audit of what was serviced, costs, mechanic names, parts used, and next due targets.
              </p>
            </div>

            <button
              onClick={() => {
                setServiceToEdit(null);
                setPreSelectedMachineId(undefined);
                setIsServiceModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Record New Service</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[75vh] overflow-y-auto">
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Wrench size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold">No service records found</p>
                <p className="text-[11px]">Click "Record New Service" above to log a maintenance ticket.</p>
              </div>
            ) : (
              filteredServices.map((s) => {
                return (
                  <div key={s.id} className="p-4 hover:bg-slate-50/70 transition-all space-y-2.5">
                    
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                          {s.serviceTicketRef}
                        </span>
                        <h5 className="text-xs font-black text-slate-900">
                          {s.machineName} ({s.regNoOrSerial})
                        </h5>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                          {s.serviceType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.serviceDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          KES {s.cost.toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setServiceToEdit(s);
                              setIsServiceModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* What was serviced */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/80 text-xs text-slate-800 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                        Work Done & Service Details
                      </span>
                      <p className="leading-relaxed font-medium">
                        {s.whatWasServiced}
                      </p>
                      {s.sparePartsUsed && (
                        <p className="text-[10px] text-slate-600 pt-1 border-t border-slate-200/60 font-sans">
                          📦 <strong>Parts / Lubricants:</strong> {s.sparePartsUsed}
                        </p>
                      )}
                    </div>

                    {/* Footer details: Serviced By, Condition, Next Due */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                      <div>
                        <span>Serviced By: <strong className="text-slate-800">{s.servicedBy}</strong></span>
                        <span className="mx-2">•</span>
                        <span>Condition After Service: <strong className="text-emerald-800 font-bold">{s.conditionAfterService}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-amber-200">
                          Next Due: {s.nextServiceDate} {s.nextServiceKmOrHours ? `(${s.nextServiceKmOrHours})` : ''}
                        </span>
                      </div>
                    </div>

                    {s.remarksOrNotes && (
                      <p className="text-[10px] text-slate-500 italic">
                        📝 Remarks: {s.remarksOrNotes}
                      </p>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Service Modal */}
      <MachineryServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        machines={machines}
        preSelectedMachineId={preSelectedMachineId}
        serviceToEdit={serviceToEdit}
        onSaveService={handleSaveService}
        staffList={staffList}
      />

      {/* Machine Edit / Add Modal */}
      <MachineEditModal
        isOpen={isMachineEditModalOpen}
        onClose={() => {
          setIsMachineEditModalOpen(false);
          setMachineToEdit(null);
        }}
        machineToEdit={machineToEdit}
        onSaveMachine={handleSaveMachine}
        staffList={staffList}
      />

    </div>
  );
}
