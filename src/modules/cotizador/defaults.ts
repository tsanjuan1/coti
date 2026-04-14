import productRules from "@/modules/cotizador/generated/product-rules.json";
import type { QuoteScenarioInput } from "@/modules/cotizador/domain/types";

export const defaultQuoteScenario: QuoteScenarioInput = {
  name: "Cotizacion compacta",
  productTypeKey: "NOTEBOOK",
  supplierUnitPriceUsd: 500,
  priceFactor: 1.05,
  insuranceRate: 0.01,
  freightRatePerKgUsd: 15,
  freightWeightKg: 0.5,
  miscellaneousRate: 0.06,
  transferRate: 0.015,
  countryTaxRate: 0,
  exchangeRateArsUsd: 1430,
  saleFactor: 1.2,
  productRules
};
