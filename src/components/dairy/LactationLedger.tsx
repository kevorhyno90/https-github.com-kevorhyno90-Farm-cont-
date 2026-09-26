/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  MilkingRecord, MilkOutflowRecord, Cow, VetRecord,
  MorningBuyerPaymentRecord, OwnerRemittanceRecord
} from '../../types';
import { exportToCsv } from '../../utils/csvHelper';
import { jsPDF } from 'jspdf';
import { toIsoDate } from '../../utils/dateHelper';
import { DairyDashboard } from './DairyDashboard';
import {
  Plus, Download, FileSpreadsheet, Edit, Trash2, TrendingUp, Truck,
  X, Database, PenSquare, AlertTriangle, Calendar, DollarSign,
  Users, UserCheck, Heart, ShieldCheck, CheckCircle2, Clock,
  ArrowRight, Sparkles, Send, CreditCard, ChevronRight, Filter, AlertCircle
} from 'lucide-react';

interface LactationLedgerProps {
  staffList: any[];
  milkOutflows: MilkOutflowRecord[];
  aiRecords: any[];
  onTriggerSectionReport?: any;
  cows: Cow[];
  milkRecords: MilkingRecord[];
  milkOutflow?: MilkOutflowRecord[];
  onAddMilkRecord: (record: MilkingRecord) => void;
  onEditMilkRecord?: (id: string, date: string, record: MilkingRecord) => void;
  onDeleteMilkRecord: (id: string, date: string) => void;
  onAddOutflowRecord: (record: MilkOutflowRecord) => void;
  onEditMilkOutflow?: (id: string, record: MilkOutflowRecord) => void;
  onDeleteMilkOutflow?: (id: string) => void;
  vetRecords?: VetRecord[];
}

