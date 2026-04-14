import { round } from "@/lib/utils";
import type {
  QuoteDestinationCosts,
  QuoteItemInput,
  QuoteLineResult,
  QuoteProductRule,
  QuoteScenarioInput,
  QuoteScenarioResult
} from "@/modules/cotizador/domain/types";

function isQuoteStatus(status: QuoteItemInput["status"]) {
  return status === "COTIZACION";
}

function calculateOriginCosts(input: QuoteScenarioInput, totalWeight: number) {
  const vatFactor = 1 + input.originCosts.vatRate;
  const deliveryAirport = Math.max(
    totalWeight * input.originCosts.deliveryAirportRatePerKg,
    input.originCosts.deliveryAirportMinimumUsd
  );
  const internationalFreight = Math.max(
    totalWeight * input.originCosts.internationalFreightRatePerKg,
    input.originCosts.internationalFreightMinimumUsd
  );
  const originDocumentHandling = input.originCosts.originDocumentHandlingUsd * vatFactor;
  const afipResolution =
    (input.originCosts.afipResolutionArs / input.originCosts.exchangeRateArsUsd) * vatFactor;
  const total =
    input.originCosts.shipperDeclarationUsd +
    input.originCosts.handlingFeeUsd +
    deliveryAirport +
    internationalFreight +
    originDocumentHandling +
    afipResolution;

  return {
    total,
    adminAllocationBase: total - internationalFreight,
    freightAllocationBase: internationalFreight
  };
}

function calculateDestinationCosts(destination: QuoteDestinationCosts, valueFactor: number) {
  const vatFactor = 1 + destination.vatRate;
  const custody = (destination.custodyArs / destination.exchangeRateArsUsd) * vatFactor;
  const storage = destination.storageRate * valueFactor;
  const storageAdmin = storage * destination.storageAdminRate;
  const digitization = destination.digitizationUsd * vatFactor;
  const internalHaul = (destination.internalHaulArs / destination.exchangeRateArsUsd) * vatFactor;
  const operationalExpenses =
    (destination.operationalExpensesArs / destination.exchangeRateArsUsd) * vatFactor;
  const fees = Math.max(valueFactor * destination.feesRate, destination.minimumFeesUsd) * vatFactor;
  const insurance = valueFactor * destination.destinationInsuranceRate * vatFactor;
  const baseBeforeTaxes =
    custody +
    storageAdmin +
    digitization +
    internalHaul +
    operationalExpenses +
    fees +
    insurance +
    destination.miscellaneousUsd;
  const grossIncomeCaba = destination.grossIncomeCabaRate * baseBeforeTaxes;
  const grossIncomePba = destination.grossIncomePbaRate * baseBeforeTaxes;
  const destinationDocumentHandling = destination.destinationDocumentHandlingUsd * vatFactor;

  return {
    total:
      baseBeforeTaxes + grossIncomeCaba + grossIncomePba + destinationDocumentHandling
  };
}

function calculateRemnantCosts(input: QuoteScenarioInput, totalFob: number, totalWeight: number) {
  const vatFactor = 1 + input.remnantCosts.vatRate;
  const fees = Math.max(totalFob * input.remnantCosts.feesRate, input.remnantCosts.minimumFeesUsd) * vatFactor;
  const operationalExpenses =
    (input.remnantCosts.operationalExpensesArs / input.remnantCosts.exchangeRateArsUsd) * vatFactor;
  const digitization = input.remnantCosts.digitizationUsd * vatFactor;
  const custody = (input.remnantCosts.custodyArs / input.remnantCosts.exchangeRateArsUsd) * vatFactor;
  const destinationInsurance = totalFob * input.remnantCosts.destinationInsuranceRate * vatFactor;
  const internalHaul =
    (input.remnantCosts.internalHaulArs / input.remnantCosts.exchangeRateArsUsd) * vatFactor;
  const storage = totalFob * input.remnantCosts.storageRate;
  const storageAdmin = input.remnantCosts.storageAdminRate * storage;
  const afipResolution =
    (input.remnantCosts.afipResolutionArs / input.remnantCosts.exchangeRateArsUsd) * vatFactor;
  const originDocumentHandling = input.remnantCosts.originDocumentHandlingUsd * vatFactor;
  const internationalFreight = Math.max(
    totalWeight * input.remnantCosts.internationalFreightRatePerKg,
    input.remnantCosts.internationalFreightMinimumUsd
  );
  const taxBase =
    fees +
    operationalExpenses +
    digitization +
    destinationInsurance +
    internalHaul +
    originDocumentHandling;
  const grossIncomeCaba = input.remnantCosts.grossIncomeCabaRate * taxBase;
  const grossIncomePba = input.remnantCosts.grossIncomePbaRate * taxBase;
  const destinationDocumentHandling = input.remnantCosts.destinationDocumentHandlingUsd * vatFactor;

  return {
    total:
      fees +
      operationalExpenses +
      digitization +
      input.remnantCosts.miscellaneousUsd +
      custody +
      destinationInsurance +
      internalHaul +
      storageAdmin +
      storage +
      afipResolution +
      originDocumentHandling +
      internationalFreight +
      grossIncomeCaba +
      grossIncomePba +
      destinationDocumentHandling
  };
}

