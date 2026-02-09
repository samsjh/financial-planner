// ─── Zustand Store — Global Simulation State ─────────────────────────────────
import { create } from "zustand";
import type {
  ClientProfile,
  DashboardState,
} from "./types";
import { runProjection } from "./engine/projectionLogic";

const defaultProfile: ClientProfile = {
  name: "",
  dateOfBirth: "1995-01-01",
  currentAge: 31,
  gender: "Male",
  occupation: "Private Sector Employee",

  monthlyGrossIncome: 6000,
  annualBonus: 12000,
  rentalIncome: 0,
  sideIncome: 0,

  desiredRetirementAge: 65,
  desiredMonthlySpending: 4000,
  riskAppetiteGrowthRate: 0.06,

  cpfOaBalance: 50000,
  cpfSaBalance: 30000,
  cpfMaBalance: 15000,

  housingUsageOaMonthly: 800,
  shieldPlanPremiumMa: 600,

  annualSrsContribution: 0,
  lifeInsuranceRelief: 0,
  srsReliefYearsRemaining: 0,
  lifeInsuranceReliefYearsRemaining: 0,

  monthlyFixedExpenses: 2000,
  monthlyVariableExpenses: 1500,
  currentLifestyleExpenses: 3500,

  conservativeMode: false,
  useInflationAdjusted: true,
  inflationRate: 0.03,

  activeStressTest: "none",
  stressTestStartAge: 40,
  stressTestDuration: 12,

  earlyCiPayout: 200000,
  lateCiPayout: 300000,
  deathPayout: 500000,

  propertyMarketValue: 800000,
  outstandingMortgage: 400000,
  cpfPrincipalUsedForProperty: 100000,
  propertyAppreciationRate: 0.03,
  mortgageInterestRate: 0.035,
  mortgageYearsRemaining: 20,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  profile: defaultProfile,
  assets: [
    {
      id: "1",
      name: "Emergency Fund",
      category: "liquid",
      currentValue: 20000,
      projectedAppreciationRate: 0.02,
    },
    {
      id: "2",
      name: "Stock Portfolio",
      category: "liquid",
      currentValue: 50000,
      projectedAppreciationRate: 0.07,
    },
  ],
  liabilities: [],
  lifeEvents: [],
  simulationResult: null,

  setProfile: (partial) =>
    set((state) => ({
      profile: { ...state.profile, ...partial },
    })),

  setAssets: (assets) => set({ assets }),
  addAsset: (asset) =>
    set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (id) =>
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),

  setLiabilities: (liabilities) => set({ liabilities }),
  addLiability: (liability) =>
    set((state) => ({ liabilities: [...state.liabilities, liability] })),
  removeLiability: (id) =>
    set((state) => ({
      liabilities: state.liabilities.filter((l) => l.id !== id),
    })),

  setLifeEvents: (events) => set({ lifeEvents: events }),
  addLifeEvent: (event) =>
    set((state) => ({ lifeEvents: [...state.lifeEvents, event] })),
  removeLifeEvent: (id) =>
    set((state) => ({
      lifeEvents: state.lifeEvents.filter((e) => e.id !== id),
    })),

  runSimulation: () => {
    const { profile, assets, liabilities, lifeEvents } = get();
    const result = runProjection(profile, assets, liabilities, lifeEvents);
    set({ simulationResult: result });
  },
}));
