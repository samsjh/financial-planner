// ─── IRAS Tax Logic Engine ───────────────────────────────────────────────────
import {
  IRAS_TAX_BRACKETS,
  SRS_RELIEF_CAP,
  LIFE_INSURANCE_RELIEF_CAP,
  EARNED_INCOME_RELIEF_BELOW_55,
  EARNED_INCOME_RELIEF_55_TO_59,
  EARNED_INCOME_RELIEF_60_AND_ABOVE,
  TOTAL_PERSONAL_RELIEFS_CAP,
  QUALIFYING_CHILD_RELIEF,
  QUALIFYING_CHILD_RELIEF_DISABLED,
  PARENT_RELIEF_SAME_HOUSEHOLD,
  PARENT_RELIEF_SAME_HOUSEHOLD_HANDICAPPED,
  PARENT_RELIEF_NOT_SAME_HOUSEHOLD,
  PARENT_RELIEF_NOT_SAME_HOUSEHOLD_HANDICAPPED,
  WORKING_MOTHER_CHILD_RELIEF_1_CHILD,
  WORKING_MOTHER_CHILD_RELIEF_2_CHILDREN,
  WORKING_MOTHER_CHILD_RELIEF_3_PLUS_CHILDREN,
  WORKING_MOTHER_CHILD_RELIEF_CAP,
  NSMAN_RELIEF,
  CPF_TOPUP_RELIEF_CAP,
} from "./constants";
import { calculateCpfRelief } from "./cpfLogic";

// ─── Tax Relief Input ────────────────────────────────────────────────────────
/** Additional relief inputs from ClientProfile that get passed into tax calc */
export interface TaxReliefInputs {
  numberOfChildren: number;
  numberOfDisabledChildren: number;
  numberOfParentsSameHousehold: number;
  numberOfParentsNotSameHousehold: number;
  numberOfHandicappedParentsSameHousehold: number;
  numberOfHandicappedParentsNotSameHousehold: number;
  isWorkingMother: boolean;
  isActiveNsman: boolean;
  annualCpfTopUp: number;
}

export interface TaxBreakdown {
  grossAnnualIncome: number;
  cpfRelief: number;
  srsRelief: number;
  lifeInsuranceRelief: number;
  earnedIncomeRelief: number;
  qualifyingChildRelief: number;
  parentRelief: number;
  workingMotherRelief: number;
  nsmanRelief: number;
  cpfTopUpRelief: number;
  totalReliefs: number;
  chargeableIncome: number;
  taxPayable: number;
  effectiveRate: number;
  marginalRate: number;
}

/**
 * Get Earned Income Relief based on age.
 */
function getEarnedIncomeRelief(age: number, hasEarnedIncome: boolean): number {
  if (!hasEarnedIncome) return 0;
  if (age >= 60) return EARNED_INCOME_RELIEF_60_AND_ABOVE;
  if (age >= 55) return EARNED_INCOME_RELIEF_55_TO_59;
  return EARNED_INCOME_RELIEF_BELOW_55;
}

/**
 * Calculate Qualifying Child Relief (QCR).
 * $4,000 per normal child + $7,500 per disabled child.
 */
function calculateQcr(numChildren: number, numDisabledChildren: number): number {
  return numChildren * QUALIFYING_CHILD_RELIEF + numDisabledChildren * QUALIFYING_CHILD_RELIEF_DISABLED;
}

/**
 * Calculate Parent / Handicapped Parent Relief.
 * Rate depends on whether parent lives with taxpayer AND handicap status.
 */
function calculateParentRelief(
  sameHousehold: number,
  notSameHousehold: number,
  handicappedSameHousehold: number,
  handicappedNotSameHousehold: number
): number {
  return (
    sameHousehold * PARENT_RELIEF_SAME_HOUSEHOLD +
    notSameHousehold * PARENT_RELIEF_NOT_SAME_HOUSEHOLD +
    handicappedSameHousehold * PARENT_RELIEF_SAME_HOUSEHOLD_HANDICAPPED +
    handicappedNotSameHousehold * PARENT_RELIEF_NOT_SAME_HOUSEHOLD_HANDICAPPED
  );
}

/**
 * Working Mother's Child Relief (WMCR).
 * Percentage of mother's earned income, based on total number of qualifying children.
 * Capped at $22,500.
 */
function calculateWmcr(
  isWorkingMother: boolean,
  numChildren: number,
  numDisabledChildren: number,
  earnedIncome: number
): number {
  if (!isWorkingMother) return 0;
  const totalChildren = numChildren + numDisabledChildren;
  if (totalChildren <= 0) return 0;

  let rate: number;
  if (totalChildren >= 3) {
    rate = WORKING_MOTHER_CHILD_RELIEF_3_PLUS_CHILDREN;
  } else if (totalChildren === 2) {
    rate = WORKING_MOTHER_CHILD_RELIEF_2_CHILDREN;
  } else {
    rate = WORKING_MOTHER_CHILD_RELIEF_1_CHILD;
  }

  return Math.min(earnedIncome * rate, WORKING_MOTHER_CHILD_RELIEF_CAP);
}

/**
 * NSman Relief — flat $3,000 for active NSmen.
 */
function calculateNsmanRelief(isActiveNsman: boolean): number {
  return isActiveNsman ? NSMAN_RELIEF : 0;
}

/**
 * CPF Top-up Relief — capped at $8,000 per recipient.
 */
function calculateCpfTopUpRelief(annualTopUp: number): number {
  return Math.min(annualTopUp, CPF_TOPUP_RELIEF_CAP);
}

