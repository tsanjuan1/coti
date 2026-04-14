import Link from "next/link";
import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";

export default async function ChinaQuotePage() {
  const user = await requireModuleAccess(ModuleKey.QUOTE);

  return (
    <AppShell currentPath="/cotizador/china" userLabel={user.fullName}>
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Cotizador
        </div>
        <h1 className="mt-2 text-3xl font-semibold">China</h1>
        <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
          El submodulo China todavia no esta desarrollado. Queda separado para que el
          flujo nuevo tenga su propia logica y no interfiera con Courier.
        </p>
        <Link
          href="/cotizador"
          className="mt-5 inline-flex rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium"
        >
          Volver al hub
        </Link>
      </section>
    </AppShell>
  );
}
