import React, { useState, useEffect } from 'react';
import { MachineItem, StaffMember } from '../../types';
import { X, CheckCircle2, Truck, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';

interface MachineEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineToEdit?: MachineItem | null;
  onSaveMachine: (machine: MachineItem) => void;
  staffList: StaffMember[];
}

export function MachineEditModal({
  isOpen,
  onClose,
  machineToEdit,
  onSaveMachine,
  staffList
}: MachineEditModalProps) {
  const [name, setName] = useState<string>('');
  const [regNoOrSerial, setRegNoOrSerial] = useState<string>('');
  const [category, setCategory] = useState<MachineItem['category']>('Heavy Fleet & Vehicles');
  const [modelOrSpecs, setModelOrSpecs] = useState<string>('');
  const [condition, setCondition] = useState<MachineItem['condition']>('Good Working Condition');
  const [status, setStatus] = useState<MachineItem['status']>('Operational');
  const [assignedOperator, setAssignedOperator] = useState<string>('David (Lead Driver)');
  const [currentUsageMetric, setCurrentUsageMetric] = useState<string>('0 Hours');
  const [fuelOrPowerType, setFuelOrPowerType] = useState<MachineItem['fuelOrPowerType']>('Diesel');
  const [purchaseCostKes, setPurchaseCostKes] = useState<number | ''>('');
  const [nextServiceDueDate, setNextServiceDueDate] = useState<string>(offsetIsoDate(90));
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (machineToEdit) {
      setName(machineToEdit.name);
      setRegNoOrSerial(machineToEdit.regNoOrSerial);
      setCategory(machineToEdit.category);
      setModelOrSpecs(machineToEdit.modelOrSpecs);
      setCondition(machineToEdit.condition);
      setStatus(machineToEdit.status);
      setAssignedOperator(machineToEdit.assignedOperator || 'Unassigned');
      setCurrentUsageMetric(machineToEdit.currentUsageMetric || '0');
      setFuelOrPowerType(machineToEdit.fuelOrPowerType);
      setPurchaseCostKes(machineToEdit.purchaseCostKes || '');
      setNextServiceDueDate(machineToEdit.nextServiceDueDate || offsetIsoDate(90));
      setNotes(machineToEdit.notes || '');
    } else {
      setName('');
      setRegNoOrSerial(`EQP-${Date.now().toString().slice(-4)}`);
      setCategory('Heavy Fleet & Vehicles');
      setModelOrSpecs('');
      setCondition('Good Working Condition');
      setStatus('Operational');
      setAssignedOperator(staffList[0]?.name || 'David');
      setCurrentUsageMetric('0 Hours');
      setFuelOrPowerType('Diesel');
      setPurchaseCostKes('');
      setNextServiceDueDate(offsetIsoDate(90));
      setNotes('');
    }
  }, [isOpen, machineToEdit, staffList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regNoOrSerial.trim()) return;

    const updated: MachineItem = {
      id: machineToEdit?.id || `mach-${Date.now()}`,
      name: name.trim(),
      regNoOrSerial: regNoOrSerial.trim(),
      category,
      modelOrSpecs: modelOrSpecs.trim() || 'Standard Commercial Agricultural Spec',
      condition,
      status,
      assignedOperator: assignedOperator.trim(),
      currentUsageMetric: currentUsageMetric.trim() || 'Active',
      fuelOrPowerType,
      purchaseCostKes: purchaseCostKes === '' ? undefined : Number(purchaseCostKes),
      lastServiceDate: machineToEdit?.lastServiceDate || toIsoDate(new Date()),
      nextServiceDueDate: nextServiceDueDate || offsetIsoDate(90),
      notes: notes.trim() || undefined
    };

    onSaveMachine(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="text-base font-black">
                {machineToEdit ? `Edit ${machineToEdit.name}` : 'Add New Equipment to Fleet Registry'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update equipment specifications, registration, operator, and condition rating.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left text-xs">
          
          {/* Name & Reg / Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Machine / Vehicle Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Track V8, Tractor, Chaffcutter"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Reg No. / Serial Tag *
              </label>
              <input
                type="text"
                required
                value={regNoOrSerial}
                onChange={(e) => setRegNoOrSerial(e.target.value)}
                placeholder="E.g. KDL 450V, TRAC-01, CC-02"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Category & Power Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Asset Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                <option value="Heavy Fleet & Vehicles">Heavy Fleet & Vehicles</option>
                <option value="Tractors & Field Implements">Tractors & Field Implements</option>
                <option value="Fodder & Feed Processing">Fodder & Feed Processing</option>
                <option value="Workshop & Power Tools">Workshop & Power Tools</option>
                <option value="Spraying & Water Utilities">Spraying & Water Utilities</option>
                <option value="Dairy & Processing Equipment">Dairy & Processing Equipment</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Power / Fuel Type
              </label>
              <select
                value={fuelOrPowerType}
                onChange={(e) => setFuelOrPowerType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                <option value="Diesel">Diesel Engine</option>
                <option value="Petrol">Petrol Engine</option>
                <option value="Electric (3-Phase)">Electric (3-Phase 415V)</option>
                <option value="Electric (Single Phase)">Electric (Single Phase 240V)</option>
                <option value="Battery / Solar">Lithium Battery / Solar</option>
                <option value="PTO-driven">Tractor PTO-driven</option>
                <option value="Manual">Manual / Mechanical</option>
              </select>
            </div>
          </div>

          {/* Model & Specs */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Model & Engine / Power Specifications
            </label>
            <input
              type="text"
              value={modelOrSpecs}
              onChange={(e) => setModelOrSpecs(e.target.value)}
              placeholder="E.g. Toyota Land Cruiser 4.5L Twin Turbo, 10HP Commercial Motor"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-medium"
            />
          </div>

          {/* Condition & Operating Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Mechanical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                <option value="Brand New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good Working Condition">Good Working Condition</option>
                <option value="Fair / Needs Attention">Fair / Needs Attention</option>
                <option value="Critical Repair / Breakdown">Critical / Breakdown</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Operating Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                <option value="Operational">Operational / Ready</option>
                <option value="In Use">In Active Field Operation</option>
                <option value="Under Maintenance">Under Maintenance in Workshop</option>
                <option value="Awaiting Spares">Awaiting Spare Parts</option>
                <option value="Standby">Standby / Seasonal Storage</option>
              </select>
            </div>
          </div>

          {/* Assigned Driver & Usage Metric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Assigned Operator / Custodian
              </label>
              <select
                value={assignedOperator}
                onChange={(e) => setAssignedOperator(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={`${st.name} (${st.role})`}>
                    {st.name} ({st.role})
                  </option>
                ))}
                <option value="General Workshop Crew">General Workshop Crew</option>
                <option value="Dr. Devin Omwenga">Dr. Devin Omwenga (Farm Manager)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Current Usage Metric (KM / Hours)
              </label>
              <input
                type="text"
                value={currentUsageMetric}
                onChange={(e) => setCurrentUsageMetric(e.target.value)}
                placeholder="E.g. 124,500 KM or 3,420 Hours"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Next Service Due Date */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Next Service Due Date
            </label>
            <input
              type="date"
              required
              value={nextServiceDueDate}
              onChange={(e) => setNextServiceDueDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold font-mono text-slate-900 cursor-pointer"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Notes & Maintenance Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Safety guard details, spare parts notes, garage contact..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{machineToEdit ? 'Save Machine Specifications' : 'Add Machine to Registry'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
