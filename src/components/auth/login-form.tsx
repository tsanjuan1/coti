"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-[28px] border border-[var(--line)] bg-white p-8 shadow-lg shadow-slate-200/50"
    >
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Anyx Comercial
        </div>
        <h1 className="mt-3 text-3xl font-semibold">Ingreso privado</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Acceso a cotizador, punto de equilibrio, utilidad por operacion y administracion.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
      </div>

      {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

      <button
        type="submit"
        className="mt-6 w-full rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white transition hover:bg-[color:var(--brand-strong)] disabled:opacity-70"
        disabled={pending}
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

