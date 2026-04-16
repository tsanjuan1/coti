import Link from "next/link";
import { ModuleKey } from "@prisma/client";
import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  ShieldCheck,
  UserCircle2,
  Building2
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AppNavLink } from "@/components/navigation/app-nav-link";
import { RoutePrefetch } from "@/components/navigation/route-prefetch";
import { getCurrentAppUser } from "@/lib/auth/session";
import { hasModuleAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/cotizador", label: "Cotizador", icon: Calculator, moduleKey: ModuleKey.QUOTE },
  {
    href: "/punto-equilibrio",
    label: "Punto de equilibrio",
    icon: BarChart3,
    moduleKey: ModuleKey.BREAK_EVEN
  },
  {
    href: "/resultado-operacion",
    label: "Utilidad por operacion",
    icon: BarChart3,
    moduleKey: ModuleKey.OPERATION_PROFIT
  },
  {
    href: "/fabricantes",
    label: "Fabricantes",
    icon: Building2,
    moduleKey: ModuleKey.MANUFACTURERS
  },
  { href: "/admin", label: "Administracion", icon: ShieldCheck, moduleKey: ModuleKey.ADMIN },
  { href: "/perfil", label: "Perfil", icon: UserCircle2 }
];

export async function AppShell({
  children,
  currentPath,
  userLabel
}: {
  children: React.ReactNode;
  currentPath: string;
  userLabel: string;
}) {
  const currentUser = await getCurrentAppUser();
  const visibleNavItems = navItems.filter((item) => {
    if (!item.moduleKey || !currentUser) {
      return true;
    }

    return hasModuleAccess({
      role: currentUser.role,
      permissions: currentUser.permissions,
      moduleKey: item.moduleKey
    });
  });
  const warmedRoutes = [
    ...visibleNavItems.map((item) => item.href),
    ...(visibleNavItems.some((item) => item.moduleKey === ModuleKey.QUOTE)
      ? [
          "/cotizador/courier",
          "/cotizador/despacho",
          "/cotizador/china",
          "/cotizador/europa",
          "/cotizador/tasas-arancelarias"
        ]
      : [])
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
            {visibleNavItems.map((item) => {
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
              {visibleNavItems.map((item) => {
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
