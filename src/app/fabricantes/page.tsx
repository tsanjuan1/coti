import Link from "next/link";
import { ModuleKey } from "@prisma/client";
import { ArrowRight, Building2, FolderTree } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";
import { manufacturerDirectory } from "@/modules/manufacturers/directory";

export default async function ManufacturersPage() {
  const user = await requireModuleAccess(ModuleKey.MANUFACTURERS);
  const totalSubmodules = manufacturerDirectory.manufacturers.reduce(
    (sum, manufacturer) => sum + manufacturer.submodules.length,
    0
  );

  return (
    <AppShell currentPath="/fabricantes" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Fabricantes
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Directorio de fabricantes</h1>
          <p className="mt-3 max-w-4xl text-sm text-[color:var(--muted)]">
            Este modulo ahora conserva solamente los nombres de las marcas y la
            estructura base de submodulos. Los archivos operativos se removieron para
            dejar un indice liviano y facil de completar mas adelante.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Fabricantes",
              value: manufacturerDirectory.source.totalManufacturers,
              icon: Building2
            },
            {
              label: "Submodulos base",
              value: totalSubmodules,
              icon: FolderTree
            },
            {
              label: "Estado",
              value: "Sin archivos",
              icon: ArrowRight
            }
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                  <Icon className="h-4 w-4" />
                  <span>{card.label}</span>
                </div>
                <div className="mt-3 text-3xl font-semibold">{card.value}</div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Marcas cargadas</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Entrando en cada fabricante vas a ver sus submodulos vacios listos para
            completar en el proximo paso.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {manufacturerDirectory.manufacturers.map((manufacturer) => (
              <Link
                key={manufacturer.slug}
                href={`/fabricantes/${manufacturer.slug}`}
                className="group rounded-[24px] border border-[var(--line)] bg-[color:var(--surface-alt)] p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                      Fabricante
                    </div>
                    <div className="mt-2 text-xl font-semibold">{manufacturer.name}</div>
                    <div className="mt-2 text-sm text-[color:var(--muted)]">
                      {manufacturer.submodules.length} submodulo
                      {manufacturer.submodules.length === 1 ? "" : "s"} vacio
                      {manufacturer.submodules.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[color:var(--muted)] transition group-hover:text-[color:var(--brand)]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
