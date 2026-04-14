import type { BreakEvenScenarioInput } from "@/modules/break-even/domain/types";

export const defaultBreakEvenScenario: BreakEvenScenarioInput = {
  name: "Punto de equilibrio base",
  salesAmount: 375458930.22,
  markup: 1.2,
  exchangeRate: 1375,
  fixedCosts: [
    { lineKey: "cargas_sociales", label: "Cargas sociales", formulaMode: "manual", amount: 1681258.59 },
    { lineKey: "extra_sueldos", label: "Extra sueldos", formulaMode: "sales_rate", inputA: 0.01 },
    { lineKey: "sueldos", label: "Sueldos", formulaMode: "manual", amount: 14200000 },
    { lineKey: "abl", label: "ABL", formulaMode: "manual", amount: 89132 },
    { lineKey: "agua_aysa", label: "Agua AYSA", formulaMode: "manual", amount: 70900 },
    { lineKey: "alquiler", label: "Alquiler", formulaMode: "usd_to_ars", inputA: 3000 },
    { lineKey: "gcba", label: "GCBA", formulaMode: "manual", amount: 97867 },
    { lineKey: "luz_edenor", label: "Luz Edenor", formulaMode: "manual", amount: 1000000 },
    { lineKey: "bancos", label: "Bancos", formulaMode: "manual", amount: 50000 },
    { lineKey: "celular", label: "Celular", formulaMode: "manual", amount: 200000 },
    { lineKey: "fibertel", label: "Fibertel", formulaMode: "manual", amount: 40751 },
    { lineKey: "capacitaciones", label: "Capacitaciones", formulaMode: "manual", amount: 400000 },
    { lineKey: "mant_cta_bancos", label: "Mantenimiento cuentas bancarias", formulaMode: "manual", amount: 100000 },
    { lineKey: "posnet", label: "Posnet", formulaMode: "manual", amount: 1000 },
    { lineKey: "seguro", label: "Seguro", formulaMode: "manual", amount: 60000 },
    { lineKey: "sindicatos", label: "Sindicatos", formulaMode: "manual", amount: 420000 },
    { lineKey: "verisure_alarma", label: "Verisure / alarma", formulaMode: "manual", amount: 45000 },
    { lineKey: "telefonica", label: "Telefonica", formulaMode: "manual", amount: 0 },
    { lineKey: "vistage", label: "Vistage", formulaMode: "manual", amount: 0 },
    { lineKey: "limpieza", label: "Limpieza", formulaMode: "manual", amount: 320000 },
    { lineKey: "pp", label: "PP", formulaMode: "manual", amount: 0 },
    { lineKey: "swiss_medical", label: "Swiss Medical", formulaMode: "manual", amount: 2000000 },
    { lineKey: "vituallas", label: "Vituallas", formulaMode: "manual", amount: 150000 },
    { lineKey: "abogado", label: "Abogado", formulaMode: "manual", amount: 250000 },
    { lineKey: "consultoria", label: "Consultoria fija", formulaMode: "sales_rate", inputA: 0.01 },
    { lineKey: "oppen", label: "Oppen", formulaMode: "usd_to_ars", inputA: 750 },
    { lineKey: "estudio_contable", label: "Estudio contable", formulaMode: "manual", amount: 450000 },
    { lineKey: "pipedrive", label: "Pipedrive", formulaMode: "usd_to_ars", inputA: 350 },
    { lineKey: "tango", label: "Tango", formulaMode: "manual", amount: 0 },
    { lineKey: "intereses", label: "Intereses", formulaMode: "manual", amount: 0 },
    { lineKey: "licencias_microsoft", label: "Licencias Microsoft", formulaMode: "usd_to_ars_monthly", inputA: 600, inputB: 12 }
  ],
  variableCosts: [
    { lineKey: "iibb", label: "IIBB", rate: 0.05 },
    { lineKey: "imp_al_cheque", label: "Imp al cheque", rate: 0.00026 },
    { lineKey: "fletes", label: "Fletes", rate: 0.0119 },
    { lineKey: "consultoria", label: "Consultoria", rate: 0.01 },
    { lineKey: "comisiones", label: "Comisiones", rate: 0.015 }
  ]
};
