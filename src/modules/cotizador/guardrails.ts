import type { QuoteScenarioInput } from "@/modules/cotizador/domain/types";

type QuoteProtectedFieldKey =
  | "insuranceRate"
  | "freightRatePerKgUsd"
  | "miscellaneousRate"
  | "transferRate"
  | "countryTaxRate";

const protectedFieldKeys: QuoteProtectedFieldKey[] = [
  "insuranceRate",
  "freightRatePerKgUsd",
  "miscellaneousRate",
  "transferRate",
  "countryTaxRate"
];

const fieldLabels: Record<Exclude<keyof QuoteScenarioInput, "productRules">, string> = {
  name: "Nombre",
  productTypeKey: "Producto",
  supplierUnitPriceUsd: "Precio unitario proveedor",
  priceFactor: "Precio",
  insuranceRate: "Seguro",
  freightRatePerKgUsd: "Costo flete x kg",
  freightWeightKg: "Peso facturable kg",
  miscellaneousRate: "Gastos varios",
  transferRate: "Transferencia",
  countryTaxRate: "Imp. pais",
  exchangeRateArsUsd: "TC",
  saleFactor: "Venta"
};

export function applyProtectedQuoteFields(args: {
  input: QuoteScenarioInput;
  baseline: QuoteScenarioInput;
  canEditProtectedFields: boolean;
}) {
  if (args.canEditProtectedFields) {
    return args.input;
  }

  const nextScenario = { ...args.input };
  for (const fieldKey of protectedFieldKeys) {
    nextScenario[fieldKey] = args.baseline[fieldKey];
  }

  return nextScenario;
}

export function getChangedQuoteFields(previous: QuoteScenarioInput, next: QuoteScenarioInput) {
  return (Object.keys(fieldLabels) as Array<Exclude<keyof QuoteScenarioInput, "productRules">>)
    .filter((fieldKey) => previous[fieldKey] !== next[fieldKey])
    .map((fieldKey) => fieldLabels[fieldKey]);
}
