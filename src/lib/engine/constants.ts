// ─── Singapore Financial Constants (2026) ────────────────────────────────────
// Source references:
//   CPF: https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay
//   IRAS: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates
//   CPF Retirement Sums: https://www.cpf.gov.sg/member/retirement-income/retirement-withdrawals/cpf-retirement-sum

// ─── Mortality ───────────────────────────────────────────────────────────────
export const MORTALITY_AGE = {
  Male: 84,
  Female: 88,
} as const;

export const CONSERVATIVE_MORTALITY_AGE = 100;

// ─── Inflation ───────────────────────────────────────────────────────────────
export const DEFAULT_INFLATION_RATE = 0.03;           // 3% p.a. — Core inflation
export const DEFAULT_MEDICAL_INFLATION_RATE = 0.05;   // 5% p.a. — Medical cost inflation
export const DEFAULT_EDUCATION_INFLATION_RATE = 0.04; // 4% p.a. — Education cost inflation

// ─── CPF 2026 ────────────────────────────────────────────────────────────────
export const CPF_MONTHLY_SALARY_CEILING = 8000; // 2026 ceiling (increased from $6,800 in 2024)
export const CPF_ANNUAL_SALARY_CEILING = CPF_MONTHLY_SALARY_CEILING * 12;

/**
 * CPF Allocation Rates for Private Sector Employees (Singapore Citizens, 2026)
 * Each bracket: { maxAge, employee%, employer%, totalRate, oaRate, saRate, maRate }
 * Rates as decimals. OA/SA/MA allocation rates are fraction of ORDINARY WAGES.
 *
 * Source: CPF Board — Allocation Rates from 1 January 2025
 * Note: For age >55–60, employer rate increased to 15.5% from 1 Jan 2025.
 *       For age >60–65, rates increased from 1 Jan 2025.
 */
export interface CpfRateBracket {
  label: string;       // human-readable age range
  maxAge: number;      // up to and including this age
  employeeRate: number;
  employerRate: number;
  totalRate: number;
  oaAllocation: number; // fraction of ordinary wage
  saAllocation: number;
  maAllocation: number;
}

export const CPF_ALLOCATION_RATES: CpfRateBracket[] = [
  {
    label: "≤ 35",
    maxAge: 35,
    employeeRate: 0.20,
    employerRate: 0.17,
    totalRate: 0.37,
    oaAllocation: 0.2308,  // 23.08% of wage
    saAllocation: 0.0616,  // 6.16% of wage
    maAllocation: 0.0776,  // 7.76% of wage
  },
  {
    label: "36 – 45",
    maxAge: 45,
    employeeRate: 0.20,
    employerRate: 0.17,
    totalRate: 0.37,
    oaAllocation: 0.2116,
    saAllocation: 0.0816,
    maAllocation: 0.0768,
  },
  {
    label: "46 – 50",
    maxAge: 50,
    employeeRate: 0.20,
    employerRate: 0.17,
    totalRate: 0.37,
    oaAllocation: 0.1916,
    saAllocation: 0.0816,
    maAllocation: 0.0968,
  },
  {
    label: "51 – 55",
    maxAge: 55,
    employeeRate: 0.175,
    employerRate: 0.155,
    totalRate: 0.33,
    oaAllocation: 0.1500,
    saAllocation: 0.0550,
    maAllocation: 0.1250,
  },
  {
    label: "56 – 60",
    maxAge: 60,
    employeeRate: 0.155,
    employerRate: 0.155,
    totalRate: 0.31,
    oaAllocation: 0.1225,
    saAllocation: 0.0225,
    maAllocation: 0.1650,
  },
  {
    label: "61 – 65",
    maxAge: 65,
    employeeRate: 0.105,
    employerRate: 0.115,
    totalRate: 0.22,
    oaAllocation: 0.0350,
    saAllocation: 0.0350,
    maAllocation: 0.1500,
  },
  {
    label: "66 – 70",
    maxAge: 70,
    employeeRate: 0.075,
    employerRate: 0.09,
    totalRate: 0.165,
    oaAllocation: 0.0100,
    saAllocation: 0.0300,
    maAllocation: 0.1250,
  },
  {
    label: "> 70",
    maxAge: 200, // 70+
    employeeRate: 0.05,
    employerRate: 0.075,
    totalRate: 0.125,
    oaAllocation: 0.0100,
    saAllocation: 0.0100,
    maAllocation: 0.1050,
  },
];

// CPF Interest Rates
export const CPF_OA_INTEREST_RATE = 0.025; // 2.5% p.a. (floor rate)
export const CPF_SA_INTEREST_RATE = 0.04;  // 4.0% p.a. (floor rate)
export const CPF_MA_INTEREST_RATE = 0.04;  // 4.0% p.a. (floor rate)
export const CPF_RA_INTEREST_RATE = 0.04;  // 4.0% p.a. (Retirement Account)

