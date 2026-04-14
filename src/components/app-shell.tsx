import Link from "next/link";
import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  ShieldCheck,
  UserCircle2
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AppNavLink } from "@/components/navigation/app-nav-link";
import { RoutePrefetch } from "@/components/navigation/route-prefetch";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/cotizador", label: "Cotizador", icon: Calculator },
  { href: "/punto-equilibrio", label: "Punto de equilibrio", icon: BarChart3 },
  { href: "/resultado-operacion", label: "Utilidad por operacion", icon: BarChart3 },
  { href: "/admin", label: "Administracion", icon: ShieldCheck },
  { href: "/perfil", label: "Perfil", icon: UserCircle2 }
];

export function AppShell({
  children,
  currentPath,
  userLabel
}: {
  children: React.ReactNode;
  currentPath: string;
  userLabel: string;
}) {
  const warmedRoutes = [
    ...navItems.map((item) => item.href),
    "/cotizador/courier",
    "/cotizador/despacho",
    "/cotizador/china",
    "/cotizador/europa",
    "/cotizador/tasas-arancelarias"
  ];

  return (
    <div className="min-h-screen">
      <RoutePrefetch routes={warmedRoutes} />
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 md:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-[var(--line)] bg-[color:var(--surface)] p-5 shadow-sm lg:block">
          <div className="mb-8 rounded-[22px] bg-[color:var(--surface-alt)] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Anyx Comercial
            </div>
            <div className="mt-2 text-2xl font-semibold">Panel interno</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">{userLabel}</div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <AppNavLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active
                      ? "bg-[color:var(--brand)] text-white shadow-sm"
                      : "text-[color:var(--text)] hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </AppNavLink>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <section className="mb-6 rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Anyx Comercial
                </div>
                <div className="mt-2 text-2xl font-semibold">Panel interno privado</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">{userLabel}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/perfil"
                  className="rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium"
                >
                  Perfil y password
                </Link>
                <LogoutButton />
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                return (
                  <AppNavLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition",
                      active
                        ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                        : "border-[var(--line)] bg-[color:var(--surface-alt)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </AppNavLink>
                );
              })}
            </nav>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
