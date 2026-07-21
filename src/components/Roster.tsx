import React, { useState } from 'react';
import { StaffMember, StaffOffRecord } from '../types';
import { Users, UserPlus, Phone, Briefcase, Clock, Activity, Power, Trash2, Search, Filter, Calendar, Bell, Plus, ShieldAlert, CheckSquare, CalendarDays, ClipboardList, Printer, Download } from 'lucide-react';

interface RosterProps {
  staffList: StaffMember[];
  onUpdateStatus: (id: string, status: 'Present' | 'Off' | 'On Leave') => void;
  onAddStaff: (member: Omit<StaffMember, 'id'>) => void;
  onDeleteStaff: (id: string) => void;
  onEditStaff?: (id: string, updated: StaffMember) => void;
  staffOffRecords: StaffOffRecord[];
  onAddOffRecord: (rec: Omit<StaffOffRecord, 'id'>) => void;
  onDeleteOffRecord: (id: string) => void;
  onUpdateOffRecordStatus: (id: string, status: 'Approved' | 'Pending' | 'Completed') => void;
  onEditStaffOffRecord?: (id: string, updated: StaffOffRecord) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
  onAddTransaction?: (transaction: any) => void;
}
 
export function Roster({
  staffList = [],
  onUpdateStatus,
  onAddStaff,
  onDeleteStaff,
  onEditStaff,
  staffOffRecords = [],
  onAddOffRecord,
  onDeleteOffRecord,
  onUpdateOffRecordStatus,
  onEditStaffOffRecord,
  onTriggerSectionReport,
  onAddTransaction
}: RosterProps) {
  // Navigation tabs of roster page
  const [rosterSubTab, setRosterSubTab] = useState<'roster' | 'leaves' | 'attendance' | 'wages'>('roster');

  // New Editing State variables
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingStaffOffRecord, setEditingStaffOffRecord] = useState<StaffOffRecord | null>(null);

  // New staff registration form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [unit, setUnit] = useState<'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('Dairy');
  const [phone, setPhone] = useState('');
  const [shiftMorning, setShiftMorning] = useState('');
  const [shiftAfternoon, setShiftAfternoon] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New off/leave scheduler form states
  const [offStaffId, setOffStaffId] = useState('');
  const [offType, setOffType] = useState<'Day Off' | 'Annual Leave' | 'Sick Leave' | 'Compassionate Leave'>('Day Off');
  const [offStart, setOffStart] = useState(new Date().toISOString().split('T')[0]);
  const [offEnd, setOffEnd] = useState(new Date().toISOString().split('T')[0]);
  const [offNotes, setOffNotes] = useState('');
  const [offStatus, setOffStatus] = useState<'Approved' | 'Pending' | 'Completed'>('Approved');
  const [showOffForm, setShowOffForm] = useState(false);

  // Search & Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('all');

  // Submit handler for registering new operator
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

  // Submit handler for planning off-duty / leave logs
  const handleOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaffId = offStaffId || staffList[0]?.id;
    if (!targetStaffId || !offStart || !offEnd) return;
    const sMember = staffList.find((s) => s.id === targetStaffId);
    if (!sMember) return;

    onAddOffRecord({
      staffId: targetStaffId,
      staffName: sMember.name,
      type: offType,
      startDate: offStart,
      endDate: offEnd,
      notes: offNotes.trim() || 'Roster rest scheduling',
      status: offStatus
    });

    setOffStart(new Date().toISOString().split('T')[0]);
    setOffEnd(new Date().toISOString().split('T')[0]);
    setOffNotes('');
    setShowOffForm(false);
  };

  const statusColors = {
    Present: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Off: 'bg-rose-100 text-rose-800 border-rose-200',
    'On Leave': 'bg-amber-100 text-amber-800 border-amber-200'
  };

  const offTypeColors = {
    'Day Off': 'bg-sky-100 text-sky-800 border-sky-300',
    'Annual Leave': 'bg-violet-100 text-violet-800 border-violet-300',
    'Sick Leave': 'bg-red-105 bg-rose-100 text-rose-800 border-rose-300',
    'Compassionate Leave': 'bg-amber-100 text-amber-800 border-amber-300'
  };

  const recordStatusColors = {
    Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
    Completed: 'bg-slate-800/60 text-white border-white/20'
  };

  // Group counts
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter(s => s.status === 'Present').length;
  const offTodayCount = staffList.filter(s => s.status === 'Off').length;
  const leaveTodayCount = staffList.filter(s => s.status === 'On Leave').length;

  // Helper to generate initials
  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const attendancePercentage = totalStaffCount === 0 ? 0 : Math.round((activeStaffCount / totalStaffCount) * 100);

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Roster overview banner */}
      <div className="farm-shell-panel flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-white/70 rounded-[1.6rem] shadow-sm gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60"></div>
        <div className="flex items-center gap-5 z-10 w-full md:w-auto">
          <div className="p-3.5 bg-gradient-to-br from-emerald-700 to-emerald-950 text-white rounded-2xl shadow-lg shadow-emerald-900/20">
            <Users size={26} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1.5">Workforce & Duty Scheduler</h4>
            
            {/* Visual Progress Bar */}
            <div className="w-full max-w-[280px] h-2 bg-slate-800/60 rounded-full mb-2 overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full" 
                style={{ width: `${attendancePercentage}%` }}
              ></div>
              <div 
                className="h-full bg-rose-400 transition-all duration-1000 ease-out"
                style={{ width: `${100 - attendancePercentage}%` }}
              ></div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold items-center uppercase tracking-wider">
              <span>Total: <strong className="text-white text-xs">{totalStaffCount}</strong></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-emerald-700">Present: <strong className="text-emerald-900 text-xs">{activeStaffCount}</strong></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-rose-600">Off/Leave: <strong className="text-rose-800 text-xs">{offTodayCount + leaveTodayCount}</strong></span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {onTriggerSectionReport && (
            <button
              onClick={() => onTriggerSectionReport('staff')}
              type="button"
              className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs uppercase transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
              title="Download Staff & Leaves PDF Report"
            >
              <Download size={14} />
              Download PDF Report
            </button>
          )}
          {rosterSubTab === 'roster' ? (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-950 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-emerald-850 active:scale-95 transition-all flex items-center gap-2 m-0 cursor-pointer"
            >
              <UserPlus size={14} />
              {showAddForm ? 'Hide Form' : 'Register Operator'}
            </button>
          ) : (
            <button
              onClick={() => {
                setShowOffForm(!showOffForm);
                if (staffList.length > 0 && !offStaffId) {
                  setOffStaffId(staffList[0].id);
                }
              }}
              className="bg-indigo-900 text-white font-black text-xs uppercase px-5 py-3 rounded-xl hover:bg-indigo-850 active:scale-95 transition-all flex items-center gap-2 m-0 cursor-pointer"
            >
              <CalendarDays size={14} />
              {showOffForm ? 'Hide Form' : 'Schedule Off/Leave'}
            </button>
          )}
        </div>
      </div>

      {/* Modern Sub-Tab Switcher Component */}
      <div className="flex border-b border-white/15 bg-slate-900/40 backdrop-blur-md p-2 pb-0 rounded-2xl shadow-xs">
        <button
          onClick={() => setRosterSubTab('roster')}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all m-0 cursor-pointer ${
            rosterSubTab === 'roster'
              ? 'border-emerald-850 text-emerald-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-500'
          }`}
        >
          Workforce Directory
        </button>
        <button
          onClick={() => setRosterSubTab('leaves')}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all m-0 flex items-center gap-2 cursor-pointer ${
            rosterSubTab === 'leaves'
              ? 'border-indigo-850 text-indigo-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-500'
          }`}
        >
          Leave & Off-Duty Scheduler
          <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full font-black">
            {staffOffRecords.length}
          </span>
        </button>
        <button
          onClick={() => setRosterSubTab('attendance')}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all m-0 cursor-pointer ${
            rosterSubTab === 'attendance'
              ? 'border-sky-800 text-sky-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-500'
          }`}
        >
          Daily Attendance
        </button>
        <button
          onClick={() => setRosterSubTab('wages')}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all m-0 cursor-pointer ${
            rosterSubTab === 'wages'
              ? 'border-amber-600 text-amber-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-500'
          }`}
        >
          Wages & Advances
        </button>
      </div>

      {/* TAB 1: WORKFORCE DIRECTORY DIRECT VIEW */}
      {rosterSubTab === 'roster' && (
        <div className="space-y-8">
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/15 shadow-lg space-y-6">
              <div className="border-b border-white/10 pb-3">
                <h5 className="text-xs font-black text-white uppercase tracking-widest">Operator Registration Details</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Mosoti Ogomba"
                    className="text-xs border border-white/15 rounded-lg p-3 w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Role / Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="E.g. Senior Herdsman"
                    className="text-xs border border-white/15 rounded-lg p-3 w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Staff Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900/40 backdrop-blur-md"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Horti">Horti</option>
                    <option value="Fields">Fields</option>
                    <option value="Security">Security</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Contact Phone (+254...)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g. +254 712 345 678"
                    className="text-xs border border-white/15 rounded-lg p-3 w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Shift Duty: Morning</label>
                  <input
                    type="text"
                    value={shiftMorning}
                    onChange={(e) => setShiftMorning(e.target.value)}
                    placeholder="E.g. Milking & Calf Care"
                    className="text-xs border border-white/15 rounded-lg p-3 w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Shift Duty: Afternoon</label>
                  <input
                    type="text"
                    value={shiftAfternoon}
                    onChange={(e) => setShiftAfternoon(e.target.value)}
                    placeholder="E.g. TMR feed mixing"
                    className="text-xs border border-white/15 rounded-lg p-3 w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-150 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-3 border border-white/15 rounded-lg text-xs font-bold text-slate-500 m-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-950 text-white rounded-lg text-xs font-black uppercase m-0 cursor-pointer"
                >
                  Save Officer
                </button>
              </div>
            </form>
          )}

          {/* Modern Search & Filters Panel */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/15 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-white/15 rounded-xl pl-9 pr-4 py-2.5 bg-slate-900/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-700/10 text-slate-200 font-medium"
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
                      : 'bg-slate-900/40 backdrop-blur-md text-slate-500 border-white/15 hover:bg-slate-800/60'
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
                const safeName = st.name || '';
                const safeRole = st.role || '';
                const matchSearch =
                  safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  safeRole.toLowerCase().includes(searchTerm.toLowerCase());
                const matchUnit = unitFilter === 'all' || st.unit === unitFilter;
                return matchSearch && matchUnit;
              })
              .map((st) => (
                <div
                  key={st.id}
                  className={`bg-slate-900/40 backdrop-blur-md border rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    st.status === 'Off' ? 'border-dashed border-rose-300 opacity-90' : 
                    st.status === 'On Leave' ? 'border-amber-200 opacity-95' :
                    'border-white/10 hover:border-emerald-200'
                  }`}
                >
                  <div className="p-6 border-b border-slate-50 relative group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shadow-inner shrink-0 ${
                          st.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          st.status === 'Off' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {getInitials(st.name)}
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest bg-slate-800/60 text-slate-500 px-2 py-0.5 rounded font-black max-w-[120px] truncate block text-center mb-1 w-max">
                            {st.unit} Unit
                          </span>
                          <h5 className="text-sm font-black text-white leading-tight group-hover:text-emerald-700 transition-colors">{st.name}</h5>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">{st.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Quick Status Toggles */}
                        <div className="flex bg-slate-800/60 rounded-lg p-0.5 shadow-inner">
                          <button
                            onClick={() => onUpdateStatus(st.id, 'Present')}
                            className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all m-0 cursor-pointer ${
                              st.status === 'Present' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-800/80'
                            }`}
                          >
                            Pres
                          </button>
                          <button
                            onClick={() => onUpdateStatus(st.id, 'Off')}
                            className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all m-0 cursor-pointer ${
                              st.status === 'Off' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-800/80'
                            }`}
                          >
                            Off
                          </button>
                          <button
                            onClick={() => onUpdateStatus(st.id, 'On Leave')}
                            className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all m-0 cursor-pointer ${
                              st.status === 'On Leave' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-800/80'
                            }`}
                          >
                            Lv
                          </button>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditStaff && (
                            <button
                              onClick={() => setEditingStaff(st)}
                              className="text-slate-350 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-900/20 transition-colors m-0 cursor-pointer"
                              title="Edit Operator"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteStaff(st.id)}
                            className="text-slate-350 hover:text-red-600 p-1.5 rounded-md hover:bg-rose-900/20 transition-colors m-0 cursor-pointer"
                            title="Remove Operator"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-slate-800/40 flex items-center justify-center">
                          <Phone size={11} className="text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-500 font-mono">{st.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40/70 p-5 space-y-3.5 relative overflow-hidden group-hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <Clock size={12} className="text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Morning Shift</span>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">{st.shiftMorning}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock size={12} className="text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Afternoon Shift</span>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">{st.shiftAfternoon}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE & OFF-DUTY SCHEDULER VIEW */}
      {rosterSubTab === 'leaves' && (
        <div className="space-y-8">
          {/* New Leave/Off schedule form */}
          {showOffForm && (
            <form onSubmit={handleOffSubmit} className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/15 shadow-lg space-y-6">
              <div className="border-b border-indigo-100 pb-3 font-semibold">
                <h5 className="text-xs font-black text-indigo-950 uppercase tracking-widest">Book Staff Off-Duty / Leave Schedule</h5>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Define approved rest periods, annual leaves, and sick leaves for individual crew members.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Select Staff Member</label>
                  <select
                    value={offStaffId}
                    onChange={(e) => setOffStaffId(e.target.value)}
                    className="text-xs border border-slate-250 border-white/15 rounded-lg p-3 w-full bg-slate-900/40 backdrop-blur-md font-semibold"
                    required
                  >
                    <option value="" disabled>-- Pick Operator --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Type of Leave/Off</label>
                  <select
                    value={offType}
                    onChange={(e) => setOffType(e.target.value as any)}
                    className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900/40 backdrop-blur-md font-semibold"
                  >
                    <option value="Day Off">Day Off</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Authorization Status</label>
                  <select
                    value={offStatus}
                    onChange={(e) => setOffStatus(e.target.value as any)}
                    className="text-xs border border-white/15 rounded-lg p-3 w-full bg-slate-900/40 backdrop-blur-md font-semibold"
                  >
                    <option value="Approved">Approved / Active Choice</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Completed">Completed Cycle</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={offStart}
                    onChange={(e) => setOffStart(e.target.value)}
                    className="text-xs border border-white/15 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">End Date (Inclusive)</label>
                  <input
                    type="date"
                    required
                    value={offEnd}
                    onChange={(e) => setOffEnd(e.target.value)}
                    className="text-xs border border-white/15 rounded-lg p-3 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 block mb-2 uppercase">Log Details / Coverage Notes</label>
                  <input
                    type="text"
                    value={offNotes}
                    onChange={(e) => setOffNotes(e.target.value)}
                    placeholder="E.g. Approved standard weekly rest day."
                    className="text-xs border border-white/15 rounded-lg p-3 w-full font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-150 pt-5">
                <button
                  type="button"
                  onClick={() => setShowOffForm(false)}
                  className="px-5 py-3 border border-white/15 rounded-lg text-xs font-bold text-slate-500 m-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-900 text-white rounded-lg text-xs font-black uppercase m-0 cursor-pointer"
                >
                  Save Schedule Record
                </button>
              </div>
            </form>
          )}

          {/* Conflict Warnings Panel */}
          {(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const getRelativeDateString = (offset: number) => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              return d.toISOString().split('T')[0];
            };

            const warnings: string[] = [];
            const units = ['Dairy', 'Horti', 'Fields', 'Security'];

            for (let offset = 0; offset <= 7; offset++) {
              const checkDate = getRelativeDateString(offset);
              const formattedCheckDate = new Date(checkDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              units.forEach((u) => {
                const uStaffIds = staffList.filter((s) => s.unit === u).map((s) => s.id);
                const offsOnDate = staffOffRecords.filter(
                  (r) => r.status === 'Approved' && r.startDate <= checkDate && checkDate <= r.endDate && uStaffIds.includes(r.staffId)
                );

                if (offsOnDate.length > 1) {
                  const names = offsOnDate.map((r) => r.staffName).join(' & ');
                  warnings.push(`Unit Alert on ${formattedCheckDate}: Back-to-back off periods scheduled for ${names} inside the ${u} division. Potential labor deficit!`);
                }
              });
            }

            return (
              warnings.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-255 border-amber-200 p-5 rounded-2xl flex gap-3 h-max">
                  <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h6 className="text-xs font-black text-amber-900 uppercase tracking-wider">Detected Coverage Deficit Warnings</h6>
                    <div className="mt-2 space-y-1.5">
                      {warnings.map((w, idx) => (
                        <p key={idx} className="text-xs text-amber-800 font-medium leading-relaxed">• {w}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )
            );
          })()}

          {/* Leave/Off Schedules List Render */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-800/40/50">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-650 text-indigo-700" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest mb-0">Active Duty Schedule Registry</h5>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/40 backdrop-blur-md border px-3 py-1 rounded-full">{staffOffRecords.length} logs total</span>
            </div>

            {staffOffRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-450 font-bold italic text-xs">
                No custom scheduled leaves or days-off booked yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/40/20">
                      <th className="p-5">Operator Name</th>
                      <th className="p-5">Type of Leave/Off</th>
                      <th className="p-5">Duration Period (Start - End)</th>
                      <th className="p-5">Coverage & Details</th>
                      <th className="p-5">Authorization Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {staffOffRecords.map((r) => {
                      const daysCount = Math.round((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
                      return (
                        <tr key={r.id} className="hover:bg-slate-800/40/50 transition-colors">
                          <td className="p-5 font-bold text-white">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                r.status === 'Completed' ? 'bg-slate-800/60 text-slate-500' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {getInitials(r.staffName)}
                              </div>
                              <span className="truncate">{r.staffName}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-xs ${offTypeColors[r.type] || ''}`}>
                              {r.type}
                            </span>
                          </td>
                          <td className="p-5 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-200 bg-slate-800/40 px-2 py-1 rounded">{r.startDate}</span>
                              <span className="text-slate-300 text-[10px]">→</span>
                              <span className="font-extrabold text-slate-200 bg-slate-800/40 px-2 py-1 rounded">{r.endDate}</span>
                              <span className="ml-2 text-[10px] font-black text-indigo-900 bg-indigo-900/20 border border-indigo-100 rounded-full px-2 py-0.5">
                                {daysCount} {daysCount === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-500 font-medium italic max-w-xs truncate" title={r.notes}>
                            {r.notes || '—'}
                          </td>
                          <td className="p-5">
                            <div className="flex bg-slate-800/60 rounded-lg p-0.5 shadow-inner w-max">
                              <button
                                onClick={() => onUpdateOffRecordStatus(r.id, 'Approved')}
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all m-0 cursor-pointer ${
                                  r.status === 'Approved' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-800/80'
                                }`}
                              >
                                Apprv
                              </button>
                              <button
                                onClick={() => onUpdateOffRecordStatus(r.id, 'Pending')}
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all m-0 cursor-pointer ${
                                  r.status === 'Pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-800/80'
                                }`}
                              >
                                Pend
                              </button>
                              <button
                                onClick={() => onUpdateOffRecordStatus(r.id, 'Completed')}
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all m-0 cursor-pointer ${
                                  r.status === 'Completed' ? 'bg-slate-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-800/80'
                                }`}
                              >
                                Comp
                              </button>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-1.5 font-sans opacity-60 hover:opacity-100 transition-opacity">
                              {onEditStaffOffRecord && (
                                <button
                                  onClick={() => setEditingStaffOffRecord(r)}
                                  className="text-slate-300 hover:text-indigo-850 p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors inline-block m-0 cursor-pointer"
                                  title="Edit record"
                                >
                                  <CalendarDays size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteOffRecord(r.id)}
                                className="text-slate-300 hover:text-red-700 p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors inline-block m-0 cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Operator Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl w-full max-w-md shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-black uppercase text-white">Edit Operator Registry</h3>
              <button onClick={() => setEditingStaff(null)} className="text-slate-500 hover:text-slate-500 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Operator Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Role Type</label>
                  <input
                    type="text"
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Primary Unit</label>
                  <select
                    value={editingStaff.unit}
                    onChange={(e) => setEditingStaff({ ...editingStaff, unit: e.target.value as any })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Horti">Horticultural</option>
                    <option value="Fields">Fields & Agronomy</option>
                    <option value="Security">Security Patrol</option>
                    <option value="General">General Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">AM Shift Allocation</label>
                  <input
                    type="text"
                    value={editingStaff.shiftMorning}
                    onChange={(e) => setEditingStaff({ ...editingStaff, shiftMorning: e.target.value })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">PM Shift Allocation</label>
                  <input
                    type="text"
                    value={editingStaff.shiftAfternoon}
                    onChange={(e) => setEditingStaff({ ...editingStaff, shiftAfternoon: e.target.value })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-800/40 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditStaff) {
                    onEditStaff(editingStaff.id, editingStaff);
                  }
                  setEditingStaff(null);
                }}
                className="px-5 py-2.5 bg-emerald-950 text-white rounded-lg text-xs font-black uppercase hover:bg-emerald-900 m-0 shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Leave / Duty Schedule Modal */}
      {editingStaffOffRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl w-full max-w-md shadow-2xl p-6 border border-white/10 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-black uppercase text-white">Edit Schedule Record</h3>
              <button onClick={() => setEditingStaffOffRecord(null)} className="text-slate-500 hover:text-slate-500 font-bold m-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Personnel</label>
                <select
                  value={editingStaffOffRecord.staffId}
                  onChange={(e) => {
                    const sel = staffList.find(s => s.id === e.target.value);
                    setEditingStaffOffRecord({
                      ...editingStaffOffRecord,
                      staffId: e.target.value,
                      staffName: sel ? sel.name : editingStaffOffRecord.staffName
                    });
                  }}
                  className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                >
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Interval Type</label>
                  <select
                    value={editingStaffOffRecord.type}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, type: e.target.value as any })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    <option value="Day Off">Day Off</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Current Status</label>
                  <select
                    value={editingStaffOffRecord.status}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, status: e.target.value as any })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingStaffOffRecord.startDate}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, startDate: e.target.value })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingStaffOffRecord.endDate}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, endDate: e.target.value })}
                    className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Internal Reference Notes</label>
                <textarea
                  value={editingStaffOffRecord.notes}
                  onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, notes: e.target.value })}
                  rows={2}
                  className="border border-white/15 rounded-lg p-3 w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                onClick={() => setEditingStaffOffRecord(null)}
                className="px-4 py-2 border border-white/15 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-800/40 m-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditStaffOffRecord) {
                    onEditStaffOffRecord(editingStaffOffRecord.id, editingStaffOffRecord);
                  }
                  setEditingStaffOffRecord(null);
                }}
                className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* TAB 3: DAILY ATTENDANCE GRID */}
      {rosterSubTab === 'attendance' && (
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-sm text-left space-y-6">
          <div>
            <h4 className="text-sm font-black uppercase text-white tracking-wide">Daily Attendance Grid Sheet</h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Directly toggle daily presence statuses for the farm workforce.</p>
          </div>
          <div className="border border-white/10 rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-slate-800/40 border-b border-white/10">
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Role / Unit</th>
                  <th className="p-3">Shift Plan</th>
                  <th className="p-3 text-center">Status Action Toggle</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((worker) => (
                  <tr key={worker.id} className="border-b border-white/10 hover:bg-slate-800/40/50">
                    <td className="p-3 font-bold text-slate-200">{worker.name}</td>
                    <td className="p-3 text-slate-500">
                      <span className="text-slate-200 font-bold">{worker.role}</span> • {worker.unit}
                    </td>
                    <td className="p-3 font-mono text-[10.5px]">
                      AM: {worker.shiftMorning} | PM: {worker.shiftAfternoon}
                    </td>
                    <td className="p-3 flex justify-center gap-1.5">
                      {[
                        { label: 'Present', color: 'emerald', bg: 'bg-emerald-900/20 text-emerald-800 border-emerald-200' },
                        { label: 'Off', color: 'rose', bg: 'bg-rose-900/20 text-rose-800 border-rose-200' },
                        { label: 'On Leave', color: 'indigo', bg: 'bg-indigo-900/20 text-indigo-800 border-indigo-200' }
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={() => onUpdateStatus(worker.id, btn.label as any)}
                          className={`px-3 py-1.5 border rounded-lg text-2xs uppercase tracking-wider font-black transition-all m-0 cursor-pointer ${
                            worker.status === btn.label
                              ? `${btn.bg} shadow-xs ring-1 ring-${btn.color}-500/10`
                              : 'bg-slate-900/40 backdrop-blur-md text-slate-500 border-white/15 hover:bg-slate-800/40 hover:text-slate-500'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
 
      {/* TAB 4: WAGES & PAYROLL PAYMENTS */}
      {rosterSubTab === 'wages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Wages logger Form */}
          <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-sm lg:col-span-5 space-y-6 self-start">
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-wide">Record Wage Advance or Payment</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Publish paycheck advances or wage settlements directly to the cash flow ledger.</p>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const workerId = fd.get('workerId') as string;
                const payType = fd.get('payType') as string;
                const amt = parseFloat(fd.get('amount') as string) || 0;
                const desc = fd.get('desc') as string;
                const dateVal = fd.get('payDate') as string;
 
                if (!workerId || amt <= 0) {
                  alert('Please select an employee and enter a positive payment amount.');
                  return;
                }
 
                const s = staffList.find(w => w.id === workerId);
                if (!s) return;
 
                if (onAddTransaction) {
                  onAddTransaction({
                    id: `WAGE-${Date.now()}`,
                    type: 'expense',
                    amount: amt,
                    category: 'Wages',
                    description: `${payType}: Paid to ${s.name} (${s.role}) - ${desc}`,
                    date: dateVal || new Date().toISOString().split('T')[0]
                  });
                  alert(`✓ Registered wage expense of KES ${amt} to the financials database successfully!`);
                  form.reset();
                } else {
                  alert('Ledger syncer offline. Transaction could not be auto-published.');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Select Employee</label>
                <select name="workerId" className="w-full bg-slate-800/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold">
                  {staffList.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Payment Type</label>
                  <select name="payType" className="w-full bg-slate-800/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold">
                    <option value="Wage Advance">Wage Advance</option>
                    <option value="Salary Settlement">Salary Settlement</option>
                    <option value="Performance Bonus">Performance Bonus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Amount (Ksh)</label>
                  <input type="number" name="amount" placeholder="e.g. 5000" className="w-full bg-slate-800/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold" required />
                </div>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Payment Description</label>
                <input type="text" name="desc" placeholder="e.g. Week 2 pluckers advance" className="w-full bg-slate-800/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold" required />
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Date of Payment</label>
                <input type="date" name="payDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-800/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold" required />
              </div>
 
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10"
              >
                Log Wage Payment to Ledger
              </button>
            </form>
          </div>
 
          {/* Wages ledger brief view */}
          <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-sm lg:col-span-7 space-y-6">
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-wide">Wage Accounting Ledger</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Live review of labor costs registered on this estate.</p>
            </div>
            
            <div className="border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="bg-slate-800/40 border-b border-white/10">
                    <th className="p-3">Date</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Details</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let wageTx: any[] = [];
                    try {
                      const saved = localStorage.getItem('jr_farm_financials');
                      if (saved) {
                        wageTx = JSON.parse(saved).filter((f: any) => f.category === 'Wages' || f.description.toLowerCase().includes('wage') || f.description.toLowerCase().includes('paid to'));
                      }
                    } catch (e) {
                      console.error(e);
                    }
                    if (wageTx.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500 italic">No wage transactions found. Log one to begin!</td>
                        </tr>
                      );
                    }
                    return wageTx.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/10 hover:bg-slate-800/40/50">
                        <td className="p-3 font-mono">{tx.date}</td>
                        <td className="p-3 font-bold text-emerald-900">{tx.id}</td>
                        <td className="p-3 text-slate-500 font-medium">{tx.description}</td>
                        <td className="p-3 text-right font-black text-rose-600 font-mono">Ksh {Number(tx.amount).toLocaleString()}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