/**
 * CPF Extra Interest (from 1 January 2016):
 *   - First $60,000 of combined balances: extra 1% on OA, SA, MA, RA
 *   - Next $30,000 of combined balances (above $60k): extra 1% on SA, MA, RA only (not OA)
 *   - For members aged 55 and above: extra 2% on first $30k, extra 1% on next $30k
 */
export const CPF_EXTRA_INTEREST_FIRST_60K = 0.01;  // 1% extra on first $60k
export const CPF_EXTRA_INTEREST_NEXT_30K = 0.01;   // 1% extra on next $30k (SA/MA/RA only)

// CPF Retirement Sums (2026) — adjusted annually by CPF Board
// These are for members turning 55 in 2026
export const CPF_RETIREMENT_SUMS = {
  BRS: 106500,   // Basic Retirement Sum (half of FRS)
  FRS: 213000,   // Full Retirement Sum
  ERS: 426000,   // Enhanced Retirement Sum (2x FRS, from 2025 onwards)
} as const;

export type CpfRetirementSumTier = keyof typeof CPF_RETIREMENT_SUMS;

// CPF LIFE estimated monthly payouts (at age 65, 2026 cohort estimates)
// These are approximations. Actual payouts depend on RA balance at payout eligibility age.
export const CPF_LIFE_PLANS = {
  STANDARD: {
    label: "Standard Plan",
    description: "Provides higher payouts that stay level for life. Leaving less for beneficiaries.",
    payoutPerDollarRA: 0.00556,  // ~$556/month per $100k RA at 65 (5.56% annual payout rate)
  },
  BASIC: {
    label: "Basic Plan",
    description: "Provides lower payouts for life but leaves more for beneficiaries.",
    payoutPerDollarRA: 0.00500,  // ~$500/month per $100k RA at 65 (5.00% annual payout rate)
  },
  ESCALATING: {
    label: "Escalating Plan",
    description: "Starts with lower payouts that increase by 2% per year to keep pace with inflation.",
    payoutPerDollarRA: 0.00417,  // ~$417/month per $100k RA at 65 (initial, 4.17% annual payout rate)
    annualEscalation: 0.02,      // 2% annual increase
  },
} as const;

export type CpfLifePlanType = keyof typeof CPF_LIFE_PLANS;

// CPF Life payout start age
export const CPF_LIFE_PAYOUT_START_AGE = 65;

// CPF RA creation age
export const CPF_RA_CREATION_AGE = 55;

// ─── IRAS Tax (YA2026) ──────────────────────────────────────────────────────
// Source: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates

export interface TaxBracket {
  upperBound: number;   // chargeable income ceiling for this bracket
  rate: number;         // marginal rate
  label: string;        // human-readable band
}

export const IRAS_TAX_BRACKETS: TaxBracket[] = [
  { upperBound: 20000,   rate: 0.00,  label: "First $20,000" },
  { upperBound: 30000,   rate: 0.02,  label: "$20,001 – $30,000" },
  { upperBound: 40000,   rate: 0.035, label: "$30,001 – $40,000" },
  { upperBound: 80000,   rate: 0.07,  label: "$40,001 – $80,000" },
  { upperBound: 120000,  rate: 0.115, label: "$80,001 – $120,000" },
  { upperBound: 160000,  rate: 0.15,  label: "$120,001 – $160,000" },
  { upperBound: 200000,  rate: 0.18,  label: "$160,001 – $200,000" },
  { upperBound: 240000,  rate: 0.19,  label: "$200,001 – $240,000" },
  { upperBound: 280000,  rate: 0.195, label: "$240,001 – $280,000" },
  { upperBound: 320000,  rate: 0.20,  label: "$280,001 – $320,000" },
  { upperBound: 500000,  rate: 0.22,  label: "$320,001 – $500,000" },
  { upperBound: 1000000, rate: 0.23,  label: "$500,001 – $1,000,000" },
  { upperBound: Infinity, rate: 0.24, label: "Above $1,000,000" },
];

// ─── Tax Relief Caps & Details ───────────────────────────────────────────────

// Personal Reliefs (with caps per relief)
export const TOTAL_PERSONAL_RELIEFS_CAP = 80000;  // Overall cap on all reliefs combined
export const CPF_RELIEF_CAP = 37740;               // Max CPF relief (employee portion)

// Earned Income Relief (age-based)
export const EARNED_INCOME_RELIEF_BELOW_55 = 1000;
export const EARNED_INCOME_RELIEF_55_TO_59 = 6000;
export const EARNED_INCOME_RELIEF_60_AND_ABOVE = 8000;

