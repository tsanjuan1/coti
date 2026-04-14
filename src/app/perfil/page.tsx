import { AppShell } from "@/components/app-shell";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { requireAppUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireAppUser();

  return (
    <AppShell currentPath="/perfil" userLabel={user.fullName}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Perfil
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Cuenta y seguridad</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Gestiona tus datos de acceso y el estado interno de tu usuario.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--line)] bg-[color:var(--surface-alt)] p-4">
              <div className="text-sm text-[color:var(--muted)]">Nombre</div>
              <div className="mt-2 text-lg font-semibold">{user.fullName}</div>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-[color:var(--surface-alt)] p-4">
              <div className="text-sm text-[color:var(--muted)]">Email</div>
              <div className="mt-2 text-lg font-semibold">{user.email}</div>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-[color:var(--surface-alt)] p-4">
              <div className="text-sm text-[color:var(--muted)]">Rol</div>
              <div className="mt-2 text-lg font-semibold">{user.role}</div>
            </div>
          </div>
        </section>

        <ChangePasswordForm mustChangePassword={user.mustChangePassword} />
      </div>
    </AppShell>
  );
}
