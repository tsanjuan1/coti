import { round } from "@/lib/utils";
import type {
  OperationProfitFixedCostLine,
  OperationProfitScenarioInput,
  OperationProfitScenarioResult
} from "@/modules/operation-profit/domain/types";

function calculateFixedCost(
  line: OperationProfitFixedCostLine,
  exchangeRate: number
) {
  switch (line.formulaMode) {
    case "usd_to_ars":
      return (line.inputA ?? 0) * exchangeRate;
    case "usd_to_ars_monthly":
      return ((line.inputA ?? 0) * exchangeRate) / (line.inputB ?? 12);
    case "manual":
    default:
      return line.amount ?? 0;
  }
}

export function calculateOperationProfit(
  input: OperationProfitScenarioInput
): OperationProfitScenarioResult {
  const costOfGoodsSold = input.billingAmount / input.markup;
  const grossProfit = input.billingAmount - costOfGoodsSold;
  const variableCostRate = input.variableCosts.reduce((sum, line) => sum + line.rate, 0);
  const variableCostTotal = input.billingAmount * variableCostRate;
  const fixedCostLines = input.fixedCosts.map((line) => ({
    ...line,
    computedAmount: round(calculateFixedCost(line, input.exchangeRate))
  }));
  const fixedCostTotal = fixedCostLines.reduce((sum, line) => sum + line.computedAmount, 0);
  const operatingResult = grossProfit - (variableCostTotal + fixedCostTotal);
  const contributionMarginRate = 1 - 1 / input.markup - variableCostRate;

  return {
    costOfGoodsSold: round(costOfGoodsSold),
    grossProfit: round(grossProfit),
    variableCostRate: round(variableCostRate),
    variableCostTotal: round(variableCostTotal),
    fixedCostTotal: round(fixedCostTotal),
    operatingResult: round(operatingResult),
    contributionMarginRate: round(contributionMarginRate),
    fixedCostLines
  };
}
