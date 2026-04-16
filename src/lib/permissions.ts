import { ModuleKey, type AppRole } from "@prisma/client";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  ADMIN: "Administracion",
  BREAK_EVEN: "Punto de equilibrio",
  MANUFACTURERS: "Fabricantes",
  OPERATION_PROFIT: "Utilidad por operacion",
  QUOTE: "Cotizador",
  WHOLESALERS: "Mayoristas"
};

export const MODULE_ROUTES: Record<ModuleKey, string> = {
  ADMIN: "/admin",
  BREAK_EVEN: "/punto-equilibrio",
  MANUFACTURERS: "/fabricantes",
  OPERATION_PROFIT: "/resultado-operacion",
  QUOTE: "/cotizador",
  WHOLESALERS: "/mayoristas"
};

export function hasModuleAccess(args: {
  role: AppRole;
  permissions: Array<{ moduleKey: ModuleKey; canAccess: boolean }>;
  moduleKey: ModuleKey;
}) {
  if (args.role === "ADMIN") {
    return true;
  }

  return args.permissions.some(
    (permission) => permission.moduleKey === args.moduleKey && permission.canAccess
  );
}

export function getAllowedModuleKeys(args: {
  role: AppRole;
  permissions: Array<{ moduleKey: ModuleKey; canAccess: boolean }>;
}) {
  if (args.role === "ADMIN") {
    return Object.values(ModuleKey);
  }

  return Object.values(ModuleKey).filter((moduleKey) =>
    hasModuleAccess({
      role: args.role,
      permissions: args.permissions,
      moduleKey
    })
  );
}
