import Link from "next/link";
import { ModuleKey } from "@prisma/client";
import { ArrowRight, Globe2, Store } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";
import { wholesalerSections } from "@/modules/wholesalers/data";

const iconBySection = {
  exterior: Globe2,
  local: Store
} as const;

export default async function WholesalersPage() {
  const user = await requireModuleAccess(ModuleKey.WHOLESALERS);

  return (
    <AppShell currentPath="/mayoristas" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Mayoristas
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Directorio de mayoristas</h1>
          <p className="mt-3 max-w-4xl text-sm text-[color:var(--muted)]">
            Este modulo queda preparado como base para cargar datos de mayoristas en el
            proximo paso. La estructura inicial se divide entre canal local y canal
            exterior.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {wholesalerSections.map((section) => {
            const Icon = iconBySection[section.slug];

            return (
              <Link
                key={section.slug}
                href={`/mayoristas/${section.slug}`}
                className="group rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                      <Icon className="h-4 w-4" />
                      <span>Submodulo</span>
                    </div>
                    <div className="mt-3 text-2xl font-semibold">{section.name}</div>
                    <p className="mt-3 text-sm text-[color:var(--muted)]">
                      {section.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[color:var(--muted)] transition group-hover:text-[color:var(--brand)]" />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
