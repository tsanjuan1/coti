import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import manufacturerCatalog from "@/modules/manufacturers/generated/catalog.json";
import { getAllowedModuleKeys, MODULE_LABELS, MODULE_ROUTES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireAppUser();
  const [quoteCount, breakEvenCount, operationCount] = await Promise.all([
    prisma.quoteScenario.count({ where: { createdById: user.id } }),
    prisma.breakEvenScenario.count({ where: { createdById: user.id } }),
    prisma.operationProfitScenario.count({ where: { createdById: user.id } })
  ]);

  const allowedModules = getAllowedModuleKeys({
    role: user.role,
    permissions: user.permissions
  }).map((moduleKey) => [moduleKey, MODULE_LABELS[moduleKey]] as const);

  return (
    <AppShell currentPath="/dashboard" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">Resumen</div>
          <h1 className="mt-2 text-3xl font-semibold">Sistema comercial privado</h1>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            Fuente de verdad basada en Excel, con motores desacoplados para cotizacion, punto
            de equilibrio y utilidad por operacion.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Cotizaciones", value: quoteCount },
            { label: "Escenarios de equilibrio", value: breakEvenCount },
            { label: "Operaciones guardadas", value: operationCount },
            {
              label: "Fabricantes indexados",
              value: manufacturerCatalog.source.totalManufacturers
            }
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <div className="text-sm text-[color:var(--muted)]">{card.label}</div>
              <div className="mt-2 text-4xl font-semibold">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Modulos habilitados</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {allowedModules.map(([moduleKey, label]) => {
              return (
                <Link
                  key={moduleKey}
                  href={MODULE_ROUTES[moduleKey]}
                  className="rounded-[22px] border border-[var(--line)] bg-[color:var(--surface-alt)] p-5 transition hover:-translate-y-0.5"
                >
                  <div className="text-sm text-[color:var(--muted)]">Modulo</div>
                  <div className="mt-2 text-xl font-semibold">{label}</div>
                  <div className="mt-4 text-sm text-[color:var(--brand)]">Abrir</div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
