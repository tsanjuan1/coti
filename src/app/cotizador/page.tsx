import Link from "next/link";
import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const quoteModules = [
  {
    href: "/cotizador/courier",
    label: "Courier",
    description: "Cotizador operativo actual. Este flujo ya esta activo y sigue funcionando."
  },
  {
    href: "/cotizador/despacho",
    label: "Despacho",
    description: "Pendiente de desarrollo."
  },
  {
    href: "/cotizador/china",
    label: "China",
    description: "Pendiente de desarrollo."
  },
  {
    href: "/cotizador/europa",
    label: "Europa",
    description: "Pendiente de desarrollo."
  }
];

export default async function QuoteHubPage() {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const [quoteCount, tariffCount] = await Promise.all([
    prisma.quoteScenario.count({ where: { createdById: user.id } }),
    prisma.quoteProductRule.count()
  ]);

  return (
    <AppShell currentPath="/cotizador" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Cotizador
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Flujos de cotizacion</h1>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            Desde aca elegis el tipo de cotizacion con el que queres trabajar. Courier
            ya esta operativo; Despacho, China y Europa quedan preparados para la
            siguiente etapa.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quoteModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="text-sm text-[color:var(--muted)]">Submodulo</div>
              <div className="mt-2 text-2xl font-semibold">{module.label}</div>
              <p className="mt-3 min-h-16 text-sm text-[color:var(--muted)]">
                {module.description}
              </p>
              <div className="mt-4 text-sm font-medium text-[color:var(--brand)]">
                Abrir
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="text-sm text-[color:var(--muted)]">Cotizaciones guardadas</div>
            <div className="mt-2 text-4xl font-semibold">{quoteCount}</div>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="text-sm text-[color:var(--muted)]">Productos con tasas cargadas</div>
            <div className="mt-2 text-4xl font-semibold">{tariffCount}</div>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="text-sm text-[color:var(--muted)]">Tasas arancelarias</div>
            <div className="mt-2 text-xl font-semibold">Modulo aparte</div>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              El administrador puede editar tasas y el courier las toma desde la base
              actualizada.
            </p>
            <Link
              href="/cotizador/tasas-arancelarias"
              className="mt-4 inline-flex rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium"
            >
              Ir al modulo
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
