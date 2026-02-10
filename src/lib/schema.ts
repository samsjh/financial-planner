// ─── Zod Form Schema ─────────────────────────────────────────────────────────
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  currentAge: z.coerce.number().min(18).max(100),
  gender: z.enum(["Male", "Female"]),
  occupation: z.string().min(1),

  monthlyGrossIncome: z.coerce.number().min(0),
  annualBonus: z.coerce.number().min(0),
  rentalIncome: z.coerce.number().min(0),
  sideIncome: z.coerce.number().min(0),

  desiredRetirementAge: z.coerce.number().min(40).max(100),
  desiredMonthlySpending: z.coerce.number().min(0),
  riskAppetiteGrowthRate: z.coerce.number().min(0).max(0.20),

  cpfOaBalance: z.coerce.number().min(0),
  cpfSaBalance: z.coerce.number().min(0),
  cpfMaBalance: z.coerce.number().min(0),

  housingUsageOaMonthly: z.coerce.number().min(0),
  shieldPlanPremiumMa: z.coerce.number().min(0),

  annualSrsContribution: z.coerce.number().min(0),
  lifeInsuranceRelief: z.coerce.number().min(0),

  // Tax Reliefs — Family
  numberOfChildren: z.coerce.number().min(0).max(20),
  numberOfDisabledChildren: z.coerce.number().min(0).max(20),
  numberOfParentsSameHousehold: z.coerce.number().min(0).max(10),
  numberOfParentsNotSameHousehold: z.coerce.number().min(0).max(10),
  numberOfHandicappedParentsSameHousehold: z.coerce.number().min(0).max(10),
  numberOfHandicappedParentsNotSameHousehold: z.coerce.number().min(0).max(10),

  // Tax Reliefs — Working Mother & NSman
  isWorkingMother: z.boolean(),
  isActiveNsman: z.boolean(),

  // Tax Reliefs — CPF Top-up
  annualCpfTopUp: z.coerce.number().min(0),

  monthlyFixedExpenses: z.coerce.number().min(0),
  monthlyVariableExpenses: z.coerce.number().min(0),
  currentLifestyleExpenses: z.coerce.number().min(0),

  conservativeMode: z.boolean(),
  useInflationAdjusted: z.boolean(),
  inflationRate: z.coerce.number().min(0).max(0.15),

  activeStressTest: z.enum([
    "none",
    "retrenchment",
    "marketCrash",
    "longevityRisk",
    "earlyCi",
    "lateCi",
    "deathDisability",
  ]),
  stressTestStartAge: z.coerce.number().min(18).max(100),
  stressTestDuration: z.coerce.number().min(1).max(120),

  earlyCiPayout: z.coerce.number().min(0),
  lateCiPayout: z.coerce.number().min(0),
  deathPayout: z.coerce.number().min(0),

  propertyMarketValue: z.coerce.number().min(0),
  outstandingMortgage: z.coerce.number().min(0),
  cpfPrincipalUsedForProperty: z.coerce.number().min(0),
  propertyAppreciationRate: z.coerce.number().min(0).max(0.20),
  mortgageInterestRate: z.coerce.number().min(0).max(0.15),
  mortgageYearsRemaining: z.coerce.number().min(0).max(50),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const lifeEventSchema = z.object({
  id: z.string(),
  eventType: z.enum([
    "wedding",
    "birth",
    "education",
    "home_purchase",
    "job_loss",
    "relocation",
    "inheritance",
    "medical",
    "custom",
  ]),
  description: z.string().min(1, "Description is required"),
  cost: z.coerce.number(),
  year: z.coerce.number().min(2026).max(2150),
  triggerAge: z.coerce.number().min(18).max(120).optional(),
  isRecurring: z.boolean().optional(),
  endYear: z.coerce.number().min(2026).max(2150).optional(),
});

export type LifeEventFormValues = z.infer<typeof lifeEventSchema>;
