/**
 * Agricultural & Farm Management Calculation Engines
 * Verified mathematical formulas for Livestock Nutrition, Dairy, Crop Spraying, and Farm Economics
 */

export interface PearsonsSquareResult {
  isFeasible: boolean;
  message?: string;
  partsA: number;
  partsB: number;
  totalParts: number;
  pctA: number;
  pctB: number;
  kgA: number;
  kgB: number;
  finalCp: number;
  totalCost: number;
  costPerKg: number;
}

/**
 * Solves standard agricultural Pearson's Square for blending two feed ingredients to achieve a target Crude Protein (CP) %
 */
export function solvePearsonsSquare(
  cpA: number,
  cpB: number,
  targetCp: number,
  totalWeightKg: number = 100,
  costA: number = 0,
  costB: number = 0
): PearsonsSquareResult {
  // Target must strictly lie between the two ingredient protein contents
  const isFeasible = (targetCp > cpA && targetCp < cpB) || (targetCp > cpB && targetCp < cpA);

  if (!isFeasible) {
    return {
      isFeasible: false,
      message: `Infeasible: Target CP (${targetCp}%) must be between Ingredient A (${cpA}%) and Ingredient B (${cpB}%).`,
      partsA: 0,
      partsB: 0,
      totalParts: 0,
      pctA: 0,
      pctB: 0,
      kgA: 0,
      kgB: 0,
      finalCp: 0,
      totalCost: 0,
      costPerKg: 0
    };
  }

  // Parts of A = |target - CP_B|
  // Parts of B = |target - CP_A|
  const partsA = Math.abs(targetCp - cpB);
  const partsB = Math.abs(targetCp - cpA);
  const totalParts = partsA + partsB;

  const pctA = (partsA / totalParts) * 100;
  const pctB = (partsB / totalParts) * 100;

  const kgA = (partsA / totalParts) * totalWeightKg;
  const kgB = (partsB / totalParts) * totalWeightKg;

  const finalCp = (kgA * cpA + kgB * cpB) / totalWeightKg;
  const totalCost = kgA * costA + kgB * costB;
  const costPerKg = totalWeightKg > 0 ? totalCost / totalWeightKg : 0;

  return {
    isFeasible: true,
    partsA: Number(partsA.toFixed(2)),
    partsB: Number(partsB.toFixed(2)),
    totalParts: Number(totalParts.toFixed(2)),
    pctA: Number(pctA.toFixed(2)),
    pctB: Number(pctB.toFixed(2)),
    kgA: Number(kgA.toFixed(2)),
    kgB: Number(kgB.toFixed(2)),
    finalCp: Number(finalCp.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    costPerKg: Number(costPerKg.toFixed(2))
  };
}

export interface TmrIngredientInput {
  name: string;
  asFedKg: number;
  dmPct: number;    // e.g. 35 for 35% Dry Matter
  cpPct: number;    // Crude Protein % on DM basis
  costPerKg: number;
}

export interface TmrMixResult {
  totalAsFedKg: number;
  totalDmKg: number;
  overallDmPct: number;
  overallCpPct: number;
  totalBatchCost: number;
  costPerKgAsFed: number;
  costPerKgDm: number;
}

/**
 * Calculates Total Mixed Ration (TMR) Dry Matter, Crude Protein density, and Cost per kg
 */
export function calculateTmrMix(ingredients: TmrIngredientInput[]): TmrMixResult {
  let totalAsFedKg = 0;
  let totalDmKg = 0;
  let totalCpKg = 0;
  let totalBatchCost = 0;

  for (const item of ingredients) {
    const asFed = Number(item.asFedKg) || 0;
    const dmRatio = (Number(item.dmPct) || 0) / 100;
    const cpRatio = (Number(item.cpPct) || 0) / 100;
    const cost = Number(item.costPerKg) || 0;

    const dmKg = asFed * dmRatio;
    const cpKg = dmKg * cpRatio;

    totalAsFedKg += asFed;
    totalDmKg += dmKg;
    totalCpKg += cpKg;
    totalBatchCost += asFed * cost;
  }

  const overallDmPct = totalAsFedKg > 0 ? (totalDmKg / totalAsFedKg) * 100 : 0;
  const overallCpPct = totalDmKg > 0 ? (totalCpKg / totalDmKg) * 100 : 0;
  const costPerKgAsFed = totalAsFedKg > 0 ? totalBatchCost / totalAsFedKg : 0;
  const costPerKgDm = totalDmKg > 0 ? totalBatchCost / totalDmKg : 0;

  return {
    totalAsFedKg: Number(totalAsFedKg.toFixed(2)),
    totalDmKg: Number(totalDmKg.toFixed(2)),
    overallDmPct: Number(overallDmPct.toFixed(2)),
    overallCpPct: Number(overallCpPct.toFixed(2)),
    totalBatchCost: Number(totalBatchCost.toFixed(2)),
    costPerKgAsFed: Number(costPerKgAsFed.toFixed(2)),
    costPerKgDm: Number(costPerKgDm.toFixed(2))
  };
}

export interface MilkProductionSummary {
  totalYieldLitres: number;
  averageDailyYield: number;
  recordCount: number;
  amTotal: number;
  pmTotal: number;
}

/**
 * Calculates total and daily average milking yields from records
 */
export function calculateMilkProductionMetrics(records: { am: number; pm: number; date?: string }[]): MilkProductionSummary {
  if (!records || records.length === 0) {
    return {
      totalYieldLitres: 0,
      averageDailyYield: 0,
      recordCount: 0,
      amTotal: 0,
      pmTotal: 0
    };
  }

  let amTotal = 0;
  let pmTotal = 0;

  for (const r of records) {
    amTotal += Number(r.am) || 0;
    pmTotal += Number(r.pm) || 0;
  }

  const totalYieldLitres = amTotal + pmTotal;
  const averageDailyYield = records.length > 0 ? totalYieldLitres / records.length : 0;

  return {
    totalYieldLitres: Number(totalYieldLitres.toFixed(1)),
    averageDailyYield: Number(averageDailyYield.toFixed(1)),
    recordCount: records.length,
    amTotal: Number(amTotal.toFixed(1)),
    pmTotal: Number(pmTotal.toFixed(1))
  };
}

export interface FinancialSummaryResult {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPct: number;
}

/**
 * Aggregates farm income, expenses, and net profit margins
 */
export function calculateFinancialSummary(records: { type: string; amount: number }[]): FinancialSummaryResult {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const r of records) {
    const amt = Number(r.amount) || 0;
    const type = (r.type || '').toLowerCase();
    if (type === 'income') {
      totalIncome += amt;
    } else if (type === 'expense') {
      totalExpenses += amt;
    }
  }

  const netProfit = totalIncome - totalExpenses;
  const profitMarginPct = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    profitMarginPct: Number(profitMarginPct.toFixed(1))
  };
}

