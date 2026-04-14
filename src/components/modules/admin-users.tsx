"use client";

import { useState, useTransition } from "react";
import { ModuleKey, type AppRole } from "@prisma/client";

const modules: ModuleKey[] = ["QUOTE", "BREAK_EVEN", "OPERATION_PROFIT", "ADMIN"];

type AdminUserRecord = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  isActive: boolean;
  mustChangePassword?: boolean;
  password?: string;
  permissions: Array<{
    moduleKey: ModuleKey;
    canAccess: boolean;
    canManage: boolean;
  }>;
};

export function AdminUsers({
  initialUsers
}: {
  initialUsers: AdminUserRecord[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "SELLER" as AppRole
  });

  async function createUser() {
    startTransition(async () => {
      const payload = {
        ...form,
        permissions: modules.map((moduleKey) => ({
          moduleKey,
          canAccess: moduleKey !== "ADMIN",
          canManage: moduleKey === "ADMIN" && form.role === "ADMIN"
        }))
      };
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "No se pudo crear el usuario.");
        return;
      }
      setUsers((current) => [data.user, ...current]);
      setForm({ email: "", fullName: "", password: "", role: "SELLER" });
      setMessage("Usuario creado correctamente.");
    });
  }

  async function updateUser(user: AdminUserRecord) {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          password: user.password || undefined
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "No se pudo actualizar el usuario.");
        return;
      }
      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id ? { ...data.user, password: "" } : entry
        )
      );
      setMessage("Usuario actualizado.");
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Administracion
        </div>
        <h1 className="mt-2 text-3xl font-semibold">Usuarios y permisos</h1>
        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Alta de usuario</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <input className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Nombre" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <input className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Password inicial" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <select className="rounded-xl border border-[var(--line)] px-3 py-2" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as AppRole })}>
            <option value="SELLER">SELLER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <button disabled={isPending} onClick={createUser} className="mt-4 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white">
          Crear usuario
        </button>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          El password inicial se crea en Supabase Auth y el usuario quedara marcado para
          cambiarlo desde su perfil.
        </p>
      </section>

      <section className="space-y-4">
        {users.map((user, index) => (
          <div key={user.id} className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-5">
              <input className="rounded-xl border border-[var(--line)] px-3 py-2" value={user.fullName} onChange={(event) => {
                const next = users.slice();
                next[index] = { ...user, fullName: event.target.value };
                setUsers(next);
              }} />
              <input className="rounded-xl border border-[var(--line)] px-3 py-2" value={user.email} onChange={(event) => {
                const next = users.slice();
                next[index] = { ...user, email: event.target.value };
                setUsers(next);
              }} />
              <select className="rounded-xl border border-[var(--line)] px-3 py-2" value={user.role} onChange={(event) => {
                const next = users.slice();
                next[index] = { ...user, role: event.target.value as AppRole };
                setUsers(next);
              }}>
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <input
                className="rounded-xl border border-[var(--line)] px-3 py-2"
                type="password"
                placeholder="Reset password (opcional)"
                value={user.password ?? ""}
                onChange={(event) => {
                  const next = users.slice();
                  next[index] = { ...user, password: event.target.value };
                  setUsers(next);
                }}
              />
              <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2">
                <input type="checkbox" checked={user.isActive} onChange={(event) => {
                  const next = users.slice();
                  next[index] = { ...user, isActive: event.target.checked };
                  setUsers(next);
                }} />
                <span>Activo</span>
              </label>
            </div>

            {user.mustChangePassword ? (
              <div className="mt-3 text-sm text-amber-700">
                Este usuario tiene pendiente el cambio de password.
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {modules.map((moduleKey) => {
                const permission =
                  user.permissions.find((entry) => entry.moduleKey === moduleKey) ??
                  { moduleKey, canAccess: false, canManage: false };
                return (
                  <div key={moduleKey} className="rounded-2xl border border-[var(--line)] p-4">
                    <div className="font-medium">{moduleKey}</div>
                    <label className="mt-3 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={permission.canAccess} onChange={(event) => {
                        const next = users.slice();
                        next[index] = {
                          ...user,
                          permissions: user.permissions.some((entry) => entry.moduleKey === moduleKey)
                            ? user.permissions.map((entry) => entry.moduleKey === moduleKey ? { ...entry, canAccess: event.target.checked } : entry)
                            : [...user.permissions, { moduleKey, canAccess: event.target.checked, canManage: false }]
                        };
                        setUsers(next);
                      }} />
                      Acceso
                    </label>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={permission.canManage} onChange={(event) => {
                        const next = users.slice();
                        next[index] = {
                          ...user,
                          permissions: user.permissions.some((entry) => entry.moduleKey === moduleKey)
                            ? user.permissions.map((entry) => entry.moduleKey === moduleKey ? { ...entry, canManage: event.target.checked } : entry)
                            : [...user.permissions, { moduleKey, canAccess: false, canManage: event.target.checked }]
                        };
                        setUsers(next);
                      }} />
                      Gestion
                    </label>
                  </div>
                );
              })}
            </div>

            <button disabled={isPending} onClick={() => updateUser(user)} className="mt-4 rounded-2xl border border-[var(--line)] px-4 py-3">
              Guardar cambios
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
