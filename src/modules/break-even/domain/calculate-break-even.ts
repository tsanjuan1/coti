import { round } from "@/lib/utils";
import type {
  BreakEvenFixedCostLine,
  BreakEvenScenarioInput,
  BreakEvenScenarioResult
} from "@/modules/break-even/domain/types";

function calculateFixedCostLine(
  line: BreakEvenFixedCostLine,
  salesAmount: number,
  exchangeRate: number
) {
  switch (line.formulaMode) {
    case "sales_rate":
      return salesAmount * (line.inputA ?? 0);
    case "usd_to_ars":
      return (line.inputA ?? 0) * exchangeRate;
    case "usd_to_ars_monthly":
      return ((line.inputA ?? 0) * exchangeRate) / (line.inputB ?? 12);
    case "manual":
    default:
      return line.amount ?? 0;
  }
}

export function calculateBreakEvenScenario(input: BreakEvenScenarioInput): BreakEvenScenarioResult {
  const fixedCostLines = input.fixedCosts.map((line) => ({
    ...line,
    computedAmount: round(calculateFixedCostLine(line, input.salesAmount, input.exchangeRate))
  }));
  const variableCostLines = input.variableCosts.map((line) => ({
    ...line,
    computedAmount: round(input.salesAmount * line.rate)
  }));

  const totalFixedCosts = fixedCostLines.reduce((sum, line) => sum + line.computedAmount, 0);
  const totalVariableCosts = variableCostLines.reduce((sum, line) => sum + line.computedAmount, 0);
  const variableCostRate = input.variableCosts.reduce((sum, line) => sum + line.rate, 0);
  const costOfGoodsSold = input.salesAmount / input.markup;
  const grossProfit = input.salesAmount - costOfGoodsSold;
  const contributionMarginAmount = grossProfit - totalVariableCosts;
  const operatingResult = contributionMarginAmount - totalFixedCosts;
  const contributionMarginRate = 1 - 1 / input.markup - variableCostRate;
  const breakEvenPesos =
    contributionMarginRate > 0 ? totalFixedCosts / contributionMarginRate : 0;
  const breakEvenUsd =
    input.exchangeRate > 0 ? breakEvenPesos / input.exchangeRate : 0;

  return {
    costOfGoodsSold: round(costOfGoodsSold),
    grossProfit: round(grossProfit),
    totalFixedCosts: round(totalFixedCosts),
    totalVariableCosts: round(totalVariableCosts),
    contributionMarginAmount: round(contributionMarginAmount),
    operatingResult: round(operatingResult),
    contributionMarginRate: round(contributionMarginRate),
    variableCostRate: round(variableCostRate),
    breakEvenPesos: round(breakEvenPesos),
    breakEvenUsd: round(breakEvenUsd),
    fixedCostLines,
    variableCostLines
  };
}
