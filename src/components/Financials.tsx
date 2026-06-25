/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FinancialRecord, AIRecord, Cow, FieldRecord } from '../types';
import { 
  Coins, Plus, TrendingUp, TrendingDown, Trash2, Search, Filter, 
  BookOpen, Edit2, FileSpreadsheet, FileDown, Calendar, Sparkles, 
  AlertTriangle, DollarSign, BrainCircuit, Activity, Settings, Target, 
  ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, Table, Printer, Sliders
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface FinancialsProps {
  financialRecords: FinancialRecord[];
  onAddTransaction: (rec: FinancialRecord) => void;
  onDeleteTransaction: (id: string) => void;
  onEditFinancialRecord?: (id: string, updated: FinancialRecord) => void;
  onTriggerSectionReport?: (sectionKey: string) => void;
  cows?: Cow[];
  fields?: FieldRecord[];
}

export function Financials({ 
  financialRecords, 
  onAddTransaction, 
  onDeleteTransaction, 
  onEditFinancialRecord, 
  onTriggerSectionReport,
  cows = [],
  fields = []
}: FinancialsProps) {
  // Navigation tabs for Financials view
  const [subTab, setSubTab] = useState<'ledger' | 'analytics' | 'budgets' | 'breeding_roi' | 'granular_analysis'>('ledger');

  // Income form state
  const [incAmt, setIncAmt] = useState<number | ''>('');
  const [incSrc, setIncSrc] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);

  // Editing state
  const [editingFinancial, setEditingFinancial] = useState<FinancialRecord | null>(null);

  // Expense form state
  const [expAmt, setExpAmt] = useState<number | ''>('');
  const [expSrc, setExpSrc] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // Search/Filter state
  const [term, setTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Advanced Date Range Filtering states (Improvement 2)
  const [datePreset, setDatePreset] = useState<'all' | 'this-week' | 'this-month' | 'last-30-days' | 'last-90-days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Customizable Budget Allocations state (Improvement 3)
  const [budgetCaps, setBudgetCaps] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_exp_budget_caps');
      return saved ? JSON.parse(saved) : {
        'Animal Feed': 120000,
        'Veternary Care': 35000,
        'Sprays / Fertilizers': 50000,
        'Wages': 140000,
        'Maintenance / Fuel': 75000,
        'Store Supplies': 25000,
        'Other': 20000
      };
    } catch {
      return {
        'Animal Feed': 120000,
        'Veternary Care': 35000,
        'Sprays / Fertilizers': 50000,
        'Wages': 140000,
        'Maintenance / Fuel': 75000,
        'Store Supplies': 25000,
        'Other': 20000
      };
    }
  });

  const handleSaveBudgetCaps = (updated: Record<string, number>) => {
    setBudgetCaps(updated);
    localStorage.setItem('jr_farm_exp_budget_caps', JSON.stringify(updated));
  };

  // State to simulate or adjust active milk price/day in ROI calculations
  const [activeMarketMilkPrice, setActiveMarketMilkPrice] = useState<number>(65);
  const [granularViewMode, setGranularViewMode] = useState<'cow' | 'block'>('cow');

  // Standard submit actions
  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incAmt === '' || !incSrc.trim()) return;
    onAddTransaction({
      id: `f-${Date.now()}`,
      type: 'income',
      amount: Number(incAmt),
      category: incSrc.trim(),
      description: incDesc.trim() || 'No description set',
      date: incDate
    });
    setIncAmt('');
    setIncSrc('');
    setIncDesc('');
    setIncDate(new Date().toISOString().split('T')[0]);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmt === '' || !expSrc.trim()) return;
    onAddTransaction({
      id: `f-${Date.now()}`,
      type: 'expense',
      amount: Number(expAmt),
      category: expSrc.trim(),
      description: expDesc.trim() || 'No description set',
      date: expDate
    });
    setExpAmt('');
    setExpSrc('');
    setExpDesc('');
    setExpDate(new Date().toISOString().split('T')[0]);
  };

  // Base aggregate sums
  const totalIncome = financialRecords
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financialRecords
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netPl = totalIncome - totalExpense;

  // Process Date presets and filter logic (Improvement 2)
  const filteredRecords = useMemo(() => {
    const today = new Date();
    
    return financialRecords
      .filter((r) => {
        // Text Match
        const matchTerm = !term ||
          r.category.toLowerCase().includes(term.toLowerCase()) ||
          r.description.toLowerCase().includes(term.toLowerCase());
        
        if (!matchTerm) return false;

        // Type Match
        const matchType = typeFilter === 'all' || r.type === typeFilter;
        if (!matchType) return false;

        // Date Match
        if (datePreset === 'all') return true;

        const recTime = new Date(r.date).getTime();
        if (isNaN(recTime)) return true; // fallback for irregular dates

        const diffDays = (today.getTime() - recTime) / (1000 * 60 * 60 * 24);

        if (datePreset === 'this-week') {
          return diffDays >= 0 && diffDays <= 7;
        }
        if (datePreset === 'this-month') {
          const recDateObj = new Date(r.date);
          return recDateObj.getFullYear() === today.getFullYear() && 
                 recDateObj.getMonth() === today.getMonth();
        }
        if (datePreset === 'last-30-days') {
          return diffDays >= 0 && diffDays <= 30;
        }
        if (datePreset === 'last-90-days') {
          return diffDays >= 0 && diffDays <= 90;
        }
        if (datePreset === 'custom') {
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate).getTime();
            const end = new Date(customEndDate).getTime() + (24 * 60 * 60 * 1000); // end of day
            return recTime >= start && recTime <= end;
          }
          return true;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [financialRecords, term, typeFilter, datePreset, customStartDate, customEndDate]);

  // Aggregate monthly data for recharts timeline charts (Improvement 1)
  const monthlyChartData = useMemo(() => {
    const monthsGroup: Record<string, { month: string; income: number; expense: number; sortingKey: string }> = {};

    financialRecords.forEach((r) => {
      // Parse dates safely e.g. "2026-06-21" to "2026-06"
      const dateParts = r.date.split('-');
      if (dateParts.length < 2) return;
      const yr = dateParts[0];
      const mo = dateParts[1];
      const monthLabelObj = new Date(Number(yr), Number(mo) - 1, 1);
      const label = monthLabelObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const sortKey = `${yr}-${mo}`;

      if (!monthsGroup[label]) {
        monthsGroup[label] = { month: label, income: 0, expense: 0, sortingKey: sortKey };
      }

      if (r.type === 'income') {
        monthsGroup[label].income += r.amount;
      } else {
        monthsGroup[label].expense += r.amount;
      }
    });

    return Object.values(monthsGroup).sort((a, b) => a.sortingKey.localeCompare(b.sortingKey));
  }, [financialRecords]);

  // Aggregate Category Breakdown data for Recharts Pie charts & ratios (Improvement 1)
  const incomeCategoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    financialRecords.filter(r => r.type === 'income').forEach(r => {
      // Map customized categories to cleaner values if needed
      const category = r.category || 'Other Revenue';
      cats[category] = (cats[category] || 0) + r.amount;
    });

    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [financialRecords]);

  const expenseCategoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    financialRecords.filter(r => r.type === 'expense').forEach(r => {
      const category = r.category || 'Other Expense';
      cats[category] = (cats[category] || 0) + r.amount;
    });

    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [financialRecords]);

  // Actual budget calculation variables for Category vs Budget limits (Improvement 3)
  const catActualSpend = useMemo(() => {
    const spend: Record<string, number> = {
      'Animal Feed': 0,
      'Veternary Care': 0,
      'Sprays / Fertilizers': 0,
      'Wages': 0,
      'Maintenance / Fuel': 0,
      'Store Supplies': 0,
      'Other': 0
    };

    financialRecords.filter(r => r.type === 'expense').forEach(r => {
      let matched = false;
      Object.keys(spend).forEach(cat => {
        if (r.category === cat || (cat === 'Other' && !spend[r.category])) {
          spend[cat] = (spend[cat] || 0) + r.amount;
          matched = true;
        }
      });
      // Fallback
      if (!matched) {
        spend['Other'] += r.amount;
      }
    });

    return spend;
  }, [financialRecords]);

  // Dynamic predicted livestock/milking breeding revenues based on local cow breeding indices (Improvement 4)
  const breedingPredictionData = useMemo(() => {
    let activePregnanciesCount = 0;
    let pendingCheckServicesCount = 0;
    const upcomingCalvings: Array<{ cowId: string; cowName: string; breed: string; dueDate: string; daysLeft: number }> = [];

    try {
      const savedCows = localStorage.getItem('jr_farm_cows');
      const savedAI = localStorage.getItem('jr_farm_ai');
      
      const cows: Cow[] = savedCows ? JSON.parse(savedCows) : [];
      const aiRecords: AIRecord[] = savedAI ? JSON.parse(savedAI) : [];
      
      // Filter out double entries by taking the latest service for each cow
      const latestServiceMap: Record<string, AIRecord> = {};
      aiRecords.forEach(rec => {
        if (!latestServiceMap[rec.cowId] || latestServiceMap[rec.cowId].date < rec.date) {
          latestServiceMap[rec.cowId] = rec;
        }
      });

      Object.values(latestServiceMap).forEach((ai) => {
        const cow = cows.find(c => c.id === ai.cowId);
        const cowName = cow ? cow.name : `Cow tag ${ai.cowId}`;
        const cowBreed = cow ? cow.breed : 'Friesian Pure';

        if (ai.status === 'Confirmed Pregnant') {
          activePregnanciesCount++;
          const today = new Date();
          const dueObj = new Date(ai.due);
          const diffMs = dueObj.getTime() - today.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          
          upcomingCalvings.push({
            cowId: ai.cowId,
            cowName,
            breed: cowBreed,
            dueDate: ai.due,
            daysLeft: diffDays
          });
        } else if (ai.status === 'Pending') {
          pendingCheckServicesCount++;
        }
      });
    } catch (e) {
      console.error('Error calculating breeding ROI modeling parameters:', e);
    }

    // Sort upcoming calvings so nearest calving details show up first
    upcomingCalvings.sort((a, b) => a.daysLeft - b.daysLeft);

    // Dynamic modeling math:
    // Friesian Peak Yield target average: 28 Liters, Jersey: 19 Liters, Ayrshire: 24 Liters
    // Average lactation cycle peak period: first 90 days.
    // Calving event triggers standard commercial peak earnings projection
    let projected90DaysPeakVolume = 0;
    upcomingCalvings.forEach(c => {
      const peakDaily = c.breed.toLowerCase().includes('friesian') ? 28 : (c.breed.toLowerCase().includes('jersey') ? 19 : 24);
      projected90DaysPeakVolume += (peakDaily * 90);
    });

    const projectedPeakRevenues = projected90DaysPeakVolume * activeMarketMilkPrice;

    // Default fallbacks to prevent depressing empty screens if no local AI or Pregnancy index is generated yet
    const hasRealCows = upcomingCalvings.length > 0;
    const finalUpcoming = hasRealCows ? upcomingCalvings : [
      { cowId: 'COW-04', cowName: 'Nyaronde Blossom II', breed: 'Friesian Champion', dueDate: '2026-07-15', daysLeft: 24 },
      { cowId: 'COW-07', cowName: 'Serene Daisy', breed: 'Ayrshire cross', dueDate: '2026-08-01', daysLeft: 41 },
      { cowId: 'COW-10', cowName: 'Mocha Gold', breed: 'Jersey Classic', dueDate: '2026-08-20', daysLeft: 60 }
    ];

    const fallback90DaysVol = hasRealCows ? projected90DaysPeakVolume : (28*90 + 24*90 + 19*90);
    const fallbackPeakRevenue = hasRealCows ? projectedPeakRevenues : fallback90DaysVol * activeMarketMilkPrice;

    return {
      activePregnancies: hasRealCows ? activePregnanciesCount : 3,
      pendingServices: hasRealCows ? pendingCheckServicesCount : 2,
      upcomingCalvings: finalUpcoming,
      projectedLiters: fallback90DaysVol,
      projectedIncome: fallbackPeakRevenue,
      isSimulated: !hasRealCows
    };
  }, [activeMarketMilkPrice]);

  const granularPnlData = useMemo(() => {
    let vetRecords: any[] = [];
    let milkRecords: any[] = [];
    let aiRecords: any[] = [];
    try {
      const savedVets = localStorage.getItem('jr_farm_vets');
      if (savedVets) vetRecords = JSON.parse(savedVets);
      const savedMilk = localStorage.getItem('jr_farm_milk');
      if (savedMilk) milkRecords = JSON.parse(savedMilk);
      const savedAI = localStorage.getItem('jr_farm_ai');
      if (savedAI) aiRecords = JSON.parse(savedAI);
    } catch (e) {
      console.error(e);
    }

    const animalList = (cows && cows.length > 0) ? cows : [
      { id: 'COW-01', name: 'Zesta', breed: 'Friesian Pure', dob: '2021-04-12', status: 'Lactating', notes: 'Peak producer' },
      { id: 'COW-02', name: 'Goldie', breed: 'Jersey Grade', dob: '2022-01-05', status: 'Lactating', notes: 'High butterfat content' },
      { id: 'COW-03', name: 'Asha', breed: 'Ayrshire Cross', dob: '2022-06-18', status: 'In-Calf', notes: 'Due soon' },
      { id: 'COW-04', name: 'Ruby', breed: 'Guernsey', dob: '2023-03-22', status: 'Heifer', notes: 'Replacement stock' }
    ];

    const blockList = (fields && fields.length > 0) ? fields : [
      { id: '1', blockName: 'Block Alpha', cropType: 'Maize', acreage: 5, status: 'Growing', notes: 'Planted hybrid' },
      { id: '2', blockName: 'Block Beta', cropType: 'Napier', acreage: 3, status: 'Growing', notes: 'Under drip irrigation' },
      { id: '3', blockName: 'West Orchard', cropType: 'Avocado', acreage: 4, status: 'Growing', notes: 'Organic Hass variety' }
    ];

    const totalFeedLedgerExpense = financialRecords
      .filter(f => f.type === 'expense' && (f.category.toLowerCase().includes('feed') || f.description.toLowerCase().includes('feed')))
      .reduce((sum, f) => sum + f.amount, 0);

    const milkByCow: Record<string, number> = {};
    milkRecords.forEach(rec => {
      const tag = rec.id || rec.cowId;
      if (tag) {
        const liters = (Number(rec.am) || 0) + (Number(rec.pm) || 0);
        milkByCow[tag] = (milkByCow[tag] || 0) + liters;
      }
    });

    const vetByCow: Record<string, number> = {};
    vetRecords.forEach(rec => {
      const tag = rec.cowId;
      if (tag) {
        vetByCow[tag] = (vetByCow[tag] || 0) + (Number(rec.cost) || 0);
      }
    });

    const aiByCow: Record<string, number> = {};
    aiRecords.forEach(rec => {
      const tag = rec.cowId;
      if (tag) {
        aiByCow[tag] = (aiByCow[tag] || 0) + 1;
      }
    });

    const computedCows = animalList.map(cow => {
      const cowId = cow.id;
      
      let milkLiters = milkByCow[cowId] || 0;
      let isEstimated = false;
      if (milkLiters === 0 && cow.status === 'Lactating') {
        const dailyEst = cow.breed.toLowerCase().includes('friesian') ? 22 : (cow.breed.toLowerCase().includes('jersey') ? 14 : 18);
        milkLiters = dailyEst * 30;
        isEstimated = true;
      }

      const vetCost = vetByCow[cowId] || 0;
      const aiServices = aiByCow[cowId] || 0;
      const breedingCost = aiServices * 3000;

      let feedCost = 0;
      if (cow.status !== 'Dry') {
        if (totalFeedLedgerExpense > 0) {
          const totalCohortYield = animalList
            .filter(c => c.status === 'Lactating')
            .reduce((sum, c) => {
              let l = milkByCow[c.id] || 0;
              if (l === 0) {
                const dailyEst = c.breed.toLowerCase().includes('friesian') ? 22 : (c.breed.toLowerCase().includes('jersey') ? 14 : 18);
                l = dailyEst * 30;
              }
              return sum + l;
            }, 0);
          const share = totalCohortYield > 0 ? (milkLiters / totalCohortYield) : (1 / animalList.length);
          feedCost = totalFeedLedgerExpense * share;
        } else {
          const daysAnalyzed = 30;
          const baselineCostPerDay = cow.breed.toLowerCase().includes('friesian') ? 320 : (cow.breed.toLowerCase().includes('jersey') ? 220 : 270);
          feedCost = baselineCostPerDay * daysAnalyzed;
        }
      } else {
        feedCost = 150 * 30;
      }

      const totalCost = vetCost + feedCost + breedingCost;
      const totalRevenue = milkLiters * activeMarketMilkPrice;
      const profit = totalRevenue - totalCost;
      const copPerLiter = milkLiters > 0 ? totalCost / milkLiters : 0;
      const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      let efficiencyRating = 'Stable';
      if (cow.status === 'Lactating') {
        if (copPerLiter < 38) efficiencyRating = 'Highly Efficient (Optimal converter)';
        else if (copPerLiter <= 52) efficiencyRating = 'Acceptable (Moderate margins)';
        else efficiencyRating = 'Low Profitability (High feed overhead)';
      } else if (cow.status === 'Heifer') {
        efficiencyRating = 'Heifer (Future asset investment)';
      } else {
        efficiencyRating = 'Dry (Resting period)';
      }

      return {
        ...cow,
        milkLiters,
        vetCost,
        breedingCost,
        feedCost,
        totalCost,
        totalRevenue,
        profit,
        copPerLiter,
        marginPercent,
        efficiencyRating,
        isEstimated
      };
    });

    const computedBlocks = blockList.map(block => {
      const nameLower = block.blockName.toLowerCase();
      const cropLower = block.cropType.toLowerCase();

      let revenue = financialRecords
        .filter(f => f.type === 'income' && (
          f.description.toLowerCase().includes(nameLower) || 
          f.category.toLowerCase().includes(nameLower) ||
          f.description.toLowerCase().includes(cropLower) || 
          f.category.toLowerCase().includes(cropLower)
        ))
        .reduce((sum, f) => sum + f.amount, 0);

      let isEstimated = false;
      if (revenue === 0) {
        let revenuePerAcre = 35000;
        if (cropLower.includes('avocado')) revenuePerAcre = 110000;
        else if (cropLower.includes('napier')) revenuePerAcre = 16000;
        else if (cropLower.includes('vegetable') || cropLower.includes('tomato')) revenuePerAcre = 175000;
        else if (cropLower.includes('eucalyptus') || cropLower.includes('wood')) revenuePerAcre = 85000;
        else if (cropLower.includes('tea')) revenuePerAcre = 130000;

        revenue = revenuePerAcre * block.acreage;
        isEstimated = true;
      }

      let costs = financialRecords
        .filter(f => f.type === 'expense' && (
          f.description.toLowerCase().includes(nameLower) || 
          f.category.toLowerCase().includes(nameLower) ||
          f.description.toLowerCase().includes(cropLower) || 
          f.category.toLowerCase().includes(cropLower)
        ))
        .reduce((sum, f) => sum + f.amount, 0);

      if (costs === 0) {
        let costPerAcre = 16000;
        if (cropLower.includes('avocado')) costPerAcre = 30000;
        else if (cropLower.includes('napier')) costPerAcre = 8000;
        else if (cropLower.includes('vegetable') || cropLower.includes('tomato')) costPerAcre = 45000;
        else if (cropLower.includes('tea')) costPerAcre = 35000;

        costs = costPerAcre * block.acreage;
        isEstimated = true;
      }

      const profit = revenue - costs;
      const copPerAcre = block.acreage > 0 ? costs / block.acreage : 0;
      const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

      let efficiencyRating = 'Profitable';
      if (marginPercent > 50) efficiencyRating = 'Outstanding (Optimal yield)';
      else if (marginPercent >= 15) efficiencyRating = 'Healthy (Standard farm margin)';
      else if (marginPercent >= 0) efficiencyRating = 'Tight Break-even';
      else efficiencyRating = 'Operating at Deficit';

      return {
        ...block,
        revenue,
        costs,
        profit,
        copPerAcre,
        marginPercent,
        efficiencyRating,
        isEstimated
      };
    });

    return {
      cows: computedCows,
      blocks: computedBlocks,
      totalCowProfit: computedCows.reduce((sum, c) => sum + c.profit, 0),
      totalCowCost: computedCows.reduce((sum, c) => sum + c.totalCost, 0),
      totalCowRevenue: computedCows.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalBlockProfit: computedBlocks.reduce((sum, b) => sum + b.profit, 0),
      totalBlockCost: computedBlocks.reduce((sum, b) => sum + b.costs, 0),
      totalBlockRevenue: computedBlocks.reduce((sum, b) => sum + b.revenue, 0)
    };
  }, [cows, fields, financialRecords, activeMarketMilkPrice]);

  const downloadFinancialsCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'NYARONDE FARM ACCOUNTING LEDGER\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Date,Transaction Reference ID,Type,Category/Source,Description,Amount (Ksh)\n';
    filteredRecords.forEach((f) => {
      csv += `${f.date},"${f.id}","${f.type}","${f.category}","${f.description}",${f.amount}\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Financial_Operational_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie colors for Recharts category breakdowns
  const INCOME_COLORS = ['#0f766e', '#14b8a6', '#06b6d4', '#6366f1', '#a855f7', '#10b981'];
  const EXPENSE_COLORS = ['#be123c', '#f43f5e', '#fb7185', '#f97316', '#eab308', '#ec4899', '#6b7280'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dynamic Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-teal-100 text-teal-950 rounded-xl shrink-0">
            <BookOpen className="text-emerald-900" size={24} />
          </div>
          <div>
            <h4 className="text-slate-805 font-black text-sm uppercase tracking-wider">Estate Accounting Ledger & Analytics</h4>
            <p className="text-xs text-slate-400 font-medium">
              Monitor operational P&L in real-time, audit seasonal allocations, verify budgets, and predict breeding profitability schedules.
            </p>
          </div>
        </div>

        {onTriggerSectionReport && (
          <button
            onClick={() => onTriggerSectionReport('financials')}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 shrink-0"
            title="Export Financial Report as HTML Document"
          >
            <FileDown size={13} />
            Output HTML Audit Report
          </button>
        )}
      </div>

      {/* Sub-tab Navigation Panel */}
      <div className="flex flex-wrap gap-2.5 p-1 bg-slate-100 rounded-2xl max-w-2xl text-xs">
        <button
          onClick={() => setSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all uppercase tracking-wider m-0 border-none cursor-pointer ${
            subTab === 'ledger' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table size={14} className="text-emerald-800" />
          <span>Ledger & Loggers</span>
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all uppercase tracking-wider m-0 border-none cursor-pointer ${
            subTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 size={14} className="text-indigo-800 animate-pulse" />
          <span>Trends & Analytics</span>
        </button>

        <button
          onClick={() => setSubTab('budgets')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all uppercase tracking-wider m-0 border-none cursor-pointer ${
            subTab === 'budgets' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target size={14} className="text-rose-805" />
          <span>Capital Budgets</span>
        </button>

        <button
          onClick={() => setSubTab('breeding_roi')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all uppercase tracking-wider m-0 border-none cursor-pointer ${
            subTab === 'breeding_roi' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrainCircuit size={14} className="text-amber-800" />
          <span>Breeding Predictions</span>
        </button>

        <button
          onClick={() => setSubTab('granular_analysis')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all uppercase tracking-wider m-0 border-none cursor-pointer ${
            subTab === 'granular_analysis' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={14} className="text-teal-700" />
          <span>Granular Cost / P&L</span>
        </button>
      </div>

      {/* Interactive Main Balance Card */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border-8 border-double border-emerald-700/65 shadow-xl flex flex-col md:flex-row justify-between items-stretch gap-6 text-left">
        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
            <Coins size={12} className="animate-spin text-emerald-500" /> NYARONDE FARM ACTIVE BALANCES
          </span>
          <h1 className={`text-5xl font-black font-mono tracking-tight ${netPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Ksh {netPl.toLocaleString()}
          </h1>
          <p className="text-xs text-slate-400">Integrated audit accounting of all dynamic inputs/outgoes</p>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0 justify-stretch min-w-[280px]">
          <div className="bg-slate-800/80 border border-slate-700/40 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight size={12} className="text-emerald-400" /> Gross Earnings
            </span>
            <h3 className="text-emerald-400 font-black font-mono text-xl mt-2">+{totalIncome.toLocaleString()}</h3>
            <span className="text-[9px] text-slate-500 block pt-1 font-medium italic">Accrued credits</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/40 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ArrowDownRight size={12} className="text-rose-400" /> Aggregate Debits
            </span>
            <h3 className="text-rose-400 font-black font-mono text-xl mt-2">-{totalExpense.toLocaleString()}</h3>
            <span className="text-[9px] text-slate-500 block pt-1 font-medium italic">Accrued cash drains</span>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: Standard ledger audit records and dual loggers */}
      {subTab === 'ledger' && (
        <div className="space-y-8">
          {/* Logs Forms Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income logger */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="text-left">
                <h5 className="text-[11px] font-black tracking-widest text-emerald-950 uppercase flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-800" /> Log Income Stream
                </h5>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">Record revenue payouts, sales advances, or cash receipts</p>
              </div>

              <form onSubmit={handleIncomeSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Amount (Ksh)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={incAmt}
                    onChange={(e) => setIncAmt(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="Amount in Ksh"
                    className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-bold bg-white focus:ring-emerald-700/10 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Source / Category</label>
                    <select
                      required
                      value={incSrc}
                      onChange={(e) => setIncSrc(e.target.value)}
                      className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-semibold bg-white cursor-pointer focus:outline-none"
                    >
                      <option value="">Choose category...</option>
                      <option value="Milk Sale">Brookside Milk Deliveries</option>
                      <option value="Tea Sale">KTDA Tea Bonus/Advances</option>
                      <option value="Avocado Sale">Avocado Export Payout</option>
                      <option value="Boma Rhodes Sale">Boma Rhodes Hay Sale 🌾</option>
                      <option value="Poultry / Eggs">Flock Egg Trays Sale</option>
                      <option value="Crops Sale">Fields / Timber / Bananas</option>
                      <option value="Other Revenue">Other Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Details / Bill Notes</label>
                    <input
                      type="text"
                      required
                      value={incDesc}
                      onChange={(e) => setIncDesc(e.target.value)}
                      placeholder="E.g. Rec ref #33989"
                      className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-medium bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block mb-1">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={incDate}
                      onChange={(e) => setIncDate(e.target.value)}
                      className="text-xs border border-emerald-200 rounded-lg p-3 w-full font-bold bg-white font-mono cursor-pointer focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0 border-none cursor-pointer"
                >
                  Post Revenue Transaction
                </button>
              </form>
            </div>

            {/* Expense logger */}
            <div className="bg-rose-50 border border-rose-150 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="text-left">
                <h5 className="text-[11px] font-black tracking-widest text-rose-950 uppercase flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-rose-800" /> Log Farm Expense
                </h5>
                <p className="text-xs text-rose-700 font-medium mt-0.5">Record wages, veterinarian fees, chemical treatments, or machine repair</p>
              </div>

              <form onSubmit={handleExpenseSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Amount (Ksh)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="Amount in Ksh"
                    className="text-xs border border-rose-200 rounded-lg p-3 w-full font-bold bg-white focus:ring-rose-700/10 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Expense Category</label>
                    <select
                      required
                      value={expSrc}
                      onChange={(e) => setExpSrc(e.target.value)}
                      className="text-xs border border-rose-200 rounded-lg p-3 w-full font-semibold bg-white cursor-pointer focus:outline-none"
                    >
                      <option value="">Choose category...</option>
                      <option value="Animal Feed">Compounding Raw Feed Materials</option>
                      <option value="Veternary Care">Vet Checks / AI Semen Straws</option>
                      <option value="Sprays / Fertilizers">Chemical sprays / soil NPK bags</option>
                      <option value="Wages">Wages & Plucker Compensation</option>
                      <option value="Maintenance / Fuel">Tractor fuel & repairs</option>
                      <option value="Store Supplies">General operational tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Transaction Details</label>
                    <input
                      type="text"
                      required
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="E.g. Payee Victor advance wages"
                      className="text-xs border border-rose-200 rounded-lg p-3 w-full font-medium bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block mb-1">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="text-xs border border-rose-200 rounded-lg p-3 w-full font-bold bg-white font-mono cursor-pointer focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-rose-950 hover:bg-rose-900 text-white font-black text-xs uppercase p-3.5 rounded-xl transition-all shadow-md m-0 border-none cursor-pointer"
                >
                  Post Debit Transaction
                </button>
              </form>
            </div>
          </div>

          {/* Expanded filtering & audit trail table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h5 className="text-[11px] font-black tracking-widest text-[#0b251a] uppercase flex items-center gap-1.5">
                  <Filter size={14} className="text-teal-700" /> Operational Auditing Ledger
                </h5>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Granular drilldown of all processed accounts</p>
              </div>

              {/* Advanced Filters Panel (Improvement 2 layout) */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Text search */}
                <div className="relative w-full sm:w-44">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="text-xs border border-slate-200 bg-slate-50/50 rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:bg-white font-bold"
                  />
                </div>

                {/* Preset Picker */}
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50 focus:outline-none font-bold"
                >
                  <option value="all">All Dates Range</option>
                  <option value="this-week">This Week (7d)</option>
                  <option value="this-month">This Month</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-90-days">Last 90 Days</option>
                  <option value="custom">Custom Selector...</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50 focus:outline-none font-bold"
                >
                  <option value="all">All Ledger Flows</option>
                  <option value="income">Credits only (+)</option>
                  <option value="expense">Debits only (-)</option>
                </select>

                <button
                  onClick={downloadFinancialsCSV}
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0 shrink-0"
                  title="Download Ledger CSV"
                >
                  <FileSpreadsheet size={13} />
                  Export CSV
                </button>
                {onTriggerSectionReport && (
                  <button
                    onClick={() => onTriggerSectionReport('financials')}
                    type="button"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 border border-slate-300 text-slate-705 text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer m-0 shrink-0"
                    title="Download Financial Report"
                  >
                    <Printer size={13} />
                    Report
                  </button>
                )}
              </div>
            </div>

            {/* Custom Date selection sliders */}
            {datePreset === 'custom' && (
              <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-100/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl p-2.5 bg-white w-full font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl p-2.5 bg-white w-full font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Table layout container */}
            <div className="max-h-[400px] overflow-y-auto pr-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-black">
                    <td className="p-3">Reference Date</td>
                    <td className="p-3">Category</td>
                    <td className="p-3">Auditing Details</td>
                    <td className="p-3 text-right">Accounting Flow</td>
                    <td className="p-3 text-center">Audit</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 italic py-10">
                        No transactions qualify the current filters or custom range constraints.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                        <td className="p-3 font-mono text-slate-400 font-bold">{r.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            r.type === 'income' ? 'bg-emerald-100 text-teal-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {r.category}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600 max-w-xs truncate" title={r.description}>
                          {r.description}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-sm">
                          <span className={r.type === 'income' ? 'text-emerald-705 text-emerald-700' : 'text-rose-700'}>
                            {r.type === 'income' ? '+' : '-'} Ksh {r.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onEditFinancialRecord && (
                              <button
                                onClick={() => setEditingFinancial(r)}
                                className="text-slate-300 hover:text-indigo-800 p-2 border border-transparent hover:border-slate-200 rounded-lg transition-colors cursor-pointer m-0 bg-transparent"
                                title="Edit entry"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteTransaction(r.id)}
                              className="text-slate-300 hover:text-red-650 p-2 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer m-0 bg-transparent"
                              title="Void entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Trends and Analytics visualization panels (Improvement 1) */}
      {subTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline AreaChart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-8 space-y-4 text-left">
              <div>
                <h5 className="text-[11px] font-black tracking-widest text-[#0c2619] uppercase flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-700 animate-pulse" /> Monthly Cash Flow Trends (P&L Timeline)
                </h5>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Visualize monthly balance fluctuations and operational profit margins</p>
              </div>

              {monthlyChartData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl italic text-slate-400 text-xs">
                  Generate some ledger transactions first to populate the cashflow dashboard coordinates.
                </div>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyChartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Area type="monotone" dataKey="income" name="Earnings (Ksh)" stroke="#0f766e" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="expense" name="Expenditures (Ksh)" stroke="#e11d48" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Incomes Segmentations Breakdown pie chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-4 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div>
                  <h5 className="text-[11px] font-black tracking-widest text-[#0c2619] uppercase">Revenue Sources split</h5>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Where farm profits derive</p>
                </div>

                {incomeCategoryData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs italic">
                    No revenues posted yet
                  </div>
                ) : (
                  <div className="h-[185px] relative flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {incomeCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Legends list */}
              <div className="pt-4 border-t border-slate-100 text-[10px] space-y-1.5 font-bold uppercase tracking-wider text-slate-650">
                {incomeCategoryData.map((item, idx) => {
                  const percent = Math.round((item.value / totalIncome) * 100) || 0;
                  return (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: INCOME_COLORS[idx % INCOME_COLORS.length] }}></span>
                        <span className="truncate max-w-[120px] text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-mono text-emerald-900">{percent}% ({item.value.toLocaleString()} Ksh)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expenses categories breakdown bar charts layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <h5 className="text-[11px] font-black tracking-widest text-rose-950 uppercase">Capital Expenditures Allocation (Ksh)</h5>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Distribution of debits across farm operations</p>
              </div>

              {expenseCategoryData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-xs italic">
                  No expenditures detected.
                </div>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" tickLine={false} />
                      <YAxis fontSize={9} stroke="#94a3b8" tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#be123c" radius={[4, 4, 0, 0]}>
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">
                  Urgent Operating Margin Alert
                </span>
                <h4 className="text-lg font-black tracking-tight leading-snug">
                  Operational Cost-to-Revenue Ratio metric
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Excellent farm financial health mandates that operational costs do not exceed **40% of total farm revenues**. Currently, your farm operating ratio is:
                </p>

                <div className="bg-slate-800/80 p-5 rounded-2xl flex items-center justify-between border border-slate-705/30">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Calculated Operating Quotient</span>
                    <h2 className={`text-3xl font-black font-mono mt-1 ${
                      totalIncome === 0 ? 'text-amber-400' : ((totalExpense / totalIncome) > 0.4 ? 'text-rose-450 text-red-400' : 'text-emerald-400')
                    }`}>
                      {totalIncome === 0 ? 'Infinite (0 revs)' : `${Math.round((totalExpense / totalIncome) * 100)}%`}
                    </h2>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold text-right">Standard Threshold limit</span>
                    <span className="text-emerald-400 font-mono font-black text-right block mt-1">40% Max target</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 font-semibold leading-relaxed">
                {totalIncome === 0 ? (
                  "Please post some brookside milk payouts, avocado shipping records or tea deliveries to stabilize your ratio statistics."
                ) : (
                  (totalExpense / totalIncome) > 0.4 ? (
                    "⚠️ Attention: Your operating expenses represent a high chunk of sales! Review Feed formulation or wage allocations inside the Capital Budgets tab."
                  ) : (
                    "🎉 Healthy estate operating limits! Your costs are within standard guidelines, preserving strong dry profit margins."
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Capital Budget Allocation limits check (Improvement 3) */}
      {subTab === 'budgets' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-left">
          <div>
            <h5 className="text-[11px] font-black tracking-widest text-[#092215] uppercase flex items-center gap-1.5">
              <Target size={14} className="text-rose-800" /> Capital Allocation & Expense Budgeting
            </h5>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Set monthly maximum allocation thresholds, review actual expenditures, and isolate over-spending on-the-fly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visual Progress bar meters */}
            <div className="space-y-5">
              <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase block">
                Live Actual Spend vs Budget Limit progress (This month)
              </span>

              {Object.entries(budgetCaps).map(([category, rawCap], index) => {
                const cap = Number(rawCap);
                const actual = catActualSpend[category] || 0;
                const pct = cap > 0 ? Math.round((actual / cap) * 100) : 0;
                
                // Color mapping: green under 70%, yellow 70-100%, bright pulsing red over 100%
                const barColor = pct > 100 ? 'bg-red-600' : (pct >= 70 ? 'bg-amber-500' : 'bg-emerald-600');
                const textColor = pct > 100 ? 'text-red-700 font-black' : (pct >= 70 ? 'text-amber-700' : 'text-slate-600');

                return (
                  <div key={index} className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-805 uppercase text-[10px] tracking-wide">{category}</span>
                      <span className={`font-mono text-[11px] ${textColor}`}>
                        {actual.toLocaleString()} / {cap.toLocaleString()} Ksh ({pct}%)
                      </span>
                    </div>

                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
                      <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                    </div>

                    {pct > 100 && (
                      <div className="flex items-center gap-1 text-[9px] text-red-650 font-bold uppercase tracking-wider animate-pulse pt-0.5">
                        <AlertTriangle size={11} className="text-red-600" /> Outgoing exceeds threshold allocation cap by {(actual - cap).toLocaleString()} Ksh!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Adjuster form settings */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                ⚙️ Adjust Operational Budget Threshold Limits
              </span>
              <p className="text-[11px] text-slate-450 font-medium leading-relaxed">
                Update the maximum targeted expenditure for each category below to calibrate the visual safety indicators. Capitalized caps persist locally.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(budgetCaps).map(([category, cap], index) => (
                  <div key={index}>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase truncate" title={category}>
                      {category} (Ksh)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={cap}
                      onChange={(e) => {
                        const updated = { ...budgetCaps, [category]: parseInt(e.target.value) || 0 };
                        handleSaveBudgetCaps(updated);
                      }}
                      className="text-xs font-mono font-bold bg-white border border-slate-205 rounded-xl p-2.5 w-full focus:ring-1 focus:ring-rose-800 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-[#0e301d]/5 rounded-2xl border border-[#0e301d]/10 text-[10px] text-slate-600 uppercase font-bold leading-normal flex items-start gap-2.5">
                <Sparkles size={16} className="text-emerald-850 shrink-0 mt-0.5 animate-pulse" />
                <p>
                  Setting low budget thresholds encourages team members to formulating raw materials carefully rather than relying on commercial supplier bag products.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Predictive AI Breeding ROI and Dairy Yield projections (Improvement 4) */}
      {subTab === 'breeding_roi' && (
        <div className="space-y-8 text-left">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h5 className="text-[11px] font-black tracking-widest text-teal-900 uppercase flex items-center gap-1.5">
                    <BrainCircuit size={14} className="text-teal-700 animate-pulse" /> Dynamic Breeding ROI & Milking Projections
                  </h5>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Smart forecasting algorithm cross-linking artificial insemination timelines with upcoming lactation peak revenues.</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-950 uppercase shrink-0 flex items-center gap-1">
                  <Activity size={12} className="text-indigo-800" />
                  <span>State: {breedingPredictionData.isSimulated ? "Demo Standard Template" : "Active Farm DB Synced"}</span>
                </div>
              </div>
            </div>

            {/* Model stats grids */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Pregnant Milking Cows</span>
                <h3 className="text-2xl font-black font-mono text-emerald-900 mt-1">{breedingPredictionData.activePregnancies} Head</h3>
                <span className="text-[10px] text-slate-400 font-medium block pt-1">Calving over next 90 days</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Unchecked Cycles</span>
                <h3 className="text-2xl font-black font-mono text-indigo-950 mt-1">{breedingPredictionData.pendingServices} In-waiting</h3>
                <span className="text-[10px] text-slate-400 font-medium block pt-1">Awaiting veterinary check</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Est. Peak Lactation Yield</span>
                <h3 className="text-2xl font-black font-mono text-teal-900 mt-1">+{breedingPredictionData.projectedLiters.toLocaleString()} L</h3>
                <span className="text-[10px] text-slate-400 font-medium block pt-1">Based on breed targets (90d)</span>
              </div>

              <div className="bg-[#0f2e1e]/5 border border-[#0f2e1e]/10 p-4.5 rounded-2xl">
                <span className="text-[9px] text-emerald-850 font-black uppercase block tracking-wider">Estimated Revenue Peak</span>
                <h3 className="text-2xl font-black font-mono text-emerald-900 mt-1">Ksh {breedingPredictionData.projectedIncome.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-450 font-medium block pt-1">At Ksh {activeMarketMilkPrice}/L sale price</span>
              </div>
            </div>

            {/* Price model slider */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-black uppercase text-slate-500">Recalibrate Predicted Sales price</span>
                <span className="font-extrabold text-emerald-950 font-mono text-[11px]">Ksh {activeMarketMilkPrice} / Liter</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={activeMarketMilkPrice}
                onChange={(e) => setActiveMarketMilkPrice(Number(e.target.value))}
                className="w-full h-1 appearance-none bg-slate-200 rounded-lg cursor-pointer accent-emerald-800"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                <span>Brookside Standard (45)</span>
                <span>Premium Direct (90)</span>
              </div>
            </div>

            {/* Upcoming milestones timeline list */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider block">
                Expected Calving Schedule & Lactation Milestones
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[9.5px] uppercase font-black text-slate-400">
                      <th className="py-2.5">Cow / Breed Specimen</th>
                      <th className="py-2.5">Due Date Calibration</th>
                      <th className="py-2.5">Timeline Countdown</th>
                      <th className="py-2.5 text-right">Yield Target / Day</th>
                      <th className="py-2.5 text-right">Est. 90-day Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-650">
                    {breedingPredictionData.upcomingCalvings.map((c, i) => {
                      const daysColor = c.daysLeft <= 30 ? 'text-red-700 font-black' : (c.daysLeft <= 60 ? 'text-amber-705 text-amber-700' : 'text-slate-600');
                      const peakDaily = c.breed.toLowerCase().includes('friesian') ? 28 : (c.breed.toLowerCase().includes('jersey') ? 19 : 24);
                      const expectedSum = peakDaily * 90 * activeMarketMilkPrice;

                      return (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-3 flex flex-col">
                            <span className="font-bold text-slate-800">{c.cowName}</span>
                            <span className="text-[10px] text-slate-450 font-mono font-medium">{c.cowId} | {c.breed}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-700">{c.dueDate}</td>
                          <td className="py-3">
                            <span className={`text-[11px] font-bold ${daysColor}`}>
                              {c.daysLeft <= 0 ? '✓ Calved / Peak Lactation' : `In ${c.daysLeft} days`}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-slate-700">~{peakDaily} L/day</td>
                          <td className="py-3 text-right font-mono font-black text-emerald-950">Ksh {expectedSum.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Granular Cost of Production & Profitability per Block / Animal */}
      {subTab === 'granular_analysis' && (
        <div className="space-y-8 text-left animate-fadeIn">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                {granularViewMode === 'cow' ? 'Total Dairy Revenue' : 'Total Crop Revenue'}
              </span>
              <h3 className="text-xl font-black text-emerald-900 font-mono mt-1">
                Ksh {granularViewMode === 'cow' 
                  ? granularPnlData.totalCowRevenue.toLocaleString() 
                  : granularPnlData.totalBlockRevenue.toLocaleString()}
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                Based on active {granularViewMode === 'cow' ? `Ksh ${activeMarketMilkPrice}/L price` : 'block sales'}
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                {granularViewMode === 'cow' ? 'Total Cattle Cost' : 'Total Agronomy Cost'}
              </span>
              <h3 className="text-xl font-black text-rose-800 font-mono mt-1">
                Ksh {granularViewMode === 'cow' 
                  ? granularPnlData.totalCowCost.toLocaleString() 
                  : granularPnlData.totalBlockCost.toLocaleString()}
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                Includes {granularViewMode === 'cow' ? 'vet, feed & AI' : 'tillage, seeds & fertilizer'}
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Net Profitability
              </span>
              <h3 className="text-xl font-black text-emerald-950 font-mono mt-1">
                Ksh {granularViewMode === 'cow' 
                  ? granularPnlData.totalCowProfit.toLocaleString() 
                  : granularPnlData.totalBlockProfit.toLocaleString()}
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                Net operating margin
              </p>
            </div>

            <div className="bg-teal-950 text-white rounded-2xl p-5 border border-teal-900 shadow-sm">
              <span className="text-[10px] text-teal-300 font-extrabold uppercase tracking-wider block">
                Average Cost Efficiency
              </span>
              <h3 className="text-xl font-black font-mono mt-1">
                {granularViewMode === 'cow' ? (
                  <>Ksh {(granularPnlData.totalCowRevenue > 0 ? (granularPnlData.totalCowCost / (granularPnlData.totalCowRevenue / activeMarketMilkPrice)) : 0).toFixed(1)} <span className="text-[10px] text-teal-300 font-mono font-black">/ Liter</span></>
                ) : (
                  <>Ksh {(fields.length > 0 ? (granularPnlData.totalBlockCost / fields.reduce((sum, f) => sum + f.acreage, 0)) : 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-[10px] text-teal-300 font-mono font-black">/ Acre</span></>
                )}
              </h3>
              <p className="text-[9px] text-teal-200 font-bold uppercase tracking-wide mt-1">
                Average Cost of Production (CoP)
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 flex w-full max-w-md">
            <button
              onClick={() => setGranularViewMode('cow')}
              className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all m-0 cursor-pointer border-none ${
                granularViewMode === 'cow' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🐄 Individual Cattle (Dairy P&L)
            </button>
            <button
              onClick={() => setGranularViewMode('block')}
              className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all m-0 cursor-pointer border-none ${
                granularViewMode === 'block' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🌱 Farm Blocks (Agronomy CoP)
            </button>
          </div>

          {/* Analysis View Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Data Table */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase">
                    {granularViewMode === 'cow' ? 'Cattle Profitability Ledger' : 'Block & Crop Cost of Production Ledger'}
                  </h4>
                  <p className="text-[10.5px] text-slate-400 font-bold uppercase">
                    {granularViewMode === 'cow' ? 'Individual cow margins (past 30 days)' : 'Acreage-adjusted seasonal agronomic margins'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 text-[9.5px] uppercase font-black text-slate-400">
                      <th className="py-3">Name / Identifier</th>
                      <th className="py-3">{granularViewMode === 'cow' ? 'Yield (L)' : 'Acreage / Crop'}</th>
                      <th className="py-3 text-right">Production Cost</th>
                      <th className="py-3 text-right">Gross revenue</th>
                      <th className="py-3 text-right">Net Profit</th>
                      <th className="py-3 text-right">Cost unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                    {granularViewMode === 'cow' ? (
                      granularPnlData.cows.map((c, i) => {
                        const isProfit = c.profit >= 0;
                        const copColor = c.copPerLiter < 38 ? 'text-emerald-700 font-black' : (c.copPerLiter <= 52 ? 'text-slate-805 font-bold' : 'text-rose-700 font-black');

                        return (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-3.5 flex flex-col">
                              <span className="font-bold text-slate-900">{c.name}</span>
                              <span className="text-[9.5px] text-slate-450 font-mono uppercase">{c.id} | {c.breed}</span>
                              <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold uppercase px-1.5 py-0.5 rounded-sm mt-1 self-start">
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-slate-700">
                              {c.status === 'Lactating' ? (
                                <span className="font-bold text-slate-800">{c.milkLiters.toFixed(1)} L</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                              {c.isEstimated && (
                                <span className="block text-[8px] text-teal-655 font-black uppercase">Estimated</span>
                              )}
                            </td>
                            <td className="py-3.5 text-right font-mono text-rose-805">
                              Ksh {c.totalCost.toLocaleString(undefined, {maximumFractionDigits:0})}
                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">
                                Feed: {c.feedCost.toLocaleString(undefined, {maximumFractionDigits:0})} | Vet: {c.vetCost}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-mono text-emerald-800">
                              Ksh {c.totalRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </td>
                            <td className={`py-3.5 text-right font-mono font-black ${isProfit ? 'text-emerald-900' : 'text-rose-850'}`}>
                              {isProfit ? '+' : ''}Ksh {c.profit.toLocaleString(undefined, {maximumFractionDigits:0})}
                              <span className="block text-[9px] font-bold">
                                {c.totalRevenue > 0 ? `${c.marginPercent.toFixed(1)}% Margin` : '—'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-mono font-bold">
                              <span className={copColor}>Ksh {c.copPerLiter.toFixed(1)}</span>
                              <span className="block text-[8px] text-slate-450 font-black uppercase">per liter</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      granularPnlData.blocks.map((b, i) => {
                        const isProfit = b.profit >= 0;
                        const copColor = b.copPerAcre < 15000 ? 'text-emerald-700 font-black' : (b.copPerAcre <= 30000 ? 'text-slate-805 font-bold' : 'text-rose-700 font-black');

                        return (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-3.5 flex flex-col">
                              <span className="font-bold text-slate-900">{b.blockName}</span>
                              <span className="text-[9.5px] text-slate-455 font-mono uppercase">{b.cropType}</span>
                              <span className="text-[8px] bg-indigo-55 text-indigo-700 font-extrabold uppercase px-1.5 py-0.5 rounded-sm mt-1 self-start">
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-slate-700">
                              <span className="font-bold text-slate-800">{b.acreage} Acres</span>
                              {b.isEstimated && (
                                <span className="block text-[8px] text-teal-655 font-black uppercase">Estimated</span>
                              )}
                            </td>
                            <td className="py-3.5 text-right font-mono text-rose-805">
                              Ksh {b.costs.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </td>
                            <td className="py-3.5 text-right font-mono text-emerald-800">
                              Ksh {b.revenue.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </td>
                            <td className={`py-3.5 text-right font-mono font-black ${isProfit ? 'text-emerald-900' : 'text-rose-850'}`}>
                              {isProfit ? '+' : ''}Ksh {b.profit.toLocaleString(undefined, {maximumFractionDigits:0})}
                              <span className="block text-[9px] font-bold">
                                {b.revenue > 0 ? `${b.marginPercent.toFixed(1)}% Margin` : '—'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-mono font-bold">
                              <span className={copColor}>Ksh {b.copPerAcre.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                              <span className="block text-[8px] text-slate-455 font-black uppercase">per acre</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Visual Charts & AI Advice */}
            <div className="lg:col-span-4 space-y-6">
              {/* Chart Comparison */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  {granularViewMode === 'cow' ? 'Revenue vs Cost Comparison' : 'Block Financial Allocation'}
                </h4>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={granularViewMode === 'cow' ? granularPnlData.cows.slice(0, 5) : granularPnlData.blocks}
                      margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey={granularViewMode === 'cow' ? 'name' : 'blockName'} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(value) => `Ksh ${Number(value).toLocaleString()}`} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar name="Revenue" dataKey={granularViewMode === 'cow' ? 'totalRevenue' : 'revenue'} fill="#0f766e" radius={[4, 4, 0, 0]} />
                      <Bar name="Cost" dataKey={granularViewMode === 'cow' ? 'totalCost' : 'costs'} fill="#be123c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Diagnostic AI advice panel */}
              <div className="bg-[#0f2e1e]/5 border border-[#0f2e1e]/15 rounded-3xl p-5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wider">
                    Granular P&L Advisor Recommendation
                  </span>
                </div>
                <div className="text-xs text-emerald-950 space-y-2.5 font-semibold leading-relaxed">
                  {granularViewMode === 'cow' ? (
                    <>
                      <p>
                        • <strong>Feed Optimization Strategy:</strong> Friesian cows yielding under 18L/day should have their dairy meal limited to 4kg per day. Higher rations raise Cost of Production above the target <strong>Ksh 38/Liter</strong>.
                      </p>
                      <p>
                        • <strong>Jersey High Solids Benefit:</strong> Cows like <em>Goldie</em> have lower absolute yields but lower maintenance costs. If marketing direct to high-value processors or yoghurt markets, Jersey milk commands a 15% price premium.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        • <strong>Acreage Return Warning:</strong> Crop blocks with high nitrogen fertilizer demands (like hybrid Maize) must yield over 22 bags/acre to break even against planting costs.
                      </p>
                      <p>
                        • <strong>Drip-irrigated Napier blocks:</strong> Fodder blocks are high-yielding and serve as a cost-offsetting agent. Sourcing fodder internally reduces dairy cost of production by up to <strong>35%</strong>.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Financial Record Modal */}
      {editingFinancial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4 animate-fadeIn text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-800">Edit Transaction Flow</h3>
              <button onClick={() => setEditingFinancial(null)} className="text-slate-400 hover:text-slate-600 font-bold m-0 cursor-pointer bg-transparent border-none">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Flow Type</label>
                <select
                  value={editingFinancial.type}
                  onChange={(e) => setEditingFinancial({ ...editingFinancial, type: e.target.value as 'income' | 'expense' })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold focus:outline-none"
                >
                  <option value="income">Income (+ Record)</option>
                  <option value="expense">Expense (- Loss)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Amount (Ksh)</label>
                  <input
                    type="number"
                    value={editingFinancial.amount}
                    onChange={(e) => setEditingFinancial({ ...editingFinancial, amount: parseInt(e.target.value) || 0 })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingFinancial.date}
                    onChange={(e) => setEditingFinancial({ ...editingFinancial, date: e.target.value })}
                    className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-550 uppercase block mb-1">Source / Category</label>
                <input
                  type="text"
                  value={editingFinancial.category}
                  onChange={(e) => setEditingFinancial({ ...editingFinancial, category: e.target.value })}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-extrabold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Description</label>
                <textarea
                  value={editingFinancial.description}
                  onChange={(e) => setEditingFinancial({ ...editingFinancial, description: e.target.value })}
                  rows={2}
                  className="border border-slate-200 rounded-lg p-3 w-full text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingFinancial(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 m-0 cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEditFinancialRecord) {
                    onEditFinancialRecord(editingFinancial.id, editingFinancial);
                  }
                  setEditingFinancial(null);
                }}
                className="px-5 py-2.5 bg-indigo-950 text-white rounded-lg text-xs font-black uppercase hover:bg-indigo-900 m-0 shadow cursor-pointer border-none"
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
