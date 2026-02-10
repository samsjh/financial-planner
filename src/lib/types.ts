// ─── Singapore Wealth Management Dashboard — Core Types ─────────────────────

export type Gender = "Male" | "Female";

export type StressTestType =
  | "none"
  | "retrenchment"
  | "marketCrash"
  | "longevityRisk"
  | "earlyCi"
  | "lateCi"
  | "deathDisability";

// ─── Client Profile ──────────────────────────────────────────────────────────

export interface ClientProfile {
  // Personal
  name: string;
  dateOfBirth: string; // ISO date string
  currentAge: number;
  gender: Gender;
  occupation: string;

  // Employment & Income
  monthlyGrossIncome: number;
  annualBonus: number;
  rentalIncome: number;
  sideIncome: number;

  // Retirement Goals
  desiredRetirementAge: number;
  desiredMonthlySpending: number; // in today's dollars
  riskAppetiteGrowthRate: number; // e.g. 0.06 for 6%

  // CPF Current Balances
  cpfOaBalance: number;
  cpfSaBalance: number;
  cpfMaBalance: number;

  // CPF Deductions
  housingUsageOaMonthly: number; // monthly OA deduction for housing
  shieldPlanPremiumMa: number; // annual MA deduction for shield plans

  // SRS & Reliefs
  annualSrsContribution: number;
  lifeInsuranceRelief: number; // annual life insurance premiums

  // Tax Reliefs — Family
  numberOfChildren: number; // qualifying children for QCR
  numberOfDisabledChildren: number; // disabled children (higher QCR)
  numberOfParentsSameHousehold: number; // parents/grandparents living with taxpayer
  numberOfParentsNotSameHousehold: number; // parents/grandparents NOT living with taxpayer
  numberOfHandicappedParentsSameHousehold: number;
  numberOfHandicappedParentsNotSameHousehold: number;

  // Tax Reliefs — Working Mother's Child Relief
  isWorkingMother: boolean; // eligible for WMCR

  // Tax Reliefs — NSman
  isActiveNsman: boolean; // active NSman status

  // Tax Reliefs — CPF Top-up
  annualCpfTopUp: number; // voluntary CPF top-up contributions (capped at $8k per recipient)

  // Expenses
  monthlyFixedExpenses: number; // mortgage, loans, insurance
  monthlyVariableExpenses: number; // lifestyle
  currentLifestyleExpenses: number; // total pre-retirement monthly spend

  // Advanced Settings
  conservativeMode: boolean; // extend mortality to 100
  useInflationAdjusted: boolean;
  inflationRate: number; // default 0.03

  // Stress Test
  activeStressTest: StressTestType;
  stressTestStartAge: number; // when to apply stress test
  stressTestDuration: number; // months for retrenchment/earlyCi

  // CI / Death payouts
  earlyCiPayout: number;
  lateCiPayout: number;
  deathPayout: number;

  // Property
  propertyMarketValue: number;
  outstandingMortgage: number;
  cpfPrincipalUsedForProperty: number;
  propertyAppreciationRate: number;
  mortgageInterestRate: number;
  mortgageYearsRemaining: number;
}

// ─── Assets & Liabilities ────────────────────────────────────────────────────

export interface Asset {
  id: string;
  name: string;
  category: "fixed" | "liquid";
  currentValue: number;
  projectedAppreciationRate: number; // annual, e.g. 0.07
}

export interface Liability {
  id: string;
  name: string;
  category: "longTerm" | "shortTerm";
  currentBalance: number;
  interestRate: number; // annual
  monthlyPayment: number;
  yearsRemaining: number;
}

// ─── Life Events / Milestones ────────────────────────────────────────────────

export interface LifeEvent {
  id: string;
  year: number;
  description: string;
  cost: number; // positive = outflow, negative = inflow
}

// ─── Simulation Results ──────────────────────────────────────────────────────

export interface YearlySnapshot {
  year: number;
  age: number;

  // Income
  grossIncome: number; // 0 if retired
  passiveIncome: number; // investment returns + CPF Life payout
  totalIncome: number;

  // CPF
  cpfOa: number;
  cpfSa: number;
  cpfMa: number;
  cpfTotal: number;
  cpfContributionEmployee: number;
  cpfContributionEmployer: number;

  // Expenses
  livingExpenses: number; // pre- or post-retirement
  inflationAdjustedExpenses: number;
  lifeEventCost: number;
  taxPayable: number;

  // Assets
  liquidAssets: number;
  fixedAssets: number;
  totalAssets: number;

  // Liabilities
  totalLiabilities: number;

  // Net Worth
  netWorth: number;
  liquidNetWorth: number;

  // Derived
  monthlySurplusDeficit: number;
  cumulativeSurplus: number;
  isRetired: boolean;

  // Present value (inflation-adjusted)
  netWorthPV: number;
  liquidAssetsPV: number;
}

export interface SimulationResult {
  snapshots: YearlySnapshot[];

  // KPIs
  financialFreedomAge: number | null; // age where passive income > desired spend
  projectedShortfallSurplus: number; // total assets at mortality
  mortalityAge: number;
  retirementAge: number;

  // Gap Analysis
  gapAnalysis: GapDataPoint[];

  // Property Sale
  propertySaleProceeds: PropertySaleProceeds | null;
}

export interface GapDataPoint {
  age: number;
  year: number;
  projectedMonthlyPassiveIncome: number;
  desiredMonthlySpend: number; // inflation-adjusted
  gap: number; // positive = surplus, negative = shortfall
}

export interface PropertySaleProceeds {
  marketValue: number;
  outstandingLoan: number;
  cpfPrincipalUsed: number;
  cpfAccruedInterest: number;
  netCashProceeds: number;
}

// ─── Store State ─────────────────────────────────────────────────────────────

export interface DashboardState {
  profile: ClientProfile;
  assets: Asset[];
  liabilities: Liability[];
  lifeEvents: LifeEvent[];
  simulationResult: SimulationResult | null;

  // Actions
  setProfile: (profile: Partial<ClientProfile>) => void;
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  setLiabilities: (liabilities: Liability[]) => void;
  addLiability: (liability: Liability) => void;
  removeLiability: (id: string) => void;
  setLifeEvents: (events: LifeEvent[]) => void;
  addLifeEvent: (event: LifeEvent) => void;
  removeLifeEvent: (id: string) => void;
  runSimulation: () => void;
}
