import { round } from "@/lib/utils";
import type {
  QuoteProductRule,
  QuoteScenarioInput,
  QuoteScenarioResult
} from "@/modules/cotizador/domain/types";

function findRule(
  productTypeKey: string,
  productRules: QuoteProductRule[]
) {
  return productRules.find((rule) => rule.productTypeKey === productTypeKey);
}

export function calculateQuoteScenario(input: QuoteScenarioInput): QuoteScenarioResult {
  const selectedRule = findRule(input.productTypeKey, input.productRules);
  const warnings: string[] = [];

  if (!selectedRule) {
    warnings.push(`No existe una regla arancelaria cargada para ${input.productTypeKey}.`);
  }

  const dutyRate = selectedRule?.dutyRate ?? 0;
  const statisticsRate = selectedRule?.statisticsRate ?? 0;
  const vatRate = selectedRule?.vatRate ?? 0;
  const internalTaxRate = selectedRule?.internalTaxRate ?? 0;

  const adjustedSupplierPriceUsd = input.supplierUnitPriceUsd * input.priceFactor;
  const insuranceUsd = adjustedSupplierPriceUsd * input.insuranceRate;
  const freightUsd = input.freightRatePerKgUsd * input.freightWeightKg;
  const cifUsd = adjustedSupplierPriceUsd + insuranceUsd + freightUsd;
  const dutiesUsd = cifUsd * dutyRate;
  const statisticsUsd = cifUsd * statisticsRate;
  const vatUsd = cifUsd * vatRate;
  const internalTaxUsd = cifUsd * internalTaxRate;
  const miscellaneousUsd = cifUsd * input.miscellaneousRate;
  const transferUsd = adjustedSupplierPriceUsd * input.transferRate;
  const countryTaxUsd = adjustedSupplierPriceUsd * input.countryTaxRate;
  const totalCostUsd =
    cifUsd +
    dutiesUsd +
    statisticsUsd +
    vatUsd +
    internalTaxUsd +
    miscellaneousUsd +
    transferUsd +
    countryTaxUsd;
  const totalCostArs = totalCostUsd * input.exchangeRateArsUsd;

  const courierInvoiceUsd =
    insuranceUsd +
    freightUsd +
    dutiesUsd +
    statisticsUsd +
    vatUsd +
    internalTaxUsd +
    miscellaneousUsd;
  const courierInvoiceArs = courierInvoiceUsd * input.exchangeRateArsUsd;
  const salePriceUsd = totalCostUsd * input.saleFactor;
  const salePriceArs = salePriceUsd * input.exchangeRateArsUsd;
  const profitUsd = salePriceUsd - totalCostUsd;
  const profitArs = salePriceArs - totalCostArs;
  const costVariationRate =
    input.supplierUnitPriceUsd > 0 ? totalCostUsd / input.supplierUnitPriceUsd - 1 : 0;
  const profitMarginRate = salePriceUsd > 0 ? profitUsd / salePriceUsd : 0;

  return {
    selectedRule,
    warnings,
    rates: {
      dutyRate: round(dutyRate),
      statisticsRate: round(statisticsRate),
      vatRate: round(vatRate),
      internalTaxRate: round(internalTaxRate),
      miscellaneousRate: round(input.miscellaneousRate),
      transferRate: round(input.transferRate),
      countryTaxRate: round(input.countryTaxRate),
      priceFactor: round(input.priceFactor),
      saleFactor: round(input.saleFactor),
      costVariationRate: round(costVariationRate),
      profitMarginRate: round(profitMarginRate)
    },
    amounts: {
      supplierUnitPriceUsd: round(input.supplierUnitPriceUsd),
      adjustedSupplierPriceUsd: round(adjustedSupplierPriceUsd),
      insuranceUsd: round(insuranceUsd),
      freightUsd: round(freightUsd),
      cifUsd: round(cifUsd),
      dutiesUsd: round(dutiesUsd),
      statisticsUsd: round(statisticsUsd),
      vatUsd: round(vatUsd),
      internalTaxUsd: round(internalTaxUsd),
      miscellaneousUsd: round(miscellaneousUsd),
      transferUsd: round(transferUsd),
      countryTaxUsd: round(countryTaxUsd),
      totalCostUsd: round(totalCostUsd),
      totalCostArs: round(totalCostArs),
      courierInvoiceUsd: round(courierInvoiceUsd),
      courierInvoiceArs: round(courierInvoiceArs),
      salePriceUsd: round(salePriceUsd),
      salePriceArs: round(salePriceArs),
      profitUsd: round(profitUsd),
      profitArs: round(profitArs)
    }
  };
}
