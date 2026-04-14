export interface BreakEvenFixedCostLine {
  lineKey: string;
  label: string;
  formulaMode: "manual" | "sales_rate" | "usd_to_ars" | "usd_to_ars_monthly";
  amount?: number;
  inputA?: number;
  inputB?: number;
}

export interface BreakEvenVariableCostLine {
  lineKey: string;
  label: string;
  rate: number;
}

export interface BreakEvenSalespersonProfile {
  label: string;
  salaryAmount: number;
  burdenAmount?: number;
  contributionMargin: number;
}

export interface BreakEvenScenarioInput {
  name: string;
  salesAmount: number;
  markup: number;
  exchangeRate: number;
  realBillingPesos: number;
  realBillingMarkup: number;
  realBillingExchangeRate: number;
  altBillingPesos: number;
  altBillingMarkup: number;
  altBillingExchangeRate: number;
  fixedCosts: BreakEvenFixedCostLine[];
  variableCosts: BreakEvenVariableCostLine[];
  salespersonProfiles: BreakEvenSalespersonProfile[];
}

export interface BreakEvenScenarioResult {
  totalCost: number;
  grossProfit: number;
  totalFixedCosts: number;
  operatingResult: number;
  contributionMarginRate: number;
  variableCostRate: number;
  breakEvenPesos: number;
  breakEvenUsd: number;
  altBreakEvenPesos: number;
  altBreakEvenUsd: number;
  fixedCostLines: Array<BreakEvenFixedCostLine & { computedAmount: number }>;
  salespersonProfiles: Array<
    BreakEvenSalespersonProfile & {
      burdenAmount: number;
      salaryShare: number;
      allocatedFixedCost: number;
      minimumBillingPesos: number;
      minimumBillingUsd: number;
      salaryOnlyMinimumPesos: number;
      salaryOnlyMinimumUsd: number;
    }
  >;
}
