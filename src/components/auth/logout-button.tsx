"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-70"
      >
        <LogOut className="h-4 w-4" />
        {isPending ? "Saliendo..." : "Cerrar sesion"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
