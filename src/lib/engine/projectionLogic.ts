// ─── Main Projection Engine ──────────────────────────────────────────────────
// Year-on-Year Cashflow → Net Worth Simulation Loop
// Handles: CPF, Tax, Inflation, Life Events, Stress Tests, Retirement Transition

import type {
  ClientProfile,
  Asset,
  Liability,
  LifeEvent,
  SimulationResult,
  YearlySnapshot,
  GapDataPoint,
  StressTestType,
} from "../types";

import { projectCpfOneYear, estimateCpfLifeMonthlyPayout, calculatePropertySaleProceeds } from "./cpfLogic";
import { calculateAnnualTax, type TaxReliefInputs } from "./taxLogic";
import {
  MORTALITY_AGE,
  CONSERVATIVE_MORTALITY_AGE,
  DEFAULT_PASSIVE_INCOME_YIELD,
  MARKET_CRASH_LOSS_PERCENT,
  LATE_CI_EXPENSE_INCREASE_PERCENT,
  CPF_LIFE_PAYOUT_START_AGE,
} from "./constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSimulationEndAge(
  gender: "Male" | "Female",
  conservativeMode: boolean,
  stressTest: StressTestType
): number {
  if (stressTest === "longevityRisk" || conservativeMode) {
    return CONSERVATIVE_MORTALITY_AGE;
  }
  return MORTALITY_AGE[gender];
}

function inflateValue(todayValue: number, inflationRate: number, years: number): number {
  return todayValue * Math.pow(1 + inflationRate, years);
}

function presentValue(futureValue: number, discountRate: number, years: number): number {
  if (years <= 0) return futureValue;
  return futureValue / Math.pow(1 + discountRate, years);
}

// ─── Main Simulation ─────────────────────────────────────────────────────────

