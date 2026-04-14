import { AppShell } from "@/components/app-shell";
import { AdminUsers } from "@/components/modules/admin-users";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await requireAdmin();
  const users = await prisma.appUser.findMany({
    include: { permissions: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell currentPath="/admin" userLabel={user.fullName}>
      <AdminUsers initialUsers={users} />
    </AppShell>
  );
}
