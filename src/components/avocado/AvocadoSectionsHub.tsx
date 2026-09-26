import React, { useState } from 'react';
import { AvocadoSectionNote, StaffMember } from '../../types';
import { AVOCADO_ORCHARD_SECTIONS } from './AvocadoDiseaseReference';
import {
  Trees,
  Edit3,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  ClipboardList,
  Save,
  Clock,
  Plus
} from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

interface AvocadoSectionsHubProps {
  sectionNotes: AvocadoSectionNote[];
  onUpdateSectionNote: (updated: AvocadoSectionNote) => void;
  staffList: StaffMember[];
}

export function AvocadoSectionsHub({
  sectionNotes,
  onUpdateSectionNote,
  staffList
}: AvocadoSectionsHubProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sectionNotes[0]?.id || 'sec-1');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form states
  const [editNote, setEditNote] = useState<string>('');
  const [editActionPlan, setEditActionPlan] = useState<string>('');
  const [editPhenology, setEditPhenology] = useState<AvocadoSectionNote['phenologicalStage']>('Fruit Growth / Enlargement');
  const [editScouting, setEditScouting] = useState<AvocadoSectionNote['scoutingStatus']>('Clean / Certified');
  const [editSoil, setEditSoil] = useState<AvocadoSectionNote['soilHealthStatus']>('Optimal');
  const [editSupervisor, setEditSupervisor] = useState<string>('Josephine');

  const activeSection = sectionNotes.find(s => s.id === selectedSectionId) || sectionNotes[0];

  const handleStartEdit = (sec: AvocadoSectionNote) => {
    setEditingId(sec.id);
    setEditNote(sec.notes);
    setEditActionPlan(sec.actionPlan);
    setEditPhenology(sec.phenologicalStage);
    setEditScouting(sec.scoutingStatus);
    setEditSoil(sec.soilHealthStatus);
    setEditSupervisor(sec.assignedSupervisor);
  };

  const handleSaveEdit = (sec: AvocadoSectionNote) => {
    const updated: AvocadoSectionNote = {
      ...sec,
      notes: editNote.trim(),
      actionPlan: editActionPlan.trim(),
      phenologicalStage: editPhenology,
      scoutingStatus: editScouting,
      soilHealthStatus: editSoil,
      assignedSupervisor: editSupervisor,
      lastInspectionDate: toIsoDate(new Date()),
      updatedAt: new Date().toISOString()
    };
    onUpdateSectionNote(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">

      {/* Intro Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl">
            <Trees size={24} className="text-emerald-800" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Orchard Sections & Block Agronomy Ledger
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated field observations, phenological growth stages, pest scouting logs, and action plans for all avocado sections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-mono">
            {sectionNotes.length} Blocks Monitored
          </span>
        </div>
      </div>

      {/* Grid: Section Cards (12 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sectionNotes.map((sec) => {
          const isEditing = editingId === sec.id;
          const config = AVOCADO_ORCHARD_SECTIONS.find(c => c.name.toLowerCase().includes(sec.sectionName.toLowerCase()) || sec.sectionName.toLowerCase().includes(c.code.toLowerCase()));

          return (
            <div
              key={sec.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs ${
                sec.scoutingStatus.includes('Warning')
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {config?.code || 'BLK'}
                    </span>
                    <h5 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                      {sec.sectionName}
                    </h5>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(sec)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Section Notes"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}
                </div>

                {/* Subtitle / Variety / Count */}
                <div className="text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-800">{sec.variety}</span>
                  <span className="font-bold text-emerald-900 font-mono">
                    {sec.treeCount > 0 ? `${sec.treeCount} Trees` : 'Packhouse'}
                  </span>
                </div>
              </div>

              {/* Read Mode vs Edit Mode */}
              {!isEditing ? (
                <div className="space-y-3 flex-1 text-xs">
                  
                  {/* Status Pills */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold text-[9px] uppercase">Stage</span>
                      <strong className="text-slate-800 font-bold truncate block">{sec.phenologicalStage}</strong>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      sec.scoutingStatus.includes('Clean')
                        ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                        : 'bg-amber-50/70 border-amber-100 text-amber-900'
                    }`}>
                      <span className="text-[9px] uppercase font-semibold block">Scouting</span>
                      <strong className="font-bold truncate block">{sec.scoutingStatus}</strong>
                    </div>
                  </div>

                  {/* Notes Block */}
                  <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                      <ClipboardList size={12} />
                      Field Notes & Observations
                    </span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {sec.notes}
                    </p>
                  </div>

                  {/* Action Plan */}
                  <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-100/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <Clock size={12} />
                      Scheduled Action Plan
                    </span>
                    <p className="text-amber-950 font-medium leading-relaxed text-[11px]">
                      {sec.actionPlan}
                    </p>
                  </div>

                  {/* Supervisor & Last Inspection */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Supervisor: <strong className="text-slate-800">{sec.assignedSupervisor}</strong></span>
                    <span className="font-mono">Inspected: {sec.lastInspectionDate}</span>
                  </div>

                </div>
              ) : (
                /* Edit Form Inline */
                <div className="space-y-3 flex-1 text-xs">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Phenological Stage</label>
                    <select
                      value={editPhenology}
                      onChange={(e) => setEditPhenology(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                    >
                      <option value="Flowering">Flowering</option>
                      <option value="Fruit Set">Fruit Set</option>
                      <option value="Fruit Growth / Enlargement">Fruit Growth / Enlargement</option>
                      <option value="Maturity & Dry Matter Testing">Maturity & Dry Matter Testing</option>
                      <option value="Harvesting">Harvesting</option>
                      <option value="Post-Harvest Dormancy">Post-Harvest Dormancy</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Scouting & Pest Status</label>
                    <select
                      value={editScouting}
                      onChange={(e) => setEditScouting(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                    >
                      <option value="Clean / Certified">Clean / Certified Safe</option>
                      <option value="Minor Thrips Spotted">Minor Thrips Spotted</option>
                      <option value="Pheromone Trap Warning">Pheromone Trap Warning</option>
                      <option value="Phytophthora Monitored">Phytophthora Monitored</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Field Observations / Note</label>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows={3}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-900"
                      placeholder="Enter canopy condition, leaf flush, tree vigor, weed status..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Immediate Action Plan</label>
                    <textarea
                      value={editActionPlan}
                      onChange={(e) => setEditActionPlan(e.target.value)}
                      rows={2}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-900"
                      placeholder="What should be done next in this block..."
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(sec)}
                      className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
