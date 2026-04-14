import { round } from "@/lib/utils";
import type {
  OperationProfitScenarioInput,
  OperationProfitScenarioResult
} from "@/modules/operation-profit/domain/types";

export function calculateOperationProfit(
  input: OperationProfitScenarioInput
): OperationProfitScenarioResult {
  const costOfGoodsSold = input.billingAmount / input.markup;
  const grossProfit = input.billingAmount - costOfGoodsSold;
  const variableCostLines = input.variableCosts.map((line) => ({
    ...line,
    computedAmount: round(input.billingAmount * line.rate)
  }));
  const variableCostRate = input.variableCosts.reduce((sum, line) => sum + line.rate, 0);
  const variableCostTotal = variableCostLines.reduce((sum, line) => sum + line.computedAmount, 0);
  const operatingResult = grossProfit - variableCostTotal;
  const contributionMarginRate = 1 - 1 / input.markup - variableCostRate;

  return {
    costOfGoodsSold: round(costOfGoodsSold),
    grossProfit: round(grossProfit),
    variableCostRate: round(variableCostRate),
    variableCostTotal: round(variableCostTotal),
    operatingResult: round(operatingResult),
    contributionMarginRate: round(contributionMarginRate),
    variableCostLines
  };
}
