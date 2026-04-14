import productRules from "@/modules/cotizador/generated/product-rules.json";
import type { QuoteScenarioInput } from "@/modules/cotizador/domain/types";

export const defaultQuoteScenario: QuoteScenarioInput = {
  name: "Cotizacion base importacion",
  globalMarkupFactor: 1.05,
  insuranceRate: 0.01,
  advanceVatEnabled: false,
  countryTaxRate: 0,
  originCosts: {
    shipperDeclarationUsd: 30,
    handlingFeeUsd: 20,
    deliveryAirportRatePerKg: 0.1,
    deliveryAirportMinimumUsd: 30,
    internationalFreightRatePerKg: 5,
    internationalFreightMinimumUsd: 150,
    originDocumentHandlingUsd: 100,
    afipResolutionArs: 4128,
    exchangeRateArsUsd: 1200,
    vatRate: 0.21
  },
  destinationCosts: {
    custodyArs: 145000,
    storageAdminRate: 0.006,
    digitizationUsd: 28,
    internalHaulArs: 146700,
    operationalExpensesArs: 19600,
    feesRate: 0.007,
    minimumFeesUsd: 250,
    destinationInsuranceRate: 0.003,
    storageRate: 0.02,
    miscellaneousUsd: 0,
    grossIncomeCabaRate: 0.05,
    grossIncomePbaRate: 0.011,
    destinationDocumentHandlingUsd: 70,
    exchangeRateArsUsd: 1200,
    vatRate: 0.21
  },
  remnantCosts: {
    feesRate: 0.007,
    minimumFeesUsd: 250,
    operationalExpensesArs: 19600,
    digitizationUsd: 28,
    miscellaneousUsd: 150,
    custodyArs: 62500,
    destinationInsuranceRate: 0.003,
    internalHaulArs: 146700,
    storageAdminRate: 0.006,
    storageRate: 0.02,
    afipResolutionArs: 4128,
    originDocumentHandlingUsd: 100,
    internationalFreightRatePerKg: 4.5,
    internationalFreightMinimumUsd: 150,
    grossIncomeCabaRate: 0.05,
    grossIncomePbaRate: 0.011,
    destinationDocumentHandlingUsd: 70,
    exchangeRateArsUsd: 940,
    vatRate: 0.21
  },
  productRules,
  items: [
    {
      lineNumber: 1,
      status: "COTIZACION",
      sellerName: "PABLO",
      quantity: 2,
      partNumber: "GLC-LH-SMD",
      description: "1000BASE-LX/LH SFP TRANSCEIVER MODULE",
      productTypeKey: "SFP",
      fobUnitCost: 250,
      weightKg: 0.2,
      lineMarkup: 1.47
    }
  ]
};

export const defaultQuoteSellers = [
  "FABRICIO",
  "LUCIO",
  "TOMAS",
  "PABLO",
  "GABRIEL",
  "PEPE",
  "GUSTAVO"
];
