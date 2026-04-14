import type { OperationProfitScenarioInput } from "@/modules/operation-profit/domain/types";

export const defaultOperationProfitScenario: OperationProfitScenarioInput = {
  name: "Resultado por operacion base",
  exchangeRate: 1420,
  billingAmount: 1000000,
  markup: 1.2,
  variableCosts: [
    { lineKey: "iibb", label: "IIBB", rate: 0.05 },
    { lineKey: "imp_al_cheque", label: "Imp al cheque", rate: 0.00026 },
    { lineKey: "fletes", label: "Fletes", rate: 0.0119 },
    { lineKey: "consultoria", label: "Consultoria", rate: 0.01 },
    { lineKey: "comisiones", label: "Comisiones", rate: 0.01 }
  ]
};
