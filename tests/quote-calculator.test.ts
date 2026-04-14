import { describe, expect, it } from "vitest";

import { calculateQuoteScenario } from "@/modules/cotizador/domain/calculate-quote";
import { defaultQuoteScenario } from "@/modules/cotizador/defaults";

describe("quote calculator", () => {
  it("calculates the compact quote variant based on product taxes", () => {
    const result = calculateQuoteScenario(defaultQuoteScenario);

    expect(result.selectedRule?.productTypeKey).toBe(defaultQuoteScenario.productTypeKey);
    expect(result.amounts.cifUsd).toBeGreaterThan(result.amounts.adjustedSupplierPriceUsd);
    expect(result.amounts.totalCostUsd).toBeGreaterThan(result.amounts.cifUsd);
    expect(result.amounts.salePriceUsd).toBeGreaterThan(result.amounts.totalCostUsd);
    expect(result.amounts.vatUsd).toBeCloseTo(
      (result.amounts.cifUsd + result.amounts.dutiesUsd + result.amounts.statisticsUsd) *
        result.rates.vatRate,
      4
    );
  });
});
