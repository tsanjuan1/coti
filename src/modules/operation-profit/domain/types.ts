export interface OperationProfitVariableCostLine {
  lineKey: string;
  label: string;
  rate: number;
}

export interface OperationProfitScenarioInput {
  name: string;
  exchangeRate: number;
  billingAmount: number;
  markup: number;
  variableCosts: OperationProfitVariableCostLine[];
}

export interface OperationProfitScenarioResult {
  costOfGoodsSold: number;
  grossProfit: number;
  variableCostRate: number;
  variableCostTotal: number;
  operatingResult: number;
  contributionMarginRate: number;
  variableCostLines: Array<OperationProfitVariableCostLine & { computedAmount: number }>;
}
