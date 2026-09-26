import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, StaffOffRecord } from '../types';
import {
  Users, UserPlus, Phone, Clock, Trash2, Search, Calendar, Plus,
  CalendarDays, Download, Edit2, DollarSign, Wallet, FileText,
  CheckCircle2, XCircle, AlertCircle, Building, UserCheck, MessageSquare,
  ChevronLeft, ChevronRight, Eye, LayoutGrid, Table, Printer, Shield,
  BadgeCheck, Sparkles, MapPin, CreditCard, User, AlertTriangle
} from 'lucide-react';
import { useFarmState } from '../context/FarmContext';
import { toIsoDate, offsetIsoDate } from '../utils/dateHelper';

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

type RosterSubTab = 'roster' | 'attendance' | 'leaves' | 'shifts' | 'wages';
type ViewMode = 'cards' | 'table';

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
  const { financials, setFinancials } = useFarmState();

  // Navigation sub-tabs
  const [rosterSubTab, setRosterSubTab] = useState<RosterSubTab>('roster');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Selected Employee Dossier Modal
  const [selectedStaffDossier, setSelectedStaffDossier] = useState<StaffMember | null>(null);

  // Payslip Modal state
  const [payslipStaff, setPayslipStaff] = useState<StaffMember | null>(null);
  const [payslipMonth, setPayslipMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Editing state variables
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingStaffOffRecord, setEditingStaffOffRecord] = useState<StaffOffRecord | null>(null);
  const [editingWageId, setEditingWageId] = useState<string | null>(null);
  const [editWageDesc, setEditWageDesc] = useState('');
  const [editWageAmount, setEditWageAmount] = useState('');

  // Show forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOffForm, setShowOffForm] = useState(false);

  // New staff registration form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formUnit, setFormUnit] = useState<'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('Dairy');
  const [formPhone, setFormPhone] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formStation, setFormStation] = useState('');
  const [formContractType, setFormContractType] = useState<'Permanent' | 'Contract' | 'Casual' | 'Intern'>('Permanent');
  const [formJoiningDate, setFormJoiningDate] = useState(() => toIsoDate(new Date()));
  const [formWageType, setFormWageType] = useState<'Monthly' | 'Daily' | 'Piece-rate'>('Monthly');
  const [formBaseSalary, setFormBaseSalary] = useState('');
  const [formMpesa, setFormMpesa] = useState('');
  const [formBank, setFormBank] = useState('');
  const [formEmergencyName, setFormEmergencyName] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');
  const [formShiftMorning, setFormShiftMorning] = useState('');
  const [formShiftAfternoon, setFormShiftAfternoon] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Off / Leave scheduler form state
  const [offStaffId, setOffStaffId] = useState('');
  const [offType, setOffType] = useState<'Day Off' | 'Annual Leave' | 'Sick Leave' | 'Compassionate Leave'>('Day Off');
  const [offStart, setOffStart] = useState(() => toIsoDate(new Date()));
  const [offEnd, setOffEnd] = useState(() => toIsoDate(new Date()));
  const [offNotes, setOffNotes] = useState('');
  const [offStatus, setOffStatus] = useState<'Approved' | 'Pending' | 'Completed'>('Approved');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Present' | 'Off' | 'On Leave'>('all');

  // Daily Attendance persistent state
  const [attendanceDate, setAttendanceDate] = useState(() => toIsoDate(new Date()));
  const [dailyAttendanceMap, setDailyAttendanceMap] = useState<
    Record<string, Record<string, { status: 'Present' | 'Off' | 'On Leave' | 'Half Day'; timeIn?: string; notes?: string }>>
  >(() => {
    try {
      const saved = localStorage.getItem('jr_farm_attendance_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save daily attendance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_attendance_records', JSON.stringify(dailyAttendanceMap));
    } catch (err) {
      console.error('Failed to persist attendance records', err);
    }
  }, [dailyAttendanceMap]);

  // Weekly shift matrix state
  const [weeklyShifts, setWeeklyShifts] = useState<
    Record<string, Record<string, { morning: string; afternoon: string; isOff: boolean }>>
  >(() => {
    try {
      const saved = localStorage.getItem('jr_farm_weekly_shifts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_weekly_shifts', JSON.stringify(weeklyShifts));
    } catch (err) {
      console.error('Failed to persist weekly shifts', err);
    }
  }, [weeklyShifts]);

  // Wage filter state
  const [wageStaffFilter, setWageStaffFilter] = useState<string>('all');

  // KPI Calculations
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter((s) => s.status === 'Present').length;
  const offTodayCount = staffList.filter((s) => s.status === 'Off').length;
  const leaveTodayCount = staffList.filter((s) => s.status === 'On Leave').length;
  const attendancePercentage = totalStaffCount === 0 ? 0 : Math.round((activeStaffCount / totalStaffCount) * 100);

  // Monthly labor expense from financials
  const currentMonthPrefix = toIsoDate(new Date()).slice(0, 7);
  const monthlyLaborExpense = useMemo(() => {
    return financials
      .filter((f: any) => {
        const isWage = f.category === 'Wages' || f.description?.toLowerCase()?.includes('wage') || f.description?.toLowerCase()?.includes('paid to');
        const matchMonth = f.date?.startsWith(currentMonthPrefix);
        return isWage && matchMonth;
      })
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [financials, currentMonthPrefix]);

  // Helper for Initials
  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to format currency
  const formatKsh = (amount?: number) => {
    return `KES ${(amount || 0).toLocaleString()}`;
  };

  // Submit Handler for New Staff
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formPhone.trim()) {
      alert('Please fill in required fields: Name, Role, and Phone Number.');
      return;
    }

    onAddStaff({
      name: formName.trim(),
      role: formRole.trim(),
      unit: formUnit,
      phone: formPhone.trim(),
      shiftMorning: formShiftMorning.trim() || 'General morning duties',
      shiftAfternoon: formShiftAfternoon.trim() || 'General afternoon duties',
      status: 'Present',
      nationalId: formNationalId.trim() || undefined,
      assignedStation: formStation.trim() || undefined,
      contractType: formContractType,
      joiningDate: formJoiningDate || undefined,
      wageType: formWageType,
      baseSalary: formBaseSalary ? Number(formBaseSalary) : undefined,
      dailyRate: formWageType === 'Daily' && formBaseSalary ? Number(formBaseSalary) : undefined,
      mpesaNumber: formMpesa.trim() || undefined,
      bankDetails: formBank.trim() || undefined,
      emergencyContactName: formEmergencyName.trim() || undefined,
      emergencyContactPhone: formEmergencyPhone.trim() || undefined,
      notes: formNotes.trim() || undefined
    });

    // Reset Form
    setFormName('');
    setFormRole('');
    setFormPhone('');
    setFormNationalId('');
    setFormStation('');
    setFormBaseSalary('');
    setFormMpesa('');
    setFormBank('');
    setFormEmergencyName('');
    setFormEmergencyPhone('');
    setFormShiftMorning('');
    setFormShiftAfternoon('');
    setFormNotes('');
    setShowAddForm(false);
  };

  // Submit Handler for Leave / Off Record
  const handleOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaffId = offStaffId || staffList[0]?.id;
    if (!targetStaffId || !offStart || !offEnd) {
      alert('Please select an employee and valid date range.');
      return;
    }
    const member = staffList.find((s) => s.id === targetStaffId);
    if (!member) return;

    onAddOffRecord({
      staffId: targetStaffId,
      staffName: member.name,
      type: offType,
      startDate: offStart,
      endDate: offEnd,
      notes: offNotes.trim() || 'Scheduled rest day / authorized leave',
      status: offStatus
    });

    setOffNotes('');
    setShowOffForm(false);
  };

  // Attendance handlers for active date
  const getAttendanceForDate = (staffId: string) => {
    const dayMap = dailyAttendanceMap[attendanceDate];
    if (dayMap && dayMap[staffId]) {
      return dayMap[staffId];
    }
    const staff = staffList.find((s) => s.id === staffId);
    return {
      status: (staff?.status || 'Present') as 'Present' | 'Off' | 'On Leave' | 'Half Day',
      timeIn: '07:00 AM',
      notes: ''
    };
  };

  const updateAttendanceForDate = (
    staffId: string,
    status: 'Present' | 'Off' | 'On Leave' | 'Half Day',
    timeIn?: string,
    notes?: string
  ) => {
    setDailyAttendanceMap((prev) => {
      const dayRecords = { ...(prev[attendanceDate] || {}) };
      const current = dayRecords[staffId] || { timeIn: '07:00 AM', notes: '' };
      dayRecords[staffId] = {
        status,
        timeIn: timeIn !== undefined ? timeIn : current.timeIn,
        notes: notes !== undefined ? notes : current.notes
      };
      return { ...prev, [attendanceDate]: dayRecords };
    });

    // If today, also update live status
    if (attendanceDate === toIsoDate(new Date()) && status !== 'Half Day') {
      onUpdateStatus(staffId, status);
    }
  };

  const markAllPresentToday = () => {
    const updatedDay: Record<string, { status: 'Present' | 'Off' | 'On Leave' | 'Half Day'; timeIn?: string; notes?: string }> = {};
    staffList.forEach((s) => {
      updatedDay[s.id] = { status: 'Present', timeIn: '07:00 AM', notes: 'Full shift completed' };
      if (attendanceDate === toIsoDate(new Date())) {
        onUpdateStatus(s.id, 'Present');
      }
    });
    setDailyAttendanceMap((prev) => ({ ...prev, [attendanceDate]: updatedDay }));
  };

  // Attendance statistics for selected date
  const attendanceDateStats = useMemo(() => {
    let present = 0;
    let off = 0;
    let leave = 0;
    let half = 0;

    staffList.forEach((s) => {
      const rec = getAttendanceForDate(s.id);
      if (rec.status === 'Present') present++;
      else if (rec.status === 'Off') off++;
      else if (rec.status === 'On Leave') leave++;
      else if (rec.status === 'Half Day') half++;
    });

    const total = staffList.length;
    const rate = total === 0 ? 0 : Math.round(((present + half * 0.5) / total) * 100);
    return { present, off, leave, half, total, rate };
  }, [staffList, dailyAttendanceMap, attendanceDate]);

  // Conflict Warnings Panel for Scheduled Leaves
  const leaveWarnings = useMemo(() => {
    const warnings: string[] = [];
    const units = ['Dairy', 'Horti', 'Fields', 'Security'];

    for (let offset = 0; offset <= 7; offset++) {
      const checkDate = offsetIsoDate(offset);
      const formattedDate = new Date(checkDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      units.forEach((u) => {
        const uStaffIds = staffList.filter((s) => s.unit === u).map((s) => s.id);
        const offsOnDate = staffOffRecords.filter(
          (r) => r.status === 'Approved' && r.startDate <= checkDate && checkDate <= r.endDate && uStaffIds.includes(r.staffId)
        );

        if (offsOnDate.length > 1) {
          const names = offsOnDate.map((r) => r.staffName).join(' & ');
          warnings.push(`Unit Alert on ${formattedDate}: Multiple staff (${names}) on leave simultaneously in ${u} division.`);
        }
      });
    }
    return warnings;
  }, [staffList, staffOffRecords]);

  // Export Staff Directory to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Role', 'Unit', 'Station', 'Phone', 'Contract', 'Wage Type', 'Salary/Rate', 'Status'];
    const rows = staffList.map((s) => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.role}"`,
      `"${s.unit}"`,
      `"${s.assignedStation || ''}"`,
      `"${s.phone}"`,
      `"${s.contractType || 'Permanent'}"`,
      `"${s.wageType || 'Monthly'}"`,
      `"${s.baseSalary || s.dailyRate || 0}"`,
      `"${s.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_employees_${toIsoDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered staff list for Directory
  const filteredStaff = useMemo(() => {
    return staffList.filter((st) => {
      const safeName = (st.name || '').toLowerCase();
      const safeRole = (st.role || '').toLowerCase();
      const safePhone = (st.phone || '').toLowerCase();
      const safeStation = (st.assignedStation || '').toLowerCase();
      const safeNatId = (st.nationalId || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchSearch =
        safeName.includes(query) ||
        safeRole.includes(query) ||
        safePhone.includes(query) ||
        safeStation.includes(query) ||
        safeNatId.includes(query);

      const matchUnit = unitFilter === 'all' || st.unit === unitFilter;
      const matchStatus = statusFilter === 'all' || st.status === statusFilter;

      return matchSearch && matchUnit && matchStatus;
    });
  }, [staffList, searchTerm, unitFilter, statusFilter]);

  // Wages ledger filtered records
  const wageLedgerRecords = useMemo(() => {
    return financials.filter((f: any) => {
      const isWage = f.category === 'Wages' || f.description?.toLowerCase()?.includes('wage') || f.description?.toLowerCase()?.includes('paid to');
      if (!isWage) return false;
      if (wageStaffFilter === 'all') return true;
      const s = staffList.find((w) => w.id === wageStaffFilter);
      return s ? f.description?.toLowerCase().includes(s.name.toLowerCase()) : true;
    });
  }, [financials, wageStaffFilter, staffList]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8 animate-fadeIn text-gray-900 pb-16">
      {/* TOP OVERVIEW BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-7 rounded-[2rem] shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50 shrink-0">
              <Users size={32} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Estate Workforce Management
                </span>
                <span className="text-emerald-300/60 text-xs">• Sovereign HRM</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Staff Roster & Human Resources</h1>
              <p className="text-xs text-emerald-100/70 mt-1 max-w-xl">
                Comprehensive directory, daily shift tracking, leave approvals, wage accounting, and automated employee payslips.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {onTriggerSectionReport && (
              <button
                onClick={() => onTriggerSectionReport('staff')}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition-all border border-white/15 cursor-pointer backdrop-blur-sm"
                title="Download Staff & Leaves PDF Report"
              >
                <Download size={14} />
                PDF Report
              </button>
            )}

            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) setRosterSubTab('roster');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus size={15} />
              {showAddForm ? 'Close Form' : 'Register Employee'}
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200/70 text-xs mb-1">
              <span>Total Headcount</span>
              <Building size={14} />
            </div>
            <div className="text-2xl font-extrabold text-white">{totalStaffCount}</div>
            <div className="text-[11px] text-emerald-300/80 mt-1">Across 5 farm divisions</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200/70 text-xs mb-1">
              <span>On Duty Today</span>
              <UserCheck size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{activeStaffCount}</div>
            <div className="text-[11px] text-emerald-300/80 mt-1">{attendancePercentage}% workforce present</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200/70 text-xs mb-1">
              <span>Off / On Leave</span>
              <CalendarDays size={14} className="text-amber-300" />
            </div>
            <div className="text-2xl font-extrabold text-amber-300">{offTodayCount + leaveTodayCount}</div>
            <div className="text-[11px] text-amber-200/70 mt-1">{offTodayCount} off • {leaveTodayCount} on leave</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200/70 text-xs mb-1">
              <span>Monthly Wages Paid</span>
              <Wallet size={14} className="text-sky-300" />
            </div>
            <div className="text-2xl font-extrabold text-sky-300">KES {monthlyLaborExpense.toLocaleString()}</div>
            <div className="text-[11px] text-sky-200/70 mt-1">Current calendar month</div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2.5 rounded-2xl shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'roster', label: 'Workforce Directory', icon: Users, badge: totalStaffCount },
            { id: 'attendance', label: 'Daily Attendance', icon: CheckCircle2, badge: `${activeStaffCount}/${totalStaffCount}` },
            { id: 'leaves', label: 'Leave & Off-Duty', icon: CalendarDays, badge: staffOffRecords.length },
            { id: 'shifts', label: 'Weekly Shift Matrix', icon: Clock },
            { id: 'wages', label: 'Wages & Payslips', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = rosterSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRosterSubTab(tab.id as RosterSubTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {rosterSubTab === 'roster' && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Export staff roster to CSV"
            >
              <Download size={13} />
              CSV
            </button>
            <div className="flex border border-gray-200 rounded-xl p-0.5 bg-gray-50">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'cards' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}
                title="Grid Cards View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}
                title="Table View"
              >
                <Table size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORKFORCE DIRECTORY                                                */}
      {/* ========================================================================= */}
      {rosterSubTab === 'roster' && (
        <div className="space-y-6">
          {/* REGISTRATION FORM (COLLAPSIBLE) */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-white p-7 rounded-3xl border border-emerald-100 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus size={18} className="text-emerald-600" />
                    Register New Farm Personnel
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enter comprehensive contact, departmental assignment, and compensation terms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Group 1: Identity & Role */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <User size={13} /> 1. Personnel Identity & Role
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Samuel Kibet"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">National ID / Passport</label>
                    <input
                      type="text"
                      value={formNationalId}
                      onChange={(e) => setFormNationalId(e.target.value)}
                      placeholder="e.g. 28491024"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Role / Position *</label>
                    <input
                      type="text"
                      required
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. Senior Herdsman / Dairy Lead"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Department & Station */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Building size={13} /> 2. Assignment & Department
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Department / Unit *</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value as any)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="Dairy">Dairy Section</option>
                      <option value="Horti">Horticulture & Crops</option>
                      <option value="Fields">Fields & Agronomy</option>
                      <option value="Security">Security & Logistics</option>
                      <option value="General">General Estate Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Specific Work Station</label>
                    <input
                      type="text"
                      value={formStation}
                      onChange={(e) => setFormStation(e.target.value)}
                      placeholder="e.g. Milking Parlor Unit 1"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Contract Type</label>
                    <select
                      value={formContractType}
                      onChange={(e) => setFormContractType(e.target.value as any)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Contract">Fixed-term Contract</option>
                      <option value="Casual">Casual / Daily Paid</option>
                      <option value="Intern">Intern / Trainee</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Employment Date</label>
                    <input
                      type="date"
                      value={formJoiningDate}
                      onChange={(e) => setFormJoiningDate(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Contact & Compensation */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <CreditCard size={13} /> 3. Contact & Remuneration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Primary Phone (+254...) *</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Wage Type</label>
                    <select
                      value={formWageType}
                      onChange={(e) => setFormWageType(e.target.value as any)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="Monthly">Monthly Salary</option>
                      <option value="Daily">Daily Wage Rate</option>
                      <option value="Piece-rate">Piece Rate / Task Based</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {formWageType === 'Daily' ? 'Daily Rate (KES)' : 'Base Salary (KES)'}
                    </label>
                    <input
                      type="number"
                      value={formBaseSalary}
                      onChange={(e) => setFormBaseSalary(e.target.value)}
                      placeholder={formWageType === 'Daily' ? 'e.g. 750' : 'e.g. 25000'}
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 font-mono focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">M-Pesa / Bank Details</label>
                    <input
                      type="text"
                      value={formMpesa}
                      onChange={(e) => setFormMpesa(e.target.value)}
                      placeholder="M-Pesa: 0712... or Equity 010..."
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Shift Duties & Emergency Contact */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Clock size={13} /> 4. Shifts & Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Morning Duty (AM)</label>
                    <input
                      type="text"
                      value={formShiftMorning}
                      onChange={(e) => setFormShiftMorning(e.target.value)}
                      placeholder="e.g. Morning Milking & Silage Distribution"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Afternoon Duty (PM)</label>
                    <input
                      type="text"
                      value={formShiftAfternoon}
                      onChange={(e) => setFormShiftAfternoon(e.target.value)}
                      placeholder="e.g. TMR Feed Mixing & Shed Cleaning"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={formEmergencyName}
                      onChange={(e) => setFormEmergencyName(e.target.value)}
                      placeholder="e.g. Mary (Spouse)"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Emergency Phone</label>
                    <input
                      type="tel"
                      value={formEmergencyPhone}
                      onChange={(e) => setFormEmergencyPhone(e.target.value)}
                      placeholder="+254 7..."
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Employee to Roster
                </button>
              </div>
            </form>
          )}

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, phone, station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              {/* Unit Filter */}
              <div className="flex gap-1 overflow-x-auto">
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
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer whitespace-nowrap ${
                      unitFilter === btn.id
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-semibold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Off">Off Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* VIEW: CARDS OR TABLE */}
          {filteredStaff.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
              <Users size={40} className="mx-auto text-gray-300" />
              <h4 className="text-sm font-bold text-gray-700">No personnel found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No employees match the active search or department filter. Try clearing filters or add a new employee.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((st) => {
                const isOff = st.status === 'Off';
                const isLeave = st.status === 'On Leave';

                return (
                  <div
                    key={st.id}
                    className={`bg-white border rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isOff
                        ? 'border-rose-200 bg-rose-50/10'
                        : isLeave
                        ? 'border-amber-200 bg-amber-50/10'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    {/* Card Top */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-13 h-13 rounded-2xl flex items-center justify-center text-sm font-extrabold shadow-sm shrink-0 ${
                              st.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isOff
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {getInitials(st.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {st.unit} Unit
                              </span>
                              {st.contractType && (
                                <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {st.contractType}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight hover:text-emerald-700 transition-colors">
                              {st.name}
                            </h3>
                            <p className="text-xs text-gray-600 font-medium mt-0.5">{st.role}</p>
                          </div>
                        </div>

                        {/* Status Toggle Pills */}
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            <button
                              onClick={() => onUpdateStatus(st.id, 'Present')}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                                st.status === 'Present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                              }`}
                              title="Mark Present"
                            >
                              Pres
                            </button>
                            <button
                              onClick={() => onUpdateStatus(st.id, 'Off')}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                                st.status === 'Off' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                              }`}
                              title="Mark Off Duty"
                            >
                              Off
                            </button>
                            <button
                              onClick={() => onUpdateStatus(st.id, 'On Leave')}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                                st.status === 'On Leave' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                              }`}
                              title="Mark On Leave"
                            >
                              Lv
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Station & Pay tag */}
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-600">
                        {st.assignedStation && (
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                            <MapPin size={11} className="text-emerald-700" />
                            {st.assignedStation}
                          </span>
                        )}
                        {(st.baseSalary || st.dailyRate) && (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                            <DollarSign size={11} />
                            {formatKsh(st.baseSalary || st.dailyRate)} {st.wageType === 'Daily' ? '/ day' : '/ mo'}
                          </span>
                        )}
                      </div>

                      {/* Contact row */}
                      <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                        <a
                          href={`tel:${st.phone}`}
                          className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-700 font-mono font-semibold"
                        >
                          <Phone size={12} className="text-emerald-600" />
                          {st.phone}
                        </a>
                        <a
                          href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                          title="Message via WhatsApp"
                        >
                          <MessageSquare size={11} />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Card Shifts */}
                    <div className="bg-gray-50/70 p-4 space-y-2 border-b border-gray-100 text-xs">
                      <div className="flex items-start gap-2">
                        <Clock size={12} className="text-emerald-700 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">AM Shift:</span>
                          <span className="text-gray-800 font-medium ml-1.5">{st.shiftMorning || 'Standard morning duty'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock size={12} className="text-emerald-700 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">PM Shift:</span>
                          <span className="text-gray-800 font-medium ml-1.5">{st.shiftAfternoon || 'Standard afternoon duty'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-white flex items-center justify-between gap-1 text-xs">
                      <button
                        onClick={() => setSelectedStaffDossier(st)}
                        className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        Profile Dossier
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setPayslipStaff(st);
                          }}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="Generate Employee Payslip"
                        >
                          <FileText size={14} />
                        </button>

                        {onEditStaff && (
                          <button
                            onClick={() => setEditingStaff(st)}
                            className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Personnel Details"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${st.name} from the staff roster?`)) {
                              onDeleteStaff(st.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Employee</th>
                      <th className="p-4">Department / Station</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Contract & Pay</th>
                      <th className="p-4">Shifts (AM / PM)</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredStaff.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                              {getInitials(st.name)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{st.name}</div>
                              <div className="text-[11px] text-gray-500">{st.role}</div>
                              {st.nationalId && <div className="text-[10px] text-gray-400">ID: {st.nationalId}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            {st.unit}
                          </span>
                          {st.assignedStation && <div className="text-[11px] text-gray-500 mt-1">{st.assignedStation}</div>}
                        </td>
                        <td className="p-4 font-mono">
                          <a href={`tel:${st.phone}`} className="hover:text-emerald-700">
                            {st.phone}
                          </a>
                          {st.emergencyContactPhone && (
                            <div className="text-[10px] text-gray-400">Emg: {st.emergencyContactPhone}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">{st.contractType || 'Permanent'}</div>
                          {(st.baseSalary || st.dailyRate) && (
                            <div className="text-[11px] text-emerald-700 font-mono">
                              {formatKsh(st.baseSalary || st.dailyRate)}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-[11px]">
                          <div>
                            <span className="text-gray-400">AM:</span> {st.shiftMorning}
                          </div>
                          <div>
                            <span className="text-gray-400">PM:</span> {st.shiftAfternoon}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              st.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.status === 'Off'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStaffDossier(st)}
                              className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="View Dossier"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setPayslipStaff(st)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                              title="Generate Payslip"
                            >
                              <FileText size={14} />
                            </button>
                            {onEditStaff && (
                              <button
                                onClick={() => setEditingStaff(st)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${st.name}?`)) onDeleteStaff(st.id);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY ATTENDANCE                                                   */}
      {/* ========================================================================= */}
      {rosterSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Controls Bar */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAttendanceDate(offsetIsoDate(-1, new Date(attendanceDate)))}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="text-xs border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 bg-gray-50 focus:bg-white cursor-pointer"
                />
                {attendanceDate === toIsoDate(new Date()) && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Today
                  </span>
                )}
              </div>

              <button
                onClick={() => setAttendanceDate(offsetIsoDate(1, new Date(attendanceDate)))}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>

              <button
                onClick={() => setAttendanceDate(toIsoDate(new Date()))}
                className="text-xs text-emerald-700 hover:underline font-bold ml-1 cursor-pointer"
              >
                Jump to Today
              </button>
            </div>

            {/* Quick Bulk Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={markAllPresentToday}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 size={14} />
                Mark All As Present ({attendanceDate})
              </button>
            </div>
          </div>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Present on Duty</span>
              <div className="text-xl font-bold text-emerald-700">{attendanceDateStats.present}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Half Day</span>
              <div className="text-xl font-bold text-sky-700">{attendanceDateStats.half}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Off Duty</span>
              <div className="text-xl font-bold text-rose-700">{attendanceDateStats.off}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">On Leave</span>
              <div className="text-xl font-bold text-amber-700">{attendanceDateStats.leave}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Attendance Rate</span>
              <div className="text-xl font-bold text-gray-900">{attendanceDateStats.rate}%</div>
            </div>
          </div>

          {/* Interactive Daily Attendance Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Workforce Attendance Sheet</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record daily presence, check-in timestamps, and operational exceptions for {attendanceDate}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Personnel</th>
                    <th className="p-4">Department & Station</th>
                    <th className="p-4">Check-in Time</th>
                    <th className="p-4 text-center">Status Toggle</th>
                    <th className="p-4">Work / Shift Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {staffList.map((worker) => {
                    const att = getAttendanceForDate(worker.id);

                    return (
                      <tr key={worker.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{worker.name}</div>
                          <div className="text-[11px] text-gray-500">{worker.role}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            {worker.unit}
                          </span>
                          {worker.assignedStation && (
                            <div className="text-[10px] text-gray-400 mt-0.5">{worker.assignedStation}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={att.timeIn || '07:00 AM'}
                            onChange={(e) => updateAttendanceForDate(worker.id, att.status, e.target.value, att.notes)}
                            className="w-24 text-xs font-mono border border-gray-200 rounded-lg p-1.5 bg-gray-50 focus:bg-white"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { label: 'Present', color: 'emerald', bg: 'bg-emerald-600 text-white' },
                              { label: 'Half Day', color: 'sky', bg: 'bg-sky-600 text-white' },
                              { label: 'Off', color: 'rose', bg: 'bg-rose-600 text-white' },
                              { label: 'On Leave', color: 'amber', bg: 'bg-amber-600 text-white' }
                            ].map((btn) => {
                              const active = att.status === btn.label;
                              return (
                                <button
                                  key={btn.label}
                                  onClick={() =>
                                    updateAttendanceForDate(
                                      worker.id,
                                      btn.label as any,
                                      att.timeIn,
                                      att.notes
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    active ? `${btn.bg} shadow-xs` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={att.notes || ''}
                            placeholder="Add shift remarks..."
                            onChange={(e) => updateAttendanceForDate(worker.id, att.status, att.timeIn, e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-lg p-1.5 bg-gray-50 focus:bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE & OFF-DUTY SCHEDULER                                         */}
      {/* ========================================================================= */}
      {rosterSubTab === 'leaves' && (
        <div className="space-y-6">
          {/* Header & Book Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-600" />
                Staff Off-Duty & Leave Scheduling
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage statutory annual leaves, weekly rest cycles, and sick leave approvals with labor conflict detection.
              </p>
            </div>
            <button
              onClick={() => setShowOffForm(!showOffForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus size={14} />
              {showOffForm ? 'Close Form' : 'Book Leave / Off-Duty'}
            </button>
          </div>

          {/* Form */}
          {showOffForm && (
            <form onSubmit={handleOffSubmit} className="bg-white p-7 rounded-3xl border border-indigo-100 shadow-xl space-y-6 animate-fadeIn">
              <div className="border-b border-indigo-50 pb-3">
                <h4 className="text-sm font-bold text-indigo-950">Schedule Staff Leave / Rest Period</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Staff Member *</label>
                  <select
                    value={offStaffId}
                    onChange={(e) => setOffStaffId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white font-semibold"
                    required
                  >
                    <option value="" disabled>-- Select Employee --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role} - {s.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Leave / Absence Type *</label>
                  <select
                    value={offType}
                    onChange={(e) => setOffType(e.target.value as any)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white font-semibold"
                  >
                    <option value="Day Off">Weekly Day Off</option>
                    <option value="Annual Leave">Annual Paid Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Compassionate Leave">Compassionate / Emergency Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Authorization Status</label>
                  <select
                    value={offStatus}
                    onChange={(e) => setOffStatus(e.target.value as any)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white font-semibold"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending Management Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={offStart}
                    onChange={(e) => setOffStart(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={offEnd}
                    onChange={(e) => setOffEnd(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Coverage / Reason Notes</label>
                  <input
                    type="text"
                    value={offNotes}
                    onChange={(e) => setOffNotes(e.target.value)}
                    placeholder="e.g. Standard weekly rest day; duties covered by Mosoti"
                    className="w-full text-xs border border-gray-200 rounded-xl p-3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowOffForm(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Confirm & Save Leave Schedule
                </button>
              </div>
            </form>
          )}

          {/* Conflict Warnings Panel */}
          {leaveWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle size={16} className="text-amber-600" />
                Departmental Labor Conflict Warning (Next 7 Days)
              </div>
              <ul className="text-xs text-amber-800 space-y-1 list-disc pl-5">
                {leaveWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Leave Records Ledger Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Scheduled Leaves & Rest Cycles</h3>
                <p className="text-xs text-gray-500 mt-0.5">Audit log of all registered off-duty allocations.</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                {staffOffRecords.length} Total Records
              </span>
            </div>

            {staffOffRecords.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs italic">
                No leave or off-duty entries recorded. Click &quot;Book Leave / Off-Duty&quot; to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Personnel</th>
                      <th className="p-4">Leave Type</th>
                      <th className="p-4">Date Interval</th>
                      <th className="p-4">Remarks / Coverage</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {staffOffRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{r.staffName}</td>
                        <td className="p-4">
                          <span className="font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                            {r.type}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          {r.startDate} <span className="text-gray-400">to</span> {r.endDate}
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs truncate">{r.notes}</td>
                        <td className="p-4 text-center">
                          <select
                            value={r.status}
                            onChange={(e) => onUpdateOffRecordStatus(r.id, e.target.value as any)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer ${
                              r.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : r.status === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onEditStaffOffRecord && (
                              <button
                                onClick={() => setEditingStaffOffRecord(r)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete this leave record for ${r.staffName}?`)) {
                                  onDeleteOffRecord(r.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WEEKLY SHIFT MATRIX                                                */}
      {/* ========================================================================= */}
      {rosterSubTab === 'shifts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-emerald-600" />
                7-Day Weekly Shift Schedule
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Assign and review daily work rotations across all days of the week (Monday through Sunday).
              </p>
            </div>
            <button
              onClick={() => {
                const initialized: Record<string, Record<string, { morning: string; afternoon: string; isOff: boolean }>> = {};
                staffList.forEach((s) => {
                  initialized[s.id] = {};
                  daysOfWeek.forEach((day, idx) => {
                    // Default Sunday off for general, Saturday/Sunday rotation
                    const isDefaultOff = day === 'Sunday' && s.unit !== 'Security';
                    initialized[s.id][day] = {
                      morning: isDefaultOff ? 'OFF' : s.shiftMorning || 'Morning Duty',
                      afternoon: isDefaultOff ? 'OFF' : s.shiftAfternoon || 'Afternoon Duty',
                      isOff: isDefaultOff
                    };
                  });
                });
                setWeeklyShifts(initialized);
                alert('✓ Re-synchronized weekly shift template from staff primary profiles!');
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Sparkles size={14} className="text-emerald-600" />
              Auto-Populate from Profiles
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4 w-52">Personnel & Unit</th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="p-4 text-center min-w-[120px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {staffList.map((worker) => {
                    const workerShifts = weeklyShifts[worker.id] || {};

                    return (
                      <tr key={worker.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{worker.name}</div>
                          <div className="text-[11px] text-gray-500">{worker.role}</div>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {worker.unit}
                          </span>
                        </td>
                        {daysOfWeek.map((day) => {
                          const shift = workerShifts[day] || {
                            morning: worker.shiftMorning || 'AM',
                            afternoon: worker.shiftAfternoon || 'PM',
                            isOff: day === 'Sunday'
                          };

                          return (
                            <td key={day} className="p-3 text-center">
                              {shift.isOff ? (
                                <button
                                  onClick={() => {
                                    setWeeklyShifts((prev) => ({
                                      ...prev,
                                      [worker.id]: {
                                        ...(prev[worker.id] || {}),
                                        [day]: { morning: worker.shiftMorning, afternoon: worker.shiftAfternoon, isOff: false }
                                      }
                                    }));
                                  }}
                                  className="w-full py-2 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                  REST DAY
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setWeeklyShifts((prev) => ({
                                      ...prev,
                                      [worker.id]: {
                                        ...(prev[worker.id] || {}),
                                        [day]: { morning: 'OFF', afternoon: 'OFF', isOff: true }
                                      }
                                    }));
                                  }}
                                  className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-900 rounded-lg border border-emerald-200 text-left transition-colors cursor-pointer"
                                >
                                  <div className="text-[10px] font-bold text-emerald-800 truncate">
                                    AM: {shift.morning || worker.shiftMorning}
                                  </div>
                                  <div className="text-[9px] text-gray-600 truncate">
                                    PM: {shift.afternoon || worker.shiftAfternoon}
                                  </div>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WAGES, PAYROLL & ADVANCES                                          */}
      {/* ========================================================================= */}
      {rosterSubTab === 'wages' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Record Wage Payment Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Wallet size={18} className="text-amber-600" />
                  Log Wage Payment / Advance
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record paycheck disbursements, mid-month advances, or bonuses directly to the farm financials ledger.
                </p>
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

                  const s = staffList.find((w) => w.id === workerId);
                  if (!s) return;

                  if (onAddTransaction) {
                    onAddTransaction({
                      id: `WAGE-${Date.now()}`,
                      type: 'expense',
                      amount: amt,
                      category: 'Wages',
                      description: `${payType}: Paid to ${s.name} (${s.role}) - ${desc}`,
                      date: dateVal || toIsoDate(new Date())
                    });
                    alert(`✓ Registered wage payout of KES ${amt.toLocaleString()} to financials database!`);
                    form.reset();
                  } else {
                    alert('Ledger syncer offline.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Select Employee *</label>
                  <select name="workerId" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold">
                    {staffList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.role} - {w.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Type</label>
                    <select name="payType" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold">
                      <option value="Wage Advance">Wage Advance</option>
                      <option value="Salary Settlement">Monthly Salary Settlement</option>
                      <option value="Daily Wage Payout">Daily Casual Payout</option>
                      <option value="Performance Bonus">Performance Bonus</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Amount (KES) *</label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="e.g. 5000"
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Description / Notes *</label>
                  <input
                    type="text"
                    name="desc"
                    placeholder="e.g. Mid-month living advance via M-Pesa"
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    name="payDate"
                    defaultValue={toIsoDate(new Date())}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Record Wage Payment to Ledger
                </button>
              </form>
            </div>

            {/* Wage Ledger Review */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Wage Accounting Ledger</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Historical record of all labor payouts.</p>
                </div>

                <select
                  value={wageStaffFilter}
                  onChange={(e) => setWageStaffFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 font-semibold cursor-pointer"
                >
                  <option value="all">All Personnel</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="p-3">Date</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Details</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {wageLedgerRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                          No wage payment transactions found.
                        </td>
                      </tr>
                    ) : (
                      wageLedgerRecords.map((tx: any) => {
                        const isEditing = editingWageId === tx.id;
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-3 font-mono text-[11px]">{tx.date}</td>
                            <td className="p-3 font-bold text-emerald-700 text-[10px]">{tx.id}</td>
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="w-full p-1 border border-gray-300 rounded text-xs"
                                  value={editWageDesc}
                                  onChange={(e) => setEditWageDesc(e.target.value)}
                                />
                              ) : (
                                tx.description
                              )}
                            </td>
                            <td className="p-3 text-right font-bold text-rose-700 font-mono">
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="w-24 p-1 border border-gray-300 rounded text-xs font-mono ml-auto block"
                                  value={editWageAmount}
                                  onChange={(e) => setEditWageAmount(e.target.value)}
                                />
                              ) : (
                                `KES ${Number(tx.amount).toLocaleString()}`
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {isEditing ? (
                                <button
                                  onClick={() => {
                                    setFinancials(
                                      financials.map((f) =>
                                        f.id === tx.id ? { ...f, description: editWageDesc, amount: Number(editWageAmount) } : f
                                      )
                                    );
                                    setEditingWageId(null);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingWageId(tx.id);
                                      setEditWageDesc(tx.description);
                                      setEditWageAmount(String(tx.amount));
                                    }}
                                    className="p-1 text-gray-500 hover:text-indigo-700 rounded cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Delete this wage transaction?')) {
                                        setFinancials(financials.filter((f) => f.id !== tx.id));
                                      }
                                    }}
                                    className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EMPLOYEE PROFILE DOSSIER                                         */}
      {/* ========================================================================= */}
      {selectedStaffDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-7 border border-gray-200 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 text-xl font-extrabold flex items-center justify-center shadow-inner">
                  {getInitials(selectedStaffDossier.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {selectedStaffDossier.unit} Unit
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedStaffDossier.status === 'Present'
                          ? 'bg-emerald-500 text-white'
                          : selectedStaffDossier.status === 'Off'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {selectedStaffDossier.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedStaffDossier.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedStaffDossier.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffDossier(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Contact Bar */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${selectedStaffDossier.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold"
              >
                <Phone size={13} className="text-emerald-600" />
                Call: {selectedStaffDossier.phone}
              </a>
              <a
                href={`https://wa.me/${selectedStaffDossier.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200"
              >
                <MessageSquare size={13} />
                WhatsApp Message
              </a>
              <button
                onClick={() => {
                  setPayslipStaff(selectedStaffDossier);
                  setSelectedStaffDossier(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-semibold border border-sky-200 cursor-pointer ml-auto"
              >
                <FileText size={13} />
                Generate Payslip
              </button>
            </div>

            {/* Dossier Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Employment Particulars
                </span>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-500">National ID:</span>{' '}
                    <strong className="text-gray-900">{selectedStaffDossier.nationalId || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Contract Type:</span>{' '}
                    <strong className="text-gray-900">{selectedStaffDossier.contractType || 'Permanent'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Joining Date:</span>{' '}
                    <strong className="text-gray-900">{selectedStaffDossier.joiningDate || 'Standard Staff'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Station / Area:</span>{' '}
                    <strong className="text-gray-900">{selectedStaffDossier.assignedStation || 'General Zone'}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Remuneration & Emergency
                </span>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-500">Wage Arrangement:</span>{' '}
                    <strong className="text-gray-900">{selectedStaffDossier.wageType || 'Monthly Salary'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Base Rate:</span>{' '}
                    <strong className="text-emerald-700 font-mono">
                      {formatKsh(selectedStaffDossier.baseSalary || selectedStaffDossier.dailyRate)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment Account:</span>{' '}
                    <strong className="text-gray-900">{selectedStaffDossier.mpesaNumber || 'Direct Cash / M-Pesa'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Emergency Contact:</span>{' '}
                    <strong className="text-gray-900">
                      {selectedStaffDossier.emergencyContactName || 'N/A'}{' '}
                      {selectedStaffDossier.emergencyContactPhone ? `(${selectedStaffDossier.emergencyContactPhone})` : ''}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Duties */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Daily Shift Allocation</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 text-[11px] block">Morning Duties (AM):</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedStaffDossier.shiftMorning}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-[11px] block">Afternoon Duties (PM):</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedStaffDossier.shiftAfternoon}</p>
                </div>
              </div>
            </div>

            {/* Recent Payouts */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Recent Wage Advances & Settlements</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                {financials
                  .filter((f: any) => f.description?.toLowerCase().includes(selectedStaffDossier.name.toLowerCase()))
                  .slice(0, 4)
                  .map((tx: any) => (
                    <div key={tx.id} className="p-2.5 flex justify-between items-center border-b border-gray-100 last:border-none">
                      <div>
                        <span className="font-mono text-gray-500 text-[10px] mr-2">{tx.date}</span>
                        <span className="text-gray-800">{tx.description}</span>
                      </div>
                      <span className="font-bold text-rose-700 font-mono">KES {Number(tx.amount).toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PAYSLIP GENERATOR & PREVIEW                                      */}
      {/* ========================================================================= */}
      {payslipStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-7 border border-gray-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Official Farm Payslip</h3>
              </div>
              <button onClick={() => setPayslipStaff(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            {/* Month Picker */}
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <span className="text-xs font-semibold text-gray-600">Pay Period:</span>
              <input
                type="month"
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg p-1.5 font-bold bg-white cursor-pointer"
              />
            </div>

            {/* Printable Payslip Card */}
            {(() => {
              const basePay = payslipStaff.baseSalary || (payslipStaff.dailyRate ? payslipStaff.dailyRate * 26 : 18000);
              const advances = financials
                .filter(
                  (f: any) =>
                    f.date?.startsWith(payslipMonth) &&
                    f.description?.toLowerCase().includes(payslipStaff.name.toLowerCase()) &&
                    (f.description?.toLowerCase().includes('advance') || f.description?.toLowerCase().includes('wage'))
                )
                .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
              const netPay = Math.max(0, basePay - advances);

              return (
                <div id="printable-payslip" className="bg-white border-2 border-dashed border-gray-200 p-5 rounded-2xl space-y-4">
                  <div className="text-center border-b border-gray-200 pb-3">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-emerald-900">
                      Junior &amp; Devin Estate Farms
                    </h2>
                    <p className="text-[10px] text-gray-500">Employee Remuneration Slip • Period: {payslipMonth}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block">EMPLOYEE NAME</span>
                      <strong className="text-gray-900">{payslipStaff.name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">ROLE &amp; UNIT</span>
                      <strong className="text-gray-900">{payslipStaff.role} ({payslipStaff.unit})</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">EMPLOYEE ID / PHONE</span>
                      <span className="font-mono text-gray-700">{payslipStaff.id} • {payslipStaff.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">CONTRACT TYPE</span>
                      <span className="text-gray-700">{payslipStaff.contractType || 'Permanent'}</span>
                    </div>
                  </div>

                  <div className="border-t border-b border-gray-200 py-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard Base Gross Earnings:</span>
                      <strong className="font-mono text-gray-900">KES {basePay.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-rose-700">
                      <span>Less: Cumulative Advances Taken This Month:</span>
                      <strong className="font-mono">- KES {advances.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-base font-extrabold border-t border-gray-200 pt-2 text-emerald-900">
                      <span>Net Settlement Payable:</span>
                      <span className="font-mono">KES {netPay.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                    <span>Authorized by Management</span>
                    <span>Stamp / Signature: __________________</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Printer size={14} />
                Print / Save PDF Payslip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT PERSONNEL DETAILS                                           */}
      {/* ========================================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-7 border border-gray-100 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit2 size={16} className="text-indigo-600" />
                Edit Employee Profile
              </h3>
              <button onClick={() => setEditingStaff(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">National ID</label>
                  <input
                    type="text"
                    value={editingStaff.nationalId || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, nationalId: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Department</label>
                  <select
                    value={editingStaff.unit}
                    onChange={(e) => setEditingStaff({ ...editingStaff, unit: e.target.value as any })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-semibold bg-white"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Horti">Horticulture</option>
                    <option value="Fields">Fields & Agronomy</option>
                    <option value="Security">Security</option>
                    <option value="General">General Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Assigned Station</label>
                  <input
                    type="text"
                    value={editingStaff.assignedStation || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, assignedStation: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Wage Arrangement</label>
                  <select
                    value={editingStaff.wageType || 'Monthly'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, wageType: e.target.value as any })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full bg-white font-semibold"
                  >
                    <option value="Monthly">Monthly Salary</option>
                    <option value="Daily">Daily Wage Rate</option>
                    <option value="Piece-rate">Piece Rate</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Base Amount (KES)</label>
                  <input
                    type="number"
                    value={editingStaff.baseSalary || editingStaff.dailyRate || ''}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        baseSalary: Number(e.target.value),
                        dailyRate: editingStaff.wageType === 'Daily' ? Number(e.target.value) : undefined
                      })
                    }
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Morning Shift Duty</label>
                  <input
                    type="text"
                    value={editingStaff.shiftMorning}
                    onChange={(e) => setEditingStaff({ ...editingStaff, shiftMorning: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Afternoon Shift Duty</label>
                  <input
                    type="text"
                    value={editingStaff.shiftAfternoon}
                    onChange={(e) => setEditingStaff({ ...editingStaff, shiftAfternoon: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={editingStaff.emergencyContactName || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContactName: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={editingStaff.emergencyContactPhone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContactPhone: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT LEAVE RECORD                                                */}
      {/* ========================================================================= */}
      {editingStaffOffRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Edit Leave Schedule Record</h3>
              <button onClick={() => setEditingStaffOffRecord(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Personnel</label>
                <select
                  value={editingStaffOffRecord.staffId}
                  onChange={(e) => {
                    const sel = staffList.find((s) => s.id === e.target.value);
                    setEditingStaffOffRecord({
                      ...editingStaffOffRecord,
                      staffId: e.target.value,
                      staffName: sel ? sel.name : editingStaffOffRecord.staffName
                    });
                  }}
                  className="border border-gray-200 rounded-xl p-2.5 w-full font-bold bg-white"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Type</label>
                  <select
                    value={editingStaffOffRecord.type}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, type: e.target.value as any })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full bg-white font-semibold"
                  >
                    <option value="Day Off">Day Off</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Status</label>
                  <select
                    value={editingStaffOffRecord.status}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, status: e.target.value as any })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full bg-white font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingStaffOffRecord.startDate}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, startDate: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingStaffOffRecord.endDate}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, endDate: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Internal Reference Notes</label>
                <textarea
                  value={editingStaffOffRecord.notes}
                  onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, notes: e.target.value })}
                  rows={2}
                  className="border border-gray-200 rounded-xl p-2.5 w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingStaffOffRecord(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
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
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
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

export default Roster;
