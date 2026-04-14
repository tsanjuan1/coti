export type QuoteItemStatus = "COTIZACION" | "COMPRAS" | "VENCIDO";

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

export interface QuoteItemInput {
  lineNumber: number;
  status: QuoteItemStatus;
  quoteDate?: string | null;
  sellerName?: string | null;
  quantity: number;
  partNumber: string;
  description: string;
  productTypeKey: string;
  fobUnitCost: number;
  weightKg: number;
  lineMarkup: number;
}

export interface QuoteOriginCosts {
  shipperDeclarationUsd: number;
  handlingFeeUsd: number;
  deliveryAirportRatePerKg: number;
  deliveryAirportMinimumUsd: number;
  internationalFreightRatePerKg: number;
  internationalFreightMinimumUsd: number;
  originDocumentHandlingUsd: number;
  afipResolutionArs: number;
  exchangeRateArsUsd: number;
  vatRate: number;
}

export interface QuoteDestinationCosts {
  custodyArs: number;
  storageAdminRate: number;
  digitizationUsd: number;
  internalHaulArs: number;
  operationalExpensesArs: number;
  feesRate: number;
  minimumFeesUsd: number;
  destinationInsuranceRate: number;
  storageRate: number;
  miscellaneousUsd: number;
  grossIncomeCabaRate: number;
  grossIncomePbaRate: number;
  destinationDocumentHandlingUsd: number;
  exchangeRateArsUsd: number;
  vatRate: number;
}

export interface QuoteRemnantCosts {
  feesRate: number;
  minimumFeesUsd: number;
  operationalExpensesArs: number;
  digitizationUsd: number;
  miscellaneousUsd: number;
  custodyArs: number;
  destinationInsuranceRate: number;
  internalHaulArs: number;
  storageAdminRate: number;
  storageRate: number;
  afipResolutionArs: number;
  originDocumentHandlingUsd: number;
  internationalFreightRatePerKg: number;
  internationalFreightMinimumUsd: number;
  grossIncomeCabaRate: number;
  grossIncomePbaRate: number;
  destinationDocumentHandlingUsd: number;
  exchangeRateArsUsd: number;
  vatRate: number;
}

export interface QuoteScenarioInput {
  name: string;
  globalMarkupFactor: number;
  insuranceRate: number;
  advanceVatEnabled: boolean;
  countryTaxRate: number;
  originCosts: QuoteOriginCosts;
  destinationCosts: QuoteDestinationCosts;
  remnantCosts: QuoteRemnantCosts;
  productRules: QuoteProductRule[];
  items: QuoteItemInput[];
}

export interface QuoteLineResult {
  input: QuoteItemInput;
  rule?: QuoteProductRule;
  fobUnitPrice: number;
  fobTotal: number;
  valueShare: number;
  weightTotal: number;
  weightShare: number;
  insurance: number;
  freightAndExpenses: number;
  cifCip: number;
  duties: number;
  statistics: number;
  vat: number;
  advanceVat: number;
  grossIncome: number;
  advanceIncomeTax: number;
  internalTax: number;
  destinationExpenses: number;
  countryTax: number;
  totalLine: number;
  landedUnitCost: number;
  salesUnitPrice: number;
  salesTotal: number;
  warnings: string[];
}

export interface QuoteScenarioResult {
  activeQuoteItems: QuoteLineResult[];
  inactiveItems: QuoteLineResult[];
  totals: {
    quantity: number;
    fobUnitTotal: number;
    fobTotal: number;
    weightTotal: number;
    cifTotal: number;
    landedUnitTotal: number;
    salesUnitAverage: number;
    salesTotal: number;
    originTotal: number;
    destinationTotal: number;
    remnantTotal: number;
    remnantAllocationBase: number;
  };
  costBreakdown: {
    originAdmin: number;
    originFreight: number;
    originTotal: number;
    destinationTotal: number;
    remnantTotal: number;
    remnantAllocationBase: number;
  };
  warnings: string[];
}
