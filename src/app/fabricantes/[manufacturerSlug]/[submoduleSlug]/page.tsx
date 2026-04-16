import Link from "next/link";
import { ModuleKey } from "@prisma/client";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";
import {
  getManufacturerBySlug,
  getManufacturerSubmodule
} from "@/modules/manufacturers/directory";

export default async function ManufacturerSubmodulePage({
  params
}: {
  params: Promise<{ manufacturerSlug: string; submoduleSlug: string }>;
}) {
  const user = await requireModuleAccess(ModuleKey.MANUFACTURERS);
  const { manufacturerSlug, submoduleSlug } = await params;
  const manufacturer = getManufacturerBySlug(manufacturerSlug);
  const submodule = getManufacturerSubmodule(manufacturerSlug, submoduleSlug);

  if (!manufacturer || !submodule) {
    notFound();
  }

  return (
    <AppShell currentPath="/fabricantes" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <Link
            href={`/fabricantes/${manufacturer.slug}`}
            className="inline-flex items-center gap-2 text-sm text-[color:var(--brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a {manufacturer.name}
          </Link>
          <div className="mt-4 text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            {manufacturer.name}
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{submodule.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            Este submodulo quedo creado pero vacio. En el proximo paso vamos a cargar
            aqui la informacion operativa del fabricante.
          </p>
        </section>

        <section className="rounded-[28px] border border-dashed border-[var(--line)] bg-[color:var(--surface-alt)] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <FolderOpen className="h-6 w-6 text-[color:var(--brand)]" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Sin contenido cargado</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            {submodule.description} Cuando quieras, completamos esta seccion con
            contactos, credenciales, instructivos o cualquier otro material.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
