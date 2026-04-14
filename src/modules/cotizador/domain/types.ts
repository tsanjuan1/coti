export interface QuoteProductRule {
  productTypeKey: string;
  dutyRate: number;
  statisticsRate: number;
  vatRate: number;
  advanceVatRate: number;
  grossIncomeRate: number;
  advanceIncomeTaxRate: number;
  internalTaxRate: number;
  ncmCode?: string | null;
  description?: string | null;
}

export interface QuoteScenarioInput {
  name: string;
  productTypeKey: string;
  supplierUnitPriceUsd: number;
  priceFactor: number;
  insuranceRate: number;
  freightRatePerKgUsd: number;
  freightWeightKg: number;
  miscellaneousRate: number;
  transferRate: number;
  countryTaxRate: number;
  exchangeRateArsUsd: number;
  saleFactor: number;
  productRules: QuoteProductRule[];
}

export interface QuoteScenarioSummary {
  id: string;
  name: string;
  productTypeKey: string;
  supplierUnitPriceUsd: number;
  updatedAt: string;
}

export interface QuoteScenarioResult {
  selectedRule?: QuoteProductRule;
  warnings: string[];
  rates: {
    dutyRate: number;
    statisticsRate: number;
    vatRate: number;
    internalTaxRate: number;
    miscellaneousRate: number;
    transferRate: number;
    countryTaxRate: number;
    priceFactor: number;
    saleFactor: number;
    costVariationRate: number;
    profitMarginRate: number;
  };
  amounts: {
    supplierUnitPriceUsd: number;
    adjustedSupplierPriceUsd: number;
    insuranceUsd: number;
    freightUsd: number;
    cifUsd: number;
    dutiesUsd: number;
    statisticsUsd: number;
    vatUsd: number;
    internalTaxUsd: number;
    miscellaneousUsd: number;
    transferUsd: number;
    countryTaxUsd: number;
    totalCostUsd: number;
    totalCostArs: number;
    courierInvoiceUsd: number;
    courierInvoiceArs: number;
    salePriceUsd: number;
    salePriceArs: number;
    profitUsd: number;
    profitArs: number;
  };
}
