// ─── CPF Logic Engine ────────────────────────────────────────────────────────
import {
  CPF_ALLOCATION_RATES,
  CPF_MONTHLY_SALARY_CEILING,
  CPF_OA_INTEREST_RATE,
  CPF_SA_INTEREST_RATE,
  CPF_MA_INTEREST_RATE,
  CPF_LIFE_PAYOUT_PER_10K,
  CPF_LIFE_PAYOUT_START_AGE,
  type CpfRateBracket,
} from "./constants";

export interface CpfBalances {
  oa: number;
  sa: number;
  ma: number;
}

export interface CpfContributions {
  employeeTotal: number;
  employerTotal: number;
  oaContribution: number;
  saContribution: number;
  maContribution: number;
}

/**
 * Get the CPF allocation rate bracket for a given age.
 */
export function getCpfRateBracket(age: number): CpfRateBracket {
  for (const bracket of CPF_ALLOCATION_RATES) {
    if (age <= bracket.maxAge) {
      return bracket;
    }
  }
  return CPF_ALLOCATION_RATES[CPF_ALLOCATION_RATES.length - 1];
}

/**
 * Calculate annual CPF contributions for a given monthly salary and age.
 * Applies the $8,000 monthly salary ceiling (2026).
 */
export function calculateAnnualCpfContributions(
  monthlyGross: number,
  age: number
): CpfContributions {
  const bracket = getCpfRateBracket(age);
  const cappedMonthlySalary = Math.min(monthlyGross, CPF_MONTHLY_SALARY_CEILING);

  // Annual contributions
  const annualSalary = cappedMonthlySalary * 12;
  const employeeTotal = annualSalary * bracket.employeeRate;
  const employerTotal = annualSalary * bracket.employerRate;

  const oaContribution = annualSalary * bracket.oaAllocation;
  const saContribution = annualSalary * bracket.saAllocation;
  const maContribution = annualSalary * bracket.maAllocation;

  return {
    employeeTotal,
    employerTotal,
    oaContribution,
    saContribution,
    maContribution,
  };
}

/**
 * Apply annual interest to CPF balances.
 * OA: 2.5% p.a., SA/MA: 4.0% p.a.
 * First $60k earns extra 1% (not modelled here for simplicity but could be added).
 */
export function applyCpfInterest(balances: CpfBalances): CpfBalances {
  return {
    oa: balances.oa * (1 + CPF_OA_INTEREST_RATE),
    sa: balances.sa * (1 + CPF_SA_INTEREST_RATE),
    ma: balances.ma * (1 + CPF_MA_INTEREST_RATE),
  };
}

/**
 * Apply CPF deductions: housing (from OA) and shield plan premiums (from MA).
 */
export function applyCpfDeductions(
  balances: CpfBalances,
  housingUsageMonthly: number,
  shieldPremiumAnnual: number
): CpfBalances {
  return {
    oa: Math.max(0, balances.oa - housingUsageMonthly * 12),
    sa: balances.sa,
    ma: Math.max(0, balances.ma - shieldPremiumAnnual),
  };
}

/**
 * Project CPF balances forward by one year.
 * If the person is still working (isWorking=true), add contributions.
 * Apply deductions and interest regardless.
 */
export function projectCpfOneYear(
  balances: CpfBalances,
  monthlyGross: number,
  age: number,
  isWorking: boolean,
  housingUsageMonthly: number,
  shieldPremiumAnnual: number
): { newBalances: CpfBalances; contributions: CpfContributions } {
  let contributions: CpfContributions = {
    employeeTotal: 0,
    employerTotal: 0,
    oaContribution: 0,
    saContribution: 0,
    maContribution: 0,
  };

  let updated = { ...balances };

  // Add contributions if working
  if (isWorking && monthlyGross > 0) {
    contributions = calculateAnnualCpfContributions(monthlyGross, age);
    updated.oa += contributions.oaContribution;
    updated.sa += contributions.saContribution;
    updated.ma += contributions.maContribution;
  }

  // Apply deductions
  updated = applyCpfDeductions(updated, housingUsageMonthly, shieldPremiumAnnual);

  // Apply interest
  updated = applyCpfInterest(updated);

  return { newBalances: updated, contributions };
}

/**
 * Estimate CPF Life monthly payout based on combined SA+OA balance
 * transferred to Retirement Account at age 55, grown to 65.
 * Rule of thumb: ~$1 per $10,000 in RA per month.
 */
export function estimateCpfLifeMonthlyPayout(
  saBalance: number,
  oaBalance: number,
  currentAge: number
): number {
  if (currentAge < CPF_LIFE_PAYOUT_START_AGE) {
    // Project RA growth from now to 65
    const yearsToPayoutStart = CPF_LIFE_PAYOUT_START_AGE - currentAge;
    // Assume RA (from SA+OA transfer at 55) grows at SA rate
    const estimatedRA = (saBalance + oaBalance * 0.5) * Math.pow(1 + CPF_SA_INTEREST_RATE, yearsToPayoutStart);
    return (estimatedRA / 10000) * CPF_LIFE_PAYOUT_PER_10K;
  }
  // Already past 65, use current balances
  const ra = saBalance + oaBalance * 0.3;
  return (ra / 10000) * CPF_LIFE_PAYOUT_PER_10K;
}

/**
 * Calculate CPF Relief for tax purposes (employee contribution, capped).
 */
export function calculateCpfRelief(monthlyGross: number, age: number): number {
  const bracket = getCpfRateBracket(age);
  const cappedMonthlySalary = Math.min(monthlyGross, CPF_MONTHLY_SALARY_CEILING);
  const annualEmployeeContrib = cappedMonthlySalary * 12 * bracket.employeeRate;
  // CPF Relief is capped at the employee contribution (max ~$20,400 at 20% of $8k*12)
  return annualEmployeeContrib;
}

/**
 * Calculate property sale proceeds accounting for CPF accrued interest.
 */
export function calculatePropertySaleProceeds(
  marketValue: number,
  outstandingLoan: number,
  cpfPrincipalUsed: number,
  yearsOfOwnership: number
): {
  marketValue: number;
  outstandingLoan: number;
  cpfPrincipalUsed: number;
  cpfAccruedInterest: number;
  netCashProceeds: number;
} {
  // Accrued interest on CPF principal used at OA rate
  const cpfAccruedInterest =
    cpfPrincipalUsed * (Math.pow(1 + CPF_OA_INTEREST_RATE, yearsOfOwnership) - 1);

  const netCashProceeds =
    marketValue - outstandingLoan - cpfPrincipalUsed - cpfAccruedInterest;

  return {
    marketValue,
    outstandingLoan,
    cpfPrincipalUsed,
    cpfAccruedInterest,
    netCashProceeds: Math.max(0, netCashProceeds),
  };
}
