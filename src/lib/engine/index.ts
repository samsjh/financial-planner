export { runProjection } from "./projectionLogic";
export {
  calculateAnnualCpfContributions,
  projectCpfOneYear,
  estimateCpfLifeMonthlyPayout,
  estimateRaBalance,
  calculatePropertySaleProceeds,
  getCpfRateBracket,
} from "./cpfLogic";
export { calculateAnnualTax, getMarginalTaxRate } from "./taxLogic";
export type { TaxReliefInputs, TaxBreakdown } from "./taxLogic";
export {
  projectCpfRetirementSum,
  CPF_RETIREMENT_SUM_HISTORY,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
} from "./constants";
