import { describe, expect, it } from "vitest";

import { calculateBreakEvenScenario } from "@/modules/break-even/domain/calculate-break-even";
import { defaultBreakEvenScenario } from "@/modules/break-even/defaults";

describe("break even calculator", () => {
  it("produces a positive break-even point", () => {
    const result = calculateBreakEvenScenario(defaultBreakEvenScenario);

    expect(result.breakEvenPesos).toBeGreaterThan(0);
    expect(result.contributionMarginRate).toBeGreaterThan(0);
    expect(result.totalFixedCosts).toBeGreaterThan(0);
    expect(result.totalVariableCosts).toBeGreaterThan(0);
  });
});
