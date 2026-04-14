import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { BreakEvenEditor } from "@/components/modules/break-even-editor";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultBreakEvenScenario } from "@/modules/break-even/defaults";
import { breakEvenScenarioFromRecord } from "@/modules/break-even/mappers";

export default async function BreakEvenPage() {
  const user = await requireModuleAccess(ModuleKey.BREAK_EVEN);
  const latestScenario = await prisma.breakEvenScenario.findFirst({
    where: { createdById: user.id },
    include: { fixedCostLines: true, variableCostLines: true, salespersonProfiles: true },
    orderBy: { updatedAt: "desc" }
  });

  const initialScenario = latestScenario
    ? breakEvenScenarioFromRecord({
        scenario: latestScenario,
        fixedCosts: latestScenario.fixedCostLines,
        variableCosts: latestScenario.variableCostLines,
        salespersonProfiles: latestScenario.salespersonProfiles
      })
    : defaultBreakEvenScenario;

  return (
    <AppShell currentPath="/punto-equilibrio" userLabel={user.fullName}>
      <BreakEvenEditor
        initialScenario={initialScenario}
        scenarioId={latestScenario?.id}
        canEditCosts={user.role === "ADMIN"}
      />
    </AppShell>
  );
}
