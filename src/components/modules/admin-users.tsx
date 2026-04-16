"use client";

import { useState, useTransition } from "react";
import { type AppRole, ModuleKey } from "@prisma/client";

import { MODULE_LABELS } from "@/lib/permissions";

const modules: ModuleKey[] = [
  "QUOTE",
  "BREAK_EVEN",
  "OPERATION_PROFIT",
  "MANUFACTURERS",
  "ADMIN"
];

const moduleDescriptions: Record<ModuleKey, string> = {
  QUOTE: "Cotizador compacto de importacion.",
  BREAK_EVEN: "Punto de equilibrio con costos fijos y variables.",
  OPERATION_PROFIT: "Resultado por operacion sin gastos de estructura.",
  MANUFACTURERS: "Catalogo interno de marcas, contactos y material operativo.",
  ADMIN: "Gestion de usuarios y accesos."
};

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

type PermissionState = Record<
  ModuleKey,
  {
    canAccess: boolean;
  }
>;

function createEmptyPermissionState(): PermissionState {
  return {
    QUOTE: { canAccess: false },
    BREAK_EVEN: { canAccess: false },
    OPERATION_PROFIT: { canAccess: false },
    MANUFACTURERS: { canAccess: false },
    ADMIN: { canAccess: false }
  };
}

function createAdminPermissionState(): PermissionState {
  return {
    QUOTE: { canAccess: true },
    BREAK_EVEN: { canAccess: true },
    OPERATION_PROFIT: { canAccess: true },
    MANUFACTURERS: { canAccess: true },
    ADMIN: { canAccess: true }
  };
}

function userPermissionsToState(
  role: AppRole,
  permissions: AdminUserRecord["permissions"]
): PermissionState {
  if (role === "ADMIN") {
    return createAdminPermissionState();
  }

  const state = createEmptyPermissionState();
  for (const permission of permissions) {
    state[permission.moduleKey] = {
      canAccess: permission.canAccess
    };
  }
  return state;
}

