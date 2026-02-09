// ─── Singapore Financial Constants (2026) ────────────────────────────────────

// ─── Mortality ───────────────────────────────────────────────────────────────
export const MORTALITY_AGE = {
  Male: 84,
  Female: 88,
} as const;

export const CONSERVATIVE_MORTALITY_AGE = 100;

// ─── Inflation ───────────────────────────────────────────────────────────────
export const DEFAULT_INFLATION_RATE = 0.03; // 3% p.a.

// ─── CPF 2026 ────────────────────────────────────────────────────────────────
export const CPF_MONTHLY_SALARY_CEILING = 8000; // 2026 ceiling
export const CPF_ANNUAL_SALARY_CEILING = CPF_MONTHLY_SALARY_CEILING * 12;

/**
 * CPF Allocation Rates for Private Sector Employees (2026)
 * Each bracket: { maxAge, employee%, employer%, totalRate, oaRate, saRate, maRate }
 * Rates as decimals. OA/SA/MA rates are portions of TOTAL contribution.
 */
export interface CpfRateBracket {
  maxAge: number; // up to and including this age
  employeeRate: number;
  employerRate: number;
  totalRate: number;
  oaAllocation: number; // fraction of wage
  saAllocation: number;
  maAllocation: number;
}

export const CPF_ALLOCATION_RATES: CpfRateBracket[] = [
  {
    maxAge: 35,
    employeeRate: 0.20,
    employerRate: 0.17,
    totalRate: 0.37,
    oaAllocation: 0.2308,  // 23.08% of wage
    saAllocation: 0.0616,  // 6.16% of wage
    maAllocation: 0.0776,  // 7.76% of wage (sums may not equal exactly due to rounding)
  },
  {
    maxAge: 45,
    employeeRate: 0.20,
    employerRate: 0.17,
    totalRate: 0.37,
    oaAllocation: 0.2116,
    saAllocation: 0.0816,
    maAllocation: 0.0768,
  },
  {
    maxAge: 50,
    employeeRate: 0.20,
    employerRate: 0.17,
    totalRate: 0.37,
    oaAllocation: 0.1916,
    saAllocation: 0.0816,
    maAllocation: 0.0968,
  },
  {
    maxAge: 55,
    employeeRate: 0.175,
    employerRate: 0.155,
    totalRate: 0.33,
    oaAllocation: 0.1500,
    saAllocation: 0.0550,
    maAllocation: 0.1250,
  },
  {
    maxAge: 60,
    employeeRate: 0.125,
    employerRate: 0.115,
    totalRate: 0.24,
    oaAllocation: 0.1025,
    saAllocation: 0.0225,
    maAllocation: 0.1150,
  },
  {
    maxAge: 65,
    employeeRate: 0.075,
    employerRate: 0.085,
    totalRate: 0.16,
    oaAllocation: 0.0350,
    saAllocation: 0.0350,
    maAllocation: 0.0900,
  },
  {
    maxAge: 70,
    employeeRate: 0.05,
    employerRate: 0.075,
    totalRate: 0.125,
    oaAllocation: 0.0100,
    saAllocation: 0.0300,
    maAllocation: 0.0850,
  },
  {
    maxAge: 200, // 70+
    employeeRate: 0.05,
    employerRate: 0.075,
    totalRate: 0.125,
    oaAllocation: 0.0100,
    saAllocation: 0.0300,
    maAllocation: 0.0850,
  },
];

// CPF Interest Rates
export const CPF_OA_INTEREST_RATE = 0.025; // 2.5% p.a.
export const CPF_SA_INTEREST_RATE = 0.04;  // 4.0% p.a.
export const CPF_MA_INTEREST_RATE = 0.04;  // 4.0% p.a.

// CPF Life estimate: roughly $1 monthly payout per $10,000 in Retirement Account
export const CPF_LIFE_PAYOUT_PER_10K = 1.0; // $ per month per $10k RA balance

// CPF Life payout start age
export const CPF_LIFE_PAYOUT_START_AGE = 65;

// ─── IRAS Tax (YA2026) ──────────────────────────────────────────────────────

export interface TaxBracket {
  upperBound: number;   // chargeable income ceiling for this bracket
  rate: number;         // marginal rate
}

export const IRAS_TAX_BRACKETS: TaxBracket[] = [
  { upperBound: 20000,   rate: 0.00 },
  { upperBound: 30000,   rate: 0.02 },
  { upperBound: 40000,   rate: 0.035 },
  { upperBound: 80000,   rate: 0.07 },
  { upperBound: 120000,  rate: 0.115 },
  { upperBound: 160000,  rate: 0.15 },
  { upperBound: 200000,  rate: 0.18 },
  { upperBound: 240000,  rate: 0.19 },
  { upperBound: 280000,  rate: 0.195 },
  { upperBound: 320000,  rate: 0.20 },
  { upperBound: 500000,  rate: 0.22 },
  { upperBound: 1000000, rate: 0.23 },
  { upperBound: Infinity, rate: 0.24 },
];

// Tax Relief Caps
export const SRS_RELIEF_CAP = 15300;          // SRS cap for Singaporeans
export const LIFE_INSURANCE_RELIEF_CAP = 5000; // Life insurance relief cap
export const EARNED_INCOME_RELIEF_BELOW_55 = 1000;
export const EARNED_INCOME_RELIEF_55_TO_59 = 6000;
export const EARNED_INCOME_RELIEF_60_AND_ABOVE = 8000;
export const CPF_RELIEF_CAP = 37740; // Max CPF relief (employee portion)

// ─── Default Growth Rates ────────────────────────────────────────────────────
export const DEFAULT_PROPERTY_APPRECIATION = 0.03; // 3% p.a.
export const DEFAULT_EQUITY_RETURN = 0.07;          // 7% p.a.
export const DEFAULT_CONSERVATIVE_RETURN = 0.04;    // 4% p.a.
export const DEFAULT_AGGRESSIVE_RETURN = 0.08;      // 8% p.a.
export const DEFAULT_PASSIVE_INCOME_YIELD = 0.04;   // 4% yield on liquid assets

// ─── Stress Test Constants ───────────────────────────────────────────────────
export const RETRENCHMENT_DURATION_MONTHS = 12;
export const MARKET_CRASH_LOSS_PERCENT = 0.30; // 30% drop
export const LATE_CI_EXPENSE_INCREASE_PERCENT = 0.30; // 30% increase
export const FAMILY_LIABILITY_YEARS = 20; // years of income for death/disability check
