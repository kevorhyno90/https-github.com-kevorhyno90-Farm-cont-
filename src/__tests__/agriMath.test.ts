import { describe, it, expect } from 'vitest';
import {
  solvePearsonsSquare,
  calculateTmrMix,
  calculateMilkProductionMetrics,
  calculateFinancialSummary,
  calculateGestationAndDryOff,
  calculateSprayPhiExpiry
} from '../utils/agriMath';
import { executeSmartMerge, getItemKey } from '../utils/syncHelper';

describe('Agricultural Formula Engine (agriMath)', () => {
  describe('solvePearsonsSquare', () => {
    it('accurately solves 2-ingredient Pearson Square for Dairy 16% CP feed', () => {
      // Ingredient A: Soya Bean Meal (44% CP, cost 95/kg)
      // Ingredient B: Maize Germ Meal (11% CP, cost 35/kg)
      // Target: 16% CP, Total batch: 100kg
      const result = solvePearsonsSquare(44, 11, 16, 100, 95, 35);

      expect(result.isFeasible).toBe(true);
      // Parts A = |16 - 11| = 5
      expect(result.partsA).toBe(5);
      // Parts B = |16 - 44| = 28
      expect(result.partsB).toBe(28);
      // Total parts = 33
      expect(result.totalParts).toBe(33);

      // Pct A = (5 / 33) * 100 ~= 15.15%
      expect(result.pctA).toBeCloseTo(15.15, 1);
      // Pct B = (28 / 33) * 100 ~= 84.85%
      expect(result.pctB).toBeCloseTo(84.85, 1);

      // Total weight should be 100kg
      expect(result.kgA + result.kgB).toBeCloseTo(100, 1);

      // Final blended CP should match target 16%
      expect(result.finalCp).toBeCloseTo(16.0, 1);

      // Cost per kg should be between cost A and cost B
      expect(result.costPerKg).toBeGreaterThan(35);
      expect(result.costPerKg).toBeLessThan(95);
    });

    it('flags infeasible target when target CP is outside both ingredient ranges', () => {
      const result = solvePearsonsSquare(44, 11, 50, 100, 95, 35);
      expect(result.isFeasible).toBe(false);
      expect(result.kgA).toBe(0);
      expect(result.kgB).toBe(0);
      expect(result.message).toContain('Infeasible');
    });
  });

  describe('calculateTmrMix', () => {
    it('correctly aggregates Total Mixed Ration Dry Matter and Crude Protein', () => {
      const mix = calculateTmrMix([
        { name: 'Maize Silage', asFedKg: 20, dmPct: 35, cpPct: 8.5, costPerKg: 12 },
        { name: 'Lucerne Hay', asFedKg: 5, dmPct: 88, cpPct: 20.0, costPerKg: 40 },
        { name: 'Dairy Meal Concentrates', asFedKg: 4, dmPct: 90, cpPct: 16.0, costPerKg: 48 }
      ]);

      // Total as-fed = 20 + 5 + 4 = 29 kg
      expect(mix.totalAsFedKg).toBe(29);

      // DM: (20 * 0.35 = 7.0) + (5 * 0.88 = 4.4) + (4 * 0.90 = 3.6) = 15.0 kg DM
      expect(mix.totalDmKg).toBeCloseTo(15.0, 1);

      // Overall DM %: (15.0 / 29) * 100 = 51.72%
      expect(mix.overallDmPct).toBeCloseTo(51.72, 1);

      // CP kg: (7.0 * 0.085 = 0.595) + (4.4 * 0.20 = 0.88) + (3.6 * 0.16 = 0.576) = 2.051 kg CP
      // Overall CP % on DM basis: (2.051 / 15.0) * 100 = 13.67%
      expect(mix.overallCpPct).toBeCloseTo(13.67, 1);

      // Total batch cost: (20*12 = 240) + (5*40 = 200) + (4*48 = 192) = 632 Ksh
      expect(mix.totalBatchCost).toBe(632);
      expect(mix.costPerKgAsFed).toBeCloseTo(632 / 29, 1);
    });
  });

  describe('calculateMilkProductionMetrics', () => {
    it('calculates total yield, daily average, and session breakdowns', () => {
      const records = [
        { am: 14.5, pm: 10.5, date: '2026-10-01' },
        { am: 15.0, pm: 11.0, date: '2026-10-02' },
        { am: 16.0, pm: 11.5, date: '2026-10-03' }
      ];

      const metrics = calculateMilkProductionMetrics(records);
      expect(metrics.recordCount).toBe(3);
      expect(metrics.amTotal).toBe(45.5);
      expect(metrics.pmTotal).toBe(33.0);
      expect(metrics.totalYieldLitres).toBe(78.5);
      expect(metrics.averageDailyYield).toBeCloseTo(78.5 / 3, 1);
    });

    it('gracefully handles empty records', () => {
      const metrics = calculateMilkProductionMetrics([]);
      expect(metrics.totalYieldLitres).toBe(0);
      expect(metrics.recordCount).toBe(0);
      expect(metrics.averageDailyYield).toBe(0);
    });
  });

  describe('calculateFinancialSummary', () => {
    it('calculates total income, total expenses, net profit, and profit margin', () => {
      const records = [
        { type: 'Income', amount: 50000 },
        { type: 'Income', amount: 30000 },
        { type: 'Expense', amount: 20000 },
        { type: 'Expense', amount: 15000 }
      ];

      const summary = calculateFinancialSummary(records);
      expect(summary.totalIncome).toBe(80000);
      expect(summary.totalExpenses).toBe(35000);
      expect(summary.netProfit).toBe(45000);
      // Margin: (45000 / 80000) * 100 = 56.25%
      expect(summary.profitMarginPct).toBe(56.3);
    });
  });

  describe('calculateGestationAndDryOff', () => {
    it('projects expected calving date (283d) and dry-off date (220d)', () => {
      const serviceDate = '2026-01-01';
      const result = calculateGestationAndDryOff(serviceDate, 283, 220);

      expect(result.expectedCalvingDate).toBe('2026-10-11');
      expect(result.dryOffDate).toBe('2026-08-09');
    });
  });

  describe('calculateSprayPhiExpiry', () => {
    it('calculates future harvest eligibility based on PHI days', () => {
      const sprayDate = '2026-10-01';
      const phiDays = 14;
      const result = calculateSprayPhiExpiry(sprayDate, phiDays);

      expect(result.safeHarvestDate).toBe('2026-10-15');
    });
  });
});

