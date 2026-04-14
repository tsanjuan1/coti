import { PrismaClient, ModuleKey } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

import productRules from "../src/modules/cotizador/generated/product-rules.json";

const prisma = new PrismaClient();

async function upsertAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email || !password || !supabaseUrl || !serviceRole) {
    console.warn("Seed de admin omitido: faltan variables de entorno de Supabase/Auth.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const createdUser = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createdUser.error && !createdUser.error.message.toLowerCase().includes("already")) {
    throw createdUser.error;
  }

  const authUserId =
    createdUser.data.user?.id ??
    (
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200
      })
    ).data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id;

  if (!authUserId) {
    throw new Error("No se pudo resolver el usuario administrador de Supabase.");
  }

  const user = await prisma.appUser.upsert({
    where: { email },
    update: {
      authUserId,
      fullName: "Administrador principal",
      role: "ADMIN",
      isActive: true
    },
    create: {
      authUserId,
      email,
      fullName: "Administrador principal",
      role: "ADMIN",
      isActive: true
    }
  });

  await prisma.modulePermission.deleteMany({ where: { userId: user.id } });
  await prisma.modulePermission.createMany({
    data: Object.values(ModuleKey).map((moduleKey) => ({
      userId: user.id,
      moduleKey,
      canAccess: true,
      canManage: true
    }))
  });
}

async function main() {
  await prisma.quoteProductRule.createMany({
    data: productRules,
    skipDuplicates: true
  });

  await upsertAdminUser();
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
