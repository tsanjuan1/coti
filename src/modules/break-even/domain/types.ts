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

export interface BreakEvenScenarioInput {
  name: string;
  salesAmount: number;
  markup: number;
  exchangeRate: number;
  fixedCosts: BreakEvenFixedCostLine[];
  variableCosts: BreakEvenVariableCostLine[];
}

export interface BreakEvenScenarioResult {
  costOfGoodsSold: number;
  grossProfit: number;
  totalFixedCosts: number;
  totalVariableCosts: number;
  contributionMarginAmount: number;
  operatingResult: number;
  contributionMarginRate: number;
  variableCostRate: number;
  breakEvenPesos: number;
  breakEvenUsd: number;
  fixedCostLines: Array<BreakEvenFixedCostLine & { computedAmount: number }>;
  variableCostLines: Array<BreakEvenVariableCostLine & { computedAmount: number }>;
}