// SRS Contribution Relief
export const SRS_RELIEF_CAP = 15300;               // SRS cap for Singaporeans/PRs
export const SRS_RELIEF_CAP_FOREIGNER = 35700;     // SRS cap for foreigners (PR/foreigner employees)

// Life Insurance Relief
export const LIFE_INSURANCE_RELIEF_CAP = 5000;     // Cap on life insurance premium relief

// Qualifying Child Relief (QCR) — for tax planning
export const QUALIFYING_CHILD_RELIEF = 4000;       // Per child
export const QUALIFYING_CHILD_RELIEF_DISABLED = 7500; // Per disabled child

// Parent/Handicapped Dependent Relief
export const PARENT_RELIEF_SAME_HOUSEHOLD = 9000;   // Parent living with taxpayer
export const PARENT_RELIEF_SAME_HOUSEHOLD_HANDICAPPED = 14000;
export const PARENT_RELIEF_NOT_SAME_HOUSEHOLD = 5500;   // Parent not living with taxpayer
export const PARENT_RELIEF_NOT_SAME_HOUSEHOLD_HANDICAPPED = 10000;

// Working Mother's Child Relief — percentage based on income & child count
// 15% (1 child), 20% (2 children), 25% (3+ children) of earned income, capped at $22,500
export const WORKING_MOTHER_CHILD_RELIEF_1_CHILD = 0.15;
export const WORKING_MOTHER_CHILD_RELIEF_2_CHILDREN = 0.20;
export const WORKING_MOTHER_CHILD_RELIEF_3_PLUS_CHILDREN = 0.25;
export const WORKING_MOTHER_CHILD_RELIEF_CAP = 22500;

// NSman Relief
export const NSMAN_RELIEF = 3000;                   // For active NSmen

// CPF Top-up Relief
export const CPF_TOPUP_RELIEF_CAP = 8000;          // Capital incentive program (CIP) — per recipient (self or family member)

// ─── Asset Categories & Default Growth Rates (Singapore 2026) ────────────────
export const ASSET_CATEGORIES = {
  stocks: { label: "Stocks / Equities", defaultRate: 0.07 },
  bonds: { label: "Bonds / Fixed Income", defaultRate: 0.04 },
  realestate: { label: "Real Estate (Non-Property)", defaultRate: 0.03 },
  cash: { label: "Cash / Savings / Emergency Fund", defaultRate: 0.0025 },
  crypto: { label: "Cryptocurrency", defaultRate: 0.0 },
  commodities: { label: "Gold / Commodities", defaultRate: 0.025 },
  other: { label: "Other / Custom", defaultRate: 0.0 },
} as const;

// ─── Liability Categories & Default Interest Rates (Singapore 2026) ──────────
export const LIABILITY_CATEGORIES = {
  mortgage: { label: "Mortgage (HDB / Private)", defaultRate: 0.026 },
  creditcard: { label: "Credit Card", defaultRate: 0.24 },
  personalloan: { label: "Personal Loan", defaultRate: 0.055 },
  studentloan: { label: "Student Loan", defaultRate: 0.035 },
  carloan: { label: "Car Loan", defaultRate: 0.03 },
  other: { label: "Other Debt", defaultRate: 0.05 },
} as const;

// ─── Default Growth Rates ────────────────────────────────────────────────────
export const DEFAULT_PROPERTY_APPRECIATION = 0.03;  // 3% p.a.
export const DEFAULT_EQUITY_RETURN = 0.07;           // 7% p.a. (long-term equity market)
export const DEFAULT_CONSERVATIVE_RETURN = 0.04;     // 4% p.a. (bonds/FD)
export const DEFAULT_AGGRESSIVE_RETURN = 0.08;       // 8% p.a.
export const DEFAULT_PASSIVE_INCOME_YIELD = 0.04;    // 4% yield on liquid assets
export const DEFAULT_CASH_YIELD = 0.0005;            // 0.05% — typical savings account
export const DEFAULT_FD_TBILL_YIELD = 0.03;          // 3% — fixed deposits / T-bills
export const DEFAULT_ROBO_ADVISOR_RETURN = 0.06;     // 6% — balanced robo portfolio

// Shield Plan Premium Escalation
export const DEFAULT_SHIELD_PREMIUM_ESCALATION = 0.05; // 5% p.a. medical cost inflation

// ─── Stress Test Constants ───────────────────────────────────────────────────
export const RETRENCHMENT_DURATION_MONTHS = 12;
export const MARKET_CRASH_LOSS_PERCENT = 0.30;         // 30% drop
export const LATE_CI_EXPENSE_INCREASE_PERCENT = 0.30;  // 30% increase in expenses
export const FAMILY_LIABILITY_YEARS = 20;              // years of income for death/disability check