export function calculateQuoteScenario(input: QuoteScenarioInput): QuoteScenarioResult {
  const ruleMap = new Map<string, QuoteProductRule>(
    input.productRules.map((rule) => [rule.productTypeKey, rule])
  );
  const activeItems = input.items.filter((item) => isQuoteStatus(item.status));
  const totalQuantity = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalFob = activeItems.reduce(
    (sum, item) => sum + item.fobUnitCost * input.globalMarkupFactor * item.quantity,
    0
  );
  const totalWeight = activeItems.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);

  const originCosts = calculateOriginCosts(input, totalWeight);
  const destinationCosts = calculateDestinationCosts(input.destinationCosts, 0);
  const remnantCosts = calculateRemnantCosts(input, totalFob, totalWeight);
  const remnantAllocationBase = remnantCosts.total - originCosts.total;
  const warnings: string[] = [];

  const buildLineResult = (item: QuoteItemInput): QuoteLineResult => {
    const lineWarnings: string[] = [];
    const rule = ruleMap.get(item.productTypeKey);
    if (!rule) {
      lineWarnings.push(`No existe regla para ${item.productTypeKey}.`);
    }

    const fobUnitPrice = item.fobUnitCost * input.globalMarkupFactor;
    const fobTotal = isQuoteStatus(item.status) ? fobUnitPrice * item.quantity : 0;
    const valueShare = totalFob > 0 ? fobTotal / totalFob : 0;
    const weightTotal = isQuoteStatus(item.status) ? item.weightKg * item.quantity : 0;
    const weightShare = totalWeight > 0 ? weightTotal / totalWeight : 0;
    const freightAndExpenses =
      originCosts.freightAllocationBase * weightShare +
      originCosts.adminAllocationBase * valueShare;
    const insurance = isQuoteStatus(item.status) ? (fobTotal + freightAndExpenses) * input.insuranceRate : 0;
    const cifCip = insurance + fobTotal + freightAndExpenses;
    const duties = cifCip * (rule?.dutyRate ?? 0);
    const statistics = cifCip * (rule?.statisticsRate ?? 0);
    const taxBase = cifCip + duties + statistics;
    const vat = taxBase * (rule?.vatRate ?? 0);
    const advanceVat = input.advanceVatEnabled ? taxBase * (rule?.advanceVatRate ?? 0) : 0;
    const grossIncome = taxBase * (rule?.grossIncomeRate ?? 0);
    const advanceIncomeTax = taxBase * (rule?.advanceIncomeTaxRate ?? 0);
    const internalTax = taxBase * 1.3 * (rule?.internalTaxRate ?? 0);
    const destinationExpenses = remnantAllocationBase * valueShare;
    const countryTax = cifCip * input.countryTaxRate;
    const totalLine =
      cifCip +
      duties +
      statistics +
      vat +
      advanceVat +
      grossIncome +
      advanceIncomeTax +
      internalTax +
      destinationExpenses +
      countryTax;
    const landedUnitCost = item.quantity > 0 ? totalLine / item.quantity : 0;
    const salesUnitPrice = landedUnitCost * item.lineMarkup;
    const salesTotal = salesUnitPrice * item.quantity;

    return {
      input: item,
      rule,
      fobUnitPrice: round(fobUnitPrice),
      fobTotal: round(fobTotal),
      valueShare: round(valueShare),
      weightTotal: round(weightTotal),
      weightShare: round(weightShare),
      insurance: round(insurance),
      freightAndExpenses: round(freightAndExpenses),
      cifCip: round(cifCip),
      duties: round(duties),
      statistics: round(statistics),
      vat: round(vat),
      advanceVat: round(advanceVat),
      grossIncome: round(grossIncome),
      advanceIncomeTax: round(advanceIncomeTax),
      internalTax: round(internalTax),
      destinationExpenses: round(destinationExpenses),
      countryTax: round(countryTax),
      totalLine: round(totalLine),
      landedUnitCost: round(landedUnitCost),
      salesUnitPrice: round(salesUnitPrice),
      salesTotal: round(salesTotal),
      warnings: lineWarnings
    };
  };

  const allLines = input.items.map(buildLineResult);
  const activeQuoteItems = allLines.filter((line) => isQuoteStatus(line.input.status));
  const inactiveItems = allLines.filter((line) => !isQuoteStatus(line.input.status));

  warnings.push(...allLines.flatMap((line) => line.warnings));

  const salesUnitAverage =
    activeQuoteItems.length > 0
      ? activeQuoteItems.reduce((sum, line) => sum + line.salesUnitPrice, 0) / activeQuoteItems.length
      : 0;

  return {
    activeQuoteItems,
    inactiveItems,
    totals: {
      quantity: round(totalQuantity),
      fobUnitTotal: round(activeQuoteItems.reduce((sum, line) => sum + line.fobUnitPrice, 0)),
      fobTotal: round(totalFob),
      weightTotal: round(totalWeight),
      cifTotal: round(activeQuoteItems.reduce((sum, line) => sum + line.cifCip, 0)),
      landedUnitTotal: round(activeQuoteItems.reduce((sum, line) => sum + line.landedUnitCost, 0)),
      salesUnitAverage: round(salesUnitAverage),
      salesTotal: round(activeQuoteItems.reduce((sum, line) => sum + line.salesTotal, 0)),
      originTotal: round(originCosts.total),
      destinationTotal: round(destinationCosts.total),
      remnantTotal: round(remnantCosts.total),
      remnantAllocationBase: round(remnantAllocationBase)
    },
    costBreakdown: {
      originAdmin: round(originCosts.adminAllocationBase),
      originFreight: round(originCosts.freightAllocationBase),
      originTotal: round(originCosts.total),
      destinationTotal: round(destinationCosts.total),
      remnantTotal: round(remnantCosts.total),
      remnantAllocationBase: round(remnantAllocationBase)
    },
    warnings
  };
}
