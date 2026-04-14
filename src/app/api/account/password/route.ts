import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const user = await requireAppUser();
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const authResult = await supabase.auth.admin.updateUserById(user.authUserId, {
    password: parsed.data.password
  });

  if (authResult.error) {
    return NextResponse.json({ error: authResult.error.message }, { status: 400 });
  }

  await prisma.appUser.update({
    where: { id: user.id },
    data: { mustChangePassword: false }
  });

  return NextResponse.json({ ok: true });
}
