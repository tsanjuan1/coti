"use client";

import { useMemo, useState, useTransition } from "react";
import { KeyRound } from "lucide-react";

export function ChangePasswordForm({
  mustChangePassword
}: {
  mustChangePassword: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validationMessage = useMemo(() => {
    if (!password && !confirmPassword) {
      return null;
    }
    if (password.length < 8) {
      return "La nueva password debe tener al menos 8 caracteres.";
    }
    if (password !== confirmPassword) {
      return "Las passwords no coinciden.";
    }
    return null;
  }, [confirmPassword, password]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    startTransition(async () => {
      setMessage(null);

      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const payload = await response.json().catch(() => ({ error: "No se pudo actualizar la password." }));
      if (!response.ok) {
        setMessage(payload.error ?? "No se pudo actualizar la password.");
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage("Password actualizada correctamente.");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[color:var(--surface-alt)] p-3">
          <KeyRound className="h-5 w-5 text-[color:var(--brand)]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Cambio de password</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            La actualizacion se aplica sobre tu usuario autenticado en Supabase Auth.
          </p>
          {mustChangePassword ? (
            <p className="mt-2 text-sm text-amber-700">
              Este usuario fue marcado para cambio de password obligatorio.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nueva password</span>
          <input
            className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Confirmar password</span>
          <input
            className="w-full rounded-2xl border border-[var(--line)] px-4 py-3"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
      </div>

      {message ? (
        <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white disabled:opacity-70"
      >
        {isPending ? "Actualizando..." : "Actualizar password"}
      </button>
    </form>
  );
}
