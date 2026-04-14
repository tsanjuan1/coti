import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const moduleKeys = ["QUOTE", "BREAK_EVEN", "OPERATION_PROFIT", "ADMIN"] as const;

const schema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(1),
  role: z.enum(["ADMIN", "SELLER"]),
  isActive: z.boolean(),
  password: z.union([z.string().min(8), z.literal("")]).optional(),
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  await requireAdmin();
  const { userId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const current = await prisma.appUser.findUnique({ where: { id: userId } });
  if (!current) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const authUpdate = await supabase.auth.admin.updateUserById(current.authUserId, {
    email: parsed.data.email,
    ban_duration: parsed.data.isActive ? "none" : "876000h",
    password: parsed.data.password || undefined
  });

  if (authUpdate.error) {
    return NextResponse.json({ error: authUpdate.error.message }, { status: 400 });
  }

  const permissions = normalizePermissions(parsed.data.role, parsed.data.permissions);

  await prisma.$transaction([
    prisma.modulePermission.deleteMany({ where: { userId } }),
    prisma.appUser.update({
      where: { id: userId },
      data: {
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: parsed.data.role,
        isActive: parsed.data.isActive,
        mustChangePassword: parsed.data.password ? true : current.mustChangePassword,
        permissions: {
          createMany: { data: permissions }
        }
      }
    })
  ]);

  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    include: { permissions: true }
  });

  return NextResponse.json({ user });
}
