// ─── CPF Logic Engine ────────────────────────────────────────────────────────
import {
  CPF_ALLOCATION_RATES,
  CPF_MONTHLY_SALARY_CEILING,
  CPF_OA_INTEREST_RATE,
  CPF_SA_INTEREST_RATE,
  CPF_MA_INTEREST_RATE,
  CPF_RA_INTEREST_RATE,
  CPF_LIFE_PAYOUT_START_AGE,
  CPF_EXTRA_INTEREST_FIRST_60K,
  CPF_EXTRA_INTEREST_NEXT_30K,
  CPF_LIFE_PLANS,
  CPF_RETIREMENT_SUMS,
  CPF_RA_CREATION_AGE,
  type CpfRateBracket,
  type CpfLifePlanType,
  type CpfRetirementSumTier,
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
 * Apply annual interest to CPF balances, including extra interest on first $60k
 * and next $30k combined balances.
 *
 * Extra interest rules:
 *   - First $60k of combined CPF balances: extra 1% (applied to OA first, then SA, MA)
 *   - Next $30k (above $60k): extra 1% on SA/MA/RA only (not OA)
 *   - For members aged ≥55: extra 2% on first $30k, extra 1% on next $30k
 *     (simplified here as 1% on first $60k + 1% on next $30k for all ages)
 */
export function applyCpfInterest(balances: CpfBalances): CpfBalances {
  // Base interest
  let oaInterest = balances.oa * CPF_OA_INTEREST_RATE;
  let saInterest = balances.sa * CPF_SA_INTEREST_RATE;
  let maInterest = balances.ma * CPF_MA_INTEREST_RATE;

  // Extra interest calculation on first $60k combined
  const combined = balances.oa + balances.sa + balances.ma;
  const extraFirst60k = Math.min(combined, 60000);

  if (extraFirst60k > 0) {
    // Apply extra 1% — distributed across OA first, then SA, then MA
    let remaining60k = extraFirst60k;

    const oaExtra = Math.min(balances.oa, remaining60k);
    oaInterest += oaExtra * CPF_EXTRA_INTEREST_FIRST_60K;
    remaining60k -= oaExtra;

    if (remaining60k > 0) {
      const saExtra = Math.min(balances.sa, remaining60k);
      saInterest += saExtra * CPF_EXTRA_INTEREST_FIRST_60K;
      remaining60k -= saExtra;
    }

    if (remaining60k > 0) {
      const maExtra = Math.min(balances.ma, remaining60k);
      maInterest += maExtra * CPF_EXTRA_INTEREST_FIRST_60K;
    }
  }

  // Extra interest on next $30k (only SA/MA, not OA)
  if (combined > 60000) {
    const extraNext30k = Math.min(combined - 60000, 30000);
    let remainingNext30k = extraNext30k;

    // Skip OA — only SA and MA get this extra interest
    const saAbove = Math.max(0, balances.sa - Math.max(0, 60000 - balances.oa));
    const saExtra30 = Math.min(saAbove, remainingNext30k);
    saInterest += saExtra30 * CPF_EXTRA_INTEREST_NEXT_30K;
    remainingNext30k -= saExtra30;

    if (remainingNext30k > 0) {
      const maExtra30 = Math.min(remainingNext30k, balances.ma);
      maInterest += maExtra30 * CPF_EXTRA_INTEREST_NEXT_30K;
    }
  }

  return {
    oa: balances.oa + oaInterest,
    sa: balances.sa + saInterest,
    ma: balances.ma + maInterest,
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

  // Apply interest (now includes extra interest on first $60k/$30k)
  updated = applyCpfInterest(updated);

  return { newBalances: updated, contributions };
}

/**
 * Estimate the Retirement Account (RA) balance at CPF LIFE payout start age.
 * At age 55, SA and part of OA are transferred to RA (up to the selected retirement sum).
 *
 * @param saBalance - Current SA balance
 * @param oaBalance - Current OA balance
 * @param currentAge - Current age
 * @param retirementSumTier - BRS, FRS, or ERS
 * @returns Estimated RA balance at age 65
 */
export function estimateRaBalance(
  saBalance: number,
  oaBalance: number,
  currentAge: number,
  retirementSumTier: CpfRetirementSumTier = "FRS"
): number {
  const targetSum = CPF_RETIREMENT_SUMS[retirementSumTier];

  if (currentAge >= CPF_RA_CREATION_AGE) {
    // RA already created — assume current SA+part of OA = RA
    // Cap at the selected retirement sum
    const rawRA = Math.min(saBalance + oaBalance, targetSum);
    const yearsToPayoutStart = Math.max(0, CPF_LIFE_PAYOUT_START_AGE - currentAge);
    return rawRA * Math.pow(1 + CPF_RA_INTEREST_RATE, yearsToPayoutStart);
  }

  // Project SA growth to age 55 (when RA is created)
  const yearsTo55 = CPF_RA_CREATION_AGE - currentAge;
  const projectedSA = saBalance * Math.pow(1 + CPF_SA_INTEREST_RATE, yearsTo55);
  const projectedOA = oaBalance * Math.pow(1 + CPF_OA_INTEREST_RATE, yearsTo55);

  // At age 55: SA transfers to RA first, then OA tops up to reach retirement sum
  const saToRA = Math.min(projectedSA, targetSum);
  const oaToRA = Math.min(projectedOA, Math.max(0, targetSum - saToRA));
  const raAt55 = saToRA + oaToRA;

  // Grow RA from 55 to 65 at RA interest rate (4%)
  const yearsFrom55To65 = CPF_LIFE_PAYOUT_START_AGE - CPF_RA_CREATION_AGE;
  return raAt55 * Math.pow(1 + CPF_RA_INTEREST_RATE, yearsFrom55To65);
}

/**
 * Estimate CPF Life monthly payout based on RA balance and chosen plan.
 *
 * @param saBalance - Current SA balance
 * @param oaBalance - Current OA balance
 * @param currentAge - Current age
 * @param plan - CPF LIFE plan type (STANDARD, BASIC, ESCALATING)
 * @param retirementSumTier - BRS, FRS, or ERS
 * @param payoutYear - How many years since payout started (for ESCALATING plan)
 * @returns Estimated monthly payout
 */
export function estimateCpfLifeMonthlyPayout(
  saBalance: number,
  oaBalance: number,
  currentAge: number,
  plan: CpfLifePlanType = "STANDARD",
  retirementSumTier: CpfRetirementSumTier = "FRS",
  payoutYear: number = 0
): number {
  const raBalance = estimateRaBalance(saBalance, oaBalance, currentAge, retirementSumTier);
  const planConfig = CPF_LIFE_PLANS[plan];
  const basePayout = raBalance * planConfig.payoutPerDollarRA;

  // Apply escalation for the ESCALATING plan
  if (plan === "ESCALATING" && payoutYear > 0) {
    const escalation = CPF_LIFE_PLANS.ESCALATING.annualEscalation;
    return basePayout * Math.pow(1 + escalation, payoutYear);
  }

  return basePayout;
}

/**
 * Calculate CPF Relief for tax purposes (employee contribution, capped).
 */
export function calculateCpfRelief(monthlyGross: number, age: number): number {
  const bracket = getCpfRateBracket(age);
  const cappedMonthlySalary = Math.min(monthlyGross, CPF_MONTHLY_SALARY_CEILING);
  const annualEmployeeContrib = cappedMonthlySalary * 12 * bracket.employeeRate;
  // CPF Relief is capped at the employee contribution (max ~$19,200 at 20% of $8k×12)
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
