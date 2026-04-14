import Link from "next/link";
import { ModuleKey } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { requireModuleAccess } from "@/lib/auth/session";

export default async function DespachoQuotePage() {
  const user = await requireModuleAccess(ModuleKey.QUOTE);

  return (
    <AppShell currentPath="/cotizador/despacho" userLabel={user.fullName}>
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Cotizador
        </div>
        <h1 className="mt-2 text-3xl font-semibold">Despacho</h1>
        <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
          Este submodulo queda reservado para la siguiente etapa. La estructura ya esta
          creada para que despues podamos desarrollar su logica sin rehacer la
          navegacion del cotizador.
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
