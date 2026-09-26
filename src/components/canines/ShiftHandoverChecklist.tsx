import React, { useState } from 'react';
import { CanineShiftHandoverRecord, StaffMember, DogProfile } from '../../types';
import { CheckSquare, Square, Plus, Trash2, UserCheck, Shield, Clock, FileCheck, CheckCircle2 } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface ShiftHandoverChecklistProps {
  staffList?: StaffMember[];
  dogs: DogProfile[];
}

const DEFAULT_HANDOVERS: CanineShiftHandoverRecord[] = [
  {
    id: 'ho-01',
    date: '2024-09-25',
    shift: 'Night to Day Handover',
    outgoingHandler: 'Officer Kevin O. (Lead K-9 Handler)',
    incomingHandler: 'Sgt. John Kimani',
    dogsInspected: ['Major', 'Rex', 'Shadow'],
    pawPadsClearOfThorns: true,
    coatTickSweepDone: true,
    waterRefreshed: true,
    kennelLocksInspected: true,
    gearInspected: true,
    perimeterFenceIntact: true,
    handoverNotes: 'Perimeter calm during night sweeps. Major inspected post-patrol, no thorn punctures. All water troughs refreshed.'
  },
  {
    id: 'ho-02',
    date: '2024-09-24',
    shift: 'Day to Night Handover',
    outgoingHandler: 'Sgt. John Kimani',
    incomingHandler: 'Officer Kevin O. (Lead K-9 Handler)',
    dogsInspected: ['Major', 'Simba', 'Shadow'],
    pawPadsClearOfThorns: true,
    coatTickSweepDone: true,
    waterRefreshed: true,
    kennelLocksInspected: true,
    gearInspected: true,
    perimeterFenceIntact: true,
    handoverNotes: 'Main gate sentry handed over cleanly. Dogs fed 850g rations at 17:30. Night floodlights tested and operational.'
  }
];

export function ShiftHandoverChecklist({ staffList = [], dogs }: ShiftHandoverChecklistProps) {
  const [handovers, setHandovers] = useState<CanineShiftHandoverRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_canine_handovers');
      return stored ? JSON.parse(stored) : DEFAULT_HANDOVERS;
    } catch {
      return DEFAULT_HANDOVERS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<CanineShiftHandoverRecord>>({
    date: toIsoDate(new Date()),
    shift: 'Night to Day Handover',
    outgoingHandler: staffList[0]?.name || 'Officer Kevin O.',
    incomingHandler: staffList[1]?.name || 'Sgt. John Kimani',
    dogsInspected: dogs.slice(0, 3).map(d => d.name),
    pawPadsClearOfThorns: true,
    coatTickSweepDone: true,
    waterRefreshed: true,
    kennelLocksInspected: true,
    gearInspected: true,
    perimeterFenceIntact: true,
    handoverNotes: ''
  });

  const saveHandovers = (newHandovers: CanineShiftHandoverRecord[]) => {
    setHandovers(newHandovers);
    localStorage.setItem('jr_farm_canine_handovers', JSON.stringify(newHandovers));
  };

  const handleSaveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CanineShiftHandoverRecord = {
      ...form,
      id: `ho-${Date.now().toString().slice(-4)}`
    } as CanineShiftHandoverRecord;

    saveHandovers([newEntry, ...handovers]);
    setShowModal(false);
  };

  const handleDeleteHandover = (id: string) => {
    if (window.confirm('Delete this shift handover record?')) {
      saveHandovers(handovers.filter(h => h.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <h3 className="text-sm font-black text-gray-900">Guard Handler Shift Handover & Physical Inspection Protocol</h3>
          <p className="text-xs text-gray-500">
            Mandatory checkpoint protocol: Thorn & paw examination, tick sweeps, hydration, gear, and double kennel locking.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              date: toIsoDate(new Date()),
              shift: 'Night to Day Handover',
              outgoingHandler: staffList[0]?.name || 'Officer Kevin O.',
              incomingHandler: staffList[1]?.name || 'Sgt. John Kimani',
              dogsInspected: dogs.slice(0, 3).map(d => d.name),
              pawPadsClearOfThorns: true,
              coatTickSweepDone: true,
              waterRefreshed: true,
              kennelLocksInspected: true,
              gearInspected: true,
              perimeterFenceIntact: true,
              handoverNotes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Execute Shift Handover</span>
        </button>
      </div>

      {/* Handover Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {handovers.map(ho => (
          <div key={ho.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">{ho.date}</span>
                <h4 className="text-base font-black text-gray-900">{ho.shift}</h4>
              </div>
              <button
                onClick={() => handleDeleteHandover(ho.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Handlers Box */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Outgoing Handler:</span>
                <span className="font-bold text-gray-800">{ho.outgoingHandler}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Incoming Handler:</span>
                <span className="font-bold text-emerald-800">{ho.incomingHandler}</span>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Physical Checkpoints:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span>Paw Pads (No Thorns/Cuts)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span>Coat Tick Sweep Done</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span>Water Bowls Refreshed</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span>Kennel Locks Secured</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span>Tactical Gear Checked</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span>Perimeter Fence Intact</span>
                </div>
              </div>
            </div>

            {ho.handoverNotes && (
              <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                "{ho.handoverNotes}"
              </p>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Canines: {ho.dogsInspected.join(', ')}</span>
              <span className="font-bold text-emerald-700">Verified & Signed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-gray-900">Execute K-9 Shift Handover & Inspection</h3>

            <form onSubmit={handleSaveHandover} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Shift Transition *</label>
                  <select
                    value={form.shift}
                    onChange={e => setForm(prev => ({ ...prev, shift: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Night to Day Handover">Night to Day Handover</option>
                    <option value="Day to Night Handover">Day to Night Handover</option>
                    <option value="Midday Sweep Handover">Midday Sweep Handover</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Outgoing Handler *</label>
                  <input
                    type="text"
                    required
                    value={form.outgoingHandler}
                    onChange={e => setForm(prev => ({ ...prev, outgoingHandler: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Incoming Handler *</label>
                  <input
                    type="text"
                    required
                    value={form.incomingHandler}
                    onChange={e => setForm(prev => ({ ...prev, incomingHandler: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Checkpoint Checklist */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-gray-900 block text-[11px] uppercase">
                  Mandatory Verification Checklist:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.pawPadsClearOfThorns}
                      onChange={e => setForm(prev => ({ ...prev, pawPadsClearOfThorns: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Paw pads clear (no acacia thorns/cuts)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.coatTickSweepDone}
                      onChange={e => setForm(prev => ({ ...prev, coatTickSweepDone: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Coat tick & burr sweep done</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.waterRefreshed}
                      onChange={e => setForm(prev => ({ ...prev, waterRefreshed: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Water buckets cleaned & refreshed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.kennelLocksInspected}
                      onChange={e => setForm(prev => ({ ...prev, kennelLocksInspected: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Double kennel gate locks secure</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.gearInspected}
                      onChange={e => setForm(prev => ({ ...prev, gearInspected: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Tactical vests, leashes & torches intact</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.perimeterFenceIntact}
                      onChange={e => setForm(prev => ({ ...prev, perimeterFenceIntact: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span>Electric perimeter fence confirmed live</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Handover Notes / Observations</label>
                <textarea
                  rows={2}
                  placeholder="Notes on canine energy, intruder sightings, sector anomalies..."
                  value={form.handoverNotes}
                  onChange={e => setForm(prev => ({ ...prev, handoverNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Shift Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
