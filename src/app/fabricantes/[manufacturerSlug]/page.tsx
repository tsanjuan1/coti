import Link from "next/link";
import { ModuleKey } from "@prisma/client";
import { ArrowLeft, ArrowRight, FolderKanban } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";
import { getManufacturerBySlug } from "@/modules/manufacturers/directory";

export default async function ManufacturerDetailPage({
  params
}: {
  params: Promise<{ manufacturerSlug: string }>;
}) {
  const user = await requireModuleAccess(ModuleKey.MANUFACTURERS);
  const { manufacturerSlug } = await params;
  const manufacturer = getManufacturerBySlug(manufacturerSlug);

  if (!manufacturer) {
    notFound();
  }

  return (
    <AppShell currentPath="/fabricantes" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <Link
            href="/fabricantes"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a fabricantes
          </Link>
          <div className="mt-4 text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Fabricantes
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{manufacturer.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            Estos son los submodulos base que quedaron listos para cargar informacion
            de esta marca. Por ahora estan vacios a proposito.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {manufacturer.submodules.map((submodule) => (
            <Link
              key={submodule.slug}
              href={`/fabricantes/${manufacturer.slug}/${submodule.slug}`}
              className="group rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    <FolderKanban className="h-4 w-4" />
                    <span>Submodulo</span>
                  </div>
                  <div className="mt-3 text-xl font-semibold">{submodule.name}</div>
                  <div className="mt-2 text-sm text-[color:var(--muted)]">
                    {submodule.description}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[color:var(--muted)] transition group-hover:text-[color:var(--brand)]" />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
