import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { OperationProfitEditor } from "@/components/modules/operation-profit-editor";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultOperationProfitScenario } from "@/modules/operation-profit/defaults";
import { operationScenarioFromRecord } from "@/modules/operation-profit/mappers";

export default async function OperationProfitPage() {
  const user = await requireModuleAccess(ModuleKey.OPERATION_PROFIT);
  const latestScenario = await prisma.operationProfitScenario.findFirst({
    where: { createdById: user.id },
    include: { fixedCostLines: true, variableCostLines: true },
    orderBy: { updatedAt: "desc" }
  });

  const initialScenario = latestScenario
    ? operationScenarioFromRecord({
        scenario: latestScenario,
        fixedCosts: latestScenario.fixedCostLines,
        variableCosts: latestScenario.variableCostLines
      })
    : defaultOperationProfitScenario;

  return (
    <AppShell currentPath="/resultado-operacion" userLabel={user.fullName}>
      <OperationProfitEditor
        initialScenario={initialScenario}
        scenarioId={latestScenario?.id}
        canEditCosts={user.role === "ADMIN"}
      />
    </AppShell>
  );
}
