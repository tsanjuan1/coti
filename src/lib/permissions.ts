import { ModuleKey } from "@prisma/client";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  ADMIN: "Administracion",
  BREAK_EVEN: "Punto de equilibrio",
  OPERATION_PROFIT: "Utilidad por operacion",
  QUOTE: "Cotizador"
};

export function hasModuleAccess(args: {
  role: "ADMIN" | "SELLER";
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
