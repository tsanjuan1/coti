import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { QuoteEditor } from "@/components/modules/quote-editor";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultQuoteScenario } from "@/modules/cotizador/defaults";
import {
  quoteScenarioHistoryEntryFromRecord,
  quoteScenarioFromRecord,
  quoteScenarioSummaryFromRecord
} from "@/modules/cotizador/mappers";

export default async function CourierQuotePage({
  searchParams
}: {
  searchParams: Promise<{ scenarioId?: string }>;
}) {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const { scenarioId } = await searchParams;

  const [rules, scenarios] = await Promise.all([
    prisma.quoteProductRule.findMany({ orderBy: { productTypeKey: "asc" } }),
    prisma.quoteScenario.findMany({
      where: { createdById: user.id },
      include: { items: { orderBy: { lineNumber: "asc" } }, costLines: true },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0] ?? null;

  const productRules = rules.length > 0 ? rules : defaultQuoteScenario.productRules;
  const initialScenario = selectedScenario
    ? quoteScenarioFromRecord({
        scenario: selectedScenario,
        items: selectedScenario.items,
        costLines: selectedScenario.costLines,
        productRules
      })
    : {
        ...defaultQuoteScenario,
        productRules
      };

  const savedScenarios = scenarios.map((scenario) =>
    quoteScenarioSummaryFromRecord({ scenario, items: scenario.items })
  );
  const historyEntries = scenarios.map((scenario) =>
    quoteScenarioHistoryEntryFromRecord({
      scenario,
      items: scenario.items,
      costLines: scenario.costLines,
      productRules
    })
  );

  return (
    <AppShell currentPath="/cotizador/courier" userLabel={user.fullName}>
      <QuoteEditor
        initialScenario={initialScenario}
        scenarioId={selectedScenario?.id}
        initialSavedScenarios={savedScenarios}
        initialHistoryEntries={historyEntries}
      />
    </AppShell>
  );
}
