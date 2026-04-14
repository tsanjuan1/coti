import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { QuoteEditor } from "@/components/modules/quote-editor";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultQuoteScenario } from "@/modules/cotizador/defaults";
import { quoteScenarioFromRecord } from "@/modules/cotizador/mappers";

export default async function QuotePage() {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const latestScenario = await prisma.quoteScenario.findFirst({
    where: { createdById: user.id },
    include: { items: { orderBy: { lineNumber: "asc" } }, costLines: true },
    orderBy: { updatedAt: "desc" }
  });

  const initialScenario = latestScenario
    ? quoteScenarioFromRecord({
        scenario: latestScenario,
        items: latestScenario.items,
        costLines: latestScenario.costLines,
        productRules: defaultQuoteScenario.productRules
      })
    : defaultQuoteScenario;

  return (
    <AppShell currentPath="/cotizador" userLabel={user.fullName}>
      <QuoteEditor initialScenario={initialScenario} scenarioId={latestScenario?.id} />
    </AppShell>
  );
}
