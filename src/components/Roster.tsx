/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StaffMember } from '../types';
import { Users, UserPlus, Phone, Briefcase, Clock, Activity, Power, Trash2, Search, Filter } from 'lucide-react';

interface RosterProps {
  staffList: StaffMember[];
  onUpdateStatus: (id: string, status: 'Present' | 'Off' | 'On Leave') => void;
  onAddStaff: (member: Omit<StaffMember, 'id'>) => void;
  onDeleteStaff: (id: string) => void;
}

export function Roster({ staffList, onUpdateStatus, onAddStaff, onDeleteStaff }: RosterProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [unit, setUnit] = useState<'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('Dairy');
  const [phone, setPhone] = useState('');
  const [shiftMorning, setShiftMorning] = useState('');
  const [shiftAfternoon, setShiftAfternoon] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !phone.trim()) return;
    onAddStaff({
      name: name.trim(),
      role: role.trim(),
      unit,
      phone: phone.trim(),
      shiftMorning: shiftMorning.trim() || 'General morning duties',
      shiftAfternoon: shiftAfternoon.trim() || 'General afternoon duties',
      status: 'Present'
    });
    setName('');
    setRole('');
    setPhone('');
    setShiftMorning('');
    setShiftAfternoon('');
    setShowAddForm(false);
  };

  const statusColors = {
    Present: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Off: 'bg-rose-100 text-rose-800 border-rose-200',
    'On Leave': 'bg-amber-100 text-amber-800 border-amber-200'
  };

  return (
    <div className="space-y-8">
      {/* Roster overview banner */}
      <div className="flex justify-between items-center bg-white p-6 border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-950 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Permanent Staff Timetable</h4>
            <p className="text-xs text-slate-400 font-medium">
              Current Farm Workforce • {staffList.filter((s) => s.status === 'Present').length} Active Officers
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-850 active:scale-95 transition-all flex items-center gap-2 m-0"
        >
          <UserPlus size={14} />
          {showAddForm ? 'Hide Form' : 'Register Operator'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-lg space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest">Operator Registration Details</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-400 block mb-2 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Mosoti Ogomba"
                className="text-xs border border-slate-300/80 rounded-lg p-3 w-full"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-400 block mb-2 uppercase">Role / Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="E.g. General Herdsman"
                className="text-xs border border-slate-300/80 rounded-lg p-3 w-full"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-400 block mb-2 uppercase">Staff Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="text-xs border border-slate-300/80 rounded-lg p-3 w-full bg-white"
              >
                <option value="Dairy">Dairy & Livestock</option>
                <option value="Horti">Horticulture (Tea/Avocado)</option>
                <option value="Fields">Fields & Crops</option>
                <option value="General">General / Estate Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-400 block mb-2 uppercase">Contact Phone (+254...)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="E.g. +254 712 345 678"
                className="text-xs border border-slate-300/80 rounded-lg p-3 w-full"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-400 block mb-2 uppercase">Shift Duty: Morning</label>
              <input
                type="text"
                value={shiftMorning}
                onChange={(e) => setShiftMorning(e.target.value)}
                placeholder="E.g. Milking & Calf Care"
                className="text-xs border border-slate-300/80 rounded-lg p-3 w-full"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-400 block mb-2 uppercase">Shift Duty: Afternoon</label>
              <input
                type="text"
                value={shiftAfternoon}
                onChange={(e) => setShiftAfternoon(e.target.value)}
                placeholder="E.g. TMR feed mixing"
                className="text-xs border border-slate-300/80 rounded-lg p-3 w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-150 pt-5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 m-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-950 text-white rounded-lg text-xs font-black uppercase m-0"
            >
              Save Officer
            </button>
          </div>
        </form>
      )}      {/* Modern Search & Filters Panel */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/10 text-slate-700 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Units' },
            { id: 'Dairy', label: 'Dairy' },
            { id: 'Horti', label: 'Horticulture' },
            { id: 'Fields', label: 'Fields' },
            { id: 'Security', label: 'Security' },
            { id: 'General', label: 'General' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setUnitFilter(btn.id as any)}
              className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all m-0 border cursor-pointer whitespace-nowrap ${
                unitFilter === btn.id
                  ? 'bg-emerald-950 text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList
          .filter((st) => {
            const matchSearch =
              st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              st.role.toLowerCase().includes(searchTerm.toLowerCase());
            const matchUnit = unitFilter === 'all' || st.unit === unitFilter;
            return matchSearch && matchUnit;
          })
          .map((st) => (
            <div
              key={st.id}
              className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                st.status === 'Off' ? 'border-dashed border-red-200' : 'border-slate-100'
              }`}
            >
              <div className="p-6 border-b border-slate-50 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black max-w-[80px] truncate block text-center">
                      {st.unit} Unit
                    </span>
                    <h5 className="text-sm font-black text-slate-800 mt-2">{st.name}</h5>
                    <p className="text-xs text-slate-400 font-bold">{st.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <select
                      value={st.status}
                      onChange={(e) => onUpdateStatus(st.id, e.target.value as any)}
                      className={`text-[10px] font-black uppercase px-2 py-1.5 border rounded-md focus:outline-none cursor-pointer ${
                        statusColors[st.status] || ''
                      }`}
                    >
                      <option value="Present">Present</option>
                      <option value="Off">Day Off</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                    
                    <button
                      onClick={() => onDeleteStaff(st.id)}
                      className="text-slate-300 hover:text-red-600 p-1 rounded transition-colors m-0 cursor-pointer"
                      title="Remove Operator"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-600 font-mono">{st.phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/70 p-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Clock size={12} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Morning Shift</span>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-normal">{st.shiftMorning}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock size={12} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Afternoon Shift</span>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-normal">{st.shiftAfternoon}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
