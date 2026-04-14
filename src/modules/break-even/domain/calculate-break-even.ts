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
  const totalFixedCosts = fixedCostLines.reduce((sum, line) => sum + line.computedAmount, 0);
  const variableCostRate = input.variableCosts.reduce((sum, line) => sum + line.rate, 0);
  const totalCost = input.salesAmount / input.markup;
  const grossProfit = input.salesAmount - totalCost;
  const operatingResult = grossProfit - totalFixedCosts;
  const contributionMarginRate = 1 - 1 / input.realBillingMarkup - variableCostRate;
  const altContributionMarginRate = 1 - 1 / input.altBillingMarkup - variableCostRate;
  const breakEvenPesos =
    contributionMarginRate > 0 ? totalFixedCosts / contributionMarginRate : 0;
  const altBreakEvenPesos =
    altContributionMarginRate > 0 ? totalFixedCosts / altContributionMarginRate : 0;
  const breakEvenUsd =
    input.realBillingExchangeRate > 0 ? breakEvenPesos / input.realBillingExchangeRate : 0;
  const altBreakEvenUsd =
    input.altBillingExchangeRate > 0 ? altBreakEvenPesos / input.altBillingExchangeRate : 0;

  const salaryMass = input.salespersonProfiles.reduce((sum, profile) => sum + profile.salaryAmount, 0);
  const burdenRate =
    (fixedCostLines.find((line) => line.lineKey === "cargas_sociales")?.computedAmount ?? 0) /
    Math.max(fixedCostLines.find((line) => line.lineKey === "sueldos")?.computedAmount ?? 1, 1);

  const salespersonProfiles = input.salespersonProfiles.map((profile) => {
    const burdenAmount = profile.burdenAmount ?? profile.salaryAmount * burdenRate;
    const salaryShare = salaryMass > 0 ? profile.salaryAmount / salaryMass : 0;
    const allocatedFixedCost = totalFixedCosts * salaryShare;
    const minimumBillingPesos =
      profile.contributionMargin > 0 ? allocatedFixedCost / profile.contributionMargin : 0;
    const salaryOnlyMinimumPesos =
      profile.contributionMargin > 0 ? (profile.salaryAmount + burdenAmount) / profile.contributionMargin : 0;

    return {
      ...profile,
      burdenAmount: round(burdenAmount),
      salaryShare: round(salaryShare),
      allocatedFixedCost: round(allocatedFixedCost),
      minimumBillingPesos: round(minimumBillingPesos),
      minimumBillingUsd:
        input.realBillingExchangeRate > 0
          ? round(minimumBillingPesos / input.realBillingExchangeRate)
          : 0,
      salaryOnlyMinimumPesos: round(salaryOnlyMinimumPesos),
      salaryOnlyMinimumUsd:
        input.realBillingExchangeRate > 0
          ? round(salaryOnlyMinimumPesos / input.realBillingExchangeRate)
          : 0
    };
  });

  return {
    totalCost: round(totalCost),
    grossProfit: round(grossProfit),
    totalFixedCosts: round(totalFixedCosts),
    operatingResult: round(operatingResult),
    contributionMarginRate: round(contributionMarginRate),
    variableCostRate: round(variableCostRate),
    breakEvenPesos: round(breakEvenPesos),
    breakEvenUsd: round(breakEvenUsd),
    altBreakEvenPesos: round(altBreakEvenPesos),
    altBreakEvenUsd: round(altBreakEvenUsd),
    fixedCostLines,
    salespersonProfiles
  };
}
