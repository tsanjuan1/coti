import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const moduleKeys = [
  "QUOTE",
  "BREAK_EVEN",
  "OPERATION_PROFIT",
  "MANUFACTURERS",
  "WHOLESALERS",
  "ADMIN"
] as const;

const schema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(1),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "SELLER"]),
  permissions: z.array(z.object({
    moduleKey: z.enum(moduleKeys),
    canAccess: z.boolean(),
    canManage: z.boolean().optional()
  })).default([])
});

function normalizePermissions(
  role: "ADMIN" | "SELLER",
  permissions: Array<{
    moduleKey: (typeof moduleKeys)[number];
    canAccess: boolean;
    canManage?: boolean;
  }>
) {
  return moduleKeys.map((moduleKey) => {
    const permission = permissions.find((entry) => entry.moduleKey === moduleKey);
    const canAccess = role === "ADMIN" ? true : Boolean(permission?.canAccess);

    return {
      moduleKey,
      canAccess,
      canManage: role === "ADMIN"
    };
  });
}

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const authResponse = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true
  });

  if (authResponse.error || !authResponse.data.user) {
    return NextResponse.json({ error: authResponse.error?.message ?? "No se pudo crear el usuario en Auth." }, { status: 400 });
  }

  const permissions = normalizePermissions(parsed.data.role, parsed.data.permissions);

  const user = await prisma.appUser.create({
    data: {
      authUserId: authResponse.data.user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      mustChangePassword: true,
      permissions: {
        createMany: { data: permissions }
      }
    },
    include: { permissions: true }
  });

  return NextResponse.json({ user });
}
