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
  ],
  fixedCosts: [
    { lineKey: "sueldos", label: "Sueldos", formulaMode: "manual", amount: 18760000 },
    { lineKey: "cargas_sociales", label: "Cargas sociales", formulaMode: "manual", amount: 7100000 },
    { lineKey: "sindicatos", label: "Sindicatos", formulaMode: "manual", amount: 700000 },
    { lineKey: "alquiler", label: "Alquiler", formulaMode: "usd_to_ars", inputA: 3000 },
    { lineKey: "estudio_contable", label: "Estudio contable", formulaMode: "manual", amount: 450000 },
    { lineKey: "abogados", label: "Abogados", formulaMode: "manual", amount: 250000 },
    { lineKey: "bancos", label: "Bancos", formulaMode: "manual", amount: 50000 },
    { lineKey: "mant_ctas_bancarias", label: "Mant. ctas bancarias", formulaMode: "manual", amount: 300000 },
    { lineKey: "seguro", label: "Seguro", formulaMode: "manual", amount: 213000 },
    { lineKey: "alarma", label: "Alarma", formulaMode: "manual", amount: 90000 },
    { lineKey: "limpieza", label: "Limpieza", formulaMode: "manual", amount: 160000 },
    { lineKey: "capacitaciones", label: "Capacitaciones", formulaMode: "manual", amount: 400000 },
    { lineKey: "vituallas", label: "Vituallas", formulaMode: "manual", amount: 280000 },
    { lineKey: "swiss_medical", label: "Swiss Medical", formulaMode: "manual", amount: 2000000 },
    { lineKey: "posnet", label: "Posnet", formulaMode: "manual", amount: 1000 },
    { lineKey: "fibertel", label: "Fibertel", formulaMode: "manual", amount: 370000 },
    { lineKey: "lineas_telefonicas", label: "Lineas telefonicas", formulaMode: "manual", amount: 280000 },
    { lineKey: "abl", label: "ABL", formulaMode: "manual", amount: 216000 },
    { lineKey: "aysa", label: "AYSA", formulaMode: "manual", amount: 70000 },
    { lineKey: "gcba", label: "GCBA", formulaMode: "manual", amount: 97867 },
    { lineKey: "edenor", label: "EDENOR", formulaMode: "manual", amount: 850000 },
    { lineKey: "oppen", label: "Oppen", formulaMode: "usd_to_ars", inputA: 750 },
    { lineKey: "pipedrive", label: "Pipedrive", formulaMode: "usd_to_ars", inputA: 350 },
    { lineKey: "licencias_microsoft", label: "Licencias Microsoft", formulaMode: "usd_to_ars_monthly", inputA: 600, inputB: 12 },
    { lineKey: "innovexa", label: "Innovexa", formulaMode: "manual", amount: 1500000 }
  ]
};
