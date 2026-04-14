export interface OperationProfitVariableCostLine {
  lineKey: string;
  label: string;
  rate: number;
}

export interface OperationProfitFixedCostLine {
  lineKey: string;
  label: string;
  formulaMode: "manual" | "usd_to_ars" | "usd_to_ars_monthly";
  amount?: number;
  inputA?: number;
  inputB?: number;
}

export interface OperationProfitScenarioInput {
  name: string;
  exchangeRate: number;
  billingAmount: number;
  markup: number;
  variableCosts: OperationProfitVariableCostLine[];
  fixedCosts: OperationProfitFixedCostLine[];
}

export interface OperationProfitScenarioResult {
  costOfGoodsSold: number;
  grossProfit: number;
  variableCostRate: number;
  variableCostTotal: number;
  fixedCostTotal: number;
  operatingResult: number;
  contributionMarginRate: number;
  fixedCostLines: Array<OperationProfitFixedCostLine & { computedAmount: number }>;
}
