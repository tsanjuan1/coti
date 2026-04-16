import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { ManufacturersCatalog } from "@/components/modules/manufacturers-catalog";
import { requireModuleAccess } from "@/lib/auth/session";
import manufacturerCatalog from "@/modules/manufacturers/generated/catalog.json";
import type { ManufacturerCatalog } from "@/modules/manufacturers/types";

export default async function ManufacturersPage() {
  const user = await requireModuleAccess(ModuleKey.MANUFACTURERS);

  return (
    <AppShell currentPath="/fabricantes" userLabel={user.fullName}>
      <ManufacturersCatalog catalog={manufacturerCatalog as ManufacturerCatalog} />
    </AppShell>
  );
}