export function runProjection(
  profile: ClientProfile,
  assets: Asset[],
  liabilities: Liability[],
  lifeEvents: LifeEvent[]
): SimulationResult {
  const currentYear = new Date().getFullYear();
  const mortalityAge = getSimulationEndAge(
    profile.gender,
    profile.conservativeMode,
    profile.activeStressTest
  );
  const totalYears = mortalityAge - profile.currentAge;

  // ── Initial state ──────────────────────────────────────────────────────────
  let cpfOa = profile.cpfOaBalance;
  let cpfSa = profile.cpfSaBalance;
  let cpfMa = profile.cpfMaBalance;

  // Sum liquid and fixed assets
  let liquidAssets = assets
    .filter((a) => a.category === "liquid")
    .reduce((sum, a) => sum + a.currentValue, 0);

  let fixedAssets = assets
    .filter((a) => a.category === "fixed")
    .reduce((sum, a) => sum + a.currentValue, 0);

  // Add property to fixed assets
  fixedAssets += profile.propertyMarketValue;

  let totalLiabilities = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  totalLiabilities += profile.outstandingMortgage;

  // Weighted average appreciation rates
  const liquidAppreciation =
    assets.filter((a) => a.category === "liquid").length > 0
      ? assets
          .filter((a) => a.category === "liquid")
          .reduce((sum, a) => sum + a.projectedAppreciationRate * a.currentValue, 0) /
        Math.max(1, assets.filter((a) => a.category === "liquid").reduce((sum, a) => sum + a.currentValue, 0))
      : profile.riskAppetiteGrowthRate;

  const fixedAppreciation =
    assets.filter((a) => a.category === "fixed").length > 0
      ? assets
          .filter((a) => a.category === "fixed")
          .reduce((sum, a) => sum + a.projectedAppreciationRate * a.currentValue, 0) /
        Math.max(1, assets.filter((a) => a.category === "fixed").reduce((sum, a) => sum + a.currentValue, 0))
      : profile.propertyAppreciationRate;

  // Liabilities
  const totalMonthlyLiabilityPayment =
    liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);

  let cumulativeSurplus = 0;

  // Stress test tracking
  let stressTestMonthsRemaining = 0;
  let stressTestApplied = false;
  let lateCiApplied = false;

  const snapshots: YearlySnapshot[] = [];
  const gapAnalysis: GapDataPoint[] = [];
  let financialFreedomAge: number | null = null;

  // ── Year-by-Year Loop ──────────────────────────────────────────────────────

  for (let y = 0; y <= totalYears; y++) {
    const age = profile.currentAge + y;
    const year = currentYear + y;
    const yearsFromNow = y;

    const isRetired = age >= profile.desiredRetirementAge;
    const inflationRate = profile.inflationRate;
    const useInflation = profile.useInflationAdjusted;

    // ── Stress Test Logic ──────────────────────────────────────────────────

    let isIncomeZero = false;
    let expenseMultiplier = 1.0;
    let oneLumpSumCash = 0;

    // Apply stress test at the configured start age
    if (profile.activeStressTest !== "none" && age === profile.stressTestStartAge && !stressTestApplied) {
      stressTestApplied = true;

      switch (profile.activeStressTest) {
        case "retrenchment":
          stressTestMonthsRemaining = profile.stressTestDuration || 12;
          break;
        case "earlyCi":
          stressTestMonthsRemaining = profile.stressTestDuration || 12;
          oneLumpSumCash = profile.earlyCiPayout;
          break;
        case "lateCi":
          lateCiApplied = true;
          oneLumpSumCash = profile.lateCiPayout;
          break;
        case "marketCrash":
          liquidAssets *= (1 - MARKET_CRASH_LOSS_PERCENT);
          break;
        case "deathDisability":
          oneLumpSumCash = profile.deathPayout;
          break;
        case "longevityRisk":
          // Already handled by mortality age extension
          break;
      }
    }

    // Ongoing stress effects
    if (stressTestMonthsRemaining > 0) {
      isIncomeZero = true;
      stressTestMonthsRemaining = Math.max(0, stressTestMonthsRemaining - 12);
    }

    if (lateCiApplied) {
      isIncomeZero = true;
      expenseMultiplier = 1 + LATE_CI_EXPENSE_INCREASE_PERCENT;
    }

    if (oneLumpSumCash > 0) {
      liquidAssets += oneLumpSumCash;
    }

    // ── Income ─────────────────────────────────────────────────────────────

    const isWorking = !isRetired && !isIncomeZero;
    const grossMonthlyIncome = isWorking ? profile.monthlyGrossIncome : 0;
    const annualBonus = isWorking ? profile.annualBonus : 0;
    const rentalIncome = profile.rentalIncome * 12;
    const sideIncome = profile.sideIncome * 12;

    const grossAnnualEarnedIncome = grossMonthlyIncome * 12 + annualBonus;
    const grossAnnualTotalIncome = grossAnnualEarnedIncome + rentalIncome + sideIncome;

    // CPF Life payout (post-65)
    const cpfLifeMonthlyPayout =
      age >= CPF_LIFE_PAYOUT_START_AGE
        ? estimateCpfLifeMonthlyPayout(cpfSa, cpfOa, age)
        : 0;
    const cpfLifeAnnual = cpfLifeMonthlyPayout * 12;

    // Passive income from liquid assets
    const passiveIncomeFromAssets = liquidAssets * DEFAULT_PASSIVE_INCOME_YIELD;
    const totalPassiveIncome = passiveIncomeFromAssets + cpfLifeAnnual + rentalIncome + sideIncome;
    const monthlyPassiveIncome = totalPassiveIncome / 12;

    const totalIncome = isRetired
      ? totalPassiveIncome
      : grossAnnualTotalIncome;

    // ── Expenses ───────────────────────────────────────────────────────────

    let annualExpenses: number;
    let inflationAdjustedExpenses: number;

    if (isRetired) {
      // Post-retirement: use desired monthly spending
      const baseSpend = profile.desiredMonthlySpending * 12;
      if (useInflation) {
        inflationAdjustedExpenses =
          inflateValue(baseSpend, inflationRate, yearsFromNow) * expenseMultiplier;
      } else {
        inflationAdjustedExpenses = baseSpend * expenseMultiplier;
      }
      annualExpenses = inflationAdjustedExpenses;
    } else {
      // Pre-retirement: current lifestyle expenses
      const baseExpenses =
        (profile.monthlyFixedExpenses + profile.monthlyVariableExpenses) * 12;
      if (useInflation) {
        inflationAdjustedExpenses =
          inflateValue(baseExpenses, inflationRate, yearsFromNow) * expenseMultiplier;
      } else {
        inflationAdjustedExpenses = baseExpenses * expenseMultiplier;
      }
      annualExpenses = inflationAdjustedExpenses;
    }

    // ── Life Events ────────────────────────────────────────────────────────

    const eventsThisYear = lifeEvents.filter((e) => e.year === year);
    const lifeEventCost = eventsThisYear.reduce((sum, e) => sum + e.cost, 0);
    liquidAssets -= lifeEventCost; // Deduct from liquid assets

    // ── CPF Projection ─────────────────────────────────────────────────────

    const { newBalances, contributions } = projectCpfOneYear(
      { oa: cpfOa, sa: cpfSa, ma: cpfMa },
      grossMonthlyIncome,
      age,
      isWorking,
      isRetired ? 0 : profile.housingUsageOaMonthly,
      profile.shieldPlanPremiumMa
    );
    cpfOa = newBalances.oa;
    cpfSa = newBalances.sa;
    cpfMa = newBalances.ma;

    // ── Tax ────────────────────────────────────────────────────────────────

    // Claim SRS relief if annual contribution > 0
    const hasSrsContribution = profile.annualSrsContribution > 0;
    // Claim life insurance relief if annual premium > 0
    const hasLifeInsurancePremium = profile.lifeInsuranceRelief > 0;

    const taxBreakdown = calculateAnnualTax(
      grossAnnualTotalIncome,
      grossMonthlyIncome,
      age,
      profile.annualSrsContribution,
      profile.lifeInsuranceRelief,
      isWorking,
      hasSrsContribution,
      hasLifeInsurancePremium,
      {
        numberOfChildren: profile.numberOfChildren,
        numberOfDisabledChildren: profile.numberOfDisabledChildren,
        numberOfParentsSameHousehold: profile.numberOfParentsSameHousehold,
        numberOfParentsNotSameHousehold: profile.numberOfParentsNotSameHousehold,
        numberOfHandicappedParentsSameHousehold: profile.numberOfHandicappedParentsSameHousehold,
        numberOfHandicappedParentsNotSameHousehold: profile.numberOfHandicappedParentsNotSameHousehold,
        isWorkingMother: profile.isWorkingMother,
        isActiveNsman: profile.isActiveNsman,
        annualCpfTopUp: profile.annualCpfTopUp,
      } satisfies TaxReliefInputs
    );

    // ── Net Cashflow ───────────────────────────────────────────────────────

    const employeeContrib = contributions.employeeTotal;
    const netCashflow =
      totalIncome -
      annualExpenses -
      taxBreakdown.taxPayable -
      (isWorking ? employeeContrib : 0) -
      lifeEventCost -
      totalMonthlyLiabilityPayment * 12;

    cumulativeSurplus += netCashflow;

    // ── Asset Growth ───────────────────────────────────────────────────────

    // Liquid assets: add net cashflow + appreciation
    liquidAssets += netCashflow;
    liquidAssets *= 1 + (liquidAppreciation > 0 ? liquidAppreciation : profile.riskAppetiteGrowthRate);

    // Don't let liquid assets drop below 0 (can go negative to show shortfall)
    // Actually we keep it as-is to show the shortfall

    // Fixed assets appreciation
    fixedAssets *= 1 + (fixedAppreciation > 0 ? fixedAppreciation : profile.propertyAppreciationRate);

    // Property appreciation (already included in fixed assets via initial addition)
    // Mortgage reduction
    if (profile.mortgageYearsRemaining > y) {
      // Reduce mortgage balance each year
      const annualMortgagePayment = profile.outstandingMortgage / Math.max(1, profile.mortgageYearsRemaining);
      totalLiabilities = Math.max(0, totalLiabilities - annualMortgagePayment);
    }

    // Other liabilities reduction (simplified)
    const otherLiabPayoff = totalMonthlyLiabilityPayment * 12;
    totalLiabilities = Math.max(0, totalLiabilities - otherLiabPayoff * 0.3); // portion goes to principal

    // ── Calculate totals ───────────────────────────────────────────────────

    const cpfTotal = cpfOa + cpfSa + cpfMa;
    const totalAssets = liquidAssets + fixedAssets + cpfTotal;
    const netWorth = totalAssets - totalLiabilities;
    const liquidNetWorth = liquidAssets + cpfTotal - totalLiabilities;

    // Present value calculations
    const netWorthPV = useInflation
      ? presentValue(netWorth, inflationRate, yearsFromNow)
      : netWorth;
    const liquidAssetsPV = useInflation
      ? presentValue(liquidAssets, inflationRate, yearsFromNow)
      : liquidAssets;

    const monthlySurplus = netCashflow / 12;

    // ── Snapshot ────────────────────────────────────────────────────────────

    const snapshot: YearlySnapshot = {
      year,
      age,
      grossIncome: grossAnnualTotalIncome,
      passiveIncome: totalPassiveIncome,
      totalIncome,
      cpfOa,
      cpfSa,
      cpfMa,
      cpfTotal,
      cpfContributionEmployee: contributions.employeeTotal,
      cpfContributionEmployer: contributions.employerTotal,
      livingExpenses: annualExpenses,
      inflationAdjustedExpenses,
      lifeEventCost,
      taxPayable: taxBreakdown.taxPayable,
      liquidAssets,
      fixedAssets,
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidNetWorth,
      monthlySurplusDeficit: monthlySurplus,
      cumulativeSurplus,
      isRetired,
      netWorthPV,
      liquidAssetsPV,
    };

    snapshots.push(snapshot);

    // ── Gap Analysis (post-retirement) ─────────────────────────────────────

    if (isRetired) {
      const desiredSpend = useInflation
        ? inflateValue(profile.desiredMonthlySpending, inflationRate, yearsFromNow)
        : profile.desiredMonthlySpending;

      const gap = monthlyPassiveIncome - desiredSpend;

      gapAnalysis.push({
        age,
        year,
        projectedMonthlyPassiveIncome: monthlyPassiveIncome,
        desiredMonthlySpend: desiredSpend,
        gap,
      });

      // Financial Freedom Age: first time passive income >= desired spend
      if (financialFreedomAge === null && monthlyPassiveIncome >= desiredSpend) {
        financialFreedomAge = age;
      }
    }
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────

  const lastSnapshot = snapshots[snapshots.length - 1];
  const projectedShortfallSurplus = lastSnapshot ? lastSnapshot.netWorth : 0;

  // ── Property Sale Proceeds ───────────────────────────────────────────────

  const propertySaleProceeds =
    profile.propertyMarketValue > 0
      ? calculatePropertySaleProceeds(
          profile.propertyMarketValue *
            Math.pow(1 + profile.propertyAppreciationRate, totalYears),
          Math.max(0, profile.outstandingMortgage -
            (profile.outstandingMortgage / Math.max(1, profile.mortgageYearsRemaining)) *
              Math.min(totalYears, profile.mortgageYearsRemaining)),
          profile.cpfPrincipalUsedForProperty,
          totalYears
        )
      : null;

  return {
    snapshots,
    financialFreedomAge,
    projectedShortfallSurplus,
    mortalityAge,
    retirementAge: profile.desiredRetirementAge,
    gapAnalysis,
    propertySaleProceeds,
  };
}
