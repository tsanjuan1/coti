import type { QuoteCostProfile, QuoteItem, QuoteScenario } from "@prisma/client";

import { defaultQuoteScenario } from "@/modules/cotizador/defaults";
import type { QuoteProductRule, QuoteScenarioInput } from "@/modules/cotizador/domain/types";

type CostMapping = {
  section: "origin" | "destination" | "remnant";
  inputKey: "originCosts" | "destinationCosts" | "remnantCosts";
  lineKey: string;
  targetKey: string;
  valueType: "amount" | "rate";
};

const costMappings: CostMapping[] = [
  { section: "origin", inputKey: "originCosts", lineKey: "shipperDeclarationUsd", targetKey: "shipperDeclarationUsd", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "handlingFeeUsd", targetKey: "handlingFeeUsd", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "deliveryAirportRatePerKg", targetKey: "deliveryAirportRatePerKg", valueType: "rate" },
  { section: "origin", inputKey: "originCosts", lineKey: "deliveryAirportMinimumUsd", targetKey: "deliveryAirportMinimumUsd", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "internationalFreightRatePerKg", targetKey: "internationalFreightRatePerKg", valueType: "rate" },
  { section: "origin", inputKey: "originCosts", lineKey: "internationalFreightMinimumUsd", targetKey: "internationalFreightMinimumUsd", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "originDocumentHandlingUsd", targetKey: "originDocumentHandlingUsd", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "afipResolutionArs", targetKey: "afipResolutionArs", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "exchangeRateArsUsd", targetKey: "exchangeRateArsUsd", valueType: "amount" },
  { section: "origin", inputKey: "originCosts", lineKey: "vatRate", targetKey: "vatRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "custodyArs", targetKey: "custodyArs", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "storageAdminRate", targetKey: "storageAdminRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "digitizationUsd", targetKey: "digitizationUsd", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "internalHaulArs", targetKey: "internalHaulArs", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "operationalExpensesArs", targetKey: "operationalExpensesArs", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "feesRate", targetKey: "feesRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "minimumFeesUsd", targetKey: "minimumFeesUsd", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "destinationInsuranceRate", targetKey: "destinationInsuranceRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "storageRate", targetKey: "storageRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "miscellaneousUsd", targetKey: "miscellaneousUsd", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "grossIncomeCabaRate", targetKey: "grossIncomeCabaRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "grossIncomePbaRate", targetKey: "grossIncomePbaRate", valueType: "rate" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "destinationDocumentHandlingUsd", targetKey: "destinationDocumentHandlingUsd", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "exchangeRateArsUsd", targetKey: "exchangeRateArsUsd", valueType: "amount" },
  { section: "destination", inputKey: "destinationCosts", lineKey: "vatRate", targetKey: "vatRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "feesRate", targetKey: "feesRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "minimumFeesUsd", targetKey: "minimumFeesUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "operationalExpensesArs", targetKey: "operationalExpensesArs", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "digitizationUsd", targetKey: "digitizationUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "miscellaneousUsd", targetKey: "miscellaneousUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "custodyArs", targetKey: "custodyArs", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "destinationInsuranceRate", targetKey: "destinationInsuranceRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "internalHaulArs", targetKey: "internalHaulArs", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "storageAdminRate", targetKey: "storageAdminRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "storageRate", targetKey: "storageRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "afipResolutionArs", targetKey: "afipResolutionArs", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "originDocumentHandlingUsd", targetKey: "originDocumentHandlingUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "internationalFreightRatePerKg", targetKey: "internationalFreightRatePerKg", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "internationalFreightMinimumUsd", targetKey: "internationalFreightMinimumUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "grossIncomeCabaRate", targetKey: "grossIncomeCabaRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "grossIncomePbaRate", targetKey: "grossIncomePbaRate", valueType: "rate" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "destinationDocumentHandlingUsd", targetKey: "destinationDocumentHandlingUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "exchangeRateArsUsd", targetKey: "exchangeRateArsUsd", valueType: "amount" },
  { section: "remnant", inputKey: "remnantCosts", lineKey: "vatRate", targetKey: "vatRate", valueType: "rate" }
];

export function quoteScenarioFromRecord(args: {
  scenario: QuoteScenario;
  items: QuoteItem[];
  costLines: QuoteCostProfile[];
  productRules: QuoteProductRule[];
}): QuoteScenarioInput {
  const scenario = structuredClone(defaultQuoteScenario);
  scenario.name = args.scenario.name;
  scenario.globalMarkupFactor = args.scenario.globalMarkupFactor;
  scenario.insuranceRate = args.scenario.insuranceRate;
  scenario.advanceVatEnabled = args.scenario.advanceVatEnabled;
  scenario.countryTaxRate = args.scenario.countryTaxRate;
  scenario.items = args.items.map((item) => ({
    lineNumber: item.lineNumber,
    status: item.status,
    quoteDate: item.quoteDate?.toISOString() ?? null,
    sellerName: item.sellerName,
    quantity: item.quantity,
    partNumber: item.partNumber,
    description: item.description,
    productTypeKey: item.productTypeKey,
    fobUnitCost: item.fobUnitCost,
    weightKg: item.weightKg,
    lineMarkup: item.lineMarkup
  }));
  scenario.productRules = args.productRules;

  for (const line of args.costLines) {
    const mapping = costMappings.find(
      (entry) => entry.section === line.section && entry.lineKey === line.lineKey
    );
    if (!mapping) continue;
    const section = scenario[mapping.inputKey];
    section[mapping.targetKey as keyof typeof section] =
      (mapping.valueType === "amount" ? line.amount : line.rate) ?? 0;
  }

  return scenario;
}

export function quoteScenarioToCreatePayload(input: QuoteScenarioInput) {
  return {
    scenario: {
      name: input.name,
      globalMarkupFactor: input.globalMarkupFactor,
      insuranceRate: input.insuranceRate,
      advanceVatEnabled: input.advanceVatEnabled,
      countryTaxRate: input.countryTaxRate
    },
    items: input.items.map((item) => ({
      lineNumber: item.lineNumber,
      status: item.status,
      quoteDate: item.quoteDate ? new Date(item.quoteDate) : null,
      sellerName: item.sellerName ?? null,
      quantity: item.quantity,
      partNumber: item.partNumber,
      description: item.description,
      productTypeKey: item.productTypeKey,
      fobUnitCost: item.fobUnitCost,
      weightKg: item.weightKg,
      lineMarkup: item.lineMarkup
    })),
    costLines: costMappings.map((mapping) => {
      const section = input[mapping.inputKey];
      const value = section[mapping.targetKey as keyof typeof section] as number;
      return {
        section: mapping.section,
        lineKey: mapping.lineKey,
        label: mapping.lineKey,
        mode: mapping.valueType,
        amount: mapping.valueType === "amount" ? value : 0,
        rate: mapping.valueType === "rate" ? value : 0
      };
    })
  };
}
