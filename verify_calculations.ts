import assert from 'node:assert/strict';
import {
  solvePearsonsSquare,
  calculateTmrMix,
  calculateMilkProductionMetrics,
  calculateFinancialSummary,
  calculateGestationAndDryOff,
  calculateSprayPhiExpiry
} from './src/utils/agriMath';

console.log('--- STARTING AGRICULTURAL FORMULA VERIFICATION SUITE ---');

// Test 1: Pearson Square
const pResult = solvePearsonsSquare(44, 11, 16, 100, 95, 35);
assert.equal(pResult.isFeasible, true);
assert.equal(pResult.partsA, 5);
assert.equal(pResult.partsB, 28);
assert.equal(pResult.totalParts, 33);
assert.ok(Math.abs(pResult.kgA + pResult.kgB - 100) < 0.1);
assert.ok(Math.abs(pResult.finalCp - 16.0) < 0.1);
console.log('✓ Pearson Square solver verified successfully.');

// Test 2: Infeasible Pearson Square
const pInf = solvePearsonsSquare(44, 11, 50, 100, 95, 35);
assert.equal(pInf.isFeasible, false);
console.log('✓ Infeasible Pearson Square handling verified.');

// Test 3: Total Mixed Ration (TMR)
const tmr = calculateTmrMix([
  { name: 'Maize Silage', asFedKg: 20, dmPct: 35, cpPct: 8.5, costPerKg: 12 },
  { name: 'Lucerne Hay', asFedKg: 5, dmPct: 88, cpPct: 20.0, costPerKg: 40 },
  { name: 'Dairy Meal Concentrates', asFedKg: 4, dmPct: 90, cpPct: 16.0, costPerKg: 48 }
]);
assert.equal(tmr.totalAsFedKg, 29);
assert.ok(Math.abs(tmr.totalDmKg - 15.0) < 0.1);
assert.ok(Math.abs(tmr.overallDmPct - 51.72) < 0.1);
assert.ok(Math.abs(tmr.overallCpPct - 13.67) < 0.1);
assert.equal(tmr.totalBatchCost, 632);
console.log('✓ TMR Dry Matter & Crude Protein calculations verified.');

// Test 4: Milk Production Metrics
const milk = calculateMilkProductionMetrics([
  { am: 14.5, pm: 10.5 },
  { am: 15.0, pm: 11.0 },
  { am: 16.0, pm: 11.5 }
]);
assert.equal(milk.recordCount, 3);
assert.equal(milk.amTotal, 45.5);
assert.equal(milk.pmTotal, 33.0);
assert.equal(milk.totalYieldLitres, 78.5);
assert.ok(Math.abs(milk.averageDailyYield - 26.17) < 0.1);
console.log('✓ Milk yield aggregates & session totals verified.');

// Test 5: Financial Summary
const fin = calculateFinancialSummary([
  { type: 'Income', amount: 50000 },
  { type: 'Income', amount: 30000 },
  { type: 'Expense', amount: 20000 },
  { type: 'Expense', amount: 15000 }
]);
assert.equal(fin.totalIncome, 80000);
assert.equal(fin.totalExpenses, 35000);
assert.equal(fin.netProfit, 45000);
assert.equal(fin.profitMarginPct, 56.3);
console.log('✓ Farm P&L and profit margin calculations verified.');

// Test 6: Gestation & Dry Off
const gest = calculateGestationAndDryOff('2026-01-01', 283, 220);
assert.equal(gest.expectedCalvingDate, '2026-10-11');
assert.equal(gest.dryOffDate, '2026-08-09');
console.log('✓ Bovine gestation & dry-off projection verified.');

// Test 7: Spray PHI Expiry
const phi = calculateSprayPhiExpiry('2026-10-01', 14);
assert.equal(phi.safeHarvestDate, '2026-10-15');
console.log('✓ GlobalGAP PHI harvest clearance date verified.');

console.log('--- ALL AGRICULTURAL CALCULATIONS VERIFIED (100% PASSED) ---');
