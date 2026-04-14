import type { QuoteCostProfile, QuoteItem, QuoteScenario } from "@prisma/client";

import { defaultQuoteScenario } from "@/modules/cotizador/defaults";
import type { QuoteProductRule, QuoteScenarioInput } from "@/modules/cotizador/domain/types";

const compactCostLineDefaults = {
  freightRatePerKgUsd: defaultQuoteScenario.freightRatePerKgUsd,
  miscellaneousRate: defaultQuoteScenario.miscellaneousRate,
  transferRate: defaultQuoteScenario.transferRate,
  exchangeRateArsUsd: defaultQuoteScenario.exchangeRateArsUsd
};

function readCompactCostLine(
  costLines: QuoteCostProfile[],
  lineKey: keyof typeof compactCostLineDefaults
) {
  const costLine = costLines.find(
    (entry) => entry.section === "compact" && entry.lineKey === lineKey
  );

  if (!costLine) {
    return compactCostLineDefaults[lineKey];
  }

  return (costLine.mode === "rate" ? costLine.rate : costLine.amount) ?? compactCostLineDefaults[lineKey];
}

export function quoteScenarioFromRecord(args: {
  scenario: QuoteScenario;
  items: QuoteItem[];
  costLines: QuoteCostProfile[];
  productRules: QuoteProductRule[];
}): QuoteScenarioInput {
  const fallback = structuredClone(defaultQuoteScenario);
  const primaryItem = args.items[0];

  return {
    ...fallback,
    name: args.scenario.name,
    productTypeKey: primaryItem?.productTypeKey ?? fallback.productTypeKey,
    supplierUnitPriceUsd: primaryItem?.fobUnitCost ?? fallback.supplierUnitPriceUsd,
    priceFactor: args.scenario.globalMarkupFactor,
    insuranceRate: args.scenario.insuranceRate,
    freightRatePerKgUsd: readCompactCostLine(args.costLines, "freightRatePerKgUsd"),
    freightWeightKg: primaryItem?.weightKg ?? fallback.freightWeightKg,
    miscellaneousRate: readCompactCostLine(args.costLines, "miscellaneousRate"),
    transferRate: readCompactCostLine(args.costLines, "transferRate"),
    countryTaxRate: args.scenario.countryTaxRate,
    exchangeRateArsUsd: readCompactCostLine(args.costLines, "exchangeRateArsUsd"),
    saleFactor: primaryItem?.lineMarkup ?? fallback.saleFactor,
    productRules: args.productRules
  };
}

export function quoteScenarioToCreatePayload(input: QuoteScenarioInput) {
  return {
    scenario: {
      name: input.name,
      globalMarkupFactor: input.priceFactor,
      insuranceRate: input.insuranceRate,
      advanceVatEnabled: false,
      countryTaxRate: input.countryTaxRate
    },
    items: [
      {
        lineNumber: 1,
        status: "COTIZACION" as const,
        quoteDate: null,
        sellerName: null,
        quantity: 1,
        partNumber: "",
        description: input.productTypeKey,
        productTypeKey: input.productTypeKey,
        fobUnitCost: input.supplierUnitPriceUsd,
        weightKg: input.freightWeightKg,
        lineMarkup: input.saleFactor
      }
    ],
    costLines: [
      {
        section: "compact",
        lineKey: "freightRatePerKgUsd",
        label: "Costo flete x kg",
        mode: "amount",
        amount: input.freightRatePerKgUsd,
        rate: 0
      },
      {
        section: "compact",
        lineKey: "miscellaneousRate",
        label: "Gastos varios",
        mode: "rate",
        amount: 0,
        rate: input.miscellaneousRate
      },
      {
        section: "compact",
        lineKey: "transferRate",
        label: "Transferencia",
        mode: "rate",
        amount: 0,
        rate: input.transferRate
      },
      {
        section: "compact",
        lineKey: "exchangeRateArsUsd",
        label: "TC",
        mode: "amount",
        amount: input.exchangeRateArsUsd,
        rate: 0
      }
    ]
  };
}
