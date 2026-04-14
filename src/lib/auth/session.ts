import { redirect } from "next/navigation";
import { ModuleKey } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentAuthUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user ?? null;
}

export async function getCurrentAppUser() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return null;
  }

  return prisma.appUser.findUnique({
    where: { authUserId: authUser.id },
    include: { permissions: true }
  });
}

export async function requireAppUser() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    redirect("/login");
  }

  if (!appUser.isActive) {
    redirect("/login?blocked=1");
  }

  return appUser;
}

export async function requireModuleAccess(moduleKey: ModuleKey) {
  const appUser = await requireAppUser();

  if (appUser.role === "ADMIN") {
    return appUser;
  }

  const permission = appUser.permissions.find((entry) => entry.moduleKey === moduleKey);
  if (!permission?.canAccess) {
    redirect("/dashboard?forbidden=1");
  }

  return appUser;
}

export async function requireAdmin() {
  const appUser = await requireAppUser();
  if (appUser.role !== "ADMIN") {
    redirect("/dashboard?forbidden=1");
  }
  return appUser;
}