// ─── LIA Insurance Benchmarks ────────────────────────────────────────────────
// Source: Life Insurance Association of Singapore — Recommended coverage guidelines
// Updated per 2026 guidelines
export const LIA_BENCHMARKS = {
  DEATH: {
    label: "Death / Terminal Illness",
    multiplierOfIncome: 10,    // 10× annual income
  },
  TPD: {
    label: "Total Permanent Disability",
    multiplierOfIncome: 10,    // 10× annual income
  },
  CRITICAL_ILLNESS_EARLY: {
    label: "Critical Illness (Early Stage / ECI)",
    multiplierOfIncome: 3,     // 3× annual income
  },
  CRITICAL_ILLNESS_LATE: {
    label: "Critical Illness (Late Stage / CI)",
    multiplierOfIncome: 5,     // 5× annual income
  },
  DISABILITY_INCOME: {
    label: "Disability Income",
    monthlyPercentOfIncome: 0.75,  // 75% of monthly income
  },
} as const;

// ─── CPF Retirement Sum Historical & Projected Data ────────────────────────
// Based on CPF Board adjustments 2006–2026 (historical data)
// Used for trend projection over next 100 years
export const CPF_RETIREMENT_SUM_HISTORY = {
  BRS: [
    { year: 2006, amount: 39500 },
    { year: 2010, amount: 48500 },
    { year: 2015, amount: 75500 },
    { year: 2020, amount: 92500 },
    { year: 2024, amount: 102000 },
    { year: 2026, amount: 106500 },
  ],
  FRS: [
    { year: 2006, amount: 79000 },
    { year: 2010, amount: 97000 },
    { year: 2015, amount: 151000 },
    { year: 2020, amount: 185000 },
    { year: 2024, amount: 204000 },
    { year: 2026, amount: 213000 },
  ],
  ERS: [
    { year: 2006, amount: 0 }, // ERS introduced in 2025
    { year: 2024, amount: 408000 },
    { year: 2025, amount: 417000 },
    { year: 2026, amount: 426000 },
  ],
} as const;

/**
 * Project CPF Retirement Sum using linear trend of past data.
 * Calculates annual increase rate from oldest to newest historical data,
 * then projects forward to specified year using straight-line extrapolation.
 *
 * @param tier - BRS, FRS, or ERS
 * @param targetYear - Year to project to
 * @returns Projected retirement sum amount
 */
export function projectCpfRetirementSum(
  tier: CpfRetirementSumTier,
  targetYear: number
): number {
  const history = CPF_RETIREMENT_SUM_HISTORY[tier];
  if (history.length < 2) return CPF_RETIREMENT_SUMS[tier];

  // Filter out zero entries (ERS before 2025)
  const validEntries = history.filter((h) => h.amount > 0);
  if (validEntries.length < 2) return CPF_RETIREMENT_SUMS[tier];

  const oldest = validEntries[0];
  const newest = validEntries[validEntries.length - 1];
  const yearsDiff = newest.year - oldest.year;
  const amountDiff = newest.amount - oldest.amount;
  const annualIncrease = amountDiff / yearsDiff;

  // Project to target year using straight-line increment
  const yearsFromNewest = targetYear - newest.year;
  return newest.amount + annualIncrease * yearsFromNewest;
}

// ─── Life Events / Milestones ────────────────────────────────────────────────
export const EVENT_TYPES = {
  wedding: {
    label: "Wedding",
    suggestedCost: 30000,
    description: "Marriage ceremony, reception, travel",
  },
  birth: {
    label: "Birth & Early Years",
    suggestedCost: 15000,
    description: "Delivery, confinement, initial childcare",
  },
  education: {
    label: "Education",
    suggestedCost: 15000,
    description: "School fees, tuition, materials (annual)",
  },
  home_purchase: {
    label: "Home Purchase",
    suggestedCost: 100000,
    description: "Down payment on HDB/condo",
  },
  job_loss: {
    label: "Job Loss / Career Break",
    suggestedCost: 50000,
    description: "Income loss buffer (6-12 months living expenses)",
  },
  relocation: {
    label: "Relocation / Moving",
    suggestedCost: 15000,
    description: "House moving, renovation, new location setup",
  },
  inheritance: {
    label: "Inheritance / Windfall",
    suggestedCost: 50000,
    description: "Anticipated inheritance or bonus income",
  },
  medical: {
    label: "Medical / Healthcare",
    suggestedCost: 20000,
    description: "Surgery, long-term medical treatment (annual)",
  },
  custom: {
    label: "Custom Event",
    suggestedCost: 10000,
    description: "Other planned event",
  },
} as const;
