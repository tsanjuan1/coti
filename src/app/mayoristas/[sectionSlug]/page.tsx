import Link from "next/link";
import { ModuleKey } from "@prisma/client";
import { ArrowLeft, FileStack } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";
import { getWholesalerSection } from "@/modules/wholesalers/data";

export default async function WholesalerSectionPage({
  params
}: {
  params: Promise<{ sectionSlug: string }>;
}) {
  const user = await requireModuleAccess(ModuleKey.WHOLESALERS);
  const { sectionSlug } = await params;
  const section = getWholesalerSection(sectionSlug);

  if (!section) {
    notFound();
  }

  return (
    <AppShell currentPath="/mayoristas" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <Link
            href="/mayoristas"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mayoristas
          </Link>
          <div className="mt-4 text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Mayoristas
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{section.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            Este submodulo quedo listo para que carguemos nombre, vendedor, link,
            usuario y password de cada mayorista en el siguiente paso.
          </p>
        </section>

        <section className="rounded-[28px] border border-dashed border-[var(--line)] bg-[color:var(--surface-alt)] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <FileStack className="h-6 w-6 text-[color:var(--brand)]" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Submodulo preparado</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{section.description}</p>
        </section>
      </div>
    </AppShell>
  );
}
