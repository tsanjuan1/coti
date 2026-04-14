import { describe, expect, it } from "vitest";

import { hasModuleAccess } from "@/lib/permissions";

describe("permissions", () => {
  it("gives admins access to every module", () => {
    expect(
      hasModuleAccess({
        role: "ADMIN",
        permissions: [],
        moduleKey: "ADMIN"
      })
    ).toBe(true);
  });

  it("requires explicit permission for sellers", () => {
    expect(
      hasModuleAccess({
        role: "SELLER",
        permissions: [{ moduleKey: "QUOTE", canAccess: true }],
        moduleKey: "BREAK_EVEN"
      })
    ).toBe(false);
  });
});
