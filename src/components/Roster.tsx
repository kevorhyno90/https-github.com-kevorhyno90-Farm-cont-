import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, StaffOffRecord } from '../types';
import {
  Users, UserPlus, Phone, Clock, Trash2, Search, Calendar, Plus,
  CalendarDays, Download, Edit2, DollarSign, Wallet, FileText,
  CheckCircle2, AlertCircle, Building, UserCheck, MessageSquare,
  ChevronLeft, ChevronRight, Eye, LayoutGrid, Table, Printer,
  Sparkles, MapPin, CreditCard, User, AlertTriangle, Bell, Share2,
  ArrowRight, Check, Send, ShieldCheck, History, CornerDownRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useFarmState, REMOTE_SYNC_APPLIED_EVENT } from '../context/FarmContext';
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

  // Monthly Report Modal state (PDF & Share)
  const [showMonthlyReportModal, setShowMonthlyReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Departure & Rotation Processing Modal
  const [processingDepartureRecord, setProcessingDepartureRecord] = useState<StaffOffRecord | null>(null);
  const [modalDepartureTime, setModalDepartureTime] = useState('05:00 PM');
  const [modalReturnDate, setModalReturnDate] = useState('');
  const [modalReturnTime, setModalReturnTime] = useState('07:00 AM');
  const [modalNextOffDate, setModalNextOffDate] = useState('');
  const [modalHandoverId, setModalHandoverId] = useState('');
  const [autoQueueNextOff, setAutoQueueNextOff] = useState(true);

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
  const [formAnnualLeave, setFormAnnualLeave] = useState('21');

  // Off / Leave scheduler form state
  const [offStaffId, setOffStaffId] = useState('');
  const [offType, setOffType] = useState<'Day Off' | 'Annual Leave' | 'Sick Leave' | 'Compassionate Leave'>('Day Off');
  const [offStart, setOffStart] = useState(() => toIsoDate(new Date()));
  const [offEnd, setOffEnd] = useState(() => toIsoDate(new Date()));
  const [offDepartureTime, setOffDepartureTime] = useState('05:00 PM');
  const [offReturnTime, setOffReturnTime] = useState('07:00 AM');
  const [offNextScheduledDate, setOffNextScheduledDate] = useState(() => offsetIsoDate(7));
  const [offHandoverStaffId, setOffHandoverStaffId] = useState('');
  const [offNotes, setOffNotes] = useState('');
  const [offStatus, setOffStatus] = useState<'Approved' | 'Pending' | 'Completed'>('Approved');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'Dairy' | 'Horti' | 'Fields' | 'Security' | 'General'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Present' | 'Off' | 'On Leave'>('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'all' | 'active' | 'Completed'>('all');

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

  const isRemoteSyncingRef = React.useRef(false);

  useEffect(() => {
    if (isRemoteSyncingRef.current) return;
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
    if (isRemoteSyncingRef.current) return;
    try {
      localStorage.setItem('jr_farm_weekly_shifts', JSON.stringify(weeklyShifts));
    } catch (err) {
      console.error('Failed to persist weekly shifts', err);
    }
  }, [weeklyShifts]);

  // Listen for remote sync updates from other devices
  useEffect(() => {
    const handleRemoteSync = () => {
      isRemoteSyncingRef.current = true;
      try {
        const attSaved = localStorage.getItem('jr_farm_attendance_records');
        if (attSaved) setDailyAttendanceMap(JSON.parse(attSaved));
        const shiftSaved = localStorage.getItem('jr_farm_weekly_shifts');
        if (shiftSaved) setWeeklyShifts(JSON.parse(shiftSaved));
      } catch (err) {
        console.error('Failed to reload roster records on sync', err);
      } finally {
        setTimeout(() => {
          isRemoteSyncingRef.current = false;
        }, 300);
      }
    };

    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
    window.addEventListener('storage', handleRemoteSync);
    return () => {
      window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync);
      window.removeEventListener('storage', handleRemoteSync);
    };
  }, []);

  // Wage filter state
  const [wageStaffFilter, setWageStaffFilter] = useState<string>('all');

  // Today string for reminder matching
  const todayStr = toIsoDate(new Date());

  // Helper to calculate days between two ISO date strings (inclusive)
  const calculateLeaveDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1;
    const d1 = new Date(startDate).getTime();
    const d2 = new Date(endDate).getTime();
    if (isNaN(d1) || isNaN(d2)) return 1;
    const diffTime = d2 - d1;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  // Helper to calculate Annual Leave stats (entitlement, days taken this calendar year, remaining days)
  const getStaffAnnualLeaveStats = (staffId: string) => {
    const member = staffList.find((s) => s.id === staffId);
    const entitlement = member?.annualLeaveEntitlement !== undefined ? member.annualLeaveEntitlement : 21;
    const currentYear = new Date().getFullYear().toString();

    // Sum all Annual Leave records (Approved or Completed) in current calendar year
    const annualLeaveRecords = staffOffRecords.filter((r) => {
      return (
        r.staffId === staffId &&
        r.type === 'Annual Leave' &&
        (r.status === 'Approved' || r.status === 'Completed') &&
        (r.startDate.startsWith(currentYear) || r.endDate.startsWith(currentYear))
      );
    });

    const daysTaken = annualLeaveRecords.reduce((total, r) => {
      return total + calculateLeaveDays(r.startDate, r.endDate);
    }, 0);

    const remaining = Math.max(0, entitlement - daysTaken);
    const percentageUsed = entitlement > 0 ? Math.min(100, Math.round((daysTaken / entitlement) * 100)) : 0;

    return {
      entitlement,
      daysTaken,
      remaining,
      percentageUsed,
      recordsCount: annualLeaveRecords.length
    };
  };

  // REMINDER 1: Due to Leave / Go Off Today (or active today)
  const departureReminders = useMemo(() => {
    return staffOffRecords.filter((r) => {
      return r.status === 'Approved' && r.startDate === todayStr;
    });
  }, [staffOffRecords, todayStr]);

  // REMINDER 2: Due to Return Today / Overdue Return
  const returnReminders = useMemo(() => {
    return staffOffRecords.filter((r) => {
      return r.status === 'Approved' && r.endDate <= todayStr;
    });
  }, [staffOffRecords, todayStr]);

  // KPI Calculations
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter((s) => s.status === 'Present').length;
  const offTodayCount = staffList.filter((s) => s.status === 'Off').length;
  const leaveTodayCount = staffList.filter((s) => s.status === 'On Leave').length;
  const attendancePercentage = totalStaffCount === 0 ? 0 : Math.round((activeStaffCount / totalStaffCount) * 100);

  // Monthly labor expense from financials
  const currentMonthPrefix = todayStr.slice(0, 7);
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
      annualLeaveEntitlement: formAnnualLeave ? Number(formAnnualLeave) : 21,
      mpesaNumber: formMpesa.trim() || undefined,
      bankDetails: formBank.trim() || undefined,
      emergencyContactName: formEmergencyName.trim() || undefined,
      emergencyContactPhone: formEmergencyPhone.trim() || undefined,
      notes: formNotes.trim() || undefined
    });

    setFormName('');
    setFormRole('');
    setFormPhone('');
    setFormNationalId('');
    setFormStation('');
    setFormBaseSalary('');
    setFormAnnualLeave('21');
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

    const handoverMember = staffList.find((s) => s.id === offHandoverStaffId);

    onAddOffRecord({
      staffId: targetStaffId,
      staffName: member.name,
      type: offType,
      startDate: offStart,
      endDate: offEnd,
      departureTime: offDepartureTime,
      returnTime: offReturnTime,
      nextScheduledOffDate: offNextScheduledDate,
      handoverStaffId: offHandoverStaffId || undefined,
      handoverStaffName: handoverMember ? handoverMember.name : undefined,
      notes: offNotes.trim() || 'Scheduled rest day / authorized leave',
      status: offStatus
    });

    // If starting today, update member status to Off or On Leave
    if (offStart === todayStr && offStatus === 'Approved') {
      onUpdateStatus(targetStaffId, offType === 'Day Off' ? 'Off' : 'On Leave');
    }

    setOffNotes('');
    setShowOffForm(false);
  };

  // Open Departure & Next Rotation Modal
  const openProcessDepartureModal = (rec: StaffOffRecord) => {
    setProcessingDepartureRecord(rec);
    setModalDepartureTime(rec.departureTime || '05:00 PM');
    setModalReturnDate(rec.endDate || todayStr);
    setModalReturnTime(rec.returnTime || '07:00 AM');
    setModalNextOffDate(rec.nextScheduledOffDate || offsetIsoDate(7, new Date(rec.endDate || todayStr)));
    setModalHandoverId(rec.handoverStaffId || '');
  };

  // Confirm Departure, Set Return & Next Off
  const handleConfirmDeparture = () => {
    if (!processingDepartureRecord) return;

    const handover = staffList.find((s) => s.id === modalHandoverId);

    const updated: StaffOffRecord = {
      ...processingDepartureRecord,
      departureTime: modalDepartureTime,
      endDate: modalReturnDate,
      returnTime: modalReturnTime,
      nextScheduledOffDate: modalNextOffDate,
      handoverStaffId: modalHandoverId || undefined,
      handoverStaffName: handover ? handover.name : undefined,
      status: 'Approved'
    };

    if (onEditStaffOffRecord) {
      onEditStaffOffRecord(processingDepartureRecord.id, updated);
    }

    // Set staff live status to Off or On Leave
    onUpdateStatus(
      processingDepartureRecord.staffId,
      processingDepartureRecord.type === 'Day Off' ? 'Off' : 'On Leave'
    );

    // Optionally auto-queue next scheduled off rotation record
    if (autoQueueNextOff && modalNextOffDate) {
      const nextEndDate = modalNextOffDate; // single day by default
      onAddOffRecord({
        staffId: processingDepartureRecord.staffId,
        staffName: processingDepartureRecord.staffName,
        type: processingDepartureRecord.type,
        startDate: modalNextOffDate,
        endDate: nextEndDate,
        departureTime: modalDepartureTime,
        returnTime: modalReturnTime,
        notes: `Next scheduled rotation following ${processingDepartureRecord.type}`,
        status: 'Pending'
      });
    }

    setProcessingDepartureRecord(null);
    alert(`✓ Departure confirmed for ${processingDepartureRecord.staffName}. Return scheduled for ${modalReturnDate} at ${modalReturnTime}. Next off rotation queued for ${modalNextOffDate}.`);
  };

  // Mark Returned & Completed
  const handleMarkReturned = (rec: StaffOffRecord) => {
    const updated: StaffOffRecord = {
      ...rec,
      actualReturnDate: todayStr,
      status: 'Completed'
    };

    if (onEditStaffOffRecord) {
      onEditStaffOffRecord(rec.id, updated);
    } else {
      onUpdateOffRecordStatus(rec.id, 'Completed');
    }

    // Restore employee status to Present
    onUpdateStatus(rec.staffId, 'Present');

    alert(`✓ Marked ${rec.staffName} as returned and completed! Record is permanently preserved in the audit archive.`);
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

    if (attendanceDate === todayStr && status !== 'Half Day') {
      onUpdateStatus(staffId, status);
    }
  };

  const markAllPresentToday = () => {
    const updatedDay: Record<string, { status: 'Present' | 'Off' | 'On Leave' | 'Half Day'; timeIn?: string; notes?: string }> = {};
    staffList.forEach((s) => {
      updatedDay[s.id] = { status: 'Present', timeIn: '07:00 AM', notes: 'Full shift completed' };
      if (attendanceDate === todayStr) {
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

  // Filtered Leave Records
  const filteredLeaveRecords = useMemo(() => {
    return staffOffRecords.filter((r) => {
      if (leaveStatusFilter === 'all') return true;
      if (leaveStatusFilter === 'Completed') return r.status === 'Completed';
      if (leaveStatusFilter === 'active') return r.status === 'Approved' || r.status === 'Pending';
      return true;
    });
  }, [staffOffRecords, leaveStatusFilter]);

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
    link.setAttribute('download', `farm_employees_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // =========================================================================
  // GENERATE MONTHLY PDF REPORT (jsPDF)
  // =========================================================================
  const generateMonthlyPdf = (action: 'download' | 'print' = 'download') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 15) {
        doc.addPage();
        y = 15;
      }
    };

    // Header Bar
    doc.setFillColor(6, 78, 59); // emerald-900
    doc.rect(margin, y, contentWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('JR FARM', margin + 6, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(167, 243, 208); // emerald-200
    doc.text(
      `MONTHLY WORKFORCE, ATTENDANCE & LEAVE AUDIT • PERIOD: ${reportMonth}`,
      margin + 6,
      y + 18
    );

    y += 30;

    // SECTION 1: ATTENDANCE & JOB PERFORMANCE SUMMARY
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. WORKFORCE ATTENDANCE & SHIFT ALLOCATION SUMMARY', margin, y);
    y += 5;

    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('EMPLOYEE', margin + 3, y + 5.5);
    doc.text('UNIT & ROLE', margin + 40, y + 5.5);
    doc.text('ANNUAL LEAVE', margin + 82, y + 5.5);
    doc.text('AM SHIFT TASK', margin + 124, y + 5.5);
    doc.text('STATUS', margin + 165, y + 5.5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    staffList.forEach((st) => {
      checkPageBreak(8);
      const ls = getStaffAnnualLeaveStats(st.id);
      doc.setTextColor(17, 24, 39);
      doc.text(st.name.substring(0, 20), margin + 3, y + 4.5);
      doc.text(`${st.role} (${st.unit})`.substring(0, 22), margin + 40, y + 4.5);
      doc.text(`${ls.remaining}d rem (${ls.daysTaken}/${ls.entitlement}d)`, margin + 82, y + 4.5);
      doc.text((st.shiftMorning || 'Standard duty').substring(0, 22), margin + 124, y + 4.5);

      // Status pill text
      doc.setTextColor(st.status === 'Present' ? 16 : 185, st.status === 'Present' ? 120 : 28, 28);
      doc.text(st.status, margin + 165, y + 4.5);

      // Divider line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
      y += 7.5;
    });

    y += 8;
    checkPageBreak(20);

    // SECTION 2: OFF & LEAVES OF THE MONTH
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`2. SCHEDULED OFF & LEAVE LOGS FOR ${reportMonth}`, margin, y);
    y += 5;

    // Filter leaves falling in reportMonth
    const monthLeaves = staffOffRecords.filter(
      (r) => r.startDate.startsWith(reportMonth) || r.endDate.startsWith(reportMonth)
    );

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('STAFF NAME', margin + 3, y + 5.5);
    doc.text('TYPE', margin + 45, y + 5.5);
    doc.text('DEPARTURE -> RETURN', margin + 80, y + 5.5);
    doc.text('HANDOVER / COVER', margin + 130, y + 5.5);
    doc.text('NEXT OFF', margin + 165, y + 5.5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    if (monthLeaves.length === 0) {
      doc.setTextColor(156, 163, 175);
      doc.text('No off-duty or leave cycles scheduled during this calendar month.', margin + 3, y + 5);
      y += 10;
    } else {
      monthLeaves.forEach((lv) => {
        checkPageBreak(8);
        doc.setTextColor(17, 24, 39);
        doc.text(lv.staffName.substring(0, 20), margin + 3, y + 4.5);
        doc.text(lv.type.substring(0, 18), margin + 45, y + 4.5);
        doc.text(`${lv.startDate} to ${lv.endDate}`, margin + 80, y + 4.5);
        doc.text((lv.handoverStaffName || 'Team Cover').substring(0, 18), margin + 130, y + 4.5);
        doc.text(lv.nextScheduledOffDate || '-', margin + 165, y + 4.5);

        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
        y += 7.5;
      });
    }

    y += 8;
    checkPageBreak(35);

    // SECTION 3: WAGES & LABOR PAYOUTS AUDIT
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`3. WAGES & ADVANCES SETTLED IN ${reportMonth}`, margin, y);
    y += 5;

    const monthWages = financials.filter(
      (f: any) =>
        f.date?.startsWith(reportMonth) &&
        (f.category === 'Wages' || f.description?.toLowerCase()?.includes('wage') || f.description?.toLowerCase()?.includes('paid to'))
    );

    const totalMonthWages = monthWages.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('DATE', margin + 3, y + 5.5);
    doc.text('VOUCHER REF', margin + 28, y + 5.5);
    doc.text('PARTICULARS / RECIPIENT', margin + 65, y + 5.5);
    doc.text('AMOUNT (KES)', margin + 155, y + 5.5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    if (monthWages.length === 0) {
      doc.setTextColor(156, 163, 175);
      doc.text('No wage disbursements logged for this month.', margin + 3, y + 5);
      y += 10;
    } else {
      monthWages.slice(0, 15).forEach((w: any) => {
        checkPageBreak(8);
        doc.setTextColor(17, 24, 39);
        doc.text(w.date || '-', margin + 3, y + 4.5);
        doc.text(String(w.id || '-').substring(0, 16), margin + 28, y + 4.5);
        doc.text(String(w.description || '-').substring(0, 48), margin + 65, y + 4.5);
        doc.text(`KES ${Number(w.amount).toLocaleString()}`, margin + 155, y + 4.5);

        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
        y += 7.5;
      });

      // Total row
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 78, 59);
      doc.text('TOTAL WAGE EXPENDITURE FOR PERIOD:', margin + 65, y + 5);
      doc.text(`KES ${totalMonthWages.toLocaleString()}`, margin + 155, y + 5);
      y += 10;
    }

    // Footer Signatures
    checkPageBreak(25);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(31, 41, 55);
    doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Sign / Stamp: ____________________', margin + 120, y);

    if (action === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`workforce_monthly_report_${reportMonth}.pdf`);
    }
  };

  // Share Summary via WhatsApp or Web Share
  const handleShareSummary = async () => {
    const monthLeaves = staffOffRecords.filter(
      (r) => r.startDate.startsWith(reportMonth) || r.endDate.startsWith(reportMonth)
    );
    const summaryText = `📋 *JR Farm - Workforce Report (${reportMonth})*\n` +
      `👥 Total Personnel: ${totalStaffCount}\n` +
      `✅ Currently on Duty: ${activeStaffCount}\n` +
      `🌴 Off / On Leave: ${offTodayCount + leaveTodayCount}\n` +
      `📅 Scheduled Leaves This Month: ${monthLeaves.length}\n` +
      `💰 Wages Disbursed: KES ${monthlyLaborExpense.toLocaleString()}\n\n` +
      `Presented & Approved by: Dr. Devin Omwenga, General Farm Manager`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Workforce & Leave Report - ${reportMonth}`,
          text: summaryText
        });
        return;
      } catch {
        // Fallback to WhatsApp
      }
    }

    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8 animate-fadeIn text-gray-900 pb-16">
      {/* ========================================================================= */}
      {/* SMART DEPARTURE & RETURN REMINDER BANNER                                  */}
      {/* ========================================================================= */}
      {(departureReminders.length > 0 || returnReminders.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white p-5 rounded-3xl shadow-lg border border-amber-400/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell size={18} className="text-white animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">
                  Workforce Off-Duty &amp; Return Alerts ({departureReminders.length + returnReminders.length} Active)
                </h4>
                <p className="text-xs text-amber-100">
                  Personnel scheduled for departure or expected to resume duties today.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Departure reminders */}
            {departureReminders.map((r) => (
              <div
                key={`dep-${r.id}`}
                className="bg-black/20 backdrop-blur-sm p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-white/10"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-400 text-amber-950 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full">
                      Proceeding on {r.type} Today
                    </span>
                  </div>
                  <strong className="text-sm block mt-1">{r.staffName}</strong>
                  <span className="text-[11px] text-amber-100">
                    Departs: {r.departureTime || 'End of day'} • Returns: {r.endDate} ({r.returnTime || '07:00 AM'})
                  </span>
                </div>

                <button
                  onClick={() => openProcessDepartureModal(r)}
                  className="px-3.5 py-2 bg-white text-orange-950 hover:bg-amber-50 font-bold text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
                >
                  Process &amp; Set Return
                </button>
              </div>
            ))}

            {/* Return reminders */}
            {returnReminders.map((r) => (
              <div
                key={`ret-${r.id}`}
                className="bg-emerald-950/40 backdrop-blur-sm p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-emerald-400/20"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-400 text-emerald-950 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full">
                      Due Back on Duty
                    </span>
                  </div>
                  <strong className="text-sm block mt-1">{r.staffName}</strong>
                  <span className="text-[11px] text-emerald-100">
                    Expected back today at {r.returnTime || '07:00 AM'}
                    {r.nextScheduledOffDate ? ` • Next off: ${r.nextScheduledOffDate}` : ''}
                  </span>
                </div>

                <button
                  onClick={() => handleMarkReturned(r)}
                  className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Check size={13} />
                  Mark Returned
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP OVERVIEW BANNER                                                       */}
      {/* ========================================================================= */}
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
              <h1 className="text-2xl font-bold tracking-tight text-white">Staff Roster &amp; Human Resources</h1>
              <p className="text-xs text-emerald-100/70 mt-1 max-w-xl">
                Departure reminders, automated return schedules, next-off rotation tracking, permanent editable logs, and monthly PDF exports.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => generateMonthlyPdf('download')}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
              title="Download Monthly Attendance, Jobs & Leaves PDF"
            >
              <Download size={16} />
              Download PDF Report
            </button>

            <button
              onClick={() => setShowMonthlyReportModal(true)}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
              title="Select Month, Print & WhatsApp Share"
            >
              <Share2 size={14} />
              Share / Print Options
            </button>

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

              {/* Identity & Role */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <User size={13} /> 1. Personnel Identity &amp; Role
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

              {/* Department & Station */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Building size={13} /> 2. Assignment &amp; Department
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
                      <option value="Horti">Horticulture &amp; Crops</option>
                      <option value="Fields">Fields &amp; Agronomy</option>
                      <option value="Security">Security &amp; Logistics</option>
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

              {/* Contact & Remuneration */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <CreditCard size={13} /> 3. Contact &amp; Remuneration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Annual Leave Days</label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={formAnnualLeave}
                      onChange={(e) => setFormAnnualLeave(e.target.value)}
                      placeholder="e.g. 21"
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 font-semibold text-emerald-800 focus:outline-none focus:border-emerald-500"
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

              {/* Shifts & Emergency Contact */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Clock size={13} /> 4. Shifts &amp; Emergency Contact
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

                      {/* Annual Leave Entitlement Progress Tracker */}
                      {(() => {
                        const ls = getStaffAnnualLeaveStats(st.id);
                        return (
                          <div className="mt-3 pt-2.5 border-t border-gray-100">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-gray-700 flex items-center gap-1">
                                🌴 Annual Leave:
                              </span>
                              <span className={`font-mono font-bold ${ls.remaining > 5 ? 'text-emerald-700' : ls.remaining > 0 ? 'text-amber-700' : 'text-rose-700'}`}>
                                {ls.remaining} / {ls.entitlement} days left
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  ls.remaining > 5 ? 'bg-emerald-500' : ls.remaining > 0 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${ls.percentageUsed}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-gray-500 mt-1 font-medium">
                              <span>{ls.daysTaken}d used in {new Date().getFullYear()}</span>
                              <span>{ls.entitlement}d allowance</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Shifts */}
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

                    {/* Footer Actions */}
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
                          onClick={() => setPayslipStaff(st)}
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
                      <th className="p-4">Contract &amp; Pay</th>
                      <th className="p-4">Annual Leave</th>
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
                        <td className="p-4">
                          {(() => {
                            const ls = getStaffAnnualLeaveStats(st.id);
                            return (
                              <div>
                                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${ls.remaining > 5 ? 'bg-emerald-500' : ls.remaining > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                  <span>{ls.remaining}d left</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                  {ls.daysTaken}/{ls.entitlement}d used
                                </div>
                              </div>
                            );
                          })()}
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
                {attendanceDate === todayStr && (
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
                onClick={() => setAttendanceDate(todayStr)}
                className="text-xs text-emerald-700 hover:underline font-bold ml-1 cursor-pointer"
              >
                Jump to Today
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => generateMonthlyPdf('download')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                title="Download Attendance PDF"
              >
                <Download size={14} />
                Download PDF
              </button>

              <button
                onClick={markAllPresentToday}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 size={14} />
                Mark All As Present ({attendanceDate})
              </button>
            </div>
          </div>

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
                    <th className="p-4">Department &amp; Station</th>
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
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-600" />
                Staff Off-Duty &amp; Leave Scheduling
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Schedule rest periods, set return dates &amp; times, configure next rotation dates, and access permanent editable logs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => generateMonthlyPdf('download')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-sm cursor-pointer"
                title="Download Leaves & Rotation PDF"
              >
                <Download size={14} />
                Download PDF
              </button>
              <button
                onClick={() => setShowMonthlyReportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 cursor-pointer"
              >
                <Printer size={14} />
                Print / Share
              </button>
              <button
                onClick={() => setShowOffForm(!showOffForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Plus size={14} />
                {showOffForm ? 'Close Form' : 'Schedule Off / Leave'}
              </button>
            </div>
          </div>

          {/* Schedule Form */}
          {showOffForm && (
            <form onSubmit={handleOffSubmit} className="bg-white p-7 rounded-3xl border border-indigo-100 shadow-xl space-y-6 animate-fadeIn">
              <div className="border-b border-indigo-50 pb-3">
                <h4 className="text-sm font-bold text-indigo-950">Book Staff Off-Duty / Leave Rotation</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set departure details, return time, handover colleague, and next scheduled off rotation.
                </p>
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
                    <option value="Completed">Completed Cycle</option>
                  </select>
                </div>

                {/* Live Annual Leave Balance Display & Warning */}
                {(() => {
                  const targetId = offStaffId || staffList[0]?.id;
                  if (!targetId) return null;
                  const ls = getStaffAnnualLeaveStats(targetId);
                  const selectedMember = staffList.find((s) => s.id === targetId);
                  const requestedDays = calculateLeaveDays(offStart, offEnd);
                  const isOverLimit = offType === 'Annual Leave' && requestedDays > ls.remaining;

                  return (
                    <div className="md:col-span-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                          🌴 Annual Leave Balance for {selectedMember?.name}:
                        </span>
                        <p className="text-[10px] text-emerald-800 mt-0.5">
                          <strong>{ls.remaining} days available</strong> out of {ls.entitlement} days entitlement for {new Date().getFullYear()} ({ls.daysTaken} days already taken).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-900 shadow-xs">
                          Requested: {requestedDays} {requestedDays === 1 ? 'day' : 'days'}
                        </span>
                        {isOverLimit && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200 animate-pulse">
                            ⚠️ Exceeds remaining {ls.remaining}d balance!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Departure Date & Time */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={offStart}
                    onChange={(e) => setOffStart(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Departure Time</label>
                  <input
                    type="text"
                    value={offDepartureTime}
                    onChange={(e) => setOffDepartureTime(e.target.value)}
                    placeholder="e.g. 05:00 PM"
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>

                {/* Handover staff */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Handover / Relief Colleague</label>
                  <select
                    value={offHandoverStaffId}
                    onChange={(e) => setOffHandoverStaffId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white"
                  >
                    <option value="">-- None (Team Rotation) --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Date & Time */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Return Date *</label>
                  <input
                    type="date"
                    required
                    value={offEnd}
                    onChange={(e) => setOffEnd(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Return / Resumption Time</label>
                  <input
                    type="text"
                    value={offReturnTime}
                    onChange={(e) => setOffReturnTime(e.target.value)}
                    placeholder="e.g. 07:00 AM"
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>

                {/* Next Scheduled Off */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Next Scheduled Off Date</label>
                  <input
                    type="date"
                    value={offNextScheduledDate}
                    onChange={(e) => setOffNextScheduledDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-3 font-semibold text-indigo-900"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Coverage / Reason Notes</label>
                  <input
                    type="text"
                    value={offNotes}
                    onChange={(e) => setOffNotes(e.target.value)}
                    placeholder="e.g. Approved standard weekly rest cycle; duties covered by Mosoti."
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
                  Confirm &amp; Save Leave Schedule
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

          {/* Leave Records Filter & Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden space-y-4">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Permanent Leave &amp; Off-Duty Audit Ledger</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  All past, active, and completed cycles are permanently recorded and remain fully editable anytime.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
                <button
                  onClick={() => setLeaveStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leaveStatusFilter === 'all' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All Logs ({staffOffRecords.length})
                </button>
                <button
                  onClick={() => setLeaveStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leaveStatusFilter === 'active' ? 'bg-white shadow text-emerald-800' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Active / Pending ({staffOffRecords.filter((r) => r.status !== 'Completed').length})
                </button>
                <button
                  onClick={() => setLeaveStatusFilter('Completed')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leaveStatusFilter === 'Completed' ? 'bg-white shadow text-slate-800' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Completed Archive ({staffOffRecords.filter((r) => r.status === 'Completed').length})
                </button>
              </div>
            </div>

            {filteredLeaveRecords.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs italic">
                No leave or off-duty entries match the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Personnel</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Departure &amp; Return</th>
                      <th className="p-4">Handover Relief</th>
                      <th className="p-4">Next Off Rotation</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredLeaveRecords.map((r) => {
                      const isCompleted = r.status === 'Completed';

                      return (
                        <tr key={r.id} className={`hover:bg-gray-50/80 transition-colors ${isCompleted ? 'bg-gray-50/40 opacity-90' : ''}`}>
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{r.staffName}</div>
                            {r.notes && <div className="text-[10px] text-gray-400 max-w-xs truncate">{r.notes}</div>}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                              {r.type}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            <div>
                              <span className="text-gray-400 text-[10px]">Departs:</span> {r.startDate}{' '}
                              {r.departureTime ? `(${r.departureTime})` : ''}
                            </div>
                            <div className="text-emerald-800 font-semibold mt-0.5">
                              <span className="text-gray-400 text-[10px]">Returns:</span> {r.endDate}{' '}
                              {r.returnTime ? `(${r.returnTime})` : ''}
                            </div>
                          </td>
                          <td className="p-4">
                            {r.handoverStaffName ? (
                              <span className="text-gray-800 font-semibold">{r.handoverStaffName}</span>
                            ) : (
                              <span className="text-gray-400 italic">Department Team</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            {r.nextScheduledOffDate ? (
                              <span className="text-indigo-900 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {r.nextScheduledOffDate}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                r.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : r.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!isCompleted && (
                                <button
                                  onClick={() => handleMarkReturned(r)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] border border-emerald-200 cursor-pointer"
                                  title="Mark Returned & Completed"
                                >
                                  Mark Returned
                                </button>
                              )}

                              {onEditStaffOffRecord && (
                                <button
                                  onClick={() => setEditingStaffOffRecord(r)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                  title="Edit Record (Always Editable)"
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
                      );
                    })}
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
                  daysOfWeek.forEach((day) => {
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
                    <th className="p-4 w-52">Personnel &amp; Unit</th>
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
                      date: dateVal || todayStr
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
                    defaultValue={todayStr}
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
      {/* MODAL: PROCESS DEPARTURE & SET NEXT ROTATION                              */}
      {/* ========================================================================= */}
      {processingDepartureRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-7 border border-amber-200 space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Process Departure &amp; Schedule Rotation</h3>
                  <p className="text-xs text-gray-500">
                    Personnel: <strong className="text-gray-900">{processingDepartureRecord.staffName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProcessingDepartureRecord(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-amber-900">
                <span className="font-bold block text-[11px]">Departure Cycle:</span>
                <p className="mt-0.5">
                  Scheduled {processingDepartureRecord.type} starting today ({processingDepartureRecord.startDate}).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Departure Time Today</label>
                  <input
                    type="text"
                    value={modalDepartureTime}
                    onChange={(e) => setModalDepartureTime(e.target.value)}
                    placeholder="e.g. 05:00 PM"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Relief / Handover Person</label>
                  <select
                    value={modalHandoverId}
                    onChange={(e) => setModalHandoverId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="">-- Team Cover --</option>
                    {staffList
                      .filter((s) => s.id !== processingDepartureRecord.staffId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.unit})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Confirmed Return Date</label>
                  <input
                    type="date"
                    value={modalReturnDate}
                    onChange={(e) => setModalReturnDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Return Time</label>
                  <input
                    type="text"
                    value={modalReturnTime}
                    onChange={(e) => setModalReturnTime(e.target.value)}
                    placeholder="e.g. 07:00 AM"
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <label className="font-bold text-indigo-950 block">Next Scheduled Off Rotation Date</label>
                <input
                  type="date"
                  value={modalNextOffDate}
                  onChange={(e) => setModalNextOffDate(e.target.value)}
                  className="w-full border border-indigo-200 rounded-xl p-2.5 font-bold text-indigo-900 bg-indigo-50/50"
                />
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={autoQueueNextOff}
                    onChange={(e) => setAutoQueueNextOff(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-gray-700 text-[11px] font-medium">
                    Automatically queue next off schedule on the roster ledger
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setProcessingDepartureRecord(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeparture}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Confirm Departure &amp; Save Rotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MONTHLY PDF REPORT & SHARE                                         */}
      {/* ========================================================================= */}
      {showMonthlyReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-7 border border-gray-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Monthly Workforce &amp; Leave Audit</h3>
              </div>
              <button onClick={() => setShowMonthlyReportModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Select Audit Month</label>
                <input
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 font-bold bg-gray-50 cursor-pointer"
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-emerald-950 space-y-1.5">
                <span className="font-bold text-[11px] block">Report Package Contents:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Workforce headcount &amp; attendance breakdown</li>
                  <li>Monthly jobs done, stations &amp; shift duties</li>
                  <li>All off-duty &amp; leave logs of the month</li>
                  <li>Wage &amp; advance disbursements ledger</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  generateMonthlyPdf('download');
                  setShowMonthlyReportModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Download size={14} />
                Download PDF Report
              </button>

              <button
                onClick={() => {
                  generateMonthlyPdf('print');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer size={14} />
                Print Directly
              </button>

              <button
                onClick={handleShareSummary}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200 cursor-pointer"
              >
                <Share2 size={14} />
                Share Summary via WhatsApp / Mobile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EMPLOYEE PROFILE DOSSIER                                           */}
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
                  Remuneration &amp; Emergency
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

            {/* Annual Leave Entitlement & Balance Dossier Card */}
            {(() => {
              const ls = getStaffAnnualLeaveStats(selectedStaffDossier.id);
              return (
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider flex items-center gap-1.5">
                      🌴 Annual Leave Balance &amp; Entitlement ({new Date().getFullYear()})
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ls.remaining > 5 ? 'bg-emerald-200 text-emerald-900' : ls.remaining > 0 ? 'bg-amber-200 text-amber-900' : 'bg-rose-200 text-rose-900'}`}>
                      {ls.remaining} Days Remaining
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                      <span className="text-[10px] text-gray-500 block">Annual Entitlement</span>
                      <strong className="text-base font-bold text-gray-900">{ls.entitlement}</strong>
                      <span className="text-[9px] text-gray-400 block">Days / Year</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                      <span className="text-[10px] text-gray-500 block">Days Taken</span>
                      <strong className="text-base font-bold text-amber-700">{ls.daysTaken}</strong>
                      <span className="text-[9px] text-gray-400 block">Days in {new Date().getFullYear()}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                      <span className="text-[10px] text-gray-500 block">Available Balance</span>
                      <strong className={`text-base font-bold ${ls.remaining > 5 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {ls.remaining}
                      </strong>
                      <span className="text-[9px] text-gray-400 block">Days Left</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-1 font-semibold">
                      <span>Usage Rate: {ls.percentageUsed}%</span>
                      <span>{ls.daysTaken} of {ls.entitlement} days used</span>
                    </div>
                    <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${ls.remaining > 5 ? 'bg-emerald-600' : ls.remaining > 0 ? 'bg-amber-500' : 'bg-rose-600'}`}
                        style={{ width: `${ls.percentageUsed}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Leave History for {selectedStaffDossier.name}</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                {staffOffRecords.filter((r) => r.staffId === selectedStaffDossier.id).length === 0 ? (
                  <div className="p-3 text-gray-400 italic text-center">No leave records registered for this member.</div>
                ) : (
                  staffOffRecords
                    .filter((r) => r.staffId === selectedStaffDossier.id)
                    .map((r) => (
                      <div key={r.id} className="p-2.5 flex justify-between items-center border-b border-gray-100 last:border-none">
                        <div>
                          <strong className="text-gray-900 mr-2">{r.type}</strong>
                          <span className="text-gray-500 font-mono text-[10px]">
                            {r.startDate} to {r.endDate}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {r.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAYSLIP GENERATOR & PREVIEW                                        */}
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

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <span className="text-xs font-semibold text-gray-600">Pay Period:</span>
              <input
                type="month"
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg p-1.5 font-bold bg-white cursor-pointer"
              />
            </div>

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
                      JR Farm
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

                  <div className="flex justify-between items-center text-[10px] text-gray-600 pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-800">Presented &amp; Approved by: Dr. Devin Omwenga (General Farm Manager)</span>
                    <span className="text-gray-400">Sign / Stamp: __________________</span>
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
      {/* MODAL: EDIT PERSONNEL DETAILS                                             */}
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
                    <option value="Fields">Fields &amp; Agronomy</option>
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
                  <label className="font-semibold text-gray-700 block mb-1">Annual Leave Entitlement (Days)</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={editingStaff.annualLeaveEntitlement !== undefined ? editingStaff.annualLeaveEntitlement : 21}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        annualLeaveEntitlement: Number(e.target.value)
                      })
                    }
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Contract Type</label>
                  <select
                    value={editingStaff.contractType || 'Permanent'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, contractType: e.target.value as any })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full bg-white font-semibold"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Fixed-term Contract</option>
                    <option value="Casual">Casual / Daily Paid</option>
                    <option value="Intern">Intern / Trainee</option>
                  </select>
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
      {/* MODAL: EDIT LEAVE SCHEDULE RECORD (ALWAYS EDITABLE)                       */}
      {/* ========================================================================= */}
      {editingStaffOffRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Edit2 size={15} className="text-indigo-600" />
                Edit Leave / Off Schedule Record
              </h3>
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
                    <option value="Completed">Completed Cycle</option>
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
                  <label className="font-semibold text-gray-700 block mb-1">Departure Time</label>
                  <input
                    type="text"
                    value={editingStaffOffRecord.departureTime || ''}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, departureTime: e.target.value })}
                    placeholder="e.g. 05:00 PM"
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">End / Return Date</label>
                  <input
                    type="date"
                    value={editingStaffOffRecord.endDate}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, endDate: e.target.value })}
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Return Time</label>
                  <input
                    type="text"
                    value={editingStaffOffRecord.returnTime || ''}
                    onChange={(e) => setEditingStaffOffRecord({ ...editingStaffOffRecord, returnTime: e.target.value })}
                    placeholder="e.g. 07:00 AM"
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Next Scheduled Off Date</label>
                  <input
                    type="date"
                    value={editingStaffOffRecord.nextScheduledOffDate || ''}
                    onChange={(e) =>
                      setEditingStaffOffRecord({ ...editingStaffOffRecord, nextScheduledOffDate: e.target.value })
                    }
                    className="border border-gray-200 rounded-xl p-2.5 w-full font-mono text-indigo-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Handover Relief Staff</label>
                  <select
                    value={editingStaffOffRecord.handoverStaffId || ''}
                    onChange={(e) => {
                      const sel = staffList.find((s) => s.id === e.target.value);
                      setEditingStaffOffRecord({
                        ...editingStaffOffRecord,
                        handoverStaffId: e.target.value,
                        handoverStaffName: sel ? sel.name : undefined
                      });
                    }}
                    className="border border-gray-200 rounded-xl p-2.5 w-full bg-white"
                  >
                    <option value="">-- None --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
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
