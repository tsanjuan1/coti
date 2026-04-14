import type {
  OperationProfitFixedCostLine,
  OperationProfitScenario,
  OperationProfitVariableCostLine
} from "@prisma/client";

import { defaultOperationProfitScenario } from "@/modules/operation-profit/defaults";
import type { OperationProfitScenarioInput } from "@/modules/operation-profit/domain/types";

export function operationScenarioFromRecord(args: {
  scenario: OperationProfitScenario;
  fixedCosts: OperationProfitFixedCostLine[];
  variableCosts: OperationProfitVariableCostLine[];
}): OperationProfitScenarioInput {
  return {
    ...structuredClone(defaultOperationProfitScenario),
    name: args.scenario.name,
    exchangeRate: args.scenario.exchangeRate,
    billingAmount: args.scenario.billingAmount,
    markup: args.scenario.markup,
    fixedCosts: args.fixedCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      formulaMode: line.formulaMode as "manual" | "usd_to_ars" | "usd_to_ars_monthly",
      amount: line.amount ?? undefined,
      inputA: line.inputA ?? undefined,
      inputB: line.inputB ?? undefined
    })),
    variableCosts: args.variableCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      rate: line.rate
    }))
  };
}

export function operationScenarioToCreatePayload(input: OperationProfitScenarioInput) {
  return {
    scenario: {
      name: input.name,
      exchangeRate: input.exchangeRate,
      billingAmount: input.billingAmount,
      markup: input.markup
    },
    fixedCosts: input.fixedCosts.map((line) => ({
      lineKey: line.lineKey,
      label: line.label,
      formulaMode: line.formulaMode,
      amount: line.amount ?? 0,
      inputA: line.inputA ?? 0,
      inputB: line.inputB ?? 0
    })),
    variableCosts: input.variableCosts
  };
}
