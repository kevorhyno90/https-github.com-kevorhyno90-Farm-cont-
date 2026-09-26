import React, { useState, useEffect } from 'react';
import { MachineItem, MachineServiceRecord, StaffMember } from '../../types';
import { Wrench, X, Calendar, DollarSign, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../../utils/dateHelper';

interface MachineryServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: MachineItem[];
  preSelectedMachineId?: string;
  serviceToEdit?: MachineServiceRecord | null;
  onSaveService: (record: MachineServiceRecord, syncToFinancials: boolean) => void;
  staffList: StaffMember[];
}

export function MachineryServiceModal({
  isOpen,
  onClose,
  machines,
  preSelectedMachineId,
  serviceToEdit,
  onSaveService,
  staffList
}: MachineryServiceModalProps) {
  const [machineId, setMachineId] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>(toIsoDate(new Date()));
  const [ticketRef, setTicketRef] = useState<string>('');
  const [serviceType, setServiceType] = useState<MachineServiceRecord['serviceType']>('Routine Scheduled Service');
  const [whatWasServiced, setWhatWasServiced] = useState<string>('');
  const [servicedBy, setServicedBy] = useState<string>('Internal Workshop - Mosoti');
  const [costKes, setCostKes] = useState<number | ''>(4500);
  const [sparePartsUsed, setSparePartsUsed] = useState<string>('');
  const [conditionAfterService, setConditionAfterService] = useState<MachineServiceRecord['conditionAfterService']>('Good Working Condition');
  const [nextServiceDate, setNextServiceDate] = useState<string>(offsetIsoDate(90));
  const [nextServiceKmOrHours, setNextServiceKmOrHours] = useState<string>('');
  const [remarksOrNotes, setRemarksOrNotes] = useState<string>('');
  const [syncToFinancials, setSyncToFinancials] = useState<boolean>(true);

  useEffect(() => {
    if (serviceToEdit) {
      setMachineId(serviceToEdit.machineId);
      setServiceDate(serviceToEdit.serviceDate);
      setTicketRef(serviceToEdit.serviceTicketRef);
      setServiceType(serviceToEdit.serviceType);
      setWhatWasServiced(serviceToEdit.whatWasServiced);
      setServicedBy(serviceToEdit.servicedBy);
      setCostKes(serviceToEdit.cost);
      setSparePartsUsed(serviceToEdit.sparePartsUsed || '');
      setConditionAfterService(serviceToEdit.conditionAfterService);
      setNextServiceDate(serviceToEdit.nextServiceDate);
      setNextServiceKmOrHours(serviceToEdit.nextServiceKmOrHours || '');
      setRemarksOrNotes(serviceToEdit.remarksOrNotes || '');
      setSyncToFinancials(false); // Don't duplicate expense on edit
    } else {
      const targetId = preSelectedMachineId || machines[0]?.id || '';
      setMachineId(targetId);
      setServiceDate(toIsoDate(new Date()));
      setTicketRef(`SRV-${Date.now().toString().slice(-4)}`);
      setServiceType('Routine Scheduled Service');
      setWhatWasServiced('Changed engine oil, replaced oil/fuel filters, greased all drive joints, inspected belts');
      setServicedBy('Internal Workshop - Mosoti');
      setCostKes(4500);
      setSparePartsUsed('1x Oil filter, 1x Fuel filter, 5L 15W-40 Synthetic Lubricant');
      setConditionAfterService('Excellent');
      setNextServiceDate(offsetIsoDate(90));
      setNextServiceKmOrHours('After 250 operating hours or 5,000 KM');
      setRemarksOrNotes('Machine tested under load; all pressure valves, bearings, and cutting edges calibrated.');
      setSyncToFinancials(true);
    }
  }, [isOpen, serviceToEdit, preSelectedMachineId, machines]);

  if (!isOpen) return null;

  const currentMachine = machines.find(m => m.id === machineId) || machines[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId || !serviceDate || !whatWasServiced.trim()) return;

    const newRecord: MachineServiceRecord = {
      id: serviceToEdit?.id || `srv-${Date.now()}`,
      machineId: currentMachine.id,
      machineName: currentMachine.name,
      regNoOrSerial: currentMachine.regNoOrSerial,
      serviceDate,
      serviceTicketRef: ticketRef.trim() || `SRV-${Date.now().toString().slice(-4)}`,
      serviceType,
      whatWasServiced: whatWasServiced.trim(),
      servicedBy: servicedBy.trim() || 'Internal Workshop',
      cost: costKes === '' ? 0 : Number(costKes),
      sparePartsUsed: sparePartsUsed.trim() || undefined,
      conditionAfterService,
      nextServiceDate,
      nextServiceKmOrHours: nextServiceKmOrHours.trim() || undefined,
      remarksOrNotes: remarksOrNotes.trim() || 'Service completed successfully.',
      postToFinances: syncToFinancials,
      status: 'Completed'
    };

    onSaveService(newRecord, syncToFinancials);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Wrench size={22} />
            </div>
            <div>
              <h3 className="text-base font-black">
                {serviceToEdit ? 'Edit Machinery Service Record' : 'Log Machinery Service & Maintenance'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Record what was serviced, cost, parts used, condition, and next service due date.
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
          
          {/* Machine Selection */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Select Machine / Equipment
            </label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 cursor-pointer"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.regNoOrSerial}) — {m.category} [{m.condition}]
                </option>
              ))}
            </select>
          </div>

          {/* Date, Ticket Ref & Service Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Date of Service
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold font-mono text-slate-900 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Ticket / Job Ref
              </label>
              <input
                type="text"
                required
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value)}
                placeholder="E.g. SRV-001"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                <option value="Routine Scheduled Service">Routine Scheduled Service</option>
                <option value="Oil & Filter Change">Oil & Filter Change</option>
                <option value="Major Engine Overhaul">Major Engine Overhaul</option>
                <option value="Blade / Tool Sharpening & Replacement">Blade / Disc Sharpening</option>
                <option value="Hydraulic & Transmission">Hydraulic & Transmission</option>
                <option value="Electrical & Battery">Electrical & Battery</option>
                <option value="Emergency Breakdown Repair">Breakdown Repair</option>
              </select>
            </div>
          </div>

          {/* What Was Serviced */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              What Was Serviced (Work Done Details) *
            </label>
            <textarea
              required
              rows={3}
              value={whatWasServiced}
              onChange={(e) => setWhatWasServiced(e.target.value)}
              placeholder="E.g. Engine oil replaced with 15W-40 synthetic, new oil filter, fuel filter changed, cutting blades balanced and sharpened, grease nipples packed..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
            />
          </div>

          {/* Cost & Serviced By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Cost of Service (KES)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={costKes}
                onChange={(e) => setCostKes(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="KES"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-black font-mono text-emerald-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Serviced By (Mechanic / Garage)
              </label>
              <input
                type="text"
                required
                value={servicedBy}
                onChange={(e) => setServicedBy(e.target.value)}
                placeholder="E.g. Mosoti (Lead Tech), Toyota Kenya Garage"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Spare Parts Used & Condition After Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Spare Parts & Lubricants Used
              </label>
              <input
                type="text"
                value={sparePartsUsed}
                onChange={(e) => setSparePartsUsed(e.target.value)}
                placeholder="E.g. 2x Filters, 10L Delo 400, 2x V-Belts"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Machine Condition After Service
              </label>
              <select
                value={conditionAfterService}
                onChange={(e) => setConditionAfterService(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 cursor-pointer"
              >
                <option value="Brand New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good Working Condition">Good Working Condition</option>
                <option value="Fair / Needs Attention">Fair / Needs Attention</option>
                <option value="Critical Repair / Breakdown">Critical / Needs Further Work</option>
              </select>
            </div>
          </div>

          {/* NEXT SERVICE SCHEDULE */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-700" />
                Next Service Due Date & Target Interval
              </label>
              <span className="text-[10px] text-amber-800 font-mono font-bold">
                Due: {nextServiceDate}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2 font-bold font-mono text-slate-900 cursor-pointer"
              />

              <input
                type="text"
                value={nextServiceKmOrHours}
                onChange={(e) => setNextServiceKmOrHours(e.target.value)}
                placeholder="E.g. At 135,000 KM or +250 Hours"
                className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2 font-bold text-slate-900"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] font-bold text-amber-800 self-center mr-1">Quick Interval:</span>
              {[
                { label: '+30 Days', days: 30 },
                { label: '+60 Days', days: 60 },
                { label: '+90 Days (Quarterly)', days: 90 },
                { label: '+180 Days (Half Year)', days: 180 },
                { label: '+1 Year', days: 365 }
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setNextServiceDate(offsetIsoDate(item.days))}
                  className="px-2 py-0.8 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks & Notes */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Remarks, Inspection Notes & Recommendations
            </label>
            <textarea
              rows={2}
              value={remarksOrNotes}
              onChange={(e) => setRemarksOrNotes(e.target.value)}
              placeholder="Sound test, vibration, oil pressure check, driver recommendations..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-900"
            />
          </div>

          {/* Sync to Financials Checkbox */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
              <input
                type="checkbox"
                checked={syncToFinancials}
                onChange={(e) => setSyncToFinancials(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span>Sync this cost (KES {Number(costKes || 0).toLocaleString()}) to Farm Financials as Expense</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Category: Machinery Maintenance</span>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{serviceToEdit ? 'Save Changes' : 'Record Service & Schedule Next Date'}</span>
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
