import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "SELLER"]),
  permissions: z.array(z.object({
    moduleKey: z.enum(["QUOTE", "BREAK_EVEN", "OPERATION_PROFIT", "ADMIN"]),
    canAccess: z.boolean(),
    canManage: z.boolean()
  }))
});

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

  const user = await prisma.appUser.create({
    data: {
      authUserId: authResponse.data.user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      mustChangePassword: true,
      permissions: {
        createMany: { data: parsed.data.permissions }
      }
    },
    include: { permissions: true }
  });

  return NextResponse.json({ user });
}