function permissionsStateToPayload(role: AppRole, permissions: PermissionState) {
  return modules.map((moduleKey) => {
    const canAccess = role === "ADMIN" ? true : permissions[moduleKey].canAccess;

    return {
      moduleKey,
      canAccess,
      canManage: role === "ADMIN"
    };
  });
}

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
    role: "SELLER" as AppRole,
    permissions: createEmptyPermissionState()
  });

  function updateCreateFormRole(role: AppRole) {
    setForm((current) => ({
      ...current,
      role,
      permissions: role === "ADMIN" ? createAdminPermissionState() : current.permissions
    }));
  }

  function validateCreateForm() {
    if (!form.fullName.trim()) {
      return "Ingresa un nombre para el usuario.";
    }
    if (!form.email.trim()) {
      return "Ingresa un email valido.";
    }
    if (form.password.trim().length < 8) {
      return "La password inicial debe tener al menos 8 caracteres.";
    }

    return null;
  }

  async function createUser() {
    const validationError = validateCreateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    startTransition(async () => {
      const payload = {
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        password: form.password.trim(),
        role: form.role,
        permissions: permissionsStateToPayload(form.role, form.permissions)
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
      setForm({
        email: "",
        fullName: "",
        password: "",
        role: "SELLER",
        permissions: createEmptyPermissionState()
      });
      setMessage("Usuario creado correctamente.");
    });
  }

  function patchUser(index: number, patch: Partial<AdminUserRecord>) {
    setUsers((current) => {
      const next = current.slice();
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function patchUserPermission(
    index: number,
    moduleKey: ModuleKey,
    canAccess: boolean
  ) {
    setUsers((current) => {
      const next = current.slice();
      const user = next[index];
      const existing = user.permissions.find((entry) => entry.moduleKey === moduleKey);

      next[index] = {
        ...user,
        permissions: existing
          ? user.permissions.map((entry) =>
              entry.moduleKey === moduleKey
                ? { ...entry, canAccess, canManage: user.role === "ADMIN" }
                : entry
            )
          : [
              ...user.permissions,
              { moduleKey, canAccess, canManage: user.role === "ADMIN" }
            ]
      };

      return next;
    });
  }

  async function updateUser(user: AdminUserRecord) {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email.trim().toLowerCase(),
          fullName: user.fullName.trim(),
          role: user.role,
          isActive: user.isActive,
          password: user.password?.trim() || "",
          permissions: permissionsStateToPayload(
            user.role,
            userPermissionsToState(user.role, user.permissions)
          )
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
      setMessage(`Permisos y datos actualizados para ${data.user.fullName}.`);
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Administracion
        </div>
        <h1 className="mt-2 text-3xl font-semibold">Usuarios y permisos</h1>
        <p className="mt-2 max-w-3xl text-sm text-[color:var(--muted)]">
          Cada usuario se administra en su propia ficha. Primero definis sus datos y
          despues elegis exactamente a que modulos puede entrar.
        </p>
        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Alta de usuario</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Defini los permisos iniciales antes de crearlo. Si elegis rol administrador,
            el acceso total se otorga automaticamente.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <input
            className="rounded-xl border border-[var(--line)] px-3 py-2"
            placeholder="Nombre"
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          />
          <input
            className="rounded-xl border border-[var(--line)] px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            className="rounded-xl border border-[var(--line)] px-3 py-2"
            placeholder="Password inicial"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <select
            className="rounded-xl border border-[var(--line)] px-3 py-2"
            value={form.role}
            onChange={(event) => updateCreateFormRole(event.target.value as AppRole)}
          >
            <option value="SELLER">SELLER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-slate-50 p-4">
          <div className="text-sm font-medium">Permisos iniciales</div>
          {form.role === "ADMIN" ? (
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Los administradores reciben acceso total a todos los modulos.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {modules.map((moduleKey) => (
                <label
                  key={moduleKey}
                  className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{MODULE_LABELS[moduleKey]}</div>
                    <div className="text-sm text-[color:var(--muted)]">
                      {moduleDescriptions[moduleKey]}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.permissions[moduleKey].canAccess}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        permissions: {
                          ...current.permissions,
                          [moduleKey]: { canAccess: event.target.checked }
                        }
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          disabled={isPending}
          onClick={createUser}
          className="mt-4 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white"
        >
          {isPending ? "Creando..." : "Crear usuario"}
        </button>
      </section>

      <section className="space-y-4">
        {users.map((user, index) => {
          const permissionState = userPermissionsToState(user.role, user.permissions);

          return (
            <div
              key={user.id}
              className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{user.fullName || "Usuario sin nombre"}</h2>
                  <p className="text-sm text-[color:var(--muted)]">{user.email}</p>
                </div>
                <div className="rounded-full border border-[var(--line)] px-3 py-1 text-sm">
                  {user.role === "ADMIN" ? "Administrador" : "Vendedor"}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <input
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
                  value={user.fullName}
                  onChange={(event) => patchUser(index, { fullName: event.target.value })}
                />
                <input
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
                  value={user.email}
                  onChange={(event) => patchUser(index, { email: event.target.value })}
                />
                <select
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
                  value={user.role}
                  onChange={(event) => {
                    const role = event.target.value as AppRole;
                    patchUser(index, {
                      role,
                      permissions: permissionsStateToPayload(
                        role,
                        role === "ADMIN" ? createAdminPermissionState() : permissionState
                      )
                    });
                  }}
                >
                  <option value="SELLER">SELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2">
                  <input
                    type="checkbox"
                    checked={user.isActive}
                    onChange={(event) => patchUser(index, { isActive: event.target.checked })}
                  />
                  <span>Usuario activo</span>
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <input
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
                  type="password"
                  placeholder="Reset password opcional"
                  value={user.password ?? ""}
                  onChange={(event) => patchUser(index, { password: event.target.value })}
                />
                {user.mustChangePassword ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    Debe cambiar password al ingresar.
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm text-[color:var(--muted)]">
                    Sin cambio obligatorio pendiente.
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-slate-50 p-4">
                <div className="text-sm font-medium">Permisos de {user.fullName || user.email}</div>
                {user.role === "ADMIN" ? (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    Este usuario es administrador, por lo tanto tiene acceso total a todos los
                    modulos.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {modules.map((moduleKey) => (
                      <label
                        key={moduleKey}
                        className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                      >
                        <div>
                          <div className="font-medium">{MODULE_LABELS[moduleKey]}</div>
                          <div className="text-sm text-[color:var(--muted)]">
                            {moduleDescriptions[moduleKey]}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permissionState[moduleKey].canAccess}
                          onChange={(event) =>
                            patchUserPermission(index, moduleKey, event.target.checked)
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={isPending}
                onClick={() => updateUser(user)}
                className="mt-4 rounded-2xl border border-[var(--line)] px-4 py-3"
              >
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
