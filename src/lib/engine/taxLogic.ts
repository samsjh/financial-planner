// ─── IRAS Tax Logic Engine ───────────────────────────────────────────────────
import {
  IRAS_TAX_BRACKETS,
  SRS_RELIEF_CAP,
  LIFE_INSURANCE_RELIEF_CAP,
  EARNED_INCOME_RELIEF_BELOW_55,
  EARNED_INCOME_RELIEF_55_TO_59,
  EARNED_INCOME_RELIEF_60_AND_ABOVE,
} from "./constants";
import { calculateCpfRelief } from "./cpfLogic";

export interface TaxBreakdown {
  grossAnnualIncome: number;
  cpfRelief: number;
  srsRelief: number;
  lifeInsuranceRelief: number;
  earnedIncomeRelief: number;
  totalReliefs: number;
  chargeableIncome: number;
  taxPayable: number;
  effectiveRate: number;
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
 */
export function calculateAnnualTax(
  grossAnnualIncome: number,
  monthlyGross: number,
  age: number,
  annualSrsContribution: number,
  lifeInsurancePremium: number,
  isWorking: boolean,
  hasSrsRelief: boolean,
  hasLifeInsuranceRelief: boolean
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

  const totalReliefs = cpfRelief + srsRelief + lifeInsuranceRelief + earnedIncomeRelief;

  const chargeableIncome = Math.max(0, grossAnnualIncome - totalReliefs);

  const taxPayable = calculateProgressiveTax(chargeableIncome);

  const effectiveRate =
    grossAnnualIncome > 0 ? taxPayable / grossAnnualIncome : 0;

  return {
    grossAnnualIncome,
    cpfRelief,
    srsRelief,
    lifeInsuranceRelief,
    earnedIncomeRelief,
    totalReliefs,
    chargeableIncome,
    taxPayable,
    effectiveRate,
  };
}
