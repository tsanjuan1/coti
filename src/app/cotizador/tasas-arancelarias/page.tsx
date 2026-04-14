import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { TariffRulesManager } from "@/components/modules/tariff-rules-manager";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function TariffRulesPage() {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const rules = await prisma.quoteProductRule.findMany({
    orderBy: { productTypeKey: "asc" }
  });

  return (
    <AppShell currentPath="/cotizador/tasas-arancelarias" userLabel={user.fullName}>
      <TariffRulesManager initialRules={rules} canEdit={user.role === "ADMIN"} />
    </AppShell>
  );
}