/**
 * Calculate progressive tax using IRAS brackets.
 */
function calculateProgressiveTax(chargeableIncome: number): number {
  if (chargeableIncome <= 0) return 0;

  let tax = 0;
  let remaining = chargeableIncome;
  let prevBound = 0;

  for (const bracket of IRAS_TAX_BRACKETS) {
    const taxableInBracket = Math.min(remaining, bracket.upperBound - prevBound);
    if (taxableInBracket <= 0) break;

    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevBound = bracket.upperBound;

    if (remaining <= 0) break;
  }

  return Math.max(0, tax);
}

/**
 * Get the marginal tax rate for a given chargeable income.
 * This is the rate that applies to the next dollar of income.
 */
export function getMarginalTaxRate(chargeableIncome: number): number {
  if (chargeableIncome <= 0) return 0;
  for (const bracket of IRAS_TAX_BRACKETS) {
    if (chargeableIncome <= bracket.upperBound) {
      return bracket.rate;
    }
  }
  return IRAS_TAX_BRACKETS[IRAS_TAX_BRACKETS.length - 1].rate;
}

/**
 * Full tax calculation for a given year.
 *
 * @param grossAnnualIncome - Total annual earned income (salary + bonus)
 * @param monthlyGross - Monthly gross for CPF relief calc
 * @param age - Current age
 * @param annualSrsContribution - SRS contribution for this year
 * @param lifeInsurancePremium - Life insurance relief for this year
 * @param isWorking - Whether the person has earned income
 * @param hasSrsRelief - Whether SRS relief applies this year
 * @param hasLifeInsuranceRelief - Whether life insurance relief applies
 * @param reliefInputs - Additional tax relief inputs (children, parents, NSman, etc.)
 */
export function calculateAnnualTax(
  grossAnnualIncome: number,
  monthlyGross: number,
  age: number,
  annualSrsContribution: number,
  lifeInsurancePremium: number,
  isWorking: boolean,
  hasSrsRelief: boolean,
  hasLifeInsuranceRelief: boolean,
  reliefInputs?: TaxReliefInputs
): TaxBreakdown {
  // CPF Relief (employee contribution)
  const cpfRelief = isWorking ? calculateCpfRelief(monthlyGross, age) : 0;

  // SRS Relief (capped)
  const srsRelief = hasSrsRelief
    ? Math.min(annualSrsContribution, SRS_RELIEF_CAP)
    : 0;

  // Life Insurance Relief (capped, only if CPF < $5,000)
  let lifeInsuranceRelief = 0;
  if (hasLifeInsuranceRelief) {
    // Life insurance relief cap is $5,000 but reduced if CPF contributions >= $5,000
    if (cpfRelief < LIFE_INSURANCE_RELIEF_CAP) {
      lifeInsuranceRelief = Math.min(
        lifeInsurancePremium,
        LIFE_INSURANCE_RELIEF_CAP - cpfRelief
      );
    }
  }

  // Earned Income Relief
  const earnedIncomeRelief = getEarnedIncomeRelief(age, isWorking);

  // ── New reliefs from PR #2 ───────────────────────────────────────────────
  const ri = reliefInputs ?? {
    numberOfChildren: 0,
    numberOfDisabledChildren: 0,
    numberOfParentsSameHousehold: 0,
    numberOfParentsNotSameHousehold: 0,
    numberOfHandicappedParentsSameHousehold: 0,
    numberOfHandicappedParentsNotSameHousehold: 0,
    isWorkingMother: false,
    isActiveNsman: false,
    annualCpfTopUp: 0,
  };

  const qualifyingChildRelief = calculateQcr(ri.numberOfChildren, ri.numberOfDisabledChildren);

  const parentRelief = calculateParentRelief(
    ri.numberOfParentsSameHousehold,
    ri.numberOfParentsNotSameHousehold,
    ri.numberOfHandicappedParentsSameHousehold,
    ri.numberOfHandicappedParentsNotSameHousehold
  );

  const workingMotherRelief = isWorking
    ? calculateWmcr(ri.isWorkingMother, ri.numberOfChildren, ri.numberOfDisabledChildren, grossAnnualIncome)
    : 0;

  const nsmanRelief = calculateNsmanRelief(ri.isActiveNsman);

  const cpfTopUpRelief = calculateCpfTopUpRelief(ri.annualCpfTopUp);

  // ── Total reliefs — capped at $80,000 overall (IRAS rule) ────────────────
  const rawTotalReliefs =
    cpfRelief +
    srsRelief +
    lifeInsuranceRelief +
    earnedIncomeRelief +
    qualifyingChildRelief +
    parentRelief +
    workingMotherRelief +
    nsmanRelief +
    cpfTopUpRelief;

  const totalReliefs = Math.min(rawTotalReliefs, TOTAL_PERSONAL_RELIEFS_CAP);

  const chargeableIncome = Math.max(0, grossAnnualIncome - totalReliefs);

  const taxPayable = calculateProgressiveTax(chargeableIncome);
  const marginalRate = getMarginalTaxRate(chargeableIncome);

  const effectiveRate =
    grossAnnualIncome > 0 ? taxPayable / grossAnnualIncome : 0;

  return {
    grossAnnualIncome,
    cpfRelief,
    srsRelief,
    lifeInsuranceRelief,
    earnedIncomeRelief,
    qualifyingChildRelief,
    parentRelief,
    workingMotherRelief,
    nsmanRelief,
    cpfTopUpRelief,
    totalReliefs,
    chargeableIncome,
    taxPayable,
    effectiveRate,
    marginalRate,
  };
}