export default function LactationLedger({
  staffList = [],
  milkOutflows = [],
  aiRecords = [],
  onTriggerSectionReport,
  cows = [],
  milkRecords = [],
  onAddMilkRecord,
  onEditMilkRecord,
  onDeleteMilkRecord,
  onAddOutflowRecord,
  onEditMilkOutflow,
  onDeleteMilkOutflow,
  vetRecords = []
}: LactationLedgerProps) {

  // Active Sub-Tab Navigation inside Milk & Lactation section
  const [activeTab, setActiveTab] = useState<
    'daily_flow' | 'morning_buyer' | 'local_debts' | 'owner_remittance' | 'master_audit'
  >('daily_flow');

  const todayStr = toIsoDate();

  // ──────────────────────────────────────────────────────────────────────────
  // 1. DAILY HARVEST & ALLOCATION FORM STATE
  // ──────────────────────────────────────────────────────────────────────────
  const [date, setDate] = useState<string>(todayStr);

  // Check if selected date is Saturday
  const isSelectedSaturday = useMemo(() => {
    try {
      const d = new Date(date);
      return d.getDay() === 6; // 6 is Saturday
    } catch {
      return false;
    }
  }, [date]);

  // Production Inputs
  const [selectedCowId, setSelectedCowId] = useState<string>('');
  const [amLiters, setAmLiters] = useState<number | ''>('');
  const [pmLiters, setPmLiters] = useState<number | ''>('');
  const [milkerStaff, setMilkerStaff] = useState<string>(staffList[0]?.name || 'Dr. Devin Omwenga');

  // Morning Milk Distribution Inputs
  const [morningBuyerName, setMorningBuyerName] = useState<string>(() => {
    try {
      return localStorage.getItem('jr_farm_morning_buyer_name') || 'Mama Mary (Contract Buyer)';
    } catch {
      return 'Mama Mary (Contract Buyer)';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_morning_buyer_name', morningBuyerName);
    } catch {}
  }, [morningBuyerName]);

  const [morningBuyerLiters, setMorningBuyerLiters] = useState<number | ''>('');
  const [morningBuyerRate, setMorningBuyerRate] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_morning_buyer_rate');
      if (stored) return Number(stored) || 55;
    } catch {}
    return 55;
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_morning_buyer_rate', String(morningBuyerRate));
    } catch {}
  }, [morningBuyerRate]);

  // Quick Buyer Modal state for Friday Tracker
  const [showQuickBuyerModal, setShowQuickBuyerModal] = useState<boolean>(false);
  const [quickBuyerDate, setQuickBuyerDate] = useState<string>(todayStr);
  const [quickBuyerLiters, setQuickBuyerLiters] = useState<number | ''>('');
  const [quickBuyerRate, setQuickBuyerRate] = useState<number>(55);
  const [quickBuyerNotes, setQuickBuyerNotes] = useState<string>('');

  // Week offset for historical / future Friday reconciliations
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const [homeLiters, setHomeLiters] = useState<number | ''>('');
  const [workerLiters, setWorkerLiters] = useState<number | ''>('');
  const [calfLiters, setCalfLiters] = useState<number | ''>('');

  // Evening Milk Distribution Inputs (and Saturday morning local sales)
  const [eveningCashLiters, setEveningCashLiters] = useState<number | ''>('');
  const [eveningCashRate, setEveningCashRate] = useState<number>(60);

  const [eveningDebtLiters, setEveningDebtLiters] = useState<number | ''>('');
  const [eveningDebtRate, setEveningDebtRate] = useState<number>(60);
  const [debtCustomerName, setDebtCustomerName] = useState<string>('');

  // Spoilage / Loss
  const [spoiledLiters, setSpoiledLiters] = useState<number | ''>('');
  const [spoilageReason, setSpoilageReason] = useState<string>('Mastitis / Flakes');

  // Remittance to Owner from today's sales
  const [remittedAmount, setRemittedAmount] = useState<number | ''>('');
  const [remittanceChannel, setRemittanceChannel] = useState<'M-PESA' | 'Cash' | 'Bank'>('M-PESA');
  const [remittanceMpesaCode, setRemittanceMpesaCode] = useState<string>('');
  const [flowNotes, setFlowNotes] = useState<string>('');

  // Auto-load existing outflow data when selected date changes
  useEffect(() => {
    const existing = milkOutflows.find(o => o.date === date);
    if (existing) {
      setMorningBuyerLiters(existing.morningBuyerLiters !== undefined ? existing.morningBuyerLiters : '');
      if (existing.morningBuyerName) setMorningBuyerName(existing.morningBuyerName);
      if (existing.morningBuyerPricePerLiter) setMorningBuyerRate(existing.morningBuyerPricePerLiter);
      setHomeLiters(existing.milkUsedAtHome !== undefined ? existing.milkUsedAtHome : '');
      setWorkerLiters(existing.milkUsedByWorkers !== undefined ? existing.milkUsedByWorkers : '');
      setCalfLiters(existing.milkUsedByCalf !== undefined ? existing.milkUsedByCalf : '');
      setEveningCashLiters(existing.eveningLocalCashLiters !== undefined ? existing.eveningLocalCashLiters : '');
      if (existing.eveningCashPricePerLiter) setEveningCashRate(existing.eveningCashPricePerLiter);
      setEveningDebtLiters(existing.eveningLocalDebtLiters !== undefined ? existing.eveningLocalDebtLiters : '');
      if (existing.eveningDebtPricePerLiter) setEveningDebtRate(existing.eveningDebtPricePerLiter);
      setDebtCustomerName(existing.debtCustomer || '');
      setSpoiledLiters(existing.milkSpoiled !== undefined ? existing.milkSpoiled : '');
      if (existing.spoilageReason) setSpoilageReason(existing.spoilageReason);
      setRemittedAmount(existing.remittedToOwnerKsh !== undefined ? existing.remittedToOwnerKsh : '');
      if (existing.remittanceMethod) setRemittanceChannel(existing.remittanceMethod);
      setRemittanceMpesaCode(existing.remittanceRef || '');
      setFlowNotes(existing.notes || '');
    } else {
      setMorningBuyerLiters('');
      setHomeLiters('');
      setWorkerLiters('');
      setCalfLiters('');
      setEveningCashLiters('');
      setEveningDebtLiters('');
      setDebtCustomerName('');
      setSpoiledLiters('');
      setRemittedAmount('');
      setRemittanceMpesaCode('');
      setFlowNotes('');
    }
  }, [date, milkOutflows]);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. PERSISTENT REGISTRIES (FRIDAY BUYER, MONTHLY DEBTORS, OWNER REMITTANCES)
  // ──────────────────────────────────────────────────────────────────────────

  // Morning Buyer Friday Settlement Payments
  const [buyerPayments, setBuyerPayments] = useState<MorningBuyerPaymentRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_morning_buyer_payments');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'mbp-01',
        weekStartDate: '2026-09-15',
        weekEndDate: '2026-09-20',
        fridayPaymentDate: '2026-09-19',
        buyerName: 'Mama Mary (Morning Buyer)',
        totalLiters: 198,
        ratePerLiter: 55,
        totalAmountDue: 10890,
        amountPaid: 10890,
        status: 'Paid',
        paymentMethod: 'M-PESA',
        referenceCode: 'QKL7892JK1',
        paidOnDate: '2026-09-19',
        notes: 'Paid in full via M-PESA on Friday 10:15 AM'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_morning_buyer_payments', JSON.stringify(buyerPayments));
    } catch {}
  }, [buyerPayments]);

  // Monthly Debt Settlements
  const [debtSettlements, setDebtSettlements] = useState<{
    id: string;
    customerName: string;
    date: string;
    amountPaid: number;
    channel: 'M-PESA' | 'Cash';
    receiptRef: string;
  }[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_monthly_debt_settlements');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'mds-01',
        customerName: 'Mama Brian (Teacher)',
        date: '2026-09-02',
        amountPaid: 3600,
        channel: 'M-PESA',
        receiptRef: 'QKJ9928172'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_monthly_debt_settlements', JSON.stringify(debtSettlements));
    } catch {}
  }, [debtSettlements]);

  // Master Owner Remittances Register
  const [ownerRemittances, setOwnerRemittances] = useState<OwnerRemittanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_owner_remittances');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'rem-01',
        date: '2026-09-19',
        amountKsh: 10890,
        paymentSource: 'Morning Buyer (Friday Pay)',
        channel: 'M-PESA',
        referenceCode: 'QKL7892JK1',
        recipientName: 'Farm Owner',
        notes: 'Direct remittance of Mama Mary Friday morning settlement'
      },
      {
        id: 'rem-02',
        date: '2026-09-22',
        amountKsh: 4200,
        paymentSource: 'Evening Local Cash',
        channel: 'M-PESA',
        referenceCode: 'QKM338192X',
        recipientName: 'Farm Owner',
        notes: 'Evening cash accumulated over 3 days forwarded to owner'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jr_farm_owner_remittances', JSON.stringify(ownerRemittances));
    } catch {}
  }, [ownerRemittances]);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. EDITING MODALS STATE
  // ──────────────────────────────────────────────────────────────────────────
  const [editingMilk, setEditingMilk] = useState<MilkingRecord | null>(null);
  const [editingOutflow, setEditingOutflow] = useState<MilkOutflowRecord | null>(null);

  // Settlement Modals
  const [showFridayModal, setShowFridayModal] = useState<boolean>(false);
  const [fridayPayAmount, setFridayPayAmount] = useState<number | ''>('');
  const [fridayPayCode, setFridayPayCode] = useState<string>('');
  const [fridayPayNotes, setFridayPayNotes] = useState<string>('');

  const [showDebtClearModal, setShowDebtClearModal] = useState<boolean>(false);
  const [clearDebtorName, setClearDebtorName] = useState<string>('');
  const [clearDebtorAmount, setClearDebtorAmount] = useState<number | ''>('');
  const [clearDebtorChannel, setClearDebtorChannel] = useState<'M-PESA' | 'Cash'>('M-PESA');
  const [clearDebtorRef, setClearDebtorRef] = useState<string>('');

  const [showRemitModal, setShowRemitModal] = useState<boolean>(false);
  const [remitAmountInput, setRemitAmountInput] = useState<number | ''>('');
  const [remitSourceInput, setRemitSourceInput] = useState<OwnerRemittanceRecord['paymentSource']>('Combined Dairy Sales');
  const [remitChannelInput, setRemitChannelInput] = useState<'M-PESA' | 'Cash' | 'Bank Transfer'>('M-PESA');
  const [remitRefInput, setRemitRefInput] = useState<string>('');
  const [remitNotesInput, setRemitNotesInput] = useState<string>('');

  // Export Period State
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ──────────────────────────────────────────────────────────────────────────
  // 4. COMPUTED PRODUCTION & DISPATCH BALANCING LOGIC
  // ──────────────────────────────────────────────────────────────────────────

  // Today's milk harvest for selected date
  const dayMilkRecords = useMemo(() => {
    return milkRecords.filter(m => m.date === date);
  }, [milkRecords, date]);

  const totalDayHarvestLiters = useMemo(() => {
    return dayMilkRecords.reduce((sum, m) => sum + (m.am || 0) + (m.pm || 0), 0);
  }, [dayMilkRecords]);

  const amHarvestTotal = useMemo(() => {
    return dayMilkRecords.reduce((sum, m) => sum + (m.am || 0), 0);
  }, [dayMilkRecords]);

  const pmHarvestTotal = useMemo(() => {
    return dayMilkRecords.reduce((sum, m) => sum + (m.pm || 0), 0);
  }, [dayMilkRecords]);

  // Current Form Distributed Volumes
  const allocatedMorningBuyer = Number(morningBuyerLiters || 0);
  const allocatedHome = Number(homeLiters || 0);
  const allocatedWorkers = Number(workerLiters || 0);
  const allocatedCalf = Number(calfLiters || 0);
  const allocatedEveningCash = Number(eveningCashLiters || 0);
  const allocatedEveningDebt = Number(eveningDebtLiters || 0);
  const allocatedSpoiled = Number(spoiledLiters || 0);

  const totalAllocatedLiters = allocatedMorningBuyer + allocatedHome + allocatedWorkers +
    allocatedCalf + allocatedEveningCash + allocatedEveningDebt + allocatedSpoiled;

  const harvestBalanceDifference = totalDayHarvestLiters - totalAllocatedLiters;

  // Active Veterinary Withdrawal Warning for Cow Selection
  const activeCowWithdrawal = useMemo(() => {
    if (!selectedCowId || !vetRecords || vetRecords.length === 0) return null;
    const cowLower = selectedCowId.toLowerCase();
    for (const v of vetRecords) {
      if (!v.withdrawalMilkDays || v.withdrawalMilkDays <= 0) continue;
      const vCow = (v.cowId || '').toLowerCase();
      if (vCow === cowLower || vCow.includes(cowLower) || cowLower.includes(vCow)) {
        const treatDate = new Date(v.date);
        const safeDate = new Date(treatDate);
        safeDate.setDate(safeDate.getDate() + v.withdrawalMilkDays);
        if (safeDate >= new Date(todayStr)) {
          const daysLeft = Math.ceil((safeDate.getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
          return {
            ...v,
            safeDateStr: toIsoDate(safeDate),
            daysLeft: Math.max(0, daysLeft)
          };
        }
      }
    }
    return null;
  }, [selectedCowId, vetRecords, todayStr]);

  // ──────────────────────────────────────────────────────────────────────────
  // 5. AGGREGATED HISTORICAL METRICS (WEEKLY, MONTHLY, ANNUAL)
  // ──────────────────────────────────────────────────────────────────────────
  const startOfWeek = useMemo(() => {
    const d = new Date(todayStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
    const base = new Date(d.setDate(diff));
    return toIsoDate(base);
  }, [todayStr, weekOffset]);

  const startOfMonth = todayStr.substring(0, 8) + '01';

  const filterFn = (recDate: string) => {
    if (filterPeriod === 'today') return recDate === todayStr;
    if (filterPeriod === 'week') return recDate >= startOfWeek && recDate <= todayStr;
    if (filterPeriod === 'month') return recDate >= startOfMonth && recDate <= todayStr;
    return true;
  };

  const filteredMilks = useMemo(() => milkRecords.filter(m => filterFn(m.date)), [milkRecords, filterPeriod]);
  const filteredOutflows = useMemo(() => milkOutflows.filter(o => filterFn(o.date)), [milkOutflows, filterPeriod]);

  // Grand Totals for Filtered Period
  const totalLitersProduced = useMemo(() => {
    return filteredMilks.reduce((sum, m) => sum + (m.am || 0) + (m.pm || 0), 0);
  }, [filteredMilks]);

  const totalMorningBuyerLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.morningBuyerLiters || 0), 0);
  }, [filteredOutflows]);

  const totalEveningCashLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.eveningLocalCashLiters || 0), 0);
  }, [filteredOutflows]);

  const totalEveningDebtLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.eveningLocalDebtLiters || 0), 0);
  }, [filteredOutflows]);

  const totalHomeLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.milkUsedAtHome || 0), 0);
  }, [filteredOutflows]);

  const totalWorkerLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.milkUsedByWorkers || 0), 0);
  }, [filteredOutflows]);

  const totalCalfLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.milkUsedByCalf || 0), 0);
  }, [filteredOutflows]);

  const totalSpoiledLiters = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => sum + (o.milkSpoiled || 0), 0);
  }, [filteredOutflows]);

  const totalCashCollected = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => {
      const eveningCash = (o.eveningLocalCashLiters || 0) * (o.eveningCashPricePerLiter || 60);
      return sum + eveningCash;
    }, 0);
  }, [filteredOutflows]);

  const totalDebtAccumulated = useMemo(() => {
    return filteredOutflows.reduce((sum, o) => {
      if (o.debtsKsh) return sum + o.debtsKsh;
      return sum + (o.eveningLocalDebtLiters || 0) * (o.eveningDebtPricePerLiter || 60);
    }, 0);
  }, [filteredOutflows]);

  const totalOwnerRemitted = useMemo(() => {
    return ownerRemittances
      .filter(r => filterFn(r.date))
      .reduce((sum, r) => sum + (r.amountKsh || 0), 0);
  }, [ownerRemittances, filterPeriod]);

  // ──────────────────────────────────────────────────────────────────────────
  // 6. FRIDAY BUYER WEEKLY RECONCILIATION
  // ──────────────────────────────────────────────────────────────────────────
  const currentWeekDays = useMemo(() => {
    const days: { dateStr: string; dayName: string; isSat: boolean; isFri: boolean; liters: number; value: number }[] = [];
    const baseDate = new Date(startOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = toIsoDate(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const isSat = d.getDay() === 6;
      const isFri = d.getDay() === 5;

      const outflow = milkOutflows.find(o => o.date === dateStr);
      // Actual liters recorded for morning buyer
      const liters = outflow?.morningBuyerLiters !== undefined ? outflow.morningBuyerLiters : 0;
      const rate = outflow?.morningBuyerPricePerLiter || morningBuyerRate || 55;
      const value = liters * rate;

      days.push({ dateStr, dayName, isSat, isFri, liters, value });
    }
    return days;
  }, [startOfWeek, milkOutflows, morningBuyerRate]);

  const currentWeekBuyerLiters = currentWeekDays.reduce((sum, d) => sum + d.liters, 0);
  const currentWeekBuyerTotalDue = currentWeekDays.reduce((sum, d) => sum + d.value, 0);

  // Check if current week's Friday was paid
  const currentFridayDate = currentWeekDays.find(d => d.isFri)?.dateStr || '';
  const currentFridaySettlement = buyerPayments.find(p => p.fridayPaymentDate === currentFridayDate);

  // ──────────────────────────────────────────────────────────────────────────
  // 7. MONTHLY DEBTORS DIRECTORY COMPILATION
  // ──────────────────────────────────────────────────────────────────────────
  const debtorsDirectory = useMemo(() => {
    const map = new Map<string, { totalLiters: number; totalOwed: number; lastDate: string }>();

    milkOutflows.forEach(o => {
      // Check debtsList or single debtCustomer
      if (o.debtsList && o.debtsList.length > 0) {
        o.debtsList.forEach(d => {
          const name = d.debtor.trim();
          if (!name) return;
          const curr = map.get(name) || { totalLiters: 0, totalOwed: 0, lastDate: o.date };
          curr.totalLiters += d.liters || ((d.amount || 0) / (o.eveningDebtPricePerLiter || 60));
          curr.totalOwed += d.amount || 0;
          if (o.date > curr.lastDate) curr.lastDate = o.date;
          map.set(name, curr);
        });
      } else if (o.debtCustomer && o.debtsKsh) {
        const name = o.debtCustomer.trim();
        const curr = map.get(name) || { totalLiters: 0, totalOwed: 0, lastDate: o.date };
        curr.totalLiters += o.eveningLocalDebtLiters || (o.debtsKsh / (o.eveningDebtPricePerLiter || 60));
        curr.totalOwed += o.debtsKsh;
        if (o.date > curr.lastDate) curr.lastDate = o.date;
        map.set(name, curr);
      }
    });

    // Subtract payments recorded in debtSettlements
    debtSettlements.forEach(s => {
      const curr = map.get(s.customerName.trim());
      if (curr) {
        curr.totalOwed = Math.max(0, curr.totalOwed - s.amountPaid);
      }
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      customerName: name,
      totalLiters: data.totalLiters,
      balanceDue: data.totalOwed,
      lastDate: data.lastDate
    })).sort((a, b) => b.balanceDue - a.balanceDue);
  }, [milkOutflows, debtSettlements]);

  // ──────────────────────────────────────────────────────────────────────────
  // 8. HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  // Save Individual Cow Milking Yield
  const handleMilkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCowId.trim() || amLiters === '' || pmLiters === '') return;

    const amVal = Number(amLiters);
    const pmVal = Number(pmLiters);
    const totalYield = amVal + pmVal;

    onAddMilkRecord({
      id: selectedCowId.trim(),
      am: amVal,
      pm: pmVal,
      staff: milkerStaff,
      date: date,
      pricePerLiter: isSelectedSaturday ? eveningCashRate : morningBuyerRate,
      buyer: isSelectedSaturday ? 'Local Community Cash' : morningBuyerName,
      totalSales: totalYield * (isSelectedSaturday ? eveningCashRate : morningBuyerRate)
    });

    // Clear inputs but keep date
    setSelectedCowId('');
    setAmLiters('');
    setPmLiters('');
  };

  // Save Comprehensive Daily Milk Allocation & Dispatch
  const handleOutflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mBuyerLiters = Number(morningBuyerLiters || 0);
    const evCashLiters = Number(eveningCashLiters || 0);
    const evDebtLiters = Number(eveningDebtLiters || 0);
    const hLiters = Number(homeLiters || 0);
    const wLiters = Number(workerLiters || 0);
    const cLiters = Number(calfLiters || 0);
    const spLiters = Number(spoiledLiters || 0);

    const debtsListArray = [];
    if (debtCustomerName.trim() && evDebtLiters > 0) {
      debtsListArray.push({
        debtor: debtCustomerName.trim(),
        amount: evDebtLiters * eveningDebtRate,
        liters: evDebtLiters,
        settled: false
      });
    }

    const existing = milkOutflows.find(o => o.date === date);

    const newOutflow: MilkOutflowRecord = {
      id: existing ? existing.id : `mo-${Date.now()}`,
      date,
      totalMilkedOverride: totalDayHarvestLiters > 0 ? totalDayHarvestLiters : undefined,

      // Morning flow
      morningBuyerLiters: mBuyerLiters,
      morningBuyerName: morningBuyerName,
      morningBuyerPricePerLiter: morningBuyerRate,
      isSaturdayMorningNoBuyer: isSelectedSaturday && mBuyerLiters === 0,

      // Internal consumption
      milkUsedAtHome: hLiters,
      milkUsedByWorkers: wLiters,
      milkUsedByCalf: cLiters,

      // Evening / Local sales
      eveningLocalCashLiters: evCashLiters,
      eveningCashPricePerLiter: eveningCashRate,
      eveningLocalDebtLiters: evDebtLiters,
      eveningDebtPricePerLiter: eveningDebtRate,

      // Spoilage
      milkSpoiled: spLiters,
      spoilageReason: spLiters > 0 ? spoilageReason : undefined,

      // Debts
      debtsKsh: evDebtLiters * eveningDebtRate,
      debtCustomer: debtCustomerName.trim() || undefined,
      debtsList: debtsListArray.length > 0 ? debtsListArray : undefined,

      // Remittances to Owner
      remittedToOwnerKsh: remittedAmount !== '' ? Number(remittedAmount) : undefined,
      remittanceMethod: remittanceChannel,
      remittanceRef: remittanceMpesaCode.trim() || undefined,
      remittanceDate: remittedAmount !== '' ? date : undefined,

      salesPricePerLiter: isSelectedSaturday ? eveningCashRate : morningBuyerRate,
      notes: flowNotes.trim() || undefined
    };

    if (existing && onEditMilkOutflow) {
      onEditMilkOutflow(existing.id, newOutflow);
    } else {
      onAddOutflowRecord(newOutflow);
    }

    // If money was remitted to owner, record directly into the persistent owner remittances ledger
    if (remittedAmount !== '' && Number(remittedAmount) > 0) {
      const newRemittance: OwnerRemittanceRecord = {
        id: `rem-${Date.now()}`,
        date,
        amountKsh: Number(remittedAmount),
        paymentSource: 'Combined Dairy Sales',
        channel: remittanceChannel,
        referenceCode: remittanceMpesaCode.trim() || undefined,
        recipientName: 'Farm Owner',
        notes: `Daily dairy flow remittance for ${date}. Notes: ${flowNotes || 'All clear'}`
      };
      setOwnerRemittances(prev => [newRemittance, ...prev]);
    }
  };

  // Quick Buyer Delivery Handler from Friday Tracker
  const handleSaveQuickBuyerDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBuyerDate || quickBuyerLiters === '') return;

    const lit = Number(quickBuyerLiters);
    const existing = milkOutflows.find(o => o.date === quickBuyerDate);

    if (existing) {
      const updated: MilkOutflowRecord = {
        ...existing,
        morningBuyerLiters: lit,
        morningBuyerName: morningBuyerName,
        morningBuyerPricePerLiter: quickBuyerRate,
        isSaturdayMorningNoBuyer: false,
        notes: quickBuyerNotes ? `${existing.notes ? existing.notes + ' | ' : ''}${quickBuyerNotes}` : existing.notes
      };
      if (onEditMilkOutflow) {
        onEditMilkOutflow(existing.id, updated);
      } else {
        onAddOutflowRecord(updated);
      }
    } else {
      const newRec: MilkOutflowRecord = {
        id: `mo-${Date.now()}`,
        date: quickBuyerDate,
        morningBuyerLiters: lit,
        morningBuyerName: morningBuyerName,
        morningBuyerPricePerLiter: quickBuyerRate,
        isSaturdayMorningNoBuyer: false,
        milkUsedAtHome: 0,
        milkUsedByWorkers: 0,
        milkSpoiled: 0,
        salesPricePerLiter: quickBuyerRate,
        debtsKsh: 0,
        notes: quickBuyerNotes || 'Quick delivery entry from Friday tracker'
      };
      onAddOutflowRecord(newRec);
    }

    setShowQuickBuyerModal(false);
    setQuickBuyerLiters('');
    setQuickBuyerNotes('');
  };

  // Confirm Friday Morning Buyer Payment
  const handleConfirmFridayPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (fridayPayAmount === '') return;

    const newPayment: MorningBuyerPaymentRecord = {
      id: `mbp-${Date.now()}`,
      weekStartDate: startOfWeek,
      weekEndDate: toIsoDate(new Date(new Date(startOfWeek).getTime() + 6 * 86400000)),
      fridayPaymentDate: currentFridayDate || todayStr,
      buyerName: morningBuyerName,
      totalLiters: currentWeekBuyerLiters,
      ratePerLiter: morningBuyerRate,
      totalAmountDue: currentWeekBuyerTotalDue,
      amountPaid: Number(fridayPayAmount),
      status: Number(fridayPayAmount) >= currentWeekBuyerTotalDue ? 'Paid' : 'Partial',
      paymentMethod: 'M-PESA',
      referenceCode: fridayPayCode.trim() || undefined,
      paidOnDate: todayStr,
      notes: fridayPayNotes.trim() || 'Friday morning milk settlement payment'
    };

    setBuyerPayments(prev => [newPayment, ...prev]);

    // Automatically prompt / log owner remittance since buyer money is sent to owner
    const newRemittance: OwnerRemittanceRecord = {
      id: `rem-buyer-${Date.now()}`,
      date: todayStr,
      amountKsh: Number(fridayPayAmount),
      paymentSource: 'Morning Buyer (Friday Pay)',
      channel: 'M-PESA',
      referenceCode: fridayPayCode.trim() || undefined,
      recipientName: 'Farm Owner',
      notes: `Weekly Friday settlement received from ${morningBuyerName} forwarded to owner.`
    };
    setOwnerRemittances(prev => [newRemittance, ...prev]);

    setShowFridayModal(false);
    setFridayPayAmount('');
    setFridayPayCode('');
    setFridayPayNotes('');
  };

  // Record Monthly Customer Debt Clear / Payment
  const handleSettleCustomerDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clearDebtorName || clearDebtorAmount === '') return;

    const newSettlement = {
      id: `mds-${Date.now()}`,
      customerName: clearDebtorName,
      date: todayStr,
      amountPaid: Number(clearDebtorAmount),
      channel: clearDebtorChannel,
      receiptRef: clearDebtorRef.trim() || 'CASH'
    };

    setDebtSettlements(prev => [newSettlement, ...prev]);

    // If remitted to owner
    const newRemittance: OwnerRemittanceRecord = {
      id: `rem-debt-${Date.now()}`,
      date: todayStr,
      amountKsh: Number(clearDebtorAmount),
      paymentSource: 'Monthly Debt Collection',
      channel: clearDebtorChannel,
      referenceCode: clearDebtorRef.trim() || undefined,
      recipientName: 'Farm Owner',
      notes: `Monthly debt repayment from ${clearDebtorName} sent to owner.`
    };
    setOwnerRemittances(prev => [newRemittance, ...prev]);

    setShowDebtClearModal(false);
    setClearDebtorName('');
    setClearDebtorAmount('');
    setClearDebtorRef('');
  };

  // Manual Remit to Owner Form
  const handleManualRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (remitAmountInput === '') return;

    const newRem: OwnerRemittanceRecord = {
      id: `rem-manual-${Date.now()}`,
      date: todayStr,
      amountKsh: Number(remitAmountInput),
      paymentSource: remitSourceInput,
      channel: remitChannelInput,
      referenceCode: remitRefInput.trim() || undefined,
      recipientName: 'Farm Owner',
      notes: remitNotesInput.trim() || 'Dairy revenue remittance'
    };

    setOwnerRemittances(prev => [newRem, ...prev]);
    setShowRemitModal(false);
    setRemitAmountInput('');
    setRemitRefInput('');
    setRemitNotesInput('');
  };

  // Consolidated Master CSV Export
  const exportMasterCsv = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'JR FARM — CONSOLIDATED MILK PRODUCTION, DISPATCH & OWNER CASHFLOW LEDGER\n';
    csv += `Period: ${filterPeriod.toUpperCase()} | Generated: ${new Date().toLocaleString()}\n\n`;

    csv += 'Date,Harvest AM (L),Harvest PM (L),Total Milked (L),Morning Buyer (L),Local Cash (L),Local Debt (L),Home House (L),Workers (L),Calves (L),Spoiled (L),Spoilage Reason,Cash Sales (Ksh),Remitted to Owner (Ksh),Remittance Ref,Status\n';

    const allDates = Array.from(new Set([...filteredMilks.map(m => m.date), ...filteredOutflows.map(o => o.date)])).sort((a, b) => b.localeCompare(a));

    allDates.forEach(dStr => {
      const dMilks = filteredMilks.filter(m => m.date === dStr);
      const dOutflow = filteredOutflows.find(o => o.date === dStr);

      const am = dMilks.reduce((s, m) => s + (m.am || 0), 0);
      const pm = dMilks.reduce((s, m) => s + (m.pm || 0), 0);
      const totalM = am + pm;

      const mBuyer = dOutflow?.morningBuyerLiters || 0;
      const lCash = dOutflow?.eveningLocalCashLiters || 0;
      const lDebt = dOutflow?.eveningLocalDebtLiters || 0;
      const home = dOutflow?.milkUsedAtHome || 0;
      const work = dOutflow?.milkUsedByWorkers || 0;
      const calf = dOutflow?.milkUsedByCalf || 0;
      const sp = dOutflow?.milkSpoiled || 0;
      const spReason = dOutflow?.spoilageReason || 'None';

      const cashKsh = (mBuyer * (dOutflow?.morningBuyerPricePerLiter || 55)) + (lCash * (dOutflow?.eveningCashPricePerLiter || 60));
      const remitted = dOutflow?.remittedToOwnerKsh || 0;
      const ref = dOutflow?.remittanceRef || 'Pending';
      const balance = totalM - (mBuyer + lCash + lDebt + home + work + calf + sp);

      csv += `"${dStr}",${am.toFixed(1)},${pm.toFixed(1)},${totalM.toFixed(1)},${mBuyer.toFixed(1)},${lCash.toFixed(1)},${lDebt.toFixed(1)},${home.toFixed(1)},${work.toFixed(1)},${calf.toFixed(1)},${sp.toFixed(1)},"${spReason}",${cashKsh},${remitted},"${ref}","${balance === 0 ? 'Balanced' : balance > 0 ? `Surplus +${balance}L` : `Deficit ${balance}L`}"\n`;
    });

    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `JR_Farm_Dairy_Milk_Master_${filterPeriod}_${todayStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Master Audit PDF Export
  const exportMasterPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    const contentWidth = pageWidth - (margin * 2);

    // Header banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 12, contentWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('JR FARM — MASTER MILK HARVEST, DISPATCH & OWNER CASHFLOW', margin + 6, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Executive Audit Report | Filter Period: ${filterPeriod.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, margin + 6, 28);

    // Summary KPI box
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, 40, contentWidth, 24, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(margin, 40, contentWidth, 24, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Milk Produced: ${totalLitersProduced.toFixed(1)} Liters`, margin + 6, 48);
    doc.text(`Morning Buyer: ${totalMorningBuyerLiters.toFixed(1)} L | Local Cash: ${totalEveningCashLiters.toFixed(1)} L | Debt: ${totalEveningDebtLiters.toFixed(1)} L`, margin + 6, 54);
    doc.text(`Home: ${totalHomeLiters.toFixed(1)} L | Staff: ${totalWorkerLiters.toFixed(1)} L | Calves: ${totalCalfLiters.toFixed(1)} L | Spoiled: ${totalSpoiledLiters.toFixed(1)} L`, margin + 6, 60);

    let y = 72;
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Date', margin + 3, y + 5.5);
    doc.text('Milked (L)', margin + 26, y + 5.5);
    doc.text('Buyer (L)', margin + 50, y + 5.5);
    doc.text('Local (L)', margin + 72, y + 5.5);
    doc.text('Internal (L)', margin + 94, y + 5.5);
    doc.text('Spoiled (L)', margin + 120, y + 5.5);
    doc.text('Sales (Ksh)', margin + 144, y + 5.5);
    doc.text('To Owner', margin + 168, y + 5.5);

    y += 8;

    const allDates = Array.from(new Set([...filteredMilks.map(m => m.date), ...filteredOutflows.map(o => o.date)])).sort((a, b) => b.localeCompare(a));

    allDates.slice(0, 24).forEach((dStr, idx) => {
      const dMilks = filteredMilks.filter(m => m.date === dStr);
      const dOutflow = filteredOutflows.find(o => o.date === dStr);

      const totalM = dMilks.reduce((s, m) => s + (m.am || 0) + (m.pm || 0), 0);
      const mBuyer = dOutflow?.morningBuyerLiters || 0;
      const lCash = (dOutflow?.eveningLocalCashLiters || 0) + (dOutflow?.eveningLocalDebtLiters || 0);
      const internal = (dOutflow?.milkUsedAtHome || 0) + (dOutflow?.milkUsedByWorkers || 0) + (dOutflow?.milkUsedByCalf || 0);
      const spoiled = dOutflow?.milkSpoiled || 0;
      const cashKsh = (mBuyer * (dOutflow?.morningBuyerPricePerLiter || 55)) + ((dOutflow?.eveningLocalCashLiters || 0) * (dOutflow?.eveningCashPricePerLiter || 60));
      const remitted = dOutflow?.remittedToOwnerKsh || 0;

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 7, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      doc.text(dStr, margin + 3, y + 4.8);
      doc.text(totalM > 0 ? `${totalM.toFixed(1)} L` : '—', margin + 26, y + 4.8);
      doc.text(mBuyer > 0 ? `${mBuyer.toFixed(1)} L` : '—', margin + 50, y + 4.8);
      doc.text(lCash > 0 ? `${lCash.toFixed(1)} L` : '—', margin + 72, y + 4.8);
      doc.text(internal > 0 ? `${internal.toFixed(1)} L` : '—', margin + 94, y + 4.8);
      doc.text(spoiled > 0 ? `${spoiled.toFixed(1)} L` : '0 L', margin + 120, y + 4.8);
      doc.text(cashKsh > 0 ? `Ksh ${cashKsh.toLocaleString()}` : '—', margin + 144, y + 4.8);
      doc.text(remitted > 0 ? `Ksh ${remitted.toLocaleString()}` : 'Pending', margin + 168, y + 4.8);

      y += 7;
    });

    // Signature footer
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Verified by: Dr. Devin Omwenga (Overall Farm Manager & Vet Director)', margin + 3, y);
    doc.text('Approved by: Farm Owner & Commercial Board', margin + 110, y);

    doc.save(`JR_Farm_Master_Milk_Audit_${filterPeriod}_${todayStr}.pdf`);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 9. RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn text-gray-900">

      {/* TOP LIVE EXECUTIVE KPI STRIP */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200">
                Dairy Operations Console
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              🥛 Bovine Milk Harvest, Outflows & Owner Remittances
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Tracks morning contract buyer (pays Fridays, Sat off), evening cash/monthly debts, owner home use, worker rations, calf feeding, and owner remittances.
            </p>
          </div>

          {/* Period Filter & Report Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
              {(['today', 'week', 'month', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    filterPeriod === p
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={exportMasterCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              CSV
            </button>

            <button
              onClick={exportMasterPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download size={14} />
              Master PDF Audit
            </button>
          </div>
        </div>

        {/* 6 Key Operational KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Harvested</span>
            <span className="text-xl font-black text-gray-900 font-mono mt-0.5 block">{totalLitersProduced.toFixed(1)} L</span>
            <span className="text-[10px] text-gray-500 block">AM + PM milking</span>
          </div>

          <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Morning Buyer</span>
            <span className="text-xl font-black text-indigo-950 font-mono mt-0.5 block">{totalMorningBuyerLiters.toFixed(1)} L</span>
            <span className="text-[10px] text-indigo-600 block">Settled on Fridays</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Evening Local Cash</span>
            <span className="text-xl font-black text-emerald-950 font-mono mt-0.5 block">Ksh {totalCashCollected.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 block">{totalEveningCashLiters.toFixed(1)} L sold</span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Monthly Debts</span>
            <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">Ksh {totalDebtAccumulated.toLocaleString()}</span>
            <span className="text-[10px] text-amber-600 block">{totalEveningDebtLiters.toFixed(1)} L on credit</span>
          </div>

          <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Internal Farm Use</span>
            <span className="text-xl font-black text-purple-950 font-mono mt-0.5 block">{(totalHomeLiters + totalWorkerLiters + totalCalfLiters).toFixed(1)} L</span>
            <span className="text-[10px] text-purple-600 block">Home, staff, calves</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Remitted to Owner</span>
            <span className="text-xl font-black text-blue-950 font-mono mt-0.5 block">Ksh {totalOwnerRemitted.toLocaleString()}</span>
            <span className="text-[10px] text-blue-600 block">Sent via M-PESA</span>
          </div>
        </div>
      </div>

      {/* SUB-SECTION TAB NAVIGATION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 shadow-xs overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('daily_flow')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'daily_flow'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={14} />
            🥛 1. Daily Milking & Flow Allocation
          </button>

          <button
            onClick={() => setActiveTab('morning_buyer')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'morning_buyer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Calendar size={14} />
            🗓️ 2. Friday Morning Buyer Settlement
            {currentFridaySettlement?.status === 'Paid' ? (
              <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-800 text-[9px] rounded-full font-bold">Paid</span>
            ) : (
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] rounded-full font-bold">Friday Pay</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('local_debts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'local_debts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users size={14} />
            📒 3. Evening Local Sales & Monthly Debtors
          </button>

          <button
            onClick={() => setActiveTab('owner_remittance')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'owner_remittance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Send size={14} />
            💸 4. Money Sent to Owner (M-PESA / Cash)
          </button>

          <button
            onClick={() => setActiveTab('master_audit')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'master_audit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Database size={14} />
            📋 5. Consolidated Records & Audit
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: DAILY MILKING & COMPLETE FLOW ALLOCATION
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'daily_flow' && (
        <div className="space-y-6">

          {/* Date Selector & Saturday Notice */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-700">Select Operating Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {isSelectedSaturday ? (
              <div className="p-2.5 px-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span className="font-medium">
                  <strong>Saturday Rule Active:</strong> Morning buyer does not take milk on Saturdays. Morning milk is redirected to local cash/credit sales!
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500 font-medium">
                Standard Schedule: Morning buyer takes Sunday–Friday. Evening milk sold locally.
              </span>
            )}
          </div>

          {/* TWO MAIN INPUT CARDS: PRODUCTION HARVEST & ALLOCATION DISPATCH */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT: COW MILKING HARVEST CONSOLE (5 COLS) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-emerald-600" />
                    Milking Harvest (AM & PM)
                  </h3>
                  <p className="text-[11px] text-gray-500">Record yields per milking cow or herd batch</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Milked</span>
                  <span className="text-base font-black text-emerald-700 font-mono">{totalDayHarvestLiters.toFixed(1)} L</span>
                </div>
              </div>

              <form onSubmit={handleMilkingSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Select Registered Cow</label>
                  <select
                    required
                    value={selectedCowId}
                    onChange={(e) => setSelectedCowId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 font-bold bg-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="">-- Choose Cow --</option>
                    {cows.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} ({c.name} — {c.status})
                      </option>
                    ))}
                  </select>

                  {/* Active Veterinary Milk Withdrawal Alert */}
                  {activeCowWithdrawal && (
                    <div className="mt-2.5 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-950 flex items-start gap-2 animate-fadeIn">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-rose-700">⛔ Active Veterinary Milk Withdrawal</span>
                        <span className="leading-relaxed block mt-0.5 text-[11px]">
                          This cow received <strong>{activeCowWithdrawal.drugAdministered || activeCowWithdrawal.treatment}</strong>. Milk contains residues and CANNOT be sold until <strong>{activeCowWithdrawal.safeDateStr}</strong> ({activeCowWithdrawal.daysLeft} days left). Divert to calves or discard.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Morning Yield (AM L)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g. 14.5"
                      value={amLiters}
                      onChange={(e) => setAmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Evening Yield (PM L)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g. 11.0"
                      value={pmLiters}
                      onChange={(e) => setPmLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Milking Officer / Staff</label>
                  <select
                    value={milkerStaff}
                    onChange={(e) => setMilkerStaff(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 font-medium bg-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Record Cow Milking
                </button>
              </form>

              {/* Day Milked Cows List */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Milked Cows on {date} ({dayMilkRecords.length})</span>
                  <span className="text-[11px] text-gray-500 font-mono">AM: {amHarvestTotal.toFixed(1)}L | PM: {pmHarvestTotal.toFixed(1)}L</span>
                </div>

                {dayMilkRecords.length === 0 ? (
                  <p className="text-center py-6 text-gray-400 text-xs italic">No cow milking logged yet for this date.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {dayMilkRecords.map(m => (
                      <div key={m.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-gray-900 block">{m.id}</span>
                          <span className="text-[10px] text-gray-500">By {m.staff}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-700 text-[11px]">AM: {m.am}L | PM: {m.pm}L</span>
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {((m.am || 0) + (m.pm || 0)).toFixed(1)} L
                          </span>
                          <button
                            onClick={() => onDeleteMilkRecord(m.id, m.date)}
                            className="text-gray-400 hover:text-rose-600 cursor-pointer p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: DAILY FLOW ALLOCATION & OWNER CASH (7 COLS) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Truck size={16} className="text-indigo-600" />
                    Milk Outflow Allocation & Utilization
                  </h3>
                  <p className="text-[11px] text-gray-500">Distribute daily milk to buyer, local sales, house, staff, calves, and spoilage</p>
                </div>

                {/* Balance Status Badge */}
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                  harvestBalanceDifference === 0 && totalDayHarvestLiters > 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : harvestBalanceDifference > 0
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  {harvestBalanceDifference === 0 && totalDayHarvestLiters > 0 ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      100% Balanced ({totalAllocatedLiters.toFixed(1)}L)
                    </>
                  ) : harvestBalanceDifference > 0 ? (
                    <>
                      <AlertCircle size={14} className="text-amber-600" />
                      +{harvestBalanceDifference.toFixed(1)}L Unallocated
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} className="text-rose-600" />
                      {harvestBalanceDifference.toFixed(1)}L Over-allocated
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleOutflowSubmit} className="space-y-4">

                {/* Section A: Morning Distribution */}
                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2.5">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      ☀️ Morning Milk Allocation (Expected AM: {amHarvestTotal.toFixed(1)} L)
                    </span>
                    {isSelectedSaturday ? (
                      <span className="text-[10px] font-bold bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                        🗓️ Saturday: Routine Break (Divert to local sales or log if supplied)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Regular Supply Day (Pays Friday)
                      </span>
                    )}
                  </div>

                  {/* Regular Morning Buyer Details Card */}
                  <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">Buyer Name:</span>
                        <input
                          type="text"
                          value={morningBuyerName}
                          onChange={(e) => setMorningBuyerName(e.target.value)}
                          placeholder="Morning Buyer Name (e.g. Mama Mary)"
                          className="text-xs font-bold text-indigo-950 border-b border-transparent hover:border-indigo-300 focus:border-indigo-600 focus:outline-hidden px-1 py-0.5 w-full max-w-xs"
                          title="Click to rename regular morning buyer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelectedSaturday && (
                          <button
                            type="button"
                            onClick={() => setMorningBuyerLiters(morningBuyerLiters === 0 ? '' : 0)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              morningBuyerLiters === 0
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {morningBuyerLiters === 0 ? '✓ Saturday Off (0 L)' : 'Set Saturday Off (0 L)'}
                          </button>
                        )}
                        <span className="text-[10px] text-gray-400 font-medium">Weekly Pay: Friday</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-gray-700 block mb-1">
                          Liters Taken by {morningBuyerName || 'Morning Buyer'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="e.g. 30.0 Liters"
                            value={morningBuyerLiters}
                            onChange={(e) => setMorningBuyerLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white focus:outline-hidden focus:border-indigo-500"
                          />
                          <div className="w-32 flex items-center gap-1 px-2 border border-gray-200 rounded-xl bg-white text-xs font-mono text-gray-600 shrink-0">
                            <span>@ Ksh</span>
                            <input
                              type="number"
                              value={morningBuyerRate}
                              onChange={(e) => setMorningBuyerRate(Number(e.target.value))}
                              className="w-full font-bold outline-none"
                            />
                            <span>/L</span>
                          </div>
                        </div>
                        {morningBuyerLiters !== '' && Number(morningBuyerLiters) > 0 && (
                          <span className="text-[10px] text-indigo-700 font-mono font-bold mt-1 block">
                            Due this Friday: Ksh {((Number(morningBuyerLiters) || 0) * morningBuyerRate).toLocaleString()}
                          </span>
                        )}
                      </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">Owner House (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 2.0"
                        value={homeLiters}
                        onChange={(e) => setHomeLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">Employee / Worker Ration (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 1.5"
                        value={workerLiters}
                        onChange={(e) => setWorkerLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">Nursery Calves Intake (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 5.0"
                        value={calfLiters}
                        onChange={(e) => setCalfLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 bg-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Evening & Saturday Local Sales */}
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
                  <span className="text-xs font-bold text-emerald-950 block">
                    🌙 Evening Sales & Saturday Local Community Dispatch (Expected PM: {pmHarvestTotal.toFixed(1)} L)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Spot Cash Sales */}
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1.5">
                      <label className="text-[10px] font-bold text-emerald-900 block">Local Spot Cash Sales</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Cash Liters"
                          value={eveningCashLiters}
                          onChange={(e) => setEveningCashLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 focus:outline-hidden focus:border-emerald-500"
                        />
                        <div className="w-24 flex items-center gap-1 px-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-mono">
                          <span>@</span>
                          <input
                            type="number"
                            value={eveningCashRate}
                            onChange={(e) => setEveningCashRate(Number(e.target.value))}
                            className="w-full font-bold outline-none"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold block">
                        Cash Total: Ksh {((Number(eveningCashLiters) || 0) * eveningCashRate).toLocaleString()}
                      </span>
                    </div>

                    {/* Monthly Credit / Debt Sales */}
                    <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5">
                      <label className="text-[10px] font-bold text-amber-900 block">Monthly Customer Credit / Debt</label>
                      <input
                        type="text"
                        placeholder="Customer Name (e.g. Mama Brian)"
                        value={debtCustomerName}
                        onChange={(e) => setDebtCustomerName(e.target.value)}
                        className="w-full text-xs font-bold border border-gray-200 rounded-xl p-2 mb-1 focus:outline-hidden focus:border-amber-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Debt Liters"
                          value={eveningDebtLiters}
                          onChange={(e) => setEveningDebtLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2 focus:outline-hidden focus:border-amber-500"
                        />
                        <div className="w-24 flex items-center gap-1 px-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-mono">
                          <span>@</span>
                          <input
                            type="number"
                            value={eveningDebtRate}
                            onChange={(e) => setEveningDebtRate(Number(e.target.value))}
                            className="w-full font-bold outline-none"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-700 font-mono font-bold block">
                        Debt Added: Ksh {((Number(eveningDebtLiters) || 0) * eveningDebtRate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section C: Spoilage & Owner Remittance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Spoilage Log */}
                  <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
                    <label className="text-[11px] font-bold text-rose-900 block">⚠️ Spoiled / Rejected Milk</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Spoiled Liters"
                        value={spoiledLiters}
                        onChange={(e) => setSpoiledLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-28 text-xs font-mono font-bold border border-rose-200 rounded-xl p-2 bg-white focus:outline-hidden"
                      />
                      <select
                        value={spoilageReason}
                        onChange={(e) => setSpoilageReason(e.target.value)}
                        className="w-full text-xs border border-rose-200 rounded-xl p-2 bg-white font-medium focus:outline-hidden"
                      >
                        <option value="Mastitis / Flakes">Mastitis / Flakes</option>
                        <option value="Antibiotic Drug Residue Discard">Antibiotic Residue Discard</option>
                        <option value="Sour / Curdled / Temperature">Sour / Curdled</option>
                        <option value="Physical Spill / Dirt">Physical Spill</option>
                      </select>
                    </div>
                  </div>

                  {/* Send Today's Money to Owner */}
                  <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                    <label className="text-[11px] font-bold text-blue-950 block">💸 Money Sent to Owner (Today)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount (Ksh)"
                        value={remittedAmount}
                        onChange={(e) => setRemittedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full text-xs font-mono font-bold border border-blue-200 rounded-xl p-2 bg-white focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="M-PESA Code"
                        value={remittanceMpesaCode}
                        onChange={(e) => setRemittanceMpesaCode(e.target.value)}
                        className="w-28 text-xs font-mono border border-blue-200 rounded-xl p-2 bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Optional day notes (e.g. Mama Mary collected 35L at 7:30 AM, cash received by Mosoti)"
                    value={flowNotes}
                    onChange={(e) => setFlowNotes(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex justify-center items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Save Complete Daily Milk Flow & Allocation
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: FRIDAY MORNING BUYER SETTLEMENT TRACKER
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'morning_buyer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                    Weekly Friday Payer Account
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-lg text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setWeekOffset(prev => prev - 1)}
                      className="px-1.5 py-0.5 hover:bg-white rounded font-bold text-gray-700 cursor-pointer"
                      title="Previous Week"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className="px-2 py-0.5 hover:bg-white rounded font-bold text-gray-900 cursor-pointer text-[11px]"
                    >
                      {weekOffset === 0 ? 'Current Week' : `Week (${startOfWeek})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekOffset(prev => prev + 1)}
                      className="px-1.5 py-0.5 hover:bg-white rounded font-bold text-gray-700 cursor-pointer"
                      title="Next Week"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mt-2">
                  🗓️ {morningBuyerName} — Weekly Reconciliation
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Takes morning milk Sunday through Friday @ Ksh {morningBuyerRate}/L. Saturday rests (diverted to local). Clears payment every Friday.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="text-right bg-indigo-50 px-4 py-2.5 rounded-2xl border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-700 block uppercase">Week Total Due (Friday)</span>
                  <span className="text-xl font-black text-indigo-950 font-mono">
                    Ksh {currentWeekBuyerTotalDue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-600 block">{currentWeekBuyerLiters.toFixed(1)} Liters billed</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setQuickBuyerDate(todayStr);
                      setQuickBuyerLiters('');
                      setQuickBuyerRate(morningBuyerRate);
                      setShowQuickBuyerModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    Quick Log Day Delivery
                  </button>

                  <button
                    onClick={() => {
                      setFridayPayAmount(currentWeekBuyerTotalDue);
                      setShowFridayModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CreditCard size={14} />
                    Record Friday Payment
                  </button>
                </div>
              </div>
            </div>

            {/* Current Week Day-by-Day Table */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-800">
                  Week Harvest Deliveries ({startOfWeek} to {currentWeekDays[6]?.dateStr})
                </h4>
                <span className="text-[11px] text-gray-500">Click any day to edit or log liters</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {currentWeekDays.map(d => (
                  <div
                    key={d.dateStr}
                    className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                      d.isSat
                        ? d.liters > 0
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                        : d.isFri
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                        : d.liters > 0
                        ? 'bg-white border-emerald-200 shadow-xs'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                      <span>{d.dayName}</span>
                      {d.isSat && <span className="text-[9px] text-amber-700 bg-amber-100 px-1 rounded">SAT</span>}
                      {d.isFri && <span className="text-[9px] text-indigo-700 bg-indigo-100 px-1 rounded">PAY</span>}
                    </div>

                    <span className="text-[9px] font-mono text-gray-400 block">{d.dateStr}</span>

                    <span className="text-base font-black font-mono block">
                      {d.liters > 0 ? `${d.liters.toFixed(1)} L` : (d.isSat ? '0 L (Sat Off)' : '0.0 L')}
                    </span>

                    <span className="text-[10px] font-bold font-mono text-emerald-700 block">
                      {d.liters > 0 ? `Ksh ${d.value.toLocaleString()}` : (d.isSat ? 'Local' : '—')}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setQuickBuyerDate(d.dateStr);
                        setQuickBuyerLiters(d.liters > 0 ? d.liters : '');
                        setQuickBuyerRate(morningBuyerRate);
                        setShowQuickBuyerModal(true);
                      }}
                      className="w-full mt-1.5 py-1 text-[10px] font-bold rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <PenSquare size={10} />
                      {d.liters > 0 ? 'Edit' : '+ Log'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Friday Payments Audit History */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-900">Historical Friday Settlements & Payments</h4>
              {buyerPayments.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-6">No previous Friday payments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {buyerPayments.map(p => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">Friday: {p.fridayPaymentDate}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                          <span className="font-mono text-gray-500 text-[10px]">{p.paymentMethod}</span>
                          {p.referenceCode && (
                            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                              Ref: {p.referenceCode}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          {p.totalLiters} L @ Ksh {p.ratePerLiter}/L • Note: "{p.notes}"
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700 font-mono">
                          Ksh {p.amountPaid.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">Paid on {p.paidOnDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: EVENING LOCAL SALES & MONTHLY DEBTORS
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'local_debts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Monthly Debtors Register (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Users size={16} className="text-amber-600" />
                    Monthly Customer Debtors Accounts
                  </h3>
                  <p className="text-[11px] text-gray-500">Track local customers who take evening milk on credit and settle monthly</p>
                </div>

                <button
                  onClick={() => setShowDebtClearModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Record Debt Payment
                </button>
              </div>

              {debtorsDirectory.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-xs">No active customer debts on record. All accounts are settled.</p>
              ) : (
                <div className="space-y-2.5">
                  {debtorsDirectory.map(d => (
                    <div key={d.customerName} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-gray-900 block text-sm">👤 {d.customerName}</span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Accumulated: {d.totalLiters.toFixed(1)} Liters • Last intake: {d.lastDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-base font-black font-mono block ${d.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            Ksh {d.balanceDue.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {d.balanceDue > 0 ? 'Monthly balance due' : 'Settled in full'}
                          </span>
                        </div>

                        {d.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setClearDebtorName(d.customerName);
                              setClearDebtorAmount(d.balanceDue);
                              setShowDebtClearModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Debt Repayment Audit Log (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                💳 Monthly Debt Clearances & Collections
              </h3>

              {debtSettlements.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-xs">No monthly debt repayments logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {debtSettlements.map(s => (
                    <div key={s.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-emerald-950 block">{s.customerName}</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {s.date} via {s.channel} (Ref: {s.receiptRef})
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-800 font-mono">
                        +Ksh {s.amountPaid.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: MONEY SENT TO OWNER (M-PESA / CASH REMITTANCE)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'owner_remittance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  Owner Revenue Remittances
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-2">
                  💸 Dairy Cash Sent to Farm Owner
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  All money collected from morning contractor, local cash, and monthly debts is forwarded to the owner via M-PESA or bank.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-200 text-right">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Total Remitted to Owner</span>
                  <span className="text-xl font-black text-blue-950 font-mono">
                    Ksh {totalOwnerRemitted.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-blue-600 block">{ownerRemittances.length} transfers recorded</span>
                </div>

                <button
                  onClick={() => setShowRemitModal(true)}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Send size={15} />
                  Send Money to Owner
                </button>
              </div>
            </div>

            {/* Remittance Ledger Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800">Historical Remittance Log to Owner</h4>
              {ownerRemittances.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-xs">No owner remittances logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {ownerRemittances.map(r => (
                    <div key={r.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">{r.date}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {r.channel}
                          </span>
                          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {r.paymentSource}
                          </span>
                          {r.referenceCode && (
                            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200">
                              Ref: {r.referenceCode}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-1">
                          Recipient: {r.recipientName || 'Farm Owner'} • Notes: "{r.notes || 'No remarks'}"
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-700 font-mono">
                          Ksh {r.amountKsh.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">✅ Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 5: CONSOLIDATED RECORDS & MASTER AUDIT
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'master_audit' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Database size={16} className="text-gray-700" />
                  Consolidated Daily Production & Dispatch Records
                </h3>
                <p className="text-[11px] text-gray-500">Historical records per day across production, buyers, local sales, farm use & remittances</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by date or cow..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Daily Consolidated Rows */}
            <div className="space-y-3">
              {(() => {
                const allDates = Array.from(new Set([...filteredMilks.map(m => m.date), ...filteredOutflows.map(o => o.date)]))
                  .filter(d => searchQuery ? d.includes(searchQuery) : true)
                  .sort((a, b) => b.localeCompare(a));

                if (allDates.length === 0) {
                  return <p className="text-center py-10 text-gray-400 text-xs">No records found for the selected period.</p>;
                }

                return allDates.map(dStr => {
                  const dMilks = filteredMilks.filter(m => m.date === dStr);
                  const dOutflow = filteredOutflows.find(o => o.date === dStr);

                  const totalM = dMilks.reduce((s, m) => s + (m.am || 0) + (m.pm || 0), 0);
                  const mBuyer = dOutflow?.morningBuyerLiters || 0;
                  const lCash = dOutflow?.eveningLocalCashLiters || 0;
                  const lDebt = dOutflow?.eveningLocalDebtLiters || 0;
                  const home = dOutflow?.milkUsedAtHome || 0;
                  const work = dOutflow?.milkUsedByWorkers || 0;
                  const calf = dOutflow?.milkUsedByCalf || 0;
                  const sp = dOutflow?.milkSpoiled || 0;

                  const totalDispatched = mBuyer + lCash + lDebt + home + work + calf + sp;
                  const diff = totalM - totalDispatched;

                  const cashKsh = (mBuyer * (dOutflow?.morningBuyerPricePerLiter || 55)) + (lCash * (dOutflow?.eveningCashPricePerLiter || 60));
                  const remitted = dOutflow?.remittedToOwnerKsh || 0;

                  return (
                    <div key={dStr} className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-gray-900 font-mono">{dStr}</span>
                          <span className="text-[11px] text-gray-500">
                            ({new Date(dStr).toLocaleDateString('en-US', { weekday: 'short' })})
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            diff === 0 && totalM > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {diff === 0 && totalM > 0 ? '100% Balanced' : diff > 0 ? `+${diff.toFixed(1)}L Surplus` : `${diff.toFixed(1)}L Deficit`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-gray-700">Harvest: {totalM.toFixed(1)} L</span>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Sales: Ksh {cashKsh.toLocaleString()}
                          </span>
                          {remitted > 0 && (
                            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Remitted: Ksh {remitted.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Distribution Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Morning Buyer</span>
                          <span className="font-bold text-indigo-900 font-mono">{mBuyer > 0 ? `${mBuyer} L` : '0 L'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Local Cash</span>
                          <span className="font-bold text-emerald-900 font-mono">{lCash > 0 ? `${lCash} L` : '0 L'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Monthly Debt</span>
                          <span className="font-bold text-amber-900 font-mono">{lDebt > 0 ? `${lDebt} L` : '0 L'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Owner House</span>
                          <span className="font-bold text-purple-900 font-mono">{home > 0 ? `${home} L` : '0 L'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Staff Ration</span>
                          <span className="font-bold text-gray-800 font-mono">{work > 0 ? `${work} L` : '0 L'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Calves Fed</span>
                          <span className="font-bold text-blue-900 font-mono">{calf > 0 ? `${calf} L` : '0 L'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Spoiled</span>
                          <span className="font-bold text-rose-700 font-mono">{sp > 0 ? `${sp} L` : '0 L'}</span>
                        </div>
                      </div>

                      {dOutflow?.notes && (
                        <p className="text-[11px] text-gray-500 italic bg-white p-2 rounded-xl border border-gray-100">
                          Note: "{dOutflow.notes}"
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: RECORD FRIDAY MORNING BUYER PAYMENT
      ────────────────────────────────────────────────────────────────────────── */}
      {showFridayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <CreditCard size={16} className="text-indigo-600" />
                Record Friday Buyer Payment
              </h3>
              <button onClick={() => setShowFridayModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmFridayPayment} className="space-y-3.5 text-xs">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Contract Buyer</span>
                <span className="font-bold text-sm text-indigo-950 block">{morningBuyerName}</span>
                <span className="text-[11px] text-indigo-600 block mt-0.5">
                  Week volume: {currentWeekBuyerLiters.toFixed(1)} L • Expected Total: Ksh {currentWeekBuyerTotalDue.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Payment Amount Received (Ksh)</label>
                <input
                  type="number"
                  required
                  value={fridayPayAmount}
                  onChange={(e) => setFridayPayAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full text-sm font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">M-PESA / Receipt Reference Code</label>
                <input
                  type="text"
                  placeholder="e.g. QKL99382JK1"
                  value={fridayPayCode}
                  onChange={(e) => setFridayPayCode(e.target.value)}
                  className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Settlement Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared full week in morning M-PESA"
                  value={fridayPayNotes}
                  onChange={(e) => setFridayPayNotes(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFridayModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Friday Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: QUICK LOG / EDIT MORNING BUYER DELIVERY
      ────────────────────────────────────────────────────────────────────────── */}
      {showQuickBuyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <PenSquare size={16} className="text-indigo-600" />
                Log Morning Delivery for {morningBuyerName}
              </h3>
              <button onClick={() => setShowQuickBuyerModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickBuyerDelivery} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Delivery Date</label>
                <input
                  type="date"
                  required
                  value={quickBuyerDate}
                  onChange={(e) => setQuickBuyerDate(e.target.value)}
                  className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Liters Taken (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    placeholder="e.g. 34.0"
                    value={quickBuyerLiters}
                    onChange={(e) => setQuickBuyerLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full text-sm font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Price / Liter (Ksh)</label>
                  <input
                    type="number"
                    required
                    value={quickBuyerRate}
                    onChange={(e) => setQuickBuyerRate(Number(e.target.value))}
                    className="w-full text-sm font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {quickBuyerLiters !== '' && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-900">Total Billed for this Day:</span>
                  <span className="font-mono font-black text-indigo-950 text-sm">
                    Ksh {((Number(quickBuyerLiters) || 0) * quickBuyerRate).toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Delivery Note</label>
                <input
                  type="text"
                  placeholder="e.g. Collected 7:30 AM by buyer"
                  value={quickBuyerNotes}
                  onChange={(e) => setQuickBuyerNotes(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickBuyerModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  Save Delivery Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: RECORD MONTHLY DEBT PAYMENT
      ────────────────────────────────────────────────────────────────────────── */}
      {showDebtClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Users size={16} className="text-amber-600" />
                Clear Monthly Customer Debt
              </h3>
              <button onClick={() => setShowDebtClearModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSettleCustomerDebt} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Customer / Debtor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mama Brian"
                  value={clearDebtorName}
                  onChange={(e) => setClearDebtorName(e.target.value)}
                  className="w-full text-xs font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Payment Amount (Ksh)</label>
                <input
                  type="number"
                  required
                  value={clearDebtorAmount}
                  onChange={(e) => setClearDebtorAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full text-sm font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Channel</label>
                  <select
                    value={clearDebtorChannel}
                    onChange={(e) => setClearDebtorChannel(e.target.value as any)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-white font-medium focus:outline-hidden"
                  >
                    <option value="M-PESA">M-PESA</option>
                    <option value="Cash">Cash Handover</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Receipt / Code</label>
                  <input
                    type="text"
                    placeholder="M-PESA code or Cash receipt"
                    value={clearDebtorRef}
                    onChange={(e) => setClearDebtorRef(e.target.value)}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDebtClearModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Clear Customer Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: SEND MONEY TO OWNER
      ────────────────────────────────────────────────────────────────────────── */}
      {showRemitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Send size={16} className="text-blue-600" />
                Forward Dairy Revenue to Owner
              </h3>
              <button onClick={() => setShowRemitModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleManualRemittance} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Amount Sent (Ksh)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={remitAmountInput}
                  onChange={(e) => setRemitAmountInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full text-base font-mono font-bold border border-gray-200 rounded-xl p-2.5 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Source of Funds</label>
                <select
                  value={remitSourceInput}
                  onChange={(e) => setRemitSourceInput(e.target.value as any)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-white font-medium focus:outline-hidden"
                >
                  <option value="Combined Dairy Sales">Combined Dairy Sales</option>
                  <option value="Morning Buyer (Friday Pay)">Morning Buyer (Friday Pay)</option>
                  <option value="Evening Local Cash">Evening Local Cash</option>
                  <option value="Monthly Debt Collection">Monthly Debt Collection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Transfer Method</label>
                  <select
                    value={remitChannelInput}
                    onChange={(e) => setRemitChannelInput(e.target.value as any)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-white font-medium focus:outline-hidden"
                  >
                    <option value="M-PESA">M-PESA</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">M-PESA / Tx Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. QKL88192A"
                    value={remitRefInput}
                    onChange={(e) => setRemitRefInput(e.target.value)}
                    className="w-full text-xs font-mono border border-gray-200 rounded-xl p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Sent to Owner line 0722XXXXXX"
                  value={remitNotesInput}
                  onChange={(e) => setRemitNotesInput(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRemitModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Record Remittance to Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}