describe('Data Sync & Conflict Resolution Engine (syncHelper)', () => {
  it('correctly creates unique keys for milking and generic records', () => {
    const milkItem = { id: 'COW-001', date: '2026-10-10', session: 'morning', am: 15 };
    expect(getItemKey(milkItem, 'jr_farm_milk')).toBe('milk_COW-001_2026-10-10_morning');

    const genericItem = { id: 'ITEM-123', name: 'Dairy Meal' };
    expect(getItemKey(genericItem)).toBe('ITEM-123');
  });

  it('safely merges local offline entries without discarding them if not tombstoned', () => {
    const cloudPayload = {
      jr_farm_cows: [
        { id: 'COW-001', name: 'Baraka', breed: 'Friesian', updatedAt: '2026-10-01T08:00:00Z' }
      ]
    };

    // Simulate local storage with an additional newly registered offline cow
    const originalGetItem = localStorage.getItem;
    try {
      localStorage.setItem('jr_farm_cows', JSON.stringify([
        { id: 'COW-001', name: 'Baraka', breed: 'Friesian', updatedAt: '2026-10-01T08:00:00Z' },
        { id: 'COW-002', name: 'Zawadi', breed: 'Jersey', updatedAt: '2026-10-02T10:00:00Z' }
      ]));

      const merged = executeSmartMerge(cloudPayload, 'merge');
      const mergedCows = merged['jr_farm_cows'];

      expect(mergedCows.length).toBe(2);
      expect(mergedCows.find((c: any) => c.id === 'COW-001')).toBeDefined();
      expect(mergedCows.find((c: any) => c.id === 'COW-002')).toBeDefined();
    } finally {
      localStorage.removeItem('jr_farm_cows');
    }
  });
});