/**
 * Calculates expected dairy calving date and dry-off date based on service date
 * Standard bovine gestation: ~283 days. Dry off typically at ~220 days (60 days prior to calving).
 */
export function calculateGestationAndDryOff(
  serviceDateStr: string,
  gestationDays: number = 283,
  dryOffDays: number = 220
): { expectedCalvingDate: string; dryOffDate: string; daysElapsed: number; daysRemaining: number } {
  const service = new Date(serviceDateStr);
  const now = new Date();

  const calving = new Date(service);
  calving.setDate(calving.getDate() + gestationDays);

  const dryOff = new Date(service);
  dryOff.setDate(dryOff.getDate() + dryOffDays);

  const diffMs = now.getTime() - service.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, gestationDays - daysElapsed);

  return {
    expectedCalvingDate: calving.toISOString().split('T')[0],
    dryOffDate: dryOff.toISOString().split('T')[0],
    daysElapsed,
    daysRemaining
  };
}

/**
 * Calculates GlobalGAP Pre-Harvest Interval (PHI) safe harvest date
 */
export function calculateSprayPhiExpiry(sprayDateStr: string, phiDays: number): { safeHarvestDate: string; isSafeToHarvest: boolean; daysRemaining: number } {
  const spray = new Date(sprayDateStr);
  const safeDate = new Date(spray);
  safeDate.setDate(safeDate.getDate() + phiDays);

  const now = new Date();
  const diffMs = safeDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isSafeToHarvest = daysRemaining <= 0;

  return {
    safeHarvestDate: safeDate.toISOString().split('T')[0],
    isSafeToHarvest,
    daysRemaining: Math.max(0, daysRemaining)
  };
}
