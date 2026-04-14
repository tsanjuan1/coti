import { describe, expect, it } from "vitest";

import { calculateQuoteScenario } from "@/modules/cotizador/domain/calculate-quote";
import { defaultQuoteScenario } from "@/modules/cotizador/defaults";

describe("quote calculator", () => {
  it("calculates line totals and sales totals", () => {
    const result = calculateQuoteScenario(defaultQuoteScenario);

    expect(result.activeQuoteItems).toHaveLength(1);
    expect(result.totals.fobTotal).toBeGreaterThan(0);
    expect(result.totals.salesTotal).toBeGreaterThan(result.totals.fobTotal);
  });
});
