import { describe, expect, it } from "vitest";

import { calculateOperationProfit } from "@/modules/operation-profit/domain/calculate-operation-profit";
import { defaultOperationProfitScenario } from "@/modules/operation-profit/defaults";

describe("operation profit calculator", () => {
  it("calculates gross and operating result", () => {
    const result = calculateOperationProfit(defaultOperationProfitScenario);

    expect(result.grossProfit).toBeGreaterThan(0);
    expect(result.fixedCostTotal).toBeGreaterThan(0);
  });
});
