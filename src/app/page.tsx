import { redirect } from "next/navigation";

import { getCurrentAppUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentAppUser();
  redirect(user ? "/dashboard" : "/login");
}

