import type {
  BreakEvenFixedCostLine,
  BreakEvenSalespersonProfile,
  BreakEvenScenario,
  BreakEvenVariableCostLine
} from "@prisma/client";

import { defaultBreakEvenScenario } from "@/modules/break-even/defaults";
import type { BreakEvenScenarioInput } from "@/modules/break-even/domain/types";

export function breakEvenScenarioFromRecord(args: {
  scenario: BreakEvenScenario;
  fixedCosts: BreakEvenFixedCostLine[];
  variableCosts: BreakEvenVariableCostLine[];
  salespersonProfiles: BreakEvenSalespersonProfile[];
}): BreakEvenScenarioInput {
  return {
    ...structuredClone(defaultBreakEvenScenario),
    name: args.scenario.name,
    salesAmount: args.scenario.salesAmount,
    markup: args.scenario.markup,
    exchangeRate: args.scenario.exchangeRate,
    realBillingPesos: args.scenario.realBillingPesos,
    realBillingMarkup: args.scenario.realBillingMarkup,
    realBillingExchangeRate: args.scenario.realBillingExchangeRate,
    altBillingPesos: args.scenario.altBillingPesos,
    altBillingMarkup: args.scenario.altBillingMarkup,
    altBillingExchangeRate: args.scenario.altBillingExchangeRate,
    fixedCosts: args.fixedCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      formulaMode: line.formulaMode as "manual" | "sales_rate" | "usd_to_ars" | "usd_to_ars_monthly",
      amount: line.amount ?? undefined,
      inputA: line.inputA ?? undefined,
      inputB: line.inputB ?? undefined
    })),
    variableCosts: args.variableCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      rate: line.rate
    })),
    salespersonProfiles: args.salespersonProfiles.map((profile) => ({
      label: profile.label,
      salaryAmount: profile.salaryAmount,
      burdenAmount: profile.burdenAmount ?? undefined,
      contributionMargin: profile.contributionMargin
    }))
  };
}

export function breakEvenScenarioToCreatePayload(input: BreakEvenScenarioInput) {
  return {
    scenario: {
      name: input.name,
      salesAmount: input.salesAmount,
      markup: input.markup,
      exchangeRate: input.exchangeRate,
      realBillingPesos: input.realBillingPesos,
      realBillingMarkup: input.realBillingMarkup,
      realBillingExchangeRate: input.realBillingExchangeRate,
      altBillingPesos: input.altBillingPesos,
      altBillingMarkup: input.altBillingMarkup,
      altBillingExchangeRate: input.altBillingExchangeRate
    },
    fixedCosts: input.fixedCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      formulaMode: line.formulaMode,
      amount: line.amount ?? 0,
      inputA: line.inputA ?? 0,
      inputB: line.inputB ?? 0
    })),
    variableCosts: input.variableCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      rate: line.rate
    })),
    salespersonProfiles: input.salespersonProfiles.map((profile) => ({
      label: profile.label,
      salaryAmount: profile.salaryAmount,
      burdenAmount: profile.burdenAmount ?? 0,
      contributionMargin: profile.contributionMargin
    }))
  };
}
